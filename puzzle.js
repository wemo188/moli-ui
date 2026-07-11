
/* ================================================
   🌟 琉璃拼图魔法系统
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
    
    // 正式发版标准：初始底图必须为空！
    imgSrc: App.LS.get('pzCustomImg') || '',

    init: function() {
      var card = document.getElementById('puzzleCard');
      if(!card) return;
      card.innerHTML = '';

      var wrap = document.createElement('div');
      wrap.className = 'pz-wrap';

      // ======== 工具栏 ========
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
        } else {
           App.showToast('全局选图组件未唤醒');
        }
      };

      var sizeSelect = document.createElement('select');
      sizeSelect.className = 'pz-select';
      sizeSelect.innerHTML = 
        '<option value="3">3x3 难度</option>' +
        '<option value="4">4x4 挑战</option>' +
        '<option value="5">5x5 极限</option>';
      sizeSelect.onchange = function() {
        Puz.size = parseInt(this.value);
        Puz.buildBoard();
      };

      var startBtn = document.createElement('div');
      startBtn.className = 'pz-btn primary';
      startBtn.textContent = '开始打乱';
      startBtn.onclick = function() { Puz.shuffle(); };

      toolbar.appendChild(uploadBtn);
      toolbar.appendChild(sizeSelect);
      toolbar.appendChild(startBtn);

      // ======== 拼图核心舞台 ========
      var board = document.createElement('div');
      board.className = 'pz-board';

      var core = document.createElement('div');
      core.className = 'pz-core';
      this.core = core;

      // 通用商业化通关文案
      var winMsg = document.createElement('div');
      winMsg.className = 'pz-win';
      winMsg.innerHTML = '<h3>记忆复原</h3><span>华彩重现，恭喜通关 ✨</span>';
      this.winMsg = winMsg;

      // 干净的空状态提示（等待用户自己赋魂）
      var emptyState = document.createElement('div');
      emptyState.className = 'pz-empty';
      emptyState.innerHTML = 
        '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
        '<span>请先选择图案</span>';
      this.emptyState = emptyState;

      core.appendChild(emptyState);
      core.appendChild(winMsg);
      board.appendChild(core);
      wrap.appendChild(toolbar);
      wrap.appendChild(board);
      card.appendChild(wrap);

      this.buildBoard(); 
    },

    buildBoard: function() {
      this.playing = false;
      this.winMsg.classList.remove('show');
      
      // 暴力清理上一局留下的瓷砖碎片
      var oldTiles = this.core.querySelectorAll('.pz-tile');
      oldTiles.forEach(function(el){ el.remove(); });

      // 如果连图都没有，就显示引导用户上传的界面
      if(!this.imgSrc) {
        this.emptyState.style.display = 'flex';
        return;
      }
      
      // 如果有图，就隐藏提示，切瓷砖！
      this.emptyState.style.display = 'none';

      var coreSize = 280; 
      this.tileSize = coreSize / this.size;
      this.tiles = [];

      var total = this.size * this.size;
      this.emptyPos = { x: this.size - 1, y: this.size - 1 };

      for(var i=0; i<total-1; i++){
        var t = document.createElement('div');
        t.className = 'pz-tile';
        var tx = i % this.size, ty = Math.floor(i / this.size);
        
        t.style.width = this.tileSize + 'px';
        t.style.height = this.tileSize + 'px';
        t.style.backgroundImage = 'url(' + this.imgSrc + ')';
        t.style.backgroundSize = coreSize + 'px ' + coreSize + 'px'; 
        t.style.backgroundPosition = '-' + (tx*this.tileSize) + 'px -' + (ty*this.tileSize) + 'px'; 
        
        t.dataset.idx = i;
        t.style.transform = 'translate(' + (tx*this.tileSize) + 'px, ' + (ty*this.tileSize) + 'px)';

        this.tiles.push({ el: t, targetX: tx, targetY: ty, x: tx, y: ty });
        this.core.appendChild(t);

        var self = this;
        t.addEventListener('click', (function(idx) {
          return function() { self.moveTile(idx); };
        })(i));
      }
    },

    moveTile: function(idx) {
      if(!this.playing) return;
      var t = this.tiles[idx];
      var dx = Math.abs(t.x - this.emptyPos.x);
      var dy = Math.abs(t.y - this.emptyPos.y);
      
      if((dx===1 && dy===0) || (dx===0 && dy===1)) {
        var tempX = t.x, tempY = t.y;
        t.x = this.emptyPos.x; t.y = this.emptyPos.y;
        this.emptyPos.x = tempX; this.emptyPos.y = tempY;
        
        t.el.style.transform = 'translate(' + (t.x*this.tileSize) + 'px, ' + (t.y*this.tileSize) + 'px)';
        this.checkWin();
      }
    },

    shuffle: function() {
      // 产品逻辑严谨拦截：没传图点什么打乱！
      if(!this.imgSrc) {
        App.showToast('得先上传图片才能打乱哦');
        return;
      }

      this.playing = true;
      this.winMsg.classList.remove('show');
      
      var steps = this.size * this.size * 30; 
      for(var i=0; i<steps; i++){
        var movable = [];
        for(var j=0; j<this.tiles.length; j++){
          var t = this.tiles[j];
          var dx = Math.abs(t.x - this.emptyPos.x);
          var dy = Math.abs(t.y - this.emptyPos.y);
          if((dx===1 && dy===0) || (dx===0 && dy===1)) movable.push(t);
        }
        var pick = movable[Math.floor(Math.random()*movable.length)];
        var tx = pick.x, ty = pick.y;
        pick.x = this.emptyPos.x; pick.y = this.emptyPos.y;
        this.emptyPos.x = tx; this.emptyPos.y = ty;
      }
      
      for(var k=0; k<this.tiles.length; k++){
        var t2 = this.tiles[k];
        t2.el.style.transform = 'translate(' + (t2.x*this.tileSize) + 'px, ' + (t2.y*this.tileSize) + 'px)';
      }
    },

    checkWin: function() {
      for(var i=0; i<this.tiles.length; i++){
        var t = this.tiles[i];
        if(t.x !== t.targetX || t.y !== t.targetY) return;
      }
      this.playing = false;
      setTimeout(function(){ Puz.winMsg.classList.add('show'); }, 300);
    }
  };

  App.register('puzzle', Puz);

})();
