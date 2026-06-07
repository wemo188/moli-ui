
(function(){
'use strict';
var App=window.App;if(!App)return;
function pad(n){return n<10?'0'+n:''+n;}

var Cal={
  weather:null,city:'',virtualCity:'',schedules:{},
  _clockTimer:null,_refreshTimer:null,
  _weatherAnimate:true,

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
    Cal.virtualCity=App.LS.get('calVirtualCity')||'';
    Cal.weather=App.LS.get('calWeather')||null;
    Cal.schedules=App.LS.get('calSchedules')||{};
    var anim=App.LS.get('calWeatherAnimate');
    Cal._weatherAnimate=anim!==false;
  },
  save:function(){App.LS.set('calCity',Cal.city);App.LS.set('calVirtualCity',Cal.virtualCity);App.LS.set('calWeather',Cal.weather);App.LS.set('calSchedules',Cal.schedules);},
  todayKey:function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');},

  // ====== 时钟 ======
  startClock:function(){
    var yearEl=App.$('#calYear'),monthEl=App.$('#calMonth'),wkEl=App.$('#calWeekday'),timeEl=App.$('#calTime'),secEl=App.$('#calSec');
    if(!timeEl||!secEl)return;
    var WEEKDAYS_EN=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    function tick(){
      var d=new Date();
      if(yearEl)yearEl.textContent=d.getFullYear();
      if(monthEl)monthEl.textContent=d.getMonth()+1;
      if(wkEl)wkEl.textContent=WEEKDAYS_EN[d.getDay()];
      timeEl.textContent=pad(d.getHours())+':'+pad(d.getMinutes());
      secEl.textContent=':'+pad(d.getSeconds());
    }
    tick();
    if(Cal._clockTimer)clearInterval(Cal._clockTimer);
    Cal._clockTimer=setInterval(tick,1000);
  },

  // ====== 日期条 ======
  renderWeekRow:function(){
    var container=App.$('#calSide');if(!container)return;
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

  // ====== 天气动效 ======
  renderWeatherEffect:function(){
    var bg=App.$('#wtWeatherBg');if(!bg)return;
    bg.innerHTML='';
    var cw=bg.closest('.wt-cw');
    if(cw){cw.classList.remove('wt-static');if(!Cal._weatherAnimate)cw.classList.add('wt-static');}
    if(!Cal.weather||!Cal.weather.code){
      var h=new Date().getHours();
      if(h>=19||h<6){Cal._renderNight(bg);}
      return;
    }
    var effect=Cal._codeToEffect(Cal.weather.code);
    switch(effect){
      case'sunny':Cal._renderSunny(bg);break;
      case'night':Cal._renderNight(bg);break;
      case'cloudy':Cal._renderCloudy(bg);break;
      case'overcast':Cal._renderOvercast(bg);break;
      case'lightrain':Cal._renderRain(bg,8,1.5,2.2,12,18);break;
      case'heavyrain':Cal._renderRain(bg,22,0.8,1.3,16,26);break;
      case'thunder':Cal._renderThunder(bg);break;
      case'lightsnow':Cal._renderSnow(bg,10,4,6,5,8);break;
      case'heavysnow':Cal._renderSnow(bg,24,2.5,4,6,11);break;
      case'fog':Cal._renderFog(bg);break;
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
      svg.style.width=size+'px';svg.style.height=size+'px';
      svg.style.animationDuration=(minDur+Math.random()*(maxDur-minDur))+'s';
      svg.style.animationDelay=(-Math.random()*6)+'s';
      var path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d','M10 2L10 18 M3.5 6L16.5 14 M16.5 6L3.5 14 M10 5L8 3 M10 5L12 3 M10 15L8 17 M10 15L12 17');
      path.setAttribute('stroke','rgba(50,50,50,0.7)');
      path.setAttribute('stroke-width','1.2');
      path.setAttribute('stroke-linecap','round');
      path.setAttribute('fill','none');
      svg.appendChild(path);bg.appendChild(svg);
    }
  },

  _renderFog:function(bg){
    bg.innerHTML='<div class="wt-fog-layer" style="background:linear-gradient(90deg,transparent,rgba(60,60,60,0.5),rgba(60,60,60,0.3),transparent);"></div><div class="wt-fog-layer" style="background:linear-gradient(90deg,transparent,rgba(50,50,50,0.4),rgba(50,50,50,0.25),transparent);"></div>';
  },

  // ====== 天气获取 ======
  fetchWeather:function(city,callback){
    if(!city){if(callback)callback(null);return;}
    fetch('https://wttr.in/'+encodeURIComponent(city)+'?format=j1').then(function(r){if(!r.ok)throw new Error();return r.json();}).then(function(data){
      if(data&&data.current_condition&&data.current_condition.length){
        var c=data.current_condition[0];
        var code=c.weatherCode||'';
        var desc=Cal._weatherMap[code]||
                 (c.lang_zh&&c.lang_zh.length?c.lang_zh[0].value:'')||
                 (c.weatherDesc&&c.weatherDesc.length?c.weatherDesc[0].value:'')||'未知';
        Cal.weather={temp:c.temp_C,humidity:c.humidity,desc:desc,code:code,time:Date.now()};
        Cal.save();Cal.renderWeatherEffect();if(callback)callback(Cal.weather);
      }else{if(callback)callback(null);}
    }).catch(function(){if(callback)callback(null);});
  },

  getWeatherSummary:function(){if(!Cal.weather)return'';return'当前天气: '+Cal.weather.desc+', '+Cal.weather.temp+'°C, 湿度'+Cal.weather.humidity+'%';},
  getLocationForAI:function(){return Cal.virtualCity||Cal.city||'';},

  // ====== 天气设置面板 ======
  openWeatherPanel:function(){
    var panel=App.$('#calPanel');if(!panel)return;
    panel.innerHTML=
      '<div class="cal-panel-header">'+
        '<div class="cal-panel-back" id="closeCalPanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div>'+
        '<h2>天气设置</h2>'+
        '<div class="cal-panel-right"></div>'+
      '</div>'+
      '<div class="cal-panel-body">'+
        '<div class="cal-info-card">'+
          '<div class="cal-info-row"><span class="cal-info-label">真实城市</span><span class="cal-info-value">'+App.esc(Cal.city||'未设置')+'</span></div>'+
          '<div class="cal-info-row"><span class="cal-info-label">虚拟城市</span><span class="cal-info-value">'+App.esc(Cal.virtualCity||'未设置')+'</span></div>'+
          (Cal.weather?'<div class="cal-info-row"><span class="cal-info-label">温度</span><span class="cal-info-value">'+App.esc(Cal.weather.temp)+'°C</span></div><div class="cal-info-row"><span class="cal-info-label">天气</span><span class="cal-info-value">'+App.esc(Cal.weather.desc)+'</span></div><div class="cal-info-row"><span class="cal-info-label">湿度</span><span class="cal-info-value">'+App.esc(Cal.weather.humidity)+'%</span></div>':'')+
        '</div>'+
        '<div class="cal-form-group">'+
          '<label class="cal-form-label">真实城市（用于获取天气数据）</label>'+
          '<div class="cal-input-row">'+
            '<input type="text" class="cal-input" id="calCityInput" placeholder="输入城市名..." value="'+App.esc(Cal.city||'')+'">'+
            '<button class="cal-icon-btn" id="calSearchCityBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></button>'+
          '</div>'+
        '</div>'+
        '<div class="cal-form-group">'+
          '<label class="cal-form-label">虚拟城市（发送给角色的地点）</label>'+
          '<input type="text" class="cal-input" id="calVirtualCityInput" placeholder="如：长安、霍格沃茨..." value="'+App.esc(Cal.virtualCity||'')+'">'+
          '<div style="font-size:11px;color:#999;margin-top:6px;line-height:1.5;">留空则使用真实城市。</div>'+
        '</div>'+
        '<div class="cal-form-group">'+
          '<label class="cal-form-label">天气特效</label>'+
          '<div class="cal-toggle-row">'+
            '<span class="cal-toggle-label">动态效果</span>'+
            '<label class="cal-toggle"><input type="checkbox" id="calAnimToggle" '+(Cal._weatherAnimate?'checked':'')+'><span class="cal-toggle-slider"></span></label>'+
          '</div>'+
          '<div style="font-size:11px;color:#999;margin-top:6px;line-height:1.5;">关闭后天气图标将静止显示。</div>'+
        '</div>'+
        '<div style="display:flex;gap:8px;">'+
          '<button class="cal-btn cal-btn-dark" id="calSaveBtn" type="button" style="flex:1;">保存</button>'+
          '<button class="cal-btn cal-btn-dark" id="calRefreshBtn" type="button" style="flex:1;">刷新天气</button>'+
        '</div>'+
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
    App.safeOn('#calSaveBtn','click',function(){
      var cityInput=App.$('#calCityInput').value.trim();
      Cal.virtualCity=App.$('#calVirtualCityInput').value.trim();
      if(cityInput&&cityInput!==Cal.city){
        Cal.city=cityInput;Cal.save();
        App.showToast('获取天气中...');
        Cal.fetchWeather(Cal.city,function(w){
          if(w){Cal.openWeatherPanel();App.showToast('已保存');}
          else{Cal.openWeatherPanel();App.showToast('天气获取失败，城市已保存');}
        });
      }else{Cal.save();App.showToast('已保存');Cal.closePanel();}
    });
    App.safeOn('#calSearchCityBtn','click',function(){
      var name=App.$('#calCityInput').value.trim();
      if(!name){App.showToast('请输入城市名');return;}
      App.showToast('获取中...');Cal.city=name;Cal.save();
      Cal.fetchWeather(name,function(w){
        if(w){Cal.openWeatherPanel();App.showToast('已切换：'+name);}
        else App.showToast('获取失败');
      });
    });
    App.safeOn('#calRefreshBtn','click',function(){
      if(!Cal.city){App.showToast('请先设置城市');return;}
      App.showToast('刷新中...');
      Cal.fetchWeather(Cal.city,function(w){
        if(w){Cal.openWeatherPanel();App.showToast('已刷新');}
        else App.showToast('刷新失败');
      });
    });
  },

  closePanel:function(){var panel=App.$('#calPanel');if(!panel)return;panel.classList.remove('show');setTimeout(function(){panel.classList.add('hidden');},350);},

  // ====== 日程相关（保持不变） ======
  getSchedule:function(k){return Cal.schedules[k]||[];},
  setSchedule:function(k,l){Cal.schedules[k]=l;Cal.save();},
  addMemo:function(k,m){if(!Cal.schedules[k])Cal.schedules[k]=[];Cal.schedules[k].push(m);Cal.save();},
  getMemosForDate:function(k){return Cal.schedules[k]||[];},
  removeMemo:function(k,i){if(Cal.schedules[k]){Cal.schedules[k].splice(i,1);if(!Cal.schedules[k].length)delete Cal.schedules[k];Cal.save();}},
  hasMemosForDate:function(k){return Cal.schedules[k]&&Cal.schedules[k].length>0;},
  getScheduleSummary:function(){
    var list=Cal.getSchedule(Cal.todayKey()),items=list.filter(function(item){return!item.type||item.type==='schedule';});
    if(!items.length)return'今日无外出行程。';
    return'今日行程:\n'+items.map(function(x){return(x.time||'')+' '+(x.content||'');}).join('\n');
  },

  // ====== 绑定点击 ======
  bindClicks:function(){
    var monthEl=App.$('#calMonth');
    if(monthEl)monthEl.addEventListener('click',function(e){e.stopPropagation();Cal.openWeatherPanel();});
  },

  // ====== 自动刷新 ======
  startAutoRefresh:function(){
    if(Cal._refreshTimer)clearInterval(Cal._refreshTimer);
    Cal._refreshTimer=setInterval(function(){if(Cal.city)Cal.fetchWeather(Cal.city,function(){});},30*60*1000);
  },

  // ====== 初始化 ======
  init:function(){
    Cal.load();
    if(!App.$('#calPanel')){var panel=document.createElement('div');panel.id='calPanel';panel.className='fullpage-panel hidden';document.body.appendChild(panel);}
    Cal.startClock();
    Cal.renderWeekRow();
    Cal.renderWeatherEffect();
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


