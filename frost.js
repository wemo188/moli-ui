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
//  文字卡片（第一页）
// ============================
var Eden = {
  data: {},
  customFont: null,
  dragOffset: { x: 0, y: 0 },
  isDragging: false,

  DEFAULTS: {
    text: '你是我的伊甸塔',
    fontSize: 32,
    rotate: -4,
    spacing: 6,
    fontColor: '#ffffff',
    fontUrl: '',
    bgImage: '',      // 新增：背景图片
    bgOpacity: 100    // 新增：背景透明度（0-100，100不透明）
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
      Eden.data.bgImage = saved.bgImage || '';
      Eden.data.bgOpacity = saved.bgOpacity != null ? saved.bgOpacity : d.bgOpacity;
    } else {
      Eden.data = JSON.parse(JSON.stringify(d));
    }
    // 加载拖拽偏移
    var savedDrag = App.LS.get('edenCardDrag');
    if (savedDrag) {
      Eden.dragOffset = savedDrag;
    }
  },

  save: function() { 
    App.LS.set('edenCard', Eden.data); 
  },
  
  saveDrag: function() {
    App.LS.set('edenCardDrag', Eden.dragOffset);
  },

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

  // 应用背景图片（带白色变透明效果）
  applyBg: function() {
    var card = App.$('#edenCard');
    if (!card) return;
    var d = Eden.data;
    if (d.bgImage) {
      var opacity = d.bgOpacity / 100;
      // 使用 mix-blend-mode: multiply 让白色变透明
      card.style.backgroundImage = 'url(' + d.bgImage + ')';
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
      card.style.backgroundRepeat = 'no-repeat';
      // 叠加一层半透明层来控制整体透明度
      card.style.backgroundColor = 'rgba(0,0,0,' + (1 - opacity) + ')';
      card.style.backgroundBlendMode = 'multiply';
    } else {
      card.style.backgroundImage = '';
      card.style.backgroundColor = '';
      card.style.backgroundBlendMode = '';
    }
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
    Eden.loadFont(d.fontUrl);
    Eden.applyBg();
    // 应用拖拽偏移
    var card = App.$('#edenCard');
    if (card && (Eden.dragOffset.x !== 0 || Eden.dragOffset.y !== 0)) {
      card.style.transform = 'translate(' + Eden.dragOffset.x + 'px, ' + Eden.dragOffset.y + 'px)';
    }
  },

  // 绑定拖拽
  bindDrag: function() {
    var card = App.$('#edenCard');
    if (!card) return;
    
    var startX, startY, startOX, startOY;
    var longPressed = false;
    var timer;
    var moved = false;
    
    card.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      longPressed = false;
      moved = false;
      timer = setTimeout(function() {
        longPressed = true;
        startOX = Eden.dragOffset.x;
        startOY = Eden.dragOffset.y;
        card.style.transition = 'none';
        card.classList.add('dragging');
        if (navigator.vibrate) navigator.vibrate(15);
      }, 500);
    }, {passive: true});
    
    card.addEventListener('touchmove', function(e) {
      var t = e.touches[0];
      if (timer && !longPressed) {
        if (Math.abs(t.clientX - startX) > 8 || Math.abs(t.clientY - startY) > 8) {
          clearTimeout(timer);
          timer = null;
        }
        return;
      }
      if (!longPressed) return;
      moved = true;
      e.preventDefault();
      e.stopPropagation();
      var nx = startOX + t.clientX - startX;
      var ny = startOY + t.clientY - startY;
      card.style.transform = 'translate(' + nx + 'px, ' + ny + 'px)';
      Eden.dragOffset = { x: nx, y: ny };
    }, {passive: false});
    
    card.addEventListener('touchend', function(e) {
      clearTimeout(timer);
      timer = null;
      card.classList.remove('dragging');
      card.style.transition = '';
      if (longPressed && moved) {
        Eden.saveDrag();
        e.stopPropagation();
      }
      longPressed = false;
      moved = false;
    });
  },

  resetPosition: function() {
    Eden.dragOffset = { x: 0, y: 0 };
    Eden.saveDrag();
    var card = App.$('#edenCard');
    if (card) card.style.transform = '';
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
          '<input type="text" id="edenFontUrl" placeholder="字体URL" value="' + App.esc(d.fontUrl || '') + '">' +
          '<label class="eden-font-upload-btn" for="edenFontFile">' +
            '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
          '</label>' +
          '<input type="file" id="edenFontFile" accept=".ttf,.otf,.woff,.woff2" hidden>' +
        '</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>文字</label>' +
          '<input type="text" id="edenTextInput" placeholder="输入文字..." value="' + App.esc(d.text || '') + '">' +
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
        '<div class="eden-ctrl-section">背景图片</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>图片URL</label>' +
          '<input type="text" id="edenBgImage" placeholder="背景图片URL..." value="' + App.esc(d.bgImage || '') + '">' +
          '<label class="eden-font-upload-btn" for="edenBgFile">' +
            '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
          '</label>' +
          '<input type="file" id="edenBgFile" accept="image/*" hidden>' +
        '</div>' +

        '<div class="eden-ctrl-row">' +
          '<label>透明度</label>' +
          '<input type="range" id="edenBgOpacity" min="0" max="100" value="' + (d.bgOpacity || 100) + '">' +
          '<span class="eden-ctrl-val" id="edenBgOpacityVal">' + (d.bgOpacity || 100) + '%</span>' +
        '</div>' +
        '<div id="edenBgPreview" class="eden-bg-preview" style="' + (d.bgImage ? 'background-image:url(' + d.bgImage + ');background-size:cover;background-position:center;' : '') + '"></div>' +

        '<div class="eden-ctrl-divider"></div>' +
        '<div class="eden-ctrl-section">拖拽</div>' +

        '<div class="eden-ctrl-btns">' +
          '<button class="eden-ctrl-save" id="edenSave" type="button">保存</button>' +
          '<button class="eden-ctrl-reset" id="edenReset" type="button">重置</button>' +
          '<button class="eden-ctrl-reset" id="edenResetPos" type="button">重置位置</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    // 阻止触摸传播
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
        App.$('#edenFontUrl').value = '(已上传) ' + file.name;
        App.$('#edenFontUrl').dataset.blobUrl = url;
        Eden.loadFont(url);
      };
      reader.readAsArrayBuffer(file);
    });

    // 上传背景图片
    App.$('#edenBgFile').addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var url = ev.target.result;
        App.$('#edenBgImage').value = url;
        var preview = App.$('#edenBgPreview');
        if (preview) preview.style.backgroundImage = 'url(' + url + ')';
        // 实时预览背景效果
        var tempData = {
          bgImage: url,
          bgOpacity: parseInt(App.$('#edenBgOpacity').value)
        };
        Eden.applyBgToTemp(tempData);
      };
      reader.readAsDataURL(file);
    });

    function getCfg() {
      var urlInput = App.$('#edenFontUrl');
      var fontUrl = '';
      if (urlInput.dataset.blobUrl) {
        fontUrl = urlInput.dataset.blobUrl;
      } else {
        fontUrl = urlInput.value.trim();
        if (fontUrl.startsWith('(已上传)')) fontUrl = d.fontUrl || '';
      }
      return {
        text: App.$('#edenTextInput').value,
        fontSize: parseInt(App.$('#edenSize').value),
        rotate: parseInt(App.$('#edenRotate').value),
        spacing: parseInt(App.$('#edenSpacing').value),
        fontColor: App.$('#edenColor').value,
        fontUrl: fontUrl,
        bgImage: App.$('#edenBgImage').value.trim(),
        bgOpacity: parseInt(App.$('#edenBgOpacity').value)
      };
    }

    function updateLabels() {
      App.$('#edenSizeVal').textContent = App.$('#edenSize').value + 'px';
      App.$('#edenRotateVal').textContent = App.$('#edenRotate').value + '°';
      App.$('#edenSpacingVal').textContent = App.$('#edenSpacing').value + 'px';
      App.$('#edenBgOpacityVal').textContent = App.$('#edenBgOpacity').value + '%';
      
      var bgPreview = App.$('#edenBgPreview');
      var bgImage = App.$('#edenBgImage').value;
      if (bgPreview) {
        if (bgImage) {
          bgPreview.style.backgroundImage = 'url(' + bgImage + ')';
          bgPreview.style.backgroundSize = 'cover';
          bgPreview.style.backgroundPosition = 'center';
        } else {
          bgPreview.style.backgroundImage = '';
        }
      }
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
      
      // 预览背景
      var card = App.$('#edenCard');
      if (cfg.bgImage) {
        var opacity = cfg.bgOpacity / 100;
        card.style.backgroundImage = 'url(' + cfg.bgImage + ')';
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';
        card.style.backgroundColor = 'rgba(0,0,0,' + (1 - opacity) + ')';
        card.style.backgroundBlendMode = 'multiply';
      } else {
        card.style.backgroundImage = '';
        card.style.backgroundColor = '';
        card.style.backgroundBlendMode = '';
      }
    }

    ['edenSize', 'edenRotate', 'edenSpacing', 'edenColor', 'edenTextInput', 'edenBgImage', 'edenBgOpacity'].forEach(function(id) {
      var el = App.$('#' + id);
      if (el) el.addEventListener('input', preview);
    });

    App.$('#edenFontUrl').addEventListener('change', function() {
      var url = this.value.trim();
      if (url && !url.startsWith('(已上传)')) {
        Eden.loadFont(url);
        preview();
      }
    });

    App.$('#edenSave').addEventListener('click', function() {
      var cfg = getCfg();
      if (cfg.fontUrl && cfg.fontUrl.startsWith('blob:')) {
        App.showToast('上传字体仅本次有效，建议填写在线URL');
      }
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

    App.$('#edenResetPos').addEventListener('click', function() {
      Eden.resetPosition();
      App.showToast('位置已重置');
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
