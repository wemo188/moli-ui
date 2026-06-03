
(function(){
'use strict';
var App = window.App;
if (!App) return;

var ChatUI = {
  panelEl: null,
  charId: null,
  charData: null,

  /* ===== 打开聊天内页 ===== */
  open: function(charId, charData) {
    ChatUI.charId = charId;
    ChatUI.charData = charData;

    // 初始化chat模块数据
    if (App.chat) {
      App.chat.charId = charId;
      App.chat.charData = charData;
      App.chat.loadMsgs();
      App.chat.clearUnread(charId);
      App.chat._backgroundMode = false;
      App.chat._sendQueue = [];
      App.chat._isSendingQueue = false;
      App.chat._plusOpen = false;
      App.chat._multiMode = false;
      App.chat._multiSelected = [];
      App.chat._inputIdle = true;
      App.chat._waitingForIdle = false;
      if (App.chat._sendDelayTimer) { clearTimeout(App.chat._sendDelayTimer); App.chat._sendDelayTimer = null; }
      if (App.chat._inputIdleTimer) { clearTimeout(App.chat._inputIdleTimer); App.chat._inputIdleTimer = null; }
    }

    var old = App.$('#ctPanel');
    if (old) old.remove();

    var panel = document.createElement('div');
    panel.id = 'ctPanel';
    panel.className = 'ct-panel';
    document.body.appendChild(panel);
    ChatUI.panelEl = panel;

    ChatUI._buildDOM(panel);
    ChatUI._bindEvents(panel);
    ChatUI.renderMessages();
    ChatUI.scrollBottom();

    // 启动主动消息
    if (App.chat) App.chat.startProactive();

    // 预取角色天气
    if (App.chat && App.chat._utils) {
      var cfg = App.chat._utils.getCfg(charId);
      if (cfg && cfg.timeWeather && cfg.charRealCity) {
        // 触发缓存
        fetch('https://wttr.in/' + encodeURIComponent(cfg.charRealCity) + '?format=j1&lang=zh').catch(function(){});
      }
    }

    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      panel.classList.add('ct-visible');
    }); });

    App.bindSwipeBack(panel, function(){ ChatUI.close(); });

    // 可见性监听
    ChatUI._visHandler = function() {
      if (document.visibilityState === 'visible') ChatUI._onResume();
    };
    document.addEventListener('visibilitychange', ChatUI._visHandler);
  },

  /* ===== 关闭聊天内页 ===== */
  close: function() {
    var p = ChatUI.panelEl;
    if (!p) return;

    if (App.chat) {
      if (App.chat.isStreaming) {
        App.chat._backgroundMode = true;
      } else {
        App.chat.stopProactive();
      }
      App.chat.dismissCtx();
      App.chat.dismissMenu();
      App.chat.dismissAvCard();
      if (App.chat._sendDelayTimer) { clearTimeout(App.chat._sendDelayTimer); App.chat._sendDelayTimer = null; }
      if (App.chat._inputIdleTimer) { clearTimeout(App.chat._inputIdleTimer); App.chat._inputIdleTimer = null; }
    }

    if (ChatUI._visHandler) {
      document.removeEventListener('visibilitychange', ChatUI._visHandler);
      ChatUI._visHandler = null;
    }

    p.classList.remove('ct-visible');
    setTimeout(function(){
      if (p.parentNode) p.remove();
      ChatUI.panelEl = null;
      ChatUI.charId = null;
      ChatUI.charData = null;
    }, 350);

    // 刷新微信列表
    if (App.wechat && App.wechat.panelEl) {
      App.wechat.renderPage();
    }
  },

  _onResume: function() {
    if (!ChatUI.charId || !App.chat) return;
    App.chat.loadMsgs();
    if (!App.chat._backgroundMode) {
      ChatUI.renderMessages();
      return;
    }
    App.chat._backgroundMode = false;
    App.chat.isStreaming = false;
    ChatUI.renderMessages();
    ChatUI.updateSendBtn();
    ChatUI.updateTyping(false);
  },

  /* ===== DOM 结构 ===== */
  _buildDOM: function(panel) {
    var c = ChatUI.charData;
    var name = App.esc((App.wechat ? App.wechat.getCharAlias(c.id) : '') || c.name || '未命名');
    var bgUrl = App.LS.get('chatBg_' + ChatUI.charId) || '';

    panel.innerHTML =
      // 背景
      '<div class="ct-bg" id="ctBg"' + (bgUrl ? ' style="background-image:url(' + App.escAttr(bgUrl) + ')"' : '') + '></div>' +

      // 顶部栏
      '<div class="ct-header">' +
        '<button class="ct-back" id="ctBack" type="button"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>' +
        '<div class="ct-char-name">' + name + '</div>' +
        '<button class="ct-menu-btn" id="ctMenuBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></button>' +
      '</div>' +

      // 正在输入
      '<div class="ct-typing" id="ctTyping">对方正在输入...</div>' +

      // 消息区域
      '<div class="ct-msgs" id="ctMsgs"></div>' +

      // 输入栏
      '<div class="ct-input-wrap" id="ctInputWrap">' +
        '<button class="ct-plus-btn" id="ctPlusBtn" type="button"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' +
        '<textarea class="ct-input" id="ctInput" placeholder="输入消息..." rows="1"></textarea>' +
        '<button class="ct-send-btn ct-send-disabled" id="ctSendBtn" type="button"><svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg></button>' +
        // +号面板
        '<div class="ct-plus-panel" id="ctPlusPanel">' +
          '<div class="ct-plus-item" data-act="scene">' +
            '<div class="ct-plus-item-icon"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></div>' +
            '<div class="ct-plus-item-label">场景</div>' +
          '</div>' +
          '<div class="ct-plus-item" data-act="bg">' +
            '<div class="ct-plus-item-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>' +
            '<div class="ct-plus-item-label">背景</div>' +
          '</div>' +
          '<div class="ct-plus-item" data-act="clear">' +
            '<div class="ct-plus-item-icon"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6l1 14h12l1-14"/></svg></div>' +
            '<div class="ct-plus-item-label">清空</div>' +
          '</div>' +
          '<div class="ct-plus-item" data-act="export">' +
            '<div class="ct-plus-item-icon"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>' +
            '<div class="ct-plus-item-label">导出</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  /* ===== 事件绑定 ===== */
  _bindEvents: function(panel) {
    var self = ChatUI;

    // 返回
    panel.querySelector('#ctBack').addEventListener('click', function(){ self.close(); });

    // 菜单
    panel.querySelector('#ctMenuBtn').addEventListener('click', function(){ self._showTopMenu(); });

    // 输入框自动高度
    var input = panel.querySelector('#ctInput');
    input.addEventListener('input', function(){
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      self.updateSendBtn();

      // 通知chat.js输入框活动
      if (App.chat) {
        App.chat._inputIdle = false;
        App.chat._resetIdleTimer();
      }
    });

    input.addEventListener('focus', function(){
      if (App.chat) {
        App.chat._inputIdle = false;
        App.chat._resetIdleTimer();
      }
      // 关闭plus面板
      var pp = panel.querySelector('#ctPlusPanel');
      if (pp) pp.classList.remove('show');
    });

    input.addEventListener('blur', function(){
      if (App.chat) {
        App.chat._inputIdle = true;
        App.chat._checkIdleQueue();
      }
    });

    // 回车发送
    input.addEventListener('keydown', function(e){
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        self._doSend();
      }
    });

    // 发送按钮
    panel.querySelector('#ctSendBtn').addEventListener('click', function(){ self._doSend(); });

    // +号按钮
    panel.querySelector('#ctPlusBtn').addEventListener('click', function(){
      var pp = panel.querySelector('#ctPlusPanel');
      if (pp) pp.classList.toggle('show');
    });

    // +号面板项
    panel.querySelectorAll('.ct-plus-item').forEach(function(item){
      item.addEventListener('click', function(){
        var act = item.dataset.act;
        var pp = panel.querySelector('#ctPlusPanel');
        if (pp) pp.classList.remove('show');

        if (act === 'scene') self._showSceneDialog();
        else if (act === 'bg') self._showBgMenu();
        else if (act === 'clear') self._clearChat();
        else if (act === 'export') self._exportChat();
      });
    });

    // 消息区域点击关闭面板
    panel.querySelector('#ctMsgs').addEventListener('click', function(){
      var pp = panel.querySelector('#ctPlusPanel');
      if (pp) pp.classList.remove('show');
      if (App.chat) App.chat.dismissCtx();
    });
  },

  /* ===== 发送消息 ===== */
  _doSend: function() {
    if (!App.chat) return;
    var input = ChatUI.panelEl ? ChatUI.panelEl.querySelector('#ctInput') : null;
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    if (App.chat.isStreaming) return;

    input.value = '';
    input.style.height = 'auto';
    ChatUI.updateSendBtn();

    // 关闭plus
    var pp = ChatUI.panelEl.querySelector('#ctPlusPanel');
    if (pp) pp.classList.remove('show');

    // 调用chat.js的send逻辑
    App.chat.messages.push({ role: 'user', content: text, ts: Date.now() });
    App.chat.saveMsgs();
    ChatUI.renderMessages();

    // 取消之前的等待
    if (App.chat._sendDelayTimer) { clearTimeout(App.chat._sendDelayTimer); App.chat._sendDelayTimer = null; }
    App.chat._waitingForIdle = false;

    var cfg = App.chat._utils ? App.chat._utils.getCfg(ChatUI.charId) : {};
    var replyDelay = 3000 + Math.random() * 5000; // 默认

    if (cfg.showTyping !== false) ChatUI.updateTyping(true);

    App.chat._sendDelayTimer = setTimeout(function(){
      App.chat._sendDelayTimer = null;
      if (App.chat._inputIdle) {
        ChatUI._triggerReply(replyDelay);
      } else {
        App.chat._waitingForIdle = true;
      }
    }, 2000);
  },

  _triggerReply: function(delay) {
    if (delay > 0) {
      setTimeout(function(){
        var cfg = App.chat._utils ? App.chat._utils.getCfg(ChatUI.charId) : {};
        if (cfg.showTyping !== false) ChatUI.updateTyping(true);
        App.chat.requestAI();
        App.chat.resetProactive();
      }, delay);
    } else {
      App.chat.requestAI();
      App.chat.resetProactive();
    }
  },

  /* ===== 渲染消息列表 ===== */
  renderMessages: function() {
    var container = ChatUI.panelEl ? ChatUI.panelEl.querySelector('#ctMsgs') : null;
    if (!container || !App.chat) return;

    var msgs = App.chat.messages || [];
    var c = ChatUI.charData;
    var user = App.user ? App.user.getActiveUser() : null;

    if (!msgs.length) {
      container.innerHTML = '<div class="c6-empty" style="padding:40px 20px;">开始聊天吧</div>';
      ChatUI.scrollBottom();
      return;
    }

    var html = '';
    var lastTs = 0;

    msgs.forEach(function(msg, idx) {
      // 时间分隔
      if (msg.ts && msg.ts - lastTs > 5 * 60 * 1000) {
        html += '<div class="ct-time-sep">' + ChatUI._fmtFullTime(msg.ts) + '</div>';
      }
      lastTs = msg.ts || lastTs;

      var isUser = msg.role === 'user';
      var rowClass = isUser ? 'ct-row ct-row-right' : 'ct-row ct-row-left';

      // 头像
      var avatarSrc = '';
      if (isUser) {
        avatarSrc = user && user.avatar ? user.avatar : '';
      } else {
        avatarSrc = c && c.avatar ? c.avatar : '';
      }
      var avatarHtml = avatarSrc
        ? '<img src="' + App.escAttr(avatarSrc) + '" onerror="this.parentElement.innerHTML=\'👤\'">'
        : '👤';

      // 消息内容处理
      var content = msg.content || '';
      var bubbleContent = '';

      // sticker处理
      var stickerMatch = content.match(/^\[sticker:([^\]]+)\]$/);
      if (stickerMatch) {
        var desc = stickerMatch[1];
        var cacheKey = 'stickerCache_' + desc.replace(/\s+/g, '_').slice(0, 30);
        var stickerUrl = App.LS.get(cacheKey);
        if (stickerUrl) {
          bubbleContent = '<img src="' + App.escAttr(stickerUrl) + '" style="max-width:120px;max-height:120px;border-radius:8px;">';
        } else {
          bubbleContent = '<span style="font-style:italic;color:rgba(0,0,0,0.4);">[' + App.esc(desc) + ']</span>';
          // 尝试生成
          if (!isUser && App.chat._utils && App.chat._utils.generateSticker) {
            var cfg = App.chat._utils.getCfg(ChatUI.charId);
            if (cfg && cfg.stickerGen) {
              App.chat._utils.generateSticker(desc, cfg, function(url){
                if (url) {
                  App.LS.set(cacheKey, url);
                  ChatUI.renderMessages();
                }
              });
            }
          }
        }
      } else {
        bubbleContent = ChatUI._formatText(content);
      }

      html += '<div class="' + rowClass + '" data-msg-idx="' + idx + '">' +
        '<div class="ct-row-avatar">' + avatarHtml + '</div>' +
        '<div class="ct-bubble">' + bubbleContent + '</div>' +
      '</div>';
    });

    // 流式气泡
    if (App.chat.isStreaming) {
      html += '<div class="ct-stream-bubble" id="ctStreamBubble">' +
        '<span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span>' +
      '</div>';
    }

    container.innerHTML = html;
    ChatUI.scrollBottom();

    // 绑定长按
    ChatUI._bindMsgEvents(container);
  },

  _formatText: function(text) {
    // 简单转义+换行
    var escaped = App.esc(text);
    return escaped.replace(/\n/g, '<br>');
  },

  _bindMsgEvents: function(container) {
    var longPressTimer = null;
    var startX = 0, startY = 0;

    container.querySelectorAll('.ct-row').forEach(function(row) {
      row.addEventListener('touchstart', function(e) {
        var t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        longPressTimer = setTimeout(function() {
          var idx = parseInt(row.dataset.msgIdx);
          if (!isNaN(idx)) ChatUI.showCtxMenu(row, t.clientX, t.clientY);
        }, 600);
      }, { passive: true });

      row.addEventListener('touchmove', function(e) {
        var t = e.touches[0];
        if (Math.abs(t.clientX - startX) > 10 || Math.abs(t.clientY - startY) > 10) {
          clearTimeout(longPressTimer);
        }
      }, { passive: true });

      row.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
      }, { passive: true });

      // PC端右键
      row.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        var idx = parseInt(row.dataset.msgIdx);
        if (!isNaN(idx)) ChatUI.showCtxMenu(row, e.clientX, e.clientY);
      });
    });
  },

  /* ===== 长按菜单 ===== */
  showCtxMenu: function(row, x, y) {
    if (App.chat) App.chat.dismissCtx();
    var idx = parseInt(row.dataset.msgIdx);
    if (isNaN(idx)) return;
    var msg = App.chat ? App.chat.messages[idx] : null;
    if (!msg) return;

    var isUser = msg.role === 'user';

    var menu = document.createElement('div');
    menu.className = 'ct-ctx-menu';
    App.chat._ctxMenu = menu;

    var items = [
      { label: '复制', act: 'copy' },
      { label: '编辑', act: 'edit' },
      { label: '转发', act: 'share' }
    ];

    if (isUser) {
      items.push({ label: '重新发送', act: 'resend' });
    } else {
      items.push({ label: '重新生成', act: 'regen' });
    }

    items.push({ label: '删除', act: 'delete', danger: true });
    items.push({ label: '删除此条及之后', act: 'deleteFrom', danger: true });

    menu.innerHTML = items.map(function(it) {
      return '<div class="ct-ctx-item' + (it.danger ? ' ct-ctx-danger' : '') + '" data-act="' + it.act + '">' + it.label + '</div>';
    }).join('');

    document.body.appendChild(menu);

    // 定位
    requestAnimationFrame(function() {
      var mw = menu.offsetWidth, mh = menu.offsetHeight;
      var left = Math.min(x, window.innerWidth - mw - 10);
      var top = y - mh - 10;
      if (top < 60) top = y + 10;
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
    });

    // 点击菜单项
    menu.querySelectorAll('.ct-ctx-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var act = item.dataset.act;
        if (App.chat) App.chat.dismissCtx();

        if (act === 'copy') App.chat.copyMsg(idx);
        else if (act === 'edit') ChatUI.showEditDialog(idx);
        else if (act === 'share') App.chat.shareMsg(idx);
        else if (act === 'resend') App.chat.resendMsg(idx);
        else if (act === 'regen') App.chat.regenerate(idx);
        else if (act === 'delete') { App.chat.deleteMsg(idx); ChatUI.renderMessages(); }
        else if (act === 'deleteFrom') { App.chat.deleteFromHere(idx); ChatUI.renderMessages(); }
      });
    });

    // 点击其他地方关闭
    setTimeout(function() {
      document.addEventListener('click', function handler() {
        if (App.chat) App.chat.dismissCtx();
        document.removeEventListener('click', handler);
      });
    }, 50);
  },

  /* ===== 编辑消息 ===== */
  showEditDialog: function(idx) {
    if (!App.chat) return;
    var msg = App.chat.messages[idx];
    if (!msg) return;

    var overlay = document.createElement('div');
    overlay.className = 'ct-edit-overlay';
    overlay.innerHTML =
      '<div class="ct-edit-box">' +
        '<div class="ct-edit-title">编辑消息</div>' +
        '<textarea class="ct-edit-ta" id="ctEditTA">' + App.esc(msg.content) + '</textarea>' +
        '<div class="ct-edit-btns">' +
          '<button class="ct-edit-btn ct-edit-btn-save" id="ctEditSave" type="button">保存</button>' +
          '<button class="ct-edit-btn ct-edit-btn-cancel" id="ctEditCancel" type="button">取消</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#ctEditCancel').addEventListener('click', function() { overlay.remove(); });
    overlay.querySelector('#ctEditSave').addEventListener('click', function() {
      var val = overlay.querySelector('#ctEditTA').value.trim();
      if (val) {
        App.chat.messages[idx].content = val;
        App.chat.saveMsgs();
        ChatUI.renderMessages();
      }
      overlay.remove();
    });
  },

  /* ===== 流式气泡更新 ===== */
  updateStreamBubble: function(text) {
    var bubble = ChatUI.panelEl ? ChatUI.panelEl.querySelector('#ctStreamBubble') : null;
    if (!bubble) return;
    var SPLIT = App.chat && App.chat._utils ? App.chat._utils.SPLIT : '|||';
    var parts = text.split(SPLIT);
    var lastPart = parts[parts.length - 1] || '';
    bubble.innerHTML = ChatUI._formatText(lastPart.trim()) ||
      '<span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span>';
    ChatUI.scrollBottom();
  },

  /* ===== 更新发送按钮状态 ===== */
  updateSendBtn: function() {
    var btn = ChatUI.panelEl ? ChatUI.panelEl.querySelector('#ctSendBtn') : null;
    var input = ChatUI.panelEl ? ChatUI.panelEl.querySelector('#ctInput') : null;
    if (!btn || !input) return;

    if (App.chat && App.chat.isStreaming) {
      // 替换为停止按钮
      btn.className = 'ct-stop-btn';
      btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
      btn.onclick = function() { if (App.chat) App.chat.stopStream(); };
    } else {
      btn.onclick = function() { ChatUI._doSend(); };
      if (input.value.trim()) {
        btn.className = 'ct-send-btn';
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>';
      } else {
        btn.className = 'ct-send-btn ct-send-disabled';
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>';
      }
    }
  },

  /* ===== 正在输入 ===== */
  updateTyping: function(show) {
    var el = ChatUI.panelEl ? ChatUI.panelEl.querySelector('#ctTyping') : null;
    if (!el) return;
    if (show) el.classList.add('ct-typing-show');
    else el.classList.remove('ct-typing-show');
  },

  /* ===== 滚动到底 ===== */
  scrollBottom: function() {
    var el = ChatUI.panelEl ? ChatUI.panelEl.querySelector('#ctMsgs') : null;
    if (el) requestAnimationFrame(function() { el.scrollTop = el.scrollHeight; });
  },

  /* ===== 顶部菜单 ===== */
  _showTopMenu: function() {
    if (App.chat) App.chat.dismissMenu();
    var menu = document.createElement('div');
    menu.className = 'ct-ctx-menu';
    menu.style.right = '12px';
    menu.style.top = '60px';
    menu.style.left = 'auto';
    App.chat._menuEl = menu;

    var items = [
      { label: '设置场景', act: 'scene' },
      { label: '更换背景', act: 'bg' },
      { label: '查看资料', act: 'profile' },
      { label: '清空聊天', act: 'clear', danger: true }
    ];

    menu.innerHTML = items.map(function(it) {
      return '<div class="ct-ctx-item' + (it.danger ? ' ct-ctx-danger' : '') + '" data-act="' + it.act + '">' + it.label + '</div>';
    }).join('');

    document.body.appendChild(menu);

    menu.querySelectorAll('.ct-ctx-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var act = item.dataset.act;
        if (App.chat) App.chat.dismissMenu();

        if (act === 'scene') ChatUI._showSceneDialog();
        else if (act === 'bg') ChatUI._showBgMenu();
        else if (act === 'profile') ChatUI._showProfile();
        else if (act === 'clear') ChatUI._clearChat();
      });
    });

    setTimeout(function() {
      document.addEventListener('click', function handler() {
        if (App.chat) App.chat.dismissMenu();
        document.removeEventListener('click', handler);
      });
    }, 50);
  },

  /* ===== 场景设定 ===== */
  _showSceneDialog: function() {
    var current = App.LS.get('chatScene_' + ChatUI.charId) || '';

    var overlay = document.createElement('div');
    overlay.className = 'ct-scene-overlay';
    overlay.innerHTML =
      '<div class="ct-scene-box">' +
        '<div class="ct-edit-title">场景设定</div>' +
        '<textarea class="ct-edit-ta" id="ctSceneTA" placeholder="描述当前场景/时间线..." style="min-height:100px;">' + App.esc(current) + '</textarea>' +
        '<div class="ct-edit-btns">' +
          '<button class="ct-edit-btn ct-edit-btn-save" id="ctSceneSave" type="button">保存</button>' +
          '<button class="ct-edit-btn ct-edit-btn-cancel" id="ctSceneCancel" type="button">取消</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#ctSceneCancel').addEventListener('click', function() { overlay.remove(); });
    overlay.querySelector('#ctSceneSave').addEventListener('click', function() {
      var val = overlay.querySelector('#ctSceneTA').value.trim();
      App.LS.set('chatScene_' + ChatUI.charId, val);
      overlay.remove();
      App.showToast(val ? '场景已设置' : '场景已清除');
    });
  },

  /* ===== 背景菜单 ===== */
  _showBgMenu: function() {
    var old = App.$('#ctBgMenu');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'ctBgMenu';
    overlay.className = 'ct-edit-overlay';
    overlay.innerHTML =
      '<div class="ct-scene-box">' +
        '<div class="ct-edit-title">聊天背景</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' +
          '<button class="ct-edit-btn ct-edit-btn-save" id="ctBgAlbum" type="button">从相册选择</button>' +
          '<button class="ct-edit-btn ct-edit-btn-save" id="ctBgUrl" type="button" style="background:rgba(0,0,0,0.6);">输入URL</button>' +
          '<button class="ct-edit-btn ct-edit-btn-cancel" id="ctBgClear" type="button" style="color:#e74c3c;">清除背景</button>' +
          '<button class="ct-edit-btn ct-edit-btn-cancel" id="ctBgCancel" type="button">取消</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#ctBgCancel').addEventListener('click', function() { overlay.remove(); });

    overlay.querySelector('#ctBgClear').addEventListener('click', function() {
      App.LS.remove('chatBg_' + ChatUI.charId);
      var bg = ChatUI.panelEl ? ChatUI.panelEl.querySelector('#ctBg') : null;
      if (bg) bg.style.backgroundImage = '';
      overlay.remove();
      App.showToast('背景已清除');
    });

    overlay.querySelector('#ctBgAlbum').addEventListener('click', function() {
      overlay.remove();
      var input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      document.body.appendChild(input);
      input.onchange = function(e) {
        var file = e.target.files[0];
        document.body.removeChild(input);
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var SPLIT = App.chat && App.chat._utils;
          if (App.cropImage) {
            App.cropImage(ev.target.result, function(cropped) {
              ChatUI._applyBg(cropped);
            });
          } else {
            ChatUI._applyBg(ev.target.result);
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });

    overlay.querySelector('#ctBgUrl').addEventListener('click', function() {
      overlay.remove();
      var url = prompt('输入背景图片URL:');
      if (url && url.trim()) ChatUI._applyBg(url.trim());
    });
  },

  _applyBg: function(src) {
    try { App.LS.set('chatBg_' + ChatUI.charId, src); } catch(e) { App.showToast('图片太大'); return; }
    var bg = ChatUI.panelEl ? ChatUI.panelEl.querySelector('#ctBg') : null;
    if (bg) bg.style.backgroundImage = 'url(' + src + ')';
    App.showToast('背景已设置');
  },

  /* ===== 查看资料 ===== */
  _showProfile: function() {
    var c = ChatUI.charData;
    if (!c) return;
    var overlay = document.createElement('div');
    overlay.className = 'ct-edit-overlay';
    var info = '';
    if (c.name) info += '<div style="font-size:16px;font-weight:700;margin-bottom:8px;">' + App.esc(c.name) + '</div>';
    if (c.gender) info += '<div style="font-size:12px;color:#666;margin-bottom:4px;">性别：' + App.esc(c.gender) + '</div>';
    if (c.age) info += '<div style="font-size:12px;color:#666;margin-bottom:4px;">年龄：' + App.esc(c.age) + '</div>';
    if (c.relation) info += '<div style="font-size:12px;color:#666;margin-bottom:4px;">关系：' + App.esc(c.relation) + '</div>';
    if (c.sign) info += '<div style="font-size:12px;color:#999;margin-top:8px;font-style:italic;">' + App.esc(c.sign) + '</div>';

    overlay.innerHTML =
      '<div class="ct-scene-box" style="text-align:center;">' +
        (c.avatar ? '<div style="width:64px;height:64px;border-radius:50%;overflow:hidden;margin:0 auto 12px;"><img src="' + App.escAttr(c.avatar) + '" style="width:100%;height:100%;object-fit:cover;"></div>' : '') +
        info +
        '<button class="ct-edit-btn ct-edit-btn-cancel" style="margin-top:16px;width:100%;" type="button">关闭</button>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.ct-edit-btn-cancel').addEventListener('click', function() { overlay.remove(); });
  },

  /* ===== 清空聊天 ===== */
  _clearChat: function() {
    if (!confirm('确定清空所有聊天记录？')) return;
    if (App.chat) {
      App.chat.messages = [];
      App.chat.saveMsgs();
    }
    ChatUI.renderMessages();
    App.showToast('已清空');
  },

  /* ===== 导出聊天 ===== */
  _exportChat: function() {
    if (!App.chat || !App.chat.messages.length) { App.showToast('没有消息可导出'); return; }
    var c = ChatUI.charData;
    var user = App.user ? App.user.getActiveUser() : null;
    var userName = (user && (user.nickname || user.realName)) || '我';
    var charName = (c && c.name) || '对方';

    var text = App.chat.messages.map(function(m) {
      var name = m.role === 'user' ? userName : charName;
      var time = ChatUI._fmtFullTime(m.ts);
      return '[' + time + '] ' + name + ': ' + m.content;
    }).join('\n\n');

    App.copyText(text).then(function() { App.showToast('聊天记录已复制到剪贴板'); }).catch(function() { App.showToast('复制失败'); });
  },

  /* ===== 时间格式化 ===== */
  _fmtFullTime: function(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
      ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  },

  /* ===== 兼容chat.js旧接口 ===== */
  render: function(inner, c, bgUrl, hasBg, tintOn) {
    // 兼容旧版调用方式，新版直接用open
    ChatUI.open(c.id, c);
  },

  init: function() {
    App.chatUI = ChatUI;
  }
};

App.register('chatUI', ChatUI);
})();
