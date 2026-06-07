
(function(){
'use strict';
var App=window.App;if(!App)return;
var WK=['周日','周一','周二','周三','周四','周五','周六'];
function pad(n){return n<10?'0'+n:''+n;}
var CARD_DEFAULTS={scale:100,alpha:0,blur:7,radius:10,colorHex:'#ffffff',borderAlpha:15,fontColor:'#1a1a1a',lineColor:'#1a1a1a'};

var Cal={
  weather:null,city:'',virtualCity:'',schedules:{},cardConfig:{},WEEKDAYS:WK,
  _clockTimer:null,_refreshTimer:null,_colorPanelEl:null,
  _weatherAnimate:true,

  // 天气代码 → 中文映射
  _weatherMap:{
    '113':'晴','116':'多云','119':'阴','122':'阴','143':'雾',
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

  // 天气代码 → 效果类型
  _codeToEffect:function(code){
    var c=parseInt(code)||0;
    if(c===113){
      var h=new Date().getHours();
      return (h>=19||h<6)?'night':'sunny';
    }
    if(c===116)return 'cloudy';
    if(c===119||c===122)return 'overcast';
    if(c===143||c===248||c===260)return 'fog';
    if([176,263,266,281,284,293,296].indexOf(c)!==-1)return 'lightrain';
    if([299,302,305,308,311,314,353,356,359,362,365].indexOf(c)!==-1)return 'heavyrain';
    if([200,386,389].indexOf(c)!==-1)return 'thunder';
    if([179,182,185,227,317,320,323,326,368].indexOf(c)!==-1)return 'lightsnow';
    if([230,329,332,335,338,371,374,377,392,395].indexOf(c)!==-1)return 'heavysnow';
    return 'cloudy';
  },

  load:function(){
    Cal.city=App.LS.get('calCity')||'';
    Cal.virtualCity=App.LS.get('calVirtualCity')||'';
    Cal.weather=App.LS.get('calWeather')||null;
    Cal.schedules=App.LS.get('calSchedules')||{};
    Cal.cardConfig=App.LS.get('wtCardConfig')||JSON.parse(JSON.stringify(CARD_DEFAULTS));
    var anim=App.LS.get('calWeatherAnimate');
    Cal._weatherAnimate=anim!==false;
  },
  save:function(){App.LS.set('calCity',Cal.city);App.LS.set('calVirtualCity',Cal.virtualCity);App.LS.set('calWeather',Cal.weather);App.LS.set('calSchedules',Cal.schedules);},
  saveCardConfig:function(){App.LS.set('wtCardConfig',Cal.cardConfig);},
  todayKey:function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');},

  hexToRgb:function(hex){
    hex=hex||'#ffffff';
    if(hex.length===4)hex='#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
    var r=parseInt(hex.substr(1,2),16),g=parseInt(hex.substr(3,2),16),b=parseInt(hex.substr(5,2),16);
    return{r:isNaN(r)?255:r,g:isNaN(g)?255:g,b:isNaN(b)?255:b};
  },

  applyCardConfig:function(cfg){
    var card=App.$('#wtCard');if(!card)return;
    var c=cfg||Cal.cardConfig;
    var s=(c.scale||100)/100;
    var rgb=Cal.hexToRgb(c.colorHex);
    var frgb=Cal.hexToRgb(c.fontColor||'#1a1a1a');
    var lrgb=Cal.hexToRgb(c.lineColor||'#1a1a1a');
    var a=(c.alpha!=null?c.alpha:0)/100;
    var ba=(c.borderAlpha!=null?c.borderAlpha:15)/100;
    var bv=c.blur!=null?c.blur:7;
    var fc=c.fontColor||'#1a1a1a';
    var fc75='rgba('+frgb.r+','+frgb.g+','+frgb.b+',0.75)';
    var fc50='rgba('+frgb.r+','+frgb.g+','+frgb.b+',0.5)';
    var fc40='rgba('+frgb.r+','+frgb.g+','+frgb.b+',0.4)';
    var fc30='rgba('+frgb.r+','+frgb.g+','+frgb.b+',0.3)';
    var lc04='rgba('+lrgb.r+','+lrgb.g+','+lrgb.b+',0.04)';
    var lc08='rgba('+lrgb.r+','+lrgb.g+','+lrgb.b+',0.08)';
    var lc12='rgba('+lrgb.r+','+lrgb.g+','+lrgb.b+',0.12)';
    var lc25='rgba('+lrgb.r+','+lrgb.g+','+lrgb.b+',0.25)';

    card.style.setProperty('--S',s);
    card.style.setProperty('--wt-ink',fc);
    card.style.setProperty('--wt-ink2',fc75);
    card.style.setProperty('--wt-ink3',fc50);
    card.style.setProperty('--wt-ink4',fc30);
    card.style.setProperty('--wt-line',lc08);
    card.style.setProperty('--wt-line2',lc04);
    card.style.setProperty('--wt-gold',lc25);
    card.style.setProperty('--wt-gold2',lc12);

    var cw=card.querySelector('.wt-cw');
    if(cw){
      cw.style.background='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+a+')';
      cw.style.backdropFilter=bv>0?'blur('+bv+'px)':'none';
      cw.style.webkitBackdropFilter=bv>0?'blur('+bv+'px)':'none';
      cw.style.border=(1*s)+'px solid rgba('+rgb.r+','+rgb.g+','+rgb.b+','+ba+')';
      cw.style.borderRadius=((c.radius||10)*s)+'px';
      cw.style.boxShadow='0 4px 20px rgba(0,0,0,0.01)';
    }

    card.querySelectorAll('.wt-time,.wt-time span').forEach(function(el){el.style.color=fc;});
    card.querySelectorAll('.wt-sec,.wt-sec span').forEach(function(el){el.style.color=fc;});
    card.querySelectorAll('.wt-date,.wt-date span,.wt-wk').forEach(function(el){el.style.color=fc;});
    card.querySelectorAll('.vf-lbl').forEach(function(el){el.style.color=fc40;});
    var coords=card.querySelector('#location-coords');if(coords)coords.style.color=fc;
    card.querySelectorAll('.wt-temp').forEach(function(el){el.style.color=fc;});
    card.querySelectorAll('.wt-deg').forEach(function(el){el.style.color=fc;});
    card.querySelectorAll('.wt-desc').forEach(function(el){el.style.color=fc;});

    var lg='linear-gradient(90deg, transparent, '+lc08+', transparent)';
    card.querySelectorAll('.wt-tl').forEach(function(el){el.style.background=lg;});
    card.querySelectorAll('.wt-wl').forEach(function(el){el.style.background=lg;});
    card.querySelectorAll('.wt-vd').forEach(function(el){el.style.background='linear-gradient(180deg, transparent 5%, '+lc12+' 30%, '+lc12+' 70%, transparent 95%)';});
    card.querySelectorAll('.vf-hl').forEach(function(el){el.style.background='linear-gradient(90deg, transparent, '+lc12+', transparent)';});
  },

  startClock:function(){
    var hh=App.$('#wt-hh'),mm=App.$('#wt-mm'),ss=App.$('#wt-ss'),fd=App.$('#wt-fd'),wk=App.$('#wt-wk');
    if(!hh||!mm||!ss||!fd||!wk)return;
    function tick(){
      var d=new Date();
      hh.textContent=pad(d.getHours());mm.textContent=pad(d.getMinutes());ss.textContent=pad(d.getSeconds());
      fd.textContent=d.getFullYear()+'年'+pad(d.getMonth()+1)+'月'+pad(d.getDate())+'日';
      wk.textContent=WK[d.getDay()];
    }
    tick();
    if(Cal._clockTimer)clearInterval(Cal._clockTimer);
    Cal._clockTimer=setInterval(tick,1000);
  },

  // ====== 日期条渲染 ======
  renderWeekRow:function(){
    var container=App.$('#wtWeekRow');if(!container)return;
    var now=new Date();
    var today=now.getDate();
    var month=now.getMonth();
    var dayOfWeek=now.getDay();
    var weekStart=new Date(now);
    weekStart.setDate(today-dayOfWeek);

    var html='';
    for(var i=0;i<7;i++){
      var d=new Date(weekStart);
      d.setDate(weekStart.getDate()+i);
      var dayNum=d.getDate();
      var cls='wt-week-day'+((dayNum===today&&d.getMonth()===month)?' today':'');
      html+='<div class="'+cls+'">'+dayNum+'</div>';
    }
    container.innerHTML=html;
  },

  // ====== 天气动效渲染 ======
  renderWeatherEffect:function(){
    var bg=App.$('#wtWeatherBg');if(!bg)return;
    bg.innerHTML='';

    var cw=bg.closest('.wt-cw');
    if(cw){
      cw.classList.remove('wt-static');
      if(!Cal._weatherAnimate)cw.classList.add('wt-static');
    }

    if(!Cal.weather||!Cal.weather.code){
      // 没有天气数据时，根据时间判断白天/夜晚
      var h=new Date().getHours();
      if(h>=19||h<6){Cal._renderNight(bg);}
      return;
    }

    var effect=Cal._codeToEffect(Cal.weather.code);
    switch(effect){
      case 'sunny':Cal._renderSunny(bg);break;
      case 'night':Cal._renderNight(bg);break;
      case 'cloudy':Cal._renderCloudy(bg);break;
      case 'overcast':Cal._renderOvercast(bg);break;
      case 'lightrain':Cal._renderRain(bg,8,1.5,2.2,12,18);break;
      case 'heavyrain':Cal._renderRain(bg,22,0.8,1.3,16,26);break;
      case 'thunder':Cal._renderThunder(bg);break;
      case 'lightsnow':Cal._renderSnow(bg,10,4,6,5,8);break;
      case 'heavysnow':Cal._renderSnow(bg,24,2.5,4,6,11);break;
      case 'fog':Cal._renderFog(bg);break;
    }
  },

  _renderSunny:function(bg){
    bg.innerHTML='<svg class="wt-sun-svg" viewBox="0 0 120 120" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"><circle cx="60" cy="60" r="20"/><line x1="60" y1="8" x2="60" y2="22"/><line x1="60" y1="98" x2="60" y2="112"/><line x1="8" y1="60" x2="22" y2="60"/><line x1="98" y1="60" x2="112" y2="60"/><line x1="23" y1="23" x2="33" y2="33"/><line x1="87" y1="87" x2="97" y2="97"/><line x1="23" y1="97" x2="33" y2="87"/><line x1="87" y1="33" x2="97" y2="23"/></svg>';
  },

  _renderNight:function(bg){
    bg.innerHTML='<svg class="wt-moon" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><defs><mask id="wtMoonMask"><rect width="50" height="50" fill="white"/><circle cx="18" cy="22" r="15" fill="black"/></mask></defs><circle cx="25" cy="25" r="20" fill="rgba(30,30,30,0.9)" mask="url(#wtMoonMask)"/></svg><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div><div class="wt-star"></div>';
  },

  _cloudPath:'M14 44C9 44 6 40.5 6 37C6 33.5 9 30 14 30C14 30 15 24 21 21C27 18 33 20 36 24C38 20 42 18 46 20C50 22 52 26 51 30C55 30 58 33.5 58 37C58 40.5 55 44 50 44H14Z',

  _renderCloudy:function(bg){
    var p=Cal._cloudPath;
    bg.innerHTML='<svg class="wt-cloud-item" viewBox="0 0 64 64" fill="rgba(50,50,50,0.9)" stroke="none"><path d="'+p+'"/></svg><svg class="wt-cloud-item" viewBox="0 0 64 64" fill="rgba(50,50,50,0.9)" stroke="none"><path d="'+p+'"/></svg><svg class="wt-cloud-item" viewBox="0 0 64 64" fill="rgba(50,50,50,0.9)" stroke="none"><path d="'+p+'"/></svg>';
  },

  _renderOvercast:function(bg){
    var p=Cal._cloudPath;
    bg.innerHTML='<svg class="wt-overcast-item" viewBox="0 0 64 64" fill="rgba(40,40,40,0.9)" stroke="none"><path d="'+p+'"/></svg><svg class="wt-overcast-item" viewBox="0 0 64 64" fill="rgba(40,40,40,0.9)" stroke="none"><path d="'+p+'"/></svg><svg class="wt-overcast-item" viewBox="0 0 64 64" fill="rgba(40,40,40,0.9)" stroke="none"><path d="'+p+'"/></svg>';
  },

  _renderRain:function(bg,count,minDur,maxDur,minH,maxH){
    for(var i=0;i<count;i++){
      var drop=document.createElement('div');
      drop.className='wt-raindrop';
      drop.style.left=(5+Math.random()*90)+'%';
      drop.style.animationDuration=(minDur+Math.random()*(maxDur-minDur))+'s';
      drop.style.animationDelay=(-Math.random()*3)+'s';
      drop.style.height=(minH+Math.random()*(maxH-minH))+'px';
      bg.appendChild(drop);
    }
  },

  _renderThunder:function(bg){
    bg.innerHTML='<div class="wt-flash-overlay"></div><svg class="wt-lightning" width="24" height="45" viewBox="0 0 24 45" fill="none" stroke="rgba(30,30,30,0.9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="14,2 6,20 13,20 8,43"/></svg><svg class="wt-lightning" width="20" height="35" viewBox="0 0 20 35" fill="none" stroke="rgba(30,30,30,0.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="12,2 5,16 11,16 7,33"/></svg>';
    Cal._renderRain(bg,18,0.7,1.2,15,24);
  },

  _renderSnow:function(bg,count,minDur,maxDur,minSize,maxSize){
    for(var i=0;i<count;i++){
      var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 20 20');
      svg.setAttribute('class','wt-snow-item');
      var size=minSize+Math.random()*(maxSize-minSize);
      svg.style.left=(5+Math.random()*90)+'%';
      svg.style.width=size+'px';
      svg.style.height=size+'px';
      svg.style.animationDuration=(minDur+Math.random()*(maxDur-minDur))+'s';
      svg.style.animationDelay=(-Math.random()*6)+'s';
      var path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d','M10 2L10 18 M3.5 6L16.5 14 M16.5 6L3.5 14 M10 5L8 3 M10 5L12 3 M10 15L8 17 M10 15L12 17');
      path.setAttribute('stroke','rgba(50,50,50,0.7)');
      path.setAttribute('stroke-width','1.2');
      path.setAttribute('stroke-linecap','round');
      path.setAttribute('fill','none');
      svg.appendChild(path);
      bg.appendChild(svg);
    }
  },

  _renderFog:function(bg){
    bg.innerHTML='<div class="wt-fog-layer" style="background:linear-gradient(90deg,transparent,rgba(60,60,60,0.5),rgba(60,60,60,0.3),transparent);"></div><div class="wt-fog-layer" style="background:linear-gradient(90deg,transparent,rgba(50,50,50,0.4),rgba(50,50,50,0.25),transparent);"></div>';
  },

  initGeo:function(){
    var el=App.$('#location-coords');if(!el)return;
    if("geolocation" in navigator){
      navigator.geolocation.getCurrentPosition(
        function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;el.textContent=Math.abs(lat).toFixed(2)+'°'+(lat>=0?'N':'S')+' '+Math.abs(lon).toFixed(2)+'°'+(lon>=0?'E':'W');Cal.applyCardConfig();},
        function(){Cal.geoByIp(el);},
        {enableHighAccuracy:false,timeout:8000,maximumAge:300000}
      );
    }else{Cal.geoByIp(el);}
  },

  geoByIp:function(el){
    fetch('https://ipapi.co/json/').then(function(r){if(!r.ok)throw new Error();return r.json();}).then(function(d){
      if(d&&d.latitude&&d.longitude)el.textContent=Math.abs(d.latitude).toFixed(2)+'°'+(d.latitude>=0?'N':'S')+' '+Math.abs(d.longitude).toFixed(2)+'°'+(d.longitude>=0?'E':'W');
      else el.textContent='--';Cal.applyCardConfig();
    }).catch(function(){el.textContent='--';Cal.applyCardConfig();});
  },

  fetchWeather:function(city,callback){
    if(!city){if(callback)callback(null);return;}
    fetch('https://wttr.in/'+encodeURIComponent(city)+'?format=j1').then(function(r){if(!r.ok)throw new Error();return r.json();}).then(function(data){
      if(data&&data.current_condition&&data.current_condition.length){
        var c=data.current_condition[0];
        var code=c.weatherCode||'';
        var desc=Cal._weatherMap[code]||
                 (c.lang_zh&&c.lang_zh.length?c.lang_zh[0].value:'')||
                 (c.weatherDesc&&c.weatherDesc.length?c.weatherDesc[0].value:'')||
                 '未知';
        Cal.weather={temp:c.temp_C,humidity:c.humidity,desc:desc,code:code,time:Date.now()};
        Cal.save();Cal.updateCardWeather();Cal.renderWeatherEffect();if(callback)callback(Cal.weather);
      }else{if(callback)callback(null);}
    }).catch(function(){if(callback)callback(null);});
  },

  updateCardWeather:function(){
    var tempEl=App.$('#wt-temp-val');
    var descEl=App.$('#wt-desc-val');
    if(Cal.weather){
      if(tempEl)tempEl.textContent=Cal.weather.temp||'--';
      if(descEl)descEl.textContent=Cal.weather.desc||'';
    }else{
      if(tempEl)tempEl.textContent='--';
      if(descEl)descEl.textContent='天气';
    }
    Cal.applyCardConfig();
  },

  getSchedule:function(k){return Cal.schedules[k]||[];},
  setSchedule:function(k,l){Cal.schedules[k]=l;Cal.save();},
  addMemo:function(k,m){if(!Cal.schedules[k])Cal.schedules[k]=[];Cal.schedules[k].push(m);Cal.save();},
  getMemosForDate:function(k){return Cal.schedules[k]||[];},
  removeMemo:function(k,i){if(Cal.schedules[k]){Cal.schedules[k].splice(i,1);if(!Cal.schedules[k].length)delete Cal.schedules[k];Cal.save();}},
  hasMemosForDate:function(k){return Cal.schedules[k]&&Cal.schedules[k].length>0;},
  getWeatherSummary:function(){if(!Cal.weather)return '';return '当前天气: '+Cal.weather.desc+', '+Cal.weather.temp+'°C, 湿度'+Cal.weather.humidity+'%';},
  getScheduleSummary:function(){
    var list=Cal.getSchedule(Cal.todayKey()),items=list.filter(function(item){return !item.type||item.type==='schedule';});
    if(!items.length)return '今日无外出行程。';
    return '今日行程:\n'+items.map(function(x){return (x.time||'')+' '+(x.content||'');}).join('\n');
  },
  getLocationForAI:function(){return Cal.virtualCity||Cal.city||'';},

  _dragOffsetX:0,_dragOffsetY:0,

  initDrag:function(){
    var card=App.$('#wtCard');if(!card)return;
    var startX,startY,startOX,startOY,longPressed=false,timer,moved=false;
    card.addEventListener('touchstart',function(e){
      if(e.target.closest('.vf-lbl'))return;
      var t=e.touches[0];startX=t.clientX;startY=t.clientY;longPressed=false;moved=false;
      timer=setTimeout(function(){
        longPressed=true;startOX=Cal._dragOffsetX;startOY=Cal._dragOffsetY;
        card.style.transition='none';card.style.opacity='0.9';card.style.zIndex='999';
        if(navigator.vibrate)navigator.vibrate(15);
      },500);
    },{passive:true});
    card.addEventListener('touchmove',function(e){
      var t=e.touches[0];
      if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
      if(!longPressed)return;moved=true;e.preventDefault();e.stopPropagation();
      Cal._dragOffsetX=startOX+t.clientX-startX;Cal._dragOffsetY=startOY+t.clientY-startY;
      card.style.transform='translate('+Cal._dragOffsetX+'px,'+Cal._dragOffsetY+'px)';
    },{passive:false});
    card.addEventListener('touchend',function(){
      clearTimeout(timer);timer=null;card.style.opacity='';card.style.transition='';card.style.zIndex='10';
      if(longPressed&&moved)App.LS.set('wtCardPos',{x:Cal._dragOffsetX,y:Cal._dragOffsetY});
      longPressed=false;moved=false;
    });
  },

  // ====== 调色面板（保持原版不变） ======
  toggleColorPanel:function(){
    if(Cal._colorPanelEl){Cal._colorPanelEl.remove();Cal._colorPanelEl=null;return;}
    var card=App.$('#wtCard');if(!card)return;
    var c=Cal.cardConfig;
    var _colors={bg:c.colorHex||'#ffffff',font:c.fontColor||'#1a1a1a',line:c.lineColor||'#1a1a1a'};
    var overlay=document.createElement('div');
    overlay.id='wtColorOverlay';overlay.className='pc-edit-overlay';overlay.style.zIndex='100020';
    Cal._colorPanelEl=overlay;
    var panel=document.createElement('div');panel.className='pc-edit-panel';
    panel.innerHTML='<div class="pc-header">时间栏调色<div class="pc-close-btn" id="wcpClose">×</div></div><div class="pc-body" style="gap:10px;"><div class="pc-group"><span class="pc-label">缩放</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="wcpScale" min="50" max="100" value="'+c.scale+'"><span class="pc-slider-val" id="wcpScaleVal">'+(c.scale/100).toFixed(2)+'</span></div></div><div class="pc-group"><span class="pc-label">圆角</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="wcpRadius" min="0" max="40" value="'+c.radius+'"><span class="pc-slider-val" id="wcpRadiusVal">'+c.radius+'px</span></div></div><div class="pc-group"><span class="pc-label">边框</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="wcpBorder" min="0" max="100" value="'+c.borderAlpha+'"><span class="pc-slider-val" id="wcpBorderVal">'+c.borderAlpha+'%</span></div></div><div class="pc-group"><span class="pc-label">透明</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="wcpAlpha" min="0" max="100" value="'+c.alpha+'"><span class="pc-slider-val" id="wcpAlphaVal">'+c.alpha+'%</span></div></div><div class="pc-group"><span class="pc-label">模糊</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="wcpBlur" min="0" max="50" value="'+c.blur+'"><span class="pc-slider-val" id="wcpBlurVal">'+c.blur+'px</span></div></div><div class="pc-group"><span class="pc-label">颜色</span><div class="pc-palette-grid" style="grid-template-columns:repeat(3,1fr);"><div class="pc-palette-item"><div class="pc-dot" id="wcpBgSwatch" data-key="bg" style="background:'+_colors.bg+'"></div><span class="pc-dot-lbl">底色</span></div><div class="pc-palette-item"><div class="pc-dot" id="wcpFontSwatch" data-key="font" style="background:'+_colors.font+'"></div><span class="pc-dot-lbl">字体</span></div><div class="pc-palette-item"><div class="pc-dot" id="wcpLineSwatch" data-key="line" style="background:'+_colors.line+'"></div><span class="pc-dot-lbl">线条</span></div></div></div></div><div class="pc-footer"><button class="pc-btn pc-btn-save" id="wcpSave" type="button">保存</button><button class="pc-btn pc-btn-cancel" id="wcpReset" type="button">重置</button></div>';
    overlay.appendChild(panel);document.body.appendChild(overlay);

    var cardRect=card.getBoundingClientRect();
    var left=cardRect.left+cardRect.width/2-140;
    if(left<8)left=8;if(left+280>window.innerWidth-8)left=window.innerWidth-288;
    var top=cardRect.bottom+8;if(top+400>window.innerHeight-10)top=cardRect.top-408;if(top<10)top=10;
    panel.style.left=left+'px';panel.style.top=top+'px';
    if(App.modules.cards&&App.modules.cards._bindPanelDrag)App.modules.cards._bindPanelDrag(panel);

    function getCfg(){return{scale:parseInt(App.$('#wcpScale').value),radius:parseInt(App.$('#wcpRadius').value),borderAlpha:parseInt(App.$('#wcpBorder').value),alpha:parseInt(App.$('#wcpAlpha').value),blur:parseInt(App.$('#wcpBlur').value),colorHex:_colors.bg,fontColor:_colors.font,lineColor:_colors.line};}
    function pv(){App.$('#wcpScaleVal').textContent=(App.$('#wcpScale').value/100).toFixed(2);App.$('#wcpRadiusVal').textContent=App.$('#wcpRadius').value+'px';App.$('#wcpBorderVal').textContent=App.$('#wcpBorder').value+'%';App.$('#wcpAlphaVal').textContent=App.$('#wcpAlpha').value+'%';App.$('#wcpBlurVal').textContent=App.$('#wcpBlur').value+'px';Cal.applyCardConfig(getCfg());}
    ['wcpScale','wcpRadius','wcpBorder','wcpAlpha','wcpBlur'].forEach(function(id){var el=App.$('#'+id);if(el)el.addEventListener('input',pv);});

    panel.querySelectorAll('.pc-dot').forEach(function(swatch){
      swatch.addEventListener('click',function(e){e.stopPropagation();var key=swatch.dataset.key;if(!App.openColorPicker)return;App.openColorPicker(_colors[key],function(hex){_colors[key]=hex;swatch.style.background=hex;Cal.applyCardConfig(getCfg());},function(hex){_colors[key]=hex;swatch.style.background=hex;Cal.applyCardConfig(getCfg());},'wt-'+key);});
    });

    panel.querySelector('#wcpClose').addEventListener('click',function(e){e.stopPropagation();Cal.toggleColorPanel();});
    panel.querySelector('#wcpSave').addEventListener('click',function(e){e.stopPropagation();Cal.cardConfig=getCfg();Cal.saveCardConfig();Cal.applyCardConfig();Cal.toggleColorPanel();App.showToast('已保存');});
    panel.querySelector('#wcpReset').addEventListener('click',function(e){e.stopPropagation();App.LS.remove('wtCardConfig');Cal.cardConfig=JSON.parse(JSON.stringify(CARD_DEFAULTS));Cal.saveCardConfig();var card2=App.$('#wtCard');if(card2){var cw=card2.querySelector('.wt-cw');if(cw)cw.removeAttribute('style');card2.querySelectorAll('.wt-time,.wt-time span,.wt-sec,.wt-sec span,.wt-date,.wt-date span,.wt-wk,.vf-lbl,.wt-tl,.wt-wl,.wt-vd,.vf-hl,#location-coords,.wt-temp,.wt-desc,.wt-deg').forEach(function(el){el.removeAttribute('style');});}Cal.applyCardConfig();Cal._dragOffsetX=0;Cal._dragOffsetY=0;App.LS.remove('wtCardPos');if(card2)card2.style.transform='';Cal.toggleColorPanel();App.showToast('已重置');});
    overlay.addEventListener('click',function(e){if(e.target===overlay)Cal.toggleColorPanel();});
    panel.addEventListener('click',function(e){e.stopPropagation();});
  },

  // ====== 天气设置面板（增加动态/静态切换） ======
  openWeatherPanel:function(){
    var panel=App.$('#calPanel');if(!panel)return;
    panel.innerHTML=
      '<div class="cal-panel-header">'+
        '<div class="cal-panel-back" id="closeCalPanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div>'+
        '<h2>天气</h2>'+
        '<div class="cal-panel-right"></div>'+
      '</div>'+
      '<div class="cal-panel-body">'+

        '<div class="cal-info-card">'+
          '<div class="cal-info-row"><span class="cal-info-label">真实城市</span><span class="cal-info-value">'+App.esc(Cal.city||'未设置')+'</span></div>'+
          '<div class="cal-info-row"><span class="cal-info-label">虚拟城市</span><span class="cal-info-value">'+App.esc(Cal.virtualCity||'未设置')+'</span></div>'+
        '</div>'+

        '<div class="cal-form-group">'+
          '<label class="cal-form-label">真实城市（用于获取天气数据）</label>'+
          '<div class="cal-input-row">'+
            '<input type="text" class="cal-input" id="calCityInput" placeholder="输入真实城市名..." value="'+App.esc(Cal.city||'')+'">'+
            '<button class="cal-icon-btn" id="calSearchCityBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></button>'+
          '</div>'+
        '</div>'+

        '<div class="cal-form-group">'+
          '<label class="cal-form-label">虚拟城市（发送给角色的地点）</label>'+
          '<input type="text" class="cal-input" id="calVirtualCityInput" placeholder="如：长安、霍格沃茨、星穹列车..." value="'+App.esc(Cal.virtualCity||'')+'">'+
          '<div style="font-size:11px;color:#999;margin-top:6px;line-height:1.5;">留空则使用真实城市。适合架空世界观。</div>'+
        '</div>'+

        '<div class="cal-form-group">'+
          '<label class="cal-form-label">天气特效</label>'+
          '<div class="cal-toggle-row">'+
            '<span class="cal-toggle-label">动态效果</span>'+
            '<label class="cal-toggle"><input type="checkbox" id="calAnimToggle" '+(Cal._weatherAnimate?'checked':'')+'><span class="cal-toggle-slider"></span></label>'+
          '</div>'+
          '<div style="font-size:11px;color:#999;margin-top:6px;line-height:1.5;">关闭后天气图标将静止显示，减少耗电。</div>'+
        '</div>'+

        '<div style="display:flex;gap:8px;">'+
          '<button class="cal-btn cal-btn-dark" id="calSaveVirtual" type="button" style="flex:1;">保存设置</button>'+
          '<button class="cal-btn cal-btn-dark" id="calRefreshBtn" type="button" style="flex:1;">刷新天气</button>'+
        '</div>'+

        (Cal.weather?
          '<div class="cal-info-card" style="margin-top:20px;">'+
            '<div class="cal-info-row"><span class="cal-info-label">温度</span><span class="cal-info-value">'+App.esc(Cal.weather.temp)+'°C</span></div>'+
            '<div class="cal-info-row"><span class="cal-info-label">天气</span><span class="cal-info-value">'+App.esc(Cal.weather.desc)+'</span></div>'+
            '<div class="cal-info-row"><span class="cal-info-label">湿度</span><span class="cal-info-value">'+App.esc(Cal.weather.humidity)+'%</span></div>'+
          '</div>':'')+

      '</div>';

    panel.classList.remove('hidden');
    setTimeout(function(){panel.classList.add('show');},20);
    App.bindSwipeBack(panel,function(){Cal.closePanel();});

    App.safeOn('#closeCalPanel','click',function(){Cal.closePanel();});

    App.safeOn('#calAnimToggle','change',function(){
      Cal._weatherAnimate=App.$('#calAnimToggle').checked;
      App.LS.set('calWeatherAnimate',Cal._weatherAnimate);
      Cal.renderWeatherEffect();
    });

    App.safeOn('#calSaveVirtual','click',function(){
      Cal.virtualCity=App.$('#calVirtualCityInput').value.trim();
      var cityInput=App.$('#calCityInput').value.trim();
      if(cityInput&&cityInput!==Cal.city){
        Cal.city=cityInput;
        Cal.save();
        App.showToast('获取天气中...');
        Cal.fetchWeather(Cal.city,function(w){
          if(w){Cal.openWeatherPanel();App.showToast('设置已保存');}
          else{Cal.openWeatherPanel();App.showToast('天气获取失败，城市已保存');}
        });
      }else{
        Cal.save();
        Cal.openWeatherPanel();
        App.showToast(Cal.virtualCity?'设置已保存':'已清除虚拟城市');
      }
    });

    App.safeOn('#calSearchCityBtn','click',function(){
      var name=App.$('#calCityInput').value.trim();
      if(!name){App.showToast('请输入城市名');return;}
      App.showToast('获取天气中...');
      Cal.city=name;Cal.save();
      Cal.fetchWeather(name,function(w){
        if(w){Cal.openWeatherPanel();App.showToast('已切换：'+name);}
        else App.showToast('获取失败');
      });
    });

    App.safeOn('#calRefreshBtn','click',function(){
      if(!Cal.city){App.showToast('请先设置真实城市');return;}
      App.showToast('刷新中...');
      Cal.fetchWeather(Cal.city,function(w){
        if(w){Cal.openWeatherPanel();App.showToast('天气已刷新');}
        else App.showToast('刷新失败');
      });
    });
  },

  // ====== 日历面板（保持原版） ======
  _viewYear:0,_viewMonth:0,_selectedDate:'',_stickerPage:0,

  openSchedulePanel:function(){
    var panel=App.$('#calPanel');if(!panel)return;
    var now=new Date();
    Cal._viewYear=now.getFullYear();Cal._viewMonth=now.getMonth();
    Cal._selectedDate=Cal.todayKey();Cal._stickerPage=0;
    Cal.renderCalendarView();
    panel.classList.remove('hidden');
    setTimeout(function(){panel.classList.add('show');},20);
    App.bindSwipeBack(panel,function(){Cal.closePanel();});
  },

  renderCalendarView:function(){var panel=App.$('#calPanel');if(!panel)return;var year=Cal._viewYear,month=Cal._viewMonth,mn=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];panel.innerHTML='<div class="cal-panel-header"><div class="cal-panel-back" id="closeCalPanel2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div><h2>日历</h2><button class="cal-panel-action" id="addMemoBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button></div><div class="cal-panel-body"><div class="cal-month-header"><div class="cal-month-nav"><button class="cal-month-nav-btn" id="calPrevMonth" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button></div><div class="cal-month-title">'+year+'年'+mn[month]+'</div><div class="cal-month-nav"><button class="cal-month-nav-btn" id="calNextMonth" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg></button></div></div><div class="cal-weekday-row"><div class="cal-weekday-cell">日</div><div class="cal-weekday-cell">一</div><div class="cal-weekday-cell">二</div><div class="cal-weekday-cell">三</div><div class="cal-weekday-cell">四</div><div class="cal-weekday-cell">五</div><div class="cal-weekday-cell">六</div></div><div class="cal-days-grid" id="calDaysGrid"></div><div class="cal-selected-section" id="calSelectedSection"></div></div>';Cal.renderDaysGrid();Cal.renderSelectedSection();App.safeOn('#closeCalPanel2','click',function(){Cal.closePanel();});App.safeOn('#calPrevMonth','click',function(){Cal._viewMonth--;if(Cal._viewMonth<0){Cal._viewMonth=11;Cal._viewYear--;}Cal.renderCalendarView();});App.safeOn('#calNextMonth','click',function(){Cal._viewMonth++;if(Cal._viewMonth>11){Cal._viewMonth=0;Cal._viewYear++;}Cal.renderCalendarView();});App.safeOn('#addMemoBtn','click',function(){Cal.openEditMemo(Cal._selectedDate,-1);});},

  renderDaysGrid:function(){var grid=App.$('#calDaysGrid');if(!grid)return;var year=Cal._viewYear,month=Cal._viewMonth,today=Cal.todayKey(),fd=new Date(year,month,1).getDay(),dim=new Date(year,month+1,0).getDate(),html='';for(var e=0;e<fd;e++)html+='<div class="cal-day-cell cal-day-empty"></div>';for(var d=1;d<=dim;d++){var dk=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),cls='cal-day-cell';if(dk===today)cls+=' cal-day-today';if(dk===Cal._selectedDate)cls+=' cal-day-selected';html+='<div class="'+cls+'" data-date="'+dk+'"><div class="cal-day-num">'+d+'</div>'+(Cal.hasMemosForDate(dk)?'<div class="cal-day-dot"></div>':'')+'</div>';}grid.innerHTML=html;grid.querySelectorAll('.cal-day-cell:not(.cal-day-empty)').forEach(function(cell){cell.addEventListener('click',function(){document.querySelectorAll('.cal-day-cell').forEach(function(c){c.classList.remove('cal-day-selected');});this.classList.add('cal-day-selected');Cal._selectedDate=this.dataset.date;Cal._stickerPage=0;Cal.renderSelectedSection();});});},

  renderSelectedSection:function(){var section=App.$('#calSelectedSection');if(!section)return;var dateKey=Cal._selectedDate;if(!dateKey){section.innerHTML='';return;}var allMemos=Cal.getMemosForDate(dateKey);var memos=[];for(var i=0;i<allMemos.length;i++){var t=allMemos[i].type||'schedule';if(t!=='schedule')memos.push({memo:allMemos[i],idx:i});}var html='',memo;if(!memos.length){html+='<div class="cal-empty-dark">暂无记录，点击右上角 + 添加</div>';}else{var pi=Cal._stickerPage;if(pi>=memos.length){pi=0;Cal._stickerPage=0;}memo=memos[pi].memo;var total=memos.length;var hasEn=memo.textEn&&memo.textEn!==memo.content;var dt=hasEn?App.esc(memo.textEn):App.esc(memo.content||'');dt=dt.replace(/([a-zA-Z]+)/g,'<span class="sticker-en-letter">$1</span>');dt=dt.replace(/(\d+)/g,'<span class="sticker-num">$1</span>');html+='<div class="sticker-wrap"><div class="sticker-paper" id="stickerPaper"><div class="torn-top"></div><div class="torn-bottom"></div><div class="torn-left"></div><div class="torn-right"></div><div class="paper-lines"></div><div class="tape"><div class="tape-body"><div class="tape-tear-l"></div><div class="tape-tear-r"></div></div></div><div class="sticker-text-en">'+dt+'</div>'+(hasEn?'<div class="sticker-text-zh">'+App.esc(memo.content||'')+'</div>':'')+(memo.time?'<div class="sticker-time">'+App.esc(memo.time)+'</div>':'')+(total>1?'<div class="sticker-pager" id="stickerPager"><span class="sticker-page-num">'+(pi+1)+' / '+total+'</span><span class="sticker-spade">♠</span></div>':'')+'</div></div><div class="sticker-actions"><button class="sticker-action-btn sticker-edit-btn" id="stickerEditBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg><span>编辑</span></button><button class="sticker-action-btn sticker-del-btn" id="stickerDelBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg><span>删除</span></button></div>';}section.innerHTML=html;var paper=App.$('#stickerPaper');if(paper&&memo&&memo.textEn&&memo.textEn!==memo.content){paper.addEventListener('click',function(e){if(e.target.closest('#stickerPager'))return;paper.classList.toggle('show-zh');});}var pager=App.$('#stickerPager');if(pager){pager.addEventListener('click',function(e){e.stopPropagation();Cal._stickerPage=(Cal._stickerPage+1)%memos.length;Cal.renderSelectedSection();var p=App.$('#stickerPaper');if(p){p.classList.add('turning');setTimeout(function(){p.classList.remove('turning');},350);}});}App.safeOn('#stickerEditBtn','click',function(){Cal.openEditMemo(dateKey,memos[Cal._stickerPage].idx);});App.safeOn('#stickerDelBtn','click',function(){if(!confirm('删除这条记录？'))return;Cal.removeMemo(dateKey,memos[Cal._stickerPage].idx);Cal._stickerPage=0;Cal.renderDaysGrid();Cal.renderSelectedSection();App.showToast('已删除');});},

  openEditMemo:function(dateKey,idx){var isNew=idx<0,list=Cal.getMemosForDate(dateKey),item=isNew?{type:'memo',content:'',textEn:'',time:''}:list[idx];var panel=App.$('#calPanel');if(!panel)return;panel.innerHTML='<div class="cal-panel-header"><div class="cal-panel-back" id="backFromMemo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div><h2>'+(isNew?'添加记录':'编辑记录')+'</h2><button class="cal-panel-action" id="saveMemoBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button></div><div class="cal-panel-body"><div class="cal-form-group"><label class="cal-form-label">内容（中文）</label><textarea class="cal-textarea" id="memoContent" rows="4" placeholder="写点什么...">'+App.esc(item.content||'')+'</textarea></div><div class="cal-form-group"><label class="cal-form-label">英文翻译（可选）</label><textarea class="cal-textarea" id="memoTextEn" rows="3" placeholder="English text...">'+App.esc(item.textEn||'')+'</textarea></div><div class="cal-form-group"><label class="cal-form-label">时间标注（可选）</label><input type="text" class="cal-input" id="memoTime" placeholder="如：15:00" value="'+App.esc(item.time||'')+'"></div></div>';App.safeOn('#backFromMemo','click',function(){Cal.renderCalendarView();});App.safeOn('#saveMemoBtn','click',function(){var content=App.$('#memoContent').value.trim();if(!content){App.showToast('请输入内容');return;}var ni={type:'memo',content:content,textEn:App.$('#memoTextEn').value.trim(),time:App.$('#memoTime').value.trim()};if(isNew)Cal.addMemo(dateKey,ni);else{list[idx]=ni;Cal.setSchedule(dateKey,list);}Cal.renderCalendarView();App.showToast(isNew?'已添加':'已保存');});},

  openTodaySchedule:function(){var panel=App.$('#calPanel');if(!panel)return;var key=Cal.todayKey(),now=new Date(),ds=now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日 '+Cal.WEEKDAYS[now.getDay()];panel.innerHTML='<div class="cal-panel-header"><div class="cal-panel-back" id="closeSchedulePanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div><h2>今日行程</h2><button class="cal-panel-action" id="addScheduleBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button></div><div class="cal-panel-body"><div class="cal-schedule-date">'+ds+'</div><div id="todayScheduleList" class="cal-schedule-list"></div></div>';Cal.renderTodayScheduleList(key);panel.classList.remove('hidden');setTimeout(function(){panel.classList.add('show');},20);App.safeOn('#closeSchedulePanel','click',function(){Cal.closePanel();});App.safeOn('#addScheduleBtn','click',function(){Cal.openEditScheduleItem(key,-1);});App.bindSwipeBack(panel,function(){Cal.closePanel();});},

  renderTodayScheduleList:function(key){var ct=App.$('#todayScheduleList');if(!ct)return;var list=Cal.getSchedule(key);var si=[];for(var i=0;i<list.length;i++){if(!list[i].type||list[i].type==='schedule')si.push({item:list[i],idx:i});}if(!si.length){ct.innerHTML='<div class="cal-empty">今日暂无外出行程</div>';return;}ct.innerHTML=si.map(function(s){return '<div class="cal-schedule-item"><div class="cal-schedule-time">'+App.esc(s.item.time||'')+'</div><div class="cal-schedule-dot-line"><div class="cal-schedule-dot-circle"></div></div><div class="cal-schedule-right"><div class="cal-schedule-content">'+App.esc(s.item.content||'')+'</div><div class="cal-schedule-actions"><button class="cal-sm-btn cal-sm-edit" data-idx="'+s.idx+'" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button><button class="cal-sm-btn cal-sm-del" data-idx="'+s.idx+'" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></button></div></div></div>';}).join('');ct.querySelectorAll('.cal-sm-edit').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();Cal.openEditScheduleItem(key,parseInt(btn.dataset.idx,10));});});ct.querySelectorAll('.cal-sm-del').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();if(!confirm('删除这条行程？'))return;Cal.removeMemo(key,parseInt(btn.dataset.idx,10));Cal.renderTodayScheduleList(key);App.showToast('已删除');});});},

  openEditScheduleItem:function(key,idx){var isNew=idx<0,list=Cal.getSchedule(key),item=isNew?{type:'schedule',time:'',content:''}:list[idx];var panel=App.$('#calPanel');if(!panel)return;panel.innerHTML='<div class="cal-panel-header"><div class="cal-panel-back" id="backToTodaySchedule"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div><h2>'+(isNew?'添加行程':'编辑行程')+'</h2><button class="cal-panel-action" id="saveScheduleItemBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button></div><div class="cal-panel-body"><div class="cal-form-group"><label class="cal-form-label">时间</label><input type="time" class="cal-input cal-input-time" id="scheduleItemTime" value="'+App.esc(item.time||'')+'"></div><div class="cal-form-group"><label class="cal-form-label">行程内容</label><textarea class="cal-textarea" id="scheduleItemContent" rows="4" placeholder="外出行程...">'+App.esc(item.content||'')+'</textarea></div></div>';App.safeOn('#backToTodaySchedule','click',function(){Cal.openTodaySchedule();});App.safeOn('#saveScheduleItemBtn','click',function(){var time=App.$('#scheduleItemTime').value,content=App.$('#scheduleItemContent').value.trim();if(!content){App.showToast('请输入行程内容');return;}var ni={type:'schedule',time:time,content:content};if(isNew)Cal.addMemo(key,ni);else{list[idx]=ni;Cal.setSchedule(key,list);}Cal.openTodaySchedule();App.showToast(isNew?'已添加':'已保存');});},

  closePanel:function(){var panel=App.$('#calPanel');if(!panel)return;panel.classList.remove('show');setTimeout(function(){panel.classList.add('hidden');},350);},

  bindCardClicks:function(){
    var sysBtn=App.$('#wtSysBtn');
    if(sysBtn)sysBtn.addEventListener('click',function(e){e.stopPropagation();Cal.toggleColorPanel();});

    var dateArea=App.$('#wtDateArea');
    if(dateArea)dateArea.addEventListener('click',function(e){e.stopPropagation();Cal.openSchedulePanel();});

    var weatherArea=App.$('#wtWeatherArea');
    if(weatherArea)weatherArea.addEventListener('click',function(e){e.stopPropagation();Cal.openWeatherPanel();});
  },

  startAutoRefresh:function(){
    if(Cal._refreshTimer)clearInterval(Cal._refreshTimer);
    Cal._refreshTimer=setInterval(function(){if(Cal.city)Cal.fetchWeather(Cal.city,function(){});},30*60*1000);
  },

  init:function(){
    Cal.load();
    if(!App.$('#calPanel')){var panel=document.createElement('div');panel.id='calPanel';panel.className='fullpage-panel hidden';document.body.appendChild(panel);}

    Cal.applyCardConfig();
    Cal.startClock();
    Cal.renderWeekRow();
    Cal.initGeo();
    Cal.bindCardClicks();
    Cal.initDrag();
    Cal.updateCardWeather();
    Cal.renderWeatherEffect();

    if(Cal.city&&Cal.weather){
      Cal.updateCardWeather();
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
