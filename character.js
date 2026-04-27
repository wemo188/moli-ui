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
    _drag: { el: null, active: false, sx: 0, sy: 0, ox: 0, oy: 0 },

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

    /* ★ 修改：close 里清理 body 上残留的调色盘 popup */
    close: function() {
      var panel = App.$('#charPanel');
      if (!panel) return;
      var popup = document.querySelector('#clColorPopup');
      if (popup) popup.remove();
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
      setTimeout(function() { panel.style.display = 'none'; }, 350);
    },

    renderList: function() {
      var panel = App.$('#charPanel');
      if (!panel) return;

      var oldPopup = document.querySelector('#clColorPopup');
      if (oldPopup) oldPopup.remove();

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

          /* ★ 修改：img src 用 escAttr */
          var avatarHtml = c.avatar
            ? '<img src="' + App.escAttr(c.avatar) + '">'
            : '<div class="cl-avatar-empty"></div>';
          var coverHtml = c.cover
            ? '<img src="' + App.escAttr(c.cover) + '">'
            : '<div class="cl-cover-empty"></div>';

          var wbMounted = c.worldbookMounted ? true : false;
          var wbClass = wbMounted ? ' mounted' : '';
          var wbText = wbMounted ? '已挂载' : '世界书';

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
                '<div class="cl-act-btn cl-act-del"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6l1 14h12l1-14"/></svg><span class="cl-del-text" data-id="' + c.id + '">删除</span></div>' +
              '</div>' +
            '</div></div>' +
            '<div class="cl-footer">' +
              '<div class="cl-footer-left"><span class="cl-paw">🐾</span><span class="cl-footer-text">Character</span></div>' +
              '<div class="cl-change" data-id="' + c.id + '">' +
                '<div class="cl-change-dots"><div class="cl-change-dot"></div><div class="cl-change-dot"></div><div class="cl-change-dot"></div></div>' +
                '<span class="cl-change-label">change</span>' +
              '</div>' +
            '</div>' +
            '<div class="cl-bottom-bar"></div>' +
          '</div>';
        }).join('');
      }

      var cfg = MODE_CFG[mi];
      var popupColorsHtml = cfg.controls.map(function(ctrl) {
        var def = cfg.defaults;
        return '<div class="cl-color-custom-item">' +
          '<div class="cl-cc" data-key="' + ctrl.key + '" data-value="' + def[ctrl.key] + '" style="width:28px;height:28px;border-radius:8px;border:1.5px solid #ddd;background:' + def[ctrl.key] + ';cursor:pointer;-webkit-tap-highlight-color:transparent;"></div>' +
          '<label>' + ctrl.label + '</label></div>';
      }).join('');

      var popupHtml = '<div class="cl-color-popup" id="clColorPopup">' +
        '<div class="cl-color-popup-title">自定义配色</div>' +
        '<div class="cl-color-custom" id="clPopupColors">' + popupColorsHtml + '</div>' +
        '<div class="cl-line-row"><label>内线</label><input type="range" min="1" max="5" step="0.5" value="' + cfg.defaults.line + '" class="cl-cc-line"><span class="cl-line-val">' + cfg.defaults.line + 'px</span></div>' +
        '<div class="cl-line-row"><label>外框</label><input type="range" min="0.5" max="6" step="0.5" value="' + cfg.defaults.outer + '" class="cl-cc-outer"><span class="cl-outer-val">' + cfg.defaults.outer + 'px</span></div>' +
        '<button class="cl-popup-reset" type="button">重置</button>' +
      '</div>';

      panel.innerHTML =
        '<div class="cl-page' + (modeClass ? ' ' + modeClass : '') + '" id="clPageInner" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:56px 16px 40px;background:#fff;">' +
          '<div class="cl-topbar-wrap">' +
            '<div class="cl-esc" id="clEsc">ESC</div>' +
            '<div class="cl-mode-btn" id="clModeBtn">' + MODE_LABELS[mi] + '</div>' +
            '<div class="cl-new-btn" id="clNewBtn">+ 创建</div>' +
          '</div>' +
          cardsHtml +
        '</div>' +
        popupHtml;

      var pageEl = panel.querySelector('#clPageInner');

      var popup = panel.querySelector('#clColorPopup');
      document.body.appendChild(popup);

      var activeCharId = null;
      var activeCard = null;

      panel.querySelectorAll('.char-list-wrap').forEach(function(card) {
        var cid = card.dataset.charId;
        var c = Character.getById(cid);
        if (c) Character.applyCardVars(card, Character.getColors(c, mi), mi);
      });

      panel.querySelector('#clEsc').addEventListener('click', function() { Character.close(); });

      panel.querySelector('#clModeBtn').addEventListener('click', function() {
        MODES.forEach(function(m) { if (m) pageEl.classList.remove(m); });
        Character.currentMode = (Character.currentMode + 1) % MODES.length;
        if (MODES[Character.currentMode]) pageEl.classList.add(MODES[Character.currentMode]);
        this.textContent = MODE_LABELS[Character.currentMode];
        Character.saveMode();
        Character.renderList();
      });

      panel.querySelector('#clNewBtn').addEventListener('click', function() {
        if (App.charEdit) App.charEdit.open();
      });

      panel.querySelectorAll('.cl-avatar-box').forEach(function(box) {
        box.addEventListener('click', function(e) {
          e.stopPropagation();
          Character.uploadImage(box.dataset.id, 'avatar', box);
        });
      });

      panel.querySelectorAll('.cl-cover-box').forEach(function(box) {
        box.addEventListener('click', function() {
          Character.uploadImage(box.dataset.id, 'cover', box);
        });
      });

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

      panel.querySelectorAll('.cl-act-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (App.charEdit) App.charEdit.open(btn.dataset.id);
        });
      });

      panel.querySelectorAll('.cl-del-text').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除这个角色？')) return;
          Character.list = Character.list.filter(function(c) { return c.id !== btn.dataset.id; });
          Character.save();
          Character.renderList();
          App.showToast('已删除');
        });
      });

      function openPopupFor(charId, card) {
        activeCharId = charId;
        activeCard = card;
        var c = Character.getById(charId);
        if (!c) return;
        var col = Character.getColors(c, mi);

        popup.querySelectorAll('.cl-cc').forEach(function(el) {
          var k = el.dataset.key;
          if (col[k]) {
            el.dataset.value = col[k];
            el.style.background = col[k];
          }
        });

        var lineSlider = popup.querySelector('.cl-cc-line');
        var outerSlider = popup.querySelector('.cl-cc-outer');
        lineSlider.value = col.line;
        outerSlider.value = col.outer;
        popup.querySelector('.cl-line-val').textContent = col.line + 'px';
        popup.querySelector('.cl-outer-val').textContent = col.outer + 'px';

        popup.classList.add('show');

        requestAnimationFrame(function() {
          var cardRect = card.getBoundingClientRect();
          var popH = popup.offsetHeight;
          var left = cardRect.left + cardRect.width / 2 - 100;
          var top = cardRect.top - popH - 8;
          if (left < 8) left = 8;
          if (left + 200 > window.innerWidth - 8) left = window.innerWidth - 208;
          if (top < 60) top = 60;
          popup.style.left = left + 'px';
          popup.style.top = top + 'px';
        });
      }

      function readAndApply() {
        if (!activeCard || !activeCharId) return;
        var c = Character.getById(activeCharId);
        if (!c) return;
        var col = Character.getColors(c, mi);
        popup.querySelectorAll('.cl-cc').forEach(function(el) {
          col[el.dataset.key] = el.dataset.value;
        });
        col.line = parseFloat(popup.querySelector('.cl-cc-line').value);
        col.outer = parseFloat(popup.querySelector('.cl-cc-outer').value);
        popup.querySelector('.cl-line-val').textContent = col.line + 'px';
        popup.querySelector('.cl-outer-val').textContent = col.outer + 'px';
        Character.setColors(c, mi, col);
        Character.applyCardVars(activeCard, col, mi);
        Character.save();
      }

      function previewOnly() {
        if (!activeCard || !activeCharId) return;
        var c = Character.getById(activeCharId);
        if (!c) return;
        var col = Character.getColors(c, mi);
        popup.querySelectorAll('.cl-cc').forEach(function(el) {
          col[el.dataset.key] = el.dataset.value;
        });
        col.line = parseFloat(popup.querySelector('.cl-cc-line').value);
        col.outer = parseFloat(popup.querySelector('.cl-cc-outer').value);
        Character.applyCardVars(activeCard, col, mi);
      }

      panel.querySelectorAll('.cl-change').forEach(function(ch) {
        ch.addEventListener('click', function(e) {
          e.stopPropagation();
          var charId = ch.dataset.id;
          var card = ch.closest('.char-list-wrap');
          if (popup.classList.contains('show') && activeCharId === charId) {
            popup.classList.remove('show');
            activeCharId = null;
          } else {
            openPopupFor(charId, card);
          }
        });
      });

      popup.querySelectorAll('.cl-cc').forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!App.openColorPicker) return;
          App.openColorPicker(el.dataset.value, function(hex) {
            el.dataset.value = hex;
            el.style.background = hex;
            readAndApply();
          }, function(hex) {
            el.dataset.value = hex;
            el.style.background = hex;
            previewOnly();
          });
        });
      });

      popup.querySelector('.cl-cc-line').addEventListener('input', function(e) { e.stopPropagation(); readAndApply(); });
      popup.querySelector('.cl-cc-line').addEventListener('click', function(e) { e.stopPropagation(); });
      popup.querySelector('.cl-cc-outer').addEventListener('input', function(e) { e.stopPropagation(); readAndApply(); });
      popup.querySelector('.cl-cc-outer').addEventListener('click', function(e) { e.stopPropagation(); });

      popup.querySelector('.cl-popup-reset').addEventListener('click', function(e) {
        e.stopPropagation();
        var def = MODE_CFG[mi].defaults;
        popup.querySelectorAll('.cl-cc').forEach(function(el) {
          var k = el.dataset.key;
          if (def[k]) { el.dataset.value = def[k]; el.style.background = def[k]; }
        });
        popup.querySelector('.cl-cc-line').value = def.line;
        popup.querySelector('.cl-cc-outer').value = def.outer;
        readAndApply();
      });

      /* ★ 修改：空白处都可以拖动调色盘，排除颜色块、滑块、按钮 */
popup.addEventListener('touchstart', function(e) {
  var tag = e.target.tagName.toLowerCase();
  // 如果触摸的是颜色块、滑块、按钮、label，不触发拖拽
  if (e.target.closest('.cl-cc') || 
      e.target.closest('.cl-popup-reset') ||
      tag === 'input' || 
      tag === 'label') return;
  e.stopPropagation();
  var t = e.touches[0];
  var rect = popup.getBoundingClientRect();
  Character._drag = { el: popup, active: true, sx: t.clientX, sy: t.clientY, ox: rect.left, oy: rect.top };
}, { passive: true });

      popup.addEventListener('click', function(e) { e.stopPropagation(); });
      popup.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: true });

      pageEl.addEventListener('click', function() {
        if (App._cpJustClosed || App.$('#cpOverlay')) return;
        popup.classList.remove('show');
      });
    },

    uploadImage: function(charId, field, box) {
      var old = App.$('#imgSourceMenu');
      if (old) old.remove();

      var menu = document.createElement('div');
      menu.id = 'imgSourceMenu';
      menu.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
      menu.innerHTML =
        '<div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:10px;">' +
          '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;letter-spacing:1px;margin-bottom:4px;">选择图片来源</div>' +
          '<button id="imgFromAlbum" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;">从相册选择</button>' +
          '<button id="imgFromUrl" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;">输入图片URL</button>' +
          '<button id="imgFromDel" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:12px;font-weight:500;color:#bbb;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;">删除图片</button>' +
          '<button id="imgFromCancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>' +
        '</div>';
      document.body.appendChild(menu);

      menu.addEventListener('click', function(e) { if (e.target === menu) menu.remove(); });
      menu.querySelector('#imgFromCancel').addEventListener('click', function() { menu.remove(); });

      menu.querySelector('#imgFromDel').addEventListener('click', function() {
        menu.remove();
        var c = Character.getById(charId);
        if (c) { c[field] = ''; Character.save(); }
        if (field === 'avatar') box.innerHTML = '<div class="cl-avatar-empty"></div>';
        else box.innerHTML = '<div class="cl-cover-empty"></div>';
        App.showToast('已删除');
      });

      menu.querySelector('#imgFromAlbum').addEventListener('click', function() {
        menu.remove();
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
              Character._compressAndSet(src, charId, field, box);
            }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      });

      menu.querySelector('#imgFromUrl').addEventListener('click', function() {
        menu.remove();
        var urlPanel = document.createElement('div');
        urlPanel.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
        urlPanel.innerHTML =
          '<div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:12px;">' +
            '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;letter-spacing:1px;">输入图片URL</div>' +
            '<input id="imgUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">' +
            '<div id="imgUrlPreview" style="display:none;width:100%;height:120px;border-radius:8px;overflow:hidden;border:1px solid #eee;background:#f5f5f5;"><img style="width:100%;height:100%;object-fit:cover;display:block;"></div>' +
            '<div style="display:flex;gap:8px;">' +
              '<button id="imgUrlConfirm" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">确定</button>' +
              '<button id="imgUrlCancel" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(urlPanel);

        urlPanel.addEventListener('click', function(e) { if (e.target === urlPanel) urlPanel.remove(); });
        urlPanel.querySelector('#imgUrlCancel').addEventListener('click', function() { urlPanel.remove(); });

        var previewBox = urlPanel.querySelector('#imgUrlPreview');
        var previewImg = previewBox.querySelector('img');
        urlPanel.querySelector('#imgUrlInput').addEventListener('input', function() {
          var v = this.value.trim();
          if (v && (v.startsWith('http://') || v.startsWith('https://'))) {
            previewImg.src = v;
            previewBox.style.display = 'block';
            previewImg.onerror = function() { previewBox.style.display = 'none'; };
          } else {
            previewBox.style.display = 'none';
          }
        });

        urlPanel.querySelector('#imgUrlConfirm').addEventListener('click', function() {
          var url = urlPanel.querySelector('#imgUrlInput').value.trim();
          if (!url) { App.showToast('请输入URL'); return; }
          urlPanel.remove();
          var c = Character.getById(charId);
          if (c) { c[field] = url; Character.save(); }
          /* ★ 修改：URL 确认后 img src 用 escAttr */
          box.innerHTML = '<img src="' + App.escAttr(url) + '">';
          App.showToast('已设置');
        });
      });
    },

    _compressAndSet: function(src, charId, field, box) {
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
    },

    init: function() {
      Character.load();
      if (!App.$('#charPanel')) {
        var panel = document.createElement('div');
        panel.id = 'charPanel';
        panel.style.display = 'none';
        document.body.appendChild(panel);
      }

      document.addEventListener('touchmove', function(e) {
        var d = Character._drag;
        if (!d || !d.active || !d.el) return;
        e.preventDefault();
        var t = e.touches[0];
        d.el.style.left = (d.ox + t.clientX - d.sx) + 'px';
        d.el.style.top = (d.oy + t.clientY - d.sy) + 'px';
      }, { passive: false });
      document.addEventListener('touchend', function() {
        if (Character._drag) Character._drag.active = false;
      });

      App.character = Character;
    }
  };

  App.register('character', Character);
})();