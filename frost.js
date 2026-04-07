(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Frost = {
    data: {},

    load: function() {
      Frost.data = App.LS.get('frostCard') || {
        color: 'rgba(255,255,255,0.25)',
        blur: 12,
        text: ''
      };
    },

    save: function() {
      App.LS.set('frostCard', Frost.data);
    },

    apply: function() {
      var el = App.$('#frostCard');
      if (!el) return;

      el.style.background = Frost.data.color;
      el.style.backdropFilter = 'blur(' + Frost.data.blur + 'px)';
      el.style.webkitBackdropFilter = 'blur(' + Frost.data.blur + 'px)';

      el.innerHTML = Frost.data.text
        ? '<div class="frost-card-text">' + App.esc(Frost.data.text) + '</div>'
        : '';
    },

    openEdit: function() {
      var old = App.$('#frostEditOverlay');
      if (old) old.remove();

      var overlay = document.createElement('div');
      overlay.id = 'frostEditOverlay';
      overlay.className = 'pc-edit-overlay';
      overlay.innerHTML =
        '<div class="pc-edit-panel">' +
          '<div class="pc-edit-title">磨砂卡片设置</div>' +

          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">背景颜色</label>' +
            '<input type="color" class="pc-edit-input" id="frostColor" value="#ffffff" style="height:44px;padding:4px;">' +
          '</div>' +

          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">透明度 <span id="frostAlphaVal">' + Math.round((Frost.data.alpha || 0.25) * 100) + '%</span></label>' +
            '<input type="range" id="frostAlpha" min="0" max="100" value="' + Math.round((Frost.data.alpha || 0.25) * 100) + '" style="width:100%;">' +
          '</div>' +

          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">模糊度 <span id="frostBlurVal">' + Frost.data.blur + 'px</span></label>' +
            '<input type="range" id="frostBlur" min="0" max="40" value="' + Frost.data.blur + '" style="width:100%;">' +
          '</div>' +

          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">文字（选填）</label>' +
            '<input type="text" class="pc-edit-input" id="frostText" placeholder="卡片上显示的文字..." value="' + App.esc(Frost.data.text || '') + '">' +
          '</div>' +

          '<div class="pc-edit-btns">' +
            '<button class="pc-edit-save" id="frostSaveBtn" type="button">保存</button>' +
            '<button class="pc-edit-cancel" id="frostCancelBtn" type="button">取消</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      var colorInput = App.$('#frostColor');
      var alphaInput = App.$('#frostAlpha');
      var blurInput = App.$('#frostBlur');

      // 实时预览
      function preview() {
        var hex = colorInput.value;
        var r = parseInt(hex.substr(1,2),16);
        var g = parseInt(hex.substr(3,2),16);
        var b = parseInt(hex.substr(5,2),16);
        var a = parseInt(alphaInput.value) / 100;
        var blur = parseInt(blurInput.value);

        App.$('#frostAlphaVal').textContent = alphaInput.value + '%';
        App.$('#frostBlurVal').textContent = blur + 'px';

        var el = App.$('#frostCard');
        if (el) {
          el.style.background = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
          el.style.backdropFilter = 'blur(' + blur + 'px)';
          el.style.webkitBackdropFilter = 'blur(' + blur + 'px)';
        }
      }

      colorInput.addEventListener('input', preview);
      alphaInput.addEventListener('input', preview);
      blurInput.addEventListener('input', preview);

      App.$('#frostSaveBtn').addEventListener('click', function() {
        var hex = colorInput.value;
        var r = parseInt(hex.substr(1,2),16);
        var g = parseInt(hex.substr(3,2),16);
        var b = parseInt(hex.substr(5,2),16);
        var a = parseInt(alphaInput.value) / 100;
        var blur = parseInt(blurInput.value);

        Frost.data = {
          color: 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')',
          alpha: a,
          blur: blur,
          text: App.$('#frostText').value.trim()
        };
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
