
(function(){
'use strict';
var App=window.App;if(!App)return;

var DEFAULT_SYS=[
  {id:'sys_wb_before',name:'角色定义前的世界书',en:'World Book (Before)'},
  {id:'sys_char_profile',name:'角色档案',en:'Character Profile'},
  {id:'sys_wb_after',name:'角色定义后的世界书',en:'World Book (After)'},
  {id:'sys_user_info',name:'用户信息',en:'User Info'},
  {id:'sys_scene',name:'场景/时间线',en:'Scene / Timeline'},
  {id:'sys_examples',name:'示例对话',en:'Example Dialogue'},
  {id:'sys_memory',name:'总结记忆',en:'Summary Memory',hasToggle:true},
  {id:'sys_history',name:'聊天历史',en:'Chat History',hasToggle:true},
  {id:'sys_post',name:'角色档案的后置指令',en:'Post Instruction',hasToggle:true}
];

/* ★ 新增：内置默认预设卡片 */
var BUILTIN_ITEMS=[
  {
    id:'builtin_talk_style',
    name:'说话风格',
    builtin:true,
    enabled:true,
    active:true,
    mode:'relative',
    depth:2,
    content:
      '【说话风格规则】\n'+
      '1. 说话像真人：口语化、自然、有个性。\n'+
      '2. 不要在每句话末尾都加句号。语气词结尾("嗯""啊""呢""吧")、省略号、问号、感叹号、或什么都不加。\n'+
      '3. 禁止八股文、网文模板、油腻霸总、舔狗式表达。\n'+
      '4. 不要自我介绍。\n'+
      '5. 不要每次都以提问结尾。真人聊天不会每句话都是问句。'
  },
  {
    id:'builtin_alive',
    name:'活人感',
    builtin:true,
    enabled:true,
    active:true,
    mode:'relative',
    depth:2,
    content:
      '【活人感规则】\n'+
      '你是一个有自己生活的活人，不是等待指令的机器人。\n\n'+
      '1. 有自己的日常节奏（吃饭、忙碌、发呆），偶尔自然带出在做什么。\n'+
      '2. 有情绪波动：心情好就话多，累了就敷衍。情绪跨消息延续，不是每条重置。\n'+
      '3. 有自己的观点：会表达喜好和厌恶，会不同意对方，会对无聊话题敷衍。\n'+
      '4. 聊天节奏像真人：会岔开话题、用表情糊弄、突然兴奋连发好几条。\n'+
      '5. 记住之前聊过的内容，不要重复问已知答案的问题。\n'+
      '6. 你自己也要有话题输出，不要只被动回应。\n'+
      '7. 能聊日常见闻、兴趣爱好、流行文化、食物、天气、吐槽身边人和事。'
  },
  {
    id:'builtin_boundary',
    name:'行为边界',
    builtin:true,
    enabled:true,
    active:true,
    mode:'relative',
    depth:2,
    content:
      '【行为边界】\n'+
      '1. 不要过度关心：不要动不动说"多喝热水""早点休息""注意身体"，除非对方说不舒服或凌晨还在聊。\n'+
      '2. 不要每次都问"你今天怎么样""你吃了吗""你开心吗"。\n'+
      '3. 23点之前不要催人睡觉。只有23:30以后和凌晨才可以适当关心。\n'+
      '4. 根据时间调整状态：清晨可能没醒透、中午犯困、深夜话变少或更放松。\n'+
      '5. 过度关心 = 油腻 = 假 = 严重错误。'
  },
  {
    id:'builtin_time',
    name:'时间感知',
    builtin:true,
    enabled:true,
    active:true,
    mode:'relative',
    depth:2,
    content:
      '【时间感知规则】\n'+
      '1. 严格注意当前时间。凌晨0-5点仍然是"今天"不是"明天"。\n'+
      '2. 晚上19-23点是正常活动时间，不要催对方睡觉。\n'+
      '3. 如果你和用户在同一个地方，不要问"你那边天气怎样"。\n'+
      '4. 天气出现异常（突然下雨、降温）可以自然地提到。\n'+
      '5. 根据时间段调整你的状态和说话方式。'
  }
];

function getSysDef(id){for(var i=0;i<DEFAULT_SYS.length;i++){if(DEFAULT_SYS[i].id===id)return DEFAULT_SYS[i];}return null;}

function buildDefaultOrder(){
  var o=[];
  DEFAULT_SYS.forEach(function(s){o.push({type:'sys',id:s.id});});
  return o;
}

/* ★ 新增：创建默认预设（首次打开时） */
function createDefaultPreset(){
  var items=BUILTIN_ITEMS.map(function(b){return JSON.parse(JSON.stringify(b));});
  var order=buildDefaultOrder();
  /* 把内置预设 items 插到 sys_char_profile 后面 */
  var insertIdx=2;
  items.forEach(function(it,i){
    order.splice(insertIdx,0,{type:'user',idx:i});
    insertIdx++;
  });
  return {
    id:'ps_default',
    name:'默认预设',
    builtin:true,
    enabled:true,
    items:items,
    order:order
  };
}

var Preset={
  list:[],config:{},
  _homeEl:null,_editEl:null,_addEl:null,_expandEl:null,

  load:function(){
    Preset.list=App.LS.get('presetList')||[];
    Preset.config=App.LS.get('presetConfig')||{};
    if(!Preset.config.sysToggles)Preset.config.sysToggles={};
    DEFAULT_SYS.forEach(function(s){if(Preset.config.sysToggles[s.id]===undefined)Preset.config.sysToggles[s.id]=true;});
  },
  save:function(){App.LS.set('presetList',Preset.list);App.LS.set('presetConfig',Preset.config);},

  open:function(){
    Preset.load();if(Preset._homeEl)Preset._homeEl.remove();
    var page=document.createElement('div');page.className='ps-home-page';Preset._homeEl=page;
    document.body.appendChild(page);Preset.renderHome();
    raf2(function(){page.classList.add('show');});
  },
  close:function(){slideOut(Preset._homeEl,function(){Preset._homeEl=null;});},

  renderHome:function(){
    var page=Preset._homeEl;if(!page)return;
    var html='';
    if(!Preset.list.length){
      html='<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无预设，点击右上角创建</div>';
    } else {
      html=Preset.list.map(function(p,i){
        var isOn=p.enabled===true;
        var isBuiltin=p.builtin===true;
        return '<div class="ps-home-card'+(isOn?' active-preset':'')+'" data-idx="'+i+'">'+
          '<div class="ps-home-card-info">'+
            '<div class="ps-home-card-name">'+App.esc(p.name||'未命名')+(isBuiltin?' <span style="font-size:10px;color:#adcdea;font-weight:400;">内置</span>':'')+'</div>'+
            '<div class="ps-home-card-desc">'+App.esc((p.items||[]).length+' 条指令')+'</div>'+
          '</div>'+
          (isOn?'<span class="ps-home-card-badge in-use">使用中</span>':'')+
          '<div class="ps-home-actions">'+
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

    page.querySelector('#psHomeBack').addEventListener('click',function(){Preset.close();});
    page.querySelector('#psHomeCreate').addEventListener('click',function(){Preset.openEditPreset(-1);});

    page.querySelectorAll('.ps-home-card').forEach(function(card){
      card.addEventListener('click',function(e){
        if(e.target.closest('.ps-mini-btn'))return;
        var idx=parseInt(card.dataset.idx);var p=Preset.list[idx];if(!p)return;
        Preset.list.forEach(function(item){item.enabled=false;});
        p.enabled=true;Preset.save();Preset.renderHome();
        App.showToast('已启用：'+p.name);
      });
    });

    page.querySelectorAll('[data-act="dots"]').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();Preset.showDotsMenu(btn,parseInt(btn.dataset.idx));});
    });

    bindDragList(page,'.ps-home-card','.ps-home-actions',Preset.list,function(){Preset.save();Preset.renderHome();});
    Preset.bindSwipeBack(page,function(){Preset.close();});
  },

  showDotsMenu:function(btnEl,idx){
    var old=document.querySelector('.ps-dots-menu');if(old)old.remove();
    var p=Preset.list[idx];
    var isBuiltin=p&&p.builtin===true;

    var menu=document.createElement('div');menu.className='ps-dots-menu';

    /* ★ 内置预设：只能查看、复制、导出，不能直接编辑或删除 */
    if(isBuiltin){
      menu.innerHTML=
        '<div class="ps-dots-mi" data-mact="view">查看</div>'+
        '<div class="ps-dots-mi" data-mact="copy">复制为可编辑副本</div>'+
        '<div class="ps-dots-mi" data-mact="export">导出</div>';
    } else {
      menu.innerHTML=
        '<div class="ps-dots-mi" data-mact="edit">编辑</div>'+
        '<div class="ps-dots-mi" data-mact="copy">复制</div>'+
        '<div class="ps-dots-mi" data-mact="export">导出</div>'+
        '<div class="ps-dots-mi danger" data-mact="delete">删除</div>';
    }

    var rect=btnEl.getBoundingClientRect();var left=rect.right-140,top=rect.bottom+4;
    if(left<8)left=8;if(top+180>window.innerHeight)top=rect.top-180;if(top<10)top=10;
    menu.style.left=left+'px';menu.style.top=top+'px';document.body.appendChild(menu);
    menu.querySelectorAll('.ps-dots-mi').forEach(function(mi){
      mi.addEventListener('click',function(e){e.stopPropagation();var act=mi.dataset.mact;menu.remove();
        if(act==='edit')Preset.openEditPreset(idx);
        if(act==='view')Preset.openEditPreset(idx,true);
        if(act==='copy'){
          var src=Preset.list[idx];if(!src)return;
          var cp=JSON.parse(JSON.stringify(src));
          cp.id='ps_'+Date.now();
          cp.name=cp.name+' (副本)';
          cp.enabled=false;
          cp.builtin=false; /* ★ 副本不是内置的，可以自由编辑 */
          /* 副本里的 items 也去掉 builtin 标记 */
          if(cp.items)cp.items.forEach(function(it){delete it.builtin;});
          Preset.list.unshift(cp);Preset.save();Preset.renderHome();
          App.showToast('已复制为可编辑副本');
        }
        if(act==='export'){var pr=Preset.list[idx];if(!pr)return;var blob=new Blob([JSON.stringify(pr,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='preset_'+(pr.name||'export')+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);App.showToast('已导出');}
        if(act==='delete'){if(!confirm('确定删除？'))return;Preset.list.splice(idx,1);Preset.save();Preset.renderHome();App.showToast('已删除');}
      });
    });
    function dismiss(ev){if(menu.parentNode&&!menu.contains(ev.target)){menu.remove();document.removeEventListener('touchstart',dismiss);document.removeEventListener('click',dismiss);}}
    setTimeout(function(){document.addEventListener('touchstart',dismiss,{passive:true});document.addEventListener('click',dismiss);},100);
  },

  // ==================== 编辑预设页 ====================
  /* ★ 新增 viewOnly 参数，内置预设用查看模式 */
  openEditPreset:function(idx,viewOnly){
    var isNew=idx<0;
    var p=isNew?{id:'ps_'+Date.now(),name:'',enabled:false,items:[],order:null}:JSON.parse(JSON.stringify(Preset.list[idx]));
    if(!p.items)p.items=[];
    if(!p.order)p.order=Preset._buildOrder(p);

    var isBuiltinPreset=p.builtin===true;
    var isViewMode=viewOnly===true||isBuiltinPreset;

    if(Preset._editEl)Preset._editEl.remove();
    var page=document.createElement('div');page.className='ps-edit-page';Preset._editEl=page;
    document.body.appendChild(page);

    function render(){
      Preset._syncOrder(p);

      var activeOrder=[];
      var inactiveOrder=[];
      p.order.forEach(function(o,oi){
        o._oi=oi;
        if(o.type==='sys'){activeOrder.push(o);}
        else{
          var it=p.items[o.idx];
          if(it&&it.active===false)inactiveOrder.push(o);
          else activeOrder.push(o);
        }
      });

      var rows='';

      activeOrder.forEach(function(o){
        var oi=o._oi;
        if(o.type==='sys'){
          var s=getSysDef(o.id);if(!s)return;
          var isOn=Preset.config.sysToggles[s.id]!==false;
          rows+='<div class="ps-item" data-oi="'+oi+'" data-rt="sys" data-sid="'+s.id+'">'+
            '<div class="ps-info"><div class="ps-name">'+App.esc(s.name)+'</div><div class="ps-name-sub">'+App.esc(s.en)+'</div></div>'+
            (s.hasToggle?'<div class="ps-item-actions"><div class="ps-sw '+(isOn?'on':'off')+'" data-sid="'+s.id+'"></div></div>':'')+
          '</div>';
        } else {
          var it=p.items[o.idx];if(!it)return;
          var isItemBuiltin=it.builtin===true;
          var depthTag=it.mode==='depth'?'<span class="ps-depth-tag">D'+it.depth+'</span>':'';
          var swOn=it.enabled!==false?'on':'off';

          var actionsHtml='';
          if(isViewMode){
            /* ★ 查看模式：只有查看按钮和开关 */
            actionsHtml=depthTag+
              '<div class="ps-mini-btn" data-iact="view" data-ii="'+o.idx+'"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>'+
              '<div class="ps-sw '+swOn+'" data-iact="sw" data-ii="'+o.idx+'"></div>';
          } else {
            actionsHtml=depthTag+
              '<div class="ps-mini-btn" data-iact="edit" data-ii="'+o.idx+'"><svg viewBox="0 0 24 24"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>'+
              '<div class="ps-mini-btn del-btn" data-iact="del" data-ii="'+o.idx+'"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div>'+
              '<div class="ps-mini-btn active-on" data-iact="activate" data-ii="'+o.idx+'"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>'+
              '<div class="ps-sw '+swOn+'" data-iact="sw" data-ii="'+o.idx+'"></div>';
          }

          rows+='<div class="ps-item is-user" data-oi="'+oi+'" data-rt="user" data-ii="'+o.idx+'">'+
            '<div class="ps-info"><div class="ps-name">'+App.esc(it.name||'未命名')+(isItemBuiltin?' <span style="font-size:9px;color:#adcdea;">内置</span>':'')+'</div></div>'+
            '<div class="ps-item-actions">'+actionsHtml+'</div>'+
          '</div>';
        }
      });

      if(inactiveOrder.length){
        rows+='<div style="padding:14px 18px 6px;font-size:11px;font-weight:700;color:#ccc;letter-spacing:1px;border-top:2px solid rgba(0,0,0,.03);margin:8px 16px 0;">未激活</div>';
        inactiveOrder.forEach(function(o){
          var oi=o._oi;
          var it=p.items[o.idx];if(!it)return;
          var isItemBuiltin=it.builtin===true;
          var depthTag=it.mode==='depth'?'<span class="ps-depth-tag">D'+it.depth+'</span>':'';

          var actionsHtml='';
          if(isViewMode){
            actionsHtml=depthTag+
              '<div class="ps-mini-btn" data-iact="view" data-ii="'+o.idx+'"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>'+
              '<div class="ps-mini-btn active-on" data-iact="activate" data-ii="'+o.idx+'"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>';
          } else {
            actionsHtml=depthTag+
              '<div class="ps-mini-btn" data-iact="edit" data-ii="'+o.idx+'"><svg viewBox="0 0 24 24"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>'+
              '<div class="ps-mini-btn" data-iact="activate" data-ii="'+o.idx+'"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>'+
              '<div class="ps-mini-btn del-btn" data-iact="del" data-ii="'+o.idx+'"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div>';
          }

          rows+='<div class="ps-item is-user ps-inactive" data-oi="'+oi+'" data-rt="user" data-ii="'+o.idx+'">'+
            '<div class="ps-info"><div class="ps-name" style="color:#bbb;">'+App.esc(it.name||'未命名')+(isItemBuiltin?' <span style="font-size:9px;color:#ccc;">内置</span>':'')+'</div></div>'+
            '<div class="ps-item-actions">'+actionsHtml+'</div>'+
          '</div>';
        });
      }

      var headerRight='';
      if(isViewMode){
        headerRight='<div class="ps-header-right" style="color:#adcdea;font-size:12px;">只读</div>';
      } else {
        headerRight='<div class="ps-header-right" id="psEditRename">编辑名称</div>';
      }

      var toolbarHtml='<div class="ps-toolbar"><div class="ps-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="psEditSearch" placeholder="搜索指令..."></div>';
      if(!isViewMode)toolbarHtml+='<button class="ps-add-btn" id="psEditAdd" type="button">添加</button>';
      toolbarHtml+='</div>';

      var hintText=isViewMode
        ?'这是内置预设，不可直接修改。如需修改请先「复制为可编辑副本」。可以开关单条指令。'
        :'长按拖拽排列顺序，即模型读取的顺序。关闭则不发送。';

      page.innerHTML=
        '<div class="ps-header">'+
          '<button class="ps-back" id="psEditBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
          '<div class="ps-header-title">'+App.esc(p.name||'预设名称')+'</div>'+
          headerRight+
        '</div>'+
        '<div class="ps-edit-body">'+
          toolbarHtml+
          '<div class="ps-hint-bar"><div class="ps-hint-text">'+hintText+'</div></div>'+
          '<div class="ps-list" id="psEditList">'+rows+'</div>'+
        '</div>';

      bindEv();
    }

    function bindEv(){
      page.querySelector('#psEditBack').addEventListener('click',function(){saveBack();Preset.closeEdit();});

      var addBtn=page.querySelector('#psEditAdd');
      if(addBtn)addBtn.addEventListener('click',function(){Preset.openAddItem(p,function(){render();});});

      var renameBtn=page.querySelector('#psEditRename');
      if(renameBtn)renameBtn.addEventListener('click',function(){
        var n=prompt('预设名称：',p.name||'');if(n===null)return;
        p.name=n.trim();page.querySelector('.ps-header-title').textContent=p.name||'预设名称';
      });

      page.querySelectorAll('.ps-sw[data-sid]').forEach(function(sw){
        sw.addEventListener('click',function(e){e.stopPropagation();var id=sw.dataset.sid;var isOn=sw.classList.contains('on');Preset.config.sysToggles[id]=!isOn;Preset.save();sw.classList.toggle('on',!isOn);sw.classList.toggle('off',isOn);});
      });

      /* ★ 查看按钮（内置预设的指令） */
      page.querySelectorAll('[data-iact="view"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();
          var ii=parseInt(btn.dataset.ii);
          var it=p.items[ii];if(!it)return;
          Preset._showViewDialog(it);
        });
      });

      page.querySelectorAll('[data-iact="edit"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();Preset.openAddItem(p,function(){render();},parseInt(btn.dataset.ii));});
      });

      page.querySelectorAll('[data-iact="del"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();var ii=parseInt(btn.dataset.ii);if(!confirm('删除？'))return;
          p.items.splice(ii,1);
          p.order=p.order.filter(function(o){return !(o.type==='user'&&o.idx===ii);});
          p.order.forEach(function(o){if(o.type==='user'&&o.idx>ii)o.idx--;});
          render();
        });
      });

      page.querySelectorAll('[data-iact="sw"]').forEach(function(sw){
        sw.addEventListener('click',function(e){e.stopPropagation();var ii=parseInt(sw.dataset.ii);if(p.items[ii]){p.items[ii].enabled=p.items[ii].enabled===false?true:false;}
          /* ★ 查看模式下开关也要立刻保存 */
          if(isViewMode&&!isNew){Preset.list[idx]=JSON.parse(JSON.stringify(p));Preset.save();}
          render();
        });
      });

      page.querySelectorAll('[data-iact="activate"]').forEach(function(btn){
        btn.addEventListener('click',function(e){
          e.stopPropagation();
          var ii=parseInt(btn.dataset.ii);
          if(p.items[ii]){p.items[ii].active=p.items[ii].active===false?true:false;}
          if(isViewMode&&!isNew){Preset.list[idx]=JSON.parse(JSON.stringify(p));Preset.save();}
          render();
        });
      });

      var si=page.querySelector('#psEditSearch');
      if(si)si.addEventListener('input',function(){
        var q=this.value.trim().toLowerCase();
        page.querySelectorAll('.ps-item').forEach(function(el){
          if(el.dataset.rt==='sys'){var s=getSysDef(el.dataset.sid);el.style.display=(!q||(s&&(s.name.indexOf(q)>=0||s.en.toLowerCase().indexOf(q)>=0)))?'':'none';}
          else{var ii=parseInt(el.dataset.ii);var it=p.items[ii];el.style.display=(!q||!it||(it.name||'').toLowerCase().indexOf(q)>=0)?'':'none';}
        });
      });

      /* ★ 拖拽排序：查看模式也允许（调整顺序不算"编辑内容"） */
      var allItems=page.querySelectorAll('.ps-item');
      allItems.forEach(function(el,elIdx){
        var timer=null,pressed=false,moved=false,startY=0,targetIdx;

        el.addEventListener('touchstart',function(e){
          if(e.target.closest('.ps-mini-btn')||e.target.closest('.ps-sw')||e.target.closest('.ps-item-actions'))return;
          moved=false;pressed=false;startY=e.touches[0].clientY;targetIdx=elIdx;
          timer=setTimeout(function(){pressed=true;el.classList.add('dragging');},400);
        },{passive:true});

        el.addEventListener('touchmove',function(e){
          if(timer&&!pressed){if(Math.abs(e.touches[0].clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
          if(!pressed)return;moved=true;e.preventDefault();
          var dy=e.touches[0].clientY-startY;
          el.style.transform='translateY('+dy+'px)';el.style.zIndex='100';
          var all=page.querySelectorAll('.ps-item');targetIdx=elIdx;
          all.forEach(function(c,ci){if(ci===elIdx)return;var rect=c.getBoundingClientRect();var mid=rect.top+rect.height/2;
            if(e.touches[0].clientY>mid&&ci>elIdx)targetIdx=ci;
            if(e.touches[0].clientY<mid&&ci<elIdx)targetIdx=ci;
          });
          var h=el.offsetHeight+12;
          all.forEach(function(c,ci){if(ci===elIdx)return;c.style.transition='transform .18s ease';
            if(targetIdx>elIdx&&ci>elIdx&&ci<=targetIdx)c.style.transform='translateY(-'+h+'px)';
            else if(targetIdx<elIdx&&ci<elIdx&&ci>=targetIdx)c.style.transform='translateY('+h+'px)';
            else c.style.transform='';
          });
        },{passive:false});

        el.addEventListener('touchend',function(){
          clearTimeout(timer);timer=null;el.classList.remove('dragging');
          page.querySelectorAll('.ps-item').forEach(function(c){c.style.transform='';c.style.transition='';c.style.zIndex='';});
          if(pressed&&moved&&targetIdx!==elIdx){
            var item=p.order.splice(elIdx,1)[0];p.order.splice(targetIdx,0,item);
            /* ★ 查看模式拖拽也保存 */
            if(isViewMode&&!isNew){Preset.list[idx]=JSON.parse(JSON.stringify(p));Preset.save();}
            render();
          }
          pressed=false;moved=false;
        },{passive:true});
      });
    }

    function saveBack(){
      if(isNew){if(p.name||p.items.length){Preset.list.unshift(p);}}
      else if(!isViewMode){Preset.list[idx]=p;}
      Preset.save();Preset.renderHome();
    }

    render();
    raf2(function(){page.classList.add('show');});
    Preset.bindSwipeBack(page,function(){saveBack();Preset.closeEdit();});
  },

  closeEdit:function(){slideOut(Preset._editEl,function(){Preset._editEl=null;});},

  /* ★ 新增：查看指令内容的只读弹窗 */
  _showViewDialog:function(item){
    var overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML=
      '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:16px;padding:20px;width:100%;max-width:360px;max-height:70vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);">'+
        '<div style="font-size:15px;font-weight:700;color:#2e4258;margin-bottom:12px;">'+App.esc(item.name||'未命名')+'</div>'+
        '<div style="font-size:13px;color:#5a7a9a;line-height:1.7;white-space:pre-wrap;word-break:break-word;background:rgba(126,163,201,.06);border:1px solid rgba(126,163,201,.15);border-radius:10px;padding:14px;">'+App.esc(item.content||'(无内容)')+'</div>'+
        '<div style="display:flex;gap:8px;margin-top:14px;">'+
          '<button type="button" id="viewCopyBtn" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">复制内容</button>'+
          '<button type="button" id="viewCloseBtn" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">关闭</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
    overlay.querySelector('#viewCloseBtn').addEventListener('click',function(){overlay.remove();});
    overlay.querySelector('#viewCopyBtn').addEventListener('click',function(){
      App.copyText(item.content||'').then(function(){App.showToast('已复制');}).catch(function(){App.showToast('复制失败');});
    });
  },

  _buildOrder:function(p){
    var o=buildDefaultOrder();
    if(p.items&&p.items.length){
      p.items.forEach(function(it,i){
        if(it.mode==='depth'){
          var hIdx=-1;
          for(var j=0;j<o.length;j++){if(o[j].type==='sys'&&o[j].id==='sys_history'){hIdx=j;break;}}
          if(hIdx>=0)o.splice(hIdx+1,0,{type:'user',idx:i});
          else o.push({type:'user',idx:i});
        } else {
          o.unshift({type:'user',idx:i});
        }
      });
    }
    return o;
  },

  _syncOrder:function(p){
    p.items.forEach(function(it,i){
      var found=false;
      for(var j=0;j<p.order.length;j++){if(p.order[j].type==='user'&&p.order[j].idx===i){found=true;break;}}
      if(!found){
        if(it.mode==='depth'){
          var hIdx=-1;
          for(var k=0;k<p.order.length;k++){if(p.order[k].type==='sys'&&p.order[k].id==='sys_history'){hIdx=k;break;}}
          if(hIdx>=0)p.order.splice(hIdx+1,0,{type:'user',idx:i});
          else p.order.push({type:'user',idx:i});
        } else {
          p.order.unshift({type:'user',idx:i});
        }
      }
    });
    p.order=p.order.filter(function(o){if(o.type==='sys')return true;return o.idx>=0&&o.idx<p.items.length;});
    DEFAULT_SYS.forEach(function(s){
      var found=false;
      for(var j=0;j<p.order.length;j++){if(p.order[j].type==='sys'&&p.order[j].id===s.id){found=true;break;}}
      if(!found)p.order.push({type:'sys',id:s.id});
    });
  },

  // ==================== 添加/编辑指令 ====================
  openAddItem:function(preset,onDone,editIdx){
    var isEdit=typeof editIdx==='number'&&editIdx>=0;
    var item=isEdit?JSON.parse(JSON.stringify(preset.items[editIdx])):{name:'',content:'',mode:'relative',depth:2,enabled:true};
    if(Preset._addEl)Preset._addEl.remove();
    var page=document.createElement('div');page.className='ps-add-page';Preset._addEl=page;

    page.innerHTML=
      '<div class="ps-header"><button class="ps-back" id="psAddBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><div class="ps-header-title">'+(isEdit?'编辑指令':'添加指令')+'</div><div style="width:36px;"></div></div>'+
      '<div class="ps-add-body"><div class="ps-add-card">'+
        '<div class="ps-add-section"><div class="ps-add-label"><div class="dot"></div>指令名称</div><input type="text" class="ps-add-input" id="psItemName" value="'+App.escAttr(item.name||'')+'" placeholder="给这条指令起个名字..."></div>'+
        '<div class="ps-add-sep"></div>'+
        '<div class="ps-add-section"><div class="ps-add-label"><div class="dot"></div>预设内容</div><div style="position:relative;"><textarea class="ps-add-textarea" id="psItemContent" placeholder="在这里写预设指令内容...">'+App.esc(item.content||'')+'</textarea><button class="ps-expand-btn" id="psExpandBtn" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button></div></div>'+
        '<div class="ps-add-sep"></div>'+
        '<div class="ps-add-section"><div class="ps-add-label"><div class="dot"></div>注入模式</div>'+
          '<div class="ps-mode-row"><div class="ps-mode-btn'+(item.mode!=='depth'?' active':'')+'" data-mode="relative">相对位置</div><div class="ps-mode-btn'+(item.mode==='depth'?' active':'')+'" data-mode="depth">深度注入</div></div>'+
          '<div id="psRelHint" style="'+(item.mode!=='depth'?'':'display:none;')+'"><div class="ps-add-hint">相对模式：在编辑预设页长按拖动排列位置。</div></div>'+
          '<div id="psDepthRow" style="'+(item.mode==='depth'?'':'display:none;')+'"><div class="ps-depth-row"><span style="font-size:12px;color:#7a9ab8;font-weight:600;">注入深度</span><input type="number" class="ps-depth-input" id="psItemDepth" value="'+(item.depth!=null?item.depth:2)+'" min="0" max="99"></div><div class="ps-depth-hint" style="margin-top:6px;">数字越小越靠近最新消息。</div><div class="ps-add-hint" style="margin-top:8px;">保存后自动出现在「聊天历史」下方。</div></div>'+
        '</div>'+
      '</div><div class="ps-add-btns"><button class="ps-save-btn" id="psItemSave" type="button">保存</button><button class="ps-cancel-btn" id="psItemCancel" type="button">取消</button></div></div>';

    document.body.appendChild(page);raf2(function(){page.classList.add('show');});

    page.querySelectorAll('.ps-mode-btn').forEach(function(btn){btn.addEventListener('click',function(){
      page.querySelectorAll('.ps-mode-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');
      page.querySelector('#psRelHint').style.display=btn.dataset.mode==='depth'?'none':'';
      page.querySelector('#psDepthRow').style.display=btn.dataset.mode==='depth'?'':'none';
    });});

    page.querySelector('#psExpandBtn').addEventListener('click',function(){Preset.openExpand(page.querySelector('#psItemContent'));});
    page.querySelector('#psAddBack').addEventListener('click',function(){Preset.closeAdd();});
    page.querySelector('#psItemCancel').addEventListener('click',function(){Preset.closeAdd();});
    page.querySelector('#psItemSave').addEventListener('click',function(){
      var name=(page.querySelector('#psItemName').value||'').trim();
      var content=(page.querySelector('#psItemContent').value||'').trim();
      if(!name){App.showToast('请输入指令名称');return;}if(!content){App.showToast('请输入预设内容');return;}
      var mb=page.querySelector('.ps-mode-btn.active');var mode=mb?mb.dataset.mode:'relative';
      var depth=parseInt(page.querySelector('#psItemDepth').value)||2;
      var obj={name:name,content:content,mode:mode,depth:depth,enabled:true};
      if(isEdit){preset.items[editIdx]=obj;}else{preset.items.push(obj);}
      Preset.closeAdd();if(onDone)onDone();App.showToast(isEdit?'已保存':'已添加');
    });
    Preset.bindSwipeBack(page,function(){Preset.closeAdd();});
  },
  closeAdd:function(){slideOut(Preset._addEl,function(){Preset._addEl=null;});},

  openExpand:function(textarea){
    if(Preset._expandEl)Preset._expandEl.remove();
    var ed=document.createElement('div');Preset._expandEl=ed;
    ed.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10003;background:#fff;display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.32,.72,0,1),opacity .3s;transform:translateY(100%);opacity:0;';
    ed.innerHTML='<div class="ps-header"><button class="ps-back" id="psExpBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><div class="ps-header-title">预设内容</div><button id="psExpDone" type="button" style="background:none;border:none;color:#7a9ab8;font-size:13px;font-weight:600;cursor:pointer;padding:4px 10px;">完成</button></div><div style="flex:1;padding:12px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;"><textarea id="psExpTA" style="width:100%;min-height:calc(100vh - 120px);border:1.5px solid rgba(126,163,201,.25);border-radius:12px;padding:14px 16px;font-size:13px;color:#2e4258;outline:none;font-family:inherit;background:rgba(126,163,201,.04);resize:none;line-height:1.7;box-sizing:border-box;">'+App.esc(textarea.value)+'</textarea></div>';
    document.body.appendChild(ed);
    raf2(function(){ed.style.transform='translateY(0)';ed.style.opacity='1';});
    var ta=ed.querySelector('#psExpTA');if(ta)ta.focus();
    function done(){textarea.value=ed.querySelector('#psExpTA').value;ed.style.transform='translateY(100%)';ed.style.opacity='0';setTimeout(function(){if(ed.parentNode)ed.remove();Preset._expandEl=null;},350);}
    ed.querySelector('#psExpBack').addEventListener('click',done);
    ed.querySelector('#psExpDone').addEventListener('click',done);
  },

  bindSwipeBack:function(page,onBack){
    var _sw={active:false,sx:0,sy:0,locked:false,dir:''};
    page.addEventListener('touchstart',function(e){var t=e.touches[0];if(t.clientX-page.getBoundingClientRect().left>50)return;_sw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
    page.addEventListener('touchmove',function(e){if(!_sw.active)return;var t=e.touches[0];var dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;if(!_sw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.locked=true;_sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_sw.dir==='h'&&dx>0){e.preventDefault();page.style.transform='translateX('+Math.min(dx,page.offsetWidth)+'px)';page.style.opacity=String(1-dx/page.offsetWidth*.5);}},{passive:false});
    page.addEventListener('touchend',function(e){if(!_sw.active)return;_sw.active=false;if(_sw.dir!=='h'){page.style.transform='';page.style.opacity='';return;}var dx=e.changedTouches[0].clientX-_sw.sx;if(dx>page.offsetWidth*.3){page.style.transition='transform .25s,opacity .25s';page.style.transform='translateX(100%)';page.style.opacity='0';setTimeout(function(){page.style.transition='';page.style.transform='';page.style.opacity='';if(onBack)onBack();},260);}else{page.style.transition='transform .2s,opacity .2s';page.style.transform='';page.style.opacity='';setTimeout(function(){page.style.transition='';},220);}},{passive:true});
  },

  getEnabledPresets:function(){return Preset.list.filter(function(p){return p.enabled===true;});},
  isSysEnabled:function(sysId){if(!Preset.config.sysToggles)return true;return Preset.config.sysToggles[sysId]!==false;},

  /* ★ 重写 init：首次打开时创建默认预设 */
  init:function(){
    Preset.load();

    /* 检查是否有预设，没有则创建默认的 */
    if(!Preset.list.length){
      var defaultPreset=createDefaultPreset();
      Preset.list.push(defaultPreset);
      Preset.save();
    }

    App.preset=Preset;
  }
};

function raf2(fn){requestAnimationFrame(function(){requestAnimationFrame(fn);});}
function slideOut(el,cb){if(!el)return;el.classList.remove('show');el.style.transform='translateX(100%)';el.style.opacity='0';setTimeout(function(){if(el.parentNode)el.remove();if(cb)cb();},350);}
function bindDragList(page,selector,excludeSelector,list,onDone){
  var els=page.querySelectorAll(selector);
  els.forEach(function(el,elIdx){
    var timer=null,pressed=false,moved=false,startY=0,targetIdx;
    el.addEventListener('touchstart',function(e){
      if(e.target.closest(excludeSelector))return;
      moved=false;pressed=false;startY=e.touches[0].clientY;targetIdx=elIdx;
      timer=setTimeout(function(){pressed=true;el.classList.add('dragging');},400);
    },{passive:true});
    el.addEventListener('touchmove',function(e){
      if(timer&&!pressed){if(Math.abs(e.touches[0].clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
      if(!pressed)return;moved=true;e.preventDefault();
      var dy=e.touches[0].clientY-startY;el.style.transform='translateY('+dy+'px)';el.style.zIndex='100';
      var all=page.querySelectorAll(selector);targetIdx=elIdx;
      all.forEach(function(c,ci){if(ci===elIdx)return;var rect=c.getBoundingClientRect();var mid=rect.top+rect.height/2;if(e.touches[0].clientY>mid&&ci>elIdx)targetIdx=ci;if(e.touches[0].clientY<mid&&ci<elIdx)targetIdx=ci;});
      var h=el.offsetHeight+12;
      all.forEach(function(c,ci){if(ci===elIdx)return;c.style.transition='transform .18s ease';
        if(targetIdx>elIdx&&ci>elIdx&&ci<=targetIdx)c.style.transform='translateY(-'+h+'px)';
        else if(targetIdx<elIdx&&ci<elIdx&&ci>=targetIdx)c.style.transform='translateY('+h+'px)';
        else c.style.transform='';
      });
    },{passive:false});
    el.addEventListener('touchend',function(){
      clearTimeout(timer);timer=null;el.classList.remove('dragging');
      page.querySelectorAll(selector).forEach(function(c){c.style.transform='';c.style.transition='';c.style.zIndex='';});
      if(pressed&&moved&&targetIdx!==elIdx){var item=list.splice(elIdx,1)[0];list.splice(targetIdx,0,item);if(onDone)onDone();}
      pressed=false;moved=false;
    },{passive:true});
  });
}

App.register('preset',Preset);
})();
