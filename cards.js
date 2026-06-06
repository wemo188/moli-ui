
(function(){
'use strict';
var App=window.App;if(!App)return;

var EMPTY={name:'',sub:'',avatar:'',tag1:'',tag2:'',colors:null};
var DEF_SUB_L='✥同你奔赴一场风花雪月';
var DEF_SUB_R='◈与你共赏一阙火树银花';

var DEF_COLORS_L={bg:'rgba(255,255,255,0.45)',border:'rgba(255,255,255,0.3)',borderW:0,tagBg:'rgba(255,255,255,0.4)',tagC:'#4a5a75',tag2Bg:'rgba(255,255,255,0.35)',tag2C:'#4a5a75',subC:'#6a8caf',bgOpacity:1,bgBlur:8,fontFamily:''};
var DEF_COLORS_R={bg:'rgba(255,255,255,0.45)',border:'rgba(255,255,255,0.3)',borderW:0,tagBg:'rgba(255,255,255,0.4)',tagC:'#4a5a75',tag2Bg:'rgba(255,255,255,0.35)',tag2C:'#4a5a75',subC:'#5c728a',bgOpacity:1,bgBlur:8,fontFamily:''};

var DEF_PIXEL={heartColor:'#ffffff',iconColor:'#ffffff',barColor:'#000000',bodyBg:'#ffffff',fontColor:'#2a2a2a',fontFamily:''};
var DEF_HL={borderWidth:1,fontFamily:'',fontColor:'#2a2a2a',barColor:'rgba(255,255,255,0.45)',barOpacity:0.45,barBlur:12,borderColor:'#2a2a2a'};

var DRAG_DELAY=650;

function Bg_applyAlpha(colorStr, opacity) {
  if(opacity == null || opacity >= 1) return colorStr;
  colorStr = (colorStr || '').trim();
  var rm = colorStr.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i);
  if(rm) {
    var a = rm[4] != null ? parseFloat(rm[4]) : 1;
    return 'rgba('+rm[1]+','+rm[2]+','+rm[3]+','+(a * opacity).toFixed(3)+')';
  }
  var hex = colorStr.replace('#','');
  if(hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if(hex.length >= 6) {
    var r = parseInt(hex.substr(0,2),16);
    var g = parseInt(hex.substr(2,2),16);
    var b = parseInt(hex.substr(4,2),16);
    return 'rgba('+r+','+g+','+b+','+opacity.toFixed(3)+')';
  }
  return colorStr;
}

var Cards={
  data:{},_dragOffsets:{},pixelConfig:{},hlConfig:{},

  load:function(){
    Cards.data=App.LS.get('profileCards')||{};
    if(!Cards.data.left){Cards.data.left=JSON.parse(JSON.stringify(EMPTY));Cards.data.left.sub=DEF_SUB_L;}
    if(!Cards.data.right){Cards.data.right=JSON.parse(JSON.stringify(EMPTY));Cards.data.right.sub=DEF_SUB_R;}
    Cards._dragOffsets=App.LS.get('cardDragOffsets')||{};
    Cards.pixelConfig=App.LS.get('pixelConfig')||JSON.parse(JSON.stringify(DEF_PIXEL));
    Cards.hlConfig={
      left:App.LS.get('hlConfig_left')||JSON.parse(JSON.stringify(DEF_HL)),
      right:App.LS.get('hlConfig_right')||JSON.parse(JSON.stringify(DEF_HL))
    };
  },
  save:function(){App.LS.set('profileCards',Cards.data);},
  savePixel:function(){App.LS.set('pixelConfig',Cards.pixelConfig);},
  saveHl:function(side){App.LS.set('hlConfig_'+side,Cards.hlConfig[side]);},
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
      var lBgFinal=Bg_applyAlpha(lc.bg, lc.bgOpacity!=null?lc.bgOpacity:1);
      pcL.style.setProperty('--profileCard-L-bg',lBgFinal);
      pcL.style.setProperty('--profileCard-L-border-c',lc.border);
      pcL.style.setProperty('--profileCard-L-border-w',lc.borderW+'px');
      pcL.style.setProperty('--profileCard-L-tag-bg',lc.tagBg);
      pcL.style.setProperty('--profileCard-L-tag-c',lc.tagC);
      pcL.style.setProperty('--profileCard-L-tag2-bg',lc.tag2Bg);
      pcL.style.setProperty('--profileCard-L-tag2-c',lc.tag2C);
      pcL.style.setProperty('--profileCard-L-sub-c',lc.subC);
      pcL.style.setProperty('--profileCard-L-bg-opacity','1');
      pcL.style.setProperty('--profileCard-L-bg-blur',(lc.bgBlur||0)+'px');
      if(lc.fontFamily){pcL.style.fontFamily=lc.fontFamily;}else{pcL.style.fontFamily='';}
    }
    if(pcR){
      var rBgFinal=Bg_applyAlpha(rc.bg, rc.bgOpacity!=null?rc.bgOpacity:1);
      pcR.style.setProperty('--profileCard-R-bg',rBgFinal);
      pcR.style.setProperty('--profileCard-R-border-c',rc.border);
      pcR.style.setProperty('--profileCard-R-border-w',rc.borderW+'px');
      pcR.style.setProperty('--profileCard-R-tag-bg',rc.tagBg);
      pcR.style.setProperty('--profileCard-R-tag-c',rc.tagC);
      pcR.style.setProperty('--profileCard-R-tag2-bg',rc.tag2Bg);
      pcR.style.setProperty('--profileCard-R-tag2-c',rc.tag2C);
      pcR.style.setProperty('--profileCard-R-sub-c',rc.subC);
      pcR.style.setProperty('--profileCard-R-bg-opacity','1');
      pcR.style.setProperty('--profileCard-R-bg-blur',(rc.bgBlur||0)+'px');
      if(rc.fontFamily){pcR.style.fontFamily=rc.fontFamily;}else{pcR.style.fontFamily='';}
    }
  },

  applyPixelColors:function(){
    var pc=Cards.pixelConfig;
    var el=App.$('#hlTextCard');if(!el)return;
    el.style.setProperty('--pixel-heart-c',pc.heartColor||'#ffffff');
    el.style.setProperty('--pixel-icon-c',pc.iconColor||'#ffffff');
    el.style.setProperty('--pixel-bar-c',pc.barColor||'#000000');
    el.style.setProperty('--pixel-body-bg',pc.bodyBg||'#ffffff');
    el.style.setProperty('--pixel-font-c',pc.fontColor||'#2a2a2a');
    if(pc.fontFamily){el.style.fontFamily=pc.fontFamily;}else{el.style.fontFamily='';}
  },

  _parseColorToRGB:function(str){
    str=(str||'').trim();
    var rm=str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if(rm)return{r:parseInt(rm[1]),g:parseInt(rm[2]),b:parseInt(rm[3])};
    var hex=str.replace('#','');
    if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    if(hex.length>=6)return{r:parseInt(hex.substr(0,2),16),g:parseInt(hex.substr(2,2),16),b:parseInt(hex.substr(4,2),16)};
    return{r:255,g:255,b:255};
  },

  applyHlColors:function(side){
    var cfg=Cards.hlConfig[side];if(!cfg)return;
    var wrId=side==='left'?'hlAvatarWrapLeft':'hlAvatarWrapRight';
    var wr=App.$('#'+wrId);if(!wr)return;

    wr.style.setProperty('--hl-border-c',cfg.borderColor||'#2a2a2a');
    wr.style.setProperty('--hl-border-w',(cfg.borderWidth!=null?cfg.borderWidth:1)+'px');
    wr.style.setProperty('--hl-font-c',cfg.fontColor||'#2a2a2a');

    var alpha=cfg.barOpacity!=null?cfg.barOpacity:0.45;
    var blur=cfg.barBlur!=null?cfg.barBlur:12;
    var rgb=Cards._parseColorToRGB(cfg.barColor);
    var finalBarBg='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+alpha+')';

    wr.style.setProperty('--hl-bar-color',finalBarBg);
    wr.style.setProperty('--hl-bar-blur',blur+'px');

    var chatbar=wr.querySelector('.hl-chatbar');
    if(chatbar){
      chatbar.style.background=finalBarBg;
      chatbar.style.backdropFilter='blur('+blur+'px)';
      chatbar.style.webkitBackdropFilter='blur('+blur+'px)';
    }

    if(cfg.fontFamily){
      var chatDisp=wr.querySelector('.hl-chatbar-display');
      var bubbleDisp=wr.querySelector('.hl-bubble-display');
      if(chatDisp)chatDisp.style.fontFamily=cfg.fontFamily;
      if(bubbleDisp)bubbleDisp.style.fontFamily=cfg.fontFamily;
    }
  },

  _renderDisplayTexts:function(){
    var topEl=document.getElementById('hlTextTop');
    var midEl=document.getElementById('hlTextMid');
    var bubbleL=document.getElementById('hlInputLeft');
    var bubbleR=document.getElementById('hlInputRight');
    var chatL=document.getElementById('hlChatLeft');
    var chatR=document.getElementById('hlChatRight');

    if(topEl){topEl.textContent=App.LS.get('hlText_top')||'';topEl.setAttribute('data-placeholder','第一行...');}
    if(midEl){midEl.textContent=App.LS.get('hlText_mid')||'';midEl.setAttribute('data-placeholder','第二行...');}
    if(bubbleL)bubbleL.textContent=App.LS.get('hlBubble_left')||'';
    if(bubbleR)bubbleR.textContent=App.LS.get('hlBubble_right')||'';
    if(chatL){chatL.textContent=App.LS.get('hlChat_left')||'';chatL.setAttribute('data-placeholder','说点什么...');}
    if(chatR){chatR.textContent=App.LS.get('hlChat_right')||'';chatR.setAttribute('data-placeholder','说点什么...');}
  },

  _restoreHlAvatar:function(bgId,storageKey){
    var el=document.getElementById(bgId);if(!el)return;
    var saved=App.LS.get(storageKey);
    if(saved){
      el.style.backgroundImage='url(\''+saved+'\')';
      el.classList.add('has-img');
    }
  },

  _applyHlAvatar:function(src,bgId,storageKey){
    var el=document.getElementById(bgId);if(!el)return;
    var compress=new Image();
    compress.onload=function(){
      var canvas=document.createElement('canvas');var max=200,w=compress.width,h=compress.height;
      if(w>h){if(w>max){h=h*max/w;w=max;}}else{if(h>max){w=w*max/h;h=max;}}
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(compress,0,0,w,h);
      var result=canvas.toDataURL('image/jpeg',0.85);
      el.style.backgroundImage='url(\''+result+'\')';
      el.classList.add('has-img');
      App.LS.set(storageKey,result);
    };
    compress.src=src;
  },

  _uploadHlAvatar:function(bgId,storageKey,cb){
    var input=document.createElement('input');input.type='file';input.accept='image/*';
    input.onchange=function(e){
      var file=e.target.files[0];if(!file)return;
      var reader=new FileReader();
      reader.onload=function(r){
        var src=r.target.result;
        if(App.cropImage){App.cropImage(src,function(cropped){Cards._applyHlAvatar(cropped,bgId,storageKey);if(cb)cb(cropped);});}
        else{Cards._applyHlAvatar(src,bgId,storageKey);if(cb)cb(src);}
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  _clearHlAvatar:function(bgId,storageKey){
    var el=document.getElementById(bgId);if(!el)return;
    el.style.backgroundImage='';el.classList.remove('has-img');
    App.LS.remove(storageKey);
  },

  _buildFontOptions:function(currentFamily){
    var BUILTIN=[
      {name:'跟随全局',family:''},
      {name:'系统默认',family:'-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif'},
      {name:'霞鹜文楷',family:'"LXGW WenKai",cursive'},
      {name:'思源宋体',family:'"Noto Serif SC",serif'},
      {name:'思源黑体',family:'"Noto Sans SC",sans-serif'},
      {name:'站酷小薇',family:'"ZCOOL XiaoWei",serif'},
      {name:'马善政楷',family:'"Ma Shan Zheng",cursive'}
    ];
    var custom=(App.font&&App.font.customList)||[];
    var all=BUILTIN.concat(custom.map(function(f){return{name:f.fileName||f.name,family:f.family};}));
    return all.map(function(f){
      var sel=(currentFamily===f.family)?'selected':'';
      return '<option value="'+App.escAttr(f.family)+'" '+sel+' style="font-family:'+f.family+';">'+App.esc(f.name)+'</option>';
    }).join('');
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

    Cards.bindEdit();
    Cards.applyDragOffsets();
    Cards.bindDrag();
    Cards.bindHeartline();
    Cards.applyColors();
    Cards.applyPixelColors();
    Cards.applyHlColors('left');
    Cards.applyHlColors('right');
    Cards.bindIconsDragAndUpload();
    Cards.bindPixelEdit();
    Cards.bindHlEdit();
  },

  bindHeartline:function(){
    if(this._hlBound)return;
    this._hlBound=true;
    Cards._restoreHlAvatar('hlImgLeft','avatar_hlLeft');
    Cards._restoreHlAvatar('hlImgRight','avatar_hlRight');
    Cards._renderDisplayTexts();
    Cards._bindHlDrag('hlTextCard');
    Cards._bindHlDrag('hlAvatarWrapLeft');
    Cards._bindHlDrag('hlAvatarWrapRight');
    Cards._restoreHlPos('hlTextCard');
    Cards._restoreHlPos('hlAvatarWrapLeft');
    Cards._restoreHlPos('hlAvatarWrapRight');
  },

  _bindHlDrag:function(id){
    var el=document.getElementById(id);if(!el)return;
    var DELAY=500;
    var startX,startY,origX,origY,longPressed=false,timer,moved=false;
    el.addEventListener('touchstart',function(e){
      var t=e.touches[0];startX=t.clientX;startY=t.clientY;longPressed=false;moved=false;
      var avatarInside=el.querySelector('.hl-avatar');
      if(avatarInside)avatarInside._dragMoved=false;
      timer=setTimeout(function(){
        longPressed=true;
        var off=Cards._dragOffsets[id]||{x:0,y:0};origX=off.x;origY=off.y;
        el.classList.add('hl-dragging');el.style.transition='none';
        if(navigator.vibrate)navigator.vibrate(15);
      },DELAY);
    },{passive:true});
    el.addEventListener('touchmove',function(e){
      var t=e.touches[0];
      if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
      if(!longPressed)return;moved=true;e.preventDefault();e.stopPropagation();
      var nx=origX+(t.clientX-startX);var ny=origY+(t.clientY-startY);
      el.style.transform='translate('+nx+'px,'+ny+'px)';Cards._dragOffsets[id]={x:nx,y:ny};
      var avatarInside=el.querySelector('.hl-avatar');
      if(avatarInside)avatarInside._dragMoved=true;
    },{passive:false});
    el.addEventListener('touchend',function(e){
      clearTimeout(timer);timer=null;el.classList.remove('hl-dragging');el.style.transition='';
      if(longPressed&&moved){Cards.saveDrag();e.stopPropagation();}
      longPressed=false;moved=false;
    });
  },

  _restoreHlPos:function(id){
    var el=document.getElementById(id);if(!el)return;
    var off=Cards._dragOffsets[id];
    if(off)el.style.transform='translate('+off.x+'px,'+off.y+'px)';
  },

  bindEdit:function(){
    document.querySelectorAll('#cardRow .bx-w').forEach(function(card){
      var sub=card.querySelector('.bx-sub');
      if(sub&&!sub._dblBound){
        sub._dblBound=true;
        var tapCount=0,tapTimer=null;
        sub.addEventListener('click',function(e){
          e.preventDefault();e.stopPropagation();
          tapCount++;
          clearTimeout(tapTimer);
          tapTimer=setTimeout(function(){tapCount=0;},350);
          if(tapCount>=2){tapCount=0;clearTimeout(tapTimer);Cards.openEdit(card.dataset.side,card);}
        });
      }
    });
  },

  applyDragOffsets:function(){
    ['profileCard-R','profileCard-L','cardIcon1','cardIcon2','hlTextCard','hlAvatarWrapLeft','hlAvatarWrapRight'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var off=Cards._dragOffsets[id];
      if(off)el.style.transform='translate('+off.x+'px,'+off.y+'px)';
    });
    var topCard=Cards._dragOffsets._topCard;
    if(topCard){
      var topEl=App.$('#'+topCard);if(topEl)topEl.style.zIndex='50';
      ['profileCard-R','profileCard-L'].forEach(function(sid){
        if(sid!==topCard){var s=App.$('#'+sid);if(s)s.style.zIndex='1';}
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
            if(sid!==id){var s=App.$('#'+sid);if(s)s.style.zIndex='1';}
          });
          Cards._dragOffsets._topCard=id;Cards.saveDrag();e.stopPropagation();
        }else{el.style.zIndex='';}
        longPressed=false;moved=false;
      });
    });
  },

  resetAllPositions:function(){
    Cards._dragOffsets={};Cards.saveDrag();
    ['profileCard-R','profileCard-L','cardIcon1','cardIcon2','hlTextCard','hlAvatarWrapLeft','hlAvatarWrapRight'].forEach(function(id){
      var el=App.$('#'+id);if(el){el.style.transform='';el.style.transition='';}
    });
  },

  bindIconsDragAndUpload:function(){
    if(this._iconsBound)return;this._iconsBound=true;
    ['cardIcon1','cardIcon2'].forEach(function(id){
      var el=App.$('#'+id);if(!el)return;
      var startX,startY,startOX,startOY,longPressed=false,timer,moved=false;
      el.addEventListener('touchstart',function(e){
        e.preventDefault();var t=e.touches[0];startX=t.clientX;startY=t.clientY;longPressed=false;moved=false;
        timer=setTimeout(function(){
          longPressed=true;var off=Cards._dragOffsets[id]||{x:0,y:0};startOX=off.x;startOY=off.y;
          el.style.transition='none';el.style.opacity='0.85';el.style.zIndex='999';
          if(navigator.vibrate)navigator.vibrate(15);
        },DRAG_DELAY);
      },{passive:false});
      el.addEventListener('touchmove',function(e){
        var t=e.touches[0];
        if(timer&&!longPressed){if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}return;}
        if(!longPressed)return;moved=true;e.preventDefault();e.stopPropagation();
        var nx=startOX+t.clientX-startX,ny=startOY+t.clientY-startY;
        var otherId=(id==='cardIcon1')?'cardIcon2':'cardIcon1';
        var otherOff=Cards._dragOffsets[otherId]||{x:0,y:0};
        if(Math.abs(ny-otherOff.y)<15)ny=otherOff.y;
        el.style.transform='translate('+nx+'px,'+ny+'px)';Cards._dragOffsets[id]={x:nx,y:ny};
      },{passive:false});
      el.addEventListener('touchend',function(e){
        clearTimeout(timer);timer=null;el.style.opacity='';el.style.transition='';el.style.zIndex='';
        if(longPressed&&moved){Cards.saveDrag();e.stopPropagation();}
        longPressed=false;moved=false;
      });
    });
  },

  bindPixelEdit:function(){
    if(this._pixelBound)return;this._pixelBound=true;
    var body=App.$('#hlTextCard .pixel-body');if(!body)return;
    var tapCount=0,tapTimer=null;
    body.addEventListener('click',function(e){
      e.stopPropagation();tapCount++;clearTimeout(tapTimer);
      tapTimer=setTimeout(function(){tapCount=0;},350);
      if(tapCount>=2){tapCount=0;clearTimeout(tapTimer);Cards.openPixelEdit();}
    });
  },

  openPixelEdit:function(){
    var old=App.$('#pixelEditOverlay');if(old)old.remove();
    var pc=JSON.parse(JSON.stringify(Cards.pixelConfig));
    var textTop=App.LS.get('hlText_top')||'';
    var textMid=App.LS.get('hlText_mid')||'';

    var overlay=document.createElement('div');overlay.id='pixelEditOverlay';overlay.className='pc-edit-overlay';
    var panel=document.createElement('div');panel.className='pc-edit-panel';

    var paletteItems=[
      {key:'heartColor',label:'爱心颜色',value:pc.heartColor},
      {key:'iconColor',label:'图标颜色',value:pc.iconColor},
      {key:'barColor',label:'顶栏+边框',value:pc.barColor},
      {key:'bodyBg',label:'底身颜色',value:pc.bodyBg},
      {key:'fontColor',label:'字体颜色',value:pc.fontColor}
    ];
    var dotsHtml=paletteItems.map(function(p){
      return '<div class="pc-palette-item"><div class="pc-dot" data-ck="'+p.key+'" style="background:'+p.value+';"></div><span class="pc-dot-lbl">'+p.label+'</span></div>';
    }).join('');

    panel.innerHTML=
      '<div class="pc-header">编辑像素框<div class="pc-close-btn" id="pxCloseBtn">×</div></div>'+
      '<div class="pc-body">'+
        '<div class="pc-group"><span class="pc-label">第一行文字</span><input type="text" class="pc-input" id="pxTextTop" value="'+App.escAttr(textTop)+'"></div>'+
        '<div class="pc-group"><span class="pc-label">第二行文字</span><input type="text" class="pc-input" id="pxTextMid" value="'+App.escAttr(textMid)+'"></div>'+
        '<div class="pc-group"><span class="pc-label">调色板</span><div class="pc-palette-grid">'+dotsHtml+'</div></div>'+
        '<div class="pc-group"><span class="pc-label">字体</span><select class="pc-input" id="pxFontSelect">'+Cards._buildFontOptions(pc.fontFamily)+'</select></div>'+
      '</div>'+
      '<div class="pc-footer">'+
        '<button class="pc-btn pc-btn-save" id="pxSaveBtn" type="button">保 存</button>'+
        '<button class="pc-btn pc-btn-cancel" id="pxResetBtn" type="button">重 置</button>'+
      '</div>';

    overlay.appendChild(panel);document.body.appendChild(overlay);

    var pixelEl=App.$('#hlTextCard');
    if(pixelEl){var rect=pixelEl.getBoundingClientRect();var left=rect.left;var top=rect.bottom+8;
      if(left<8)left=8;if(left+270>window.innerWidth)left=window.innerWidth-278;
      if(top+350>window.innerHeight)top=Math.max(10,window.innerHeight-360);
      panel.style.left=left+'px';panel.style.top=top+'px';}

    Cards._bindPanelDrag(panel);

    panel.querySelectorAll('.pc-dot').forEach(function(dot){
      dot.addEventListener('click',function(e){
        e.stopPropagation();var key=dot.dataset.ck;
        App.openColorPicker(pc[key],function(hex){pc[key]=hex;dot.style.background=hex;Cards.pixelConfig=pc;Cards.applyPixelColors();},
        function(hex){pc[key]=hex;dot.style.background=hex;Cards.pixelConfig=pc;Cards.applyPixelColors();},'pixel_'+key);
      });
    });

    panel.querySelector('#pxFontSelect').addEventListener('change',function(){pc.fontFamily=this.value;Cards.pixelConfig=pc;Cards.applyPixelColors();});

    function closePixelOverlay(){overlay.remove();}

    panel.querySelector('#pxSaveBtn').addEventListener('click',function(e){
      e.stopPropagation();
      Cards.pixelConfig=pc;Cards.savePixel();Cards.applyPixelColors();
      var t=panel.querySelector('#pxTextTop').value;
      var m=panel.querySelector('#pxTextMid').value;
      App.LS.set('hlText_top',t);App.LS.set('hlText_mid',m);
      Cards._renderDisplayTexts();
      closePixelOverlay();App.showToast('已保存');
    });
    panel.querySelector('#pxResetBtn').addEventListener('click',function(e){
      e.stopPropagation();Cards.pixelConfig=JSON.parse(JSON.stringify(DEF_PIXEL));Cards.savePixel();Cards.applyPixelColors();closePixelOverlay();App.showToast('已重置');
    });
    panel.querySelector('#pxCloseBtn').addEventListener('click',function(e){e.stopPropagation();closePixelOverlay();});
    overlay.addEventListener('click',function(e){if(e.target===overlay)closePixelOverlay();});
  },

  bindHlEdit:function(){
    if(this._hlEditBound)return;this._hlEditBound=true;
    ['hlAvatarLeft','hlAvatarRight'].forEach(function(avatarId){
      var el=document.getElementById(avatarId);if(!el)return;
      var side=avatarId==='hlAvatarLeft'?'left':'right';
      var tapCount=0,tapTimer=null;
      el.addEventListener('click',function(e){
        if(el._dragMoved)return;
        e.stopPropagation();tapCount++;clearTimeout(tapTimer);
        tapTimer=setTimeout(function(){tapCount=0;},350);
        if(tapCount>=2){tapCount=0;clearTimeout(tapTimer);Cards.openHlEdit(side);}
      });
    });
  },

  openHlEdit:function(side){
    var old=App.$('#hlEditOverlay');if(old)old.remove();
    var cfg=JSON.parse(JSON.stringify(Cards.hlConfig[side]));
    var bgId=side==='left'?'hlImgLeft':'hlImgRight';
    var storageKey=side==='left'?'avatar_hlLeft':'avatar_hlRight';
    var wrId=side==='left'?'hlAvatarWrapLeft':'hlAvatarWrapRight';

    var bubbleKey=side==='left'?'hlBubble_left':'hlBubble_right';
    var chatKey=side==='left'?'hlChat_left':'hlChat_right';
    var bubbleVal=App.LS.get(bubbleKey)||'';
    var chatVal=App.LS.get(chatKey)||'';

    var overlay=document.createElement('div');overlay.id='hlEditOverlay';overlay.className='pc-edit-overlay';
    var panel=document.createElement('div');panel.className='pc-edit-panel';

    var paletteItems=[
      {key:'borderColor',label:'头像框色',value:cfg.borderColor||'#2a2a2a'},
      {key:'fontColor',label:'字体颜色',value:cfg.fontColor||'#2a2a2a'},
      {key:'barColor',label:'对话条底色',value:cfg.barColor||'rgba(255,255,255,0.45)'}
    ];
    var dotsHtml=paletteItems.map(function(p){
      return '<div class="pc-palette-item"><div class="pc-dot" data-ck="'+p.key+'" style="background:'+p.value+';"></div><span class="pc-dot-lbl">'+p.label+'</span></div>';
    }).join('');

    panel.innerHTML=
      '<div class="pc-header">编辑头像 · '+(side==='left'?'左':'右')+'<div class="pc-close-btn" id="hlCloseBtn">×</div></div>'+
      '<div class="pc-body">'+
        '<div class="pc-group"><span class="pc-label">头像</span><div class="pc-av-row">'+
          '<button class="pc-btn pc-btn-save" id="hlUploadBtn" type="button" style="padding:8px;font-size:12px;">上传</button>'+
          '<div class="pc-icon-btn danger" id="hlDelAvatar" title="删除"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg></div>'+
        '</div></div>'+
        '<div class="pc-group"><span class="pc-label">气泡文字</span><input type="text" class="pc-input" id="hlBubbleInput" value="'+App.escAttr(bubbleVal)+'"></div>'+
        '<div class="pc-group"><span class="pc-label">对话条文字</span><input type="text" class="pc-input" id="hlChatInput" value="'+App.escAttr(chatVal)+'"></div>'+
        '<div class="pc-group"><span class="pc-label">调色板</span><div class="pc-palette-grid" style="grid-template-columns:repeat(3,1fr);">'+dotsHtml+'</div></div>'+
        '<div class="pc-group"><span class="pc-label">头像框粗细</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="hlBorderW" min="0" max="5" step="0.5" value="'+(cfg.borderWidth!=null?cfg.borderWidth:1)+'"><span class="pc-slider-val" id="hlBorderWVal">'+(cfg.borderWidth!=null?cfg.borderWidth:1)+'px</span></div></div>'+
        '<div class="pc-group"><span class="pc-label">对话条透明度</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="hlBarOpacity" min="0" max="1" step="0.05" value="'+(cfg.barOpacity!=null?cfg.barOpacity:0.45)+'"><span class="pc-slider-val" id="hlBarOpacityVal">'+Math.round((cfg.barOpacity!=null?cfg.barOpacity:0.45)*100)+'%</span></div></div>'+
        '<div class="pc-group"><span class="pc-label">对话条毛玻璃</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="hlBarBlur" min="0" max="30" step="1" value="'+(cfg.barBlur!=null?cfg.barBlur:12)+'"><span class="pc-slider-val" id="hlBarBlurVal">'+(cfg.barBlur!=null?cfg.barBlur:12)+'px</span></div></div>'+
        '<div class="pc-group"><span class="pc-label">字体</span><select class="pc-input" id="hlFontSelect">'+Cards._buildFontOptions(cfg.fontFamily||'')+'</select></div>'+
      '</div>'+
      '<div class="pc-footer">'+
        '<button class="pc-btn pc-btn-save" id="hlSaveBtn" type="button">保 存</button>'+
        '<button class="pc-btn pc-btn-cancel" id="hlResetBtn" type="button">重 置</button>'+
      '</div>';

    overlay.appendChild(panel);document.body.appendChild(overlay);

    var avatarEl=document.getElementById(wrId);
    if(avatarEl){var rect=avatarEl.getBoundingClientRect();var left=rect.left-60;var top=rect.bottom+8;
      if(left<8)left=8;if(left+270>window.innerWidth)left=window.innerWidth-278;
      if(top+350>window.innerHeight)top=Math.max(10,window.innerHeight-360);
      panel.style.left=left+'px';panel.style.top=top+'px';}

    Cards._bindPanelDrag(panel);

    function closeHlOverlay(){overlay.remove();}

    panel.querySelectorAll('.pc-dot').forEach(function(dot){
      dot.addEventListener('click',function(e){
        e.stopPropagation();var key=dot.dataset.ck;
        App.openColorPicker(cfg[key],function(hex){cfg[key]=hex;dot.style.background=hex;Cards.hlConfig[side]=cfg;Cards.applyHlColors(side);},
        function(hex){cfg[key]=hex;dot.style.background=hex;Cards.hlConfig[side]=cfg;Cards.applyHlColors(side);},'hl_'+side+'_'+key);
      });
    });

    panel.querySelector('#hlBorderW').addEventListener('input',function(){
      cfg.borderWidth=parseFloat(this.value);
      panel.querySelector('#hlBorderWVal').textContent=cfg.borderWidth+'px';
      Cards.hlConfig[side]=cfg;Cards.applyHlColors(side);
    });

    panel.querySelector('#hlBarOpacity').addEventListener('input',function(){
      cfg.barOpacity=parseFloat(this.value);
      panel.querySelector('#hlBarOpacityVal').textContent=Math.round(cfg.barOpacity*100)+'%';
      Cards.hlConfig[side]=cfg;Cards.applyHlColors(side);
    });

    panel.querySelector('#hlBarBlur').addEventListener('input',function(){
      cfg.barBlur=parseInt(this.value);
      panel.querySelector('#hlBarBlurVal').textContent=cfg.barBlur+'px';
      Cards.hlConfig[side]=cfg;Cards.applyHlColors(side);
    });

    panel.querySelector('#hlFontSelect').addEventListener('change',function(){cfg.fontFamily=this.value;Cards.hlConfig[side]=cfg;Cards.applyHlColors(side);});

    panel.querySelector('#hlUploadBtn').addEventListener('click',function(e){e.stopPropagation();Cards._uploadHlAvatar(bgId,storageKey);});
    panel.querySelector('#hlDelAvatar').addEventListener('click',function(e){e.stopPropagation();Cards._clearHlAvatar(bgId,storageKey);App.showToast('头像已清除');});

    panel.querySelector('#hlSaveBtn').addEventListener('click',function(e){
      e.stopPropagation();
      var bv=panel.querySelector('#hlBubbleInput').value;
      var cv=panel.querySelector('#hlChatInput').value;
      App.LS.set(bubbleKey,bv);App.LS.set(chatKey,cv);
      Cards.hlConfig[side]=cfg;Cards.saveHl(side);Cards.applyHlColors(side);
      Cards._renderDisplayTexts();
      closeHlOverlay();App.showToast('已保存');
    });
    panel.querySelector('#hlResetBtn').addEventListener('click',function(e){
      e.stopPropagation();Cards.hlConfig[side]=JSON.parse(JSON.stringify(DEF_HL));Cards.saveHl(side);Cards.applyHlColors(side);closeHlOverlay();App.showToast('已重置');
    });
    panel.querySelector('#hlCloseBtn').addEventListener('click',function(e){e.stopPropagation();closeHlOverlay();});
    overlay.addEventListener('click',function(e){if(e.target===overlay)closeHlOverlay();});
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
        '<div class="pc-group"><span class="pc-label">调色板</span><div class="pc-palette-grid">'+dotsHtml+'</div></div>'+
        '<div class="pc-group"><span class="pc-label">透明度</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="pcBgOpacity" min="0" max="1" step="0.05" value="'+(col.bgOpacity!=null?col.bgOpacity:1)+'"><span class="pc-slider-val" id="pcBgOpacityVal">'+Math.round((col.bgOpacity!=null?col.bgOpacity:1)*100)+'%</span></div></div>'+
        '<div class="pc-group"><span class="pc-label">毛玻璃</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="pcBgBlur" min="0" max="30" step="1" value="'+(col.bgBlur||0)+'"><span class="pc-slider-val" id="pcBgBlurVal">'+(col.bgBlur||0)+'px</span></div></div>'+
        '<div class="pc-group"><span class="pc-label">边框粗细</span><div class="pc-slider-row"><input type="range" class="pc-slider" id="pcBorderW" min="0" max="8" step="0.5" value="'+col.borderW+'"><span class="pc-slider-val" id="pcBorderWVal">'+col.borderW+'px</span></div></div>'+
        '<div class="pc-group"><span class="pc-label">字体</span><select class="pc-input" id="pcFontSelect">'+Cards._buildFontOptions(col.fontFamily||'')+'</select></div>'+
      '</div>'+
      '<div class="pc-footer">'+
        '<button class="pc-btn pc-btn-save" id="pcSaveBtn" type="button">保 存</button>'+
        '<button class="pc-btn pc-btn-cancel" id="pcResetColors" type="button">重 置</button>'+
      '</div>';

    overlay.appendChild(panel);document.body.appendChild(overlay);

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
        e.stopPropagation();var key=dot.dataset.ck;
        App.openColorPicker(col[key],function(hex){col[key]=hex;dot.style.background=hex;Cards.data[side].colors=col;Cards.applyColors();},
        function(hex){col[key]=hex;dot.style.background=hex;Cards.data[side].colors=col;Cards.applyColors();},'pcCard_'+side+'_'+key);
      });
    });

    var bwSlider=panel.querySelector('#pcBorderW');var bwVal=panel.querySelector('#pcBorderWVal');
    if(bwSlider)bwSlider.addEventListener('input',function(){col.borderW=parseFloat(this.value);bwVal.textContent=col.borderW+'px';Cards.data[side].colors=col;Cards.applyColors();});

    var opSlider=panel.querySelector('#pcBgOpacity');var opVal=panel.querySelector('#pcBgOpacityVal');
    if(opSlider)opSlider.addEventListener('input',function(){col.bgOpacity=parseFloat(this.value);opVal.textContent=Math.round(col.bgOpacity*100)+'%';Cards.data[side].colors=col;Cards.applyColors();});

    var blurSlider=panel.querySelector('#pcBgBlur');var blurVal=panel.querySelector('#pcBgBlurVal');
    if(blurSlider)blurSlider.addEventListener('input',function(){col.bgBlur=parseInt(this.value);blurVal.textContent=col.bgBlur+'px';Cards.data[side].colors=col;Cards.applyColors();});

    panel.querySelector('#pcFontSelect').addEventListener('change',function(){col.fontFamily=this.value;Cards.data[side].colors=col;Cards.applyColors();});

    panel.querySelector('#pcResetColors').addEventListener('click',function(e){
      e.stopPropagation();var defCol=side==='left'?DEF_COLORS_L:DEF_COLORS_R;
      col=JSON.parse(JSON.stringify(defCol));
      panel.querySelectorAll('.pc-dot').forEach(function(d){d.style.background=col[d.dataset.ck];});
      if(bwSlider){bwSlider.value=col.borderW;bwVal.textContent=col.borderW+'px';}
      if(opSlider){opSlider.value=col.bgOpacity;opVal.textContent=Math.round(col.bgOpacity*100)+'%';}
      if(blurSlider){blurSlider.value=col.bgBlur;blurVal.textContent=col.bgBlur+'px';}
      Cards.data[side].colors=col;Cards.applyColors();App.showToast('已重置默认配色');
    });

    var tempAvatar=d.avatar||'';

    function previewAvatar(){
      var cardId=side==='left'?'#profileCard-L':'#profileCard-R';
      var avFront=document.querySelector(cardId+' .bx-av-front');if(!avFront)return;
      if(tempAvatar){avFront.innerHTML='';avFront.style.backgroundImage='url(\''+tempAvatar+'\')';}
      else{avFront.style.backgroundImage='';avFront.innerHTML='<div class="bx-av-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>点击设置</span></div>';}
    }

    panel.querySelector('#pcUploadBtn').addEventListener('click',function(e){
      e.stopPropagation();
      var input=document.createElement('input');input.type='file';input.accept='image/*';
      input.onchange=function(ev){
        var file=ev.target.files[0];if(!file)return;
        var reader=new FileReader();
        reader.onload=function(r){
          if(App.cropImage){App.cropImage(r.target.result,function(c){tempAvatar=c;previewAvatar();});}
          else{Cards._compressAvatar(r.target.result,function(c){tempAvatar=c;previewAvatar();});}
        };reader.readAsDataURL(file);
      };input.click();
    });

    panel.querySelector('#pcUrlBtn').addEventListener('click',function(e){
      e.stopPropagation();var url=prompt('输入头像URL：',tempAvatar);
      if(url!==null){tempAvatar=url.trim();previewAvatar();}
    });

    panel.querySelector('#pcDelAvatar').addEventListener('click',function(e){e.stopPropagation();tempAvatar='';previewAvatar();});

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
      Cards.save();Cards.render();overlay.remove();
      App.showToast('已保存');
    });

    function closeAndRevert(){
      Cards.data=snapshot;Cards.save();Cards.render();overlay.remove();
    }
    panel.querySelector('#pcCloseBtn').addEventListener('click',function(e){e.stopPropagation();closeAndRevert();});
    overlay.addEventListener('click',function(e){if(e.target===overlay&&!document.querySelector('.crop-overlay'))closeAndRevert();});
  },

  _bindPanelDrag:function(panel,handleSelector){
    if(!panel)return;
    var _drag={active:false,sx:0,sy:0,ox:0,oy:0};var timer=null;var pressed=false;
    panel.addEventListener('touchstart',function(e){
      if(handleSelector&&!e.target.closest(handleSelector))return;
      if(e.target.closest('button')||e.target.closest('input')||e.target.closest('select')||e.target.closest('label')||e.target.closest('.pc-dot')||e.target.closest('.pc-icon-btn')||e.target.closest('.pc-close-btn')||e.target.closest('.pc-slider'))return;
      var t=e.touches[0];_drag.sx=t.clientX;_drag.sy=t.clientY;pressed=false;
      timer=setTimeout(function(){
        pressed=true;var pr=panel.getBoundingClientRect();
        panel.style.transform='none';panel.style.left=pr.left+'px';panel.style.top=pr.top+'px';
        _drag.ox=pr.left;_drag.oy=pr.top;_drag.active=true;
      },150);
    },{passive:true});
    var mh=function(e){
      var t=e.touches[0];
      if(timer&&!pressed){if(Math.abs(t.clientX-_drag.sx)>8||Math.abs(t.clientY-_drag.sy)>8){clearTimeout(timer);timer=null;}return;}
      if(!_drag.active)return;e.preventDefault();
      panel.style.left=(_drag.ox+t.clientX-_drag.sx)+'px';panel.style.top=(_drag.oy+t.clientY-_drag.sy)+'px';
    };
    var eh=function(){clearTimeout(timer);timer=null;_drag.active=false;pressed=false;};
    document.addEventListener('touchmove',mh,{passive:false});document.addEventListener('touchend',eh);
  },

  _compressAvatar:function(src,callback){
    var img=new Image();
    img.onload=function(){
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

