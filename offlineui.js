
(function(){
'use strict';
var App=window.App;if(!App)return;

var ROBOT_SVG='<svg class="ct-robot-svg" viewBox="0 0 64 64" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="32" y1="14" x2="32" y2="10" stroke="#7a9ab8" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#7a9ab8"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#7a9ab8"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#7a9ab8"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';
var STOP_SVG='<svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';
var SEND_SVG='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#7a9ab8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

var CTX_ICONS={
  copy:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  edit:'<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  regen:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg>',
  del:'<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  delafter:'<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>'
};

function fmtTime(ts){var d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}

var OfflineUI={

render:function(panel,charData){
  var c=charData;
  var displayName=c.name||'';
  var bgUrl=App.LS.get('offlineBg_'+c.id)||'';
  var tintOn=App.LS.get('offlineTint_'+c.id);if(tintOn===null)tintOn=true;
  var tintCSS='background:radial-gradient(circle at 50% 48%,rgba(126,163,201,.48) 0%,rgba(126,163,201,.14) 38%,transparent 62%);';

  panel.style.cssText='position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:#fff;transform:translateX(100%);opacity:0;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;';

  panel.innerHTML=
  '<div style="position:relative;flex:1;display:flex;flex-direction:column;overflow:hidden;">'+
    '<div class="ct-no-bg'+(bgUrl?' has-bg':'')+'" id="olNoBg"></div>'+
    '<div class="ct-bg" id="olBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');':'')+'"></div>'+
    '<div class="ct-tint'+(tintOn?'':' off')+'" id="olTint" style="'+tintCSS+'"></div>'+
    '<div class="ct-glass"></div>'+

    '<div class="ct-hd" style="position:relative;z-index:10;flex-shrink:0;padding-top:env(safe-area-inset-top,44px);">'+
      '<button class="ct-hd-btn" id="olBack" type="button"><svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke-width:3;"><path d="M15 18l-6-6 6-6"/></svg></button>'+
      '<div class="ct-hd-name" id="olName">'+App.esc(displayName)+'</div>'+
      '<button class="ct-hd-btn" id="olMenuBtn" type="button"><svg viewBox="0 0 28 24"><circle cx="4" cy="12" r="2.2" fill="#1a1a1a" stroke="none"/><circle cx="14" cy="12" r="2.2" fill="#1a1a1a" stroke="none"/><circle cx="24" cy="12" r="2.2" fill="#1a1a1a" stroke="none"/></svg></button>'+
    '</div>'+

    '<div class="ct-msgs" id="olMsgs" style="position:relative;z-index:5;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 14px 14px;min-height:0;"></div>'+

    '<div class="ct-plus-panel" id="olPlusPanel">'+
      '<div class="ct-plus-item" id="olPiScene"><div class="ct-plus-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="ct-plus-label">场景</div></div>'+
      '<div class="ct-plus-item" id="olPiBg"><div class="ct-plus-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div><div class="ct-plus-label">背景</div></div>'+
      '<div class="ct-plus-item" id="olPiClear"><div class="ct-plus-icon"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div><div class="ct-plus-label">清空</div></div>'+
    '</div>'+

    '<div class="ct-input-wrap" style="position:relative;z-index:10;display:flex;align-items:flex-end;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom,8px));flex-shrink:0;">'+
      '<button class="ct-plus-btn" id="olPlusBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>'+
      '<textarea class="ct-input" id="olInput" placeholder="输入内容..." rows="1"></textarea>'+
      '<button id="olRobot" type="button" style="width:44px;height:44px;border-radius:50%;background:none;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;">'+ROBOT_SVG+'</button>'+
      '<button id="olSend" type="button" style="width:40px;height:44px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;">'+SEND_SVG+'</button>'+
    '</div>'+
  '</div>';
},

renderMessages:function(){
  var OL=App.offline;if(!OL)return;
  var container=App.$('#olMsgs');if(!container)return;
  var c=OL.charData,user=App.user?App.user.getActiveUser():null;
  var avShape=App.LS.get('offlineAvShape_'+OL.charId)||'square';
  var avHide=App.LS.get('offlineAvHide_'+OL.charId)||false;
  var avClass=avShape==='round'?' round':'';
  if(avHide)avClass+=' hide-av';

  if(!OL.messages.length){
    container.innerHTML='<div class="ct-empty-text">线下剧情模式<br>开始互动吧</div>';
    return;
  }

  var html='';var floor=0;

  OL.messages.forEach(function(msg,idx){
    if(msg.role==='system'){html+='<div class="ct-sys">'+App.esc(msg.content)+'</div>';return;}
    floor++;
    var isUser=msg.role==='user';
    var av='';
    if(isUser){av=user&&user.avatar?'<img src="'+App.escAttr(user.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}
    else{av=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}

    var timeStr=msg.ts?fmtTime(msg.ts):'';
    var text=(msg.content||'').trim();if(!text)return;

    var showTimeSep=false;
    if(msg.ts){var prevMsg=null;for(var pi=idx-1;pi>=0;pi--){if(OL.messages[pi].role!=='system'){prevMsg=OL.messages[pi];break;}}if(!prevMsg||!prevMsg.ts||msg.ts-prevMsg.ts>300000)showTimeSep=true;}
    if(showTimeSep&&timeStr)html+='<div class="ct-time-sep">'+timeStr+'</div>';

    var bubbleContent=App.esc(text).replace(/\n/g,'<br>');
    var metaHtml='<div class="ct-msg-meta"><span class="ct-msg-floor">#'+floor+'</span><span class="ct-msg-time">'+timeStr+'</span></div>';

    html+='<div class="ct-msg '+(isUser?'user':'ai')+'" data-msg-idx="'+idx+'"><div class="ct-msg-av'+avClass+'">'+av+'</div><div class="ct-bubble-wrap"><div class="ct-bubble">'+bubbleContent+'</div>'+metaHtml+'</div></div>';
  });

  if(OL.isStreaming){
    var sav=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
    html+='<div class="ct-msg ai" id="olStreamMsg"><div class="ct-msg-av'+avClass+'">'+sav+'</div><div class="ct-bubble-wrap"><div class="ct-bubble" id="olStreamBubble"><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span></div></div></div>';
  }

  container.innerHTML=html;
  OL.scrollBottom();
},

bindEvents:function(panel){
  var OL=App.offline;if(!OL)return;
  OL._plusOpen=false;

  App.safeOn('#olBack','click',function(){OL.close();});
  App.safeOn('#olMenuBtn','click',function(e){e.stopPropagation();if(OL._menuEl){OL.dismissMenu();return;}OfflineUI.showMenu();});

  var input=App.$('#olInput');
  if(input){
    input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px';});
    input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!('ontouchstart' in window)){e.preventDefault();OL.send();}});
  }

  App.safeOn('#olSend','click',function(e){e.stopPropagation();OL.send();});

  App.safeOn('#olRobot','click',function(e){
    e.stopPropagation();
    if(OL.isStreaming){OL.stopStream();return;}
    OL.isStreaming=true;OL.renderMessages();OL.updateSendBtn();OL.updateTyping(true);
    OL.requestProactive();
  });

  App.safeOn('#olPlusBtn','click',function(e){
    e.stopPropagation();
    var pp=App.$('#olPlusPanel');if(!pp)return;
    OL._plusOpen=!OL._plusOpen;
    if(OL._plusOpen)pp.classList.add('show');else pp.classList.remove('show');
  });

  App.safeOn('#olPiScene','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}OfflineUI.showSceneDialog();});
  App.safeOn('#olPiBg','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}OfflineUI.showBgMenu();});
  App.safeOn('#olPiClear','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}if(!confirm('确定清空所有记录？'))return;OL.messages=[];OL.saveMsgs();OL.renderMessages();App.showToast('已清空');});

  var mc=App.$('#olMsgs');
  if(mc){
    var lt=null,lTarget=null,moved=false;
    mc.addEventListener('touchstart',function(e){
      var b=e.target.closest('.ct-bubble'),m=e.target.closest('.ct-msg');if(!b||!m)return;moved=false;
      var t=e.touches[0];lTarget={el:m,x:t.clientX,y:t.clientY};
      lt=setTimeout(function(){if(lTarget&&!moved){if(navigator.vibrate)navigator.vibrate(15);OfflineUI.showCtxMenu(lTarget.el,lTarget.x,lTarget.y);}},500);
    },{passive:true});
    mc.addEventListener('touchmove',function(){moved=true;clearTimeout(lt);lTarget=null;},{passive:true});
    mc.addEventListener('touchend',function(){clearTimeout(lt);lTarget=null;},{passive:true});
  }

  if(mc)mc.addEventListener('click',function(){OL.dismissMenu();OL.dismissCtx();OL.dismissAvCard();var pp=App.$('#olPlusPanel');if(pp&&OL._plusOpen){pp.classList.remove('show');OL._plusOpen=false;}});
},

updateSendBtn:function(){
  var OL=App.offline;if(!OL)return;
  var btn=App.$('#olRobot');if(!btn)return;
  if(OL.isStreaming){
    btn.style.background='rgba(201,112,107,.85)';
    btn.style.width='32px';
    btn.style.height='32px';
    btn.innerHTML=STOP_SVG;
  } else {
    btn.style.background='none';
    btn.style.width='44px';
    btn.style.height='44px';
    btn.innerHTML=ROBOT_SVG;
  }
},

updateTyping:function(show){
  var OL=App.offline;if(!OL)return;
  var el=App.$('#olName');if(!el)return;
  var displayName=OL.charData?OL.charData.name:'';
  if(show)el.innerHTML=App.esc(displayName)+'<div class="ct-hd-typing">对方正在输入...</div>';
  else el.textContent=displayName;
},

showMenu:function(){
  var OL=App.offline;if(!OL)return;
  OL.dismissMenu();
  var tintOn=App.LS.get('offlineTint_'+OL.charId);if(tintOn===null)tintOn=true;
  var currentMode=OL.mode;

  var menu=document.createElement('div');menu.className='ct-hd-menu show';
  menu.innerHTML=
    '<div class="ct-hd-mi" data-act="modeSwitch"><span>模式</span><span style="font-size:11px;color:rgba(255,255,255,.5);">'+(currentMode==='short'?'短言':'长文')+'</span></div>'+
    (currentMode==='long'?'<div class="ct-hd-mi" data-act="wordcount"><span>字数</span><span style="font-size:11px;color:rgba(255,255,255,.5);">'+OL.wordCount+'字</span></div>':'')+
    '<div class="ct-hd-mi" data-act="avatar"><span>头像设置</span></div>'+
    '<div class="ct-hd-mi" data-act="bg"><span>上传背景图</span></div>'+
    '<div class="ct-hd-mi" data-act="tint"><span>晕染</span><div class="ct-sw-track '+(tintOn?'on':'off')+'" id="olTintSw"></div></div>'+
    '<div class="ct-hd-mi" data-act="scene"><span>场景 / 时间线</span></div>'+
    '<div class="ct-hd-mi" data-act="clear"><span>清空记录</span></div>';

  var btn=App.$('#olMenuBtn');
  if(btn){var rect=btn.getBoundingClientRect();menu.style.top=(rect.bottom+4)+'px';menu.style.right=(window.innerWidth-rect.right)+'px';}
  document.body.appendChild(menu);OL._menuEl=menu;

  menu.addEventListener('click',function(e){e.stopPropagation();});
  menu.querySelectorAll('.ct-hd-mi').forEach(function(item){
    item.addEventListener('click',function(e){
      e.stopPropagation();var act=item.dataset.act;

      if(act==='tint'){
        var cur=App.LS.get('offlineTint_'+OL.charId);if(cur===null)cur=true;var next=!cur;
        App.LS.set('offlineTint_'+OL.charId,next);
        var tint=App.$('#olTint'),sw=App.$('#olTintSw');
        if(tint){if(next)tint.classList.remove('off');else tint.classList.add('off');}
        if(sw){sw.classList.toggle('on',next);sw.classList.toggle('off',!next);}
        return;
      }

      OL.dismissMenu();

      if(act==='modeSwitch'){
        var newMode=OL.mode==='short'?'long':'short';
        OL.setMode(newMode);
        App.showToast('已切换：'+(newMode==='short'?'短言模式':'长文模式'));
        return;
      }

      if(act==='wordcount'){
        var wc=prompt('设置长文字数（100 起，不设上限）：',OL.wordCount);
        if(wc===null)return;wc=parseInt(wc);
        if(isNaN(wc)||wc<100){App.showToast('请输入 100 以上的数字');return;}
        OL.setWordCount(wc);App.showToast('已设置：'+wc+'字');
        return;
      }

      if(act==='avatar'){OfflineUI.showAvCard();return;}
      if(act==='bg'){OfflineUI.showBgMenu();return;}
      if(act==='scene'){OfflineUI.showSceneDialog();return;}
      if(act==='clear'){if(!confirm('确定清空所有记录？'))return;OL.messages=[];OL.saveMsgs();OL.renderMessages();App.showToast('已清空');}
    });
  });
},

showAvCard:function(){
  var OL=App.offline;if(!OL)return;
  OL.dismissAvCard();
  var curShape=App.LS.get('offlineAvShape_'+OL.charId)||'square';
  var curHide=App.LS.get('offlineAvHide_'+OL.charId)||false;
  var card=document.createElement('div');card.className='ct-av-card show';
  card.innerHTML='<div class="ct-av-section"><div class="ct-av-label">形状</div><div class="ct-av-opts"><div class="ct-av-opt'+(curShape==='square'?' active':'')+'" data-shape="square">方形</div><div class="ct-av-opt'+(curShape==='round'?' active':'')+'" data-shape="round">圆形</div></div></div><div class="ct-av-section"><div class="ct-av-label">显示</div><div class="ct-av-opts"><div class="ct-av-opt'+(!curHide?' active':'')+'" data-vis="show">显示</div><div class="ct-av-opt'+(curHide?' active':'')+'" data-vis="hide">隐藏</div></div></div>';
  var btn=App.$('#olMenuBtn');if(btn){var rect=btn.getBoundingClientRect();card.style.top=(rect.bottom+4)+'px';card.style.right=(window.innerWidth-rect.right)+'px';}
  document.body.appendChild(card);OL._avCard=card;
  card.addEventListener('click',function(e){e.stopPropagation();});
  card.querySelectorAll('[data-shape]').forEach(function(opt){opt.addEventListener('click',function(){card.querySelectorAll('[data-shape]').forEach(function(o){o.classList.remove('active');});opt.classList.add('active');App.LS.set('offlineAvShape_'+OL.charId,opt.dataset.shape);OL.renderMessages();});});
  card.querySelectorAll('[data-vis]').forEach(function(opt){opt.addEventListener('click',function(){card.querySelectorAll('[data-vis]').forEach(function(o){o.classList.remove('active');});opt.classList.add('active');App.LS.set('offlineAvHide_'+OL.charId,opt.dataset.vis==='hide');OL.renderMessages();});});
},

showCtxMenu:function(msgEl,x,y){
  var OL=App.offline;if(!OL)return;
  OL.dismissCtx();
  var idx=parseInt(msgEl.dataset.msgIdx);if(isNaN(idx))return;
  var msg=OL.messages[idx];if(!msg)return;
  var isUser=msg.role==='user';
  var menu=document.createElement('div');menu.className='ct-ctx';
  var items='';
  items+='<div class="ct-ctx-item" data-act="copy">'+CTX_ICONS.copy+'<span>复制</span></div>';
  items+='<div class="ct-ctx-item" data-act="edit">'+CTX_ICONS.edit+'<span>编辑</span></div>';
  if(!isUser){items+='<div class="ct-ctx-item" data-act="regen">'+CTX_ICONS.regen+'<span>重新生成</span></div>';}
  items+='<div class="ct-ctx-item" data-act="del">'+CTX_ICONS.del+'<span>删除</span></div>';
  items+='<div class="ct-ctx-item" data-act="delafter">'+CTX_ICONS.delafter+'<span>往后全删</span></div>';
  menu.innerHTML=items;

  var mw=260,mh=120;
  var left=Math.max(8,Math.min(x-mw/2,window.innerWidth-mw-8));
  var top=y-mh-10;if(top<60)top=y+10;
  menu.style.left=left+'px';menu.style.top=top+'px';
  document.body.appendChild(menu);OL._ctxMenu=menu;

  menu.querySelectorAll('.ct-ctx-item').forEach(function(item){
    item.addEventListener('click',function(e){
      e.stopPropagation();var act=item.dataset.act;OL.dismissCtx();
      if(act==='copy')OL.copyMsg(idx);
      else if(act==='del')OL.deleteMsg(idx);
      else if(act==='delafter')OL.deleteFromHere(idx);
      else if(act==='edit')OL.editMsg(idx);
      else if(act==='regen')OL.regenerate(idx);
    });
  });
},

showEditDialog:function(idx){
  var OL=App.offline;if(!OL)return;
  var msg=OL.messages[idx];if(!msg)return;
  var overlay=document.createElement('div');overlay.className='ct-edit-overlay';
  overlay.innerHTML='<div class="ct-edit-panel"><div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;margin-bottom:12px;">编辑消息</div><textarea class="ct-edit-ta" id="olEditTA">'+App.esc(msg.content)+'</textarea><div class="ct-edit-btns"><button class="ct-edit-btn" id="olEditSave" type="button" style="background:#1a1a1a;color:#fff;">保存</button><button class="ct-edit-btn" id="olEditCancel" type="button" style="background:#f5f5f5;color:#666;border:1px solid #ddd;">取消</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  overlay.querySelector('#olEditCancel').addEventListener('click',function(){overlay.remove();});
  overlay.querySelector('#olEditSave').addEventListener('click',function(){var val=overlay.querySelector('#olEditTA').value.trim();if(!val){App.showToast('内容不能为空');return;}OL.messages[idx].content=val;OL.saveMsgs();OL.renderMessages();overlay.remove();});
},

showSceneDialog:function(){
  var OL=App.offline;if(!OL)return;
  var current=App.LS.get('offlineScene_'+OL.charId)||'';
  var overlay=document.createElement('div');overlay.className='ct-scene-overlay';
  overlay.innerHTML='<div class="ct-scene-panel"><div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;margin-bottom:12px;">当前场景 / 时间线</div><div style="font-size:11px;color:#8aa0b8;margin-bottom:10px;line-height:1.5;">描述当前的时间、地点、剧情背景等。</div><textarea class="ct-scene-ta" id="olSceneTA" placeholder="例如：深夜的酒吧包厢，外面下着大雨...">'+App.esc(current)+'</textarea><div class="ct-edit-btns"><button class="ct-edit-btn" id="olSceneSave" type="button" style="background:#1a1a1a;color:#fff;">保存</button><button class="ct-edit-btn" id="olSceneClear" type="button" style="background:#f5f5f5;color:#999;border:1px solid #ddd;">清空</button><button class="ct-edit-btn" id="olSceneCancel" type="button" style="background:#f5f5f5;color:#666;border:1px solid #ddd;">取消</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  overlay.querySelector('#olSceneCancel').addEventListener('click',function(){overlay.remove();});
  overlay.querySelector('#olSceneClear').addEventListener('click',function(){App.LS.remove('offlineScene_'+OL.charId);overlay.remove();App.showToast('已清空');});
  overlay.querySelector('#olSceneSave').addEventListener('click',function(){var val=overlay.querySelector('#olSceneTA').value.trim();if(val)App.LS.set('offlineScene_'+OL.charId,val);else App.LS.remove('offlineScene_'+OL.charId);overlay.remove();App.showToast('已保存');});
},

showBgMenu:function(){
  var OL=App.offline;if(!OL)return;
  var menu=document.createElement('div');
  menu.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
  menu.innerHTML='<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;"><div style="font-size:13px;font-weight:700;color:#333;text-align:center;">线下背景</div><button data-act="album" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择</button><button data-act="url" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button><button data-act="del" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:12px;color:#bbb;cursor:pointer;font-family:inherit;">移除背景</button><button data-act="cancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button></div>';
  document.body.appendChild(menu);
  menu.addEventListener('click',function(e){if(e.target===menu)menu.remove();});
  menu.querySelectorAll('button').forEach(function(btn){
    btn.addEventListener('click',function(e){e.stopPropagation();var act=btn.dataset.act;menu.remove();
      if(act==='cancel')return;
      if(act==='del'){App.LS.remove('offlineBg_'+OL.charId);var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='';var nb=App.$('#olNoBg');if(nb)nb.classList.remove('has-bg');App.showToast('已移除');return;}
      if(act==='album'){var input=document.createElement('input');input.type='file';input.accept='image/*';document.body.appendChild(input);input.onchange=function(ev){var file=ev.target.files[0];document.body.removeChild(input);if(!file)return;var reader=new FileReader();reader.onload=function(r){if(App.cropImage){App.cropImage(r.target.result,function(cropped){OL.setChatBg(cropped);});}else{OL.setChatBg(r.target.result);}};reader.readAsDataURL(file);};input.click();return;}
      if(act==='url'){var val=prompt('输入背景图URL：');if(val&&val.trim())OL.setChatBg(val.trim());}
    });
  });
},

init:function(){App.offlineUI=OfflineUI;}
};

App.offlineUI=OfflineUI;
App.register('offlineUI',OfflineUI);
})();
