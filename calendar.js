(function(){
'use strict';

var App = window.App;
if (!App) return;

var MONTHS_EN = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
var WEEKDAYS = ['日','一','二','三','四','五','六'];

var Calendar = {
  el: null,
  clockTimer: null,

  init: function() {
    Calendar.el = document.getElementById('calTimeRow');
    if (!Calendar.el) return;
    Calendar.renderCalendar();
    Calendar.startClock();
    Calendar.bindDrag();
    Calendar.restorePos();
  },

  renderCalendar: function() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var today = now.getDate();
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var yearEl = document.getElementById('calYear');
    var monthEl = document.getElementById('calMonth');
    var monthEnEl = document.getElementById('calMonthEn');

    if (yearEl) yearEl.textContent = year;
    if (monthEl) monthEl.textContent = month + 1;
    if (monthEnEl) monthEnEl.textContent = MONTHS_EN[month];

    // 用表格渲染星期和日期，天然对齐
    var tableHtml = '<table class="cal-table">';
    
    // 星期行
    tableHtml += '<tr class="cal-week">';
    for (var i = 0; i < 7; i++) {
      tableHtml += '<td>' + WEEKDAYS[i] + '</td>';
    }
    tableHtml += '</tr>';
    
    // 日期行
    var dayCount = 1;
    for (var row = 0; row < 6; row++) {
      tableHtml += '<tr>';
      for (var col = 0; col < 7; col++) {
        if (row === 0 && col < firstDay) {
          tableHtml += '<td class="cal-day"></td>';
        } else if (dayCount <= daysInMonth) {
          var cls = 'cal-day' + (dayCount === today ? ' today' : '');
          tableHtml += '<td class="' + cls + '">' + dayCount + '</td>';
          dayCount++;
        } else {
          tableHtml += '<td class="cal-day"></td>';
        }
      }
      tableHtml += '</tr>';
      if (dayCount > daysInMonth) break;
    }
    tableHtml += '</table>';
    
    // 替换内容
    var weekdaysEl = document.getElementById('calWeekdays');
    var daysEl = document.getElementById('calDays');
    if (weekdaysEl && daysEl) {
      // 移除原来的两个容器，用表格替代
      var container = document.createElement('div');
      container.innerHTML = tableHtml;
      var table = container.firstChild;
      weekdaysEl.parentNode.insertBefore(table, weekdaysEl);
      weekdaysEl.style.display = 'none';
      daysEl.style.display = 'none';
    }
  },

  startClock: function() {
    function tick() {
      var n = new Date();
      var h = String(n.getHours()).padStart(2, '0');
      var m = String(n.getMinutes()).padStart(2, '0');
      var s = String(n.getSeconds()).padStart(2, '0');
      var timeEl = document.getElementById('calTime');
      var secEl = document.getElementById('calSec');
      if (timeEl) timeEl.textContent = h + ':' + m;
      if (secEl) secEl.textContent = ':' + s;
    }
    tick();
    Calendar.clockTimer = setInterval(tick, 1000);
  },

  bindDrag: function() {
    var el = Calendar.el;
    if (!el || el._calDragBound) return;
    el._calDragBound = true;

    var DELAY = 500;
    var startX, startY, origX, origY, longPressed = false, timer, moved = false;

    el.addEventListener('touchstart', function(e) {
      var t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      longPressed = false;
      moved = false;

      timer = setTimeout(function() {
        longPressed = true;
        var off = Calendar._getOffset();
        origX = off.x;
        origY = off.y;
        el.style.transition = 'none';
        if (navigator.vibrate) navigator.vibrate(15);
      }, DELAY);
    }, { passive: true });

    el.addEventListener('touchmove', function(e) {
      var t = e.touches[0];
      if (timer && !longPressed) {
        if (Math.abs(t.clientX - startX) > 8 || Math.abs(t.clientY - startY) > 8) {
          clearTimeout(timer);
          timer = null;
        }
        return;
      }
      if (!longPressed) return;
      moved = true;
      e.preventDefault();
      e.stopPropagation();
      var nx = origX + (t.clientX - startX);
      var ny = origY + (t.clientY - startY);
      el.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
    }, { passive: false });

    el.addEventListener('touchend', function() {
      clearTimeout(timer);
      timer = null;
      el.style.transition = '';
      if (longPressed && moved) {
        Calendar._saveOffset();
      }
      longPressed = false;
      moved = false;
    });
  },

  _getOffset: function() {
    var saved = App.LS.get('calTimeOffset');
    return saved || { x: 0, y: 0 };
  },

  _saveOffset: function() {
    var el = Calendar.el;
    if (!el) return;
    var match = el.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
    if (match) {
      App.LS.set('calTimeOffset', { x: parseFloat(match[1]), y: parseFloat(match[2]) });
    }
  },

  restorePos: function() {
    var el = Calendar.el;
    if (!el) return;
    var off = App.LS.get('calTimeOffset');
    if (off) {
      el.style.transform = 'translate(' + off.x + 'px,' + off.y + 'px)';
    }
  }
};

App.register('calendar', Calendar);
})();