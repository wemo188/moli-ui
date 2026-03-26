
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

  function safeOn(target, evt, fn) {
    var el = typeof target === 'string' ? $(target) : target;
    if (el) el.addEventListener(evt, fn);
  }

  // ========= IndexedDB：大字体存储 =========
  var DB = {
    db: null,
    open: function() {
      return new Promise(function(resolve) {
        if (DB.db) return resolve(DB.db);
        var req = indexedDB.open('MonoSpaceDB', 2);
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          if (!db.objectStoreNames.contains('fonts')) {
            db.createObjectStore('fonts', { keyPath: 'id' });
          }
        };
        req.onsuccess = function(e) {
          DB.db = e.target.result;
          resolve(DB.db);
        };
        req.onerror = function() { resolve(null); };
      });
    },
    saveFont: async function(obj) {
      var db = await DB.open();
      if (!db) return false;
      return new Promise(function(resolve) {
        var tx = db.transaction('fonts', 'readwrite');
        tx.objectStore('fonts').put(obj);
        tx.oncomplete = function() { resolve(true); };
        tx.onerror = function() { resolve(false); };
      });
    },
    getAllFonts: async function() {
      var db = await DB.open();
      if (!db) return [];
      return new Promise(function(resolve) {
        var tx = db.transaction('fonts', 'readonly');
        var req = tx.objectStore('fonts').getAll();
        req.onsuccess = function() { resolve(req.result || []); };
        req.onerror = function() { resolve([]); };
      });
    }
  };

  // ========= 预设主题 =========
  var PRESET_THEMES = [
    {
      id: 'blue-white',
      name: '蓝白',
      desc: '清爽蓝白',
      vars: {
        '--bg-primary': '#f0f6fb',
        '--bg-secondary': '#ffffff',
        '--bg-card': '#ffffff',
        '--accent': '#adcdea',
        '--accent-deep': '#8ab8de',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#555555',
        '--text-muted': '#999999',
        '--border': '#1a1a1a',
        '--border-light': 'rgba(173, 205, 234, 0.3)',
        '--shadow': 'rgba(0, 0, 0, 0.06)'
      }
    },
    {
      id: 'dark',
      name: '暗夜',
      desc: '深色护眼',
      vars: {
        '--bg-primary': '#0f1114',
        '--bg-secondary': '#1a1d22',
        '--bg-card': '#22262d',
        '--accent': '#5b9bd5',
        '--accent-deep': '#3a7cc2',
        '--text-primary': '#e0e4ea',
        '--text-secondary': '#8e95a3',
        '--text-muted': '#555d6b',
        '--border': '#2e333b',
        '--border-light': 'rgba(91,155,213,0.15)',
        '--shadow': 'rgba(0,0,0,0.3)'
      }
    },
    {
      id: 'sakura',
      name: '樱花',
      desc: '柔和粉白',
      vars: {
        '--bg-primary': '#fdf2f4',
        '--bg-secondary': '#ffffff',
        '--bg-card': '#ffffff',
        '--accent': '#e8a0b4',
        '--accent-deep': '#d4819a',
        '--text-primary': '#2d1f24',
        '--text-secondary': '#7a5a63',
        '--text-muted': '#b09098',
        '--border': '#2d1f24',
        '--border-light': 'rgba(232,160,180,0.3)',
        '--shadow': 'rgba(232,160,180,0.12)'
      }
    },
    {
      id: 'midnight',
      name: '午夜蓝',
      desc: '深蓝沉稳',
      vars: {
        '--bg-primary': '#0c1525',
        '--bg-secondary': '#111d32',
        '--bg-card': '#172740',
        '--accent': '#adcdea',
        '--accent-deep': '#8ab8de',
        '--text-primary': '#dbe8ff',
        '--text-secondary': '#7a9ab5',
        '--text-muted': '#4a6680',
        '--border': '#223550',
        '--border-light': 'rgba(173,205,234,0.15)',
        '--shadow': 'rgba(0,0,0,0.3)'
      }
    }
  ];

  var customThemes = LS.get('customThemes') || [];
  var currentThemeId = LS.get('currentThemeId') || 'blue-white';

  // ========= 流式开关 =========
  var useStream = LS.get('useStream');
  if (useStream === null) useStream = false;

  // ========= 核心元素 =========
  var ball = $('#floatingBall');
  var ballMenuEl = $('#ballMenu');
  var overlay = $('#overlay');
  var chatMessages = $('#chatMessages');
  var chatInput = $('#chatInput');

  console.log('ball=', ball, 'ballMenu=', ballMenuEl, 'overlay=', overlay);
  if (!ball || !ballMenuEl || !overlay) {
    console.error('核心元素缺失');
    return;
  }

  // ========= 悬浮球 =========
  var isDragging = false;
  var hasMoved = false;
  var touchMoved = false;
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
      requestAnimationFrame(function() { ballMenuEl.classList.add('show'); });
    } else {
      ballMenuEl.classList.remove('show');
      setTimeout(function() { ballMenuEl.classList.add('hidden'); }, 250);
    }
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    ball.classList.remove('active');
    ballMenuEl.classList.remove('show');
    setTimeout(function() { ballMenuEl.classList.add('hidden'); }, 250);
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
    touchMoved = false;
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;

    var t = e.touches[0];
    var dx = t.clientX - startX;
    var dy = t.clientY - startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMoved = true;
      touchMoved = true;
    }

    if (!hasMoved) return;

    var nx = Math.max(0, Math.min(window.innerWidth - 52, origX + dx));
    var ny = Math.max(0, Math.min(window.innerHeight - 52, origY + dy));

    ball.style.left = nx + 'px';
    ball.style.top = ny + 'px';
    ball.style.right = 'auto';
    ball.style.bottom = 'auto';
  }, { passive: true });

  document.addEventListener('touchend', function() {
    if (!isDragging) return;

    if (!hasMoved) {
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

    setTimeout(function() {
      touchMoved = false;
    }, 50);
  });

  ball.addEventListener('click', function(e) {
    e.preventDefault();
    if (touchMoved) return;
    toggleMenu();
  });

  // ========= 面板 =========
  var currentPanelEl = null;

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

  $$('.ball-menu-item').forEach(function(item) {
    item.addEventListener('click', function() {
      openPanel(item.dataset.panel);
    });
  });

  $$('.panel-close').forEach(function(btn) {
    btn.addEventListener('click', closePanel);
  });

  overlay.addEventListener('click', closePanel);

  // ========= API 配置 =========
  var apiConfigs = LS.get('apiConfigs') || [];
  var activeApi = LS.get('activeApi') || null;

  function updateAiStatus() {
    var s = $('#aiStatus');
    if (!s) return;
    s.innerHTML = activeApi
      ? '<div class="status-dot online"></div><span>已连接: ' + esc(activeApi.name) + ' (' + esc(activeApi.model) + ')</span>'
      : '<div class="status-dot offline"></div><span>未连接</span>';
  }

  function renderSavedApis() {
    var c = $('#savedApis');
    if (!c) return;

    if (apiConfigs.length === 0) {
      c.innerHTML = '<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:16px;">暂无保存的配置</p>';
      return;
    }

    c.innerHTML = apiConfigs.map(function(cfg, i) {
      return '<div class="saved-item"><div class="saved-item-info"><div class="saved-item-name">'+esc(cfg.name)+'</div><div class="saved-item-url">'+esc(cfg.url)+' · '+esc(cfg.model)+'</div></div><div class="saved-item-actions">' +
        '<button class="use-btn" onclick="window._useApi('+i+')" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></button>' +
        '<button class="edit-btn" onclick="window._editApi('+i+')" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></button>' +
        '<button class="del-btn" onclick="window._delApi('+i+')" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>' +
        '</div></div>';
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
    var c = apiConfigs[i];
    if (!c) return;
    if ($('#apiName')) $('#apiName').value = c.name || '';
    if ($('#apiUrl')) $('#apiUrl').value = c.url || '';
    if ($('#apiKey')) $('#apiKey').value = c.key || '';
    if ($('#apiModel')) $('#apiModel').value = c.model || '';
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
    var ex = -1;
    for (var i = 0; i < apiConfigs.length; i++) {
      if (apiConfigs[i].name === name) { ex = i; break; }
    }
    if (ex >= 0) apiConfigs[ex] = config;
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

  // ========= 源码仓 =========
  function getSourceRepo() {
    return LS.get('sourceRepo') || { html: '', css: '', js: '', enabled: false };
  }

  function setSourceRepo(repo) {
    LS.set('sourceRepo', {
      html: repo.html || '',
      css: repo.css || '',
      js: repo.js || '',
      enabled: !!repo.enabled
    });
  }

  function restoreSourceRepo() {
    var repo = getSourceRepo();
    if ($('#sourceHtml')) $('#sourceHtml').value = repo.html || '';
    if ($('#sourceCss')) $('#sourceCss').value = repo.css || '';
    if ($('#sourceJs')) $('#sourceJs').value = repo.js || '';
    if ($('#useSourceRepoForAI')) $('#useSourceRepoForAI').checked = !!repo.enabled;
  }

  function saveSourceRepo() {
    setSourceRepo({
      html: $('#sourceHtml') ? $('#sourceHtml').value : '',
      css: $('#sourceCss') ? $('#sourceCss').value : '',
      js: $('#sourceJs') ? $('#sourceJs').value : '',
      enabled: $('#useSourceRepoForAI') ? $('#useSourceRepoForAI').checked : false
    });
    showToast('源码仓已保存');
  }

  function updateSourceRepoFile(type, content) {
    var repo = getSourceRepo();
    if (type === 'html') repo.html = content;
    if (type === 'css') repo.css = content;
    if (type === 'js') repo.js = content;
    setSourceRepo(repo);
    restoreSourceRepo();
  }

  function getSourceRepoText() {
    var repo = getSourceRepo();
    if (!repo.enabled) return '';
    if (!repo.html && !repo.css && !repo.js) return '';
    return '\n\n=== 用户提供的真实源码 ===\n\n[index.html]\n' + (repo.html || '') + '\n\n[style.css]\n' + (repo.css || '') + '\n\n[script.js]\n' + (repo.js || '') + '\n\n如果用户要求修改功能，优先返回 source-html / source-css / source-js 代码块。\n';
  }

  safeOn('#saveSourceBtn', 'click', saveSourceRepo);

  safeOn('#clearSourceBtn', 'click', function() {
    if (!confirm('确定清空源码仓？')) return;
    setSourceRepo({ html: '', css: '', js: '', enabled: false });
    restoreSourceRepo();
    showToast('源码仓已清空');
  });

  safeOn('#useSourceRepoForAI', 'change', function() {
    var repo = getSourceRepo();
    repo.enabled = this.checked;
    setSourceRepo(repo);
    showToast(this.checked ? '已开启：发送源码仓给 AI' : '已关闭：不发送源码仓');
  });

  // ========= AI 聊天 =========
  var chatHistory = LS.get('chatHistory') || [];
  var visionImageData = null;

  function addChatMsg(role, content) {
    if (!chatMessages) return document.createElement('div');
    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    var html = esc(content);
    html = html.replace(/```(\w[\w-]*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/\n/g, '<br>');
    div.innerHTML = html;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function restoreChatHistory() {
    if (!chatHistory || !chatHistory.length) return;
    for (var i = 0; i < chatHistory.length; i++) {
      var h = chatHistory[i];
      if (h.displayRole && h.displayContent) {
        addChatMsg(h.displayRole, h.displayContent);
      } else if (h.role === 'user') {
        addChatMsg('user', typeof h.content === 'string' ? h.content : '[复杂消息]');
      } else if (h.role === 'assistant') {
        addChatMsg('assistant', h.content || '');
      }
    }
  }

  function saveChatHistory() {
    try { LS.set('chatHistory', chatHistory.slice(-50)); } catch(e) {}
  }

  var SYSTEM_PROMPT =
    '你是网页内置开发助手，已经运行在当前网页里。\n' +
    '不要索要代码，不要说无法访问文件。\n' +
    '如果源码仓已启用并存在源码，修改功能时必须优先返回：source-html / source-css / source-js。\n' +
    '不要把完整源码解释性地发在普通聊天文本里。\n' +
    '不要伪造功能，不要额外创建假按钮。\n' +
    '只有用户明确说“先预览效果”时，才允许使用 cssvar / css / html-inject / js-inject。\n' +
    '默认回复简短，只说明你改了什么。';

  function buildUserContent(text) {
    if (visionImageData) {
      return [
        { type: 'text', text: text },
        { type: 'image_url', image_url: { url: visionImageData } }
      ];
    }
    return text;
  }

  function cleanReplyForDisplay(reply) {
    return reply
      .replace(/```source-html\n?[\s\S]*?```/g, '[已更新源码仓 index.html]')
      .replace(/```source-css\n?[\s\S]*?```/g, '[已更新源码仓 style.css]')
      .replace(/```source-js\n?[\s\S]*?```/g, '[已更新源码仓 script.js]');
  }

  function applyReplyMods(reply) {
    var m;

    var r0 = /```source-html\n?([\s\S]*?)```/g;
    while ((m = r0.exec(reply)) !== null) {
      updateSourceRepoFile('html', m[1].trim());
      showToast('源码仓 index.html 已更新');
    }

    var r0b = /```source-css\n?([\s\S]*?)```/g;
    while ((m = r0b.exec(reply)) !== null) {
      updateSourceRepoFile('css', m[1].trim());
      showToast('源码仓 style.css 已更新');
    }

    var r0c = /```source-js\n?([\s\S]*?)```/g;
    while ((m = r0c.exec(reply)) !== null) {
      updateSourceRepoFile('js', m[1].trim());
      showToast('源码仓 script.js 已更新');
    }

    var r1 = /```cssvar\n?([\s\S]*?)```/g;
    while ((m = r1.exec(reply)) !== null) {
      var lines = m[1].split('\n');
      var sv = LS.get('aiCSSVars') || {};
      for (var i = 0; i < lines.length; i++) {
        var l = lines[i].trim();
        if (!l || l.indexOf('--') !== 0) continue;
        var p = l.replace(';', '').split(':');
        if (p.length < 2) continue;
        var vn = p[0].trim();
        var vv = p.slice(1).join(':').trim();
        document.documentElement.style.setProperty(vn, vv);
        sv[vn] = vv;
      }
      LS.set('aiCSSVars', sv);
      showToast('配色已更新');
    }

    var r2 = /```css\n?([\s\S]*?)```/g;
    while ((m = r2.exec(reply)) !== null) {
      var el = document.getElementById('ai-custom-style');
      if (!el) {
        el = document.createElement('style');
        el.id = 'ai-custom-style';
        document.head.appendChild(el);
      }
      el.textContent += '\n' + m[1];
      LS.set('aiCustomCSS', el.textContent);
      showToast('样式已应用');
    }

    var r3 = /```html-inject\n?([\s\S]*?)```/g;
    while ((m = r3.exec(reply)) !== null) {
      if ($('#mainContent')) {
        $('#mainContent').innerHTML = m[1];
        LS.set('aiCustomHTML', m[1]);
        showToast('页面内容已更新');
      }
    }

    var r4 = /```js-inject\n?([\s\S]*?)```/g;
    while ((m = r4.exec(reply)) !== null) {
      try {
        var fn = new Function(m[1]);
        fn();
        var ex = LS.get('aiCustomJS') || '';
        ex += '\n;' + m[1];
        LS.set('aiCustomJS', ex);
        showToast('功能已添加');
      } catch(err) {
        showToast('JS执行失败: ' + err.message);
      }
    }
  }

  function restoreAiMods() {
    try {
      var sv = LS.get('aiCSSVars');
      if (sv) {
        var vk = Object.keys(sv);
        for (var i = 0; i < vk.length; i++) {
          document.documentElement.style.setProperty(vk[i], sv[vk[i]]);
        }
      }
    } catch(e) {}

    try {
      var sc = LS.get('aiCustomCSS');
      if (sc) {
        var s = document.createElement('style');
        s.id = 'ai-custom-style';
        s.textContent = sc;
        document.head.appendChild(s);
      }
    } catch(e) {}

    try {
      var sh = LS.get('aiCustomHTML');
      if (sh && $('#mainContent')) $('#mainContent').innerHTML = sh;
    } catch(e) {}

    try {
      var sj = LS.get('aiCustomJS');
      if (sj) {
        var fn = new Function(sj);
        fn();
      }
    } catch(e) {
      console.warn('恢复AI JS失败', e);
    }
  }

  async function sendMessage() {
    if (!activeApi) {
      showToast('请先配置并选择 API');
      return;
    }

    var text = chatInput ? chatInput.value.trim() : '';
    if (!text && !visionImageData) return;

    var wrappedText =
      '请直接修改当前网页，不要索要代码。\n' +
      '如果启用了源码仓，直接输出 source-html / source-css / source-js。\n' +
      '用户需求：' + (text || '请分析这张图片。') +
      getSourceRepoText();

    var displayText = text || '[发送了一张图片]';

    if (chatInput) chatInput.value = '';
    addChatMsg('user', displayText + (visionImageData ? '\n[附带图片]' : ''));

    chatHistory.push({
      role: 'user',
      content: buildUserContent(wrappedText),
      displayRole: 'user',
      displayContent: displayText + (visionImageData ? '\n[附带图片]' : '')
    });
    saveChatHistory();

    var replyDiv = addChatMsg('assistant', '思考中...');
    replyDiv.classList.add('loading-dots');

    var messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: '直接输出代码块修改网页，不要索要代码。' }
    ];

    var start = Math.max(0, chatHistory.length - 20);
    for (var i = start; i < chatHistory.length; i++) {
      messages.push({
        role: chatHistory[i].role,
        content: chatHistory[i].content
      });
    }

    var base = activeApi.url.replace(/\/+$/, '');

    try {
      var response = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + activeApi.key
        },
        body: JSON.stringify({
          model: activeApi.model,
          messages: messages,
          stream: !!useStream
        })
      });

      if (!response.ok) {
        var errData = await response.json().catch(function() { return {}; });
        throw new Error(errData.error?.message || ('请求失败: ' + response.status));
      }

      if (!useStream) {
        var data = await response.json();
        var fullReply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '(无回复)';
        replyDiv.classList.remove('loading-dots');
        applyReplyMods(fullReply);
        var dr = cleanReplyForDisplay(fullReply);
        replyDiv.innerHTML = esc(dr)
          .replace(/```(\w[\w-]*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
          .replace(/\n/g, '<br>');

        chatHistory.push({
          role: 'assistant',
          content: fullReply,
          displayRole: 'assistant',
          displayContent: dr
        });
        saveChatHistory();
        clearVisionImage();
        return;
      }

      if (!response.body) throw new Error('接口不支持流式输出');

      replyDiv.classList.remove('loading-dots');
      replyDiv.innerHTML = '';

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullReply = '';

      while (true) {
        const result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (let j = 0; j < lines.length; j++) {
          const line = lines[j].trim();
          if (!line.startsWith('data:')) continue;

          const dataStr = line.slice(5).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const data = JSON.parse(dataStr);
            const delta = data.choices && data.choices[0] && data.choices[0].delta ? data.choices[0].delta : {};
            const content = delta.content || '';
            const reasoning = delta.reasoning_content || delta.thinking || '';

            if (reasoning) fullReply += '\n[思考]\n' + reasoning + '\n';
            if (content) fullReply += content;

            replyDiv.innerHTML = esc(cleanReplyForDisplay(fullReply)).replace(/\n/g, '<br>');
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
          } catch(e) {}
        }
      }

      if (!fullReply.trim()) fullReply = '模型没有返回内容';

      applyReplyMods(fullReply);
      var fd = cleanReplyForDisplay(fullReply);
      replyDiv.innerHTML = esc(fd)
        .replace(/```(\w[\w-]*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/\n/g, '<br>');

      chatHistory.push({
        role: 'assistant',
        content: fullReply,
        displayRole: 'assistant',
        displayContent: fd
      });
      saveChatHistory();
      clearVisionImage();

    } catch(err) {
      replyDiv.classList.remove('loading-dots');
      replyDiv.innerHTML = '请求失败: ' + esc(err.message);
    }
  }

  safeOn('#sendBtn', 'click', sendMessage);
  safeOn('#chatInput', 'keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ========= 图片 =========
  function clearVisionImage() {
    visionImageData = null;
    if ($('#imagePreviewBox')) $('#imagePreviewBox').classList.add('hidden');
    if ($('#imagePreviewImg')) $('#imagePreviewImg').src = '';
    if ($('#visionImageInput')) $('#visionImageInput').value = '';
  }

  safeOn('#pickVisionImage', 'click', function() {
    if ($('#visionImageInput')) $('#visionImageInput').click();
  });

  safeOn('#visionImageInput', 'change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      visionImageData = ev.target.result;
      if ($('#imagePreviewImg')) $('#imagePreviewImg').src = visionImageData;
      if ($('#imagePreviewBox')) $('#imagePreviewBox').classList.remove('hidden');
      showToast('图片已添加');
    };
    reader.readAsDataURL(file);
  });

  safeOn('#removeVisionImage', 'click', clearVisionImage);

  // ========= 字体 =========
  var builtinFonts = [
    { name:'系统默认', family:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif', preview:'系统默认字体 ABCabc' },
    { name:'霞鹜文楷', family:'"LXGW WenKai",serif', preview:'霞鹜文楷 落霞与孤鹜齐飞' },
    { name:'思源宋体', family:'"Noto Serif SC",serif', preview:'思源宋体 秋水共长天一色' },
    { name:'思源黑体', family:'"Noto Sans SC",sans-serif', preview:'思源黑体 千里之行始于足下' },
    { name:'站酷小薇', family:'"ZCOOL XiaoWei",serif', preview:'站酷小薇 山高月小水落石出' },
    { name:'马善政楷体', family:'"Ma Shan Zheng",cursive', preview:'马善政楷 清风明月本无价' }
  ];

  var currentFontIndex = LS.get('currentFontIndex');
  var currentFontCustom = LS.get('currentFontCustom') || null;
  var customFontMetas = LS.get('customFontMetas') || [];

  var fontStyleEl = document.getElementById('custom-font-faces');
  if (!fontStyleEl) {
    fontStyleEl = document.createElement('style');
    fontStyleEl.id = 'custom-font-faces';
    document.head.appendChild(fontStyleEl);
  }

  function registerFont(name, url) {
    fontStyleEl.textContent += '@font-face{font-family:"'+name+'";src:url('+url+');font-display:swap;}';
  }

  function applyFontByIndex(idx) {
    currentFontIndex = idx;
    currentFontCustom = null;
    document.body.style.fontFamily = builtinFonts[idx].family;
    LS.set('currentFontIndex', idx);
    LS.remove('currentFontCustom');
  }

  function applyFontByCustom(name) {
    currentFontIndex = null;
    currentFontCustom = name;
    document.body.style.fontFamily = '"' + name + '",sans-serif';
    LS.remove('currentFontIndex');
    LS.set('currentFontCustom', name);
  }

  function renderFontList() {
    var c = $('#fontList');
    if (!c) return;
    c.innerHTML = builtinFonts.map(function(f, idx) {
      var active = (currentFontCustom === null && currentFontIndex === idx);
      return '<div class="font-item'+(active?' active':'')+'" data-idx="'+idx+'"><div><div class="font-item-preview" style="font-family:'+f.family+'">'+f.preview+'</div><div class="font-item-name">'+f.name+'</div></div><div class="font-item-check"></div></div>';
    }).join('');

    c.querySelectorAll('.font-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var idx = parseInt(item.dataset.idx);
        applyFontByIndex(idx);
        renderFontList();
        renderCustomFonts();
        showToast('已切换: ' + builtinFonts[idx].name);
      });
    });
  }

  function renderCustomFonts() {
    var c = $('#customFonts');
    if (!c) return;
    if (!customFontMetas.length) {
      c.innerHTML = '';
      return;
    }

    c.innerHTML = customFontMetas.map(function(f, idx) {
      var active = (currentFontCustom === f.familyName);
      return '<div class="font-item'+(active?' active':'')+'" data-cidx="'+idx+'"><div><div class="font-item-preview" style="font-family:\''+f.familyName+'\'">'+esc(f.name)+' 永远相信美好</div><div class="font-item-name">'+esc(f.name)+' (自定义)</div></div><div class="font-item-check"></div></div>';
    }).join('');

    c.querySelectorAll('.font-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var idx = parseInt(item.dataset.cidx);
        applyFontByCustom(customFontMetas[idx].familyName);
        renderFontList();
        renderCustomFonts();
        showToast('已切换: ' + customFontMetas[idx].name);
      });
    });
  }

  async function restoreCustomFontsFromDB() {
    try {
      var fonts = await DB.getAllFonts();
      for (var i = 0; i < fonts.length; i++) registerFont(fonts[i].familyName, fonts[i].dataUrl);
      if (currentFontCustom) {
        try {
          await document.fonts.load('16px "' + currentFontCustom + '"');
          document.body.style.fontFamily = '"' + currentFontCustom + '",sans-serif';
        } catch(e) {}
      }
      renderCustomFonts();
    } catch(e) {
      console.warn('restoreCustomFontsFromDB', e);
    }
  }

  safeOn('#fontUploadArea', 'click', function() {
    if ($('#fontFileInput')) $('#fontFileInput').click();
  });

  safeOn('#fontFileInput', 'change', function(e) {
    var file = e.target.files[0];
    if (!file) return;

    var fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
    var familyName = 'Custom-' + fontName + '-' + Date.now();
    var fontId = 'font-' + Date.now();

    showToast('正在加载字体（' + (file.size / 1024 / 1024).toFixed(1) + 'MB）...');

    var reader = new FileReader();
    reader.onload = async function(ev) {
      var dataUrl = ev.target.result;
      registerFont(familyName, dataUrl);
      await DB.saveFont({ id: fontId, familyName: familyName, name: fontName, dataUrl: dataUrl });
      customFontMetas.push({ id: fontId, name: fontName, familyName: familyName });
      LS.set('customFontMetas', customFontMetas);

      try { await document.fonts.load('16px "' + familyName + '"'); } catch(e) {}
      applyFontByCustom(familyName);
      renderFontList();
      renderCustomFonts();
      showToast('字体 "' + fontName + '" 已加载');
    };

    reader.onerror = function() {
      showToast('读取字体失败');
    };

    reader.readAsDataURL(file);
    if ($('#fontFileInput')) $('#fontFileInput').value = '';
  });

  // ========= 背景 =========
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
    if ($('#bgFileInput')) $('#bgFileInput').value = '';
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

  // ========= 主题 =========
  function applyThemeVars(vars) {
    Object.keys(vars).forEach(function(k) {
      document.documentElement.style.setProperty(k, vars[k]);
    });
  }

  function findThemeById(id) {
    for (var i = 0; i < PRESET_THEMES.length; i++) if (PRESET_THEMES[i].id === id) return PRESET_THEMES[i];
    for (var j = 0; j < customThemes.length; j++) if (customThemes[j].id === id) return customThemes[j];
    return null;
  }

  function updateColorInputs(vars) {
    var map = {
      colorBg: '--bg-primary',
      colorCard: '--bg-card',
      colorAccent: '--accent',
      colorAccentDeep: '--accent-deep',
      colorText: '--text-primary',
      colorBorder: '--border'
    };
    Object.keys(map).forEach(function(id) {
      var el = $('#' + id);
      var val = vars[map[id]];
      if (el && val && val.indexOf('#') === 0) el.value = val;
    });
  }

  function selectTheme(id) {
    var theme = findThemeById(id);
    if (!theme) return;
    currentThemeId = id;
    LS.set('currentThemeId', id);
    applyThemeVars(theme.vars);
    LS.set('aiCSSVars', theme.vars);
    updateColorInputs(theme.vars);
    renderThemeList();
    showToast('已切换: ' + theme.name);
  }

  function renderThemeList() {
    var c = $('#themeList');
    if (!c) return;

    c.innerHTML = PRESET_THEMES.map(function(t) {
      var dots = '';
      var colors = [t.vars['--bg-primary'], t.vars['--accent'], t.vars['--text-primary'], t.vars['--border']];
      for (var i = 0; i < colors.length; i++) dots += '<div class="theme-color-dot" style="background:'+colors[i]+'"></div>';
      return '<div class="theme-card'+(currentThemeId===t.id?' active':'')+'" data-theme="'+t.id+'"><div class="theme-card-colors">'+dots+'</div><div class="theme-card-name">'+esc(t.name)+'</div><div class="theme-card-desc">'+esc(t.desc)+'</div></div>';
    }).join('');

    c.querySelectorAll('.theme-card').forEach(function(card) {
      card.addEventListener('click', function() {
        selectTheme(card.dataset.theme);
      });
    });

    renderCustomThemeList();
  }

  function renderCustomThemeList() {
    var c = $('#customThemeList');
    if (!c) return;

    if (!customThemes.length) {
      c.innerHTML = '<p style="font-size:12px;color:var(--text-muted);padding:8px 0;">还没有自定义主题</p>';
      return;
    }

    c.innerHTML = customThemes.map(function(t, idx) {
      var dots = '';
      var colors = [t.vars['--bg-primary'], t.vars['--accent'], t.vars['--text-primary'], t.vars['--border']];
      for (var i = 0; i < colors.length; i++) dots += '<div class="theme-color-dot" style="background:'+colors[i]+'"></div>';
      return '<div class="theme-card'+(currentThemeId===t.id?' active':'')+'" data-theme="'+t.id+'"><button class="theme-card-del" onclick="event.stopPropagation();window._delTheme('+idx+')" type="button">x</button><div class="theme-card-colors">'+dots+'</div><div class="theme-card-name">'+esc(t.name)+'</div><div class="theme-card-desc">'+esc(t.desc||'自定义')+'</div></div>';
    }).join('');

    c.querySelectorAll('.theme-card').forEach(function(card) {
      card.addEventListener('click', function() {
        selectTheme(card.dataset.theme);
      });
    });
  }

  window._delTheme = function(idx) {
    var r = customThemes.splice(idx, 1)[0];
    LS.set('customThemes', customThemes);
    if (currentThemeId === r.id) selectTheme('blue-white');
    renderThemeList();
    showToast('已删除: ' + r.name);
  };

  safeOn('#applyCustomColors', 'click', function() {
    var vars = {
      '--bg-primary': $('#colorBg').value,
      '--bg-secondary': $('#colorCard').value,
      '--bg-card': $('#colorCard').value,
      '--accent': $('#colorAccent').value,
      '--accent-deep': $('#colorAccentDeep').value,
      '--text-primary': $('#colorText').value,
      '--border': $('#colorBorder').value
    };
    applyThemeVars(vars);
    LS.set('aiCSSVars', vars);
    currentThemeId = 'custom-temp';
    LS.set('currentThemeId', 'custom-temp');
    renderThemeList();
    showToast('自定义配色已应用');
  });

  safeOn('#saveCustomTheme', 'click', function() {
    var name = $('#customThemeName') ? $('#customThemeName').value.trim() : '';
    if (!name) {
      showToast('请输入主题名称');
      return;
    }

    var vars = {
      '--bg-primary': $('#colorBg').value,
      '--bg-secondary': $('#colorCard').value,
      '--bg-card': $('#colorCard').value,
      '--accent': $('#colorAccent').value,
      '--accent-deep': $('#colorAccentDeep').value,
      '--text-primary': $('#colorText').value,
      '--text-secondary': $('#colorText').value === '#1a1a1a' ? '#555555' : '#8e95a3',
      '--text-muted': '#999999',
      '--border': $('#colorBorder').value,
      '--border-light': 'rgba(173,205,234,0.3)',
      '--shadow': 'rgba(0,0,0,0.06)'
    };

    var id = 'custom-' + Date.now();
    customThemes.push({ id: id, name: name, desc: '自定义', vars: vars });
    LS.set('customThemes', customThemes);
    currentThemeId = id;
    LS.set('currentThemeId', id);
    applyThemeVars(vars);
    LS.set('aiCSSVars', vars);
    if ($('#customThemeName')) $('#customThemeName').value = '';
    renderThemeList();
    showToast('主题已保存');
  });

  safeOn('#resetTheme', 'click', function() {
    selectTheme('blue-white');
    showToast('已恢复默认主题');
  });

  safeOn('#clearChatBtn', 'click', function() {
    chatHistory = [];
    LS.remove('chatHistory');
    if (chatMessages) chatMessages.innerHTML = '<div class="chat-msg system">聊天记录已清空。</div>';
    showToast('已清空聊天记录');
  });

  safeOn('#clearAllBtn', 'click', function() {
    if (!confirm('确定重置所有设置？')) return;
    localStorage.clear();
    try { indexedDB.deleteDatabase('MonoSpaceDB'); } catch(e) {}
    location.reload();
  });

  // ========= 导出 =========
  safeOn('#generateExport', 'click', function() {
    var repo = getSourceRepo();

    if (repo.html || repo.css || repo.js) {
      if ($('#exportHtml')) $('#exportHtml').value = repo.html || '（空）';
      if ($('#exportCss')) $('#exportCss').value = repo.css || '（空）';
      if ($('#exportJs')) $('#exportJs').value = repo.js || '（空）';
      if ($('#exportOutput')) $('#exportOutput').classList.remove('hidden');
      showToast('已导出源码仓内容');
      return;
    }

    var aiCSS = LS.get('aiCustomCSS') || '';
    var aiHTML = LS.get('aiCustomHTML') || '';
    var aiJS = LS.get('aiCustomJS') || '';
    var aiVars = LS.get('aiCSSVars') || {};

    var varsCSS = ':root {\n';
    Object.keys(aiVars).forEach(function(k) {
      varsCSS += '  ' + k + ': ' + aiVars[k] + ';\n';
    });
    varsCSS += '}\n';

    var exportCSS = varsCSS;
    if (aiCSS) exportCSS += '\n' + aiCSS;

    if ($('#exportHtml')) $('#exportHtml').value = aiHTML || '（没有HTML修改）';
    if ($('#exportCss')) $('#exportCss').value = exportCSS;
    if ($('#exportJs')) $('#exportJs').value = aiJS || '（没有JS修改）';
    if ($('#exportOutput')) $('#exportOutput').classList.remove('hidden');
    showToast('已导出');
  });

  window._copyExport = function(id) {
    var el = $('#' + id);
    if (!el) return;
    el.select();
    el.setSelectionRange(0, 999999);
    try {
      navigator.clipboard.writeText(el.value).then(function() {
        showToast('已复制');
      }).catch(function() {
        document.execCommand('copy');
        showToast('已复制');
      });
    } catch(e) {
      document.execCommand('copy');
      showToast('已复制');
    }
  };

  // ========= 初始化 =========
  async function init() {
    try { restoreSourceRepo(); } catch(e) { console.warn('restoreSourceRepo', e); }
    try { renderSavedApis(); } catch(e) { console.warn('renderSavedApis', e); }
    try { updateAiStatus(); } catch(e) { console.warn('updateAiStatus', e); }
    try { restoreChatHistory(); } catch(e) { console.warn('restoreChatHistory', e); }
    try { restoreAiMods(); } catch(e) { console.warn('restoreAiMods', e); }
    try { renderThemeList(); } catch(e) { console.warn('renderThemeList', e); }
    try { renderFontList(); } catch(e) { console.warn('renderFontList', e); }
    try { await restoreCustomFontsFromDB(); } catch(e) { console.warn('restoreCustomFontsFromDB', e); }

    try {
      if (currentFontCustom === null && currentFontIndex !== null && currentFontIndex !== undefined && builtinFonts[currentFontIndex]) {
        document.body.style.fontFamily = builtinFonts[currentFontIndex].family;
      }
    } catch(e) {}

    try {
      var tv = LS.get('aiCSSVars');
      if (tv) updateColorInputs(tv);
    } catch(e) {}

    try {
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
    } catch(e) {}

    try {
      var savedBallPos = LS.get('floatingBallPos');
      if (savedBallPos && ball) {
        ball.style.left = savedBallPos.left + 'px';
        ball.style.top = savedBallPos.top + 'px';
        ball.style.right = 'auto';
        ball.style.bottom = 'auto';
      }
    } catch(e) {}

    try {
      if ($('#useStreamToggle')) {
        $('#useStreamToggle').checked = !!useStream;
        $('#useStreamToggle').addEventListener('change', function() {
          useStream = this.checked;
          LS.set('useStream', useStream);
          showToast(useStream ? '已开启流式输出' : '已关闭流式输出');
        });
      }
    } catch(e) {}

    try {
      if (!LS.get('aiCustomHTML') && $('#mainContent')) {
        $('#mainContent').innerHTML =
          '<div style="text-align:center;padding:80px 20px 40px;">' +
          '<h1 style="font-size:28px;margin-bottom:10px;">Mono Space</h1>' +
          '<p style="font-size:14px;color:var(--text-secondary);">这是一个可被 AI 自我改造的网页空间。</p>' +
          '</div>';
      }
    } catch(e) {}
  }

  init();
})();
