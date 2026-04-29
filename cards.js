(function(){
'use strict';
var App=window.App;if(!App)return;

var EMPTY={name:'',sub:'',avatar:'',tag1:'',tag2:''};
var DEF_SUB_L='✥ 同你奔赴一场风花雪月 ✥';
var DEF_SUB_R='◈ 与你共赏一阙火树银花 ◈';

var Cards={
  data:{},_dragOffsets:{},

  load:function(){
    Cards.data=App.LS.get('profileCards')||{};
    if(!Cards.data.left){Cards.data.left=JSON.parse(JSON.stringify(EMPTY));Cards.data.left.sub=DEF_SUB_L;}
    if(!Cards.data.right){Cards.data.right=JSON.parse(JSON.stringify(EMPTY));Cards.data.right.sub=DEF_SUB_R;}
    Cards._dragOffsets=App.LS.get('cardDragOffsets')||{};
  },
  save:function(){App.LS.set('profileCards',Cards.data);},
  saveDrag:function(){App.LS.set('cardDragOffsets',Cards._dragOffsets);},

  render:function(){
    var container=App.$('#cardRow');if(!container)return;
    var L=Cards.data.left,R=Cards.data.right;

    var lt1=L.tag1||'标签',lt2=L.tag2||'标签';
    var lt1C=L.tag1?'':' bx-tag-placeholder',lt2C=L.tag2?'':' bx-tag-placeholder';

    var lFront=L.avatar
      ?'<div class="bx-av-front" style="background-image:url(\''+App.esc(L.avatar)+'\')"></div>'
      :'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';

    var lName=L.name||'角色名',lSub=L.sub||DEF_SUB_L;
    var lNameC=L.name?'':' bx-name-placeholder';

    var rt1=R.tag1||'标签',rt2=R.tag2||'标签';
    var rt1C=R.tag1?'':' bx-ribbon-placeholder',rt2C=R.tag2?'':' bx-ribbon-placeholder';

    var rFront=R.avatar
      ?'<div class="bx-av-front" style="background-image:url(\''+App.esc(R.avatar)+'\')"></div>'
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
          '<div class="search-wrapper">'+
            '<div class="search-box">'+
              '<div class="avatar-area-left" data-side="search1">'+
                '<div class="avatar-preview" id="avatarPreview1">'+
                  '<svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+
                    '<circle cx="12" cy="8" r="4"></circle>'+
                    '<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path>'+
                  '</svg>'+
                '</div>'+
              '</div>'+
              '<input type="text" class="search-input-left" placeholder="我们相识...">'+
            '</div>'+
          '</div>'+
          '<div class="search-wrapper">'+
            '<div class="search-box-right">'+
              '<input type="text" class="search-input-right" placeholder="已经有...天">'+
              '<div class="avatar-area-right" data-side="search2">'+
                '<div class="avatar-preview" id="avatarPreview2">'+
                  '<svg viewBox="0 0 24 24" fill="none" stroke="#adcdea" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+
                    '<circle cx="12" cy="8" r="4"></circle>'+
                    '<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path>'+
                  '</svg>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
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

    Cards.bindEdit();
    Cards.applyDragOffsets();
    Cards.bindDrag();
    Cards.bindSearchUpload();
  },

  bindSearchUpload:function(){
    // 左边对话框文字
    var leftInput = document.querySelector('.search-input-left');
    var leftSaved = localStorage.getItem('searchText_left');
    if(leftSaved && leftInput) leftInput.value = leftSaved;
    if(leftInput){
        leftInput.addEventListener('input', function(){
            localStorage.setItem('searchText_left', this.value);
        });
    }

    // 右边对话框文字
    var rightInput = document.querySelector('.search-input-right');
    var rightSaved = localStorage.getItem('searchText_right');
    if(rightSaved && rightInput) rightInput.value = rightSaved;
    if(rightInput){
        rightInput.addEventListener('input', function(){
            localStorage.setItem('searchText_right', this.value);
        });
    }

    // 左边头像上传
    var area1 = document.querySelector('.avatar-area-left[data-side="search1"]');
    var preview1 = document.getElementById('avatarPreview1');
    if(area1 && preview1){
        area1.addEventListener('click',function(){
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e){
                var file = e.target.files[0];
                if(file){
                    var reader = new FileReader();
                    reader.onload = function(ev){
                        preview1.innerHTML = '';
                        var img = document.createElement('img');
                        img.src = ev.target.result;
                        preview1.appendChild(img);
                        localStorage.setItem('avatar_search1', ev.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
        var saved1 = localStorage.getItem('avatar_search1');
        if(saved1){
            preview1.innerHTML = '';
            var img1 = document.createElement('img');
            img1.src = saved1;
            preview1.appendChild(img1);
        }
    }

    // 右边头像上传
    var area2 = document.querySelector('.avatar-area-right[data-side="search2"]');
    var preview2 = document.getElementById('avatarPreview2');
    if(area2 && preview2){
        area2.addEventListener('click',function(){
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e){
                var file = e.target.files[0];
                if(file){
                    var reader = new FileReader();
                    reader.onload = function(ev){
                        preview2.innerHTML = '';
                        var img = document.createElement('img');
                        img.src = ev.target.result;
                        preview2.appendChild(img);
                        localStorage.setItem('avatar_search2', ev.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
        var saved2 = localStorage.getItem('avatar_search2');
        if(saved2){
            preview2.innerHTML = '';
            var img2 = document.createElement('img');
            img2.src = saved2;
            preview2.appendChild(img2);
        }
    }
},

  bindEdit:function(){
    document.querySelectorAll('#cardRow .bx-w').forEach(function(card){
      var nameBar=card.querySelector('.bx-name-bar');
      if(nameBar)nameBar.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();Cards.openEdit(card.dataset.side);});
      var ph=card.querySelector('.bx-av-placeholder');
      if(ph)ph.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();Cards.openEdit(card.dataset.side);});
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
    });
  },

  resetAllPositions:function(){
    Cards._dragOffsets={};Cards.saveDrag();
    ['bx-1','bx-2'].forEach(function(id){var el=App.$('#'+id);if(el)el.style.transform='';});
  },

  openEdit:function(side){
    var d=Cards.data[side];
    var defSub=side==='left'?DEF_SUB_L:DEF_SUB_R;
    var old=App.$('#pcEditOverlay');if(old)old.remove();
    var overlay=document.createElement('div');overlay.id='pcEditOverlay';overlay.className='pc-edit-overlay';
    overlay.innerHTML=
      '<div class="pc-edit-panel">'+
        '<div class="pc-edit-title">编辑'+(side==='left'?'左':'右')+'卡片</div>'+
        '<div class="pc-edit-group"><label class="pc-edit-label">头像（URL 或上传）</label><div class="pc-edit-upload-row"><input type="text" class="pc-edit-input" id="pcEditAvatar" placeholder="图片URL..." value="'+App.esc(d.avatar||'')+'"><label class="pc-edit-file-btn" for="pcEditFile"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></label><input type="file" id="pcEditFile" accept="image/*" hidden></div></div>'+
        '<div class="pc-edit-group"><label class="pc-edit-label">名字</label><input type="text" class="pc-edit-input" id="pcEditName" value="'+App.esc(d.name||'')+'"></div>'+
        '<div class="pc-edit-group"><label class="pc-edit-label">签名</label><input type="text" class="pc-edit-input" id="pcEditSub" value="'+App.esc(d.sub||defSub)+'"></div>'+
        '<div class="pc-edit-row2"><div class="pc-edit-group"><label class="pc-edit-label">标签 1</label><input type="text" class="pc-edit-input" id="pcEditTag1" value="'+App.esc(d.tag1||'')+'"></div><div class="pc-edit-group"><label class="pc-edit-label">标签 2</label><input type="text" class="pc-edit-input" id="pcEditTag2" value="'+App.esc(d.tag2||'')+'"></div></div>'+
        '<div class="pc-edit-btns"><button class="pc-edit-save" id="pcEditSaveBtn" type="button">保存</button><button class="pc-edit-cancel" id="pcEditCancelBtn" type="button">取消</button></div>'+
      '</div>';
    document.body.appendChild(overlay);

    App.$('#pcEditFile').addEventListener('change',function(e){
      var file=e.target.files[0];if(!file)return;
      var reader=new FileReader();reader.onload=function(ev){
        var img=new Image();img.onload=function(){
          var canvas=document.createElement('canvas'),max=400,w=img.width,h=img.height;
          if(w>h){if(w>max){h=h*max/w;w=max;}}else{if(h>max){w=w*max/h;h=max;}}
          canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
          App.$('#pcEditAvatar').value=canvas.toDataURL('image/jpeg',0.7);
        };img.src=ev.target.result;
      };reader.readAsDataURL(file);
    });

    App.$('#pcEditSaveBtn').addEventListener('click',function(){
      Cards.data[side]={
        avatar:App.$('#pcEditAvatar').value.trim(),
        name:App.$('#pcEditName').value.trim(),
        sub:App.$('#pcEditSub').value.trim(),
        tag1:App.$('#pcEditTag1').value.trim(),
        tag2:App.$('#pcEditTag2').value.trim()
      };
      Cards.save();Cards.render();overlay.remove();App.showToast('已保存');
    });

    App.$('#pcEditCancelBtn').addEventListener('click',function(){overlay.remove();});
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  },

  init:function(){Cards.load();Cards.render();}
};

App.register('cards',Cards);
})();