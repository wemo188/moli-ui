(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Cal = {
    weather: null,
    city: '',
    schedules: {},

    WEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],

    load: function() {
      Cal.city = App.LS.get('calCity') || '';
      Cal.weather = App.LS.get('calWeather') || null;
      Cal.schedules = App.LS.get('calSchedules') || {};
    },

    save: function() {
      App.LS.set('calCity', Cal.city);
      App.LS.set('calWeather', Cal.weather);
      App.LS.set('calSchedules', Cal.schedules);
    },

    todayKey: function() {
      var d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },

    // ========= 天气 =========
    fetchWeather: function(city, callback) {
      if (!city) { if (callback) callback(null); return; }
      fetch('https://wttr.in/' + encodeURIComponent(city) + '?format=j1&lang=zh')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.current_condition && data.current_condition.length) {
            var c = data.current_condition[0];
            var desc = '';
            if (c.lang_zh && c.lang_zh.length) {
              desc = c.lang_zh[0].value;
            } else {
              desc = c.weatherDesc && c.weatherDesc.length ? c.weatherDesc[0].value : '';
            }
            Cal.weather = {
              temp: c.temp_C,
              humidity: c.humidity,
              desc: desc,
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
      if (!Cal.city) return;
      Cal.fetchWeather(Cal.city, function() { Cal.render(); });
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

    // ========= 给chat用的摘要 =========
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
      var descText = Cal.weather ? Cal.weather.desc : '点击设置';
      var humidText = Cal.weather ? '湿度 ' + Cal.weather.humidity + '%' : '';

      // 日程预览
      var schedulePreview = '';
      if (scheduleCount > 0) {
        schedulePreview = todaySchedule.map(function(item) {
          var t = item.time ? item.time + ' ' : '';
          return t + item.content;
        }).join('\n');
      }

      container.innerHTML =
        '<div class="cal-card" id="weatherCardTap">' +
          '<div class="cal-card-inner">' +
            '<div class="cal-temp">' + tempText + '</div>' +
            '<div class="cal-desc">' + descText + '</div>' +
            '<div class="cal-humid">' + humidText + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="cal-card" id="dateCardTap">' +
          '<div class="cal-card-inner">' +
            '<div class="cal-month">' + month + '月</div>' +
            '<div class="cal-day">' + date + '</div>' +
            '<div class="cal-weekday">' + weekday + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="cal-card" id="scheduleCardTap">' +
          '<div class="cal-card-inner">' +
            '<div class="cal-schedule-label">今日行程</div>' +
            (scheduleCount > 0
              ? '<div class="cal-schedule-preview">' + App.esc(schedulePreview) + '</div>'
              : '<div class="cal-schedule-none">暂无</div>') +
          '</div>' +
        '</div>';

      App.safeOn('#weatherCardTap', 'click', function() { Cal.openWeatherPanel(); });
      App.safeOn('#dateCardTap', 'click', function() { Cal.openSchedulePanel(); });
      App.safeOn('#scheduleCardTap', 'click', function() { Cal.openSchedulePanel(); });
    },

    // ========= 天气面板 =========
    openWeatherPanel: function() {
      var panel = App.$('#calPanel');
      if (!panel) return;

      panel.innerHTML =
        '<div class="cal-panel-header">' +
          '<div class="cal-panel-back" id="closeCalPanel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>天气</h2>' +
          '<div class="cal-panel-right"></div>' +
        '</div>' +
        '<div class="cal-panel-body">' +

          '<div class="cal-info-card">' +
            '<div class="cal-info-row">' +
              '<span class="cal-info-label">当前城市</span>' +
              '<span class="cal-info-value">' + App.esc(Cal.city || '未设置') + '</span>' +
            '</div>' +
          '</div>' +

          '<div class="cal-form-group">' +
            '<label class="cal-form-label">切换城市</label>' +
            '<div class="cal-input-row">' +
              '<input type="text" class="cal-input" id="calCityInput" placeholder="输入城市名，如：深圳、北京...">' +
              '<button class="cal-icon-btn" id="calSearchCityBtn" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<button class="cal-btn cal-btn-dark" id="calRefreshBtn" type="button">刷新天气</button>' +

          (Cal.weather
            ? '<div class="cal-info-card" style="margin-top:20px;">' +
                '<div class="cal-info-row">' +
                  '<span class="cal-info-label">温度</span>' +
                  '<span class="cal-info-value">' + Cal.weather.temp + '°C</span>' +
                '</div>' +
                '<div class="cal-info-row">' +
                  '<span class="cal-info-label">天气</span>' +
                  '<span class="cal-info-value">' + Cal.weather.desc + '</span>' +
                '</div>' +
                '<div class="cal-info-row">' +
                  '<span class="cal-info-label">湿度</span>' +
                  '<span class="cal-info-value">' + Cal.weather.humidity + '%</span>' +
                '</div>' +
              '</div>'
            : '') +

        '</div>';

      panel.classList.remove('hidden');
      setTimeout(function() { panel.classList.add('show'); }, 20);

      App.safeOn('#closeCalPanel', 'click', function() { Cal.closePanel(); });

      App.safeOn('#calSearchCityBtn', 'click', function() {
        var name = App.$('#calCityInput').value.trim();
        if (!name) { App.showToast('请输入城市名'); return; }
        App.showToast('获取天气中...');
        Cal.city = name;
        Cal.save();
        Cal.fetchWeather(name, function(w) {
          if (w) {
            Cal.render();
            Cal.openWeatherPanel();
            App.showToast('已切换: ' + name);
          } else {
            App.showToast('获取失败，请检查城市名');
          }
        });
      });

      App.safeOn('#calRefreshBtn', 'click', function() {
        if (!Cal.city) { App.showToast('请先设置城市'); return; }
        App.showToast('刷新中...');
        Cal.fetchWeather(Cal.city, function(w) {
          if (w) {
            Cal.render();
            Cal.openWeatherPanel();
            App.showToast('天气已刷新');
          } else {
            App.showToast('刷新失败');
          }
        });
      });
    },

    // ========= 日程面板 =========
    openSchedulePanel: function() {
      var panel = App.$('#calPanel');
      if (!panel) return;

      var key = Cal.todayKey();
      var now = new Date();
      var dateStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + Cal.WEEKDAYS[now.getDay()];

      panel.innerHTML =
        '<div class="cal-panel-header">' +
          '<div class="cal-panel-back" id="closeCalPanel2">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>今日行程</h2>' +
          '<button class="cal-panel-action" id="addScheduleBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="cal-panel-body">' +
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
        container.innerHTML = '<div class="cal-empty">今日暂无外出行程</div>';
        return;
      }

      container.innerHTML = list.map(function(item, idx) {
        return '<div class="cal-schedule-item">' +
          '<div class="cal-schedule-time">' + App.esc(item.time || '') + '</div>' +
          '<div class="cal-schedule-dot-line">' +
            '<div class="cal-schedule-dot-circle"></div>' +
          '</div>' +
          '<div class="cal-schedule-right">' +
            '<div class="cal-schedule-content">' + App.esc(item.content || '') + '</div>' +
            '<div class="cal-schedule-actions">' +
              '<button class="cal-sm-btn cal-sm-edit" data-idx="' + idx + '" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>' +
              '</button>' +
              '<button class="cal-sm-btn cal-sm-del" data-idx="' + idx + '" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      container.querySelectorAll('.cal-sm-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          Cal.openEditSchedule(key, parseInt(btn.dataset.idx, 10));
        });
      });

      container.querySelectorAll('.cal-sm-del').forEach(function(btn) {
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
        '<div class="cal-panel-header">' +
          '<div class="cal-panel-back" id="backToSchedule">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '添加行程' : '编辑行程') + '</h2>' +
          '<button class="cal-panel-action" id="saveScheduleBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="cal-panel-body">' +
          '<div class="cal-form-group">' +
            '<label class="cal-form-label">时间</label>' +
            '<input type="time" class="cal-input" id="scheduleTime" value="' + App.esc(item.time || '') + '">' +
          '</div>' +
          '<div class="cal-form-group">' +
            '<label class="cal-form-label">行程内容</label>' +
            '<textarea class="cal-textarea" id="scheduleContent" rows="4" placeholder="外出行程...">' + App.esc(item.content || '') + '</textarea>' +
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
      setInterval(function() {
        if (Cal.city) {
          Cal.fetchWeather(Cal.city, function() { Cal.render(); });
        }
      }, 30 * 60 * 1000);

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

      if (!App.$('#calPanel')) {
        var panel = document.createElement('div');
        panel.id = 'calPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }

      Cal.render();

      if (Cal.city && Cal.weather) {
        var age = Date.now() - (Cal.weather.time || 0);
        if (age > 30 * 60 * 1000) {
          Cal.fetchWeather(Cal.city, function() { Cal.render(); });
        }
      }

      Cal.startAutoRefresh();
      App.calendar = Cal;
    }
  };

  App.register('calendar', Cal);
})();
