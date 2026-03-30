(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var User = {

    list: [],
    avatarShape: 'rounded',

    empty: function() {
      return {
        id: '',
        name: '',
        age: '',
        gender: '',
        appearance: '',
        personality: '',
        background: '',
        avatar: ''
      };
    },

    save: function() { App.LS.set('userList', User.list); },
    load: function() {
      User.list = App.LS.get('userList') || [];
      User.avatarShape = App.LS.get('userAvatarShape') || 'rounded';
    },
    saveShape: function(shape) {
      User.avatarShape = shape;
      App.LS.set('userAvatarShape', shape);
    },
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

    getShapeClass: function() {
      switch (User.avatarShape) {
        case 'circle': return 'avatar-circle';
        case 'square': return 'avatar-square';
        default: return 'avatar-rounded';
      }
    },

    FIELDS: [
      { section: '外貌描述', key: 'appearance', placeholder: '外貌描述...' },
      { section: '性格特点', key: 'personality', placeholder: '性格描述...' },
      { section: '背景信息', key: 'background', placeholder: '背景故事、设定...' }
    ],

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
        '<div class="fullpage-body" id="userListBody"></div>' +
        '<div class="shape-selector">' +
          '<span class="shape-label">头像框：</span>' +
          '<button class="shape-btn' + (User.avatarShape === 'circle' ? ' active' : '') + '" data-shape="circle" type="button">圆形</button>' +
          '<button class="shape-btn' + (User.avatarShape === 'rounded' ? ' active' : '') + '" data-shape="rounded" type="button">圆角</button>' +
          '<button class="shape-btn' + (User.avatarShape === 'square' ? ' active' : '') + '" data-shape="square" type="button">方形</button>' +
        '</div>';

      App.safeOn('#closeUserPanel', 'click', function() { User.closePanel(); });
      App.safeOn('#addUserBtn', 'click', function() { User.renderEditView(null); });

      panel.querySelectorAll('.shape-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          User.saveShape(btn.dataset.shape);
          User.renderListView();
          App.showToast('头像框已切换');
        });
      });

      User.renderUserCards();
    },

    renderUserCards: function() {
      var body = App.$('#userListBody');
      if (!body) return;

      if (!User.list.length) {
        body.innerHTML = '<div class="empty-hint">还没有用户，点击右上角 + 创建</div>';
        return;
      }

      var shapeClass = User.getShapeClass();

      body.innerHTML = User.list.map(function(u) {
        return '<div class="char-card" data-id="' + u.id + '">' +
          '<div class="char-card-avatar ' + shapeClass + '">' +
            (u.avatar
              ? '<img src="' + u.avatar + '" alt="avatar">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') +
          '</div>' +
          '<div class="char-card-info">' +
            '<div class="char-card-name">' + App.esc(u.name || '未命名') + '</div>' +
            '<div class="char-card-desc">' + App.esc(u.gender || '') + (u.age ? ' · ' + App.esc(u.age) : '') + '</div>' +
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
          if (!confirm('确定删除这个用户？')) return;
          User.remove(btn.dataset.id);
          User.renderUserCards();
          App.showToast('已删除');
        });
      });
    },

    renderEditView: function(id) {
      var panel = App.$('#userPanel');
      if (!panel) return;

      var u = id ? (User.getById(id) || User.empty()) : User.empty();
      var isNew = !id;
      var editData = JSON.parse(JSON.stringify(u));

      var fieldsHtml = '';

      // 基础信息
      fieldsHtml +=
        '<div class="edit-section">' +
          '<div class="edit-section-title">基础信息</div>' +
          '<div class="edit-section-body">' +
            '<div class="form-group"><label>姓名 / 昵称</label><input type="text" id="userName" value="' + App.esc(u.name || '') + '" placeholder="你的名字"></div>' +
            '<div class="form-group"><label>年龄</label><input type="text" id="userAge" value="' + App.esc(u.age || '') + '" placeholder="你的年龄"></div>' +
            '<div class="form-group"><label>性别</label><input type="text" id="userGender" value="' + App.esc(u.gender || '') + '" placeholder="你的性别"></div>' +
          '</div>' +
        '</div>';

      // 可展开字段
      User.FIELDS.forEach(function(f) {
        var val = u[f.key] || '';
        fieldsHtml +=
          '<div class="edit-section">' +
            '<div class="edit-section-header" data-field="' + f.key + '">' +
              '<div class="edit-section-title">' + f.section + '</div>' +
              '<div class="edit-section-expand">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</div>' +
            '</div>' +
            '<div class="edit-section-body">' +
              '<textarea class="form-textarea edit-field-ta" data-key="' + f.key + '" placeholder="' + f.placeholder + '" rows="3">' + App.esc(val) + '</textarea>' +
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
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +

          '<div class="char-banner-upload" id="userBannerUpload">' +
            (u.avatar
              ? '<img src="' + u.avatar + '" id="userBannerPreview" alt="avatar">'
              : '<div class="char-banner-placeholder" id="userBannerPreview">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
                  '<span>上传用户图片</span>' +
                '</div>') +
            '<input type="file" id="userBannerInput" accept="image/*" hidden>' +
          '</div>' +

          fieldsHtml +

        '</div>';

      // 头像上传
      App.safeOn('#userBannerUpload', 'click', function() {
        App.$('#userBannerInput').click();
      });

      App.safeOn('#userBannerInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          editData.avatar = ev.target.result;
          var preview = App.$('#userBannerPreview');
          if (preview) {
            var img = document.createElement('img');
            img.src = editData.avatar;
            img.id = 'userBannerPreview';
            preview.parentNode.replaceChild(img, preview);
          }
        };
        reader.readAsDataURL(file);
      });

      // 展开编辑
      panel.querySelectorAll('.edit-section-expand').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var header = btn.closest('.edit-section-header');
          if (!header) return;
          var fieldKey = header.dataset.field;
          var fieldConfig = User.FIELDS.find(function(f) { return f.key === fieldKey; });
          if (!fieldConfig) return;

          var ta = panel.querySelector('.edit-field-ta[data-key="' + fieldKey + '"]');
          var currentVal = ta ? ta.value : '';

          App.character.openFieldEditor(fieldConfig.section, currentVal, function(newVal) {
            if (ta) ta.value = newVal;
          });
        });
      });

      App.safeOn('#backToUserList', 'click', function() { User.renderListView(); });

      App.safeOn('#saveUserBtn', 'click', function() {
        var data = {
          avatar: editData.avatar || u.avatar || '',
          name: App.$('#userName') ? App.$('#userName').value.trim() : '',
          age: App.$('#userAge') ? App.$('#userAge').value.trim() : '',
          gender: App.$('#userGender') ? App.$('#userGender').value.trim() : ''
        };

        User.FIELDS.forEach(function(f) {
          var ta = panel.querySelector('.edit-field-ta[data-key="' + f.key + '"]');
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

    bindEvents: function() {
      App.safeOn('#openUserBtn', 'click', function() { User.openPanel(); });

      var pressTimer = null;
      var iconEl = App.$('#openUserBtn');
      if (iconEl) {
        iconEl.addEventListener('touchstart', function() {
          pressTimer = setTimeout(function() { App.$('#userIconInput').click(); }, 600);
        }, { passive: true });
        iconEl.addEventListener('touchend', function() { clearTimeout(pressTimer); }, { passive: true });
        iconEl.addEventListener('touchmove', function() { clearTimeout(pressTimer); }, { passive: true });
      }

      App.safeOn('#userIconInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var imgEl = App.$('#userIconImg');
          if (!imgEl) return;
          imgEl.innerHTML = '<img src="' + ev.target.result + '">';
          App.LS.set('userIconImg', ev.target.result);
        };
        reader.readAsDataURL(file);
      });
    },

    init: function() {
      User.load();

      var savedIcon = App.LS.get('userIconImg');
      if (savedIcon) {
        var imgEl = App.$('#userIconImg');
        if (imgEl) imgEl.innerHTML = '<img src="' + savedIcon + '">';
      }

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
