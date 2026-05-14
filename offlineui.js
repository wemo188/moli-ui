
(function(){
'use strict';
var App=window.App;if(!App)return;

var NEW_PLUS_SVG='<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M20 40C16 40 12 37 12 32C12 27.5 15 24.5 19 24C20 19 24.5 15 30 15C36 15 40.5 19 41.5 24C46 24.5 50 28 50 32.5C50 37.5 46.5 40 43 40" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M32 48V32" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round"/><path d="M26 38L32 32L38 38" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

var NEW_WAND_SVG='<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="32" cy="32" r="28" stroke="#1a1a1a" stroke-width="2.4" fill="none"/><line x1="20" y1="48" x2="38" y2="22" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round"/><path d="M40 16L41.5 20L46 20.5L42.5 23L43.5 27L40 24.5L36.5 27L37.5 23L34 20.5L38.5 20Z" stroke="#1a1a1a" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M48 34L49 36L51 36.5L49.5 38L50 40L48 39L46 40L46.5 38L45 36.5L47 36Z" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round" fill="none"/><circle cx="44" cy="42" r="1" fill="#1a1a1a"/><circle cx="30" cy="30" r="0.8" fill="#1a1a1a"/></svg>';

var ROBOT_SVG='<svg class="ol-robot-svg" viewBox="0 0 64 64" width="32" height="32" fill="none"><line x1="32" y1="14" x2="32" y2="10" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#1a1a1a"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#1a1a1a"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';

var STOP_SVG='<svg viewBox="0 0 24 24" width="16" height="16"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';

var CTX_ICONS={
copy:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
edit:'<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
regen:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg>',
del:'<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
delafter:'<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>'
};

var OfflineUI={

render:function(container,charData){
var c=charData;
var displayName=c.name||'';
var bgUrl=App.LS.get('olBg_'+c.id)||'';
var settings=App.LS.get('olSettings_'+c.id)||{};

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
  '<div class="ol-input-box">'+
    '<button class="ol-btn" id="olPlusBtn" type="button">'+NEW_PLUS_SVG+'</button>'+
    '<textarea class="ol-input" id="olInput" placeholder="输入内容..." rows="1"></textarea>'+
  '</div>'+
  '<button class="ol-btn" id="olPanelBtn" type="button">'+NEW_WAND_SVG+'</button>'+
  '<button class="ol-btn ol-btn-robot" id="olAiBtn" type="button">'+ROBOT_SVG+'</button>'+
'</div>'+

'<div id="olSettingsPanel" class="half-panel hidden" style="z-index: 100050;">'+
  '<div class="hp-handle"></div>'+
  '<div class="hp-header">'+
    '<h2>设置</h2>'+
    '<button class="hp-close" id="olPanelClose" type="button" style="background:transparent;"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/></svg></button>'+
  '</div>'+
  '<div class="hp-body" style="padding: 14px 20px 40px;">'+
    
    '<div class="hp-btn-row">'+
      '<button class="hp-btn hp-btn-primary" id="olSbScene">编辑场景</button>'+
      '<button class="hp-btn" id="olSbBg" style="border:1.5px solid var(--text-primary);color:var(--text-primary);">上传背景图</button>'+
    '</div>'+
    '<div class="hp-divider"></div>'+

    '<div class="hp-section-label">聊天设置</div>'+
    '<div style="font-size:12px;font-weight:700;color:#5a7a9a;margin-bottom:8px;">人称视角</div>'+
    '<div class="hp-btn-row" id="olPovRow">'+
      '<button class="hp-btn ol-pov-btn" data-pov="second">第二</button>'+
      '<button class="hp-btn ol-pov-btn" data-pov="first">第一</button>'+
      '<button class="hp-btn ol-pov-btn" data-pov="third">第三</button>'+
    '</div>'+
    '<div style="font-size:12px;font-weight:700;color:#5a7a9a;margin-bottom:8px;margin-top:12px;">对话引号</div>'+
    '<div class="hp-btn-row" id="olQuoteRow">'+
      '<button class="hp-btn ol-quote-btn" data-quote="smart">“”</button>'+
      '<button class="hp-btn ol-quote-btn" data-quote="straight">""</button>'+
      '<button class="hp-btn ol-quote-btn" data-quote="corner">「」</button>'+
    '</div>'+
    '<div class="hp-slider-row" style="margin-top:12px;">'+
      '<span class="hp-slider-label" style="width:60px;">期望字数</span>'+
      '<input type="number" id="olWordCount" style="flex:1;padding:8px;border:1.5px solid rgba(0,0,0,.15);border-radius:8px;background:transparent;outline:none;" placeholder="如 800，留空不限" value="'+(settings.wordCount||'')+'">'+
    '</div>'+
    '<div class="hp-divider"></div>'+

    '<div class="hp-section-label">外观</div>'+
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px 8px;margin-bottom:16px;">'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="hp-color-dot ol-sb-color" data-var="--ol-bg-color"></div><span style="font-size:10px;color:#999;font-weight:600;">页面背景</span></div>'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="hp-color-dot ol-sb-color" data-var="--ol-accent"></div><span style="font-size:10px;color:#999;font-weight:600;">主题色</span></div>'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="hp-color-dot ol-sb-color" data-var="--ol-prose-bg"></div><span style="font-size:10px;color:#999;font-weight:600;">气泡背景</span></div>'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="hp-color-dot ol-sb-color" data-var="--ol-prose-border"></div><span style="font-size:10px;color:#999;font-weight:600;">气泡边框</span></div>'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="hp-color-dot ol-sb-color" data-var="--ol-text-color"></div><span style="font-size:10px;color:#999;font-weight:600;">正文颜色</span></div>'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="hp-color-dot ol-sb-color" data-var="--ol-action-color"></div><span style="font-size:10px;color:#999;font-weight:600;">动作颜色</span></div>'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="hp-color-dot ol-sb-color" data-var="--ol-hd-bg"></div><span style="font-size:10px;color:#999;font-weight:600;">顶部栏</span></div>'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="hp-color-dot ol-sb-color" data-var="--ol-bar-bg"></div><span style="font-size:10px;color:#999;font-weight:600;">底部栏</span></div>'+
    '</div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">字号</span><input type="range" id="olFontSize" min="10" max="20" step="0.5"><span class="hp-slider-val" id="olFontSizeVal"></span></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">行高</span><input type="range" id="olLineHeight" min="1.2" max="2.5" step="0.05"><span class="hp-slider-val" id="olLineHeightVal"></span></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">圆角</span><input type="range" id="olRadius" min="0" max="24" step="1"><span class="hp-slider-val" id="olRadiusVal"></span></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">头像</span><input type="range" id="olAvSize" min="0" max="60" step="2"><span class="hp-slider-val" id="olAvSizeVal"></span></div>'+
    '<div style="display:flex;align-items:center;gap:12px;margin-top:12px;">'+
      '<span class="hp-slider-label" style="margin:0;">头像形状</span>'+
      '<div class="hp-btn-row" style="flex:1;margin:0;">'+
        '<button class="hp-btn ol-shape-btn" data-shape="50%">圆形</button>'+
        '<button class="hp-btn ol-shape-btn" data-shape="10px">方形</button>'+
      '</div>'+
    '</div>'+
    '<div class="hp-divider"></div>'+

    '<div class="hp-section-label">美化主题</div>'+
    '<div class="hp-btn-row">'+
      '<button class="hp-btn" id="olStyleReset" style="border:1.5px solid #c9706b;color:#c9706b;">重置外观</button>'+
    '</div>'+
    '<div class="hp-divider"></div>'+

    '<div class="hp-section-label">高级</div>'+
    '<div class="hp-btn-row">'+
      '<button class="hp-btn" id="olSbCode" style="border:1.5px solid rgba(0,0,0,.15);">自定义代码</button>'+
      '<button class="hp-btn" id="olSbClear" style="border:1.5px solid #c9706b;color:#c9706b;">清空记录</button>'+
    '</div>'+
    '<div class="hp-bottom-spacer"></div>'+
  '</div>'+
'</div>'+

'</div>';

OfflineUI.applyCustomCode(c.id);
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
var panel=App.$('#olSettingsPanel');

/* 左滑返回 */
var _sw={active:false,sx:0,sy:0,locked:false,dir:''};
if(root){
  root.addEventListener('touchstart',function(e){var t=e.touches[0];var r=root.getBoundingClientRect();if(t.clientX-r.left>50)return;_sw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
  root.addEventListener('touchmove',function(e){if(!_sw.active)return;var t=e.touches[0];var dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;if(!_sw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.locked=true;_sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_sw.dir==='h'&&dx>0){e.preventDefault();root.style.transform='translateX('+Math.min(dx,root.offsetWidth)+'px)';root.style.opacity=String(1-dx/root.offsetWidth*0.5);}},{passive:false});
  root.addEventListener('touchend',function(e){if(!_sw.active)return;_sw.active=false;if(_sw.dir!=='h'){root.style.transform='';root.style.opacity='';return;}var dx=e.changedTouches[0].clientX-_sw.sx;if(dx>root.offsetWidth*0.3){root.style.transition='transform .25s,opacity .25s';root.style.transform='translateX(100%)';root.style.opacity='0';setTimeout(function(){root.style.transition='';root.style.transform='';root.style.opacity='';OL.close();},260);}else{root.style.transition='transform .2s,opacity .2s';root.style.transform='';root.style.opacity='';setTimeout(function(){root.style.transition='';},220);}},{passive:true});
}

/* 打开半屏面板 */
App.safeOn('#olPanelBtn','click',function(e){
  e.stopPropagation();
  if(panel){
    panel.classList.remove('hidden');
    requestAnimationFrame(function(){panel.classList.add('show');});
  }
});

App.safeOn('#olPanelClose','click',function(){
  if(panel){
    panel.classList.remove('show');
    setTimeout(function(){panel.classList.add('hidden');},350);
  }
});

var input=App.$('#olInput');
if(input){
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});
  input.addEventListener('keydown',function(e){
    /* 允许所有端直接通过回车发送 */
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();OL.sendUser();}
  });
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

/* 设置项按钮高亮逻辑 */
function updateBtnStyle(btn, isActive) {
  if(isActive) {
    btn.classList.add('hp-btn-primary');
    btn.style.border = 'none';
  } else {
    btn.classList.remove('hp-btn-primary');
    btn.style.border = '1.5px solid rgba(0,0,0,.15)';
    btn.style.background = 'transparent';
    btn.style.color = 'inherit';
  }
}

var settings=OfflineUI.getSettings();

App.$$('.ol-pov-btn').forEach(function(btn){
  var isActive = btn.dataset.pov === settings.pov || (!settings.pov && btn.dataset.pov === 'second');
  updateBtnStyle(btn, isActive);
  btn.addEventListener('click',function(){
    App.$$('.ol-pov-btn').forEach(function(b){ updateBtnStyle(b, false); });
    updateBtnStyle(btn, true);
    var s=OfflineUI.getSettings();s.pov=btn.dataset.pov;OfflineUI.saveSettings(s);
  });
});

App.$$('.ol-quote-btn').forEach(function(btn){
  var isActive = btn.dataset.quote === settings.quoteStyle || (!settings.quoteStyle && btn.dataset.quote === 'smart');
  updateBtnStyle(btn, isActive);
  btn.addEventListener('click',function(){
    App.$$('.ol-quote-btn').forEach(function(b){ updateBtnStyle(b, false); });
    updateBtnStyle(btn, true);
    var s=OfflineUI.getSettings();s.quoteStyle=btn.dataset.quote;OfflineUI.saveSettings(s);
  });
});

var wc=App.$('#olWordCount');if(wc)wc.addEventListener('change',function(){var s=OfflineUI.getSettings();s.wordCount=parseInt(this.value)||0;OfflineUI.saveSettings(s);});

App.safeOn('#olSbScene','click',function(){OfflineUI.closeSidebar();OfflineUI.showSceneDialog();});
App.safeOn('#olSbBg','click',function(){OfflineUI.closeSidebar();OfflineUI.showBgMenu();});
App.safeOn('#olSbCode','click',function(){OfflineUI.closeSidebar();OfflineUI.openCodeEditor();});
App.safeOn('#olSbClear','click',function(){if(!confirm('清空所有聊天记录？'))return;OL.messages=[];OL.saveMsgs();OfflineUI.renderMessages();OfflineUI.closeSidebar();App.showToast('已清空');});

/* === 外观面板 === */
var STYLE_DEFAULTS={
  '--ol-bg-color':'#ffffff','--ol-accent':'#1a1a1a',
  '--ol-prose-bg':'rgba(255,255,255,.75)','--ol-prose-border':'rgba(200,220,240,.3)',
  '--ol-text-color':'#2e4258','--ol-action-color':'#1a1a1a',
  '--ol-hd-bg':'rgba(255,255,255,.85)','--ol-bar-bg':'rgba(255,255,255,.65)',
  '--ol-btn-color':'#1a1a1a','--ol-text-size':'14px',
  '--ol-text-line-height':'1.85','--ol-prose-radius':'14px',
  '--ol-av-size':'44px','--ol-av-radius':'50%',
  '--ol-arrow-size':'8px','--ol-av-name-show':'block'
};

function getStyleData(){return App.LS.get('olStyleData_'+OL.charId)||{};}
function saveStyleData(d){App.LS.set('olStyleData_'+OL.charId,d);}
function applyStyleData(){var d=getStyleData();var r=App.$('#olRoot');if(!r)return;Object.keys(d).forEach(function(k){if(k.startsWith('--'))r.style.setProperty(k,d[k]);});}

var styleData=getStyleData();

App.$$('.ol-sb-color').forEach(function(dot){
  var v=dot.dataset.var;
  var val=styleData[v]||STYLE_DEFAULTS[v]||'#ffffff';
  dot.style.background=val;
  dot.addEventListener('click',function(e){
    e.stopPropagation();
    if(!App.openColorPicker)return;
    App.openColorPicker(val,function(hex){
      dot.style.background=hex;val=hex;
      var d=getStyleData();d[v]=hex;saveStyleData(d);
      var r=App.$('#olRoot');if(r)r.style.setProperty(v,hex);
    },function(hex){
      dot.style.background=hex;
      var r=App.$('#olRoot');if(r)r.style.setProperty(v,hex);
    },'ol_'+v);
  });
});

var sliderCfg=[
  {id:'olFontSize',valId:'olFontSizeVal',varName:'--ol-text-size',unit:'px',def:14},
  {id:'olLineHeight',valId:'olLineHeightVal',varName:'--ol-text-line-height',unit:'',def:1.85},
  {id:'olRadius',valId:'olRadiusVal',varName:'--ol-prose-radius',unit:'px',def:14},
  {id:'olAvSize',valId:'olAvSizeVal',varName:'--ol-av-size',unit:'px',def:44}
];
sliderCfg.forEach(function(s){
  var slider=App.$('#'+s.id);var valEl=App.$('#'+s.valId);if(!slider||!valEl)return;
  var saved=styleData[s.varName];var current=saved?parseFloat(saved):s.def;
  slider.value=current;valEl.textContent=current+s.unit;
  slider.addEventListener('input',function(){
    var v=parseFloat(this.value);valEl.textContent=v+s.unit;
    var d=getStyleData();d[s.varName]=v+s.unit;saveStyleData(d);
    var r=App.$('#olRoot');if(r)r.style.setProperty(s.varName,v+s.unit);
  });
});

var curShape=styleData['--ol-av-radius']||'50%';
App.$$('.ol-shape-btn').forEach(function(btn){
  updateBtnStyle(btn, btn.dataset.shape === curShape);
  btn.addEventListener('click',function(){
    App.$$('.ol-shape-btn').forEach(function(b){ updateBtnStyle(b, false); });
    updateBtnStyle(btn, true);
    var d=getStyleData();d['--ol-av-radius']=btn.dataset.shape;saveStyleData(d);
    var r=App.$('#olRoot');if(r)r.style.setProperty('--ol-av-radius',btn.dataset.shape);
  });
});

App.safeOn('#olStyleReset','click',function(){
  App.LS.remove('olStyleData_'+OL.charId);
  var r=App.$('#olRoot');if(r){Object.keys(STYLE_DEFAULTS).forEach(function(k){r.style.removeProperty(k);});}
  OfflineUI.closeSidebar();App.showToast('外观已重置');
  setTimeout(function(){
    var p=App.$('#olSettingsPanel');
    if(p){p.classList.remove('hidden');requestAnimationFrame(function(){p.classList.add('show');});}
  },350);
});

applyStyleData();

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

getSettings:function(){var OL=App.offline;return App.LS.get('olSettings_'+(OL?OL.charId:''))||{};},
saveSettings:function(s){var OL=App.offline;if(OL)App.LS.set('olSettings_'+OL.charId,s);},
closeSidebar:function(){
  var p=App.$('#olSettingsPanel');
  if(p){p.classList.remove('show');setTimeout(function(){p.classList.add('hidden');},350);}
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
  '基础外观请用侧边栏的「外观」面板调整\n'+
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
  '  .ol-bg                 背景\n\n'+
  '=== 数据属性 ===\n'+
  '  [data-floor] [data-time]\n'+
  '  [data-chars] [data-tokens]\n';

  var ed=document.createElement('div');ed.className='ol-css-editor';
  ed.innerHTML=
    '<div class="ol-css-editor-header">'+
      '<button type="button" id="olCodeBack" style="background:none;border:none;color:#1a1a1a;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:4px 8px;">返回</button>'+
      '<span style="font-size:14px;font-weight:700;letter-spacing:1px;color:#e0e0e0;">自定义代码</span>'+
      '<button type="button" id="olCodeSave" style="background:none;border:none;color:#1a1a1a;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:4px 8px;">保存</button>'+
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
