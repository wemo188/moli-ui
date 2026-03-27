
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

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  // ========= IndexedDB：字体 =========
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

  // ========= 主题 =========
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

  function applyThemeVars(vars) {
    if (!vars) return;
    Object.keys(vars).forEach(function(k) {
      document.documentElement.style.setProperty(k, vars[k]);
    });
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
    LS.set('themeVars', theme.vars);
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
      for (var i = 0; i < colors.length; i++) {
        dots += '<div class="theme-color-dot" style="background:' + colors[i] + '"></div>';
      }
      return '<div class="theme-card' + (currentThemeId === t.id ? ' active' : '') + '" data-theme="' + t.id + '">' +
        '<div class="theme-card-colors">' + dots + '</div>' +
        '<div class="theme-card-name">' + esc(t.name) + '</div>' +
        '<div class="theme-card-desc">' + esc(t.desc) + '</div>' +
      '</div>';
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
      c.innerHTML = '<p style="font-size:12px;color:var(--text-muted);padding:8px 0;">暂无自定义主题</p>';
      return;
    }

    c.innerHTML = customThemes.map(function(t, idx) {
      var dots = '';
      var colors = [t.vars['--bg-primary'], t.vars['--accent'], t.vars['--text-primary'], t.vars['--border']];
      for (var i = 0; i < colors.length; i++) {
        dots += '<div class="theme-color-dot" style="background:' + colors[i] + '"></div>';
      }
      return '<div class="theme-card' + (currentThemeId === t.id ? ' active' : '') + '" data-theme="' + t.id + '">' +
        '<button class="theme-card-del" onclick="event.stopPropagation();window._delTheme(' + idx + ')" type="button">x</button>' +
        '<div class="theme-card-colors">' + dots + '</div>' +
        '<div class="theme-card-name">' + esc(t.name) + '</div>' +
        '<div class="theme-card-desc">' + esc(t.desc || '自定义') + '</div>' +
      '</div>';
    }).join('');

    c.querySelectorAll('.theme-card').forEach(function(card) {
      card.addEventListener('click', function() {
        selectTheme(card.dataset.theme);
      });
    });
  }

  window._delTheme = function(idx) {
    var removed = customThemes.splice(idx, 1)[0];
    LS.set('customThemes', customThemes);
    if (currentThemeId === removed.id) selectTheme('blue-white');
    renderThemeList();
    showToast('已删除: ' + removed.name);
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
    LS.set('themeVars', vars);
    currentThemeId = 'custom-temp';
    LS.set('currentThemeId', 'custom-temp');
    renderThemeList();
    showToast('配色已应用');
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
    LS.set('themeVars', vars);
    applyThemeVars(vars);
    if ($('#customThemeName')) $('#customThemeName').value = '';
    renderThemeList();
    showToast('主题已保存');
  });

  safeOn('#resetTheme', 'click', function() {
    selectTheme('blue-white');
    showToast('已恢复默认主题');
  });

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

  function registerFont(name, url) {
    fontStyleEl.textContent += '@font-face{font-family:"' + name + '";src:url(' + url + ');font-display:swap;}';
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
    document.body.style.fontFamily = '"' + name + '", sans-serif';
    LS.remove('currentFontIndex');
    LS.set('currentFontCustom', name);
  }

  function renderFontList() {
    var c = $('#fontList');
    if (!c) return;

    c.innerHTML = builtinFonts.map(function(f, idx) {
      var active = (currentFontCustom === null && currentFontIndex === idx);
      return '<div class="font-item' + (active ? ' active' : '') + '" data-idx="' + idx + '">' +
        '<div>' +
          '<div class="font-item-preview" style="font-family:' + f.family + '">' + f.preview + '</div>' +
          '<div class="font-item-name">' + f.name + '</div>' +
        '</div>' +
        '<div class="font-item-check"></div>' +
      '</div>';
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
      return '<div class="font-item' + (active ? ' active' : '') + '" data-cidx="' + idx + '">' +
        '<div>' +
          '<div class="font-item-preview" style="font-family:\'' + f.familyName + '\'">' + esc(f.name) + ' 永远相信美好</div>' +
          '<div class="font-item-name">' + esc(f.name) + ' (自定义)</div>' +
        '</div>' +
        '<div class="font-item-check"></div>' +
      '</div>';
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
      for (var i = 0; i < fonts.length; i++) {
        registerFont(fonts[i].familyName, fonts[i].dataUrl);
      }

      if (currentFontCustom) {
        try {
          await document.fonts.load('16px "' + currentFontCustom + '"');
          document.body.style.fontFamily = '"' + currentFontCustom + '", sans-serif';
        } catch (e) {}
      }

      renderCustomFonts();
    } catch (e) {
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

      customFontMetas.push({
        id: fontId,
        name: fontName,
        familyName: familyName
      });
      LS.set('customFontMetas', customFontMetas);

      try { await document.fonts.load('16px "' + familyName + '"'); } catch (e) {}
      applyFontByCustom(familyName);
      renderFontList();
      renderCustomFonts();
      showToast('字体已添加');
    };

    reader.onerror = function() {
      showToast('读取字体失败');
    };

    reader.readAsDataURL(file);
    if ($('#fontFileInput')) $('#fontFileInput').value = '';
  });

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

  // ========= API =========
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
          '<button class="use-btn" onclick="window._useApi(' + i + ')" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></button>' +
          '<button class="edit-btn" onclick="window._editApi(' + i + ')" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></button>' +
          '<button class="del-btn" onclick="window._delApi(' + i + ')" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>' +
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

  // ========= 聊天与源码 =========
  var chatHistory = LS.get('chatHistory') || [];
  var visionImageData = null;
  var useStream = LS.get('useStream');
  if (useStream === null) useStream = true;

  var sendFiles = LS.get('sendFiles') || {
    html: false,
    css: false,
    js: false
  };

  var aiDraft = LS.get('aiDraft') || {
    html: '',
    css: '',
    js: '',
    hasHtml: false,
    hasCss: false,
    hasJs: false
  };

  var sourcePreviewCache = {
    active: false,
    originalMain: '',
    originalDraftStyle: ''
  };

  var currentAbortController = null;
  var assistantRollMap = {};
  var assistantRollCounter = 0;

  function getSourceRepo() {
    return LS.get('sourceRepo') || {
      html: '',
      css: '',
      js: ''
    };
  }

  function setSourceRepo(repo) {
    LS.set('sourceRepo', {
      html: repo.html || '',
      css: repo.css || '',
      js: repo.js || ''
    });
  }

  function restoreSourceRepo() {
    var repo = getSourceRepo();
    if ($('#sourceHtml')) $('#sourceHtml').value = repo.html || '';
    if ($('#sourceCss')) $('#sourceCss').value = repo.css || '';
    if ($('#sourceJs')) $('#sourceJs').value = repo.js || '';

    if ($('#sendHtmlToAI')) $('#sendHtmlToAI').checked = !!sendFiles.html;
    if ($('#sendCssToAI')) $('#sendCssToAI').checked = !!sendFiles.css;
    if ($('#sendJsToAI')) $('#sendJsToAI').checked = !!sendFiles.js;
  }

  function saveSendFiles() {
    sendFiles = {
      html: $('#sendHtmlToAI') ? $('#sendHtmlToAI').checked : false,
      css: $('#sendCssToAI') ? $('#sendCssToAI').checked : false,
      js: $('#sendJsToAI') ? $('#sendJsToAI').checked : false
    };
    LS.set('sendFiles', sendFiles);
  }

  function saveSourceField(type) {
    var repo = getSourceRepo();
    if (type === 'html' && $('#sourceHtml')) repo.html = $('#sourceHtml').value;
    if (type === 'css' && $('#sourceCss')) repo.css = $('#sourceCss').value;
    if (type === 'js' && $('#sourceJs')) repo.js = $('#sourceJs').value;
    setSourceRepo(repo);
    showToast(type + ' 已保存');
  }

  function clearSourceField(type) {
    var repo = getSourceRepo();
    if (type === 'html') {
      repo.html = '';
      if ($('#sourceHtml')) $('#sourceHtml').value = '';
    }
    if (type === 'css') {
      repo.css = '';
      if ($('#sourceCss')) $('#sourceCss').value = '';
    }
    if (type === 'js') {
      repo.js = '';
      if ($('#sourceJs')) $('#sourceJs').value = '';
    }
    setSourceRepo(repo);
    showToast(type + ' 已清空');
  }

  function copySourceField(type) {
    var text = '';
    if (type === 'html' && $('#sourceHtml')) text = $('#sourceHtml').value;
    if (type === 'css' && $('#sourceCss')) text = $('#sourceCss').value;
    if (type === 'js' && $('#sourceJs')) text = $('#sourceJs').value;

    copyText(text || '').then(function() {
      showToast(type + ' 已复制');
    }).catch(function() {
      showToast('复制失败');
    });
  }

  function updateSourceRepoFile(type, content) {
    var repo = getSourceRepo();
    if (type === 'html') {
      repo.html = content;
      if ($('#sourceHtml')) $('#sourceHtml').value = content;
    }
    if (type === 'css') {
      repo.css = content;
      if ($('#sourceCss')) $('#sourceCss').value = content;
    }
    if (type === 'js') {
      repo.js = content;
      if ($('#sourceJs')) $('#sourceJs').value = content;
    }
    setSourceRepo(repo);
  }

  function updateDraftStatus() {
    var names = [];
    if (aiDraft.hasHtml) names.push('html');
    if (aiDraft.hasCss) names.push('css');
    if (aiDraft.hasJs) names.push('js');
    if ($('#sourceAiDraftStatus')) {
      $('#sourceAiDraftStatus').textContent = names.length ? ('草稿: ' + names.join(' / ')) : '暂无草稿';
    }
  }

  function saveDraft() {
    LS.set('aiDraft', aiDraft);
    updateDraftStatus();
  }

  function clearDraft() {
    aiDraft = {
      html: '',
      css: '',
      js: '',
      hasHtml: false,
      hasCss: false,
      hasJs: false
    };
    saveDraft();
  }

  function applyReplyToDraft(reply) {
    var match;
    var accepted = false;

    if (sendFiles.html) {
      var htmlReg = /```source-html\n?([\s\S]*?)```/g;
      while ((match = htmlReg.exec(reply)) !== null) {
        aiDraft.html = match[1].trim();
        aiDraft.hasHtml = true;
        accepted = true;
      }
    } else if (/```source-html\n?[\s\S]*?```/g.test(reply)) {
      showToast('已拦截未授权的 index.html 改写');
    }

    if (sendFiles.css) {
      var cssReg = /```source-css\n?([\s\S]*?)```/g;
      while ((match = cssReg.exec(reply)) !== null) {
        aiDraft.css = match[1].trim();
        aiDraft.hasCss = true;
        accepted = true;
      }
    } else if (/```source-css\n?[\s\S]*?```/g.test(reply)) {
      showToast('已拦截未授权的 style.css 改写');
    }

    if (sendFiles.js) {
      var jsReg = /```source-js\n?([\s\S]*?)```/g;
      while ((match = jsReg.exec(reply)) !== null) {
        aiDraft.js = match[1].trim();
        aiDraft.hasJs = true;
        accepted = true;
      }
    } else if (/```source-js\n?[\s\S]*?```/g.test(reply)) {
      showToast('已拦截未授权的 script.js 改写');
    }

    if (accepted) {
      saveDraft();
      showToast('AI 草稿已生成');
    }
  }

  function buildSelectedSourcePrompt() {
    var repo = getSourceRepo();
    var parts = [];
    var allowed = [];

    if (sendFiles.html && repo.html) {
      parts.push('[index.html]\n' + repo.html);
      allowed.push('html');
    }
    if (sendFiles.css && repo.css) {
      parts.push('[style.css]\n' + repo.css);
      allowed.push('css');
    }
    if (sendFiles.js && repo.js) {
      parts.push('[script.js]\n' + repo.js);
      allowed.push('js');
    }

    if (!parts.length) return '';

    return '\n\n=== 以下是允许修改的源码文件 ===\n' +
      parts.join('\n\n') +
      '\n\n你只能修改这些被发送的文件：' + allowed.join(', ') + '。\n' +
      '没有被发送的文件，你绝对不能返回对应的 source 代码块。\n' +
      '如果用户只发送了 html 和 css，你绝对不能返回 source-js。\n' +
      '如果用户只发送了 js，你绝对不能返回 source-html 或 source-css。\n' +
      '请优先返回以下格式：\n' +
      (sendFiles.html ? '```source-html\n完整 index.html\n```\n' : '') +
      (sendFiles.css ? '```source-css\n完整 style.css\n```\n' : '') +
      (sendFiles.js ? '```source-js\n完整 script.js\n```\n' : '');
  }

  function cleanReplyForDisplay(reply) {
    var cleaned = reply
      .replace(/```source-html\n?[\s\S]*?```/g, '[AI 提交了 index.html 草稿]')
      .replace(/```source-css\n?[\s\S]*?```/g, '[AI 提交了 style.css 草稿]')
      .replace(/```source-js\n?[\s\S]*?```/g, '[AI 提交了 script.js 草稿]');

    if (cleaned.length > 1200) {
      cleaned = cleaned.slice(0, 1200) + '\n\n[回复过长，已折叠显示]';
    }
    return cleaned;
  }

  function extractBodyInner(html) {
    var bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) return bodyMatch[1];
    return html;
  }

  function ensureDraftStyleEl() {
    var el = document.getElementById('draft-preview-style');
    if (!el) {
      el = document.createElement('style');
      el.id = 'draft-preview-style';
      document.head.appendChild(el);
    }
    return el;
  }

  function previewDraft() {
    if (!aiDraft.hasHtml && !aiDraft.hasCss && !aiDraft.hasJs) {
      showToast('暂无可预览的草稿');
      return;
    }

    if (!sourcePreviewCache.active) {
      sourcePreviewCache.originalMain = $('#mainContent') ? $('#mainContent').innerHTML : '';
      var existingDraftStyle = document.getElementById('draft-preview-style');
      sourcePreviewCache.originalDraftStyle = existingDraftStyle ? existingDraftStyle.textContent : '';
      sourcePreviewCache.active = true;
    }

    if (aiDraft.hasHtml && $('#mainContent')) {
      $('#mainContent').innerHTML = extractBodyInner(aiDraft.html);
    }

    if (aiDraft.hasCss) {
      var styleEl = ensureDraftStyleEl();
      styleEl.textContent = aiDraft.css;
    }

    if (aiDraft.hasJs) {
      showToast('JS 草稿暂不自动预览');
    } else {
      showToast('已预览草稿效果');
    }
  }

  function discardDraftPreview() {
    if (!sourcePreviewCache.active) return;

    if ($('#mainContent')) {
      $('#mainContent').innerHTML = sourcePreviewCache.originalMain || '';
    }

    var styleEl = document.getElementById('draft-preview-style');
    if (styleEl) {
      styleEl.textContent = sourcePreviewCache.originalDraftStyle || '';
    }

    sourcePreviewCache.active = false;
  }

  function saveDraftToSource() {
    if (!aiDraft.hasHtml && !aiDraft.hasCss && !aiDraft.hasJs) {
      showToast('暂无可保存的草稿');
      return;
    }

    if (aiDraft.hasHtml) updateSourceRepoFile('html', aiDraft.html);
    if (aiDraft.hasCss) updateSourceRepoFile('css', aiDraft.css);
    if (aiDraft.hasJs) updateSourceRepoFile('js', aiDraft.js);

    clearDraft();
    showToast('已保存 AI 修改');
  }

  function discardDraftAll() {
    discardDraftPreview();
    clearDraft();
    showToast('已丢弃 AI 修改');
  }

  function attachMsgTools(wrap, role, rawContent, meta) {
    if (!wrap || role !== 'assistant') return;

    var tools = document.createElement('div');
    tools.className = 'msg-tools';

    var copyBtn = document.createElement('button');
    copyBtn.className = 'msg-tool-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = '复制';

    var editBtn = document.createElement('button');
    editBtn.className = 'msg-tool-btn';
    editBtn.type = 'button';
    editBtn.textContent = '编辑';

    var rerollBtn = document.createElement('button');
    rerollBtn.className = 'msg-tool-btn';
    rerollBtn.type = 'button';
    rerollBtn.textContent = '重试';

    var indicator = document.createElement('span');
    indicator.className = 'msg-roll-indicator';
    indicator.textContent = meta && meta.rollIndex && meta.rollCount
      ? (meta.rollIndex + '/' + meta.rollCount)
      : '1/1';

    tools.appendChild(copyBtn);
    tools.appendChild(editBtn);
    tools.appendChild(rerollBtn);
    tools.appendChild(indicator);

    wrap.appendChild(tools);

    copyBtn.addEventListener('click', function() {
      copyText(rawContent || '').then(function() {
        showToast('已复制消息');
      }).catch(function() {
        showToast('复制失败');
      });
    });

    editBtn.addEventListener('click', function() {
      if (meta && meta.sourceMode) {
        if ($('#sourceAiInput')) {
          $('#sourceAiInput').value = meta.userText || '';
          openPanel('sourcePanel');
          showToast('已填入源码改写框');
        }
      } else {
        if ($('#chatInput')) {
          $('#chatInput').value = meta && meta.userText ? meta.userText : '';
          openPanel('aiPanel');
          showToast('已填入聊天输入框');
        }
      }
    });

    rerollBtn.addEventListener('click', function() {
      if (!meta || !meta.userText) {
        showToast('缺少可重试内容');
        return;
      }

      if (meta.sourceMode) {
        if ($('#sourceAiInput')) $('#sourceAiInput').value = meta.userText;
        sendSourceAiMessage(meta.userText, meta.rollGroupId);
      } else {
        if ($('#chatInput')) $('#chatInput').value = meta.userText;
        sendNormalChatMessage(meta.userText, meta.rollGroupId);
      }
    });
  }

  function addChatMsg(role, content, meta) {
    if (!chatMessages) return null;

    var wrap = document.createElement('div');
    wrap.className = 'chat-msg-wrap ' + role;

    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.innerHTML = esc(content).replace(/\n/g, '<br>');
    wrap.appendChild(div);

    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (role === 'assistant') {
      attachMsgTools(wrap, role, content, meta);
    }

    return div;
  }

  function restoreChatHistory() {
    if (!chatMessages) return;
    if (!chatHistory.length) {
      chatMessages.innerHTML = '<div class="chat-msg system">已就绪。</div>';
      return;
    }

    for (var i = 0; i < chatHistory.length; i++) {
      var item = chatHistory[i];
      addChatMsg(
        item.role === 'assistant' ? 'assistant' : item.role === 'user' ? 'user' : 'system',
        item.displayContent || item.content || '',
        item.meta || null
      );
    }
  }

  function saveChatHistory() {
    LS.set('chatHistory', chatHistory.slice(-50));
  }

  safeOn('#clearChatBtn', 'click', function() {
    chatHistory = [];
    assistantRollMap = {};
    LS.remove('chatHistory');
    if (chatMessages) {
      chatMessages.innerHTML = '<div class="chat-msg system">已清空。</div>';
    }
    showToast('已清空对话');
  });

  // ========= 文件发送勾选 =========
  safeOn('#sendHtmlToAI', 'change', function() {
    saveSendFiles();
    showToast(this.checked ? '已勾选 index.html' : '已取消 index.html');
  });

  safeOn('#sendCssToAI', 'change', function() {
    saveSendFiles();
    showToast(this.checked ? '已勾选 style.css' : '已取消 style.css');
  });

  safeOn('#sendJsToAI', 'change', function() {
    saveSendFiles();
    showToast(this.checked ? '已勾选 script.js' : '已取消 script.js');
  });

  safeOn('#copySourceHtml', 'click', function() { copySourceField('html'); });
  safeOn('#saveSourceHtml', 'click', function() { saveSourceField('html'); });
  safeOn('#clearSourceHtml', 'click', function() { clearSourceField('html'); });

  safeOn('#copySourceCss', 'click', function() { copySourceField('css'); });
  safeOn('#saveSourceCss', 'click', function() { saveSourceField('css'); });
  safeOn('#clearSourceCss', 'click', function() { clearSourceField('css'); });

  safeOn('#copySourceJs', 'click', function() { copySourceField('js'); });
  safeOn('#saveSourceJs', 'click', function() { saveSourceField('js'); });
  safeOn('#clearSourceJs', 'click', function() { clearSourceField('js'); });

  // ========= 图片给 AI =========
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

  // ========= AI 提示词 =========
  var SYSTEM_PROMPT =
    '你是网页内置开发助手，已经运行在当前网页里。\n' +
    '不要索要代码，不要说无法访问文件。\n' +
    '你只能修改用户消息里明确发送给你的文件。\n' +
    '绝对禁止返回未被发送文件对应的 source 代码块。\n' +
    '如果只发送了 html 和 css，你绝不能返回 source-js。\n' +
    '如果只发送了 js，你绝不能返回 source-html 或 source-css。\n' +
    '如果用户是在美化，优先修改 css；如果是结构，优先修改 html；如果是逻辑，优先修改 js。\n' +
    '不要伪造功能，不要额外创建假按钮。';

  function buildUserContent(text) {
    if (visionImageData) {
      return [
        { type: 'text', text: text },
        { type: 'image_url', image_url: { url: visionImageData } }
      ];
    }
    return text;
  }

  function buildSourceAiPrompt(userText) {
    var sourceBlock = buildSelectedSourcePrompt();
    return '请直接处理当前网页源码。\n' +
      '只允许修改被发送的文件。\n' +
      '如果要提交修改，请使用 source-html / source-css / source-js 代码块。\n' +
      '用户需求：' + userText +
      sourceBlock;
  }

  function extractReplyIntoDraft(reply) {
    applyReplyToDraft(reply);
    return cleanReplyForDisplay(reply);
  }

  async function sendChatRequest(userText, opts) {
    opts = opts || {};
    if (!activeApi) {
      showToast('请先配置并选择 API');
      return;
    }

    var sourceMode = !!opts.sourceMode;
    var replyDiv = opts.replyDiv || null;

    var wrappedText = sourceMode ? buildSourceAiPrompt(userText) : userText;

    var messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ].concat(chatHistory.slice(-20).map(function(item) {
      return {
        role: item.role,
        content: item.content
      };
    })).concat([
      { role: 'user', content: buildUserContent(wrappedText) }
    ]);

    var base = activeApi.url.replace(/\/+$/, '');
    currentAbortController = new AbortController();

    async function handleNormalResponse() {
      var response = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + activeApi.key
        },
        body: JSON.stringify({
          model: activeApi.model,
          messages: messages
        }),
        signal: currentAbortController.signal
      });

      if (!response.ok) {
        var errData = await response.json().catch(function() { return {}; });
        throw new Error(errData.error?.message || ('请求失败: ' + response.status));
      }

      var data = await response.json();
      var fullReply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '(无回复)';
      return fullReply;
    }

    async function handleStreamResponse(onChunk) {
      var response = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + activeApi.key
        },
        body: JSON.stringify({
          model: activeApi.model,
          messages: messages,
          stream: true
        }),
        signal: currentAbortController.signal
      });

      if (!response.ok) {
        var errData = await response.json().catch(function() { return {}; });
        throw new Error(errData.error?.message || ('请求失败: ' + response.status));
      }

      if (!response.body) {
        throw new Error('当前接口不支持流式输出');
      }

      var reader = response.body.getReader();
      var decoder = new TextDecoder('utf-8');
      var buffer = '';
      var fullReply = '';

      while (true) {
        var result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line.startsWith('data:')) continue;

          var dataStr = line.slice(5).trim();
          if (dataStr === '[DONE]') continue;

          try {
            var data = JSON.parse(dataStr);
            var delta = data.choices && data.choices[0] && data.choices[0].delta ? data.choices[0].delta : {};
            var content = delta.content || '';
            if (content) {
              fullReply += content;
              if (onChunk) onChunk(fullReply);
            }
          } catch (e) {}
        }
      }

      if (!fullReply.trim()) fullReply = '(无回复)';
      return fullReply;
    }

    try {
      var fullReply = '';

      if (useStream) {
        try {
          fullReply = await handleStreamResponse(function(tempReply) {
            if (replyDiv) {
              var displayTemp = sourceMode ? cleanReplyForDisplay(tempReply) : tempReply;
              replyDiv.innerHTML = esc(displayTemp).replace(/\n/g, '<br>');
            }
          });
        } catch (streamErr) {
          showToast('流式失败，自动切换普通模式');
          fullReply = await handleNormalResponse();
        }
      } else {
        fullReply = await handleNormalResponse();
      }

      currentAbortController = null;
      return fullReply;
    } catch (err) {
      currentAbortController = null;
      throw err;
    }
  }

  async function sendNormalChatMessage(forceText, existingRollGroupId) {
    if (!activeApi) {
      showToast('请先配置并选择 API');
      return;
    }

    var text = typeof forceText === 'string' ? forceText : (chatInput ? chatInput.value.trim() : '');
    if (!text && !visionImageData) return;

    var displayText = text || '[发送了一张图片]';
    if (typeof forceText !== 'string' && chatInput) chatInput.value = '';

    addChatMsg('user', displayText + (visionImageData ? '\n[附带图片]' : ''));

    chatHistory.push({
      role: 'user',
      content: buildUserContent(displayText),
      displayContent: displayText + (visionImageData ? '\n[附带图片]' : '')
    });
    saveChatHistory();

    var rollGroupId = existingRollGroupId || ('chat-roll-' + Date.now());
    if (!assistantRollMap[rollGroupId]) assistantRollMap[rollGroupId] = [];
    var rollIndex = assistantRollMap[rollGroupId].length + 1;

    var meta = {
      userText: displayText,
      sourceMode: false,
      rollGroupId: rollGroupId,
      rollIndex: rollIndex,
      rollCount: rollIndex
    };

    var replyDiv = addChatMsg('assistant', '思考中...', meta);

    try {
      var fullReply = await sendChatRequest(displayText, {
        sourceMode: false,
        replyDiv: replyDiv
      });

      meta.rollCount = rollIndex;
      assistantRollMap[rollGroupId].push(fullReply);

      if (replyDiv) {
        replyDiv.innerHTML = esc(fullReply).replace(/\n/g, '<br>');
      }

      var allWraps = chatMessages.querySelectorAll('.chat-msg-wrap.assistant');
      var lastWrap = allWraps[allWraps.length - 1];
      if (lastWrap) {
        var oldTools = lastWrap.querySelector('.msg-tools');
        if (oldTools) oldTools.remove();
        attachMsgTools(lastWrap, 'assistant', fullReply, meta);
      }

      chatHistory.push({
        role: 'assistant',
        content: fullReply,
        displayContent: fullReply,
        meta: meta
      });
      saveChatHistory();
      clearVisionImage();
    } catch (err) {
      if (replyDiv) {
        replyDiv.innerHTML = '请求失败: ' + esc(err.message);
      }
    }
  }

  async function sendSourceAiMessage(forceUserText, existingRollGroupId) {
    if (!activeApi) {
      showToast('请先配置并选择 API');
      return;
    }

    saveSendFiles();

    if (!sendFiles.html && !sendFiles.css && !sendFiles.js) {
      showToast('请先勾选至少一个发送文件');
      return;
    }

    var text = typeof forceUserText === 'string' ? forceUserText : ($('#sourceAiInput') ? $('#sourceAiInput').value.trim() : '');
    if (!text) return;

    if (typeof forceUserText !== 'string' && $('#sourceAiInput')) {
      $('#sourceAiInput').value = '';
    }

    addChatMsg('user', '[源码改写]\n' + text);

    chatHistory.push({
      role: 'user',
      content: buildUserContent('[源码改写]\n' + text),
      displayContent: '[源码改写]\n' + text
    });
    saveChatHistory();

    var rollGroupId = existingRollGroupId || ('source-roll-' + Date.now());
    if (!assistantRollMap[rollGroupId]) assistantRollMap[rollGroupId] = [];
    var rollIndex = assistantRollMap[rollGroupId].length + 1;

    var meta = {
      userText: text,
      sourceMode: true,
      rollGroupId: rollGroupId,
      rollIndex: rollIndex,
      rollCount: rollIndex
    };

    var replyDiv = addChatMsg('assistant', '思考中...', meta);

    try {
      var fullReply = await sendChatRequest(text, {
        sourceMode: true,
        replyDiv: replyDiv
      });

      var displayReply = extractReplyIntoDraft(fullReply);

      meta.rollCount = rollIndex;
      assistantRollMap[rollGroupId].push(fullReply);

      if (replyDiv) {
        replyDiv.innerHTML = esc(displayReply).replace(/\n/g, '<br>');
      }

      var allWraps = chatMessages.querySelectorAll('.chat-msg-wrap.assistant');
      var lastWrap = allWraps[allWraps.length - 1];
      if (lastWrap) {
        var oldTools = lastWrap.querySelector('.msg-tools');
        if (oldTools) oldTools.remove();
        attachMsgTools(lastWrap, 'assistant', fullReply, meta);
      }

      chatHistory.push({
        role: 'assistant',
        content: fullReply,
        displayContent: displayReply,
        meta: meta
      });
      saveChatHistory();
      clearVisionImage();
    } catch (err) {
      if (replyDiv) {
        replyDiv.innerHTML = '请求失败: ' + esc(err.message);
      }
    }
  }

  safeOn('#sendBtn', 'click', function() {
    sendNormalChatMessage();
  });

  safeOn('#chatInput', 'keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendNormalChatMessage();
    }
  });

  safeOn('#sourceAiSendBtn', 'click', function() {
    sendSourceAiMessage();
  });

  safeOn('#sourceAiInput', 'keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendSourceAiMessage();
    }
  });

  safeOn('#sourceAiStopBtn', 'click', function() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
      showToast('已停止');
    } else {
      showToast('当前没有进行中的请求');
    }
  });

  safeOn('#stopChatBtn', 'click', function() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
      showToast('已停止');
    } else {
      showToast('当前没有进行中的请求');
    }
  });

  safeOn('#previewAiDraftBtn', 'click', function() {
    previewDraft();
  });

  safeOn('#saveAiDraftBtn', 'click', function() {
    saveDraftToSource();
  });

  safeOn('#discardAiDraftBtn', 'click', function() {
    discardDraftAll();
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
  function init() {
    renderThemeList();
    var savedThemeVars = LS.get('themeVars');
    if (savedThemeVars) {
      applyThemeVars(savedThemeVars);
      updateColorInputs(savedThemeVars);
    } else {
      selectTheme(currentThemeId);
    }

    renderFontList();
    restoreCustomFontsFromDB();

    if (currentFontCustom === null && currentFontIndex !== null && currentFontIndex !== undefined && builtinFonts[currentFontIndex]) {
      document.body.style.fontFamily = builtinFonts[currentFontIndex].family;
    }

    renderSavedApis();
    updateAiStatus();
    restoreChatHistory();
    restoreSourceRepo();
    updateDraftStatus();

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

    if ($('#useStreamToggle')) {
      $('#useStreamToggle').checked = !!useStream;
      $('#useStreamToggle').addEventListener('change', function() {
        useStream = this.checked;
        LS.set('useStream', useStream);
        showToast(useStream ? '已开启流式输出' : '已关闭流式输出');
      });
    }

    if ($('#mainContent') && !$('#mainContent').innerHTML.trim()) {
      $('#mainContent').innerHTML = '';
    }
  }

  init();
})();
