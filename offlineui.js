
(function(){
'use strict';
var App=window.App;if(!App)return;

var ROBOT_SVG='<svg class="ol-robot-svg" viewBox="0 0 64 64" width="34" height="34" fill="none"><line x1="32" y1="14" x2="32" y2="10" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#1a1a1a"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#1a1a1a"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';

var STOP_SVG='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';

var PLUS_SVG='<svg viewBox="0 0 64 64" fill="none" width="32" height="32"><path d="M20 40C16 40 12 37 12 32C12 27.5 15 24.5 19 24C20 19 24.5 15 30 15C36 15 40.5 19 41.5 24C46 24.5 50 28 50 32.5C50 37.5 46.5 40 43 40" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M32 48V32" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round"/><path d="M26 38L32 32L38 38" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

var MAGIC_SVG='<svg viewBox="0 0 64 64" fill="none" width="32" height="32"><line x1="20" y1="48" x2="38" y2="22" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round"/><path d="M40 16L41.5 20L46 20.5L42.5 23L43.5 27L40 24.5L36.5 27L37.5 23L34 20.5L38.5 20Z" stroke="#1a1a1a" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M48 34L49 36L51 36.5L49.5 38L50 40L48 39L46 40L46.5 38L45 36.5L47 36Z" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round" fill="none"/><circle cx="44" cy="42" r="1" fill="#1a1a1a"/><circle cx="30" cy="30" r="0.8" fill="#1a1a1a"/></svg>';

var CTX_ICONS={
copy:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
edit:'<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
regen:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg>',
del:'<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
delafter:'<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>'
};

var STYLE_DEFAULTS={
  '--ol-bg-color':'#ffffff','--ol-accent':'#7a9ab8',
  '--ol-prose-bg':'rgba(255,255,255,.75)','--ol-prose-border':'rgba(200,220,240,.3)',
  '--ol-text-color':'#2e4258','--ol-action-color':'#7a9ab8',
  '--ol-hd-bg':'rgba(255,255,255,.85)','--ol-bar-bg':'rgba(255,255,255,.65)',
  '--ol-btn-color':'#1a1a1a','--ol-text-size':'14px',
  '--ol-text-line-height':'1.85','--ol-prose-radius':'14px',
  '--ol-av-size':'44px','--ol-av-radius':'50%',
  '--ol-arrow-size':'8px','--ol-av-name-show':'block'
};

var OfflineUI={

render:function(container,charData){
var c=charData;
var displayName=c.name||'';
var bgUrl=App.LS.get('olBg_'+c.id)||'';

container.innerHTML=
'<div class="ol-root" id="olRoot">'+
'<div class="ol-bg" id="olBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');':'')+'"></div>'+

'<div class="ol-hd">'+
  '<div class="ol-hd-name" id="olName">'+App.esc(displayName)+'</div>'+
'</div>'+

'<div class="ol-msgs" id="olMsgs"></div>'+

'<div class="ol-plus-panel" id="olPlusPanel">'+
  '<div class="ol-plus-item" id="olPiPhoto"><div class="ol-plus-icon"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div><div class="ol-plus-label">图片</div></div>'+
  '<div class="ol-plus-item" id="olPiFile"><div class="ol-plus-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="ol-plus-label">文件</div></div>'+
'</div>'+

'<div class="ol-input-wrap">'+
  '<button class="ol-btn" id="olPlusBtn" type="button">'+PLUS_SVG+'</button>'+
  '<button class="ol-btn" id="olMagicBtn" type="button">'+MAGIC_SVG+'</button>'+
  '<textarea class="ol-input" id="olInput" placeholder="输入内容..." rows="1"></textarea>'+
  '<button class="ol-btn ol-btn-robot" id="olAiBtn" type="button">'+ROBOT_SVG+'</button>'+
'</div>'+
'</div>';

OfflineUI.applyCustomCode(c.id);
OfflineUI.applyStyleData(c.id);
},

parseThinking:function(text){
  var thinkContent='',mainContent=text;
  var m=text.match(/<think>([\s\S]*?)<\/think>/i);
  if(m){thinkContent=m[1].trim();mainContent=text.replace(/<think>[\s\S]*?<\/think>/gi,'').trim();}
  if(!m){var o=text.match(/<think>([\s\S]*)$/i);if(o){thinkContent=o[1].trim();mainContent=text.replace(/<think>[\s\S]*$/i,'').trim();}}
  return{think:thinkContent,main:mainContent};
},

buildThinkHtml:function(t){
  if(!t)return '';
  return '<details class="ol-think-block"><summary class="ol-think-summary">💭 思维过程</summary><div class="ol-think-body">'+App.esc(t)+'</div></details>';
},

renderMessages:function(){
var OL=App.offline;if(!OL)return;
var container=App.$('#olMsgs');if(!container)return;
var c=OL.charData;
var user=App.user?App.user.getActiveUser():null;
var charAvHtml=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">'
  :'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
var userAvHtml=user&&user.avatar?'<img src="'+App.escAttr(user.avatar)+'">'
  :'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';

if(!OL.messages.length){
  container.innerHTML='<div class="ol-empty">开始你们的故事吧</div>';
  return;
}

var html='';var floor=0;

OL.messages.forEach(function(msg,idx){
  if(msg.role==='system')return;
  floor++;
  var isUser=msg.role==='user';
  var timeStr=msg.ts?OfflineUI.fmtTime(msg.ts):'';
  var charCount=(msg.content||'').length;
  var tokens=Math.round(charCount/2);
  var tokenStr=tokens>=1000?(tokens/1000).toFixed(1)+'k':tokens+'';
  var floorStr=String(floor).padStart(3,'0');

  var showTimeSep=false;
  if(msg.ts){
    var prev=null;
    for(var pi=idx-1;pi>=0;pi--){if(OL.messages[pi].role!=='system'){prev=OL.messages[pi];break;}}
    if(!prev||!prev.ts||msg.ts-prev.ts>300000)showTimeSep=true;
  }
  if(showTimeSep&&timeStr)html+='<div class="ol-time-sep">'+timeStr+'</div>';

  var rawText=(msg.content||'').trim();if(!rawText)return;
  var parsed=OfflineUI.parseThinking(rawText);
  var text=parsed.main;
  var thinkHtml=(!isUser&&parsed.think)?OfflineUI.buildThinkHtml(parsed.think):'';
  var avHtml=isUser?userAvHtml:charAvHtml;
  var avName=isUser?App.esc((user&&(user.nickname||user.realName))||'你'):App.esc(c.name||'');

  html+=
  '<div class="ol-block'+(isUser?' is-user':' is-char')+'" data-msg-idx="'+idx+'" data-floor="'+floor+'" data-time="'+timeStr+'" data-chars="'+charCount+'" data-tokens="'+tokens+'">'+
    '<div class="ol-avatar-area">'+
      '<div class="ol-avatar-frame"><div class="ol-avatar">'+avHtml+'</div></div>'+
      '<div class="ol-avatar-name">'+avName+'</div>'+
    '</div>'+
    '<div class="ol-scatter-meta">'+
      '<div class="ol-scatter-item"><span class="ol-scatter-floor">#'+floorStr+'</span><div class="ol-scatter-line"></div></div>'+
      '<div class="ol-scatter-item"><span class="ol-scatter-tokens">'+tokenStr+' tk</span><div class="ol-scatter-line"></div></div>'+
      '<div class="ol-scatter-item"><span class="ol-scatter-time">'+timeStr+'</span><div class="ol-scatter-line"></div></div>'+
      '<div class="ol-scatter-item"><span class="ol-scatter-chars">'+charCount+'字</span><div class="ol-scatter-line"></div></div>'+
    '</div>'+
    '<div class="ol-frame-top"></div>'+
    '<div class="ol-frame-mid"><div class="ol-bubble-inner">'+thinkHtml+'<div class="ol-bubble-text">'+OfflineUI.formatProse(text)+'</div></div></div>'+
    '<div class="ol-frame-bot"></div>'+
  '</div>';
});

if(OL.isStreaming&&!OL._backgroundMode){
  html+=
  '<div class="ol-block is-char" id="olStreamProse">'+
    '<div class="ol-avatar-area"><div class="ol-avatar-frame"><div class="ol-avatar">'+charAvHtml+'</div></div></div>'+
    '<div class="ol-scatter-meta"></div>'+
    '<div class="ol-frame-top"></div>'+
    '<div class="ol-frame-mid"><div class="ol-bubble-inner"><div class="ol-bubble-text" id="olStreamBubble"><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span></div></div></div>'+
    '<div class="ol-frame-bot"></div>'+
  '</div>';
}

container.innerHTML=html;
OfflineUI.scrollBottom();
},

formatProse:function(text){
  text=App.esc(text);
  text=text.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  text=text.replace(/\*([^*]+)\*/g,'<em>$1</em>');
  return text;
},

fmtTime:function(ts){var d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');},
scrollBottom:function(){var el=App.$('#olMsgs');if(el)requestAnimationFrame(function(){el.scrollTop=el.scrollHeight;});},

updateAiBtn:function(){
  var OL=App.offline;if(!OL)return;
  var btn=App.$('#olAiBtn');if(!btn)return;
  if(OL.isStreaming){btn.innerHTML=STOP_SVG;btn.classList.add('ol-btn-stop');btn.classList.remove('ol-btn-robot');}
  else{btn.innerHTML=ROBOT_SVG;btn.classList.remove('ol-btn-stop');btn.classList.add('ol-btn-robot');}
},

updateTyping:function(show){
  var OL=App.offline;if(!OL)return;
  var el=App.$('#olName');if(!el)return;
  var dn=OL.charData?OL.charData.name:'';
  if(show)el.innerHTML=App.esc(dn)+'<span class="ol-hd-typing">正在书写...</span>';
  else el.textContent=dn;
},

bindEvents:function(){
var OL=App.offline;if(!OL)return;
var root=App.$('#olRoot');

/* 左滑返回 */
var _sw={active:false,sx:0,sy:0,locked:false,dir:''};
if(root){
  root.addEventListener('touchstart',function(e){var t=e.touches[0];var r=root.getBoundingClientRect();if(t.clientX-r.left>50)return;_sw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
  root.addEventListener('touchmove',function(e){if(!_sw.active)return;var t=e.touches[0];var dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;if(!_sw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.locked=true;_sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_sw.dir==='h'&&dx>0){e.preventDefault();root.style.transform='translateX('+Math.min(dx,root.offsetWidth)+'px)';root.style.opacity=String(1-dx/root.offsetWidth*0.5);}},{passive:false});
  root.addEventListener('touchend',function(e){if(!_sw.active)return;_sw.active=false;if(_sw.dir!=='h'){root.style.transform='';root.style.opacity='';return;}var dx=e.changedTouches[0].clientX-_sw.sx;if(dx>root.offsetWidth*0.3){root.style.transition='transform .25s,opacity .25s';root.style.transform='translateX(100%)';root.style.opacity='0';setTimeout(function(){root.style.transition='';root.style.transform='';root.style.opacity='';OL.close();},260);}else{root.style.transition='transform .2s,opacity .2s';root.style.transform='';root.style.opacity='';setTimeout(function(){root.style.transition='';},220);}},{passive:true});
}

App.safeOn('#olMagicBtn','click',function(e){e.stopPropagation();OfflineUI.openSettings();});

var input=App.$('#olInput');
if(input){
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!('ontouchstart' in window)){e.preventDefault();OL.sendUser();}});
}

App.safeOn('#olAiBtn','click',function(e){e.stopPropagation();if(OL.isStreaming){OL.stopStream();return;}OL.requestAI();});
App.safeOn('#olPlusBtn','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(!pp)return;OL._plusOpen=!OL._plusOpen;if(OL._plusOpen)pp.classList.add('show');else pp.classList.remove('show');});

App.safeOn('#olPiPhoto','click',function(e){
  e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}
  var menu=document.createElement('div');menu.className='pc-edit-overlay';menu.style.zIndex='100020';
  menu.innerHTML='<div class="pc-edit-panel" style="width:260px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><div class="pc-header">发送图片<div class="pc-close-btn" id="olPhX">×</div></div><div class="pc-body" style="gap:8px;"><button class="pc-btn pc-btn-save" id="olPhAlbum" type="button" style="width:100%;">从相册选择</button><button class="pc-btn pc-btn-cancel" id="olPhUrl" type="button" style="width:100%;">输入图片URL</button></div></div>';
  document.body.appendChild(menu);
  menu.addEventListener('click',function(ev){if(ev.target===menu)menu.remove();});
  menu.querySelector('#olPhX').addEventListener('click',function(){menu.remove();});
  menu.querySelector('#olPhAlbum').addEventListener('click',function(){menu.remove();var inp=document.createElement('input');inp.type='file';inp.accept='image/*';document.body.appendChild(inp);inp.onchange=function(ev){var f=ev.target.files[0];document.body.removeChild(inp);if(!f)return;OL.messages.push({role:'user',content:'[用户展示了一张图片]',ts:Date.now()});OL.saveMsgs();OfflineUI.renderMessages();};inp.click();});
  menu.querySelector('#olPhUrl').addEventListener('click',function(){menu.remove();var url=prompt('输入图片URL：');if(!url)return;OL.messages.push({role:'user',content:'[用户展示了一张图片]',ts:Date.now()});OL.saveMsgs();OfflineUI.renderMessages();});
});

App.safeOn('#olPiFile','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}App.showToast('文件 · 开发中');});

/* 长按菜单 */
var mc=App.$('#olMsgs');
if(mc){
  var lt=null,lTarget=null,moved=false;
  mc.addEventListener('touchstart',function(e){var b=e.target.closest('.ol-block');if(!b)return;moved=false;var t=e.touches[0];lTarget={el:b,x:t.clientX,y:t.clientY};lt=setTimeout(function(){if(lTarget&&!moved){if(navigator.vibrate)navigator.vibrate(15);OfflineUI.showCtxMenu(lTarget.el,lTarget.x,lTarget.y);}},500);},{passive:true});
  mc.addEventListener('touchmove',function(){moved=true;clearTimeout(lt);lTarget=null;},{passive:true});
  mc.addEventListener('touchend',function(){clearTimeout(lt);lTarget=null;},{passive:true});
}

if(root){root.addEventListener('click',function(){OL.dismissCtx();var pp=App.$('#olPlusPanel');if(pp&&OL._plusOpen){pp.classList.remove('show');OL._plusOpen=false;}});}
},

/* ==================== 线下模式设置 (采用半屏面板) ==================== */
openSettings:function(){
  var OL=App.offline;if(!OL)return;
  var c=OL.charData;
  var settings=App.LS.get('olSettings_'+c.id)||{};
  var styleData=App.LS.get('olStyleData_'+c.id)||{};

  var panel=App.$('#olSettingsPanel');
  if(panel)panel.remove();

  panel=document.createElement('div');
  panel.id='olSettingsPanel';
  panel.className='half-panel hidden';
  panel.style.zIndex='100010';

  var povBtns=
    '<div class="hp-btn-row" style="margin-bottom:0;">'+
      '<button class="hp-btn ol-set-btn'+((!settings.pov||settings.pov==='second')?' active':'')+'" data-pov="second">第二人称</button>'+
      '<button class="hp-btn ol-set-btn'+(settings.pov==='first'?' active':'')+'" data-pov="first">第一人称</button>'+
      '<button class="hp-btn ol-set-btn'+(settings.pov==='third'?' active':'')+'" data-pov="third">第三人称</button>'+
    '</div>';

  var quoteBtns=
    '<div class="hp-btn-row" style="margin-bottom:0;">'+
      '<button class="hp-btn ol-set-btn'+((!settings.quoteStyle||settings.quoteStyle==='smart')?' active':'')+'" data-quote="smart">\u201C\u201D</button>'+
      '<button class="hp-btn ol-set-btn'+(settings.quoteStyle==='straight'?' active':'')+'" data-quote="straight">&quot;&quot;</button>'+
      '<button class="hp-btn ol-set-btn'+(settings.quoteStyle==='corner'?' active':'')+'" data-quote="corner">「」</button>'+
    '</div>';

  var shapeBtns=
    '<div class="hp-btn-row" style="margin-bottom:0;">'+
      '<button class="hp-btn ol-set-btn'+((!styleData['--ol-av-radius']||styleData['--ol-av-radius']==='50%')?' active':'')+'" data-shape="50%">圆形</button>'+
      '<button class="hp-btn ol-set-btn'+(styleData['--ol-av-radius']==='10px'?' active':'')+'" data-shape="10px">方形</button>'+
    '</div>';

  var arrowOn=styleData['--ol-arrow-size']!=='0px';
  var nameOn=styleData['--ol-av-name-show']!=='none';

  panel.innerHTML=
    '<div class="hp-handle"></div>'+
    '<div class="hp-header">'+
      '<h2>线下模式设置</h2>'+
      '<button class="hp-close" id="olSetClose" type="button"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>'+
    '</div>'+
    '<div class="hp-body">'+

      '<div class="hp-btn-row">'+
        '<button class="hp-btn hp-btn-primary" id="olSetSceneBtn" type="button">编辑场景</button>'+
        '<button class="hp-btn hp-btn-primary" id="olSetBgBtn" type="button">上传背景图</button>'+
      '</div>'+
      '<div class="hp-divider"></div>'+

      '<div class="hp-section-label">聊天设置</div>'+
      '<div class="hp-slider-row"><span class="hp-slider-label" style="width:60px;">人称视角</span>'+povBtns+'</div>'+
      '<div class="hp-slider-row"><span class="hp-slider-label" style="width:60px;">对话引号</span>'+quoteBtns+'</div>'+
      '<div class="hp-slider-row"><span class="hp-slider-label" style="width:60px;">期望字数</span><input type="number" id="olSetWordCount" value="'+(settings.wordCount||'')+'" placeholder="如 800，留空不限" style="flex:1;padding:8px;border:1.5px solid #ddd;border-radius:8px;outline:none;font-size:13px;"></div>'+
      '<div class="hp-divider"></div>'+

      '<div class="hp-section-label">外观</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin-bottom:14px;">'+
        '<div class="hp-color-row" style="margin:0;"><span class="hp-slider-label" style="flex:1;">页面背景</span><div class="hp-color-dot ol-clr-dot" data-var="--ol-bg-color"></div></div>'+
        '<div class="hp-color-row" style="margin:0;"><span class="hp-slider-label" style="flex:1;">主题色</span><div class="hp-color-dot ol-clr-dot" data-var="--ol-accent"></div></div>'+
        '<div class="hp-color-row" style="margin:0;"><span class="hp-slider-label" style="flex:1;">气泡背景</span><div class="hp-color-dot ol-clr-dot" data-var="--ol-prose-bg"></div></div>'+
        '<div class="hp-color-row" style="margin:0;"><span class="hp-slider-label" style="flex:1;">气泡边框</span><div class="hp-color-dot ol-clr-dot" data-var="--ol-prose-border"></div></div>'+
        '<div class="hp-color-row" style="margin:0;"><span class="hp-slider-label" style="flex:1;">正文颜色</span><div class="hp-color-dot ol-clr-dot" data-var="--ol-text-color"></div></div>'+
        '<div class="hp-color-row" style="margin:0;"><span class="hp-slider-label" style="flex:1;">动作颜色</span><div class="hp-color-dot ol-clr-dot" data-var="--ol-action-color"></div></div>'+
        '<div class="hp-color-row" style="margin:0;"><span class="hp-slider-label" style="flex:1;">顶部栏</span><div class="hp-color-dot ol-clr-dot" data-var="--ol-hd-bg"></div></div>'+
        '<div class="hp-color-row" style="margin:0;"><span class="hp-slider-label" style="flex:1;">底部栏</span><div class="hp-color-dot ol-clr-dot" data-var="--ol-bar-bg"></div></div>'+
        '<div class="hp-color-row" style="margin:0;"><span class="hp-slider-label" style="flex:1;">按钮颜色</span><div class="hp-color-dot ol-clr-dot" data-var="--ol-btn-color"></div></div>'+
      '</div>'+
      '<div class="hp-slider-row"><span class="hp-slider-label">字号</span><input type="range" id="olSetFontSize" min="10" max="20" step="0.5"><span class="hp-slider-val" id="olSetFontSizeVal"></span></div>'+
      '<div class="hp-slider-row"><span class="hp-slider-label">行高</span><input type="range" id="olSetLineHeight" min="1.2" max="2.5" step="0.05"><span class="hp-slider-val" id="olSetLineHeightVal"></span></div>'+
      '<div class="hp-slider-row"><span class="hp-slider-label">圆角</span><input type="range" id="olSetRadius" min="0" max="24" step="1"><span class="hp-slider-val" id="olSetRadiusVal"></span></div>'+
      '<div class="hp-slider-row"><span class="hp-slider-label">头像</span><input type="range" id="olSetAvSize" min="0" max="60" step="2"><span class="hp-slider-val" id="olSetAvSizeVal"></span></div>'+
      '<div class="hp-slider-row"><span class="hp-slider-label" style="width:60px;">形状</span>'+shapeBtns+'</div>'+
      '<div style="display:flex;gap:16px;margin-bottom:14px;">'+
        '<button class="hp-btn ol-toggle-btn '+(arrowOn?'active':'')+'" id="olSetArrowBtn">气泡尖角: '+(arrowOn?'开':'关')+'</button>'+
        '<button class="hp-btn ol-toggle-btn '+(nameOn?'active':'')+'" id="olSetNameBtn">头像名字: '+(nameOn?'开':'关')+'</button>'+
      '</div>'+
      '<div class="hp-btn-row"><button class="hp-btn-reset" id="olSetStyleReset" type="button" style="margin:0 auto;width:100%;">重置所有外观</button></div>'+
      '<div class="hp-divider"></div>'+

      '<div class="hp-section-label">高级与数据</div>'+
      '<div class="hp-btn-row" style="flex-wrap:wrap;">'+
        '<button class="hp-btn" id="olSetThemeBtn" type="button" style="background:#f5f5f5;border:1px solid #ddd;color:#333;">美化主题</button>'+
        '<button class="hp-btn" id="olSetCodeBtn" type="button" style="background:#f5f5f5;border:1px solid #ddd;color:#333;">自定义代码</button>'+
      '</div>'+
      '<div class="hp-btn-row">'+
        '<button class="hp-btn hp-btn-danger" id="olSetClearBtn" type="button">清空聊天记录</button>'+
      '</div>'+

      '<div class="hp-bottom-spacer"></div>'+
    '</div>';

  document.body.appendChild(panel);

  /* 样式小工具类 */
  var styleEl=document.getElementById('olSetDynamicStyle');
  if(!styleEl){styleEl=document.createElement('style');styleEl.id='olSetDynamicStyle';document.head.appendChild(styleEl);}
  styleEl.innerHTML='.ol-set-btn{background:rgba(0,0,0,.03);color:#666;border:1.5px solid transparent;}.ol-set-btn.active{background:rgba(126,163,201,.15);color:#2e4258;border-color:rgba(126,163,201,.4);}.ol-toggle-btn{background:rgba(0,0,0,.03);color:#666;}.ol-toggle-btn.active{background:rgba(26,26,26,.85);color:#fff;}';

  /* 绑定事件 */
  panel.querySelector('#olSetClose').addEventListener('click',function(){
    panel.classList.remove('show');
    setTimeout(function(){panel.remove();},350);
  });
  App.bindSwipeBack(panel,function(){panel.remove();});

  panel.querySelector('#olSetSceneBtn').addEventListener('click',function(){OfflineUI.showSceneDialog();});
  panel.querySelector('#olSetBgBtn').addEventListener('click',function(){OfflineUI.showBgMenu();});

  /* 聊天设置 */
  panel.querySelectorAll('.ol-set-btn[data-pov]').forEach(function(btn){
    btn.addEventListener('click',function(){
      panel.querySelectorAll('.ol-set-btn[data-pov]').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');settings.pov=btn.dataset.pov;App.LS.set('olSettings_'+c.id,settings);
    });
  });
  panel.querySelectorAll('.ol-set-btn[data-quote]').forEach(function(btn){
    btn.addEventListener('click',function(){
      panel.querySelectorAll('.ol-set-btn[data-quote]').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');settings.quoteStyle=btn.dataset.quote;App.LS.set('olSettings_'+c.id,settings);
    });
  });
  panel.querySelector('#olSetWordCount').addEventListener('change',function(){settings.wordCount=parseInt(this.value)||0;App.LS.set('olSettings_'+c.id,settings);});

  /* 颜色 */
  panel.querySelectorAll('.ol-clr-dot').forEach(function(dot){
    var v=dot.dataset.var;var val=styleData[v]||STYLE_DEFAULTS[v]||'#ffffff';
    dot.style.background=val;
    dot.addEventListener('click',function(e){
      e.stopPropagation();if(!App.openColorPicker)return;
      App.openColorPicker(val,function(hex){
        dot.style.background=hex;val=hex;styleData[v]=hex;App.LS.set('olStyleData_'+c.id,styleData);
        var r=App.$('#olRoot');if(r)r.style.setProperty(v,hex);
      },function(hex){
        dot.style.background=hex;var r=App.$('#olRoot');if(r)r.style.setProperty(v,hex);
      },'ol_'+v);
    });
  });

  /* 滑块 */
  var sliders=[
    {id:'olSetFontSize',valId:'olSetFontSizeVal',varName:'--ol-text-size',unit:'px',def:14},
    {id:'olSetLineHeight',valId:'olSetLineHeightVal',varName:'--ol-text-line-height',unit:'',def:1.85},
    {id:'olSetRadius',valId:'olSetRadiusVal',varName:'--ol-prose-radius',unit:'px',def:14},
    {id:'olSetAvSize',valId:'olSetAvSizeVal',varName:'--ol-av-size',unit:'px',def:44}
  ];
  sliders.forEach(function(s){
    var slider=panel.querySelector('#'+s.id);var valEl=panel.querySelector('#'+s.valId);
    var saved=styleData[s.varName];var current=saved?parseFloat(saved):s.def;
    slider.value=current;valEl.textContent=current+s.unit;
    slider.addEventListener('input',function(){
      var v=parseFloat(this.value);valEl.textContent=v+s.unit;
      styleData[s.varName]=v+s.unit;App.LS.set('olStyleData_'+c.id,styleData);
      var r=App.$('#olRoot');if(r)r.style.setProperty(s.varName,v+s.unit);
    });
  });

  /* 形状与开关 */
  panel.querySelectorAll('.ol-set-btn[data-shape]').forEach(function(btn){
    btn.addEventListener('click',function(){
      panel.querySelectorAll('.ol-set-btn[data-shape]').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');styleData['--ol-av-radius']=btn.dataset.shape;App.LS.set('olStyleData_'+c.id,styleData);
      var r=App.$('#olRoot');if(r)r.style.setProperty('--ol-av-radius',btn.dataset.shape);
    });
  });

  var arrowBtn=panel.querySelector('#olSetArrowBtn');
  arrowBtn.addEventListener('click',function(){
    arrowOn=!arrowOn;arrowBtn.classList.toggle('active',arrowOn);arrowBtn.textContent='气泡尖角: '+(arrowOn?'开':'关');
    styleData['--ol-arrow-size']=arrowOn?'8px':'0px';App.LS.set('olStyleData_'+c.id,styleData);
    var r=App.$('#olRoot');if(r)r.style.setProperty('--ol-arrow-size',arrowOn?'8px':'0px');
  });

  var nameBtn=panel.querySelector('#olSetNameBtn');
  nameBtn.addEventListener('click',function(){
    nameOn=!nameOn;nameBtn.classList.toggle('active',nameOn);nameBtn.textContent='头像名字: '+(nameOn?'开':'关');
    styleData['--ol-av-name-show']=nameOn?'block':'none';App.LS.set('olStyleData_'+c.id,styleData);
    var r=App.$('#olRoot');if(r)r.style.setProperty('--ol-av-name-show',nameOn?'block':'none');
  });

  panel.querySelector('#olSetStyleReset').addEventListener('click',function(){
    App.LS.remove('olStyleData_'+c.id);
    var r=App.$('#olRoot');if(r){Object.keys(STYLE_DEFAULTS).forEach(function(k){r.style.removeProperty(k);});}
    panel.classList.remove('show');setTimeout(function(){panel.remove();OfflineUI.openSettings();},350);
    App.showToast('外观已重置');
  });

  /* 高级 */
  panel.querySelector('#olSetThemeBtn').addEventListener('click',function(){App.showToast('美化主题功能开发中...');});
  panel.querySelector('#olSetCodeBtn').addEventListener('click',function(){panel.classList.remove('show');setTimeout(function(){panel.remove();OfflineUI.openCodeEditor();},350);});
  panel.querySelector('#olSetClearBtn').addEventListener('click',function(){
    if(!confirm('清空所有聊天记录？'))return;
    OL.messages=[];OL.saveMsgs();OfflineUI.renderMessages();
    panel.classList.remove('show');setTimeout(function(){panel.remove();},350);
    App.showToast('已清空');
  });

  panel.classList.remove('hidden');
  requestAnimationFrame(function(){panel.classList.add('show');});
},

applyStyleData:function(charId){
  var d=App.LS.get('olStyleData_'+charId)||{};
  var r=App.$('#olRoot');if(!r)return;
  Object.keys(d).forEach(function(k){if(k.startsWith('--'))r.style.setProperty(k,d[k]);});
},

showCtxMenu:function(msgEl,x,y){
  var OL=App.offline;if(!OL)return;OL.dismissCtx();
  var idx=parseInt(msgEl.dataset.msgIdx);if(isNaN(idx))return;
  var msg=OL.messages[idx];if(!msg)return;var isUser=msg.role==='user';
  var menu=document.createElement('div');menu.className='ol-ctx';
  var items='';
  items+='<div class="ol-ctx-item" data-act="copy">'+CTX_ICONS.copy+'<span>复制</span></div>';
  items+='<div class="ol-ctx-item" data-act="edit">'+CTX_ICONS.edit+'<span>编辑</span></div>';
  if(!isUser)items+='<div class="ol-ctx-item" data-act="regen">'+CTX_ICONS.regen+'<span>重写</span></div>';
  items+='<div class="ol-ctx-item" data-act="del">'+CTX_ICONS.del+'<span>删除</span></div>';
  items+='<div class="ol-ctx-item" data-act="delafter">'+CTX_ICONS.delafter+'<span>往后全删</span></div>';
  menu.innerHTML=items;
  var left=Math.max(8,Math.min(x-125,window.innerWidth-258));var top=y-80;if(top<60)top=y+10;
  menu.style.left=left+'px';menu.style.top=top+'px';
  document.body.appendChild(menu);OL._ctxMenu=menu;
  menu.querySelectorAll('.ol-ctx-item').forEach(function(item){
    item.addEventListener('click',function(e){e.stopPropagation();var act=item.dataset.act;OL.dismissCtx();
      if(act==='copy'){App.copyText(msg.content).then(function(){App.showToast('已复制');});}
      else if(act==='edit'){OfflineUI.showEditDialog(idx);}
      else if(act==='del'){OL.messages.splice(idx,1);OL.saveMsgs();OfflineUI.renderMessages();}
      else if(act==='delafter'){if(!confirm('删除此条及之后？'))return;OL.messages.splice(idx);OL.saveMsgs();OfflineUI.renderMessages();}
      else if(act==='regen'){OL.messages.splice(idx);OL.saveMsgs();OfflineUI.renderMessages();OL.requestAI();}
    });
  });
},

showEditDialog:function(idx){
  var OL=App.offline;if(!OL)return;var msg=OL.messages[idx];if(!msg)return;
  var overlay=document.createElement('div');overlay.className='pc-edit-overlay';overlay.style.zIndex='100020';
  overlay.innerHTML='<div class="pc-edit-panel" style="width:320px;max-height:70vh;overflow-y:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><div class="pc-header">编辑<div class="pc-close-btn" id="olEdX">×</div></div><div class="pc-body"><textarea class="pc-input" id="olEdTA" style="min-height:120px;resize:vertical;">'+App.esc(msg.content)+'</textarea></div><div class="pc-footer"><button class="pc-btn pc-btn-save" id="olEdSave" type="button">保存</button><button class="pc-btn pc-btn-cancel" id="olEdCancel" type="button">取消</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  overlay.querySelector('#olEdX').addEventListener('click',function(){overlay.remove();});
  overlay.querySelector('#olEdCancel').addEventListener('click',function(){overlay.remove();});
  overlay.querySelector('#olEdSave').addEventListener('click',function(){var val=overlay.querySelector('#olEdTA').value.trim();if(!val){App.showToast('不能为空');return;}OL.messages[idx].content=val;OL.saveMsgs();OfflineUI.renderMessages();overlay.remove();});
},

showSceneDialog:function(){
  var OL=App.offline;if(!OL)return;var current=App.LS.get('olScene_'+OL.charId)||'';
  var overlay=document.createElement('div');overlay.className='pc-edit-overlay';overlay.style.zIndex='100020';
  overlay.innerHTML='<div class="pc-edit-panel" style="width:320px;max-height:70vh;overflow-y:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><div class="pc-header">场景 / 时间线<div class="pc-close-btn" id="olScX">×</div></div><div class="pc-body"><div style="font-size:11px;color:#8aa0b8;margin-bottom:8px;">描述当前场景、时间、地点、剧情背景等。</div><textarea class="pc-input" id="olScTA" style="min-height:120px;resize:vertical;" placeholder="例如：暴风雨之夜，山中木屋...">'+App.esc(current)+'</textarea></div><div class="pc-footer"><button class="pc-btn pc-btn-save" id="olScSave" type="button">保存</button><button class="pc-btn pc-btn-cancel" id="olScClear" type="button">清空</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  overlay.querySelector('#olScX').addEventListener('click',function(){overlay.remove();});
  overlay.querySelector('#olScSave').addEventListener('click',function(){var val=overlay.querySelector('#olScTA').value.trim();if(val)App.LS.set('olScene_'+OL.charId,val);else App.LS.remove('olScene_'+OL.charId);overlay.remove();App.showToast('已保存');});
  overlay.querySelector('#olScClear').addEventListener('click',function(){App.LS.remove('olScene_'+OL.charId);overlay.remove();App.showToast('已清空');});
},

showBgMenu:function(){
  var OL=App.offline;if(!OL)return;
  var menu=document.createElement('div');menu.className='pc-edit-overlay';menu.style.zIndex='100020';
  menu.innerHTML='<div class="pc-edit-panel" style="width:260px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><div class="pc-header">背景<div class="pc-close-btn" id="olBgX">×</div></div><div class="pc-body" style="gap:8px;"><button class="pc-btn pc-btn-save" id="olBgAlbum" type="button" style="width:100%;">从相册选择</button><button class="pc-btn pc-btn-cancel" id="olBgUrl" type="button" style="width:100%;">输入图片URL</button><button class="pc-btn pc-btn-cancel" id="olBgDel" type="button" style="width:100%;color:#c9706b;">移除背景</button></div></div>';
  document.body.appendChild(menu);
  menu.addEventListener('click',function(e){if(e.target===menu)menu.remove();});
  menu.querySelector('#olBgX').addEventListener('click',function(){menu.remove();});
  menu.querySelector('#olBgDel').addEventListener('click',function(){App.LS.remove('olBg_'+OL.charId);var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='';menu.remove();App.showToast('已移除');});
  menu.querySelector('#olBgAlbum').addEventListener('click',function(){menu.remove();var inp=document.createElement('input');inp.type='file';inp.accept='image/*';document.body.appendChild(inp);inp.onchange=function(ev){var f=ev.target.files[0];document.body.removeChild(inp);if(!f)return;var reader=new FileReader();reader.onload=function(r){if(App.cropImage){App.cropImage(r.target.result,function(cropped){try{App.LS.set('olBg_'+OL.charId,cropped);}catch(e){App.showToast('图片太大');return;}var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='url('+cropped+')';App.showToast('已设置');});}else{try{App.LS.set('olBg_'+OL.charId,r.target.result);}catch(e){App.showToast('图片太大');return;}var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='url('+r.target.result+')';App.showToast('已设置');}};reader.readAsDataURL(f);};inp.click();});
  menu.querySelector('#olBgUrl').addEventListener('click',function(){menu.remove();var url=prompt('输入背景图URL：');if(!url||!url.trim())return;url=url.trim();App.LS.set('olBg_'+OL.charId,url);var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='url('+url+')';App.showToast('已设置');});
},

openCodeEditor:function(){
  var OL=App.offline;if(!OL)return;
  var saved=App.LS.get('olCustomCode_'+OL.charId)||'';

  var REF=
  '支持完整的 HTML + CSS + JS\n'+
  '直接写 <style>、<div>、<script> 都行\n\n'+
  '基础外观请用「设置面板」调整\n'+
  '这里用于高级自定义：添加装饰、改结构、加交互\n\n'+
  '=== 系统元素名 ===\n'+
  '  .ol-root              页面\n'+
  '  .ol-hd / .ol-hd-name  顶部栏\n'+
  '  .ol-block              消息块\n'+
  '  .is-user / .is-char    用户/角色\n'+
  '  .ol-avatar-area        头像区\n'+
  '  .ol-frame-mid          气泡\n'+
  '  .ol-bubble-text        正文\n'+
  '  .ol-scatter-meta       元信息\n'+
  '  .ol-input-wrap         底部栏\n'+
  '  .ol-bg                背景\n\n'+
  '=== 数据属性 ===\n'+
  '  [data-floor] [data-time]\n'+
  '  [data-chars] [data-tokens]\n';

  var ed=document.createElement('div');ed.className='ol-css-editor';
  ed.innerHTML=
    '<div class="ol-css-editor-header">'+
      '<button type="button" id="olCodeBack" style="background:none;border:none;color:#7a9ab8;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:4px 8px;">返回</button>'+
      '<span style="font-size:14px;font-weight:700;letter-spacing:1px;color:#e0e0e0;">自定义代码</span>'+
      '<button type="button" id="olCodeSave" style="background:none;border:none;color:#7a9ab8;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:4px 8px;">保存</button>'+
    '</div>'+
    '<div class="ol-css-ref"><div class="ol-css-ref-title" id="olCodeRefT">📋 参考表（点击展开）</div><pre class="ol-css-ref-body" id="olCodeRefB">'+App.esc(REF)+'</pre></div>'+
    '<textarea class="ol-css-textarea" id="olCodeTA" spellcheck="false" placeholder="支持 HTML + CSS + JS">'+App.esc(saved)+'</textarea>';
  document.body.appendChild(ed);

  ed.querySelector('#olCodeRefT').addEventListener('click',function(){
    var b=ed.querySelector('#olCodeRefB');b.classList.toggle('show');
    this.textContent=b.classList.contains('show')?'📋 参考表（点击收起）':'📋 参考表（点击展开）';
  });
  ed.querySelector('#olCodeBack').addEventListener('click',function(){ed.remove();});
  ed.querySelector('#olCodeSave').addEventListener('click',function(){
    var code=ed.querySelector('#olCodeTA').value||'';
    App.LS.set('olCustomCode_'+OL.charId,code);
    OfflineUI.applyCustomCode(OL.charId);
    ed.remove();App.showToast('已保存并生效');
  });
  ed.querySelector('#olCodeTA').addEventListener('keydown',function(e){
    if(e.key==='Tab'){e.preventDefault();var ta=this,s=ta.selectionStart,end=ta.selectionEnd;ta.value=ta.value.substring(0,s)+'  '+ta.value.substring(end);ta.selectionStart=ta.selectionEnd=s+2;}
  });
},

applyCustomCode:function(charId){
  var oldStyle=document.getElementById('olCustomStyle');if(oldStyle)oldStyle.remove();
  var oldHtml=document.getElementById('olCustomHtml');if(oldHtml)oldHtml.remove();

  var code=App.LS.get('olCustomCode_'+charId);
  if(!code)return;

  var cssText='';
  var cssRegex=/<style[^>]*>([\s\S]*?)<\/style>/gi;
  var cssMatch;
  while((cssMatch=cssRegex.exec(code))!==null){cssText+=cssMatch[1]+'\n';}

  var jsTexts=[];
  var jsRegex=/<script[^>]*>([\s\S]*?)<\/script>/gi;
  var jsMatch;
  while((jsMatch=jsRegex.exec(code))!==null){jsTexts.push(jsMatch[1]);}

  var htmlText=code.replace(/<style[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<script[^>]*>[\s\S]*?<\/script>/gi,'').trim();

  if(!/<style/i.test(code)&&!/<[a-z]/i.test(code)){cssText=code;htmlText='';}

  if(cssText){
    var style=document.createElement('style');style.id='olCustomStyle';
    style.textContent=cssText;document.head.appendChild(style);
  }

  if(htmlText){
    var cont=document.getElementById('olMsgs');
    if(cont){var div=document.createElement('div');div.id='olCustomHtml';div.innerHTML=htmlText;cont.insertBefore(div,cont.firstChild);}
  }

  if(jsTexts.length){
    jsTexts.forEach(function(js){try{var fn=new Function(js);fn();}catch(e){console.warn('[自定义代码] JS错误:',e.message);}});
  }
},

init:function(){App.offlineUI=OfflineUI;}
};

App.register('offlineUI',OfflineUI);
})();
