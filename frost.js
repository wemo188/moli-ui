(function() {
  'use strict';
  var App = window.App; if(!App) return;

  var DRAG_DELAY = 250;
  
  // 🌟 高级 SVG 关闭图标，替代简陋的文本 "×"
  var CLOSE_SVG = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;fill:none;"><path d="M18 6L6 18M6 6l12 12"/></svg>';

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
      if(pc.fontFamily){el.style.fontFamily=pc.fontFamily;el.classList.add('font-custom');}else{el.style.fontFamily='';el.classList.remove('font-custom');}
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
      body.addEventListener('click', function(e) {
        e.stopPropagation();
        Pixel.openEdit();
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
        '<div class="pc-header">编辑像素框<div class="pc-close-btn" id="pxCloseBtn">' + CLOSE_SVG + '</div></div>'+
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

      // 🌟 统一无感自动保存逻辑
      function saveAndClose(showToast) {
        Pixel.config=pc; Pixel.save(); Pixel.applyColors();
        App.LS.set('hlText_top', panel.querySelector('#pxTextTop').value);
        App.LS.set('hlText_mid', panel.querySelector('#pxTextMid').value);
        Pixel.renderDisplayTexts();
        overlay.remove();
        if(showToast) App.showToast('已保存');
      }

      panel.querySelector('#pxSaveBtn').addEventListener('click', function(e){ e.stopPropagation(); saveAndClose(true); });
      panel.querySelector('#pxCloseBtn').addEventListener('click', function(e){ e.stopPropagation(); saveAndClose(false); });
      overlay.addEventListener('click', function(e){ if(e.target===overlay && !document.querySelector('#cpOverlay')) saveAndClose(false); });

      panel.querySelector('#pxResetBtn').addEventListener('click', function(e){
        e.stopPropagation(); Pixel.config=JSON.parse(JSON.stringify(DEF_PIXEL)); Pixel.save(); Pixel.applyColors(); overlay.remove(); App.showToast('已重置');
      });
    }
  };

  /* ==========================================================
     拼图组件 (Puzzle)
  ========================================================== */
  var Puzzle = {
    data: { imgs: [null,null,null,null], posX: 0, posY: 0 },

    load: function() {
      var saved = App.LS.get('puzzleCard');
      if(saved) {
        Puzzle.data = saved;
        if(!Puzzle.data.imgs) Puzzle.data.imgs = [null,null,null,null];
      }
    },
    save: function() { App.LS.set('puzzleCard', Puzzle.data); },

        render: function() {
      var container = document.getElementById('puzzleCard');
      if(!container) return;

      container.innerHTML =
        '<div class="pz-card" id="pzCardInner">' +
           '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
            '<clipPath id="pzk31"><path d="M6 6H24V13C26 13 28 14.5 28 17C28 19.5 26 21 24 21V28H6V6Z"/></clipPath>' +
            '<clipPath id="pzk32"><path d="M24 6H42V28H24V21C26 21 28 19.5 28 17C28 14.5 26 13 24 13V6Z"/></clipPath>' +
            '<clipPath id="pzk33"><path d="M6 28H24V35C22 35 20 36.5 20 39C20 41.5 22 43 24 43V50H6V28Z"/></clipPath>' +
            '<clipPath id="pzk34"><path d="M24 28H42V50H24V43C26 43 28 41.5 28 39C28 36.5 26 35 24 35V28Z"/></clipPath>' +
          '</defs>' +
          '<path d="M6 6H24V13C26 13 28 14.5 28 17C28 19.5 26 21 24 21V28H6V6Z" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="0.5" stroke-linejoin="round"/>' +
          '<image id="pzImg0" clip-path="url(#pzk31)" x="6" y="6" width="22" height="22" href="" preserveAspectRatio="xMidYMid slice"/>' +
          '<path d="M24 6H42V28H24V21C26 21 28 19.5 28 17C28 14.5 26 13 24 13V6Z" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="0.5" stroke-linejoin="round"/>' +
          '<image id="pzImg1" clip-path="url(#pzk32)" x="24" y="6" width="18" height="22" href="" preserveAspectRatio="xMidYMid slice"/>' +
          '<path d="M6 28H24V35C22 35 20 36.5 20 39C20 41.5 22 43 24 43V50H6V28Z" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="0.5" stroke-linejoin="round"/>' +
          '<image id="pzImg2" clip-path="url(#pzk33)" x="6" y="28" width="18" height="22" href="" preserveAspectRatio="xMidYMid slice"/>' +
          '<g transform="translate(5 4) rotate(8 33 39)">' +
            '<path d="M24 28H42V50H24V43C26 43 28 41.5 28 39C28 36.5 26 35 24 35V28Z" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="0.5" stroke-linejoin="round" stroke-dasharray="2 1.5"/>' +
            '<image id="pzImg3" clip-path="url(#pzk34)" x="24" y="28" width="18" height="22" href="" preserveAspectRatio="xMidYMid slice"/>' +
          '</g>' +
        '</svg>' +
        '</div>';

      Puzzle.data.imgs.forEach(function(src, idx) {
        if(src) {
          var img = document.getElementById('pzImg' + idx);
          if(img) img.setAttribute('href', src);
        }
      });

      if(Puzzle.data.posX || Puzzle.data.posY) {
        // 🌟 注入 --t 变量，防止闪现 Bug
        var tf = 'translate(' + Puzzle.data.posX + 'px,' + Puzzle.data.posY + 'px)';
        container.style.setProperty('--t', tf);
        container.style.transform = tf;
      }

      Puzzle.bindDrag(container);
      Puzzle.bindDoubleTap(container);
    },

        bindDoubleTap: function(container) {
      var cardEl = container.querySelector('#pzCardInner');
      if(!cardEl || cardEl._pzTapBound) return;
      cardEl._pzTapBound = true;
      cardEl.addEventListener('click', function(e) {
        e.stopPropagation();
        Puzzle.openEdit();
      });
    },

    bindDrag: function(container) {
      var cardEl = container.querySelector('#pzCardInner');
      if(!cardEl || cardEl._pzDragBound) return;
      cardEl._pzDragBound = true;

      var startX, startY, origX, origY, longPressed = false, timer, moved = false;

      cardEl.addEventListener('touchstart', function(e) {
        var t = e.touches[0]; startX = t.clientX; startY = t.clientY;
        longPressed = false; moved = false;
        timer = setTimeout(function() {
          longPressed = true;
          origX = Puzzle.data.posX || 0;
          origY = Puzzle.data.posY || 0;
          
          // 🌟 拿起：放大 + 摇晃
          container.classList.add('is-grabbed');
          container.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
          var tf = 'translate(' + origX + 'px,' + origY + 'px) scale(1.05)';
          container.style.setProperty('--t', tf);
          container.style.transform = tf;
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
        
        // 🌟 移动：无延迟跟手
        container.style.transition = 'none';
        var tf = 'translate(' + nx + 'px,' + ny + 'px) scale(1.05)';
        container.style.setProperty('--t', tf);
        container.style.transform = tf;
        
        Puzzle.data.posX = nx;
        Puzzle.data.posY = ny;
      }, {passive:false});

      cardEl.addEventListener('touchend', function(e) {
        clearTimeout(timer); timer = null;
        container.classList.remove('is-grabbed'); // 🌟 放下
        if(longPressed) { 
          if(moved) { Puzzle.save(); e.stopPropagation(); }
          
          // 🌟 回弹缩小
          container.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
          var tf = 'translate(' + Puzzle.data.posX + 'px,' + Puzzle.data.posY + 'px) scale(1)';
          container.style.setProperty('--t', tf);
          container.style.transform = tf;
          container.style.zIndex = '';
          
          setTimeout(function() { container.style.transition = ''; }, 350);
        }
        longPressed = false; moved = false;
      });
    },

  openEdit: function() {
    var old = App.$('#pzEditOverlay'); if(old) old.remove();

    var d = Puzzle.data;

    var overlay = document.createElement('div');
    overlay.id = 'pzEditOverlay';
    overlay.className = 'pc-edit-overlay';

    var panel = document.createElement('div');
    panel.className = 'pc-edit-panel';

    var slotsHtml = '';
    for(var i = 0; i < 4; i++) {
      var thumbContent = d.imgs[i]
        ? '<img src="'+App.escAttr(d.imgs[i])+'"><div class="pz-edit-thumb-del" data-idx="'+i+'">×</div>'
        : '<span class="pz-edit-thumb-placeholder">+</span>';
      slotsHtml += '<div class="pz-edit-slot"><div class="pz-edit-thumb" data-idx="'+i+'">'+thumbContent+'</div><span class="pz-edit-slot-label">第'+(i+1)+'块</span></div>';
    }

    panel.innerHTML =
      '<div class="pc-header">编辑拼图<div class="pc-close-btn" id="pzCloseBtn">' + CLOSE_SVG + '</div></div>' +
      '<div class="pc-body">' +
        '<div class="pc-group"><span class="pc-label">点击区块上传</span></div>' +
        '<div class="pz-edit-slots">' + slotsHtml + '</div>' +
      '</div>' +
      '<div class="pc-footer">' +
        '<button class="pc-btn pc-btn-save" id="pzSaveBtn" type="button">保 存</button>' +
        '<button class="pc-btn pc-btn-cancel" id="pzResetBtn" type="button">重 置</button>' +
      '</div>';

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

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

    panel.querySelectorAll('.pz-edit-thumb').forEach(function(thumb) {
      thumb.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(thumb.dataset.idx);
        if(e.target.classList.contains('pz-edit-thumb-del')) {
          d.imgs[idx] = null;
          thumb.innerHTML = '<span class="pz-edit-thumb-placeholder">+</span>';
          var svgImg = document.getElementById('pzImg' + idx);
          if(svgImg) svgImg.setAttribute('href', '');
          return;
        }
        
        // 🌟 核心优化：接入全局相册组件，完美取代繁琐的 Input File！
        if(App.showImagePicker) {
          App.showImagePicker({
            title: '设置第 ' + (idx + 1) + ' 块拼图',
            callback: function(src) {
              if(!src) return; // 取消
              var compress = new Image();
              compress.onload = function() {
                var canvas = document.createElement('canvas');
                var max = 300, w = compress.width, h = compress.height;
                if(w > h) { if(w > max){ h = h*max/w; w = max; } } else { if(h > max){ w = w*max/h; h = max; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(compress, 0, 0, w, h);
                var result = canvas.toDataURL('image/jpeg', 0.85);
                thumb.innerHTML = '<img src="'+result+'"><div class="pz-edit-thumb-del" data-idx="'+idx+'">×</div>';
                var svgImg = document.getElementById('pzImg' + idx);
                if(svgImg) svgImg.setAttribute('href', result);
                d.imgs[idx] = result;
              };
              compress.src = src;
            }
          });
        }
      });
    });

    // 🌟 统一无感自动保存逻辑
    function saveAndClose(showToast) {
      Puzzle.save();
      overlay.remove();
      if(showToast) App.showToast('已保存');
    }

    panel.querySelector('#pzSaveBtn').addEventListener('click', function(e) { e.stopPropagation(); saveAndClose(true); });
    panel.querySelector('#pzCloseBtn').addEventListener('click', function(e) { e.stopPropagation(); saveAndClose(false); });
    overlay.addEventListener('click', function(e) { if(e.target === overlay && !document.querySelector('.gip-overlay')) saveAndClose(false); });

    panel.querySelector('#pzResetBtn').addEventListener('click', function(e) {
      e.stopPropagation();
      Puzzle.data = { imgs: [null,null,null,null], posX: 0, posY: 0 };
      Puzzle.save();
      var container = document.getElementById('puzzleCard');
      if(container) container.style.transform = '';
      Puzzle.render();
      overlay.remove();
      App.showToast('已重置');
    });
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
      lineHeight: 1,
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
        lineHeight: saved.lineHeight != null ? saved.lineHeight : d.lineHeight,
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
      el.style.lineHeight = (d.lineHeight || 1.4);
      
      var fontColor = d.fontColor || '#1a1a1a';
      if (fontColor && fontColor.indexOf('linear-gradient') === 0) {
        el.style.background = fontColor;
        el.style.backgroundClip = 'text';
        el.style.webkitBackgroundClip = 'text';
        el.style.color = 'transparent';
      } else {
        el.style.background = '';
        el.style.backgroundClip = '';
        el.style.webkitBackgroundClip = '';
        el.style.color = fontColor;
      }
      
      el.style.fontFamily = d.fontFamily || '';
      if(d.fontFamily){el.classList.add('font-custom');if(App.font&&App.font.loadByFamily)App.font.loadByFamily(d.fontFamily);}else{el.classList.remove('font-custom');}
      el.style.whiteSpace = 'pre-wrap';
      el.style.wordBreak = 'break-word';
      var card = App.$('#edenCard');
      if(card && (d.posX || d.posY)) { 
        // 🌟 注入 --t 变量防闪现
        var tf = 'translate(' + d.posX + 'px, ' + d.posY + 'px)';
        card.style.setProperty('--t', tf);
        card.style.transform = tf; 
      }
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
        
        timer = setTimeout(function() { 
          longPressed=true; 
          
          // 🌟 拿起：摇晃 + 放大 + 变淡一点点
          card.classList.add('is-grabbed');
          card.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease';
          var tf = 'translate(' + startPosX + 'px,' + startPosY + 'px) scale(1.05)';
          card.style.setProperty('--t', tf);
          card.style.transform = tf;
          card.style.opacity = '0.85';
          
          if(navigator.vibrate) navigator.vibrate(15); 
        }, DRAG_DELAY);
      }, {passive:true});

      card.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        if(timer && !longPressed) { if(Math.abs(touch.clientX-startX)>8||Math.abs(touch.clientY-startY)>8){clearTimeout(timer);timer=null;} return; }
        if(!longPressed) return;
        e.preventDefault(); moved=true;
        
        Eden.data.posX = startPosX + touch.clientX - startX;
        Eden.data.posY = startPosY + touch.clientY - startY;
        
        // 🌟 移动跟手
        card.style.transition = 'none';
        var tf = 'translate(' + Eden.data.posX + 'px, ' + Eden.data.posY + 'px) scale(1.05)';
        card.style.setProperty('--t', tf);
        card.style.transform = tf;
      }, {passive:false});

      card.addEventListener('touchend', function(e) {
        clearTimeout(timer); timer=null; 
        card.classList.remove('is-grabbed');
        
        if(longPressed) { 
          if(moved) { Eden.save(); e.stopPropagation(); }
          
          // 🌟 落下回弹
          card.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
          var tf = 'translate(' + Eden.data.posX + 'px, ' + Eden.data.posY + 'px) scale(1)';
          card.style.setProperty('--t', tf);
          card.style.transform = tf;
          card.style.opacity = '1';
          
          setTimeout(function() { card.style.transition = ''; }, 350);
        }
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
      
      // 🌟 内联 CSS 清理，接入全局样式 pc-input 和 CLOSE_SVG
      panel.innerHTML =
        '<div class="pc-header">文字卡片<div class="pc-close-btn" id="edenCloseBtn">' + CLOSE_SVG + '</div></div>'+
        '<div class="pc-body" style="gap:8px;">'+
          '<div class="pc-group"><span class="pc-label">文字内容</span><textarea id="edenTextInput" class="pc-input" rows="4" style="resize:vertical;">'+App.esc(d.text||'')+'</textarea></div>'+
          '<div class="pc-group"><span class="pc-label">字体</span><select id="edenFontSelect" class="pc-input">'+fontOptionsHtml+'</select></div>'+
          '<div class="pc-group"><span class="pc-label">字号</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="edenSize" min="14" max="70" step="1" value="'+(d.fontSize||28)+'"><span class="pc-slider-val" id="edenSizeVal">'+(d.fontSize||28)+'px</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">倾斜</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="edenRotate" min="-20" max="20" step="1" value="'+(d.rotate||0)+'"><span class="pc-slider-val" id="edenRotateVal">'+(d.rotate||0)+'°</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">字间距</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="edenSpacing" min="0" max="20" step="1" value="'+(d.spacing||0)+'"><span class="pc-slider-val" id="edenSpacingVal">'+(d.spacing||0)+'px</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">行距</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="edenLineHeight" min="1.2" max="2.5" step="0.05" value="'+(d.lineHeight||1.4)+'"><span class="pc-slider-val" id="edenLineHeightVal">'+(d.lineHeight||1.4)+'</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">字色</span><div class="pc-dot" id="edenColorDot" style="background:'+currentFontColor+';width:28px;height:28px;border-radius:8px;"></div></div>'+
        '</div>'+
        '<div class="pc-footer"><button class="pc-btn pc-btn-save" id="edenSave" type="button">保 存</button><button class="pc-btn pc-btn-cancel" id="edenReset" type="button">重 置</button></div>';

      overlay.appendChild(panel); document.body.appendChild(overlay);

      var edenCard = App.$('#edenCard');
      if(edenCard) {
        var rect = edenCard.getBoundingClientRect();
        var left = rect.left + rect.width/2 - 140;
        if(left<8)left=8; if(left+280>window.innerWidth-8)left=window.innerWidth-288;
        var top = rect.bottom+8; if(top+430>window.innerHeight-10)top=Math.max(10,rect.top-440);
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
        panel.querySelector('#edenLineHeightVal').textContent = panel.querySelector('#edenLineHeight').value;
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
        el.style.lineHeight = panel.querySelector('#edenLineHeight').value;
        if (currentFontColor && currentFontColor.indexOf('linear-gradient') === 0) {
    el.style.background = currentFontColor;
    el.style.backgroundClip = 'text';
    el.style.webkitBackgroundClip = 'text';
    el.style.color = 'transparent';
  } else {
    el.style.background = '';
    el.style.backgroundClip = '';
    el.style.webkitBackgroundClip = '';
    el.style.color = currentFontColor;
  }
        el.style.fontFamily = family||'';
        el.style.whiteSpace = 'pre-wrap'; el.style.wordBreak = 'break-word';
      }

      ['edenSize','edenRotate','edenSpacing','edenLineHeight','edenTextInput'].forEach(function(id){
        var el = panel.querySelector('#'+id); if(el) el.addEventListener('input', preview);
      });
      panel.querySelector('#edenFontSelect').addEventListener('change', function(){
    var selOpt = panel.querySelector('#edenFontSelect');
    var selIdx = selOpt.selectedIndex;
    var family = selOpt.options[selIdx] ? selOpt.options[selIdx].dataset.family : '';
    if(family && App.font && App.font.loadByFamily){
      App.font.loadByFamily(family, function(){ preview(); });
    } else {
      preview();
    }
  });

      panel.querySelector('#edenColorDot').addEventListener('click', function(e){
        e.stopPropagation(); if(!App.openColorPicker) return;
        App.openColorPicker(currentFontColor, function(hex){ currentFontColor=hex; panel.querySelector('#edenColorDot').style.background=hex; preview(); },
        function(hex){ currentFontColor=hex; panel.querySelector('#edenColorDot').style.background=hex; preview(); }, 'eden_fontColor');
      });

      // 🌟 统一无感自动保存逻辑
      function saveAndClose(showToast) {
        var selOpt = panel.querySelector('#edenFontSelect'); var selIdx = selOpt.selectedIndex;
        Eden.data.fontName = selOpt.value;
        Eden.data.fontFamily = selOpt.options[selIdx] ? selOpt.options[selIdx].dataset.family : '';
        Eden.data.text = panel.querySelector('#edenTextInput').value;
        Eden.data.fontSize = parseInt(panel.querySelector('#edenSize').value);
        Eden.data.rotate = parseInt(panel.querySelector('#edenRotate').value);
        Eden.data.spacing = parseInt(panel.querySelector('#edenSpacing').value);
        Eden.data.lineHeight = parseFloat(panel.querySelector('#edenLineHeight').value);
        Eden.data.fontColor = currentFontColor;
        Eden.save(); Eden.apply(); overlay.remove();
        if(showToast) App.showToast('已保存');
      }

      panel.querySelector('#edenSave').addEventListener('click', function(e){ e.stopPropagation(); saveAndClose(true); });
      panel.querySelector('#edenCloseBtn').addEventListener('click', function(e){ e.stopPropagation(); saveAndClose(false); });
      overlay.addEventListener('click', function(e){ if(e.target===overlay && !document.querySelector('#cpOverlay')) saveAndClose(false); });

      panel.querySelector('#edenReset').addEventListener('click', function(e){
        e.stopPropagation(); Eden.data=JSON.parse(JSON.stringify(Eden.DEFAULTS)); Eden.save(); Eden.apply(); overlay.remove(); App.showToast('已重置');
      });
    }
  };

  /* ==========================================================
     拍立得 (Polaroid)
  ========================================================== */
  var Polaroid = {
    data: { imgs:[null,null,null,null], texts:['','','',''], cardColor:'linear-gradient(136deg,#ffffff,#d1d5db,#ffffff)', textColor:'#666666', countdownColor:'#666666', fontFamily:'' },
    posX: 0,
    posY: 0,

    load: function() {
      var saved = App.LS.get('polaroidData');
      if(saved) {
        Polaroid.data.imgs = saved.imgs || [null,null,null,null];
        Polaroid.data.texts = saved.texts || ['','','',''];
        Polaroid.data.cardColor = saved.cardColor || 'linear-gradient(136deg,#ffffff,#d1d5db,#ffffff)';
        Polaroid.data.textColor = saved.textColor || '#666666';
        Polaroid.data.countdownColor = saved.countdownColor || '#666666';
        Polaroid.data.fontFamily = saved.fontFamily || '';
      }
    },
    save: function() { App.LS.set('polaroidData', Polaroid.data); },

    createScallopedPath: function(w, h, r, spacing) {
      var step = r*2+spacing, cr=4;
      var topAvail=w-cr*2, sideAvail=h-cr*2;
      var topNum=Math.floor(topAvail/step), sideNum=Math.floor(sideAvail/step);
      var topUsed=topNum*step-spacing, topStart=(w-topUsed)/2;
      var sideUsed=sideNum*step-spacing, sideStart=(h-sideUsed)/2;
      var d='M 0,'+cr+' A '+cr+' '+cr+' 0 0 0 '+cr+',0';
      for(var i=0;i<topNum;i++){var x=topStart+i*step;d+=' L '+x+',0 A '+r+' '+r+' 0 0 0 '+(x+r*2)+',0';}
      d+=' L '+(w-cr)+',0 A '+cr+' '+cr+' 0 0 0 '+w+','+cr;
      for(var i=0;i<sideNum;i++){var y=sideStart+i*step;d+=' L '+w+','+y+' A '+r+' '+r+' 0 0 0 '+w+','+(y+r*2);}
      d+=' L '+w+','+(h-cr)+' A '+cr+' '+cr+' 0 0 0 '+(w-cr)+','+h;
      for(var i=topNum-1;i>=0;i--){var x=topStart+i*step;d+=' L '+(x+r*2)+','+h+' A '+r+' '+r+' 0 0 0 '+x+','+h;}
      d+=' L '+cr+','+h+' A '+cr+' '+cr+' 0 0 0 0,'+(h-cr);
      for(var i=sideNum-1;i>=0;i--){var y=sideStart+i*step;d+=' L 0,'+(y+r*2)+' A '+r+' '+r+' 0 0 0 0,'+y;}
      d+=' L 0,'+cr+' Z';
      return d;
    },

    apply: function() {
      var pathData = Polaroid.createScallopedPath(80, 100, 3, 5);
      var color = Polaroid.data.cardColor || 'linear-gradient(136deg,#ffffff,#d1d5db,#ffffff)';
      var isGradient = color.indexOf('linear-gradient') >= 0;

      document.querySelectorAll('.pola-svg').forEach(function(svg) {
        var existing = svg.querySelector('path');
        if(!existing) {
          existing = document.createElementNS('http://www.w3.org/2000/svg','path');
          existing.setAttribute('d', pathData);
          svg.appendChild(existing);
        }

        var oldDef = svg.querySelector('defs');
        if(oldDef) oldDef.remove();

        if(isGradient) {
          var m = color.match(/linear-gradient\(\s*(\d+)deg\s*,\s*(.+)\s*\)/);
          var angle = 180, stops = ['#ffffff','#d1d5db','#ffffff']; // ✅ 改成3个色值
          if(m) {
            angle = parseInt(m[1]) || 180;
            stops = m[2].split(/,(?![^(]*\))/).map(function(s){return s.trim();});
          }
          var rad = (angle - 90) * Math.PI / 180;
          var x1 = 50 - 50*Math.cos(rad), y1 = 50 - 50*Math.sin(rad);
          var x2 = 50 + 50*Math.cos(rad), y2 = 50 + 50*Math.sin(rad);

          var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
          var grad = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
          grad.setAttribute('id','polaGrad');
          grad.setAttribute('x1', x1+'%'); grad.setAttribute('y1', y1+'%');
          grad.setAttribute('x2', x2+'%'); grad.setAttribute('y2', y2+'%');

          stops.forEach(function(s, i){
            var stop = document.createElementNS('http://www.w3.org/2000/svg','stop');
            stop.setAttribute('offset', (i/(stops.length-1)*100)+'%');
            stop.setAttribute('stop-color', s);
            grad.appendChild(stop);
          });
          defs.appendChild(grad);
          svg.insertBefore(defs, svg.firstChild);
          existing.setAttribute('fill', 'url(#polaGrad)');
        } else {
          existing.setAttribute('fill', color);
        }
      });

      var cards = document.querySelectorAll('.pola-card');
      cards.forEach(function(card, idx) {
        var photo = card.querySelector('.pola-photo');
        var text = card.querySelector('.pola-text');
        if(photo) {
          if(Polaroid.data.imgs[idx]) {
            photo.innerHTML = '<img src="'+Polaroid.data.imgs[idx]+'">';
          } else {
            photo.innerHTML = '';
          }
        }
        if(text) {
          text.textContent = Polaroid.data.texts[idx] || '';
          text.style.color = Polaroid.data.textColor;
        }
      });

      var polaFont = Polaroid.data.fontFamily || '';
      document.querySelectorAll('.pola-text').forEach(function(el){
        el.style.fontFamily = polaFont;
      });
      
      var rightCol = document.querySelector('.polaroid-right');
      if(rightCol) {
        rightCol.style.fontFamily = polaFont;
        var yearEl = rightCol.querySelector('.countdown-year');
        var labelEl = rightCol.querySelector('.countdown-label');
        var daysEl = rightCol.querySelector('.countdown-days');
        if(yearEl) yearEl.style.color = Polaroid.data.countdownColor;
        if(labelEl) labelEl.style.color = Polaroid.data.countdownColor;
        if(daysEl) daysEl.style.color = Polaroid.data.countdownColor;
      }
    },

    bindClicks: function() {
      document.querySelectorAll('.pola-card').forEach(function(card) {
        card.addEventListener('click', function(e) {
          e.stopPropagation();
          Polaroid.openEdit();
        });
      });
      var right = document.querySelector('.polaroid-right');
      if(right) right.addEventListener('click', function(e) { e.stopPropagation(); Polaroid.openEdit(); });
    },

    openEdit: function() {
      var old = App.$('#polaEditOverlay'); if(old) old.remove();
      var d = Polaroid.data;

      var overlay = document.createElement('div');
      overlay.id = 'polaEditOverlay'; overlay.className = 'pc-edit-overlay';
      var panel = document.createElement('div'); panel.className = 'pc-edit-panel';

      var slotsHtml = '';
      for(var i=0; i<4; i++) {
        var thumbBg = d.imgs[i] ? 'background-image:url('+App.escAttr(d.imgs[i])+');background-size:cover;background-position:center;' : '';
        slotsHtml +=
          '<div class="pz-edit-slot">'+
            '<div class="pz-edit-thumb" data-idx="'+i+'" style="'+thumbBg+'">'+(d.imgs[i]?'<div class="pz-edit-thumb-del" data-idx="'+i+'">×</div>':'<span class="pz-edit-thumb-placeholder">+</span>')+'</div>'+
            '<input type="text" class="pc-input" data-tidx="'+i+'" placeholder="文字..." value="'+App.escAttr(d.texts[i]||'')+'" style="font-size:11px;margin-top:4px;text-align:center;">'+
          '</div>';
      }

      panel.innerHTML =
        '<div class="pc-header">编辑集邮卡册<div class="pc-close-btn" id="polaCloseBtn">'+
          '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;fill:none;"><path d="M18 6L6 18M6 6l12 12"/></svg>'+
        '</div></div>'+
        '<div class="pc-body">'+
          '<div class="pc-group"><span class="pc-label">点击上传照片 & 输入文字</span></div>'+
          '<div class="pz-edit-slots">'+slotsHtml+'</div>'+
          '<div class="pc-group">'+
            '<span class="pc-label">文字字体</span>'+
            '<select class="pc-input" id="polaFontSelect">'+Pixel._buildFontOptions(d.fontFamily)+'</select>'+
          '</div>'+
          '<div class="pc-group">'+
            '<span class="pc-label">卡纸 & 卡册文字 & 日期文字</span>'+
            '<div class="pc-av-row" style="gap:12px;">'+
              '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">'+
                '<div class="pc-icon-btn" id="polaCardColorBtn" style="width:36px;height:28px;border-radius:8px;background:'+App.escAttr(d.cardColor)+';cursor:pointer;border:1px solid rgba(0,0,0,0.1);"></div>'+
                '<span style="font-size:10px;color:#999;">卡纸</span>'+
              '</div>'+
              '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">'+
                '<div class="pc-icon-btn" id="polaTextColorBtn" style="width:36px;height:28px;border-radius:8px;background:'+App.escAttr(d.textColor)+';cursor:pointer;border:1px solid rgba(0,0,0,0.1);"></div>'+
                '<span style="font-size:10px;color:#999;">卡册</span>'+
              '</div>'+
              '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">'+
                '<div class="pc-icon-btn" id="polaCountdownColorBtn" style="width:36px;height:28px;border-radius:8px;background:'+App.escAttr(d.countdownColor)+';cursor:pointer;border:1px solid rgba(0,0,0,0.1);"></div>'+
                '<span style="font-size:10px;color:#999;">日期</span>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="pc-footer">'+
          '<button class="pc-btn pc-btn-save" id="polaSaveBtn" type="button">保 存</button>'+
          '<button class="pc-btn pc-btn-cancel" id="polaResetBtn" type="button">重 置</button>'+
        '</div>';

      overlay.appendChild(panel); document.body.appendChild(overlay);

      var pRect = panel.getBoundingClientRect();
      var startLeft = (window.innerWidth - pRect.width)/2;
      var startTop = window.innerHeight - pRect.height - 40; if(startTop<10) startTop=10;
      panel.style.left = startLeft+'px'; panel.style.top = startTop+'px'; panel.style.margin='0';

      if(App.modules.cards && App.modules.cards._bindPanelDrag) App.modules.cards._bindPanelDrag(panel);

      panel.querySelectorAll('.pz-edit-thumb').forEach(function(thumb) {
        thumb.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(thumb.dataset.idx);
          if(e.target.classList.contains('pz-edit-thumb-del')) {
            d.imgs[idx]=null;
            thumb.style.backgroundImage='';
            thumb.innerHTML='<span class="pz-edit-thumb-placeholder">+</span>';
            Polaroid.apply();
            return;
          }
          App.showImagePicker({
            title:'第'+(idx+1)+'张照片',
            callback:function(src){
              if(src===''){d.imgs[idx]=null;thumb.style.backgroundImage='';thumb.innerHTML='<span class="pz-edit-thumb-placeholder">+</span>';Polaroid.apply();return;}
              if(!src)return;
              d.imgs[idx]=src;
              thumb.style.backgroundImage='url('+src+')';
              thumb.style.backgroundSize='cover';
              thumb.style.backgroundPosition='center';
              thumb.innerHTML='<div class="pz-edit-thumb-del" data-idx="'+idx+'">×</div>';
              Polaroid.apply();
            }
          });
        });
      });

      panel.querySelector('#polaCardColorBtn').addEventListener('click', function(e){
        e.stopPropagation();
        App.openColorPicker(d.cardColor, function(color){
          d.cardColor=color;
          panel.querySelector('#polaCardColorBtn').style.background=color;
          Polaroid.apply();
        }, function(color){
          d.cardColor=color;
          panel.querySelector('#polaCardColorBtn').style.background=color;
          Polaroid.apply();
        });
      });

      panel.querySelector('#polaTextColorBtn').addEventListener('click', function(e){
        e.stopPropagation();
        App.openColorPicker(d.textColor, function(color){
          d.textColor=color;
          panel.querySelector('#polaTextColorBtn').style.background=color;
          Polaroid.apply();
        }, function(color){
          d.textColor=color;
          panel.querySelector('#polaTextColorBtn').style.background=color;
          Polaroid.apply();
        });
      });

      panel.querySelector('#polaCountdownColorBtn').addEventListener('click', function(e){
        e.stopPropagation();
        App.openColorPicker(d.countdownColor, function(color){
          d.countdownColor=color;
          panel.querySelector('#polaCountdownColorBtn').style.background=color;
          Polaroid.apply();
        }, function(color){
          d.countdownColor=color;
          panel.querySelector('#polaCountdownColorBtn').style.background=color;
          Polaroid.apply();
        });
      });

      panel.querySelector('#polaFontSelect').addEventListener('change', function(){
        d.fontFamily = this.value;
        Polaroid.apply();
      });

      function saveAndClose(showToast) {
        panel.querySelectorAll('input[data-tidx]').forEach(function(inp){
          d.texts[parseInt(inp.dataset.tidx)] = inp.value;
        });
        Polaroid.save(); Polaroid.apply(); overlay.remove();
        if(showToast) App.showToast('已保存');
      }

      panel.querySelector('#polaSaveBtn').addEventListener('click', function(e){e.stopPropagation();saveAndClose(true);});
      panel.querySelector('#polaCloseBtn').addEventListener('click', function(e){e.stopPropagation();saveAndClose(false);});
      overlay.addEventListener('click', function(e){if(e.target===overlay && !document.querySelector('#cpOverlay') && !document.querySelector('.gip-overlay'))saveAndClose(false);});

      panel.querySelector('#polaResetBtn').addEventListener('click', function(e){
        e.stopPropagation();
        Polaroid.data.texts = ['','','',''];
        Polaroid.data.cardColor = 'linear-gradient(136deg,#ffffff,#d1d5db,#ffffff)';
        Polaroid.data.textColor = '#666666';
        Polaroid.data.countdownColor = '#666666';
        Polaroid.data.fontFamily = '';
        Polaroid.save(); Polaroid.apply(); overlay.remove(); App.showToast('已重置');
      });
    },

    bindDrag: function() {
      var container = document.getElementById('polaroidRow');
      if(!container || container._polaDragBound) return;
      container._polaDragBound = true;

      var startX, startY, origX, origY, longPressed=false, timer, moved=false;
      var saved = App.LS.get('polaroidPos');
      if(saved) {
        Polaroid.posX=saved.x||0; Polaroid.posY=saved.y||0;
        var tf='translate('+Polaroid.posX+'px,'+Polaroid.posY+'px)';
        container.style.setProperty('--t',tf); container.style.transform=tf;
      }

      container.addEventListener('touchstart', function(e) {
        var t=e.touches[0]; startX=t.clientX; startY=t.clientY;
        longPressed=false; moved=false;
        timer=setTimeout(function(){
          longPressed=true; origX=Polaroid.posX; origY=Polaroid.posY;
          container.classList.add('is-grabbed');
          container.style.transition='transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
          var tf='translate('+origX+'px,'+origY+'px) scale(1.03)';
          container.style.setProperty('--t',tf); container.style.transform=tf;
          container.style.zIndex='999';
          if(navigator.vibrate) navigator.vibrate(15);
        }, DRAG_DELAY);
      }, {passive:true});

      container.addEventListener('touchmove', function(e) {
        var t=e.touches[0];
        if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
        if(!longPressed)return;
        moved=true; e.preventDefault(); e.stopPropagation();
        Polaroid.posX=origX+(t.clientX-startX); Polaroid.posY=origY+(t.clientY-startY);
        container.style.transition='none';
        var tf='translate('+Polaroid.posX+'px,'+Polaroid.posY+'px) scale(1.03)';
        container.style.setProperty('--t',tf); container.style.transform=tf;
      }, {passive:false});

      container.addEventListener('touchend', function(){
        clearTimeout(timer); timer=null;
        container.classList.remove('is-grabbed');
        if(longPressed){
          if(moved) App.LS.set('polaroidPos',{x:Polaroid.posX,y:Polaroid.posY});
          container.style.transition='transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
          var tf='translate('+Polaroid.posX+'px,'+Polaroid.posY+'px) scale(1)';
          container.style.setProperty('--t',tf); container.style.transform=tf;
          container.style.zIndex='';
          setTimeout(function(){container.style.transition='';},350);
        } else { container.style.zIndex=''; }
        longPressed=false; moved=false;
      });
    }
  };
  
  /* ==========================================================
     倒计时 (Countdown)
  ========================================================== */
    var Countdown = {
    update: function() {
      var dayEl = document.getElementById('countdownDays');
      var yearEl = document.getElementById('countdownYear');
      if(!dayEl) return;
      var now = new Date();
      var year = now.getFullYear();
      var endOfYear = new Date(year, 11, 31, 23, 59, 59);
      var diff = Math.ceil((endOfYear - now) / (1000*60*60*24));
      if(yearEl) yearEl.textContent = year + '年';
      dayEl.textContent = diff + '天';
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

      // 拍立得
      Polaroid.load();
      Polaroid.apply();
      Polaroid.bindClicks();
      Polaroid.bindDrag();

      // 倒计时
      Countdown.update();
      
      // 文字卡片
      Eden.load(); Eden.apply(); Eden.bindDrag();
            var edenEl = App.$('#edenCard');
      if(edenEl) {
        edenEl.addEventListener('click', function(e){
          e.stopPropagation();
          Eden.openEdit();
        });
      }
    }
  };

  // 暴露给外部
  App.pixel = Pixel;
  App.puzzle = Puzzle;
  App.eden = Eden;
  App.polaroid = Polaroid;
  App.countdown = Countdown;
  App.register('frost', Frost);
})();
