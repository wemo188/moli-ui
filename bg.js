(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Bg = {
    bgData: null,

    applyBg: function(data) {
      if (!data || !data.url) return;
      var layer = App.$('#bgLayer');
      if (!layer) return;
      layer.style.backgroundImage = 'url(' + data.url + ')';
      var blur = parseInt(data.blur, 10) || 0;
      layer.style.filter = 'blur(' + blur + 'px)';
      layer.style.inset = blur > 0 ? ('-' + (blur * 2) + 'px') : '0';
      layer.style.setProperty('--bg-overlay-alpha', (parseInt(data.dark, 10) || 30) / 100);
    },

    bindEvents: function() {
      App.safeOn('#bgUploadArea', 'click', function() {
        if (App.$('#bgFileInput')) App.$('#bgFileInput').click();
      });

      App.safeOn('#bgFileInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var u = ev.target.result;
          if (App.$('#bgPreviewImg')) App.$('#bgPreviewImg').src = u;
          if (App.$('#bgPreview')) App.$('#bgPreview').classList.remove('hidden');
          Bg.bgData = { url: u };
        };
        reader.readAsDataURL(file);
      });

      App.safeOn('#bgBlur', 'input', function(e) {
        if (App.$('#bgBlurVal')) App.$('#bgBlurVal').textContent = e.target.value + 'px';
      });

      App.safeOn('#bgDark', 'input', function(e) {
        if (App.$('#bgDarkVal')) App.$('#bgDarkVal').textContent = e.target.value + '%';
      });

      App.safeOn('#applyBgBtn', 'click', function() {
        if (!Bg.bgData) {
          App.showToast('请先上传图片');
          return;
        }
        Bg.bgData.blur = App.$('#bgBlur') ? App.$('#bgBlur').value : '0';
        Bg.bgData.dark = App.$('#bgDark') ? App.$('#bgDark').value : '30';
        Bg.applyBg(Bg.bgData);
        App.LS.set('bgData', Bg.bgData);
        App.showToast('背景已应用');
      });

      App.safeOn('#removeBgBtn', 'click', function() {
        Bg.bgData = null;
        App.LS.remove('bgData');
        var l = App.$('#bgLayer');
        if (l) {
          l.style.backgroundImage = 'none';
          l.style.filter = '';
          l.style.inset = '0';
          l.style.setProperty('--bg-overlay-alpha', '0');
        }
        if (App.$('#bgPreview')) App.$('#bgPreview').classList.add('hidden');
        App.showToast('背景已移除');
      });
    },

    init: function() {
      Bg.bgData = App.LS.get('bgData') || null;
      App.bg = Bg;

      if (Bg.bgData) {
        Bg.applyBg(Bg.bgData);
        if (Bg.bgData.url && App.$('#bgPreviewImg') && App.$('#bgPreview')) {
          App.$('#bgPreviewImg').src = Bg.bgData.url;
          App.$('#bgPreview').classList.remove('hidden');
        }
        if (Bg.bgData.blur && App.$('#bgBlur') && App.$('#bgBlurVal')) {
          App.$('#bgBlur').value = Bg.bgData.blur;
          App.$('#bgBlurVal').textContent = Bg.bgData.blur + 'px';
        }
        if (Bg.bgData.dark && App.$('#bgDark') && App.$('#bgDarkVal')) {
          App.$('#bgDark').value = Bg.bgData.dark;
          App.$('#bgDarkVal').textContent = Bg.bgData.dark + '%';
        }
      }

      Bg.bindEvents();
    }
  };

  App.register('bg', Bg);
})();
