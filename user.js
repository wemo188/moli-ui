
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

  function pcVars(hue, sat, lit) {
    var bs = Math.max(40, Math.min(70, +sat));
    var bl = Math.max(45, Math.min(70, +lit));
    return '--pc5:hsla('+hue+','+bs+'%,'+bl+'%,0.5);--pc25:hsla('+hue+','+bs+'%,'+bl+'%,0.25);--pc45:hsla('+hue+','+bs+'%,'+bl+'%,0.45);--pc35:hsla('+hue+','+bs+'%,'+bl+'%,0.35);--pc18:hsla('+hue+','+bs+'%,'+bl+'%,0.18);--pc1:hsla('+hue+','+bs+'%,'+bl+'%,0.1);';
  }

  function setPcVars(card, h, s, l) {
    var bs = Math.max(40, Math.min(70, +s));
    var bl = Math.max(45, Math.min(70, +l));
    card.style.setProperty('--pc5', 'hsla('+h+','+bs+'%,'+bl+'%,0.5)');
    card.style.setProperty('--pc25', 'hsla('+h+','+bs+'%,'+bl+'%,0.25)');
    card.style.setProperty('--pc45', 'hsla('+h+','+bs+'%,'+bl+'%,0.45)');
    card.style.setProperty('--pc35', 'hsla('+h+','+bs+'%,'+bl+'%,0.35)');
    card.style.setProperty('--pc18', 'hsla('+h+','+bs+'%,'+bl+'%,0.18)');
    card.style.setProperty('--pc1', 'hsla('+h+','+bs+'%,'+bl+'%,0.1)');
  }

  var User = {
    list: [],
    sealed: false,
    tempAvatar: '',
    _pages: [],

    load: function() { User.list = App.LS.get('userList') || []; },
    save: function() { App.LS.set('userList', User.list); },
    getById: function(id) { for (var i = 0; i < User.list.length; i++) { if (User.list[i].id === id) return User.list[i]; } return null; },
    getActiveUser: function() { var id = App.LS.get('activeUserId'); if (id) { var u = User.getById(id); if (u) return u; } return User.list[0] || null; },
    setActive: function(id) { App.LS.set('activeUserId', id); },

    _pushPage: function(page) {
      User._pages.push(page);
      document.body.appendChild(page);
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.style.transform = 'translateX(0)'; page.style.opacity = '1';
      }); });
    },

    _popPage: function() {
      if (!User._pages.length) return;
      var page = User._pages.pop();
      page.style.transform = 'translateX(100%)'; page.style.opacity = '0';
      setTimeout(function() { if (page.parentNode) page.remove(); }, 350);
    },

    _popAll: function() {
      var pages = User._pages.splice(0);
      pages.forEach(function(page) {
        page.style.transform = 'translateX(100%)'; page.style.opacity = '0';
        setTimeout(function() { if (page.parentNode) page.remove(); }, 350);
      });
    },

    _makePage: function() {
      var page = document.createElement('div');
      page.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10003;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      return page;
    },

    open: function() {
      User.load();
      if (!User.list.length) User.openProfile(null);
      else User.openListPage();
    },

    // ====== 列表页 ======
    openListPage: function() {
      User.load();
      var page = User._makePage();
      var activeUser = User.getActiveUser();
      var activeId = activeUser ? activeUser.id : '';

      var cardsHtml = '';
      if (!User.list.length) {
        cardsHtml = '<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无用户，点击右上角创建</div>';
      } else {
        cardsHtml = User.list.map(function(u, i) {
          var isActive = u.id === activeId;
          var avatarHtml = u.avatar ? '<img src="' + App.esc(u.avatar) + '">' : '';
          var hue = u.cardHue || 210, sat = u.cardSat || 80, lit = u.cardLit || 87;
          var cardBg = 'linear-gradient(155deg,hsla(' + hue + ',' + sat + '%,' + lit + '%,0.6),hsla(' + hue + ',' + sat + '%,' + (+lit+5) + '%,0.45) 25%,hsla(' + hue + ',' + sat + '%,' + (+lit+10) + '%,0.7) 45%,hsla(' + hue + ',' + sat + '%,' + (+lit+3) + '%,0.5) 65%,hsla(' + hue + ',' + sat + '%,' + lit + '%,0.55))';
          var borderC = 'hsla(' + hue + ',' + sat + '%,' + lit + '%,0.5)';
          var bgImgHtml = u.cardBg ? '<div class="p14-bg"><img src="' + App.esc(u.cardBg) + '"></div>' : '<div class="p14-bg"></div>';
          var vars = pcVars(hue, sat, lit);

          return '<div class="p14-card" data-uid="' + u.id + '" style="' + vars + 'background:' + cardBg + ';border-color:' + borderC + ';">' +
            bgImgHtml +
            '<div class="p14-top"><div class="p14-led' + (isActive ? ' p14-led-on' : '') + '"></div><div class="p14-led"></div><div class="p14-led"></div></div>' +
            '<div class="p14-body">' +
              '<div class="p14-left">' +
                '<div class="p14-side-btn p14-side-reset" data-uid="' + u.id + '">重置</div>' +
                '<div class="p14-paw-btn" data-uid="' + u.id + '"><div class="p14-paw-inner"><div class="p14-pp p14-pp-t1"></div><div class="p14-pp p14-pp-t2"></div><div class="p14-pp p14-pp-t3"></div><div class="p14-pp p14-pp-t4"></div><div class="p14-pp p14-pp-main"></div></div></div>' +
                '<div class="p14-side-btn p14-side-del"><span class="p14-del-text" data-uid="' + u.id + '">删除</span></div>' +
              '</div>' +
              '<div class="p14-screen-wrap"><div class="p14-screen">' +
                '<div class="p14-screen-badge">' + (isActive ? '<div class="p14-badge-dot"></div><div class="p14-badge-text">ACTIVE</div>' : '') + '</div>' +
                '<div class="p14-screen-content">' +
                  '<div class="p14-avatar-wrap" data-uid="' + u.id + '"><div class="p14-avatar">' + avatarHtml + '</div><div class="p14-avatar-ov"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div></div>' +
                  '<div class="p14-info"><div class="p14-name">' + App.esc(u.realName || '未命名') + '</div>' +
                    (u.sign1 ? '<div class="p14-sign">' + App.esc(u.sign1) + '</div>' : '') +
                    (u.sign2 ? '<div class="p14-sign-italic">' + App.esc(u.sign2) + '</div>' : '') +
                  '</div>' +
                '</div>' +
              '</div></div>' +
              '<div class="p14-right">' +
                '<div class="p14-side-btn p14-side-edit" data-uid="' + u.id + '">编辑</div>' +
                '<div class="p14-dpad">' +
                  '<div class="p14-dpad-btn p14-dpad-up p14-dk">♠</div>' +
                  '<div class="p14-dpad-btn p14-dpad-left p14-dk">♣</div>' +
                  '<div class="p14-dpad-btn p14-dpad-right p14-rd">♦</div>' +
                  '<div class="p14-dpad-btn p14-dpad-down p14-rd">♥</div>' +
                '</div>' +
                '<div class="p14-side-btn p14-side-activate" data-uid="' + u.id + '">' + (isActive ? '当前' : '启用') + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="p14-panel" data-panel-uid="' + u.id + '">' +
              '<div class="p14-panel-title">✦ CUSTOMIZE ✦</div>' +
              '<div class="p14-panel-row"><div class="p14-panel-label">机身背景</div><div class="p14-panel-upload p14-bg-upload-btn" data-uid="' + u.id + '"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>上传图片</div></div>' +
              '<div class="p14-panel-row" style="align-items:flex-start;"><div class="p14-panel-label" style="margin-top:2px;">机身颜色</div>' +
                '<div class="p14-slider-wrap">' +
                  '<div class="p14-slider-item"><span class="p14-slider-name">H</span><input type="range" class="p14-slider p14-hue" data-uid="' + u.id + '" min="0" max="360" value="' + hue + '"><span class="p14-slider-val p14-hue-val">' + hue + '</span></div>' +
                  '<div class="p14-slider-item"><span class="p14-slider-name">S</span><input type="range" class="p14-slider p14-sat" data-uid="' + u.id + '" min="0" max="100" value="' + sat + '"><span class="p14-slider-val p14-sat-val">' + sat + '</span></div>' +
                  '<div class="p14-slider-item"><span class="p14-slider-name">L</span><input type="range" class="p14-slider p14-lit" data-uid="' + u.id + '" min="20" max="90" value="' + lit + '"><span class="p14-slider-val p14-lit-val">' + lit + '</span></div>' +
                '</div>' +
                '<div class="p14-color-preview" data-uid="' + u.id + '" style="background:hsl(' + hue + ',' + sat + '%,' + lit + '%);"></div>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      page.innerHTML =
        '<div class="up-list-header">' +
          '<div class="up-list-back" id="upListBack"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg><span>返回</span></div>' +
          '<div class="up-list-title">用户列表</div>' +
          '<div class="up-list-add" id="upListAdd">+</div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 4px 40px;">' + cardsHtml + '</div>';

      User._pushPage(page);

      page.querySelector('#upListBack').addEventListener('click', function() { User._popAll(); });
      page.querySelector('#upListAdd').addEventListener('click', function() { User.openProfile(null); });

      // 猫爪
      page.querySelectorAll('.p14-paw-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var uid = btn.dataset.uid;
          var panel = page.querySelector('[data-panel-uid="' + uid + '"]');
          if (!panel) return;
          var isOpen = panel.classList.contains('p14-open');
          page.querySelectorAll('.p14-panel.p14-open').forEach(function(p) { p.classList.remove('p14-open'); });
          page.querySelectorAll('.p14-paw-btn.p14-active').forEach(function(b) { b.classList.remove('p14-active'); });
          if (!isOpen) {
            panel.classList.add('p14-open');
            btn.classList.add('p14-active');
          }
        });
      });

      // 头像
      page.querySelectorAll('.p14-avatar-wrap').forEach(function(wrap) {
        wrap.addEventListener('click', function(e) {
          e.stopPropagation();
          User.showImgMenu(wrap.dataset.uid, 'avatar', function(src) {
            var u = User.getById(wrap.dataset.uid);
            if (u) { u.avatar = src; User.save(); }
            var av = wrap.querySelector('.p14-avatar');
            if (av) av.innerHTML = src ? '<img src="' + src + '">' : '';
          });
        });
      });

      // 背景上传
      page.querySelectorAll('.p14-bg-upload-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          User.showImgMenu(btn.dataset.uid, 'cardBg', function(src) {
            var u = User.getById(btn.dataset.uid);
            if (u) { u.cardBg = src; User.save(); }
            var card = page.querySelector('[data-uid="' + btn.dataset.uid + '"]');
            if (card) { var bg = card.querySelector('.p14-bg'); if (bg) bg.innerHTML = src ? '<img src="' + src + '">' : ''; }
          });
        });
      });

      // 颜色滑块
      page.querySelectorAll('.p14-hue,.p14-sat,.p14-lit').forEach(function(slider) {
        slider.addEventListener('input', function() {
          var uid = slider.dataset.uid;
          var card = page.querySelector('[data-uid="' + uid + '"]');
          if (!card) return;
          var h = card.querySelector('.p14-hue').value;
          var s = card.querySelector('.p14-sat').value;
          var l = card.querySelector('.p14-lit').value;
          card.querySelector('.p14-hue-val').textContent = h;
          card.querySelector('.p14-sat-val').textContent = s;
          card.querySelector('.p14-lit-val').textContent = l;
          var preview = card.querySelector('.p14-color-preview');
          if (preview) preview.style.background = 'hsl(' + h + ',' + s + '%,' + l + '%)';
          card.style.background = 'linear-gradient(155deg,hsla(' + h + ',' + s + '%,' + l + '%,0.6),hsla(' + h + ',' + s + '%,' + (+l+5) + '%,0.45) 25%,hsla(' + h + ',' + s + '%,' + (+l+10) + '%,0.7) 45%,hsla(' + h + ',' + s + '%,' + (+l+3) + '%,0.5) 65%,hsla(' + h + ',' + s + '%,' + l + '%,0.55))';
          card.style.borderColor = 'hsla(' + h + ',' + s + '%,' + l + '%,0.5)';
          setPcVars(card, h, s, l);
          var u = User.getById(uid);
          if (u) { u.cardHue = +h; u.cardSat = +s; u.cardLit = +l; User.save(); }
        });
      });

      // 编辑
      page.querySelectorAll('.p14-side-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          User.openProfile(btn.dataset.uid);
        });
      });

      // 启用
      page.querySelectorAll('.p14-side-activate').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          User.setActive(btn.dataset.uid);
          User._popPage();
          User.openListPage();
          App.showToast('已切换用户');
        });
      });

      // 重置
      page.querySelectorAll('.p14-side-reset').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var u = User.getById(btn.dataset.uid);
          if (!u) return;
          u.cardHue = 210; u.cardSat = 80; u.cardLit = 87;
          User.save();
          User._popPage();
          User.openListPage();
          App.showToast('已重置配色');
        });
      });

      // 删除
      page.querySelectorAll('.p14-del-text').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除？')) return;
          User.list = User.list.filter(function(u) { return u.id !== btn.dataset.uid; });
          User.save();
          User._popPage();
          if (User.list.length) User.openListPage();
          App.showToast('已删除');
        });
      });
    },

    // ====== 图片菜单 ======
    showImgMenu: function(uid, field, callback) {
      var old = App.$('#imgSourceMenu');
      if (old) old.remove();
      var menu = document.createElement('div');
      menu.id = 'imgSourceMenu';
      menu.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
      menu.innerHTML =
        '<div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:10px;">' +
          '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;letter-spacing:1px;margin-bottom:4px;">选择图片来源</div>' +
          '<button class="ism-btn" data-act="album" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择</button>' +
          '<button class="ism-btn" data-act="url" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button>' +
          '<button class="ism-btn" data-act="del" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:12px;font-weight:500;color:#bbb;cursor:pointer;font-family:inherit;">删除图片</button>' +
          '<button class="ism-btn" data-act="cancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>' +
        '</div>';
      document.body.appendChild(menu);
      menu.addEventListener('click', function(e) { if (e.target === menu) menu.remove(); });
      menu.querySelectorAll('.ism-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var act = btn.dataset.act;
          menu.remove();
          if (act === 'cancel') return;
          if (act === 'del') { callback(''); App.showToast('已删除'); return; }
          if (act === 'album') {
            var input = document.createElement('input');
            input.type = 'file'; input.accept = 'image/*';
            document.body.appendChild(input);
            input.onchange = function(ev) {
              var file = ev.target.files[0]; document.body.removeChild(input); if (!file) return;
              var reader = new FileReader();
              reader.onload = function(r) {
                if (App.cropImage) App.cropImage(r.target.result, function(cropped) { callback(cropped); });
                else callback(r.target.result);
              };
              reader.readAsDataURL(file);
            };
            input.click();
            return;
          }
          if (act === 'url') {
            var urlPanel = document.createElement('div');
            urlPanel.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
            urlPanel.innerHTML =
              '<div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:12px;">' +
                '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;">输入图片URL</div>' +
                '<input id="ismUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">' +
                '<div id="ismUrlPreview" style="display:none;width:100%;height:120px;border-radius:8px;overflow:hidden;border:1px solid #eee;background:#f5f5f5;"><img style="width:100%;height:100%;object-fit:cover;display:block;"></div>' +
                '<div style="display:flex;gap:8px;">' +
                  '<button id="ismUrlOk" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">确定</button>' +
                  '<button id="ismUrlNo" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>' +
                '</div>' +
              '</div>';
            document.body.appendChild(urlPanel);
            urlPanel.addEventListener('click', function(e) { if (e.target === urlPanel) urlPanel.remove(); });
            urlPanel.querySelector('#ismUrlNo').addEventListener('click', function() { urlPanel.remove(); });
            var pBox = urlPanel.querySelector('#ismUrlPreview');
            var pImg = pBox.querySelector('img');
            urlPanel.querySelector('#ismUrlInput').addEventListener('input', function() {
              var v = this.value.trim();
              if (v && v.startsWith('http')) { pImg.src = v; pBox.style.display = 'block'; pImg.onerror = function() { pBox.style.display = 'none'; }; }
              else pBox.style.display = 'none';
            });
            urlPanel.querySelector('#ismUrlOk').addEventListener('click', function() {
              var url = urlPanel.querySelector('#ismUrlInput').value.trim();
              if (!url) { App.showToast('请输入URL'); return; }
              urlPanel.remove(); callback(url); App.showToast('已设置');
            });
          }
        });
      });
    },

    // ====== 档案编辑页 ======
    openProfile: function(editId) {
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

      var shortHtml = FIELDS_SHORT.map(function(f, idx) {
        var val = user[f.key] || '';
        var cls = (idx % 2 === 0) ? 'up-field-dark' : 'up-field-light';
        if (User.sealed) {
          return '<div class="up-field ' + cls + '"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div><span class="up-field-cn">' + f.cn + '</span></div><div class="up-field-line"><div class="up-text">' + App.esc(val || '—') + '</div></div><div class="up-field-underline"></div><div class="up-field-underline2"></div></div>';
        }
        return '<div class="up-field ' + cls + '"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div><span class="up-field-cn">' + f.cn + '</span></div><div class="up-field-line"><input type="text" data-key="' + f.key + '" placeholder="输入' + f.cn + '..." value="' + App.esc(val) + '"></div><div class="up-field-underline"></div><div class="up-field-underline2"></div></div>';
      }).join('');

      var longHtml = FIELDS_LONG.map(function(f) {
        var val = user[f.key] || '';
        if (User.sealed) {
          return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div><span class="up-field-cn">' + f.cn + '</span></div><div class="up-field-box"><div class="up-text">' + App.esc(val || '—') + '</div></div></div>';
        }
        return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div><span class="up-field-cn">' + f.cn + '</span></div><div class="up-field-box"><button class="up-expand-btn" data-field="' + f.key + '" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea data-key="' + f.key + '" placeholder="输入' + f.cn + '...">' + App.esc(val) + '</textarea></div></div>';
      }).join('');

      var page = User._makePage();
      page._editId = editId || null;

      page.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<div class="up-profile-back" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;">' +
            '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#999;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '<span style="font-size:12px;color:#999;">返回</span>' +
          '</div>' +
          '<div style="font-size:10px;color:#ccc;letter-spacing:3px;">PROFILE</div>' +
          '<div class="up-profile-rebuild" style="font-size:10px;color:#c9706b;letter-spacing:1.5px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;' + (User.sealed ? '' : 'visibility:hidden;') + '">重建</div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 60px;">' +
          '<div class="up-card" id="upCard">' +
            '<div class="up-seal' + (User.sealed ? ' show' : '') + '" id="upSeal">' +
              '<div class="up-seal-outer"><div class="up-seal-dashes"></div><div class="up-seal-inner">' +
                '<div class="up-seal-top">PERSONAL FILE</div><div class="up-seal-main">封存</div>' +
                '<div class="up-seal-line"></div><div class="up-seal-stars"><span class="up-seal-star">★</span><span class="up-seal-label">SEALED</span><span class="up-seal-star">★</span></div>' +
                '<div class="up-seal-date">' + dateStr + '</div>' +
              '</div></div><div class="up-seal-noise"></div>' +
            '</div>' +
            '<div class="up-bar-top"></div>' +
            '<div class="up-card-head"><div class="up-card-head-sub">PERSONAL FILE</div><div class="up-card-head-title">个 人 档 案</div></div>' +
            '<div class="up-avatar-area"><div class="up-avatar-box" id="upAvatarBox">' + avatarHtml + '</div></div>' +
            '<div class="up-sign-area">' +
              (User.sealed
                ? '<div style="font-size:11px;color:#666;">' + App.esc(user.sign1 || '—') + '</div><div class="up-sign-italic">' + App.esc(user.sign2 || '') + '</div>'
                : '<input type="text" data-key="sign1" placeholder="签名第一行..." value="' + App.esc(user.sign1 || '') + '"><input type="text" data-key="sign2" placeholder="签名第二行（斜体）..." value="' + App.esc(user.sign2 || '') + '" style="font-style:italic;margin-top:2px;">') +
            '</div>' +
            '<div class="up-name-area"><div class="up-name-label">NAME 姓名</div>' +
              (User.sealed
                ? '<div style="font-size:15px;font-weight:700;color:#1a1a1a;padding:3px 0 5px;">' + App.esc(user.realName || '—') + '</div>'
                : '<input type="text" class="up-name-input" data-key="realName" placeholder="输入姓名..." value="' + App.esc(user.realName || '') + '">') +
              '<div class="up-name-underline"></div><div class="up-name-underline2"></div>' +
            '</div>' +
            shortHtml +
            '<div class="up-divider"><div class="up-divider-line"></div><div class="up-divider-text">DETAIL 详情</div><div class="up-divider-line"></div></div>' +
            longHtml +
            '<div class="up-card-foot">CLASSIFIED</div><div class="up-bar-bot"></div>' +
            '<div class="up-quill" id="upQuill" style="' + (User.sealed ? 'display:none;' : '') + '"><img src="https://iili.io/BgIZWvI.md.png" draggable="false"></div>' +
          '</div>' +
        '</div>';

      User._pushPage(page);

      if (!User.sealed) {
        page.querySelector('#upAvatarBox').addEventListener('click', function() {
          var box = this;
          User.showImgMenu(editId || '__new__', 'avatar', function(src) {
            User.tempAvatar = src;
            if (src) box.innerHTML = '<img src="' + src + '">';
            else box.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
          });
        });
      }

      page.querySelector('.up-profile-back').addEventListener('click', function() {
        User._popPage();
      });

      page.querySelector('.up-profile-rebuild').addEventListener('click', function() {
        var eid = page._editId;
        if (eid) { var u = User.getById(eid); if (u) { u._sealed = false; User.save(); } }
        User._popPage();
        User.openProfile(eid);
        App.showToast('已解除封存');
      });

      page.querySelectorAll('.up-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var field = btn.dataset.field;
          var ta = page.querySelector('textarea[data-key="' + field + '"]');
          if (!ta) return;
          var f = FIELDS_LONG.filter(function(x) { return x.key === field; })[0];
          User.openExpandEditor(f ? f.cn : field, ta);
        });
      });

      var quill = page.querySelector('#upQuill');
      if (quill) quill.addEventListener('click', function() { User.saveProfile(page); });
    },

    // ====== 展开编辑器 ======
    openExpandEditor: function(title, textarea) {
      var old = App.$('#upExpandEditor');
      if (old) old.remove();
      var editor = document.createElement('div');
      editor.id = 'upExpandEditor';
      editor.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10004;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateY(100%);opacity:0;overflow:hidden;';
      editor.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<button id="upExpBack" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#999;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<div style="font-size:12px;font-weight:700;color:#2a4262;letter-spacing:1.5px;">' + App.esc(title) + '</div>' +
          '<button id="upExpDone" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#1e50a2;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>' +
        '</div>' +
        '<div style="flex:1;padding:0 16px 40px;overflow-y:auto;-webkit-overflow-scrolling:touch;">' +
          '<div style="border:1px solid #e0e0e0;min-height:calc(100vh - 160px);background:#fff;position:relative;">' +
            '<div style="border-top:3px solid #1a1a1a;"></div>' +
            '<div style="min-height:calc(100vh - 200px);border:1px dashed #e0e0e0;margin:12px;background:repeating-linear-gradient(0deg,transparent,transparent 22px,#f5f5f5 22px,#f5f5f5 23px);">' +
              '<textarea id="upExpTA" style="width:100%;min-height:calc(100vh - 220px);border:none;background:transparent;padding:12px 14px;font-size:14px;color:#333;outline:none;resize:vertical;font-family:inherit;line-height:22px;box-sizing:border-box;" placeholder="输入内容...">' + App.esc(textarea.value) + '</textarea>' +
            '</div>' +
            '<div style="border-bottom:3px solid #1a1a1a;"></div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(editor);
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        editor.style.transform = 'translateY(0)'; editor.style.opacity = '1';
      }); });
      var expTA = editor.querySelector('#upExpTA');
      if (expTA) expTA.focus();
      function closeEditor() {
        textarea.value = editor.querySelector('#upExpTA').value;
        editor.style.transform = 'translateY(100%)'; editor.style.opacity = '0';
        setTimeout(function() { if (editor.parentNode) editor.remove(); }, 350);
      }
      editor.querySelector('#upExpBack').addEventListener('click', closeEditor);
      editor.querySelector('#upExpDone').addEventListener('click', closeEditor);
    },

    // ====== 保存 ======
    saveProfile: function(page) {
      var card = page.querySelector('#upCard');
      if (!card) return;
      var data = {};
      data.avatar = User.tempAvatar;
      data._sealed = true;

      var nameInput = card.querySelector('[data-key="realName"]');
      if (nameInput) data.realName = (nameInput.value || '').trim();
      var sign1 = card.querySelector('[data-key="sign1"]');
      var sign2 = card.querySelector('[data-key="sign2"]');
      if (sign1) data.sign1 = (sign1.value || '').trim();
      if (sign2) data.sign2 = (sign2.value || '').trim();

      card.querySelectorAll('input[data-key]').forEach(function(el) {
        if (el.dataset.key !== 'realName' && el.dataset.key !== 'sign1' && el.dataset.key !== 'sign2') {
          data[el.dataset.key] = (el.value || '').trim();
        }
      });
      card.querySelectorAll('textarea[data-key]').forEach(function(el) {
        data[el.dataset.key] = (el.value || '').trim();
      });

      if (!data.phone) data.phone = '1' + Math.floor(100000000 + Math.random() * 900000000);
      if (!data.realName) { App.showToast('请输入姓名'); return; }

      var editId = page._editId;
      if (editId) {
        var existing = User.getById(editId);
        if (existing) { Object.keys(data).forEach(function(k) { existing[k] = data[k]; }); User.save(); }
      } else {
        data.id = 'user-' + Date.now();
        data.cardHue = 210; data.cardSat = 80; data.cardLit = 87;
        User.list.push(data);
        User.save();
        if (User.list.length === 1) User.setActive(data.id);
      }

      User.sealed = true;
      var seal = page.querySelector('#upSeal');
      if (seal) requestAnimationFrame(function() { seal.classList.add('show'); });
      var quill = page.querySelector('#upQuill');
      if (quill) quill.style.display = 'none';
      var rebuild = page.querySelector('.up-profile-rebuild');
      if (rebuild) rebuild.style.visibility = '';

      card.querySelectorAll('input[data-key]').forEach(function(el) {
        var div = document.createElement('div');
        div.className = 'up-text'; div.textContent = el.value.trim() || '—';
        if (el.dataset.key === 'sign2') div.style.fontStyle = 'italic';
        el.parentNode.replaceChild(div, el);
      });
      card.querySelectorAll('textarea[data-key]').forEach(function(el) {
        var div = document.createElement('div');
        div.className = 'up-text'; div.textContent = el.value.trim() || '—';
        div.style.whiteSpace = 'pre-wrap';
        el.parentNode.replaceChild(div, el);
      });
      var nameEl = card.querySelector('.up-name-input');
      if (nameEl) {
        var div = document.createElement('div');
        div.style.cssText = 'font-size:15px;font-weight:700;color:#1a1a1a;padding:3px 0 5px;';
        div.textContent = nameEl.value.trim() || '—';
        nameEl.parentNode.replaceChild(div, nameEl);
      }
      card.querySelectorAll('.up-expand-btn').forEach(function(btn) { btn.style.display = 'none'; });

      App.showToast('档案已封存');
      setTimeout(function() {
        User._popPage();
        User.load();
        if (User.list.length) User.openListPage();
      }, 800);
    },

    init: function() {
      User.load();
      App.user = User;
      App.safeOn('#dockMine', 'click', function() { User.open(); });
    }
  };

  App.register('user', User);
})();
