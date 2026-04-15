
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Social = {
    currentTab: 'chat',
    panelEl: null,
    addMenuOpen: false,
    editingCharId: null,
    tempAvatar: '',
    list: [],
    FIELDS: [
      { key: 'name', label: '名字' },
      { key: 'profile', label: '简介' },
      { key: 'personality', label: '性格' }
    ],

    load: function() { Social.list = App.LS.get('userList') || []; },
    save: function() { App.LS.set('userList', Social.list); },
    getActiveUser: function() {
      var activeId = App.LS.get('activeUserId');
      if (activeId) { for (var i = 0; i < Social.list.length; i++) { if (Social.list[i].id === activeId) return Social.list[i]; } }
      return Social.list[0] || null;
    },
    getById: function(id) { for (var i = 0; i < Social.list.length; i++) { if (Social.list[i].id === id) return Social.list[i]; } return null; },
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
      panel.innerHTML =
        '<div class="soc-phone"><div class="soc-inner">' +
          '<div class="soc-header">' +
            '<button class="soc-header-btn" id="socBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>' +
            '<div style="flex:1;"></div>' +
            '<div style="position:relative;">' +
              '<button class="soc-header-btn" id="socAddBtn" type="button"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' +
              '<div class="soc-add-menu" id="socAddMenu"><div class="soc-add-menu-item" data-action="addChar"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>添加角色</span></div></div>' +
            '</div>' +
          '</div>' +
          '<div class="soc-search"><div class="soc-search-bar"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><span>搜索</span></div></div>' +
          '<div class="soc-body" id="socBody"></div>' +
          '<div class="soc-tabbar">' +
            '<div class="soc-tab' + (Social.currentTab === 'chat' ? ' active' : '') + '" data-tab="chat"><svg viewBox="0 0 64 64"><path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="23" y1="28" x2="41" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="34" x2="35" y2="34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>聊天</span></div>' +
            '<div class="soc-tab' + (Social.currentTab === 'char' ? ' active' : '') + '" data-tab="char"><svg viewBox="0 0 64 64"><path d="M4 34H14L18 26L23 42L28 20L33 38L37 30H44" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M52 28C52 25 50 23 48 23C46 23 44.5 25 44.5 25C44.5 25 43 23 41 23C39 23 37 25 37 28C37 32 44.5 37 44.5 37C44.5 37 52 32 52 28Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="44" y1="34" x2="60" y2="34" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span>通讯录</span></div>' +
            '<div class="soc-tab' + (Social.currentTab === 'moments' ? ' active' : '') + '" data-tab="moments"><svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(120 32 32)"/></svg><span>朋友圈</span></div>' +
            '<div class="soc-tab' + (Social.currentTab === 'me' ? ' active' : '') + '" data-tab="me"><svg viewBox="0 0 64 64"><defs><pattern id="mmg-hatch-tab" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" stroke-width="2.2"/></pattern></defs><circle cx="32" cy="33" r="21" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="url(#mmg-hatch-tab)" stroke="currentColor" stroke-width="1.6"/></svg><span>我的</span></div>' +
          '</div>' +
        '</div></div>';
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
      if (!chars.length) { body.innerHTML = '<div class="soc-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="soc-empty-text">暂无聊天<br>点击右上角 + 添加角色</div></div>'; return; }
      body.innerHTML = chars.map(function(c) {
        var avatarHtml = c.avatar ? '<img src="' + App.esc(c.avatar) + '" alt="">' : '<div class="soc-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="soc-chat-item" data-char-id="' + c.id + '"><div class="soc-avatar">' + avatarHtml + '</div><div class="soc-chat-content"><div class="soc-chat-top"><span class="soc-chat-name">' + App.esc(c.name || '未命名') + '</span></div><div class="soc-chat-msg">点击开始聊天</div></div></div>';
      }).join('');
      body.querySelectorAll('.soc-chat-item').forEach(function(item) {
        item.addEventListener('click', function() { var id = item.dataset.charId; if (id && App.chat) { Social.close(); setTimeout(function() { App.chat.startChat(id); }, 380); } });
      });
    },

    renderCharTab: function(body) {
      var chars = App.character ? App.character.list : [];
      if (!chars.length) { body.innerHTML = '<div class="soc-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="soc-empty-text">暂无角色<br>点击右上角 + 添加</div></div>'; return; }
      body.innerHTML = chars.map(function(c) {
        var avatarHtml = c.avatar ? '<img src="' + App.esc(c.avatar) + '" alt="">' : '<div class="soc-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="soc-chat-item" data-char-id="' + c.id + '"><div class="soc-avatar">' + avatarHtml + '</div><div class="soc-chat-content"><div class="soc-chat-top"><span class="soc-chat-name">' + App.esc(c.name || '未命名') + '</span></div><div class="soc-chat-msg">' + App.esc((c.profile || '').split('\n')[0].slice(0, 30) || '暂无简介') + '</div></div></div>';
      }).join('');
    },

    renderMeTab: function(body) {
      var user = Social.getActiveUser();
      var name = user ? (user.name || '未命名') : '未创建用户';
      var avatarHtml = user && user.avatar ? '<img src="' + App.esc(user.avatar) + '" alt="" style="width:64px;height:64px;border-radius:50%;object-fit:cover;">' : '<div class="soc-avatar-placeholder" style="width:64px;height:64px;border-radius:50%;"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';
      body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;padding:40px 20px;gap:12px;">' + avatarHtml + '<div style="font-size:17px;font-weight:600;color:#2e4258;">' + App.esc(name) + '</div></div>';
    },

    bindEvents: function() {
      App.safeOn('#socBackBtn', 'click', function() { Social.close(); });
      App.safeOn('#socAddBtn', 'click', function(e) {
        e.stopPropagation();
        Social.addMenuOpen = !Social.addMenuOpen;
        var menu = App.$('#socAddMenu');
        if (menu) menu.classList.toggle('show', Social.addMenuOpen);
      });
      if (Social.panelEl) {
        Social.panelEl.querySelectorAll('.soc-add-menu-item').forEach(function(item) {
          item.addEventListener('click', function(e) {
            e.stopPropagation();
            Social.addMenuOpen = false;
            var menu = App.$('#socAddMenu');
            if (menu) menu.classList.remove('show');
            if (item.dataset.action === 'addChar') Social.openCharCreate();
          });
        });
        Social.panelEl.addEventListener('click', function() {
          if (Social.addMenuOpen) { Social.addMenuOpen = false; var menu = App.$('#socAddMenu'); if (menu) menu.classList.remove('show'); }
        });
        Social.panelEl.querySelectorAll('.soc-tab').forEach(function(tab) {
          tab.addEventListener('click', function() {
            Social.currentTab = tab.dataset.tab;
            Social.panelEl.querySelectorAll('.soc-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.tab === Social.currentTab); });
            Social.renderTab();
          });
        });
      }
    },

    openCharCreate: function(charId) {
      Social.editingCharId = charId || null;
      Social.tempAvatar = '';
      var existing = null;
      if (charId && App.character) existing = App.character.getById(charId);

      var old = App.$('#charCreatePanel');
      if (old) old.remove();

      var panel = document.createElement('div');
      panel.id = 'charCreatePanel';
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      document.body.appendChild(panel);

      panel.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<button class="cc-top-btn" id="ccBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">' + (existing ? '编辑角色' : '添加角色') + '</span>' +
          '<button class="cc-top-btn" id="ccDoneBtn" type="button"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></button>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 40px;">' +
          '<div class="comic-card">' +
            '<div class="top-bar"></div>' +
            '<div class="cc-header">' +
              '<div class="cc-avatar-box" id="ccAvatarBox">' + (existing && existing.avatar ? '<img src="' + App.esc(existing.avatar) + '">' : '<span class="cc-avatar-empty">PHOTO</span>') + '</div>' +
              '<div class="cc-name-area"><div class="cc-name-label">CHARACTER NAME</div><input type="text" class="cc-name-input" id="ccNameInput" placeholder="输入角色名..." value="' + App.esc(existing ? existing.name || '' : '') + '"><div class="cc-name-sub"></div></div>' +
            '</div>' +
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title">角色档案</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="profile" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccProfile" placeholder="角色的设定、背景、性格...">' + App.esc(existing ? existing.profile || '' : '') + '</textarea></div></div></div>' +
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title blue">示例对话</div></div><div class="cc-section-body"><div class="cc-dialogue-area"><button class="cc-expand-btn" data-field="dialogExamples" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccDialog" placeholder="示例对话内容...">' + App.esc(existing ? existing.dialogExamples || '' : '') + '</textarea></div></div></div>' +
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title">后置指令</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="postInstruction" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccPost" placeholder="每轮对话末尾注入的指令...">' + App.esc(existing ? existing.postInstruction || '' : '') + '</textarea></div></div></div>' +
            '<div class="cc-bottom-deco"></div>' +
          '</div>' +
          '<div class="cc-save-area"><button class="cc-save-btn" id="ccSaveBtn" type="button">保 存</button><button class="cc-cancel-btn" id="ccCancelBtn" type="button">取 消</button></div>' +
        '</div>';

      if (existing && existing.avatar) Social.tempAvatar = existing.avatar;

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }); });

      App.$('#ccBackBtn').addEventListener('click', function() { Social.closeCharCreate(); });
      App.$('#ccCancelBtn').addEventListener('click', function() { Social.closeCharCreate(); });
      App.$('#ccDoneBtn').addEventListener('click', function() { Social.saveCharacter(); });
      App.$('#ccSaveBtn').addEventListener('click', function() { Social.saveCharacter(); });
      App.$('#ccAvatarBox').addEventListener('click', function() { Social.openAvatarMenu(); });

      panel.querySelectorAll('.cc-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var field = btn.dataset.field;
          var taMap = { profile: '#ccProfile', dialogExamples: '#ccDialog', postInstruction: '#ccPost' };
          var ta = App.$(taMap[field]);
          if (!ta) return;
          var titleMap = { profile: '角色档案', dialogExamples: '示例对话', postInstruction: '后置指令' };
          Social.openExpandEditor(titleMap[field], ta);
        });
      });
    },

    closeCharCreate: function() {
      var panel = App.$('#charCreatePanel');
      if (!panel) return;
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
      setTimeout(function() { if (panel.parentNode) panel.remove(); }, 350);
    },

    openExpandEditor: function(title, textarea) {
      var old = App.$('#ccExpandEditor');
      if (old) old.remove();

      var isDialogue = (title === '示例对话');

      var editor = document.createElement('div');
      editor.id = 'ccExpandEditor';
      editor.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10002;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateY(100%);opacity:0;overflow:hidden;';

      editor.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<button class="cc-expand-top-btn" id="ccExpandBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<div class="cc-expand-title-tag' + (isDialogue ? ' blue' : '') + '">' + App.esc(title) + '</div>' +
          '<button class="cc-expand-top-btn" id="ccExpandDone" type="button"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></button>' +
        '</div>' +
        '<div style="flex:1;padding:0 16px 40px;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;">' +
          '<div style="background:#fff;border:3.5px solid #111;box-shadow:6px 6px 0 #111;position:relative;overflow:hidden;">' +
            '<div style="background:#111;height:4px;width:100%;"></div>' +
            '<div style="position:absolute;top:4px;right:0;width:40px;height:40px;background:repeating-linear-gradient(-45deg,transparent,transparent 3px,#88abda 3px,#88abda 5px);opacity:.35;pointer-events:none;"></div>' +
            '<div style="min-height:calc(100vh - 220px);border:1.5px dashed #c8d4e2;margin:14px;background:repeating-linear-gradient(0deg,transparent,transparent 22px,#eef2f7 22px,#eef2f7 23px);position:relative;">' +
              (isDialogue ? '<div style="position:absolute;top:8px;left:6px;font-size:22px;font-weight:900;color:#88abda;line-height:1;pointer-events:none;z-index:1;">「</div><div style="position:absolute;bottom:4px;right:10px;font-size:22px;font-weight:900;color:#88abda;line-height:1;pointer-events:none;z-index:1;">」</div>' : '') +
              '<textarea id="ccExpandTA" style="width:100%;min-height:calc(100vh - 250px);border:none;background:transparent;padding:12px ' + (isDialogue ? '14px 12px 26px' : '14px') + ';font-size:14px;color:#333;outline:none;resize:vertical;font-family:inherit;line-height:22px;" placeholder="' + App.esc(textarea.placeholder || '') + '">' + App.esc(textarea.value) + '</textarea>' +
            '</div>' +
            '<div style="height:8px;background:linear-gradient(90deg,#111 30%,#88abda 30%,#88abda 65%,#111 65%);"></div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(editor);

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        editor.style.transform = 'translateY(0)';
        editor.style.opacity = '1';
      }); });

      var expandTA = App.$('#ccExpandTA');
      if (expandTA) expandTA.focus();

      function closeEditor() {
        textarea.value = App.$('#ccExpandTA').value;
        editor.style.transform = 'translateY(100%)';
        editor.style.opacity = '0';
        setTimeout(function() { if (editor.parentNode) editor.remove(); }, 350);
      }

      App.$('#ccExpandBack').addEventListener('click', closeEditor);
      App.$('#ccExpandDone').addEventListener('click', closeEditor);
    },

    openAvatarMenu: function() {
      var old = App.$('#ccAvatarMenu');
      if (old) old.remove();

      var menu = document.createElement('div');
      menu.id = 'ccAvatarMenu';
      menu.className = 'cc-avatar-menu';
      menu.innerHTML =
        '<div class="cc-avatar-menu-mask"></div>' +
        '<div class="cc-avatar-menu-body">' +
          '<div class="cc-avatar-menu-top">设置头像</div>' +
          '<div class="cc-avatar-menu-content">' +
            '<div class="cc-avatar-menu-row"><input type="text" id="ccAvatarUrl" placeholder="输入图片URL..."><button class="cc-avatar-url-btn" id="ccAvatarUrlBtn" type="button">确定</button></div>' +
            '<div class="cc-avatar-action" id="ccAvatarUpload"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span>从相册选择</span></div>' +
            '<input type="file" id="ccAvatarFile" accept="image/*" hidden>' +
          '</div>' +
        '</div>';

      document.body.appendChild(menu);

      menu.querySelector('.cc-avatar-menu-mask').addEventListener('click', function() { menu.remove(); });

      App.$('#ccAvatarUrlBtn').addEventListener('click', function() {
        var url = App.$('#ccAvatarUrl').value.trim();
        if (!url) { App.showToast('请输入URL'); return; }
        Social.tempAvatar = url;
        var box = App.$('#ccAvatarBox');
        if (box) box.innerHTML = '<img src="' + App.esc(url) + '">';
        menu.remove();
      });

      App.$('#ccAvatarUpload').addEventListener('click', function() { App.$('#ccAvatarFile').click(); });

      App.$('#ccAvatarFile').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var src = ev.target.result;
          if (App.cropImage) {
            App.cropImage(src, function(cropped) {
              Social.tempAvatar = cropped;
              var box = App.$('#ccAvatarBox');
              if (box) box.innerHTML = '<img src="' + cropped + '">';
              menu.remove();
            });
          } else {
            var img = new Image();
            img.onload = function() {
              var canvas = document.createElement('canvas');
              var max = 256, w = img.width, h = img.height;
              if (w > h) { if (w > max) { h = h * max / w; w = max; } } else { if (h > max) { w = w * max / h; h = max; } }
              canvas.width = w; canvas.height = h;
              canvas.getContext('2d').drawImage(img, 0, 0, w, h);
              Social.tempAvatar = canvas.toDataURL('image/jpeg', 0.85);
              var box = App.$('#ccAvatarBox');
              if (box) box.innerHTML = '<img src="' + Social.tempAvatar + '">';
              menu.remove();
            };
            img.src = src;
          }
        };
        reader.readAsDataURL(file);
      });
    },

    saveCharacter: function() {
      var name = (App.$('#ccNameInput') || {}).value || '';
      name = name.trim();
      if (!name) { App.showToast('请输入角色名'); return; }

      var profile = (App.$('#ccProfile') || {}).value || '';
      var dialogExamples = (App.$('#ccDialog') || {}).value || '';
      var postInstruction = (App.$('#ccPost') || {}).value || '';

      if (Social.editingCharId && App.character) {
        var existing = App.character.getById(Social.editingCharId);
        if (existing) {
          existing.name = name;
          existing.avatar = Social.tempAvatar || existing.avatar;
          existing.profile = profile;
          existing.dialogExamples = dialogExamples;
          existing.postInstruction = postInstruction;
          App.character.save();
          Social.closeCharCreate();
          Social.render();
          App.showToast('角色已更新');
          return;
        }
      }

      if (App.character) {
        App.character.list.push({
          id: 'char-' + Date.now(),
          name: name,
          avatar: Social.tempAvatar,
          profile: profile,
          dialogExamples: dialogExamples,
          postInstruction: postInstruction
        });
        App.character.save();
      }

      Social.closeCharCreate();
      Social.render();
      App.showToast('角色已创建');
    },

    init: function() {
      Social.load();
      if (!App.$('#socialPanel')) {
        var panel = document.createElement('div');
        panel.id = 'socialPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }
      App.safeOn('#dockMine', 'click', function() { Social.open(); });
      App.user = Social;
    }
  };

  App.register('user', Social);
})();
