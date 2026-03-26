
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
        req.onerror = function() {
          resolve(null);
        };
      });
    },
    saveFont: async function(fontObj) {
      var db = await DB.open();
      if (!db) return false;
      return new Promise(function(resolve) {
        var tx = db.transaction('fonts', 'readwrite');
        tx.objectStore('fonts').put(fontObj);
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
    },
    deleteFont: async function(id) {
      var db = await DB.open();
      if (!db) return;
      return new Promise(function(resolve) {
        var tx = db.transaction('fonts', 'readwrite');
        tx.objectStore('fonts').delete(id);
        tx.oncomplete = function() { resolve(); };
        tx.onerror = function() { resolve(); };
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

  // ========= 悬浮球 =========
  var ball = $('#floatingBall');
  var ballMenuEl = $('#ballMenu');
  var isDragging = false, hasMoved = false;
  var startX, startY, origX, origY;

  function getBallRect() {
    return ball.getBoundingClientRect();
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

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    ball.classList.remove('active');
    ballMenuEl.classList.remove('show');
    setTimeout(function() { ballMenuEl.classList.add('hidden'); }, 250);
  }

  // ========= 面板管理 =========
  var overlay = $('#overlay');
  var currentPanelEl = null;

  function openPanel(id) {
    closeMenu();

    if (currentPanelEl && currentPanelEl.id !== id) {
      currentPanelEl.classList.remove('show');
      currentPanelEl.classList.add('hidden');
    }

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
          '<button class="use-btn" onclick="window._useApi(' + i + ')" type="button" title="使用">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
          '<button class="edit-btn" onclick="window._editApi(' + i + ')" type="button" title="编辑">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
          '</button>' +
          '<button class="del-btn" onclick="window._delApi(' + i + ')" type="button" title="删除">' +
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

  window._editApi = function(i) {
    var config = apiConfigs[i];
    if (!config) return;

    $('#apiName').value = config.name || '';
    $('#apiUrl').value = config.url || '';
    $('#apiKey').value = config.key || '';
    $('#apiModel').value = config.model || '';

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

  $('#saveApiBtn').addEventListener('click', function() {
    var name = $('#apiName').value.trim();
    var url = $('#apiUrl').value.trim();
    var key = $('#apiKey').value.trim();
    var model = $('#apiModel').value.trim();

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

  $('#toggleKeyVisible').addEventListener('click', function() {
    var inp = $('#apiKey');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  $('#fetchModelsBtn').addEventListener('click', function() {
    var url = $('#apiUrl').value.trim();
    var key = $('#apiKey').value.trim();
    if (!url || !key) {
      showToast('请先填写 API 地址和 Key');
      return;
    }

    showToast('正在获取模型列表...');
    var base = url.replace(/\/+$/, '');

    fetch(base + '/models', {
      headers: {
        'Authorization': 'Bearer ' + key
      }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var raw = data.data || data;
      var models = [];

      if (Array.isArray(raw)) {
        for (var i = 0; i < raw.length; i++) {
          var id = raw[i].id || raw[i].name || raw[i];
          if (id) models.push(id);
        }
      }

      if (models.length === 0) {
        showToast('未找到模型');
        return;
      }

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
    .catch(function(err) {
      showToast('获取失败: ' + err.message);
    });
  });

  $('#testApiBtn').addEventListener('click', function() {
    var url = $('#apiUrl').value.trim();
    var key = $('#apiKey').value.trim();
    var model = $('#apiModel').value.trim();

    if (!url || !key || !model) {
      showToast('请填写完整信息');
      return;
    }

    showToast('正在测试连接...');
    var base = url.replace(/\/+$/, '');

    fetch(base + '/chat/completions', {
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
    .then(function(res) {
      if (res.ok) showToast('连接成功');
      else showToast('连接失败: ' + res.status);
    })
    .catch(function(err) {
      showToast('连接失败: ' + err.message);
    });
  });

  // ========= 源码仓 =========
  function saveSourceRepo() {
    LS.set('sourceRepo', {
      html: ($('#sourceHtml').value || ''),
      css: ($('#sourceCss').value || ''),
      js: ($('#sourceJs').value || '')
    });
    showToast('源码已保存');
  }

  function restoreSourceRepo() {
    var repo = LS.get('sourceRepo') || {};
    if ($('#sourceHtml')) $('#sourceHtml').value = repo.html || '';
    if ($('#sourceCss')) $('#sourceCss').value = repo.css || '';
    if ($('#sourceJs')) $('#sourceJs').value = repo.js || '';
  }

  if ($('#saveSourceBtn')) {
    $('#saveSourceBtn').addEventListener('click', saveSourceRepo);
  }

  if ($('#clearSourceBtn')) {
    $('#clearSourceBtn').addEventListener('click', function() {
      if (!confirm('确定清空源码仓内容吗？')) return;
      LS.remove('sourceRepo');
      $('#sourceHtml').value = '';
      $('#sourceCss').value = '';
      $('#sourceJs').value = '';
      showToast('源码仓已清空');
    });
  }

  function getSourceRepoText() {
    var repo = LS.get('sourceRepo') || {};
    if (!repo.html && !repo.css && !repo.js) return '';
    return (
      '\n\n=== 用户提供的真实源码（优先基于这些源码修改） ===\n\n' +
      '[index.html]\n' + (repo.html || '') + '\n\n' +
      '[style.css]\n' + (repo.css || '') + '\n\n' +
      '[script.js]\n' + (repo.js || '') + '\n\n' +
      '如果用户要求修改功能，请优先基于以上真实源码进行修改，而不是另造假按钮或假输入框。\n'
    );
  }

  // ========= AI 助手 =========
  var chatMessages = $('#chatMessages');
  var chatInput = $('#chatInput');
  var chatHistory = LS.get('chatHistory') || [];
  var visionImageData = null;

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
    html = html.replace(/```(\w[\w-]*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/\n/g, '<br>');
    div.innerHTML = html;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function restoreChatHistory() {
    if (!chatHistory || chatHistory.length === 0) return;
    for (var i = 0; i < chatHistory.length; i++) {
      if (chatHistory[i].displayRole && chatHistory[i].displayContent) {
        addChatMsg(chatHistory[i].displayRole, chatHistory[i].displayContent);
      } else if (chatHistory[i].role === 'user') {
        addChatMsg('user', typeof chatHistory[i].content === 'string' ? chatHistory[i].content : '[复杂消息]');
      } else if (chatHistory[i].role === 'assistant') {
        addChatMsg('assistant', chatHistory[i].content || '');
      }
    }
  }

  function saveChatHistory() {
    try {
      LS.set('chatHistory', chatHistory.slice(-50));
    } catch(e) {}
  }

  var SYSTEM_PROMPT =
    '你是一个内嵌在网页中的AI助手。你不是普通聊天AI。你已经运行在用户的网页里。\n\n' +
    '重要：你不需要用户给你代码。你已经在这个网页内部运行。你的回复中的代码会被自动执行并持久保存。\n' +
    '你绝对不能说"请把代码发给我"、"我无法访问你的文件"之类的话。你就在这个网页里，你可以直接修改它。\n\n' +
    '你有以下能力：\n' +
    '1. 改配色：```cssvar``` 代码块\n' +
    '2. 改样式：```css``` 代码块\n' +
    '3. 改主页面内容：```html-inject``` 代码块\n' +
    '4. 改功能或新增功能：```js-inject``` 代码块\n\n' +
    '现有重要元素：\n' +
    '#mainContent #apiPanel #apiName #apiUrl #apiKey #apiModel #saveApiBtn #testApiBtn #fetchModelsBtn #savedApis\n' +
    '#aiPanel #chatMessages #chatInput #sendBtn #aiStatus\n' +
    '#themePanel #themeList #customThemeList #colorBg #colorCard #colorAccent #colorAccentDeep #colorText #colorBorder\n' +
    '#fontPanel #fontList #fontUploadArea #customFonts\n' +
    '#bgPanel #bgUploadArea #bgPreview #bgBlur #bgDark #applyBgBtn #removeBgBtn\n' +
    '#sourcePanel #sourceHtml #sourceCss #sourceJs #saveSourceBtn\n' +
    '#floatingBall #ballMenu #bgLayer #overlay #toast\n\n' +
    '如果用户要求修改已有功能，优先修改现有逻辑，而不是新增假的替代UI。\n' +
    '比如“API配置可编辑”应该修改 savedApis 列表和编辑回填逻辑，而不是新增一个独立输入框。\n' +
    '回复简洁友好。';

  function buildUserContent(text) {
    if (visionImageData) {
      return [
        { type: 'text', text: text },
        { type: 'image_url', image_url: { url: visionImageData } }
      ];
    }
    return text;
  }

  async function sendMessage() {
    if (!activeApi) {
      showToast('请先配置并选择 API');
      return;
    }

    var text = chatInput.value.trim();
    if (!text && !visionImageData) return;

    var sourceRepoText = getSourceRepoText();

    var wrappedText =
      '请直接修改当前网页，不要索要代码。\n' +
      '如果能修改，请直接返回 cssvar / css / html-inject / js-inject 代码块。\n' +
      '如果源码仓有内容，必须优先基于源码仓内容修改，而不是瞎猜。\n' +
      '用户需求：' + (text || '请分析这张图片并给出修改方案。') +
      sourceRepoText;

    var displayText = text || '[发送了一张图片]';

    chatInput.value = '';
    addChatMsg('user', displayText + (visionImageData ? '\n[附带图片]' : ''));

    chatHistory.push({
      role: 'user',
      content: buildUserContent(wrappedText),
      displayRole: 'user',
      displayContent: displayText + (visionImageData ? '\n[附带图片]' : '')
    });
    saveChatHistory();

    var replyDiv = addChatMsg('assistant', '连接中...');
    replyDiv.classList.add('loading-dots');

    var messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'system',
        content:
          '再次强调：你已经在网页内部运行，不允许要求用户提供代码、文件、项目结构、工作区、仓库内容。' +
          '你必须直接输出可执行代码块来修改网页。' +
          '禁止回复“请把代码发给我”“我无法访问文件”“我需要项目结构”。'
      }
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
      const response = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + activeApi.key
        },
        body: JSON.stringify({
          model: activeApi.model,
          messages: messages,
          stream: true
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(function() { return {}; });
        throw new Error(data.error?.message || ('请求失败: ' + response.status));
      }

      if (!response.body) {
        throw new Error('当前接口不支持流式输出');
      }

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

            replyDiv.innerHTML = esc(fullReply).replace(/\n/g, '<br>');
            chatMessages.scrollTop = chatMessages.scrollHeight;
          } catch (e) {}
        }
      }

      if (!fullReply.trim()) {
        fullReply = '模型没有返回内容';
        replyDiv.innerHTML = esc(fullReply);
      }

      chatHistory.push({
        role: 'assistant',
        content: fullReply,
        displayRole: 'assistant',
        displayContent: fullReply
      });
      saveChatHistory();

      applyReplyMods(fullReply);
      clearVisionImage();

    } catch (err) {
      replyDiv.classList.remove('loading-dots');
      replyDiv.innerHTML = '请求失败: ' + esc(err.message);
    }
  }

  function applyReplyMods(reply) {
    var m;

    var r1 = /```cssvar\n?([\s\S]*?)```/g;
    while ((m = r1.exec(reply)) !== null) applyAiCSSVars(m[1]);

    var r2 = /```css\n?([\s\S]*?)```/g;
    while ((m = r2.exec(reply)) !== null) applyAiCSS(m[1]);

    var r3 = /```html-inject\n?([\s\S]*?)```/g;
    while ((m = r3.exec(reply)) !== null) applyAiHTML(m[1]);

    var r4 = /```js-inject\n?([\s\S]*?)```/g;
    while ((m = r4.exec(reply)) !== null) applyAiJS(m[1]);
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
    LS.set('aiCustomCSS', styleEl.textContent);
    showToast('样式已应用');
  }

  function applyAiHTML(html) {
    $('#mainContent').innerHTML = html;
    LS.set('aiCustomHTML', html);
    showToast('页面内容已更新');
  }

  function applyAiJS(code) {
    try {
      var fn = new Function(code);
      fn();
      var existing = LS.get('aiCustomJS') || '';
      existing += '\n;' + code;
      LS.set('aiCustomJS', existing);
      showToast('功能已添加');
    } catch (err) {
      showToast('JS 执行失败: ' + err.message);
    }
  }

  function restoreAiMods() {
    var savedVars = LS.get('aiCSSVars');
    if (savedVars) {
      var vk = Object.keys(savedVars);
      for (var i = 0; i < vk.length; i++) {
        document.documentElement.style.setProperty(vk[i], savedVars[vk[i]]);
      }
    }

    var savedCSS = LS.get('aiCustomCSS');
    if (savedCSS) {
      var s = document.createElement('style');
      s.id = 'ai-custom-style';
      s.textContent = savedCSS;
      document.head.appendChild(s);
    }

    var savedHTML = LS.get('aiCustomHTML');
    if (savedHTML) {
      $('#mainContent').innerHTML = savedHTML;
    }

    var savedJS = LS.get('aiCustomJS');
    if (savedJS) {
      try {
        var fn = new Function(savedJS);
        fn();
      } catch (e) {
        console.warn('恢复 AI JS 失败', e);
      }
    }
  }

  $('#sendBtn').addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ========= 图片给 AI =========
  var visionImageData = null;

  function clearVisionImage() {
    visionImageData = null;
    $('#imagePreviewBox').classList.add('hidden');
    $('#imagePreviewImg').src = '';
    $('#visionImageInput').value = '';
  }

  $('#pickVisionImage').addEventListener('click', function() {
    $('#visionImageInput').click();
  });

  $('#visionImageInput').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      visionImageData = ev.target.result;
      $('#imagePreviewImg').src = visionImageData;
      $('#imagePreviewBox').classList.remove('hidden');
      showToast('图片已添加');
    };
    reader.readAsDataURL(file);
  });

  $('#removeVisionImage').addEventListener('click', clearVisionImage);

  // ========= 字体 =========
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

  function registerFontFromDataUrl(familyName, dataUrl) {
    fontStyleEl.textContent += '@font-face{font-family:"' + familyName + '";src:url(' + dataUrl + ');font-display:swap;}';
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

  function renderFontList() {
    var container = $('#fontList');
    container.innerHTML = builtinFonts.map(function(f, idx) {
      var active = (currentFontCustom === null && currentFontIndex === idx);
      return '<div class="font-item' + (active ? ' active' : '') + '" data-idx="' + idx + '">' +
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
    if (customFontMetas.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = customFontMetas.map(function(f, idx) {
      var active = (currentFontCustom === f.familyName);
      return '<div class="font-item' + (active ? ' active' : '') + '" data-cidx="' + idx + '">' +
        '<div>' +
          '<div class="font-item-preview" style="font-family:\'' + f.familyName + '\'">' + esc(f.name) + ' 永远相信美好</div>' +
          '<div class="font-item-name">' + esc(f.name) + ' (自定义)</div>' +
        '</div>' +
        '<div class="font-item-check"></div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.font-item').forEach(function(item) {
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
    var fonts = await DB.getAllFonts();
    for (var i = 0; i < fonts.length; i++) {
      registerFontFromDataUrl(fonts[i].familyName, fonts[i].dataUrl);
    }

    if (currentFontCustom) {
      document.fonts.load('16px "' + currentFontCustom + '"').then(function() {
        document.body.style.fontFamily = '"' + currentFontCustom + '", sans-serif';
      }).catch(function() {});
    }

    renderCustomFonts();
  }

  $('#fontUploadArea').addEventListener('click', function() {
    $('#fontFileInput').click();
  });

  $('#fontFileInput').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;

    var fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
    var familyName = 'Custom-' + fontName + '-' + Date.now();
    var fontId = 'font-' + Date.now();

    showToast('正在加载字体（' + (file.size / 1024 / 1024).toFixed(1) + 'MB）...');

    var reader = new FileReader();
    reader.onload = async function(ev) {
      var dataUrl = ev.target.result;
      registerFontFromDataUrl(familyName, dataUrl);

      await DB.saveFont({
        id: fontId,
        familyName: familyName,
        name: fontName,
        dataUrl: dataUrl
      });

      customFontMetas.push({
        id: fontId,
        name: fontName,
        familyName: familyName
      });
      LS.set('customFontMetas', customFontMetas);

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
      showToast('读取字体失败');
    };

    reader.readAsDataURL(file);
    $('#fontFileInput').value = '';
  });

  // ========= 背景图片 =========
  var bgData = LS.get('bgData') || null;

  $('#bgUploadArea').addEventListener('click', function() {
    $('#bgFileInput').click();
  });

  $('#bgFileInput').addEventListener('change', function(e) {
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
    $('#bgFileInput').value = '';
  });

  $('#bgBlur').addEventListener('input', function(e) {
    $('#bgBlurVal').textContent = e.target.value + 'px';
  });

  $('#bgDark').addEventListener('input', function(e) {
    $('#bgDarkVal').textContent = e.target.value + '%';
  });

  $('#applyBgBtn').addEventListener('click', function() {
    if (!bgData) {
      showToast('请先上传图片');
      return;
    }
    bgData.blur = $('#bgBlur').value;
    bgData.dark = $('#bgDark').value;
    applyBg(bgData);
    LS.set('bgData', bgData);
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

  // ========= 主题 =========
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
    container.innerHTML = PRESET_THEMES.map(function(theme) {
      var dots = '';
      var colors = [theme.vars['--bg-primary'], theme.vars['--accent'], theme.vars['--text-primary'], theme.vars['--border']];
      for (var i = 0; i < colors.length; i++) {
        dots += '<div class="theme-color-dot" style="background:' + colors[i] + '"></div>';
      }
      return '<div class="theme-card' + (currentThemeId === theme.id ? ' active' : '') + '" data-theme="' + theme.id + '">' +
        '<div class="theme-card-colors">' + dots + '</div>' +
        '<div class="theme-card-name">' + esc(theme.name) + '</div>' +
        '<div class="theme-card-desc">' + esc(theme.desc) + '</div>' +
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
        '<button class="theme-card-del" onclick="event.stopPropagation();window._delTheme(' + idx + ')" type="button">x</button>' +
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
    if (currentThemeId === removed.id) selectTheme('blue-white');
    renderThemeList();
    showToast('已删除: ' + removed.name);
  };

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

  $('#saveCustomTheme').addEventListener('click', function() {
    var name = ($('#customThemeName').value || '').trim();
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
      '--border-light': 'rgba(173, 205, 234, 0.3)',
      '--shadow': 'rgba(0, 0, 0, 0.06)'
    };

    var id = 'custom-' + Date.now();
    customThemes.push({
      id: id,
      name: name,
      desc: '自定义',
      vars: vars
    });

    LS.set('customThemes', customThemes);
    currentThemeId = id;
    LS.set('currentThemeId', id);
    applyThemeVars(vars);
    LS.set('aiCSSVars', vars);
    $('#customThemeName').value = '';
    renderThemeList();
    showToast('主题已保存');
  });

  $('#resetTheme').addEventListener('click', function() {
    selectTheme('blue-white');
    showToast('已恢复默认主题');
  });

  $('#clearChatBtn').addEventListener('click', function() {
    try {
      chatHistory = [];
      LS.remove('chatHistory');
      chatMessages.innerHTML = '<div class="chat-msg system">聊天记录已清空，可以开始新的对话。</div>';
      showToast('已清空聊天记录');
    } catch (e) {
      showToast('清空失败');
    }
  });

  $('#clearAllBtn').addEventListener('click', function() {
    if (!confirm('确定重置所有设置？API、聊天、主题、字体、背景都会被清除。')) return;
    localStorage.clear();
    try { indexedDB.deleteDatabase('MonoSpaceDB'); } catch(e) {}
    location.reload();
  });

  // ========= 导出 =========
  $('#generateExport').addEventListener('click', function() {
    var aiCSS = LS.get('aiCustomCSS') || '';
    var aiHTML = LS.get('aiCustomHTML') || '';
    var aiJS = LS.get('aiCustomJS') || '';
    var aiVars = LS.get('aiCSSVars') || {};

    var varsCSS = ':root {\n';
    Object.keys(aiVars).forEach(function(k) {
      varsCSS += '  ' + k + ': ' + aiVars[k] + ';\n';
    });
    varsCSS += '}\n';

    var exportCSS = '/* 把这段 :root 覆盖到 style.css 顶部 */\n' + varsCSS;
    if (aiCSS) exportCSS += '\n/* 追加到 style.css 末尾的 AI 样式 */\n' + aiCSS;

    var exportHTML = aiHTML || '（没有 HTML 修改）';
    var exportJS = aiJS || '（没有 JS 修改）';

    $('#exportHtml').value = exportHTML;
    $('#exportCss').value = exportCSS;
    $('#exportJs').value = exportJS;
    $('#exportOutput').classList.remove('hidden');
    showToast('代码已生成');
  });

  window._copyExport = function(id) {
    var el = $('#' + id);
    if (!el) return;
    el.select();
    el.setSelectionRange(0, 999999);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(el.value).then(function() {
        showToast('已复制');
      }).catch(function() {
        document.execCommand('copy');
        showToast('已复制');
      });
    } else {
      document.execCommand('copy');
      showToast('已复制');
    }
  };

  // ========= 初始化 =========
  async function init() {
    restoreSourceRepo();
    renderSavedApis();
    updateAiStatus();
    restoreChatHistory();
    restoreAiMods();
    renderThemeList();
    renderFontList();
    await restoreCustomFontsFromDB();

    if (currentFontCustom === null && currentFontIndex !== null && currentFontIndex !== undefined && builtinFonts[currentFontIndex]) {
      document.body.style.fontFamily = builtinFonts[currentFontIndex].family;
    }

    var themeVars = LS.get('aiCSSVars');
    if (themeVars) updateColorInputs(themeVars);

    if (bgData) {
      applyBg(bgData);
      if (bgData.url) {
        $('#bgPreviewImg').src = bgData.url;
        $('#bgPreview').classList.remove('hidden');
      }
      if (bgData.blur) {
        $('#bgBlur').value = bgData.blur;
        $('#bgBlurVal').textContent = bgData.blur + 'px';
      }
      if (bgData.dark) {
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

    if (!LS.get('aiCustomHTML')) {
      $('#mainContent').innerHTML =
        '<div style="text-align:center;padding:80px 20px 40px;">' +
        '<h1 style="font-size:28px;margin-bottom:10px;">Mono Space</h1>' +
        '<p style="font-size:14px;color:var(--text-secondary);">这是一个可被 AI 自我改造的网页空间。</p>' +
        '</div>';
    }
  }

  init();
})();