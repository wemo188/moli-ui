(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Frost = {
    data: {},

    DEFAULTS: {
      mode: 'frost',
      hex: '#ffffff',
      alpha: 0,
      blur: 12,
      text: ''
    },

    load: function() {
      var saved = App.LS.get('frostCard');
      Frost.data = {};
      var d = Frost.DEFAULTS;
      if (saved) {
        Frost.data.mode = saved.mode || d.mode;
        Frost.data.hex = saved.hex || d.hex;
        Frost.data.alpha = saved.alpha != null ? saved.alpha : d.alpha;
        Frost.data.blur = saved.blur != null ? saved.blur : d.blur;
        Frost.data.text = saved.text || '';
      } else {
        Frost.data = JSON.parse(JSON.stringify(d));
      }
    },

    save: function() {
      App.LS.set('frostCard', Frost.data);
    },

    buildBg: function(data) {
      var hex = data.hex || '#ffffff';
      var r = parseInt(hex.substr(1, 2), 16);
      var g = parseInt(hex.substr(3, 2), 16);
      var b = parseInt(hex.substr(5, 2), 16);
      var a = (data.alpha || 0) / 100;
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    },

    applyToEl: function(el, data) {
      if (!el) return;
      var bg = Frost.buildBg(data);
      var blurVal = Math.max(0, data.blur);
      var filter = 'blur(' + blurVal + 'px)';

      el.style.background = bg;
      el.style.backdropFilter = filter;
      el.style.webkitBackdropFilter = filter;

      if (data.mode === 'glass') {
        el.style.borderColor = 'rgba(255,255,255,0.5)';
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.15)';
      } else if (data.mode === 'gaussian') {
        el.style.borderColor = 'rgba(255,255,255,0.2)';
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
      } else {
        el.style.borderColor = 'rgba(255,255,255,0.4)';
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
      }

      el.innerHTML = data.text
        ? '<div class="frost-card-text">' + App.esc(data.text) + '</div>'
        : '';
    },

    apply: function() {
      Frost.applyToEl(App.$('#frostCard'), Frost.data);
    },

    openEdit: function() {
      var old = App.$('#frostEditOverlay');
      if (old) old.remove();

      var d = Frost.data;

      var presets = {
        frost:    { blur: 12,  alpha: 0 },
        gaussian: { blur: 80,  alpha: 0 },
        glass:    { blur: 24,  alpha: 18 }
      };

      var overlay = document.createElement('div');
      overlay.id = 'frostEditOverlay';
      overlay.className = 'pc-edit-overlay';
      overlay.innerHTML =
        '<div class="pc-edit-panel">' +
          '<div class="pc-edit-title">磨砂卡片设置</div>' +

          '<div class="frost-mode-switch">' +
            '<button class="frost-mode-btn' + (d.mode === 'frost' ? ' active' : '') + '" data-mode="frost" type="button">磨砂</button>' +
            '<button class="frost-mode-btn' + (d.mode === 'gaussian' ? ' active' : '') + '" data-mode="gaussian" type="button">高斯模糊</button>' +
            '<button class="frost-mode-btn' + (d.mode === 'glass' ? ' active' : '') + '" data-mode="glass" type="button">毛玻璃</button>' +
          '</div>' +

          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">背景颜色</label>' +
            '<input type="color" class="pc-edit-input" id="frostHex" value="' + (d.hex || '#ffffff') + '" style="height:44px;padding:4px;">' +
          '</div>' +

          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">透明度</label>' +
            '<div class="frost-slider-row">' +
              '<input type="range" id="frostAlpha" min="0" max="100" value="' + d.alpha + '">' +
              '<span class="frost-slider-val" id="frostAlphaVal">' + d.alpha + '%</span>' +
            '</div>' +
          '</div>' +

          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">模糊度</label>' +
            '<div class="frost-slider-row">' +
              '<input type="range" id="frostBlur" min="-200" max="200" value="' + d.blur + '">' +
              '<span class="frost-slider-val" id="frostBlurVal">' + d.blur + 'px</span>' +
            '</div>' +
          '</div>' +

          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">文字（选填）</label>' +
            '<input type="text" class="pc-edit-input" id="frostText" placeholder="卡片上显示的文字..." value="' + App.esc(d.text || '') + '">' +
          '</div>' +

          '<div class="pc-edit-btns">' +
            '<button class="pc-edit-save" id="frostSaveBtn" type="button">保存</button>' +
            '<button class="pc-edit-cancel" id="frostCancelBtn" type="button">取消</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      var currentMode = d.mode || 'frost';

      function getCurrent() {
        return {
          mode: currentMode,
          hex: App.$('#frostHex').value,
          alpha: parseInt(App.$('#frostAlpha').value),
          blur: parseInt(App.$('#frostBlur').value),
          text: App.$('#frostText').value.trim()
        };
      }

      function updateLabels() {
        App.$('#frostAlphaVal').textContent = App.$('#frostAlpha').value + '%';
        App.$('#frostBlurVal').textContent = App.$('#frostBlur').value + 'px';
      }

      function preview() {
        updateLabels();
        Frost.applyToEl(App.$('#frostCard'), getCurrent());
      }

      function setSliders(p) {
        App.$('#frostAlpha').value = p.alpha;
        App.$('#frostBlur').value = p.blur;
        updateLabels();
        preview();
      }

      overlay.querySelectorAll('.frost-mode-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          overlay.querySelectorAll('.frost-mode-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          currentMode = btn.dataset.mode;
          setSliders(presets[currentMode]);
        });
      });

      ['frostHex', 'frostAlpha', 'frostBlur'].forEach(function(id) {
        App.$('#' + id).addEventListener('input', preview);
      });

      App.$('#frostSaveBtn').addEventListener('click', function() {
        Frost.data = getCurrent();
        Frost.save();
        Frost.apply();
        overlay.remove();
        App.showToast('已保存');
      });

      App.$('#frostCancelBtn').addEventListener('click', function() {
        Frost.apply();
        overlay.remove();
      });

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          Frost.apply();
          overlay.remove();
        }
      });
    },

    init: function() {
      Frost.load();
      Frost.apply();

      var el = App.$('#frostCard');
      if (el) {
        el.addEventListener('click', function() {
          Frost.openEdit();
        });
      }
    }
  };

  App.register('frost', Frost);
})();
