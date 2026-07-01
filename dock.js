
(function() {
  'use strict';
  var App = window.App; if (!App) return;

  var DEF_CFG = { bgColor: '#ffffff', bgAlpha: 70, blur: 20, dockBorderColor: '#fff', dockBorderW: 0 };

  var Dock = {
    config: {},
    load: function() {
      Dock.config = App.LS.get('dockConfig') || JSON.parse(JSON.stringify(DEF_CFG));
    },
    saveConfig: function() { App.LS.set('dockConfig', Dock.config); },
    applyConfig: function(c) {
      c = c || Dock.config;
      var dockBar = App.$('#dockBar');
      if (!dockBar) return;

      var style = document.getElementById('dockCustomStyle');
      if (!style) { style = document.createElement('style'); style.id = 'dockCustomStyle'; document.head.appendChild(style); }
      
      var hexToRgb = function(hex) {
        if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        var r = parseInt(hex.slice(1, 3), 16) || 255, g = parseInt(hex.slice(3, 5), 16) || 255, b = parseInt(hex.slice(5, 7), 16) || 255;
        return r + ',' + g + ',' + b;
      };
      var bgRgb = hexToRgb(c.bgColor);
      var dbc = c.dockBorderColor || '#fff';
      var dbw = c.dockBorderW != null ? c.dockBorderW : 0;
      style.innerHTML = 
        '#dockBar { background: rgba(' + bgRgb + ',' + (c.bgAlpha / 100) + ') !important; backdrop-filter: blur(' + c.blur + 'px) !important; -webkit-backdrop-filter: blur(' + c.blur + 'px) !important; border: ' + dbw + 'px solid ' + dbc + ' !important; }' +
        '.dock-item { -webkit-touch-callout: none !important; -webkit-user-select: none !important; user-select: none !important; }' +
        '.mk-card img { pointer-events: none !important; -webkit-user-drag: none !important; }';
    },
    openEdit: function() {
      var old = App.$('#dockEditOverlay'); if (old) old.remove();
      var cfgSnapshot = JSON.parse(JSON.stringify(Dock.config));
      var cfg = JSON.parse(JSON.stringify(Dock.config));

      var overlay = document.createElement('div'); overlay.id = 'dockEditOverlay'; overlay.className = 'pc-edit-overlay';
      var panel = document.createElement('div'); panel.className = 'pc-edit-panel';

      panel.innerHTML =
        '<div class="pc-header">底部栏设置<div class="pc-close-btn" id="dockCloseBtnTop">×</div></div>' +
        '<div class="pc-body" style="flex-direction:column;gap:12px;">' +

          '<div class="pc-group">' +
            '<span class="pc-label">栏边框颜色</span>' +
            '<div class="pc-palette-grid" style="grid-template-columns: repeat(1, 1fr);">' +
              '<div class="pc-palette-item"><div class="pc-dot" id="dockDotDockBorder" style="background:' + (cfg.dockBorderColor || '#fff') + ';"></div><span class="pc-dot-lbl">边框色</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="pc-group"><span class="pc-label">栏边框粗细</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockDockBorderW" min="0" max="5" step="0.5" value="' + (cfg.dockBorderW != null ? cfg.dockBorderW : 0) + '"><span class="pc-slider-val" id="dockDockBorderWVal">' + (cfg.dockBorderW != null ? cfg.dockBorderW : 0) + 'px</span></div></div>' +
          '<div class="pc-group"><span class="pc-label">背景透明度</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockAlpha" min="0" max="100" value="' + cfg.bgAlpha + '"><span class="pc-slider-val" id="dockAlphaVal">' + cfg.bgAlpha + '%</span></div></div>' +
          '<div class="pc-group"><span class="pc-label">毛玻璃模糊度</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockBlur" min="0" max="50" value="' + cfg.blur + '"><span class="pc-slider-val" id="dockBlurVal">' + cfg.blur + 'px</span></div></div>' +

        '</div>' +
        '<div class="pc-footer">' +
          '<button class="pc-btn pc-btn-save" id="dockSaveBtn" type="button">保 存</button>' +
          '<button class="pc-btn pc-btn-cancel" id="dockResetBtn" type="button">重 置</button>' +
        '</div>';

      overlay.appendChild(panel); document.body.appendChild(overlay);
      var dockRect = App.$('#dockBar').getBoundingClientRect();
      var top = dockRect.top - 350;
      if (top < 10) top = 10;
      panel.style.left = Math.max(10, (window.innerWidth / 2 - 140)) + 'px';
      panel.style.top = top + 'px';
      if (App.modules.cards && App.modules.cards._bindPanelDrag) App.modules.cards._bindPanelDrag(panel);

      function preview() { Dock.applyConfig(cfg); }
      function closeAndRevert() { Dock.applyConfig(cfgSnapshot); overlay.remove(); }

      panel.querySelector('#dockCloseBtnTop').addEventListener('click', function(e) { e.stopPropagation(); closeAndRevert(); });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) closeAndRevert(); });

      var sliderMap = [
        { id: 'dockDockBorderW', valId: 'dockDockBorderWVal', key: 'dockBorderW', unit: 'px' },
        { id: 'dockAlpha', valId: 'dockAlphaVal', key: 'bgAlpha', unit: '%' },
        { id: 'dockBlur', valId: 'dockBlurVal', key: 'blur', unit: 'px' }
      ];

      sliderMap.forEach(function(s) {
        var slider = panel.querySelector('#' + s.id);
        var valEl = panel.querySelector('#' + s.valId);
        if (slider) {
          slider.addEventListener('input', function() {
            var v = parseFloat(this.value);
            valEl.textContent = v + s.unit;
            cfg[s.key] = v;
            preview();
          });
        }
      });

      panel.querySelector('#dockDotDockBorder').addEventListener('click', function(e) {
        e.stopPropagation(); if (!App.openColorPicker) return;
        App.openColorPicker(cfg.dockBorderColor, function(hex) {
          cfg.dockBorderColor = hex;
          panel.querySelector('#dockDotDockBorder').style.background = hex;
          preview();
        }, function(hex) {
          cfg.dockBorderColor = hex;
          panel.querySelector('#dockDotDockBorder').style.background = hex;
          preview();
        }, 'dock_dockBorder');
      });

      panel.querySelector('#dockResetBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        cfg = JSON.parse(JSON.stringify(DEF_CFG));
        panel.querySelector('#dockDotDockBorder').style.background = cfg.dockBorderColor;
        panel.querySelector('#dockDockBorderW').value = cfg.dockBorderW;
        panel.querySelector('#dockDockBorderWVal').textContent = cfg.dockBorderW + 'px';
        panel.querySelector('#dockAlpha').value = cfg.bgAlpha;
        panel.querySelector('#dockAlphaVal').textContent = cfg.bgAlpha + '%';
        panel.querySelector('#dockBlur').value = cfg.blur;
        panel.querySelector('#dockBlurVal').textContent = cfg.blur + 'px';
        preview();
        App.showToast('已恢复默认');
      });

      panel.querySelector('#dockSaveBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        Dock.config = cfg;
        Dock.saveConfig();
        overlay.remove();
        App.showToast('设置已保存');
      });
    },
    init: function() {
      Dock.load();
      Dock.applyConfig();

      var dockBar = App.$('#dockBar');
      if (dockBar) {
        var dTimer = null, dLongPressed = false, dStartX, dStartY;
        dockBar.addEventListener('touchstart', function(e) {
          if (e.target.closest('.dock-item')) return;
          e.preventDefault();
          var t = e.touches[0]; dStartX = t.clientX; dStartY = t.clientY; dLongPressed = false;
          dTimer = setTimeout(function() { dLongPressed = true; if (navigator.vibrate) navigator.vibrate(15); Dock.openEdit(); }, 600);
        }, { passive: false });
        dockBar.addEventListener('touchmove', function(e) {
          if (dTimer && !dLongPressed) { var t = e.touches[0]; if (Math.abs(t.clientX - dStartX) > 8 || Math.abs(t.clientY - dStartY) > 8) { clearTimeout(dTimer); dTimer = null; } }
        }, { passive: true });
        dockBar.addEventListener('touchend', function() { clearTimeout(dTimer); dTimer = null; });
      }
    }
  };
  App.register('dock', Dock);
})();
