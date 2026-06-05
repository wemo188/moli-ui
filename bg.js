
(function(){
  'use strict';
  var App = window.App; if(!App) return;

  var DEFAULT_SVGS = {
    iconUser: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="hm1"><rect width="64" height="64" fill="white"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="black"/></mask><circle cx="32" cy="32" r="22" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#hm1)"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" stroke="#999" stroke-width="1.8" fill="none"/></svg>',
    iconChar: '<svg viewBox="0 0 64 64" fill="none" width="52" height="52"><rect x="8" y="10" width="46" height="44" rx="4" stroke="#999" stroke-width="2" fill="none"/><path d="M21 18L23 23L28 23.5L24 27L25 32L21 29L17 32L18 27L14 23.5L19 23Z" stroke="#999" stroke-width="1.6" stroke-linejoin="round" fill="#999"/><line x1="34" y1="20" x2="50" y2="20" stroke="#999" stroke-width="1.8" stroke-linecap="round"/><line x1="34" y1="28" x2="46" y2="28" stroke="#999" stroke-width="1.6" stroke-linecap="round"/><line x1="34" y1="36" x2="48" y2="36" stroke="#999" stroke-width="1.6" stroke-linecap="round"/><line x1="14" y1="44" x2="50" y2="44" stroke="#999" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="3 2"/></svg>',
    iconTheme: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="pm1"><rect width="64" height="64" fill="white"/><circle cx="20" cy="26" r="4.5" fill="black"/><circle cx="32" cy="18" r="4.5" fill="black"/><circle cx="44" cy="26" r="4.5" fill="black"/><circle cx="22" cy="38" r="4.5" fill="black"/></mask><path d="M32 8C18.7 8 8 18.7 8 32C8 45.3 18.7 56 32 56C34.2 56 36 54.2 36 52C36 51 35.6 50.1 35 49.4C34.4 48.7 34 47.8 34 46.8C34 44.6 35.8 42.8 38 42.8H42C50.3 42.8 57 36.1 57 27.8C57 16.9 45.7 8 32 8Z" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#pm1)"/><circle cx="20" cy="26" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/><circle cx="32" cy="18" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/><circle cx="44" cy="26" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/><circle cx="22" cy="38" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/></svg>',
    iconSettings: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="gm1"><rect width="64" height="64" fill="white"/><circle cx="32" cy="26.5" r="7" fill="black"/></mask><path d="M30 8H34L35 13C36.5 13.4 37.9 14 39.2 14.8L43.5 12L46.5 15L44.2 19.2C45 20.5 45.6 21.9 46 23.4L51 24.5V28.5L46 29.6C45.6 31.1 45 32.5 44.2 33.8L46.5 38L43.5 41L39.2 38.2C37.9 39 36.5 39.6 35 40L34 45H30L29 40C27.5 39.6 26.1 39 24.8 38.2L20.5 41L17.5 38L19.8 33.8C19 32.5 18.4 31.1 18 29.6L13 28.5V24.5L18 23.4C18.4 21.9 19 20.5 19.8 19.2L17.5 15L20.5 12L24.8 14.8C26.1 14 27.5 13.4 29 13L30 8Z" stroke="#999" stroke-width="2" stroke-linejoin="round" fill="#999" mask="url(#gm1)"/><circle cx="32" cy="26.5" r="7" stroke="#999" stroke-width="1.8" fill="none"/></svg>',
    dockChat: '<svg viewBox="0 0 64 64" fill="none" width="34" height="34"><mask id="cm1"><rect width="64" height="64" fill="white"/><line x1="23" y1="27.5" x2="41" y2="27.5" stroke="black" stroke-width="4" stroke-linecap="round"/><line x1="23" y1="34.5" x2="35" y2="34.5" stroke="black" stroke-width="4" stroke-linecap="round"/></mask><path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#cm1)"/></svg>',
    dockStory: '<svg viewBox="0 0 64 64" fill="none" width="32" height="32"><mask id="sm1"><rect width="64" height="64" fill="white"/><path d="M33 20L40 29L33 38L26 29Z" fill="black"/><circle cx="33" cy="29" r="3" fill="black"/></mask><rect x="14" y="6" width="38" height="46" rx="4" fill="#999" mask="url(#sm1)"/><line x1="10" y1="10" x2="10" y2="48" stroke="#999" stroke-width="2.2" stroke-linecap="round"/><line x1="10" y1="10" x2="14" y2="10" stroke="#999" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="48" x2="14" y2="48" stroke="#999" stroke-width="2" stroke-linecap="round"/><path d="M33 20L40 29L33 38L26 29Z" stroke="#999" stroke-width="1.6" stroke-linejoin="round" fill="none"/><circle cx="33" cy="29" r="3" stroke="#999" stroke-width="1.4" fill="none"/><path d="M10 52H52" stroke="#aaa" stroke-width="1.4" stroke-linecap="round"/><path d="M10 55H52" stroke="#bbb" stroke-width="1.2" stroke-linecap="round"/><path d="M10 58H52" stroke="#ccc" stroke-width="1" stroke-linecap="round"/></svg>',
    dockCheckin: '<svg viewBox="0 0 64 64" fill="none" width="32" height="32"><mask id="ck1"><rect width="64" height="64" fill="white"/><rect x="21" y="18" width="22" height="28" rx="1.5" fill="black"/><circle cx="32" cy="50" r="2.5" fill="black"/></mask><rect x="18" y="10" width="28" height="44" rx="4" fill="#999" mask="url(#ck1)"/><line x1="28" y1="13" x2="36" y2="13" stroke="#999" stroke-width="1.6" stroke-linecap="round"/><rect x="21" y="18" width="22" height="28" rx="1.5" fill="none" stroke="#999" stroke-width="1.4"/><circle cx="32" cy="50" r="2.5" stroke="#999" stroke-width="1.5" fill="none"/><line x1="24" y1="23" x2="40" y2="23" stroke="#999" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="28" x2="35" y2="28" stroke="#999" stroke-width="1.2" stroke-linecap="round"/><line x1="24" y1="33" x2="39" y2="33" stroke="#999" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="38" x2="33" y2="38" stroke="#999" stroke-width="1.2" stroke-linecap="round"/></svg>',
    dockForum: '<svg viewBox="0 0 64 64" fill="none" width="34" height="34"><mask id="em1"><rect width="64" height="64" fill="white"/><ellipse cx="32" cy="32" rx="7" ry="18" stroke="black" stroke-width="1.4" fill="none"/><path d="M14 26H50" stroke="black" stroke-width="1.2"/><path d="M16 38H48" stroke="black" stroke-width="1.2"/></mask><circle cx="32" cy="32" r="18" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#em1)"/><ellipse cx="32" cy="32" rx="28" ry="10" stroke="#999" stroke-width="1.8" fill="none" transform="rotate(-20 32 32)"/><circle cx="52" cy="20" r="3" fill="#999" stroke="#999" stroke-width="1.4"/></svg>'
  };

  var ICON_MAP = [
    { id: 'customIcon_user', label: 'User', containerId: 'iconUserImg', parentId: 'iconUser' },
    { id: 'customIcon_char', label: 'Char', containerId: 'iconCharImg', parentId: 'iconChar' },
    { id: 'customIcon_theme', label: '美化', containerId: 'iconThemeImg', parentId: 'iconTheme' },
    { id: 'customIcon_settings', label: '设置', containerId: 'iconSettingsImg', parentId: 'iconSettings' },
    { id: 'customIcon_dockChat', label: '聊天', containerId: null, parentId: 'dockChat', selector: '#dockChat .mk-card' },
    { id: 'customIcon_dockStory', label: '剧情', containerId: null, parentId: 'dockStory', selector: '#dockStory .mk-card' },
    { id: 'customIcon_dockCheckin', label: '查岗', containerId: null, parentId: 'dockCheckin', selector: '#dockCheckin .mk-card' },
    { id: 'customIcon_dockForum', label: '论坛', containerId: null, parentId: 'dockForum', selector: '#dockForum .mk-card' }
  ];

  var Bg = {
    _savedData: null,

    init: function() {
      if(!document.getElementById('bgInlineStyle')) {
        var bgStyle = document.createElement('style');
        bgStyle.id = 'bgInlineStyle';
        bgStyle.textContent = '#bgLayer{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;}.bg-icon-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 10px;margin-bottom:16px;}.bg-icon-item{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}.bg-icon-item:active{opacity:.7;}.bg-icon-thumb{width:50px;height:50px;border-radius:12px;border:1px solid rgba(173,205,234,.3);overflow:hidden;background:#f5f5f5;display:flex;align-items:center;justify-content:center;}.bg-icon-thumb img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;}.bg-icon-thumb svg{width:28px;height:28px;}.bg-icon-label{font-size:10px;font-weight:700;color:#5a7a9a;}';
        document.head.appendChild(bgStyle);
      }

      Bg.renderAllIcons();

      var bgData = App.LS.get('bgData') || {};
      Bg.applyBg(bgData);

      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
      if(!iconConfig.borderColor) iconConfig.borderColor = '#dcebff';
      if(!iconConfig.shadowColor) iconConfig.shadowColor = '#dcebff';
      if(App.LS.get('topIconConfig')) Bg.applyTopIconStyle(iconConfig);

      App.safeOn('#iconTheme', 'click', function() { Bg.open(); });

      App.bg = Bg;
    },

renderAllIcons: function() {
  var glassStyle = 'width:80px;height:80px;border-radius:15px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 32px rgba(0,0,0,.12),inset 0 1px 1px rgba(255,255,255,.15);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';
  var itemStyle = 'display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;';
  var labelStyle = 'font-size:12.5px;text-align:center;letter-spacing:1px;font-weight:800;';

  ICON_MAP.forEach(function(ic) {
    var customSrc = App.LS.get(ic.id);
    if(ic.containerId) {
      var container = document.getElementById(ic.containerId);
      if(!container) return;
      var parent = document.getElementById(ic.parentId);
      if(parent) parent.style.cssText = itemStyle;
      container.style.cssText = glassStyle;
      var label = document.getElementById(ic.containerId.replace('Img','Label'));
      if(label) label.style.cssText = labelStyle;
      if(customSrc) {
        container.innerHTML = '<img src="' + App.escAttr(customSrc) + '" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;border-radius:15px;">';
      } else {
        container.innerHTML = DEFAULT_SVGS[ic.parentId] || '';
      }
    } else if(ic.selector) {
      var el = document.querySelector(ic.selector);
      if(!el) return;
      if(customSrc) {
        el.innerHTML = '<img src="' + App.escAttr(customSrc) + '" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;border-radius:inherit;">';
      } else {
        el.innerHTML = DEFAULT_SVGS[ic.parentId] || '';
      }
    }
  });

  Bg.restoreIconPositions();
  Bg.bindIconDrag();
},

    bindIconDrag: function() {
      var DELAY = 500;
      var ids = ['iconUser', 'iconChar', 'iconTheme', 'iconSettings'];

      ids.forEach(function(id) {
        var el = document.getElementById(id);
        if(!el || el._bgDragBound) return;
        el._bgDragBound = true;

        var startX, startY, origX, origY, longPressed = false, timer, moved = false;

        el.addEventListener('touchstart', function(e) {
          var t = e.touches[0];
          startX = t.clientX;
          startY = t.clientY;
          longPressed = false;
          moved = false;

          timer = setTimeout(function() {
            longPressed = true;
            var off = Bg._getIconOffset(id);
            origX = off.x;
            origY = off.y;
            el.style.transition = 'none';
            el.style.zIndex = '999';
            if(navigator.vibrate) navigator.vibrate(15);
          }, DELAY);
        }, { passive: true });

        el.addEventListener('touchmove', function(e) {
          var t = e.touches[0];
          if(timer && !longPressed) {
            if(Math.abs(t.clientX - startX) > 8 || Math.abs(t.clientY - startY) > 8) {
              clearTimeout(timer);
              timer = null;
            }
            return;
          }
          if(!longPressed) return;
          moved = true;
          e.preventDefault();
          e.stopPropagation();
          var nx = origX + (t.clientX - startX);
          var ny = origY + (t.clientY - startY);
          el.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
        }, { passive: false });

        el.addEventListener('touchend', function(e) {
          clearTimeout(timer);
          timer = null;
          el.style.transition = '';
          el.style.zIndex = '';
          if(longPressed && moved) {
            Bg._saveIconOffset(id, el);
            e.stopPropagation();
          }
          longPressed = false;
          moved = false;
        });
      });
    },

    _getIconOffset: function(id) {
      var offsets = App.LS.get('appIconOffsets') || {};
      return offsets[id] || { x: 0, y: 0 };
    },

    _saveIconOffset: function(id, el) {
      var offsets = App.LS.get('appIconOffsets') || {};
      var match = el.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
      if(match) {
        offsets[id] = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
        App.LS.set('appIconOffsets', offsets);
      }
    },

    restoreIconPositions: function() {
      var offsets = App.LS.get('appIconOffsets') || {};
      ['iconUser', 'iconChar', 'iconTheme', 'iconSettings'].forEach(function(id) {
        var el = document.getElementById(id);
        if(!el) return;
        var off = offsets[id];
        if(off) el.style.transform = 'translate(' + off.x + 'px,' + off.y + 'px)';
      });
    },

    open: function() {
      var panel = App.$('#bgPanel'); if(!panel) return;
      var bgData = App.LS.get('bgData') || {};
      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
      if(!iconConfig.borderColor) iconConfig.borderColor = '#dcebff';
      if(!iconConfig.shadowColor) iconConfig.shadowColor = '#dcebff';

      Bg._savedData = JSON.parse(JSON.stringify(bgData));

      var hasBg = !!bgData.src;

      panel.innerHTML =
        '<div class="hp-handle"></div>' +
        '<div class="hp-header">' +
          '<button class="hp-close" id="bgCloseBtn" type="button"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
        '</div>' +
        '<div class="hp-body">' +
          '<div class="hp-section-label">背景墙纸</div>' +
          '<div class="hp-upload" id="bgUploadArea"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>' + (hasBg ? '更换图片' : '上传图片') + '</span></div>' +
          '<input type="file" id="bgFileInput" accept="image/*" hidden>' +
          '<div class="hp-slider-row"><span class="hp-slider-label">虚化</span><input type="range" id="bgBlurSlider" min="0" max="30" value="' + (bgData.blur || 0) + '"><span class="hp-slider-val" id="bgBlurVal">' + (bgData.blur || 0) + 'px</span></div>' +
          '<div class="hp-slider-row"><span class="hp-slider-label">变暗</span><input type="range" id="bgDarkSlider" min="0" max="80" value="' + (bgData.dark || 0) + '"><span class="hp-slider-val" id="bgDarkVal">' + (bgData.dark || 0) + '%</span></div>' +
          '<div class="hp-btn-row"><button class="hp-btn hp-btn-primary" id="bgApplyBtn" type="button">应用背景</button><button class="hp-btn hp-btn-danger" id="bgRemoveBtn" type="button">移除</button></div>' +
          '<div class="hp-divider"></div>' +
          '<div class="hp-section-label">图标边框样式</div>' +
          '<div class="hp-slider-row"><span class="hp-slider-label">边框</span><input type="range" id="bgIconBorderSlider" min="0" max="6" step="0.5" value="' + iconConfig.borderW + '"><span class="hp-slider-val" id="bgIconBorderVal">' + iconConfig.borderW + 'px</span></div>' +
          '<div class="hp-slider-row"><span class="hp-slider-label">阴影</span><input type="range" id="bgIconShadowSlider" min="0" max="16" step="1" value="' + iconConfig.shadow + '"><span class="hp-slider-val" id="bgIconShadowVal">' + iconConfig.shadow + 'px</span></div>' +
          '<div class="hp-color-row"><span class="hp-slider-label">颜色</span><div class="hp-color-dot" id="bgColorDot" style="background:' + iconConfig.borderColor + ';"></div><button class="hp-btn-reset" id="bgResetColorBtn" type="button">恢复默认</button></div>' +
          '<div class="hp-divider"></div>' +
          '<div class="hp-section-label">替换图标</div>' +
          '<div class="bg-icon-grid" id="bgIconGrid"></div>' +
          '<div class="hp-bottom-spacer"></div>' +
        '</div>';

      if(App.initHalfPanelControls) App.initHalfPanelControls();

      Bg._tempSrc = bgData.src || '';
      Bg.renderIconGrid(panel);
      Bg.bindEvents(panel, iconConfig);

      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    close: function() {
      if(Bg._savedData) Bg.applyBg(Bg._savedData);
      var panel = App.$('#bgPanel'); if(!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderIconGrid: function(panel) {
      var grid = panel.querySelector('#bgIconGrid'); if(!grid) return;

      grid.innerHTML = ICON_MAP.map(function(ic) {
        var customSrc = App.LS.get(ic.id);
        var thumbHtml = customSrc
          ? '<img src="' + App.escAttr(customSrc) + '">'
          : (DEFAULT_SVGS[ic.parentId] || '');
        return '<div class="bg-icon-item" data-icon-id="' + ic.id + '" data-parent-id="' + ic.parentId + '">' +
          '<div class="bg-icon-thumb">' + thumbHtml + '</div>' +
          '<div class="bg-icon-label">' + ic.label + '</div>' +
        '</div>';
      }).join('');

      grid.querySelectorAll('.bg-icon-item').forEach(function(item) {
        item.addEventListener('click', function() {
          Bg.showIconMenu(item.dataset.iconId, item.dataset.parentId, item);
        });
      });
    },

    showIconMenu: function(iconId, parentId, itemEl) {
      var menu = document.createElement('div');
      menu.style.cssText = 'position:fixed;inset:0;z-index:100030;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
      menu.innerHTML =
        '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:240px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">' +
          '<button data-act="upload" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">上传新图片</button>' +
          '<button data-act="reset" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:13px;font-weight:600;color:#c9706b;cursor:pointer;font-family:inherit;">恢复默认</button>' +
          '<button data-act="cancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>' +
        '</div>';
      document.body.appendChild(menu);
      menu.addEventListener('click', function(e) { if(e.target === menu) menu.remove(); });

      menu.querySelectorAll('button').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation(); var act = btn.dataset.act; menu.remove();
          if(act === 'cancel') return;
          if(act === 'reset') {
            App.LS.remove(iconId);
            Bg.renderAllIcons();
            var thumb = itemEl.querySelector('.bg-icon-thumb');
            if(thumb) thumb.innerHTML = DEFAULT_SVGS[parentId] || '';
            App.showToast('已恢复');
            return;
          }
          if(act === 'upload') {
            var ipt = document.createElement('input'); ipt.type = 'file'; ipt.accept = 'image/*';
            ipt.onchange = function(ev) {
              var f = ev.target.files[0]; if(!f) return;
              var rd = new FileReader();
              rd.onload = function(r) {
                var process = function(c) {
                  App.LS.set(iconId, c);
                  Bg.renderAllIcons();
                  var thumb = itemEl.querySelector('.bg-icon-thumb');
                  if(thumb) thumb.innerHTML = '<img src="' + c + '">';
                  App.showToast('图标已更换');
                };
                if(App.cropImage) App.cropImage(r.target.result, process); else process(r.target.result);
              };
              rd.readAsDataURL(f);
            };
            ipt.click();
          }
        });
      });
    },

    bindEvents: function(panel, iconConfig) {
      panel.querySelector('#bgCloseBtn').addEventListener('click', function() { Bg.close(); });

      var fileInput = panel.querySelector('#bgFileInput');
      panel.querySelector('#bgUploadArea').addEventListener('click', function() { fileInput.click(); });
      fileInput.addEventListener('change', function(e) {
        var f = e.target.files[0]; if(!f) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var process = function(src) {
            Bg._tempSrc = src;
            var d = { src: src, blur: parseInt(panel.querySelector('#bgBlurSlider').value), dark: parseInt(panel.querySelector('#bgDarkSlider').value) };
            Bg.applyBg(d);
            panel.querySelector('#bgUploadArea span').textContent = '更换图片';
            App.showToast('预览中，点"应用背景"保存');
          };
          if(App.cropImage) App.cropImage(ev.target.result, process); else process(ev.target.result);
        };
        reader.readAsDataURL(f);
        e.target.value = '';
      });

      function previewBg() {
        var blur = parseInt(panel.querySelector('#bgBlurSlider').value);
        var dark = parseInt(panel.querySelector('#bgDarkSlider').value);
        panel.querySelector('#bgBlurVal').textContent = blur + 'px';
        panel.querySelector('#bgDarkVal').textContent = dark + '%';
        var src = Bg._tempSrc || (Bg._savedData || {}).src || '';
        if(src) Bg.applyBg({ src: src, blur: blur, dark: dark });
      }
      panel.querySelector('#bgBlurSlider').addEventListener('input', previewBg);
      panel.querySelector('#bgDarkSlider').addEventListener('input', previewBg);

      panel.querySelector('#bgApplyBtn').addEventListener('click', function() {
        var src = Bg._tempSrc || (Bg._savedData || {}).src || '';
        if(!src) { App.showToast('请先上传图片'); return; }
        var d = { src: src, blur: parseInt(panel.querySelector('#bgBlurSlider').value), dark: parseInt(panel.querySelector('#bgDarkSlider').value) };
        try {
          App.LS.set('bgData', d);
          Bg._savedData = d;
          Bg.applyBg(d);
          App.showToast('背景已应用');
        } catch(e) { App.showToast('图片太大，请压缩后重试'); }
      });

      panel.querySelector('#bgRemoveBtn').addEventListener('click', function() {
        App.LS.remove('bgData');
        Bg._tempSrc = '';
        Bg._savedData = {};
        Bg.applyBg({});
        panel.querySelector('#bgBlurSlider').value = 0;
        panel.querySelector('#bgDarkSlider').value = 0;
        panel.querySelector('#bgBlurVal').textContent = '0px';
        panel.querySelector('#bgDarkVal').textContent = '0%';
        panel.querySelector('#bgUploadArea span').textContent = '上传图片';
        App.showToast('背景已移除');
      });

      function updateIcon() {
        var bw = parseFloat(panel.querySelector('#bgIconBorderSlider').value);
        var sw = parseInt(panel.querySelector('#bgIconShadowSlider').value);
        panel.querySelector('#bgIconBorderVal').textContent = bw + 'px';
        panel.querySelector('#bgIconShadowVal').textContent = sw + 'px';
        iconConfig.borderW = bw; iconConfig.shadow = sw;
        App.LS.set('topIconConfig', iconConfig);
        Bg.applyTopIconStyle(iconConfig);
      }
      panel.querySelector('#bgIconBorderSlider').addEventListener('input', updateIcon);
      panel.querySelector('#bgIconShadowSlider').addEventListener('input', updateIcon);

      panel.querySelector('#bgColorDot').addEventListener('click', function(e) {
        e.stopPropagation(); if(!App.openColorPicker) return;
        App.openColorPicker(iconConfig.borderColor, function(hex) {
          iconConfig.borderColor = hex; iconConfig.shadowColor = hex;
          panel.querySelector('#bgColorDot').style.background = hex;
          App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
        }, function(hex) {
          iconConfig.borderColor = hex; iconConfig.shadowColor = hex;
          panel.querySelector('#bgColorDot').style.background = hex;
          Bg.applyTopIconStyle(iconConfig);
        });
      });

      panel.querySelector('#bgResetColorBtn').addEventListener('click', function() {
        iconConfig = { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
        panel.querySelector('#bgColorDot').style.background = '#dcebff';
        panel.querySelector('#bgIconBorderSlider').value = 1;
        panel.querySelector('#bgIconShadowSlider').value = 0;
        panel.querySelector('#bgIconBorderVal').textContent = '1px';
        panel.querySelector('#bgIconShadowVal').textContent = '0px';
        App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
        App.showToast('已恢复默认');
      });
    },

    applyBg: function(data) {
      var layer = App.$('#bgLayer'); if(!layer) return;
      if(data && data.src) {
        layer.style.backgroundImage = 'url(' + data.src + ')';
        layer.style.filter = 'blur(' + (data.blur || 0) + 'px) brightness(' + (100 - (data.dark || 0)) + '%)';
      } else {
        layer.style.backgroundImage = '';
        layer.style.filter = '';
      }
    },

    applyTopIconStyle: function(cfg) {
      var styleId = 'topIconDynamicStyle';
      var styleEl = document.getElementById(styleId);
      if(!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
      styleEl.innerHTML = '#appIconsRow > div > div:first-child { border: ' + cfg.borderW + 'px solid ' + (cfg.borderColor || '#dcebff') + ' !important; box-shadow: ' + cfg.shadow + 'px ' + cfg.shadow + 'px 0 ' + (cfg.shadowColor || '#dcebff') + ' !important; border-radius: 15px !important; }';
    }
  };

  App.register('bg', Bg);
})();
