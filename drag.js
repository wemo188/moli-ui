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

    applyPositions: function() {
      Object.keys(Drag._positions).forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        var pos = Drag._positions[id];
        var parent = el.parentElement;
        if (!parent) return;
        var pStyle = getComputedStyle(parent);
        if (pStyle.position === 'static') parent.style.position = 'relative';
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

    enterEdit: function() {
  if (Drag._editMode) return;
  Drag._editMode = true;
  document.body.classList.add('drag-edit-active');

  Drag._getAllDraggables().forEach(function(el) {
    // 大卡片不加抖动，只加边框提示可拖
    if (el.id === 'wtCard' || el.id === 'edenCard') {
      el.classList.add('drag-mode-outline');
    } else {
      el.classList.add('drag-mode');
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
      Drag.save();

      // 恢复所有元素的默认位置
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

      // 天气卡片也恢复
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
      // 按优先级匹配，避免穿透
      var el = target.closest('#edenCard');
      if (el) return el;
      el = target.closest('#wtCard');
      if (el) return el;
      el = target.closest('.bx-w');
      if (el) return el;
      el = target.closest('.app-icon');
      if (el) return el;
      el = target.closest('.dock-item');
      if (el) return el;
      return null;
    },

    startDrag: function(el, tx, ty) {
  Drag._dragging = true;
  Drag._dragEl = el;
  document.body.classList.add('drag-active');

  var r = el.getBoundingClientRect();
  Drag._offsetX = tx - r.left;
  Drag._offsetY = ty - r.top;

  Drag._origStyle = el.getAttribute('style') || '';
  Drag._origParent = el.parentElement;
  Drag._origNext = el.nextElementSibling;

  // 占位符完整复制原元素的空间
  var cs = getComputedStyle(el);
  var placeholder = document.createElement('div');
  placeholder.className = 'drag-placeholder-box';
  placeholder.style.width = cs.width;
  placeholder.style.height = cs.height;
  placeholder.style.minHeight = cs.minHeight;
  placeholder.style.maxHeight = cs.maxHeight;
  placeholder.style.marginTop = cs.marginTop;
  placeholder.style.marginBottom = cs.marginBottom;
  placeholder.style.marginLeft = cs.marginLeft;
  placeholder.style.marginRight = cs.marginRight;
  placeholder.style.flexShrink = '0';
  placeholder.style.maxWidth = cs.maxWidth;
  placeholder.style.boxSizing = 'border-box';
  el.parentElement.insertBefore(placeholder, el);
  Drag._placeholder = placeholder;

  document.body.appendChild(el);
  el.style.position = 'fixed';
  el.style.left = r.left + 'px';
  el.style.top = r.top + 'px';
  el.style.width = r.width + 'px';
  el.style.height = r.height + 'px';
  el.style.zIndex = '99999';
  el.style.margin = '0';
  el.style.transition = 'none';
  el.style.animation = 'none';
  el.style.pointerEvents = 'none';
  el.style.opacity = '0.92';
  el.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.3))';
  el.style.transform = 'scale(1.05)';

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

      // 放回原父级
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
        Drag._dockSwap(el, tx, ty);
      } else {
        var parent = el.parentElement;
        if (parent) {
          var pRect = parent.getBoundingClientRect();
          var pStyle = getComputedStyle(parent);
          if (pStyle.position === 'static') parent.style.position = 'relative';

          var newX = tx - Drag._offsetX - pRect.left;
          var newY = ty - Drag._offsetY - pRect.top;

          el.style.position = 'absolute';
          el.style.left = newX + 'px';
          el.style.top = newY + 'px';
          el.style.zIndex = '2';

          if (el.id) {
            Drag._positions[el.id] = { x: newX, y: newY };
          } else {
            // bx-w 没有id，用class+index
            var siblings = parent.querySelectorAll('.bx-w');
            for (var i = 0; i < siblings.length; i++) {
              if (siblings[i] === el) {
                Drag._positions['bxw_' + i] = { x: newX, y: newY };
                el.dataset.dragId = 'bxw_' + i;
                break;
              }
            }
          }
        }
      }

      if (Drag._editMode) el.classList.add('drag-mode');

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

      if (Drag._origStyle) {
        el.setAttribute('style', Drag._origStyle);
      } else {
        el.removeAttribute('style');
      }

      if (Drag._editMode) el.classList.add('drag-mode');

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
      if (fi < ti) dock.insertBefore(el, best.nextElementSibling);
      else dock.insertBefore(el, best);
      Drag.saveDockOrder();
    },

    bindAll: function() {
      var pressTimer = null;
      var startX = 0, startY = 0;
      var pressEl = null;
      var lastTx = 0, lastTy = 0;

      document.addEventListener('touchstart', function(e) {
        // 排除不该拖的区域
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

        // 只有非编辑模式才启动长按进入编辑
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

        // 移动超过阈值取消长按
        if (pressTimer && (dx > 6 || dy > 6)) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }

        // 编辑模式下拖动
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
