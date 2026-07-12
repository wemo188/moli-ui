
/* ================================================
   🌟 墨墨专属 · 琉璃玉透猫爪掌机 (tetris.js) - 终极清透冰块版
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
    scoreEl: null, timeEl: null, overlayEl: null, recordModal: null,
    gameSeconds: 0, lastSecondTick: 0, hideOverlayTimer: null,

    // ★ 墨总的神仙配色 (转成带 85% 冰透感的 RGBA 格式)
    COLORS: [ 
      null, 
      'rgba(134, 170, 218, 0.8)', // 1: #86aada
      'rgba(218, 134, 134, 0.8)', // 2: #da8686
      'rgba(251, 206, 217, 0.8)', // 3: #fbced9
      'rgba(227, 202, 247, 0.8)', // 4: #E3CAF7
      'rgba(187, 197, 213, 0.8)', // 5: #bbc5d5
      'rgba(251, 220, 191, 0.8)', // 6: #FBDCBF
      'rgba(179, 222, 237, 0.8)'  // 7: #b3deed
    ],
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
        TT.saveGame(); 
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
              '<div class="tt-screen-wrap">' +
                '<div class="tt-screen">' +
                  '<div class="tt-screen-badge">' +
                    '<div class="tt-badge-left"><div class="tt-badge-dot"></div><div class="tt-badge-text">SCORE: <span id="ttScore">0</span></div></div>' +
                    '<div class="tt-screen-time">TIME: <span id="ttTime">00:00</span></div>' +
                  '</div>' +
                  '<div class="tt-canvas-container">' +
                    '<canvas class="tt-canvas" id="ttCanvas"></canvas>' +
                    '<div class="tt-overlay tt-hidden" id="ttOverlay">' +
                      '<h3 id="ttOverlayTitle">GAME OVER</h3>' +
                      '<button class="tt-overlay-btn" id="ttOverlayBtn">确定</button>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<div class="tt-divider-groove"></div>' +

              '<div class="tt-controls-row">' +
                '<div class="tt-left">' +
                  '<div class="tt-paw-btn" id="ttBtnRotate">' +
                    '<div class="tt-paw-inner">' +
                      '<div class="tt-pp tt-pp-t1"></div><div class="tt-pp tt-pp-t2"></div><div class="tt-pp tt-pp-t3"></div><div class="tt-pp tt-pp-t4"></div><div class="tt-pp tt-pp-main"></div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="tt-btn-label">旋转</div>' +
                '</div>' +

                '<div class="tt-right">' +
                  '<div class="tt-dpad">' +
                    '<div class="tt-dpad-btn tt-dpad-up" id="ttBtnPause" title="暂停/继续"><svg viewBox="0 0 24 24"><line x1="9" y1="6" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="18"/></svg></div>' +
                    '<div class="tt-dpad-btn tt-dpad-left" id="ttBtnLeft"><svg viewBox="0 0 24 24"><polyline points="14 7 8 12 14 17"/></svg></div>' +
                    '<div class="tt-dpad-btn tt-dpad-right" id="ttBtnRight"><svg viewBox="0 0 24 24"><polyline points="10 7 16 12 10 17"/></svg></div>' +
                    '<div class="tt-dpad-btn tt-dpad-down" id="ttBtnDown"><svg viewBox="0 0 24 24"><polyline points="7 10 12 16 17 10"/></svg></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="tt-out-actions">' +
             '<div class="tt-out-btn primary" id="ttBtnOutReset">重新开始</div>' +
             '<div class="tt-out-btn primary" id="ttBtnOutRecord">分数记录</div>' +
             '<div class="tt-out-btn danger" id="ttBtnOutEnd">结束游戏</div>' +
          '</div>' +

          '<div class="tt-record-modal tt-hidden" id="ttRecordModal">' +
             '<div class="tt-rm-close" id="ttRmClose">×</div>' +
             '<div class="tt-rm-title">历史分数</div>' +
             '<div class="tt-rm-best">最高记录: <span id="ttRmBestVal">0</span></div>' +
             '<ul class="tt-rm-list" id="ttRmList"></ul>' +
          '</div>' +
        '</div>';

      TT.scoreEl = container.querySelector('#ttScore');
      TT.timeEl = container.querySelector('#ttTime');
      TT.overlayEl = container.querySelector('#ttOverlay');
      TT.recordModal = container.querySelector('#ttRecordModal');
      TT.canvas = container.querySelector('#ttCanvas');
      TT.ctx = TT.canvas.getContext('2d');

      var wrapW = container.querySelector('.tt-canvas-container').clientWidth || 260;
      var maxCvsHeight = window.innerHeight * 0.48; 
      var blockSizeW = Math.floor(wrapW / TT.COLS);
      var blockSizeH = Math.floor(maxCvsHeight / TT.ROWS);
      
      TT.BLOCK_SIZE = Math.min(blockSizeW, blockSizeH); 
      if (TT.BLOCK_SIZE < 10) TT.BLOCK_SIZE = 10; 
      
      var cvsW = TT.BLOCK_SIZE * TT.COLS;
      var cvsH = TT.BLOCK_SIZE * TT.ROWS;

      var dpr = window.devicePixelRatio || 1;
      TT.canvas.style.width = cvsW + 'px'; TT.canvas.style.height = cvsH + 'px';
      TT.canvas.width = cvsW * dpr; TT.canvas.height = cvsH * dpr;
      TT.ctx.scale(dpr, dpr);

      container.querySelector('#ttOverlayBtn').addEventListener('click', function(){ 
        TT.overlayEl.classList.add('tt-hidden');
      });

      container.querySelector('#ttBtnOutReset').addEventListener('click', function(){ 
        if(TT.score > 0 && !TT.gameOver) TT.saveRecord(TT.score);
        App.LS.remove('ttSaveData');
        TT.reset(); 
      });
      container.querySelector('#ttBtnOutRecord').addEventListener('click', function(){ TT.showRecords(); });
      container.querySelector('#ttBtnOutEnd').addEventListener('click', function(){ 
        if(TT.score > 0 && !TT.gameOver) TT.saveRecord(TT.score);
        App.LS.remove('ttSaveData');
        TT.gameOver = true;
        TT.showOverlay('GAME OVER', '已结束', 'danger', 2500);
      });

      container.querySelector('#ttRmClose').addEventListener('click', function(){ TT.recordModal.classList.add('tt-hidden'); });

      TT.bindControls(container);
      TT.loadGame(); 
    },

    showOverlay: function(titleText, btnText, extraClass, durationMs) {
      clearTimeout(TT.hideOverlayTimer);
      TT.overlayEl.className = 'tt-overlay'; 
      if (extraClass) TT.overlayEl.classList.add(extraClass);
      TT.overlayEl.querySelector('#ttOverlayTitle').textContent = titleText;
      TT.overlayEl.querySelector('#ttOverlayBtn').textContent = btnText;
      TT.overlayEl.classList.remove('tt-hidden');

      if (durationMs) {
        TT.hideOverlayTimer = setTimeout(function(){
          TT.overlayEl.classList.add('tt-hidden');
        }, durationMs);
      }
    },

    bindControls: function(c) {
      c.querySelectorAll('.tt-paw-btn, .tt-dpad-btn').forEach(function(b){ b.addEventListener('contextmenu', function(e){ e.preventDefault(); }); });
      var map = { 'ttBtnLeft': -1, 'ttBtnRight': 1 };
      var timers = {};

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

      var btnDown = c.querySelector('#ttBtnDown');
      var startDown = function(e){ e.preventDefault(); if(TT.gameOver || TT.paused) return; btnDown.classList.add('pressed'); timers['down'] = setInterval(function(){ TT.drop(); }, 50); };
      var endDown = function(e){ e.preventDefault(); btnDown.classList.remove('pressed'); clearInterval(timers['down']); };
      btnDown.addEventListener('touchstart', startDown, {passive:false}); btnDown.addEventListener('touchend', endDown);

      var btnRotate = c.querySelector('#ttBtnRotate');
      btnRotate.addEventListener('touchstart', function(e){ e.preventDefault(); if(TT.gameOver || TT.paused) return; btnRotate.classList.add('pressed'); TT.rotate(); }, {passive:false});
      btnRotate.addEventListener('touchend', function(e){ e.preventDefault(); btnRotate.classList.remove('pressed'); });

      var btnPause = c.querySelector('#ttBtnPause');
      btnPause.addEventListener('touchstart', function(e){ e.preventDefault(); btnPause.classList.add('pressed'); TT.togglePause(); }, {passive:false});
      btnPause.addEventListener('touchend', function(e){ e.preventDefault(); btnPause.classList.remove('pressed'); });
    },

    togglePause: function() {
      if (TT.gameOver) return;
      TT.paused = !TT.paused;
      
      if (TT.paused) {
        cancelAnimationFrame(TT.reqId);
        TT.showOverlay('PAUSED', '隐藏遮罩', '', 2000); 
      } else {
        clearTimeout(TT.hideOverlayTimer);
        TT.overlayEl.classList.add('tt-hidden');
        TT.lastSecondTick = Date.now(); 
        TT.dropStart = Date.now(); 
        TT.loop();
      }
    },

    saveGame: function() {
      if (TT.gameOver || TT.score === 0 && !TT.activePiece) { App.LS.remove('ttSaveData'); return; }
      var snap = { board: TT.board, score: TT.score, time: TT.gameSeconds, piece: TT.activePiece, paused: TT.paused };
      App.LS.set('ttSaveData', snap);
    },

    loadGame: function() {
      var snap = App.LS.get('ttSaveData');
      if (!snap) { TT.reset(); return; }
      TT.board = snap.board;
      TT.score = snap.score; TT.scoreEl.textContent = TT.score;
      TT.gameSeconds = snap.time;
      var min = Math.floor(TT.gameSeconds / 60); var sec = TT.gameSeconds % 60;
      TT.timeEl.textContent = String(min).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
      TT.activePiece = snap.piece;
      TT.gameOver = false;
      TT.paused = true;
      TT.showOverlay('PAUSED', '休息中', '', 2000);
      TT.draw();
    },

    reset: function() {
      TT.board = Array.from({length: TT.ROWS}, function() { return Array(TT.COLS).fill(0); });
      TT.score = 0; TT.scoreEl.textContent = '0';
      TT.gameSeconds = 0; TT.timeEl.textContent = '00:00';
      TT.gameOver = false; TT.paused = false; TT.overlayEl.classList.add('tt-hidden');
      TT.spawn(); TT.dropStart = Date.now(); TT.lastSecondTick = Date.now();
      cancelAnimationFrame(TT.reqId); TT.loop();
    },

    saveRecord: function(score) {
      if (score === 0) return;
      var recs = App.LS.get('ttRecords') || [];
      var d = new Date(); var ts = (d.getMonth()+1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      recs.unshift({ score: score, time: ts });
      if (recs.length > 10) recs.pop();
      App.LS.set('ttRecords', recs);
    },

    showRecords: function() {
      if(!TT.paused && !TT.gameOver) { TT.togglePause(); } 
      var recs = App.LS.get('ttRecords') || [];
      var maxScore = 0;
      recs.forEach(function(r){ if(r.score > maxScore) maxScore = r.score; });
      
      TT.recordModal.querySelector('#ttRmBestVal').textContent = maxScore;
      var listEl = TT.recordModal.querySelector('#ttRmList');
      if(recs.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;color:#999;font-size:12px;padding:20px;">还没有记录，快去拿个高分吧~</div>';
      } else {
        listEl.innerHTML = recs.map(function(r){
          return '<li class="tt-rm-item"><span class="tt-rm-score">' + r.score + '</span><span class="tt-rm-time">' + r.time + '</span></li>';
        }).join('');
      }
      TT.recordModal.classList.remove('tt-hidden');
    },

    spawn: function() {
      var typeId = Math.floor(Math.random() * 7) + 1;
      var shape = TT.SHAPES[typeId];
      TT.activePiece = { x: Math.floor(TT.COLS/2) - Math.floor(shape[0].length/2), y: 0, matrix: shape, color: TT.COLORS[typeId] };
      if (TT.collide()) { 
        TT.gameOver = true; 
        TT.saveRecord(TT.score);
        App.LS.remove('ttSaveData'); 
        TT.showOverlay('GAME OVER', '点击退出', 'danger', 3000); 
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

    // ★ 恢复清透算法，同时保持墨总的神仙色系
    drawBlock: function(x, y, color) {
      var bs = TT.BLOCK_SIZE;
      var px = x * bs; var py = y * bs; var s = bs;

      TT.ctx.fillStyle = color; 
      TT.ctx.fillRect(px, py, s, s);

      var grad = TT.ctx.createLinearGradient(px, py, px, py + s);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      TT.ctx.fillStyle = grad; 
      TT.ctx.fillRect(px, py, s, s);

      TT.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; TT.ctx.fillRect(px, py + s - 3, s, 3);
      TT.ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'; TT.ctx.fillRect(px + s - 3, py, 3, s);

      TT.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; TT.ctx.lineWidth = 1.5;
      TT.ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
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
      
      if (now - TT.lastSecondTick >= 1000) {
         TT.gameSeconds++;
         TT.lastSecondTick = now;
         var min = Math.floor(TT.gameSeconds / 60); var sec = TT.gameSeconds % 60;
         TT.timeEl.textContent = String(min).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
      }

      if (now - TT.dropStart > 700) TT.drop();
      
      TT.reqId = requestAnimationFrame(TT.loop);
    }
  };

  App.register('tetris', TT);
})();
