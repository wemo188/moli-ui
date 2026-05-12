(function(){
'use strict';
var App=window.App;if(!App)return;

var ROBOT_SVG='<svg class="ol-robot-svg" viewBox="0 0 64 64" width="34" height="34" fill="none"><line x1="32" y1="14" x2="32" y2="10" stroke="#7a9ab8" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#7a9ab8"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#7a9ab8"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';

var STOP_SVG='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';

var WAND_SVG='<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="32" cy="32" r="28" stroke="#2a2a2a" stroke-width="2.4" fill="none"/><path d="M32 18L34.5 25L42 25.5L36 30L38 37.5L32 33.5L26 37.5L28 30L22 25.5L29.5 25Z" stroke="#2a2a2a" stroke-width="2" stroke-linejoin="round" fill="none"/><path d="M48 38L49 40L51 40.3L49.5 41.8L50 44L48 42.8L46 44L46.5 41.8L45 40.3L47 40Z" stroke="#2a2a2a" stroke-width="1.2" stroke-linejoin="round" fill="none"/><path d="M18 20L19 22L21 22.3L19.5 23.8L20 26L18 24.8L16 26L16.5 23.8L15 22.3L17 22Z" stroke="#2a2a2a" stroke-width="1.2" stroke-linejoin="round" fill="none"/><circle cx="46" cy="22" r="1" fill="#2a2a2a"/><circle cx="20" cy="44" r="1" fill="#2a2a2a"/><circle cx="42" cy="48" r="0.8" fill="#2a2a2a"/></svg>';

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

container.innerHTML=
'<div class="ol-root" id="olRoot">'+
'<div class="ol-bg" id="olBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');':'')+'"></div>'+
'<div class="ol-tint'+(tintOn?'':' off')+'" id="olTint"></div>'+

'<div class="ol-hd">'+
  '<div class="ol-hd-name" id="olName">'+App.esc(displayName)+'</div>'+
  '<button class="ol-hd-btn" id="olWandBtn" type="button">'+WAND_SVG+'</button>'+
'</div>'+

'<div class="ol-msgs" id="olMsgs"></div>'+

'<div class="ol-plus-panel" id="olPlusPanel">'+
  '<div class="ol-plus-item" id="olPiPhoto"><div class="ol-plus-icon"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div><div class="ol-plus-label">图片</div></div>'+
  '<div class="ol-plus-item" id="olPiFile"><div class="ol-plus-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="ol-plus-label">文件</div></div>'+
'</div>'+

'<div class="ol-input-wrap">'+
  '<button class="ol-btn ol-btn-plus" id="olPlusBtn" type="button"><svg viewBox="0 0 24 24" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>'+
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
      '<div>'+
        '<div class="ol-sb-sub-label">期望字数</div>'+
        '<input type="number" class="ol-sb-input" id="olWordCount" placeholder="如 800，留空不限" value="'+(settings.wordCount||'')+'">'+
        '<div class="ol-sb-hint">AI 将严格遵守该字数范围</div>'+
      '</div>'+
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

    '<div class="ol-sb-section" style="border-bottom:none;">'+
      '<div class="ol-sb-label">高级</div>'+
      '<button class="ol-sb-btn" id="olSbCss" type="button">自定义 CSS</button>'+
      '<button class="ol-sb-btn" id="olSbClear" type="button" style="color:rgba(201,112,107,.7);border-color:rgba(201,112,107,.2);">清空记录</button>'+
    '</div>'+

  '</div>'+
'</div>'+

'</div>';

OfflineUI.applyCustomCSS(c.id);
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
    '<div class="ol-frame-top"></div>'+
    '<div class="ol-avatar-area">'+
      '<div class="ol-avatar-frame"><div class="ol-avatar">'+avHtml+'</div></div>'+
      '<div class="ol-avatar-name">'+avName+'</div>'+
    '</div>'+
    '<div class="ol-frame-mid">'+
      '<div class="ol-bubble-inner">'+thinkHtml+'<div class="ol-bubble-text">'+OfflineUI.formatProse(text)+'</div></div>'+
    '</div>'+
    '<div class="ol-frame-bot"></div>'+
    '<div class="ol-scatter-meta">'+
      '<span class="ol-scatter-floor">#'+floor+'</span>'+
      '<span class="ol-scatter-time">'+timeStr+'</span>'+
      '<span class="ol-scatter-chars">'+charCount+'字</span>'+
      '<span class="ol-scatter-tokens">'+tokens+'tk</span>'+
    '</div>'+
  '</div>';
});

if(OL.isStreaming&&!OL._backgroundMode){
  html+=
  '<div class="ol-block is-char" id="olStreamProse">'+
    '<div class="ol-frame-top"></div>'+
    '<div class="ol-avatar-area"><div class="ol-avatar-frame"><div class="ol-avatar">'+charAvHtml+'</div></div></div>'+
    '<div class="ol-frame-mid"><div class="ol-bubble-inner"><div class="ol-bubble-text" id="olStreamBubble"><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span></div></div></div>'+
    '<div class="ol-frame-bot"></div>'+
    '<div class="ol-scatter-meta"></div>'+
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

var _sw={active:false,sx:0,sy:0,locked:false,dir:''};
if(root){
  root.addEventListener('touchstart',function(e){var t=e.touches[0];var r=root.getBoundingClientRect();if(t.clientX-r.left>50)return;_sw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
  root.addEventListener('touchmove',function(e){if(!_sw.active)return;var t=e.touches[0];var dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;if(!_sw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.locked=true;_sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_sw.dir==='h'&&dx>0){e.preventDefault();root.style.transform='translateX('+Math.min(dx,root.offsetWidth)+'px)';root.style.opacity=String(1-dx/root.offsetWidth*0.5);}},{passive:false});
  root.addEventListener('touchend',function(e){if(!_sw.active)return;_sw.active=false;if(_sw.dir!=='h'){root.style.transform='';root.style.opacity='';return;}var dx=e.changedTouches[0].clientX-_sw.sx;if(dx>root.offsetWidth*0.3){root.style.transition='transform .25s,opacity .25s';root.style.transform='translateX(100%)';root.style.opacity='0';setTimeout(function(){root.style.transition='';root.style.transform='';root.style.opacity='';OL.close();},260);}else{root.style.transition='transform .2s,opacity .2s';root.style.transform='';root.style.opacity='';setTimeout(function(){root.style.transition='';},220);}},{passive:true});
}

var _rsw={active:false,sx:0,sy:0,locked:false,dir:''};
if(root){
  root.addEventListener('touchstart',function(e){var t=e.touches[0];var r=root.getBoundingClientRect();if(t.clientX-r.left<r.width-50)return;_rsw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
  root.addEventListener('touchmove',function(e){if(!_rsw.active)return;var t=e.touches[0];var dx=t.clientX-_rsw.sx,dy=t.clientY-_rsw.sy;if(!_rsw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_rsw.locked=true;_rsw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_rsw.dir==='h'&&dx<-30){e.preventDefault();OfflineUI.openSidebar();}},{passive:false});
  root.addEventListener('touchend',function(){_rsw.active=false;},{passive:true});
}

App.safeOn('#olWandBtn','click',function(e){e.stopPropagation();OfflineUI.openSidebar();});

var input=App.$('#olInput');
if(input){
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!('ontouchstart' in window)){e.preventDefault();OL.sendUser();}});
}

App.safeOn('#olSendBtn','click',function(e){e.stopPropagation();OL.sendUser();});
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

App.safeOn('#olSbClose','click',function(){OfflineUI.closeSidebar();});
App.safeOn('#olSbMask','click',function(){OfflineUI.closeSidebar();});

App.$$('.ol-pov-btn').forEach(function(btn){btn.addEventListener('click',function(){App.$$('.ol-pov-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');var s=OfflineUI.getSettings();s.pov=btn.dataset.pov;OfflineUI.saveSettings(s);});});
App.$$('.ol-quote-btn').forEach(function(btn){btn.addEventListener('click',function(){App.$$('.ol-quote-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');var s=OfflineUI.getSettings();s.quoteStyle=btn.dataset.quote;OfflineUI.saveSettings(s);});});

var wc=App.$('#olWordCount');if(wc)wc.addEventListener('change',function(){var s=OfflineUI.getSettings();s.wordCount=parseInt(this.value)||0;OfflineUI.saveSettings(s);});

App.safeOn('#olSbTint','click',function(){var cur=App.LS.get('olTint_'+OL.charId);if(cur===null)cur=true;var next=!cur;App.LS.set('olTint_'+OL.charId,next);var tint=App.$('#olTint'),sw=App.$('#olSbTint');if(tint){if(next)tint.classList.remove('off');else tint.classList.add('off');}if(sw){sw.classList.toggle('on',next);sw.classList.toggle('off',!next);}});
App.safeOn('#olSbScene','click',function(){OfflineUI.closeSidebar();OfflineUI.showSceneDialog();});
App.safeOn('#olSbBg','click',function(){OfflineUI.closeSidebar();OfflineUI.showBgMenu();});
App.safeOn('#olSbCss','click',function(){OfflineUI.closeSidebar();OfflineUI.openCssEditor();});
App.safeOn('#olSbClear','click',function(){if(!confirm('清空所有聊天记录？'))return;OL.messages=[];OL.saveMsgs();OfflineUI.renderMessages();OfflineUI.closeSidebar();App.showToast('已清空');});

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
openSidebar:function(){var m=App.$('#olSbMask'),s=App.$('#olSidebar');if(m)m.classList.add('show');if(s)s.classList.add('show');},
closeSidebar:function(){var m=App.$('#olSbMask'),s=App.$('#olSidebar');if(m)m.classList.remove('show');if(s)s.classList.remove('show');},

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

openCssEditor:function(){
  var OL=App.offline;if(!OL)return;
  var saved=App.LS.get('olCustomCSS_'+OL.charId)||'';

  var REF=
  '★ 在 .ol-root 上改全局变量\n★ 在 .ol-block 上改消息变量\n\n'+
  '=== 全局（.ol-root）===\n'+
  '  --ol-bg-color           页面背景\n  --ol-text-color          正文颜色\n  --ol-text-size           正文字号\n  --ol-text-line-height    行高\n  --ol-accent              主题色\n  --ol-hd-bg/border/text/size  顶部栏\n  --ol-bar-bg/border       底部栏\n  --ol-input-bg/border/text/radius  输入框\n  --ol-btn-color/size      底部按钮\n  --ol-prose-bg/border/radius/padding/shadow  气泡\n  --ol-user-bg/border/text 用户气泡\n  --ol-dialogue-color      对话色\n  --ol-action-color        动作色（*斜体*）\n  --ol-narration-color     旁白色（**粗体**）\n  --ol-narration-weight    旁白粗细\n\n'+
  '=== 消息块（.ol-block）===\n'+
  '  --ol-av-size            头像大小\n  --ol-av-gap              头像与气泡间距\n  --ol-av-border           头像边框\n  --ol-av-radius           头像圆角（50%=圆）\n  --ol-av-shadow           头像阴影\n  --ol-av-name-show        名字显隐（block/none）\n  --ol-av-name-size/color  名字字号/颜色\n  --ol-arrow-size          尖角大小（0=隐藏）\n  --ol-arrow-color         尖角颜色\n  --ol-scatter-show        元信息显隐（flex/none）\n\n'+
  '=== 三段切图 ===\n'+
  '  --ol-frame-width        整体宽度\n  --ol-frame-top-img       顶部图 url()\n  --ol-frame-top-h         顶部高度\n  --ol-frame-mid-img       中间平铺图 url()\n  --ol-frame-bot-img       底部图 url()\n  --ol-frame-bot-h         底部高度\n\n'+
  '=== 可用的元素名 ===\n'+
  '  .ol-hd / .ol-hd-name / .ol-hd-btn   顶部栏\n  .ol-block / .is-user / .is-char       消息块\n  .ol-avatar-area / frame / name        头像\n  .ol-frame-top / mid / bot             三段切图\n  .ol-bubble-inner / text               气泡内容\n  .ol-bubble-text em                    动作\n  .ol-bubble-text strong                旁白\n  .ol-scatter-floor/time/chars/tokens   散布信息\n  .ol-input-wrap / .ol-input            底部栏\n  .ol-btn-plus/robot/send               底部按钮\n  .ol-bg / .ol-tint                     背景/晕染\n\n'+
  '=== 装饰钩子 ===\n'+
  '  .ol-block::before/after             消息背景层\n  .ol-avatar-frame::before/after        头像框贴图\n  .ol-frame-mid::before/after           气泡内填充\n\n'+
  '=== 数据属性 ===\n'+
  '  [data-floor="1"]   第几楼\n  [data-time="14:30"]  时间\n  [data-chars="520"]   字数\n  [data-tokens="260"]  token\n\n'+
  '=== 示例 ===\n'+
  '.ol-root { --ol-bg-color:#f5f5f0; --ol-accent:#8a6b4c; }\n'+
  '.ol-block { --ol-av-size:50px; --ol-av-border:2px solid #ddd; }\n'+
  '.ol-frame-mid::before { content:""; position:absolute; inset:0;\n  background:radial-gradient(circle,rgba(138,107,76,.08),transparent 60%);\n  pointer-events:none; }';

  var ed=document.createElement('div');ed.className='ol-css-editor';
  ed.innerHTML=
    '<div class="ol-css-editor-header">'+
      '<button type="button" id="olCssBack" style="background:none;border:none;color:#7a9ab8;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:4px 8px;">返回</button>'+
      '<span style="font-size:14px;font-weight:700;letter-spacing:1px;color:#e0e0e0;">自定义 CSS</span>'+
      '<button type="button" id="olCssSave" style="background:none;border:none;color:#7a9ab8;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:4px 8px;">保存</button>'+
    '</div>'+
    '<div class="ol-css-ref"><div class="ol-css-ref-title" id="olCssRefT">📋 变量参考表（点击展开）</div><pre class="ol-css-ref-body" id="olCssRefB">'+App.esc(REF)+'</pre></div>'+
    '<textarea class="ol-css-textarea" id="olCssTA" spellcheck="false" placeholder=".ol-root {\n  --ol-bg-color: #1a1a2e;\n  --ol-accent: #c9a96e;\n}">'+App.esc(saved)+'</textarea>';
  document.body.appendChild(ed);
  ed.querySelector('#olCssRefT').addEventListener('click',function(){var b=ed.querySelector('#olCssRefB');b.classList.toggle('show');this.textContent=b.classList.contains('show')?'📋 变量参考表（点击收起）':'📋 变量参考表（点击展开）';});
  ed.querySelector('#olCssBack').addEventListener('click',function(){ed.remove();});
  ed.querySelector('#olCssSave').addEventListener('click',function(){var css=ed.querySelector('#olCssTA').value||'';App.LS.set('olCustomCSS_'+OL.charId,css);OfflineUI.applyCustomCSS(OL.charId);ed.remove();App.showToast('样式已保存');});
  ed.querySelector('#olCssTA').addEventListener('keydown',function(e){if(e.key==='Tab'){e.preventDefault();var ta=this,s=ta.selectionStart,end=ta.selectionEnd;ta.value=ta.value.substring(0,s)+'  '+ta.value.substring(end);ta.selectionStart=ta.selectionEnd=s+2;}});
},

applyCustomCSS:function(charId){
  var old=document.getElementById('olCustomStyle');if(old)old.remove();
  var css=App.LS.get('olCustomCSS_'+charId);if(!css)return;
  var style=document.createElement('style');style.id='olCustomStyle';style.textContent=css;
  document.head.appendChild(style);
},

init:function(){App.offlineUI=OfflineUI;}
};

App.register('offlineUI',OfflineUI);
})();