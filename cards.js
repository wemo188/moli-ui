
(function(){
'use strict';
var App=window.App;if(!App)return;

var EMPTY={name:'',sub:'',avatar:'',tag1:'',tag2:'',colors:null};
var DEF_SUB_L='✥ 同你奔赴一场风花雪月 ✥';
var DEF_SUB_R='◈ 与你共赏一阙火树银花 ◈';

var DEF_COLORS_L={border:'#bbd3ef',borderW:3,tagBg:'#9dbfe0',tagC:'#ffffff',tag2Bg:'#bbd3ef',tag2C:'#4a5a75',nameC:'#4a5a75',subC:'#6a8caf'};
var DEF_COLORS_R={border:'#8ca3c2',borderW:3,tagBg:'#7a9abd',tagC:'#ffffff',tag2Bg:'#b5c6db',tag2C:'#4a5a75',nameC:'#4a5a75',subC:'#5c728a'};
var DEF_SB={borderC:'#adcdea',shadowC:'rgba(173,205,234,0.9)',textC:'#adcdea'};

var Cards={
  data:{},_dragOffsets:{},_sbData:null,

  load:function(){
    Cards.data=App.LS.get('profileCards')||{};
    if(!Cards.data.left){Cards.data.left=JSON.parse(JSON.stringify(EMPTY));Cards.data.left.sub=DEF_SUB_L;}
    if(!Cards.data.right){Cards.data.right=JSON.parse(JSON.stringify(EMPTY));Cards.data.right.sub=DEF_SUB_R;}
    Cards._dragOffsets=App.LS.get('cardDragOffsets')||{};
    Cards._sbData=App.LS.get('searchBoxData')||JSON.parse(JSON.stringify(DEF_SB));
  },
  save:function(){App.LS.set('profileCards',Cards.data);},
  saveDrag:function(){App.LS.set('cardDragOffsets',Cards._dragOffsets);},
  saveSB:function(){App.LS.set('searchBoxData',Cards._sbData);},

  getColors:function(side){
    var d=Cards.data[side];
    var def=side==='left'?DEF_COLORS_L:DEF_COLORS_R;
    if(!d||!d.colors)return JSON.parse(JSON.stringify(def));
    var c={};Object.keys(def).forEach(function(k){c[k]=d.colors[k]!==undefined?d.colors[k]:def[k];});
    return c;
  },

  applyColors:function(){
    var lc=Cards.getColors('left');var rc=Cards.getColors('right');
    var bx2=App.$('#bx-2');var bx1=App.$('#bx-1');
    if(bx2){
      bx2.style.setProperty('--bx2-border-c',lc.border);
      bx2.style.setProperty('--bx2-border-w',lc.borderW+'px');
      bx2.style.setProperty('--bx2-tag-bg',lc.tagBg);
      bx2.style.setProperty('--bx2-tag-c',lc.tagC);
      bx2.style.setProperty('--bx2-tag2-bg',lc.tag2Bg);
      bx2.style.setProperty('--bx2-tag2-c',lc.tag2C);
      bx2.style.setProperty('--bx2-name-c',lc.nameC);
      bx2.style.setProperty('--bx2-sub-c',lc.subC);
    }
    if(bx1){
      bx1.style.setProperty('--bx1-border-c',rc.border);
      bx1.style.setProperty('--bx1-border-w',rc.borderW+'px');
      bx1.style.setProperty('--bx1-tag-bg',rc.tagBg);
      bx1.style.setProperty('--bx1-tag-c',rc.tagC);
      bx1.style.setProperty('--bx1-tag2-bg',rc.tag2Bg);
      bx1.style.setProperty('--bx1-tag2-c',rc.tag2C);
      bx1.style.setProperty('--bx1-name-c',rc.nameC);
      bx1.style.setProperty('--bx1-sub-c',rc.subC);
    }
  },

  applySBColors:function(){
    var sb=Cards._sbData;var area=App.$('#searchArea');if(!area)return;
    area.style.setProperty('--sb-border',sb.borderC);
    area.style.setProperty('--sb-shadow',sb.shadowC);
    area.style.setProperty('--sb-text',sb.textC);
  },

  render:function(){
    var container=App.$('#cardRow');if(!container)return;
    var L=Cards.data.left,R=Cards.data.right;

    var lt1=L.tag1||'标签',lt2=L.tag2||'标签';
    var lt1C=L.tag1?'':' bx-tag-placeholder',lt2C=L.tag2?'':' bx-tag-placeholder';
    var lFront=L.avatar?'<div class="bx-av-front" style="background-image:url(\''+App.escAttr(L.avatar)+'\')"></div>':'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';
    var lName=L.name||'角色名',lSub=L.sub||DEF_SUB_L;
    var lNameC=L.name?'':' bx-name-placeholder';

    var rt1=R.tag1||'标签',rt2=R.tag2||'标签';
    var rt1C=R.tag1?'':' bx-ribbon-placeholder',rt2C=R.tag2?'':' bx-ribbon-placeholder';
    var rFront=R.avatar?'<div class="bx-av-front" style="background-image:url(\''+App.escAttr(R.avatar)+'\')"></div>':'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';
    var rName=R.name||'角色名',rSub=R.sub||DEF_SUB_R;
    var rNameC=R.name?'':' bx-name-placeholder';

    container.innerHTML=
      '<div class="left-area-wrapper">'+
        '<div class="bx-w" id="bx-2" data-side="left">'+
          '<div class="bx-tag-wrap"><div class="bx-tag bx-tag1'+lt1C+'">'+App.esc(lt1)+'</div><div class="bx-tag bx-tag2'+lt2C+'">'+App.esc(lt2)+'</div></div>'+
          '<div class="bx-cw"><div class="bx-cd">'+
            '<div class="bx-av-box">'+lFront+'</div>'+
            '<div class="bx-name-bar"><div class="bx-name'+lNameC+'">'+App.esc(lName)+'</div><div class="bx-sub">'+App.esc(lSub)+'</div></div>'+
          '</div></div>'+
        '</div>'+
        '<div class="left-search-area" id="searchArea">'+
          '<div class="search-wrapper" id="searchWrap1"><div class="search-box"><div class="avatar-area-left" data-side="search1"><div class="avatar-preview" id="avatarPreview1"><svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg></div></div><input type="text" class="search-input-left" placeholder="我们相识..."></div></div>'+
          '<div class="search-wrapper" id="searchWrap2"><div class="search-box-right"><input type="text" class="search-input-right" placeholder="已经有...天"><div class="avatar-area-right" data-side="search2"><div class="avatar-preview" id="avatarPreview2"><svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg></div></div></div></div>'+
        '</div>'+
      '</div>'+
      '<div class="card-right-area">'+
        '<div class="card-placeholder-icons"><div class="card-ph-item"><div class="card-ph-icon"></div><div class="card-ph-label">占位符</div></div><div class="card-ph-item"><div class="card-ph-icon"></div><div class="card-ph-label">占位符</div></div></div>'+
        '<div class="bx-w" id="bx-1" data-side="right">'+
          '<div class="bx-cw"><div class="bx-cd">'+
            '<div class="bx-side-ribbon"><div class="bx-ribbon-tab r1'+rt1C+'">'+App.esc(rt1)+'</div><div class="bx-ribbon-tab r2'+rt2C+'">'+App.esc(rt2)+'</div></div>'+
            '<div class="bx-av-box">'+rFront+'</div>'+
            '<div class="bx-name-bar"><div class="bx-name'+rNameC+'">'+App.esc(rName)+'</div><div class="bx-sub">'+App.esc(rSub)+'</div></div>'+
          '</div></div>'+
        '</div>'+
      '</div>';

    Cards.bindEdit();
    Cards.applyDragOffsets();
    Cards.bindCardDrag();
    Cards.bindSearchText();
    Cards.bindSearchAvatarRestore();
    Cards.bindSearchDrag();
    Cards.applyColors();
    Cards.applySBColors();
  },

  bindSearchText:function(){
    var leftInput=document.querySelector('.search-input-left');
    var leftSaved=App.LS.get('searchText_left');
    if(leftSaved&&leftInput)leftInput.value=leftSaved;
    if(leftInput)leftInput.addEventListener('input',function(){App.LS.set('searchText_left',this.value);});
    var rightInput=document.querySelector('.search-input-right');
    var rightSaved=App.LS.get('searchText_right');
    if(rightSaved&&rightInput)rightInput.value=rightSaved;
    if(rightInput)rightInput.addEventListener('input',function(){App.LS.set('searchText_right',this.value);});
  },

  bindSearchAvatarRestore:function(){
    ['search1','search2'].forEach(function(side){
      var key=side==='search1'?'avatar_search1':'avatar_search2';
      var id=side==='search1'?'avatarPreview1':'avatarPreview2';
      var preview=document.getElementById(id);if(!preview)return;
      var saved=App.LS.get(key);
      if(saved){preview.innerHTML='';var img=document.createElement('img');img.src=saved;preview.appendChild(img);}
    });
    /* 头像点击打开对话框编辑 */
    var a1=document.querySelector('.avatar-area-left[data-side="search1"]');
    var a2=document.querySelector('.avatar-area-right[data-side="search2"]');
    if(a1)a1.addEventListener('click',function(e){e.stopPropagation();Cards.openSearchEdit(a1);});
    if(a2)a2.addEventListener('click',function(e){e.stopPropagation();Cards.openSearchEdit(a2);});
  },

  /* ★ 对话框长按拖拽 */
  bindSearchDrag:function(){
    ['searchWrap1','searchWrap2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var startX,startY,startOX,startOY,longPressed=false,timer,moved=false;

      el.addEventListener('touchstart',function(e){
        if(e.target.closest('.avatar-area-left')||e.target.closest('.avatar-area-right'))return;
        var t=e.touches[0];startX=t.clientX;startY=t.clientY;longPressed=false;moved=false;
        timer=setTimeout(function(){
          longPressed=true;
          var off=Cards._dragOffsets[id]||{x:0,y:0};
          startOX=off.x;startOY=off.y;
          el.style.transition='none';el.style.opacity='0.85';el.style.zIndex='999';
          if(navigator.vibrate)navigator.vibrate(15);
        },800);
      },{passive:true});

      el.addEventListener('touchmove',function(e){
        var t=e.touches[0];
        if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
        if(!longPressed)return;
        moved=true;e.preventDefault();e.stopPropagation();
        var nx=startOX+t.clientX-startX,ny=startOY+t.clientY-startY;
        el.style.transform='translate('+nx+'px,'+ny+'px)';
        Cards._dragOffsets[id]={x:nx,y:ny};
      },{passive:false});

      el.addEventListener('touchend',function(e){
        clearTimeout(timer);timer=null;
        el.style.opacity='';el.style.transition='';el.style.zIndex='';
        if(longPressed&&moved){Cards.saveDrag();e.stopPropagation();}
        longPressed=false;moved=false;
      });
    });
    ['searchWrap1','searchWrap2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var off=Cards._dragOffsets[id];
      if(off)el.style.transform='translate('+off.x+'px,'+off.y+'px)';
    });
  },

  /* ★ 对话框编辑弹窗：两条合一起 */
  openSearchEdit:function(anchorEl){
    var old=App.$('#pcEditOverlay');if(old)old.remove();
    var sb=Cards._sbData;

    var overlay=document.createElement('div');overlay.id='pcEditOverlay';overlay.className='pc-edit-overlay';
    var panel=document.createElement('div');panel.className='pc-edit-panel';

    panel.innerHTML=
      '<div class="pc-edit-title">对话框设置</div>'+
      '<div style="max-height:200px;overflow-y:auto;-webkit-overflow-scrolling:touch;" id="sbScrollArea">'+
        '<div class="pc-edit-group"><label class="pc-edit-label">上方头像</label>'+
          '<div class="pc-edit-btns" style="margin-bottom:4px;"><button class="pc-edit-save" id="sbUpload1" type="button" style="font-size:11px;padding:7px;">上传</button><button class="pc-edit-cancel" id="sbUrl1" type="button" style="font-size:11px;padding:7px;">URL</button><button class="pc-edit-cancel" id="sbDel1" type="button" style="font-size:11px;padding:7px;">删除</button></div>'+
        '</div>'+
        '<div class="pc-edit-group"><label class="pc-edit-label">下方头像</label>'+
          '<div class="pc-edit-btns" style="margin-bottom:4px;"><button class="pc-edit-save" id="sbUpload2" type="button" style="font-size:11px;padding:7px;">上传</button><button class="pc-edit-cancel" id="sbUrl2" type="button" style="font-size:11px;padding:7px;">URL</button><button class="pc-edit-cancel" id="sbDel2" type="button" style="font-size:11px;padding:7px;">删除</button></div>'+
        '</div>'+
        '<div class="pc-palette-section" style="margin-top:6px;padding-top:6px;">'+
          '<div class="pc-palette-label">调色板（两条同步）</div>'+
          '<div class="pc-palette-row">'+
            '<div class="pc-palette-item"><div class="pc-palette-dot" id="sbDotBorder" style="background:'+sb.borderC+';"></div><div class="pc-palette-dot-label">线条</div></div>'+
            '<div class="pc-palette-item"><div class="pc-palette-dot" id="sbDotShadow" style="background:'+sb.shadowC+';"></div><div class="pc-palette-dot-label">阴影</div></div>'+
            '<div class="pc-palette-item"><div class="pc-palette-dot" id="sbDotText" style="background:'+sb.textC+';"></div><div class="pc-palette-dot-label">字体</div></div>'+
          '</div>'+
          '<button class="pc-palette-reset" id="sbResetColors" type="button">重置颜色</button>'+
        '</div>'+
      '</div>'+
      '<div class="pc-edit-btns" style="margin-top:8px;border-top:1px solid rgba(0,0,0,.06);padding-top:8px;flex-shrink:0;"><button class="pc-edit-cancel" id="sbCloseBtn" type="button">关闭</button></div>';

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    if(anchorEl){
      var rect=anchorEl.getBoundingClientRect();
      var left=rect.left+rect.width/2-135;var top=rect.bottom+8;
      if(left<8)left=8;if(left+270>window.innerWidth)left=window.innerWidth-278;
      if(top+300>window.innerHeight)top=Math.max(10,rect.top-310);
      panel.style.left=left+'px';panel.style.top=top+'px';
    }

    /* 拖拽 */
    Cards._bindPanelDrag(panel,overlay);

    function uploadAvatar(which){
      var key=which===1?'avatar_search1':'avatar_search2';
      var pid=which===1?'avatarPreview1':'avatarPreview2';
      var input=document.createElement('input');input.type='file';input.accept='image/*';
      input.onchange=function(e){var file=e.target.files[0];if(!file)return;
        var reader=new FileReader();reader.onload=function(r){
          if(App.cropImage){App.cropImage(r.target.result,function(cropped){Cards._setSearchAvatar(cropped,pid,key);});}
          else{Cards._setSearchAvatar(r.target.result,pid,key);}
        };reader.readAsDataURL(file);
      };input.click();
    }

    function urlAvatar(which){
      var key=which===1?'avatar_search1':'avatar_search2';
      var pid=which===1?'avatarPreview1':'avatarPreview2';
      var url=prompt('输入图片URL：');if(!url)return;
      Cards._setSearchAvatar(url,pid,key);
    }

    function delAvatar(which){
      var key=which===1?'avatar_search1':'avatar_search2';
      var pid=which===1?'avatarPreview1':'avatarPreview2';
      App.LS.remove(key);
      var preview=document.getElementById(pid);
      if(preview)preview.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg>';
      App.showToast('已删除');
    }

    panel.querySelector('#sbUpload1').addEventListener('click',function(e){e.stopPropagation();uploadAvatar(1);});
    panel.querySelector('#sbUpload2').addEventListener('click',function(e){e.stopPropagation();uploadAvatar(2);});
    panel.querySelector('#sbUrl1').addEventListener('click',function(e){e.stopPropagation();urlAvatar(1);});
    panel.querySelector('#sbUrl2').addEventListener('click',function(e){e.stopPropagation();urlAvatar(2);});
    panel.querySelector('#sbDel1').addEventListener('click',function(e){e.stopPropagation();delAvatar(1);});
    panel.querySelector('#sbDel2').addEventListener('click',function(e){e.stopPropagation();delAvatar(2);});

    /* 调色 */
    function bindColor(elId,dataKey,callerId){
      panel.querySelector(elId).addEventListener('click',function(e){
        e.stopPropagation();if(!App.openColorPicker)return;
        App.openColorPicker(sb[dataKey],function(hex){sb[dataKey]=hex;panel.querySelector(elId).style.background=hex;Cards._sbData=sb;Cards.saveSB();Cards.applySBColors();},
        function(hex){sb[dataKey]=hex;panel.querySelector(elId).style.background=hex;Cards._sbData=sb;Cards.applySBColors();},callerId);
      });
    }
    bindColor('#sbDotBorder','borderC','sb_border');
    bindColor('#sbDotShadow','shadowC','sb_shadow');
    bindColor('#sbDotText','textC','sb_text');

    panel.querySelector('#sbResetColors').addEventListener('click',function(e){
      e.stopPropagation();
      Cards._sbData=JSON.parse(JSON.stringify(DEF_SB));sb=Cards._sbData;
      panel.querySelector('#sbDotBorder').style.background=sb.borderC;
      panel.querySelector('#sbDotShadow').style.background=sb.shadowC;
      panel.querySelector('#sbDotText').style.background=sb.textC;
      Cards.saveSB();Cards.applySBColors();App.showToast('已重置');
    });

    panel.querySelector('#sbCloseBtn').addEventListener('click',function(){overlay.remove();});
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  },

  _setSearchAvatar:function(src,previewId,storageKey){
    var img=new Image();img.onload=function(){
      var canvas=document.createElement('canvas'),max=200,w=img.width,h=img.height;
      if(w>h){if(w>max){h=h*max/w;w=max;}}else{if(h>max){w=w*max/h;h=max;}}
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
      var compressed=canvas.toDataURL('image/jpeg',0.85);
      var preview=document.getElementById(previewId);
      if(preview){preview.innerHTML='';var newImg=document.createElement('img');newImg.src=compressed;preview.appendChild(newImg);}
      App.LS.set(storageKey,compressed);
    };img.src=src;
  },

  bindEdit:function(){
    document.querySelectorAll('#cardRow .bx-w').forEach(function(card){
      var nameBar=card.querySelector('.bx-name-bar');
      if(nameBar)nameBar.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();Cards.openEdit(card.dataset.side,card);});
      var ph=card.querySelector('.bx-av-placeholder');
      if(ph)ph.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();Cards.openEdit(card.dataset.side,card);});
    });
  },

  applyDragOffsets:function(){
    ['bx-1','bx-2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var off=Cards._dragOffsets[id];
      if(off)el.style.transform='translate('+off.x+'px,'+off.y+'px)';
    });
  },

  bindCardDrag:function(){
    ['bx-1','bx-2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var avBox=el.querySelector('.bx-av-box');if(!avBox)return;
      var startX,startY,startOX,startOY,longPressed=false,timer,moved=false;
      avBox.addEventListener('touchstart',function(e){
        if(e.target.closest('.bx-av-placeholder'))return;
        var t=e.touches[0];startX=t.clientX;startY=t.clientY;longPressed=false;moved=false;
        timer=setTimeout(function(){
          longPressed=true;var off=Cards._dragOffsets[id]||{x:0,y:0};startOX=off.x;startOY=off.y;
          el.style.transition='none';el.style.opacity='0.9';el.style.zIndex='999';
          if(navigator.vibrate)navigator.vibrate(15);
        },800);
      },{passive:true});
      avBox.addEventListener('touchmove',function(e){
        var t=e.touches[0];
        if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
        if(!longPressed)return;moved=true;e.preventDefault();e.stopPropagation();
        var nx=startOX+t.clientX-startX,ny=startOY+t.clientY-startY;
        el.style.transform='translate('+nx+'px,'+ny+'px)';Cards._dragOffsets[id]={x:nx,y:ny};
      },{passive:false});
      avBox.addEventListener('touchend',function(e){
        clearTimeout(timer);timer=null;el.style.opacity='';el.style.transition='';el.style.zIndex='';
        if(longPressed&&moved){Cards.saveDrag();e.stopPropagation();}longPressed=false;moved=false;
      });
    });
  },

  resetAllPositions:function(){
    Cards._dragOffsets={};Cards.saveDrag();
    ['bx-1','bx-2','searchWrap1','searchWrap2'].forEach(function(id){var el=App.$('#'+id);if(el)el.style.transform='';});
  },

  /* ★ 弹窗拖拽通用方法 */
  _bindPanelDrag:function(panel,overlay){
    var _drag={active:false,sx:0,sy:0,ox:0,oy:0};
    panel.addEventListener('touchstart',function(e){
      if(e.target.closest('button')||e.target.closest('input')||e.target.closest('label')||e.target.closest('.pc-palette-dot')||e.target.closest('#sbScrollArea')||e.target.closest('#pcScrollArea'))return;
      var t=e.touches[0];var pr=panel.getBoundingClientRect();
      panel.style.left=pr.left+'px';panel.style.top=pr.top+'px';
      _drag={active:true,sx:t.clientX,sy:t.clientY,ox:pr.left,oy:pr.top};
    },{passive:true});
    var onMove=function(e){if(!_drag.active)return;e.preventDefault();var t=e.touches[0];panel.style.left=(_drag.ox+t.clientX-_drag.sx)+'px';panel.style.top=(_drag.oy+t.clientY-_drag.sy)+'px';};
    var onEnd=function(){_drag.active=false;};
    document.addEventListener('touchmove',onMove,{passive:false});
    document.addEventListener('touchend',onEnd);
    overlay._cleanup=function(){document.removeEventListener('touchmove',onMove);document.removeEventListener('touchend',onEnd);};
  },

  /* ★ 角色卡编辑弹窗：左右合一 */
  openEdit:function(initSide,cardEl){
    var old=App.$('#pcEditOverlay');if(old){if(old._cleanup)old._cleanup();old.remove();}

    var currentSide=initSide||'left';
    var colL=Cards.getColors('left');
    var colR=Cards.getColors('right');

    var overlay=document.createElement('div');overlay.id='pcEditOverlay';overlay.className='pc-edit-overlay';
    var panel=document.createElement('div');panel.className='pc-edit-panel';

    function getCurrent(){return currentSide==='left'?Cards.data.left:Cards.data.right;}
    function getCol(){return currentSide==='left'?colL:colR;}
    function getDefCol(){return currentSide==='left'?DEF_COLORS_L:DEF_COLORS_R;}
    function getDefSub(){return currentSide==='left'?DEF_SUB_L:DEF_SUB_R;}

    function renderPanel(){
      var d=getCurrent();var col=getCol();var defSub=getDefSub();
      var paletteItems=[
        {key:'border',label:'框',value:col.border},{key:'tagBg',label:'签1',value:col.tagBg},
        {key:'tagC',label:'字1',value:col.tagC},{key:'tag2Bg',label:'签2',value:col.tag2Bg},
        {key:'tag2C',label:'字2',value:col.tag2C},{key:'nameC',label:'名',value:col.nameC},
        {key:'subC',label:'签',value:col.subC}
      ];
      var dotsHtml=paletteItems.map(function(p){
        return '<div class="pc-palette-item"><div class="pc-palette-dot" data-ck="'+p.key+'" style="background:'+p.value+';"></div><div class="pc-palette-dot-label">'+p.label+'</div></div>';
      }).join('');

      var leftActive=currentSide==='left'?'background:#1a1a1a;color:#fff;':'background:rgba(126,163,201,.08);color:#7a9ab8;';
      var rightActive=currentSide==='right'?'background:#1a1a1a;color:#fff;':'background:rgba(126,163,201,.08);color:#7a9ab8;';

      panel.innerHTML=
        '<div style="display:flex;gap:6px;margin-bottom:10px;">'+
          '<button id="pcTabLeft" type="button" style="flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;'+leftActive+'">左卡片</button>'+
          '<button id="pcTabRight" type="button" style="flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;'+rightActive+'">右卡片</button>'+
        '</div>'+
        '<div style="max-height:200px;overflow-y:auto;-webkit-overflow-scrolling:touch;" id="pcScrollArea">'+
          '<div class="pc-edit-group"><label class="pc-edit-label">头像</label><div class="pc-edit-upload-row"><input type="text" class="pc-edit-input" id="pcEditAvatar" placeholder="图片URL..." value="'+App.escAttr(d.avatar||'')+'"><label class="pc-edit-file-btn" for="pcEditFile"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></label><input type="file" id="pcEditFile" accept="image/*" hidden><button type="button" id="pcDelAvatar" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:rgba(201,112,107,.08);border:1px solid rgba(201,112,107,.2);border-radius:8px;cursor:pointer;flex-shrink:0;"><svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:#c9706b;stroke-width:2;stroke-linecap:round;"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div></div>'+
          '<div class="pc-edit-group"><label class="pc-edit-label">名字</label><input type="text" class="pc-edit-input" id="pcEditName" value="'+App.escAttr(d.name||'')+'"></div>'+
          '<div class="pc-edit-group"><label class="pc-edit-label">签名</label><input type="text" class="pc-edit-input" id="pcEditSub" value="'+App.escAttr(d.sub||defSub)+'"></div>'+
          '<div class="pc-edit-row2"><div class="pc-edit-group"><label class="pc-edit-label">标签1</label><input type="text" class="pc-edit-input" id="pcEditTag1" value="'+App.escAttr(d.tag1||'')+'"></div><div class="pc-edit-group"><label class="pc-edit-label">标签2</label><input type="text" class="pc-edit-input" id="pcEditTag2" value="'+App.escAttr(d.tag2||'')+'"></div></div>'+
          '<div class="pc-palette-section"><div class="pc-palette-label">调色板</div><div class="pc-palette-row" id="pcPaletteDots">'+dotsHtml+'</div>'+
            '<div class="pc-palette-slider-row"><span class="pc-palette-slider-label">边框</span><input type="range" class="pc-palette-slider" id="pcBorderW" min="1" max="8" step="0.5" value="'+col.borderW+'"><span class="pc-palette-slider-val" id="pcBorderWVal">'+col.borderW+'px</span></div>'+
            '<button class="pc-palette-reset" id="pcPaletteReset" type="button">重置颜色</button>'+
          '</div>'+
        '</div>'+
        '<div class="pc-edit-btns" style="margin-top:8px;border-top:1px solid rgba(0,0,0,.06);padding-top:8px;flex-shrink:0;">'+
          '<button class="pc-edit-save" id="pcEditSaveBtn" type="button">保存</button>'+
          '<button class="pc-edit-cancel" id="pcEditCancelBtn" type="button">关闭</button>'+
        '</div>';

      bindPanelEvents();
    }

    function collectCurrent(){
      return {
        avatar:(panel.querySelector('#pcEditAvatar')||{}).value||'',
        name:(panel.querySelector('#pcEditName')||{}).value||'',
        sub:(panel.querySelector('#pcEditSub')||{}).value||'',
        tag1:(panel.querySelector('#pcEditTag1')||{}).value||'',
        tag2:(panel.querySelector('#pcEditTag2')||{}).value||'',
        colors:JSON.parse(JSON.stringify(getCol()))
      };
    }

    function saveCurrent(){
      var obj=collectCurrent();
      obj.avatar=obj.avatar.trim();obj.name=obj.name.trim();obj.sub=obj.sub.trim();obj.tag1=obj.tag1.trim();obj.tag2=obj.tag2.trim();
      Cards.data[currentSide]=obj;Cards.save();
    }

    function switchTab(newSide){
      saveCurrent();
      currentSide=newSide;
      renderPanel();
    }

    function bindPanelEvents(){
      panel.querySelector('#pcTabLeft').addEventListener('click',function(e){e.stopPropagation();if(currentSide!=='left')switchTab('left');});
      panel.querySelector('#pcTabRight').addEventListener('click',function(e){e.stopPropagation();if(currentSide!=='right')switchTab('right');});

      /* 头像上传裁剪 */
      panel.querySelector('#pcEditFile').addEventListener('change',function(e){
        var file=e.target.files[0];if(!file)return;
        var reader=new FileReader();reader.onload=function(ev){
          if(App.cropImage){App.cropImage(ev.target.result,function(cropped){Cards._compressAvatar(cropped,function(c){panel.querySelector('#pcEditAvatar').value=c;});});}
          else{Cards._compressAvatar(ev.target.result,function(c){panel.querySelector('#pcEditAvatar').value=c;});}
        };reader.readAsDataURL(file);
      });

      /* 删除头像 */
      panel.querySelector('#pcDelAvatar').addEventListener('click',function(e){
        e.stopPropagation();panel.querySelector('#pcEditAvatar').value='';App.showToast('头像已清空，点保存生效');
      });

      /* 调色 */
      var col=getCol();
      panel.querySelectorAll('.pc-palette-dot').forEach(function(dot){
        dot.addEventListener('click',function(e){
          e.stopPropagation();var key=dot.dataset.ck;if(!App.openColorPicker)return;
          App.openColorPicker(col[key],function(hex){col[key]=hex;dot.style.background=hex;Cards.data[currentSide].colors=col;Cards.applyColors();},
          function(hex){col[key]=hex;dot.style.background=hex;Cards.data[currentSide].colors=col;Cards.applyColors();},'pcCard_'+currentSide+'_'+key);
        });
      });

      var bwSlider=panel.querySelector('#pcBorderW');var bwVal=panel.querySelector('#pcBorderWVal');
      if(bwSlider)bwSlider.addEventListener('input',function(){col.borderW=parseFloat(this.value);bwVal.textContent=col.borderW+'px';Cards.data[currentSide].colors=col;Cards.applyColors();});

      panel.querySelector('#pcPaletteReset').addEventListener('click',function(e){
        e.stopPropagation();var def=getDefCol();var fresh=JSON.parse(JSON.stringify(def));
        if(currentSide==='left')colL=fresh;else colR=fresh;
        Cards.data[currentSide].colors=fresh;Cards.applyColors();renderPanel();App.showToast('已重置');
      });

      /* 保存 */
      panel.querySelector('#pcEditSaveBtn').addEventListener('click',function(){
        saveCurrent();Cards.render();
        if(overlay._cleanup)overlay._cleanup();overlay.remove();App.showToast('已保存');
      });

      /* 关闭 */
      panel.querySelector('#pcEditCancelBtn').addEventListener('click',function(){
        if(overlay._cleanup)overlay._cleanup();overlay.remove();
      });
    }

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    /* 定位 */
    if(cardEl){
      var rect=cardEl.getBoundingClientRect();
      var left=rect.left+rect.width/2-135;var top=rect.bottom+8;
      if(left<8)left=8;if(left+270>window.innerWidth)left=window.innerWidth-278;
      if(top+340>window.innerHeight)top=Math.max(10,window.innerHeight-350);
      panel.style.left=left+'px';panel.style.top=top+'px';
    }

    Cards._bindPanelDrag(panel,overlay);
    renderPanel();

    overlay.addEventListener('click',function(e){if(e.target===overlay){if(overlay._cleanup)overlay._cleanup();overlay.remove();}});
  },

  _compressAvatar:function(src,callback){
    var img=new Image();img.onload=function(){
      var canvas=document.createElement('canvas'),max=400,w=img.width,h=img.height;
      if(w>h){if(w>max){h=h*max/w;w=max;}}else{if(h>max){w=w*max/h;h=max;}}
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
      callback(canvas.toDataURL('image/jpeg',0.8));
    };img.src=src;
  },

  init:function(){Cards.load();Cards.render();}
};

App.register('cards',Cards);
})();
