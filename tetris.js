/* ================================================
   🌟 墨墨专属 · 玻璃方块 (tetris.js)
   ================================================ */
(function(){
  'use strict';
  var App = window.App; if(!App) return;

  var TT = {
    COLS: 10, ROWS: 20, BLOCK_SIZE: 0,
    canvas: null, ctx: null, 
    board: [], score: 0,
    activePiece: null, nextPiece: null,
    dropStart: 0, gameOver: false, reqId: null,
    scoreEl: null, overlayEl: null,

    // 冰透马卡龙配色
    COLORS: [
      null,
      '#FFB3BA', // 1 I
      '#FFDFBA', // 2 J
      '#FFFFBA', // 3 L
      '#BAFFC9', // 4 O
      '#BAE1FF', // 5 S
      '#D4A5A5', // 6 T
      '#E2F0CB'  // 7 Z
    ],

    SHAPES: [
      [],
      [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
      [[2,0,0],[2,2,2],[0,0,0]], // J
      [[0,0,3],[3,3,3],[0,0,0]], // L
      [[4,4],[4,4]], // O
      [[0,5,5],[5,5,0],[0,0,0]], // S
      [[0,6,0],[6,6,6],[0,0,0]], // T
      [[7,7,0],[0,7,7],[0,0,0]]  // Z
    ],

    init: function() { App.safeOn('#iconTetris', 'click', function(){ TT.openGame(); }); },

    openGame: function() {
      var old = document.getElementById('ttGamePanel'); if(old) old.remove();
      var panel = document.createElement('div');
      panel.id = 'ttGamePanel'; panel.className = 'bf-sub-panel';
      panel.innerHTML = '<div class="bf-nav"><button class="bf-back" id="ttBack" type="button"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3.5"/><path d="M36 20L24 32L36 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="bf-nav-title">方块</span><div class="bf-nav-right"></div></div><div class="bf-scroll-body"><div id="ttGameContent"></div></div>';
      
      document.body.appendChild(panel);
      requestAnimationFrame(function(){ panel.classList.add('show'); });

      var closePanel = function(){ 
        TT.gameOver = true; cancelAnimationFrame(TT.reqId); // 关闭时彻底销毁游戏循环
        panel.classList.remove('show'); panel.classList.add('hidden'); setTimeout(function(){ panel.remove(); }, 350); 
      };
      if(App.bindSwipeBack) App.bindSwipeBack(panel, closePanel);
      panel.querySelector('#ttBack').addEventListener('click', closePanel);
      
      TT.buildUI(panel.querySelector('#ttGameContent'));
    },

    buildUI: function(container) {
      container.innerHTML = 
        '<div class="tt-wrap">' +
          '<div class="tt-header">' +
            '<div class="tt-score-box"><span class="tt-score-label">SCORE</span><span class="tt-score-val" id="ttScore">0</span></div>' +
          '</div>' +
          '<div class="tt-board-wrap">' +
            '<canvas class="tt-canvas" id="ttCanvas"></canvas>' +
            '<div class="tt-overlay tt-hidden" id="ttOverlay">' +
              '<h3>GAME OVER</h3>' +
              '<button class="tt-overlay-btn" id="ttRestartBtn">再来一局</button>' +
            '</div>' +
          '</div>' +
          '<div class="tt-controls">' +
            '<div class="tt-btn" id="ttBtnLeft"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></div>' +
            '<div class="tt-btn" id="ttBtnDown"><svg viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div>' +
            '<div class="tt-btn" id="ttBtnRight"><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>' +
            '<div class="tt-btn tt-btn-rotate" id="ttBtnRotate"><svg viewBox="0 0 24 24"><path d="M21 2v6h-6"/><path d="M21 13a9 9 0 11-3-7.7L21 8"/></svg></div>' +
          '</div>' +
        '</div>';

      TT.scoreEl = container.querySelector('#ttScore');
      TT.overlayEl = container.querySelector('#ttOverlay');
      TT.canvas = container.querySelector('#ttCanvas');
      TT.ctx = TT.canvas.getContext('2d');

      var w = window.innerWidth * 0.75; if(w > 300) w = 300; // 适配手机宽度的画布
      TT.BLOCK_SIZE = Math.floor(w / TT.COLS);
      var cvsW = TT.BLOCK_SIZE * TT.COLS;
      var cvsH = TT.BLOCK_SIZE * TT.ROWS;

      var dpr = window.devicePixelRatio || 1;
      TT.canvas.style.width = cvsW + 'px'; TT.canvas.style.height = cvsH + 'px';
      TT.canvas.width = cvsW * dpr; TT.canvas.height = cvsH * dpr;
      TT.ctx.scale(dpr, dpr);

      container.querySelector('#ttRestartBtn').addEventListener('click', function(){ TT.reset(); });

      TT.bindControls(container);
      TT.reset();
    },

    bindControls: function(c) {
      // 防止长按出现菜单
      c.querySelectorAll('.tt-btn').forEach(function(b){ b.addEventListener('contextmenu', function(e){ e.preventDefault(); }); });

      var map = { 'ttBtnLeft': -1, 'ttBtnRight': 1 };
      var timers = {};

      // 绑定左右移动（支持长按连续移动）
      ['ttBtnLeft', 'ttBtnRight'].forEach(function(id) {
        var btn = c.querySelector('#'+id);
        var dir = map[id];
        var startMove = function(e){
          e.preventDefault(); if(TT.gameOver) return; btn.classList.add('pressed');
          TT.move(dir);
          timers[id] = setTimeout(function(){
            timers[id+'_iv'] = setInterval(function(){ TT.move(dir); }, 80); // 长按极速移动
          }, 200);
        };
        var endMove = function(e){ e.preventDefault(); btn.classList.remove('pressed'); clearTimeout(timers[id]); clearInterval(timers[id+'_iv']); };
        btn.addEventListener('touchstart', startMove, {passive:false});
        btn.addEventListener('touchend', endMove);
      });

      // 绑定向下（软降）
      var btnDown = c.querySelector('#ttBtnDown');
      var startDown = function(e){ e.preventDefault(); if(TT.gameOver) return; btnDown.classList.add('pressed'); timers['down'] = setInterval(function(){ TT.drop(); }, 50); };
      var endDown = function(e){ e.preventDefault(); btnDown.classList.remove('pressed'); clearInterval(timers['down']); };
      btnDown.addEventListener('touchstart', startDown, {passive:false}); btnDown.addEventListener('touchend', endDown);

      // 绑定旋转（点击触发一次）
      var btnRotate = c.querySelector('#ttBtnRotate');
      btnRotate.addEventListener('touchstart', function(e){ e.preventDefault(); if(TT.gameOver) return; btnRotate.classList.add('pressed'); TT.rotate(); }, {passive:false});
      btnRotate.addEventListener('touchend', function(e){ e.preventDefault(); btnRotate.classList.remove('pressed'); });
    },

    reset: function() {
      TT.board = Array.from({length: TT.ROWS}, function() { return Array(TT.COLS).fill(0); });
      TT.score = 0; TT.scoreEl.textContent = '0';
      TT.gameOver = false; TT.overlayEl.classList.add('tt-hidden');
      TT.spawn(); TT.dropStart = Date.now();
      cancelAnimationFrame(TT.reqId);
      TT.loop();
    },

    spawn: function() {
      var typeId = Math.floor(Math.random() * 7) + 1;
      var shape = TT.SHAPES[typeId];
      TT.activePiece = { x: Math.floor(TT.COLS/2) - Math.floor(shape[0].length/2), y: 0, matrix: shape, color: TT.COLORS[typeId] };
      if (TT.collide()) { TT.gameOver = true; TT.overlayEl.classList.remove('tt-hidden'); }
    },

    collide: function() {
      var m = TT.activePiece.matrix, px = TT.activePiece.x, py = TT.activePiece.y;
      for (var r = 0; r < m.length; r++) {
        for (var c = 0; c < m[r].length; c++) {
          if (m[r][c] !== 0 && (TT.board[py + r] && TT.board[py + r][px + c]) !== 0) return true;
        }
      }
      return false;
    },

    merge: function() {
      var m = TT.activePiece.matrix, px = TT.activePiece.x, py = TT.activePiece.y;
      for (var r = 0; r < m.length; r++) {
        for (var c = 0; c < m[r].length; c++) {
          if (m[r][c] !== 0) TT.board[py + r][px + c] = m[r][c];
        }
      }
    },

    rotate: function() {
      var m = TT.activePiece.matrix;
      var next = m[0].map(function(val, index){ return m.map(function(row){ return row[index]; }).reverse(); });
      var prev = TT.activePiece.matrix;
      TT.activePiece.matrix = next;
      // 靠墙旋转修复
      var offset = 1;
      while (TT.collide()) {
        TT.activePiece.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > m[0].length) { TT.activePiece.matrix = prev; TT.activePiece.x = TT.activePiece.x + offset; return; }
      }
      TT.draw();
    },

    move: function(dir) { TT.activePiece.x += dir; if (TT.collide()) TT.activePiece.x -= dir; TT.draw(); },

    drop: function() {
      TT.activePiece.y++;
      if (TT.collide()) {
        TT.activePiece.y--; TT.merge(); TT.clearLines(); TT.spawn();
      }
      TT.dropStart = Date.now(); TT.draw();
    },

    clearLines: function() {
      var linesCleared = 0;
      outer: for (var r = TT.ROWS - 1; r >= 0; r--) {
        for (var c = 0; c < TT.COLS; c++) { if (TT.board[r][c] === 0) continue outer; }
        var row = TT.board.splice(r, 1)[0].fill(0); TT.board.unshift(row);
        r++; linesCleared++;
      }
      if (linesCleared > 0) { TT.score += [0, 100, 300, 500, 800][linesCleared]; TT.scoreEl.textContent = TT.score; }
    },

    drawBlock: function(x, y, color) {
      var bs = TT.BLOCK_SIZE;
      TT.ctx.fillStyle = color;
      TT.ctx.fillRect(x * bs + 1, y * bs + 1, bs - 2, bs - 2);
      // 给块加上琉璃质感的内发光
      TT.ctx.fillStyle = 'rgba(255,255,255,0.3)';
      TT.ctx.fillRect(x * bs + 2, y * bs + 2, bs - 4, 3);
      TT.ctx.fillStyle = 'rgba(0,0,0,0.1)';
      TT.ctx.fillRect(x * bs + 2, y * bs + bs - 5, bs - 4, 3);
    },

    draw: function() {
      TT.ctx.clearRect(0, 0, TT.canvas.width, TT.canvas.height);
      // 绘制背景网格
      TT.ctx.strokeStyle = 'rgba(0,0,0,0.02)'; TT.ctx.lineWidth = 1;
      for(var i=0; i<=TT.COLS; i++) { TT.ctx.beginPath(); TT.ctx.moveTo(i*TT.BLOCK_SIZE, 0); TT.ctx.lineTo(i*TT.BLOCK_SIZE, TT.ROWS*TT.BLOCK_SIZE); TT.ctx.stroke(); }
      for(var j=0; j<=TT.ROWS; j++) { TT.ctx.beginPath(); TT.ctx.moveTo(0, j*TT.BLOCK_SIZE); TT.ctx.lineTo(TT.COLS*TT.BLOCK_SIZE, j*TT.BLOCK_SIZE); TT.ctx.stroke(); }
      
      // 绘制落下的块
      for (var r = 0; r < TT.ROWS; r++) {
        for (var c = 0; c < TT.COLS; c++) {
          if (TT.board[r][c] !== 0) TT.drawBlock(c, r, TT.COLORS[TT.board[r][c]]);
        }
      }
      // 绘制当前活动的块
      var m = TT.activePiece.matrix, px = TT.activePiece.x, py = TT.activePiece.y;
      for (var ar = 0; ar < m.length; ar++) {
        for (var ac = 0; ac < m[ar].length; ac++) {
          if (m[ar][ac] !== 0) TT.drawBlock(px + ac, py + ar, TT.activePiece.color);
        }
      }
    },

    loop: function() {
      if(TT.gameOver) return;
      var now = Date.now();
      // 下落速度，越玩越快？这里暂时设为固定 800ms 落一格，如果想难点改成 500
      if (now - TT.dropStart > 800) { TT.drop(); }
      TT.reqId = requestAnimationFrame(TT.loop);
    }
  };

  App.register('tetris', TT);
})();
