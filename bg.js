(function(){
  'use strict';
  var App = window.App; if(!App) return;

  var Bg = {
    _tempSrc: '',
    _tempBlur: 0,
    _tempDark: 0,

    init: function() {
      var bgData = App.LS.get('bgData') || {};
      Bg.applyBg(bgData);

      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
      if(!iconConfig.borderColor) iconConfig.borderColor = '#dcebff';
      if(!iconConfig.shadowColor) iconConfig.shadowColor = '#dcebff';
      if(App.LS.get('topIconConfig')) Bg.applyTopIconStyle(iconConfig);
    },

    open: function() {
      var panel = App.$('#bgPanel'); if(!panel) return;
      var bgData = App.LS.get('bgData') || {};
      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
      if(!iconConfig.borderColor) iconConfig.borderColor = '#dcebff';
      if(!iconConfig.shadowColor) iconConfig.shadowColor = '#dcebff';

      // 暂存当前值（取消时恢复）
      Bg._tempSrc = bgData.src || '';
      Bg._tempBlur = bgData.blur || 0;
      Bg._tempDark = bgData.dark || 0;

      var hasBg = !!bgData.src;

      panel.innerHTML =
        '<div class="bg-header">' +
          '<div class="bg-drag-handle"></div>' +
          '<div class="bg-header-row">' +
            '<h2>背景与图标</h2>' +
            '<button class="bg-close-btn" id="bgCloseBtn" type="button">' +
              '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="bg-body">' +

          /* 背景墙纸 */
          '<div class="bg-section-label">背景墙纸</div>' +

          '<div id="bgUploadArea" class="bg-upload">' +
            '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
            '<span>' + (hasBg ? '更换图片' : '上传图片') + '</span>' +
          '</div>' +
          '<input type="file" id="bgFileInput" accept="image/*" hidden>' +

          '<div class="bg-slider-row">' +
            '<span class="bg-slider-label">虚化</span>' +
            '<input type="range" id="bgBlurSlider" min="0" max="30" value="' + (bgData.blur || 0) + '">' +
            '<span class="bg-slider-val" id="bgBlurVal">' + (bgData.blur || 0) + 'px</span>' +
          '</div>' +

          '<div class="bg-slider-row">' +
            '<span class="bg-slider-label">变暗</span>' +
            '<input type="range" id="bgDarkSlider" min="0" max="80" value="' + (bgData.dark || 0) + '">' +
            '<span class="bg-slider-val" id="bgDarkVal">' + (bgData.dark || 0) + '%</span>' +
          '</div>' +

          '<div class="bg-btn-row">' +
            '<button class="bg-btn bg-btn-apply" id="bgApplyBtn" type="button">应用背景</button>' +
            '<button class="bg-btn bg-btn-remove" id="bgRemoveBtn" type="button">移除</button>' +
          '</div>' +

          '<div class="bg-divider"></div>' +

          /* 上侧图标样式 */
          '<div class="bg-section-label">上侧图标样式</div>' +

          '<div class="bg-slider-row">' +
            '<span class="bg-slider-label">边框</span>' +
            '<input type="range" id="bgIconBorderSlider" min="0" max="6" step="0.5" value="' + iconConfig.borderW + '">' +
            '<span class="bg-slider-val" id="bgIconBorderVal">' + iconConfig.borderW + 'px</span>' +
          '</div>' +

          '<div class="bg-slider-row">' +
            '<span class="bg-slider-label">阴影</span>' +
            '<input type="range" id="bgIconShadowSlider" min="0" max="16" step="1" value="' + iconConfig.shadow + '">' +
            '<span class="bg-slider-val" id="bgIconShadowVal">' + iconConfig.shadow + 'px</span>' +
          '</div>' +

          '<div class="bg-color-row">' +
            '<span class="bg-slider-label">颜色</span>' +
            '<div class="bg-color-dot" id="bgColorDot" style="background:' + iconConfig.borderColor + ';"></div>' +
            '<button class="bg-btn-reset" id="bgResetColorBtn" type="button">恢复默认</button>' +
          '</div>' +

          '<div class="bg-divider"></div>' +

          /* 图标替换 */
          '<div class="bg-section-label">替换图标</div>' +
          '<div class="bg-icon-grid" id="bgIconGrid"></div>' +

          '<div class="bg-bottom-spacer"></div>' +
        '</div>';

      Bg.renderIconGrid(panel);
      Bg.bindEvents(panel, bgData, iconConfig);

      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    close: function() {
      var panel = App.$('#bgPanel'); if(!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderIconGrid: function(panel) {
      var grid = panel.querySelector('#bgIconGrid'); if(!grid) return;

      function getOrigSrc(selector) {
        var el = document.querySelector(selector);
        return el ? el.getAttribute('src') : '';
      }

      var icons = [
        { id: 'customIcon_cg', label: '查岗', target: '#cardIcon1 img', def: getOrigSrc('#cardIcon1 img') },
        { id: 'customIcon_lt', label: '论坛', target: '#cardIcon2 img', def: getOrigSrc('#cardIcon2 img') },
        { id: 'customIcon_dockMine', label: 'User', target: '#dockMine img', def: getOrigSrc('#dockMine img') },
        { id: 'customIcon_dockLong', label: 'Char', target: '#dockLong img', def: getOrigSrc('#dockLong img') },
        { id: 'customIcon_dockShort', label: '聊天', target: '#dockShort img', def: getOrigSrc('#dockShort img') },
        { id: 'customIcon_dockCheck', label: '线下', target: '#dockCheck img', def: getOrigSrc('#dockCheck img') }
      ];

      grid.innerHTML = icons.map(function(ic) {
        var src = App.LS.get(ic.id) || ic.def;
        return '<div class="bg-icon-item" data-icon-id="' + ic.id + '" data-icon-target="' + App.escAttr(ic.target) + '" data-icon-def="' + App.escAttr(ic.def) + '">' +
          '<div class="bg-icon-thumb"><img src="' + App.escAttr(src) + '" draggable="false"></div>' +
          '<div class="bg-icon-label">' + ic.label + '</div>' +
        '</div>';
      }).join('');

      grid.querySelectorAll('.bg-icon-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var iconId = item.dataset.iconId;
          var target = item.dataset.iconTarget;
          var def = item.dataset.iconDef;
          Bg.showIconMenu(iconId, target, def, item, panel);
        });
      });
    },

    showIconMenu: function(iconId, target, def, itemEl, panel) {
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
          e.stopPropagation();
          var act = btn.dataset.act;
          menu.remove();
          if(act === 'cancel') return;
          if(act === 'reset') {
            App.LS.remove(iconId);
            var tEl = document.querySelector(target); if(tEl) tEl.src = def;
            var thumb = itemEl.querySelector('img'); if(thumb) thumb.src = def;
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
                  var tEl = document.querySelector(target); if(tEl) tEl.src = c;
                  var thumb = itemEl.querySelector('img'); if(thumb) thumb.src = c;
                  App.showToast('图标已更换');
                };
                if(App.cropImage) App.cropImage(r.target.result, process);
                else process(r.target.result);
              };
              rd.readAsDataURL(f);
            };
            ipt.click();
          }
        });
      });
    },

    bindEvents: function(panel, bgData, iconConfig) {
      // 关闭
      panel.querySelector('#bgCloseBtn').addEventListener('click', function() { Bg.close(); });

      // 上传背景
      var fileInput = panel.querySelector('#bgFileInput');
      panel.querySelector('#bgUploadArea').addEventListener('click', function() { fileInput.click(); });
      fileInput.addEventListener('change', function(e) {
        var f = e.target.files[0]; if(!f) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var process = function(src) {
            Bg._tempSrc = src;
            // 实时预览
            var d = { src: src, blur: parseInt(panel.querySelector('#bgBlurSlider').value), dark: parseInt(panel.querySelector('#bgDarkSlider').value) };
            Bg.applyBg(d);
            panel.querySelector('#bgUploadArea span').textContent = '更换图片';
            App.showToast('已预览，点"应用背景"保存');
          };
          if(App.cropImage) App.cropImage(ev.target.result, process);
          else process(ev.target.result);
        };
        reader.readAsDataURL(f);
        e.target.value = '';
      });

      // 虚化 + 变暗 滑块（实时预览）
      function previewBg() {
        var blur = parseInt(panel.querySelector('#bgBlurSlider').value);
        var dark = parseInt(panel.querySelector('#bgDarkSlider').value);
        panel.querySelector('#bgBlurVal').textContent = blur + 'px';
        panel.querySelector('#bgDarkVal').textContent = dark + '%';
        var src = Bg._tempSrc || (App.LS.get('bgData') || {}).src || '';
        if(src) Bg.applyBg({ src: src, blur: blur, dark: dark });
      }
      panel.querySelector('#bgBlurSlider').addEventListener('input', previewBg);
      panel.querySelector('#bgDarkSlider').addEventListener('input', previewBg);

      // 应用背景
      panel.querySelector('#bgApplyBtn').addEventListener('click', function() {
        var src = Bg._tempSrc || (App.LS.get('bgData') || {}).src || '';
        if(!src) { App.showToast('请先上传图片'); return; }
        var d = {
          src: src,
          blur: parseInt(panel.querySelector('#bgBlurSlider').value),
          dark: parseInt(panel.querySelector('#bgDarkSlider').value)
        };
        try {
          App.LS.set('bgData', d);
          Bg.applyBg(d);
          App.showToast('背景已应用');
        } catch(e) {
          App.showToast('图片太大，请用更小的图或URL');
        }
      });

      // 移除背景
      panel.querySelector('#bgRemoveBtn').addEventListener('click', function() {
        App.LS.remove('bgData');
        Bg._tempSrc = '';
        Bg.applyBg({});
        panel.querySelector('#bgBlurSlider').value = 0;
        panel.querySelector('#bgDarkSlider').value = 0;
        panel.querySelector('#bgBlurVal').textContent = '0px';
        panel.querySelector('#bgDarkVal').textContent = '0%';
        panel.querySelector('#bgUploadArea span').textContent = '上传图片';
        App.showToast('背景已移除');
      });

      // 图标边框 + 阴影
      function updateIconStyle() {
        var bw = parseFloat(panel.querySelector('#bgIconBorderSlider').value);
        var sw = parseInt(panel.querySelector('#bgIconShadowSlider').value);
        panel.querySelector('#bgIconBorderVal').textContent = bw + 'px';
        panel.querySelector('#bgIconShadowVal').textContent = sw + 'px';
        iconConfig.borderW = bw;
        iconConfig.shadow = sw;
        App.LS.set('topIconConfig', iconConfig);
        Bg.applyTopIconStyle(iconConfig);
      }
      panel.querySelector('#bgIconBorderSlider').addEventListener('input', updateIconStyle);
      panel.querySelector('#bgIconShadowSlider').addEventListener('input', updateIconStyle);

      // 颜色
      panel.querySelector('#bgColorDot').addEventListener('click', function(e) {
        e.stopPropagation();
        if(!App.openColorPicker) return;
        App.openColorPicker(iconConfig.borderColor, function(hex) {
          iconConfig.borderColor = hex; iconConfig.shadowColor = hex;
          panel.querySelector('#bgColorDot').style.background = hex;
          App.LS.set('topIconConfig', iconConfig);
          Bg.applyTopIconStyle(iconConfig);
        }, function(hex) {
          iconConfig.borderColor = hex; iconConfig.shadowColor = hex;
          panel.querySelector('#bgColorDot').style.background = hex;
          Bg.applyTopIconStyle(iconConfig);
        });
      });

      // 恢复默认颜色
      panel.querySelector('#bgResetColorBtn').addEventListener('click', function() {
        iconConfig.borderColor = '#dcebff'; iconConfig.shadowColor = '#dcebff';
        iconConfig.borderW = 1; iconConfig.shadow = 0;
        panel.querySelector('#bgColorDot').style.background = '#dcebff';
        panel.querySelector('#bgIconBorderSlider').value = 1;
        panel.querySelector('#bgIconShadowSlider').value = 0;
        panel.querySelector('#bgIconBorderVal').textContent = '1px';
        panel.querySelector('#bgIconShadowVal').textContent = '0px';
        App.LS.set('topIconConfig', iconConfig);
        Bg.applyTopIconStyle(iconConfig);
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
      var bColor = cfg.borderColor || '#dcebff';
      var sColor = cfg.shadowColor || '#dcebff';
      styleEl.innerHTML =
        '.card-icon-img { border: ' + cfg.borderW + 'px solid ' + bColor + ' !important; box-shadow: ' + cfg.shadow + 'px ' + cfg.shadow + 'px 0 ' + sColor + ' !important; border-radius: 15px !important; }';
    }
  };

  App.register('bg', Bg);
})();