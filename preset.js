
(function(){
'use strict';
var App=window.App;if(!App)return;

var SYS_ITEMS=[
  {id:'sys_char_profile',name:'角色设定',desc:'角色档案内容',type:'system',enabled:true,fixed:true},
  {id:'sys_char_dialog',name:'示例对话',desc:'角色的示例对话',type:'system',enabled:true,fixed:true},
  {id:'sys_memory',name:'记忆总结',desc:'AI自动总结的对话记忆',type:'system',enabled:true,fixed:false},
  {id:'sys_post',name:'后置指令',desc:'每次对话末尾附加的指令',type:'system',enabled:true,fixed:false},
  {id:'sys_chat',name:'聊天历史',desc:'最近的对话上下文',type:'system',enabled:true,fixed:false}
];

var Preset={
  presets:[],
  activeId:'',
  editingId:null,
  _dotsMenu:null,
  _dragState:null,
  _gapEl:null,

  load:function(){
    Preset.presets=App.LS.get('presetList')||[];
    var cfg=App.LS.get('presetConfig')||{};
    Preset.activeId=cfg.activeId||'';
    if(!Preset.presets.length){
      Preset.presets.push({
        id:'preset_default',
        name:'默认预设',
        desc:'基础对话预设',
        items:JSON.parse(JSON.stringify(SYS_ITEMS)),
        userEntries:[]
      });
      Preset.activeId='preset_default';
      Preset.save();
    }
  },

  save:function(){
    App.LS.set('presetList',Preset.presets);
    App.LS.set('presetConfig',{activeId:Preset.activeId});
  },

  getById:function(id){
    for(var i=0;i<Preset.presets.length;i++){
      if(Preset.presets[i].id===id)return Preset.presets[i];
    }
    return null;
  },

  getActive:function(){
    return Preset.getById(Preset.activeId)||Preset.presets[0]||null;
  },

  open:function(){
    Preset.load();
    var old=App.$('#psHomePage');if(old)old.remove();

    var page=document.createElement('div');
    page.id='psHomePage';
    page.className='ps-home-page';
    document.body.appendChild(page);

    Preset.renderHome(page);

    requestAnimationFrame(function(){requestAnimationFrame(function(){
      page.classList.add('show');
    });});
  },

  close:function(){
    Preset.dismissDots();
    var page=App.$('#psHomePage');
    if(!page)return;
    page.classList.remove('show');
    setTimeout(function(){if(page.parentNode)page.remove();},350);
  },

  renderHome:function(page){
    var presets=Preset.presets;

    var cardsHtml='';
    if(!presets.length){
      cardsHtml='<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无预设，点击右上角创建</div>';
    } else {
      cardsHtml=presets.map(function(p,i){
        var isActive=p.id===Preset.activeId;
        var sysCount=0,userCount=0;
        if(p.items)p.items.forEach(function(it){if(it.type==='system')sysCount++;});
        if(p.userEntries)userCount=p.userEntries.length;

        return '<div class="ps-home-card'+(isActive?' active-preset':'')+'" data-preset-id="'+p.id+'" data-idx="'+i+'">' +
          '<div class="ps-home-card-info">' +
            '<div class="ps-home-card-name">'+App.esc(p.name||'未命名')+'</div>' +
            '<div class="ps-home-card-desc">系统项 '+sysCount+' · 自定义 '+userCount+'</div>' +
          '</div>' +
          (isActive?'<div class="ps-home-card-badge in-use">使用中</div>':'<div class="ps-home-card-badge idle">未启用</div>') +
          '<div class="ps-home-actions">' +
            '<div class="ps-mini-btn ps-dots-btn" data-preset-id="'+p.id+'" data-idx="'+i+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="#7a9ab8" stroke="none"/></svg></div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    page.innerHTML=
      '<div class="ps-header">' +
        '<button class="ps-back" id="psHomeBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
        '<div class="ps-header-title">预设管理</div>' +
        '<button class="ps-add-btn" id="psHomeAdd" type="button">+ 新建</button>' +
      '</div>' +
      '<div class="ps-hint-bar"><div class="ps-hint-text">长按卡片可拖拽排序 · 点击三个点进行操作</div></div>' +
      '<div class="ps-home-list" id="psHomeList">' + cardsHtml + '</div>';

    // 绑定事件
    page.querySelector('#psHomeBack').addEventListener('click',function(){Preset.close();});
    page.querySelector('#psHomeAdd').addEventListener('click',function(){
      var newP={
        id:'preset_'+Date.now(),
        name:'新预设',
        desc:'',
        items:JSON.parse(JSON.stringify(SYS_ITEMS)),
        userEntries:[]
      };
      Preset.presets.push(newP);
      Preset.save();
      Preset.openDetail(newP.id);
    });

    // 卡片点击 = 切换激活
    page.querySelectorAll('.ps-home-card').forEach(function(card){
      card.addEventListener('click',function(e){
        if(e.target.closest('.ps-mini-btn'))return;
        if(e.target.closest('.ps-home-actions'))return;
        var pid=card.dataset.presetId;
        if(Preset.activeId===pid)return;
        Preset.activeId=pid;
        Preset.save();
        Preset.renderHome(page);
        App.showToast('已切换预设');
      });
    });

    // 三个点菜单
    page.querySelectorAll('.ps-dots-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var pid=btn.dataset.presetId;
        var rect=btn.getBoundingClientRect();
        Preset.showDotsMenu(pid,rect.right,rect.bottom,page);
      });
    });

    // 长按拖拽排序
    Preset.bindHomeDrag(page);
  },

  showDotsMenu:function(pid,x,y,homePage){
    Preset.dismissDots();
    var p=Preset.getById(pid);if(!p)return;
    var isActive=pid===Preset.activeId;

    var menu=document.createElement('div');
    menu.className='ps-dots-menu';

    var items='';
    if(!isActive){
      items+='<div class="ps-dots-mi" data-act="activate">启用</div>';
    }
    items+='<div class="ps-dots-mi" data-act="edit">编辑</div>';
    items+='<div class="ps-dots-mi" data-act="copy">复制</div>';
    items+='<div class="ps-dots-mi" data-act="export">导出</div>';
    items+='<div class="ps-dots-mi danger" data-act="delete">删除</div>';

    menu.innerHTML=items;

    var left=x-140;if(left<8)left=8;
    var top=y+4;if(top+200>window.innerHeight)top=y-200;
    if(top<10)top=10;
    menu.style.left=left+'px';
    menu.style.top=top+'px';

    document.body.appendChild(menu);
    Preset._dotsMenu=menu;

    menu.querySelectorAll('.ps-dots-mi').forEach(function(mi){
      mi.addEventListener('click',function(e){
        e.stopPropagation();
        var act=mi.dataset.act;
        Preset.dismissDots();

        if(act==='activate'){
          Preset.activeId=pid;
          Preset.save();
          Preset.renderHome(homePage);
          App.showToast('已启用');
        }
        if(act==='edit'){
          Preset.openDetail(pid);
        }
        if(act==='copy'){
          var copy=JSON.parse(JSON.stringify(p));
          copy.id='preset_'+Date.now();
          copy.name=p.name+' (副本)';
          Preset.presets.push(copy);
          Preset.save();
          Preset.renderHome(homePage);
          App.showToast('已复制');
        }
        if(act==='export'){
          var blob=new Blob([JSON.stringify(p,null,2)],{type:'application/json'});
          var url=URL.createObjectURL(blob);
          var a=document.createElement('a');
          a.href=url;a.download='preset_'+p.name+'_'+Date.now()+'.json';
          document.body.appendChild(a);a.click();document.body.removeChild(a);
          URL.revokeObjectURL(url);
          App.showToast('已导出');
        }
        if(act==='delete'){
          if(Preset.presets.length<=1){App.showToast('至少保留一个预设');return;}
          if(!confirm('确定删除「'+p.name+'」？'))return;
          Preset.presets=Preset.presets.filter(function(pp){return pp.id!==pid;});
          if(Preset.activeId===pid)Preset.activeId=Preset.presets[0]?Preset.presets[0].id:'';
          Preset.save();
          Preset.renderHome(homePage);
          App.showToast('已删除');
        }
      });
    });

    setTimeout(function(){
      function dismiss(ev){
        if(Preset._dotsMenu&&!Preset._dotsMenu.contains(ev.target)){
          Preset.dismissDots();
          document.removeEventListener('touchstart',dismiss);
          document.removeEventListener('click',dismiss);
        }
      }
      document.addEventListener('touchstart',dismiss,{passive:true});
      document.addEventListener('click',dismiss);
    },50);
  },

  dismissDots:function(){
    if(Preset._dotsMenu){Preset._dotsMenu.remove();Preset._dotsMenu=null;}
  },

  bindHomeDrag:function(page){
    var list=page.querySelector('#psHomeList');if(!list)return;
    var cards=list.querySelectorAll('.ps-home-card');
    var gap=document.createElement('div');
    gap.className='ps-gap-indicator';
    document.body.appendChild(gap);
    Preset._gapEl=gap;

    cards.forEach(function(card){
      var timer=null,pressed=false,moved=false,sx=0,sy=0;
      var dragIdx=-1,clone=null;

      card.addEventListener('touchstart',function(e){
        if(e.target.closest('.ps-mini-btn'))return;
        var t=e.touches[0];sx=t.clientX;sy=t.clientY;moved=false;pressed=false;
        dragIdx=parseInt(card.dataset.idx);

        timer=setTimeout(function(){
          pressed=true;
          if(navigator.vibrate)navigator.vibrate(15);
          card.classList.add('dragging');
        },500);
      },{passive:true});

      card.addEventListener('touchmove',function(e){
        var t=e.touches[0];
        if(!pressed){
          if(Math.abs(t.clientX-sx)>8||Math.abs(t.clientY-sy)>8){clearTimeout(timer);timer=null;}
          return;
        }
        moved=true;e.preventDefault();

        // 找插入位置
        var allCards=list.querySelectorAll('.ps-home-card');
        var insertIdx=-1;
        allCards.forEach(function(c,ci){
          if(ci===dragIdx)return;
          var rect=c.getBoundingClientRect();
          var mid=rect.top+rect.height/2;
          if(t.clientY>mid)insertIdx=ci;
        });
        if(insertIdx<0)insertIdx=0;

        // 显示间隔线
        var targetCard=allCards[insertIdx];
        if(targetCard){
          var tr=targetCard.getBoundingClientRect();
          gap.style.top=(tr.bottom+2)+'px';
          gap.style.opacity='1';
        }

        Preset._dragState={fromIdx:dragIdx,toIdx:insertIdx>dragIdx?insertIdx:insertIdx+1};
      },{passive:false});

      card.addEventListener('touchend',function(e){
        clearTimeout(timer);
        card.classList.remove('dragging');
        gap.style.opacity='0';

        if(pressed&&moved&&Preset._dragState){
          var from=Preset._dragState.fromIdx;
          var to=Preset._dragState.toIdx;
          if(from!==to&&from>=0&&to>=0){
            var item=Preset.presets.splice(from,1)[0];
            if(to>from)to--;
            Preset.presets.splice(to,0,item);
            Preset.save();
            Preset.renderHome(page);
          }
          Preset._dragState=null;
        }
        pressed=false;moved=false;
      },{passive:true});
    });
  },
```

**preset.js 第二段（接上面）：**

```javascript
  openDetail:function(pid){
    var p=Preset.getById(pid);if(!p)return;
    Preset.editingId=pid;

    var old=App.$('#psDetailPage');if(old)old.remove();
    var page=document.createElement('div');
    page.id='psDetailPage';
    page.className='ps-page';
    document.body.appendChild(page);

    Preset.renderDetail(page,p);

    requestAnimationFrame(function(){requestAnimationFrame(function(){
      page.classList.add('show');
    });});
  },

  closeDetail:function(){
    var page=App.$('#psDetailPage');if(!page)return;
    page.classList.remove('show');
    setTimeout(function(){if(page.parentNode)page.remove();},350);
    // 刷新首页
    var homePage=App.$('#psHomePage');
    if(homePage)Preset.renderHome(homePage);
  },

  renderDetail:function(page,p){
    var isActive=p.id===Preset.activeId;

    // 系统项
    var sysHtml='<div class="ps-section-label">系统项</div>';
    if(p.items){
      p.items.forEach(function(item,i){
        var canToggle=!item.fixed;
        var tagHtml='';
        if(item.fixed){
          tagHtml='<div class="ps-tag on">固定</div>';
        } else {
          tagHtml='<div class="ps-sw '+(item.enabled?'on':'off')+'" data-sys-idx="'+i+'"></div>';
        }

        sysHtml+='<div class="ps-item is-sys">' +
          '<div class="ps-drag"><svg viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg></div>' +
          '<div class="ps-info">' +
            '<div class="ps-name">'+App.esc(item.name)+'</div>' +
            '<div class="ps-desc">'+App.esc(item.desc||'')+'</div>' +
          '</div>' +
          tagHtml +
        '</div>';
      });
    }

    // 用户自定义项
    var userHtml='<div class="ps-divider"></div><div class="ps-section-label">自定义指令</div>';
    if(!p.userEntries||!p.userEntries.length){
      userHtml+='<div style="padding:20px;text-align:center;color:#bbb;font-size:12px;">暂无自定义指令</div>';
    } else {
      p.userEntries.forEach(function(entry,i){
        userHtml+='<div class="ps-item is-user" data-user-idx="'+i+'">' +
          '<div class="ps-drag"><svg viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg></div>' +
          '<div class="ps-info">' +
            '<div class="ps-name">'+App.esc(entry.name||'未命名')+'</div>' +
            '<div class="ps-desc">'+App.esc((entry.content||'').slice(0,40))+'</div>' +
          '</div>' +
          '<div class="ps-sw '+(entry.enabled!==false?'on':'off')+'" data-entry-idx="'+i+'"></div>' +
          '<div class="ps-mini-btn" data-edit-idx="'+i+'"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>' +
          '<div class="ps-mini-btn del" data-del-idx="'+i+'"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>' +
        '</div>';
      });
    }

    page.innerHTML=
      '<div class="ps-header">' +
        '<button class="ps-back" id="psDetailBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
        '<div class="ps-header-title">'+App.esc(p.name||'预设')+'</div>' +
        '<div style="display:flex;gap:6px;">' +
          (isActive?'<div class="ps-mini-btn del" id="psDetailDel"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div>':'') +
          '<button class="ps-add-btn" id="psDetailAdd" type="button">+ 指令</button>' +
        '</div>' +
      '</div>' +
      '<div class="ps-toolbar">' +
        '<div class="ps-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="psDetailSearch" placeholder="搜索指令..."></div>' +
      '</div>' +
      '<div class="ps-list" id="psDetailList">' +
        '<div style="padding:12px 18px;">' +
          '<div class="ps-edit-section">' +
            '<div class="ps-edit-label"><div class="dot"></div>预设名称</div>' +
            '<input class="ps-edit-input" id="psPresetName" value="'+App.escAttr(p.name||'')+'" placeholder="预设名称...">' +
          '</div>' +
          '<div class="ps-edit-section" style="margin-top:12px;">' +
            '<div class="ps-edit-label"><div class="dot"></div>描述</div>' +
            '<input class="ps-edit-input" id="psPresetDesc" value="'+App.escAttr(p.desc||'')+'" placeholder="预设描述（可选）...">' +
          '</div>' +
          '<button class="ps-save-btn" id="psPresetSaveInfo" type="button" style="width:100%;margin-top:12px;">保存信息</button>' +
        '</div>' +
        '<div class="ps-divider"></div>' +
        sysHtml +
        userHtml +
      '</div>';

    // 绑定事件
    page.querySelector('#psDetailBack').addEventListener('click',function(){Preset.closeDetail();});

    var delBtn=page.querySelector('#psDetailDel');
    if(delBtn){
      delBtn.addEventListener('click',function(e){
        e.stopPropagation();
        if(Preset.presets.length<=1){App.showToast('至少保留一个预设');return;}
        if(!confirm('确定删除「'+p.name+'」？'))return;
        Preset.presets=Preset.presets.filter(function(pp){return pp.id!==p.id;});
        if(Preset.activeId===p.id)Preset.activeId=Preset.presets[0]?Preset.presets[0].id:'';
        Preset.save();
        Preset.closeDetail();
        App.showToast('已删除');
      });
    }

    page.querySelector('#psDetailAdd').addEventListener('click',function(){
      Preset.openEntryEdit(p,null,-1);
    });

    page.querySelector('#psPresetSaveInfo').addEventListener('click',function(){
      var name=(page.querySelector('#psPresetName').value||'').trim();
      var desc=(page.querySelector('#psPresetDesc').value||'').trim();
      if(!name){App.showToast('请输入名称');return;}
      p.name=name;p.desc=desc;
      Preset.save();
      page.querySelector('.ps-header-title').textContent=name;
      App.showToast('已保存');
    });

    // 系统项开关
    page.querySelectorAll('.ps-sw[data-sys-idx]').forEach(function(sw){
      sw.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(sw.dataset.sysIdx);
        var item=p.items[idx];if(!item||item.fixed)return;
        item.enabled=!item.enabled;
        Preset.save();
        sw.classList.toggle('on',item.enabled);
        sw.classList.toggle('off',!item.enabled);
      });
    });

    // 用户项开关
    page.querySelectorAll('.ps-sw[data-entry-idx]').forEach(function(sw){
      sw.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(sw.dataset.entryIdx);
        var entry=p.userEntries[idx];if(!entry)return;
        entry.enabled=entry.enabled===false?true:false;
        Preset.save();
        sw.classList.toggle('on',entry.enabled!==false);
        sw.classList.toggle('off',entry.enabled===false);
      });
    });

    // 编辑用户项
    page.querySelectorAll('.ps-mini-btn[data-edit-idx]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(btn.dataset.editIdx);
        Preset.openEntryEdit(p,p.userEntries[idx],idx);
      });
    });

    // 删除用户项
    page.querySelectorAll('.ps-mini-btn[data-del-idx]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var idx=parseInt(btn.dataset.delIdx);
        if(!confirm('删除这条指令？'))return;
        p.userEntries.splice(idx,1);
        Preset.save();
        Preset.renderDetail(page,p);
        App.showToast('已删除');
      });
    });

    // 搜索
    page.querySelector('#psDetailSearch').addEventListener('input',function(){
      var q=this.value.trim().toLowerCase();
      page.querySelectorAll('.ps-item').forEach(function(item){
        var name=item.querySelector('.ps-name');
        if(!name)return;
        var text=name.textContent.toLowerCase();
        item.style.display=(!q||text.indexOf(q)>=0)?'':'none';
      });
    });

    // 长按拖拽用户项
    Preset.bindDetailDrag(page,p);
  },

  bindDetailDrag:function(page,p){
    var items=page.querySelectorAll('.ps-item.is-user');
    items.forEach(function(item){
      var timer=null,pressed=false,moved=false,sx=0,sy=0;
      var dragIdx=parseInt(item.dataset.userIdx);

      item.addEventListener('touchstart',function(e){
        if(e.target.closest('.ps-mini-btn')||e.target.closest('.ps-sw'))return;
        var t=e.touches[0];sx=t.clientX;sy=t.clientY;moved=false;pressed=false;
        dragIdx=parseInt(item.dataset.userIdx);

        timer=setTimeout(function(){
          pressed=true;
          if(navigator.vibrate)navigator.vibrate(15);
          item.classList.add('dragging');
        },500);
      },{passive:true});

      item.addEventListener('touchmove',function(e){
        var t=e.touches[0];
        if(!pressed){
          if(Math.abs(t.clientX-sx)>8||Math.abs(t.clientY-sy)>8){clearTimeout(timer);timer=null;}
          return;
        }
        moved=true;e.preventDefault();
      },{passive:false});

      item.addEventListener('touchend',function(){
        clearTimeout(timer);
        item.classList.remove('dragging');
        pressed=false;moved=false;
      },{passive:true});
    });
  },

  openEntryEdit:function(preset,entry,idx){
    var isNew=idx<0;
    if(!entry)entry={name:'',content:'',enabled:true,mode:'normal',depth:4};

    var old=App.$('#psEditPage');if(old)old.remove();
    var page=document.createElement('div');
    page.id='psEditPage';
    page.className='ps-edit-page';

    var isDepth=entry.mode==='depth';

    page.innerHTML=
      '<div class="ps-header">' +
        '<button class="ps-back" id="psEditBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
        '<div class="ps-header-title">'+(isNew?'添加指令':'编辑指令')+'</div>' +
        '<div style="width:36px;"></div>' +
      '</div>' +
      '<div class="ps-edit-body">' +
        '<div class="ps-edit-card">' +
          '<div class="ps-edit-section">' +
            '<div class="ps-edit-label"><div class="dot"></div>指令名称</div>' +
            '<input class="ps-edit-input" id="psEntryName" value="'+App.escAttr(entry.name||'')+'" placeholder="指令名称...">' +
          '</div>' +
          '<div class="ps-edit-sep"></div>' +
          '<div class="ps-edit-section">' +
            '<div class="ps-edit-label"><div class="dot"></div>插入模式</div>' +
            '<div class="ps-mode-row">' +
              '<div class="ps-mode-btn'+(entry.mode!=='depth'?' active':'')+'" data-mode="normal">普通</div>' +
              '<div class="ps-mode-btn'+(entry.mode==='depth'?' active':'')+'" data-mode="depth">深度插入</div>' +
            '</div>' +
            '<div id="psDepthArea" style="'+(isDepth?'':'display:none;')+'">' +
              '<div class="ps-depth-row">' +
                '<span style="font-size:12px;color:#7a9ab8;font-weight:600;">深度</span>' +
                '<input class="ps-depth-input" id="psEntryDepth" type="number" min="1" max="99" value="'+(entry.depth||4)+'">' +
                '<div class="ps-depth-hint">从对话末尾往前数第几条插入</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="ps-edit-sep"></div>' +
          '<div class="ps-edit-section">' +
            '<div class="ps-edit-label"><div class="dot"></div>指令内容</div>' +
            '<textarea class="ps-edit-textarea" id="psEntryContent" placeholder="输入指令内容...">'+App.esc(entry.content||'')+'</textarea>' +
            '<div class="ps-edit-hint">此内容会作为系统指令的一部分发送给AI。可以用来补充角色性格、限制输出格式、添加世界观设定等。</div>' +
          '</div>' +
          '<div class="ps-edit-btns">' +
            '<button class="ps-save-btn" id="psEntrySave" type="button">保存</button>' +
            '<button class="ps-cancel-btn" id="psEntryCancel" type="button">取消</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(page);
    requestAnimationFrame(function(){requestAnimationFrame(function(){page.classList.add('show');});});

    // 模式切换
    page.querySelectorAll('.ps-mode-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        page.querySelectorAll('.ps-mode-btn').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        var depthArea=page.querySelector('#psDepthArea');
        if(btn.dataset.mode==='depth'){depthArea.style.display='';}
        else{depthArea.style.display='none';}
      });
    });

    page.querySelector('#psEditBack').addEventListener('click',function(){
      page.classList.remove('show');
      setTimeout(function(){if(page.parentNode)page.remove();},350);
    });

    page.querySelector('#psEntryCancel').addEventListener('click',function(){
      page.classList.remove('show');
      setTimeout(function(){if(page.parentNode)page.remove();},350);
    });

    page.querySelector('#psEntrySave').addEventListener('click',function(){
      var name=(page.querySelector('#psEntryName').value||'').trim();
      var content=(page.querySelector('#psEntryContent').value||'').trim();
      if(!name){App.showToast('请输入指令名称');return;}
      if(!content){App.showToast('请输入指令内容');return;}

      var modeBtn=page.querySelector('.ps-mode-btn.active');
      var mode=modeBtn?modeBtn.dataset.mode:'normal';
      var depth=parseInt(page.querySelector('#psEntryDepth').value)||4;

      var newEntry={name:name,content:content,enabled:true,mode:mode,depth:depth};

      if(!preset.userEntries)preset.userEntries=[];
      if(isNew){
        preset.userEntries.push(newEntry);
      } else {
        preset.userEntries[idx]=newEntry;
      }

      Preset.save();
      page.classList.remove('show');
      setTimeout(function(){
        if(page.parentNode)page.remove();
        var detailPage=App.$('#psDetailPage');
        if(detailPage)Preset.renderDetail(detailPage,preset);
      },350);
      App.showToast(isNew?'已添加':'已保存');
    });
  },

  init:function(){
    Preset.load();
    App.preset=Preset;
  }
};

App.register('preset',Preset);
})();
