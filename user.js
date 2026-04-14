(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Social = {
    currentTab: 'chat',
    panelEl: null,
    addMenuOpen: false,

    list: [],
    FIELDS: [
      { key: 'name', label: '名字' },
      { key: 'profile', label: '简介' },
      { key: 'personality', label: '性格' }
    ],

    load: function() {
      Social.list = App.LS.get('userList') || [];
    },
    save: function() {
      App.LS.set('userList', Social.list);
    },
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
    setActive: function(id) {
      App.LS.set('activeUserId', id);
    },

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

      panel.innerHTML =
        '<div class="soc-phone"><div class="soc-inner">' +

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
                '<div class="soc-add-menu-item" data-action="addChar">' +
                  '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' +
                  '<span>创建角色</span>' +
                '</div>' +
                '<div class="soc-add-menu-item" data-action="addUser">' +
                  '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>' +
                  '<span>创建用户</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="soc-search">' +
            '<div class="soc-search-bar">' +
              '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>' +
              '<span>搜索</span>' +
            '</div>' +
          '</div>' +

          '<div class="soc-body" id="socBody"></div>' +

          '<div class="soc-tabbar">' +
            '<div class="soc-tab' + (Social.currentTab === 'chat' ? ' active' : '') + '" data-tab="chat">' +
              '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
              '<span>聊天</span>' +
            '</div>' +
            '<div class="soc-tab' + (Social.currentTab === 'char' ? ' active' : '') + '" data-tab="char">' +
              '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' +
              '<span>角色</span>' +
            '</div>' +
            '<div class="soc-tab' + (Social.currentTab === 'moments' ? ' active' : '') + '" data-tab="moments">' +
              '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' +
              '<span>朋友圈</span>' +
            '</div>' +
            '<div class="soc-tab' + (Social.currentTab === 'me' ? ' active' : '') + '" data-tab="me">' +
              '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
              '<span>我</span>' +
            '</div>' +
          '</div>' +

        '</div></div>';

      Social.renderTab();
      Social.bindEvents();
    },

    renderTab: function() {
      var body = App.$('#socBody');
      if (!body) return;

      switch (Social.currentTab) {
        case 'chat':
          Social.renderChatTab(body);
          break;
        case 'char':
          Social.renderCharTab(body);
          break;
        case 'moments':
          body.innerHTML =
            '<div class="soc-empty">' +
              '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' +
              '<div class="soc-empty-text">朋友圈功能开发中</div>' +
            '</div>';
          break;
        case 'me':
          Social.renderMeTab(body);
          break;
      }
    },

    renderChatTab: function(body) {
      var chars = App.character ? App.character.list : [];
      if (!chars.length) {
        body.innerHTML =
          '<div class="soc-empty">' +
            '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
            '<div class="soc-empty-text">暂无聊天<br>点击右上角 + 创建角色</div>' +
          '</div>';
        return;
      }

      body.innerHTML = chars.map(function(c) {
        var name = c.name || (c.profile || '').split('\n')[0] || '未命名角色';
        var avatarHtml = c.avatar
          ? '<img src="' + App.esc(c.avatar) + '" alt="">'
          : '<div class="soc-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';

        return '<div class="soc-chat-item" data-char-id="' + c.id + '">' +
          '<div class="soc-avatar">' + avatarHtml + '</div>' +
          '<div class="soc-chat-content">' +
            '<div class="soc-chat-top">' +
              '<span class="soc-chat-name">' + App.esc(name) + '</span>' +
              '<span class="soc-chat-time"></span>' +
            '</div>' +
            '<div class="soc-chat-msg">点击开始聊天</div>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.soc-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var charId = item.dataset.charId;
          if (charId && App.chat) {
            Social.close();
            setTimeout(function() { App.chat.startChat(charId); }, 380);
          }
        });
      });
    },

    renderCharTab: function(body) {
      var chars = App.character ? App.character.list : [];
      if (!chars.length) {
        body.innerHTML =
          '<div class="soc-empty">' +
            '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' +
            '<div class="soc-empty-text">暂无角色<br>点击右上角 + 创建</div>' +
          '</div>';
        return;
      }

      body.innerHTML = chars.map(function(c) {
        var name = c.name || '未命名角色';
        var desc = (c.profile || '').split('\n')[0] || '暂无简介';
        var avatarHtml = c.avatar
          ? '<img src="' + App.esc(c.avatar) + '" alt="">'
          : '<div class="soc-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';

        return '<div class="soc-chat-item" data-char-id="' + c.id + '">' +
          '<div class="soc-avatar">' + avatarHtml + '</div>' +
          '<div class="soc-chat-content">' +
            '<div class="soc-chat-top">' +
              '<span class="soc-chat-name">' + App.esc(name) + '</span>' +
            '</div>' +
            '<div class="soc-chat-msg">' + App.esc(desc.slice(0, 30)) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.soc-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          App.showToast('角色详情 · 开发中');
        });
      });
    },

    renderMeTab: function(body) {
      var user = Social.getActiveUser();
      var name = user ? (user.name || '未命名') : '未创建用户';
      var avatarHtml = user && user.avatar
        ? '<img src="' + App.esc(user.avatar) + '" alt="" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(192,206,220,.7);outline:1.5px solid rgba(255,255,255,1);">'
        : '<div class="soc-avatar-placeholder" style="width:64px;height:64px;border-radius:50%;"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

      body.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;padding:40px 20px;gap:12px;">' +
          avatarHtml +
          '<div style="font-size:17px;font-weight:600;color:#2e4258;">' + App.esc(name) + '</div>' +
          '<div style="font-size:12px;color:#a8c0d8;">点击右上角 + 创建/管理用户</div>' +
        '</div>';
    },

    bindEvents: function() {
      var panel = Social.panelEl;
      if (!panel) return;

      App.safeOn('#socBackBtn', 'click', function() {
        Social.close();
      });

      App.safeOn('#socAddBtn', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#socAddMenu');
        if (!menu) return;
        Social.addMenuOpen = !Social.addMenuOpen;
        menu.classList.toggle('show', Social.addMenuOpen);
      });

      panel.querySelectorAll('.soc-add-menu-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          Social.addMenuOpen = false;
          var menu = App.$('#socAddMenu');
          if (menu) menu.classList.remove('show');

          var action = item.dataset.action;
          if (action === 'addChar') {
            Social.close();
            setTimeout(function() { App.openPanel('characterPanel'); }, 380);
          } else if (action === 'addUser') {
            App.showToast('创建用户 · 开发中');
          }
        });
      });

      panel.addEventListener('click', function() {
        if (Social.addMenuOpen) {
          Social.addMenuOpen = false;
          var menu = App.$('#socAddMenu');
          if (menu) menu.classList.remove('show');
        }
      });

      panel.querySelectorAll('.soc-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          Social.currentTab = tab.dataset.tab;
          panel.querySelectorAll('.soc-tab').forEach(function(t) {
            t.classList.toggle('active', t.dataset.tab === Social.currentTab);
          });
          Social.renderTab();
        });
      });
    },

    init: function() {
      Social.load();

      if (!App.$('#socialPanel')) {
        var panel = document.createElement('div');
        panel.id = 'socialPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }

      App.safeOn('#dockMine', 'click', function() {
        Social.open();
      });

      App.user = Social;
    }
  };

  App.register('user', Social);
})();