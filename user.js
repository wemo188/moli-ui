
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

var DEFAULT_CARD = { hue: 210, sat: 72, lit: 90, radius: 60 };

  var FIELDS_SHORT = [
    { key: 'nickname', en: 'NICKNAME', cn: '昵称' },
    { key: 'gender', en: 'GENDER', cn: '性别' },
    { key: 'age', en: 'AGE', cn: '年龄' },
    { key: 'birthday', en: 'BIRTHDAY', cn: '生日' },
    { key: 'phone', en: 'PHONE', cn: '手机号' },
    { key: 'wechatId', en: 'WECHAT ID', cn: '微信号' },
    { key: 'wechatPwd', en: 'WECHAT PWD', cn: '微信密码' }
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

  var BACK_ICON = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#999;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>';

  var User = {
    list: [],
    sealed: false,
    tempAvatar: '',

    load: function() { User.list = App.LS.get('userList') || []; },
    save: function() { App.LS.set('userList', User.list); },
    getById: function(id) { for (var i = 0; i < User.list.length; i++) { if (User.list[i].id === id) return User.list[i]; } return null; },

    open: function() {
      if (App.archive) App.archive.open('user');
    },

    close: function() {
      if (App.archive) App.archive.close();
    },

    renderList: function() {
      var container = App.$('#archivePanelUser');
      if (container) User.renderListInto(container);
    },

    renderListInto: function(container) {
      if (!container) return;
      User.load();

      var cardsHtml = '';
      if (!User.list.length) {
        cardsHtml = '<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:14px;">暂无用户，点击右上角创建</div>';
      } else {
        cardsHtml = User.list.map(function(u) {
          var avatarHtml = u.avatar ? '<img src="' + App.esc(u.avatar) + '">' : '';
          var hue = u.cardHue != null ? u.cardHue : DEFAULT_CARD.hue,
    sat = u.cardSat != null ? u.cardSat : DEFAULT_CARD.sat,
    lit = u.cardLit != null ? u.cardLit : DEFAULT_CARD.lit,
    radius = u.cardRadius != null ? u.cardRadius : DEFAULT_CARD.radius;
          var cardBg = 'linear-gradient(155deg,hsla(' + hue + ',' + sat + '%,' + lit + '%,0.6),hsla(' + hue + ',' + sat + '%,' + (+lit+5) + '%,0.45) 25%,hsla(' + hue + ',' + sat + '%,' + (+lit+10) + '%,0.7) 45%,hsla(' + hue + ',' + sat + '%,' + (+lit+3) + '%,0.5) 65%,hsla(' + hue + ',' + sat + '%,' + lit + '%,0.55))';
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
              '<div class="p14-panel-row" style="align-items:flex-start;"><div class="p14-panel-label" style="margin-top:2px;">机身颜色</div>' +
                '<div class="p14-slider-wrap">' +
                  '<div class="p14-slider-item"><span class="p14-slider-name">H</span><input type="range" class="p14-slider p14-hue" data-uid="' + u.id + '" min="0" max="360" value="' + hue + '"><span class="p14-slider-val p14-hue-val">' + hue + '</span></div>' +
                  '<div class="p14-slider-item"><span class="p14-slider-name">S</span><input type="range" class="p14-slider p14-sat" data-uid="' + u.id + '" min="0" max="100" value="' + sat + '"><span class="p14-slider-val p14-sat-val">' + sat + '</span></div>' +
                  '<div class="p14-slider-item"><span class="p14-slider-name">L</span><input type="range" class="p14-slider p14-lit" data-uid="' + u.id + '" min="0" max="100" value="' + lit + '"><span class="p14-slider-val p14-lit-val">' + lit + '</span></div>' +
                '</div>' +
                '<div class="p14-color-preview" data-uid="' + u.id + '" style="background:hsl(' + hue + ',' + sat + '%,' + lit + '%);"></div>' +
              '</div>' +
              '<div class="p14-panel-row" style="align-items:center;"><div class="p14-panel-label">圆角</div>' +
                '<div class="p14-slider-wrap" style="flex:1;">' +
                  '<div class="p14-slider-item"><input type="range" class="p14-slider p14-radius" data-uid="' + u.id + '" min="50" max="70" value="' + radius + '"><span class="p14-slider-val p14-radius-val">' + radius + 'px</span></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      container.innerHTML = '<div style="padding:0 14px 40px;">' + cardsHtml + '</div>';
      User._bindListEvents(container);
    },

    _bindListEvents: function(panel) {
      panel.querySelectorAll('.p14-paw-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var uid = btn.dataset.uid;
          var p = panel.querySelector('[data-panel-uid="' + uid + '"]');
          if (!p) return;
          var isOpen = p.classList.contains('p14-open');
          panel.querySelectorAll('.p14-panel.p14-open').forEach(function(x) { x.classList.remove('p14-open'); });
          panel.querySelectorAll('.p14-paw-btn.p14-active').forEach(function(x) { x.classList.remove('p14-active'); });
          if (!isOpen) { p.classList.add('p14-open'); btn.classList.add('p14-active'); }
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
          card.style.background = 'linear-gradient(155deg,hsla(' + h + ',' + s + '%,' + l + '%,0.6),hsla(' + h + ',' + s + '%,' + (+l+5) + '%,0.45) 25%,hsla(' + h + ',' + s + '%,' + (+l+10) + '%,0.7) 45%,hsla(' + h + ',' + s + '%,' + (+l+3) + '%,0.5) 65%,hsla(' + h + ',' + s + '%,' + l + '%,0.55))';
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
          if (!User.list.length) User.renderList();
          else User.renderList();
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

      var shortHtml = FIELDS_SHORT.map(function(f) {
        var val = user[f.key] || '';
        var ph = '';
        if (f.key === 'phone') ph = '输入十位虚拟数字，或者留空随机生成';
        else if (f.key === 'wechatId') ph = '留空随机生成 wx_xxxx';
        else if (f.key === 'wechatPwd') ph = '留空则默认无微信密码';
        if (User.sealed) {
          var displayVal = val || '—';
          if (f.key === 'wechatPwd' && !val) displayVal = '无密码';
          return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.cn + ' ' + f.en + '</div></div><div class="up-field-line"><div class="up-text">' + App.esc(displayVal) + '</div></div><div class="up-field-underline"></div><div class="up-field-underline2"></div></div>';
        }
        return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.cn + ' ' + f.en + '</div></div><div class="up-field-line"><input type="text" data-key="' + f.key + '" placeholder="' + ph + '" value="' + App.esc(val) + '"></div><div class="up-field-underline"></div><div class="up-field-underline2"></div></div>';
      }).join('');

      var longHtml = FIELDS_LONG.map(function(f) {
        var val = user[f.key] || '';
        if (User.sealed) {
          return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.cn + ' ' + f.en + '</div></div><div class="up-field-box"><div class="up-text">' + App.esc(val || '—') + '</div></div></div>';
        }
        return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.cn + ' ' + f.en + '</div></div><div class="up-field-box"><button class="up-expand-btn" data-field="' + f.key + '" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea data-key="' + f.key + '" placeholder="输入内容...">' + App.esc(val) + '</textarea></div></div>';
      }).join('');

      var old = App.$('#userProfilePanel');
      if (old) old.remove();

      var pp = document.createElement('div');
      pp.id = 'userProfilePanel';
      pp.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10001;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';

      pp.innerHTML =
  '<div class="profile-header">' +
    '<div id="upProfileBack" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;">' +
      BACK_ICON +
    '</div>' +
    '<div style="font-size:13px;color:#ccc;letter-spacing:3px;">PROFILE</div>' +
    '<div id="upRebuild" data-edit-id="' + (editId || '') + '" style="font-size:13px;color:#c9706b;letter-spacing:1.5px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;' + (User.sealed ? '' : 'visibility:hidden;') + '">重建</div>' +
  '</div>' +
  '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 60px;">' +
    '<div class="up-card" id="upCard" data-edit-id="' + (editId || '') + '">' +
      '<div class="up-bar-top"></div>' +
      '<div class="up-card-head"><div class="up-card-head-sub">PERSONAL FILE</div><div class="up-card-head-title">个 人 档 案</div></div>' +
      '<div class="up-sign-area">' +
        '<div class="up-avatar-box" id="upAvatarBox">' +
          (User.tempAvatar ? '<img src="' + App.esc(User.tempAvatar) + '">' : '<svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zM3 20.4c0-2.4 6-3.6 9-3.6s9 1.2 9 3.6" stroke-width="1.5" fill="none"/></svg>') +
        '</div>' +
        '<div class="up-sign-text-wrap">' +
          (User.sealed
            ? '<div class="up-sign-text">' + App.esc(user.sign1 || '—') + '</div><div class="up-sign-italic">' + App.esc(user.sign2 || '') + '</div>'
            : '<input type="text" data-key="sign1" placeholder="签名第一行..." value="' + App.esc(user.sign1 || '') + '"><input type="text" data-key="sign2" placeholder="签名第二行（斜体）..." value="' + App.esc(user.sign2 || '') + '" class="up-sign-input2">') +
        '</div>' +
      '</div>' +
      '<div class="up-name-area"><div class="up-name-label">姓名 NAME </div>' +
        (User.sealed
          ? '<div class="up-name-text">' + App.esc(user.realName || '—') + '</div>'
          : '<input type="text" class="up-name-input" data-key="realName" value="' + App.esc(user.realName || '') + '">') +
        '<div class="up-name-underline"></div><div class="up-name-underline2"></div>' +
      '</div>' +
      shortHtml +
      longHtml +
      '<div class="up-card-foot">CLASSIFIED</div><div class="up-bar-bot"></div>' +
      '<div class="up-quill" id="upQuill" style="' + (User.sealed ? 'display:none;' : '') + '"><img src="https://iili.io/BgIZWvI.md.png" draggable="false"></div>' +
    '</div>' +
    '<div class="up-seal' + (User.sealed ? ' show' : '') + '" id="upSeal">' +
      '<div class="up-seal-outer"><div class="up-seal-dashes"></div><div class="up-seal-inner">' +
        '<div class="up-seal-top">PERSONAL FILE</div><div class="up-seal-main">封存</div>' +
        '<div class="up-seal-line"></div><div class="up-seal-stars"><span class="up-seal-star">★</span><span class="up-seal-label">SEALED</span><span class="up-seal-star">★</span></div>' +
        '<div class="up-seal-date">' + dateStr + '</div>' +
      '</div></div><div class="up-seal-noise"></div>' +
    '</div>' +
  '</div>';

      document.body.appendChild(pp);

      App.bindSwipeBack(pp, function() {
        pp.style.transform = 'translateX(100%)';
        pp.style.opacity = '0';
        setTimeout(function() { if (pp.parentNode) pp.remove(); }, 350);
      });

      if (User._skipAnimation) {
  pp.style.transition = 'none';
  pp.style.transform = 'translateX(0)';
  pp.style.opacity = '1';
  User._skipAnimation = false;
} else {
  requestAnimationFrame(function() { requestAnimationFrame(function() {
    pp.style.transform = 'translateX(0)';
    pp.style.opacity = '1';
  }); });
}

      pp.querySelector('#upProfileBack').addEventListener('click', function() {
        pp.style.transform = 'translateX(100%)';
        pp.style.opacity = '0';
        setTimeout(function() { if (pp.parentNode) pp.remove(); }, 350);
        User.renderList();
      });

      pp.querySelector('#upRebuild').addEventListener('click', function() {
  var eid = this.dataset.editId;
  if (eid) { var u = User.getById(eid); if (u) { u._sealed = false; User.save(); } }
  // 关掉过渡动画，直接替换
  pp.style.transition = 'none';
  pp.style.transform = 'translateX(0)';
  pp.style.opacity = '1';
  if (pp.parentNode) pp.remove();
  // 创建新面板时也不要动画
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

// 头像点击
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
      editor.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10004;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateY(100%);opacity:0;overflow:hidden;';
      editor.innerHTML =
        '<div class="expand-header">' +
          '<button id="upExpBack" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#999;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<div style="font-size:13px;font-weight:700;color:#2a4262;letter-spacing:1.5px;">' + App.esc(title) + '</div>' +
          '<button id="upExpDone" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#1e50a2;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>' +
        '</div>' +
        '<div style="flex:1;padding:0 16px 40px;overflow-y:auto;-webkit-overflow-scrolling:touch;">' +
          '<div style="border:1px solid #e0e0e0;min-height:calc(100vh - 160px);background:#fff;position:relative;">' +
            '<div style="border-top:3px solid #1a1a1a;"></div>' +
            '<div style="min-height:calc(100vh - 200px);border:1px dashed #e0e0e0;margin:12px;background:repeating-linear-gradient(0deg,transparent,transparent 22px,#f5f5f5 22px,#f5f5f5 23px);">' +
              '<textarea id="upExpTA" style="width:100%;min-height:calc(100vh - 220px);border:none;background:transparent;padding:12px 14px;font-size:15px;color:#333;outline:none;resize:vertical;font-family:inherit;line-height:22px;box-sizing:border-box;" placeholder="输入内容...">' + App.esc(textarea.value) + '</textarea>' +
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

    saveProfile: function(pp) {
      var card = pp.querySelector('#upCard');
      if (!card) return;
      var editId = card.dataset.editId || '';
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

      var seal = pp.querySelector('#upSeal');
      if (seal) requestAnimationFrame(function() { seal.classList.add('show'); });
      var quill = pp.querySelector('#upQuill');
      if (quill) quill.style.display = 'none';
      var rebuild = pp.querySelector('#upRebuild');
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
        div.style.cssText = 'font-size:16px;font-weight:700;color:#1a1a1a;padding:3px 0 5px;';
        div.textContent = nameEl.value.trim() || '—';
        nameEl.parentNode.replaceChild(div, nameEl);
      }
      card.querySelectorAll('.up-expand-btn').forEach(function(btn) { btn.style.display = 'none'; });

      App.showToast('档案已封存');
    },

    showImgMenu: function(uid, field, callback) {
      var old = App.$('#imgSourceMenu');
      if (old) old.remove();
      var menu = document.createElement('div');
      menu.id = 'imgSourceMenu';
      menu.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
      menu.innerHTML =
        '<div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:10px;">' +
          '<div style="font-size:14px;font-weight:700;color:#333;text-align:center;letter-spacing:1px;margin-bottom:4px;">选择图片来源</div>' +
          '<button class="ism-btn" data-act="album" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:14px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择</button>' +
          '<button class="ism-btn" data-act="url" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:14px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button>' +
          '<button class="ism-btn" data-act="del" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:13px;font-weight:500;color:#bbb;cursor:pointer;font-family:inherit;">删除图片</button>' +
          '<button class="ism-btn" data-act="cancel" type="button" style="padding:10px;border:none;background:none;font-size:13px;color:#999;cursor:pointer;font-family:inherit;">取消</button>' +
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
            urlPanel.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
            urlPanel.innerHTML =
              '<div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:12px;">' +
                '<div style="font-size:14px;font-weight:700;color:#333;text-align:center;">输入图片URL</div>' +
                '<input id="ismUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;outline:none;font-family:inherit;color:#333;">' +
                '<div id="ismUrlPreview" style="display:none;width:100%;height:120px;border-radius:8px;overflow:hidden;border:1px solid #eee;background:#f5f5f5;"><img style="width:100%;height:100%;object-fit:cover;display:block;"></div>' +
                '<div style="display:flex;gap:8px;">' +
                  '<button id="ismUrlOk" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">确定</button>' +
                  '<button id="ismUrlNo" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>' +
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
              var oldUser2 = User.getById(uid);
              if (oldUser2 && oldUser2[field] && oldUser2[field].startsWith('data:')) { oldUser2[field] = ''; }
              urlPanel.remove(); callback(url); App.showToast('已设置');
            });
          }
        });
      });
    },

    init: function() {
      User.load();
      if (!App.$('#userPanel')) {
        var panel = document.createElement('div');
        panel.id = 'userPanel';
        panel.style.display = 'none';
        document.body.appendChild(panel);
      }

      if (!App.$('#archivePanel')) {
        var archive = document.createElement('div');
        archive.id = 'archivePanel';
        archive.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;background:#fff;display:none;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
        archive.innerHTML =
  '<div class="archive-header">' +
    '<div id="archiveClose" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;">' +
      '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#999;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>' +
    '</div>' +
    '<div style="font-size:15px;font-weight:800;color:#1a1a1a;letter-spacing:2px;">档案存储</div>' +
    '<div id="archiveAdd" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;color:#999;font-weight:300;-webkit-tap-highlight-color:transparent;">+</div>' +
  '</div>' +
'<div class="t2-wrap">' +
  '<div class="t2-inner">' +
'<div class="t4-deco"><div class="t4-star-main"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></div><div class="t4-star-sm t4-star-s1"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></div></div>' +
    '<div class="t2-tabs" id="archiveTabs">' +
      '<div class="t2-tab t2-active" id="archiveTabUser" data-tab="user"><span>user</span><div class="t2-tab-dot"></div></div>' +
      '<div class="t2-tab" id="archiveTabChar" data-tab="char"><span>char</span><div class="t2-tab-dot"></div></div>' +
    '</div>' +
    '<div class="t2-leds"><div class="t2-led t2-led-on" id="archiveLed1"></div><div class="t2-led" id="archiveLed2"></div></div>' +
  '</div>' +
'</div>' +
  '<div class="archive-content">' +
    '<div id="archivePanelUser" style="position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;transition:transform .35s cubic-bezier(.32,.72,0,1),opacity .25s;transform:translateX(0);opacity:1;"></div>' +
    '<div id="archivePanelChar" style="position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;transition:transform .35s cubic-bezier(.32,.72,0,1),opacity .25s;transform:translateX(100%);opacity:0;"></div>' +
  '</div>';
        document.body.appendChild(archive);
      }

      App.archive = {
        currentTab: 'user',
        open: function(tab) {
          User.load();
          var panel = App.$('#archivePanel');
          if (!panel) return;
          panel.style.display = 'flex';
          App.archive.switchTab(tab || 'user');
          requestAnimationFrame(function() { requestAnimationFrame(function() {
            panel.style.transform = 'translateX(0)';
            panel.style.opacity = '1';
          }); });
          App.bindSwipeBack(panel, function() { App.archive.close(); });
        },
        close: function() {
          var panel = App.$('#archivePanel');
          if (!panel) return;
          panel.style.transform = 'translateX(100%)';
          panel.style.opacity = '0';
          setTimeout(function() { panel.style.display = 'none'; }, 350);
        },
        switchTab: function(tab) {
  App.archive.currentTab = tab;
  var tabUser = App.$('#archiveTabUser');
  var tabChar = App.$('#archiveTabChar');
  var led1 = App.$('#archiveLed1');
  var led2 = App.$('#archiveLed2');
  var panelUser = App.$('#archivePanelUser');
  var panelChar = App.$('#archivePanelChar');
  if (tab === 'user') {
    tabUser.classList.add('t2-active');
    tabChar.classList.remove('t2-active');
    if (led1) { led1.classList.add('t2-led-on'); }
    if (led2) { led2.classList.remove('t2-led-on'); }
    panelUser.style.transform = 'translateX(0)';
    panelUser.style.opacity = '1';
    panelChar.style.transform = 'translateX(100%)';
    panelChar.style.opacity = '0';
    User.renderListInto(panelUser);
  } else {
    tabChar.classList.add('t2-active');
    tabUser.classList.remove('t2-active');
    if (led2) { led2.classList.add('t2-led-on'); }
    if (led1) { led1.classList.remove('t2-led-on'); }
    panelChar.style.transform = 'translateX(0)';
    panelChar.style.opacity = '1';
    panelUser.style.transform = 'translateX(-100%)';
    panelUser.style.opacity = '0';
    if (App.character) App.character.renderListInto(panelChar);
  }
}
      };

      App.safeOn('#archiveClose', 'click', function() { App.archive.close(); });
      App.safeOn('#archiveAdd', 'click', function() {
        if (App.archive.currentTab === 'user') {
          User.renderProfile(null);
        } else {
          if (App.charMgr) App.charMgr.open();
        }
      });
      App.safeOn('#archiveTabUser', 'click', function() { App.archive.switchTab('user'); });
      App.safeOn('#archiveTabChar', 'click', function() { App.archive.switchTab('char'); });

      App.user = User;
      App.safeOn('#dockMine', 'click', function() { App.archive.open('user'); });
    }
  };

  App.register('user', User);
})();