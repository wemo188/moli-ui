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

      container.innerHTML =
        Cards.buildCard('left') +
        Cards.buildCard('right');

      Cards.bindEvents();
    },

    buildCard: function(side) {
      var d = Cards.data[side];
      var hasImg = d.avatar ? ' has-img' : '';
      var bgStyle = d.avatar ? ' style="background-image:url(\'' + App.esc(d.avatar) + '\')"' : '';

      // 装饰区域
      var decoHtml = '';
      if (side === 'left') {
        // 右上角标签
        if (d.tag1 || d.tag2) {
          decoHtml = '<div class="pc-tag-wrap">';
          if (d.tag1) decoHtml += '<div class="pc-tag pc-tag1">' + App.esc(d.tag1) + '</div>';
          if (d.tag2) decoHtml += '<div class="pc-tag pc-tag2">' + App.esc(d.tag2) + '</div>';
          decoHtml += '</div>';
        }
      } else {
        // 左侧丝带
        if (d.tag1 || d.tag2) {
          decoHtml = '<div class="pc-ribbon-wrap">';
          if (d.tag1) decoHtml += '<div class="pc-ribbon pc-ribbon1">' + App.esc(d.tag1) + '</div>';
          if (d.tag2) decoHtml += '<div class="pc-ribbon pc-ribbon2">' + App.esc(d.tag2) + '</div>';
          decoHtml += '</div>';
        }
      }

      return '<div class="profile-card" data-side="' + side + '">' +
        '<div class="pc-outer">' +
          '<div class="pc-inner">' +

            decoHtml +

            '<div class="pc-avatar-box">' +
              '<div class="pc-avatar-inner" id="pcFlip_' + side + '">' +
                '<div class="pc-front' + hasImg + '" id="pcFront_' + side + '"' + bgStyle + '>' +
                  '<div class="pc-front-placeholder">' +
                    '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' +
                    '<span>点击设置</span>' +
                  '</div>' +
                '</div>' +
                '<div class="pc-back">' +
                  '<div class="pc-back-lines"></div>' +
                  '<div class="pc-back-text" id="pcBackText_' + side + '">' + App.esc(d.backText || '') + '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="pc-name-bar">' +
              '<div class="pc-name" id="pcName_' + side + '">' + App.esc(d.name || '') + '</div>' +
              '<div class="pc-sub" id="pcSub_' + side + '">' + App.esc(d.sub || '') + '</div>' +
            '</div>' +

          '</div>' +
        '</div>' +
      '</div>';
    },

    bindEvents: function() {
      // 点击头像区域
      document.querySelectorAll('.pc-avatar-box').forEach(function(box) {
        box.addEventListener('click', function() {
          var card = box.closest('.profile-card');
          var side = card.dataset.side;
          var inner = App.$('#pcFlip_' + side);

          if (inner.classList.contains('flipped')) {
            inner.classList.remove('flipped');
          } else {
            var d = Cards.data[side];
            if (!d.avatar) {
              Cards.openEdit(side);
            } else {
              inner.classList.add('flipped');
            }
          }
        });
      });

      // 长按打开编辑
      document.querySelectorAll('.profile-card').forEach(function(card) {
        var timer = null;
        card.addEventListener('touchstart', function() {
          timer = setTimeout(function() {
            timer = null;
            Cards.openEdit(card.dataset.side);
          }, 600);
        });
        card.addEventListener('touchend', function() {
          if (timer) { clearTimeout(timer); timer = null; }
        });
        card.addEventListener('touchmove', function() {
          if (timer) { clearTimeout(timer); timer = null; }
        });
      });
    },

    openEdit: function(side) {
      var d = Cards.data[side];
      var decoLabel = side === 'left' ? '标签' : '丝带';

      var old = App.$('#pcEditOverlay');
      if (old) old.remove();

      var overlay = document.createElement('div');
      overlay.id = 'pcEditOverlay';
      overlay.className = 'pc-edit-overlay';
      overlay.innerHTML =
        '<div class="pc-edit-panel">' +
          '<div class="pc-edit-title">编辑卡片</div>' +

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
              '<input type="text" class="pc-edit-input" id="pcEditTag1" placeholder="如：♡ 可可爱爱" value="' + App.esc(d.tag1 || '') + '">' +
            '</div>' +
            '<div class="pc-edit-group">' +
              '<label class="pc-edit-label">' + decoLabel + ' 2</label>' +
              '<input type="text" class="pc-edit-input" id="pcEditTag2" placeholder="如：✦ 糖星人" value="' + App.esc(d.tag2 || '') + '">' +
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

      // 文件上传
      App.$('#pcEditFile').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          App.$('#pcEditAvatar').value = ev.target.result;
        };
        reader.readAsDataURL(file);
      });

      // 保存
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

      // 取消
      App.$('#pcEditCancelBtn').addEventListener('click', function() {
        overlay.remove();
      });

      // 点击遮罩关闭
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
