(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Workshop = {

    open: function() {
      App.closeMenu();

      var old = App.$('#workshopCard');
      if (old) { old.remove(); return; }

      var rect = App.getBallRect();
      var panel = document.createElement('div');
      panel.id = 'workshopCard';
      panel.className = 'workshop-card';

      panel.innerHTML =
        '<div class="workshop-title">✦ 美化工坊</div>' +

        '<div class="workshop-item" id="wsWeather">' +
          '<svg viewBox="0 0 24 24"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="5"/></svg>' +
          '<div class="workshop-item-info"><div class="workshop-item-label">天气栏</div><div class="workshop-item-desc">调节天气卡片样式</div></div>' +
        '</div>' +

        '<div class="workshop-item" id="wsEden">' +
          '<svg viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>' +
          '<div class="workshop-item-info"><div class="workshop-item-label">文字卡片</div><div class="workshop-item-desc">调节伊甸文字样式</div></div>' +
        '</div>' +

        '<div class="workshop-item" id="wsFrost">' +
          '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>' +
          '<div class="workshop-item-info"><div class="workshop-item-label">磨砂卡片</div><div class="workshop-item-desc">调节第二页磨砂效果</div></div>' +
        '</div>';

      // 定位：球的左边或右边
      var ballCX = rect.left + rect.width / 2;
      if (ballCX > window.innerWidth / 2) {
        panel.style.right = (window.innerWidth - rect.left + 10) + 'px';
        panel.style.left = 'auto';
      } else {
        panel.style.left = (rect.right + 10) + 'px';
        panel.style.right = 'auto';
      }

      var panelH = 240;
      var panelTop = rect.top + rect.height / 2 - panelH / 2;
      if (panelTop < 10) panelTop = 10;
      if (panelTop + panelH > window.innerHeight - 10) panelTop = window.innerHeight - panelH - 10;
      panel.style.top = panelTop + 'px';

      document.body.appendChild(panel);
      requestAnimationFrame(function() { panel.classList.add('show'); });

      // 阻止触摸传播到页面滑动
      panel.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: false });
      panel.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: false });

      // 天气栏
      App.$('#wsWeather').addEventListener('click', function() {
        Workshop.close();
        setTimeout(function() {
          if (App.calendar) App.calendar.openCtrl();
        }, 220);
      });

      // 文字卡片
      App.$('#wsEden').addEventListener('click', function() {
        Workshop.close();
        setTimeout(function() {
          if (App.modules.eden) App.modules.eden.openEdit();
        }, 220);
      });

      // 磨砂卡片
      App.$('#wsFrost').addEventListener('click', function() {
        Workshop.close();
        setTimeout(function() {
          if (App.modules.frost) App.modules.frost.openEdit();
        }, 220);
      });

      // 点外面关闭
      setTimeout(function() {
        function dismiss(e) {
          if (panel.contains(e.target)) return;
          Workshop.close();
          document.removeEventListener('touchstart', dismiss, true);
          document.removeEventListener('click', dismiss);
        }
        document.addEventListener('touchstart', dismiss, true);
        document.addEventListener('click', dismiss);
      }, 100);
    },

    close: function() {
      var panel = App.$('#workshopCard');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { if (panel.parentNode) panel.remove(); }, 220);
    },

    init: function() {
      // 以后可以在这里加载全局美化配置
    }
  };

  App.workshop = Workshop;
  App.register('workshop', Workshop);
})();
