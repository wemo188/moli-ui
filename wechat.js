(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Wechat = {
    currentTab: 'chat',
    currentFooter: 'chats',
    panelEl: null,
    _savedInner: '',

    open: function() {
      var panel = App.$('#wechatPanel');
      if (!panel) return;
      Wechat.panelEl = panel;
      Wechat.currentTab = 'chats';
      Wechat.currentFooter = 'chats';
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

    isCharVisible: function(c) {
      if (!c.contactMode || c.contactMode === 'direct') return true;
      if (c.contactAccepted === true) return true;
      return false;
    },

    getCharAlias: function(charId) {
      var aliases = App.LS.get('wxAliases') || {};
      return aliases[charId] || '';
    },

    setCharAlias: function(charId, name) {
      var aliases = App.LS.get('wxAliases') || {};
      if (name) aliases[charId] = name;
      else delete aliases[charId];
      App.LS.set('wxAliases', aliases);
    },

    isCharPinned: function(charId) {
      var pins = App.LS.get('wxPins') || [];
      return pins.indexOf(charId) >= 0;
    },

    togglePin: function(charId) {
      var pins = App.LS.get('wxPins') || [];
      var idx = pins.indexOf(charId);
      if (idx >= 0) pins.splice(idx, 1);
      else pins.unshift(charId);
      App.LS.set('wxPins', pins);
    },

    sortChars: function(chars) {
      var pins = App.LS.get('wxPins') || [];
      var pinned = [], normal = [];
      chars.forEach(function(c) {
        if (pins.indexOf(c.id) >= 0) pinned.push(c);
        else normal.push(c);
      });
      pinned.sort(function(a, b) { return pins.indexOf(a.id) - pins.indexOf(b.id); });
      return pinned.concat(normal);
    },

    render: function() {
      var panel = Wechat.panelEl;
      if (!panel) return;

      panel.innerHTML =
        '<div class="c6-wrap" id="c6Wrap">' +
          '<div class="c6-phone" id="c6Phone">' +
            '<div class="c6-inner" id="wxInner">' +
              // 顶部导航
              '<div class="c6-header">' +
                '<div class="c6-header-btn" id="wxBackBtn">' +
                  '<svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>' +
                '</div>' +
                '<div class="c6-header-title">Chat</div>' +
                '<div style="position:relative;">' +
                  '<div class="c6-header-btn" id="wxAddBtn">' +
                    '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
                  '</div>' +
                  '<div class="c6-add-menu" id="wxAddMenu"></div>' +
                '</div>' +
              '</div>' +
              // 主体
              '<div class="c6-main">' +
                // Tab栏
                '<div class="c6-tab-wrap">' +
                  '<div class="c6-tab-inner">' +
                    '<div class="c6-tab-deco">' +
                      '<div class="c6-star-main"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></div>' +
                      '<div class="c6-star-sm c6-star-s1"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></div>' +
                    '</div>' +
                    '<div class="c6-tabs" id="c6Tabs">' +
                      '<div class="c6-tab ' + (Wechat.currentTab === 'chats' ? 'c6-active' : '') + '" data-tab="chats">chats</div>' +
                      '<div class="c6-tab ' + (Wechat.currentTab === 'groups' ? 'c6-active' : '') + '" data-tab="groups">groups</div>' +
                    '</div>' +
                    '<div class="c6-tab-icons">' +
                      '<div class="c6-tab-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
                // 内容区
                '<div class="c6-body" id="c6Body"></div>' +
              '</div>' +
              // 底部导航
              '<div class="c6-footer">' +
                Wechat._buildFooter() +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      Wechat._buildAddMenu();
      Wechat.renderBody();
      Wechat.bindEvents();
    },

    _buildFooter: function() {
      var items = [
        { page: 'chats', label: 'Chats', svg: '<path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.65 1.48 4.96 3.76 6.37-.24 1.25-.8 2.84-.8 2.84a1 1 0 0 0 1.25 1.05s2.5-.66 4.18-1.54C10.9 19.64 11.45 19.67 12 19.67c5.52 0 10-3.92 10-8.92S17.52 2 12 2z"/>' },
        { page: 'contacts', label: 'Contacts', svg: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>' },
        { page: 'discover', label: 'Discover', svg: '<path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/>' },
        { page: 'me', label: 'Me', svg: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>' }
      ];
      return items.map(function(it) {
        var active = Wechat.currentFooter === it.page ? ' c6-f-active' : '';
        return '<div class="c6-footer-item' + active + '" data-page="' + it.page + '">' +
          '<div class="c6-footer-icon"><svg viewBox="0 0 24 24">' + it.svg + '</svg></div>' +
          '<div class="c6-footer-label">' + it.label + '</div>' +
        '</div>';
      }).join('');
    },

    _buildAddMenu: function() {
      var menu = App.$('#wxAddMenu');
      if (!menu) return;

      var isFS = App.LS.get('wxFullScreen') || false;
      var curShape = 'round'; // 聊天内头像形状存在chat里，这里用全局
      var avHide = false;

      menu.innerHTML =
        '<div class="c6-add-mi" data-act="frameMode">' +
          '<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' +
          '<span>' + (isFS ? '切换手机框' : '切换全屏') + '</span>' +
        '</div>' +
        '<div class="c6-add-mi" data-act="avShape">' +
          '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="9"/></svg>' +
          '<span>头像形状</span>' +
        '</div>' +
        '<div class="c6-add-mi" data-act="avHide">' +
          '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>' +
          '<span>显示/隐藏头像</span>' +
        '</div>';

      menu.querySelectorAll('.c6-add-mi').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          menu.classList.remove('show');
          var act = item.dataset.act;
          if (act === 'frameMode') {
            var cur = App.LS.get('wxFullScreen') || false;
            App.LS.set('wxFullScreen', !cur);
            Wechat.render();
          } else if (act === 'avShape') {
            // 全局头像形状切换
            if (App.chat && App.chat.charId) {
              var curS = App.LS.get('chatAvShape_' + App.chat.charId) || 'round';
              var nextS = curS === 'round' ? 'square' : 'round';
              App.LS.set('chatAvShape_' + App.chat.charId, nextS);
              App.showToast(nextS === 'round' ? '圆形头像' : '方形头像');
            } else {
              App.showToast('请先进入聊天后设置');
            }
          } else if (act === 'avHide') {
            if (App.chat && App.chat.charId) {
              var curH = App.LS.get('chatAvHide_' + App.chat.charId) || false;
              App.LS.set('chatAvHide_' + App.chat.charId, !curH);
              App.showToast(!curH ? '已隐藏头像' : '已显示头像');
            } else {
              App.showToast('请先进入聊天后设置');
            }
          }
        });
      });
    },

    renderBody: function() {
      var body = App.$('#c6Body');
      if (!body) return;
      var footer = Wechat.currentFooter;
      if (footer === 'chats') Wechat.renderChatsBody(body);
      else if (footer === 'contacts') Wechat.renderContactsBody(body);
      else if (footer === 'discover') Wechat.renderDiscoverBody(body);
      else if (footer === 'me') Wechat.renderMeBody(body);
    },

    renderChatsBody: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });
      visibleChars = Wechat.sortChars(visibleChars);

      if (!visibleChars.length) {
        body.innerHTML = '<div class="c6-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="c6-empty-text">暂无角色<br>请先在底部「档案」中创建角色</div></div>';
        return;
      }

      body.innerHTML = visibleChars.map(function(c) {
        var alias = Wechat.getCharAlias(c.id);
        var displayName = alias || c.name || '未命名';
        var isPinned = Wechat.isCharPinned(c.id);

        var avatarHtml = c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '" class="c6-av-img">'
          : '<div class="c6-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';

        var lastMsg = '';
        var lastTime = '';
        var msgs = App.LS.get('chatMsgs_' + c.id);
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

        return '<div class="c6-chat-item' + (isPinned ? ' c6-pinned' : '') + '" data-char-id="' + c.id + '">' +
          '<div class="c6-chat-avatar c6-av-tap" data-char-id="' + c.id + '" style="position:relative;">' +
            avatarHtml + badgeHtml +
          '</div>' +
          '<div class="c6-chat-info c6-content-tap" data-char-id="' + c.id + '">' +
            '<div class="c6-chat-name">' + App.esc(displayName) + '</div>' +
            '<div class="c6-chat-msg">' + App.esc(lastMsg || '点击开始聊天') + '</div>' +
          '</div>' +
          '<div class="c6-chat-meta">' +
            '<div class="c6-chat-time">' + lastTime + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.c6-av-tap').forEach(function(av) {
        av.addEventListener('click', function(e) {
          e.stopPropagation();
          Wechat.showAvatarMenu(av.dataset.charId, av);
        });
      });

      body.querySelectorAll('.c6-content-tap').forEach(function(ct) {
        ct.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = ct.dataset.charId;
          if (id && App.chat) App.chat.openInWechat(id);
        });
      });
    },

    renderContactsBody: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });

      if (!visibleChars.length) {
        body.innerHTML = '<div class="c6-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="c6-empty-text">暂无联系人</div></div>';
        return;
      }

      body.innerHTML = visibleChars.map(function(c) {
        var alias = Wechat.getCharAlias(c.id);
        var displayName = alias || c.name || '未命名';
        var avatarHtml = c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '" class="c6-av-img">'
          : '<div class="c6-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="c6-chat-item" data-char-id="' + c.id + '">' +
          '<div class="c6-chat-avatar">' + avatarHtml + '</div>' +
          '<div class="c6-chat-info" style="cursor:pointer;" data-char-id="' + c.id + '">' +
            '<div class="c6-chat-name">' + App.esc(displayName) + '</div>' +
            '<div class="c6-chat-msg">' + App.esc(c.relation || c.sign || '') + '</div>' +
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

    renderDiscoverBody: function(body) {
      body.innerHTML = '<div class="c6-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><div class="c6-empty-text">朋友圈功能开发中</div></div>';
    },

    renderMeBody: function(body) {
      // Me页面 = 用户身份创建/管理
      var user = App.user ? App.user.getActiveUser() : null;
      var name = user ? (user.nickname || user.realName || '未设置') : '尚未创建用户';
      var avatarHtml = user && user.avatar
        ? '<img src="' + App.escAttr(user.avatar) + '" style="width:100%;height:100%;object-fit:cover;display:block;">'
        : '<svg viewBox="0 0 24 24" style="width:30px;height:30px;stroke:rgba(0,0,0,0.25);fill:none;stroke-width:1.5;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';

      body.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;padding:28px 20px 16px;gap:10px;">' +
          '<div style="width:72px;height:72px;border-radius:50%;background:rgba(0,0,0,0.06);overflow:hidden;display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(0,0,0,0.08);">' +
            avatarHtml +
          '</div>' +
          '<div style="font-size:16px;font-weight:700;color:rgba(0,0,0,0.75);">' + App.esc(name) + '</div>' +
          (user ? '<div style="font-size:11px;color:rgba(0,0,0,0.35);">' + App.esc(user.sign1 || '') + '</div>' : '') +
        '</div>' +
        '<div style="padding:0 12px;display:flex;flex-direction:column;gap:6px;">' +
          '<div class="c6-me-link" id="wxMeEdit">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:rgba(0,0,0,0.4);stroke-width:2;stroke-linecap:round;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
              '<span>' + (user ? '编辑用户身份' : '创建用户身份') + '</span>' +
            '</div>' +
            '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:rgba(0,0,0,0.25);stroke-width:2;stroke-linecap:round;"><path d="M9 18l6-6-6-6"/></svg>' +
          '</div>' +
          '<div class="c6-me-link" id="wxMeFavs">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:rgba(0,0,0,0.4);stroke-width:2;stroke-linecap:round;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>' +
              '<span>收藏</span>' +
            '</div>' +
            '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:rgba(0,0,0,0.25);stroke-width:2;stroke-linecap:round;"><path d="M9 18l6-6-6-6"/></svg>' +
          '</div>' +
        '</div>';

      var editBtn = body.querySelector('#wxMeEdit');
      if (editBtn) {
        editBtn.addEventListener('click', function() {
          if (App.user) App.user.renderProfile(user ? user.id : null);
        });
      }
      var favsBtn = body.querySelector('#wxMeFavs');
      if (favsBtn) {
        favsBtn.addEventListener('click', function() {
          Wechat.renderFavsPage(body);
        });
      }
    },

    renderFavsPage: function(body) {
      var favs = App.LS.get('chatFavorites') || [];

      var html = '<div class="c6-me-link" id="wxFavsBack" style="margin:8px 12px 4px;">' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:rgba(0,0,0,0.4);stroke-width:2;stroke-linecap:round;"><path d="M15 18l-6-6 6-6"/></svg>' +
          '<span style="font-size:12px;color:rgba(0,0,0,0.4);">返回</span>' +
        '</div>' +
        '<span></span>' +
      '</div>';

      if (!favs.length) {
        html += '<div class="c6-empty"><div class="c6-empty-text">暂无收藏</div></div>';
      } else {
        html += '<div style="padding:0 12px;">';
        favs.forEach(function(f, i) {
          var content = f.content || '';
          html += '<div style="padding:10px 12px;background:rgba(0,0,0,0.03);border-radius:12px;margin-bottom:6px;">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
              '<span style="font-size:10px;color:rgba(0,0,0,0.35);">' + App.esc(f.charName || '') + '</span>' +
              '<div style="display:flex;gap:6px;">' +
                '<button class="fav-del" data-fav-idx="' + i + '" type="button" style="background:none;border:1px solid rgba(0,0,0,0.1);border-radius:6px;color:rgba(0,0,0,0.4);font-size:10px;padding:2px 8px;cursor:pointer;font-family:inherit;">删除</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:13px;color:rgba(0,0,0,0.7);line-height:1.5;">' + App.esc(content.slice(0, 100)) + '</div>' +
          '</div>';
        });
        html += '</div>';
      }

      body.innerHTML = html;
      var back = body.querySelector('#wxFavsBack');
      if (back) back.addEventListener('click', function() { Wechat.renderMeBody(body); });
      body.querySelectorAll('.fav-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(btn.dataset.favIdx);
          favs.splice(idx, 1);
          App.LS.set('chatFavorites', favs);
          Wechat.renderFavsPage(body);
          App.showToast('已删除');
        });
      });
    },

    showAvatarMenu: function(charId, avEl) {
      var old = document.querySelector('.c6-av-menu');
      if (old) old.remove();

      var isPinned = Wechat.isCharPinned(charId);
      var c = App.character ? App.character.getById(charId) : null;
      var origName = c ? c.name : '未命名';
      var alias = Wechat.getCharAlias(charId);

      var menu = document.createElement('div');
      menu.className = 'c6-av-menu';
      menu.innerHTML =
        '<div class="c6-av-mi" data-act="pin">' + (isPinned ? '取消置顶' : '置顶') + '</div>' +
        '<div class="c6-av-mi" data-act="rename">备注</div>';

      var rect = avEl.getBoundingClientRect();
      var left = rect.right + 6;
      var top = rect.top;
      if (left + 120 > window.innerWidth) left = rect.left - 120;
      if (top + 80 > window.innerHeight) top = window.innerHeight - 90;
      if (top < 10) top = 10;
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
      document.body.appendChild(menu);

      menu.querySelectorAll('.c6-av-mi').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          menu.remove();
          if (item.dataset.act === 'pin') {
            Wechat.togglePin(charId);
            Wechat.renderBody();
            App.showToast(Wechat.isCharPinned(charId) ? '已置顶' : '已取消置顶');
          }
          if (item.dataset.act === 'rename') {
            var newName = prompt('备注名（留空恢复原名 "' + origName + '"）：', alias || '');
            if (newName === null) return;
            Wechat.setCharAlias(charId, newName.trim());
            Wechat.renderBody();
            App.showToast(newName.trim() ? '已备注' : '已恢复原名');
          }
        });
      });

      function dismiss(ev) {
        if (menu.parentNode && !menu.contains(ev.target)) {
          menu.remove();
          document.removeEventListener('touchstart', dismiss);
          document.removeEventListener('click', dismiss);
        }
      }
      setTimeout(function() {
        document.addEventListener('touchstart', dismiss, { passive: true });
        document.addEventListener('click', dismiss);
      }, 100);
    },

    bindEvents: function() {
      App.safeOn('#wxBackBtn', 'click', function() { Wechat.close(); });

      App.safeOn('#wxAddBtn', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#wxAddMenu');
        if (menu) menu.classList.toggle('show');
      });

      // Tab切换
      var tabs = App.$$('#c6Tabs .c6-tab');
      if (tabs) {
        tabs.forEach(function(tab) {
          tab.addEventListener('click', function() {
            tabs.forEach(function(t) { t.classList.remove('c6-active'); });
            tab.classList.add('c6-active');
            Wechat.currentTab = tab.dataset.tab;
          });
        });
      }

      // 底部导航
      var footerItems = App.$$('.c6-footer-item');
      if (footerItems) {
        footerItems.forEach(function(item) {
          item.addEventListener('click', function() {
            footerItems.forEach(function(i) { i.classList.remove('c6-f-active'); });
            item.classList.add('c6-f-active');
            Wechat.currentFooter = item.dataset.page;
            Wechat.renderBody();
          });
        });
      }

      // 关闭加号菜单
      if (Wechat.panelEl) {
        Wechat.panelEl.addEventListener('click', function() {
          var menu = App.$('#wxAddMenu');
          if (menu) menu.classList.remove('show');
        });
      }

      // 左滑返回
      var wxInner = App.$('#wxInner');
      if (wxInner) {
        var _wxSwipe = { active: false, sx: 0, sy: 0, locked: false, dir: '' };
        wxInner.addEventListener('touchstart', function(e) {
          var t = e.touches[0];
          var rect = wxInner.getBoundingClientRect();
          if (t.clientX - rect.left > 50) return;
          _wxSwipe = { active: true, sx: t.clientX, sy: t.clientY, locked: false, dir: '' };
        }, { passive: true });
        wxInner.addEventListener('touchmove', function(e) {
          if (!_wxSwipe.active) return;
          var t = e.touches[0];
          var dx = t.clientX - _wxSwipe.sx, dy = t.clientY - _wxSwipe.sy;
          if (!_wxSwipe.locked) {
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
            _wxSwipe.locked = true;
            _wxSwipe.dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
          }
          if (_wxSwipe.dir === 'h' && dx > 0) {
            e.preventDefault();
            var w = wxInner.offsetWidth || window.innerWidth;
            wxInner.style.transform = 'translateX(' + Math.min(dx, w) + 'px)';
            wxInner.style.opacity = String(1 - dx / w * 0.5);
          }
        }, { passive: false });
        wxInner.addEventListener('touchend', function(e) {
          if (!_wxSwipe.active) return;
          _wxSwipe.active = false;
          if (_wxSwipe.dir !== 'h') { wxInner.style.transform = ''; wxInner.style.opacity = ''; return; }
          var t = e.changedTouches[0];
          var dx = t.clientX - _wxSwipe.sx;
          var w = wxInner.offsetWidth || window.innerWidth;
          if (dx > w * 0.3) {
            wxInner.style.transition = 'transform .25s ease, opacity .25s ease';
            wxInner.style.transform = 'translateX(100%)';
            wxInner.style.opacity = '0';
            setTimeout(function() {
              Wechat.close();
              setTimeout(function() {
                wxInner.style.transition = '';
                wxInner.style.transform = '';
                wxInner.style.opacity = '';
              }, 50);
            }, 260);
          } else {
            wxInner.style.transition = 'transform .2s ease, opacity .2s ease';
            wxInner.style.transform = '';
            wxInner.style.opacity = '';
            setTimeout(function() { wxInner.style.transition = ''; }, 220);
          }
        }, { passive: true });
      }
    },

    restoreInner: function() {
      var inner = App.$('#wxInner');
      if (!inner || !Wechat._savedInner) return;
      inner.innerHTML = Wechat._savedInner;
      Wechat._savedInner = '';
      Wechat.renderBody();
      Wechat.bindEvents();
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