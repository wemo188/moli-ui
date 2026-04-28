
(function(){
'use strict';
var App=window.App;if(!App)return;

// ★22 蓝色机器人
var ROBOT_SVG='<svg viewBox="0 0 64 64" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="32" y1="14" x2="32" y2="10" stroke="#7a9ab8" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#7a9ab8"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#7a9ab8"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';

var STOP_SVG='<svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';

// ★8 长按菜单图标
var CTX_ICONS={
copy:'<path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><rect x="8" y="2" width="12" height="14" rx="2"/>',
edit:'<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
resend:'<path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>',
regen:'<path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/>',
quote:'<path d="M3 21c3 0 7-1 7-8V5h5v8c0 7-4 8-7 8"/><path d="M14 21c3 0 7-1 7-8V5h-5"/>',
share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
fav:'<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
delafter:'<path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M15 21h4a2 2 0 0 0 2-2v-4"/><line x1="4" y1="20" x2="20" y2="4"/>',
del:'<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>'
};

var ChatUI={

render:function(inner,charData,bgUrl,hasBg,tintOn,avMode){
var c=charData;
// ★16 与首页完全一致的晕染
var tintCSS='background:'+
'radial-gradient(circle at 50% 48%,rgba(126,163,201,.48) 0%,rgba(126,163,201,.28) 18%,rgba(126,163,201,.14) 38%,transparent 62%),'+
'radial-gradient(circle at 46% 44%,rgba(140,180,215,.22) 0%,rgba(140,180,215,.10) 28%,transparent 52%),'+
'radial-gradient(ellipse at 56% 54%,rgba(170,200,228,.18) 0%,transparent 48%);';

var avClass='';
if(avMode==='round')avClass=' av-round';
else if(avMode==='hidden')avClass=' av-hidden';

var rename=App.chat?App.chat.getRename(App.chat.charId):'';
var displayName=rename||c.name||'';

inner.innerHTML=
'<div class="ct-root'+avClass+'" id="ctRoot">'+
'<div class="ct-no-bg'+(hasBg?' has-bg':'')+'" id="ctNoBg"></div>'+
'<div class="ct-bg" id="ctBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');':'')+'"></div>'+
'<div class="ct-tint'+(tintOn?'':' off')+'" id="ctTint" style="'+tintCSS+'"></div>'+
'<div class="ct-glass"></div>'+
'<div class="ct-swipe-hint" id="ctSwipeHint"></div>'+
'<div class="ct-hd">'+
  '<button class="ct-hd-btn" id="ctBack" type="button"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>'+
  '<div class="ct-hd-name" id="ctName">'+App.esc(displayName)+'</div>'+
  '<button class="ct-hd-btn" id="ctMenuBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2" fill="#1a1a1a" stroke="none"/><circle cx="12" cy="12" r="2" fill="#1a1a1a" stroke="none"/><circle cx="18" cy="12" r="2" fill="#1a1a1a" stroke="none"/></svg></button>'+
'</div>'+
'<div class="ct-msgs" id="ctMsgs"></div>'+
'<div class="ct-plus-panel" id="ctPlusPanel">'+
  ChatUI._buildPlusItems()+
'</div>'+
'<div class="ct-input-wrap">'+
  '<button class="ct-voice-btn" id="ctVoiceBtn" type="button"><svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>'+
  '<textarea class="ct-input" id="ctInput" placeholder="输入消息..." rows="1"></textarea>'+
  '<button class="ct-send" id="ctSend" type="button">'+ROBOT_SVG+'</button>'+
  '<button class="ct-plus-btn" id="ctPlusBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>'+
'</div>'+
'</div>';
},

_buildPlusItems:function(){
var items=[
  {id:'piPhoto',icon:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',label:'图片'},
  {id:'piSticker',icon:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',label:'表情包'},
  {id:'piVoiceMsg',icon:'<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>',label:'语音'},
  {id:'piVoiceCall',icon:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',label:'语音通话'},
  {id:'piVideoCall',icon:'<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',label:'视频通话'},
  {id:'piRedPacket',icon:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="10" x2="21" y2="10"/>',label:'红包'},
  {id:'piTransfer',icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',label:'转账'},
  {id:'piLocation',icon:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',label:'位置'}
];
return items.map(function(it){
  return '<div class="ct-plus-item" id="'+it.id+'"><div class="ct-plus-icon"><svg viewBox="0 0 24 24">'+it.icon+'</svg></div><div class="ct-plus-label">'+it.label+'</div></div>';
}).join('');
},

renderMessages:function(){
var Chat=App.chat;if(!Chat)return;
var container=App.$('#ctMsgs');if(!container)return;
var c=Chat.charData,user=App.user?App.user.getActiveUser():null;
var utils=Chat._utils;

if(!Chat.messages.length){
  var greeting=c&&c.greeting?c.greeting:'';
  container.innerHTML=greeting?'<div class="ct-greeting">'+App.esc(greeting)+'</div>':'<div class="ct-empty-text">开始聊天吧</div>';
  return;
}

var html='';
var lastTs=0;

Chat.messages.forEach(function(msg,idx){
  if(msg.role==='system'){html+='<div class="ct-sys">'+App.esc(msg.content)+'</div>';return;}

  var isUser=msg.role==='user';
  var av='';
  if(isUser){av=user&&user.avatar?'<img src="'+App.escAttr(user.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}
  else{av=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}

  // ★5 只在距离上一条消息超过5分钟时显示时间戳（居中独立行）
  var showTime=false;
  if(msg.ts&&(msg.ts-lastTs>300000)){showTime=true;}
  if(msg.ts)lastTs=msg.ts;
  if(showTime&&msg.ts){html+='<div class="ct-time-sep">'+utils.fmtTime(msg.ts)+'</div>';}

  var text=(msg.content||'').trim();
  if(!text)return;

  // ★4 清理多余空行
  text=text.replace(/\n\s*\n/g,'\n').trim();

  var bubbleContent='';
  var isStickerOnly=false;

  // ★23 表情包检测
  var stickerMatch=text.match(/^\[sticker:([^\]]+)\]$/);
  if(stickerMatch){
    isStickerOnly=true;
    var desc=stickerMatch[1];
    var cacheKey='stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30);
    var stickerImgUrl=App.LS.get(cacheKey);
    if(stickerImgUrl){
      bubbleContent='<img class="ct-sticker" src="'+App.escAttr(stickerImgUrl)+'" alt="sticker">';
    } else {
      var stickerId='stk_'+idx;
      bubbleContent='<div class="ct-sticker-loading" id="'+stickerId+'" data-desc="'+App.escAttr(desc)+'" style="width:80px;height:80px;border-radius:8px;background:rgba(200,220,240,.15);display:flex;align-items:center;justify-content:center;font-size:11px;color:#8aa0b8;">生成中...</div>';
    }
  } else {
    // 非纯表情包：检查是否包含sticker标记（不应该发生但兜底）
    var inlineSticker=text.match(/\[sticker:([^\]]+)\]/);
    if(inlineSticker){
      text=text.replace(inlineSticker[0],'').trim();
    }
    if(text)bubbleContent=App.esc(text);
    if(!bubbleContent)return;
  }

  // ★5 消息元信息只显示已读
  var metaHtml='';
  if(isUser){metaHtml='<div class="ct-msg-meta"><span class="ct-msg-read">已读</span></div>';}

  var bubbleClass='ct-bubble'+(isStickerOnly?' sticker-only':'');

  html+='<div class="ct-msg '+(isUser?'user':'ai')+'" data-msg-idx="'+idx+'"><div class="ct-msg-av">'+av+'</div><div class="ct-bubble-wrap"><div class="'+bubbleClass+'">'+bubbleContent+'</div>'+metaHtml+'</div></div>';
});

if(Chat.isStreaming&&!Chat._backgroundMode){
  var sav=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
  html+='<div class="ct-msg ai" id="ctStreamMsg"><div class="ct-msg-av">'+sav+'</div><div class="ct-bubble-wrap"><div class="ct-bubble" id="ctStreamBubble"><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span></div></div></div>';
}

container.innerHTML=html;
Chat.scrollBottom();

// 表情包生成
var cfg2=Chat._utils.getCfg(Chat.charId);
container.querySelectorAll('.ct-sticker-loading').forEach(function(el){
  var desc=el.dataset.desc;if(!desc)return;
  Chat._utils.generateSticker(desc,cfg2,function(url){
    if(url){App.LS.set('stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30),url);el.outerHTML='<img class="ct-sticker" src="'+App.escAttr(url)+'" alt="sticker">';}
    else{el.textContent='['+desc+']';el.style.width='auto';el.style.height='auto';}
  });
});
},

bindEvents:function(){
var Chat=App.chat;if(!Chat)return;

App.safeOn('#ctBack','click',function(){Chat.close();});
App.safeOn('#ctMenuBtn','click',function(e){e.stopPropagation();if(Chat._menuEl){Chat.dismissMenu();return;}ChatUI.showMenu();});

var root=App.$('#ctRoot');
if(root)root.addEventListener('click',function(){Chat.dismissMenu();Chat.dismissCtx();var pp=App.$('#ctPlusPanel');if(pp&&Chat._plusOpen){pp.classList.remove('show');Chat._plusOpen=false;}});

// ★10 滑动返回
var swipeState={active:false,sx:0,sy:0,locked:false,isH:false};
var ctRoot=App.$('#ctRoot');
if(ctRoot){
  ctRoot.addEventListener('touchstart',function(e){
    var t=e.touches[0];
    // 只在左边缘30px内触发
    if(t.clientX>30)return;
    swipeState={active:true,sx:t.clientX,sy:t.clientY,locked:false,isH:false};
  },{passive:true});
  ctRoot.addEventListener('touchmove',function(e){
    if(!swipeState.active)return;
    var t=e.touches[0],dx=t.clientX-swipeState.sx,dy=Math.abs(t.clientY-swipeState.sy);
    if(!swipeState.locked){
      if(Math.abs(dx)>12||dy>12){swipeState.locked=true;swipeState.isH=Math.abs(dx)>dy&&dx>0;}
      return;
    }
    if(!swipeState.isH)return;
    e.preventDefault();
    var hint=App.$('#ctSwipeHint');
    if(hint){hint.classList.toggle('show',dx>40);}
    if(dx>0)ctRoot.style.transform='translateX('+Math.min(dx*0.6,200)+'px)';
  },{passive:false});
  ctRoot.addEventListener('touchend',function(e){
    if(!swipeState.active||!swipeState.isH){swipeState.active=false;return;}
    var t=e.changedTouches[0],dx=t.clientX-swipeState.sx;
    swipeState.active=false;
    var hint=App.$('#ctSwipeHint');if(hint)hint.classList.remove('show');
    if(dx>100){
      ctRoot.style.transition='transform .25s ease';
      ctRoot.style.transform='translateX(100%)';
      setTimeout(function(){Chat.close();},280);
    } else {
      ctRoot.style.transition='transform .2s ease';
      ctRoot.style.transform='';
      setTimeout(function(){ctRoot.style.transition='';},220);
    }
  },{passive:true});
}

var input=App.$('#ctInput');
if(input){
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px';});
  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey&&!('ontouchstart' in window)){e.preventDefault();Chat.send();}
  });
}

App.safeOn('#ctSend','click',function(e){e.stopPropagation();if(Chat.isStreaming){Chat.stopStream();return;}Chat.send();});

App.safeOn('#ctPlusBtn','click',function(e){
  e.stopPropagation();
  var pp=App.$('#ctPlusPanel');if(!pp)return;
  Chat._plusOpen=!Chat._plusOpen;
  if(Chat._plusOpen)pp.classList.add('show');else pp.classList.remove('show');
});

App.safeOn('#ctVoiceBtn','click',function(e){
  e.stopPropagation();
  // ★11 模拟语音消息（使用系统TTS）
  ChatUI._showVoiceInput();
});

// ★11 加号面板功能
['piPhoto','piSticker','piVoiceMsg','piVoiceCall','piVideoCall','piRedPacket','piTransfer','piLocation'].forEach(function(id){
  App.safeOn('#'+id,'click',function(e){
    e.stopPropagation();
    var pp=App.$('#ctPlusPanel');if(pp){pp.classList.remove('show');Chat._plusOpen=false;}

    if(id==='piPhoto'){ChatUI._showImagePicker(function(src){if(!src)return;Chat.messages.push({role:'user',content:'[用户发送了一张图片]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();});return;}
    if(id==='piSticker'){ChatUI._showStickerInput();return;}
    if(id==='piVoiceMsg'){ChatUI._showVoiceInput();return;}
    if(id==='piVoiceCall'){Chat.messages.push({role:'user',content:'[用户发起了语音通话]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();return;}
    if(id==='piVideoCall'){Chat.messages.push({role:'user',content:'[用户发起了视频通话]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();return;}
    if(id==='piRedPacket'){ChatUI._showRedPacket();return;}
    if(id==='piTransfer'){ChatUI._showTransfer();return;}
    if(id==='piLocation'){Chat.messages.push({role:'user',content:'[用户发送了位置]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();return;}
  });
});

// 长按消息
var mc=App.$('#ctMsgs');
if(mc){
  var lt=null,lTarget=null,moved=false;
  mc.addEventListener('touchstart',function(e){
    var b=e.target.closest('.ct-bubble'),m=e.target.closest('.ct-msg');
    if(!b||!m)return;moved=false;
    var t=e.touches[0];lTarget={el:m,x:t.clientX,y:t.clientY};
    lt=setTimeout(function(){if(lTarget&&!moved){if(navigator.vibrate)navigator.vibrate(15);ChatUI.showCtxMenu(lTarget.el,lTarget.x,lTarget.y);}},500);
  },{passive:true});
  mc.addEventListener('touchmove',function(){moved=true;clearTimeout(lt);lTarget=null;},{passive:true});
  mc.addEventListener('touchend',function(){clearTimeout(lt);lTarget=null;},{passive:true});
}
},

// ★11 语音输入
_showVoiceInput:function(){
var Chat=App.chat;
var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;';
overlay.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
  '<div style="font-size:14px;font-weight:700;color:#333;text-align:center;">语音消息</div>'+
  '<textarea id="voiceMsgTA" placeholder="输入语音内容（将以语音气泡形式发送）..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;min-height:80px;resize:vertical;"></textarea>'+
  '<div style="display:flex;gap:8px;">'+
    '<button id="voiceMsgSend" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">发送</button>'+
    '<button id="voiceMsgCancel" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>'+
  '</div>'+
'</div>';
document.body.appendChild(overlay);
overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
overlay.querySelector('#voiceMsgCancel').addEventListener('click',function(){overlay.remove();});
overlay.querySelector('#voiceMsgSend').addEventListener('click',function(){
  var text=overlay.querySelector('#voiceMsgTA').value.trim();if(!text){App.showToast('请输入内容');return;}
  overlay.remove();
  Chat.messages.push({role:'user',content:'[语音消息] '+text,ts:Date.now()});
  Chat.saveMsgs();Chat.renderMessages();

  // 使用系统TTS朗读
  if('speechSynthesis' in window){
    var u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=1;
    speechSynthesis.speak(u);
  }
});
},

// ★11 表情包输入
_showStickerInput:function(){
var Chat=App.chat;
var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;';
overlay.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
  '<div style="font-size:14px;font-weight:700;color:#333;text-align:center;">发送表情包</div>'+
  '<input id="stickerDescInput" type="text" placeholder="描述表情包内容..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
  '<input id="stickerUrlInput" type="text" placeholder="或直接输入表情包URL..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
  '<div style="display:flex;gap:8px;">'+
    '<button id="stickerSend" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">发送</button>'+
    '<button id="stickerCancel" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>'+
  '</div>'+
'</div>';
document.body.appendChild(overlay);
overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
overlay.querySelector('#stickerCancel').addEventListener('click',function(){overlay.remove();});
overlay.querySelector('#stickerSend').addEventListener('click',function(){
  var url=overlay.querySelector('#stickerUrlInput').value.trim();
  var desc=overlay.querySelector('#stickerDescInput').value.trim();
  if(!url&&!desc){App.showToast('请输入描述或URL');return;}
  overlay.remove();
  if(url){
    Chat.messages.push({role:'user',content:'[用户发送了表情包]',ts:Date.now()});
  } else {
    Chat.messages.push({role:'user',content:'[sticker:'+desc+']',ts:Date.now()});
  }
  Chat.saveMsgs();Chat.renderMessages();
});
},

// ★11 红包
_showRedPacket:function(){
var Chat=App.chat;
var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;';
overlay.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
  '<div style="font-size:14px;font-weight:700;color:#c9706b;text-align:center;">发红包</div>'+
  '<input id="rpAmount" type="number" placeholder="金额" style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
  '<input id="rpMsg" type="text" placeholder="说点什么..." value="恭喜发财，大吉大利" style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
  '<div style="display:flex;gap:8px;">'+
    '<button id="rpSend" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#c9706b;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">塞钱进红包</button>'+
    '<button id="rpCancel" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>'+
  '</div>'+
'</div>';
document.body.appendChild(overlay);
overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
overlay.querySelector('#rpCancel').addEventListener('click',function(){overlay.remove();});
overlay.querySelector('#rpSend').addEventListener('click',function(){
  var amount=overlay.querySelector('#rpAmount').value||'?';
  var msg=overlay.querySelector('#rpMsg').value||'恭喜发财';
  overlay.remove();
  Chat.messages.push({role:'user',content:'[用户发了一个红包：'+amount+'元，留言：'+msg+']',ts:Date.now()});
  Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();
});
},

// ★11 转账
_showTransfer:function(){
var Chat=App.chat;
var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;';
overlay.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
  '<div style="font-size:14px;font-weight:700;color:#333;text-align:center;">转账</div>'+
  '<input id="tfAmount" type="number" placeholder="转账金额" style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
  '<input id="tfMsg" type="text" placeholder="转账说明（可选）" style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
  '<div style="display:flex;gap:8px;">'+
    '<button id="tfSend" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">转账</button>'+
    '<button id="tfCancel" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>'+
  '</div>'+
'</div>';
document.body.appendChild(overlay);
overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
overlay.querySelector('#tfCancel').addEventListener('click',function(){overlay.remove();});
overlay.querySelector('#tfSend').addEventListener('click',function(){
  var amount=overlay.querySelector('#tfAmount').value||'?';
  var msg=overlay.querySelector('#tfMsg').value;
  overlay.remove();
  Chat.messages.push({role:'user',content:'[用户转账'+amount+'元'+(msg?'，说明：'+msg:'')+']',ts:Date.now()});
  Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();
});
},

_showImagePicker:function(callback){
var menu=document.createElement('div');
menu.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
menu.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">'+
  '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:4px;">发送图片</div>'+
  '<button data-act="album" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择</button>'+
  '<button data-act="url" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button>'+
  '<button data-act="cancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>'+
'</div>';
document.body.appendChild(menu);
menu.addEventListener('click',function(e){if(e.target===menu){menu.remove();callback(null);}});
menu.querySelectorAll('button').forEach(function(btn){
  btn.addEventListener('click',function(e){
    e.stopPropagation();var act=btn.dataset.act;menu.remove();
    if(act==='cancel'){callback(null);return;}
    if(act==='album'){
      var input=document.createElement('input');input.type='file';input.accept='image/*';
      document.body.appendChild(input);
      input.onchange=function(ev){var file=ev.target.files[0];document.body.removeChild(input);if(!file){callback(null);return;}
      var reader=new FileReader();reader.onload=function(r){
        if(App.cropImage)App.cropImage(r.target.result,function(cropped){callback(cropped);});
        else callback(r.target.result);
      };reader.readAsDataURL(file);};
      input.click();return;
    }
    if(act==='url'){
      // ★13 URL图片也支持裁剪
      var urlPanel=document.createElement('div');
      urlPanel.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
      urlPanel.innerHTML=
      '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
        '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;">输入图片URL</div>'+
        '<input id="piUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
        '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#666;cursor:pointer;"><input type="checkbox" id="piUrlCrop" checked> 裁剪</label>'+
        '<div style="display:flex;gap:8px;">'+
          '<button id="piUrlOk" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">确定</button>'+
          '<button id="piUrlNo" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>'+
        '</div>'+
      '</div>';
      document.body.appendChild(urlPanel);
      urlPanel.addEventListener('click',function(e){if(e.target===urlPanel){urlPanel.remove();callback(null);}});
      urlPanel.querySelector('#piUrlNo').addEventListener('click',function(){urlPanel.remove();callback(null);});
      urlPanel.querySelector('#piUrlOk').addEventListener('click',function(){
        var url=urlPanel.querySelector('#piUrlInput').value.trim();
        var crop=urlPanel.querySelector('#piUrlCrop').checked;
        if(!url){App.showToast('请输入URL');return;}
        urlPanel.remove();
        if(crop&&App.cropImage){App.cropImage(url,function(cropped){callback(cropped);});}
        else{callback(url);}
      });
    }
  });
});
},

updateSendBtn:function(){
var Chat=App.chat;if(!Chat)return;
var btn=App.$('#ctSend');if(!btn)return;
if(Chat.isStreaming){btn.classList.add('stop');btn.innerHTML=STOP_SVG;}
else{btn.classList.remove('stop');btn.innerHTML=ROBOT_SVG;}
},

updateTyping:function(show){
var Chat=App.chat;if(!Chat)return;
var el=App.$('#ctName');if(!el)return;
var c=Chat.charData;
var cfg=Chat._utils.getCfg(Chat.charId);
if(!cfg.showTyping)show=false;
var rename=Chat.getRename(Chat.charId);
var displayName=rename||c.name||'';
if(show)el.innerHTML=App.esc(displayName)+'<div class="ct-hd-typing">对方正在输入...</div>';
else el.textContent=displayName;
},

showMenu:function(){
var Chat=App.chat;if(!Chat)return;
Chat.dismissMenu();
var tintOn=App.LS.get('chatTint_'+Chat.charId);if(tintOn===null)tintOn=true;
var avMode=App.LS.get('chatAvMode_'+Chat.charId)||'square';
var isFS=App.LS.get('wxFullScreen')||false;

var menu=document.createElement('div');menu.className='ct-hd-menu show';
menu.innerHTML=
// ★7 模式切换在顶部菜单
'<div class="ct-hd-mi" data-act="mode"><span>'+(isFS?'手机框模式':'全屏模式')+'</span></div>'+
'<div class="ct-hd-mi" data-act="bg"><span>上传背景图</span></div>'+
'<div class="ct-hd-mi" data-act="tint"><span>晕染</span><div class="ct-sw-track '+(tintOn?'on':'off')+'" id="ctTintSw"></div></div>'+
// ★12 头像切换
'<div class="ct-hd-mi" data-act="avatar"><span>头像：'+(avMode==='square'?'方形':avMode==='round'?'圆形':'隐藏')+'</span></div>'+
'<div class="ct-hd-mi" data-act="scene"><span>场景 / 时间线</span></div>'+
'<div class="ct-hd-mi" data-act="clear"><span>清空记录</span></div>';

var btn=App.$('#ctMenuBtn');
if(btn){var rect=btn.getBoundingClientRect();menu.style.top=(rect.bottom+4)+'px';menu.style.right=(window.innerWidth-rect.right)+'px';}
document.body.appendChild(menu);Chat._menuEl=menu;

menu.addEventListener('click',function(e){e.stopPropagation();});
menu.querySelectorAll('.ct-hd-mi').forEach(function(item){
  item.addEventListener('click',function(e){
    e.stopPropagation();var act=item.dataset.act;
    if(act==='tint'){
      var cur=App.LS.get('chatTint_'+Chat.charId);if(cur===null)cur=true;
      var next=!cur;App.LS.set('chatTint_'+Chat.charId,next);
      var tint=App.$('#ctTint'),sw=App.$('#ctTintSw');
      if(tint){if(next)tint.classList.remove('off');else tint.classList.add('off');}
      if(sw){sw.classList.toggle('on',next);sw.classList.toggle('off',!next);}
      return;
    }
    Chat.dismissMenu();
    if(act==='bg')ChatUI.showBgMenu();
    else if(act==='scene')ChatUI.showSceneDialog();
    else if(act==='clear'){if(!confirm('确定清空所有聊天记录？'))return;Chat.messages=[];Chat.saveMsgs();Chat.renderMessages();App.showToast('已清空');}
    // ★7
    else if(act==='mode'){
      var cur2=App.LS.get('wxFullScreen')||false;
      App.LS.set('wxFullScreen',!cur2);
      Chat.close();
      setTimeout(function(){if(App.wechat){App.wechat.render();setTimeout(function(){Chat.openInWechat(Chat.charId);},100);}},350);
    }
    // ★12
    else if(act==='avatar'){
      var modes=['square','round','hidden'];
      var cur3=App.LS.get('chatAvMode_'+Chat.charId)||'square';
      var idx=(modes.indexOf(cur3)+1)%modes.length;
      App.LS.set('chatAvMode_'+Chat.charId,modes[idx]);
      var root2=App.$('#ctRoot');
      if(root2){root2.classList.remove('av-round','av-hidden');if(modes[idx]==='round')root2.classList.add('av-round');else if(modes[idx]==='hidden')root2.classList.add('av-hidden');}
      var labels={square:'方形',round:'圆形',hidden:'隐藏'};
      App.showToast('头像：'+labels[modes[idx]]);
    }
  });
});
},

// ★8 两行网格布局的长按菜单
showCtxMenu:function(msgEl,x,y){
var Chat=App.chat;if(!Chat)return;
Chat.dismissCtx();
var idx=parseInt(msgEl.dataset.msgIdx);if(isNaN(idx))return;
var msg=Chat.messages[idx];if(!msg)return;
var isUser=msg.role==='user';

var menu=document.createElement('div');menu.className='ct-ctx';
var items=[];
items.push({act:'copy',label:'复制',icon:CTX_ICONS.copy});
items.push({act:'edit',label:'编辑',icon:CTX_ICONS.edit});
if(isUser)items.push({act:'resend',label:'重发',icon:CTX_ICONS.resend});
else items.push({act:'regen',label:'重新生成',icon:CTX_ICONS.regen});
items.push({act:'quote',label:'引用',icon:CTX_ICONS.quote});
items.push({act:'share',label:'转发',icon:CTX_ICONS.share});
items.push({act:'fav',label:'收藏',icon:CTX_ICONS.fav});
items.push({act:'delafter',label:'往后全删',icon:CTX_ICONS.delafter});
items.push({act:'del',label:'删除',icon:CTX_ICONS.del});

var gridHtml='<div class="ct-ctx-grid">';
items.forEach(function(it){
  gridHtml+='<div class="ct-ctx-item" data-act="'+it.act+'"><div class="ct-ctx-icon"><svg viewBox="0 0 24 24">'+it.icon+'</svg></div><div class="ct-ctx-label">'+it.label+'</div></div>';
});
gridHtml+='</div>';
menu.innerHTML=gridHtml;

var left=Math.min(x-100,window.innerWidth-220);if(left<8)left=8;
var top=y-10;if(top+180>window.innerHeight-10)top=y-180;if(top<60)top=60;
menu.style.left=left+'px';menu.style.top=top+'px';
document.body.appendChild(menu);Chat._ctxMenu=menu;

// 点击外部关闭
setTimeout(function(){
  function dismiss(e){if(menu.parentNode&&!menu.contains(e.target)){menu.remove();Chat._ctxMenu=null;document.removeEventListener('touchstart',dismiss);document.removeEventListener('click',dismiss);}};
  document.addEventListener('touchstart',dismiss,{passive:true});
  document.addEventListener('click',dismiss);
},50);

menu.querySelectorAll('.ct-ctx-item').forEach(function(item){
  item.addEventListener('click',function(e){
    e.stopPropagation();var act=item.dataset.act;Chat.dismissCtx();
    if(act==='copy')Chat.copyMsg(idx);
    else if(act==='del')Chat.deleteMsg(idx);
    else if(act==='delafter')Chat.deleteFromHere(idx);
    else if(act==='edit')Chat.editMsg(idx);
    else if(act==='resend')Chat.resendMsg(idx);
    else if(act==='regen')Chat.regenerate(idx);
    else if(act==='share')Chat.shareMsg(idx);
    else if(act==='quote'){
      var input=App.$('#ctInput');
      if(input){
        var quoteText='「'+msg.content.slice(0,50)+(msg.content.length>50?'...':'')+'」\n';
        input.value=quoteText;input.focus();
        input.style.height='auto';input.style.height=Math.min(input.scrollHeight,100)+'px';
      }
    }
    else if(act==='fav'){
      var favs=App.LS.get('chatFavorites')||[];
      favs.push({content:msg.content,ts:msg.ts,charName:Chat.charData?Chat.charData.name:'',charId:Chat.charId,savedAt:Date.now()});
      App.LS.set('chatFavorites',favs);
      App.showToast('已收藏');
    }
  });
});
},

showEditDialog:function(idx){
var Chat=App.chat;if(!Chat)return;
var msg=Chat.messages[idx];if(!msg)return;
var isUser=msg.role==='user';
var overlay=document.createElement('div');overlay.className='ct-edit-overlay';
overlay.innerHTML=
'<div class="ct-edit-panel">'+
  '<div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;margin-bottom:12px;">编辑消息</div>'+
  '<textarea class="ct-edit-ta" id="ctEditTA">'+App.esc(msg.content)+'</textarea>'+
  '<div class="ct-edit-btns">'+
    '<button class="ct-edit-btn" id="ctEditSave" type="button" style="background:#1a1a1a;color:#fff;">保存</button>'+
    (isUser?'<button class="ct-edit-btn" id="ctEditSendNew" type="button" style="background:#7a9ab8;color:#fff;">保存并重发</button>':'')+
    '<button class="ct-edit-btn" id="ctEditCancel" type="button" style="background:#f5f5f5;color:#666;border:1px solid #ddd;">取消</button>'+
  '</div>'+
'</div>';
document.body.appendChild(overlay);
overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
overlay.querySelector('#ctEditCancel').addEventListener('click',function(){overlay.remove();});
overlay.querySelector('#ctEditSave').addEventListener('click',function(){
  var val=overlay.querySelector('#ctEditTA').value.trim();if(!val){App.showToast('内容不能为空');return;}
  Chat.messages[idx].content=val;Chat.saveMsgs();Chat.renderMessages();overlay.remove();
});
var sendNew=overlay.querySelector('#ctEditSendNew');
if(sendNew){sendNew.addEventListener('click',function(){
  var val=overlay.querySelector('#ctEditTA').value.trim();if(!val){App.showToast('内容不能为空');return;}
  overlay.remove();Chat.messages.splice(idx);
  Chat.messages.push({role:'user',content:val,ts:Date.now()});
  Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();
});}
},

showSceneDialog:function(){
var Chat=App.chat;if(!Chat)return;
var current=App.LS.get('chatScene_'+Chat.charId)||'';
var overlay=document.createElement('div');overlay.className='ct-scene-overlay';
overlay.innerHTML=
'<div class="ct-scene-panel">'+
  '<div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;margin-bottom:12px;">当前场景 / 时间线</div>'+
  '<div style="font-size:11px;color:#8aa0b8;margin-bottom:10px;line-height:1.5;">描述当前的时间、地点、剧情背景等。每次发送消息时自动附带给AI。留空则不启用。</div>'+
  '<textarea class="ct-scene-ta" id="ctSceneTA" placeholder="例如：现在是深夜两点，你刚下班回家...">'+App.esc(current)+'</textarea>'+
  '<div class="ct-edit-btns">'+
    '<button class="ct-edit-btn" id="ctSceneSave" type="button" style="background:#1a1a1a;color:#fff;">保存</button>'+
    '<button class="ct-edit-btn" id="ctSceneClear" type="button" style="background:#f5f5f5;color:#999;border:1px solid #ddd;">清空</button>'+
    '<button class="ct-edit-btn" id="ctSceneCancel" type="button" style="background:#f5f5f5;color:#666;border:1px solid #ddd;">取消</button>'+
  '</div>'+
'</div>';
document.body.appendChild(overlay);
overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
overlay.querySelector('#ctSceneCancel').addEventListener('click',function(){overlay.remove();});
overlay.querySelector('#ctSceneClear').addEventListener('click',function(){App.LS.remove('chatScene_'+Chat.charId);overlay.remove();App.showToast('已清空场景');});
overlay.querySelector('#ctSceneSave').addEventListener('click',function(){var val=overlay.querySelector('#ctSceneTA').value.trim();if(val)App.LS.set('chatScene_'+Chat.charId,val);else App.LS.remove('chatScene_'+Chat.charId);overlay.remove();App.showToast('场景已保存');});
},

showBgMenu:function(){
var Chat=App.chat;if(!Chat)return;
var menu=document.createElement('div');
menu.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
menu.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">'+
  '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:4px;">聊天背景</div>'+
  '<button class="ctbg-btn" data-act="album" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择</button>'+
  '<button class="ctbg-btn" data-act="url" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button>'+
  '<button class="ctbg-btn" data-act="del" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:12px;font-weight:500;color:#bbb;cursor:pointer;font-family:inherit;">移除背景</button>'+
  '<button class="ctbg-btn" data-act="cancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>'+
'</div>';
document.body.appendChild(menu);
menu.addEventListener('click',function(e){if(e.target===menu)menu.remove();});
menu.querySelectorAll('.ctbg-btn').forEach(function(btn){
  btn.addEventListener('click',function(e){
    e.stopPropagation();var act=btn.dataset.act;menu.remove();
    if(act==='cancel')return;
    if(act==='del'){
      App.LS.remove('chatBg_'+Chat.charId);
      var bg=App.$('#ctBg');if(bg)bg.style.backgroundImage='';
      var nb=App.$('#ctNoBg');if(nb)nb.classList.remove('has-bg');
      App.showToast('已移除');return;
    }
    if(act==='album'){
      var input=document.createElement('input');input.type='file';input.accept='image/*';
      document.body.appendChild(input);
      input.onchange=function(ev){var file=ev.target.files[0];document.body.removeChild(input);if(!file)return;
      var reader=new FileReader();reader.onload=function(r){
        if(App.cropImage){App.cropImage(r.target.result,function(cropped){Chat._utils.compressImage(cropped,Chat._utils.MAX_BG_SIZE,Chat._utils.BG_QUALITY,function(c2){Chat.setChatBg(c2);});});}
        else{Chat._utils.compressImage(r.target.result,Chat._utils.MAX_BG_SIZE,Chat._utils.BG_QUALITY,function(c2){Chat.setChatBg(c2);});}
      };reader.readAsDataURL(file);};
      input.click();return;
    }
    if(act==='url'){
      var urlPanel=document.createElement('div');
      urlPanel.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
      urlPanel.innerHTML=
      '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
        '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;">输入背景图URL</div>'+
        '<input id="ctBgUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
        '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#666;cursor:pointer;"><input type="checkbox" id="ctBgUrlCrop" checked> 裁剪</label>'+
        '<div style="display:flex;gap:8px;">'+
          '<button id="ctBgUrlOk" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">确定</button>'+
          '<button id="ctBgUrlNo" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>'+
        '</div>'+
      '</div>';
      document.body.appendChild(urlPanel);
      urlPanel.addEventListener('click',function(e){if(e.target===urlPanel)urlPanel.remove();});
      urlPanel.querySelector('#ctBgUrlNo').addEventListener('click',function(){urlPanel.remove();});
      urlPanel.querySelector('#ctBgUrlOk').addEventListener('click',function(){
        var url=urlPanel.querySelector('#ctBgUrlInput').value.trim();
        var crop=urlPanel.querySelector('#ctBgUrlCrop').checked;
        if(!url){App.showToast('请输入URL');return;}
        urlPanel.remove();
        if(crop&&App.cropImage){App.cropImage(url,function(cropped){Chat.setChatBg(cropped);});}
        else{Chat.setChatBg(url);}
      });
    }
  });
});
},

init:function(){App.chatUI=ChatUI;}
};

App.register('chatUI',ChatUI);
})();
