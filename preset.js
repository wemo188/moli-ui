
(function(){
'use strict';
var App=window.App;if(!App)return;

var DRAG_SVG='<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/></svg>';
var EDIT_SVG='<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
var DEL_SVG='<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>';
var CLOSE_SVG='<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

var SYS_ITEMS=[
  {id:'wb_before_char',name:'角色定义前的世界书',desc:'World Book (Before Char)'},
  {id:'char_profile',name:'角色档案',desc:'Character Profile'},
  {id:'wb_after_char',name:'角色定义后的世界书',desc:'World Book (After Char)'},
  {id:'wb_before_user',name:'用户定义前的世界书',desc:'World Book (Before User)'},
  {id:'user_info',name:'用户信息',desc:'User Profile'},
  {id:'wb_after_user',name:'用户定义后的世界书',desc:'World Book (After User)'},
  {id:'scene',name:'场景 / 时间线',desc:'Scene / Timeline'},
  {id:'examples',name:'示例对话',desc:'Example Dialogue'},
  {id:'chat_history',name:'聊天历史',desc:'Chat History'},
  {id:'post_instruction',name:'角色档案的后置指令',desc:'Post Instruction'}
];

var SYS_IDS=SYS_ITEMS.map(function(s){return s.id;});

var Preset={
  config:null,

  load:function(){
    Preset.config=App.LS.get('presetConfig');
    if(!Preset.config){
      Preset.config={
        name:'默认预设',
        sysEnabled:{},
        order:SYS_IDS.slice(),
        userPresets:{},
        _savedPositions:{}
      };
      SYS_IDS.forEach(function(id){Preset.config.sysEnabled[id]=true;});
    }
    if(!Preset.config.order)Preset.config.order=SYS_IDS.slice();
    if(!Preset.config.sysEnabled){Preset.config.sysEnabled={};SYS_IDS.forEach(function(id){Preset.config.sysEnabled[id]=true;});}
    if(!Preset.config.userPresets)Preset.config.userPresets={};
    if(!Preset.config._savedPositions)Preset.config._savedPositions={};
  },

  save:function(){App.LS.set('presetConfig',Preset.config);},

  getSysItem:function(id){
    for(var i=0;i<SYS_ITEMS.length;i++){if(SYS_ITEMS[i].id===id)return SYS_ITEMS[i];}
    return null;
  },

  isSysId:function(id){return SYS_IDS.indexOf(id)>=0;},

  getOrderedItems:function(){
    var order=Preset.config.order;
    var result=[];
    order.forEach(function(id){
      if(Preset.isSysId(id)){
        result.push({type:'sys',id:id,data:Preset.getSysItem(id)});
      }else{
        var up=Preset.config.userPresets[id];
        if(up&&up.mode==='relative'){
          result.push({type:'user',id:id,data:up});
        }
      }
    });
    return result;
  },

  getDepthPresets:function(){
    var list=[];
    Object.keys(Preset.config.userPresets).forEach(function(id){
      var up=Preset.config.userPresets[id];
      if(up&&up.mode==='depth')list.push({id:id,data:up});
    });
    list.sort(function(a,b){return(a.data.depth||0)-(b.data.depth||0);});
    return list;
  },

  _renderUserItem:function(id,up,isActive){
    var depthTag=up.mode==='depth'?'<span class="ps-tag depth">深度 '+(up.depth||0)+'</span>':'';
    if(isActive){
      return '<div class="ps-item is-user" data-id="'+id+'">'+
        '<div class="ps-drag">'+DRAG_SVG+'</div>'+
        '<div class="ps-info"><div class="ps-name">'+App.esc(up.name||'未命名')+'</div><div class="ps-desc">'+App.esc((up.content||'').slice(0,40))+'</div></div>'+
        depthTag+
        '<div class="ps-mini-btn edit" data-edit-id="'+id+'">'+EDIT_SVG+'</div>'+
        '<div class="ps-deact-btn" data-deact-id="'+id+'" style="width:28px;height:28px;border-radius:7px;border:1.5px solid #1a1a1a;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;flex-shrink:0;"><svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:#1a1a1a;stroke-width:2.5;stroke-linecap:round;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>'+
      '</div>';
    }else{
      return '<div class="ps-item is-user is-inactive" data-id="'+id+'">'+
        '<div class="ps-drag" style="opacity:.25;">'+DRAG_SVG+'</div>'+
        '<div class="ps-info" style="opacity:.5;"><div class="ps-name">'+App.esc(up.name||'未命名')+'</div><div class="ps-desc">'+App.esc((up.content||'').slice(0,40))+'</div></div>'+
        depthTag+
        '<div class="ps-mini-btn edit" data-edit-id="'+id+'">'+EDIT_SVG+'</div>'+
        '<div class="ps-mini-btn del" data-del-id="'+id+'">'+DEL_SVG+'</div>'+
        '<div class="ps-react-btn" data-react-id="'+id+'" style="width:28px;height:28px;border-radius:7px;border:1.5px solid #6bab8e;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;flex-shrink:0;"><svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:#6bab8e;stroke-width:2.5;stroke-linecap:round;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>'+
      '</div>';
    }
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
    var orderedItems=Preset.getOrderedItems();
    var depthItems=Preset.getDepthPresets();

    var activeHtml='';
    var inactiveItems=[];

    orderedItems.forEach(function(item){
      if(item.type==='sys'){
        var on=cfg.sysEnabled[item.id]!==false;
        activeHtml+=
          '<div class="ps-item is-sys" data-id="'+item.id+'">'+
            '<div class="ps-drag">'+DRAG_SVG+'</div>'+
            '<div class="ps-info"><div class="ps-name">'+App.esc(item.data.name)+'</div><div class="ps-desc">'+App.esc(item.data.desc)+'</div></div>'+
            '<div class="ps-sw '+(on?'on':'off')+'" data-sw-id="'+item.id+'"></div>'+
          '</div>';
      }else{
        var up=item.data;
        if(up.enabled===false){
          inactiveItems.push({id:item.id,data:up});
        }else{
          activeHtml+=Preset._renderUserItem(item.id,up,true);
        }
      }
    });

    depthItems.forEach(function(item){
      if(item.data.enabled===false){
        inactiveItems.push({id:item.id,data:item.data});
      }else{
        activeHtml+=Preset._renderUserItem(item.id,item.data,true);
      }
    });

    var inactiveHtml='';
    if(inactiveItems.length){
      inactiveItems.forEach(function(item){
        inactiveHtml+=Preset._renderUserItem(item.id,item.data,false);
      });
    }else{
      inactiveHtml='<div style="padding:16px 18px;font-size:11px;color:#ccc;">暂无未激活预设</div>';
    }

    page.innerHTML=
      '<div class="ps-header">'+
        '<button class="ps-back" id="psBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<span class="ps-header-title">'+App.esc(cfg.name)+'</span>'+
        '<span class="ps-header-edit" id="psRenameBtn">编辑名称</span>'+
      '</div>'+
      '<div class="ps-hint-bar"><div class="ps-hint-text">发送给模型读取的顺序，根据你的需求排列预设吧，关闭则不发送哦</div></div>'+
      '<div class="ps-toolbar">'+
        '<div class="ps-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="psSearchInput" placeholder="搜索..."></div>'+
        '<button class="ps-add-btn" id="psAddBtn" type="button">+ 添加</button>'+
      '</div>'+
      '<div class="ps-list" id="psList">'+
        activeHtml+
        '<div class="ps-divider"></div>'+
        '<div class="ps-section-label">未激活</div>'+
        inactiveHtml+
      '</div>';

    Preset.bindListEvents(page);
  },

  bindListEvents:function(page){
    page.querySelector('#psBackBtn').addEventListener('click',function(){Preset.close();});
    page.querySelector('#psAddBtn').addEventListener('click',function(){Preset.openEdit(null);});

    page.querySelector('#psRenameBtn').addEventListener('click',function(){
      var name=prompt('预设名称：',Preset.config.name||'');
      if(name===null)return;
      name=name.trim();
      if(name){Preset.config.name=name;Preset.save();Preset.renderList(page);}
    });

    // 系统项开关
    page.querySelectorAll('[data-sw-id]').forEach(function(sw){
      sw.addEventListener('click',function(e){
        e.stopPropagation();
        var id=sw.dataset.swId;
        var on=sw.classList.contains('on');
        Preset.config.sysEnabled[id]=!on;
        sw.classList.toggle('on');sw.classList.toggle('off');
        Preset.save();
      });
    });

    // 停用按钮（黑色X，激活→未激活）
    page.querySelectorAll('[data-deact-id]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var id=btn.dataset.deactId;
        var up=Preset.config.userPresets[id];if(!up)return;
        // 记住当前位置
        var idx=Preset.config.order.indexOf(id);
        if(idx>=0)Preset.config._savedPositions[id]=idx;
        up.enabled=false;
        Preset.save();Preset.renderList(page);
      });
    });

    // 激活按钮（绿色X，未激活→激活，回到之前的位置）
    page.querySelectorAll('[data-react-id]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var id=btn.dataset.reactId;
        var up=Preset.config.userPresets[id];if(!up)return;
        up.enabled=true;
        // 恢复位置
        if(up.mode==='relative'){
          var savedIdx=Preset.config._savedPositions[id];
          var curIdx=Preset.config.order.indexOf(id);
          if(curIdx<0){
            // 不在order里，插回去
            if(savedIdx!==undefined&&savedIdx>=0&&savedIdx<=Preset.config.order.length){
              Preset.config.order.splice(savedIdx,0,id);
            }else{
              Preset.config.order.unshift(id);
            }
          }
        }
        delete Preset.config._savedPositions[id];
        Preset.save();Preset.renderList(page);
      });
    });

    // 编辑
    page.querySelectorAll('[data-edit-id]').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();Preset.openEdit(btn.dataset.editId);});
    });

    // 删除（只在未激活区域出现）
    page.querySelectorAll('[data-del-id]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var id=btn.dataset.delId;
        var up=Preset.config.userPresets[id];
        if(!up)return;
        if(!confirm('删除预设「'+(up.name||'未命名')+'」？'))return;
        delete Preset.config.userPresets[id];
        delete Preset.config._savedPositions[id];
        var idx=Preset.config.order.indexOf(id);
        if(idx>=0)Preset.config.order.splice(idx,1);
        Preset.save();Preset.renderList(page);
        App.showToast('已删除');
      });
    });

    // 搜索
    var searchInput=page.querySelector('#psSearchInput');
    if(searchInput){
      searchInput.addEventListener('input',function(){
        var val=this.value.trim().toLowerCase();
        page.querySelectorAll('.ps-item').forEach(function(el){
          var name=el.querySelector('.ps-name');
          el.style.display=(!val||name.textContent.toLowerCase().indexOf(val)>=0)?'':'none';
        });
      });
    }

    Preset.bindDrag(page);
  },

  bindDrag:function(page){
    var list=page.querySelector('#psList');if(!list)return;
    var dragEl=null,startY=0,offsetY=0,dragId='',longPressed=false,timer=null,moved=false;

    list.addEventListener('touchstart',function(e){
      var item=e.target.closest('.ps-item.is-user:not(.is-inactive)');
      if(!item)return;
      var t=e.touches[0];
      startY=t.clientY;moved=false;longPressed=false;
      dragId=item.dataset.id;dragEl=item;

      timer=setTimeout(function(){
        if(!dragEl||moved)return;
        longPressed=true;
        dragEl.classList.add('dragging');
        if(navigator.vibrate)navigator.vibrate(15);
      },400);
    },{passive:true});

    list.addEventListener('touchmove',function(e){
      if(!dragEl)return;
      var dy=Math.abs(e.touches[0].clientY-startY);
      if(!longPressed){
        if(dy>8){clearTimeout(timer);timer=null;dragEl=null;}
        return;
      }
      e.preventDefault();
      moved=true;
      offsetY=e.touches[0].clientY-startY;
      dragEl.style.transform='translateY('+offsetY+'px)';
    },{passive:false});

    list.addEventListener('touchend',function(){
      clearTimeout(timer);timer=null;
      if(!dragEl||!longPressed){if(dragEl){dragEl=null;}return;}
      dragEl.classList.remove('dragging');
      dragEl.style.transform='';

      var items=list.querySelectorAll('.ps-item:not(.is-inactive)');
      var rects=[];var ids=[];
      items.forEach(function(it){rects.push(it.getBoundingClientRect());ids.push(it.dataset.id);});

      var dragRect=dragEl.getBoundingClientRect();
      var centerY=dragRect.top+dragRect.height/2;

      var newOrder=[];var inserted=false;
      for(var i=0;i<ids.length;i++){
        if(ids[i]===dragId)continue;
        if(!Preset.isSysId(ids[i])&&Preset.config.userPresets[ids[i]]&&Preset.config.userPresets[ids[i]].mode==='depth')continue;
        var mid=rects[i].top+rects[i].height/2;
        if(!inserted&&centerY<mid){newOrder.push(dragId);inserted=true;}
        newOrder.push(ids[i]);
      }
      if(!inserted)newOrder.push(dragId);

      // 补回depth预设和未在newOrder里的relative预设
      var finalOrder=[];
      var usedIds={};
      newOrder.forEach(function(id){usedIds[id]=true;});
      // 用newOrder作为基础，但要确保系统项顺序没乱
      var sysInOrder=newOrder.filter(function(id){return Preset.isSysId(id);});
      var valid=true;
      for(var j=0;j<sysInOrder.length-1;j++){
        if(SYS_IDS.indexOf(sysInOrder[j])>SYS_IDS.indexOf(sysInOrder[j+1])){valid=false;break;}
      }

      if(valid){
        Preset.config.order=newOrder;
        Preset.save();
      }

      Preset.renderList(page);
      dragEl=null;dragId='';offsetY=0;longPressed=false;moved=false;
    },{passive:true});
  },

  openEdit:function(editId){
    var isNew=!editId;
    var up=isNew?{name:'',content:'',mode:'relative',depth:0,enabled:true}:Preset.config.userPresets[editId];
    if(!up&&!isNew)return;
    if(!isNew)up=JSON.parse(JSON.stringify(up));

    var old=App.$('#presetEditPage');if(old)old.remove();
    var page=document.createElement('div');
    page.id='presetEditPage';
    page.className='ps-edit-page';
    document.body.appendChild(page);

    var currentMode=up.mode||'relative';

    page.innerHTML=
      '<div class="ps-header">'+
        '<button class="ps-back" id="psEditBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<span class="ps-header-title">'+(isNew?'添加预设':'编辑预设')+'</span>'+
        '<div style="width:36px;"></div>'+
      '</div>'+
      '<div class="ps-edit-body"><div class="ps-edit-card">'+

        '<div class="ps-edit-section"><div class="ps-edit-label"><div class="dot"></div>预设名称</div><input type="text" class="ps-edit-input" id="psEditName" placeholder="给这条预设起个名字..." value="'+App.escAttr(up.name||'')+'"></div>'+

        '<div class="ps-edit-sep"></div>'+

        '<div class="ps-edit-section"><div class="ps-edit-label"><div class="dot"></div>指令内容</div><textarea class="ps-edit-textarea" id="psEditContent" placeholder="输入预设指令内容...">'+App.esc(up.content||'')+'</textarea></div>'+

        '<div class="ps-edit-sep"></div>'+

        '<div class="ps-edit-section">'+
          '<div class="ps-edit-label"><div class="dot"></div>位置模式</div>'+
          '<div class="ps-mode-row">'+
            '<div class="ps-mode-btn'+(currentMode==='relative'?' active':'')+'" data-mode="relative">相对位置</div>'+
            '<div class="ps-mode-btn'+(currentMode==='depth'?' active':'')+'" data-mode="depth">注入深度</div>'+
          '</div>'+
          '<div id="psModeTip"></div>'+
          '<div id="psDepthRow" style="'+(currentMode==='depth'?'':'display:none;')+'"><div class="ps-depth-row"><input type="number" class="ps-depth-input" id="psEditDepth" min="0" max="50" value="'+(up.depth||0)+'"><div class="ps-depth-hint">0 = 紧贴用户最新消息<br>数字越大，插入位置越靠前</div></div></div>'+
        '</div>'+

        '<div class="ps-edit-btns"><button class="ps-save-btn" id="psEditSave" type="button">保 存</button><button class="ps-cancel-btn" id="psEditCancel" type="button">取 消</button></div>'+

      '</div></div>';

    requestAnimationFrame(function(){requestAnimationFrame(function(){page.classList.add('show');});});

    function updateTip(){
      var tip=page.querySelector('#psModeTip');
      if(currentMode==='relative'){
        tip.innerHTML='<div class="ps-edit-hint">穿插到列表中你滑动的位置，按排列顺序发送给模型。</div>';
      }else{
        tip.innerHTML='<div class="ps-edit-hint">注入到聊天历史中指定深度。深度越小越接近最新消息，AI越重视。</div>';
      }
    }
    updateTip();

    page.querySelectorAll('.ps-mode-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        page.querySelectorAll('.ps-mode-btn').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        currentMode=btn.dataset.mode;
        page.querySelector('#psDepthRow').style.display=currentMode==='depth'?'':'none';
        updateTip();
      });
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

      var data={name:name,content:content,mode:currentMode,depth:depth,enabled:true};

      if(isNew){
        var id='up_'+Date.now();
        Preset.config.userPresets[id]=data;
        if(currentMode==='relative'){
          Preset.config.order.unshift(id);
        }
      }else{
        data.enabled=up.enabled;
        var oldMode=Preset.config.userPresets[editId]?Preset.config.userPresets[editId].mode:'relative';
        Preset.config.userPresets[editId]=data;

        if(oldMode==='relative'&&currentMode==='depth'){
          var oi=Preset.config.order.indexOf(editId);
          if(oi>=0)Preset.config.order.splice(oi,1);
        }
        if(oldMode==='depth'&&currentMode==='relative'){
          if(Preset.config.order.indexOf(editId)<0){
            Preset.config.order.unshift(editId);
          }
        }
      }

      Preset.save();
      closeEdit();
      var listPage=App.$('#presetPage');
      if(listPage)Preset.renderList(listPage);
      App.showToast(isNew?'已创建':'已保存');
    });

    function closeEdit(){
      page.classList.remove('show');
      setTimeout(function(){if(page.parentNode)page.remove();},350);
    }
  },

  getSysOrder:function(){
    if(!Preset.config)Preset.load();
    return Preset.config.order.filter(function(id){return Preset.isSysId(id);});
  },

  isSysEnabled:function(id){
    if(!Preset.config)Preset.load();
    return Preset.config.sysEnabled[id]!==false;
  },

  getRelativePresets:function(){
    if(!Preset.config)Preset.load();
    var result=[];
    Preset.config.order.forEach(function(id){
      if(Preset.isSysId(id))return;
      var up=Preset.config.userPresets[id];
      if(up&&up.mode==='relative'&&up.enabled!==false&&up.content){
        result.push({id:id,afterId:null,content:up.content,name:up.name});
      }
    });
    var order=Preset.config.order;
    for(var i=0;i<result.length;i++){
      var upId=result[i].id;
      var idx=order.indexOf(upId);
      for(var j=idx-1;j>=0;j--){
        if(Preset.isSysId(order[j])){result[i].afterId=order[j];break;}
      }
    }
    return result;
  },

  getActiveDepthPresets:function(){
    if(!Preset.config)Preset.load();
    var list=[];
    Object.keys(Preset.config.userPresets).forEach(function(id){
      var up=Preset.config.userPresets[id];
      if(up&&up.mode==='depth'&&up.enabled!==false&&up.content){
        list.push({id:id,depth:up.depth||0,content:up.content,name:up.name});
      }
    });
    list.sort(function(a,b){return a.depth-b.depth;});
    return list;
  },

  getFullOrder:function(){
    if(!Preset.config)Preset.load();
    return Preset.config.order.slice();
  },

  init:function(){
    Preset.load();
    App.preset=Preset;
  }
};

App.register('preset',Preset);
})();
