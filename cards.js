
(function(){
'use strict';
var App=window.App;if(!App)return;

var EMPTY={name:'',sub:'',avatar:'',tag1:'',tag2:'',colors:null};
var DEF_SUB_L='✥同你奔赴一场风花雪月✥';
var DEF_SUB_R='◈与你共赏一阙火树银花◈';

var DEF_COLORS_L={bg:'#ffffff',border:'#bbd3ef',borderW:3,tagBg:'#9dbfe0',tagC:'#ffffff',tag2Bg:'#bbd3ef',tag2C:'#4a5a75',nameC:'#4a5a75',subC:'#6a8caf'};
var DEF_COLORS_R={bg:'#ffffff',border:'#8ca3c2',borderW:3,tagBg:'#7a9abd',tagC:'#ffffff',tag2Bg:'#b5c6db',tag2C:'#4a5a75',nameC:'#4a5a75',subC:'#5c728a'};

var DRAG_DELAY=650;

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

  getColors:function(side){
    var d=Cards.data[side];
    var def=side==='left'?DEF_COLORS_L:DEF_COLORS_R;
    if(!d||!d.colors)return JSON.parse(JSON.stringify(def));
    var c={};Object.keys(def).forEach(function(k){c[k]=d.colors[k]!==undefined?d.colors[k]:def[k];});
    return c;
  },

  applyColors:function(){
    var lc=Cards.getColors('left');var rc=Cards.getColors('right');
    var pcL=App.$('#profileCard-L');var pcR=App.$('#profileCard-R');
    if(pcL){
      pcL.style.setProperty('--profileCard-L-bg',lc.bg);
      pcL.style.setProperty('--profileCard-L-border-c',lc.border);
      pcL.style.setProperty('--profileCard-L-border-w',lc.borderW+'px');
      pcL.style.setProperty('--profileCard-L-tag-bg',lc.tagBg);
      pcL.style.setProperty('--profileCard-L-tag-c',lc.tagC);
      pcL.style.setProperty('--profileCard-L-tag2-bg',lc.tag2Bg);
      pcL.style.setProperty('--profileCard-L-tag2-c',lc.tag2C);
      pcL.style.setProperty('--profileCard-L-name-c',lc.nameC);
      pcL.style.setProperty('--profileCard-L-sub-c',lc.subC);
    }
    if(pcR){
      pcR.style.setProperty('--profileCard-R-bg',rc.bg);
      pcR.style.setProperty('--profileCard-R-border-c',rc.border);
      pcR.style.setProperty('--profileCard-R-border-w',rc.borderW+'px');
      pcR.style.setProperty('--profileCard-R-tag-bg',rc.tagBg);
      pcR.style.setProperty('--profileCard-R-tag-c',rc.tagC);
      pcR.style.setProperty('--profileCard-R-tag2-bg',rc.tag2Bg);
      pcR.style.setProperty('--profileCard-R-tag2-c',rc.tag2C);
      pcR.style.setProperty('--profileCard-R-name-c',rc.nameC);
      pcR.style.setProperty('--profileCard-R-sub-c',rc.subC);
    }
  },

  render:function(){
    var L=Cards.data.left,R=Cards.data.right;

    var pcL=App.$('#profileCard-L');
    if(pcL){
      var lt1=L.tag1||'标签',lt2=L.tag2||'标签';
      var lt1C=L.tag1?'':' bx-tag-placeholder',lt2C=L.tag2?'':' bx-tag-placeholder';
      var lFront=L.avatar?'<div class="bx-av-front" style="background-image:url(\''+App.esc(L.avatar)+'\')"></div>':'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';
      var lName=L.name||'角色名',lSub=L.sub||DEF_SUB_L;
      var lNameC=L.name?'':' bx-name-placeholder';
      pcL.innerHTML=
        '<div class="bx-tag-wrap"><div class="bx-tag bx-tag1'+lt1C+'">'+App.esc(lt1)+'</div><div class="bx-tag bx-tag2'+lt2C+'">'+App.esc(lt2)+'</div></div>'+
        '<div class="bx-cw"><div class="bx-cd">'+
          '<div class="bx-av-box">'+lFront+'</div>'+
          '<div class="bx-name-bar"><div class="bx-name'+lNameC+'">'+App.esc(lName)+'</div><div class="bx-sub">'+App.esc(lSub)+'</div></div>'+
        '</div></div>';
    }

    var pcR=App.$('#profileCard-R');
    if(pcR){
      var rt1=R.tag1||'标签',rt2=R.tag2||'标签';
      var rt1C=R.tag1?'':' bx-ribbon-placeholder',rt2C=R.tag2?'':' bx-ribbon-placeholder';
      var rFront=R.avatar?'<div class="bx-av-front" style="background-image:url(\''+App.esc(R.avatar)+'\')"></div>':'<div class="bx-av-front"><div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div></div>';
      var rName=R.name||'角色名',rSub=R.sub||DEF_SUB_R;
      var rNameC=R.name?'':' bx-name-placeholder';
      pcR.innerHTML=
        '<div class="bx-cw"><div class="bx-cd">'+
          '<div class="bx-side-ribbon"><div class="bx-ribbon-tab r1'+rt1C+'">'+App.esc(rt1)+'</div><div class="bx-ribbon-tab r2'+rt2C+'">'+App.esc(rt2)+'</div></div>'+
          '<div class="bx-av-box">'+rFront+'</div>'+
          '<div class="bx-name-bar"><div class="bx-name'+rNameC+'">'+App.esc(rName)+'</div><div class="bx-sub">'+App.esc(rSub)+'</div></div>'+
        '</div></div>';
    }

    var icon1=App.LS.get('customIcon_cg');
    var icon2=App.LS.get('customIcon_lt');
    if(icon1){ var img1=App.$('#cardIcon1 img'); if(img1){ img1.src=icon1; img1.style.transform='none'; img1.style.width='100%'; img1.style.height='100%'; img1.style.objectFit='cover'; }}
    if(icon2){ var img2=App.$('#cardIcon2 img'); if(img2){ img2.src=icon2; img2.style.transform='none'; img2.style.width='100%'; img2.style.height='100%'; img2.style.objectFit='cover'; }}

    Cards.bindEdit();
    Cards.applyDragOffsets();
    Cards.bindDrag();
    Cards.bindHeartline();
    Cards.applyColors();
    Cards.bindIconsDragAndUpload();
  },

  /* =========================
     心电图对话框
  ========================= */
   bindHeartline:function(){
    if(this._hlBound) return;
    this._hlBound=true;

    // 恢复头像
    Cards._restoreHlAvatar('hlImgLeft','avatar_hlLeft');
    Cards._restoreHlAvatar('hlImgRight','avatar_hlRight');

    // 恢复气泡文字
    var inputL=document.getElementById('hlInputLeft');
    var inputR=document.getElementById('hlInputRight');
    var savedL=App.LS.get('hlText_left');
    var savedR=App.LS.get('hlText_right');
    if(savedL&&inputL) inputL.value=savedL;
    if(savedR&&inputR) inputR.value=savedR;

    // 恢复虚线框文字
    var textTop=document.getElementById('hlTextTop');
    var textBot=document.getElementById('hlTextBottom');
    var savedTop=App.LS.get('hlText_top');
    var savedBot=App.LS.get('hlText_bottom');
    if(savedTop&&textTop) textTop.value=savedTop;
    if(savedBot&&textBot) textBot.value=savedBot;

    // 气泡输入保存
    if(inputL) inputL.addEventListener('input',function(){App.LS.set('hlText_left',this.value);});
    if(inputR) inputR.addEventListener('input',function(){App.LS.set('hlText_right',this.value);});

    // 虚线框输入保存
    if(textTop) textTop.addEventListener('input',function(){App.LS.set('hlText_top',this.value);});
    if(textBot) textBot.addEventListener('input',function(){App.LS.set('hlText_bottom',this.value);});

    // 头像点击上传
    var avatarL=document.getElementById('hlAvatarLeft');
    var avatarR=document.getElementById('hlAvatarRight');
    if(avatarL) avatarL.addEventListener('click',function(e){
      e.stopPropagation();
      Cards._uploadHlAvatar('hlImgLeft','avatar_hlLeft');
    });
    if(avatarR) avatarR.addEventListener('click',function(e){
      e.stopPropagation();
      Cards._uploadHlAvatar('hlImgRight','avatar_hlRight');
    });

    // 长按删除头像
    var LONG_PRESS=800;
    ['hlAvatarLeft','hlAvatarRight'].forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      var timer=null;
      el.addEventListener('touchstart',function(){
        timer=setTimeout(function(){
          var imgId=id==='hlAvatarLeft'?'hlImgLeft':'hlImgRight';
          var key=id==='hlAvatarLeft'?'avatar_hlLeft':'avatar_hlRight';
          Cards._clearHlAvatar(imgId,key);
          App.showToast('头像已清除');
          if(navigator.vibrate) navigator.vibrate(15);
        },LONG_PRESS);
      },{passive:true});
      el.addEventListener('touchmove',function(){clearTimeout(timer);});
      el.addEventListener('touchend',function(){clearTimeout(timer);});
    });
  },

  _restoreHlAvatar:function(imgId,storageKey){
    var img=document.getElementById(imgId);
    if(!img) return;
    var saved=App.LS.get(storageKey);
    if(saved){
      img.src=saved;
      img.style.display='block';
    }
  },

  _uploadHlAvatar:function(imgId,storageKey){
    var input=document.createElement('input');
    input.type='file';
    input.accept='image/*';
    input.onchange=function(e){
      var file=e.target.files[0];
      if(!file) return;
      var reader=new FileReader();
      reader.onload=function(r){
        var src=r.target.result;
        if(App.cropImage){
          App.cropImage(src,function(cropped){
            Cards._applyHlAvatar(cropped,imgId,storageKey);
          });
        } else {
          Cards._compressAvatar(src,function(compressed){
            Cards._applyHlAvatar(compressed,imgId,storageKey);
          });
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  _applyHlAvatar:function(src,imgId,storageKey){
    var img=document.getElementById(imgId);
    if(!img) return;
    var compress=new Image();
    compress.onload=function(){
      var canvas=document.createElement('canvas');
      var max=200,w=compress.width,h=compress.height;
      if(w>h){if(w>max){h=h*max/w;w=max;}}
      else{if(h>max){w=w*max/h;h=max;}}
      canvas.width=w;canvas.height=h;
      canvas.getContext('2d').drawImage(compress,0,0,w,h);
      var result=canvas.toDataURL('image/jpeg',0.85);
      img.src=result;
      img.style.display='block';
      App.LS.set(storageKey,result);
    };
    compress.src=src;
  },

  _clearHlAvatar:function(imgId,storageKey){
    var img=document.getElementById(imgId);
    if(!img) return;
    img.src='';
    img.style.display='none';
    App.LS.remove(storageKey);
  },

  /* =========================
     卡片编辑
  ========================= */
  bindEdit:function(){
    document.querySelectorAll('#cardRow .bx-w').forEach(function(card){
      var nameBar=card.querySelector('.bx-name-bar');
      if(nameBar)nameBar.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();Cards.openEdit(card.dataset.side,card);});
      var ph=card.querySelector('.bx-av-placeholder');
      if(ph)ph.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();Cards.openEdit(card.dataset.side,card);});
    });
  },

  applyDragOffsets:function(){
    ['profileCard-R','profileCard-L','cardIcon1','cardIcon2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var off=Cards._dragOffsets[id];
      if(off)el.style.transform='translate('+off.x+'px,'+off.y+'px)';
    });
    var topCard=Cards._dragOffsets._topCard;
    if(topCard){
      var topEl=App.$('#'+topCard);
      if(topEl) topEl.style.zIndex='50';
      ['profileCard-R','profileCard-L'].forEach(function(sid){
        if(sid!==topCard){var s=App.$('#'+sid);if(s) s.style.zIndex='1';}
      });
    }
  },

  bindDrag:function(){
    ['profileCard-R','profileCard-L'].forEach(function(id){
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
        clearTimeout(timer);timer=null;el.style.opacity='';el.style.transition='';
        if(longPressed&&moved){
          el.style.zIndex='50';
          ['profileCard-R','profileCard-L'].forEach(function(sid){
            if(sid!==id){var s=App.$('#'+sid);if(s) s.style.zIndex='1';}
          });
          Cards._dragOffsets._topCard=id;
          Cards.saveDrag();e.stopPropagation();
        } else {
          el.style.zIndex='';
        }
        longPressed=false;moved=false;
      });
    });
  },

  resetAllPositions:function(){
    Cards._dragOffsets={};Cards.saveDrag();
    ['profileCard-R','profileCard-L','cardIcon1','cardIcon2'].forEach(function(id){var el=App.$('#'+id);if(el)el.style.transform='';});
  },

  bindIconsDragAndUpload:function(){
    if(this._iconsBound)return;this._iconsBound=true;
    ['cardIcon1','cardIcon2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var startX,startY,startOX,startOY,longPressed=false,timer,moved=false;

      el.addEventListener('touchstart',function(e){
        e.preventDefault();
        var t=e.touches[0];startX=t.clientX;startY=t.clientY;
        longPressed=false;moved=false;
        timer=setTimeout(function(){
          longPressed=true;
          var off=Cards._dragOffsets[id]||{x:0,y:0};
          startOX=off.x;startOY=off.y;
          el.style.transition='none';el.style.opacity='0.85';el.style.zIndex='999';
          if(navigator.vibrate)navigator.vibrate(15);
        },DRAG_DELAY);
      },{passive:false});

      el.addEventListener('touchmove',function(e){
        var t=e.touches[0];
        if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
        if(!longPressed)return;
        moved=true;e.preventDefault();e.stopPropagation();
        var nx=startOX+t.clientX-startX,ny=startOY+t.clientY-startY;

        var otherId=(id==='cardIcon1')?'cardIcon2':'cardIcon1';
        var otherOff=Cards._dragOffsets[otherId]||{x:0,y:0};
        if(Math.abs(ny-otherOff.y)<15){ny=otherOff.y;}

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
  },

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
      '<div class="pc-header" id="ccDragHandle">编辑卡片<div class="pc-close-btn" id="pcCloseBtn">×</div></div>'+
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
        '<div class="pc-group" style="margin-top:auto;"><span class="pc-label">边框粗细</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="pcBorderW" min="0" max="8" step="0.5" value="'+col.borderW+'"><span class="pc-slider-val" id="pcBorderWVal">'+col.borderW+'px</span></div></div>'+
      '</div>'+
      '<div class="pc-footer">'+
        '<button class="pc-btn pc-btn-save" id="pcSaveBtn" type="button">保 存</button>'+
        '<button class="pc-btn pc-btn-cancel" id="pcResetColors" type="button">重 置</button>'+
      '</div>';

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    if(cardEl){
      var rect=cardEl.getBoundingClientRect();
      var left=rect.left+rect.width/2-150;var top=rect.bottom+8;
      if(left<8)left=8;if(left+300>window.innerWidth)left=window.innerWidth-308;
      if(top+400>window.innerHeight)top=Math.max(10,window.innerHeight-410);
      panel.style.left=left+'px';panel.style.top=top+'px';
    }

    Cards._bindPanelDrag(panel);

    panel.querySelectorAll('.pc-dot').forEach(function(dot){
      dot.addEventListener('click',function(e){
        e.stopPropagation();var key=dot.dataset.ck;if(!App.openColorPicker)return;
        App.openColorPicker(col[key],function(hex){col[key]=hex;dot.style.background=hex;Cards.data[side].colors=col;Cards.applyColors();},
        function(hex){col[key]=hex;dot.style.background=hex;Cards.data[side].colors=col;Cards.applyColors();},'pcCard_'+side+'_'+key);
      });
    });

    var bwSlider=panel.querySelector('#pcBorderW');var bwVal=panel.querySelector('#pcBorderWVal');
    if(bwSlider)bwSlider.addEventListener('input',function(){col.borderW=parseFloat(this.value);bwVal.textContent=col.borderW+'px';Cards.data[side].colors=col;Cards.applyColors();});

    panel.querySelector('#pcResetColors').addEventListener('click',function(e){
      e.stopPropagation();var defCol=side==='left'?DEF_COLORS_L:DEF_COLORS_R;
      col=JSON.parse(JSON.stringify(defCol));
      panel.querySelectorAll('.pc-dot').forEach(function(d){d.style.background=col[d.dataset.ck];});
      if(bwSlider){bwSlider.value=col.borderW;bwVal.textContent=col.borderW+'px';}
      Cards.data[side].colors=col;Cards.applyColors();App.showToast('已重置默认配色');
    });

    var tempAvatar=d.avatar||'';

    function previewAvatar(){
      var cardId=side==='left'?'#profileCard-L':'#profileCard-R';
      var avFront=document.querySelector(cardId+' .bx-av-front');
      if(!avFront)return;
      if(tempAvatar){
        avFront.innerHTML='';
        avFront.style.backgroundImage='url(\''+tempAvatar+'\')';
      }else{
        avFront.style.backgroundImage='';
        avFront.innerHTML='<div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div>';
      }
    }

    var uploadBtn=panel.querySelector('#pcUploadBtn');
    if(uploadBtn)uploadBtn.addEventListener('click',function(e){
      e.stopPropagation();
      var input=document.createElement('input');input.type='file';input.accept='image/*';
      input.onchange=function(ev){
        var file=ev.target.files[0];if(!file)return;
        var reader=new FileReader();
        reader.onload=function(r){
          if(App.cropImage){App.cropImage(r.target.result,function(c){tempAvatar=c;previewAvatar();});}
          else{Cards._compressAvatar(r.target.result,function(c){tempAvatar=c;previewAvatar();});}
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });

    var urlBtn=panel.querySelector('#pcUrlBtn');
    if(urlBtn)urlBtn.addEventListener('click',function(e){
      e.stopPropagation();
      var url=prompt('输入头像URL：',tempAvatar);
      if(url!==null){tempAvatar=url.trim();previewAvatar();}
    });

    var delBtn=panel.querySelector('#pcDelAvatar');
    if(delBtn)delBtn.addEventListener('click',function(e){
      e.stopPropagation();tempAvatar='';previewAvatar();
    });

    panel.querySelector('#pcSaveBtn').addEventListener('click',function(e){
      e.stopPropagation();
      Cards.data[side]={
        avatar:tempAvatar,
        name:((panel.querySelector('#pcName')||{}).value||'').trim(),
        sub:((panel.querySelector('#pcSub')||{}).value||'').trim(),
        tag1:((panel.querySelector('#pcTag1')||{}).value||'').trim(),
        tag2:((panel.querySelector('#pcTag2')||{}).value||'').trim(),
        colors:col
      };
      Cards.save();Cards.render();overlay.remove();App.showToast('已保存');
    });

    function closeAndRevert(){Cards.data=snapshot;Cards.save();Cards.render();overlay.remove();}
    panel.querySelector('#pcCloseBtn').addEventListener('click',function(e){e.stopPropagation();closeAndRevert();});
    overlay.addEventListener('click',function(e){if(e.target===overlay&&!document.querySelector('.crop-overlay'))closeAndRevert();});
  },

  _bindPanelDrag:function(panel,handleSelector){
    if(!panel)return;
    var _drag={active:false,sx:0,sy:0,ox:0,oy:0};
    var timer=null;
    var pressed=false;

    panel.addEventListener('touchstart',function(e){
      if(handleSelector&&!e.target.closest(handleSelector))return;
      if(e.target.closest('button')||e.target.closest('input')||e.target.closest('select')||e.target.closest('label')||e.target.closest('.pc-dot')||e.target.closest('.pc-icon-btn')||e.target.closest('.pc-close-btn')||e.target.closest('.pc-slider'))return;
      var t=e.touches[0];
      _drag.sx=t.clientX;_drag.sy=t.clientY;
      pressed=false;
      timer=setTimeout(function(){
        pressed=true;
        var pr=panel.getBoundingClientRect();
        panel.style.transform='none';
        panel.style.left=pr.left+'px';panel.style.top=pr.top+'px';
        _drag.ox=pr.left;_drag.oy=pr.top;_drag.active=true;
      },150);
    },{passive:true});

    var mh=function(e){
      var t=e.touches[0];
      if(timer&&!pressed){
        if(Math.abs(t.clientX-_drag.sx)>8||Math.abs(t.clientY-_drag.sy)>8){clearTimeout(timer);timer=null;}
        return;
      }
      if(!_drag.active)return;
      e.preventDefault();
      panel.style.left=(_drag.ox+t.clientX-_drag.sx)+'px';
      panel.style.top=(_drag.oy+t.clientY-_drag.sy)+'px';
    };

    var eh=function(){clearTimeout(timer);timer=null;_drag.active=false;pressed=false;};
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
