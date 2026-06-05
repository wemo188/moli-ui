(function(){
'use strict';

var MONTHS_EN = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
var WEEKDAYS = ['日','一','二','三','四','五','六'];

function renderCalendar() {
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
}

function startClock() {
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
  setInterval(tick, 1000);
}

renderCalendar();
startClock();
})();