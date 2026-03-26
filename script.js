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

  // ========== 悬浮球拖拽 ==========
  var ball = $('#floatingBall');
  var ballMenuEl = $('#ballMenu');
  var isDragging = false, hasMoved = false;
  var startX, startY, origX, origY;

  ball.addEventListener('touchstart', function(e) {
    var t = e.touches[0];
    var rect = ball.getBoundingClientRect();
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
    var nx = origX + dx;
    var ny = origY + dy;
    var bw = 52;
    nx = Math.max(0, Math.min(window.innerWidth - bw, nx));
    ny = Math.max(0, Math.min(window.innerHeight - bw, ny));
    ball.style.left = nx + 'px';
    ball.style.top = ny + 'px';
    ball.style.right = 'auto';
    ball.style.bottom = 'auto';
  }, { passive: true });

  document.addEventListener('touchend', function() {
    if (isDragging && !hasMoved) toggleMenu();
    isDragging = false;
    if (hasMoved) {
      var rect = ball.getBoundingClientRect();
      var mid = window.innerWidth / 2;
      if (rect.left + 26 < mid) {
        ball.style.left = '12px';
        ball.style.right = 'auto';
      } else {
        ball.style.left = 'auto';
        ball.style.right = '12px';
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

  // ========== 面板管理 ==========
  var overlay = $('#overlay');
  var currentPanel = null;

  function openPanel(id) {
    closeMenu();
    currentPanel = $('#' + id);
    overlay.classList.remove('hidden');
    currentPanel.classList.remove('hidden');
    requestAnimationFrame(function() {
      overlay.classList.add('show');
      currentPanel.classList.add('show');
    });
  }

  function closePanel() {
    if (!currentPanel) return;
    overlay.classList.remove('show');
    currentPanel.classList.remove('show');
    var p = currentPanel;
    setTimeout(function() {
      overlay.classList.add('hidden');
      p.classList.add('hidden');
    }, 350);
    currentPanel = null;
  }

  $$('.ball-menu-item').forEach(function(item) {
    item.addEventListener('click', function() { openPanel(item.dataset.panel); });
  });

  $$('.panel-close').forEach(function(btn) {
    btn.addEventListener('click', function() { closePanel(); });
  });

  overlay.addEventListener('click', closePanel);

  // ========== API 配置 ==========
  var apiConfigs = LS.get('apiConfigs') || [];
  var activeApi = LS.get('activeApi') || null;

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

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
      activeApi = null;
      LS.remove('activeApi');
      updateAiStatus();
    }
    renderSavedApis();
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
    $('#apiName').value = '';
    $('#apiUrl').value = '';
    $('#apiKey').value = '';
    $('#apiModel').value = '';
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
    fetch(base + '/models', {
      headers: { 'Authorization': 'Bearer ' + key }
    })
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
    .catch(function(err) {
      showToast('获取失败: ' + err.message);
    });
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
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

  // ========== AI 助手 ==========
  var chatMessages = $('#chatMessages');
  var chatInput = $('#chatInput');
  var chatHistory = [];

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

  var SYSTEM_PROMPT = '你是一个网页设计助手。用户会让你修改当前网页的布局和样式。\n\n' +
    '当你需要修改网页样式时，请在回复中包含CSS代码块，格式如下：\n```css\n/* 你的CSS样式 */\n```\n\n' +
    '当你需要修改网页HTML内容时，请在回复中包含特殊格式：\n```html-inject\n<!-- 替换 #mainContent 的 innerHTML -->\n```\n\n' +
    '你的CSS会被直接注入页面。请注意：\n' +
    '- 背景色使用 var(--bg-primary) 即 #252629\n' +
    '- 强调色使用 var(--accent) 即 #57658a\n' +
    '- 文字色使用 var(--text-primary) 即 #e8e9ed\n' +
    '- 只修改 .main-content 内部的样式\n' +
    '- 可以修改的CSS变量: --bg-primary, --bg-secondary, --bg-card, --accent, --accent-light 等\n' +
    '- 使用简洁优雅的设计风格\n' +
    '- 回复要简洁友好';

  function sendMessage() {
    if (!activeApi) { showToast('请先配置并选择 API'); return; }
    var text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    addChatMsg('user', text);
    chatHistory.push({ role: 'user', content: text });

    var loadingDiv = addChatMsg('assistant', '思考中');
    loadingDiv.classList.add('loading-dots');

    var messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    var start = Math.max(0, chatHistory.length - 20);
    for (var i = start; i < chatHistory.length; i++) {
      messages.push(chatHistory[i]);
    }

    var base = activeApi.url.replace(/\/+$/, '');
    fetch(base + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + activeApi.key
      },
      body: JSON.stringify({
        model: activeApi.model,
        messages: messages,
        max_tokens: 2048
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '(无回复)';
      chatHistory.push({ role: 'assistant', content: reply });
      loadingDiv.remove();
      addChatMsg('assistant', reply);

      // 提取并应用 CSS
      var cssReg = /```css\n?([\s\S]*?)```/g;
      var cssMatch;
      while ((cssMatch = cssReg.exec(reply)) !== null) {
        applyAiCSS(cssMatch[1]);
      }

      // 提取并应用 HTML
      var htmlReg = /```html-inject\n?([\s\S]*?)```/g;
      var htmlMatch;
      while ((htmlMatch = htmlReg.exec(reply)) !== null) {
        $('#mainContent').innerHTML = htmlMatch[1];
      }
    })
    .catch(function(err) {
      loadingDiv.remove();
      addChatMsg('system', '请求失败: ' + err.message);
    });
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

  // 恢复 AI 自定义 CSS
  var savedCSS = LS.get('aiCustomCSS');
  if (savedCSS) {
    var s = document.createElement('style');
    s.id = 'ai-custom-style';
    s.textContent = savedCSS;
    document.head.appendChild(s);
  }

  $('#sendBtn').addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // ========== 字体设置 ==========
  var builtinFonts = [
    { name: '系统默认', family: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', preview: '系统默认字体 ABCabc 123' },
    { name: '霞鹜文楷', family: '"LXGW WenKai", serif', preview: '霞鹜文楷 落霞与孤鹜齐飞' },
    { name: '思源宋体', family: '"Noto Serif SC", serif', preview: '思源宋体 秋水共长天一色' },
    { name: '思源黑体', family: '"Noto Sans SC", sans-serif', preview: '思源黑体 千里之行始于足下' },
    { name: '站酷小薇', family: '"ZCOOL XiaoWei", serif', preview: '站酷小薇 山高月小水落石出' },
    { name: '马善政楷体', family: '"Ma Shan Zheng", cursive', preview: '马善政楷 清风明月本无价' }
  ];

  var currentFont = LS.get('currentFont') || builtinFonts[0].family;
  var customFonts = LS.get('customFonts') || [];

  function applyFont(family) {
    currentFont = family;
    document.body.style.fontFamily = family;
    LS.set('currentFont', family);
  }

  function renderFontList() {
    var container = $('#fontList');
    container.innerHTML = builtinFonts.map(function(f) {
      return '<div class="font-item' + (currentFont === f.family ? ' active' : '') + '" data-family="' + esc(f.family) + '">' +
        '<div>' +
          '<div class="font-item-preview" style="font-family:' + f.family + '">' + f.preview + '</div>' +
          '<div class="font-item-name">' + f.name + '</div>' +
        '</div>' +
        '<div class="font-item-check"></div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.font-item').forEach(function(item) {
      item.addEventListener('click', function() {
        applyFont(item.dataset.family);
        renderFontList();
        renderCustomFonts();
        showToast('字体已切换');
      });
    });
  }

  function renderCustomFonts() {
    var container = $('#customFonts');
    if (customFonts.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = customFonts.map(function(f) {
      return '<div class="font-item' + (currentFont === f.family ? ' active' : '') + '" data-family="' + esc(f.family) + '">' +
        '<div>' +
          '<div class="font-item-preview" style="font-family:' + f.family + '">' + f.name + ' 永远相信美好的事</div>' +
          '<div class="font-item-name">' + f.name + ' (自定义)</div>' +
        '</div>' +
        '<div class="font-item-check"></div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.font-item').forEach(function(item) {
      item.addEventListener('click', function() {
        applyFont(item.dataset.family);
        renderFontList();
        renderCustomFonts();
        showToast('字体已切换');
      });
    });
  }

  var fontUploadArea = $('#fontUploadArea');
  var fontFileInput = $('#fontFileInput');
  fontUploadArea.addEventListener('click', function() { fontFileInput.click(); });

  fontFileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
    var reader = new FileReader();
    reader.onload = function(ev) {
      var fontData = ev.target.result;
      var familyName = 'Custom-' + fontName;
      var fontFace = new FontFace(familyName, fontData);
      fontFace.load().then(function(loaded) {
        document.fonts.add(loaded);
        var fontInfo = { name: fontName, family: '"' + familyName + '"', dataUrl: arrayBufferToBase64(fontData) };
        customFonts.push(fontInfo);
        LS.set('customFonts', customFonts);
        applyFont(fontInfo.family);
        renderFontList();
        renderCustomFonts();
        showToast('字体 "' + fontName + '" 已加载');
      }).catch(function(err) {
        showToast('字体加载失败: ' + err.message);
      });
    };
    reader.readAsArrayBuffer(file);
    fontFileInput.value = '';
  });

  function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  function restoreCustomFonts() {
    customFonts.forEach(function(f) {
      if (f.dataUrl) {
        try {
          var buffer = base64ToArrayBuffer(f.dataUrl);
          var familyName = f.family.replace(/"/g, '');
          var fontFace = new FontFace(familyName, buffer);
          fontFace.load().then(function(loaded) { document.fonts.add(loaded); });
        } catch(e) { console.warn('恢复字体失败', e); }
      }
    });
  }

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
    try { LS.set('bgData', bgData); } catch(e) { console.warn('背景图太大，无法保存'); }
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
    if (blur > 0) {
      layer.style.inset = '-' + (blur * 2) + 'px';
    } else {
      layer.style.inset = '0';
    }
    layer.style.setProperty('--bg-overlay-alpha', (parseInt(data.dark) || 30) / 100);
  }

  // ========== 初始化 ==========
  function init() {
    renderSavedApis();
    updateAiStatus();
    renderFontList();
    restoreCustomFonts();
    renderCustomFonts();
    applyFont(currentFont);
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
  }

  init();
})();