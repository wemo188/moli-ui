
(function(){
'use strict';
var App=window.App;if(!App)return;

var DRAG_SVG='<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/></svg>';
var EDIT_SVG='<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
var DEL_SVG='<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>';
var POWER_SVG='<svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" stroke="currentColor"/><line x1="12" y1="2" x2="12" y2="12" stroke="currentColor"/></svg>';
var DOTS_SVG='<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:#7a9ab8;"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';

var SYS_ITEMS=[
  {id:'char_profile',name:'角色档案',desc:'Character Profile'},
  {id:'user_info',name:'用户信息',desc:'User Profile'},
  {id:'scene',name:'场景 / 时间线',desc:'Scene / Timeline'},
  {id:'examples',name:'示例对话',desc:'Example Dialogue'},
  {id:'memory_summary',name:'记忆总结',desc:'Memory Summary'},
  {id:'chat_history',name:'聊天历史',desc:'Chat History'},
  {id:'post_instruction',name:'角色档案的后置指令',desc:'Post Instruction'}
];
var SYS_IDS=SYS_ITEMS.map(function(s){return s.id;});
var SYS_HAS_SWITCH=['memory_summary','chat_history','post_instruction'];

function makeDefaultConfig(name){
  var cfg={name:name||'默认预设',sysEnabled:{},order:SYS_IDS.slice(),userPresets:{},_savedPositions:{}};
  SYS_IDS.forEach(function(id){cfg.sysEnabled[id]=true;});
  return cfg;
}

var Preset={
  presetList:null,activeIdx:0,config:null,

  load:function(){
    Preset.presetList=App.LS.get('presetList2');
    Preset.activeIdx=App.LS.get('presetActiveIdx')||0;
    if(!Preset.presetList||!Preset.presetList.length){Preset.presetList=[makeDefaultConfig('默认预设')];Preset.activeIdx=0;}
    if(Preset.activeIdx>=Preset.presetList.length)Preset.activeIdx=0;
    Preset.config=Preset.presetList[Preset.activeIdx];
    if(!Preset.config.order)Preset.config.order=SYS_IDS.slice();
    if(!Preset.config.sysEnabled){Preset.config.sysEnabled={};SYS_IDS.forEach(function(id){Preset.config.sysEnabled[id]=true;});}
    if(!Preset.config.userPresets)Preset.config.userPresets={};
    if(!Preset.config._savedPositions)Preset.config._savedPositions={};
  },

  save:function(){Preset.presetList[Preset.activeIdx]=Preset.config;App.LS.set('presetList2',Preset.presetList);App.LS.set('presetActiveIdx',Preset.activeIdx);},

  getSysItem:function(id){for(var i=0;i<SYS_ITEMS.length;i++){if(SYS_ITEMS[i].id===id)return SYS_ITEMS[i];}return null;},
  isSysId:function(id){return SYS_IDS.indexOf(id)>=0;},

  getOrderedItems:function(){
    var order=Preset.config.order;var result=[];
    order.forEach(function(id){
      if(Preset.isSysId(id))result.push({type:'sys',id:id,data:Preset.getSysItem(id)});
      else{var up=Preset.config.userPresets[id];if(up&&up.mode==='relative')result.push({type:'user',id:id,data:up});}
    });return result;
  },

  getDepthPresets:function(){
    var list=[];Object.keys(Preset.config.userPresets).forEach(function(id){var up=Preset.config.userPresets[id];if(up&&up.mode==='depth')list.push({id:id,data:up});});
    list.sort(function(a,b){return(a.data.depth||0)-(b.data.depth||0);});return list;
  },

  _renderUserItem:function(id,up,isActive){
    var depthTag=up.mode==='depth'?'<span class="ps-tag depth">深度 '+(up.depth||0)+'</span>':'';
    if(isActive){
      var on=up.enabled!==false;
      return '<div class="ps-item is-user" data-id="'+id+'"><div class="ps-drag">'+DRAG_SVG+'</div><div class="ps-info"><div class="ps-name">'+App.esc(up.name||'未命名')+'</div><div class="ps-desc">'+App.esc((up.content||'').slice(0,40))+'</div></div>'+depthTag+'<div class="ps-mini-btn edit" data-edit-id="'+id+'">'+EDIT_SVG+'</div><div class="ps-mini-btn" data-deact-id="'+id+'" style="color:#1a1a1a;">'+POWER_SVG+'</div><div class="ps-mini-btn del" data-del-id="'+id+'">'+DEL_SVG+'</div><div class="ps-sw '+(on?'on':'off')+'" data-usw-id="'+id+'"></div></div>';
    }else{
      return '<div class="ps-item is-user is-inactive" data-id="'+id+'"><div class="ps-drag" style="opacity:.25;">'+DRAG_SVG+'</div><div class="ps-info" style="opacity:.5;"><div class="ps-name">'+App.esc(up.name||'未命名')+'</div><div class="ps-desc">'+App.esc((up.content||'').slice(0,40))+'</div></div>'+depthTag+'<div class="ps-mini-btn edit" data-edit-id="'+id+'">'+EDIT_SVG+'</div><div class="ps-mini-btn" data-react-id="'+id+'" style="border-color:rgba(107,171,142,.3);background:rgba(107,171,142,.04);color:#6bab8e;">'+POWER_SVG+'</div><div class="ps-mini-btn del" data-del-id="'+id+'">'+DEL_SVG+'</div></div>';
    }
  },

  // ====== 首页 ======
  open:function(){
    Preset.load();var old=App.$('#presetHomePage');if(old)old.remove();
    var home=document.createElement('div');home.id='presetHomePage';home.className='ps-home-page';
    document.body.appendChild(home);Preset.renderHome(home);
    requestAnimationFrame(function(){requestAnimationFrame(function(){home.classList.add('show');});});
  },

  closeHome:function(){var home=App.$('#presetHomePage');if(!home)return;home.classList.remove('show');setTimeout(function(){if(home.parentNode)home.remove();},350);},

  renderHome:function(home){
    if(!home)home=App.$('#presetHomePage');if(!home)return;
    var list=Preset.presetList;
    var cardsHtml='';
    list.forEach(function(cfg,idx){
      var isActive=idx===Preset.activeIdx;
      var userCount=Object.keys(cfg.userPresets||{}).length;
      cardsHtml+='<div class="ps-home-card'+(isActive?' active-preset':'')+'" data-pidx="'+idx+'"><div class="ps-home-card-info"><div class="ps-home-card-name">'+App.esc(cfg.name||'未命名')+'</div><div class="ps-home-card-desc">'+userCount+' 条自定义指令</div></div><span class="ps-home-card-badge '+(isActive?'in-use':'idle')+'">'+(isActive?'使用中':'闲置')+'</span><div class="ps-home-actions"><div class="ps-mini-btn" data-use-idx="'+idx+'" style="'+(isActive?'border-color:rgba(126,163,201,.5);background:rgba(126,163,201,.1);':'')+'">'+POWER_SVG+'</div><div class="ps-mini-btn" data-dots-idx="'+idx+'">'+DOTS_SVG+'</div></div></div>';
    });

    home.innerHTML='<div class="ps-header"><button class="ps-back" id="psHomeBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><span class="ps-header-title">预设方案</span><button class="ps-add-btn" id="psHomeAdd" type="button">+ 新建</button></div><div class="ps-home-list" id="psHomeList">'+cardsHtml+'</div>';

    home.querySelector('#psHomeBack').addEventListener('click',function(){Preset.closeHome();});
    home.querySelector('#psHomeAdd').addEventListener('click',function(){
      var name=prompt('新预设方案名称：','预设 '+(Preset.presetList.length+1));
      if(!name||!name.trim())return;Preset.presetList.push(makeDefaultConfig(name.trim()));Preset.save();Preset.renderHome(home);App.showToast('已创建');
    });

    home.querySelectorAll('.ps-home-card').forEach(function(card){
      card.addEventListener('click',function(e){
        if(e.target.closest('.ps-mini-btn'))return;
        var idx=parseInt(card.dataset.pidx);Preset.activeIdx=idx;Preset.config=Preset.presetList[idx];Preset.save();Preset.openDetail();
      });
    });

    home.querySelectorAll('[data-use-idx]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();var idx=parseInt(btn.dataset.useIdx);
        Preset.activeIdx=idx;Preset.config=Preset.presetList[idx];Preset.save();Preset.renderHome(home);App.showToast('已启用「'+Preset.config.name+'」');
      });
    });

    home.querySelectorAll('[data-dots-idx]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();var idx=parseInt(btn.dataset.dotsIdx);
        Preset._showDotsMenu(idx,btn,home);
      });
    });

    Preset._bindHomeDrag(home);
    Preset._bindSwipe(home,function(){Preset.closeHome();});
  },

  _showDotsMenu:function(idx,anchorEl,home){
    var old=document.querySelector('.ps-dots-menu');if(old)old.remove();
    var menu=document.createElement('div');menu.className='ps-dots-menu';
    var cfg=Preset.presetList[idx];
    menu.innerHTML='<div class="ps-dots-mi" data-dact="rename">编辑名称</div><div class="ps-dots-mi" data-dact="copy">复制</div><div class="ps-dots-mi" data-dact="export">导出</div>'+(Preset.presetList.length>1?'<div class="ps-dots-mi danger" data-dact="delete">删除</div>':'');
    var rect=anchorEl.getBoundingClientRect();
    var left=rect.left-100;if(left<10)left=10;
    var top=rect.bottom+4;if(top+160>window.innerHeight)top=rect.top-160;
    menu.style.left=left+'px';menu.style.top=top+'px';
    document.body.appendChild(menu);

    menu.querySelectorAll('.ps-dots-mi').forEach(function(mi){
      mi.addEventListener('click',function(e){
        e.stopPropagation();var act=mi.dataset.dact;menu.remove();
        if(act==='rename'){var name=prompt('预设名称：',cfg.name||'');if(name&&name.trim()){cfg.name=name.trim();Preset.save();Preset.renderHome(home);}}
        if(act==='copy'){var copy=JSON.parse(JSON.stringify(cfg));copy.name=(copy.name||'预设')+' (副本)';Preset.presetList.push(copy);Preset.save();Preset.renderHome(home);App.showToast('已复制');}
        if(act==='export'){var blob=new Blob([JSON.stringify(cfg,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='preset-'+cfg.name+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);App.showToast('已导出');}
        if(act==='delete'){if(Preset.presetList.length<=1){App.showToast('至少保留一个方案');return;}if(!confirm('删除「'+cfg.name+'」？'))return;Preset.presetList.splice(idx,1);if(Preset.activeIdx>=Preset.presetList.length)Preset.activeIdx=0;Preset.config=Preset.presetList[Preset.activeIdx];Preset.save();Preset.renderHome(home);App.showToast('已删除');}
      });
    });

    setTimeout(function(){function dismiss(ev){if(!menu.parentNode)return;if(!menu.contains(ev.target)){menu.remove();document.removeEventListener('touchstart',dismiss);document.removeEventListener('click',dismiss);}}document.addEventListener('touchstart',dismiss,{passive:true});document.addEventListener('click',dismiss);},100);
  },

  _bindHomeDrag:function(home){
    var list=home.querySelector('#psHomeList');if(!list)return;
    var dragEl=null,startY=0,offsetY=0,dragIdx=-1,longPressed=false,timer=null,moved=false;
    var cardEls=[];var cardRects=[];

    list.addEventListener('touchstart',function(e){
      var card=e.target.closest('.ps-home-card');if(!card)return;
      if(e.target.closest('.ps-mini-btn'))return;
      var t=e.touches[0];startY=t.clientY;moved=false;longPressed=false;
      dragIdx=parseInt(card.dataset.pidx);dragEl=card;
      timer=setTimeout(function(){
        if(!dragEl||moved)return;longPressed=true;
        cardEls=[];cardRects=[];
        list.querySelectorAll('.ps-home-card').forEach(function(c){
          if(c===dragEl)return;cardEls.push(c);cardRects.push({idx:parseInt(c.dataset.pidx),mid:c.getBoundingClientRect().top+c.offsetHeight/2});
        });
        dragEl.classList.add('dragging');
        if(navigator.vibrate)navigator.vibrate(15);
      },400);
    },{passive:true});

    list.addEventListener('touchmove',function(e){
      if(!dragEl)return;var t=e.touches[0];
      if(!longPressed){if(Math.abs(t.clientY-startY)>8||Math.abs(t.clientX-(e.touches[0].clientX))>8){clearTimeout(timer);timer=null;dragEl=null;}return;}
      e.preventDefault();moved=true;offsetY=t.clientY-startY;
      dragEl.style.transform='translateY('+offsetY+'px) scale(1.02)';
    },{passive:false});

    list.addEventListener('touchend',function(e){
      clearTimeout(timer);timer=null;
      if(!dragEl||!longPressed){if(dragEl){dragEl.classList.remove('dragging');dragEl.style.transform='';dragEl=null;}return;}
      dragEl.classList.remove('dragging');dragEl.style.transform='';

      var touchY=e.changedTouches[0].clientY;
      var newIdx=Preset.presetList.length-1;
      for(var i=0;i<cardRects.length;i++){if(touchY<cardRects[i].mid){newIdx=cardRects[i].idx;break;}}

      if(newIdx!==dragIdx){
        var item=Preset.presetList.splice(dragIdx,1)[0];
        if(newIdx>dragIdx)newIdx--;
        Preset.presetList.splice(newIdx,0,item);
        if(Preset.activeIdx===dragIdx)Preset.activeIdx=newIdx;
        else if(dragIdx<Preset.activeIdx&&newIdx>=Preset.activeIdx)Preset.activeIdx--;
        else if(dragIdx>Preset.activeIdx&&newIdx<=Preset.activeIdx)Preset.activeIdx++;
        Preset.config=Preset.presetList[Preset.activeIdx];
        Preset.save();
      }
      Preset.renderHome(home);
      dragEl=null;dragIdx=-1;offsetY=0;longPressed=false;moved=false;
    },{passive:true});
  },

  // ====== 详情页 ======
  openDetail:function(){
    var old=App.$('#presetPage');if(old)old.remove();
    var page=document.createElement('div');page.id='presetPage';page.className='ps-page';
    document.body.appendChild(page);Preset.renderList(page);
    requestAnimationFrame(function(){requestAnimationFrame(function(){page.classList.add('show');});});
  },

  closeDetail:function(){var page=App.$('#presetPage');if(!page)return;page.classList.remove('show');setTimeout(function(){if(page.parentNode)page.remove();},350);var home=App.$('#presetHomePage');if(home)Preset.renderHome(home);},

  renderList:function(page){
    if(!page)page=App.$('#presetPage');if(!page)return;
    var cfg=Preset.config;var orderedItems=Preset.getOrderedItems();var depthItems=Preset.getDepthPresets();
    var activeHtml='';var inactiveItems=[];

    orderedItems.forEach(function(item){
      if(item.type==='sys'){
        var hasSwitch=SYS_HAS_SWITCH.indexOf(item.id)>=0;
        var on=cfg.sysEnabled[item.id]!==false;
        activeHtml+='<div class="ps-item is-sys" data-id="'+item.id+'"><div class="ps-drag">'+DRAG_SVG+'</div><div class="ps-info"><div class="ps-name">'+App.esc(item.data.name)+'</div><div class="ps-desc">'+App.esc(item.data.desc)+'</div></div>'+(hasSwitch?'<div class="ps-sw '+(on?'on':'off')+'" data-sw-id="'+item.id+'"></div>':'')+'</div>';
      }else{
        if(item.data.enabled===false)inactiveItems.push({id:item.id,data:item.data});
        else activeHtml+=Preset._renderUserItem(item.id,item.data,true);
      }
    });
    depthItems.forEach(function(item){
      if(item.data.enabled===false)inactiveItems.push({id:item.id,data:item.data});
      else activeHtml+=Preset._renderUserItem(item.id,item.data,true);
    });

    var inactiveHtml='';
    if(inactiveItems.length)inactiveItems.forEach(function(item){inactiveHtml+=Preset._renderUserItem(item.id,item.data,false);});
    else inactiveHtml='<div style="padding:16px 18px;font-size:11px;color:#ccc;">暂无未激活指令</div>';

    page.innerHTML='<div class="ps-header"><button class="ps-back" id="psBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><span class="ps-header-title">'+App.esc(cfg.name)+'</span><span class="ps-header-edit" id="psRenameBtn">编辑名称</span></div><div class="ps-hint-bar"><div class="ps-hint-text">发送给模型读取的顺序，根据你的需求排列预设吧，关闭则不发送哦</div></div><div class="ps-toolbar"><div class="ps-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="psSearchInput" placeholder="搜索..."></div><button class="ps-add-btn" id="psAddBtn" type="button">+ 添加</button></div><div class="ps-list" id="psList">'+activeHtml+'<div class="ps-divider"></div><div class="ps-section-label">未激活</div>'+inactiveHtml+'<div style="height:120px;"></div></div>';

    Preset.bindListEvents(page);
  },

  bindListEvents:function(page){
    page.querySelector('#psBackBtn').addEventListener('click',function(){Preset.closeDetail();});
    page.querySelector('#psAddBtn').addEventListener('click',function(){Preset.openEdit(null);});
    page.querySelector('#psRenameBtn').addEventListener('click',function(){var name=prompt('预设名称：',Preset.config.name||'');if(name===null)return;name=name.trim();if(name){Preset.config.name=name;Preset.save();Preset.renderList(page);}});

    page.querySelectorAll('[data-sw-id]').forEach(function(sw){sw.addEventListener('click',function(e){e.stopPropagation();var id=sw.dataset.swId;var on=sw.classList.contains('on');Preset.config.sysEnabled[id]=!on;sw.classList.toggle('on');sw.classList.toggle('off');Preset.save();});});
    page.querySelectorAll('[data-usw-id]').forEach(function(sw){sw.addEventListener('click',function(e){e.stopPropagation();var id=sw.dataset.uswId;var up=Preset.config.userPresets[id];if(!up)return;up.enabled=!sw.classList.contains('on');sw.classList.toggle('on');sw.classList.toggle('off');Preset.save();});});
    page.querySelectorAll('[data-deact-id]').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();var id=btn.dataset.deactId;var up=Preset.config.userPresets[id];if(!up)return;var idx=Preset.config.order.indexOf(id);if(idx>=0)Preset.config._savedPositions[id]=idx;up.enabled=false;Preset.save();Preset.renderList(page);});});
    page.querySelectorAll('[data-react-id]').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();var id=btn.dataset.reactId;var up=Preset.config.userPresets[id];if(!up)return;up.enabled=true;if(up.mode==='relative'){var savedIdx=Preset.config._savedPositions[id];var curIdx=Preset.config.order.indexOf(id);if(curIdx<0){if(savedIdx!==undefined&&savedIdx>=0&&savedIdx<=Preset.config.order.length)Preset.config.order.splice(savedIdx,0,id);else Preset.config.order.unshift(id);}}delete Preset.config._savedPositions[id];Preset.save();Preset.renderList(page);});});
    page.querySelectorAll('[data-edit-id]').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();Preset.openEdit(btn.dataset.editId);});});
    page.querySelectorAll('[data-del-id]').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();var id=btn.dataset.delId;var up=Preset.config.userPresets[id];if(!up)return;if(!confirm('删除「'+(up.name||'未命名')+'」？'))return;delete Preset.config.userPresets[id];delete Preset.config._savedPositions[id];var idx=Preset.config.order.indexOf(id);if(idx>=0)Preset.config.order.splice(idx,1);Preset.save();Preset.renderList(page);App.showToast('已删除');});});

    var searchInput=page.querySelector('#psSearchInput');
    if(searchInput){searchInput.addEventListener('input',function(){var val=this.value.trim().toLowerCase();page.querySelectorAll('.ps-item').forEach(function(el){var name=el.querySelector('.ps-name');el.style.display=(!val||name.textContent.toLowerCase().indexOf(val)>=0)?'':'none';});});}

    Preset.bindDrag(page);
    Preset._bindSwipe(page,function(){Preset.closeDetail();});
  },

  bindDrag:function(page){
    var list=page.querySelector('#psList');if(!list)return;
    var dragEl=null,startX=0,startY=0,offsetY=0,dragId='',longPressed=false,timer=null,moved=false;
    var itemEls=[];var itemRects=[];var indicator=null;var GAP=28;

    function captureRects(){
      itemEls=[];itemRects=[];
      var items=list.querySelectorAll('.ps-item:not(.is-inactive)');
      items.forEach(function(it){if(it===dragEl)return;itemEls.push(it);var rect=it.getBoundingClientRect();itemRects.push({id:it.dataset.id,top:rect.top,height:rect.height,mid:rect.top+rect.height/2});});
    }
    function createIndicator(){if(indicator)indicator.remove();indicator=document.createElement('div');indicator.className='ps-gap-indicator';document.body.appendChild(indicator);}
    function showIndicator(y){if(!indicator)return;indicator.style.top=(y-1)+'px';indicator.style.opacity='1';}
    function hideIndicator(){if(indicator)indicator.style.opacity='0';}
    function removeIndicator(){if(indicator){indicator.remove();indicator=null;}}
    function getInsertIndex(touchY){for(var i=0;i<itemRects.length;i++){if(touchY<itemRects[i].mid)return i;}return itemRects.length;}
    function getIndicatorY(idx){if(idx<=0&&itemRects.length)return itemRects[0].top;if(idx>=itemRects.length)return itemRects[itemRects.length-1].top+itemRects[itemRects.length-1].height;return itemRects[idx].top;}
    function applyGap(insertIdx){for(var i=0;i<itemEls.length;i++){itemEls[i].style.transition='transform .18s ease';itemEls[i].style.transform=i<insertIdx?'translateY(-'+GAP+'px)':'translateY('+GAP+'px)';}}
    function clearGap(){for(var i=0;i<itemEls.length;i++){itemEls[i].style.transition='transform .15s ease';itemEls[i].style.transform='';}setTimeout(function(){for(var j=0;j<itemEls.length;j++)itemEls[j].style.transition='';},160);}

    list.addEventListener('touchstart',function(e){
      var item=e.target.closest('.ps-item:not(.is-inactive)');if(!item)return;
      if(e.target.closest('.ps-mini-btn')||e.target.closest('.ps-sw'))return;
      var t=e.touches[0];startX=t.clientX;startY=t.clientY;moved=false;longPressed=false;dragId=item.dataset.id;dragEl=item;
      timer=setTimeout(function(){
        if(!dragEl||moved)return;longPressed=true;captureRects();createIndicator();
        dragEl.classList.add('dragging');dragEl.style.zIndex='100';dragEl.style.position='relative';
        dragEl.style.boxShadow='0 10px 30px rgba(126,163,201,.3)';dragEl.style.background='rgba(255,255,255,.98)';
        dragEl.style.borderRadius='12px';dragEl.style.border='1.5px solid rgba(126,163,201,.35)';
        if(navigator.vibrate)navigator.vibrate(15);
        var idx=getInsertIndex(startY);applyGap(idx);showIndicator(getIndicatorY(idx));
      },350);
    },{passive:true});

    list.addEventListener('touchmove',function(e){
      if(!dragEl)return;var t=e.touches[0];var dx=Math.abs(t.clientX-startX);var dy=Math.abs(t.clientY-startY);
      if(!longPressed){if(dx>8||dy>8){clearTimeout(timer);timer=null;dragEl=null;}return;}
      e.preventDefault();e.stopPropagation();moved=true;offsetY=t.clientY-startY;
      dragEl.style.transform='translateY('+offsetY+'px) scale(1.03)';
      var touchY=t.clientY;var idx=getInsertIndex(touchY);applyGap(idx);showIndicator(getIndicatorY(idx));
      var listRect=list.getBoundingClientRect();
      if(touchY<listRect.top+50)list.scrollTop-=8;if(touchY>listRect.bottom-50)list.scrollTop+=8;
    },{passive:false});

    list.addEventListener('touchend',function(e){
      clearTimeout(timer);timer=null;
      if(!dragEl||!longPressed){if(dragEl){dragEl.style.zIndex='';dragEl.style.position='';dragEl.style.boxShadow='';dragEl.style.background='';dragEl.style.transform='';dragEl.style.borderRadius='';dragEl.style.border='';dragEl=null;}clearGap();removeIndicator();return;}
      dragEl.classList.remove('dragging');dragEl.style.transform='';dragEl.style.zIndex='';dragEl.style.position='';dragEl.style.boxShadow='';dragEl.style.background='';dragEl.style.borderRadius='';dragEl.style.border='';
      clearGap();hideIndicator();setTimeout(function(){removeIndicator();},200);
      var touchY=e.changedTouches[0].clientY;var insertIdx=getInsertIndex(touchY);
      var newOrder=[];for(var i=0;i<itemRects.length;i++){if(i===insertIdx)newOrder.push(dragId);newOrder.push(itemRects[i].id);}
      if(insertIdx>=itemRects.length)newOrder.push(dragId);
      Preset.config.order=newOrder;Preset.save();Preset.renderList(page);
      dragEl=null;dragId='';offsetY=0;longPressed=false;moved=false;itemEls=[];itemRects=[];
    },{passive:true});
  },

  _bindSwipe:function(el,closeFn){
    var _s={active:false,sx:0,sy:0,locked:false,dir:''};
    el.addEventListener('touchstart',function(e){var t=e.touches[0];if(t.clientX>50)return;_s={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
    el.addEventListener('touchmove',function(e){if(!_s.active)return;var t=e.touches[0];var dx=t.clientX-_s.sx,dy=t.clientY-_s.sy;if(!_s.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_s.locked=true;_s.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_s.dir==='h'&&dx>0){e.preventDefault();el.style.transform='translateX('+Math.min(dx,window.innerWidth)+'px)';el.style.opacity=String(1-dx/window.innerWidth*0.5);}},{passive:false});
    el.addEventListener('touchend',function(e){if(!_s.active)return;_s.active=false;if(_s.dir!=='h'){el.style.transform='';el.style.opacity='';return;}var t=e.changedTouches[0];var dx=t.clientX-_s.sx;if(dx>window.innerWidth*0.3){el.style.transition='transform .25s ease, opacity .25s ease';el.style.transform='translateX(100%)';el.style.opacity='0';setTimeout(function(){el.style.transition='';el.style.transform='';el.style.opacity='';closeFn();},260);}else{el.style.transition='transform .2s ease, opacity .2s ease';el.style.transform='';el.style.opacity='';setTimeout(function(){el.style.transition='';},220);}},{passive:true});
  },

  // ====== 编辑页 ======
  openEdit:function(editId){
    var isNew=!editId;
    var up=isNew?{name:'',content:'',mode:'relative',depth:0,enabled:true}:Preset.config.userPresets[editId];
    if(!up&&!isNew)return;if(!isNew)up=JSON.parse(JSON.stringify(up));
    var old=App.$('#presetEditPage');if(old)old.remove();
    var ep=document.createElement('div');ep.id='presetEditPage';ep.className='ps-edit-page';document.body.appendChild(ep);
    var currentMode=up.mode||'relative';

    ep.innerHTML='<div class="ps-header"><button class="ps-back" id="psEditBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><span class="ps-header-title">'+(isNew?'添加指令':'编辑指令')+'</span><div style="width:36px;"></div></div><div class="ps-edit-body"><div class="ps-edit-card"><div class="ps-edit-section"><div class="ps-edit-label"><div class="dot"></div>指令名称</div><input type="text" class="ps-edit-input" id="psEditName" placeholder="给这条指令起个名字..." value="'+App.escAttr(up.name||'')+'"></div><div class="ps-edit-sep"></div><div class="ps-edit-section"><div class="ps-edit-label"><div class="dot"></div>指令内容</div><textarea class="ps-edit-textarea" id="psEditContent" placeholder="输入指令内容...">'+App.esc(up.content||'')+'</textarea></div><div class="ps-edit-sep"></div><div class="ps-edit-section"><div class="ps-edit-label"><div class="dot"></div>位置模式</div><div class="ps-mode-row"><div class="ps-mode-btn'+(currentMode==='relative'?' active':'')+'" data-mode="relative">相对位置</div><div class="ps-mode-btn'+(currentMode==='depth'?' active':'')+'" data-mode="depth">注入深度</div></div><div id="psModeTip"></div><div id="psDepthRow" style="'+(currentMode==='depth'?'':'display:none;')+'"><div class="ps-depth-row"><input type="number" class="ps-depth-input" id="psEditDepth" min="0" max="50" value="'+(up.depth||0)+'"><div class="ps-depth-hint">0 = 紧贴用户最新消息<br>数字越大，插入位置越靠前</div></div></div></div><div class="ps-edit-btns"><button class="ps-save-btn" id="psEditSave" type="button">保 存</button><button class="ps-cancel-btn" id="psEditCancel" type="button">取 消</button></div></div></div>';

    requestAnimationFrame(function(){requestAnimationFrame(function(){ep.classList.add('show');});});

    function updateTip(){var tip=ep.querySelector('#psModeTip');tip.innerHTML=currentMode==='relative'?'<div class="ps-edit-hint">穿插到列表中你滑动的位置，按排列顺序发送给模型。</div>':'<div class="ps-edit-hint">注入到聊天历史中指定深度。深度越小越接近最新消息，AI越重视。</div>';}
    updateTip();

    ep.querySelectorAll('.ps-mode-btn').forEach(function(btn){btn.addEventListener('click',function(){ep.querySelectorAll('.ps-mode-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');currentMode=btn.dataset.mode;ep.querySelector('#psDepthRow').style.display=currentMode==='depth'?'':'none';updateTip();});});
    ep.querySelector('#psEditBack').addEventListener('click',function(){closeEdit();});
    ep.querySelector('#psEditCancel').addEventListener('click',function(){closeEdit();});

    ep.querySelector('#psEditSave').addEventListener('click',function(){
      var name=ep.querySelector('#psEditName').value.trim();if(!name){App.showToast('请输入指令名称');return;}
      var content=ep.querySelector('#psEditContent').value.trim();if(!content){App.showToast('请输入指令内容');return;}
      var depth=parseInt(ep.querySelector('#psEditDepth').value)||0;if(depth<0)depth=0;if(depth>50)depth=50;
      var data={name:name,content:content,mode:currentMode,depth:depth,enabled:true};
      if(isNew){var id='up_'+Date.now();Preset.config.userPresets[id]=data;if(currentMode==='relative')Preset.config.order.unshift(id);}
      else{data.enabled=up.enabled;var oldMode=Preset.config.userPresets[editId]?Preset.config.userPresets[editId].mode:'relative';Preset.config.userPresets[editId]=data;if(oldMode==='relative'&&currentMode==='depth'){var oi=Preset.config.order.indexOf(editId);if(oi>=0)Preset.config.order.splice(oi,1);}if(oldMode==='depth'&&currentMode==='relative'){if(Preset.config.order.indexOf(editId)<0)Preset.config.order.unshift(editId);}}
      Preset.save();closeEdit();var lp=App.$('#presetPage');if(lp)Preset.renderList(lp);App.showToast(isNew?'已创建':'已保存');
    });

    Preset._bindSwipe(ep,function(){closeEdit();});
    function closeEdit(){ep.classList.remove('show');setTimeout(function(){if(ep.parentNode)ep.remove();},350);}
  },

  // ====== 对外接口 ======
  getSysOrder:function(){if(!Preset.config)Preset.load();return Preset.config.order.filter(function(id){return Preset.isSysId(id);});},
  isSysEnabled:function(id){if(!Preset.config)Preset.load();return Preset.config.sysEnabled[id]!==false;},
  getRelativePresets:function(){
    if(!Preset.config)Preset.load();var result=[];
    Preset.config.order.forEach(function(id){if(Preset.isSysId(id))return;var up=Preset.config.userPresets[id];if(up&&up.mode==='relative'&&up.enabled!==false&&up.content)result.push({id:id,afterId:null,content:up.content,name:up.name});});
    var order=Preset.config.order;for(var i=0;i<result.length;i++){var upId=result[i].id;var idx=order.indexOf(upId);for(var j=idx-1;j>=0;j--){if(Preset.isSysId(order[j])){result[i].afterId=order[j];break;}}}return result;
  },
  getActiveDepthPresets:function(){
    if(!Preset.config)Preset.load();var list=[];
    Object.keys(Preset.config.userPresets).forEach(function(id){var up=Preset.config.userPresets[id];if(up&&up.mode==='depth'&&up.enabled!==false&&up.content)list.push({id:id,depth:up.depth||0,content:up.content,name:up.name});});
    list.sort(function(a,b){return a.depth-b.depth;});return list;
  },
  getFullOrder:function(){if(!Preset.config)Preset.load();return Preset.config.order.slice();},
  init:function(){Preset.load();App.preset=Preset;}
};

App.register('preset',Preset);
})();
