
(function() {
  'use strict';

  var $ = function(s) { return document.querySelector(s); };
  var $$ = function(s) { return document.querySelectorAll(s); };

  var LS = {
    get: function(k) {
      try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; }
    },
    set: function(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
    },
    remove: function(k) {
      localStorage.removeItem(k);
    }
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

  function safeOn(selector, event, fn) {
    var el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.addEventListener(event, fn);
  }

  // ========= 核心元素 =========
  var ball = $('#floatingBall');
  var ballMenuEl = $('#ballMenu');
  var overlay = $('#overlay');
  var chatMessages = $('#chatMessages');
  var chatInput = $('#chatInput');

  if (!ball || !ballMenuEl || !overlay) {
    alert('页面缺少核心元素：floatingBall / ballMenu / overlay');
    return;
  }

  // ========= 悬浮球 =========
  var isDragging = false;
  var hasMoved = false;
  var startX = 0;
  var startY = 0;
  var origX = 0;
  var origY = 0;
  var menuOpen = false;
  var currentPanelEl = null;
  var lastToggleTime = 0;

  function getBallRect() {
    return ball.getBoundingClientRect();
  }

  function positionMenu() {
    var rect = getBallRect();
    ballMenuEl.style.bottom = (window.innerHeight - rect.top + 8) + 'px';

    if (rect.left + rect.width / 2 < window.innerWidth / 2) {
      ballMenuEl.style.left = rect.left + 'px';
      ballMenuEl.style.right = 'auto';
    } else {
      ballMenuEl.style.right = (window.innerWidth - rect.right) + 'px';
      ballMenuEl.style.left = 'auto';
    }
  }

  function openMenu() {
    menuOpen = true;
    ball.classList.add('active');
    positionMenu();
    ballMenuEl.classList.remove('hidden');
    requestAnimationFrame(function() {
      ballMenuEl.classList.add('show');
    });
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

  function toggleMenu() {
    var now = Date.now();
    if (now - lastToggleTime < 250) return;
    lastToggleTime = now;

    if (menuOpen) closeMenu();
    else openMenu();
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

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) hasMoved = true;
    if (!hasMoved) return;

    var nx = Math.max(0, Math.min(window.innerWidth - 52, origX + dx));
    var ny = Math.max(0, Math.min(window.innerHeight - 52, origY + dy));

    ball.style.left = nx + 'px';
    ball.style.top = ny + 'px';
    ball.style.right = 'auto';
    ball.style.bottom = 'auto';
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    if (!isDragging) return;

    if (!hasMoved) {
      e.preventDefault();
      toggleMenu();
    } else {
      var rect = getBallRect();
      LS.set('floatingBallPos', {
        left: rect.left,
        top: rect.top
      });
    }

    isDragging = false;
    hasMoved = false;
  }, { passive: false });

  ball.addEventListener('click', function(e) {
    e.preventDefault();
    if ('ontouchstart' in window) return;
    toggleMenu();
  });

  $$('.ball-menu-item').forEach(function(item) {
    item.addEventListener('click', function() {
      openPanel(item.dataset.panel);
    });
  });

  $$('.panel-close').forEach(function(btn) {
    btn.addEventListener('click', function() {
      closePanel();
    });
  });

  overlay.addEventListener('click', function() {
    closePanel();
  });

  // ========= API 配置 =========
  var apiConfigs = LS.get('apiConfigs') || [];
  var activeApi = LS.get('activeApi') || null;

  function updateAiStatus() {
    var status = $('#aiStatus');
    if (!status) return;

    if (activeApi) {
      status.innerHTML = '<div class="status-dot online"></div><span>已连接: ' + esc(activeApi.name) + ' (' + esc(activeApi.model) + ')</span>';
    } else {
      status.innerHTML = '<div class="status-dot offline"></div><span>未连接</span>';
    }
  }

  function renderSavedApis() {
    var container = $('#savedApis');
    if (!container) return;

    if (apiConfigs.length === 0) {
      container.innerHTML = '<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:16px;">暂无保存的配置</p>';
      return;
    }

    container.innerHTML = apiConfigs.map(function(cfg, i) {
      return '<div class="saved-item">' +
        '<div class="saved-item-info">' +
          '<div class="saved-item-name">' + esc(cfg.name) + '</div>' +
          '<div class="saved-item-url">' + esc(cfg.url) + ' · ' + esc(cfg.model) + '</div>' +
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
    var cfg = apiConfigs[i];
    if (!cfg) return;
    if ($('#apiName')) $('#apiName').value = cfg.name || '';
    if ($('#apiUrl')) $('#apiUrl').value = cfg.url || '';
    if ($('#apiKey')) $('#apiKey').value = cfg.key || '';
    if ($('#apiModel')) $('#apiModel').value = cfg.model || '';
    openPanel('apiPanel');
    showToast('已载入配置');
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

  safeOn('#saveApiBtn', 'click', function() {
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

  safeOn('#toggleKeyVisible', 'click', function() {
    var inp = $('#apiKey');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  safeOn('#fetchModelsBtn', 'click', function() {
    var url = $('#apiUrl') ? $('#apiUrl').value.trim() : '';
    var key = $('#apiKey') ? $('#apiKey').value.trim() : '';
    if (!url || !key) {
      showToast('请先填写 API 地址和 Key');
      return;
    }

    showToast('正在获取模型列表...');
    fetch(url.replace(/\/+$/, '') + '/models', {
      headers: { 'Authorization': 'Bearer ' + key }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var raw = data.data || data;
      var models = [];
      if (Array.isArray(raw)) {
        for (var i = 0; i < raw.length; i++) {
          var id = raw[i].id || raw[i].name || raw[i];
          if (id) models.push(id);
        }
      }

      if (!models.length) {
        showToast('未找到模型');
        return;
      }

      var list = $('#modelList');
      if (!list) return;

      list.innerHTML = models.map(function(m) {
        return '<div class="model-item">' + esc(m) + '</div>';
      }).join('');
      list.classList.remove('hidden');

      list.querySelectorAll('.model-item').forEach(function(item) {
        item.addEventListener('click', function() {
          if ($('#apiModel')) $('#apiModel').value = item.textContent;
          list.classList.add('hidden');
        });
      });
    })
    .catch(function(err) {
      showToast('获取失败: ' + err.message);
    });
  });

  safeOn('#testApiBtn', 'click', function() {
    var url = $('#apiUrl') ? $('#apiUrl').value.trim() : '';
    var key = $('#apiKey') ? $('#apiKey').value.trim() : '';
    var model = $('#apiModel') ? $('#apiModel').value.trim() : '';
    if (!url || !key || !model) {
      showToast('请填写完整信息');
      return;
    }

    showToast('正在测试连接...');
    fetch(url.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    })
    .then(function(r) {
      if (r.ok) showToast('连接成功');
      else showToast('连接失败: ' + r.status);
    })
    .catch(function(err) {
      showToast('连接失败: ' + err.message);
    });
  });

  // ========= 聊天最小版 =========
  function restoreChatHistory() {
    var chatHistory = LS.get('chatHistory') || [];
    if (!chatMessages || !chatHistory.length) return;

    for (var i = 0; i < chatHistory.length; i++) {
      var item = chatHistory[i];
      var div = document.createElement('div');
      div.className = 'chat-msg ' + (item.role === 'assistant' ? 'assistant' : item.role === 'user' ? 'user' : 'system');
      div.innerHTML = esc(item.content || '').replace(/\n/g, '<br>');
      chatMessages.appendChild(div);
    }
  }

  safeOn('#clearChatBtn', 'click', function() {
    LS.remove('chatHistory');
    if (chatMessages) {
      chatMessages.innerHTML = '<div class="chat-msg system">聊天记录已清空。</div>';
    }
    showToast('已清空聊天记录');
  });

  // ========= 源码仓最小版 =========
  function restoreSourceRepo() {
    var repo = LS.get('sourceRepo') || { html: '', css: '', js: '', enabled: false };
    if ($('#sourceHtml')) $('#sourceHtml').value = repo.html || '';
    if ($('#sourceCss')) $('#sourceCss').value = repo.css || '';
    if ($('#sourceJs')) $('#sourceJs').value = repo.js || '';
    if ($('#useSourceRepoForAI')) $('#useSourceRepoForAI').checked = !!repo.enabled;
  }

  safeOn('#saveSourceBtn', 'click', function() {
    LS.set('sourceRepo', {
      html: $('#sourceHtml') ? $('#sourceHtml').value : '',
      css: $('#sourceCss') ? $('#sourceCss').value : '',
      js: $('#sourceJs') ? $('#sourceJs').value : '',
      enabled: $('#useSourceRepoForAI') ? $('#useSourceRepoForAI').checked : false
    });
    showToast('源码仓已保存');
  });

  safeOn('#clearSourceBtn', 'click', function() {
    if (!confirm('确定清空源码仓？')) return;
    LS.set('sourceRepo', { html: '', css: '', js: '', enabled: false });
    restoreSourceRepo();
    showToast('源码仓已清空');
  });

  // ========= 背景最小版 =========
  var bgData = LS.get('bgData') || null;

  function applyBg(data) {
    if (!data || !data.url) return;
    var layer = $('#bgLayer');
    if (!layer) return;
    layer.style.backgroundImage = 'url(' + data.url + ')';
    var blur = parseInt(data.blur) || 0;
    layer.style.filter = 'blur(' + blur + 'px)';
    layer.style.inset = blur > 0 ? ('-' + (blur * 2) + 'px') : '0';
    layer.style.setProperty('--bg-overlay-alpha', (parseInt(data.dark) || 30) / 100);
  }

  safeOn('#bgUploadArea', 'click', function() {
    if ($('#bgFileInput')) $('#bgFileInput').click();
  });

  safeOn('#bgFileInput', 'change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var u = ev.target.result;
      if ($('#bgPreviewImg')) $('#bgPreviewImg').src = u;
      if ($('#bgPreview')) $('#bgPreview').classList.remove('hidden');
      bgData = { url: u };
    };
    reader.readAsDataURL(file);
  });

  safeOn('#bgBlur', 'input', function(e) {
    if ($('#bgBlurVal')) $('#bgBlurVal').textContent = e.target.value + 'px';
  });

  safeOn('#bgDark', 'input', function(e) {
    if ($('#bgDarkVal')) $('#bgDarkVal').textContent = e.target.value + '%';
  });

  safeOn('#applyBgBtn', 'click', function() {
    if (!bgData) {
      showToast('请先上传图片');
      return;
    }
    bgData.blur = $('#bgBlur') ? $('#bgBlur').value : '0';
    bgData.dark = $('#bgDark') ? $('#bgDark').value : '30';
    applyBg(bgData);
    LS.set('bgData', bgData);
    showToast('背景已应用');
  });

  safeOn('#removeBgBtn', 'click', function() {
    bgData = null;
    LS.remove('bgData');
    var l = $('#bgLayer');
    if (l) {
      l.style.backgroundImage = 'none';
      l.style.filter = '';
      l.style.inset = '0';
      l.style.setProperty('--bg-overlay-alpha', '0');
    }
    if ($('#bgPreview')) $('#bgPreview').classList.add('hidden');
    showToast('背景已移除');
  });

  // ========= 初始化 =========
  async function init() {
    renderSavedApis();
    updateAiStatus();
    restoreChatHistory();
    restoreSourceRepo();

    if (bgData) {
      applyBg(bgData);
      if (bgData.url && $('#bgPreviewImg') && $('#bgPreview')) {
        $('#bgPreviewImg').src = bgData.url;
        $('#bgPreview').classList.remove('hidden');
      }
      if (bgData.blur && $('#bgBlur') && $('#bgBlurVal')) {
        $('#bgBlur').value = bgData.blur;
        $('#bgBlurVal').textContent = bgData.blur + 'px';
      }
      if (bgData.dark && $('#bgDark') && $('#bgDarkVal')) {
        $('#bgDark').value = bgData.dark;
        $('#bgDarkVal').textContent = bgData.dark + '%';
      }
    }

    var savedBallPos = LS.get('floatingBallPos');
    if (savedBallPos) {
      ball.style.left = savedBallPos.left + 'px';
      ball.style.top = savedBallPos.top + 'px';
      ball.style.right = 'auto';
      ball.style.bottom = 'auto';
    }

    if ($('#mainContent') && !$('#mainContent').innerHTML.trim()) {
      $('#mainContent').innerHTML =
        '<div style="text-align:center;padding:80px 20px 40px;">' +
        '<h1 style="font-size:28px;margin-bottom:10px;">Mono Space</h1>' +
        '<p style="font-size:14px;color:var(--text-secondary);">先把底层功能跑稳，再继续加模块。</p>' +
        '</div>';
    }
  }

  init();
})();