
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

    // 星期头
    var weekdaysEl = document.getElementById('calWeekdays');
    if (weekdaysEl) {
      weekdaysEl.innerHTML = WEEKDAYS.map(function(d) {
        return '<span>' + d + '</span>';
      }).join('');
    }

    // 日期格子
    var daysEl = document.getElementById('calDays');
    if (!daysEl) return;

    var html = '';
    for (var i = 0; i < firstDay; i++) {
      html += '<div class="cal-day"></div>';
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var cls = 'cal-day' + (d === today ? ' today' : '');
      html += '<div class="' + cls + '">' + d + '</div>';
    }
    daysEl.innerHTML = html;
  },

  startClock: function() {
    function tick() {
      var n = new Date();
      var h = String(n.getHours()).padStart(2, '0');
      var m = String(n.getMinutes()).padStart(2, '0');
      var s = String(n.getSeconds()).padStart(2, '0');
      var clockEl = document.getElementById('calClock');
      var secEl = document.getElementById('calSec');
      if (clockEl && secEl) {
        clockEl.firstChild.textContent = h + ':' + m;
        secEl.textContent = ':' + s;
      }
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
