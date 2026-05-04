(function(){
  'use strict';
  var App = window.App; if(!App)return;

  var Bg = {
    init: function() {
      var bgData = App.LS.get('bgData') || {};
      Bg.applyBg(bgData);
      
      var uploadArea = App.$('#bgUploadArea');
      var fileInput = App.$('#bgFileInput');
      var preview = App.$('#bgPreview');
      var previewImg = App.$('#bgPreviewImg');
      var blurSlider = App.$('#bgBlur');
      var blurVal = App.$('#bgBlurVal');
      var darkSlider = App.$('#bgDark');
      var darkVal = App.$('#bgDarkVal');
      var applyBtn = App.$('#applyBgBtn');
      var removeBtn = App.$('#removeBgBtn');
      
      if(bgData.src) {
         previewImg.src = bgData.src;
         preview.classList.remove('hidden');
      }
      if(bgData.blur != null) { blurSlider.value = bgData.blur; blurVal.textContent = bgData.blur + 'px'; }
      if(bgData.dark != null) { darkSlider.value = bgData.dark; darkVal.textContent = bgData.dark + '%'; }
      
      uploadArea.addEventListener('click', function(){ fileInput.click(); });
      fileInput.addEventListener('change', function(e){
         var file = e.target.files[0]; if(!file) return;
         var reader = new FileReader();
         reader.onload = function(ev) {
            Bg.compress(ev.target.result, function(c){
               previewImg.src = c;
               preview.classList.remove('hidden');
            });
         };
         reader.readAsDataURL(file);
      });
      
      blurSlider.addEventListener('input', function(){ blurVal.textContent = this.value + 'px'; });
      darkSlider.addEventListener('input', function(){ darkVal.textContent = this.value + '%'; });
      
      applyBtn.addEventListener('click', function(){
         var src = previewImg.src;
         if(!src || src.endsWith('index.html')) { App.showToast('请先上传图片'); return; }
         var data = { src: src, blur: blurSlider.value, dark: darkSlider.value };
         App.LS.set('bgData', data);
         Bg.applyBg(data);
         App.showToast('背景已应用');
      });
      
      removeBtn.addEventListener('click', function(){
         App.LS.remove('bgData');
         previewImg.src = '';
         preview.classList.add('hidden');
         Bg.applyBg({});
         App.showToast('背景已移除');
      });

      // == 注入超酷的图标管理 UI ==
      Bg.injectIconManager();
    },

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

    injectIconManager: function() {
      var panelBody = document.querySelector('#bgPanel .panel-body');
      if(!panelBody) return;

      var iconConfig = App.LS.get('topIconConfig') || { borderW: 1.3, shadow: 14 };

      var html = '<div style="height:1px;background:rgba(0,0,0,0.06);margin:20px 0;"></div>' +
                 '<h3 style="font-size:14px;font-weight:800;color:#111;margin-bottom:4px;">图标管理</h3>' +
                 '<div style="font-size:11px;color:#999;margin-bottom:12px;">点击图片即可单独更换各区域图标</div>' +
                 '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;" id="bgIconGrid"></div>' +
                 '<h3 style="font-size:12px;font-weight:800;color:#111;margin-bottom:8px;">上侧图标全局样式</h3>' +
                 '<div class="form-group" style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
                   '<label style="font-size:12px;font-weight:700;color:#555;width:60px;">边框粗细</label>' +
                   '<input type="range" id="topIconBorder" min="0" max="5" step="0.5" value="'+iconConfig.borderW+'" style="flex:1;height:4px;border-radius:2px;outline:none;background:#e0e0e0;-webkit-appearance:none;">' +
                   '<span id="topIconBorderVal" style="font-size:11px;font-weight:700;width:30px;text-align:right;">'+iconConfig.borderW+'px</span>' +
                 '</div>' +
                 '<div class="form-group" style="display:flex;align-items:center;gap:10px;">' +
                   '<label style="font-size:12px;font-weight:700;color:#555;width:60px;">阴影强度</label>' +
                   '<input type="range" id="topIconShadow" min="0" max="30" step="1" value="'+iconConfig.shadow+'" style="flex:1;height:4px;border-radius:2px;outline:none;background:#e0e0e0;-webkit-appearance:none;">' +
                   '<span id="topIconShadowVal" style="font-size:11px;font-weight:700;width:30px;text-align:right;">'+iconConfig.shadow+'px</span>' +
                 '</div>';
      
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      panelBody.appendChild(wrapper);

      // 图标定义表
      var icons = [
        { id: 'customIcon_cg', label: '查岗(上)', target: '#cardIcon1 img', def: 'https://iili.io/BsSI1j9.md.jpg' },
        { id: 'customIcon_lt', label: '论坛(上)', target: '#cardIcon2 img', def: 'https://iili.io/BQ98Pxp.md.jpg' },
        { id: 'customIcon_dockMine', label: '助手(底)', target: '#dockMine img', def: 'https://iili.io/B5DgD5N.jpg' },
        { id: 'customIcon_dockLong', label: '角色(底)', target: '#dockLong img', def: 'https://iili.io/BudrfVa.md.jpg' },
        { id: 'customIcon_dockShort', label: '聊天(底)', target: '#dockShort img', def: 'https://iili.io/BsZkNx1.md.jpg' },
        { id: 'customIcon_dockCheck', label: '查岗(底)', target: '#dockCheck img', def: 'https://iili.io/BghjowQ.md.jpg' }
      ];

      var grid = panelBody.querySelector('#bgIconGrid');
      icons.forEach(function(ic) {
        var src = App.LS.get(ic.id) || ic.def;
        var box = document.createElement('div');
        box.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;';
        box.innerHTML = '<div class="bg-ic-preview" style="width:50px;height:50px;border-radius:12px;border:1.5px solid #ddd;overflow:hidden;background:#f5f5f5;box-shadow:0 2px 6px rgba(0,0,0,0.05);"><img src="'+App.escAttr(src)+'" style="width:100%;height:100%;object-fit:cover;display:block;"></div><div style="font-size:10px;font-weight:700;color:#666;">'+ic.label+'</div>';
        
        box.addEventListener('click', function() {
           var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
           input.onchange = function(e) {
              var file = e.target.files[0]; if(!file) return;
              var reader = new FileReader();
              reader.onload = function(ev) {
                 var process = function(c) {
                    App.LS.set(ic.id, c);
                    box.querySelector('img').src = c;
                    var tEl = document.querySelector(ic.target);
                    if(tEl) { tEl.src = c; }
                    else if (ic.target === '#cardIcon1 img' || ic.target === '#cardIcon2 img') {
                      // 备用兼容，如果img拿不到就改父div背景图
                      var parent = document.querySelector(ic.target.replace(' img', ''));
                      if(parent) parent.style.backgroundImage = 'url('+c+')';
                    }
                    App.showToast(ic.label + ' 已更换');
                 };
                 if(App.cropImage) App.cropImage(ev.target.result, function(c){ Bg.compress(c, process); });
                 else Bg.compress(ev.target.result, process);
              };
              reader.readAsDataURL(file);
           };
           input.click();
        });
        grid.appendChild(box);
      });

      // 初始化上侧图标CSS
      Bg.applyTopIconStyle(iconConfig);

      // 绑定滑块逻辑
      var bwSlider = panelBody.querySelector('#topIconBorder');
      var shSlider = panelBody.querySelector('#topIconShadow');
      
      var updateStyle = function() {
         var w = bwSlider.value, s = shSlider.value;
         panelBody.querySelector('#topIconBorderVal').textContent = w + 'px';
         panelBody.querySelector('#topIconShadowVal').textContent = s + 'px';
         var cfg = { borderW: w, shadow: s };
         App.LS.set('topIconConfig', cfg);
         Bg.applyTopIconStyle(cfg);
      };

      bwSlider.addEventListener('input', updateStyle);
      shSlider.addEventListener('input', updateStyle);
    },

    applyTopIconStyle: function(cfg) {
      var styleId = 'topIconDynamicStyle';
      var styleEl = document.getElementById(styleId);
      if(!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
      // 强力覆盖上侧图标的样式
      styleEl.innerHTML = '.card-icon-img { border-width: ' + cfg.borderW + 'px !important; box-shadow: 0 ' + cfg.shadow + 'px 30px rgba(20,35,55,.14) !important; }';
    }
  };

  App.register('bg', Bg);
})();