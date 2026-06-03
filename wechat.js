
(function(){
  'use strict';
  var App = window.App;
  if (!App) return;

  var WeChat = {
    panelEl: null,
    currentTab: 'chats',
    currentPage: 'chats',
    charAliases: {}, // charId -> 微信昵称映射
    charVisible: {}, // charId -> 是否在通讯录显示
    charGroups: {}, // 分组管理
    
    load: function() {
      WeChat.charAliases = App.LS.get('wxCharAliases') || {};
      WeChat.charVisible = App.LS.get('wxCharVisible') || {};
      WeChat.charGroups = App.LS.get('wxCharGroups') || {};
    },
    
    save: function() {
      App.LS.set('wxCharAliases', WeChat.charAliases);
      App.LS.set('wxCharVisible', WeChat.charVisible);
      App.LS.set('wxCharGroups', WeChat.charGroups);
    },

    getCharAlias: function(charId) {
      return WeChat.charAliases[charId] || '';
    },

    setCharAlias: function(charId, alias) {
      WeChat.charAliases[charId] = alias;
      WeChat.save();
    },

    isCharVisible: function(charId) {
      if (WeChat.charVisible[charId] === undefined) return true;
      return WeChat.charVisible[charId];
    },

    setCharVisible: function(charId, visible) {
      WeChat.charVisible[charId] = visible;
      WeChat.save();
    },

    open: function() {
      WeChat.load();
      
      var old = App.$('#wxPanel');
      if (old) old.remove();

      var panel = document.createElement('div');
      panel.id = 'wxPanel';
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;overflow:hidden;';
      
      document.body.appendChild(panel);
      WeChat.panelEl = panel;

      WeChat.render(panel);

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }); });

      App.bindSwipeBack(panel, function() { WeChat.close(); });
    },

    close: function() {
      var p = WeChat.panelEl;
      if (!p) return;
      p.style.transform = 'translateX(100%)';
      p.style.opacity = '0';
      setTimeout(function() { if (p.parentNode) p.remove(); WeChat.panelEl = null; }, 350);
    },

    render: function(panel) {
      panel.innerHTML = `
        <style>
          @keyframes c6Twinkle {
            0%,100% { opacity:0.6;transform:scale(1) rotate(0deg); }
            50% { opacity:1;transform:scale(1.08) rotate(8deg); }
          }
          @keyframes c6TwinkleAlt {
            0%,100% { opacity:0.5;transform:scale(1) rotate(0deg); }
            50% { opacity:0.9;transform:scale(1.1) rotate(-6deg); }
          }

          .c6-container {
            width:100%;height:100%;
            display:flex;flex-direction:column;
            background:#fff;
          }

          .c6-header {
            flex-shrink:0;
            background:#fff;
            padding:12px 16px;
            display:flex;align-items:center;justify-content:space-between;
            border-bottom:1px solid rgba(0,0,0,0.06);
          }

          .c6-header-btn {
            width:36px;height:36px;
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;-webkit-tap-highlight-color:transparent;
            transition:transform 0.15s;
          }
          .c6-header-btn:active { transform:scale(0.88); }
          .c6-header-btn svg {
            width:20px;height:20px;
            fill:none;stroke:rgba(0,0,0,0.6);
            stroke-width:2;stroke-linecap:round;stroke-linejoin:round;
          }

          .c6-header-title {
            font-size:16px;font-weight:700;letter-spacing:1px;
            color:rgba(0,0,0,0.8);
          }

          .c6-main {
            flex:1;
            display:flex;flex-direction:column;
            background:#fff;
            overflow:hidden;
          }

          .c6-tab-wrap {
            flex-shrink:0;
            margin:5px 8px 12px 8px;
            background:#fff;
            backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
            border:1px solid rgba(0,0,0,0.02);
            border-radius:14px;
            padding:6px;
            box-shadow:
              0 4px 20px rgba(0,0,0,0.03),
              0 1px 3px rgba(0,0,0,0.02),
              inset 0 1px 0 rgba(255,255,255,0.7);
            position:relative;
            overflow:hidden;
          }

          .c6-tab-wrap::before {
            content:'';position:absolute;top:0;left:0;right:0;height:50%;
            background:linear-gradient(180deg,rgba(255,255,255,0.25),transparent);
            border-radius:14px 14px 0 0;pointer-events:none;
          }

          .c6-tab-inner {
            position:relative;
            display:flex;align-items:center;
            background:rgba(0,0,0,0.02);
            border-radius:10px;
            padding:3px;
            gap:3px;
          }

          .c6-tab-deco {
            width:26px;flex-shrink:0;
            display:flex;align-items:center;justify-content:center;
            margin:0 0 0 2px;
            position:relative;
          }
          .c6-star-main {
            width:16px;height:16px;
            animation:c6Twinkle 3s ease-in-out infinite;
          }
          .c6-star-main svg {
            width:100%;height:100%;
            fill:rgba(0,0,0,0.15);
            stroke:rgba(0,0,0,0.1);
            stroke-width:0.5;
          }
          .c6-star-sm {
            position:absolute;width:7px;height:7px;
          }
          .c6-star-sm svg {
            width:100%;height:100%;fill:rgba(0,0,0,0.1);stroke:none;
          }
          .c6-star-s1 { top:-1px;right:0;animation:c6TwinkleAlt 2.6s ease-in-out 0.4s infinite; }

          .c6-tabs { flex:1;display:flex;gap:3px; }

          .c6-tab {
            flex:1;
            display:flex;align-items:center;justify-content:center;
            padding:8px 12px;
            border-radius:10px;
            font-size:10px;font-weight:700;letter-spacing:1px;
            color:rgba(0,0,0,0.28);
            cursor:pointer;-webkit-tap-highlight-color:transparent;
            transition:all 0.25s ease;
          }
          .c6-tab:active { transform:scale(0.95); }
          .c6-tab.c6-active {
            background:rgba(255,255,255,0.8);
            color:rgba(0,0,0,0.7);
            box-shadow:
              0 2px 8px rgba(0,0,0,0.03),
              0 1px 2px rgba(0,0,0,0.01),
              inset 0 1px 1px rgba(255,255,255,0.8);
          }

          .c6-tab-icons {
            display:flex;gap:2px;
            margin:0 4px 0 0;
          }
          .c6-tab-icon {
            width:28px;height:28px;
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;-webkit-tap-highlight-color:transparent;
            transition:transform 0.15s;
          }
          .c6-tab-icon:active { transform:scale(0.88); }
          .c6-tab-icon svg {
            width:16px;height:16px;
            fill:none;stroke:rgba(0,0,0,0.4);
            stroke-width:2;stroke-linecap:round;stroke-linejoin:round;
          }

          .c6-body {
            flex:1;
            background:#fff;
            overflow-y:auto;
            padding:0 0 12px 0;
          }

          .c6-chat-item {
            display:flex;align-items:center;gap:12px;
            padding:10px 16px;
            background:rgba(0,0,0,0.05);
            margin:0 12px 8px;
            border-radius:20px;
            cursor:pointer;-webkit-tap-highlight-color:transparent;
            transition:background 0.2s;
          }
          .c6-chat-item:active { background:rgba(0,0,0,0.07); }

          .c6-chat-avatar {
            width:48px;height:48px;border-radius:50%;
            background:linear-gradient(145deg,#e0e0e0,#f0f0f0);
            flex-shrink:0;
            box-shadow:0 2px 4px rgba(0,0,0,0.04);
            overflow:hidden;
            display:flex;align-items:center;justify-content:center;
            font-size:20px;
          }
          .c6-chat-avatar img {
            width:100%;height:100%;object-fit:cover;
          }

          .c6-chat-info { flex:1;min-width:0; }
          .c6-chat-name {
            font-size:13px;font-weight:700;color:rgba(0,0,0,0.8);
            margin-bottom:3px;letter-spacing:0.3px;
          }
          .c6-chat-msg {
            font-size:11px;color:rgba(0,0,0,0.4);
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
          }

          .c6-chat-meta {
            display:flex;flex-direction:column;align-items:flex-end;gap:4px;
            flex-shrink:0;
          }
          .c6-chat-time {
            font-size:9px;color:rgba(0,0,0,0.3);
            font-family:monospace;
          }
          .c6-chat-badge {
            min-width:16px;height:16px;
            padding:0 5px;
            border-radius:8px;
            background:rgba(0,0,0,0.15);
            display:flex;align-items:center;justify-content:center;
            font-size:9px;font-weight:700;color:#fff;
          }

          .c6-footer {
            flex-shrink:0;
            background:rgba(248,248,248,0.95);
            border-top:1px solid rgba(0,0,0,0.04);
            display:flex;
            padding:6px 0;
          }

          .c6-footer-item {
            flex:1;
            display:flex;flex-direction:column;align-items:center;
            gap:3px;
            padding:6px 0;
            cursor:pointer;-webkit-tap-highlight-color:transparent;
            transition:all 0.2s;
          }
          .c6-footer-item:active { transform:scale(0.92); }

          .c6-footer-icon {
            width:24px;height:24px;
            display:flex;align-items:center;justify-content:center;
          }
          .c6-footer-icon svg {
            width:22px;height:22px;
            fill:rgba(0,0,0,0.3);
            transition:fill 0.2s;
          }
          .c6-footer-item.c6-f-active .c6-footer-icon svg { fill:rgba(0,0,0,0.7); }

          .c6-footer-label {
            font-size:9px;font-weight:600;letter-spacing:0.5px;
            color:rgba(0,0,0,0.35);
            transition:color 0.2s;
          }
          .c6-footer-item.c6-f-active .c6-footer-label { color:rgba(0,0,0,0.7); }

          .c6-empty {
            text-align:center;
            padding:40px 20px;
            color:rgba(0,0,0,0.3);
            font-size:13px;
          }
        </style>

        <div class="c6-container">
          <!-- 顶部导航 -->
          <div class="c6-header">
            <div class="c6-header-btn" id="wxBackBtn">
              <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            </div>
            <div class="c6-header-title">Chat</div>
            <div class="c6-header-btn" id="wxAddBtn">
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </div>

          <!-- 主体区域 -->
          <div class="c6-main">
            <!-- Tab栏 -->
            <div class="c6-tab-wrap">
              <div class="c6-tab-inner">
                <div class="c6-tab-deco">
                  <div class="c6-star-main">
                    <svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  </div>
                  <div class="c6-star-sm c6-star-s1">
                    <svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  </div>
                </div>

                <div class="c6-tabs" id="c6Tabs">
                  <div class="c6-tab c6-active" data-tab="chats">chats</div>
                  <div class="c6-tab" data-tab="groups">groups</div>
                </div>

                <div class="c6-tab-icons">
                  <div class="c6-tab-icon" id="wxNotifyBtn" title="通知">
                    <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <div class="c6-tab-icon" id="wxSearchBtn" title="搜索">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- 内容区域 -->
            <div class="c6-body" id="c6Body">
              <div class="c6-empty">暂无聊天</div>
            </div>
          </div>
        </div>

        <!-- 底部导航 -->
        <div class="c6-footer">
          <div class="c6-footer-item c6-f-active" data-page="chats">
            <div class="c6-footer-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.65 1.48 4.96 3.76 6.37-.24 1.25-.8 2.84-.8 2.84a1 1 0 0 0 1.25 1.05s2.5-.66 4.18-1.54C10.9 19.64 11.45 19.67 12 19.67c5.52 0 10-3.92 10-8.92S17.52 2 12 2z"/></svg>
            </div>
            <div class="c6-footer-label">Chats</div>
          </div>

          <div class="c6-footer-item" data-page="contacts">
            <div class="c6-footer-icon">
              <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <div class="c6-footer-label">Contacts</div>
          </div>

          <div class="c6-footer-item" data-page="discover">
            <div class="c6-footer-icon">
              <svg viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
            </div>
            <div class="c6-footer-label">Discover</div>
          </div>

          <div class="c6-footer-item" data-page="me">
            <div class="c6-footer-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            <div class="c6-footer-label">Me</div>
          </div>
        </div>
      </div>
      `;

      WeChat.bindEvents(panel);
      WeChat.renderTab(panel);
    },

    bindEvents: function(panel) {
      // 返回按钮
      var backBtn = panel.querySelector('#wxBackBtn');
      if (backBtn) {
        backBtn.addEventListener('click', function() { WeChat.close(); });
      }

      // Tab切换
      panel.querySelectorAll('#c6Tabs .c6-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          WeChat.currentTab = tab.dataset.tab;
          panel.querySelectorAll('#c6Tabs .c6-tab').forEach(function(t) { t.classList.remove('c6-active'); });
          tab.classList.add('c6-active');
          WeChat.renderTab(panel);
        });
      });

      // 底部导航
      panel.querySelectorAll('.c6-footer-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var page = item.dataset.page;
          WeChat.currentPage = page;
          panel.querySelectorAll('.c6-footer-item').forEach(function(i) { i.classList.remove('c6-f-active'); });
          item.classList.add('c6-f-active');
          WeChat.renderPage(panel, page);
        });
      });

      // 聊天项点击
      panel.querySelectorAll('.c6-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var charId = item.dataset.charId;
          if (charId && App.chat) {
            WeChat.close();
            App.chat.openInWechat(charId);
          }
        });
      });
    },

    renderTab: function(panel) {
      var body = panel.querySelector('#c6Body');
      if (!body) return;

      if (WeChat.currentTab === 'chats') {
        WeChat.renderChats(body);
      } else if (WeChat.currentTab === 'groups') {
        WeChat.renderGroups(body);
      }
    },

    renderPage: function(panel, page) {
      var body = panel.querySelector('#c6Body');
      if (!body) return;

      if (page === 'chats') {
        WeChat.renderChats(body);
      } else if (page === 'contacts') {
        WeChat.renderContacts(body);
      } else if (page === 'discover') {
        WeChat.renderDiscover(body);
      } else if (page === 'me') {
        WeChat.renderMe(body);
      }
    },

    renderChats: function(container) {
      if (!App.character) {
        container.innerHTML = '<div class="c6-empty">character 模块未加载</div>';
        return;
      }

      var chars = App.character.list || [];
      var visibleChars = chars.filter(function(c) { return WeChat.isCharVisible(c.id); });

      if (!visibleChars.length) {
        container.innerHTML = '<div class="c6-empty">暂无聊天</div>';
        return;
      }

      var html = visibleChars.map(function(c) {
        var alias = WeChat.getCharAlias(c.id) || c.name || '未命名';
        var unread = App.chat ? App.chat.getUnread(c.id) : 0;
        var messages = App.LS.get('chatMsgs_' + c.id) || [];
        var lastMsg = messages.length ? messages[messages.length - 1] : null;
        var lastText = lastMsg ? (lastMsg.content || '').slice(0, 30) : '暂无消息';
        var lastTime = lastMsg ? WeChat._formatTime(lastMsg.ts) : '';
        var avatar = c.avatar ? '<img src="' + App.escAttr(c.avatar) + '">' : '👤';

        var badgeHtml = unread > 0 ? '<div class="c6-chat-badge">' + (unread > 99 ? '99+' : unread) + '</div>' : '';

        return '<div class="c6-chat-item" data-char-id="' + c.id + '">' +
          '<div class="c6-chat-avatar">' + avatar + '</div>' +
          '<div class="c6-chat-info">' +
            '<div class="c6-chat-name">' + App.esc(alias) + '</div>' +
            '<div class="c6-chat-msg">' + App.esc(lastText) + '</div>' +
          '</div>' +
          '<div class="c6-chat-meta">' +
            '<div class="c6-chat-time">' + lastTime + '</div>' +
            badgeHtml +
          '</div>' +
        '</div>';
      }).join('');

      container.innerHTML = html;
      WeChat.bindChatItems(container);
    },

    renderGroups: function(container) {
      container.innerHTML = '<div class="c6-empty">群组功能开发中</div>';
    },

    renderContacts: function(container) {
      if (!App.character) {
        container.innerHTML = '<div class="c6-empty">character 模块未加载</div>';
        return;
      }

      var chars = App.character.list || [];
      if (!chars.length) {
        container.innerHTML = '<div class="c6-empty">暂无联系人</div>';
        return;
      }

      var html = chars.map(function(c) {
        var alias = WeChat.getCharAlias(c.id) || c.name || '未命名';
        var avatar = c.avatar ? '<img src="' + App.escAttr(c.avatar) + '">' : '👤';

        return '<div class="c6-chat-item" data-char-id="' + c.id + '">' +
          '<div class="c6-chat-avatar">' + avatar + '</div>' +
          '<div class="c6-chat-info">' +
            '<div class="c6-chat-name">' + App.esc(alias) + '</div>' +
            '<div class="c6-chat-msg">' + App.esc(c.relation || '朋友') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      container.innerHTML = html;
      WeChat.bindChatItems(container);
    },

    renderDiscover: function(container) {
      container.innerHTML = '<div class="c6-empty">发现功能开发中</div>';
    },

    renderMe: function(container) {
      if (!App.user) {
        container.innerHTML = '<div class="c6-empty">user 模块未加载</div>';
        return;
      }

      var user = App.user.getActiveUser();
      if (!user) {
        container.innerHTML = '<div class="c6-empty">请先创建用户档案</div>';
        return;
      }

      var html = '<div style="padding:20px;text-align:center;">' +
        '<div style="width:80px;height:80px;border-radius:50%;margin:0 auto 16px;background:#e0e0e0;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:32px;">' +
          (user.avatar ? '<img src="' + App.escAttr(user.avatar) + '" style="width:100%;height:100%;object-fit:cover;">' : '👤') +
        '</div>' +
        '<div style="font-size:16px;font-weight:700;color:#333;margin-bottom:4px;">' + App.esc(user.nickname || user.realName || '用户') + '</div>' +
        '<div style="font-size:12px;color:#999;margin-bottom:20px;">' + App.esc(user.bio || '暂无签名') + '</div>' +
        '<div style="border-top:1px solid #eee;padding-top:16px;text-align:left;">' +
          '<div style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">' +
            '<span style="color:#999;">手机：</span>' + App.esc(user.phone || '—') +
          '</div>' +
          '<div style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">' +
            '<span style="color:#999;">微信：</span>' + App.esc(user.wechatId || '—') +
          '</div>' +
          '<div style="padding:12px 0;font-size:13px;color:#333;">' +
            '<span style="color:#999;">性别：</span>' + App.esc(user.gender || '—') +
          '</div>' +
        '</div>' +
      '</div>';

      container.innerHTML = html;
    },

    bindChatItems: function(container) {
      container.querySelectorAll('.c6-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var charId = item.dataset.charId;
          if (charId && App.chat) {
            WeChat.close();
            App.chat.openInWechat(charId);
          }
        });
      });
    },

    _formatTime: function(ts) {
      if (!ts) return '';
      var now = new Date();
      var date = new Date(ts);
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (dateOnly.getTime() === today.getTime()) {
        return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
      } else if (dateOnly.getTime() === new Date(today.getTime() - 86400000).getTime()) {
        return '昨天';
      } else if (dateOnly.getFullYear() === today.getFullYear()) {
        return (date.getMonth() + 1) + '月' + date.getDate() + '日';
      } else {
        return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
      }
    },

    init: function() {
      WeChat.load();
      App.wechat = WeChat;
      App.safeOn('#dockChat', 'click', function() { WeChat.open(); });
    }
  };

  App.register('wechat', WeChat);
})();
