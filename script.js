/* ============================================================
   script.js — 墨墨 AI
   ============================================================ */

(() => {
  "use strict";

  // ==================== 工具 ====================
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
    remove(k) { localStorage.removeItem(k); }
  };

  // ==================== 状态 ====================
  let state = {
    apis: LS.get("apis") || [],          // [{id,name,url,key,model}]
    activeApiId: LS.get("activeApiId") || null,
    font: LS.get("font") || "system",
    customFonts: LS.get("customFonts") || [],  // [{name, dataUrl}]
    bgImage: LS.get("bgImage") || null,
    bgBlur: LS.get("bgBlur") ?? 0,
    bgOpacity: LS.get("bgOpacity") ?? 100,
    aiThemeCSS: LS.get("aiThemeCSS") || "",
    messages: [],
    editingApiId: null,
    isGenerating: false,
  };

  function saveState() {
    LS.set("apis", state.apis);
    LS.set("activeApiId", state.activeApiId);
    LS.set("font", state.font);
    LS.set("customFonts", state.customFonts);
    LS.set("bgImage", state.bgImage);
    LS.set("bgBlur", state.bgBlur);
    LS.set("bgOpacity", state.bgOpacity);
    LS.set("aiThemeCSS", state.aiThemeCSS);
  }

  // ==================== 预设字体 ====================
  const PRESET_FONTS = [
    { id: "system",     name: "系统默认",     family: '-apple-system, "Helvetica Neue", sans-serif', preview: "系统默认字体 ABC 123" },
    { id: "noto-sans",  name: "思源黑体",     family: '"Noto Sans SC", sans-serif', preview: "思源黑体 ABC 123" },
    { id: "noto-serif", name: "思源宋体",     family: '"Noto Serif SC", serif', preview: "思源宋体 ABC 123" },
    { id: "lxgw",       name: "霞鹜文楷",     family: '"LXGW WenKai", cursive', preview: "霞鹜文楷 ABC 123" },
  ];

  // ==================== DOM ====================
  const dom = {
    app:            $("#app"),
    bgLayer:        $("#bgLayer"),
    header:         $("#header"),
    statusDot:      $("#statusDot"),
    statusText:     $("#statusText"),
    chatArea:       $("#chatArea"),
    welcome:        $("#welcome"),
    msgInput:       $("#msgInput"),
    sendBtn:        $("#sendBtn"),
    floatingBall:   $("#floatingBall"),
    ballMenu:       $("#ballMenu"),
    menuCloseBtn:   $("#menuCloseBtn"),
    // API
    apiPanel:       $("#apiPanel"),
    apiList:        $("#apiList"),
    addApiBtn:      $("#addApiBtn"),
    apiForm:        $("#apiForm"),
    apiName:        $("#apiName"),
    apiUrl:         $("#apiUrl"),
    apiKey:         $("#apiKey"),
    modelSelect:    $("#modelSelect"),
    fetchModelsBtn: $("#fetchModelsBtn"),
    saveApiBtn:     $("#saveApiBtn"),
    cancelApiBtn:   $("#cancelApiBtn"),
    // Font
    fontPanel:      $("#fontPanel"),
    fontList:       $("#fontList"),
    fontFileInput:  $("#fontFileInput"),
    customFontList: $("#customFontList"),
    // BG
    bgPanel:        $("#bgPanel"),
    bgPreview:      $("#bgPreview"),
    bgFileInput:    $("#bgFileInput"),
    bgBlur:         $("#bgBlur"),
    bgOpacity:      $("#bgOpacity"),
    clearBgBtn:     $("#clearBgBtn"),
    // Theme
    themePanel:     $("#themePanel"),
    themePrompt:    $("#themePrompt"),
    genThemeBtn:    $("#genThemeBtn"),
    themeStatus:    $("#themeStatus"),
    resetThemeBtn:  $("#resetThemeBtn"),
    aiThemeStyle:   $("#aiThemeStyle"),
  };

  // ==================== 悬浮球拖拽 ====================
  (() => {
    const ball = dom.floatingBall;
    let sx, sy, bx, by, moved;

    ball.addEventListener("touchstart", e => {
      const t = e.touches[0];
      sx = t.clientX; sy = t.clientY;
      bx = ball.offsetLeft; by = ball.offsetTop;
      moved = false;
      ball.style.transition = "none";
    }, { passive: true });

    ball.addEventListener("touchmove", e => {
      const t = e.touches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      let nx = bx + dx;
      let ny = by + dy;
      const maxX = window.innerWidth - ball.offsetWidth;
      const maxY = window.innerHeight - ball.offsetHeight;
      nx = Math.max(0, Math.min(nx, maxX));
      ny = Math.max(0, Math.min(ny, maxY));
      ball.style.left = nx + "px";
      ball.style.top = ny + "px";
      ball.style.right = "auto";
      ball.style.bottom = "auto";
    }, { passive: true });

    ball.addEventListener("touchend", () => {
      ball.style.transition = "left .3s ease, right .3s ease";
      // 吸附边缘
      const cx = ball.offsetLeft + ball.offsetWidth / 2;
      if (cx < window.innerWidth / 2) {
        ball.style.left = "10px";
      } else {
        ball.style.left = (window.innerWidth - ball.offsetWidth - 10) + "px";
      }
      if (!moved) toggleMenu();
    });

    // 鼠标（桌面备用）
    ball.addEventListener("click", e => {
      if (!("ontouchstart" in window)) toggleMenu();
    });
  })();

  // ==================== 菜单 ====================
  function toggleMenu() {
    dom.ballMenu.classList.toggle("hidden");
  }

  dom.menuCloseBtn.addEventListener("click", () => dom.ballMenu.classList.add("hidden"));
  $(".menu-mask", dom.ballMenu).addEventListener("click", () => dom.ballMenu.classList.add("hidden"));

  $$(".menu-item", dom.ballMenu).forEach(btn => {
    btn.addEventListener("click", () => {
      const panelId = btn.dataset.panel;
      dom.ballMenu.classList.add("hidden");
      openPanel(panelId);
    });
  });

  // ==================== 面板通用 ====================
  function openPanel(id) {
    const panel = $("#" + id);
    if (!panel) return;
    panel.classList.remove("hidden");
  }
  function closePanel(id) {
    const panel = $("#" + id);
    if (!panel) return;
    panel.classList.add("hidden");
  }

  // 面板关闭按钮
  $$(".panel-close-btn").forEach(btn => {
    btn.addEventListener("click", () => closePanel(btn.dataset.close));
  });
  // 点击遮罩关闭
  $$(".panel-mask").forEach(mask => {
    mask.addEventListener("click", () => {
      mask.closest(".panel").classList.add("hidden");
    });
  });

  // ==================== API 配置 ====================
  function getActiveApi() {
    return state.apis.find(a => a.id === state.activeApiId) || null;
  }

  function renderApiList() {
    const c = dom.apiList;
    c.innerHTML = "";
    if (state.apis.length === 0) {
      c.innerHTML = '<p class="hint-text" style="text-align:center;padding:12px 0">暂无配置</p>';
      return;
    }
    state.apis.forEach(api => {
      const card = document.createElement("div");
      card.className = "api-card" + (api.id === state.activeApiId ? " active" : "");
      card.innerHTML = `
        <div class="api-card-info">
          <div class="api-card-name">${esc(api.name)}</div>
          <div class="api-card-model">${esc(api.model || "未选择模型")}</div>
        </div>
        <div class="api-card-actions">
          <button data-act="use" title="使用">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${api.id === state.activeApiId ? '#52c41a' : '#999'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button data-act="edit" title="编辑">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button data-act="del" title="删除">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#e57373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      `;
      // 事件
      $('[data-act="use"]', card).addEventListener("click", () => {
        state.activeApiId = api.id;
        saveState();
        renderApiList();
        updateStatus();
      });
      $('[data-act="edit"]', card).addEventListener("click", () => editApi(api.id));
      $('[data-act="del"]', card).addEventListener("click", () => {
        if (confirm("确定删除「" + api.name + "」？")) {
          state.apis = state.apis.filter(a => a.id !== api.id);
          if (state.activeApiId === api.id) state.activeApiId = null;
          saveState();
          renderApiList();
          updateStatus();
        }
      });
      c.appendChild(card);
    });
  }

  function editApi(id) {
    state.editingApiId = id;
    const api = state.apis.find(a => a.id === id);
    if (api) {
      dom.apiName.value = api.name;
      dom.apiUrl.value = api.url;
      dom.apiKey.value = api.key;
      dom.modelSelect.innerHTML = api.model
        ? `<option value="${esc(api.model)}" selected>${esc(api.model)}</option>`
        : '<option value="">请拉取模型列表</option>';
    }
    dom.apiForm.classList.remove("hidden");
  }

  dom.addApiBtn.addEventListener("click", () => {
    state.editingApiId = null;
    dom.apiName.value = "";
    dom.apiUrl.value = "";
    dom.apiKey.value = "";
    dom.modelSelect.innerHTML = '<option value="">请先拉取模型列表</option>';
    dom.apiForm.classList.remove("hidden");
  });

  dom.cancelApiBtn.addEventListener("click", () => {
    dom.apiForm.classList.add("hidden");
  });

  dom.fetchModelsBtn.addEventListener("click", async () => {
    const url = dom.apiUrl.value.trim().replace(/\/+$/, "");
    const key = dom.apiKey.value.trim();
    if (!url || !key) return alert("请先填写 API 地址和 Key");
    dom.fetchModelsBtn.textContent = "拉取中...";
    try {
      const res = await fetch(url + "/models", {
        headers: { "Authorization": "Bearer " + key }
      });
      const data = await res.json();
      const models = (data.data || []).map(m => m.id).sort();
      dom.modelSelect.innerHTML = models.length
        ? models.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join("")
        : '<option value="">未找到模型</option>';
    } catch (e) {
      alert("拉取失败：" + e.message);
    }
    dom.fetchModelsBtn.textContent = "拉取";
  });

  dom.saveApiBtn.addEventListener("click", () => {
    const name = dom.apiName.value.trim() || "未命名";
    const url = dom.apiUrl.value.trim().replace(/\/+$/, "");
    const key = dom.apiKey.value.trim();
    const model = dom.modelSelect.value;
    if (!url || !key) return alert("请填写 API 地址和 Key");

    if (state.editingApiId) {
      const api = state.apis.find(a => a.id === state.editingApiId);
      if (api) { Object.assign(api, { name, url, key, model }); }
    } else {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      state.apis.push({ id, name, url, key, model });
      if (!state.activeApiId) state.activeApiId = id;
    }
    saveState();
    dom.apiForm.classList.add("hidden");
    renderApiList();
    updateStatus();
  });

  function updateStatus() {
    const api = getActiveApi();
    if (api) {
      dom.statusDot.classList.add("online");
      dom.statusText.textContent = api.model || api.name;
    } else {
      dom.statusDot.classList.remove("online");
      dom.statusText.textContent = "未连接";
    }
  }

  // ==================== 字体 ====================
  function renderFontList() {
    dom.fontList.innerHTML = "";
    PRESET_FONTS.forEach(f => {
      const item = document.createElement("div");
      item.className = "font-item" + (state.font === f.id ? " active" : "");
      item.innerHTML = `
        <div>
          <div class="font-item-name">${f.name}</div>
          <div class="font-item-preview" style="font-family:${f.family}">${f.preview}</div>
        </div>
        <div class="font-check">
          ${state.font === f.id ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </div>
      `;
      item.addEventListener("click", () => {
        state.font = f.id;
        applyFont(f.family);
        saveState();
        renderFontList();
        renderCustomFontList();
      });
      dom.fontList.appendChild(item);
    });
  }

  function renderCustomFontList() {
    dom.customFontList.innerHTML = "";
    state.customFonts.forEach((f, idx) => {
      const id = "custom-" + idx;
      const item = document.createElement("div");
      item.className = "font-item" + (state.font === id ? " active" : "");
      item.innerHTML = `
        <div>
          <div class="font-item-name">${esc(f.name)}</div>
          <div class="font-item-preview" style="font-family:'CustomFont-${idx}'">自定义字体预览</div>
        </div>
        <div class="font-check">
          ${state.font === id ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </div>
      `;
      item.addEventListener("click", () => {
        state.font = id;
        applyFont(`'CustomFont-${idx}', sans-serif`);
        saveState();
        renderFontList();
        renderCustomFontList();
      });
      dom.customFontList.appendChild(item);
    });
  }

  function applyFont(family) {
    document.body.style.fontFamily = family;
  }

  // 加载已保存的自定义字体
  function loadCustomFonts() {
    state.customFonts.forEach((f, idx) => {
      const face = new FontFace(`CustomFont-${idx}`, `url(${f.dataUrl})`);
      face.load().then(loaded => document.fonts.add(loaded)).catch(() => {});
    });
  }

  dom.fontFileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      const name = file.name.replace(/\.(ttf|otf|woff2?)/i, "");
      const idx = state.customFonts.length;
      state.customFonts.push({ name, dataUrl });
      saveState();
      const face = new FontFace(`CustomFont-${idx}`, `url(${dataUrl})`);
      face.load().then(loaded => {
        document.fonts.add(loaded);
        renderCustomFontList();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  });

  // 初始化字体
  function initFont() {
    loadCustomFonts();
    if (state.font === "system") return;
    const preset = PRESET_FONTS.find(f => f.id === state.font);
    if (preset) { applyFont(preset.family); return; }
    // 自定义
    const m = state.font.match(/^custom-(\d+)$/);
    if (m) applyFont(`'CustomFont-${m[1]}', sans-serif`);
  }

  // ==================== 背景图 ====================
  function applyBg() {
    if (state.bgImage) {
      dom.bgLayer.style.backgroundImage = `url(${state.bgImage})`;
      dom.bgLayer.style.filter = `blur(${state.bgBlur}px)`;
      dom.bgLayer.style.opacity = state.bgOpacity / 100;
      dom.bgPreview.innerHTML = `<img src="${state.bgImage}" alt="背景预览">`;
    } else {
      dom.bgLayer.style.backgroundImage = "";
      dom.bgLayer.style.filter = "";
      dom.bgLayer.style.opacity = "";
      dom.bgPreview.innerHTML = '<span class="bg-placeholder">暂无背景图</span>';
    }
  }

  dom.bgFileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      state.bgImage = ev.target.result;
      saveState();
      applyBg();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  });

  dom.bgBlur.addEventListener("input", () => {
    state.bgBlur = parseInt(dom.bgBlur.value);
    saveState();
    applyBg();
  });
  dom.bgOpacity.addEventListener("input", () => {
    state.bgOpacity = parseInt(dom.bgOpacity.value);
    saveState();
    applyBg();
  });

  dom.clearBgBtn.addEventListener("click", () => {
    state.bgImage = null;
    state.bgBlur = 0;
    state.bgOpacity = 100;
    dom.bgBlur.value = 0;
    dom.bgOpacity.value = 100;
    saveState();
    applyBg();
  });

  // ==================== AI 美化 ====================
  dom.genThemeBtn.addEventListener("click", async () => {
    const api = getActiveApi();
    if (!api) return alert("请先配置并激活一个 API");
    const prompt = dom.themePrompt.value.trim();
    if (!prompt) return;

    dom.themeStatus.textContent = "正在生成主题...";
    dom.genThemeBtn.disabled = true;

    try {
      const sysMsg = `你是一个网页设计师。用户会描述想要的网页风格，你只需要返回纯CSS代码，不要加任何解释文字，不要加markdown代码块标记。
可用的CSS选择器：
:root（修改 --primary, --bg, --bg2, --text, --text2, --border 等变量）
body, #header, #chatArea, .msg-bubble, .msg-row.user .msg-bubble, .msg-row.ai .msg-bubble, #inputArea, #msgInput, #sendBtn, .welcome-circle, #floatingBall
请确保返回的是合法CSS，用户手机浏览器使用。`;

      const res = await fetch(api.url + "/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + api.key,
        },
        body: JSON.stringify({
          model: api.model,
          messages: [
            { role: "system", content: sysMsg },
            { role: "user", content: prompt },
          ],
          stream: false,
        }),
      });
      const data = await res.json();
      let css = data.choices?.[0]?.message?.content || "";

      // 清除可能的 markdown 标记
      css = css.replace(/```css\s*/gi, "").replace(/```\s*/g, "").trim();

      state.aiThemeCSS = css;
      dom.aiThemeStyle.textContent = css;
      saveState();
      dom.themeStatus.textContent = "主题已应用";
    } catch (e) {
      dom.themeStatus.textContent = "生成失败：" + e.message;
    }
    dom.genThemeBtn.disabled = false;
  });

  dom.resetThemeBtn.addEventListener("click", () => {
    state.aiThemeCSS = "";
    dom.aiThemeStyle.textContent = "";
    saveState();
    dom.themeStatus.textContent = "已恢复默认主题";
  });

  // ==================== 聊天 ====================
  function addMsg(role, content) {
    if (dom.welcome) dom.welcome.style.display = "none";
    const row = document.createElement("div");
    row.className = "msg-row " + role;
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.innerHTML = renderMd(content);
    row.appendChild(bubble);
    dom.chatArea.appendChild(row);
    scrollBottom();
    return bubble;
  }

  function showTyping() {
    if (dom.welcome) dom.welcome.style.display = "none";
    const row = document.createElement("div");
    row.className = "msg-row ai";
    row.id = "typingRow";
    row.innerHTML = '<div class="msg-bubble typing-dots"><span></span><span></span><span></span></div>';
    dom.chatArea.appendChild(row);
    scrollBottom();
  }
  function removeTyping() {
    const el = $("#typingRow");
    if (el) el.remove();
  }

  function scrollBottom() {
    requestAnimationFrame(() => {
      dom.chatArea.scrollTop = dom.chatArea.scrollHeight;
    });
  }

  // 简易 Markdown
  function renderMd(text) {
    let s = esc(text);
    // 代码块
    s = s.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code>${code}</code></pre>`;
    });
    // 行内代码
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    // 粗体
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // 斜体
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // 换行
    s = s.replace(/\n/g, '<br>');
    return s;
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // 发送消息
  async function send() {
    const text = dom.msgInput.value.trim();
    if (!text || state.isGenerating) return;
    const api = getActiveApi();
    if (!api) return alert("请先在悬浮球中配置 API");

    state.messages.push({ role: "user", content: text });
    addMsg("user", text);
    dom.msgInput.value = "";
    autoResize();

    state.isGenerating = true;
    showTyping();

    try {
      const res = await fetch(api.url + "/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + api.key,
        },
        body: JSON.stringify({
          model: api.model,
          messages: state.messages,
          stream: true,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }

      removeTyping();
      const bubble = addMsg("ai", "");
      let full = "";

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              full += delta;
              bubble.innerHTML = renderMd(full);
              scrollBottom();
            }
          } catch {}
        }
      }

      state.messages.push({ role: "assistant", content: full });

    } catch (e) {
      removeTyping();
      addMsg("ai", "请求出错：" + e.message);
    }

    state.isGenerating = false;
  }

  dom.sendBtn.addEventListener("click", send);
  dom.msgInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send();
    }
  });

  // 输入框自适应高度
  function autoResize() {
    const el = dom.msgInput;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }
  dom.msgInput.addEventListener("input", autoResize);

  // ==================== 初始化 ====================
  function init() {
    renderApiList();
    renderFontList();
    renderCustomFontList();
    updateStatus();
    initFont();
    applyBg();
    dom.bgBlur.value = state.bgBlur;
    dom.bgOpacity.value = state.bgOpacity;
    // 恢复 AI 主题
    if (state.aiThemeCSS) {
      dom.aiThemeStyle.textContent = state.aiThemeCSS;
    }
  }

  init();

})();
