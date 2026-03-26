const floatingBall = document.getElementById("floatingBall");
const controlPanel = document.getElementById("controlPanel");
const closePanelBtn = document.getElementById("closePanelBtn");

const saveConfigBtn = document.getElementById("saveConfigBtn");
const loadConfigBtn = document.getElementById("loadConfigBtn");
const savedConfigs = document.getElementById("savedConfigs");

const configName = document.getElementById("configName");
const apiUrl = document.getElementById("apiUrl");
const apiKey = document.getElementById("apiKey");
const modelName = document.getElementById("modelName");
const systemPrompt = document.getElementById("systemPrompt");

const themeSelector = document.getElementById("themeSelector");
const fontSelector = document.getElementById("fontSelector");
const fontUpload = document.getElementById("fontUpload");
const bgUpload = document.getElementById("bgUpload");
const removeBgBtn = document.getElementById("removeBgBtn");
const resetStyleBtn = document.getElementById("resetStyleBtn");

const applyAIDesignBtn = document.getElementById("applyAIDesignBtn");
const styleCommand = document.getElementById("styleCommand");

const app = document.getElementById("app");
const bgOverlay = document.querySelector(".bg-overlay");

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatPanel = document.getElementById("chatPanel");
const clearChatBtn = document.getElementById("clearChatBtn");

const STORAGE_KEYS = {
  configs: "pure_ai_configs",
  theme: "pure_ai_theme",
  font: "pure_ai_font",
  bg: "pure_ai_bg",
  customFont: "pure_ai_custom_font"
};

floatingBall.addEventListener("click", () => {
  controlPanel.classList.remove("hidden");
});

closePanelBtn.addEventListener("click", () => {
  controlPanel.classList.add("hidden");
});

controlPanel.addEventListener("click", (e) => {
  if (e.target === controlPanel) {
    controlPanel.classList.add("hidden");
  }
});

function getConfigs() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.configs) || "[]");
}

function saveConfigs(configs) {
  localStorage.setItem(STORAGE_KEYS.configs, JSON.stringify(configs));
}

function refreshConfigList() {
  const configs = getConfigs();
  savedConfigs.innerHTML = "";

  if (!configs.length) {
    const option = document.createElement("option");
    option.textContent = "暂无配置";
    option.value = "";
    savedConfigs.appendChild(option);
    return;
  }

  configs.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = item.name || `配置 ${index + 1}`;
    savedConfigs.appendChild(option);
  });
}

saveConfigBtn.addEventListener("click", () => {
  const name = configName.value.trim();
  const url = apiUrl.value.trim();
  const key = apiKey.value.trim();
  const model = modelName.value.trim();
  const prompt = systemPrompt.value.trim();

  if (!name || !url || !key || !model) {
    alert("请先完整填写配置名称、API 地址、Key 和模型名称。");
    return;
  }

  const configs = getConfigs();
  const existingIndex = configs.findIndex(item => item.name === name);

  const newConfig = { name, url, key, model, prompt };

  if (existingIndex > -1) {
    configs[existingIndex] = newConfig;
  } else {
    configs.push(newConfig);
  }

  saveConfigs(configs);
  refreshConfigList();
  alert("配置已保存。");
});

loadConfigBtn.addEventListener("click", () => {
  const configs = getConfigs();
  const selected = configs[savedConfigs.value];

  if (!selected) {
    alert("没有可载入的配置。");
    return;
  }

  configName.value = selected.name || "";
  apiUrl.value = selected.url || "";
  apiKey.value = selected.key || "";
  modelName.value = selected.model || "";
  systemPrompt.value = selected.prompt || "";

  alert("配置已载入。");
});

function applyTheme(theme) {
  app.classList.remove("theme-blueblack", "theme-frost", "theme-deepsea");
  app.classList.add(theme);
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

themeSelector.addEventListener("change", () => {
  applyTheme(themeSelector.value);
});

function applyFont(fontValue) {
  document.body.classList.remove(
    "font-song",
    "font-lxwk",
    "font-mashan",
    "font-zhimang",
    "font-custom"
  );

  if (fontValue === "song") document.body.classList.add("font-song");
  if (fontValue === "lxwk") document.body.classList.add("font-lxwk");
  if (fontValue === "mashan") document.body.classList.add("font-mashan");
  if (fontValue === "zhimang") document.body.classList.add("font-zhimang");
  if (fontValue === "custom") document.body.classList.add("font-custom");

  localStorage.setItem(STORAGE_KEYS.font, fontValue);
}

fontSelector.addEventListener("change", () => {
  applyFont(fontSelector.value);
});

fontUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const fontData = reader.result;
    localStorage.setItem(STORAGE_KEYS.customFont, fontData);

    injectCustomFont(fontData, file.name);
    applyFont("custom");

    if (![...fontSelector.options].some(opt => opt.value === "custom")) {
      const option = document.createElement("option");
      option.value = "custom";
      option.textContent = "自定义上传字体";
      fontSelector.appendChild(option);
    }

    fontSelector.value = "custom";
    alert("自定义字体已上传并应用。");
  };
  reader.readAsDataURL(file);
});

function injectCustomFont(fontData, fontName = "CustomUploadedFont") {
  let oldStyle = document.getElementById("customFontStyle");
  if (oldStyle) oldStyle.remove();

  const style = document.createElement("style");
  style.id = "customFontStyle";
  style.innerHTML = `
    @font-face {
      font-family: 'CustomUploadedFont';
      src: url('${fontData}');
    }
    .font-custom {
      --font-main: 'CustomUploadedFont', -apple-system, BlinkMacSystemFont, sans-serif;
    }
  `;
  document.head.appendChild(style);
}

bgUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const imageData = reader.result;
    bgOverlay.style.backgroundImage = `url('${imageData}')`;
    localStorage.setItem(STORAGE_KEYS.bg, imageData);
    alert("背景图已应用。");
  };
  reader.readAsDataURL(file);
});

removeBgBtn.addEventListener("click", () => {
  bgOverlay.style.backgroundImage = "";
  localStorage.removeItem(STORAGE_KEYS.bg);
});

resetStyleBtn.addEventListener("click", () => {
  applyTheme("theme-blueblack");
  themeSelector.value = "theme-blueblack";
  applyFont("system");
  fontSelector.value = "system";
  bgOverlay.style.backgroundImage = "";
  localStorage.removeItem(STORAGE_KEYS.bg);
});

function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatPanel.appendChild(wrapper);
  chatPanel.scrollTop = chatPanel.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";

  const currentConfigs = getConfigs();
  const selected = currentConfigs[savedConfigs.value] || currentConfigs[0];

  if (!selected) {
    appendMessage("assistant", "请先在悬浮球中保存 API 配置后再开始聊天。");
    return;
  }

  appendMessage("assistant", "正在连接模型，请稍候…");

  try {
    const messages = [
      { role: "system", content: selected.prompt || "你是一个简洁的 AI 助手。" },
      { role: "user", content: text }
    ];

    const res = await fetch(selected.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${selected.key}`
      },
      body: JSON.stringify({
        model: selected.model,
        messages
      })
    });

    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      data.output?.[0]?.content?.[0]?.text ||
      data.reply ||
      "模型已返回内容，但当前接口返回格式未完全匹配，请按你的中转站格式微调 script.js。";

    chatPanel.lastChild?.remove();
    appendMessage("assistant", reply);
  } catch (error) {
    chatPanel.lastChild?.remove();
    appendMessage("assistant", "连接失败，请检查 API 地址、Key、模型名称，或中转站是否支持浏览器跨域访问。");
  }
});

clearChatBtn.addEventListener("click", () => {
  chatPanel.innerHTML = "";
});

applyAIDesignBtn.addEventListener("click", async () => {
  const command = styleCommand.value.trim();
  if (!command) {
    alert("请先输入想让 AI 调整页面的要求。");
    return;
  }

  const currentConfigs = getConfigs();
  const selected = currentConfigs[savedConfigs.value] || currentConfigs[0];

  if (!selected) {
    alert("请先保存 API 配置。");
    return;
  }

  try {
    const prompt = `
你是一个网页视觉设计助手。
用户会给你一段风格要求。
你只返回 JSON，不要返回任何解释。
JSON 格式如下：
{
  "theme": "theme-blueblack 或 theme-frost 或 theme-deepsea",
  "font": "system 或 song 或 lxwk 或 mashan 或 zhimang",
  "effects": {
    "bubbleRound": 22,
    "panelBlur": 24,
    "contentWidth": "normal"
  }
}
用户要求：${command}
`;

    const res = await fetch(selected.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${selected.key}`
      },
      body: JSON.stringify({
        model: selected.model,
        messages: [
          { role: "system", content: selected.prompt || "你是网页设计助手。" },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content ||
      data.output?.[0]?.content?.[0]?.text ||
      "{}";

    const jsonText = content.match(/\{[\s\S]*\}/)?.[0] || "{}";
    const design = JSON.parse(jsonText);

    if (design.theme) {
      applyTheme(design.theme);
      themeSelector.value = design.theme;
    }

    if (design.font) {
      applyFont(design.font);
      fontSelector.value = design.font;
    }

    if (design.effects?.bubbleRound) {
      document.documentElement.style.setProperty("--radius-md", `${design.effects.bubbleRound}px`);
      document.querySelectorAll(".bubble").forEach(el => {
        el.style.borderRadius = `${design.effects.bubbleRound}px`;
      });
    }

    if (design.effects?.panelBlur) {
      document.querySelector(".chat-shell").style.backdropFilter = `blur(${design.effects.panelBlur}px)`;
      document.querySelector(".chat-shell").style.webkitBackdropFilter = `blur(${design.effects.panelBlur}px)`;
    }

    alert("AI 已尝试调整页面风格。");
  } catch (err) {
    alert("AI 风格调整失败，请检查接口返回格式。");
  }
});

userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 160) + "px";
});

function initPage() {
  refreshConfigList();

  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme) {
    applyTheme(savedTheme);
    themeSelector.value = savedTheme;
  }

  const savedFont = localStorage.getItem(STORAGE_KEYS.font);
  if (savedFont) {
    applyFont(savedFont);
    fontSelector.value = savedFont;
  }

  const savedBg = localStorage.getItem(STORAGE_KEYS.bg);
  if (savedBg) {
    bgOverlay.style.backgroundImage = `url('${savedBg}')`;
  }

  const savedCustomFont = localStorage.getItem(STORAGE_KEYS.customFont);
  if (savedCustomFont) {
    injectCustomFont(savedCustomFont);

    if (![...fontSelector.options].some(opt => opt.value === "custom")) {
      const option = document.createElement("option");
      option.value = "custom";
      option.textContent = "自定义上传字体";
      fontSelector.appendChild(option);
    }
  }
}

initPage();