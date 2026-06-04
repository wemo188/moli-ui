(function(){
'use strict';
var App=window.App;if(!App)return;

var ROBOT_SVG='<svg viewBox="0 0 24 24" width="20" height="20"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
var STOP_SVG='<svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';

var CTX_ICONS={
copy:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
edit:'<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
resend:'<svg viewBox="0 0 24 24"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
regen:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg>',
quote:'<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="2.4"/><path d="M18 36C18 30.5 20.5 25 25.5 22.5L27 25C23 27.5 22 30 22 33H26V39H18V36Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M34 36C34 30.5 36.5 25 41.5 22.5L43 25C39 27.5 38 30 38 33H42V39H34V36Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
share:'<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
fav:'<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
del:'<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
delafter:'<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>'
};

/* ===== 工具：创建通用弹窗 ===== */
function makeOverlay(clickClose){
  var o=document.createElement('div');o.className='ct-overlay';
  if(clickClose)o.addEventListener('click',function(e){if(e.target===o)o.remove();});
  return o;
}
function makeDialog(cls){
  var d=document.createElement('div');d.className='ct-dialog'+(cls?' '+cls:'');
  return d;
}

/* ===== 工具：URL输入弹窗 ===== */
function showUrlInput(title,callback){
  var o=makeOverlay(true);
  var d=makeDialog('wide');
  d.innerHTML='<div class="ct-dialog-title">'+App.esc(title)+'</div>'+
    '<input class="ct-dialog-input" id="uiUrlInput" type="text" placeholder="https://...">'+
    '<div class="ct-dialog-preview" id="uiUrlPrev"><img></div>'+
    '<div class="ct-dialog-btn-row">'+
      '<button class="ct-dialog-btn primary" id="uiUrlOk" type="button">确定</button>'+
      '<button class="ct-dialog-btn" id="uiUrlNo" type="button">取消</button>'+
    '</div>';
  o.appendChild(d);document.body.appendChild(o);

  o.querySelector('#uiUrlNo').addEventListener('click',function(){o.remove();callback(null);});
  var pBox=o.querySelector('#uiUrlPrev'),pImg=pBox.querySelector('img');
  o.querySelector('#uiUrlInput').addEventListener('input',function(){
    var v=this.value.trim();
    if(v&&v.startsWith('http')){pImg.src=v;pBox.classList.add('show');pImg.onerror=function(){pBox.classList.remove('show');};}
    else pBox.classList.remove('show');
  });
  o.querySelector('#uiUrlOk').addEventListener('click',function(){
    var url=o.querySelector('#uiUrlInput').value.trim();
    if(!url){App.showToast('请输入URL');return;}
    o.remove();callback(url);
  });
}

/* ===== 工具：图片来源选择 ===== */
function showImageSourceMenu(title,callback){
  var o=makeOverlay(true);
  var d=makeDialog();
  d.innerHTML='<div class="ct-dialog-title">'+App.esc(title)+'</div>'+
    '<button class="ct-dialog-btn" data-act="album" type="button">从相册选择</button>'+
    '<button class="ct-dialog-btn" data-act="url" type="button">输入图片URL</button>'+
    '<button class="ct-dialog-btn ghost" data-act="cancel" type="button">取消</button>';
  o.appendChild(d);document.body.appendChild(o);
  d.querySelectorAll('.ct-dialog-btn').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();var act=btn.dataset.act;o.remove();
      if(act==='cancel'){callback(null);return;}
      if(act==='album'){
        var input=document.createElement('input');input.type='file';input.accept='image/*';
        document.body.appendChild(input);
        input.onchange=function(ev){
          var file=ev.target.files[0];document.body.removeChild(input);
          if(!file){callback(null);return;}
          var reader=new FileReader();
          reader.onload=function(r){
            if(App.cropImage)App.cropImage(r.target.result,function(c){callback(c);});
            else callback(r.target.result);
          };
          reader.readAsDataURL(file);
        };
        input.click();return;
      }
      if(act==='url')showUrlInput('输入图片URL',callback);
    });
  });
}

var ChatUI={

render:function(inner,charData,bgUrl,hasBg,tintOn){
var c=charData;
var displayName=(App.wechat?App.wechat.getCharAlias(c.id):'')||c.name||'';
inner.innerHTML=
'<div class="ct-root" id="ctRoot">'+
'<div class="ct-no-bg'+(hasBg?' has-bg':'')+'" id="ctNoBg"></div>'+
'<div class="ct-bg" id="ctBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');':'')+'"></div>'+
'<div class="ct-hd">'+
  '<button class="ct-hd-btn" id="ctBack" type="button"><svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke-width:3;"><path d="M15 18l-6-6 6-6"/></svg></button>'+
  '<div class="ct-hd-name" id="ctName">'+App.esc(displayName)+'</div>'+
  '<button class="ct-hd-btn" id="ctMenuBtn" type="button"><svg viewBox="0 0 64 64" fill="none" style="width:30px;height:30px;"><path d="M42 14L45 22L53 23L47 28L49 36L42 32L35 36L37 28L31 23L39 22Z" stroke="#2a2a2a" stroke-width="2.2" stroke-linejoin="round"/><path d="M34 28Q24 34 16 46" stroke="#2a2a2a" stroke-width="2.2" stroke-linecap="round"/><path d="M22 22L16 26" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/><path d="M44 38L38 44" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/></svg></button>'+
'</div>'+
'<div class="ct-msgs" id="ctMsgs"></div>'+
'<div class="ct-plus-panel" id="ctPlusPanel">'+ChatUI._buildPlusItems()+'</div>'+
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
  {id:'piLocation',icon:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',label:'位置'},
  {id:'piCoupon',icon:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14" r="1.5"/>',label:'卡券'}
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
var avShape=App.LS.get('chatAvShape_'+Chat.charId)||'square';
var avHide=App.LS.get('chatAvHide_'+Chat.charId)||false;
var avClass=avShape==='round'?' round':'';
if(avHide)avClass+=' hide-av';

if(!Chat.messages.length){
  var greeting=c&&c.greeting?c.greeting:'';
  container.innerHTML=greeting?'<div class="ct-greeting">'+App.esc(greeting)+'</div>':'<div class="ct-empty-text">开始聊天吧</div>';
  return;
}

var html='';var floor=0;

Chat.messages.forEach(function(msg,idx){
  if(msg.role==='system'){html+='<div class="ct-sys">'+App.esc(msg.content)+'</div>';return;}
  floor++;
  var isUser=msg.role==='user';
  var av='';
  if(isUser){av=user&&user.avatar?'<img src="'+App.escAttr(user.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}
  else{av=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}

  var timeStr=msg.ts?utils.fmtTime(msg.ts):'';
  var text=(msg.content||'').replace(/\n{2,}/g,'\n').trim();
  if(!text)return;

  var showTimeSep=false;
  if(msg.ts){var prevMsg=null;for(var pi=idx-1;pi>=0;pi--){if(Chat.messages[pi].role!=='system'){prevMsg=Chat.messages[pi];break;}}if(!prevMsg||!prevMsg.ts||msg.ts-prevMsg.ts>300000)showTimeSep=true;}
  if(showTimeSep&&timeStr)html+='<div class="ct-time-sep">'+timeStr+'</div>';

  var bubbleContent='';
  var stickerMatch=text.match(/\[sticker:([^\]]+)\]/);
  if(stickerMatch){
    var desc=stickerMatch[1];text=text.replace(stickerMatch[0],'').trim();
    var cacheKey='stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30);
    var stickerImgUrl=App.LS.get(cacheKey);
    if(stickerImgUrl)bubbleContent+='<img class="ct-sticker" src="'+App.escAttr(stickerImgUrl)+'" alt="sticker">';
    else bubbleContent+='<div class="ct-sticker-loading" id="stk_'+idx+'" data-desc="'+App.escAttr(desc)+'">生成中...</div>';
  }
  if(text)bubbleContent+=App.esc(text);
  if(!bubbleContent)return;

  html+='<div class="ct-msg '+(isUser?'user':'ai')+'" data-msg-idx="'+idx+'"><div class="ct-msg-av'+avClass+'">'+av+'</div><div class="ct-bubble-wrap"><div class="ct-bubble">'+bubbleContent+'</div><div class="ct-msg-meta"><span class="ct-msg-floor">#'+floor+'</span><span class="ct-msg-time">'+timeStr+'</span></div></div></div>';
});

if(Chat.isStreaming&&!Chat._backgroundMode){
  var sav=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
  html+='<div class="ct-msg ai" id="ctStreamMsg"><div class="ct-msg-av'+avClass+'">'+sav+'</div><div class="ct-bubble-wrap"><div class="ct-bubble" id="ctStreamBubble"><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span></div></div></div>';
}

container.innerHTML=html;
Chat.scrollBottom();

var cfg2=Chat._utils.getCfg(Chat.charId);
container.querySelectorAll('.ct-sticker-loading').forEach(function(el){
  var desc=el.dataset.desc;if(!desc)return;
  Chat._utils.generateSticker(desc,cfg2,function(url){
    if(url){App.LS.set('stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30),url);el.outerHTML='<img class="ct-sticker" src="'+App.escAttr(url)+'" alt="sticker">';}
    else{el.textContent='['+desc+']';}
  });
});
},

bindEvents:function(){
var Chat=App.chat;if(!Chat)return;

// 左滑返回
var root=App.$('#ctRoot');
var _swipe={active:false,sx:0,sy:0,locked:false,dir:''};
if(root){
  root.addEventListener('touchstart',function(e){var t=e.touches[0];var rect=root.getBoundingClientRect();if(t.clientX-rect.left>60)return;_swipe={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
  root.addEventListener('touchmove',function(e){if(!_swipe.active)return;var t=e.touches[0];var dx=t.clientX-_swipe.sx,dy=t.clientY-_swipe.sy;if(!_swipe.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_swipe.locked=true;_swipe.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_swipe.dir==='h'&&dx>0){e.preventDefault();var w=root.offsetWidth||window.innerWidth;root.style.transform='translateX('+Math.min(dx,w)+'px)';root.style.opacity=String(1-dx/w*0.5);}},{passive:false});
  root.addEventListener('touchend',function(e){if(!_swipe.active)return;_swipe.active=false;if(_swipe.dir!=='h'){root.style.transform='';root.style.opacity='';return;}var t=e.changedTouches[0];var dx=t.clientX-_swipe.sx;var w=root.offsetWidth||window.innerWidth;if(dx>w*0.3){root.style.transition='transform .25s ease, opacity .25s ease';root.style.transform='translateX(100%)';root.style.opacity='0';setTimeout(function(){root.style.transition='';root.style.transform='';root.style.opacity='';Chat.close();},260);}else{root.style.transition='transform .2s ease, opacity .2s ease';root.style.transform='';root.style.opacity='';setTimeout(function(){root.style.transition='';},220);}},{passive:true});
  root.addEventListener('click',function(){Chat.dismissMenu();Chat.dismissCtx();Chat.dismissAvCard();var pp=App.$('#ctPlusPanel');if(pp&&Chat._plusOpen){pp.classList.remove('show');Chat._plusOpen=false;}});
}

App.safeOn('#ctBack','click',function(){Chat.close();});
App.safeOn('#ctMenuBtn','click',function(e){e.stopPropagation();if(Chat._menuEl){Chat.dismissMenu();return;}ChatUI.showMenu();});

var input=App.$('#ctInput');
if(input){
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px';});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!('ontouchstart' in window)){e.preventDefault();Chat.send();}});
}

App.safeOn('#ctSend','click',function(e){
  e.stopPropagation();
  if(Chat.isStreaming){Chat.stopStream();return;}
  var inp=App.$('#ctInput');var text=inp?inp.value.trim():'';
  if(text){Chat.send();return;}
  if(Chat.charId&&!Chat.isStreaming){Chat.isStreaming=true;Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(true);Chat.requestProactive();}
});

App.safeOn('#ctPlusBtn','click',function(e){e.stopPropagation();var pp=App.$('#ctPlusPanel');if(!pp)return;Chat._plusOpen=!Chat._plusOpen;if(Chat._plusOpen)pp.classList.add('show');else pp.classList.remove('show');});

// 语音按钮
App.safeOn('#ctVoiceBtn','click',function(e){e.stopPropagation();ChatUI._doVoice();});

// 加号面板项
['piPhoto','piSticker','piVoiceMsg','piVoiceCall','piVideoCall','piRedPacket','piTransfer','piLocation','piCoupon'].forEach(function(id){
  App.safeOn('#'+id,'click',function(e){
    e.stopPropagation();
    var pp=App.$('#ctPlusPanel');if(pp){pp.classList.remove('show');Chat._plusOpen=false;}
    ChatUI._handlePlusAction(id);
  });
});

// 长按菜单
var mc=App.$('#ctMsgs');
if(mc){
  var lt=null,lTarget=null,moved=false;
  mc.addEventListener('touchstart',function(e){var b=e.target.closest('.ct-bubble'),m=e.target.closest('.ct-msg');if(!b||!m)return;moved=false;var t=e.touches[0];lTarget={el:m,x:t.clientX,y:t.clientY};lt=setTimeout(function(){if(lTarget&&!moved){if(navigator.vibrate)navigator.vibrate(15);ChatUI.showCtxMenu(lTarget.el,lTarget.x,lTarget.y);}},500);},{passive:true});
  mc.addEventListener('touchmove',function(){moved=true;clearTimeout(lt);lTarget=null;},{passive:true});
  mc.addEventListener('touchend',function(){clearTimeout(lt);lTarget=null;},{passive:true});
}
},

_doVoice:function(){
  if(!('webkitSpeechRecognition' in window||'SpeechRecognition' in window)){App.showToast('浏览器不支持语音输入');return;}
  var Chat=App.chat;var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  var rec=new SR();rec.lang='zh-CN';rec.continuous=false;rec.interimResults=false;
  App.showToast('请说话...');
  rec.onresult=function(ev){var text=ev.results[0][0].transcript;if(!text){App.showToast('没有识别到语音');return;}Chat.messages.push({role:'user',content:'[用户发了一条语音消息，内容是："'+text+'"]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();setTimeout(function(){Chat.requestAI();},2000);};
  rec.onerror=function(ev){App.showToast('语音识别失败：'+ev.error);};
  rec.start();
},

_handlePlusAction:function(id){
  var Chat=App.chat;if(!Chat)return;
  if(id==='piPhoto'){showImageSourceMenu('发送图片',function(src){if(!src)return;Chat.messages.push({role:'user',content:'[用户发送了一张图片]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();});return;}
  if(id==='piSticker'){ChatUI._showStickerPicker();return;}
  if(id==='piVoiceMsg'){ChatUI._doVoice();return;}
  if(id==='piVoiceCall'){Chat.messages.push({role:'user',content:'[用户发起了语音通话]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();setTimeout(function(){Chat.requestAI();},1500);return;}
  if(id==='piVideoCall'){Chat.messages.push({role:'user',content:'[用户发起了视频通话]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();setTimeout(function(){Chat.requestAI();},1500);return;}
  if(id==='piRedPacket'){var amount=prompt('红包金额（元）：');if(!amount)return;var note=prompt('红包留言（可选）：')||'恭喜发财';Chat.messages.push({role:'user',content:'[用户发了一个'+amount+'元的红包: '+note+']',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();setTimeout(function(){Chat.requestAI();},2000);return;}
  if(id==='piTransfer'){var ta=prompt('转账金额（元）：');if(!ta)return;var tn=prompt('转账备注（可选）：')||'转账';Chat.messages.push({role:'user',content:'[用户转账了'+ta+'元: '+tn+']',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();setTimeout(function(){Chat.requestAI();},2000);return;}
  if(id==='piLocation'){ChatUI._showLocationMenu();return;}
  if(id==='piCoupon'){App.showToast('卡券 · 开发中');return;}
},

_showStickerPicker:function(){
  var Chat=App.chat;if(!Chat)return;
  var favs=App.LS.get('chatFavorites')||[];
  var stkFavs=favs.filter(function(f){return f.content&&f.content.indexOf('[sticker:')>=0;});
  var o=makeOverlay(true);var d=makeDialog('xl');
  var stkHtml='';
  if(stkFavs.length){
    stkHtml+='<div class="ct-stk-label">收藏的表情包</div><div class="ct-stk-grid">';
    stkFavs.forEach(function(f){var m=f.content.match(/\[sticker:([^\]]+)\]/);if(!m)return;var desc=m[1];var ck='stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30);var url=App.LS.get(ck);if(url)stkHtml+='<img src="'+App.escAttr(url)+'" data-desc="'+App.escAttr(desc)+'" class="stk-pick">';});
    stkHtml+='</div>';
  }
  d.innerHTML='<div class="ct-dialog-title">发送表情包</div>'+stkHtml+
    '<button class="ct-dialog-btn" data-act="album" type="button">从相册选择图片</button>'+
    '<button class="ct-dialog-btn" data-act="url" type="button">输入图片URL</button>'+
    '<button class="ct-dialog-btn ghost" data-act="cancel" type="button">取消</button>';
  o.appendChild(d);document.body.appendChild(o);
  d.querySelectorAll('.stk-pick').forEach(function(img){img.addEventListener('click',function(e){e.stopPropagation();o.remove();Chat.messages.push({role:'user',content:'[用户发送了表情包]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();});});
  d.querySelectorAll('.ct-dialog-btn').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();var act=btn.dataset.act;o.remove();if(act==='cancel')return;if(act==='album'){showImageSourceMenu('选择表情包',function(){Chat.messages.push({role:'user',content:'[用户发送了表情包]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();});return;}if(act==='url'){showUrlInput('输入表情包URL',function(url){if(!url)return;Chat.messages.push({role:'user',content:'[用户发送了表情包]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();});}});});
},

_showLocationMenu:function(){
  var Chat=App.chat;if(!Chat)return;
  var o=makeOverlay(true);var d=makeDialog();
  d.innerHTML='<div class="ct-dialog-title">分享位置</div>'+
    '<button class="ct-dialog-btn" data-act="real" type="button">发送真实位置</button>'+
    '<button class="ct-dialog-btn" data-act="virtual" type="button">输入虚拟位置</button>'+
    '<button class="ct-dialog-btn ghost" data-act="cancel" type="button">取消</button>';
  o.appendChild(d);document.body.appendChild(o);
  d.querySelectorAll('.ct-dialog-btn').forEach(function(btn){
    btn.addEventListener('click',function(e){e.stopPropagation();var act=btn.dataset.act;o.remove();
      if(act==='cancel')return;
      if(act==='real'){if("geolocation" in navigator){App.showToast('获取位置中...');navigator.geolocation.getCurrentPosition(function(pos){Chat.messages.push({role:'user',content:'[用户分享了位置: '+pos.coords.latitude.toFixed(4)+'°N '+pos.coords.longitude.toFixed(4)+'°E]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();setTimeout(function(){Chat.requestAI();},2000);},function(){App.showToast('无法获取位置');Chat.messages.push({role:'user',content:'[用户分享了位置]',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();setTimeout(function(){Chat.requestAI();},2000);});}else{App.showToast('浏览器不支持定位');}return;}
      if(act==='virtual'){var place=prompt('输入虚拟位置：');if(!place)return;Chat.messages.push({role:'user',content:'[用户分享了位置: '+place+']',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();setTimeout(function(){Chat.requestAI();},2000);}
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
  var displayName=(App.wechat?App.wechat.getCharAlias(c.id):'')||c.name||'';
  var cfg=Chat._utils.getCfg(Chat.charId);
  if(!cfg.showTyping)show=false;
  if(show)el.innerHTML=App.esc(displayName)+'<div class="ct-hd-typing">对方正在输入...</div>';
  else el.textContent=displayName;
},

/* ===== 顶部菜单 ===== */
showMenu:function(){
  var Chat=App.chat;if(!Chat)return;
  Chat.dismissMenu();
  var menu=document.createElement('div');menu.className='ct-hd-menu show';
  menu.innerHTML=
    '<div class="ct-hd-mi" data-act="avatar"><span>头像设置</span></div>'+
    '<div class="ct-hd-mi" data-act="bg"><span>背景图</span></div>'+
    '<div class="ct-hd-mi" data-act="palette"><span>调色板</span></div>'+
    '<div class="ct-hd-mi" data-act="scene"><span>场景 / 时间线</span></div>'+
    '<div class="ct-hd-mi" data-act="multiDel"><span>多选删除</span></div>';
  var btn=App.$('#ctMenuBtn');
  if(btn){var rect=btn.getBoundingClientRect();menu.style.top=(rect.bottom+4)+'px';menu.style.right=(window.innerWidth-rect.right)+'px';}
  document.body.appendChild(menu);Chat._menuEl=menu;
  menu.addEventListener('click',function(e){e.stopPropagation();});
  menu.querySelectorAll('.ct-hd-mi').forEach(function(item){
    item.addEventListener('click',function(e){
      e.stopPropagation();var act=item.dataset.act;Chat.dismissMenu();
      if(act==='avatar')ChatUI.showAvCard();
      else if(act==='palette')ChatUI.showPalette();
      else if(act==='bg')ChatUI.showBgMenu();
      else if(act==='scene')ChatUI.showSceneDialog();
      else if(act==='multiDel')ChatUI.enterMultiSelect();
    });
  });
},

/* ===== 多选模式 ===== */
enterMultiSelect:function(){
  var Chat=App.chat;if(!Chat)return;
  Chat._multiMode=true;Chat._multiSelected=[];
  var mc=App.$('#ctMsgs');if(!mc)return;
  mc.classList.add('ct-multi-mode');
  mc.querySelectorAll('.ct-msg[data-msg-idx]').forEach(function(el){var c=document.createElement('div');c.className='ct-swipe-check';el.appendChild(c);});
  var iw=App.$('.ct-input-wrap');if(iw)iw.style.display='none';
  var pp=App.$('#ctPlusPanel');if(pp)pp.classList.remove('show');
  var old=App.$('#ctMultiBar');if(old)old.remove();
  var bar=document.createElement('div');bar.id='ctMultiBar';bar.className='ct-multi-bar';
  bar.innerHTML='<span class="ct-multi-bar-count" id="ctMultiCount">已选 0 条</span><div class="ct-multi-bar-btns"><button class="ct-multi-bar-btn del" id="ctMultiDel" type="button">删除</button><button class="ct-multi-bar-btn cancel" id="ctMultiCancel" type="button">取消</button></div>';
  var root=App.$('#ctRoot');if(root)root.appendChild(bar);

  var _ms={active:false,lastIdx:-1};
  function toggle(el){var idx=parseInt(el.dataset.msgIdx);if(isNaN(idx))return;var si=Chat._multiSelected.indexOf(idx);if(si>=0){Chat._multiSelected.splice(si,1);el.classList.remove('ct-selected');}else{Chat._multiSelected.push(idx);el.classList.add('ct-selected');}var c=App.$('#ctMultiCount');if(c)c.textContent='已选 '+Chat._multiSelected.length+' 条';}
  function atPoint(x,y){var els=mc.querySelectorAll('.ct-msg[data-msg-idx]');for(var i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();if(y>=r.top&&y<=r.bottom)return els[i];}return null;}

  mc._mts=function(e){var m=e.target.closest('.ct-msg[data-msg-idx]');if(!m)return;_ms.active=true;_ms.lastIdx=parseInt(m.dataset.msgIdx);toggle(m);};
  mc._mtm=function(e){if(!_ms.active)return;e.preventDefault();var t=e.touches[0];var m=atPoint(t.clientX,t.clientY);if(!m)return;var idx=parseInt(m.dataset.msgIdx);if(idx===_ms.lastIdx)return;_ms.lastIdx=idx;if(Chat._multiSelected.indexOf(idx)<0){Chat._multiSelected.push(idx);m.classList.add('ct-selected');var c=App.$('#ctMultiCount');if(c)c.textContent='已选 '+Chat._multiSelected.length+' 条';}};
  mc._mte=function(){_ms.active=false;_ms.lastIdx=-1;};
  mc.addEventListener('touchstart',mc._mts,{passive:true});
  mc.addEventListener('touchmove',mc._mtm,{passive:false});
  mc.addEventListener('touchend',mc._mte,{passive:true});

  bar.querySelector('#ctMultiDel').addEventListener('click',function(){if(!Chat._multiSelected.length){App.showToast('请先选择消息');return;}if(!confirm('删除选中的 '+Chat._multiSelected.length+' 条消息？'))return;Chat._multiSelected.sort(function(a,b){return b-a;});Chat._multiSelected.forEach(function(i){Chat.messages.splice(i,1);});Chat.saveMsgs();ChatUI.exitMultiSelect();Chat.renderMessages();App.showToast('已删除');});
  bar.querySelector('#ctMultiCancel').addEventListener('click',function(){ChatUI.exitMultiSelect();});
},

exitMultiSelect:function(){
  var Chat=App.chat;if(!Chat)return;
  Chat._multiMode=false;Chat._multiSelected=[];
  var mc=App.$('#ctMsgs');
  if(mc){mc.classList.remove('ct-multi-mode');mc.querySelectorAll('.ct-msg.ct-selected').forEach(function(el){el.classList.remove('ct-selected');});mc.querySelectorAll('.ct-swipe-check').forEach(function(el){el.remove();});if(mc._mts){mc.removeEventListener('touchstart',mc._mts);mc._mts=null;}if(mc._mtm){mc.removeEventListener('touchmove',mc._mtm);mc._mtm=null;}if(mc._mte){mc.removeEventListener('touchend',mc._mte);mc._mte=null;}}
  var bar=App.$('#ctMultiBar');if(bar)bar.remove();
  var iw=App.$('.ct-input-wrap');if(iw)iw.style.display='';
},

/* ===== 调色板 ===== */
showPalette:function(){
  var Chat=App.chat;if(!Chat)return;
  var saved=App.LS.get('chatPalette_'+Chat.charId)||{accent:'#1a1a1a'};
  var cur=saved.accent||'#1a1a1a';
  var o=makeOverlay(true);var d=makeDialog('wide');
  d.innerHTML='<div class="ct-dialog-title">聊天调色板</div>'+
    '<div class="ct-dialog-desc">调整用户气泡颜色</div>'+
    '<div style="display:flex;align-items:center;gap:12px;justify-content:center;">'+
      '<div class="ct-palette-preview" id="cpSw" style="background:'+cur+';"></div>'+
      '<input class="ct-dialog-input" id="cpHex" type="text" value="'+cur+'" maxlength="7" style="width:90px;font-family:monospace;">'+
    '</div>'+
    '<div class="ct-palette-swatches" id="cpQ">'+
      ['#1a1a1a','#333','#555','#888','#aaa','#c9706b','#6bab8e','#d4a76a'].map(function(c){return '<div class="ct-palette-swatch" data-c="'+c+'" style="background:'+c+';"></div>';}).join('')+
    '</div>'+
    '<div class="ct-dialog-btn-row">'+
      '<button class="ct-dialog-btn primary" id="cpOk" type="button">应用</button>'+
      '<button class="ct-dialog-btn" id="cpRst" type="button">重置</button>'+
      '<button class="ct-dialog-btn ghost" id="cpNo" type="button">取消</button>'+
    '</div>';
  o.appendChild(d);document.body.appendChild(o);

  var sw=d.querySelector('#cpSw'),hex=d.querySelector('#cpHex');
  function pv(c){sw.style.background=c;hex.value=c;ChatUI.applyPalette(c);}
  d.querySelector('#cpNo').addEventListener('click',function(){o.remove();});
  d.querySelector('#cpRst').addEventListener('click',function(){App.LS.remove('chatPalette_'+Chat.charId);ChatUI.applyPalette('#1a1a1a');o.remove();App.showToast('已重置');});
  d.querySelector('#cpOk').addEventListener('click',function(){var c=hex.value.trim();if(!/^#[0-9a-fA-F]{6}$/.test(c)&&!/^#[0-9a-fA-F]{3}$/.test(c)){App.showToast('请输入正确的颜色值');return;}App.LS.set('chatPalette_'+Chat.charId,{accent:c});ChatUI.applyPalette(c);o.remove();App.showToast('已应用');});
  hex.addEventListener('input',function(){var v=this.value.trim();if(/^#[0-9a-fA-F]{6}$/.test(v))pv(v);});
  sw.addEventListener('click',function(e){e.stopPropagation();if(App.openColorPicker)App.openColorPicker(cur,function(h){cur=h;pv(h);},function(h){pv(h);});});
  d.querySelectorAll('.ct-palette-swatch').forEach(function(q){q.addEventListener('click',function(e){e.stopPropagation();cur=q.dataset.c;pv(cur);});});
},

applyPalette:function(color){
  var root=App.$('#ctRoot');if(!root)return;
  root.querySelectorAll('.ct-msg.user .ct-bubble').forEach(function(b){b.style.background=color;});
},

/* ===== 头像设置 ===== */
showAvCard:function(){
  var Chat=App.chat;if(!Chat)return;Chat.dismissAvCard();
  var curShape=App.LS.get('chatAvShape_'+Chat.charId)||'square';
  var curHide=App.LS.get('chatAvHide_'+Chat.charId)||false;
  var card=document.createElement('div');card.className='ct-av-card show';
  card.innerHTML='<div class="ct-av-section"><div class="ct-av-label">形状</div><div class="ct-av-opts"><div class="ct-av-opt'+(curShape==='square'?' active':'')+'" data-shape="square">方形</div><div class="ct-av-opt'+(curShape==='round'?' active':'')+'" data-shape="round">圆形</div></div></div><div class="ct-av-section"><div class="ct-av-label">显示</div><div class="ct-av-opts"><div class="ct-av-opt'+(!curHide?' active':'')+'" data-vis="show">显示</div><div class="ct-av-opt'+(curHide?' active':'')+'" data-vis="hide">隐藏</div></div></div>';
  var btn=App.$('#ctMenuBtn');if(btn){var rect=btn.getBoundingClientRect();card.style.top=(rect.bottom+4)+'px';card.style.right=(window.innerWidth-rect.right)+'px';}
  document.body.appendChild(card);Chat._avCard=card;
  card.addEventListener('click',function(e){e.stopPropagation();});
  card.querySelectorAll('[data-shape]').forEach(function(opt){opt.addEventListener('click',function(){card.querySelectorAll('[data-shape]').forEach(function(o){o.classList.remove('active');});opt.classList.add('active');App.LS.set('chatAvShape_'+Chat.charId,opt.dataset.shape);Chat.renderMessages();});});
  card.querySelectorAll('[data-vis]').forEach(function(opt){opt.addEventListener('click',function(){card.querySelectorAll('[data-vis]').forEach(function(o){o.classList.remove('active');});opt.classList.add('active');App.LS.set('chatAvHide_'+Chat.charId,opt.dataset.vis==='hide');Chat.renderMessages();});});
},

/* ===== 长按菜单 ===== */
showCtxMenu:function(msgEl,x,y){
  var Chat=App.chat;if(!Chat)return;Chat.dismissCtx();
  var idx=parseInt(msgEl.dataset.msgIdx);if(isNaN(idx))return;
  var msg=Chat.messages[idx];if(!msg)return;
  var isUser=msg.role==='user';
  var menu=document.createElement('div');menu.className='ct-ctx';
  var items='';
  items+='<div class="ct-ctx-item" data-act="copy">'+CTX_ICONS.copy+'<span>复制</span></div>';
  items+='<div class="ct-ctx-item" data-act="edit">'+CTX_ICONS.edit+'<span>编辑</span></div>';
  items+=isUser?'<div class="ct-ctx-item" data-act="resend">'+CTX_ICONS.resend+'<span>重发</span></div>':'<div class="ct-ctx-item" data-act="regen">'+CTX_ICONS.regen+'<span>重新生成</span></div>';
  items+='<div class="ct-ctx-item" data-act="quote">'+CTX_ICONS.quote+'<span>引用</span></div>';
  items+='<div class="ct-ctx-item" data-act="share">'+CTX_ICONS.share+'<span>转发</span></div>';
  items+='<div class="ct-ctx-item" data-act="fav">'+CTX_ICONS.fav+'<span>收藏</span></div>';
  items+='<div class="ct-ctx-item" data-act="del">'+CTX_ICONS.del+'<span>删除</span></div>';
  items+='<div class="ct-ctx-item" data-act="delafter">'+CTX_ICONS.delafter+'<span>往后全删</span></div>';
  menu.innerHTML=items;
  var mw=300,mh=200;
  var left=Math.max(8,Math.min(x-mw/2,window.innerWidth-mw-8));
  var top=y-mh-10;if(top<60)top=y+10;if(top+mh>window.innerHeight-10)top=window.innerHeight-mh-10;
  menu.style.left=left+'px';menu.style.top=top+'px';
  document.body.appendChild(menu);Chat._ctxMenu=menu;
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
      else if(act==='quote'){var inp=App.$('#ctInput');if(inp){inp.value='「'+msg.content.replace(/\[sticker:[^\]]+\]/g,'[表情包]').slice(0,50)+(msg.content.length>50?'...':'')+'」\n';inp.focus();inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,100)+'px';App.showToast('已引用');}}
      else if(act==='fav'){var favs=App.LS.get('chatFavorites')||[];favs.push({content:msg.content,ts:msg.ts,charName:Chat.charData?Chat.charData.name:'',savedAt:Date.now()});App.LS.set('chatFavorites',favs);App.showToast('已收藏');}
    });
  });
},

/* ===== 编辑消息 ===== */
showEditDialog:function(idx){
  var Chat=App.chat;if(!Chat)return;
  var msg=Chat.messages[idx];if(!msg)return;
  var isUser=msg.role==='user';
  var o=document.createElement('div');o.className='ct-edit-overlay';
  o.innerHTML='<div class="ct-edit-panel"><div class="ct-edit-title">编辑消息</div><textarea class="ct-edit-ta" id="ctEditTA">'+App.esc(msg.content)+'</textarea><div class="ct-edit-btns"><button class="ct-edit-btn save" id="ctEditSave" type="button">保存</button>'+(isUser?'<button class="ct-edit-btn alt" id="ctEditSendNew" type="button">保存并重发</button>':'')+'<button class="ct-edit-btn cancel" id="ctEditCancel" type="button">取消</button></div></div>';
  document.body.appendChild(o);
  o.addEventListener('click',function(e){if(e.target===o)o.remove();});
  o.querySelector('#ctEditCancel').addEventListener('click',function(){o.remove();});
  o.querySelector('#ctEditSave').addEventListener('click',function(){var val=o.querySelector('#ctEditTA').value.trim();if(!val){App.showToast('内容不能为空');return;}Chat.messages[idx].content=val;Chat.saveMsgs();Chat.renderMessages();o.remove();});
  var sn=o.querySelector('#ctEditSendNew');
  if(sn)sn.addEventListener('click',function(){var val=o.querySelector('#ctEditTA').value.trim();if(!val){App.showToast('内容不能为空');return;}o.remove();Chat.messages.splice(idx);Chat.messages.push({role:'user',content:val,ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();});
},

/* ===== 场景编辑 ===== */
showSceneDialog:function(){
  var Chat=App.chat;if(!Chat)return;
  var cur=App.LS.get('chatScene_'+Chat.charId)||'';
  var o=document.createElement('div');o.className='ct-scene-overlay';
  o.innerHTML='<div class="ct-scene-panel"><div class="ct-edit-title">当前场景 / 时间线</div><div class="ct-edit-desc">描述当前的时间、地点、剧情背景等。每次发送消息时自动附带给AI。留空则不启用。</div><textarea class="ct-scene-ta" id="ctSceneTA" placeholder="例如：现在是深夜两点，你刚下班回家...">'+App.esc(cur)+'</textarea><div class="ct-edit-btns"><button class="ct-edit-btn save" id="ctSceneSave" type="button">保存</button><button class="ct-edit-btn cancel" id="ctSceneClear" type="button">清空</button><button class="ct-edit-btn cancel" id="ctSceneCancel" type="button">取消</button></div></div>';
  document.body.appendChild(o);
  o.addEventListener('click',function(e){if(e.target===o)o.remove();});
  o.querySelector('#ctSceneCancel').addEventListener('click',function(){o.remove();});
  o.querySelector('#ctSceneClear').addEventListener('click',function(){App.LS.remove('chatScene_'+Chat.charId);o.remove();App.showToast('已清空场景');});
  o.querySelector('#ctSceneSave').addEventListener('click',function(){var val=o.querySelector('#ctSceneTA').value.trim();if(val)App.LS.set('chatScene_'+Chat.charId,val);else App.LS.remove('chatScene_'+Chat.charId);o.remove();App.showToast('场景已保存');});
},

/* ===== 背景图 ===== */
showBgMenu:function(){
  var Chat=App.chat;if(!Chat)return;
  var o=makeOverlay(true);var d=makeDialog();
  d.innerHTML='<div class="ct-dialog-title">聊天背景</div>'+
    '<button class="ct-dialog-btn" data-act="album" type="button">从相册选择</button>'+
    '<button class="ct-dialog-btn" data-act="url" type="button">输入图片URL</button>'+
    '<button class="ct-dialog-btn danger" data-act="del" type="button">移除背景</button>'+
    '<button class="ct-dialog-btn ghost" data-act="cancel" type="button">取消</button>';
  o.appendChild(d);document.body.appendChild(o);
  d.querySelectorAll('.ct-dialog-btn').forEach(function(btn){
    btn.addEventListener('click',function(e){e.stopPropagation();var act=btn.dataset.act;o.remove();
      if(act==='cancel')return;
      if(act==='del'){App.LS.remove('chatBg_'+Chat.charId);var bg=App.$('#ctBg');if(bg)bg.style.backgroundImage='';var nb=App.$('#ctNoBg');if(nb)nb.classList.remove('has-bg');App.showToast('已移除');return;}
      if(act==='album'){var input=document.createElement('input');input.type='file';input.accept='image/*';document.body.appendChild(input);input.onchange=function(ev){var file=ev.target.files[0];document.body.removeChild(input);if(!file)return;var reader=new FileReader();reader.onload=function(r){if(App.cropImage)App.cropImage(r.target.result,function(c){Chat._utils.compressImage(c,Chat._utils.MAX_BG_SIZE,Chat._utils.BG_QUALITY,function(cc){Chat.setChatBg(cc);});});else Chat._utils.compressImage(r.target.result,Chat._utils.MAX_BG_SIZE,Chat._utils.BG_QUALITY,function(cc){Chat.setChatBg(cc);});};reader.readAsDataURL(file);};input.click();return;}
      if(act==='url')showUrlInput('输入背景图URL',function(url){if(!url)return;Chat.setChatBg(url);});
    });
  });
},

init:function(){App.chatUI=ChatUI;}
};

App.register('chatUI',ChatUI);
})();