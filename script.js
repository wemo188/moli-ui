(function() {
  'use strict';

  var $ = function(s) { return document.querySelector(s); };
  var $$ = function(s) { return document.querySelectorAll(s); };

  var LS = {
    get: function(k) { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } },
    set: function(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} },
    remove: function(k) { localStorage.removeItem(k); }
  };

  function showToast(msg, duration) {
    duration = duration || 2000;
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    requestAnimationFrame(function() { t.classList.add('show'); });
    clearTimeout(t._timer);
    t._timer = setTimeout(function() {
      t.classList.remove('show');
      setTimeout(function() { t.classList.add('hidden'); }, 300);
    }, duration);
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  // ========= 悬浮球 =========
  var ball = $('#floatingBall');
  var ballMenuEl = $('#ballMenu');
  var overlay = $('#overlay');
  var currentPanelEl = null;

  if (!ball || !ballMenuEl || !overlay) {
    console.error('核心元素缺失：floatingBall / ballMenu / overlay');
    return;
  }

  var isDragging = false, hasMoved = false;
  var startX = 0, startY = 0, origX = 0, origY = 0;
  var menuOpen = false;

  function getBallRect() {
    return ball.getBoundingClientRect();
  }

  function positionMenu() {
    var rect = getBallRect();
    ballMenuEl.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    if (rect.left + 26 < window.innerWidth / 2) {
      ballMenuEl.style.left = rect.left + 'px';
      ballMenuEl.style.right = 'auto';
    } else {
      ballMenuEl.style.right = (window.innerWidth - rect.right) + 'px';
      ballMenuEl.style.left = 'auto';
    }
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
    ball.classList.toggle('active', menuOpen);

    if (menuOpen) {
      positionMenu();
      ballMenuEl.classList.remove('hidden');
      requestAnimationFrame(function() {
        ballMenuEl.classList.add('show');
      });
    } else {
      ballMenuEl.classList.remove('show');
      setTimeout(function() {
        ballMenuEl.classList.add('hidden');
      }, 250);
    }
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    ball.classList.remove('active');
    ballMenuEl.classList.remove('show');
    setTimeout(function() {
      ballMenuEl.classList.add('hidden');
    }, 250);
  }

  function openPanel(id) {
    closeMenu();

    if (currentPanelEl && currentPanelEl.id !== id) {
      currentPanelEl.classList.remove('show');
      currentPanelEl.classList.add('hidden');
    }

    currentPanelEl = $('#' + id);
    if (!currentPanelEl) return;

    overlay.classList.remove('hidden');
    currentPanelEl.classList.remove('hidden');

    requestAnimationFrame(function() {
      overlay.classList.add('show');
      currentPanelEl.classList.add('show');
    });
  }

  function closePanel() {
    if (!currentPanelEl) return;
    overlay.classList.remove('show');
    currentPanelEl.classList.remove('show');
    var p = currentPanelEl;
    setTimeout(function() {
      overlay.classList.add('hidden');
      p.classList.add('hidden');
    }, 350);
    currentPanelEl = null;
  }

  ball.addEventListener('touchstart', function(e) {
    var t = e.touches[0];
    var rect = getBallRect();
    startX = t.clientX;
    startY = t.clientY;
    origX = rect.left;
    origY = rect.top;
    isDragging = true;
    hasMoved = false;
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    var t = e.touches[0];
    var dx = t.clientX - startX;
    var dy = t.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
    if (!hasMoved) return;

    var nx = Math.max(0, Math.min(window.innerWidth - 52, origX + dx));
    var ny = Math.max(0, Math.min(window.innerHeight - 52, origY + dy));
    ball.style.left = nx + 'px';
    ball.style.top = ny + 'px';
    ball.style.right = 'auto';
    ball.style.bottom = 'auto';
  }, { passive: true });

  document.addEventListener('touchend', function() {
    if (isDragging && !hasMoved) toggleMenu();
    if (hasMoved) {
      var rect = getBallRect();
      LS.set('floatingBallPos', { left: rect.left, top: rect.top });
    }
    isDragging = false;
  });

  ball.addEventListener('click', function() {
    if (!('ontouchstart' in window)) toggleMenu();
  });

  $$('.ball-menu-item').forEach(function(item) {
    item.addEventListener('click', function() {
      openPanel(item.dataset.panel);
    });
  });

  $$('.panel-close').forEach(function(btn) {
    btn.addEventListener('click', closePanel);
  });

  overlay.addEventListener('click', closePanel);

  // ========= API =========
  var apiConfigs = LS.get('apiConfigs') || [];
  var activeApi = LS.get('activeApi') || null;

  function updateAiStatus() {
    var status = $('#aiStatus');
    if (!status) return;
    if (activeApi) {
      status.innerHTML = '<div class="status-dot online"></div><span>已连接: ' + esc(activeApi.name) + ' (' + esc(activeApi.model) + ')</span>';
    } else {
      status.innerHTML = '<div class="status-dot offline"></div><span>未连接 — 请先在 API 配置中选择</span>';
    }
  }

  function renderSavedApis() {
    var container = $('#savedApis');
    if (!container) return;

    if (apiConfigs.length === 0) {
      container.innerHTML = '<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:16px;">暂无保存的配置</p>';
      return;
    }

    container.innerHTML = apiConfigs.map(function(c, i) {
      return '<div class="saved-item">' +
        '<div class="saved-item-info">' +
          '<div class="saved-item-name">' + esc(c.name) + '</div>' +
          '<div class="saved-item-url">' + esc(c.url) + ' · ' + esc(c.model) + '</div>' +
        '</div>' +
        '<div class="saved-item-actions">' +
          '<button class="use-btn" onclick="window._useApi(' + i + ')" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
          '<button class="edit-btn" onclick="window._editApi(' + i + ')" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
          '</button>' +
          '<button class="del-btn" onclick="window._delApi(' + i + ')" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window._useApi = function(i) {
    activeApi = apiConfigs[i];
    LS.set('activeApi', activeApi);
    renderSavedApis();
    updateAiStatus();
    showToast('已切换至: ' + activeApi.name);
  };

  window._editApi = function(i) {
    var config = apiConfigs[i];
    if (!config) return;
    if ($('#apiName')) $('#apiName').value = config.name || '';
    if ($('#apiUrl')) $('#apiUrl').value = config.url || '';
    if ($('#apiKey')) $('#apiKey').value = config.key || '';
    if ($('#apiModel')) $('#apiModel').value = config.model || '';
    openPanel('apiPanel');
    showToast('已载入配置，可直接修改后保存');
  };

  window._delApi = function(i) {
    var removed = apiConfigs.splice(i, 1)[0];
    LS.set('apiConfigs', apiConfigs);
    if (activeApi && activeApi.name === removed.name) {
      activeApi = null;
      LS.remove('activeApi');
    }
    renderSavedApis();
    updateAiStatus();
    showToast('已删除');
  };

  if ($('#saveApiBtn')) {
    $('#saveApiBtn').addEventListener('click', function() {
      var name = $('#apiName') ? $('#apiName').value.trim() : '';
      var url = $('#apiUrl') ? $('#apiUrl').value.trim() : '';
      var key = $('#apiKey') ? $('#apiKey').value.trim() : '';
      var model = $('#apiModel') ? $('#apiModel').value.trim() : '';

      if (!name || !url || !key || !model) {
        showToast('请填写所有字段');
        return;
      }

      var config = { name: name, url: url, key: key, model: model };
      var existing = -1;
      for (var i = 0; i < apiConfigs.length; i++) {
        if (apiConfigs[i].name === name) {
          existing = i;
          break;
        }
      }

      if (existing >= 0) apiConfigs[existing] = config;
      else apiConfigs.push(config);

      LS.set('apiConfigs', apiConfigs);
      renderSavedApis();
      showToast('配置已保存');
    });
  }

  if ($('#toggleKeyVisible')) {
    $('#toggleKeyVisible').addEventListener('click', function() {
      var inp = $('#apiKey');
      if (!inp) return;
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });
  }

  // ========= 初始化 =========
  function init() {
    try { renderSavedApis(); } catch(e) { console.warn(e); }
    try { updateAiStatus(); } catch(e) { console.warn(e); }

    try {
      var savedBallPos = LS.get('floatingBallPos');
      if (savedBallPos) {
        ball.style.left = savedBallPos.left + 'px';
        ball.style.top = savedBallPos.top + 'px';
        ball.style.right = 'auto';
        ball.style.bottom = 'auto';
      }
    } catch(e) { console.warn(e); }

    try {
      if ($('#mainContent') && !LS.get('aiCustomHTML')) {
        $('#mainContent').innerHTML =
          '<div style="text-align:center;padding:80px 20px 40px;">' +
          '<h1 style="font-size:28px;margin-bottom:10px;">Mono Space</h1>' +
          '<p style="font-size:14px;color:var(--text-secondary);">基础结构已恢复，先确认悬浮球可用。</p>' +
          '</div>';
      }
    } catch(e) { console.warn(e); }
  }

  init();
})();