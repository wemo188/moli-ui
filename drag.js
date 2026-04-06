(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Drag = {
    _editMode: false,
    _timer: null,
    _dragging: false,
    _dragEl: null,
    _ghost: null,
    _startX: 0,
    _startY: 0,
    _offsetX: 0,
    _offsetY: 0,
    _sourceContainer: null,
    _sourceSelector: '',
    _lastSwapTime: 0,

    load: function() {
      Drag._appOrder = App.LS.get('iconOrder') || [];
      Drag._dockOrder = App.LS.get('dockOrder') || [];
    },

    save: function() {
      App.LS.set('iconOrder', Drag._appOrder);
      App.LS.set('dockOrder', Drag._dockOrder);
    },

    applyOrder: function() {
      Drag._applyTo('#appGrid', '.app-icon', Drag._appOrder);
      Drag._applyTo('#dockBar', '.dock-item', Drag._dockOrder);
    },

    _applyTo: function(containerSel, itemSel, order) {
      var c = document.querySelector(containerSel);
      if (!c || !order.length) return;
      var map = {};
      c.querySelectorAll(itemSel).forEach(function(el) {
        if (el.id) map[el.id] = el;
      });
      order.forEach(function(id) {
        if (map[id]) c.appendChild(map[id]);
      });
    },

    saveCurrentOrder: function() {
      Drag._appOrder = Drag._getIds('#appGrid', '.app-icon');
      Drag._dockOrder = Drag._getIds('#dockBar', '.dock-item');
      Drag.save();
    },

    _getIds: function(containerSel, itemSel) {
      var c = document.querySelector(containerSel);
      if (!c) return [];
      var ids = [];
      c.querySelectorAll(itemSel).forEach(function(el) {
        if (el.id) ids.push(el.id);
      });
      return ids;
    },

    // ========= 编辑模式 =========
    enterEditMode: function() {
      if (Drag._editMode) return;
      Drag._editMode = true;

      document.querySelectorAll('#appGrid .app-icon, #dockBar .dock-item, #cardRow .bx-w').forEach(function(el) {
        el.classList.add('drag-mode');
      });

      if (navigator.vibrate) navigator.vibrate(30);
      Drag.showDoneBtn();
      App.showToast('编辑模式：拖拽换位置');
    },

    exitEditMode: function() {
      if (!Drag._editMode) return;
      Drag._editMode = false;

      document.querySelectorAll('.drag-mode').forEach(function(el) {
        el.classList.remove('drag-mode');
      });

      var btn = App.$('#dragDoneBtn');
      if (btn) btn.remove();
    },

    showDoneBtn: function() {
      var old = App.$('#dragDoneBtn');
      if (old) old.remove();

      var btn = document.createElement('button');
      btn.id = 'dragDoneBtn';
      btn.className = 'drag-done-btn';
      btn.textContent = '完成';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        Drag.exitEditMode();
      });
      document.body.appendChild(btn);
    },

    // ========= 工具 =========
    getCenter: function(el) {
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },

    findClosest: function(x, y) {
      var container = Drag._sourceContainer;
      var selector = Drag._sourceSelector;
      if (!container) return null;
      var items = container.querySelectorAll(selector);
      var closest = null;
      var minDist = Infinity;
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        if (el === Drag._dragEl) continue;
        var c = Drag.getCenter(el);
        var d = Math.abs(x - c.x) + Math.abs(y - c.y);
        if (d < minDist) {
          minDist = d;
          closest = el;
        }
      }
      return closest;
    },

    // ========= 拖拽 =========
    startDrag: function(el, container, selector, touchX, touchY) {
      Drag._dragging = true;
      Drag._dragEl = el;
      Drag._sourceContainer = container;
      Drag._sourceSelector = selector;

      var rect = el.getBoundingClientRect();
      Drag._offsetX = touchX - rect.left;
      Drag._offsetY = touchY - rect.top;

      // 幽灵：复制节点保留样式
      var ghost = el.cloneNode(true);
      ghost.style.cssText =
        'position:fixed!important;z-index:99999!important;pointer-events:none!important;' +
        'width:' + rect.width + 'px;height:' + rect.height + 'px;' +
        'left:' + rect.left + 'px;top:' + rect.top + 'px;' +
        'opacity:0.85;transform:scale(1.08);' +
        'filter:drop-shadow(0 10px 20px rgba(0,0,0,0.3));' +
        'will-change:left,top;transition:none;animation:none;margin:0;';
      document.body.appendChild(ghost);
      Drag._ghost = ghost;

      el.style.opacity = '0.15';
      el.style.animation = 'none';

      if (navigator.vibrate) navigator.vibrate(15);
    },

    moveDrag: function(touchX, touchY) {
      if (!Drag._ghost || !Drag._dragEl) return;

      Drag._ghost.style.left = (touchX - Drag._offsetX) + 'px';
      Drag._ghost.style.top = (touchY - Drag._offsetY) + 'px';

      // 限制交换频率
      var now = Date.now();
      if (now - Drag._lastSwapTime < 150) return;

      var target = Drag.findClosest(touchX, touchY);
      if (!target || target === Drag._dragEl) return;

      var container = Drag._sourceContainer;
      var allItems = Array.from(container.querySelectorAll(Drag._sourceSelector));
      var fromIdx = allItems.indexOf(Drag._dragEl);
      var toIdx = allItems.indexOf(target);
      if (fromIdx === -1 || toIdx === -1) return;

      // 交换位置
      if (fromIdx < toIdx) {
        container.insertBefore(Drag._dragEl, target.nextElementSibling);
      } else {
        container.insertBefore(Drag._dragEl, target);
      }

      Drag._lastSwapTime = now;
    },

    endDrag: function() {
      // 移除幽灵
      if (Drag._ghost) {
        Drag._ghost.remove();
        Drag._ghost = null;
      }

      // 恢复原图标
      if (Drag._dragEl) {
        Drag._dragEl.style.opacity = '';
        Drag._dragEl.style.animation = '';
        Drag._dragEl.classList.add('drag-mode');
        Drag._dragEl = null;
      }

      Drag._sourceContainer = null;
      Drag._sourceSelector = '';
      Drag._dragging = false;

      // 保存新顺序
      Drag.saveCurrentOrder();
    },

    // ========= 绑定 =========
    bindContainer: function(containerSel, itemSel) {
      var container = document.querySelector(containerSel);
      if (!container) return;

      var pressTimer = null;
      var pressItem = null;
      var startX = 0;
      var startY = 0;
      var moved = false;

      container.addEventListener('touchstart', function(e) {
        var item = e.target.closest(itemSel);
        if (!item) return;

        var touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        moved = false;
        pressItem = item;

        if (Drag._editMode) {
          // 编辑模式：短按开始拖
          pressTimer = setTimeout(function() {
            pressTimer = null;
            Drag.startDrag(item, container, itemSel, touch.clientX, touch.clientY);
          }, 100);
        } else {
          // 正常模式：长按进入编辑
          pressTimer = setTimeout(function() {
            pressTimer = null;
            e.preventDefault();
            Drag.enterEditMode();
          }, 500);
        }
      }, { passive: false });

      container.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        var dx = Math.abs(touch.clientX - startX);
        var dy = Math.abs(touch.clientY - startY);

        if (pressTimer && (dx > 6 || dy > 6)) {
          clearTimeout(pressTimer);
          pressTimer = null;

          // 编辑模式下移动了就立即开始拖
          if (Drag._editMode && pressItem && !Drag._dragging) {
            Drag.startDrag(pressItem, container, itemSel, touch.clientX, touch.clientY);
          }
        }

        if (Drag._dragging) {
          e.preventDefault();
          moved = true;
          Drag.moveDrag(touch.clientX, touch.clientY);
        }
      }, { passive: false });

      container.addEventListener('touchend', function(e) {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
        pressItem = null;

        if (Drag._dragging) {
          Drag.endDrag();
          if (moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      });

      container.addEventListener('touchcancel', function() {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
        pressItem = null;

        if (Drag._dragging) {
          Drag.endDrag();
        }
      });
    },

    init: function() {
      Drag.load();

      // 等DOM就绪后应用顺序
      setTimeout(function() {
        Drag.applyOrder();
      }, 100);

      // 绑定所有容器
      Drag.bindContainer('#appGrid', '.app-icon');
      Drag.bindContainer('#dockBar', '.dock-item');
      Drag.bindContainer('#cardRow', '.bx-w');
    }
  };

  App.register('drag', Drag);
})();
