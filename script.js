(function() {
  'use strict';

  var $ = function(s) { return document.querySelector(s); };
  var $$ = function(s) { return document.querySelectorAll(s); };
  var LS = {
    get: function(k) { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } },
    set: function(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
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

  // ========== 预设主题 ==========
  var THEMES = [
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
      id: 'forest', name: '森林', desc: '清新绿意',
      vars: {
        '--bg-primary': '#f0f5f1', '--bg-secondary': '#ffffff', '--bg-card': '#ffffff',
        '--accent': '#7bb88e', '--accent-deep': '#5a9c6e',
        '--text-primary': '#1a2b1e', '--text-secondary': '#4a6650', '--text-muted': '#8aa892',
        '--border': '#1a2b1e', '--border-light': 'rgba(123,184,142,0.3)', '--shadow': 'rgba(123,184,142,0.12)'
      }
    },
    {
      id: 'sunset', name: '日落', desc: '温暖橙调',
      vars: {
        '--bg-primary': '#fef6f0', '--bg-secondary': '#ffffff', '--bg-card': '#ffffff',
        '--accent': '#e8a86b', '--accent-deep': '#d48c4a',
        '--text-primary': '#2b1e12', '--text-secondary': '#7a5f42', '--text-muted': '#b09878',
        '--border': '#2b1e12', '--border-light': 'rgba(232,168,107,0.3)', '--shadow': 'rgba(232,168,107,0.12)'
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
    },
    {
      id: 'purple', name: '紫雾', desc: '优雅紫调',
      vars: {
        '--bg-primary': '#f4f0fa', '--bg-secondary': '#ffffff', '--bg-card': '#ffffff',
        '--accent': '#a98ec4', '--accent-deep': '#8b6dab',
        '--text-primary': '#201828', '--text-secondary': '#5a4868', '--text-muted': '#9888a5',
        '--border': '#201828', '--border-light': 'rgba(169,142,196,0.3)', '--shadow': 'rgba(169,142,196,0.12)'
      }
    },
    {
      id: 'pure-dark', name: '纯黑', desc: 'OLED 深黑',
      vars: {
        '--bg-primary': '#000000', '--bg-secondary': '#0a0a0a', '--bg-card': '#141414',
        '--accent': '#adcdea', '--accent-deep': '#8ab8de',
        '--text-primary': '#f0f0f0', '--text-secondary': '#888888', '--text-muted': '#555555',
        '--border': '#2a2a2a', '--border-light': 'rgba(173,205,234,0.12)', '--shadow': 'rgba(0,0,0,0.5)'
      }
    }
  ];

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

  function renderThemeList() {
    var container = $('#themeList');
    if (!container) return;
    container.innerHTML = THEMES.map(function(theme) {
      var dots = '';
      var showColors = [theme.vars['--bg-primary'], theme.vars['--accent'], theme.vars['--text-primary'], theme.vars['--border']];
      for (var i = 0; i < showColors.length; i++) {
        dots += '<div class="theme-color-dot" style="background:' + showColors[i] + '"></div>';
      }
      return '<div class="theme-card' + (currentThemeId === theme.id ? ' active' : '') + '" data-theme="' + theme.id + '">' +
        '<div class="theme-card-colors">' + dots + '</div>' +
        '<div class="theme-card-name">' + theme.name + '</div>' +
        '<div class="theme-card-desc">' + theme.desc + '</div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.theme-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var themeId = card.dataset.theme;
        for (var i = 0; i < THEMES.length; i++) {
          if (THEMES[i].id === themeId) {
            currentThemeId = themeId;
            LS.set('currentThemeId', themeId);
            applyThemeVars(THEMES[i].vars);
            LS.set('aiCSSVars', THEMES[i].vars);
            updateColorInputs(THEMES[i].vars);
            renderThemeList();
            showToast('已切换: ' + THEMES[i].name);
            break;
          }
        }
      });
    });
  }

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
        '--bg-card': $('#colorCard').value,
        '--bg-secondary': $('#colorCard').value,
        '--accent': $('#colorAccent').value,
        '--accent-deep': $('#colorAccentDeep').value,
        '--text-primary': $('#colorText').value,
        '--border': $('#colorBorder').value
      };
      applyThemeVars(vars);
      var saved = LS.get('aiCSSVars') || {};
      var keys = Object.keys(vars);
      for (var i = 0; i < keys.length; i++) saved[keys[i]] = vars[keys[i]];
      LS.set('aiCSSVars', saved);
      currentThemeId = 'custom';
      LS.set('currentThemeId', 'custom');
      renderThemeList();
      showToast('自定义配色已应用');
    });
  }

  if ($('#resetTheme')) {
    $('#resetTheme').addEventListener('click', function() {
      currentThemeId = 'blue-white';
      LS.set('currentThemeId', 'blue-white');
      applyThemeVars(THEMES[0].vars);
      LS.set('aiCSSVars', THEMES[0].vars);
      updateColorInputs(THEMES[0].vars);
      renderThemeList();
      var aiStyle = document.getElementById('ai-custom-style');
      if (aiStyle) aiStyle.remove();
      LS.remove('aiCustomCSS');
      showToast('已恢复默认主题');
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
      if (!confirm('确定重置所有设置？API、聊天、主题、字体、背景都会清除。')) return;
      localStorage.clear();
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
    renderSavedApis();
    updateAiStatus();
    showToast('已切换至: ' + activeApi.name);
  };

  window._delApi = function(i) {
    var removed = apiConfigs.splice(i, 1)[0];
    LS.set('apiConfigs', apiConfigs);
    if (activeApi && activeApi.name === removed.name) {
      activeApi = null; LS.remove('activeApi'); updateAiStatus();
    }
    renderSavedApis();
    showToast('已删除');
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
    renderSavedApis();
    showToast('配置已保存');
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

  // ========== AI 助手 ==========
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
    try { LS.set('chatHistory', chatHistory); } catch(e) { /* 超出容量 */ }
  }

  var SYSTEM_PROMPT = '你是一个强大的网页设计助手。用户会要求你修改当前网页的样式、布局、配色、主题等。\n\n' +
    '你可以通过以下方式修改网页：\n\n' +
    '1. 修改CSS变量（改配色最有效）：\n```cssvar\n--bg-primary: #新颜色;\n--accent: #新颜色;\n```\n\n' +
    '可用的CSS变量：\n' +
    '--bg-primary, --bg-secondary, --bg-card, --accent, --accent-deep,\n' +
    '--text-primary, --text-secondary, --text-muted, --border, --border-light, --shadow, --radius, --radius-sm\n\n' +
    '2. 注入额外CSS：\n```css\n.hero-title { font-size: 40px; }\n```\n\n' +
    '3. 替换页面HTML：\n```html-inject\n<div>新内容</div>\n```\n\n' +
    '注意：改配色优先用 cssvar，回复要简洁。';

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
      body: JSON.stringify({ model: activeApi.model, messages: messages, max_tokens: 2048 })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '(无回复)';
      chatHistory.push({ role: 'assistant', content: reply });
      saveChatHistory();
      loadingDiv.remove();
      addChatMsg('assistant', reply);

      var m;
      var r1 = /```cssvar\n?([\s\S]*?)```/g;
      while ((m = r1.exec(reply)) !== null) applyAiCSSVars(m[1]);
      var r2 = /```css\n?([\s\S]*?)```/g;
      while ((m = r2.exec(reply)) !== null) applyAiCSS(m[1]);
      var r3 = /```html-inject\n?([\s\S]*?)```/g;
      while ((m = r3.exec(reply)) !== null) $('#mainContent').innerHTML = m[1];
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
    var styleEl = document.getElementById('ai-custom-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'ai-custom-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent += '\n' + css;
    try { LS.set('aiCustomCSS', styleEl.textContent); } catch(e) {}
    showToast('样式已应用');
  }

  // 恢复 AI CSS
  var savedCSS = LS.get('aiCustomCSS');
  if (savedCSS) {
    var s = document.createElement('style');
    s.id = 'ai-custom-style';
    s.textContent = savedCSS;
    document.head.appendChild(s);
  }

  // 恢复 AI CSS 变量
  var savedVars = LS.get('aiCSSVars');
  if (savedVars) {
    var vk = Object.keys(savedVars);
    for (var vi = 0; vi < vk.length; vi++) {
      document.documentElement.style.setProperty(vk[vi], savedVars[vk[vi]]);
    }
  }

  $('#sendBtn').addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // ========== 字体设置（修复版） ==========
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
  var customFonts = LS.get('customFonts') || [];

  // 注入自定义字体的 style 标签
  var fontStyleEl = document.getElementById('custom-font-faces');
  if (!fontStyleEl) {
    fontStyleEl = document.createElement('style');
    fontStyleEl.id = 'custom-font-faces';
    document.head.appendChild(fontStyleEl);
  }

  function applyFontByIndex(idx) {
    currentFontIndex = idx;
    currentFontCustom = null;
    document.body.style.fontFamily = builtinFonts[idx].family;
    LS.set('currentFontIndex', idx);
    LS.remove('currentFontCustom');
  }

  function applyFontByCustom(familyName) {
    currentFontIndex = null;
    currentFontCustom = familyName;
    document.body.style.fontFamily = '"' + familyName + '", sans-serif';
    LS.remove('currentFontIndex');
    LS.set('currentFontCustom', familyName);
  }

  function rebuildFontFaces() {
    var css = '';
    for (var i = 0; i < customFonts.length; i++) {
      var f = customFonts[i];
      if (f.dataUrl) {
        css += '@font-face {\n';
        css += '  font-family: "' + f.familyName + '";\n';
        css += '  src: url(' + f.dataUrl + ');\n';
        css += '  font-display: swap;\n';
        css += '}\n';
      }
    }
    fontStyleEl.textContent = css;
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
        renderFontList();
        renderCustomFonts();
        showToast('已切换: ' + builtinFonts[idx].name);
      });
    });
  }

  function renderCustomFonts() {
    var container = $('#customFonts');
    if (customFonts.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = customFonts.map(function(f, idx) {
      var isActive = (currentFontCustom === f.familyName);
      return '<div class="font-item' + (isActive ? ' active' : '') + '" data-cidx="' + idx + '">' +
        '<div>' +
          '<div class="font-item-preview" style="font-family:\'' + f.familyName + '\'">' + f.name + ' 永远相信美好</div>' +
          '<div class="font-item-name">' + f.name + ' (自定义)</div>' +
        '</div>' +
        '<div class="font-item-check"></div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.font-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var cidx = parseInt(item.dataset.cidx);
        applyFontByCustom(customFonts[cidx].familyName);
        renderFontList();
        renderCustomFonts();
        showToast('已切换: ' + customFonts[cidx].name);
      });
    });
  }

  // 上传字体 — 用 readAsDataURL 避免大文件问题
  var fontUploadArea = $('#fontUploadArea');
  var fontFileInput = $('#fontFileInput');
  fontUploadArea.addEventListener('click', function() { fontFileInput.click(); });

  fontFileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;

    // 限制大小 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('字体文件太大，请选择 5MB 以内的');
      fontFileInput.value = '';
      return;
    }

    var fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
    var familyName = 'Custom-' + fontName + '-' + Date.now();

    showToast('正在加载字体...');

    var reader = new FileReader();
    reader.onload = function(ev) {
      var dataUrl = ev.target.result;

      // 用 @font-face 方式注册
      var fontInfo = { name: fontName, familyName: familyName, dataUrl: dataUrl };
      customFonts.push(fontInfo);

      // 保存（可能会因为太大失败）
      try {
        LS.set('customFonts', customFonts);
      } catch(err) {
        // 存不下就不存 dataUrl，只保留名字
        fontInfo.dataUrl = null;
        try { LS.set('customFonts', customFonts); } catch(e2) {}
        showToast('字体已加载，但文件太大无法持久保存');
      }

      rebuildFontFaces();

      // 等字体加载完再应用
      document.fonts.load('16px "' + familyName + '"').then(function() {
        applyFontByCustom(familyName);
        renderFontList();
        renderCustomFonts();
        showToast('字体 "' + fontName + '" 已加载');
      }).catch(function() {
        applyFontByCustom(familyName);
        renderFontList();
        renderCustomFonts();
        showToast('字体已添加');
      });
    };
    reader.onerror = function() {
      showToast('读取字体文件失败');
    };
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
      var dataUrl = ev.target.result;
      $('#bgPreviewImg').src = dataUrl;
      $('#bgPreview').classList.remove('hidden');
      bgData = { url: dataUrl };
    };
    reader.readAsDataURL(file);
    bgFileInput.value = '';
  });

  $('#bgBlur').addEventListener('input', function(e) {
    $('#bgBlurVal').textContent = e.target.value + 'px';
  });
  $('#bgDark').addEventListener('input', function(e) {
    $('#bgDarkVal').textContent = e.target.value + '%';
  });

  $('#applyBgBtn').addEventListener('click', function() {
    if (!bgData) { showToast('请先上传图片'); return; }
    bgData.blur = $('#bgBlur').value;
    bgData.dark = $('#bgDark').value;
    applyBg(bgData);
    try { LS.set('bgData', bgData); } catch(e) { showToast('图片太大无法保存'); }
    showToast('背景已应用');
  });

  $('#removeBgBtn').addEventListener('click', function() {
    bgData = null;
    LS.remove('bgData');
    var layer = $('#bgLayer');
    layer.style.backgroundImage = 'none';
    layer.style.filter = '';
    layer.style.inset = '0';
    layer.style.setProperty('--bg-overlay-alpha', '0');
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

  // ========== 初始化 ==========
  function init() {
    // API
    renderSavedApis();
    updateAiStatus();

    // 聊天记录
    restoreChatHistory();

    // 字体
    rebuildFontFaces();
    renderFontList();
    renderCustomFonts();
    if (currentFontCustom) {
      document.fonts.load('16px "' + currentFontCustom + '"').then(function() {
        document.body.style.fontFamily = '"' + currentFontCustom + '", sans-serif';
      }).catch(function() {});
    } else if (currentFontIndex !== null && currentFontIndex !== undefined && builtinFonts[currentFontIndex]) {
      document.body.style.fontFamily = builtinFonts[currentFontIndex].family;
    }

    // 主题
    renderThemeList();
    var themeVars = LS.get('aiCSSVars');
    if (themeVars) {
      updateColorInputs(themeVars);
    }

    // 背景图
    if (bgData) {
      applyBg(bgData);
      if (bgData.url) {
        $('#bgPreviewImg').src = bgData.url;
        $('#bgPreview').classList.remove('hidden');
      }
      if (bgData.blur) { $('#bgBlur').value = bgData.blur; $('#bgBlurVal').textContent = bgData.blur + 'px'; }
      if (bgData.dark) { $('#bgDark').value = bgData.dark; $('#bgDarkVal').textContent = bgData.dark + '%'; }
    }
  }

  init();
})();