(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  // grid总格数（3列x3行=9格，可改）
  var GRID_COLS = 3;
  var GRID_ROWS = 3;
  var GRID_TOTAL = GRID_COLS * GRID_ROWS;

  var Drag = {
    _editMode: false,
    _dragging: false,
    _dragEl: null,
    _ghost: null,
    _offsetX: 0,
    _offsetY: 0,
    _container: null,
    _selector: '',
    _lastSwap: 0,
    _touchId: null,

    load: function() {
      Drag._appOrder = App.LS.get('iconOrder') || [];
      Drag._dockOrder = App.LS.get('dockOrder') || [];
    },

    save: function() {
      App.LS.set('iconOrder', Drag._appOrder);
      App.LS.set('dockOrder', Drag._dockOrder);
    },

    // ====== 占位格子 ======
    fillGrid: function() {
      var grid = document.querySelector('#appGrid');
      if (!grid) return;

      // 清除旧占位
      grid.querySelectorAll('.grid-spacer').forEach(function(s) { s.remove(); });

      // 当前图标数
      var icons = grid.querySelectorAll('.app-icon');
      var count = icons.length;

      // 补齐到GRID_TOTAL
      var need = GRID_TOTAL - count;
      for (var i = 0; i < need; i++) {
        var spacer = document.createElement('div');
        spacer.className = 'app-icon grid-spacer';
        spacer.dataset.spacer = 'true';
        grid.appendChild(spacer);
      }
    },

    // ====== 顺序 ======
    applyOrder: function() {
      Drag._applyTo('#appGrid', '.app-icon:not(.grid-spacer)', Drag._appOrder);
      Drag._applyTo('#dockBar', '.dock-item', Drag._dockOrder);
    },

    _applyTo: function(cSel, iSel, order) {
      var c = document.querySelector(cSel);
      if (!c || !order.length) return;
      var map = {};
      c.querySelectorAll(iSel).forEach(function(el) {
        if (el.id) map[el.id] = el;
      });

      // 按保存的顺序重排，包括空位标记
      order.forEach(function(id) {
        if (id === '__spacer__') {
          // 插入占位
          var spacer = document.createElement('div');
          spacer.className = 'app-icon grid-spacer';
          spacer.dataset.spacer = 'true';
          c.appendChild(spacer);
        } else if (map[id]) {
          c.appendChild(map[id]);
          delete map[id];
        }
      });

      // 剩余未排序的追加
      Object.keys(map).forEach(function(id) {
        c.appendChild(map[id]);
      });
    },

    saveOrder: function() {
      var g = document.querySelector('#appGrid');
      var d = document.querySelector('#dockBar');
      Drag._appOrder = [];
      Drag._dockOrder = [];

      if (g) {
        g.querySelectorAll('.app-icon').forEach(function(el) {
          if (el.classList.contains('grid-spacer')) {
            Drag._appOrder.push('__spacer__');
          } else if (el.id) {
            Drag._appOrder.push(el.id);
          }
        });
      }

      if (d) {
        d.querySelectorAll('.dock-item').forEach(function(el) {
          if (el.id) Drag._dockOrder.push(el.id);
        });
      }

      Drag.save();
    },

    // ====== 编辑模式 ======
    enterEdit: function() {
      if (Drag._editMode) return;
      Drag._editMode = true;
      document.body.classList.add('drag-edit-active');

      Drag.fillGrid();

      document.querySelectorAll('#appGrid .app-icon, #dockBar .dock-item, #cardRow .bx-w').forEach(function(el) {
        el.classList.add('drag-mode');
      });

      if (App.pageSlider && App.pageSlider.disable) {
        App.pageSlider.disable();
      }

      if (navigator.vibrate) navigator.vibrate(30);
      Drag._showDone();
      App.showToast('拖拽换位 · 点击完成退出');
    },

    exitEdit: function() {
      if (!Drag._editMode) return;
      Drag._editMode = false;
      document.body.classList.remove('drag-edit-active');

      document.querySelectorAll('.drag-mode').forEach(function(el) {
        el.classList.remove('drag-mode');
      });

      // 清除末尾连续空位（保留中间的）
      Drag._trimSpacers();

      if (App.pageSlider && App.pageSlider.enable) {
        App.pageSlider.enable();
      }

      var btn = App.$('#dragDoneBtn');
      if (btn) btn.remove();

      Drag.saveOrder();
    },

    _trimSpacers: function() {
      var grid = document.querySelector('#appGrid');
      if (!grid) return;
      // 从末尾删除连续的spacer
      var children = Array.from(grid.children);
      for (var i = children.length - 1; i >= 0; i--) {
        if (children[i].classList.contains('grid-spacer')) {
          children[i].remove();
        } else {
          break;
        }
      }
    },

    _showDone: function() {
      var old = App.$('#dragDoneBtn');
      if (old) old.remove();
      var btn = document.createElement('button');
      btn.id = 'dragDoneBtn';
      btn.className = 'drag-done-btn';
      btn.textContent = '完成';
      btn.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        Drag.exitEdit();
      });
      document.body.appendChild(btn);
    },

    // ====== 拖拽 ======
    startDrag: function(el, container, selector, tx, ty) {
      Drag._dragging = true;
      Drag._dragEl = el;
      Drag._container = container;
      Drag._selector = selector;
      document.body.classList.add('drag-active');

      var r = el.getBoundingClientRect();
      Drag._offsetX = tx - r.left;
      Drag._offsetY = ty - r.top;

      var ghost = el.cloneNode(true);
      ghost.id = '';
      ghost.style.cssText =
        'position:fixed;z-index:99999;pointer-events:none;margin:0;' +
        'width:' + r.width + 'px;height:' + r.height + 'px;' +
        'left:' + r.left + 'px;top:' + r.top + 'px;' +
        'opacity:0.88;transform:scale(1.08);' +
        'filter:drop-shadow(0 8px 20px rgba(0,0,0,0.35));' +
        'animation:none;transition:none;';
      document.body.appendChild(ghost);
      Drag._ghost = ghost;

      el.style.opacity = '0.12';
      el.style.animation = 'none';

      if (navigator.vibrate) navigator.vibrate(12);
    },

    moveDrag: function(tx, ty) {
      if (!Drag._ghost) return;
      Drag._ghost.style.left = (tx - Drag._offsetX) + 'px';
      Drag._ghost.style.top = (ty - Drag._offsetY) + 'px';

      var now = Date.now();
      if (now - Drag._lastSwap < 180) return;

      // 找最近的（包括spacer）
      var items = Drag._container.querySelectorAll(Drag._selector);
      var best = null, bestDist = Infinity;
      for (var i = 0; i < items.length; i++) {
        if (items[i] === Drag._dragEl) continue;
        var r = items[i].getBoundingClientRect();
        // 只考虑可见的
        if (r.width === 0 && r.height === 0) continue;
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dist = Math.abs(tx - cx) + Math.abs(ty - cy);
        if (dist < bestDist) { bestDist = dist; best = items[i]; }
      }

      if (!best || best === Drag._dragEl) return;

      var allItems = Array.from(items);
      var fi = allItems.indexOf(Drag._dragEl);
      var ti = allItems.indexOf(best);
      if (fi === ti || fi === -1 || ti === -1) return;

      if (fi < ti) {
        Drag._container.insertBefore(Drag._dragEl, best.nextElementSibling);
      } else {
        Drag._container.insertBefore(Drag._dragEl, best);
      }
      Drag._lastSwap = now;
    },

    endDrag: function() {
      document.body.classList.remove('drag-active');
      if (Drag._ghost) { Drag._ghost.remove(); Drag._ghost = null; }
      if (Drag._dragEl) {
        Drag._dragEl.style.opacity = '';
        Drag._dragEl.style.animation = '';
        if (Drag._editMode) Drag._dragEl.classList.add('drag-mode');
        Drag._dragEl = null;
      }
      Drag._container = null;
      Drag._selector = '';
      Drag._dragging = false;
      Drag.saveOrder();
    },

    // ====== 全局touch ======
    _allContainers: [],

    _findItem: function(target) {
      for (var i = 0; i < Drag._allContainers.length; i++) {
        var c = Drag._allContainers[i];
        var item = target.closest(c.selector);
        if (item && c.el.contains(item)) {
          return { item: item, container: c.el, selector: c.selector };
        }
      }
      return null;
    },

    bindAll: function() {
      var pairs = [
        { sel: '#appGrid', item: '.app-icon' },
        { sel: '#dockBar', item: '.dock-item' },
        { sel: '#cardRow', item: '.bx-w' }
      ];

      Drag._allContainers = [];
      pairs.forEach(function(p) {
        var el = document.querySelector(p.sel);
        if (el) Drag._allContainers.push({ el: el, selector: p.item });
      });

      var pressTimer = null;
      var startX = 0, startY = 0;
      var pressTarget = null;

      document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.drag-done-btn')) return;
        if (e.target.closest('.pc-edit-overlay')) return;
        if (e.target.closest('.panel')) return;
        if (e.target.closest('.fullpage-panel')) return;
        if (e.target.closest('.ball-menu')) return;

        var found = Drag._findItem(e.target);
        if (!found) return;

        var touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        Drag._touchId = touch.identifier;
        pressTarget = found;

        if (Drag._editMode) {
          pressTimer = setTimeout(function() {
            pressTimer = null;
            Drag.startDrag(found.item, found.container, found.selector, touch.clientX, touch.clientY);
          }, 80);
        } else {
          pressTimer = setTimeout(function() {
            pressTimer = null;
            Drag.enterEdit();
          }, 500);
        }
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        var touch = null;
        for (var i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === Drag._touchId) {
            touch = e.touches[i]; break;
          }
        }
        if (!touch) return;

        var dx = Math.abs(touch.clientX - startX);
        var dy = Math.abs(touch.clientY - startY);

        if (pressTimer && (dx > 6 || dy > 6)) {
          clearTimeout(pressTimer);
          pressTimer = null;
          if (Drag._editMode && pressTarget && !Drag._dragging) {
            Drag.startDrag(pressTarget.item, pressTarget.container, pressTarget.selector, touch.clientX, touch.clientY);
          }
        }

        if (Drag._dragging) {
          e.preventDefault();
          Drag.moveDrag(touch.clientX, touch.clientY);
        }
      }, { passive: false });

      document.addEventListener('touchend', function(e) {
        if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
        pressTarget = null;
        Drag._touchId = null;
        if (Drag._dragging) {
          Drag.endDrag();
          e.preventDefault();
        }
      }, { passive: false });

      document.addEventListener('touchcancel', function() {
        if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
        pressTarget = null;
        Drag._touchId = null;
        if (Drag._dragging) Drag.endDrag();
      });

      document.addEventListener('contextmenu', function(e) {
        if (Drag._editMode || Drag._dragging) e.preventDefault();
      });
    },

    init: function() {
      Drag.load();
      setTimeout(function() {
        Drag.applyOrder();
        Drag.fillGrid();
        Drag.bindAll();
      }, 200);
    }
  };

  App.register('drag', Drag);
})();
