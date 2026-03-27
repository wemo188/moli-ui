(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Font = {
    builtinFonts: [
      { name: '系统默认', family: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif', preview: '系统默认字体 ABCabc' },
      { name: '霞鹜文楷', family: '"LXGW WenKai", serif', preview: '霞鹜文楷 落霞与孤鹜齐飞' },
      { name: '思源宋体', family: '"Noto Serif SC", serif', preview: '思源宋体 秋水共长天一色' },
      { name: '思源黑体', family: '"Noto Sans SC", sans-serif', preview: '思源黑体 千里之行始于足下' },
      { name: '站酷小薇', family: '"ZCOOL XiaoWei", serif', preview: '站酷小薇 山高月小水落石出' },
      { name: '马善政楷体', family: '"Ma Shan Zheng", cursive', preview: '马善政楷 清风明月本无价' }
    ],

    currentFontIndex: null,
    currentFontCustom: null,
    customFontMetas: [],
    fontStyleEl: null,

    DB: {
      db: null,
      open: function() {
        return new Promise(function(resolve) {
          if (Font.DB.db) return resolve(Font.DB.db);
          var req = indexedDB.open('MonoSpaceDB', 2);
          req.onupgradeneeded = function(e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains('fonts')) {
              db.createObjectStore('fonts', { keyPath: 'id' });
            }
          };
          req.onsuccess = function(e) {
            Font.DB.db = e.target.result;
            resolve(Font.DB.db);
          };
          req.onerror = function() { resolve(null); };
        });
      },
      saveFont: async function(obj) {
        var db = await Font.DB.open();
        if (!db) return false;
        return new Promise(function(resolve) {
          var tx = db.transaction('fonts', 'readwrite');
          tx.objectStore('fonts').put(obj);
          tx.oncomplete = function() { resolve(true); };
          tx.onerror = function() { resolve(false); };
        });
      },
      getAllFonts: async function() {
        var db = await Font.DB.open();
        if (!db) return [];
        return new Promise(function(resolve) {
          var tx = db.transaction('fonts', 'readonly');
          var req = tx.objectStore('fonts').getAll();
          req.onsuccess = function() { resolve(req.result || []); };
          req.onerror = function() { resolve([]); };
        });
      }
    },

    registerFont: function(name, url) {
      Font.fontStyleEl.textContent += '@font-face{font-family:"' + name + '";src:url(' + url + ');font-display:swap;}';
    },

    applyFontByIndex: function(idx) {
      Font.currentFontIndex = idx;
      Font.currentFontCustom = null;
      document.body.style.fontFamily = Font.builtinFonts[idx].family;
      App.LS.set('currentFontIndex', idx);
      App.LS.remove('currentFontCustom');
    },

    applyFontByCustom: function(name) {
      Font.currentFontIndex = null;
      Font.currentFontCustom = name;
      document.body.style.fontFamily = '"' + name + '", sans-serif';
      App.LS.remove('currentFontIndex');
      App.LS.set('currentFontCustom', name);
    },

    renderFontList: function() {
      var c = App.$('#fontList');
      if (!c) return;

      c.innerHTML = Font.builtinFonts.map(function(f, idx) {
        var active = (Font.currentFontCustom === null && Font.currentFontIndex === idx);
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
          var idx = parseInt(item.dataset.idx, 10);
          Font.applyFontByIndex(idx);
          Font.renderFontList();
          Font.renderCustomFonts();
          App.showToast('已切换: ' + Font.builtinFonts[idx].name);
        });
      });
    },

    renderCustomFonts: function() {
      var c = App.$('#customFonts');
      if (!c) return;

      if (!Font.customFontMetas.length) {
        c.innerHTML = '';
        return;
      }

      c.innerHTML = Font.customFontMetas.map(function(f, idx) {
        var active = (Font.currentFontCustom === f.familyName);
        return '<div class="font-item' + (active ? ' active' : '') + '" data-cidx="' + idx + '">' +
          '<div>' +
            '<div class="font-item-preview" style="font-family:\'' + f.familyName + '\'">' + App.esc(f.name) + ' 永远相信美好</div>' +
            '<div class="font-item-name">' + App.esc(f.name) + ' (自定义)</div>' +
          '</div>' +
          '<div class="font-item-check"></div>' +
        '</div>';
      }).join('');

      c.querySelectorAll('.font-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var idx = parseInt(item.dataset.cidx, 10);
          Font.applyFontByCustom(Font.customFontMetas[idx].familyName);
          Font.renderFontList();
          Font.renderCustomFonts();
          App.showToast('已切换: ' + Font.customFontMetas[idx].name);
        });
      });
    },

    restoreCustomFontsFromDB: async function() {
      try {
        var fonts = await Font.DB.getAllFonts();
        for (var i = 0; i < fonts.length; i++) {
          Font.registerFont(fonts[i].familyName, fonts[i].dataUrl);
        }

        if (Font.currentFontCustom) {
          try {
            await document.fonts.load('16px "' + Font.currentFontCustom + '"');
            document.body.style.fontFamily = '"' + Font.currentFontCustom + '", sans-serif';
          } catch (e) {}
        }

        Font.renderCustomFonts();
      } catch (e) {
        console.warn('restoreCustomFontsFromDB', e);
      }
    },

    bindEvents: function() {
      App.safeOn('#fontUploadArea', 'click', function() {
        if (App.$('#fontFileInput')) App.$('#fontFileInput').click();
      });

      App.safeOn('#fontFileInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;

        var fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
        var familyName = 'Custom-' + fontName + '-' + Date.now();
        var fontId = 'font-' + Date.now();

        App.showToast('正在加载字体（' + (file.size / 1024 / 1024).toFixed(1) + 'MB）...');

        var reader = new FileReader();
        reader.onload = async function(ev) {
          var dataUrl = ev.target.result;
          Font.registerFont(familyName, dataUrl);
          await Font.DB.saveFont({ id: fontId, familyName: familyName, name: fontName, dataUrl: dataUrl });

          Font.customFontMetas.push({
            id: fontId,
            name: fontName,
            familyName: familyName
          });
          App.LS.set('customFontMetas', Font.customFontMetas);

          try { await document.fonts.load('16px "' + familyName + '"'); } catch (e) {}
          Font.applyFontByCustom(familyName);
          Font.renderFontList();
          Font.renderCustomFonts();
          App.showToast('字体已添加');
        };

        reader.onerror = function() {
          App.showToast('读取字体失败');
        };

        reader.readAsDataURL(file);
        if (App.$('#fontFileInput')) App.$('#fontFileInput').value = '';
      });
    },

    init: function() {
      Font.currentFontIndex = App.LS.get('currentFontIndex');
      Font.currentFontCustom = App.LS.get('currentFontCustom') || null;
      Font.customFontMetas = App.LS.get('customFontMetas') || [];

      Font.fontStyleEl = document.getElementById('custom-font-faces');
      if (!Font.fontStyleEl) {
        Font.fontStyleEl = document.createElement('style');
        Font.fontStyleEl.id = 'custom-font-faces';
        document.head.appendChild(Font.fontStyleEl);
      }

      Font.renderFontList();
      Font.restoreCustomFontsFromDB();

      if (Font.currentFontCustom === null && Font.currentFontIndex !== null && Font.currentFontIndex !== undefined && Font.builtinFonts[Font.currentFontIndex]) {
        document.body.style.fontFamily = Font.builtinFonts[Font.currentFontIndex].family;
      }

      Font.bindEvents();
    }
  };

  App.register('font', Font);
})();
