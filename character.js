(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var MODES = ['', 'mode-frost', 'mode-mono'];
  var MODE_LABELS = ['①', '②', '③'];
  var BOOK_SVG = '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var DEFAULTS = {
    dark: '#111111',
    accent: '#88abda',
    bg: '#ffffff',
    line: 3
  };

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
      var modeClass = MODES[Character.currentMode] || '';

      var cardsHtml = '';
      if (!chars.length) {
        cardsHtml = '<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;letter-spacing:1px;">暂无角色，点击上方创建</div>';
      } else {
        cardsHtml = chars.map(function(c, i) {
          var idx = String(i + 1).padStart(2, '0');
          var name = App.esc(c.name || '未命名');
          var cd = c.cardDark || DEFAULTS.dark;
          var ca = c.cardAccent || DEFAULTS.accent;
          var cb = c.cardBg || DEFAULTS.bg;
          var cl = c.cardLine || DEFAULTS.line;

          var avatarHtml = c.avatar
            ? '<img src="' + App.esc(c.avatar) + '">'
            : '<div class="cl-avatar-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>UPLOAD</span></div>';
          var coverHtml = c.cover
            ? '<img src="' + App.esc(c.cover) + '">'
            : '<div class="cl-cover-empty"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>COVER</span></div>';

          var wbMounted = c.worldbookMounted ? true : false;
          var wbClass = wbMounted ? ' mounted' : '';
          var wbText = wbMounted ? '已挂载' : '世界书';

          var cardStyle = '--card-dark:' + cd + ';--card-accent:' + ca + ';--cw-bg:' + cb + ';--card-line:' + cl + 'px;';

          return '<div class="char-list-wrap" data-char-id="' + c.id + '" style="' + cardStyle + '">' +
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
                  '<div class="cl-color-custom">' +
                    '<div class="cl-color-custom-item"><input type="color" value="' + cd + '" class="cl-cc-dark"><label>深</label></div>' +
                    '<div class="cl-color-custom-item"><input type="color" value="' + ca + '" class="cl-cc-accent"><label>中</label></div>' +
                    '<div class="cl-color-custom-item"><input type="color" value="' + cb + '" class="cl-cc-bg"><label>底</label></div>' +
                  '</div>' +
                  '<div class="cl-line-row">' +
                    '<label>线条</label>' +
                    '<input type="range" min="1" max="5" value="' + cl + '" class="cl-cc-line">' +
                    '<span class="cl-line-val">' + cl + 'px</span>' +
                  '</div>' +
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
            '<div class="cl-mode-btn" id="clModeBtn">' + MODE_LABELS[Character.currentMode] + '</div>' +
            '<div class="cl-new-btn" id="clNewBtn">+ 创建</div>' +
          '</div>' +
          cardsHtml +
        '</div>';

      var pageEl = panel.querySelector('#clPageInner');

      // ESC
      panel.querySelector('#clEsc').addEventListener('click', function() { Character.close(); });

      // 模式切换
      panel.querySelector('#clModeBtn').addEventListener('click', function() {
        MODES.forEach(function(m) { if (m) pageEl.classList.remove(m); });
        Character.currentMode = (Character.currentMode + 1) % MODES.length;
        if (MODES[Character.currentMode]) pageEl.classList.add(MODES[Character.currentMode]);
        this.textContent = MODE_LABELS[Character.currentMode];
        Character.saveMode();
      });

      // 创建
      panel.querySelector('#clNewBtn').addEventListener('click', function() {
        if (App.charEdit) App.charEdit.open(null, Character.currentMode);
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
          if (App.charEdit) App.charEdit.open(btn.dataset.id, Character.currentMode);
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

      // change 调色（只对模式①生效）
      panel.querySelectorAll('.cl-change').forEach(function(ch) {
        var charId = ch.dataset.id;
        var card = ch.closest('.char-list-wrap');
        var popup = ch.querySelector('.cl-color-popup');

        ch.addEventListener('click', function(e) {
          e.stopPropagation();

          panel.querySelectorAll('.cl-color-popup').forEach(function(p) { if (p !== popup) p.classList.remove('show'); });
          popup.classList.toggle('show');
        });

        function applyColors() {
          var d = ch.querySelector('.cl-cc-dark').value;
          var a = ch.querySelector('.cl-cc-accent').value;
          var b = ch.querySelector('.cl-cc-bg').value;
          var l = ch.querySelector('.cl-cc-line').value;
          card.style.setProperty('--card-dark', d);
          card.style.setProperty('--card-accent', a);
          card.style.setProperty('--cw-bg', b);
          card.style.setProperty('--card-line', l + 'px');
          ch.querySelector('.cl-line-val').textContent = l + 'px';
          var c = Character.getById(charId);
          if (c) {
            c.cardDark = d;
            c.cardAccent = a;
            c.cardBg = b;
            c.cardLine = parseInt(l);
            Character.save();
          }
        }

        ch.querySelectorAll('input[type="color"]').forEach(function(inp) {
          inp.addEventListener('input', function(e) { e.stopPropagation(); applyColors(); });
          inp.addEventListener('click', function(e) { e.stopPropagation(); });
        });

        var lineInput = ch.querySelector('.cl-cc-line');
        if (lineInput) {
          lineInput.addEventListener('input', function(e) { e.stopPropagation(); applyColors(); });
          lineInput.addEventListener('click', function(e) { e.stopPropagation(); });
        }

        var resetBtn = ch.querySelector('.cl-popup-reset');
        if (resetBtn) {
          resetBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            ch.querySelector('.cl-cc-dark').value = DEFAULTS.dark;
            ch.querySelector('.cl-cc-accent').value = DEFAULTS.accent;
            ch.querySelector('.cl-cc-bg').value = DEFAULTS.bg;
            ch.querySelector('.cl-cc-line').value = DEFAULTS.line;
            applyColors();
          });
        }
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