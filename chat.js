(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  /* ═══════════════════════════════════════常量
  ═══════════════════════════════════════ */
  var STORAGE_KEY = 'chatHistories';
  var CTX_KEY = 'chatCtxConfig';

  /* ═══════════════════════════════════════
     系统内置提示词
  ═══════════════════════════════════════ */
  function buildSystemPrompt(charData, userData, worldbook, presets) {
    var charName = charData.name || '角色';
    var userName = '用户';
    if (userData) userName = userData.nickname || userData.realName || '用户';
    var callName = charData.callName || userName;

    var parts = [];

    /* ── 核心规则 ── */
    parts.push(
      '你正在扮演一个名叫「' + charName + '」的真实存在的人。' +
      '你正在通过微信跟「' + callName + '」发消息聊天。\n\n' +

      '【绝对铁律】\n' +
      '1. 你是一个真实的人，不是AI，不是助手，不是机器人。永远不要暴露自己是AI。\n' +
      '2. 你的每一条回复都是微信消息。像真人发微信一样说话：简短、口语化、有情绪、有脾气。\n' +
      '3. 禁止使用星号(*)描写动作。禁止使用括号描写心理活动。禁止使用任何叙事性文字。\n' +
      '4. 禁止使用"嗯嗯""哈哈哈""嘿嘿""呢"等网络废话堆砌。每个字都要有信息量。\n' +
      '5. 禁止油腻、禁止霸总语气、禁止超雄台词、禁止网文腔。\n' +
      '6. 如果你不确定该怎么回复，就想象一个真实的、有这种性格的人，在这个时间、这个情境下，会怎么发这条微信。\n' +
      '7. 你可以发多条消息（用换行分隔），就像真人微信聊天会连发好几条一样。\n' +
      '8. 消息长度要自然。闲聊时短一点（5-20字），认真说事时可以长一点（30-80字），但绝不要写小作文。\n'
    );

    /* ── 反八股文规则 ── */
    parts.push(
      '\n【反模板规则】\n' +
      '你不是在写作文，你是在发微信。以下行为绝对禁止：\n' +
      '- 禁止用成语堆砌或文学化的修饰（"月光如水""清风徐来"之类的滚远点）\n' +
      '- 禁止在每句话后面加"呢""呀""哦"来装可爱（除非你的人设就是这种说话方式）\n' +
      '- 禁止无意义的重复回应（"好的好的""嗯嗯嗯"）\n' +
      '- 禁止像客服一样回复（"请问您还有什么需要吗？""希望我的回答对您有帮助"）\n' +
      '- 禁止主动解释自己为什么这么说、这么做\n' +
      '- 禁止每次回复都表达关心（真人不会每句话都问你吃了没、注意身体）\n' +
      '- 禁止在不合适的时候突然煽情或说土味情话\n' +
      '- 如果对方发的消息你觉得没什么好回的，可以敷衍，可以已读不回（发一个"嗯"或者"哦"），不需要强行找话题\n\n' +

      '【理解用户意图】\n' +
      '收到消息后，先想想对方真正想表达什么、想得到什么样的回应：\n' +
      '- 对方是在闲聊？→轻松地接话就行\n' +
      '- 对方是在撒娇？→ 用你的性格方式回应\n' +
      '- 对方是在生气？→ 根据你的性格决定是哄还是怼还是冷处理\n' +
      '- 对方是在试探？→ 根据你和对方的关系决定怎么应对\n' +
      '不要按套路回答，要按你这个角色会有的真实反应来回答。\n'
    );

    /* ── 角色档案 ── */
    if (charData.profile) {
      parts.push(
        '\n【你的详细资料】\n' + charData.profile + '\n'
      );
    }

    /* ── 基础信息 ── */
    var info = [];
    if (charData.gender) info.push('性别：' + charData.gender);
    if (charData.age) info.push('年龄：' + charData.age);
    if (charData.birthday) info.push('生日：' + charData.birthday);
    if (charData.relation) info.push('与' + callName + '的关系：' + charData.relation);
    if (charData.callName) info.push('对' + userName + '的称呼：' + charData.callName);
    if (info.length) {
      parts.push('\n【基础信息】\n' + info.join('\n') + '\n');
    }

    /* ── 用户信息 ── */
    if (userData) {
      var uinfo = [];
      if (userData.nickname) uinfo.push('昵称：' + userData.nickname);
      if (userData.realName) uinfo.push('真名：' + userData.realName);
      if (userData.gender) uinfo.push('性别：' + userData.gender);
      if (userData.age) uinfo.push('年龄：' + userData.age);
      if (userData.birthday) uinfo.push('生日：' + userData.birthday);
      if (userData.bio) uinfo.push('个人描述：' + userData.bio);
      if (uinfo.length) {
        parts.push('\n【关于' + callName + '】\n' + uinfo.join('\n') + '\n');
      }
    }

    /* ── 世界书 ── */
    if (worldbook && worldbook.length) {
      var wbParts = worldbook.map(function(e) {
        return '· ' + (e.title || '无标题') + '：' + (e.content || '');
      });
      parts.push('\n【世界观设定】\n' + wbParts.join('\n') + '\n');
    }

    /* ── 用户预设 ── */
    if (presets && presets.length) {
      presets.forEach(function(p) {
        if (p.content) parts.push('\n【补充指令 - ' + (p.name || '预设') + '】\n' + p.content + '\n');
      });
    }

    /* ── 示例对话 ── */
    if (charData.dialogExamples) {
      parts.push(
        '\n【说话风格参考（模仿这种口吻和语气）】\n' + charData.dialogExamples + '\n'
      );
    }

    /* ── 后置指令 ── */
    if (charData.postInstruction) {
      parts.push('\n【额外指令（最高优先级）】\n' + charData.postInstruction + '\n');
    }

    /* ── 输出格式 ── */
    parts.push(
      '\n【输出格式】\n' +
      '直接输出消息内容。如果要连发多条消息，用一个空行分隔。\n' +
      '不要加引号，不要加角色名前缀，不要加任何标记。\n' +
      '就像你在微信输入框里打字发送一样。\n' +
      '举例：\n' +
      '刚到家\n\n今天累死了\n\n你吃了吗\n' +
      '（以上是三条独立消息）\n'
    );

    return parts.join('');
  }

  /* ═══════════════════════════════════════
     API调用
  ═══════════════════════════════════════ */
  async function callAPI(messages, onChunk, onDone, onError) {
    var apiCfg = App.api ? App.api.getActiveConfig() : null;
    if (!apiCfg) { onError('请先配置 API'); return; }

    var params = App.api ? App.api.getParams() : { temperature: 0.8, freqPenalty: 0.3, presPenalty: 0.3 };
    var url = apiCfg.url.replace(/\/+$/, '') + '/chat/completions';

    try {
      var response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiCfg.key
        },
        body: JSON.stringify({
          model: apiCfg.model,
          messages: messages,
          temperature: params.temperature,
          frequency_penalty: params.freqPenalty,
          presence_penalty: params.presPenalty,
          stream: true
        })
      });

      if (!response.ok) {
        var errText = await response.text();
        onError('API 错误 ' + response.status + ': ' + errText.substring(0, 100));
        return;
      }

      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var fullText = '';

      while (true) {
        var result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });

        var lines = buffer.split('\n');
        buffer = lines.pop();

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || line ==='data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            try {
              var json = JSON.parse(line.substring(6));
              var delta = json.choices && json.choices[0] && json.choices[0].delta;
              if (delta && delta.content) {
                fullText += delta.content;
                onChunk(fullText);
              }
            } catch (e) { /* skip malformed chunk */ }
          }
        }
      }

      onDone(fullText);
    } catch (err) {
      onError('网络错误: ' + err.message);
    }
  }

  /* ═══════════════════════════════════════
     Chat 模块
  ═══════════════════════════════════════ */
  var Chat = {
    histories: {},
    currentCharId: null,
    isGenerating: false,
    abortController: null,

    load: function() {
      Chat.histories = App.LS.get(STORAGE_KEY) || {};},
    save: function() {
      try { App.LS.set(STORAGE_KEY, Chat.histories); } catch(e) {
        App.showToast('存储空间不足，建议清理历史消息');
      }
    },
    getHistory: function(charId) {
      if (!Chat.histories[charId]) Chat.histories[charId] = [];
      return Chat.histories[charId];
    },

    /* ── 启动聊天 ── */
    startChat: function(charId) {
      Chat.load();
      Chat.currentCharId = charId;
      var char = App.character ? App.character.getById(charId) : null;
      if (!char) { App.showToast('角色不存在'); return; }

      Chat.renderChatUI(char);

      var history = Chat.getHistory(charId);
      if (!history.length && char.greeting) {
        var greetMsgs = Chat.splitMessages(char.greeting);
        greetMsgs.forEach(function(text) {
          history.push({ role: 'char', text: text, time: Date.now(), id: Chat.genId() });
        });
        Chat.save();
        Chat.renderMessages();
      }},

    /* ── 渲染聊天界面 ── */
    renderChatUI: function(char) {
      var panel = document.createElement('div');
      panel.id = 'chatPanel';
      panel.className = 'chat-panel';
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10005;display:flex;flex-direction:column;background:#fff;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';

      var avatarHtml = char.avatar
        ? '<img src="' + App.escAttr(char.avatar) + '" class="chat-header-avatar">'
        : '<div class="chat-header-avatar chat-avatar-empty"></div>';

      panel.innerHTML =
        '<div class="chat-header">' +
          '<button class="chat-back-btn" id="chatBackBtn" type="button">' +
            '<svg viewBox="0 0 24 24"><path d="M1518l-6-6 6-6"/></svg>' +
          '</button>' +
          '<div class="chat-header-info">' +
            avatarHtml +
            '<span class="chat-header-name">' + App.esc(char.name) + '</span>' +
          '</div>' +
          '<button class="chat-menu-btn" id="chatMenuBtn" type="button">' +
            '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="chat-typing" id="chatTyping">' +
          '<div class="typing-dots"><span></span><span></span><span></span></div>' +'</div>' +
        '<div class="chat-messages" id="chatMessages"></div>' +
        '<div class="chat-input-bar" id="chatInputBar">' +
          '<div class="chat-input-wrap">' +
            '<textarea class="chat-input" id="chatInput" placeholder="发消息..." rows="1"></textarea>' +
          '</div>' +
          '<button class="chat-send-btn" id="chatSendBtn" type="button">' +
            '<svg viewBox="0 0 24 24"><path d="M222L11 13"/><path d="M22 2l-720-4-9-9-4z"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="chat-msg-menu" id="chatMsgMenu"></div>';

      document.body.appendChild(panel);

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }); });

      Chat.bindChatEvents(panel, char);
      Chat.renderMessages();
    },

    /* ── 绑定聊天事件 ── */
    bindChatEvents: function(panel, char) {
      var input = panel.querySelector('#chatInput');
      var sendBtn = panel.querySelector('#chatSendBtn');
      var msgArea = panel.querySelector('#chatMessages');

      /*返回 */
      panel.querySelector('#chatBackBtn').addEventListener('click', function() {
        Chat.closeChat();
      });

      /* 菜单 */
      panel.querySelector('#chatMenuBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        Chat.showChatMenu(char);
      });

      /* 发送 */
      sendBtn.addEventListener('click', function() { Chat.sendMessage(); });

      /* 回车发送 */
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          Chat.sendMessage();
        }
      });

      /* 自动调整高度 */
      input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });

      /* 长按消息 */
      var longPressTimer = null;
      var longPressTarget = null;
      msgArea.addEventListener('touchstart', function(e) {
        var bubble = e.target.closest('.chat-bubble');
        if (!bubble) return;
        longPressTarget = bubble;
        longPressTimer = setTimeout(function() {
          Chat.showMsgMenu(bubble);
        }, 500);
      }, { passive: true });
      msgArea.addEventListener('touchmove', function() { clearTimeout(longPressTimer); }, { passive: true });
      msgArea.addEventListener('touchend', function() { clearTimeout(longPressTimer); }, { passive: true });

      /* 点击空白关闭菜单 */
      panel.addEventListener('click', function() { Chat.hideMsgMenu(); });
    },

    /* ── 发送消息 ── */
    sendMessage: function() {
      if (Chat.isGenerating) return;
      var input = App.$('#chatInput');
      if (!input) return;
      var text = input.value.trim();
      if (!text) return;

      input.value = '';
      input.style.height = 'auto';

      var history = Chat.getHistory(Chat.currentCharId);
      history.push({ role: 'user', text: text, time: Date.now(), id: Chat.genId() });
      Chat.save();
      Chat.renderMessages();

      Chat.generateReply();},

    /* ── 生成回复 ── */
    generateReply: function() {
      if (Chat.isGenerating) return;
      Chat.isGenerating = true;
      Chat.showTyping(true);

      var char = App.character ? App.character.getById(Chat.currentCharId) : null;
      if (!char) { Chat.isGenerating = false; Chat.showTyping(false); return; }

      var user = App.user ? App.user.getActiveUser() : null;

      /* 收集世界书 */
      var worldbook = [];
      if (char.worldbookMounted && App.worldbook) {
        var entries = App.LS.get('worldbookEntries') || [];
        worldbook = entries.filter(function(e) { return e.enabled !== false; });
      }

      /* 收集预设 */
      var presets = [];
      var savedPresets = App.LS.get('presetList') || [];
      var activePresetId = App.LS.get('activePreset');
      if (activePresetId) {
        var found = savedPresets.find(function(p) { return p.id === activePresetId; });
        if (found) presets.push(found);
      }

      var systemPrompt = buildSystemPrompt(char, user, worldbook, presets);

      /* 构建消息数组 */
      var history = Chat.getHistory(Chat.currentCharId);
      var messages = [{ role: 'system', content: systemPrompt }];

      /* 上下文管理：读取配置 */
      var ctxCfg = App.LS.get(CTX_KEY + '_' + Chat.currentCharId) || { maxMessages: 40 };
      var startIdx = Math.max(0, history.length - ctxCfg.maxMessages);

      for (var i = startIdx; i < history.length; i++) {
        var msg = history[i];
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }

      /* 后置提醒 */
      var now = new Date();
      var timeStr = now.getFullYear() + '/' + (now.getMonth()+1) + '/' + now.getDate() + ' ' +
        String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

      messages.push({
        role: 'system',
        content: '[当前时间：' + timeStr + ']\n' +'[提醒：你正在微信聊天。直接发送消息内容，不要加任何前缀、标记、星号、括号描写。' +
          '像真人发微信一样简短自然。多条消息用空行分隔。]'
      });

      /* 创建临时消息占位 */
      var tempId = Chat.genId();
      history.push({ role: 'char', text: '', time: Date.now(), id: tempId, generating: true });
      Chat.save();
      Chat.renderMessages();

      /* 调用 API */
      callAPI(
        messages,
        /* onChunk */
        function(fullText) {
          var msg = Chat.findMsg(tempId);
          if (msg) {
            msg.text = fullText;
            Chat.updateBubble(tempId, fullText);
          }},
        /* onDone */
        function(fullText) {
          Chat.isGenerating = false;
          Chat.showTyping(false);

          var msg = Chat.findMsg(tempId);
          if (msg) {
            msg.generating = false;

            /* 拆分多条消息 */
            var split = Chat.splitMessages(fullText);
            if (split.length > 1) {
              /* 替换临时消息为多条 */
              var idx = history.indexOf(msg);
              history.splice(idx, 1);
              split.forEach(function(t) {
                history.push({ role: 'char', text: t, time: Date.now(), id: Chat.genId() });
              });
            } else {
              msg.text = fullText;
            }
          }
          Chat.save();
          Chat.renderMessages();
        },
        /* onError */
        function(errMsg) {
          Chat.isGenerating = false;
          Chat.showTyping(false);
          var msg = Chat.findMsg(tempId);
          if (msg) {
            msg.text = '[发送失败] ' + errMsg;
            msg.generating = false;
            msg.error = true;
          }
          Chat.save();
          Chat.renderMessages();
          App.showToast(errMsg);
        }
      );
    },

    /* ── 渲染所有消息 ── */
    renderMessages: function() {
      var container = App.$('#chatMessages');
      if (!container) return;
      var history = Chat.getHistory(Chat.currentCharId);
      var char = App.character ? App.character.getById(Chat.currentCharId) : null;
      var user = App.user ? App.user.getActiveUser() : null;

      var html = '';
      var lastDate = '';

      for (var i = 0; i < history.length; i++) {
        var msg = history[i];
        var d = new Date(msg.time);
        var dateStr = d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate();
        if (dateStr !== lastDate) {
          html += '<div class="chat-date-divider">' + Chat.formatDate(d) + '</div>';
          lastDate = dateStr;
        }

        var isUser = msg.role === 'user';
        var avatarSrc = isUser
          ? (user && user.avatar ? user.avatar : '')
          : (char && char.avatar ? char.avatar : '');

        var avatarHtml = avatarSrc
          ? '<img src="' + App.escAttr(avatarSrc) + '" class="chat-msg-avatar">'
          : '<div class="chat-msg-avatar chat-msg-avatar-empty"></div>';

        var bubbleClass = 'chat-bubble' + (isUser ? ' chat-bubble-user' : ' chat-bubble-char');
        if (msg.error) bubbleClass += ' chat-bubble-error';
        if (msg.generating) bubbleClass += ' chat-bubble-generating';

        var timeStr = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');

        html += '<div class="chat-msg ' + (isUser ? 'chat-msg-right' : 'chat-msg-left') + '" data-msg-id="' + msg.id + '">' +
          (isUser ? '' : '<div class="chat-msg-avatar-wrap">' + avatarHtml + '</div>') +
          '<div class="chat-msg-body">' +
            '<div class="' + bubbleClass + '">' + Chat.formatText(msg.text || '') + '</div>' +
            '<div class="chat-msg-time">' + timeStr + '</div>' +
          '</div>' +
          (isUser ? '<div class="chat-msg-avatar-wrap">' + avatarHtml + '</div>' : '') +'</div>';
      }

      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    },

    /* ── 更新单条气泡（流式用） ── */
    updateBubble: function(msgId, text) {
      var container = App.$('#chatMessages');
      if (!container) return;
      var msgEl = container.querySelector('[data-msg-id="' + msgId + '"]');
      if (!msgEl) return;
      var bubble = msgEl.querySelector('.chat-bubble');
      if (bubble) bubble.innerHTML = Chat.formatText(text);
      container.scrollTop = container.scrollHeight;
    },

    /* ── 显示/隐藏正在输入 ── */
    showTyping: function(show) {
      var el = App.$('#chatTyping');
      if (el) el.classList.toggle('show', show);
    },

    /* ── 消息操作菜单 ── */
    showMsgMenu: function(bubble) {
      var msgEl = bubble.closest('.chat-msg');
      if (!msgEl) return;
      var msgId = msgEl.dataset.msgId;
      var msg = Chat.findMsg(msgId);
      if (!msg) return;

      var menu = App.$('#chatMsgMenu');
      if (!menu) return;

      var isUser = msg.role === 'user';
      var items = [
        { label: '复制', icon: 'copy', action: 'copy' },
        { label: '编辑', icon: 'edit', action: 'edit' }
      ];
      if (isUser) {
        items.push({ label: '重新发送', icon: 'retry', action: 'resend' });
      } else {
        items.push({ label: '重新生成', icon: 'retry', action: 'regenerate' });
      }
      items.push({ label: '删除', icon: 'del', action: 'delete' });

      menu.innerHTML = items.map(function(it) {
        return '<div class="chat-menu-item" data-action="' + it.action + '" data-msg-id="' + msgId + '">' + it.label + '</div>';
      }).join('');

      /* 定位 */
      var rect = bubble.getBoundingClientRect();
      menu.style.top = (rect.top - 48) + 'px';
      menu.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - 180)) + 'px';
      menu.classList.add('show');

      menu.querySelectorAll('.chat-menu-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          Chat.handleMsgAction(item.dataset.action, item.dataset.msgId);
          Chat.hideMsgMenu();
        });
      });
    },

    hideMsgMenu: function() {
      var menu = App.$('#chatMsgMenu');
      if (menu) menu.classList.remove('show');
    },

    /* ── 消息操作处理 ── */
    handleMsgAction: function(action, msgId) {
      var msg = Chat.findMsg(msgId);
      if (!msg) return;
      var history = Chat.getHistory(Chat.currentCharId);

      if (action === 'copy') {
        App.copyText(msg.text).then(function() { App.showToast('已复制'); });

      } else if (action === 'edit') {
        var newText = prompt('编辑消息', msg.text);
        if (newText !== null && newText.trim()) {
          msg.text = newText.trim();
          Chat.save();
          Chat.renderMessages();
        }

      } else if (action === 'delete') {
        var idx = history.indexOf(msg);
        if (idx >= 0) {
          history.splice(idx, 1);
          Chat.save();
          Chat.renderMessages();
        }

      } else if (action === 'resend') {
        /* 重新发送用户消息：删除该消息之后的所有消息，重新生成 */
        var idx2 = history.indexOf(msg);
        if (idx2 >= 0) {
          history.splice(idx2 + 1);
          Chat.save();
          Chat.renderMessages();
          Chat.generateReply();
        }

      } else if (action === 'regenerate') {
        /* 重新生成：删除这条AI回复，重新生成 */
        var idx3 = history.indexOf(msg);
        if (idx3 >= 0) {
          history.splice(idx3);
          Chat.save();
          Chat.renderMessages();
          Chat.generateReply();
        }
      }
    },

    /* ── 聊天菜单 ── */
    showChatMenu: function(char) {
      var old = App.$('#chatSettingsMenu');
      if (old) { old.remove(); return; }

      var menu = document.createElement('div');
      menu.id = 'chatSettingsMenu';
      menu.className = 'chat-settings-menu';
      menu.innerHTML =
        '<div class="chat-settings-item" data-action="clear">清空聊天记录</div>' +
        '<div class="chat-settings-item" data-action="export">导出记录</div>' +
        '<div class="chat-settings-item" data-action="context">上下文管理</div>';
      document.body.appendChild(menu);

      menu.querySelectorAll('.chat-settings-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          menu.remove();
          var act = item.dataset.action;
          if (act === 'clear') {
            if (confirm('确定清空所有聊天记录？')) {
              Chat.histories[Chat.currentCharId] = [];
              Chat.save();
              Chat.renderMessages();
              App.showToast('已清空');
            }
          } else if (act === 'export') {
            Chat.exportHistory();
          } else if (act === 'context') {
            Chat.openContextManager();
          }
        });
      });

      setTimeout(function() {
        function dismiss(e) {
          if (menu.parentNode && !menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', dismiss);
            document.removeEventListener('touchend', dismiss);
          }
        }
        document.addEventListener('click', dismiss);
        document.addEventListener('touchend', dismiss, { passive: true });
      }, 100);
    },

    /* ── 上下文管理器 ── */
    openContextManager: function() {
      var ctxCfg = App.LS.get(CTX_KEY + '_' + Chat.currentCharId) || { maxMessages: 40 };

      var overlay = document.createElement('div');
      overlay.className = 'chat-ctx-overlay';
      overlay.innerHTML =
        '<div class="chat-ctx-panel">' +
          '<div class="chat-ctx-title">上下文管理</div>' +
          '<div class="chat-ctx-field">' +
            '<label>发送给模型的最大消息数</label>' +
            '<div class="chat-ctx-range-wrap">' +
              '<input type="range" min="5" max="100" step="5" value="' + ctxCfg.maxMessages + '" id="ctxMaxMsg">' +
              '<span id="ctxMaxMsgVal">' + ctxCfg.maxMessages + '条</span>' +
            '</div>' +
          '</div>' +
          '<div class="chat-ctx-hint">数值越大，AI记忆越长，但消耗的token 越多。</div>' +
          '<div class="chat-ctx-btns">' +
            '<button class="chat-ctx-btn" id="ctxSave" type="button">保存</button>' +
            '<button class="chat-ctx-btn chat-ctx-btn-cancel" id="ctxCancel" type="button">取消</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#ctxMaxMsg').addEventListener('input', function() {
        overlay.querySelector('#ctxMaxMsgVal').textContent = this.value + ' 条';
      });

      overlay.querySelector('#ctxSave').addEventListener('click', function() {
        var val = parseInt(overlay.querySelector('#ctxMaxMsg').value);
        App.LS.set(CTX_KEY + '_' + Chat.currentCharId, { maxMessages: val });
        overlay.remove();App.showToast('已保存');
      });

      overlay.querySelector('#ctxCancel').addEventListener('click', function() { overlay.remove(); });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    /* ── 导出── */
    exportHistory: function() {
      var history = Chat.getHistory(Chat.currentCharId);
      var char = App.character ? App.character.getById(Chat.currentCharId) : null;
      var name = char ? char.name : '未知';
      var text = history.map(function(m) {
        var d = new Date(m.time);
        var ts = d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' +
          String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        var who = m.role === 'user' ? '我' : name;
        return '[' + ts + '] ' + who + '：' + m.text;
      }).join('\n\n');
      App.copyText(text).then(function() { App.showToast('已复制到剪贴板'); });
    },

    /* ── 关闭聊天 ── */
    closeChat: function() {
      var panel = App.$('#chatPanel');
      if (!panel) return;
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
      setTimeout(function() { if (panel.parentNode) panel.remove(); }, 350);
      Chat.currentCharId = null;
      Chat.isGenerating = false;
    },

    /* ── 工具函数 ── */
    genId: function() { return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6); },

    findMsg: function(id) {
      var history = Chat.getHistory(Chat.currentCharId);
      for (var i = 0; i < history.length; i++) {
        if (history[i].id === id) return history[i];
      }
      return null;
    },

    splitMessages: function(text) {
      if (!text) return [];
      return text.split(/\n\s*\n/).map(function(t) { return t.trim(); }).filter(function(t) { return t; });
    },

    formatText: function(text) {
      if (!text) return '';
      return App.esc(text).replace(/\n/g, '<br>');
    },

    formatDate: function(d) {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      var diff = (today - target) / 86400000;
      if (diff === 0) return '今天';
      if (diff === 1) return '昨天';
      if (diff < 7) return ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
      return (d.getMonth()+1) + '月' + d.getDate() + '日';
    },

    init: function() {
      Chat.load();
      App.chat = Chat;
    }
  };

  App.register('chat', Chat);
})();