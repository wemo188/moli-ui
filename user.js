
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var FIELDS_SHORT = [
    { key: 'nickname', en: 'NICKNAME', cn: '昵称' },
    { key: 'gender', en: 'GENDER', cn: '性别' },
    { key: 'age', en: 'AGE', cn: '年龄' },
    { key: 'birthday', en: 'BIRTHDAY', cn: '生日' },
    { key: 'phone', en: 'PHONE', cn: '手机号' }
  ];

  var FIELDS_LONG = [
    { key: 'bio', en: 'DESCRIPTION', cn: '个人描述' }
  ];

  var User = {
    list: [],
    sealed: false,
    tempAvatar: '',

    load: function() { User.list = App.LS.get('userList') || []; },
    save: function() { App.LS.set('userList', User.list); },

    getById: function(id) {
      for (var i = 0; i < User.list.length; i++) {
        if (User.list[i].id === id) return User.list[i];
      }
      return null;
    },

    getActiveUser: function() {
      var activeId = App.LS.get('activeUserId');
      if (activeId) {
        var u = User.getById(activeId);
        if (u) return u;
      }
      return User.list[0] || null;
    },

    setActive: function(id) { App.LS.set('activeUserId', id); },

    // ====== 入口：打开用户管理 ======
    open: function() {
      User.load();
      if (!User.list.length) {
        User.openForkPage();
      } else {
        User.openListPage();
      }
    },

    closePage: function(page) {
      if (!page) return;
      page.style.transform = 'translateX(100%)';
      page.style.opacity = '0';
      setTimeout(function() { if (page.parentNode) page.remove(); }, 350);
    },

    // ====== 前导页：自由编辑 / 一键生成 ======
    openForkPage: function() {
      var old = App.$('#userForkPage');
      if (old) old.remove();

      var page = document.createElement('div');
      page.id = 'userForkPage';
      page.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10003;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';

      page.innerHTML =
        '<div class="up-fork-bg">' +
          '<div class="up-fork-circle1"></div>' +
          '<div class="up-fork-circle2"></div>' +
          '<div class="up-fork-circle3"></div>' +
          '<div class="up-fork-midline"></div>' +
        '</div>' +

        '<div style="position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:56px 20px 20px;">' +
          '<div id="upForkBack" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;">' +
            '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:rgba(30,80,162,0.5);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '<span style="font-size:12px;color:rgba(30,80,162,0.5);">返回</span>' +
          '</div>' +
          '<div style="font-size:8px;color:rgba(30,80,162,0.3);letter-spacing:4px;font-weight:600;">PROFILE SETUP</div>' +
          '<div style="width:40px;"></div>' +
        '</div>' +

        '<div style="position:relative;z-index:2;text-align:center;padding:16px 30px 32px;">' +
          '<div style="font-family:\'Dancing Script\',cursive;font-size:30px;color:#1e50a2;line-height:1.3;font-weight:700;">Create Your</div>' +
          '<div style="font-family:\'Dancing Script\',cursive;font-size:34px;color:#1e50a2;line-height:1.2;font-weight:700;">Exclusive Profile</div>' +
          '<div style="width:50px;height:1px;background:linear-gradient(90deg,transparent,#1e50a2,transparent);margin:14px auto 0;"></div>' +
        '</div>' +

        '<div style="position:relative;z-index:2;padding:0 20px;display:flex;flex-direction:column;gap:16px;">' +

          '<div class="up-ticket-shell" id="upForkFree"><div class="up-ticket-body"><div class="up-ticket-inner"></div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2;">' +
              '<div style="flex:1;">' +
                '<div class="up-ticket-name">自由编辑</div>' +
                '<div class="up-ticket-line"></div>' +
                '<div class="up-ticket-sub">FREE EDITING</div>' +
                '<div class="up-ticket-desc">打开空白档案 · 自由填写每一项内容</div>' +
              '</div>' +
              '<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:12px;">' +
                '<svg viewBox="0 0 48 48" style="width:44px;height:44px;"><rect x="10" y="6" width="28" height="36" rx="2" fill="none" stroke="rgba(30,80,162,0.3)" stroke-width="1.5"/><line x1="16" y1="16" x2="32" y2="16" stroke="rgba(30,80,162,0.2)" stroke-width="1.2" stroke-linecap="round"/><line x1="16" y1="22" x2="28" y2="22" stroke="rgba(30,80,162,0.2)" stroke-width="1.2" stroke-linecap="round"/><line x1="16" y1="28" x2="30" y2="28" stroke="rgba(30,80,162,0.2)" stroke-width="1.2" stroke-linecap="round"/><line x1="30" y1="34" x2="36" y2="28" stroke="#1e50a2" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/><circle cx="30" cy="34" r="1.5" fill="#1e50a2" opacity="0.4"/></svg>' +
              '</div>' +
            '</div>' +
          '</div></div>' +

          '<div class="up-ticket-shell" id="upForkStep"><div class="up-ticket-body"><div class="up-ticket-inner"></div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2;">' +
              '<div style="flex:1;">' +
                '<div class="up-ticket-name">一键生成</div>' +
                '<div class="up-ticket-line"></div>' +
                '<div class="up-ticket-sub">STEP BY STEP</div>' +
                '<div class="up-ticket-desc">跟随引导一步步填写 · 轻松完成设定</div>' +
              '</div>' +
              '<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:12px;">' +
                '<svg viewBox="0 0 48 48" style="width:44px;height:44px;"><circle cx="24" cy="24" r="18" fill="none" stroke="rgba(30,80,162,0.12)" stroke-width="1.5"/><circle cx="24" cy="24" r="18" fill="none" stroke="rgba(30,80,162,0.5)" stroke-width="1.5" stroke-dasharray="28 85" stroke-linecap="round" transform="rotate(-90 24 24)" style="animation:upPulse 3s ease-in-out infinite;"/><path d="M20 24h8M25 20l4 4-4 4" fill="none" stroke="rgba(30,80,162,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '</div>' +
            '</div>' +
          '</div></div>' +

        '</div>';

      document.body.appendChild(page);
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
      }); });

      page.querySelector('#upForkBack').addEventListener('click', function() {
        User.closePage(page);
      });

      page.querySelector('#upForkFree').addEventListener('click', function() {
        User.closePage(page);
        setTimeout(function() { User.openProfile(); }, 380);
      });

      page.querySelector('#upForkStep').addEventListener('click', function() {
        User.closePage(page);
        setTimeout(function() { User.openStepGuide(); }, 380);
      });
    },

    openStepGuide: function() {
      App.showToast('一键生成 · 开发中');
    },

    // ====== 用户列表页 ======
    openListPage: function() {
      var old = App.$('#userListPage');
      if (old) old.remove();

      User.load();

      var page = document.createElement('div');
      page.id = 'userListPage';
      page.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10003;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';

      var activeUser = User.getActiveUser();
      var activeId = activeUser ? activeUser.id : '';

      var cardsHtml = '';
      if (!User.list.length) {
        cardsHtml = '<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无用户，点击右上角创建</div>';
      } else {
        cardsHtml = User.list.map(function(u, i) {
          var isActive = u.id === activeId;
          var idx = String(i + 1).padStart(3, '0');
          var avatarHtml = u.avatar
            ? '<img src="' + App.esc(u.avatar) + '">'
            : '';
          var sign1 = u.sign1 || '';
          var sign2 = u.sign2 || '';

          return '<div class="p14-card" data-uid="' + u.id + '">' +
            '<div class="p14-top">' +
              '<div class="p14-led' + (isActive ? ' p14-led-on' : '') + '"></div>' +
              '<div class="p14-led"></div>' +
              '<div class="p14-led"></div>' +
            '</div>' +
            '<div class="p14-body">' +
              '<div class="p14-screen-wrap"><div class="p14-screen">' +
                '<div class="p14-screen-badge">' +
                  (isActive ? '<div class="p14-badge-dot"></div><div class="p14-badge-text">ACTIVE</div>' : '') +
                '</div>' +
                '<div class="p14-screen-no">NO.' + idx + '</div>' +
                '<div class="p14-screen-content">' +
                  '<div class="p14-avatar">' + avatarHtml + '</div>' +
                  '<div class="p14-info">' +
                    '<div class="p14-name">' + App.esc(u.realName || '未命名') + '</div>' +
                    (sign1 ? '<div class="p14-sign">' + App.esc(sign1) + '</div>' : '') +
                    (sign2 ? '<div class="p14-sign-italic">' + App.esc(sign2) + '</div>' : '') +
                  '</div>' +
                '</div>' +
              '</div></div>' +
              '<div class="p14-right">' +
                '<div class="p14-act-btn p14-act-edit" data-uid="' + u.id + '">编辑</div>' +
                '<div class="p14-act-btn" data-uid="' + u.id + '" data-action="activate" style="color:#6590b8;">' + (isActive ? '当前' : '切换') + '</div>' +
                '<div class="p14-act-btn p14-act-del" data-uid="' + u.id + '">删除</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      page.innerHTML =
        '<div class="up-list-header">' +
          '<div class="up-list-back" id="upListBack">' +
            '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '<span>返回</span>' +
          '</div>' +
          '<div class="up-list-title">用户列表</div>' +
          '<div class="up-list-add" id="upListAdd">+ 创建</div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 12px 40px;">' +
          cardsHtml +
        '</div>';

      document.body.appendChild(page);
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
      }); });

      page.querySelector('#upListBack').addEventListener('click', function() {
        User.closePage(page);
      });

      page.querySelector('#upListAdd').addEventListener('click', function() {
        User.closePage(page);
        setTimeout(function() { User.openForkPage(); }, 380);
      });

      page.querySelectorAll('.p14-act-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var uid = btn.dataset.uid;
          User.closePage(page);
          setTimeout(function() { User.openProfile(uid); }, 380);
        });
      });

      page.querySelectorAll('[data-action="activate"]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var uid = btn.dataset.uid;
          User.setActive(uid);
          User.closePage(page);
          setTimeout(function() { User.openListPage(); }, 380);
          App.showToast('已切换用户');
        });
      });

      page.querySelectorAll('.p14-act-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除这个用户？')) return;
          User.list = User.list.filter(function(u) { return u.id !== btn.dataset.uid; });
          User.save();
          User.closePage(page);
          setTimeout(function() {
            if (User.list.length) User.openListPage();
            else User.openForkPage();
          }, 380);
          App.showToast('已删除');
        });
      });
    },

    // ====== 档案编辑页 ======
    openProfile: function(editId) {
      var old = App.$('#userProfilePage');
      if (old) old.remove();

      User.load();
      var existing = editId ? User.getById(editId) : null;
      var user = existing || {};
      User.sealed = !!(user._sealed);
      User.tempAvatar = user.avatar || '';

      var today = new Date();
      var dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');

      var avatarHtml = user.avatar
        ? '<img src="' + App.esc(user.avatar) + '">'
        : '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

      var shortHtml = FIELDS_SHORT.map(function(f) {
        var val = user[f.key] || '';
        if (User.sealed) {
          return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div><span class="up-field-cn">' + f.cn + '</span></div><div class="up-field-line"><div class="up-text">' + App.esc(val || '—') + '</div></div></div>';
        }
        return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div><span class="up-field-cn">' + f.cn + '</span></div><div class="up-field-line"><input type="text" data-key="' + f.key + '" placeholder="输入' + f.cn + '..." value="' + App.esc(val) + '"></div></div>';
      }).join('');

      var longHtml = FIELDS_LONG.map(function(f) {
        var val = user[f.key] || '';
        if (User.sealed) {
          return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div><span class="up-field-cn">' + f.cn + '</span></div><div class="up-field-box"><div class="up-text">' + App.esc(val || '—') + '</div></div></div>';
        }
        return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div><span class="up-field-cn">' + f.cn + '</span></div><div class="up-field-box"><textarea data-key="' + f.key + '" placeholder="输入' + f.cn + '...">' + App.esc(val) + '</textarea></div></div>';
      }).join('');

      var page = document.createElement('div');
      page.id = 'userProfilePage';
      page.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10003;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';

      page.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<div id="upBackBtn" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;">' +
            '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#999;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '<span style="font-size:12px;color:#999;">返回</span>' +
          '</div>' +
          '<div style="font-size:10px;color:#ccc;letter-spacing:3px;">PROFILE</div>' +
          '<div id="upRebuild" style="font-size:10px;color:#c9706b;letter-spacing:1.5px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;' + (User.sealed ? '' : 'visibility:hidden;') + '">重建</div>' +
        '</div>' +

        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 60px;">' +
          '<div class="up-card" id="upCard">' +

            '<div class="up-seal' + (User.sealed ? ' show' : '') + '" id="upSeal">' +
              '<div class="up-seal-outer"><div class="up-seal-dashes"></div>' +
                '<div class="up-seal-inner">' +
                  '<div class="up-seal-top">PERSONAL FILE</div>' +
                  '<div class="up-seal-main">封存</div>' +
                  '<div class="up-seal-line"></div>' +
                  '<div class="up-seal-stars"><span class="up-seal-star">★</span><span class="up-seal-label">SEALED</span><span class="up-seal-star">★</span></div>' +
                  '<div class="up-seal-date">' + dateStr + '</div>' +
                '</div>' +
              '</div>' +
              '<div class="up-seal-noise"></div>' +
            '</div>' +

            '<div class="up-bar-top"></div>' +
            '<div class="up-card-head"><div class="up-card-head-sub">PERSONAL FILE</div><div class="up-card-head-title">个 人 档 案</div></div>' +

            '<div class="up-avatar-area"><div class="up-avatar-box" id="upAvatarBox">' + avatarHtml + '</div></div>' +

            '<div class="up-sign-area">' +
              (User.sealed
                ? '<div style="font-size:12px;color:#666;text-align:center;">' + App.esc(user.sign1 || '—') + '</div><div class="up-sign-italic" style="text-align:center;">' + App.esc(user.sign2 || '') + '</div>'
                : '<input type="text" data-key="sign1" placeholder="签名第一行..." value="' + App.esc(user.sign1 || '') + '"><input type="text" data-key="sign2" placeholder="签名第二行（显示为斜体）..." value="' + App.esc(user.sign2 || '') + '" style="font-style:italic;margin-top:2px;">') +
            '</div>' +

            '<div class="up-name-area">' +
              '<div class="up-name-label">NAME 姓名</div>' +
              (User.sealed
                ? '<div style="font-size:16px;font-weight:700;color:#1a1a1a;padding:4px 0 6px;">' + App.esc(user.realName || '—') + '</div>'
                : '<input type="text" class="up-name-input" data-key="realName" placeholder="输入姓名..." value="' + App.esc(user.realName || '') + '">') +
              '<div class="up-name-underline"></div>' +
              '<div class="up-name-underline2"></div>' +
            '</div>' +

            shortHtml +

            '<div class="up-divider"><div class="up-divider-line"></div><div class="up-divider-text">DETAIL 详情</div><div class="up-divider-line"></div></div>' +

            longHtml +

            '<div class="up-card-foot">CLASSIFIED</div>' +
            '<div class="up-bar-bot"></div>' +

            '<div class="up-quill" id="upQuill" style="' + (User.sealed ? 'display:none;' : '') + '"><img src="https://iili.io/BgIZWvI.md.png" draggable="false"></div>' +

          '</div>' +
        '</div>';

      document.body.appendChild(page);
      page._editId = editId || null;

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
      }); });

      // 头像上传
      if (!User.sealed) {
        page.querySelector('#upAvatarBox').addEventListener('click', function() {
          var box = this;
          var input = document.createElement('input');
          input.type = 'file'; input.accept = 'image/*';
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
                  User.tempAvatar = cropped;
                  box.innerHTML = '<img src="' + cropped + '">';
                });
              } else {
                User.tempAvatar = src;
                box.innerHTML = '<img src="' + src + '">';
              }
            };
            reader.readAsDataURL(file);
          };
          input.click();
        });
      }

      page.querySelector('#upBackBtn').addEventListener('click', function() {
        User.closePage(page);
      });

      page.querySelector('#upRebuild').addEventListener('click', function() {
        if (!confirm('确定要重建资料吗？将解除封存。')) return;
        var editId = page._editId;
        if (editId) {
          var u = User.getById(editId);
          if (u) { u._sealed = false; User.save(); }
        }
        User.closePage(page);
        setTimeout(function() { User.openProfile(editId); }, 380);
        App.showToast('已解除封存');
      });

      var quill = page.querySelector('#upQuill');
      if (quill) {
        quill.addEventListener('click', function() {
          User.saveProfile(page);
        });
      }
    },

    saveProfile: function(page) {
      var card = page.querySelector('#upCard');
      if (!card) return;

      var data = {};
      data.avatar = User.tempAvatar;
      data._sealed = true;

      // 读取姓名
      var nameInput = card.querySelector('[data-key="realName"]');
      if (nameInput) data.realName = (nameInput.value || '').trim();

      // 读取签名
      var sign1 = card.querySelector('[data-key="sign1"]');
      var sign2 = card.querySelector('[data-key="sign2"]');
      if (sign1) data.sign1 = (sign1.value || '').trim();
      if (sign2) data.sign2 = (sign2.value || '').trim();

      // 读取其他字段
      card.querySelectorAll('input[data-key]').forEach(function(el) {
        if (el.dataset.key !== 'realName' && el.dataset.key !== 'sign1' && el.dataset.key !== 'sign2') {
          data[el.dataset.key] = (el.value || '').trim();
        }
      });
      card.querySelectorAll('textarea[data-key]').forEach(function(el) {
        data[el.dataset.key] = (el.value || '').trim();
      });

      // 手机号自动生成
      if (!data.phone) {
        data.phone = '1' + Math.floor(100000000 + Math.random() * 900000000);
      }

      if (!data.realName) {
        App.showToast('请输入姓名');
        return;
      }

      var editId = page._editId;
      if (editId) {
        var existing = User.getById(editId);
        if (existing) {
          Object.keys(data).forEach(function(k) { existing[k] = data[k]; });
          User.save();
        }
      } else {
        data.id = 'user-' + Date.now();
        User.list.push(data);
        User.save();
        if (User.list.length === 1) User.setActive(data.id);
      }

      User.sealed = true;

      // 印章动画
      var seal = page.querySelector('#upSeal');
      if (seal) requestAnimationFrame(function() { seal.classList.add('show'); });

      // 隐藏羽毛笔
      var quill = page.querySelector('#upQuill');
      if (quill) quill.style.display = 'none';

      // 显示重建
      var rebuild = page.querySelector('#upRebuild');
      if (rebuild) rebuild.style.visibility = '';

      // 输入框变文字
      card.querySelectorAll('input[data-key]').forEach(function(el) {
        var div = document.createElement('div');
        div.className = 'up-text';
        div.textContent = el.value.trim() || '—';
        if (el.dataset.key === 'sign2') div.style.fontStyle = 'italic';
        el.parentNode.replaceChild(div, el);
      });
      card.querySelectorAll('textarea[data-key]').forEach(function(el) {
        var div = document.createElement('div');
        div.className = 'up-text';
        div.textContent = el.value.trim() || '—';
        div.style.whiteSpace = 'pre-wrap';
        el.parentNode.replaceChild(div, el);
      });
      // 姓名输入框
      var nameEl = card.querySelector('.up-name-input');
      if (nameEl) {
        var div = document.createElement('div');
        div.style.cssText = 'font-size:16px;font-weight:700;color:#1a1a1a;padding:4px 0 6px;';
        div.textContent = nameEl.value.trim() || '—';
        nameEl.parentNode.replaceChild(div, nameEl);
      }

      App.showToast('档案已封存');
    },

    init: function() {
      User.load();
      App.user = User;
      App.safeOn('#dockMine', 'click', function() { User.open(); });
    }
  };

  App.register('user', User);
})();
