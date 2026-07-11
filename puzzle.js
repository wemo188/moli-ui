/* ================================================
   🌟 墨墨至尊定制 · 高定双模式游戏版 (puzzle.js)
   ================================================ */
(function(){
  'use strict';
  var App = window.App; if(!App) return;

  var Puz = {
    imgSrc: App.LS.get('pzCustomImg') || '',

    init: function() {
      App.safeOn('#iconPuzzle', 'click', function(){ Puz.openGame(); });
    },

    openGame: function() {
      var old = document.getElementById('pzGamePanel');
      if(old) { old.remove(); return; }

      var panel = document.createElement('div');
      panel.id = 'pzGamePanel'; panel.className = 'bf-sub-panel';
      panel.innerHTML = 
        '<div class="bf-nav">' +
          '<button class="bf-back" id="pzBack" type="button"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3.5" fill="none"/><path d="M36 20L24 32L36 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<span class="bf-nav-title">娱乐拼图</span>' +
          '<div class="bf-nav-right"></div>' +
        '</div>' +
        '<div class="bf-scroll-body"><div id="pzGameContent"></div></div>';

      document.body.appendChild(panel);
      requestAnimationFrame(function(){ panel.classList.add('show'); });
      if(App.bindSwipeBack) App.bindSwipeBack(panel, function(){ panel.remove(); });
      panel.querySelector('#pzBack').addEventListener('click', function(){
        panel.classList.remove('show'); panel.classList.add('hidden');
        setTimeout(function(){ panel.remove(); }, 350);
      });

      Puz.showModeSelect(panel.querySelector('#pzGameContent'));
    },

    showModeSelect: function(container) {
      container.innerHTML = 
        '<div class="pz-wrap">' +
          '<div class="pz-mode-select">' +
            '<div class="pz-mode-card" id="pzModeSlide">' +
              '<div class="pz-mode-icon"><svg viewBox="0 0 64 64" fill="none"><rect x="12" y="12" width="18" height="18" rx="2" stroke="#9ca3b0" stroke-width="2.5"/><rect x="34" y="12" width="18" height="18" rx="2" stroke="#9ca3b0" stroke-width="2.5"/><rect x="12" y="34" width="18" height="18" rx="2" stroke="#9ca3b0" stroke-width="2.5"/><path d="M38 38L48 48M48 38L38 48" stroke="#9ca3b0" stroke-width="2" stroke-linecap="round"/></svg></div>' +
              '<div class="pz-mode-name">数字滑盘</div>' +
              '<div class="pz-mode-desc">滑块烧脑, 精准还原</div>' +
            '</div>' +
            '<div class="pz-mode-card" id="pzModeJigsaw">' +
              '<div class="pz-mode-icon"><svg viewBox="0 0 64 64" fill="none"><path d="M12 28V12h16v4a4 4 0 108 0v-4h16v16h-4a4 4 0 100 8h4v16H36v-4a4 4 0 10-8 0v4H12V36h4a4 4 0 100-8h-4z" stroke="#9ca3b0" stroke-width="2.5" stroke-linejoin="round"/></svg></div>' +
              '<div class="pz-mode-name">经典拼图</div>' +
              '<div class="pz-mode-desc">底框盛放, 物理镶嵌</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      container.querySelector('#pzModeSlide').addEventListener('click', function(){ Slide.buildInto(container); });
      container.querySelector('#pzModeJigsaw').addEventListener('click', function(){ Jigsaw.buildInto(container); });
    },

    pickImage: function(callback) {
      if(App.showImagePicker) {
        App.showImagePicker({
          title: '赋予灵魂印记',
          callback: function(src) {
            if(src) { Puz.imgSrc = src; App.LS.set('pzCustomImg', src); if(callback) callback(); }
          }
        });
      }
    }
  };

  /* ============================
     【玩法 1】 - 高级计步器+存储 华容道 
  ============================ */
  var Slide = {
    core: null, winMsg: null, emptyState: null, stepEl: null,
    size: 3, tileSize: 0, tiles: [],
    emptyPos: {x:0, y:0}, playing: false, steps: 0,

    buildInto: function(container) {
      container.innerHTML = '';
      var wrap = document.createElement('div'); wrap.className = 'pz-wrap';

      // 完美的按钮上下分离排布控制！不再挤屏！
      var toolsCol = document.createElement('div'); toolsCol.className = 'pz-tools-col';
      var row1 = document.createElement('div'); row1.className = 'pz-tools-row';
      var row2 = document.createElement('div'); row2.className = 'pz-tools-row';
      var statRow = document.createElement('div'); statRow.className = 'pz-stat-text'; statRow.id = 'pzSlideSteps';

      var backBtn = document.createElement('div'); backBtn.className = 'pz-btn'; backBtn.textContent = '返回';
      backBtn.onclick = function(){ Puz.showModeSelect(container); };

      var uploadBtn = document.createElement('div'); uploadBtn.className = 'pz-btn'; uploadBtn.textContent = '选图';
      uploadBtn.onclick = function(){ Puz.pickImage(function(){ Slide.hardReset(); }); };

      var sizeSelect = document.createElement('select'); sizeSelect.className = 'pz-select';
      sizeSelect.innerHTML = '<option value="3">3x3 休闲</option><option value="4">4x4 大脑</option><option value="5">5x5 深海</option><option value="6">6x6 深渊</option>';
      sizeSelect.value = String(Slide.size);
      sizeSelect.onchange = function(){ Slide.size = parseInt(this.value); Slide.hardReset(); };

      var startBtn = document.createElement('div'); startBtn.className = 'pz-btn primary'; startBtn.textContent = '打乱发牌';
      startBtn.onclick = function(){ Slide.shuffle(); };

      var resetBtn = document.createElement('div'); resetBtn.className = 'pz-btn'; resetBtn.textContent = '复原画面';
      resetBtn.onclick = function(){ Slide.hardReset(); };

      var saveBtn = document.createElement('div'); saveBtn.className = 'pz-btn'; saveBtn.textContent = '存进度';
      saveBtn.onclick = function(){ Slide.saveProgress(); };

      var delBtn = document.createElement('div'); delBtn.className = 'pz-btn danger'; delBtn.textContent = '清空重来';
      delBtn.onclick = function(){ Slide.deleteSave(); };

      row1.appendChild(backBtn); row1.appendChild(uploadBtn); row1.appendChild(sizeSelect);
      row2.appendChild(startBtn); row2.appendChild(resetBtn); row2.appendChild(saveBtn); row2.appendChild(delBtn);
      toolsCol.appendChild(row1); toolsCol.appendChild(row2); toolsCol.appendChild(statRow);

      var board = document.createElement('div'); board.className = 'pz-board';
      var core = document.createElement('div'); core.className = 'pz-core';
      Slide.core = core;

      var winMsg = document.createElement('div'); winMsg.className = 'pz-win';
      winMsg.innerHTML = '<h3>推盘解密完成</h3><span>华彩重现，智商惊人 ✨</span>'; Slide.winMsg = winMsg;

      var emptyState = document.createElement('div'); emptyState.className = 'pz-empty';
      emptyState.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>等待载入图景</span>';
      Slide.emptyState = emptyState;

      core.appendChild(emptyState); core.appendChild(winMsg); board.appendChild(core);
      wrap.appendChild(toolsCol); wrap.appendChild(board); container.appendChild(wrap);
      
      Slide.stepEl = document.getElementById('pzSlideSteps');

      Slide.tryLoadOrReset();
    },

    updateStepsUI: function() {
      if(Slide.stepEl) Slide.stepEl.textContent = '移动步数 :  ' + Slide.steps;
    },

    saveProgress: function() {
      if(!Slide.playing) { App.showToast('没在打乱的挑战里怎么存档？'); return; }
      var saveObj = {
        imgSrc: Puz.imgSrc, size: Slide.size, steps: Slide.steps, emptyPos: Slide.emptyPos,
        tiles: Slide.tiles.map(function(t){ return {x:t.x, y:t.y, targetX:t.targetX, targetY:t.targetY, idx:t.el.dataset.idx}; })
      };
      App.LS.set('pzSlideSave', saveObj);
      App.showToast('挑战记忆已安全封存');
    },

    deleteSave: function() {
      App.LS.remove('pzSlideSave');
      App.showToast('所有记忆碎渣被清理，画卷重启');
      Slide.hardReset();
    },

    tryLoadOrReset: function() {
      var saved = App.LS.get('pzSlideSave');
      if(saved && saved.imgSrc === Puz.imgSrc && saved.size === Slide.size) {
        Slide.steps = saved.steps || 0; Slide.emptyPos = saved.emptyPos;
        Slide.renderDOM(saved.tiles);
        Slide.playing = true;
        App.showToast('已从旧时碎片缝合残局');
      } else {
        Slide.hardReset();
      }
    },

    hardReset: function() {
      Slide.playing = false; Slide.steps = 0; Slide.updateStepsUI();
      if(Slide.winMsg) Slide.winMsg.classList.remove('show');
      var dummyBase = [];
      for(var i = 0; i < (Slide.size * Slide.size) - 1; i++) {
        dummyBase.push({ x: i%Slide.size, y: Math.floor(i/Slide.size), targetX: i%Slide.size, targetY: Math.floor(i/Slide.size), idx: i });
      }
      Slide.emptyPos = { x: Slide.size - 1, y: Slide.size - 1 };
      Slide.renderDOM(dummyBase);
    },

    renderDOM: function(tileDataArr) {
      var oldTiles = Slide.core.querySelectorAll('.pz-tile');
      oldTiles.forEach(function(el){ el.remove(); });
      Slide.tiles = []; Slide.updateStepsUI();

      if(!Puz.imgSrc) { if(Slide.emptyState) Slide.emptyState.style.display = 'flex'; return; }
      if(Slide.emptyState) Slide.emptyState.style.display = 'none';

      var coreSize = 280; Slide.tileSize = coreSize / Slide.size;

      for(var i = 0; i < tileDataArr.length; i++){
        var d = tileDataArr[i];
        var t = document.createElement('div'); t.className = 'pz-tile';
        
        t.style.width = Slide.tileSize + 'px'; t.style.height = Slide.tileSize + 'px';
        t.style.backgroundImage = 'url(' + Puz.imgSrc + ')';
        t.style.backgroundSize = coreSize + 'px ' + coreSize + 'px';
        t.style.backgroundPosition = '-' + (d.targetX * Slide.tileSize) + 'px -' + (d.targetY * Slide.tileSize) + 'px';
        t.dataset.idx = d.idx;
        t.style.transform = 'translate(' + (d.x * Slide.tileSize) + 'px, ' + (d.y * Slide.tileSize) + 'px)';

        Slide.tiles.push({ el: t, targetX: d.targetX, targetY: d.targetY, x: d.x, y: d.y });
        Slide.core.appendChild(t);

        // 防止触控拉黑的丝滑触底监听法！
        (function(idx, el){
          var sx=0, sy=0;
          el.addEventListener('touchstart', function(e){ var tch = e.touches[0]; sx = tch.clientX; sy = tch.clientY; }, {passive:true});
          el.addEventListener('touchend', function(e){
            var tch = e.changedTouches[0];
            var dx = Math.abs(tch.clientX - sx); var dy = Math.abs(tch.clientY - sy);
            if(dx < 15 && dy < 15) Slide.moveTile(idx);
          }, {passive:true});
        })(i, t);
      }
    },

    moveTile: function(idx) {
      if(!Slide.playing) return;
      var t = Slide.tiles[idx];
      var dx = Math.abs(t.x - Slide.emptyPos.x); var dy = Math.abs(t.y - Slide.emptyPos.y);

      if((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        var tempX = t.x, tempY = t.y; t.x = Slide.emptyPos.x; t.y = Slide.emptyPos.y; Slide.emptyPos.x = tempX; Slide.emptyPos.y = tempY;
        t.el.style.transform = 'translate(' + (t.x * Slide.tileSize) + 'px, ' + (t.y * Slide.tileSize) + 'px)';
        Slide.steps++; Slide.updateStepsUI(); Slide.checkWin();
      }
    },

    shuffle: function() {
      if(!Puz.imgSrc) { App.showToast('不传图我拿什么碎片洗？'); return; }
      Slide.playing = true; Slide.steps = 0; Slide.updateStepsUI();
      if(Slide.winMsg) Slide.winMsg.classList.remove('show');

      // 防止过大地图引发过激复原，做了分档算法步数设定，杜绝死锁卡顿。
      var stepsAmount = (Slide.size * Slide.size) * (Slide.size === 6 ? 4 : 8); 
      for(var i=0; i<stepsAmount; i++){
        var movable = [];
        for(var j=0; j<Slide.tiles.length; j++){
          var t = Slide.tiles[j];
          var dx = Math.abs(t.x - Slide.emptyPos.x); var dy = Math.abs(t.y - Slide.emptyPos.y);
          if((dx===1 && dy===0) || (dx===0 && dy===1)) movable.push(t);
        }
        var pick = movable[Math.floor(Math.random()*movable.length)];
        var tx = pick.x, ty = pick.y;
        pick.x = Slide.emptyPos.x; pick.y = Slide.emptyPos.y; Slide.emptyPos.x = tx; Slide.emptyPos.y = ty;
      }
      for(var k=0; k<Slide.tiles.length; k++){
        var t2 = Slide.tiles[k];
        t2.el.style.transform = 'translate(' + (t2.x * Slide.tileSize) + 'px, ' + (t2.y * Slide.tileSize) + 'px)';
      }
    },

    checkWin: function() {
      for(var i=0; i<Slide.tiles.length; i++){
        var t = Slide.tiles[i];
        if(t.x !== t.targetX || t.y !== t.targetY) return;
      }
      Slide.playing = false; setTimeout(function(){ if(Slide.winMsg) Slide.winMsg.classList.add('show'); }, 300);
    }
  };

  /* ============================
     【玩法 2】 - 锯齿大拼图：上方80%工作台 / 下方20%收集池
  ============================ */
  var Jigsaw = {
    canvas: null, ctx: null, pieces: [], cols: 4, rows: 4,
    img: null, imgW: 0, imgH: 0, trayH: 0, pieceW: 0, pieceH: 0,
    dragging: null, offsetX: 0, offsetY: 0, snapDist: 22, playing: false,
    winMsg: null,

    buildInto: function(container) {
      container.innerHTML = '';
      var wrap = document.createElement('div'); wrap.className = 'pz-wrap';

      // ======== 万能工具栏重构排雷法 ========
      var toolsCol = document.createElement('div'); toolsCol.className = 'pz-tools-col';
      var row1 = document.createElement('div'); row1.className = 'pz-tools-row';
      var row2 = document.createElement('div'); row2.className = 'pz-tools-row';

      var backBtn = document.createElement('div'); backBtn.className = 'pz-btn'; backBtn.textContent = '返回';
      backBtn.onclick = function(){ Puz.showModeSelect(container); };

      var uploadBtn = document.createElement('div'); uploadBtn.className = 'pz-btn'; uploadBtn.textContent = '挑图';
      uploadBtn.onclick = function(){ Puz.pickImage(function(){ Jigsaw.tryLoadOrHardStart(); }); };

      var sizeSelect = document.createElement('select'); sizeSelect.className = 'pz-select';
      sizeSelect.innerHTML = '<option value="3">3x3</option><option value="4">4x4</option><option value="5">5x5</option>';
      sizeSelect.value = String(Jigsaw.cols);
      sizeSelect.onchange = function(){ var v = parseInt(this.value); Jigsaw.cols=v; Jigsaw.rows=v; Jigsaw.tryLoadOrHardStart(); };

      var startBtn = document.createElement('div'); startBtn.className = 'pz-btn primary'; startBtn.textContent = '将碎片挥洒在底部';
      startBtn.onclick = function(){ Jigsaw.scatter(); };

      var saveBtn = document.createElement('div'); saveBtn.className = 'pz-btn'; saveBtn.textContent = '盖印';
      saveBtn.onclick = function(){ Jigsaw.saveProgress(); };

      var delBtn = document.createElement('div'); delBtn.className = 'pz-btn danger'; delBtn.textContent = '洗底';
      delBtn.onclick = function(){ Jigsaw.deleteSave(); };

      row1.appendChild(backBtn); row1.appendChild(uploadBtn); row1.appendChild(sizeSelect);
      row2.appendChild(startBtn); row2.appendChild(saveBtn); row2.appendChild(delBtn);
      toolsCol.appendChild(row1); toolsCol.appendChild(row2);

      // ======== 新一代切割舞台，含天地两隔双排布 ========
      var board = document.createElement('div'); board.className = 'pz-board';

      var canvas = document.createElement('canvas'); canvas.className = 'pz-jigsaw-canvas';
      Jigsaw.canvas = canvas; Jigsaw.ctx = canvas.getContext('2d');

      var winMsg = document.createElement('div'); winMsg.className = 'pz-win';
      winMsg.innerHTML = '<h3>记忆重铸成功</h3><span>你就是这个残图的神明 ✨</span>'; Jigsaw.winMsg = winMsg;

      var emptyState = document.createElement('div'); emptyState.className = 'pz-empty'; emptyState.id = 'pzJigsawEmpty';
      emptyState.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>等待导入原图景像</span>';

      board.appendChild(canvas); board.appendChild(winMsg); board.appendChild(emptyState);

      wrap.appendChild(toolsCol); wrap.appendChild(board); container.appendChild(wrap);

      Jigsaw.bindTouch();
      Jigsaw.tryLoadOrHardStart();
    },

    saveProgress: function() {
      if(!Jigsaw.playing) { App.showToast('都拼好了/还没打乱存什么档呀大姐'); return; }
      var mapped = Jigsaw.pieces.map(function(p){ return {x:p.x, y:p.y, placed:p.placed}; });
      App.LS.set('pzJigsawSave', { imgSrc: Puz.imgSrc, cols: Jigsaw.cols, rows: Jigsaw.rows, pieces: mapped });
      App.showToast('碎片的凌乱刻痕已为您存留');
    },

    deleteSave: function() {
      App.LS.remove('pzJigsawSave'); App.showToast('这片时空的痕迹彻底抹除');
      Jigsaw.tryLoadOrHardStart(true); 
    },

    tryLoadOrHardStart: function(forceFresh) {
      if(Jigsaw.winMsg) Jigsaw.winMsg.classList.remove('show');
      var empty = document.getElementById('pzJigsawEmpty');

      if(!Puz.imgSrc) { if(empty) empty.style.display = 'flex'; Jigsaw.ctx.clearRect(0,0,Jigsaw.canvas.width,Jigsaw.canvas.height); Jigsaw.pieces=[]; return; }
      if(empty) empty.style.display = 'none';

      var saved = App.LS.get('pzJigsawSave');
      var loadObj = (!forceFresh && saved && saved.imgSrc === Puz.imgSrc && saved.cols === Jigsaw.cols) ? saved.pieces : null;

      var img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = function() {
        Jigsaw.img = img;
        var maxSize = 280;
        var scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        Jigsaw.imgW = Math.round(img.width * scale); Jigsaw.imgH = Math.round(img.height * scale);

        // 全新的：划出一层厚实的大底盘容器供她存放所有的孤立边角废料。
        Jigsaw.trayH = 130; 
        Jigsaw.canvas.width = Jigsaw.imgW;
        Jigsaw.canvas.height = Jigsaw.imgH + Jigsaw.trayH;

        Jigsaw.pieceW = Jigsaw.imgW / Jigsaw.cols; Jigsaw.pieceH = Jigsaw.imgH / Jigsaw.rows;
        
        Jigsaw.generatePieces(loadObj);
        
        if(loadObj) { Jigsaw.playing = true; App.showToast('旧神时空的进度已被剥回'); }
        else Jigsaw.playing = false;

        Jigsaw.draw();
      };
      img.src = Puz.imgSrc;
    },

    generatePieces: function(loadArr) {
      Jigsaw.pieces = [];
      var counter = 0;
      for(var row = 0; row < Jigsaw.rows; row++){
        for(var col = 0; col < Jigsaw.cols; col++){
          var lx = col * Jigsaw.pieceW; var ly = row * Jigsaw.pieceH;
          if(loadArr && loadArr[counter]) {
            Jigsaw.pieces.push({ col: col, row: row, targetX: lx, targetY: ly, x: loadArr[counter].x, y: loadArr[counter].y, placed: loadArr[counter].placed });
          } else {
            Jigsaw.pieces.push({ col: col, row: row, targetX: lx, targetY: ly, x: lx, y: ly, placed: false });
          }
          counter++;
        }
      }
    },

    scatter: function() {
      if(!Puz.imgSrc) { App.showToast('不传图我拿头皮挥洒呢？'); return; }
      Jigsaw.playing = true; if(Jigsaw.winMsg) Jigsaw.winMsg.classList.remove('show');
      var cw = Jigsaw.canvas.width;
      
      // 这次洗牌会把大量的骨肉全部扔到那个暗不见底的收集海底层 (底部 20%) 
      for(var i = 0; i < Jigsaw.pieces.length; i++){
        var p = Jigsaw.pieces[i];
        p.x = Math.random() * (cw - Jigsaw.pieceW);
        p.y = Jigsaw.imgH + Math.random() * (Jigsaw.trayH - Jigsaw.pieceH); // 被强行赶出了画圈界域
        p.placed = false;
      }
      Jigsaw.draw();
    },

    draw: function() {
      var ctx = Jigsaw.ctx;
      ctx.clearRect(0, 0, Jigsaw.canvas.width, Jigsaw.canvas.height);

      // 上方透明隐形向导
      if(Jigsaw.img && Jigsaw.playing) {
        ctx.globalAlpha = 0.10; ctx.drawImage(Jigsaw.img, 0, 0, Jigsaw.imgW, Jigsaw.imgH); ctx.globalAlpha = 1;
      }

      // 给存放槽勾个小边边线，昭告它是收纳下人的身份
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, Jigsaw.imgH, Jigsaw.imgW, Jigsaw.trayH);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, Jigsaw.imgH); ctx.lineTo(Jigsaw.imgW, Jigsaw.imgH); ctx.stroke();

      for(var i=0; i<Jigsaw.pieces.length; i++){
        var p = Jigsaw.pieces[i];
        if(p === Jigsaw.dragging) continue;
        Jigsaw.drawPiece(p);
      }
      if(Jigsaw.dragging) Jigsaw.drawPiece(Jigsaw.dragging);
    },

    drawPiece: function(p) {
      var ctx = Jigsaw.ctx;
      var pw = Jigsaw.pieceW, ph = Jigsaw.pieceH;
      var tab = Math.min(pw, ph) * 0.22; // 调整凹凸的大小不失真

      ctx.save();
      ctx.beginPath();
      Jigsaw.drawPiecePath(ctx, p.x, p.y, pw, ph, p.col, p.row, tab);
      ctx.closePath();
      
      ctx.clip(); 
      // 用了逆天相对论强行抹去残缺漏洞法！
      ctx.drawImage(Jigsaw.img, p.x - p.targetX, p.y - p.targetY, Jigsaw.imgW, Jigsaw.imgH);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      Jigsaw.drawPiecePath(ctx, p.x, p.y, pw, ph, p.col, p.row, tab);
      ctx.closePath();
      
      // 这次切割刃线满足你的要求：黑色，极度瘦削，勾魂一样。如果是已入孔卡口，变成神秘透明。
      ctx.strokeStyle = p.placed ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.5)';
      ctx.lineWidth = p.placed ? 1 : 0.8;
      ctx.stroke();
      ctx.restore();
    },

    drawPiecePath: function(ctx, x, y, w, h, col, row, tab) {
      var cols = Jigsaw.cols, rows = Jigsaw.rows;
      ctx.moveTo(x, y);
      if(row === 0) { ctx.lineTo(x + w, y); } else {
        var sgnY = (col + row - 1) % 2 === 0 ? 1 : -1;
        ctx.lineTo(x + w * 0.35, y); ctx.bezierCurveTo(x + w * 0.35, y + sgnY * tab, x + w * 0.65, y + sgnY * tab, x + w * 0.65, y); ctx.lineTo(x + w, y);
      }
      if(col === cols - 1) { ctx.lineTo(x + w, y + h); } else {
        var sgnX = (col + row) % 2 === 0 ? 1 : -1; 
        ctx.lineTo(x + w, y + h * 0.35); ctx.bezierCurveTo(x + w + sgnX * tab, y + h * 0.35, x + w + sgnX * tab, y + h * 0.65, x + w, y + h * 0.65); ctx.lineTo(x + w, y + h);
      }
      if(row === rows - 1) { ctx.lineTo(x, y + h); } else {
        var sgnY2 = (col + row) % 2 === 0 ? 1 : -1; 
        ctx.lineTo(x + w * 0.65, y + h); ctx.bezierCurveTo(x + w * 0.65, y + h + sgnY2 * tab, x + w * 0.35, y + h + sgnY2 * tab, x + w * 0.35, y + h); ctx.lineTo(x, y + h);
      }
      if(col === 0) { ctx.lineTo(x, y); } else {
        var sgnX2 = (col - 1 + row) % 2 === 0 ? 1 : -1; 
        ctx.lineTo(x, y + h * 0.65); ctx.bezierCurveTo(x + sgnX2 * tab, y + h * 0.65, x + sgnX2 * tab, y + h * 0.35, x, y + h * 0.35); ctx.lineTo(x, y);
      }
    },

    bindTouch: function() {
      var canvas = Jigsaw.canvas;
      function getPos(e) { var rect = canvas.getBoundingClientRect(); var t = e.touches ? e.touches[0] : e; return { x: t.clientX - rect.left, y: t.clientY - rect.top }; }
      function hitTest(mx, my) {
        for(var i = Jigsaw.pieces.length - 1; i >= 0; i--){
          var p = Jigsaw.pieces[i]; if(p.placed) continue;
          if(mx >= p.x && mx <= p.x + Jigsaw.pieceW && my >= p.y && my <= p.y + Jigsaw.pieceH) return p;
        } return null;
      }
      canvas.addEventListener('touchstart', function(e) {
        if(!Jigsaw.playing) return; e.preventDefault(); var pos = getPos(e); var hit = hitTest(pos.x, pos.y);
        if(hit) { Jigsaw.dragging = hit; Jigsaw.offsetX = pos.x - hit.x; Jigsaw.offsetY = pos.y - hit.y; var idx = Jigsaw.pieces.indexOf(hit); Jigsaw.pieces.splice(idx, 1); Jigsaw.pieces.push(hit); Jigsaw.draw(); }
      }, {passive: false});
      canvas.addEventListener('touchmove', function(e) {
        if(!Jigsaw.dragging) return; e.preventDefault(); var pos = getPos(e); Jigsaw.dragging.x = pos.x - Jigsaw.offsetX; Jigsaw.dragging.y = pos.y - Jigsaw.offsetY; Jigsaw.draw();
      }, {passive: false});
      canvas.addEventListener('touchend', function(e) {
        if(!Jigsaw.dragging) return; var p = Jigsaw.dragging; Jigsaw.dragging = null;
        var dx = Math.abs(p.x - p.targetX); var dy = Math.abs(p.y - p.targetY);
        if(dx < Jigsaw.snapDist && dy < Jigsaw.snapDist) { p.x = p.targetX; p.y = p.targetY; p.placed = true; }
        Jigsaw.draw(); Jigsaw.checkWin();
      }, {passive: true});
    },

    checkWin: function() {
      for(var i = 0; i < Jigsaw.pieces.length; i++){ if(!Jigsaw.pieces[i].placed) return; }
      Jigsaw.playing = false; setTimeout(function(){ if(Jigsaw.winMsg) Jigsaw.winMsg.classList.add('show'); }, 300);
    }
  };

  App.register('puzzle', Puz);
})();