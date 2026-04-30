
(function(){
'use strict';
var App=window.App;if(!App)return;

var EMPTY={name:'',sub:'',avatar:'',tag1:'',tag2:''};
var DEF_SUB_L='✥ 同你奔赴一场风花雪月 ✥';
var DEF_SUB_R='◈ 与你共赏一阙火树银花 ◈';

var DEF_COLORS_L={
  theme:'#bbd3ef',border:'#bbd3ef',name:'#4a5a75',sub:'#6a8caf',
  tag1c:'#ffffff',tag2c:'#4a5a75',tag1bg:'#9dbfe0',tag2bg:'#bbd3ef',bw:3
};
var DEF_COLORS_R={
  theme:'#8ca3c2',border:'#8ca3c2',name:'#4a5a75',sub:'#5c728a',
  r1c:'#ffffff',r2c:'#4a5a75',r1bg:'#7a9abd',r2bg:'#dfe6ee',bw:3
};

var Cards={
  data:{},_dragOffsets:{},_colorPopup:null,

  load:function(){
    Cards.data=App.LS.get('profileCards')||{};
    if(!Cards.data.left){Cards.data.left=JSON.parse(JSON.stringify(EMPTY));Cards.data.left.sub=DEF_SUB_L;}
    if(!Cards.data.right){Cards.data.right=JSON.parse(JSON.stringify(EMPTY));Cards.data.right.sub=DEF_SUB_R;}
    if(!Cards.data.leftColors)Cards.data.leftColors=JSON.parse(JSON.stringify(DEF_COLORS_L));
    if(!Cards.data.rightColors)Cards.data.rightColors=JSON.parse(JSON.stringify(DEF_COLORS_R));
    Cards._dragOffsets=App.LS.get('cardDragOffsets')||{};
  },
  save:function(){App.LS.set('profileCards',Cards.data);},
  saveDrag:function(){App.LS.set('cardDragOffsets',Cards._dragOffsets);},

  applyColors:function(){
    var lc=Cards.data.leftColors||DEF_COLORS_L;
    var rc=Cards.data.rightColors||DEF_COLORS_R;
    var el2=App.$('#bx-2');
    if(el2){
      el2.style.setProperty('--bx2-theme',lc.theme);
      el2.style.setProperty('--bx2-border',lc.border);
      el2.style.setProperty('--bx2-name',lc.name);
      el2.style.setProperty('--bx2-sub',lc.sub);
      el2.style.setProperty('--bx2-tag1c',lc.tag1c);
      el2.style.setProperty('--bx2-tag2c',lc.tag2c);
      el2.style.setProperty('--bx2-tag1bg','linear-gradient(90deg,'+lc.tag1bg+','+lc.theme+')');
      el2.style.setProperty('--bx2-tag2bg','linear-gradient(90deg,'+lc.tag2bg+',#ffffff)');
      el2.style.setProperty('--bx2-bw',lc.bw+'px');
    }
    var el1=App.$('#bx-1');
    if(el1){
      el1.style.setProperty('--bx1-theme',rc.theme);
      el1.style.setProperty('--bx1-border',rc.border);
      el1.style.setProperty('--bx1-name',rc.name);
      el1.style.setProperty('--bx1-sub',rc.sub);
      el1.style.setProperty('--bx1-r1c',rc.r1c);
      el1.style.setProperty('--bx1-r2c',rc.r2c);
      el1.style.setProperty('--bx1-r1bg','linear-gradient(180deg,'+rc.r1bg+','+rc.theme+')');
      el1.style.setProperty('--bx1-r2bg','linear-gradient(180deg,'+rc.r2bg+','+rc.theme+')');
      el1.style.setProperty('--bx1-bw',rc.bw+'px');
    }
  },

  render:function(){
    var container=App.$('#cardRow');if(!container)return;
    var L=Cards.data.left,R=Cards.data.right;

    var lt1=L.tag1||'标签',lt2=L.tag2||'标签';
    var lt1C=L.tag1?'':' bx-tag-placeholder',lt2C=L.tag2?'':' bx-tag-placeholder';

    var lFront=L.avatar
      ?'<div class="bx-av-front" style="background-image:url(\''+App.escAttr(L.avatar)+'\')"></div>'
      :'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';

    var lName=L.name||'角色名',lSub=L.sub||DEF_SUB_L;
    var lNameC=L.name?'':' bx-name-placeholder';

    var rt1=R.tag1||'标签',rt2=R.tag2||'标签';
    var rt1C=R.tag1?'':' bx-ribbon-placeholder',rt2C=R.tag2?'':' bx-ribbon-placeholder';

    var rFront=R.avatar
      ?'<div class="bx-av-front" style="background-image:url(\''+App.escAttr(R.avatar)+'\')"></div>'
      :'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';

    var rName=R.name||'角色名',rSub=R.sub||DEF_SUB_R;
    var rNameC=R.name?'':' bx-name-placeholder';

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
          '<div class="search-wrapper"><div class="search-box">'+
            '<div class="avatar-area-left" data-side="search1"><div class="avatar-preview" id="avatarPreview1"><svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg></div></div>'+
            '<input type="text" class="search-input-left" placeholder="我们相识...">'+
          '</div></div>'+
          '<div class="search-wrapper"><div class="search-box-right">'+
            '<input type="text" class="search-input-right" placeholder="已经有...天">'+
            '<div class="avatar-area-right" data-side="search2"><div class="avatar-preview" id="avatarPreview2"><svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg></div></div>'+
          '</div></div>'+
        '</div>'+
      '</div>'+
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

    Cards.applyColors();
    Cards.bindEdit();
    Cards.applyDragOffsets();
    Cards.bindDrag();
    Cards.bindSearchUpload();
  },

  /* ★ 调色板 */
  openColorPopup:function(side,anchorEl){
    Cards.closeColorPopup();
    var isLeft=side==='left';
    var colors=isLeft?Cards.data.leftColors:Cards.data.rightColors;
    var defs=isLeft?DEF_COLORS_L:DEF_COLORS_R;
    if(!colors){colors=JSON.parse(JSON.stringify(defs));if(isLeft)Cards.data.leftColors=colors;else Cards.data.rightColors=colors;}

    var popup=document.createElement('div');
    popup.className='pc-color-popup show';
    popup.id='pcColorPopup';
    Cards._colorPopup=popup;

    var swatches=isLeft?[
      {key:'theme',label:'渐变框'},
      {key:'name',label:'名字'},
      {key:'sub',label:'签名'},
      {key:'tag1c',label:'标签1字'},
      {key:'tag2c',label:'标签2字'},
      {key:'tag1bg',label:'标签1底'},
      {key:'tag2bg',label:'标签2底'}
    ]:[
      {key:'theme',label:'渐变框'},
      {key:'name',label:'名字'},
      {key:'sub',label:'签名'},
      {key:'r1c',label:'标签1字'},
      {key:'r2c',label:'标签2字'},
      {key:'r1bg',label:'标签1底'},
      {key:'r2bg',label:'标签2底'}
    ];

    var swHtml=swatches.map(function(s){
      return '<div class="pc-cc-item"><div class="pc-cc-swatch" data-key="'+s.key+'" style="background:'+App.escAttr(colors[s.key]||'#999')+'"></div><div class="pc-cc-label">'+s.label+'</div></div>';
    }).join('');

    popup.innerHTML=
      '<div class="pc-color-popup-title">'+(isLeft?'左卡片':'右卡片')+' 调色</div>'+
      '<div class="pc-cc-grid">'+swHtml+'</div>'+
      '<div class="pc-cc-range-row"><label>边框</label><input type="range" min="1" max="6" step="0.5" value="'+(colors.bw||3)+'" id="pcBwRange"><span id="pcBwVal">'+(colors.bw||3)+'px</span></div>'+
      '<button class="pc-cc-reset" id="pcCcReset" type="button">重置默认</button>';

    document.body.appendChild(popup);

    /* 定位 */
    var rect=anchorEl.getBoundingClientRect();
    var popW=popup.offsetWidth||200;
    var left=rect.left+rect.width/2-popW/2;
    var top=rect.bottom+8;
    if(left<8)left=8;if(left+popW>window.innerWidth-8)left=window.innerWidth-popW-8;
    if(top+popup.offsetHeight>window.innerHeight-10)top=rect.top-popup.offsetHeight-8;
    if(top<10)top=10;
    popup.style.left=left+'px';popup.style.top=top+'px';

    function apply(){
      if(isLeft)Cards.data.leftColors=colors;else Cards.data.rightColors=colors;
      Cards.applyColors();Cards.save();
    }

    popup.querySelectorAll('.pc-cc-swatch').forEach(function(sw){
      sw.addEventListener('click',function(e){
        e.stopPropagation();
        if(!App.openColorPicker)return;
        var key=sw.dataset.key;
        App.openColorPicker(colors[key]||'#999999',function(hex){
          colors[key]=hex;sw.style.background=hex;apply();
        },function(hex){
          colors[key]=hex;sw.style.background=hex;apply();
        },'pcCard_'+side+'_'+key);
      });
    });

    var bwRange=popup.querySelector('#pcBwRange');
    var bwVal=popup.querySelector('#pcBwVal');
    bwRange.addEventListener('input',function(){
      colors.bw=parseFloat(this.value);bwVal.textContent=this.value+'px';apply();
    });

    popup.querySelector('#pcCcReset').addEventListener('click',function(e){
      e.stopPropagation();
      var fresh=JSON.parse(JSON.stringify(defs));
      Object.keys(fresh).forEach(function(k){colors[k]=fresh[k];});
      apply();Cards.closeColorPopup();Cards.openColorPopup(side,anchorEl);
    });

    /* 拖拽 */
    var _drag={active:false,sx:0,sy:0,ox:0,oy:0};
    popup.addEventListener('touchstart',function(e){
      if(e.target.closest('.pc-cc-swatch')||e.target.closest('input')||e.target.closest('button'))return;
      var t=e.touches[0];var r=popup.getBoundingClientRect();
      _drag={active:true,sx:t.clientX,sy:t.clientY,ox:r.left,oy:r.top};
    },{passive:true});

    document.addEventListener('touchmove',function handler(e){
      if(!_drag.active)return;e.preventDefault();
      var t=e.touches[0];
      popup.style.left=(_drag.ox+t.clientX-_drag.sx)+'px';
      popup.style.top=(_drag.oy+t.clientY-_drag.sy)+'px';
    },{passive:false});

    document.addEventListener('touchend',function handler(){_drag.active=false;});

    popup.addEventListener('click',function(e){e.stopPropagation();});
  },

  closeColorPopup:function(){
    if(Cards._colorPopup){Cards._colorPopup.remove();Cards._colorPopup=null;}
  },

  bindEdit:function(){
    document.querySelectorAll('#cardRow .bx-w').forEach(function(card){
      var nameBar=card.querySelector('.bx-name-bar');
      if(nameBar)nameBar.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        Cards.openEdit(card.dataset.side,nameBar);
      });
      var ph=card.querySelector('.bx-av-placeholder');
      if(ph)ph.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        Cards.openEdit(card.dataset.side,card);
      });
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
          longPressed=true;
          var off=Cards._dragOffsets[id]||{x:0,y:0};
          startOX=off.x;startOY=off.y;
          el.style.transition='none';el.style.opacity='0.9';el.style.zIndex='999';
          if(navigator.vibrate)navigator.vibrate(15);
        },500);
      },{passive:true});

      avBox.addEventListener('touchmove',function(e){
        var t=e.touches[0];
        if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
        if(!longPressed)return;
        moved=true;e.preventDefault();e.stopPropagation();
        var nx=startOX+t.clientX-startX,ny=startOY+t.clientY-startY;
        el.style.transform='translate('+nx+'px,'+ny+'px)';
        Cards._dragOffsets[id]={x:nx,y:ny};
      },{passive:false});

      avBox.addEventListener('touchend',function(e){
        clearTimeout(timer);timer=null;
        el.style.opacity='';el.style.transition='';el.style.zIndex='';
        if(longPressed&&moved){Cards.saveDrag();e.stopPropagation();}
        longPressed=false;moved=false;
      });

      /* ★ 单击头像区域弹出调色板 */
      avBox.addEventListener('click',function(e){
        if(e.target.closest('.bx-av-placeholder'))return;
        e.stopPropagation();
        var side=el.dataset.side;
        if(Cards._colorPopup){Cards.closeColorPopup();}
        else{Cards.openColorPopup(side,el);}
      });
    });

    /* 点击空白关闭调色板 */
    document.addEventListener('click',function(){
      if(App._cpJustClosed||App.$('#cpOverlay'))return;
      Cards.closeColorPopup();
    });
  },

  resetAllPositions:function(){
    Cards._dragOffsets={};Cards.saveDrag();
    ['bx-1','bx-2'].forEach(function(id){var el=App.$('#'+id);if(el)el.style.transform='';});
  },

  openEdit:function(side,anchorEl){
    var d=Cards.data[side];
    var defSub=side==='left'?DEF_SUB_L:DEF_SUB_R;
    var old=App.$('#pcEditOverlay');if(old)old.remove();
    Cards.closeColorPopup();

    var overlay=document.createElement('div');
    overlay.id='pcEditOverlay';
    overlay.className='pc-edit-overlay';

    overlay.innerHTML=
      '<div class="pc-edit-panel" id="pcEditPanel">'+
        '<div class="pc-edit-title" id="pcEditDragHandle">'+(side==='left'?'左卡片':'右卡片')+'</div>'+
        '<div class="pc-edit-group"><label class="pc-edit-label">头像</label>'+
          '<div class="pc-edit-upload-row">'+
            '<input type="text" class="pc-edit-input" id="pcEditAvatar" placeholder="图片URL..." value="'+App.escAttr(d.avatar||'')+'">'+
            '<label class="pc-edit-file-btn" for="pcEditFile"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></label>'+
            '<input type="file" id="pcEditFile" accept="image/*" hidden>'+
          '</div>'+
        '</div>'+
        '<div class="pc-edit-group"><label class="pc-edit-label">名字</label><input type="text" class="pc-edit-input" id="pcEditName" value="'+App.escAttr(d.name||'')+'"></div>'+
        '<div class="pc-edit-group"><label class="pc-edit-label">签名</label><input type="text" class="pc-edit-input" id="pcEditSub" value="'+App.escAttr(d.sub||defSub)+'"></div>'+
        '<div class="pc-edit-row2">'+
          '<div class="pc-edit-group"><label class="pc-edit-label">标签 1</label><input type="text" class="pc-edit-input" id="pcEditTag1" value="'+App.escAttr(d.tag1||'')+'"></div>'+
          '<div class="pc-edit-group"><label class="pc-edit-label">标签 2</label><input type="text" class="pc-edit-input" id="pcEditTag2" value="'+App.escAttr(d.tag2||'')+'"></div>'+
        '</div>'+
        '<div class="pc-edit-btns">'+
          '<button class="pc-edit-save" id="pcEditSaveBtn" type="button">保存</button>'+
          '<button class="pc-edit-cancel" id="pcEditCancelBtn" type="button">取消</button>'+
        '</div>'+
      '</div>';

    document.body.appendChild(overlay);

    /* 定位在锚点下方 */
    var panel=overlay.querySelector('#pcEditPanel');
    var rect=anchorEl.getBoundingClientRect();
    var panelW=260;
    var left=rect.left+rect.width/2-panelW/2;
    var top=rect.bottom+10;
    if(left<8)left=8;if(left+panelW>window.innerWidth-8)left=window.innerWidth-panelW-8;
    if(top+350>window.innerHeight)top=Math.max(10,rect.top-360);
    panel.style.left=left+'px';panel.style.top=top+'px';

    /* ★ 拖拽弹窗 */
    var handle=panel.querySelector('#pcEditDragHandle');
    var _drag={active:false,sx:0,sy:0,ox:0,oy:0};

    handle.addEventListener('touchstart',function(e){
      if(e.target.closest('button')||e.target.closest('input'))return;
      var t=e.touches[0];var r=panel.getBoundingClientRect();
      panel.style.left=r.left+'px';panel.style.top=r.top+'px';
      _drag={active:true,sx:t.clientX,sy:t.clientY,ox:r.left,oy:r.top};
      handle.style.cursor='grabbing';
    },{passive:true});

    var moveHandler=function(e){
      if(!_drag.active)return;e.preventDefault();
      var t=e.touches[0];
      panel.style.left=(_drag.ox+t.clientX-_drag.sx)+'px';
      panel.style.top=(_drag.oy+t.clientY-_drag.sy)+'px';
    };
    var endHandler=function(){_drag.active=false;handle.style.cursor='grab';};

    document.addEventListener('touchmove',moveHandler,{passive:false});
    document.addEventListener('touchend',endHandler);

    /* ★ 头像上传带裁剪 */
    overlay.querySelector('#pcEditFile').addEventListener('change',function(e){
      var file=e.target.files[0];if(!file)return;
      var reader=new FileReader();
      reader.onload=function(ev){
        if(App.cropImage){
          App.cropImage(ev.target.result,function(cropped){
            overlay.querySelector('#pcEditAvatar').value=cropped;
          });
        } else {
          /* 无裁剪，直接压缩 */
          var img=new Image();img.onload=function(){
            var canvas=document.createElement('canvas'),max=512,w=img.width,h=img.height;
            if(w>h){if(w>max){h=h*max/w;w=max;}}else{if(h>max){w=w*max/h;h=max;}}
            canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
            overlay.querySelector('#pcEditAvatar').value=canvas.toDataURL('image/jpeg',0.85);
          };img.src=ev.target.result;
        }
      };
      reader.readAsDataURL(file);
    });

    overlay.querySelector('#pcEditSaveBtn').addEventListener('click',function(){
      Cards.data[side]={
        avatar:overlay.querySelector('#pcEditAvatar').value.trim(),
        name:overlay.querySelector('#pcEditName').value.trim(),
        sub:overlay.querySelector('#pcEditSub').value.trim(),
        tag1:overlay.querySelector('#pcEditTag1').value.trim(),
        tag2:overlay.querySelector('#pcEditTag2').value.trim()
      };
      Cards.save();
      /* 清理事件 */
      document.removeEventListener('touchmove',moveHandler);
      document.removeEventListener('touchend',endHandler);
      overlay.remove();
      Cards.render();
      App.showToast('已保存');
    });

    overlay.querySelector('#pcEditCancelBtn').addEventListener('click',function(){
      document.removeEventListener('touchmove',moveHandler);
      document.removeEventListener('touchend',endHandler);
      overlay.remove();
    });

    overlay.addEventListener('click',function(e){
      if(e.target===overlay){
        document.removeEventListener('touchmove',moveHandler);
        document.removeEventListener('touchend',endHandler);
        overlay.remove();
      }
    });
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

    /* ★ 左头像上传带裁剪 */
    var area1=document.querySelector('.avatar-area-left[data-side="search1"]');
    var preview1=document.getElementById('avatarPreview1');
    if(area1&&preview1){
      area1.addEventListener('click',function(){
        var input=document.createElement('input');input.type='file';input.accept='image/*';
        input.onchange=function(e){
          var file=e.target.files[0];if(!file)return;
          var reader=new FileReader();
          reader.onload=function(ev){
            if(App.cropImage){
              App.cropImage(ev.target.result,function(cropped){
                preview1.innerHTML='';var img=document.createElement('img');img.src=cropped;
                preview1.appendChild(img);App.LS.set('avatar_search1',cropped);
              });
            } else {
              preview1.innerHTML='';var img=document.createElement('img');img.src=ev.target.result;
              preview1.appendChild(img);App.LS.set('avatar_search1',ev.target.result);
            }
          };reader.readAsDataURL(file);
        };input.click();
      });
      var saved1=App.LS.get('avatar_search1');
      if(saved1){preview1.innerHTML='';var img1=document.createElement('img');img1.src=saved1;preview1.appendChild(img1);}
    }

    /* ★ 右头像上传带裁剪 */
    var area2=document.querySelector('.avatar-area-right[data-side="search2"]');
    var preview2=document.getElementById('avatarPreview2');
    if(area2&&preview2){
      area2.addEventListener('click',function(){
        var input=document.createElement('input');input.type='file';input.accept='image/*';
        input.onchange=function(e){
          var file=e.target.files[0];if(!file)return;
          var reader=new FileReader();
          reader.onload=function(ev){
            if(App.cropImage){
              App.cropImage(ev.target.result,function(cropped){
                preview2.innerHTML='';var img=document.createElement('img');img.src=cropped;
                preview2.appendChild(img);App.LS.set('avatar_search2',cropped);
              });
            } else {
              preview2.innerHTML='';var img=document.createElement('img');img.src=ev.target.result;
              preview2.appendChild(img);App.LS.set('avatar_search2',ev.target.result);
            }
          };reader.readAsDataURL(file);
        };input.click();
      });
      var saved2=App.LS.get('avatar_search2');
      if(saved2){preview2.innerHTML='';var img2=document.createElement('img');img2.src=saved2;preview2.appendChild(img2);}
    }
  },

  init:function(){Cards.load();Cards.render();}
};

App.register('cards',Cards);
})();
