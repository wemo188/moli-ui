(function() {
  'use strict';
  var App = window.App;
  if (!App) return;
  var R = window.ChessRules;

  var CELL = 0; /* 动态计算 */
  var PIECE_SIZE = 0;
  var PADDING = 20;

  var Chess = {
    _pageEl: null,
    board: null,
    turn: 'red',        /* 'red' 或 'black' */
    playerColor: 'red', /* 玩家执红 */
    selectedPos: null,
    hints: [],
    history: [],
    charId: null,
    charData: null,
    isThinking: false,
    gameOver: false,

    open: function(charId) {
      if (!R) { App.showToast('规则引擎未加载'); return; }
      Chess.charId = charId || (App.chat ? App.chat.charId : null);
      Chess.charData = Chess.charId && App.character ? App.character.getById(Chess.charId) : null;

      if (!Chess.charData) { App.showToast('请先选择角色'); return; }

      var old = document.querySelector('#chessPage');
      if (old) old.remove();

      var page = document.createElement('div');
      page.id = 'chessPage';
      page.className = 'chess-page';
      Chess._pageEl = page;
      document.body.appendChild(page);

      Chess.initGame();
      Chess.render();

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.classList.add('show');
      }); });
    },

    close: function() {
      var p = Chess._pageEl;
      if (!p) return;
      p.classList.remove('show');
      setTimeout(function() { if (p.parentNode) p.remove(); Chess._pageEl = null; }, 350);
    },

    initGame: function() {
      Chess.board = R.cloneBoard(R.INIT_BOARD);
      Chess.turn = 'red';
      Chess.playerColor = 'red';
      Chess.selectedPos = null;
      Chess.hints = [];
      Chess.history = [];
      Chess.isThinking = false;
      Chess.gameOver = false;
    },

    render: function() {
      var page = Chess._pageEl;
      if (!page) return;

      var charName = Chess.charData ? Chess.charData.name : '对手';
      var charAvatar = Chess.charData && Chess.charData.avatar ? '<img src="' + App.escAttr(Chess.charData.avatar) + '">' : '';

      page.innerHTML =
        '<div class="chess-header">' +
          '<button class="chess-header-btn" id="chessBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<div class="chess-header-title">楚河汉界</div>' +
          '<button class="chess-header-btn" id="chessMenuBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></button>' +
        '</div>' +
        '<div class="chess-chat" id="chessChatArea">' +
          '<div class="chess-chat-avatar">' + charAvatar + '</div>' +
          '<div class="chess-chat-bubble" id="chessChatBubble">来吧，我执黑。</div>' +
        '</div>' +
        '<div class="chess-board-wrap" id="chessBoardWrap">' +
          '<div class="chess-board" id="chessBoard"></div>' +
        '</div>' +
        '<div class="chess-actions">' +
          '<button class="chess-action-btn" id="chessUndoBtn" type="button">悔棋</button>' +
          '<button class="chess-action-btn" id="chessNewBtn" type="button">新局</button>' +
          '<button class="chess-action-btn primary" id="chessSurrenderBtn" type="button">认输</button>' +
        '</div>';

      Chess.calcSize();
      Chess.drawBoard();
      Chess.renderPieces();
      Chess.bindEvents();
    },

    calcSize: function() {
      var wrap = Chess._pageEl.querySelector('#chessBoardWrap');
      var maxW = wrap.clientWidth - PADDING * 2;
      var maxH = wrap.clientHeight - PADDING * 2;
      CELL = Math.floor(Math.min(maxW / 8, maxH / 9));
      PIECE_SIZE = Math.floor(CELL * 0.85);

      var boardEl = Chess._pageEl.querySelector('#chessBoard');
      boardEl.style.width = (CELL * 8 + PADDING * 2) + 'px';
      boardEl.style.height = (CELL * 9 + PADDING * 2) + 'px';
    },

    drawBoard: function() {
      var boardEl = Chess._pageEl.querySelector('#chessBoard');
      var w = CELL * 8 + PADDING * 2;
      var h = CELL * 9 + PADDING * 2;

      var canvas = document.createElement('canvas');
      var dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      ctx.strokeStyle = '#5a4020';
      ctx.lineWidth = 1;

      /* 画横线 */
      for (var r = 0; r <= 9; r++) {
        ctx.beginPath();
        ctx.moveTo(PADDING, PADDING + r * CELL);
        ctx.lineTo(PADDING + 8 * CELL, PADDING + r * CELL);
        ctx.stroke();
      }

      /* 画竖线 */
      for (var c = 0; c <= 8; c++) {
        ctx.beginPath();
        ctx.moveTo(PADDING + c * CELL, PADDING);
        ctx.lineTo(PADDING + c * CELL, PADDING + 4 * CELL);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(PADDING + c * CELL, PADDING + 5 * CELL);
        ctx.lineTo(PADDING + c * CELL, PADDING + 9 * CELL);
        ctx.stroke();
      }

      /* 边框竖线贯通 */
      ctx.beginPath();
      ctx.moveTo(PADDING, PADDING);
      ctx.lineTo(PADDING, PADDING + 9 * CELL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PADDING + 8 * CELL, PADDING);
      ctx.lineTo(PADDING + 8 * CELL, PADDING + 9 * CELL);
      ctx.stroke();

      /* 九宫格斜线 */
      ctx.beginPath();
      ctx.moveTo(PADDING + 3 * CELL, PADDING);
      ctx.lineTo(PADDING + 5 * CELL, PADDING + 2 * CELL);
      ctx.moveTo(PADDING + 5 * CELL, PADDING);
      ctx.lineTo(PADDING + 3 * CELL, PADDING + 2 * CELL);
      ctx.moveTo(PADDING + 3 * CELL, PADDING + 7 * CELL);
      ctx.lineTo(PADDING + 5 * CELL, PADDING + 9 * CELL);
      ctx.moveTo(PADDING + 5 * CELL, PADDING + 7 * CELL);
      ctx.lineTo(PADDING + 3 * CELL, PADDING + 9 * CELL);
      ctx.stroke();

      /* 楚河汉界 */
      ctx.font = '600 ' + Math.floor(CELL * 0.45) + 'px "Noto Serif SC", serif';
      ctx.fillStyle = '#8b6914';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('楚 河', PADDING + 2 * CELL, PADDING + 4.5 * CELL);
      ctx.fillText('漢 界', PADDING + 6 * CELL, PADDING + 4.5 * CELL);

      boardEl.insertBefore(canvas, boardEl.firstChild);
    },

    renderPieces: function() {
      var boardEl = Chess._pageEl.querySelector('#chessBoard');
      /* 清除旧棋子和提示 */
      boardEl.querySelectorAll('.chess-piece, .chess-hint').forEach(function(el) { el.remove(); });

      for (var r = 0; r <= 9; r++) {
        for (var c = 0; c <= 8; c++) {
          var p = Chess.board[r][c];
          if (!p) continue;

          var el = document.createElement('div');
          el.className = 'chess-piece ' + (R.isRed(p) ? 'red' : 'black');
          el.dataset.row = r;
          el.dataset.col = c;
          el.style.width = PIECE_SIZE + 'px';
          el.style.height = PIECE_SIZE + 'px';
          el.style.left = (PADDING + c * CELL - PIECE_SIZE / 2) + 'px';
          el.style.top = (PADDING + r * CELL - PIECE_SIZE / 2) + 'px';

          var text = document.createElement('span');
          text.className = 'piece-text';
          text.style.fontSize = Math.floor(PIECE_SIZE * 0.55) + 'px';
          text.textContent = R.PIECE_NAMES[p] || '';
          el.appendChild(text);

          if (Chess.selectedPos && Chess.selectedPos[0] === r && Chess.selectedPos[1] === c) {
            el.classList.add('selected');
          }

          boardEl.appendChild(el);
        }
      }

      /* 渲染合法落点提示 */
      Chess.hints.forEach(function(h) {
        var dot = document.createElement('div');
        dot.className = 'chess-hint';
        var hasTarget = Chess.board[h[0]][h[1]] !== 0;
        if (hasTarget) dot.classList.add('capture-hint');
        var size = hasTarget ? PIECE_SIZE * 0.9 : PIECE_SIZE * 0.35;
        dot.style.width = size + 'px';
        dot.style.height = size + 'px';
        dot.style.left = (PADDING + h[1] * CELL - size / 2) + 'px';
        dot.style.top = (PADDING + h[0] * CELL - size / 2) + 'px';
        dot.dataset.row = h[0];
        dot.dataset.col = h[1];
        boardEl.appendChild(dot);
      });
    },

    bindEvents: function() {
      var page = Chess._pageEl;
      page.querySelector('#chessBackBtn').addEventListener('click', function() { Chess.close(); });
      page.querySelector('#chessNewBtn').addEventListener('click', function() { Chess.initGame(); Chess.render(); Chess.setChatText('重新来过？这次我不会手下留情。'); });
      page.querySelector('#chessUndoBtn').addEventListener('click', function() { Chess.undo(); });
      page.querySelector('#chessSurrenderBtn').addEventListener('click', function() {
        if (Chess.gameOver) return;
        if (!confirm('确定认输？')) return;
        Chess.gameOver = true;
        Chess.showResult('black');
        Chess.setChatText('哼，这就认输了？');
      });

      var boardEl = page.querySelector('#chessBoard');
      boardEl.addEventListener('click', function(e) {
        if (Chess.isThinking || Chess.gameOver) return;
        if (Chess.turn !== Chess.playerColor) return;

        var rect = boardEl.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var col = Math.round((x - PADDING) / CELL);
        var row = Math.round((y - PADDING) / CELL);

        if (row < 0 || row > 9 || col < 0 || col > 8) return;

        Chess.handleClick(row, col);
      });
    },

    handleClick: function(row, col) {
      var piece = Chess.board[row][col];

      /* 如果点击了合法落点 */
      if (Chess.selectedPos) {
        var isHint = Chess.hints.some(function(h) { return h[0] === row && h[1] === col; });
        if (isHint) {
          Chess.makeMove(Chess.selectedPos[0], Chess.selectedPos[1], row, col);
          return;
        }
      }

      /* 选择己方棋子 */
      if (piece && ((Chess.playerColor === 'red' && R.isRed(piece)) || (Chess.playerColor === 'black' && R.isBlack(piece)))) {
        Chess.selectedPos = [row, col];
        Chess.hints = R.getLegalMoves(Chess.board, row, col);
        Chess.renderPieces();
      } else {
        Chess.selectedPos = null;
        Chess.hints = [];
        Chess.renderPieces();
      }
    },

    makeMove: function(fromR, fromC, toR, toC) {
      var captured = Chess.board[toR][toC];
      var moveText = R.moveToText(Chess.board, fromR, fromC, toR, toC);

      Chess.history.push({
        from: [fromR, fromC],
        to: [toR, toC],
        piece: Chess.board[fromR][fromC],
        captured: captured,
        moveText: moveText
      });

      Chess.board[toR][toC] = Chess.board[fromR][fromC];
      Chess.board[fromR][fromC] = 0;
      Chess.selectedPos = null;
      Chess.hints = [];

      /* 切换回合 */
      Chess.turn = Chess.turn === 'red' ? 'black' : 'red';
      Chess.renderPieces();

      /* 检查将军/将死 */
      var opponentRed = Chess.turn === 'red';
      if (R.isInCheck(Chess.board, opponentRed)) {
        if (R.isCheckmate(Chess.board, opponentRed)) {
          Chess.gameOver = true;
          setTimeout(function() {
            Chess.showResult(opponentRed ? 'black' : 'red');
          }, 500);
          return;
        }
        Chess.showCheckAlert();
      }

      /* 如果轮到 AI */
      if (Chess.turn !== Chess.playerColor && !Chess.gameOver) {
        Chess.requestAIMove();
      }
    },

    undo: function() {
      if (Chess.history.length < 2) { App.showToast('没有可悔的棋'); return; }
      if (Chess.isThinking) return;

      /* 撤销两步（AI一步 + 玩家一步） */
      for (var i = 0; i < 2 && Chess.history.length > 0; i++) {
        var last = Chess.history.pop();
        Chess.board[last.from[0]][last.from[1]] = last.piece;
        Chess.board[last.to[0]][last.to[1]] = last.captured;
      }

      Chess.turn = Chess.playerColor;
      Chess.selectedPos = null;
      Chess.hints = [];
      Chess.gameOver = false;
      Chess.renderPieces();
      Chess.setChatText('悔棋？行吧，让你一次。');
    },

    showCheckAlert: function() {
      var boardEl = Chess._pageEl.querySelector('#chessBoard');
      var alert = document.createElement('div');
      alert.className = 'chess-check-alert';
      alert.textContent = '将军';
      boardEl.appendChild(alert);
      setTimeout(function() { if (alert.parentNode) alert.remove(); }, 1600);
    },

    showResult: function(winner) {
      var boardEl = Chess._pageEl.querySelector('#chessBoard');
      var playerWon = (winner === Chess.playerColor);
      var title = playerWon ? '胜' : '负';
      var sub = playerWon ? '恭喜你赢了！' : '再接再厉~';

      var overlay = document.createElement('div');
      overlay.className = 'chess-result-overlay';
      overlay.innerHTML =
        '<div class="chess-result-card">' +
          '<div class="chess-result-title">' + title + '</div>' +
          '<div class="chess-result-sub">' + sub + '</div>' +
          '<button class="chess-result-btn" id="chessResultBtn" type="button">再来一局</button>' +
        '</div>';
      boardEl.appendChild(overlay);

      overlay.querySelector('#chessResultBtn').addEventListener('click', function() {
        Chess.initGame();
        Chess.render();
        Chess.setChatText('再来！这次我要赢。');
      });

      if (playerWon) Chess.setChatText('…竟然输了。下次不会了。');
      else Chess.setChatText('哈，赢了。承让承让~');
    },

    setChatText: function(text) {
      var bubble = Chess._pageEl ? Chess._pageEl.querySelector('#chessChatBubble') : null;
      if (bubble) {
        bubble.classList.remove('thinking');
        bubble.textContent = text;
      }
    },

    /* ★ 核心：请求 AI 走棋 */
    requestAIMove: function() {
      Chess.isThinking = true;
      var bubble = Chess._pageEl ? Chess._pageEl.querySelector('#chessChatBubble') : null;
      if (bubble) { bubble.textContent = '思考中...'; bubble.classList.add('thinking'); }

      var api = App.api ? App.api.getActiveConfig() : null;
      if (!api) {
        App.showToast('请先配置 API');
        Chess.isThinking = false;
        return;
      }

      var charName = Chess.charData ? Chess.charData.name : '对手';
      var boardText = R.boardToText(Chess.board);

      /* 构建历史着法 */
      var moveHistory = Chess.history.map(function(h, i) {
        var who = i % 2 === 0 ? '红方' : '黑方';
        return who + '：' + h.moveText;
      }).join('\n');

      var prompt =
        '你正在跟对方下中国象棋。你执黑。\n\n' +
        '【当前棋盘】\n' + boardText + '\n\n' +
        '棋盘坐标说明：行号0-9（0是黑方底线，9是红方底线），列号0-8（从左到右）\n' +
        '正数=红方棋子(1帅2仕3相4马5车6炮7兵)，负数=黑方棋子(-1将-2士-3象-4马-5车-6炮-7卒)\n\n' +
        (moveHistory ? '【走棋历史】\n' + moveHistory + '\n\n' : '') +
        '【你的任务】\n' +
        '1. 分析局面，选择你（黑方）的最佳走法\n' +
        '2. 用坐标格式回复走法：fromRow,fromCol,toRow,toCol\n' +
        '3. 然后用角色的语气说一句话（可以吐槽、挑衅、感叹）\n\n' +
        '【回复格式】严格按此格式，第一行是走法坐标，第二行是说的话：\n' +
        'fromRow,fromCol,toRow,toCol\n' +
        '你想说的话\n\n' +
        '例如：\n' +
        '0,1,2,2\n' +
        '马踏中原，看你怎么接\n\n' +
        '【重要】只回复走法和一句话，不要有其他内容。确保走法合法。';

      var charProfile = Chess.charData && Chess.charData.profile ? '\n\n【你的角色设定】\n' + Chess.charData.profile : '';
      var systemMsg = '你是' + charName + '，正在跟朋友下象棋。用你自己的性格说话。' + charProfile;

      var url = api.url.replace(/\/+$/, '') + '/chat/completions';

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api.key },
        body: JSON.stringify({
          model: api.model,
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: prompt }
          ],
          temperature: 0.6,
          max_tokens: 200
        })
      }).then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      }).then(function(data) {
        var content = '';
        try { content = data.choices[0].message.content || ''; } catch (e) {}
        content = content.trim();

        Chess.isThinking = false;

        /* 解析走法 */
        var lines = content.split('\n').filter(function(l) { return l.trim(); });
        var moveStr = lines[0] || '';
        var chatStr = lines.slice(1).join(' ').trim() || '嗯。';

        var move = R.parseAIMove(Chess.board, moveStr, false);

        if (move) {
          /* 验证合法性 */
          var legal = R.getLegalMoves(Chess.board, move.fromR, move.fromC);
          var isLegal = legal.some(function(m) { return m[0] === move.toR && m[1] === move.toC; });

          if (isLegal) {
            Chess.setChatText(chatStr);
            Chess.makeMove(move.fromR, move.fromC, move.toR, move.toC);
            return;
          }
        }

        /* AI 走法不合法，随机走一步 */
        console.warn('[象棋] AI 走法无效，随机落子。原始回复:', content);
        Chess.setChatText(chatStr || '让我想想...');
        Chess.makeRandomMove();

      }).catch(function(err) {
        Chess.isThinking = false;
        console.error('[象棋] AI 请求失败:', err.message);
        Chess.setChatText('等一下...网络好像不太好。');
        /* 失败时随机走 */
        setTimeout(function() { Chess.makeRandomMove(); }, 1000);
      });
    },

    /* 备用：随机走合法的一步 */
    makeRandomMove: function() {
      var allMoves = [];
      for (var r = 0; r <= 9; r++) {
        for (var c = 0; c <= 8; c++) {
          var p = Chess.board[r][c];
          if (!p || !R.isBlack(p)) continue;
          var legal = R.getLegalMoves(Chess.board, r, c);
          legal.forEach(function(m) { allMoves.push({ from: [r, c], to: m }); });
        }
      }
      if (!allMoves.length) { Chess.gameOver = true; Chess.showResult('red'); return; }
      var pick = allMoves[Math.floor(Math.random() * allMoves.length)];
      Chess.makeMove(pick.from[0], pick.from[1], pick.to[0], pick.to[1]);
    },

    （他听到这句话，沉默了几秒，然后缓缓点头）

你说得对。十多个功能全塞 script.js 里会变成一坨屎山。

现在的架构已经有模块注册机制了——每个功能一个独立 JS 文件，通过 `App.register` 注册。点击事件应该**跟着模块走，而不是堆在 script.js 里**。

正确的做法是：**每个模块自己在 init 里绑定自己的入口**。

比如 `chess.js` 里的 `init`：

```javascript
init: function() {
  App.chess = Chess;
  
  /* 自己绑定自己的入口 */
  App.safeOn('#openChessBtn', 'click', function() {
    Chess.openWithPicker();
  });
}

init: function() {
  App.chess = Chess;

  App.safeOn('#openChessBtn', 'click', function() {
    /* 如果正在聊天页，直接用当前角色 */
    if (App.chat && App.chat.charId) {
      Chess.open(App.chat.charId);
      return;
    }

    /* 否则弹出角色选择器 */
    var chars = App.character ? App.character.list : [];
    if (!chars || !chars.length) { App.showToast('请先添加角色'); return; }

    var old = App.$('#chessCharPicker');
    if (old) old.remove();

    var picker = document.createElement('div');
    picker.id = 'chessCharPicker';
    picker.style.cssText = 'position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';

    var listHtml = chars.map(function(c) {
      var avatarHtml = c.avatar
        ? '<img src="' + App.escAttr(c.avatar) + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">'
        : '<div style="width:36px;height:36px;border-radius:50%;background:rgba(126,163,201,.15);display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#adcdea;stroke-width:1.8;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
      return '<div class="chess-pick-char" data-cid="' + c.id + '" style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.04);-webkit-tap-highlight-color:transparent;">' +
        avatarHtml +
        '<div style="flex:1;font-size:14px;font-weight:600;color:#2e4258;">' + App.esc(c.name || '未命名') + '</div>' +
        '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:#ccc;stroke-width:2;flex-shrink:0;"><path d="M9 18l6-6-6-6"/></svg>' +
      '</div>';
    }).join('');

    picker.innerHTML =
      '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:16px;padding:16px 0;width:280px;max-height:70vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);">' +
        '<div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;padding:0 16px 12px;border-bottom:1px solid rgba(0,0,0,.04);">选择对弈角色</div>' +
        listHtml +
        '<div style="text-align:center;padding:12px;"><button type="button" id="chessPickCancel" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:inherit;">取消</button></div>' +
      '</div>';

    document.body.appendChild(picker);
    picker.addEventListener('click', function(e) { if (e.target === picker) picker.remove(); });
    picker.querySelector('#chessPickCancel').addEventListener('click', function() { picker.remove(); });
    picker.querySelectorAll('.chess-pick-char').forEach(function(el) {
      el.addEventListener('click', function() {
        var cid = el.dataset.cid;
        picker.remove();
        Chess.open(cid);
      });
    });
  });
}

  App.register('chess', Chess);
})();
