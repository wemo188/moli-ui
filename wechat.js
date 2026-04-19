(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Wechat = {
    currentTab: 'chat',
    panelEl: null,

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

    render: function() {
      var panel = Wechat.panelEl;
      if (!panel) return;
      var isFS = App.LS.get('wxFullScreen') || false;
      var wrapClass = isFS ? 'wx-fullscreen' : '';

      panel.innerHTML =
        '<div class="' + wrapClass + '" id="wxWrap"><div class="wx-phone"><div class="wx-inner">' +
          '<div class="wx-header">' +
            '<button class="wx-header-btn" id="wxBackBtn" type="button">' +
              '<svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>' +
            '</button>' +
            '<div style="flex:1;"></div>' +
            '<button class="wx-me-mode-btn" id="wxModeToggle" type="button" style="display:none;">' +
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
              '<svg viewBox="0 0 64 64"><path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="23" y1="28" x2="41" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="34" x2="35" y2="34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
              '<span>聊天</span>' +
            '</div>' +
            '<div class="wx-tab' + (Wechat.currentTab === 'char' ? ' active' : '') + '" data-tab="char">' +
              '<svg viewBox="0 0 64 64"><path d="M4 34H14L18 26L23 42L28 20L33 38L37 30H44" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M52 28C52 25 50 23 48 23C46 23 44.5 25 44.5 25C44.5 25 43 23 41 23C39 23 37 25 37 28C37 32 44.5 37 44.5 37C44.5 37 52 32 52 28Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="44" y1="34" x2="60" y2="34" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
              '<span>通讯录</span>' +
            '</div>' +
            '<div class="wx-tab' + (Wechat.currentTab === 'moments' ? ' active' : '') + '" data-tab="moments">' +
              '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(120 32 32)"/></svg>' +
              '<span>朋友圈</span>' +
            '</div>' +
            '<div class="wx-tab' + (Wechat.currentTab === 'me' ? ' active' : '') + '" data-tab="me">' +
              '<svg viewBox="0 0 64 64"><defs><pattern id="wx-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" stroke-width="2.2"/></pattern></defs><circle cx="32" cy="33" r="21" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="url(#wx-hatch)" stroke="currentColor" stroke-width="1.6"/></svg>' +
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
      if (!chars.length) {
        body.innerHTML = '<div class="wx-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="wx-empty-text">暂无聊天<br>请先在「角色」中添加角色</div></div>';
        return;
      }
      body.innerHTML = chars.map(function(c) {
        var avatarHtml = c.avatar
          ? '<img src="' + App.esc(c.avatar) + '" alt="">'
          : '<div class="wx-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="wx-chat-item" data-char-id="' + c.id + '">' +
          '<div class="wx-avatar">' + avatarHtml + '</div>' +
          '<div class="wx-chat-content">' +
            '<div class="wx-chat-top"><span class="wx-chat-name">' + App.esc(c.name || '未命名') + '</span></div>' +
            '<div class="wx-chat-msg">点击开始聊天</div>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.wx-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var id = item.dataset.charId;
          if (id && App.chat) {
            Wechat.close();
            setTimeout(function() { App.chat.startChat(id); }, 380);
          }
        });
      });
    },

    renderCharTab: function(body) {
      var chars = App.character ? App.character.list : [];
      if (!chars.length) {
        body.innerHTML = '<div class="wx-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="wx-empty-text">暂无角色<br>请在底部栏「角色」中添加</div></div>';
        return;
      }
      body.innerHTML = chars.map(function(c) {
        var avatarHtml = c.avatar
          ? '<img src="' + App.esc(c.avatar) + '" alt="">'
          : '<div class="wx-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="wx-chat-item" data-char-id="' + c.id + '">' +
          '<div class="wx-avatar">' + avatarHtml + '</div>' +
          '<div class="wx-chat-content">' +
            '<div class="wx-chat-top"><span class="wx-chat-name">' + App.esc(c.name || '未命名') + '</span></div>' +
            '<div class="wx-chat-msg">' + App.esc((c.profile || '').split('\n')[0].slice(0, 30) || '暂无简介') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    renderMeTab: function(body) {
      var user = App.user ? App.user.getActiveUser() : null;
      var name = user ? (user.nickname || user.realName || '未命名') : '未创建用户';

      var avatarHtml = user && user.avatar
        ? '<div class="wx-avatar-placeholder" style="width:80px;height:80px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);overflow:hidden;"><img src="' + App.esc(user.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;border:none;outline:none;"></div>'
        : '<div class="wx-avatar-placeholder" style="width:80px;height:80px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);"><svg viewBox="0 0 24 24" style="width:30px;height:30px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

      body.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;padding:30px 20px 16px;gap:12px;">' +
          avatarHtml +
          '<div style="font-size:17px;font-weight:600;color:#2e4258;">' + App.esc(name) + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="wx-me-link" id="wxOpenProfile">' +
            '<span class="wx-me-link-text">user资料</span>' +
            '<span class="wx-me-link-arrow">›</span>' +
          '</div>' +
        '</div>';

      body.querySelector('#wxOpenProfile').addEventListener('click', function() {
        if (App.user && App.user.openForkPage) App.user.openForkPage();
      });
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
```

---

**user.css — 完整替换（只保留档案页样式）：**

```css
/* ====== 前导页 · 背景装饰 ====== */
@keyframes upFloat1 { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-15px) rotate(5deg);} }
@keyframes upFloat2 { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(12px) rotate(-3deg);} }
@keyframes upFloat3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(8px,-10px) scale(1.1);} }
@keyframes upPulse { 0%,100%{opacity:0.4;} 50%{opacity:0.8;} }

.up-fork-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.up-fork-circle1 { position: absolute; top: 15%; left: -20px; width: 120px; height: 120px; border-radius: 50%; border: 1.5px solid rgba(173,205,234,0.2); animation: upFloat1 6s ease-in-out infinite; }
.up-fork-circle2 { position: absolute; top: 45%; right: -30px; width: 80px; height: 80px; border-radius: 50%; border: 1.5px solid rgba(173,205,234,0.15); animation: upFloat2 8s ease-in-out infinite; }
.up-fork-circle3 { position: absolute; bottom: 20%; left: 30%; width: 60px; height: 60px; border-radius: 50%; background: rgba(173,205,234,0.06); animation: upFloat3 7s ease-in-out infinite; }
.up-fork-midline { position: absolute; top: 0; left: 50%; width: 1px; height: 100%; background: linear-gradient(180deg, transparent, rgba(173,205,234,0.12) 30%, rgba(173,205,234,0.12) 70%, transparent); }

.up-fork-card { position: relative; border: 1.5px solid rgba(173,205,234,0.3); background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 28px 24px; cursor: pointer; -webkit-tap-highlight-color: transparent; overflow: hidden; transition: all 0.2s; }
.up-fork-card:active { background: rgba(173,205,234,0.08); }
.up-fork-card-corner { position: absolute; top: 0; right: 0; width: 50px; height: 50px; overflow: hidden; }
.up-fork-card-corner::after { content: ""; position: absolute; top: -1px; right: -1px; width: 0; height: 0; border-top: 50px solid rgba(173,205,234,0.08); border-left: 50px solid transparent; }
.up-fork-card-line { position: absolute; left: 0; top: 20%; height: 60%; width: 3px; background: linear-gradient(180deg, transparent, #adcdea, transparent); }
.up-fork-card-dots { position: absolute; bottom: 8px; right: 12px; display: flex; gap: 3px; align-items: center; }
.up-fork-card-steps { position: absolute; bottom: 8px; right: 12px; display: flex; gap: 4px; align-items: center; }

/* ====== 用户档案卡 ====== */
.up-card { margin: 0 12px; background: #fafafa; border: 1px solid #e8e8e8; position: relative; overflow: visible; }
.up-bar-top { height: 3px; background: #d4d4d4; }
.up-bar-bot { height: 3px; background: linear-gradient(90deg, #d4d4d4 25%, #aaa 25%, #aaa 75%, #d4d4d4 75%); }
.up-card-head { padding: 16px 20px 12px; border-bottom: 1px dashed #e0e0e0; }
.up-card-head-sub { font-size: 7px; color: #bbb; letter-spacing: 3px; margin-bottom: 2px; }
.up-card-head-title { font-size: 18px; font-weight: 800; color: #1a1a1a; letter-spacing: 1px; }
.up-field { padding: 10px 20px 8px; }
.up-field-label { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
.up-field-dot { width: 3px; height: 3px; background: #1a1a1a; }
.up-field-key { font-size: 9px; color: #999; letter-spacing: 2px; font-weight: 600; }
.up-field-line { border-bottom: 1.5px solid #e0e0e0; padding: 5px 0 7px; }
.up-field-line input { width: 100%; border: none; background: transparent; font-size: 14px; color: #1a1a1a; font-weight: 500; outline: none; font-family: inherit; box-sizing: border-box; }
.up-field-line input::placeholder { color: #ccc; font-weight: 400; }
.up-field-line .up-text { font-size: 14px; color: #1a1a1a; font-weight: 500; }
.up-divider { margin: 4px 20px; display: flex; align-items: center; gap: 8px; }
.up-divider-line { flex: 1; height: 1px; background: repeating-linear-gradient(90deg, #d4d4d4 0, #d4d4d4 4px, transparent 4px, transparent 8px); }
.up-divider-text { font-size: 7px; color: #ccc; letter-spacing: 2px; }
.up-field-box { min-height: 55px; border: 1px dashed #e0e0e0; padding: 8px 10px; background: #fff; }
.up-field-box textarea { width: 100%; min-height: 50px; border: none; background: transparent; font-size: 12px; color: #555; outline: none; font-family: inherit; resize: vertical; line-height: 1.8; box-sizing: border-box; }
.up-field-box textarea::placeholder { color: #ccc; }
.up-field-box .up-text { font-size: 12px; color: #555; line-height: 1.8; white-space: pre-wrap; }
.up-card-foot { padding: 0 20px 10px; font-size: 7px; color: #d4d4d4; letter-spacing: 1px; font-family: monospace; }

.up-quill { position: absolute; bottom: -28px; right: -16px; width: 90px; height: 90px; cursor: pointer; -webkit-tap-highlight-color: transparent; z-index: 5; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1)) brightness(1.6) contrast(0.65); transition: transform 0.3s ease; }
.up-quill:active { transform: scale(0.9); }
.up-quill img { width: 100%; height: 100%; object-fit: contain; transform: rotate(15deg); pointer-events: none; }

.up-seal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-12deg) scale(0); z-index: 10; pointer-events: none; filter: saturate(0.85) contrast(1.1); opacity: 0; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; }
.up-seal.show { transform: translate(-50%, -50%) rotate(-12deg) scale(1); opacity: 1; }
.up-seal-outer { width: 110px; height: 110px; border: 3px solid rgba(160,30,30,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 1px rgba(160,30,30,0.15); position: relative; }
.up-seal-dashes { position: absolute; inset: 3px; border: 1.5px dashed rgba(160,30,30,0.25); border-radius: 50%; }
.up-seal-inner { width: 86px; height: 86px; border: 2.5px solid rgba(160,30,30,0.55); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
.up-seal-top { position: absolute; top: 5px; font-size: 5px; color: rgba(160,30,30,0.5); letter-spacing: 2.5px; font-weight: 700; }
.up-seal-main { font-size: 28px; font-weight: 900; color: rgba(160,30,30,0.7); letter-spacing: 6px; text-indent: 6px; line-height: 1; margin-top: 2px; }
.up-seal-line { width: 42px; height: 1.5px; background: rgba(160,30,30,0.35); margin: 4px 0 2px; }
.up-seal-stars { display: flex; gap: 4px; align-items: center; }
.up-seal-star { font-size: 6px; color: rgba(160,30,30,0.45); }
.up-seal-label { font-size: 5px; color: rgba(160,30,30,0.4); letter-spacing: 1px; font-weight: 600; }
.up-seal-date { position: absolute; bottom: 6px; font-size: 5px; color: rgba(160,30,30,0.4); letter-spacing: 1.5px; font-family: monospace; font-weight: 600; }
.up-seal-noise { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 30% 40%, transparent 40%, rgba(255,255,255,0.15) 41%, transparent 42%), radial-gradient(circle at 65% 55%, transparent 30%, rgba(255,255,255,0.2) 31%, transparent 33%), radial-gradient(circle at 45% 70%, transparent 35%, rgba(255,255,255,0.18) 36%, transparent 38%), radial-gradient(circle at 70% 25%, transparent 25%, rgba(255,255,255,0.22) 26%, transparent 28%); }
