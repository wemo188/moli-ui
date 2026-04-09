(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  // ============================
  //  文字卡片（第一页）- 贴底部栏上方
  // ============================
  var Eden = {
    data: {},
    customFont: null,
    dragStartX: 0,
    dragStartY: 0,
    originalLeft: 0,
    originalTop: 0,
    isDragging: false,
    dragTimer: null,

    DEFAULTS: {
      text: '你是我的伊甸塔',
      fontSize: 54,
      rotate: 0,
      spacing: 2,
      fontColor: '#1a1a1a',  // 默认黑色
      fontUrl: '',
      posX: 0,
      posY: 0
    },

    load: function() {
      var saved = App.LS.get('edenCard');
      var d = Eden.DEFAULTS;
      if (saved) {
        Eden.data.text = saved.text != null ? saved.text : d.text;
        Eden.data.fontSize = saved.fontSize != null ? saved.fontSize : d.fontSize;
        Eden.data.rotate = saved.rotate != null ? saved.rotate : d.rotate;
        Eden.data.spacing = saved.spacing != null ? saved.spacing : d.spacing;
        Eden.data.fontColor = saved.fontColor || d.fontColor;
        Eden.data.fontUrl = saved.fontUrl || '';
        Eden.data.posX = saved.posX != null ? saved.posX : d.posX;
        Eden.data.posY = saved.posY != null ? saved.posY : d.posY;
      } else {
        Eden.data = JSON.parse(JSON.stringify(d));
      }
    },

    save: function() { 
      App.LS.set('edenCard', Eden.data);
    },

    loadFont: function(url) {
      if (!url) {
        var textEl = App.$('#edenText');
        if (textEl) textEl.style.fontFamily = '';
        return;
      }
      var fontName = 'EdenCustom_' + Date.now();
      var font = new FontFace(fontName, 'url(' + url + ')');
      font.load().then(function(loaded) {
        document.fonts.add(loaded);
        var textEl = App.$('#edenText');
        if (textEl) textEl.style.fontFamily = "'" + fontName + "', cursive";
      }).catch(function() {
        // 静默失败
      });
    },

    apply: function() {
      var el = App.$('#edenText');
      if (!el) return;
      var d = Eden.data;
      el.textContent = d.text || '';
      el.style.fontSize = (d.fontSize || 28) + 'px';
      el.style.transform = 'rotate(' + (d.rotate || 0) + 'deg)';
      el.style.letterSpacing = (d.spacing || 0) + 'px';
      el.style.color = d.fontColor || '#1a1a1a';
      
      // 应用拖拽位置
      var card = App.$('#edenCard');
      if (card && (d.posX || d.posY)) {
        card.style.transform = 'translate(' + d.posX + 'px, ' + d.posY + 'px)';
      }
      
      if (d.fontUrl) {
        Eden.loadFont(d.fontUrl);
      }
    },

    // 长按拖拽功能
    bindDrag: function() {
      var card = App.$('#edenCard');
      if (!card) return;
      
      var startX, startY, startPosX, startPosY, longPressed = false, timer, moved = false;
      
      card.addEventListener('touchstart', function(e) {
        // 如果点击的是编辑浮窗内的元素，不触发拖拽
        if (e.target.closest('.eden-ctrl-wrap')) return;
        
        var touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        longPressed = false;
        moved = false;
        
        // 获取当前位置
        var transform = card.style.transform;
        var match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        startPosX = match ? parseFloat(match[1]) : (Eden.data.posX || 0);
        startPosY = match ? parseFloat(match[2]) : (Eden.data.posY || 0);
        
        timer = setTimeout(function() {
          longPressed = true;
          card.classList.add('dragging');
          if (navigator.vibrate) navigator.vibrate(15);
        }, 500);
      }, { passive: true });
      
      card.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        if (timer && !longPressed) {
          if (Math.abs(touch.clientX - startX) > 8 || Math.abs(touch.clientY - startY) > 8) {
            clearTimeout(timer);
            timer = null;
          }
          return;
        }
        if (!longPressed) return;
        
        e.preventDefault();
        moved = true;
        
        var dx = touch.clientX - startX;
        var dy = touch.clientY - startY;
        var newX = startPosX + dx;
        var newY = startPosY + dy;
        
        card.style.transform = 'translate(' + newX + 'px, ' + newY + 'px)';
        Eden.data.posX = newX;
        Eden.data.posY = newY;
      }, { passive: false });
      
      card.addEventListener('touchend', function(e) {
        clearTimeout(timer);
        timer = null;
        card.classList.remove('dragging');
        
        if (longPressed && moved) {
          Eden.save();
          e.stopPropagation();
        }
        longPressed = false;
        moved = false;
      });
    },

    openEdit: function() {
      var old = App.$('#edenCtrlWrap');
      if (old) { old.remove(); return; }

      var d = Eden.data;
      var wrap = document.createElement('div');
      wrap.id = 'edenCtrlWrap';
      wrap.className = 'eden-ctrl-wrap';
      wrap.innerHTML =
        '<div class="eden-ctrl-panel">' +
          '<div class="eden-ctrl-title">文字卡片</div>' +

          '<div class="eden-ctrl-section">内容</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>字体</label>' +
            '<input type="text" id="edenFontUrl" placeholder="字体URL（留空用全局字体）" value="' + App.esc(d.fontUrl || '') + '">' +
            '<label class="eden-font-upload-btn" for="edenFontFile">' +
              '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            '</label>' +
            '<input type="file" id="edenFontFile" accept=".ttf,.otf,.woff,.woff2" hidden>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>文字</label>' +
            '<input type="text" id="edenTextInput" placeholder="输入显示的文字..." value="' + App.esc(d.text || '') + '">' +
          '</div>' +

          '<div class="eden-ctrl-divider"></div>' +
          '<div class="eden-ctrl-section">样式</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>字号</label>' +
            '<input type="range" id="edenSize" min="14" max="60" value="' + (d.fontSize || 28) + '">' +
            '<span class="eden-ctrl-val" id="edenSizeVal">' + (d.fontSize || 28) + 'px</span>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>倾斜</label>' +
            '<input type="range" id="edenRotate" min="-20" max="20" value="' + (d.rotate || 0) + '">' +
            '<span class="eden-ctrl-val" id="edenRotateVal">' + (d.rotate || 0) + '°</span>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>间距</label>' +
            '<input type="range" id="edenSpacing" min="0" max="20" value="' + (d.spacing || 2) + '">' +
            '<span class="eden-ctrl-val" id="edenSpacingVal">' + (d.spacing || 2) + 'px</span>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>字色</label>' +
            '<input type="color" id="edenColor" value="' + (d.fontColor || '#1a1a1a') + '">' +
          '</div>' +

          '<div class="eden-ctrl-btns">' +
            '<button class="eden-ctrl-save" id="edenSave" type="button">保存</button>' +
            '<button class="eden-ctrl-reset" id="edenReset" type="button">重置</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(wrap);

      // 阻止触摸传播
      wrap.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: false });
      wrap.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: false });

      // 上传字体并永久保存
      App.$('#edenFontFile').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          // 转为 dataURL 永久保存
          var dataUrl = ev.target.result;
          App.$('#edenFontUrl').value = dataUrl;
          Eden.loadFont(dataUrl);
          App.showToast('字体已加载');
        };
        reader.readAsDataURL(file);
      });

      function getCfg() {
        return {
          text: App.$('#edenTextInput').value,
          fontSize: parseInt(App.$('#edenSize').value),
          rotate: parseInt(App.$('#edenRotate').value),
          spacing: parseInt(App.$('#edenSpacing').value),
          fontColor: App.$('#edenColor').value,
          fontUrl: App.$('#edenFontUrl').value.trim()
        };
      }

      function updateLabels() {
        App.$('#edenSizeVal').textContent = App.$('#edenSize').value + 'px';
        App.$('#edenRotateVal').textContent = App.$('#edenRotate').value + '°';
        App.$('#edenSpacingVal').textContent = App.$('#edenSpacing').value + 'px';
      }

      function preview() {
        updateLabels();
        var cfg = getCfg();
        var el = App.$('#edenText');
        if (!el) return;
        el.textContent = cfg.text || '';
        el.style.fontSize = cfg.fontSize + 'px';
        el.style.transform = 'rotate(' + cfg.rotate + 'deg)';
        el.style.letterSpacing = cfg.spacing + 'px';
        el.style.color = cfg.fontColor;
      }

      ['edenSize', 'edenRotate', 'edenSpacing', 'edenColor', 'edenTextInput'].forEach(function(id) {
        var el = App.$('#' + id);
        if (el) el.addEventListener('input', preview);
      });

      App.$('#edenFontUrl').addEventListener('change', function() {
        var url = this.value.trim();
        if (url) {
          Eden.loadFont(url);
        }
      });

      App.$('#edenSave').addEventListener('click', function() {
        var cfg = getCfg();
        Eden.data.text = cfg.text;
        Eden.data.fontSize = cfg.fontSize;
        Eden.data.rotate = cfg.rotate;
        Eden.data.spacing = cfg.spacing;
        Eden.data.fontColor = cfg.fontColor;
        Eden.data.fontUrl = cfg.fontUrl;
        Eden.save();
        Eden.apply();
        wrap.remove();
        App.showToast('已保存');
      });

      App.$('#edenReset').addEventListener('click', function() {
        Eden.data = JSON.parse(JSON.stringify(Eden.DEFAULTS));
        Eden.save();
        Eden.apply();
        wrap.remove();
        App.showToast('已重置');
      });

      // 点外面关闭
      setTimeout(function() {
        function dismiss(e) {
          if (wrap.contains(e.target)) return;
          var edenCard = App.$('#edenCard');
          if (edenCard && edenCard.contains(e.target)) return;
          wrap.remove();
          document.removeEventListener('touchstart', dismiss, true);
          document.removeEventListener('click', dismiss);
        }
        document.addEventListener('touchstart', dismiss, true);
        document.addEventListener('click', dismiss);
      }, 100);
    },

    init: function() {
      Eden.load();
      Eden.apply();
      Eden.bindDrag();  // 绑定拖拽
      var el = App.$('#edenCard');
      if (el) {
        el.addEventListener('click', function(e) {
          // 拖拽时避免触发点击
          if (Eden.isDragging) return;
          e.stopPropagation();
          Eden.openEdit();
        });
      }
    }
  };

  // ============================
  //  统一注册
  // ============================
  App.register('eden', Eden);
})();