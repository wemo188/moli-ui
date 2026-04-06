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
    _grid: null,
    _order: [],

    load: function() {
      Drag._order = App.LS.get('iconOrder') || [];
    },

    save: function() {
      App.LS.set('iconOrder', Drag._order);
    },

    applyOrder: function() {
      var grid = App.$('#appGrid');
      if (!grid) return;
      if (!Drag._order.length) return;

      var map = {};
      grid.querySelectorAll('.app-icon').forEach(function(el) {
        map[el.id] = el;
      });

      Drag._order.forEach(function(id) {
        if (map[id]) grid.appendChild(map[id]);
      });
    },

    saveCurrentOrder: function() {
      var grid = App.$('#appGrid');
      if (!grid) return;
      Drag._order = [];
      grid.querySelectorAll('.app-icon').forEach(function(el) {
        Drag._order.push(el.id);
      });
      Drag.save();
    },

    // ========= 编辑模式 =========
    enterEditMode: function() {
      if (Drag._editMode) return;
      Drag._editMode = true;
      Drag._grid = App.$('#appGrid');

      // 所有图标抖动
      Drag._grid.querySelectorAll('.app-icon').forEach(function(item) {
        item.classList.add('drag-mode');
      });

      // 卡片也抖
      document.querySelectorAll('#cardRow .bx-w').forEach(function(card) {
        card.classList.add('drag-mode');
      });

      // 震动反馈
      if (navigator.vibrate) navigator.vibrate(30);

      // 显示完成按钮
      Drag.showDoneBtn();

      App.showToast('编辑模式：拖拽换位 / 点击编辑');
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

    // ========= 拖拽 =========
    getCenter: function(el) {
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },

    getClosest: function(x, y) {
      var grid = App.$('#appGrid');
      if (!grid) return null;
      var items = grid.querySelectorAll('.app-icon');
      var closest = null;
      var minDist = Infinity;
      items.forEach(function(el) {
        if (el === Drag._dragEl) return;
        var c = Drag.getCenter(el);
        var dist = Math.sqrt(Math.pow(x - c.x, 2) + Math.pow(y - c.y, 2));
        if (dist < minDist) {
          minDist = dist;
          closest = el;
        }
      });
      return closest;
    },

    startDrag: function(el, touchX, touchY) {
      Drag._dragging = true;
      Drag._dragEl = el;

      var rect = el.getBoundingClientRect();
      Drag._offsetX = touchX - rect.left;
      Drag._offsetY = touchY - rect.top;

      Drag._ghost = el.cloneNode(true);
      Drag._ghost.classList.add('drag-ghost');
      Drag._ghost.classList.remove('drag-mode');
      Drag._ghost.style.width = rect.width + 'px';
      Drag._ghost.style.height = rect.height + 'px';
      Drag._ghost.style.left = rect.left + 'px';
      Drag._ghost.style.top = rect.top + 'px';
      document.body.appendChild(Drag._ghost);

      el.classList.add('drag-placeholder');

      if (navigator.vibrate) navigator.vibrate(15);
    },

    moveDrag: function(touchX, touchY) {
      if (!Drag._ghost) return;

      Drag._ghost.style.left = (touchX - Drag._offsetX) + 'px';
      Drag._ghost.style.top = (touchY - Drag._offsetY) + 'px';

      var target = Drag.getClosest(touchX, touchY);
      if (target && target !== Drag._dragEl) {
        var grid = Drag._grid;
        var items = Array.from(grid.querySelectorAll('.app-icon'));
        var dragIdx = items.indexOf(Drag._dragEl);
        var targetIdx = items.indexOf(target);

        if (dragIdx < targetIdx) {
          grid.insertBefore(Drag._dragEl, target.nextSibling);
        } else {
          grid.insertBefore(Drag._dragEl, target);
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

      Drag._dragging = false;
      Drag.saveCurrentOrder();
    },

    // ========= 绑定事件 =========
    bind: function() {
      var grid = App.$('#appGrid');
      if (!grid) return;

      // --- 图标区域 ---
      grid.addEventListener('touchstart', function(e) {
        var icon = e.target.closest('.app-icon');
        if (!icon) return;

        var touch = e.touches[0];
        Drag._startX = touch.clientX;
        Drag._startY = touch.clientY;

        if (Drag._editMode) {
          // 编辑模式下直接准备拖拽
          Drag._timer = setTimeout(function() {
            Drag._timer = null;
            Drag.startDrag(icon, touch.clientX, touch.clientY);
          }, 150);
        } else {
          // 非编辑模式下长按进入编辑模式
          Drag._timer = setTimeout(function() {
            Drag._timer = null;
            e.preventDefault();
            Drag.enterEditMode();
          }, 500);
        }
      }, { passive: false });

      grid.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];

        if (Drag._timer) {
          var dx = Math.abs(touch.clientX - Drag._startX);
          var dy = Math.abs(touch.clientY - Drag._startY);
          if (dx > 10 || dy > 10) {
            clearTimeout(Drag._timer);
            Drag._timer = null;
          }
        }

        if (Drag._dragging) {
          e.preventDefault();
          Drag.moveDrag(touch.clientX, touch.clientY);
        }
      }, { passive: false });

      grid.addEventListener('touchend', function(e) {
        if (Drag._timer) {
          clearTimeout(Drag._timer);
          Drag._timer = null;
        }
        if (Drag._dragging) {
          Drag.endDrag();
          return;
        }

        // 编辑模式下点击图标 → 打开编辑功能
        if (Drag._editMode) {
          var icon = e.target.closest('.app-icon');
          if (icon) {
            e.preventDefault();
            e.stopPropagation();
            // 触发原来的图标点击（改图标图片）
            if (window.App && App.customizeIcon) {
              App.customizeIcon(icon);
            }
          }
        }
      });

      grid.addEventListener('touchcancel', function() {
        if (Drag._timer) {
          clearTimeout(Drag._timer);
          Drag._timer = null;
        }
        if (Drag._dragging) {
          Drag.endDrag();
        }
      });

      // --- 卡片区域长按也进入编辑模式 ---
      var cardRow = App.$('#cardRow');
      if (cardRow) {
        var cardTimer = null;
        cardRow.addEventListener('touchstart', function(e) {
          var card = e.target.closest('.bx-w');
          if (!card) return;
          if (Drag._editMode) return;

          cardTimer = setTimeout(function() {
            cardTimer = null;
            e.preventDefault();
            Drag.enterEditMode();
          }, 500);
        }, { passive: false });

        cardRow.addEventListener('touchmove', function() {
          if (cardTimer) { clearTimeout(cardTimer); cardTimer = null; }
        });

        cardRow.addEventListener('touchend', function() {
          if (cardTimer) { clearTimeout(cardTimer); cardTimer = null; }
        });
      }
    },

    init: function() {
      Drag.load();
      Drag.applyOrder();
      Drag.bind();
    }
  };

  App.register('drag', Drag);
})();
