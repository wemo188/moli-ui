
(function(){
'use strict';
var App=window.App;if(!App)return;

var CLOUD_SVG='<svg viewBox="0 0 64 64" fill="none" width="28" height="28"><path d="M20 40C16 40 12 37 12 32C12 27.5 15 24.5 19 24C20 19 24.5 15 30 15C36 15 40.5 19 41.5 24C46 24.5 50 28 50 32.5C50 37.5 46.5 40 43 40" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M32 48V32" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><path d="M26 38L32 32L38 38" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var MENU_SVG='<svg viewBox="0 0 64 64" fill="none" width="28" height="28"><line x1="12" y1="20" x2="52" y2="20" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><line x1="12" y1="32" x2="52" y2="32" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><line x1="12" y1="44" x2="52" y2="44" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="20" r="4" stroke="#1a1a1a" stroke-width="2.5" fill="white"/><circle cx="38" cy="32" r="4" stroke="#1a1a1a" stroke-width="2.5" fill="white"/><circle cx="28" cy="44" r="4" stroke="#1a1a1a" stroke-width="2.5" fill="white"/></svg>';
var ROBOT_SVG='<svg class="ol-robot-svg" viewBox="0 0 64 64" width="32" height="32" fill="none"><line x1="32" y1="14" x2="32" y2="10" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="6.5" rx="4.5" ry="5.5" fill="#1a1a1a"/><rect x="7" y="22" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="51" y="22" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="12" y="14" width="40" height="32" rx="8" fill="#1a1a1a"/><line x1="26" y1="27" x2="26" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="38" y1="27" x2="38" y2="33" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>';
var STOP_SVG='<svg viewBox="0 0 24 24" width="16" height="16"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';
var CTX_ICONS={copy:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',edit:'<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',regen:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg>',del:'<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',delafter:'<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/></svg>'};

var DEF_AP={
  bgBlur:0,bgDark:0,bgFit:'contain',povOn:true,povUser:'second',povChar:'first',wordCount:0,
  pageBg:'#ffffff',barBg:'#ffffff',barBorderColor:'#1a1a1a',barOpacity:100,barBlur:20,mode:'bubble',blockGap:16,
  cAvShow:true,cAvNameShow:true,cAvSize:50,cAvRadius:50,cAvFrameColor:'#adcdea',cAvFrameW:2,cAvNameSize:11,cAvPos:'left',
  cBubbleBg:'#ffffff',cBubbleRadius:14,cBubbleBorderColor:'rgba(200,220,240,.3)',cBubbleBorderW:1,cBubbleWidth:100,cBubbleOpacity:100,cBubbleBlur:0,
  cTextSize:16,cTextWeight:400,cTextLH:1.85,cTextColor:'#2e4258',cParaGap:10,cLetterGap:0,
  cQuoteOn:false,cQuoteRec:['curly','straight'],cQuoteDis:'curly',cQuoteColor:'#2e4258',cQuoteSize:16,cQuoteWeight:400,cQuoteItalic:false,
  cParenOn:false,cParenRec:['full','half'],cParenDis:'full',cParenHide:false,cParenColor:'#7a9ab8',cParenSize:16,cParenWeight:400,cParenItalic:true,
  cStarOn:false,cStarHide:true,cStarColor:'#7a9ab8',cStarSize:16,cStarWeight:400,cStarItalic:true,
  uAvShow:true,uAvNameShow:true,uAvSize:50,uAvRadius:50,uAvFrameColor:'#adcdea',uAvFrameW:2,uAvNameSize:11,uAvPos:'right',
  uBubbleBg:'#eef4fa',uBubbleRadius:14,uBubbleBorderColor:'rgba(126,163,201,.25)',uBubbleBorderW:1,uBubbleWidth:100,uBubbleOpacity:100,uBubbleBlur:0,
  uTextSize:16,uTextWeight:400,uTextLH:1.85,uTextColor:'#2e4258',uParaGap:10,uLetterGap:0,
  quoteOn:false,quoteRec:['curly','straight'],quoteDis:'curly',quoteColor:'#2e4258',quoteSize:16,quoteWeight:400,quoteItalic:false,
  parenOn:false,parenRec:['full','half'],parenDis:'full',parenHide:false,parenColor:'#7a9ab8',parenSize:16,parenWeight:400,parenItalic:true,
  starOn:false,starHide:true,starColor:'#7a9ab8',starSize:16,starWeight:400,starItalic:true
};

function gAp(cid){var s=App.LS.get('olAp_'+cid);if(!s)return JSON.parse(JSON.stringify(DEF_AP));var r=JSON.parse(JSON.stringify(DEF_AP));Object.keys(s).forEach(function(k){r[k]=s[k];});return r;}
function sAp(cid,ap){App.LS.set('olAp_'+cid,ap);}
function swHtml(id,on){return '<div class="ol-sw" id="'+id+'"><div class="ol-sw-track'+(on?' on':'')+'"></div></div>';}
function tagHtml(cls,val,label,sel){return '<div class="ol-tag '+cls+(sel?' active':'')+'" data-val="'+val+'">'+label+'</div>';}
function foldHtml(id,title,body){return '<div class="ol-fold" id="'+id+'"><div class="ol-fold-head">'+title+'</div><div class="ol-fold-body">'+body+'</div></div>';}
function escRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function hexToRgba(hex,a){if(!hex)return 'rgba(255,255,255,'+a+')';if(hex.indexOf('rgba')>=0)return hex.replace(/,\s*[\d.]+\s*\)/,','+a+')');if(hex.indexOf('rgb')>=0)return hex.replace('rgb','rgba').replace(')',','+a+')');hex=hex.replace('#','');if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];if(hex.length!==6)return 'rgba(255,255,255,'+a+')';return 'rgba('+parseInt(hex.substr(0,2),16)+','+parseInt(hex.substr(2,2),16)+','+parseInt(hex.substr(4,2),16)+','+a+')';}

function buildFmtUI(p,ap){
  var h='';
  if(p==='cQuote'||p==='quote'){var rec=ap[p+'Rec']||[];var dis=ap[p+'Dis']||'curly';
    h+='<div class="ol-hint">开启后识别双引号并转换显示，防止模型偷用英文引号</div><div class="ol-sub-label">识别（多选）</div><div class="ol-tag-row">'+tagHtml('ol-'+p+'-qrec','curly','\u201C\u201D',rec.indexOf('curly')>=0)+tagHtml('ol-'+p+'-qrec','straight','&quot;&quot;',rec.indexOf('straight')>=0)+tagHtml('ol-'+p+'-qrec','corner','「」',rec.indexOf('corner')>=0)+'</div><div class="ol-sub-label">显示（单选）</div><div class="ol-tag-row">'+tagHtml('ol-'+p+'-qdis','curly','\u201C\u201D',dis==='curly')+tagHtml('ol-'+p+'-qdis','straight','&quot;&quot;',dis==='straight')+tagHtml('ol-'+p+'-qdis','corner','「」',dis==='corner')+'</div>';
  }else if(p==='cParen'||p==='paren'){var rec2=ap[p+'Rec']||[];var dis2=ap[p+'Dis']||'full';
    h+='<div class="ol-sub-label">识别（多选）</div><div class="ol-tag-row">'+tagHtml('ol-'+p+'-prec','full','（…）',rec2.indexOf('full')>=0)+tagHtml('ol-'+p+'-prec','half','(…)',rec2.indexOf('half')>=0)+'</div><div class="ol-sub-label">显示（单选）</div><div class="ol-tag-row">'+tagHtml('ol-'+p+'-pdis','full','（…）',dis2==='full')+tagHtml('ol-'+p+'-pdis','half','(…)',dis2==='half')+'</div><div class="ol-sw-row">隐藏括号 '+swHtml('ol'+p+'Hide',ap[p+'Hide'])+'</div>';
  }else{h+='<div class="ol-sub-label">识别：*…*</div><div class="ol-sw-row">隐藏星号 '+swHtml('ol'+p+'Hide',ap[p+'Hide'])+'</div>';}
  h+='<div class="ol-inline-row"><span>颜色</span><div class="hp-color-dot" id="ol'+p+'Color" data-fk="'+p+'Color"></div></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">字号</span><input type="range" data-fk="'+p+'Size" min="10" max="24" step="0.5" value="'+ap[p+'Size']+'"><span class="hp-slider-val" id="ol'+p+'SizeVal">'+ap[p+'Size']+'px</span></div>'+
    '<div class="hp-slider-row"><span class="hp-slider-label">字重</span><input type="range" data-fk="'+p+'Weight" min="100" max="900" step="100" value="'+ap[p+'Weight']+'"><span class="hp-slider-val" id="ol'+p+'WeightVal">'+ap[p+'Weight']+'</span></div>'+
    '<div class="ol-tag-row"><span class="ol-sub-label" style="margin:0">样式</span>'+tagHtml('ol-'+p+'-style','normal','正常',!ap[p+'Italic'])+tagHtml('ol-'+p+'-style','italic','斜体',ap[p+'Italic'])+'</div>';
  return h;
}

var OfflineUI={
_noScroll:false,
getAp:function(){var OL=App.offline;return OL?gAp(OL.charId):JSON.parse(JSON.stringify(DEF_AP));},

render:function(container,charData){
var c=charData;var dn=c.name||'';var bgUrl=App.LS.get('olBg_'+c.id)||'';var ap=gAp(c.id);

var cAvB='<div class="ol-sw-row">头像 '+swHtml('olcAvShow',ap.cAvShow)+'</div><div class="ol-sw-row">名称 '+swHtml('olcAvNameShow',ap.cAvNameShow)+'</div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">大小</span><input type="range" id="olcAvSize" min="30" max="100" step="2" value="'+ap.cAvSize+'"><span class="hp-slider-val" id="olcAvSizeVal">'+ap.cAvSize+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">角度</span><input type="range" id="olcAvRadius" min="0" max="50" value="'+ap.cAvRadius+'"><span class="hp-slider-val" id="olcAvRadiusVal">'+ap.cAvRadius+'%</span></div>'+
  '<div class="ol-inline-row"><span>框颜色</span><div class="hp-color-dot" id="olcAvFrameColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">框粗</span><input type="range" id="olcAvFrameW" min="0" max="5" step="0.5" value="'+ap.cAvFrameW+'"><span class="hp-slider-val" id="olcAvFrameWVal">'+ap.cAvFrameW+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">名称字号</span><input type="range" id="olcAvNameSize" min="8" max="16" step="0.5" value="'+ap.cAvNameSize+'"><span class="hp-slider-val" id="olcAvNameSizeVal">'+ap.cAvNameSize+'px</span></div>'+
  '<div class="ol-sub-label">位置</div><div class="hp-btn-row"><button class="hp-btn ol-cavpos-btn" data-pos="left">左</button><button class="hp-btn ol-cavpos-btn" data-pos="right">右</button></div>';

var cBubB='<div class="ol-inline-row"><span>背景</span><div class="hp-color-dot" id="olcBubbleBg"></div></div>'+
  '<div class="ol-inline-row"><span>边框色</span><div class="hp-color-dot" id="olcBubbleBorderColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">边框粗</span><input type="range" id="olcBubbleBorderW" min="0" max="5" step="0.5" value="'+ap.cBubbleBorderW+'"><span class="hp-slider-val" id="olcBubbleBorderWVal">'+ap.cBubbleBorderW+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">圆角</span><input type="range" id="olcBubbleRadius" min="0" max="24" value="'+ap.cBubbleRadius+'"><span class="hp-slider-val" id="olcBubbleRadiusVal">'+ap.cBubbleRadius+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">宽度</span><input type="range" id="olcBubbleWidth" min="50" max="100" value="'+ap.cBubbleWidth+'"><span class="hp-slider-val" id="olcBubbleWidthVal">'+ap.cBubbleWidth+'%</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">背景透明</span><input type="range" id="olcBubbleOpacity" min="0" max="100" value="'+ap.cBubbleOpacity+'"><span class="hp-slider-val" id="olcBubbleOpacityVal">'+ap.cBubbleOpacity+'%</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">背景模糊</span><input type="range" id="olcBubbleBlur" min="0" max="30" value="'+ap.cBubbleBlur+'"><span class="hp-slider-val" id="olcBubbleBlurVal">'+ap.cBubbleBlur+'px</span></div>';

var cFontB='<div class="hp-slider-row"><span class="hp-slider-label">字号</span><input type="range" id="olcTextSize" min="10" max="24" step="0.5" value="'+ap.cTextSize+'"><span class="hp-slider-val" id="olcTextSizeVal">'+ap.cTextSize+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">字重</span><input type="range" id="olcTextWeight" min="100" max="900" step="100" value="'+ap.cTextWeight+'"><span class="hp-slider-val" id="olcTextWeightVal">'+ap.cTextWeight+'</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">行高</span><input type="range" id="olcTextLH" min="1.2" max="2.5" step="0.05" value="'+ap.cTextLH+'"><span class="hp-slider-val" id="olcTextLHVal">'+ap.cTextLH+'</span></div>'+
  '<div class="ol-inline-row"><span>颜色</span><div class="hp-color-dot" id="olcTextColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">段落间距</span><input type="range" id="olcParaGap" min="0" max="30" value="'+ap.cParaGap+'"><span class="hp-slider-val" id="olcParaGapVal">'+ap.cParaGap+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">字间距</span><input type="range" id="olcLetterGap" min="0" max="10" step="0.5" value="'+ap.cLetterGap+'"><span class="hp-slider-val" id="olcLetterGapVal">'+ap.cLetterGap+'px</span></div>'+
  '<div class="hp-divider"></div>'+
  '<div class="ol-fmt-section"><div class="ol-sub-title">双引号 '+swHtml('olcQuoteOn',ap.cQuoteOn)+'</div>'+buildFmtUI('cQuote',ap)+'</div><div class="hp-divider"></div>'+
  '<div class="ol-fmt-section"><div class="ol-sub-title">括号 '+swHtml('olcParenOn',ap.cParenOn)+'</div>'+buildFmtUI('cParen',ap)+'</div><div class="hp-divider"></div>'+
  '<div class="ol-fmt-section"><div class="ol-sub-title">星号 '+swHtml('olcStarOn',ap.cStarOn)+'</div>'+buildFmtUI('cStar',ap)+'</div>';

var uAvB='<div class="ol-sw-row">头像 '+swHtml('oluAvShow',ap.uAvShow)+'</div><div class="ol-sw-row">名称 '+swHtml('oluAvNameShow',ap.uAvNameShow)+'</div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">大小</span><input type="range" id="oluAvSize" min="30" max="100" step="2" value="'+ap.uAvSize+'"><span class="hp-slider-val" id="oluAvSizeVal">'+ap.uAvSize+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">角度</span><input type="range" id="oluAvRadius" min="0" max="50" value="'+ap.uAvRadius+'"><span class="hp-slider-val" id="oluAvRadiusVal">'+ap.uAvRadius+'%</span></div>'+
  '<div class="ol-inline-row"><span>框颜色</span><div class="hp-color-dot" id="oluAvFrameColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">框粗</span><input type="range" id="oluAvFrameW" min="0" max="5" step="0.5" value="'+ap.uAvFrameW+'"><span class="hp-slider-val" id="oluAvFrameWVal">'+ap.uAvFrameW+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">名称字号</span><input type="range" id="oluAvNameSize" min="8" max="16" step="0.5" value="'+ap.uAvNameSize+'"><span class="hp-slider-val" id="oluAvNameSizeVal">'+ap.uAvNameSize+'px</span></div>'+
  '<div class="ol-sub-label">位置</div><div class="hp-btn-row"><button class="hp-btn ol-uavpos-btn" data-pos="left">左</button><button class="hp-btn ol-uavpos-btn" data-pos="right">右</button></div>';

var uBubB='<div class="ol-inline-row"><span>背景</span><div class="hp-color-dot" id="oluBubbleBg"></div></div>'+
  '<div class="ol-inline-row"><span>边框色</span><div class="hp-color-dot" id="oluBubbleBorderColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">边框粗</span><input type="range" id="oluBubbleBorderW" min="0" max="5" step="0.5" value="'+ap.uBubbleBorderW+'"><span class="hp-slider-val" id="oluBubbleBorderWVal">'+ap.uBubbleBorderW+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">圆角</span><input type="range" id="oluBubbleRadius" min="0" max="24" value="'+ap.uBubbleRadius+'"><span class="hp-slider-val" id="oluBubbleRadiusVal">'+ap.uBubbleRadius+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">宽度</span><input type="range" id="oluBubbleWidth" min="50" max="100" value="'+ap.uBubbleWidth+'"><span class="hp-slider-val" id="oluBubbleWidthVal">'+ap.uBubbleWidth+'%</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">背景透明</span><input type="range" id="oluBubbleOpacity" min="0" max="100" value="'+ap.uBubbleOpacity+'"><span class="hp-slider-val" id="oluBubbleOpacityVal">'+ap.uBubbleOpacity+'%</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">背景模糊</span><input type="range" id="oluBubbleBlur" min="0" max="30" value="'+ap.uBubbleBlur+'"><span class="hp-slider-val" id="oluBubbleBlurVal">'+ap.uBubbleBlur+'px</span></div>';

var uFontB='<div class="hp-slider-row"><span class="hp-slider-label">字号</span><input type="range" id="oluTextSize" min="10" max="24" step="0.5" value="'+(ap.uTextSize||16)+'"><span class="hp-slider-val" id="oluTextSizeVal">'+(ap.uTextSize||16)+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">字重</span><input type="range" id="oluTextWeight" min="100" max="900" step="100" value="'+(ap.uTextWeight||400)+'"><span class="hp-slider-val" id="oluTextWeightVal">'+(ap.uTextWeight||400)+'</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">行高</span><input type="range" id="oluTextLH" min="1.2" max="2.5" step="0.05" value="'+(ap.uTextLH||1.85)+'"><span class="hp-slider-val" id="oluTextLHVal">'+(ap.uTextLH||1.85)+'</span></div>'+
  '<div class="ol-inline-row"><span>颜色</span><div class="hp-color-dot" id="oluTextColor"></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">段落间距</span><input type="range" id="oluParaGap" min="0" max="30" value="'+ap.uParaGap+'"><span class="hp-slider-val" id="oluParaGapVal">'+ap.uParaGap+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">字间距</span><input type="range" id="oluLetterGap" min="0" max="10" step="0.5" value="'+ap.uLetterGap+'"><span class="hp-slider-val" id="oluLetterGapVal">'+ap.uLetterGap+'px</span></div>'+
  '<div class="hp-divider"></div>'+
  '<div class="ol-fmt-section"><div class="ol-sub-title">双引号 '+swHtml('olquoteOn',ap.quoteOn)+'</div>'+buildFmtUI('quote',ap)+'</div><div class="hp-divider"></div>'+
  '<div class="ol-fmt-section"><div class="ol-sub-title">括号 '+swHtml('olparenOn',ap.parenOn)+'</div>'+buildFmtUI('paren',ap)+'</div><div class="hp-divider"></div>'+
  '<div class="ol-fmt-section"><div class="ol-sub-title">星号 '+swHtml('olstarOn',ap.starOn)+'</div>'+buildFmtUI('star',ap)+'</div>';

container.innerHTML=
'<div class="ol-root" id="olRoot"><div class="ol-bg" id="olBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');filter:blur('+ap.bgBlur+'px) brightness('+(100-ap.bgDark)+'%);background-size:'+(ap.bgFit||'contain')+';':'')+'"></div>'+
'<div class="ol-hd"><div class="ol-hd-name" id="olName">'+App.esc(dn)+'</div></div>'+
'<div class="ol-msgs" id="olMsgs"></div>'+
'<div class="ol-plus-panel" id="olPlusPanel"><div class="ol-plus-item" id="olPiPhoto"><div class="ol-plus-icon"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div><div class="ol-plus-label">图片</div></div></div>'+
'<div class="ol-input-wrap" id="olInputWrap"><button class="ol-outer-btn" id="olPanelBtn" type="button">'+MENU_SVG+'</button><div class="ol-input-box" id="olInputBox"><button class="ol-inner-btn" id="olPlusBtn" type="button">'+CLOUD_SVG+'</button><textarea class="ol-input" id="olInput" placeholder="输入内容..." rows="1"></textarea></div><button class="ol-outer-btn ol-btn-robot" id="olAiBtn" type="button">'+ROBOT_SVG+'</button></div>'+
'<div id="olSettingsPanel" class="half-panel hidden"><div class="hp-handle"></div><div class="hp-header"><h2>设置</h2><button class="hp-close" id="olPanelClose" type="button"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div><div class="hp-body">'+
  '<div class="hp-btn-row"><button class="hp-btn" id="olSbScene">编辑场景</button><button class="hp-btn" id="olSbBg">上传背景图</button></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">虚化</span><input type="range" id="olBgBlur" min="0" max="30" value="'+ap.bgBlur+'"><span class="hp-slider-val" id="olBgBlurVal">'+ap.bgBlur+'px</span></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">暗度</span><input type="range" id="olBgDark" min="0" max="80" value="'+ap.bgDark+'"><span class="hp-slider-val" id="olBgDarkVal">'+ap.bgDark+'%</span></div>'+
  '<div class="ol-sub-label">背景填充</div><div class="hp-btn-row"><button class="hp-btn ol-bgfit-btn" data-fit="contain">完整</button><button class="hp-btn ol-bgfit-btn" data-fit="cover">铺满</button><button class="hp-btn ol-bgfit-btn" data-fit="100% 100%">拉伸</button></div>'+
  '<div class="hp-divider"></div><div class="hp-section-label">聊天设置</div>'+
  '<div class="ol-sw-row">人称称呼 '+swHtml('olPovOn',ap.povOn)+'</div>'+
  '<div id="olPovSub" style="'+(ap.povOn?'':'display:none;')+'"><div class="ol-sub-label">称呼用户</div><div class="hp-btn-row"><button class="hp-btn ol-povu-btn" data-pov="first">我</button><button class="hp-btn ol-povu-btn" data-pov="second">你</button><button class="hp-btn ol-povu-btn" data-pov="third">他/她</button></div><div class="ol-sub-label">称呼角色</div><div class="hp-btn-row"><button class="hp-btn ol-povc-btn" data-pov="first">我</button><button class="hp-btn ol-povc-btn" data-pov="second">你</button><button class="hp-btn ol-povc-btn" data-pov="third">他/她</button></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label" style="width:60px">期望字数</span><input type="number" id="olWordCount" placeholder="留空不限" value="'+(ap.wordCount||'')+'"></div>'+
  '<div class="hp-divider"></div><div class="hp-section-label">外观</div>'+
  '<div class="ol-color-grid" style="grid-template-columns:repeat(3,1fr)"><div class="ol-color-item"><div class="hp-color-dot" id="olPageBg"></div><span>页面背景</span></div><div class="ol-color-item"><div class="hp-color-dot" id="olBarBg"></div><span>底栏底色</span></div><div class="ol-color-item"><div class="hp-color-dot" id="olBarBorderColor"></div><span>底栏边框</span></div></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">底栏透明</span><input type="range" id="olBarOpacity" min="0" max="100" value="'+ap.barOpacity+'"><span class="hp-slider-val" id="olBarOpacityVal">'+ap.barOpacity+'%</span></div>'+
  '<div class="hp-divider"></div>'+
  '<div class="hp-btn-row"><button class="hp-btn ol-mode-btn" data-mode="bubble">气泡模式</button><button class="hp-btn ol-mode-btn" data-mode="parallel">全屏模式</button></div>'+
  '<div class="hp-slider-row"><span class="hp-slider-label">消息间距</span><input type="range" id="olBlockGap" min="0" max="40" value="'+ap.blockGap+'"><span class="hp-slider-val" id="olBlockGapVal">'+ap.blockGap+'px</span></div>'+
  '<div class="hp-divider"></div><div class="ol-sub-title">角色板块</div>'+foldHtml('olFoldCav','头像',cAvB)+foldHtml('olFoldCbub','气泡',cBubB)+foldHtml('olFoldCfont','字体',cFontB)+
  '<div class="hp-divider"></div><div class="ol-sub-title">用户板块</div>'+foldHtml('olFoldUav','头像',uAvB)+foldHtml('olFoldUbub','气泡',uBubB)+foldHtml('olFoldUfont','字体',uFontB)+
  '<div class="hp-divider"></div><div class="hp-btn-row"><button class="hp-btn hp-btn-danger" id="olStyleReset">重置全部外观</button></div>'+
  '<div class="hp-divider"></div><div class="hp-section-label">高级</div><div class="hp-btn-row"><button class="hp-btn" id="olSbCode">自定义UI</button></div><div class="hp-bottom-spacer"></div>'+
'</div></div></div>';
OfflineUI.applyAppearance(c.id);OfflineUI.applyCustomCode(c.id);
},

_hexToRgb:function(hex){if(!hex||hex.indexOf('gradient')>=0)return '255,255,255';hex=hex.replace('#','');if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];if(hex.length!==6)return '255,255,255';return parseInt(hex.substr(0,2),16)+','+parseInt(hex.substr(2,2),16)+','+parseInt(hex.substr(4,2),16);},

applyAppearance:function(cid){
var ap=gAp(cid);var r=App.$('#olRoot');if(!r)return;
r.style.setProperty('--ol-bg-color',ap.pageBg);
r.style.setProperty('--ol-text-size',ap.textSize+'px');r.style.setProperty('--ol-text-line-height',String(ap.textLH));r.style.setProperty('--ol-text-color',ap.textColor);r.style.setProperty('--ol-text-weight',String(ap.textWeight));
r.style.setProperty('--ol-c-av-size',ap.cAvSize+'px');r.style.setProperty('--ol-c-av-radius',ap.cAvRadius+'%');r.style.setProperty('--ol-c-av-frame-color',ap.cAvFrameColor);r.style.setProperty('--ol-c-av-frame-w',ap.cAvFrameW+'px');r.style.setProperty('--ol-c-av-name-size',ap.cAvNameSize+'px');r.style.setProperty('--ol-c-av-show',ap.cAvShow?'flex':'none');r.style.setProperty('--ol-c-av-name-show',ap.cAvNameShow?'block':'none');
r.style.setProperty('--ol-c-bubble-radius',ap.cBubbleRadius+'px');r.style.setProperty('--ol-c-bubble-border-color',ap.cBubbleBorderColor);r.style.setProperty('--ol-c-bubble-border-w',ap.cBubbleBorderW+'px');r.style.setProperty('--ol-c-bubble-width',ap.cBubbleWidth+'%');
r.style.setProperty('--ol-c-text-size',ap.cTextSize+'px');r.style.setProperty('--ol-c-text-weight',String(ap.cTextWeight));r.style.setProperty('--ol-c-text-lh',String(ap.cTextLH));r.style.setProperty('--ol-c-text-color',ap.cTextColor);
r.style.setProperty('--ol-u-av-size',ap.uAvSize+'px');r.style.setProperty('--ol-u-av-radius',ap.uAvRadius+'%');r.style.setProperty('--ol-u-av-frame-color',ap.uAvFrameColor);r.style.setProperty('--ol-u-av-frame-w',ap.uAvFrameW+'px');r.style.setProperty('--ol-u-av-name-size',ap.uAvNameSize+'px');r.style.setProperty('--ol-u-av-show',ap.uAvShow?'flex':'none');r.style.setProperty('--ol-u-av-name-show',ap.uAvNameShow?'block':'none');
r.style.setProperty('--ol-u-bubble-radius',ap.uBubbleRadius+'px');r.style.setProperty('--ol-u-bubble-border-color',ap.uBubbleBorderColor);r.style.setProperty('--ol-u-bubble-border-w',ap.uBubbleBorderW+'px');r.style.setProperty('--ol-u-bubble-width',ap.uBubbleWidth+'%');
r.style.setProperty('--ol-block-gap',ap.blockGap+'px');
if(ap.mode==='parallel')r.classList.add('ol-parallel');else r.classList.remove('ol-parallel');
var wrap=App.$('#olInputWrap');
if(wrap){var bv=ap.barBg;var alpha=(ap.barOpacity!=null?ap.barOpacity:100)/100;
  if(bv.indexOf('gradient')>=0){wrap.style.background=bv;wrap.style.opacity=String(alpha);}
  else{wrap.style.background=hexToRgba(bv,alpha);wrap.style.opacity='';}
  wrap.style.backdropFilter='blur('+ap.barBlur+'px)';wrap.style.webkitBackdropFilter='blur('+ap.barBlur+'px)';wrap.style.borderTopColor=ap.barBorderColor;
  wrap.querySelectorAll('.ol-outer-btn svg *,.ol-inner-btn svg *').forEach(function(el){if(el.getAttribute('stroke')&&el.getAttribute('stroke')!=='white'&&el.getAttribute('stroke')!=='none')el.setAttribute('stroke',ap.barBorderColor);if(el.getAttribute('fill')&&el.getAttribute('fill')!=='white'&&el.getAttribute('fill')!=='none')el.setAttribute('fill',ap.barBorderColor);});
  var box=App.$('#olInputBox');if(box){box.style.borderColor=ap.barBorderColor;box.style.background=hexToRgba(ap.barBg==='#ffffff'?'#ffffff':ap.barBg,alpha);}}
var bg=App.$('#olBg');if(bg&&App.LS.get('olBg_'+cid)){bg.style.filter='blur('+ap.bgBlur+'px) brightness('+(100-ap.bgDark)+'%)';bg.style.backgroundSize=ap.bgFit||'contain';}
},

formatProse:function(raw,cid,isUser){
  var ap=cid?gAp(cid):JSON.parse(JSON.stringify(DEF_AP));
  var text=raw||'';var tokens=[];
  function protect(h){var i=tokens.length;tokens.push(h);return '\x00P'+i+'P\x00';}
  function fs(content,color,size,weight,italic){return '<span style="color:'+color+' !important;font-size:'+size+'px !important;font-weight:'+weight+' !important;font-style:'+(italic?'italic':'normal')+' !important;">'+content+'</span>';}
  function doStar(p){if(!ap[p+'On'])return;text=text.replace(/(?:\*|＊)([^*＊]+)(?:\*|＊)/g,function(_,g){var inner=ap[p+'Hide']?App.esc(g):('*'+App.esc(g)+'*');return protect(fs(inner,ap[p+'Color'],ap[p+'Size'],ap[p+'Weight'],ap[p+'Italic']));});}
  function doQuote(p){if(!ap[p+'On'])return;var qMap={curly:['\u201C','\u201D'],straight:['"','"'],corner:['「','」']};var dq=qMap[ap[p+'Dis']]||qMap.curly;var rec=ap[p+'Rec']||[];var pairs=[];if(rec.indexOf('curly')>=0)pairs.push(['\u201C','\u201D']);if(rec.indexOf('straight')>=0)pairs.push(['"','"']);if(rec.indexOf('corner')>=0)pairs.push(['「','」']);pairs.forEach(function(pr){var re=new RegExp(escRe(pr[0])+'([^'+escRe(pr[1])+']+)'+escRe(pr[1]),'g');text=text.replace(re,function(_,g){return protect(fs(App.esc(dq[0])+App.esc(g)+App.esc(dq[1]),ap[p+'Color'],ap[p+'Size'],ap[p+'Weight'],ap[p+'Italic']));});});}
  function doParen(p){if(!ap[p+'On'])return;var pMap={full:['（','）'],half:['(',')']};var dp=pMap[ap[p+'Dis']]||pMap.full;var rec=ap[p+'Rec']||[];var pp=[];if(rec.indexOf('full')>=0)pp.push(['（','）']);if(rec.indexOf('half')>=0)pp.push(['(',')']);pp.forEach(function(pr){var re=new RegExp(escRe(pr[0])+'([^'+escRe(pr[1])+']+)'+escRe(pr[1]),'g');text=text.replace(re,function(_,g){var inner=ap[p+'Hide']?App.esc(g):(App.esc(dp[0])+App.esc(g)+App.esc(dp[1]));return protect(fs(inner,ap[p+'Color'],ap[p+'Size'],ap[p+'Weight'],ap[p+'Italic']));});});}
  if(isUser){doStar('star');doQuote('quote');doParen('paren');}
  else{doStar('cStar');doQuote('cQuote');doParen('cParen');}
  var parts=text.split(/\x00P(\d+)P\x00/);var result='';
  for(var i=0;i<parts.length;i++){if(i%2===0)result+=App.esc(parts[i]);else result+=tokens[parseInt(parts[i])];}
  return result;
},

renderMessages:function(){
var OL=App.offline;if(!OL)return;var container=App.$('#olMsgs');if(!container)return;
var c=OL.charData;var user=App.user?App.user.getActiveUser():null;var ap=gAp(OL.charId);
var cAv=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
var uAv=user&&user.avatar?'<img src="'+App.escAttr(user.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
if(!OL.messages.length){container.innerHTML='<div class="ol-empty">开始你们的故事吧</div>';return;}
var html='';var floor=0;
OL.messages.forEach(function(msg,idx){
  if(msg.role==='system')return;floor++;var isU=msg.role==='user';
  var cc=(msg.content||'').length;var tk=Math.round(cc/2);var tkS=tk>=1000?(tk/1000).toFixed(1)+'k':tk+'';
  var ts=msg.ts?OfflineUI.fmtTime(msg.ts):'';
  var raw=(msg.content||'').trim();if(!raw)return;
  var parsed=OfflineUI.parseThinking(raw);var text=parsed.main;
  var thinkH=(!isU&&parsed.think)?OfflineUI.buildThinkHtml(parsed.think):'';
  var avH=isU?uAv:cAv;var avN=isU?App.esc((user&&(user.nickname||user.realName))||'你'):App.esc(c.name||'');
  var formatted=OfflineUI.formatProse(text,OL.charId,isU);
  var avPos=isU?ap.uAvPos:ap.cAvPos;
  /* ★ 段落间距：把 \n\n 替换成间距块 */
  var paraGap=isU?(ap.uParaGap||10):(ap.cParaGap||10);
  var letterGap=isU?(ap.uLetterGap||0):(ap.cLetterGap||0);
  formatted=formatted.replace(/\n/g,'<div class="ol-pgap" style="height:'+paraGap+'px;"></div>');
  /* ★ 气泡背景：独立层，透明度只影响背景 */
  var bubBg=isU?ap.uBubbleBg:ap.cBubbleBg;
  var bubOp=(isU?ap.uBubbleOpacity:ap.cBubbleOpacity);
  var bubBlur=isU?ap.uBubbleBlur:ap.cBubbleBlur;
  var bgAlpha=(bubOp!=null?bubOp:100)/100;
  var blurS=(bubBlur>0)?'backdrop-filter:blur('+bubBlur+'px);-webkit-backdrop-filter:blur('+bubBlur+'px);':'';
  var bgStyle='background:'+hexToRgba(bubBg,bgAlpha)+';'+blurS;
  var meta='<div class="ol-scatter-meta"><span class="ol-scatter-floor">#'+String(floor).padStart(3,'0')+'</span><span class="ol-scatter-tokens">'+tkS+' tk</span><span class="ol-scatter-time">'+ts+'</span><span class="ol-scatter-chars">'+cc+'字</span></div>';
  var textStyle='letter-spacing:'+letterGap+'px;';
  html+='<div class="ol-block'+(isU?' is-user':' is-char')+' ol-av-'+avPos+'" data-msg-idx="'+idx+'"><div class="ol-avatar-area"><div class="ol-avatar-frame"><div class="ol-avatar">'+avH+'</div></div><div class="ol-avatar-name">'+avN+'</div></div><div class="ol-bubble-col"><div class="ol-frame-mid"><div class="ol-bub-bg" style="'+bgStyle+'"></div><div class="ol-bubble-inner">'+thinkH+'<div class="ol-bubble-text" style="'+textStyle+'">'+formatted+'</div></div></div>'+meta+'</div></div>';
});
if(OL.isStreaming&&!OL._backgroundMode){html+='<div class="ol-block is-char ol-av-'+ap.cAvPos+'" id="olStreamProse"><div class="ol-avatar-area"><div class="ol-avatar-frame"><div class="ol-avatar">'+cAv+'</div></div></div><div class="ol-bubble-col"><div class="ol-frame-mid"><div class="ol-bub-bg" style="background:'+hexToRgba(ap.cBubbleBg,(ap.cBubbleOpacity||100)/100)+'"></div><div class="ol-bubble-inner"><div class="ol-bubble-text" id="olStreamBubble"><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span><span class="ol-typing-dot"></span></div></div></div></div></div>';}
container.innerHTML=html;if(!OfflineUI._noScroll)OfflineUI.scrollBottom();OfflineUI._noScroll=false;
},

parseThinking:function(t){var th='',m=t;var r=t.match(/<think>([\s\S]*?)<\/think>/i);if(r){th=r[1].trim();m=t.replace(/<think>[\s\S]*?<\/think>/gi,'').trim();}if(!r){var o=t.match(/<think>([\s\S]*)$/i);if(o){th=o[1].trim();m=t.replace(/<think>[\s\S]*$/i,'').trim();}}return{think:th,main:m};},
buildThinkHtml:function(t){return '<details class="ol-think-block"><summary class="ol-think-summary">💭 思维过程</summary><div class="ol-think-body">'+App.esc(t)+'</div></details>';},
fmtTime:function(ts){var d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');},
scrollBottom:function(){var el=App.$('#olMsgs');if(el)requestAnimationFrame(function(){el.scrollTop=el.scrollHeight;});},
updateAiBtn:function(){var OL=App.offline;if(!OL)return;var btn=App.$('#olAiBtn');if(!btn)return;if(OL.isStreaming){btn.innerHTML=STOP_SVG;btn.classList.add('ol-btn-stop');btn.classList.remove('ol-btn-robot');}else{btn.innerHTML=ROBOT_SVG;btn.classList.remove('ol-btn-stop');btn.classList.add('ol-btn-robot');}},
updateTyping:function(show){var OL=App.offline;if(!OL)return;var el=App.$('#olName');if(!el)return;var dn=OL.charData?OL.charData.name:'';if(show)el.innerHTML=App.esc(dn)+'<span class="ol-hd-typing">正在书写...</span>';else el.textContent=dn;},
_closePanel:function(){var p=App.$('#olSettingsPanel');if(p){p.classList.remove('show');setTimeout(function(){p.classList.add('hidden');},350);}},

bindEvents:function(){
var OL=App.offline;if(!OL)return;var root=App.$('#olRoot');var panel=App.$('#olSettingsPanel');var cid=OL.charId;var ap=gAp(cid);
function save(){sAp(cid,ap);OfflineUI.applyAppearance(cid);}
function sr(){save();OfflineUI._noScroll=true;OfflineUI.renderMessages();}
function sa(btns,btn){btns.forEach(function(b){b.classList.remove('hp-btn-primary');});btn.classList.add('hp-btn-primary');}

var _sw={a:false,sx:0,sy:0,lk:false,d:''};
if(root){root.addEventListener('touchstart',function(e){var t=e.touches[0];if(t.clientX-root.getBoundingClientRect().left>50)return;_sw={a:true,sx:t.clientX,sy:t.clientY,lk:false,d:''};},{passive:true});root.addEventListener('touchmove',function(e){if(!_sw.a)return;var t=e.touches[0],dx=t.clientX-_sw.sx,dy=t.clientY-_sw.sy;if(!_sw.lk){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;_sw.lk=true;_sw.d=Math.abs(dx)>Math.abs(dy)?'h':'v';}if(_sw.d==='h'&&dx>0){e.preventDefault();root.style.transform='translateX('+Math.min(dx,root.offsetWidth)+'px)';root.style.opacity=String(1-dx/root.offsetWidth*.5);}},{passive:false});root.addEventListener('touchend',function(e){if(!_sw.a)return;_sw.a=false;if(_sw.d!=='h'){root.style.transform='';root.style.opacity='';return;}var dx=e.changedTouches[0].clientX-_sw.sx;if(dx>root.offsetWidth*.3){root.style.transition='transform .25s,opacity .25s';root.style.transform='translateX(100%)';root.style.opacity='0';setTimeout(function(){root.style.transition='';root.style.transform='';root.style.opacity='';OL.close();},260);}else{root.style.transition='transform .2s,opacity .2s';root.style.transform='';root.style.opacity='';setTimeout(function(){root.style.transition='';},220);}},{passive:true});}

App.safeOn('#olPanelBtn','click',function(e){e.stopPropagation();if(panel){panel.classList.remove('hidden');requestAnimationFrame(function(){panel.classList.add('show');});}});
App.safeOn('#olPanelClose','click',function(){OfflineUI._closePanel();});
var input=App.$('#olInput');if(input){input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();OL.sendUser();}});}
App.safeOn('#olAiBtn','click',function(e){e.stopPropagation();if(OL.isStreaming){OL.stopStream();return;}var inp=App.$('#olInput');var t=inp?inp.value.trim():'';if(t){OL.sendUser();return;}OL.requestAI();});
App.safeOn('#olPlusBtn','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(!pp)return;OL._plusOpen=!OL._plusOpen;if(OL._plusOpen)pp.classList.add('show');else pp.classList.remove('show');});
App.safeOn('#olPiPhoto','click',function(e){e.stopPropagation();var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');OL._plusOpen=false;}App.showToast('图片 · 开发中');});
App.$$('.ol-fold-head').forEach(function(h){h.addEventListener('click',function(){h.parentElement.classList.toggle('open');});});

/* switches */
var swMap={'olPovOn':'povOn','olcAvShow':'cAvShow','olcAvNameShow':'cAvNameShow','oluAvShow':'uAvShow','oluAvNameShow':'uAvNameShow','olcQuoteOn':'cQuoteOn','olcParenOn':'cParenOn','olcStarOn':'cStarOn','olcParenHide':'cParenHide','olcStarHide':'cStarHide','olquoteOn':'quoteOn','olparenOn':'parenOn','olstarOn':'starOn','olparenHide':'parenHide','olstarHide':'starHide'};
App.$$('.ol-sw-track').forEach(function(sw){sw.addEventListener('click',function(e){e.stopPropagation();sw.classList.toggle('on');var id=sw.parentElement.id;var on=sw.classList.contains('on');if(swMap[id]){ap[swMap[id]]=on;if(id==='olPovOn'){var sub=App.$('#olPovSub');if(sub)sub.style.display=on?'':'none';}sr();}else save();});});

/* sliders */
var sls=[
  {id:'olBgBlur',k:'bgBlur',u:'px'},{id:'olBgDark',k:'bgDark',u:'%'},{id:'olBarOpacity',k:'barOpacity',u:'%'},{id:'olBlockGap',k:'blockGap',u:'px'},
  {id:'olcAvSize',k:'cAvSize',u:'px'},{id:'olcAvRadius',k:'cAvRadius',u:'%'},{id:'olcAvFrameW',k:'cAvFrameW',u:'px'},{id:'olcAvNameSize',k:'cAvNameSize',u:'px'},
  {id:'olcBubbleRadius',k:'cBubbleRadius',u:'px'},{id:'olcBubbleBorderW',k:'cBubbleBorderW',u:'px'},{id:'olcBubbleWidth',k:'cBubbleWidth',u:'%'},{id:'olcBubbleOpacity',k:'cBubbleOpacity',u:'%'},{id:'olcBubbleBlur',k:'cBubbleBlur',u:'px'},
  {id:'olcTextSize',k:'cTextSize',u:'px'},{id:'olcTextWeight',k:'cTextWeight',u:''},{id:'olcTextLH',k:'cTextLH',u:''},{id:'olcParaGap',k:'cParaGap',u:'px'},{id:'olcLetterGap',k:'cLetterGap',u:'px'},
  {id:'oluAvSize',k:'uAvSize',u:'px'},{id:'oluAvRadius',k:'uAvRadius',u:'%'},{id:'oluAvFrameW',k:'uAvFrameW',u:'px'},{id:'oluAvNameSize',k:'uAvNameSize',u:'px'},
  {id:'oluBubbleRadius',k:'uBubbleRadius',u:'px'},{id:'oluBubbleBorderW',k:'uBubbleBorderW',u:'px'},{id:'oluBubbleWidth',k:'uBubbleWidth',u:'%'},{id:'oluBubbleOpacity',k:'uBubbleOpacity',u:'%'},{id:'oluBubbleBlur',k:'uBubbleBlur',u:'px'},
  {id:'oluTextSize',k:'uTextSize',u:'px'},{id:'oluTextWeight',k:'uTextWeight',u:''},{id:'oluTextLH',k:'uTextLH',u:''},{id:'oluParaGap',k:'uParaGap',u:'px'},{id:'oluLetterGap',k:'uLetterGap',u:'px'}
];
sls.forEach(function(s){var sl=App.$('#'+s.id);var val=App.$('#'+s.id+'Val');if(!sl||!val)return;sl.addEventListener('input',function(){var v=parseFloat(this.value);val.textContent=v+s.u;ap[s.k]=v;sr();});});

/* fmt sliders + colors via data-fk */
App.$$('[data-fk]').forEach(function(el){var k=el.dataset.fk;
  if(el.tagName==='INPUT'&&el.type==='range'){var valEl=App.$('#ol'+k+'Val');el.addEventListener('input',function(){var v=parseFloat(this.value);if(valEl)valEl.textContent=v+(k.indexOf('Weight')>=0?'':'px');ap[k]=v;sr();});}
  if(el.classList.contains('hp-color-dot')){el.style.background=ap[k];el.addEventListener('click',function(e){e.stopPropagation();if(!App.openColorPicker)return;App.openColorPicker(ap[k],function(hex){el.style.background=hex;ap[k]=hex;sr();},function(hex){el.style.background=hex;ap[k]=hex;sAp(cid,ap);OfflineUI._noScroll=true;OfflineUI.renderMessages();},'ol_'+k);});}
});

/* colors */
function bc(id,key){var dot=App.$('#'+id);if(!dot)return;dot.style.background=ap[key]||'#fff';dot.addEventListener('click',function(e){e.stopPropagation();if(!App.openColorPicker)return;App.openColorPicker(ap[key]||'#fff',function(hex){dot.style.background=hex;ap[key]=hex;sr();},function(hex){dot.style.background=hex;ap[key]=hex;sAp(cid,ap);OfflineUI.applyAppearance(cid);},'ol_'+key);});}
bc('olPageBg','pageBg');bc('olBarBg','barBg');bc('olBarBorderColor','barBorderColor');
bc('olcAvFrameColor','cAvFrameColor');bc('olcBubbleBg','cBubbleBg');bc('olcBubbleBorderColor','cBubbleBorderColor');bc('olcTextColor','cTextColor');
bc('oluAvFrameColor','uAvFrameColor');bc('oluBubbleBg','uBubbleBg');bc('oluBubbleBorderColor','uBubbleBorderColor');bc('oluTextColor','uTextColor');

App.$$('.ol-povu-btn').forEach(function(b){if(b.dataset.pov===ap.povUser)b.classList.add('hp-btn-primary');b.addEventListener('click',function(){sa(Array.from(App.$$('.ol-povu-btn')),b);ap.povUser=b.dataset.pov;save();});});
App.$$('.ol-povc-btn').forEach(function(b){if(b.dataset.pov===ap.povChar)b.classList.add('hp-btn-primary');b.addEventListener('click',function(){sa(Array.from(App.$$('.ol-povc-btn')),b);ap.povChar=b.dataset.pov;save();});});
var wc=App.$('#olWordCount');if(wc)wc.addEventListener('change',function(){ap.wordCount=parseInt(this.value)||0;save();});
App.$$('.ol-mode-btn').forEach(function(b){if(b.dataset.mode===ap.mode)b.classList.add('hp-btn-primary');b.addEventListener('click',function(){sa(Array.from(App.$$('.ol-mode-btn')),b);ap.mode=b.dataset.mode;sr();});});
App.$$('.ol-bgfit-btn').forEach(function(b){if(b.dataset.fit===ap.bgFit)b.classList.add('hp-btn-primary');b.addEventListener('click',function(){sa(Array.from(App.$$('.ol-bgfit-btn')),b);ap.bgFit=b.dataset.fit;save();});});
App.$$('.ol-cavpos-btn').forEach(function(b){if(b.dataset.pos===ap.cAvPos)b.classList.add('hp-btn-primary');b.addEventListener('click',function(){sa(Array.from(App.$$('.ol-cavpos-btn')),b);ap.cAvPos=b.dataset.pos;sr();});});
App.$$('.ol-uavpos-btn').forEach(function(b){if(b.dataset.pos===ap.uAvPos)b.classList.add('hp-btn-primary');b.addEventListener('click',function(){sa(Array.from(App.$$('.ol-uavpos-btn')),b);ap.uAvPos=b.dataset.pos;sr();});});

function bmt(cls,k){App.$$(cls).forEach(function(t){t.addEventListener('click',function(){t.classList.toggle('active');ap[k]=[];App.$$(cls+'.active').forEach(function(x){ap[k].push(x.dataset.val);});sr();});});}
bmt('.ol-cQuote-qrec','cQuoteRec');bmt('.ol-cParen-prec','cParenRec');bmt('.ol-quote-qrec','quoteRec');bmt('.ol-paren-prec','parenRec');
function bst(cls,k){App.$$(cls).forEach(function(t){t.addEventListener('click',function(){App.$$(cls).forEach(function(x){x.classList.remove('active');});t.classList.add('active');ap[k]=t.dataset.val;sr();});});}
bst('.ol-cQuote-qdis','cQuoteDis');bst('.ol-cParen-pdis','cParenDis');bst('.ol-quote-qdis','quoteDis');bst('.ol-paren-pdis','parenDis');
['cQuote','cParen','cStar','quote','paren','star'].forEach(function(p){App.$$('.ol-'+p+'-style').forEach(function(t){t.addEventListener('click',function(){App.$$('.ol-'+p+'-style').forEach(function(x){x.classList.remove('active');});t.classList.add('active');ap[p+'Italic']=t.dataset.val==='italic';sr();});});});

App.safeOn('#olSbScene','click',function(){OfflineUI.showSceneDialog();});
App.safeOn('#olSbBg','click',function(){OfflineUI.showBgMenu();});
App.safeOn('#olSbCode','click',function(){OfflineUI._closePanel();OfflineUI.openCodeEditor();});
App.safeOn('#olStyleReset','click',function(){App.LS.remove('olAp_'+cid);ap=JSON.parse(JSON.stringify(DEF_AP));sAp(cid,ap);OfflineUI.applyAppearance(cid);OfflineUI._noScroll=true;OfflineUI.renderMessages();App.showToast('已重置');});

/* ★ 长按菜单 */
var mc=App.$('#olMsgs');
if(mc){var lt=null,lT=null,mv=false;
  mc.addEventListener('touchstart',function(e){var b=e.target.closest('.ol-block');if(!b)return;mv=false;var t=e.touches[0];lT={el:b,x:t.clientX,y:t.clientY};lt=setTimeout(function(){if(lT&&!mv){if(navigator.vibrate)navigator.vibrate(15);OfflineUI.showCtxMenu(lT.el,lT.x,lT.y);}},500);},{passive:true});
  mc.addEventListener('touchmove',function(e){if(lt){var t=e.touches[0];if(lT&&(Math.abs(t.clientX-lT.x)>8||Math.abs(t.clientY-lT.y)>8)){mv=true;clearTimeout(lt);lT=null;}}},{passive:true});
  mc.addEventListener('touchend',function(){clearTimeout(lt);lT=null;},{passive:true});
}
if(root){root.addEventListener('click',function(){OL.dismissCtx();var pp=App.$('#olPlusPanel');if(pp&&OL._plusOpen){pp.classList.remove('show');OL._plusOpen=false;}});}
},

showCtxMenu:function(el,x,y){var OL=App.offline;if(!OL)return;OL.dismissCtx();var idx=parseInt(el.dataset.msgIdx);if(isNaN(idx))return;var msg=OL.messages[idx];if(!msg)return;var isU=msg.role==='user';var menu=document.createElement('div');menu.className='ol-ctx';var it='';it+='<div class="ol-ctx-item" data-act="copy">'+CTX_ICONS.copy+'<span>复制</span></div>';it+='<div class="ol-ctx-item" data-act="edit">'+CTX_ICONS.edit+'<span>编辑</span></div>';if(!isU)it+='<div class="ol-ctx-item" data-act="regen">'+CTX_ICONS.regen+'<span>重写</span></div>';it+='<div class="ol-ctx-item" data-act="del">'+CTX_ICONS.del+'<span>删除</span></div>';it+='<div class="ol-ctx-item" data-act="delafter">'+CTX_ICONS.delafter+'<span>往后全删</span></div>';menu.innerHTML=it;var left=Math.max(8,Math.min(x-125,window.innerWidth-258));var top=y-80;if(top<60)top=y+10;menu.style.left=left+'px';menu.style.top=top+'px';document.body.appendChild(menu);OL._ctxMenu=menu;menu.querySelectorAll('.ol-ctx-item').forEach(function(item){item.addEventListener('click',function(e){e.stopPropagation();var act=item.dataset.act;OL.dismissCtx();if(act==='copy')App.copyText(msg.content).then(function(){App.showToast('已复制');});else if(act==='edit')OfflineUI.showEditDialog(idx);else if(act==='del'){OL.messages.splice(idx,1);OL.saveMsgs();OfflineUI.renderMessages();}else if(act==='delafter'){if(!confirm('删除此条及之后？'))return;OL.messages.splice(idx);OL.saveMsgs();OfflineUI.renderMessages();}else if(act==='regen'){OL.messages.splice(idx);OL.saveMsgs();OfflineUI.renderMessages();OL.requestAI();}});});},
showEditDialog:function(idx){var OL=App.offline;if(!OL)return;var msg=OL.messages[idx];if(!msg)return;var ov=document.createElement('div');ov.className='pc-edit-overlay';ov.style.zIndex='100060';ov.innerHTML='<div class="pc-edit-panel" style="width:320px;max-height:70vh;overflow-y:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)"><div class="pc-header">编辑<div class="pc-close-btn" id="olEdX">×</div></div><div class="pc-body"><textarea class="pc-input" id="olEdTA" style="min-height:120px;resize:vertical">'+App.esc(msg.content)+'</textarea></div><div class="pc-footer"><button class="pc-btn pc-btn-save" id="olEdSave" type="button">保存</button><button class="pc-btn pc-btn-cancel" id="olEdNo" type="button">取消</button></div></div>';document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});ov.querySelector('#olEdX').addEventListener('click',function(){ov.remove();});ov.querySelector('#olEdNo').addEventListener('click',function(){ov.remove();});ov.querySelector('#olEdSave').addEventListener('click',function(){var v=ov.querySelector('#olEdTA').value.trim();if(!v){App.showToast('不能为空');return;}OL.messages[idx].content=v;OL.saveMsgs();OfflineUI.renderMessages();ov.remove();});},
showSceneDialog:function(){var OL=App.offline;if(!OL)return;var cur=App.LS.get('olScene_'+OL.charId)||'';var ov=document.createElement('div');ov.className='pc-edit-overlay';ov.style.zIndex='100060';ov.innerHTML='<div class="pc-edit-panel" style="width:340px;max-height:75vh;overflow-y:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)"><div class="pc-header">场景 / 时间线<div class="pc-close-btn" id="olScX">×</div></div><div class="pc-body"><div style="font-size:13px;color:#1a1a1a;margin-bottom:8px;line-height:1.5;">描述当前的时间、地点、剧情背景等。每次发送消息时自动附带给AI。留空则不启用。</div><textarea class="pc-input" id="olScTA" style="min-height:200px;resize:vertical" placeholder="例如：暴风雨之夜，你们被困在山中的一间木屋里。外面电闪雷鸣，屋内只有一盏摇曳的油灯。角色刚从昏迷中醒来，发现自己的记忆出现了空白...">'+App.esc(cur)+'</textarea></div><div class="pc-footer"><button class="pc-btn pc-btn-save" id="olScSave" type="button">保存</button><button class="pc-btn pc-btn-cancel" id="olScClr" type="button">清空</button></div></div>';document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});ov.querySelector('#olScX').addEventListener('click',function(){ov.remove();});ov.querySelector('#olScSave').addEventListener('click',function(){var v=ov.querySelector('#olScTA').value.trim();if(v)App.LS.set('olScene_'+OL.charId,v);else App.LS.remove('olScene_'+OL.charId);ov.remove();App.showToast('已保存');});ov.querySelector('#olScClr').addEventListener('click',function(){App.LS.remove('olScene_'+OL.charId);ov.remove();App.showToast('已清空');});},
showBgMenu:function(){var OL=App.offline;if(!OL)return;var ov=document.createElement('div');ov.className='pc-edit-overlay';ov.style.zIndex='100060';ov.innerHTML='<div class="pc-edit-panel" style="width:260px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)"><div class="pc-header">背景<div class="pc-close-btn" id="olBgX">×</div></div><div class="pc-body" style="gap:8px"><button class="pc-btn pc-btn-save" id="olBgAlbum" type="button">从相册选择</button><button class="pc-btn pc-btn-cancel" id="olBgUrl" type="button">输入URL</button><button class="pc-btn pc-btn-cancel" id="olBgDel" type="button" style="color:#c9706b">移除</button></div></div>';document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});ov.querySelector('#olBgX').addEventListener('click',function(){ov.remove();});ov.querySelector('#olBgDel').addEventListener('click',function(){App.LS.remove('olBg_'+OL.charId);var bg=App.$('#olBg');if(bg){bg.style.backgroundImage='';bg.style.filter='';}ov.remove();App.showToast('已移除');});ov.querySelector('#olBgAlbum').addEventListener('click',function(){ov.remove();var inp=document.createElement('input');inp.type='file';inp.accept='image/*';document.body.appendChild(inp);inp.onchange=function(ev){var f=ev.target.files[0];document.body.removeChild(inp);if(!f)return;var rd=new FileReader();rd.onload=function(r){var process=function(src){try{App.LS.set('olBg_'+OL.charId,src);}catch(e){App.showToast('太大');return;}var bg=App.$('#olBg');if(bg){bg.style.backgroundImage='url('+src+')';var a=gAp(OL.charId);bg.style.filter='blur('+a.bgBlur+'px) brightness('+(100-a.bgDark)+'%)';bg.style.backgroundSize=a.bgFit||'contain';}App.showToast('已设置');};if(App.cropImage)App.cropImage(r.target.result,process);else process(r.target.result);};rd.readAsDataURL(f);};inp.click();});ov.querySelector('#olBgUrl').addEventListener('click',function(){ov.remove();var url=prompt('输入URL：');if(!url)return;App.LS.set('olBg_'+OL.charId,url.trim());var bg=App.$('#olBg');if(bg){bg.style.backgroundImage='url('+url.trim()+')';var a=gAp(OL.charId);bg.style.filter='blur('+a.bgBlur+'px) brightness('+(100-a.bgDark)+'%)';bg.style.backgroundSize=a.bgFit||'contain';}App.showToast('已设置');});},
openCodeEditor:function(){var OL=App.offline;if(!OL)return;var saved=App.LS.get('olCustomCode_'+OL.charId)||'';var ed=document.createElement('div');ed.className='ol-css-editor';ed.innerHTML='<div class="ol-css-editor-header"><button type="button" id="olCodeBack" class="ol-css-hd-btn">返回</button><span class="ol-css-hd-title">自定义UI</span><button type="button" id="olCodeSave" class="ol-css-hd-btn">保存</button></div><textarea class="ol-css-textarea" id="olCodeTA" spellcheck="false" placeholder="HTML + CSS + JS">'+App.esc(saved)+'</textarea>';document.body.appendChild(ed);function goBack(){ed.remove();var p=App.$('#olSettingsPanel');if(p){p.classList.remove('hidden');requestAnimationFrame(function(){p.classList.add('show');});}}App.bindSwipeBack(ed,goBack);ed.querySelector('#olCodeBack').addEventListener('click',goBack);ed.querySelector('#olCodeSave').addEventListener('click',function(){var code=ed.querySelector('#olCodeTA').value||'';App.LS.set('olCustomCode_'+OL.charId,code);OfflineUI.applyCustomCode(OL.charId);goBack();App.showToast('已保存');});ed.querySelector('#olCodeTA').addEventListener('keydown',function(e){if(e.key==='Tab'){e.preventDefault();var ta=this,s=ta.selectionStart,end=ta.selectionEnd;ta.value=ta.value.substring(0,s)+'  '+ta.value.substring(end);ta.selectionStart=ta.selectionEnd=s+2;}});},
applyCustomCode:function(cid){var oldS=document.getElementById('olCustomStyle');if(oldS)oldS.remove();var oldH=document.getElementById('olCustomHtml');if(oldH)oldH.remove();var code=App.LS.get('olCustomCode_'+cid);if(!code)return;var css='';var cssR=/<style[^>]*>([\s\S]*?)<\/style>/gi;var cm;while((cm=cssR.exec(code))!==null)css+=cm[1]+'\n';var jss=[];var jsR=/<script[^>]*>([\s\S]*?)<\/script>/gi;var jm;while((jm=jsR.exec(code))!==null)jss.push(jm[1]);var html=code.replace(/<style[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<script[^>]*>[\s\S]*?<\/script>/gi,'').trim();if(!/<style/i.test(code)&&!/<[a-z]/i.test(code)){css=code;html='';}if(css){var s=document.createElement('style');s.id='olCustomStyle';s.textContent=css;document.head.appendChild(s);}if(html){var cont=document.getElementById('olMsgs');if(cont){var d=document.createElement('div');d.id='olCustomHtml';d.innerHTML=html;cont.insertBefore(d,cont.firstChild);}}if(jss.length)jss.forEach(function(js){try{(new Function(js))();}catch(e){console.warn('[自定义代码]',e.message);}});},
init:function(){App.offlineUI=OfflineUI;}
};
App.register('offlineUI',OfflineUI);
})();
