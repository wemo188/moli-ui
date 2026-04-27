(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

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

    parts.push(
      '\n【反模板规则】\n' +
      '你不是在写作文，你是在发微信。以下行为绝对禁止：\n' +
      '- 禁止用成语堆砌或文学化的修饰\n' +
      '- 禁止在每句话后面加"呢""呀""哦"来装可爱（除非你的人设就是这种说话方式）\n' +
      '- 禁止无意义的重复回应（"好的好的""嗯嗯嗯"）\n' +
      '- 禁止像客服一样回复\n' +
      '- 禁止主动解释自己为什么这么说、这么做\n' +
      '- 禁止每次回复都表达关心（真人不会每句话都问你吃了没、注意身体）\n' +
      '- 禁止在不合适的时候突然煽情或说土味情话\n' +
      '- 如果对方发的消息你觉得没什么好回的，可以敷衍，可以已读不回\n\n' +

      '【理解用户意图】\n' +
      '收到消息后，先想想对方真正想表达什么、想得到什么样的回应：\n' +
      '- 对方是在闲聊？→ 轻松地接话就行\n' +
      '- 对方是在撒娇？→ 用你的性格方式回应\n' +
      '- 对方是在生气？→ 根据你的性格决定是哄还是怼还是冷处理\n' +
      '- 对方是在试探？→ 根据你和对方的关系决定怎么应对\n' +
      '不要按套路回答，要按你这个角色会有的真实反应来回答。\n'
    );

    if (charData.profile) {
      parts.push('\n【你的详细资料】\n' + charData.profile + '\n');
    }

    var info = [];
    if (charData.gender) info.push('性别：' + charData.gender);
    if (charData.age) info.push('年龄：' + charData.age);
    if (charData.birthday) info.push('生日：' + charData.birthday);
    if (charData.relation) info.push('与' + callName + '的关系：' + charData.relation);
    if (charData.callName) info.push('对' + userName + '的称呼：' + charData.callName);
    if (info.length) parts.push('\n【基础信息】\n' + info.join('\n') + '\n');

    if (userData) {
      var uinfo = [];
      if (userData.nickname) uinfo.push('昵称：' + userData.nickname);
      if (userData.realName) uinfo.push('真名：' + userData.realName);
      if (userData.gender) uinfo.push('性别：' + userData.gender);
      if (userData.age) uinfo.push('年龄：' + userData.age);
      if (userData.birthday) uinfo.push('生日：' + userData.birthday);
      if (userData.bio) uinfo.push('个人描述：' + userData.bio);
      if (uinfo.length) parts.push('\n【关于' + callName + '】\n' + uinfo.join('\n') + '\n');
    }

    if (worldbook && worldbook.length) {
      var wbParts = worldbook.map(function(e) {
        return '· ' + (e.title || '无标题') + '：' + (e.content || '');
      });
      parts.push('\n【世界观设定】\n' + wbParts.join('\n') + '\n');
    }

    if (presets && presets.length) {
      presets.forEach(function(p) {
        if (p.content) parts.push('\n【补充指令 - ' + (p.name || '预设') + '】\n' + p.content + '\n');
      });
    }

    if (charData.dialogExamples) {
      parts.push('\n【说话风格参考（模仿这种口吻和语气）】\n' + charData.dialogExamples + '\n');
    }

    if (charData.postInstruction) {
      parts.push('\n【额外指令（最高优先级）】\n' + charData.postInstruction + '\n');
    }

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
     场景/时间线提示词
  ═══════════════════════════════════════ */
  function buildScenePrompt(charId) {
    var scene = App.LS.get('chatScene_' + charId);
    if (!scene) return '';
    var parts = [];
    if (scene.time) parts.push('当前时间线：' + scene.time);
    if (scene.location) parts.push('当前地点：' + scene.location);
    if (scene.situation) parts.push('当前情境：' + scene.situation);
    if (scene.notes) parts.push('补充说明：' + scene.notes);
    if (!parts.length) return '';
    return '\n【当前场景设定】\n' + parts.join('\n') + '\n';
  }

  /* ═══════════════════════════════════════
     API 调用
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
          if (!line || line === 'data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            try {
              var json = JSON.parse(line.substring(6));
              var delta = json.choices && json.choices[0] && json.choices[0].delta;
              if (delta && delta.content) {
                fullText += delta.content;
                onChunk(fullText);
              }
            } catch (e) { /* skip */ }
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
    _savedHeader: '',
    _savedBody: '',
    _savedTabbar: '',
    _savedSearch: '',

    load: function() { Chat.histories = App.LS.get(STORAGE_KEY) || {}; },
    save: function() {
      try { App.LS.set(STORAGE_KEY, Chat.histories); } catch(e) {
        App.showToast('存储空间不足，建议清理历史消息');
      }
    },
    getHistory: function(charId) {
      if (!Chat.histories[charId]) Chat.histories[charId] = [];
      return Chat.histories[charId];
    },

    /* ── 进入聊天 ── */
    startChat: function(charId) {
      Chat.load();
      Chat.currentCharId = charId;
      var char = App.character ? App.character.getById(charId) : null;
      if (!char) { App.showToast('角色不存在'); return; }

      /* 保存微信主界面的内容，退出时还原 */
      var header = App.$('.wx-header');
      var body = App.$('#wxBody');
      var tabbar = App.$('.wx-tabbar');
      var search = App.$('.wx-search');

      if (header) Chat._savedHeader = header.innerHTML;
      if (body) Chat._savedBody = body.innerHTML;
      if (tabbar) Chat._savedTabbar = tabbar.innerHTML;
      if (search) { Chat._savedSearch = search.style.display; search.style.display = 'none'; }

      Chat.renderChatUI(char);

      var history = Chat.getHistory(charId);
      if (!history.length && char.greeting) {
        var greetMsgs = Chat.splitMessages(char.greeting);
        greetMsgs.forEach(function(text) {
          history.push({ role: 'char', text: text, time: Date.now(), id: Chat.genId() });
        });
        Chat.save();
      }
      Chat.renderMessages();
    },

    /* ── 渲染聊天界面（替换微信内部内容） ── */
    renderChatUI: function(char) {
      var header = App.$('.wx-header');
      var body = App.$('#wxBody');
      var tabbar = App.$('.wx-tabbar');

      if (!header || !body || !tabbar) return;

      /* 替换头部 */
      var avatarHtml = char.avatar
        ? '<img src="' + App.escAttr(char.avatar) + '" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(192,206,220,.6);">'
        : '<div style="width:34px;height:34px;border-radius:50%;background:rgba(202,223,242,.2);border:1.5px solid rgba(192,206,220,.6);"></div>';

      header.innerHTML =
        '<button class="wx-header-btn" id="wxChatBack" type="button">' +
          '<svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M15 18l-6-6 6-6"/></svg>' +
        '</button>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          avatarHtml +
          '<span style="font-size:16px;font-weight:600;color:#2e4258;letter-spacing:.5px;">' + App.esc(char.name) + '</span>' +
        '</div>' +
        '<div style="position:relative;">' +
          '<button class="wx-header-btn" id="wxChatMenuBtn" type="button">' +
            '<svg viewBox="0 0 24 24" style="width:20px;height:20px;"><circle cx="5" cy="12" r="1.5" fill="#7a9ab8"/><circle cx="12" cy="12" r="1.5" fill="#7a9ab8"/><circle cx="19" cy="12" r="1.5" fill="#7a9ab8"/></svg>' +
          '</button>' +
        '</div>';

      /* 替换消息区 */
      body.innerHTML =
        '<div class="wx-chat-typing" id="wxChatTyping">' +
          '<div class="wx-typing-dots"><span></span><span></span><span></span></div>' +
        '</div>' +
        '<div class="wx-chat-msgs" id="wxChatMsgs"></div>' +
        '<div class="wx-chat-msg-menu" id="wxChatMsgMenu"></div>';

      body.style.display = 'flex';
      body.style.flexDirection = 'column';

      /* 替换底部栏为输入栏 */
      tabbar.innerHTML =
        '<div class="wx-chat-input-bar">' +
          '<div class="wx-chat-input-wrap">' +
            '<textarea class="wx-chat-input" id="wxChatInput" placeholder="发消息..." rows="1"></textarea>' +
          '</div>' +
          '<button class="wx-chat-send-btn" id="wxChatSendBtn" type="button">' +
            '<svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>' +
          '</button>' +
        '</div>';
      tabbar.style.padding = '0';
      tabbar.style.borderTop = '1px solid rgba(126,163,201,.1)';

      Chat.bindChatEvents();
    },

    /* ── 绑定聊天事件 ── */
    bindChatEvents: function() {
      var input = App.$('#wxChatInput');
      var sendBtn = App.$('#wxChatSendBtn');

      /* 返回 */
      App.safeOn('#wxChatBack', 'click', function() { Chat.closeChat(); });

      /* 三点菜单 */
      App.safeOn('#wxChatMenuBtn', 'click', function(e) {
        e.stopPropagation();
        Chat.showChatMenu();
      });

      /* 发送 */
      if (sendBtn) sendBtn.addEventListener('click', function() { Chat.sendMessage(); });

      /* 回车发送 */
      if (input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            Chat.sendMessage();
          }
        });
        input.addEventListener('input', function() {
          this.style.height = 'auto';
          this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
      }

      /* 长按消息 */
      var msgArea = App.$('#wxChatMsgs');
      if (msgArea) {
        var longTimer = null;
        msgArea.addEventListener('touchstart', function(e) {
          var bubble = e.target.closest('.wx-chat-bubble');
          if (!bubble) return;
          longTimer = setTimeout(function() { Chat.showMsgMenu(bubble); }, 500);
        }, { passive: true });
        msgArea.addEventListener('touchmove', function() { clearTimeout(longTimer); }, { passive: true });
        msgArea.addEventListener('touchend', function() { clearTimeout(longTimer); }, { passive: true });
      }

      /* 点击空白关闭菜单 */
      var body = App.$('#wxBody');
      if (body) body.addEventListener('click', function() { Chat.hideMsgMenu(); });
    },

    /* ── 发送消息 ── */
    sendMessage: function() {
      if (Chat.isGenerating) return;
      var input = App.$('#wxChatInput');
      if (!input) return;
      var text = input.value.trim();
      if (!text) return;

      input.value = '';
      input.style.height = 'auto';

      var history = Chat.getHistory(Chat.currentCharId);
      history.push({ role: 'user', text: text, time: Date.now(), id: Chat.genId() });
      Chat.save();
      Chat.renderMessages();
      Chat.generateReply();
    },

    /* ── 生成回复 ── */
    generateReply: function() {
      if (Chat.isGenerating) return;
      Chat.isGenerating = true;
      Chat.showTyping(true);

      var char = App.character ? App.character.getById(Chat.currentCharId) : null;
      if (!char) { Chat.isGenerating = false; Chat.showTyping(false); return; }

      var user = App.user ? App.user.getActiveUser() : null;

      var worldbook = [];
      if (char.worldbookMounted && App.worldbook) {
        var entries = App.LS.get('worldbookEntries') || [];
        worldbook = entries.filter(function(e) { return e.enabled !== false; });
      }

      var presets = [];
      var savedPresets = App.LS.get('presetList') || [];
      var activePresetId = App.LS.get('activePreset');
      if (activePresetId) {
        var found = savedPresets.find(function(p) { return p.id === activePresetId; });
        if (found) presets.push(found);
      }

      var systemPrompt = buildSystemPrompt(char, user, worldbook, presets);

      /* 场景设定 */
      var scenePrompt = buildScenePrompt(Chat.currentCharId);
      if (scenePrompt) systemPrompt += scenePrompt;

      var history = Chat.getHistory(Chat.currentCharId);
      var messages = [{ role: 'system', content: systemPrompt }];

      var ctxCfg = App.LS.get(CTX_KEY + '_' + Chat.currentCharId) || { maxMessages: 40 };
      var startIdx = Math.max(0, history.length - ctxCfg.maxMessages);

      for (var i = startIdx; i < history.length; i++) {
        var msg = history[i];
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }

      var now = new Date();
      var timeStr = now.getFullYear() + '/' + (now.getMonth()+1) + '/' + now.getDate() + ' ' +
        String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

      messages.push({
        role: 'system',
        content: '[当前时间：' + timeStr + ']\n' +
          '[提醒：你正在微信聊天。直接发送消息内容，不要加任何前缀、标记、星号、括号描写。' +
          '像真人发微信一样简短自然。多条消息用空行分隔。]'
      });

      var tempId = Chat.genId();
      history.push({ role: 'char', text: '', time: Date.now(), id: tempId, generating: true });
      Chat.save();
      Chat.renderMessages();

      callAPI(
        messages,
        function(fullText) {
          var msg = Chat.findMsg(tempId);
          if (msg) { msg.text = fullText; Chat.updateBubble(tempId, fullText); }
        },
        function(fullText) {
          Chat.isGenerating = false;
          Chat.showTyping(false);
          var msg = Chat.findMsg(tempId);
          if (msg) {
            msg.generating = false;
            var split = Chat.splitMessages(fullText);
            if (split.length > 1) {
              var idx = history.indexOf(msg);
              history.splice(idx, 1);
              split.forEach(function(t) {
                history.push({ role: 'char', text: t, time: Date.now(), id: Chat.genId() });
              });
            } else { msg.text = fullText; }
          }
          Chat.save();
          Chat.renderMessages();
        },
        function(errMsg) {
          Chat.isGenerating = false;
          Chat.showTyping(false);
          var msg = Chat.findMsg(tempId);
          if (msg) { msg.text = '[发送失败] ' + errMsg; msg.generating = false; msg.error = true; }
          Chat.save();
          Chat.renderMessages();
          App.showToast(errMsg);
        }
      );
    },

    /* ── 渲染消息 ── */
    renderMessages: function() {
      var container = App.$('#wxChatMsgs');
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
          html += '<div class="wx-chat-date">' + Chat.formatDate(d) + '</div>';
          lastDate = dateStr;
        }

        var isUser = msg.role === 'user';
        var avatarSrc = isUser
          ? (user && user.avatar ? user.avatar : '')
          : (char && char.avatar ? char.avatar : '');

        var avatarHtml = avatarSrc
          ? '<img src="' + App.escAttr(avatarSrc) + '" class="wx-chat-avatar">'
          : '<div class="wx-chat-avatar wx-chat-avatar-empty"></div>';

        var bubbleCls = 'wx-chat-bubble' + (isUser ? ' wx-bubble-user' : ' wx-bubble-char');
        if (msg.error) bubbleCls += ' wx-bubble-error';
        if (msg.generating) bubbleCls += ' wx-bubble-gen';

        var timeStr = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');

        html += '<div class="wx-chat-row ' + (isUser ? 'wx-row-right' : 'wx-row-left') + '" data-msg-id="' + msg.id + '">' +
          (isUser ? '' : '<div class="wx-chat-av-wrap">' + avatarHtml + '</div>') +
          '<div class="wx-chat-msg-body">' +
            '<div class="' + bubbleCls + '">' + Chat.formatText(msg.text || '') + '</div>' +
            '<div class="wx-chat-time">' + timeStr + '</div>' +
          '</div>' +
          (isUser ? '<div class="wx-chat-av-wrap">' + avatarHtml + '</div>' : '') +
        '</div>';
      }

      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    },

    updateBubble: function(msgId, text) {
      var container = App.$('#wxChatMsgs');
      if (!container) return;
      var el = container.querySelector('[data-msg-id="' + msgId + '"]');
      if (!el) return;
      var bubble = el.querySelector('.wx-chat-bubble');
      if (bubble) bubble.innerHTML = Chat.formatText(text);
      container.scrollTop = container.scrollHeight;
    },

    showTyping: function(show) {
      var el = App.$('#wxChatTyping');
      if (el) el.classList.toggle('wx-typing-show', show);
    },

    /* ── 消息长按菜单 ── */
    showMsgMenu: function(bubble) {
      var msgEl = bubble.closest('.wx-chat-row');
      if (!msgEl) return;
      var msgId = msgEl.dataset.msgId;
      var msg = Chat.findMsg(msgId);
      if (!msg) return;

      var menu = App.$('#wxChatMsgMenu');
      if (!menu) return;

      var isUser = msg.role === 'user';
      var items = [
        { label: '复制', action: 'copy' },
        { label: '编辑', action: 'edit' }
      ];
      if (isUser) items.push({ label: '重发', action: 'resend' });
      else items.push({ label: '重新生成', action: 'regenerate' });
      items.push({ label: '删除', action: 'delete' });

      menu.innerHTML = items.map(function(it) {
        return '<div class="wx-chat-menu-item" data-action="' + it.action + '" data-msg-id="' + msgId + '">' + it.label + '</div>';
      }).join('');

      var rect = bubble.getBoundingClientRect();
      var bodyRect = App.$('#wxBody').getBoundingClientRect();
      menu.style.top = (rect.top - bodyRect.top - 44) + 'px';
      menu.style.left = Math.max(8, Math.min(rect.left - bodyRect.left, bodyRect.width - 200)) + 'px';
      menu.classList.add('wx-menu-show');

      menu.querySelectorAll('.wx-chat-menu-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          Chat.handleMsgAction(item.dataset.action, item.dataset.msgId);
          Chat.hideMsgMenu();
        });
      });
    },

    hideMsgMenu: function() {
      var menu = App.$('#wxChatMsgMenu');
      if (menu) menu.classList.remove('wx-menu-show');
    },

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
          Chat.save(); Chat.renderMessages();
        }
      } else if (action === 'delete') {
        var idx = history.indexOf(msg);
        if (idx >= 0) { history.splice(idx, 1); Chat.save(); Chat.renderMessages(); }
      } else if (action === 'resend') {
        var idx2 = history.indexOf(msg);
        if (idx2 >= 0) { history.splice(idx2 + 1); Chat.save(); Chat.renderMessages(); Chat.generateReply(); }
      } else if (action === 'regenerate') {
        var idx3 = history.indexOf(msg);
        if (idx3 >= 0) { history.splice(idx3); Chat.save(); Chat.renderMessages(); Chat.generateReply(); }
      }
    },

    /* ── 三点菜单 ── */
    showChatMenu: function() {
      var old = App.$('#wxChatSettingsMenu');
      if (old) { old.remove(); return; }

      var menu = document.createElement('div');
      menu.id = 'wxChatSettingsMenu';
      menu.className = 'wx-chat-settings-menu';
      menu.innerHTML =
        '<div class="wx-chat-settings-item" data-action="scene">当前场景 / 时间线</div>' +
        '<div class="wx-chat-settings-item" data-action="context">上下文管理</div>' +
        '<div class="wx-chat-settings-item" data-action="export">导出记录</div>' +
        '<div class="wx-chat-settings-item" data-action="clear">清空聊天</div>';

      /* 定位在右上角按钮下方 */
      var btn = App.$('#wxChatMenuBtn');
      if (btn) {
        var r = btn.getBoundingClientRect();
        var wxInner = App.$('.wx-inner');
        var ir = wxInner ? wxInner.getBoundingClientRect() : { left: 0, top: 0 };
        menu.style.position = 'absolute';
        menu.style.top = (r.bottom - ir.top + 4) + 'px';
        menu.style.right = '12px';
        menu.style.zIndex = '100';
      }

      var wxInnerEl = App.$('.wx-inner');
      if (wxInnerEl) wxInnerEl.appendChild(menu);

      requestAnimationFrame(function() { menu.classList.add('wx-settings-show'); });

      menu.querySelectorAll('.wx-chat-settings-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          menu.remove();
          var act = item.dataset.action;
          if (act === 'clear') {
            if (confirm('确定清空所有聊天记录？')) {
              Chat.histories[Chat.currentCharId] = [];
              Chat.save(); Chat.renderMessages(); App.showToast('已清空');
            }
          } else if (act === 'export') { Chat.exportHistory(); }
          else if (act === 'context') { Chat.openContextManager(); }
          else if (act === 'scene') { Chat.openSceneEditor(); }
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

    /* ── 场景/时间线编辑器 ── */
    openSceneEditor: function() {
      var scene = App.LS.get('chatScene_' + Chat.currentCharId) || {};

      var overlay = document.createElement('div');
      overlay.className = 'wx-scene-overlay';
      overlay.innerHTML =
        '<div class="wx-scene-panel">' +
          '<div class="wx-scene-title">场景 / 时间线设定</div>' +
          '<div class="wx-scene-hint">设定当前的场景信息，AI 会在聊天时感知这些设定。</div>' +
          '<div class="wx-scene-field"><label>时间线</label><input type="text" id="sceneTime" placeholder="例如：高三寒假 / 刚认识第三天 / 婚后第二年..." value="' + App.escAttr(scene.time || '') + '"></div>' +
          '<div class="wx-scene-field"><label>地点</label><input type="text" id="sceneLoc" placeholder="例如：同一座城市 / 异地 / 他在北京你在上海..." value="' + App.escAttr(scene.location || '') + '"></div>' +
          '<div class="wx-scene-field"><label>当前情境</label><textarea id="sceneSitu" rows="3" placeholder="例如：昨天刚吵完架 / 他刚下飞机 / 你们冷战第二天...">' + App.esc(scene.situation || '') + '</textarea></div>' +
          '<div class="wx-scene-field"><label>补充说明</label><textarea id="sceneNotes" rows="2" placeholder="其他需要 AI 知道的信息...">' + App.esc(scene.notes || '') + '</textarea></div>' +
          '<div class="wx-scene-btns">' +
            '<button class="wx-scene-btn" id="sceneSave" type="button">保存</button>' +
            '<button class="wx-scene-btn wx-scene-btn-clear" id="sceneClear" type="button">清空</button>' +
            '<button class="wx-scene-btn wx-scene-btn-cancel" id="sceneCancel" type="button">取消</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#sceneSave').addEventListener('click', function() {
        App.LS.set('chatScene_' + Chat.currentCharId, {
          time: overlay.querySelector('#sceneTime').value.trim(),
          location: overlay.querySelector('#sceneLoc').value.trim(),
          situation: overlay.querySelector('#sceneSitu').value.trim(),
          notes: overlay.querySelector('#sceneNotes').value.trim()
        });
        overlay.remove(); App.showToast('场景已保存');
      });

      overlay.querySelector('#sceneClear').addEventListener('click', function() {
        App.LS.remove('chatScene_' + Chat.currentCharId);
        overlay.remove(); App.showToast('场景已清空');
      });

      overlay.querySelector('#sceneCancel').addEventListener('click', function() { overlay.remove(); });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    /* ── 上下文管理 ── */
    openContextManager: function() {
      var ctxCfg = App.LS.get(CTX_KEY + '_' + Chat.currentCharId) || { maxMessages: 40 };
      var overlay = document.createElement('div');
      overlay.className = 'wx-scene-overlay';
      overlay.innerHTML =
        '<div class="wx-scene-panel">' +
          '<div class="wx-scene-title">上下文管理</div>' +
          '<div class="wx-scene-field"><label>发送给模型的最大消息数</label>' +
            '<div style="display:flex;align-items:center;gap:10px;margin-top:6px;">' +
              '<input type="range" min="5" max="100" step="5" value="' + ctxCfg.maxMessages + '" id="ctxMaxMsg" style="flex:1;accent-color:#7a9ab8;">' +
              '<span id="ctxMaxMsgVal" style="font-size:13px;font-weight:600;color:#2e4258;min-width:50px;">' + ctxCfg.maxMessages + ' 条</span>' +
            '</div>' +
          '</div>' +
          '<div class="wx-scene-hint">数值越大，AI 记忆越长，但消耗的 token 越多。</div>' +
          '<div class="wx-scene-btns">' +
            '<button class="wx-scene-btn" id="ctxSave" type="button">保存</button>' +
            '<button class="wx-scene-btn wx-scene-btn-cancel" id="ctxCancel" type="button">取消</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#ctxMaxMsg').addEventListener('input', function() {
        overlay.querySelector('#ctxMaxMsgVal').textContent = this.value + ' 条';
      });
      overlay.querySelector('#ctxSave').addEventListener('click', function() {
        App.LS.set(CTX_KEY + '_' + Chat.currentCharId, { maxMessages: parseInt(overlay.querySelector('#ctxMaxMsg').value) });
        overlay.remove(); App.showToast('已保存');
      });
      overlay.querySelector('#ctxCancel').addEventListener('click', function() { overlay.remove(); });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    exportHistory: function() {
      var history = Chat.getHistory(Chat.currentCharId);
      var char = App.character ? App.character.getById(Chat.currentCharId) : null;
      var name = char ? char.name : '未知';
      var text = history.map(function(m) {
        var d = new Date(m.time);
        var ts = d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' +
          String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        return '[' + ts + '] ' + (m.role === 'user' ? '我' : name) + '：' + m.text;
      }).join('\n\n');
      App.copyText(text).then(function() { App.showToast('已复制到剪贴板'); });
    },

    /* ── 退出聊天（还原微信主界面） ── */
    closeChat: function() {
      Chat.currentCharId = null;
      Chat.isGenerating = false;

      var header = App.$('.wx-header');
      var body = App.$('#wxBody');
      var tabbar = App.$('.wx-tabbar');
      var search = App.$('.wx-search');

      if (header) header.innerHTML = Chat._savedHeader;
      if (body) { body.innerHTML = Chat._savedBody; body.style.display = ''; body.style.flexDirection = ''; }
      if (tabbar) { tabbar.innerHTML = Chat._savedTabbar; tabbar.style.padding = ''; tabbar.style.borderTop = ''; }
      if (search) search.style.display = Chat._savedSearch;

      /* 重新绑定微信的事件 */
      if (App.wechat) {
        App.wechat.currentTab = 'chat';
        App.wechat.bindEvents();
        App.wechat.renderTab();
      }
    },

    /* ── 工具函数 ── */
    genId: function() { return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6); },
    findMsg: function(id) {
      var history = Chat.getHistory(Chat.currentCharId);
      for (var i = 0; i < history.length; i++) { if (history[i].id === id) return history[i]; }
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