(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Cal = {
    weather: null,
    coords: null,
    city: '',
    schedules: {},

    WEATHER_CODES: {
      0: '晴', 1: '大部晴', 2: '多云', 3: '阴',
      45: '雾', 48: '雾凇',
      51: '小毛雨', 53: '毛雨', 55: '大毛雨',
      61: '小雨', 63: '中雨', 65: '大雨',
      66: '冻雨', 67: '大冻雨',
      71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
      80: '小阵雨', 81: '阵雨', 82: '大阵雨',
      85: '小阵雪', 86: '大阵雪',
      95: '雷暴', 96: '雷暴+冰雹', 99: '强雷暴+冰雹'
    },

    WEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],

    load: function() {
      Cal.city = App.LS.get('calCity') || '';
      Cal.coords = App.LS.get('calCoords') || null;
      Cal.weather = App.LS.get('calWeather') || null;
      Cal.schedules = App.LS.get('calSchedules') || {};
    },

    save: function() {
      App.LS.set('calCity', Cal.city);
      App.LS.set('calCoords', Cal.coords);
      App.LS.set('calWeather', Cal.weather);
      App.LS.set('calSchedules', Cal.schedules);
    },

    todayKey: function() {
      var d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },

    tomorrowKey: function() {
      var d = new Date();
      d.setDate(d.getDate() + 1);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },

    // ========= 定位 =========
    locateByGPS: function(callback) {
      if (!navigator.geolocation) {
        callback(null, '不支持定位');
        return;
      }
      App.showToast('正在定位...');
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          var coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          Cal.reverseGeocode(coords, function(name) {
            Cal.coords = coords;
            Cal.city = name || '当前位置';
            Cal.save();
            callback(coords);
          });
        },
        function() { callback(null, '定位失败'); },
        { timeout: 10000 }
      );
    },

    reverseGeocode: function(coords, callback) {
      fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
        coords.lat + '&lon=' + coords.lon + '&zoom=10&accept-language=zh')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var a = data.address || {};
          callback(a.city || a.town || a.county || a.state || '');
        })
        .catch(function() { callback(''); });
    },

    searchCity: function(name, callback) {
      fetch('https://nominatim.openstreetmap.org/search?format=json&q=' +
        encodeURIComponent(name) + '&limit=1&accept-language=zh')
        .then(function(r) { return r.json(); })
        .then(function(results) {
          if (results && results.length) {
            var r = results[0];
            callback({ lat: parseFloat(r.lat), lon: parseFloat(r.lon) }, r.display_name.split(',')[0]);
          } else {
            callback(null, null);
          }
        })
        .catch(function() { callback(null, null); });
    },

    // ========= 天气 =========
    fetchWeather: function(coords, callback) {
      if (!coords) { if (callback) callback(null); return; }
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + coords.lat +
        '&longitude=' + coords.lon +
        '&current=temperature_2m,relative_humidity_2m,weather_code' +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
        '&timezone=auto&forecast_days=3')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.current) {
            Cal.weather = {
              temp: Math.round(data.current.temperature_2m),
              humidity: data.current.relative_humidity_2m,
              code: data.current.weather_code,
              desc: Cal.WEATHER_CODES[data.current.weather_code] || '未知',
              time: Date.now()
            };
            Cal.save();
            if (callback) callback(Cal.weather);
          } else {
            if (callback) callback(null);
          }
        })
        .catch(function() { if (callback) callback(null); });
    },

    refreshWeather: function() {
      if (Cal.coords) {
        Cal.fetchWeather(Cal.coords, function() { Cal.render(); });
      } else {
        Cal.locateByGPS(function(coords, err) {
          if (coords) {
            Cal.fetchWeather(coords, function() { Cal.render(); });
          } else {
            App.showToast(err || '无法定位');
          }
        });
      }
    },

    // ========= 日程 =========
    getSchedule: function(dateKey) {
      return Cal.schedules[dateKey] || [];
    },

    setSchedule: function(dateKey, list) {
      Cal.schedules[dateKey] = list;
      Cal.save();
    },

    addScheduleItem: function(dateKey, item) {
      if (!Cal.schedules[dateKey]) Cal.schedules[dateKey] = [];
      Cal.schedules[dateKey].push(item);
      Cal.save();
    },

    removeScheduleItem: function(dateKey, idx) {
      if (Cal.schedules[dateKey]) {
        Cal.schedules[dateKey].splice(idx, 1);
        Cal.save();
      }
    },

    // ========= 获取天气摘要给chat用 =========
    getWeatherSummary: function() {
      if (!Cal.weather) return '';
      return '当前天气: ' + Cal.weather.desc + ', ' + Cal.weather.temp + '°C, 湿度' + Cal.weather.humidity + '%';
    },

    getScheduleSummary: function() {
      var list = Cal.getSchedule(Cal.todayKey());
      if (!list.length) return '今日无外出行程。';
      return '今日行程:\n' + list.map(function(item) {
        return item.time + ' ' + item.content;
      }).join('\n');
    },

    // ========= 渲染主页卡片 =========
    render: function() {
      var container = App.$('#calendarWeatherRow');
      if (!container) return;

      var now = new Date();
      var month = now.getMonth() + 1;
      var date = now.getDate();
      var weekday = Cal.WEEKDAYS[now.getDay()];
      var todaySchedule = Cal.getSchedule(Cal.todayKey());
      var scheduleCount = todaySchedule.length;

      var tempText = Cal.weather ? Cal.weather.temp + '°' : '--°';
      var descText = Cal.weather ? Cal.weather.desc : '未获取';
      var humidText = Cal.weather ? '湿度 ' + Cal.weather.humidity + '%' : '';

      container.innerHTML =
        '<div class="cal-card cal-weather-card" id="weatherCardTap">' +
          '<div class="cal-card-inner">' +
            '<div class="cal-temp">' + tempText + '</div>' +
            '<div class="cal-desc">' + descText + '</div>' +
            '<div class="cal-humid">' + humidText + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="cal-card cal-date-card" id="dateCardTap">' +
          '<div class="cal-card-inner">' +
            '<div class="cal-month">' + month + '月</div>' +
            '<div class="cal-day">' + date + '</div>' +
            '<div class="cal-weekday">' + weekday + '</div>' +
            (scheduleCount > 0
              ? '<div class="cal-schedule-dot">' + scheduleCount + '条行程</div>'
              : '') +
          '</div>' +
        '</div>';

      App.safeOn('#weatherCardTap', 'click', function() { Cal.openWeatherPanel(); });
      App.safeOn('#dateCardTap', 'click', function() { Cal.openSchedulePanel(); });
    },

    // ========= 天气设置面板 =========
    openWeatherPanel: function() {
      var panel = App.$('#calPanel');
      if (!panel) return;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closeCalPanel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>天气设置</h2>' +
          '<div></div>' +
        '</div>' +
        '<div class="fullpage-body">' +
          '<div class="cal-setting-card">' +
            '<div class="cal-setting-label">当前城市</div>' +
            '<div class="cal-setting-value">' + App.esc(Cal.city || '未设置') + '</div>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>手动输入城市</label>' +
            '<div class="input-with-btn">' +
              '<input type="text" id="calCityInput" placeholder="例如：深圳、北京、东京...">' +
              '<button class="icon-btn" id="calSearchCityBtn" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">' +
                '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div class="btn-row">' +
            '<button class="btn btn-primary" id="calGPSBtn" type="button">自动定位</button>' +
            '<button class="btn btn-outline" id="calRefreshBtn" type="button">刷新天气</button>' +
          '</div>' +

          (Cal.weather
            ? '<div class="cal-weather-detail">' +
                '<div class="cal-detail-row"><span>温度</span><span>' + Cal.weather.temp + '°C</span></div>' +
                '<div class="cal-detail-row"><span>天气</span><span>' + Cal.weather.desc + '</span></div>' +
                '<div class="cal-detail-row"><span>湿度</span><span>' + Cal.weather.humidity + '%</span></div>' +
              '</div>'
            : '') +

        '</div>';

      panel.classList.remove('hidden');
      setTimeout(function() { panel.classList.add('show'); }, 20);

      App.safeOn('#closeCalPanel', 'click', function() { Cal.closePanel(); });

      App.safeOn('#calSearchCityBtn', 'click', function() {
        var name = App.$('#calCityInput').value.trim();
        if (!name) { App.showToast('请输入城市名'); return; }
        App.showToast('搜索中...');
        Cal.searchCity(name, function(coords, displayName) {
          if (coords) {
            Cal.coords = coords;
            Cal.city = displayName || name;
            Cal.save();
            Cal.fetchWeather(coords, function() {
              Cal.render();
              Cal.openWeatherPanel();
              App.showToast('已切换: ' + Cal.city);
            });
          } else {
            App.showToast('未找到该城市');
          }
        });
      });

      App.safeOn('#calGPSBtn', 'click', function() {
        Cal.locateByGPS(function(coords, err) {
          if (coords) {
            Cal.fetchWeather(coords, function() {
              Cal.render();
              Cal.openWeatherPanel();
              App.showToast('定位成功: ' + Cal.city);
            });
          } else {
            App.showToast(err || '定位失败');
          }
        });
      });

      App.safeOn('#calRefreshBtn', 'click', function() {
        if (!Cal.coords) { App.showToast('请先设置城市'); return; }
        App.showToast('刷新中...');
        Cal.fetchWeather(Cal.coords, function() {
          Cal.render();
          Cal.openWeatherPanel();
          App.showToast('天气已刷新');
        });
      });
    },

    // ========= 日程面板 =========
    openSchedulePanel: function() {
      var panel = App.$('#calPanel');
      if (!panel) return;

      var key = Cal.todayKey();
      var list = Cal.getSchedule(key);

      var now = new Date();
      var dateStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + Cal.WEEKDAYS[now.getDay()];

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closeCalPanel2">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>今日行程</h2>' +
          '<button class="fullpage-action-btn" id="addScheduleBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +
          '<div class="cal-schedule-date">' + dateStr + '</div>' +
          '<div id="scheduleList" class="cal-schedule-list"></div>' +
        '</div>';

      Cal.renderScheduleList(key);

      panel.classList.remove('hidden');
      setTimeout(function() { panel.classList.add('show'); }, 20);

      App.safeOn('#closeCalPanel2', 'click', function() { Cal.closePanel(); });
      App.safeOn('#addScheduleBtn', 'click', function() { Cal.openEditSchedule(key, -1); });
    },

    renderScheduleList: function(key) {
      var container = App.$('#scheduleList');
      if (!container) return;

      var list = Cal.getSchedule(key);

      if (!list.length) {
        container.innerHTML = '<div class="empty-hint">今日暂无外出行程</div>';
        return;
      }

      container.innerHTML = list.map(function(item, idx) {
        return '<div class="cal-schedule-item">' +
          '<div class="cal-schedule-time">' + App.esc(item.time || '') + '</div>' +
          '<div class="cal-schedule-content">' + App.esc(item.content || '') + '</div>' +
          '<div class="cal-schedule-actions">' +
            '<button class="sortable-edit-btn" data-idx="' + idx + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
            '</button>' +
            '<button class="sortable-del-btn" data-idx="' + idx + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');

      container.querySelectorAll('.sortable-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          Cal.openEditSchedule(key, parseInt(btn.dataset.idx, 10));
        });
      });

      container.querySelectorAll('.sortable-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('删除这条行程？')) return;
          Cal.removeScheduleItem(key, parseInt(btn.dataset.idx, 10));
          Cal.renderScheduleList(key);
          Cal.render();
          App.showToast('已删除');
        });
      });
    },

    openEditSchedule: function(key, idx) {
      var isNew = idx < 0;
      var list = Cal.getSchedule(key);
      var item = isNew ? { time: '', content: '' } : list[idx];

      var panel = App.$('#calPanel');
      if (!panel) return;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToSchedule">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '添加行程' : '编辑行程') + '</h2>' +
          '<button class="fullpage-action-btn" id="saveScheduleBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +
          '<div class="form-group">' +
            '<label>时间</label>' +
            '<input type="time" id="scheduleTime" value="' + App.esc(item.time || '') + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label>行程内容</label>' +
            '<textarea class="form-textarea" id="scheduleContent" rows="4" placeholder="外出行程...">' + App.esc(item.content || '') + '</textarea>' +
          '</div>' +
        '</div>';

      App.safeOn('#backToSchedule', 'click', function() { Cal.openSchedulePanel(); });

      App.safeOn('#saveScheduleBtn', 'click', function() {
        var time = App.$('#scheduleTime').value;
        var content = App.$('#scheduleContent').value.trim();
        if (!content) { App.showToast('请输入行程内容'); return; }

        var newItem = { time: time, content: content };
        if (isNew) {
          Cal.addScheduleItem(key, newItem);
        } else {
          list[idx] = newItem;
          Cal.setSchedule(key, list);
        }

        Cal.render();
        Cal.openSchedulePanel();
        App.showToast(isNew ? '已添加' : '已保存');
      });
    },

    closePanel: function() {
      var panel = App.$('#calPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    // ========= 自动刷新 =========
    startAutoRefresh: function() {
      // 每30分钟刷新一次天气
      setInterval(function() {
        if (Cal.coords) {
          Cal.fetchWeather(Cal.coords, function() { Cal.render(); });
        }
      }, 30 * 60 * 1000);

      // 每分钟检查日期是否变了，变了就重新渲染
      var lastDateKey = Cal.todayKey();
      setInterval(function() {
        var current = Cal.todayKey();
        if (current !== lastDateKey) {
          lastDateKey = current;
          Cal.render();
        }
      }, 60 * 1000);
    },

    init: function() {
      Cal.load();

      // 创建面板
      if (!App.$('#calPanel')) {
        var panel = document.createElement('div');
        panel.id = 'calPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }

      Cal.render();

      // 如果有坐标且天气数据超过30分钟，自动刷新
      if (Cal.coords) {
        var age = Cal.weather ? Date.now() - (Cal.weather.time || 0) : Infinity;
        if (age > 30 * 60 * 1000) {
          Cal.fetchWeather(Cal.coords, function() { Cal.render(); });
        }
      }

      Cal.startAutoRefresh();
      App.calendar = Cal;
    }
  };

  App.register('calendar', Cal);
})();
