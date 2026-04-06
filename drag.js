(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Drag = {
    _editMode: false,
    _dragging: false,
    _dragEl: null,
    _ghost: null,
    _placeholder: null,
    _origStyle: '',
    _origParent: null,
    _origNext: null,
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

    // ====== 应用保存的位置 ======
    applyPositions: function() {
      Object.keys(Drag._positions).forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        var pos = Drag._positions[id];
        var parent = el.parentElement;
        if (!parent) return;

        var pStyle = getComputedStyle(parent);
        if (pStyle.position === 'static') {
          parent.style.position = 'relative';
        }

        el.style.position = 'absolute';
        el.style.left = pos.x + 'px';
        el.style.top = pos.y + 'px';
        el.style.zIndex = '2';
      });
    },

    applyDockOrder: function() {
      var dock = document.querySelector('#dockBar');
      if (!dock || !Drag._dockOrder.length) return;
      var map = {};
      dock.querySelectorAll('.dock-item').forEach(function(el) {
        if (el.id) map[el.id] = el;
      });
      Drag._dockOrder.forEach(function(id) {
        if (map[id]) dock.appendChild(map[id]);
      });
    },

    saveDockOrder: function() {
      var dock = document.querySelector('#dockBar');
      if (!dock) return;
      Drag._dockOrder = [];
      dock.querySelectorAll('.dock-item').forEach(function(el) {
        if (el.id) Drag._dockOrder.push(el.id);
      });
    },

    // ====== 编辑模式 ======
    enterEdit: function() {
      if (Drag._editMode) return;
      Drag._editMode = true;
      document.body.classList.add('drag-edit-active');

      Drag._getAllDraggables().forEach(function(el) {
        el.classList.add('drag-mode');
      });

      if (App.pageSlider && App.pageSlider.disable) {
        App.pageSlider.disable();
      }

      if (navigator.vibrate) navigator.vibrate(30);
      Drag._showDone();
      App.showToast('拖拽到任意位置 · 点完成退出');
    },

    exitEdit: function() {
      if (!Drag._editMode) return;
      Drag._editMode = false;
      document.body.classList.remove('drag-edit-active');

      document.querySelectorAll('.drag-mode').forEach(function(el) {
        el.classList.remove('drag-mode');
      });

      if (App.pageSlider && App.pageSlider.enable) {
        App.pageSlider.enable();
      }

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
        e.preventDefault();
        e.stopPropagation();
        Drag.exitEdit();
      });

      wrap.querySelector('.drag-reset-btn').addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        Drag.resetAll();
      });
    },

    resetAll: function() {
      Drag._positions = {};
      Drag.save();

      Drag._getAllDraggables().forEach(function(el) {
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.zIndex = '';
      });

      App.showToast('已重置');
    },

    _getAllDraggables: function() {
      return Array.from(document.querySelectorAll(
        '#appGrid .app-icon, #dockBar .dock-item, #cardRow .bx-w'
      ));
    },

    // ====== 拖拽核心 ======
    startDrag: function(el, tx, ty) {
      Drag._dragging = true;
      Drag._dragEl = el;
      document.body.classList.add('drag-active');

      var r = el.getBoundingClientRect();
      Drag._offsetX = tx - r.left;
      Drag._offsetY = ty - r.top;

      // 记住原始信息
      Drag._origStyle = el.getAttribute('style') || '';
      Drag._origParent = el.parentElement;
      Drag._origNext = el.nextElementSibling;

      // 创建占位
      var placeholder = document.createElement('div');
      placeholder.className = 'drag-placeholder-box';
      placeholder.style.width = r.width + 'px';
      placeholder.style.height = r.height + 'px';
      placeholder.style.flexShrink = '0';
      el.parentElement.insertBefore(placeholder, el);
      Drag._placeholder = placeholder;

      // 把元素移到body，fixed定位
      document.body.appendChild(el);
      el.style.position = 'fixed';
      el.style.left = r.left + 'px';
      el.style.top = r.top + 'px';
      el.style.width = r.width + 'px';
      el.style.height = r.height + 'px';
      el.style.zIndex = '99999';
      el.style.margin = '0';
      el.style.transform = 'scale(1.05)';
      el.style.transition = 'none';
      el.style.animation = 'none';
      el.style.pointerEvents = 'none';
      el.style.opacity = '0.92';
      el.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.3))';

      if (navigator.vibrate) navigator.vibrate(12);
    },

    moveDrag: function(tx, ty) {
      if (!Drag._dragEl) return;
      Drag._dragEl.style.left = (tx - Drag._offsetX) + 'px';
      Drag._dragEl.style.top = (ty - Drag._offsetY) + 'px';
    },

    endDrag: function(tx, ty) {
      document.body.classList.remove('drag-active');

      var el = Drag._dragEl;
      if (!el) return;

      var isDock = Drag._origParent && Drag._origParent.id === 'dockBar';

      // 先放回原父级
      if (Drag._placeholder && Drag._origParent) {
        Drag._origParent.insertBefore(el, Drag._placeholder);
        Drag._placeholder.remove();
        Drag._placeholder = null;
      } else if (Drag._origParent) {
        if (Drag._origNext && Drag._origNext.parentElement === Drag._origParent) {
          Drag._origParent.insertBefore(el, Drag._origNext);
        } else {
          Drag._origParent.appendChild(el);
        }
      }

      // 恢复原始style
      if (Drag._origStyle) {
        el.setAttribute('style', Drag._origStyle);
      } else {
        el.removeAttribute('style');
      }

      if (isDock) {
        // dock：交换位置
        Drag._dockSwap(el, tx, ty);
      } else {
        // 自由定位
        var parent = el.parentElement;
        if (parent) {
          var pRect = parent.getBoundingClientRect();
          var pStyle = getComputedStyle(parent);
          if (pStyle.position === 'static') {
            parent.style.position = 'relative';
          }

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

      // 恢复编辑模式样式
      if (Drag._editMode) {
        el.classList.add('drag-mode');
      }

      Drag._dragEl = null;
      Drag._dragging = false;
      Drag._origStyle = '';
      Drag._origParent = null;
      Drag._origNext = null;
      Drag.save();
    },

    cancelDrag: function() {
      document.body.classList.remove('drag-active');

      var el = Drag._dragEl;
      if (!el) return;

      // 放回原位
      if (Drag._placeholder && Drag._origParent) {
        Drag._origParent.insertBefore(el, Drag._placeholder);
        Drag._placeholder.remove();
        Drag._placeholder = null;
      } else if (Drag._origParent) {
        if (Drag._origNext && Drag._origNext.parentElement === Drag._origParent) {
          Drag._origParent.insertBefore(el, Drag._origNext);
        } else {
          Drag._origParent.appendChild(el);
        }
      }

      // 恢复style
      if (Drag._origStyle) {
        el.setAttribute('style', Drag._origStyle);
      } else {
        el.removeAttribute('style');
      }

      if (Drag._editMode) {
        el.classList.add('drag-mode');
      }

      Drag._dragEl = null;
      Drag._dragging = false;
      Drag._origStyle = '';
      Drag._origParent = null;
      Drag._origNext = null;
    },

    _dockSwap: function(el, tx, ty) {
      var dock = document.querySelector('#dockBar');
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
      if (fi < ti) {
        dock.insertBefore(el, best.nextElementSibling);
      } else {
        dock.insertBefore(el, best);
      }
      Drag.saveDockOrder();
    },

    // ====== 判断可拖拽元素 ======
    _isDraggable: function(target) {
      return target.closest('.app-icon') ||
             target.closest('.dock-item') ||
             target.closest('.bx-w');
    },

    // ====== 全局touch绑定 ======
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
          if (e.touches[i].identifier === Drag._touchId) {
            touch = e.touches[i]; break;
          }
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
