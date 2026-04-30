
(function(){
'use strict';
var App=window.App;if(!App)return;

var SYS_ITEMS=[
  {id:'sys_wb_before',name:'角色定义前的世界书',desc:'角色档案之前的世界书条目',system:true},
  {id:'sys_char_profile',name:'角色档案',desc:'角色的基础设定',system:true},
  {id:'sys_wb_after',name:'角色定义后的世界书',desc:'角色档案之后的世界书条目',system:true},
  {id:'sys_user_info',name:'用户信息',desc:'当前用户的个人资料',system:true},
  {id:'sys_scene',name:'场景/时间线',desc:'当前聊天的场景设定',system:true},
  {id:'sys_examples',name:'示例对话',desc:'角色的示例对话参考',system:true},
  {id:'sys_memory',name:'总结记忆',desc:'AI对历史对话的总结记忆',system:true,hasToggle:true},
  {id:'sys_history',name:'聊天历史',desc:'发送给AI的历史消息',system:true,hasToggle:true},
  {id:'sys_post',name:'角色档案的后置指令',desc:'在对话末尾追加的指令',system:true,hasToggle:true}
];

var Preset={
  list:[],
  config:{},
  _homeEl:null,
  _editEl:null,
  _addEl:null,

  load:function(){
    Preset.list=App.LS.get('presetList')||[];
    Preset.config=App.LS.get('presetConfig')||{};
    if(!Preset.config.sysToggles)Preset.config.sysToggles={};
    if(!Preset.config.order)Preset.config.order=null;
    SYS_ITEMS.forEach(function(s){
      if(Preset.config.sysToggles[s.id]===undefined)Preset.config.sysToggles[s.id]=true;
    });
  },
  save:function(){
    App.LS.set('presetList',Preset.list);
    App.LS.set('presetConfig',Preset.config);
  },

  // ====== 首页 ======
  open:function(){
    Preset.load();
    if(Preset._homeEl)Preset._homeEl.remove();
    var page=document.createElement('div');
    page.className='ps-home-page';
    Preset._homeEl=page;
    document.body.appendChild(page);
    Preset.renderHome();
    requestAnimationFrame(function(){requestAnimationFrame(function(){page.classList.add('show');});});
  },

  close:function(){
    var page=Preset._homeEl;if(!page)return;
    page.classList.remove('show');
    setTimeout(function(){if(page.parentNode)page.remove();Preset._homeEl=null;},350);
  },

  renderHome:function(){
    var page=Preset._homeEl;if(!page)return;
    var html='';
    if(!Preset.list.length){
      html='<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无预设，点击右上角创建</div>';
    } else {
      html=Preset.list.map(function(p,i){
        return '<div class="ps-home-card" data-idx="'+i+'">'+
          '<div class="ps-home-card-info">'+
            '<div class="ps-home-card-name">'+App.esc(p.name||'未命名')+'</div>'+
            '<div class="ps-home-card-desc">'+App.esc((p.content||'').slice(0,50))+'</div>'+
          '</div>'+
          '<div class="ps-home-actions">'+
            '<div class="ps-mini-btn" data-act="activate" data-idx="'+i+'" title="启用"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>'+
            '<div class="ps-mini-btn" data-act="dots" data-idx="'+i+'" title="更多"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="#7a9ab8" stroke="none"/></svg></div>'+
          '</div>'+
        '</div>';
      }).join('');
    }

    page.innerHTML=
      '<div class="ps-header">'+
        '<button class="ps-back" id="psHomeBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<div class="ps-header-title">预设</div>'+
        '<button class="ps-create-btn" id="psHomeCreate" type="button">创建</button>'+
      '</div>'+
      '<div class="ps-home-list" id="psHomeList">'+html+'</div>';

    Preset.bindHomeEvents(page);
    Preset.bindHomeSwipe(page);
  },

  bindHomeEvents:function(page){
    page.querySelector('#psHomeBack').addEventListener('click',function(){Preset.close();});
    page.querySelector('#psHomeCreate').addEventListener('click',function(){Preset.openEditPreset(-1);});

    // 启用
    page.querySelectorAll('[data-act="activate"]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(btn.dataset.idx);
        var p=Preset.list[idx];if(!p)return;
        Preset.openEditPreset(idx);
      });
    });

    // 三个点
    page.querySelectorAll('[data-act="dots"]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        Preset.showDotsMenu(btn,parseInt(btn.dataset.idx));
      });
    });

    // 长按拖拽
    var cards=page.querySelectorAll('.ps-home-card');
    cards.forEach(function(card){
      var timer=null,pressed=false,moved=false,startY=0,startIdx=0,gap=null;
      card.addEventListener('touchstart',function(e){
        if(e.target.closest('.ps-mini-btn')||e.target.closest('.ps-home-actions'))return;
        moved=false;pressed=false;
        startY=e.touches[0].clientY;
        startIdx=parseInt(card.dataset.idx);
        timer=setTimeout(function(){
          pressed=true;
          if(navigator.vibrate)navigator.vibrate(15);
          card.classList.add('dragging');
          gap=document.createElement('div');gap.className='ps-gap-indicator';gap.style.opacity='0';
          document.body.appendChild(gap);
        },500);
      },{passive:true});
      card.addEventListener('touchmove',function(e){
        if(timer&&!pressed){if(Math.abs(e.touches[0].clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
        if(!pressed)return;
        moved=true;e.preventDefault();e.stopPropagation();
        var dy=e.touches[0].clientY-startY;
        card.style.transform='translateY('+dy+'px)';card.style.zIndex='100';
        var allCards=page.querySelectorAll('.ps-home-card');var targetIdx=startIdx;
        allCards.forEach(function(c,ci){if(ci===startIdx)return;var rect=c.getBoundingClientRect();var mid=rect.top+rect.height/2;if(e.touches[0].clientY>mid&&ci>startIdx)targetIdx=ci;if(e.touches[0].clientY<mid&&ci<startIdx)targetIdx=ci;});
        if(gap&&targetIdx!==startIdx){var tc=allCards[targetIdx];if(tc){var tr=tc.getBoundingClientRect();gap.style.top=(targetIdx>startIdx?tr.bottom:tr.top)+'px';gap.style.opacity='1';}}
        Preset._dragState={from:startIdx,to:targetIdx};
      },{passive:false});
      card.addEventListener('touchend',function(){
        clearTimeout(timer);timer=null;card.classList.remove('dragging');card.style.transform='';card.style.zIndex='';
        if(gap){gap.remove();gap=null;}
        if(pressed&&moved&&Preset._dragState){
          var f=Preset._dragState.from,t=Preset._dragState.to;
          if(f!==t&&f>=0&&t>=0&&f<Preset.list.length&&t<Preset.list.length){
            var item=Preset.list.splice(f,1)[0];Preset.list.splice(t,0,item);Preset.save();Preset.renderHome();
          }
          Preset._dragState=null;
        }
        pressed=false;moved=false;
      },{passive:true});
    });
  },

  bindHomeSwipe:function(page){
    var _sw={active:false,sx:0,sy:0,locked:false,dir:''};
    page.addEventListener('touchstart',function(e){
      var t=e.touches[0];var rect=page.getBoundingClientRect();
      if(t.clientX-rect.left>50)return;
      _sw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};
    },{passive:true});
    page.addEventListener('touchmove',function(e){
      if(!_sw.active)return;var t=e.touches[0];var dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;
      if(!_sw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.locked=true;_sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}
      if(_sw.dir==='h'&&dx>0){e.preventDefault();page.style.transform='translateX('+Math.min(dx,page.offsetWidth)+'px)';page.style.opacity=String(1-dx/page.offsetWidth*0.5);}
    },{passive:false});
    page.addEventListener('touchend',function(e){
      if(!_sw.active)return;_sw.active=false;
      if(_sw.dir!=='h'){page.style.transform='';page.style.opacity='';return;}
      var dx=e.changedTouches[0].clientX-_sw.sx;
      if(dx>page.offsetWidth*0.3){page.style.transition='transform .25s,opacity .25s';page.style.transform='translateX(100%)';page.style.opacity='0';setTimeout(function(){page.style.transition='';page.style.transform='';page.style.opacity='';Preset.close();},260);}
      else{page.style.transition='transform .2s,opacity .2s';page.style.transform='';page.style.opacity='';setTimeout(function(){page.style.transition='';},220);}
    },{passive:true});
  },

  showDotsMenu:function(btnEl,idx){
    var old=document.querySelector('.ps-dots-menu');if(old)old.remove();   var menu=document.createElement('div');menu.className='ps-dots-menu';
    menu.innerHTML=
      '<div class="ps-dots-mi" data-mact="edit">编辑</div>'+
      '<div class="ps-dots-mi" data-mact="copy">复制</div>'+
      '<div class="ps-dots-mi" data-mact="export">导出</div>'+
      '<div class="ps-dots-mi danger" data-mact="delete">删除</div>';
    var rect=btnEl.getBoundingClientRect();
    var left=rect.right-140,top=rect.bottom+4;
    if(left<8)left=8;if(top+180>window.innerHeight)top=rect.top-180;if(top<10)top=10;
    menu.style.left=left+'px';menu.style.top=top+'px';
    document.body.appendChild(menu);
    menu.querySelectorAll('.ps-dots-mi').forEach(function(mi){
      mi.addEventListener('click',function(e){
        e.stopPropagation();var act=mi.dataset.mact;menu.remove();
        if(act==='edit'){Preset.openEditPreset(idx);}
        if(act==='copy'){var src=Preset.list[idx];if(!src)return;var cp=JSON.parse(JSON.stringify(src));cp.id='ps_'+Date.now();cp.name=cp.name+' (副本)';Preset.list.unshift(cp);Preset.save();Preset.renderHome();App.showToast('已复制');}
        if(act==='export'){var p=Preset.list[idx];if(!p)return;var blob=new Blob([JSON.stringify(p,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='preset_'+(p.name||'export')+'_'+Date.now()+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);App.showToast('已导出');}
        if(act==='delete'){if(!confirm('确定删除这个预设？'))return;Preset.list.splice(idx,1);Preset.save();Preset.renderHome();App.showToast('已删除');}
      });
    });
    function dismiss(ev){if(menu.parentNode&&!menu.contains(ev.target)){menu.remove();document.removeEventListener('touchstart',dismiss);document.removeEventListener('click',dismiss);}}
    setTimeout(function(){document.addEventListener('touchstart',dismiss,{passive:true});document.addEventListener('click',dismiss);},100);
  },

  // ====== 编辑预设页（点击首页卡片进入） ======
  openEditPreset:function(idx){
    var isNew=idx<0;
    var p=isNew?{id:'ps_'+Date.now(),name:'',content:'',mode:'normal',depth:4,enabled:true,items:[]}:JSON.parse(JSON.stringify(Preset.list[idx]));
    if(!p.items)p.items=[];

    if(Preset._editEl)Preset._editEl.remove();
    var page=document.createElement('div');page.className='ps-edit-page';Preset._editEl=page;

    function renderEditPage(){
      // 已激活的自定义指令
      var activeItems=p.items.filter(function(it){return it.enabled!==false;});
      var inactiveItems=p.items.filter(function(it){return it.enabled===false;});

      var activeHtml=activeItems.map(function(it,ai){
        var realIdx=p.items.indexOf(it);
        return '<div class="ps-item is-user" data-item-idx="'+realIdx+'">'+
          '<div class="ps-info"><div class="ps-name">'+App.esc(it.name||'未命名')+'</div><div class="ps-desc">'+App.esc((it.content||'').slice(0,30))+(it.mode==='depth'?' [D'+it.depth+']':'')+'</div></div>'+
          '<div class="ps-item-btn edit-btn" data-iact="editItem" data-iidx="'+realIdx+'"><svg viewBox="0 0 24 24"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>'+
          '<div class="ps-item-btn activate-btn" data-iact="deactivate" data-iidx="'+realIdx+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="9" y1="12" x2="15" y2="12"/></svg></div>'+
          '<div class="ps-item-btn del-btn" data-iact="delItem" data-iidx="'+realIdx+'"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>'+
          '<div class="ps-sw '+(it.enabled!==false?'on':'off')+'" data-iact="toggleItem" data-iidx="'+realIdx+'"></div>'+
        '</div>';
      }).join('');

      // 系统组件
      var sysHtml=SYS_ITEMS.map(function(s){
        var isOn=Preset.config.sysToggles[s.id]!==false;
        return '<div class="ps-item is-sys">'+
          '<div class="ps-info"><div class="ps-name">'+App.esc(s.name)+'</div></div>'+
          (s.hasToggle?'<div class="ps-sw '+(isOn?'on':'off')+'" data-sys-id="'+s.id+'"></div>':'')+
        '</div>';
      }).join('');

      // 未激活区域
      var inactiveHtml='';
      if(inactiveItems.length){
        inactiveHtml='<div class="ps-inactive-label">未激活</div>'+inactiveItems.map(function(it){
          var realIdx=p.items.indexOf(it);
          return '<div class="ps-item is-user" data-item-idx="'+realIdx+'">'+
            '<div class="ps-info"><div class="ps-name" style="color:#bbb;">'+App.esc(it.name||'未命名')+'</div></div>'+
            '<div class="ps-item-btn edit-btn" data-iact="editItem" data-iidx="'+realIdx+'"><svg viewBox="0 0 24 24"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>'+
            '<div class="ps-item-btn activate-btn is-on" data-iact="activate" data-iidx="'+realIdx+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg></div>'+
            '<div class="ps-item-btn del-btn" data-iact="delItem" data-iidx="'+realIdx+'"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>'+
          '</div>';
        }).join('');
      }

      page.innerHTML=
        '<div class="ps-edit-header">'+
          '<button class="ps-back" id="psEditBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
          '<div class="ps-header-title">'+App.esc(p.name||'预设名称')+'</div>'+
          '<div style="width:36px;"></div>'+
        '</div>'+
        '<div class="ps-edit-body">'+
          '<div class="ps-toolbar">'+
            '<div class="ps-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="psEditSearch" placeholder="搜索..."></div>'+
            '<button class="ps-add-btn" id="psEditAdd" type="button">添加</button>'+
          '</div>'+
          '<div class="ps-hint-bar"><div class="ps-hint-text">发送给模型读取的顺序，根据你的需求排列预设吧，关闭则不发送哦</div></div>'+
          '<div class="ps-list" id="psEditList">'+
            activeHtml+
            sysHtml+
            inactiveHtml+
          '</div>'+
        '</div>';

      bindEditEvents();
    }

    function bindEditEvents(){
      page.querySelector('#psEditBack').addEventListener('click',function(){
        // 保存回list
        if(isNew){if(p.name||p.items.length){Preset.list.unshift(p);Preset.save();Preset.renderHome();}}
        else{Preset.list[idx]=p;Preset.save();Preset.renderHome();}
        Preset.closeEdit();
      });
      page.querySelector('#psEditAdd').addEventListener('click',function(){Preset.openAddItem(p,function(){renderEditPage();});});

      // 编辑名称（点击标题）
      page.querySelector('.ps-header-title').addEventListener('click',function(){
        var newName=prompt('预设名称：',p.name||'');
        if(newName===null)return;
        p.name=newName.trim();
        page.querySelector('.ps-header-title').textContent=p.name||'预设名称';
      });

      // 系统开关
      page.querySelectorAll('.ps-sw[data-sys-id]').forEach(function(sw){
        sw.addEventListener('click',function(e){e.stopPropagation();var id=sw.dataset.sysId;var isOn=sw.classList.contains('on');Preset.config.sysToggles[id]=!isOn;Preset.save();sw.classList.toggle('on',!isOn);sw.classList.toggle('off',isOn);});
      });

      // 自定义指令开关
      page.querySelectorAll('.ps-sw[data-iact="toggleItem"]').forEach(function(sw){
        sw.addEventListener('click',function(e){e.stopPropagation();var ii=parseInt(sw.dataset.iidx);if(p.items[ii])p.items[ii].enabled=!sw.classList.contains('on');renderEditPage();});
      });

      // 编辑指令
      page.querySelectorAll('[data-iact="editItem"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();var ii=parseInt(btn.dataset.iidx);Preset.openAddItem(p,function(){renderEditPage();},ii);});
      });

      // 激活/取消激活
      page.querySelectorAll('[data-iact="deactivate"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();var ii=parseInt(btn.dataset.iidx);if(p.items[ii])p.items[ii].enabled=false;renderEditPage();});
      });
      page.querySelectorAll('[data-iact="activate"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();var ii=parseInt(btn.dataset.iidx);if(p.items[ii])p.items[ii].enabled=true;renderEditPage();});
      