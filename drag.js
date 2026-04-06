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
    _moved: false,

    load: function() {
      Drag._appOrder = App.LS.get('iconOrder') || [];
      Drag._dockOrder = App.LS.get('dockOrder') || [];
    },

    save: function() {
      App.LS.set('iconOrder', Drag._appOrder);
      App.LS.set('dockOrder', Drag._dockOrder);
    },

    applyOrder: function() {
      // app图标
      var grid = App.$('#appGrid');
      if (grid && Drag._appOrder.length) {
        var map = {};
        grid.querySelectorAll('.app-icon').forEach(function(el) {
          map[el.id] = el;
        });
        Drag._appOrder.forEach(function(id) {
          if (map[id]) grid.appendChild(map[id]);
        });
      }

      // dock图标
      var dock = App.$('#dockBar');
      if (dock && Drag._dockOrder.length) {
        var dmap = {};
        dock.querySelectorAll('.dock-item').forEach(function(el) {
          dmap[el.id] = el;
        });
        Drag._dockOrder.forEach(function(id) {
          if (dmap[id]) dock.appendChild(dmap[id]);
        });
      }
    },

    saveCurrentOrder: function() {
      var grid = App.$('#appGrid');
      if (grid) {
        Drag._appOrder = [];
        grid.querySelectorAll('.app-icon').forEach(function(el) {
          if (el.id) Drag._appOrder.push(el.id);
        });
      }

      var dock = App.$('#dockBar');
      if (dock) {
        Drag._dockOrder = [];
        dock.querySelectorAll('.dock-item').forEach(function(el) {
          if (el.id) Drag._dockOrder.push(el.id);
        });
      }

      Drag.save();
    },

    // ========= 编辑模式 =========
    enterEditMode: function() {
      if (Drag._editMode) return;
      Drag._editMode = true;

      // 所有可拖拽元素抖动
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

    // ========= 拖拽核心 =========
    getCenter: function(el) {
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },

    getClosestInContainer: function(container, selector, x, y) {
      var items = container.querySelectorAll(selector);
      var closest = null;
      var minDist = Infinity;
      for (var i = 0; i < items.length; i++) {
        if (items[i] === Drag._dragEl) continue;
        var c = Drag.getCenter(items[i]);
        var dist = Math.sqrt(Math.pow(x - c.x, 2) + Math.pow(y - c.y, 2));
        if (dist < minDist) {
          minDist = dist;
          closest = items[i];
        }
      }
      return closest;
    },

    startDrag: function(el, container, touchX, touchY) {
      Drag._dragging = true;
      Drag._dragEl = el;
      Drag._sourceContainer = container;
      Drag._moved = false;

      var rect = el.getBoundingClientRect();
      Drag._offsetX = touchX - rect.left;
      Drag._offsetY = touchY - rect.top;

      // 创建幽灵
      Drag._ghost = el.cloneNode(true);
      Drag._ghost.className = 'drag-ghost';
      Drag._ghost.style.width = rect.width + 'px';
      Drag._ghost.style.height = rect.height + 'px';
      Drag._ghost.style.left = rect.left + 'px';
      Drag._ghost.style.top = rect.top + 'px';
      document.body.appendChild(Drag._ghost);

      // 原元素变淡
      el.classList.add('drag-placeholder');

      if (navigator.vibrate) navigator.vibrate(15);
    },

    moveDrag: function(touchX, touchY) {
      if (!Drag._ghost || !Drag._dragEl) return;
      Drag._moved = true;

      // 移动幽灵
      Drag._ghost.style.left = (touchX - Drag._offsetX) + 'px';
      Drag._ghost.style.top = (touchY - Drag._offsetY) + 'px';

      // 在同容器内找最近的交换
      var container = Drag._sourceContainer;
      var selector = container.id === 'dockBar' ? '.dock-item' : '.app-icon';
      var target = Drag.getClosestInContainer(container, selector, touchX, touchY);

      if (target && target !== Drag._dragEl) {
        var items = Array.from(container.querySelectorAll(selector));
        var dragIdx = items.indexOf(Drag._dragEl);
        var targetIdx = items.indexOf(target);

        if (dragIdx < targetIdx) {
          container.insertBefore(Drag._dragEl, target.nextSibling);
        } else {
          container.insertBefore(Drag._dragEl, target);
        }
      }
    },

    endDrag: function() {
      if (Drag._ghost) {
        Drag._ghost.remove();
        Drag._ghost = null;
      }

      if (Drag._dragEl) {
        Drag._dragEl.classList.remove('drag-placeholder');
        Drag._dragEl = null;
      }

      Drag._sourceContainer = null;
      Drag._dragging = false;
      Drag.saveCurrentOrder();
    },

    // ========= 给容器绑定拖拽 =========
    bindContainer: function(containerSelector, itemSelector) {
      var container = document.querySelector(containerSelector);
      if (!container) return;

      container.addEventListener('touchstart', function(e) {
        var item = e.target.closest(itemSelector);
        if (!item) return;

        var touch = e.touches[0];
        Drag._startX = touch.clientX;
        Drag._startY = touch.clientY;
        Drag._moved = false;

        if (Drag._editMode) {
          // 编辑模式：短延迟后开始拖拽
          Drag._timer = setTimeout(function() {
            Drag._timer = null;
            Drag.startDrag(item, container, touch.clientX, touch.clientY);
          }, 120);
        } else {
          // 非编辑模式：长按进入编辑模式
          Drag._timer = setTimeout(function() {
            Drag._timer = null;
            e.preventDefault();
            Drag.enterEditMode();
          }, 500);
        }
      }, { passive: false });

      container.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];

        // 移动超过阈值取消长按
        if (Drag._timer) {
          var dx = Math.abs(touch.clientX - Drag._startX);
          var dy = Math.abs(touch.clientY - Drag._startY);
          if (dx > 8 || dy > 8) {
            clearTimeout(Drag._timer);
            Drag._timer = null;
          }
        }

        if (Drag._dragging) {
          e.preventDefault();
          Drag.moveDrag(touch.clientX, touch.clientY);
        }
      }, { passive: false });

      container.addEventListener('touchend', function(e) {
        if (Drag._timer) {
          clearTimeout(Drag._timer);
          Drag._timer = null;
        }
        if (Drag._dragging) {
          Drag.endDrag();
          // 拖拽结束不触发点击
          if (Drag._moved) {
            e.preventDefault();
          }
          return;
        }
      });

      container.addEventListener('touchcancel', function() {
        if (Drag._timer) {
          clearTimeout(Drag._timer);
          Drag._timer = null;
        }
        if (Drag._dragging) {
          Drag.endDrag();
        }
      });
    },

    // ========= 初始化 =========
    init: function() {
      Drag.load();
      Drag.applyOrder();

      // 绑定所有容器
      Drag.bindContainer('#appGrid', '.app-icon');
      Drag.bindContainer('#dockBar', '.dock-item');
      Drag.bindContainer('#cardRow', '.bx-w');
    }
  };

  App.register('drag', Drag);
})();
