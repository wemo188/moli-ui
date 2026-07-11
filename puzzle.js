
/* ================================================
   🌟 墨墨独立督造级高规 · 逻辑与锯齿双核拼图系统
   ================================================ */
(function(){
  'use strict';
  var App = window.App; if(!App) return;

  var Puz = {
    imgSrc: App.LS.get('pzCustomImg') || '',
    init: function() { App.safeOn('#iconPuzzle', 'click', function(){ Puz.openGame(); }); },
    openGame: function() {
      var old = document.getElementById('pzGamePanel'); if(old) { old.remove(); return; }
      var panel = document.createElement('div');
      panel.id = 'pzGamePanel'; panel.className = 'bf-sub-panel';
      panel.innerHTML = '<div class="bf-nav"><button class="bf-back" id="pzBack" type="button"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3.5"/><path d="M36 20L24 32L36 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="bf-nav-title">益智推演</span><div class="bf-nav-right"></div></div><div class="bf-scroll-body"><div id="pzGameContent"></div></div>';
      document.body.appendChild(panel);
      requestAnimationFrame(function(){ panel.classList.add('show'); });
      if(App.bindSwipeBack) App.bindSwipeBack(panel, function(){ panel.remove(); });
      panel.querySelector('#pzBack').addEventListener('click', function(){ panel.classList.remove('show'); panel.classList.add('hidden'); setTimeout(function(){ panel.remove(); }, 350); });
      Puz.showModeSelect(panel.querySelector('#pzGameContent'));
    },
    showModeSelect: function(container) {
      container.innerHTML = '<div class="pz-wrap"><div class="pz-mode-select">' +
        '<div class="pz-mode-card" id="pzModeSlide"><div class="pz-mode-icon"><svg viewBox="0 0 64 64" fill="none"><rect x="12" y="12" width="18" height="18" rx="2" stroke="#9ca3b0" stroke-width="2.5"/><rect x="34" y="12" width="18" height="18" rx="2" stroke="#9ca3b0" stroke-width="2.5"/><rect x="12" y="34" width="18" height="18" rx="2" stroke="#9ca3b0" stroke-width="2.5"/><path d="M38 38L48 48M48 38L38 48" stroke="#9ca3b0" stroke-width="2" stroke-linecap="round"/></svg></div><div class="pz-mode-name">华容道</div><div class="pz-mode-desc">滑块流转</div></div>' +
        '<div class="pz-mode-card" id="pzModeJigsaw"><div class="pz-mode-icon"><svg viewBox="0 0 64 64" fill="none"><path d="M12 28V12h16v4a4 4 0 108 0v-4h16v16h-4a4 4 0 100 8h4v16H36v-4a4 4 0 10-8 0v4H12V36h4a4 4 0 100-8h-4z" stroke="#9ca3b0" stroke-width="2.5" stroke-linejoin="round"/></svg></div><div class="pz-mode-name">拼图</div><div class="pz-mode-desc">盲猜嵌合极限挑战</div></div>' +
      '</div></div>';
      container.querySelector('#pzModeSlide').addEventListener('click', function(){ Slide.buildInto(container); });
      container.querySelector('#pzModeJigsaw').addEventListener('click', function(){ Jigsaw.buildInto(container); });
    },
    pickImage: function(callback) {
      if(!App.showImagePicker) return App.showToast('底座相册未开启');
      App.showImagePicker({ title: '上载主视图源', callback: function(src) { if(src) { Puz.imgSrc = src; App.LS.set('pzCustomImg', src); if(callback) callback(); } }});
    }
  };

  /* ============================
     滑动推算版 (华容道 - 脱离成独立的 css 类名尺寸)
  ============================ */
  var Slide = {
    core: null, winMsg: null, emptyState: null,
    size: 4, coreSize: 0, tileSize: 0, tiles: [], emptyPos: {x:0, y:0}, playing: false, steps: 0, stepsText: null,
    buildInto: function(container) {
      container.innerHTML = '';
      var wrap = document.createElement('div'); wrap.className = 'pz-wrap';
      var toolbar = document.createElement('div'); toolbar.className = 'pz-toolbar';

      var backBtn = document.createElement('div'); backBtn.className = 'pz-btn'; backBtn.textContent = '返回'; backBtn.onclick = function(){ Puz.showModeSelect(container); };
      var uploadBtn = document.createElement('div'); uploadBtn.className = 'pz-btn'; uploadBtn.textContent = '重录印迹'; uploadBtn.onclick = function(){ Puz.pickImage(function(){ Slide.resetAndBuild(); }); };
      
      var sizeSelect = document.createElement('select'); sizeSelect.className = 'pz-select';
      sizeSelect.innerHTML = '<option value="3">3x3</option><option value="4">4x4</option><option value="5">5x5</option><option value="6">6x6</option>';
      sizeSelect.value = String(Slide.size); sizeSelect.onchange = function(){ Slide.size = parseInt(this.value); Slide.resetAndBuild(); };

      var startBtn = document.createElement('div'); startBtn.className = 'pz-btn primary'; startBtn.textContent = '打乱出阵'; startBtn.onclick = function(){ Slide.shuffle(); };
      toolbar.appendChild(backBtn); toolbar.appendChild(uploadBtn); toolbar.appendChild(sizeSelect); toolbar.appendChild(startBtn);

      var board = document.createElement('div'); board.className = 'pz-slide-board';
      var core = document.createElement('div'); core.className = 'pz-slide-core'; Slide.core = core;

      var winMsg = document.createElement('div'); winMsg.className = 'pz-win'; winMsg.innerHTML = '<h3>推演完毕</h3><span>惊叹心算能力 ✨</span>'; Slide.winMsg = winMsg;
      var emptyState = document.createElement('div'); emptyState.className = 'pz-empty'; emptyState.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>上载图景结阵</span>'; Slide.emptyState = emptyState;
      core.appendChild(emptyState); core.appendChild(winMsg); board.appendChild(core);

      var statsWrap = document.createElement('div'); statsWrap.style.width = "100%";
      var stepsDiv = document.createElement('div'); stepsDiv.className = 'pz-footer-stats'; stepsDiv.textContent = '推演步数: 0'; Slide.stepsText = stepsDiv;
      
      var actionRow = document.createElement('div'); actionRow.className = 'pz-footer-actions';
      var resBtn = document.createElement('div'); resBtn.className='pz-btn'; resBtn.textContent='重置'; resBtn.onclick=function(){ Slide.resetAndBuild(); };
      var saveBtn = document.createElement('div'); saveBtn.className='pz-btn primary'; saveBtn.textContent='存档'; saveBtn.onclick=function(){ Slide.saveGame(); };
      var delBtn = document.createElement('div'); delBtn.className='pz-btn danger'; delBtn.textContent='删除'; delBtn.onclick=function(){ Slide.delGame(); };
      actionRow.appendChild(resBtn); actionRow.appendChild(saveBtn); actionRow.appendChild(delBtn);

      statsWrap.appendChild(stepsDiv); statsWrap.appendChild(actionRow);
      wrap.appendChild(toolbar); wrap.appendChild(board); wrap.appendChild(statsWrap);
      container.appendChild(wrap);

      Slide.loadGame();
    },

    updateSteps: function(val) { Slide.steps = val; Slide.stepsText.textContent = '推演步数: ' + val; },
    resetAndBuild: function() {
      Slide.playing = false; Slide.updateSteps(0);
      if(Slide.winMsg) Slide.winMsg.classList.remove('show');
      var oldTiles = Slide.core.querySelectorAll('.pz-slide-tile'); oldTiles.forEach(function(el){ el.remove(); });

      if(!Puz.imgSrc) { if(Slide.emptyState) Slide.emptyState.style.display = 'flex'; return; }
      if(Slide.emptyState) Slide.emptyState.style.display = 'none';

      Slide.coreSize = Slide.core.clientWidth; 
      Slide.tileSize = Slide.coreSize / Slide.size; Slide.tiles = [];
      var total = Slide.size * Slide.size; Slide.emptyPos = { x: Slide.size - 1, y: Slide.size - 1 };

      for(var i=0; i<total-1; i++){
        var t = document.createElement('div'); t.className = 'pz-slide-tile';
        var tx = i % Slide.size, ty = Math.floor(i / Slide.size);
        
        t.style.width = Slide.tileSize + 'px'; t.style.height = Slide.tileSize + 'px';
        t.style.backgroundImage = 'url(' + Puz.imgSrc + ')'; t.style.backgroundSize = Slide.coreSize + 'px ' + Slide.coreSize + 'px';
        t.style.backgroundPosition = '-' + (tx*Slide.tileSize) + 'px -' + (ty*Slide.tileSize) + 'px';
        t.style.transform = 'translate(' + (tx*Slide.tileSize) + 'px, ' + (ty*Slide.tileSize) + 'px)';
        t.dataset.idx = i;
        
        Slide.tiles.push({ el: t, targetX: tx, targetY: ty, x: tx, y: ty }); Slide.core.appendChild(t);
        
        (function(idx, el){
          var sx=0, sy=0;
          el.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive:true});
          el.addEventListener('touchend', function(e){ var dx = Math.abs(e.changedTouches[0].clientX - sx), dy = Math.abs(e.changedTouches[0].clientY - sy); if(dx < 20 && dy < 20) Slide.moveTile(idx); }, {passive:true});
        })(i, t);
      }
    },
    moveTile: function(idx) {
      if(!Slide.playing) return; var t = Slide.tiles[idx]; var dx = Math.abs(t.x - Slide.emptyPos.x), dy = Math.abs(t.y - Slide.emptyPos.y);
      if((dx===1 && dy===0) || (dx===0 && dy===1)) {
        var tempX = t.x, tempY = t.y; t.x = Slide.emptyPos.x; t.y = Slide.emptyPos.y; Slide.emptyPos.x = tempX; Slide.emptyPos.y = tempY;
        t.el.style.transform = 'translate(' + (t.x*Slide.tileSize) + 'px, ' + (t.y*Slide.tileSize) + 'px)';
        Slide.updateSteps(Slide.steps + 1); Slide.checkWin();
      }
    },
    shuffle: function() {
      if(!Puz.imgSrc) return App.showToast('赋予灵魂后方可乱阵'); Slide.resetAndBuild(); Slide.playing = true; Slide.updateSteps(0);
      var steps = Slide.size * Slide.size * 5; 
      for(var i=0; i<steps; i++){
        var movable = [];
        for(var j=0; j<Slide.tiles.length; j++){ var t = Slide.tiles[j]; var dx = Math.abs(t.x - Slide.emptyPos.x), dy = Math.abs(t.y - Slide.emptyPos.y); if((dx===1 && dy===0) || (dx===0 && dy===1)) movable.push(t); }
        var pick = movable[Math.floor(Math.random()*movable.length)]; var tx = pick.x, ty = pick.y; pick.x = Slide.emptyPos.x; pick.y = Slide.emptyPos.y; Slide.emptyPos.x = tx; Slide.emptyPos.y = ty;
      }
      for(var k=0; k<Slide.tiles.length; k++){ var t2 = Slide.tiles[k]; t2.el.style.transform = 'translate(' + (t2.x*Slide.tileSize) + 'px, ' + (t2.y*Slide.tileSize) + 'px)'; }
    },
    checkWin: function() { for(var i=0; i<Slide.tiles.length; i++) { if(Slide.tiles[i].x !== Slide.tiles[i].targetX || Slide.tiles[i].y !== Slide.tiles[i].targetY) return; } Slide.playing = false; setTimeout(function(){ if(Slide.winMsg) Slide.winMsg.classList.add('show'); }, 300); },
    saveGame: function() { if(!Puz.imgSrc) return App.showToast('虚空无法印证'); var snap = { size: Slide.size, steps: Slide.steps, emptyPos: Slide.emptyPos, tiles: Slide.tiles.map(function(t){ return {x: t.x, y: t.y}; }) }; App.LS.set('mmPzSlideSave', snap); App.showToast('棋局已刻印！'); },
    loadGame: function() { var snap = App.LS.get('mmPzSlideSave'); if(!snap || !Puz.imgSrc) { Slide.resetAndBuild(); return; } Slide.size = snap.size; Slide.resetAndBuild(); document.querySelector('.pz-select').value = String(snap.size); Slide.emptyPos = snap.emptyPos; Slide.updateSteps(snap.steps); Slide.playing = true; for(var i=0; i<snap.tiles.length; i++) { Slide.tiles[i].x = snap.tiles[i].x; Slide.tiles[i].y = snap.tiles[i].y; Slide.tiles[i].el.style.transform = 'translate(' + (Slide.tiles[i].x * Slide.tileSize) + 'px, ' + (Slide.tiles[i].y * Slide.tileSize) + 'px)'; } },
    delGame: function() { App.LS.remove('mmPzSlideSave'); Slide.resetAndBuild(); App.showToast('旧历抹除'); }
  };

  /* ============================
     立体骨董拼图引擎 (带厚度描边 & 吸附反馈 & 去底图 & 高达7x7)
  ============================ */
  var Jigsaw = {
    canvas: null, ctx: null, pieces: [], cols: 4, rows: 4, img: null, imgW: 0, imgH: 0, pieceW: 0, pieceH: 0,
    dragging: null, offsetX: 0, offsetY: 0, snapDist: 20, playing: false, canvasCssW: 0, canvasCssH: 0, winMsg: null,

    buildInto: function(container) {
      container.innerHTML = '';
      var wrap = document.createElement('div'); wrap.className = 'pz-wrap';
      var toolbar = document.createElement('div'); toolbar.className = 'pz-toolbar';

      var backBtn = document.createElement('div'); backBtn.className = 'pz-btn'; backBtn.textContent = '返回'; backBtn.onclick = function(){ Puz.showModeSelect(container); };
      var uploadBtn = document.createElement('div'); uploadBtn.className = 'pz-btn'; uploadBtn.textContent = '上传图像'; uploadBtn.onclick = function(){ Puz.pickImage(function(){ Jigsaw.initDraw(); }); };
      
      var sizeSelect = document.createElement('select'); sizeSelect.className = 'pz-select';
      // 丧心病狂地增加了最高 7x7！！
      sizeSelect.innerHTML = '<option value="3">3x3</option><option value="4">4x4</option><option value="5">5x5</option><option value="6">6x6 盲盒</option><option value="7">7x7 地狱</option>';
      sizeSelect.value = String(Jigsaw.cols);
      sizeSelect.onchange = function(){ var v=parseInt(this.value); Jigsaw.cols=v; Jigsaw.rows=v; Jigsaw.initDraw(); };

      var startBtn = document.createElement('div'); startBtn.className = 'pz-btn primary'; startBtn.textContent = '撒件'; startBtn.onclick = function(){ Jigsaw.scatter(); };
      toolbar.appendChild(backBtn); toolbar.appendChild(uploadBtn); toolbar.appendChild(sizeSelect); toolbar.appendChild(startBtn);

      var canvasWrap = document.createElement('div'); canvasWrap.className = 'pz-jigsaw-wrap';
      var canvas = document.createElement('canvas'); canvas.className = 'pz-jigsaw-canvas';
      Jigsaw.canvas = canvas; Jigsaw.ctx = canvas.getContext('2d');

      var winMsg = document.createElement('div'); winMsg.className = 'pz-win'; winMsg.innerHTML = '<h3>心眼天开</h3><span>地狱盲拼完成 ✨</span>'; Jigsaw.winMsg = winMsg;
      var emptyState = document.createElement('div'); emptyState.className = 'pz-empty'; emptyState.id = 'pzJigsawEmpty'; emptyState.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>提供原始影像切割</span>';

      canvasWrap.appendChild(canvas); canvasWrap.appendChild(winMsg); canvasWrap.appendChild(emptyState);

      var actionRow = document.createElement('div'); actionRow.className = 'pz-footer-actions';
      var saveBtn = document.createElement('div'); saveBtn.className='pz-btn primary'; saveBtn.textContent='定档'; saveBtn.onclick=function(){ Jigsaw.saveGame(); };
      var delBtn = document.createElement('div'); delBtn.className='pz-btn danger'; delBtn.textContent='清退'; delBtn.onclick=function(){ Jigsaw.delGame(); };
      actionRow.appendChild(saveBtn); actionRow.appendChild(delBtn);

      wrap.appendChild(toolbar); wrap.appendChild(canvasWrap); wrap.appendChild(actionRow); container.appendChild(wrap);
      Jigsaw.bindTouch(); Jigsaw.loadGameOrInit(); 
    },

    initDraw: function(loadCallback) {
      if(Jigsaw.winMsg) Jigsaw.winMsg.classList.remove('show');
      var empty = document.getElementById('pzJigsawEmpty');
      if(!Puz.imgSrc) { if(empty) empty.style.display = 'flex'; return; }
      if(empty) empty.style.display = 'none';

      var wrapperW = document.querySelector('.pz-jigsaw-wrap').clientWidth; 
      var cssW = wrapperW - 12; 
      var gapSpace = 16; var trayH = cssW * 0.50; 
      var cssH = cssW + gapSpace + trayH; 
      Jigsaw.canvasCssW = cssW; Jigsaw.canvasCssH = cssH;

      var dpr = window.devicePixelRatio || 1; 
      Jigsaw.canvas.style.width = cssW + 'px'; Jigsaw.canvas.style.height = cssH + 'px';
      Jigsaw.canvas.width = cssW * dpr; Jigsaw.canvas.height = cssH * dpr;
      Jigsaw.ctx.scale(dpr, dpr);

      var img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = function() {
        Jigsaw.img = img; Jigsaw.imgW = cssW; Jigsaw.imgH = cssW; 
        Jigsaw.pieceW = Jigsaw.imgW / Jigsaw.cols; Jigsaw.pieceH = Jigsaw.imgH / Jigsaw.rows;
        if(loadCallback) loadCallback(); else { Jigsaw.playing = false; Jigsaw.generatePieces(); Jigsaw.draw(); }
      };
      img.src = Puz.imgSrc;
    },

    generatePieces: function() {
      Jigsaw.pieces = [];
      for(var r = 0; r < Jigsaw.rows; r++){
        for(var c = 0; c < Jigsaw.cols; c++){
          Jigsaw.pieces.push({ col: c, row: r, targetX: c * Jigsaw.pieceW, targetY: r * Jigsaw.pieceH, x: c * Jigsaw.pieceW, y: r * Jigsaw.pieceH, placed: false });
        }
      }
    },

    scatter: function() {
      if(!Puz.imgSrc) return App.showToast('无法于虚无生烟花');
      Jigsaw.playing = true; if(Jigsaw.winMsg) Jigsaw.winMsg.classList.remove('show');
      var gap = 16; var boxTopY = Jigsaw.imgH + gap; var trayH = Jigsaw.canvasCssH - boxTopY;
      for(var i = 0; i < Jigsaw.pieces.length; i++){
        var p = Jigsaw.pieces[i];
        p.x = 2 + Math.random() * Math.max(1, (Jigsaw.canvasCssW - Jigsaw.pieceW - 4));
        p.y = boxTopY + 2 + Math.random() * Math.max(1, (trayH - Jigsaw.pieceH - 4)); 
        p.placed = false;
      }
      Jigsaw.draw();
    },

    draw: function() {
      var ctx = Jigsaw.ctx; ctx.clearRect(0, 0, Jigsaw.canvasCssW, Jigsaw.canvasCssH);
      
      // -- 你要求的：绝不要底图！上面空空如也，只有个放置区界线，彻底盲拼！
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(0, 0, Jigsaw.imgW, Jigsaw.imgH);
      ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.strokeRect(0, 0, Jigsaw.imgW, Jigsaw.imgH);
      
      // 唯有当游戏未打乱时，给玩家展示一幅完整的通关美图画卷。只要一点开始碎件，底图灰飞烟灭。
      if(Jigsaw.img && !Jigsaw.playing) { ctx.globalAlpha = 0.5; ctx.drawImage(Jigsaw.img, 0, 0, Jigsaw.imgW, Jigsaw.imgH); ctx.globalAlpha = 1; }

      // -- 储物区底部分界暗纹
      var gap = 16; var boxTopY = Jigsaw.imgH + gap; var trayH = Jigsaw.canvasCssH - boxTopY;
      ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(0, boxTopY, Jigsaw.canvasCssW, trayH);
      ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1.5; ctx.strokeRect(0, boxTopY, Jigsaw.canvasCssW, trayH);

      // 被卡对点的人先入库
      for(var i = 0; i < Jigsaw.pieces.length; i++){ var p = Jigsaw.pieces[i]; if(p === Jigsaw.dragging) continue; Jigsaw.drawPiece(p); }
      if(Jigsaw.dragging) Jigsaw.drawPiece(Jigsaw.dragging); 
    },

    drawPiece: function(p) {
      var ctx = Jigsaw.ctx; var pw = Jigsaw.pieceW, ph = Jigsaw.pieceH; var tab = pw * 0.18; 
      
      // 🚀【3D实体立体雕琢法：阴影投影层】
      ctx.save(); ctx.beginPath(); Jigsaw.drawPiecePath(ctx, p.x, p.y, pw, ph, p.col, p.row, tab); ctx.closePath();
      if(!p.placed) { 
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
        ctx.fillStyle = '#fff'; ctx.fill(); // 把影印砸到地上
      }
      ctx.restore();

      // 切割照片填充图表
      ctx.save(); ctx.beginPath(); Jigsaw.drawPiecePath(ctx, p.x, p.y, pw, ph, p.col, p.row, tab); ctx.closePath();
      ctx.clip(); 
      ctx.drawImage(Jigsaw.img, p.x - p.targetX, p.y - p.targetY, Jigsaw.imgW, Jigsaw.imgH); 
      ctx.restore();

      // 🚀【立体厚边沿刻画，放置前后产生深邃物理差感！】
      ctx.save(); ctx.beginPath(); Jigsaw.drawPiecePath(ctx, p.x, p.y, pw, ph, p.col, p.row, tab); ctx.closePath();
      if(!p.placed) {
        ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.lineWidth = 1.5; ctx.stroke(); // 黑漆外线
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.5; ctx.stroke(); // 微光反光
      } else {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 0.6; ctx.stroke(); // 落回缝隙后的极度融合黑缝
      }
      ctx.restore();
    },

    drawPiecePath: function(ctx, x, y, w, h, col, row, tab) {
      var cols = Jigsaw.cols, rows = Jigsaw.rows; ctx.moveTo(x, y);
      if(row === 0) { ctx.lineTo(x + w, y); } else { var s1 = (col + row - 1) % 2 === 0 ? 1 : -1; ctx.lineTo(x + w * 0.35, y); ctx.bezierCurveTo(x + w * 0.35, y + s1 * tab, x + w * 0.65, y + s1 * tab, x + w * 0.65, y); ctx.lineTo(x + w, y); }
      if(col === cols - 1) { ctx.lineTo(x + w, y + h); } else { var s2 = (col + row) % 2 === 0 ? 1 : -1; ctx.lineTo(x + w, y + h * 0.35); ctx.bezierCurveTo(x + w + s2 * tab, y + h * 0.35, x + w + s2 * tab, y + h * 0.65, x + w, y + h * 0.65); ctx.lineTo(x + w, y + h); }
      if(row === rows - 1) { ctx.lineTo(x, y + h); } else { var s3 = (col + row) % 2 === 0 ? 1 : -1; ctx.lineTo(x + w * 0.65, y + h); ctx.bezierCurveTo(x + w * 0.65, y + h + s3 * tab, x + w * 0.35, y + h + s3 * tab, x + w * 0.35, y + h); ctx.lineTo(x, y + h); }
      if(col === 0) { ctx.lineTo(x, y); } else { var s4 = (col - 1 + row) % 2 === 0 ? 1 : -1; ctx.lineTo(x, y + h * 0.65); ctx.bezierCurveTo(x + s4 * tab, y + h * 0.65, x + s4 * tab, y + h * 0.35, x, y + h * 0.35); ctx.lineTo(x, y); }
    },

    bindTouch: function() {
      function getP(e) { var r = Jigsaw.canvas.getBoundingClientRect(); var t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; }
      function hit(mx, my) { for(var i = Jigsaw.pieces.length - 1; i >= 0; i--){ var p = Jigsaw.pieces[i]; if(p.placed) continue; if(mx >= p.x && mx <= p.x + Jigsaw.pieceW && my >= p.y && my <= p.y + Jigsaw.pieceH) return p; } return null; }

      var cb = function(e){ if(!Jigsaw.playing) return; e.preventDefault(); var pos = getP(e); var ht = hit(pos.x, pos.y); if(ht) { Jigsaw.dragging = ht; Jigsaw.offsetX = pos.x - ht.x; Jigsaw.offsetY = pos.y - ht.y; var idx = Jigsaw.pieces.indexOf(ht); Jigsaw.pieces.splice(idx, 1); Jigsaw.pieces.push(ht); Jigsaw.draw(); }};
      Jigsaw.canvas.addEventListener('touchstart', cb, {passive: false}); Jigsaw.canvas.addEventListener('mousedown', cb);

      var cm = function(e){ if(!Jigsaw.dragging) return; e.preventDefault(); var pos = getP(e); Jigsaw.dragging.x = pos.x - Jigsaw.offsetX; Jigsaw.dragging.y = pos.y - Jigsaw.offsetY; Jigsaw.draw(); };
      Jigsaw.canvas.addEventListener('touchmove', cm, {passive: false}); document.addEventListener('mousemove', cm);

      var ce = function(e){ 
        if(!Jigsaw.dragging) return; var p = Jigsaw.dragging; Jigsaw.dragging = null; var dx = Math.abs(p.x - p.targetX), dy = Math.abs(p.y - p.targetY);
        // 吸附触发判定与设备系统震波联结！！
        if(dx < Jigsaw.snapDist && dy < Jigsaw.snapDist) { 
           p.x = p.targetX; p.y = p.targetY; p.placed = true; 
           if(navigator.vibrate) navigator.vibrate(20); // 震动回馈！！！ 
        } Jigsaw.draw(); Jigsaw.checkWin();
      };
      Jigsaw.canvas.addEventListener('touchend', ce, {passive: true}); document.addEventListener('mouseup', ce);
    },

    checkWin: function() { for(var i=0; i<Jigsaw.pieces.length; i++){ if(!Jigsaw.pieces[i].placed) return; } Jigsaw.playing = false; setTimeout(function(){ if(Jigsaw.winMsg) Jigsaw.winMsg.classList.add('show'); }, 300); },
    saveGame: function() { if(!Puz.imgSrc) return App.showToast('画像还未赋予画纸！'); var snap = { cols: Jigsaw.cols, playing: Jigsaw.playing, pz: Jigsaw.pieces.map(function(p){ return {x: p.x, y: p.y, pld: p.placed}; }) }; App.LS.set('mmPzJigsawSave', snap); App.showToast('光晕已被永远锁在此间琥珀中'); },
    loadGameOrInit: function() { var snap = App.LS.get('mmPzJigsawSave'); if(!snap || !Puz.imgSrc) { Jigsaw.initDraw(); return; } Jigsaw.cols = snap.cols; Jigsaw.rows = snap.cols; document.querySelector('.pz-select').value = String(snap.cols); Jigsaw.initDraw(function() { Jigsaw.generatePieces(); Jigsaw.playing = snap.playing; for(var i=0; i<Jigsaw.pieces.length; i++) { Jigsaw.pieces[i].x = snap.pz[i].x; Jigsaw.pieces[i].y = snap.pz[i].y; Jigsaw.pieces[i].placed = snap.pz[i].pld; } Jigsaw.draw(); }); },
    delGame: function() { App.LS.remove('mmPzJigsawSave'); Jigsaw.initDraw(); App.showToast('痕迹已消灭于虚无'); }
  };
  App.register('puzzle', Puz);
})();
