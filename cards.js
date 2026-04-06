(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var EMPTY = { name: '', sub: '', backText: '', avatar: '', tag1: '', tag2: '' };

  var Cards = {
    data: {},

    load: function() {
      Cards.data = App.LS.get('profileCards') || {};
      if (!Cards.data.left) Cards.data.left = JSON.parse(JSON.stringify(EMPTY));
      if (!Cards.data.right) Cards.data.right = JSON.parse(JSON.stringify(EMPTY));
    },

    save: function() {
      App.LS.set('profileCards', Cards.data);
    },

    render: function() {
      var container = App.$('#cardRow');
      if (!container) return;

      var L = Cards.data.left;
      var R = Cards.data.right;

      // bx-2 左卡片（标签款）
      var leftTagHtml = '';
      if (L.tag1 || L.tag2) {
        leftTagHtml = '<div class="bx-tag-wrap">';
        if (L.tag1) leftTagHtml += '<div class="bx-tag bx-tag1">' + App.esc(L.tag1) + '</div>';
        if (L.tag2) leftTagHtml += '<div class="bx-tag bx-tag2">' + App.esc(L.tag2) + '</div>';
        leftTagHtml += '</div>';
      }

      var leftFrontHtml = L.avatar
        ? '<div class="bx-av-front" style="background-image:url(\'' + App.esc(L.avatar) + '\')"></div>'
        : '<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';

      // bx-1 右卡片（丝带款）
      var rightRibbonHtml = '';
      if (R.tag1 || R.tag2) {
        rightRibbonHtml = '<div class="bx-side-ribbon">';
        if (R.tag1) rightRibbonHtml += '<div class="bx-ribbon-tab r1">' + App.esc(R.tag1) + '</div>';
        if (R.tag2) rightRibbonHtml += '<div class="bx-ribbon-tab r2">' + App.esc(R.tag2) + '</div>';
        rightRibbonHtml += '</div>';
      }

      var rightFrontHtml = R.avatar
        ? '<div class="bx-av-front" style="background-image:url(\'' + App.esc(R.avatar) + '\')"></div>'
        : '<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';

      container.innerHTML =
        // 左卡片 bx-2
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
                '<div class="bx-name">' + App.esc(L.name || '') + '</div>' +
                '<div class="bx-sub">' + App.esc(L.sub || '') + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // 右卡片 bx-1
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
                '<div class="bx-name">' + App.esc(R.name || '') + '</div>' +
                '<div class="bx-sub">' + App.esc(R.sub || '') + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      // checkbox唯一ID
      Cards.initFlip();
      // 长按编辑
      Cards.bindLongPress();
      // 无头像时点击打开编辑
      Cards.bindEmptyClick();
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

    bindLongPress: function() {
      document.querySelectorAll('#cardRow .bx-w').forEach(function(card) {
        var timer = null;
        card.addEventListener('touchstart', function(e) {
          timer = setTimeout(function() {
            timer = null;
            e.preventDefault();
            // 阻止翻转
            var cb = card.querySelector('.bx-cb');
            if (cb) {
              var was = cb.checked;
              setTimeout(function() { cb.checked = was; }, 10);
            }
            Cards.openEdit(card.dataset.side);
          }, 600);
        }, { passive: false });
        card.addEventListener('touchend', function() {
          if (timer) { clearTimeout(timer); timer = null; }
        });
        card.addEventListener('touchmove', function() {
          if (timer) { clearTimeout(timer); timer = null; }
        });
      });
    },

    bindEmptyClick: function() {
      document.querySelectorAll('#cardRow .bx-av-placeholder').forEach(function(ph) {
        ph.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var card = ph.closest('.bx-w');
          // 阻止checkbox触发
          var cb = card.querySelector('.bx-cb');
          if (cb) cb.checked = false;
          Cards.openEdit(card.dataset.side);
        });
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
            '<label class="pc-edit-label">背面内容（翻转后显示，支持HTML）</label>' +
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
          App.$('#pcEditAvatar').value = ev.target.result;
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
