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
        '</div>' +

        '<div style="height:1px;background:rgba(0,0,0,0.06);margin:8px 0;"></div>' +

        '<div class="workshop-item" id="wsResetLayout">' +
          '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>' +
          '<div class="workshop-item-info"><div class="workshop-item-label">恢复布局</div><div class="workshop-item-desc">所有卡片回到默认位置</div></div>' +
        '</div>';

      var ballCX = rect.left + rect.width / 2;
      if (ballCX > window.innerWidth / 2) {
        panel.style.right = (window.innerWidth - rect.left + 10) + 'px';
        panel.style.left = 'auto';
      } else {
        panel.style.left = (rect.right + 10) + 'px';
        panel.style.right = 'auto';
      }

      var panelH = 300;
      var panelTop = rect.top + rect.height / 2 - panelH / 2;
      if (panelTop < 10) panelTop = 10;
      if (panelTop + panelH > window.innerHeight - 10) panelTop = window.innerHeight - panelH - 10;
      panel.style.top = panelTop + 'px';

      document.body.appendChild(panel);
      requestAnimationFrame(function() { panel.classList.add('show'); });

      panel.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: false });
      panel.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: false });

      App.$('#wsWeather').addEventListener('click', function() {
        Workshop.close();
        setTimeout(function() { if (App.calendar) App.calendar.openCtrl(); }, 220);
      });

      App.$('#wsEden').addEventListener('click', function() {
        Workshop.close();
        setTimeout(function() { if (App.modules.eden) App.modules.eden.openEdit(); }, 220);
      });

      App.$('#wsFrost').addEventListener('click', function() {
        Workshop.close();
        setTimeout(function() { if (App.modules.frost) App.modules.frost.openEdit(); }, 220);
      });

      App.$('#wsResetLayout').addEventListener('click', function() {
        Workshop.close();
        setTimeout(function() { Workshop.resetAllLayout(); }, 220);
      });

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

    resetAllLayout: function() {
      // 天气卡片
      App.LS.remove('wtCardPos');
if (App.calendar) {
    App.calendar._dragOffsetX = 0;
    App.calendar._dragOffsetY = 0;
}
var wtCard = App.$('#wtCard');
if (wtCard) wtCard.style.transform = '';

      // 人物卡片
      if (App.modules.cards) {
        App.modules.cards.resetAllPositions();
      }

      // 伊甸文字卡片（如果有拖拽的话）
      App.LS.remove('edenDragOffset');
      var edenCard = App.$('#edenCard');
      if (edenCard) edenCard.style.transform = '';

      App.showToast('所有布局已恢复默认');
    },

    init: function() {}
  };

  App.workshop = Workshop;
  App.register('workshop', Workshop);
})();
