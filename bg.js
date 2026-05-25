(function(){
  'use strict';
  var App = window.App; if(!App) return;

  var Bg = {
    _savedData: null,
    _defaultIcons: {},

    init: function() {
      // 注入背景样式
      if(!document.getElementById('bgInlineStyle')) {
        var bgStyle = document.createElement('style');
        bgStyle.id = 'bgInlineStyle';
        bgStyle.textContent = `
#bgLayer {
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
.bg-icon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 10px;
  margin-bottom: 16px;
}
.bg-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.bg-icon-item:active { opacity: .7; }
.bg-icon-thumb {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 1px solid rgba(173,205,234,.3);
  overflow: hidden;
  background: #f5f5f5;
}
.bg-icon-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  -webkit-user-drag: none;
}
.bg-icon-label {
  font-size: 10px;
  font-weight: 700;
  color: #5a7a9a;
}`;
        document.head.appendChild(bgStyle);
      }

      document.querySelectorAll('#cardIcon1 img, #cardIcon2 img, #dockMine img, #dockLong img, #dockCheck img, #dockShort img').forEach(function(img) {
        var key = img.closest('[id]');
        if (key) Bg._defaultIcons[key.id] = { src: img.getAttribute('src'), transform: img.style.transform || '' };
      });

      var bgData = App.LS.get('bgData') || {};
      Bg.applyBg(bgData);
      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
      if(!iconConfig.borderColor) iconConfig.borderColor = '#dcebff';
      if(!iconConfig.shadowColor) iconConfig.shadowColor = '#dcebff';
      if(App.LS.get('topIconConfig')) Bg.applyTopIconStyle(iconConfig);
      App.bg = Bg;
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
          '<div class="hp-upload" id="bgUploadArea">' +
            '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
            '<span>' + (hasBg ? '更换图片' : '上传图片') + '</span>' +
          '</div>' +
          '<input type="file" id="bgFileInput" accept="image/*" hidden>' +

          '<div class="hp-slider-row">' +
            '<span class="hp-slider-label">虚化</span>' +
            '<input type="range" id="bgBlurSlider" min="0" max="30" value="' + (bgData.blur || 0) + '">' +
            '<span class="hp-slider-val" id="bgBlurVal">' + (bgData.blur || 0) + 'px</span>' +
          '</div>' +

          '<div class="hp-slider-row">' +
            '<span class="hp-slider-label">变暗</span>' +
            '<input type="range" id="bgDarkSlider" min="0" max="80" value="' + (bgData.dark || 0) + '">' +
            '<span class="hp-slider-val" id="bgDarkVal">' + (bgData.dark || 0) + '%</span>' +
          '</div>' +

          '<div class="hp-btn-row">' +
            '<button class="hp-btn hp-btn-primary" id="bgApplyBtn" type="button">应用背景</button>' +
            '<button class="hp-btn hp-btn-danger" id="bgRemoveBtn" type="button">移除</button>' +
          '</div>' +

          '<div class="hp-divider"></div>' +

          '<div class="hp-section-label">上侧图标样式</div>' +

          '<div class="hp-slider-row">' +
            '<span class="hp-slider-label">边框</span>' +
            '<input type="range" id="bgIconBorderSlider" min="0" max="6" step="0.5" value="' + iconConfig.borderW + '">' +
            '<span class="hp-slider-val" id="bgIconBorderVal">' + iconConfig.borderW + 'px</span>' +
          '</div>' +

          '<div class="hp-slider-row">' +
            '<span class="hp-slider-label">阴影</span>' +
            '<input type="range" id="bgIconShadowSlider" min="0" max="16" step="1" value="' + iconConfig.shadow + '">' +
            '<span class="hp-slider-val" id="bgIconShadowVal">' + iconConfig.shadow + 'px</span>' +
          '</div>' +

          '<div class="hp-color-row">' +
            '<span class="hp-slider-label">颜色</span>' +
            '<div class="hp-color-dot" id="bgColorDot" style="background:' + iconConfig.borderColor + ';"></div>' +
            '<button class="hp-btn-reset" id="bgResetColorBtn" type="button">恢复默认</button>' +
          '</div>' +

          '<div class="hp-divider"></div>' +

          '<div class="hp-section-label">替换图标</div>' +
          '<div class="bg-icon-grid" id="bgIconGrid"></div>' +

          '<div class="hp-bottom-spacer"></div>' +
        '</div>';

      /* ★ 魔法印章：给刚生成的面板加上控制按钮 */
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

      function getDefault(parentId) { var d = Bg._defaultIcons[parentId]; return d ? d.src : ''; }

      var icons = [
        { id: 'customIcon_cg', label: '查岗', target: '#cardIcon1 img', parentId: 'cardIcon1', def: getDefault('cardIcon1') },
        { id: 'customIcon_lt', label: '论坛', target: '#cardIcon2 img', parentId: 'cardIcon2', def: getDefault('cardIcon2') },
        { id: 'customIcon_dockMine', label: 'User', target: '#dockMine img', parentId: 'dockMine', def: getDefault('dockMine') },
        { id: 'customIcon_dockLong', label: 'Char', target: '#dockLong img', parentId: 'dockLong', def: getDefault('dockLong') },
        { id: 'customIcon_dockCheck', label: '线下', target: '#dockCheck img', parentId: 'dockCheck', def: getDefault('dockCheck') },
        { id: 'customIcon_dockShort', label: '微信', target: '#dockShort img', parentId: 'dockShort', def: getDefault('dockShort') }
      ];

      grid.innerHTML = icons.map(function(ic) {
        var src = App.LS.get(ic.id) || ic.def;
        return '<div class="bg-icon-item" data-icon-id="' + ic.id + '" data-icon-target="' + App.escAttr(ic.target) + '" data-icon-def="' + App.escAttr(ic.def) + '" data-icon-parent="' + ic.parentId + '">' +
          '<div class="bg-icon-thumb"><img src="' + App.escAttr(src) + '" draggable="false"></div>' +
          '<div class="bg-icon-label">' + ic.label + '</div>' +
        '</div>';
      }).join('');

      grid.querySelectorAll('.bg-icon-item').forEach(function(item) {
        item.addEventListener('click', function() {
          Bg.showIconMenu(item.dataset.iconId, item.dataset.iconTarget, item.dataset.iconDef, item, item.dataset.iconParent);
        });
      });
    },

    showIconMenu: function(iconId, target, def, itemEl, parentId) {
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

      var defaultTransform = (Bg._defaultIcons[parentId] && Bg._defaultIcons[parentId].transform) || '';

      menu.querySelectorAll('button').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation(); var act = btn.dataset.act; menu.remove();
          if(act === 'cancel') return;
          if(act === 'reset') {
            App.LS.remove(iconId);
            var tEl = document.querySelector(target);
            if(tEl) {
              tEl.src = def;
              tEl.style.transform = defaultTransform;
              tEl.style.width = '';
              tEl.style.height = '';
              tEl.style.objectFit = '';
            }
            var thumb = itemEl.querySelector('img'); if(thumb) thumb.src = def;
            App.showToast('已恢复'); return;
          }
          if(act === 'upload') {
            var ipt = document.createElement('input'); ipt.type = 'file'; ipt.accept = 'image/*';
            ipt.onchange = function(ev) {
              var f = ev.target.files[0]; if(!f) return;
              var rd = new FileReader();
              rd.onload = function(r) {
                var process = function(c) {
                  App.LS.set(iconId, c);
                  var tEl = document.querySelector(target);
                  if(tEl) {
                    tEl.src = c;
                    tEl.style.transform = 'none';
                    tEl.style.width = '100%';
                    tEl.style.height = '100%';
                    tEl.style.objectFit = 'cover';
                  }
                  var thumb = itemEl.querySelector('img'); if(thumb) thumb.src = c;
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
  layer.style.backgroundSize = 'cover';
  layer.style.backgroundPosition = 'center center';
  layer.style.backgroundRepeat = 'no-repeat';
  layer.style.width = '100vw';
  layer.style.height = '100vh';
  layer.style.left = '0';
  layer.style.top = '0';
  layer.style.margin = '0';
  layer.style.padding = '0';
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
      styleEl.innerHTML = '.card-icon-img { border: ' + cfg.borderW + 'px solid ' + (cfg.borderColor || '#dcebff') + ' !important; box-shadow: ' + cfg.shadow + 'px ' + cfg.shadow + 'px 0 ' + (cfg.shadowColor || '#dcebff') + ' !important; border-radius: 15px !important; background: #fff !important; }';
    }
  };

  App.register('bg', Bg);
})();
