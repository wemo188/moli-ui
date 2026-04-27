
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var PG0_W = 280, PG1_W = 280;

  function tkBlack(action, cn, en) {
    return '<div class="bm-tk" data-action="' + action + '"><div class="bm-tk-body"><div class="bm-tk-inner"></div><span class="bm-tk-spade">♠</span><div class="bm-tk-text">' + cn + '</div><div class="bm-tk-line"></div><div class="bm-tk-sub">' + en + '</div></div></div>';
  }

  function tkWhite(action, cn, en) {
    return '<div class="bm-wk" data-action="' + action + '"><div class="bm-wk-body"><div class="bm-wk-inner"></div><span class="bm-wk-spade">♠</span><div class="bm-wk-text">' + cn + '</div><div class="bm-wk-line"></div><div class="bm-wk-sub">' + en + '</div></div></div>';
  }

  var Workshop = {
    menuEl: null,
    sliderEl: null,
    currentPage: 0,
    isOpen: false,
    pages: [],
    _touch: null,

    getPageWidth: function(idx) { return idx === 0 ? PG0_W : PG1_W; },

    getPageOffset: function(idx) {
      var o = 0;
      for (var i = 0; i < idx; i++) o += Workshop.getPageWidth(i);
      return o;
    },

    createMenu: function() {
      if (Workshop.menuEl) return;

      var menu = document.createElement('div');
      menu.id = 'ballCardMenu';
      menu.className = 'ball-card-menu';

      menu.innerHTML =
        '<div class="ball-card-slider" id="ballCardSlider">' +

          '<div class="ball-card-page" data-page="0" style="width:' + PG0_W + 'px">' +
            '<div class="bm-card">' +
              '<div class="bm-title">♠ 悬浮助手 ♠</div>' +
              '<div class="bm-grid">' +
                tkBlack('api', 'API', 'config') +
                tkBlack('workshop', '工坊', 'studio') +
                tkBlack('ballset', '悬浮球', 'float') +
                tkBlack('character', '角色', 'role') +
                tkBlack('memory', '记忆', 'memory') +
                tkBlack('resetLayout', '恢复', 'reset') +
                tkBlack('exportData', '导出', 'export') +
                tkBlack('console', '控制台', 'console') +
              '</div>' +
              '<div class="bm-bottom-line"></div>' +
            '</div>' +
          '</div>' +

          '<div class="ball-card-page" data-page="1" style="width:' + PG1_W + 'px">' +
            '<div class="bm-card">' +
              '<div class="bm-title">♠ 美化工坊 ♠</div>' +
              '<div class="bm-grid">' +
                tkWhite('theme', '主题', 'theme') +
                tkWhite('font', '字体', 'font') +
                tkWhite('bg', '背景', 'image') +
              '</div>' +
              '<div class="bm-bottom-line"></div>' +
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
          if (action === 'workshop') { Workshop.goToPage(1); return; }
          if (action === 'api') { Workshop.close(); setTimeout(function() { if (App.api) App.api.open(); }, 220); return; }
          if (action === 'ballset') { Workshop.close(); setTimeout(function() { App.openBallSettings(); }, 220); return; }
          if (action === 'character') { Workshop.close(); setTimeout(function() { if (App.charMgr) App.charMgr.open(); }, 220); return; }
          if (action === 'memory') { App.showToast('记忆功能开发中'); return; }
          if (action === 'resetLayout') { Workshop.close(); setTimeout(function() { Workshop.resetAllLayout(); }, 220); return; }
          if (action === 'exportData') { Workshop.exportData(); return; }
          if (action === 'console') { Workshop.close(); setTimeout(function() { Workshop.openConsole(); }, 220); return; }
        });
      });

      menu.querySelectorAll('.bm-wk').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;
          var panelMap = { theme: 'themePanel', font: 'fontPanel', bg: 'bgPanel' };
          if (panelMap[action]) { Workshop.close(); setTimeout(function() { App.openPanel(panelMap[action]); }, 220); }
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
      a.href = url; a.download = 'mono-space-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      App.showToast('数据已导出');
    },

    resetAllLayout: function() {
      App.LS.remove('wtCardPos');
      if (App.calendar) { App.calendar._dragOffsetX = 0; App.calendar._dragOffsetY = 0; }
      var wtCard = App.$('#wtCard');
      if (wtCard) wtCard.style.transform = '';
      if (App.modules.cards) App.modules.cards.resetAllPositions();
      var edenData = App.LS.get('edenCard');
      if (edenData) { edenData.posX = 0; edenData.posY = 0; App.LS.set('edenCard', edenData); }
      var edenCard = App.$('#edenCard');
      if (edenCard) edenCard.style.transform = '';
      App.showToast('布局已恢复');
    },

    openConsole: function() {
      var old = App.$('#wsConsole');
      if (old) { old.remove(); return; }

      var panel = document.createElement('div');
      panel.id = 'wsConsole';
      panel.style.cssText = 'position:fixed;bottom:80px;left:10px;right:10px;max-height:50vh;z-index:200000;background:rgba(0,0,0,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:monospace;';
      panel.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.1);flex-shrink:0;">' +
          '<span style="color:#7a9ab8;font-size:12px;font-weight:700;letter-spacing:1px;">CONSOLE</span>' +
          '<div style="display:flex;gap:8px;">' +
            '<button id="wsClearLog" type="button" style="background:rgba(255,255,255,.1);border:none;color:#999;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:inherit;">清空</button>' +
            '<button id="wsCloseConsole" type="button" style="background:rgba(255,255,255,.1);border:none;color:#999;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:inherit;">关闭</button>' +
          '</div>' +
        '</div>' +
        '<div id="wsLogArea" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 14px;max-height:40vh;"></div>' +
        '<div style="display:flex;border-top:1px solid rgba(255,255,255,.1);flex-shrink:0;">' +
          '<input id="wsExecInput" type="text" placeholder="输入JS执行..." style="flex:1;background:transparent;border:none;color:#fff;font-size:12px;padding:10px 14px;outline:none;font-family:monospace;">' +
          '<button id="wsExecBtn" type="button" style="background:#7a9ab8;border:none;color:#fff;font-size:11px;padding:8px 14px;cursor:pointer;font-family:inherit;font-weight:700;">执行</button>' +
        '</div>';
      document.body.appendChild(panel);

      var logArea = panel.querySelector('#wsLogArea');

      function addLog(text, color) {
        var div = document.createElement('div');
        div.style.cssText = 'font-size:11px;color:' + (color || '#ccc') + ';padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);word-break:break-all;white-space:pre-wrap;line-height:1.4;';
        div.textContent = text;
        logArea.appendChild(div);
        logArea.scrollTop = logArea.scrollHeight;
      }

      var origLog = console.log;
      var origWarn = console.warn;
      var origError = console.error;

      console.log = function() {
        origLog.apply(console, arguments);
        addLog('[LOG] ' + Array.from(arguments).map(function(a) {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
          catch(e) { return String(a); }
        }).join(' '), '#ccc');
      };

      console.warn = function() {
        origWarn.apply(console, arguments);
        addLog('[WARN] ' + Array.from(arguments).map(function(a) {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
          catch(e) { return String(a); }
        }).join(' '), '#f0c040');
      };

      console.error = function() {
        origError.apply(console, arguments);
        addLog('[ERROR] ' + Array.from(arguments).map(function(a) {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
          catch(e) { return String(a); }
        }).join(' '), '#e85d5d');
      };

      var errHandler = function(e) {
        addLog('[ERROR] ' + (e.message || e.reason || e) + (e.filename ? ' (' + e.filename + ':' + e.lineno + ')' : ''), '#e85d5d');
      };
      window.addEventListener('error', errHandler);

      var rejectHandler = function(e) {
        addLog('[REJECT] ' + (e.reason || e), '#e85d5d');
      };
      window.addEventListener('unhandledrejection', rejectHandler);

      function execCmd() {
        var input = panel.querySelector('#wsExecInput');
        var cmd = input.value.trim();
        if (!cmd) return;
        addLog('> ' + cmd, '#7a9ab8');
        input.value = '';
        try {
          var result = eval(cmd);
          if (result !== undefined) {
            addLog(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result), '#8fc98f');
          }
        } catch (e) {
          addLog('[ERROR] ' + e.message, '#e85d5d');
        }
      }

      panel.querySelector('#wsExecBtn').addEventListener('click', execCmd);
      panel.querySelector('#wsExecInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); execCmd(); }
      });

      panel.querySelector('#wsClearLog').addEventListener('click', function() { logArea.innerHTML = ''; });

      panel.querySelector('#wsCloseConsole').addEventListener('click', function() {
        console.log = origLog;
        console.warn = origWarn;
        console.error = origError;
        window.removeEventListener('error', errHandler);
        window.removeEventListener('unhandledrejection', rejectHandler);
        panel.remove();
      });

      addLog('控制台已打开', '#7a9ab8');
      addLog('所有 console.log/warn/error 会显示在这里', '#666');
      addLog('可以输入JS表达式执行', '#666');
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
          active: true, mode: '',
          sx: t.clientX, sy: t.clientY,
          ox: rect.left, oy: rect.top,
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
        var adx = Math.abs(dx), ady = Math.abs(dy);

        if (!Workshop._touch.mode) {
          if (adx < 8 && ady < 8) return;
          if (adx > ady && Workshop.currentPage > 0 && dx > 0) Workshop._touch.mode = 'swipe';
          else Workshop._touch.mode = 'drag';
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
          var el = slider.style.transform.match(/translateX\((.+?)px\)/);
          var currentX = el ? parseFloat(el[1]) : Workshop._touch.baseSlider;
          var delta = currentX - Workshop._touch.baseSlider;
          var pw = Workshop.getPageWidth(Workshop.currentPage);
          if (delta > pw * 0.25 && Workshop.currentPage > 0) Workshop.goToPage(Workshop.currentPage - 1);
          else Workshop.goToPage(Workshop.currentPage);
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
      var menuW = menu.offsetWidth || PG0_W;
      var menuH = menu.offsetHeight || 380;
      var ballCX = rect.left + rect.width / 2;
      var overlap = rect.width * 0.3;

      if (ballCX > window.innerWidth / 2) {
        menu.style.left = (rect.left - menuW + overlap) + 'px';
        menu.style.right = 'auto';
      } else {
        menu.style.left = (rect.right - overlap) + 'px';
        menu.style.right = 'auto';
      }

      var ballCY = rect.top + rect.height / 2;
      var top = ballCY - menuH / 2;
      if (top + menuH > window.innerHeight - 10) top = window.innerHeight - menuH - 10;
      if (top < 10) top = 10;
      menu.style.top = top + 'px';
    },

    open: function() {
      Workshop.createMenu();
      Workshop.isOpen = true;
      Workshop.currentPage = 0;
      Workshop.menuEl.style.width = PG0_W + 'px';
      Workshop.sliderEl.style.transition = 'none';
      Workshop.sliderEl.style.transform = 'translateX(0)';
      setTimeout(function() { Workshop.sliderEl.style.transition = ''; }, 50);
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
