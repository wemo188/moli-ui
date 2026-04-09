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
  //  伊甸文字卡片（第一页）
  // ============================
  // ============================
//  伊甸文字卡片（第一页）- 修复版
// ============================
var Eden = {
  data: {},
  customFont: null,
  dragStartX: 0,
  dragStartY: 0,
  initialTop: 0,
  initialLeft: 0,
  isDragging: false,
  dragTimer: null,

  DEFAULTS: {
    text: '— 你是我的伊甸塔 —',
    fontSize: 32,
    rotate: 0,
    spacing: 6,
    fontColor: '#ffffff',
    fontUrl: '',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    bgOpacity: 15,
    blur: 8
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
      Eden.data.borderWidth = saved.borderWidth != null ? saved.borderWidth : d.borderWidth;
      Eden.data.borderColor = saved.borderColor || d.borderColor;
      Eden.data.borderRadius = saved.borderRadius != null ? saved.borderRadius : d.borderRadius;
      Eden.data.bgOpacity = saved.bgOpacity != null ? saved.bgOpacity : d.bgOpacity;
      Eden.data.blur = saved.blur != null ? saved.blur : d.blur;
    } else {
      Eden.data = JSON.parse(JSON.stringify(d));
    }
  },

  save: function() { App.LS.set('edenCard', Eden.data); },

  loadFont: function(url) {
    if (!url) {
      var textEl = App.$('#edenText');
      if (textEl) textEl.style.fontFamily = '';
      return;
    }
    var fontName = 'EdenCustom_' + Math.abs(url.length * 31);
    var font = new FontFace(fontName, 'url(' + url + ')');
    font.load().then(function(loaded) {
      document.fonts.add(loaded);
      var textEl = App.$('#edenText');
      if (textEl) textEl.style.fontFamily = "'" + fontName + "', cursive";
    }).catch(function() {});
  },

  apply: function() {
    var el = App.$('#edenCard');
    var textEl = App.$('#edenText');
    if (!el || !textEl) return;
    var d = Eden.data;
    
    textEl.textContent = d.text || '';
    textEl.style.fontSize = (d.fontSize || 32) + 'px';
    textEl.style.transform = 'rotate(' + (d.rotate || 0) + 'deg)';
    textEl.style.letterSpacing = (d.spacing || 0) + 'px';
    textEl.style.color = d.fontColor || '#ffffff';
    textEl.style.whiteSpace = 'pre-wrap';
    textEl.style.wordBreak = 'break-word';
    textEl.style.textAlign = 'center';
    
    // 应用边框和背景样式
    el.style.borderWidth = (d.borderWidth || 1) + 'px';
    el.style.borderColor = d.borderColor || 'rgba(255,255,255,0.3)';
    el.style.borderRadius = (d.borderRadius || 20) + 'px';
    el.style.borderStyle = 'solid';
    
    // 背景透明度和模糊
    var bgOpacity = (d.bgOpacity || 15) / 100;
    el.style.background = 'rgba(255,255,255,' + bgOpacity + ')';
    el.style.backdropFilter = 'blur(' + (d.blur || 8) + 'px)';
    el.style.webkitBackdropFilter = 'blur(' + (d.blur || 8) + 'px)';
    
    Eden.loadFont(d.fontUrl);
  },

  // 拖拽功能
  initDrag: function() {
    var el = App.$('#edenCard');
    if (!el) return;
    
    el.addEventListener('touchstart', function(e) {
      if (e.target.closest('.eden-ctrl-wrap')) return;
      var touch = e.touches[0];
      Eden.dragStartX = touch.clientX;
      Eden.dragStartY = touch.clientY;
      
      // 获取当前位置（相对于父容器）
      var rect = el.getBoundingClientRect();
      var parentRect = el.parentElement.getBoundingClientRect();
      Eden.initialLeft = rect.left - parentRect.left;
      Eden.initialTop = rect.top - parentRect.top;
      
      Eden.dragTimer = setTimeout(function() {
        Eden.isDragging = true;
        el.classList.add('dragging');
        if (navigator.vibrate) navigator.vibrate(15);
      }, 300);
    }, { passive: false });
    
    el.addEventListener('touchmove', function(e) {
      if (!Eden.isDragging) return;
      e.preventDefault();
      var touch = e.touches[0];
      var deltaX = touch.clientX - Eden.dragStartX;
      var deltaY = touch.clientY - Eden.dragStartY;
      
      var newLeft = Eden.initialLeft + deltaX;
      var newTop = Eden.initialTop + deltaY;
      
      el.style.position = 'relative';
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
      el.style.margin = '0';
    }, { passive: false });
    
    el.addEventListener('touchend', function(e) {
      clearTimeout(Eden.dragTimer);
      if (Eden.isDragging) {
        Eden.isDragging = false;
        el.classList.remove('dragging');
        // 保存位置
        var leftVal = parseFloat(el.style.left) || 0;
        var topVal = parseFloat(el.style.top) || 0;
        Eden.data.offsetX = leftVal;
        Eden.data.offsetY = topVal;
        Eden.save();
        App.showToast('位置已保存');
      }
      Eden.dragTimer = null;
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
          '<textarea id="edenTextInput" rows="2" placeholder="输入显示的文字..." style="flex:1; padding:8px; border-radius:8px; border:1px solid rgba(0,0,0,0.06); background:#f5f5f5; font-family:inherit;">' + App.esc(d.text || '') + '</textarea>' +
        '</div>' +

        '<div class="eden-ctrl-divider"></div>' +
        '<div class="eden-ctrl-section">文字样式</div>' +

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
        '<div class="eden-ctrl-section">边框 & 背景</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>边框宽</label>' +
          '<input type="range" id="edenBorderWidth" min="0" max="10" value="' + (d.borderWidth || 1) + '">' +
          '<span class="eden-ctrl-val" id="edenBorderWidthVal">' + (d.borderWidth || 1) + 'px</span>' +
        '</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>边框色</label>' +
          '<input type="color" id="edenBorderColor" value="' + (d.borderColor || '#ffffff') + '">' +
          '<span style="font-size:10px; color:#999;">透明度用颜色选择器</span>' +
        '</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>圆角</label>' +
          '<input type="range" id="edenBorderRadius" min="0" max="50" value="' + (d.borderRadius || 20) + '">' +
          '<span class="eden-ctrl-val" id="edenBorderRadiusVal">' + (d.borderRadius || 20) + 'px</span>' +
        '</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>背景透明度</label>' +
          '<input type="range" id="edenBgOpacity" min="0" max="50" value="' + (d.bgOpacity || 15) + '">' +
          '<span class="eden-ctrl-val" id="edenBgOpacityVal">' + (d.bgOpacity || 15) + '%</span>' +
        '</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>模糊度</label>' +
          '<input type="range" id="edenBlur" min="0" max="30" value="' + (d.blur || 8) + '">' +
          '<span class="eden-ctrl-val" id="edenBlurVal">' + (d.blur || 8) + 'px</span>' +
        '</div>' +

        '<div class="eden-ctrl-btns">' +
          '<button class="eden-ctrl-save" id="edenSave" type="button">保存</button>' +
          '<button class="eden-ctrl-reset" id="edenReset" type="button">重置</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    wrap.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: false });
    wrap.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: false });

    // 上传字体
    App.$('#edenFontFile').addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var blob = new Blob([ev.target.result]);
        var url = URL.createObjectURL(blob);
        App.$('#edenFontUrl').value = url;
        Eden.loadFont(url);
      };
      reader.readAsArrayBuffer(file);
    });

    function getCfg() {
      return {
        text: App.$('#edenTextInput').value,
        fontSize: parseInt(App.$('#edenSize').value),
        rotate: parseInt(App.$('#edenRotate').value),
        spacing: parseInt(App.$('#edenSpacing').value),
        fontColor: App.$('#edenColor').value,
        fontUrl: App.$('#edenFontUrl').value.trim(),
        borderWidth: parseInt(App.$('#edenBorderWidth').value),
        borderColor: App.$('#edenBorderColor').value,
        borderRadius: parseInt(App.$('#edenBorderRadius').value),
        bgOpacity: parseInt(App.$('#edenBgOpacity').value),
        blur: parseInt(App.$('#edenBlur').value)
      };
    }

    function updateLabels() {
      App.$('#edenSizeVal').textContent = App.$('#edenSize').value + 'px';
      App.$('#edenRotateVal').textContent = App.$('#edenRotate').value + '°';
      App.$('#edenSpacingVal').textContent = App.$('#edenSpacing').value + 'px';
      App.$('#edenBorderWidthVal').textContent = App.$('#edenBorderWidth').value + 'px';
      App.$('#edenBorderRadiusVal').textContent = App.$('#edenBorderRadius').value + 'px';
      App.$('#edenBgOpacityVal').textContent = App.$('#edenBgOpacity').value + '%';
      App.$('#edenBlurVal').textContent = App.$('#edenBlur').value + 'px';
    }

    function preview() {
      updateLabels();
      var cfg = getCfg();
      var el = App.$('#edenCard');
      var textEl = App.$('#edenText');
      if (!el || !textEl) return;
      
      textEl.textContent = cfg.text || '';
      textEl.style.fontSize = cfg.fontSize + 'px';
      textEl.style.transform = 'rotate(' + cfg.rotate + 'deg)';
      textEl.style.letterSpacing = cfg.spacing + 'px';
      textEl.style.color = cfg.fontColor;
      textEl.style.whiteSpace = 'pre-wrap';
      textEl.style.wordBreak = 'break-word';
      
      el.style.borderWidth = cfg.borderWidth + 'px';
      el.style.borderColor = cfg.borderColor;
      el.style.borderRadius = cfg.borderRadius + 'px';
      el.style.borderStyle = 'solid';
      
      var bgOpacity = cfg.bgOpacity / 100;
      el.style.background = 'rgba(255,255,255,' + bgOpacity + ')';
      el.style.backdropFilter = 'blur(' + cfg.blur + 'px)';
      el.style.webkitBackdropFilter = 'blur(' + cfg.blur + 'px)';
    }

    ['edenSize', 'edenRotate', 'edenSpacing', 'edenColor', 'edenTextInput',
     'edenBorderWidth', 'edenBorderColor', 'edenBorderRadius', 'edenBgOpacity', 'edenBlur'].forEach(function(id) {
      var el = App.$('#' + id);
      if (el) el.addEventListener('input', preview);
    });

    App.$('#edenFontUrl').addEventListener('change', function() {
      var url = this.value.trim();
      if (url) Eden.loadFont(url);
    });

    App.$('#edenSave').addEventListener('click', function() {
      var cfg = getCfg();
      Eden.data = cfg;
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
    Eden.initDrag();  // 初始化拖拽
    var el = App.$('#edenCard');
    if (el) {
      el.addEventListener('click', function(e) {
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
