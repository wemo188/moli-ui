
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var PG0_W = 260, PG1_W = 260, CTRL_W = 280;

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
    touchStartX: 0, touchStartY: 0, touchCurrentX: 0,
    isDragging: false, dirLocked: false, isHorizontal: false, baseX: 0,

    getPageWidth: function(idx) {
      if (idx === 0) return PG0_W;
      if (idx === 1) return PG1_W;
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

          '<div class="ball-card-page" data-page="0" style="width:' + PG0_W + 'px">' +
            '<div class="bm-card">' +
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

          Workshop.buildWeatherPage() +
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
          '<div class="bm-card">' +
            '<div class="ws-menu-shell"><div class="ws-menu-body">' +
              '<div class="ws-menu-inner-frame"><div class="ws-menu-inner-border"><div class="ws-menu-inner-fill"></div></div></div>' +
              '<div class="ws-menu-ctrl">' +
                '<div class="ws-section-title"><span>布 局</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">缩放</div><input type="range" min="50" max="100" value="' + s + '" id="wsWtScale"><span class="ws-ctrl-val" id="wsWtScaleVal">' + (s/100).toFixed(2) + '</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">圆角</div><input type="range" min="0" max="40" value="' + r + '" id="wsWtRadius"><span class="ws-ctrl-val" id="wsWtRadiusVal">' + r + 'px</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">边框</div><input type="range" min="0" max="100" value="' + ba + '" id="wsWtBorder"><span class="ws-ctrl-val" id="wsWtBorderVal">' + ba + '%</span></div>' +
                '<div class="ws-section-title"><span>背 景</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">透明</div><input type="range" min="0" max="100" value="' + a + '" id="wsWtAlpha"><span class="ws-ctrl-val" id="wsWtAlphaVal">' + a + '%</span></div>' +
                '<div class="ws-ctrl-row"><div class="ws-ctrl-label">模糊</div><input type="range" min="0" max="100" value="' + bl + '" id="wsWtBlur"><span class="ws-ctrl-val" id="wsWtBlurVal">' + bl + 'px</span></div>' +
                '<div class="ws-section-title"><span>颜 色</span></div>' +
                '<div class="ws-ctrl-color-row">' +
                  '<div class="ws-ctrl-color-item"><input type="color" value="' + bgC + '" id="wsWtBgColor"><label>底色</label></div>' +
                  '<div class="ws-ctrl-color-item"><input type="color" value="' + fC + '" id="wsWtFontColor"><label>字体</label></div>' +
                  '<div class="ws-ctrl-color-item"><input type="color" value="' + lC + '" id="wsWtLineColor"><label>线条</label></div>' +
                '</div>' +
              '</div>' +
            '</div></div>' +
            '<div style="display:flex;gap:10px;margin-top:10px;">' +
              '<div class="bm-wk" id="wsWtSave" style="flex:1;"><div class="bm-wk-body" style="padding:10px 6px;gap:0;"><div class="bm-wk-inner"></div><div class="bm-wk-text">保存</div></div></div>' +
              '<div class="bm-wk" id="wsWtReset" style="flex:1;"><div class="bm-wk-body" style="padding:10px 6px;gap:0;"><div class="bm-wk-inner"></div><div class="bm-wk-text">重置</div></div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    buildPlaceholderPage: function(title, idx) {
      return '<div class="ball-card-page" data-page="' + idx + '" style="width:' + CTRL_W + 'px">' +
        '<div class="bm-card">' +
          '<div class="ws-placeholder">' + App.esc(title) + '<br>调节功能开发中...</div>' +
        '</div>' +
      '</div>';
    },

    bindMenuEvents: function() {
      var menu = Workshop.menuEl;

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
      a.href = url; a.download = 'mono-space-backup-' + new Date().toISOString().slice(0,10) + '.json';
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

    bindSwipe: function() {
      var menu = Workshop.menuEl;
      var slider = Workshop.sliderEl;

      var _touch = {
        active: false,
        mode: '', // 'swipe' | 'drag' | ''
        sx: 0, sy: 0,
        ox: 0, oy: 0,
        baseSlider: 0
      };

      menu.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        if (e.target.closest('input')) return;

        var t = e.touches[0];
        var rect = menu.getBoundingClientRect();

        _touch = {
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
        if (!_touch.active) return;
        e.stopPropagation();

        var t = e.touches[0];
        var dx = t.clientX - _touch.sx;
        var dy = t.clientY - _touch.sy;
        var adx = Math.abs(dx);
        var ady = Math.abs(dy);

        // 还没锁定方向
        if (!_touch.mode) {
          if (adx < 6 && ady < 6) return; // 太小，不动

          // 横向且不在第一页且是往右滑（回退）→ 翻页
          if (adx > ady && Workshop.currentPage > 0 && dx > 0) {
            _touch.mode = 'swipe';
          } else {
            // 其他情况 → 拖拽菜单
            _touch.mode = 'drag';
          }
        }

        e.preventDefault();

        if (_touch.mode === 'drag') {
          menu.style.left = (_touch.ox + dx) + 'px';
          menu.style.top = (_touch.oy + dy) + 'px';
          menu.style.right = 'auto';
        } else if (_touch.mode === 'swipe') {
          var nextX = _touch.baseSlider + dx;
          if (nextX > 0) nextX *= 0.25;
          slider.style.transform = 'translateX(' + nextX + 'px)';
        }
      }, { passive: false });

      menu.addEventListener('touchend', function() {
        if (!_touch.active) return;
        _touch.active = false;
        slider.style.transition = '';

        if (_touch.mode === 'swipe') {
          var t2 = Workshop.currentPage;
          var pw = Workshop.getPageWidth(t2);
          // 用最后位置算
          var el = slider.style.transform.match(/translateX\((.+?)px\)/);
          var currentX = el ? parseFloat(el[1]) : _touch.baseSlider;
          var delta = currentX - _touch.baseSlider;

          if (delta > pw * 0.25 && t2 > 0) {
            var target = t2 <= 2 ? t2 - 1 : 1;
            Workshop.goToPage(target);
          } else {
            Workshop.goToPage(t2);
          }
        }

        _touch.mode = '';
      }, { passive: true });

      menu.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: false });
      menu.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: false });
            // 卡片整体拖拽
      var _menuDrag = { active: false, sx: 0, sy: 0, ox: 0, oy: 0 };

      menu.addEventListener('touchstart', function(e) {
        if (e.target.closest('input')) return;
        if (e.target.closest('.bm-tk') || e.target.closest('.bm-wk')) return;
        if (e.target.closest('.ws-ctrl-row') || e.target.closest('.ws-ctrl-color-row')) return;
        var t = e.touches[0];
        var rect = menu.getBoundingClientRect();
        _menuDrag = { active: true, sx: t.clientX, sy: t.clientY, ox: rect.left, oy: rect.top, moved: false };
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        if (!_menuDrag.active) return;
        var t = e.touches[0];
        var dx = Math.abs(t.clientX - _menuDrag.sx);
        var dy = Math.abs(t.clientY - _menuDrag.sy);
        if (!_menuDrag.moved && dx < 6 && dy < 6) return;
        _menuDrag.moved = true;
        e.preventDefault();
        var nx = _menuDrag.ox + t.clientX - _menuDrag.sx;
        var ny = _menuDrag.oy + t.clientY - _menuDrag.sy;
        menu.style.left = nx + 'px';
        menu.style.top = ny + 'px';
        menu.style.right = 'auto';
      }, { passive: false });

      document.addEventListener('touchend', function() {
        _menuDrag.active = false;
      });
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
      var menuH = menu.offsetHeight || 300;
      var ballCX = rect.left + rect.width / 2;
      var ballCY = rect.top + rect.height / 2;

      if (ballCX > window.innerWidth / 2) {
        menu.style.right = (window.innerWidth - rect.left + 10) + 'px';
        menu.style.left = 'auto';
      } else {
        menu.style.left = (rect.right + 10) + 'px';
        menu.style.right = 'auto';
      }

      var top = ballCY - menuH / 2;
      if (top < 10) top = 10;
      if (top + menuH > window.innerHeight - 10) top = window.innerHeight - menuH - 10;
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
