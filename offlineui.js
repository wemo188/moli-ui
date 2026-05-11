
(function(){
'use strict';
var App=window.App;if(!App)return;

var ROBOT_SVG='<svg class="ol-robot-svg" viewBox="0 0 64 64" width="34" height="34" fill="none"><line x1="32" y1="14" x2="32" y2="10" stroke="#7a9ab8" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#7a9ab8"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#7a9ab8"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';

var STOP_SVG='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';

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
var tintOn=App.LS.get('olTint_'+c.id);if(tintOn===null)tintOn=true;
var settings=App.LS.get('olSettings_'+c.id)||{};
var storyMode=settings.mode||'short';

var countSectionHtml='';
if(storyMode==='long'){
  countSectionHtml='<div class="ol-sb-sub-label">期望字数</div>'+
    '<input type="number" class="ol-sb-input" id="olWordCount" placeholder="如 800，留空不限" value="'+(settings.wordCount||'')+'">'+
    '<div class="ol-sb-hint">AI 将严格遵守该字数范围</div>';
} else {
  countSectionHtml='<div class="ol-sb-sub-label">每次回复条数</div>'+
    '<div style="display:flex;gap:10px;align-items:center;">'+
      '<input type="number" class="ol-sb-input" id="olMinMsgs" placeholder="最少" value="'+(settings.minMsgs||1)+'" min="1" max="10" style="width:70px;text-align:center;">'+
      '<span style="font-size:12px;color:#7a9ab8;">到</span>'+
      '<input type="number" class="ol-sb-input" id="olMaxMsgs" placeholder="最多" value="'+(settings.maxMsgs||4)+'" min="1" max="10" style="width:70px;text-align:center;">'+
      '<span style="font-size:11px;color:#a8c0d8;">条</span>'+
    '</div>';
}

container.innerHTML=
'<div class="ol-root" id="olRoot">'+
'<div class="ol-bg" id="olBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');':'')+'"></div>'+
'<div class="ol-tint'+(tintOn?'':' off')+'" id="olTint"></div>'+

'<div class="ol-hd">'+
  '<button class="ol-hd-btn" id="olBack" type="button"><svg viewBox="0 0 24 24" style="stroke-width:3;"><path d="M15 18l-6-6 6-6"/></svg></button>'+
  '<div class="ol-hd-name" id="olName">'+App.esc(displayName)+'</div>'+
  '<button class="ol-hd-btn" id="olWandBtn" type="button"><svg viewBox="0 0 24 24"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h0"/><path d="M17.8 6.2L19 5"/><path d="M11 6.2L9.7 5"/><path d="M11 11.8L9.7 13"/><path d="m21 21-9-9"/></svg></button>'+
'</div>'+

'<div class="ol-msgs" id="olMsgs"></div>'+

'<div class="ol-plus-panel" id="olPlusPanel">'+
  '<div class="ol-plus-item" id="olPiPhoto"><div class="ol-plus-icon"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div><div class="ol-plus-label">图片</div></div>'+
  '<div class="ol-plus-item" id="olPiFile"><div class="ol-plus-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="ol-plus-label">文件</div></div>'+
'</div>'+

'<div class="ol-input-wrap">'+
'<button class="ol-btn ol-btn-plus" id="olPlusBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>'+
  '<textarea class="ol-input" id="olInput" placeholder="输入内容..." rows="1"></textarea>'+
  '<button class="ol-btn ol-btn-robot" id="olAiBtn" type="button">'+ROBOT_SVG+'</button>'+
  '<button class="ol-btn ol-btn-send" id="olSendBtn" type="button"><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'+
'</div>'+

'<div class="ol-sidebar-mask" id="olSbMask"></div>'+
'<div class="ol-sidebar" id="olSidebar">'+
  '<div class="ol-sb-header">'+
    '<div class="ol-sb-title">设置</div>'+
    '<button class="ol-sb-close" id="olSbClose" type="button">×</button>'+
  '</div>'+
  '<div class="ol-sb-body">'+

    '<div class="ol-sb-section">'+
      '<div class="ol-sb-label">叙事模式</div>'+
      '<div class="ol-sb-mode-row">'+
        '<div class="ol-sb-mode-btn'+(storyMode==='short'?' active':'')+'" data-smode="short">短言叙事</div>'+
        '<div class="ol-sb-mode-btn'+(storyMode==='long'?' active':'')+'" data-smode="long">长文叙事</div>'+
      '</div>'+
    '</div>'+

    '<div class="ol-sb-section">'+
      '<div class="ol-sb-label">聊天设置</div>'+
      '<div style="margin-bottom:12px;">'+
        '<div class="ol-sb-sub-label">人称视角</div>'+
        '<div class="ol-sb-mode-row">'+
          '<div class="ol-sb-mode-btn ol-pov-btn'+((!settings.pov||settings.pov==='second')?' active':'')+'" data-pov="second">第二人称</div>'+
          '<div class="ol-sb-mode-btn ol-pov-btn'+(settings.pov==='first'?' active':'')+'" data-pov="first">第一人称</div>'+
          '<div class="ol-sb-mode-btn ol-pov-btn'+(settings.pov==='third'?' active':'')+'" data-pov="third">第三人称</div>'+
        '</div>'+
      '</div>'+
      '<div style="margin-bottom:12px;">'+
        '<div class="ol-sb-sub-label">对话引号</div>'+
        '<div class="ol-sb-mode-row">'+
          '<div class="ol-sb-mode-btn ol-quote-btn'+((!settings.quoteStyle||settings.quoteStyle==='smart')?' active':'')+'" data-quote="smart">\u201C\u201D</div>'+
          '<div class="ol-sb-mode-btn ol-quote-btn'+(settings.quoteStyle==='straight'?' active':'')+'" data-quote="straight">&quot;&quot;</div>'+
          '<div class="ol-sb-mode-btn ol-quote-btn'+(settings.quoteStyle==='corner'?' active':'')+'" data-quote="corner">「」</div>'+
        '</div>'+
      '</div>'+
      '<div id="olCountSection">'+countSectionHtml+'</div>'+
    '</div>'+

    '<div class="ol-sb-section">'+
      '<div class="ol-sb-label">场景 / 时间线</div>'+
      '<button class="ol-sb-btn" id="olSbScene" type="button">编辑场景</button>'+
    '</div>'+

    '<div class="ol-sb-section">'+
      '<div class="ol-sb-label">背景</div>'+
      '<button class="ol-sb-btn" id="olSbBg" type="button">上传背景图</button>'+
      '<div class="ol-sb-switch">'+
        '<span class="ol-sb-switch-name">晕染效果</span>'+
        '<div class="ol-sb-sw-track '+(tintOn?'on':'off')+'" id="olSbTint"></div>'+
      '</div>'+
    '</div>'+

  '</div>'+
'</div>'+

'</div>';
},

/* ★ 思维链解析：把 <think>...</think> 提取出来 */
parseThinking:function(text){
  var thinkContent='';
  var mainContent=text;
  var thinkMatch=text.match(/<think>([\s\S]*?)<\/think>/i);
  if(thinkMatch){
    thinkContent=thinkMatch[1].trim();
    mainContent=text.replace(/<think>[\s\S]*?<\/think>/gi,'').trim();
  }
  /* 兼容未闭合的 <think>（流式输出中途） */
  if(!thinkMatch){
    var openMatch=text.match(/<think>([\s\S]*)$/i);
    if(openMatch){
      thinkContent=openMatch[1].trim();
      mainContent=text.replace(/<think>[\s\S]*$/i,'').trim();
    }
  }
  return{think:thinkContent,main:mainContent};
},

/* ★ 思维链 HTML */
buildThinkHtml:function(thinkText){
  if(!thinkText)return '';
  return '<details class="ol-think-block" style="margin-bottom:6px;">'+
    '<summary style="font-size:11px;color:#a8c0d8;cursor:pointer;user-select:none;-webkit-user-select:none;padding:4px 0;">💭 思维过程（点击展开）</summary>'+
    '<div style="font-size:12px;color:#8aa0b8;line-height:1.6;padding:8px 10px;margin-top:4px;background:rgba(126,163,201,.06);border-radius:8px;border:1px solid rgba(126,163,201,.12);white-space:pre-wrap;word-break:break-word;max-height:200px;overflow-y:auto;">'+App.esc(thinkText)+'</div>'+
  '</details>';
},

renderMessages:function(){
var OL=App.offline;if(!OL)return;
var container=App.$('#olMsgs');if(!container)return;
var c=OL.charData;
var user=App.user?App.user.getActiveUser():null;
var settings=App.LS.get('olSettings_'+(OL.charId||''))||{};
var storyMode=settings.mode||'short';

if(!OL.messages.length){
  container.innerHTML='<div class="ol-empty">开始你们的故事吧</div>';
  return;
}

var html='';
var floor=0;

OL.messages.forEach(function(msg,idx){
  if(msg.role==='system')return;
  floor++;
  var isUser=msg.role==='user';
  var timeStr=msg.ts?OfflineUI.fmtTime(msg.ts):'';

  /* 时间分隔 */
  var showTimeSep=false;
  if(msg.ts){
    var prev=null;
    for(var pi=idx-1;pi>=0;pi--){if(OL.messages[pi].role!=='system'){prev=OL.messages[pi];break;}}
    if(!prev||!prev.ts||msg.ts-prev.ts>300000)showTimeSep=true;
  }
  if(showTimeSep&&timeStr)html+='<div class="ol-time-sep">'+timeStr+'</div>';

  var rawText=(msg.content||'').trim();if(!rawText)return;

  /* ★ 解析思维链 */
  var parsed=OfflineUI.parseThinking(rawText);
  var text=parsed.main;
  var thinkHtml=(!isUser&&parsed.think)?OfflineUI.buildThinkHtml(parsed.think):'';

  if(storyMode==='long'){
    html+='<div class="ol-prose'+(isUser?' is-user':'')+'" data-msg-idx="'+idx+'">'+
      thinkHtml+
      '<div class="ol-prose-content">'+OfflineUI.formatProse(text)+'</div>'+
      '<div class="ol-prose-meta"><span>#'+floor+'</span><span>'+timeStr+'</span></div>'+
    '</div>';
  } else {
    var av='';
    if(isUser){av=user&&user.avatar?'<img src="'+App.escAttr(user.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}
    else{av=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}

    html+='<div class="ol-msg '+(isUser?'user':'ai')+'" data-msg-idx="'+idx+'">'+
      '<div class="ol-msg-av">'+av+'</div>'+
      '<div class="ol-bubble-wrap">'+
        thinkHtml+
        '<div class="ol-bubble">'+OfflineUI.formatShort(text)+'</div>'+
        '<div class="ol-msg-meta"><span>#'+floor+'</span><span>'+timeStr+'</span></div>'+
      '</div>'+
    '</div>';
  }
});

/* 流式气泡 */
if(OL.isStreaming&&!OL._backgroundMode){
  if(storyMode==='long'){
    html+='<div class="ol-prose" id="olStreamProse"><div class="ol-prose-content" id="olStreamBubble"><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span></div></div>';
  } else {
    var sav=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
    html+='<div class="ol-msg ai" id="olStreamMsg"><div class="ol-msg-av">'+sav+'</div><div class="ol-bubble-wrap"><div class="ol-bubble" id="olStreamBubble"><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span></div></div></div>';
  }
}

container.innerHTML=html;
OfflineUI.scrollBottom();
},

formatShort:function(text){
  text=App.esc(text);
  /* 中文括号动作 */
  text=text.replace(/（([^）]+)）/g,'<span style="color:#8aa0b8;font-style:italic;">（$1）</span>');
  text=text.replace(/\(([^)]+)\)/g,'<span style="color:#8aa0b8;font-style:italic;">($1)</span>');
  /* 双星号旁白 */
  text=text.replace(/\*\*([^*]+)\*\*/g,'<span style="font-weight:700;color:#5a7a9a;">$1</span>');
  return text;
},

formatProse:function(text){
  text=App.esc(text);
  text=text.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  text=text.replace(/\*([^*]+)\*/g,'<em style="color:#7a9ab8;">$1</em>');
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
  var displayName=OL.charData?OL.charData.name:'';
  if(show)el.innerHTML=App.esc(displayName)+'<span class="ol-hd-typing">正在书写...</span>';
  else el.textContent=displayName;
},

bindEvents:function(){
var OL=App.offline;if(!OL)return;
var root=App.$('#olRoot');

/* 左滑返回 */
var _sw={active:false,sx:0,sy:0,locked:false,dir:''};
if(root){
  root.addEventListener('touchstart',function(e){
    var t=e.touches[0];var rect=root.getBoundingClientRect();
    if(t.clientX-rect.left>50)return;
    _sw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};
  },{passive:true});
  root.addEventListener('touchmove',function(e){
    if(!_sw.active)return;var t=e.touches[0];
    var dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;
    if(!_sw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.locked=true;_sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}
    if(_sw.dir==='h'&&dx>0){e.preventDefault();root.style.transform='translateX('+Math.min(dx,root.offsetWidth)+'px)';root.style.opacity=String(1-dx/root.offsetWidth*0.5);}
  },{passive:false});
  root.addEventListener('touchend',function(e){
    if(!_sw.active)return;_sw.active=false;
    if(_sw.dir!=='h'){root.style.transform='';root.style.opacity='';return;}
    var dx=e.changedTouches[0].clientX-_sw.sx;
    if(dx>root.offsetWidth*0.3){root.style.transition='transform .25s,opacity .25s';root.style.transform='translateX(100%)';root.style.opacity='0';setTimeout(function(){root.style.transition='';root.style.transform='';root.style.opacity='';OL.close();},260);}
    else{root.style.transition='transform .2s,opacity .2s';root.style.transform='';root.style.opacity='';setTimeout(function(){root.style.transition='';},220);}
  },{passive:true});
}

/* 右滑开侧边栏 */
var _rsw={active:false,sx:0,sy:0,locked:false,dir:''};
if(root){
  root.addEventListener('touchstart',function(e){
    var t=e.touches[0];var rect=root.getBoundingClientRect();
    if(t.clientX-rect.left<rect.width-50)return;
    _rsw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};
  },{passive:true});
  root.addEventListener('touchmove',function(e){
    if(!_rsw.active)return;var t=e.touches[0];
    var dx=t.clientX-_rsw.sx,dy=t.clientY-_rsw.sy;
    if(!_rsw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_rsw.locked=true;_rsw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}
    if(_rsw.dir==='h'&&dx<-30){e.preventDefault();OfflineUI.openSidebar();}
  },{passive:false});
  root.addEventListener('touchend',function(){_rsw.active=false;},{passive:true});
}

App.safeOn('#olBack','click',function(){OL.close();});
App.safeOn('#olWandBtn','click',function(e){e.stopPropagation();OfflineUI.openSidebar();});

/* 输入框 */
var input=App.$('#olInput');
if(input){
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!('ontouchstart' in window)){e.preventDefault();OL.sendUser();}});
}

App.safeOn('#olSendBtn','click',function(e){e.stopPropagation();OL.sendUser();});
App.safeOn('#olAiBtn','click',function(e){e.stopPropagation();if(OL.isStreaming){OL.stopStream();return;}OL.requestAI();});

/* 加号 */
App.safeOn('#olPlusBtn','click',function(e){
  e.stopPropagation();var pp=App.$('#olPlusPanel');if(!pp)return;
  OL._plusOpen=!OL._plusOpen;
  if(OL._plusOpen)pp.classList.add('show');else pp.classList.remove('show');
});

App.safeOn('#olPiPhoto','click',function(e){
  e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}
  /* 相册+URL 选择 */
  var menu=document.createElement('div');menu.className='pc-edit-overlay';menu.style.zIndex='100020';
  menu.innerHTML='<div class="pc-edit-panel" style="width:260px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">'+
    '<div class="pc-header">发送图片<div class="pc-close-btn" id="olPhX">×</div></div>'+
    '<div class="pc-body" style="gap:8px;">'+
      '<button class="pc-btn pc-btn-save" id="olPhAlbum" type="button" style="width:100%;">从相册选择</button>'+
      '<button class="pc-btn pc-btn-cancel" id="olPhUrl" type="button" style="width:100%;">输入图片URL</button>'+
    '</div></div>';
  document.body.appendChild(menu);
  menu.addEventListener('click',function(ev){if(ev.target===menu)menu.remove();});
  menu.querySelector('#olPhX').addEventListener('click',function(){menu.remove();});
  menu.querySelector('#olPhAlbum').addEventListener('click',function(){
    menu.remove();
    var inp2=document.createElement('input');inp2.type='file';inp2.accept='image/*';document.body.appendChild(inp2);
    inp2.onchange=function(ev){var f=ev.target.files[0];document.body.removeChild(inp2);if(!f)return;
      OL.messages.push({role:'user',content:'[用户展示了一张图片]',ts:Date.now()});OL.saveMsgs();OfflineUI.renderMessages();
    };inp2.click();
  });
  menu.querySelector('#olPhUrl').addEventListener('click',function(){
    menu.remove();var url=prompt('输入图片URL：');if(!url)return;
    OL.messages.push({role:'user',content:'[用户展示了一张图片]',ts:Date.now()});OL.saveMsgs();OfflineUI.renderMessages();
  });
});

App.safeOn('#olPiFile','click',function(e){
  e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}
  App.showToast('文件 · 开发中');
});

/* 侧边栏 */
App.safeOn('#olSbClose','click',function(){OfflineUI.closeSidebar();});
App.safeOn('#olSbMask','click',function(){OfflineUI.closeSidebar();});

/* ★ 模式切换 + 提示 + 动态切换条数/字数 */
App.$$('.ol-sb-mode-btn[data-smode]').forEach(function(btn){
  btn.addEventListener('click',function(){
    var prevMode=(OfflineUI.getSettings().mode)||'short';
    App.$$('.ol-sb-mode-btn[data-smode]').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    var s=OfflineUI.getSettings();s.mode=btn.dataset.smode;OfflineUI.saveSettings(s);
    OfflineUI.renderMessages();

    if(btn.dataset.smode!==prevMode){
      App.showToast(btn.dataset.smode==='long'?'已切换为长文叙事模式':'已切换为短言叙事模式');
    }

    var sec=App.$('#olCountSection');
    if(sec){
      if(btn.dataset.smode==='long'){
        sec.innerHTML='<div class="ol-sb-sub-label">期望字数</div>'+
          '<input type="number" class="ol-sb-input" id="olWordCount" placeholder="如 800，留空不限" value="'+(s.wordCount||'')+'">'+
          '<div class="ol-sb-hint">AI 将严格遵守该字数范围</div>';
        var wci=sec.querySelector('#olWordCount');
        if(wci)wci.addEventListener('change',function(){var ss=OfflineUI.getSettings();ss.wordCount=parseInt(this.value)||0;OfflineUI.saveSettings(ss);});
      } else {
        sec.innerHTML='<div class="ol-sb-sub-label">每次回复条数</div>'+
          '<div style="display:flex;gap:10px;align-items:center;">'+
            '<input type="number" class="ol-sb-input" id="olMinMsgs" placeholder="最少" value="'+(s.minMsgs||1)+'" min="1" max="10" style="width:70px;text-align:center;">'+
            '<span style="font-size:12px;color:#7a9ab8;">到</span>'+
            '<input type="number" class="ol-sb-input" id="olMaxMsgs" placeholder="最多" value="'+(s.maxMsgs||4)+'" min="1" max="10" style="width:70px;text-align:center;">'+
            '<span style="font-size:11px;color:#a8c0d8;">条</span></div>';
        OfflineUI._bindCountInputs(sec);
      }
    }
  });
});

/* 人称 */
App.$$('.ol-pov-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    App.$$('.ol-pov-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    var s=OfflineUI.getSettings();s.pov=btn.dataset.pov;OfflineUI.saveSettings(s);
  });
});

/* 引号 */
App.$$('.ol-quote-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    App.$$('.ol-quote-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    var s=OfflineUI.getSettings();s.quoteStyle=btn.dataset.quote;OfflineUI.saveSettings(s);
  });
});

/* 字数/条数初始绑定 */
var wcInit=App.$('#olWordCount');
if(wcInit)wcInit.addEventListener('change',function(){var s=OfflineUI.getSettings();s.wordCount=parseInt(this.value)||0;OfflineUI.saveSettings(s);});
OfflineUI._bindCountInputs(App.$('#olCountSection'));

/* 晕染 */
App.safeOn('#olSbTint','click',function(){
  var cur=App.LS.get('olTint_'+OL.charId);if(cur===null)cur=true;var next=!cur;
  App.LS.set('olTint_'+OL.charId,next);
  var tint=App.$('#olTint'),sw=App.$('#olSbTint');
  if(tint){if(next)tint.classList.remove('off');else tint.classList.add('off');}
  if(sw){sw.classList.toggle('on',next);sw.classList.toggle('off',!next);}
});

/* 场景 */
App.safeOn('#olSbScene','click',function(){OfflineUI.closeSidebar();OfflineUI.showSceneDialog();});

/* 背景 */
App.safeOn('#olSbBg','click',function(){OfflineUI.closeSidebar();OfflineUI.showBgMenu();});

/* 长按菜单 */
var mc=App.$('#olMsgs');
if(mc){
  var lt=null,lTarget=null,moved=false;
  mc.addEventListener('touchstart',function(e){
    var b=e.target.closest('.ol-bubble')||e.target.closest('.ol-prose');
    var m=e.target.closest('[data-msg-idx]');
    if(!b||!m)return;moved=false;
    var t=e.touches[0];lTarget={el:m,x:t.clientX,y:t.clientY};
    lt=setTimeout(function(){if(lTarget&&!moved){if(navigator.vibrate)navigator.vibrate(15);OfflineUI.showCtxMenu(lTarget.el,lTarget.x,lTarget.y);}},500);
  },{passive:true});
  mc.addEventListener('touchmove',function(){moved=true;clearTimeout(lt);lTarget=null;},{passive:true});
  mc.addEventListener('touchend',function(){clearTimeout(lt);lTarget=null;},{passive:true});
}

/* 点击收起 */
if(root){root.addEventListener('click',function(){
  OL.dismissCtx();
  var pp=App.$('#olPlusPanel');if(pp&&OL._plusOpen){pp.classList.remove('show');OL._plusOpen=false;}
});}

},

_bindCountInputs:function(sec){
  if(!sec)return;
  var mi=sec.querySelector('#olMinMsgs'),mx=sec.querySelector('#olMaxMsgs');
  if(mi)mi.addEventListener('change',function(){var s=OfflineUI.getSettings();s.minMsgs=parseInt(this.value)||1;OfflineUI.saveSettings(s);});
  if(mx)mx.addEventListener('change',function(){var s=OfflineUI.getSettings();s.maxMsgs=parseInt(this.value)||4;OfflineUI.saveSettings(s);});
},

getSettings:function(){var OL=App.offline;return App.LS.get('olSettings_'+(OL?OL.charId:''))||{};},
saveSettings:function(s){var OL=App.offline;if(OL)App.LS.set('olSettings_'+OL.charId,s);},

openSidebar:function(){
  var mask=App.$('#olSbMask'),sb=App.$('#olSidebar');
  if(mask)mask.classList.add('show');if(sb)sb.classList.add('show');
},

closeSidebar:function(){
  var mask=App.$('#olSbMask'),sb=App.$('#olSidebar');
  if(mask)mask.classList.remove('show');if(sb)sb.classList.remove('show');
},

showCtxMenu:function(msgEl,x,y){
  var OL=App.offline;if(!OL)return;OL.dismissCtx();
  var idx=parseInt(msgEl.dataset.msgIdx);if(isNaN(idx))return;
  var msg=OL.messages[idx];if(!msg)return;
  var isUser=msg.role==='user';
  var menu=document.createElement('div');menu.className='ol-ctx';
  var items='';
  items+='<div class="ol-ctx-item" data-act="copy">'+CTX_ICONS.copy+'<span>复制</span></div>';
  items+='<div class="ol-ctx-item" data-act="edit">'+CTX_ICONS.edit+'<span>编辑</span></div>';
  if(!isUser)items+='<div class="ol-ctx-item" data-act="regen">'+CTX_ICONS.regen+'<span>重写</span></div>';
  items+='<div class="ol-ctx-item" data-act="del">'+CTX_ICONS.del+'<span>删除</span></div>';
  items+='<div class="ol-ctx-item" data-act="delafter">'+CTX_ICONS.delafter+'<span>往后全删</span></div>';
  menu.innerHTML=items;
  var left=Math.max(8,Math.min(x-150,window.innerWidth-308));
  var top=y-100;if(top<60)top=y+10;
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
  overlay.innerHTML='<div class="pc-edit-panel" style="width:320px;max-height:70vh;overflow-y:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">'+
    '<div class="pc-header">编辑<div class="pc-close-btn" id="olEdClose">×</div></div>'+
    '<div class="pc-body"><textarea class="pc-input" id="olEdTA" style="min-height:120px;resize:vertical;">'+App.esc(msg.content)+'</textarea></div>'+
    '<div class="pc-footer"><button class="pc-btn pc-btn-save" id="olEdSave" type="button">保存</button><button class="pc-btn pc-btn-cancel" id="olEdCancel" type="button">取消</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  overlay.querySelector('#olEdClose').addEventListener('click',function(){overlay.remove();});
  overlay.querySelector('#olEdCancel').addEventListener('click',function(){overlay.remove();});
  overlay.querySelector('#olEdSave').addEventListener('click',function(){
    var val=overlay.querySelector('#olEdTA').value.trim();if(!val){App.showToast('不能为空');return;}
    OL.messages[idx].content=val;OL.saveMsgs();OfflineUI.renderMessages();overlay.remove();
  });
},

showSceneDialog:function(){
  var OL=App.offline;if(!OL)return;
  var current=App.LS.get('olScene_'+OL.charId)||'';
  var overlay=document.createElement('div');overlay.className='pc-edit-overlay';overlay.style.zIndex='100020';
  overlay.innerHTML='<div class="pc-edit-panel" style="width:320px;max-height:70vh;overflow-y:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">'+
    '<div class="pc-header">场景 / 时间线<div class="pc-close-btn" id="olScClose">×</div></div>'+
    '<div class="pc-body"><div style="font-size:11px;color:#8aa0b8;margin-bottom:8px;">描述当前场景、时间、地点、剧情背景等。</div><textarea class="pc-input" id="olScTA" style="min-height:120px;resize:vertical;" placeholder="例如：暴风雨之夜，山中木屋...">'+App.esc(current)+'</textarea></div>'+
    '<div class="pc-footer"><button class="pc-btn pc-btn-save" id="olScSave" type="button">保存</button><button class="pc-btn pc-btn-cancel" id="olScClear" type="button">清空</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  overlay.querySelector('#olScClose').addEventListener('click',function(){overlay.remove();});
  overlay.querySelector('#olScSave').addEventListener('click',function(){
    var val=overlay.querySelector('#olScTA').value.trim();
    if(val)App.LS.set('olScene_'+OL.charId,val);else App.LS.remove('olScene_'+OL.charId);
    overlay.remove();App.showToast('已保存');
  });
  overlay.querySelector('#olScClear').addEventListener('click',function(){App.LS.remove('olScene_'+OL.charId);overlay.remove();App.showToast('已清空');});
},

showBgMenu:function(){
  var OL=App.offline;if(!OL)return;
  var menu=document.createElement('div');menu.className='pc-edit-overlay';menu.style.zIndex='100020';
  menu.innerHTML='<div class="pc-edit-panel" style="width:260px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">'+
    '<div class="pc-header">背景<div class="pc-close-btn" id="olBgX">×</div></div>'+
    '<div class="pc-body" style="gap:8px;">'+
      '<button class="pc-btn pc-btn-save" id="olBgAlbum" type="button" style="width:100%;">从相册选择</button>'+
      '<button class="pc-btn pc-btn-cancel" id="olBgUrl" type="button" style="width:100%;">输入图片URL</button>'+
      '<button class="pc-btn pc-btn-cancel" id="olBgDel" type="button" style="width:100%;color:#c9706b;">移除背景</button>'+
    '</div></div>';
  document.body.appendChild(menu);
  menu.addEventListener('click',function(e){if(e.target===menu)menu.remove();});
  menu.querySelector('#olBgX').addEventListener('click',function(){menu.remove();});
  menu.querySelector('#olBgDel').addEventListener('click',function(){
    App.LS.remove('olBg_'+OL.charId);var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='';menu.remove();App.showToast('已移除');
  });
  menu.querySelector('#olBgAlbum').addEventListener('click',function(){
    menu.remove();
    var inp=document.createElement('input');inp.type='file';inp.accept='image/*';document.body.appendChild(inp);
    inp.onchange=function(ev){
      var file=ev.target.files[0];document.body.removeChild(inp);if(!file)return;
      var reader=new FileReader();
      reader.onload=function(r){
        if(App.cropImage){
          App.cropImage(r.target.result,function(cropped){
            try{App.LS.set('olBg_'+OL.charId,cropped);}catch(e){App.showToast('图片太大，请用URL');return;}
            var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='url('+cropped+')';App.showToast('背景已设置');
          });
        } else {
          try{App.LS.set('olBg_'+OL.charId,r.target.result);}catch(e){App.showToast('图片太大，请用URL');return;}
          var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='url('+r.target.result+')';App.showToast('背景已设置');
        }
      };reader.readAsDataURL(file);
    };inp.click();
  });
  menu.querySelector('#olBgUrl').addEventListener('click',function(){
    menu.remove();var url=prompt('输入背景图URL：');if(!url||!url.trim())return;url=url.trim();
    App.LS.set('olBg_'+OL.charId,url);
    var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='url('+url+')';App.showToast('背景已设置');
  });
},

init:function(){App.offlineUI=OfflineUI;}
};

App.register('offlineUI',OfflineUI);
})();
