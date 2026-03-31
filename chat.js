(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Chat = {

    currentUserId: null,
    currentCharacterId: null,
    messages: [],
    isStreaming: false,

    empty: function() {
      return {
        id: 'chat-' + Date.now(),
        userId: '',
        characterId: '',
        messages: [],
        createdAt: Date.now()
      };
    },

    save: function() {
      var key = 'chat_' + Chat.currentUserId + '_' + Chat.currentCharacterId;
      App.LS.set(key, Chat.messages);
    },

    load: function() {
      if (!Chat.currentUserId || !Chat.currentCharacterId) {
        Chat.messages = [];
        return;
      }
      var key = 'chat_' + Chat.currentUserId + '_' + Chat.currentCharacterId;
      Chat.messages = App.LS.get(key) || [];
    },

    openPanel: function() {
      Chat.renderUserSelect();
      var panel = App.$('#chatPanel');
      if (!panel) return;
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    closePanel: function() {
      var panel = App.$('#chatPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderUserSelect: function() {
      var panel = App.$('#chatPanel');
      if (!panel) return;

      var users = App.user ? App.user.list : [];

      if (!users.length) {
        panel.innerHTML =
          '<div class="fullpage-header">' +
            '<div class="fullpage-back" id="closeChatPanel">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '</div>' +
            '<h2>聊天</h2>' +
          '</div>' +
          '<div class="fullpage-body">' +
            '<div class="empty-hint">请先创建用户身份</div>' +
          '</div>';
        App.safeOn('#closeChatPanel', 'click', function() { Chat.closePanel(); });
        return;
      }

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closeChatPanel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>选择身份</h2>' +
        '</div>' +
        '<div class="fullpage-body">' +
          '<div class="user-select-list">' +
            users.map(function(u) {
              return '<div class="user-select-card" data-id="' + u.id + '">' +
                '<div class="user-select-avatar">' +
                  (u.avatar
                    ? '<img src="' + u.avatar + '" alt="">'
                    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') +
                '</div>' +
                '<div class="user-select-info">' +
                  '<div class="user-select-name">' + App.esc(u.name || '未命名') + '</div>' +
                  '<div class="user-select-desc">' + App.esc(u.gender || '') + (u.age ? ' · ' + u.age : '') + '</div>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';

      App.safeOn('#closeChatPanel', 'click', function() { Chat.closePanel(); });

      panel.querySelectorAll('.user-select-card').forEach(function(card) {
        card.addEventListener('click', function() {
          Chat.currentUserId = card.dataset.id;
          Chat.renderCharacterSelect();
        });
      });
    },

    renderCharacterSelect: function() {
      var panel = App.$('#chatPanel');
      if (!panel) return;

      var chars = App.character ? App.character.list : [];

      if (!chars.length) {
        panel.innerHTML =
          '<div class="fullpage-header">' +
            '<div class="fullpage-back" id="backToUserSelect">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '</div>' +
            '<h2>选择角色</h2>' +
          '</div>' +
          '<div class="fullpage-body">' +
            '<div class="empty-hint">请先创建角色</div>' +
          '</div>';
        App.safeOn('#backToUserSelect', 'click', function() { Chat.renderUserSelect(); });
        return;
      }

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToUserSelect">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>选择角色</h2>' +
        '</div>' +
        '<div class="fullpage-body">' +
          '<div class="char-select-list">' +
            chars.map(function(c) {
              var shapeClass = Chat.getShapeClass(c.avatarShape);
              return '<div class="char-select-card" data-id="' + c.id + '">' +
                '<div class="char-select-avatar ' + shapeClass + '">' +
                  (c.avatar
                    ? '<img src="' + c.avatar + '" alt="">'
                    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>') +
                '</div>' +
                '<div class="char-select-info">' +
                  '<div class="char-select-name">' + App.esc((c.basicInfo || '').split('\n')[0].slice(0, 20)) + '</div>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';

      App.safeOn('#backToUserSelect', 'click', function() { Chat.renderUserSelect(); });

      panel.querySelectorAll('.char-select-card').forEach(function(card) {
        card.addEventListener('click', function() {
          Chat.currentCharacterId = card.dataset.id;
          Chat.load();
          Chat.renderChatView();
        });
      });
    },

    renderChatView: function() {
      var panel = App.$('#chatPanel');
            if (!panel) return;

      var user = App.user ? App.user.getById(Chat.currentUserId) : null;
      var char = App.character ? App.character.getById(Chat.currentCharacterId) : null;

      if (!user || !char) return;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToCharSelect">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + App.esc(char.basicInfo ? char.basicInfo.split('\n')[0] : '角色') + '</h2>' +
          '<div class="chat-header-right">' +
            '<button class="chat-menu-btn" id="chatMenuBtn" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="chat-messages" id="chatMessages"></div>' +
        '<div class="chat-input-area">' +
          '<button class="chat-action-btn" id="chatUploadBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
          '<textarea id="chatInput" class="chat-textarea" placeholder="输入消息..." rows="1"></textarea>' +
          '<button class="chat-send-btn" id="chatSendBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="chat-sidebar chat-sidebar-left hidden" id="chatSidebarLeft">' +
          '<div class="chat-sidebar-header">角色列表</div>' +
          '<div class="chat-sidebar-body" id="charListInSidebar"></div>' +
        '</div>' +
        '<div class="chat-sidebar chat-sidebar-right hidden" id="chatSidebarRight">' +
          '<div class="chat-sidebar-header">选项</div>' +
          '<div class="chat-sidebar-body">' +
            '<div class="chat-sidebar-item" data-action="user">用户</div>' +
            '<div class="chat-sidebar-item" data-action="scene">场景</div>' +
            '<div class="chat-sidebar-item" data-action="worldbook">世界书</div>' +
            '<div class="chat-sidebar-item" data-action="preset">预设</div>' +
            '<div class="chat-sidebar-item" data-action="regex">正则</div>' +
            '<div class="chat-sidebar-item" data-action="css">CSS 全局渲染</div>' +
            '<div class="chat-sidebar-item" data-action="api">API 切换</div>' +
          '</div>' +
        '</div>';

      App.safeOn('#backToCharSelect', 'click', function() {
        Chat.renderCharacterSelect();
      });

      App.safeOn('#chatMenuBtn', 'click', function() {
        var sidebar = App.$('#chatSidebarRight');
        if (sidebar) sidebar.classList.toggle('hidden');
      });

      App.safeOn('#chatUploadBtn', 'click', function() {
        App.showToast('上传功能开发中');
      });

      App.safeOn('#chatSendBtn', 'click', function() {
        Chat.sendMessage();
      });

      // 右侧菜单项
      panel.querySelectorAll('.chat-sidebar-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var action = item.dataset.action;
          App.showToast(action + ' 功能开发中');
        });
      });

      // 左侧角色列表
      Chat.renderCharListInSidebar();

      // 自动滚到底部
      setTimeout(function() {
        var msgs = App.$('#chatMessages');
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
      }, 100);

      Chat.renderMessages();
    },

    renderCharListInSidebar: function() {
      var body = App.$('#charListInSidebar');
      if (!body) return;

      var chars = App.character ? App.character.list : [];
      body.innerHTML = chars.map(function(c) {
        var shapeClass = Chat.getShapeClass(c.avatarShape);
        var isActive = c.id === Chat.currentCharacterId;
        return '<div class="char-sidebar-item' + (isActive ? ' active' : '') + '" data-id="' + c.id + '">' +
          '<div class="char-sidebar-avatar ' + shapeClass + '">' +
            (c.avatar
              ? '<img src="' + c.avatar + '" alt="">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>') +
          '</div>' +
          '<div class="char-sidebar-name">' + App.esc((c.basicInfo || '').split('\n')[0].slice(0, 12)) + '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.char-sidebar-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var id = item.dataset.id;
          if (id === Chat.currentCharacterId) {
            App.character.renderEditView(id);
            return;
          }
          Chat.currentCharacterId = id;
          Chat.load();
          Chat.renderChatView();
        });
      });
    },

    renderMessages: function() {
      var container = App.$('#chatMessages');
      if (!container) return;

      container.innerHTML = Chat.messages.map(function(msg, idx) {
        var isUser = msg.role === 'user';
        return '<div class="chat-msg' + (isUser ? ' chat-msg-user' : ' chat-msg-char') + '">' +
          '<div class="chat-msg-content">' + App.esc(msg.content) + '</div>' +
        '</div>';
      }).join('');

      container.scrollTop = container.scrollHeight;
    },

    sendMessage: function() {
      var input = App.$('#chatInput');
      if (!input) return;

      var text = input.value.trim();
      if (!text) return;

      Chat.messages.push({
        role: 'user',
        content: text
      });

      input.value = '';
      Chat.renderMessages();
      Chat.save();

      // 模拟 AI 回复（暂时）
      setTimeout(function() {
        Chat.messages.push({
          role: 'assistant',
          content: '这是一条测试回复。'
        });
        Chat.renderMessages();
        Chat.save();
      }, 500);
    },

    getShapeClass: function(shape) {
      if (shape === 'square') return 'shape-square';
      if (shape === 'rounded') return 'shape-rounded';
      return 'shape-circle';
    },

    bindEvents: function() {
      App.safeOn('#openChatBtn', 'click', function() {
        Chat.openPanel();
      });
    },

    init: function() {
      if (!App.$('#chatPanel')) {
        var panel = document.createElement('div');
        panel.id = 'chatPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }

      App.chat = Chat;
      Chat.bindEvents();
    }
  };

  App.register('chat', Chat);
})();
