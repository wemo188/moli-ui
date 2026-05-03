
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var DRAG_DELAY = 600;

  var DEF_CFG = {
    bgColor: '#ffffff',
    bgAlpha: 1,
    blur: 5,
    borderColor: '#dcebff',
    borderAlpha: 55,
    borderW: 1
  };

  var Dock = {
    _dragOffsets: {},
    config: {},

    load: function() {
      Dock._dragOffsets = App.LS.get('dockDragOffsets') || {};
      Dock.config = App.LS.get('dockConfig') || JSON.parse(JSON.stringify(DEF_CFG));
    },
    saveDrag: function() {
      App.LS.set('dockDragOffsets', Dock._dragOffsets);
    },
    saveConfig: function() {
      App.LS.set('dockConfig', Dock.config);
    },

    applyConfig: function(c) {
      c = c || Dock.config;
      var style = document.getElementById('dockCustomStyle');
      if(!style) {
        style = document.createElement('style');
        style.id = 'dockCustomStyle';
        document.head.appendChild(style);
      }
      var hexToRgb = function(hex) {
        if(hex.length===4) hex = '#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
        var r = parseInt(hex.slice(1,3), 16) || 255, g = parseInt(hex.slice(3,5), 16) || 255, b = parseInt(hex.slice(5,7), 16) || 255;
        return r+','+g+','+b;
      };
      var bgRgb = hexToRgb(c.bgColor);
      var borderRgb = hexToRgb(c.borderColor);

      style.innerHTML = 
        '#dockBar { ' +
          'background: rgba(' + bgRgb + ',' + (c.bgAlpha/100) + ') !important; ' +
          'backdrop-filter: blur(' + c.blur + 'px) !important; ' +
          '-webkit-backdrop-filter: blur(' + c.blur + 'px) !important; ' +
          'border: ' + c.borderW + 'px solid rgba(' + borderRgb + ',' + (c.borderAlpha/100) + ') !important; ' +
        '}' +
        '#dockBar .mk-card { ' +
          'border: ' + c.borderW + 'px solid rgba(' + borderRgb + ',' + (c.borderAlpha/100) + ') !important; ' +
        '}'+
        '.dock-item { -webkit-touch-callout: none !important; -webkit-user-select: none !important; user-select: none !important; }' +
        '.mk-card img { pointer-events: none !important; -webkit-user-drag: none !important; }';
    },

    openEdit: function() {
      var old = App.$('#dockEditOverlay'); if(old) old.remove();
      var cfgSnapshot = JSON.parse(JSON.stringify(Dock.config));
      var cfg = JSON.parse(JSON.stringify(Dock.config));

      var overlay = document.createElement('div');
      overlay.id = 'dockEditOverlay';
      overlay.className = 'pc-edit-overlay';
      var panel = document.createElement('div');
      panel.className = 'pc-edit-panel';
      panel.style.width = '280px';
      panel.style.height = 'auto';

      panel.innerHTML =
        '<div class="pc-header" id="dockDragHandle">底部栏设置<div class="pc-close-btn" id="dockCloseBtnTop">×</div></div>'+
        '<div class="pc-body" style="flex-direction:column;gap:12px;">'+
          '<div class="pc-group" style="margin-top:4px;">'+
            '<span class="pc-label">颜色（同步边框）</span>'+
            '<div class="pc-palette-grid" style="grid-template-columns: repeat(2, 1fr);">'+
              '<div class="pc-palette-item"><div class="pc-dot" id="dockDotBg" style="background:'+cfg.bgColor+';"></div><span class="pc-dot-lbl">底色</span></div>'+
              '<div class="pc-palette-item"><div class="pc-dot" id="dockDotBorder" style="background:'+cfg.borderColor+';"></div><span class="pc-dot-lbl">边框色</span></div>'+
            '</div>'+
          '</div>'+
          '<div class="pc-group"><span class="pc-label">背景透明度</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockAlpha" min="0" max="100" value="'+cfg.bgAlpha+'"><span class="pc-slider-val" id="dockAlphaVal">'+cfg.bgAlpha+'%</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">毛玻璃模糊度</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockBlur" min="0" max="50" value="'+cfg.blur+'"><span class="pc-slider-val" id="dockBlurVal">'+cfg.blur+'px</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">边框透明度</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockBorderAlpha" min="0" max="100" value="'+cfg.borderAlpha+'"><span class="pc-slider-val" id="dockBorderAlphaVal">'+cfg.borderAlpha+'%</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">边框粗细 (0为无边框)</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockBorderW" min="0" max="5" step="0.5" value="'+cfg.borderW+'"><span class="pc-slider-val" id="dockBorderWVal">'+cfg.borderW+'px</span></div></div>'+
        '</div>'+
        '<div class="pc-footer">'+
          '<button class="pc-btn pc-btn-save" id="dockSaveBtn" type="button">保 存</button>'+
          '<button class="pc-btn pc-btn-cancel" id="dockResetBtn" type="button">重 置</button>'+
        '</div>';

      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      var dockRect = App.$('#dockBar').getBoundingClientRect();
      var top = dockRect.top - panel.offsetHeight - 20;
      if (top < 10) top = 10;
      panel.style.left = Math.max(10, (window.innerWidth / 2 - 140)) + 'px';
      panel.style.top = top + 'px';

      if(App.modules.cards && App.modules.cards._bindPanelDrag) {
        App.modules.cards._bindPanelDrag(panel, '#dockDragHandle');
      }

      function preview() { Dock.applyConfig(cfg); }
      function closeAndRevert() { Dock.applyConfig(cfgSnapshot); overlay.remove(); }

      panel.querySelector('#dockCloseBtnTop').addEventListener('click', function(e){ e.stopPropagation(); closeAndRevert(); });
      overlay.addEventListener('click', function(e){ if(e.target===overlay) closeAndRevert(); });

      ['dockAlpha', 'dockBlur', 'dockBorderAlpha', 'dockBorderW'].forEach(function(id) {
        var slider = panel.querySelector('#' + id);
        var valEl = panel.querySelector('#' + id + 'Val');
        if(slider) {
          slider.addEventListener('input', function() {
            var v = parseFloat(this.value);
            valEl.textContent = v + (id==='dockBlur'||id==='dockBorderW'?'px':'%');
            if(id==='dockAlpha') cfg.bgAlpha = v;
            if(id==='dockBlur') cfg.blur = v;
            if(id==='dockBorderAlpha') cfg.borderAlpha = v;
            if(id==='dockBorderW') cfg.borderW = v;
            preview();
          });
        }
      });

      function bindColorDot(dotId, key, callerId){
        panel.querySelector(dotId).addEventListener('click',function(e){
          e.stopPropagation();if(!App.openColorPicker)return;
          App.openColorPicker(cfg[key], function(hex){
            cfg[key]=hex; panel.querySelector(dotId).style.background=hex; preview();
          }, function(hex){
            cfg[key]=hex; panel.querySelector(dotId).style.background=hex; preview();
          }, callerId);
        });
      }
      bindColorDot('#dockDotBg', 'bgColor', 'dock_bg');
      bindColorDot('#dockDotBorder', 'borderColor', 'dock_border');

      panel.querySelector('#dockResetBtn').addEventListener('click', function(e){
        e.stopPropagation();
        cfg = JSON.parse(JSON.stringify(DEF_CFG));
        panel.querySelector('#dockDotBg').style.background = cfg.bgColor;
        panel.querySelector('#dockDotBorder').style.background = cfg.borderColor;
        panel.querySelector('#dockAlpha').value = cfg.bgAlpha;
        panel.querySelector('#dockAlphaVal').textContent = cfg.bgAlpha + '%';
        panel.querySelector('#dockBlur').value = cfg.blur;
        panel.querySelector('#dockBlurVal').textContent = cfg.blur + 'px';
        panel.querySelector('#dockBorderAlpha').value = cfg.borderAlpha;
        panel.querySelector('#dockBorderAlphaVal').textContent = cfg.borderAlpha + '%';
        panel.querySelector('#dockBorderW').value = cfg.borderW;
        panel.querySelector('#dockBorderWVal').textContent = cfg.borderW + 'px';
        preview();
        App.showToast('已恢复默认');
      });

      panel.querySelector('#dockSaveBtn').addEventListener('click', function(e){
        e.stopPropagation();
        Dock.config = cfg;
        Dock.saveConfig();
        overlay.remove();
        App.showToast('底部栏设置已保存');
      });
    },

    init: function() {
      Dock.load();
      Dock.applyConfig();
      
      var items = [
        { id: 'dockMine', action: function(){ if(App.user) App.user.open(); } },
        { id: 'dockLong', action: function(){ if(App.character) App.character.open(); } },
        { id: 'dockShort', action: function(){ if(App.wechat) App.wechat.open(); } },
        { id: 'dockCheck', action: function(){ App.showToast('查岗 - 开发中'); } }
      ];

      items.forEach(function(item) {
        var el = App.$('#' + item.id);
        if (!el) return;

        var savedImg = App.LS.get('customIcon_' + item.id);
        if (savedImg) {
          var imgEl = el.querySelector('img');
          if (imgEl) imgEl.src = savedImg;
        }

        var off = Dock._dragOffsets[item.id];
        if (off) el.style.transform = 'translate(' + off.x + 'px,' + off.y + 'px)';

        var startX, startY, startOX, startOY, longPressed = false, timer = null, moved = false;
        var lastTap = 0, clickTimer = null;

        el.addEventListener('touchstart', function(e) {
          e.preventDefault(); 
          var now = Date.now();
          if (now - lastTap < 300) {
            clearTimeout(timer); clearTimeout(clickTimer);
            triggerUpload(item.id); lastTap = 0; return;
          }
          lastTap = now;

          var t = e.touches[0];
          startX = t.clientX; startY = t.clientY;
          longPressed = false; moved = false;

          timer = setTimeout(function() {
            longPressed = true;
            var curOff = Dock._dragOffsets[item.id] || {x:0, y:0};
            startOX = curOff.x; startOY = curOff.y;
            el.style.transition = 'none';
            el.style.zIndex = '999';
            if(navigator.vibrate) navigator.vibrate(15);
          }, DRAG_DELAY);
        }, {passive: false});

        el.addEventListener('touchmove', function(e) {
          var t = e.touches[0];
          if (timer && !longPressed) {
            if (Math.abs(t.clientX - startX) > 8 || Math.abs(t.clientY - startY) > 8) {
              clearTimeout(timer); timer = null;
            }
            return;
          }
          if (!longPressed) return;
          moved = true; e.preventDefault(); e.stopPropagation();
          
          var nx = startOX + t.clientX - startX;
          var ny = startOY + t.clientY - startY;

          items.forEach(function(other) {
            if (other.id !== item.id) {
              var otherOff = Dock._dragOffsets[other.id] || {x:0, y:0};
              if (Math.abs(ny - otherOff.y) < 15) { ny = otherOff.y; }
            }
          });

          el.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
          Dock._dragOffsets[item.id] = {x: nx, y: ny};
        }, {passive: false});

        el.addEventListener('touchend', function(e) {
          clearTimeout(timer); timer = null;
          el.style.transition = ''; el.style.zIndex = '';
          
          if (longPressed && moved) {
            Dock.saveDrag(); e.stopPropagation();
          } else if (!longPressed && !moved) {
            clickTimer = setTimeout(function() { item.action(); }, 300);
          }
          longPressed = false; moved = false;
        });
      });

      var dockBar = App.$('#dockBar');
      if(dockBar) {
        var dTimer = null, dLongPressed = false, dStartX, dStartY;
        dockBar.addEventListener('touchstart', function(e){
          if(e.target.closest('.dock-item')) return;
          e.preventDefault();
          var t = e.touches[0];
          dStartX = t.clientX; dStartY = t.clientY;
          dLongPressed = false;
          dTimer = setTimeout(function(){
            dLongPressed = true;
            if(navigator.vibrate) navigator.vibrate(15);
            Dock.openEdit();
          }, 600);
        }, {passive: false});
        
        dockBar.addEventListener('touchmove', function(e){
          if(dTimer && !dLongPressed){
            var t=e.touches[0];
            if(Math.abs(t.clientX-dStartX)>8 || Math.abs(t.clientY-dStartY)>8){
              clearTimeout(dTimer); dTimer=null;
            }
          }
        }, {passive:true});

        dockBar.addEventListener('touchend', function(){
          clearTimeout(dTimer); dTimer=null;
        });
      }

      function triggerUpload(id) {
        var input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = function(e) {
          var file = e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(ev) {
            var processImg = function(src) {
              App.LS.set('customIcon_' + id, src);
              var imgEl = App.$('#' + id + ' img');
              if (imgEl) imgEl.src = src;
              App.showToast('底部图标已更换');
            };
            if(App.cropImage) {
              App.cropImage(ev.target.result, function(c){ _compressImg(c, processImg); });
            } else {
              _compressImg(ev.target.result, processImg);
            }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      }

      function _compressImg(src, cb) {
        var img = new Image();
        img.onload = function() {
          var canvas = document.createElement('canvas'), max = 200, w = img.width, h = img.height;
          if(w>h) { if(w>max){h=h*max/w;w=max;} } else { if(h>max){w=w*max/h;h=max;} }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img,0,0,w,h);
          cb(canvas.toDataURL('image/jpeg',0.85));
        };
        img.src = src;
      }
    }
  };

  App.register('dock', Dock);
})();
