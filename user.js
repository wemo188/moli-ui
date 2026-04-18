(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Social = {
    currentTab: 'chat',
    panelEl: null,
    list: [],

    load: function() { Social.list = App.LS.get('userList') || []; },
    save: function() { App.LS.set('userList', Social.list); },

    getActiveUser: function() {
      var activeId = App.LS.get('activeUserId');
      if (activeId) {
        for (var i = 0; i < Social.list.length; i++) {
          if (Social.list[i].id === activeId) return Social.list[i];
        }
      }
      return Social.list[0] || null;
    },

    getById: function(id) {
      for (var i = 0; i < Social.list.length; i++) {
        if (Social.list[i].id === id) return Social.list[i];
      }
      return null;
    },

    setActive: function(id) { App.LS.set('activeUserId', id); },

    open: function() {
      Social.load();
      var panel = App.$('#socialPanel');
      if (!panel) return;
      Social.panelEl = panel;
      Social.currentTab = 'chat';
      Social.render();
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    close: function() {
      var panel = App.$('#socialPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    render: function() {
      var panel = Social.panelEl;
      if (!panel) return;

      var isFS = App.LS.get('socFullScreen') || false;
      var wrapClass = isFS ? 'soc-fullscreen' : '';

      panel.innerHTML =
        '<div class="' + wrapClass + '" id="socWrap"><div class="soc-phone"><div class="soc-inner">' +
          '<div class="soc-header">' +
            '<button class="soc-header-btn" id="socBackBtn" type="button">' +
              '<svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>' +
            '</button>' +
            '<div style="flex:1;"></div>' +
            '<div style="position:relative;">' +
              '<button class="soc-header-btn" id="socAddBtn" type="button">' +
                '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '</button>' +
              '<div class="soc-add-menu" id="socAddMenu">' +
                '<div class="soc-add-menu-item" data-action="addFriend"><span>加好友</span></div>' +
                '<div class="soc-add-menu-item" data-action="changeTheme"><span>更换主题</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="soc-search"><div class="soc-search-bar">' +
            '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>' +
            '<span>搜索</span>' +
          '</div></div>' +
          '<div class="soc-body" id="socBody"></div>' +
          '<div class="soc-tabbar">' +
            '<div class="soc-tab' + (Social.currentTab === 'chat' ? ' active' : '') + '" data-tab="chat">' +
              '<svg viewBox="0 0 64 64"><path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="23" y1="28" x2="41" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="34" x2="35" y2="34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
              '<span>聊天</span>' +
            '</div>' +
            '<div class="soc-tab' + (Social.currentTab === 'char' ? ' active' : '') + '" data-tab="char">' +
              '<svg viewBox="0 0 64 64"><path d="M4 34H14L18 26L23 42L28 20L33 38L37 30H44" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M52 28C52 25 50 23 48 23C46 23 44.5 25 44.5 25C44.5 25 43 23 41 23C39 23 37 25 37 28C37 32 44.5 37 44.5 37C44.5 37 52 32 52 28Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="44" y1="34" x2="60" y2="34" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
              '<span>通讯录</span>' +
            '</div>' +
            '<div class="soc-tab' + (Social.currentTab === 'moments' ? ' active' : '') + '" data-tab="moments">' +
              '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(120 32 32)"/></svg>' +
              '<span>朋友圈</span>' +
            '</div>' +
            '<div class="soc-tab' + (Social.currentTab === 'me' ? ' active' : '') + '" data-tab="me">' +
              '<svg viewBox="0 0 64 64"><defs><pattern id="mmg-hatch-tab" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" stroke-width="2.2"/></pattern></defs><circle cx="32" cy="33" r="21" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="url(#mmg-hatch-tab)" stroke="currentColor" stroke-width="1.6"/></svg>' +
              '<span>我的</span>' +
            '</div>' +
          '</div>' +
        '</div></div></div>';

      Social.renderTab();
      Social.bindEvents();
    },

    renderTab: function() {
      var body = App.$('#socBody');
      if (!body) return;

      if (Social.currentTab === 'chat') Social.renderChatTab(body);
      else if (Social.currentTab === 'char') Social.renderCharTab(body);
      else if (Social.currentTab === 'moments') body.innerHTML = '<div class="soc-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><div class="soc-empty-text">朋友圈功能开发中</div></div>';
      else if (Social.currentTab === 'me') Social.renderMeTab(body);
    },

    renderChatTab: function(body) {
      var chars = App.character ? App.character.list : [];
      if (!chars.length) {
        body.innerHTML = '<div class="soc-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="soc-empty-text">暂无聊天<br>请先在「角色」中添加角色</div></div>';
        return;
      }
      body.innerHTML = chars.map(function(c) {
        var avatarHtml = c.avatar
          ? '<img src="' + App.esc(c.avatar) + '" alt="">'
          : '<div class="soc-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="soc-chat-item" data-char-id="' + c.id + '">' +
          '<div class="soc-avatar">' + avatarHtml + '</div>' +
          '<div class="soc-chat-content">' +
            '<div class="soc-chat-top"><span class="soc-chat-name">' + App.esc(c.name || '未命名') + '</span></div>' +
            '<div class="soc-chat-msg">点击开始聊天</div>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.soc-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var id = item.dataset.charId;
          if (id && App.chat) {
            Social.close();
            setTimeout(function() { App.chat.startChat(id); }, 380);
          }
        });
      });
    },

    renderCharTab: function(body) {
      var chars = App.character ? App.character.list : [];
      if (!chars.length) {
        body.innerHTML = '<div class="soc-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="soc-empty-text">暂无角色<br>请在底部栏「角色」中添加</div></div>';
        return;
      }
      body.innerHTML = chars.map(function(c) {
        var avatarHtml = c.avatar
          ? '<img src="' + App.esc(c.avatar) + '" alt="">'
          : '<div class="soc-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="soc-chat-item" data-char-id="' + c.id + '">' +
          '<div class="soc-avatar">' + avatarHtml + '</div>' +
          '<div class="soc-chat-content">' +
            '<div class="soc-chat-top"><span class="soc-chat-name">' + App.esc(c.name || '未命名') + '</span></div>' +
            '<div class="soc-chat-msg">' + App.esc((c.profile || '').split('\n')[0].slice(0, 30) || '暂无简介') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    renderMeTab: function(body) {
      var user = Social.getActiveUser();
      var name = user ? (user.name || '未命名') : '未创建用户';
      var isFS = App.LS.get('socFullScreen') || false;
      var modeText = isFS ? '全屏模式' : '手机模式';

      var avatarHtml = user && user.avatar
        ? '<div class="soc-avatar-placeholder" style="width:80px;height:80px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);overflow:hidden;"><img src="' + App.esc(user.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;border:none;outline:none;"></div>'
        : '<div class="soc-avatar-placeholder" style="width:80px;height:80px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);"><svg viewBox="0 0 24 24" style="width:30px;height:30px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

      body.innerHTML =
        '<div class="soc-me-mode-bar">' +
          '<button class="soc-me-mode-btn" id="socModeToggle" type="button">' +
            '<span class="soc-me-mode-val">' + modeText + '</span>' +
            '<span class="soc-me-mode-switch">切换</span>' +
          '</button>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:center;padding:30px 20px;gap:12px;">' +
          avatarHtml +
          '<div style="font-size:17px;font-weight:600;color:#2e4258;">' + App.esc(name) + '</div>' +
          '<div style="font-size:12px;color:#a8c0d8;">用户管理功能开发中</div>' +
        '</div>';

      body.querySelector('#socModeToggle').addEventListener('click', function() {
        var current = App.LS.get('socFullScreen') || false;
        var next = !current;
        App.LS.set('socFullScreen', next);

        var phone = Social.panelEl.querySelector('.soc-phone');
        if (phone) {
          if (next) {
            phone.parentElement.classList.add('soc-fullscreen');
          } else {
            phone.parentElement.classList.remove('soc-fullscreen');
          }
        }

        var valEl = this.querySelector('.soc-me-mode-val');
        if (valEl) valEl.textContent = next ? '全屏模式' : '手机模式';
      });
    },

    bindEvents: function() {
      App.safeOn('#socBackBtn', 'click', function() { Social.close(); });

      App.safeOn('#socAddBtn', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#socAddMenu');
        if (menu) menu.classList.toggle('show');
      });

      if (Social.panelEl) {
        Social.panelEl.querySelectorAll('.soc-add-menu-item').forEach(function(item) {
          item.addEventListener('click', function(e) {
            e.stopPropagation();
            var menu = App.$('#socAddMenu');
            if (menu) menu.classList.remove('show');
            if (item.dataset.action === 'addFriend') {
              App.showToast('加好友 · 开发中');
            } else if (item.dataset.action === 'changeTheme') {
              Social.close();
              setTimeout(function() { App.openPanel('themePanel'); }, 380);
            }
          });
        });

        Social.panelEl.addEventListener('click', function() {
          var menu = App.$('#socAddMenu');
          if (menu) menu.classList.remove('show');
        });

        Social.panelEl.querySelectorAll('.soc-tab').forEach(function(tab) {
          tab.addEventListener('click', function() {
            Social.currentTab = tab.dataset.tab;
            Social.panelEl.querySelectorAll('.soc-tab').forEach(function(t) {
              t.classList.toggle('active', t.dataset.tab === Social.currentTab);
            });
            Social.renderTab();
          });
        });
      }
    },

    init: function() {
      Social.load();
      if (!App.$('#socialPanel')) {
        var panel = document.createElement('div');
        panel.id = 'socialPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }
      App.user = Social;
      App.safeOn('#dockMine', 'click', function() { Social.open(); });
    }
  };

  App.register('user', Social);
})();