
(function(){
'use strict';
var App=window.App;if(!App)return;
function pad(n){return n<10?'0'+n:''+n;}

var Cal={
  weather:null,
  city:'',
  _clockTimer:null,
  _refreshTimer:null,
  
  /* 🌟 全新三挡状态：'animated'(动态), 'static'(静态), 'none'(彻底关闭) */
  _weatherMode: 'animated', 
  /* 🌟 双生排版状态：'outside'(头像分离独立), 'inside'(头卡内嵌卡片) */
  _layoutMode: 'outside',
  
  _dragX:0,
  _dragY:0,

  _weatherMap:{
    '113':'晴','116':'多云','119':'阴','122':'阴','143':'薄雾',
    '176':'小雨','179':'小雪','182':'冻雨','185':'冻雾雨',
    '200':'雷阵雨','227':'小雪','230':'暴雪',
    '248':'雾','260':'冻雾','263':'小雨','266':'小雨','281':'冻雨',
    '284':'冻雨','293':'小雨','296':'小雨','299':'中雨','302':'大雨',
    '305':'大雨','308':'暴雨','311':'冻雨','314':'冻雨',
    '317':'雨夹雪','320':'雨夹雪','323':'小雪','326':'小雪',
    '329':'中雪','332':'中雪','335':'大雪','338':'暴雪',
    '350':'冰粒','353':'小雨','356':'大雨','359':'暴雨',
    '362':'冻雨','365':'冻雨','368':'小雪','371':'大雪',
    '374':'冰粒','377':'冰粒','386':'雷阵雨','389':'雷暴雨',
    '392':'雷阵雪','395':'雷暴雪'
  },

  _codeToEffect:function(code){
    var c=parseInt(code)||0;
    var h=new Date().getHours();
    var isNight = (h>=19 || h<6);
    if(c===113 || c===116){
      return isNight ? 'night' : (c===113 ? 'sunny' : 'cloudy');
    }
    if(c===119||c===122)return 'overcast';
    if(c===143||c===248||c===260)return 'fog';
    if([176,263,266,281,284,293,296].indexOf(c)!==-1)return 'lightrain';
    if([299,302,305,308,311,314,353,356,359,362,365].indexOf(c)!==-1)return 'heavyrain';
    if([200,386,389].indexOf(c)!==-1)return 'thunder';
    if([179,182,185,227,317,320,323,326,368].indexOf(c)!==-1)return 'lightsnow';
    if([230,329,332,335,338,371,374,377,392,395].indexOf(c)!==-1)return 'heavysnow';
    return isNight ? 'night' : 'cloudy';
  },

  load:function(){
    Cal.city=App.LS.get('calCity')||'';
    Cal.weather=App.LS.get('calWeather')||null;
    Cal._layoutMode = App.LS.get('tkLayoutMode') || 'outside'; // 读取排版模式
    
    // 🌟 获取存档里的模式
    var savedMode = App.LS.get('calWeatherMode');
    if (savedMode === undefined || savedMode === null) {
       var legacy = App.LS.get('calWeatherAnimate');
       Cal._weatherMode = (legacy !== false) ? 'animated' : 'static';
    } else {
       Cal._weatherMode = savedMode;
    }
  },

  save:function(){
    App.LS.set('calCity',Cal.city);
    App.LS.set('calWeather',Cal.weather);
  },

  // 魔法切开：给大外壳加盖章控制内部CSS变化
  applyLayout: function() {
    var card = App.$('#wtCard');
    if(!card) return;
    if(Cal._layoutMode === 'inside') {
       card.classList.add('tk17-inside-mode');
    } else {
       card.classList.remove('tk17-inside-mode');
    }
  },

  startClock:function(){
    var mdEl=App.$('#calMonthDay'),wkEl=App.$('#calWeekday'),clockEl=App.$('#calClock');
    if(!clockEl)return;
    var WEEKDAYS_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    function tick(){
      var d=new Date();
      if(mdEl)mdEl.textContent=pad(d.getMonth()+1)+'/'+pad(d.getDate());
      if(wkEl)wkEl.textContent=WEEKDAYS_EN[d.getDay()];
      clockEl.textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
    }
    tick();
    if(Cal._clockTimer)clearInterval(Cal._clockTimer);
    Cal._clockTimer=setInterval(tick,1000);
  },

  applyWeatherText: function() {
    var tEl = App.$('#calTemp');
    var dEl = App.$('#calWeatherDesc');
    if(Cal.weather) {
      if(tEl) tEl.textContent = Cal.weather.temp + '°C';
      if(dEl) dEl.textContent = Cal.weather.desc;
    } else {
      if(tEl) tEl.textContent = '--°C';
      if(dEl) dEl.textContent = '未知';
    }
  },

  renderWeatherEffect:function(){
    var bg=App.$('#wtWeatherBg');if(!bg)return;
    bg.innerHTML='';
    Cal.applyWeatherText();
    var card=App.$('#wtCard');
    
    // 处理冻结特效的逻辑
    if(card) {
       card.classList.remove('wt-static');
       if(Cal._weatherMode === 'static') card.classList.add('wt-static');
    }

    if(Cal._weatherMode === 'none') return; 

    if(!Cal.weather||!Cal.weather.code){
      var h=new Date().getHours();
      if(h>=19||h<6)Cal._renderNight(bg);
      return;
    }
    var effect=Cal._codeToEffect(Cal.weather.code);
    switch(effect){
      case'sunny':Cal._renderSunny(bg);break;
      case'night':Cal._renderNight(bg);break;
      case'cloudy':Cal._renderCloudy(bg);break;
      case'overcast':Cal._renderOvercast(bg);break;
      case'lightrain':Cal._renderRain(bg,5,1.5,2.2,8,12);break;
      case'heavyrain':Cal._renderRain(bg,12,0.8,1.3,10,16);break;
      case'thunder':Cal._renderThunder(bg);break;
      case'lightsnow':Cal._renderSnow(bg,6,4,6,3,5);break;
      case'heavysnow':Cal._renderSnow(bg,14,2.5,4,4,7);break;
      case'fog':Cal._renderFog(bg);break;
    }
  },

  _renderSunny:function(bg){bg.innerHTML='<svg class="wt-sun-svg" viewBox="0 0 120 120" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"><circle cx="60" cy="60" r="20"/><line x1="60" y1="8" x2="60" y2="22"/><line x1="60" y1="98" x2="60" y2="112"/><line x1="8" y1="60" x2="22" y2="60"/><line x1="98" y1="60" x2="112" y2="60"/><line x1="23" y1="23" x2="33" y2="33"/><line x1="87" y1="87" x2="97" y2="97"/><line x1="23" y1="97" x2="33" y2="87"/><line x1="87" y1="33" x2="97" y2="23"/></svg>';},
  _renderNight:function(bg){bg.innerHTML='<svg class="wt-moon" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><defs><mask id="wtMoonMask"><rect width="50" height="50" fill="white"/><circle cx="18" cy="22" r="15" fill="black"/></mask></defs><circle cx="25" cy="25" r="20" fill="rgba(30,30,30,0.9)" mask="url(#wtMoonMask)"/></svg><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div>';},
  _cloudPath:'M14 44C9 44 6 40.5 6 37C6 33.5 9 30 14 30C14 30 15 24 21 21C27 18 33 20 36 24C38 20 42 18 46 20C50 22 52 26 51 30C55 30 58 33.5 58 37C58 40.5 55 44 50 44H14Z',
  _renderCloudy:function(bg){var p=Cal._cloudPath;bg.innerHTML='<svg class="wt-cloud-item" viewBox="0 0 64 64" fill="rgba(50,50,50,0.9)" stroke="none"><path d="'+p+'"/></svg><svg class="wt-cloud-item" viewBox="0 0 64 64" fill="rgba(50,50,50,0.9)" stroke="none"><path d="'+p+'"/></svg><svg class="wt-cloud-item" viewBox="0 0 64 64" fill="rgba(50,50,50,0.9)" stroke="none"><path d="'+p+'"/></svg>';},
  _renderOvercast:function(bg){var p=Cal._cloudPath;bg.innerHTML='<svg class="wt-overcast-item" viewBox="0 0 64 64" fill="rgba(40,40,40,0.9)" stroke="none"><path d="'+p+'"/></svg><svg class="wt-overcast-item" viewBox="0 0 64 64" fill="rgba(40,40,40,0.9)" stroke="none"><path d="'+p+'"/></svg><svg class="wt-overcast-item" viewBox="0 0 64 64" fill="rgba(40,40,40,0.9)" stroke="none"><path d="'+p+'"/></svg>';},
  _renderRain:function(bg,count,minDur,maxDur,minH,maxH){for(var i=0;i<count;i++){var drop=document.createElement('div');drop.className='wt-raindrop';drop.style.left=(5+Math.random()*90)+'%';drop.style.animationDuration=(minDur+Math.random()*(maxDur-minDur))+'s';drop.style.animationDelay=(-Math.random()*3)+'s';drop.style.height=(minH+Math.random()*(maxH-minH))+'px';bg.appendChild(drop);}},
  _renderThunder:function(bg){bg.innerHTML='<div class="wt-flash-overlay"></div><svg class="wt-lightning" width="16" height="30" viewBox="0 0 24 45" fill="none" stroke="rgba(30,30,30,0.9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="14,2 6,20 13,20 8,43"/></svg><svg class="wt-lightning" width="12" height="22" viewBox="0 0 20 35" fill="none" stroke="rgba(30,30,30,0.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="12,2 5,16 11,16 7,33"/></svg>';Cal._renderRain(bg,8,0.7,1.2,8,14);},
  _renderSnow:function(bg,count,minDur,maxDur,minSize,maxSize){for(var i=0;i<count;i++){var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 20 20');svg.setAttribute('class','wt-snow-item');var size=minSize+Math.random()*(maxSize-minSize);svg.style.left=(5+Math.random()*90)+'%';svg.style.width=size+'px';svg.style.height=size+'px';svg.style.animationDuration=(minDur+Math.random()*(maxDur-minDur))+'s';svg.style.animationDelay=(-Math.random()*6)+'s';var path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M10 2L10 18 M3.5 6L16.5 14 M16.5 6L3.5 14 M10 5L8 3 M10 5L12 3 M10 15L8 17 M10 15L12 17');path.setAttribute('stroke','rgba(50,50,50,0.7)');path.setAttribute('stroke-width','1.2');path.setAttribute('stroke-linecap','round');path.setAttribute('fill','none');svg.appendChild(path);bg.appendChild(svg);}},
  _renderFog:function(bg){bg.innerHTML='<div class="wt-fog-layer" style="background:linear-gradient(90deg,transparent,rgba(60,60,60,0.5),rgba(60,60,60,0.3),transparent);"></div><div class="wt-fog-layer" style="background:linear-gradient(90deg,transparent,rgba(50,50,50,0.4),rgba(50,50,50,0.25),transparent);"></div>';},

  _buildFontOptions:function(currentFamily){
    var BUILTIN=[
      {name:'跟随全局',family:''},
      {name:'系统默认',family:'-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif'},
      {name:'霞鹜文楷',family:'"LXGW WenKai",cursive'},
      {name:'思源宋体',family:'"Noto Serif SC",serif'},
      {name:'思源黑体',family:'"Noto Sans SC",sans-serif'},
      {name:'站酷小薇',family:'"ZCOOL XiaoWei",serif'},
      {name:'马善政楷',family:'"Ma Shan Zheng",cursive'}
    ];
    var custom=(App.font&&App.font.customList)||[];
    var all=BUILTIN.concat(custom.map(function(f){return{name:f.fileName||f.name,family:f.family};}));
    return all.map(function(f){
      var sel=(currentFamily===f.family)?'selected':'';
      return '<option value="'+App.escAttr(f.family)+'" '+sel+'>'+App.esc(f.name)+'</option>';
    }).join('');
  },

  applyFont:function(){
    var card=App.$('#wtCard');if(!card)return;
    var fam=App.LS.get('tkFontFamily')||'';
    if(fam){ card.style.fontFamily=fam; }else{ card.style.fontFamily=''; }
  },

  applyTexts:function(){
    var nameEl=App.$('#tkMsgName');
    var signEl=App.$('#tkMsgSign');
    
    var n=App.LS.get('tkMsgName');
    var s=App.LS.get('tkMsgSign');
    var color = App.LS.get('tkColor');
    var avatar = App.LS.get('tkAvatar');

    if(nameEl&&n)nameEl.textContent=n;
    if(signEl&&s)signEl.textContent=s;

    var card = App.$('#wtCard');
    if (card) {
      if(color) {
        card.style.setProperty('--tk-color', color);
      } else {
        card.style.removeProperty('--tk-color');
      }
    }

    var avEl = App.$('#tkAvatarBg');
    if(avEl) {
       if (avatar) {
          avEl.style.backgroundImage = 'url('+avatar+')';
       } else {
          avEl.style.backgroundImage = '';
       }
    }
  },

  applyBgImg:function(){
    var el=App.$('#tkBgArea');if(!el)return;
    var img=App.LS.get('calBgImg')||'';
    if(img){
      el.style.backgroundImage='url('+img+')';
      var glass=App.$('#tkGlass');
      if(glass)glass.classList.add('hide');
    }else{
      el.style.backgroundImage='';
      var glass=App.$('#tkGlass');
      if(glass)glass.classList.remove('hide');
    }
  },

  fetchWeather:function(city,callback){
    if(!city){if(callback)callback(null);return;}
    fetch('https://wttr.in/'+encodeURIComponent(city)+'?format=j1').then(function(r){if(!r.ok)throw new Error();return r.json();}).then(function(data){
      if(data&&data.current_condition&&data.current_condition.length){
        var c=data.current_condition[0];
        var code=c.weatherCode||'';
        var desc=Cal._weatherMap[code]||(c.lang_zh&&c.lang_zh.length?c.lang_zh[0].value:'')|| (c.weatherDesc&&c.weatherDesc.length?c.weatherDesc[0].value:'')||'未知';
        Cal.weather={temp:c.temp_C,humidity:c.humidity,desc:desc,code:code,time:Date.now()};
        Cal.save();Cal.renderWeatherEffect();if(callback)callback(Cal.weather);
      }else{if(callback)callback(null);}
    }).catch(function(){if(callback)callback(null);});
  },

  getWeatherSummary:function(){if(!Cal.weather)return'';return'当前天气: '+Cal.weather.desc+', '+Cal.weather.temp+'°C, 湿度'+Cal.weather.humidity+'%';},
  getLocationForAI:function(){return Cal.city||'';},

  _editPanel:null,

  openEditPanel:function(){
    if(Cal._editPanel){
      if (Cal._closePanelFn) Cal._closePanelFn();
      return;
    }

    var currentColor = App.LS.get('tkColor') || '#111111';

    // 🌟 读取模式名字准备渲染
    var modeName = '动态';
    if(Cal._weatherMode === 'static') modeName = '静态';
    else if(Cal._weatherMode === 'none') modeName = '关闭';

    var overlay=document.createElement('div');
    overlay.className='pc-edit-overlay';
    overlay.style.zIndex='100020';
    Cal._editPanel=overlay;

    var panel=document.createElement('div');
    panel.className='pc-edit-panel';
    
    panel.innerHTML=
      '<div class="pc-header">日历排版设置<div class="pc-close-btn" id="wtEditClose">×</div></div>'+
      
      '<div class="pc-body">'+
        '<div style="display:flex; gap:12px;">'+
          '<div class="pc-group" style="flex:1;">'+
            '<span class="pc-label">左侧头像</span>'+
            '<div class="pc-av-row">'+
              '<div class="pc-icon-btn" id="wtAvUploadBtn" title="更换头像"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg></div>'+
              '<div class="pc-icon-btn danger" id="wtAvClearBtn" title="恢复默认"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"/></svg></div>'+
            '</div>'+
          '</div>'+
          '<div class="pc-group" style="flex:1;">'+
            '<span class="pc-label">背景图片</span>'+
            '<div class="pc-av-row">'+
              '<div class="pc-icon-btn" id="wtBgUploadBtn" title="上传背景"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg></div>'+
              '<div class="pc-icon-btn danger" id="wtBgClearBtn" title="清除背景"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"/></svg></div>'+
            '</div>'+
            '<input type="file" id="wtBgFileInput" accept="image/*" style="display:none;">'+
          '</div>'+
        '</div>'+

        '<div style="display:flex; gap:8px;">'+
          '<div class="pc-group" style="flex:1;">'+
            '<span class="pc-label">城市（获取天气）</span>'+
            '<div class="pc-av-row">'+
              '<input type="text" class="pc-input" id="wtCityInput" placeholder="输入城市名..." value="'+App.esc(Cal.city||'')+'">'+
              '<div class="pc-icon-btn" id="wtCitySearchBtn"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>'+
            '</div>'+
          '</div>'+
          '<div class="pc-group" style="width:65px; flex-shrink:0;">'+
            '<span class="pc-label">排版模式</span>'+
            '<div class="pc-icon-btn" id="wtLayoutToggle" style="width:100%;font-size:11px;font-weight:700;">'+ (Cal._layoutMode==='inside'?'内嵌':'分离') +'</div>'+
          '</div>'+
          '<div class="pc-group" style="width:65px; flex-shrink:0;">'+
            '<span class="pc-label">视觉特效</span>'+
            '<div class="pc-icon-btn" id="wtAnimToggle" style="width:100%;font-size:11px;font-weight:700;">'+ modeName +'</div>'+
          '</div>'+
        '</div>'+

        '<div class="pc-group">'+
          '<span class="pc-label">昵称</span>'+
          '<input type="text" class="pc-input" id="wtNameInput" placeholder="昵称..." value="'+App.esc(App.LS.get('tkMsgName')||'')+'">'+
        '</div>'+
        '<div class="pc-group">'+
          '<span class="pc-label">签名</span>'+
          '<input type="text" class="pc-input" id="wtSignInput" placeholder="签名..." value="'+App.esc(App.LS.get('tkMsgSign')||'')+'">'+
        '</div>'+

        '<div class="pc-group">'+
          '<span class="pc-label">字体 & 颜色</span>'+
          '<div class="pc-av-row">'+
            '<select class="pc-input" id="wtFontSelect">'+Cal._buildFontOptions(App.LS.get('tkFontFamily')||'')+'</select>'+
            '<div class="pc-icon-btn" id="wtColorBtn" style="background:'+App.escAttr(currentColor)+'; cursor:pointer; flex-shrink:0;"></div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      
      '<div class="pc-footer">'+
        '<button class="pc-btn pc-btn-save" id="wtEditSave">保存</button>'+
      '</div>';

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    var pRect = panel.getBoundingClientRect();
    var startLeft = (window.innerWidth - pRect.width) / 2;
    var startTop = window.innerHeight - pRect.height - 40;
    if (startTop < 10) startTop = 10;
    
    panel.style.left = startLeft + 'px';
    panel.style.top = startTop + 'px';
    panel.style.margin = '0';

    var header = panel.querySelector('.pc-header');
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var panelStartLeft = 0, panelStartTop = 0;

    function onDragStart(e) {
      if (e.target.closest('.pc-close-btn')) return;
      isDragging = true;
      var t = e.touches ? e.touches[0] : e;
      dragStartX = t.clientX;
      dragStartY = t.clientY;
      var rect = panel.getBoundingClientRect();
      panelStartLeft = rect.left;
      panelStartTop = rect.top;
      
      panel.style.transform = 'none';
      panel.style.bottom = 'auto';
      panel.style.right = 'auto';
    }

    function onDragMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      var t = e.touches ? e.touches[0] : e;
      var dx = t.clientX - dragStartX;
      var dy = t.clientY - dragStartY;
      panel.style.left = (panelStartLeft + dx) + 'px';
      panel.style.top = (panelStartTop + dy) + 'px';
    }

    function onDragEnd() { isDragging = false; }

    header.addEventListener('touchstart', onDragStart, {passive: true});
    document.addEventListener('touchmove', onDragMove, {passive: false});
    document.addEventListener('touchend', onDragEnd);

    var closePanel = function() {
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
      Cal._editPanel.remove();
      Cal._editPanel = null;
      Cal._closePanelFn = null;
    };
    Cal._closePanelFn = closePanel;

    panel.querySelector('#wtEditClose').addEventListener('click',function(e){e.stopPropagation(); closePanel();});
    overlay.addEventListener('click',function(e){if(e.target===overlay) closePanel();});
    panel.addEventListener('click',function(e){e.stopPropagation();});

    panel.querySelector('#wtBgUploadBtn').addEventListener('click',function(){ panel.querySelector('#wtBgFileInput').click(); });
    panel.querySelector('#wtBgFileInput').addEventListener('change',function(e){
      var file=e.target.files[0];if(!file)return;
      var reader=new FileReader();
      reader.onload=function(ev){
        var process=function(src){
          App.LS.set('calBgImg',src);
          Cal.applyBgImg();
          App.showToast('背景已设置');
        };
        if(App.cropImage)App.cropImage(ev.target.result,process);
        else process(ev.target.result);
      };
      reader.readAsDataURL(file);
      e.target.value='';
    });
    panel.querySelector('#wtBgClearBtn').addEventListener('click',function(){
      App.LS.remove('calBgImg');
      Cal.applyBgImg();
      App.showToast('背景已清除');
    });

    panel.querySelector('#wtAvUploadBtn').addEventListener('click',function(){
      if(App.showImagePicker) {
         App.showImagePicker({
            title: '选择新头像',
            callback: function(src){
               if(src) {
                  App.LS.set('tkAvatar', src);
                  Cal.applyTexts();
                  App.showToast('头像已更换');
               }
            }
         });
      }
    });
    panel.querySelector('#wtAvClearBtn').addEventListener('click',function(){
      App.LS.remove('tkAvatar');
      Cal.applyTexts();
      App.showToast('已恢复默认头像');
    });

    panel.querySelector('#wtColorBtn').addEventListener('click', function(){
      var cur = panel.dataset.pickedColor || App.LS.get('tkColor') || '#111111';
      App.openColorPicker(cur, function(color){
         panel.querySelector('#wtColorBtn').style.background = color;
         panel.dataset.pickedColor = color;
         var card = App.$('#wtCard');
         if(card) card.style.setProperty('--tk-color', color);
      }, function(color){
         var card = App.$('#wtCard');
         if(card) card.style.setProperty('--tk-color', color);
      });
    });

    panel.querySelector('#wtCitySearchBtn').addEventListener('click',function(){
      var name=panel.querySelector('#wtCityInput').value.trim();
      if(!name){App.showToast('请输入城市名');return;}
      App.showToast('获取天气中...');
      Cal.city=name;Cal.save();
      Cal.fetchWeather(name,function(w){
        if(w){ closePanel(); Cal.openEditPanel(); App.showToast(w.desc+' '+w.temp+'°C');}
        else App.showToast('获取失败');
      });
    });

    /* 🌟 新增的排版切换：内嵌与分离的魔法开关 */
    panel.querySelector('#wtLayoutToggle').addEventListener('click',function(){
      Cal._layoutMode = (Cal._layoutMode === 'inside') ? 'outside' : 'inside';
      App.LS.set('tkLayoutMode', Cal._layoutMode);
      this.textContent = (Cal._layoutMode === 'inside') ? '内嵌' : '分离';
      Cal.applyLayout(); // 立刻预览
    });

    panel.querySelector('#wtAnimToggle').addEventListener('click',function(){
      if(Cal._weatherMode === 'animated') {
         Cal._weatherMode = 'static';
      } else if (Cal._weatherMode === 'static') {
         Cal._weatherMode = 'none';
      } else {
         Cal._weatherMode = 'animated';
      }
      App.LS.set('calWeatherMode', Cal._weatherMode);

      var txt = '关闭';
      if (Cal._weatherMode === 'animated') txt = '动态';
      else if (Cal._weatherMode === 'static') txt = '静态';
      
      this.textContent = txt;
      Cal.renderWeatherEffect(); 
    });

    panel.querySelector('#wtFontSelect').addEventListener('change',function(){
      var fam=this.value;
      App.LS.set('tkFontFamily',fam);
      Cal.applyFont();
    });

    panel.querySelector('#wtEditSave').addEventListener('click',function(){
      var name=panel.querySelector('#wtNameInput').value.trim();
      var sign=panel.querySelector('#wtSignInput').value.trim();
      var font=panel.querySelector('#wtFontSelect').value;
      var newColor = panel.dataset.pickedColor; 
      
      App.LS.set('tkMsgName',name);
      App.LS.set('tkMsgSign',sign);
      App.LS.set('tkFontFamily',font);
      if(newColor) App.LS.set('tkColor', newColor);
      
      Cal.applyTexts();
      Cal.applyFont();
      closePanel();
      App.showToast('已保存');
    });
  },

  initDrag:function(){
    var card=App.$('#wtCard');if(!card||card._wtDragBound)return;
    card._wtDragBound=true;
    var DELAY=500;
    var startX,startY,origX,origY,longPressed=false,timer,moved=false;
    var saved=App.LS.get('wtCardPos');
    
    if(saved){
      Cal._dragX=saved.x||0;Cal._dragY=saved.y||0;
      var tf = 'translate('+Cal._dragX+'px,'+Cal._dragY+'px)';
      card.style.setProperty('--t', tf);
      card.style.transform = tf;
    }

    card.addEventListener('touchstart',function(e){
      var t=e.touches[0];startX=t.clientX;startY=t.clientY;
      longPressed=false;moved=false;
      timer=setTimeout(function(){
        longPressed=true;origX=Cal._dragX;origY=Cal._dragY;
        card.classList.add('is-grabbed'); 
        card.style.transition='transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease';
        var tf = 'translate('+origX+'px,'+origY+'px) scale(1.05)';
        card.style.setProperty('--t', tf);
        card.style.transform = tf;
        card.style.zIndex='999';
        card.style.boxShadow='0 25px 50px rgba(0,0,0,0.18)'; 
        if(navigator.vibrate)navigator.vibrate(15);
      },DELAY);
    },{passive:true});

    card.addEventListener('touchmove',function(e){
      var t=e.touches[0];
      if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
      if(!longPressed)return;
      moved=true;e.preventDefault();e.stopPropagation();
      Cal._dragX=origX+(t.clientX-startX);Cal._dragY=origY+(t.clientY-startY);
      card.style.transition='none';
      var tf = 'translate('+Cal._dragX+'px,'+Cal._dragY+'px) scale(1.05)';
      card.style.setProperty('--t', tf);
      card.style.transform = tf;
    },{passive:false});

    card.addEventListener('touchend',function(){
      clearTimeout(timer);timer=null;
      card.classList.remove('is-grabbed');
      card.style.boxShadow='';
      if(longPressed){
        if(moved)App.LS.set('wtCardPos',{x:Cal._dragX,y:Cal._dragY});
        card.style.transition='transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        var tf = 'translate('+Cal._dragX+'px,'+Cal._dragY+'px) scale(1)';
        card.style.setProperty('--t', tf);
        card.style.transform = tf;
        card.style.zIndex=''; 
        setTimeout(function(){ card.style.transition=''; }, 350);
      } else {
        card.style.zIndex='';
      }
      longPressed=false;moved=false;
    });
  },

  bindClicks: function() {
    var avatarEl = App.$('.tk17-avatar');
    var rightCardEl = App.$('.tk17-right-card');
    
    var lastTapAv = 0;
    var lastTapCard = 0;

    if (avatarEl) {
      avatarEl.addEventListener('click', function(e) {
        e.stopPropagation();
        var now = Date.now();
        if (now - lastTapAv < 350) {
          Cal.openEditPanel();
        }
        lastTapAv = now;
      });
    }

    if (rightCardEl) {
      rightCardEl.addEventListener('click', function(e) {
        e.stopPropagation();
        var now = Date.now();
        if (now - lastTapCard < 350) {
          Cal.openEditPanel();
        }
        lastTapCard = now;
      });
    }
  },

  startAutoRefresh:function(){
    if(Cal._refreshTimer)clearInterval(Cal._refreshTimer);
    Cal._refreshTimer=setInterval(function(){if(Cal.city)Cal.fetchWeather(Cal.city,function(){});},30*60*1000);
  },

  init:function(){
    Cal.load();
    Cal.applyLayout(); // 初始化时自动挂载上次记录的排版！
    Cal.startClock();
    Cal.renderWeatherEffect();
    Cal.applyBgImg();
    Cal.applyTexts();
    Cal.applyFont();
    Cal.initDrag();
    Cal.bindClicks();
    if(Cal.city&&Cal.weather){
      var age=Date.now()-(Cal.weather.time||0);
      if(age>30*60*1000)Cal.fetchWeather(Cal.city,function(){});
    }else if(Cal.city){
      Cal.fetchWeather(Cal.city,function(){});
    }
    Cal.startAutoRefresh();
    App.calendar=Cal;
  }
};

App.register('calendar',Cal);
})();
