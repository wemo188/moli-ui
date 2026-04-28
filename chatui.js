(function(){
'use strict';
var App=window.App;if(!App)return;

var ROBOT_SVG='<svg viewBox="0 0 64 64" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="32" y1="14" x2="32" y2="10" stroke="#1f2b38" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#1f2b38"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#1f2b38"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#1f2b38"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#1f2b38"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';
var STOP_SVG='<svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';

var TINT_CSS='background:'+
'radial-gradient(circle at 50% 48%,rgba(126,163,201,.48) 0%,rgba(126,163,201,.28) 18%,rgba(126,163,201,.14) 38%,transparent 62%),'+
'radial-gradient(circle at 46% 44%,rgba(140,180,215,.22) 0%,rgba(140,180,215,.10) 28%,transparent 52%),'+
'radial-gradient(ellipse at 56% 54%,rgba(170,200,228,.18) 0%,transparent 48%);';

var ChatUI={

render:function(inner,charData,bgUrl,hasBg,tintOn,isFS){
var c=charData;
inner.innerHTML=
'<div class="ct-root" id="ctRoot" style="'+(isFS?'border-radius:0;':'')+'">'+
'<div class="ct-no-bg'+(hasBg?' has-bg':'')+'" id="ctNoBg"></div>'+
'<div class="ct-bg" id="ctBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');':'')+'"></div>'+
'<div class="ct-tint'+(tintOn?'':' off')+'" id="ctTint" style="'+TINT_CSS+'"></div>'+
'<div class="ct-glass"></div>'+
'<div class="ct-swipe-indicator" id="ctSwipeInd"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></div>'+
'<div class="ct-hd">'+
  '<button class="ct-hd-btn" id="ctBack" type="button"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>'+
  '<div class="ct-hd-name" id="ctName">'+App.esc(c.name||'')+'</div>'+
  '<button class="ct-hd-btn" id="ctMenuBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2" fill="#1a1a1a" stroke="none"/><circle cx="12" cy="12" r="2" fill="#1a1a1a" stroke="none"/><circle cx="18" cy="12" r="2" fill="#1a1a1a" stroke="none"/></svg></button>'+
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
  {id:'piLocation',icon:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',label:'位置'}
];
return items.map(function(it){return '<div class="ct-plus-item" id="'+it.id+'"><div class="ct-plus-icon"><svg viewBox="0 0 24 24">'+it.icon+'</svg></div><div class="ct-plus-label">'+it.label+'</div></div>';}).join('');
},

renderMessages:function(){
var Chat=App.chat;if(!Chat)return;
var container=App.$('#ctMsgs');if(!container)return;
var c=Chat.charData,user=App.user?App.user.getActiveUser():null;
var utils=Chat._utils;
var avMode=Chat._avatarMode||'square';

if(!Chat.messages.length){
  var greeting=c&&c.greeting?c.greeting:'';
  container.innerHTML=greeting?'<div class="ct-greeting">'+App.esc(greeting)+'</div>':'<div class="ct-empty-text">开始聊天吧</div>';
  return;
}

// 按角色分组连续消息（同角色连续多条只显示第一条头像）
var html='';
var lastTs=0;
var prevRole='';

Chat.messages.forEach(function(msg,idx){
  if(msg.role==='system'){html+='<div class="ct-sys">'+App.esc(msg.content)+'</div>';prevRole='';return;}

  var isUser=msg.role==='user';
  var role=isUser?'user':'ai';

  // 判断是否为该角色连续消息的最后一条
  var isLastInGroup=true;
  if(idx+1<Chat.messages.length){
    var next=Chat.messages[idx+1];
    if(next.role===msg.role)isLastInGroup=false;
  }

  // 头像：连续消息中只有第一条显示头像
  var showAvatar=prevRole!==role;
  var av='';
  if(isUser){av=user&&user.avatar?'<img src="'+App.escAttr(user.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}
  else{av=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}

  var avClass='ct-msg-av';
  if(avMode==='circle')avClass+=' circle';
  if(avMode==='hidden'||!showAvatar)avClass+=' hidden-av';

  // 时间戳：每组最后一条消息显示
  var showTime=false;
  if(isLastInGroup&&msg.ts){
    if(msg.ts-lastTs>300000)showTime=true;
    else if(isLastInGroup)showTime=true;
  }
  if(msg.ts&&isLastInGroup)lastTs=msg.ts;

  var text=(msg.content||'').trim();
  if(!text){prevRole=role;return;}

  var bubbleContent='';
  var isVoice=false;
  var voiceText='';

  // 语音消息
  var voiceMatch=text.match(/\[voice:([^\]]+)\]/);
  if(voiceMatch){
    voiceText=voiceMatch[1];
    text=text.replace(voiceMatch[0],'').trim();
    isVoice=true;
    var dur=Math.max(2,Math.round(voiceText.length*0.3));
    bubbleContent+='<div class="ct-voice-bubble" data-voice-text="'+App.escAttr(voiceText)+'" data-idx="'+idx+'"><div class="ct-voice-waves"><div class="ct-voice-wave w1"></div><div class="ct-voice-wave w2"></div><div class="ct-voice-wave w3"></div></div><span class="ct-voice-dur">'+dur+'″</span></div>';
    bubbleContent+='<div class="ct-voice-text" id="ctVoiceText'+idx+'">'+App.esc(voiceText)+'</div>';
  }

  // 表情包
  var stickerMatch=text.match(/\[sticker:([^\]]+)\]/);
  if(stickerMatch){
    var desc=stickerMatch[1];
    text=text.replace(stickerMatch[0],'').trim();
    var cacheKey='stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30);
    var stickerUrl=App.LS.get(cacheKey);
    if(stickerUrl){bubbleContent+='<img class="ct-sticker" src="'+App.escAttr(stickerUrl)+'" alt="sticker">';}
    else{bubbleContent+='<div class="ct-sticker-loading" id="stk_'+idx+'" data-desc="'+App.escAttr(desc)+'" style="width:80px;height:80px;border-radius:8px;background:rgba(200,220,240,.15);display:flex;align-items:center;justify-content:center;font-size:11px;color:#8aa0b8;">生成中...</div>';}
  }

  if(text&&!isVoice)bubbleContent+=App.esc(text);
  if(!bubbleContent){prevRole=role;return;}

  // 元信息只在组内最后一条显示
  var metaHtml='';
  if(isLastInGroup){
    var timeStr=msg.ts?utils.fmtTime(msg.ts):'';
    metaHtml='<div class="ct-msg-meta">';
    if(isUser)metaHtml+='<span class="ct-msg-read">已读</span>';
    if(showTime)metaHtml+='<span>'+timeStr+'</span>';
    metaHtml+='</div>';
  }

  html+='<div class="ct-msg '+role+'" data-msg-idx="'+idx+'"><div class="'+avClass+'">'+av+'</div><div class="ct-bubble-wrap"><div class="ct-bubble">'+bubbleContent+'</div>'+metaHtml+'</div></div>';
  prevRole=role;
});

if(Chat.isStreaming&&!Chat._backgroundMode){
  var sav=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
  var savClass='ct-msg-av';if(avMode==='circle')savClass+=' circle';if(avMode==='hidden')savClass+=' hidden-av';
  html+='<div class="ct-msg ai" id="ctStreamMsg"><div class="'+savClass+'">'+sav+'</div><div class="ct-bubble-wrap"><div class="ct-bubble" id="ctStreamBubble"><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span></div></div></div>';
}

container.innerHTML=html;
Chat.scrollBottom();

// 表情包自动生成
var cfg2=Chat._utils.getCfg(Chat.charId);
container.querySelectorAll('.ct-sticker-loading').forEach(function(el){
  var desc=el.dataset.desc;if(!desc)return;
  Chat._utils.generateSticker(desc,cfg2,function(url){
    if(url){App.LS.set('stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30),url);el.outerHTML='<img class="ct-sticker" src="'+App.escAttr(url)+'" alt="sticker">';}
    else{el.innerHTML='['+App.esc(desc)+']';el.style.width='auto';el.style.height='auto';}
  });
});

// 语音消息绑定
container.querySelectorAll('.ct-voice-bubble').forEach(function(vb){
  vb.addEventListener('click',function(e){
    e.stopPropagation();
    var idx2=vb.dataset.idx;
    var textEl=App.$('#ctVoiceText'+idx2);
    var vt=vb.dataset.voiceText||'';

    // 播放状态切换
    vb.classList.toggle('playing');
    if(textEl)textEl.classList.toggle('show');

    // TTS播放
    if(vb.classList.contains('playing')&&vt){
      Chat._utils.speakTTS(vt,Chat._utils.getCfg(Chat.charId));
      var dur=Math.max(2,Math.round(vt.length*0.3));
      setTimeout(function(){vb.classList.remove('playing');},dur*1000);
    } else {
      if('speechSynthesis' in window)speechSynthesis.cancel();
    }
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

// 加号面板
ChatUI._bindPlusActions();

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

// 滑动返回
ChatUI._bindSwipeBack();
},

_bindPlusActions:function(){
var Chat=App.chat;

['piPhoto','piSticker','piVoiceMsg','piVoiceCall','piVideoCall','piRedPacket','piTransfer','piLocation'].forEach(function(id){
  App.safeOn('#'+id,'click',function(e){
    e.stopPropagation();
    var pp=App.$('#ctPlusPanel');if(pp){pp.classList.remove('show');Chat._plusOpen=false;}

    if(id==='piPhoto'){
      ChatUI._showImagePicker(function(src){if(src)Chat.sendSpecial('图片','用户发送了一张图片');});
      return;
    }
    if(id==='piSticker'){
      ChatUI._showImagePicker(function(src){if(src)Chat.sendSpecial('表情包','用户发送了一个表情包');});
      return;
    }
    if(id==='piVoiceMsg'){Chat.sendSpecial('语音消息','用户发送了一条语音消息');return;}
    if(id==='piVoiceCall'){Chat.sendSpecial('语音通话','用户发起了语音通话');return;}
    if(id==='piVideoCall'){Chat.sendSpecial('视频通话','用户发起了视频通话');return;}
    if(id==='piRedPacket'){
      ChatUI._showAmountInput('发红包','金额','发送',function(amount,note){
        Chat.sendSpecial('红包','用户发了一个'+(amount||'')+'元红包'+(note?' 备注:'+note:''));
      });return;
    }
    if(id==='piTransfer'){
      ChatUI._showAmountInput('转账','金额','转账',function(amount,note){
        Chat.sendSpecial('转账','用户转账'+(amount||'')+'元'+(note?' 备注:'+note:''));
      });return;
    }
    if(id==='piLocation'){
      Chat.sendSpecial('位置','用户分享了当前位置');return;
    }
  });
});
},

_showAmountInput:function(title,placeholder,btnText,callback){
var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
overlay.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">'+
  '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;">'+App.esc(title)+'</div>'+
  '<input type="number" id="_amtInput" placeholder="'+App.escAttr(placeholder)+'" style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;outline:none;font-family:inherit;color:#333;text-align:center;">'+
  '<input type="text" id="_amtNote" placeholder="备注（可选）" style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
  '<button id="_amtOk" type="button" style="padding:12px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">'+App.esc(btnText)+'</button>'+
  '<button id="_amtNo" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>'+
'</div>';
document.body.appendChild(overlay);
overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
overlay.querySelector('#_amtNo').addEventListener('click',function(){overlay.remove();});
overlay.querySelector('#_amtOk').addEventListener('click',function(){
  var amt=overlay.querySelector('#_amtInput').value.trim();
  var note=overlay.querySelector('#_amtNote').value.trim();
  if(!amt){App.showToast('请输入金额');return;}
  overlay.remove();callback(amt,note);
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
        // URL图片也可以裁剪
        if(App.cropImage){
          var img=new Image();img.crossOrigin='anonymous';
          img.onload=function(){
            var canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
            canvas.getContext('2d').drawImage(img,0,0);
            var dataUrl=canvas.toDataURL('image/jpeg',0.9);
            App.cropImage(dataUrl,function(cropped){callback(cropped);});
          };
          img.onerror=function(){callback(url);};
          img.src=url;
        } else {callback(url);}
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
  '<input type="text" id="_urlInput" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;">'+
  '<div style="display:flex;gap:8px;">'+
    '<button id="_urlOk" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">确定</button>'+
    '<button id="_urlNo" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>'+
  '</div>'+
'</div>';
document.body.appendChild(urlPanel);
urlPanel.addEventListener('click',function(e){if(e.target===urlPanel){urlPanel.remove();callback(null);}});
urlPanel.querySelector('#_urlNo').addEventListener('click',function(){urlPanel.remove();callback(null);});
urlPanel.querySelector('#_urlOk').addEventListener('click',function(){
  var url=urlPanel.querySelector('#_urlInput').value.trim();
  urlPanel.remove();callback(url||null);
});
},

_bindSwipeBack:function(){
var Chat=App.chat;
var root=App.$('#ctRoot');if(!root)return;
var ind=App.$('#ctSwipeInd');
var sx=0,sy=0,dx=0,locked=false,isH=false;

root.addEventListener('touchstart',function(e){
  var t=e.touches[0];sx=t.clientX;sy=t.clientY;dx=0;locked=false;isH=false;
},{passive:true});

root.addEventListener('touchmove',function(e){
  var t=e.touches[0];
  dx=t.clientX-sx;
  var dy=Math.abs(t.clientY-sy);
  if(!locked&&(Math.abs(dx)>12||dy>12)){locked=true;isH=Math.abs(dx)>dy&&dx>0&&sx<40;}
  if(!isH)return;
  e.preventDefault();
  if(ind){ind.classList.add('show');ind.style.opacity=Math.min(dx/80,1);}
},{passive:false});

root.addEventListener('touchend',function(){
  if(ind)ind.classList.remove('show');
  if(isH&&dx>80)Chat.close();
  dx=0;locked=false;isH=false;
},{passive:true});
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
var isFS=App.LS.get('wxFullScreen')||false;

var menu=document.createElement('div');menu.className='ct-hd-menu show';
menu.innerHTML=
'<div class="ct-hd-mi" data-act="bg"><span>上传背景图</span></div>'+
'<div class="ct-hd-mi" data-act="tint"><span>晕染</span><div class="ct-sw-track '+(tintOn?'on':'off')+'" id="ctTintSw"></div></div>'+
'<div class="ct-hd-mi" data-act="avatar"><span>头像样式</span></div>'+
'<div class="ct-hd-mi" data-act="mode"><span>显示模式</span><span style="font-size:11px;color:#888;">'+(isFS?'全屏':'手机')+'</span></div>'+
'<div class="ct-hd-mi" data-act="scene"><span>场景设定</span></div>'+
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
    else if(act==='avatar')Chat.toggleAvatarMode();
    else if(act==='mode'){
      var cur2=App.LS.get('wxFullScreen')||false;
      App.LS.set('wxFullScreen',!cur2);
      // 重新打开聊天页面以应用
      Chat.close();
      setTimeout(function(){Chat.openInWechat(Chat.charId);},400);
    }
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
if(isUser)items+='<div class="ct-ctx-item" data-act="resend">重发</div>';
else items+='<div class="ct-ctx-item" data-act="regen">重新生成</div>';
items+='<div class="ct-ctx-item" data-act="quote">引用</div>';
items+='<div class="ct-ctx-item" data-act="share">转发</div>';
items+='<div class="ct-ctx-item" data-act="fav">收藏</div>';
items+='<div class="ct-ctx-item" data-act="del">删除</div>';
items+='<div class="ct-ctx-item" data-act="delafter">往后全删</div>';
menu.innerHTML=items;

var left=Math.min(x-10,window.innerWidth-270);if(left<6)left=6;
var top=y-80;if(top<60)top=60;if(top+100>window.innerHeight-60)top=window.innerHeight-160;
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
      var input=App.$('#ctInput');
      if(input){input.value='「'+msg.content.slice(0,50)+(msg.content.length>50?'...':'')+'」\n';input.focus();input.style.height='auto';input.style.height=Math.min(input.scrollHeight,100)+'px';}
    }
    else if(act==='fav'){
      var favs=App.LS.get('chatFavorites')||[];
      favs.push({content:msg.content,ts:msg.ts,charName:Chat.charData?Chat.charData.name:'',savedAt:Date.now()});
      App.LS.set('chatFavorites',favs);App.showToast('已收藏');
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
overlay.querySelector('#ctSceneClear').addEventListener('click',function(){App.LS.remove('chatScene_'+Chat.charId);overlay.remove();App.showToast('已清空');});
overlay.querySelector('#ctSceneSave').addEventListener('click',function(){var val=overlay.querySelector('#ctSceneTA').value.trim();if(val)App.LS.set('chatScene_'+Chat.charId,val);else App.LS.remove('chatScene_'+Chat.charId);overlay.remove();App.showToast('场景已保存');});
},

showBgMenu:function(){
var Chat=App.chat;if(!Chat)return;
var menu=document.createElement('div');
menu.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
menu.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;">'+
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
              Chat._utils.compressImage(cropped,Chat._utils.MAX_BG_SIZE,Chat._utils.BG_QUALITY,function(c2){Chat.setChatBg(c2);});
            });
          } else {
            Chat._utils.compressImage(r.target.result,Chat._utils.MAX_BG_SIZE,Chat._utils.BG_QUALITY,function(c2){Chat.setChatBg(c2);});
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();return;
    }
    if(act==='url'){
      ChatUI._showUrlInput('输入背景图URL',function(url){
        if(!url)return;Chat.setChatBg(url);
      });
    }
  });
});
},

init:function(){App.chatUI=ChatUI;}
};

App.register('chatUI',ChatUI);
})();