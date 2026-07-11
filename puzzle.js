
/* ================================================
   琉璃拼图系统 (puzzle.js)
   ================================================ */
(function(){
  'use strict';
  var App = window.App; if(!App) return;

  var Puz = {
    core: null, winMsg: null, emptyState: null,
    size: 3,
    tileSize: 0,
    tiles: [],
    emptyPos: {x:0, y:0},
    playing: false,
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

      Puz.buildInto(panel.querySelector('#pzGameContent'));
    },

    buildInto: function(container) {
      if(!container) return;
      container.innerHTML = '';

      var wrap = document.createElement('div');
      wrap.className = 'pz-wrap';

      var toolbar = document.createElement('div');
      toolbar.className = 'pz-toolbar';

      var uploadBtn = document.createElement('div');
      uploadBtn.className = 'pz-btn';
      uploadBtn.textContent = '选择图案';
      uploadBtn.onclick = function() {
        if(App.showImagePicker) {
          App.showImagePicker({
            title: '上传拼图底图',
            callback: function(src) {
              if(src) {
                Puz.imgSrc = src;
                App.LS.set('pzCustomImg', src);
                Puz.buildBoard();
              }
            }
          });
        }
      };

      var sizeSelect = document.createElement('select');
      sizeSelect.className = 'pz-select';
      sizeSelect.innerHTML = 
        '<option value="3">3x3</option>' +
        '<option value="4">4x4</option>' +
        '<option value="5">5x5</option>';
      sizeSelect.value = String(Puz.size);
      sizeSelect.onchange = function() {
        Puz.size = parseInt(this.value);
        Puz.buildBoard();
      };

      var startBtn = document.createElement('div');
      startBtn.className = 'pz-btn primary';
      startBtn.textContent = '打乱';
      startBtn.onclick = function() { Puz.shuffle(); };

      toolbar.appendChild(uploadBtn);
      toolbar.appendChild(sizeSelect);
      toolbar.appendChild(startBtn);

      var board = document.createElement('div');
      board.className = 'pz-board';

      var core = document.createElement('div');
      core.className = 'pz-core';
      Puz.core = core;

      var winMsg = document.createElement('div');
      winMsg.className = 'pz-win';
      winMsg.innerHTML = '<h3>记忆复原</h3><span>华彩重现，恭喜通关 ✨</span>';
      Puz.winMsg = winMsg;

      var emptyState = document.createElement('div');
      emptyState.className = 'pz-empty';
      emptyState.innerHTML = 
        '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
        '<span>请先选择图案</span>';
      Puz.emptyState = emptyState;

      core.appendChild(emptyState);
      core.appendChild(winMsg);
      board.appendChild(core);
      wrap.appendChild(toolbar);
      wrap.appendChild(board);
      container.appendChild(wrap);

      Puz.buildBoard();
    },

    buildBoard: function() {
      Puz.playing = false;
      if(Puz.winMsg) Puz.winMsg.classList.remove('show');

      var oldTiles = Puz.core.querySelectorAll('.pz-tile');
      oldTiles.forEach(function(el){ el.remove(); });

      if(!Puz.imgSrc) {
        if(Puz.emptyState) Puz.emptyState.style.display = 'flex';
        return;
      }

      if(Puz.emptyState) Puz.emptyState.style.display = 'none';

      var coreSize = 280;
      Puz.tileSize = coreSize / Puz.size;
      Puz.tiles = [];

      var total = Puz.size * Puz.size;
      Puz.emptyPos = { x: Puz.size - 1, y: Puz.size - 1 };

      for(var i = 0; i < total - 1; i++){
        var t = document.createElement('div');
        t.className = 'pz-tile';
        var tx = i % Puz.size, ty = Math.floor(i / Puz.size);

        t.style.width = Puz.tileSize + 'px';
        t.style.height = Puz.tileSize + 'px';
        t.style.backgroundImage = 'url(' + Puz.imgSrc + ')';
        t.style.backgroundSize = coreSize + 'px ' + coreSize + 'px';
        t.style.backgroundPosition = '-' + (tx * Puz.tileSize) + 'px -' + (ty * Puz.tileSize) + 'px';

        t.dataset.idx = i;
        t.style.transform = 'translate(' + (tx * Puz.tileSize) + 'px, ' + (ty * Puz.tileSize) + 'px)';

        Puz.tiles.push({ el: t, targetX: tx, targetY: ty, x: tx, y: ty });
        Puz.core.appendChild(t);

        (function(idx){
          t.addEventListener('click', function(){ Puz.moveTile(idx); });
        })(i);
      }
    },

    moveTile: function(idx) {
      if(!Puz.playing) return;
      var t = Puz.tiles[idx];
      var dx = Math.abs(t.x - Puz.emptyPos.x);
      var dy = Math.abs(t.y - Puz.emptyPos.y);

      if((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        var tempX = t.x, tempY = t.y;
        t.x = Puz.emptyPos.x;
        t.y = Puz.emptyPos.y;
        Puz.emptyPos.x = tempX;
        Puz.emptyPos.y = tempY;

        t.el.style.transform = 'translate(' + (t.x * Puz.tileSize) + 'px, ' + (t.y * Puz.tileSize) + 'px)';
        Puz.checkWin();
      }
    },

    shuffle: function() {
      if(!Puz.imgSrc) {
        App.showToast('请先上传图片');
        return;
      }

      Puz.playing = true;
      if(Puz.winMsg) Puz.winMsg.classList.remove('show');

      var steps = Puz.size * Puz.size * 30;
      for(var i = 0; i < steps; i++){
        var movable = [];
        for(var j = 0; j < Puz.tiles.length; j++){
          var t = Puz.tiles[j];
          var dx = Math.abs(t.x - Puz.emptyPos.x);
          var dy = Math.abs(t.y - Puz.emptyPos.y);
          if((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) movable.push(t);
        }
        var pick = movable[Math.floor(Math.random() * movable.length)];
        var tx = pick.x, ty = pick.y;
        pick.x = Puz.emptyPos.x;
        pick.y = Puz.emptyPos.y;
        Puz.emptyPos.x = tx;
        Puz.emptyPos.y = ty;
      }

      for(var k = 0; k < Puz.tiles.length; k++){
        var t2 = Puz.tiles[k];
        t2.el.style.transform = 'translate(' + (t2.x * Puz.tileSize) + 'px, ' + (t2.y * Puz.tileSize) + 'px)';
      }
    },

    checkWin: function() {
      for(var i = 0; i < Puz.tiles.length; i++){
        var t = Puz.tiles[i];
        if(t.x !== t.targetX || t.y !== t.targetY) return;
      }
      Puz.playing = false;
      setTimeout(function(){ if(Puz.winMsg) Puz.winMsg.classList.add('show'); }, 300);
    }
  };

  App.register('puzzle', Puz);
})();
