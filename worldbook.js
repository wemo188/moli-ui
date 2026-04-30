(function(){
'use strict';
var App=window.App;if(!App)return;

var WB={
  entries:[],
  _pageEl:null,
  _editEl:null,
  _expandEl:null,

  load:function(){WB.entries=App.LS.get('worldbookEntries')||[];},
  save:function(){App.LS.set('worldbookEntries',WB.entries);},

  open:function(){
    WB.load();
    if(WB._pageEl)WB._pageEl.remove();
    var page=document.createElement('div');page.className='wb-page';WB._pageEl=page;
    document.body.appendChild(page);WB.render();
    raf2(function(){page.classList.add('show');});
  },

  close:function(){
    var p=WB._pageEl;if(!p)return;
    p.classList.remove('show');
    setTimeout(function(){if(p.parentNode)p.remove();WB._pageEl=null;},350);
  },

  render:function(){
    var page=WB._pageEl;if(!page)return;
    var rows='';
    if(!WB.entries.length){
      rows='<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无条目，点击右上角添加</div>';
    } else {
      rows=WB.entries.map(function(e,i){
        var kwText=e.keyword?e.keyword:'';
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
        '<button class="wb-back" id="wbBack" type="button"><svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>'+
        '<div class="wb-header-title">世界书</div>'+
        '<button class="wb-add-btn" id="wbAddBtn" type="button">添加</button>'+
      '</div>'+
      '<div class="wb-toolbar">'+
        '<div class="wb-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><input type="text" id="wbSearchInput" placeholder="搜索条目或关键词..."></div>'+
      '</div>'+
      '<div class="wb-hint-bar"><div class="wb-hint-text">常驻条目始终发送给AI。非常驻条目在聊天中出现关键词时自动触发。</div></div>'+
      '<div class="wb-list" id="wbList">'+rows+'</div>';

    WB.bindEvents(page);
    WB.bindSwipeBack(page,function(){WB.close();});
  },

  bindEvents:function(page){
    page.querySelector('#wbBack').addEventListener('click',function(){WB.close();});
    page.querySelector('#wbAddBtn').addEventListener('click',function(){WB.openEdit(-1);});

    // 搜索
    var si=page.querySelector('#wbSearchInput');
    if(si)si.addEventListener('input',function(){
      var q=this.value.trim().toLowerCase();
      page.querySelectorAll('.wb-item').forEach(function(el){
        var idx=parseInt(el.dataset.idx);var e=WB.entries[idx];
        if(!e){el.style.display='';return;}
        var match=!q||(e.name||'').toLowerCase().indexOf(q)>=0||(e.keyword||'').toLowerCase().indexOf(q)>=0||(e.content||'').toLowerCase().indexOf(q)>=0;
        el.style.display=match?'':'none';
      });
    });

    // 编辑
    page.querySelectorAll('[data-act="edit"]').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();WB.openEdit(parseInt(btn.dataset.idx));});
    });

    // 删除
    page.querySelectorAll('[data-act="del"]').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();
        if(!confirm('删除这个条目？'))return;
        WB.entries.splice(parseInt(btn.dataset.idx),1);WB.save();WB.render();App.showToast('已删除');
      });
    });

    // 开关
    page.querySelectorAll('[data-act="sw"]').forEach(function(sw){
      sw.addEventListener('click',function(e){e.stopPropagation();
        var idx=parseInt(sw.dataset.idx);var entry=WB.entries[idx];if(!entry)return;
        entry.enabled=entry.enabled===false?true:false;WB.save();
        sw.classList.toggle('on',entry.enabled!==false);
        sw.classList.toggle('off',entry.enabled===false);
      });
    });

    // 长按拖拽
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
        page.querySelectorAll('.wb-item').forEach(function(c){c.style.transform='';c.style.transition='';c.style.zIndex='';});
        if(pressed&&moved&&targetIdx!==elIdx){
          var item=WB.entries.splice(elIdx,1)[0];WB.entries.splice(targetIdx,0,item);WB.save();WB.render();
        }
        pressed=false;moved=false;
      },{passive:true});
    });
  },

  // ==================== 编辑/新建 ====================
  openEdit:function(idx){
    var isNew=idx<0;
    var entry=isNew?{name:'',keyword:'',content:'',enabled:true,always:false}:JSON.parse(JSON.stringify(WB.entries[idx]));

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
          '<div class="wb-edit-label"><div class="dot"></div>关键词</div>'+
          '<input type="text" class="wb-edit-input" id="wbEditKeyword" value="'+App.escAttr(entry.keyword||'')+'" placeholder="用逗号分隔多个关键词...">'+
          '<div class="wb-edit-hint">当聊天中出现这些关键词时，该条目会自动注入到AI的上下文中。常驻条目不需要关键词。</div>'+
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
      this.classList.toggle('on',alwaysState);
      this.classList.toggle('off',!alwaysState);
    });

    page.querySelector('#wbExpandBtn').addEventListener('click',function(){
      WB.openExpand(page.querySelector('#wbEditContent'));
    });

    page.querySelector('#wbEditBack').addEventListener('click',function(){WB.closeEdit();});
    page.querySelector('#wbEditCancel').addEventListener('click',function(){WB.closeEdit();});

    page.querySelector('#wbEditSave').addEventListener('click',function(){
      var name=(page.querySelector('#wbEditName').value||'').trim();
      var keyword=(page.querySelector('#wbEditKeyword').value||'').trim();
      var content=(page.querySelector('#wbEditContent').value||'').trim();
      if(!content){App.showToast('请输入内容');return;}
      var obj={name:name||keyword||'未命名',keyword:keyword,content:content,enabled:true,always:alwaysState};
      if(isNew){WB.entries.unshift(obj);}
      else{WB.entries[idx]=obj;}
      WB.save();WB.closeEdit();WB.render();
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
    ed.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10002;background:#fff;display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.32,.72,0,1),opacity .3s;transform:translateY(100%);opacity:0;';
    ed.innerHTML=
      '<div class="wb-header">'+
        '<button class="wb-back" id="wbExpBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
        '<div class="wb-header-title">条目内容</div>'+
        '<button id="wbExpDone" type="button" style="background:none;border:none;color:#7a9ab8;font-size:13px;font-weight:600;cursor:pointer;padding:4px 10px;">完成</button>'+
      '</div>'+
      '<div style="flex:1;padding:12px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;">'+
        '<textarea id="wbExpTA" style="width:100%;min-height:calc(100vh - 120px);border:1.5px solid rgba(126,163,201,.25);border-radius:12px;padding:14px 16px;font-size:13px;color:#2e4258;outline:none;font-family:inherit;background:rgba(126,163,201,.04);resize:none;line-height:1.7;box-sizing:border-box;">'+App.esc(textarea.value)+'</textarea>'+
      '</div>';
    document.body.appendChild(ed);
    raf2(function(){ed.style.transform='translateY(0)';ed.style.opacity='1';});
    var ta=ed.querySelector('#wbExpTA');if(ta)ta.focus();
    function done(){textarea.value=ed.querySelector('#wbExpTA').value;ed.style.transform='translateY(100%)';ed.style.opacity='0';setTimeout(function(){if(ed.parentNode)ed.remove();WB._expandEl=null;},350);}
    ed.querySelector('#wbExpBack').addEventListener('click',done);
    ed.querySelector('#wbExpDone').addEventListener('click',done);
  },

  bindSwipeBack:function(page,onBack){
    var _sw={active:false,sx:0,sy:0,locked:false,dir:''};
    page.addEventListener('touchstart',function(e){var t=e.touches[0];if(t.clientX-page.getBoundingClientRect().left>50)return;_sw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
    page.addEventListener('touchmove',function(e){if(!_sw.active)return;var t=e.touches[0];var dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;if(!_sw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.locked=true;_sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_sw.dir==='h'&&dx>0){e.preventDefault();page.style.transform='translateX('+Math.min(dx,page.offsetWidth)+'px)';page.style.opacity=String(1-dx/page.offsetWidth*.5);}},{passive:false});
    page.addEventListener('touchend',function(e){if(!_sw.active)return;_sw.active=false;if(_sw.dir!=='h'){page.style.transform='';page.style.opacity='';return;}var dx=e.changedTouches[0].clientX-_sw.sx;if(dx>page.offsetWidth*.3){page.style.transition='transform .25s,opacity .25s';page.style.transform='translateX(100%)';page.style.opacity='0';setTimeout(function(){page.style.transition='';page.style.transform='';page.style.opacity='';if(onBack)onBack();},260);}else{page.style.transition='transform .2s,opacity .2s';page.style.transform='';page.style.opacity='';setTimeout(function(){page.style.transition='';},220);}},{passive:true});
  },

  init:function(){WB.load();App.worldbook=WB;}
};

function raf2(fn){requestAnimationFrame(function(){requestAnimationFrame(fn);});}

App.register('worldbook',WB);
})();