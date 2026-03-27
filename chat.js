(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Chat = {
    chatHistory: [],
    visionImageData: null,
    useStream: true,
    assistantRollMap: {},

    SYSTEM_PROMPT:
      '你是网页内置开发助手，已经运行在当前网页里。\n' +
      '不要索要代码，不要说无法访问文件。\n' +
      '你只能修改用户消息里明确发送给你的文件。\n' +
      '绝对禁止返回未被发送文件对应的 source 代码块。\n' +
      '如果只发送了 html 和 css，你绝不能返回 source-js。\n' +
      '如果只发送了 js，你绝不能返回 source-html 或 source-css。\n' +
      '如果用户是在美化，优先修改 css；如果是结构，优先修改 html；如果是逻辑，优先修改 js。\n' +
      '不要伪造功能，不要额外创建假按钮。',

    buildUserContent: function(text) {
      if (Chat.visionImageData) {
        return [
          { type: 'text', text: text },
          { type: 'image_url', image_url: { url: Chat.visionImageData } }
        ];
      }
      return text;
    },

    clearVisionImage: function() {
      Chat.visionImageData = null;
      if (App.$('#imagePreviewBox')) App.$('#imagePreviewBox').classList.add('hidden');
      if (App.$('#imagePreviewImg')) App.$('#imagePreviewImg').src = '';
      if (App.$('#visionImageInput')) App.$('#visionImageInput').value = '';
    },

    attachMsgTools: function(wrap, role, rawContent, meta) {
      if (!wrap || role !== 'assistant') return;

      var tools = document.createElement('div');
      tools.className = 'msg-tools';

      var copyBtn = document.createElement('button');
      copyBtn.className = 'msg-tool-btn';
      copyBtn.type = 'button';
      copyBtn.textContent = '复制';

      var rerollBtn = document.createElement('button');
      rerollBtn.className = 'msg-tool-btn';
      rerollBtn.type = 'button';
      rerollBtn.textContent = '重试';

      var indicator = document.createElement('span');
      indicator.className = 'msg-roll-indicator';
      indicator.textContent = meta && meta.rollIndex && meta.rollCount
        ? (meta.rollIndex + '/' + meta.rollCount)
        : '1/1';

      tools.appendChild(copyBtn);
      tools.appendChild(rerollBtn);
      tools.appendChild(indicator);

      wrap.appendChild(tools);

      copyBtn.addEventListener('click', function() {
        App.copyText(rawContent || '').then(function() {
          App.showToast('已复制消息');
        }).catch(function() {
          App.showToast('复制失败');
        });
      });

      rerollBtn.addEventListener('click', function() {
        if (!meta || !meta.userText) {
          App.showToast('缺少可重试内容');
          return;
        }

        if (App.$('#chatInput')) App.$('#chatInput').value = meta.userText;
        Chat.sendNormalChatMessage(meta.userText, meta.rollGroupId);
      });
    },

    addChatMsg: function(role, content, meta) {
      if (!App.state.chatMessages) return null;

      var wrap = document.createElement('div');
      wrap.className = 'chat-msg-wrap ' + role;

      var div = document.createElement('div');
      div.className = 'chat-msg ' + role;
      div.innerHTML = App.esc(content).replace(/\n/g, '<br>');
      wrap.appendChild(div);

      App.state.chatMessages.appendChild(wrap);
      App.state.chatMessages.scrollTop = App.state.chatMessages.scrollHeight;

      if (role === 'assistant') {
        Chat.attachMsgTools(wrap, role, content, meta);
      }

      return div;
    },

    restoreChatHistory: function() {
      if (!App.state.chatMessages) return;
      if (!Chat.chatHistory.length) {
        App.state.chatMessages.innerHTML = '<div class="chat-msg system">已就绪。</div>';
        return;
      }

      for (var i = 0; i < Chat.chatHistory.length; i++) {
        var item = Chat.chatHistory[i];
        Chat.addChatMsg(
          item.role === 'assistant' ? 'assistant' : item.role === 'user' ? 'user' : 'system',
          item.displayContent || item.content || '',
          item.meta || null
        );
      }
    },

    saveChatHistory: function() {
      App.LS.set('chatHistory', Chat.chatHistory.slice(-50));
    },

    async sendChatRequest(userText, opts) {
      opts = opts || {};
      if (!App.api || !App.api.activeApi) {
        App.showToast('请先配置并选择 API');
        return;
      }

      var replyDiv = opts.replyDiv || null;
      var wrappedText = userText + (App.source ? App.source.buildSelectedSourcePrompt() : '');

      var messages = [
        { role: 'system', content: Chat.SYSTEM_PROMPT }
      ].concat(Chat.chatHistory.slice(-20).map(function(item) {
        return {
          role: item.role,
          content: item.content
        };
      })).concat([
        { role: 'user', content: Chat.buildUserContent(wrappedText) }
      ]);

      var base = App.api.activeApi.url.replace(/\/+$/, '');
      App.state.currentAbortController = new AbortController();

      async function handleNormalResponse() {
        var response = await fetch(base + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + App.api.activeApi.key
          },
          body: JSON.stringify({
            model: App.api.activeApi.model,
            messages: messages
          }),
          signal: App.state.currentAbortController.signal
        });

        if (!response.ok) {
          var errData = await response.json().catch(function() { return {}; });
          throw new Error((errData.error && errData.error.message) || ('请求失败: ' + response.status));
        }

        var data = await response.json();
        return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '(无回复)';
      }

      async function handleStreamResponse(onChunk) {
        var response = await fetch(base + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + App.api.activeApi.key
          },
          body: JSON.stringify({
            model: App.api.activeApi.model,
            messages: messages,
            stream: true
          }),
          signal: App.state.currentAbortController.signal
        });

        if (!response.ok) {
          var errData = await response.json().catch(function() { return {}; });
          throw new Error((errData.error && errData.error.message) || ('请求失败: ' + response.status));
        }

        if (!response.body) {
          throw new Error('当前接口不支持流式输出');
        }

        var reader = response.body.getReader();
        var decoder = new TextDecoder('utf-8');
        var buffer = '';
        var fullReply = '';

        while (true) {
          var result = await reader.read();
          if (result.done) break;

          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\n');
          buffer = lines.pop();

          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line.startsWith('data:')) continue;

            var dataStr = line.slice(5).trim();
            if (dataStr === '[DONE]') continue;

            try {
              var data = JSON.parse(dataStr);
              var delta = data.choices && data.choices[0] && data.choices[0].delta ? data.choices[0].delta : {};
              var content = delta.content || '';
              if (content) {
                fullReply += content;
                if (onChunk) onChunk(fullReply);
              }
            } catch (e) {}
          }
        }

        if (!fullReply.trim()) fullReply = '(无回复)';
        return fullReply;
      }

      try {
        var fullReply = '';

        if (Chat.useStream) {
          try {
            fullReply = await handleStreamResponse(function(tempReply) {
              if (replyDiv) {
                var displayTemp = App.source ? App.source.cleanReplyForDisplay(tempReply) : tempReply;
                replyDiv.innerHTML = App.esc(displayTemp).replace(/\n/g, '<br>');
              }
            });
          } catch (streamErr) {
            if (streamErr.name === 'AbortError') {
              App.state.currentAbortController = null;
              throw streamErr;
            }
            App.showToast('流式失败，自动切换普通模式');
            fullReply = await handleNormalResponse();
          }
        } else {
          fullReply = await handleNormalResponse();
        }

        App.state.currentAbortController = null;
        return fullReply;
      } catch (err) {
        App.state.currentAbortController = null;
        throw err;
      }
    },

    async sendNormalChatMessage(forceText, existingRollGroupId) {
      if (!App.api || !App.api.activeApi) {
        App.showToast('请先配置并选择 API');
        return;
      }

      var text = typeof forceText === 'string' ? forceText : (App.state.chatInput ? App.state.chatInput.value.trim() : '');
      if (!text && !Chat.visionImageData) return;

      var displayText = text || '[发送了一张图片]';
      if (typeof forceText !== 'string' && App.state.chatInput) App.state.chatInput.value = '';

      Chat.addChatMsg('user', displayText + (Chat.visionImageData ? '\n[附带图片]' : ''));

      Chat.chatHistory.push({
        role: 'user',
        content: Chat.buildUserContent(displayText),
        displayContent: displayText + (Chat.visionImageData ? '\n[附带图片]' : '')
      });
      Chat.saveChatHistory();

      var rollGroupId = existingRollGroupId || ('chat-roll-' + Date.now());
      if (!Chat.assistantRollMap[rollGroupId]) Chat.assistantRollMap[rollGroupId] = [];
      var rollIndex = Chat.assistantRollMap[rollGroupId].length + 1;

      var meta = {
        userText: displayText,
        rollGroupId: rollGroupId,
        rollIndex: rollIndex,
        rollCount: rollIndex
      };

      var replyDiv = Chat.addChatMsg('assistant', '思考中...', meta);

      try {
        var fullReply = await Chat.sendChatRequest(displayText, {
          replyDiv: replyDiv
        });

        var displayReply = App.source ? App.source.cleanReplyForDisplay(fullReply) : fullReply;
        if (App.source) App.source.applyReplyToDraft(fullReply);

        Chat.assistantRollMap[rollGroupId].push(fullReply);
        meta.rollCount = Chat.assistantRollMap[rollGroupId].length;

        if (replyDiv) {
          replyDiv.innerHTML = App.esc(displayReply).replace(/\n/g, '<br>');
        }

        var allWraps = App.state.chatMessages.querySelectorAll('.chat-msg-wrap.assistant');
        var lastWrap = allWraps[allWraps.length - 1];
        if (lastWrap) {
          var oldTools = lastWrap.querySelector('.msg-tools');
          if (oldTools) oldTools.remove();
          Chat.attachMsgTools(lastWrap, 'assistant', fullReply, meta);
        }

        Chat.chatHistory.push({
          role: 'assistant',
          content: fullReply,
          displayContent: displayReply,
          meta: meta
        });
        Chat.saveChatHistory();
        Chat.clearVisionImage();
      } catch (err) {
        if (err.name === 'AbortError') {
          App.showToast('已停止');
          return;
        }
        if (replyDiv) {
          replyDiv.innerHTML = '请求失败: ' + App.esc(err.message);
        }
      }
    },

    bindEvents: function() {
      App.safeOn('#pickVisionImage', 'click', function() {
        if (App.$('#visionImageInput')) App.$('#visionImageInput').click();
      });

      App.safeOn('#visionImageInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          Chat.visionImageData = ev.target.result;
          if (App.$('#imagePreviewImg')) App.$('#imagePreviewImg').src = Chat.visionImageData;
          if (App.$('#imagePreviewBox')) App.$('#imagePreviewBox').classList.remove('hidden');
          App.showToast('图片已添加');
        };
        reader.readAsDataURL(file);
      });

      App.safeOn('#removeVisionImage', 'click', Chat.clearVisionImage);

      App.safeOn('#sendBtn', 'click', function() {
        Chat.sendNormalChatMessage();
      });

      App.safeOn('#chatInput', 'keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          Chat.sendNormalChatMessage();
        }
      });

      App.safeOn('#stopChatBtn', 'click', function() {
        if (App.state.currentAbortController) {
          App.state.currentAbortController.abort();
          App.state.currentAbortController = null;
          App.showToast('已停止');
        } else {
          App.showToast('当前没有进行中的请求');
        }
      });

      App.safeOn('#clearChatBtn', 'click', function() {
        Chat.chatHistory = [];
        Chat.assistantRollMap = {};
        App.LS.remove('chatHistory');
        if (App.state.chatMessages) {
          App.state.chatMessages.innerHTML = '<div class="chat-msg system">已清空。</div>';
        }
        App.showToast('已清空对话');
      });

      if (App.$('#useStreamToggle')) {
        App.$('#useStreamToggle').checked = !!Chat.useStream;
        App.$('#useStreamToggle').addEventListener('change', function() {
          Chat.useStream = this.checked;
          App.LS.set('useStream', Chat.useStream);
          App.showToast(Chat.useStream ? '已开启流式输出' : '已关闭流式输出');
        });
      }
    },

    init: function() {
      Chat.chatHistory = App.LS.get('chatHistory') || [];
      Chat.useStream = App.LS.get('useStream');
      if (Chat.useStream === null) Chat.useStream = true;

      App.chat = Chat;
      Chat.restoreChatHistory();
      Chat.bindEvents();
    }
  };

  App.register('chat', Chat);
})();
