(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var User = {

    list: [],
    editingAvatar: null,

    empty: function() {
      return {
        id: '',
        name: '',
        age: '',
        gender: '',
        appearance: '',
        personality: '',
        background: '',
        avatar: '',
        avatarShape: 'circle'
      };
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

    setActive: function(id) {
      App.LS.set('activeUserId', id);
    },

    getActive: function() {
      return App.LS.get('activeUserId');
    },

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
        return '<div class="char-card' + (isActive ? ' user-active' : '') + '" data-id="' + u.id + '">' +
          '<div class="char-card-avatar ' + shapeClass + '" data-id="' + u.id + '" data-role="shapeToggle">' +
            (u.avatar
              ? '<img src="' + u.avatar + '" alt="">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') +
          '</div>' +
          '<div class="char-card-info">' +
            '<div class="char-card-name">' + App.esc(u.name || '未命名') + '</div>' +
            '<div class="char-card-desc">' + App.esc(u.gender || '') + (u.age ? ' · ' + u.age : '') + '</div>' +
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

      // 启用按钮
      body.querySelectorAll('.user-active-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          User.setActive(btn.dataset.id);
          User.renderCards();
          App.showToast('已启用');
        });
      });

      // 点击头像切换形状
      body.querySelectorAll('[data-role="shapeToggle"]').forEach(function(avatarEl) {
        avatarEl.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = avatarEl.dataset.id;
          var u = User.getById(id);
          if (!u) return;
          u.avatarShape = User.getNextShape(u.avatarShape || 'circle');
          User.save();
          avatarEl.classList.remove('shape-circle', 'shape-square', 'shape-rounded');
          avatarEl.classList.add(User.getShapeClass(u.avatarShape));
          App.showToast(u.avatarShape === 'circle' ? '圆形' : u.avatarShape === 'square' ? '方形' : '圆角方形');
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
          var id = btn.dataset.id;
          if (id === User.getActive()) {
            App.showToast('无法删除已启用的用户');
            return;
          }
          if (!confirm('确定删除？')) return;
          User.remove(id);
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
            '<div class="char-avatar-upload" id="userAvatarUpload">' +
              (u.avatar
                ? '<img src="' + u.avatar + '" id="userAvatarPreview" alt="">'
                : '<div class="char-avatar-placeholder" id="userAvatarPreview">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                    '<span>上传头像</span>' +
                  '</div>') +
              '<input type="file" id="userAvatarInput" accept="image/*" hidden>' +
            '</div>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>姓名 / 昵称</label>' +
            '<input type="text" id="userName" value="' + App.esc(u.name || '') + '" placeholder="你的名字">' +
          '</div>' +

          '<div class="form-group">' +
            '<label>年龄</label>' +
            '<input type="text" id="userAge" value="' + App.esc(u.age || '') + '" placeholder="你的年龄">' +
          '</div>' +

          '<div class="form-group">' +
            '<label>性别</label>' +
            '<input type="text" id="userGender" value="' + App.esc(u.gender || '') + '" placeholder="你的性别">' +
          '</div>' +

          '<div class="form-group">' +
            '<label>外貌描述</label>' +
            '<div class="textarea-expand-row">' +
              '<textarea id="userAppearance" class="form-textarea" placeholder="外貌描述..." rows="3">' + App.esc(u.appearance || '') + '</textarea>' +
              '<button class="field-expand-btn" data-target="userAppearance" data-label="外貌描述" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>性格特点</label>' +
            '<div class="textarea-expand-row">' +
              '<textarea id="userPersonality" class="form-textarea" placeholder="性格描述..." rows="3">' + App.esc(u.personality || '') + '</textarea>' +
              '<button class="field-expand-btn" data-target="userPersonality" data-label="性格特点" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>背景信息</label>' +
            '<div class="textarea-expand-row">' +
              '<textarea id="userBackground" class="form-textarea" placeholder="用户的背景故事、设定..." rows="3">' + App.esc(u.background || '') + '</textarea>' +
              '<button class="field-expand-btn" data-target="userBackground" data-label="背景信息" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

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

      // 放大编辑按钮
      panel.querySelectorAll('.field-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var targetId = btn.dataset.target;
          var label = btn.dataset.label;
          var el = App.$('#' + targetId);
          if (!el) return;
          var currentVal = el.value || '';
          User.openExpandEditor(label, el.placeholder || '', currentVal, function(newVal) {
            el.value = newVal;
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
          avatarShape: u.avatarShape || 'circle',
          name: (App.$('#userName') ? App.$('#userName').value.trim() : ''),
          age: (App.$('#userAge') ? App.$('#userAge').value.trim() : ''),
          gender: (App.$('#userGender') ? App.$('#userGender').value.trim() : ''),
          appearance: (App.$('#userAppearance') ? App.$('#userAppearance').value.trim() : ''),
          personality: (App.$('#userPersonality') ? App.$('#userPersonality').value.trim() : ''),
          background: (App.$('#userBackground') ? App.$('#userBackground').value.trim() : '')
        };

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

    openExpandEditor: function(label, placeholder, currentVal, onSave) {
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
          '<h2>' + label + '</h2>' +
          '<button class="fullpage-action-btn" id="expandEditorSave" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="expand-editor-body">' +
          '<textarea id="expandEditorTextarea" class="expand-editor-textarea" placeholder="' + placeholder + '">' + App.esc(currentVal || '') + '</textarea>' +
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
        App.showToast(label + ' 已更新');
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
