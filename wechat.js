
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Wechat = {
    currentTab: 'chats',
    currentPage: 'chats',
    panelEl: null,
    _savedInner: '',

    showLoginModal: function(callback) {
      var users = App.user ? App.user.list : [];
      var old = document.querySelector('.wx-login-overlay');
      if(old) old.remove();

      var overlay = document.createElement('div');
      overlay.className = 'wx-login-overlay';
      
      if(!users.length) {
        overlay.innerHTML = 
          '<div class="wx-login-box">' +
            '<div class="wx-login-title">微信未登录</div>' +
            '<div class="wx-login-desc">你还没有创建任何用户身份</div>' +
            '<button id="wxGoCreateUser" class="wx-login-btn">去创建身份</button>' +
            '<div class="wx-login-cancel-wrap">' +
              '<button id="wxLoginCancel" class="wx-login-cancel">取消</button>' +
            '</div>' +
          '</div>';
        
        document.body.appendChild(overlay);
        requestAnimationFrame(function(){ overlay.classList.add('show'); });
        
        overlay.querySelector('#wxGoCreateUser').onclick = function() {
          overlay.classList.remove('show');
          setTimeout(function(){ 
            overlay.remove(); 
            if(App.user) App.user.open(); 
            if (!App.LS.get('wxActiveUid')) Wechat.close();
          }, 200);
        };
        overlay.querySelector('#wxLoginCancel').onclick = function() { 
          overlay.classList.remove('show'); 
          setTimeout(function(){ 
            overlay.remove(); 
            if (!App.LS.get('wxActiveUid')) Wechat.close();
          }, 200); 
        };
        return;
      }

      var listHtml = users.map(function(u) {
        var av = u.avatar ? '<img class="wx-login-avatar" src="'+App.escAttr(u.avatar)+'">' : '<div class="wx-login-avatar empty">无图</div>';
        return '<div class="wx-login-item" data-uid="'+u.id+'">' + av + '<div class="wx-login-name">'+App.esc(u.realName||'未命名')+'</div></div>';
      }).join('');

      overlay.innerHTML = 
        '<div class="wx-login-box wx-login-box-list">' +
          '<div class="wx-login-title">选择登录身份</div>' +
          '<div class="wx-login-list">' + listHtml + '</div>' +
          '<div class="wx-login-cancel-wrap">' +
            '<button id="wxLoginCancel" class="wx-login-cancel">取消</button>' +
          '</div>' +
        '</div>';
        
      document.body.appendChild(overlay);
      requestAnimationFrame(function(){ overlay.classList.add('show'); });

      overlay.querySelector('#wxLoginCancel').onclick = function() { 
        overlay.classList.remove('show'); 
        setTimeout(function(){ 
          overlay.remove(); 
          if (!App.LS.get('wxActiveUid')) {
            Wechat.close();
          }
        }, 200); 
      };
      
      overlay.querySelectorAll('.wx-login-item').forEach(function(item) {
        item.onclick = function() {
          App.LS.set('wxActiveUid', this.dataset.uid);
          overlay.classList.remove('show');
          setTimeout(function(){ overlay.remove(); if(callback) callback(); }, 200);
        };
      });
    },

    open: function() {
      if (App.user) App.user.load();
      var activeUid = App.LS.get('wxActiveUid');
      var users = App.user ? App.user.list : [];
      var valid = users.some(function(u){ return u.id === activeUid; });
      
      if(!valid) {
        App.LS.remove('wxActiveUid');
        Wechat.showLoginModal(function(){ Wechat._doOpen(); });
        return;
      }
      Wechat._doOpen();
    },

    _doOpen: function() {
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
      var activeUid = App.LS.get('wxActiveUid');
      var bindings = App.LS.get('charUserBindings') || {};
      if(bindings[c.id] !== activeUid) return false;

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
      var isFS = App.LS.get('wxFullScreen');
      if (isFS === null) isFS = true;
      var wxTheme = App.LS.get('wxTheme') || '';
      var themeClass = wxTheme ? ' wx-theme-' + wxTheme : '';
      var wrapClass = (isFS ? 'wx-fullscreen' : '') + themeClass;

      var showTab = Wechat.currentPage === 'chats';

      panel.innerHTML =
      '<div class="' + wrapClass + '" id="wxWrap"><div class="wx-phone"><div class="wx-side-key wx-side-right"></div><div class="wx-inner" id="wxInner">' +

        '<div class="c6-header">' +
          '<div class="c6-header-btn" id="wxBackBtn"><svg viewBox="0 0 24 24" class="c6-back-icon" stroke="#000000"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></div>' +
          '<div class="c6-header-title">Chat</div>' +
          '<div class="c6-header-right">' +
            '<div class="c6-header-btn" id="wxAddBtn"><svg viewBox="0 0 24 24" stroke="#000000"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>' +
            '<div class="c6-add-menu" id="wxAddMenu">' +
              '<div class="c6-add-menu-item" data-action="addFriend"><span>加好友</span></div>' +
              '<div class="c6-add-menu-item" data-action="toggleFrame"><span>' + (isFS ? '手机框模式' : '全屏模式') + '</span></div>' +
              '<div class="c6-add-menu-item c6-has-sub" data-action="changeTheme"><span>更换主题</span><span class="c6-sub-arrow">›</span>' +
                '<div class="c6-sub-menu" id="wxThemeSub">' +
                  '<div class="c6-add-menu-item" data-action="themeBlue"><span>蓝色主题</span></div>' +
                  '<div class="c6-add-menu-item" data-action="themePink"><span>粉色主题</span></div>' +
                  '<div class="c6-add-menu-item" data-action="themeDefault"><span>默认主题</span></div>' +
                '</div>' +
              '</div>' +
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
        body.innerHTML = '<div class="c6-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="c6-empty-text" style="line-height:1.6;">列表空空如也...<br>请在角色设置里，将角色绑定为当前账号</div></div>';
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
        body.innerHTML = '<div class="c6-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="c6-empty-text">通讯录为空<br>请在角色设置里，将角色绑定为当前账号</div></div>';
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

    /* 🌟 核心修改：真正的 CSS 变量应用，不再有任何静态 style 排版 */
    renderMeTab: function(body) {
      var activeUid = App.LS.get('wxActiveUid');
      var u = App.user ? App.user.getById(activeUid) : null;
      if (!u) return;

      var hue = u.cardHue != null ? u.cardHue : 215,
          sat = u.cardSat != null ? u.cardSat : 35,
          lit = u.cardLit != null ? u.cardLit : 90,
          radius = u.cardRadius != null ? u.cardRadius : 50;

      var bs = Math.max(0, Math.min(70, +sat));
      var bl = Math.max(30, Math.min(70, +lit));
      
      /* 这里的变量只是用来控制动态颜色，绝对没有 padding/margin */
      var vars = '--pc5:hsla('+hue+','+bs+'%,'+bl+'%,0.5);--pc25:hsla('+hue+','+bs+'%,'+bl+'%,0.25);--pc45:hsla('+hue+','+bs+'%,'+bl+'%,0.45);--pc35:hsla('+hue+','+bs+'%,'+bl+'%,0.35);--pc18:hsla('+hue+','+bs+'%,'+bl+'%,0.18);--pc1:hsla('+hue+','+bs+'%,'+bl+'%,0.1);';
      var cardBg = 'linear-gradient(155deg,hsla(' + hue + ',' + sat + '%,' + lit + '%,0.94),hsla(' + hue + ',' + sat + '%,' + (+lit+4) + '%,0.84) 30%,rgba(255,255,255,0.98) 52%,hsla(' + hue + ',' + sat + '%,' + (+lit+2) + '%,0.88) 74%,hsla(' + hue + ',' + sat + '%,' + lit + '%,0.92))';
      var borderC = 'hsla(' + hue + ',' + sat + '%,' + lit + '%,0.5)';
      
      var bgImgHtml = u.cardBg ? '<div class="p14-bg"><img src="' + App.escAttr(u.cardBg) + '"></div>' : '<div class="p14-bg"></div>';
      var avatarHtml = u.avatar ? '<img src="' + App.escAttr(u.avatar) + '">' : '';

      var pspCardHtml = 
        '<div class="c6-me-psp-wrap">' +
          '<div class="p14-card c6-me-psp-card" id="wxMePspCard" style="' + vars + 'background:' + cardBg + ';border-color:' + borderC + ';border-radius:' + radius + 'px;">' +
            bgImgHtml +
            '<div class="p14-top">' +
              '<div class="p14-led p14-led-on"></div><div class="p14-led"></div><div class="p14-led"></div>' +
            '</div>' +
            '<div class="p14-body c6-psp-body-pad">' + 
              '<div class="p14-left">' +
                '<div class="p14-side-btn c6-psp-hidden-btn">重置</div>' + 
                '<div class="p14-paw-btn c6-psp-readonly"><div class="p14-paw-inner"><div class="p14-pp p14-pp-t1"></div><div class="p14-pp p14-pp-t2"></div><div class="p14-pp p14-pp-t3"></div><div class="p14-pp p14-pp-t4"></div><div class="p14-pp p14-pp-main"></div></div></div>' +
                '<div class="p14-side-btn c6-psp-hidden-btn">删除</div>' + 
              '</div>' +
              '<div class="p14-screen-wrap"><div class="p14-screen c6-psp-screen-fix">' +
                '<div class="p14-screen-badge"><div class="p14-badge-dot"></div><div class="p14-badge-text">ACTIVE</div></div>' +
                '<div class="p14-screen-content">' +
                  '<div class="p14-avatar-wrap c6-psp-readonly"><div class="p14-avatar">' + avatarHtml + '</div></div>' +
                  '<div class="p14-info"><div class="p14-name">' + App.esc(u.realName || '未命名') + '</div>' +
                    (u.sign1 ? '<div class="p14-sign">' + App.esc(u.sign1) + '</div>' : '') +
                    (u.sign2 ? '<div class="p14-sign-italic">' + App.esc(u.sign2) + '</div>' : '') +
                  '</div>' +
                '</div>' +
              '</div></div>' +
              '<div class="p14-right">' +
                '<div class="p14-side-btn c6-psp-hidden-btn">编辑</div>' + 
                '<div class="p14-dpad c6-psp-readonly">' +
                  '<div class="p14-dpad-btn p14-dpad-up p14-dk">♠</div>' +
                  '<div class="p14-dpad-btn p14-dpad-left p14-dk">♣</div>' +
                  '<div class="p14-dpad-btn p14-dpad-right p14-rd">♦</div>' +
                  '<div class="p14-dpad-btn p14-dpad-down p14-rd">♥</div>' +
                '</div>' +
                '<div class="p14-side-btn c6-psp-hidden-btn">保存</div>' + 
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="c6-me-psp-hint">点击掌机即可修改档案</div>' +
        '</div>';

      body.innerHTML =
        pspCardHtml +
        '<div class="c6-me-list">' +
          '<div class="c6-me-item" id="wxMeFavs"><span class="c6-me-item-text">收藏</span><span class="c6-me-item-arrow">›</span></div>' +
          '<div class="c6-me-item" id="wxMeAssets"><span class="c6-me-item-text">资产</span><span class="c6-me-item-arrow">›</span></div>' +
          '<div class="c6-me-item" id="wxMeStickers"><span class="c6-me-item-text">表情包</span><span class="c6-me-item-arrow">›</span></div>' +
        '</div>' +
        '<div class="c6-me-list c6-me-list-mt">' +
          '<div class="c6-me-item" id="wxMeLogout"><span class="c6-me-item-text c6-me-logout-text">切换身份 / 退出账号</span></div>' +
        '</div>';

      App.safeOn('#wxMeFavs', 'click', function() { Wechat.renderFavsPage(body); });
      App.safeOn('#wxMeAssets', 'click', function() { App.showToast('资产功能开发中'); });
      App.safeOn('#wxMeStickers', 'click', function() { App.showToast('表情包功能开发中'); });
      
      App.safeOn('#wxMeLogout', 'click', function() {
        App.LS.remove('wxActiveUid');
        App.showToast('已退出当前微信');
        Wechat.showLoginModal(function(){ Wechat.renderPage(); });
      });

      App.safeOn('#wxMePspCard', 'click', function() {
        if(App.user) {
          App.user.renderProfile(activeUid);
          var checker = setInterval(function() {
            if (!document.getElementById('userProfilePanel')) {
              clearInterval(checker);
              if (Wechat.currentPage === 'me') Wechat.renderPage();
            }
          }, 300);
        }
      });
    },

    renderFavsPage: function(body) {
      var favs = App.LS.get('chatFavorites') || [];
      var html = '<div class="c6-me-item" id="wxFavsBack"><span class="c6-me-item-text c6-fav-back-text">← 返回</span></div>';

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
              displayHtml = '<img class="c6-fav-img" src="' + App.escAttr(stickerUrl) + '">';
            } else {
              displayHtml = '<div class="c6-fav-text no-mt">[表情包: ' + App.esc(desc) + ']</div>';
            }
            var textPart = content.replace(stickerMatch[0], '').trim();
            if (textPart) displayHtml += '<div class="c6-fav-text">' + App.esc(textPart.slice(0, 100)) + '</div>';
          } else {
            displayHtml = '<div class="c6-fav-text no-mt">' + App.esc(content.slice(0, 100)) + '</div>';
          }

          return '<div class="c6-fav-item">' +
            '<div class="c6-fav-head">' +
              '<span class="c6-fav-char">' + App.esc(f.charName || '') + '</span>' +
              '<button class="c6-fav-del" data-fav-idx="' + i + '" type="button">删除</button>' +
            '</div>' +
            displayHtml +
          '</div>';
        }).join('');
      }

      body.innerHTML = html;

      App.safeOn('#wxFavsBack', 'click', function() {
        Wechat.renderMeTab(body);
      });

      body.querySelectorAll('.c6-fav-del').forEach(function(btn) {
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

            if (item.dataset.action === 'changeTheme') {
              var sub = item.querySelector('.c6-sub-menu');
              if (sub) sub.classList.toggle('show');
              return;
            }

            var menu = App.$('#wxAddMenu');
            if (menu) menu.classList.remove('show');

            if (item.dataset.action === 'addFriend') {
              App.showToast('加好友 · 开发中');
            } else if (item.dataset.action === 'toggleFrame') {
              var cur = App.LS.get('wxFullScreen') || false;
              App.LS.set('wxFullScreen', !cur);
              Wechat.render();
            } else if (item.dataset.action === 'themeBlue') {
              App.LS.set('wxTheme', 'blue');
              Wechat.render();
              App.showToast('已切换蓝色主题');
            } else if (item.dataset.action === 'themePink') {
              App.LS.set('wxTheme', 'pink');
              Wechat.render();
              App.showToast('已切换粉色主题');
            } else if (item.dataset.action === 'themeDefault') {
              App.LS.set('wxTheme', '');
              Wechat.render();
              App.showToast('已恢复默认主题');
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
          if (document.getElementById('userProfilePanel')) return;

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
