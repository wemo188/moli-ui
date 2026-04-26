(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var CharEdit = {
    editingCharId: null,
    tempAvatar: '',

    open: function(charId, modeIdx) {
      CharEdit.editingCharId = charId || null;
      CharEdit.tempAvatar = '';
      var existing = null;
      if (charId && App.character) existing = App.character.getById(charId);

      var old = App.$('#charCreatePanel');
      if (old) old.remove();

      var mode = (typeof modeIdx === 'number') ? modeIdx : (App.character ? App.character.currentMode : 0);
      var editModeClass = '';
      if (mode === 1) editModeClass = ' cc-edit-frost';
      else if (mode === 2) editModeClass = ' cc-edit-mono';

      var createPanel = document.createElement('div');
      createPanel.id = 'charCreatePanel';
      createPanel.className = 'cc-edit-page' + editModeClass;
      createPanel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10001;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      document.body.appendChild(createPanel);

      var e = existing || {};

      var avatarDisplay = e.avatar
        ? '<img src="' + App.esc(e.avatar) + '">'
        : '<span class="cc-avatar-empty">PHOTO</span>';

      var wxAdd = e.wxAddMode || 'add';

      var html =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<button class="cc-top-btn" id="ccBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">' + (existing ? '编辑角色' : '添加角色') + '</span>' +
          '<div style="width:36px;"></div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 40px;">' +
          '<div class="comic-card">' +
            '<div class="top-bar"></div>' +

            // 头像 + 名字
            '<div class="cc-header">' +
              '<div class="cc-avatar-box" id="ccAvatarBox">' + avatarDisplay + '</div>' +
              '<div class="cc-name-area"><div class="cc-name-label">CHARACTER NAME</div><input type="text" class="cc-name-input" id="ccNameInput" placeholder="输入角色名..." value="' + App.esc(e.name || '') + '"><div class="cc-name-sub"></div></div>' +
            '</div>' +

            // ====== 基本信息 ======
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title">基本信息</div></div><div class="cc-section-body">' +
              '<div class="cc-field-grid" style="padding:0 20px 6px;">' +
                '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">对你的称呼</div></div><input type="text" class="cc-field-input" id="ccCallName" placeholder="" value="' + App.esc(e.callName || '') + '"></div>' +
                '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">与你的关系</div></div><input type="text" class="cc-field-input" id="ccRelation" placeholder="" value="' + App.esc(e.relation || '') + '"></div>' +
                '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">性别</div></div><input type="text" class="cc-field-input" id="ccGender" placeholder="" value="' + App.esc(e.gender || '') + '"></div>' +
                '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">年龄</div></div><input type="text" class="cc-field-input" id="ccAge" placeholder="" value="' + App.esc(e.age || '') + '"></div>' +
                '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">生日</div></div><input type="text" class="cc-field-input" id="ccBirthday" placeholder="" value="' + App.esc(e.birthday || '') + '"></div>' +
                '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">手机号码</div></div><input type="text" class="cc-field-input" id="ccPhone" placeholder="输入十位虚拟数字，或留空随机" value="' + App.esc(e.phone || '') + '"></div>' +
              '</div>' +
              '<div style="padding:0 20px 10px;">' +
                '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">微信号</div></div><input type="text" class="cc-field-input" id="ccWechatId" placeholder="" value="' + App.esc(e.wechatId || '') + '"></div>' +
              '</div>' +

              '<div class="cc-sep"><div class="cc-sep-line"></div><div class="cc-sep-text">微信通讯录</div><div class="cc-sep-line"></div></div>' +
              '<div style="padding:0 20px 6px;">' +
                '<div class="cc-radio-row">' +
                  '<div class="cc-radio-item"><input type="radio" name="ccWxAdd" id="ccWxAdd1" value="add"' + (wxAdd === 'add' ? ' checked' : '') + '><label class="cc-radio-label" for="ccWxAdd1">添加到通讯录</label></div>' +
                  '<div class="cc-radio-item"><input type="radio" name="ccWxAdd" id="ccWxAdd2" value="wait"' + (wxAdd === 'wait' ? ' checked' : '') + '><label class="cc-radio-label" for="ccWxAdd2">等待对方加你</label></div>' +
                  '<div class="cc-radio-item"><input type="radio" name="ccWxAdd" id="ccWxAdd3" value="none"' + (wxAdd === 'none' ? ' checked' : '') + '><label class="cc-radio-label" for="ccWxAdd3">不添加</label></div>' +
                '</div>' +
                '<div class="cc-tip"><div class="cc-tip-icon">!</div><div class="cc-tip-text">选择「等待对方加你」，角色会在某个时机主动发送好友申请；选择「不添加」，你可以在对话页面手动添加。</div></div>' +
              '</div>' +
            '</div></div>' +

            // ====== 角色档案 ======
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title blue">角色档案</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="profile" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccProfile" placeholder="角色的设定、背景、性格...">' + App.esc(e.profile || '') + '</textarea></div></div></div>' +

            // ====== 示例对话 ======
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title">示例对话</div></div><div class="cc-section-body"><div class="cc-dialogue-area"><button class="cc-expand-btn" data-field="dialogExamples" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccDialog" placeholder="示例对话内容...">' + App.esc(e.dialogExamples || '') + '</textarea></div></div></div>' +

            // ====== 开场白 ======
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title blue">开场白</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="greeting" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccGreeting" placeholder="留空则角色不主动发消息，可在对话页面修改">' + App.esc(e.greeting || '') + '</textarea></div>' +
              '<div class="cc-tip" style="margin:0 20px 10px;"><div class="cc-tip-icon">i</div><div class="cc-tip-text">留空则角色不主动发消息，可在对话页面修改。</div></div>' +
            '</div></div>' +

            // ====== 后置指令 ======
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title">后置指令</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="postInstruction" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccPost" placeholder="每轮对话末尾注入的指令...">' + App.esc(e.postInstruction || '') + '</textarea></div></div></div>' +

            '<div class="cc-bottom-deco"></div>' +
          '</div>' +

          '<div class="cc-save-area"><button class="cc-save-btn" id="ccSaveBtn" type="button">保 存</button><button class="cc-cancel-btn" id="ccCancelBtn" type="button">取 消</button></div>' +
        '</div>';

      createPanel.innerHTML = html;

      if (e.avatar) CharEdit.tempAvatar = e.avatar;

      if (existing) {
        createPanel.style.setProperty('--edit-dark', existing.cardDark || '#111111');
        createPanel.style.setProperty('--edit-accent', existing.cardAccent || '#88abda');
        createPanel.style.setProperty('--edit-light', existing.cardLight || '#ffffff');
      }

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        createPanel.style.transform = 'translateX(0)';
        createPanel.style.opacity = '1';
      }); });

      // 头像
      var avatarBox = createPanel.querySelector('#ccAvatarBox');
      avatarBox.addEventListener('click', function() {
        var input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        document.body.appendChild(input);
        input.onchange = function(ev) {
          var file = ev.target.files[0];
          document.body.removeChild(input);
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(r) {
            var src = r.target.result;
            if (App.cropImage) {
              App.cropImage(src, function(cropped) { CharEdit.tempAvatar = cropped; avatarBox.innerHTML = '<img src="' + cropped + '">'; });
            } else {
              CharEdit.tempAvatar = src; avatarBox.innerHTML = '<img src="' + src + '">';
            }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      });

      createPanel.querySelector('#ccBackBtn').addEventListener('click', function() { CharEdit.close(); });
      createPanel.querySelector('#ccCancelBtn').addEventListener('click', function() { CharEdit.close(); });
      createPanel.querySelector('#ccSaveBtn').addEventListener('click', function() { CharEdit.save(); });

      createPanel.querySelectorAll('.cc-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function(ev) {
          ev.stopPropagation();
          var field = btn.dataset.field;
          var taMap = { profile: '#ccProfile', dialogExamples: '#ccDialog', postInstruction: '#ccPost', greeting: '#ccGreeting' };
          var ta = App.$(taMap[field]);
          if (!ta) return;
          var titleMap = { profile: '角色档案', dialogExamples: '示例对话', postInstruction: '后置指令', greeting: '开场白' };
          CharEdit.openExpand(titleMap[field], ta);
        });
      });
    },

    close: function() {
      var panel = App.$('#charCreatePanel');
      if (!panel) return;
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
      setTimeout(function() { if (panel.parentNode) panel.remove(); }, 350);
    },

    save: function() {
      var name = (App.$('#ccNameInput') || {}).value || '';
      name = name.trim();
      if (!name) { App.showToast('请输入角色名'); return; }
      if (!App.character) return;

      var profile = (App.$('#ccProfile') || {}).value || '';
      var dialogExamples = (App.$('#ccDialog') || {}).value || '';
      var postInstruction = (App.$('#ccPost') || {}).value || '';
      var greeting = (App.$('#ccGreeting') || {}).value || '';
      var callName = (App.$('#ccCallName') || {}).value || '';
      var relation = (App.$('#ccRelation') || {}).value || '';
      var gender = (App.$('#ccGender') || {}).value || '';
      var age = (App.$('#ccAge') || {}).value || '';
      var birthday = (App.$('#ccBirthday') || {}).value || '';
      var phone = (App.$('#ccPhone') || {}).value || '';
      var wechatId = (App.$('#ccWechatId') || {}).value || '';
      var wxAddEl = document.querySelector('input[name="ccWxAdd"]:checked');
      var wxAddMode = wxAddEl ? wxAddEl.value : 'add';

      if (!phone.trim()) phone = '1' + Math.floor(100000000 + Math.random() * 900000000);

      if (CharEdit.editingCharId) {
        var existing = App.character.getById(CharEdit.editingCharId);
        if (existing) {
          existing.name = name;
          existing.avatar = CharEdit.tempAvatar || existing.avatar;
          existing.profile = profile;
          existing.dialogExamples = dialogExamples;
          existing.postInstruction = postInstruction;
          existing.greeting = greeting;
          existing.callName = callName;
          existing.relation = relation;
          existing.gender = gender;
          existing.age = age;
          existing.birthday = birthday;
          existing.phone = phone;
          existing.wechatId = wechatId;
          existing.wxAddMode = wxAddMode;
          App.character.save();
          CharEdit.close();
          App.character.renderList();
          App.showToast('角色已更新');
          return;
        }
      }

      App.character.list.push({
        id: 'char-' + Date.now(),
        name: name,
        avatar: CharEdit.tempAvatar,
        cover: '',
        profile: profile,
        dialogExamples: dialogExamples,
        postInstruction: postInstruction,
        greeting: greeting,
        callName: callName,
        relation: relation,
        gender: gender,
        age: age,
        birthday: birthday,
        phone: phone,
        wechatId: wechatId,
        wxAddMode: wxAddMode,
        cardDark: '#111111',
        cardAccent: '#88abda',
        cardBg: '#ffffff',
        cardLine: 3,
        cardColor: '#88abda',
        worldbookMounted: false,
        modeColors: [{}, {}, {}]
      });
      App.character.save();
      CharEdit.close();
      App.character.renderList();
      App.showToast('角色已创建');
    },

    openExpand: function(title, textarea) {
      var old = App.$('#ccExpandEditor');
      if (old) old.remove();
      var isDialogue = (title === '示例对话');
      var editor = document.createElement('div');
      editor.id = 'ccExpandEditor';
      editor.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10002;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateY(100%);opacity:0;overflow:hidden;';
      editor.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<button class="cc-expand-top-btn" id="ccExpandBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<div class="cc-expand-title-tag' + (isDialogue ? '' : ' blue') + '">' + App.esc(title) + '</div>' +
          '<button class="cc-expand-top-btn" id="ccExpandDone" type="button"><svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>' +
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
      App.charEdit = CharEdit;
    }
  };

  App.register('charEdit', CharEdit);
})();
```

---

**character.js — 找到 `renderList` 函数里 `panel.innerHTML =` 那段，把顶部栏部分：**

```javascript
          '<div class="cl-topbar-wrap">' +
            '<div class="cl-esc" id="clEsc">ESC</div>' +
            '<div class="cl-mode-btn" id="clModeBtn">' + MODE_LABELS[mi] + '</div>' +
            '<div class="cl-new-btn" id="clNewBtn">+ 创建</div>' +
          '</div>' +
```

**替换成：**

```javascript
          '<div class="cl-topbar-wrap">' +
            '<div class="cl-esc" id="clEsc">ESC</div>' +
            '<div class="cl-mode-btn" id="clModeBtn">' + MODE_LABELS[mi] + '</div>' +
            '<div class="cl-new-btn" id="clNewBtn">+ 创建</div>' +
          '</div>' +
          '<div class="cc-topbar">' +
            '<span class="cc-topbar-count">' + chars.length + ' 个角色</span>' +
            '<input type="text" class="cc-topbar-search" id="clSearchInput" placeholder="搜索角色...">' +
            '<button class="cc-topbar-settings" id="clSettingsBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>' +
          '</div>' +
```

**在 `renderList` 函数的事件绑定区域（顶部按钮那块后面），加上搜索和设置的事件：**

```javascript
      // 搜索
      var searchInput = panel.querySelector('#clSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          var kw = this.value.trim().toLowerCase();
          panel.querySelectorAll('.char-list-wrap').forEach(function(card) {
            var cid = card.dataset.charId;
            var c = Character.getById(cid);
            if (!c) return;
            var match = !kw || (c.name || '').toLowerCase().indexOf(kw) >= 0;
            card.style.display = match ? '' : 'none';
          });
        });
      }

      // 设置 → 角色管理
      var settingsBtn = panel.querySelector('#clSettingsBtn');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          Character.close();
          setTimeout(function() { if (App.charMgr) App.charMgr.open(); }, 380);
        });
      }