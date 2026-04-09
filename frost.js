(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  // ============================
  //  磨砂卡片（第二页）
  // ============================
  var Frost = {
    data: {},

    DEFAULTS: {
      mode: 'frost',
      hex: '#ffffff',
      alpha: 25,
      blur: 12,
      textColor: '#ffffff',
      text: ''
    },

    load: function() {
      var saved = App.LS.get('frostCard');
      Frost.data = {};
      var d = Frost.DEFAULTS;
      if (saved) {
        Frost.data.mode = saved.mode || d.mode;
        Frost.data.hex = saved.hex || d.hex;
        Frost.data.alpha = saved.alpha != null ? saved.alpha : d.alpha;
        Frost.data.blur = saved.blur != null ? saved.blur : d.blur;
        Frost.data.textColor = saved.textColor || d.textColor;
        Frost.data.text = saved.text || '';
      } else {
        Frost.data = JSON.parse(JSON.stringify(d));
      }
    },

    save: function() { App.LS.set('frostCard', Frost.data); },

    buildBg: function(data) {
      var hex = data.hex || '#ffffff';
      var r = parseInt(hex.substr(1,2),16);
      var g = parseInt(hex.substr(3,2),16);
      var b = parseInt(hex.substr(5,2),16);
      var a = (data.alpha || 0) / 100;
      return 'rgba('+r+','+g+','+b+','+a+')';
    },

    applyToEl: function(el, data) {
      if (!el) return;
      var bg = Frost.buildBg(data);
      var blur = 'blur('+data.blur+'px)';
      el.style.background = bg;
      el.style.backdropFilter = blur;
      el.style.webkitBackdropFilter = blur;
      if (data.mode === 'glass') {
        el.style.borderColor = 'rgba(255,255,255,0.5)';
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.15)';
      } else if (data.mode === 'gaussian') {
        el.style.borderColor = 'rgba(255,255,255,0.2)';
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
      } else {
        el.style.borderColor = 'rgba(255,255,255,0.4)';
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
      }
      if (data.text) {
        el.innerHTML = '<div class="frost-card-text" style="color:'+(data.textColor||'#ffffff')+'">'+App.esc(data.text)+'</div>';
      } else {
        el.innerHTML = '';
      }
    },

    apply: function() { Frost.applyToEl(App.$('#frostCard'), Frost.data); },

    openEdit: function() {
      var old = App.$('#frostEditOverlay');
      if (old) old.remove();
      var d = Frost.data;
      var presets = { frost:{blur:12,alpha:25}, gaussian:{blur:80,alpha:15}, glass:{blur:24,alpha:18} };
      var overlay = document.createElement('div');
      overlay.id = 'frostEditOverlay';
      overlay.className = 'pc-edit-overlay';
      overlay.innerHTML =
        '<div class="pc-edit-panel">' +
          '<div class="pc-edit-title">磨砂卡片设置</div>' +
          '<div class="frost-mode-switch">' +
            '<button class="frost-mode-btn'+(d.mode==='frost'?' active':'')+'" data-mode="frost" type="button">磨砂</button>' +
            '<button class="frost-mode-btn'+(d.mode==='gaussian'?' active':'')+'" data-mode="gaussian" type="button">高斯模糊</button>' +
            '<button class="frost-mode-btn'+(d.mode==='glass'?' active':'')+'" data-mode="glass" type="button">毛玻璃</button>' +
          '</div>' +
          '<div class="pc-edit-group"><label class="pc-edit-label">背景颜色</label><input type="color" class="pc-edit-input" id="frostHex" value="'+(d.hex||'#ffffff')+'" style="height:44px;padding:4px;"></div>' +
          '<div class="pc-edit-group"><label class="pc-edit-label">透明度</label><div class="frost-slider-row"><input type="range" id="frostAlpha" min="0" max="100" value="'+d.alpha+'"><span class="frost-slider-val" id="frostAlphaVal">'+d.alpha+'%</span></div></div>' +
          '<div class="pc-edit-group"><label class="pc-edit-label">模糊度</label><div class="frost-slider-row"><input type="range" id="frostBlur" min="0" max="200" value="'+d.blur+'"><span class="frost-slider-val" id="frostBlurVal">'+d.blur+'px</span></div></div>' +
          '<div class="pc-edit-group"><label class="pc-edit-label">文字颜色</label><input type="color" class="pc-edit-input" id="frostTextColor" value="'+(d.textColor||'#ffffff')+'" style="height:44px;padding:4px;"></div>' +
          '<div class="pc-edit-group"><label class="pc-edit-label">文字（选填）</label><input type="text" class="pc-edit-input" id="frostText" placeholder="卡片上显示的文字..." value="'+App.esc(d.text||'')+'"></div>' +
          '<div class="pc-edit-btns"><button class="pc-edit-save" id="frostSaveBtn" type="button">保存</button><button class="pc-edit-cancel" id="frostCancelBtn" type="button">取消</button></div>' +
        '</div>';
      document.body.appendChild(overlay);
      var currentMode = d.mode || 'frost';
      function getCurrent() {
        return { mode:currentMode, hex:App.$('#frostHex').value, alpha:parseInt(App.$('#frostAlpha').value), blur:parseInt(App.$('#frostBlur').value), textColor:App.$('#frostTextColor').value, text:App.$('#frostText').value.trim() };
      }
      function updateLabels() { App.$('#frostAlphaVal').textContent=App.$('#frostAlpha').value+'%'; App.$('#frostBlurVal').textContent=App.$('#frostBlur').value+'px'; }
      function preview() { updateLabels(); Frost.applyToEl(App.$('#frostCard'),getCurrent()); }
      function setSliders(p) { App.$('#frostAlpha').value=p.alpha; App.$('#frostBlur').value=p.blur; updateLabels(); preview(); }
      overlay.querySelectorAll('.frost-mode-btn').forEach(function(btn) {
        btn.addEventListener('click',function(){ overlay.querySelectorAll('.frost-mode-btn').forEach(function(b){b.classList.remove('active');}); btn.classList.add('active'); currentMode=btn.dataset.mode; setSliders(presets[currentMode]); });
      });
      ['frostHex','frostAlpha','frostBlur','frostTextColor','frostText'].forEach(function(id){ App.$('#'+id).addEventListener('input',preview); });
      App.$('#frostSaveBtn').addEventListener('click',function(){ Frost.data=getCurrent(); Frost.save(); Frost.apply(); overlay.remove(); App.showToast('已保存'); });
      App.$('#frostCancelBtn').addEventListener('click',function(){ Frost.apply(); overlay.remove(); });
      overlay.addEventListener('click',function(e){ if(e.target===overlay){Frost.apply();overlay.remove();} });
    },

    init: function() {
      Frost.load(); Frost.apply();
      var el = App.$('#frostCard');
      if (el) el.addEventListener('click',function(){Frost.openEdit();});
    }
  };

  // ============================
  //  文字卡片（第一页）- 修复版
  // ============================
  var Eden = {
    data: {},
    customFont: null,
    dragStartX: 0,
    dragStartY: 0,
    initialLeft: 0,
    initialTop: 0,
    isDragging: false,
    longPressTimer: null,
    hasMoved: false,

    DEFAULTS: {
      text: '你是我的伊甸塔',
      fontSize: 32,
      rotate: 0,
      spacing: 2,
      fontColor: '#ffffff',
      fontUrl: '',
      fontBase64: ''
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
        Eden.data.fontBase64 = saved.fontBase64 || '';
      } else {
        Eden.data = JSON.parse(JSON.stringify(d));
      }
    },

    save: function() { App.LS.set('edenCard', Eden.data); },

    loadFont: function(url, base64) {
      var textEl = App.$('#edenText');
      if (!textEl) return;
      
      var fontUrl = base64 || url;
      if (!fontUrl) {
        textEl.style.fontFamily = '';
        return;
      }
      
      var fontName = 'EdenCustom_' + Math.abs(fontUrl.length * 31);
      
      if (document.fonts.check('12px "' + fontName + '"')) {
        textEl.style.fontFamily = "'" + fontName + "', cursive";
        return;
      }
      
      var font = new FontFace(fontName, 'url(' + fontUrl + ')');
      font.load().then(function(loaded) {
        document.fonts.add(loaded);
        textEl.style.fontFamily = "'" + fontName + "', cursive";
      }).catch(function() {
        if (base64 && base64.startsWith('data:')) {
          var font2 = new FontFace(fontName, 'url(' + base64 + ')');
          font2.load().then(function(loaded2) {
            document.fonts.add(loaded2);
            textEl.style.fontFamily = "'" + fontName + "', cursive";
          }).catch(function() {});
        }
      });
    },

    apply: function() {
      var el = App.$('#edenText');
      if (!el) return;
      var d = Eden.data;
      el.textContent = d.text || '';
      el.style.fontSize = (d.fontSize || 32) + 'px';
      el.style.transform = 'rotate(' + (d.rotate || 0) + 'deg)';
      el.style.letterSpacing = (d.spacing || 0) + 'px';
      el.style.color = d.fontColor || '#ffffff';
      el.style.wordBreak = 'break-word';
      el.style.maxWidth = '100%';
      el.style.overflowWrap = 'break-word';
      Eden.loadFont(d.fontUrl, d.fontBase64);
    },

    fileToBase64: function(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    initDrag: function() {
      var card = App.$('#edenCard');
      if (!card) return;
      
      card.removeEventListener('touchstart', Eden.onTouchStart);
      card.removeEventListener('touchmove', Eden.onTouchMove);
      card.removeEventListener('touchend', Eden.onTouchEnd);
      
      card.addEventListener('touchstart', Eden.onTouchStart, { passive: false });
      card.addEventListener('touchmove', Eden.onTouchMove, { passive: false });
      card.addEventListener('touchend', Eden.onTouchEnd);
    },

    onTouchStart: function(e) {
      var card = App.$('#edenCard');
      if (!card) return;
      
      e.stopPropagation();
      
      var touch = e.touches[0];
      Eden.dragStartX = touch.clientX;
      Eden.dragStartY = touch.clientY;
      Eden.hasMoved = false;
      
      var rect = card.getBoundingClientRect();
      Eden.initialLeft = rect.left;
      Eden.initialTop = rect.top;
      
      // 长按500ms后启动拖拽
      Eden.longPressTimer = setTimeout(function() {
        Eden.isDragging = true;
        card.classList.add('dragging');
        if (navigator.vibrate) navigator.vibrate(15);
      }, 500);
    },

    onTouchMove: function(e) {
      if (!Eden.longPressTimer) return;
      
      var touch = e.touches[0];
      var deltaX = Math.abs(touch.clientX - Eden.dragStartX);
      var deltaY = Math.abs(touch.clientY - Eden.dragStartY);
      
      // 如果移动超过10px，取消长按（认为是滚动而不是拖拽）
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(Eden.longPressTimer);
        Eden.longPressTimer = null;
        return;
      }
      
      if (!Eden.isDragging) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      var card = App.$('#edenCard');
      if (!card) return;
      
      var newLeft = Eden.initialLeft + (touch.clientX - Eden.dragStartX);
      var newTop = Eden.initialTop + (touch.clientY - Eden.dragStartY);
      
      card.style.position = 'fixed';
      card.style.left = newLeft + 'px';
      card.style.top = newTop + 'px';
      card.style.width = 'calc(100% - 40px)';
      card.style.margin = '0';
      card.style.right = 'auto';
      
      Eden.hasMoved = true;
    },

    onTouchEnd: function(e) {
      clearTimeout(Eden.longPressTimer);
      Eden.longPressTimer = null;
      
      var card = App.$('#edenCard');
      if (card) {
        card.classList.remove('dragging');
      }
      
      if (Eden.isDragging && Eden.hasMoved) {
        var rect = card.getBoundingClientRect();
        Eden.data.position = { left: rect.left, top: rect.top };
        Eden.save();
        e.stopPropagation();
      }
      
      Eden.isDragging = false;
      Eden.hasMoved = false;
    },

    restorePosition: function() {
      var card = App.$('#edenCard');
      if (!card || !Eden.data.position) return;
      
      card.style.position = 'fixed';
      card.style.left = Eden.data.position.left + 'px';
      card.style.top = Eden.data.position.top + 'px';
      card.style.width = 'calc(100% - 40px)';
      card.style.margin = '0';
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
          '<div class="eden-ctrl-title">文字卡片设置</div>' +

          '<div class="eden-ctrl-section">内容</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>字体</label>' +
            '<input type="text" id="edenFontUrl" placeholder="字体URL" value="' + App.esc(d.fontUrl || '') + '">' +
            '<label class="eden-font-upload-btn" for="edenFontFile">' +
              '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            '</label>' +
            '<input type="file" id="edenFontFile" accept=".ttf,.otf,.woff,.woff2" hidden>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>文字</label>' +
            '<textarea id="edenTextInput" rows="3" placeholder="输入显示的文字...（支持换行和空格）" style="flex:1; padding:8px; font-size:13px; border-radius:8px; border:1px solid rgba(0,0,0,0.06); background:#f5f5f5; font-family:inherit; resize:vertical;">' + App.esc(d.text || '') + '</textarea>' +
          '</div>' +

          '<div class="eden-ctrl-divider"></div>' +
          '<div class="eden-ctrl-section">样式</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>字号</label>' +
            '<input type="range" id="edenSize" min="14" max="60" value="' + (d.fontSize || 32) + '">' +
            '<span class="eden-ctrl-val" id="edenSizeVal">' + (d.fontSize || 32) + 'px</span>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>倾斜</label>' +
            '<input type="range" id="edenRotate" min="-20" max="20" value="' + (d.rotate || 0) + '">' +
            '<span class="eden-ctrl-val" id="edenRotateVal">' + (d.rotate || 0) + '°</span>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>间距</label>' +
            '<input type="range" id="edenSpacing" min="0" max="20" value="' + (d.spacing || 0) + '">' +
            '<span class="eden-ctrl-val" id="edenSpacingVal">' + (d.spacing || 0) + 'px</span>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>字色</label>' +
            '<input type="color" id="edenColor" value="' + (d.fontColor || '#ffffff') + '">' +
          '</div>' +

          '<div class="eden-ctrl-btns">' +
            '<button class="eden-ctrl-save" id="edenSave" type="button">保存</button>' +
            '<button class="eden-ctrl-reset" id="edenReset" type="button">重置</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(wrap);

      wrap.addEventListener('touchstart', function(e) { e.stopPropagation(); });
      wrap.addEventListener('touchmove', function(e) { e.stopPropagation(); });

      // 字体上传
      App.$('#edenFontFile').addEventListener('change', async function(e) {
        var file = e.target.files[0];
        if (!file) return;
        
        App.showToast('字体加载中...');
        
        try {
          var base64 = await Eden.fileToBase64(file);
          var fontName = 'EdenFont_' + Date.now();
          var font = new FontFace(fontName, 'url(' + base64 + ')');
          await font.load();
          document.fonts.add(font);
          
          // 保存到数据
          Eden.data.fontBase64 = base64;
          Eden.data.fontUrl = '';
          Eden.save();
          
          // 应用到当前
          var textEl = App.$('#edenText');
          if (textEl) textEl.style.fontFamily = "'" + fontName + "', cursive";
          
          App.$('#edenFontUrl').value = '已上传: ' + file.name;
          App.showToast('字体已保存');
        } catch(err) {
          App.showToast('字体加载失败');
        }
      });

      function getCfg() {
        return {
          text: App.$('#edenTextInput').value,
          fontSize: parseInt(App.$('#edenSize').value),
          rotate: parseInt(App.$('#edenRotate').value),
          spacing: parseInt(App.$('#edenSpacing').value),
          fontColor: App.$('#edenColor').value
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

      // 保存按钮
      App.$('#edenSave').addEventListener('click', function() {
        Eden.data.text = App.$('#edenTextInput').value;
        Eden.data.fontSize = parseInt(App.$('#edenSize').value);
        Eden.data.rotate = parseInt(App.$('#edenRotate').value);
        Eden.data.spacing = parseInt(App.$('#edenSpacing').value);
        Eden.data.fontColor = App.$('#edenColor').value;
        
        Eden.save();
        Eden.apply();
        wrap.remove();
        App.showToast('已保存');
      });

      // 重置按钮
      App.$('#edenReset').addEventListener('click', function() {
        Eden.data = JSON.parse(JSON.stringify(Eden.DEFAULTS));
        Eden.save();
        Eden.apply();
        wrap.remove();
        App.showToast('已重置');
      });

      // 点击外部关闭
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
      setTimeout(function() {
        Eden.initDrag();
        Eden.restorePosition();
      }, 100);
      
      var el = App.$('#edenCard');
      if (el) {
        el.addEventListener('click', function(e) {
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
  App.register('frost', Frost);
  App.register('eden', Eden);
})();