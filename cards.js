(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var EMPTY = { name: '', sub: '', backText: '', avatar: '', tag1: '', tag2: '' };

  var Cards = {
    data: {},
    _dragOffsets: {},

    load: function() {
      Cards.data = App.LS.get('profileCards') || {};
      if (!Cards.data.left) Cards.data.left = JSON.parse(JSON.stringify(EMPTY));
      if (!Cards.data.right) Cards.data.right = JSON.parse(JSON.stringify(EMPTY));
      Cards._dragOffsets = App.LS.get('cardDragOffsets') || {};
    },

    save: function() {
      App.LS.set('profileCards', Cards.data);
    },

    saveDrag: function() {
      App.LS.set('cardDragOffsets', Cards._dragOffsets);
    },

    render: function() {
      var container = App.$('#cardRow');
      if (!container) return;

      var L = Cards.data.left;
      var R = Cards.data.right;

      // 左卡片标签（始终显示）
      var lt1 = L.tag1 || '♡ 标签';
      var lt2 = L.tag2 || '✦ 标签';
      var lt1Cls = L.tag1 ? '' : ' bx-tag-placeholder';
      var lt2Cls = L.tag2 ? '' : ' bx-tag-placeholder';
      var leftTagHtml =
        '<div class="bx-tag-wrap">' +
          '<div class="bx-tag bx-tag1' + lt1Cls + '">' + App.esc(lt1) + '</div>' +
          '<div class="bx-tag bx-tag2' + lt2Cls + '">' + App.esc(lt2) + '</div>' +
        '</div>';

      // 左卡片头像
      var leftFrontHtml = L.avatar
        ? '<div class="bx-av-front" style="background-image:url(\'' + App.esc(L.avatar) + '\')"></div>'
        : '<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';

      // 左卡片名字签名（始终显示）
      var lName = L.name || '角色名';
      var lSub = L.sub || '一句话签名';
      var lNameCls = L.name ? '' : ' bx-name-placeholder';
      var lSubCls = L.sub ? '' : ' bx-sub-placeholder';

      // 右卡片丝带（始终显示）
      var rt1 = R.tag1 || '♦ 丝带';
      var rt2 = R.tag2 || '✦ 丝带';
      var rt1Cls = R.tag1 ? '' : ' bx-ribbon-placeholder';
      var rt2Cls = R.tag2 ? '' : ' bx-ribbon-placeholder';
      var rightRibbonHtml =
        '<div class="bx-side-ribbon">' +
          '<div class="bx-ribbon-tab r1' + rt1Cls + '">' + App.esc(rt1) + '</div>' +
          '<div class="bx-ribbon-tab r2' + rt2Cls + '">' + App.esc(rt2) + '</div>' +
        '</div>';

      // 右卡片头像
      var rightFrontHtml = R.avatar
        ? '<div class="bx-av-front" style="background-image:url(\'' + App.esc(R.avatar) + '\')"></div>'
        : '<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';

      var rName = R.name || '角色名';
      var rSub = R.sub || '一句话签名';
      var rNameCls = R.name ? '' : ' bx-name-placeholder';
      var rSubCls = R.sub ? '' : ' bx-sub-placeholder';

      container.innerHTML =
        '<div class="bx-w" id="bx-2" data-side="left">' +
          '<input type="checkbox" id="bx-fav2" class="bx-cb">' +
          leftTagHtml +
          '<div class="bx-cw">' +
            '<div class="bx-cd">' +
              '<label for="bx-fav2" class="bx-av-box" title="点击翻转">' +
                '<div class="bx-av-inner">' +
                  leftFrontHtml +
                  '<div class="bx-av-back">' +
                    '<div class="bx-lines"></div>' +
                    '<div class="bx-back-txt">' + (L.backText || '') + '</div>' +
                  '</div>' +
                '</div>' +
              '</label>' +
              '<div class="bx-name-bar">' +
                '<div class="bx-name' + lNameCls + '">' + App.esc(lName) + '</div>' +
                '<div class="bx-sub' + lSubCls + '">' + App.esc(lSub) + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="bx-w" id="bx-1" data-side="right">' +
          '<input type="checkbox" id="bx-fav1" class="bx-cb">' +
          '<div class="bx-cw">' +
            '<div class="bx-cd">' +
              rightRibbonHtml +
              '<label for="bx-fav1" class="bx-av-box" title="点击翻转">' +
                '<div class="bx-av-inner">' +
                  rightFrontHtml +
                  '<div class="bx-av-back">' +
                    '<div class="bx-lines"></div>' +
                    '<div class="bx-back-txt">' + (R.backText || '') + '</div>' +
                  '</div>' +
                '</div>' +
              '</label>' +
              '<div class="bx-name-bar">' +
                '<div class="bx-name' + rNameCls + '">' + App.esc(rName) + '</div>' +
                '<div class="bx-sub' + rSubCls + '">' + App.esc(rSub) + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      Cards.initFlip();
      Cards.bindEdit();
      Cards.applyDragOffsets();
      Cards.bindDrag();
    },

    initFlip: function() {
      document.querySelectorAll('#cardRow .bx-w').forEach(function(c) {
        var uid = Math.random().toString(36).slice(2, 8);
        c.querySelectorAll('input[id]').forEach(function(inp) {
          var oldId = inp.id, newId = oldId + '_' + uid;
          inp.id = newId;
          c.querySelectorAll('label[for="' + oldId + '"]').forEach(function(lbl) {
            lbl.setAttribute('for', newId);
          });
        });
      });
    },

    bindEdit: function() {
      document.querySelectorAll('#cardRow .bx-w').forEach(function(card) {
        var nameBar = card.querySelector('.bx-name-bar');
        if (nameBar) {
          nameBar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var cb = card.querySelector('.bx-cb');
            if (cb) { var was = cb.checked; setTimeout(function() { cb.checked = was; }, 10); }
            Cards.openEdit(card.dataset.side);
          });
        }
        var ph = card.querySelector('.bx-av-placeholder');
        if (ph) {
          ph.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var cb = card.querySelector('.bx-cb');
            if (cb) cb.checked = false;
            Cards.openEdit(card.dataset.side);
          });
        }
      });
    },

    // ========= 拖拽（transform方式）=========
    applyDragOffsets: function() {
      ['bx-1', 'bx-2'].forEach(function(id) {
        var el = App.$('#' + id);
        if (!el) return;
        var off = Cards._dragOffsets[id];
        if (off) {
          el.style.transform = 'translate(' + off.x + 'px,' + off.y + 'px)';
        }
      });
    },

    bindDrag: function() {
      ['bx-1', 'bx-2'].forEach(function(id) {
        var el = App.$('#' + id);
        if (!el) return;

        var startX, startY, startOX, startOY, longPressed = false, timer, moved = false;

        el.addEventListener('touchstart', function(e) {
          if (e.target.closest('.bx-name-bar') || e.target.closest('.bx-av-placeholder')) return;

          var t = e.touches[0];
          startX = t.clientX;
          startY = t.clientY;
          longPressed = false;
          moved = false;

          timer = setTimeout(function() {
            longPressed = true;
            var off = Cards._dragOffsets[id] || { x: 0, y: 0 };
            startOX = off.x;
            startOY = off.y;
            el.style.transition = 'none';
            el.style.opacity = '0.9';
            el.style.zIndex = '999';
            if (navigator.vibrate) navigator.vibrate(15);
          }, 500);
        }, { passive: true });

        el.addEventListener('touchmove', function(e) {
          var t = e.touches[0];
          if (timer && !longPressed) {
            if (Math.abs(t.clientX - startX) > 8 || Math.abs(t.clientY - startY) > 8) {
              clearTimeout(timer); timer = null;
            }
            return;
          }
          if (!longPressed) return;
          moved = true;
          e.preventDefault();
          var dx = t.clientX - startX;
          var dy = t.clientY - startY;
          var nx = startOX + dx;
          var ny = startOY + dy;
          el.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
          Cards._dragOffsets[id] = { x: nx, y: ny };
        }, { passive: false });

        el.addEventListener('touchend', function() {
          clearTimeout(timer); timer = null;
          el.style.opacity = '';
          el.style.transition = '';
          el.style.zIndex = '';
          if (longPressed && moved) {
            Cards.saveDrag();
          }
          longPressed = false; moved = false;
        });
      });
    },

    resetAllPositions: function() {
      Cards._dragOffsets = {};
      Cards.saveDrag();
      ['bx-1', 'bx-2'].forEach(function(id) {
        var el = App.$('#' + id);
        if (el) el.style.transform = '';
      });
    },

    openEdit: function(side) {
      var d = Cards.data[side];
      var decoLabel = side === 'left' ? '标签' : '丝带';
      var decoPlaceholder1 = side === 'left' ? '如：♡ 可可爱爱' : '如：♦ 剑 修';
      var decoPlaceholder2 = side === 'left' ? '如：✦ 糖星人' : '如：✦ 客 卿';

      var old = App.$('#pcEditOverlay');
      if (old) old.remove();

      var overlay = document.createElement('div');
      overlay.id = 'pcEditOverlay';
      overlay.className = 'pc-edit-overlay';
      overlay.innerHTML =
        '<div class="pc-edit-panel">' +
          '<div class="pc-edit-title">编辑' + (side === 'left' ? '左' : '右') + '卡片</div>' +
          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">头像（URL 或上传）</label>' +
            '<div class="pc-edit-upload-row">' +
              '<input type="text" class="pc-edit-input" id="pcEditAvatar" placeholder="图片URL..." value="' + App.esc(d.avatar || '') + '">' +
              '<label class="pc-edit-file-btn" for="pcEditFile">' +
                '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
              '</label>' +
              '<input type="file" id="pcEditFile" accept="image/*" hidden>' +
            '</div>' +
          '</div>' +
          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">名字</label>' +
            '<input type="text" class="pc-edit-input" id="pcEditName" placeholder="角色名..." value="' + App.esc(d.name || '') + '">' +
          '</div>' +
          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">签名</label>' +
            '<input type="text" class="pc-edit-input" id="pcEditSub" placeholder="一句话签名..." value="' + App.esc(d.sub || '') + '">' +
          '</div>' +
          '<div class="pc-edit-row2">' +
            '<div class="pc-edit-group">' +
              '<label class="pc-edit-label">' + decoLabel + ' 1</label>' +
              '<input type="text" class="pc-edit-input" id="pcEditTag1" placeholder="' + decoPlaceholder1 + '" value="' + App.esc(d.tag1 || '') + '">' +
            '</div>' +
            '<div class="pc-edit-group">' +
              '<label class="pc-edit-label">' + decoLabel + ' 2</label>' +
              '<input type="text" class="pc-edit-input" id="pcEditTag2" placeholder="' + decoPlaceholder2 + '" value="' + App.esc(d.tag2 || '') + '">' +
            '</div>' +
          '</div>' +
          '<div class="pc-edit-group">' +
            '<label class="pc-edit-label">背面内容（翻转后显示）</label>' +
            '<textarea class="pc-edit-textarea" id="pcEditBack" rows="4" placeholder="写点什么...">' + App.esc(d.backText || '') + '</textarea>' +
          '</div>' +
          '<div class="pc-edit-btns">' +
            '<button class="pc-edit-save" id="pcEditSaveBtn" type="button">保存</button>' +
            '<button class="pc-edit-cancel" id="pcEditCancelBtn" type="button">取消</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      App.$('#pcEditFile').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var img = new Image();
          img.onload = function() {
            var canvas = document.createElement('canvas');
            var max = 400;
            var w = img.width, h = img.height;
            if (w > h) { if (w > max) { h = h * max / w; w = max; } }
            else { if (h > max) { w = w * max / h; h = max; } }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            App.$('#pcEditAvatar').value = canvas.toDataURL('image/jpeg', 0.7);
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });

      App.$('#pcEditSaveBtn').addEventListener('click', function() {
        Cards.data[side] = {
          avatar: App.$('#pcEditAvatar').value.trim(),
          name: App.$('#pcEditName').value.trim(),
          sub: App.$('#pcEditSub').value.trim(),
          tag1: App.$('#pcEditTag1').value.trim(),
          tag2: App.$('#pcEditTag2').value.trim(),
          backText: App.$('#pcEditBack').value.trim()
        };
        Cards.save();
        Cards.render();
        overlay.remove();
        App.showToast('已保存');
      });

      App.$('#pcEditCancelBtn').addEventListener('click', function() {
        overlay.remove();
      });

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
      });
    },

    init: function() {
      Cards.load();
      Cards.render();
    }
  };

  App.register('cards', Cards);
})();
