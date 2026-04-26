
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var PG0_W = 260;
  var PG1_W = 260;

  function tkBlack(action, cn, en) {
    return '<div class="bm-tk" data-action="' + action + '">' +
      '<div class="bm-tk-body"><div class="bm-tk-inner"></div>' +
      '<span class="bm-tk-spade">\u2660</span>' +
      '<div class="bm-tk-text">' + cn + '</div>' +
      '<div class="bm-tk-line"></div>' +
      '<div class="bm-tk-sub">' + en + '</div>' +
      '</div></div>';
  }

  function tkWhite(action, cn, en) {
    return '<div class="bm-wk" data-action="' + action + '">' +
      '<div class="bm-wk-body"><div class="bm-wk-inner"></div>' +
      '<span class="bm-wk-spade">\u2660</span>' +
      '<div class="bm-wk-text">' + cn + '</div>' +
      '<div class="bm-wk-line"></div>' +
      '<div class="bm-wk-sub">' + en + '</div>' +
      '</div></div>';
  }

  var Workshop = {
    menuEl: null,
    sliderEl: null,
    currentPage: 0,
    isOpen: false,
    pages: [],
    _touch: null,

    getPageWidth: function(idx) {
      return idx === 0 ? PG0_W : PG1_W;
    },

    getPageOffset: function(idx) {
      var o = 0;
      for (var i = 0; i < idx; i++) {
        o += Workshop.getPageWidth(i);
      }
      return o;
    },

    createMenu: function() {
      if (Workshop.menuEl && Workshop.menuEl.parentNode) return;
      Workshop.menuEl = null;
      Workshop.sliderEl = null;

      var menu = document.createElement('div');
      menu.id = 'ballCardMenu';
      menu.className = 'ball-card-menu';

      menu.innerHTML =
        '<div class="ball-card-slider" id="ballCardSlider">' +'<div class="ball-card-page" data-page="0" style="width:' + PG0_W + 'px">' +
            '<div class="bm-card bm-card-deco">' +
              '<div class="bm-diamond bm-diamond-tl"></div>' +
              '<div class="bm-diamond bm-diamond-tr"></div>' +
              '<div class="bm-diamond bm-diamond-bl"></div>' +
              '<div class="bm-diamond bm-diamond-br"></div>' +
              '<div class="bm-vline-l"></div>' +
              '<div class="bm-vline-r"></div>' +
              '<div class="bm-grid">' +
                tkBlack('api', 'API', 'config') +
                tkBlack('workshop', '\u5DE5\u574A', 'studio') +
                tkBlack('ballset', '\u60AC\u6D6E\u7403', 'float') +
                tkBlack('character', '\u89D2\u8272', 'role') +
                tkBlack('memory', '\u8BB0\u5FC6', 'memory') +
                tkBlack('resetLayout', '\u6062\u590D', 'reset') +
                tkBlack('exportData', '\u5BFC\u51FA', 'export') +'</div>' +
            '</div>' +
          '</div>' +
          '<div class="ball-card-page" data-page="1" style="width:' + PG1_W + 'px">' +
            '<div class="bm-card">' +
              '<div class="bm-title">\u2660 \u7F8E\u5316\u5DE5\u574A \u2660</div>' +
              '<div class="bm-grid">' +
                tkWhite('theme', '\u4E3B\u9898', 'theme') +
                tkWhite('font', '\u5B57\u4F53', 'font') +
                tkWhite('bg', '\u80CC\u666F', 'image') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(menu);
      Workshop.menuEl = menu;
      Workshop.sliderEl = menu.querySelector('#ballCardSlider');
      Workshop.pages = menu.querySelectorAll('.ball-card-page');

      Workshop.bindMenuEvents();
      Workshop.bindSwipe();
    },

    bindMenuEvents: function() {
      var menu = Workshop.menuEl;

      menu.querySelectorAll('.bm-tk').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;

          if (action === 'workshop') {
            Workshop.goToPage(1);
            return;
          }
          if (action === 'api') {
            Workshop.close();
            setTimeout(function() {
              if (App.api) App.api.open();
              else App.openPanel('apiPanel');
            }, 220);
            return;
          }
          if (action === 'ballset') {
            Workshop.close();
            setTimeout(function() { App.openBallSettings(); }, 220);
            return;
          }
          if (action === 'character') {
            Workshop.close();
            setTimeout(function() {
              if (App.charMgr) App.charMgr.open();
            }, 220);
            return;
          }
          if (action === 'memory') {
            App.showToast('\u8BB0\u5FC6\u529F\u80FD\u5F00\u53D1\u4E2D');
            return;
          }
          if (action === 'resetLayout') {
            Workshop.close();
            setTimeout(function() { Workshop.resetAllLayout(); }, 220);
            return;
          }
          if (action === 'exportData') {
            Workshop.exportData();
            return;
          }
        });
      });

      menu.querySelectorAll('.bm-wk').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;
          var panelMap = {
            theme: 'themePanel',
            font: 'fontPanel',
            bg: 'bgPanel'
          };
          if (panelMap[action]) {
            Workshop.close();
            setTimeout(function() { App.openPanel(panelMap[action]); }, 220);}
        });
      });
    },

    exportData: function() {
      var data = {};
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'mono-space-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      App.showToast('\u6570\u636E\u5DF2\u5BFC\u51FA');
    },

    resetAllLayout: function() {
      App.LS.remove('wtCardPos');
      if (App.calendar) {
        App.calendar._dragOffsetX = 0;
        App.calendar._dragOffsetY = 0;
      }
      var wtCard = App.$('#wtCard');
      if (wtCard) wtCard.style.transform = '';
      if (App.modules.cards) App.modules.cards.resetAllPositions();
      var edenData = App.LS.get('edenCard');
      if (edenData) {
        edenData.posX = 0;
        edenData.posY = 0;
        App.LS.set('edenCard', edenData);
      }
      var edenCard = App.$('#edenCard');
      if (edenCard) edenCard.style.transform = '';
      App.showToast('\u5E03\u5C40\u5DF2\u6062\u590D');
    },

    bindSwipe: function() {
      var menu = Workshop.menuEl;
      var slider = Workshop.sliderEl;

      menu.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        if (e.target.closest('input')) return;
        var t = e.touches[0];
        var rect = menu.getBoundingClientRect();
        Workshop._touch = {
          active: true,
          mode: '',
          sx: t.clientX,
          sy: t.clientY,
          ox: rect.left,
          oy: rect.top,
          baseSlider: -Workshop.getPageOffset(Workshop.currentPage)
        };
        slider.style.transition = 'none';
      }, { passive: false });

      menu.addEventListener('touchmove', function(e) {
        if (!Workshop._touch || !Workshop._touch.active) return;
        e.stopPropagation();
        var t = e.touches[0];
        var dx = t.clientX - Workshop._touch.sx;
        var dy = t.clientY - Workshop._touch.sy;
        var adx = Math.abs(dx);
        var ady = Math.abs(dy);

        if (!Workshop._touch.mode) {
          if (adx< 8 && ady < 8) return;
          if (adx >ady && Workshop.currentPage > 0 && dx > 0) {
            Workshop._touch.mode = 'swipe';
          } else {
            Workshop._touch.mode = 'drag';
          }
        }

        e.preventDefault();

        if (Workshop._touch.mode === 'drag') {
          menu.style.left = (Workshop._touch.ox + dx) + 'px';
          menu.style.top = (Workshop._touch.oy + dy) + 'px';
          menu.style.right = 'auto';
        } else if (Workshop._touch.mode === 'swipe') {
          var nextX = Workshop._touch.baseSlider + dx;
          if (nextX > 0) nextX *= 0.25;
          slider.style.transform = 'translateX(' + nextX + 'px)';
        }
      }, { passive: false });

      menu.addEventListener('touchend', function() {
        if (!Workshop._touch || !Workshop._touch.active) return;
        Workshop._touch.active = false;
        slider.style.transition = '';

        if (Workshop._touch.mode === 'swipe') {
          var match = slider.style.transform.match(/translateX\((.+?)px\)/);
          var currentX = match ? parseFloat(match[1]) : Workshop._touch.baseSlider;
          var delta = currentX - Workshop._touch.baseSlider;
          var pw = Workshop.getPageWidth(Workshop.currentPage);
          if (delta > pw * 0.25 && Workshop.currentPage > 0) {
            Workshop.goToPage(Workshop.currentPage - 1);
          } else {
            Workshop.goToPage(Workshop.currentPage);
          }
        }

        Workshop._touch.mode = '';
      }, { passive: true });
    },

    goToPage: function(idx) {
      Workshop.currentPage = idx;
      var w = Workshop.getPageWidth(idx);
      Workshop.menuEl.style.width = w + 'px';
      Workshop.sliderEl.style.transform = 'translateX(' + (-Workshop.getPageOffset(idx)) + 'px)';
    },

    positionMenu: function() {
      var ball = App.state.ball;
      if (!ball) return;
      var rect = ball.getBoundingClientRect();
      var menu = Workshop.menuEl;
      var menuW = PG0_W;
      var menuH = menu.offsetHeight || 300;
      var ballCX = rect.left + rect.width / 2;
      var posLeft;

      if (ballCX > window.innerWidth / 2) {
        posLeft = rect.left - menuW - 4;
        if (posLeft < 4) posLeft = 4;
      } else {
        posLeft = rect.right + 4;
        if (posLeft + menuW > window.innerWidth - 4) posLeft = window.innerWidth - menuW - 4;
      }
      menu.style.left = posLeft + 'px';
      menu.style.right = 'auto';

      var top = rect.top + rect.height / 2 - menuH / 2;
      if (top < 10) top = 10;
      if (top + menuH > window.innerHeight - 10) top = window.innerHeight - menuH - 10;
      menu.style.top = top + 'px';
    },

    open: function() {
      var old = App.$('#ballCardMenu');
      if (old) {
        old.remove();
        Workshop.menuEl = null;
        Workshop.sliderEl = null;
      }
      Workshop.createMenu();
      Workshop.isOpen = true;
      Workshop.currentPage = 0;
      Workshop.menuEl.style.width = PG0_W + 'px';
      Workshop.sliderEl.style.transition = 'none';
      Workshop.sliderEl.style.transform = 'translateX(0)';
      setTimeout(function() {
        if (Workshop.sliderEl) Workshop.sliderEl.style.transition = '';
      }, 50);
      Workshop.positionMenu();
      Workshop.menuEl.classList.add('show');
    },

    close: function() {
      if (!Workshop.isOpen) return;
      Workshop.isOpen = false;
      if (Workshop.menuEl) Workshop.menuEl.classList.remove('show');
    },

    toggle: function() {
      if (Workshop.isOpen) Workshop.close();
      else Workshop.open();
    },

    init: function() {
      document.addEventListener('click', function(e) {
        if (!Workshop.isOpen) return;
        if (Workshop.menuEl && Workshop.menuEl.contains(e.target)) return;
        var ball = App.state.ball;
        if (ball && (e.target === ball || ball.contains(e.target))) return;
        Workshop.close();
      });
    }
  };

  App.workshop = Workshop;
  App.register('workshop', Workshop);
})();
