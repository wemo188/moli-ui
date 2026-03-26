(function() {
  'use strict';

  // ========== 工具函数 ==========
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
    remove(k) { localStorage.removeItem(k); }
  };

  function showToast(msg, duration = 2000) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.classList.add('hidden'), 300);
    }, duration);
  }

  // ========== 悬浮球拖拽与菜单 ==========
  const ball = $('#floatingBall');
  const menu = $('#ballMenu');
  let isDragging = false, hasMoved = false;
  let startX, startY, origX, origY;

  function getBallRect() { return ball.getBoundingClientRect(); }

  ball.addEventListener('touchstart', e => {
    const t = e.touches[0];
    const rect = getBallRect();
    startX = t.clientX; startY = t.clientY;
    origX = rect.left; origY = rect.top;
    isDragging = true; hasMoved = false;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const t = e.touches[0];
    const dx = t.clientX - startX, dy = t.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
    if (!hasMoved) return;
    let nx = origX + dx, ny = origY + dy;
    const bw = 52;
    nx = Math.max(0, Math.min(window.innerWidth - bw, nx));
    ny = Math.max(0, Math.min(window.innerHeight - bw, ny));
    ball.style.left = nx + 'px';
    ball.style.top = ny + 'px';
    ball.style.right = 'auto';
    ball.style.bottom = 'auto';
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (isDragging && !hasMoved) toggleMenu();
    isDragging = false;
    // 吸附到边缘
    if (hasMoved) {
      const rect = getBallRect();
      const mid = window.innerWidth / 2;
      if (rect.left + 26 < mid) {
        ball.style.left = '12px'; ball.style.right = 'auto';
      } else {
        ball.style.left = 'auto'; ball.style.right = '12px';
      }
    }
  });

  // 鼠标支持（调试用）
  ball.addEventListener('click', e => {
    if (!('ontouchstart' in window)) toggleMenu();
  });

  let menuOpen = false;
  function toggleMenu() {
    menuOpen = !menuOpen;
    ball.classList.toggle('active', menuOpen);
    if (menuOpen) {
      positionMenu();
      menu.classList.remove('hidden');
      requestAnimationFrame(() => menu.classList.add('show'));
    } else {
      menu.classList.remove('show');
      setTimeout(() => menu.classList.add('hidden'), 250);
    }
  }

  function positionMenu() {
    const rect = getBallRect();
    menu.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    if (rect.left + 26 < window.innerWidth / 2) {
      menu.style.left = rect.left + 'px'; menu.style.right = 'auto';
    } else {
      menu.style.right = (window.innerWidth - rect.right) + 'px'; menu.style.left = 'auto';
    }
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    ball.classList.remove('active');
    menu.classList.remove('show');
    setTimeout(() => menu.classList.add('hidden'), 250);
  }

  // ========== 面板管理 ==========
  const overlay = $('#overlay');
  let currentPanel = null;

  function openPanel(id) {
    closeMenu();
    currentPanel = $('#' + id);
    overlay.classList.remove('hidden');
    currentPanel.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay.classList.add('show');
      currentPanel.classList.add('show');
    });
  }

  function closePanel() {
    if (!currentPanel) return;
    overlay.classList.remove('show');
    currentPanel.classList.remove('show');
    const p = currentPanel;
    setTimeout(() => {
      overlay.classList.add('hidden');
      p.classList.add('hidden');
    }, 350);
    currentPanel = null;
  }

  $$('.ball-menu-item').forEach(item => {
    item.addEventListener('click', () => openPanel(item.dataset.panel));
  });
  $$('.panel-close').forEach(btn => {
    btn.addEventListener('click', () => closePanel());
  });
  overlay.addEventListener('click', closePanel);

  // ========== API 配置 ==========
  const apiConfigs = LS.get('apiConfigs') || [];
  let activeApi = LS.get('activeApi') || null;

  function renderSavedApis() {
    const container = $('#savedApis');
    if (apiConfigs.length === 0) {
      container.innerHTML = '<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:16px;">暂无保存的配置</p>';
      return;
    }
    container.innerHTML = apiConfigs.map((c, i) => `
      <div class="saved-item${activeApi && activeApi.name === c.name ? ' active-config' : ''}">
        <div class="saved-item-info">
          <div class="saved-item-name">${esc(c.name)}</div>
          <div class="saved-item-url">${esc(c.url)} · ${esc(c.model)}</div>
        </div>
        <div class="saved-item-actions">
          <button class="use-btn" onclick="window._useApi(${i})" title="使用">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button class="del-btn" onclick="window._delApi(${i})" title="删除">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  window._useApi = function(i) {
    activeApi = apiConfigs[i];
    LS.set('activeApi', activeApi);
    renderSavedApis();
    updateAiStatus();
    showToast('已切换至: ' + activeApi.name);
  };

  window._delApi = function(i) {
    const removed = apiConfigs.splice(i, 1)[0];
    LS.set('apiConfigs', apiConfigs);
    if (activeApi && activeApi.name === removed.name) {
      activeApi = null; LS.remove('activeApi');
      updateAiStatus();
    }
    renderSavedApis();
    showToast('已删除');
  };

  $('#saveApiBtn').addEventListener('click', () => {
    const name = $('#apiName').value.trim();
    const url = $('#apiUrl').value.trim();
    const key = $('#apiKey').value.trim();
    const model = $('#apiModel').value.trim();
    if (!name || !url || !key || !model) {
      showToast('请填写所有字段'); return;
    }
    const existing = apiConfigs.findIndex(c => c.name === name);
    const config = { name, url, key, model };
    if (existing >= 0) apiConfigs[existing] = config;
    else apiConfigs.push(config);
    LS.set('apiConfigs', apiConfigs);
    renderSavedApis();
    showToast('配置已保存');
    // 清空表单
    $('#apiName').value = ''; $('#apiUrl').value = '';
    $('#apiKey').value = ''; $('#apiModel').value = '';
  });

  // 显示/隐藏 Key
  $('#toggleKeyVisible').addEventListener('click', () => {
    const inp = $('#apiKey');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  // 抓取模型列表
  $('#fetchModelsBtn').addEventListener('click', async () => {
    const url = $('#apiUrl').value.trim();
    const key = $('#apiKey').value.trim();
    if (!url || !key) { showToast('请先填写 API 地址和 Key'); return; }
    showToast('正在获取模型列表...');
    try {
      const base = url.replace(/\/+$/, '');
      const res = await fetch(base + '/models', {
        headers: { 'Authorization': 'Bearer ' + key }
      });
      const data = await res.json();
      const models = (data.data || data).map(m => m.id || m.name || m).filter(Boolean);
      if (models.length === 0) { showToast('未找到模型'); return; }
      const list = $('#modelList');
      list.innerHTML = models.map(m => `<div class="model-item">${esc(m)}</div>`).join('');
      list.classList.remove('hidden');
      list.querySelectorAll('.model-item').forEach(item => {
        item.addEventListener('click', () => {
          $('#apiModel').value = item.textContent;
          list.classList.add('hidden');
        });
      });
    } catch (err) {
      showToast('获取失败: ' + err.message);
    }
  });

  // 测试连接
  $('#testApiBtn').addEventListener('click', async () => {
    const url = $('#apiUrl').value.trim();
    const key = $('#apiKey').value.trim();
    const model = $('#apiModel').value.trim();
    if (!url || !key || !model) { showToast('请填写完整信息'); return; }
    showToast('正在测试连接...');
    try {
      const base = url.replace(/\/+$/, '');
      const res = await fetch(base + '/chat/completions', {
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
      });
      if (res.ok) showToast('连接成功');
      else showToast('连接失败: ' + res.status);
    } catch (err) {
      showToast('连接失败: ' + err.message);
    }
  });

  // ========== AI 助手 ==========
  const chatMessages = $('#chatMessages');
  const chatInput = $('#chatInput');
  let chatHistory = [];

  function updateAiStatus() {
    const status = $('#aiStatus');
    if (activeApi) {
      status.innerHTML = `<div class="status-dot online"></div><span>已连接: ${esc(activeApi.name)} (${esc(activeApi.model)})</span>`;
    } else {
      status.innerHTML = '<div class="status-dot offline"></div><span>未连接 — 请先在 API 配置中选择</span>';
    }
  }

  function addChatMsg(role, content) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    // 简单处理代码块
    let html = esc(content);
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/\n/g, '<br>');
    div.innerHTML = html;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  const SYSTEM_PROMPT = `你是一个网页设计助手。用户会让你修改当前网页的布局和样式。

当你需要修改网页样式时，请在回复中包含CSS代码块，格式如下：
\`\`\`css
/* 你的CSS样式 */
\`\`\`

当你需要修改网页HTML内容时，请在回复中包含特殊格式：
\`\`\`html-inject
<!-- 替换 #mainContent 的 innerHTML -->
\`\`\`

你的CSS会被直接注入页面。请注意：
- 背景色使用 var(--bg-primary) 即 #252629
- 强调色使用 var(--accent) 即 #57658a
- 文字色使用 var(--text-primary) 即 #e8e9ed
- 只修改 .main-content 内部的样式
- 可以修改的CSS变量: --bg-primary, --bg-secondary, --bg-card, --accent, --accent-light 等
- 使用简洁优雅的设计风格
- 回复要简洁友好`;

  async function sendMessage() {
    if (!activeApi) { showToast('请先配置并选择 API'); return; }
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    addChatMsg('user', text);
    chatHistory.push({ role: 'user', content: text });

    const loadingDiv = addChatMsg('assistant', '思考中');
    loadingDiv.classList.add('loading-dots');

    try {
      const base = activeApi.url.replace(/\/+$/, '');
      const res = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + activeApi.key
        },
        body: JSON.stringify({
          model: activeApi.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...chatHistory.slice(-20)
          ],
          max_tokens: 2048
        })
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || '(无回复)';
      chatHistory.push({ role: 'assistant', content: reply });

      loadingDiv.remove();
      addChatMsg('assistant', reply);

      // 提取并应用 CSS
      const cssMatches = reply.matchAll(/```css\n?([\s\S]*?)```/g);
      for (const m of cssMatches) {
        applyAiCSS(m[1]);
      }

      // 提取并应用 HTML
      const htmlMatches = reply.matchAll(/```html-inject\n?([\s\S]*?)```/g);
      for (const m of htmlMatches) {
        $('#mainContent').innerHTML = m[1];
      }

    } catch (err) {
      loadingDiv.remove();
      addChatMsg('system', '请求失败: ' + err.message);
    }
  }

  function applyAiCSS(css) {
    let styleEl = document.getElementById('ai-custom-style');
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
  const savedCSS = LS.get('aiCustomCSS');
  if (savedCSS) {
    const s = document.createElement('style');
    s.id = 'ai-custom-style';
    s.textContent = savedCSS;
    document.head.appendChild(s);
  }

  $('#sendBtn').addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // ========== 字体设置 ==========
  const builtinFonts = [
    { name: '系统默认', family: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', preview: '系统默认字体 ABCabc 123' },
    { name: '霞鹜文楷', family: '"LXGW WenKai", serif', preview: '霞鹜文楷 落霞与孤鹜齐飞' },
    { name: '思源宋体', family: '"Noto Serif SC", serif', preview: '思源宋体 秋水共长天一色' },
    { name: '思源黑体', family: '"Noto Sans SC", sans-serif', preview: '思源黑体 千里之行始于足下' },
    { name: '站酷小薇', family: '"ZCOOL XiaoWei", serif', preview: '站酷小薇 山高月小水落石出' },
    { name: '马善政楷体', family: '"Ma Shan Zheng", cursive', preview: '马善政楷 清风明月本无价' },
  ];

  let currentFont = LS.get('currentFont') || builtinFonts[0].family;
  let customFonts = LS.get('customFonts') || [];

  function applyFont(family) {
    currentFont = family;
    document.body.style.fontFamily = family;
    LS.set('currentFont', family);
  }

  function renderFontList() {
    const container = $('#fontList');
    container.innerHTML = builtinFonts.map(f => `
      <div class="font-item${currentFont === f.family ? ' active' : ''}" data-family="${esc(f.family)}">
        <div>
          <div class="font-item-preview" style="font-family:${f.family}">${f.preview}</div>
          <div class="font-item-name">${f.name}</div>
        </div>
        <div class="font-item-check"></div>
      </div>
    `).join('');

    container.querySelectorAll('.font-item').forEach(item => {
      item.addEventListener('click', () => {
        applyFont(item.dataset.family);
        renderFontList();
        renderCustomFonts();
        showToast('字体已切换');
      });
    });
  }

  function renderCustomFonts() {
    const container = $('#customFonts');
    if (customFonts.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = customFonts.map(f => `
      <div class="font-item${currentFont === f.family ? ' active' : ''}" data-family="${esc(f.family)}">
        <div>
          <div class="font-item-preview" style="font-family:${f.family}">${f.name} 永远相信美好的事</div>
          <div class="font-item-name">${f.name} (自定义)</div>
        </div>
        <div class="font-item-check"></div>
      </div>
    `).join('');

    container.querySelectorAll('.font-item').forEach(item => {
      item.addEventListener('click', () => {
        applyFont(item.dataset.family);
        renderFontList();
        renderCustomFonts();
        showToast('字体已切换');
      });
    });
  }

  // 上传字体
  const fontUploadArea = $('#fontUploadArea');
  const fontFileInput = $('#fontFileInput');
  fontUploadArea.addEventListener('click', () => fontFileInput.click());

  fontFileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
    const reader = new FileReader();
    reader.onload = function(ev) {
      const fontData = ev.target.result;
      const familyName = 'Custom-' + fontName;
      // 注册字体
      const fontFace = new FontFace(familyName, fontData);
      fontFace.load().then(loaded => {
        document.fonts.add(loaded);
        const fontInfo = { name: fontName, family: '"' + familyName + '"', dataUrl: arrayBufferToBase64(fontData) };
        customFonts.push(fontInfo);
        LS.set('customFonts', customFonts);
        applyFont(fontInfo.family);
        renderFontList();
        renderCustomFonts();
        showToast('字体 "' + fontName + '" 已加载');
      }).catch(err => {
        showToast('字体加载失败: ' + err.message);
      });
    };
    reader.readAsArrayBuffer(file);
    fontFileInput.value = '';
  });

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  // 恢复自定义字体
  function restoreCustomFonts() {
    customFonts.forEach(f => {
      if (f.dataUrl) {
        try {
          const buffer = base64ToArrayBuffer(f.dataUrl);
          const familyName = f.family.replace(/"/g, '');
          const fontFace = new FontFace(familyName, buffer);
          fontFace.load().then(loaded => document.fonts.add(loaded));
        } catch(e) { console.warn('恢复字体失败', e); }
      }
    });
  }

  // ========== 背景图片 ==========
  let bgData = LS.get('bgData') || null;
  const bgUploadArea = $('#bgUploadArea');
  const bgFileInput = $('#bgFileInput');

  bgUploadArea.addEventListener('click', () => bgFileInput.click());

  bgFileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      $('#bgPreviewImg').src = dataUrl;
      $('#bgPreview').classList.remove('hidden');
      bgData = { url: dataUrl };
    };
    reader.readAsDataURL(file);
    bgFileInput.value = '';
  });

  $('#bgBlur').addEventListener('input', e => {
    $('#bgBlurVal').textContent = e.target.value + 'px';
  });
  $('#bgDark').addEventListener('input', e => {
    $('#bgDarkVal').textContent = e.target.value + '%';
  });

  $('#applyBgBtn').addEventListener('click', () => {
    if (!bgData) { showToast('请先上传图片'); return; }
    const blur = $('#bgBlur').value;
    const dark = $('#bgDark').value;
    bgData.blur = blur;
    bgData.dark = dark;
    applyBg(bgData);
    // 保存(注意大图可能超出localStorage)
    try { LS.set('bgData', bgData); } catch(e) { console.warn('背景图太大，无法保存到本地'); }
    showToast('背景已应用');
  });

  $('#removeBgBtn').addEventListener('click', () => {
    bgData = null;
    LS.remove('bgData');
    const layer = $('#bgLayer');
    layer.style.backgroundImage = 'none';
    layer.style.filter = '';
    layer.style.setProperty('--bg-overlay-alpha', '0');
    $('#bgPreview').classList.add('hidden');
    showToast('背景已移除');
  });

  function applyBg(data) {
    if (!data || !data.url) return;
    const layer = $('#bgLayer');
    layer.style.backgroundImage = `url(${data.url})`;
    layer.style.filter = `blur(${data.blur || 0}px)`;
    // 扩展一下防止blur边缘白边
    if (parseInt(data.blur) > 0) {
      layer.style.inset = `-${data.blur * 2}px`;
    } else {
      layer.style.inset = '0';
    }
    layer.style.setProperty('--bg-overlay-alpha', (data.dark || 30) / 100);
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
      if (bgData.blur) { $('#bgBlur').value = bgData.blur; $('#bgBlurVal').textContent = bgData.blur + 'px'; }
      if (bgData.dark) { $('#bgDark').value = bgData.dark; $('#bgDarkVal').textContent = bgData.dark + '%'; }
    }
  }

  init();
})();