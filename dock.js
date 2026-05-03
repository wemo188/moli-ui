
(function(){
  'use strict';
  var App = window.App; if(!App)return;

  var Bg = {
    init: function() {
      // 1. 初始化并读取数据
      var bgData = App.LS.get('bgData') || {};
      Bg.applyBg(bgData);
      
      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1.3, shadow: 14 };
      Bg.applyTopIconStyle(iconConfig);

      // 2. 强行“夺舍”原有的背景面板，将其改造成全屏豪华视图！
      var panel = App.$('#bgPanel');
      if(!panel) return;
      
      // 抹去原有的底部小面板属性，赋予全屏属性
      panel.className = 'fullpage-panel hidden';
      panel.style.background = '#f4f7fb';

      // 准备好图标的最新图片源
      var iconDef = {
        cg: App.LS.get('customIcon_cg') || 'https://iili.io/BsSI1j9.md.jpg',
        lt: App.LS.get('customIcon_lt') || 'https://iili.io/BQ98Pxp.md.jpg',
        d1: App.LS.get('customIcon_dockMine') || 'https://iili.io/B5DgD5N.jpg',
        d2: App.LS.get('customIcon_dockLong') || 'https://iili.io/BudrfVa.md.jpg',
        d3: App.LS.get('customIcon_dockShort') || 'https://iili.io/BsZkNx1.md.jpg',
        d4: App.LS.get('customIcon_dockCheck') || 'https://iili.io/BghjowQ.md.jpg'
      };

      // 注入震撼的全屏 HTML
      panel.innerHTML = 
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;background:#fff;border-bottom:1px solid rgba(126,163,201,.2);flex-shrink:0;z-index:10;">' +
          '<button id="bgCloseBtnTop" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:800;color:#2e4258;letter-spacing:1px;">背景与图标管理</span>' +
          '<div style="width:36px;"></div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;">' +
          
          '<!-- 模块一：背景图管理 -->' +
          '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#7a9ab8;border-radius:2px;"></div>背景墙纸</div>' +
            '<div id="bgNewUploadArea" style="width:100%;height:60px;border:2px dashed rgba(126,163,201,.4);border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:600;color:#7a9ab8;cursor:pointer;background:rgba(126,163,201,.05);margin-bottom:16px;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>点击上传背景图片</div>' +
            '<div id="bgNewPreview" style="width:100%;height:140px;border-radius:12px;overflow:hidden;margin-bottom:16px;border:1px solid #eee;display:none;"><img id="bgNewPreviewImg" style="width:100%;height:100%;object-fit:cover;display:block;"></div>' +
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
            '<div style="display:flex;gap:10px;">' +
              '<button id="bgNewApplyBtn" type="button" style="flex:1;padding:12px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;">应用背景</button>' +
              '<button id="bgNewRemoveBtn" type="button" style="flex:1;padding:12px;border:1.5px solid rgba(126,163,201,.4);border-radius:10px;background:none;color:#5a7a9a;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;">移除背景</button>' +
            '</div>' +
          '</div>' +

          '<!-- 模块二：上侧图标实时预览台 -->' +
          '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:12px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#88abda;border-radius:2px;"></div>上侧图标全局样式</div>' +
            '<div style="font-size:11px;color:#8aa0b8;margin-bottom:16px;line-height:1.5;">在此调整边框与阴影，下方预览台会实时反馈效果。仅对主页上方的图标生效。</div>' +
            
            '<!-- 华丽的预览台 -->' +
            '<div style="background:linear-gradient(135deg,#f0f5fa,#e1edf7);border-radius:14px;padding:30px 0;display:flex;justify-content:center;gap:40px;margin-bottom:20px;border:1px solid rgba(126,163,201,.2);box-shadow:inset 0 4px 12px rgba(0,0,0,0.02);">' +
               '<div id="bgLiveIcon1" style="width:65px;height:65px;border-radius:15px;background:#fff;overflow:hidden;border:'+iconConfig.borderW+'px solid rgba(220,235,255,.9);box-shadow:0 '+iconConfig.shadow+'px 30px rgba(20,35,55,.14);transition:all 0.1s;"><img src="'+iconDef.cg+'" style="width:100%;height:100%;object-fit:cover;"></div>' +
               '<div id="bgLiveIcon2" style="width:65px;height:65px;border-radius:15px;background:#fff;overflow:hidden;border:'+iconConfig.borderW+'px solid rgba(220,235,255,.9);box-shadow:0 '+iconConfig.shadow+'px 30px rgba(20,35,55,.14);transition:all 0.1s;"><img src="'+iconDef.lt+'" style="width:100%;height:100%;object-fit:cover;"></div>' +
            '</div>' +

            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:50px;">边框粗细</span>' +
              '<input type="range" id="bgNewIconBorder" min="0" max="6" step="0.5" value="'+iconConfig.borderW+'" style="flex:1;">' +
              '<span id="bgNewIconBorderVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+iconConfig.borderW+'px</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:50px;">阴影强度</span>' +
              '<input type="range" id="bgNewIconShadow" min="0" max="40" step="1" value="'+iconConfig.shadow+'" style="flex:1;">' +
              '<span id="bgNewIconShadowVal" style="font-size:12px;font-weight:700;color:#2e4258;width:30px;text-align:right;">'+iconConfig.shadow+'px</span>' +
            '</div>' +
          '</div>' +

          '<!-- 模块三：单独图片替换网格 -->' +
          '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:30px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#c9706b;border-radius:2px;"></div>单独替换图片</div>' +
            '<div style="font-size:11px;color:#8aa0b8;margin-bottom:16px;line-height:1.5;">点击下方对应的方块，即可从相册选择新图片替换。</div>' +
            
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px 12px;" id="bgIconGridManager">' +
              // 这里的项由JS注入
            '</div>' +
          '</div>' +

        '</div>';

      // ==================== 事件绑定区 ====================
      
      // 1. 关闭全屏面板
      panel.querySelector('#bgCloseBtnTop').addEventListener('click', function() {
        if(App.closePanel) App.closePanel();
        else {
           panel.classList.remove('show');
           setTimeout(function(){ panel.classList.add('hidden'); }, 350);
        }
      });

      // 2. 背景图相关逻辑
      var pImg = panel.querySelector('#bgNewPreviewImg');
      var pBox = panel.querySelector('#bgNewPreview');
      if(bgData.src) { pImg.src = bgData.src; pBox.style.display = 'block'; }

      var fileInput = document.createElement('input'); 
      fileInput.type = 'file'; fileInput.accept = 'image/*';
      fileInput.onchange = function(e) {
         var f = e.target.files[0]; if(!f) return;
         var r = new FileReader();
         r.onload = function(ev) {
            Bg.compress(ev.target.result, function(c){
               pImg.src = c; pBox.style.display = 'block';
            });
         };
         r.readAsDataURL(f);
      };

      panel.querySelector('#bgNewUploadArea').addEventListener('click', function(){ fileInput.click(); });
      
      panel.querySelector('#bgNewBlur').addEventListener('input', function(){ panel.querySelector('#bgNewBlurVal').textContent = this.value + 'px'; });
      panel.querySelector('#bgNewDark').addEventListener('input', function(){ panel.querySelector('#bgNewDarkVal').textContent = this.value + '%'; });
      
      panel.querySelector('#bgNewApplyBtn').addEventListener('click', function(){
         if(!pImg.src || pImg.src.indexOf('index.html') !== -1) { App.showToast('请先上传图片'); return; }
         var data = { src: pImg.src, blur: panel.querySelector('#bgNewBlur').value, dark: panel.querySelector('#bgNewDark').value };
         App.LS.set('bgData', data);
         Bg.applyBg(data);
         App.showToast('背景已应用');
      });
      panel.querySelector('#bgNewRemoveBtn').addEventListener('click', function(){
         App.LS.remove('bgData');
         pImg.src = ''; pBox.style.display = 'none';
         Bg.applyBg({});
         App.showToast('背景已移除');
      });

      // 3. 上侧图标实时预览与滑块逻辑
      var bSlider = panel.querySelector('#bgNewIconBorder');
      var sSlider = panel.querySelector('#bgNewIconShadow');
      var live1 = panel.querySelector('#bgLiveIcon1');
      var live2 = panel.querySelector('#bgLiveIcon2');

      var updateIconStyle = function() {
        var w = bSlider.value, s = sSlider.value;
        panel.querySelector('#bgNewIconBorderVal').textContent = w + 'px';
        panel.querySelector('#bgNewIconShadowVal').textContent = s + 'px';
        
        // 实时渲染内部的预览台
        live1.style.borderWidth = w + 'px';
        live1.style.boxShadow = '0 ' + s + 'px 30px rgba(20,35,55,0.14)';
        live2.style.borderWidth = w + 'px';
        live2.style.boxShadow = '0 ' + s + 'px 30px rgba(20,35,55,0.14)';

        // 同步保存并应用到外部真实环境
        var cfg = { borderW: parseFloat(w), shadow: parseInt(s) };
        App.LS.set('topIconConfig', cfg);
        Bg.applyTopIconStyle(cfg);
      };

      bSlider.addEventListener('input', updateIconStyle);
      sSlider.addEventListener('input', updateIconStyle);

      // 4. 图片更换网格逻辑
      var grid = panel.querySelector('#bgIconGridManager');
      var iconList = [
        { id: 'customIcon_cg', label: '查岗(上侧)', target: '#cardIcon1 img', live: '#bgLiveIcon1 img', def: iconDef.cg },
        { id: 'customIcon_lt', label: '论坛(上侧)', target: '#cardIcon2 img', live: '#bgLiveIcon2 img', def: iconDef.lt },
        { id: 'customIcon_dockMine', label: '助手(底部)', target: '#dockMine img', def: iconDef.d1 },
        { id: 'customIcon_dockLong', label: '角色(底部)', target: '#dockLong img', def: iconDef.d2 },
        { id: 'customIcon_dockShort', label: '聊天(底部)', target: '#dockShort img', def: iconDef.d3 },
        { id: 'customIcon_dockCheck', label: '查岗(底部)', target: '#dockCheck img', def: iconDef.d4 }
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
           var ipt = document.createElement('input'); inp.type = 'file'; input.accept = 'image/*';
           ipt.onchange = function(e) {
              var f2 = e.target.files[0]; if(!f2) return;
              var rd = new FileReader();
              rd.onload = function(ev) {
                 var process = function(c) {
                    // 保存数据
                    App.LS.set(ic.id, c);
                    // 1. 替换网格里的小图
                    box.querySelector('img').src = c;
                    // 2. 替换首页外面的真身
                    var tEl = document.querySelector(ic.target);
                    if(tEl) tEl.src = c;
                    // 3. 如果是上侧图标，还要顺便替换上面那个沉浸式预览台的图片
                    if(ic.live) {
                      var liveImg = panel.querySelector(ic.live);
                      if(liveImg) liveImg.src = c;
                    }
                    App.showToast(ic.label + ' 图片已更换');
                 };
                 if(App.cropImage) App.cropImage(ev.target.result, function(c){ Bg.compress(c, process); });
                 else Bg.compress(ev.target.result, process);
              };
              rd.readAsDataURL(f2);
           };
           ipt.click();
        });
        grid.appendChild(box);
      });

    },

    // 辅助方法：压缩背景图
    compress: function(src, cb) {
       var img = new Image();
       img.onload = function() {
          var cvs = document.createElement('canvas'), max = 1920;
          var w = img.width, h = img.height;
          if(w>h) { if(w>max){h=h*max/w;w=max;} } else { if(h>max){w=w*max/h;h=max;} }
          cvs.width = w; cvs.height = h;
          cvs.getContext('2d').drawImage(img,0,0,w,h);
          cb(cvs.toDataURL('image/jpeg', 0.85));
       };
       img.src = src;
    },

    // 应用外部背景墙纸
    applyBg: function(data) {
       var layer = App.$('#bgLayer'); if(!layer) return;
       if(data && data.src) {
         layer.style.backgroundImage = 'url(' + data.src + ')';
         layer.style.filter = 'blur(' + (data.blur||0) + 'px) brightness(' + (100 - (data.dark||0)) + '%)';
       } else {
         layer.style.backgroundImage = '';
         layer.style.filter = '';
       }
    },

    // 注入全站通用的上侧图标强力 CSS
    applyTopIconStyle: function(cfg) {
      var styleId = 'topIconDynamicStyle';
      var styleEl = document.getElementById(styleId);
      if(!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
      styleEl.innerHTML = '.card-icon-img { border-width: ' + cfg.borderW + 'px !important; box-shadow: 0 ' + cfg.shadow + 'px 30px rgba(20,35,55,.14) !important; }';
    }
  };

  App.register('bg', Bg);
})();
