(function(){
  'use strict';
  var App = window.App; if(!App)return;

  var Bg = {
    init: function() {
      // 1. 初始化并应用数据
      var bgData = App.LS.get('bgData') || {};
      Bg.applyBg(bgData);
      
      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1.5, shadow: 4 };
      Bg.applyTopIconStyle(iconConfig);

      // 2. 夺舍原面板，将其完全透明化！
      var panel = App.$('#bgPanel');
      if(!panel) return;
      
      panel.className = 'fullpage-panel hidden';
      panel.style.background = 'transparent'; // 魔法：绝对透明！

      var iconDef = {
        cg: App.LS.get('customIcon_cg') || 'https://iili.io/BsSI1j9.md.jpg',
        lt: App.LS.get('customIcon_lt') || 'https://iili.io/BQ98Pxp.md.jpg',
        d1: App.LS.get('customIcon_dockMine') || 'https://iili.io/B5DgD5N.jpg',
        d2: App.LS.get('customIcon_dockLong') || 'https://iili.io/BudrfVa.md.jpg',
        d3: App.LS.get('customIcon_dockShort') || 'https://iili.io/BsZkNx1.md.jpg',
        d4: App.LS.get('customIcon_dockCheck') || 'https://iili.io/BghjowQ.md.jpg'
      };

      // 注入悬浮于底部的全景控制台
      panel.innerHTML = 
        '<div style="position:absolute; inset:0; z-index:1;" id="bgEmptyClickArea"></div>' + // 点击空白处关闭
        '<div style="position:absolute; bottom:0; left:0; right:0; background:rgba(255,255,255,0.85); backdrop-filter:blur(25px); -webkit-backdrop-filter:blur(25px); border-radius:24px 24px 0 0; padding:24px 20px calc(20px + env(safe-area-inset-bottom, 20px)); z-index:2; max-height:85vh; overflow-y:auto; box-shadow: 0 -10px 40px rgba(0,0,0,0.15);">' +
          
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">' +
            '<span style="font-size:18px; font-weight:900; color:#2e4258; letter-spacing:1px;">外观与图标</span>' +
            '<button id="bgCloseBtnTop" style="background:#f0f5fa; border:none; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:#5a7a9a; font-size:16px; cursor:pointer;-webkit-tap-highlight-color:transparent;">✕</button>' +
          '</div>' +

          '<!-- 模块一：背景图管理 -->' +
          '<div style="margin-bottom:24px;">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:12px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#7a9ab8;border-radius:2px;"></div>背景墙纸 (整屏实时预览)</div>' +
            '<div id="bgNewUploadArea" style="width:100%;height:54px;border:1.5px dashed rgba(126,163,201,.5);border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:600;color:#7a9ab8;cursor:pointer;background:rgba(126,163,201,.05);margin-bottom:16px;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>点击选择新壁纸</div>' +
            
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:40px;">虚化</span>' +
              '<input type="range" id="bgNewBlur" min="0" max="30" value="'+(bgData.blur||0)+'" style="flex:1;">' +
              '<span id="bgNewBlurVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+(bgData.blur||0)+'px</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:40px;">变暗</span>' +
              '<input type="range" id="bgNewDark" min="0" max="80" value="'+(bgData.dark||30)+'" style="flex:1;">' +
              '<span id="bgNewDarkVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+(bgData.dark||30)+'%</span>' +
            '</div>' +
            '<button id="bgNewRemoveBtn" type="button" style="width:100%;padding:10px;border:1.5px solid rgba(201,112,107,.4);border-radius:10px;background:rgba(201,112,107,.05);color:#c9706b;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;">移除背景墙纸</button>' +
          '</div>' +

          '<!-- 模块二：上侧图标硬阴影控制 -->' +
          '<div style="margin-bottom:24px;">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:12px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#88abda;border-radius:2px;"></div>上侧图标框线与阴影</div>' +
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:50px;">边框粗细</span>' +
              '<input type="range" id="bgNewIconBorder" min="0" max="5" step="0.5" value="'+iconConfig.borderW+'" style="flex:1;">' +
              '<span id="bgNewIconBorderVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+iconConfig.borderW+'px</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:50px;">阴影偏移</span>' +
              '<input type="range" id="bgNewIconShadow" min="0" max="16" step="1" value="'+iconConfig.shadow+'" style="flex:1;">' +
              '<span id="bgNewIconShadowVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+iconConfig.shadow+'px</span>' +
            '</div>' +
          '</div>' +

          '<!-- 模块三：单独图片替换网格 -->' +
          '<div>' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#c9706b;border-radius:2px;"></div>点击对应方块替换图片</div>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px 12px;" id="bgIconGridManager"></div>' +
          '</div>' +

        '</div>';

      // ==================== 事件绑定 ====================
      
      function closePanel() {
        if(App.closePanel) App.closePanel();
        else { panel.classList.remove('show'); setTimeout(function(){ panel.classList.add('hidden'); }, 350); }
      }

      panel.querySelector('#bgCloseBtnTop').addEventListener('click', closePanel);
      panel.querySelector('#bgEmptyClickArea').addEventListener('click', closePanel);

      // --- 1. 背景上传与实时预览 (强制裁剪) ---
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
               Bg.applyBg(currentData); // 瞬间上墙！
               App.showToast('背景已更换');
            };
            if(App.cropImage) App.cropImage(ev.target.result, process);
            else process(ev.target.result);
         };
         r.readAsDataURL(f);
      };

      panel.querySelector('#bgNewUploadArea').addEventListener('click', function(){ fileInput.click(); });
      
      // 实时监听滑块改变背景
      var handleSlider = function() {
         var blurV = panel.querySelector('#bgNewBlur').value;
         var darkV = panel.querySelector('#bgNewDark').value;
         panel.querySelector('#bgNewBlurVal').textContent = blurV + 'px';
         panel.querySelector('#bgNewDarkVal').textContent = darkV + '%';

         var data = App.LS.get('bgData') || {};
         data.blur = blurV; data.dark = darkV;
         App.LS.set('bgData', data);
         Bg.applyBg(data); // 实时刷新背后网页！
      };
      panel.querySelector('#bgNewBlur').addEventListener('input', handleSlider);
      panel.querySelector('#bgNewDark').addEventListener('input', handleSlider);
      
      panel.querySelector('#bgNewRemoveBtn').addEventListener('click', function(){
         App.LS.remove('bgData');
         var data = { blur: panel.querySelector('#bgNewBlur').value, dark: panel.querySelector('#bgNewDark').value };
         Bg.applyBg(data);
         App.showToast('背景已移除');
      });

      // --- 2. 图标的硬阴影与边框控制 ---
      var bSlider = panel.querySelector('#bgNewIconBorder');
      var sSlider = panel.querySelector('#bgNewIconShadow');

      var updateIconStyle = function() {
        var w = bSlider.value, s = sSlider.value;
        panel.querySelector('#bgNewIconBorderVal').textContent = w + 'px';
        panel.querySelector('#bgNewIconShadowVal').textContent = s + 'px';
        var cfg = { borderW: parseFloat(w), shadow: parseInt(s) };
        App.LS.set('topIconConfig', cfg);
        Bg.applyTopIconStyle(cfg); // 瞬间刷新外部样式
      };

      bSlider.addEventListener('input', updateIconStyle);
      sSlider.addEventListener('input', updateIconStyle);

      // --- 3. 所有图标替换网格 (强制裁剪) ---
      var grid = panel.querySelector('#bgIconGridManager');
      var iconList = [
        { id: 'customIcon_cg', label: '查岗(上侧)', target: '#cardIcon1 img', def: iconDef.cg },
        { id: 'customIcon_lt', label: '论坛(上侧)', target: '#cardIcon2 img', def: iconDef.lt },
        { id: 'customIcon_dockMine', label: 'User(底部)', target: '#dockMine img', def: iconDef.d1 },
        { id: 'customIcon_dockLong', label: 'Char(底部)', target: '#dockLong img', def: iconDef.d2 },
        { id: 'customIcon_dockShort', label: '聊天(底部)', target: '#dockShort img', def: iconDef.d3 },
        { id: 'customIcon_dockCheck', label: '线下(底部)', target: '#dockCheck img', def: iconDef.d4 }
      ];

      iconList.forEach(function(ic) {
        var box = document.createElement('div');
        box.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;';
        box.innerHTML = 
          '<div style="width:54px;height:54px;border-radius:14px;border:1px solid rgba(126,163,201,.3);overflow:hidden;background:#f5f5f5;box-shadow:0 4px 10px rgba(0,0,0,0.05);">' +
            '<img src="'+App.escAttr(ic.def)+'" style="width:100%;height:100%;object-fit:cover;display:block;">' +
          '</div>' +
          '<div style="font-size:10px;font-weight:700;color:#5a7a9a;">'+ic.label+'</div>';
        
        box.addEventListener('click', function() {
           var ipt = document.createElement('input'); ipt.type = 'file'; ipt.accept = 'image/*';
           ipt.onchange = function(e) {
              var f2 = e.target.files[0]; if(!f2) return;
              var rd = new FileReader();
              rd.onload = function(ev) {
                 var process = function(c) {
                    App.LS.set(ic.id, c);
                    box.querySelector('img').src = c; // 更新面板里的小图
                    var tEl = document.querySelector(ic.target);
                    if(tEl) tEl.src = c; // 瞬间更新外面的真身
                    App.showToast(ic.label + ' 图片已更换');
                 };
                 // 强制走裁剪
                 if(App.cropImage) App.cropImage(ev.target.result, process);
                 else process(ev.target.result);
              };
              rd.readAsDataURL(f2);
           };
           ipt.click();
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
         layer.style.filter = 'blur(' + (data.blur||0) + 'px) brightness(' + (100 - (data.dark||0)) + '%)'; // 没图也能生效滤镜
       }
    },

    // 注入上侧图标右下角硬阴影和淡蓝边框！
    applyTopIconStyle: function(cfg) {
      var styleId = 'topIconDynamicStyle';
      var styleEl = document.getElementById(styleId);
      if(!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
      
      // 与底部栏同源的淡蓝边框
      var borderColor = 'rgba(220,235,255,0.9)'; 
      // 与对话框同源的右下角延伸硬阴影
      var shadowColor = 'rgba(173,205,234,0.9)'; 

      styleEl.innerHTML = 
        '.card-icon-img { ' +
          'border: ' + cfg.borderW + 'px solid ' + borderColor + ' !important; ' +
          'box-shadow: ' + cfg.shadow + 'px ' + cfg.shadow + 'px 0 ' + shadowColor + ' !important; ' +
          'border-radius: 15px !important; ' +
        '}';
    }
  };

  App.register('bg', Bg);
})();