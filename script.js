
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

  // ========== IndexedDB（存大字体文件） ==========
  var IDB = {
    db: null,
    open: function(cb) {
      if (IDB.db) { cb(IDB.db); return; }
      var req = indexedDB.open('MonoSpaceDB', 1);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains('fonts')) {
          db.createObjectStore('fonts', { keyPath: 'familyName' });
        }
      };
      req.onsuccess = function(e) { IDB.db = e.target.result; cb(IDB.db); };
      req.onerror = function() { cb(null); };
    },
    saveFont: function(fontObj, cb) {
      IDB.open(function(db) {
        if (!db) { cb(false); return; }
        var tx = db.transaction('fonts', 'readwrite');
        tx.objectStore('fonts').put(fontObj);
        tx.oncomplete = function() { cb(true); };
        tx.onerror = function() { cb(false); };
      });
    },
    getAllFonts: function(cb) {
      IDB.open(function(db) {
        if (!db) { cb([]); return; }
        var tx = db.transaction('fonts', 'readonly');
        var req = tx.objectStore('fonts').getAll();
        req.onsuccess = function() { cb(req.result || []); };
        req.onerror = function() { cb([]); };
      });
    },
    deleteFont: function(familyName, cb) {
      IDB.open(function(db) {
        if (!db) { cb(); return; }
        var tx = db.transaction('fonts', 'readwrite');
        tx.objectStore('fonts').delete(familyName);
        tx.oncomplete = function() { cb(); };
      });
    }
  };

  // ========== 预设主题（4个） ==========
  var PRESET_THEMES = [
    {
      id: 'blue-white', name: '蓝白', desc: '清爽蓝白',
      vars: {
        '--bg-primary': '#f0f6fb', '--bg-secondary': '#ffffff', '--bg-card': '#ffffff',
        '--accent': '#adcdea', '--accent-deep': '#8ab8de',
        '--text-primary': '#1a1a1a', '--text-secondary': '#555555', '--text-muted': '#999999',
        '--border': '#1a1a1a', '--border-light': 'rgba(173,205,234,0.3)', '--shadow': 'rgba(0,0,0,0.06)'
      }
    },
    {
      id: 'dark', name: '暗夜', desc: '深色护眼',
      vars: {
        '--bg-primary': '#0f1114', '--bg-secondary': '#1a1d22', '--bg-card': '#22262d',
        '--accent': '#5b9bd5', '--accent-deep': '#3a7cc2',
        '--text-primary': '#e0e4ea', '--text-secondary': '#8e95a3', '--text-muted': '#555d6b',
        '--border': '#2e333b', '--border-light': 'rgba(91,155,213,0.15)', '--shadow': 'rgba(0,0,0,0.3)'
      }
    },
    {
      id: 'sakura', name: '樱花', desc: '柔和粉白',
      vars: {
        '--bg-primary': '#fdf2f4', '--bg-secondary': '#ffffff', '--bg-card': '#ffffff',
        '--accent': '#e8a0b4', '--accent-deep': '#d4819a',
        '--text-primary': '#2d1f24', '--text-secondary': '#7a5a63', '--text-muted': '#b09098',
        '--border': '#2d1f24', '--border-light': 'rgba(232,160,180,0.3)', '--shadow': 'rgba(232,160,180,0.12)'
      }
    },
    {
      id: 'midnight', name: '午夜蓝', desc: '深蓝沉稳',
      vars: {
        '--bg-primary': '#0c1525', '--bg-secondary': '#111d32', '--bg-card': '#172740',
        '--accent': '#adcdea', '--accent-deep': '#8ab8de',
        '--text-primary': '#dbe8ff', '--text-secondary': '#7a9ab5', '--text-muted': '#4a6680',
        '--border': '#223550', '--border-light': 'rgba(173,205,234,0.15)', '--shadow': 'rgba(0,0,0,0.3)'
      }
    }
  ];

  var customThemes = LS.get('customThemes') || [];
  var currentThemeId = LS.get('currentThemeId') || 'blue-white';

  // ========== 悬浮球拖拽 ==========
  var ball = $('#floatingBall');
  var ballMenuEl = $('#ballMenu');
  var isDragging = false, hasMoved = false;
  var startX, startY, origX, origY;

  ball.addEventListener('touchstart', function(e) {
    var t = e.touches[0];
    var rect = ball.getBoundingClientRect();
    startX = t.clientX; startY = t.clientY;
    origX = rect.left; origY = rect.top;
    isDragging = true; hasMoved = false;
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    var t = e.touches[0];
    var dx = t.clientX - startX, dy = t.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
    if (!hasMoved) return;
    var nx = Math.max(0, Math.min(window.innerWidth - 52, origX + dx));
    var ny = Math.max(0, Math.min(window.innerHeight - 52, origY + dy));
    ball.style.left = nx + 'px'; ball.style.top = ny + 'px';
    ball.style.right = 'auto'; ball.style.bottom = 'auto';
  }, { passive: true });

  document.addEventListener('touchend', function() {
    if (isDragging && !hasMoved) toggleMenu();
    isDragging = false;
    if (hasMoved) {
      var rect = ball.getBoundingClientRect();
      if (rect.left + 26 < window.innerWidth / 2) {
        ball.style.left = '12px'; ball.style.right = 'auto';
      } else {
        ball.style.left = 'auto'; ball.style.right = '12px';
      }
    }
  });

  ball.addEventListener('click', function() {
    if (!('ontouchstart' in window)) toggleMenu();
  });

  var menuOpen = false;
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

  function positionMenu() {
    var rect = ball.getBoundingClientRect();
    ballMenuEl.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    if (rect.left + 26 < window.innerWidth / 2) {
      ballMenuEl.style.left = rect.left + 'px'; ballMenuEl.style.right = 'auto';
    } else {
      ballMenuEl.style.right = (window.innerWidth - rect.right) + 'px'; ballMenuEl.style.left = 'auto';
    }
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false; ball.classList.remove('active');
    ballMenuEl.classList.remove('show');
    setTimeout(function() { ballMenuEl.classList.add('hidden'); }, 250);
  }

  // ========== 面板管理 ==========
  var overlay = $('#overlay');
  var currentPanelEl = null;

  function openPanel(id) {
    closeMenu();
    currentPanelEl = $('#' + id);
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
    setTimeout(function() { overlay.classList.add('hidden'); p.classList.add('hidden'); }, 350);
    currentPanelEl = null;
  }

  $$('.ball-menu-item').forEach(function(item) {
    item.addEventListener('click', function() { openPanel(item.dataset.panel); });
  });
  $$('.panel-close').forEach(function(btn) {
    btn.addEventListener('click', function() { closePanel(); });
  });
  overlay.addEventListener('click', closePanel);

  // ========== 主题配色 ==========
  function applyThemeVars(vars) {
    var keys = Object.keys(vars);
    for (var i = 0; i < keys.length; i++) {
      document.documentElement.style.setProperty(keys[i], vars[keys[i]]);
    }
  }

  function findThemeById(id) {
    for (var i = 0; i < PRESET_THEMES.length; i++) {
      if (PRESET_THEMES[i].id === id) return PRESET_THEMES[i];
    }
    for (var j = 0; j < customThemes.length; j++) {
      if (customThemes[j].id === id) return customThemes[j];
    }
    return null;
  }

  function renderThemeList() {
    var container = $('#themeList');
    if (!container) return;
    container.innerHTML = PRESET_THEMES.map(function(theme) {
      var dots = '';
      var colors = [theme.vars['--bg-primary'], theme.vars['--accent'], theme.vars['--text-primary'], theme.vars['--border']];
      for (var i = 0; i < colors.length; i++) {
        dots += '<div class="theme-color-dot" style="background:' + colors[i] + '"></div>';
      }
      return '<div class="theme-card' + (currentThemeId === theme.id ? ' active' : '') + '" data-theme="' + theme.id + '">' +
        '<div class="theme-card-colors">' + dots + '</div>' +
        '<div class="theme-card-name">' + theme.name + '</div>' +
        '<div class="theme-card-desc">' + theme.desc + '</div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.theme-card').forEach(function(card) {
      card.addEventListener('click', function() {
        selectTheme(card.dataset.theme);
      });
    });

    renderCustomThemeList();
  }

  function renderCustomThemeList() {
    var container = $('#customThemeList');
    if (!container) return;
    if (customThemes.length === 0) {
      container.innerHTML = '<p style="font-size:12px;color:var(--text-muted);padding:8px 0;">还没有自定义主题</p>';
      return;
    }
    container.innerHTML = customThemes.map(function(theme, idx) {
      var dots = '';
      var colors = [theme.vars['--bg-primary'], theme.vars['--accent'], theme.vars['--text-primary'], theme.vars['--border']];
      for (var i = 0; i < colors.length; i++) {
        dots += '<div class="theme-color-dot" style="background:' + colors[i] + '"></div>';
      }
      return '<div class="theme-card' + (currentThemeId === theme.id ? ' active' : '') + '" data-theme="' + theme.id + '">' +
        '<button class="theme-card-del" onclick="event.stopPropagation();window._delTheme(' + idx + ')">x</button>' +
        '<div class="theme-card-colors">' + dots + '</div>' +
        '<div class="theme-card-name">' + esc(theme.name) + '</div>' +
        '<div class="theme-card-desc">' + esc(theme.desc || '自定义') + '</div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.theme-card').forEach(function(card) {
      card.addEventListener('click', function() {
        selectTheme(card.dataset.theme);
      });
    });
  }

  function selectTheme(themeId) {
    var theme = findThemeById(themeId);
    if (!theme) return;
    currentThemeId = themeId;
    LS.set('currentThemeId', themeId);
    applyThemeVars(theme.vars);
    LS.set('aiCSSVars', theme.vars);
    updateColorInputs(theme.vars);
    renderThemeList();
    showToast('已切换: ' + theme.name);
  }

  window._delTheme = function(idx) {
    var removed = customThemes.splice(idx, 1)[0];
    LS.set('customThemes', customThemes);
    if (currentThemeId === removed.id) {
      selectTheme('blue-white');
    }
    renderThemeList();
    showToast('已删除: ' + removed.name);
  };

  function updateColorInputs(vars) {
    var map = {
      'colorBg': '--bg-primary', 'colorCard': '--bg-card',
      'colorAccent': '--accent', 'colorAccentDeep': '--accent-deep',
      'colorText': '--text-primary', 'colorBorder': '--border'
    };
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      var el = $('#' + keys[i]);
      if (el && vars[map[keys[i]]]) {
        var val = vars[map[keys[i]]];
        if (val.indexOf('#') === 0 && (val.length === 7 || val.length === 4)) {
          el.value = val;
        }
      }
    }
  }

  if ($('#applyCustomColors')) {
    $('#applyCustomColors').addEventListener('click', function() {
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
  }

  if ($('#saveCustomTheme')) {
    $('#saveCustomTheme').addEventListener('click', function() {
      var name = ($('#customThemeName') && $('#customThemeName').value.trim()) || '';
      if (!name) { showToast('请输入主题名称'); return; }
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
      renderThemeList();
      if ($('#customThemeName')) $('#customThemeName').value = '';
      showToast('主题 "' + name + '" 已保存');
    });
  }

  if ($('#resetTheme')) {
    $('#resetTheme').addEventListener('click', function() {
      selectTheme('blue-white');
      var aiStyle = document.getElementById('ai-custom-style');
      if (aiStyle) aiStyle.remove();
      LS.remove('aiCustomCSS');
      LS.remove('aiCustomHTML');
      LS.remove('aiCustomJS');
      var aiJs = document.getElementById('ai-custom-js');
      if (aiJs) aiJs.remove();
      showToast('已恢复默认');
    });
  }

  if ($('#clearChatBtn')) {
    $('#clearChatBtn').addEventListener('click', function() {
      chatHistory = [];
      LS.remove('chatHistory');
      chatMessages.innerHTML = '<div class="chat-msg system">聊天记录已清空。</div>';
      showToast('聊天记录已清空');
    });
  }

  if ($('#clearAllBtn')) {
    $('#clearAllBtn').addEventListener('click', function() {
      if (!confirm('确定重置所有设置？')) return;
      localStorage.clear();
      try { indexedDB.deleteDatabase('MonoSpaceDB'); } catch(e) {}
      location.reload();
    });
  }

  // ========== API 配置 ==========
  var apiConfigs = LS.get('apiConfigs') || [];
  var activeApi = LS.get('activeApi') || null;

  function renderSavedApis() {
    var container = $('#savedApis');
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
          '<button class="use-btn" onclick="window._useApi(' + i + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
          '<button class="del-btn" onclick="window._delApi(' + i + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  window._useApi = function(i) {
    activeApi = apiConfigs[i];
    LS.set('activeApi', activeApi);
    renderSavedApis(); updateAiStatus();
    showToast('已切换至: ' + activeApi.name);
  };

  window._delApi = function(i) {
    var removed = apiConfigs.splice(i, 1)[0];
    LS.set('apiConfigs', apiConfigs);
    if (activeApi && activeApi.name === removed.name) {
      activeApi = null; LS.remove('activeApi'); updateAiStatus();
    }
    renderSavedApis(); showToast('已删除');
  };

  $('#saveApiBtn').addEventListener('click', function() {
    var name = $('#apiName').value.trim();
    var url = $('#apiUrl').value.trim();
    var key = $('#apiKey').value.trim();
    var model = $('#apiModel').value.trim();
    if (!name || !url || !key || !model) { showToast('请填写所有字段'); return; }
    var existing = -1;
    for (var j = 0; j < apiConfigs.length; j++) {
      if (apiConfigs[j].name === name) { existing = j; break; }
    }
    var config = { name: name, url: url, key: key, model: model };
    if (existing >= 0) apiConfigs[existing] = config;
    else apiConfigs.push(config);
    LS.set('apiConfigs', apiConfigs);
    renderSavedApis(); showToast('配置已保存');
    $('#apiName').value = ''; $('#apiUrl').value = '';
    $('#apiKey').value = ''; $('#apiModel').value = '';
  });

  $('#toggleKeyVisible').addEventListener('click', function() {
    var inp = $('#apiKey');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  $('#fetchModelsBtn').addEventListener('click', function() {
    var url = $('#apiUrl').value.trim();
    var key = $('#apiKey').value.trim();
    if (!url || !key) { showToast('请先填写 API 地址和 Key'); return; }
    showToast('正在获取模型列表...');
    var base = url.replace(/\/+$/, '');
    fetch(base + '/models', { headers: { 'Authorization': 'Bearer ' + key } })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var raw = data.data || data;
      var models = [];
      for (var k = 0; k < raw.length; k++) {
        var id = raw[k].id || raw[k].name || raw[k];
        if (id) models.push(id);
      }
      if (models.length === 0) { showToast('未找到模型'); return; }
      var list = $('#modelList');
      list.innerHTML = models.map(function(m) {
        return '<div class="model-item">' + esc(m) + '</div>';
      }).join('');
      list.classList.remove('hidden');
      list.querySelectorAll('.model-item').forEach(function(item) {
        item.addEventListener('click', function() {
          $('#apiModel').value = item.textContent;
          list.classList.add('hidden');
        });
      });
    })
    .catch(function(err) { showToast('获取失败: ' + err.message); });
  });

  $('#testApiBtn').addEventListener('click', function() {
    var url = $('#apiUrl').value.trim();
    var key = $('#apiKey').value.trim();
    var model = $('#apiModel').value.trim();
    if (!url || !key || !model) { showToast('请填写完整信息'); return; }
    showToast('正在测试连接...');
    var base = url.replace(/\/+$/, '');
    fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ model: model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 10 })
    })
    .then(function(res) {
      if (res.ok) showToast('连接成功');
      else showToast('连接失败: ' + res.status);
    })
    .catch(function(err) { showToast('连接失败: ' + err.message); });
  });

  // ========== AI 助手（含 HTML/JS 持久化） ==========
  var chatMessages = $('#chatMessages');
  var chatInput = $('#chatInput');
  var chatHistory = LS.get('chatHistory') || [];

  function updateAiStatus() {
    var status = $('#aiStatus');
    if (activeApi) {
      status.innerHTML = '<div class="status-dot online"></div><span>已连接: ' + esc(activeApi.name) + ' (' + esc(activeApi.model) + ')</span>';
    } else {
      status.innerHTML = '<div class="status-dot offline"></div><span>未连接 — 请先在 API 配置中选择</span>';
    }
  }

  function addChatMsg(role, content) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    var html = esc(content);
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/\n/g, '<br>');
    div.innerHTML = html;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function restoreChatHistory() {
    if (chatHistory.length === 0) return;
    for (var i = 0; i < chatHistory.length; i++) {
      addChatMsg(chatHistory[i].role, chatHistory[i].content);
    }
  }

  function saveChatHistory() {
    try {
      // 只保留最近50条防止超出
      var toSave = chatHistory.slice(-50);
      LS.set('chatHistory', toSave);
    } catch(e) {}
  }

  var SYSTEM_PROMPT = '你是这个网页的全栈开发助手，你可以修改页面上的一切。\n\n' +
    '== 你的能力 ==\n\n' +
    '1. 修改CSS变量（改配色）：\n```cssvar\n--bg-primary: #新颜色;\n```\n\n' +
    '可用变量：--bg-primary, --bg-secondary, --bg-card, --accent, --accent-deep, --text-primary, --text-secondary, --text-muted, --border, --border-light, --shadow, --radius, --radius-sm\n\n' +
    '2. 注入CSS样式：\n```css\n.card { border-radius: 20px; }\n```\n\n' +
    '3. 替换页面主体HTML（持久化）：\n```html-inject\n<div>新内容</div>\n```\n\n' +
    '4. 注入JavaScript（持久化，可修改现有元素、新增功能）：\n```js-inject\ndocument.getElementById("apiUrl").type = "text";\n```\n\n' +
    '== 页面现有结构 ==\n\n' +
    '主内容区: #mainContent (.main-content)\n\n' +
    '悬浮球菜单项打开的面板：\n' +
    '- #apiPanel: API配置面板\n' +
    '  - #apiName: 配置名称输入框\n' +
    '  - #apiUrl: API地址输入框（type=text）\n' +
    '  - #apiKey: API Key输入框（type=password）\n' +
    '  - #apiModel: 模型名输入框\n' +
    '  - #toggleKeyVisible: 显示/隐藏Key按钮\n' +
    '  - #fetchModelsBtn: 获取模型列表按钮\n' +
    '  - #modelList: 模型下拉列表\n' +
    '  - #saveApiBtn: 保存配置按钮\n' +
    '  - #testApiBtn: 测试连接按钮\n' +
    '  - #savedApis: 已保存配置列表容器\n\n' +
    '- #aiPanel: AI助手面板\n' +
    '  - #aiStatus: 连接状态栏\n' +
    '  - #chatMessages: 聊天消息容器\n' +
    '  - #chatInput: 聊天输入框 textarea\n' +
    '  - #sendBtn: 发送按钮\n\n' +
    '- #themePanel: 主题配色面板\n' +
    '  - #themeList: 预设主题列表\n' +
    '  - #customThemeList: 自定义主题列表\n' +
    '  - #colorBg, #colorCard, #colorAccent, #colorAccentDeep, #colorText, #colorBorder: 颜色选择器\n' +
    '  - #customThemeName: 主题名称输入框\n' +
    '  - #applyCustomColors: 应用颜色按钮\n' +
    '  - #saveCustomTheme: 保存为主题按钮\n' +
    '  - #resetTheme: 恢复默认按钮\n' +
    '  - #clearChatBtn: 清空聊天按钮\n' +
    '  - #clearAllBtn: 重置所有按钮\n\n' +
    '- #fontPanel: 字体设置面板\n' +
    '  - #fontList: 内置字体列表\n' +
    '  - #fontUploadArea: 字体上传区域\n' +
    '  - #fontFileInput: 字体文件input\n' +
    '  - #customFonts: 自定义字体列表\n\n' +
    '- #bgPanel: 背景图片面板\n' +
    '  - #bgUploadArea, #bgFileInput: 背景上传\n' +
    '  - #bgPreview, #bgPreviewImg: 背景预览\n' +
    '  - #bgBlur, #bgDark: 模糊度/暗度滑条\n' +
    '  - #applyBgBtn, #removeBgBtn: 应用/移除按钮\n\n' +
    '- #exportPanel: 导出代码面板\n' +
    '  - #generateExport: 生成导出按钮\n\n' +
    '其他元素：\n' +
    '- #floatingBall: 悬浮球\n' +
    '- #ballMenu: 悬浮球菜单\n' +
    '- #bgLayer: 背景图层\n' +
    '- #overlay: 遮罩层\n' +
    '- #toast: 提示消息\n\n' +
    '== 重要说明 ==\n\n' +
    '- 你可以用 js-inject 修改任何现有元素的属性、样式、内容、事件\n' +
    '- 你可以用 js-inject 创建新的DOM元素、新的面板、新的按钮\n' +
    '- 你可以用 js-inject 添加新的事件监听器\n' +
    '- 所有注入的 CSS、HTML、JS 都会被自动保存，刷新页面不丢失\n' +
    '- 修改现有元素示例：document.getElementById("apiUrl").placeholder = "新提示";\n' +
    '- 创建新元素示例：var btn = document.createElement("button"); btn.textContent = "新按钮"; document.getElementById("mainContent").appendChild(btn);\n' +
    '- 修改样式示例：document.getElementById("floatingBall").style.background = "red";\n' +
    '- 面板结构：class="panel hidden" 的 div，用 .panel-header 和 .panel-body 组成\n' +
    '- 每次修改后简要说明改了什么\n' +
    '- 回复要简洁友好';

  function sendMessage() {
    if (!activeApi) { showToast('请先配置并选择 API'); return; }
    var text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    addChatMsg('user', text);
    chatHistory.push({ role: 'user', content: text });
    saveChatHistory();

    var loadingDiv = addChatMsg('assistant', '思考中');
    loadingDiv.classList.add('loading-dots');

    var messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    var start = Math.max(0, chatHistory.length - 20);
    for (var i = start; i < chatHistory.length; i++) messages.push(chatHistory[i]);

    var base = activeApi.url.replace(/\/+$/, '');
    fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + activeApi.key },
      body: JSON.stringify({ model: activeApi.model, messages: messages})
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '(无回复)';
      chatHistory.push({ role: 'assistant', content: reply });
      saveChatHistory();
      loadingDiv.remove();
      addChatMsg('assistant', reply);

      var m;
      // CSS 变量
      var r1 = /```cssvar\n?([\s\S]*?)```/g;
      while ((m = r1.exec(reply)) !== null) applyAiCSSVars(m[1]);
      // CSS
      var r2 = /```css\n?([\s\S]*?)```/g;
      while ((m = r2.exec(reply)) !== null) applyAiCSS(m[1]);
      // HTML（持久化）
      var r3 = /```html-inject\n?([\s\S]*?)```/g;
      while ((m = r3.exec(reply)) !== null) applyAiHTML(m[1]);
      // JS（持久化）
      var r4 = /```js-inject\n?([\s\S]*?)```/g;
      while ((m = r4.exec(reply)) !== null) applyAiJS(m[1]);
    })
    .catch(function(err) {
      loadingDiv.remove();
      addChatMsg('system', '请求失败: ' + err.message);
    });
  }

  function applyAiCSSVars(text) {
    var lines = text.split('\n');
    var savedVars = LS.get('aiCSSVars') || {};
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.indexOf('--') !== 0) continue;
      var parts = line.replace(';', '').split(':');
      if (parts.length < 2) continue;
      var varName = parts[0].trim();
      var varValue = parts.slice(1).join(':').trim();
      document.documentElement.style.setProperty(varName, varValue);
      savedVars[varName] = varValue;
    }
    LS.set('aiCSSVars', savedVars);
    showToast('配色已更新');
  }

  function applyAiCSS(css) {
    var el = document.getElementById('ai-custom-style');
    if (!el) {
      el = document.createElement('style');
      el.id = 'ai-custom-style';
      document.head.appendChild(el);
    }
    el.textContent += '\n' + css;
    LS.set('aiCustomCSS', el.textContent);
    showToast('样式已应用');
  }

  function applyAiHTML(html) {
    var main = $('#mainContent');
    if (main) {
      main.innerHTML = html;
      LS.set('aiCustomHTML', html);
      showToast('页面内容已更新');
    }
  }

  function applyAiJS(code) {
    try {
      var fn = new Function(code);
      fn();
      // 累加保存
      var existing = LS.get('aiCustomJS') || '';
      existing += '\n;' + code;
      LS.set('aiCustomJS', existing);
      showToast('功能已添加');
    } catch(err) {
      showToast('JS 执行失败: ' + err.message);
    }
  }

  // 恢复 AI 的所有修改
  function restoreAiMods() {
    // CSS 变量
    var savedVars = LS.get('aiCSSVars');
    if (savedVars) {
      var vk = Object.keys(savedVars);
      for (var i = 0; i < vk.length; i++) {
        document.documentElement.style.setProperty(vk[i], savedVars[vk[i]]);
      }
    }
    // CSS
    var savedCSS = LS.get('aiCustomCSS');
    if (savedCSS) {
      var s = document.createElement('style');
      s.id = 'ai-custom-style';
      s.textContent = savedCSS;
      document.head.appendChild(s);
    }
    // HTML
    var savedHTML = LS.get('aiCustomHTML');
    if (savedHTML) {
      var main = $('#mainContent');
      if (main) main.innerHTML = savedHTML;
    }
    // JS
    var savedJS = LS.get('aiCustomJS');
    if (savedJS) {
      try {
        var fn = new Function(savedJS);
        fn();
      } catch(e) {
        console.warn('恢复 AI JS 失败:', e);
      }
    }
  }

  $('#sendBtn').addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // ========== 字体设置（IndexedDB 大文件） ==========
  var builtinFonts = [
    { name: '系统默认', family: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', preview: '系统默认字体 ABCabc' },
    { name: '霞鹜文楷', family: '"LXGW WenKai", serif', preview: '霞鹜文楷 落霞与孤鹜齐飞' },
    { name: '思源宋体', family: '"Noto Serif SC", serif', preview: '思源宋体 秋水共长天一色' },
    { name: '思源黑体', family: '"Noto Sans SC", sans-serif', preview: '思源黑体 千里之行始于足下' },
    { name: '站酷小薇', family: '"ZCOOL XiaoWei", serif', preview: '站酷小薇 山高月小水落石出' },
    { name: '马善政楷体', family: '"Ma Shan Zheng", cursive', preview: '马善政楷 清风明月本无价' }
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

  function applyFontByIndex(idx) {
    currentFontIndex = idx; currentFontCustom = null;
    document.body.style.fontFamily = builtinFonts[idx].family;
    LS.set('currentFontIndex', idx); LS.remove('currentFontCustom');
  }

  function applyFontByCustom(familyName) {
    currentFontIndex = null; currentFontCustom = familyName;
    document.body.style.fontFamily = '"' + familyName + '", sans-serif';
    LS.remove('currentFontIndex'); LS.set('currentFontCustom', familyName);
  }

  function registerFontFromDataUrl(familyName, dataUrl) {
    var css = '@font-face { font-family: "' + familyName + '"; src: url(' + dataUrl + '); font-display: swap; }\n';
    fontStyleEl.textContent += css;
  }

  function renderFontList() {
    var container = $('#fontList');
    container.innerHTML = builtinFonts.map(function(f, idx) {
      var isActive = (currentFontCustom === null && currentFontIndex === idx);
      return '<div class="font-item' + (isActive ? ' active' : '') + '" data-idx="' + idx + '">' +
        '<div>' +
          '<div class="font-item-preview" style="font-family:' + f.family + '">' + f.preview + '</div>' +
          '<div class="font-item-name">' + f.name + '</div>' +
        '</div>' +
        '<div class="font-item-check"></div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.font-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var idx = parseInt(item.dataset.idx);
        applyFontByIndex(idx);
        renderFontList(); renderCustomFonts();
        showToast('已切换: ' + builtinFonts[idx].name);
      });
    });
  }

  function renderCustomFonts() {
    var container = $('#customFonts');
    if (customFontMetas.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = customFontMetas.map(function(f, idx) {
      var isActive = (currentFontCustom === f.familyName);
      return '<div class="font-item' + (isActive ? ' active' : '') + '" data-cidx="' + idx + '">' +
        '<div>' +
          '<div class="font-item-preview" style="font-family:\'' + f.familyName + '\'">' + esc(f.name) + ' 永远相信美好</div>' +
          '<div class="font-item-name">' + esc(f.name) + ' (自定义)</div>' +
        '</div>' +
        '<div class="font-item-check"></div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.font-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var cidx = parseInt(item.dataset.cidx);
        applyFontByCustom(customFontMetas[cidx].familyName);
        renderFontList(); renderCustomFonts();
        showToast('已切换: ' + customFontMetas[cidx].name);
      });
    });
  }

  // 从 IndexedDB 恢复所有自定义字体
  function restoreCustomFontsFromDB() {
    IDB.getAllFonts(function(fonts) {
      for (var i = 0; i < fonts.length; i++) {
        registerFontFromDataUrl(fonts[i].familyName, fonts[i].dataUrl);
      }
      // 恢复当前选择的字体
      if (currentFontCustom) {
        document.fonts.load('16px "' + currentFontCustom + '"').then(function() {
          document.body.style.fontFamily = '"' + currentFontCustom + '", sans-serif';
        }).catch(function() {});
      }
      renderCustomFonts();
    });
  }

  // 上传字体
  var fontUploadArea = $('#fontUploadArea');
  var fontFileInput = $('#fontFileInput');
  fontUploadArea.addEventListener('click', function() { fontFileInput.click(); });

  fontFileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;

    var fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
    var familyName = 'Custom-' + fontName + '-' + Date.now();

    showToast('正在加载字体（' + (file.size / 1024 / 1024).toFixed(1) + 'MB）...');

    var reader = new FileReader();
    reader.onload = function(ev) {
      var dataUrl = ev.target.result;

      // 注册字体
      registerFontFromDataUrl(familyName, dataUrl);

      // 存到 IndexedDB（支持大文件）
      IDB.saveFont({ familyName: familyName, name: fontName, dataUrl: dataUrl }, function(ok) {
        if (!ok) showToast('存储失败，字体本次可用但不会持久');
      });

      // 记录元数据到 localStorage（很小，只有名字）
      customFontMetas.push({ name: fontName, familyName: familyName });
      LS.set('customFontMetas', customFontMetas);

      // 等字体加载完
      document.fonts.load('16px "' + familyName + '"').then(function() {
        applyFontByCustom(familyName);
        renderFontList(); renderCustomFonts();
        showToast('字体 "' + fontName + '" 已加载');
      }).catch(function() {
        applyFontByCustom(familyName);
        renderFontList(); renderCustomFonts();
        showToast('字体已添加');
      });
    };
    reader.onerror = function() { showToast('读取文件失败'); };
    reader.readAsDataURL(file);
    fontFileInput.value = '';
  });

  // ========== 背景图片 ==========
  var bgData = LS.get('bgData') || null;
  var bgUploadArea = $('#bgUploadArea');
  var bgFileInput = $('#bgFileInput');

  bgUploadArea.addEventListener('click', function() { bgFileInput.click(); });

  bgFileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      $('#bgPreviewImg').src = ev.target.result;
      $('#bgPreview').classList.remove('hidden');
      bgData = { url: ev.target.result };
    };
    reader.readAsDataURL(file);
    bgFileInput.value = '';
  });

  $('#bgBlur').addEventListener('input', function(e) { $('#bgBlurVal').textContent = e.target.value + 'px'; });
  $('#bgDark').addEventListener('input', function(e) { $('#bgDarkVal').textContent = e.target.value + '%'; });

  $('#applyBgBtn').addEventListener('click', function() {
    if (!bgData) { showToast('请先上传图片'); return; }
    bgData.blur = $('#bgBlur').value;
    bgData.dark = $('#bgDark').value;
    applyBg(bgData);
    try { LS.set('bgData', bgData); } catch(e) { showToast('图片太大无法持久保存'); }
    showToast('背景已应用');
  });

  $('#removeBgBtn').addEventListener('click', function() {
    bgData = null; LS.remove('bgData');
    var layer = $('#bgLayer');
    layer.style.backgroundImage = 'none'; layer.style.filter = '';
    layer.style.inset = '0'; layer.style.setProperty('--bg-overlay-alpha', '0');
    $('#bgPreview').classList.add('hidden');
    showToast('背景已移除');
  });

  function applyBg(data) {
    if (!data || !data.url) return;
    var layer = $('#bgLayer');
    layer.style.backgroundImage = 'url(' + data.url + ')';
    var blur = parseInt(data.blur) || 0;
    layer.style.filter = 'blur(' + blur + 'px)';
    layer.style.inset = blur > 0 ? ('-' + (blur * 2) + 'px') : '0';
    layer.style.setProperty('--bg-overlay-alpha', (parseInt(data.dark) || 30) / 100);
  }

  // ========== 导出代码 ==========
  if ($('#generateExport')) {
    $('#generateExport').addEventListener('click', function() {
      var aiCSS = LS.get('aiCustomCSS') || '';
      var aiHTML = LS.get('aiCustomHTML') || '';
      var aiJS = LS.get('aiCustomJS') || '';
      var aiVars = LS.get('aiCSSVars') || {};

      // 生成 style.css：把当前 CSS 变量写进 :root
      var originalCSS = '';
      var styleSheets = document.querySelectorAll('link[rel="stylesheet"]');
      // 我们直接用提示告诉用户手动操作
      var varsCSS = ':root {\n';
      var vk = Object.keys(aiVars);
      for (var i = 0; i < vk.length; i++) {
        varsCSS += '  ' + vk[i] + ': ' + aiVars[vk[i]] + ';\n';
      }
      varsCSS += '}\n';

      var exportCSS = '/* === 以下 :root 覆盖替换 style.css 最顶部的 :root === */\n' + varsCSS;
      if (aiCSS) {
        exportCSS += '\n/* === AI 注入的额外样式，追加到 style.css 末尾 === */\n' + aiCSS;
      }

      var exportHTML = '';
      if (aiHTML) {
        exportHTML = '<!-- 替换 index.html 中 <main id="mainContent"> 到 </main> 之间的内容 -->\n' + aiHTML;
      } else {
        exportHTML = '（没有 HTML 修改）';
      }

      var exportJS = '';
      if (aiJS) {
        exportJS = '// 将以下代码追加到 script.js 的 init() 函数末尾\n' + aiJS;
      } else {
        exportJS = '（没有 JS 修改）';
      }

      $('#exportHtml').value = exportHTML;
      $('#exportCss').value = exportCSS;
      $('#exportJs').value = exportJS;
      $('#exportOutput').classList.remove('hidden');
      showToast('代码已生成');
    });
  }

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

  // ========== 初始化 ==========
  function init() {
    renderSavedApis();
    updateAiStatus();
    restoreChatHistory();
    restoreAiMods();
    renderThemeList();
    renderFontList();
    restoreCustomFontsFromDB();

    // 恢复内置字体选择
    if (currentFontCustom === null && currentFontIndex !== null && currentFontIndex !== undefined && builtinFonts[currentFontIndex]) {
      document.body.style.fontFamily = builtinFonts[currentFontIndex].family;
    }

    // 恢复主题颜色选择器
    var themeVars = LS.get('aiCSSVars');
    if (themeVars) updateColorInputs(themeVars);

    // 恢复背景
    if (bgData) {
      applyBg(bgData);
      if (bgData.url) { $('#bgPreviewImg').src = bgData.url; $('#bgPreview').classList.remove('hidden'); }
      if (bgData.blur) { $('#bgBlur').value = bgData.blur; $('#bgBlurVal').textContent = bgData.blur + 'px'; }
      if (bgData.dark) { $('#bgDark').value = bgData.dark; $('#bgDarkVal').textContent = bgData.dark + '%'; }
    }
  }

  init();
})();