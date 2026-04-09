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

  DEFAULTS: {
    text: '你是我的伊甸塔',
    fontSize: 32,
    rotate: 0,
    spacing: 2,
    fontColor: '#ffffff',
    fontUrl: '',
    fontBase64: '',  // 新增：保存上传字体的 base64
    borderWidth: 1,
    borderColor: '#ff0000',
    bgOpacity: 0
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
      Eden.data.fontBase64 = saved.fontBase64 || '';  // 加载保存的 base64
      Eden.data.borderWidth = saved.borderWidth != null ? saved.borderWidth : d.borderWidth;
      Eden.data.borderColor = saved.borderColor || d.borderColor;
      Eden.data.bgOpacity = saved.bgOpacity != null ? saved.bgOpacity : d.bgOpacity;
    } else {
      Eden.data = JSON.parse(JSON.stringify(d));
    }
  },

  save: function() { App.LS.set('edenCard', Eden.data); },

  loadFont: function(url, base64) {
    var textEl = App.$('#edenText');
    if (!textEl) return;
    
    // 优先使用 base64（上传的字体）
    var fontUrl = base64 || url;
    if (!fontUrl) {
      textEl.style.fontFamily = '';
      return;
    }
    
    var fontName = 'EdenCustom_' + Math.abs(fontUrl.length * 31);
    
    // 如果已经加载过，直接应用
    if (document.fonts.check('12px "' + fontName + '"')) {
      textEl.style.fontFamily = "'" + fontName + "', cursive";
      return;
    }
    
    var font = new FontFace(fontName, 'url(' + fontUrl + ')');
    font.load().then(function(loaded) {
      document.fonts.add(loaded);
      textEl.style.fontFamily = "'" + fontName + "', cursive";
    }).catch(function() {
      // 加载失败，尝试用 base64 data URL
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
    el.style.border = (d.borderWidth || 1) + 'px solid ' + (d.borderColor || '#ff0000');
    el.style.backgroundColor = 'rgba(0,0,0,' + ((d.bgOpacity || 0) / 100) + ')';
    
    // 加载字体：优先用 base64，其次用 url
    Eden.loadFont(d.fontUrl, d.fontBase64);
  },

  // 将文件转成 base64 并保存
  fileToBase64: function(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // 拖拽功能
  initDrag: function() {
    var card = App.$('#edenCard');
    if (!card) return;
    
    // 移除旧监听器，避免重复
    card.removeEventListener('touchstart', Eden.onDragStart);
    card.removeEventListener('touchmove', Eden.onDragMove);
    card.removeEventListener('touchend', Eden.onDragEnd);
    
    card.addEventListener('touchstart', Eden.onDragStart, { passive: false });
    card.addEventListener('touchmove', Eden.onDragMove, { passive: false });
    card.addEventListener('touchend', Eden.onDragEnd);
  },

  onDragStart: function(e) {
    var card = App.$('#edenCard');
    if (!card) return;
    
    // 阻止事件冒泡
    e.stopPropagation();
    
    var touch = e.touches[0];
    Eden.dragStartX = touch.clientX;
    Eden.dragStartY = touch.clientY;
    
    // 获取当前位置
    var rect = card.getBoundingClientRect();
    Eden.initialLeft = rect.left;
    Eden.initialTop = rect.top;
    
    Eden.isDragging = true;
    card.classList.add('dragging');
    
    // 震动反馈
    if (navigator.vibrate) navigator.vibrate(10);
  },

  onDragMove: function(e) {
    if (!Eden.isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    
    var card = App.$('#edenCard');
    if (!card) return;
    
    var touch = e.touches[0];
    var deltaX = touch.clientX - Eden.dragStartX;
    var deltaY = touch.clientY - Eden.dragStartY;
    
    var newLeft = Eden.initialLeft + deltaX;
    var newTop = Eden.initialTop + deltaY;
    
    // 使用 fixed 定位实现拖拽
    card.style.position = 'fixed';
    card.style.left = newLeft + 'px';
    card.style.top = newTop + 'px';
    card.style.width = 'calc(100% - 40px)';
    card.style.margin = '0';
    card.style.right = 'auto';
  },

  onDragEnd: function(e) {
    if (!Eden.isDragging) return;
    e.stopPropagation();
    
    var card = App.$('#edenCard');
    if (card) {
      card.classList.remove('dragging');
      
      // 保存位置
      var rect = card.getBoundingClientRect();
      Eden.data.position = { left: rect.left, top: rect.top };
      Eden.save();
    }
    
    Eden.isDragging = false;
  },

  // 恢复保存的位置
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

        '<div class="eden-ctrl-divider"></div>' +
        '<div class="eden-ctrl-section">边框</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>边框粗细</label>' +
          '<input type="range" id="edenBorderWidth" min="0" max="20" value="' + (d.borderWidth || 1) + '">' +
          '<span class="eden-ctrl-val" id="edenBorderWidthVal">' + (d.borderWidth || 1) + 'px</span>' +
        '</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>边框颜色</label>' +
          '<input type="color" id="edenBorderColor" value="' + (d.borderColor || '#ff0000') + '">' +
        '</div>' +

        '<div class="eden-ctrl-btns">' +
          '<button class="eden-ctrl-save" id="edenSave" type="button">保存</button>' +
          '<button class="eden-ctrl-reset" id="edenReset" type="button">重置</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    wrap.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: false });
    wrap.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: false });

    // 上传字体 - 转成 base64 并保存
    App.$('#edenFontFile').addEventListener('change', async function(e) {
      var file = e.target.files[0];
      if (!file) return;
      
      App.showToast('字体加载中...');
      
      try {
        var base64 = await Eden.fileToBase64(file);
        // 测试加载字体
        var fontName = 'EdenFont_' + Date.now();
        var font = new FontFace(fontName, 'url(' + base64 + ')');
        await font.load();
        document.fonts.add(font);
        
        // 保存 base64 到数据中
        Eden.data.fontBase64 = base64;
        Eden.data.fontUrl = '';  // 清空 URL
        Eden.save();
        
        // 应用到当前
        var textEl = App.$('#edenText');
        if (textEl) textEl.style.fontFamily = "'" + fontName + "', cursive";
        
        App.$('#edenFontUrl').value = '已上传: ' + file.name;
        App.showToast('字体已保存，刷新不会丢失');
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
        fontColor: App.$('#edenColor').value,
        fontUrl: Eden.data.fontUrl,  // 保持不变
        fontBase64: Eden.data.fontBase64,  // 保持不变
        borderWidth: parseInt(App.$('#edenBorderWidth').value),
        borderColor: App.$('#edenBorderColor').value,
        bgOpacity: 0
      };
    }

    function updateLabels() {
      App.$('#edenSizeVal').textContent = App.$('#edenSize').value + 'px';
      App.$('#edenRotateVal').textContent = App.$('#edenRotate').value + '°';
      App.$('#edenSpacingVal').textContent = App.$('#edenSpacing').value + 'px';
      App.$('#edenBorderWidthVal').textContent = App.$('#edenBorderWidth').value + 'px';
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
      el.style.border = cfg.borderWidth + 'px solid ' + cfg.borderColor;
    }

    ['edenSize', 'edenRotate', 'edenSpacing', 'edenColor', 'edenTextInput', 'edenBorderWidth', 'edenBorderColor'].forEach(function(id) {
      var el = App.$('#' + id);
      if (el) el.addEventListener('input', preview);
    });

    App.$('#edenSave').addEventListener('click', function() {
      var newText = App.$('#edenTextInput').value;
      var newFontSize = parseInt(App.$('#edenSize').value);
      var newRotate = parseInt(App.$('#edenRotate').value);
      var newSpacing = parseInt(App.$('#edenSpacing').value);
      var newFontColor = App.$('#edenColor').value;
      var newBorderWidth = parseInt(App.$('#edenBorderWidth').value);
      var newBorderColor = App.$('#edenBorderColor').value;
      
      // 只更新用户调整的字段，保留 fontBase64
      Eden.data.text = newText;
      Eden.data.fontSize = newFontSize;
      Eden.data.rotate = newRotate;
      Eden.data.spacing = newSpacing;
      Eden.data.fontColor = newFontColor;
      Eden.data.borderWidth = newBorderWidth;
      Eden.data.borderColor = newBorderColor;
      
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