(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var User = {

    list: [],

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
      User.list = User.list.filter(function(u) {
        return u.id !== id;
      });
      User.save();
    },

    getById: function(id) {
      for (var i = 0; i < User.list.length; i++) {
        if (User.list[i].id === id) return User.list[i];
      }
      return null;
    },

    openPanel: function() {
      User.renderListView();
      var panel = App.$('#userPanel');
      if (!panel) return;
      panel.classList.remove('hidden');
      requestAnimationFrame(function() {
        panel.classList.add('show');
      });
    },

    closePanel: function() {
      var panel = App.$('#userPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() {
        panel.classList.add('hidden');
      }, 350);
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
        '<div class="fullpage-body" id="userListBody">' +
        '</div>';

      App.safeOn('#closeUserPanel', 'click', function() {
        User.closePanel();
      });

      App.safeOn('#addUserBtn', 'click', function() {
        User.renderEditView(null);
      });

      User.renderUserCards();
    },

    renderUserCards: function() {
      var body = App.$('#userListBody');
      if (!body) return;

      if (!User.list.length) {
        body.innerHTML =
          '<div class="empty-hint">还没有用户，点击右上角 + 创建</div>';
        return;
      }

      body.innerHTML = User.list.map(function(u) {
        return '<div class="char-card" data-id="' + u.id + '">' +
          '<div class="char-card-avatar">' +
            (u.avatar
              ? '<img src="' + u.avatar + '" alt="avatar">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>') +
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

          // 头像
          '<div class="char-avatar-upload" id="userAvatarUpload">' +
            (u.avatar
              ? '<img src="' + u.avatar + '" id="userAvatarPreview" alt="avatar">'
              : '<div class="char-avatar-placeholder" id="userAvatarPreview">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                  '<span>上传头像</span>' +
                '</div>') +
            '<input type="file" id="userAvatarInput" accept="image/*" hidden>' +
          '</div>' +

          '<div class="form-section-title">基础信息</div>' +
          User.fieldGroup('姓名 / 昵称', 'userName', u.name, '你的名字') +
          User.fieldGroup('年龄', 'userAge', u.age, '你的年龄') +
          User.fieldGroup('性别', 'userGender', u.gender, '你的性别') +

          '<div class="form-section-title">外貌描述</div>' +
          User.textareaGroup('userAppearance', u.appearance, '外貌描述...') +

          '<div class="form-section-title">性格特点</div>' +
          User.textareaGroup('userPersonality', u.personality, '性格描述...') +

          '<div class="form-section-title">背景信息</div>' +
          User.textareaGroup('userBackground', u.background, '用户的背景故事、设定...') +

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
          u.avatar = ev.target.result;
          var preview = App.$('#userAvatarPreview');
          if (preview) {
            var img = document.createElement('img');
            img.src = u.avatar;
            img.id = 'userAvatarPreview';
            preview.parentNode.replaceChild(img, preview);
          }
        };
        reader.readAsDataURL(file);
      });

      // 返回列表
      App.safeOn('#backToUserList', 'click', function() {
        User.renderListView();
      });

      // 保存
      App.safeOn('#saveUserBtn', 'click', function() {
        var data = {
          avatar: u.avatar || '',
          name: App.$('#userName') ? App.$('#userName').value.trim() : '',
          age: App.$('#userAge') ? App.$('#userAge').value.trim() : '',
          gender: App.$('#userGender') ? App.$('#userGender').value.trim() : '',
          appearance: App.$('#userAppearance') ? App.$('#userAppearance').value.trim() : '',
          personality: App.$('#userPersonality') ? App.$('#userPersonality').value.trim() : '',
          background: App.$('#userBackground') ? App.$('#userBackground').value.trim() : ''
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

    fieldGroup: function(label, id, value, placeholder) {
      return '<div class="form-group">' +
        (label ? '<label>' + label + '</label>' : '') +
        '<input type="text" id="' + id + '" value="' + App.esc(value || '') + '" placeholder="' + placeholder + '">' +
      '</div>';
    },

    textareaGroup: function(id, value, placeholder) {
      return '<div class="form-group">' +
        '<textarea id="' + id + '" class="form-textarea" placeholder="' + placeholder + '" rows="4">' + App.esc(value || '') + '</textarea>' +
      '</div>';
    },

    bindEvents: function() {
      App.safeOn('#openUserBtn', 'click', function() {
        User.openPanel();
      });

      // 长按图标换照片
      var pressTimer = null;
      var iconEl = App.$('#openUserBtn');
      if (iconEl) {
        iconEl.addEventListener('touchstart', function() {
          pressTimer = setTimeout(function() {
            App.$('#userIconInput').click();
          }, 600);
        }, { passive: true });

        iconEl.addEventListener('touchend', function() {
          clearTimeout(pressTimer);
        }, { passive: true });
      }

      App.safeOn('#userIconInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var imgEl = App.$('#userIconImg');
          if (!imgEl) return;
          imgEl.innerHTML = '<img src="' + ev.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:18px;">';
          App.LS.set('userIconImg', ev.target.result);
        };
        reader.readAsDataURL(file);
      });
    },

    init: function() {
      User.load();

      // 恢复图标图片
      var savedIcon = App.LS.get('userIconImg');
      if (savedIcon) {
        var imgEl = App.$('#userIconImg');
        if (imgEl) {
          imgEl.innerHTML = '<img src="' + savedIcon + '" style="width:100%;height:100%;object-fit:cover;border-radius:18px;">';
        }
      }

      // 创建全屏面板容器
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
