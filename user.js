(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var USER_FIELDS = [
    { key: 'name', label: '姓名 / 昵称', placeholder: '你的名字' },
    { key: 'age', label: '年龄', placeholder: '你的年龄' },
    { key: 'gender', label: '性别', placeholder: '你的性别' },
    { key: 'appearance', label: '外貌描述', placeholder: '外貌描述...' },
    { key: 'personality', label: '性格特点', placeholder: '性格描述...' },
    { key: 'background', label: '背景信息', placeholder: '用户的背景故事、设定...' }
  ];

  var User = {

    list: [],
    editingAvatar: null,

    empty: function() {
      var obj = { id: '', avatar: '', avatarShape: 'circle' };
      USER_FIELDS.forEach(function(f) { obj[f.key] = ''; });
      return obj;
    },

    save: function() {
      App.LS.set('userList', User.list);
    },

    load: function() {
      User.list = App.LS.get('userList') || [];
    },

    add: function(data) {
      data.id = 'user-' + Date.now();
      User.list.push(data);
      User.save();
      return data;
    },

    update: function(id, data) {
      for (var i = 0; i < User.list.length; i++) {
        if (User.list[i].id === id) {
          data.id = id;
          User.list[i] = data;
          break;
        }
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

    getShapeLabel: function(shape) {
      if (shape === 'circle') return '圆形';
      if (shape === 'square') return '方形';
      return '圆角方形';
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

      body.innerHTML = User.list.map(function(u) {
        var shapeClass = User.getShapeClass(u.avatarShape);
        return '<div class="char-card" data-id="' + u.id + '">' +
          '<div class="char-card-avatar ' + shapeClass + '">' +
            (u.avatar
              ? '<img src="' + u.avatar + '" alt="">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') +
          '</div>' +
          '<div class="char-card-info">' +
            '<div class="char-card-name">' + App.esc(u.name || '未命名') + '</div>' +
            '<div class="char-card-desc">' + App.esc(u.gender || '') + (u.age ? ' · ' + u.age : '') + '</div>' +
          '</div>' +
          '<div class="char-card-actions">' +
            '<button class="char-edit-btn" data-id="' + u.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
            '</button>' +
            '<button class="char-del-btn" data-id="' + u.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.char-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          User.renderEditView(btn.dataset.id);
        });
      });

      body.querySelectorAll('.char-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
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

      var u = id ? (User.getById(id) || User.empty()) : User.empty();
      var isNew = !id;
      User.editingAvatar = u.avatar || '';

      var shapeClass = User.getShapeClass(u.avatarShape);

      var fieldsHtml = USER_FIELDS.map(function(f) {
        return '<div class="field-card">' +
          '<div class="field-card-header">' +
            '<span class="field-card-label">' + f.label + '</span>' +
            '<button class="field-expand-btn" data-field="' + f.key + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
            '</button>' +
          '</div>' +
          '<textarea id="userField_' + f.key + '" class="field-card-textarea" placeholder="' + f.placeholder + '" rows="3">' + App.esc(u[f.key] || '') + '</textarea>' +
        '</div>';
      }).join('');

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
          '<div class="char-avatar-section">' +
            '<div class="char-avatar-upload ' + shapeClass + '" id="userAvatarUpload">' +
              (u.avatar
                ? '<img src="' + u.avatar + '" id="userAvatarPreview" alt="">'
                : '<div class="char-avatar-placeholder" id="userAvatarPreview">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                    '<span>上传头像</span>' +
                  '</div>') +
              '<input type="file" id="userAvatarInput" accept="image/*" hidden>' +
            '</div>' +
            '<button class="avatar-shape-btn" id="userShapeBtn" type="button">' +
              User.getShapeLabel(u.avatarShape || 'circle') +
            '</button>' +
          '</div>' +
          fieldsHtml +
        '</div>';

      // 头像上传
      App.safeOn('#userAvatarUpload', 'click', function() {
        App.$('#userAvatarInput').click();
      });

      App.safeOn('#userAvatarInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          User.editingAvatar = ev.target.result;
          var preview = App.$('#userAvatarPreview');
          if (preview) {
            if (preview.tagName === 'IMG') {
              preview.src = User.editingAvatar;
            } else {
              var img = document.createElement('img');
              img.src = User.editingAvatar;
              img.id = 'userAvatarPreview';
              preview.parentNode.replaceChild(img, preview);
            }
          }
        };
        reader.readAsDataURL(file);
      });

      // 头像形状
      var currentShape = u.avatarShape || 'circle';
      App.safeOn('#userShapeBtn', 'click', function(e) {
        e.stopPropagation();
        currentShape = User.getNextShape(currentShape);
        var uploadEl = App.$('#userAvatarUpload');
        if (uploadEl) {
          uploadEl.classList.remove('shape-circle', 'shape-square', 'shape-rounded');
          uploadEl.classList.add(User.getShapeClass(currentShape));
        }
        this.textContent = User.getShapeLabel(currentShape);
        u.avatarShape = currentShape;
      });

      // 放大编辑
      panel.querySelectorAll('.field-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var fieldKey = btn.dataset.field;
          var field = USER_FIELDS.find(function(f) { return f.key === fieldKey; });
          if (!field) return;
          var ta = App.$('#userField_' + fieldKey);
          var currentVal = ta ? ta.value : '';
          User.openExpandEditor(field, currentVal, function(newVal) {
            if (ta) ta.value = newVal;
          });
        });
      });

      // 返回
      App.safeOn('#backToUserList', 'click', function() {
        User.renderListView();
      });

      // 保存
      App.safeOn('#saveUserBtn', 'click', function() {
        var data = {
          avatar: User.editingAvatar || '',
          avatarShape: currentShape
        };

        USER_FIELDS.forEach(function(f) {
          var ta = App.$('#userField_' + f.key);
          data[f.key] = ta ? ta.value.trim() : '';
        });

        if (!data.name) {
          App.showToast('请填写用户名称');
          return;
        }

        if (isNew) {
          User.add(data);
          App.showToast('用户已创建');
        } else {
          User.update(id, data);
          App.showToast('用户已保存');
        }

        User.renderListView();
      });
    },

    openExpandEditor: function(field, currentVal, onSave) {
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
          '<h2>' + field.label + '</h2>' +
          '<button class="fullpage-action-btn" id="expandEditorSave" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="expand-editor-body">' +
          '<textarea id="expandEditorTextarea" class="expand-editor-textarea" placeholder="' + field.placeholder + '">' + App.esc(currentVal || '') + '</textarea>' +
        '</div>';

      document.body.appendChild(editor);

      requestAnimationFrame(function() {
        editor.classList.add('show');
        var ta = App.$('#expandEditorTextarea');
        if (ta) ta.focus();
      });

      App.safeOn('#expandEditorBack', 'click', function() {
        User.closeExpandEditor();
      });

      App.safeOn('#expandEditorSave', 'click', function() {
        var ta = App.$('#expandEditorTextarea');
        var val = ta ? ta.value : '';
        if (onSave) onSave(val);
        User.closeExpandEditor();
        App.showToast(field.label + ' 已更新');
      });
    },

    closeExpandEditor: function() {
      var editor = App.$('#expandEditor');
      if (!editor) return;
      editor.classList.remove('show');
      setTimeout(function() {
        if (editor.parentNode) editor.parentNode.removeChild(editor);
      }, 350);
    },

    bindEvents: function() {
      App.safeOn('#openUserBtn', 'click', function() {
        User.openPanel();
      });
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
