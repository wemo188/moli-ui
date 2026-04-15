(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Character = {
    list: [],

    FIELDS: [
      { key: 'name', label: '名字' },
      { key: 'profile', label: '角色档案' },
      { key: 'dialogExamples', label: '示例对话' },
      { key: 'postInstruction', label: '后置指令' }
    ],

    load: function() { Character.list = App.LS.get('characterList') || []; },
    save: function() { App.LS.set('characterList', Character.list); },
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

      var cardsHtml = '';
      if (!chars.length) {
        cardsHtml = '<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;letter-spacing:1px;">暂无角色，点击上方创建</div>';
      } else {
        cardsHtml = chars.map(function(c, i) {
          var idx = String(i + 1).padStart(2, '0');
          var name = App.esc(c.name || '未命名');
          var savedDark = c.cardDark || '#111111';
          var savedAccent = c.cardAccent || '#88abda';
          var savedLight = c.cardLight || '#ffffff';
          var avatarHtml = c.avatar
            ? '<img src="' + App.esc(c.avatar) + '">'
            : '<div class="cl-avatar-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>UPLOAD</span></div>';
          var coverHtml = c.cover
            ? '<img src="' + App.esc(c.cover) + '">'
            : '<div class="cl-cover-empty"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>COVER</span></div>';
          var wbMounted = c.worldbookMounted ? true : false;
          var wbClass = wbMounted ? ' mounted' : '';
          var wbText = wbMounted ? '已挂载' : '世界书';
          var wbIconSvg = wbMounted
            ? '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

          return '<div class="char-list-wrap" data-char-id="' + c.id + '" style="--card-dark:' + savedDark + ';--card-accent:' + savedAccent + ';--card-light:' + savedLight + ';">' +
            '<div class="cl-top-bar"></div>' +
            '<div class="cl-header">' +
              '<div class="cl-header-left"><h2>' + name + '</h2></div>' +
              '<div class="cl-create-btn cl-wb-btn' + wbClass + '" data-id="' + c.id + '"><span class="plus-icon">' + wbIconSvg + '</span>' + wbText + '</div>' +
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
                  '<div class="cl-color-popup-title">配色方案</div>' +
                  '<div class="cl-color-presets">' +
                    '<div class="cl-color-preset" data-dark="#111111" data-accent="#88abda" data-light="#ffffff"><div class="cl-color-swatch" style="background:#111;"></div><div class="cl-color-swatch" style="background:#88abda;"></div><div class="cl-color-swatch" style="background:#fff;"></div></div>' +
                    '<div class="cl-color-preset" data-dark="#111111" data-accent="#f0f0f0" data-light="#ffffff"><div class="cl-color-swatch" style="background:#111;"></div><div class="cl-color-swatch" style="background:#f0f0f0;"></div><div class="cl-color-swatch" style="background:#fff;"></div></div>' +
                    '<div class="cl-color-preset" data-dark="#ffffff" data-accent="#a0a8b0" data-light="#f5f5f5"><div class="cl-color-swatch" style="background:#fff;border:1px solid #ddd;"></div><div class="cl-color-swatch" style="background:#a0a8b0;"></div><div class="cl-color-swatch" style="background:#f5f5f5;border:1px solid #ddd;"></div></div>' +
                  '</div>' +
                  '<div class="cl-color-custom">' +
                    '<div class="cl-color-custom-item"><input type="color" value="' + (c.cardDark || '#111111') + '" class="cl-cc-dark" data-id="' + c.id + '"><label>深</label></div>' +
                    '<div class="cl-color-custom-item"><input type="color" value="' + (c.cardAccent || '#88abda') + '" class="cl-cc-accent" data-id="' + c.id + '"><label>中</label></div>' +
                    '<div class="cl-color-custom-item"><input type="color" value="' + (c.cardLight || '#ffffff') + '" class="cl-cc-light" data-id="' + c.id + '"><label>浅</label></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="cl-bottom-bar"></div>' +
          '</div>';
        }).join('');
      }

      panel.innerHTML =
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:56px 16px 40px;background:#fff;">' +
          '<div class="cc-new-bar">' +
            '<div class="cl-esc" id="clEsc">ESC</div>' +
            '<div class="cc-new-main" id="ccNewBar">' +
              '<div class="cc-new-top"></div>' +
              '<div class="cc-new-body"><div class="cc-new-left"><div class="cc-new-icon">+</div><div class="cc-new-text"><div class="cc-new-title">创建角色</div><div class="cc-new-sub">new character</div></div></div></div>' +
              '<div class="cc-new-bottom"></div>' +
            '</div>' +
          '</div>' +
          cardsHtml +
        '</div>';

      panel.querySelector('#clEsc').addEventListener('click', function() { Character.close(); });
      panel.querySelector('#ccNewBar').addEventListener('click', function() {
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
          Character.renderList();
        });
      });

      panel.querySelectorAll('.cl-act-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (App.charEdit) App.charEdit.open(btn.dataset.id);
        });
      });

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

      panel.querySelectorAll('.cl-change').forEach(function(ch) {
        var charId = ch.dataset.id;
        var card = ch.closest('.char-list-wrap');
        var popup = ch.querySelector('.cl-color-popup');

        ch.addEventListener('click', function(e) {
          e.stopPropagation();
          panel.querySelectorAll('.cl-color-popup').forEach(function(p) { if (p !== popup) p.classList.remove('show'); });
          popup.classList.toggle('show');
        });

        function applyColors(dark, accent, light) {
          card.style.setProperty('--card-dark', dark);
          card.style.setProperty('--card-accent', accent);
          card.style.setProperty('--card-light', light);
          var c = Character.getById(charId);
          if (c) {
            c.cardDark = dark;
            c.cardAccent = accent;
            c.cardLight = light;
            c.cardColor = accent;
            Character.save();
          }
          ch.querySelector('.cl-cc-dark').value = dark;
          ch.querySelector('.cl-cc-accent').value = accent;
          ch.querySelector('.cl-cc-light').value = light;
        }

        ch.querySelectorAll('.cl-color-preset').forEach(function(p) {
          var savedD = Character.getById(charId);
          if (savedD && savedD.cardDark === p.dataset.dark && savedD.cardAccent === p.dataset.accent) {
            p.classList.add('active');
          }
          p.addEventListener('click', function(e) {
            e.stopPropagation();
            ch.querySelectorAll('.cl-color-preset').forEach(function(x) { x.classList.remove('active'); });
            p.classList.add('active');
            applyColors(p.dataset.dark, p.dataset.accent, p.dataset.light);
          });
        });

        ch.querySelector('.cl-cc-dark').addEventListener('input', function(e) {
          e.stopPropagation();
          ch.querySelectorAll('.cl-color-preset').forEach(function(x) { x.classList.remove('active'); });
          applyColors(this.value, ch.querySelector('.cl-cc-accent').value, ch.querySelector('.cl-cc-light').value);
        });
        ch.querySelector('.cl-cc-accent').addEventListener('input', function(e) {
          e.stopPropagation();
          ch.querySelectorAll('.cl-color-preset').forEach(function(x) { x.classList.remove('active'); });
          applyColors(ch.querySelector('.cl-cc-dark').value, this.value, ch.querySelector('.cl-cc-light').value);
        });
        ch.querySelector('.cl-cc-light').addEventListener('input', function(e) {
          e.stopPropagation();
          ch.querySelectorAll('.cl-color-preset').forEach(function(x) { x.classList.remove('active'); });
          applyColors(ch.querySelector('.cl-cc-dark').value, ch.querySelector('.cl-cc-accent').value, this.value);
        });
      });

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