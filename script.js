
(function() {
  'use strict';

  // 清除旧SW
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(function(rs) {
      rs.forEach(function(r) { r.unregister(); });
    });
  }

  var App = window.App = window.App || {};

  App.$ = function(s) { return document.querySelector(s); };
  App.$$ = function(s) { return document.querySelectorAll(s); };

  App.LS = (function() {
    var DB_NAME = 'AppStorage';
    var STORE_NAME = 'kv';
    var _db = null;
    var _cache = {};
    var _queue = [];
    var _readyCallbacks = [];
    var _isReady = false;

    function openDB() {
      try {
        var req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        };
        req.onsuccess = function(e) {
          _db = e.target.result;
          try {
            var tx = _db.transaction(STORE_NAME, 'readonly');
            var store = tx.objectStore(STORE_NAME);
            var all = store.openCursor();
            all.onsuccess = function(ev) {
              var cursor = ev.target.result;
              if (cursor) {
                _cache[cursor.key] = cursor.value;
                cursor.continue();
              } else {
                _isReady = true;
                _queue.forEach(function(fn) { fn(_db); });
                _queue = [];
                _readyCallbacks.forEach(function(cb) { cb(); });
                _readyCallbacks = [];
              }
            };
            all.onerror = function() { markReady(); };
          } catch(ex) { markReady(); }
        };
        req.onerror = function() { markReady(); };
      } catch(e) { markReady(); }
    }

    function markReady() {
      _isReady = true;
      _readyCallbacks.forEach(function(cb) { cb(); });
      _readyCallbacks = [];
    }

    openDB();

    return {
      get: function(k) {
        if (k in _cache) return _cache[k];
        return null;
      },

      set: function(k, v) {
        _cache[k] = v;
        if (_db) {
          try { _db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(v, k); } catch(e) {}
        } else {
          _queue.push(function(db) { try { db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(v, k); } catch(e) {} });
        }
      },

      remove: function(k) {
        delete _cache[k];
        if (_db) {
          try { _db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(k); } catch(e) {}
        } else {
          _queue.push(function(db) { try { db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(k); } catch(e) {} });
        }
      },

      getSize: function(k) {
        var val = _cache[k];
        if (val === undefined || val === null) return 0;
        try { return Math.round((k.length + JSON.stringify(val).length) * 2 / 1024); } catch(e) { return 0; }
      },

      getTotalSize: function() {
        var t = 0, keys = Object.keys(_cache);
        for (var i = 0; i < keys.length; i++) t += this.getSize(keys[i]);
        return t;
      },

      onReady: function(cb) {
        if (_isReady) cb();
        else _readyCallbacks.push(cb);
      },

      _cache: _cache
    };
  })();

  App.showToast = function(msg, duration) {
    duration = duration || 2000;
    var t = App.$('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    requestAnimationFrame(function() { t.classList.add('show'); });
    clearTimeout(t._timer);
    t._timer = setTimeout(function() {
      t.classList.remove('show');
      setTimeout(function() { t.classList.add('hidden'); }, 300);
    }, duration);
  };

  App.esc = function(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  };

  App.escAttr = function(s) {
    return (s || '').replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
  };

  App.safeOn = function(selector, event, fn) {
    var el = typeof selector === 'string' ? App.$(selector) : selector;
    if (el) el.addEventListener(event, fn);
  };

  App.copyText = function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };

  App.cropImage = function(src, callback) {
    var overlay = document.createElement('div');
    overlay.className = 'crop-overlay';
    overlay.style.zIndex = '200000';

    overlay.innerHTML =
      '<div class="crop-container">' +
        '<div class="crop-header">' +
          '<button class="crop-cancel" type="button">取消</button>' +
          '<span>裁剪图片</span>' +
          '<button class="crop-confirm" type="button">确定</button>' +
        '</div>' +
        '<div class="crop-toolbar">' +
          '<button class="crop-ratio-btn active" data-ratio="free" type="button">自由</button>' +
          '<button class="crop-ratio-btn" data-ratio="1" type="button">1:1</button>' +
          '<button class="crop-ratio-btn" data-ratio="4:3" type="button">4:3</button>' +
          '<button class="crop-ratio-btn" data-ratio="16:9" type="button">16:9</button>' +
        '</div>' +
        '<div class="crop-workspace">' +
          '<canvas id="cropCanvas"></canvas>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var canvas = overlay.querySelector('#cropCanvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var dpr = window.devicePixelRatio || 1;

    var crop = { x: 0, y: 0, w: 0, h: 0 };
    var scale = 1;
    var displayW = 0;
    var displayH = 0;
    var dragMode = '';
    var startX = 0, startY = 0;
    var startCrop = {};
    var lockedRatio = 0;
    var HANDLE = 20;
    var MIN_SIZE = 30;

    img.onload = function() {
      var workspace = overlay.querySelector('.crop-workspace');
      var maxW = workspace.clientWidth;
      var maxH = workspace.clientHeight;

      scale = Math.min(maxW / img.width, maxH / img.height, 1);
      displayW = Math.round(img.width * scale);
      displayH = Math.round(img.height * scale);

      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      canvas.style.width = displayW + 'px';
      canvas.style.height = displayH + 'px';
      ctx.scale(dpr, dpr);

      var initW = displayW * 0.7;
      var initH = displayH * 0.7;
      crop.w = initW;
      crop.h = initH;
      crop.x = (displayW - initW) / 2;
      crop.y = (displayH - initH) / 2;

      draw();
    };

    img.src = src;

    function clampCrop() {
      crop.w = Math.max(MIN_SIZE, Math.min(displayW, crop.w));
      crop.h = Math.max(MIN_SIZE, Math.min(displayH, crop.h));
      crop.x = Math.max(0, Math.min(displayW - crop.w, crop.x));
      crop.y = Math.max(0, Math.min(displayH - crop.h, crop.y));
    }

    function draw() {
      ctx.clearRect(0, 0, displayW, displayH);
      ctx.drawImage(img, 0, 0, displayW, displayH);

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, displayW, crop.y);
      ctx.fillRect(0, crop.y + crop.h, displayW, displayH - crop.y - crop.h);
      ctx.fillRect(0, crop.y, crop.x, crop.h);
      ctx.fillRect(crop.x + crop.w, crop.y, displayW - crop.x - crop.w, crop.h);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      var tw = crop.w / 3, th = crop.h / 3;
      ctx.beginPath();
      ctx.moveTo(crop.x + tw, crop.y);
      ctx.lineTo(crop.x + tw, crop.y + crop.h);
      ctx.moveTo(crop.x + tw * 2, crop.y);
      ctx.lineTo(crop.x + tw * 2, crop.y + crop.h);
      ctx.moveTo(crop.x, crop.y + th);
      ctx.lineTo(crop.x + crop.w, crop.y + th);
      ctx.moveTo(crop.x, crop.y + th * 2);
      ctx.lineTo(crop.x + crop.w, crop.y + th * 2);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      var hs = 8;
      var corners = [
        [crop.x, crop.y],
        [crop.x + crop.w, crop.y],
        [crop.x, crop.y + crop.h],
        [crop.x + crop.w, crop.y + crop.h]
      ];
      corners.forEach(function(c) {
        ctx.fillRect(c[0] - hs / 2, c[1] - hs / 2, hs, hs);
      });

      var middles = [
        [crop.x + crop.w / 2, crop.y],
        [crop.x + crop.w / 2, crop.y + crop.h],
        [crop.x, crop.y + crop.h / 2],
        [crop.x + crop.w, crop.y + crop.h / 2]
      ];
      middles.forEach(function(m) {
        ctx.fillRect(m[0] - hs / 2, m[1] - hs / 2, hs, hs);
      });
    }

    function getPos(e) {
      var t = e.touches ? e.touches[0] : e;
      var rect = canvas.getBoundingClientRect();
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }

    function hitTest(px, py) {
      var cx = crop.x, cy = crop.y, cw = crop.w, ch = crop.h;
      var H = HANDLE;

      if (px >= cx - H && px <= cx + H && py >= cy - H && py <= cy + H) return 'tl';
      if (px >= cx + cw - H && px <= cx + cw + H && py >= cy - H && py <= cy + H) return 'tr';
      if (px >= cx - H && px <= cx + H && py >= cy + ch - H && py <= cy + ch + H) return 'bl';
      if (px >= cx + cw - H && px <= cx + cw + H && py >= cy + ch - H && py <= cy + ch + H) return 'br';

      if (py >= cy - H && py <= cy + H && px > cx + H && px < cx + cw - H) return 't';
      if (py >= cy + ch - H && py <= cy + ch + H && px > cx + H && px < cx + cw - H) return 'b';
      if (px >= cx - H && px <= cx + H && py > cy + H && py < cy + ch - H) return 'l';
      if (px >= cx + cw - H && px <= cx + cw + H && py > cy + H && py < cy + ch - H) return 'r';

      if (px >= cx && px <= cx + cw && py >= cy && py <= cy + ch) return 'move';

      return '';
    }

    function applyRatio(mode, anchorX, anchorY) {
      if (!lockedRatio) return;
      if (mode === 'move') return;

      var ratio = lockedRatio;

      if (mode === 't' || mode === 'b') {
        crop.w = crop.h * ratio;
      } else if (mode === 'l' || mode === 'r') {
        crop.h = crop.w / ratio;
      } else {
        crop.h = crop.w / ratio;
      }

      if (mode === 'tl' || mode === 'bl' || mode === 'l') {
        crop.x = anchorX - crop.w;
      }
      if (mode === 'tl' || mode === 'tr' || mode === 't') {
        crop.y = anchorY - crop.h;
      }
    }

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('touchstart', onStart, { passive: false });

    function onStart(e) {
      if (e.touches && e.touches.length > 1) return;
      e.preventDefault();
      var p = getPos(e);
      dragMode = hitTest(p.x, p.y);
      if (!dragMode) return;
      startX = p.x;
      startY = p.y;
      startCrop = { x: crop.x, y: crop.y, w: crop.w, h: crop.h };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }

    function onMove(e) {
      if (!dragMode) return;
      e.preventDefault();
      var p = getPos(e);
      var dx = p.x - startX;
      var dy = p.y - startY;

      var sc = startCrop;

      if (dragMode === 'move') {
        crop.x = sc.x + dx;
        crop.y = sc.y + dy;
      } else if (dragMode === 'br') {
        crop.w = sc.w + dx;
        crop.h = sc.h + dy;
        applyRatio('br', sc.x, sc.y);
      } else if (dragMode === 'bl') {
        crop.x = sc.x + dx;
        crop.w = sc.w - dx;
        crop.h = sc.h + dy;
        applyRatio('bl', sc.x + sc.w, sc.y);
      } else if (dragMode === 'tr') {
        crop.w = sc.w + dx;
        crop.y = sc.y + dy;
        crop.h = sc.h - dy;
        applyRatio('tr', sc.x, sc.y + sc.h);
      } else if (dragMode === 'tl') {
        crop.x = sc.x + dx;
        crop.y = sc.y + dy;
        crop.w = sc.w - dx;
        crop.h = sc.h - dy;
        applyRatio('tl', sc.x + sc.w, sc.y + sc.h);
      } else if (dragMode === 'r') {
        crop.w = sc.w + dx;
        applyRatio('r', sc.x, sc.y);
      } else if (dragMode === 'l') {
        crop.x = sc.x + dx;
        crop.w = sc.w - dx;
        applyRatio('l', sc.x + sc.w, sc.y);
      } else if (dragMode === 'b') {
        crop.h = sc.h + dy;
        applyRatio('b', sc.x, sc.y);
      } else if (dragMode === 't') {
        crop.y = sc.y + dy;
        crop.h = sc.h - dy;
        applyRatio('t', sc.x, sc.y + sc.h);
      }

      clampCrop();
      draw();
    }

    function onEnd() {
      dragMode = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    }

    var lastDist = 0;
    canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        /* ✅ 修复5：双指触摸时取消单指拖拽 */
        dragMode = '';
        lastDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        var dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        var diff = dist - lastDist;
        var cx = crop.x + crop.w / 2;
        var cy = crop.y + crop.h / 2;
        var ratio = crop.w / crop.h;
        crop.w = Math.max(MIN_SIZE, crop.w + diff);
        crop.h = Math.max(MIN_SIZE, crop.h + diff / ratio);
        crop.x = cx - crop.w / 2;
        crop.y = cy - crop.h / 2;
        clampCrop();
        lastDist = dist;
        draw();
      }
    }, { passive: false });

    overlay.querySelectorAll('.crop-ratio-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        overlay.querySelectorAll('.crop-ratio-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var r = btn.dataset.ratio;
        if (r === 'free') {
          lockedRatio = 0;
        } else if (r === '1') {
          lockedRatio = 1;
        } else if (r === '4:3') {
          lockedRatio = 4 / 3;
        } else if (r === '16:9') {
          lockedRatio = 16 / 9;
        }
        if (lockedRatio) {
          var cx = crop.x + crop.w / 2;
          var cy = crop.y + crop.h / 2;
          var newW = crop.w;
          var newH = newW / lockedRatio;
          if (newH > displayH * 0.9) {
            newH = displayH * 0.9;
            newW = newH * lockedRatio;
          }
          crop.w = newW;
          crop.h = newH;
          crop.x = cx - crop.w / 2;
          crop.y = cy - crop.h / 2;
          clampCrop();
          draw();
        }
      });
    });

    overlay.querySelector('.crop-cancel').addEventListener('click', function() {
      overlay.remove();
    });

    overlay.querySelector('.crop-confirm').addEventListener('click', function() {
      var output = document.createElement('canvas');
      var outW = Math.round(crop.w / scale);
      var outH = Math.round(crop.h / scale);
      output.width = outW;
      output.height = outH;
      var outCtx = output.getContext('2d');
      outCtx.drawImage(img,
        crop.x / scale, crop.y / scale, crop.w / scale, crop.h / scale,
        0, 0, outW, outH
      );

      /* ✅ 修复6：智能判断输出格式，有透明像素用PNG，否则用JPEG */
      var mimeType = 'image/jpeg';
      var quality = 0.92;
      try {
        var imgData = outCtx.getImageData(0, 0, outW, outH);
        var hasAlpha = false;
        for (var i = 3; i < imgData.data.length; i += 4) {
          if (imgData.data[i] < 255) { hasAlpha = true; break; }
        }
        if (hasAlpha) {
          mimeType = 'image/png';
          quality = undefined;
        }
      } catch(e) {}

      var data = output.toDataURL(mimeType, quality);
      overlay.remove();
      callback(data);
    });
  };

  /* ✅ 修复8：openColorPicker 添加显式 callerId 参数 */
  
App.openColorPicker = function(currentColor, onConfirm, onChange, callerId) {
    var old = App.$('#cpOverlay');
    if (old) {
      var id = callerId || currentColor;
      if (old._callerId === id) { old._doClose(); return; }
      old._callerId = id;
      old._onConfirm = onConfirm;
      old._onChange = onChange;
      if (old._setColor) old._setColor(currentColor);
      return;
    }

    var savedPresets = App.LS.get('cpPresets') || ['#111111','#88abda','#ffffff','#9ca3af','#d1d5db','#c9706b'];

    /* 颜色工具函数 */
    function rgbToHsl(r,g,b){var max=Math.max(r,g,b),min=Math.min(r,g,b);var h=0,s=0,l=(max+min)/2;if(max!==min){var d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);if(max===r)h=((g-b)/d+(g<b?6:0))/6;else if(max===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}

    function hslToHex(h,s,l){s/=100;l/=100;var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;var r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}r=Math.round((r+m)*255);g=Math.round((g+m)*255);b=Math.round((b+m)*255);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}

    function hslToRgb(h,s,l){var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;var r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}return[Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];}

    function toRgba(hex,a){hex=hex.replace('#','');if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];return 'rgba('+parseInt(hex.substr(0,2),16)+','+parseInt(hex.substr(2,2),16)+','+parseInt(hex.substr(4,2),16)+','+(Math.round(a*100)/100)+')';}

    function parseToStop(str){str=(str||'').trim();var rm=str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i);if(rm){var r=parseInt(rm[1]),g=parseInt(rm[2]),b=parseInt(rm[3]);var a=rm[4]!==undefined?parseFloat(rm[4]):1;var hex='#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);return{color:hex,alpha:a};}return{color:str||'#111111',alpha:1};}

    function parseColor(str){str=(str||'').trim();var rm=str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i);if(rm){var r=parseInt(rm[1])/255,g=parseInt(rm[2])/255,b=parseInt(rm[3])/255;var a=rm[4]!==undefined?parseFloat(rm[4]):1;var hsl=rgbToHsl(r,g,b);return{h:hsl.h,s:hsl.s,l:hsl.l,a:Math.max(0,Math.min(1,a))};}var hex=str.replace('#','');if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];var alpha=1;if(hex.length===8){alpha=parseInt(hex.substr(6,2),16)/255;hex=hex.substr(0,6);}if(hex.length!==6)return{h:0,s:0,l:0,a:1};var rr=parseInt(hex.substr(0,2),16)/255,gg=parseInt(hex.substr(2,2),16)/255,bb=parseInt(hex.substr(4,2),16)/255;var hsl2=rgbToHsl(rr,gg,bb);return{h:hsl2.h,s:hsl2.s,l:hsl2.l,a:Math.max(0,Math.min(1,alpha))};}

    /* 解析传入值 */
    var initGrad=false,initAngle=180;
    var initStops=[{color:'#111111',alpha:1},{color:'#ffffff',alpha:1}];
    if(currentColor&&currentColor.indexOf('linear-gradient')>=0){
      initGrad=true;
      var gm=currentColor.match(/linear-gradient\(\s*(\d+)deg\s*,\s*(.+)\s*\)/);
      if(gm){initAngle=parseInt(gm[1])||180;var cp=gm[2].split(/,(?![^(]*\))/);if(cp.length>=2){initStops[0]=parseToStop(cp[0].trim());initStops[1]=parseToStop(cp[1].trim());}}
      currentColor=initStops[0].color;
    }

    var overlay=document.createElement('div');overlay.id='cpOverlay';overlay.className='cp-overlay';
    overlay._callerId=callerId||currentColor;overlay._onConfirm=onConfirm;overlay._onChange=onChange;

    /* 状态 */
    var currentHue=0,currentSat=100,currentLight=50,currentAlpha=1;
    var selectedHex=currentColor||'#111111';
    var editing=false;
    var gradMode=initGrad;
    var gradStops=[{color:initStops[0].color,alpha:initStops[0].alpha},{color:initStops[1].color,alpha:initStops[1].alpha}];
    var gradAngle=initAngle;
    var activeStop=0;

    function getSolidOutput(){if(currentAlpha>=1)return hslToHex(currentHue,currentSat,currentLight);var rgb=hslToRgb(currentHue,currentSat/100,currentLight/100);return 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+(Math.round(currentAlpha*100)/100)+')';}
    function getGradOutput(){var c1=gradStops[0].alpha<1?toRgba(gradStops[0].color,gradStops[0].alpha):gradStops[0].color;var c2=gradStops[1].alpha<1?toRgba(gradStops[1].color,gradStops[1].alpha):gradStops[1].color;return 'linear-gradient('+gradAngle+'deg,'+c1+','+c2+')';}
    function getOutput(){return gradMode?getGradOutput():getSolidOutput();}
    function getDisplayText(){if(gradMode)return getGradOutput();var hex6=hslToHex(currentHue,currentSat,currentLight);if(currentAlpha>=1)return hex6;return toRgba(hex6,currentAlpha);}

    function buildPresetsHtml(){return savedPresets.map(function(c,i){var safeC=App.escAttr(c);var bgStyle=c.indexOf('gradient')>=0?c:c.indexOf('rgba')>=0?c:safeC;return '<div class="cp-preset" data-color="'+safeC+'" data-idx="'+i+'" style="background:'+bgStyle+';"><div class="cp-preset-del">✕</div></div>';}).join('')+'<div class="cp-preset-add">+</div>';}

    overlay.innerHTML=
      '<div class="cp-panel">'+
        '<div class="cp-header"><span class="cp-title">选择颜色</span><button class="cp-close" id="cpClose" type="button">✕</button></div>'+
        '<div class="cp-preview-row"><div class="cp-preview" id="cpPreview"><div class="cp-pv-inner"></div></div><input type="text" class="cp-hex-input" id="cpHexInput" maxlength="80"></div>'+
        '<div class="cp-mode-row"><button class="cp-mode-btn'+(initGrad?'':' active')+'" data-mode="solid" type="button">纯色</button><button class="cp-mode-btn'+(initGrad?' active':'')+'" data-mode="gradient" type="button">渐变</button></div>'+
        '<div class="cp-spectrum" id="cpSpectrum"><canvas id="cpSpectrumCanvas"></canvas><div class="cp-spectrum-cursor" id="cpSpecCursor"></div></div>'+
        '<span class="cp-bar-label">色相</span>'+
        '<div class="cp-hue-wrap" id="cpHueWrap"><div class="cp-hue-bar"></div><div class="cp-hue-cursor" id="cpHueCursor"></div></div>'+
        '<span class="cp-bar-label">亮度</span>'+
        '<div class="cp-light-wrap" id="cpLightWrap"><div class="cp-light-bar" id="cpLightBar"></div><div class="cp-light-cursor" id="cpLightCursor"></div></div>'+
        '<span class="cp-bar-label">透明度</span>'+
        '<div class="cp-alpha-wrap" id="cpAlphaWrap"><div class="cp-alpha-bar" id="cpAlphaBar"></div><div class="cp-alpha-cursor" id="cpAlphaCursor"></div></div>'+
        '<div class="cp-gradient-area" id="cpGradientArea" style="'+(initGrad?'':'display:none;')+'">'+
          '<div class="cp-grad-stops"><div class="cp-grad-stop active" id="cpStop0" data-stop="0"><div class="cp-grad-dot" id="cpGradDot0"></div><span>起点</span></div><div class="cp-grad-stop" id="cpStop1" data-stop="1"><div class="cp-grad-dot" id="cpGradDot1"></div><span>终点</span></div></div>'+
          '<div class="cp-grad-preview" id="cpGradPreview"><div class="cp-grad-preview-inner" id="cpGradInner"></div></div>'+
          '<div class="cp-grad-dir"><span style="font-size:10px;color:#999;">方向</span><input type="range" id="cpGradAngle" min="0" max="360" step="1" value="'+initAngle+'"><span id="cpGradAngleVal" style="font-size:10px;color:#999;width:30px;text-align:right;">'+initAngle+'°</span></div>'+
        '</div>'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;"><div class="cp-presets" id="cpPresets">'+buildPresetsHtml()+'</div><button class="cp-preset-edit-btn" id="cpEditBtn" type="button">编辑</button></div>'+
        '<button class="cp-confirm" id="cpConfirm" type="button">确 定</button>'+
      '</div>';

    document.body.appendChild(overlay);

    /* DOM 引用 */
    var preview=overlay.querySelector('#cpPreview');
    var pvInner=preview.querySelector('.cp-pv-inner');
    var hexInput=overlay.querySelector('#cpHexInput');
    var specEl=overlay.querySelector('#cpSpectrum');
    var specCanvas=overlay.querySelector('#cpSpectrumCanvas');
    var specCtx=specCanvas.getContext('2d');
    var specCursor=overlay.querySelector('#cpSpecCursor');
    var hueWrap=overlay.querySelector('#cpHueWrap');
    var hueCursor=overlay.querySelector('#cpHueCursor');
    var lightWrap=overlay.querySelector('#cpLightWrap');
    var lightBar=overlay.querySelector('#cpLightBar');
    var lightCursor=overlay.querySelector('#cpLightCursor');
    var alphaWrap=overlay.querySelector('#cpAlphaWrap');
    var alphaBar=overlay.querySelector('#cpAlphaBar');
    var alphaCursor=overlay.querySelector('#cpAlphaCursor');
    var presetsEl=overlay.querySelector('#cpPresets');
    var gradArea=overlay.querySelector('#cpGradientArea');
    var gradInner=overlay.querySelector('#cpGradInner');
    var gradDot0=overlay.querySelector('#cpGradDot0');
    var gradDot1=overlay.querySelector('#cpGradDot1');
    var gradAngleInput=overlay.querySelector('#cpGradAngle');
    var gradAngleValEl=overlay.querySelector('#cpGradAngleVal');

    function drawSpectrum(){
      var w=specEl.clientWidth,h=specEl.clientHeight;specCanvas.width=w;specCanvas.height=h;
      var imageData=specCtx.createImageData(w,h),data=imageData.data;
      for(var y=0;y<h;y++){for(var x=0;x<w;x++){
        var s=x/w,l=1-(y/h);var rgb=hslToRgb(currentHue,s,l);var idx=(y*w+x)*4;
        data[idx]=rgb[0];data[idx+1]=rgb[1];data[idx+2]=rgb[2];data[idx+3]=255;
      }}
      specCtx.putImageData(imageData,0,0);
    }

    function updateAlphaBar(){var hex6=hslToHex(currentHue,currentSat,currentLight);alphaBar.style.background='linear-gradient(to right, transparent, '+hex6+')';}
    function updateLightBar(){var hx=hslToHex(currentHue,currentSat,50);lightBar.style.background='linear-gradient(to right, #000, '+hx+', #fff)';}
    function updateGradPreview(){if(!gradInner)return;var c1=gradStops[0].alpha<1?toRgba(gradStops[0].color,gradStops[0].alpha):gradStops[0].color;var c2=gradStops[1].alpha<1?toRgba(gradStops[1].color,gradStops[1].alpha):gradStops[1].color;gradInner.style.background='linear-gradient('+gradAngle+'deg,'+c1+','+c2+')';if(gradDot0)gradDot0.style.background=gradStops[0].color;if(gradDot1)gradDot1.style.background=gradStops[1].color;}

    function updateUI(){
      selectedHex=getOutput();
      pvInner.style.background=selectedHex;
      hexInput.value=getDisplayText();

      var sw=specEl.clientWidth,sh=specEl.clientHeight;
      specCursor.style.left=(currentSat/100)*sw+'px';
      specCursor.style.top=((100-currentLight)/100)*sh+'px';
      specCursor.style.background=hslToHex(currentHue,currentSat,currentLight);
      hueCursor.style.left=(currentHue/360)*hueWrap.clientWidth+'px';
      hueCursor.style.background=hslToHex(currentHue,100,50);
      lightCursor.style.left=(currentLight/100)*lightWrap.clientWidth+'px';
      alphaCursor.style.left=currentAlpha*alphaWrap.clientWidth+'px';
      updateAlphaBar();
      updateLightBar();

      if(gradMode){
        gradStops[activeStop].color=hslToHex(currentHue,currentSat,currentLight);
        gradStops[activeStop].alpha=currentAlpha;
        updateGradPreview();
      }

      var changeFn=overlay._onChange;if(changeFn)changeFn(selectedHex);
    }

    function setFromColor(colorStr){var parsed=parseColor(colorStr);currentHue=parsed.h;currentSat=parsed.s;currentLight=parsed.l;currentAlpha=parsed.a;drawSpectrum();updateUI();}

    setFromColor(currentColor||'#111111');
    if(initGrad)updateGradPreview();

    overlay._setColor=function(c){
      if(c&&c.indexOf('linear-gradient')>=0){
        var gm2=c.match(/linear-gradient\(\s*(\d+)deg\s*,\s*(.+)\s*\)/);
        if(gm2){gradAngle=parseInt(gm2[1])||180;var parts=gm2[2].split(/,(?![^(]*\))/);if(parts.length>=2){gradStops[0]=parseToStop(parts[0].trim());gradStops[1]=parseToStop(parts[1].trim());}}
        gradMode=true;overlay.querySelectorAll('.cp-mode-btn').forEach(function(b){b.classList.toggle('active',b.dataset.mode==='gradient');});
        if(gradArea)gradArea.style.display='';
        if(gradAngleInput){gradAngleInput.value=gradAngle;gradAngleValEl.textContent=gradAngle+'°';}
        activeStop=0;setFromColor(gradStops[0].color);currentAlpha=gradStops[0].alpha;updateGradPreview();
      } else {
        gradMode=false;overlay.querySelectorAll('.cp-mode-btn').forEach(function(b){b.classList.toggle('active',b.dataset.mode==='solid');});
        if(gradArea)gradArea.style.display='none';setFromColor(c);
      }
    };

    /* ====== 拖拽事件 ====== */
    var specDrag=false,hueDrag=false,alphaDrag=false,lightDrag=false;

    function specFromPos(e){var rect=specEl.getBoundingClientRect();var t=e.touches?e.touches[0]:e;currentSat=Math.max(0,Math.min(100,(t.clientX-rect.left)/rect.width*100));var rawL=100-(t.clientY-rect.top)/rect.height*100;currentLight=Math.max(0,Math.min(100,rawL));updateUI();}
    specEl.addEventListener('mousedown',function(e){e.preventDefault();specDrag=true;specFromPos(e);});
    specEl.addEventListener('touchstart',function(e){e.preventDefault();specDrag=true;specFromPos(e);},{passive:false});

    function hueFromPos(e){var rect=hueWrap.getBoundingClientRect();var t=e.touches?e.touches[0]:e;currentHue=Math.max(0,Math.min(360,(t.clientX-rect.left)/rect.width*360));drawSpectrum();updateUI();}
    hueWrap.addEventListener('mousedown',function(e){e.preventDefault();hueDrag=true;hueFromPos(e);});
    hueWrap.addEventListener('touchstart',function(e){e.preventDefault();hueDrag=true;hueFromPos(e);},{passive:false});

    function lightFromPos(e){var rect=lightWrap.getBoundingClientRect();var t=e.touches?e.touches[0]:e;currentLight=Math.max(0,Math.min(100,(t.clientX-rect.left)/rect.width*100));updateUI();}
    lightWrap.addEventListener('mousedown',function(e){e.preventDefault();lightDrag=true;lightFromPos(e);});
    lightWrap.addEventListener('touchstart',function(e){e.preventDefault();lightDrag=true;lightFromPos(e);},{passive:false});

    function alphaFromPos(e){var rect=alphaWrap.getBoundingClientRect();var t=e.touches?e.touches[0]:e;currentAlpha=Math.max(0,Math.min(1,(t.clientX-rect.left)/rect.width));updateUI();}
    alphaWrap.addEventListener('mousedown',function(e){e.preventDefault();alphaDrag=true;alphaFromPos(e);});
    alphaWrap.addEventListener('touchstart',function(e){e.preventDefault();alphaDrag=true;alphaFromPos(e);},{passive:false});

    function onDocMouseMove(e){if(specDrag)specFromPos(e);if(hueDrag)hueFromPos(e);if(lightDrag)lightFromPos(e);if(alphaDrag)alphaFromPos(e);}
    function onDocMouseUp(){specDrag=false;hueDrag=false;lightDrag=false;alphaDrag=false;}
    function onDocTouchMove(e){if(specDrag||hueDrag||lightDrag||alphaDrag){e.preventDefault();if(specDrag)specFromPos(e);if(hueDrag)hueFromPos(e);if(lightDrag)lightFromPos(e);if(alphaDrag)alphaFromPos(e);}}
    function onDocTouchEnd(){specDrag=false;hueDrag=false;lightDrag=false;alphaDrag=false;}

    document.addEventListener('mousemove',onDocMouseMove);
    document.addEventListener('mouseup',onDocMouseUp);
    document.addEventListener('touchmove',onDocTouchMove,{passive:false});
    document.addEventListener('touchend',onDocTouchEnd);

    /* ====== Hex 输入 ====== */
    hexInput.addEventListener('input',function(){var v=this.value.trim();if(v.indexOf('linear-gradient')>=0){overlay._setColor(v);return;}if(/^#[0-9a-fA-F]{6,8}$/.test(v)||/^rgba?\(.+\)$/.test(v)){setFromColor(v);}});

    /* ====== 模式切换 ====== */
    overlay.querySelectorAll('.cp-mode-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();
        overlay.querySelectorAll('.cp-mode-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');
        gradMode=btn.dataset.mode==='gradient';
        if(gradArea)gradArea.style.display=gradMode?'':'none';
        if(gradMode){gradStops[activeStop].color=hslToHex(currentHue,currentSat,currentLight);gradStops[activeStop].alpha=currentAlpha;updateGradPreview();}
        updateUI();
      });
    });

    /* ====== 渐变色标切换 ====== */
    overlay.querySelectorAll('.cp-grad-stop').forEach(function(stop){
      stop.addEventListener('click',function(e){e.stopPropagation();
        overlay.querySelectorAll('.cp-grad-stop').forEach(function(s){s.classList.remove('active');});stop.classList.add('active');
        activeStop=parseInt(stop.dataset.stop);setFromColor(gradStops[activeStop].color);currentAlpha=gradStops[activeStop].alpha;updateUI();
      });
    });

    /* ====== 渐变角度 ====== */
    if(gradAngleInput){gradAngleInput.addEventListener('input',function(){gradAngle=parseInt(this.value);if(gradAngleValEl)gradAngleValEl.textContent=gradAngle+'°';updateGradPreview();selectedHex=getOutput();var changeFn=overlay._onChange;if(changeFn)changeFn(selectedHex);});}

    /* ====== 预设 ====== */
    function rebindPresets(){
      presetsEl.innerHTML=buildPresetsHtml();
      if(editing)presetsEl.classList.add('editing');else presetsEl.classList.remove('editing');
      presetsEl.querySelectorAll('.cp-preset').forEach(function(p){
        p.addEventListener('click',function(e){e.stopPropagation();if(editing)return;var c=p.dataset.color;
          if(c.indexOf('linear-gradient')>=0){overlay._setColor(c);}
          else{if(gradMode){gradStops[activeStop]=parseToStop(c);updateGradPreview();updateUI();}else{setFromColor(c);}}
        });
        var del=p.querySelector('.cp-preset-del');
        if(del){del.addEventListener('click',function(e){e.stopPropagation();savedPresets.splice(parseInt(p.dataset.idx),1);App.LS.set('cpPresets',savedPresets);rebindPresets();});}
      });
      var addBtn=presetsEl.querySelector('.cp-preset-add');
      if(addBtn){addBtn.addEventListener('click',function(e){e.stopPropagation();var sc=getOutput();if(savedPresets.indexOf(sc)===-1){savedPresets.push(sc);App.LS.set('cpPresets',savedPresets);rebindPresets();}});}
    }
    rebindPresets();

    overlay.querySelector('#cpEditBtn').addEventListener('click',function(e){e.stopPropagation();editing=!editing;this.textContent=editing?'完成':'编辑';if(editing)presetsEl.classList.add('editing');else presetsEl.classList.remove('editing');});

    /* ====== 面板拖拽 ====== */
    var cpPanel=overlay.querySelector('.cp-panel');
    var cpHead=overlay.querySelector('.cp-header');
    var _cpDrag={active:false,sx:0,sy:0,ox:0,oy:0};
    cpHead.addEventListener('touchstart',function(e){
      if(e.target.closest('button'))return;
      var t=e.touches[0];var rect=cpPanel.getBoundingClientRect();
      cpPanel.style.bottom='auto';cpPanel.style.left=rect.left+'px';cpPanel.style.top=rect.top+'px';cpPanel.style.right='auto';cpPanel.style.margin='0';cpPanel.style.width=rect.width+'px';cpPanel.style.transform='none';
      _cpDrag={active:true,sx:t.clientX,sy:t.clientY,ox:rect.left,oy:rect.top};
    },{passive:true});

    function onCpDragMove(e){if(!_cpDrag.active)return;e.preventDefault();var t=e.touches[0];cpPanel.style.left=(_cpDrag.ox+t.clientX-_cpDrag.sx)+'px';cpPanel.style.top=(_cpDrag.oy+t.clientY-_cpDrag.sy)+'px';}
    function onCpDragEnd(){_cpDrag.active=false;}
    document.addEventListener('touchmove',onCpDragMove,{passive:false});
    document.addEventListener('touchend',onCpDragEnd);

    /* ====== 关闭 ====== */
    function doClose(){
      document.removeEventListener('mousemove',onDocMouseMove);document.removeEventListener('mouseup',onDocMouseUp);
      document.removeEventListener('touchmove',onDocTouchMove);document.removeEventListener('touchend',onDocTouchEnd);
      document.removeEventListener('touchmove',onCpDragMove);document.removeEventListener('touchend',onCpDragEnd);
      App._cpJustClosed=true;setTimeout(function(){App._cpJustClosed=false;},200);overlay.remove();
    }
    overlay._doClose=doClose;

    overlay.querySelector('#cpClose').addEventListener('click',function(e){e.stopPropagation();doClose();});
    overlay.querySelector('#cpConfirm').addEventListener('click',function(e){e.stopPropagation();var fn=overlay._onConfirm;if(fn)fn(getOutput());doClose();});
  };

  App.state = {
    ball: null,
    ballMenuEl: null,
    currentPanelEl: null,
    menuOpen: false,
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    lastToggleTime: 0
  };

  App.modules = App.modules || {};

  App.register = function(name, mod) {
    App.modules[name] = mod;
  };

  App.getBallRect = function() {
    return App.state.ball.getBoundingClientRect();
  };

  App.openMenu = function() {
    if (App.workshop) App.workshop.open();
  };

  App.closeMenu = function() {
    if (App.workshop) App.workshop.close();
  };

  App.toggleMenu = function() {
    var now = Date.now();
    if (now - App.state.lastToggleTime < 250) return;
    App.state.lastToggleTime = now;
    if (App.workshop) App.workshop.toggle();
  };

  App.positionMenu = function() {
    if (App.workshop) App.workshop.positionMenu();
  };

  var BALL_DEFAULTS = {
    mode: 'mascot',
    ballImg: 'https://iili.io/B7m3lY7.md.png',
    customImg: ''
  };

  App.ballConfig = null;

  App.loadBallConfig = function() {
    App.ballConfig = App.LS.get('ballConfig') || JSON.parse(JSON.stringify(BALL_DEFAULTS));
  };

  App.saveBallConfig = function() {
    App.LS.set('ballConfig', App.ballConfig);
  };

  App.applyBallMode = function() {
    var ball = App.state.ball;
    var img = App.$('#mascotImg');
    if (!ball || !img) return;

    var config = App.ballConfig;

    if (config.mode === 'ball') {
      ball.classList.add('ball-mode');
      ball.classList.remove('mascot-mode');

      var src = config.customImg || config.ballImg;
      img.src = src;
      img.classList.remove('breathing', 'waving', 'happy');

      if (App.mascot) {
        clearTimeout(App.mascot.blinkTimer);
        clearTimeout(App.mascot.idleTimer);
        App.mascot.animLock = true;
      }
    } else {
      ball.classList.remove('ball-mode');
      ball.classList.add('mascot-mode');

      if (App.mascot) {
        App.mascot.animLock = false;
        App.mascot.goIdle();
        App.mascot.startBlinkLoop();
        App.mascot.startIdleActions();
      }
    }
  };

  App.openBallSettings = function() {
    App.closeMenu();

    var old = App.$('#ballSettingsOverlay');
    if (old) old.remove();

    var config = App.ballConfig;
    var currentSrc = config.mode === 'ball'
      ? (config.customImg || config.ballImg)
      : (App.mascot ? App.mascot.sprites.idle : '');

    var overlay = document.createElement('div');
    overlay.id = 'ballSettingsOverlay';
    overlay.className = 'pc-edit-overlay';
    overlay.style.zIndex = '100020';

    overlay.innerHTML =
      '<div class="pc-edit-panel" style="width:300px;max-height:400px;overflow-y:auto;border-radius:14px;">' +
        '<div class="pc-edit-title">悬浮球设置</div>' +

        '<div style="width:64px;height:64px;border-radius:50%;overflow:hidden;margin:0 auto 16px;background:#f5f5f5;box-shadow:0 2px 8px rgba(0,0,0,0.1);">' +
          '<img id="ballSettingsPreview" src="' + App.escAttr(currentSrc) + '" style="width:100%;height:100%;object-fit:cover;">' +
        '</div>' +

        '<div class="pc-edit-group">' +
          '<label class="pc-edit-label">模式</label>' +
          '<div style="display:flex;gap:8px;">' +
            '<button type="button" class="ball-mode-btn' + (config.mode === 'mascot' ? ' active' : '') + '" data-mode="mascot" style="flex:1;padding:10px 0;border-radius:10px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;border:1px solid rgba(0,0,0,0.08);' + (config.mode === 'mascot' ? 'background:#1a1a1a;color:#fff;border-color:#1a1a1a;' : 'background:#f5f5f5;color:#666;') + '">小助手</button>' +
            '<button type="button" class="ball-mode-btn' + (config.mode === 'ball' ? ' active' : '') + '" data-mode="ball" style="flex:1;padding:10px 0;border-radius:10px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;border:1px solid rgba(0,0,0,0.08);' + (config.mode === 'ball' ? 'background:#1a1a1a;color:#fff;border-color:#1a1a1a;' : 'background:#f5f5f5;color:#666;') + '">悬浮球</button>' +
          '</div>' +
        '</div>' +

        '<div class="pc-edit-group" id="ballImgGroup" style="' + (config.mode === 'ball' ? '' : 'display:none;') + '">' +
          '<label class="pc-edit-label">自定义图片（URL 或上传）</label>' +
          '<input type="text" class="pc-edit-input" id="ballImgUrl" placeholder="图片URL..." value="' + App.escAttr(config.customImg || '') + '">' +
          '<div style="margin-top:8px;display:flex;gap:8px;">' +
            '<button type="button" id="ballUploadBtn" style="flex:1;padding:10px;background:#f5f5f5;border:1px solid rgba(0,0,0,0.06);border-radius:10px;font-size:13px;color:#666;cursor:pointer;font-family:inherit;">从相册选择</button>' +
            '<input type="file" id="ballFileInput" accept="image/*" hidden>' +
          '</div>' +
        '</div>' +

        '<div class="pc-edit-btns">' +
          '<button class="pc-edit-save" id="ballSettingsSave" type="button">保存</button>' +
          '<button class="pc-edit-cancel" id="ballSettingsCancel" type="button">取消</button>' +
        '</div>' +

        '<div style="text-align:center;margin-top:10px;">' +
          '<button type="button" id="ballSettingsReset" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:inherit;">恢复默认</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var currentMode = config.mode;

    overlay.querySelectorAll('.ball-mode-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        overlay.querySelectorAll('.ball-mode-btn').forEach(function(b) {
          b.style.background = '#f5f5f5';
          b.style.color = '#666';
          b.style.borderColor = 'rgba(0,0,0,0.08)';
          b.classList.remove('active');
        });
        btn.style.background = '#1a1a1a';
        btn.style.color = '#fff';
        btn.style.borderColor = '#1a1a1a';
        btn.classList.add('active');

        currentMode = btn.dataset.mode;

        var imgGroup = App.$('#ballImgGroup');
        if (currentMode === 'ball') {
          imgGroup.style.display = '';
          var url = App.$('#ballImgUrl').value.trim();
          App.$('#ballSettingsPreview').src = url || config.ballImg;
        } else {
          imgGroup.style.display = 'none';
          App.$('#ballSettingsPreview').src = App.mascot ? App.mascot.sprites.idle : '';
        }
      });
    });

    App.$('#ballImgUrl').addEventListener('input', function() {
      var v = this.value.trim();
      if (v) App.$('#ballSettingsPreview').src = v;
    });

    App.$('#ballUploadBtn').addEventListener('click', function() {
      App.$('#ballFileInput').click();
    });

    App.$('#ballFileInput').addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
          var canvas = document.createElement('canvas');
          var max = 200;
          var w = img.width, h = img.height;
          if (w > h) { if (w > max) { h = h * max / w; w = max; } }
          else { if (h > max) { w = w * max / h; h = max; } }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          var compressed = canvas.toDataURL('image/png', 0.9);
          App.$('#ballImgUrl').value = compressed;
          App.$('#ballSettingsPreview').src = compressed;
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    App.$('#ballSettingsSave').addEventListener('click', function() {
      App.ballConfig.mode = currentMode;
      if (currentMode === 'ball') {
        App.ballConfig.customImg = App.$('#ballImgUrl').value.trim();
      }
      App.saveBallConfig();
      App.applyBallMode();
      overlay.remove();
      var label = currentMode === 'mascot' ? '小助手模式' : '悬浮球模式';
      App.showToast('已保存 · ' + label);
    });

    App.$('#ballSettingsCancel').addEventListener('click', function() {
      overlay.remove();
    });

    App.$('#ballSettingsReset').addEventListener('click', function() {
      App.ballConfig = JSON.parse(JSON.stringify(BALL_DEFAULTS));
      App.saveBallConfig();
      App.applyBallMode();
      overlay.remove();
      App.showToast('已恢复默认');
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
  };

  App.initFloatingBall = function() {
    var ball = App.state.ball;
    if (!ball) return;

    var ballTapCount = 0;
    var ballTapTimer = null;
    var pageTapCount = 0;
    var pageTapTimer = null;
    var ballVisible = true;

    function hideBall() {
      ball.style.display = 'none';
      App.closeMenu();
      ballVisible = false;
      ballTapCount = 0;
    }

    function showBall() {
      ball.style.display = '';
      ballVisible = true;
      pageTapCount = 0;
    }

    ball.addEventListener('touchstart', function(e) {
      var t = e.touches[0];
      var rect = App.getBallRect();
      App.state.startX = t.clientX;
      App.state.startY = t.clientY;
      App.state.origX = rect.left;
      App.state.origY = rect.top;
      App.state.isDragging = true;
      App.state.hasMoved = false;
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (!App.state.isDragging) return;
      var t = e.touches[0];
      var dx = t.clientX - App.state.startX;
      var dy = t.clientY - App.state.startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) App.state.hasMoved = true;
      if (!App.state.hasMoved) return;
      var ballSize = ball.classList.contains('ball-mode') ? 48 : 150;
      var nx = Math.max(0, Math.min(window.innerWidth - ballSize, App.state.origX + dx));
      var ny = Math.max(0, Math.min(window.innerHeight - ballSize, App.state.origY + dy));
      ball.style.left = nx + 'px';
      ball.style.top = ny + 'px';
      ball.style.right = 'auto';
      ball.style.bottom = 'auto';
      if (App.workshop && App.workshop.isOpen) App.workshop.positionMenu();
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      if (!App.state.isDragging) return;
      if (!App.state.hasMoved) {
        e.preventDefault();
        ballTapCount++;
        clearTimeout(ballTapTimer);

        if (ballTapCount === 2) {
          hideBall();
          ballTapCount = 0;
        } else {
          ballTapTimer = setTimeout(function() {
            if (App.ballConfig.mode === 'mascot' && App.mascot && typeof App.mascot.onTap === 'function') {
              App.mascot.onTap();
            }
            App.toggleMenu();
            ballTapCount = 0;
          }, 350);
        }
      } else {
        var rect = App.getBallRect();
        App.LS.set('floatingBallPos', { left: rect.left, top: rect.top });
      }
      App.state.isDragging = false;
      App.state.hasMoved = false;
    }, { passive: false });

    ball.addEventListener('click', function(e) {
      e.stopPropagation();
      if ('ontouchstart' in window) return;

      ballTapCount++;
      clearTimeout(ballTapTimer);

      if (ballTapCount === 2) {
        hideBall();
        ballTapCount = 0;
      } else {
        ballTapTimer = setTimeout(function() {
          if (App.ballConfig.mode === 'mascot' && App.mascot && typeof App.mascot.onTap === 'function') {
            App.mascot.onTap();
          }
          App.toggleMenu();
          ballTapCount = 0;
        }, 350);
      }
    });

    document.addEventListener('touchend', function(e) {
      if (ballVisible) return;
      if (e.target === ball || ball.contains(e.target)) return;

      pageTapCount++;
      clearTimeout(pageTapTimer);

      if (pageTapCount === 2) {
        showBall();
        pageTapCount = 0;
      } else {
        pageTapTimer = setTimeout(function() {
          pageTapCount = 0;
        }, 400);
      }
    }, { passive: true });

    document.addEventListener('click', function(e) {
      if (ballVisible) return;
      if ('ontouchstart' in window) return;
      if (e.target === ball || ball.contains(e.target)) return;

      pageTapCount++;
      clearTimeout(pageTapTimer);

      if (pageTapCount === 2) {
        showBall();
        pageTapCount = 0;
      } else {
        pageTapTimer = setTimeout(function() {
          pageTapCount = 0;
        }, 400);
      }
    });

    App.$$('.ball-menu-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        ballTapCount = 0;
        pageTapCount = 0;
        clearTimeout(ballTapTimer);
        clearTimeout(pageTapTimer);

        if (item.id === 'ballWorkshop') {
          if (App.workshop) App.workshop.open();
          return;
        }

        var panelId = item.dataset.panel;
        if (panelId) {
          App.openPanel(panelId);
        }
      });
    });

    App.$$('.panel-close').forEach(function(btn) {
      btn.addEventListener('click', function() {
        App.closePanel();
      });
    });

    /* ✅ 修复1：重置按钮同时清除 IndexedDB，而非删掉按钮 */
    App.safeOn('#clearAllBtn', 'click', function() {
      if (!confirm('确定要重置所有设置吗？这将清除所有自定义配置。')) return;
      localStorage.clear();
      sessionStorage.clear();
      try { indexedDB.deleteDatabase('AppStorage'); } catch(e) {}
      location.reload();
    });

    var savedBallPos = App.LS.get('floatingBallPos');
    if (savedBallPos) {
      ball.style.left = savedBallPos.left + 'px';
      ball.style.top = savedBallPos.top + 'px';
      ball.style.right = 'auto';
      ball.style.bottom = 'auto';
    }

    App.mascot = {
      img: App.$('#mascotImg'),
      sprites: {
        idle:      'https://iili.io/BzMi2Jj.md.png',
        blink:     'https://iili.io/BzW0ys1.md.png',
        smile:     'https://iili.io/BzV3a9V.md.png',
        waveHappy: 'https://iili.io/BzVxcAb.md.png'
      },
      currentState: 'idle',
      animLock: false,
      blinkTimer: null,
      idleTimer: null,

      preload: function() {
        var self = this;
        Object.keys(self.sprites).forEach(function(key) {
          var img = new Image();
          img.src = self.sprites[key];
        });
      },
      setSprite: function(key) {
        if (!this.img || !this.sprites[key]) return;
        this.img.src = this.sprites[key];
        this.currentState = key;
      },
      clearAnimClass: function() {
        if (!this.img) return;
        this.img.classList.remove('breathing', 'waving', 'happy');
      },
      goIdle: function() {
        this.setSprite('idle');
        this.clearAnimClass();
        this.img.classList.add('breathing');
        this.animLock = false;
      },
      doBlink: function() {
        var self = this;
        if (self.animLock) return;
        self.setSprite('blink');
        setTimeout(function() {
          if (self.currentState === 'blink') self.goIdle();
        }, 250);
      },
      doAction: function(action) {
        var self = this;
        if (self.animLock) return;
        self.animLock = true;
        self.clearAnimClass();
        switch (action) {
          case 'smile':
            self.setSprite('smile');
            self.img.classList.add('happy');
            setTimeout(function() { self.goIdle(); }, 2000);
            break;
          case 'wave':
            self.setSprite('waveHappy');
            self.img.classList.add('waving');
            setTimeout(function() { self.goIdle(); }, 1500);
            break;
          default:
            self.goIdle();
        }
      },
      startBlinkLoop: function() {
        var self = this;
        clearTimeout(self.blinkTimer);
        function go() {
          self.blinkTimer = setTimeout(function() {
            if (!self.animLock) self.doBlink();
            go();
          }, 3000 + Math.random() * 5000);
        }
        go();
      },
      startIdleActions: function() {
        var self = this;
        var acts = ['smile', 'wave'];
        clearTimeout(self.idleTimer);
        function go() {
          self.idleTimer = setTimeout(function() {
            if (!self.animLock) {
              self.doAction(acts[Math.floor(Math.random() * acts.length)]);
            }
            go();
          }, 10000 + Math.random() * 15000);
        }
        go();
      },
      onTap: function() {
        var acts = ['wave', 'smile'];
        this.doAction(acts[Math.floor(Math.random() * acts.length)]);
      },
      init: function() {
        if (!this.img) return;
        this.preload();
        this.goIdle();
        this.startBlinkLoop();
        this.startIdleActions();
      }
    };

    App.mascot.init();

    /* ✅ 修复7：页面不可见时暂停 mascot 定时器，恢复时重启 */
    document.addEventListener('visibilitychange', function() {
      if (!App.mascot) return;
      if (document.hidden) {
        clearTimeout(App.mascot.blinkTimer);
        clearTimeout(App.mascot.idleTimer);
      } else {
        if (App.ballConfig && App.ballConfig.mode === 'mascot' && !App.mascot.animLock) {
          App.mascot.startBlinkLoop();
          App.mascot.startIdleActions();
        }
      }
    });

    App.loadBallConfig();
    App.applyBallMode();

    if (App.ballConfig.mode === 'mascot') {
      setTimeout(function() {
        if (App.mascot) App.mascot.doAction('wave');
      }, 1000);
    }
  };

  App.runInits = function() {
    Object.keys(App.modules).forEach(function(name) {
      var mod = App.modules[name];
      if (mod && typeof mod.init === 'function') {
        try { mod.init(); } catch (e) {
          console.warn('模块 ' + name + ' 初始化失败:', e);
        }
      }
    });
  };

  App.initMainPages = function() {
    var slider = App.$('#pageSlider');
    var dots = App.$$('.screen-dot');

    if (!slider) return;

    var currentPage = 0;
    var totalPages = 2;
    var startX = 0;
    var startY = 0;
    var currentX = 0;
    var baseX = 0;
    var dragging = false;
    var directionLocked = false;
    var isHorizontal = false;
    var pageWidth = window.innerWidth;

    function updateDots() {
      dots.forEach(function(dot, idx) {
        dot.classList.toggle('active', idx === currentPage);
      });
    }

    function snapToPage(animate) {
      pageWidth = window.innerWidth;
      var targetX = -currentPage * pageWidth;
      if (animate) {
        slider.style.transition = 'transform 0.42s cubic-bezier(0.22, 0.8, 0.2, 1)';
      } else {
        slider.style.transition = 'none';
      }
      slider.style.transform = 'translate3d(' + targetX + 'px,0,0)';
      updateDots();
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var idx = parseInt(dot.dataset.screen, 10) || 0;
        currentPage = Math.max(0, Math.min(totalPages - 1, idx));
        snapToPage(true);
      });
    });

    slider.addEventListener('touchstart', function(e) {
      if (!e.touches || !e.touches.length) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = startX;
      pageWidth = window.innerWidth;
      baseX = -currentPage * pageWidth;
      dragging = true;
      directionLocked = false;
      isHorizontal = false;
      slider.style.transition = 'none';
    }, { passive: true });

    slider.addEventListener('touchmove', function(e) {
      if (!dragging || !e.touches || !e.touches.length) return;
      currentX = e.touches[0].clientX;
      var currentY = e.touches[0].clientY;
      var dx = Math.abs(currentX - startX);
      var dy = Math.abs(currentY - startY);
      if (!directionLocked && (dx > 12 || dy > 12)) {
        directionLocked = true;
        isHorizontal = dx > dy;
      }
      if (!directionLocked || !isHorizontal) return;
      e.preventDefault();
      var deltaX = currentX - startX;
      var nextX = baseX + deltaX;
      var maxLeft = -(totalPages - 1) * pageWidth;
      if (nextX > 0) nextX = nextX * 0.28;
      if (nextX < maxLeft) nextX = maxLeft + (nextX - maxLeft) * 0.28;
      slider.style.transform = 'translate3d(' + nextX + 'px,0,0)';
    }, { passive: false });

    slider.addEventListener('touchend', function() {
      if (!dragging) return;
      dragging = false;
      if (!isHorizontal) return;
      var deltaX = currentX - startX;
      var threshold = pageWidth * 0.16;
      if (Math.abs(deltaX) > threshold) {
        if (deltaX < 0 && currentPage < totalPages - 1) currentPage += 1;
        else if (deltaX > 0 && currentPage > 0) currentPage -= 1;
      }
      snapToPage(true);
    }, { passive: true });

    window.addEventListener('resize', function() {
      snapToPage(false);
    });

    (function() {
      var grid = App.$('#appGrid');
      if (!grid) return;

      function restoreIconImages() {
        grid.querySelectorAll('.app-icon').forEach(function(icon) {
          var key = icon.dataset.icon;
          if (!key) return;
          var saved = App.LS.get('iconImg_' + key);
          if (saved) {
            var imgEl = icon.querySelector('.app-icon-img');
            if (imgEl) imgEl.innerHTML = '<img src="' + saved + '">';
          }
        });
      }

      function showLongPressMenu(icon, x, y) {
        var old = App.$('#iconLongPressMenu');
        if (old) old.remove();

        var menu = document.createElement('div');
        menu.id = 'iconLongPressMenu';
        menu.className = 'icon-longpress-menu';
        menu.innerHTML =
          '<div class="icon-longpress-menu-item" id="iconMenuChangeImg">更换图标图片</div>' +
          '<div class="icon-longpress-menu-item" id="iconMenuResetImg">恢复默认图标</div>';
        menu.style.left = Math.min(x, window.innerWidth - 160) + 'px';
        menu.style.top = Math.min(y, window.innerHeight - 100) + 'px';
        document.body.appendChild(menu);

        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.hidden = true;
        document.body.appendChild(fileInput);

        App.safeOn('#iconMenuChangeImg', 'click', function() {
          fileInput.click();
          menu.remove();
        });

        /* ✅ 修复3：图标上传加 128px 压缩 */
        fileInput.addEventListener('change', function(e) {
          var file = e.target.files[0];
          if (!file) return;
          var iconKey = 'iconImg_' + icon.dataset.icon;
          var reader = new FileReader();
          reader.onload = function(ev) {
            var img = new Image();
            img.onload = function() {
              var canvas = document.createElement('canvas');
              var max = 128;
              var w = img.width, h = img.height;
              if (w > h) { if (w > max) { h = h * max / w; w = max; } }
              else { if (h > max) { w = w * max / h; h = max; } }
              canvas.width = w;
              canvas.height = h;
              canvas.getContext('2d').drawImage(img, 0, 0, w, h);
              var compressed = canvas.toDataURL('image/png', 0.85);
              var oldVal = App.LS.get(iconKey);
              if (oldVal) App.LS.remove(iconKey);
              var imgEl = icon.querySelector('.app-icon-img');
              if (imgEl) imgEl.innerHTML = '<img src="' + compressed + '">';
              App.LS.set(iconKey, compressed);
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
          fileInput.remove();
        });

        App.safeOn('#iconMenuResetImg', 'click', function() {
          App.LS.remove('iconImg_' + icon.dataset.icon);
          menu.remove();
          location.reload();
        });

        setTimeout(function() {
          function dismiss(e) {
            if (menu.parentNode && !menu.contains(e.target)) {
              menu.remove();
              document.removeEventListener('touchstart', dismiss);
              document.removeEventListener('click', dismiss);
            }
          }
          document.addEventListener('touchstart', dismiss, { passive: true });
          document.addEventListener('click', dismiss);
        }, 100);
      }

      grid.querySelectorAll('.app-icon').forEach(function(icon) {
        var timer = null;
        var pressed = false;
        var moved = false;

        icon.addEventListener('touchstart', function(e) {
          moved = false;
          pressed = false;
          var touch = e.touches[0];
          timer = setTimeout(function() {
            pressed = true;
            showLongPressMenu(icon, touch.clientX, touch.clientY);
          }, 600);
        }, { passive: true });

        icon.addEventListener('touchmove', function() {
          moved = true;
          clearTimeout(timer);
        }, { passive: true });

        icon.addEventListener('touchend', function(e) {
          clearTimeout(timer);
          if (pressed) {
            e.preventDefault();
            pressed = false;
          }
        }, { passive: false });
      });

      restoreIconImages();
    })();

    snapToPage(false);
  };

App.openPanel = function(id) {
  if (!id) return;
  App.closeMenu();
  if (App.state.currentPanelEl && App.state.currentPanelEl.id !== id) {
    App.state.currentPanelEl.classList.remove('show');
    App.state.currentPanelEl.classList.add('hidden');
  }
  App.state.currentPanelEl = App.$('#' + id);
  if (!App.state.currentPanelEl) return;
  App.state.currentPanelEl.classList.remove('hidden');
  requestAnimationFrame(function() {
    App.state.currentPanelEl.classList.add('show');
  });
};

App.closePanel = function() {
  if (!App.state.currentPanelEl) return;
  App.state.currentPanelEl.classList.remove('show');
  var p = App.state.currentPanelEl;
  setTimeout(function() {
    p.classList.add('hidden');
  }, 350);
  App.state.currentPanelEl = null;
};

App.init = function() {
  App.initFloatingBall();
  App.runInits();
  App.initMainPages();
};

})();