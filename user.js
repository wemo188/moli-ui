
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var DEFAULT_CARD = { hue: 215, sat: 35, lit: 90, radius: 60 };

  var FIELDS_SHORT = [
    { key: 'realName', en: 'NAME', cn: '姓名' },
    { key: 'nickname', en: 'NICKNAME', cn: '昵称' },
    { key: 'gender', en: 'GENDER', cn: '性别' },
    { key: 'age', en: 'AGE', cn: '年龄' },
    { key: 'birthday', en: 'BIRTHDAY', cn: '生日' },
    { key: 'phone', en: 'PHONE', cn: '手机号' },
    { key: 'wechatId', en: 'WECHAT ID', cn: '微信号' }
  ];
  var FIELDS_LONG = [
    { key: 'bio', en: 'DESCRIPTION', cn: '个人描述' }
  ];

  function pcVars(hue, sat, lit) {
    var bs = Math.max(0, Math.min(70, +sat));
    var bl = Math.max(30, Math.min(70, +lit));
    return '--pc5:hsla('+hue+','+bs+'%,'+bl+'%,0.5);--pc25:hsla('+hue+','+bs+'%,'+bl+'%,0.25);--pc45:hsla('+hue+','+bs+'%,'+bl+'%,0.45);--pc35:hsla('+hue+','+bs+'%,'+bl+'%,0.35);--pc18:hsla('+hue+','+bs+'%,'+bl+'%,0.18);--pc1:hsla('+hue+','+bs+'%,'+bl+'%,0.1);';
  }

  function setPcVars(card, h, s, l) {
    var bs = Math.max(0, Math.min(70, +s));
    var bl = Math.max(30, Math.min(70, +l));
    card.style.setProperty('--pc5', 'hsla('+h+','+bs+'%,'+bl+'%,0.5)');
    card.style.setProperty('--pc25', 'hsla('+h+','+bs+'%,'+bl+'%,0.25)');
    card.style.setProperty('--pc45', 'hsla('+h+','+bs+'%,'+bl+'%,0.45)');
    card.style.setProperty('--pc35', 'hsla('+h+','+bs+'%,'+bl+'%,0.35)');
    card.style.setProperty('--pc18', 'hsla('+h+','+bs+'%,'+bl+'%,0.18)');
    card.style.setProperty('--pc1', 'hsla('+h+','+bs+'%,'+bl+'%,0.1)');
  }

  function randomWxId() {
    var chars = 'abcdefghijklmnopqrstuvwxyz';
    var r = '';
    for (var i = 0; i < 4; i++) r += chars[Math.floor(Math.random() * 26)];
    return 'wx_' + r;
  }

  var User = {
    list: [],
    sealed: false,
    tempAvatar: '',

    load: function() { User.list = App.LS.get('userList') || []; },
    save: function() { App.LS.set('userList', User.list); },
    getById: function(id) { for (var i = 0; i < User.list.length; i++) { if (User.list[i].id === id) return User.list[i]; } return null; },
    getActiveUser: function() { User.load(); return User.list[0] || null; },

    open: function() {
      User.load();
      var panel = App.$('#userPanel');
      if (!panel) return;
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      
      if (!User.list.length) {
        User.renderProfile(null);
        return;
      }
      
      User.renderList();
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }); });
      App.bindSwipeBack(panel, function() { User.close(); });
    },

    close: function() {
      var panel = App.$('#userPanel');
      if (!panel) return;
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
      setTimeout(function() { panel.style.display = 'none'; }, 350);
    },

    renderList: function() {
      User.load();
      var panel = App.$('#userPanel');
      if (!panel) return;

      var cardsHtml = '';
      if (!User.list.length) {
        cardsHtml = '<div class="p14-empty">暂无用户,点击右上角创建</div>';
      } else {
        cardsHtml = User.list.map(function(u) {
          var avatarHtml = u.avatar ? '<img src="' + App.esc(u.avatar) + '">' : '';
          var hue = u.cardHue != null ? u.cardHue : DEFAULT_CARD.hue,
              sat = u.cardSat != null ? u.cardSat : DEFAULT_CARD.sat,
              lit = u.cardLit != null ? u.cardLit : DEFAULT_CARD.lit,
              radius = u.cardRadius != null ? u.cardRadius : DEFAULT_CARD.radius;
          var cardBg = 'linear-gradient(155deg,hsla(' + hue + ',' + sat + '%,' + lit + '%,0.94),hsla(' + hue + ',' + sat + '%,' + (+lit+4) + '%,0.84) 30%,rgba(255,255,255,0.98) 52%,hsla(' + hue + ',' + sat + '%,' + (+lit+2) + '%,0.88) 74%,hsla(' + hue + ',' + sat + '%,' + lit + '%,0.92))';
          var borderC = 'hsla(' + hue + ',' + sat + '%,' + lit + '%,0.5)';
          var bgImgHtml = u.cardBg ? '<div class="p14-bg"><img src="' + App.esc(u.cardBg) + '"></div>' : '<div class="p14-bg"></div>';
          var vars = pcVars(hue, sat, lit);

          return '<div class="p14-card" data-uid="' + u.id + '" style="' + vars + 'background:' + cardBg + ';border-color:' + borderC + ';border-radius:' + radius + 'px;">' +
            bgImgHtml +
            '<div class="p14-top">' +
              '<div class="p14-led p14-led-on"></div><div class="p14-led"></div><div class="p14-led"></div>' +
            '</div>' +
            '<div class="p14-body">' +
              '<div class="p14-left">' +
                '<div class="p14-side-btn p14-side-reset" data-uid="' + u.id + '">重置</div>' +
                '<div class="p14-paw-btn" data-uid="' + u.id + '"><div class="p14-paw-inner"><div class="p14-pp p14-pp-t1"></div><div class="p14-pp p14-pp-t2"></div><div class="p14-pp p14-pp-t3"></div><div class="p14-pp p14-pp-t4"></div><div class="p14-pp p14-pp-main"></div></div></div>' +
                '<div class="p14-side-btn p14-side-del"><span class="p14-del-text" data-uid="' + u.id + '">删除</span></div>' +
              '</div>' +
              '<div class="p14-screen-wrap"><div class="p14-screen">' +
                '<div class="p14-screen-badge"><div class="p14-badge-dot"></div><div class="p14-badge-text">ACTIVE</div></div>' +
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
                '<div class="p14-side-btn p14-side-save" data-uid="' + u.id + '">保存</div>' +
              '</div>' +
            '</div>' +
            '<div class="p14-panel" data-panel-uid="' + u.id + '">' +
              '<div class="p14-panel-title">✦ CUSTOMIZE ✦</div>' +
              '<div class="p14-panel-row"><div class="p14-panel-label">机身背景</div><div class="p14-panel-upload p14-bg-upload-btn" data-uid="' + u.id + '"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>上传图片</div></div>' +
              '<div class="p14-panel-row p14-panel-row-top"><div class="p14-panel-label p14-panel-label-mt">机身颜色</div>' +
                '<div class="p14-slider-wrap">' +
                  '<div class="p14-slider-item"><span class="p14-slider-name">H</span><input type="range" class="p14-slider p14-hue" data-uid="' + u.id + '" min="0" max="360" value="' + hue + '"><span class="p14-slider-val p14-hue-val">' + hue + '</span></div>' +
                  '<div class="p14-slider-item"><span class="p14-slider-name">S</span><input type="range" class="p14-slider p14-sat" data-uid="' + u.id + '" min="0" max="100" value="' + sat + '"><span class="p14-slider-val p14-sat-val">' + sat + '</span></div>' +
                  '<div class="p14-slider-item"><span class="p14-slider-name">L</span><input type="range" class="p14-slider p14-lit" data-uid="' + u.id + '" min="0" max="100" value="' + lit + '"><span class="p14-slider-val p14-lit-val">' + lit + '</span></div>' +
                '</div>' +
                '<div class="p14-color-preview" data-uid="' + u.id + '" style="background:hsl(' + hue + ',' + sat + '%,' + lit + '%);"></div>' +
              '</div>' +
              '<div class="p14-panel-row p14-panel-row-center"><div class="p14-panel-label">圆角</div>' +
                '<div class="p14-slider-wrap p14-slider-wrap-flex">' +
                  '<div class="p14-slider-item"><input type="range" class="p14-slider p14-radius" data-uid="' + u.id + '" min="20" max="70" value="' + radius + '"><span class="p14-slider-val p14-radius-val">' + radius + 'px</span></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

                  // 🌟 获取背景
      var savedBg = App.LS.get('userPageBg') || '';
      var bgHtml = savedBg ? '<div class="up-custom-bg" style="background-image: url(\'' + App.escAttr(savedBg) + '\');"></div>' : '';

      // 🌟 动态控制底层面板的颜色，有背景图时变透明
           panel.style.background = '#fff';

      // ★ 这里保留了你的 5 个圆圈均匀分布的设计！
      panel.innerHTML =
        bgHtml + // 🌟 注入背景层
        '<div class="up-list-header">' +
          '<div class="up-header-circle up-list-back" id="upListBack"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></div>' +
          '<div class="up-header-circle up-list-char">此</div>' +
          '<div class="up-header-circle up-list-char">间</div>' +
          '<div class="up-header-circle up-list-char">相</div>' +
          '<div class="up-header-circle up-list-add" id="upListAdd"><svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg></div>' +
        '</div>' +
        '<div class="up-list-divider"></div>' +
        '<div class="p14-list-wrap">' + cardsHtml + '</div>';
  
      panel.querySelector('#upListBack').addEventListener('click', function() { User.close(); });
            // 🌟 右上角加号的弹出菜单逻辑
      panel.querySelector('#upListAdd').addEventListener('click', function(e) { 
        e.stopPropagation();
        var old = document.querySelector('.up-mgr-menu');
        if (old) { old.remove(); return; }

        var menu = document.createElement('div');
        menu.className = 'up-mgr-menu';
        menu.innerHTML =
          '<div class="up-mgr-item" data-act="adduser">添加用户</div>' +
          '<div class="up-mgr-item" data-act="bg">页面背景</div>';

        document.body.appendChild(menu);

        // 🌟 让菜单完美定位在加号下方偏左
        var rect = this.getBoundingClientRect();
        menu.style.top = (rect.bottom + 12) + 'px';
        menu.style.right = '16px'; 

        function closeMenu() { if (menu.parentNode) menu.remove(); document.removeEventListener('click', closeMenu); }
        setTimeout(function() { document.addEventListener('click', closeMenu); }, 10);

        menu.querySelectorAll('.up-mgr-item').forEach(function(item) {
          item.addEventListener('click', function(ev) {
            ev.stopPropagation();
            menu.remove();
            document.removeEventListener('click', closeMenu);
            var act = item.dataset.act;
            
            if (act === 'adduser') {
              User.renderProfile(null);
            } else if (act === 'bg') {
              // 🌟 完美复用我们刚才写好的全局图片选择器！
              App.showImagePicker({
                title: '设置页面背景',
                deleteText: '清除背景',
                callback: function(src) {
                  if (src) {
                    App.LS.set('userPageBg', src);
                    App.showToast('背景已设置');
                  } else {
                    App.LS.remove('userPageBg');
                    App.showToast('背景已清除');
                  }
                  User.renderList(); // 重新渲染页面
                }
              });
            }
          });
        });
      });
      User._bindListEvents(panel);
    },

    _bindListEvents: function(panel) {
      // ★ 独立的猫爪切换，互不干扰
      panel.querySelectorAll('.p14-paw-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var uid = btn.dataset.uid;
          var p = panel.querySelector('[data-panel-uid="' + uid + '"]');
          if (!p) return;
          p.classList.toggle('p14-open');
          btn.classList.toggle('p14-active');
        });
      });

      panel.querySelectorAll('.p14-avatar-wrap').forEach(function(wrap) {
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

      panel.querySelectorAll('.p14-bg-upload-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          User.showImgMenu(btn.dataset.uid, 'cardBg', function(src) {
            var u = User.getById(btn.dataset.uid);
            if (u) { u.cardBg = src; User.save(); }
            var card = panel.querySelector('[data-uid="' + btn.dataset.uid + '"]');
            if (card) { var bg = card.querySelector('.p14-bg'); if (bg) bg.innerHTML = src ? '<img src="' + src + '">' : ''; }
          });
        });
      });

      panel.querySelectorAll('.p14-hue,.p14-sat,.p14-lit').forEach(function(slider) {
        slider.addEventListener('input', function() {
          var uid = slider.dataset.uid;
          var card = panel.querySelector('[data-uid="' + uid + '"]');
          if (!card) return;
          var h = card.querySelector('.p14-hue').value;
          var s = card.querySelector('.p14-sat').value;
          var l = card.querySelector('.p14-lit').value;
          card.querySelector('.p14-hue-val').textContent = h;
          card.querySelector('.p14-sat-val').textContent = s;
          card.querySelector('.p14-lit-val').textContent = l;
          var preview = card.querySelector('.p14-color-preview');
          if (preview) preview.style.background = 'hsl(' + h + ',' + s + '%,' + l + '%)';
          card.style.background = 'linear-gradient(155deg,hsla(' + h + ',' + s + '%,' + l + '%,0.94),hsla(' + h + ',' + s + '%,' + (+l+4) + '%,0.84) 30%,rgba(255,255,255,0.98) 52%,hsla(' + h + ',' + s + '%,' + (+l+2) + '%,0.88) 74%,hsla(' + h + ',' + s + '%,' + l + '%,0.92))';
          card.style.borderColor = 'hsla(' + h + ',' + s + '%,' + l + '%,0.5)';
          setPcVars(card, h, s, l);
        });
      });

      panel.querySelectorAll('.p14-radius').forEach(function(slider) {
        slider.addEventListener('input', function() {
          var uid = slider.dataset.uid;
          var card = panel.querySelector('[data-uid="' + uid + '"]');
          if (!card) return;
          var val = slider.value;
          card.querySelector('.p14-radius-val').textContent = val + 'px';
          card.style.borderRadius = val + 'px';
        });
      });

      panel.querySelectorAll('.p14-side-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) { e.stopPropagation(); User.renderProfile(btn.dataset.uid); });
      });

      panel.querySelectorAll('.p14-side-save').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var uid = btn.dataset.uid;
          var card = panel.querySelector('[data-uid="' + uid + '"]');
          if (!card) return;
          var u = User.getById(uid);
          if (!u) return;
          var hueEl = card.querySelector('.p14-hue');
          var satEl = card.querySelector('.p14-sat');
          var litEl = card.querySelector('.p14-lit');
          var radiusEl = card.querySelector('.p14-radius');
          if (hueEl) u.cardHue = +hueEl.value;
          if (satEl) u.cardSat = +satEl.value;
          if (litEl) u.cardLit = +litEl.value;
          if (radiusEl) u.cardRadius = +radiusEl.value;
          User.save();
          App.showToast('已保存配色');
        });
      });

      panel.querySelectorAll('.p14-side-reset').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定重置？将清除配色和背景图。')) return;
          var u = User.getById(btn.dataset.uid);
          if (!u) return;
          u.cardHue = DEFAULT_CARD.hue; u.cardSat = DEFAULT_CARD.sat; u.cardLit = DEFAULT_CARD.lit; u.cardRadius = DEFAULT_CARD.radius;
          u.cardBg = '';
          var card = panel.querySelector('[data-uid="' + btn.dataset.uid + '"]');
          if (card) {
            var bg = card.querySelector('.p14-bg');
            if (bg) bg.innerHTML = '';
          }
          User.save();
          User.renderList();
          App.showToast('已重置');
        });
      });

      panel.querySelectorAll('.p14-del-text').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除？')) return;
          User.list = User.list.filter(function(u) { return u.id !== btn.dataset.uid; });
          User.save();
          User.renderList();
          App.showToast('已删除');
        });
      });
    },

    renderProfile: function(editId) {
      User.load();
      var existing = editId ? User.getById(editId) : null;
      var user = existing || {};
      User.sealed = !!(user._sealed);
      User.tempAvatar = user.avatar || '';

      var today = new Date();
      var dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');

      var sealedClass = User.sealed ? ' up-sealed' : '';

      var shortHtml = FIELDS_SHORT.map(function(f) {
        var val = user[f.key] || '';
        var ph = '';
        if (f.key === 'phone') ph = '输入十位虚拟数字,或者留空随机生成';
        else if (f.key === 'wechatId') ph = '留空随机生成 wx_xxxx';
        var displayVal = val || '—';
        return '<div class="up-field">' +
          '<div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.cn + ' ' + f.en + '</div></div>' +
          '<div class="up-field-line">' +
            '<input type="text" class="up-field-input" data-key="' + f.key + '" placeholder="' + ph + '" value="' + App.esc(val) + '">' +
            '<div class="up-field-display up-text">' + App.esc(displayVal) + '</div>' +
          '</div>' +
          '<div class="up-field-underline"></div><div class="up-field-underline2"></div>' +
        '</div>';
      }).join('');

      var longHtml = FIELDS_LONG.map(function(f) {
        var val = user[f.key] || '';
        return '<div class="up-field">' +
          '<div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.cn + ' ' + f.en + '</div></div>' +
          '<div class="up-field-box">' +
            '<button class="up-expand-btn" data-field="' + f.key + '" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>' +
            '<textarea class="up-field-textarea" data-key="' + f.key + '" placeholder="输入内容...">' + App.esc(val) + '</textarea>' +
            '<div class="up-field-display up-text up-text-pre">' + App.esc(val || '—') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      var old = App.$('#userProfilePanel');
      if (old) old.remove();

      var pp = document.createElement('div');
      pp.id = 'userProfilePanel';
      pp.className = 'up-panel' + sealedClass;

      pp.innerHTML =
        '<div class="profile-header app-header-safe">' +
         '<div id="upProfileBack" class="up-header-btn"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="#999" stroke-width="3.5" fill="none"/><path d="M36 20L24 32L36 44" stroke="#999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
          '<div class="up-header-title">PROFILE</div>' +
          '<div id="upRebuild" class="up-header-rebuild' + (User.sealed ? '' : ' up-hidden') + '" data-edit-id="' + (editId || '') + '">重建</div>' +
        '</div>' +
        '<div class="up-scroll">' +
          '<div class="up-card" id="upCard" data-edit-id="' + (editId || '') + '">' +
            '<div class="up-bar-top"></div>' +
            '<div class="up-card-head"><div class="up-card-head-sub">PERSONAL FILE</div><div class="up-card-head-title">个 人 档 案</div></div>' +
            '<div class="up-sign-area">' +
              '<div class="up-avatar-box" id="upAvatarBox">' +
                (User.tempAvatar ? '<img src="' + App.esc(User.tempAvatar) + '">' : '<svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zM3 20.4c0-2.4 6-3.6 9-3.6s9 1.2 9 3.6" stroke-width="1.5" fill="none"/></svg>') +
              '</div>' +
              '<div class="up-sign-text-wrap">' +
                '<input type="text" class="up-sign-input" data-key="sign1" placeholder="签名第一行..." value="' + App.esc(user.sign1 || '') + '">' +
                '<div class="up-field-display up-sign-display">' + App.esc(user.sign1 || '—') + '</div>' +
                '<input type="text" class="up-sign-input up-sign-input2" data-key="sign2" placeholder="签名第二行（斜体）..." value="' + App.esc(user.sign2 || '') + '">' +
                '<div class="up-field-display up-sign-display up-sign-display-italic">' + App.esc(user.sign2 || '') + '</div>' +
              '</div>' +
            '</div>' +
            shortHtml +
            longHtml +
            '<div class="up-card-foot">CLASSIFIED</div>' +
            '<div class="up-bar-bot"></div>' +
            '<div class="up-quill" id="upQuill"><img src="https://iili.io/BgIZWvI.md.png" draggable="false"></div>' +
          '</div>' +
          '<div class="up-seal" id="upSeal">' +
            '<div class="up-seal-outer"><div class="up-seal-dashes"></div><div class="up-seal-inner">' +
              '<div class="up-seal-top">PERSONAL FILE</div><div class="up-seal-main">封存</div>' +
              '<div class="up-seal-line"></div><div class="up-seal-stars"><span class="up-seal-star">★</span><span class="up-seal-label">SEALED</span><span class="up-seal-star">★</span></div>' +
              '<div class="up-seal-date">' + dateStr + '</div>' +
            '</div></div><div class="up-seal-noise"></div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(pp);

      App.bindSwipeBack(pp, function() {
        pp.classList.add('up-panel-out');
        setTimeout(function() { if (pp.parentNode) pp.remove(); }, 350);
      });

      if (User._skipAnimation) {
        pp.classList.add('up-panel-no-anim');
        pp.classList.add('up-panel-in');
        User._skipAnimation = false;
      } else {
        requestAnimationFrame(function() { requestAnimationFrame(function() {
          pp.classList.add('up-panel-in');
        }); });
      }

      pp.querySelector('#upProfileBack').addEventListener('click', function() {
        pp.classList.remove('up-panel-in');
        pp.classList.add('up-panel-out');
        setTimeout(function() { if (pp.parentNode) pp.remove(); }, 350);
        if (!User.list.length) {
          setTimeout(function() { User.close(); }, 100);
        } else {
          User.renderList();
        }
      });

      pp.querySelector('#upRebuild').addEventListener('click', function() {
        var eid = this.dataset.editId;
        if (eid) { var u = User.getById(eid); if (u) { u._sealed = false; User.save(); } }
        if (pp.parentNode) pp.remove();
        User._skipAnimation = true;
        User.renderProfile(eid);
        App.showToast('已解除封存');
      });

      pp.querySelectorAll('.up-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var field = btn.dataset.field;
          var ta = pp.querySelector('textarea[data-key="' + field + '"]');
          if (!ta) return;
          var f = FIELDS_LONG.filter(function(x) { return x.key === field; })[0];
          User.openExpandEditor(f ? f.cn : field, ta);
        });
      });

      var quill = pp.querySelector('#upQuill');
      if (quill) quill.addEventListener('click', function() { User.saveProfile(pp); });

      var avatarBox = pp.querySelector('#upAvatarBox');
      if (avatarBox) {
        avatarBox.addEventListener('click', function() {
          User.showImgMenu(editId || 'temp', 'avatar', function(src) {
            User.tempAvatar = src;
            avatarBox.innerHTML = src ? '<img src="' + App.esc(src) + '">' : '<svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zM3 20.4c0-2.4 6-3.6 9-3.6s9 1.2 9 3.6" stroke-width="1.5" fill="none"/></svg>';
          });
        });
      }
    },

    openExpandEditor: function(title, textarea) {
      var old = App.$('#upExpandEditor');
      if (old) old.remove();
      var editor = document.createElement('div');
      editor.id = 'upExpandEditor';
      editor.className = 'up-expand-panel';
      editor.innerHTML =
        '<div class="expand-header app-header-safe">' +
          '<button id="upExpBack" class="up-expand-header-btn" type="button">' +
            '<svg viewBox="0 0 24 24" class="up-expand-header-svg"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</button>' +
          '<div class="up-expand-header-title">' + App.esc(title) + '</div>' +
          '<button id="upExpDone" class="up-expand-header-btn" type="button">' +
            '<svg viewBox="0 0 24 24" class="up-expand-header-svg up-expand-header-svg-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="up-expand-body">' +
          '<div class="up-expand-paper">' +
            '<div class="up-expand-paper-top"></div>' +
            '<div class="up-expand-paper-inner">' +
              '<textarea id="upExpTA" class="up-expand-ta" placeholder="输入内容...">' + App.esc(textarea.value) + '</textarea>' +
            '</div>' +
            '<div class="up-expand-paper-bot"></div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(editor);
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        editor.classList.add('up-expand-in');
      }); });
      var expTA = editor.querySelector('#upExpTA');
      if (expTA) expTA.focus();
      function closeEditor() {
        textarea.value = editor.querySelector('#upExpTA').value;
        editor.classList.remove('up-expand-in');
        editor.classList.add('up-expand-out');
        setTimeout(function() { if (editor.parentNode) editor.remove(); }, 350);
      }
      editor.querySelector('#upExpBack').addEventListener('click', closeEditor);
      editor.querySelector('#upExpDone').addEventListener('click', closeEditor);
    },

    saveProfile: function(pp) {
      var card = pp.querySelector('#upCard');
      if (!card) return;
      var editId = card.dataset.editId || '';
      var data = {};
      data.avatar = User.tempAvatar;
      data._sealed = true;

      var sign1 = card.querySelector('[data-key="sign1"]');
      var sign2 = card.querySelector('[data-key="sign2"]');
      if (sign1) data.sign1 = (sign1.value || '').trim();
      if (sign2) data.sign2 = (sign2.value || '').trim();

      card.querySelectorAll('input.up-field-input[data-key]').forEach(function(el) {
        data[el.dataset.key] = (el.value || '').trim();
      });
      card.querySelectorAll('textarea.up-field-textarea[data-key]').forEach(function(el) {
        data[el.dataset.key] = (el.value || '').trim();
      });

      if (!data.phone) data.phone = '1' + Math.floor(100000000 + Math.random() * 900000000);
      if (!data.wechatId) data.wechatId = randomWxId();
      if (!data.realName) { App.showToast('请输入姓名'); return; }

      if (editId) {
        var existing = User.getById(editId);
        if (existing) { Object.keys(data).forEach(function(k) { existing[k] = data[k]; }); User.save(); }
      } else {
        data.id = 'user-' + Date.now();
        data.cardHue = DEFAULT_CARD.hue; data.cardSat = DEFAULT_CARD.sat; data.cardLit = DEFAULT_CARD.lit; data.cardRadius = DEFAULT_CARD.radius;
        User.list.push(data);
        User.save();
      }

      pp.classList.add('up-sealed');

      card.querySelectorAll('.up-field-input[data-key]').forEach(function(el) {
        var display = el.parentNode.querySelector('.up-field-display');
        if (display) {
          var val = el.value.trim();
          display.textContent = val || '—';
        }
      });
      card.querySelectorAll('.up-field-textarea[data-key]').forEach(function(el) {
        var display = el.parentNode.querySelector('.up-field-display');
        if (display) display.textContent = el.value.trim() || '—';
      });
      var sign1El = card.querySelector('.up-sign-input[data-key="sign1"]');
      var sign1Display = card.querySelector('.up-sign-display');
      if (sign1El && sign1Display) sign1Display.textContent = sign1El.value.trim() || '—';
      var sign2El = card.querySelector('.up-sign-input[data-key="sign2"]');
      var sign2Display = card.querySelectorAll('.up-sign-display')[1];
      if (sign2El && sign2Display) sign2Display.textContent = sign2El.value.trim() || '';

      var rebuild = pp.querySelector('#upRebuild');
      if (rebuild) rebuild.classList.remove('up-hidden');

      App.showToast('档案已封存');
    },

    showImgMenu: function(uid, field, callback) {
      var old = App.$('#imgSourceMenu');
      if (old) old.remove();
      var menu = document.createElement('div');
      menu.id = 'imgSourceMenu';
      menu.className = 'ism-overlay';
      menu.innerHTML =
        '<div class="ism-box">' +
          '<div class="ism-title">选择图片来源</div>' +
          '<button class="ism-btn" data-act="album" type="button">从相册选择</button>' +
          '<button class="ism-btn" data-act="url" type="button">输入图片URL</button>' +
          '<button class="ism-btn ism-btn-del" data-act="del" type="button">删除图片</button>' +
          '<button class="ism-btn ism-btn-cancel" data-act="cancel" type="button">取消</button>' +
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
            var oldUser = User.getById(uid);
            var oldImg = oldUser ? oldUser[field] : '';
            var input = document.createElement('input');
            input.type = 'file'; input.accept = 'image/*';
            input.className = 'up-file-input';
            document.body.appendChild(input);
            input.onchange = function(ev) {
              var file = ev.target.files[0]; document.body.removeChild(input); if (!file) return;
              var reader = new FileReader();
              reader.onload = function(r) {
                if (App.cropImage) App.cropImage(r.target.result, function(cropped) {
                  if (oldImg && oldImg.startsWith('data:') && oldUser) { oldUser[field] = ''; }
                  callback(cropped);
                });
                else {
                  if (oldImg && oldImg.startsWith('data:') && oldUser) { oldUser[field] = ''; }
                  callback(r.target.result);
                }
              };
              reader.readAsDataURL(file);
            };
            input.click();
            return;
          }
          if (act === 'url') {
            var urlPanel = document.createElement('div');
            urlPanel.className = 'ism-overlay';
            urlPanel.innerHTML =
              '<div class="ism-box">' +
                '<div class="ism-title">输入图片URL</div>' +
                '<input id="ismUrlInput" class="ism-url-input" type="text" placeholder="https://...">' +
                '<div id="ismUrlPreview" class="ism-preview"><img class="ism-preview-img"></div>' +
                '<div class="ism-url-btns">' +
                  '<button id="ismUrlOk" class="ism-url-ok" type="button">确定</button>' +
                  '<button id="ismUrlNo" class="ism-url-no" type="button">取消</button>' +
                '</div>' +
              '</div>';
            document.body.appendChild(urlPanel);
            urlPanel.addEventListener('click', function(e) { if (e.target === urlPanel) urlPanel.remove(); });
            urlPanel.querySelector('#ismUrlNo').addEventListener('click', function() { urlPanel.remove(); });
            var pBox = urlPanel.querySelector('#ismUrlPreview');
            var pImg = pBox.querySelector('img');
            urlPanel.querySelector('#ismUrlInput').addEventListener('input', function() {
              var v = this.value.trim();
              if (v && v.startsWith('http')) { pImg.src = v; pBox.classList.add('ism-preview-show'); pImg.onerror = function() { pBox.classList.remove('ism-preview-show'); }; }
              else pBox.classList.remove('ism-preview-show');
            });
            urlPanel.querySelector('#ismUrlOk').addEventListener('click', function() {
              var url = urlPanel.querySelector('#ismUrlInput').value.trim();
              if (!url) { App.showToast('请输入URL'); return; }
              var oldUser2 = User.getById(uid);
              if (oldUser2 && oldUser2[field] && oldUser2[field].startsWith('data:')) { oldUser2[field] = ''; }
              urlPanel.remove(); callback(url); App.showToast('已设置');
            });
          }
        });
      });
    },

    renderListInto: function(container) {
      if (!container) return;
      User.load();
      var panel = App.$('#userPanel');
      if (panel) {
        User.renderList();
      }
    },

    init: function() {
      User.load();
      if (!App.$('#userPanel')) {
        var panel = document.createElement('div');
        panel.id = 'userPanel';
        panel.style.display = 'none';
        document.body.appendChild(panel);
      }
      App.user = User;
      App.safeOn('#iconUser', 'click', function() { User.open(); });
    }
  };

  App.register('user', User);
})();

