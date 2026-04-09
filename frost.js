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
  //  文字卡片（第一页）- 最终版
  // ============================
  var Eden = {
    data: {},
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    longPressTimer: null,

    DEFAULTS: {
      text: '你是我的伊甸塔',
      fontSize: 32,
      rotate: 0,
      spacing: 2,
      fontColor: '#000',
      fontUrl: '',
      fontBase64: '',
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
        Eden.data.fontBase64 = saved.fontBase64 || '';
        Eden.data.posX = saved.posX != null ? saved.posX : d.posX;
        Eden.data.posY = saved.posY != null ? saved.posY : d.posY;
      } else {
        Eden.data = JSON.parse(JSON.stringify(d));
      }
    },

    save: function() { 
      App.LS.set('edenCard', Eden.data); 
    },

    applyFont: function() {
      var el = App.$('#edenText');
      if (!el) return;
      
      // 优先使用 base64
      if (Eden.data.fontBase64 && Eden.data.fontBase64.startsWith('data:')) {
        var fontName = 'Font_' + Eden.data.fontBase64.substring(0, 50);
        if (!document.fonts.check('12px "' + fontName + '"')) {
          var font = new FontFace(fontName, 'url(' + Eden.data.fontBase64 + ')');
          font.load().then(function(loaded) {
            document.fonts.add(loaded);
            el.style.fontFamily = '"' + fontName + '", cursive';
          }).catch(function(e) { console.log('字体加载失败', e); });
        } else {
          el.style.fontFamily = '"' + fontName + '", cursive';
        }
        return;
      }
      
      // 其次使用 URL
      if (Eden.data.fontUrl && Eden.data.fontUrl.trim() !== '') {
        var urlName = 'UrlFont_' + Eden.data.fontUrl.replace(/[^a-zA-Z0-9]/g, '');
        if (!document.fonts.check('12px "' + urlName + '"')) {
          var urlFont = new FontFace(urlName, 'url(' + Eden.data.fontUrl + ')');
          urlFont.load().then(function(loaded) {
            document.fonts.add(loaded);
            el.style.fontFamily = '"' + urlName + '", cursive';
          }).catch(function(e) { console.log('URL字体加载失败', e); });
        } else {
          el.style.fontFamily = '"' + urlName + '", cursive';
        }
        return;
      }
      
      el.style.fontFamily = '';
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
      
      // 固定宽度样式
      var card = App.$('#edenCard');
      if (card) {
        card.style.width = 'calc(100% - 40px)';
        card.style.maxWidth = 'calc(100% - 40px)';
        card.style.margin = '0 20px 20px 20px';
      }
      el.style.width = '100%';
      el.style.maxWidth = '100%';
      el.style.boxSizing = 'border-box';
      
      Eden.applyFont();
      
      // 恢复位置
      if (card && (d.posX || d.posY)) {
        card.style.position = 'fixed';
        card.style.left = d.posX + 'px';
        card.style.top = d.posY + 'px';
        card.style.margin = '0';
      } else if (card) {
        card.style.position = '';
        card.style.left = '';
        card.style.top = '';
      }
    },

    fileToBase64: function(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    onTouchStart: function(e) {
      var card = App.$('#edenCard');
      if (!card) return;
      
      var touch = e.touches[0];
      Eden.startX = touch.clientX;
      Eden.startY = touch.clientY;
      
      var rect = card.getBoundingClientRect();
      Eden.currentX = rect.left;
      Eden.currentY = rect.top;
      
      Eden.longPressTimer = setTimeout(function() {
        Eden.isDragging = true;
        card.style.transition = 'none';
        card.style.zIndex = '999';
        card.classList.add('dragging');
        if (navigator.vibrate) navigator.vibrate(15);
      }, 500);
    },

    onTouchMove: function(e) {
      var touch = e.touches[0];
      var deltaX = Math.abs(touch.clientX - Eden.startX);
      var deltaY = Math.abs(touch.clientY - Eden.startY);
      
      if (deltaX > 10 || deltaY > 10) {
        if (Eden.longPressTimer) {
          clearTimeout(Eden.longPressTimer);
          Eden.longPressTimer = null;
        }
      }
      
      if (!Eden.isDragging) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      var card = App.$('#edenCard');
      if (!card) return;
      
      var newX = Eden.currentX + (touch.clientX - Eden.startX);
      var newY = Eden.currentY + (touch.clientY - Eden.startY);
      
      card.style.position = 'fixed';
      card.style.left = newX + 'px';
      card.style.top = newY + 'px';
      card.style.margin = '0';
      card.style.width = 'calc(100% - 40px)';
    },

    onTouchEnd: function(e) {
      if (Eden.longPressTimer) {
        clearTimeout(Eden.longPressTimer);
        Eden.longPressTimer = null;
      }
      
      var card = App.$('#edenCard');
      
      if (Eden.isDragging && card) {
        var rect = card.getBoundingClientRect();
        Eden.data.posX = rect.left;
        Eden.data.posY = rect.top;
        Eden.save();
        card.style.transition = '';
        card.style.zIndex = '';
        card.classList.remove('dragging');
        e.stopPropagation();
      }
      
      Eden.isDragging = false;
    },

    openEdit: function() {
      if (Eden.isDragging) return;
      
      var old = App.$('#edenCtrlWrap');
      if (old) { old.remove(); return; }

      var d = Eden.data;
      var wrap = document.createElement('div');
      wrap.id = 'edenCtrlWrap';
      wrap.className = 'eden-ctrl-wrap';
      wrap.innerHTML =
        '<div class="eden-ctrl-panel">' +
          '<div class="eden-ctrl-title">文字卡片设置</div>' +

          '<div class="eden-ctrl-section">字体</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>字体URL</label>' +
            '<input type="url" id="edenFontUrl" placeholder="https://example.com/font.ttf" value="' + App.esc(d.fontUrl || '') + '">' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>上传字体</label>' +
            '<input type="file" id="edenFontFile" accept=".ttf,.otf,.woff,.woff2">' +
          '</div>' +

          '<div class="eden-ctrl-divider"></div>' +

          '<div class="eden-ctrl-row">' +
            '<label>文字内容</label>' +
            '<textarea id="edenTextInput" rows="3" placeholder="输入文字...">' + App.esc(d.text || '') + '</textarea>' +
          '</div>' +

          '<div class="eden-ctrl-divider"></div>' +

          '<div class="eden-ctrl-row">' +
            '<label>字号</label>' +
            '<input type="range" id="edenSize" min="14" max="60" value="' + (d.fontSize || 32) + '">' +
            '<span id="edenSizeVal">' + (d.fontSize || 32) + 'px</span>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>倾斜</label>' +
            '<input type="range" id="edenRotate" min="-20" max="20" value="' + (d.rotate || 0) + '">' +
            '<span id="edenRotateVal">' + (d.rotate || 0) + '°</span>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>间距</label>' +
            '<input type="range" id="edenSpacing" min="0" max="20" value="' + (d.spacing || 0) + '">' +
            '<span id="edenSpacingVal">' + (d.spacing || 0) + 'px</span>' +
          '</div>' +

          '<div class="eden-ctrl-row">' +
            '<label>文字颜色</label>' +
            '<input type="color" id="edenColor" value="' + (d.fontColor || '#ffffff') + '">' +
          '</div>' +

          '<div class="eden-ctrl-btns">' +
            '<button class="eden-ctrl-save" id="edenSave">保存</button>' +
            '<button class="eden-ctrl-reset" id="edenReset">重置</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(wrap);

      // URL 字体
      App.$('#edenFontUrl').addEventListener('change', function() {
        var url = this.value.trim();
        Eden.data.fontUrl = url;
        Eden.data.fontBase64 = '';
        Eden.save();
        Eden.applyFont();
        App.showToast(url ? '字体URL已保存' : '已清除字体');
      });

      // 上传字体
      App.$('#edenFontFile').addEventListener('change', async function(e) {
        var file = e.target.files[0];
        if (!file) return;
        
        App.showToast('加载中...');
        
        try {
          var base64 = await Eden.fileToBase64(file);
          var testName = 'Test_' + Date.now();
          var testFont = new FontFace(testName, 'url(' + base64 + ')');
          await testFont.load();
          document.fonts.add(testFont);
          
          Eden.data.fontBase64 = base64;
          Eden.data.fontUrl = '';
          Eden.save();
          Eden.applyFont();
          App.showToast('字体已保存');
        } catch(err) {
          App.showToast('字体无效');
        }
      });

      function updatePreview() {
        var el = App.$('#edenText');
        if (!el) return;
        el.textContent = App.$('#edenTextInput').value;
        el.style.fontSize = App.$('#edenSize').value + 'px';
        el.style.transform = 'rotate(' + App.$('#edenRotate').value + 'deg)';
        el.style.letterSpacing = App.$('#edenSpacing').value + 'px';
        el.style.color = App.$('#edenColor').value;
        
        App.$('#edenSizeVal').textContent = App.$('#edenSize').value + 'px';
        App.$('#edenRotateVal').textContent = App.$('#edenRotate').value + '°';
        App.$('#edenSpacingVal').textContent = App.$('#edenSpacing').value + 'px';
      }

      App.$('#edenSize').addEventListener('input', updatePreview);
      App.$('#edenRotate').addEventListener('input', updatePreview);
      App.$('#edenSpacing').addEventListener('input', updatePreview);
      App.$('#edenColor').addEventListener('input', updatePreview);
      App.$('#edenTextInput').addEventListener('input', updatePreview);

      // 保存
      App.$('#edenSave').addEventListener('click', function() {
        Eden.data.text = App.$('#edenTextInput').value;
        Eden.data.fontSize = parseInt(App.$('#edenSize').value);
        Eden.data.rotate = parseInt(App.$('#edenRotate').value);
        Eden.data.spacing = parseInt(App.$('#edenSpacing').value);
        Eden.data.fontColor = App.$('#edenColor').value;
        Eden.save();
        
        var el = App.$('#edenText');
        if (el) {
          el.textContent = Eden.data.text;
          el.style.fontSize = Eden.data.fontSize + 'px';
          el.style.transform = 'rotate(' + Eden.data.rotate + 'deg)';
          el.style.letterSpacing = Eden.data.spacing + 'px';
          el.style.color = Eden.data.fontColor;
        }
        
        wrap.remove();
        App.showToast('已保存');
      });

      // 重置
      App.$('#edenReset').addEventListener('click', function() {
        Eden.data = JSON.parse(JSON.stringify(Eden.DEFAULTS));
        Eden.save();
        Eden.apply();
        wrap.remove();
        App.showToast('已重置');
      });

      // 点击背景关闭
      wrap.addEventListener('click', function(e) {
        if (e.target === wrap) {
          wrap.remove();
        }
      });
    },

    init: function() {
      Eden.load();
      Eden.apply();
      
      var card = App.$('#edenCard');
      if (card) {
        card.addEventListener('touchstart', Eden.onTouchStart, { passive: false });
        card.addEventListener('touchmove', Eden.onTouchMove, { passive: false });
        card.addEventListener('touchend', Eden.onTouchEnd);
        card.addEventListener('click', function(e) {
          if (Eden.isDragging) return;
          e.stopPropagation();
          Eden.openEdit();
        });
      }
    }
  };

  App.register('frost', Frost);
  App.register('eden', Eden);
})();