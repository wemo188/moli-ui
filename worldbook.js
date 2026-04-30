
(function(){
'use strict';
var App=window.App;if(!App)return;

var WB={
  books:[],
  _homeEl:null,_listEl:null,_editEl:null,_editBookEl:null,_expandEl:null,

  load:function(){WB.books=App.LS.get('worldbooks')||[];},
  save:function(){App.LS.set('worldbooks',WB.books);},

  getMountedCharNames:function(bookId){
    var names=[];
    if(!App.character||!App.character.list)return names;
    App.character.list.forEach(function(c){
      if(c.worldbookIds&&c.worldbookIds.indexOf(bookId)>=0)names.push(c.name||'未命名');
    });
    return names;
  },

  open:function(){
    WB.load();
    if(WB._homeEl)WB._homeEl.remove();
    var page=document.createElement('div');page.className='wb-page';WB._homeEl=page;
    document.body.appendChild(page);WB.renderHome();
    raf2(function(){page.classList.add('show');});
  },

  close:function(){slideOut(WB._homeEl,function(){WB._homeEl=null;});},

  renderHome:function(){
    var page=WB._homeEl;if(!page)return;
    var html='';
    if(!WB.books.length){
      html='<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无世界书，点击右上角创建</div>';
    } else {
      html=WB.books.map(function(b,i){
        var count=(b.entries||[]).length;
        var mountedNames=WB.getMountedCharNames(b.id);
        var mountHtml='';
        if(mountedNames.length){
          mountHtml='<div class="wb-home-mounted">'+mountedNames.map(function(n){return App.esc(n);}).join('、')+' 已启用</div>';
        }
        return '<div class="wb-home-card" data-idx="'+i+'">'+
          '<div class="wb-home-info">'+
            '<div class="wb-home-name">'+App.esc(b.name||'未命名')+'</div>'+
            '<div class="wb-home-desc">'+count+' 个条目</div>'+
            mountHtml+
          '</div>'+
          '<div class="wb-home-actions">'+
            '<div class="wb-mini-btn" data-act="dots" data-idx="'+i+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="#7a9ab8" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="#7a9ab8" stroke="none"/></svg></div>'+
          '</div>'+
        '</div>';
      }).join('');
    }

    page.innerHTML=
      '<div class="wb-header">'+
        '<button class="wb-back" id="wbHomeBack" type="button"><svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>'+
        '<div class="wb-header-title">世界书</div>'+
        '<button class="wb-add-btn" id="wbHomeCreate" type="button">创建</button>'+
      '</div>'+
      '<div class="wb-hint-bar"><div class="wb-hint-text">创建世界书后，在角色创建页选择挂载。</div></div>'+
      '<div class="wb-home-list" id="wbHomeList">'+html+'</div>';

    page.querySelector('#wbHomeBack').addEventListener('click',function(){WB.close();});
    page.querySelector('#wbHomeCreate').addEventListener('click',function(){WB.openEditBook(-1);});

    // 点击卡片无法进入编辑，只能通过三个点
    page.querySelectorAll('[data-act="dots"]').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();WB.showDotsMenu(btn,parseInt(btn.dataset.idx));});
    });

    bindDrag(page,'.wb-home-card','.wb-home-actions',WB.books,function(){WB.save();WB.renderHome();});
    WB.bindSwipeBack(page,function(){WB.close();});
  },

  showDotsMenu:function(btnEl,idx){
    var old=document.querySelector('.wb-dots-menu');if(old)old.remove();
    var menu=document.createElement('div');menu.className='wb-dots-menu';
    menu.innerHTML=
      '<div class="wb-dots-mi" data-mact="edit">编辑</div>'+
      '<div class="wb-dots-mi" data-mact="copy">复制</div>'+
      '<div class="wb-dots-mi" data-mact="export">导出</div>'+
      '<div class="wb-dots-mi danger" data-mact="delete">删除</div>';
    var rect=btnEl.getBoundingClientRect();var left=rect.right-140,top=rect.bottom+4;
    if(left<8)left=8;if(top+180>window.innerHeight)top=rect.top-180;if(top<10)top=10;
    menu.style.left=left+'px';menu.style.top=top+'px';document.body.appendChild(menu);
    menu.querySelectorAll('.wb-dots-mi').forEach(function(mi){
      mi.addEventListener('click',function(e){e.stopPropagation();var act=mi.dataset.mact;menu.remove();
        if(act==='edit')WB.openEntryList(idx);
        if(act==='copy'){var src=WB.books[idx];if(!src)return;var cp=JSON.parse(JSON.stringify(src));cp.id='wb_'+Date.now();cp.name=cp.name+' (副本)';WB.books.unshift(cp);WB.save();WB.renderHome();App.showToast('已复制');}
        if(act==='export'){var b=WB.books[idx];if(!b)return;var blob=new Blob([JSON.stringify(b,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='worldbook_'+(b.name||'export')+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);App.showToast('已导出');}
        if(act==='delete'){if(!confirm('确定删除？'))return;WB.books.splice(idx,1);WB.save();WB.renderHome();App.showToast('已删除');}
      });
    });
    function dismiss(ev){if(menu.parentNode&&!menu.contains(ev.target)){menu.remove();document.removeEventListener('touchstart',dismiss);document.removeEventListener('click',dismiss);}}
    setTimeout(function(){document.addEventListener('touchstart',dismiss,{passive:true});document.addEventListener('click',dismiss);},100);
  },

  openEditBook:function(idx){
    var isNew=idx<0;
    var book=isNew?{id:'wb_'+Date.now(),name:'',entries:[]}:WB.books[idx];

    if(WB._editBookEl)WB._editBookEl.remove();
    var page=document.createElement('div');page.className='wb-edit-page';WB._editBookEl=page;

    page.innerHTML=
      '<div class="wb-header">'+
        '<button class="wb-back" id="wbBookBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<div class="wb-header-title">'+(isNew?'创建世界书':'编辑世界书')+'</div>'+
        '<div style="width:36px;"></div>'+
      '</div>'+
      '<div class="wb-edit-body"><div class="wb-edit-card">'+
        '<div class="wb-edit-section">'+
          '<div class="wb-edit-label"><div class="dot"></div>世界书名称</div>'+
          '<input type="text" class="wb-edit-input" id="wbBookName" value="'+App.escAttr(book.name||'')+'" placeholder="给世界书起个名字...">'+
        '</div>'+
      '</div>'+
      '<div class="wb-edit-btns">'+
        '<button class="wb-save-btn" id="wbBookSave" type="button">'+(isNew?'保存并进入':'保存')+'</button>'+
        '<button class="wb-cancel-btn" id="wbBookCancel" type="button">取消</button>'+
      '</div></div>';

    document.body.appendChild(page);
    raf2(function(){page.classList.add('show');});

    page.querySelector('#wbBookBack').addEventListener('click',function(){WB.closeEditBook();});
    page.querySelector('#wbBookCancel').addEventListener('click',function(){WB.closeEditBook();});
    page.querySelector('#wbBookSave').addEventListener('click',function(){
      var name=(page.querySelector('#wbBookName').value||'').trim();
      if(!name){App.showToast('请输入名称');return;}
      if(isNew){
        var newBook={id:'wb_'+Date.now(),name:name,entries:[]};
        WB.books.unshift(newBook);
        WB.save();WB.closeEditBook();WB.renderHome();
        WB.openEntryList(0);
        App.showToast('已创建');
            } else {
        book.name=name;
        WB.save();WB.closeEditBook();WB.renderHome();
        // 回到条目列表而不是首页
        var bookIdx=-1;
        for(var i=0;i<WB.books.length;i++){if(WB.books[i].id===book.id){bookIdx=i;break;}}
        if(bookIdx>=0)setTimeout(function(){WB.openEntryList(bookIdx);},360);
        App.showToast('已保存');
      }
    });

    WB.bindSwipeBack(page,function(){WB.closeEditBook();});
  },

  closeEditBook:function(){slideOut(WB._editBookEl,function(){WB._editBookEl=null;});},

  // ==================== 条目列表页 ====================
  openEntryList:function(bookIdx){
    var book=WB.books[bookIdx];if(!book)return;
    if(!book.entries)book.entries=[];

    if(WB._listEl)WB._listEl.remove();
    var page=document.createElement('div');page.className='wb-page';WB._listEl=page;
    document.body.appendChild(page);

    function render(){
      var rows='';
      if(!book.entries.length){
        rows='<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无条目，点击添加</div>';
      } else {
        rows=book.entries.map(function(e,i){
          var isOn=e.enabled!==false;
          var tags='';
          if(e.always)tags+='<span class="wb-tag-always">常驻</span>';
          if(e.useKeyword)tags+='<span class="wb-tag-kw">关键词</span>';
          if(e.position==='before')tags+='<span class="wb-tag-pos">角色前</span>';
          else if(e.position==='after')tags+='<span class="wb-tag-pos">角色后</span>';
          else if(e.position==='depth')tags+='<span class="wb-tag-pos">D'+(e.depth||4)+'</span>';
          return '<div class="wb-item" data-idx="'+i+'">'+
            '<div class="wb-info"><div class="wb-name">'+App.esc(e.name||'未命名')+'</div></div>'+
            '<div class="wb-tags">'+tags+'</div>'+
            '<div class="wb-actions">'+
              '<div class="wb-mini-btn" data-act="edit" data-idx="'+i+'"><svg viewBox="0 0 24 24"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>'+
              '<div class="wb-mini-btn del-btn" data-act="del" data-idx="'+i+'"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div>'+
              '<div class="wb-sw '+(isOn?'on':'off')+'" data-act="sw" data-idx="'+i+'"></div>'+
            '</div>'+
          '</div>';
        }).join('');
      }

      page.innerHTML=
        '<div class="wb-header">'+
          '<button class="wb-back" id="wbListBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
          '<div class="wb-header-title">'+App.esc(book.name||'世界书')+'</div>'+
          '<button class="wb-add-btn" id="wbListRename" type="button" style="background:rgba(126,163,201,.06);color:#7a9ab8;border:1px solid rgba(126,163,201,.3);">编辑名称</button>'+
        '</div>'+
        '<div class="wb-toolbar">'+
          '<div class="wb-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="wbListSearch" placeholder="搜索条目..."></div>'+
          '<button class="wb-add-btn" id="wbListAdd" type="button">添加</button>'+
        '</div>'+
        '<div class="wb-list" id="wbEntryList">'+rows+'</div>';

      bindEntryEvents();
    }

    function bindEntryEvents(){
      page.querySelector('#wbListBack').addEventListener('click',function(){WB.closeEntryList();});
      page.querySelector('#wbListAdd').addEventListener('click',function(){WB.openEditEntry(book,-1,function(){render();});});

      // 编辑名称 - 自定义弹窗
      page.querySelector('#wbListRename').addEventListener('click',function(){
        var old=document.querySelector('.wb-rename-overlay');if(old)old.remove();
        var ov=document.createElement('div');ov.className='wb-rename-overlay';
        ov.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
        ov.innerHTML=
          '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;">'+
            '<div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;">编辑名称</div>'+
            '<input type="text" id="wbRenameInput" value="'+App.escAttr(book.name||'')+'" placeholder="世界书名称..." style="padding:11px 14px;border:1.5px solid rgba(126,163,201,.25);border-radius:12px;font-size:14px;color:#2e4258;outline:none;font-family:inherit;background:rgba(126,163,201,.04);box-sizing:border-box;">'+
            '<div style="display:flex;gap:8px;">'+
              '<button id="wbRenameOk" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">保存</button>'+
              '<button id="wbRenameNo" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>'+
            '</div>'+
          '</div>';
        document.body.appendChild(ov);
        ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
        ov.querySelector('#wbRenameNo').addEventListener('click',function(){ov.remove();});
        ov.querySelector('#wbRenameOk').addEventListener('click',function(){
          var n=(ov.querySelector('#wbRenameInput').value||'').trim();
          if(!n){App.showToast('请输入名称');return;}
          book.name=n;WB.save();page.querySelector('.wb-header-title').textContent=n;WB.renderHome();ov.remove();App.showToast('已保存');
        });
        var inp=ov.querySelector('#wbRenameInput');inp.focus();inp.select();
      });

      var si=page.querySelector('#wbListSearch');
      if(si)si.addEventListener('input',function(){
        var q=this.value.trim().toLowerCase();
        page.querySelectorAll('.wb-item').forEach(function(el){
          var idx=parseInt(el.dataset.idx);var e=book.entries[idx];
          if(!e){el.style.display='';return;}
          var match=!q||(e.name||'').toLowerCase().indexOf(q)>=0||(e.content||'').toLowerCase().indexOf(q)>=0;
          el.style.display=match?'':'none';
        });
      });

      page.querySelectorAll('[data-act="edit"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();WB.openEditEntry(book,parseInt(btn.dataset.idx),function(){render();});});
      });

      page.querySelectorAll('[data-act="del"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();
          if(!confirm('删除？'))return;
          book.entries.splice(parseInt(btn.dataset.idx),1);WB.save();render();App.showToast('已删除');
        });
      });

      page.querySelectorAll('[data-act="sw"]').forEach(function(sw){
        sw.addEventListener('click',function(e){e.stopPropagation();
          var idx=parseInt(sw.dataset.idx);var entry=book.entries[idx];if(!entry)return;
          entry.enabled=entry.enabled===false?true:false;WB.save();
          sw.classList.toggle('on',entry.enabled!==false);sw.classList.toggle('off',entry.enabled===false);
        });
      });

      var items=page.querySelectorAll('.wb-item');
      items.forEach(function(el,elIdx){
        var timer=null,pressed=false,moved=false,startY=0,targetIdx;
        el.addEventListener('touchstart',function(e){
          if(e.target.closest('.wb-actions')||e.target.closest('.wb-mini-btn')||e.target.closest('.wb-sw'))return;
          moved=false;pressed=false;startY=e.touches[0].clientY;targetIdx=elIdx;
          timer=setTimeout(function(){pressed=true;el.classList.add('dragging');},400);
        },{passive:true});
        el.addEventListener('touchmove',function(e){
          if(timer&&!pressed){if(Math.abs(e.touches[0].clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
          if(!pressed)return;moved=true;e.preventDefault();
          var dy=e.touches[0].clientY-startY;el.style.transform='translateY('+dy+'px)';el.style.zIndex='100';
          var all=page.querySelectorAll('.wb-item');targetIdx=elIdx;
          all.forEach(function(c,ci){if(ci===elIdx)return;var rect=c.getBoundingClientRect();var mid=rect.top+rect.height/2;
            if(e.touches[0].clientY>mid&&ci>elIdx)targetIdx=ci;if(e.touches[0].clientY<mid&&ci<elIdx)targetIdx=ci;
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
          page.querySelectorAll('.wb-item').forEach(function(c){c.style.transform='';c.style.transition='';c.style.zIndex='';});
          if(pressed&&moved&&targetIdx!==elIdx){
            var item=book.entries.splice(elIdx,1)[0];book.entries.splice(targetIdx,0,item);WB.save();render();
          }
          pressed=false;moved=false;
        },{passive:true});
      });
    }

    render();
    raf2(function(){page.classList.add('show');});
    WB.bindSwipeBack(page,function(){WB.closeEntryList();});
  },

  closeEntryList:function(){slideOut(WB._listEl,function(){WB._listEl=null;});},

  // ==================== 新建/编辑条目 ====================
  openEditEntry:function(book,idx,onDone){
    var isNew=idx<0;
    var entry=isNew?{name:'',content:'',keyword:'',enabled:true,always:true,useKeyword:false,position:'before',depth:4}:JSON.parse(JSON.stringify(book.entries[idx]));
    if(entry.useKeyword===undefined)entry.useKeyword=!!entry.keyword;
    if(!entry.position)entry.position='before';
    if(entry.depth===undefined)entry.depth=4;

    if(WB._editEl)WB._editEl.remove();
    var page=document.createElement('div');page.className='wb-edit-page';WB._editEl=page;

    var alwaysOn=entry.always?'on':'off';
    var kwOn=entry.useKeyword?'on':'off';

    page.innerHTML=
      '<div class="wb-header">'+
        '<button class="wb-back" id="wbEditBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<div class="wb-header-title">'+(isNew?'新建条目':'编辑条目')+'</div>'+
        '<div style="width:36px;"></div>'+
      '</div>'+
      '<div class="wb-edit-body"><div class="wb-edit-card">'+

        '<div class="wb-edit-section">'+
          '<div class="wb-edit-label"><div class="dot"></div>条目名称</div>'+
          '<input type="text" class="wb-edit-input" id="wbEditName" value="'+App.escAttr(entry.name||'')+'" placeholder="条目名称...">'+
        '</div>'+

        '<div class="wb-edit-sep"></div>'+

        '<div class="wb-edit-section">'+
          '<div class="wb-edit-label"><div class="dot"></div>内容</div>'+
          '<div style="position:relative;">'+
            '<textarea class="wb-edit-textarea" id="wbEditContent" placeholder="条目内容...">'+App.esc(entry.content||'')+'</textarea>'+
            '<button class="wb-expand-btn" id="wbExpandBtn" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>'+
          '</div>'+
        '</div>'+

        '<div class="wb-edit-sep"></div>'+

        '<div class="wb-edit-section">'+
          '<div class="wb-always-row">'+
            '<div><div class="wb-always-label">常驻</div><div class="wb-always-hint">始终发送给AI，无需触发</div></div>'+
            '<div class="wb-sw '+alwaysOn+'" id="wbAlwaysSw"></div>'+
          '</div>'+
        '</div>'+

        '<div class="wb-edit-sep"></div>'+

        '<div class="wb-edit-section">'+
          '<div class="wb-always-row">'+
            '<div><div class="wb-always-label">关键词触发</div><div class="wb-always-hint">聊天中出现关键词时自动注入</div></div>'+
            '<div class="wb-sw '+kwOn+'" id="wbKwSw"></div>'+
          '</div>'+
          '<div id="wbKwArea" style="margin-top:10px;'+(entry.useKeyword?'':'display:none;')+'">'+
            '<input type="text" class="wb-edit-input" id="wbEditKeyword" value="'+App.escAttr(entry.keyword||'')+'" placeholder="用逗号分隔多个关键词...">'+
          '</div>'+
        '</div>'+

        '<div class="wb-edit-sep"></div>'+

        '<div class="wb-edit-section">'+
          '<div class="wb-edit-label"><div class="dot"></div>注入位置</div>'+
          '<div class="wb-pos-row">'+
            '<div class="wb-pos-btn'+(entry.position==='before'?' active':'')+'" data-pos="before">角色定义前</div>'+
            '<div class="wb-pos-btn'+(entry.position==='after'?' active':'')+'" data-pos="after">角色定义后</div>'+
            '<div class="wb-pos-btn'+(entry.position==='depth'?' active':'')+'" data-pos="depth">深度注入</div>'+
          '</div>'+
          '<div id="wbDepthArea" style="margin-top:8px;'+(entry.position==='depth'?'':'display:none;')+'">'+
            '<div style="display:flex;align-items:center;gap:10px;">'+
              '<span style="font-size:12px;color:#7a9ab8;font-weight:600;">注入深度</span>'+
              '<input type="number" class="wb-depth-input" id="wbEditDepth" value="'+(entry.depth||4)+'" min="0" max="99">'+
            '</div>'+
            '<div class="wb-edit-hint" style="margin-top:6px;">数字越小越靠近最新消息。0 = 紧接最后一条用户消息之前。</div>'+
          '</div>'+
        '</div>'+

      '</div>'+
      '<div class="wb-edit-btns">'+
        '<button class="wb-save-btn" id="wbEditSave" type="button">保存</button>'+
        '<button class="wb-cancel-btn" id="wbEditCancel" type="button">取消</button>'+
      '</div></div>';

    document.body.appendChild(page);
    raf2(function(){page.classList.add('show');});

    var alwaysState=!!entry.always;
    var kwState=!!entry.useKeyword;

    page.querySelector('#wbAlwaysSw').addEventListener('click',function(){
      alwaysState=!alwaysState;
      this.classList.toggle('on',alwaysState);this.classList.toggle('off',!alwaysState);
      if(alwaysState&&kwState){
        kwState=false;
        var kwSw=page.querySelector('#wbKwSw');
        kwSw.classList.remove('on');kwSw.classList.add('off');
        page.querySelector('#wbKwArea').style.display='none';
      }
    });

    page.querySelector('#wbKwSw').addEventListener('click',function(){
      kwState=!kwState;
      this.classList.toggle('on',kwState);this.classList.toggle('off',!kwState);
      page.querySelector('#wbKwArea').style.display=kwState?'':'none';
      if(kwState&&alwaysState){
        alwaysState=false;
        var aSw=page.querySelector('#wbAlwaysSw');
        aSw.classList.remove('on');aSw.classList.add('off');
      }
    });

    page.querySelectorAll('.wb-pos-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        page.querySelectorAll('.wb-pos-btn').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        page.querySelector('#wbDepthArea').style.display=btn.dataset.pos==='depth'?'':'none';
      });
    });

    page.querySelector('#wbExpandBtn').addEventListener('click',function(){
      WB.openExpand(page.querySelector('#wbEditContent'));
    });

    page.querySelector('#wbEditBack').addEventListener('click',function(){WB.closeEditEntry();});
    page.querySelector('#wbEditCancel').addEventListener('click',function(){WB.closeEditEntry();});

    page.querySelector('#wbEditSave').addEventListener('click',function(){
      var name=(page.querySelector('#wbEditName').value||'').trim();
      var content=(page.querySelector('#wbEditContent').value||'').trim();
      var keyword=kwState?(page.querySelector('#wbEditKeyword').value||'').trim():'';
      if(!content){App.showToast('请输入内容');return;}
      var posBtn=page.querySelector('.wb-pos-btn.active');
      var position=posBtn?posBtn.dataset.pos:'before';
      var depth=parseInt(page.querySelector('#wbEditDepth').value)||4;
      var obj={name:name||'未命名',content:content,keyword:keyword,enabled:true,always:alwaysState,useKeyword:kwState,position:position,depth:depth};
      if(isNew){book.entries.unshift(obj);}
      else{book.entries[idx]=obj;}
      WB.save();WB.closeEditEntry();
      if(onDone)onDone();
      App.showToast(isNew?'已添加':'已保存');
    });

    WB.bindSwipeBack(page,function(){WB.closeEditEntry();});
  },

  closeEditEntry:function(){slideOut(WB._editEl,function(){WB._editEl=null;});},

  openExpand:function(textarea){
    if(WB._expandEl)WB._expandEl.remove();
    var ed=document.createElement('div');WB._expandEl=ed;
    ed.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10003;background:#fff;display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.32,.72,0,1),opacity .3s;transform:translateY(100%);opacity:0;';
    ed.innerHTML=
      '<div class="wb-header"><button class="wb-back" id="wbExpBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><div class="wb-header-title">条目内容</div><button id="wbExpDone" type="button" style="background:none;border:none;color:#7a9ab8;font-size:13px;font-weight:600;cursor:pointer;padding:4px 10px;">完成</button></div>'+
      '<div style="flex:1;padding:12px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;"><textarea id="wbExpTA" style="width:100%;min-height:calc(100vh - 120px);border:1.5px solid rgba(126,163,201,.25);border-radius:12px;padding:14px 16px;font-size:13px;color:#2e4258;outline:none;font-family:inherit;background:rgba(126,163,201,.04);resize:none;line-height:1.7;box-sizing:border-box;">'+App.esc(textarea.value)+'</textarea></div>';
    document.body.appendChild(ed);
    raf2(function(){ed.style.transform='translateY(0)';ed.style.opacity='1';});
    var ta=ed.querySelector('#wbExpTA');if(ta)ta.focus();
    function done(){textarea.value=ed.querySelector('#wbExpTA').value;ed.style.transform='translateY(100%)';ed.style.opacity='0';setTimeout(function(){if(ed.parentNode)ed.remove();WB._expandEl=null;},350);}
    ed.querySelector('#wbExpBack').addEventListener('click',done);
    ed.querySelector('#wbExpDone').addEventListener('click',done);
  },

  getEntriesForChar:function(charId){
    if(!charId)return [];
    var c=App.character?App.character.getById(charId):null;
    if(!c||!c.worldbookIds||!c.worldbookIds.length)return [];
    var result=[];
    c.worldbookIds.forEach(function(wbId){
      var book=null;
      WB.books.forEach(function(b){if(b.id===wbId)book=b;});
      if(book&&book.entries){book.entries.forEach(function(e){if(e.enabled!==false)result.push(e);});}
    });
    return result;
  },

  getBookList:function(){return WB.books.map(function(b){return{id:b.id,name:b.name};});},

  bindSwipeBack:function(page,onBack){
    var _sw={active:false,sx:0,sy:0,locked:false,dir:''};
    page.addEventListener('touchstart',function(e){var t=e.touches[0];if(t.clientX-page.getBoundingClientRect().left>50)return;_sw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
    page.addEventListener('touchmove',function(e){if(!_sw.active)return;var t=e.touches[0];var dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;if(!_sw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.locked=true;_sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_sw.dir==='h'&&dx>0){e.preventDefault();page.style.transform='translateX('+Math.min(dx,page.offsetWidth)+'px)';page.style.opacity=String(1-dx/page.offsetWidth*.5);}},{passive:false});
    page.addEventListener('touchend',function(e){if(!_sw.active)return;_sw.active=false;if(_sw.dir!=='h'){page.style.transform='';page.style.opacity='';return;}var dx=e.changedTouches[0].clientX-_sw.sx;if(dx>page.offsetWidth*.3){page.style.transition='transform .25s,opacity .25s';page.style.transform='translateX(100%)';page.style.opacity='0';setTimeout(function(){page.style.transition='';page.style.transform='';page.style.opacity='';if(onBack)onBack();},260);}else{page.style.transition='transform .2s,opacity .2s';page.style.transform='';page.style.opacity='';setTimeout(function(){page.style.transition='';},220);}},{passive:true});
  },

  init:function(){WB.load();App.worldbook=WB;}
};

function raf2(fn){requestAnimationFrame(function(){requestAnimationFrame(fn);});}
function slideOut(el,cb){if(!el)return;el.classList.remove('show');el.style.transform='translateX(100%)';el.style.opacity='0';setTimeout(function(){if(el.parentNode)el.remove();if(cb)cb();},350);}
function bindDrag(page,selector,excludeSelector,list,onDone){
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

App.register('worldbook',WB);
})();

