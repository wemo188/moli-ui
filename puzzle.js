/* ================================================
   🌟 墨墨限定版大满贯 · 云存档解密拼图 (puzzle.js)
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
      panel.innerHTML = '<div class="bf-nav"><button class="bf-back" id="pzBack" type="button"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3.5"/><path d="M36 20L24 32L36 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="bf-nav-title">心算推演</span><div class="bf-nav-right"></div></div><div class="bf-scroll-body"><div id="pzGameContent"></div></div>';
      document.body.appendChild(panel);
      requestAnimationFrame(function(){ panel.classList.add('show'); });
      if(App.bindSwipeBack) App.bindSwipeBack(panel, function(){ panel.remove(); });
      panel.querySelector('#pzBack').addEventListener('click', function(){
        panel.classList.remove('show'); panel.classList.add('hidden'); setTimeout(function(){ panel.remove(); }, 350);
      });
      Puz.showModeSelect(panel.querySelector('#pzGameContent'));
    },

    showModeSelect: function(container) {
      container.innerHTML = '<div class="pz-wrap"><div class="pz-mode-select">' +
        '<div class="pz-mode-card" id="pzModeSlide"><div class="pz-mode-icon"><svg viewBox="0 0 64 64" fill="none"><rect x="12" y="12" width="18" height="18" rx="2" stroke="#9ca3b0" stroke-width="2.5"/><rect x="34" y="12" width="18" height="18" rx="2" stroke="#9ca3b0" stroke-width="2.5"/><rect x="12" y="34" width="18" height="18" rx="2" stroke="#9ca3b0" stroke-width="2.5"/><path d="M38 38L48 48M48 38L38 48" stroke="#9ca3b0" stroke-width="2" stroke-linecap="round"/></svg></div><div class="pz-mode-name">华容道</div><div class="pz-mode-desc">逻辑滑块，步数极限</div></div>' +
        '<div class="pz-mode-card" id="pzModeJigsaw"><div class="pz-mode-icon"><svg viewBox="0 0 64 64" fill="none"><path d="M12 28V12h16v4a4 4 0 108 0v-4h16v16h-4a4 4 0 100 8h4v16H36v-4a4 4 0 10-8 0v4H12V36h4a4 4 0 100-8h-4z" stroke="#9ca3b0" stroke-width="2.5" stroke-linejoin="round"/></svg></div><div class="pz-mode-name">骨董拼图</div><div class="pz-mode-desc">散件组合，咬合记忆</div></div>' +
      '</div></div>';
      container.querySelector('#pzModeSlide').addEventListener('click', function(){ Slide.buildInto(container); });
      container.querySelector('#pzModeJigsaw').addEventListener('click', function(){ Jigsaw.buildInto(container); });
    },

    pickImage: function(callback) {
      if(!App.showImagePicker) { App.showToast('未能挂载系统图库组件'); return; }
      App.showImagePicker({ title: '上载主视轴记忆碎片', callback: function(src) {
          if(src) { Puz.imgSrc = src; App.LS.set('pzCustomImg', src); if(callback) callback(); }
      }});
    }
  };

  /* ============================
     滑动推算版 (华容道)
  ============================ */
  var Slide = {
    core: null, winMsg: null, emptyState: null,
    size: 4, coreSize: 0, tileSize: 0, tiles: [], emptyPos: {x:0, y:0}, playing: false, steps: 0, stepsText: null,

    buildInto: function(container) {
      container.innerHTML = '';
      var wrap = document.createElement('div'); wrap.className = 'pz-wrap';
      var toolbar = document.createElement('div'); toolbar.className = 'pz-toolbar';

      var backBtn = document.createElement('div'); backBtn.className = 'pz-btn'; backBtn.textContent = '返回'; backBtn.onclick = function(){ Puz.showModeSelect(container); };
      var uploadBtn = document.createElement('div'); uploadBtn.className = 'pz-btn'; uploadBtn.textContent = '更换图片'; uploadBtn.onclick = function(){ Puz.pickImage(function(){ Slide.resetAndBuild(); }); };
      
      // 添加6x6绝顶难度！
      var sizeSelect = document.createElement('select'); sizeSelect.className = 'pz-select';
      sizeSelect.innerHTML = '<option value="3">3x3</option><option value="4">4x4</option><option value="5">5x5</option><option value="6">6x6</option>';
      sizeSelect.value = String(Slide.size);
      sizeSelect.onchange = function(){ Slide.size = parseInt(this.value); Slide.resetAndBuild(); };

      var startBtn = document.createElement('div'); startBtn.className = 'pz-btn primary'; startBtn.textContent = '打乱出阵'; startBtn.onclick = function(){ Slide.shuffle(); };
      
      toolbar.appendChild(backBtn); toolbar.appendChild(uploadBtn); toolbar.appendChild(sizeSelect); toolbar.appendChild(startBtn);

      var board = document.createElement('div'); board.className = 'pz-board';
      var core = document.createElement('div'); core.className = 'pz-core'; Slide.core = core;

      var winMsg = document.createElement('div'); winMsg.className = 'pz-win'; winMsg.innerHTML = '<h3>记忆缝合</h3><span>惊叹算力，恭喜你解局</span>'; Slide.winMsg = winMsg;
      var emptyState = document.createElement('div'); emptyState.className = 'pz-empty'; emptyState.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>上载原画图轴，始生结阵</span>'; Slide.emptyState = emptyState;

      core.appendChild(emptyState); core.appendChild(winMsg); board.appendChild(core);

      // 下半部数据台：重置、存档、读档操作全包
      var stepsDiv = document.createElement('div'); stepsDiv.className = 'pz-footer-stats'; stepsDiv.textContent = '移动步数: 0'; Slide.stepsText = stepsDiv;
      var actionRow = document.createElement('div'); actionRow.className = 'pz-footer-actions';
      
      var resBtn = document.createElement('div'); resBtn.className='pz-btn'; resBtn.textContent='回归重置'; resBtn.onclick=function(){ Slide.resetAndBuild(); };
      var saveBtn = document.createElement('div'); saveBtn.className='pz-btn primary'; saveBtn.textContent='储存命格'; saveBtn.onclick=function(){ Slide.saveGame(); };
      var delBtn = document.createElement('div'); delBtn.className='pz-btn danger'; delBtn.textContent='碎弃遗留'; delBtn.onclick=function(){ Slide.delGame(); };
      
      actionRow.appendChild(resBtn); actionRow.appendChild(saveBtn); actionRow.appendChild(delBtn);

      wrap.appendChild(toolbar); wrap.appendChild(board); wrap.appendChild(stepsDiv); wrap.appendChild(actionRow);
      container.appendChild(wrap);

      // 利用读取逻辑起步（如果有本地存档自动读，否则重新创建）
      Slide.loadGame();
    },

    updateSteps: function(val) { Slide.steps = val; Slide.stepsText.textContent = '移动步数: ' + val; },

    resetAndBuild: function() {
      Slide.playing = false; Slide.updateSteps(0);
      if(Slide.winMsg) Slide.winMsg.classList.remove('show');
      var oldTiles = Slide.core.querySelectorAll('.pz-tile'); oldTiles.forEach(function(el){ el.remove(); });

      if(!Puz.imgSrc) { if(Slide.emptyState) Slide.emptyState.style.display = 'flex'; return; }
      if(Slide.emptyState) Slide.emptyState.style.display = 'none';

      Slide.coreSize = Slide.core.clientWidth; // 读取绝美真·放大自适应数据
      Slide.tileSize = Slide.coreSize / Slide.size; Slide.tiles = [];
      var total = Slide.size * Slide.size; Slide.emptyPos = { x: Slide.size - 1, y: Slide.size - 1 };

      for(var i=0; i<total-1; i++){
        var t = document.createElement('div'); t.className = 'pz-tile';
        var tx = i % Slide.size, ty = Math.floor(i / Slide.size);
        t.style.width = Slide.tileSize + 'px'; t.style.height = Slide.tileSize + 'px';
        t.style.backgroundImage = 'url(' + Puz.imgSrc + ')'; t.style.backgroundSize = Slide.coreSize + 'px ' + Slide.coreSize + 'px';
        t.style.backgroundPosition = '-' + (tx*Slide.tileSize) + 'px -' + (ty*Slide.tileSize) + 'px';
        t.style.transform = 'translate(' + (tx*Slide.tileSize) + 'px, ' + (ty*Slide.tileSize) + 'px)';
        t.dataset.idx = i;
        
        Slide.tiles.push({ el: t, targetX: tx, targetY: ty, x: tx, y: ty }); Slide.core.appendChild(t);
        
        // 防抖手机精准触控，绝不死按滑不掉！
        (function(idx, el){
          var sx=0, sy=0;
          el.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive:true});
          el.addEventListener('touchend', function(e){
            var dx = Math.abs(e.changedTouches[0].clientX - sx), dy = Math.abs(e.changedTouches[0].clientY - sy);
            if(dx < 20 && dy < 20) Slide.moveTile(idx);
          }, {passive:true});
        })(i, t);
      }
    },

    moveTile: function(idx) {
      if(!Slide.playing) return;
      var t = Slide.tiles[idx];
      var dx = Math.abs(t.x - Slide.emptyPos.x), dy = Math.abs(t.y - Slide.emptyPos.y);
      if((dx===1 && dy===0) || (dx===0 && dy===1)) {
        var tempX = t.x, tempY = t.y; t.x = Slide.emptyPos.x; t.y = Slide.emptyPos.y; Slide.emptyPos.x = tempX; Slide.emptyPos.y = tempY;
        t.el.style.transform = 'translate(' + (t.x*Slide.tileSize) + 'px, ' + (t.y*Slide.tileSize) + 'px)';
        Slide.updateSteps(Slide.steps + 1); Slide.checkWin();
      }
    },

    shuffle: function() {
      if(!Puz.imgSrc) { App.showToast('需要赋神画影后方可打断阵法'); return; }
      Slide.resetAndBuild(); Slide.playing = true; Slide.updateSteps(0);
      var steps = Slide.size * Slide.size * 5; 
      for(var i=0; i<steps; i++){
        var movable = [];
        for(var j=0; j<Slide.tiles.length; j++){
          var t = Slide.tiles[j]; var dx = Math.abs(t.x - Slide.emptyPos.x), dy = Math.abs(t.y - Slide.emptyPos.y);
          if((dx===1 && dy===0) || (dx===0 && dy===1)) movable.push(t);
        }
        var pick = movable[Math.floor(Math.random()*movable.length)];
        var tx = pick.x, ty = pick.y; pick.x = Slide.emptyPos.x; pick.y = Slide.emptyPos.y; Slide.emptyPos.x = tx; Slide.emptyPos.y = ty;
      }
      for(var k=0; k<Slide.tiles.length; k++){
        var t2 = Slide.tiles[k]; t2.el.style.transform = 'translate(' + (t2.x*Slide.tileSize) + 'px, ' + (t2.y*Slide.tileSize) + 'px)';
      }
    },

    checkWin: function() {
      for(var i=0; i<Slide.tiles.length; i++) { if(Slide.tiles[i].x !== Slide.tiles[i].targetX || Slide.tiles[i].y !== Slide.tiles[i].targetY) return; }
      Slide.playing = false; setTimeout(function(){ if(Slide.winMsg) Slide.winMsg.classList.add('show'); }, 300);
    },

    saveGame: function() {
      if(!Puz.imgSrc) return App.showToast('暂无画卷，无法归档');
      var snap = { size: Slide.size, steps: Slide.steps, emptyPos: Slide.emptyPos, tiles: Slide.tiles.map(function(t){ return {x: t.x, y: t.y}; }) };
      App.LS.set('mmPzSlideSave', snap); App.showToast('已录下棋局脉络！');
    },

    loadGame: function() {
      var snap = App.LS.get('mmPzSlideSave');
      if(!snap || !Puz.imgSrc) { Slide.resetAndBuild(); return; }
      Slide.size = snap.size; Slide.resetAndBuild();
      document.querySelector('.pz-select').value = String(snap.size); // 更新面板拉杆

      Slide.emptyPos = snap.emptyPos; Slide.updateSteps(snap.steps); Slide.playing = true;
      for(var i=0; i<snap.tiles.length; i++) {
        Slide.tiles[i].x = snap.tiles[i].x; Slide.tiles[i].y = snap.tiles[i].y;
        Slide.tiles[i].el.style.transform = 'translate(' + (Slide.tiles[i].x * Slide.tileSize) + 'px, ' + (Slide.tiles[i].y * Slide.tileSize) + 'px)';
      }
    },
    
    delGame: function() { App.LS.remove('mmPzSlideSave'); Slide.resetAndBuild(); App.showToast('旧历已成灰迹'); }
  };

  /* ============================
     锯齿物理引擎 (骨董拼图) - 超级视网膜画板 (1:1.25上界分离式布局)
  ============================ */
  var Jigsaw = {
    canvas: null, ctx: null, pieces: [], cols: 4, rows: 4, img: null, imgW: 0, imgH: 0, pieceW: 0, pieceH: 0,
    dragging: null, offsetX: 0, offsetY: 0, snapDist: 18, playing: false, canvasCssW: 0, canvasCssH: 0, winMsg: null,

    buildInto: function(container) {
      container.innerHTML = '';
      var wrap = document.createElement('div'); wrap.className = 'pz-wrap';
      var toolbar = document.createElement('div'); toolbar.className = 'pz-toolbar';

      var backBtn = document.createElement('div'); backBtn.className = 'pz-btn'; backBtn.textContent = '返回'; backBtn.onclick = function(){ Puz.showModeSelect(container); };
      var uploadBtn = document.createElement('div'); uploadBtn.className = 'pz-btn'; uploadBtn.textContent = '重画核心'; uploadBtn.onclick = function(){ Puz.pickImage(function(){ Jigsaw.initDraw(); }); };
      var sizeSelect = document.createElement('select'); sizeSelect.className = 'pz-select';
      sizeSelect.innerHTML = '<option value="3">3x3</option><option value="4">4x4</option><option value="5">5x5</option><option value="6">6x6</option>';
      sizeSelect.value = String(Jigsaw.cols);
      sizeSelect.onchange = function(){ var v=parseInt(this.value); Jigsaw.cols=v; Jigsaw.rows=v; Jigsaw.initDraw(); };

      var startBtn = document.createElement('div'); startBtn.className = 'pz-btn primary'; startBtn.textContent = '碎为沙灰'; startBtn.onclick = function(){ Jigsaw.scatter(); };
      toolbar.appendChild(backBtn); toolbar.appendChild(uploadBtn); toolbar.appendChild(sizeSelect); toolbar.appendChild(startBtn);

      var canvasWrap = document.createElement('div'); canvasWrap.className = 'pz-jigsaw-wrap';
      var canvas = document.createElement('canvas'); canvas.className = 'pz-jigsaw-canvas';
      Jigsaw.canvas = canvas; Jigsaw.ctx = canvas.getContext('2d');

      var winMsg = document.createElement('div'); winMsg.className = 'pz-win'; winMsg.innerHTML = '<h3>记忆拼接</h3><span>齿印完美复位，通关 ✨</span>'; Jigsaw.winMsg = winMsg;
      var emptyState = document.createElement('div'); emptyState.className = 'pz-empty'; emptyState.id = 'pzJigsawEmpty'; emptyState.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>上载命核图形结缘</span>';

      canvasWrap.appendChild(canvas); canvasWrap.appendChild(winMsg); canvasWrap.appendChild(emptyState);

      // 下置操作面板存档层
      var actionRow = document.createElement('div'); actionRow.className = 'pz-footer-actions'; actionRow.style.marginTop = "20px";
      var saveBtn = document.createElement('div'); saveBtn.className='pz-btn primary'; saveBtn.textContent='落入琥珀存档'; saveBtn.onclick=function(){ Jigsaw.saveGame(); };
      var delBtn = document.createElement('div'); delBtn.className='pz-btn danger'; delBtn.textContent='彻底扫灰删档'; delBtn.onclick=function(){ Jigsaw.delGame(); };
      actionRow.appendChild(saveBtn); actionRow.appendChild(delBtn);

      wrap.appendChild(toolbar); wrap.appendChild(canvasWrap); wrap.appendChild(actionRow); container.appendChild(wrap);

      Jigsaw.bindTouch(); Jigsaw.loadGameOrInit(); // 入口检查是否有琥珀印记！
    },

    initDraw: function(loadCallback) {
      if(Jigsaw.winMsg) Jigsaw.winMsg.classList.remove('show');
      var empty = document.getElementById('pzJigsawEmpty');
      if(!Puz.imgSrc) { if(empty) empty.style.display = 'flex'; return; }
      if(empty) empty.style.display = 'none';

      // 绝世高清计算架构法（完美视网膜DPI支持，彻底剥除低像素感！）
      var wrapperW = document.querySelector('.pz-jigsaw-wrap').clientWidth; 
      var cssW = wrapperW - 12; // 除去内部的留缝
      var cssH = cssW * 1.25;   // 【上板正方区 80%，下方碎片库 20%的精密神算法！】
      Jigsaw.canvasCssW = cssW; Jigsaw.canvasCssH = cssH;

      var dpr = window.devicePixelRatio || 1;
      Jigsaw.canvas.style.width = cssW + 'px'; Jigsaw.canvas.style.height = cssH + 'px';
      Jigsaw.canvas.width = cssW * dpr; Jigsaw.canvas.height = cssH * dpr;
      Jigsaw.ctx.scale(dpr, dpr);

      var img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = function() {
        Jigsaw.img = img;
        Jigsaw.imgW = cssW; Jigsaw.imgH = cssW; // 图永远占据顶部等身大正方形的80%！
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
      if(!Puz.imgSrc) return App.showToast('画像缺失，难以落笔生辉');
      Jigsaw.playing = true; if(Jigsaw.winMsg) Jigsaw.winMsg.classList.remove('show');
      
      // 所有粉身碎骨自动集中倾泄落在下半20%的空间收纳池里
      var boxTopY = Jigsaw.imgH; 
      var trayH = Jigsaw.canvasCssH - Jigsaw.imgH;

      for(var i = 0; i < Jigsaw.pieces.length; i++){
        var p = Jigsaw.pieces[i];
        p.x = Math.random() * (Jigsaw.canvasCssW - Jigsaw.pieceW);
        p.y = boxTopY + Math.random() * (trayH - Jigsaw.pieceH); // 只坠落在底层留白的垃圾盘内！
        p.placed = false;
      }
      Jigsaw.draw();
    },

    draw: function() {
      var ctx = Jigsaw.ctx; ctx.clearRect(0, 0, Jigsaw.canvasCssW, Jigsaw.canvasCssH);
      
      // 先刻绘背景主体的拼图留位指引淡图痕迹
      if(Jigsaw.img && Jigsaw.playing) {
        ctx.globalAlpha = 0.15; ctx.drawImage(Jigsaw.img, 0, 0, Jigsaw.imgW, Jigsaw.imgH); ctx.globalAlpha = 1;
      }

      // 底部分界暗纹分隔界线
      ctx.beginPath(); ctx.moveTo(0, Jigsaw.imgH); ctx.lineTo(Jigsaw.canvasCssW, Jigsaw.imgH); 
      ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 2; ctx.stroke();

      for(var i = 0; i < Jigsaw.pieces.length; i++){
        var p = Jigsaw.pieces[i]; if(p === Jigsaw.dragging) continue;
        Jigsaw.drawPiece(p);
      }
      if(Jigsaw.dragging) Jigsaw.drawPiece(Jigsaw.dragging); // 手中的悬挂件永远处在云上之层！
    },

    drawPiece: function(p) {
      var ctx = Jigsaw.ctx; var pw = Jigsaw.pieceW, ph = Jigsaw.pieceH; var tab = pw * 0.18; 
      
      ctx.save(); ctx.beginPath();
      Jigsaw.drawPiecePath(ctx, p.x, p.y, pw, ph, p.col, p.row, tab); ctx.closePath();
      ctx.clip(); 
      // 灵魂平移抵消法，图像边缘自覆盖
      ctx.drawImage(Jigsaw.img, p.x - p.targetX, p.y - p.targetY, Jigsaw.imgW, Jigsaw.imgH); 
      ctx.restore();

      ctx.save(); ctx.beginPath(); Jigsaw.drawPiecePath(ctx, p.x, p.y, pw, ph, p.col, p.row, tab); ctx.closePath();
      // 这里换成了你命令要求的极细的黑边风格了！已安上的齿呈现虚弱消解！
      ctx.strokeStyle = p.placed ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.6)';
      ctx.lineWidth = p.placed ? 0 : 0.8;
      ctx.stroke(); ctx.restore();
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

      var ce = function(e){ if(!Jigsaw.dragging) return; var p = Jigsaw.dragging; Jigsaw.dragging = null; var dx = Math.abs(p.x - p.targetX), dy = Math.abs(p.y - p.targetY);
        if(dx < Jigsaw.snapDist && dy < Jigsaw.snapDist) { p.x = p.targetX; p.y = p.targetY; p.placed = true; } Jigsaw.draw(); Jigsaw.checkWin();
      };
      Jigsaw.canvas.addEventListener('touchend', ce, {passive: true}); document.addEventListener('mouseup', ce);
    },

    checkWin: function() {
      for(var i=0; i<Jigsaw.pieces.length; i++){ if(!Jigsaw.pieces[i].placed) return; }
      Jigsaw.playing = false; setTimeout(function(){ if(Jigsaw.winMsg) Jigsaw.winMsg.classList.add('show'); }, 300);
    },
    
    // 【全局琥珀云端技术存储阵列】
    saveGame: function() {
      if(!Puz.imgSrc) return App.showToast('无神可镇图');
      var snap = { cols: Jigsaw.cols, playing: Jigsaw.playing, pz: Jigsaw.pieces.map(function(p){ return {x: p.x, y: p.y, pld: p.placed}; }) };
      App.LS.set('mmPzJigsawSave', snap); App.showToast('图阵档案刻写圆满');
    },

    loadGameOrInit: function() {
      var snap = App.LS.get('mmPzJigsawSave');
      if(!snap || !Puz.imgSrc) { Jigsaw.initDraw(); return; }
      
      Jigsaw.cols = snap.cols; Jigsaw.rows = snap.cols; document.querySelector('.pz-select').value = String(snap.cols);
      
      Jigsaw.initDraw(function() {
         Jigsaw.generatePieces(); Jigsaw.playing = snap.playing;
         for(var i=0; i<Jigsaw.pieces.length; i++) { Jigsaw.pieces[i].x = snap.pz[i].x; Jigsaw.pieces[i].y = snap.pz[i].y; Jigsaw.pieces[i].placed = snap.pz[i].pld; }
         Jigsaw.draw();
      });
    },

    delGame: function() { App.LS.remove('mmPzJigsawSave'); Jigsaw.initDraw(); App.showToast('痕迹已消灭于虚无'); }
  };

  App.register('puzzle', Puz);

})();