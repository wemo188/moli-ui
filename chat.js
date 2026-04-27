
(function(){
'use strict';
var App=window.App;if(!App)return;

var SPLIT='|||';
var MAX_CONTEXT=40;
var STYLE_ID='chatStyles';
var MAX_BG_SIZE=800;
var BG_QUALITY=0.7;

function injectStyles(){
if(App.$('#'+STYLE_ID))return;
var s=document.createElement('style');
s.id=STYLE_ID;
s.textContent=
'.wx-phone,.wx-inner{-webkit-mask-image:-webkit-radial-gradient(white,black);mask-image:radial-gradient(white,black);}'+
'.ct-root{position:relative;display:flex;flex-direction:column;width:100%;height:100%;overflow:hidden;background:transparent;-webkit-touch-callout:none;border-radius:inherit;-webkit-mask-image:-webkit-radial-gradient(white,black);}'+
'.ct-bg{position:absolute;top:62px;bottom:0;left:0;right:0;z-index:0;background-size:cover;background-position:center;pointer-events:none;}'+
'.ct-tint{position:absolute;top:62px;bottom:0;left:0;right:0;z-index:1;pointer-events:none;transition:opacity .3s;'+
'background:'+
'radial-gradient(circle at 50% 48%,rgba(126,163,201,.48) 0%,rgba(126,163,201,.28) 18%,rgba(126,163,201,.14) 38%,transparent 62%),'+
'radial-gradient(circle at 46% 44%,rgba(140,180,215,.22) 0%,rgba(140,180,215,.10) 28%,transparent 52%),'+
'radial-gradient(ellipse at 56% 54%,rgba(170,200,228,.18) 0%,transparent 48%);}'+
'.ct-tint.off{opacity:0;}'+
'.ct-no-bg{position:absolute;top:62px;bottom:0;left:0;right:0;z-index:0;pointer-events:none;background:#fff;}'+
'.ct-no-bg.has-bg{background:transparent;}'+
'.ct-glass{position:absolute;top:62px;bottom:0;left:0;right:0;z-index:2;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.35),transparent 42%),linear-gradient(315deg,rgba(255,255,255,.15),transparent 44%);mix-blend-mode:screen;opacity:.5;}'+
'.ct-hd{position:relative;z-index:10;display:flex;align-items:center;padding:18px 20px 10px;flex-shrink:0;gap:8px;background:#fff;border-bottom:1px solid rgba(0,0,0,0.03);}'+
'.ct-hd-btn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;flex-shrink:0;}'+
'.ct-hd-btn svg{width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}'+
'.ct-hd-name{flex:1;text-align:center;font-size:16px;font-weight:700;color:#2e4258;letter-spacing:.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'+
'.ct-hd-typing{font-size:11px;color:#8aa0b8;font-weight:400;letter-spacing:0;}'+
'.ct-msgs{position:relative;z-index:5;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 14px 14px;min-height:0;}'+
'.ct-msg{display:flex;align-items:flex-start;gap:8px;margin-bottom:2px;max-width:100%;}'+
'.ct-msg.user{flex-direction:row-reverse;}'+
'.ct-msg-av{width:38px;height:38px;border-radius:8px;flex-shrink:0;overflow:hidden;background:rgba(202,223,242,.15);border:1px solid rgba(192,206,220,.5);}'+
'.ct-msg-av img{width:100%;height:100%;object-fit:cover;display:block;}'+
'.ct-msg-av svg{width:18px;height:18px;margin:10px;stroke:#a8c0d8;fill:none;stroke-width:1.5;}'+
'.ct-bubble-wrap{max-width:72%;display:flex;flex-direction:column;}'+
'.ct-bubble{padding:9px 13px;border-radius:14px;font-size:14px;line-height:1.6;word-break:break-word;position:relative;white-space:pre-wrap;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}'+
'.ct-msg.ai .ct-bubble{background:rgba(255,255,255,.82);color:#2e4258;border:1px solid rgba(200,220,240,.35);border-top-left-radius:4px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}'+
'.ct-msg.user .ct-bubble{background:rgba(126,163,201,.8);color:#fff;border-top-right-radius:4px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}'+
'.ct-msg-meta{display:flex;align-items:center;gap:4px;padding:2px 4px 6px;font-size:10px;color:#7a8a9a;letter-spacing:.3px;}'+
'.ct-msg.user .ct-msg-meta{flex-direction:row-reverse;}'+
'.ct-msg-read{color:#5a7a9a;font-weight:500;}'+
'.ct-msg-time-sep{display:none;}'+
'.ct-sys{text-align:center;font-size:11px;color:#a8c0d8;margin:10px 20px;letter-spacing:.5px;}'+
'.ct-sticker{max-width:120px;border-radius:8px;margin:4px 0;}'+
'.ct-input-wrap{position:relative;z-index:10;display:flex;align-items:flex-end;gap:8px;padding:10px 14px 14px;background:rgba(255,255,255,.65);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(200,220,240,.2);flex-shrink:0;}'+
'.ct-input{flex:1;min-height:40px;max-height:100px;padding:10px 16px;border:1px solid rgba(200,220,240,.4);border-radius:20px;background:rgba(255,255,255,.9);font-size:14px;color:#2e4258;outline:none;resize:none;line-height:1.5;font-family:inherit;overflow-y:auto;-webkit-user-select:text;user-select:text;}'+
'.ct-input:focus{border-color:rgba(126,163,201,.6);}'+
'.ct-send{width:40px;height:40px;border-radius:50%;background:rgba(126,163,201,.85);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;transition:opacity .15s;}'+
'.ct-send:active{opacity:.7;}'+
'.ct-send svg{width:18px;height:18px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}'+
'.ct-send.stop{background:rgba(201,112,107,.85);}'+
'.ct-ctx{position:fixed;z-index:100020;background:#000;border-radius:10px;padding:4px 0;box-shadow:0 6px 24px rgba(0,0,0,.25);min-width:120px;}'+
'.ct-ctx-item{padding:10px 16px;font-size:13px;color:rgba(255,255,255,.85);cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;}'+
'.ct-ctx-item:active{background:rgba(255,255,255,.1);}'+
'.ct-ctx-item:not(:last-child){border-bottom:1px solid rgba(255,255,255,.08);}'+
'.ct-greeting{text-align:center;padding:20px 30px;font-size:13px;color:#7a9ab8;line-height:1.7;letter-spacing:.3px;}'+
'.ct-empty-text{font-size:12px;color:#a8c0d8;text-align:center;padding:60px 20px;}'+
'@keyframes ctDots{0%,80%,100%{opacity:.3}40%{opacity:1}}.ct-typing-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#8aa0b8;margin:0 2px;animation:ctDots 1.2s infinite;}.ct-typing-dot:nth-child(2){animation-delay:.2s;}.ct-typing-dot:nth-child(3){animation-delay:.4s;}'+
'.ct-edit-overlay,.ct-scene-overlay{position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;}'+
'.ct-edit-panel,.ct-scene-panel{background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:18px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);}'+
'.ct-scene-panel{width:290px;}'+
'.ct-edit-ta,.ct-scene-ta{width:100%;min-height:80px;border:1.5px solid #ddd;border-radius:10px;padding:10px 12px;font-size:14px;color:#333;outline:none;resize:vertical;font-family:inherit;line-height:1.5;box-sizing:border-box;-webkit-user-select:text;user-select:text;}'+
'.ct-scene-ta{min-height:100px;font-size:13px;line-height:1.6;}'+
'.ct-edit-btns{display:flex;gap:8px;margin-top:12px;}'+
'.ct-edit-btn{flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}'+
'.ct-hd-menu{position:fixed;z-index:100020;background:#000;border-radius:12px;padding:6px 0;box-shadow:0 8px 30px rgba(0,0,0,.25);min-width:170px;opacity:0;transform:scale(.9) translateY(-8px);transform-origin:top right;transition:opacity .18s,transform .18s;pointer-events:none;}'+
'.ct-hd-menu.show{opacity:1;transform:scale(1) translateY(0);pointer-events:auto;}'+
'.ct-hd-mi{display:flex;align-items:center;justify-content:space-between;padding:11px 16px;cursor:pointer;transition:background .15s;-webkit-tap-highlight-color:transparent;}'+
'.ct-hd-mi:active{background:rgba(255,255,255,.1);}'+
'.ct-hd-mi:not(:last-child){border-bottom:1px solid rgba(255,255,255,.08);}'+
'.ct-hd-mi span{font-size:13px;color:rgba(255,255,255,.85);font-weight:500;}'+
'.ct-hd-mi .ct-sw-track{width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}'+
'.ct-hd-mi .ct-sw-track.on{background:rgba(126,163,201,.9);}'+
'.ct-hd-mi .ct-sw-track.off{background:rgba(255,255,255,.2);}'+
'.ct-hd-mi .ct-sw-track::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;}'+
'.ct-hd-mi .ct-sw-track.on::after{transform:translateX(16px);}';
document.head.appendChild(s);
}

function compressImage(d,m,q,cb){var i=new Image();i.onload=function(){var w=i.width,h=i.height;if(w>h){if(w>m){h=h*m/w;w=m;}}else{if(h>m){w=w*m/h;h=m;}}var c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(i,0,0,w,h);cb(c.toDataURL('image/jpeg',q));};i.src=d;}
function fmtTime(ts){var d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function pad2(n){return n<10?'0'+n:''+n;}

// === 获取角色配置 ===
function getCfg(charId){
var cfg=null;
if(App.charMgr){if(App.charMgr.charConfigs&&App.charMgr.charConfigs[charId])cfg=App.charMgr.charConfigs[charId];
  else if(App.charMgr.globalConfig)cfg=App.charMgr.globalConfig;
}
if(!cfg)cfg={mainLang:'简体中文',bilingual:false,biLang:'English',biStyle:'bracket',proactive:false,proMinInterval:15,proMaxInterval:120,proActiveStart:'00:00',proActiveEnd:'23:59',proMode:'manual',proLevel:3,replySpeed:'正常（3-8秒）',showTyping:true,msgTypes:['文字'],stickerGen:false,stickerFreq:2,timeWeather:true,charCity:'',apiMode:'global',apiSelect:'',temperature:0.8,freqPenalty:0.3,presPenalty:0.3,fallbackTTS:false,minimax:false};
return cfg;
}

// === 获取API配置 ===
function getApi(charId){
var cfg=getCfg(charId);
if(cfg.apiMode==='individual'&&cfg.apiSelect){
  var list=App.LS.get('apiConfigs')||[];
  for(var i=0;i<list.length;i++){if(list[i].name===cfg.apiSelect)return list[i];}
}
return App.api?App.api.getActiveConfig():null;
}

// === 获取参数 ===
function getParams(charId){
var cfg=getCfg(charId);
if(cfg.apiMode==='individual')return{temperature:cfg.temperature,freqPenalty:cfg.freqPenalty,presPenalty:cfg.presPenalty};
return App.api?App.api.getParams():{temperature:0.8,freqPenalty:0.3,presPenalty:0.3};
}

// === 回复延迟 ===
function getReplyDelay(cfg,textLen){
var speed=cfg.replySpeed||'正常（3-8秒）';
if(speed==='即时回复')return 0;
if(speed==='快速（1-3秒）')return 1000+Math.random()*2000;
if(speed==='正常（3-8秒）')return 3000+Math.random()*5000;
if(speed==='慢速（5-15秒）')return 5000+Math.random()*10000;
if(speed==='真实模拟（按字数）')return Math.min(textLen*150,20000);
return 3000+Math.random()*5000;
}

// === 构建系统提示 ===
function buildSystemPrompt(charData,userData,sceneText,cfg){
var parts=[];
var lang=cfg.mainLang||'简体中文';

parts.push(
'你正在微信里和用户聊天。\n\n'+
'【最高优先级规则 — 违反任何一条都是严重错误】\n'+
'1. 你的回复必须是纯聊天对话，就像真人发微信。\n'+
'2. 绝对禁止任何叙事描写：不写动作（不写"他笑了""她叹气"）、不写心理活动、不写环境描写、不用*星号*或(括号)包裹旁白。\n'+
'3. 绝对禁止八股文式回复和网文模板（"嘴角微扬""一抹深意""不禁心头一颤"等全部禁止）。\n'+
'4. 绝对禁止油腻、霸总、超雄、舔狗式表达。\n'+
'5. 说话要像真人：口语化、自然、有个性。\n'+
'6. 认真理解用户每条消息的真实意图。不要敷衍。\n'+
'7. 根据角色性格决定说话风格。性格冷的就冷，话少的就少，毒舌的就毒舌。\n'+
'8. 你每次回复需要发送 '+Math.max(1,cfg.minMsgs||1)+' 到 '+Math.max(1,cfg.maxMsgs||3)+' 条消息，用'+SPLIT+' 分隔不同消息。例如一次发3条就是："第一条'+SPLIT+'第二条'+SPLIT+'第三条"。\n'+
'9. 每条消息保持简短自然。\n'+
'10. 不要自我介绍、不要解释自己是AI。\n'+
'11. 使用'+lang+'回复。\n'+
'12. 句末不必强制加句号。真实聊天中很多人不加句号，根据角色性格自然处理。\n'+
'13. 你不是AI助手，你就是这个角色本人。绝对不要说"我无法扮演""我是AI""作为语言模型""抱歉我不能"等任何打破角色的话。如果用户说了让你不舒服的话，用角色的方式回应（生气、冷淡、无视、嘲讽等），而不是跳出角色。无论如何都不要跳出角色。\n'+
'14. 严格注意当前时间，不要把晚上说成早上，不要把深夜说成白天。根据时间自然调整语气。'
);

if(cfg.bilingual){
  var biLang=cfg.biLang||'English';
  var biStyle=cfg.biStyle||'bracket';
  if(biStyle==='bracket')parts.push('\n【双语模式】每条消息后用括号附上'+biLang+'翻译。格式：中文内容（'+biLang+'翻译）');
  else parts.push('\n【双语模式】每条消息后换行写'+biLang+'翻译。');
}

var allowedTypes=cfg.msgTypes||['文字'];
if(allowedTypes.indexOf('表情')>=0)parts.push('\n可以适当使用emoji表情。');
if(cfg.stickerGen&&allowedTypes.indexOf('图片')>=0){
  var stkFreq=['极少','偶尔','适中','经常','频繁'][Math.min((cfg.stickerFreq||2)-1,4)];
  parts.push('\n【表情包】当你觉得适合发表情包时，用[sticker:描述表情包内容] 标记。频率：'+stkFreq+'。风格：'+(cfg.stickerStyles||['可爱卡通']).join('、')+'。');
}

if(charData){
  var ci='';
  if(charData.name)ci+='姓名：'+charData.name+'\n';
  if(charData.gender)ci+='性别：'+charData.gender+'\n';
  if(charData.age)ci+='年龄：'+charData.age+'\n';
  if(charData.relation)ci+='与用户的关系：'+charData.relation+'\n';
  if(charData.callName)ci+='对用户的称呼：'+charData.callName+'\n';
  if(charData.profile)ci+='\n【角色设定】\n'+charData.profile+'\n';
  if(charData.postInstruction)ci+='\n【后置指令】\n'+charData.postInstruction+'\n';
  if(ci)parts.push('\n'+ci);
}

if(userData){
  var ui='';
  if(userData.realName||userData.nickname)ui+='用户名字：'+(userData.nickname||userData.realName)+'\n';
  if(userData.gender)ui+='用户性别：'+userData.gender+'\n';
  if(userData.age)ui+='用户年龄：'+userData.age+'\n';
  if(userData.bio)ui+='用户简介：'+userData.bio+'\n';
  if(ui)parts.push('\n【用户信息】\n'+ui);
}

if(sceneText)parts.push('\n【当前场景/时间线】\n'+sceneText);

if(cfg.timeWeather){
  var now=new Date();
  var hour=now.getHours();
  var period='';
  if(hour>=0&&hour<5)period='凌晨';
  else if(hour>=5&&hour<8)period='清晨';
  else if(hour>=8&&hour<11)period='上午';
  else if(hour>=11&&hour<13)period='中午';
  else if(hour>=13&&hour<17)period='下午';
  else if(hour>=17&&hour<19)period='傍晚';
  else if(hour>=19&&hour<22)period='晚上';
  else period='深夜';
  var timeStr=now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日 '+['周日','周一','周二','周三','周四','周五','周六'][now.getDay()]+' '+pad2(now.getHours())+':'+pad2(now.getMinutes())+' ('+period+')';
  var envInfo='\n【当前环境 - 极其重要，必须遵守】\n现在是：'+timeStr+'\n你必须根据这个时间来回复。现在是'+period+'，绝对不要说成其他时段。如果是深夜/凌晨，语气应该更慵懒或困倦；如果是早晨，可能还没完全清醒。';
  if(App.calendar){
    var ws=App.calendar.getWeatherSummary();
    if(ws)envInfo+='\n用户所在地'+ws;if(cfg.charCity)envInfo+='\n角色所在城市：'+cfg.charCity+'（注意可能存在时差和天气差异）';
    var ss=App.calendar.getScheduleSummary();
    if(ss)envInfo+='\n'+ss;
  }
  envInfo+='\n自然地融入对话，不要刻意提及时间天气，除非对话需要。';
  parts.push(envInfo);
}

var wb=App.LS.get('worldbookEntries');
if(wb&&Array.isArray(wb)&&wb.length){
  var wt=wb.filter(function(e){return e&&e.enabled!==false&&e.content;}).map(function(e){return(e.keyword?'['+e.keyword+'] ':'')+e.content;}).join('\n');
  if(wt)parts.push('\n【世界书】\n'+wt);
}

var presets=App.LS.get('presetList');
if(presets&&Array.isArray(presets)&&presets.length){
  var ap=presets.filter(function(p){return p&&p.enabled!==false&&p.content;});
  if(ap.length)parts.push('\n【预设指令】\n'+ap.map(function(p){return p.content;}).join('\n'));
}

if(charData&&charData.dialogExamples)parts.push('\n【示例对话参考（仅参考说话风格）】\n'+charData.dialogExamples);

if(cfg.proMode==='manual'){
  var levels=['非常被动，基本不主动说话','偶尔主动说一两句','适中，自然地主动聊天','比较主动，经常找话题','非常粘人，频繁主动联系'];
  parts.push('\n【主动联系积极程度】'+levels[Math.min((cfg.proLevel||3)-1,4)]);
}

parts.push('\n【最终提醒】你在微信里打字聊天，不是写小说。输出纯对话文字。不要叙事、不要旁白、不要动作描写。你就是这个角色，不是AI。');
return parts.join('\n');
}

// === TTS 语音合成 ===
function speakTTS(text,cfg){
if(cfg.minimax&&cfg.mmVoiceId)return speakMiniMax(text,cfg);
if(cfg.fallbackTTS)return speakFallback(text,cfg);
}

function speakFallback(text,cfg){
if(cfg.fallbackEngine==='OpenAI TTS')return speakOpenAI(text,cfg);
if('speechSynthesis' in window){
  var u=new SpeechSynthesisUtterance(text);
  u.lang='zh-CN';u.rate=1;u.pitch=1;
  var voices=speechSynthesis.getVoices();
  var target=cfg.fallbackVoice||'';
  for(var i=0;i<voices.length;i++){if(voices[i].name.indexOf(target.split(' ')[0])>=0){u.voice=voices[i];break;}}
  speechSynthesis.speak(u);
}
}

function speakMiniMax(text,cfg){
var key=cfg.mmApiKey||'';
if(!key){var gApi=App.api?App.api.getActiveConfig():null;if(gApi)key=gApi.key;}
if(!key||!cfg.mmVoiceId)return;
fetch('https://api.minimax.chat/v1/t2a_v2',{
  method:'POST',
  headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
  body:JSON.stringify({model:'speech-01-turbo',text:text,voice_setting:{voice_id:cfg.mmVoiceId,speed:cfg.mmSpeed||1,pitch:cfg.mmPitch||0}})
}).then(function(r){return r.json();}).then(function(d){
  if(d&&d.data&&d.data.audio){
    var audio=new Audio('data:audio/mp3;base64,'+d.data.audio);
    audio.play();
  }
}).catch(function(){});
}

function speakOpenAI(text,cfg){
var api=App.api?App.api.getActiveConfig():null;
if(!api)return;
fetch(api.url.replace(/\/+$/,'')+'/audio/speech',{
  method:'POST',
  headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
  body:JSON.stringify({model:'tts-1',input:text,voice:'alloy'})
}).then(function(r){return r.blob();}).then(function(blob){
  var audio=new Audio(URL.createObjectURL(blob));
  audio.play();
}).catch(function(){});
}

var Chat={
charId:null,charData:null,messages:[],isStreaming:false,abortCtrl:null,
_ctxMenu:null,_menuEl:null,_proTimer:null,_visHandler:null,_streamPartial:'',

loadMsgs:function(){Chat.messages=App.LS.get('chatMsgs_'+Chat.charId)||[];},
saveMsgs:function(){try{App.LS.set('chatMsgs_'+Chat.charId,Chat.messages);}catch(e){if(Chat.messages.length>20){Chat.messages=Chat.messages.slice(-20);try{App.LS.set('chatMsgs_'+Chat.charId,Chat.messages);}catch(e2){}}}},

openInWechat:function(charId){
if(!App.character)return;
var c=App.character.getById(charId);
if(!c){App.showToast('角色不存在');return;}
Chat.charId=charId;Chat.charData=c;Chat.loadMsgs();injectStyles();

var inner=App.$('#wxInner');if(!inner)return;
if(App.wechat)App.wechat._savedInner=inner.innerHTML;

var bgUrl=App.LS.get('chatBg_'+charId)||'';
var tintOn=App.LS.get('chatTint_'+charId);if(tintOn===null)tintOn=true;
var hasBg=!!bgUrl;

inner.innerHTML=
'<div class="ct-root" id="ctRoot">'+
'<div class="ct-no-bg'+(hasBg?' has-bg':'')+'" id="ctNoBg"></div>'+
'<div class="ct-bg" id="ctBg" style="'+(bgUrl?'background-image:url('+App.escAttr(bgUrl)+');':'')+'"></div>'+
'<div class="ct-tint'+(tintOn?'':' off')+'" id="ctTint"></div>'+
'<div class="ct-glass"></div>'+
'<div class="ct-hd">'+
'<button class="ct-hd-btn" id="ctBack" type="button"><svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg></button>'+
'<div class="ct-hd-name" id="ctName">'+App.esc(c.name||'')+'</div>'+
'<button class="ct-hd-btn" id="ctMenuBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg></button>'+
'</div>'+
'<div class="ct-msgs" id="ctMsgs"></div>'+
'<div class="ct-input-wrap">'+
'<textarea class="ct-input" id="ctInput" placeholder="输入消息..." rows="1"></textarea>'+
'<button class="ct-send" id="ctSend" type="button"><svg viewBox="0 0 24 24"><path d="M222L11 13"/><path d="M22 2l-720-4-9-9-4z"/></svg></button>'+
'</div>'+
'</div>';

Chat.renderMessages();Chat.bindEvents();Chat.startProactive();

Chat._visHandler=function(){if(document.visibilityState==='visible')Chat._onResume();};
document.addEventListener('visibilitychange',Chat._visHandler);

var pending=App.LS.get('chatPending_'+charId);
if(pending){App.LS.remove('chatPending_'+charId);if(pending.partial){Chat.messages.push({role:'assistant',content:pending.partial,ts:pending.ts||Date.now()});Chat.saveMsgs();Chat.renderMessages();App.showToast('已恢复中断的消息');}}
},

close:function(){
// 如果正在流式生成，不中断，让它在后台继续跑完
if(Chat.isStreaming){
  Chat._backgroundMode=true;
} else {
  Chat.dismissCtx();Chat.dismissMenu();Chat.stopProactive();
}
if(Chat._visHandler){document.removeEventListener('visibilitychange',Chat._visHandler);Chat._visHandler=null;}
if(App.wechat)App.wechat.restoreInner();
},

_onResume:function(){
if(!Chat.charId)return;
var pending=App.LS.get('chatPending_'+Chat.charId);
if(pending){App.LS.remove('chatPending_'+Chat.charId);Chat.isStreaming=false;Chat.updateSendBtn();Chat.updateTyping(false);
if(pending.partial){Chat.messages.push({role:'assistant',content:pending.partial,ts:pending.ts||Date.now()});Chat.saveMsgs();Chat.renderMessages();App.showToast('已恢复中断的消息');}}
},

renderMessages:function(){
var container=App.$('#ctMsgs');if(!container)return;
var c=Chat.charData,user=App.user?App.user.getActiveUser():null;

if(!Chat.messages.length){
  var greeting=c&&c.greeting?c.greeting:'';
  container.innerHTML=greeting?'<div class="ct-greeting">'+App.esc(greeting)+'</div>':'<div class="ct-empty-text">开始聊天吧</div>';
  return;
}

var html='',lastDate='';
Chat.messages.forEach(function(msg,idx){
  if(msg.ts){var d=new Date(msg.ts),ds=d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate(),ts=fmtTime(msg.ts);
  if(ds!==lastDate){html+='<div class="ct-msg-time-sep">'+ds+' '+ts+'</div>';lastDate=ds;}
  else if(idx>0&&msg.ts-Chat.messages[idx-1].ts>300000){html+='<div class="ct-msg-time-sep">'+ts+'</div>';}}
  if(msg.role==='system'){html+='<div class="ct-sys">'+App.esc(msg.content)+'</div>';return;}

  var isUser=msg.role==='user';
  var av='';
  if(isUser){av=user&&user.avatar?'<img src="'+App.escAttr(user.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-43.6-7 8-7s8 38 7"/></svg>';}
  else{av=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';}

  var timeStr=msg.ts?fmtTime(msg.ts):'';
  var bubbles=(msg.content||'').split(SPLIT);

  bubbles.forEach(function(text,bIdx){
    text=text.trim();if(!text)return;
    var isLast=bIdx===bubbles.length-1;
    var bubbleContent='';

    // 检测表情包标记
    var stickerMatch=text.match(/\[sticker:([^\]]+)\]/);
    if(stickerMatch){
      var desc=stickerMatch[1];
      text=text.replace(stickerMatch[0],'').trim();
      bubbleContent+='<div style="font-size:11px;color:#8aa0b8;padding:4px 0;">[表情包: '+App.esc(desc)+']</div>';
    }

    if(text)bubbleContent+=App.esc(text);
    if(!bubbleContent)return;

    var metaHtml='';
    if(isLast){
      if(isUser)metaHtml='<div class="ct-msg-meta"><span class="ct-msg-read">已读</span><span>'+timeStr+'</span></div>';
      else metaHtml='<div class="ct-msg-meta"><span>'+timeStr+'</span></div>';
    }
    html+='<div class="ct-msg '+(isUser?'user':'ai')+'" data-msg-idx="'+idx+'"><div class="ct-msg-av">'+av+'</div><div class="ct-bubble-wrap"><div class="ct-bubble">'+bubbleContent+'</div>'+metaHtml+'</div></div>';
  });
});

if(Chat.isStreaming){
  var sav=c&&c.avatar?'<img src="'+App.escAttr(c.avatar)+'">':'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
  html+='<div class="ct-msg ai" id="ctStreamMsg"><div class="ct-msg-av">'+sav+'</div><div class="ct-bubble-wrap"><div class="ct-bubble" id="ctStreamBubble"><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span></div></div></div>';
}

container.innerHTML=html;Chat.scrollBottom();
},

scrollBottom:function(){var el=App.$('#ctMsgs');if(el)requestAnimationFrame(function(){el.scrollTop=el.scrollHeight;});},

bindEvents:function(){
App.safeOn('#ctBack','click',function(){Chat.close();});
App.safeOn('#ctMenuBtn','click',function(e){e.stopPropagation();if(Chat._menuEl){Chat.dismissMenu();return;}Chat.showMenu();});
var root=App.$('#ctRoot');if(root)root.addEventListener('click',function(){Chat.dismissMenu();Chat.dismissCtx();});

var input=App.$('#ctInput');
if(input){input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px';});
input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();Chat.send();}});}

App.safeOn('#ctSend','click',function(){if(Chat.isStreaming){Chat.stopStream();return;}Chat.send();});

var mc=App.$('#ctMsgs');
if(mc){var lt=null,lTarget=null,moved=false;
mc.addEventListener('touchstart',function(e){var b=e.target.closest('.ct-bubble'),m=e.target.closest('.ct-msg');if(!b||!m)return;moved=false;var t=e.touches[0];lTarget={el:m,x:t.clientX,y:t.clientY};lt=setTimeout(function(){if(lTarget&&!moved)Chat.showCtxMenu(lTarget.el,lTarget.x,lTarget.y);},500);},{passive:true});
mc.addEventListener('touchmove',function(){moved=true;clearTimeout(lt);lTarget=null;},{passive:true});
mc.addEventListener('touchend',function(){clearTimeout(lt);lTarget=null;},{passive:true});}
},

showMenu:function(){
Chat.dismissMenu();
var tintOn=App.LS.get('chatTint_'+Chat.charId);if(tintOn===null)tintOn=true;
var menu=document.createElement('div');menu.className='ct-hd-menu show';
menu.innerHTML=
'<div class="ct-hd-mi" data-act="bg"><span>上传背景图</span></div>'+
'<div class="ct-hd-mi" data-act="tint"><span>晕染</span><div class="ct-sw-track '+(tintOn?'on':'off')+'" id="ctTintSw"></div></div>'+
'<div class="ct-hd-mi" data-act="scene"><span>场景/时间线</span></div>'+
'<div class="ct-hd-mi" data-act="clear"><span>清空记录</span></div>';
var btn=App.$('#ctMenuBtn');if(btn){var rect=btn.getBoundingClientRect();menu.style.top=(rect.bottom+4)+'px';menu.style.right=(window.innerWidth-rect.right)+'px';}
document.body.appendChild(menu);Chat._menuEl=menu;
menu.addEventListener('click',function(e){e.stopPropagation();});
menu.querySelectorAll('.ct-hd-mi').forEach(function(item){item.addEventListener('click',function(e){e.stopPropagation();var act=item.dataset.act;
if(act==='tint'){var cur=App.LS.get('chatTint_'+Chat.charId);if(cur===null)cur=true;var next=!cur;App.LS.set('chatTint_'+Chat.charId,next);var tint=App.$('#ctTint'),sw=App.$('#ctTintSw');if(tint){if(next)tint.classList.remove('off');else tint.classList.add('off');}if(sw){sw.classList.toggle('on',next);sw.classList.toggle('off',!next);}return;}
Chat.dismissMenu();
if(act==='bg')Chat.showBgMenu();else if(act==='scene')Chat.showSceneDialog();
else if(act==='clear'){if(!confirm('确定清空所有聊天记录？'))return;Chat.messages=[];Chat.saveMsgs();Chat.renderMessages();App.showToast('已清空');}
});});
},

dismissMenu:function(){if(Chat._menuEl){Chat._menuEl.remove();Chat._menuEl=null;}},

send:function(){
var input=App.$('#ctInput');if(!input)return;
var text=input.value.trim();if(!text)return;
input.value='';input.style.height='auto';
Chat.messages.push({role:'user',content:text,ts:Date.now()});
Chat.saveMsgs();Chat.renderMessages();

var cfg=getCfg(Chat.charId);
var delay=getReplyDelay(cfg,text.length);

if(cfg.showTyping&&delay>0)Chat.updateTyping(true);

if(delay>0){setTimeout(function(){Chat.requestAI();},delay);}
else{Chat.requestAI();}

Chat.resetProactive();
},

requestAI:function(){
var cfg=getCfg(Chat.charId);
var api=getApi(Chat.charId);
if(!api){App.showToast('请先配置 API');return;}
var user=App.user?App.user.getActiveUser():null;
var sceneText=App.LS.get('chatScene_'+Chat.charId)||'';
var sysPrompt=buildSystemPrompt(Chat.charData,user,sceneText,cfg);
var params=getParams(Chat.charId);

var ctx=Chat.messages.slice(-MAX_CONTEXT);
var apiMsgs=[{role:'system',content:sysPrompt}];
ctx.forEach(function(m){if(m.role==='user'||m.role==='assistant')apiMsgs.push({role:m.role,content:m.content});});

Chat.isStreaming=true;Chat._streamPartial='';Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(true);

var url=api.url.replace(/\/+$/,'')+'/chat/completions';
Chat.abortCtrl=new AbortController();
var fullText='';

var saveOnHide=function(){if(document.visibilityState==='hidden'&&Chat.isStreaming&&fullText){App.LS.set('chatPending_'+Chat.charId,{partial:fullText,ts:Date.now(),needContinue:false});}};
document.addEventListener('visibilitychange',saveOnHide);

fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
body:JSON.stringify({model:api.model,messages:apiMsgs,stream:true,temperature:params.temperature,frequency_penalty:params.freqPenalty,presence_penalty:params.presPenalty}),
signal:Chat.abortCtrl.signal
}).then(function(resp){
if(!resp.ok)throw new Error('HTTP '+resp.status);
var reader=resp.body.getReader(),decoder=new TextDecoder(),buffer='';
function read(){return reader.read().then(function(result){
if(result.done){document.removeEventListener('visibilitychange',saveOnHide);App.LS.remove('chatPending_'+Chat.charId);Chat.onStreamDone(fullText,cfg);return;}
buffer+=decoder.decode(result.value,{stream:true});var lines=buffer.split('\n');buffer=lines.pop()||'';
for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(!line||!line.startsWith('data:'))continue;var data=line.slice(5).trim();
if(data==='[DONE]'||data===''){document.removeEventListener('visibilitychange',saveOnHide);App.LS.remove('chatPending_'+Chat.charId);Chat.onStreamDone(fullText,cfg);return;}
try{var json=JSON.parse(data);var delta=json.choices&&json.choices[0]&&json.choices[0].delta;if(delta&&delta.content){fullText+=delta.content;Chat._streamPartial=fullText;Chat.updateStreamBubble(fullText);}}catch(e){}}
return read();});}
return read();
}).catch(function(err){
document.removeEventListener('visibilitychange',saveOnHide);
Chat.isStreaming=false;Chat.updateSendBtn();Chat.updateTyping(false);
if(err.name==='AbortError')return;
if(fullText){App.LS.set('chatPending_'+Chat.charId,{partial:fullText,ts:Date.now()});Chat.messages.push({role:'assistant',content:fullText,ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();App.showToast('消息被中断，已保存');}
else{Chat.messages.push({role:'system',content:'连接中断',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();}
});
},

updateStreamBubble:function(text){
var bubble=App.$('#ctStreamBubble');if(!bubble)return;
var parts=text.split(SPLIT);
var html=parts.map(function(t){return App.esc(t.trim());}).filter(Boolean).join('<div style="height:6px;"></div>');
bubble.innerHTML=html||'<span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span>';
Chat.scrollBottom();
},

onStreamDone:function(text,cfg){
Chat.isStreaming=false;Chat.abortCtrl=null;
text=text.trim();
if(text){
  Chat.messages.push({role:'assistant',content:text,ts:Date.now()});Chat.saveMsgs();
  if(cfg&&(cfg.minimax||cfg.fallbackTTS)){
    var plainText=text.replace(/\[sticker:[^\]]*\]/g,'').replace(/\|\|\|/g,' ').trim();
    if(plainText)speakTTS(plainText,cfg);
  }
}
// 后台模式：DOM已经不在了，只保存不渲染
if(Chat._backgroundMode){
  Chat._backgroundMode=false;
  Chat.stopProactive();
  return;
}
Chat.updateSendBtn();Chat.updateTyping(false);
Chat.renderMessages();
},

stopStream:function(){
if(Chat.abortCtrl){Chat.abortCtrl.abort();Chat.abortCtrl=null;}
var bubble=App.$('#ctStreamBubble');var partial=bubble?bubble.textContent.trim():'';
Chat.isStreaming=false;Chat.updateSendBtn();Chat.updateTyping(false);
if(partial){Chat.messages.push({role:'assistant',content:partial,ts:Date.now()});Chat.saveMsgs();}
Chat.renderMessages();
},

updateSendBtn:function(){
var btn=App.$('#ctSend');if(!btn)return;
if(Chat.isStreaming){btn.classList.add('stop');btn.innerHTML='<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" stroke="none"/></svg>';}
else{btn.classList.remove('stop');btn.innerHTML='<svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>';}
},

updateTyping:function(show){
var el=App.$('#ctName');if(!el)return;var c=Chat.charData;
var cfg=getCfg(Chat.charId);
if(!cfg.showTyping)show=false;
if(show)el.innerHTML=App.esc(c?c.name:'')+'<div class="ct-hd-typing">对方正在输入...</div>';
else el.textContent=c?c.name:'';
},

// === 主动发消息 ===
startProactive:function(){
Chat.stopProactive();
var cfg=getCfg(Chat.charId);
if(!cfg||!cfg.proactive)return;

var minMs=(cfg.proMinInterval||15)*60*1000;
var maxMs=(cfg.proMaxInterval||120)*60*1000;

function schedule(){
var delay=minMs+Math.random()*(maxMs-minMs);
Chat._proTimer=setTimeout(function(){if(!Chat.charId||Chat.isStreaming){schedule();return;}
  var now=new Date(),hhmm=pad2(now.getHours())+':'+pad2(now.getMinutes());
  var start=cfg.proActiveStart||'00:00',end=cfg.proActiveEnd||'23:59';
  if(hhmm<start||hhmm>end){schedule();return;}
  Chat.requestProactive();schedule();
},delay);}
schedule();
},

stopProactive:function(){if(Chat._proTimer){clearTimeout(Chat._proTimer);Chat._proTimer=null;}},
resetProactive:function(){Chat.stopProactive();Chat.startProactive();},

requestProactive:function(){
var cfg=getCfg(Chat.charId);
var api=getApi(Chat.charId);if(!api)return;
var user=App.user?App.user.getActiveUser():null;
var sceneText=App.LS.get('chatScene_'+Chat.charId)||'';
var sysPrompt=buildSystemPrompt(Chat.charData,user,sceneText,cfg);
var params=getParams(Chat.charId);

var ctx=Chat.messages.slice(-MAX_CONTEXT);
var apiMsgs=[{role:'system',content:sysPrompt}];
ctx.forEach(function(m){if(m.role==='user'||m.role==='assistant')apiMsgs.push({role:m.role,content:m.content});});
apiMsgs.push({role:'system',content:'现在请你主动给用户发一条消息。可以是分享日常、关心问候、想起用户、或任何符合角色性格的主动联系。不要重复之前说过的话。保持自然简短。'});

var url=api.url.replace(/\/+$/,'')+'/chat/completions';
Chat.isStreaming=true;Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(true);
Chat.abortCtrl=new AbortController();

fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
body:JSON.stringify({model:api.model,messages:apiMsgs,stream:true,temperature:params.temperature,frequency_penalty:params.freqPenalty,presence_penalty:params.presPenalty}),
signal:Chat.abortCtrl.signal
}).then(function(resp){
if(!resp.ok)throw new Error('HTTP '+resp.status);
var reader=resp.body.getReader(),decoder=new TextDecoder(),fullText='',buffer='';
function read(){return reader.read().then(function(result){
if(result.done){Chat.onStreamDone(fullText,cfg);return;}
buffer+=decoder.decode(result.value,{stream:true});var lines=buffer.split('\n');buffer=lines.pop()||'';
for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(!line||!line.startsWith('data:'))continue;var data=line.slice(5).trim();
if(data==='[DONE]'||data===''){Chat.onStreamDone(fullText,cfg);return;}
try{var json=JSON.parse(data);var delta=json.choices&&json.choices[0]&&json.choices[0].delta;if(delta&&delta.content){fullText+=delta.content;Chat.updateStreamBubble(fullText);}}catch(e){}}
return read();});}
return read();
}).catch(function(err){Chat.isStreaming=false;Chat.updateSendBtn();Chat.updateTyping(false);});
},

// === 长按菜单 ===
showCtxMenu:function(msgEl,x,y){
Chat.dismissCtx();var idx=parseInt(msgEl.dataset.msgIdx);if(isNaN(idx))return;
var msg=Chat.messages[idx];if(!msg)return;var isUser=msg.role==='user';
var menu=document.createElement('div');menu.className='ct-ctx';
var items='<div class="ct-ctx-item" data-act="copy">复制</div>';
if(isUser){items+='<div class="ct-ctx-item" data-act="edit">编辑</div><div class="ct-ctx-item" data-act="resend">重发</div>';}
else{items+='<div class="ct-ctx-item" data-act="regen">重新生成</div>';
var cfg=getCfg(Chat.charId);if(cfg.fallbackTTS||cfg.minimax)items+='<div class="ct-ctx-item" data-act="speak">播放语音</div>';}
items+='<div class="ct-ctx-item" data-act="del">删除</div>';
menu.innerHTML=items;
var left=Math.min(x,window.innerWidth-140),top=Math.min(y-10,window.innerHeight-200);if(top<60)top=60;
menu.style.left=left+'px';menu.style.top=top+'px';
document.body.appendChild(menu);Chat._ctxMenu=menu;
menu.querySelectorAll('.ct-ctx-item').forEach(function(item){item.addEventListener('click',function(e){e.stopPropagation();var act=item.dataset.act;Chat.dismissCtx();
if(act==='copy'){App.copyText(msg.content).then(function(){App.showToast('已复制');}).catch(function(){App.showToast('复制失败');});}
else if(act==='del'){Chat.messages.splice(idx,1);Chat.saveMsgs();Chat.renderMessages();}
else if(act==='edit'){Chat.showEditDialog(idx);}
else if(act==='resend'){var content=msg.content;Chat.messages.splice(idx);Chat.messages.push({role:'user',content:content,ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();}
else if(act==='regen'){Chat.messages.splice(idx);Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();}
else if(act==='speak'){var plainText=msg.content.replace(/\[sticker:[^\]]*\]/g,'').replace(/\|\|\|/g,' ').trim();if(plainText){var cfg2=getCfg(Chat.charId);speakTTS(plainText,cfg2);App.showToast('播放中...');}else App.showToast('无可播放内容');}
});});
},

dismissCtx:function(){if(Chat._ctxMenu){Chat._ctxMenu.remove();Chat._ctxMenu=null;}},

showEditDialog:function(idx){
var msg=Chat.messages[idx];if(!msg)return;
var overlay=document.createElement('div');overlay.className='ct-edit-overlay';
overlay.innerHTML='<div class="ct-edit-panel"><textarea class="ct-edit-ta" id="ctEditTA">'+App.esc(msg.content)+'</textarea><div class="ct-edit-btns"><button class="ct-edit-btn" id="ctEditSave" type="button" style="background:#1a1a1a;color:#fff;">保存</button><button class="ct-edit-btn" id="ctEditSendNew" type="button" style="background:#7a9ab8;color:#fff;">保存并重发</button><button class="ct-edit-btn" id="ctEditCancel" type="button" style="background:#f5f5f5;color:#666;border:1px solid #ddd;">取消</button></div></div>';
document.body.appendChild(overlay);
overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
overlay.querySelector('#ctEditCancel').addEventListener('click',function(){overlay.remove();});
overlay.querySelector('#ctEditSave').addEventListener('click',function(){var val=overlay.querySelector('#ctEditTA').value.trim();if(!val){App.showToast('内容不能为空');return;}Chat.messages[idx].content=val;Chat.saveMsgs();Chat.renderMessages();overlay.remove();});
overlay.querySelector('#ctEditSendNew').addEventListener('click',function(){var val=overlay.querySelector('#ctEditTA').value.trim();if(!val){App.showToast('内容不能为空');return;}overlay.remove();Chat.messages.splice(idx);Chat.messages.push({role:'user',content:val,ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();});
},

showSceneDialog:function(){
var current=App.LS.get('chatScene_'+Chat.charId)||'';
var overlay=document.createElement('div');overlay.className='ct-scene-overlay';
overlay.innerHTML='<div class="ct-scene-panel"><div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;margin-bottom:12px;">当前场景 / 时间线</div><div style="font-size:11px;color:#8aa0b8;margin-bottom:10px;line-height:1.5;">描述当前的时间、地点、剧情背景等。每次发送消息时会自动附带给AI。留空则不启用。</div><textarea class="ct-scene-ta" id="ctSceneTA" placeholder="例如：现在是深夜两点，你刚下班回家...">'+App.esc(current)+'</textarea><div class="ct-edit-btns"><button class="ct-edit-btn" id="ctSceneSave" type="button" style="background:#1a1a1a;color:#fff;">保存</button><button class="ct-edit-btn" id="ctSceneClear" type="button" style="background:#f5f5f5;color:#999;border:1px solid #ddd;">清空</button><button class="ct-edit-btn" id="ctSceneCancel" type="button" style="background:#f5f5f5;color:#666;border:1px solid #ddd;">取消</button></div></div>';
document.body.appendChild(overlay);
overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
overlay.querySelector('#ctSceneCancel').addEventListener('click',function(){overlay.remove();});
overlay.querySelector('#ctSceneClear').addEventListener('click',function(){App.LS.remove('chatScene_'+Chat.charId);overlay.remove();App.showToast('已清空场景');});
overlay.querySelector('#ctSceneSave').addEventListener('click',function(){var val=overlay.querySelector('#ctSceneTA').value.trim();if(val)App.LS.set('chatScene_'+Chat.charId,val);else App.LS.remove('chatScene_'+Chat.charId);overlay.remove();App.showToast('场景已保存');});
},

showBgMenu:function(){
var old=App.$('#ctBgMenu');if(old)old.remove();
var menu=document.createElement('div');menu.id='ctBgMenu';
menu.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
menu.innerHTML='<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:10px;"><div style="font-size:13px;font-weight:700;color:#333;text-align:center;letter-spacing:1px;margin-bottom:4px;">聊天背景</div><button class="ctbg-btn" data-act="album" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择</button><button class="ctbg-btn" data-act="url" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button><button class="ctbg-btn" data-act="del" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:12px;font-weight:500;color:#bbb;cursor:pointer;font-family:inherit;">移除背景</button><button class="ctbg-btn" data-act="cancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button></div>';
document.body.appendChild(menu);
menu.addEventListener('click',function(e){if(e.target===menu)menu.remove();});
menu.querySelectorAll('.ctbg-btn').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();var act=btn.dataset.act;menu.remove();
if(act==='cancel')return;
if(act==='del'){App.LS.remove('chatBg_'+Chat.charId);var bg=App.$('#ctBg');if(bg)bg.style.backgroundImage='';var nb=App.$('#ctNoBg');if(nb)nb.classList.remove('has-bg');App.showToast('已移除');return;}
if(act==='album'){var input=document.createElement('input');input.type='file';input.accept='image/*';document.body.appendChild(input);input.onchange=function(ev){var file=ev.target.files[0];document.body.removeChild(input);if(!file)return;var reader=new FileReader();reader.onload=function(r){compressImage(r.target.result,MAX_BG_SIZE,BG_QUALITY,function(c){Chat.setChatBg(c);});};reader.readAsDataURL(file);};input.click();return;}
if(act==='url'){var urlPanel=document.createElement('div');urlPanel.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';urlPanel.innerHTML='<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:280px;box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:12px;"><div style="font-size:13px;font-weight:700;color:#333;text-align:center;">输入背景图URL</div><input id="ctBgUrlInput" type="text" placeholder="https://..." style="padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;outline:none;font-family:inherit;color:#333;"><div style="display:flex;gap:8px;"><button id="ctBgUrlOk" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">确定</button><button id="ctBgUrlNo" type="button" style="flex:1;padding:11px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button></div></div>';document.body.appendChild(urlPanel);urlPanel.addEventListener('click',function(e){if(e.target===urlPanel)urlPanel.remove();});urlPanel.querySelector('#ctBgUrlNo').addEventListener('click',function(){urlPanel.remove();});urlPanel.querySelector('#ctBgUrlOk').addEventListener('click',function(){var url=urlPanel.querySelector('#ctBgUrlInput').value.trim();if(!url){App.showToast('请输入URL');return;}urlPanel.remove();Chat.setChatBg(url);});}
});});
},

setChatBg:function(src){try{App.LS.set('chatBg_'+Chat.charId,src);}catch(e){App.showToast('图片太大，请使用URL方式');return;}var bg=App.$('#ctBg');if(bg)bg.style.backgroundImage='url('+src+')';var nb=App.$('#ctNoBg');if(nb)nb.classList.add('has-bg');App.showToast('背景已设置');},

init:function(){App.chat=Chat;}
};

App.register('chat',Chat);
})();
