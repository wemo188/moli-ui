
(function(){
'use strict';
var App=window.App;if(!App)return;

var CLOUD_SVG='<svg viewBox="0 0 64 64" fill="none" width="28" height="28"><path d="M20 40C16 40 12 37 12 32C12 27.5 15 24.5 19 24C20 19 24.5 15 30 15C36 15 40.5 19 41.5 24C46 24.5 50 28 50 32.5C50 37.5 46.5 40 43 40" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M32 48V32" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round"/><path d="M26 38L32 32L38 38" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var MENU_SVG='<svg viewBox="0 0 64 64" fill="none" width="28" height="28"><line x1="12" y1="20" x2="52" y2="20" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/><line x1="12" y1="32" x2="52" y2="32" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/><line x1="12" y1="44" x2="52" y2="44" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/><circle cx="24" cy="20" r="4" stroke="#1a1a1a" stroke-width="2" fill="white"/><circle cx="38" cy="32" r="4" stroke="#1a1a1a" stroke-width="2" fill="white"/><circle cx="28" cy="44" r="4" stroke="#1a1a1a" stroke-width="2" fill="white"/></svg>';
var ROBOT_SVG='<svg class="ol-robot-svg" viewBox="0 0 64 64" width="32" height="32" fill="none"><line x1="32" y1="14" x2="32" y2="10" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#1a1a1a"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#1a1a1a"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';
var STOP_SVG='<svg viewBox="0 0 24 24" width="16" height="16"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';
var CTX_ICONS={copy:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',edit:'<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',regen:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg>',del:'<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',delafter:'<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>'};

var DEF_AP={
  bgBlur:0,bgDark:0,
  povOn:true,povUser:'second',povChar:'first',wordCount:0,
  pageBg:'#ffffff',barBg:'#ffffff',barBorderColor:'#1a1a1a',barOpacity:100,barBlur:20,
  mode:'bubble',
  /* char avatar */
  cAvShow:true,cAvNameShow:true,cAvSize:50,cAvRadius:50,cAvFrameColor:'#adcdea',cAvFrameW:2,cAvNameSize:10,cAvPos:'left',
  /* char bubble */
  cBubbleBg:'rgba(255,255,255,.75)',cBubbleRadius:14,cBubbleBorderColor:'rgba(200,220,240,.3)',cBubbleBorderW:1,cBubbleWidth:100,
  /* user avatar */
  uAvShow:true,uAvNameShow:true,uAvSize:50,uAvRadius:50,uAvFrameColor:'#adcdea',uAvFrameW:2,uAvNameSize:10,uAvPos:'right',
  /* user bubble */
  uBubbleBg:'rgba(126,163,201,.10)',uBubbleRadius:14,uBubbleBorderColor:'rgba(126,163,201,.25)',uBubbleBorderW:1,uBubbleWidth:100,
  /* text */
  textSize:14,textWeight:400,textLH:1.85,textColor:'#2e4258',
  /* quote */
  quoteOn:false,quoteRec:['curly','straight'],quoteDis:'curly',quoteColor:'#2e4258',quoteSize:14,quoteWeight:400,quoteItalic:false,
  /* paren */
  parenOn:false,parenRec:['full','half'],parenDis:'full',parenHide:false,parenColor:'#7a9ab8',parenSize:14,parenWeight:400,parenItalic:true,
  /* star */
  starOn:false,starHide:true,starColor:'#7a9ab8',starSize:14,starWeight:400,starItalic:true
};

function gAp(cid){var s=App.LS.get('olAp_'+cid);if(!s)return JSON.parse(JSON.stringify(DEF_AP));var r=JSON.parse(JSON.stringify(DEF_AP));Object.keys(s).forEach(function(k){r[k]=s[k];});return r;}
function sAp(cid,ap){App.LS.set('olAp_'+cid,ap);}
function swHtml(id,on){return '<div class="ol-sw" id="'+id+'"><div class="ol-sw-track'+(on?' on':'')+'"></div></div>';}
function tagHtml(cls,val,label,sel){return '<div class="ol-tag '+cls+(sel?' active':'')+'" data-val="'+val+'">'+label+'</div>';}
function foldHtml(id,title,body){return '<div class="ol-fold" id="'+id+'"><div class="ol-fold-head">'+title+'</div><div class="ol-fold-body">'+body+'</div></div>';}

var OfflineUI={
_noScroll:false,
getAp:function(){var OL=App.offline;return OL?gAp(OL.charId):JSON.parse(JSON.stringify(DEF_AP));},

render:function(container,charData){
var c=charData;var dn=c.name||'';
var bgUrl=App.LS.get('olBg_'+c.id)||'';
var ap=gAp(c.id);

var quoteHint='<div class="ol-hint">开启后识别双引号并转换显示，防止模型偷用英文引号</div>';

/* 角色头像 */
var charAvatarBody=
  '<div class="ol-sw-row">头像显示 '+swHtml('olcAvShow',ap.cAvShow)+'</div>'+
  '<div class="ol-sw-row">名称显示 '+swHtml('olcAvNameShow',ap.cAvNameShow)+'</div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">大小</span><input type="range" id="olcAvSize" min="30" max="100" step="2" value="'+ap.cAvSize+'"><span class="hp-slider-val" id="olcAvSizeVal">'+ap.cAvSize+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">角度</span><input type="range" id="olcAvRadius" min="0" max="50" step="1" value="'+ap.cAvRadius+'"><span class="hp-slider-val" id="olcAvRadiusVal">'+ap.cAvRadius+'%</span></div>'+
  '<div class="ol-inline-row"><span>框与名称颜色</span><div class="hp-color-dot" id="olcAvFrameColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">框粗细</span><input type="range" id="olcAvFrameW" min="0" max="5" step="0.5" value="'+ap.cAvFrameW+'"><span class="hp-slider-val" id="olcAvFrameWVal">'+ap.cAvFrameW+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">名称字号</span><input type="range" id="olcAvNameSize" min="8" max="16" step="0.5" value="'+ap.cAvNameSize+'"><span class="hp-slider-val" id="olcAvNameSizeVal">'+ap.cAvNameSize+'px</span></div>'+
  '<div class="ol-sub-label">头像位置</div>'+
  '<div class="hp-btn-row"><button class="hp-btn ol-cavpos-btn" data-pos="left">气泡左侧</button><button class="hp-btn ol-cavpos-btn" data-pos="right">气泡右侧</button></div>';

/* 角色气泡 */
var charBubbleBody=
  '<div class="ol-inline-row"><span>气泡背景</span><div class="hp-color-dot" id="olcBubbleBg"></div></div>'+
  '<div class="ol-inline-row"><span>气泡边框颜色</span><div class="hp-color-dot" id="olcBubbleBorderColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">边框粗细</span><input type="range" id="olcBubbleBorderW" min="0" max="5" step="0.5" value="'+ap.cBubbleBorderW+'"><span class="hp-slider-val" id="olcBubbleBorderWVal">'+ap.cBubbleBorderW+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">圆角</span><input type="range" id="olcBubbleRadius" min="0" max="24" step="1" value="'+ap.cBubbleRadius+'"><span class="hp-slider-val" id="olcBubbleRadiusVal">'+ap.cBubbleRadius+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">宽度</span><input type="range" id="olcBubbleWidth" min="50" max="100" step="1" value="'+ap.cBubbleWidth+'"><span class="hp-slider-val" id="olcBubbleWidthVal">'+ap.cBubbleWidth+'%</span></div>';

/* 用户头像 */
var userAvatarBody=
  '<div class="ol-sw-row">头像显示 '+swHtml('oluAvShow',ap.uAvShow)+'</div>'+
  '<div class="ol-sw-row">名称显示 '+swHtml('oluAvNameShow',ap.uAvNameShow)+'</div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">大小</span><input type="range" id="oluAvSize" min="30" max="100" step="2" value="'+ap.uAvSize+'"><span class="hp-slider-val" id="oluAvSizeVal">'+ap.uAvSize+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">角度</span><input type="range" id="oluAvRadius" min="0" max="50" step="1" value="'+ap.uAvRadius+'"><span class="hp-slider-val" id="oluAvRadiusVal">'+ap.uAvRadius+'%</span></div>'+
  '<div class="ol-inline-row"><span>框与名称颜色</span><div class="hp-color-dot" id="oluAvFrameColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">框粗细</span><input type="range" id="oluAvFrameW" min="0" max="5" step="0.5" value="'+ap.uAvFrameW+'"><span class="hp-slider-val" id="oluAvFrameWVal">'+ap.uAvFrameW+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">名称字号</span><input type="range" id="oluAvNameSize" min="8" max="16" step="0.5" value="'+ap.uAvNameSize+'"><span class="hp-slider-val" id="oluAvNameSizeVal">'+ap.uAvNameSize+'px</span></div>'+
  '<div class="ol-sub-label">头像位置</div>'+
  '<div class="hp-btn-row"><button class="hp-btn ol-uavpos-btn" data-pos="left">气泡左侧</button><button class="hp-btn ol-uavpos-btn" data-pos="right">气泡右侧</button></div>';

/* 用户气泡 */
var userBubbleBody=
  '<div class="ol-inline-row"><span>气泡背景</span><div class="hp-color-dot" id="oluBubbleBg"></div></div>'+
  '<div class="ol-inline-row"><span>气泡边框颜色</span><div class="hp-color-dot" id="oluBubbleBorderColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">边框粗细</span><input type="range" id="oluBubbleBorderW" min="0" max="5" step="0.5" value="'+ap.uBubbleBorderW+'"><span class="hp-slider-val" id="oluBubbleBorderWVal">'+ap.uBubbleBorderW+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">圆角</span><input type="range" id="oluBubbleRadius" min="0" max="24" step="1" value="'+ap.uBubbleRadius+'"><span class="hp-slider-val" id="oluBubbleRadiusVal">'+ap.uBubbleRadius+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">宽度</span><input type="range" id="oluBubbleWidth" min="50" max="100" step="1" value="'+ap.uBubbleWidth+'"><span class="hp-slider-val" id="oluBubbleWidthVal">'+ap.uBubbleWidth+'%</span></div>';

/* 字体 */
function fmtStar(ap){
  var h='<div class="ol-fmt-section"><div class="ol-sub-title">单星号识别 '+swHtml('olstarOn',ap.starOn)+'</div>'+
    '<div class="ol-sub-label">识别符号：*…* 、 ＊…＊</div>'+
    '<div class="ol-sw-row">隐藏星号 '+swHtml('olstarHide',ap.starHide)+'</div>'+
    '<div class="ol-inline-row"><span>颜色</span><div class="hp-color-dot ol-fmt-color" data-prefix="star" id="olstarColor"></div></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">字号</span><input type="range" class="ol-fmt-slider" data-prefix="star" data-key="Size" min="10" max="24" step="0.5" value="'+ap.starSize+'"><span class="hp-slider-val" id="olstarSizeVal">'+ap.starSize+'px</span></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">字重</span><input type="range" class="ol-fmt-slider" data-prefix="star" data-key="Weight" min="100" max="900" step="100" value="'+ap.starWeight+'"><span class="hp-slider-val" id="olstarWeightVal">'+ap.starWeight+'</span></div>'+
    '<div class="ol-tag-row"><span class="ol-sub-label" style="margin:0;">样式</span>'+
      tagHtml('ol-star-style','normal','正常',!ap.starItalic)+
      tagHtml('ol-star-style','italic','斜体',ap.starItalic)+
    '</div></div>';
  return h;
}

var fontBody=
  '<div class="ol-sub-title">正文</div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">字号</span><input type="range" id="oltextSize" min="10" max="24" step="0.5" value="'+ap.textSize+'"><span class="hp-slider-val" id="oltextSizeVal">'+ap.textSize+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">字重</span><input type="range" id="oltextWeight" min="100" max="900" step="100" value="'+ap.textWeight+'"><span class="hp-slider-val" id="oltextWeightVal">'+ap.textWeight+'</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">行高</span><input type="range" id="oltextLH" min="1.2" max="2.5" step="0.05" value="'+ap.textLH+'"><span class="hp-slider-val" id="oltextLHVal">'+ap.textLH+'</span></div>'+
  '<div class="ol-inline-row"><span>字体颜色</span><div class="hp-color-dot" id="oltextColor"></div></div>'+
  '<div class="hp-divider"></div>'+

  '<div class="ol-fmt-section"><div class="ol-sub-title">双引号识别 '+swHtml('olquoteOn',ap.quoteOn)+'</div>'+
    quoteHint+
    '<div class="ol-sub-label">识别符号（多选）</div><div class="ol-tag-row">'+
      tagHtml('ol-qrec','curly','\u201C\u201D',ap.quoteRec.indexOf('curly')>=0)+
      tagHtml('ol-qrec','straight','&quot;&quot;',ap.quoteRec.indexOf('straight')>=0)+
      tagHtml('ol-qrec','corner','「」',ap.quoteRec.indexOf('corner')>=0)+
    '</div>'+
    '<div class="ol-sub-label">显示符号（单选）</div><div class="ol-tag-row">'+
      tagHtml('ol-qdis','curly','\u201C\u201D',ap.quoteDis==='curly')+
      tagHtml('ol-qdis','straight','&quot;&quot;',ap.quoteDis==='straight')+
      tagHtml('ol-qdis','corner','「」',ap.quoteDis==='corner')+
    '</div>'+
    '<div class="ol-inline-row"><span>颜色</span><div class="hp-color-dot ol-fmt-color" data-prefix="quote" id="olquoteColor"></div></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">字号</span><input type="range" class="ol-fmt-slider" data-prefix="quote" data-key="Size" min="10" max="24" step="0.5" value="'+ap.quoteSize+'"><span class="hp-slider-val" id="olquoteSizeVal">'+ap.quoteSize+'px</span></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">字重</span><input type="range" class="ol-fmt-slider" data-prefix="quote" data-key="Weight" min="100" max="900" step="100" value="'+ap.quoteWeight+'"><span class="hp-slider-val" id="olquoteWeightVal">'+ap.quoteWeight+'</span></div>'+
    '<div class="ol-tag-row"><span class="ol-sub-label" style="margin:0;">样式</span>'+
      tagHtml('ol-quote-style','normal','正常',!ap.quoteItalic)+
      tagHtml('ol-quote-style','italic','斜体',ap.quoteItalic)+
    '</div></div>'+
  '<div class="hp-divider"></div>'+

  '<div class="ol-fmt-section"><div class="ol-sub-title">括号识别 '+swHtml('olparenOn',ap.parenOn)+'</div>'+
    '<div class="ol-sub-label">识别符号（多选）</div><div class="ol-tag-row">'+
      tagHtml('ol-prec','full','（…）',ap.parenRec.indexOf('full')>=0)+
      tagHtml('ol-prec','half','(…)',ap.parenRec.indexOf('half')>=0)+
    '</div>'+
    '<div class="ol-sub-label">显示符号（单选）</div><div class="ol-tag-row">'+
      tagHtml('ol-pdis','full','（…）',ap.parenDis==='full')+
      tagHtml('ol-pdis','half','(…)',ap.parenDis==='half')+
    '</div>'+
    '<div class="ol-sw-row">隐藏括号 '+swHtml('olparenHide',ap.parenHide)+'</div>'+
    '<div class="ol-inline-row"><span>颜色</span><div class="hp-color-dot ol-fmt-color" data-prefix="paren" id="olparenColor"></div></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">字号</span><input type="range" class="ol-fmt-slider" data-prefix="paren" data-key="Size" min="10" max="24" step="0.5" value="'+ap.parenSize+'"><span class="hp-slider-val" id="olparenSizeVal">'+ap.parenSize+'px</span></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">字重</span><input type="range" class="ol-fmt-slider" data-prefix="paren" data-key="Weight" min="100" max="900" step="100" value="'+ap.parenWeight+'"><span class="hp-slider-val" id="olparenWeightVal">'+ap.parenWeight+'</span></div>'+
    '<div class="ol-tag-row"><span class="ol-sub-label" style="margin:0;">样式</span>'+
      tagHtml('ol-paren-style','normal','正常',!ap.parenItalic)+
      tagHtml('ol-paren-style','italic','斜体',ap.parenItalic)+
    '</div></div>'+
  '<div class="hp-divider"></div>'+

  fmtStar(ap)+
  '<div class="hp-divider"></div>'+
  '<div class="hp-btn-row"><button class="hp-btn hp-btn-danger" id="olStyleReset">重置外观</button></div>';

container.innerHTML=
'<div class="ol-root" id="olRoot">'+
'<div class="ol-bg" id="olBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');filter:blur('+ap.bgBlur+'px) brightness('+(100-ap.bgDark)+'%);':'')+'"></div>'+
'<div class="ol-hd"><div class="ol-hd-name" id="olName">'+App.esc(dn)+'</div></div>'+
'<div class="ol-msgs" id="olMsgs"></div>'+
'<div class="ol-plus-panel" id="olPlusPanel">'+
  '<div class="ol-plus-item" id="olPiPhoto"><div class="ol-plus-icon"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div><div class="ol-plus-label">图片</div></div>'+
  '<div class="ol-plus-item" id="olPiFile"><div class="ol-plus-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="ol-plus-label">文件</div></div>'+
'</div>'+
'<div class="ol-input-wrap" id="olInputWrap">'+
  '<button class="ol-outer-btn" id="olPanelBtn" type="button">'+MENU_SVG+'</button>'+
  '<div class="ol-input-box"><button class="ol-inner-btn" id="olPlusBtn" type="button">'+CLOUD_SVG+'</button>'+
    '<textarea class="ol-input" id="olInput" placeholder="输入内容..." rows="1"></textarea></div>'+
  '<button class="ol-outer-btn ol-btn-robot" id="olAiBtn" type="button">'+ROBOT_SVG+'</button>'+
'</div>'+
'<div id="olSettingsPanel" class="half-panel hidden">'+
  '<div class="hp-handle"></div>'+
  '<div class="hp-header"><h2>设置</h2><button class="hp-close" id="olPanelClose" type="button"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>'+
  '<div class="hp-body">'+
    '<div class="hp-btn-row"><button class="hp-btn" id="olSbScene">编辑场景</button><button class="hp-btn" id="olSbBg">上传背景图</button></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">虚化</span><input type="range" id="olBgBlur" min="0" max="30" value="'+ap.bgBlur+'"><span class="hp-slider-val" id="olBgBlurVal">'+ap.bgBlur+'px</span></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">暗度</span><input type="range" id="olBgDark" min="0" max="80" value="'+ap.bgDark+'"><span class="hp-slider-val" id="olBgDarkVal">'+ap.bgDark+'%</span></div>'+
    '<div class="hp-divider"></div>'+
    '<div class="hp-section-label">聊天设置</div>'+
    '<div class="ol-sw-row">人称视角 '+swHtml('olPovOn',ap.povOn)+'</div>'+
    '<div id="olPovSub" style="'+(ap.povOn?'':'display:none;')+'">'+
      '<div class="ol-sub-label">用户人称</div>'+
      '<div class="hp-btn-row"><button class="hp-btn ol-povu-btn" data-pov="first">第一</button><button class="hp-btn ol-povu-btn" data-pov="second">第二</button><button class="hp-btn ol-povu-btn" data-pov="third">第三</button></div>'+
      '<div class="ol-sub-label">角色人称</div>'+
      '<div class="hp-btn-row"><button class="hp-btn ol-povc-btn" data-pov="first">第一</button><button class="hp-btn ol-povc-btn" data-pov="second">第二</button><button class="hp-btn ol-povc-btn" data-pov="third">第三</button></div>'+
    '</div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label" style="width:60px;">期望字数</span><input type="number" id="olWordCount" placeholder="如 800，留空不限" value="'+(ap.wordCount||'')+'"></div>'+
    '<div class="hp-divider"></div>'+
    '<div class="hp-section-label">外观</div>'+
    '<div class="ol-color-grid" style="grid-template-columns:repeat(3,1fr);">'+
      '<div class="ol-color-item"><div class="hp-color-dot" id="olPageBg"></div><span>页面背景</span></div>'+
      '<div class="ol-color-item"><div class="hp-color-dot" id="olBarBg"></div><span>底栏底色</span></div>'+
      '<div class="ol-color-item"><div class="hp-color-dot" id="olBarBorderColor"></div><span>底栏边框</span></div>'+
    '</div>'+
    '<div class="hp-divider"></div>'+
    '<div class="ol-sub-title">视觉调整</div>'+
    '<div class="hp-btn-row"><button class="hp-btn ol-mode-btn" data-mode="bubble">气泡模式</button><button class="hp-btn ol-mode-btn" data-mode="parallel">平行模式</button></div>'+
    '<div class="hp-divider"></div>'+
    '<div class="ol-sub-title">角色板块调整</div>'+
    foldHtml('olFoldCav','头像',charAvatarBody)+
    foldHtml('olFoldCbubble','气泡',charBubbleBody)+
    '<div class="hp-divider"></div>'+
    '<div class="ol-sub-title">用户板块调整</div>'+
    foldHtml('olFoldUav','头像',userAvatarBody)+
    foldHtml('olFoldUbubble','气泡',userBubbleBody)+
    foldHtml('olFoldFont','字体',fontBody)+
    '<div class="hp-divider"></div>'+
    '<div class="hp-section-label">美化主题</div>'+
    '<div style="font-size:12px;color:#999;padding:10px 0;">敬请期待</div>'+
    '<div class="hp-divider"></div>'+
    '<div class="hp-section-label">高级</div>'+
    '<div class="hp-btn-row"><button class="hp-btn" id="olSbCode">自定义UI</button></div>'+
    '<div class="hp-bottom-spacer"></div>'+
  '</div>'+
'</div>'+
'</div>';

OfflineUI.applyAppearance(c.id);
OfflineUI.applyCustomCode(c.id);
},

_hexToRgb:function(hex){
  if(!hex||hex.indexOf('gradient')>=0)return '255,255,255';
  hex=hex.replace('#','');if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if(hex.length!==6)return '255,255,255';
  return parseInt(hex.substr(0,2),16)+','+parseInt(hex.substr(2,2),16)+','+parseInt(hex.substr(4,2),16);
},
_escRe:function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');},

applyAppearance:function(cid){
var ap=gAp(cid);var r=App.$('#olRoot');if(!r)return;
r.style.setProperty('--ol-bg-color',ap.pageBg);
r.style.setProperty('--ol-text-size',ap.textSize+'px');
r.style.setProperty('--ol-text-line-height',String(ap.textLH));
r.style.setProperty('--ol-text-color',ap.textColor);
r.style.setProperty('--ol-dialogue-color',ap.textColor);
r.style.setProperty('--ol-text-weight',String(ap.textWeight));
/* char avatar */
r.style.setProperty('--ol-c-av-size',ap.cAvSize+'px');
r.style.setProperty('--ol-c-av-radius',ap.cAvRadius+'%');
r.style.setProperty('--ol-c-av-frame-color',ap.cAvFrameColor);
r.style.setProperty('--ol-c-av-frame-w',ap.cAvFrameW+'px');
r.style.setProperty('--ol-c-av-name-size',ap.cAvNameSize+'px');
r.style.setProperty('--ol-c-av-show',ap.cAvShow?'flex':'none');
r.style.setProperty('--ol-c-av-name-show',ap.cAvNameShow?'block':'none');
r.style.setProperty('--ol-c-bubble-bg',ap.cBubbleBg);
r.style.setProperty('--ol-c-bubble-radius',ap.cBubbleRadius+'px');
r.style.setProperty('--ol-c-bubble-border-color',ap.cBubbleBorderColor);
r.style.setProperty('--ol-c-bubble-border-w',ap.cBubbleBorderW+'px');
r.style.setProperty('--ol-c-bubble-width',ap.cBubbleWidth+'%');
/* user avatar */
r.style.setProperty('--ol-u-av-size',ap.uAvSize+'px');
r.style.setProperty('--ol-u-av-radius',ap.uAvRadius+'%');
r.style.setProperty('--ol-u-av-frame-color',ap.uAvFrameColor);
r.style.setProperty('--ol-u-av-frame-w',ap.uAvFrameW+'px');
r.style.setProperty('--ol-u-av-name-size',ap.uAvNameSize+'px');
r.style.setProperty('--ol-u-av-show',ap.uAvShow?'flex':'none');
r.style.setProperty('--ol-u-av-name-show',ap.uAvNameShow?'block':'none');
r.style.setProperty('--ol-u-bubble-bg',ap.uBubbleBg);
r.style.setProperty('--ol-u-bubble-radius',ap.uBubbleRadius+'px');
r.style.setProperty('--ol-u-bubble-border-color',ap.uBubbleBorderColor);
r.style.setProperty('--ol-u-bubble-border-w',ap.uBubbleBorderW+'px');
r.style.setProperty('--ol-u-bubble-width',ap.uBubbleWidth+'%');
/* fmt */
['quote','paren','star'].forEach(function(p){
  r.style.setProperty('--ol-'+p+'-color',ap[p+'Color']);
  r.style.setProperty('--ol-'+p+'-size',ap[p+'Size']+'px');
  r.style.setProperty('--ol-'+p+'-weight',String(ap[p+'Weight']));
  r.style.setProperty('--ol-'+p+'-style',ap[p+'Italic']?'italic':'normal');
});
/* mode */
if(ap.mode==='parallel')r.classList.add('ol-parallel');else r.classList.remove('ol-parallel');
/* bar */
var wrap=App.$('#olInputWrap');
if(wrap){
  var barVal=ap.barBg;
  if(barVal.indexOf('gradient')>=0){wrap.style.background=barVal;}
  else{var barRgb=OfflineUI._hexToRgb(barVal);wrap.style.background='rgba('+barRgb+','+ap.barOpacity/100+')';}
  wrap.style.backdropFilter='blur('+ap.barBlur+'px)';wrap.style.webkitBackdropFilter='blur('+ap.barBlur+'px)';
  wrap.style.borderTopColor=ap.barBorderColor;
  wrap.querySelectorAll('.ol-outer-btn svg *,.ol-inner-btn svg *').forEach(function(el){
    if(el.getAttribute('stroke')&&el.getAttribute('stroke')!=='white'&&el.getAttribute('stroke')!=='none')el.setAttribute('stroke',ap.barBorderColor);
    if(el.getAttribute('fill')&&el.getAttribute('fill')!=='white'&&el.getAttribute('fill')!=='none')el.setAttribute('fill',ap.barBorderColor);
  });
  var box=wrap.querySelector('.ol-input-box');if(box)box.style.borderColor=ap.barBorderColor;
}
/* bg */
var bg=App.$('#olBg');if(bg&&App.LS.get('olBg_'+cid))bg.style.filter='blur('+ap.bgBlur+'px) brightness('+(100-ap.bgDark)+'%)';
},

formatProse:function(rawText,cid){
  var ap=cid?gAp(cid):JSON.parse(JSON.stringify(DEF_AP));
  var text=rawText||'';
  var tokens=[];
  function protect(html){var idx=tokens.length;tokens.push(html);return '\x00T'+idx+'T\x00';}

  /* 单星号 */
  if(ap.starOn){
    text=text.replace(/\*([^*]+)\*/g,function(m,g){
      return protect('<span class="ol-fmt-star">'+(ap.starHide?'':'*')+App.esc(g)+(ap.starHide?'':'*')+'</span>');
    });
    text=text.replace(/＊([^＊]+)＊/g,function(m,g){
      return protect('<span class="ol-fmt-star">'+(ap.starHide?'':'＊')+App.esc(g)+(ap.starHide?'':'＊')+'</span>');
    });
  }
  /* 双引号 */
  if(ap.quoteOn){
    var qMap={curly:['\u201C','\u201D'],straight:['"','"'],corner:['「','」']};
    var dq=qMap[ap.quoteDis]||qMap.curly;
    var pairs=[];
    if(ap.quoteRec.indexOf('curly')>=0)pairs.push(['\u201C','\u201D']);
    if(ap.quoteRec.indexOf('straight')>=0)pairs.push(['"','"']);
    if(ap.quoteRec.indexOf('corner')>=0)pairs.push(['「','」']);
    pairs.forEach(function(p){
      var re=new RegExp(OfflineUI._escRe(p[0])+'([^'+OfflineUI._escRe(p[1])+']+)'+OfflineUI._escRe(p[1]),'g');
      text=text.replace(re,function(m,g){
        return protect('<span class="ol-fmt-quote">'+App.esc(dq[0])+App.esc(g)+App.esc(dq[1])+'</span>');
      });
    });
  }
  /* 括号 */
  if(ap.parenOn){
    var pMap={full:['（','）'],half:['(',')']};
    var dp=pMap[ap.parenDis]||pMap.full;
    var ppairs=[];
    if(ap.parenRec.indexOf('full')>=0)ppairs.push(['（','）']);
    if(ap.parenRec.indexOf('half')>=0)ppairs.push(['(',')']);
    ppairs.forEach(function(p){
      var re=new RegExp(OfflineUI._escRe(p[0])+'([^'+OfflineUI._escRe(p[1])+']+)'+OfflineUI._escRe(p[1]),'g');
      text=text.replace(re,function(m,g){
        if(ap.parenHide)return protect('<span class="ol-fmt-paren">'+App.esc(g)+'</span>');
        return protect('<span class="ol-fmt-paren">'+App.esc(dp[0])+App.esc(g)+App.esc(dp[1])+'</span>');
      });
    });
  }
  /* 对剩余纯文本做 esc，再还原占位符 */
  var parts=text.split(/\x00T(\d+)T\x00/);
  var result='';
  for(var i=0;i<parts.length;i++){
    if(i%2===0)result+=App.esc(parts[i]);
    else result+=tokens[parseInt(parts[i])];
  }
  return result;
},

renderMessages:function(){
var OL=App.offline;if(!OL)return;
var container=App.$('#olMsgs');if(!container)return;
var c=OL.charData;var user=App.user?App.user.getActiveUser():null;
var ap=gAp(OL.charId);
var charAv=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
var userAv=user&&user.avatar?'<img src="'+App.escAttr(user.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';

if(!OL.messages.length){container.innerHTML='<div class="ol-empty">开始你们的故事吧</div>';return;}
var html='';var floor=0;

OL.messages.forEach(function(msg,idx){
  if(msg.role==='system')return;
  floor++;var isUser=msg.role==='user';
  var timeStr=msg.ts?OfflineUI.fmtTime(msg.ts):'';
  var charCount=(msg.content||'').length;
  var tokens=Math.round(charCount/2);
  var tokenStr=tokens>=1000?(tokens/1000).toFixed(1)+'k':tokens+'';
  var showTimeSep=false;
  if(msg.ts){var prev=null;for(var pi=idx-1;pi>=0;pi--){if(OL.messages[pi].role!=='system'){prev=OL.messages[pi];break;}}if(!prev||!prev.ts||msg.ts-prev.ts>300000)showTimeSep=true;}
  if(showTimeSep&&timeStr&&!isUser)html+='<div class="ol-time-sep">'+timeStr+'</div>';
  var rawText=(msg.content||'').trim();if(!rawText)return;
  var parsed=OfflineUI.parseThinking(rawText);
  var text=parsed.main;
  var thinkHtml=(!isUser&&parsed.think)?OfflineUI.buildThinkHtml(parsed.think):'';
  var avHtml=isUser?userAv:charAv;
  var avName=isUser?App.esc((user&&(user.nickname||user.realName))||'你'):App.esc(c.name||'');
  var formatted=OfflineUI.formatProse(text,OL.charId);
  var avPos=isUser?ap.uAvPos:ap.cAvPos;
  var blockClass='ol-block'+(isUser?' is-user':' is-char')+' ol-av-'+avPos;

  var metaHtml='<div class="ol-scatter-meta">'+
    '<span class="ol-scatter-floor">#'+String(floor).padStart(3,'0')+'</span>'+
    '<span class="ol-scatter-tokens">'+tokenStr+' tk</span>'+
    '<span class="ol-scatter-time">'+timeStr+'</span>'+
    '<span class="ol-scatter-chars">'+charCount+'字</span></div>';

  var avArea='<div class="ol-avatar-area"><div class="ol-avatar-frame"><div class="ol-avatar">'+avHtml+'</div></div><div class="ol-avatar-name">'+avName+'</div></div>';
  var bubbleArea='<div class="ol-bubble-col"><div class="ol-frame-mid"><div class="ol-bubble-inner">'+thinkHtml+'<div class="ol-bubble-text">'+formatted+'</div></div></div>'+metaHtml+'</div>';

  html+='<div class="'+blockClass+'" data-msg-idx="'+idx+'">'+avArea+bubbleArea+'</div>';
});

if(OL.isStreaming&&!OL._backgroundMode){
  html+='<div class="ol-block is-char ol-av-'+ap.cAvPos+'" id="olStreamProse"><div class="ol-avatar-area"><div class="ol-avatar-frame"><div class="ol-avatar">'+charAv+'</div></div></div><div class="ol-bubble-col"><div class="ol-frame-mid"><div class="ol-bubble-inner"><div class="ol-bubble-text" id="olStreamBubble"><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span></div></div></div></div></div>';
}
container.innerHTML=html;
if(!OfflineUI._noScroll)OfflineUI.scrollBottom();
OfflineUI._noScroll=false;
},

parseThinking:function(text){var t='',m=text;var r=text.match(/<think>([\s\S]*?)<\/think>/i);if(r){t=r[1].trim();m=text.replace(/<think>[\s\S]*?<\/think>/gi,'').trim();}if(!r){var o=text.match(/<think>([\s\S]*)$/i);if(o){t=o[1].trim();m=text.replace(/<think>[\s\S]*$/i,'').trim();}}return{think:t,main:m};},
buildThinkHtml:function(t){if(!t)return '';return '<details class="ol-think-block"><summary class="ol-think-summary">💭 思维过程</summary><div class="ol-think-body">'+App.esc(t)+'</div></details>';},
fmtTime:function(ts){var d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');},
scrollBottom:function(){var el=App.$('#olMsgs');if(el)requestAnimationFrame(function(){el.scrollTop=el.scrollHeight;});},
updateAiBtn:function(){var OL=App.offline;if(!OL)return;var btn=App.$('#olAiBtn');if(!btn)return;if(OL.isStreaming){btn.innerHTML=STOP_SVG;btn.classList.add('ol-btn-stop');btn.classList.remove('ol-btn-robot');}else{btn.innerHTML=ROBOT_SVG;btn.classList.remove('ol-btn-stop');btn.classList.add('ol-btn-robot');}},
updateTyping:function(show){var OL=App.offline;if(!OL)return;var el=App.$('#olName');if(!el)return;var dn=OL.charData?OL.charData.name:'';if(show)el.innerHTML=App.esc(dn)+'<span class="ol-hd-typing">正在书写...</span>';else el.textContent=dn;},
_closePanel:function(){var p=App.$('#olSettingsPanel');if(p){p.classList.remove('show');setTimeout(function(){p.classList.add('hidden');},350);}},

bindEvents:function(){
var OL=App.offline;if(!OL)return;
var root=App.$('#olRoot');var panel=App.$('#olSettingsPanel');var cid=OL.charId;
var ap=gAp(cid);
function save(){sAp(cid,ap);OfflineUI.applyAppearance(cid);}
function saveRender(){save();OfflineUI._noScroll=true;OfflineUI.renderMessages();}
function setActive(btns,btn){btns.forEach(function(b){b.classList.remove('hp-btn-primary');});btn.classList.add('hp-btn-primary');}

/* 左滑返回 */
var _sw={active:false,sx:0,sy:0,locked:false,dir:''};
if(root){
  root.addEventListener('touchstart',function(e){var t=e.touches[0];if(t.clientX-root.getBoundingClientRect().left>50)return;_sw={active:true,sx:t.clientX,sy:t.clientY,locked:false,dir:''};},{passive:true});
  root.addEventListener('touchmove',function(e){if(!_sw.active)return;var t=e.touches[0],dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;if(!_sw.locked){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.locked=true;_sw.dir=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_sw.dir==='h'&&dx>0){e.preventDefault();root.style.transform='translateX('+Math.min(dx,root.offsetWidth)+'px)';root.style.opacity=String(1-dx/root.offsetWidth*0.5);}},{passive:false});
  root.addEventListener('touchend',function(e){if(!_sw.active)return;_sw.active=false;if(_sw.dir!=='h'){root.style.transform='';root.style.opacity='';return;}var dx=e.changedTouches[0].clientX-_sw.sx;if(dx>root.offsetWidth*0.3){root.style.transition='transform .25s,opacity .25s';root.style.transform='translateX(100%)';root.style.opacity='0';setTimeout(function(){root.style.transition='';root.style.transform='';root.style.opacity='';OL.close();},260);}else{root.style.transition='transform .2s,opacity .2s';root.style.transform='';root.style.opacity='';setTimeout(function(){root.style.transition='';},220);}},{passive:true});
}

App.safeOn('#olPanelBtn','click',function(e){e.stopPropagation();if(panel){panel.classList.remove('hidden');requestAnimationFrame(function(){panel.classList.add('show');});}});
App.safeOn('#olPanelClose','click',function(){OfflineUI._closePanel();});

var input=App.$('#olInput');
if(input){input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();OL.sendUser();}});}

App.safeOn('#olAiBtn','click',function(e){e.stopPropagation();if(OL.isStreaming){OL.stopStream();return;}var inp=App.$('#olInput');var t=inp?inp.value.trim():'';if(t){OL.sendUser();return;}OL.requestAI();});
App.safeOn('#olPlusBtn','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(!pp)return;OL._plusOpen=!OL._plusOpen;if(OL._plusOpen)pp.classList.add('show');else pp.classList.remove('show');});
App.safeOn('#olPiPhoto','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}var menu=document.createElement('div');menu.className='pc-edit-overlay';menu.style.zIndex='100060';menu.innerHTML='<div class="pc-edit-panel" style="width:260px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><div class="pc-header">发送图片<div class="pc-close-btn" id="olPhX">×</div></div><div class="pc-body" style="gap:8px;"><button class="pc-btn pc-btn-save" id="olPhAlbum" type="button">从相册选择</button><button class="pc-btn pc-btn-cancel" id="olPhUrl" type="button">输入图片URL</button></div></div>';document.body.appendChild(menu);menu.addEventListener('click',function(ev){if(ev.target===menu)menu.remove();});menu.querySelector('#olPhX').addEventListener('click',function(){menu.remove();});menu.querySelector('#olPhAlbum').addEventListener('click',function(){menu.remove();var inp2=document.createElement('input');inp2.type='file';inp2.accept='image/*';document.body.appendChild(inp2);inp2.onchange=function(ev){var f=ev.target.files[0];document.body.removeChild(inp2);if(!f)return;OL.messages.push({role:'user',content:'[用户展示了一张图片]',ts:Date.now()});OL.saveMsgs();OfflineUI.renderMessages();};inp2.click();});menu.querySelector('#olPhUrl').addEventListener('click',function(){menu.remove();var url=prompt('输入图片URL：');if(!url)return;OL.messages.push({role:'user',content:'[用户展示了一张图片]',ts:Date.now()});OL.saveMsgs();OfflineUI.renderMessages();});});
App.safeOn('#olPiFile','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}App.showToast('文件 · 开发中');});

/* 折叠 */
App.$$('.ol-fold-head').forEach(function(h){h.addEventListener('click',function(){h.parentElement.classList.toggle('open');});});

/* 开关 */
App.$$('.ol-sw-track').forEach(function(sw){
  sw.addEventListener('click',function(e){e.stopPropagation();sw.classList.toggle('on');
    var id=sw.parentElement.id;
    if(id==='olPovOn'){ap.povOn=sw.classList.contains('on');var sub=App.$('#olPovSub');if(sub)sub.style.display=ap.povOn?'':'none';save();}
    else if(id==='olcAvShow'){ap.cAvShow=sw.classList.contains('on');saveRender();}
    else if(id==='olcAvNameShow'){ap.cAvNameShow=sw.classList.contains('on');saveRender();}
    else if(id==='oluAvShow'){ap.uAvShow=sw.classList.contains('on');saveRender();}
    else if(id==='oluAvNameShow'){ap.uAvNameShow=sw.classList.contains('on');saveRender();}
    else if(id==='olquoteOn'){ap.quoteOn=sw.classList.contains('on');saveRender();}
    else if(id==='olparenOn'){ap.parenOn=sw.classList.contains('on');saveRender();}
    else if(id==='olstarOn'){ap.starOn=sw.classList.contains('on');saveRender();}
    else if(id==='olparenHide'){ap.parenHide=sw.classList.contains('on');saveRender();}
    else if(id==='olstarHide'){ap.starHide=sw.classList.contains('on');saveRender();}
    else save();
  });
});

/* 背景 blur/dark */
['olBgBlur','olBgDark'].forEach(function(id){var sl=App.$('#'+id);if(!sl)return;sl.addEventListener('input',function(){var v=parseFloat(this.value);if(id==='olBgBlur'){ap.bgBlur=v;App.$('#olBgBlurVal').textContent=v+'px';}else{ap.bgDark=v;App.$('#olBgDarkVal').textContent=v+'%';}save();});});

/* POV */
App.$$('.ol-povu-btn').forEach(function(btn){if(btn.dataset.pov===ap.povUser)btn.classList.add('hp-btn-primary');btn.addEventListener('click',function(){setActive(Array.from(App.$$('.ol-povu-btn')),btn);ap.povUser=btn.dataset.pov;save();});});
App.$$('.ol-povc-btn').forEach(function(btn){if(btn.dataset.pov===ap.povChar)btn.classList.add('hp-btn-primary');btn.addEventListener('click',function(){setActive(Array.from(App.$$('.ol-povc-btn')),btn);ap.povChar=btn.dataset.pov;save();});});
var wc=App.$('#olWordCount');if(wc)wc.addEventListener('change',function(){ap.wordCount=parseInt(this.value)||0;save();});

/* Colors */
function bindColor(id,key){var dot=App.$('#'+id);if(!dot)return;dot.style.background=ap[key]||'#fff';dot.addEventListener('click',function(e){e.stopPropagation();if(!App.openColorPicker)return;App.openColorPicker(ap[key]||'#fff',function(hex){dot.style.background=hex;ap[key]=hex;saveRender();},function(hex){dot.style.background=hex;ap[key]=hex;OfflineUI.applyAppearance(cid);},'ol_'+key);});}
bindColor('olPageBg','pageBg');bindColor('olBarBg','barBg');bindColor('olBarBorderColor','barBorderColor');
bindColor('olcAvFrameColor','cAvFrameColor');bindColor('olcBubbleBg','cBubbleBg');bindColor('olcBubbleBorderColor','cBubbleBorderColor');
bindColor('oluAvFrameColor','uAvFrameColor');bindColor('oluBubbleBg','uBubbleBg');bindColor('oluBubbleBorderColor','uBubbleBorderColor');
bindColor('oltextColor','textColor');

/* Fmt colors */
App.$$('.ol-fmt-color').forEach(function(dot){var prefix=dot.dataset.prefix;var key=prefix+'Color';dot.style.background=ap[key];dot.addEventListener('click',function(e){e.stopPropagation();if(!App.openColorPicker)return;App.openColorPicker(ap[key],function(hex){dot.style.background=hex;ap[key]=hex;saveRender();},function(hex){dot.style.background=hex;},'ol_'+key);});});

/* Mode */
App.$$('.ol-mode-btn').forEach(function(btn){if(btn.dataset.mode===ap.mode)btn.classList.add('hp-btn-primary');btn.addEventListener('click',function(){setActive(Array.from(App.$$('.ol-mode-btn')),btn);ap.mode=btn.dataset.mode;saveRender();});});

/* Char avatar pos */
App.$$('.ol-cavpos-btn').forEach(function(btn){if(btn.dataset.pos===ap.cAvPos)btn.classList.add('hp-btn-primary');btn.addEventListener('click',function(){setActive(Array.from(App.$$('.ol-cavpos-btn')),btn);ap.cAvPos=btn.dataset.pos;saveRender();});});
/* User avatar pos */
App.$$('.ol-uavpos-btn').forEach(function(btn){if(btn.dataset.pos===ap.uAvPos)btn.classList.add('hp-btn-primary');btn.addEventListener('click',function(){setActive(Array.from(App.$$('.ol-uavpos-btn')),btn);ap.uAvPos=btn.dataset.pos;saveRender();});});
/* User bubble pos */
App.$$('.ol-cpos-btn').forEach(function(btn){if(btn.dataset.pos===(ap.cBubblePos||'left'))btn.classList.add('hp-btn-primary');btn.addEventListener('click',function(){setActive(Array.from(App.$$('.ol-cpos-btn')),btn);ap.cBubblePos=btn.dataset.pos;saveRender();});});

/* All sliders */
var allSliders=[
  {id:'olcAvSize',key:'cAvSize',unit:'px'},{id:'olcAvRadius',key:'cAvRadius',unit:'%'},{id:'olcAvFrameW',key:'cAvFrameW',unit:'px'},{id:'olcAvNameSize',key:'cAvNameSize',unit:'px'},
  {id:'olcBubbleRadius',key:'cBubbleRadius',unit:'px'},{id:'olcBubbleBorderW',key:'cBubbleBorderW',unit:'px'},{id:'olcBubbleWidth',key:'cBubbleWidth',unit:'%'},
  {id:'oluAvSize',key:'uAvSize',unit:'px'},{id:'oluAvRadius',key:'uAvRadius',unit:'%'},{id:'oluAvFrameW',key:'uAvFrameW',unit:'px'},{id:'oluAvNameSize',key:'uAvNameSize',unit:'px'},
  {id:'oluBubbleRadius',key:'uBubbleRadius',unit:'px'},{id:'oluBubbleBorderW',key:'uBubbleBorderW',unit:'px'},{id:'oluBubbleWidth',key:'uBubbleWidth',unit:'%'},
  {id:'oltextSize',key:'textSize',unit:'px'},{id:'oltextWeight',key:'textWeight',unit:''},{id:'oltextLH',key:'textLH',unit:''}
];
allSliders.forEach(function(s){var sl=App.$('#'+s.id);var val=App.$('#'+s.id+'Val');if(!sl||!val)return;sl.addEventListener('input',function(){var v=parseFloat(this.value);val.textContent=v+s.unit;ap[s.key]=v;saveRender();});});

/* Fmt sliders */
App.$$('.ol-fmt-slider').forEach(function(sl){var prefix=sl.dataset.prefix;var key=prefix+sl.dataset.key;var valEl=App.$('#ol'+key+'Val');sl.addEventListener('input',function(){var v=parseFloat(this.value);if(valEl)valEl.textContent=v+(sl.dataset.key==='Weight'?'':'px');ap[key]=v;saveRender();});});

/* Multi-select tags */
App.$$('.ol-qrec').forEach(function(tag){tag.addEventListener('click',function(){tag.classList.toggle('active');ap.quoteRec=[];App.$$('.ol-qrec.active').forEach(function(t){ap.quoteRec.push(t.dataset.val);});saveRender();});});
App.$$('.ol-prec').forEach(function(tag){tag.addEventListener('click',function(){tag.classList.toggle('active');ap.parenRec=[];App.$$('.ol-prec.active').forEach(function(t){ap.parenRec.push(t.dataset.val);});saveRender();});});

/* Single-select tags */
App.$$('.ol-qdis').forEach(function(tag){tag.addEventListener('click',function(){App.$$('.ol-qdis').forEach(function(t){t.classList.remove('active');});tag.classList.add('active');ap.quoteDis=tag.dataset.val;saveRender();});});
App.$$('.ol-pdis').forEach(function(tag){tag.addEventListener('click',function(){App.$$('.ol-pdis').forEach(function(t){t.classList.remove('active');});tag.classList.add('active');ap.parenDis=tag.dataset.val;saveRender();});});

/* Fmt style toggles */
['quote','paren','star'].forEach(function(prefix){App.$$('.ol-'+prefix+'-style').forEach(function(tag){tag.addEventListener('click',function(){App.$$('.ol-'+prefix+'-style').forEach(function(t){t.classList.remove('active');});tag.classList.add('active');ap[prefix+'Italic']=tag.dataset.val==='italic';saveRender();});});});

/* Scene & bg */
App.safeOn('#olSbScene','click',function(){OfflineUI.showSceneDialog();});
App.safeOn('#olSbBg','click',function(){OfflineUI.showBgMenu();});
App.safeOn('#olSbCode','click',function(){OfflineUI._closePanel();OfflineUI.openCodeEditor();});

/* Reset */
App.safeOn('#olStyleReset','click',function(){App.LS.remove('olAp_'+cid);OfflineUI.applyAppearance(cid);OfflineUI._noScroll=true;OfflineUI.renderMessages();App.showToast('外观已重置');});

/* Long press ctx */
var mc=App.$('#olMsgs');
if(mc){var lt=null,lT=null,mv=false;
  mc.addEventListener('touchstart',function(e){var b=e.target.closest('.ol-block');if(!b)return;mv=false;var t=e.touches[0];lT={el:b,x:t.clientX,y:t.clientY};lt=setTimeout(function(){if(lT&&!mv){if(navigator.vibrate)navigator.vibrate(15);OfflineUI.showCtxMenu(lT.el,lT.x,lT.y);}},500);},{passive:true});
  mc.addEventListener('touchmove',function(){mv=true;clearTimeout(lt);lT=null;},{passive:true});
  mc.addEventListener('touchend',function(){clearTimeout(lt);lT=null;},{passive:true});
}
if(root){root.addEventListener('click',function(){OL.dismissCtx();var pp=App.$('#olPlusPanel');if(pp&&OL._plusOpen){pp.classList.remove('show');OL._plusOpen=false;}});}
},

showCtxMenu:function(msgEl,x,y){var OL=App.offline;if(!OL)return;OL.dismissCtx();var idx=parseInt(msgEl.dataset.msgIdx);if(isNaN(idx))return;var msg=OL.messages[idx];if(!msg)return;var isUser=msg.role==='user';var menu=document.createElement('div');menu.className='ol-ctx';var items='';items+='<div class="ol-ctx-item" data-act="copy">'+CTX_ICONS.copy+'<span>复制</span></div>';items+='<div class="ol-ctx-item" data-act="edit">'+CTX_ICONS.edit+'<span>编辑</span></div>';if(!isUser)items+='<div class="ol-ctx-item" data-act="regen">'+CTX_ICONS.regen+'<span>重写</span></div>';items+='<div class="ol-ctx-item" data-act="del">'+CTX_ICONS.del+'<span>删除</span></div>';items+='<div class="ol-ctx-item" data-act="delafter">'+CTX_ICONS.delafter+'<span>往后全删</span></div>';menu.innerHTML=items;var left=Math.max(8,Math.min(x-125,window.innerWidth-258));var top=y-80;if(top<60)top=y+10;menu.style.left=left+'px';menu.style.top=top+'px';document.body.appendChild(menu);OL._ctxMenu=menu;menu.querySelectorAll('.ol-ctx-item').forEach(function(item){item.addEventListener('click',function(e){e.stopPropagation();var act=item.dataset.act;OL.dismissCtx();if(act==='copy')App.copyText(msg.content).then(function(){App.showToast('已复制');});else if(act==='edit')OfflineUI.showEditDialog(idx);else if(act==='del'){OL.messages.splice(idx,1);OL.saveMsgs();OfflineUI.renderMessages();}else if(act==='delafter'){if(!confirm('删除此条及之后？'))return;OL.messages.splice(idx);OL.saveMsgs();OfflineUI.renderMessages();}else if(act==='regen'){OL.messages.splice(idx);OL.saveMsgs();OfflineUI.renderMessages();OL.requestAI();}});});},
showEditDialog:function(idx){var OL=App.offline;if(!OL)return;var msg=OL.messages[idx];if(!msg)return;var overlay=document.createElement('div');overlay.className='pc-edit-overlay';overlay.style.zIndex='100060';overlay.innerHTML='<div class="pc-edit-panel" style="width:320px;max-height:70vh;overflow-y:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><div class="pc-header">编辑<div class="pc-close-btn" id="olEdX">×</div></div><div class="pc-body"><textarea class="pc-input" id="olEdTA" style="min-height:120px;resize:vertical;">'+App.esc(msg.content)+'</textarea></div><div class="pc-footer"><button class="pc-btn pc-btn-save" id="olEdSave" type="button">保存</button><button class="pc-btn pc-btn-cancel" id="olEdCancel" type="button">取消</button></div></div>';document.body.appendChild(overlay);overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});overlay.querySelector('#olEdX').addEventListener('click',function(){overlay.remove();});overlay.querySelector('#olEdCancel').addEventListener('click',function(){overlay.remove();});overlay.querySelector('#olEdSave').addEventListener('click',function(){var val=overlay.querySelector('#olEdTA').value.trim();if(!val){App.showToast('不能为空');return;}OL.messages[idx].content=val;OL.saveMsgs();OfflineUI.renderMessages();overlay.remove();});},
showSceneDialog:function(){var OL=App.offline;if(!OL)return;var current=App.LS.get('olScene_'+OL.charId)||'';var overlay=document.createElement('div');overlay.className='pc-edit-overlay';overlay.style.zIndex='100060';overlay.innerHTML='<div class="pc-edit-panel" style="width:340px;max-height:75vh;overflow-y:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><div class="pc-header">场景 / 时间线<div class="pc-close-btn" id="olScX">×</div></div><div class="pc-body"><div style="font-size:11px;color:#999;margin-bottom:8px;">描述当前场景、时间、地点、剧情背景等。</div><textarea class="pc-input" id="olScTA" style="min-height:200px;resize:vertical;" placeholder="例如：暴风雨之夜，山中木屋...">'+App.esc(current)+'</textarea></div><div class="pc-footer"><button class="pc-btn pc-btn-save" id="olScSave" type="button">保存</button><button class="pc-btn pc-btn-cancel" id="olScClear" type="button">清空</button></div></div>';document.body.appendChild(overlay);overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});overlay.querySelector('#olScX').addEventListener('click',function(){overlay.remove();});overlay.querySelector('#olScSave').addEventListener('click',function(){var val=overlay.querySelector('#olScTA').value.trim();if(val)App.LS.set('olScene_'+OL.charId,val);else App.LS.remove('olScene_'+OL.charId);overlay.remove();App.showToast('已保存');});overlay.querySelector('#olScClear').addEventListener('click',function(){App.LS.remove('olScene_'+OL.charId);overlay.remove();App.showToast('已清空');});},
showBgMenu:function(){var OL=App.offline;if(!OL)return;var menu=document.createElement('div');menu.className='pc-edit-overlay';menu.style.zIndex='100060';menu.innerHTML='<div class="pc-edit-panel" style="width:260px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><div class="pc-header">背景<div class="pc-close-btn" id="olBgX">×</div></div><div class="pc-body" style="gap:8px;"><button class="pc-btn pc-btn-save" id="olBgAlbum" type="button">从相册选择</button><button class="pc-btn pc-btn-cancel" id="olBgUrl" type="button">输入图片URL</button><button class="pc-btn pc-btn-cancel" id="olBgDel" type="button" style="color:#c9706b;">移除背景</button></div></div>';document.body.appendChild(menu);menu.addEventListener('click',function(e){if(e.target===menu)menu.remove();});menu.querySelector('#olBgX').addEventListener('click',function(){menu.remove();});menu.querySelector('#olBgDel').addEventListener('click',function(){App.LS.remove('olBg_'+OL.charId);var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='';menu.remove();App.showToast('已移除');});menu.querySelector('#olBgAlbum').addEventListener('click',function(){menu.remove();var inp=document.createElement('input');inp.type='file';inp.accept='image/*';document.body.appendChild(inp);inp.onchange=function(ev){var f=ev.target.files[0];document.body.removeChild(inp);if(!f)return;var reader=new FileReader();reader.onload=function(r){if(App.cropImage){App.cropImage(r.target.result,function(cropped){try{App.LS.set('olBg_'+OL.charId,cropped);}catch(e2){App.showToast('图片太大');return;}var bg=App.$('#olBg');if(bg){bg.style.backgroundImage='url('+cropped+')';var ap2=gAp(OL.charId);bg.style.filter='blur('+ap2.bgBlur+'px) brightness('+(100-ap2.bgDark)+'%)';}App.showToast('已设置');});}else{try{App.LS.set('olBg_'+OL.charId,r.target.result);}catch(e2){App.showToast('图片太大');return;}var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='url('+r.target.result+')';App.showToast('已设置');}};reader.readAsDataURL(f);};inp.click();});menu.querySelector('#olBgUrl').addEventListener('click',function(){menu.remove();var url=prompt('输入背景图URL：');if(!url||!url.trim())return;url=url.trim();App.LS.set('olBg_'+OL.charId,url);var bg=App.$('#olBg');if(bg){bg.style.backgroundImage='url('+url+')';var ap2=gAp(OL.charId);bg.style.filter='blur('+ap2.bgBlur+'px) brightness('+(100-ap2.bgDark)+'%)';}App.showToast('已设置');});},
openCodeEditor:function(){var OL=App.offline;if(!OL)return;var saved=App.LS.get('olCustomCode_'+OL.charId)||'';var ed=document.createElement('div');ed.className='ol-css-editor';ed.innerHTML='<div class="ol-css-editor-header"><button type="button" id="olCodeBack" class="ol-css-hd-btn">返回</button><span class="ol-css-hd-title">自定义UI</span><button type="button" id="olCodeSave" class="ol-css-hd-btn">保存</button></div><textarea class="ol-css-textarea" id="olCodeTA" spellcheck="false" placeholder="支持 HTML + CSS + JS">'+App.esc(saved)+'</textarea>';document.body.appendChild(ed);App.bindSwipeBack(ed,function(){ed.remove();});ed.querySelector('#olCodeBack').addEventListener('click',function(){ed.remove();});ed.querySelector('#olCodeSave').addEventListener('click',function(){var code=ed.querySelector('#olCodeTA').value||'';App.LS.set('olCustomCode_'+OL.charId,code);OfflineUI.applyCustomCode(OL.charId);ed.remove();App.showToast('已保存');});ed.querySelector('#olCodeTA').addEventListener('keydown',function(e){if(e.key==='Tab'){e.preventDefault();var ta=this,s=ta.selectionStart,end=ta.selectionEnd;ta.value=ta.value.substring(0,s)+'  '+ta.value.substring(end);ta.selectionStart=ta.selectionEnd=s+2;}});},
applyCustomCode:function(charId){var oldS=document.getElementById('olCustomStyle');if(oldS)oldS.remove();var oldH=document.getElementById('olCustomHtml');if(oldH)oldH.remove();var code=App.LS.get('olCustomCode_'+charId);if(!code)return;var css='';var cssR=/<style[^>]*>([\s\S]*?)<\/style>/gi;var cm;while((cm=cssR.exec(code))!==null)css+=cm[1]+'\n';var jss=[];var jsR=/<script[^>]*>([\s\S]*?)<\/script>/gi;var jm;while((jm=jsR.exec(code))!==null)jss.push(jm[1]);var html=code.replace(/<style[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<script[^>]*>[\s\S]*?<\/script>/gi,'').trim();if(!/<style/i.test(code)&&!/<[a-z]/i.test(code)){css=code;html='';}if(css){var s=document.createElement('style');s.id='olCustomStyle';s.textContent=css;document.head.appendChild(s);}if(html){var cont=document.getElementById('olMsgs');if(cont){var d=document.createElement('div');d.id='olCustomHtml';d.innerHTML=html;cont.insertBefore(d,cont.firstChild);}}if(jss.length)jss.forEach(function(js){try{(new Function(js))();}catch(e){console.warn('[自定义代码]',e.message);}});},
init:function(){App.offlineUI=OfflineUI;}
};
App.register('offlineUI',OfflineUI);
})();
