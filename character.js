(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Character = {
    list: [],
    editingCharId: null,
    tempAvatar: '',

    FIELDS: [
      { key: 'name', label: '名字' },
      { key: 'profile', label: '角色档案' },
      { key: 'dialogExamples', label: '示例对话' },
      { key: 'postInstruction', label: '后置指令' }
    ],

    load: function() { Character.list = App.LS.get('characterList') || []; },
    save: function() { App.LS.set('characterList', Character.list); },
    getById: function(id) {
      for (var i = 0; i < Character.list.length; i++) {
        if (Character.list[i].id === id) return Character.list[i];
      }
      return null;
    },

    open: function() {
      Character.load();
      var panel = App.$('#charPanel');
      if (!panel) return;
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      Character.renderList();
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }); });
    },

    close: function() {
      var panel = App.$('#charPanel');
      if (!panel) return;
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
      setTimeout(function() { panel.style.display = 'none'; }, 350);
    },

    renderList: function() {
      var panel = App.$('#charPanel');
      if (!panel) return;
      var chars = Character.list;
      var count = chars.length;

      var itemsHtml = '';
      if (!count) {
        itemsHtml = '<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;letter-spacing:1px;">暂无角色，点击上方创建</div>';
      } else {
        itemsHtml = chars.map(function(c, i) {
          var idx = String(i + 1).padStart(2, '0');
          var name = App.esc(c.name || '未命名');
          var avatarHtml = c.avatar
            ? '<img src="' + App.esc(c.avatar) + '" style="width:100%;height:100%;object-fit:cover;display:block;">'
            : '';
          var desc = (c.profile || '').split('\n')[0] || '';
          desc = desc.slice(0, 20);
          return '<div class="cl-item" data-char-id="' + c.id + '">' +
            '<div class="cl-item-index">' + idx + '</div>' +
            '<div class="cl-item-main">' +
              '<div class="cl-avatar">' + avatarHtml + '</div>' +
              '<div class="cl-info">' +
                '<div class="cl-name">' + name + '</div>' +
                (desc ? '<div class="cl-meta"><span class="cl-tag">' + App.esc(desc) + '</span></div>' : '') +
              '</div>' +
            '</div>' +
            '<div class="cl-actions">' +
              '<div class="cl-act-btn cl-act-edit" data-id="' + c.id + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5l3 3L12 15H9v-3z"/></svg>' +
                '编辑' +
              '</div>' +
              '<div class="cl-act-btn cl-act-del" data-id="' + c.id + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6l1 14h12l1-14"/></svg>' +
                '删除' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      var dotsHtml = '';
      for (var d = 0; d < Math.max(count, 1); d++) {
        dotsHtml += '<div class="cl-dot' + (d === 0 ? ' active' : '') + '"></div>';
      }

      panel.innerHTML =
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:56px 16px 40px;background:#fff;">' +
          '<div class="char-list-wrap">' +
            '<div class="cl-back-tag" id="clCloseBtn">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '</div>' +
            '<div class="cl-top-bar"></div>' +
            '<div class="cl-header">' +
              '<div class="cl-header-left">' +
                '<h2>角色列表</h2>' +
                '<span class="cl-count">' + count + '</span>' +
              '</div>' +
              '<div class="cl-create-btn" id="clCreateBtn">' +
                '<span class="plus-icon">+</span>' +
                '创建角色' +
              '</div>' +
            '</div>' +
            '<div class="cl-body">' + itemsHtml + '</div>' +
            '<div class="cl-footer">' +
              '<div class="cl-footer-left">' +
                '<span class="cl-paw">🐾</span>' +
                '<span class="cl-footer-text">Character List</span>' +
              '</div>' +
              '<div class="cl-dots">' + dotsHtml + '</div>' +
            '</div>' +
            '<div class="cl-bottom-bar"></div>' +
          '</div>' +
        '</div>';

      App.$('#clCloseBtn').addEventListener('click', function() { Character.close(); });
      App.$('#clCreateBtn').addEventListener('click', function() { Character.openCreate(); });

      panel.querySelectorAll('.cl-act-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          Character.openCreate(btn.dataset.id);
        });
      });

      panel.querySelectorAll('.cl-act-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除这个角色？')) return;
          Character.list = Character.list.filter(function(c) { return c.id !== btn.dataset.id; });
          Character.save();
          Character.renderList();
          App.showToast('已删除');
        });
      });
    },

    openCreate: function(charId) {
      Character.editingCharId = charId || null;
      Character.tempAvatar = '';
      var existing = null;
      if (charId) existing = Character.getById(charId);

      var old = App.$('#charCreatePanel');
      if (old) old.remove();

      var createPanel = document.createElement('div');
      createPanel.id = 'charCreatePanel';
      createPanel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10001;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      document.body.appendChild(createPanel);

      var avatarDisplay = existing && existing.avatar
        ? '<img src="' + App.esc(existing.avatar) + '">'
        : '<span class="cc-avatar-empty">PHOTO</span>';

      createPanel.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<button class="cc-top-btn" id="ccBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">' + (existing ? '编辑角色' : '添加角色') + '</span>' +
          '<button class="cc-top-btn" id="ccDoneBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 40px;">' +
          '<div class="comic-card">' +
            '<div class="top-bar"></div>' +
            '<div class="cc-header">' +
              '<div class="cc-avatar-box" id="ccAvatarBox">' + avatarDisplay + '</div>' +
              '<div class="cc-name-area"><div class="cc-name-label">CHARACTER NAME</div><input type="text" class="cc-name-input" id="ccNameInput" placeholder="输入角色名..." value="' + App.esc(existing ? existing.name || '' : '') + '"><div class="cc-name-sub"></div></div>' +
            '</div>' +
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title">角色档案</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="profile" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccProfile" placeholder="角色的设定、背景、性格...">' + App.esc(existing ? existing.profile || '' : '') + '</textarea></div></div></div>' +
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title blue">示例对话</div></div><div class="cc-section-body"><div class="cc-dialogue-area"><button class="cc-expand-btn" data-field="dialogExamples" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccDialog" placeholder="示例对话内容...">' + App.esc(existing ? existing.dialogExamples || '' : '') + '</textarea></div></div></div>' +
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title">后置指令</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="postInstruction" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccPost" placeholder="每轮对话末尾注入的指令...">' + App.esc(existing ? existing.postInstruction || '' : '') + '</textarea></div></div></div>' +
            '<div class="cc-bottom-deco"></div>' +
          '</div>' +
          '<div class="cc-save-area"><button class="cc-save-btn" id="ccSaveBtn" type="button">保 存</button><button class="cc-cancel-btn" id="ccCancelBtn" type="button">取 消</button></div>' +
        '</div>';

      if (existing && existing.avatar) Character.tempAvatar = existing.avatar;

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        createPanel.style.transform = 'translateX(0)';
        createPanel.style.opacity = '1';
      }); });

      // 头像上传 — 跟 cards.js 完全一样的方式
      var avatarBox = createPanel.querySelector('#ccAvatarBox');
      avatarBox.addEventListener('click', function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        document.body.appendChild(input);
        input.onchange = function(e) {
          var file = e.target.files[0];
          document.body.removeChild(input);
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(ev) {
            var src = ev.target.result;
            if (App.cropImage) {
              App.cropImage(src, function(cropped) {
                Character.tempAvatar = cropped;
                avatarBox.innerHTML = '<img src="' + cropped + '">';
              });
            } else {
              Character.tempAvatar = src;
              avatarBox.innerHTML = '<img src="' + src + '">';
            }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      });

      createPanel.querySelector('#ccBackBtn').addEventListener('click', function() { Character.closeCreate(); });
      createPanel.querySelector('#ccCancelBtn').addEventListener('click', function() { Character.closeCreate(); });
      createPanel.querySelector('#ccDoneBtn').addEventListener('click', function() { Character.saveChar(); });
      createPanel.querySelector('#ccSaveBtn').addEventListener('click', function() { Character.saveChar(); });

      createPanel.querySelectorAll('.cc-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var field = btn.dataset.field;
          var taMap = { profile: '#ccProfile', dialogExamples: '#ccDialog', postInstruction: '#ccPost' };
          var ta = App.$(taMap[field]);
          if (!ta) return;
          var titleMap = { profile: '角色档案', dialogExamples: '示例对话', postInstruction: '后置指令' };
          Character.openExpandEditor(titleMap[field], ta);
        });
      });
    },

    closeCreate: function() {
      var panel = App.$('#charCreatePanel');
      if (!panel) return;
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
      setTimeout(function() { if (panel.parentNode) panel.remove(); }, 350);
    },

    saveChar: function() {
      var name = (App.$('#ccNameInput') || {}).value || '';
      name = name.trim();
      if (!name) { App.showToast('请输入角色名'); return; }

      var profile = (App.$('#ccProfile') || {}).value || '';
      var dialogExamples = (App.$('#ccDialog') || {}).value || '';
      var postInstruction = (App.$('#ccPost') || {}).value || '';

      if (Character.editingCharId) {
        var existing = Character.getById(Character.editingCharId);
        if (existing) {
          existing.name = name;
          existing.avatar = Character.tempAvatar || existing.avatar;
          existing.profile = profile;
          existing.dialogExamples = dialogExamples;
          existing.postInstruction = postInstruction;
          Character.save();
          Character.closeCreate();
          Character.renderList();
          App.showToast('角色已更新');
          return;
        }
      }

      Character.list.push({
        id: 'char-' + Date.now(),
        name: name,
        avatar: Character.tempAvatar,
        profile: profile,
        dialogExamples: dialogExamples,
        postInstruction: postInstruction
      });
      Character.save();
      Character.closeCreate();
      Character.renderList();
      App.showToast('角色已创建');
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

    init: function() {
      Character.load();
      if (!App.$('#charPanel')) {
        var panel = document.createElement('div');
        panel.id = 'charPanel';
        panel.style.display = 'none';
        document.body.appendChild(panel);
      }
      App.character = Character;
    }
  };

  App.register('character', Character);
})();