
(function(){
'use strict';
var App=window.App;if(!App)return;
function pad(n){return n<10?'0'+n:''+n;}

var Cal={
  weather:null, city:'',
  _clockTimer:null, _refreshTimer:null,
  _weatherMode: 'animated', 
  _layoutMode: 'default',
  _dragX:0, _dragY:0,

  _weatherMap:{
    '113':'晴','116':'多云','119':'阴','122':'阴','143':'薄雾','176':'小雨','179':'小雪',
    '182':'冻雨','185':'冻雾雨','200':'雷阵雨','227':'小雪','230':'暴雪','248':'雾',
    '260':'冻雾','263':'小雨','266':'小雨','281':'冻雨','284':'冻雨','293':'小雨',
    '296':'小雨','299':'中雨','302':'大雨','305':'大雨','308':'暴雨','311':'冻雨',
    '314':'冻雨','317':'雨夹雪','320':'雨夹雪','323':'小雪','326':'小雪','329':'中雪',
    '332':'中雪','335':'大雪','338':'暴雪','350':'冰粒','353':'小雨','356':'大雨',
    '359':'暴雨','362':'冻雨','365':'冻雨','368':'小雪','371':'大雪','374':'冰粒',
    '377':'冰粒','386':'雷阵雨','389':'雷暴雨','392':'雷阵雪','395':'雷暴雪'
  },

  _codeToEffect:function(code){
    var c=parseInt(code)||0; var h=new Date().getHours(); var isNight=(h>=19||h<6);
    if(c===113||c===116) return isNight?'night':(c===113?'sunny':'cloudy');
    if(c===119||c===122) return 'overcast';
    if(c===143||c===248||c===260) return 'fog';
    if([176,263,266,281,284,293,296].indexOf(c)!==-1) return 'lightrain';
    if([299,302,305,308,311,314,353,356,359,362,365].indexOf(c)!==-1) return 'heavyrain';
    if([200,386,389].indexOf(c)!==-1) return 'thunder';
    if([179,182,185,227,317,320,323,326,368].indexOf(c)!==-1) return 'lightsnow';
    if([230,329,332,335,338,371,374,377,392,395].indexOf(c)!==-1) return 'heavysnow';
    return isNight?'night':'cloudy';
  },

  load:function(){
    Cal.city=App.LS.get('calCity')||'';
    Cal.weather=App.LS.get('calWeather')||null;
    Cal._layoutMode=App.LS.get('tkLayoutMode')==='default'?'default':'cat';
    var savedMode=App.LS.get('calWeatherMode');
    if(savedMode===undefined||savedMode===null){
      var legacy=App.LS.get('calWeatherAnimate');
      Cal._weatherMode=(legacy!==false)?'animated':'static';
    } else { Cal._weatherMode=savedMode; }
  },

  save:function(){ App.LS.set('calCity',Cal.city); App.LS.set('calWeather',Cal.weather); },

  applyLayout:function(){
    var card=App.$('#wtCard'); if(!card) return;
    card.classList.remove('tk17-cat-mode');
    card.querySelectorAll('.cat-part').forEach(function(el){ el.style.display='none'; });

    if(Cal._layoutMode==='cat'){
      card.classList.add('tk17-cat-mode');
      card.querySelectorAll('.cat-part').forEach(function(el){ el.style.display='block'; });
    }

    var catColors=App.LS.get('tkCatColors')||{ear:'#ffffff',whisker:'#d1d5db',star:'#ffffff'};
    card.style.setProperty('--cat-ear-color',catColors.ear);
    card.style.setProperty('--cat-whisker-color',catColors.whisker);
    card.style.setProperty('--cat-star-color',catColors.star);
  },

  startClock:function(){
    var tEl=App.$('#tkLargeTime'), dayEl=App.$('#tkDateDay'), weekEl=App.$('#tkDateWeek');
    if(!tEl) return;
    var WEEKDAYS_CN=['周日','周一','周二','周三','周四','周五','周六'];
    function tick(){
      var d=new Date();
      tEl.textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
      if(dayEl) dayEl.textContent=pad(d.getMonth()+1)+'/'+pad(d.getDate());
      if(weekEl) weekEl.textContent=WEEKDAYS_CN[d.getDay()];
    }
    tick();
    if(Cal._clockTimer)clearInterval(Cal._clockTimer);
    Cal._clockTimer=setInterval(tick,1000);
  },

  applyWeatherText:function(){
    var tEl=App.$('#calTemp'), dEl=App.$('#calWeatherDesc');
    if(Cal.weather){ if(tEl) tEl.textContent=Cal.weather.temp+'°C'; if(dEl) dEl.textContent=Cal.weather.desc; }
    else{ if(tEl) tEl.textContent='--°C'; if(dEl) dEl.textContent='未知'; }
  },

  /* 极致洗炼的逻辑枢纽：零样式，全数据绑定与干架构生成 */
  renderWeatherEffect:function(){
    var bg=App.$('#wtWeatherBg'); if(!bg)return;
    bg.innerHTML=''; Cal.applyWeatherText();
    var card=App.$('#wtCard');
    
    if(card){
      card.classList.remove('wt-static');
      card.removeAttribute('data-weather'); // 清空天象标识
      if(Cal._weatherMode==='static') card.classList.add('wt-static');
    }

    if(Cal._weatherMode==='none') return;
    
    if(!Cal.weather||!Cal.weather.code){
      var h=new Date().getHours();
      if(h>=19||h<6){
        if(card) card.setAttribute('data-weather','night');
        bg.innerHTML='<div class="wt-moon"></div><div class="wt-stars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';
      }
      return;
    }

    var effect=Cal._codeToEffect(Cal.weather.code);
    if(card) card.setAttribute('data-weather', effect); // 一指引流给 CSS 控制全场
    
    // 生成极端干净的颗粒骨架（CSS 将捕获标签并自行涂色驱动）
    switch(effect){
      case 'sunny': bg.innerHTML='<div class="wt-sun"></div>'; break;
      case 'night': bg.innerHTML='<div class="wt-moon"></div><div class="wt-stars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>'; break;
      case 'cloudy': bg.innerHTML='<div class="wt-clouds"><i></i><i></i><i></i></div>'; break;
      case 'overcast': bg.innerHTML='<div class="wt-overcasts"><i></i><i></i><i></i></div>'; break;
      case 'lightrain':
      case 'heavyrain': bg.innerHTML='<div class="wt-rains"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>'; break;
      case 'thunder': bg.innerHTML='<div class="wt-flash"></div><div class="wt-lightnings"><i></i><i></i></div><div class="wt-rains"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>'; break;
      case 'lightsnow':
      case 'heavysnow': bg.innerHTML='<div class="wt-snows"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>'; break;
      case 'fog': bg.innerHTML='<div class="wt-fogs"><i></i><i></i></div>'; break;
    }
  },

  _buildFontOptions:function(currentFamily){
    var BUILTIN=[{name:'跟随全局',family:''},{name:'系统默认',family:'-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif'},{name:'霞鹜文楷',family:'"LXGW WenKai",cursive'},{name:'思源宋体',family:'"Noto Serif SC",serif'},{name:'思源黑体',family:'"Noto Sans SC",sans-serif'},{name:'站酷小薇',family:'"ZCOOL XiaoWei",serif'},{name:'马善政楷',family:'"Ma Shan Zheng",cursive'}];
    var custom=(App.font&&App.font.customList)||[];
    var all=BUILTIN.concat(custom.map(function(f){return{name:f.fileName||f.name,family:f.family};}));
    return all.map(function(f){var sel=(currentFamily===f.family)?'selected':'';return '<option value="'+App.escAttr(f.family)+'" '+sel+'>'+App.esc(f.name)+'</option>';}).join('');
  },

  applyFont:function(){ var card=App.$('#wtCard');if(!card)return; var fam=App.LS.get('tkFontFamily')||''; if(fam) card.style.fontFamily=fam; else card.style.fontFamily=''; },

  applyTexts:function(){
    var color=App.LS.get('tkColor'); var card=App.$('#wtCard');
    if(card){ if(color) card.style.setProperty('--tk-color',color); else card.style.removeProperty('--tk-color'); }
  },

  applyBgImg:function(){
    var el=App.$('#tkBgArea');if(!el)return; var img=App.LS.get('calBgImg')||'';
    if(img){ el.style.backgroundImage='url('+img+')'; var glass=App.$('#tkGlass'); if(glass)glass.classList.add('hide'); }
    else{ el.style.backgroundImage=''; var glass=App.$('#tkGlass'); if(glass)glass.classList.remove('hide'); }
  },

  fetchWeather:function(city,callback){
    if(!city){if(callback)callback(null);return;}
    fetch('https://wttr.in/'+encodeURIComponent(city)+'?format=j1').then(function(r){if(!r.ok)throw new Error();return r.json();}).then(function(data){
      if(data&&data.current_condition&&data.current_condition.length){
        var c=data.current_condition[0]; var code=c.weatherCode||'';
        var desc=Cal._weatherMap[code]||(c.lang_zh&&c.lang_zh.length?c.lang_zh[0].value:'')||(c.weatherDesc&&c.weatherDesc.length?c.weatherDesc[0].value:'')||'未知';
        Cal.weather={temp:c.temp_C,humidity:c.humidity,desc:desc,code:code,time:Date.now()};
        Cal.save();Cal.renderWeatherEffect();if(callback)callback(Cal.weather);
      }else{if(callback)callback(null);}
    }).catch(function(){if(callback)callback(null);});
  },

  _editPanel:null,

  openEditPanel:function(){
    if(Cal._editPanel){ if(Cal._closePanelFn) Cal._closePanelFn(); return; }

    var currentColor=App.LS.get('tkColor')||'#111111';
    var catBaseColor=(App.LS.get('tkCatColors')||{}).ear||'#ffffff';
    var isWeatherOn=(Cal._weatherMode!=='none');
    var isAnimated=(Cal._weatherMode==='animated');

    var overlay=document.createElement('div');
    overlay.className='pc-edit-overlay'; overlay.style.zIndex='100020'; Cal._editPanel=overlay;
    var panel=document.createElement('div'); panel.className='pc-edit-panel';

    panel.innerHTML=
      '<div class="pc-header">时间胶囊设置<div class="pc-close-btn" id="wtEditClose">×</div></div>'+
      '<div class="pc-body">'+

        // ★ 第一行：内部壁纸 + 外观切换
        '<div style="display:flex; gap:12px;">'+
          '<div class="pc-group" style="flex:1;">'+
            '<span class="pc-label">内部壁纸</span>'+
            '<div class="pc-av-row">'+
              '<div class="pc-icon-btn" id="wtBgUploadBtn"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg></div>'+
              '<div class="pc-icon-btn danger" id="wtBgClearBtn"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"/></svg></div>'+
            '</div>'+
            '<input type="file" id="wtBgFileInput" accept="image/*" style="display:none;">'+
          '</div>'+
          '<div class="pc-group" style="flex:1;">'+
            '<span class="pc-label">外观</span>'+
            '<div class="pc-av-row" style="gap:6px;">'+
              '<div class="pc-icon-btn" id="wtModeDefault" style="flex:1;font-size:11px;font-weight:700;'+(Cal._layoutMode==='default'?'background:#1a1a1a;color:#fff;border-color:#1a1a1a;':'')+'">普通</div>'+
              '<div class="pc-icon-btn" id="wtModeCat" style="flex:1;font-size:11px;font-weight:700;'+(Cal._layoutMode==='cat'?'background:#1a1a1a;color:#fff;border-color:#1a1a1a;':'')+'">猫咪</div>'+
            '</div>'+
          '</div>'+
        '</div>'+

        // ★ 第二行：天气城市
        '<div class="pc-group">'+
          '<span class="pc-label">天气城市</span>'+
          '<div class="pc-av-row">'+
            '<input type="text" class="pc-input" id="wtCityInput" placeholder="城市名..." value="'+App.esc(Cal.city||'')+'">'+
            '<div class="pc-icon-btn" id="wtCitySearchBtn"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>'+
          '</div>'+
        '</div>'+

        // ★ 第三行：天气特效开关 + 动态/静态
        '<div class="pc-group">'+
          '<span class="pc-label">天气特效 <span class="pc-icon-btn" id="wtWeatherSwitch" style="display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;vertical-align:middle;margin-left:6px;'+(isWeatherOn?'background:#1a1a1a;color:#fff;border-color:#1a1a1a;':'')+'">'+(isWeatherOn?'开':'关')+'</span></span>'+
          '<div class="pc-av-row" id="wtAnimRow" style="gap:6px;margin-top:6px;'+(isWeatherOn?'':'opacity:0.4;pointer-events:none;')+'">'+
            '<div class="pc-icon-btn" id="wtAnimBtn" style="flex:1;font-size:11px;font-weight:700;'+(isAnimated?'background:#1a1a1a;color:#fff;border-color:#1a1a1a;':'')+'">动态</div>'+
            '<div class="pc-icon-btn" id="wtStaticBtn" style="flex:1;font-size:11px;font-weight:700;'+(!isAnimated&&isWeatherOn?'background:#1a1a1a;color:#fff;border-color:#1a1a1a;':'')+'">静态</div>'+
          '</div>'+
        '</div>'+

        // ★ 第四行：字体颜色 + 猫咪配色
        '<div style="display:flex; gap:12px;">'+
          '<div class="pc-group" style="flex:1;">'+
            '<span class="pc-label">字体颜色</span>'+
            '<div class="pc-av-row">'+
              '<select class="pc-input" id="wtFontSelect">'+Cal._buildFontOptions(App.LS.get('tkFontFamily')||'')+'</select>'+
              '<div class="pc-icon-btn" id="wtColorBtn" style="background:'+App.escAttr(currentColor)+'; cursor:pointer; flex-shrink:0;"></div>'+
            '</div>'+
          '</div>'+
          '<div class="pc-group" id="wtCatColorGroup" style="flex-shrink:0; width:80px;'+(Cal._layoutMode==='cat'?'':'display:none;')+'">'+
            '<span class="pc-label">猫咪配色</span>'+
            '<div class="pc-icon-btn" id="wtCatAllColorBtn" style="width:100%; height:32px; border-radius:8px; background:'+catBaseColor+'; border:1px solid rgba(0,0,0,0.1); cursor:pointer;"></div>'+
          '</div>'+
        '</div>'+

      '</div>'+
      '<div class="pc-footer">'+
        '<button class="pc-btn pc-btn-save" id="wtEditSave">保存</button>'+
      '</div>';

    overlay.appendChild(panel); document.body.appendChild(overlay);

    var pRect=panel.getBoundingClientRect();
    var startLeft=(window.innerWidth-pRect.width)/2;
    var startTop=window.innerHeight-pRect.height-40; if(startTop<10)startTop=10;
    panel.style.left=startLeft+'px'; panel.style.top=startTop+'px'; panel.style.margin='0';

    var header=panel.querySelector('.pc-header');
    var isDragging=false, dragStartX=0, dragStartY=0, panelStartLeft=0, panelStartTop=0;

    function onDragStart(e){
      if(e.target.closest('.pc-close-btn'))return; isDragging=true;
      var t=e.touches?e.touches[0]:e; dragStartX=t.clientX; dragStartY=t.clientY;
      var rect=panel.getBoundingClientRect(); panelStartLeft=rect.left; panelStartTop=rect.top;
      panel.style.transform='none'; panel.style.bottom='auto'; panel.style.right='auto';
    }
    function onDragMove(e){
      if(!isDragging)return; e.preventDefault();
      var t=e.touches?e.touches[0]:e;
      panel.style.left=(panelStartLeft+(t.clientX-dragStartX))+'px';
      panel.style.top=(panelStartTop+(t.clientY-dragStartY))+'px';
    }
    function onDragEnd(){ isDragging=false; }

    header.addEventListener('touchstart',onDragStart,{passive:true});
    document.addEventListener('touchmove',onDragMove,{passive:false});
    document.addEventListener('touchend',onDragEnd);

    var closePanel=function(){
      document.removeEventListener('touchmove',onDragMove);
      document.removeEventListener('touchend',onDragEnd);
      Cal._editPanel.remove(); Cal._editPanel=null; Cal._closePanelFn=null;
    };
    Cal._closePanelFn=closePanel;

    panel.querySelector('#wtEditClose').addEventListener('click',function(e){e.stopPropagation();closePanel();});
    overlay.addEventListener('click',function(e){if(e.target===overlay)closePanel();});
    panel.addEventListener('click',function(e){e.stopPropagation();});

    // ★ 基础功能绑定
    panel.querySelector('#wtBgUploadBtn').addEventListener('click',function(){panel.querySelector('#wtBgFileInput').click();});
    panel.querySelector('#wtBgFileInput').addEventListener('change',function(e){
      var file=e.target.files[0];if(!file)return;
      var reader=new FileReader();
      reader.onload=function(ev){
        var process=function(src){App.LS.set('calBgImg',src);Cal.applyBgImg();App.showToast('背景已设置');};
        if(App.cropImage)App.cropImage(ev.target.result,process); else process(ev.target.result);
      };
      reader.readAsDataURL(file); e.target.value='';
    });
    panel.querySelector('#wtBgClearBtn').addEventListener('click',function(){App.LS.remove('calBgImg');Cal.applyBgImg();App.showToast('背景已清除');});

    function updateModeUI(){
      var d=panel.querySelector('#wtModeDefault'), c=panel.querySelector('#wtModeCat');
      d.style.background=Cal._layoutMode==='default'?'#1a1a1a':''; d.style.color=Cal._layoutMode==='default'?'#fff':''; d.style.borderColor=Cal._layoutMode==='default'?'#1a1a1a':'';
      c.style.background=Cal._layoutMode==='cat'?'#1a1a1a':''; c.style.color=Cal._layoutMode==='cat'?'#fff':''; c.style.borderColor=Cal._layoutMode==='cat'?'#1a1a1a':'';
      var catGroup=panel.querySelector('#wtCatColorGroup');
      if(catGroup) catGroup.style.display=(Cal._layoutMode==='cat')?'':'none';
    }
    panel.querySelector('#wtModeDefault').addEventListener('click',function(){
      Cal._layoutMode='default'; App.LS.set('tkLayoutMode','default'); updateModeUI(); Cal.applyLayout();
      App.showToast('回归素雅本色');
    });
    panel.querySelector('#wtModeCat').addEventListener('click',function(){
      Cal._layoutMode='cat'; App.LS.set('tkLayoutMode','cat'); updateModeUI(); Cal.applyLayout();
      App.showToast('喵~猫咪降临');
    });

    function updateWeatherUI(){
      var on=(Cal._weatherMode!=='none');
      var sw=panel.querySelector('#wtWeatherSwitch');
      sw.textContent=on?'开':'关';
      sw.style.background=on?'#1a1a1a':''; sw.style.color=on?'#fff':''; sw.style.borderColor=on?'#1a1a1a':'';

      var row=panel.querySelector('#wtAnimRow');
      row.style.opacity=on?'1':'0.4'; row.style.pointerEvents=on?'':'none';

      var ab=panel.querySelector('#wtAnimBtn'), sb=panel.querySelector('#wtStaticBtn');
      var isAnim=(Cal._weatherMode==='animated');
      ab.style.background=isAnim?'#1a1a1a':''; ab.style.color=isAnim?'#fff':''; ab.style.borderColor=isAnim?'#1a1a1a':'';
      sb.style.background=(!isAnim&&on)?'#1a1a1a':''; sb.style.color=(!isAnim&&on)?'#fff':''; sb.style.borderColor=(!isAnim&&on)?'#1a1a1a':'';
    }
    panel.querySelector('#wtWeatherSwitch').addEventListener('click',function(){
      if(Cal._weatherMode==='none') Cal._weatherMode='animated'; else Cal._weatherMode='none';
      App.LS.set('calWeatherMode',Cal._weatherMode); updateWeatherUI(); Cal.renderWeatherEffect();
      App.showToast(Cal._weatherMode==='none'?'天象已封印':'天象重新解封');
    });
    panel.querySelector('#wtAnimBtn').addEventListener('click',function(){
      Cal._weatherMode='animated'; App.LS.set('calWeatherMode','animated'); updateWeatherUI(); Cal.renderWeatherEffect();
      App.showToast('灵气涌动中...');
    });
    panel.querySelector('#wtStaticBtn').addEventListener('click',function(){
      Cal._weatherMode='static'; App.LS.set('calWeatherMode','static'); updateWeatherUI(); Cal.renderWeatherEffect();
      App.showToast('时间凝固了');
    });

    panel.querySelector('#wtCitySearchBtn').addEventListener('click',function(){
      var name=panel.querySelector('#wtCityInput').value.trim();
      if(!name){App.showToast('请输入城市名');return;}
      App.showToast('获取天气中...'); Cal.city=name; Cal.save();
      Cal.fetchWeather(name,function(w){
        if(w){closePanel();Cal.openEditPanel();App.showToast(w.desc+' '+w.temp+'°C');}
        else App.showToast('获取失败');
      });
    });

    panel.querySelector('#wtColorBtn').addEventListener('click',function(){
      var cur=panel.dataset.pickedColor||App.LS.get('tkColor')||'#111111';
      App.openColorPicker(cur,function(color){
        panel.querySelector('#wtColorBtn').style.background=color;
        panel.dataset.pickedColor=color;
        var card=App.$('#wtCard'); if(card) card.style.setProperty('--tk-color',color);
      },function(color){
        var card=App.$('#wtCard'); if(card) card.style.setProperty('--tk-color',color);
      });
    });
    panel.querySelector('#wtFontSelect').addEventListener('change',function(){App.LS.set('tkFontFamily',this.value);Cal.applyFont();});

    panel.querySelector('#wtCatAllColorBtn').addEventListener('click',function(){
      var curColors=App.LS.get('tkCatColors')||{ear:'#ffffff',whisker:'#d1d5db',star:'#ffffff'};
      App.openColorPicker(curColors.ear,function(color){
        var newColors={ear:color,whisker:color,star:color};
        App.LS.set('tkCatColors',newColors);
        panel.querySelector('#wtCatAllColorBtn').style.background=color;
        Cal.applyLayout();
        App.showToast('黑魔法一键浸染完毕');
      },function(color){
        var card=App.$('#wtCard');
        if(card){card.style.setProperty('--cat-ear-color',color);card.style.setProperty('--cat-whisker-color',color);card.style.setProperty('--cat-star-color',color);}
      });
    });

    panel.querySelector('#wtEditSave').addEventListener('click',function(){
      App.LS.set('tkFontFamily',panel.querySelector('#wtFontSelect').value);
      if(panel.dataset.pickedColor) App.LS.set('tkColor',panel.dataset.pickedColor);
      Cal.applyTexts(); Cal.applyFont(); closePanel(); App.showToast('已保存');
    });
  },

  initDrag:function(){
    var card=App.$('#wtCard');if(!card||card._wtDragBound)return;
    card._wtDragBound=true;
    var DELAY=500;
    var startX,startY,origX,origY,longPressed=false,timer,moved=false;
    var saved=App.LS.get('wtCardPos');

    if(saved){
      Cal._dragX=saved.x||0; Cal._dragY=saved.y||0;
      var tf='translate('+Cal._dragX+'px,'+Cal._dragY+'px)';
      card.style.setProperty('--t',tf); card.style.transform=tf;
    }

    card.addEventListener('touchstart',function(e){
      var t=e.touches[0]; startX=t.clientX; startY=t.clientY;
      longPressed=false; moved=false;
      timer=setTimeout(function(){
        longPressed=true; origX=Cal._dragX; origY=Cal._dragY;
        card.classList.add('is-grabbed');
        card.style.transition='transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease';
        var tf='translate('+origX+'px,'+origY+'px) scale(1.05)';
        card.style.setProperty('--t',tf); card.style.transform=tf;
        card.style.zIndex='999';
        card.style.boxShadow='0 25px 50px rgba(0,0,0,0.18)';
        if(navigator.vibrate)navigator.vibrate(15);
      },DELAY);
    },{passive:true});

    card.addEventListener('touchmove',function(e){
      var t=e.touches[0];
      if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
      if(!longPressed)return;
      moved=true; e.preventDefault(); e.stopPropagation();
      Cal._dragX=origX+(t.clientX-startX); Cal._dragY=origY+(t.clientY-startY);
      card.style.transition='none';
      var tf='translate('+Cal._dragX+'px,'+Cal._dragY+'px) scale(1.05)';
      card.style.setProperty('--t',tf); card.style.transform=tf;
    },{passive:false});

    card.addEventListener('touchend',function(){
      clearTimeout(timer); timer=null;
      card.classList.remove('is-grabbed');
      card.style.boxShadow='';
      if(longPressed){
        if(moved) App.LS.set('wtCardPos',{x:Cal._dragX,y:Cal._dragY});
        card.style.transition='transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        var tf='translate('+Cal._dragX+'px,'+Cal._dragY+'px) scale(1)';
        card.style.setProperty('--t',tf); card.style.transform=tf;
        card.style.zIndex='';
        setTimeout(function(){ card.style.transition=''; },350);
      } else {
        card.style.zIndex='';
      }
      longPressed=false; moved=false;
    });
  },

  bindClicks:function(){
    var cardEl=App.$('.tk17-right-card');
    var lastTap=0;
    if(cardEl) cardEl.addEventListener('click',function(e){
      e.stopPropagation();
      var now=Date.now();
      if(now-lastTap<350) Cal.openEditPanel();
      lastTap=now;
    });
  },

  startAutoRefresh:function(){
    if(Cal._refreshTimer)clearInterval(Cal._refreshTimer);
    Cal._refreshTimer=setInterval(function(){if(Cal.city)Cal.fetchWeather(Cal.city,function(){});},30*60*1000);
  },

  init:function(){
    Cal.load(); Cal.applyLayout(); Cal.startClock(); Cal.renderWeatherEffect();
    Cal.applyBgImg(); Cal.applyTexts(); Cal.applyFont(); Cal.initDrag(); Cal.bindClicks();
    if(Cal.city&&Cal.weather){
      if(Date.now()-(Cal.weather.time||0)>30*60*1000) Cal.fetchWeather(Cal.city,function(){});
    } else if(Cal.city){
      Cal.fetchWeather(Cal.city,function(){});
    }
    Cal.startAutoRefresh();
    App.calendar=Cal;
  }
};

document.addEventListener('visibilitychange', function(){
  if(document.hidden){
    if(Cal._clockTimer){ clearInterval(Cal._clockTimer); Cal._clockTimer=null; }
  } else {
    Cal.startClock();
  }
});

App.register('calendar',Cal);
})();


