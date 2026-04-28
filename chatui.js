
(function(){
'use strict';
var App=window.App;if(!App)return;

var ROBOT_SVG='<svg class="ct-robot-svg" viewBox="0 0 64 64" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="32" y1="14" x2="32" y2="10" stroke="#7a9ab8" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#7a9ab8"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#7a9ab8"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';

var STOP_SVG='<svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';

var CTX_ICONS={
copy:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
edit:'<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
resend:'<svg viewBox="0 0 24 24"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
regen:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg>',
quote:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,.7)" stroke-width="2.4" fill="none"/><path d="M18 36C18 30.5 20.5 25 25.5 22.5L27 25C23 27.5 22 30 22 33H26V39H18V36Z" stroke="rgba(255,255,255,.7)" stroke-width="2" stroke-linejoin="round" fill="none"/><path d="M34 36C34 30.5 36.5 25 41.5 22.5L43 25C39 27.5 38 30 38 33H42V39H34V36Z" stroke="rgba(255,255,255,.7)" stroke-width="2" stroke-linejoin="round" fill="none"/></svg>',
share:'<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
fav:'<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
delafter:'<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
multisel:'<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
del:'<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

var ChatUI={

render:function(inner,charData,bgUrl,hasBg,tintOn){
var c=charData;
var tintCSS='background:'+
'radial-gradient(circle at 50% 48%,rgba(126,163,201,.48) 0%,rgba(126,163,201,.28) 18%,rgba(126,163,201,.14) 38%,transparent 62%),'+
'radial-gradient(circle at 46% 44%,rgba(140,180,215,.22) 0%,rgba(140,180,215,.10) 28%,transparent 52%),'+
'radial-gradient(ellipse at 56% 54%,rgba(170,200,228,.18) 0%,transparent 48%);';

inner.innerHTML=
'<div class="ct-root" id="ctRoot">'+
'<div class="ct-no-bg'+(hasBg?' has-bg':'')+'" id="ctNoBg"></div>'+
'<div class="ct-bg" id="ctBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');':'')+'"></div>'+
'<div class="ct-tint'+(tintOn?'':' off')+'" id="ctTint" style="'+tintCSS+'"></div>'+
'<div class="ct-glass"></div>'+
'<div class="ct-hd">'+
  '<button class="ct-hd-btn" id="ctBack" type="button"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>'+
  '<div class="ct-hd-name" id="ctName">'+App.esc(c.name||'')+'</div>'+
  '<button class="ct-hd-btn" id="ctMenuBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2" fill="#1a1a1a" stroke="none"/><circle cx="12" cy="12" r="2" fill="#1a1a1a" stroke="none"/><circle cx="18" cy="12" r="2" fill="#1a1a1a" stroke="none"/></svg></button>'+
'</div>'+
'<div class="ct-msgs" id="ctMsgs"></div>'+
'<div class="ct-plus-panel" id="ctPlusPanel">'+
  ChatUI._buildPlusItems()+
'</div>'+
'<div class="ct-input-wrap">'+
'<button class="ct-voice-btn" id="ctVoiceBtn" type="button"><svg viewBox="0 0 24 24"><path d="M1 1l22 22"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.49-.34 2.18"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>'+
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
var avShape=App.LS.get('chatAvShape_'+Chat.charId)||'square';
var avHide=App.LS.get('chatAvHide_'+Chat.charId)||false;
var avClass=avShape==='round'?' round':'';
if(avHide)avClass+=' hide-av';

if(!Chat.messages.length){
  var greeting=c&&c.greeting?c.greeting:'';
  container.innerHTML=greeting?'<div class="ct-greeting">'+App.esc(greeting)+'</div>':'<div class="ct-empty-text">开始聊天吧</div>';
  return;
}

var html='';
var floor=0;

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

  var bubbleContent='';

  var stickerMatch=text.match(/\[sticker:([^\]]+)\]/);
  if(stickerMatch){
    var desc=stickerMatch[1];
    text=text.replace(stickerMatch[0],'').trim();
    var cacheKey='stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30);
    var stickerImgUrl=App.LS.get(cacheKey);
    if(stickerImgUrl){
      bubbleContent+='<img class="ct-sticker" src="'+App.escAttr(stickerImgUrl)+'" alt="sticker">';
    } else {
      var stickerId='stk_'+idx;
      bubbleContent+='<div class="ct-sticker-loading" id="'+stickerId+'" data-desc="'+App.escAttr(desc)+'" style="width:80px;height:80px;border-radius:8px;background:rgba(200,220,240,.15);display:flex;align-items:center;justify-content:center;font-size:11px;color:#8aa0b8;">生成中...</div>';
    }
  }

  if(text)bubbleContent+=App.esc(text);
  if(!bubbleContent)return;

  var metaHtml='<div class="ct-msg-meta">';
  metaHtml+='<span class="ct-msg-floor">#'+floor+'</span>';
  metaHtml+='<span class="ct-msg-time">'+timeStr+'</span>';
  metaHtml+='</div>';

  html+='<div class="ct-msg '+(isUser?'user':'ai')+'" data-msg-idx="'+idx+'"><div class="ct-msg-av'+avClass+'">'+av+'</div><div class="ct-bubble-wrap">'+metaHtml+'<div class="ct-bubble">'+bubbleContent+'</div></div></div>';
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
    else{el.innerHTML='['+App.esc(desc)+']';el.style.width='auto';el.style.height='auto';}
  });
});
},

bindEvents:function(){
var Chat=App.chat;if(!Chat)return;

var root=App.$('#ctRoot');
var _swipe={active:false,sx:0,sy:0,locked:false,dir:''};
if(root){
  root.addEventListener('touchstart',function(e){
    var t=e.touches[0];
    var rootRect=root.getBoundingClientRect();
    var relX=t.clientX-rootRect.left;
    if(relX>60)return;
    _swipe={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};
  },{passive:true});

  root.addEventListener('touchmove',function(e){
    if(!_swipe.active)return;
    var t=e.touches[0];
    var dx=t.clientX-_swipe.sx,dy=t.clientY-_swipe.sy;
    if(!_swipe.locked){
      if(Math.abs(dx)<10&&Math.abs(dy)<10)return;
      _swipe.locked=true;
      _swipe.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';
    }
    if(_swipe.dir==='h'&&dx>0){
      e.preventDefault();
      var rootW=root.offsetWidth||window.innerWidth;
      root.style.transform='translateX('+Math.min(dx,rootW)+'px)';
      root.style.opacity=String(1-dx/rootW*0.5);
    }
  },{passive:false});

  root.addEventListener('touchend',function(e){
    if(!_swipe.active){return;}
    _swipe.active=false;
    if(_swipe.dir!=='h'){root.style.transform='';root.style.opacity='';return;}
    var t=e.changedTouches[0];
    var dx=t.clientX-_swipe.sx;
    var rootW=root.offsetWidth||window.innerWidth;
    if(dx>rootW*0.3){
      root.style.transition='transform .25s ease, opacity .25s ease';
      root.style.transform='translateX(100%)';
      root.style.opacity='0';
      setTimeout(function(){
        root.style.transition='';root.style.transform='';root.style.opacity='';
        Chat.close();
      },260);
    } else {
      root.style.transition='transform .2s ease, opacity .2s ease';
      root.style.transform='';root.style.opacity='';
      setTimeout(function(){root.style.transition='';},220);
    }
  },{passive:true});

  root.addEventListener('click',function(){Chat.dismissMenu();Chat.dismissCtx();Chat.dismissAvCard();var pp=App.$('#ctPlusPanel');if(pp&&Chat._plusOpen){pp.classList.remove('show');Chat._plusOpen=false;}});
}

App.safeOn('#ctBack','click',function(){Chat.close();});
App.safeOn('#ctMenuBtn','click',function(e){e.stopPropagation();if(Chat._menuEl){Chat.dismissMenu();return;}ChatUI.showMenu();});

var input=App.$('#ctInput');
if(input){
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px';});
  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey&&!('ontouchstart' in window)){e.preventDefault();Chat.send();}
  });
}

App.safeOn('#ctSend','click',function(e){
  e.stopPropagation();
  if(Chat.isStreaming){Chat.stopStream();return;}
  var input=App.$('#ctInput');
  if(input&&!input.value.trim()){
    Chat.requestProactive();
    return;
  }
  Chat.send();
});

App.safeOn('#ctPlusBtn','click',function(e){
  e.stopPropagation();
  var pp=App.$('#ctPlusPanel');if(!pp)return;
  Chat._plusOpen=!Chat._plusOpen;
  if(Chat._plusOpen)pp.classList.add('show');else pp.classList.remove('show');
});

App.safeOn('#ctVoiceBtn','click',function(e){
  e.stopPropagation();
  if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    var rec=new SR();
    rec.lang='zh-CN';rec.continuous=false;rec.interimResults=false;
    App.showToast('请说话...');
    rec.onresult=function(ev){
      var text=ev.results[0][0].transcript;
      if(!text){App.showToast('没有识别到语音');return;}
      Chat.messages.push({role:'user',content:'[用户发了一条语音消息，内容是："'+text+'"]',ts:Date.now()});
      Chat.saveMsgs();Chat.renderMessages();
      setTimeout(function(){Chat.requestAI();},2000);
    };
    rec.onerror=function(ev){App.showToast('语音识别失败：'+ev.error);};
    rec.start();
  } else {
    App.showToast('浏览器不支持语音输入');
  }
});

['piPhoto','piSticker','piVoiceMsg','piVoiceCall','piVideoCall','piRedPacket','piTransfer','piLocation'].forEach(function(id){
  App.safeOn('#'+id,'click',function(e){
    e.stopPropagation();
    var pp=App.$('#ctPlusPanel');if(pp){pp.classList.remove('show');Chat._plusOpen=false;}

    if(id==='piPhoto'){
      ChatUI._showImagePicker(function(src){
        if(!src)return;
        Chat.messages.push({role:'user',content:'[用户发送了一张图片]',ts:Date.now()});
        Chat.saveMsgs();Chat.renderMessages();
      });
      return;
    }

    if(id==='piSticker'){
      ChatUI._showStickerPicker();
      return;
    }

    if(id==='piVoiceMsg'){
      if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
        var SR2=window.SpeechRecognition||window.webkitSpeechRecognition;
        var rec2=new SR2();
        rec2.lang='zh-CN';rec2.continuous=false;rec2.interimResults=false;
        App.showToast('请说话...');
        rec2.onresult=function(ev){
          var text2=ev.results[0][0].transcript;
          if(!text2){App.showToast('没有识别到语音');return;}
          Chat.messages.push({role:'user',content:'[用户发了一条语音消息，内容是："'+text2+'"]',ts:Date.now()});
          Chat.saveMsgs();Chat.renderMessages();
          setTimeout(function(){Chat.requestAI();},2000);
        };
        rec2.onerror=function(ev){App.showToast('语音识别失败：'+ev.error);};
        rec2.start();
      } else {
        App.showToast('浏览器不支持语音输入');
      }
      return;
    }

    if(id==='piVoiceCall'){
      Chat.messages.push({role:'user',content:'[用户发起了语音通话]',ts:Date.now()});
      Chat.saveMsgs();Chat.renderMessages();
      setTimeout(function(){Chat.requestAI();},1500);
      return;
    }

    if(id==='piVideoCall'){
      Chat.messages.push({role:'user',content:'[用户发起了视频通话]',ts:Date.now()});
      Chat.saveMsgs();Chat.renderMessages();
      setTimeout(function(){Chat.requestAI();},1500);
      return;
    }

    if(id==='piRedPacket'){
      var amount=prompt('红包金额（元）：');
      if(!amount)return;
      var note=prompt('红包留言（可选）：')||'恭喜发财';
      Chat.messages.push({role:'user',content:'[用户发了一个'+amount+'元的红包: '+note+']',ts:Date.now()});
      Chat.saveMsgs();Chat.renderMessages();
      setTimeout(function(){Chat.requestAI();},2000);
      return;
    }

    if(id==='piTransfer'){
      var tAmount=prompt('转账金额（元）：');
      if(!tAmount)return;
      var tNote=prompt('转账备注（可选）：')||'转账';
      Chat.messages.push({role:'user',content:'[用户转账了'+tAmount+'元: '+tNote+']',ts:Date.now()});
      Chat.saveMsgs();Chat.renderMessages();
      setTimeout(function(){Chat.requestAI();},2000);
      return;
    }

    if(id==='piLocation'){
      var locMenu=document.createElement('div');
      locMenu.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
      locMenu.innerHTML=
      '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">'+
        '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:4px;">分享位置</div>'+
        '<button data-lact="real" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">发送真实位置</button>'+
        '<button data-lact="virtual" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入虚拟位置</button>'+
        '<button data-lact="cancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>'+
      '</div>';
      document.body.appendChild(locMenu);
      locMenu.addEventListener('click',function(e){if(e.target===locMenu)locMenu.remove();});
      locMenu.querySelectorAll('button').forEach(function(lbtn){
        lbtn.addEventListener('click',function(e){
          e.stopPropagation();var lact=lbtn.dataset.lact;locMenu.remove();
          if(lact==='cancel')return;
          if(lact==='real'){
            if("geolocation" in navigator){
              App.showToast('获取位置中...');
              navigator.geolocation.getCurrentPosition(function(pos){
                Chat.messages.push({role:'user',content:'[用户分享了位置: '+pos.coords.latitude.toFixed(4)+'°N '+pos.coords.longitude.toFixed(4)+'°E]',ts:Date.now()});
                Chat.saveMsgs();Chat.renderMessages();
                setTimeout(function(){Chat.requestAI();},2000);
              },function(){
                App.showToast('无法获取位置');
                Chat.messages.push({role:'user',content:'[用户分享了位置]',ts:Date.now()});
                Chat.saveMsgs();Chat.renderMessages();
                setTimeout(function(){Chat.requestAI();},2000);
              });
            } else {
              App.showToast('浏览器不支持定位');
            }
            return;
          }
          if(lact==='virtual'){
            var place=prompt('输入虚拟位置（如：东京涩谷、星巴克咖啡厅）：');
            if(!place)return;
            Chat.messages.push({role:'user',content:'[用户分享了位置: '+place+']',ts:Date.now()});
            Chat.saveMsgs();Chat.renderMessages();
            setTimeout(function(){Chat.requestAI();},2000);
          }
        });
      });
      return;
    }
  });
});

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
      input.onchange=function(ev){
        var file=ev.target.files[0];document.body.removeChild(input);if(!file){callback(null);return;}
        var reader=new FileReader();
        reader.onload=function(r){
          if(App.cropImage){App.cropImage(r.target.result,function(cropped){callback(cropped);});}
          else{callback(r.target.result);}
        };
        reader.readAsDataURL(file);
      };
      input.click();return;
    }
    if(act==='url'){
      ChatUI._showUrlInput('输入图片URL',function(url){
        if(!url){callback(null);return;}
        if(App.cropImage){
          var img=new Image();img.crossOrigin='anonymous';
          img.onload=function(){
            var c=document.createElement('canvas');c.width=img.width;c.height=img.height;
            c.getContext('2d').drawImage(img,0,0);
            App.cropImage(c.toDataURL(),function(cropped){callback(cropped);});
          };
          img.onerror=function(){callback(url);};
          img.src=url;
        } else {callback(url);}
      });
    }
  });
});
},

_showStickerPicker:function(){
var Chat=App.chat;if(!Chat)return;
var favs=App.LS.get('chatFavorites')||[];
var stickerFavs=favs.filter(function(f){return f.content&&f.content.indexOf('[sticker:')>=0;});

var menu=document.createElement('div');
menu.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
var stickerHtml='';
if(stickerFavs.length){
  stickerHtml+='<div style="font-size:11px;color:#999;margin-bottom:6px;">收藏的表情包</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">';
  stickerFavs.forEach(function(f){
    var m=f.content.match(/\[sticker:([^\]]+)\]/);
    if(!m)return;
    var desc=m[1];
    var ck='stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30);
    var url=App.LS.get(ck);
    if(url)stickerHtml+='<img src="'+App.escAttr(url)+'" data-desc="'+App.escAttr(desc)+'" style="width:60px;height:60px;border-radius:8px;object-fit:cover;cursor:pointer;border:1px solid #eee;" class="stk-pick">';
  });
  stickerHtml+='</div>';
}

menu.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:300px;max-height:60vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">'+
  '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:4px;">发送表情包</div>'+
  stickerHtml+
  '<button data-act="album" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择图片</button>'+
  '<button data-act="url" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button>'+
  '<button data-act="cancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>'+
'</div>';
document.body.appendChild(menu);

menu.addEventListener('click',function(e){if(e.target===menu)menu.remove();});

menu.querySelectorAll('.stk-pick').forEach(function(img){
  img.addEventListener('click',function(e){
    e.stopPropagation();menu.remove();
    Chat.messages.push({role:'user',content:'[用户发送了表情包]',ts:Date.now()});
    Chat.saveMsgs();Chat.renderMessages();
  });
});

menu.querySelectorAll('button').forEach(function(btn){
  btn.addEventListener('click',function(e){
    e.stopPropagation();var act=btn.dataset.act;menu.remove();
    if(act==='cancel')return;
    if(act==='album'){
      var input=document.createElement('input');input.type='file';input.accept='image/*';
      document.body.appendChild(input);
      input.onchange=function(ev){
        var file=ev.target.files[0];document.body.removeChild(input);if(!file)return;
        var reader=new FileReader();reader.onload=function(r){
          if(App.cropImage){App.cropImage(r.target.result,function(){
            Chat.messages.push({role:'user',content:'[用户发送了表情包]',ts:Date.now()});
            Chat.saveMsgs();Chat.renderMessages();
          });}else{
            Chat.messages.push({role:'user',content:'[用户发送了表情包]',ts:Date.now()});
            Chat.saveMsgs();Chat.renderMessages();
          }
        };reader.readAsDataURL(file);
      };input.click();
      return;
    }
    if(act==='url'){
      ChatUI._showUrlInput('输入表情包URL',function(url){
        if(!url)return;
        Chat.messages.push({role:'user',content:'[用户发送了表情包]',ts:Date.now()});
        Chat.saveMsgs();Chat.renderMessages();
      });
    }
  });
});
},

_showUrlInput:function(title,callback){
var urlPanel=document.createElement('div');
urlPanel.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
urlPanel.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
  '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;">'+App.esc(title)+'</div>'+
  '<input id="uiUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
  '<div id="uiUrlPreview" style="display:none;width:100%;height:120px;border-radius:8px;overflow:hidden;border:1px solid #eee;background:#f5f5f5;"><img style="width:100%;height:100%;object-fit:cover;display:block;"></div>'+
  '<div style="display:flex;gap:8px;">'+
    '<button id="uiUrlOk" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">确定</button>'+
    '<button id="uiUrlNo" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>'+
  '</div>'+
'</div>';
document.body.appendChild(urlPanel);
urlPanel.addEventListener('click',function(e){if(e.target===urlPanel){urlPanel.remove();callback(null);}});
urlPanel.querySelector('#uiUrlNo').addEventListener('click',function(){urlPanel.remove();callback(null);});
var pBox=urlPanel.querySelector('#uiUrlPreview'),pImg=pBox.querySelector('img');
urlPanel.querySelector('#uiUrlInput').addEventListener('input',function(){
  var v=this.value.trim();
  if(v&&v.startsWith('http')){pImg.src=v;pBox.style.display='block';pImg.onerror=function(){pBox.style.display='none';};}
  else pBox.style.display='none';
});
urlPanel.querySelector('#uiUrlOk').addEventListener('click',function(){
  var url=urlPanel.querySelector('#uiUrlInput').value.trim();
  if(!url){App.showToast('请输入URL');return;}
  urlPanel.remove();callback(url);
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
if(show)el.innerHTML=App.esc(c?c.name:'')+'<div class="ct-hd-typing">对方正在输入...</div>';
else el.textContent=c?c.name:'';
},

showMenu:function(){
var Chat=App.chat;if(!Chat)return;
Chat.dismissMenu();
var tintOn=App.LS.get('chatTint_'+Chat.charId);if(tintOn===null)tintOn=true;

var menu=document.createElement('div');menu.className='ct-hd-menu show';
menu.innerHTML=
'<div class="ct-hd-mi" data-act="avatar"><span>头像设置</span></div>'+
'<div class="ct-hd-mi" data-act="bg"><span>上传背景图</span></div>'+
'<div class="ct-hd-mi" data-act="tint"><span>晕染</span><div class="ct-sw-track '+(tintOn?'on':'off')+'" id="ctTintSw"></div></div>'+
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

    if(act==='avatar'){ChatUI.showAvCard();return;}
    if(act==='bg')ChatUI.showBgMenu();
    else if(act==='scene')ChatUI.showSceneDialog();
    else if(act==='clear'){if(!confirm('确定清空所有聊天记录？'))return;Chat.messages=[];Chat.saveMsgs();Chat.renderMessages();App.showToast('已清空');}
  });
});
},

showAvCard:function(){
var Chat=App.chat;if(!Chat)return;
Chat.dismissAvCard();

var curShape=App.LS.get('chatAvShape_'+Chat.charId)||'square';
var curHide=App.LS.get('chatAvHide_'+Chat.charId)||false;

var card=document.createElement('div');
card.className='ct-av-card show';

card.innerHTML=
'<div class="ct-av-section"><div class="ct-av-label">形状</div><div class="ct-av-opts">'+
  '<div class="ct-av-opt'+(curShape==='square'?' active':'')+'" data-shape="square">方形</div>'+
  '<div class="ct-av-opt'+(curShape==='round'?' active':'')+'" data-shape="round">圆形</div>'+
'</div></div>'+
'<div class="ct-av-section"><div class="ct-av-label">显示</div><div class="ct-av-opts">'+
  '<div class="ct-av-opt'+(!curHide?' active':'')+'" data-vis="show">显示</div>'+
  '<div class="ct-av-opt'+(curHide?' active':'')+'" data-vis="hide">隐藏</div>'+
'</div></div>';

var btn=App.$('#ctMenuBtn');
if(btn){var rect=btn.getBoundingClientRect();card.style.top=(rect.bottom+4)+'px';card.style.right=(window.innerWidth-rect.right)+'px';}
document.body.appendChild(card);Chat._avCard=card;

card.addEventListener('click',function(e){e.stopPropagation();});

card.querySelectorAll('[data-shape]').forEach(function(opt){
  opt.addEventListener('click',function(){
    card.querySelectorAll('[data-shape]').forEach(function(o){o.classList.remove('active');});
    opt.classList.add('active');
    App.LS.set('chatAvShape_'+Chat.charId,opt.dataset.shape);
    Chat.renderMessages();
  });
});

card.querySelectorAll('[data-vis]').forEach(function(opt){
  opt.addEventListener('click',function(){
    card.querySelectorAll('[data-vis]').forEach(function(o){o.classList.remove('active');});
    opt.classList.add('active');
    App.LS.set('chatAvHide_'+Chat.charId,opt.dataset.vis==='hide');
    Chat.renderMessages();
  });
});
},

showCtxMenu:function(msgEl,x,y){
var Chat=App.chat;if(!Chat)return;
Chat.dismissCtx();
var idx=parseInt(msgEl.dataset.msgIdx);if(isNaN(idx))return;
var msg=Chat.messages[idx];if(!msg)return;
var isUser=msg.role==='user';

var menu=document.createElement('div');menu.className='ct-ctx';
var items='';
items+='<div class="ct-ctx-item" data-act="copy">'+CTX_ICONS.copy+'<span>复制</span></div>';
items+='<div class="ct-ctx-item" data-act="edit">'+CTX_ICONS.edit+'<span>编辑</span></div>';
if(isUser){
  items+='<div class="ct-ctx-item" data-act="resend">'+CTX_ICONS.resend+'<span>重发</span></div>';
} else {
  items+='<div class="ct-ctx-item" data-act="regen">'+CTX_ICONS.regen+'<span>重新生成</span></div>';
}
items+='<div class="ct-ctx-item" data-act="quote">'+CTX_ICONS.quote+'<span>引用</span></div>';
items+='<div class="ct-ctx-item" data-act="share">'+CTX_ICONS.share+'<span>转发</span></div>';
items+='<div class="ct-ctx-item" data-act="fav">'+CTX_ICONS.fav+'<span>收藏</span></div>';
items+='<div class="ct-ctx-item" data-act="multisel">'+CTX_ICONS.multisel+'<span>多选</span></div>';
items+='<div class="ct-ctx-item" data-act="delafter">'+CTX_ICONS.delafter+'<span>往后全删</span></div>';
items+='<div class="ct-ctx-item" data-act="del">'+CTX_ICONS.del+'<span>删除</span></div>';
menu.innerHTML=items;

var mw=280,mh=200;
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
    else if(act==='multisel')App.showToast('多选功能开发中');
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
      favs.push({content:msg.content,ts:msg.ts,charName:Chat.charData?Chat.charData.name:'',savedAt:Date.now()});
      App.LS.set('chatFavorites',favs);
      App.showToast('已收藏');
    }
        else if(act==='multisel'){
      App.showToast('多选功能开发中');
    }
  });
});
},

showEditDialog:function(idx){
var Chat=App.chat;if(!Chat)return;
var msg=Chat.messages[idx];if(!msg)return;
var isUser=msg.role==='user';

var overlay=document.createElement('div');
overlay.className='ct-edit-overlay';
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
  var val=overlay.querySelector('#ctEditTA').value.trim();
  if(!val){App.showToast('内容不能为空');return;}
  Chat.messages[idx].content=val;Chat.saveMsgs();Chat.renderMessages();overlay.remove();
});
var sendNew=overlay.querySelector('#ctEditSendNew');
if(sendNew){sendNew.addEventListener('click',function(){
  var val=overlay.querySelector('#ctEditTA').value.trim();
  if(!val){App.showToast('内容不能为空');return;}
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
var old=App.$('#ctBgMenu');if(old)old.remove();
var menu=document.createElement('div');menu.id='ctBgMenu';
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
      input.onchange=function(ev){
        var file=ev.target.files[0];document.body.removeChild(input);if(!file)return;
        var reader=new FileReader();
        reader.onload=function(r){
          if(App.cropImage){
            App.cropImage(r.target.result,function(cropped){
              Chat._utils.compressImage(cropped,Chat._utils.MAX_BG_SIZE,Chat._utils.BG_QUALITY,function(c){Chat.setChatBg(c);});
            });
          } else {
            Chat._utils.compressImage(r.target.result,Chat._utils.MAX_BG_SIZE,Chat._utils.BG_QUALITY,function(c){Chat.setChatBg(c);});
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();return;
    }
    if(act==='url'){
      ChatUI._showUrlInput('输入背景图URL',function(url){
        if(!url)return;
        Chat.setChatBg(url);
      });
    }
  });
});
},

init:function(){App.chatUI=ChatUI;}
};

App.register('chatUI',ChatUI);
})();
