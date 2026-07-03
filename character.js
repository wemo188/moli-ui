
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var MODES = ['', 'mode-frost', 'mode-mono'];
  var MODE_LABELS = ['样式一', '样式二', '样式三'];
  var BOOK_SVG = '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var UNIFIED_BACK = '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3.5" fill="none"/><path d="M36 20L24 32L36 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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
      panel.className = 'fullpage-panel hidden';
      panel.style.display = 'flex';
      Character.renderList();
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          panel.classList.remove('hidden');
          panel.classList.add('show');
        });
      });
      App.bindSwipeBack(panel, function() { Character.close(); });
    },

    close: function() {
      var panel = App.$('#charPanel');
      if (!panel) return;
      var popup = document.querySelector('#clColorPopup');
      if (popup) popup.remove();
      panel.classList.remove('show');
      panel.classList.add('hidden');
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

      // ====== 分类数据 ======
      var categories = App.LS.get('charCategories') || ['全部','现代','古代','玄幻','西幻'];
      var currentCat = Character._currentCat || '全部';
      var charCats = App.LS.get('charCatMap') || {}; // { charId: '现代', ... }

      //按分类过滤
      var filteredChars = chars;
      if (currentCat !== '全部') {
        filteredChars = chars.filter(function(c) { return charCats[c.id] === currentCat; });
      }

      // 生成分类导航
      var catNavHtml = '<div class="cl-cat-nav" id="clCatNav">';
      categories.forEach(function(cat) {
        var count = cat === '全部' ? chars.length : chars.filter(function(c) { return charCats[c.id] === cat; }).length;
        var activeClass = cat === currentCat ? ' cl-cat-active' : '';
        catNavHtml += '<div class="cl-cat-item' + activeClass + '" data-cat="' + App.escAtr(cat) + '">' +
          '<div class="cl-cat-stamp"><span class="cl-cat-stamp-text">' + count + '</span></div>' +
          '<span class="cl-cat-label">' + App.esc(cat) + '</span></div>';
      });
      catNavHtml += '<div class="cl-cat-item" data-cat="__add__">' +
        '<div class="cl-cat-stamp"><span class="cl-cat-stamp-text">＋</span></div>' +
        '<span class="cl-cat-label">添加</span></div>';
      catNavHtml += '</div>';

      var cardsHtml = '';
      if (!filteredChars.length) {
        cardsHtml = '<div style="padding:60px 20px;text-align:center;color:#bb;font-size:13px;letter-spacing:1px;">暂无角色</div>';
      } else {
        cardsHtml = filteredChars.map(function(c, i) {
          var idx = String(i + 1).padStart(2, '0');
          var name = App.esc(c.name || '未命名');
          var coverSrc = c.avatar || c.cover || '';
          var coverHtml = coverSrc ? '<img src="' + App.escAttr(coverSrc) + '">' : '<div class="cl-cover-empty"></div>';
          var wbCount = (c.worldbookIds && c.worldbookIds.length) || 0;
          var wbMounted = wbCount > 0;
          var wbClass = wbMounted ? ' mounted' : '';
          var wbText = wbMounted ? '已加载' : '世界书';

          return '<div class="char-list-wrap" data-char-id="' + c.id + '">' +
            '<div class="cl-select-check"></div>' +
            '<div class="cl-top-bar"></div>' +
            '<div class="cl-header">' +
              '<div class="cl-header-left"><h2>' + name + '</h2></div>' +
              '<div class="cl-create-btn cl-wb-btn' + wbClass + '" data-id="' + c.id + '"><span class="plus-icon">' + BOOK_SVG + '</span>' + wbText + '</div>' +
            '</div>' +
            '<div class="cl-body"><div class="cl-item">' +
              '<div class="cl-item-index">' + idx + '</div>' +
              '<div class="cl-item-main">' +
                '<div class="cl-cover">' + coverHtml + '</div>' +
              '</div>' +
              '<div class="cl-actions">' +
                '<div class="cl-act-btn cl-act-edit" data-id="' + c.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5l3 3L12 15H9v-3z"/></svg>编辑</div>' +
                '<div class="cl-act-btn cl-act-bind" data-id="' + c.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>绑定</div>' +
                '<div class="cl-act-btn cl-act-del"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6l1 14h12l1-14"/></svg><span class="cl-del-text" data-id="' + c.id + '">删除</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="cl-footer">' +
              '<div class="cl-footer-left"><span class="cl-footer-text">Character</span></div>' +
              '<div class="cl-change" data-id="' + c.id + '">' +
                '<div class="cl-change-dots"><div class="cl-change-dot"></div><div class="cl-change-dot"></div><div class="cl-change-dot"></div>' +
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
        return '<div class="cl-color-customitem">' +
          '<div class="cl-cc" data-key="' + ctrl.key + '" data-value="' + def[ctrl.key] + '" style="width:28px;height:28px;border-radius:8px;border:1.5px solid #dd;background:' + def[ctrl.key] + ';cursor:pointer;-webkit-tap-highlight-color:transparent;"></div>' +
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
       '<div class="cl-page + (modeClass ? ' ' + modeClass : '') + '" id="clPageIner">' +
        '<div class="cl-topbar-wrap">' +
          '<div class="cl-esc" id="clEsc">' + UNIFIED_BACK + '</div>' +
          '<div class="cl-mode-center" id="clModeCenter"><span class="cl-mode-label" id="clModeLabel">' + MODE_LABELS[mi] + '</span><span class="cl-paw-toggle" id="clPawToggle">🐾</span></div>' +
          '<div class="cl-new-btn" id="clNewBtn">+ 创建</div>' +
        '</div>' +
        '<div id="clMultiBar" style="display:none;"></div>' +
        catNavHtml +
        cardsHtml +
        '</div>' +
        popupHtml;

      var pageEl = panel.querySelector('#clPageInner');

      var popup = panel.querySelector('#clColorPopup');
      document.body.appendChild(popup);

      var activeCharId = null;
      var activeCard = null;

      // 多选状态
      var multiMode = false;
      var selectedIds = [];

      panel.querySelectorAll('.char-list-wrap').forEach(function(card) {
        var cid = card.dataset.charId;
        var c = Character.getById(cid);
        if (c) Character.aplyCardVars(card, Character.getColors(c, mi), mi);
      });

      // ====== 分类导航事件 ======
      panel.querySelectorAll('.cl-cat-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var cat = item.dataset.cat;
          if (cat === '__add__') {
            var newCat = prompt('输入新分类名称');
            if (!newCat || !newCat.trim()) return;
            newCat = newCat.trim();
            if (categories.indexOf(newCat) >= 0) { App.showToast('分类已存在'); return; }
            categories.push(newCat);
            App.LS.set('charCategories', categories);
            Character._currentCat = newCat;
            Character.renderList();
            App.showToast('已添加：' + newCat);
            return;
          }
          Character._currentCat = cat;
          Character.renderList();
        });

        // 长按分类可删除（了"全部"）
        var catLpTimer = null;
        item.addEventListener('touchstart', function(e) {
          var cat = item.dataset.cat;
          if (cat === '全部' || cat === '__add__') return;
          catLpTimer = setTimeout(function() {
            catLpTimer = null;
            if (confirm('删除分类「' + cat + '」？（角色不会被删除）')) {
              categories = categories.filter(function(c) { return c !== cat; });
              App.LS.set('charCategories', categories);
              if (Character._currentCat === cat) Character._currentCat = '全部';
              Character.renderList();
              App.showToast('已删除分类');
            }
          }, 600);
        }, { passive: true });
        item.addEventListener('touchend', function() { if (catLpTimer) { clearTimeout(catLpTimer); catLpTimer = null; });
        item.addEventListener('touchmove', function() { if (catLpTimer) { clearTimeout(catLpTimer); catLpTimer = null; } });
      });

      // ==== 长按角色卡片 ======
      panel.querySelectorAll('.char-list-wrap').forEach(function(card) {
        var lpTimer = null;
        var moved = false;

        card.addEventListener('touchstart', function(e) {
          moved = false;
          lpTimer = setTimeout(function() {
            lpTimer = null;
            if (multiMode) return;
            Character._showContextMenu(card, e);
          }, 500);
        }, { passive: true });

        card.addEventListener('touchmove', function() {
          moved = true;
          if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
        });

        card.addEventListener('touchend', function() {
          if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
          // 多选模式下点击切换选中
          if (multiMode && !moved) {
            var cid = card.dataset.charId;
            var idx = selectedIds.indexOf(cid);
            if (idx >= 0) { selectedIds.splice(idx, 1); card.classList.remove('cl-selected'); }
            else { selectedIds.push(cid); card.classList.add('cl-selected'); }
            Character._updateMultiBar(panel, selectedIds);
          }
        });
      });

      // ====== 多选栏方法 ======
      Character._enterMultiMode = function() {
        multiMode = true;
        selectedIds = [];
        panel.querySelectorAll('.char-list-wrap').forEach(function(c) { c.classList.add('cl-ms-mode'); c.classList.remove('cl-selected'); });
        Character._updateMultiBar(panel, selectedIds);
        panel.querySelector('#clMultiBar').style.display = '';
      };

      Character._exitMultiMode = function() {
        multiMode = false;
        selectedIds = [];
        panel.querySelectorAll('.char-list-wrap').forEach(function(c) { c.classList.remove('cl-ms-mode'); c.classList.remove('cl-selected'); });
        panel.querySelector('#clMultiBar').style.display = 'none';
      };

      Character._updateMultiBar = function(panel, ids) {
        var bar = panel.querySelector('#clMultiBar');
        if (!bar) return;
        bar.innerHTML =
          '<div class="cl-multiselect-bar">' +
            '<div class="cl-ms-left">' +
              '<span class="cl-ms-close" id="clMsClose">✕</span>' +
              '<span class="cl-ms-count">已选 ' + ids.length + ' 个</span>' +
            '</div>' +
            '<div class="cl-ms-actions">' +
              '<button class="cl-ms-btn" id="clMsMove" type="button">移动分组</button>' +
              '<button class="cl-ms-btn cl-ms-btn-danger" id="clMsDel" type="button">删除</button>' +
            '</div>' +
          '</div>';
        bar.style.display = '';

        bar.querySelector('#clMsClose').addEventListener('click', function() { Character._exitMultiMode(); });

        bar.querySelector('#clMsMove').addEventListener('click', function() {
          if (!ids.length) { App.showToast('请先选择角色'); return; }
          var cats = App.LS.get('charCategories') || ['全部','现代','古代','玄幻','西幻'];
          var moveHtml = cats.filter(function(c) { return c !== '全部'; }).map(function(c) {
            return '<div class="cl-context-item" data-mcat="' + App.escAttr(c) + '">' + App.esc(c) + '</div>';
          }).join(');
          var overlay = document.createElement('div');
          overlay.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
          overlay.innerHTML = '<div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);webkit-backdrop-filter:blur(12px);border:2px solid #111;border-radius:8px;min-width:180px;box-shadow:4px 4px 0 #111;"><div style="padding:12px 18px;font-size:14px;font-weight:800;border-bottom:1.5px solid #ee;letter-spacing:1px;">移动到分组</div>' + moveHtml + '<div class="cl-context-item" style="color:#999;" id="clMoveCancel">取消</div></div>';
          document.body.appendChild(overlay);
          overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
          overlay.querySelector('#clMoveCancel').addEventListener('click', function() { overlay.remove(); });
          overlay.querySelectorAll('[data-mcat]').forEach(function(btn) {
            btn.addEventListener('click', function() {
              var cat = btn.dataset.mcat;
              var charCats = App.LS.get('charCatMap') || {};
              ids.forEach(function(id) { charCats[id] = cat; });
              App.LS.set('charCatMap', charCats);
              overlay.remove();
              Character._exitMultiMode();
              Character.renderList();
              App.showToast(ids.length + ' 个角色已移动到「' + cat + '」');
            });
          });
        });

        bar.querySelector('#clMsDel').addEventListener('click', function() {
          if (!ids.length) { App.showToast('请先选择角色'); return; }
          if (!confirm('确定删除选中的 ' + ids.length + ' 个角色？')) return;
          Character.list = Character.list.filter(function(c) { return ids.indexOf(c.id) < 0; });
          Character.save();
          Character._exitMultiMode();
          Character.renderList();
          App.showToast('已删除 ' + ids.length + ' 个角色');
        });
      };

      panel.querySelector('#clEsc').addEventListener('click', function() { Character.close(); });

      panel.querySelector('#clPawToggle').addEventListener('click', function() {
        MODES.forEach(function(m) { if (m) pageEl.classList.remove(m); });
        Character.currentMode = (Character.currentMode + 1) % MODES.length;
        if (MODES[Character.currentMode]) pageEl.classList.add(MODES[Character.currentMode]);
        panel.querySelector('#clModeLabel').textContent = MODE_LABELS[Character.currentMode];
        Character.saveMode();
        Character.renderList();});

      panel.querySelector('#clNewBtn').addEventListener('click', function() {
        if (App.charMgr) App.charMgr.open();
      });

      // 以下是原来的事件绑定（世界书、编辑、绑定、删除、change调色盘等），保持不变
      panel.querySelectorAll('.cl-wb-btn').forEach(function(btn) {
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
          overlay.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
          var listHtml = wbBooks.map(function(b) {
            var checked = c.worldbookIds.indexOf(b.id) >= 0 ? ' checked' : '';
            var count = (b.entries || []).length;
            return '<label style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #f0f0f0;cursor:pointer;-webkit-tap-highlight-color:transparent;"><input type="checkbox" data-wbid="' + b.id + '"' + checked + ' style="width:18px;height:18px;accent-color:#111;"><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:700;color:#333overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + App.esc(b.name || '未命名') + '</div><div style="font-size:12px;color:#aa;margin-top:2px;">' + count + ' 个条目</div></div></label>';
          }).join('');
          overlay.innerHTML = '<div style="background:rgba(255,255,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;width:300px;max-height:70vh;box-shadow:0 8px 30px rgba(0,0,0.15);display:flex;flex-direction:column;overflow:hidden;"><div style="padding:16px 1812px;border-bottom:1.5px solid #eee;font-size:15px;font-weight:800;color:#111;letter-spacing:1px;text-align:center;">挂载世界书</div><div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;">' + listHtml + '</div><div style="display:flex;gap:8px;padding:12px 16px;border-top:1.5px solid #eee;"><button id="wbMountConfirm" type="button" style="flex:1;padding:11px;background:#111;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:1px;">确定</button><button id="wbMountCancel" type="button" style="flex:1;padding:11px;background:#fff;color:#666;border:1.5px solid #dd;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button></div></div>';
          document.body.appendChild(overlay);
          overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
          overlay.querySelector('#wbMountCancel').addEventListener('click', function() { overlay.remove(); });
          overlay.querySelector('#wbMountConfirm').addEventListener('click', function() {
            var selected = [];
            overlay.querySelectorAll('input[data-wbid]').forEach(function(cb) { if (cb.checked) selected.push(cb.dataset.wbid); });
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

      panel.querySelectorAll('.cl-act-bind').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var charId = btn.dataset.id;
          if (!App.user) { App.showToast('用户模块未加载'); return; }
          App.user.load();
          var users = App.user.list;
          if (!users.length) { App.showToast('请先创建用户身份'); return; }
          var bindings = App.LS.get('charUserBindings') || {};
          var picker = document.createElement('div');
          picker.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
          var listHtml = users.map(function(u) {
            var isBound = bindings[charId] === u.id;
            return '<div class="bind-user" data-uid="' + u.id + '" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.04);-webkit-tap-highlight-color:transparent;"><span style="font-size:14px;color:#333;">' + App.esc(u.nickname || u.realName || '未命名') + '</span>' + (isBound ? '<span style="font-size:11px;color:#7a9ab8;font-weight:700;">当前绑定</span>' : '') + '</div>';
          }).join('');
          picker.innerHTML = '<div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;width:280px;max-height:60vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,0.15);"><div style="padding:16px 18px 12px;border-bottom:1.5px solid #eee;font-size:15px;font-weight:800;color:#111;letter-spacing:1px;text-align:center;">绑定用户</div>' + listHtml + '<div style="padding:12px 16px;border-top:1.5px solid #eee;text-align:center;"><button id="bindCancel" type="button" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:inherit;">取消</button></div></div>';
          document.body.appendChild(picker);
          picker.addEventListener('click', function(ev) { if (ev.target === picker) picker.remove(); });
          picker.querySelector('#bindCancel').addEventListener('click', function() { picker.remove(); });
          picker.querySelectorAll('.bind-user').forEach(function(item) {
            item.addEventListener('click', function() {
              var uid = item.dataset.uid;
              picker.remove();
              bindings[charId] = uid;
              App.LS.set('charUserBindings', bindings);
              var u = App.user.getById(uid);
              App.showToast('已绑定：' + (u ? (u.nickname || u.realName || '未命名') : uid));
            });
          });
        });
      });

      panel.querySelectorAll('.cl-act-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (App.charMgr) App.charMgr.open(btn.dataset.id);
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

      // ====== 调色盘逻辑 ======
      function openPopupFor(charId, card) {
        activeCharId = charId;
        activeCard = card;
        var c = Character.getById(charId);
        if (!c) return;
        var col = Character.getColors(c, mi);
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

      function readAndAply() {
        if (!activeCard || !activeCharId) return;
        var c = Character.getById(activeCharId);
        if (!c) return;
        var col = Character.getColors(c, mi);
        popup.querySelectorAll('.cl-cc').forEach(function(el) { col[el.dataset.key] = el.dataset.value; });
        col.line = parseFloat(popup.querySelector('.cl-cc-line').value);
        col.outer = parseFloat(popup.querySelector('.cl-cc-outer').value);
        popup.querySelector('.cl-line-val').textContent = col.line + 'px';
        popup.querySelector('.cl-outer-val').textContent = col.outer + 'px';
        Character.setColors(c, mi, col);
        Character.aplyCardVars(activeCard, col, mi);
        Character.save();
      }

      function previewOnly() {
        if (!activeCard || !activeCharId) return;
        var c = Character.getById(activeCharId);
        if (!c) return;
        var col = Character.getColors(c, mi);
        popup.querySelectorAll('.cl-cc').forEach(function(el) { col[el.dataset.key] = el.dataset.value; });
        col.line = parseFloat(popup.querySelector('.cl-cc-line').value);
        col.outer = parseFloat(popup.querySelector('.cl-cc-outer').value);
        Character.aplyCardVars(activeCard, col, mi);
      }

      panel.querySelectorAll('.cl-change').forEach(function(ch) {
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

      popup.querySelector('.cl-cc-line').addEventListener('input', function(e) { e.stopPropagation(); readAndAply(); });
      popup.querySelector('.cl-cc-line').addEventListener('click', function(e) { e.stopPropagation(); });
      popup.querySelector('.cl-cc-outer').addEventListener('input', function(e) { e.stopPropagation(); readAndAply(); });
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

      pageEl.addEventListener('click', function() {
        if (App._cpJustClosed || App.$('#cpOverlay')) return;
        popup.classList.remove('show');
      });
    },

    // ====== 长按右键菜单 ======
    _showContextMenu: function(card, e) {
      var old = document.querySelector('.cl-context-menu');
      if (old) old.remove();

      var charId = card.dataset.charId;
      var touch = e.touches ? e.touches[0] : e;
      var x = touch.clientX;
      var y = touch.clientY;

      var menu = document.createElement('div');
      menu.className = 'cl-context-menu';
      menu.innerHTML =
        '<div class="cl-context-item" data-act="multi">多选</div>' +
        '<div class="cl-context-item" data-act="move">移动分组</div>' +
        '<div class="cl-context-item" data-act="edit">编辑</div>' +
        '<div class="cl-context-item cl-ctx-danger" data-act="del">删除</div>';

      document.body.appendChild(menu);

      // 定位
      var mw = menu.offsetWidth;
      var mh = menu.offsetHeight;
      if (x + mw > window.innerWidth - 10) x = window.innerWidth - mw - 10;
      if (y + mh > window.innerHeight - 10) y = window.innerHeight - mh - 10;
      if (x < 10) x = 10;
      if (y < 10) y = 10;
      menu.style.left = x + 'px';
      menu.style.top = y + 'px';

      // 点击外部关闭
      function closeMenu() { if (menu.parentNode) menu.remove(); document.removeEventListener('click', closeMenu); }
      setTimeout(function() { document.addEventListener('click', closeMenu); }, 10);

      menu.querySelectorAll('.cl-context-item').forEach(function(item) {
        item.addEventListener('click', function(ev) {
          ev.stopPropagation();
          menu.remove();
          var act = item.dataset.act;

          if (act === 'multi') {
            Character._enterMultiMode();
            // 自动选中当前这张卡
            card.classList.add('cl-selected');
            var panel = App.$('#charPanel');
            Character._updateMultiBar(panel, [charId]);
          } else if (act === 'move') {
            var categories = App.LS.get('charCategories') || ['全部','现代','古代','玄幻','西幻'];
            var cats = categories.filter(function(c) { return c !== '全部'; });
            var moveHtml = cats.map(function(c) {
              return '<div class="cl-context-item" data-mcat="' + App.escAttr(c) + '">' + App.esc(c) + '</div>';
            }).join('');
            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
            overlay.innerHTML = '<div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:2px solid #111;border-radius:8px;min-width:180px;box-shadow:4px 4px 0 #111;"><div style="padding:12px 18px;font-size:14px;font-weight:800;border-bottom:1.5px solid #ee;letter-spacing:1px;">移动到分组</div>' + moveHtml + '<div class="cl-context-item" style="color:#999;" id="clMvCancel">取消</div></div>';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', function(e2) { if (e2.target === overlay) overlay.remove(); });
            overlay.querySelector('#clMvCancel').addEventListener('click', function() { overlay.remove(); });
            overlay.querySelectorAll('[data-mcat]').forEach(function(btn) {
              btn.addEventListener('click', function() {
                var cat = btn.dataset.mcat;
                var charCats = App.LS.get('charCatMap') || {};
                charCats[charId] = cat;
                App.LS.set('charCatMap', charCats);
                overlay.remove();
                Character.renderList();
                App.showToast('已移动到「' + cat + '」');
              });
            });
          } else if (act === 'edit') {
            if (App.charMgr) App.charMgr.open(charId);
          } else if (act === 'del') {
            if (!confirm('确定删除？')) return;
            Character.list = Character.list.filter(function(c) { return c.id !== charId; });
            Character.save();
            Character.renderList();
            App.showToast('已删除');
          }
        });
      });
    },

      function openPopupFor(charId, card) {
        activeCharId = charId;
        activeCard = card;
        var c = Character.getById(charId);
        if (!c) return;
        var col = Character.getColors(c, mi);

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
        var col = Character.getColors(c, mi);
        popup.querySelectorAll('.cl-cc').forEach(function(el) { col[el.dataset.key] = el.dataset.value; });
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
        popup.querySelectorAll('.cl-cc').forEach(function(el) { col[el.dataset.key] = el.dataset.value; });
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
        var def = MODE_CFG[mi].defaults;
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

      pageEl.addEventListener('click', function() {
        if (App._cpJustClosed || App.$('#cpOverlay')) return;
        popup.classList.remove('show');
      });
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
      App.safeOn('#iconChar', 'click', function() { Character.open(); });
    }
  };

  App.register('character', Character);
})();
      