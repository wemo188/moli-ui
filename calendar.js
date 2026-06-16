
(function(){
'use strict';
var App=window.App;if(!App)return;
function pad(n){return n<10?'0'+n:''+n;}

var Cal={
  weather:null,
  city:'',
  _clockTimer:null,
  _refreshTimer:null,
  _weatherAnimate:true,
  _dragX:0,
  _dragY:0,

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

  _codeToEffect:function(code){
    var c=parseInt(code)||0;
    if(c===113){var h=new Date().getHours();return(h>=19||h<6)?'night':'sunny';}
    if(c===116)return'cloudy';
    if(c===119||c===122)return'overcast';
    if(c===143||c===248||c===260)return'fog';
    if([176,263,266,281,284,293,296].indexOf(c)!==-1)return'lightrain';
    if([299,302,305,308,311,314,353,356,359,362,365].indexOf(c)!==-1)return'heavyrain';
    if([200,386,389].indexOf(c)!==-1)return'thunder';
    if([179,182,185,227,317,320,323,326,368].indexOf(c)!==-1)return'lightsnow';
    if([230,329,332,335,338,371,374,377,392,395].indexOf(c)!==-1)return'heavysnow';
    return'cloudy';
  },

  load:function(){
    Cal.city=App.LS.get('calCity')||'';
    Cal.weather=App.LS.get('calWeather')||null;
    var anim=App.LS.get('calWeatherAnimate');
    Cal._weatherAnimate=anim!==false;
  },

  save:function(){
    App.LS.set('calCity',Cal.city);
    App.LS.set('calWeather',Cal.weather);
  },

  startClock:function(){
    var yearEl=App.$('#calYear'),mdEl=App.$('#calMonthDay'),wkEl=App.$('#calWeekday'),clockEl=App.$('#calClock');
    if(!clockEl)return;
    var WEEKDAYS_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    function tick(){
      var d=new Date();
      if(yearEl)yearEl.textContent=d.getFullYear();
      if(mdEl)mdEl.textContent=pad(d.getMonth()+1)+'/'+pad(d.getDate());
      if(wkEl)wkEl.textContent=WEEKDAYS_EN[d.getDay()];
      clockEl.textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
    }
    tick();
    if(Cal._clockTimer)clearInterval(Cal._clockTimer);
    Cal._clockTimer=setInterval(tick,1000);
  },

  renderWeatherEffect:function(){
    var bg=App.$('#wtWeatherBg');if(!bg)return;
    bg.innerHTML='';
    var card=App.$('#wtCard');
    if(card){card.classList.remove('wt-static');if(!Cal._weatherAnimate)card.classList.add('wt-static');}
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

  // ====== 天气获取 ======
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

  // ====== 编辑面板（头像+背景+文字+天气全在这里） ======
  _editPanel:null,

  openEditPanel:function(){
    if(Cal._editPanel){Cal._editPanel.remove();Cal._editPanel=null;return;}

    var card=App.$('#wtCard');if(!card)return;
    var overlay=document.createElement('div');
    overlay.className='pc-edit-overlay';
    overlay.style.zIndex='100020';
    Cal._editPanel=overlay;

    var hasBgImg=!!App.LS.get('calBgImg');

    var panel=document.createElement('div');
    panel.className='pc-edit-panel';
    panel.innerHTML=
      '<div class="pc-header">票券设置<div class="pc-close-btn" id="wtEditClose">×</div></div>'+
      '<div class="pc-body">'+
        '<div class="pc-group">'+
          '<span class="pc-label">背景图片</span>'+
          '<div class="pc-av-row">'+
            '<div class="pc-icon-btn" id="wtBgUploadBtn"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg></div>'+
            '<div class="pc-icon-btn danger" id="wtBgClearBtn"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"/></svg></div>'+
            (hasBgImg?'<span style="font-size:10px;color:#999;font-weight:600;">已设置</span>':'')+
          '</div>'+
          '<input type="file" id="wtBgFileInput" accept="image/*" style="display:none;">'+
        '</div>'+
        '<div class="pc-group">'+
          '<span class="pc-label">城市（天气）</span>'+
          '<div class="pc-av-row">'+
            '<input type="text" class="pc-input" id="wtCityInput" placeholder="输入城市名..." value="'+App.esc(Cal.city||'')+'">'+
            '<div class="pc-icon-btn" id="wtCitySearchBtn"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>'+
          '</div>'+
          (Cal.weather?'<span class="pc-label" style="margin-top:4px;font-weight:500;opacity:0.7;">'+App.esc(Cal.weather.desc)+' '+App.esc(Cal.weather.temp)+'°C</span>':'')+
        '</div>'+
        '<div class="pc-group">'+
          '<span class="pc-label">动态特效</span>'+
          '<div class="pc-av-row">'+
            '<div class="pc-icon-btn" id="wtAnimToggle" style="width:auto;padding:0 10px;font-size:11px;font-weight:700;">'+(Cal._weatherAnimate?'开':'关')+'</div>'+
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
          '<span class="pc-label">地点</span>'+
          '<input type="text" class="pc-input" id="wtLocInput" placeholder="地点..." value="'+App.esc(App.LS.get('tkMsgLoc')||'')+'">'+
        '</div>'+
        '<div class="pc-group">'+
          '<button class="pc-icon-btn" id="wtEditSave" style="width:100%;padding:10px;font-size:12px;font-weight:700;">保存</button>'+
        '</div>'+
      '</div>';

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    var rect=card.getBoundingClientRect();
    var left=rect.left+20;
    var top=rect.bottom+8;
    if(left+270>window.innerWidth-8)left=window.innerWidth-278;
    if(left<8)left=8;
    if(top+450>window.innerHeight-10)top=rect.top-460;
    if(top<10)top=10;
    panel.style.left=left+'px';
    panel.style.top=top+'px';

    panel.querySelector('#wtEditClose').addEventListener('click',function(e){e.stopPropagation();Cal.openEditPanel();});
    overlay.addEventListener('click',function(e){if(e.target===overlay)Cal.openEditPanel();});
    panel.addEventListener('click',function(e){e.stopPropagation();});

    // 背景上传
    panel.querySelector('#wtBgUploadBtn').addEventListener('click',function(){
      panel.querySelector('#wtBgFileInput').click();
    });
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

    // 城市搜索
    panel.querySelector('#wtCitySearchBtn').addEventListener('click',function(){
      var name=panel.querySelector('#wtCityInput').value.trim();
      if(!name){App.showToast('请输入城市名');return;}
      App.showToast('获取天气中...');
      Cal.city=name;Cal.save();
      Cal.fetchWeather(name,function(w){
        if(w){Cal.openEditPanel();Cal.openEditPanel();App.showToast(w.desc+' '+w.temp+'°C');}
        else App.showToast('获取失败');
      });
    });

    // 动态开关
    panel.querySelector('#wtAnimToggle').addEventListener('click',function(){
      Cal._weatherAnimate=!Cal._weatherAnimate;
      App.LS.set('calWeatherAnimate',Cal._weatherAnimate);
      this.textContent=Cal._weatherAnimate?'开':'关';
      Cal.renderWeatherEffect();
    });

    // 保存文字
    panel.querySelector('#wtEditSave').addEventListener('click',function(){
      var name=panel.querySelector('#wtNameInput').value.trim();
      var sign=panel.querySelector('#wtSignInput').value.trim();
      var loc=panel.querySelector('#wtLocInput').value.trim();
      App.LS.set('tkMsgName',name);
      App.LS.set('tkMsgSign',sign);
      App.LS.set('tkMsgLoc',loc);
      Cal.applyTexts();
      Cal.openEditPanel();
      App.showToast('已保存');
    });
  },
  
  applyTexts:function(){
    var nameEl=App.$('#tkMsgName');
    var signEl=App.$('#tkMsgSign');
    var locEl=App.$('#tkMsgLoc');
    var n=App.LS.get('tkMsgName');
    var s=App.LS.get('tkMsgSign');
    var l=App.LS.get('tkMsgLoc');
    if(nameEl&&n)nameEl.textContent=n;
    if(signEl&&s)signEl.textContent=s;
    if(locEl&&l)locEl.textContent=l;
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

  initDrag:function(){
    var card=App.$('#wtCard');if(!card||card._wtDragBound)return;
    card._wtDragBound=true;
    var DELAY=500;
    var startX,startY,origX,origY,longPressed=false,timer,moved=false;

    var saved=App.LS.get('wtCardPos');
    if(saved){Cal._dragX=saved.x||0;Cal._dragY=saved.y||0;card.style.transform='translate('+Cal._dragX+'px,'+Cal._dragY+'px)';}

    card.addEventListener('touchstart',function(e){
      var t=e.touches[0];startX=t.clientX;startY=t.clientY;
      longPressed=false;moved=false;
      timer=setTimeout(function(){
        longPressed=true;origX=Cal._dragX;origY=Cal._dragY;
        card.style.transition='none';
        if(navigator.vibrate)navigator.vibrate(15);
      },DELAY);
    },{passive:true});

    card.addEventListener('touchmove',function(e){
      var t=e.touches[0];
      if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
      if(!longPressed)return;
      moved=true;e.preventDefault();e.stopPropagation();
      Cal._dragX=origX+(t.clientX-startX);Cal._dragY=origY+(t.clientY-startY);
      card.style.transform='translate('+Cal._dragX+'px,'+Cal._dragY+'px)';
    },{passive:false});

    card.addEventListener('touchend',function(){
      clearTimeout(timer);timer=null;
      card.style.transition='';
      if(longPressed&&moved)App.LS.set('wtCardPos',{x:Cal._dragX,y:Cal._dragY});
      longPressed=false;moved=false;
    });
  },

  bindClicks:function(){
    var rightEl=App.$('.tk17-right');if(!rightEl)return;
    var lastTap=0;
    rightEl.addEventListener('click',function(e){
      e.stopPropagation();
      var now=Date.now();
      if(now-lastTap<350){Cal.openEditPanel();}
      lastTap=now;
    });
  },

  startAutoRefresh:function(){
    if(Cal._refreshTimer)clearInterval(Cal._refreshTimer);
    Cal._refreshTimer=setInterval(function(){if(Cal.city)Cal.fetchWeather(Cal.city,function(){});},30*60*1000);
  },

  init:function(){
    Cal.load();
    Cal.startClock();
    Cal.renderWeatherEffect();
    Cal.applyBgImg();
    Cal.applyTexts();
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
