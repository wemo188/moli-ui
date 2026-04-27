
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var SPLIT = '|||';
  var MAX_CONTEXT = 40;
  var STYLE_ID = 'chatStyles';

  function injectStyles() {
    if (App.$('#' + STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '.ct-page{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10005;display:flex;flex-direction:column;background:#fff;transition:transform .35s cubic-bezier(.32,.72,0,1),opacity .3s;transform:translateX(100%);opacity:0;}' +
      '.ct-page.show{transform:translateX(0);opacity:1;}' +
      '.ct-bg{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;pointer-events:none;}' +
      '.ct-tint{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 50% 48%,rgba(126,163,201,.38) 0%,rgba(126,163,201,.18) 20%,rgba(126,163,201,.08) 40%,transparent 65%),radial-gradient(circle at 46% 44%,rgba(140,180,215,.15) 0%,transparent 50%);mix-blend-mode:multiply;}' +
      '.ct-tint.off{display:none;}' +
      '.ct-glass{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.55),transparent 42%),linear-gradient(315deg,rgba(255,255,255,.28),transparent 44%);mix-blend-mode:screen;opacity:.7;}' +
      '.ct-hd{position:relative;z-index:10;display:flex;align-items:center;padding:52px 14px 10px;flex-shrink:0;gap:10px;}' +
      '.ct-hd-btn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;flex-shrink:0;}' +
      '.ct-hd-btn svg{width:20px;height:20px;fill:none;stroke:#5a7a9a;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
      '.ct-hd-name{flex:1;text-align:center;font-size:16px;font-weight:700;color:#2e4258;letter-spacing:.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.ct-hd-typing{font-size:11px;color:#8aa0b8;font-weight:400;letter-spacing:0;}' +
      '.ct-hd-menu{position:absolute;top:88px;right:14px;z-index:100;background:#000;border-radius:12px;padding:6px 0;box-shadow:0 8px 30px rgba(0,0,0,.25);min-width:160px;opacity:0;transform:scale(.9) translateY(-8px);transform-origin:top right;transition:opacity .18s,transform .18s;pointer-events:none;}' +
      '.ct-hd-menu.show{opacity:1;transform:scale(1) translateY(0);pointer-events:auto;}' +
      '.ct-hd-menu::before{content:"";position:absolute;top:-6px;right:16px;width:12px;height:12px;background:#000;transform:rotate(45deg);border-radius:2px 0 0 0;}' +
      '.ct-hd-mi{display:flex;align-items:center;justify-content:space-between;padding:11px 16px;cursor:pointer;transition:background .15s;-webkit-tap-highlight-color:transparent;}' +
      '.ct-hd-mi:active{background:rgba(255,255,255,.1);}' +
      '.ct-hd-mi:not(:last-child){border-bottom:1px solid rgba(255,255,255,.08);}' +
      '.ct-hd-mi span{font-size:13px;color:rgba(255,255,255,.85);font-weight:500;}' +
      '.ct-hd-mi .ct-sw-track{width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}' +
      '.ct-hd-mi .ct-sw-track.on{background:rgba(126,163,201,.9);}' +
      '.ct-hd-mi .ct-sw-track.off{background:rgba(255,255,255,.2);}' +
      '.ct-hd-mi .ct-sw-track::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;}' +
      '.ct-hd-mi .ct-sw-track.on::after{transform:translateX(16px);}' +
      '.ct-msgs{position:relative;z-index:5;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 14px 14px;}' +
      '.ct-msg{display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;max-width:100%;}' +
      '.ct-msg.user{flex-direction:row-reverse;}' +
      '.ct-msg-av{width:38px;height:38px;border-radius:8px;flex-shrink:0;overflow:hidden;background:rgba(202,223,242,.15);border:1px solid rgba(192,206,220,.5);}' +
      '.ct-msg-av img{width:100%;height:100%;object-fit:cover;display:block;}' +
      '.ct-msg-av svg{width:18px;height:18px;margin:10px;stroke:#a8c0d8;fill:none;stroke-width:1.5;}' +
      '.ct-bubble{max-width:72%;padding:9px 13px;border-radius:14px;font-size:14.5px;line-height:1.6;word-break:break-word;position:relative;white-space:pre-wrap;}' +
      '.ct-msg.ai .ct-bubble{background:rgba(255,255,255,.88);color:#2e4258;border:1px solid rgba(200,220,240,.4);border-top-left-radius:4px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}' +
      '.ct-msg.user .ct-bubble{background:rgba(126,163,201,.82);color:#fff;border-top-right-radius:4px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}' +
      '.ct-msg-time{font-size:10px;color:#a8c0d8;text-align:center;margin:12px 0 6px;letter-spacing:.5px;}' +
      '.ct-sys{text-align:center;font-size:11px;color:#a8c0d8;margin:10px 20px;letter-spacing:.5px;}' +
      '.ct-input-wrap{position:relative;z-index:10;display:flex;align-items:flex-end;gap:8px;padding:8px 14px calc(8px + env(safe-area-inset-bottom,10px));background:rgba(255,255,255,.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(200,220,240,.25);flex-shrink:0;}' +
      '.ct-input{flex:1;min-height:36px;max-height:120px;padding:8px 14px;border:1px solid rgba(200,220,240,.4);border-radius:20px;background:rgba(255,255,255,.9);font-size:14.5px;color:#2e4258;outline:none;resize:none;line-height:1.5;font-family:inherit;overflow-y:auto;}' +
      '.ct-input:focus{border-color:rgba(126,163,201,.6);}' +
      '.ct-send{width:36px;height:36px;border-radius:50%;background:rgba(126,163,201,.85);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;transition:opacity .15s;}' +
      '.ct-send:active{opacity:.7;}' +
      '.ct-send svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
      '.ct-send.stop{background:rgba(201,112,107,.85);}' +
      '.ct-ctx{position:fixed;z-index:10010;background:#000;border-radius:10px;padding:4px 0;box-shadow:0 6px 24px rgba(0,0,0,.25);min-width:120px;}' +
      '.ct-ctx-item{padding:10px 16px;font-size:13px;color:rgba(255,255,255,.85);cursor:pointer;-webkit-tap-highlight-color:transparent;}' +
      '.ct-ctx-item:active{background:rgba(255,255,255,.1);}' +
      '.ct-ctx-item:not(:last-child){border-bottom:1px solid rgba(255,255,255,.08);}' +
      '.ct-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;gap:10px;}' +
      '.ct-empty-text{font-size:12px;color:#a8c0d8;text-align:center;letter-spacing:.5px;line-height:1.6;}' +
      '.ct-greeting{text-align:center;padding:20px 30px;font-size:13px;color:#7a9ab8;line-height:1.7;letter-spacing:.3px;}' +
      '@keyframes ctDots{0%,80%,100%{opacity:.3}40%{opacity:1}}.ct-typing-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#8aa0b8;margin:0 2px;animation:ctDots 1.2s infinite;}.ct-typing-dot:nth-child(2){animation-delay:.2s;}.ct-typing-dot:nth-child(3){animation-delay:.4s;}' +
      '.ct-edit-overlay{position:fixed;inset:0;z-index:10012;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;}' +
      '.ct-edit-panel{background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:18px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);}' +
      '.ct-edit-ta{width:100%;min-height:80px;border:1.5px solid #ddd;border-radius:10px;padding:10px 12px;font-size:14px;color:#333;outline:none;resize:vertical;font-family:inherit;line-height:1.5;box-sizing:border-box;}' +
      '.ct-edit-btns{display:flex;gap:8px;margin-top:12px;}' +
      '.ct-edit-btn{flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}';
    document.head.appendChild(s);
  }

  function buildSystemPrompt(charData, userData) {
    var parts = [];

    parts.push(
      '你正在微信里和用户聊天。你扮演的角色信息如下。\n\n' +
      '【最高优先级规则】\n' +
      '1. 你的回复必须是纯聊天对话，就像真人发微信。\n' +
      '2. 绝对禁止任何叙事描写：不写动作（"他笑了""她叹气"）、不写心理活动、不写环境描写、不用 *星号* 或 (括号) 包裹旁白。\n' +
      '3. 绝对禁止八股文式回复和网文模板（"某人嘴角微扬""一抹深意""不禁心头一颤"等）。\n' +
      '4. 绝对禁止油腻、霸总、超雄、舔狗式表达。\n' +
      '5. 说话要像真人：口语化、自然、有个性。可以打错字、用缩写、发语音梗、用表情。\n' +
      '6. 认真理解用户每条消息的真实意图。不要敷衍、不要万能回复（"嗯？""怎么了？""你说呢"）。\n' +
      '7. 根据角色性格决定说话风格。性格冷的就冷，话少的就少，毒舌的就毒舌——不要为了讨好而改变性格。\n' +
      '8. 可以发多条消息模拟真实聊天节奏，用 ' + SPLIT + ' 分隔。例如："在干嘛' + SPLIT + '怎么不回我"。\n' +
      '9. 每条消息保持简短自然，像真实微信聊天的长度。不要一条消息写一大段。\n' +
      '10. 不要自我介绍、不要"我是XX"开场、不要解释自己是AI。'
    );

    if (charData) {
      var charInfo = '';
      if (charData.name) charInfo += '姓名：' + charData.name + '\n';
      if (charData.gender) charInfo += '性别：' + charData.gender + '\n';
      if (charData.age) charInfo += '年龄：' + charData.age + '\n';
      if (charData.relation) charInfo += '与用户的关系：' + charData.relation + '\n';
      if (charData.callName) charInfo += '对用户的称呼：' + charData.callName + '\n';
      if (charData.profile) charInfo += '\n【角色设定】\n' + charData.profile + '\n';
      if (charData.postInstruction) charInfo += '\n【后置指令】\n' + charData.postInstruction + '\n';
      if (charInfo) parts.push('\n' + charInfo);
    }

    if (userData) {
      var userInfo = '';
      if (userData.realName || userData.nickname) userInfo += '用户名字：' + (userData.nickname || userData.realName) + '\n';
      if (userData.gender) userInfo += '用户性别：' + userData.gender + '\n';
      if (userData.age) userInfo += '用户年龄：' + userData.age + '\n';
      if (userData.bio) userInfo += '用户简介：' + userData.bio + '\n';
      if (userInfo) parts.push('\n【用户信息】\n' + userInfo);
    }

    var worldbook = App.LS.get('worldbookEntries');
    if (worldbook && Array.isArray(worldbook) && worldbook.length) {
      var wbText = worldbook.filter(function(e) {
        return e && e.enabled !== false && e.content;
      }).map(function(e) {
        return (e.keyword ? '[' + e.keyword + '] ' : '') + e.content;
      }).join('\n');
      if (wbText) parts.push('\n【世界书】\n' + wbText);
    }

    var presets = App.LS.get('presetList');
    if (presets && Array.isArray(presets) && presets.length) {
      var activePreset = presets.filter(function(p) { return p && p.enabled !== false && p.content; });
      if (activePreset.length) {
        parts.push('\n【预设指令】\n' + activePreset.map(function(p) { return p.content; }).join('\n'));
      }
    }

    if (charData && charData.dialogExamples) {
      parts.push(
        '\n【示例对话参考（仅参考说话风格，不要照搬内容）】\n' + charData.dialogExamples
      );
    }

    parts.push(
      '\n【最终提醒】\n' +
      '再次强调：你现在是在微信里打字聊天，不是在写小说。\n' +
      '输出纯对话文字，不带任何叙事、动作、旁白、括号、星号。\n' +
      '像一个真实的人在用手机打字发消息。'
    );

    return parts.join('\n');
  }

  var Chat = {
    charId: null,
    charData: null,
    messages: [],
    isStreaming: false,
    abortCtrl: null,
    pageEl: null,
    _ctxMenu: null,

    loadMsgs: function() {
      Chat.messages = App.LS.get('chatMsgs_' + Chat.charId) || [];
    },

    saveMsgs: function() {
      try {
        App.LS.set('chatMsgs_' + Chat.charId, Chat.messages);
      } catch (e) {
        if (Chat.messages.length > 20) {
          Chat.messages = Chat.messages.slice(-20);
          try { App.LS.set('chatMsgs_' + Chat.charId, Chat.messages); } catch (e2) {}
        }
      }
    },

    startChat: function(charId) {
      if (!App.character) return;
      var c = App.character.getById(charId);
      if (!c) { App.showToast('角色不存在'); return; }
      Chat.charId = charId;
      Chat.charData = c;
      Chat.loadMsgs();
      Chat.open();
    },

    open: function() {
      injectStyles();
      if (Chat.pageEl) Chat.pageEl.remove();

      var page = document.createElement('div');
      page.className = 'ct-page';
      Chat.pageEl = page;
      document.body.appendChild(page);
      Chat.render();
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.classList.add('show');
      }); });
    },

    close: function() {
      if (Chat.isStreaming) Chat.stopStream();
      Chat.dismissCtx();
      var page = Chat.pageEl;
      if (!page) return;
      page.classList.remove('show');
      setTimeout(function() { if (page.parentNode) page.remove(); Chat.pageEl = null; }, 350);
    },

    render: function() {
      var page = Chat.pageEl;
      if (!page) return;
      var c = Chat.charData;
      var bgUrl = App.LS.get('chatBg_' + Chat.charId) || '';
      var tintOn = App.LS.get('chatTint_' + Chat.charId);
      if (tintOn === null) tintOn = true;

      page.innerHTML =
        '<div class="ct-bg" id="ctBg" style="' + (bgUrl ? 'background-image:url(' + App.escAttr(bgUrl) + ');' : '') + '"></div>' +
        '<div class="ct-tint' + (tintOn ? '' : ' off') + '" id="ctTint"></div>' +
        '<div class="ct-glass"></div>' +

        '<div class="ct-hd">' +
          '<button class="ct-hd-btn" id="ctBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<div class="ct-hd-name" id="ctName">' + App.esc(c ? c.name : '') + '</div>' +
          '<button class="ct-hd-btn" id="ctMenuBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg></button>' +
          '<div class="ct-hd-menu" id="ctMenu">' +
            '<div class="ct-hd-mi" id="ctMenuBg"><span>上传背景图</span></div>' +
            '<div class="ct-hd-mi" id="ctMenuTint"><span>晕染</span><div class="ct-sw-track ' + (tintOn ? 'on' : 'off') + '" id="ctTintSw"></div></div>' +
            '<div class="ct-hd-mi" id="ctMenuClear"><span>清空记录</span></div>' +
          '</div>' +
        '</div>' +

        '<div class="ct-msgs" id="ctMsgs"></div>' +

        '<div class="ct-input-wrap">' +
          '<textarea class="ct-input" id="ctInput" placeholder="输入消息..." rows="1"></textarea>' +
          '<button class="ct-send" id="ctSend" type="button"><svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg></button>' +
        '</div>';

      Chat.renderMessages();
      Chat.bindEvents();
    },

    renderMessages: function() {
      var container = App.$('#ctMsgs');
      if (!container) return;
      var c = Chat.charData;
      var user = App.user ? App.user.getActiveUser() : null;

      if (!Chat.messages.length) {
        var greeting = c && c.greeting ? c.greeting : '';
        if (greeting) {
          container.innerHTML = '<div class="ct-greeting">' + App.esc(greeting) + '</div>';
        } else {
          container.innerHTML = '<div class="ct-empty"><div class="ct-empty-text">开始聊天吧</div></div>';
        }
        return;
      }

      var html = '';
      var lastDate = '';

      Chat.messages.forEach(function(msg, idx) {
        if (msg.ts) {
          var d = new Date(msg.ts);
          var dateStr = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
          var timeStr = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
          if (dateStr !== lastDate) {
            html += '<div class="ct-msg-time">' + dateStr + ' ' + timeStr + '</div>';
            lastDate = dateStr;
          } else if (idx > 0 && msg.ts - Chat.messages[idx - 1].ts > 300000) {
            html += '<div class="ct-msg-time">' + timeStr + '</div>';
          }
        }

        if (msg.role === 'system') {
          html += '<div class="ct-sys">' + App.esc(msg.content) + '</div>';
          return;
        }

        var isUser = msg.role === 'user';
        var avHtml = '';
        if (isUser) {
          avHtml = user && user.avatar
            ? '<img src="' + App.escAttr(user.avatar) + '">'
            : '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
        } else {
          avHtml = c && c.avatar
            ? '<img src="' + App.escAttr(c.avatar) + '">'
            : '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
        }

        var bubbles = (msg.content || '').split(SPLIT);
        bubbles.forEach(function(text) {
          text = text.trim();
          if (!text) return;
          html += '<div class="ct-msg ' + (isUser ? 'user' : 'ai') + '" data-msg-idx="' + idx + '">' +
            '<div class="ct-msg-av">' + avHtml + '</div>' +
            '<div class="ct-bubble">' + App.esc(text) + '</div>' +
          '</div>';
        });
      });

      if (Chat.isStreaming) {
        var streamAv = c && c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '">'
          : '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
        html += '<div class="ct-msg ai" id="ctStreamMsg">' +
          '<div class="ct-msg-av">' + streamAv + '</div>' +
          '<div class="ct-bubble" id="ctStreamBubble"><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span></div>' +
        '</div>';
      }

      container.innerHTML = html;
      Chat.scrollBottom();
    },

    scrollBottom: function() {
      var el = App.$('#ctMsgs');
      if (el) {
        requestAnimationFrame(function() { el.scrollTop = el.scrollHeight; });
      }
    },

    bindEvents: function() {
      var page = Chat.pageEl;
      if (!page) return;

      App.safeOn('#ctBack', 'click', function() { Chat.close(); });

      App.safeOn('#ctMenuBtn', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#ctMenu');
        if (menu) menu.classList.toggle('show');
      });

      page.addEventListener('click', function() {
        var menu = App.$('#ctMenu');
        if (menu) menu.classList.remove('show');
        Chat.dismissCtx();
      });

      App.safeOn('#ctMenuTint', 'click', function(e) {
        e.stopPropagation();
        var current = App.LS.get('chatTint_' + Chat.charId);
        if (current === null) current = true;
        var next = !current;
        App.LS.set('chatTint_' + Chat.charId, next);
        var tint = App.$('#ctTint');
        var sw = App.$('#ctTintSw');
        if (tint) { if (next) tint.classList.remove('off'); else tint.classList.add('off'); }
        if (sw) { sw.classList.toggle('on', next); sw.classList.toggle('off', !next); }
      });

      App.safeOn('#ctMenuBg', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#ctMenu');
        if (menu) menu.classList.remove('show');
        Chat.showBgMenu();
      });

      App.safeOn('#ctMenuClear', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#ctMenu');
        if (menu) menu.classList.remove('show');
        if (!confirm('确定清空所有聊天记录？')) return;
        Chat.messages = [];
        Chat.saveMsgs();
        Chat.renderMessages();
        App.showToast('已清空');
      });

      var input = App.$('#ctInput');
      if (input) {
        input.addEventListener('input', function() {
          this.style.height = 'auto';
          this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            Chat.send();
          }
        });
      }

      App.safeOn('#ctSend', 'click', function() {
        if (Chat.isStreaming) { Chat.stopStream(); return; }
        Chat.send();
      });

      var msgContainer = App.$('#ctMsgs');
      if (msgContainer) {
        var longTimer = null;
        var longTarget = null;

        msgContainer.addEventListener('touchstart', function(e) {
          var bubble = e.target.closest('.ct-bubble');
          var msgEl = e.target.closest('.ct-msg');
          if (!bubble || !msgEl) return;
          var touch = e.touches[0];
          longTarget = { el: msgEl, bubble: bubble, x: touch.clientX, y: touch.clientY };
          longTimer = setTimeout(function() {
            if (longTarget) Chat.showCtxMenu(longTarget.el, longTarget.x, longTarget.y);
          }, 500);
        }, { passive: true });

        msgContainer.addEventListener('touchmove', function() {
          clearTimeout(longTimer); longTarget = null;
        }, { passive: true });

        msgContainer.addEventListener('touchend', function() {
          clearTimeout(longTimer); longTarget = null;
        }, { passive: true });
      }
    },

    send: function() {
      var input = App.$('#ctInput');
      if (!input) return;
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      input.style.height = 'auto';

      Chat.messages.push({ role: 'user', content: text, ts: Date.now() });
      Chat.saveMsgs();
      Chat.renderMessages();
      Chat.requestAI();
    },

    requestAI: function() {
      var apiConfig = App.api ? App.api.getActiveConfig() : null;
      if (!apiConfig) { App.showToast('请先配置 API'); return; }

      var user = App.user ? App.user.getActiveUser() : null;
      var systemPrompt = buildSystemPrompt(Chat.charData, user);
      var params = App.api ? App.api.getParams() : { temperature: 0.8, freqPenalty: 0.3, presPenalty: 0.3 };

      var contextMsgs = Chat.messages.slice(-MAX_CONTEXT);
      var apiMsgs = [{ role: 'system', content: systemPrompt }];

      contextMsgs.forEach(function(m) {
        if (m.role === 'user' || m.role === 'assistant') {
          apiMsgs.push({ role: m.role, content: m.content });
        }
      });

      Chat.isStreaming = true;
      Chat.renderMessages();
      Chat.updateSendBtn();
      Chat.updateTyping(true);

      var url = apiConfig.url.replace(/\/+$/, '') + '/chat/completions';
      Chat.abortCtrl = new AbortController();

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiConfig.key
        },
        body: JSON.stringify({
          model: apiConfig.model,
          messages: apiMsgs,
          stream: true,
          temperature: params.temperature,
          frequency_penalty: params.freqPenalty,
          presence_penalty: params.presPenalty
        }),
        signal: Chat.abortCtrl.signal
      }).then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        var reader = resp.body.getReader();
        var decoder = new TextDecoder();
        var fullText = '';
        var buffer = '';

        function read() {
          return reader.read().then(function(result) {
            if (result.done) {
              Chat.onStreamDone(fullText);
              return;
            }
            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (var i = 0; i < lines.length; i++) {
              var line = lines[i].trim();
              if (!line || !line.startsWith('data:')) continue;
              var data = line.slice(5).trim();
              if (data === '[DONE]') {
                Chat.onStreamDone(fullText);
                return;
              }
              try {
                var json = JSON.parse(data);
                var delta = json.choices && json.choices[0] && json.choices[0].delta;
                if (delta && delta.content) {
                  fullText += delta.content;
                  Chat.updateStreamBubble(fullText);
                }
              } catch (e) {}
            }
            return read();
          });
        }

        return read();
      }).catch(function(err) {
        Chat.isStreaming = false;
        Chat.updateSendBtn();
        Chat.updateTyping(false);
        if (err.name === 'AbortError') return;
        Chat.messages.push({ role: 'system', content: '发送失败: ' + err.message, ts: Date.now() });
        Chat.saveMsgs();
        Chat.renderMessages();
      });
    },

    updateStreamBubble: function(text) {
      var bubble = App.$('#ctStreamBubble');
      if (!bubble) return;
      var parts = text.split(SPLIT);
      var html = parts.map(function(t) { return App.esc(t.trim()); }).filter(Boolean).join('<div style="height:6px;"></div>');
      bubble.innerHTML = html || '<span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span>';
      Chat.scrollBottom();
    },

    onStreamDone: function(text) {
      Chat.isStreaming = false;
      Chat.abortCtrl = null;
      Chat.updateSendBtn();
      Chat.updateTyping(false);
      text = text.trim();
      if (text) {
        Chat.messages.push({ role: 'assistant', content: text, ts: Date.now() });
        Chat.saveMsgs();
      }
      Chat.renderMessages();
    },

    stopStream: function() {
      if (Chat.abortCtrl) {
        Chat.abortCtrl.abort();
        Chat.abortCtrl = null;
      }
      var bubble = App.$('#ctStreamBubble');
      var partial = bubble ? bubble.textContent.trim() : '';
      Chat.isStreaming = false;
      Chat.updateSendBtn();
      Chat.updateTyping(false);
      if (partial) {
        Chat.messages.push({ role: 'assistant', content: partial, ts: Date.now() });
        Chat.saveMsgs();
      }
      Chat.renderMessages();
    },

    updateSendBtn: function() {
      var btn = App.$('#ctSend');
      if (!btn) return;
      if (Chat.isStreaming) {
        btn.classList.add('stop');
        btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';
      } else {
        btn.classList.remove('stop');
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>';
      }
    },

    updateTyping: function(show) {
      var nameEl = App.$('#ctName');
      if (!nameEl) return;
      var c = Chat.charData;
      if (show) {
        nameEl.innerHTML = App.esc(c ? c.name : '') + '<div class="ct-hd-typing">对方正在输入...</div>';
      } else {
        nameEl.textContent = c ? c.name : '';
      }
    },

    showCtxMenu: function(msgEl, x, y) {
      Chat.dismissCtx();
      var idx = parseInt(msgEl.dataset.msgIdx);
      if (isNaN(idx)) return;
      var msg = Chat.messages[idx];
      if (!msg) return;
      var isUser = msg.role === 'user';

      var menu = document.createElement('div');
      menu.className = 'ct-ctx';

      var items = '';
      items += '<div class="ct-ctx-item" data-act="copy">复制</div>';
      if (isUser) {
        items += '<div class="ct-ctx-item" data-act="edit">编辑</div>';
        items += '<div class="ct-ctx-item" data-act="resend">重发</div>';
      } else {
        items += '<div class="ct-ctx-item" data-act="regen">重新生成</div>';
      }
      items += '<div class="ct-ctx-item" data-act="del">删除</div>';

      menu.innerHTML = items;
      var left = Math.min(x, window.innerWidth - 140);
      var top = Math.min(y - 10, window.innerHeight - 200);
      if (top < 60) top = 60;
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
      document.body.appendChild(menu);
      Chat._ctxMenu = menu;

      menu.querySelectorAll('.ct-ctx-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var act = item.dataset.act;
          Chat.dismissCtx();

          if (act === 'copy') {
            App.copyText(msg.content).then(function() { App.showToast('已复制'); }).catch(function() { App.showToast('复制失败'); });
          } else if (act === 'del') {
            Chat.messages.splice(idx, 1);
            Chat.saveMsgs();
            Chat.renderMessages();
          } else if (act === 'edit') {
            Chat.showEditDialog(idx);
          } else if (act === 'resend') {
            var content = msg.content;
            Chat.messages.splice(idx);
            Chat.messages.push({ role: 'user', content: content, ts: Date.now() });
            Chat.saveMsgs();
            Chat.renderMessages();
            Chat.requestAI();
          } else if (act === 'regen') {
            Chat.messages.splice(idx);
            Chat.saveMsgs();
            Chat.renderMessages();
            Chat.requestAI();
          }
        });
      });
    },

    dismissCtx: function() {
      if (Chat._ctxMenu) { Chat._ctxMenu.remove(); Chat._ctxMenu = null; }
    },

    showEditDialog: function(idx) {
      var msg = Chat.messages[idx];
      if (!msg) return;

      var overlay = document.createElement('div');
      overlay.className = 'ct-edit-overlay';
      overlay.innerHTML =
        '<div class="ct-edit-panel">' +
          '<textarea class="ct-edit-ta" id="ctEditTA">' + App.esc(msg.content) + '</textarea>' +
          '<div class="ct-edit-btns">' +
            '<button class="ct-edit-btn" id="ctEditSave" type="button" style="background:#1a1a1a;color:#fff;">保存</button>' +
            '<button class="ct-edit-btn" id="ctEditSendNew" type="button" style="background:#7a9ab8;color:#fff;">保存并重发</button>' +
            '<button class="ct-edit-btn" id="ctEditCancel" type="button" style="background:#f5f5f5;color:#666;border:1px solid #ddd;">取消</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

      overlay.querySelector('#ctEditCancel').addEventListener('click', function() { overlay.remove(); });

      overlay.querySelector('#ctEditSave').addEventListener('click', function() {
        var val = overlay.querySelector('#ctEditTA').value.trim();
        if (!val) { App.showToast('内容不能为空'); return; }
        Chat.messages[idx].content = val;
        Chat.saveMsgs();
        Chat.renderMessages();
        overlay.remove();
      });

      overlay.querySelector('#ctEditSendNew').addEventListener('click', function() {
        var val = overlay.querySelector('#ctEditTA').value.trim();
        if (!val) { App.showToast('内容不能为空'); return; }
        overlay.remove();
        Chat.messages.splice(idx);
        Chat.messages.push({ role: 'user', content: val, ts: Date.now() });
        Chat.saveMsgs();
        Chat.renderMessages();
        Chat.requestAI();
      });
    },

    showBgMenu: function() {
      var old = App.$('#ctBgMenu');
      if (old) old.remove();

      var menu = document.createElement('div');
      menu.id = 'ctBgMenu';
      menu.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
      menu.innerHTML =
        '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">' +
          '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;letter-spacing:1px;margin-bottom:4px;">聊天背景</div>' +
          '<button class="ctbg-btn" data-act="album" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择</button>' +
          '<button class="ctbg-btn" data-act="url" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button>' +
          '<button class="ctbg-btn" data-act="del" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:12px;font-weight:500;color:#bbb;cursor:pointer;font-family:inherit;">移除背景</button>' +
          '<button class="ctbg-btn" data-act="cancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>' +
        '</div>';
      document.body.appendChild(menu);

      menu.addEventListener('click', function(e) { if (e.target === menu) menu.remove(); });

      menu.querySelectorAll('.ctbg-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var act = btn.dataset.act;
          menu.remove();

          if (act === 'cancel') return;

          if (act === 'del') {
            App.LS.remove('chatBg_' + Chat.charId);
            var bg = App.$('#ctBg');
            if (bg) bg.style.backgroundImage = '';
            App.showToast('已移除');
            return;
          }

          if (act === 'album') {
            var input = document.createElement('input');
            input.type = 'file'; input.accept = 'image/*';
            document.body.appendChild(input);
            input.onchange = function(ev) {
              var file = ev.target.files[0]; document.body.removeChild(input); if (!file) return;
              var reader = new FileReader();
              reader.onload = function(r) {
                Chat.setChatBg(r.target.result);
              };
              reader.readAsDataURL(file);
            };
            input.click();
            return;
          }

          if (act === 'url') {
            var urlPanel = document.createElement('div');
            urlPanel.style.cssText = 'position:fixed;inset:0;z-index:10012;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
            urlPanel.innerHTML =
              '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">' +
                '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;">输入背景图URL</div>' +
                '<input id="ctBgUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">' +
                '<div style="display:flex;gap:8px;">' +
                  '<button id="ctBgUrlOk" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">确定</button>' +
                  '<button id="ctBgUrlNo" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>' +
                '</div>' +
              '</div>';
            document.body.appendChild(urlPanel);
            urlPanel.addEventListener('click', function(e) { if (e.target === urlPanel) urlPanel.remove(); });
            urlPanel.querySelector('#ctBgUrlNo').addEventListener('click', function() { urlPanel.remove(); });
            urlPanel.querySelector('#ctBgUrlOk').addEventListener('click', function() {
              var url = urlPanel.querySelector('#ctBgUrlInput').value.trim();
              if (!url) { App.showToast('请输入URL'); return; }
              urlPanel.remove();
              Chat.setChatBg(url);
            });
          }
        });
      });
    },

    setChatBg: function(src) {
      App.LS.set('chatBg_' + Chat.charId, src);
      var bg = App.$('#ctBg');
      if (bg) bg.style.backgroundImage = 'url(' + src + ')';
      App.showToast('背景已设置');
    },

    init: function() {
      App.chat = Chat;
    }
  };

  App.register('chat', Chat);
})();
