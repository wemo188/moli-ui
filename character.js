
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var MODES = ['', 'mode-frost', 'mode-mono'];
  var MODE_LABELS = ['①', '②', '③'];
  var BOOK_SVG = '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var MODE_CFG = [
    {
      defaults: { border: '#111111', accent: '#88abda', bg: '#ffffff', left: '#111111', line: 3, outer: 3.5 },
      controls: [
        { key: 'border', label: '框', cssVar: '--card-border-c' },
        { key: 'accent', label: '中', cssVar: '--card-accent' },
        { key: 'bg',     label: '底', cssVar: '--card-bg' },
        { key: 'left',   label: '左', cssVar: '--card-left' }
      ]
    },
    {
      defaults: { accent: '#9ca3af', line: 2, outer: 2 },
      controls: [
        { key: 'accent', label: '中', cssVar: '--card-accent' }
      ]
    },
    {
      defaults: { border: '#1a1a1a', line: 1.5, outer: 1.5 },
      controls: [
        { key: 'border', label: '线', cssVar: '--card-border-c' }
      ]
    }
  ];

  var Character = {
    list: [],
    currentMode: 0,

    load: function() {
      Character.list = App.LS.get('characterList') || [];
      Character.currentMode = App.LS.get('charCardMode') || 0;
    },
    save: function() { App.LS.set('characterList', Character.list); },
    saveMode: function() { App.LS.set('charCardMode', Character.currentMode); },
    getById: function(id) {
      for (var i = 0; i < Character.list.length; i++) {
        if (Character.list[i].id === id) return Character.list[i];
      }
      return null;
    },

    getColors: function(c, mi) {
      if (!c.modeColors) c.modeColors = [{}, {}, {}];
      var saved = c.modeColors[mi] || {};
      var def = MODE_CFG[mi].defaults;
      var result = {};
      Object.keys(def).forEach(function(k) {
        result[k] = saved[k] !== undefined ? saved[k] : def[k];
      });
      return result;
    },

    setColors: function(c, mi, colors) {
      if (!c.modeColors) c.modeColors = [{}, {}, {}];
      c.modeColors[mi] = colors;
    },

    applyCardVars: function(card, col, mi) {
      var cfg = MODE_CFG[mi];
      cfg.controls.forEach(function(ctrl) {
        card.style.setProperty(ctrl.cssVar, col[ctrl.key]);
      });
      card.style.setProperty('--card-line', col.line + 'px');
      card.style.setProperty('--card-outer', col.outer + 'px');
      if (mi === 0) {
        card.style.setProperty('--card-bg', col.bg);
        card.style.setProperty('--card-left', col.left);
      }
    },

    open: function() {
      Character.load();
      var panel = App.$('#charPanel');
      if (!panel) return;
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      Character.renderList();
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }); });
    },

    close: function() {
      var panel = App.$('#charPanel');
      if (!panel) return;
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
      setTimeout(function() { panel.style.display = 'none'; }, 350);
    },

    renderList: function() {
      var panel = App.$('#charPanel');
      if (!panel) return;
      var chars = Character.list;
      var mi = Character.currentMode;
      var modeClass = MODES[mi] || '';

      var cardsHtml = '';
      if (!chars.length) {
        cardsHtml = '<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;letter-spacing:1px;">暂无角色，点击上方创建</div>';
      } else {
        cardsHtml = chars.map(function(c, i) {
          var idx = String(i + 1).padStart(2, '0');
          var name = App.esc(c.name || '未命名');
          var col = Character.getColors(c, mi);
          var cfg = MODE_CFG[mi];

          var avatarHtml = c.avatar
            ? '<img src="' + App.esc(c.avatar) + '">'
            : '<div class="cl-avatar-empty"></div>';
          var coverHtml = c.cover
            ? '<img src="' + App.esc(c.cover) + '">'
            : '<div class="cl-cover-empty"></div>';

          var wbMounted = c.worldbookMounted ? true : false;
          var wbClass = wbMounted ? ' mounted' : '';
          var wbText = wbMounted ? '已挂载' : '世界书';

          var colorHtml = cfg.controls.map(function(ctrl) {
            return '<div class="cl-color-custom-item">' +
              '<div class="cl-cc" data-key="' + ctrl.key + '" data-value="' + col[ctrl.key] + '" style="width:28px;height:28px;border-radius:8px;border:1.5px solid #ddd;background:' + col[ctrl.key] + ';cursor:pointer;-webkit-tap-highlight-color:transparent;"></div>' +
              '<label>' + ctrl.label + '</label></div>';
          }).join('');

          return '<div class="char-list-wrap" data-char-id="' + c.id + '">' +
            '<div class="cl-top-bar"></div>' +
            '<div class="cl-header">' +
              '<div class="cl-header-left"><h2>' + name + '</h2></div>' +
              '<div class="cl-create-btn cl-wb-btn' + wbClass + '" data-id="' + c.id + '"><span class="plus-icon">' + BOOK_SVG + '</span>' + wbText + '</div>' +
            '</div>' +
            '<div class="cl-body"><div class="cl-item">' +
              '<div class="cl-item-index">' + idx + '</div>' +
              '<div class="cl-item-main">' +
                '<div class="cl-cover cl-cover-box" data-id="' + c.id + '">' + coverHtml + '</div>' +
                '<div class="cl-avatar cl-avatar-box" data-id="' + c.id + '">' + avatarHtml + '</div>' +
              '</div>' +
              '<div class="cl-actions">' +
                '<div class="cl-act-btn cl-act-edit" data-id="' + c.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5l3 3L12 15H9v-3z"/></svg>编辑</div>' +
                '<div class="cl-act-btn cl-act-del" data-id="' + c.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6l1 14h12l1-14"/></svg>删除</div>' +
              '</div>' +
            '</div></div>' +
            '<div class="cl-footer">' +
              '<div class="cl-footer-left"><span class="cl-paw">🐾</span><span class="cl-footer-text">Character</span></div>' +
              '<div class="cl-change" data-id="' + c.id + '">' +
                '<div class="cl-change-dots"><div class="cl-change-dot"></div><div class="cl-change-dot"></div><div class="cl-change-dot"></div></div>' +
                '<span class="cl-change-label">change</span>' +
                '<div class="cl-color-popup">' +
                  '<div class="cl-color-popup-title">自定义配色</div>' +
                  '<div class="cl-color-custom">' + colorHtml + '</div>' +
                  '<div class="cl-line-row"><label>内线</label><input type="range" min="1" max="5" step="0.5" value="' + col.line + '" class="cl-cc-line"><span class="cl-line-val">' + col.line + 'px</span></div>' +
                  '<div class="cl-line-row"><label>外框</label><input type="range" min="0.5" max="6" step="0.5" value="' + col.outer + '" class="cl-cc-outer"><span class="cl-outer-val">' + col.outer + 'px</span></div>' +
                  '<button class="cl-popup-reset" type="button">重置</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="cl-bottom-bar"></div>' +
          '</div>';
        }).join('');
      }

      panel.innerHTML =
        '<div class="cl-page' + (modeClass ? ' ' + modeClass : '') + '" id="clPageInner" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:56px 16px 40px;background:#fff;">' +
          '<div class="cl-topbar-wrap">' +
            '<div class="cl-esc" id="clEsc">ESC</div>' +
            '<div class="cl-mode-btn" id="clModeBtn">' + MODE_LABELS[mi] + '</div>' +
            '<div class="cl-new-btn" id="clNewBtn">+ 创建</div>' +
          '</div>' +
          cardsHtml +
        '</div>';

      var pageEl = panel.querySelector('#clPageInner');

      // 渲染后应用 CSS 变量
      panel.querySelectorAll('.char-list-wrap').forEach(function(card) {
        var cid = card.dataset.charId;
        var c = Character.getById(cid);
        if (c) Character.applyCardVars(card, Character.getColors(c, mi), mi);
      });

      // ESC
      panel.querySelector('#clEsc').addEventListener('click', function() { Character.close(); });

      // 模式切换
      panel.querySelector('#clModeBtn').addEventListener('click', function() {
        MODES.forEach(function(m) { if (m) pageEl.classList.remove(m); });
        Character.currentMode = (Character.currentMode + 1) % MODES.length;
        if (MODES[Character.currentMode]) pageEl.classList.add(MODES[Character.currentMode]);
        this.textContent = MODE_LABELS[Character.currentMode];
        Character.saveMode();
        Character.renderList();
      });

      // 创建
      panel.querySelector('#clNewBtn').addEventListener('click', function() {
        if (App.charEdit) App.charEdit.open();
      });

      // 头像上传
      panel.querySelectorAll('.cl-avatar-box').forEach(function(box) {
        box.addEventListener('click', function(e) {
          e.stopPropagation();
          Character.uploadImage(box.dataset.id, 'avatar', box);
        });
      });

      // 封面上传
      panel.querySelectorAll('.cl-cover-box').forEach(function(box) {
        box.addEventListener('click', function() {
          Character.uploadImage(box.dataset.id, 'cover', box);
        });
      });

      // 世界书
      panel.querySelectorAll('.cl-wb-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var c = Character.getById(btn.dataset.id);
          if (!c) return;
          c.worldbookMounted = !c.worldbookMounted;
          Character.save();
          if (c.worldbookMounted) {
            btn.classList.add('mounted');
            btn.innerHTML = '<span class="plus-icon">' + BOOK_SVG + '</span>已挂载';
          } else {
            btn.classList.remove('mounted');
            btn.innerHTML = '<span class="plus-icon">' + BOOK_SVG + '</span>世界书';
          }
        });
      });

      // 编辑
      panel.querySelectorAll('.cl-act-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (App.charEdit) App.charEdit.open(btn.dataset.id);
        });
      });

      // 删除
      panel.querySelectorAll('.cl-act-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除这个角色？')) return;
          Character.list = Character.list.filter(function(c) { return c.id !== btn.dataset.id; });
          Character.save();
          Character.renderList();
          App.showToast('已删除');
        });
      });

      // 调色盘
      panel.querySelectorAll('.cl-change').forEach(function(ch) {
        var charId = ch.dataset.id;
        var card = ch.closest('.char-list-wrap');
        var popup = ch.querySelector('.cl-color-popup');

        ch.addEventListener('click', function(e) {
          e.stopPropagation();
          panel.querySelectorAll('.cl-color-popup').forEach(function(p) { if (p !== popup) p.classList.remove('show'); });
          popup.classList.toggle('show');
        });

        function readAndApply() {
          var c = Character.getById(charId);
          if (!c) return;
          var col = Character.getColors(c, mi);
          ch.querySelectorAll('.cl-cc').forEach(function(el) {
            col[el.dataset.key] = el.dataset.value;
          });
          col.line = parseFloat(ch.querySelector('.cl-cc-line').value);
          col.outer = parseFloat(ch.querySelector('.cl-cc-outer').value);
          ch.querySelector('.cl-line-val').textContent = col.line + 'px';
          ch.querySelector('.cl-outer-val').textContent = col.outer + 'px';
          Character.setColors(c, mi, col);
          Character.applyCardVars(card, col, mi);
          Character.save();
        }

        // 颜色块点击 → 打开自定义调色盘
        ch.querySelectorAll('.cl-cc').forEach(function(el) {
          el.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!App.openColorPicker) {
              App.showToast('调色盘未加载');
              return;
            }
            App.openColorPicker(el.dataset.value, function(hex) {
              el.dataset.value = hex;
              el.style.background = hex;
              readAndApply();
            });
          });
        });

        // 滑块
        ch.querySelector('.cl-cc-line').addEventListener('input', function(e) { e.stopPropagation(); readAndApply(); });
        ch.querySelector('.cl-cc-line').addEventListener('click', function(e) { e.stopPropagation(); });
        ch.querySelector('.cl-cc-outer').addEventListener('input', function(e) { e.stopPropagation(); readAndApply(); });
        ch.querySelector('.cl-cc-outer').addEventListener('click', function(e) { e.stopPropagation(); });

        // 重置
        ch.querySelector('.cl-popup-reset').addEventListener('click', function(e) {
          e.stopPropagation();
          var def = MODE_CFG[mi].defaults;
          ch.querySelectorAll('.cl-cc').forEach(function(el) {
            var k = el.dataset.key;
            if (def[k]) {
              el.dataset.value = def[k];
              el.style.background = def[k];
            }
          });
          ch.querySelector('.cl-cc-line').value = def.line;
          ch.querySelector('.cl-cc-outer').value = def.outer;
          readAndApply();
        });
      });

      // 点外面关闭
      panel.addEventListener('click', function() {
        panel.querySelectorAll('.cl-color-popup').forEach(function(p) { p.classList.remove('show'); });
      });
    },

    uploadImage: function(charId, field, box) {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      document.body.appendChild(input);
      input.onchange = function(e) {
        var file = e.target.files[0];
        document.body.removeChild(input);
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var src = ev.target.result;
          if (App.cropImage) {
            App.cropImage(src, function(cropped) {
              var c = Character.getById(charId);
              if (c) { c[field] = cropped; Character.save(); }
              box.innerHTML = '<img src="' + cropped + '">';
            });
          } else {
            var img = new Image();
            img.onload = function() {
              var canvas = document.createElement('canvas');
              var max = field === 'avatar' ? 256 : 600;
              var w = img.width, h = img.height;
              if (w > h) { if (w > max) { h = h * max / w; w = max; } }
              else { if (h > max) { w = w * max / h; h = max; } }
              canvas.width = w; canvas.height = h;
              canvas.getContext('2d').drawImage(img, 0, 0, w, h);
              var compressed = canvas.toDataURL('image/jpeg', 0.85);
              var c = Character.getById(charId);
              if (c) { c[field] = compressed; Character.save(); }
              box.innerHTML = '<img src="' + compressed + '">';
            };
            img.src = src;
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },

    init: function() {
      Character.load();
      if (!App.$('#charPanel')) {
        var panel = document.createElement('div');
        panel.id = 'charPanel';
        panel.style.display = 'none';
        document.body.appendChild(panel);
      }
      App.character = Character;
    }
  };

  App.register('character', Character);
})();

