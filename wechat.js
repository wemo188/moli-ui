
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Wechat = {
    currentTab: 'chats',
    currentPage: 'chats',
    panelEl: null,
    _savedInner: '',

    open: function() {
      var panel = App.$('#wechatPanel');
      if (!panel) return;
      Wechat.panelEl = panel;
      Wechat.render();
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    close: function() {
      var panel = App.$('#wechatPanel');
      if (!panel) return;
      panel.classList.remove('show');
      panel.classList.add('hidden');
    },

    render: function() {
      var panel = Wechat.panelEl;
      if (!panel) return;

      panel.innerHTML =
        '<div id="wxPhoneFrame" style="max-width:400px;margin:20px auto;height:667px;display:flex;flex-direction:column;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
          // 顶部导航
          '<div class="c6-header">' +
            '<div class="c6-header-btn" id="wxBackBtn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></div>' +
            '<div class="c6-header-title">Chat</div>' +
            '<div class="c6-header-btn" id="wxMenuBtn"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>' +
          '</div>' +

          // 主体区域
          '<div class="c6-main">' +
            // Tab栏
            '<div class="c6-tab-wrap">' +
              '<div class="c6-tab-inner">' +
                '<div class="c6-tab-deco">' +
                  '<div class="c6-star-main"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></div>' +
                  '<div class="c6-star-sm c6-star-s1"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></div>' +
                '</div>' +
                '<div class="c6-tabs" id="c6Tabs">' +
                  '<div class="c6-tab c6-active" data-tab="chats">chats</div>' +
                  '<div class="c6-tab" data-tab="groups">groups</div>' +
                '</div>' +
                '<div class="c6-tab-icons">' +
                  '<div class="c6-tab-icon" id="wxNotifyBtn"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>' +
                  '<div class="c6-tab-icon" id="wxSearchBtn"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>' +
                '</div>' +
              '</div>' +
            '</div>' +

            // 内容区域
            '<div class="c6-body" id="c6Body"></div>' +
          '</div>' +

          // 底部导航
          '<div class="c6-footer">' +
            '<div class="c6-footer-item c6-f-active" data-page="chats">' +
              '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.65 1.48 4.96 3.76 6.37-.24 1.25-.8 2.84-.8 2.84a1 1 0 0 0 1.25 1.05s2.5-.66 4.18-1.54C10.9 19.64 11.45 19.67 12 19.67c5.52 0 10-3.92 10-8.92S17.52 2 12 2z"/></svg></div>' +
              '<div class="c6-footer-label">Chats</div>' +
            '</div>' +
            '<div class="c6-footer-item" data-page="contacts">' +
              '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>' +
              '<div class="c6-footer-label">Contacts</div>' +
            '</div>' +
            '<div class="c6-footer-item" data-page="discover">' +
              '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg></div>' +
              '<div class="c6-footer-label">Discover</div>' +
            '</div>' +
            '<div class="c6-footer-item" data-page="me" id="wxMeBtn">' +
              '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></div>' +
              '<div class="c6-footer-label">Me</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      Wechat.bindEvents();
      Wechat.renderPage('chats');
    },

    renderPage: function(page) {
      Wechat.currentPage = page;
      var body = App.$('#c6Body');
      if (!body) return;

      if (page === 'chats') {
        Wechat.renderChatsTab(body);
      } else if (page === 'contacts') {
        Wechat.renderContactsTab(body);
      } else if (page === 'discover') {
        body.innerHTML = '<div style="text-align:center;padding:60px 20px;color:rgba(0,0,0,0.3);font-size:13px;">发现功能开发中</div>';
      } else if (page === 'me') {
        Wechat.renderMeTab(body);
      }
    },

    renderChatsTab: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });

      if (!visibleChars.length) {
        body.innerHTML = '<div style="text-align:center;padding:60px 20px;color:rgba(0,0,0,0.3);font-size:13px;">暂无聊天</div>';
        return;
      }

      body.innerHTML = visibleChars.map(function(c) {
        var msgs = App.LS.get('chatMsgs_' + c.id);
        var lastMsg = '';
        var lastTime = '';
        if (msgs && msgs.length) {
          var last = msgs[msgs.length - 1];
          lastMsg = (last.content || '').split('|||')[0].replace(/\[sticker:[^\]]+\]/g, '[表情包]').slice(0, 25);
          if (last.ts) {
            var d = new Date(last.ts);
            var now = new Date();
            if (d.toDateString() === now.toDateString()) {
              lastTime = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
            } else {
              lastTime = (d.getMonth() + 1) + '/' + d.getDate();
            }
          }
        }

        var unread = App.chat ? App.chat.getUnread(c.id) : 0;
        var badgeHtml = unread > 0 ? '<div class="c6-chat-badge">' + (unread > 99 ? '99+' : unread) + '</div>' : '';

        return '<div class="c6-chat-item" data-char-id="' + c.id + '">' +
          '<div class="c6-chat-avatar"></div>' +
          '<div class="c6-chat-info">' +
            '<div class="c6-chat-name">' + App.esc(c.name || '未命名') + '</div>' +
            '<div class="c6-chat-msg">' + App.esc(lastMsg || '点击开始聊天') + '</div>' +
          '</div>' +
          '<div class="c6-chat-meta">' +
            '<div class="c6-chat-time">' + lastTime + '</div>' +
            badgeHtml +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.c6-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var id = item.dataset.charId;
          if (id && App.chat) App.chat.openInWechat(id);
        });
      });
    },

    renderContactsTab: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });

      if (!visibleChars.length) {
        body.innerHTML = '<div style="text-align:center;padding:60px 20px;color:rgba(0,0,0,0.3);font-size:13px;">暂无联系人</div>';
        return;
      }

      body.innerHTML = visibleChars.map(function(c) {
        return '<div class="c6-chat-item" data-char-id="' + c.id + '">' +
          '<div class="c6-chat-avatar"></div>' +
          '<div class="c6-chat-info">' +
            '<div class="c6-chat-name">' + App.esc(c.name || '未命名') + '</div>' +
            '<div class="c6-chat-msg">' + App.esc(c.sign || '') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.c6-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var id = item.dataset.charId;
          if (id && App.chat) App.chat.openInWechat(id);
        });
      });
    },

    renderMeTab: function(body) {
      var user = App.user ? App.user.getActiveUser() : null;
      
      if (!user) {
        body.innerHTML = '<div style="text-align:center;padding:40px 20px;">' +
          '<div style="font-size:13px;color:rgba(0,0,0,0.5);margin-bottom:20px;">还未创建用户身份</div>' +
          '<button id="wxCreateUserBtn" style="padding:12px 24px;background:rgba(0,0,0,0.8);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">创建身份</button>' +
        '</div>';
        App.safeOn('#wxCreateUserBtn', 'click', function() {
          Wechat.close();
          setTimeout(function() { if (App.user) App.user.open(); }, 380);
        });
        return;
      }

      var name = user.nickname || user.realName || '未命名';
      body.innerHTML =
        '<div style="text-align:center;padding:20px;border-bottom:1px solid rgba(0,0,0,0.06);">' +
          '<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(145deg,#e0e0e0,#f0f0f0);margin:0 auto 12px;"></div>' +
          '<div style="font-size:15px;font-weight:700;color:rgba(0,0,0,0.8);">' + App.esc(name) + '</div>' +
        '</div>' +
        '<div style="padding:12px 0;">' +
          '<div class="c6-chat-item" id="wxMeEdit"><div class="c6-chat-info"><div class="c6-chat-name">编辑身份</div></div></div>' +
          '<div class="c6-chat-item" id="wxMeAssets"><div class="c6-chat-info"><div class="c6-chat-name">资产</div></div></div>' +
          '<div class="c6-chat-item" id="wxMeFavs"><div class="c6-chat-info"><div class="c6-chat-name">收藏</div></div></div>' +
          '<div class="c6-chat-item" id="wxMeStickers"><div class="c6-chat-info"><div class="c6-chat-name">表情包</div></div></div>' +
          '<div class="c6-chat-item" id="wxMeSwitch"><div class="c6-chat-info"><div class="c6-chat-name">切换身份</div></div></div>' +
        '</div>';

      App.safeOn('#wxMeEdit', 'click', function() {
        Wechat.close();
        setTimeout(function() { if (App.user) App.user.renderProfile(user.id); }, 380);
      });

      App.safeOn('#wxMeAssets', 'click', function() { App.showToast('资产功能开发中'); });
      App.safeOn('#wxMeFavs', 'click', function() { App.showToast('收藏功能开发中'); });
      App.safeOn('#wxMeStickers', 'click', function() { App.showToast('表情包功能开发中'); });
      App.safeOn('#wxMeSwitch', 'click', function() { App.showToast('切换身份功能开发中'); });
    },

    isCharVisible: function(c) {
      if (!c.contactMode || c.contactMode === 'direct') return true;
      if (c.contactAccepted === true) return true;
      return false;
    },

    bindEvents: function() {
      App.safeOn('#wxBackBtn', 'click', function() { Wechat.close(); });

      App.safeOn('#wxMenuBtn', 'click', function(e) {
        e.stopPropagation();
        App.showToast('手机框切换（开发中）');
      });

      var tabs = App.$$('#c6Tabs .c6-tab');
      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          tabs.forEach(function(t) { t.classList.remove('c6-active'); });
          tab.classList.add('c6-active');
        });
      });

      var footerItems = App.$$('.c6-footer-item');
      footerItems.forEach(function(item) {
        item.addEventListener('click', function() {
          footerItems.forEach(function(i) { i.classList.remove('c6-f-active'); });
          item.classList.add('c6-f-active');
          var page = item.dataset.page;
          Wechat.renderPage(page);
        });
      });
    },

    init: function() {
      if (!App.$('#wechatPanel')) {
        var panel = document.createElement('div');
        panel.id = 'wechatPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }
      App.wechat = Wechat;
      App.safeOn('#dockChat', 'click', function() { Wechat.open(); });
    }
  };

  App.register('wechat', Wechat);
})();


