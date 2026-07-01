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
      Wechat.currentPage = 'chats';
      Wechat.currentTab = 'chats';
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
      var pinned = [];
      var normal = [];
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
      var isFS = App.LS.get('wxFullScreen') || false;
      var wrapClass = isFS ? 'wx-fullscreen' : '';

      var showTab = Wechat.currentPage === 'chats';

      panel.innerHTML =
        '<div class="' + wrapClass + '" id="wxWrap"><div class="wx-phone"><div class="wx-inner" id="wxInner">' +

          '<div class="c6-header">' +
  '<div class="c6-header-btn" id="wxBackBtn"><svg viewBox="0 0 24 24" stroke="#000000"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></div>' +
  '<div class="c6-header-title">Chat</div>' +
  '<div style="position:relative;">' +
    '<div class="c6-header-btn" id="wxAddBtn"><svg viewBox="0 0 24 24" stroke="#000000"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>' +
              '<div class="c6-add-menu" id="wxAddMenu">' +
                '<div class="c6-add-menu-item" data-action="addFriend"><span>加好友</span></div>' +
                '<div class="c6-add-menu-item" data-action="toggleFrame"><span>' + (isFS ? '手机框模式' : '全屏模式') + '</span></div>' +
                '<div class="c6-add-menu-item" data-action="changeTheme"><span>更换主题</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="c6-main">' +

            (showTab ? (
            '<div class="c6-tab-wrap">' +
              '<div class="c6-tab-inner">' +
                '<div class="c6-tab-deco">' +
                  '<div class="c6-star-main"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></div>' +
                  '<div class="c6-star-sm c6-star-s1"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></div>' +
                '</div>' +
                '<div class="c6-tabs" id="c6Tabs">' +
                  '<div class="c6-tab' + (Wechat.currentTab === 'chats' ? ' c6-active' : '') + '" data-tab="chats">chats</div>' +
                  '<div class="c6-tab' + (Wechat.currentTab === 'groups' ? ' c6-active' : '') + '" data-tab="groups">groups</div>' +
                '</div>' +
                '<div class="c6-tab-icons">' +
  '<div class="c6-tab-icon"><svg viewBox="0 0 24 24" stroke="#000000"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>' +
'</div>' +
              '</div>' +
            '</div>'
            ) : '') +

            '<div class="c6-body" id="wxBody"></div>' +
          '</div>' +

          '<div class="c6-footer">' +
            '<div class="c6-footer-item' + (Wechat.currentPage === 'chats' ? ' c6-f-active' : '') + '" data-page="chats">' +
              '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.65 1.48 4.96 3.76 6.37-.24 1.25-.8 2.84-.8 2.84a1 1 0 0 0 1.25 1.05s2.5-.66 4.18-1.54C10.9 19.64 11.45 19.67 12 19.67c5.52 0 10-3.92 10-8.92S17.52 2 12 2z"/></svg></div>' +
              '<div class="c6-footer-label">Chats</div>' +
            '</div>' +
            '<div class="c6-footer-item' + (Wechat.currentPage === 'contacts' ? ' c6-f-active' : '') + '" data-page="contacts">' +
              '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>' +
              '<div class="c6-footer-label">Contacts</div>' +
            '</div>' +
            '<div class="c6-footer-item' + (Wechat.currentPage === 'discover' ? ' c6-f-active' : '') + '" data-page="discover">' +
              '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg></div>' +
              '<div class="c6-footer-label">Discover</div>' +
            '</div>' +
            '<div class="c6-footer-item' + (Wechat.currentPage === 'me' ? ' c6-f-active' : '') + '" data-page="me">' +
              '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></div>' +
              '<div class="c6-footer-label">Me</div>' +
            '</div>' +
          '</div>' +

        '</div></div></div>';

      Wechat.renderPage();
      Wechat.bindEvents();
    },

    renderPage: function() {
      var body = App.$('#wxBody');
      if (!body) return;

      if (Wechat.currentPage === 'chats') Wechat.renderChatTab(body);
      else if (Wechat.currentPage === 'contacts') Wechat.renderCharTab(body);
      else if (Wechat.currentPage === 'discover') body.innerHTML = '<div class="c6-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><div class="c6-empty-text">朋友圈功能开发中</div></div>';
      else if (Wechat.currentPage === 'me') Wechat.renderMeTab(body);
    },

    renderChatTab: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });
      visibleChars = Wechat.sortChars(visibleChars);

      if (!visibleChars.length) {
        body.innerHTML = '<div class="c6-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="c6-empty-text">暂无聊天<br>请先在「角色」中添加角色</div></div>';
        return;
      }

      body.innerHTML = visibleChars.map(function(c) {
        var isPinned = Wechat.isCharPinned(c.id);
        var alias = Wechat.getCharAlias(c.id);
        var displayName = alias || c.name || '未命名';

        var avatarHtml = c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '" alt="">'
          : '';

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

        return '<div class="c6-chat-item' + (isPinned ? ' pinned' : '') + '" data-char-id="' + c.id + '">' +
          '<div class="c6-chat-avatar c6-av-tap" data-char-id="' + c.id + '">' + avatarHtml + badgeHtml + '</div>' +
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
      if (left + 130 > window.innerWidth) left = rect.left - 130;
      if (top + 100 > window.innerHeight) top = window.innerHeight - 110;
      if (top < 10) top = 10;
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';

      document.body.appendChild(menu);

      menu.querySelectorAll('.c6-av-mi').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var act = item.dataset.act;
          menu.remove();

          if (act === 'pin') {
            Wechat.togglePin(charId);
            Wechat.renderPage();
            App.showToast(Wechat.isCharPinned(charId) ? '已置顶' : '已取消置顶');
          }

          if (act === 'rename') {
            var newName = prompt('备注名（留空恢复原名 "' + origName + '"）：', alias || '');
            if (newName === null) return;
            Wechat.setCharAlias(charId, newName.trim());
            Wechat.renderPage();
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

    renderCharTab: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });

      if (!visibleChars.length) {
        body.innerHTML = '<div class="c6-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="c6-empty-text">暂无角色<br>请在底部栏「角色」中添加</div></div>';
        return;
      }

      body.innerHTML = visibleChars.map(function(c) {
        var alias = Wechat.getCharAlias(c.id);
        var displayName = alias || c.name || '未命名';
        var avatarHtml = c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '" alt="">'
          : '';
        return '<div class="c6-chat-item" data-char-id="' + c.id + '">' +
          '<div class="c6-chat-avatar">' + avatarHtml + '</div>' +
          '<div class="c6-chat-info">' +
            '<div class="c6-chat-name">' + App.esc(displayName) + '</div>' +
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
      if (!App.user) { body.innerHTML = '<div class="c6-empty"><div class="c6-empty-text">用户模块未加载</div></div>'; return; }
      App.user.load();
      var users = App.user.list;

      if (!users.length) {
        body.innerHTML = '<div class="c6-empty"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><div class="c6-empty-text">还未创建用户身份</div><button class="c6-empty-btn" id="wxCreateUser">创建身份</button></div>';
        App.safeOn('#wxCreateUser', 'click', function() {
          if (App.user) App.user.renderProfile();
        });
        return;
      }

      // 有用户：顶部创建按钮 + 完整 PSP 卡片列表（带所有按键）
      var headerHtml =
        '<div class="c6-me-list-header">' +
          '<div class="c6-me-list-title">我的身份</div>' +
          '<div class="c6-me-list-add" id="wxMeCreateNew">+ 创建新身份</div>' +
        '</div>';

      body.innerHTML = headerHtml +
        '<div id="wxMeUserCards" style="padding:0 0 20px;"></div>' +
        '<div class="c6-me-list">' +
          '<div class="c6-me-item" id="wxMeFavs"><span class="c6-me-item-text">收藏</span><span class="c6-me-item-arrow">›</span></div>' +
          '<div class="c6-me-item" id="wxMeAssets"><span class="c6-me-item-text">资产</span><span class="c6-me-item-arrow">›</span></div>' +
          '<div class="c6-me-item" id="wxMeStickers"><span class="c6-me-item-text">表情包</span><span class="c6-me-item-arrow">›</span></div>' +
        '</div>';

      // 用 user 模块的 renderListInto 渲染完整卡片（带按键、配色、编辑、删除等）
      var cardsContainer = body.querySelector('#wxMeUserCards');
      if (App.user.renderListInto) {
        App.user.renderListInto(cardsContainer);
      }

      App.safeOn('#wxMeCreateNew', 'click', function() {
        if (App.user) App.user.renderProfile();
      });

      App.safeOn('#wxMeFavs', 'click', function() {
        Wechat.renderFavsPage(body);
      });

      App.safeOn('#wxMeAssets', 'click', function() { App.showToast('资产功能开发中'); });
      App.safeOn('#wxMeStickers', 'click', function() { App.showToast('表情包功能开发中'); });
    },

    renderFavsPage: function(body) {
      var favs = App.LS.get('chatFavorites') || [];

      var html = '<div class="c6-me-item" id="wxFavsBack"><span class="c6-me-item-text" style="color:rgba(0,0,0,0.4);">← 返回</span></div>';

      if (!favs.length) {
        html += '<div class="c6-empty"><div class="c6-empty-text">暂无收藏</div></div>';
      } else {
        html += favs.map(function(f, i) {
          var content = (f.content || '');
          var stickerMatch = content.match(/\[sticker:([^\]]+)\]/);
          var displayHtml = '';

          if (stickerMatch) {
            var desc = stickerMatch[1];
            var cacheKey = 'stickerCache_' + desc.replace(/\s+/g, '_').slice(0, 30);
            var stickerUrl = App.LS.get(cacheKey);
            if (stickerUrl) {
              displayHtml = '<img src="' + App.escAttr(stickerUrl) + '" style="width:80px;height:80px;border-radius:8px;object-fit:cover;display:block;margin-top:4px;">';
            } else {
              displayHtml = '<div style="font-size:13px;color:#333;line-height:1.5;">[表情包: ' + App.esc(desc) + ']</div>';
            }
            var textPart = content.replace(stickerMatch[0], '').trim();
            if (textPart) displayHtml += '<div style="font-size:13px;color:#333;line-height:1.5;margin-top:4px;">' + App.esc(textPart.slice(0, 100)) + '</div>';
          } else {
            displayHtml = '<div style="font-size:13px;color:#333;line-height:1.5;">' + App.esc(content.slice(0, 100)) + '</div>';
          }

          return '<div style="padding:12px 18px;border-bottom:1px solid rgba(0,0,0,0.04);">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
              '<span style="font-size:11px;color:rgba(0,0,0,0.4);">' + App.esc(f.charName || '') + '</span>' +
              '<button class="fav-del" data-fav-idx="' + i + '" type="button" style="background:none;border:1px solid rgba(0,0,0,0.12);border-radius:6px;color:rgba(0,0,0,0.4);font-size:10px;padding:2px 8px;cursor:pointer;font-family:inherit;">删除</button>' +
            '</div>' +
            displayHtml +
          '</div>';
        }).join('');
      }

      body.innerHTML = html;

      App.safeOn('#wxFavsBack', 'click', function() {
        Wechat.renderMeTab(body);
      });

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

    bindEvents: function() {
      App.safeOn('#wxBackBtn', 'click', function() { Wechat.close(); });

      App.safeOn('#wxAddBtn', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#wxAddMenu');
        if (menu) menu.classList.toggle('show');
      });

      if (Wechat.panelEl) {
        Wechat.panelEl.querySelectorAll('.c6-add-menu-item').forEach(function(item) {
          item.addEventListener('click', function(e) {
            e.stopPropagation();
            var menu = App.$('#wxAddMenu');
            if (menu) menu.classList.remove('show');

            if (item.dataset.action === 'addFriend') {
              App.showToast('加好友 · 开发中');
            } else if (item.dataset.action === 'toggleFrame') {
              var cur = App.LS.get('wxFullScreen') || false;
              App.LS.set('wxFullScreen', !cur);
              Wechat.render();
            } else if (item.dataset.action === 'changeTheme') {
              Wechat.close();
              setTimeout(function() { App.openPanel('themePanel'); }, 380);
            }
          });
        });

        Wechat.panelEl.addEventListener('click', function() {
          var menu = App.$('#wxAddMenu');
          if (menu) menu.classList.remove('show');
        });

        Wechat.panelEl.querySelectorAll('.c6-tab').forEach(function(tab) {
          tab.addEventListener('click', function() {
            Wechat.panelEl.querySelectorAll('.c6-tab').forEach(function(t) { t.classList.remove('c6-active'); });
            tab.classList.add('c6-active');
            Wechat.currentTab = tab.dataset.tab;
          });
        });

        Wechat.panelEl.querySelectorAll('.c6-footer-item').forEach(function(item) {
          item.addEventListener('click', function() {
            var newPage = item.dataset.page;
            if (newPage === Wechat.currentPage) return;
            Wechat.currentPage = newPage;
            Wechat.render();
          });
        });
      }

      var wxInner = App.$('#wxInner');
      if (wxInner) {
        var _wxSwipe = { active: false, sx: 0, sy: 0, locked: false, dir: '' };

        wxInner.addEventListener('touchstart', function(e) {
          var t = e.touches[0];
          var rect = wxInner.getBoundingClientRect();
          var relX = t.clientX - rect.left;
          if (relX > 50) return;
          _wxSwipe = { active: true, sx: t.clientX, sy: t.clientY, locked: false, dir: '' };
        }, { passive: true });

        wxInner.addEventListener('touchmove', function(e) {
          if (!_wxSwipe.active) return;
          var t = e.touches[0];
          var dx = t.clientX - _wxSwipe.sx;
          var dy = t.clientY - _wxSwipe.sy;
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
      Wechat.renderPage();
      Wechat.bindEvents();
    },

    renderTab: function() {
      var body = App.$('#wxBody');
      if (body && Wechat.currentTab === 'chats') Wechat.renderChatTab(body);
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

