(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var BOOK_SVG = '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var MODE_CFG = [
    {
      defaults: { border: '#111111', accent: '#88abda', bg: '#ffffff', left: '#111111', line: 1, outer: 5 },
      controls: [
        { key: 'border', label: '框', cssVar: '--card-border-c' },
        { key: 'accent', label: '中', cssVar: '--card-accent' },
        { key: 'bg',     label: '底', cssVar: '--card-bg' },
        { key: 'left',   label: '左', cssVar: '--card-left' }
      ]
    }
  ];

  var Character = {
    list: [],
    _drag: { el: null, active: false, sx: 0, sy: 0, ox: 0, oy: 0 },

    load: function() {
      Character.list = App.LS.get('characterList') || [];
    },
    save: function() { App.LS.set('characterList', Character.list); },
    getById: function(id) {
      for (var i = 0; i < Character.list.length; i++) {
        if (Character.list[i].id === id) return Character.list[i];
      }
      return null;
    },

    getColors: function(c, mi) {
      if (!c.modeColors) c.modeColors = [{}];
      var saved = c.modeColors[0] || {};
      var def = MODE_CFG[0].defaults;
      var result = {};
      Object.keys(def).forEach(function(k) {
        result[k] = saved[k] !== undefined ? saved[k] : def[k];
      });
      return result;
    },

    setColors: function(c, mi, colors) {
      if (!c.modeColors) c.modeColors = [{}];
      c.modeColors[0] = colors;
    },

    applyCardVars: function(card, col) {
      var cfg = MODE_CFG[0];
      cfg.controls.forEach(function(ctrl) {
        card.style.setProperty(ctrl.cssVar, col[ctrl.key]);
      });
      card.style.setProperty('--card-line', col.line + 'px');
      card.style.setProperty('--card-outer', col.outer + 'px');
      card.style.setProperty('--card-bg', col.bg);
      card.style.setProperty('--card-left', col.left);
    },

    open: function() {
      if (App.archive) App.archive.open('char');
    },

    close: function() {
      if (App.archive) App.archive.close();
    },

    renderList: function() {
      var container = App.$('#archivePanelChar');
      if (container) Character.renderListInto(container);
    },

    renderListInto: function(container) {
      if (!container) return;
      Character.load();

      var chars = Character.list;
      var mi = 0;

      var cardsHtml = '';
      if (!chars.length) {
        cardsHtml = '<div class="cl-empty">暂无角色，点击上方创建</div>';
      } else {
        cardsHtml = chars.map(function(c, i) {
          var idx = String(i + 1).padStart(2, '0');
          var name = App.esc(c.name || '未命名');
          var avatarHtml = c.avatar ? '<img src="' + App.escAttr(c.avatar) + '">' : '<div class="cl-avatar-empty"></div>';
          var coverHtml = c.cover ? '<img src="' + App.escAttr(c.cover) + '">' : (c.avatar ? '<img src="' + App.escAttr(c.avatar) + '">' : '<div class="cl-cover-empty"></div>');
          var wbCount = (c.worldbookIds && c.worldbookIds.length) || 0;
          var wbMounted = wbCount > 0;
          var wbClass = wbMounted ? ' mounted' : '';
          var wbText = wbMounted ? '已加载' : '世界书';

          return '<div class="char-list-wrap" data-char-id="' + c.id + '">' +
            '<div class="cl-top-bar"></div>' +
            '<div class="cl-header">' +
              '<div class="cl-header-left"><h2>' + name + '</h2>' +
  (c.sign ? '<span class="cl-header-sign">' + App.esc(c.sign) + '</span>' : '') +
'</div>' +
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

      container.innerHTML = '<div class="cl-page-inner">' + cardsHtml + '</div>';

      // 配色弹窗
      var oldPopup = document.querySelector('#clColorPopup');
      if (oldPopup) oldPopup.remove();

      var popup = document.createElement('div');
      popup.id = 'clColorPopup';
      popup.className = 'cl-color-popup';
      var cfg = MODE_CFG[0];
      var popupColorsHtml = cfg.controls.map(function(ctrl) {
        var def = cfg.defaults;
        return '<div class="cl-color-custom-item">' +
          '<div class="cl-cc" data-key="' + ctrl.key + '" data-value="' + def[ctrl.key] + '" style="background:' + def[ctrl.key] + ';"></div>' +
          '<label>' + ctrl.label + '</label></div>';
      }).join('');
      popup.innerHTML =
        '<div class="cl-color-popup-title">自定义配色</div>' +
        '<div class="cl-color-custom" id="clPopupColors">' + popupColorsHtml + '</div>' +
        '<div class="cl-line-row"><label>内线</label><input type="range" min="1" max="5" step="0.5" value="' + cfg.defaults.line + '" class="cl-cc-line"><span class="cl-line-val">' + cfg.defaults.line + 'px</span></div>' +
        '<div class="cl-line-row"><label>外框</label><input type="range" min="0.5" max="6" step="0.5" value="' + cfg.defaults.outer + '" class="cl-cc-outer"><span class="cl-outer-val">' + cfg.defaults.outer + 'px</span></div>' +
        '<button class="cl-popup-reset" type="button">重置</button>';
      document.body.appendChild(popup);

      var activeCharId = null;
      var activeCard = null;

      container.querySelectorAll('.char-list-wrap').forEach(function(card) {
        var cid = card.dataset.charId;
        var c = Character.getById(cid);
        if (c) Character.applyCardVars(card, Character.getColors(c, 0));
      });

      container.querySelectorAll('.cl-avatar-box').forEach(function(box) {
        box.addEventListener('click', function(e) {
          e.stopPropagation();
          Character.uploadImage(box.dataset.id, 'avatar', box);
        });
      });

      container.querySelectorAll('.cl-cover-box').forEach(function(box) {
        box.addEventListener('click', function() {
          Character.uploadImage(box.dataset.id, 'cover', box);
        });
      });

      container.querySelectorAll('.cl-wb-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var c = Character.getById(btn.dataset.id);
          if (!c) return;
          if (!c.worldbookIds) c.worldbookIds = [];
          var wbBooks = [];
          if (App.worldbook && App.worldbook.books) wbBooks = App.worldbook.books;
          if (!wbBooks.length) { App.showToast('暂无世界书，请先创建'); return; }

          var old = App.$('#wbMountMenu');
          if (old) old.remove();

          var overlay = document.createElement('div');
          overlay.id = 'wbMountMenu';
          overlay.className = 'cl-overlay';

          var listHtml = wbBooks.map(function(b) {
            var checked = c.worldbookIds.indexOf(b.id) >= 0 ? ' checked' : '';
            var count = (b.entries || []).length;
            return '<label class="cl-wb-item">' +
              '<input type="checkbox" data-wbid="' + b.id + '"' + checked + '>' +
              '<div class="cl-wb-info">' +
                '<div class="cl-wb-name">' + App.esc(b.name || '未命名') + '</div>' +
                '<div class="cl-wb-count">' + count + ' 个条目</div>' +
              '</div>' +
            '</label>';
          }).join('');

          overlay.innerHTML =
            '<div class="cl-overlay-box">' +
              '<div class="cl-overlay-title">挂载世界书</div>' +
              '<div class="cl-overlay-body">' + listHtml + '</div>' +
              '<div class="cl-overlay-btns">' +
                '<button id="wbMountConfirm" type="button" class="cl-overlay-btn-primary">确定</button>' +
                '<button id="wbMountCancel" type="button" class="cl-overlay-btn-cancel">取消</button>' +
              '</div>' +
            '</div>';

          document.body.appendChild(overlay);
          overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
          overlay.querySelector('#wbMountCancel').addEventListener('click', function() { overlay.remove(); });
          overlay.querySelector('#wbMountConfirm').addEventListener('click', function() {
            var selected = [];
            overlay.querySelectorAll('input[data-wbid]').forEach(function(cb) {
              if (cb.checked) selected.push(cb.dataset.wbid);
            });
            c.worldbookIds = selected;
            c.worldbookMounted = selected.length > 0;
            Character.save();
            if (selected.length > 0) {
              btn.classList.add('mounted');
              btn.innerHTML = '<span class="plus-icon">' + BOOK_SVG + '</span>已加载';
            } else {
              btn.classList.remove('mounted');
              btn.innerHTML = '<span class="plus-icon">' + BOOK_SVG + '</span>世界书';
            }
            overlay.remove();
            App.showToast(selected.length ? '已加载 ' + selected.length + ' 本世界书' : '已取消挂载');
          });
        });
      });

      container.querySelectorAll('.cl-act-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (App.charMgr) App.charMgr.open(btn.dataset.id);
        });
      });

      container.querySelectorAll('.cl-del-text').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除这个角色？')) return;
          Character.list = Character.list.filter(function(c) { return c.id !== btn.dataset.id; });
          Character.save();
          Character.renderListInto(container);
          App.showToast('已删除');
        });
      });

      function openPopupFor(charId, card) {
        activeCharId = charId;
        activeCard = card;
        var c = Character.getById(charId);
        if (!c) return;
        var col = Character.getColors(c, 0);

        popup.querySelectorAll('.cl-cc').forEach(function(el) {
          var k = el.dataset.key;
          if (col[k]) { el.dataset.value = col[k]; el.style.background = col[k]; }
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
        var col = Character.getColors(c, 0);
        popup.querySelectorAll('.cl-cc').forEach(function(el) { col[el.dataset.key] = el.dataset.value; });
        col.line = parseFloat(popup.querySelector('.cl-cc-line').value);
        col.outer = parseFloat(popup.querySelector('.cl-cc-outer').value);
        popup.querySelector('.cl-line-val').textContent = col.line + 'px';
        popup.querySelector('.cl-outer-val').textContent = col.outer + 'px';
        Character.setColors(c, 0, col);
        Character.applyCardVars(activeCard, col);
        Character.save();
      }

      function previewOnly() {
        if (!activeCard || !activeCharId) return;
        var c = Character.getById(activeCharId);
        if (!c) return;
        var col = Character.getColors(c, 0);
        popup.querySelectorAll('.cl-cc').forEach(function(el) { col[el.dataset.key] = el.dataset.value; });
        col.line = parseFloat(popup.querySelector('.cl-cc-line').value);
        col.outer = parseFloat(popup.querySelector('.cl-cc-outer').value);
        Character.applyCardVars(activeCard, col);
      }

      container.querySelectorAll('.cl-change').forEach(function(ch) {
        ch.addEventListener('click', function(e) {
          e.stopPropagation();
          var charId = ch.dataset.id;
          var card = ch.closest('.char-list-wrap');
          if (popup.classList.contains('show') && activeCharId === charId) {
            popup.classList.remove('show'); activeCharId = null;
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
            el.dataset.value = hex; el.style.background = hex; readAndApply();
          }, function(hex) {
            el.dataset.value = hex; el.style.background = hex; previewOnly();
          });
        });
      });

      popup.querySelector('.cl-cc-line').addEventListener('input', function(e) { e.stopPropagation(); readAndApply(); });
      popup.querySelector('.cl-cc-line').addEventListener('click', function(e) { e.stopPropagation(); });
      popup.querySelector('.cl-cc-outer').addEventListener('input', function(e) { e.stopPropagation(); readAndApply(); });
      popup.querySelector('.cl-cc-outer').addEventListener('click', function(e) { e.stopPropagation(); });

      popup.querySelector('.cl-popup-reset').addEventListener('click', function(e) {
        e.stopPropagation();
        var def = MODE_CFG[0].defaults;
        popup.querySelectorAll('.cl-cc').forEach(function(el) {
          var k = el.dataset.key;
          if (def[k]) { el.dataset.value = def[k]; el.style.background = def[k]; }
        });
        popup.querySelector('.cl-cc-line').value = def.line;
        popup.querySelector('.cl-cc-outer').value = def.outer;
        readAndApply();
      });

      popup.addEventListener('touchstart', function(e) {
        var tag = e.target.tagName.toLowerCase();
        if (e.target.closest('.cl-cc') || e.target.closest('.cl-popup-reset') || tag === 'input' || tag === 'label') return;
        e.stopPropagation();
        var t = e.touches[0];
        var rect = popup.getBoundingClientRect();
        Character._drag = { el: popup, active: true, sx: t.clientX, sy: t.clientY, ox: rect.left, oy: rect.top };
      }, { passive: true });

      popup.addEventListener('click', function(e) { e.stopPropagation(); });
      popup.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: true });

      container.addEventListener('click', function() {
        if (App._cpJustClosed || App.$('#cpOverlay')) return;
        popup.classList.remove('show');
      });
    },

    uploadImage: function(charId, field, box) {
      var old = App.$('#imgSourceMenu');
      if (old) old.remove();

      var menu = document.createElement('div');
      menu.id = 'imgSourceMenu';
      menu.className = 'cl-overlay';
      menu.innerHTML =
        '<div class="cl-overlay-box cl-img-menu">' +
          '<div class="cl-overlay-title">选择图片来源</div>' +
          '<button id="imgFromAlbum" type="button" class="cl-img-btn">从相册选择</button>' +
          '<button id="imgFromUrl" type="button" class="cl-img-btn">输入图片URL</button>' +
          '<button id="imgFromDel" type="button" class="cl-img-btn cl-img-btn-del">删除图片</button>' +
          '<button id="imgFromCancel" type="button" class="cl-img-btn-cancel">取消</button>' +
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
        input.type = 'file'; input.accept = 'image/*';
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
        urlPanel.className = 'cl-overlay';
        urlPanel.innerHTML =
          '<div class="cl-overlay-box cl-url-box">' +
            '<div class="cl-overlay-title">输入图片URL</div>' +
            '<input id="imgUrlInput" type="text" placeholder="https://..." class="cl-url-input">' +
            '<div id="imgUrlPreview" class="cl-url-preview"><img></div>' +
            '<div class="cl-overlay-btns">' +
              '<button id="imgUrlConfirm" type="button" class="cl-overlay-btn-primary">确定</button>' +
              '<button id="imgUrlCancel" type="button" class="cl-overlay-btn-cancel">取消</button>' +
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
            previewImg.src = v; previewBox.style.display = 'block';
            previewImg.onerror = function() { previewBox.style.display = 'none'; };
          } else { previewBox.style.display = 'none'; }
        });

        urlPanel.querySelector('#imgUrlConfirm').addEventListener('click', function() {
          var url = urlPanel.querySelector('#imgUrlInput').value.trim();
          if (!url) { App.showToast('请输入URL'); return; }
          urlPanel.remove();
          var c = Character.getById(charId);
          if (c) { c[field] = url; Character.save(); }
          box.innerHTML = '<img src="' + App.escAttr(url) + '">';
          App.showToast('已设置');
        });
      });
    },

    _compressAndSet: function(src, charId, field, box) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var max = field === 'avatar' ? 512 : 1200;
        var w = img.width, h = img.height;
        if (w > h) { if (w > max) { h = h * max / w; w = max; } }
        else { if (h > max) { w = w * max / h; h = max; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        var compressed = canvas.toDataURL('image/jpeg', 0.92);
        var c = Character.getById(charId);
        if (c) { c[field] = compressed; Character.save(); }
        box.innerHTML = '<img src="' + compressed + '">';
      };
      img.src = src;
    },

    init: function() {
      Character.load();

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
      App.safeOn('#dockLong', 'click', function() { if (App.archive) App.archive.open('char'); });
    }
  };

  App.register('character', Character);
})();