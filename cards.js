
(function(){
'use strict';
var App=window.App;if(!App)return;

var EMPTY={name:'',sub:'',avatar:'',tag1:'',tag2:''};
var DEF_SUB_L='✥ 同你奔赴一场风花雪月 ✥';
var DEF_SUB_R='◈ 与你共赏一阙火树银花 ◈';

var Cards={
  data:{},_dragOffsets:{},_searchDragOffsets:{},

  load:function(){
    Cards.data=App.LS.get('profileCards')||{};
    if(!Cards.data.left){Cards.data.left=JSON.parse(JSON.stringify(EMPTY));Cards.data.left.sub=DEF_SUB_L;}
    if(!Cards.data.right){Cards.data.right=JSON.parse(JSON.stringify(EMPTY));Cards.data.right.sub=DEF_SUB_R;}
    if(!Cards.data.colors)Cards.data.colors={left:{},right:{}};
    if(!Cards.data.searchColors)Cards.data.searchColors={left:{},right:{}};
    if(!Cards.data.bind)Cards.data.bind={charId:'',callName:''};
    Cards._dragOffsets=App.LS.get('cardDragOffsets')||{};
    Cards._searchDragOffsets=App.LS.get('searchDragOffsets')||{};},
  save:function(){App.LS.set('profileCards',Cards.data);},
  saveDrag:function(){App.LS.set('cardDragOffsets',Cards._dragOffsets);},
  saveSearchDrag:function(){App.LS.set('searchDragOffsets',Cards._searchDragOffsets);},

  getBindDays:function(){
    var bind=Cards.data.bind;
    if(!bind||!bind.charId)return -1;
    var msgs=App.LS.get('chatMsgs_'+bind.charId);
    if(!msgs||!msgs.length)return -1;
    var first=msgs[0];
    if(!first||!first.ts)return -1;
    var diff=Date.now()-first.ts;
    return Math.floor(diff/(1000*60*60*24));
  },

  render:function(){
    var container=App.$('#cardRow');if(!container)return;
    var L=Cards.data.left,R=Cards.data.right;
    var colL=Cards.data.colors&&Cards.data.colors.left?Cards.data.colors.left:{};
    var colR=Cards.data.colors&&Cards.data.colors.right?Cards.data.colors.right:{};
    var scL=Cards.data.searchColors&&Cards.data.searchColors.left?Cards.data.searchColors.left:{};
    var scR=Cards.data.searchColors&&Cards.data.searchColors.right?Cards.data.searchColors.right:{};

    var lt1=L.tag1||'标签',lt2=L.tag2||'标签';
    var lt1C=L.tag1?'':' bx-tag-placeholder',lt2C=L.tag2?'':' bx-tag-placeholder';

    var lFront=L.avatar
      ?'<div class="bx-av-front" style="background-image:url(\''+App.escAttr(L.avatar)+'\')"></div>'
      :'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-43.6-78-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';

    var lName=L.name||'角色名',lSub=L.sub||DEF_SUB_L;
    var lNameC=L.name?'':' bx-name-placeholder';

    var rt1=R.tag1||'标签',rt2=R.tag2||'标签';
    var rt1C=R.tag1?'':' bx-ribbon-placeholder',rt2C=R.tag2?'':' bx-ribbon-placeholder';

    var rFront=R.avatar
      ?'<div class="bx-av-front" style="background-image:url(\''+App.escAttr(R.avatar)+'\')"></div>'
      :'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';

    var rName=R.name||'角色名',rSub=R.sub||DEF_SUB_R;
    var rNameC=R.name?'':' bx-name-placeholder';

    /*绑定天数 */
    var days=Cards.getBindDays();
    var bind=Cards.data.bind||{};
    var callName=bind.callName||'';
    var leftText=days>=0?'我们已经相识...':'我们相识...';
    var rightText=days>=0?(days+'天了'+(callName?'，'+callName+'♥':'')):'已经有...天';
    var savedLeftText=App.LS.get('searchText_left');
    var savedRightText=App.LS.get('searchText_right');
    if(days<0){
      leftText=savedLeftText||'我们相识...';
      rightText=savedRightText||'已经有...天';
    }

    /* 对话框头像 */
    var av1Saved=App.LS.get('avatar_search1');
    var av1Html=av1Saved
      ?'<img src="'+App.escAttr(av1Saved)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">':'<svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg>';var av2Saved=App.LS.get('avatar_search2');
    var av2Html=av2Saved
      ?'<img src="'+App.escAttr(av2Saved)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
      :'<svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg>';

    container.innerHTML=
      '<div class="left-area-wrapper">'+
        '<div class="bx-w" id="bx-2" data-side="left">'+
          '<div class="bx-tag-wrap">'+
            '<div class="bx-tag bx-tag1'+lt1C+'">'+App.esc(lt1)+'</div>'+
            '<div class="bx-tag bx-tag2'+lt2C+'">'+App.esc(lt2)+'</div>'+
          '</div>'+
          '<div class="bx-cw"><div class="bx-cd">'+
            '<div class="bx-av-box">'+lFront+'</div>'+
            '<div class="bx-name-bar">'+
              '<div class="bx-name'+lNameC+'">'+App.esc(lName)+'</div>'+
              '<div class="bx-sub">'+App.esc(lSub)+'</div>'+
            '</div>'+
          '</div></div>'+
        '</div>'+
        '<div class="left-search-area">'+
          '<div class="search-wrapper" id="searchWrap1">'+
            '<div class="search-box">'+
              '<div class="avatar-area-left" data-side="search1"><div class="avatar-preview" id="avatarPreview1">'+av1Html+'</div></div>'+
              '<input type="text" class="search-input-left" value="'+App.escAttr(leftText)+'" readonly>'+
            '</div>'+
          '</div>'+
          '<div class="search-wrapper" id="searchWrap2">'+
            '<div class="search-box-right">'+
              '<input type="text" class="search-input-right" value="'+App.escAttr(rightText)+'" readonly>'+
              '<div class="avatar-area-right" data-side="search2"><div class="avatar-preview" id="avatarPreview2">'+av2Html+'</div></div>'+
            '</div>'+
          '</div>'+
        '</div>'+'</div>'+
      '<div class="card-right-area">'+
        '<div class="card-placeholder-icons">'+
          '<div class="card-ph-item"><div class="card-ph-icon"></div><div class="card-ph-label">占位符</div></div>'+
          '<div class="card-ph-item"><div class="card-ph-icon"></div><div class="card-ph-label">占位符</div></div>'+
        '</div>'+
        '<div class="bx-w" id="bx-1" data-side="right">'+
          '<div class="bx-cw"><div class="bx-cd">'+
            '<div class="bx-side-ribbon">'+
              '<div class="bx-ribbon-tab r1'+rt1C+'">'+App.esc(rt1)+'</div>'+
              '<div class="bx-ribbon-tab r2'+rt2C+'">'+App.esc(rt2)+'</div>'+
            '</div>'+
            '<div class="bx-av-box">'+rFront+'</div>'+
            '<div class="bx-name-bar">'+
              '<div class="bx-name'+rNameC+'">'+App.esc(rName)+'</div>'+
              '<div class="bx-sub">'+App.esc(rSub)+'</div>'+
            '</div>'+
          '</div></div>'+
        '</div>'+
      '</div>';

    Cards.applyCardColors('bx-2','left');
    Cards.applyCardColors('bx-1','right');
    Cards.applySearchColors('searchWrap1','left');
    Cards.applySearchColors('searchWrap2','right');
    Cards.applyDragOffsets();
    Cards.applySearchDragOffsets();
    Cards.bindEdit();
    Cards.bindDrag();
    Cards.bindSearchDrag();
    Cards.bindSearchEdit();
  },

  applyCardColors:function(id,side){
    var el=App.$('#'+id);if(!el)return;
    var col=Cards.data.colors&&Cards.data.colors[side]?Cards.data.colors[side]:{};
    if(col.borderC)el.style.setProperty('--bx-border-c',col.borderC);
    if(col.borderW)el.style.setProperty('--bx-border-w',col.borderW+'px');
    if(col.tagC)el.style.setProperty('--bx-tag-c',col.tagC);
    if(col.tagFC)el.style.setProperty('--bx-tag-fc',col.tagFC);
    if(col.nameC)el.style.setProperty('--bx-name-c',col.nameC);
    if(col.subC)el.style.setProperty('--bx-sub-c',col.subC);
  },

  applySearchColors:function(id,side){
    var el=App.$('#'+id);if(!el)return;
    var box=el.querySelector('.search-box')||el.querySelector('.search-box-right');if(!box)return;
    var col=Cards.data.searchColors&&Cards.data.searchColors[side]?Cards.data.searchColors[side]:{};
    if(col.lineC)box.style.setProperty('--sb-line-c',col.lineC);
    if(col.shadowC)box.style.setProperty('--sb-shadow-c',col.shadowC);
  },

  applyDragOffsets:function(){
    ['bx-1','bx-2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var off=Cards._dragOffsets[id];
      if(off)el.style.transform='translate('+off.x+'px,'+off.y+'px)';
    });
  },

  applySearchDragOffsets:function(){
    ['searchWrap1','searchWrap2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var off=Cards._searchDragOffsets[id];
      if(off)el.style.transform='translate('+off.x+'px,'+off.y+'px)';
    });
  },

  bindEdit:function(){
    document.querySelectorAll('#cardRow .bx-w').forEach(function(card){
      var nameBar=card.querySelector('.bx-name-bar');
      if(nameBar)nameBar.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();Cards.openCardEdit(card.dataset.side,card);});
      var ph=card.querySelector('.bx-av-placeholder');
      if(ph)ph.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();Cards.openCardEdit(card.dataset.side,card);});
    });
  },

  bindSearchEdit:function(){
    ['searchWrap1','searchWrap2'].forEach(function(id,i){
      var el=App.$('#'+id);if(!el)return;
      var side=i===0?'left':'right';
      el.addEventListener('click',function(e){
        if(e.target.closest('.avatar-area-left')||e.target.closest('.avatar-area-right'))return;
        e.stopPropagation();
        Cards.openSearchEdit(side,el);
      });
      var avArea=el.querySelector('.avatar-area-left')||el.querySelector('.avatar-area-right');
      if(avArea){
        avArea.addEventListener('click',function(e){
          e.stopPropagation();
          Cards.uploadSearchAvatar(side==='left'?'search1':'search2');
        });
      }
    });
  },

  bindDrag:function(){
    ['bx-1','bx-2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var avBox=el.querySelector('.bx-av-box');if(!avBox)return;
      Cards._bindDragTouch(avBox,el,id,Cards._dragOffsets,function(){Cards.saveDrag();},'.bx-av-placeholder');
    });
  },

  bindSearchDrag:function(){
    ['searchWrap1','searchWrap2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      Cards._bindDragTouch(el,el,id,Cards._searchDragOffsets,function(){Cards.saveSearchDrag();},'.avatar-area-left,.avatar-area-right');
    });
  },

  _bindDragTouch:function(touchEl,moveEl,id,offsets,saveFn,ignoreSelector){
    var startX,startY,startOX,startOY,longPressed=false,timer,moved=false;
    touchEl.addEventListener('touchstart',function(e){
      if(ignoreSelector&&e.target.closest(ignoreSelector))return;
      var t=e.touches[0];startX=t.clientX;startY=t.clientY;longPressed=false;moved=false;
      timer=setTimeout(function(){
        longPressed=true;
        var off=offsets[id]||{x:0,y:0};startOX=off.x;startOY=off.y;
        moveEl.style.transition='none';moveEl.style.opacity='0.85';moveEl.style.zIndex='999';
        if(navigator.vibrate)navigator.vibrate(15);
      },500);
    },{passive:true});
    touchEl.addEventListener('touchmove',function(e){
      var t=e.touches[0];
      if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
      if(!longPressed)return;
      moved=true;e.preventDefault();e.stopPropagation();
      var nx=startOX+t.clientX-startX,ny=startOY+t.clientY-startY;
      moveEl.style.transform='translate('+nx+'px,'+ny+'px)';
      offsets[id]={x:nx,y:ny};
    },{passive:false});
    touchEl.addEventListener('touchend',function(e){
      clearTimeout(timer);timer=null;
      moveEl.style.opacity='';moveEl.style.transition='';moveEl.style.zIndex='';
      if(longPressed&&moved){saveFn();e.stopPropagation();}
      longPressed=false;moved=false;
    });
  },

  resetAllPositions:function(){
    Cards._dragOffsets={};Cards.saveDrag();
    Cards._searchDragOffsets={};Cards.saveSearchDrag();
    ['bx-1','bx-2'].forEach(function(id){var el=App.$('#'+id);if(el)el.style.transform='';});['searchWrap1','searchWrap2'].forEach(function(id){var el=App.$('#'+id);if(el)el.style.transform='';});
  },

  uploadSearchAvatar:function(key){
    var previewId=key==='search1'?'avatarPreview1':'avatarPreview2';
    var storeKey='avatar_'+key;
    var input=document.createElement('input');input.type='file';input.accept='image/*';
    document.body.appendChild(input);
    input.onchange=function(e){
      var file=e.target.files[0];document.body.removeChild(input);
      if(!file)return;
      var reader=new FileReader();
      reader.onload=function(ev){
        if(App.cropImage){
          App.cropImage(ev.target.result,function(cropped){
            App.LS.set(storeKey,cropped);
            var preview=App.$('#'+previewId);
            if(preview)preview.innerHTML='<img src="'+App.escAttr(cropped)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
          });
        } else {
          App.LS.set(storeKey,ev.target.result);
          var preview=App.$('#'+previewId);
          if(preview)preview.innerHTML='<img src="'+App.escAttr(ev.target.result)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  /*★ 角色卡编辑面板（可拖拽浮窗） */
  openCardEdit:function(side,cardEl){
    var old=App.$('#pcFloatPanel');if(old)old.remove();
    var d=Cards.data[side];
    var col=Cards.data.colors[side]||{};
    var defSub=side==='left'?DEF_SUB_L:DEF_SUB_R;

    var panel=document.createElement('div');panel.id='pcFloatPanel';panel.className='pc-float-panel';

    panel.innerHTML=
      '<div class="pc-float-header" id="pcFloatHead">'+
        '<span class="pc-float-title">'+(side==='left'?'左':'右')+'卡片</span>'+
        '<button class="pc-float-close" id="pcFloatClose" type="button"><svg viewBox="0 0 24 24"><path d="M186L6 18M6 6l12 12"/></svg></button>'+
      '</div>'+
      '<div class="pc-float-body">'+
        '<div class="pc-float-section-title">基本信息</div>'+
        '<div class="pc-float-row"><span class="pc-float-label">名字</span><input class="pc-float-input" id="pcFName" value="'+App.escAttr(d.name||'')+'" placeholder="角色名"></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">签名</span><input class="pc-float-input" id="pcFSub" value="'+App.escAttr(d.sub||defSub)+'" placeholder="签名"></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">标签1</span><input class="pc-float-input" id="pcFTag1" value="'+App.escAttr(d.tag1||'')+'" placeholder="标签"></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">标签2</span><input class="pc-float-input" id="pcFTag2" value="'+App.escAttr(d.tag2||'')+'" placeholder="标签"></div>'+

        '<div class="pc-float-section-title">头像</div>'+
        '<div class="pc-float-row"><input class="pc-float-input" id="pcFAvatar" value="'+App.escAttr(d.avatar||'')+'" placeholder="图片URL..."></div>'+
        '<div class="pc-float-upload-row">'+
          '<div class="pc-float-upload-btn" id="pcFUpload">从相册选择</div>'+
          '<div class="pc-float-upload-btn" id="pcFDelAvatar" style="color:rgba(201,112,107,.8);">删除</div>'+
        '</div>'+

        '<div class="pc-float-section-title">配色</div>'+
        '<div class="pc-float-row"><span class="pc-float-label">边框色</span><div class="pc-float-swatch" id="pcCBorder" style="background:'+(col.borderC||'#1a1a1a')+'"></div></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">边框粗</span><input type="range" class="pc-float-range" id="pcCBorderW" min="1" max="5" step="0.5" value="'+(col.borderW||2)+'"><span class="pc-float-val" id="pcCBorderWVal">'+(col.borderW||2)+'px</span></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">标签底</span><div class="pc-float-swatch" id="pcCTag" style="background:'+(col.tagC||'#1a1a1a')+'"></div></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">标签字</span><div class="pc-float-swatch" id="pcCTagF" style="background:'+(col.tagFC||'#ffffff')+'"></div></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">名字色</span><div class="pc-float-swatch" id="pcCName" style="background:'+(col.nameC||'#1a1a1a')+'"></div></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">签名色</span><div class="pc-float-swatch" id="pcCSub" style="background:'+(col.subC||'#999999')+'"></div></div>'+

        '<div class="pc-float-btn-row">'+
          '<button class="pc-float-btn pc-float-btn-save" id="pcFSave" type="button">保存</button>'+
          '<button class="pc-float-btn pc-float-btn-reset" id="pcFReset" type="button">重置</button>'+
        '</div>'+
      '</div>';

    document.body.appendChild(panel);

    /*定位在卡片下方 */
    var rect=cardEl.getBoundingClientRect();
    var left=rect.left;var top=rect.bottom+8;
    if(left+260>window.innerWidth)left=window.innerWidth-268;
    if(left<8)left=8;
    if(top+400>window.innerHeight)top=window.innerHeight-410;
    if(top<60)top=60;
    panel.style.left=left+'px';panel.style.top=top+'px';

    /* 拖拽 */
    Cards._bindPanelDrag(panel,'#pcFloatHead');

    /* 颜色选择器 */
    var colorMap={pcCBorder:'borderC',pcCTag:'tagC',pcCTagF:'tagFC',pcCName:'nameC',pcCSub:'subC'};
    Object.keys(colorMap).forEach(function(btnId){
      var btn=panel.querySelector('#'+btnId);if(!btn)return;
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        if(!App.openColorPicker)return;
        var key=colorMap[btnId];
        App.openColorPicker(btn.style.background||'#1a1a1a',function(hex){
          btn.style.background=hex;},function(hex){
          btn.style.background=hex;
          /* 实时预览 */
          var el=App.$('#'+(side==='left'?'bx-2':'bx-1'));
          if(el)el.style.setProperty('--'+key.replace(/([A-Z])/g,function(m){return '-'+m.toLowerCase();}),hex);
        },btnId);
      });
    });

    /* 边框粗细 */
    var bwSlider=panel.querySelector('#pcCBorderW');
    var bwVal=panel.querySelector('#pcCBorderWVal');
    bwSlider.addEventListener('input',function(){
      bwVal.textContent=this.value+'px';var el=App.$('#'+(side==='left'?'bx-2':'bx-1'));
      if(el)el.style.setProperty('--bx-border-w',this.value+'px');
    });

    /* 头像上传 */
    panel.querySelector('#pcFUpload').addEventListener('click',function(){
      var input=document.createElement('input');input.type='file';input.accept='image/*';
      document.body.appendChild(input);
      input.onchange=function(e){
        var file=e.target.files[0];document.body.removeChild(input);if(!file)return;
        var reader=new FileReader();
        reader.onload=function(ev){
          if(App.cropImage){
            App.cropImage(ev.target.result,function(cropped){
              panel.querySelector('#pcFAvatar').value=cropped;
            });
          } else {
            panel.querySelector('#pcFAvatar').value=ev.target.result;
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });

    panel.querySelector('#pcFDelAvatar').addEventListener('click',function(){
      panel.querySelector('#pcFAvatar').value='';
    });

    /* 保存 */
    panel.querySelector('#pcFSave').addEventListener('click',function(){
      Cards.data[side]={
        avatar:panel.querySelector('#pcFAvatar').value.trim(),
        name:panel.querySelector('#pcFName').value.trim(),
        sub:panel.querySelector('#pcFSub').value.trim(),
        tag1:panel.querySelector('#pcFTag1').value.trim(),
        tag2:panel.querySelector('#pcFTag2').value.trim()
      };
      var swatches={borderC:'pcCBorder',tagC:'pcCTag',tagFC:'pcCTagF',nameC:'pcCName',subC:'pcCSub'};
      var newCol={};
      Object.keys(swatches).forEach(function(k){
        var sw=panel.querySelector('#'+swatches[k]);
        if(sw)newCol[k]=sw.style.background||'';
      });
      newCol.borderW=parseFloat(panel.querySelector('#pcCBorderW').value)||2;
      Cards.data.colors[side]=newCol;
      Cards.save();Cards.render();panel.remove();App.showToast('已保存');
    });

    panel.querySelector('#pcFReset').addEventListener('click',function(){
      Cards.data.colors[side]={};Cards.save();Cards.render();panel.remove();App.showToast('已重置');
    });

    panel.querySelector('#pcFloatClose').addEventListener('click',function(){panel.remove();});
  },

  /* ★ 对话框编辑面板 */
  openSearchEdit:function(side,wrapEl){
    var old=App.$('#sbFloatPanel');if(old)old.remove();
    var sc=Cards.data.searchColors&&Cards.data.searchColors[side]?Cards.data.searchColors[side]:{};
    var bind=Cards.data.bind||{};

    /* 角色列表 */
    var chars=App.character?App.character.list:[];
    var charOptions='<option value="">不绑定</option>';
    chars.forEach(function(c){
      var sel=bind.charId===c.id?' selected':'';
      charOptions+='<option value="'+c.id+'"'+sel+'>'+App.esc(c.name||'未命名')+'</option>';
    });

    var panel=document.createElement('div');panel.id='sbFloatPanel';panel.className='pc-float-panel';
    panel.style.width='240px';

    panel.innerHTML=
      '<div class="pc-float-header" id="sbFloatHead">'+
        '<span class="pc-float-title">对话框</span>'+
        '<button class="pc-float-close" id="sbFloatClose" type="button"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>'+
      '</div>'+
      '<div class="pc-float-body">'+
        '<div class="pc-float-section-title">绑定角色</div>'+
        '<div class="pc-float-row"><span class="pc-float-label">角色</span><select class="pc-float-input" id="sbBindChar" style="padding:8px;">'+charOptions+'</select></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">称呼</span><input class="pc-float-input" id="sbBindCall" value="'+App.escAttr(bind.callName||'')+'" placeholder="如：宝宝、亲爱的"></div>'+

        '<div class="pc-float-section-title">配色</div>'+
        '<div class="pc-float-row"><span class="pc-float-label">线条色</span><div class="pc-float-swatch" id="sbCLine" style="background:'+(sc.lineC||'rgba(173,205,234,.4)')+'"></div></div>'+
        '<div class="pc-float-row"><span class="pc-float-label">阴影色</span><div class="pc-float-swatch" id="sbCShadow" style="background:'+(sc.shadowC||'rgba(173,205,234,.15)')+'"></div></div>'+

        '<div class="pc-float-section-title">头像</div>'+
        '<div class="pc-float-upload-row">'+
          '<div class="pc-float-upload-btn" id="sbUpAv1">左头像</div>'+
          '<div class="pc-float-upload-btn" id="sbUpAv2">右头像</div>'+
        '</div>'+
        '<div class="pc-float-upload-row" style="margin-top:4px;">'+
          '<div class="pc-float-upload-btn" id="sbDelAv1" style="color:rgba(201,112,107,.7);">删除左</div>'+
          '<div class="pc-float-upload-btn" id="sbDelAv2" style="color:rgba(201,112,107,.7);">删除右</div>'+
        '</div>'+

        '<div class="pc-float-btn-row">'+
          '<button class="pc-float-btn pc-float-btn-save" id="sbFSave" type="button">保存</button>'+
          '<button class="pc-float-btn pc-float-btn-reset" id="sbFReset" type="button">重置</button>'+
        '</div>'+
      '</div>';

    document.body.appendChild(panel);

    var rect=wrapEl.getBoundingClientRect();
    var left=rect.left;var top=rect.bottom+8;
    if(left+240>window.innerWidth)left=window.innerWidth-248;
    if(left<8)left=8;
    if(top+350>window.innerHeight)top=window.innerHeight-360;
    if(top<60)top=60;
    panel.style.left=left+'px';panel.style.top=top+'px';

    Cards._bindPanelDrag(panel,'#sbFloatHead');

    /* 颜色 */
    [{btn:'sbCLine',key:'lineC'},{btn:'sbCShadow',key:'shadowC'}].forEach(function(item){
      var btn=panel.querySelector('#'+item.btn);if(!btn)return;
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        if(!App.openColorPicker)return;
        App.openColorPicker(btn.style.background||'#adcdea',function(hex){
          btn.style.background=hex;
        },function(hex){
          btn.style.background=hex;},item.btn);
      });
    });

    /* 头像上传 */
    panel.querySelector('#sbUpAv1').addEventListener('click',function(){Cards.uploadSearchAvatar('search1');});
    panel.querySelector('#sbUpAv2').addEventListener('click',function(){Cards.uploadSearchAvatar('search2');});
    panel.querySelector('#sbDelAv1').addEventListener('click',function(){App.LS.remove('avatar_search1');Cards.render();App.showToast('已删除');});
    panel.querySelector('#sbDelAv2').addEventListener('click',function(){App.LS.remove('avatar_search2');Cards.render();App.showToast('已删除');});

    /* 保存 */
    panel.querySelector('#sbFSave').addEventListener('click',function(){
      Cards.data.bind={
        charId:panel.querySelector('#sbBindChar').value,
        callName:panel.querySelector('#sbBindCall').value.trim()
      };
      var newSc={};
      var lineEl=panel.querySelector('#sbCLine');if(lineEl)newSc.lineC=lineEl.style.background;
      var shadowEl=panel.querySelector('#sbCShadow');if(shadowEl)newSc.shadowC=shadowEl.style.background;
      Cards.data.searchColors[side]=newSc;
      Cards.save();Cards.render();panel.remove();App.showToast('已保存');
    });

    panel.querySelector('#sbFReset').addEventListener('click',function(){
      Cards.data.searchColors[side]={};
      Cards.data.bind={charId:'',callName:''};
      App.LS.remove('searchText_left');App.LS.remove('searchText_right');
      Cards.save();Cards.render();panel.remove();App.showToast('已重置');
    });

    panel.querySelector('#sbFloatClose').addEventListener('click',function(){panel.remove();});
  },

  /* 面板拖拽通用 */
  _bindPanelDrag:function(panel,headerSelector){
    var header=panel.querySelector(headerSelector);if(!header)return;
    var _d={active:false,sx:0,sy:0,ox:0,oy:0};
    header.addEventListener('touchstart',function(e){
      if(e.target.closest('button'))return;
      var t=e.touches[0];var rect=panel.getBoundingClientRect();
      _d={active:true,sx:t.clientX,sy:t.clientY,ox:rect.left,oy:rect.top};
      header.style.cursor='grabbing';
    },{passive:true});
    document.addEventListener('touchmove',function(e){
      if(!_d.active)return;e.preventDefault();
      var t=e.touches[0];
      panel.style.left=(_d.ox+t.clientX-_d.sx)+'px';
      panel.style.top=(_d.oy+t.clientY-_d.sy)+'px';
    },{passive:false});
    document.addEventListener('touchend',function(){
      if(_d.active){_d.active=false;header.style.cursor='grab';}
    });
  },

  init:function(){Cards.load();Cards.render();}
};

App.register('cards',Cards);
})();
