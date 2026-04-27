(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Wechat = {
    currentTab: 'chat',
    panelEl: null,
    _savedInner: '',

    open: function() {
      var panel = App.$('#wechatPanel');
      if (!panel) return;
      Wechat.panelEl = panel;
      Wechat.currentTab = 'chat';
      Wechat.render();
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    close: function() {
      var panel = App.$('#wechatPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    isCharVisible: function(c) {
      if (!c.contactMode || c.contactMode === 'direct') return true;
      if (c.contactAccepted === true) return true;
      return false;
    },

    render: function() {
      var panel = Wechat.panelEl;
      if (!panel) return;
      var isFS = App.LS.get('wxFullScreen') || false;
      var wrapClass = isFS ? 'wx-fullscreen' : '';

      panel.innerHTML =
        '<div class="' + wrapClass + '" id="wxWrap"><div class="wx-phone"><div class="wx-inner" id="wxInner">' +
          '<div class="wx-header">' +
            '<button class="wx-header-btn" id="wxBackBtn" type="button">' +
              '<svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>' +
            '</button>' +
            '<div style="flex:1;"></div>' +
            '<button class="wx-me-mode-btn" id="wxModeToggle" type="button" style="display:none;position:relative;z-index:1;">' +
              '<span class="wx-me-mode-val">' + (isFS ? '全屏' : '手机') + '</span>' +
              '<span class="wx-me-mode-switch">切换</span>' +
            '</button>' +
            '<div style="flex:1;"></div>' +
            '<div style="position:relative;">' +
              '<button class="wx-header-btn" id="wxAddBtn" type="button">' +
                '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '</button>' +
              '<div class="wx-add-menu" id="wxAddMenu">' +
                '<div class="wx-add-menu-item" data-action="addFriend"><span>加好友</span></div>' +
                '<div class="wx-add-menu-item" data-action="changeTheme"><span>更换主题</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="wx-search"><div class="wx-search-bar">' +
            '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>' +
            '<span>搜索</span>' +
          '</div></div>' +
          '<div class="wx-body" id="wxBody"></div>' +
          '<div class="wx-tabbar">' +
            '<div class="wx-tab' + (Wechat.currentTab === 'chat' ? ' active' : '') + '" data-tab="chat">' +
              '<svg viewBox="0 0 64 64" style="width:28px;height:28px;"><path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="23" y1="28" x2="41" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="34" x2="35" y2="34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
              '<span>聊天</span>' +
            '</div>' +
            '<div class="wx-tab' + (Wechat.currentTab === 'char' ? ' active' : '') + '" data-tab="char">' +
              '<svg viewBox="0 0 64 64" style="width:28px;height:28px;"><path d="M4 34H14L18 26L23 42L28 20L33 38L37 30H44" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M52 28C52 25 50 23 48 23C46 23 44.5 25 44.5 25C44.5 25 43 23 41 23C39 23 37 25 37 28C37 32 44.5 37 44.5 37C44.5 37 52 32 52 28Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="44" y1="34" x2="60" y2="34" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
              '<span>通讯录</span>' +
            '</div>' +
            '<div class="wx-tab' + (Wechat.currentTab === 'moments' ? ' active' : '') + '" data-tab="moments">' +
              '<svg viewBox="0 0 64 64" style="width:28px;height:28px;"><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(120 32 32)"/></svg>' +
              '<span>朋友圈</span>' +
            '</div>' +
            '<div class="wx-tab' + (Wechat.currentTab === 'me' ? ' active' : '') + '" data-tab="me">' +
              '<svg viewBox="0 0 64 64" style="width:28px;height:28px;"><defs><pattern id="wx-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" stroke-width="2.2"/></pattern></defs><circle cx="32" cy="33" r="21" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="url(#wx-hatch)" stroke="currentColor" stroke-width="1.6"/></svg>' +
              '<span>我的</span>' +
            '</div>' +
          '</div>' +
        '</div></div></div>';

      Wechat.renderTab();
      Wechat.bindEvents();
    },

    renderTab: function() {
      var body = App.$('#wxBody');
      if (!body) return;
      var search = Wechat.panelEl.querySelector('.wx-search');
      var modeBtn = Wechat.panelEl.querySelector('#wxModeToggle');

      if (Wechat.currentTab === 'me') {
        if (search) search.style.display = 'none';
        if (modeBtn) modeBtn.style.display = '';
      } else {
        if (search) search.style.display = '';
        if (modeBtn) modeBtn.style.display = 'none';
      }

      if (Wechat.currentTab === 'chat') Wechat.renderChatTab(body);
      else if (Wechat.currentTab === 'char') Wechat.renderCharTab(body);
      else if (Wechat.currentTab === 'moments') body.innerHTML = '<div class="wx-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><div class="wx-empty-text">朋友圈功能开发中</div></div>';
      else if (Wechat.currentTab === 'me') Wechat.renderMeTab(body);
    },

    renderChatTab: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });

      if (!visibleChars.length) {
        body.innerHTML = '<div class="wx-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="wx-empty-text">暂无聊天<br>请先在「角色」中添加角色</div></div>';
        return;
      }
      body.innerHTML = visibleChars.map(function(c) {
        var avatarHtml = c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '" alt="">'
          : '<div class="wx-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        var lastMsg = '';
        var msgs = App.LS.get('chatMsgs_' + c.id);
        if (msgs && msgs.length) {
          var last = msgs[msgs.length - 1];
          lastMsg = (last.content || '').split('|||')[0].slice(0, 25);
        }
        return '<div class="wx-chat-item" data-char-id="' + c.id + '">' +
          '<div class="wx-avatar">' + avatarHtml + '</div>' +
          '<div class="wx-chat-content">' +
            '<div class="wx-chat-top"><span class="wx-chat-name">' + App.esc(c.name || '未命名') + '</span></div>' +
            '<div class="wx-chat-msg">' + App.esc(lastMsg || '点击开始聊天') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      /* ★ 修改：不再关闭微信，直接在 wx-inner 内打开聊天 */
      body.querySelectorAll('.wx-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var id = item.dataset.charId;
          if (id && App.chat) {
            App.chat.openInWechat(id);
          }
        });
      });
    },

    renderCharTab: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });
      var pendingCount = chars.filter(function(c) {
        return c.contactMode && c.contactMode !== 'direct' && !c.contactAccepted;
      }).length;

      if (!visibleChars.length && !pendingCount) {
        body.innerHTML = '<div class="wx-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="wx-empty-text">暂无角色<br>请在底部栏「角色」中添加</div></div>';
        return;
      }
      var listHtml = visibleChars.map(function(c) {
        var avatarHtml = c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '" alt="">'
          : '<div class="wx-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="wx-chat-item" data-char-id="' + c.id + '">' +
          '<div class="wx-avatar">' + avatarHtml + '</div>' +
          '<div class="wx-chat-content">' +
            '<div class="wx-chat-top"><span class="wx-chat-name">' + App.esc(c.name || '未命名') + '</span></div>' +
            '<div class="wx-chat-msg">' + App.esc((c.profile || '').split('\n')[0].slice(0, 30) || '暂无简介') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      var pendingHtml = '';
      if (pendingCount > 0) {
        pendingHtml = '<div style="padding:16px 20px;text-align:center;color:#999;font-size:12px;letter-spacing:0.5px;border-top:1px solid rgba(0,0,0,0.04);margin-top:8px;">' +
          pendingCount + ' 位角色等待添加好友</div>';
      }
      body.innerHTML = listHtml + pendingHtml;
    },

    /* ★ 修改：删掉了"user资料"链接 */
    renderMeTab: function(body) {
      var user = App.user ? App.user.getActiveUser() : null;
      var name = user ? (user.nickname || user.realName || '未命名') : '未创建用户';
      var avatarHtml = user && user.avatar
        ? '<div class="wx-avatar-placeholder" style="width:80px;height:80px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);overflow:hidden;"><img src="' + App.escAttr(user.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;border:none;outline:none;"></div>'
        : '<div class="wx-avatar-placeholder" style="width:80px;height:80px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);"><svg viewBox="0 0 24 24" style="width:30px;height:30px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';
      body.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;padding:30px 20px 16px;gap:12px;">' +
          avatarHtml +
          '<div style="font-size:17px;font-weight:600;color:#2e4258;">' + App.esc(name) + '</div>' +
        '</div>';
    },

    bindEvents: function() {
      App.safeOn('#wxBackBtn', 'click', function() { Wechat.close(); });

      App.safeOn('#wxModeToggle', 'click', function() {
        var current = App.LS.get('wxFullScreen') || false;
        var next = !current;
        App.LS.set('wxFullScreen', next);
        var wrap = App.$('#wxWrap');
        if (wrap) {
          if (next) wrap.classList.add('wx-fullscreen');
          else wrap.classList.remove('wx-fullscreen');
        }
        var valEl = Wechat.panelEl.querySelector('.wx-me-mode-val');
        if (valEl) valEl.textContent = next ? '全屏' : '手机';
      });

      App.safeOn('#wxAddBtn', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#wxAddMenu');
        if (menu) menu.classList.toggle('show');
      });

      if (Wechat.panelEl) {
        Wechat.panelEl.querySelectorAll('.wx-add-menu-item').forEach(function(item) {
          item.addEventListener('click', function(e) {
            e.stopPropagation();
            var menu = App.$('#wxAddMenu');
            if (menu) menu.classList.remove('show');
            if (item.dataset.action === 'addFriend') {
              App.showToast('加好友 · 开发中');
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

        Wechat.panelEl.querySelectorAll('.wx-tab').forEach(function(tab) {
          tab.addEventListener('click', function() {
            Wechat.currentTab = tab.dataset.tab;
            Wechat.panelEl.querySelectorAll('.wx-tab').forEach(function(t) {
              t.classList.toggle('active', t.dataset.tab === Wechat.currentTab);
            });
            Wechat.renderTab();
          });
        });
      }
    },

    /* ★ 新增：恢复微信主界面 */
    restoreInner: function() {
      var inner = App.$('#wxInner');
      if (!inner || !Wechat._savedInner) return;
      inner.innerHTML = Wechat._savedInner;
      Wechat._savedInner = '';
      Wechat.renderTab();
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
    }
  };

  App.register('wechat', Wechat);
})();