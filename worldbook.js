
(function(){
'use strict';
var App=window.App;if(!App)return;

var WB={
  books:[],
  _homeEl:null,
  _listEl:null,
  _editEl:null,
  _expandEl:null,

  load:function(){WB.books=App.LS.get('worldbooks')||[];},
  save:function(){App.LS.set('worldbooks',WB.books);},

  // ==================== 首页：世界书列表 ====================
  open:function(){
    WB.load();
    if(WB._homeEl)WB._homeEl.remove();
    var page=document.createElement('div');page.className='wb-page';WB._homeEl=page;
    document.body.appendChild(page);WB.renderHome();
    raf2(function(){page.classList.add('show');});
  },

  close:function(){
    var p=WB._homeEl;if(!p)return;
    p.classList.remove('show');
    setTimeout(function(){if(p.parentNode)p.remove();WB._homeEl=null;},350);
  },

  renderHome:function(){
    var page=WB._homeEl;if(!page)return;
    var html='';
    if(!WB.books.length){
      html='<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无世界书，点击右上角创建</div>';
    } else {
      html=WB.books.map(function(b,i){
        var count=(b.entries||[]).length;
        return '<div class="wb-home-card" data-idx="'+i+'">'+
          '<div class="wb-home-info">'+
            '<div class="wb-home-name">'+App.esc(b.name||'未命名')+'</div>'+
            '<div class="wb-home-desc">'+count+' 个条目</div>'+
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
      '<div class="wb-hint-bar"><div class="wb-hint-text">创建世界书后，在角色创建页选择挂载。常驻条目始终发送，非常驻条目在聊天中出现关键词时自动触发。</div></div>'+
      '<div class="wb-home-list" id="wbHomeList">'+html+'</div>';

    page.querySelector('#wbHomeBack').addEventListener('click',function(){WB.close();});
    page.querySelector('#wbHomeCreate').addEventListener('click',function(){
      var name=prompt('世界书名称：');
      if(!name||!name.trim())return;
      WB.books.unshift({id:'wb_'+Date.now(),name:name.trim(),entries:[]});
      WB.save();WB.renderHome();App.showToast('已创建');
    });

    // 点击卡片进入条目列表
    page.querySelectorAll('.wb-home-card').forEach(function(card){
      card.addEventListener('click',function(e){
        if(e.target.closest('.wb-mini-btn'))return;
        WB.openEntryList(parseInt(card.dataset.idx));
      });
    });

    // 三个点菜单
    page.querySelectorAll('[data-act="dots"]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        WB.showDotsMenu(btn,parseInt(btn.dataset.idx));
      });
    });

    // 首页卡片拖拽
    bindDrag(page,'.wb-home-card','.wb-home-actions',WB.books,function(){WB.save();WB.renderHome();});
    WB.bindSwipeBack(page,function(){WB.close();});
  },

  showDotsMenu:function(btnEl,idx){
    var old=document.querySelector('.wb-dots-menu');if(old)old.remove();
    var menu=document.createElement('div');menu.className='wb-dots-menu';
    menu.innerHTML=
      '<div class="wb-dots-mi" data-mact="rename">重命名</div>'+
      '<div class="wb-dots-mi" data-mact="copy">复制</div>'+
      '<div class="wb-dots-mi" data-mact="export">导出</div>'+
      '<div class="wb-dots-mi danger" data-mact="delete">删除</div>';
    var rect=btnEl.getBoundingClientRect();var left=rect.right-140,top=rect.bottom+4;
    if(left<8)left=8;if(top+180>window.innerHeight)top=rect.top-180;if(top<10)top=10;
    menu.style.left=left+'px';menu.style.top=top+'px';document.body.appendChild(menu);

    menu.querySelectorAll('.wb-dots-mi').forEach(function(mi){
      mi.addEventListener('click',function(e){e.stopPropagation();var act=mi.dataset.mact;menu.remove();
        if(act==='rename'){var n=prompt('世界书名称：',WB.books[idx].name||'');if(n===null)return;WB.books[idx].name=n.trim();WB.save();WB.renderHome();App.showToast('已重命名');}
        if(act==='copy'){var src=WB.books[idx];if(!src)return;var cp=JSON.parse(JSON.stringify(src));cp.id='wb_'+Date.now();cp.name=cp.name+' (副本)';WB.books.unshift(cp);WB.save();WB.renderHome();App.showToast('已复制');}
        if(act==='export'){var b=WB.books[idx];if(!b)return;var blob=new Blob([JSON.stringify(b,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='worldbook_'+(b.name||'export')+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);App.showToast('已导出');}
        if(act==='delete'){if(!confirm('确定删除这本世界书？'))return;WB.books.splice(idx,1);WB.save();WB.renderHome();App.showToast('已删除');}
      });
    });
    function dismiss(ev){if(menu.parentNode&&!menu.contains(ev.target)){menu.remove();document.removeEventListener('touchstart',dismiss);document.removeEventListener('click',dismiss);}}
    setTimeout(function(){document.addEventListener('touchstart',dismiss,{passive:true});document.addEventListener('click',dismiss);},100);
  },

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
        rows='<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无条目，点击右上角添加</div>';
      } else {
        rows=book.entries.map(function(e,i){
          var kwText=e.keyword||'';
          var isOn=e.enabled!==false;
          var alwaysTag=e.always?'<span class="wb-tag-always">常驻</span>':'';
          return '<div class="wb-item" data-idx="'+i+'">'+
            '<div class="wb-info">'+
              '<div class="wb-name">'+App.esc(e.name||'未命名')+'</div>'+
              (kwText?'<div class="wb-keywords">关键词：'+App.esc(kwText)+'</div>':'')+
            '</div>'+
            '<div class="wb-tags">'+alwaysTag+'</div>'+
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
          '<button class="wb-add-btn" id="wbListAdd" type="button">添加</button>'+
        '</div>'+
        '<div class="wb-toolbar"><div class="wb-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="wbListSearch" placeholder="搜索条目或关键词..."></div></div>'+
        '<div class="wb-list" id="wbEntryList">'+rows+'</div>';

      bindEntryEvents();
    }

    function bindEntryEvents(){
      page.querySelector('#wbListBack').addEventListener('click',function(){WB.closeEntryList();});
      page.querySelector('#wbListAdd').addEventListener('click',function(){WB.openEdit(book,-1,function(){render();});});

      var si=page.querySelector('#wbListSearch');
      if(si)si.addEventListener('input',function(){
        var q=this.value.trim().toLowerCase();
        page.querySelectorAll('.wb-item').forEach(function(el){
          var idx=parseInt(el.dataset.idx);var e=book.entries[idx];
          if(!e){el.style.display='';return;}
          var match=!q||(e.name||'').toLowerCase().indexOf(q)>=0||(e.keyword||'').toLowerCase().indexOf(q)>=0||(e.content||'').toLowerCase().indexOf(q)>=0;
          el.style.display=match?'':'none';
        });
      });

      page.querySelectorAll('[data-act="edit"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();WB.openEdit(book,parseInt(btn.dataset.idx),function(){render();});});
      });

      page.querySelectorAll('[data-act="del"]').forEach(function(btn){
        btn.addEventListener('click',function(e){e.stopPropagation();
          if(!confirm('删除这个条目？'))return;
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

      // 条目拖拽
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

  closeEntryList:function(){
    var p=WB._listEl;if(!p)return;
    p.classList.remove('show');
    setTimeout(function(){if(p.parentNode)p.remove();WB._listEl=null;},350);
  },

  // ==================== 新建/编辑条目 ====================
  openEdit:function(book,idx,onDone){
    var isNew=idx<0;
    var entry=isNew?{name:'',content:'',keyword:'',enabled:true,always:false}:JSON.parse(JSON.stringify(book.entries[idx]));

    if(WB._editEl)WB._editEl.remove();
    var page=document.createElement('div');page.className='wb-edit-page';WB._editEl=page;

    var alwaysOn=entry.always?'on':'off';

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
          '<div class="wb-edit-label"><div class="dot"></div>关键词</div>'+
          '<input type="text" class="wb-edit-input" id="wbEditKeyword" value="'+App.escAttr(entry.keyword||'')+'" placeholder="用逗号分隔多个关键词...">'+
          '<div class="wb-edit-hint">当聊天中出现这些关键词时，该条目会自动注入到AI的上下文中。常驻条目不需要关键词。</div>'+
        '</div>'+

        '<div class="wb-edit-sep"></div>'+

        '<div class="wb-edit-section">'+
          '<div class="wb-always-row">'+
            '<div>'+
              '<div class="wb-always-label">常驻</div>'+
              '<div class="wb-always-hint">常驻条目始终发送给AI，无需关键词触发</div>'+
            '</div>'+
            '<div class="wb-sw '+alwaysOn+'" id="wbAlwaysSw"></div>'+
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

    page.querySelector('#wbAlwaysSw').addEventListener('click',function(){
      alwaysState=!alwaysState;
      this.classList.toggle('on',alwaysState);this.classList.toggle('off',!alwaysState);
    });

    page.querySelector('#wbExpandBtn').addEventListener('click',function(){
      WB.openExpand(page.querySelector('#wbEditContent'));
    });

    page.querySelector('#wbEditBack').addEventListener('click',function(){WB.closeEdit();});
    page.querySelector('#wbEditCancel').addEventListener('click',function(){WB.closeEdit();});

    page.querySelector('#wbEditSave').addEventListener('click',function(){
      var name=(page.querySelector('#wbEditName').value||'').trim();
      var content=(page.querySelector('#wbEditContent').value||'').trim();
      var keyword=(page.querySelector('#wbEditKeyword').value||'').trim();
      if(!content){App.showToast('请输入内容');return;}
      var obj={name:name||keyword||'未命名',content:content,keyword:keyword,enabled:true,always:alwaysState};
      if(isNew){book.entries.unshift(obj);}
      else{book.entries[idx]=obj;}
      WB.save();WB.closeEdit();
      if(onDone)onDone();
      App.showToast(isNew?'已添加':'已保存');
    });

    WB.bindSwipeBack(page,function(){WB.closeEdit();});
  },

  closeEdit:function(){
    var p=WB._editEl;if(!p)return;
    p.classList.remove('show');
    setTimeout(function(){if(p.parentNode)p.remove();WB._editEl=null;},350);
  },

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

  // ==================== 获取角色挂载的世界书条目 ====================
  getEntriesForChar:function(charId){
    if(!charId)return [];
    var c=App.character?App.character.getById(charId):null;
    if(!c||!c.worldbookIds||!c.worldbookIds.length)return [];
    var result=[];
    c.worldbookIds.forEach(function(wbId){
      var book=null;
      WB.books.forEach(function(b){if(b.id===wbId)book=b;});
      if(book&&book.entries){
        book.entries.forEach(function(e){
          if(e.enabled!==false)result.push(e);
        });
      }
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
