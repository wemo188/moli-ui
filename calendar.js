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

    // ========= 日程备注 =========
    getSchedule: function(dateKey) {
      return Cal.schedules[dateKey] || [];
    },

    setSchedule: function(dateKey, list) {
      Cal.schedules[dateKey] = list;
      Cal.save();
    },

    addMemo: function(dateKey, memo) {
      if (!Cal.schedules[dateKey]) Cal.schedules[dateKey] = [];
      Cal.schedules[dateKey].push(memo);
      Cal.save();
    },

    getMemosForDate: function(dateKey) {
      return Cal.schedules[dateKey] || [];
    },

    removeMemo: function(dateKey, idx) {
      if (Cal.schedules[dateKey]) {
        Cal.schedules[dateKey].splice(idx, 1);
        if (!Cal.schedules[dateKey].length) delete Cal.schedules[dateKey];
        Cal.save();
      }
    },

    hasMemosForDate: function(dateKey) {
      return Cal.schedules[dateKey] && Cal.schedules[dateKey].length > 0;
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
        return (item.time || '') + ' ' + (item.content || '');
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
      var hours = String(now.getHours()).padStart(2, '0');
      var mins = String(now.getMinutes()).padStart(2, '0');
      var secs = String(now.getSeconds()).padStart(2, '0');

      var todaySchedule = Cal.getSchedule(Cal.todayKey());
      var scheduleCount = todaySchedule.length;

      var tempText = Cal.weather ? Cal.weather.temp + '°' : '--°';
      var descText = Cal.weather ? Cal.weather.desc : '未设置';
      var humidText = Cal.weather ? '湿度' + Cal.weather.humidity + '%' : '';

      var scheduleText = scheduleCount > 0 ? scheduleCount + '条' : '暂无';

      container.innerHTML =
        '<div class="cal-bar-card">' +
          '<div class="cal-bar-shine"></div>' +
          '<div class="cal-bar-row">' +

            '<div class="cal-bar-item" id="dateCardTap">' +
              '<div class="cal-bar-badge">' +
                '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2.5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="5.5"/><line x1="16" y1="2" x2="16" y2="5.5"/><line x1="7.5" y1="13" x2="10" y2="13"/><line x1="7.5" y1="17" x2="14" y2="17"/></svg>' +
              '</div>' +
              '<div class="cal-bar-text">' + month + '/' + date + '</div>' +
              '<div class="cal-bar-sub">' + weekday + '</div>' +
            '</div>' +

            '<div class="cal-bar-item" id="timeDisplay">' +
              '<div class="cal-bar-badge">' +
                '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="12" x2="16.5" y2="15"/><circle cx="12" cy="12" r=".8" fill="#fff" stroke="none"/></svg>' +
              '</div>' +
              '<div class="cal-bar-text" id="timeText">' + hours + ':' + mins + '</div>' +
              '<div class="cal-bar-sub" id="secText">' + secs + '</div>' +
            '</div>' +

            '<div class="cal-bar-item" id="weatherCardTap">' +
              '<div class="cal-bar-badge">' +
                '<svg viewBox="0 0 24 24"><circle cx="9" cy="9" r="3.2" stroke-width="1.7"/><line x1="9" y1="3.5" x2="9" y2="2"/><line x1="9" y1="15" x2="9" y2="16"/><line x1="3.5" y1="9" x2="2" y2="9"/><line x1="5.1" y1="5.1" x2="4" y2="4"/><line x1="12.9" y1="5.1" x2="14" y2="4"/><path d="M11 19.5H20A2.8 2.8 0 0 0 20 14A3.8 3.8 0 0 0 12.8 13.2A3 3 0 0 0 8.5 15.5A2.5 2.5 0 0 0 8.5 19.5Z" stroke-width="1.7"/></svg>' +
              '</div>' +
              '<div class="cal-bar-text">' + tempText + '</div>' +
              '<div class="cal-bar-sub">' + descText + '</div>' +
            '</div>' +

            '<div class="cal-bar-item" id="scheduleCardTap">' +
              '<div class="cal-bar-badge">' +
                '<svg viewBox="0 0 24 24"><path d="M5 3H15L19 7V21H5Z"/><polyline points="15,3 15,7 19,7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="14.5" x2="16" y2="14.5"/><line x1="8" y1="18" x2="13" y2="18"/></svg>' +
              '</div>' +
              '<div class="cal-bar-text">' + scheduleText + '</div>' +
              '<div class="cal-bar-sub">行程</div>' +
            '</div>' +

          '</div>' +
        '</div>';

      App.safeOn('#weatherCardTap', 'click', function() { Cal.openWeatherPanel(); });
      App.safeOn('#dateCardTap', 'click', function() { Cal.openSchedulePanel(); });
      App.safeOn('#scheduleCardTap', 'click', function() { Cal.openSchedulePanel(); });

      if (Cal._timeTimer) clearInterval(Cal._timeTimer);
      Cal._timeTimer = setInterval(function() {
        var t = new Date();
        var el = App.$('#timeText');
        var se = App.$('#secText');
        if (el) el.textContent = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
        if (se) se.textContent = String(t.getSeconds()).padStart(2, '0');
      }, 1000);
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

    // ========= 月历面板 =========
    _viewYear: 0,
    _viewMonth: 0,
    _selectedDate: '',

    openSchedulePanel: function() {
      var panel = App.$('#calPanel');
      if (!panel) return;

      var now = new Date();
      Cal._viewYear = now.getFullYear();
      Cal._viewMonth = now.getMonth();
      Cal._selectedDate = Cal.todayKey();

      Cal.renderCalendarView();

      panel.classList.remove('hidden');
      setTimeout(function() { panel.classList.add('show'); }, 20);
    },

    renderCalendarView: function() {
      var panel = App.$('#calPanel');
      if (!panel) return;

      var year = Cal._viewYear;
      var month = Cal._viewMonth;
      var monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

      panel.innerHTML =
        '<div class="cal-panel-header">' +
          '<div class="cal-panel-back" id="closeCalPanel2">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>日历</h2>' +
          '<button class="cal-panel-action" id="addMemoBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="cal-panel-body">' +

          '<div class="cal-month-header">' +
            '<div class="cal-month-nav">' +
              '<button class="cal-month-nav-btn" id="calPrevMonth" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>' +
              '</button>' +
            '</div>' +
            '<div class="cal-month-title">' + year + '年' + monthNames[month] + '</div>' +
            '<div class="cal-month-nav">' +
              '<button class="cal-month-nav-btn" id="calNextMonth" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div class="cal-weekday-row">' +
            '<div class="cal-weekday-cell">日</div>' +
            '<div class="cal-weekday-cell">一</div>' +
            '<div class="cal-weekday-cell">二</div>' +
            '<div class="cal-weekday-cell">三</div>' +
            '<div class="cal-weekday-cell">四</div>' +
            '<div class="cal-weekday-cell">五</div>' +
            '<div class="cal-weekday-cell">六</div>' +
          '</div>' +

          '<div class="cal-days-grid" id="calDaysGrid"></div>' +

          '<div id="calSelectedSection"></div>' +

        '</div>';

      Cal.renderDaysGrid();
      Cal.renderSelectedSection();

      App.safeOn('#closeCalPanel2', 'click', function() { Cal.closePanel(); });

      App.safeOn('#calPrevMonth', 'click', function() {
        Cal._viewMonth--;
        if (Cal._viewMonth < 0) { Cal._viewMonth = 11; Cal._viewYear--; }
        Cal.renderCalendarView();
      });

      App.safeOn('#calNextMonth', 'click', function() {
        Cal._viewMonth++;
        if (Cal._viewMonth > 11) { Cal._viewMonth = 0; Cal._viewYear++; }
        Cal.renderCalendarView();
      });

      App.safeOn('#addMemoBtn', 'click', function() {
        Cal.openEditMemo(Cal._selectedDate, -1);
      });
    },

    renderDaysGrid: function() {
      var grid = App.$('#calDaysGrid');
      if (!grid) return;

      var year = Cal._viewYear;
      var month = Cal._viewMonth;
      var today = Cal.todayKey();

      var firstDay = new Date(year, month, 1).getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();

      var html = '';

      for (var e = 0; e < firstDay; e++) {
        html += '<div class="cal-day-cell cal-day-empty"></div>';
      }

      for (var d = 1; d <= daysInMonth; d++) {
        var dateKey = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var dayOfWeek = new Date(year, month, d).getDay();
        var classes = 'cal-day-cell';

        if (dateKey === today) classes += ' cal-day-today';
        if (dateKey === Cal._selectedDate) classes += ' cal-day-selected';
        if (dayOfWeek === 0) classes += ' cal-day-sunday';
        if (dayOfWeek === 6) classes += ' cal-day-saturday';

        var hasMemos = Cal.hasMemosForDate(dateKey);
        var hasImportant = false;
        if (hasMemos) {
          var memos = Cal.getMemosForDate(dateKey);
          for (var m = 0; m < memos.length; m++) {
            if (memos[m].type === 'important') { hasImportant = true; break; }
          }
        }

        html += '<div class="' + classes + '" data-date="' + dateKey + '">' +
          (hasImportant ? '<div class="cal-important-badge"></div>' : '') +
          '<div class="cal-day-num">' + d + '</div>' +
          (hasMemos ? '<div class="cal-day-dot"></div>' : '') +
        '</div>';
      }

      grid.innerHTML = html;

      grid.querySelectorAll('.cal-day-cell:not(.cal-day-empty)').forEach(function(cell) {
        cell.addEventListener('click', function() {
          Cal._selectedDate = cell.dataset.date;
          Cal.renderDaysGrid();
          Cal.renderSelectedSection();
        });
      });
    },

    renderSelectedSection: function() {
      var section = App.$('#calSelectedSection');
      if (!section) return;

      var dateKey = Cal._selectedDate;
      if (!dateKey) { section.innerHTML = ''; return; }

      var parts = dateKey.split('-');
      var dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      var dateStr = parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日 ' + Cal.WEEKDAYS[dateObj.getDay()];

      var memos = Cal.getMemosForDate(dateKey);

      var html = '<div class="cal-selected-date-title">' + dateStr + '</div>';

      if (!memos.length) {
        html += '<div class="cal-empty">暂无记录，点击右上角 + 添加</div>';
      } else {
        html += memos.map(function(memo, idx) {
          var typeClass = 'cal-memo-type-schedule';
          var typeLabel = '行程';
          if (memo.type === 'important') { typeClass = 'cal-memo-type-important'; typeLabel = '重要'; }
          if (memo.type === 'char') { typeClass = 'cal-memo-type-char'; typeLabel = '角色'; }

          return '<div class="cal-memo-card">' +
            '<span class="cal-memo-type ' + typeClass + '">' + typeLabel + '</span>' +
            (memo.time ? '<span style="font-size:12px;color:#999;flex-shrink:0;">' + App.esc(memo.time) + '</span>' : '') +
            '<div class="cal-memo-text">' + App.esc(memo.content || '') + '</div>' +
            '<div class="cal-memo-actions">' +
              '<button class="cal-sm-btn cal-sm-edit" data-idx="' + idx + '" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>' +
              '</button>' +
              '<button class="cal-sm-btn cal-sm-del" data-idx="' + idx + '" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      section.innerHTML = html;

      section.querySelectorAll('.cal-sm-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          Cal.openEditMemo(dateKey, parseInt(btn.dataset.idx, 10));
        });
      });

      section.querySelectorAll('.cal-sm-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('删除这条记录？')) return;
          Cal.removeMemo(dateKey, parseInt(btn.dataset.idx, 10));
          Cal.renderDaysGrid();
          Cal.renderSelectedSection();
          Cal.render();
          App.showToast('已删除');
        });
      });
    },

    openEditMemo: function(dateKey, idx) {
      var isNew = idx < 0;
      var list = Cal.getMemosForDate(dateKey);
      var memo = isNew ? { type: 'schedule', time: '', content: '' } : list[idx];

      var panel = App.$('#calPanel');
      if (!panel) return;

      var parts = dateKey.split('-');
      var dateStr = parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日';

      panel.innerHTML =
        '<div class="cal-panel-header">' +
          '<div class="cal-panel-back" id="backToCal">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '添加记录' : '编辑记录') + ' · ' + dateStr + '</h2>' +
          '<button class="cal-panel-action" id="saveMemoBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="cal-panel-body">' +

          '<div class="cal-form-group">' +
            '<label class="cal-form-label">类型</label>' +
            '<div class="cal-type-switch" id="memoTypeSwitch">' +
              '<button class="cal-type-opt' + (memo.type === 'schedule' ? ' active' : '') + '" data-type="schedule" type="button">行程</button>' +
              '<button class="cal-type-opt' + (memo.type === 'important' ? ' active' : '') + '" data-type="important" type="button">重要日子</button>' +
              '<button class="cal-type-opt' + (memo.type === 'char' ? ' active' : '') + '" data-type="char" type="button">角色记录</button>' +
            '</div>' +
          '</div>' +

          '<div class="cal-form-group" id="memoTimeGroup">' +
            '<label class="cal-form-label">时间</label>' +
            '<input type="time" class="cal-input cal-input-time" id="memoTime" value="' + App.esc(memo.time || '') + '">' +
          '</div>' +

          '<div class="cal-form-group">' +
            '<label class="cal-form-label">内容</label>' +
            '<textarea class="cal-textarea" id="memoContent" rows="4" placeholder="记录内容...">' + App.esc(memo.content || '') + '</textarea>' +
          '</div>' +

        '</div>';

      var currentType = memo.type || 'schedule';

      App.$('#memoTypeSwitch').querySelectorAll('.cal-type-opt').forEach(function(btn) {
        btn.addEventListener('click', function() {
          App.$('#memoTypeSwitch').querySelectorAll('.cal-type-opt').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          currentType = btn.dataset.type;
          var timeGroup = App.$('#memoTimeGroup');
          if (currentType === 'important') {
            timeGroup.style.display = 'none';
          } else {
            timeGroup.style.display = '';
          }
        });
      });

      if (currentType === 'important') {
        App.$('#memoTimeGroup').style.display = 'none';
      }

      App.safeOn('#backToCal', 'click', function() { Cal.renderCalendarView(); });

      App.safeOn('#saveMemoBtn', 'click', function() {
        var content = App.$('#memoContent').value.trim();
        if (!content) { App.showToast('请输入内容'); return; }

        var newMemo = {
          type: currentType,
          time: currentType !== 'important' ? App.$('#memoTime').value : '',
          content: content
        };

        if (isNew) {
          Cal.addMemo(dateKey, newMemo);
        } else {
          list[idx] = newMemo;
          Cal.setSchedule(dateKey, list);
        }

        Cal.render();
        Cal.renderCalendarView();
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
