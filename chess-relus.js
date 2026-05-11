(function() {
  'use strict';
  window.ChessRules = {};

  /*
   * 棋盘坐标：board[row][col]
   * row: 0-9 (0=黑方底线, 9=红方底线)
   * col: 0-8 (左到右)
   * 
   * 棋子编码：
   * 红方(正数): 1=帅 2=仕 3=相 4=马 5=车 6=炮 7=兵
   * 黑方(负数): -1=将 -2=士 -3=象 -4=马 -5=车 -6=炮 -7=卒
   * 0=空
   */

  var INIT_BOARD = [
    [-5, -4, -3, -2, -1, -2, -3, -4, -5],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 0, -6,  0,  0,  0,  0,  0, -6,  0],
    [-7,  0, -7,  0, -7,  0, -7,  0, -7],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 7,  0,  7,  0,  7,  0,  7,  0,  7],
    [ 0,  6,  0,  0,  0,  0,  0,  6,  0],
    [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
    [ 5,  4,  3,  2,  1,  2,  3,  4,  5]
  ];

  var PIECE_NAMES = {
    1: '帅', 2: '仕', 3: '相', 4: '馬', 5: '車', 6: '炮', 7: '兵',
    '-1': '将', '-2': '士', '-3': '象', '-4': '馬', '-5': '車', '-6': '炮', '-7': '卒'
  };

  function cloneBoard(b) {
    return b.map(function(row) { return row.slice(); });
  }

  function isRed(piece) { return piece > 0; }
  function isBlack(piece) { return piece < 0; }
  function isSameTeam(a, b) { return (a > 0 && b > 0) || (a < 0 && b < 0); }
  function inBoard(r, c) { return r >= 0 && r <= 9 && c >= 0 && c <= 8; }

  /* 九宫格判定 */
  function inPalace(r, c, red) {
    if (c < 3 || c > 5) return false;
    if (red) return r >= 7 && r <= 9;
    return r >= 0 && r <= 2;
  }

  /* 获取某颗棋子的所有合法移动（不考虑自杀） */
  function getRawMoves(board, row, col) {
    var piece = board[row][col];
    if (!piece) return [];
    var moves = [];
    var red = isRed(piece);
    var type = Math.abs(piece);

    switch (type) {
      case 1: /* 将/帅 */
        [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d) {
          var nr = row + d[0], nc = col + d[1];
          if (inPalace(nr, nc, red) && !isSameTeam(piece, board[nr][nc])) moves.push([nr, nc]);
        });
        /* 将帅对面（飞将） */
        var kingCol = col;
        var dir = red ? -1 : 1;
        var r = row + dir;
        while (inBoard(r, kingCol)) {
          if (board[r][kingCol] !== 0) {
            var target = board[r][kingCol];
            if (Math.abs(target) === 1 && !isSameTeam(piece, target)) moves.push([r, kingCol]);
            break;
          }
          r += dir;
        }
        break;

      case 2: /* 仕/士 */
        [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(d) {
          var nr = row + d[0], nc = col + d[1];
          if (inPalace(nr, nc, red) && !isSameTeam(piece, board[nr][nc])) moves.push([nr, nc]);
        });
        break;

      case 3: /* 相/象 */
        [[-2,-2],[-2,2],[2,-2],[2,2]].forEach(function(d) {
          var nr = row + d[0], nc = col + d[1];
          var er = row + d[0]/2, ec = col + d[1]/2; /* 象眼 */
          if (!inBoard(nr, nc)) return;
          /* 不能过河 */
          if (red && nr < 5) return;
          if (!red && nr > 4) return;
          if (board[er][ec] !== 0) return; /* 塞象眼 */
          if (!isSameTeam(piece, board[nr][nc])) moves.push([nr, nc]);
        });
        break;

      case 4: /* 马 */
        [[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]].forEach(function(d) {
          var nr = row + d[0], nc = col + d[1];
          if (!inBoard(nr, nc)) return;
          /* 蹩马腿 */
          var legR, legC;
          if (Math.abs(d[0]) === 2) { legR = row + d[0]/2; legC = col; }
          else { legR = row; legC = col + d[1]/2; }
          if (board[legR][legC] !== 0) return;
          if (!isSameTeam(piece, board[nr][nc])) moves.push([nr, nc]);
        });
        break;

      case 5: /* 车 */
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d) {
          var nr = row + d[0], nc = col + d[1];
          while (inBoard(nr, nc)) {
            if (board[nr][nc] === 0) { moves.push([nr, nc]); }
            else {
              if (!isSameTeam(piece, board[nr][nc])) moves.push([nr, nc]);
              break;
            }
            nr += d[0]; nc += d[1];
          }
        });
        break;

      case 6: /* 炮 */
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d) {
          var nr = row + d[0], nc = col + d[1];
          var jumped = false;
          while (inBoard(nr, nc)) {
            if (!jumped) {
              if (board[nr][nc] === 0) moves.push([nr, nc]);
              else jumped = true;
            } else {
              if (board[nr][nc] !== 0) {
                if (!isSameTeam(piece, board[nr][nc])) moves.push([nr, nc]);
                break;
              }
            }
            nr += d[0]; nc += d[1];
          }
        });
        break;

      case 7: /* 兵/卒 */
        if (red) {
          /* 红兵：未过河只能前进，过河可左右 */
          if (row - 1 >= 0 && !isSameTeam(piece, board[row-1][col])) moves.push([row-1, col]);
          if (row <= 4) { /* 已过河 */
            if (col - 1 >= 0 && !isSameTeam(piece, board[row][col-1])) moves.push([row, col-1]);
            if (col + 1 <= 8 && !isSameTeam(piece, board[row][col+1])) moves.push([row, col+1]);
          }
        } else {
          if (row + 1 <= 9 && !isSameTeam(piece, board[row+1][col])) moves.push([row+1, col]);
          if (row >= 5) {
            if (col - 1 >= 0 && !isSameTeam(piece, board[row][col-1])) moves.push([row, col-1]);
            if (col + 1 <= 8 && !isSameTeam(piece, board[row][col+1])) moves.push([row, col+1]);
          }
        }
        break;
    }

    return moves;
  }

  /* 找到将/帅的位置 */
  function findKing(board, red) {
    var target = red ? 1 : -1;
    for (var r = 0; r <= 9; r++) {
      for (var c = 0; c <= 8; c++) {
        if (board[r][c] === target) return [r, c];
      }
    }
    return null;
  }

  /* 判断某方是否被将军 */
  function isInCheck(board, red) {
    var kingPos = findKing(board, red);
    if (!kingPos) return true;
    for (var r = 0; r <= 9; r++) {
      for (var c = 0; c <= 8; c++) {
        var p = board[r][c];
        if (!p) continue;
        if (red && isRed(p)) continue;
        if (!red && isBlack(p)) continue;
        var moves = getRawMoves(board, r, c);
        for (var i = 0; i < moves.length; i++) {
          if (moves[i][0] === kingPos[0] && moves[i][1] === kingPos[1]) return true;
        }
      }
    }
    return false;
  }

  /* 获取合法走法（排除自杀） */
  function getLegalMoves(board, row, col) {
    var piece = board[row][col];
    if (!piece) return [];
    var red = isRed(piece);
    var raw = getRawMoves(board, row, col);
    var legal = [];

    raw.forEach(function(m) {
      var nb = cloneBoard(board);
      nb[m[0]][m[1]] = nb[row][col];
      nb[row][col] = 0;
      if (!isInCheck(nb, red)) legal.push(m);
    });

    return legal;
  }

  /* 判断某方是否被将死或困毙 */
  function isCheckmate(board, red) {
    for (var r = 0; r <= 9; r++) {
      for (var c = 0; c <= 8; c++) {
        var p = board[r][c];
        if (!p) continue;
        if (red && !isRed(p)) continue;
        if (!red && !isBlack(p)) continue;
        if (getLegalMoves(board, r, c).length > 0) return false;
      }
    }
    return true;
  }

  /* 坐标转中文着法（简化版） */
  function moveToText(board, fromR, fromC, toR, toC) {
    var piece = board[fromR][fromC];
    if (!piece) return '';
    var name = PIECE_NAMES[piece] || '?';
    var red = isRed(piece);

    /* 列号：红方从右到左1-9，黑方从左到右1-9 */
    var fromCol = red ? (9 - fromC) : (fromC + 1);
    var toCol = red ? (9 - toC) : (toC + 1);

    var action = '';
    if (fromR === toR) {
      action = '平' + toCol;
    } else if ((red && toR < fromR) || (!red && toR > fromR)) {
      var dist = Math.abs(toR - fromR);
      if (Math.abs(piece) === 4 || Math.abs(piece) === 3 || Math.abs(piece) === 2) {
        action = '进' + toCol;
      } else {
        action = '进' + dist;
      }
    } else {
      var dist2 = Math.abs(toR - fromR);
      if (Math.abs(piece) === 4 || Math.abs(piece) === 3 || Math.abs(piece) === 2) {
        action = '退' + toCol;
      } else {
        action = '退' + dist2;
      }
    }

    return name + fromCol + action;
  }

  /* 序列化棋盘为文本（发给AI用） */
  function boardToText(board) {
    var lines = [];
    lines.push('  ａｂｃｄｅｆｇｈｉ');
    for (var r = 0; r <= 9; r++) {
      var row = (r) + ' ';
      for (var c = 0; c <= 8; c++) {
        var p = board[r][c];
        if (p === 0) row += '．';
        else row += PIECE_NAMES[p] || '？';
      }
      lines.push(row);
    }
    return lines.join('\n');
  }

  /* 解析AI返回的走法文本 */
  function parseAIMove(board, text, red) {
    /* 尝试匹配坐标格式：如 (0,4)→(1,4) 或 0,4-1,4 */
    var coordMatch = text.match(/(\d)[,，](\d)\s*[→\->]+\s*(\d)[,，](\d)/);
    if (coordMatch) {
      return {
        fromR: parseInt(coordMatch[1]),
        fromC: parseInt(coordMatch[2]),
        toR: parseInt(coordMatch[3]),
        toC: parseInt(coordMatch[4])
      };
    }

    /* 尝试匹配简单格式：fromRow,fromCol,toRow,toCol */
    var simpleMatch = text.match(/(\d)\s*(\d)\s*(\d)\s*(\d)/);
    if (simpleMatch) {
      return {
        fromR: parseInt(simpleMatch[1]),
        fromC: parseInt(simpleMatch[2]),
        toR: parseInt(simpleMatch[3]),
        toC: parseInt(simpleMatch[4])
      };
    }

    return null;
  }

  /* 导出 */
  ChessRules.INIT_BOARD = INIT_BOARD;
  ChessRules.PIECE_NAMES = PIECE_NAMES;
  ChessRules.cloneBoard = cloneBoard;
  ChessRules.isRed = isRed;
  ChessRules.isBlack = isBlack;
  ChessRules.getLegalMoves = getLegalMoves;
  ChessRules.isInCheck = isInCheck;
  ChessRules.isCheckmate = isCheckmate;
  ChessRules.moveToText = moveToText;
  ChessRules.boardToText = boardToText;
  ChessRules.parseAIMove = parseAIMove;
  ChessRules.findKing = findKing;
})();
