(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Chat = {
    chatHistory: [],
    visionImageData: null,
    useStream: true,
    assistantRollMap: {},
    collapseThreshold: 220,

    SYSTEM_PROMPT:
      '你是网页内置开发助手，已经运行在当前网页里。\n' +
      '不要索要代码，不要说无法访问文件。\n' +
      '你只能修改用户消息里明确发送给你的文件。\n' +
      '绝对禁止返回未被发送文件对应的 source 代码块。\n' +
      '如果只发送了 html 和 css，你绝不能返回 source-js。\n' +
      '如果只发送了 js，你绝不能返回 source-html 或 source-css。\n' +
      '如果用户是在美化，优先修改 css；如果是结构，优先修改 html；如果是逻辑，优先修改 js。\n' +
      '不要伪造功能，不要额外创建假按钮。\n' +
      '返回修改后的完整文件内容，使用对应的 source 代码块格式。',

    estimateTokens: function(text) {
      if (!text) return 0;
      var cjk = 0;
      var other = 0;
      for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        if (
          (code >= 0x4E00 && code <= 0x9FFF) ||
          (code >= 0x3400 && code <= 0x4DBF) ||
          (code >= 0x3000 && code <= 0x303F) ||
          (code >= 0xFF00 && code <= 0xFFEF)
        ) {
          cjk++;
        } else {
          other++;
        }
      }
      return Math.round(cjk * 1.0 + other * 0.3);
    },

    formatNum: function(n) {
      if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return String(n);
    },

    createStatsEl: function(wrap) {
      var el = document.createElement('div');
      el.className = 'msg-stream-stats streaming';
      el.textContent = '等待响应...';
      wrap.appendChild(el);
      return el;
    },

    updateStreamStats: function(statsEl, fullReply, startTime) {
      if (!statsEl) return;
      var now = Date.now();
      var elapsed = (now - startTime) / 1000;
      var chars = fullReply.length;
      var tokens = Chat.estimateTokens(fullReply);
      var speed = elapsed > 0.5 ? Math.round(tokens / elapsed) : '--';

      statsEl.textContent =
        '\u21BB ' +
        Chat.formatNum(chars) + '\u5B57 \u00B7 ' +
        '~' + Chat.formatNum(tokens) + 'tk \u00B7 ' +
        speed + 'tk/s \u00B7 ' +
        elapsed.toFixed(1) + 's';
    },

    finalizeStreamStats: function(statsEl, fullReply, startTime) {
      if (!statsEl) return;
      var elapsed = (Date.now() - startTime) / 1000;
      var chars = fullReply.length;
      var tokens = Chat.estimateTokens(fullReply);
      var speed = elapsed > 0 ? Math.round(tokens / elapsed) : 0;

      statsEl.className = 'msg-stream-stats done';
      statsEl.textContent =
        Chat.formatNum(chars) + '\u5B57 \u00B7 ' +
        '~' + Chat.formatNum(tokens) + 'tk \u00B7 ' +
        speed + 'tk/s \u00B7 ' +
        elapsed.toFixed(1) + 's';
    },

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

    clearConversation: function() {
      Chat.chatHistory = [];
      Chat.assistantRollMap = {};
      App.LS.remove('chatHistory');

      if (App.state.chatMessages) {
        App.state.chatMessages.innerHTML = '<div class="chat-msg system">\u5DF2\u6E05\u7A7A\u3002</div>';
      }

      Chat.clearVisionImage();
      App.showToast('\u5DF2\u6E05\u7A7A\u5BF9\u8BDD');
    },

    ensureExpandableMessage: function(wrap, msgEl, content) {
      if (!wrap || !msgEl) return;
      if (!msgEl.classList.contains('assistant')) return;

      var oldBtn = wrap.querySelector('.msg-expand-btn');
      if (oldBtn) oldBtn.remove();

      msgEl.classList.remove('is-collapsible');
      msgEl.classList.remove('expanded');

      var plainText = (content || '').replace(/\s+/g, '');
      var shouldCollapse = plainText.length >= Chat.collapseThreshold;

      if (!shouldCollapse) return;

      msgEl.classList.add('is-collapsible');

      var expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'msg-expand-btn';
      expandBtn.textContent = '展开查看';

      function syncBtnText() {
        expandBtn.textContent = msgEl.classList.contains('expanded') ? '收起' : '展开查看';
      }

      function toggleExpand(e) {
        if (e) e.stopPropagation();
        msgEl.classList.toggle('expanded');
        syncBtnText();
      }

      expandBtn.addEventListener('click', toggleExpand);
      msgEl.addEventListener('click', function(e) {
        var target = e.target;
        if (target && target.closest && target.closest('.msg-tools')) return;
        if (target && target.closest && target.closest('.msg-expand-btn')) return;
        toggleExpand(e);
      });

      var tools = wrap.querySelector('.msg-tools');
      if (tools) {
        wrap.insertBefore(expandBtn, tools);
      } else {
        wrap.appendChild(expandBtn);
      }

      syncBtnText();
    },

    attachMsgTools: function(wrap, role, rawContent, meta) {
      if (!wrap || role !== 'assistant') return;

      var tools = document.createElement('div');
      tools.className = 'msg-tools';

      var copyBtn = document.createElement('button');
      copyBtn.className = 'msg-tool-btn';
      copyBtn.type = 'button';
      copyBtn.textContent = '\u590D\u5236';

      var rerollBtn = document.createElement('button');
      rerollBtn.className = 'msg-tool-btn';
      rerollBtn.type = 'button';
      rerollBtn.textContent = '\u91CD\u8BD5';

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
          App.showToast('\u5DF2\u590D\u5236\u6D88\u606F');
        }).catch(function() {
          App.showToast('\u590D\u5236\u5931\u8D25');
        });
      });

      rerollBtn.addEventListener('click', function() {
        if (!meta || !meta.userText) {
          App.showToast('\u7F3A\u5C11\u53EF\u91CD\u8BD5\u5185\u5BB9');
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
        Chat.ensureExpandableMessage(wrap, div, content);
      }

      return div;
    },

    restoreChatHistory: function() {
      if (!App.state.chatMessages) return;
      if (!Chat.chatHistory.length) {
        App.state.chatMessages.innerHTML = '<div class="chat-msg system">\u5DF2\u5C31\u7EEA\u3002</div>';
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

    sendChatRequest: async function(userText, opts) {
      opts = opts || {};
      if (!App.api || !App.api.activeApi) {
        App.showToast('\u8BF7\u5148\u914D\u7F6E\u5E76\u9009\u62E9 API');
        return;
      }

      var replyDiv = opts.replyDiv || null;
      var statsEl = opts.statsEl || null;
      var startTime = opts.startTime || Date.now();
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
          throw new Error((errData.error && errData.error.message) || ('\u8BF7\u6C42\u5931\u8D25: ' + response.status));
        }

        var data = await response.json();
        return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '(\u65E0\u56DE\u590D)';
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
          throw new Error((errData.error && errData.error.message) || ('\u8BF7\u6C42\u5931\u8D25: ' + response.status));
        }

        if (!response.body) {
          throw new Error('\u5F53\u524D\u63A5\u53E3\u4E0D\u652F\u6301\u6D41\u5F0F\u8F93\u51FA');
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

        if (!fullReply.trim()) fullReply = '(\u65E0\u56DE\u590D)';
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

                var wrap = replyDiv.parentNode;
                if (wrap) {
                  Chat.ensureExpandableMessage(wrap, replyDiv, displayTemp);
                }
              }
              Chat.updateStreamStats(statsEl, tempReply, startTime);

              if (App.state.chatMessages) {
                App.state.chatMessages.scrollTop = App.state.chatMessages.scrollHeight;
              }
            });
          } catch (streamErr) {
            if (streamErr.name === 'AbortError') {
              App.state.currentAbortController = null;
              throw streamErr;
            }
            App.showToast('\u6D41\u5F0F\u5931\u8D25\uFF0C\u81EA\u52A8\u5207\u6362\u666E\u901A\u6A21\u5F0F');
            fullReply = await handleNormalResponse();
          }
        } else {
          if (statsEl) statsEl.textContent = '\u8BF7\u6C42\u4E2D\uFF08\u975E\u6D41\u5F0F\uFF09...';
          fullReply = await handleNormalResponse();
        }

        App.state.currentAbortController = null;
        return fullReply;
      } catch (err) {
        App.state.currentAbortController = null;
        throw err;
      }
    },

    sendNormalChatMessage: async function(forceText, existingRollGroupId) {
      if (!App.api || !App.api.activeApi) {
        App.showToast('\u8BF7\u5148\u914D\u7F6E\u5E76\u9009\u62E9 API');
        return;
      }

      var text = typeof forceText === 'string' ? forceText : (App.state.chatInput ? App.state.chatInput.value.trim() : '');
      if (!text && !Chat.visionImageData) return;

      var displayText = text || '[\u53D1\u9001\u4E86\u4E00\u5F20\u56FE\u7247]';
      if (typeof forceText !== 'string' && App.state.chatInput) App.state.chatInput.value = '';

      Chat.addChatMsg('user', displayText + (Chat.visionImageData ? '\n[\u9644\u5E26\u56FE\u7247]' : ''));

      Chat.chatHistory.push({
        role: 'user',
        content: Chat.buildUserContent(displayText),
        displayContent: displayText + (Chat.visionImageData ? '\n[\u9644\u5E26\u56FE\u7247]' : '')
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

      var replyDiv = Chat.addChatMsg('assistant', '\u601D\u8003\u4E2D...', meta);

      var allWraps = App.state.chatMessages.querySelectorAll('.chat-msg-wrap.assistant');
      var currentWrap = allWraps[allWraps.length - 1];
      var statsEl = null;
      var startTime = Date.now();

      if (currentWrap) {
        statsEl = Chat.createStatsEl(currentWrap);
        var existingTools = currentWrap.querySelector('.msg-tools');
        if (existingTools) {
          currentWrap.insertBefore(statsEl, existingTools);
        }
      }

      try {
        var fullReply = await Chat.sendChatRequest(displayText, {
          replyDiv: replyDiv,
          statsEl: statsEl,
          startTime: startTime
        });

        // 核心改动：AI 返回后直接替换源码仓 + 即时生效
        if (App.source) {
          App.source.applyReplyToLive(fullReply);
        }

        var displayReply = App.source ? App.source.cleanReplyForDisplay(fullReply) : fullReply;

        Chat.assistantRollMap[rollGroupId].push(fullReply);
        meta.rollCount = Chat.assistantRollMap[rollGroupId].length;

        if (replyDiv) {
          replyDiv.innerHTML = App.esc(displayReply).replace(/\n/g, '<br>');
        }

        Chat.finalizeStreamStats(statsEl, fullReply, startTime);

        if (currentWrap) {
          var oldTools = currentWrap.querySelector('.msg-tools');
          if (oldTools) oldTools.remove();
          Chat.attachMsgTools(currentWrap, 'assistant', fullReply, meta);
          Chat.ensureExpandableMessage(currentWrap, replyDiv, displayReply);
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
          if (statsEl) {
            var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            var currentText = replyDiv ? replyDiv.textContent : '';
            var abortTokens = Chat.estimateTokens(currentText);
            statsEl.className = 'msg-stream-stats done';
            statsEl.textContent =
              '\u5DF2\u505C\u6B62 \u00B7 ' +
              Chat.formatNum(currentText.length) + '\u5B57 \u00B7 ' +
              '~' + Chat.formatNum(abortTokens) + 'tk \u00B7 ' +
              elapsed + 's';
          }
          App.showToast('\u5DF2\u505C\u6B62');
          return;
        }
        if (replyDiv) {
          replyDiv.innerHTML = '\u8BF7\u6C42\u5931\u8D25: ' + App.esc(err.message);
        }
        if (statsEl) {
          statsEl.className = 'msg-stream-stats done';
          statsEl.textContent = '\u8BF7\u6C42\u5931\u8D25';
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
          App.showToast('\u56FE\u7247\u5DF2\u6DFB\u52A0');
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
        } else {
          App.showToast('\u5F53\u524D\u6CA1\u6709\u8FDB\u884C\u4E2D\u7684\u8BF7\u6C42');
        }
      });

      App.safeOn('#clearChatBtn', 'click', function() {
        Chat.clearConversation();
      });

      App.safeOn('#clearAllBtn', 'click', function() {
        if (!confirm('\u786E\u5B9A\u8981\u91CD\u7F6E\u6240\u6709\u8BBE\u7F6E\u5417\uFF1F')) return;
        localStorage.clear();
        location.reload();
      });

      if (App.$('#useStreamToggle')) {
        App.$('#useStreamToggle').checked = !!Chat.useStream;
        App.$('#useStreamToggle').addEventListener('change', function() {
          Chat.useStream = this.checked;
          App.LS.set('useStream', Chat.useStream);
          App.showToast(Chat.useStream ? '\u5DF2\u5F00\u542F\u6D41\u5F0F\u8F93\u51FA' : '\u5DF2\u5173\u95ED\u6D41\u5F0F\u8F93\u51FA');
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
