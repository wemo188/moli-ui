
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var SPLIT = '|||';
  var MAX_CONTEXT = 40;
  var STYLE_ID = 'chatStyles';
  var MAX_BG_SIZE = 800;
  var BG_QUALITY = 0.7;

  function injectStyles() {
    if (App.$('#' + STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '.ct-root{position:relative;display:flex;flex-direction:column;width:100%;height:100%;overflow:hidden;background:transparent;-webkit-touch-callout:none;}' +
      '.ct-bg{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;pointer-events:none;}' +
      '.ct-tint{position:absolute;inset:-30%;z-index:1;pointer-events:none;transition:opacity .3s;}' +
      '.ct-tint.off{opacity:0;}' +
      '.ct-no-bg{position:absolute;inset:0;z-index:0;pointer-events:none;background:#fff;}' +
      '.ct-no-bg.has-bg{background:transparent;}' +
      '.ct-glass{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.35),transparent 42%),linear-gradient(315deg,rgba(255,255,255,.15),transparent 44%);mix-blend-mode:screen;opacity:.5;}' +
      '.ct-hd{position:relative;z-index:10;display:flex;align-items:center;padding:14px 14px 10px;flex-shrink:0;gap:8px;}' +
      '.ct-hd-btn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;flex-shrink:0;}' +
      '.ct-hd-btn svg{width:20px;height:20px;fill:none;stroke:#5a7a9a;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
      '.ct-hd-name{flex:1;text-align:center;font-size:16px;font-weight:700;color:#2e4258;letter-spacing:.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.ct-hd-typing{font-size:11px;color:#8aa0b8;font-weight:400;letter-spacing:0;}' +
      '.ct-msgs{position:relative;z-index:5;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 14px 14px;min-height:0;}' +
      '.ct-msg{display:flex;align-items:flex-start;gap:8px;margin-bottom:2px;max-width:100%;}' +
      '.ct-msg.user{flex-direction:row-reverse;}' +
      '.ct-msg-av{width:38px;height:38px;border-radius:8px;flex-shrink:0;overflow:hidden;background:rgba(202,223,242,.15);border:1px solid rgba(192,206,220,.5);}' +
      '.ct-msg-av img{width:100%;height:100%;object-fit:cover;display:block;}' +
      '.ct-msg-av svg{width:18px;height:18px;margin:10px;stroke:#a8c0d8;fill:none;stroke-width:1.5;}' +
      '.ct-bubble-wrap{max-width:72%;display:flex;flex-direction:column;}' +
      '.ct-bubble{padding:9px 13px;border-radius:14px;font-size:14px;line-height:1.6;word-break:break-word;position:relative;white-space:pre-wrap;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}' +
      '.ct-msg.ai .ct-bubble{background:rgba(255,255,255,.82);color:#2e4258;border:1px solid rgba(200,220,240,.35);border-top-left-radius:4px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}' +
      '.ct-msg.user .ct-bubble{background:rgba(126,163,201,.8);color:#fff;border-top-right-radius:4px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}' +
      '.ct-msg-meta{display:flex;align-items:center;gap:4px;padding:2px 4px 6px;font-size:10px;color:#a8c0d8;letter-spacing:.3px;}' +
      '.ct-msg.user .ct-msg-meta{flex-direction:row-reverse;}' +
      '.ct-msg-read{color:#7a9ab8;font-weight:500;}' +
      '.ct-msg-time-sep{font-size:10px;color:#a8c0d8;text-align:center;margin:12px 0 6px;letter-spacing:.5px;}' +
      '.ct-sys{text-align:center;font-size:11px;color:#a8c0d8;margin:10px 20px;letter-spacing:.5px;}' +
      '.ct-input-wrap{position:relative;z-index:10;display:flex;align-items:flex-end;gap:8px;padding:8px 14px 10px;background:rgba(255,255,255,.65);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(200,220,240,.2);flex-shrink:0;}' +
      '.ct-input{flex:1;min-height:36px;max-height:100px;padding:8px 14px;border:1px solid rgba(200,220,240,.4);border-radius:20px;background:rgba(255,255,255,.9);font-size:14px;color:#2e4258;outline:none;resize:none;line-height:1.5;font-family:inherit;overflow-y:auto;-webkit-user-select:text;user-select:text;}' +
      '.ct-input:focus{border-color:rgba(126,163,201,.6);}' +
      '.ct-send{width:36px;height:36px;border-radius:50%;background:rgba(126,163,201,.85);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;transition:opacity .15s;}' +
      '.ct-send:active{opacity:.7;}' +
      '.ct-send svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
      '.ct-send.stop{background:rgba(201,112,107,.85);}' +
      '.ct-ctx{position:fixed;z-index:100020;background:#000;border-radius:10px;padding:4px 0;box-shadow:0 6px 24px rgba(0,0,0,.25);min-width:120px;}' +
      '.ct-ctx-item{padding:10px 16px;font-size:13px;color:rgba(255,255,255,.85);cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;}' +
      '.ct-ctx-item:active{background:rgba(255,255,255,.1);}' +
      '.ct-ctx-item:not(:last-child){border-bottom:1px solid rgba(255,255,255,.08);}' +
      '.ct-greeting{text-align:center;padding:20px 30px;font-size:13px;color:#7a9ab8;line-height:1.7;letter-spacing:.3px;}' +
      '.ct-empty-text{font-size:12px;color:#a8c0d8;text-align:center;padding:60px 20px;}' +
      '@keyframes ctDots{0%,80%,100%{opacity:.3}40%{opacity:1}}.ct-typing-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#8aa0b8;margin:0 2px;animation:ctDots 1.2s infinite;}.ct-typing-dot:nth-child(2){animation-delay:.2s;}.ct-typing-dot:nth-child(3){animation-delay:.4s;}' +
      '.ct-edit-overlay{position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;}' +
      '.ct-edit-panel{background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:18px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);}' +
      '.ct-edit-ta{width:100%;min-height:80px;border:1.5px solid #ddd;border-radius:10px;padding:10px 12px;font-size:14px;color:#333;outline:none;resize:vertical;font-family:inherit;line-height:1.5;box-sizing:border-box;-webkit-user-select:text;user-select:text;}' +
      '.ct-edit-btns{display:flex;gap:8px;margin-top:12px;}' +
      '.ct-edit-btn{flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}' +
      '.ct-scene-overlay{position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;}' +
      '.ct-scene-panel{background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:18px;width:290px;box-shadow:0 8px 30px rgba(0,0,0,.15);}' +
      '.ct-scene-ta{width:100%;min-height:100px;border:1.5px solid #ddd;border-radius:10px;padding:10px 12px;font-size:13px;color:#333;outline:none;resize:vertical;font-family:inherit;line-height:1.6;box-sizing:border-box;-webkit-user-select:text;user-select:text;}' +
      '.ct-hd-menu{position:fixed;z-index:100020;background:#000;border-radius:12px;padding:6px 0;box-shadow:0 8px 30px rgba(0,0,0,.25);min-width:170px;opacity:0;transform:scale(.9) translateY(-8px);transform-origin:top right;transition:opacity .18s,transform .18s;pointer-events:none;}' +
      '.ct-hd-menu.show{opacity:1;transform:scale(1) translateY(0);pointer-events:auto;}' +
      '.ct-hd-mi{display:flex;align-items:center;justify-content:space-between;padding:11px 16px;cursor:pointer;transition:background .15s;-webkit-tap-highlight-color:transparent;}' +
      '.ct-hd-mi:active{background:rgba(255,255,255,.1);}' +
      '.ct-hd-mi:not(:last-child){border-bottom:1px solid rgba(255,255,255,.08);}' +
      '.ct-hd-mi span{font-size:13px;color:rgba(255,255,255,.85);font-weight:500;}' +
      '.ct-hd-mi .ct-sw-track{width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}' +
      '.ct-hd-mi .ct-sw-track.on{background:rgba(126,163,201,.9);}' +
      '.ct-hd-mi .ct-sw-track.off{background:rgba(255,255,255,.2);}' +
      '.ct-hd-mi .ct-sw-track::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;}' +
      '.ct-hd-mi .ct-sw-track.on::after{transform:translateX(16px);}';
    document.head.appendChild(s);
  }

  function compressImage(dataUrl, maxSize, quality, cb) {
    var img = new Image();
    img.onload = function() {
      var w = img.width, h = img.height;
      if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize; } }
      else { if (h > maxSize) { w = w * maxSize / h; h = maxSize; } }
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function buildSystemPrompt(charData, userData, sceneText) {
    var parts = [];
    parts.push(
      '你正在微信里和用户聊天。你扮演的角色信息如下。\n\n' +
      '【最高优先级规则】\n' +
      '1. 你的回复必须是纯聊天对话，就像真人发微信。\n' +
      '2. 绝对禁止任何叙事描写：不写动作（"他笑了""她叹气"）、不写心理活动、不写环境描写、不用 *星号* 或 (括号) 包裹旁白。\n' +
      '3. 绝对禁止八股文式回复和网文模板。\n' +
      '4. 绝对禁止油腻、霸总、超雄、舔狗式表达。\n' +
      '5. 说话要像真人：口语化、自然、有个性。\n' +
      '6. 认真理解用户每条消息的真实意图，猜测用户真正想要的回答。不要敷衍。\n' +
      '7. 根据角色性格决定说话风格。性格冷的就冷，话少的就少，毒舌的就毒舌。\n' +
      '8. 可以发多条消息模拟真实聊天节奏，用 ' + SPLIT + ' 分隔。\n' +
      '9. 每条消息保持简短自然。\n' +
      '10. 不要自我介绍、不要解释自己是AI。'
    );
    if (charData) {
      var ci = '';
      if (charData.name) ci += '姓名：' + charData.name + '\n';
      if (charData.gender) ci += '性别：' + charData.gender + '\n';
      if (charData.age) ci += '年龄：' + charData.age + '\n';
      if (charData.relation) ci += '与用户的关系：' + charData.relation + '\n';
      if (charData.callName) ci += '对用户的称呼：' + charData.callName + '\n';
      if (charData.profile) ci += '\n【角色设定】\n' + charData.profile + '\n';
      if (charData.postInstruction) ci += '\n【后置指令】\n' + charData.postInstruction + '\n';
      if (ci) parts.push('\n' + ci);
    }
    if (userData) {
      var ui = '';
      if (userData.realName || userData.nickname) ui += '用户名字：' + (userData.nickname || userData.realName) + '\n';
      if (userData.gender) ui += '用户性别：' + userData.gender + '\n';
      if (userData.age) ui += '用户年龄：' + userData.age + '\n';
      if (userData.bio) ui += '用户简介：' + userData.bio + '\n';
      if (ui) parts.push('\n【用户信息】\n' + ui);
    }
    if (sceneText) parts.push('\n【当前场景/时间线】\n' + sceneText);
    var wb = App.LS.get('worldbookEntries');
    if (wb && Array.isArray(wb) && wb.length) {
      var wt = wb.filter(function(e) { return e && e.enabled !== false && e.content; })
        .map(function(e) { return (e.keyword ? '[' + e.keyword + '] ' : '') + e.content; }).join('\n');
      if (wt) parts.push('\n【世界书】\n' + wt);
    }
    var presets = App.LS.get('presetList');
    if (presets && Array.isArray(presets) && presets.length) {
      var ap = presets.filter(function(p) { return p && p.enabled !== false && p.content; });
      if (ap.length) parts.push('\n【预设指令】\n' + ap.map(function(p) { return p.content; }).join('\n'));
    }
    if (charData && charData.dialogExamples) {
      parts.push('\n【示例对话参考（仅参考说话风格，不照搬内容）】\n' + charData.dialogExamples);
    }
    parts.push('\n【最终提醒】\n你在微信里打字聊天，不是写小说。输出纯对话文字。');
    return parts.join('\n');
  }

  var Chat = {
    charId: null,
    charData: null,
    messages: [],
    isStreaming: false,
    abortCtrl: null,
    _ctxMenu: null,
    _menuEl: null,
    _proTimer: null,

    loadMsgs: function() { Chat.messages = App.LS.get('chatMsgs_' + Chat.charId) || []; },
    saveMsgs: function() {
      try { App.LS.set('chatMsgs_' + Chat.charId, Chat.messages); }
      catch(e) { if (Chat.messages.length > 20) { Chat.messages = Chat.messages.slice(-20); try { App.LS.set('chatMsgs_' + Chat.charId, Chat.messages); } catch(e2){} } }
    },

    openInWechat: function(charId) {
      if (!App.character) return;
      var c = App.character.getById(charId);
      if (!c) { App.showToast('角色不存在'); return; }
      Chat.charId = charId;
      Chat.charData = c;
      Chat.loadMsgs();
      injectStyles();

      var inner = App.$('#wxInner');
      if (!inner) return;
      if (App.wechat) App.wechat._savedInner = inner.innerHTML;

      var bgUrl = App.LS.get('chatBg_' + charId) || '';
      var tintOn = App.LS.get('chatTint_' + charId);
      if (tintOn === null) tintOn = true;
      var hasBg = !!bgUrl;

      var tintStyle = 'background:' +
        'radial-gradient(ellipse at 50% 40%, rgba(126,163,201,.65) 0%, rgba(126,163,201,.40) 25%, rgba(140,180,215,.25) 45%, transparent 70%),' +
        'radial-gradient(ellipse at 30% 60%, rgba(100,150,200,.35) 0%, transparent 55%),' +
        'radial-gradient(ellipse at 70% 30%, rgba(160,195,225,.30) 0%, transparent 50%),' +
        'radial-gradient(ellipse at 50% 80%, rgba(126,163,201,.20) 0%, transparent 60%);';

      inner.innerHTML =
        '<div class="ct-root" id="ctRoot">' +
          '<div class="ct-no-bg' + (hasBg ? ' has-bg' : '') + '" id="ctNoBg"></div>' +
          '<div class="ct-bg" id="ctBg" style="' + (bgUrl ? 'background-image:url(' + App.escAttr(bgUrl) + ');' : '') + '"></div>' +
          '<div class="ct-tint' + (tintOn ? '' : ' off') + '" id="ctTint" style="' + tintStyle + '"></div>' +
          '<div class="ct-glass"></div>' +
          '<div class="ct-hd">' +
            '<button class="ct-hd-btn" id="ctBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
            '<div class="ct-hd-name" id="ctName">' + App.esc(c.name || '') + '</div>' +
            '<button class="ct-hd-btn" id="ctMenuBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg></button>' +
          '</div>' +
          '<div class="ct-msgs" id="ctMsgs"></div>' +
          '<div class="ct-input-wrap">' +
            '<textarea class="ct-input" id="ctInput" placeholder="输入消息..." rows="1"></textarea>' +
            '<button class="ct-send" id="ctSend" type="button"><svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg></button>' +
          '</div>' +
        '</div>';

      Chat.renderMessages();
      Chat.bindEvents();
      Chat.startProactive();
    },

    close: function() {
      if (Chat.isStreaming) Chat.stopStream();
      Chat.dismissCtx();
      Chat.dismissMenu();
      Chat.stopProactive();
      if (App.wechat) App.wechat.restoreInner();
    },

    renderMessages: function() {
      var container = App.$('#ctMsgs');
      if (!container) return;
      var c = Chat.charData;
      var user = App.user ? App.user.getActiveUser() : null;

      if (!Chat.messages.length) {
        var greeting = c && c.greeting ? c.greeting : '';
        container.innerHTML = greeting
          ? '<div class="ct-greeting">' + App.esc(greeting) + '</div>'
          : '<div class="ct-empty-text">开始聊天吧</div>';
        return;
      }

      var html = '';
      var lastDate = '';

      Chat.messages.forEach(function(msg, idx) {
        if (msg.ts) {
          var d = new Date(msg.ts);
          var ds = d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate();
          var ts = fmtTime(msg.ts);
          if (ds !== lastDate) { html += '<div class="ct-msg-time-sep">' + ds + ' ' + ts + '</div>'; lastDate = ds; }
          else if (idx > 0 && msg.ts - Chat.messages[idx-1].ts > 300000) { html += '<div class="ct-msg-time-sep">' + ts + '</div>'; }
        }
        if (msg.role === 'system') { html += '<div class="ct-sys">' + App.esc(msg.content) + '</div>'; return; }

        var isUser = msg.role === 'user';
        var av = '';
        if (isUser) { av = user && user.avatar ? '<img src="'+App.escAttr(user.avatar)+'">' : '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>'; }
        else { av = c && c.avatar ? '<img src="'+App.escAttr(c.avatar)+'">' : '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>'; }

        var timeStr = msg.ts ? fmtTime(msg.ts) : '';

        var bubbles = (msg.content || '').split(SPLIT);
        bubbles.forEach(function(text, bIdx) {
          text = text.trim(); if (!text) return;
          var isLast = bIdx === bubbles.length - 1;
          var metaHtml = '';
          if (isLast) {
            if (isUser) {
              metaHtml = '<div class="ct-msg-meta"><span class="ct-msg-read">已读</span><span>' + timeStr + '</span></div>';
            } else {
              metaHtml = '<div class="ct-msg-meta"><span>' + timeStr + '</span></div>';
            }
          }
          html += '<div class="ct-msg ' + (isUser?'user':'ai') + '" data-msg-idx="' + idx + '">' +
            '<div class="ct-msg-av">' + av + '</div>' +
            '<div class="ct-bubble-wrap">' +
              '<div class="ct-bubble">' + App.esc(text) + '</div>' +
              metaHtml +
            '</div>' +
          '</div>';
        });
      });

      if (Chat.isStreaming) {
        var sav = c && c.avatar ? '<img src="'+App.escAttr(c.avatar)+'">' : '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
        html += '<div class="ct-msg ai" id="ctStreamMsg"><div class="ct-msg-av">' + sav + '</div><div class="ct-bubble-wrap"><div class="ct-bubble" id="ctStreamBubble"><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span></div></div></div>';
      }

      container.innerHTML = html;
      Chat.scrollBottom();
    },

    scrollBottom: function() {
      var el = App.$('#ctMsgs');
      if (el) requestAnimationFrame(function() { el.scrollTop = el.scrollHeight; });
    },

    bindEvents: function() {
      App.safeOn('#ctBack', 'click', function() { Chat.close(); });

      App.safeOn('#ctMenuBtn', 'click', function(e) {
        e.stopPropagation();
        if (Chat._menuEl) { Chat.dismissMenu(); return; }
        Chat.showMenu();
      });

      var root = App.$('#ctRoot');
      if (root) root.addEventListener('click', function() {
        Chat.dismissMenu();
        Chat.dismissCtx();
      });

      var input = App.$('#ctInput');
      if (input) {
        input.addEventListener('input', function() {
          this.style.height = 'auto';
          this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); Chat.send(); }
        });
      }

      App.safeOn('#ctSend', 'click', function() {
        if (Chat.isStreaming) { Chat.stopStream(); return; }
        Chat.send();
      });

      var mc = App.$('#ctMsgs');
      if (mc) {
        var lt = null, lTarget = null, moved = false;
        mc.addEventListener('touchstart', function(e) {
          var b = e.target.closest('.ct-bubble'), m = e.target.closest('.ct-msg');
          if (!b || !m) return;
          moved = false;
          var t = e.touches[0];
          lTarget = { el: m, x: t.clientX, y: t.clientY };
          lt = setTimeout(function() { if (lTarget && !moved) Chat.showCtxMenu(lTarget.el, lTarget.x, lTarget.y); }, 500);
        }, { passive: true });
        mc.addEventListener('touchmove', function(e) {
          moved = true; clearTimeout(lt); lTarget = null;
        }, { passive: true });
        mc.addEventListener('touchend', function(e) {
          clearTimeout(lt);
          if (lTarget && !moved) { /* short tap, do nothing */ }
          lTarget = null;
        }, { passive: true });
      }
    },

    showMenu: function() {
      Chat.dismissMenu();
      var tintOn = App.LS.get('chatTint_' + Chat.charId);
      if (tintOn === null) tintOn = true;

      var menu = document.createElement('div');
      menu.className = 'ct-hd-menu show';
      menu.innerHTML =
        '<div class="ct-hd-mi" data-act="bg"><span>上传背景图</span></div>' +
        '<div class="ct-hd-mi" data-act="tint"><span>晕染</span><div class="ct-sw-track ' + (tintOn ? 'on' : 'off') + '" id="ctTintSw"></div></div>' +
        '<div class="ct-hd-mi" data-act="scene"><span>场景/时间线</span></div>' +
        '<div class="ct-hd-mi" data-act="clear"><span>清空记录</span></div>';

      var btn = App.$('#ctMenuBtn');
      if (btn) {
        var rect = btn.getBoundingClientRect();
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.right = (window.innerWidth - rect.right) + 'px';
      }
      document.body.appendChild(menu);
      Chat._menuEl = menu;

      menu.addEventListener('click', function(e) { e.stopPropagation(); });

      menu.querySelectorAll('.ct-hd-mi').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var act = item.dataset.act;
          if (act === 'tint') {
            var cur = App.LS.get('chatTint_' + Chat.charId);
            if (cur === null) cur = true;
            var next = !cur;
            App.LS.set('chatTint_' + Chat.charId, next);
            var tint = App.$('#ctTint');
            var sw = App.$('#ctTintSw');
            if (tint) { if (next) tint.classList.remove('off'); else tint.classList.add('off'); }
            if (sw) { sw.classList.toggle('on', next); sw.classList.toggle('off', !next); }
            return;
          }
          Chat.dismissMenu();
          if (act === 'bg') Chat.showBgMenu();
          else if (act === 'scene') Chat.showSceneDialog();
          else if (act === 'clear') {
            if (!confirm('确定清空所有聊天记录？')) return;
            Chat.messages = [];
            Chat.saveMsgs();
            Chat.renderMessages();
            App.showToast('已清空');
          }
        });
      });
    },

    dismissMenu: function() {
      if (Chat._menuEl) { Chat._menuEl.remove(); Chat._menuEl = null; }
    },

    send: function() {
      var input = App.$('#ctInput');
      if (!input) return;
      var text = input.value.trim();
      if (!text) return;
      input.value = ''; input.style.height = 'auto';
      Chat.messages.push({ role: 'user', content: text, ts: Date.now() });
      Chat.saveMsgs();
      Chat.renderMessages();
      Chat.requestAI();
      Chat.resetProactive();
    },

    requestAI: function() {
      var api = App.api ? App.api.getActiveConfig() : null;
      if (!api) { App.showToast('请先配置 API'); return; }
      var user = App.user ? App.user.getActiveUser() : null;
      var sceneText = App.LS.get('chatScene_' + Chat.charId) || '';
      var sysPrompt = buildSystemPrompt(Chat.charData, user, sceneText);
      var params = App.api ? App.api.getParams() : { temperature: 0.8, freqPenalty: 0.3, presPenalty: 0.3 };

      var ctx = Chat.messages.slice(-MAX_CONTEXT);
      var apiMsgs = [{ role: 'system', content: sysPrompt }];
      ctx.forEach(function(m) {
        if (m.role === 'user' || m.role === 'assistant') {
          apiMsgs.push({ role: m.role, content: m.content });
        }
      });

      Chat.isStreaming = true;
      Chat.renderMessages();
      Chat.updateSendBtn();
      Chat.updateTyping(true);

      var url = api.url.replace(/\/+$/, '') + '/chat/completions';
      Chat.abortCtrl = new AbortController();

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api.key },
        body: JSON.stringify({
          model: api.model, messages: apiMsgs, stream: true,
          temperature: params.temperature,
          frequency_penalty: params.freqPenalty,
          presence_penalty: params.presPenalty
        }),
        signal: Chat.abortCtrl.signal
      }).then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        var reader = resp.body.getReader();
        var decoder = new TextDecoder();
        var fullText = '', buffer = '';
        function read() {
          return reader.read().then(function(result) {
            if (result.done) { Chat.onStreamDone(fullText); return; }
            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (var i = 0; i < lines.length; i++) {
              var line = lines[i].trim();
              if (!line || !line.startsWith('data:')) continue;
              var data = line.slice(5).trim();
              if (data === '[DONE]') { Chat.onStreamDone(fullText); return; }
              try {
                var json = JSON.parse(data);
                var delta = json.choices && json.choices[0] && json.choices[0].delta;
                if (delta && delta.content) { fullText += delta.content; Chat.updateStreamBubble(fullText); }
              } catch(e) {}
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
      if (text) { Chat.messages.push({ role: 'assistant', content: text, ts: Date.now() }); Chat.saveMsgs(); }
      Chat.renderMessages();
    },

    stopStream: function() {
      if (Chat.abortCtrl) { Chat.abortCtrl.abort(); Chat.abortCtrl = null; }
      var bubble = App.$('#ctStreamBubble');
      var partial = bubble ? bubble.textContent.trim() : '';
      Chat.isStreaming = false;
      Chat.updateSendBtn();
      Chat.updateTyping(false);
      if (partial) { Chat.messages.push({ role: 'assistant', content: partial, ts: Date.now() }); Chat.saveMsgs(); }
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
      var el = App.$('#ctName');
      if (!el) return;
      var c = Chat.charData;
      if (show) el.innerHTML = App.esc(c ? c.name : '') + '<div class="ct-hd-typing">对方正在输入...</div>';
      else el.textContent = c ? c.name : '';
    },

    // === 主动发消息 ===
    startProactive: function() {
      Chat.stopProactive();
      var charCfg = null;
      if (App.charMgr) {
        charCfg = App.charMgr.getCharConfig ? App.charMgr.getCharConfig(Chat.charId) : null;
      }
      if (!charCfg) charCfg = (App.charMgr && App.charMgr.globalConfig) ? App.charMgr.globalConfig : null;
      if (!charCfg || !charCfg.proactive) return;

      var minMs = (charCfg.proMinInterval || 15) * 60 * 1000;
      var maxMs = (charCfg.proMaxInterval || 120) * 60 * 1000;

      function schedule() {
        var delay = minMs + Math.random() * (maxMs - minMs);
        Chat._proTimer = setTimeout(function() {
          if (!Chat.charId || Chat.isStreaming) { schedule(); return; }

          var now = new Date();
          var hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
          var start = charCfg.proActiveStart || '00:00';
          var end = charCfg.proActiveEnd || '23:59';
          if (hhmm < start || hhmm > end) { schedule(); return; }

          Chat.requestProactive();
          schedule();
        }, delay);
      }
      schedule();
    },

    stopProactive: function() {
      if (Chat._proTimer) { clearTimeout(Chat._proTimer); Chat._proTimer = null; }
    },

    resetProactive: function() {
      Chat.stopProactive();
      Chat.startProactive();
    },

    requestProactive: function() {
      var api = App.api ? App.api.getActiveConfig() : null;
      if (!api) return;
      var user = App.user ? App.user.getActiveUser() : null;
      var sceneText = App.LS.get('chatScene_' + Chat.charId) || '';
      var sysPrompt = buildSystemPrompt(Chat.charData, user, sceneText);

      var ctx = Chat.messages.slice(-MAX_CONTEXT);
      var apiMsgs = [{ role: 'system', content: sysPrompt }];
      ctx.forEach(function(m) {
        if (m.role === 'user' || m.role === 'assistant') apiMsgs.push({ role: m.role, content: m.content });
      });
      apiMsgs.push({
        role: 'system',
        content: '现在请你主动给用户发一条消息。可以是分享日常、关心问候、想起用户、或者任何符合角色性格的主动联系。不要重复之前说过的话。保持自然简短。'
      });

      var url = api.url.replace(/\/+$/, '') + '/chat/completions';
      var params = App.api ? App.api.getParams() : { temperature: 0.8, freqPenalty: 0.3, presPenalty: 0.3 };

      Chat.isStreaming = true;
      Chat.renderMessages();
      Chat.updateSendBtn();
      Chat.updateTyping(true);
      Chat.abortCtrl = new AbortController();

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api.key },
        body: JSON.stringify({
          model: api.model, messages: apiMsgs, stream: true,
          temperature: params.temperature,
          frequency_penalty: params.freqPenalty,
          presence_penalty: params.presPenalty
        }),
        signal: Chat.abortCtrl.signal
      }).then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        var reader = resp.body.getReader();
        var decoder = new TextDecoder();
        var fullText = '', buffer = '';
        function read() {
          return reader.read().then(function(result) {
            if (result.done) { Chat.onStreamDone(fullText); return; }
            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (var i = 0; i < lines.length; i++) {
              var line = lines[i].trim();
              if (!line || !line.startsWith('data:')) continue;
              var data = line.slice(5).trim();
              if (data === '[DONE]') { Chat.onStreamDone(fullText); return; }
              try {
                var json = JSON.parse(data);
                var delta = json.choices && json.choices[0] && json.choices[0].delta;
                if (delta && delta.content) { fullText += delta.content; Chat.updateStreamBubble(fullText); }
              } catch(e) {}
            }
            return read();
          });
        }
        return read();
      }).catch(function(err) {
        Chat.isStreaming = false;
        Chat.updateSendBtn();
        Chat.updateTyping(false);
        if (err.name !== 'AbortError') console.warn('proactive failed:', err.message);
      });
    },

    // === 长按菜单 ===
    showCtxMenu: function(msgEl, x, y) {
      Chat.dismissCtx();
      var idx = parseInt(msgEl.dataset.msgIdx);
      if (isNaN(idx)) return;
      var msg = Chat.messages[idx];
      if (!msg) return;
      var isUser = msg.role === 'user';

      var menu = document.createElement('div');
      menu.className = 'ct-ctx';
      var items = '<div class="ct-ctx-item" data-act="copy">复制</div>';
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
          if (act === 'copy') { App.copyText(msg.content).then(function() { App.showToast('已复制'); }).catch(function() { App.showToast('复制失败'); }); }
          else if (act === 'del') { Chat.messages.splice(idx, 1); Chat.saveMsgs(); Chat.renderMessages(); }
          else if (act === 'edit') { Chat.showEditDialog(idx); }
          else if (act === 'resend') {
            var content = msg.content;
            Chat.messages.splice(idx);
            Chat.messages.push({ role: 'user', content: content, ts: Date.now() });
            Chat.saveMsgs(); Chat.renderMessages(); Chat.requestAI();
          } else if (act === 'regen') {
            Chat.messages.splice(idx);
            Chat.saveMsgs(); Chat.renderMessages(); Chat.requestAI();
          }
        });
      });
    },

    dismissCtx: function() { if (Chat._ctxMenu) { Chat._ctxMenu.remove(); Chat._ctxMenu = null; } },

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
        Chat.messages[idx].content = val; Chat.saveMsgs(); Chat.renderMessages(); overlay.remove();
      });
      overlay.querySelector('#ctEditSendNew').addEventListener('click', function() {
        var val = overlay.querySelector('#ctEditTA').value.trim();
        if (!val) { App.showToast('内容不能为空'); return; }
        overlay.remove();
        Chat.messages.splice(idx);
        Chat.messages.push({ role: 'user', content: val, ts: Date.now() });
        Chat.saveMsgs(); Chat.renderMessages(); Chat.requestAI();
      });
    },

    showSceneDialog: function() {
      var current = App.LS.get('chatScene_' + Chat.charId) || '';
      var overlay = document.createElement('div');
      overlay.className = 'ct-scene-overlay';
      overlay.innerHTML =
        '<div class="ct-scene-panel">' +
          '<div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;margin-bottom:12px;">当前场景 / 时间线</div>' +
          '<div style="font-size:11px;color:#8aa0b8;margin-bottom:10px;line-height:1.5;">描述当前的时间、地点、剧情背景等。每次发送消息时会自动附带给AI。留空则不启用。</div>' +
          '<textarea class="ct-scene-ta" id="ctSceneTA" placeholder="例如：现在是深夜两点，你刚下班回家...">' + App.esc(current) + '</textarea>' +
          '<div class="ct-edit-btns">' +
            '<button class="ct-edit-btn" id="ctSceneSave" type="button" style="background:#1a1a1a;color:#fff;">保存</button>' +
            '<button class="ct-edit-btn" id="ctSceneClear" type="button" style="background:#f5f5f5;color:#999;border:1px solid #ddd;">清空</button>' +
            '<button class="ct-edit-btn" id="ctSceneCancel" type="button" style="background:#f5f5f5;color:#666;border:1px solid #ddd;">取消</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector('#ctSceneCancel').addEventListener('click', function() { overlay.remove(); });
      overlay.querySelector('#ctSceneClear').addEventListener('click', function() {
        App.LS.remove('chatScene_' + Chat.charId); overlay.remove(); App.showToast('已清空场景');
      });
      overlay.querySelector('#ctSceneSave').addEventListener('click', function() {
        var val = overlay.querySelector('#ctSceneTA').value.trim();
        if (val) App.LS.set('chatScene_' + Chat.charId, val);
        else App.LS.remove('chatScene_' + Chat.charId);
        overlay.remove(); App.showToast('场景已保存');
      });
    },

    showBgMenu: function() {
      var old = App.$('#ctBgMenu'); if (old) old.remove();
      var menu = document.createElement('div');
      menu.id = 'ctBgMenu';
      menu.style.cssText = 'position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
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
            var bg = App.$('#ctBg'); if (bg) bg.style.backgroundImage = '';
            var nb = App.$('#ctNoBg'); if (nb) nb.classList.remove('has-bg');
            App.showToast('已移除'); return;
          }
          if (act === 'album') {
            var input = document.createElement('input');
            input.type = 'file'; input.accept = 'image/*';
            document.body.appendChild(input);
            input.onchange = function(ev) {
              var file = ev.target.files[0]; document.body.removeChild(input); if (!file) return;
              var reader = new FileReader();
              reader.onload = function(r) {
                compressImage(r.target.result, MAX_BG_SIZE, BG_QUALITY, function(compressed) {
                  Chat.setChatBg(compressed);
                });
              };
              reader.readAsDataURL(file);
            };
            input.click(); return;
          }
          if (act === 'url') {
            var urlPanel = document.createElement('div');
            urlPanel.style.cssText = 'position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
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
              urlPanel.remove(); Chat.setChatBg(url);
            });
          }
        });
      });
    },

    setChatBg: function(src) {
      try {
        App.LS.set('chatBg_' + Chat.charId, src);
      } catch(e) {
        App.showToast('图片太大，请使用URL方式');
        return;
      }
      var bg = App.$('#ctBg');
      if (bg) bg.style.backgroundImage = 'url(' + src + ')';
      var nb = App.$('#ctNoBg');
      if (nb) nb.classList.add('has-bg');
      App.showToast('背景已设置');
    },

    init: function() {
      App.chat = Chat;
    }
  };

  App.register('chat', Chat);
})();
