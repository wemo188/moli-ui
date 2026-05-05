
(function(){
'use strict';
var App=window.App;if(!App)return;

var EMPTY={name:'',sub:'',avatar:'',tag1:'',tag2:'',colors:null};
var DEF_SUB_L='✥同你奔赴一场风花雪月✥';
var DEF_SUB_R='◈与你共赏一阙火树银花◈';

var DEF_COLORS_L={bg:'#ffffff',border:'#bbd3ef',borderW:3,tagBg:'#9dbfe0',tagC:'#ffffff',tag2Bg:'#bbd3ef',tag2C:'#4a5a75',nameC:'#4a5a75',subC:'#6a8caf'};
var DEF_COLORS_R={bg:'#ffffff',border:'#8ca3c2',borderW:3,tagBg:'#7a9abd',tagC:'#ffffff',tag2Bg:'#b5c6db',tag2C:'#4a5a75',nameC:'#4a5a75',subC:'#5c728a'};
var DEF_SB={border:'#adcdea',shadow:'rgba(173,205,234,0.9)',textC:'#adcdea',charId:'',nickname1:'',nickname2:''};

var DRAG_DELAY=650;

var Cards={
  data:{},_dragOffsets:{},_sbData:null,

  load:function(){
    Cards.data=App.LS.get('profileCards')||{};
    if(!Cards.data.left){Cards.data.left=JSON.parse(JSON.stringify(EMPTY));Cards.data.left.sub=DEF_SUB_L;}
    if(!Cards.data.right){Cards.data.right=JSON.parse(JSON.stringify(EMPTY));Cards.data.right.sub=DEF_SUB_R;}
    Cards._dragOffsets=App.LS.get('cardDragOffsets')||{};
    var saved=App.LS.get('searchBoxData')||JSON.parse(JSON.stringify(DEF_SB));
    if(saved.charId===undefined)saved.charId='';
    if(saved.nickname1===undefined)saved.nickname1='';
    if(saved.nickname2===undefined)saved.nickname2='';
    Cards._sbData=saved;
  },
  save:function(){App.LS.set('profileCards',Cards.data);},
  saveDrag:function(){App.LS.set('cardDragOffsets',Cards._dragOffsets);},
  saveSB:function(){App.LS.set('searchBoxData',Cards._sbData);},

  getDaysSinceFirstChat:function(){
    var sb=Cards._sbData;
    if(!sb||!sb.charId)return 0;
    var msgs=App.LS.get('chatMsgs_'+sb.charId);
    if(!msgs||!msgs.length)return 0;
    var firstTs=null;
    for(var i=0;i<msgs.length;i++){
      if(msgs[i].ts){firstTs=msgs[i].ts;break;}
    }
    if(!firstTs)return 0;
    var now=new Date();
    var first=new Date(firstTs);
    var nowDay=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    var firstDay=new Date(first.getFullYear(),first.getMonth(),first.getDate());
    var diff=Math.floor((nowDay-firstDay)/(1000*60*60*24))+1;
    return Math.max(1,diff);
  },

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

  applySBColors:function(){
    var sb=Cards._sbData;
    var area=App.$('.left-search-area');
    if(!area)return;
    area.style.setProperty('--sb-border',sb.border);
    area.style.setProperty('--sb-shadow',sb.shadow);
    area.style.setProperty('--sb-text',sb.textC);
  },

  updateSearchTexts:function(force){
    var sb=Cards._sbData;
    var leftInput=document.querySelector('.search-input-left');
    var rightInput=document.querySelector('.search-input-right');
    
    if(!sb.charId||!sb.nickname1||!sb.nickname2){
      if(force){
        if(leftInput){leftInput.value='';leftInput.placeholder='我们相识...';App.LS.remove('searchText_left');}
        if(rightInput){rightInput.value='';rightInput.placeholder='已经有...天★';App.LS.remove('searchText_right');}
      }
      return;
    }
    
    var days=Cards.getDaysSinceFirstChat();
    var dayStr=days>0?days:'0';
    var leftText=sb.nickname1+'，我们已经';
    var rightText='相识'+dayStr+'天了，'+sb.nickname2;
    
    if(force){
      if(leftInput){leftInput.value=leftText;leftInput.placeholder='';App.LS.set('searchText_left',leftText);}
      if(rightInput){rightInput.value=rightText;rightInput.placeholder='';App.LS.set('searchText_right',rightText);}
    } else {
      var savedLeft=App.LS.get('searchText_left');
      var savedRight=App.LS.get('searchText_right');
      if(!savedLeft&&leftInput){leftInput.value=leftText;App.LS.set('searchText_left',leftText);}
      if(!savedRight&&rightInput){rightInput.value=rightText;App.LS.set('searchText_right',rightText);}
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
    if(icon1){ var img1=App.$('#cardIcon1 img'); if(img1) img1.src=icon1; }
    if(icon2){ var img2=App.$('#cardIcon2 img'); if(img2) img2.src=icon2; }

    Cards.bindEdit();
    Cards.applyDragOffsets();
    Cards.bindDrag();
    Cards.bindSearchUpload();
    Cards.bindSearchDrag();
    Cards.applyColors();
    Cards.applySBColors();
    Cards.bindIconsDragAndUpload();
    Cards.updateSearchTexts();
  },

  bindSearchUpload:function(){
    if(this._searchBound)return; this._searchBound=true;
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
    if(saved){
      preview.innerHTML='<div style="width:100%;height:100%;background-image:url(\''+App.escAttr(saved)+'\');background-size:cover;background-position:center;border-radius:4px;"></div>';
    }
  },

  _setSearchAvatar:function(src,previewId,storageKey){
    var preview=document.getElementById(previewId);if(!preview)return;
    var img=new Image();
    img.onload=function(){
      var canvas=document.createElement('canvas'),max=200,w=img.width,h=img.height;
      if(w>h){if(w>max){h=h*max/w;w=max;}}else{if(h>max){w=w*max/h;h=max;}}
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
      var compressed=canvas.toDataURL('image/jpeg',0.85);
      preview.innerHTML='<div style="width:100%;height:100%;background-image:url(\''+App.escAttr(compressed)+'\');background-size:cover;background-position:center;border-radius:4px;"></div>';
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
    if(this._searchDragBound)return; this._searchDragBound=true;
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
        var nx=startOX+t.clientX-startX, ny=startOY+t.clientY-startY;

        var otherId = (id === 'cardIcon1') ? 'cardIcon2' : 'cardIcon1';
        var otherOff = Cards._dragOffsets[otherId] || {x:0, y:0};
        if (Math.abs(ny - otherOff.y) < 15) {
          ny = otherOff.y;
        }

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
    });
  },

  openSearchEdit:function(anchorEl){
    var old=App.$('#pcEditOverlay');if(old)old.remove();
    var sbSnapshot=JSON.parse(JSON.stringify(Cards._sbData));
    var sb=JSON.parse(JSON.stringify(Cards._sbData));
    var tempAv1=null,av1Changed=false;
    var tempAv2=null,av2Changed=false;

    var chars=App.character&&App.character.list?App.character.list:[];
    var charOptionsHtml='<option value="">不绑定</option>';
    chars.forEach(function(c){
      var sel=sb.charId===c.id?' selected':'';
      charOptionsHtml+='<option value="'+App.escAttr(c.id)+'"'+sel+'>'+App.esc(c.name||'未命名')+'</option>';
    });

    var overlay=document.createElement('div');overlay.id='pcEditOverlay';overlay.className='pc-edit-overlay';
    var panel=document.createElement('div');panel.className='pc-edit-panel';

    panel.innerHTML=
      '<div class="pc-header" id="sbDragHandle">对话框设置<div class="pc-close-btn" id="sbCloseBtnTop">×</div></div>'+
      '<div class="pc-body" style="flex-direction:column;gap:12px;">'+

        '<div class="pc-group"><span class="pc-label">绑定角色</span>'+
          '<select id="sbCharSelect" style="width:100%;padding:7px 10px;font-size:12px;color:#000;background:rgba(255,255,255,0.5);border:1px solid rgba(0,0,0,0.15);border-radius:8px;outline:none;font-family:inherit;-webkit-appearance:none;appearance:none;cursor:pointer;">'+charOptionsHtml+'</select>'+
        '</div>'+

        '<div class="pc-group"><span class="pc-label">上方称呼（对TA的昵称）</span>'+
          '<input type="text" class="pc-input" id="sbNickname1" value="'+App.escAttr(sb.nickname1||'')+'">'+
        '</div>'+

        '<div class="pc-group"><span class="pc-label">下方称呼（TA对你的昵称）</span>'+
          '<input type="text" class="pc-input" id="sbNickname2" value="'+App.escAttr(sb.nickname2||'')+'">'+
        '</div>'+

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
          '<span class="pc-label">线条 / 阴影（同步变化）</span>'+
          '<div class="pc-palette-grid">'+
            '<div class="pc-palette-item"><div class="pc-dot" id="sbDotBorder" style="background:'+sb.border+';"></div><span class="pc-dot-lbl">线条</span></div>'+
            '<div class="pc-palette-item"><div class="pc-dot" id="sbDotShadow" style="background:'+sb.shadow+';"></div><span class="pc-dot-lbl">阴影</span></div>'+
          '</div>'+
        '</div>'+
        '<div class="pc-group">'+
          '<span class="pc-label">字体颜色</span>'+
          '<div class="pc-palette-grid">'+
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

    Cards._bindPanelDrag(panel);

    function closeAndRevert(){Cards._sbData=sbSnapshot;Cards.applySBColors();Cards.updateSearchTexts(true);overlay.remove();}
    panel.querySelector('#sbCloseBtnTop').addEventListener('click',function(e){e.stopPropagation();closeAndRevert();});
    overlay.addEventListener('click',function(e){if(e.target===overlay&&!document.querySelector('.crop-overlay'))closeAndRevert();});

    function handleAv(which,act){
      if(act==='del'){
        if(which===1){tempAv1='';av1Changed=true;}else{tempAv2='';av2Changed=true;}
        App.showToast('头像已清除，点保存生效');
      }else if(act==='url'){
        var url=prompt('输入头像URL：');
        if(url!==null){
          if(which===1){tempAv1=url.trim();av1Changed=true;}else{tempAv2=url.trim();av2Changed=true;}
          App.showToast('头像已暂存，点保存生效');
        }
      }else if(act==='upload'){
        var input=document.createElement('input');input.type='file';input.accept='image/*';
        input.onchange=function(e){
          var file=e.target.files[0];if(!file)return;
          var reader=new FileReader();
          reader.onload=function(r){
            if(App.cropImage){App.cropImage(r.target.result,function(c){if(which===1){tempAv1=c;av1Changed=true;}else{tempAv2=c;av2Changed=true;}App.showToast('头像已暂存，点保存生效');});}
            else{Cards._compressAvatar(r.target.result,function(c){if(which===1){tempAv1=c;av1Changed=true;}else{tempAv2=c;av2Changed=true;}App.showToast('头像已暂存，点保存生效');});}
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

        var lineDots = ['#sbDotBorder','#sbDotShadow'];
    var lineKeys = ['border','shadow'];

    lineDots.forEach(function(dotId){
      panel.querySelector(dotId).addEventListener('click',function(e){
        e.stopPropagation();if(!App.openColorPicker)return;
        var currentColor = sb.border;
        App.openColorPicker(currentColor, function(hex){
          lineKeys.forEach(function(k){ sb[k]=hex; });
          lineDots.forEach(function(d){ panel.querySelector(d).style.background=hex; });
          Cards._sbData=sb; Cards.applySBColors();
        }, function(hex){
          lineKeys.forEach(function(k){ sb[k]=hex; });
          lineDots.forEach(function(d){ panel.querySelector(d).style.background=hex; });
          Cards._sbData=sb; Cards.applySBColors();
        }, 'sb_line');
      });
    });

    panel.querySelector('#sbDotText').addEventListener('click',function(e){
      e.stopPropagation();if(!App.openColorPicker)return;
      App.openColorPicker(sb.textC, function(hex){
        sb.textC=hex;
        panel.querySelector('#sbDotText').style.background=hex;
        Cards._sbData=sb; Cards.applySBColors();
      }, function(hex){
        sb.textC=hex;
        panel.querySelector('#sbDotText').style.background=hex;
        Cards._sbData=sb; Cards.applySBColors();
      }, 'sb_text');
    });

    panel.querySelector('#sbResetBtn').addEventListener('click',function(e){
      e.stopPropagation();
      sb.border='#adcdea';sb.shadow='rgba(173,205,234,0.9)';sb.textC='#adcdea';
      sb.charId='';sb.nickname1='';sb.nickname2='';
      panel.querySelector('#sbDotBorder').style.background=sb.border;
      panel.querySelector('#sbDotShadow').style.background=sb.shadow;
      panel.querySelector('#sbDotText').style.background=sb.textC;
      panel.querySelector('#sbCharSelect').value='';
      panel.querySelector('#sbNickname1').value='';
      panel.querySelector('#sbNickname2').value='';
      Cards._sbData=sb;Cards.applySBColors();Cards.updateSearchTexts(true);App.showToast('已重置');
    });

    panel.querySelector('#sbSaveBtn').addEventListener('click',function(e){
      e.stopPropagation();
      if(av1Changed){
        if(tempAv1)Cards._setSearchAvatar(tempAv1,'avatarPreview1','avatar_search1');
        else Cards._clearSearchAvatar('avatarPreview1','avatar_search1');
      }
      if(av2Changed){
        if(tempAv2)Cards._setSearchAvatar(tempAv2,'avatarPreview2','avatar_search2');
        else Cards._clearSearchAvatar('avatarPreview2','avatar_search2');
      }
      sb.charId=(panel.querySelector('#sbCharSelect')||{}).value||'';
      sb.nickname1=((panel.querySelector('#sbNickname1')||{}).value||'').trim();
      sb.nickname2=((panel.querySelector('#sbNickname2')||{}).value||'').trim();
      Cards._sbData=sb;Cards.saveSB();Cards.updateSearchTexts(true);overlay.remove();App.showToast('已保存');
    });
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
    ['profileCard-R','profileCard-L','searchWrap1','searchWrap2','cardIcon1','cardIcon2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var off=Cards._dragOffsets[id];
      if(off)el.style.transform='translate('+off.x+'px,'+off.y+'px)';
    });
    var topCard=Cards._dragOffsets._topCard;
    if(topCard){
      var topEl=App.$('#'+topCard);
      if(topEl) topEl.style.zIndex='50';
      ['profileCard-R','profileCard-L'].forEach(function(sid){
        if(sid!==topCard){ var s=App.$('#'+sid); if(s) s.style.zIndex='1'; }
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
            if(sid!==id){ var s=App.$('#'+sid); if(s) s.style.zIndex='1'; }
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
    ['profileCard-R','profileCard-L','searchWrap1','searchWrap2','cardIcon1','cardIcon2'].forEach(function(id){var el=App.$('#'+id);if(el)el.style.transform='';});
  },

  bindIconsDragAndUpload:function(){
    if(this._iconsBound)return; this._iconsBound=true;
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

        var otherId = (id === 'cardIcon1') ? 'cardIcon2' : 'cardIcon1';
        var otherOff = Cards._dragOffsets[otherId] || {x:0, y:0};
        if (Math.abs(ny - otherOff.y) < 15) { ny = otherOff.y; }

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
        '<div class="pc-group" style="margin-top:auto;"><span class="pc-label">边框粗细</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="pcBorderW" min="1" max="8" step="0.5" value="'+col.borderW+'"><span class="pc-slider-val" id="pcBorderWVal">'+col.borderW+'px</span></div></div>'+
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

  _bindPanelDrag:function(panel, handleSelector){
    if(!panel)return;
    var _drag={active:false,sx:0,sy:0,ox:0,oy:0};
    var timer=null;
    var pressed=false;

    panel.addEventListener('touchstart',function(e){
      if(handleSelector && !e.target.closest(handleSelector)) return;
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
