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
    isDragging: false,

    load: function() {
      Cal.data = App.LS.get('wtCardConfig') || JSON.parse(JSON.stringify(DEFAULTS));
    },

    save: function() {
      App.LS.set('wtCardConfig', Cal.data);
    },

    hexToRgb: function(hex) {
      hex = hex || '#ffffff';
      return {
        r: parseInt(hex.substr(1,2),16) || 255,
        g: parseInt(hex.substr(3,2),16) || 255,
        b: parseInt(hex.substr(5,2),16) || 255
      };
    },

    applyConfig: function(cfg) {
      var card = App.$('#wtCard');
      if (!card) return;

      var c = cfg || Cal.data;
      var s = (c.scale || 72) / 100;
      var rgb = Cal.hexToRgb(c.colorHex);
      var frgb = Cal.hexToRgb(c.fontColor);
      var lrgb = Cal.hexToRgb(c.lineColor);
      var a = (c.alpha != null ? c.alpha : 0) / 100;
      var ba = (c.borderAlpha != null ? c.borderAlpha : 15) / 100;

      card.style.setProperty('--S', s);
      card.style.setProperty('--wt-bg-r', rgb.r);
      card.style.setProperty('--wt-bg-g', rgb.g);
      card.style.setProperty('--wt-bg-b', rgb.b);
      card.style.setProperty('--wt-bg-alpha', a);
      card.style.setProperty('--wt-blur', c.blur != null ? c.blur : 7);
      card.style.setProperty('--wt-radius', c.radius != null ? c.radius : 16);
      card.style.setProperty('--wt-border-alpha', ba);

      // 字体
      card.style.setProperty('--wt-ink', c.fontColor || '#e8e8e8');
      card.style.setProperty('--wt-ink2', 'rgba(' + frgb.r + ',' + frgb.g + ',' + frgb.b + ',0.75)');
      card.style.setProperty('--wt-ink3', 'rgba(' + frgb.r + ',' + frgb.g + ',' + frgb.b + ',0.5)');
      card.style.setProperty('--wt-ink4', 'rgba(' + frgb.r + ',' + frgb.g + ',' + frgb.b + ',0.3)');

      // 线条
      card.style.setProperty('--wt-line', 'rgba(' + lrgb.r + ',' + lrgb.g + ',' + lrgb.b + ',0.08)');
      card.style.setProperty('--wt-line2', 'rgba(' + lrgb.r + ',' + lrgb.g + ',' + lrgb.b + ',0.04)');
      card.style.setProperty('--wt-gold', 'rgba(' + lrgb.r + ',' + lrgb.g + ',' + lrgb.b + ',0.25)');
      card.style.setProperty('--wt-gold2', 'rgba(' + lrgb.r + ',' + lrgb.g + ',' + lrgb.b + ',0.12)');
    },

    // ====== 时钟 ======
    startClock: function() {
      function tick() {
        var d = new Date();
        var hh = App.$('#wt-hh');
        if (!hh) return;
        hh.textContent = pad(d.getHours());
        App.$('#wt-mm').textContent = pad(d.getMinutes());
        App.$('#wt-ss').textContent = pad(d.getSeconds());
        App.$('#wt-fd').textContent = d.getFullYear() + '年' + pad(d.getMonth()+1) + '月' + pad(d.getDate()) + '日';
        App.$('#wt-wk').textContent = WK[d.getDay()];
      }
      tick();
      setInterval(tick, 1000);
    },

    // ====== 定位 ======
    initGeo: function() {
      var el = App.$('#location-coords');
      if (!el) return;
      if (!("geolocation" in navigator)) {
        el.textContent = '不支持定位';
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          el.textContent = pos.coords.latitude.toFixed(2) + '°N ' + pos.coords.longitude.toFixed(2) + '°E';
        },
        function(err) {
          el.textContent = '定位失败';
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
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
          if (!data || !data.current_weather) return;
          var temp = Math.round(data.current_weather.temperature);
          var code = data.current_weather.weathercode;
          var el = App.$('#wt-temp-val');
          var desc = App.$('#wt-desc-val');
          if (el) el.textContent = temp;
          if (desc) desc.textContent = Cal.weatherDesc(code);
        }).catch(function() {});
      }, function() {}, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
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

      var startX, startY, origX, origY, moved, longPressed, timer;

      card.addEventListener('touchstart', function(e) {
        var t = e.touches[0];
        var rect = card.getBoundingClientRect();
        startX = t.clientX;
        startY = t.clientY;
        origX = rect.left;
        origY = rect.top;
        moved = false;
        longPressed = false;

        timer = setTimeout(function() {
          longPressed = true;
          Cal.isDragging = true;
          card.classList.add('wt-dragging');

          var parent = card.parentElement;
          if (parent) {
            var ps = getComputedStyle(parent);
            if (ps.position === 'static') parent.style.position = 'relative';
          }

          card.style.position = 'absolute';
          card.style.margin = '0';

          var pRect = parent.getBoundingClientRect();
          card.style.left = (origX - pRect.left) + 'px';
          card.style.top = (origY - pRect.top) + 'px';

          if (navigator.vibrate) navigator.vibrate(15);
        }, 400);
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        if (timer && !longPressed) {
          var t = e.touches[0];
          if (Math.abs(t.clientX - startX) > 8 || Math.abs(t.clientY - startY) > 8) {
            clearTimeout(timer);
            timer = null;
          }
          return;
        }
        if (!longPressed || !Cal.isDragging) return;

        var t = e.touches[0];
        var parent = card.parentElement;
        if (!parent) return;
        var pRect = parent.getBoundingClientRect();

        var nx = t.clientX - (startX - origX) - pRect.left;
        var ny = t.clientY - (startY - origY) - pRect.top;

        card.style.left = nx + 'px';
        card.style.top = ny + 'px';
        moved = true;
      }, { passive: true });

      document.addEventListener('touchend', function() {
        clearTimeout(timer);
        timer = null;

        if (Cal.isDragging && moved) {
          App.LS.set('wtCardPos', {
            x: parseInt(card.style.left),
            y: parseInt(card.style.top)
          });
        }

        card.classList.remove('wt-dragging');
        Cal.isDragging = false;
        longPressed = false;
        moved = false;
      });
    },

    // ====== 调节面板 ======
    openCtrl: function() {
      var old = App.$('#wtCtrlWrap');
      if (old) { old.remove(); return; }

      var card = App.$('#wtCard');
      if (!card) return;
      var rect = card.getBoundingClientRect();

      var d = Cal.data;

      var wrap = document.createElement('div');
      wrap.id = 'wtCtrlWrap';
      wrap.className = 'wt-ctrl-wrap';

      // 定位到卡片下方
      var top = rect.bottom + 8;
      var left = rect.left + rect.width / 2 - 130;
      if (left < 10) left = 10;
      if (left + 260 > window.innerWidth - 10) left = window.innerWidth - 270;
      if (top + 400 > window.innerHeight) top = rect.top - 408;
      if (top < 10) top = 10;

      wrap.style.left = left + 'px';
      wrap.style.top = top + 'px';

      wrap.innerHTML =
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
            '<input type="range" id="wtcRadius" min="1" max="40" value="' + d.radius + '">' +
            '<span class="wt-ctrl-val" id="wtcRadiusVal">' + d.radius + 'px</span>' +
          '</div>' +

          '<div class="wt-ctrl-divider"></div>' +
          '<div class="wt-ctrl-section">背景</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>底色</label>' +
            '<input type="color" id="wtcColor" value="' + (d.colorHex || '#ffffff') + '">' +
          '</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>透明</label>' +
            '<input type="range" id="wtcAlpha" min="0" max="100" value="' + d.alpha + '">' +
            '<span class="wt-ctrl-val" id="wtcAlphaVal">' + d.alpha + '%</span>' +
          '</div>' +

          '<div class="wt-ctrl-row">' +
            '<label>模糊</label>' +
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
            '<label style="margin-left:8px">线条</label>' +
            '<input type="color" id="wtcLine" value="' + (d.lineColor || '#ffffff') + '">' +
          '</div>' +

          '<div class="wt-ctrl-btns">' +
            '<button class="wt-ctrl-save" id="wtcSave" type="button">保存</button>' +
            '<button class="wt-ctrl-reset" id="wtcReset" type="button">重置</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(wrap);

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
        wrap.remove();
        App.showToast('已保存');
      });

      App.$('#wtcReset').addEventListener('click', function() {
        Cal.data = JSON.parse(JSON.stringify(DEFAULTS));
        Cal.save();
        Cal.applyConfig();
        App.LS.remove('wtCardPos');
        var card = App.$('#wtCard');
        if (card) {
          card.style.position = '';
          card.style.left = '';
          card.style.top = '';
          card.style.margin = '';
        }
        wrap.remove();
        App.showToast('已重置');
      });

      // 点外面关闭
      setTimeout(function() {
        document.addEventListener('touchstart', dismissCtrl);
        document.addEventListener('click', dismissCtrl);
      }, 100);

      function dismissCtrl(e) {
        if (wrap.contains(e.target) || e.target.id === 'wtSysBtn') return;
        Cal.applyConfig();
        wrap.remove();
        document.removeEventListener('touchstart', dismissCtrl);
        document.removeEventListener('click', dismissCtrl);
      }
    },

    // ====== 点击事件 ======
    bindClicks: function() {
      // SYSTEM ACTIVE → 调节面板
      var sysBtn = App.$('#wtSysBtn');
      if (sysBtn) {
        sysBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          Cal.openCtrl();
        });
        sysBtn.addEventListener('touchend', function(e) {
          e.stopPropagation();
          e.preventDefault();
          Cal.openCtrl();
        }, { passive: false });
      }

      // 日期区域 → 日历面板
      var dateArea = App.$('#wtDateArea');
      if (dateArea) {
        dateArea.addEventListener('click', function(e) {
          e.stopPropagation();
          if (Cal.isDragging) return;
          var ctrl = App.$('#wtCtrlWrap');
          if (ctrl) ctrl.remove();
          App.openPanel('calendarPanel');
        });
      }

      // 天气区域 → 天气面板
      var weatherArea = App.$('#wtWeatherArea');
      if (weatherArea) {
        weatherArea.addEventListener('click', function(e) {
          e.stopPropagation();
          if (Cal.isDragging) return;
          var ctrl = App.$('#wtCtrlWrap');
          if (ctrl) ctrl.remove();
          App.openPanel('weatherPanel');
        });
      }
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
