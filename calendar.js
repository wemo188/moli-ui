(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var WK = ['周日','周一','周二','周三','周四','周五','周六'];
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  var DEFAULTS = {
    scale: 72,
    alpha: 0,
    blur: 7,
    radius: 16,
    colorHex: '#ffffff',
    borderAlpha: 15,
    fontColor: '#e8e8e8',
    lineColor: '#ffffff'
  };

  var Cal = {
    data: {},
    dragState: null,

    load: function() {
      Cal.data = App.LS.get('wtCardConfig') || JSON.parse(JSON.stringify(DEFAULTS));
    },

    save: function() {
      App.LS.set('wtCardConfig', Cal.data);
    },

    hexToRgb: function(hex) {
      return {
        r: parseInt(hex.substr(1,2),16),
        g: parseInt(hex.substr(3,2),16),
        b: parseInt(hex.substr(5,2),16)
      };
    },

    applyConfig: function(cfg) {
      var card = App.$('#wtCard');
      if (!card) return;

      var c = cfg || Cal.data;
      var s = (c.scale || 72) / 100;
      var rgb = Cal.hexToRgb(c.colorHex || '#ffffff');
      var frgb = Cal.hexToRgb(c.fontColor || '#e8e8e8');
      var lrgb = Cal.hexToRgb(c.lineColor || '#ffffff');
      var a = (c.alpha || 0) / 100;
      var ba = (c.borderAlpha || 15) / 100;

      card.style.setProperty('--S', s);
      card.style.setProperty('--wt-bg-r', rgb.r);
      card.style.setProperty('--wt-bg-g', rgb.g);
      card.style.setProperty('--wt-bg-b', rgb.b);
      card.style.setProperty('--wt-bg-alpha', a);
      card.style.setProperty('--wt-blur', c.blur || 7);
      card.style.setProperty('--wt-radius', c.radius || 16);
      card.style.setProperty('--wt-border-alpha', ba);

      // 字体颜色
      var fc = c.fontColor || '#e8e8e8';
      var fc2 = 'rgba(' + frgb.r + ',' + frgb.g + ',' + frgb.b + ',0.75)';
      var fc3 = 'rgba(' + frgb.r + ',' + frgb.g + ',' + frgb.b + ',0.5)';
      var fc4 = 'rgba(' + frgb.r + ',' + frgb.g + ',' + frgb.b + ',0.3)';
      card.style.setProperty('--wt-ink', fc);
      card.style.setProperty('--wt-ink2', fc2);
      card.style.setProperty('--wt-ink3', fc3);
      card.style.setProperty('--wt-ink4', fc4);

      // 线条颜色
      var la = 'rgba(' + lrgb.r + ',' + lrgb.g + ',' + lrgb.b + ',0.08)';
      var la2 = 'rgba(' + lrgb.r + ',' + lrgb.g + ',' + lrgb.b + ',0.04)';
      var la3 = 'rgba(' + lrgb.r + ',' + lrgb.g + ',' + lrgb.b + ',0.25)';
      var la4 = 'rgba(' + lrgb.r + ',' + lrgb.g + ',' + lrgb.b + ',0.12)';
      card.style.setProperty('--wt-line', la);
      card.style.setProperty('--wt-line2', la2);
      card.style.setProperty('--wt-gold', la3);
      card.style.setProperty('--wt-gold2', la4);
    },

    // ====== 时钟 ======
    startClock: function() {
      function tick() {
        var d = new Date();
        var hh = App.$('#wt-hh');
        var mm = App.$('#wt-mm');
        var ss = App.$('#wt-ss');
        var fd = App.$('#wt-fd');
        var wk = App.$('#wt-wk');
        if (!hh) return;
        hh.textContent = pad(d.getHours());
        mm.textContent = pad(d.getMinutes());
        ss.textContent = pad(d.getSeconds());
        fd.textContent = d.getFullYear() + '年' + pad(d.getMonth()+1) + '月' + pad(d.getDate()) + '日';
        wk.textContent = WK[d.getDay()];
      }
      tick();
      setInterval(tick, 1000);
    },

    // ====== 定位 ======
    initGeo: function() {
      if (!("geolocation" in navigator)) return;
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          var el = App.$('#location-coords');
          if (el) el.textContent = pos.coords.latitude.toFixed(2) + '°N ' + pos.coords.longitude.toFixed(2) + '°E';
        },
        function() {
          var el = App.$('#location-coords');
          if (el) el.textContent = '定位失败';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    },

    // ====== 天气 ======
    fetchWeather: function() {
      if (!("geolocation" in navigator)) return;
      navigator.geolocation.getCurrentPosition(function(pos) {
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true&timezone=auto';
        fetch(url).then(function(r) { return r.json(); }).then(function(data) {
          if (!data.current_weather) return;
          var temp = Math.round(data.current_weather.temperature);
          var code = data.current_weather.weathercode;
          var el = App.$('#wt-temp-val');
          var desc = App.$('#wt-desc-val');
          if (el) el.textContent = temp;
          if (desc) desc.textContent = Cal.weatherDesc(code);
        }).catch(function() {});
      }, function() {}, { enableHighAccuracy: true, timeout: 10000 });
    },

    weatherDesc: function(code) {
      var map = {
        0:'晴',1:'大部晴',2:'多云',3:'阴天',
        45:'雾',48:'雾凇',51:'小毛雨',53:'毛雨',55:'大毛雨',
        61:'小雨',63:'中雨',65:'大雨',71:'小雪',73:'中雪',75:'大雪',
        80:'阵雨',81:'中阵雨',82:'大阵雨',95:'雷暴',96:'冰雹雷暴',99:'大冰雹'
      };
      return map[code] || '未知';
    },

    // ====== 拖拽 ======
    initDrag: function() {
      var card = App.$('#wtCard');
      if (!card) return;

      var savedPos = App.LS.get('wtCardPos');
      if (savedPos) {
        card.style.position = 'absolute';
        card.style.left = savedPos.x + 'px';
        card.style.top = savedPos.y + 'px';
        card.style.margin = '0';
      }

      var startX, startY, origX, origY, moved, timer;

      card.addEventListener('touchstart', function(e) {
        if (e.target.closest('.vf-lbl.lt') || e.target.closest('.wt-l') || e.target.closest('.wt-r')) return;

        var t = e.touches[0];
        var rect = card.getBoundingClientRect();
        startX = t.clientX;
        startY = t.clientY;
        origX = rect.left;
        origY = rect.top;
        moved = false;

        timer = setTimeout(function() {
          Cal.dragState = { ox: startX - origX, oy: startY - origY };
          card.classList.add('dragging');

          var parent = card.parentElement;
          if (parent) {
            var ps = getComputedStyle(parent);
            if (ps.position === 'static') parent.style.position = 'relative';
          }

          card.style.position = 'absolute';
          card.style.margin = '0';
          card.style.zIndex = '9999';

          if (navigator.vibrate) navigator.vibrate(15);
        }, 400);
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        if (!Cal.dragState && timer) {
          var t = e.touches[0];
          if (Math.abs(t.clientX - startX) > 8 || Math.abs(t.clientY - startY) > 8) {
            clearTimeout(timer);
            timer = null;
          }
          return;
        }
        if (!Cal.dragState) return;

        var t = e.touches[0];
        var parent = card.parentElement;
        if (!parent) return;
        var pRect = parent.getBoundingClientRect();

        var nx = t.clientX - Cal.dragState.ox - pRect.left;
        var ny = t.clientY - Cal.dragState.oy - pRect.top;

        card.style.left = nx + 'px';
        card.style.top = ny + 'px';
        moved = true;
      }, { passive: true });

      document.addEventListener('touchend', function() {
        clearTimeout(timer);
        timer = null;

        if (Cal.dragState && moved) {
          card.classList.remove('dragging');
          card.style.zIndex = '10';
          App.LS.set('wtCardPos', {
            x: parseInt(card.style.left),
            y: parseInt(card.style.top)
          });
        }
        Cal.dragState = null;
        moved = false;
      });
    },

    // ====== 调节面板 ======
    openCtrl: function() {
      var old = App.$('#wtCtrlOverlay');
      if (old) old.remove();

      var d = Cal.data;

      var overlay = document.createElement('div');
      overlay.id = 'wtCtrlOverlay';
      overlay.className = 'wt-ctrl-overlay';
      overlay.innerHTML =
        '<div class="wt-ctrl-panel">' +
          '<div class="wt-ctrl-title">卡片调节</div>' +

          '<div class="wt-ctrl-section">布局</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>缩放</label>' +
            '<input type="range" id="wtcScale" min="50" max="100" value="' + d.scale + '">' +
            '<span class="wt-ctrl-val" id="wtcScaleVal">' + (d.scale/100).toFixed(2) + '</span>' +
          '</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>圆角</label>' +
            '<input type="range" id="wtcRadius" min="0" max="40" value="' + d.radius + '">' +
            '<span class="wt-ctrl-val" id="wtcRadiusVal">' + d.radius + 'px</span>' +
          '</div>' +

          '<div class="wt-ctrl-divider"></div>' +
          '<div class="wt-ctrl-section">背景</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>底色</label>' +
            '<input type="color" id="wtcColor" value="' + (d.colorHex || '#ffffff') + '">' +
          '</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>透明度</label>' +
            '<input type="range" id="wtcAlpha" min="0" max="100" value="' + d.alpha + '">' +
            '<span class="wt-ctrl-val" id="wtcAlphaVal">' + d.alpha + '%</span>' +
          '</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>模糊度</label>' +
            '<input type="range" id="wtcBlur" min="0" max="100" value="' + d.blur + '">' +
            '<span class="wt-ctrl-val" id="wtcBlurVal">' + d.blur + 'px</span>' +
          '</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>边框</label>' +
            '<input type="range" id="wtcBorder" min="0" max="100" value="' + d.borderAlpha + '">' +
            '<span class="wt-ctrl-val" id="wtcBorderVal">' + d.borderAlpha + '%</span>' +
          '</div>' +

          '<div class="wt-ctrl-divider"></div>' +
          '<div class="wt-ctrl-section">颜色</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>字体</label>' +
            '<input type="color" id="wtcFont" value="' + (d.fontColor || '#e8e8e8') + '">' +
          '</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>线条</label>' +
            '<input type="color" id="wtcLine" value="' + (d.lineColor || '#ffffff') + '">' +
          '</div>' +

          '<div class="wt-ctrl-btns">' +
            '<button class="wt-ctrl-save" id="wtcSave" type="button">保存</button>' +
            '<button class="wt-ctrl-reset" id="wtcReset" type="button">重置</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      function getCfg() {
        return {
          scale: parseInt(App.$('#wtcScale').value),
          alpha: parseInt(App.$('#wtcAlpha').value),
          blur: parseInt(App.$('#wtcBlur').value),
          radius: parseInt(App.$('#wtcRadius').value),
          colorHex: App.$('#wtcColor').value,
          borderAlpha: parseInt(App.$('#wtcBorder').value),
          fontColor: App.$('#wtcFont').value,
          lineColor: App.$('#wtcLine').value
        };
      }

      function updateLabels() {
        App.$('#wtcScaleVal').textContent = (App.$('#wtcScale').value / 100).toFixed(2);
        App.$('#wtcAlphaVal').textContent = App.$('#wtcAlpha').value + '%';
        App.$('#wtcBlurVal').textContent = App.$('#wtcBlur').value + 'px';
        App.$('#wtcRadiusVal').textContent = App.$('#wtcRadius').value + 'px';
        App.$('#wtcBorderVal').textContent = App.$('#wtcBorder').value + '%';
      }

      function preview() {
        updateLabels();
        Cal.applyConfig(getCfg());
      }

      ['wtcScale','wtcAlpha','wtcBlur','wtcRadius','wtcColor','wtcBorder','wtcFont','wtcLine'].forEach(function(id) {
        App.$('#' + id).addEventListener('input', preview);
      });

      App.$('#wtcSave').addEventListener('click', function() {
        Cal.data = getCfg();
        Cal.save();
        Cal.applyConfig();
        overlay.remove();
        App.showToast('已保存');
      });

      App.$('#wtcReset').addEventListener('click', function() {
        Cal.data = JSON.parse(JSON.stringify(DEFAULTS));
        Cal.save();
        Cal.applyConfig();
        // 重置位置
        App.LS.remove('wtCardPos');
        var card = App.$('#wtCard');
        if (card) {
          card.style.position = '';
          card.style.left = '';
          card.style.top = '';
          card.style.margin = '';
        }
        overlay.remove();
        App.showToast('已重置');
      });

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          Cal.applyConfig();
          overlay.remove();
        }
      });
    },

    // ====== 点击事件 ======
    bindClicks: function() {
      // 点SYSTEM ACTIVE → 调节面板
      App.safeOn('#wtSysBtn', 'click', function(e) {
        e.stopPropagation();
        Cal.openCtrl();
      });

      // 点日期区域 → 日历面板
      App.safeOn('#wtDateArea', 'click', function(e) {
        e.stopPropagation();
        if (Cal.dragState) return;
        App.openPanel('calendarPanel');
      });

      // 点天气区域 → 天气面板
      App.safeOn('#wtWeatherArea', 'click', function(e) {
        e.stopPropagation();
        if (Cal.dragState) return;
        App.openPanel('weatherPanel');
      });
    },

    init: function() {
      Cal.load();
      Cal.applyConfig();
      Cal.startClock();
      Cal.initGeo();
      Cal.fetchWeather();
      Cal.bindClicks();
      Cal.initDrag();
    }
  };

  App.register('calendar', Cal);
})();
