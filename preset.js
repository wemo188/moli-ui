
(function(){
'use strict';
var App=window.App;if(!App)return;

var SYS_ITEMS=[
  {id:'sys_char_worldbook_before',name:'角色世界书（前）',desc:'角色档案之前的世界书条目',enabled:true,system:true},
  {id:'sys_char_profile',name:'角色档案',desc:'角色的基础设定',enabled:true,system:true},
  {id:'sys_char_worldbook_after',name:'角色世界书（后）',desc:'角色档案之后的世界书条目',enabled:true,system:true},
  {id:'sys_memory',name:'记忆总结',desc:'AI对历史对话的总结记忆',enabled:true,system:true},
  {id:'sys_post',name:'后置指令',desc:'在对话末尾追加的指令',enabled:true,system:true},
  {id:'sys_history',name:'聊天历史',desc:'发送给AI的历史消息',enabled:true,system:true}
];

var HAS_TOGGLE=['sys_memory','sys_post','sys_history'];

var Preset={
  list:[],
  activeId:null,
  config:{},
  _editingIdx:-1,
  _homeEl:null,
  _editEl:null,
  _dragState:null,

  load:function(){
    Preset.list=App.LS.get('presetList')||[];
    Preset.config=App.LS.get('presetConfig')||{};
    if(!Preset.config.sysToggles)Preset.config.sysToggles={};
    SYS_ITEMS.forEach(function(s){
      if(Preset.config.sysToggles[s.id]===undefined)Preset.config.sysToggles[s.id]=true;
    });
    Preset.activeId=Preset.config.activeId||null;
  },
  save:function(){
    App.LS.set('presetList',Preset.list);
    Preset.config.activeId=Preset.activeId;
    App.LS.set('presetConfig',Preset.config);
  },

  open:function(){
    Preset.load();
    if(Preset._homeEl)Preset._homeEl.remove();

    var page=document.createElement('div');
    page.className='ps-home-page';
    Preset._homeEl=page;
    document.body.appendChild(page);

    Preset.renderHome();

    requestAnimationFrame(function(){requestAnimationFrame(function(){
      page.classList.add('show');
    });});
  },

  close:function(){
    var page=Preset._homeEl;
    if(!page)return;
    page.classList.remove('show');
    setTimeout(function(){if(page.parentNode)page.remove();Preset._homeEl=null;},350);
  },

  renderHome:function(){
    var page=Preset._homeEl;
    if(!page)return;

    // 系统组件
    var sysHtml=SYS_ITEMS.map(function(s){
      var isOn=Preset.config.sysToggles[s.id]!==false;
      var hasToggle=HAS_TOGGLE.indexOf(s.id)>=0;
      return '<div class="ps-item is-sys">'+
        '<div class="ps-drag"></div>'+
        '<div class="ps-info"><div class="ps-name">'+App.esc(s.name)+'</div><div class="ps-desc">'+App.esc(s.desc)+'</div></div>'+
        '<div class="ps-tag on">系统</div>'+
        (hasToggle?'<div class="ps-sw '+(isOn?'on':'off')+'" data-sys-id="'+s.id+'"></div>':'')+
      '</div>';
    }).join('');

    // 用户预设卡片
    var userHtml='';
    if(!Preset.list.length){
      userHtml='<div style="padding:40px 20px;text-align:center;color:#bbb;font-size:13px;">暂无自定义预设</div>';
    } else {
      userHtml=Preset.list.map(function(p,i){
        var isActive=Preset.activeId===p.id;
        var depthTag=p.mode==='depth'?' <span class="ps-tag depth">D'+p.depth+'</span>':'';

        return '<div class="ps-home-card'+(isActive?' active-preset':'')+'" data-idx="'+i+'">'+
          '<div class="ps-home-card-info">'+
            '<div class="ps-home-card-name">'+App.esc(p.name||'未命名')+depthTag+'</div>'+
            '<div class="ps-home-card-desc">'+(p.enabled!==false?'已启用':'已禁用')+' · '+App.esc((p.content||'').slice(0,40))+'</div>'+
          '</div>'+
          '<div class="ps-home-actions">'+
            (isActive?'<div class="ps-mini-btn del" data-act="delete" data-idx="'+i+'" title="删除"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>':'')+
            '<div class="ps-mini-btn" data-act="activate" data-idx="'+i+'" title="'+(isActive?'取消激活':'激活')+'"><svg viewBox="0 0 24 24">'+(isActive?'<path d="M18 6L6 18M6 6l12 12"/>':'<polyline points="20 6 9 17 4 12"/>')+'</svg></div>'+
            '<div class="ps-mini-btn" data-act="dots" data-idx="'+i+'" title="更多"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="#7a9ab8" stroke="none"/></svg></div>'+
          '</div>'+
        '</div>';
      }).join('');
    }

    // 搜索栏
    var toolbarHtml=
      '<div class="ps-toolbar">'+
        '<div class="ps-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="psSearchInput" placeholder="搜索预设..."></div>'+
        '<button class="ps-add-btn" id="psAddBtn" type="button">+ 新建</button>'+
      '</div>';

    page.innerHTML=
      '<div class="ps-header">'+
        '<button class="ps-back" id="psHomeBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<div class="ps-header-title">预设管理</div>'+
        '<div style="width:36px;"></div>'+
      '</div>'+
      toolbarHtml+
      '<div class="ps-home-list" id="psHomeList">'+
        '<div class="ps-section-label">系统组件</div>'+
        sysHtml+
        '<div class="ps-divider"></div>'+
        '<div class="ps-section-label">自定义预设</div>'+
        userHtml+
      '</div>';

    Preset.bindHomeEvents(page);
  },

  bindHomeEvents:function(page){
    page.querySelector('#psHomeBack').addEventListener('click',function(){Preset.close();});
    page.querySelector('#psAddBtn').addEventListener('click',function(){Preset.openEdit(-1);});

    // 搜索
    var searchInput=page.querySelector('#psSearchInput');
    if(searchInput){
      searchInput.addEventListener('input',function(){
        var q=this.value.trim().toLowerCase();
        page.querySelectorAll('.ps-home-card').forEach(function(card){
          var idx=parseInt(card.dataset.idx);
          var p=Preset.list[idx];
          if(!p){card.style.display='';return;}
          var match=!q||p.name.toLowerCase().indexOf(q)>=0||(p.content||'').toLowerCase().indexOf(q)>=0;
          card.style.display=match?'':'none';
        });
      });
    }

    // 系统项开关
    page.querySelectorAll('.ps-sw').forEach(function(sw){
      sw.addEventListener('click',function(e){
        e.stopPropagation();
        var id=sw.dataset.sysId;
        var isOn=sw.classList.contains('on');
        Preset.config.sysToggles[id]=!isOn;
        Preset.save();
        sw.classList.toggle('on',!isOn);
        sw.classList.toggle('off',isOn);
      });
    });

    // 激活按钮
    page.querySelectorAll('[data-act="activate"]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(btn.dataset.idx);
        var p=Preset.list[idx];if(!p)return;
        if(Preset.activeId===p.id){
          Preset.activeId=null;
          App.showToast('已取消激活');
        } else {
          Preset.activeId=p.id;
          App.showToast('已激活：'+p.name);
        }
        Preset.save();
        Preset.renderHome();
      });
    });

    // 删除按钮（激活预设旁边的）
    page.querySelectorAll('[data-act="delete"]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(btn.dataset.idx);
        if(!confirm('确定删除这个预设？'))return;
        var p=Preset.list[idx];
        if(p&&Preset.activeId===p.id)Preset.activeId=null;
        Preset.list.splice(idx,1);
        Preset.save();
        Preset.renderHome();
        App.showToast('已删除');
      });
    });

    // 三个点菜单
    page.querySelectorAll('[data-act="dots"]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(btn.dataset.idx);
        Preset.showDotsMenu(btn,idx);
      });
    });

    // 长按拖拽排序
    var cards=page.querySelectorAll('.ps-home-card');
    cards.forEach(function(card){
      var timer=null,pressed=false,moved=false,startY=0,startIdx=0;
      var gap=null;

      card.addEventListener('touchstart',function(e){
        if(e.target.closest('.ps-mini-btn'))return;
        if(e.target.closest('.ps-home-actions'))return;
        moved=false;pressed=false;
        var t=e.touches[0];
        startY=t.clientY;
        startIdx=parseInt(card.dataset.idx);

        timer=setTimeout(function(){
          pressed=true;
          if(navigator.vibrate)navigator.vibrate(15);
          card.classList.add('dragging');

          gap=document.createElement('div');
          gap.className='ps-gap-indicator';
          gap.style.opacity='0';
          document.body.appendChild(gap);
        },500);
      },{passive:true});

      card.addEventListener('touchmove',function(e){
        if(timer&&!pressed){
          var t=e.touches[0];
          if(Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}
          return;
        }
        if(!pressed)return;
        moved=true;
        e.preventDefault();
        e.stopPropagation();

        var t=e.touches[0];
        var dy=t.clientY-startY;
        card.style.transform='translateY('+dy+'px)';
        card.style.zIndex='100';

        var allCards=page.querySelectorAll('.ps-home-card');
        var targetIdx=startIdx;
        allCards.forEach(function(c,ci){
          if(ci===startIdx)return;
          var rect=c.getBoundingClientRect();
          var mid=rect.top+rect.height/2;
          if(t.clientY>mid&&ci>startIdx)targetIdx=ci;
          if(t.clientY<mid&&ci<startIdx)targetIdx=ci;
        });

        if(gap&&targetIdx!==startIdx){
          var targetCard=allCards[targetIdx];
          if(targetCard){
            var tr=targetCard.getBoundingClientRect();
            gap.style.top=(targetIdx>startIdx?tr.bottom:tr.top)+'px';
            gap.style.opacity='1';
          }
        }

        Preset._dragState={from:startIdx,to:targetIdx};
      },{passive:false});

      card.addEventListener('touchend',function(){
        clearTimeout(timer);timer=null;
        card.classList.remove('dragging');
        card.style.transform='';
        card.style.zIndex='';
        if(gap){gap.remove();gap=null;}

        if(pressed&&moved&&Preset._dragState){
          var from=Preset._dragState.from;
          var to=Preset._dragState.to;
          if(from!==to&&from>=0&&to>=0&&from<Preset.list.length&&to<Preset.list.length){
            var item=Preset.list.splice(from,1)[0];
            Preset.list.splice(to,0,item);
            Preset.save();
            Preset.renderHome();
            App.showToast('已排序');
          }
          Preset._dragState=null;
        }

        pressed=false;moved=false;
      },{passive:true});
    });
  },

  showDotsMenu:function(btnEl,idx){
    var old=document.querySelector('.ps-dots-menu');
    if(old)old.remove();

    var menu=document.createElement('div');
    menu.className='ps-dots-menu';
    menu.innerHTML=
      '<div class="ps-dots-mi" data-mact="edit">编辑</div>'+
      '<div class="ps-dots-mi" data-mact="copy">复制</div>'+
      '<div class="ps-dots-mi" data-mact="export">导出</div>'+
      '<div class="ps-dots-mi danger" data-mact="delete">删除</div>';

    var rect=btnEl.getBoundingClientRect();
    var left=rect.right-140;
    var top=rect.bottom+4;
    if(left<8)left=8;
    if(top+180>window.innerHeight)top=rect.top-180;
    if(top<10)top=10;
    menu.style.left=left+'px';
    menu.style.top=top+'px';
    document.body.appendChild(menu);

    menu.querySelectorAll('.ps-dots-mi').forEach(function(mi){
      mi.addEventListener('click',function(e){
        e.stopPropagation();
        var act=mi.dataset.mact;
        menu.remove();

        if(act==='edit'){
          Preset.openEdit(idx);
        }
        if(act==='copy'){
          var src=Preset.list[idx];
          if(!src)return;
          var cp=JSON.parse(JSON.stringify(src));
          cp.id='ps_'+Date.now();
          cp.name=cp.name+' (副本)';
          Preset.list.push(cp);
          Preset.save();
          Preset.renderHome();
          App.showToast('已复制');
        }
        if(act==='export'){
          var p=Preset.list[idx];
          if(!p)return;
          var blob=new Blob([JSON.stringify(p,null,2)],{type:'application/json'});
          var url=URL.createObjectURL(blob);
          var a=document.createElement('a');
          a.href=url;a.download='preset_'+(p.name||'export')+'_'+Date.now()+'.json';
          document.body.appendChild(a);a.click();document.body.removeChild(a);
          URL.revokeObjectURL(url);
          App.showToast('已导出');
        }
        if(act==='delete'){
          if(!confirm('确定删除这个预设？'))return;
          var dp=Preset.list[idx];
          if(dp&&Preset.activeId===dp.id)Preset.activeId=null;
          Preset.list.splice(idx,1);
          Preset.save();
          Preset.renderHome();
          App.showToast('已删除');
        }
      });
    });

    function dismiss(ev){
      if(menu.parentNode&&!menu.contains(ev.target)){
        menu.remove();
        document.removeEventListener('touchstart',dismiss);
        document.removeEventListener('click',dismiss);
      }
    }
    setTimeout(function(){
      document.addEventListener('touchstart',dismiss,{passive:true});
      document.addEventListener('click',dismiss);
    },100);
  },

  openEdit:function(idx){
    Preset._editingIdx=idx;
    var isNew=idx<0;
    var p=isNew?{id:'',name:'',content:'',mode:'normal',depth:4,enabled:true}:JSON.parse(JSON.stringify(Preset.list[idx]));

    if(Preset._editEl)Preset._editEl.remove();
    var page=document.createElement('div');
    page.className='ps-edit-page';
    Preset._editEl=page;

    page.innerHTML=
      '<div class="ps-header">'+
        '<button class="ps-back" id="psEditBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<div class="ps-header-title">'+(isNew?'新建预设':'编辑预设')+'</div>'+
        '<div style="width:36px;"></div>'+
      '</div>'+
      '<div class="ps-edit-body">'+
        '<div class="ps-edit-card">'+

          '<div class="ps-edit-section">'+
            '<div class="ps-edit-label"><div class="dot"></div>指令名称</div>'+
            '<input type="text" class="ps-edit-input" id="psEditName" value="'+App.escAttr(p.name||'')+'" placeholder="给这条指令起个名字...">'+
          '</div>'+

          '<div class="ps-edit-sep"></div>'+

          '<div class="ps-edit-section">'+
            '<div class="ps-edit-label"><div class="dot"></div>注入模式</div>'+
            '<div class="ps-mode-row">'+
              '<div class="ps-mode-btn'+(p.mode!=='depth'?' active':'')+'" data-mode="normal">普通模式</div>'+
              '<div class="ps-mode-btn'+(p.mode==='depth'?' active':'')+'" data-mode="depth">深度注入</div>'+
            '</div>'+
            '<div id="psDepthRow" style="'+(p.mode==='depth'?'':'display:none;')+'">'+
              '<div class="ps-depth-row">'+
                '<span style="font-size:12px;color:#7a9ab8;font-weight:600;">注入深度</span>'+
                '<input type="number" class="ps-depth-input" id="psEditDepth" value="'+(p.depth||4)+'" min="0" max="99">'+
              '</div>'+
              '<div class="ps-depth-hint" style="margin-top:6px;">数字越小越靠近最新消息。0 = 紧接在最后一条用户消息之前。</div>'+
            '</div>'+
            '<div class="ps-edit-hint">普通模式：预设内容追加在系统提示词末尾。<br>深度注入：预设内容插入到聊天历史中的指定位置。</div>'+
          '</div>'+

          '<div class="ps-edit-sep"></div>'+

          '<div class="ps-edit-section">'+
            '<div class="ps-edit-label"><div class="dot"></div>预设内容</div>'+
            '<textarea class="ps-edit-textarea" id="psEditContent" placeholder="在这里写预设指令内容...">'+App.esc(p.content||'')+'</textarea>'+
          '</div>'+

        '</div>'+

        '<div class="ps-edit-btns">'+
          '<button class="ps-save-btn" id="psEditSave" type="button">保存</button>'+
          '<button class="ps-cancel-btn" id="psEditCancel" type="button">取消</button>'+
        '</div>'+
      '</div>';

    document.body.appendChild(page);

    requestAnimationFrame(function(){requestAnimationFrame(function(){
      page.classList.add('show');
    });});

    // 模式切换
    page.querySelectorAll('.ps-mode-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        page.querySelectorAll('.ps-mode-btn').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        var depthRow=page.querySelector('#psDepthRow');
        if(btn.dataset.mode==='depth'){depthRow.style.display='';}
        else{depthRow.style.display='none';}
      });
    });

    page.querySelector('#psEditBack').addEventListener('click',function(){Preset.closeEdit();});
    page.querySelector('#psEditCancel').addEventListener('click',function(){Preset.closeEdit();});

    page.querySelector('#psEditSave').addEventListener('click',function(){
      var name=(page.querySelector('#psEditName').value||'').trim();
      var content=(page.querySelector('#psEditContent').value||'').trim();
      if(!name){App.showToast('请输入指令名称');return;}
      if(!content){App.showToast('请输入预设内容');return;}

      var modeBtn=page.querySelector('.ps-mode-btn.active');
      var mode=modeBtn?modeBtn.dataset.mode:'normal';
      var depth=parseInt(page.querySelector('#psEditDepth').value)||4;

      var obj={
        id:isNew?('ps_'+Date.now()):p.id,
        name:name,
        content:content,
        mode:mode,
        depth:depth,
        enabled:p.enabled!==false
      };

      if(isNew){
        Preset.list.push(obj);
      } else {
        Preset.list[idx]=obj;
      }
      Preset.save();
      Preset.closeEdit();
      Preset.renderHome();
      App.showToast(isNew?'已创建':'已保存');
    });
  },

  closeEdit:function(){
    var page=Preset._editEl;
    if(!page)return;
    page.classList.remove('show');
    setTimeout(function(){if(page.parentNode)page.remove();Preset._editEl=null;},350);
  },

  getActivePreset:function(){
    if(!Preset.activeId)return null;
    for(var i=0;i<Preset.list.length;i++){
      if(Preset.list[i].id===Preset.activeId)return Preset.list[i];
    }
    return null;
  },

  getEnabledPresets:function(){
    return Preset.list.filter(function(p){return p.enabled!==false;});
  },

  isSysEnabled:function(sysId){
    if(!Preset.config.sysToggles)return true;
    return Preset.config.sysToggles[sysId]!==false;
  },

  init:function(){
    Preset.load();
    App.preset=Preset;
  }
};

App.register('preset',Preset);
})();
