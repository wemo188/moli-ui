(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var PG0_W = 250, PG1_W = 250, CTRL_W = 280;

  function tkBlack(action, cn, en) {
    return '<div class="bm-tk" data-action="' + action + '"><div class="bm-tk-body"><div class="bm-tk-inner"></div><span class="bm-tk-spade">♠</span><div class="bm-tk-text">' + cn + '</div><div class="bm-tk-line"></div><div class="bm-tk-sub">' + en + '</div></div></div>';
  }

  function tkWhite(action, cn, en) {
    return '<div class="bm-wk" data-action="' + action + '"><div class="bm-wk-body"><div class="bm-wk-inner"></div><span class="bm-wk-spade">♠</span><div class="bm-wk-text">' + cn + '</div><div class="bm-wk-line"></div><div class="bm-wk-sub">' + en + '</div></div></div>';
  }

  function fmtTime() {
    var n = new Date();
    return n.getFullYear() + '.' + String(n.getMonth()+1).padStart(2,'0') + '.' + String(n.getDate()).padStart(2,'0') + ' ' + String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
  }

  var Workshop = {
    menuEl: null,
    sliderEl: null,
    currentPage: 0,
    isOpen: false,
    pages: [],
    touchStartX: 0, touchStartY: 0, touchCurrentX: 0,
    isDragging: false, dirLocked: false, isHorizontal: false, baseX: 0,
    timeTimer: null,

    getPageWidth: function(idx) {
      if (idx <= 1) return PG0_W;
      return CTRL_W;
    },

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

          // ====== Page 0: 主菜单 ======
          '<div class="ball-card-page" data-page="0" style="width:' + PG0_W + 'px">' +
            '<div class="bm-card">' +
              '<div class="bm-time" id="bmTime">' + fmtTime() + '</div>' +
              '<div class="bm-grid">' +
                tkBlack('api', 'API', 'config') +
                tkBlack('workshop', '工坊', 'studio') +
                tkBlack('ballset', '悬浮球', 'float') +
                tkBlack('character', '角色', 'role') +
                tkBlack('memory', '记忆', 'memory') +
                tkBlack('resetLayout', '恢复', 'reset') +
                tkBlack('exportData', '导出', 'export') +
              '</div>' +
            '</div>' +
          '</div>' +

          // ====== Page 1: 美化工坊 ======
          '<div class="ball-card-page" data-page="1" style="width:' + PG1_W + 'px">' +
            '<div class="bm-card">' +
              '<div class="bm-title">♠ 美化工坊 ♠</div>' +
              '<div class="bm-grid">' +
                tkWhite('ws-weather', '时间栏', 'clock') +
                tkWhite('ws-cards', '角色卡', 'cards') +
                tkWhite('ws-dialog', '对话框', 'dialog') +
                tkWhite('ws-eden', '文字卡', 'eden') +
                tkWhite('ws-dock', '底部栏', 'dock') +
                tkWhite('theme', '主题', 'theme') +
                tkWhite('font', '字体', 'font') +
                tkWhite('bg', '背景', 'image') +
                tkWhite('ws-menu', '菜单栏', 'menu') +
              '</div>' +
            '</div>' +
          '</div>' +

          // ====== Page 2: 时间栏调节 ======
          Workshop.buildWeatherPage() +

          // ====== Page 3-7: 占位 ======
          Workshop.buildPlaceholderPage('角色卡片', 3) +
          Workshop.buildPlaceholderPage('对话框', 4) +
          Workshop.buildPlaceholderPage('文字卡片', 5) +
          Workshop.buildPlaceholderPage('底部栏', 6) +
          Workshop.buildPlaceholderPage('菜单栏', 7) +

        '</div>';

      document.body.appendChild(menu);
      Workshop.menuEl = menu;
      Workshop.sliderEl = menu.querySelector('#ballCardSlider');
      Workshop.pages = menu.querySelectorAll('.ball-card-page');

      Workshop.bindMenuEvents();
      Workshop.bindSwipe();
    },

    buildWeatherPage: function() {
      var c = (App.calendar && App.calendar.cardConfig) ? App.calendar.cardConfig : {};
      var s = c.scale || 100, r = c.radius || 10, ba = c.borderAlpha || 15;
      var a = c.alpha || 0, bl = c.blur || 7;
      var bgC = c.colorHex || '#ffffff', fC = c.fontColor || '#1a1a1a', lC = c.lineColor || '#ffffff';

      return '<div class="ball-card-page" data-page="2" style="width:' + CTRL_W + 'px">' +
        '<div class="ball-page-scroll">' +
          '<div class="ws-menu-wrap">' +
            '<div class="ws-menu-shell"><div class="ws-menu-body">' +
              '<div class="ws-menu-inner-frame"><div class="ws-menu-inner-border"><div class="ws-menu-inner-fill"></div></div></div>' +
              '<div class="ws-menu-ctrl">' +
                '<div class="ws-section-title"><span>布 局</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">缩放</div><input type="range" min="50" max="100" value="' + s + '" id="wsWtScale"><span class="ws-ctrl-val" id="wsWtScaleVal">' + (s/100).toFixed(2) + '</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">圆角</div><input type="range" min="0" max="40" value="' + r + '" id="wsWtRadius"><span class="ws-ctrl-val" id="wsWtRadiusVal">' + r + 'px</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">边框</div><input type="range" min="0" max="100" value="' + ba + '" id="wsWtBorder"><span class="ws-ctrl-val" id="wsWtBorderVal">' + ba + '%</span></div>' +
                '<div class="ws-section-title"><span>背 景</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">底色</div><input type="color" value="' + bgC + '" id="wsWtBgColor" style="width:26px;height:26px;border:2px solid #cadff2;border-radius:6px;padding:1px;cursor:pointer;background:transparent;-webkit-appearance:none;"></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">透明</div><input type="range" min="0" max="100" value="' + a + '" id="wsWtAlpha"><span class="ws-ctrl-val" id="wsWtAlphaVal">' + a + '%</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">模糊</div><input type="range" min="0" max="100" value="' + bl + '" id="wsWtBlur"><span class="ws-ctrl-val" id="wsWtBlurVal">' + bl + 'px</span></div>' +
                '<div class="ws-section-title"><span>颜 色</span></div>' +
                '<div class="ws-ctrl-color-row">' +
                  '<div class="ws-ctrl-color-item"><input type="color" value="' + fC + '" id="wsWtFontColor"><label>字体</label></div>' +
                  '<div class="ws-ctrl-color-item"><input type="color" value="' + lC + '" id="wsWtLineColor"><label>线条</label></div>' +
                '</div>' +
              '</div>' +
            '</div></div>' +
          '</div>' +
          '<div class="ws-btn-row">' +
            '<div class="ws-btn-item" id="wsWtSave">保存</div>' +
            '<div class="ws-btn-item" id="wsWtReset">重置</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    buildPlaceholderPage: function(title, idx) {
      return '<div class="ball-card-page" data-page="' + idx + '" style="width:' + CTRL_W + 'px">' +
        '<div class="ws-placeholder">' + App.esc(title) + '<br>调节功能开发中...</div>' +
      '</div>';
    },

    bindMenuEvents: function() {
      var menu = Workshop.menuEl;

      // 第一页黑色票券
      menu.querySelectorAll('.bm-tk').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;
          if (action === 'workshop') { Workshop.goToPage(1); return; }
          if (action === 'api') { Workshop.close(); setTimeout(function() { App.openPanel('apiPanel'); }, 220); return; }
          if (action === 'ballset') { Workshop.close(); setTimeout(function() { App.openBallSettings(); }, 220); return; }
if (action === 'character') { App.showToast('角色功能开发中'); return; }
if (action === 'memory') { App.showToast('记忆功能开发中'); return; }
          if (action === 'resetLayout') { Workshop.close(); setTimeout(function() { Workshop.resetAllLayout(); }, 220); return; }
          if (action === 'exportData') { Workshop.exportData(); return; }
        });
      });

      // 第二页蓝白票券
      var wsActionMap = { 'ws-weather': 2, 'ws-cards': 3, 'ws-dialog': 4, 'ws-eden': 5, 'ws-dock': 6, 'ws-menu': 7 };
      menu.querySelectorAll('.bm-wk').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;
          if (wsActionMap[action] !== undefined) { Workshop.goToPage(wsActionMap[action]); return; }
          var panelMap = { theme: 'themePanel', font: 'fontPanel', bg: 'bgPanel' };
          if (panelMap[action]) { Workshop.close(); setTimeout(function() { App.openPanel(panelMap[action]); }, 220); }
        });
      });

      Workshop.bindWeatherControls();
    },

    bindWeatherControls: function() {
      var sliders = [
        ['wsWtScale', 'wsWtScaleVal', function(v) { return (v/100).toFixed(2); }],
        ['wsWtRadius', 'wsWtRadiusVal', function(v) { return v + 'px'; }],
        ['wsWtBorder', 'wsWtBorderVal', function(v) { return v + '%'; }],
        ['wsWtAlpha', 'wsWtAlphaVal', function(v) { return v + '%'; }],
        ['wsWtBlur', 'wsWtBlurVal', function(v) { return v + 'px'; }]
      ];
      sliders.forEach(function(s) {
        var el = App.$('#' + s[0]);
        if (el) el.addEventListener('input', function() {
          var valEl = App.$('#' + s[1]);
          if (valEl) valEl.textContent = s[2](this.value);
          Workshop.previewWeather();
        });
      });
      ['wsWtBgColor', 'wsWtFontColor', 'wsWtLineColor'].forEach(function(id) {
        var el = App.$('#' + id);
        if (el) el.addEventListener('input', function() { Workshop.previewWeather(); });
      });
      App.safeOn('#wsWtSave', 'click', function(e) { e.stopPropagation(); Workshop.saveWeather(); App.showToast('已保存'); });
      App.safeOn('#wsWtReset', 'click', function(e) { e.stopPropagation(); Workshop.resetWeather(); App.showToast('已重置'); });
    },

    getWeatherCfg: function() {
      return {
        scale: parseInt((App.$('#wsWtScale') || {}).value || 100),
        radius: parseInt((App.$('#wsWtRadius') || {}).value || 10),
        borderAlpha: parseInt((App.$('#wsWtBorder') || {}).value || 15),
        alpha: parseInt((App.$('#wsWtAlpha') || {}).value || 0),
        blur: parseInt((App.$('#wsWtBlur') || {}).value || 7),
        colorHex: (App.$('#wsWtBgColor') || {}).value || '#ffffff',
        fontColor: (App.$('#wsWtFontColor') || {}).value || '#1a1a1a',
        lineColor: (App.$('#wsWtLineColor') || {}).value || '#ffffff'
      };
    },

    previewWeather: function() { if (App.calendar) App.calendar.applyCardConfig(Workshop.getWeatherCfg()); },

    saveWeather: function() {
      if (!App.calendar) return;
      App.calendar.cardConfig = Workshop.getWeatherCfg();
      App.calendar.saveCardConfig();
      App.calendar.applyCardConfig();
    },

    resetWeather: function() {
      if (!App.calendar) return;
      App.LS.remove('wtCardConfig');
      var DEFAULTS = { scale:100, alpha:0, blur:7, radius:10, colorHex:'#ffffff', borderAlpha:15, fontColor:'#1a1a1a', lineColor:'#1a1a1a' };
      App.calendar.cardConfig = JSON.parse(JSON.stringify(DEFAULTS));
      App.calendar.saveCardConfig();
      var card = App.$('#wtCard');
      if (card) {
        var cw = card.querySelector('.wt-cw');
        if (cw) cw.removeAttribute('style');
        card.querySelectorAll('.wt-time,.wt-time span,.wt-sec,.wt-sec span,.wt-date,.wt-date span,.wt-wk,.vf-lbl,.wt-tl,.wt-wl,.wt-vd,.vf-hl,#location-coords,.wt-sched-text').forEach(function(el) { el.removeAttribute('style'); });
      }
      App.calendar.applyCardConfig();
      App.calendar._dragOffsetX = 0; App.calendar._dragOffsetY = 0;
      App.LS.remove('wtCardPos');
      if (card) card.style.transform = '';
      var c = DEFAULTS;
      if (App.$('#wsWtScale')) App.$('#wsWtScale').value = c.scale;
      if (App.$('#wsWtScaleVal')) App.$('#wsWtScaleVal').textContent = (c.scale/100).toFixed(2);
      if (App.$('#wsWtRadius')) App.$('#wsWtRadius').value = c.radius;
      if (App.$('#wsWtRadiusVal')) App.$('#wsWtRadiusVal').textContent = c.radius + 'px';
      if (App.$('#wsWtBorder')) App.$('#wsWtBorder').value = c.borderAlpha;
      if (App.$('#wsWtBorderVal')) App.$('#wsWtBorderVal').textContent = c.borderAlpha + '%';
      if (App.$('#wsWtAlpha')) App.$('#wsWtAlpha').value = c.alpha;
      if (App.$('#wsWtAlphaVal')) App.$('#wsWtAlphaVal').textContent = c.alpha + '%';
      if (App.$('#wsWtBlur')) App.$('#wsWtBlur').value = c.blur;
      if (App.$('#wsWtBlurVal')) App.$('#wsWtBlurVal').textContent = c.blur + 'px';
      if (App.$('#wsWtBgColor')) App.$('#wsWtBgColor').value = c.colorHex;
      if (App.$('#wsWtFontColor')) App.$('#wsWtFontColor').value = c.fontColor;
      if (App.$('#wsWtLineColor')) App.$('#wsWtLineColor').value = c.lineColor;
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
      a.download = 'mono-space-backup-' + new Date().toISOString().slice(0,10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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

    bindSwipe: function() {
      var menu = Workshop.menuEl;
      var slider = Workshop.sliderEl;

      menu.addEventListener('touchstart', function(e) {
        if (Workshop.currentPage === 0) return;
        if (e.target.closest('input')) return;
        var t = e.touches[0];
        Workshop.touchStartX = t.clientX; Workshop.touchStartY = t.clientY;
        Workshop.touchCurrentX = t.clientX;
        Workshop.isDragging = true; Workshop.dirLocked = false; Workshop.isHorizontal = false;
        Workshop.baseX = -Workshop.getPageOffset(Workshop.currentPage);
        slider.style.transition = 'none';
      }, { passive: true });

      menu.addEventListener('touchmove', function(e) {
        if (!Workshop.isDragging) return;
        var t = e.touches[0];
        Workshop.touchCurrentX = t.clientX;
        var dx = Math.abs(Workshop.touchCurrentX - Workshop.touchStartX);
        var dy = Math.abs(t.clientY - Workshop.touchStartY);
        if (!Workshop.dirLocked && (dx > 6 || dy > 6)) {
          Workshop.dirLocked = true;
          Workshop.isHorizontal = dx > dy;
        }
        if (!Workshop.dirLocked || !Workshop.isHorizontal) return;
        e.preventDefault();
        var delta = Workshop.touchCurrentX - Workshop.touchStartX;
        if (delta < 0) delta *= 0.2;
        var nextX = Workshop.baseX + delta;
        if (nextX > 0) nextX *= 0.25;
        slider.style.transform = 'translateX(' + nextX + 'px)';
      }, { passive: false });

      menu.addEventListener('touchend', function() {
        if (!Workshop.isDragging) return;
        Workshop.isDragging = false;
        slider.style.transition = '';
        if (!Workshop.isHorizontal) { Workshop.goToPage(Workshop.currentPage); return; }
        var delta = Workshop.touchCurrentX - Workshop.touchStartX;
        var pw = Workshop.getPageWidth(Workshop.currentPage);
        if (delta > pw * 0.25 && Workshop.currentPage > 0) {
          var target = Workshop.currentPage <= 2 ? Workshop.currentPage - 1 : 1;
          Workshop.goToPage(target);
        } else {
          Workshop.goToPage(Workshop.currentPage);
        }
      }, { passive: true });

      menu.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: false });
      menu.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: false });
    },

    goToPage: function(idx) {
      Workshop.currentPage = idx;
      var w = Workshop.getPageWidth(idx);
      Workshop.menuEl.style.width = w + 'px';
      Workshop.sliderEl.style.transform = 'translateX(' + (-Workshop.getPageOffset(idx)) + 'px)';
      Workshop.positionMenu();
    },

    positionMenu: function() {
      var ball = App.state.ball;
      if (!ball) return;
      var rect = ball.getBoundingClientRect();
      var menu = Workshop.menuEl;
      var ballCX = rect.left + rect.width / 2;
      if (ballCX > window.innerWidth / 2) {
        menu.style.right = (window.innerWidth - rect.left + 10) + 'px';
        menu.style.left = 'auto';
      } else {
        menu.style.left = (rect.right + 10) + 'px';
        menu.style.right = 'auto';
      }
      var top = rect.top + rect.height / 2 - 200;
      if (top < 10) top = 10;
      if (top + 460 > window.innerHeight - 10) top = window.innerHeight - 470;
      menu.style.top = top + 'px';
    },

    updateTime: function() {
      var el = App.$('#bmTime');
      if (el) el.textContent = fmtTime();
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
      Workshop.updateTime();
      clearInterval(Workshop.timeTimer);
      Workshop.timeTimer = setInterval(Workshop.updateTime, 10000);
    },

    close: function() {
      if (!Workshop.isOpen) return;
      Workshop.isOpen = false;
      if (Workshop.menuEl) Workshop.menuEl.classList.remove('show');
      clearInterval(Workshop.timeTimer);
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