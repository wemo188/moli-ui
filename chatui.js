
(function(){
'use strict';
var App=window.App;if(!App)return;

var ROBOT_SVG='<svg viewBox="0 0 64 64" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="32" y1="14" x2="32" y2="10" stroke="#1f2b38" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#1f2b38"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#1f2b38"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#1f2b38"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#1f2b38"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';

var STOP_SVG='<svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';

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

  // 只在距离上一条消息超过5分钟时才显示时间
  var showTime=false;
  if(msg.ts&&(msg.ts-lastTs>300000)){showTime=true;}
  if(msg.ts)lastTs=msg.ts;

  var timeStr=msg.ts?utils.fmtTime(msg.ts):'';
  var text=(msg.content||'').trim();
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

  // 时间戳只在需要时显示（间隔超5分钟），且跟已读同一行
  var metaHtml='<div class="ct-msg-meta">';
  if(isUser){
    metaHtml+='<span class="ct-msg-read">已读</span>';
    if(showTime)metaHtml+='<span>'+timeStr+'</span>';
  } else {
    if(showTime)metaHtml+='<span>'+timeStr+'</span>';
  }
  metaHtml+='</div>';

  html+='<div class="ct-msg '+(isUser?'user':'ai')+'" data-msg-idx="'+idx+'"><div class="ct-msg-av">'+av+'</div><div class="ct-bubble-wrap"><div class="ct-bubble">'+bubbleContent+'</div>'+metaHtml+'</div></div>';
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
    else{el.innerHTML='['+App.esc(desc)+']';el.style.width='auto';el.style.height='auto';}
  });
});
},

bindEvents:function(){
var Chat=App.chat;if(!Chat)return;

App.safeOn('#ctBack','click',function(){Chat.close();});
App.safeOn('#ctMenuBtn','click',function(e){e.stopPropagation();if(Chat._menuEl){Chat.dismissMenu();return;}ChatUI.showMenu();});

var root=App.$('#ctRoot');
if(root)root.addEventListener('click',function(){Chat.dismissMenu();Chat.dismissCtx();var pp=App.$('#ctPlusPanel');if(pp&&Chat._plusOpen){pp.classList.remove('show');Chat._plusOpen=false;}});

var input=App.$('#ctInput');
if(input){
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px';});
  // 手机端回车=换行，桌面端回车=发送
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
  App.showToast('语音输入 · 开发中');
});

// 加号面板功能
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

    var labels={piSticker:'表情包',piVoiceMsg:'语音消息',piVoiceCall:'语音通话',piVideoCall:'视频通话',piRedPacket:'红包',piTransfer:'转账',piLocation:'位置'};
    App.showToast((labels[id]||'功能')+' · 开发中');
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
    lt=setTimeout(function(){if(lTarget&&!moved)ChatUI.showCtxMenu(lTarget.el,lTarget.x,lTarget.y);},500);
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
      var urlPanel=document.createElement('div');
      urlPanel.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
      urlPanel.innerHTML=
      '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
        '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;">输入图片URL</div>'+
        '<input id="piUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
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
        urlPanel.remove();
        if(!url){callback(null);return;}
        callback(url);
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
if(show)el.innerHTML=App.esc(c?c.name:'')+'<div class="ct-hd-typing">对方正在输入...</div>';
else el.textContent=c?c.name:'';
},

showMenu:function(){
var Chat=App.chat;if(!Chat)return;
Chat.dismissMenu();
var tintOn=App.LS.get('chatTint_'+Chat.charId);if(tintOn===null)tintOn=true;

var menu=document.createElement('div');menu.className='ct-hd-menu show';
menu.innerHTML=
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
    if(act==='bg')ChatUI.showBgMenu();
    else if(act==='scene')ChatUI.showSceneDialog();
    else if(act==='clear'){if(!confirm('确定清空所有聊天记录？'))return;Chat.messages=[];Chat.saveMsgs();Chat.renderMessages();App.showToast('已清空');}
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
items+='<div class="ct-ctx-item" data-act="copy">复制</div>';
items+='<div class="ct-ctx-item" data-act="edit">编辑</div>';
if(isUser){
  items+='<div class="ct-ctx-item" data-act="resend">重新发送</div>';
  items+='<div class="ct-ctx-item" data-act="share">转发</div>';
} else {
  items+='<div class="ct-ctx-item" data-act="regen">重新生成</div>';
}
items+='<div class="ct-ctx-item" data-act="quote">引用</div>';
items+='<div class="ct-ctx-item" data-act="fav">收藏</div>';
items+='<div class="ct-ctx-item" data-act="delafter">往后全删</div>';
items+='<div class="ct-ctx-item" data-act="del">删除</div>';
menu.innerHTML=items;

var left=Math.min(x,window.innerWidth-140),top=Math.min(y-10,window.innerHeight-350);if(top<60)top=60;
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
    else if(act==='quote'){
      // 引用：把引用内容填入输入框
      var input=App.$('#ctInput');
      if(input){
        var quoteText='「'+msg.content.slice(0,50)+(msg.content.length>50?'...':'')+'」\n';
        input.value=quoteText;
        input.focus();
        input.style.height='auto';
        input.style.height=Math.min(input.scrollHeight,100)+'px';
      }
    }
    else if(act==='fav'){
      var favs=App.LS.get('chatFavorites')||[];
      favs.push({content:msg.content,ts:msg.ts,charName:Chat.charData?Chat.charData.name:'',savedAt:Date.now()});
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
      var urlPanel=document.createElement('div');
      urlPanel.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
      urlPanel.innerHTML=
      '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
        '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;">输入背景图URL</div>'+
        '<input id="ctBgUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
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
        if(!url){App.showToast('请输入URL');return;}
        urlPanel.remove();Chat.setChatBg(url);
      });
    }
  });
});
},

init:function(){App.chatUI=ChatUI;}
};

App.register('chatUI',ChatUI);
})();
