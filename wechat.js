(function(){
'use strict';
var App=window.App;if(!App)return;

var TINT_CSS='background:'+
'radial-gradient(circle at 50% 48%,rgba(126,163,201,.48) 0%,rgba(126,163,201,.28) 18%,rgba(126,163,201,.14) 38%,transparent 62%),'+
'radial-gradient(circle at 46% 44%,rgba(140,180,215,.22) 0%,rgba(140,180,215,.10) 28%,transparent 52%),'+
'radial-gradient(ellipse at 56% 54%,rgba(170,200,228,.18) 0%,transparent 48%);';

var Wechat={
currentTab:'chat',panelEl:null,_savedInner:'',_swipedItem:null,

open:function(){
var panel=App.$('#wechatPanel');if(!panel)return;
Wechat.panelEl=panel;Wechat.currentTab='chat';
Wechat.render();
panel.classList.remove('hidden');
requestAnimationFrame(function(){panel.classList.add('show');});
},

close:function(){
var panel=App.$('#wechatPanel');if(!panel)return;
panel.classList.remove('show');
setTimeout(function(){panel.classList.add('hidden');},350);
},

isCharVisible:function(c){
if(!c.contactMode||c.contactMode==='direct')return true;
if(c.contactAccepted===true)return true;
return false;
},

render:function(){
var panel=Wechat.panelEl;if(!panel)return;
var isFS=App.LS.get('wxFullScreen')||false;

panel.innerHTML=
'<div class="'+(isFS?'wx-fullscreen':'')+'" id="wxWrap"><div class="wx-phone"><div class="wx-inner" id="wxInner">'+
'<div class="wx-header">'+
  '<button class="wx-header-btn" id="wxBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>'+
  '<div style="flex:1;"></div>'+
  '<div style="position:relative;">'+
    '<button class="wx-header-btn" id="wxAddBtn" type="button"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>'+
    '<div class="wx-add-menu" id="wxAddMenu">'+
      '<div class="wx-add-menu-item" data-action="addFriend"><span>加好友</span></div>'+
      '<div class="wx-add-menu-item" data-action="changeTheme"><span>更换主题</span></div>'+
    '</div>'+
  '</div>'+
'</div>'+
'<div class="wx-search"><div class="wx-search-bar"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><span>搜索</span></div></div>'+
'<div class="wx-body" id="wxBody"></div>'+
'<div class="wx-tabbar">'+
  Wechat._tab('chat','聊天','<path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="currentColor" stroke-width="2.2" fill="none"/><line x1="23" y1="28" x2="41" y2="28" stroke="currentColor" stroke-width="2"/><line x1="23" y1="34" x2="35" y2="34" stroke="currentColor" stroke-width="1.8"/>')+
  Wechat._tab('char','通讯录','<circle cx="32" cy="22" r="9" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M14 50c0-10 8-16 18-16s18 6 18 16" stroke="currentColor" stroke-width="2.4" fill="none"/>')+
  Wechat._tab('moments','朋友圈','<ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(120 32 32)"/>')+
  Wechat._tab('me','我的','<circle cx="32" cy="33" r="21" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" stroke="currentColor" stroke-width="1.6" fill="none"/>')+
'</div>'+
'</div></div></div>';

Wechat.renderTab();
Wechat.bindEvents();
},

_tab:function(id,label,svg){
return '<div class="wx-tab'+(Wechat.currentTab===id?' active':'')+'" data-tab="'+id+'"><svg viewBox="0 0 64 64" style="width:32px;height:32px;">'+svg+'</svg><span style="font-size:12px;">'+label+'</span></div>';
},

renderTab:function(){
var body=App.$('#wxBody');if(!body)return;
var search=Wechat.panelEl?Wechat.panelEl.querySelector('.wx-search'):null;

if(Wechat.currentTab==='me'){if(search)search.style.display='none';}
else{if(search)search.style.display='';}

if(Wechat.currentTab==='chat')Wechat.renderChatTab(body);
else if(Wechat.currentTab==='char')Wechat.renderCharTab(body);
else if(Wechat.currentTab==='moments')body.innerHTML='<div class="wx-empty"><svg viewBox="0 0 24 24" style="width:52px;height:52px;"><circle cx="12" cy="12" r="10"/></svg><div class="wx-empty-text">朋友圈 · 开发中</div></div>';
else if(Wechat.currentTab==='me')Wechat.renderMeTab(body);
},

renderChatTab:function(body){
var chars=App.character?App.character.list:[];
var visibleChars=chars.filter(function(c){return Wechat.isCharVisible(c);});
var pinned=App.LS.get('wxPinnedChats')||[];
var renamed=App.LS.get('wxRenamedChats')||{};

// 排序：置顶在前
visibleChars.sort(function(a,b){
  var ap=pinned.indexOf(a.id)>=0?0:1;
  var bp=pinned.indexOf(b.id)>=0?0:1;
  return ap-bp;
});

if(!visibleChars.length){
  body.innerHTML='<div class="wx-empty"><svg viewBox="0 0 24 24" style="width:52px;height:52px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="wx-empty-text">暂无聊天<br>请先添加角色</div></div>';
  return;
}

body.innerHTML=visibleChars.map(function(c){
  var isPinned=pinned.indexOf(c.id)>=0;
  var displayName=renamed[c.id]||c.name||'未命名';
  var avatarHtml=c.avatar?'<img src="'+App.escAttr(c.avatar)+'" alt="">':'<div class="wx-avatar-placeholder"><svg viewBox="0 0 24 24" style="width:26px;height:26px;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
  var lastMsg='',lastTime='';
  var msgs=App.LS.get('chatMsgs_'+c.id);
  if(msgs&&msgs.length){
    var last=msgs[msgs.length-1];
    lastMsg=(last.content||'').split('|||')[0].replace(/\[sticker:[^\]]+\]/,'[表情]').replace(/\[voice:[^\]]+\]/,'[语音]').slice(0,25);
    if(last.ts){var d=new Date(last.ts),now=new Date();lastTime=d.toDateString()===now.toDateString()?String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'):(d.getMonth()+1)+'/'+d.getDate();}
  }
  var unread=App.chat?App.chat.getUnread(c.id):0;
  var badgeHtml=unread>0?'<div class="ct-unread-badge">'+(unread>99?'99+':unread)+'</div>':'';
  return '<div class="wx-chat-item-wrap" data-char-id="'+c.id+'">'+
    '<div class="wx-chat-item" style="'+(isPinned?'background:rgba(126,163,201,.04);':'')+'">'+
      '<div class="wx-avatar" style="position:relative;width:56px;height:56px;">'+avatarHtml+badgeHtml+'</div>'+
      '<div class="wx-chat-content">'+
        '<div class="wx-chat-top"><span class="wx-chat-name" style="font-size:16px;">'+App.esc(displayName)+'</span><span style="font-size:11px;color:#a8c0d8;">'+lastTime+'</span></div>'+
        '<div class="wx-chat-msg" style="font-size:13.5px;">'+App.esc(lastMsg||'点击开始聊天')+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="wx-chat-item-actions">'+
      '<div class="wx-item-action pin" data-cid="'+c.id+'">'+(isPinned?'取消置顶':'置顶')+'</div>'+
      '<div class="wx-item-action rename" data-cid="'+c.id+'">备注</div>'+
    '</div>'+
  '</div>';
}).join('');

// 点击进入聊天
body.querySelectorAll('.wx-chat-item').forEach(function(item){
  item.addEventListener('click',function(){
    var wrap=item.closest('.wx-chat-item-wrap');
    if(wrap&&wrap.classList.contains('swiped'))return;
    var id=wrap?wrap.dataset.charId:null;
    if(id&&App.chat)App.chat.openInWechat(id);
  });
});

// 滑动操作
Wechat._bindChatSwipe(body);

// 置顶和备注
body.querySelectorAll('.wx-item-action.pin').forEach(function(btn){
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    var cid=btn.dataset.cid;
    var pins=App.LS.get('wxPinnedChats')||[];
    var idx=pins.indexOf(cid);
    if(idx>=0)pins.splice(idx,1);else pins.push(cid);
    App.LS.set('wxPinnedChats',pins);
    Wechat.renderTab();
    App.showToast(idx>=0?'已取消置顶':'已置顶');
  });
});

body.querySelectorAll('.wx-item-action.rename').forEach(function(btn){
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    var cid=btn.dataset.cid;
    var renamed2=App.LS.get('wxRenamedChats')||{};
    var current=renamed2[cid]||'';
    var name=prompt('设置备注名',current);
    if(name===null)return;
    if(name.trim())renamed2[cid]=name.trim();else delete renamed2[cid];
    App.LS.set('wxRenamedChats',renamed2);
    Wechat.renderTab();
  });
});
},

_bindChatSwipe:function(body){
var wraps=body.querySelectorAll('.wx-chat-item-wrap');
wraps.forEach(function(wrap){
  var sx=0,dx=0,locked=false,isH=false;
  wrap.addEventListener('touchstart',function(e){
    sx=e.touches[0].clientX;dx=0;locked=false;isH=false;
    // 关闭之前打开的
    if(Wechat._swipedItem&&Wechat._swipedItem!==wrap){Wechat._swipedItem.classList.remove('swiped');Wechat._swipedItem=null;}
  },{passive:true});
  wrap.addEventListener('touchmove',function(e){
    var t=e.touches[0];dx=t.clientX-sx;
    var dy=Math.abs(t.clientY-e.touches[0].clientY);
    if(!locked&&(Math.abs(dx)>10||dy>10)){locked=true;isH=Math.abs(dx)>dy;}
    if(!isH)return;
    e.preventDefault();
  },{passive:false});
  wrap.addEventListener('touchend',function(){
    if(isH&&dx<-50){wrap.classList.add('swiped');Wechat._swipedItem=wrap;}
    else if(isH&&dx>30){wrap.classList.remove('swiped');if(Wechat._swipedItem===wrap)Wechat._swipedItem=null;}
  },{passive:true});
});
},

renderCharTab:function(body){
var chars=App.character?App.character.list:[];
var visibleChars=chars.filter(function(c){return Wechat.isCharVisible(c);});

if(!visibleChars.length){
  body.innerHTML='<div class="wx-empty"><svg viewBox="0 0 24 24" style="width:52px;height:52px;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="wx-empty-text">暂无联系人</div></div>';
  return;
}

body.innerHTML=visibleChars.map(function(c){
  var renamed=App.LS.get('wxRenamedChats')||{};
  var displayName=renamed[c.id]||c.name||'未命名';
  var avatarHtml=c.avatar?'<img src="'+App.escAttr(c.avatar)+'" alt="">':'<div class="wx-avatar-placeholder"><svg viewBox="0 0 24 24" style="width:26px;height:26px;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
  return '<div class="wx-chat-item" data-char-id="'+c.id+'"><div class="wx-avatar" style="width:56px;height:56px;">'+avatarHtml+'</div><div class="wx-chat-content"><div class="wx-chat-name" style="font-size:16px;font-weight:600;color:#2e4258;">'+App.esc(displayName)+'</div></div></div>';
}).join('');
},

renderMeTab:function(body){
var user=App.user?App.user.getActiveUser():null;
var name=user?(user.nickname||user.realName||'未命名'):'未创建用户';
var avatarHtml=user&&user.avatar?'<div style="width:84px;height:84px;border-radius:50%;overflow:hidden;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);"><img src="'+App.escAttr(user.avatar)+'" alt="" style="width:100%;height:100%;object-fit:cover;display:block;"></div>':'<div style="width:84px;height:84px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" style="width:32px;height:32px;stroke:#a8c0d8;fill:none;stroke-width:1.5;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

body.innerHTML=
'<div style="display:flex;flex-direction:column;align-items:center;padding:30px 20px 16px;gap:12px;">'+avatarHtml+'<div style="font-size:18px;font-weight:600;color:#2e4258;">'+App.esc(name)+'</div></div>'+
'<div>'+
  '<div class="wx-me-link" id="wxMeMode"><span class="wx-me-link-text" style="font-size:15px;">显示模式</span><span style="font-size:13px;color:#8aa0b8;">'+(App.LS.get('wxFullScreen')?'全屏':'手机框')+' ›</span></div>'+
  '<div class="wx-me-link" id="wxMeFavs"><span class="wx-me-link-text" style="font-size:15px;">收藏</span><span class="wx-me-link-arrow" style="font-size:15px;">›</span></div>'+
'</div>';

body.querySelector('#wxMeMode').addEventListener('click',function(){
  var cur=App.LS.get('wxFullScreen')||false;
  App.LS.set('wxFullScreen',!cur);
  Wechat.render();
});

body.querySelector('#wxMeFavs').addEventListener('click',function(){
  var favs=App.LS.get('chatFavorites')||[];
  if(!favs.length){App.showToast('暂无收藏');return;}
  body.innerHTML='<div style="padding:0 0 20px;">'+
    '<div style="padding:14px 18px;font-size:14px;font-weight:700;color:#2e4258;border-bottom:1px solid rgba(0,0,0,.04);">我的收藏</div>'+
    favs.map(function(f,i){
      return '<div style="padding:12px 18px;border-bottom:1px solid rgba(0,0,0,.04);position:relative;">'+
        '<div style="font-size:11px;color:#999;margin-bottom:4px;">'+App.esc(f.charName||'')+'</div>'+
        '<div style="font-size:13px;color:#333;line-height:1.5;">'+App.esc((f.content||'').slice(0,200))+'</div>'+
        '<div style="display:flex;gap:10px;margin-top:6px;">'+
          '<span class="fav-act" data-act="share" data-idx="'+i+'" style="font-size:11px;color:#7a9ab8;cursor:pointer;">转发</span>'+
          '<span class="fav-act" data-act="del" data-idx="'+i+'" style="font-size:11px;color:#c9706b;cursor:pointer;">删除</span>'+
        '</div>'+
      '</div>';
    }).join('')+
  '</div>';
  body.querySelectorAll('.fav-act').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var idx=parseInt(btn.dataset.idx);
      var favs2=App.LS.get('chatFavorites')||[];
      if(btn.dataset.act==='del'){
        favs2.splice(idx,1);App.LS.set('chatFavorites',favs2);
        body.querySelector('#wxMeFavs').click();App.showToast('已删除');
      } else if(btn.dataset.act==='share'){
        var f2=favs2[idx];if(f2){
          if(navigator.share)navigator.share({text:f2.content}).catch(function(){});
          else{App.copyText(f2.content).then(function(){App.showToast('已复制');}).catch(function(){App.showToast('复制失败');});}
        }
      }
    });
  });
});
},

bindEvents:function(){
App.safeOn('#wxBackBtn','click',function(){Wechat.close();});

App.safeOn('#wxAddBtn','click',function(e){
  e.stopPropagation();
  var menu=App.$('#wxAddMenu');if(menu)menu.classList.toggle('show');
});

if(Wechat.panelEl){
  Wechat.panelEl.querySelectorAll('.wx-add-menu-item').forEach(function(item){
    item.addEventListener('click',function(e){
      e.stopPropagation();
      var menu=App.$('#wxAddMenu');if(menu)menu.classList.remove('show');
      if(item.dataset.action==='addFriend')App.showToast('加好友 · 开发中');
      else if(item.dataset.action==='changeTheme'){Wechat.close();setTimeout(function(){App.openPanel('themePanel');},380);}
    });
  });

  Wechat.panelEl.addEventListener('click',function(){var menu=App.$('#wxAddMenu');if(menu)menu.classList.remove('show');});

  Wechat.panelEl.querySelectorAll('.wx-tab').forEach(function(tab){
    tab.addEventListener('click',function(){
      Wechat.currentTab=tab.dataset.tab;
      Wechat.panelEl.querySelectorAll('.wx-tab').forEach(function(t){t.classList.toggle('active',t.dataset.tab===Wechat.currentTab);});
      Wechat.renderTab();
    });
  });
}
},

restoreInner:function(){
var inner=App.$('#wxInner');
if(!inner||!Wechat._savedInner)return;
inner.innerHTML=Wechat._savedInner;
Wechat._savedInner='';
Wechat.renderTab();
Wechat.bindEvents();
},

init:function(){
if(!App.$('#wechatPanel')){var panel=document.createElement('div');panel.id='wechatPanel';panel.className='fullpage-panel hidden';document.body.appendChild(panel);}
App.wechat=Wechat;
}
};

App.register('wechat',Wechat);
})();
