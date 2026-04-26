
(function(){
'use strict';
var App=window.App;if(!App)return;
var WK=['周日','周一','周二','周三','周四','周五','周六'];
function pad(n){return n<10?'0'+n:''+n;}
var CARD_DEFAULTS={scale:100,alpha:0,blur:7,radius:10,colorHex:'#ffffff',borderAlpha:15,fontColor:'#1a1a1a',lineColor:'#1a1a1a'};

var Cal={
  weather:null,city:'',schedules:{},cardConfig:{},WEEKDAYS:WK,
  _clockTimer:null,_refreshTimer:null,_colorPanelEl:null,

  load:function(){
    Cal.city=App.LS.get('calCity')||'';
    Cal.weather=App.LS.get('calWeather')||null;
    Cal.schedules=App.LS.get('calSchedules')||{};
    Cal.cardConfig=App.LS.get('wtCardConfig')||JSON.parse(JSON.stringify(CARD_DEFAULTS));
  },
  save:function(){App.LS.set('calCity',Cal.city);App.LS.set('calWeather',Cal.weather);App.LS.set('calSchedules',Cal.schedules);},
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
    card.querySelectorAll('.wt-sec,.wt-sec span').forEach(function(el){el.style.color=fc50;});
    card.querySelectorAll('.wt-date,.wt-date span,.wt-wk').forEach(function(el){el.style.color=fc75;});
    card.querySelectorAll('.vf-lbl').forEach(function(el){el.style.color=fc40;});
    var coords=card.querySelector('#location-coords');if(coords)coords.style.color=fc50;
    card.querySelectorAll('.wt-temp').forEach(function(el){el.style.color=fc;});
    card.querySelectorAll('.wt-deg').forEach(function(el){el.style.color=fc50;});
    card.querySelectorAll('.wt-desc').forEach(function(el){el.style.color=fc75;});

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
    fetch('https://wttr.in/'+encodeURIComponent(city)+'?format=j1&lang=zh').then(function(r){if(!r.ok)throw new Error();return r.json();}).then(function(data){
      if(data&&data.current_condition&&data.current_condition.length){
        var c=data.current_condition[0];
        var desc=(c.lang_zh&&c.lang_zh.length)?c.lang_zh[0].value:(c.weatherDesc&&c.weatherDesc.length?c.weatherDesc[0].value:'');
        Cal.weather={temp:c.temp_C,humidity:c.humidity,desc:desc,time:Date.now()};
        Cal.save();Cal.updateCardWeather();if(callback)callback(Cal.weather);
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

  _dragOffsetX:0,_dragOffsetY:0,

  initDrag:function(){
    var card=App.$('#wtCard');if(!card)return;
    var saved=App.LS.get('wtCardPos');
    if(saved){Cal._dragOffsetX=saved.x||0;Cal._dragOffsetY=saved.y||0;card.style.transform='translate('+Cal._dragOffsetX+'px,'+Cal._dragOffsetY+'px)';}
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

  // ====== 调色面板 ======
  toggleColorPanel:function(){
    if(Cal._colorPanelEl){
      Cal._colorPanelEl.classList.remove('open');
      setTimeout(function(){if(Cal._colorPanelEl&&Cal._colorPanelEl.parentNode)Cal._colorPanelEl.remove();Cal._colorPanelEl=null;},300);
      return;
    }
    var card=App.$('#wtCard');if(!card)return;
    var c=Cal.cardConfig;
    var panel=document.createElement('div');
    panel.id='wtColorPanel';
    panel.className='wt-color-panel';
    Cal._colorPanelEl=panel;

    var _colors={bg:c.colorHex||'#ffffff',font:c.fontColor||'#1a1a1a',line:c.lineColor||'#1a1a1a'};

    panel.innerHTML=
      '<div class="wt-cp-title">时间栏调色<div class="wt-cp-close" id="wcpClose">✕</div></div>'+
      '<div class="wt-cp-scroll">'+
        '<div class="wt-cp-section"><span>布局</span></div>'+
        '<div class="wt-cp-row"><span class="wt-cp-label">缩放</span><input type="range" id="wcpScale" min="50" max="100" value="'+c.scale+'"><span class="wt-cp-val" id="wcpScaleVal">'+(c.scale/100).toFixed(2)+'</span></div>'+
        '<div class="wt-cp-row"><span class="wt-cp-label">圆角</span><input type="range" id="wcpRadius" min="0" max="40" value="'+c.radius+'"><span class="wt-cp-val" id="wcpRadiusVal">'+c.radius+'px</span></div>'+
        '<div class="wt-cp-row"><span class="wt-cp-label">边框</span><input type="range" id="wcpBorder" min="0" max="100" value="'+c.borderAlpha+'"><span class="wt-cp-val" id="wcpBorderVal">'+c.borderAlpha+'%</span></div>'+
        '<div class="wt-cp-section"><span>背 景</span></div>'+
        '<div class="wt-cp-row"><span class="wt-cp-label">透明</span><input type="range" id="wcpAlpha" min="0" max="100" value="'+c.alpha+'"><span class="wt-cp-val" id="wcpAlphaVal">'+c.alpha+'%</span></div>'+
        '<div class="wt-cp-row"><span class="wt-cp-label">模糊</span><input type="range" id="wcpBlur" min="0" max="30" value="'+c.blur+'"><span class="wt-cp-val" id="wcpBlurVal">'+c.blur+'px</span></div>'+
        '<div class="wt-cp-section"><span>颜 色</span></div>'+
        '<div class="wt-cp-colors">'+
          '<div class="wt-cp-color-item"><div class="wt-cp-swatch" id="wcpBgSwatch" data-key="bg" style="background:'+_colors.bg+'"></div><span class="wt-cp-color-label">底色</span></div>'+
          '<div class="wt-cp-color-item"><div class="wt-cp-swatch" id="wcpFontSwatch" data-key="font" style="background:'+_colors.font+'"></div><span class="wt-cp-color-label">字体</span></div>'+
          '<div class="wt-cp-color-item"><div class="wt-cp-swatch" id="wcpLineSwatch" data-key="line" style="background:'+_colors.line+'"></div><span class="wt-cp-color-label">线条</span></div>'+
        '</div>'+
      '</div>'+
      '<div class="wt-cp-btns">'+
        '<button class="wt-cp-btn" id="wcpSave" type="button">保存</button>'+
        '<button class="wt-cp-btn" id="wcpReset" type="button">重置</button>'+
      '</div>';

    document.body.appendChild(panel);

    var cardRect=card.getBoundingClientRect();
    var left=cardRect.left+cardRect.width/2-150;
    if(left<8)left=8;
    if(left+300>window.innerWidth-8)left=window.innerWidth-308;
    var top=cardRect.bottom+8;
    if(top+400>window.innerHeight-10)top=cardRect.top-408;
    if(top<10)top=10;
    panel.style.left=left+'px';
    panel.style.top=top+'px';

    requestAnimationFrame(function(){requestAnimationFrame(function(){panel.classList.add('open');});});

    function getCfg(){
      return{
        scale:parseInt(App.$('#wcpScale').value),
        radius:parseInt(App.$('#wcpRadius').value),
        borderAlpha:parseInt(App.$('#wcpBorder').value),
        alpha:parseInt(App.$('#wcpAlpha').value),
        blur:parseInt(App.$('#wcpBlur').value),
        colorHex:_colors.bg,
        fontColor:_colors.font,
        lineColor:_colors.line
      };
    }

    function pv(){
      App.$('#wcpScaleVal').textContent=(App.$('#wcpScale').value/100).toFixed(2);
      App.$('#wcpRadiusVal').textContent=App.$('#wcpRadius').value+'px';
      App.$('#wcpBorderVal').textContent=App.$('#wcpBorder').value+'%';
      App.$('#wcpAlphaVal').textContent=App.$('#wcpAlpha').value+'%';
      App.$('#wcpBlurVal').textContent=App.$('#wcpBlur').value+'px';
      Cal.applyCardConfig(getCfg());
    }

    ['wcpScale','wcpRadius','wcpBorder','wcpAlpha','wcpBlur'].forEach(function(id){
      var el=App.$('#'+id);if(el)el.addEventListener('input',pv);
    });

    panel.querySelectorAll('.wt-cp-swatch').forEach(function(swatch){
      swatch.addEventListener('click',function(e){
        e.stopPropagation();
        var key=swatch.dataset.key;
        if(!App.openColorPicker)return;
        App.openColorPicker(_colors[key],function(hex){
          _colors[key]=hex;swatch.style.background=hex;Cal.applyCardConfig(getCfg());
        },function(hex){
          _colors[key]=hex;swatch.style.background=hex;Cal.applyCardConfig(getCfg());
        },'wt-'+key);
      });
    });

    panel.querySelector('#wcpClose').addEventListener('click',function(e){e.stopPropagation();Cal.toggleColorPanel();});

    panel.querySelector('#wcpSave').addEventListener('click',function(e){
      e.stopPropagation();Cal.cardConfig=getCfg();Cal.saveCardConfig();Cal.applyCardConfig();
      Cal.toggleColorPanel();App.showToast('已保存');
    });

    panel.querySelector('#wcpReset').addEventListener('click',function(e){
      e.stopPropagation();
      App.LS.remove('wtCardConfig');Cal.cardConfig=JSON.parse(JSON.stringify(CARD_DEFAULTS));Cal.saveCardConfig();
      var card2=App.$('#wtCard');
      if(card2){var cw=card2.querySelector('.wt-cw');if(cw)cw.removeAttribute('style');card2.querySelectorAll('.wt-time,.wt-time span,.wt-sec,.wt-sec span,.wt-date,.wt-date span,.wt-wk,.vf-lbl,.wt-tl,.wt-wl,.wt-vd,.vf-hl,#location-coords,.wt-temp,.wt-desc,.wt-deg').forEach(function(el){el.removeAttribute('style');});}
      Cal.applyCardConfig();Cal._dragOffsetX=0;Cal._dragOffsetY=0;App.LS.remove('wtCardPos');if(card2)card2.style.transform='';
      Cal.toggleColorPanel();App.showToast('已重置');
    });

    var _startedOnInput=false;
    panel.addEventListener('touchstart',function(e){
      e.stopPropagation();
      if(e.target.closest('input')||e.target.closest('button')||e.target.closest('.wt-cp-swatch')||e.target.closest('.wt-cp-close')){_startedOnInput=true;return;}
      _startedOnInput=false;
      var t=e.touches[0];var rect=panel.getBoundingClientRect();
      Cal._cpDrag={active:false,locked:false,sx:t.clientX,sy:t.clientY,ox:rect.left,oy:rect.top};},{passive:false});

    panel.addEventListener('touchmove',function(e){
      e.stopPropagation();
      if(_startedOnInput)return;
      var t=e.touches[0];
      var dx=Math.abs(t.clientX-Cal._cpDrag.sx);var dy=Math.abs(t.clientY-Cal._cpDrag.sy);
      if(!Cal._cpDrag.locked){if(dx>12||dy>12){Cal._cpDrag.active=dx>dy;Cal._cpDrag.locked=true;}return;}
      if(!Cal._cpDrag.active)return;
      e.preventDefault();
      panel.style.left=(Cal._cpDrag.ox+t.clientX-Cal._cpDrag.sx)+'px';
      panel.style.top=(Cal._cpDrag.oy+t.clientY-Cal._cpDrag.sy)+'px';
    },{passive:false});

    panel.addEventListener('touchend',function(){if(Cal._cpDrag){Cal._cpDrag.active=false;Cal._cpDrag.locked=false;}_startedOnInput=false;});
    panel.addEventListener('click',function(e){e.stopPropagation();});},

  // ====== 天气面板 ======
  openWeatherPanel:function(){
    var panel=App.$('#calPanel');if(!panel)return;
    panel.innerHTML='<div class="cal-panel-header"><div class="cal-panel-back" id="closeCalPanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div><h2>天气</h2><div class="cal-panel-right"></div></div><div class="cal-panel-body"><div class="cal-info-card"><div class="cal-info-row"><span class="cal-info-label">当前城市</span><span class="cal-info-value">'+App.esc(Cal.city||'未设置')+'</span></div></div><div class="cal-form-group"><label class="cal-form-label">切换城市</label><div class="cal-input-row"><input type="text" class="cal-input" id="calCityInput" placeholder="输入城市名..."><button class="cal-icon-btn" id="calSearchCityBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></button></div></div><button class="cal-btn cal-btn-dark" id="calRefreshBtn" type="button">刷新天气</button>'+(Cal.weather?'<div class="cal-info-card" style="margin-top:20px;"><div class="cal-info-row"><span class="cal-info-label">温度</span><span class="cal-info-value">'+App.esc(Cal.weather.temp)+'°C</span></div><div class="cal-info-row"><span class="cal-info-label">天气</span><span class="cal-info-value">'+App.esc(Cal.weather.desc)+'</span></div><div class="cal-info-row"><span class="cal-info-label">湿度</span><span class="cal-info-value">'+App.esc(Cal.weather.humidity)+'%</span></div></div>':'')+'</div>';
    panel.classList.remove('hidden');setTimeout(function(){panel.classList.add('show');},20);
    App.safeOn('#closeCalPanel','click',function(){Cal.closePanel();});
    App.safeOn('#calSearchCityBtn','click',function(){var name=App.$('#calCityInput').value.trim();if(!name){App.showToast('请输入城市名');return;}App.showToast('获取天气中...');Cal.city=name;Cal.save();Cal.fetchWeather(name,function(w){if(w){Cal.openWeatherPanel();App.showToast('已切换: '+name);}else App.showToast('获取失败');});});
    App.safeOn('#calRefreshBtn','click',function(){if(!Cal.city){App.showToast('请先设置城市');return;}App.showToast('刷新中...');Cal.fetchWeather(Cal.city,function(w){if(w){Cal.openWeatherPanel();App.showToast('天气已刷新');}else App.showToast('刷新失败');});});
  },

  // ====== 日历面板 ======
  _viewYear:0,_viewMonth:0,_selectedDate:'',_stickerPage:0,

  openSchedulePanel:function(){var panel=App.$('#calPanel');if(!panel)return;var now=new Date();Cal._viewYear=now.getFullYear();Cal._viewMonth=now.getMonth();Cal._selectedDate=Cal.todayKey();Cal._stickerPage=0;Cal.renderCalendarView();panel.classList.remove('hidden');setTimeout(function(){panel.classList.add('show');},20);},

  renderCalendarView:function(){var panel=App.$('#calPanel');if(!panel)return;var year=Cal._viewYear,month=Cal._viewMonth,mn=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];panel.innerHTML='<div class="cal-panel-header"><div class="cal-panel-back" id="closeCalPanel2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div><h2>日历</h2><button class="cal-panel-action" id="addMemoBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button></div><div class="cal-panel-body"><div class="cal-month-header"><div class="cal-month-nav"><button class="cal-month-nav-btn" id="calPrevMonth" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button></div><div class="cal-month-title">'+year+'年'+mn[month]+'</div><div class="cal-month-nav"><button class="cal-month-nav-btn" id="calNextMonth" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg></button></div></div><div class="cal-weekday-row"><div class="cal-weekday-cell">日</div><div class="cal-weekday-cell">一</div><div class="cal-weekday-cell">二</div><div class="cal-weekday-cell">三</div><div class="cal-weekday-cell">四</div><div class="cal-weekday-cell">五</div><div class="cal-weekday-cell">六</div></div><div class="cal-days-grid" id="calDaysGrid"></div><div class="cal-selected-section" id="calSelectedSection"></div></div>';Cal.renderDaysGrid();Cal.renderSelectedSection();App.safeOn('#closeCalPanel2','click',function(){Cal.closePanel();});App.safeOn('#calPrevMonth','click',function(){Cal._viewMonth--;if(Cal._viewMonth<0){Cal._viewMonth=11;Cal._viewYear--;}Cal.renderCalendarView();});App.safeOn('#calNextMonth','click',function(){Cal._viewMonth++;if(Cal._viewMonth>11){Cal._viewMonth=0;Cal._viewYear++;}Cal.renderCalendarView();});App.safeOn('#addMemoBtn','click',function(){Cal.openEditMemo(Cal._selectedDate,-1);});},

  renderDaysGrid:function(){var grid=App.$('#calDaysGrid');if(!grid)return;var year=Cal._viewYear,month=Cal._viewMonth,today=Cal.todayKey(),fd=new Date(year,month,1).getDay(),dim=new Date(year,month+1,0).getDate(),html='';for(var e=0;e<fd;e++)html+='<div class="cal-day-cell cal-day-empty"></div>';for(var d=1;d<=dim;d++){var dk=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),cls='cal-day-cell';if(dk===today)cls+=' cal-day-today';if(dk===Cal._selectedDate)cls+=' cal-day-selected';html+='<div class="'+cls+'" data-date="'+dk+'"><div class="cal-day-num">'+d+'</div>'+(Cal.hasMemosForDate(dk)?'<div class="cal-day-dot"></div>':'')+'</div>';}grid.innerHTML=html;grid.querySelectorAll('.cal-day-cell:not(.cal-day-empty)').forEach(function(cell){cell.addEventListener('click',function(){document.querySelectorAll('.cal-day-cell').forEach(function(c){c.classList.remove('cal-day-selected');});this.classList.add('cal-day-selected');Cal._selectedDate=this.dataset.date;Cal._stickerPage=0;Cal.renderSelectedSection();});});},

  renderSelectedSection:function(){var section=App.$('#calSelectedSection');if(!section)return;var dateKey=Cal._selectedDate;if(!dateKey){section.innerHTML='';return;}var allMemos=Cal.getMemosForDate(dateKey);var memos=[];for(var i=0;i<allMemos.length;i++){var t=allMemos[i].type||'schedule';if(t!=='schedule')memos.push({memo:allMemos[i],idx:i});}var html='',memo;if(!memos.length){html+='<div class="cal-empty-dark">暂无记录，点击右上角 + 添加</div>';}else{var pi=Cal._stickerPage;if(pi>=memos.length){pi=0;Cal._stickerPage=0;}memo=memos[pi].memo;var total=memos.length;var hasEn=memo.textEn&&memo.textEn!==memo.content;var dt=hasEn?App.esc(memo.textEn):App.esc(memo.content||'');html+='<div class="sticker-wrap"><div class="sticker-paper" id="stickerPaper"><div class="torn-top"></div><div class="torn-bottom"></div><div class="torn-left"></div><div class="torn-right"></div><div class="paper-lines"></div><div class="tape"><div class="tape-body"><div class="tape-tear-l"></div><div class="tape-tear-r"></div></div></div><div class="sticker-text-en">'+dt+'</div>'+(hasEn?'<div class="sticker-text-zh">'+App.esc(memo.content||'')+'</div>':'')+(memo.time?'<div class="sticker-time">'+App.esc(memo.time)+'</div>':'')+(total>1?'<div class="sticker-pager" id="stickerPager"><span class="sticker-page-num">'+(pi+1)+' / '+total+'</span><span class="sticker-spade">♠</span></div>':'')+'</div></div><div class="sticker-actions"><button class="sticker-action-btn sticker-edit-btn" id="stickerEditBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg><span>编辑</span></button><button class="sticker-action-btn sticker-del-btn" id="stickerDelBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg><span>删除</span></button></div>';}section.innerHTML=html;var paper=App.$('#stickerPaper');if(paper&&memo&&memo.textEn&&memo.textEn!==memo.content){paper.addEventListener('click',function(e){if(e.target.closest('#stickerPager'))return;paper.classList.toggle('show-zh');});}var pager=App.$('#stickerPager');if(pager){pager.addEventListener('click',function(e){e.stopPropagation();Cal._stickerPage=(Cal._stickerPage+1)%memos.length;Cal.renderSelectedSection();var p=App.$('#stickerPaper');if(p){p.classList.add('turning');setTimeout(function(){p.classList.remove('turning');},350);}});}App.safeOn('#stickerEditBtn','click',function(){Cal.openEditMemo(dateKey,memos[Cal._stickerPage].idx);});App.safeOn('#stickerDelBtn','click',function(){if(!confirm('删除这条记录？'))return;Cal.removeMemo(dateKey,memos[Cal._stickerPage].idx);Cal._stickerPage=0;Cal.renderDaysGrid();Cal.renderSelectedSection();App.showToast('已删除');});},

  openEditMemo:function(dateKey,idx){var isNew=idx<0,list=Cal.getMemosForDate(dateKey),item=isNew?{type:'memo',content:'',textEn:'',time:''}:list[idx];var panel=App.$('#calPanel');if(!panel)return;panel.innerHTML='<div class="cal-panel-header"><div class="cal-panel-back" id="backFromMemo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div><h2>'+(isNew?'添加记录':'编辑记录')+'</h2><button class="cal-panel-action" id="saveMemoBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button></div><div class="cal-panel-body"><div class="cal-form-group"><label class="cal-form-label">内容（中文）</label><textarea class="cal-textarea" id="memoContent" rows="4" placeholder="写点什么...">'+App.esc(item.content||'')+'</textarea></div><div class="cal-form-group"><label class="cal-form-label">英文翻译（可选）</label><textarea class="cal-textarea" id="memoTextEn" rows="3" placeholder="English text...">'+App.esc(item.textEn||'')+'</textarea></div><div class="cal-form-group"><label class="cal-form-label">时间标注（可选）</label><input type="text" class="cal-input" id="memoTime" placeholder="如：15:00" value="'+App.esc(item.time||'')+'"></div></div>';App.safeOn('#backFromMemo','click',function(){Cal.renderCalendarView();});App.safeOn('#saveMemoBtn','click',function(){var content=App.$('#memoContent').value.trim();if(!content){App.showToast('请输入内容');return;}var ni={type:'memo',content:content,textEn:App.$('#memoTextEn').value.trim(),time:App.$('#memoTime').value.trim()};if(isNew)Cal.addMemo(dateKey,ni);else{list[idx]=ni;Cal.setSchedule(dateKey,list);}Cal.renderCalendarView();App.showToast(isNew?'已添加':'已保存');});},

  openTodaySchedule:function(){var panel=App.$('#calPanel');if(!panel)return;var key=Cal.todayKey(),now=new Date(),ds=now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日 '+Cal.WEEKDAYS[now.getDay()];panel.innerHTML='<div class="cal-panel-header"><div class="cal-panel-back" id="closeSchedulePanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></div><h2>今日行程</h2><button class="cal-panel-action" id="addScheduleBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button></div><div class="cal-panel-body"><div class="cal-schedule-date">'+ds+'</div><div id="todayScheduleList" class="cal-schedule-list"></div></div>';Cal.renderTodayScheduleList(key);panel.classList.remove('hidden');setTimeout(function(){panel.classList.add('show');},20);App.safeOn('#closeSchedulePanel','click',function(){Cal.closePanel();});App.safeOn('#addScheduleBtn','click',function(){Cal.openEditScheduleItem(key,-1);});},

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

    var schedArea=App.$('#wtScheduleArea');
    if(schedArea){
      schedArea.id='wtWeatherArea';
      schedArea.innerHTML=
        '<div class="wt-temp"><span id="wt-temp-val">--</span><span class="wt-deg">°</span></div>'+
        '<div class="wt-wl"></div>'+
        '<div class="wt-desc" id="wt-desc-val">天气</div>';
    }

    Cal.applyCardConfig();
    Cal.startClock();
    Cal.initGeo();
    Cal.bindCardClicks();
    Cal.initDrag();
    Cal.updateCardWeather();

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
