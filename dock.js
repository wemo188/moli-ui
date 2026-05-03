(function() {
  'use strict';
  var App = window.App; if (!App) return;

  var DRAG_DELAY = 500;
  var DEF_CFG = { bgColor: '#ffffff', bgAlpha: 45, blur: 15, borderW: 1, scale: 1 };

  var ICONS = [
    { id: 'dockMine', label: 'User', defImg: 'https://iili.io/B5DgD5N.jpg', action: function(){ if(App.user) App.user.open(); } },
    { id: 'dockLong', label: 'Char', defImg: 'https://iili.io/BudrfVa.md.jpg', action: function(){ if(App.character) App.character.open(); } },
    { id: 'dockShort', label: '聊天', defImg: 'https://iili.io/BsZkNx1.md.jpg', action: function(){ if(App.wechat) App.wechat.open(); } },
    { id: 'dockCheck', label: '线下', defImg: 'https://iili.io/BghjowQ.md.jpg', action: function(){ App.showToast('查岗 - 开发中'); } }
  ];

  var Dock = {
    state: {}, config: {},
    
    load: function() {
      Dock.config = App.LS.get('dockConfig') || JSON.parse(JSON.stringify(DEF_CFG));
      // 状态：记录它是否在插槽里，在哪个插槽，或者悬浮在哪
      var defState = {
        dockMine:  { docked: true, slot: 0, x: 0, y: 0 },
        dockLong:  { docked: true, slot: 1, x: 0, y: 0 },
        dockShort: { docked: true, slot: 2, x: 0, y: 0 },
        dockCheck: { docked: true, slot: 3, x: 0, y: 0 }
      };
      Dock.state = App.LS.get('dockIconsState') || defState;
    },
    
    saveState: function() { App.LS.set('dockIconsState', Dock.state); },
    saveConfig: function() { App.LS.set('dockConfig', Dock.config); },
    
    applyConfig: function(c) {
      c = c || Dock.config;
      var style = document.getElementById('dockCustomStyle');
      if(!style) { style = document.createElement('style'); style.id = 'dockCustomStyle'; document.head.appendChild(style); }
      
      var hexToRgb = function(hex) {
        if(hex.length===4) hex = '#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
        var r = parseInt(hex.slice(1,3), 16) || 255, g = parseInt(hex.slice(3,5), 16) || 255, b = parseInt(hex.slice(5,7), 16) || 255;
        return r+','+g+','+b;
      };
      var bgRgb = hexToRgb(c.bgColor);
      
      style.innerHTML = 
        '#dockBar { ' +
          'background: rgba(' + bgRgb + ',' + (c.bgAlpha/100) + ') !important; ' +
          'backdrop-filter: blur(' + c.blur + 'px) !important; ' +
          '-webkit-backdrop-filter: blur(' + c.blur + 'px) !important; ' +
          'border: ' + c.borderW + 'px solid rgba(255,255,255,0.6) !important; ' +
          '--dock-scale: ' + c.scale + '; ' +
        '}' +
        '.mk-card { border: ' + c.borderW + 'px solid rgba(220,235,255,.9) !important; }';
    },

    // 核心渲染：把 DOM 放回正确的层级
    renderDOM: function() {
      var dockBar = App.$('#dockBar');
      if(!dockBar) return;
      
      ICONS.forEach(function(ic) {
        var el = App.$('#' + ic.id);
        if (!el) return;
        var st = Dock.state[ic.id];
        
        if (st.docked) {
          var slot = dockBar.querySelector('.dock-slot[data-idx="'+st.slot+'"]');
          if (slot && el.parentNode !== slot) {
            slot.appendChild(el);
            el.classList.remove('is-floating');
            el.style.left = ''; el.style.top = '';
          }
        } else {
          if (el.parentNode !== document.body) {
            document.body.appendChild(el);
            el.classList.add('is-floating');
          }
          el.style.left = st.x + 'px';
          el.style.top = st.y + 'px';
        }
      });
    },

    openEdit: function() {
      var old = App.$('#dockEditOverlay'); if(old) old.remove();
      var cfgSnapshot = JSON.parse(JSON.stringify(Dock.config));
      var cfg = JSON.parse(JSON.stringify(Dock.config));

      var overlay = document.createElement('div'); overlay.id = 'dockEditOverlay'; overlay.className = 'pc-edit-overlay';
      var panel = document.createElement('div'); panel.className = 'pc-edit-panel'; panel.style.width = '280px'; panel.style.height = 'auto';

      panel.innerHTML =
        '<div class="pc-header" id="dockDragHandle">底部栏设置<div class="pc-close-btn" id="dockCloseBtnTop">×</div></div>'+
        '<div class="pc-body" style="flex-direction:column;gap:12px;">'+
          '<div class="pc-group" style="margin-top:4px;">'+
            '<span class="pc-label">底部栏底色</span>'+
            '<div class="pc-palette-grid" style="grid-template-columns: repeat(1, 1fr);">'+
              '<div class="pc-palette-item"><div class="pc-dot" id="dockDotBg" style="background:'+cfg.bgColor+';"></div></div>'+
            '</div>'+
          '</div>'+
          '<div class="pc-group"><span class="pc-label">背景透明度</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockAlpha" min="0" max="100" value="'+cfg.bgAlpha+'"><span class="pc-slider-val" id="dockAlphaVal">'+cfg.bgAlpha+'%</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">毛玻璃模糊度</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockBlur" min="0" max="50" value="'+cfg.blur+'"><span class="pc-slider-val" id="dockBlurVal">'+cfg.blur+'px</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">缩放大小 (Scale)</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockScale" min="0.5" max="1.5" step="0.05" value="'+cfg.scale+'"><span class="pc-slider-val" id="dockScaleVal">'+cfg.scale+'</span></div></div>'+
          '<div class="pc-group"><span class="pc-label">全局边框粗细</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="dockBorderW" min="0" max="5" step="0.5" value="'+cfg.borderW+'"><span class="pc-slider-val" id="dockBorderWVal">'+cfg.borderW+'px</span></div></div>'+
        '</div>'+
        '<div class="pc-footer">'+
          '<button class="pc-btn pc-btn-save" id="dockSaveBtn" type="button">保 存</button>'+
          '<button class="pc-btn pc-btn-cancel" id="dockResetBtn" type="button">重 置</button>'+
        '</div>';

      overlay.appendChild(panel); document.body.appendChild(overlay);
      var dockRect = App.$('#dockBar').getBoundingClientRect(); var top = dockRect.top - panel.offsetHeight - 20; if (top < 10) top = 10;
      panel.style.left = Math.max(10, (window.innerWidth / 2 - 140)) + 'px'; panel.style.top = top + 'px';
      if(App.modules.cards && App.modules.cards._bindPanelDrag) App.modules.cards._bindPanelDrag(panel, '#dockDragHandle');

      function preview() { Dock.applyConfig(cfg); }
      function closeAndRevert() { Dock.applyConfig(cfgSnapshot); overlay.remove(); }

      panel.querySelector('#dockCloseBtnTop').addEventListener('click', function(e){ e.stopPropagation(); closeAndRevert(); });
      overlay.addEventListener('click', function(e){ if(e.target===overlay) closeAndRevert(); });

      ['dockAlpha', 'dockBlur', 'dockBorderW', 'dockScale'].forEach(function(id) {
        var slider = panel.querySelector('#' + id); var valEl = panel.querySelector('#' + id + 'Val');
        if(slider) {
          slider.addEventListener('input', function() {
            var v = parseFloat(this.value); 
            valEl.textContent = v + (id==='dockAlpha'?'%':(id==='dockScale'?'':'px'));
            if(id==='dockAlpha') cfg.bgAlpha = v; if(id==='dockBlur') cfg.blur = v; 
            if(id==='dockBorderW') cfg.borderW = v; if(id==='dockScale') cfg.scale = v;
            preview();
          });
        }
      });

      panel.querySelector('#dockDotBg').addEventListener('click',function(e){
        e.stopPropagation();if(!App.openColorPicker)return;
        App.openColorPicker(cfg.bgColor, function(hex){ cfg.bgColor=hex; panel.querySelector('#dockDotBg').style.background=hex; preview(); }, function(hex){ cfg.bgColor=hex; panel.querySelector('#dockDotBg').style.background=hex; preview(); }, 'dock_bg');
      });

      panel.querySelector('#dockResetBtn').addEventListener('click', function(e){
        e.stopPropagation(); cfg = JSON.parse(JSON.stringify(DEF_CFG));
        panel.querySelector('#dockDotBg').style.background = cfg.bgColor; 
        panel.querySelector('#dockAlpha').value = cfg.bgAlpha; panel.querySelector('#dockAlphaVal').textContent = cfg.bgAlpha + '%';
        panel.querySelector('#dockBlur').value = cfg.blur; panel.querySelector('#dockBlurVal').textContent = cfg.blur + 'px';
        panel.querySelector('#dockScale').value = cfg.scale; panel.querySelector('#dockScaleVal').textContent = cfg.scale;
        panel.querySelector('#dockBorderW').value = cfg.borderW; panel.querySelector('#dockBorderWVal').textContent = cfg.borderW + 'px';
        preview(); App.showToast('已恢复默认');
      });

      panel.querySelector('#dockSaveBtn').addEventListener('click', function(e){
        e.stopPropagation(); Dock.config = cfg; Dock.saveConfig(); overlay.remove(); App.showToast('底部栏设置已保存');
      });
    },

    init: function() {
      Dock.load(); 
      var dockBar = App.$('#dockBar');
      if(!dockBar) return;

      // 1. 初始化插槽 HTML
      dockBar.innerHTML = '';
      for(var i=0; i<4; i++) {
        dockBar.innerHTML += '<div class="dock-slot" data-idx="'+i+'"></div>';
      }

      // 2. 初始化图标 HTML 并注入自定义图片
      ICONS.forEach(function(ic) {
        var imgUrl = App.LS.get('customIcon_' + ic.id) || ic.defImg;
        var iconEl = document.createElement('div');
        iconEl.className = 'desktop-icon';
        iconEl.id = ic.id;
        iconEl.innerHTML = 
          '<div class="mk-card"><img src="' + App.escAttr(imgUrl) + '"></div>' +
          '<div class="di-label">' + ic.label + '</div>';
        
        // 挂载到DOM (待 renderDOM 调整真实位置)
        document.body.appendChild(iconEl);

        // 3. 拖拽判定与物理碰撞核心
        var timer = null, isDragging = false, startX, startY;
        iconEl.addEventListener('touchstart', function(e) {
          var t = e.touches[0]; startX = t.clientX; startY = t.clientY; isDragging = false;
          timer = setTimeout(function() {
            isDragging = true;
            if(navigator.vibrate) navigator.vibrate(15);
            // 剥离插槽，变为悬浮状态
            if(iconEl.parentNode !== document.body) {
              document.body.appendChild(iconEl);
              iconEl.classList.add('is-floating');
            }
            iconEl.style.left = t.clientX + 'px';
            iconEl.style.top = t.clientY + 'px';
          }, DRAG_DELAY);
        }, {passive: false});

        iconEl.addEventListener('touchmove', function(e) {
          var t = e.touches[0];
          if(timer && !isDragging) {
            if(Math.abs(t.clientX - startX) > 8 || Math.abs(t.clientY - startY) > 8) {
              clearTimeout(timer); timer = null;
            }
            return;
          }
          if(!isDragging) return;
          e.preventDefault(); e.stopPropagation();
          // 跟手移动（受 css margins 控制中心点）
          iconEl.style.left = t.clientX + 'px';
          iconEl.style.top = t.clientY + 'px';
        }, {passive: false});

        iconEl.addEventListener('touchend', function(e) {
          clearTimeout(timer); timer = null;
          if(!isDragging) {
            // 没有触发拖拽 = 单击打开
            ic.action();
            return;
          }
          isDragging = false;
          
          var t = e.changedTouches[0];
          var dropX = t.clientX, dropY = t.clientY;
          var rect = dockBar.getBoundingClientRect();
          
          // 判断是否扔进了底部栏机库 (增加判定范围裕度)
          var overDock = (dropX > rect.left - 20 && dropX < rect.right + 20 && dropY > rect.top - 40 && dropY < rect.bottom + 40);

          if(overDock) {
            // 找出最近的插槽
            var slots = Array.from(dockBar.querySelectorAll('.dock-slot'));
            var closestSlot = 0;
            var minDist = 9999;
            slots.forEach(function(s, idx) {
              var sr = s.getBoundingClientRect();
              var scx = sr.left + sr.width/2;
              var dist = Math.abs(dropX - scx);
              if(dist < minDist) { minDist = dist; closestSlot = idx; }
            });

            // 如果该坑位有人，让他滚出去（互相交换状态）
            var occupant = ICONS.find(function(o){ return o.id !== ic.id && Dock.state[o.id].docked && Dock.state[o.id].slot === closestSlot; });
            var oldState = Object.assign({}, Dock.state[ic.id]);

            if(occupant) {
              Dock.state[occupant.id].docked = oldState.docked;
              Dock.state[occupant.id].slot = oldState.slot;
              Dock.state[occupant.id].x = oldState.x;
              Dock.state[occupant.id].y = oldState.y;
            }
            Dock.state[ic.id].docked = true;
            Dock.state[ic.id].slot = closestSlot;

          } else {
            // 永远在桌面流浪
            Dock.state[ic.id].docked = false;
            Dock.state[ic.id].x = dropX;
            Dock.state[ic.id].y = dropY;
          }
          
          Dock.saveState();
          Dock.renderDOM(); // 重新按规矩排兵布阵
        });
      });

      // 4. 底部栏本身的长按编辑
      var dTimer = null, dStartX, dStartY, dDragging = false;
      dockBar.addEventListener('touchstart', function(e) {
        if(e.target.closest('.desktop-icon')) return; // 点到图标不作数
        e.preventDefault();
        var t = e.touches[0]; dStartX = t.clientX; dStartY = t.clientY; dDragging = false;
        dTimer = setTimeout(function(){ 
          dDragging = true; 
          if(navigator.vibrate) navigator.vibrate(15); 
          Dock.openEdit(); 
        }, 600);
      }, {passive: false});
      dockBar.addEventListener('touchmove', function(e) {
        if(dTimer && !dDragging) {
          var t=e.touches[0];
          if(Math.abs(t.clientX-dStartX)>8 || Math.abs(t.clientY-dStartY)>8){ clearTimeout(dTimer); dTimer=null; }
        }
      }, {passive:true});
      dockBar.addEventListener('touchend', function(){ clearTimeout(dTimer); dTimer=null; });

      // 5. 初始化配置并应用排版
      Dock.applyConfig();
      Dock.renderDOM();
    }
  };
  
  App.register('dock', Dock);
})();