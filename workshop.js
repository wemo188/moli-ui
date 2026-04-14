(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var MAIN_W = 200, WS_W = 200, CTRL_W = 275;

  var Workshop = {
    menuEl: null,
    sliderEl: null,
    currentPage: 0,
    isOpen: false,
    pages: [],
    touchStartX: 0,
    touchStartY: 0,
    touchCurrentX: 0,
    isDragging: false,
    dirLocked: false,
    isHorizontal: false,
    baseX: 0,

    getPageWidth: function(idx) {
      if (idx === 0) return MAIN_W;
      if (idx === 1) return WS_W;
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

          '<div class="ball-card-page" data-page="0" style="width:' + MAIN_W + 'px">' +
            '<div class="ball-card-stack">' +
              '<div class="ball-card-item" data-action="api"><span>API 配置</span></div>' +
              '<div class="ball-card-item" data-action="theme"><span>主题配色</span></div>' +
              '<div class="ball-card-item" data-action="font"><span>字体设置</span></div>' +
              '<div class="ball-card-item" data-action="bg"><span>背景图片</span></div>' +
              '<div class="ball-card-item has-sub" data-action="workshop"><span>美化工坊</span></div>' +
              '<div class="ball-card-item" data-action="settings"><span>悬浮球设置</span></div>' +
              '<div class="ball-card-item" data-action="resetLayout"><span>恢复布局</span></div>' +
            '</div>' +
          '</div>' +

          '<div class="ball-card-page" data-page="1" style="width:' + WS_W + 'px">' +
            '<div class="ws-ticket-list">' +
              '<div class="ws-ticket" data-action="ws-weather"><div class="ws-ticket-name">时间栏</div><div class="ws-ticket-line"></div><div class="ws-ticket-desc">布局 · 背景 · 颜色</div></div>' +
              '<div class="ws-ticket" data-action="ws-cards"><div class="ws-ticket-name">角色卡片</div><div class="ws-ticket-line"></div><div class="ws-ticket-desc">头像 · 名字 · 标签</div></div>' +
              '<div class="ws-ticket" data-action="ws-dialog"><div class="ws-ticket-name">对话框</div><div class="ws-ticket-line"></div><div class="ws-ticket-desc">样式 · 颜色 · 边距</div></div>' +
              '<div class="ws-ticket" data-action="ws-eden"><div class="ws-ticket-name">文字卡片</div><div class="ws-ticket-line"></div><div class="ws-ticket-desc">字体 · 字号 · 间距</div></div>' +
              '<div class="ws-ticket" data-action="ws-dock"><div class="ws-ticket-name">底部栏</div><div class="ws-ticket-line"></div><div class="ws-ticket-desc">图标 · 间距 · 样式</div></div>' +
            '</div>' +
          '</div>' +

          Workshop.buildWeatherPage() +
          Workshop.buildPlaceholderPage('角色卡片', 3) +
          Workshop.buildPlaceholderPage('对话框', 4) +
          Workshop.buildPlaceholderPage('文字卡片', 5) +
          Workshop.buildPlaceholderPage('底部栏', 6) +

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
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">缩放</div><input type="range" min="50" max="100" value="' + s + '" id="wsWtScale"><span class="ws-ctrl-val" id="wsWtScaleVal">' + (s / 100).toFixed(2) + '</span></div>' +
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
          '<div class="ws-btn-row" style="margin-top:8px;">' +
            '<div class="ws-ticket ws-btn ws-btn-accent ws-sm" id="wsWtSave"><div class="ws-ticket-name">保存</div></div>' +
            '<div class="ws-ticket ws-btn ws-btn-accent ws-sm" id="wsWtReset"><div class="ws-ticket-name">重置</div></div>' +
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

      menu.querySelectorAll('.ball-card-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;

          if (action === 'workshop') { Workshop.goToPage(1); return; }
          if (action === 'resetLayout') { Workshop.close(); setTimeout(function() { Workshop.resetAllLayout(); }, 220); return; }
          if (action === 'settings') { Workshop.close(); setTimeout(function() { App.openBallSettings(); }, 220); return; }

          var panelMap = { api: 'apiPanel', theme: 'themePanel', font: 'fontPanel', bg: 'bgPanel' };
          if (panelMap[action]) {
            Workshop.close();
            setTimeout(function() { App.openPanel(panelMap[action]); }, 220);
          }
        });
      });

      var wsActionMap = {
        'ws-weather': 2,
        'ws-cards': 3,
        'ws-dialog': 4,
        'ws-eden': 5,
        'ws-dock': 6
      };

      menu.querySelectorAll('.ws-ticket[data-action]').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;
          if (wsActionMap[action] !== undefined) {
            Workshop.goToPage(wsActionMap[action]);
          }
        });
      });

      Workshop.bindWeatherControls();
    },

    bindWeatherControls: function() {
      var sliders = [
        ['wsWtScale', 'wsWtScaleVal', function(v) { return (v / 100).toFixed(2); }],
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

      App.safeOn('#wsWtSave', 'click', function(e) {
        e.stopPropagation();
        Workshop.saveWeather();
        App.showToast('已保存');
      });

      App.safeOn('#wsWtReset', 'click', function(e) {
        e.stopPropagation();
        Workshop.resetWeather();
        App.showToast('已重置');
      });
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

    previewWeather: function() {
      if (App.calendar) App.calendar.applyCardConfig(Workshop.getWeatherCfg());
    },

    saveWeather: function() {
      if (!App.calendar) return;
      App.calendar.cardConfig = Workshop.getWeatherCfg();
      App.calendar.saveCardConfig();
      App.calendar.applyCardConfig();
    },

    resetWeather: function() {
      if (!App.calendar) return;
      App.LS.remove('wtCardConfig');
      var DEFAULTS = { scale: 100, alpha: 0, blur: 7, radius: 10, colorHex: '#ffffff', borderAlpha: 15, fontColor: '#1a1a1a', lineColor: '#1a1a1a' };
      App.calendar.cardConfig = JSON.parse(JSON.stringify(DEFAULTS));
      App.calendar.saveCardConfig();
      var card = App.$('#wtCard');
      if (card) {
        var cw = card.querySelector('.wt-cw');
        if (cw) cw.removeAttribute('style');
        card.querySelectorAll('.wt-time,.wt-time span,.wt-sec,.wt-sec span,.wt-date,.wt-date span,.wt-wk,.vf-lbl,.wt-tl,.wt-wl,.wt-vd,.vf-hl,#location-coords,.wt-sched-text').forEach(function(el) { el.removeAttribute('style'); });
      }
      App.calendar.applyCardConfig();
      App.calendar._dragOffsetX = 0;
      App.calendar._dragOffsetY = 0;
      App.LS.remove('wtCardPos');
      if (card) card.style.transform = '';

      // 同步滑块
      var c = DEFAULTS;
      if (App.$('#wsWtScale')) App.$('#wsWtScale').value = c.scale;
      if (App.$('#wsWtScaleVal')) App.$('#wsWtScaleVal').textContent = (c.scale / 100).toFixed(2);
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

    bindSwipe: function() {
      var menu = Workshop.menuEl;
      var slider = Workshop.sliderEl;

      menu.addEventListener('touchstart', function(e) {
        if (Workshop.currentPage === 0) return;
        if (e.target.closest('input')) return;
        var t = e.touches[0];
        Workshop.touchStartX = t.clientX;
        Workshop.touchStartY = t.clientY;
        Workshop.touchCurrentX = t.clientX;
        Workshop.isDragging = true;
        Workshop.dirLocked = false;
        Workshop.isHorizontal = false;
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

      var top = rect.top + rect.height / 2 - 230;
      if (top < 10) top = 10;
      if (top + 460 > window.innerHeight - 10) top = window.innerHeight - 470;
      menu.style.top = top + 'px';
    },

    open: function() {
      Workshop.createMenu();
      Workshop.isOpen = true;
      Workshop.currentPage = 0;
      Workshop.menuEl.style.width = MAIN_W + 'px';
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

      App.showToast('所有布局已恢复默认');
    },

    init: function() {
      // 点击外面关闭
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