(function(){
'use strict';
var App=window.App;if(!App)return;

var DRAG_SVG='<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/></svg>';
var EDIT_SVG='<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
var DEL_SVG='<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>';

var SYS_ITEMS=[
  {id:'wb_before_char',name:'角色定义前的世界书',desc:'世界观 · 背景设定'},
  {id:'char_profile',name:'角色档案',desc:'姓名 · 性格 · 设定'},
  {id:'wb_after_char',name:'角色定义后的世界书',desc:'角色补充 · 特殊设定'},
  {id:'wb_before_user',name:'用户定义前的世界书',desc:'关系铺垫'},
  {id:'user_info',name:'用户信息',desc:'昵称 · 性别 · 简介'},
  {id:'wb_after_user',name:'用户定义后的世界书',desc:'用户补充 · 事件记录'},
  {id:'scene',name:'场景 / 时间线',desc:'当前情境 · 剧情背景'},
  {id:'examples',name:'示例对话',desc:'风格参考 · 说话方式'},
  {id:'chat_history',name:'聊天历史',desc:'最近对话上下文'},
  {id:'post_instruction',name:'角色档案的后置指令',desc:'角色的专属追加指令'}
];

var DEFAULT_ORDER=SYS_ITEMS.map(function(s){return s.id;});

var Preset={
  config:null,

  load:function(){
    Preset.config=App.LS.get('presetConfig');
    if(!Preset.config){
      Preset.config={
        name:'默认预设',
        sysOrder:DEFAULT_ORDER.slice(),
        sysEnabled:{},
        userPresets:[]
      };
      DEFAULT_ORDER.forEach(function(id){Preset.config.sysEnabled[id]=true;});
    }
    if(!Preset.config.sysOrder)Preset.config.sysOrder=DEFAULT_ORDER.slice();
    if(!Preset.config.sysEnabled)Preset.config.sysEnabled={};
    if(!Preset.config.userPresets)Preset.config.userPresets=[];
  },

  save:function(){App.LS.set('presetConfig',Preset.config);},

  getSysItem:function(id){
    for(var i=0;i<SYS_ITEMS.length;i++){if(SYS_ITEMS[i].id===id)return SYS_ITEMS[i];}
    return null;
  },

  open:function(){
    Preset.load();
    var old=App.$('#presetPage');if(old)old.remove();
    var page=document.createElement('div');
    page.id='presetPage';
    page.className='ps-page';
    document.body.appendChild(page);
    Preset.renderList(page);
    requestAnimationFrame(function(){requestAnimationFrame(function(){page.classList.add('show');});});
  },

  close:function(){
    var page=App.$('#presetPage');if(!page)return;
    page.classList.remove('show');
    setTimeout(function(){if(page.parentNode)page.remove();},350);
  },

  renderList:function(page){
    if(!page)page=App.$('#presetPage');if(!page)return;
    var cfg=Preset.config;
    var searchVal='';

    var sysHtml='';
    cfg.sysOrder.forEach(function(id){
      var item=Preset.getSysItem(id);if(!item)return;
      var on=cfg.sysEnabled[id]!==false;
      sysHtml+=
        '<div class="ps-sys-item" data-sys-id="'+id+'">'+
          '<div class="ps-drag">'+DRAG_SVG+'</div>'+
          '<div class="ps-sys-info"><div class="ps-sys-name">'+App.esc(item.name)+'</div><div class="ps-sys-desc">'+App.esc(item.desc)+'</div></div>'+
          '<div class="ps-sw '+(on?'on':'off')+'" data-sys-sw="'+id+'"></div>'+
        '</div>';
    });

    var userHtml='';
    cfg.userPresets.forEach(function(up,idx){
      var isActive=up.active&&up.enabled;
      userHtml+=
        '<div class="ps-user-item'+(isActive?'':' inactive')+'" data-up-idx="'+idx+'">'+
          '<div class="ps-drag">'+DRAG_SVG+'</div>'+
          '<div class="ps-user-dot '+(up.active?'active':'inactive')+'"></div>'+
          '<div class="ps-user-info"><div class="ps-user-name">'+App.esc(up.name||'未命名')+'</div><div class="ps-user-preview">'+App.esc((up.content||'').slice(0,50))+'</div></div>'+
          '<span class="ps-depth-tag">深度 '+up.depth+'</span>'+
          '<span class="ps-status-tag '+(up.active?'active':'inactive')+'">'+(up.active?'激活':'未激活')+'</span>'+
          '<div class="ps-mini-btn edit" data-edit-idx="'+idx+'">'+EDIT_SVG+'</div>'+
          '<div class="ps-mini-btn del" data-del-idx="'+idx+'">'+DEL_SVG+'</div>'+
          '<div class="ps-sw '+(up.enabled?'on':'off')+'" data-up-sw="'+idx+'"></div>'+
        '</div>';
    });

    if(!cfg.userPresets.length){
      userHtml='<div style="padding:30px 20px;text-align:center;color:#bbb;font-size:12px;">暂无自定义预设，点击右上角添加</div>';
    }

    page.innerHTML=
      '<div class="ps-header">'+
        '<button class="ps-back" id="psBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<span class="ps-header-title">'+App.esc(cfg.name)+'</span>'+
        '<span class="ps-header-edit" id="psRenameBtn">编辑名称</span>'+
      '</div>'+
      '<div class="ps-hint-bar"><div class="ps-hint-icon">i</div><div class="ps-hint-text">拖拽排列发送给模型的顺序，关闭则不发送。底部的用户预设可设置注入深度插入对话历史中。</div></div>'+
      '<div class="ps-toolbar">'+
        '<div class="ps-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="psSearchInput" placeholder="搜索预设..."></div>'+
        '<button class="ps-add-btn" id="psAddBtn" type="button">+ 添加</button>'+
      '</div>'+
      '<div class="ps-list" id="psList">'+
        sysHtml+
        '<div class="ps-divider"></div>'+
        userHtml+
      '</div>';

    Preset.bindListEvents(page);
  },

  bindListEvents:function(page){
    page.querySelector('#psBackBtn').addEventListener('click',function(){Preset.close();});
    page.querySelector('#psAddBtn').addEventListener('click',function(){Preset.openEdit(-1);});

    page.querySelector('#psRenameBtn').addEventListener('click',function(){
      var name=prompt('预设名称：',Preset.config.name||'');
      if(name===null)return;
      name=name.trim();
      if(name){Preset.config.name=name;Preset.save();Preset.renderList(page);}
    });

    // 系统项开关
    page.querySelectorAll('[data-sys-sw]').forEach(function(sw){
      sw.addEventListener('click',function(e){
        e.stopPropagation();
        var id=sw.dataset.sysSw;
        var on=sw.classList.contains('on');
        Preset.config.sysEnabled[id]=!on;
        sw.classList.toggle('on');sw.classList.toggle('off');
        Preset.save();
      });
    });

    // 用户预设开关
    page.querySelectorAll('[data-up-sw]').forEach(function(sw){
      sw.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(sw.dataset.upSw);
        var up=Preset.config.userPresets[idx];if(!up)return;
        up.enabled=!up.enabled;
        sw.classList.toggle('on');sw.classList.toggle('off');
        var item=sw.closest('.ps-user-item');
        if(item){
          item.classList.toggle('inactive',!up.active||!up.enabled);
        }
        Preset.save();
      });
    });

    // 编辑按钮
    page.querySelectorAll('[data-edit-idx]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        Preset.openEdit(parseInt(btn.dataset.editIdx));
      });
    });

    // 删除按钮
    page.querySelectorAll('[data-del-idx]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(btn.dataset.delIdx);
        var up=Preset.config.userPresets[idx];
        if(!up)return;
        if(!confirm('删除预设「'+up.name+'」？'))return;
        Preset.config.userPresets.splice(idx,1);
        Preset.save();
        Preset.renderList(page);
        App.showToast('已删除');
      });
    });

    // 搜索
    var searchInput=page.querySelector('#psSearchInput');
    if(searchInput){
      searchInput.addEventListener('input',function(){
        var val=this.value.trim().toLowerCase();
        page.querySelectorAll('.ps-sys-item').forEach(function(el){
          var name=el.querySelector('.ps-sys-name');
          el.style.display=(!val||name.textContent.toLowerCase().indexOf(val)>=0)?'':'none';
        });
        page.querySelectorAll('.ps-user-item').forEach(function(el){
          var name=el.querySelector('.ps-user-name');
          el.style.display=(!val||name.textContent.toLowerCase().indexOf(val)>=0)?'':'none';
        });
      });
    }

    // 拖拽排序
    Preset.bindDrag(page);
  },

  bindDrag:function(page){
    var list=page.querySelector('#psList');if(!list)return;
    var dragEl=null,dragType='',dragIdx=-1,startY=0,offsetY=0,placeholder=null;

    function getItems(type){
      if(type==='sys')return list.querySelectorAll('.ps-sys-item');
      return list.querySelectorAll('.ps-user-item');
    }

    list.addEventListener('touchstart',function(e){
      var handle=e.target.closest('.ps-drag');if(!handle)return;
      var item=handle.closest('.ps-sys-item')||handle.closest('.ps-user-item');if(!item)return;

      var t=e.touches[0];
      startY=t.clientY;
      offsetY=0;

      if(item.classList.contains('ps-sys-item')){
        dragType='sys';
        dragIdx=Array.from(list.querySelectorAll('.ps-sys-item')).indexOf(item);
      }else{
        dragType='user';
        dragIdx=parseInt(item.dataset.upIdx);
      }

      dragEl=item;
      var rect=item.getBoundingClientRect();

      setTimeout(function(){
        if(!dragEl)return;
        dragEl.classList.add('dragging');
        dragEl.style.position='relative';
        dragEl.style.zIndex='100';
        if(navigator.vibrate)navigator.vibrate(10);
      },150);
    },{passive:true});

    list.addEventListener('touchmove',function(e){
      if(!dragEl)return;
      e.preventDefault();
      var t=e.touches[0];
      offsetY=t.clientY-startY;
      dragEl.style.transform='translateY('+offsetY+'px)';
    },{passive:false});

    list.addEventListener('touchend',function(){
      if(!dragEl)return;
      dragEl.classList.remove('dragging');
      dragEl.style.position='';
      dragEl.style.zIndex='';
      dragEl.style.transform='';

      // 计算新位置
      var items=getItems(dragType);
      var rects=[];
      items.forEach(function(it){rects.push(it.getBoundingClientRect());});
      var dragRect=rects[dragType==='sys'?dragIdx:(function(){
        for(var i=0;i<items.length;i++){if(parseInt(items[i].dataset.upIdx)===dragIdx)return i;}return 0;
      })()];

      if(dragRect){
        var newIdx=dragType==='sys'?dragIdx:dragIdx;
        var centerY=dragRect.top+dragRect.height/2+offsetY;
        for(var i=0;i<rects.length;i++){
          var mid=rects[i].top+rects[i].height/2;
          if(centerY<mid){
            if(dragType==='sys') newIdx=i;
            else newIdx=parseInt(items[i].dataset.upIdx);
            break;
          }
          if(dragType==='sys') newIdx=i;
          else newIdx=parseInt(items[i].dataset.upIdx);
        }

        if(dragType==='sys'){
          var order=Preset.config.sysOrder;
          var moved=order.splice(dragIdx,1)[0];
          order.splice(newIdx,0,moved);
        }else{
          var ups=Preset.config.userPresets;
          var movedUp=ups.splice(dragIdx,1)[0];
          if(newIdx>dragIdx)newIdx--;
          if(newIdx<0)newIdx=0;
          if(newIdx>ups.length)newIdx=ups.length;
          ups.splice(newIdx,0,movedUp);
        }
        Preset.save();
        Preset.renderList(page);
      }

      dragEl=null;dragType='';dragIdx=-1;offsetY=0;
    },{passive:true});
  },

  openEdit:function(idx){
    var isNew=idx<0;
    var up=isNew?{name:'',content:'',depth:0,active:true,enabled:true}:Preset.config.userPresets[idx];
    if(!up)return;

    var old=App.$('#presetEditPage');if(old)old.remove();
    var page=document.createElement('div');
    page.id='presetEditPage';
    page.className='ps-edit-page';
    document.body.appendChild(page);

    page.innerHTML=
      '<div class="ps-header">'+
        '<button class="ps-back" id="psEditBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<span class="ps-header-title">'+(isNew?'创建预设':'编辑预设')+'</span>'+
        '<div style="width:36px;"></div>'+
      '</div>'+
      '<div class="ps-edit-body"><div class="ps-edit-card">'+
        '<div class="ps-edit-section"><div class="ps-edit-label"><div class="dot"></div>预设名称</div><input type="text" class="ps-edit-input" id="psEditName" placeholder="给这条预设起个名字..." value="'+App.escAttr(up.name||'')+'"></div>'+
        '<div class="ps-edit-sep"></div>'+
        '<div class="ps-edit-section"><div class="ps-edit-label"><div class="dot"></div>指令内容</div><textarea class="ps-edit-textarea" id="psEditContent" placeholder="输入预设指令内容...">'+App.esc(up.content||'')+'</textarea><div class="ps-edit-hint">预设指令会按照注入深度插入到对话历史中。深度0 = 紧贴最新消息（权重最高），数字越大越靠前（权重越低）。</div></div>'+
        '<div class="ps-edit-sep"></div>'+
        '<div class="ps-edit-section"><div class="ps-edit-label"><div class="dot"></div>注入深度</div><div class="ps-edit-depth-row"><input type="number" class="ps-edit-depth-input" id="psEditDepth" min="0" max="50" value="'+up.depth+'"><div class="ps-edit-depth-hint">0 = 紧贴用户最新消息<br>数字越大，插入位置越靠前</div></div></div>'+
        '<div class="ps-edit-sep"></div>'+
        '<div class="ps-edit-section"><div class="ps-edit-row"><div><div class="ps-edit-row-label">创建后立即激活</div><div class="ps-edit-row-desc">关闭后需要手动激活</div></div><div class="ps-sw '+(up.active?'on':'off')+'" id="psEditActive"></div></div></div>'+
        '<div class="ps-edit-btns"><button class="ps-save-btn" id="psEditSave" type="button">保 存</button><button class="ps-cancel-btn" id="psEditCancel" type="button">取 消</button></div>'+
      '</div></div>';

    requestAnimationFrame(function(){requestAnimationFrame(function(){page.classList.add('show');});});

    var activeOn=up.active;
    page.querySelector('#psEditActive').addEventListener('click',function(){
      activeOn=!activeOn;
      this.classList.toggle('on',activeOn);
      this.classList.toggle('off',!activeOn);
    });

    page.querySelector('#psEditBack').addEventListener('click',function(){closeEdit();});
    page.querySelector('#psEditCancel').addEventListener('click',function(){closeEdit();});

    page.querySelector('#psEditSave').addEventListener('click',function(){
      var name=page.querySelector('#psEditName').value.trim();
      if(!name){App.showToast('请输入预设名称');return;}
      var content=page.querySelector('#psEditContent').value.trim();
      if(!content){App.showToast('请输入指令内容');return;}
      var depth=parseInt(page.querySelector('#psEditDepth').value)||0;
      if(depth<0)depth=0;if(depth>50)depth=50;

      var data={name:name,content:content,depth:depth,active:activeOn,enabled:true};

      if(isNew){
        data.id='up_'+Date.now();
        Preset.config.userPresets.push(data);
      }else{
        data.id=up.id||('up_'+Date.now());
        data.enabled=up.enabled;
        Preset.config.userPresets[idx]=data;
      }

      Preset.save();
      closeEdit();
      Preset.renderList();
      App.showToast(isNew?'已创建':'已保存');
    });

    function closeEdit(){
      page.classList.remove('show');
      setTimeout(function(){if(page.parentNode)page.remove();},350);
    }
  },

  // 给 buildSystemPrompt 用的接口
  getSysOrder:function(){return Preset.config?Preset.config.sysOrder:DEFAULT_ORDER;},
  isSysEnabled:function(id){return Preset.config?Preset.config.sysEnabled[id]!==false:true;},
  getActiveUserPresets:function(){
    if(!Preset.config)return[];
    return Preset.config.userPresets.filter(function(up){return up.active&&up.enabled&&up.content;});
  },

  init:function(){
    Preset.load();
    App.preset=Preset;
  }
};

App.register('preset',Preset);
})();