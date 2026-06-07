墨墨，这个改动量比较大，我帮你整理一下要做的事：

1. 把 `cards.js` 里所有像素框相关代码（`bindPixelEdit`、`openPixelEdit`、`applyPixelColors`、`pixelConfig` 等）搬到 `frost.js`
2. 把拼图组件写进 `frost.js`，包含：拖拽、裁剪上传、数据保存/恢复
3. `frost.js` 里面统一管理文字卡片 + 像素框 + 拼图三个组件

我给你完整的新 `frost.js`：

```javascript
(function(){
'use strict';
var App = window.App; if(!App) return;

var DRAG_DELAY = 500;

var BUILTIN_FONTS = [
  { name: '跟随全局', family: '', scale: 1 },
  { name: '系统默认', family: '-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif', scale: 1 },
  { name: '霞鹜文楷', family: '"LXGW WenKai",cursive', scale: 1 },
  { name: '思源宋体', family: '"Noto Serif SC",serif', scale: 1 },
  { name: '思源黑体', family: '"Noto Sans SC",sans-serif', scale: 1 },
  { name: '站酷小薇', family: '"ZCOOL XiaoWei",serif', scale: 1 },
  { name: '马善政楷', family: '"Ma Shan Zheng",cursive', scale: 1 }
];

/* ==========================================================
   像素框 (Pixel)
========================================================== */
var DEF_PIXEL = { heartColor:'#ffffff', iconColor:'#ffffff', barColor:'#000000', bodyBg:'#ffffff', fontColor:'#2a2a2a', fontFamily:'' };

var Pixel = {
  config: {},

  load: function() {
    Pixel.config = App.LS.get('pixelConfig') || JSON.parse(JSON.stringify(DEF_PIXEL));
  },
  save: function() { App.LS.set('pixelConfig', Pixel.config); },

  applyColors: function() {
    var pc = Pixel.config;
    var el = App.$('#hlTextCard'); if(!el) return;
    el.style.setProperty('--pixel-heart-c', pc.heartColor||'#ffffff');
    el.style.setProperty('--pixel-icon-c', pc.iconColor||'#ffffff');
    el.style.setProperty('--pixel-bar-c', pc.barColor||'#000000');
    el.style.setProperty('--pixel-body-bg', pc.bodyBg||'#ffffff');
    el.style.setProperty('--pixel-font-c', pc.fontColor||'#2a2a2a');
    if(pc.fontFamily) el.style.fontFamily = pc.fontFamily; else el.style.fontFamily = '';
  },

  renderDisplayTexts: function() {
    var topEl = document.getElementById('hlTextTop');
    var midEl = document.getElementById('hlTextMid');
    if(topEl){ topEl.textContent = App.LS.get('hlText_top')||''; topEl.setAttribute('data-placeholder','第一行...'); }
    if(midEl){ midEl.textContent = App.LS.get('hlText_mid')||''; midEl.setAttribute('data-placeholder','第二行...'); }
  },

  _buildFontOptions: function(currentFamily) {
    var custom = (App.font && App.font.customList) || [];
    var all = BUILTIN_FONTS.concat(custom.map(function(f){ return {name:f.fileName||f.name, family:f.family}; }));
    return all.map(function(f){
      var sel = (currentFamily === f.family) ? 'selected' : '';
      return '<option value="'+App.escAttr(f.family)+'" '+sel+' style="font-family:'+f.family+';">'+App.esc(f.name)+'</option>';
    }).join('');
  },

  bindEdit: function() {
    if(Pixel._bound) return; Pixel._bound = true;
    var body = App.$('#hlTextCard .pixel-body'); if(!body) return;
    var tapCount = 0, tapTimer = null;
    body.addEventListener('click', function(e) {
      e.stopPropagation(); tapCount++; clearTimeout(tapTimer);
      tapTimer = setTimeout(function(){ tapCount=0; }, 350);
      if(tapCount >= 2){ tapCount=0; clearTimeout(tapTimer); Pixel.openEdit(); }
    });
  },

  openEdit: function() {
    var old = App.$('#pixelEditOverlay'); if(old) old.remove();
    var pc = JSON.parse(JSON.stringify(Pixel.config));
    var textTop = App.LS.get('hlText_top')||'';
    var textMid = App.LS.get('hlText_mid')||'';

    var overlay = document.createElement('div'); overlay.id='pixelEditOverlay'; overlay.className='pc-edit-overlay';
    var panel = document.createElement('div'); panel.className='pc-edit-panel';

    var paletteItems = [
      {key:'heartColor',label:'爱心颜色',value:pc.heartColor},
      {key:'iconColor',label:'图标颜色',value:pc.iconColor},
      {key:'barColor',label:'顶栏+边框',value:pc.barColor},
      {key:'bodyBg',label:'底身颜色',value:pc.bodyBg},
      {key:'fontColor',label:'字体颜色',value:pc.fontColor}
    ];
    var dotsHtml = paletteItems.map(function(p){
      return '<div class="pc-palette-item"><div class="pc-dot" data-ck="'+p.key+'" style="background:'+p.value+';"></div><span class="pc-dot-lbl">'+p.label+'</span></div>';
    }).join('');

    panel.innerHTML =
      '<div class="pc-header">编辑像素框<div class="pc-close-btn" id="pxCloseBtn">×</div></div>'+
      '<div class="pc-body">'+
        '<div class="pc-group"><span class="pc-label">第一行文字</span><input type="text" class="pc-input" id="pxTextTop" value="'+App.escAttr(textTop)+'"></div>'+
        '<div class="pc-group"><span class="pc-label">第二行文字</span><input type="text" class="pc-input" id="pxTextMid" value="'+App.escAttr(textMid)+'"></div>'+
        '<div class="pc-group"><span class="pc-label">调色板</span><div class="pc-palette-grid">'+dotsHtml+'</div></div>'+
        '<div class="pc-group"><span class="pc-label">字体</span><select class="pc-input" id="pxFontSelect">'+Pixel._buildFontOptions(pc.fontFamily)+'</select></div>'+
      '</div>'+
      '<div class="pc-footer">'+
        '<button class="pc-btn pc-btn-save" id="pxSaveBtn" type="button">保 存</button>'+
        '<button class="pc-btn pc-btn-cancel" id="pxResetBtn" type="button">重 置</button>'+
      '</div>';

    overlay.appendChild(panel); document.body.appendChild(overlay);

    var pixelEl = App.$('#hlTextCard');
    if(pixelEl){ var rect=pixelEl.getBoundingClientRect(); var left=rect.left; var top=rect.bottom+8;
      if(left<8)left=8; if(left+270>window.innerWidth)left=window.innerWidth-278;
      if(top+350>window.innerHeight)top=Math.max(10,window.innerHeight-360);
      panel.style.left=left+'px'; panel.style.top=top+'px'; }

    if(App.modules.cards && App.modules.cards._bindPanelDrag) App.modules.cards._bindPanelDrag(panel);

    panel.querySelectorAll('.pc-dot').forEach(function(dot){
      dot.addEventListener('click', function(e){
        e.stopPropagation(); var key=dot.dataset.ck;
        App.openColorPicker(pc[key], function(hex){ pc[key]=hex; dot.style.background=hex; Pixel.config=pc; Pixel.applyColors(); },
        function(hex){ pc[key]=hex; dot.style.background=hex; Pixel.config=pc; Pixel.applyColors(); }, 'pixel_'+key);
      });
    });

    panel.querySelector('#pxFontSelect').addEventListener('change', function(){ pc.fontFamily=this.value; Pixel.config=pc; Pixel.applyColors(); });

    function closeOverlay(){ overlay.remove(); }

    panel.querySelector('#pxSaveBtn').addEventListener('click', function(e){
      e.stopPropagation();
      Pixel.config=pc; Pixel.save(); Pixel.applyColors();
      App.LS.set('hlText_top', panel.querySelector('#pxTextTop').value);
      App.LS.set('hlText_mid', panel.querySelector('#pxTextMid').value);
      Pixel.renderDisplayTexts();
      closeOverlay(); App.showToast('已保存');
    });
    panel.querySelector('#pxResetBtn').addEventListener('click', function(e){
      e.stopPropagation(); Pixel.config=JSON.parse(JSON.stringify(DEF_PIXEL)); Pixel.save(); Pixel.applyColors(); closeOverlay(); App.showToast('已重置');
    });
    panel.querySelector('#pxCloseBtn').addEventListener('click', function(e){ e.stopPropagation(); closeOverlay(); });
    overlay.addEventListener('click', function(e){ if(e.target===overlay) closeOverlay(); });
  }
};

/* ==========================================================
   拼图组件 (Puzzle)
========================================================== */
var Puzzle = {
  data: { imgs: [null,null,null,null], posX: 0, posY: 0, strokeColor: '#2a2a2a' },

  load: function() {
    var saved = App.LS.get('puzzleCard');
    if(saved) {
      Puzzle.data = saved;
      if(!Puzzle.data.strokeColor) Puzzle.data.strokeColor = '#2a2a2a';
      if(!Puzzle.data.imgs) Puzzle.data.imgs = [null,null,null,null];
    }
  },
  save: function() { App.LS.set('puzzleCard', Puzzle.data); },

  render: function() {
    var container = document.getElementById('puzzleCard');
    if(!container) return;

    var sc = Puzzle.data.strokeColor || '#2a2a2a';

    container.innerHTML =
      '<div class="mmg-pz-ok3">' +
        '<div class="pz-card" id="pzCardInner">' +
          '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="220" height="220">' +
            '<defs>' +
              '<clipPath id="pzk31"><path d="M6 6H24V13C26 13 28 14.5 28 17C28 19.5 26 21 24 21V28H6V6Z"/></clipPath>' +
              '<clipPath id="pzk32"><path d="M24 6H42V28H24V21C26 21 28 19.5 28 17C28 14.5 26 13 24 13V6Z"/></clipPath>' +
              '<clipPath id="pzk33"><path d="M6 28H24V35C22 35 20 36.5 20 39C20 41.5 22 43 24 43V50H6V28Z"/></clipPath>' +
              '<clipPath id="pzk34"><path d="M24 28H42V50H24V43C26 43 28 41.5 28 39C28 36.5 26 35 24 35V28Z"/></clipPath>' +
            '</defs>' +
            '<path d="M6 6H24V13C26 13 28 14.5 28 17C28 19.5 26 21 24 21V28H6V6Z" fill="white" stroke="'+sc+'" stroke-width="0.8" stroke-linejoin="round"/>' +
            '<image id="pzImg0" clip-path="url(#pzk31)" x="6" y="6" width="22" height="22" href="" preserveAspectRatio="xMidYMid slice"/>' +
            '<path d="M24 6H42V28H24V21C26 21 28 19.5 28 17C28 14.5 26 13 24 13V6Z" fill="white" stroke="'+sc+'" stroke-width="0.8" stroke-linejoin="round"/>' +
            '<image id="pzImg1" clip-path="url(#pzk32)" x="24" y="6" width="18" height="22" href="" preserveAspectRatio="xMidYMid slice"/>' +
            '<path d="M6 28H24V35C22 35 20 36.5 20 39C20 41.5 22 43 24 43V50H6V28Z" fill="white" stroke="'+sc+'" stroke-width="0.8" stroke-linejoin="round"/>' +
            '<image id="pzImg2" clip-path="url(#pzk33)" x="6" y="28" width="18" height="22" href="" preserveAspectRatio="xMidYMid slice"/>' +
            '<g transform="translate(5 4) rotate(8 33 39)">' +
              '<path d="M24 28H42V50H24V43C26 43 28 41.5 28 39C28 36.5 26 35 24 35V28Z" fill="white" stroke="'+sc+'" stroke-width="0.8" stroke-linejoin="round" stroke-dasharray="2 1.5"/>' +
              '<image id="pzImg3" clip-path="url(#pzk34)" x="24" y="28" width="18" height="22" href="" preserveAspectRatio="xMidYMid slice"/>' +
            '</g>' +
          '</svg>' +
        '</div>' +
      '</div>';

    // 恢复已保存的图片
    Puzzle.data.imgs.forEach(function(src, idx) {
      if(src) {
        var img = document.getElementById('pzImg' + idx);
        if(img) img.setAttribute('href', src);
      }
    });

    // 恢复位置
    if(Puzzle.data.posX || Puzzle.data.posY) {
      container.style.transform = 'translate(' + Puzzle.data.posX + 'px,' + Puzzle.data.posY + 'px)';
    }

    Puzzle.bindDrag(container);
    Puzzle.bindDoubleTap(container);
  },

  bindDoubleTap: function(container) {
    var cardEl = container.querySelector('#pzCardInner');
    if(!cardEl) return;
    var tapCount = 0, tapTimer = null;
    cardEl.addEventListener('click', function(e) {
      e.stopPropagation();
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function() { tapCount = 0; }, 350);
      if(tapCount >= 2) { tapCount = 0; clearTimeout(tapTimer); Puzzle.openEdit(); }
    });
  },

  bindDrag: function(container) {
    if(container._pzDragBound) return;
    container._pzDragBound = true;

    var cardEl = container.querySelector('#pzCardInner');
    if(!cardEl) return;

    var startX, startY, origX, origY, longPressed = false, timer, moved = false;

    cardEl.addEventListener('touchstart', function(e) {
      var t = e.touches[0]; startX = t.clientX; startY = t.clientY;
      longPressed = false; moved = false;
      timer = setTimeout(function() {
        longPressed = true;
        origX = Puzzle.data.posX || 0;
        origY = Puzzle.data.posY || 0;
        container.style.transition = 'none';
        container.style.zIndex = '999';
        if(navigator.vibrate) navigator.vibrate(15);
      }, DRAG_DELAY);
    }, {passive:true});

    cardEl.addEventListener('touchmove', function(e) {
      var t = e.touches[0];
      if(timer && !longPressed) {
        if(Math.abs(t.clientX-startX)>8 || Math.abs(t.clientY-startY)>8) { clearTimeout(timer); timer=null; }
        return;
      }
      if(!longPressed) return;
      moved = true; e.preventDefault(); e.stopPropagation();
      var nx = origX + (t.clientX - startX);
      var ny = origY + (t.clientY - startY);
      container.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
      Puzzle.data.posX = nx;
      Puzzle.data.posY = ny;
    }, {passive:false});

    cardEl.addEventListener('touchend', function(e) {
      clearTimeout(timer); timer = null;
      container.style.transition = '';
      container.style.zIndex = '';
      if(longPressed && moved) { Puzzle.save(); e.stopPropagation(); }
      longPressed = false; moved = false;
    });
  },

  openEdit: function() {
    var old = App.$('#pzEditOverlay'); if(old) old.remove();

    var d = Puzzle.data;
    var currentStroke = d.strokeColor || '#2a2a2a';

    var overlay = document.createElement('div');
    overlay.id = 'pzEditOverlay';
    overlay.className = 'pc-edit-overlay';

    var panel = document.createElement('div');
    panel.className = 'pc-edit-panel';

    // 构建4个缩略图槽
    var slotsHtml = '';
    for(var i = 0; i < 4; i++) {
      var thumbContent = d.imgs[i]
        ? '<img src="'+App.escAttr(d.imgs[i])+'"><div class="pz-edit-thumb-del" data-idx="'+i+'">×</div>'
        : '<span class="pz-edit-thumb-placeholder">+</span>';
      slotsHtml += '<div class="pz-edit-slot"><div class="pz-edit-thumb" data-idx="'+i+'">'+thumbContent+'</div><span class="pz-edit-slot-label">第'+(i+1)+'块</span></div>';
    }

    panel.innerHTML =
      '<div class="pc-header">编辑拼图<div class="pc-close-btn" id="pzCloseBtn">×</div></div>' +
      '<div class="pc-body">' +
        '<div class="pc-group"><span class="pc-label">上传图片</span></div>' +
        '<div class="pz-edit-slots">' + slotsHtml + '</div>' +
        '<div class="pc-group"><span class="pc-label">线条颜色</span>' +
          '<div class="pc-dot" id="pzStrokeDot" style="background:'+currentStroke+';width:28px;height:28px;border-radius:8px;"></div>' +
        '</div>' +
      '</div>' +
      '<div class="pc-footer">' +
        '<button class="pc-btn pc-btn-save" id="pzSaveBtn" type="button">保 存</button>' +
        '<button class="pc-btn pc-btn-cancel" id="pzResetBtn" type="button">重 置</button>' +
      '</div>';

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // 定位
    var pzContainer = document.getElementById('puzzleCard');
    if(pzContainer) {
      var rect = pzContainer.getBoundingClientRect();
      var left = rect.left + rect.width/2 - 135;
      if(left < 8) left = 8;
      if(left + 270 > window.innerWidth) left = window.innerWidth - 278;
      var top = rect.bottom + 8;
      if(top + 350 > window.innerHeight) top = Math.max(10, window.innerHeight - 360);
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
    }

    if(App.modules.cards && App.modules.cards._bindPanelDrag) App.modules.cards._bindPanelDrag(panel);

    // 点击缩略图上传
    panel.querySelectorAll('.pz-edit-thumb').forEach(function(thumb) {
      thumb.addEventListener('click', function(e) {
        e.stopPropagation();
        // 如果点的是删除按钮
        if(e.target.classList.contains('pz-edit-thumb-del')) {
          var delIdx = parseInt(e.target.dataset.idx);
          d.imgs[delIdx] = null;
          thumb.innerHTML = '<span class="pz-edit-thumb-placeholder">+</span>';
          // 实时更新 SVG
          var svgImg = document.getElementById('pzImg' + delIdx);
          if(svgImg) svgImg.setAttribute('href', '');
          return;
        }
        var idx = parseInt(thumb.dataset.idx);
        var input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = function(ev) {
          var f = ev.target.files[0]; if(!f) return;
          var reader = new FileReader();
          reader.onload = function(r) {
            var src = r.target.result;
            var processImg = function(cropped) {
              // 压缩
              var compress = new Image();
              compress.onload = function() {
                var canvas = document.createElement('canvas');
                var max = 300, w = compress.width, h = compress.height;
                if(w > h) { if(w > max){ h = h*max/w; w = max; } } else { if(h > max){ w = w*max/h; h = max; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(compress, 0, 0, w, h);
                var result = canvas.toDataURL('image/jpeg', 0.85);
                // 更新缩略图
                thumb.innerHTML = '<img src="'+result+'"><div class="pz-edit-thumb-del" data-idx="'+idx+'">×</div>';
                // 实时更新 SVG
                var svgImg = document.getElementById('pzImg' + idx);
                if(svgImg) svgImg.setAttribute('href', result);
                d.imgs[idx] = result;
              };
              compress.src = cropped;
            };
            if(App.cropImage) App.cropImage(src, processImg);
            else processImg(src);
          };
          reader.readAsDataURL(f);
        };
        input.click();
      });
    });

    // 线条颜色
    panel.querySelector('#pzStrokeDot').addEventListener('click', function(e) {
      e.stopPropagation();
      if(!App.openColorPicker) return;
      App.openColorPicker(currentStroke, function(hex) {
        currentStroke = hex;
        panel.querySelector('#pzStrokeDot').style.background = hex;
        Puzzle.data.strokeColor = hex;
        // 实时更新所有 stroke
        var container = document.getElementById('puzzleCard');
        if(container) {
          container.querySelectorAll('.pz-card svg path').forEach(function(p) {
            p.setAttribute('stroke', hex);
          });
        }
      }, function(hex) {
        currentStroke = hex;
        panel.querySelector('#pzStrokeDot').style.background = hex;
        var container = document.getElementById('puzzleCard');
        if(container) {
          container.querySelectorAll('.pz-card svg path').forEach(function(p) {
            p.setAttribute('stroke', hex);
          });
        }
      }, 'pz_stroke');
    });

    // 保存
    panel.querySelector('#pzSaveBtn').addEventListener('click', function(e) {
      e.stopPropagation();
      Puzzle.data.strokeColor = currentStroke;
      Puzzle.save();
      overlay.remove();
      App.showToast('已保存');
    });

    // 重置
    panel.querySelector('#pzResetBtn').addEventListener('click', function(e) {
      e.stopPropagation();
      Puzzle.data = { imgs: [null,null,null,null], posX: 0, posY: 0, strokeColor: '#2a2a2a' };
      Puzzle.save();
      var container = document.getElementById('puzzleCard');
      if(container) container.style.transform = '';
      Puzzle.render();
      overlay.remove();
      App.showToast('已重置');
    });

    // 关闭
    panel.querySelector('#pzCloseBtn').addEventListener('click', function(e) { e.stopPropagation(); overlay.remove(); });
    overlay.addEventListener('click', function(e) { if(e.target === overlay) overlay.remove(); });
  }
};

/* ==========================================================
   文字卡片 (Eden)
========================================================== */
var Eden = {
  data: {},

  DEFAULTS: {
    text: '文字填写区域，可以多行',
    fontSize: 38,
    rotate: 0,
    spacing: 2,
    fontColor: '#1a1a1a',
    fontName: '',
    fontFamily: '',
    posX: 0,
    posY: 0
  },

  load: function() {
    var saved = App.LS.get('edenCard');
    var d = Eden.DEFAULTS;
    Eden.data = saved ? {
      text: saved.text != null ? saved.text : d.text,
      fontSize: saved.fontSize != null ? saved.fontSize : d.fontSize,
      rotate: saved.rotate != null ? saved.rotate : d.rotate,
      spacing: saved.spacing != null ? saved.spacing : d.spacing,
      fontColor: saved.fontColor || d.fontColor,
      fontName: saved.fontName || '',
      fontFamily: saved.fontFamily || '',
      posX: saved.posX != null ? saved.posX : d.posX,
      posY: saved.posY != null ? saved.posY : d.posY
    } : JSON.parse(JSON.stringify(d));
  },

  save: function() { App.LS.set('edenCard', Eden.data); },

  getAvailableFonts: function() {
    var custom = App.LS.get('fontCustomList') || [];
    return BUILTIN_FONTS.concat(custom.map(function(f) {
      return { name: f.name, family: f.family, scale: f.scale || 1, fileName: f.fileName };
    }));
  },

  getSelectedScale: function() {
    var name = Eden.data.fontName;
    if(!name) return 1;
    var fonts = Eden.getAvailableFonts();
    for(var i=0; i<fonts.length; i++) { if(fonts[i].name === name) return fonts[i].scale || 1; }
    return 1;
  },

  apply: function() {
    var el = App.$('#edenText'); if(!el) return;
    var d = Eden.data;
    var scale = Eden.getSelectedScale();
    var actualSize = Math.round((d.fontSize || 28) * scale);
    el.textContent = d.text || '';
    el.style.fontSize = actualSize + 'px';
    el.style.transform = 'rotate(' + (d.rotate || 0) + 'deg)';
    el.style.letterSpacing = (d.spacing || 0) + 'px';
    el.style.color = d.fontColor || '#1a1a1a';
    el.style.fontFamily = d.fontFamily || '';
    el.style.whiteSpace = 'pre-wrap';
    el.style.wordBreak = 'break-word';
    var card = App.$('#edenCard');
    if(card && (d.posX || d.posY)) { card.style.transform = 'translate(' + d.posX + 'px, ' + d.posY + 'px)'; }
  },

  bindDrag: function() {
    var card = App.$('#edenCard'); if(!card) return;
    var startX, startY, startPosX, startPosY, longPressed=false, timer, moved=false;

    card.addEventListener('touchstart', function(e) {
      if(e.target.closest('#edenEditOverlay')) return;
      var textEl = card.querySelector('#edenText');
      if(!textEl || !textEl.textContent.trim()) return;
      if(e.target !== textEl) return;
      var touch = e.touches[0];
      var hit = false;
      var textNode = textEl.firstChild;
      if(textNode && textNode.nodeType === 3) {
        var r = document.createRange();
        var len = textNode.textContent.length;
        for(var i=0; i<len; i++) {
          r.setStart(textNode, i); r.setEnd(textNode, Math.min(i+1, len));
          var rects = r.getClientRects();
          for(var j=0; j<rects.length; j++) {
            var rc = rects[j];
            if(touch.clientX >= rc.left && touch.clientX <= rc.right && touch.clientY >= rc.top && touch.clientY <= rc.bottom) { hit=true; break; }
          }
          if(hit) break;
        }
      }
      if(!hit) return;
      startX = touch.clientX; startY = touch.clientY;
      longPressed=false; moved=false;
      var match = (card.style.transform||'').match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      startPosX = match ? parseFloat(match[1]) : (Eden.data.posX||0);
      startPosY = match ? parseFloat(match[2]) : (Eden.data.posY||0);
      timer = setTimeout(function() { longPressed=true; card.classList.add('dragging'); if(navigator.vibrate) navigator.vibrate(15); }, DRAG_DELAY);
    }, {passive:true});

    card.addEventListener('touchmove', function(e) {
      var touch = e.touches[0];
      if(timer && !longPressed) { if(Math.abs(touch.clientX-startX)>8||Math.abs(touch.clientY-startY)>8){clearTimeout(timer);timer=null;} return; }
      if(!longPressed) return;
      e.preventDefault(); moved=true;
      Eden.data.posX = startPosX + touch.clientX - startX;
      Eden.data.posY = startPosY + touch.clientY - startY;
      card.style.transform = 'translate(' + Eden.data.posX + 'px, ' + Eden.data.posY + 'px)';
    }, {passive:false});

    card.addEventListener('touchend', function(e) {
      clearTimeout(timer); timer=null; card.classList.remove('dragging');
      if(longPressed && moved) { Eden.save(); e.stopPropagation(); }
      longPressed=false; moved=false;
    });
  },

  openEdit: function() {
    var old = App.$('#edenEditOverlay'); if(old) { old.remove(); return; }
    var saved = App.LS.get('edenCard');
    if(saved) { Object.keys(Eden.DEFAULTS).forEach(function(k){ Eden.data[k] = saved[k] != null ? saved[k] : Eden.DEFAULTS[k]; }); }
    var d = Eden.data;
    var fonts = Eden.getAvailableFonts();
    var currentFontColor = d.fontColor || '#1a1a1a';
    var fontOptionsHtml = fonts.map(function(f){
      var sel = '';
      if(d.fontName && d.fontName === f.name) sel = ' selected';
      else if(!d.fontName && f.name === '跟随全局') sel = ' selected';
      var label = f.fileName ? f.fileName : f.name;
      return '<option value="'+App.escAttr(f.name)+'" data-family="'+App.escAttr(f.family)+'"'+sel+'>'+App.esc(label)+'</option>';
    }).join('');

    var overlay = document.createElement('div'); overlay.id='edenEditOverlay'; overlay.className='pc-edit-overlay';
    var panel = document.createElement('div'); panel.className='pc-edit-panel';
    panel.innerHTML =
      '<div class="pc-header">文字卡片<div class="pc-close-btn" id="edenCloseBtn">×</div></div>'+
      '<div class="pc-body" style="gap:8px;">'+
        '<div class="pc-group"><span class="pc-label">文字内容</span><textarea id="edenTextInput" rows="4" style="width:100%;padding:7px 10px;font-size:12px;color:#000;background:rgba(255,255,255,0.5);border:1px solid rgba(0,0,0,0.15);border-radius:8px;outline:none;font-family:inherit;resize:vertical;box-sizing:border-box;">'+App.esc(d.text||'')+'</textarea></div>'+
        '<div class="pc-group"><span class="pc-label">字体</span><select id="edenFontSelect" style="width:100%;padding:7px 10px;font-size:12px;color:#000;background:rgba(255,255,255,0.5);border:1px solid rgba(0,0,0,0.15);border-radius:8px;outline:none;font-family:inherit;-webkit-appearance:none;appearance:none;cursor:pointer;">'+fontOptionsHtml+'</select></div>'+
        '<div class="pc-group"><span class="pc-label">字号</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="edenSize" min="14" max="60" value="'+(d.fontSize||28)+'"><span class="pc-slider-val" id="edenSizeVal">'+(d.fontSize||28)+'px</span></div></div>'+
        '<div class="pc-group"><span class="pc-label">倾斜</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="edenRotate" min="-20" max="20" value="'+(d.rotate||0)+'"><span class="pc-slider-val" id="edenRotateVal">'+(d.rotate||0)+'°</span></div></div>'+
        '<div class="pc-group"><span class="pc-label">间距</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="edenSpacing" min="0" max="20" value="'+(d.spacing||2)+'"><span class="pc-slider-val" id="edenSpacingVal">'+(d.spacing||2)+'px</span></div></div>'+
        '<div class="pc-group"><span class="pc-label">字色</span><div class="pc-dot" id="edenColorDot" style="background:'+currentFontColor+';width:28px;height:28px;border-radius:8px;"></div></div>'+
      '</div>'+
      '<div class="pc-footer"><button class="pc-btn pc-btn-save" id="edenSave" type="button">保 存</button><button class="pc-btn pc-btn-cancel" id="edenReset" type="button">重 置</button></div>';

    overlay.appendChild(panel); document.body.appendChild(overlay);

    var edenCard = App.$('#edenCard');
    if(edenCard) {
      var rect = edenCard.getBoundingClientRect();
      var left = rect.left + rect.width/2 - 140;
      if(left<8)left=8; if(left+280>window.innerWidth-8)left=window.innerWidth-288;
      var top = rect.bottom+8; if(top+400>window.innerHeight-10)top=Math.max(10,rect.top-410);
      panel.style.left=left+'px'; panel.style.top=top+'px';
    }
    if(App.modules.cards && App.modules.cards._bindPanelDrag) App.modules.cards._bindPanelDrag(panel);

    function getSelectScale() {
      var selName = panel.querySelector('#edenFontSelect').value;
      for(var i=0;i<fonts.length;i++){ if(fonts[i].name===selName) return fonts[i].scale||1; }
      return 1;
    }

    function preview() {
      panel.querySelector('#edenSizeVal').textContent = panel.querySelector('#edenSize').value+'px';
      panel.querySelector('#edenRotateVal').textContent = panel.querySelector('#edenRotate').value+'°';
      panel.querySelector('#edenSpacingVal').textContent = panel.querySelector('#edenSpacing').value+'px';
      var el = App.$('#edenText'); if(!el) return;
      var selOpt = panel.querySelector('#edenFontSelect');
      var selIdx = selOpt.selectedIndex;
      var family = selOpt.options[selIdx] ? selOpt.options[selIdx].dataset.family : '';
      var scale = getSelectScale();
      var baseSize = parseInt(panel.querySelector('#edenSize').value)||28;
      el.textContent = panel.querySelector('#edenTextInput').value||'';
      el.style.fontSize = Math.round(baseSize*scale)+'px';
      el.style.transform = 'rotate('+panel.querySelector('#edenRotate').value+'deg)';
      el.style.letterSpacing = panel.querySelector('#edenSpacing').value+'px';
      el.style.color = currentFontColor;
      el.style.fontFamily = family||'';
      el.style.whiteSpace = 'pre-wrap'; el.style.wordBreak = 'break-word';
    }

    ['edenSize','edenRotate','edenSpacing','edenTextInput'].forEach(function(id){
      var el = panel.querySelector('#'+id); if(el) el.addEventListener('input', preview);
    });
    panel.querySelector('#edenFontSelect').addEventListener('change', preview);

    panel.querySelector('#edenColorDot').addEventListener('click', function(e){
      e.stopPropagation(); if(!App.openColorPicker) return;
      App.openColorPicker(currentFontColor, function(hex){ currentFontColor=hex; panel.querySelector('#edenColorDot').style.background=hex; preview(); },
      function(hex){ currentFontColor=hex; panel.querySelector('#edenColorDot').style.background=hex; preview(); }, 'eden_fontColor');
    });

    panel.querySelector('#edenSave').addEventListener('click', function(e){
      e.stopPropagation();
      var selOpt = panel.querySelector('#edenFontSelect'); var selIdx = selOpt.selectedIndex;
      Eden.data.fontName = selOpt.value;
      Eden.data.fontFamily = selOpt.options[selIdx] ? selOpt.options[selIdx].dataset.family : '';
      Eden.data.text = panel.querySelector('#edenTextInput').value;
      Eden.data.fontSize = parseInt(panel.querySelector('#edenSize').value);
      Eden.data.rotate = parseInt(panel.querySelector('#edenRotate').value);
      Eden.data.spacing = parseInt(panel.querySelector('#edenSpacing').value);
      Eden.data.fontColor = currentFontColor;
      Eden.save(); Eden.apply(); overlay.remove(); App.showToast('已保存');
    });
    panel.querySelector('#edenReset').addEventListener('click', function(e){
      e.stopPropagation(); Eden.data=JSON.parse(JSON.stringify(Eden.DEFAULTS)); Eden.save(); Eden.apply(); overlay.remove(); App.showToast('已重置');
    });
    panel.querySelector('#edenCloseBtn').addEventListener('click', function(e){ e.stopPropagation(); overlay.remove(); });
    overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
  }
};

/* ==========================================================
   Frost 主模块 - 统一初始化
========================================================== */
var Frost = {
  init: function() {
    // 像素框
    Pixel.load();
    Pixel.applyColors();
    Pixel.renderDisplayTexts();
    Pixel.bindEdit();

    // 拼图
    Puzzle.load();
    Puzzle.render();

    // 文字卡片
    Eden.load(); Eden.apply(); Eden.bindDrag();
    var edenEl = App.$('#edenCard');
    if(edenEl) {
      var _tapCount=0, _tapTimer=null;
      edenEl.addEventListener('click', function(e){
        e.stopPropagation(); _tapCount++;
        if(_tapCount===1){ _tapTimer=setTimeout(function(){_tapCount=0;},350); }
        else if(_tapCount>=2){ clearTimeout(_tapTimer); _tapCount=0; Eden.openEdit(); }
      });
    }
  }
};

// 暴露给外部
App.pixel = Pixel;
App.puzzle = Puzzle;
App.eden = Eden;
App.register('frost', Frost);
})();


