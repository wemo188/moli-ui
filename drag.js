(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Drag = {
    _editMode: false,
    _dragging: false,
    _dragEl: null,
    _ghost: null,
    _offsetX: 0,
    _offsetY: 0,
    _touchId: null,
    _positions: {},
    _dockOrder: [],

    load: function() {
      Drag._positions = App.LS.get('dragPositions') || {};
      Drag._dockOrder = App.LS.get('dockOrder') || [];
    },

    save: function() {
      App.LS.set('dragPositions', Drag._positions);
      App.LS.set('dockOrder', Drag._dockOrder);
    },

    applyPositions: function() {
      Object.keys(Drag._positions).forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        var pos = Drag._positions[id];
        var parent = el.parentElement;
        if (!parent) return;
        if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
        el.style.position = 'absolute';
        el.style.left = pos.x + 'px';
        el.style.top = pos.y + 'px';
        el.style.zIndex = '2';
      });
    },

    applyDockOrder: function() {
      var dock = App.$('#dockBar');
      if (!dock || !Drag._dockOrder.length) return;
      var map = {};
      dock.querySelectorAll('.dock-item').forEach(function(el) { if (el.id) map[el.id] = el; });
      Drag._dockOrder.forEach(function(id) { if (map[id]) dock.appendChild(map[id]); });
    },

    saveDockOrder: function() {
      var dock = App.$('#dockBar');
      if (!dock) return;
      Drag._dockOrder = [];
      dock.querySelectorAll('.dock-item').forEach(function(el) { if (el.id) Drag._dockOrder.push(el.id); });
    },

    // ====== 编辑模式 ======
    enterEdit: function() {
      if (Drag._editMode) return;
      Drag._editMode = true;
      document.body.classList.add('drag-edit-active');

      Drag._getAllDraggables().forEach(function(el) {
        // 只给小图标加抖动，大卡片加虚线提示
        if (el.closest('.app-icon') || el.closest('.dock-item')) {
          el.classList.add('drag-mode');
        } else {
          el.classList.add('drag-mode-outline');
        }
      });

      if (App.pageSlider && App.pageSlider.disable) App.pageSlider.disable();
      if (navigator.vibrate) navigator.vibrate(30);
      Drag._showDone();
      App.showToast('拖拽到任意位置 · 点完成退出');
    },

    exitEdit: function() {
      if (!Drag._editMode) return;
      Drag._editMode = false;
      document.body.classList.remove('drag-edit-active');
      document.querySelectorAll('.drag-mode, .drag-mode-outline').forEach(function(el) {
        el.classList.remove('drag-mode');
        el.classList.remove('drag-mode-outline');
      });
      if (App.pageSlider && App.pageSlider.enable) App.pageSlider.enable();
      var btn = App.$('#dragDoneWrap');
      if (btn) btn.remove();
      Drag.save();
    },

    _showDone: function() {
      var old = App.$('#dragDoneWrap');
      if (old) old.remove();
      var wrap = document.createElement('div');
      wrap.id = 'dragDoneWrap';
      wrap.className = 'drag-done-wrap';
      wrap.innerHTML =
        '<button class="drag-done-btn" type="button">完成</button>' +
        '<button class="drag-reset-btn" type="button">重置位置</button>';
      document.body.appendChild(wrap);
      wrap.querySelector('.drag-done-btn').addEventListener('touchend', function(e) {
        e.preventDefault(); e.stopPropagation(); Drag.exitEdit();
      });
      wrap.querySelector('.drag-reset-btn').addEventListener('touchend', function(e) {
        e.preventDefault(); e.stopPropagation(); Drag.resetAll();
      });
    },

    resetAll: function() {
      Drag._positions = {};
      Drag._dockOrder = [];
      Drag.save();

      Drag._getAllDraggables().forEach(function(el) {
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.zIndex = '';
        el.style.margin = '';
        el.style.width = '';
        el.style.height = '';
        el.style.transform = '';
      });

      App.LS.remove('wtCardPos');
      var wtCard = App.$('#wtCard');
      if (wtCard) {
        wtCard.style.position = '';
        wtCard.style.left = '';
        wtCard.style.top = '';
        wtCard.style.margin = '';
      }

      App.showToast('已重置到默认布局');
    },

    _getAllDraggables: function() {
      return Array.from(document.querySelectorAll(
        '#edenCard, #wtCard, #appGrid .app-icon, #dockBar .dock-item, #cardRow .bx-w'
      ));
    },

    _isDraggable: function(target) {
      return target.closest('#edenCard') ||
             target.closest('#wtCard') ||
             target.closest('.bx-w') ||
             target.closest('.app-icon') ||
             target.closest('.dock-item');
    },

    // ====== 幽灵拖拽（原元素不动） ======
    startDrag: function(el, tx, ty) {
      Drag._dragging = true;
      Drag._dragEl = el;

      var r = el.getBoundingClientRect();
      Drag._offsetX = tx - r.left;
      Drag._offsetY = ty - r.top;

      // 创建幽灵副本跟着手指
      var ghost = el.cloneNode(true);
      ghost.removeAttribute('id');
      ghost.classList.add('drag-ghost');
      ghost.style.cssText =
        'position:fixed;' +
        'left:' + r.left + 'px;' +
        'top:' + r.top + 'px;' +
        'width:' + r.width + 'px;' +
        'height:' + r.height + 'px;' +
        'z-index:99999;' +
        'margin:0;' +
        'pointer-events:none;' +
        'opacity:0.88;' +
        'transform:scale(1.05);' +
        'filter:drop-shadow(0 12px 24px rgba(0,0,0,0.3));' +
        'transition:none;';
            document.body.appendChild(ghost);
      Drag._ghost = ghost;

      // 原元素半透明提示
      el.style.opacity = '0.3';

      if (navigator.vibrate) navigator.vibrate(12);
    },

    moveDrag: function(tx, ty) {
      if (!Drag._ghost) return;
      Drag._ghost.style.left = (tx - Drag._offsetX) + 'px';
      Drag._ghost.style.top = (ty - Drag._offsetY) + 'px';
    },

    endDrag: function(tx, ty) {
      var el = Drag._dragEl;
      if (!el) return;

      // 移除幽灵
      if (Drag._ghost) {
        Drag._ghost.remove();
        Drag._ghost = null;
      }

      // 恢复透明度
      el.style.opacity = '';

      var isDock = el.closest('#dockBar');

      if (isDock) {
        Drag._dockSwap(el, tx, ty);
      } else {
        // 计算新位置
        var parent = el.parentElement;
        if (parent) {
          var pRect = parent.getBoundingClientRect();
          if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';

          var newX = tx - Drag._offsetX - pRect.left;
          var newY = ty - Drag._offsetY - pRect.top;

          el.style.position = 'absolute';
          el.style.left = newX + 'px';
          el.style.top = newY + 'px';
          el.style.zIndex = '2';

          if (el.id) {
            Drag._positions[el.id] = { x: newX, y: newY };
          }
        }
      }

      if (Drag._editMode) {
        if (el.closest('.app-icon') || el.closest('.dock-item')) {
          el.classList.add('drag-mode');
        } else {
          el.classList.add('drag-mode-outline');
        }
      }

      Drag._dragEl = null;
      Drag._dragging = false;
      Drag.save();
    },

    cancelDrag: function() {
      var el = Drag._dragEl;
      if (Drag._ghost) { Drag._ghost.remove(); Drag._ghost = null; }
      if (el) {
        el.style.opacity = '';
        if (Drag._editMode) {
          if (el.closest('.app-icon') || el.closest('.dock-item')) {
            el.classList.add('drag-mode');
          } else {
            el.classList.add('drag-mode-outline');
          }
        }
      }
      Drag._dragEl = null;
      Drag._dragging = false;
    },

    _dockSwap: function(el, tx, ty) {
      var dock = App.$('#dockBar');
      if (!dock) return;
      var items = dock.querySelectorAll('.dock-item');
      var best = null, bestDist = Infinity;
      for (var i = 0; i < items.length; i++) {
        if (items[i] === el) continue;
        var r = items[i].getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var d = Math.abs(tx - cx) + Math.abs(ty - cy);
        if (d < bestDist) { bestDist = d; best = items[i]; }
      }
      if (!best) return;
      var allItems = Array.from(items);
      var fi = allItems.indexOf(el);
      var ti = allItems.indexOf(best);
      if (fi < ti) dock.insertBefore(el, best.nextElementSibling);
      else dock.insertBefore(el, best);
      Drag.saveDockOrder();
    },

    // ====== 全局touch ======
    bindAll: function() {
      var pressTimer = null;
      var startX = 0, startY = 0;
      var pressEl = null;
      var lastTx = 0, lastTy = 0;

      document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.drag-done-wrap')) return;
        if (e.target.closest('.pc-edit-overlay')) return;
        if (e.target.closest('.panel')) return;
        if (e.target.closest('.fullpage-panel')) return;
        if (e.target.closest('.ball-menu')) return;
        if (e.target.closest('#floatingBall')) return;
        if (e.target.closest('.wt-ctrl-wrap')) return;
        if (e.target.closest('.eden-ctrl-wrap')) return;

        var item = Drag._isDraggable(e.target);
        if (!item) return;

        var touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        lastTx = startX;
        lastTy = startY;
        Drag._touchId = touch.identifier;
        pressEl = item;

        if (!Drag._editMode) {
          pressTimer = setTimeout(function() {
            pressTimer = null;
            Drag.enterEdit();
          }, 500);
        }
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        var touch = null;
        for (var i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === Drag._touchId) { touch = e.touches[i]; break; }
        }
        if (!touch) return;

        lastTx = touch.clientX;
        lastTy = touch.clientY;
        var dx = Math.abs(touch.clientX - startX);
        var dy = Math.abs(touch.clientY - startY);

        if (pressTimer && (dx > 6 || dy > 6)) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }

        if (Drag._editMode && !Drag._dragging && pressEl && (dx > 10 || dy > 10)) {
          Drag.startDrag(pressEl, touch.clientX, touch.clientY);
        }

        if (Drag._dragging) {
          e.preventDefault();
          Drag.moveDrag(touch.clientX, touch.clientY);
        }
      }, { passive: false });

      document.addEventListener('touchend', function(e) {
        if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
        if (Drag._dragging) {
          Drag.endDrag(lastTx, lastTy);
          e.preventDefault();
        }
        pressEl = null;
        Drag._touchId = null;
      }, { passive: false });

      document.addEventListener('touchcancel', function() {
        if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
        if (Drag._dragging) Drag.cancelDrag();
        pressEl = null;
        Drag._touchId = null;
      });

      document.addEventListener('contextmenu', function(e) {
        if (Drag._editMode || Drag._dragging) e.preventDefault();
      });
    },

    init: function() {
      Drag.load();
      setTimeout(function() {
        Drag.applyPositions();
        Drag.applyDockOrder();
        Drag.bindAll();
      }, 200);
    }
  };

  App.register('drag', Drag);
})();
