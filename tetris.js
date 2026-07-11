
/* ================================================
   🌟 墨墨专属 · 琉璃玉透猫爪掌机 (tetris.js)
   ================================================ */
(function(){
  'use strict';
  var App = window.App; if(!App) return;

  var TT = {
    COLS: 10, ROWS: 20, BLOCK_SIZE: 0,
    canvas: null, ctx: null, 
    board: [], score: 0,
    activePiece: null, nextPiece: null,
    dropStart: 0, gameOver: false, paused: false, reqId: null,
    scoreEl: null, overlayEl: null,

    // 冰透马卡龙配色
    COLORS: [ null, '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#D4A5A5', '#E2F0CB' ],
    SHAPES: [ [], [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], [[2,0,0],[2,2,2],[0,0,0]], [[0,0,3],[3,3,3],[0,0,0]], [[4,4],[4,4]], [[0,5,5],[5,5,0],[0,0,0]], [[0,6,0],[6,6,6],[0,0,0]], [[7,7,0],[0,7,7],[0,0,0]] ],

    init: function() { App.safeOn('#iconTetris', 'click', function(){ TT.openGame(); }); },

    openGame: function() {
      var old = document.getElementById('ttGamePanel'); if(old) old.remove();
      var panel = document.createElement('div');
      panel.id = 'ttGamePanel'; panel.className = 'bf-sub-panel';
      panel.innerHTML = '<div class="bf-nav"><button class="bf-back" id="ttBack" type="button"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3.5"/><path d="M36 20L24 32L36 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="bf-nav-title">方块消除</span><div class="bf-nav-right"></div></div><div class="bf-scroll-body"><div id="ttGameContent"></div></div>';
      
      document.body.appendChild(panel);
      requestAnimationFrame(function(){ panel.classList.add('show'); });

      var closePanel = function(){ 
        TT.gameOver = true; TT.paused = false; cancelAnimationFrame(TT.reqId);
        panel.classList.remove('show'); panel.classList.add('hidden'); setTimeout(function(){ panel.remove(); }, 350); 
      };
      if(App.bindSwipeBack) App.bindSwipeBack(panel, closePanel);
      panel.querySelector('#ttBack').addEventListener('click', closePanel);
      
      TT.buildUI(panel.querySelector('#ttGameContent'));
    },

    buildUI: function(container) {
      container.innerHTML = 
        '<div class="tt-wrap">' +
          '<div class="tt-card">' +
            '<div class="tt-card-top"><div class="tt-led tt-led-on"></div><div class="tt-led"></div><div class="tt-led"></div></div>' +
            '<div class="tt-card-body">' +
              
              '<!-- 左侧旋转区 -->' +
              '<div class="tt-left">' +
                '<div class="tt-paw-btn" id="ttBtnRotate">' +
                  '<div class="tt-paw-inner">' +
                    '<div class="tt-pp tt-pp-t1"></div><div class="tt-pp tt-pp-t2"></div><div class="tt-pp tt-pp-t3"></div><div class="tt-pp tt-pp-t4"></div><div class="tt-pp tt-pp-main"></div>' +
                  '</div>' +
                '</div>' +
                '<div class="tt-btn-label">旋转</div>' +
              '</div>' +

              '<!-- 中间主屏幕 -->' +
              '<div class="tt-screen-wrap">' +
                '<div class="tt-screen">' +
                  '<div class="tt-screen-badge">' +
                    '<div class="tt-badge-left"><div class="tt-badge-dot"></div><div class="tt-badge-text">SCORE: <span id="ttScore">0</span></div></div>' +
                    '<div class="tt-screen-no">TETRIS</div>' +
                  '</div>' +
                  '<div class="tt-canvas-container">' +
                    '<canvas class="tt-canvas" id="ttCanvas"></canvas>' +
                    '<div class="tt-overlay tt-hidden" id="ttOverlay">' +
                      '<h3 id="ttOverlayTitle">GAME OVER</h3>' +
                      '<button class="tt-overlay-btn" id="ttOverlayBtn">再来一局</button>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<!-- 右侧方向区 -->' +
              '<div class="tt-right">' +
                '<div class="tt-act-btn" id="ttBtnReset">重置</div>' +
                '<div class="tt-dpad">' +
                  '<div class="tt-dpad-btn tt-dpad-up" id="ttBtnPause" title="暂停/继续"><svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg></div>' +
                  '<div class="tt-dpad-btn tt-dpad-left" id="ttBtnLeft"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></div>' +
                  '<div class="tt-dpad-btn tt-dpad-right" id="ttBtnRight"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></div>' +
                  '<div class="tt-dpad-btn tt-dpad-down" id="ttBtnDown"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></div>' +
                '</div>' +
              '</div>' +

            '</div>' +
          '</div>' +
        '</div>';

      TT.scoreEl = container.querySelector('#ttScore');
      TT.overlayEl = container.querySelector('#ttOverlay');
      TT.canvas = container.querySelector('#ttCanvas');
      TT.ctx = TT.canvas.getContext('2d');

      // 动态计算屏幕画布大小，严丝合缝填满！
      var containerW = container.querySelector('.tt-canvas-container').clientWidth;
      TT.BLOCK_SIZE = Math.floor(containerW / TT.COLS);
      var cvsW = TT.BLOCK_SIZE * TT.COLS;
      var cvsH = TT.BLOCK_SIZE * TT.ROWS;

      var dpr = window.devicePixelRatio || 1;
      TT.canvas.style.width = cvsW + 'px'; TT.canvas.style.height = cvsH + 'px';
      TT.canvas.width = cvsW * dpr; TT.canvas.height = cvsH * dpr;
      TT.ctx.scale(dpr, dpr);

      // 绑定重置和弹窗按钮
      container.querySelector('#ttBtnReset').addEventListener('click', function(){ TT.reset(); });
      container.querySelector('#ttOverlayBtn').addEventListener('click', function(){ 
        if(TT.paused) TT.togglePause(); else TT.reset(); 
      });

      TT.bindControls(container);
      TT.reset();
    },

    bindControls: function(c) {
      c.querySelectorAll('.tt-paw-btn, .tt-dpad-btn').forEach(function(b){ b.addEventListener('contextmenu', function(e){ e.preventDefault(); }); });

      var map = { 'ttBtnLeft': -1, 'ttBtnRight': 1 };
      var timers = {};

      // 左右移动
      ['ttBtnLeft', 'ttBtnRight'].forEach(function(id) {
        var btn = c.querySelector('#'+id); var dir = map[id];
        var startMove = function(e){
          e.preventDefault(); if(TT.gameOver || TT.paused) return; btn.classList.add('pressed');
          TT.move(dir);
          timers[id] = setTimeout(function(){ timers[id+'_iv'] = setInterval(function(){ TT.move(dir); }, 80); }, 200);
        };
        var endMove = function(e){ e.preventDefault(); btn.classList.remove('pressed'); clearTimeout(timers[id]); clearInterval(timers[id+'_iv']); };
        btn.addEventListener('touchstart', startMove, {passive:false}); btn.addEventListener('touchend', endMove);
      });

      // 软降 (下键)
      var btnDown = c.querySelector('#ttBtnDown');
      var startDown = function(e){ e.preventDefault(); if(TT.gameOver || TT.paused) return; btnDown.classList.add('pressed'); timers['down'] = setInterval(function(){ TT.drop(); }, 50); };
      var endDown = function(e){ e.preventDefault(); btnDown.classList.remove('pressed'); clearInterval(timers['down']); };
      btnDown.addEventListener('touchstart', startDown, {passive:false}); btnDown.addEventListener('touchend', endDown);

      // 猫爪 (旋转)
      var btnRotate = c.querySelector('#ttBtnRotate');
      btnRotate.addEventListener('touchstart', function(e){ e.preventDefault(); if(TT.gameOver || TT.paused) return; btnRotate.classList.add('pressed'); TT.rotate(); }, {passive:false});
      btnRotate.addEventListener('touchend', function(e){ e.preventDefault(); btnRotate.classList.remove('pressed'); });

      // 上键 (暂停)
      var btnPause = c.querySelector('#ttBtnPause');
      btnPause.addEventListener('touchstart', function(e){ e.preventDefault(); btnPause.classList.add('pressed'); TT.togglePause(); }, {passive:false});
      btnPause.addEventListener('touchend', function(e){ e.preventDefault(); btnPause.classList.remove('pressed'); });
    },

    togglePause: function() {
      if (TT.gameOver) return;
      TT.paused = !TT.paused;
      var title = TT.overlayEl.querySelector('#ttOverlayTitle');
      var btn = TT.overlayEl.querySelector('#ttOverlayBtn');
      
      if (TT.paused) {
        title.textContent = 'PAUSED'; btn.textContent = '点击继续';
        TT.overlayEl.classList.remove('danger'); TT.overlayEl.classList.remove('tt-hidden');
        cancelAnimationFrame(TT.reqId);
      } else {
        TT.overlayEl.classList.add('tt-hidden');
        TT.dropStart = Date.now(); TT.loop();
      }
    },

    reset: function() {
      TT.board = Array.from({length: TT.ROWS}, function() { return Array(TT.COLS).fill(0); });
      TT.score = 0; TT.scoreEl.textContent = '0';
      TT.gameOver = false; TT.paused = false; TT.overlayEl.classList.add('tt-hidden');
      TT.spawn(); TT.dropStart = Date.now();
      cancelAnimationFrame(TT.reqId); TT.loop();
    },

    spawn: function() {
      var typeId = Math.floor(Math.random() * 7) + 1;
      var shape = TT.SHAPES[typeId];
      TT.activePiece = { x: Math.floor(TT.COLS/2) - Math.floor(shape[0].length/2), y: 0, matrix: shape, color: TT.COLORS[typeId] };
      if (TT.collide()) { 
        TT.gameOver = true; 
        var title = TT.overlayEl.querySelector('#ttOverlayTitle');
        var btn = TT.overlayEl.querySelector('#ttOverlayBtn');
        title.textContent = 'GAME OVER'; btn.textContent = '再来一局';
        TT.overlayEl.classList.add('danger'); TT.overlayEl.classList.remove('tt-hidden');
      }
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
      var offset = 1;
      while (TT.collide()) {
        TT.activePiece.x += offset; offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > m[0].length) { TT.activePiece.matrix = prev; TT.activePiece.x = TT.activePiece.x + offset; return; }
      }
      TT.draw();
    },

    move: function(dir) { TT.activePiece.x += dir; if (TT.collide()) TT.activePiece.x -= dir; TT.draw(); },

    drop: function() {
      TT.activePiece.y++;
      if (TT.collide()) { TT.activePiece.y--; TT.merge(); TT.clearLines(); TT.spawn(); }
      TT.dropStart = Date.now(); TT.draw();
    },

    clearLines: function() {
      var linesCleared = 0;
      outer: for (var r = TT.ROWS - 1; r >= 0; r--) {
        for (var c = 0; c < TT.COLS; c++) { if (TT.board[r][c] === 0) continue outer; }
        var row = TT.board.splice(r, 1)[0].fill(0); TT.board.unshift(row); r++; linesCleared++;
      }
      if (linesCleared > 0) { TT.score += [0, 100, 300, 500, 800][linesCleared]; TT.scoreEl.textContent = TT.score; }
    },

    drawBlock: function(x, y, color) {
      var bs = TT.BLOCK_SIZE; TT.ctx.fillStyle = color; TT.ctx.fillRect(x * bs + 1, y * bs + 1, bs - 2, bs - 2);
      TT.ctx.fillStyle = 'rgba(255,255,255,0.4)'; TT.ctx.fillRect(x * bs + 2, y * bs + 2, bs - 4, 3);
      TT.ctx.fillStyle = 'rgba(0,0,0,0.15)'; TT.ctx.fillRect(x * bs + 2, y * bs + bs - 5, bs - 4, 3);
    },

    draw: function() {
      TT.ctx.clearRect(0, 0, TT.canvas.width, TT.canvas.height);
      TT.ctx.strokeStyle = 'rgba(0,0,0,0.03)'; TT.ctx.lineWidth = 1;
      for(var i=0; i<=TT.COLS; i++) { TT.ctx.beginPath(); TT.ctx.moveTo(i*TT.BLOCK_SIZE, 0); TT.ctx.lineTo(i*TT.BLOCK_SIZE, TT.ROWS*TT.BLOCK_SIZE); TT.ctx.stroke(); }
      for(var j=0; j<=TT.ROWS; j++) { TT.ctx.beginPath(); TT.ctx.moveTo(0, j*TT.BLOCK_SIZE); TT.ctx.lineTo(TT.COLS*TT.BLOCK_SIZE, j*TT.BLOCK_SIZE); TT.ctx.stroke(); }
      
      for (var r = 0; r < TT.ROWS; r++) { for (var c = 0; c < TT.COLS; c++) { if (TT.board[r][c] !== 0) TT.drawBlock(c, r, TT.COLORS[TT.board[r][c]]); } }
      
      var m = TT.activePiece.matrix, px = TT.activePiece.x, py = TT.activePiece.y;
      for (var ar = 0; ar < m.length; ar++) { for (var ac = 0; ac < m[ar].length; ac++) { if (m[ar][ac] !== 0) TT.drawBlock(px + ac, py + ar, TT.activePiece.color); } }
    },

    loop: function() {
      if(TT.gameOver || TT.paused) return;
      var now = Date.now();
      if (now - TT.dropStart > 700) TT.drop();
      TT.reqId = requestAnimationFrame(TT.loop);
    }
  };

  App.register('tetris', TT);
})();
