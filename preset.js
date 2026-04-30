
(function(){
'use strict';
var App=window.App;if(!App)return;

var SYS_ITEMS=[
  {id:'sys_wb_before',name:'角色定义前的世界书',en:'World Book (Before)',system:true,hasToggle:true},
  {id:'sys_char_profile',name:'角色档案',en:'Character Profile',system:true,hasToggle:true},
  {id:'sys_wb_after',name:'角色定义后的世界书',en:'World Book (After)',system:true,hasToggle:true},
  {id:'sys_user_info',name:'用户信息',en:'User Info',system:true,hasToggle:true},
  {id:'sys_scene',name:'场景/时间线',en:'Scene / Timeline',system:true,hasToggle:true},
  {id:'sys_examples',name:'示例对话',en:'Example Dialogue',system:true,hasToggle:true},
  {id:'sys_memory',name:'总结记忆',en:'Summary Memory',system:true,hasToggle:true},
  {id:'sys_history',name:'聊天历史',en:'Chat History',system:true,hasToggle:true},
  {id:'sys_post',name:'角色档案的后置指令',en:'Post Instruction',system:true,hasToggle:true}
];

var HISTORY_IDX=7;

var Preset={
  list:[],
  config:{},
  _homeEl:null,
  _editEl:null,
  _addEl:null,
  _expandEl:null,
  _dragState:null,

  load:function(){
    Preset.list=App.LS.get('presetList')||[];
    Preset.config=App.LS.get('presetConfig')||{};
    if(!Preset.config.sysToggles)Preset.config.sysToggles={};
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
        var isActive=p.enabled!==false;
        return '<div class="ps-home-card'+(isActive?' active-preset':'')+'" data-idx="'+i+'">'+
          '<div class="ps-home-card-info">'+
            '<div class="ps-home-card-name">'+App.esc(p.name||'未命名')+'</div>'+
            '<div class="ps-home-card-desc">'+App.esc((p.content||'').slice(0,50))+'</div>'+
          '</div>'+
          '<div class="ps-home-actions">'+
            '<div class="ps-mini-btn'+(isActive?' active-on':'')+'" data-act="toggle" data-idx="'+i+'"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>'+
            '<div class="ps-mini-btn" data-act="dots" data-idx="'+i+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="#7a9ab8" stroke="none"/></svg></div>'+
          '</div>'+
        '</div>';
      }).join('');
    }

    page.innerHTML=
      '<div class="ps-header">'+
        '<button class="ps-back" id="psHomeBack" type="button"><svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>'+
        '<div class="ps-header-title">预设</div>'+
        '<button class="ps-create-btn" id="psHomeCreate" type="button">创建</button>'+
      '</div>'+
      '<div class="ps-home-list" id="psHomeList">'+html+'</div>';

    Preset.bindHomeEvents(page);
    Preset.bindSwipeBack(page,function(){Preset.close();});
  },

  bindHomeEvents:function(page){
    page.querySelector('#psHomeBack').addEventListener('click',function(){Preset.close();});
    page.querySelector('#psHomeCreate').addEventListener('click',function(){Preset.openEditPreset(-1);});

    page.querySelectorAll('[data-act="toggle"]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(btn.dataset.idx);var p=Preset.list[idx];if(!p)return;
        p.enabled=p.enabled===false?true:false;
        Preset.save();Preset.renderHome();
        App.showToast(p.enabled?'已启用':'已禁用');
      });
    });

    page.querySelectorAll('[data-act="dots"]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        Preset.showDotsMenu(btn,parseInt(btn.dataset.idx));
      });
    });

    // 长按拖拽
    var cards=page.querySelectorAll('.ps-home-card');
    cards.forEach(function(card){
      Preset._bindDragToEl(card,page,'.ps-home-card',function(from,to){
        var item=Preset.list.splice(from,1)[0];
        Preset.list.splice(to,0,item);
        Preset.save();Preset.renderHome();
      });
    });
  },

  showDotsMenu:function(btnEl,idx){
    var old=document.querySelector('.ps-dots-menu');if(old)old.remove();
    var menu=document.createElement('div');menu.className='ps-dots-menu';
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
        if(act==='edit')Preset.openEditPreset(idx);
        if(act==='copy'){var src=Preset.list[idx];if(!src)return;var cp=JSON.parse(JSON.stringify(src));cp.id='ps_'+Date.now();cp.name=cp.name+' (副本)';Preset.list.unshift(cp);Preset.save();Preset.renderHome();App.showToast('已复制');}
        if(act==='export'){var p=Preset.list[idx];if(!p)return;var blob=new Blob([JSON.stringify(p,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='preset_'+(p.name||'export')+'_'+Date.now()+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);App.showToast('已导出');}
        if(act==='delete'){if(!confirm('确定删除？'))return;Preset.list.splice(idx,1);Preset.save();Preset.renderHome();App.showToast('已删除');}
      });
    });
    function dismiss(ev){if(menu.parentNode&&!menu.contains(ev.target)){menu.remove();document.removeEventListener('touchstart',dismiss);document.removeEventListener('click',dismiss);}}
    setTimeout(function(){document.addEventListener('touchstart',dismiss,{passive:true});document.addEventListener('click',dismiss);},100);
  },

  // ====== 编辑预设页 ======
  openEditPreset:function(idx){
    var isNew=idx<0;
    var p=isNew?{id:'ps_'+Date.now(),name:'',enabled:true,items:[]}:JSON.parse(JSON.stringify(Preset.list[idx]));
    if(!p.items)p.items=[];

    if(Preset._editEl)Preset._editEl.remove();
    var page=document.createElement('div');page.className='ps-edit-page';Preset._editEl=page;
    document.body.appendChild(page);

    function buildAllItems(){
      // 给每个item标记原始索引
      p.items.forEach(function(it,i){it._idx=i;});
      var activeItems=p.items.filter(function(it){return it.enabled!==false&&it.mode!=='depth';});
      var depthItems=p.items.filter(function(it){return it.enabled!==false&&it.mode==='depth';});
      var inactiveItems=p.items.filter(function(it){return it.enabled===false;});
      return {active:activeItems,depth:depthItems,inactive:inactiveItems};
    }

    function render(){
      var groups=buildAllItems();

      var activeHtml=groups.active.map(function(it){return Preset._renderItem(it,true);}).join('');

      var sysHtml='';
      SYS_ITEMS.forEach(function(s,si){
        var isOn=Preset.config.sysToggles[s.id]!==false;
        sysHtml+='<div class="ps-item is-sys" data-sys-id="'+s.id+'">'+
          '<div class="ps-info"><div class="ps-name">'+App.esc(s.name)+'</div><div class="ps-name-sub">'+App.esc(s.en)+'</div></div>'+
          '<div class="ps-sw '+(isOn?'on':'off')+'" data-sys-id="'+s.id+'"></div>'+
        '</div>';
        if(si===HISTORY_IDX&&groups.depth.length){
          sysHtml+=groups.depth.map(function(it){return Preset._renderItem(it,true);}).join('');
        }
      });

      var inactiveHtml='';
      if(groups.inactive.length){
        inactiveHtml='<div class="ps-inactive-label">未激活</div>'+
          groups.inactive.map(function(it){return Preset._renderItem(it,false);}).join('');
      }

      page.innerHTML=
        '<div class="ps-header">'+
          '<button class="ps-back" id="psEditBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
          '<div class="ps-header-title">'+App.esc(p.name||'预设名称')+'</div>'+
          '<div class="ps-header-right" id="psEditRename">编辑名称</div>'+
        '</div>'+
        '<div class="ps-edit-body">'+
          '<div class="ps-toolbar">'+
            '<div class="ps-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="psEditSearch" placeholder="搜索指令..."></div>'+
            '<button class="ps-add-btn" id="psEditAdd" type="button">添加</button>'+
          '</div>'+
          '<div class="ps-hint-bar"><div class="ps-hint-text">发送给模型读取的顺序，根据你的需求排列预设吧，关闭开关则不发送给AI</div></div>'+
          '<div class="ps-list" id="psEditList">'+
            activeHtml+
            sysHtml+
            inactiveHtml+
          '</div>'+
        '</div>';

      bindEditEvents();
    }

    function bindEditEvents(){
      page.querySelector('#psEditBack').addEventListener('click',function(){saveBack();Preset.closeEdit();});
      page.querySelector('#psEditAdd').addEventListener('click',function(){Preset.openAddItem(p,function(){render();});});
      page.querySelector('#psEditRename').addEventListener('click',function(){
        var n=prompt('预设名称：',p.name||'');if(n===null)return;
        p.name=n.trim();page.querySelector('.ps-header-title').textContent=p.name||'预设名称';
      });

      // 系统开关
      page.querySelectorAll('.ps-sw[data-sys-id]').forEach(function(sw){
        sw.addEventListener('click',function(e){e.stopPropagation();var id=sw.dataset.sysId;var isOn=sw.classList.contains('on');Preset.config.sysToggles[id]=!isOn;Preset.save();sw.classList.toggle('on',!isOn);sw.classList.toggle('off',isOn);});
      });

      // 自定义指令开关
      page.querySelectorAll('.ps-sw[data-item-idx]').forEach(function(sw){
        sw.addEventListener('click',function(e){e.stopPropagation();var ii=parseInt(sw.dataset.itemIdx);if(p.items[ii]){p.items[ii].enabled=!sw.classList.contains('on');}render();});
      });

      // 编辑
      page.querySelectorAll('[data-iact="edit"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();Preset.openAddItem(p,function(){render();},parseInt(btn.dataset.itemIdx));});
      });

      // 删除
      page.querySelectorAll('[data-iact="del"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();var ii=parseInt(btn.dataset.itemIdx);if(!confirm('删除这条指令？'))return;p.items.splice(ii,1);render();});
      });

      // 搜索
      var si=page.querySelector('#psEditSearch');
      if(si)si.addEventListener('input',function(){
        var q=this.value.trim().toLowerCase();
        page.querySelectorAll('.ps-item').forEach(function(item){
          if(item.classList.contains('is-sys')){
            var sn=item.querySelector('.ps-name');
            var match=!q||(sn&&sn.textContent.toLowerCase().indexOf(q)>=0);
            item.style.display=match?'':'none';
          } else {
            var ii=parseInt(item.dataset.itemIdx);var it=p.items[ii];
            if(!it){item.style.display='';return;}
            var match2=!q||(it.name||'').toLowerCase().indexOf(q)>=0||(it.content||'').toLowerCase().indexOf(q)>=0;
            item.style.display=match2?'':'none';
          }
        });
      });

      // 所有条目拖拽排序（系统+自定义）
      var allDraggable=page.querySelectorAll('#psEditList .ps-item');
      allDraggable.forEach(function(item){
        Preset._bindDragToEl(item,page,'#psEditList .ps-item',function(fromEl,toEl){
          // 收集当前顺序
          var listEl=page.querySelector('#psEditList');
          var allEls=listEl.querySelectorAll('.ps-item');
          // 只处理用户指令的重排
          var isSrcUser=!item.classList.contains('is-sys');
          if(!isSrcUser)return;
          var fromIdx=parseInt(item.dataset.itemIdx);
          // 找目标位置
          var targetItemIdx=-1;
          allEls.forEach(function(el,ei){
            if(el===toEl&&!el.classList.contains('is-sys')){
              targetItemIdx=parseInt(el.dataset.itemIdx);
            }
          });
          if(targetItemIdx>=0&&fromIdx!==targetItemIdx&&fromIdx>=0&&targetItemIdx>=0){
            var itm=p.items.splice(fromIdx,1)[0];
            p.items.splice(targetItemIdx>fromIdx?targetItemIdx:targetItemIdx,0,itm);
          }
          render();
        });
      });
    }

    function saveBack(){
      if(isNew){if(p.name||p.items.length){Preset.list.unshift(p);}}
      else{Preset.list[idx]=p;}
      Preset.save();Preset.renderHome();
    }

    render();
    requestAnimationFrame(function(){requestAnimationFrame(function(){page.classList.add('show');});});
    Preset.bindSwipeBack(page,function(){saveBack();Preset.closeEdit();});
  },

  _renderItem:function(it,isActive){
    var depthTag=it.mode==='depth'?'<span class="ps-depth-tag">D'+it.depth+'</span>':'';
    var nameStyle=isActive?'':'style="color:#bbb;"';
    return '<div class="ps-item is-user" data-item-idx="'+it._idx+'">'+
      '<div class="ps-info"><div class="ps-name" '+nameStyle+'>'+App.esc(it.name||'未命名')+'</div><div class="ps-name-sub">'+App.esc((it.content||'').slice(0,30))+'</div></div>'+
      '<div class="ps-item-actions">'+
        depthTag+
        '<div class="ps-item-btn" data-iact="edit" data-item-idx="'+it._idx+'"><svg viewBox="0 0 24 24"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>'+
        '<div class="ps-item-btn del-btn" data-iact="del" data-item-idx="'+it._idx+'"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div>'+
        '<div class="ps-sw '+(it.enabled!==false?'on':'off')+'" data-item-idx="'+it._idx+'"></div>'+
      '</div>'+
    '</div>';
  },

  // ====== 通用拖拽绑定 ======
  _bindDragToEl:function(el,page,selector,onSwap){
    var timer=null,pressed=false,moved=false,startY=0;
    el.addEventListener('touchstart',function(e){
      if(e.target.closest('.ps-mini-btn')||e.target.closest('.ps-home-actions')||e.target.closest('.ps-item-btn')||e.target.closest('.ps-item-actions')||e.target.closest('.ps-sw'))return;
      moved=false;pressed=false;
      startY=e.touches[0].clientY;
      timer=setTimeout(function(){
        pressed=true;if(navigator.vibrate)navigator.vibrate(15);
        el.classList.add('dragging');
      },500);
    },{passive:true});
    el.addEventListener('touchmove',function(e){
      if(timer&&!pressed){if(Math.abs(e.touches[0].clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
      if(!pressed)return;moved=true;e.preventDefault();e.stopPropagation();
      var dy=e.touches[0].clientY-startY;
      el.style.transform='translateY('+dy+'px)';el.style.zIndex='100';
      var allEls=page.querySelectorAll(selector);
      allEls.forEach(function(c){
        if(c===el)return;
        c.classList.remove('push-down','push-up');
        var rect=c.getBoundingClientRect();var mid=rect.top+rect.height/2;
        if(e.touches[0].clientY>mid-5&&e.touches[0].clientY<mid+5){
          // 在中间附近，推开
        }
      });
      // 找最近的目标
      var closestEl=null,closestDist=999999;
      allEls.forEach(function(c){
        if(c===el)return;
        var rect=c.getBoundingClientRect();var mid=rect.top+rect.height/2;
        var dist=Math.abs(e.touches[0].clientY-mid);
        if(dist<closestDist){closestDist=dist;closestEl=c;}
      });
      allEls.forEach(function(c){c.classList.remove('push-down','push-up');});
      if(closestEl&&closestDist<40){
        var cr=closestEl.getBoundingClientRect();
        if(e.touches[0].clientY<cr.top+cr.height/2)closestEl.classList.add('push-down');
        else closestEl.classList.add('push-up');
      }
      Preset._dragState={target:closestEl};
    },{passive:false});
    el.addEventListener('touchend',function(){
      clearTimeout(timer);timer=null;
      el.classList.remove('dragging');el.style.transform='';el.style.zIndex='';
      page.querySelectorAll(selector).forEach(function(c){c.classList.remove('push-down','push-up');});
      if(pressed&&moved&&Preset._dragState&&Preset._dragState.target){
        onSwap(el,Preset._dragState.target);
        Preset._dragState=null;
      }
      pressed=false;moved=false;
    },{passive:true});
  },

  closeEdit:function(){
    var page=Preset._editEl;if(!page)return;
    page.classList.remove('show');
    setTimeout(function(){if(page.parentNode)page.remove();Preset._editEl=null;},350);
  },

  // ====== 添加/编辑指令页 ======
  openAddItem:function(preset,onDone,editIdx){
    var isEdit=typeof editIdx==='number'&&editIdx>=0;
    var item=isEdit?JSON.parse(JSON.stringify(preset.items[editIdx])):{name:'',content:'',mode:'relative',depth:2,enabled:true};

    if(Preset._addEl)Preset._addEl.remove();
    var page=document.createElement('div');page.className='ps-add-page';Preset._addEl=page;

    page.innerHTML=
      '<div class="ps-header">'+
        '<button class="ps-back" id="psAddBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<div class="ps-header-title">'+(isEdit?'编辑指令':'添加指令')+'</div>'+
        '<div style="width:36px;"></div>'+
      '</div>'+
      '<div class="ps-add-body">'+
        '<div class="ps-add-card">'+
          '<div class="ps-add-section">'+
            '<div class="ps-add-label"><div class="dot"></div>指令名称</div>'+
            '<input type="text" class="ps-add-input" id="psItemName" value="'+App.escAttr(item.name||'')+'" placeholder="给这条指令起个名字...">'+
          '</div>'+
          '<div class="ps-add-sep"></div>'+
          '<div class="ps-add-section">'+
            '<div class="ps-add-label"><div class="dot"></div>预设内容<button class="ps-expand-btn" id="psExpandBtn" type="button" style="margin-left:auto;background:none;border:1px solid rgba(126,163,201,.3);border-radius:6px;padding:2px 8px;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:#7a9ab8;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button></div>'+
            '<textarea class="ps-add-textarea" id="psItemContent" placeholder="在这里写预设指令内容...">'+App.esc(item.content||'')+'</textarea>'+
          '</div>'+
          '<div class="ps-add-sep"></div>'+
          '<div class="ps-add-section">'+
            '<div class="ps-add-label"><div class="dot"></div>注入模式</div>'+
            '<div class="ps-mode-row">'+
              '<div class="ps-mode-btn'+(item.mode!=='depth'?' active':'')+'" data-mode="relative">相对位置</div>'+
              '<div class="ps-mode-btn'+(item.mode==='depth'?' active':'')+'" data-mode="depth">深度注入</div>'+
            '</div>'+
            '<div id="psItemRelHint" style="'+(item.mode!=='depth'?'':'display:none;')+'">'+
              '<div class="ps-add-hint">相对模式：可以任意穿插到系统预设之间，在编辑预设页拖动排列位置。</div>'+
            '</div>'+
            '<div id="psItemDepthRow" style="'+(item.mode==='depth'?'':'display:none;')+'">'+
              '<div class="ps-depth-row">'+
                '<span style="font-size:12px;color:#7a9ab8;font-weight:600;">注入深度</span>'+
                '<input type="number" class="ps-depth-input" id="psItemDepth" value="'+(item.depth!=null?item.depth:2)+'" min="0" max="99">'+
              '</div>'+
              '<div class="ps-depth-hint" style="margin-top:6px;">数字越小越靠近最新消息。0 = 紧接在最后一条用户消息之前。</div>'+
              '<div class="ps-add-hint" style="margin-top:8px;">深度注入的预设保存后会出现在聊天历史下面。</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="ps-add-btns">'+
          '<button class="ps-save-btn" id="psItemSave" type="button">保存</button>'+
          '<button class="ps-cancel-btn" id="psItemCancel" type="button">取消</button>'+
        '</div>'+
      '</div>';

    document.body.appendChild(page);
    requestAnimationFrame(function(){requestAnimationFrame(function(){page.classList.add('show');});});

    page.querySelectorAll('.ps-mode-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        page.querySelectorAll('.ps-mode-btn').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        var rh=page.querySelector('#psItemRelHint'),dr=page.querySelector('#psItemDepthRow');
        if(btn.dataset.mode==='depth'){rh.style.display='none';dr.style.display='';}
        else{rh.style.display='';dr.style.display='none';}
      });
    });

    page.querySelector('#psAddBack').addEventListener('click',function(){Preset.closeAdd();});
    page.querySelector('#psItemCancel').addEventListener('click',function(){Preset.closeAdd();});

    // 扩展按钮
    page.querySelector('#psExpandBtn').addEventListener('click',function(e){
      e.stopPropagation();
      var ta=page.querySelector('#psItemContent');
      Preset.openExpand(ta);
    });

    page.querySelector('#psItemSave').addEventListener('click',function(){
      var name=(page.querySelector('#psItemName').value||'').trim();
      var content=(page.querySelector('#psItemContent').value||'').trim();
      if(!name){App.showToast('请输入指令名称');return;}
      if(!content){App.showToast('请输入预设内容');return;}
      var modeBtn=page.querySelector('.ps-mode-btn.active');
      var mode=modeBtn?modeBtn.dataset.mode:'relative';
      var depth=parseInt(page.querySelector('#psItemDepth').value);
      if(isNaN(depth))depth=2;
      var obj={name:name,content:content,mode:mode,depth:depth,enabled:true};
      if(isEdit){preset.items[editIdx]=obj;}
      else{preset.items.unshift(obj);}
      Preset.closeAdd();
      if(onDone)onDone();
      App.showToast(isEdit?'已保存':'已添加');
    });

    Preset.bindSwipeBack(page,function(){Preset.closeAdd();});
  },

  closeAdd:function(){
    var page=Preset._addEl;if(!page)return;
    page.classList.remove('show');
    setTimeout(function(){if(page.parentNode)page.remove();Preset._addEl=null;},350);
  },

  // ====== 扩展编辑 ======
  openExpand:function(textarea){
    if(Preset._expandEl)Preset._expandEl.remove();
    var editor=document.createElement('div');
    editor.id='psExpandEditor';
    editor.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10003;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateY(100%);opacity:0;overflow:hidden;';
    editor.innerHTML=
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;border-bottom:1.5px solid rgba(126,163,201,.2);">'+
        '<button id="psExpandBack" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">预设内容</span>'+
        '<button id="psExpandDone" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><polyline points="20 6 9 17 4 12"/></svg></button>'+
      '</div>'+
      '<div style="flex:1;padding:12px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;">'+
        '<textarea id="psExpandTA" style="width:100%;min-height:calc(100vh - 120px);border:1.5px solid rgba(126,163,201,.25);border-radius:12px;padding:14px 16px;font-size:14px;color:#2e4258;outline:none;font-family:inherit;background:rgba(126,163,201,.04);resize:none;line-height:1.7;box-sizing:border-box;">'+App.esc(textarea.value)+'</textarea>'+
      '</div>';
    document.body.appendChild(editor);
    Preset._expandEl=editor;
    requestAnimationFrame(function(){requestAnimationFrame(function(){editor.style.transform='translateY(0)';editor.style.opacity='1';});});
    var ta=editor.querySelector('#psExpandTA');if(ta)ta.focus();
    function done(){textarea.value=editor.querySelector('#psExpandTA').value;editor.style.transform='translateY(100%)';editor.style.opacity='0';setTimeout(function(){if(editor.parentNode)editor.remove();Preset._expandEl=null;},350);}
    editor.querySelector('#psExpandBack').addEventListener('click',done);
    editor.querySelector('#psExpandDone').addEventListener('click',done);
  },

  // ====== 通用滑动返回 ======
  bindSwipeBack:function(page,onBack){
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
      if(dx>page.offsetWidth*0.3){page.style.transition='transform .25s,opacity .25s';page.style.transform='translateX(100%)';page.style.opacity='0';setTimeout(function(){page.style.transition='';page.style.transform='';page.style.opacity='';if(onBack)onBack();},260);}
      else{page.style.transition='transform .2s,opacity .2s';page.style.transform='';page.style.opacity='';setTimeout(function(){page.style.transition='';},220);}
    },{passive:true});
  },

  // ====== 对外接口 ======
  getEnabledPresets:function(){return Preset.list.filter(function(p){return p.enabled!==false;});},
  isSysEnabled:function(sysId){if(!Preset.config.sysToggles)return true;return Preset.config.sysToggles[sysId]!==false;},
  init:function(){Preset.load();App.preset=Preset;}
};

App.register('preset',Preset);
})();
