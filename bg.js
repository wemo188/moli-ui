
(function(){
  'use strict';
  var App = window.App; if(!App)return;

  var Bg = {
    init: function() {
      var bgData = App.LS.get('bgData') || {};
      Bg.applyBg(bgData);
      
      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
      if(!iconConfig.borderColor) iconConfig.borderColor = '#dcebff';
      if(!iconConfig.shadowColor) iconConfig.shadowColor = '#dcebff';
      if(App.LS.get('topIconConfig')) Bg.applyTopIconStyle(iconConfig);

      var panel = App.$('#bgPanel');
      if(!panel) return;
      
      panel.className = 'fullpage-panel hidden';
      panel.style.background = '#f4f7fb';

      // ★ 从 HTML 里实时读取默认图，不硬编码
      function getOrigSrc(selector) {
        var el = document.querySelector(selector);
        return el ? el.getAttribute('src') : '';
      }

      var iconList = [
        { id: 'customIcon_cg', label: '查岗(上侧)', target: '#cardIcon1 img', live: '#bgLiveIcon1 img', def: getOrigSrc('#cardIcon1 img') },
        { id: 'customIcon_lt', label: '论坛(上侧)', target: '#cardIcon2 img', live: '#bgLiveIcon2 img', def: getOrigSrc('#cardIcon2 img') },
        { id: 'customIcon_dockMine', label: 'User(底部)', target: '#dockMine img', def: getOrigSrc('#dockMine img') },
        { id: 'customIcon_dockLong', label: 'Char(底部)', target: '#dockLong img', def: getOrigSrc('#dockLong img') },
        { id: 'customIcon_dockShort', label: '聊天(底部)', target: '#dockShort img', def: getOrigSrc('#dockShort img') },
        { id: 'customIcon_dockCheck', label: '线下(底部)', target: '#dockCheck img', def: getOrigSrc('#dockCheck img') }
      ];

      var noImgDrag = 'pointer-events:none; -webkit-touch-callout:none; user-select:none; -webkit-user-drag:none;';

      var liveSrc1 = App.LS.get('customIcon_cg') || getOrigSrc('#cardIcon1 img');
      var liveSrc2 = App.LS.get('customIcon_lt') || getOrigSrc('#cardIcon2 img');

      panel.innerHTML = 
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;background:#fff;border-bottom:1px solid rgba(126,163,201,.2);flex-shrink:0;z-index:10;">' +
          '<button id="bgCloseBtnTop" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>' +
          '<span style="font-size:16px;font-weight:800;color:#2e4258;letter-spacing:1px;">背景与图标管理</span>' +
          '<div style="width:36px;"></div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;">' +
          
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

          '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:12px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#88abda;border-radius:2px;"></div>上侧图标样式</div>' +
            
            '<div style="background:linear-gradient(135deg,#f0f5fa,#e1edf7);border-radius:14px;padding:30px 0 40px;display:flex;justify-content:center;gap:40px;margin-bottom:20px;border:1px solid rgba(126,163,201,.2);box-shadow:inset 0 4px 12px rgba(0,0,0,0.02);">' +
               '<div id="bgLiveIcon1" style="width:65px;height:65px;border-radius:15px;background:#fff;transition:all 0.1s;display:flex;align-items:center;justify-content:center;overflow:hidden;"><img src="'+App.escAttr(liveSrc1)+'" style="width:100%;height:100%;object-fit:cover;border-radius:15px;' + noImgDrag + '"></div>' +
               '<div id="bgLiveIcon2" style="width:65px;height:65px;border-radius:15px;background:#fff;transition:all 0.1s;display:flex;align-items:center;justify-content:center;overflow:hidden;"><img src="'+App.escAttr(liveSrc2)+'" style="width:100%;height:100%;object-fit:cover;border-radius:15px;' + noImgDrag + '"></div>' +
            '</div>' +

            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">' +
              '<span style="font-size:12px;font-weight:700;color:#5a7a9a;width:50px;">统一颜色</span>' +
              '<div id="bgDotUnified" style="width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(0,0,0,0.1);background:'+iconConfig.borderColor+';cursor:pointer;-webkit-tap-highlight-color:transparent;"></div>' +
              '<span style="font-size:10px;color:#999;">边框 + 阴影</span>' +
              '<button id="bgResetColor" type="button" style="margin-left:auto;padding:6px 12px;border:1px solid rgba(201,112,107,.3);border-radius:8px;background:rgba(201,112,107,.05);color:#c9706b;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;">恢复默认</button>' +
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

          '<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:30px;box-shadow:0 4px 20px rgba(126,163,201,.08);border:1px solid rgba(126,163,201,.15);">' +
            '<div style="font-size:14px;font-weight:800;color:#2e4258;margin-bottom:14px;display:flex;align-items:center;gap:6px;"><div style="width:4px;height:12px;background:#c9706b;border-radius:2px;"></div>点击对应方块替换图标</div>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px 12px;" id="bgIconGridManager"></div>' +
          '</div>' +

        '</div>';

      // ==================== 事件绑定 ====================
      
      function closePanel() {
        if(App.closePanel) App.closePanel();
        else { panel.style.transform='translateX(100%)'; panel.style.opacity='0'; setTimeout(function(){ panel.classList.remove('show'); panel.classList.add('hidden'); },350); }
      }
      panel.querySelector('#bgCloseBtnTop').addEventListener('click', closePanel);

      // 右滑返回
      var _sw = {active:false, sx:0, sy:0, locked:false, dir:''};
      panel.addEventListener('touchstart', function(e){
        var t=e.touches[0]; if(t.clientX - panel.getBoundingClientRect().left > 50) return;
        _sw = {active:true, sx:t.clientX, sy:t.clientY, locked:false, dir:''};
      }, {passive:true});
      panel.addEventListener('touchmove', function(e){
        if(!_sw.active) return; var t=e.touches[0]; var dx=t.clientX-_sw.sx, dy=t.clientY-_sw.sy;
        if(!_sw.locked){ if(Math.abs(dx)<10&&Math.abs(dy)<10) return; _sw.locked=true; _sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v'; }
        if(_sw.dir==='h'&&dx>0){ e.preventDefault(); panel.style.transform='translateX('+Math.min(dx,panel.offsetWidth)+'px)'; panel.style.opacity=String(1-dx/panel.offsetWidth*0.5); }
      }, {passive:false});
      panel.addEventListener('touchend', function(e){
        if(!_sw.active) return; _sw.active=false;
        if(_sw.dir!=='h'){ panel.style.transform=''; panel.style.opacity=''; return; }
        var dx=e.changedTouches[0].clientX-_sw.sx;
        if(dx>panel.offsetWidth*0.3){ panel.style.transition='transform .25s,opacity .25s'; panel.style.transform='translateX(100%)'; panel.style.opacity='0'; setTimeout(function(){ panel.style.transition=''; panel.style.transform=''; panel.style.opacity=''; closePanel(); },260); }
        else { panel.style.transition='transform .2s,opacity .2s'; panel.style.transform=''; panel.style.opacity=''; setTimeout(function(){ panel.style.transition=''; },220); }
      }, {passive:true});

      // --- 背景墙纸 ---
      var pImg = panel.querySelector('#bgNewPreviewImg');
      var pBox = panel.querySelector('#bgNewPreview');
      var applyLiveFilter = function(blur,dark){ pImg.style.filter='blur('+blur+'px) brightness('+(100-dark)+'%)'; };
      if(bgData.src){ pImg.src=bgData.src; pBox.style.display='block'; applyLiveFilter(bgData.blur||0, bgData.dark||30); }

      var fileInput = document.createElement('input'); fileInput.type='file'; fileInput.accept='image/*';
      fileInput.onchange = function(e){
        var f=e.target.files[0]; if(!f) return;
        var r=new FileReader();
        r.onload = function(ev){
          var process = function(c){ var d=App.LS.get('bgData')||{blur:0,dark:30}; d.src=c; App.LS.set('bgData',d); pImg.src=c; pBox.style.display='block'; applyLiveFilter(d.blur||0,d.dark||30); Bg.applyBg(d); App.showToast('背景已更换'); };
          if(App.cropImage) App.cropImage(ev.target.result, process); else process(ev.target.result);
        };
        r.readAsDataURL(f);
      };
      panel.querySelector('#bgNewUploadArea').addEventListener('click', function(){ fileInput.click(); });

      var handleBgSlider = function(){
        var blurV=panel.querySelector('#bgNewBlur').value, darkV=panel.querySelector('#bgNewDark').value;
        panel.querySelector('#bgNewBlurVal').textContent=blurV+'px'; panel.querySelector('#bgNewDarkVal').textContent=darkV+'%';
        applyLiveFilter(blurV, darkV);
        var d=App.LS.get('bgData')||{}; d.blur=blurV; d.dark=darkV; App.LS.set('bgData',d); Bg.applyBg(d);
      };
      panel.querySelector('#bgNewBlur').addEventListener('input', handleBgSlider);
      panel.querySelector('#bgNewDark').addEventListener('input', handleBgSlider);

      panel.querySelector('#bgNewRemoveBtn').addEventListener('click', function(){
        App.LS.remove('bgData'); pImg.src=''; pBox.style.display='none'; Bg.applyBg({}); App.showToast('背景已移除');
      });

      // --- 上侧图标样式 ---
      var bSlider = panel.querySelector('#bgNewIconBorder');
      var sSlider = panel.querySelector('#bgNewIconShadow');
      var live1 = panel.querySelector('#bgLiveIcon1');
      var live2 = panel.querySelector('#bgLiveIcon2');

      var updateIconStyle = function(){
        var w=bSlider.value, s=sSlider.value;
        panel.querySelector('#bgNewIconBorderVal').textContent=w+'px';
        panel.querySelector('#bgNewIconShadowVal').textContent=s+'px';
        var css = 'width:65px;height:65px;border-radius:15px;background:#fff;transition:all 0.1s;display:flex;align-items:center;justify-content:center;overflow:hidden;border:'+w+'px solid '+iconConfig.borderColor+';box-shadow:'+s+'px '+s+'px 0 '+iconConfig.shadowColor+';';
        live1.style.cssText = css;
        live2.style.cssText = css;
        iconConfig.borderW=parseFloat(w); iconConfig.shadow=parseInt(s);
        App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
      };
      updateIconStyle();
      bSlider.addEventListener('input', updateIconStyle);
      sSlider.addEventListener('input', updateIconStyle);

      // 统一颜色
      panel.querySelector('#bgDotUnified').addEventListener('click', function(e){
        e.stopPropagation(); if(!App.openColorPicker) return;
        App.openColorPicker(iconConfig.borderColor, function(hex){
          iconConfig.borderColor=hex; iconConfig.shadowColor=hex;
          panel.querySelector('#bgDotUnified').style.background=hex; updateIconStyle();
        }, function(hex){
          iconConfig.borderColor=hex; iconConfig.shadowColor=hex;
          panel.querySelector('#bgDotUnified').style.background=hex; updateIconStyle();
        });
      });

      // 恢复默认颜色
      panel.querySelector('#bgResetColor').addEventListener('click', function(e){
        e.stopPropagation();
        iconConfig.borderColor='#dcebff'; iconConfig.shadowColor='#dcebff'; iconConfig.borderW=1; iconConfig.shadow=0;
        panel.querySelector('#bgDotUnified').style.background='#dcebff';
        bSlider.value=1; panel.querySelector('#bgNewIconBorderVal').textContent='1px';
        sSlider.value=0; panel.querySelector('#bgNewIconShadowVal').textContent='0px';
        App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig); updateIconStyle();
        App.showToast('已恢复默认颜色');
      });

      // --- 图标替换网格 ---
      var grid = panel.querySelector('#bgIconGridManager');

      iconList.forEach(function(ic){
        var currentSrc = App.LS.get(ic.id) || ic.def;
        var box = document.createElement('div');
        box.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;';
        box.innerHTML =
          '<div style="width:54px;height:54px;border-radius:14px;border:1px solid rgba(126,163,201,.3);overflow:hidden;background:#f5f5f5;box-shadow:0 4px 10px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;">' +
            '<img src="'+App.escAttr(currentSrc)+'" style="width:100%;height:100%;object-fit:cover;display:block;'+noImgDrag+'">' +
          '</div>' +
          '<div style="font-size:10px;font-weight:700;color:#5a7a9a;">'+ic.label+'</div>';

        box.addEventListener('click', function(){
          var menu = document.createElement('div');
          menu.style.cssText = 'position:fixed;inset:0;z-index:100030;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
          menu.innerHTML =
            '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:240px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">' +
              '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:4px;">'+ic.label+'</div>' +
              '<button id="icUpload" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;">上传新图片</button>' +
              '<button id="icDefault" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:13px;font-weight:600;color:#c9706b;cursor:pointer;">恢复默认图标</button>' +
              '<button id="icCancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;">取消</button>' +
            '</div>';
          document.body.appendChild(menu);

          menu.addEventListener('click', function(e){ if(e.target===menu) menu.remove(); });
          menu.querySelector('#icCancel').addEventListener('click', function(){ menu.remove(); });

          // ★ 恢复默认：删存储，src 设回 def（从 HTML 读到的原始值）
          menu.querySelector('#icDefault').addEventListener('click', function(){
            menu.remove();
            App.LS.remove(ic.id);
            // 网格小图
            box.querySelector('img').src = ic.def;
            // 页面真身
            var tEl = document.querySelector(ic.target);
            if(tEl) tEl.src = ic.def;
            // 预览台
            if(ic.live){ var liveImg = panel.querySelector(ic.live); if(liveImg) liveImg.src = ic.def; }
            App.showToast('已恢复默认图标');
          });

          // ★ 上传新图
          menu.querySelector('#icUpload').addEventListener('click', function(){
            menu.remove();
            var ipt = document.createElement('input'); ipt.type='file'; ipt.accept='image/*';
            ipt.onchange = function(e){
              var f2=e.target.files[0]; if(!f2) return;
              var rd=new FileReader();
              rd.onload = function(ev){
                var process = function(c){
                  App.LS.set(ic.id, c);
                  // 网格小图
                  box.querySelector('img').src = c;
                  // 页面真身
                  var tEl = document.querySelector(ic.target);
                  if(tEl) tEl.src = c;
                  // 预览台
                  if(ic.live){ var liveImg = panel.querySelector(ic.live); if(liveImg) liveImg.src = c; }
                  App.showToast(ic.label+' 图标已更换');
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

    applyBg: function(data){
      var layer = App.$('#bgLayer'); if(!layer) return;
      if(data && data.src){
        layer.style.backgroundImage = 'url('+data.src+')';
        layer.style.filter = 'blur('+(data.blur||0)+'px) brightness('+(100-(data.dark||0))+'%)';
      } else {
        layer.style.backgroundImage = '';
        layer.style.filter = '';
      }
    },

    applyTopIconStyle: function(cfg){
      var styleId = 'topIconDynamicStyle';
      var styleEl = document.getElementById(styleId);
      if(!styleEl){ styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
      var bColor = cfg.borderColor || '#dcebff';
      var sColor = cfg.shadowColor || '#dcebff';
      styleEl.innerHTML =
        '.card-icon-img { ' +
          'border: '+cfg.borderW+'px solid '+bColor+' !important; ' +
          'box-shadow: '+cfg.shadow+'px '+cfg.shadow+'px 0 '+sColor+' !important; ' +
          'border-radius: 15px !important; ' +
        '}';
    }
  };

  App.register('bg', Bg);
})();
