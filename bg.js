
(function(){
  'use strict';
  var App = window.App; if(!App)return;

  var Bg = {
    init: function() {
      // 1. 初始化并应用数据
      var bgData = App.LS.get('bgData') || {};
      Bg.applyBg(bgData);
      
      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1.5, shadow: 4, borderColor: '#dcebff', shadowColor: '#adcdea' };
      if(!iconConfig.borderColor) iconConfig.borderColor = '#dcebff';
      if(!iconConfig.shadowColor) iconConfig.shadowColor = '#adcdea';
      Bg.applyTopIconStyle(iconConfig);

      var panel = App.$('#bgPanel');
      if(!panel) return;
      
      panel.className = 'fullpage-panel hidden';
      panel.style.background = '#f4f7fb';

      var iconDef = {
        cg: App.LS.get('customIcon_cg') || 'https://iili.io/BsSI1j9.md.jpg',
        lt: App.LS.get('customIcon_lt') || 'https://iili.io/BQ98Pxp.md.jpg',
        d1: App.LS.get('customIcon_dockMine') || 'https://iili.io/B5DgD5N.jpg',
        d2: App.LS.get('customIcon_dockLong') || 'https://iili.io/BudrfVa.md.jpg',
        d3: App.LS.get('customIcon_dockShort') || 'https://iili.io/BsZkNx1.md.jpg',
        d4: App.LS.get('customIcon_dockCheck') || 'https://iili.io/BghjowQ.md.jpg'
      };

      // 图标全配置（附带默认缩放比例，解决白边问题）
      var iconList = [
        { id: 'customIcon_cg', label: '查岗(上侧)', target: '#cardIcon1 img', live: '#bgLiveIcon1 img', def: iconDef.cg, scale: 'scale(0.85)' },
        { id: 'customIcon_lt', label: '论坛(上侧)', target: '#cardIcon2 img', live: '#bgLiveIcon2 img', def: iconDef.lt, scale: 'scale(0.85)' },
        { id: 'customIcon_dockMine', label: 'User(底部)', target: '#dockMine img', def: iconDef.d1, scale: 'scale(0.8)' },
        { id: 'customIcon_dockLong', label: 'Char(底部)', target: '#dockLong img', def: iconDef.d2, scale: 'scale(0.8)' },
        { id: 'customIcon_dockShort', label: '聊天(底部)', target: '#dockShort img', def: iconDef.d3, scale: 'scale(1)' },
        { id: 'customIcon_dockCheck', label: '线下(底部)', target: '#dockCheck img', def: iconDef.d4, scale: 'scale(0.85)' }
      ];

      // ★ 初始化时，自动修正所有真实图标的缩放状态，完美解决留白！
      iconList.forEach(function(ic) {
        var saved = App.LS.get(ic.id);
        var tEl = document.querySelector(ic.target);
        if (tEl) {
          if (saved) {
             tEl.src = saved;
             tEl.style.transform = 'none'; // 自定义图强制填满
          } else {
             tEl.src = ic.def;
             tEl.style.transform = ic.scale; // 默认图恢复缩放
          }
        }
      });

      var noImgDrag = 'pointer-events:none; -webkit-touch-callout:none; user-select:none; -webkit-user-drag:none;';

      // 注入全屏 HTML
      panel.innerHTML = 
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;background:#fff;border-bottom:1px solid rgba(126,163,201,.2);flex-shrink:0;z-index:10;">' +
          '<button id="bgCloseBtnTop" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>' +
          '<span style="font-size:16px;font-weight:800;color:#2e4258;letter-spacing:1px;">背景与图标管理</span>' +
          '<div style="width:36px;"></div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;">' +
          
          '<!-- 模块一：超大背景图管理与实时滤镜 -->' +
          '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#7a9ab8;border-radius:2px;"></div>背景墙纸 (实时预览)</div>' +
            
            '<div id="bgNewUploadArea" style="width:100%;height:54px;border:2px dashed rgba(126,163,201,.4);border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;color:#7a9ab8;cursor:pointer;background:rgba(126,163,201,.05);margin-bottom:16px;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>点击上传并裁剪新壁纸</div>' +
            
            '<div id="bgNewPreview" style="width:100%;height:220px;border-radius:12px;overflow:hidden;margin-bottom:16px;border:1px solid #eee;display:none;background:#111;position:relative;">' +
               '<img id="bgNewPreviewImg" style="width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.05);' + noImgDrag + '">' +
            '</div>' +
            
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:40px;">虚化</span>' +
              '<input type="range" id="bgNewBlur" min="0" max="30" value="'+(bgData.blur||0)+'" style="flex:1;">' +
              '<span id="bgNewBlurVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+(bgData.blur||0)+'px</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:40px;">变暗</span>' +
              '<input type="range" id="bgNewDark" min="0" max="80" value="'+(bgData.dark||30)+'" style="flex:1;">' +
              '<span id="bgNewDarkVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+(bgData.dark||30)+'%</span>' +
            '</div>' +
            '<button id="bgNewRemoveBtn" type="button" style="width:100%;padding:12px;border:1.5px solid rgba(201,112,107,.4);border-radius:10px;background:rgba(201,112,107,.05);color:#c9706b;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;">移除背景墙纸</button>' +
          '</div>' +

          '<!-- 模块二：上侧图标样式控制台 -->' +
          '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:12px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#88abda;border-radius:2px;"></div>上侧图标样式</div>' +
            
            '<!-- 预览台 -->' +
            '<div style="background:linear-gradient(135deg,#f0f5fa,#e1edf7);border-radius:14px;padding:30px 0 40px;display:flex;justify-content:center;gap:40px;margin-bottom:20px;border:1px solid rgba(126,163,201,.2);box-shadow:inset 0 4px 12px rgba(0,0,0,0.02);">' +
               '<div id="bgLiveIcon1" style="width:65px;height:65px;border-radius:15px;background:#fff;transition:all 0.1s;display:flex;align-items:center;justify-content:center;"><img src="'+(App.LS.get('customIcon_cg')||iconDef.cg)+'" style="width:100%;height:100%;object-fit:cover;border-radius:15px;' + noImgDrag + (App.LS.get('customIcon_cg')?'':'transform:scale(0.85);') + '"></div>' +
               '<div id="bgLiveIcon2" style="width:65px;height:65px;border-radius:15px;background:#fff;transition:all 0.1s;display:flex;align-items:center;justify-content:center;"><img src="'+(App.LS.get('customIcon_lt')||iconDef.lt)+'" style="width:100%;height:100%;object-fit:cover;border-radius:15px;' + noImgDrag + (App.LS.get('customIcon_lt')?'':'transform:scale(0.85);') + '"></div>' +
            '</div>' +

            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:50px;">颜色设置</span>' +
              '<div style="display:flex;gap:16px;">' +
                '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">' +
                  '<div id="bgDotBorder" style="width:24px;height:24px;border-radius:50%;border:1.5px solid rgba(0,0,0,0.1);background:'+iconConfig.borderColor+';cursor:pointer;-webkit-tap-highlight-color:transparent;"></div>' +
                  '<span style="font-size:9px;font-weight:700;color:#555;">边框色</span>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">' +
                  '<div id="bgDotShadow" style="width:24px;height:24px;border-radius:50%;border:1.5px solid rgba(0,0,0,0.1);background:'+iconConfig.shadowColor+';cursor:pointer;-webkit-tap-highlight-color:transparent;"></div>' +
                  '<span style="font-size:9px;font-weight:700;color:#555;">阴影色</span>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:50px;">边框粗细</span>' +
              '<input type="range" id="bgNewIconBorder" min="0" max="6" step="0.5" value="'+iconConfig.borderW+'" style="flex:1;">' +
              '<span id="bgNewIconBorderVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+iconConfig.borderW+'px</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:50px;">阴影偏移</span>' +
              '<input type="range" id="bgNewIconShadow" min="0" max="16" step="1" value="'+iconConfig.shadow+'" style="flex:1;">' +
              '<span id="bgNewIconShadowVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+iconConfig.shadow+'px</span>' +
            '</div>' +
          '</div>' +

          '<!-- 模块三：单独图片替换网格 -->' +
          '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:30px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#c9706b;border-radius:2px;"></div>点击对应方块替换图标</div>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px 12px;" id="bgIconGridManager"></div>' +
          '</div>' +

        '</div>';

      // ==================== 事件绑定与逻辑 ====================
      
      function closePanel() {
        if(App.closePanel) { App.closePanel(); }
        else {
           panel.style.transform = 'translateX(100%)';
           panel.style.opacity = '0';
           setTimeout(function(){ panel.classList.remove('show'); panel.classList.add('hidden'); }, 350);
        }
      }
      panel.querySelector('#bgCloseBtnTop').addEventListener('click', closePanel);

      var _sw = {active: false, sx: 0, sy: 0, locked: false, dir: ''};
      panel.addEventListener('touchstart', function(e){
        var t = e.touches[0];
        if(t.clientX - panel.getBoundingClientRect().left > 50) return;
        _sw = {active: true, sx: t.clientX, sy: t.clientY, locked: false, dir: ''};
      }, {passive: true});

      panel.addEventListener('touchmove', function(e){
        if(!_sw.active) return;
        var t = e.touches[0];
        var dx = t.clientX - _sw.sx;
        var dy = t.clientY - _sw.sy;
        if(!_sw.locked){
          if(Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
          _sw.locked = true;
          _sw.dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        }
        if(_sw.dir === 'h' && dx > 0){
          e.preventDefault();
          panel.style.transform = 'translateX(' + Math.min(dx, panel.offsetWidth) + 'px)';
          panel.style.opacity = String(1 - dx / panel.offsetWidth * 0.5);
        }
      }, {passive: false});

      panel.addEventListener('touchend', function(e){
        if(!_sw.active) return;
        _sw.active = false;
        if(_sw.dir !== 'h') { panel.style.transform = ''; panel.style.opacity = ''; return; }
        var dx = e.changedTouches[0].clientX - _sw.sx;
        if(dx > panel.offsetWidth * 0.3){
          panel.style.transition = 'transform .25s, opacity .25s';
          panel.style.transform = 'translateX(100%)';
          panel.style.opacity = '0';
          setTimeout(function(){
            panel.style.transition = ''; panel.style.transform = ''; panel.style.opacity = '';
            closePanel();
          }, 260);
        } else {
          panel.style.transition = 'transform .2s, opacity .2s';
          panel.style.transform = ''; panel.style.opacity = '';
          setTimeout(function(){ panel.style.transition = ''; }, 220);
        }
      }, {passive: true});

      var pImg = panel.querySelector('#bgNewPreviewImg');
      var pBox = panel.querySelector('#bgNewPreview');
      
      var applyLiveFilter = function(blur, dark) {
         pImg.style.filter = 'blur(' + blur + 'px) brightness(' + (100 - dark) + '%)';
      };

      if(bgData.src) { 
         pImg.src = bgData.src; 
         pBox.style.display = 'block'; 
         applyLiveFilter(bgData.blur||0, bgData.dark||30);
      }

      var fileInput = document.createElement('input'); 
      fileInput.type = 'file'; fileInput.accept = 'image/*';
      fileInput.onchange = function(e) {
         var f = e.target.files[0]; if(!f) return;
         var r = new FileReader();
         r.onload = function(ev) {
            var process = function(c) {
               var currentData = App.LS.get('bgData') || { blur: 0, dark: 30 };
               currentData.src = c;
               App.LS.set('bgData', currentData);
               pImg.src = c; pBox.style.display = 'block';
               applyLiveFilter(currentData.blur||0, currentData.dark||30);
               Bg.applyBg(currentData);
               App.showToast('背景已更换');
            };
            if(App.cropImage) App.cropImage(ev.target.result, process);
            else process(ev.target.result);
         };
         r.readAsDataURL(f);
      };

      panel.querySelector('#bgNewUploadArea').addEventListener('click', function(){ fileInput.click(); });
      
      var handleBgSlider = function() {
         var blurV = panel.querySelector('#bgNewBlur').value;
         var darkV = panel.querySelector('#bgNewDark').value;
         panel.querySelector('#bgNewBlurVal').textContent = blurV + 'px';
         panel.querySelector('#bgNewDarkVal').textContent = darkV + '%';
         applyLiveFilter(blurV, darkV);
         var data = App.LS.get('bgData') || {};
         data.blur = blurV; data.dark = darkV;
         App.LS.set('bgData', data);
         Bg.applyBg(data); 
      };
      panel.querySelector('#bgNewBlur').addEventListener('input', handleBgSlider);
      panel.querySelector('#bgNewDark').addEventListener('input', handleBgSlider);
      
      panel.querySelector('#bgNewRemoveBtn').addEventListener('click', function(){
         App.LS.remove('bgData');
         pImg.src = ''; pBox.style.display = 'none';
         Bg.applyBg({});
         App.showToast('背景已移除');
      });

      var bSlider = panel.querySelector('#bgNewIconBorder');
      var sSlider = panel.querySelector('#bgNewIconShadow');
      var live1 = panel.querySelector('#bgLiveIcon1');
      var live2 = panel.querySelector('#bgLiveIcon2');

      var getShadowCss = function(w, s, bC, sC) {
        return 'border: ' + w + 'px solid ' + bC + '; ' +
               'box-shadow: ' + s + 'px ' + s + 'px 0 ' + sC + '; ';
      };

      var updateIconStyle = function() {
        var w = bSlider.value, s = sSlider.value;
        panel.querySelector('#bgNewIconBorderVal').textContent = w + 'px';
        panel.querySelector('#bgNewIconShadowVal').textContent = s + 'px';
        
        live1.style.cssText += getShadowCss(w, s, iconConfig.borderColor, iconConfig.shadowColor);
        live2.style.cssText += getShadowCss(w, s, iconConfig.borderColor, iconConfig.shadowColor);

        iconConfig.borderW = parseFloat(w);
        iconConfig.shadow = parseInt(s);
        App.LS.set('topIconConfig', iconConfig);
        Bg.applyTopIconStyle(iconConfig);
      };

      updateIconStyle();
      bSlider.addEventListener('input', updateIconStyle);
      sSlider.addEventListener('input', updateIconStyle);

      function bindColorDot(dotId, key) {
        panel.querySelector(dotId).addEventListener('click', function(e) {
          e.stopPropagation();
          if(!App.openColorPicker) return;
          App.openColorPicker(iconConfig[key], function(hex){
            iconConfig[key] = hex;
            panel.querySelector(dotId).style.background = hex;
            updateIconStyle();
          }, function(hex){
            iconConfig[key] = hex;
            panel.querySelector(dotId).style.background = hex;
            updateIconStyle();
          });
        });
      }
      bindColorDot('#bgDotBorder', 'borderColor');
      bindColorDot('#bgDotShadow', 'shadowColor');

      var grid = panel.querySelector('#bgIconGridManager');

      iconList.forEach(function(ic) {
        var box = document.createElement('div');
        box.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;';
        box.innerHTML = 
          '<div style="width:54px;height:54px;border-radius:14px;border:1px solid rgba(126,163,201,.3);overflow:hidden;background:#f5f5f5;box-shadow:0 4px 10px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;">' +
            '<img src="' + App.escAttr(App.LS.get(ic.id) || ic.def) + '" style="width:100%;height:100%;object-fit:cover;display:block;' + noImgDrag + (App.LS.get(ic.id)?'':'transform:'+ic.scale+';') + '">' +
          '</div>' +
          '<div style="font-size:10px;font-weight:700;color:#5a7a9a;">'+ic.label+'</div>';
        
        box.addEventListener('click', function() {
           // 弹出专属菜单：上传 / 恢复默认 / 取消
           var menu = document.createElement('div');
           menu.style.cssText = 'position:fixed;inset:0;z-index:100030;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
           menu.innerHTML = 
             '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:240px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">' +
               '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:4px;">' + ic.label + '</div>' +
               '<button id="icUpload" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;">上传新图片</button>' +
               '<button id="icDefault" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:13px;font-weight:600;color:#c9706b;cursor:pointer;">恢复默认图标</button>' +
               '<button id="icCancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;">取消</button>' +
             '</div>';
           document.body.appendChild(menu);
           
           menu.addEventListener('click', function(e){ if(e.target===menu) menu.remove(); });
           menu.querySelector('#icCancel').addEventListener('click', function(){ menu.remove(); });
           
           menu.querySelector('#icDefault').addEventListener('click', function(){
               menu.remove();
               App.LS.remove(ic.id);
               box.querySelector('img').src = ic.def;
               box.querySelector('img').style.transform = ic.scale; // 网格里的小图恢复缩放
               
               var tEl = document.querySelector(ic.target);
               if(tEl) {
                   tEl.src = ic.def;
                   tEl.style.transform = ic.scale; // 外面的真身恢复缩放
               }
               if(ic.live) {
                   var liveImg = panel.querySelector(ic.live);
                   if(liveImg) { liveImg.src = ic.def; liveImg.style.transform = ic.scale; }
               }
               App.showToast('已恢复默认图标');
           });

           menu.querySelector('#icUpload').addEventListener('click', function(){
               menu.remove();
               var ipt = document.createElement('input'); ipt.type = 'file'; ipt.accept = 'image/*';
               ipt.onchange = function(e) {
                  var f2 = e.target.files[0]; if(!f2) return;
                  var rd = new FileReader();
                  rd.onload = function(ev) {
                     var process = function(c) {
                        App.LS.set(ic.id, c);
                        box.querySelector('img').src = c;
                        box.querySelector('img').style.transform = 'none'; // 新图填满

                        var tEl = document.querySelector(ic.target);
                        if(tEl) { tEl.src = c; tEl.style.transform = 'none'; }
                        if(ic.live) {
                          var liveImg = panel.querySelector(ic.live);
                          if(liveImg) { liveImg.src = c; liveImg.style.transform = 'none'; }
                        }
                        App.showToast(ic.label + ' 图标已更换');
                     };
                     if(App.cropImage) App.cropImage(ev.target.result, process);
                     else process(ev.target.result);
                  };
                  rd.readAsDataURL(f2);
               };
               ipt.click();
           });
        });
        grid.appendChild(box);
      });
    },

    applyBg: function(data) {
       var layer = App.$('#bgLayer'); if(!layer) return;
       if(data && data.src) {
         layer.style.backgroundImage = 'url(' + data.src + ')';
         layer.style.filter = 'blur(' + (data.blur||0) + 'px) brightness(' + (100 - (data.dark||0)) + '%)';
       } else {
         layer.style.backgroundImage = '';
         layer.style.filter = 'blur(' + (data.blur||0) + 'px) brightness(' + (100 - (data.dark||0)) + '%)'; 
       }
    },

    applyTopIconStyle: function(cfg) {
      var styleId = 'topIconDynamicStyle';
      var styleEl = document.getElementById(styleId);
      if(!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
      
      var bColor = cfg.borderColor || '#dcebff'; 
      var sColor = cfg.shadowColor || '#adcdea'; 

      styleEl.innerHTML = 
        '.card-icon-img { ' +
          'border: ' + cfg.borderW + 'px solid ' + bColor + ' !important; ' +
          'box-shadow: ' + cfg.shadow + 'px ' + cfg.shadow + 'px 0 ' + sColor + ' !important; ' +
          'border-radius: 15px !important; ' +
        '}';
    }
  };

  App.register('bg', Bg);
})();
