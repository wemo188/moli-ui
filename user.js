(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var User = {

    list: [],
    editingAvatar: '',

    FIELDS: [
      { key: 'basicInfo', label: '基础信息', placeholder: '名字、年龄、性别、身份、外貌...' },
      { key: 'hobbies', label: '习惯爱好', placeholder: '日常习惯、兴趣爱好...' },
      { key: 'background', label: '背景补充', placeholder: '背景故事、经历、与角色的关系...' }
    ],

    empty: function() {
      var obj = {
        id: '',
        name: '',
        avatar: '',
        avatarShape: 'circle'
      };
      User.FIELDS.forEach(function(f) { obj[f.key] = ''; });
      return obj;
    },

    save: function() { App.LS.set('userList', User.list); },
    load: function() { User.list = App.LS.get('userList') || []; },

    add: function(data) {
      data.id = 'user-' + Date.now();
      User.list.push(data);
      User.save();
      return data;
    },

    update: function(id, data) {
      for (var i = 0; i < User.list.length; i++) {
        if (User.list[i].id === id) { data.id = id; User.list[i] = data; break; }
      }
      User.save();
    },

    remove: function(id) {
      User.list = User.list.filter(function(u) { return u.id !== id; });
      User.save();
    },

    getById: function(id) {
      for (var i = 0; i < User.list.length; i++) {
        if (User.list[i].id === id) return User.list[i];
      }
      return null;
    },

    setActive: function(id) { App.LS.set('activeUserId', id); },
    getActive: function() { return App.LS.get('activeUserId'); },
    getActiveUser: function() {
      var id = User.getActive();
      return id ? User.getById(id) : null;
    },

    getShapeClass: function(shape) {
      if (shape === 'square') return 'shape-square';
      if (shape === 'rounded') return 'shape-rounded';
      return 'shape-circle';
    },
    getNextShape: function(shape) {
      if (shape === 'circle') return 'square';
      if (shape === 'square') return 'rounded';
      return 'circle';
    },

    openPanel: function() {
      User.renderListView();
      var panel = App.$('#userPanel');
      if (!panel) return;
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    closePanel: function() {
      var panel = App.$('#userPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderListView: function() {
      var panel = App.$('#userPanel');
      if (!panel) return;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closeUserPanel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>用户</h2>' +
          '<button class="fullpage-action-btn" id="addUserBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body" id="userListBody"></div>';

      App.safeOn('#closeUserPanel', 'click', function() { User.closePanel(); });
      App.safeOn('#addUserBtn', 'click', function() { User.renderEditView(null); });
      User.renderCards();
    },

    renderCards: function() {
      var body = App.$('#userListBody');
      if (!body) return;

      if (!User.list.length) {
        body.innerHTML = '<div class="empty-hint">还没有用户，点击右上角 + 创建</div>';
        return;
      }

      var activeId = User.getActive();

      body.innerHTML = User.list.map(function(u) {
        var shapeClass = User.getShapeClass(u.avatarShape);
        var isActive = u.id === activeId;
        var displayName = u.name || '未命名';
        return '<div class="char-card' + (isActive ? ' user-active' : '') + '" data-id="' + u.id + '">' +
          '<div class="char-card-avatar ' + shapeClass + '" data-id="' + u.id + '" data-role="shapeToggle">' +
            (u.avatar
              ? '<img src="' + u.avatar + '" alt="">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') +
          '</div>' +
          '<div class="char-card-info">' +
            '<div class="char-card-name">' + App.esc(displayName) + '</div>' +
            '<div class="char-card-desc">' + App.esc((u.basicInfo || '').slice(0, 30)) + '</div>' +
          '</div>' +
          '<div class="char-card-actions">' +
            '<button class="user-active-btn' + (isActive ? ' active' : '') + '" data-id="' + u.id + '" type="button">' +
              (isActive ? '已启用' : '启用') +
            '</button>' +
            '<button class="char-edit-btn" data-id="' + u.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
            '</button>' +
            '<button class="char-del-btn" data-id="' + u.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.user-active-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          User.setActive(btn.dataset.id);
          User.renderCards();
          App.showToast('已启用');
        });
      });

      body.querySelectorAll('[data-role="shapeToggle"]').forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.stopPropagation();
          var u = User.getById(el.dataset.id);
          if (!u) return;
          u.avatarShape = User.getNextShape(u.avatarShape || 'circle');
          User.save();
          el.classList.remove('shape-circle', 'shape-square', 'shape-rounded');
          el.classList.add(User.getShapeClass(u.avatarShape));
        });
      });

      body.querySelectorAll('.char-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          User.renderEditView(btn.dataset.id);
        });
      });

      body.querySelectorAll('.char-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (btn.dataset.id === User.getActive()) {
            App.showToast('无法删除已启用的用户');
            return;
          }
          if (!confirm('确定删除？')) return;
          User.remove(btn.dataset.id);
          User.renderCards();
          App.showToast('已删除');
        });
      });
    },

    renderEditView: function(id) {
      var panel = App.$('#userPanel');
      if (!panel) return;

      var isNew = !id;
      var u = isNew ? User.empty() : User.getById(id);
      if (!u) return;
      User.editingAvatar = u.avatar || '';

      var fieldsHtml = '';

      // 名称
      fieldsHtml +=
        '<div class="form-group">' +
          '<label>名称</label>' +
          '<input type="text" id="userName" value="' + App.esc(u.name || '') + '" placeholder="给这个身份起个名字">' +
        '</div>';

      // 文本框字段
      User.FIELDS.forEach(function(f) {
        fieldsHtml +=
          '<div class="field-card">' +
            '<div class="field-card-top">' +
              '<div class="field-card-label">' + f.label + '</div>' +
            '</div>' +
            '<div class="field-card-body">' +
              '<textarea class="field-card-textarea" id="field_' + f.key + '" placeholder="' + f.placeholder + '" rows="3">' + App.esc(u[f.key] || '') + '</textarea>' +
              '<button class="field-expand-btn" data-field="' + f.key + '" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>';
      });

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToUserList">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '新建用户' : '编辑用户') + '</h2>' +
          '<button class="fullpage-action-btn" id="saveUserBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +
          '<div class="avatar-row">' +
            '<div class="avatar-upload-area" id="userAvatarUpload">' +
              (u.avatar
                ? '<img src="' + u.avatar + '" alt="">'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>上传头像</span>') +
            '</div>' +
            '<div class="avatar-row-info">点击上传头像<br>点击列表中的头像可切换形状</div>' +
          '</div>' +
          fieldsHtml +
        '</div>';

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.hidden = true;
      panel.appendChild(fileInput);

      App.safeOn('#userAvatarUpload', 'click', function() { fileInput.click(); });

      fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          App.cropImage(ev.target.result, function(croppedData) {
            User.editingAvatar = croppedData;
            App.$('#userAvatarUpload').innerHTML = '<img src="' + croppedData + '" alt="">';
          });
        };
        reader.readAsDataURL(file);
      });

      App.safeOn('#backToUserList', 'click', function() { User.renderListView(); });

      App.safeOn('#saveUserBtn', 'click', function() {
        var name = App.$('#userName') ? App.$('#userName').value.trim() : '';
        if (!name) {
          App.showToast('请填写名称');
          return;
        }
        u.name = name;
        u.avatar = User.editingAvatar || '';

        User.FIELDS.forEach(function(f) {
          var el = App.$('#field_' + f.key);
          if (el) u[f.key] = el.value;
        });

        if (isNew) {
          User.add(u);
          App.showToast('用户已创建');
        } else {
          User.update(id, u);
          App.showToast('已保存');
        }
        User.renderListView();
      });

      panel.querySelectorAll('.field-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var key = btn.dataset.field;
          var textarea = App.$('#field_' + key);
          if (!textarea) return;
          var label = '';
          for (var i = 0; i < User.FIELDS.length; i++) {
            if (User.FIELDS[i].key === key) { label = User.FIELDS[i].label; break; }
          }
          User.openExpandEditor(label || key, textarea);
        });
      });
    },

    openExpandEditor: function(title, sourceTextarea) {
      var existing = App.$('#expandEditor');
      if (existing) existing.remove();

      var editor = document.createElement('div');
      editor.id = 'expandEditor';
      editor.className = 'expand-editor';
      editor.innerHTML =
        '<div class="expand-editor-header">' +
          '<div class="fullpage-back" id="expandEditorBack">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + App.esc(title) + '</h2>' +
          '<button class="fullpage-action-btn" id="expandEditorDone" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="expand-editor-body">' +
          '<textarea class="expand-editor-textarea" id="expandTextarea">' + App.esc(sourceTextarea.value) + '</textarea>' +
        '</div>';

      document.body.appendChild(editor);
      requestAnimationFrame(function() { editor.classList.add('show'); });

      function closeEditor() {
        sourceTextarea.value = App.$('#expandTextarea').value;
        editor.classList.remove('show');
        setTimeout(function() { editor.remove(); }, 350);
      }

      App.safeOn('#expandEditorBack', 'click', closeEditor);
      App.safeOn('#expandEditorDone', 'click', closeEditor);
    },

    bindEvents: function() {
      App.safeOn('#openUserBtn', 'click', function() { User.openPanel(); });
    },

    init: function() {
      User.load();
      if (!App.$('#userPanel')) {
        var panel = document.createElement('div');
        panel.id = 'userPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }
      App.user = User;
      User.bindEvents();
    }
  };

  App.register('user', User);
})();
