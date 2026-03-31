(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Chat = {

    currentUserId: null,
    currentCharacterId: null,
    currentConversationId: null,
    conversations: [],

    save: function() {
      App.LS.set('conversations', Chat.conversations);
    },

    load: function() {
      Chat.conversations = App.LS.get('conversations') || [];
    },

    createConversation: function(userId, charId) {
      var conv = {
        id: 'conv-' + Date.now(),
        userId: userId,
        characterId: charId,
        title: '新对话',
        messages: [],
        createdAt: Date.now()
      };
      Chat.conversations.push(conv);
      Chat.save();
      return conv;
    },

    getConversations: function(userId, charId) {
      return Chat.conversations.filter(function(c) {
        return c.userId === userId && c.characterId === charId;
      });
    },

    getCurrentConversation: function() {
      for (var i = 0; i < Chat.conversations.length; i++) {
        if (Chat.conversations[i].id === Chat.currentConversationId) {
          return Chat.conversations[i];
        }
      }
      return null;
    },

    deleteConversation: function(id) {
      Chat.conversations = Chat.conversations.filter(function(c) { return c.id !== id; });
      Chat.save();
    },

    closeSidebars: function() {
      var left = App.$('#chatSidebarLeft');
      var right = App.$('#chatSidebarRight');
      var overlay = App.$('#chatOverlay');
      if (left) left.classList.add('hidden');
      if (right) right.classList.add('hidden');
      if (overlay) overlay.classList.add('hidden');
    },

    openPanel: function() {
      var user = App.user ? App.user.getActiveUser() : null;
      var panel = App.$('#chatPanel');
      if (!panel) return;

      if (!user) {
        panel.innerHTML =
          '<div class="fullpage-header">' +
            '<div class="fullpage-back" id="closeChatPanel">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '</div>' +
            '<h2>聊天</h2>' +
          '</div>' +
          '<div class="fullpage-body">' +
            '<div class="empty-hint">请先在用户页面启用一个身份</div>' +
          '</div>';
        panel.classList.remove('hidden');
        requestAnimationFrame(function() { panel.classList.add('show'); });
        App.safeOn('#closeChatPanel', 'click', function() { Chat.closePanel(); });
        return;
      }

      Chat.currentUserId = user.id;
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
      Chat.renderCharacterSelect();
    },

    closePanel: function() {
      var panel = App.$('#chatPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderCharacterSelect: function() {
      var panel = App.$('#chatPanel');
      if (!panel) return;

      var chars = App.character ? App.character.list : [];

      if (!chars.length) {
        panel.innerHTML =
          '<div class="fullpage-header">' +
            '<div class="fullpage-back" id="closeChatPanel">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '</div>' +
            '<h2>选择角色</h2>' +
          '</div>' +
          '<div class="fullpage-body">' +
            '<div class="empty-hint">请先创建角色</div>' +
          '</div>';
        App.safeOn('#closeChatPanel', 'click', function() { Chat.closePanel(); });
        return;
      }

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closeChatPanel">' +
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
                  '<div class="char-select-name">' + App.esc((c.basicInfo || '').split('\n')[0].slice(0, 20) || '未命名') + '</div>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';

      App.safeOn('#closeChatPanel', 'click', function() { Chat.closePanel(); });

      panel.querySelectorAll('.char-select-card').forEach(function(card) {
        card.addEventListener('click', function() {
          Chat.currentCharacterId = card.dataset.id;
          Chat.load();
          var convs = Chat.getConversations(Chat.currentUserId, Chat.currentCharacterId);
          if (!convs.length) {
            var newConv = Chat.createConversation(Chat.currentUserId, Chat.currentCharacterId);
            Chat.currentConversationId = newConv.id;
          } else {
            Chat.currentConversationId = convs[convs.length - 1].id;
          }
          Chat.renderChatView();
        });
      });
    },

    showUserSwitcher: function() {
      var users = App.user ? App.user.list : [];
      if (!users.length) return;

      var panel = App.$('#chatPanel');
      if (!panel) return;

      var old = panel.querySelector('#chatUserSwitcher');
      if (old) old.remove();

      var switcher = document.createElement('div');
      switcher.id = 'chatUserSwitcher';
      switcher.className = 'chat-user-switcher';
      switcher.innerHTML =
        '<div class="chat-user-switcher-mask"></div>' +
        '<div class="chat-user-switcher-body">' +
          '<div class="chat-user-switcher-title">切换身份</div>' +
          users.map(function(u) {
            var isActive = u.id === Chat.currentUserId;
            return '<div class="chat-user-switcher-item' + (isActive ? ' active' : '') + '" data-id="' + u.id + '">' +
              '<div class="chat-user-switcher-avatar">' +
                (u.avatar
                  ? '<img src="' + u.avatar + '" alt="">'
                  : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') +
              '</div>' +
              '<span>' + App.esc(u.name || '未命名') + '</span>' +
            '</div>';
          }).join('') +
        '</div>';

      panel.appendChild(switcher);

      switcher.querySelector('.chat-user-switcher-mask').addEventListener('click', function() {
        switcher.remove();
      });

      switcher.querySelectorAll('.chat-user-switcher-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var newUserId = item.dataset.id;
          if (newUserId !== Chat.currentUserId) {
            Chat.currentUserId = newUserId;
            App.user.setActive(newUserId);
            Chat.load();
            var convs = Chat.getConversations(Chat.currentUserId, Chat.currentCharacterId);
            if (!convs.length) {
              var newConv = Chat.createConversation(Chat.currentUserId, Chat.currentCharacterId);
              Chat.currentConversationId = newConv.id;
            } else {
              Chat.currentConversationId = convs[convs.length - 1].id;
            }
            App.showToast('已切换');
          }
          switcher.remove();
          Chat.renderChatView();
        });
      });
    },

    renderChatView: function() {
      var panel = App.$('#chatPanel');
      if (!panel) return;

      var user = App.user ? App.user.getById(Chat.currentUserId) : null;
      var char = App.character ? App.character.getById(Chat.currentCharacterId) : null;
      var conv = Chat.getCurrentConversation();

      if (!user || !char || !conv) return;

      var userShapeClass = Chat.getShapeClass(user.avatarShape);
      var charName = (char.basicInfo || '').split('\n')[0] || '角色';
      var userAvatarHtml = user.avatar
        ? '<img src="' + user.avatar + '" alt="">'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

      panel.innerHTML =
        '<div class="fullpage-header chat-header">' +
          '<div class="fullpage-back" id="backToCharSelect">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<button class="chat-icon-btn" id="chatConvBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
          '</button>' +
          '<h2>' + App.esc(charName) + '</h2>' +
          '<button class="chat-icon-btn" id="chatMenuBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="chat-body">' +
          '<div class="chat-messages" id="chatMessages"></div>' +
          '<div class="chat-input-area">' +
            '<button class="chat-action-btn" id="chatUploadBtn" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>' +
            '</button>' +
            '<textarea id="chatInput" class="chat-textarea" placeholder="输入消息..." rows="1"></textarea>' +
            '<button class="chat-send-btn" id="chatSendBtn" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="chat-sidebar chat-sidebar-left hidden" id="chatSidebarLeft">' +
          '<div class="chat-sidebar-header">' +
            '<span>对话列表</span>' +
            '<button class="chat-sidebar-add-btn" id="addConvBtn" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="chat-sidebar-body" id="convListBody"></div>' +
        '</div>' +
        '<div class="chat-sidebar chat-sidebar-right hidden" id="chatSidebarRight">' +
          '<div class="chat-right-user" id="switchUserArea">' +
            '<div class="chat-right-avatar ' + userShapeClass + '">' + userAvatarHtml + '</div>' +
            '<div class="chat-right-username">' + App.esc(user.name || '') + '</div>' +
          '</div>' +
          '<div class="chat-right-list">' +
            '<div class="chat-right-item" data-action="scene">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
              '<span>场景</span>' +
            '</div>' +
            '<div class="chat-right-item" data-action="worldbook">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' +
              '<span>世界书</span>' +
            '</div>' +
            '<div class="chat-right-item" data-action="preset">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
              '<span>预设</span>' +
            '</div>' +
            '<div class="chat-right-item" data-action="regex">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>' +
              '<span>正则</span>' +
            '</div>' +
            '<div class="chat-right-item" data-action="css">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.1 2.5-.3C13.6 20 13 18.1 13 16c0-3.3 2.7-6 6-6 1 0 2 .3 2.8.7.1-.6.2-1.1.2-1.7 0-5-3.6-9.3-8.5-9.9L12 2z"/><circle cx="7.5" cy="11.5" r="1.5"/><circle cx="12" cy="7.5" r="1.5"/><circle cx="16.5" cy="11.5" r="1.5"/></svg>' +
              '<span>CSS 渲染</span>' +
            '</div>' +
            '<div class="chat-right-item" data-action="api">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' +
              '<span>API</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="chat-overlay hidden" id="chatOverlay"></div>';

      // 返回
      App.safeOn('#backToCharSelect', 'click', function() {
        Chat.renderCharacterSelect();
      });

      // 爱心 左侧
      App.safeOn('#chatConvBtn', 'click', function() {
        var left = App.$('#chatSidebarLeft');
        var right = App.$('#chatSidebarRight');
        var overlay = App.$('#chatOverlay');
        if (right) right.classList.add('hidden');
        if (left && overlay) {
          var isHidden = left.classList.contains('hidden');
          left.classList.toggle('hidden');
          overlay.classList.toggle('hidden', !isHidden);
          if (isHidden) Chat.renderConvList();
        }
      });

      // 三个点 右侧
      App.safeOn('#chatMenuBtn', 'click', function() {
        var left = App.$('#chatSidebarLeft');
        var right = App.$('#chatSidebarRight');
        var overlay = App.$('#chatOverlay');
        if (left) left.classList.add('hidden');
        if (right && overlay) {
          var isHidden = right.classList.contains('hidden');
          right.classList.toggle('hidden');
          overlay.classList.toggle('hidden', !isHidden);
        }
      });

      // 遮罩收起
      App.safeOn('#chatOverlay', 'click', function() {
        Chat.closeSidebars();
      });

      // 点击用户区域弹出切换器
      var switchArea = panel.querySelector('#switchUserArea');
      if (switchArea) {
        switchArea.addEventListener('click', function(e) {
          e.stopPropagation();
          Chat.closeSidebars();
          Chat.showUserSwitcher();
        });
      }

      // 新建对话
      App.safeOn('#addConvBtn', 'click', function() {
        var newConv = Chat.createConversation(Chat.currentUserId, Chat.currentCharacterId);
        Chat.currentConversationId = newConv.id;
        Chat.closeSidebars();
        Chat.renderChatView();
        App.showToast('新对话已创建');
      });

      // 上传
      App.safeOn('#chatUploadBtn', 'click', function() {
        App.showToast('上传功能开发中');
      });

      // 发送
      App.safeOn('#chatSendBtn', 'click', function() {
        Chat.sendMessage();
      });

      // 右侧菜单项
      panel.querySelectorAll('.chat-right-item').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = btn.dataset.action;
          Chat.closeSidebars();
          App.showToast(action + ' 功能开发中');
        });
      });

      Chat.renderMessages();
      Chat.renderConvList();
    },

    renderConvList: function() {
      var body = App.$('#convListBody');
      if (!body) return;

      var convs = Chat.getConversations(Chat.currentUserId, Chat.currentCharacterId);

      if (!convs.length) {
        body.innerHTML = '<div class="empty-hint">暂无对话</div>';
        return;
      }

      body.innerHTML = convs.map(function(c) {
        var isActive = c.id === Chat.currentConversationId;
        return '<div class="conv-item' + (isActive ? ' active' : '') + '" data-id="' + c.id + '">' +
          '<div class="conv-item-title">' + App.esc(c.title) + '</div>' +
          '<button class="conv-del-btn" data-id="' + c.id + '" type="button">×</button>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.conv-item').forEach(function(item) {
        item.addEventListener('click', function() {
          Chat.currentConversationId = item.dataset.id;
          Chat.closeSidebars();
          Chat.renderChatView();
        });
      });

      body.querySelectorAll('.conv-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除这个对话？')) return;
          var delId = btn.dataset.id;
          Chat.deleteConversation(delId);
          if (Chat.currentConversationId === delId) {
            var remaining = Chat.getConversations(Chat.currentUserId, Chat.currentCharacterId);
            if (remaining.length) {
              Chat.currentConversationId = remaining[remaining.length - 1].id;
            } else {
              var newConv = Chat.createConversation(Chat.currentUserId, Chat.currentCharacterId);
              Chat.currentConversationId = newConv.id;
            }
          }
          Chat.closeSidebars();
          Chat.renderChatView();
        });
      });
    },

    renderMessages: function() {
      var container = App.$('#chatMessages');
      if (!container) return;

      var conv = Chat.getCurrentConversation();
      if (!conv || !conv.messages || !conv.messages.length) {
        container.innerHTML = '<div class="empty-hint">开始对话吧</div>';
        return;
      }

      container.innerHTML = conv.messages.map(function(msg) {
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

      var conv = Chat.getCurrentConversation();
      if (!conv) return;

      conv.messages.push({ role: 'user', content: text });
      input.value = '';
      Chat.save();
      Chat.renderMessages();

      setTimeout(function() {
        conv.messages.push({ role: 'assistant', content: '这是一条测试回复。' });
        Chat.save();
        Chat.renderMessages();
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
      Chat.load();
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
