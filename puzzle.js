
/* ================================================
   琉璃拼图系统 (puzzle.js) - 双模式：华容道 + 锯齿拼图
   ================================================ */
(function(){
  'use strict';
  var App = window.App; if(!App) return;

  /* ============================
     公共部分
  ============================ */
  var Puz = {
    imgSrc: App.LS.get('pzCustomImg') || '',

    init: function() {
      App.safeOn('#iconPuzzle', 'click', function(){ Puz.openGame(); });
    },

    openGame: function() {
      var old = document.getElementById('pzGamePanel');
      if(old) { old.remove(); return; }

      var panel = document.createElement('div');
      panel.id = 'pzGamePanel';
      panel.className = 'bf-sub-panel';
      panel.innerHTML = 
        '<div class="bf-nav">' +
          '<button class="bf-back" id="pzBack" type="button"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3.5" fill="none"/><path d="M36 20L24 32L36 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<span class="bf-nav-title">拼图</span>' +
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
              '<div class="pz-mode-name">华容道</div>' +
              '<div class="pz-mode-desc">滑动方块，还原图案</div>' +
            '</div>' +
            '<div class="pz-mode-card" id="pzModeJigsaw">' +
              '<div class="pz-mode-icon"><svg viewBox="0 0 64 64" fill="none"><path d="M12 28V12h16v4a4 4 0 108 0v-4h16v16h-4a4 4 0 100 8h4v16H36v-4a4 4 0 10-8 0v4H12V36h4a4 4 0 100-8h-4z" stroke="#9ca3b0" stroke-width="2.5" stroke-linejoin="round"/></svg></div>' +
              '<div class="pz-mode-name">拼图</div>' +
              '<div class="pz-mode-desc">拖拽碎片，拼合记忆</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      container.querySelector('#pzModeSlide').addEventListener('click', function(){
        Slide.buildInto(container);
      });
      container.querySelector('#pzModeJigsaw').addEventListener('click', function(){
        Jigsaw.buildInto(container);
      });
    },

    pickImage: function(callback) {
      if(App.showImagePicker) {
        App.showImagePicker({
          title: '上传拼图底图',
          callback: function(src) {
            if(src) {
              Puz.imgSrc = src;
              App.LS.set('pzCustomImg', src);
              if(callback) callback();
            }
          }
        });
      }
    }
  };

  /* ============================
     华容道（滑块模式）
  ============================ */
  var Slide = {
    core: null, winMsg: null, emptyState: null,
    size: 3, tileSize: 0, tiles: [],
    emptyPos: {x:0, y:0}, playing: false,

    buildInto: function(container) {
      container.innerHTML = '';

      var wrap = document.createElement('div');
      wrap.className = 'pz-wrap';

      var toolbar = document.createElement('div');
      toolbar.className = 'pz-toolbar';

      var backBtn = document.createElement('div');
      backBtn.className = 'pz-btn';
      backBtn.textContent = '返回';
      backBtn.onclick = function(){ Puz.showModeSelect(container); };

      var uploadBtn = document.createElement('div');
      uploadBtn.className = 'pz-btn';
      uploadBtn.textContent = '选择图案';
      uploadBtn.onclick = function(){ Puz.pickImage(function(){ Slide.rebuildBoard(); }); };

      var sizeSelect = document.createElement('select');
      sizeSelect.className = 'pz-select';
      sizeSelect.innerHTML = '<option value="3">3x3</option><option value="4">4x4</option><option value="5">5x5</option>';
      sizeSelect.value = String(Slide.size);
      sizeSelect.onchange = function(){ Slide.size = parseInt(this.value); Slide.rebuildBoard(); };

      var startBtn = document.createElement('div');
      startBtn.className = 'pz-btn primary';
      startBtn.textContent = '打乱';
      startBtn.onclick = function(){ Slide.shuffle(); };

      toolbar.appendChild(backBtn);
      toolbar.appendChild(uploadBtn);
      toolbar.appendChild(sizeSelect);
      toolbar.appendChild(startBtn);

      var board = document.createElement('div');
      board.className = 'pz-board';
      var core = document.createElement('div');
      core.className = 'pz-core';
      Slide.core = core;

      var winMsg = document.createElement('div');
      winMsg.className = 'pz-win';
      winMsg.innerHTML = '<h3>记忆复原</h3><span>华彩重现，恭喜通关 ✨</span>';
      Slide.winMsg = winMsg;

      var emptyState = document.createElement('div');
      emptyState.className = 'pz-empty';
      emptyState.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>请先选择图案</span>';
      Slide.emptyState = emptyState;

      core.appendChild(emptyState);
      core.appendChild(winMsg);
      board.appendChild(core);
      wrap.appendChild(toolbar);
      wrap.appendChild(board);
      container.appendChild(wrap);

      Slide.rebuildBoard();
    },

    rebuildBoard: function() {
      Slide.playing = false;
      if(Slide.winMsg) Slide.winMsg.classList.remove('show');

      var oldTiles = Slide.core.querySelectorAll('.pz-tile');
      oldTiles.forEach(function(el){ el.remove(); });

      if(!Puz.imgSrc) {
        if(Slide.emptyState) Slide.emptyState.style.display = 'flex';
        return;
      }
      if(Slide.emptyState) Slide.emptyState.style.display = 'none';

      var coreSize = 280;
      Slide.tileSize = coreSize / Slide.size;
      Slide.tiles = [];

      var total = Slide.size * Slide.size;
      Slide.emptyPos = { x: Slide.size - 1, y: Slide.size - 1 };

      for(var i = 0; i < total - 1; i++){
        var t = document.createElement('div');
        t.className = 'pz-tile';
        var tx = i % Slide.size, ty = Math.floor(i / Slide.size);

        t.style.width = Slide.tileSize + 'px';
        t.style.height = Slide.tileSize + 'px';
        t.style.backgroundImage = 'url(' + Puz.imgSrc + ')';
        t.style.backgroundSize = coreSize + 'px ' + coreSize + 'px';
        t.style.backgroundPosition = '-' + (tx * Slide.tileSize) + 'px -' + (ty * Slide.tileSize) + 'px';
        t.style.transform = 'translate(' + (tx * Slide.tileSize) + 'px, ' + (ty * Slide.tileSize) + 'px)';

        Slide.tiles.push({ el: t, targetX: tx, targetY: ty, x: tx, y: ty });
        Slide.core.appendChild(t);

        (function(idx){
          t.addEventListener('click', function(){ Slide.moveTile(idx); });
        })(i);
      }
    },

    moveTile: function(idx) {
      if(!Slide.playing) return;
      var t = Slide.tiles[idx];
      var dx = Math.abs(t.x - Slide.emptyPos.x);
      var dy = Math.abs(t.y - Slide.emptyPos.y);

      if((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        var tempX = t.x, tempY = t.y;
        t.x = Slide.emptyPos.x;
        t.y = Slide.emptyPos.y;
        Slide.emptyPos.x = tempX;
        Slide.emptyPos.y = tempY;
        t.el.style.transform = 'translate(' + (t.x * Slide.tileSize) + 'px, ' + (t.y * Slide.tileSize) + 'px)';
        Slide.checkWin();
      }
    },

    shuffle: function() {
      if(!Puz.imgSrc) { App.showToast('请先上传图片'); return; }
      Slide.playing = true;
      if(Slide.winMsg) Slide.winMsg.classList.remove('show');

      var steps = Slide.size * Slide.size * 30;
      for(var i = 0; i < steps; i++){
        var movable = [];
        for(var j = 0; j < Slide.tiles.length; j++){
          var t = Slide.tiles[j];
          var dx = Math.abs(t.x - Slide.emptyPos.x);
          var dy = Math.abs(t.y - Slide.emptyPos.y);
          if((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) movable.push(t);
        }
        var pick = movable[Math.floor(Math.random() * movable.length)];
        var tx = pick.x, ty = pick.y;
        pick.x = Slide.emptyPos.x; pick.y = Slide.emptyPos.y;
        Slide.emptyPos.x = tx; Slide.emptyPos.y = ty;
      }

      for(var k = 0; k < Slide.tiles.length; k++){
        var t2 = Slide.tiles[k];
        t2.el.style.transform = 'translate(' + (t2.x * Slide.tileSize) + 'px, ' + (t2.y * Slide.tileSize) + 'px)';
      }
    },

    checkWin: function() {
      for(var i = 0; i < Slide.tiles.length; i++){
        var t = Slide.tiles[i];
        if(t.x !== t.targetX || t.y !== t.targetY) return;
      }
      Slide.playing = false;
      setTimeout(function(){ if(Slide.winMsg) Slide.winMsg.classList.add('show'); }, 300);
    }
  };

  /* ============================
     锯齿拼图（真正的Jigsaw）
  ============================ */
  var Jigsaw = {
    canvas: null, ctx: null, pieces: [],
    cols: 4, rows: 4,
    img: null, imgW: 0, imgH: 0,
    pieceW: 0, pieceH: 0,
    dragging: null, offsetX: 0, offsetY: 0,
    snapDist: 15, playing: false,
    winMsg: null,

    buildInto: function(container) {
      container.innerHTML = '';

      var wrap = document.createElement('div');
      wrap.className = 'pz-wrap';

      var toolbar = document.createElement('div');
      toolbar.className = 'pz-toolbar';

      var backBtn = document.createElement('div');
      backBtn.className = 'pz-btn';
      backBtn.textContent = '返回';
      backBtn.onclick = function(){ Puz.showModeSelect(container); };

      var uploadBtn = document.createElement('div');
      uploadBtn.className = 'pz-btn';
      uploadBtn.textContent = '选择图案';
      uploadBtn.onclick = function(){ Puz.pickImage(function(){ Jigsaw.loadAndStart(); }); };

      var sizeSelect = document.createElement('select');
      sizeSelect.className = 'pz-select';
      sizeSelect.innerHTML = '<option value="3">3x3</option><option value="4">4x4</option><option value="5">5x5</option>';
      sizeSelect.value = String(Jigsaw.cols);
      sizeSelect.onchange = function(){
        var v = parseInt(this.value);
        Jigsaw.cols = v; Jigsaw.rows = v;
        Jigsaw.loadAndStart();
      };

      var startBtn = document.createElement('div');
      startBtn.className = 'pz-btn primary';
      startBtn.textContent = '打散';
      startBtn.onclick = function(){ Jigsaw.scatter(); };

      toolbar.appendChild(backBtn);
      toolbar.appendChild(uploadBtn);
      toolbar.appendChild(sizeSelect);
      toolbar.appendChild(startBtn);

      var canvasWrap = document.createElement('div');
      canvasWrap.className = 'pz-jigsaw-wrap';

      var canvas = document.createElement('canvas');
      canvas.className = 'pz-jigsaw-canvas';
      canvas.width = 300; canvas.height = 300;
      Jigsaw.canvas = canvas;
      Jigsaw.ctx = canvas.getContext('2d');

      var winMsg = document.createElement('div');
      winMsg.className = 'pz-win';
      winMsg.innerHTML = '<h3>记忆复原</h3><span>碎片归位，恭喜通关 ✨</span>';
      Jigsaw.winMsg = winMsg;

      var emptyState = document.createElement('div');
      emptyState.className = 'pz-empty';
      emptyState.id = 'pzJigsawEmpty';
      emptyState.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>请先选择图案</span>';

      canvasWrap.appendChild(canvas);
      canvasWrap.appendChild(winMsg);
      canvasWrap.appendChild(emptyState);

      wrap.appendChild(toolbar);
      wrap.appendChild(canvasWrap);
      container.appendChild(wrap);

      Jigsaw.bindTouch();
      Jigsaw.loadAndStart();
    },

    loadAndStart: function() {
      if(Jigsaw.winMsg) Jigsaw.winMsg.classList.remove('show');
      var empty = document.getElementById('pzJigsawEmpty');

      if(!Puz.imgSrc) {
        if(empty) empty.style.display = 'flex';
        Jigsaw.ctx.clearRect(0, 0, Jigsaw.canvas.width, Jigsaw.canvas.height);
        Jigsaw.pieces = [];
        return;
      }
      if(empty) empty.style.display = 'none';

      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        Jigsaw.img = img;
        var maxSize = 280;
        var scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        Jigsaw.imgW = Math.round(img.width * scale);
        Jigsaw.imgH = Math.round(img.height * scale);
        Jigsaw.canvas.width = Jigsaw.imgW;
        Jigsaw.canvas.height = Jigsaw.imgH;
        Jigsaw.pieceW = Jigsaw.imgW / Jigsaw.cols;
        Jigsaw.pieceH = Jigsaw.imgH / Jigsaw.rows;
        Jigsaw.generatePieces();
        Jigsaw.playing = false;
        Jigsaw.draw();
      };
      img.src = Puz.imgSrc;
    },

    generatePieces: function() {
      Jigsaw.pieces = [];
      for(var row = 0; row < Jigsaw.rows; row++){
        for(var col = 0; col < Jigsaw.cols; col++){
          Jigsaw.pieces.push({
            col: col, row: row,
            targetX: col * Jigsaw.pieceW,
            targetY: row * Jigsaw.pieceH,
            x: col * Jigsaw.pieceW,
            y: row * Jigsaw.pieceH,
            placed: false
          });
        }
      }
    },

    scatter: function() {
      if(!Puz.imgSrc) { App.showToast('请先上传图片'); return; }
      Jigsaw.playing = true;
      if(Jigsaw.winMsg) Jigsaw.winMsg.classList.remove('show');
      var cw = Jigsaw.canvas.width, ch = Jigsaw.canvas.height;
      for(var i = 0; i < Jigsaw.pieces.length; i++){
        var p = Jigsaw.pieces[i];
        p.x = Math.random() * (cw - Jigsaw.pieceW);
        p.y = Math.random() * (ch - Jigsaw.pieceH);
        p.placed = false;
      }
      Jigsaw.draw();
    },

    draw: function() {
      var ctx = Jigsaw.ctx;
      ctx.clearRect(0, 0, Jigsaw.canvas.width, Jigsaw.canvas.height);

      // 底部半透明引导图
      if(Jigsaw.img && Jigsaw.playing) {
        ctx.globalAlpha = 0.15;
        ctx.drawImage(Jigsaw.img, 0, 0, Jigsaw.imgW, Jigsaw.imgH);
        ctx.globalAlpha = 1;
      }

      for(var i = 0; i < Jigsaw.pieces.length; i++){
        var p = Jigsaw.pieces[i];
        if(p === Jigsaw.dragging) continue; // 拖拽中的最后画
        Jigsaw.drawPiece(p);
      }
      if(Jigsaw.dragging) Jigsaw.drawPiece(Jigsaw.dragging);
    },

    drawPiece: function(p) {
      var ctx = Jigsaw.ctx;
      var pw = Jigsaw.pieceW, ph = Jigsaw.pieceH;
      var sx = p.col * (Jigsaw.img.width / Jigsaw.cols);
      var sy = p.row * (Jigsaw.img.height / Jigsaw.rows);
      var sw = Jigsaw.img.width / Jigsaw.cols;
      var sh = Jigsaw.img.height / Jigsaw.rows;
      var tab = pw * 0.18; // 凹凸突出大小

      ctx.save();
      ctx.beginPath();
      Jigsaw.drawPiecePath(ctx, p.x, p.y, pw, ph, p.col, p.row, tab);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(Jigsaw.img, sx, sy, sw, sh, p.x, p.y, pw, ph);
      ctx.restore();

      // 描边
      ctx.save();
      ctx.beginPath();
      Jigsaw.drawPiecePath(ctx, p.x, p.y, pw, ph, p.col, p.row, tab);
      ctx.closePath();
      ctx.strokeStyle = p.placed ? 'rgba(120,180,120,0.6)' : 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    },

    drawPiecePath: function(ctx, x, y, w, h, col, row, tab) {
      var cols = Jigsaw.cols, rows = Jigsaw.rows;
      // 简易凹凸：每条边中点画一个半圆（凸或凹）
      // 用 seed 决定方向：偶数凸，奇数凹
      ctx.moveTo(x, y);

      // 上边
      if(row === 0) { ctx.lineTo(x + w, y); }
      else {
        var topOut = ((col + row) % 2 === 0) ? -1 : 1;
        ctx.lineTo(x + w * 0.35, y);
        ctx.bezierCurveTo(x + w * 0.35, y + topOut * tab, x + w * 0.65, y + topOut * tab, x + w * 0.65, y);
        ctx.lineTo(x + w, y);
      }

      // 右边
      if(col === cols - 1) { ctx.lineTo(x + w, y + h); }
      else {
        var rightOut = ((col + row + 1) % 2 === 0) ? 1 : -1;
        ctx.lineTo(x + w, y + h * 0.35);
        ctx.bezierCurveTo(x + w + rightOut * tab, y + h * 0.35, x + w + rightOut * tab, y + h * 0.65, x + w, y + h * 0.65);
        ctx.lineTo(x + w, y + h);
      }

      // 下边
      if(row === rows - 1) { ctx.lineTo(x, y + h); }
      else {
        var botOut = ((col + row + 1) % 2 === 0) ? 1 : -1;
        ctx.lineTo(x + w * 0.65, y + h);
        ctx.bezierCurveTo(x + w * 0.65, y + h + botOut * tab, x + w * 0.35, y + h + botOut * tab, x + w * 0.35, y + h);
        ctx.lineTo(x, y + h);
      }

      // 左边
      if(col === 0) { ctx.lineTo(x, y); }
      else {
        var leftOut = ((col + row) % 2 === 0) ? -1 : 1;
        ctx.lineTo(x, y + h * 0.65);
        ctx.bezierCurveTo(x + leftOut * tab, y + h * 0.65, x + leftOut * tab, y + h * 0.35, x, y + h * 0.35);
        ctx.lineTo(x, y);
      }
    },

    bindTouch: function() {
      var canvas = Jigsaw.canvas;

      function getPos(e) {
        var rect = canvas.getBoundingClientRect();
        var t = e.touches ? e.touches[0] : e;
        return { x: t.clientX - rect.left, y: t.clientY - rect.top };
      }

      function hitTest(mx, my) {
        // 从后往前找（后绘制的在上层）
        for(var i = Jigsaw.pieces.length - 1; i >= 0; i--){
          var p = Jigsaw.pieces[i];
          if(p.placed) continue;
          if(mx >= p.x && mx <= p.x + Jigsaw.pieceW && my >= p.y && my <= p.y + Jigsaw.pieceH) {
            return p;
          }
        }
        return null;
      }

      canvas.addEventListener('touchstart', function(e) {
        if(!Jigsaw.playing) return;
        e.preventDefault();
        var pos = getPos(e);
        var hit = hitTest(pos.x, pos.y);
        if(hit) {
          Jigsaw.dragging = hit;
          Jigsaw.offsetX = pos.x - hit.x;
          Jigsaw.offsetY = pos.y - hit.y;
          // 移到数组最后（绘制在最上层）
          var idx = Jigsaw.pieces.indexOf(hit);
          Jigsaw.pieces.splice(idx, 1);
          Jigsaw.pieces.push(hit);
          Jigsaw.draw();
        }
      }, {passive: false});

      canvas.addEventListener('touchmove', function(e) {
        if(!Jigsaw.dragging) return;
        e.preventDefault();
        var pos = getPos(e);
        Jigsaw.dragging.x = pos.x - Jigsaw.offsetX;
        Jigsaw.dragging.y = pos.y - Jigsaw.offsetY;
        Jigsaw.draw();
      }, {passive: false});

      canvas.addEventListener('touchend', function(e) {
        if(!Jigsaw.dragging) return;
        var p = Jigsaw.dragging;
        Jigsaw.dragging = null;

        // 吸附判定
        var dx = Math.abs(p.x - p.targetX);
        var dy = Math.abs(p.y - p.targetY);
        if(dx < Jigsaw.snapDist && dy < Jigsaw.snapDist) {
          p.x = p.targetX;
          p.y = p.targetY;
          p.placed = true;
        }

        Jigsaw.draw();
        Jigsaw.checkWin();
      }, {passive: true});

      // 鼠标兼容
      canvas.addEventListener('mousedown', function(e) {
        if(!Jigsaw.playing) return;
        var pos = getPos(e);
        var hit = hitTest(pos.x, pos.y);
        if(hit) {
          Jigsaw.dragging = hit;
          Jigsaw.offsetX = pos.x - hit.x;
          Jigsaw.offsetY = pos.y - hit.y;
          var idx = Jigsaw.pieces.indexOf(hit);
          Jigsaw.pieces.splice(idx, 1);
          Jigsaw.pieces.push(hit);
          Jigsaw.draw();
        }
      });
      document.addEventListener('mousemove', function(e) {
        if(!Jigsaw.dragging) return;
        var pos = getPos(e);
        Jigsaw.dragging.x = pos.x - Jigsaw.offsetX;
        Jigsaw.dragging.y = pos.y - Jigsaw.offsetY;
        Jigsaw.draw();
      });
      document.addEventListener('mouseup', function() {
        if(!Jigsaw.dragging) return;
        var p = Jigsaw.dragging;
        Jigsaw.dragging = null;
        var dx = Math.abs(p.x - p.targetX);
        var dy = Math.abs(p.y - p.targetY);
        if(dx < Jigsaw.snapDist && dy < Jigsaw.snapDist) {
          p.x = p.targetX; p.y = p.targetY; p.placed = true;
        }
        Jigsaw.draw();
        Jigsaw.checkWin();
      });
    },

    checkWin: function() {
      for(var i = 0; i < Jigsaw.pieces.length; i++){
        if(!Jigsaw.pieces[i].placed) return;
      }
      Jigsaw.playing = false;
      setTimeout(function(){ if(Jigsaw.winMsg) Jigsaw.winMsg.classList.add('show'); }, 300);
    }
  };

  App.register('puzzle', Puz);
})();
