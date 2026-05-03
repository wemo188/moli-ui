(function(){
'use strict';
var App=window.App;if(!App)return;

var EMPTY={name:'',sub:'',avatar:'',tag1:'',tag2:'',colors:null};
var DEF_SUB_L='✥同你奔赴一场风花雪月✥';
var DEF_SUB_R='◈与你共赏一阙火树银花◈';

/* ★ 默认颜色补充了 bg: '#ffffff' */
var DEF_COLORS_L={bg:'#ffffff',border:'#bbd3ef',borderW:3,tagBg:'#9dbfe0',tagC:'#ffffff',tag2Bg:'#bbd3ef',tag2C:'#4a5a75',nameC:'#4a5a75',subC:'#6a8caf'};
var DEF_COLORS_R={bg:'#ffffff',border:'#8ca3c2',borderW:3,tagBg:'#7a9abd',tagC:'#ffffff',tag2Bg:'#b5c6db',tag2C:'#4a5a75',nameC:'#4a5a75',subC:'#5c728a'};
var DEF_SB={border:'#adcdea',shadow:'rgba(173,205,234,0.9)',textC:'#adcdea'};

var DRAG_DELAY=650;

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
      bx2.style.setProperty('--bx2-bg',lc.bg); /* 直接传值，不管纯色还是渐变！ */
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
      bx1.style.setProperty('--bx1-bg',rc.bg); /* 直接传值！ */
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
    /* 对话框也一样，去掉愚蠢的判断，直接传值 */
    area.style.setProperty('--sb-border',sb.border);
    area.style.setProperty('--sb-shadow',sb.shadow);
    area.style.setProperty('--sb-text',sb.textC);
  },

  render:function(){
    var container=App.$('#cardRow');if(!container)return;
    var L=Cards.data.left,R=Cards.data.right;
    var lt1=L.tag1||'标签',lt2=L.tag2||'标签';
    var lt1C=L.tag1?'':' bx-tag-placeholder',lt2C=L.tag2?'':' bx-tag-placeholder';
    var lFront=L.avatar?'<div class="bx-av-front" style="background-image:url(\''+App.esc(L.avatar)+'\')"></div>':'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';
    var lName=L.name||'角色名',lSub=L.sub||DEF_SUB_L;
    var lNameC=L.name?'':' bx-name-placeholder';

    var rt1=R.tag1||'标签',rt2=R.tag2||'标签';
    var rt1C=R.tag1?'':' bx-ribbon-placeholder',rt2C=R.tag2?'':' bx-ribbon-placeholder';
    var rFront=R.avatar?'<div class="bx-av-front" style="background-image:url(\''+App.esc(R.avatar)+'\')"></div>':'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';
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
    Cards.bindDrag();
    Cards.bindSearchUpload();
    Cards.bindSearchDrag();
    Cards.applyColors();
    Cards.applySBColors();
  },

  bindSearchUpload:function(){
    var leftInput=document.querySelector('.search-input-left');
    var leftSaved=App.LS.get('searchText_left');
    if(leftSaved&&leftInput)leftInput.value=leftSaved;
    if(leftInput)leftInput.addEventListener('input',function(){App.LS.set('searchText_left',this.value);});

    var rightInput=document.querySelector('.search-input-right');
    var rightSaved=App.LS.get('searchText_right');
    if(rightSaved&&rightInput)rightInput.value=rightSaved;
    if(rightInput)rightInput.addEventListener('input',function(){App.LS.set('searchText_right',this.value);});

    Cards._restoreSearchAvatar('avatarPreview1','avatar_search1');
    Cards._restoreSearchAvatar('avatarPreview2','avatar_search2');

    var area1=document.querySelector('.avatar-area-left[data-side="search1"]');
    var area2=document.querySelector('.avatar-area-right[data-side="search2"]');
    if(area1)area1.addEventListener('click',function(e){e.stopPropagation();Cards.openSearchEdit(area1);});
    if(area2)area2.addEventListener('click',function(e){e.stopPropagation();Cards.openSearchEdit(area2);});
  },

  _restoreSearchAvatar:function(previewId,storageKey){
    var preview=document.getElementById(previewId);if(!preview)return;
    var saved=App.LS.get(storageKey);
    if(saved){preview.innerHTML='';var img=document.createElement('img');img.src=saved;preview.appendChild(img);}
  },

  _setSearchAvatar:function(src,previewId,storageKey){
    var preview=document.getElementById(previewId);if(!preview)return;
    var img=new Image();
    img.onload=function(){
      var canvas=document.createElement('canvas'),max=200,w=img.width,h=img.height;
      if(w>h){if(w>max){h=h*max/w;w=max;}}else{if(h>max){w=w*max/h;h=max;}}
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
      var compressed=canvas.toDataURL('image/jpeg',0.85);
      preview.innerHTML='';var newImg=document.createElement('img');newImg.src=compressed;preview.appendChild(newImg);
      App.LS.set(storageKey,compressed);
    };
    img.src=src;
  },

  _clearSearchAvatar:function(previewId,storageKey){
    var preview=document.getElementById(previewId);if(!preview)return;
    App.LS.remove(storageKey);
    preview.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg>';
  },

  bindSearchDrag:function(){
    ['searchWrap1','searchWrap2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var startX,startY,startOX,startOY,longPressed=false,timer,moved=false;

      el.addEventListener('touchstart',function(e){
        if(e.target.closest('.avatar-area-left')||e.target.closest('.avatar-area-right'))return;
        var t=e.touches[0];startX=t.clientX;startY=t.clientY;longPressed=false;moved=false;
        timer=setTimeout(function(){
          longPressed=true;
          el.querySelectorAll('input').forEach(function(inp){inp.style.pointerEvents='none';});
          var off=Cards._dragOffsets[id]||{x:0,y:0};
          startOX=off.x;startOY=off.y;
          el.style.transition='none';el.style.opacity='0.85';el.style.zIndex='999';
          if(navigator.vibrate)navigator.vibrate(15);
        },DRAG_DELAY);
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
        el.querySelectorAll('input').forEach(function(inp){inp.style.pointerEvents='';});
        if(longPressed&&moved){Cards.saveDrag();e.stopPropagation();}
        longPressed=false;moved=false;
      });

      var off=Cards._dragOffsets[id];
      if(off)el.style.transform='translate('+off.x+'px,'+off.y+'px)';
    });
  },

    openSearchEdit:function(anchorEl){
    var old=App.$('#pcEditOverlay');if(old)old.remove();
    var sbSnapshot = JSON.parse(JSON.stringify(Cards._sbData));
    var sb = JSON.parse(JSON.stringify(Cards._sbData));
    var tempAv1 = null, av1Changed = false;
    var tempAv2 = null, av2Changed = false;

    var overlay=document.createElement('div');overlay.id='pcEditOverlay';overlay.className='pc-edit-overlay';
    var panel=document.createElement('div');panel.className='pc-edit-panel';
    panel.style.width='280px';panel.style.height='auto';

    panel.innerHTML=
      '<div class="pc-header" id="sbDragHandle">对话框设置<div class="pc-close-btn" id="sbCloseBtnTop">×</div></div>'+
      '<div class="pc-body" style="flex-direction:column;gap:12px;">'+
        '<div class="pc-group"><span class="pc-label">上方头像</span><div class="pc-av-row">'+
          '<button class="pc-btn pc-btn-save" id="sbUpload1" type="button" style="padding:8px;font-size:12px;">上传</button>'+
          '<button class="pc-btn pc-btn-cancel" id="sbUrl1" type="button" style="padding:8px;font-size:12px;">URL</button>'+
          '<div class="pc-icon-btn danger" id="sbDel1" title="删除"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div>'+
        '</div></div>'+
        '<div class="pc-group"><span class="pc-label">下方头像</span><div class="pc-av-row">'+
          '<button class="pc-btn pc-btn-save" id="sbUpload2" type="button" style="padding:8px;font-size:12px;">上传</button>'+
          '<button class="pc-btn pc-btn-cancel" id="sbUrl2" type="button" style="padding:8px;font-size:12px;">URL</button>'+
          '<div class="pc-icon-btn danger" id="sbDel2" title="删除"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div>'+
        '</div></div>'+
        '<div class="pc-group" style="margin-top:4px;">'+
          '<span class="pc-label">统一配色（同步变化）</span>'+
          '<div class="pc-palette-grid">'+
            '<div class="pc-palette-item"><div class="pc-dot" id="sbDotBorder" style="background:'+sb.border+';"></div><span class="pc-dot-lbl">线条</span></div>'+
            '<div class="pc-palette-item"><div class="pc-dot" id="sbDotShadow" style="background:'+sb.shadow+';"></div><span class="pc-dot-lbl">阴影</span></div>'+
            '<div class="pc-palette-item"><div class="pc-dot" id="sbDotText" style="background:'+sb.textC+';"></div><span class="pc-dot-lbl">字体</span></div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="pc-footer">'+
        '<button class="pc-btn pc-btn-save" id="sbSaveBtn" type="button">保 存</button>'+
        '<button class="pc-btn pc-btn-cancel" id="sbResetBtn" type="button">重 置</button>'+
      '</div>';

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    if(anchorEl){
      var rect=anchorEl.getBoundingClientRect();
      var left=rect.left+rect.width/2-140;var top=rect.bottom+8;
      if(left<8)left=8;if(left+280>window.innerWidth)left=window.innerWidth-288;
      if(top+340>window.innerHeight)top=Math.max(10,rect.top-350);
      panel.style.left=left+'px';panel.style.top=top+'px';
    }

    Cards._bindPanelDrag(panel,'#sbDragHandle');

    function closeAndRevert() {
      Cards._sbData = sbSnapshot; Cards.applySBColors(); overlay.remove();
    }
    panel.querySelector('#sbCloseBtnTop').addEventListener('click', function(e){ e.stopPropagation(); closeAndRevert(); });
    overlay.addEventListener('click', function(e){ if(e.target===overlay) closeAndRevert(); });

    function handleAv(which, act) {
      if (act === 'del') {
        if (which === 1) { tempAv1 = ''; av1Changed = true; } else { tempAv2 = ''; av2Changed = true; }
        App.showToast('头像已清除，点保存生效');
      } else if (act === 'url') {
        var url = prompt('输入头像URL：');
        if (url !== null) {
          if (which === 1) { tempAv1 = url.trim(); av1Changed = true; } else { tempAv2 = url.trim(); av2Changed = true; }
          App.showToast('头像已暂存，点保存生效');
        }
      } else if (act === 'upload') {
        var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
        input.onchange = function(e){
          var file = e.target.files[0]; if(!file) return;
          var reader = new FileReader();
          reader.onload = function(r){
            if(App.cropImage){ App.cropImage(r.target.result, function(c){ if(which===1){tempAv1=c;av1Changed=true;}else{tempAv2=c;av2Changed=true;} App.showToast('头像已暂存，点保存生效'); }); }
            else{ Cards._compressAvatar(r.target.result, function(c){ if(which===1){tempAv1=c;av1Changed=true;}else{tempAv2=c;av2Changed=true;} App.showToast('头像已暂存，点保存生效'); }); }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      }
    }

    panel.querySelector('#sbUpload1').addEventListener('click',function(e){e.stopPropagation();handleAv(1,'upload');});
    panel.querySelector('#sbUpload2').addEventListener('click',function(e){e.stopPropagation();handleAv(2,'upload');});
    panel.querySelector('#sbUrl1').addEventListener('click',function(e){e.stopPropagation();handleAv(1,'url');});
    panel.querySelector('#sbUrl2').addEventListener('click',function(e){e.stopPropagation();handleAv(2,'url');});
    panel.querySelector('#sbDel1').addEventListener('click',function(e){e.stopPropagation();handleAv(1,'del');});
    panel.querySelector('#sbDel2').addEventListener('click',function(e){e.stopPropagation();handleAv(2,'del');});

    function bindColorDot(dotId,key,callerId){
      panel.querySelector(dotId).addEventListener('click',function(e){
        e.stopPropagation();if(!App.openColorPicker)return;
        App.openColorPicker(sb[key],function(hex){sb[key]=hex;panel.querySelector(dotId).style.background=hex;Cards._sbData=sb;Cards.applySBColors();},
        function(hex){sb[key]=hex;panel.querySelector(dotId).style.background=hex;Cards._sbData=sb;Cards.applySBColors();},callerId);
      });
    }
    bindColorDot('#sbDotBorder','border','sb_border');
    bindColorDot('#sbDotShadow','shadow','sb_shadow');
    bindColorDot('#sbDotText','textC','sb_text');

    panel.querySelector('#sbResetBtn').addEventListener('click',function(e){
      e.stopPropagation();
      sb.border='#adcdea'; sb.shadow='rgba(173,205,234,0.9)'; sb.textC='#adcdea';
      panel.querySelector('#sbDotBorder').style.background=sb.border;
      panel.querySelector('#sbDotShadow').style.background=sb.shadow;
      panel.querySelector('#sbDotText').style.background=sb.textC;
      Cards._sbData=sb; Cards.applySBColors(); App.showToast('已重置');
    });

    panel.querySelector('#sbSaveBtn').addEventListener('click',function(e){
      e.stopPropagation();
      if (av1Changed) {
        if (tempAv1) Cards._setSearchAvatar(tempAv1, 'avatarPreview1', 'avatar_search1');
        else Cards._clearSearchAvatar('avatarPreview1', 'avatar_search1');
      }
      if (av2Changed) {
        if (tempAv2) Cards._setSearchAvatar(tempAv2, 'avatarPreview2', 'avatar_search2');
        else Cards._clearSearchAvatar('avatarPreview2', 'avatar_search2');
      }
      Cards._sbData = sb; Cards.saveSB(); overlay.remove(); App.showToast('已保存');
    });
  },

    panel.querySelector('#sbCloseBtn').addEventListener('click',function(){overlay.remove();});
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
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

  bindDrag:function(){
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
        },DRAG_DELAY);
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

  /* ★ 竖版全览编辑弹窗 (上下排布，无切换) */
  openEdit:function(side,cardEl){
    var old=App.$('#pcEditOverlay');if(old)old.remove();

    var snapshot=JSON.parse(JSON.stringify(Cards.data));
    var d=Cards.data[side];
    var defSub=side==='left'?DEF_SUB_L:DEF_SUB_R;
    var col=Cards.getColors(side);

    var overlay=document.createElement('div');overlay.id='pcEditOverlay';overlay.className='pc-edit-overlay';
    var panel=document.createElement('div');panel.className='pc-edit-panel';

        var paletteItems=[
      {key:'bg',label:'卡片底色',value:col.bg},
      {key:'border',label:'外框颜色',value:col.border},
      {key:'tagBg',label:'标签1底',value:col.tagBg},
      {key:'tagC',label:'标签1字',value:col.tagC},
      {key:'tag2Bg',label:'标签2底',value:col.tag2Bg},
      {key:'tag2C',label:'标签2字',value:col.tag2C},
      {key:'nameC',label:'名字颜色',value:col.nameC},
      {key:'subC',label:'签名颜色',value:col.subC}
    ];
    var dotsHtml=paletteItems.map(function(p){
      return '<div class="pc-palette-item"><div class="pc-dot" data-ck="'+p.key+'" style="background:'+p.value+';"></div><span class="pc-dot-lbl">'+p.label+'</span></div>';
    }).join('');

    panel.innerHTML=
      '<div class="pc-header">编辑卡片<div class="pc-close-btn" id="pcCloseBtn">×</div></div>'+
      '<div class="pc-body">'+
      '<div class="pc-group"><span class="pc-label">头像</span><div class="pc-av-row">'+
          '<button class="pc-btn pc-btn-save" id="pcUploadBtn" type="button" style="padding:8px;font-size:12px;">上传</button>'+
          '<button class="pc-btn pc-btn-cancel" id="pcUrlBtn" type="button" style="padding:8px;font-size:12px;">URL</button>'+
          '<div class="pc-icon-btn danger" id="pcDelAvatar" title="删除"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div>'+
        '</div></div>'+
        '<div class="pc-group"><span class="pc-label">名字</span><input type="text" class="pc-input" id="pcName" value="'+App.escAttr(d.name||'')+'"></div>'+
        '<div class="pc-group"><span class="pc-label">签名</span><input type="text" class="pc-input" id="pcSub" value="'+App.escAttr(d.sub||defSub)+'"></div>'+
        '<div class="pc-group"><span class="pc-label">标签 1</span><input type="text" class="pc-input" id="pcTag1" value="'+App.escAttr(d.tag1||'')+'"></div>'+
        '<div class="pc-group"><span class="pc-label">标签 2</span><input type="text" class="pc-input" id="pcTag2" value="'+App.escAttr(d.tag2||'')+'"></div>'+
        '<div class="pc-group"><span class="pc-label" style="margin-bottom:-2px;">调色板</span><div class="pc-palette-grid">'+dotsHtml+'</div></div>'+
        '<div class="pc-group" style="margin-top:auto;"><span class="pc-label">边框粗细</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="pcBorderW" min="1" max="8" step="0.5" value="'+col.borderW+'"><span class="pc-slider-val" id="pcBorderWVal">'+col.borderW+'px</span></div></div>'+
      '</div>'+
      '<div class="pc-footer">'+
        '<button class="pc-btn pc-btn-save" id="pcSaveBtn" type="button">保 存</button>'+
        '<button class="pc-btn pc-btn-cancel" id="pcResetColors" type="button">重 置</button>'+
      '</div>';

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    /* 定位居中一点 */
    if(cardEl){
      var rect=cardEl.getBoundingClientRect();
      var left=rect.left+rect.width/2-150;var top=rect.bottom+8;
      if(left<8)left=8;if(left+300>window.innerWidth)left=window.innerWidth-308;
      if(top+400>window.innerHeight)top=Math.max(10,window.innerHeight-410);
      panel.style.left=left+'px';panel.style.top=top+'px';
    }

    /* ★ 拖拽：整个卡片都是把手 */
    Cards._bindPanelDrag(panel);

    /* 颜色点 */
    panel.querySelectorAll('.pc-dot').forEach(function(dot){
      dot.addEventListener('click',function(e){
        e.stopPropagation();var key=dot.dataset.ck;if(!App.openColorPicker)return;
        App.openColorPicker(col[key],function(hex){col[key]=hex;dot.style.background=hex;Cards.data[side].colors=col;Cards.applyColors();},
        function(hex){col[key]=hex;dot.style.background=hex;Cards.data[side].colors=col;Cards.applyColors();},'pcCard_'+side+'_'+key);
      });
    });

    /* 滑块 */
    var bwSlider=panel.querySelector('#pcBorderW');var bwVal=panel.querySelector('#pcBorderWVal');
    if(bwSlider)bwSlider.addEventListener('input',function(){col.borderW=parseFloat(this.value);bwVal.textContent=col.borderW+'px';Cards.data[side].colors=col;Cards.applyColors();});

    /* ★ 重置按钮：恢复默认颜色 */
    panel.querySelector('#pcResetColors').addEventListener('click',function(e){
      e.stopPropagation();var defCol=side==='left'?DEF_COLORS_L:DEF_COLORS_R;
      col=JSON.parse(JSON.stringify(defCol));
      panel.querySelectorAll('.pc-dot').forEach(function(d){d.style.background=col[d.dataset.ck];});
      if(bwSlider){bwSlider.value=col.borderW;bwVal.textContent=col.borderW+'px';}
      Cards.data[side].colors=col;Cards.applyColors();App.showToast('已重置默认配色');
    });

        /* 头像按钮事件 */
    var tempAvatar = d.avatar || '';

    var uploadBtn = panel.querySelector('#pcUploadBtn');
    if(uploadBtn) uploadBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
      input.onchange = function(ev){
        var file = ev.target.files[0]; if(!file) return;
        var reader = new FileReader();
        reader.onload = function(r){
          if(App.cropImage){ App.cropImage(r.target.result, function(c){ tempAvatar = c; App.showToast('头像已暂存，点保存生效'); }); }
          else{ Cards._compressAvatar(r.target.result, function(c){ tempAvatar = c; App.showToast('头像已暂存，点保存生效'); }); }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });

    var urlBtn = panel.querySelector('#pcUrlBtn');
    if(urlBtn) urlBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var url = prompt('输入头像URL：', tempAvatar);
      if(url !== null){ tempAvatar = url.trim(); App.showToast('头像已暂存，点保存生效'); }
    });

    var delBtn = panel.querySelector('#pcDelAvatar');
    if(delBtn) delBtn.addEventListener('click', function(e){
      e.stopPropagation(); tempAvatar = ''; App.showToast('头像已清除，点保存生效');
    });

    /* ★ 保存 */
    panel.querySelector('#pcSaveBtn').addEventListener('click',function(){
      Cards.data[side]={
        avatar: tempAvatar,
        name:((panel.querySelector('#pcName')||{}).value||'').trim(),
        sub:((panel.querySelector('#pcSub')||{}).value||'').trim(),
        tag1:((panel.querySelector('#pcTag1')||{}).value||'').trim(),
        tag2:((panel.querySelector('#pcTag2')||{}).value||'').trim(),
        colors:col
      };
      Cards.save();Cards.render();overlay.remove();App.showToast('已保存');
    });

    /* ★ × 关闭按钮：取消更改 */
    panel.querySelector('#pcCloseBtn').addEventListener('click',function(e){
      e.stopPropagation();
      Cards.data=snapshot;Cards.save();Cards.render();overlay.remove();
    });

    /* 点击外部取消 */
    overlay.addEventListener('click',function(e){
      if(e.target===overlay){Cards.data=snapshot;Cards.save();Cards.render();overlay.remove();}
    });
  },

  /* ★ 面板拖拽：把手为自身 */
  /* ★ 面板拖拽：微延迟防误触 (约0.15秒) */
  _bindPanelDrag:function(panel){
    if(!panel)return;
    var _drag={active:false,sx:0,sy:0,ox:0,oy:0};
    var timer=null;
    var pressed=false;

    panel.addEventListener('touchstart',function(e){
      if(e.target.closest('button')||e.target.closest('input')||e.target.closest('label')||e.target.closest('.pc-dot')||e.target.closest('.pc-icon-btn')||e.target.closest('.pc-close-btn')||e.target.closest('.pc-slider'))return;
      
      var t=e.touches[0];
      _drag.sx=t.clientX;
      _drag.sy=t.clientY;
      pressed=false;
      
      /* 仅仅停顿 150毫秒 (0.15秒) 就判定为拖动 */
      timer=setTimeout(function(){
        pressed=true;
        var pr=panel.getBoundingClientRect();
        panel.style.transform='none';
        panel.style.left=pr.left+'px';
        panel.style.top=pr.top+'px';
        _drag.ox=pr.left;
        _drag.oy=pr.top;
        _drag.active=true;
      }, 150);
    },{passive:true});

    var mh=function(e){
      var t=e.touches[0];
      
      /* 如果在 150毫秒 内手指滑动超过 8px，说明用户是在快速滚动内容，直接取消拖拽判定 */
      if(timer && !pressed){
        if(Math.abs(t.clientX-_drag.sx)>8 || Math.abs(t.clientY-_drag.sy)>8){
          clearTimeout(timer);
          timer=null;
        }
        return;
      }
      
      /* 超过 150毫秒 且激活了拖拽，就跟着手指走 */
      if(!_drag.active)return;
      e.preventDefault();
      panel.style.left=(_drag.ox+t.clientX-_drag.sx)+'px';
      panel.style.top=(_drag.oy+t.clientY-_drag.sy)+'px';
    };

    var eh=function(){
      clearTimeout(timer);
      timer=null;
      _drag.active=false;
      pressed=false;
    };

    document.addEventListener('touchmove',mh,{passive:false});
    document.addEventListener('touchend',eh);
  },

  _compressAvatar:function(src,callback){
    var img=new Image();
    img.onload=function(){
      var canvas=document.createElement('canvas'),max=400,w=img.width,h=img.height;
      if(w>h){if(w>max){h=h*max/w;w=max;}}else{if(h>max){w=w*max/h;h=max;}}
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
      callback(canvas.toDataURL('image/jpeg',0.8));
    };
    img.src=src;
  },

  init:function(){Cards.load();Cards.render();}
};

App.register('cards',Cards);
})();