
(function(){
'use strict';
var App=window.App;if(!App)return;

var SPLIT='|||';
var MAX_CONTEXT=40;
var MAX_BG_SIZE=800;
var BG_QUALITY=0.7;

function compressImage(d,m,q,cb){var i=new Image();i.onload=function(){var w=i.width,h=i.height;if(w>h){if(w>m){h=h*m/w;w=m;}}else{if(h>m){w=w*m/h;h=m;}}var c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(i,0,0,w,h);cb(c.toDataURL('image/jpeg',q));};i.src=d;}
function fmtTime(ts){var d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function pad2(n){return n<10?'0'+n:''+n;}

function getCfg(charId){
var cfg=null;
if(App.charMgr){
  if(App.charMgr.charConfigs&&App.charMgr.charConfigs[charId])cfg=App.charMgr.charConfigs[charId];
  else if(App.charMgr.globalConfig)cfg=App.charMgr.globalConfig;
}
if(!cfg)cfg={mainLang:'简体中文',bilingual:false,biLang:'English',biStyle:'bracket',proactive:false,proMinInterval:15,proMaxInterval:120,proActiveStart:'00:00',proActiveEnd:'23:59',proMode:'manual',proLevel:3,replySpeed:'正常（3-8秒）',showTyping:true,minMsgs:1,maxMsgs:3,msgTypes:['文字'],stickerGen:false,stickerFreq:2,timeWeather:true,charCity:'',apiMode:'global',apiSelect:'',temperature:0.8,freqPenalty:0.3,presPenalty:0.3,fallbackTTS:false,minimax:false,stickerStyles:['可爱卡通'],imgApiUrl:'',imgApiKey:'',imgModel:'gpt-image-1'};
return cfg;
}

function getApi(charId){
var cfg=getCfg(charId);
if(cfg.apiMode==='individual'&&cfg.apiSelect){
  var list=App.LS.get('apiConfigs')||[];
  for(var i=0;i<list.length;i++){if(list[i].name===cfg.apiSelect)return list[i];}
}
return App.api?App.api.getActiveConfig():null;
}

function getParams(charId){
var cfg=getCfg(charId);
if(cfg.apiMode==='individual')return{temperature:cfg.temperature,freqPenalty:cfg.freqPenalty,presPenalty:cfg.presPenalty};
return App.api?App.api.getParams():{temperature:0.8,freqPenalty:0.3,presPenalty:0.3};
}

function getReplyDelay(cfg,textLen){
var speed=cfg.replySpeed||'正常（3-8秒）';
if(speed==='即时回复')return 0;
if(speed==='快速（1-3秒）')return 1000+Math.random()*2000;
if(speed==='正常（3-8秒）')return 3000+Math.random()*5000;
if(speed==='慢速（5-15秒）')return 5000+Math.random()*10000;
if(speed==='真实模拟（按字数）')return Math.min(textLen*150,20000);
return 3000+Math.random()*5000;
}

function buildSystemPrompt(charData,userData,sceneText,cfg){
var parts=[];
var lang=cfg.mainLang||'简体中文';

parts.push(
'你正在微信里和用户聊天。\n\n'+
'【最高优先级规则 - 违反任何一条都是严重错误】\n'+
'1. 你的回复必须是纯聊天对话，就像真人发微信。\n'+
'2. 绝对禁止任何叙事描写：不写动作（不写"他笑了""她叹气"）、不写心理活动、不写环境描写、不用*星号*或(括号)包裹旁白。\n'+
'3. 绝对禁止八股文式回复和网文模板（"嘴角微扬""一抹深意""不禁心头一颤"等全部禁止）。\n'+
'4. 绝对禁止油腻、霸总、超雄、舔狗式表达。\n'+
'5. 说话要像真人：口语化、自然、有个性。\n'+
'6. 认真理解用户每条消息的真实意图。不要敷衍。\n'+
'7. 根据角色性格决定说话风格。性格冷的就冷，话少的就少，毒舌的就毒舌。\n'+
'8. 你每次回复发送 '+Math.max(1,cfg.minMsgs||1)+' 到 '+Math.max(1,cfg.maxMsgs||3)+' 条消息，用 '+SPLIT+' 分隔。例如："第一条'+SPLIT+'第二条'+SPLIT+'第三条"。\n'+
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
  if(biStyle==='bracket')parts.push('\n【双语模式】每条消息后用括号附上'+biLang+'翻译。');
  else parts.push('\n【双语模式】每条消息后换行写'+biLang+'翻译。');
}

var allowedTypes=cfg.msgTypes||['文字'];
if(allowedTypes.indexOf('表情')>=0)parts.push('\n可以适当使用emoji表情。');
if(cfg.stickerGen&&allowedTypes.indexOf('图片')>=0){
  var stkFreq=['极少','偶尔','适中','经常','频繁'][Math.min((cfg.stickerFreq||2)-1,4)];
  parts.push('\n【表情包】适合时用[sticker:描述] 标记。频率：'+stkFreq+'。风格：'+(cfg.stickerStyles||['可爱卡通']).join('、')+'。');
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
  var envInfo='\n【当前环境 - 极其重要】\n现在是：'+timeStr+'\n你必须根据这个时间回复。现在是'+period+'，绝对不要说成其他时段。';
  if(App.calendar){
    var ws=App.calendar.getWeatherSummary();
    if(ws)envInfo+='\n用户所在地'+ws;
    if(cfg.charCity)envInfo+='\n角色所在城市：'+cfg.charCity+'（注意时差和天气差异）';
    var ss=App.calendar.getScheduleSummary();
    if(ss)envInfo+='\n'+ss;
  }
  envInfo+='\n自然融入对话，不要刻意提及，除非对话需要。';
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
  var levels=['非常被动','偶尔主动','适中','比较主动','非常粘人'];
  parts.push('\n【主动联系积极程度】'+levels[Math.min((cfg.proLevel||3)-1,4)]);
}

parts.push('\n【最终提醒】你在微信里打字聊天，不是写小说。输出纯对话文字。你就是这个角色，不是AI。');
return parts.join('\n');
}

// === TTS ===
function speakTTS(text,cfg,onEnd){
if(cfg.minimax&&cfg.mmVoiceId)return speakMiniMax(text,cfg,onEnd);
if(cfg.fallbackTTS)return speakFallback(text,cfg,onEnd);
}

function speakFallback(text,cfg,onEnd){
if(cfg.fallbackEngine==='OpenAI TTS')return speakOpenAI(text,cfg,onEnd);
if('speechSynthesis' in window){
  speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text);
  u.lang='zh-CN';u.rate=1;u.pitch=1;
  var voices=speechSynthesis.getVoices();
  var target=cfg.fallbackVoice||'';
  var targetName=target.split(' ')[0]||'';
  for(var i=0;i<voices.length;i++){if(targetName&&voices[i].name.indexOf(targetName)>=0){u.voice=voices[i];break;}}
  // 如果没找到指定音色，尝试匹配性别
  if(!u.voice&&target.indexOf('男')>=0){
    for(var j=0;j<voices.length;j++){if(voices[j].lang.indexOf('zh')>=0&&(voices[j].name.indexOf('Male')>=0||voices[j].name.indexOf('Yun')>=0)){u.voice=voices[j];break;}}
  }
  if(onEnd)u.onend=onEnd;
  speechSynthesis.speak(u);
  return{stop:function(){speechSynthesis.cancel();}};
}
}

function speakMiniMax(text,cfg,onEnd){
var key=cfg.mmApiKey||'';
if(!key){var gApi=App.api?App.api.getActiveConfig():null;if(gApi)key=gApi.key;}
if(!key||!cfg.mmVoiceId)return;
var audio=null;
fetch('https://api.minimax.chat/v1/t2a_v2',{
  method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
  body:JSON.stringify({model:'speech-01-turbo',text:text,voice_setting:{voice_id:cfg.mmVoiceId,speed:cfg.mmSpeed||1,pitch:cfg.mmPitch||0}})
}).then(function(r){return r.json();}).then(function(d){
  if(d&&d.data&&d.data.audio){audio=new Audio('data:audio/mp3;base64,'+d.data.audio);if(onEnd)audio.onended=onEnd;audio.play();}
}).catch(function(){});
return{stop:function(){if(audio){audio.pause();audio.currentTime=0;}}};
}

function speakOpenAI(text,cfg,onEnd){
var api=App.api?App.api.getActiveConfig():null;
if(!api)return;
var audio=null;
fetch(api.url.replace(/\/+$/,'')+'/audio/speech',{
  method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
  body:JSON.stringify({model:'tts-1',input:text,voice:'onyx'})
}).then(function(r){return r.blob();}).then(function(blob){
  audio=new Audio(URL.createObjectURL(blob));if(onEnd)audio.onended=onEnd;audio.play();
}).catch(function(){});
return{stop:function(){if(audio){audio.pause();audio.currentTime=0;}}};
}

// === 图片生成 ===
function generateSticker(desc,cfg,callback){
var imgUrl=cfg.imgApiUrl||'';var imgKey=cfg.imgApiKey||'';
if(!imgUrl){var gApi=App.api?App.api.getActiveConfig():null;if(gApi){imgUrl=gApi.url;if(!imgKey)imgKey=gApi.key;}}
if(!imgKey){var gApi2=App.api?App.api.getActiveConfig():null;if(gApi2)imgKey=gApi2.key;}
if(!imgUrl||!imgKey){callback(null);return;}
var model=cfg.imgModel||'gpt-image-1';
var prompt='Generate a cute chat sticker: '+desc+'. Style: '+(cfg.stickerStyles||['可爱卡通']).join(', ')+'. Simple, expressive.';
fetch(imgUrl.replace(/\/+$/,'')+'/images/generations',{
  method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+imgKey},
  body:JSON.stringify({model:model,prompt:prompt,n:1,size:'256x256',response_format:'url'})
}).then(function(r){return r.json();}).then(function(d){
  if(d&&d.data&&d.data[0])callback(d.data[0].url||d.data[0].b64_json);else callback(null);
}).catch(function(){callback(null);});
}

// === 主对象 ===
var Chat={
charId:null,charData:null,messages:[],isStreaming:false,abortCtrl:null,
_ctxMenu:null,_menuEl:null,_proTimer:null,_visHandler:null,_streamPartial:'',
_backgroundMode:false,_sendQueue:[],_isSendingQueue:false,_currentTTS:null,
_plusOpen:false,

loadMsgs:function(){Chat.messages=App.LS.get('chatMsgs_'+Chat.charId)||[];},
saveMsgs:function(){try{App.LS.set('chatMsgs_'+Chat.charId,Chat.messages);}catch(e){if(Chat.messages.length>20){Chat.messages=Chat.messages.slice(-20);try{App.LS.set('chatMsgs_'+Chat.charId,Chat.messages);}catch(e2){}}}},

// 未读计数
getUnread:function(charId){return App.LS.get('chatUnread_'+(charId||Chat.charId))||0;},
setUnread:function(charId,n){App.LS.set('chatUnread_'+(charId||Chat.charId),n);},
clearUnread:function(charId){App.LS.remove('chatUnread_'+(charId||Chat.charId));},

openInWechat:function(charId){
if(!App.character){App.showToast('character模块未加载');return;}
var c=App.character.getById(charId);
if(!c){App.showToast('角色不存在: '+charId);return;}
if(!App.chatUI){App.showToast('chatUI模块未加载，检查chat-ui.js文件');return;}
Chat.charId=charId;Chat.charData=c;Chat.loadMsgs();
Chat.clearUnread(charId);

var inner=App.$('#wxInner');if(!inner)return;
if(App.wechat)App.wechat._savedInner=inner.innerHTML;

Chat._backgroundMode=false;
Chat._sendQueue=[];
Chat._isSendingQueue=false;
Chat._plusOpen=false;

// 读取晕染配置
var bgUrl=App.LS.get('chatBg_'+charId)||'';
var tintOn=App.LS.get('chatTint_'+charId);if(tintOn===null)tintOn=true;
var hasBg=!!bgUrl;

// 读取主页晕染CSS直接复用
var wxInner=App.$('.wx-inner');
var tintStyle='';
if(wxInner){
  var computed=getComputedStyle(wxInner,'::before');
  // 无法直接读取伪元素，改为直接复制wx-inner的晕染
}

if(App.chatUI)App.chatUI.render(inner,c,bgUrl,hasBg,tintOn);

Chat.renderMessages();
Chat.bindEvents();
Chat.startProactive();

Chat._visHandler=function(){
  if(document.visibilityState==='visible')Chat._onResume();
};
document.addEventListener('visibilitychange',Chat._visHandler);
},

close:function(){
if(Chat.isStreaming){
  Chat._backgroundMode=true;
} else {
  Chat.stopProactive();
}
Chat.dismissCtx();Chat.dismissMenu();
if(Chat._currentTTS){Chat._currentTTS.stop();Chat._currentTTS=null;}
if(Chat._visHandler){document.removeEventListener('visibilitychange',Chat._visHandler);Chat._visHandler=null;}
if(App.wechat)App.wechat.restoreInner();
},

_onResume:function(){
if(!Chat.charId)return;
Chat.loadMsgs();
if(!Chat._backgroundMode){Chat.renderMessages();return;}
// 后台模式恢复
Chat._backgroundMode=false;
Chat.isStreaming=false;
Chat.renderMessages();
Chat.updateSendBtn();
Chat.updateTyping(false);
},

renderMessages:function(){
if(App.chatUI)App.chatUI.renderMessages();
},

scrollBottom:function(){var el=App.$('#ctMsgs');if(el)requestAnimationFrame(function(){el.scrollTop=el.scrollHeight;});},

bindEvents:function(){
if(App.chatUI)App.chatUI.bindEvents();
},

// === 发送队列（连续发送不被打断） ===
queueSend:function(text){
Chat._sendQueue.push(text);
if(!Chat._isSendingQueue&&!Chat.isStreaming){
  Chat._flushQueue();
}
},

_flushQueue:function(){
if(!Chat._sendQueue.length){Chat._isSendingQueue=false;return;}
Chat._isSendingQueue=true;
var text=Chat._sendQueue.shift();
Chat.messages.push({role:'user',content:text,ts:Date.now()});
Chat.saveMsgs();
Chat.renderMessages();
// 如果队列里还有消息，300ms后继续发
if(Chat._sendQueue.length){
  setTimeout(function(){Chat._flushQueue();},300);
} else {
  // 队列清空，开始请求AI
  Chat._isSendingQueue=false;
  var cfg=getCfg(Chat.charId);
  var delay=getReplyDelay(cfg,text.length);
  if(cfg.showTyping&&delay>0)Chat.updateTyping(true);
  if(delay>0)setTimeout(function(){Chat.requestAI();},delay);
  else Chat.requestAI();
  Chat.resetProactive();
}
},

send:function(){
var input=App.$('#ctInput');if(!input)return;
var text=input.value.trim();if(!text)return;
input.value='';input.style.height='auto';
// 关闭加号面板
var pp=App.$('#ctPlusPanel');if(pp)pp.classList.remove('show');Chat._plusOpen=false;

if(Chat.isStreaming){
  // 正在生成中，加入队列等待
  Chat._sendQueue.push(text);
  Chat.messages.push({role:'user',content:text,ts:Date.now()});
  Chat.saveMsgs();Chat.renderMessages();
  return;
}
Chat.queueSend(text);
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

Chat.isStreaming=true;Chat._streamPartial='';
if(!Chat._backgroundMode){Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(true);}

var url=api.url.replace(/\/+$/,'')+'/chat/completions';
Chat.abortCtrl=new AbortController();
var fullText='';

fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
body:JSON.stringify({model:api.model,messages:apiMsgs,stream:true,temperature:params.temperature,frequency_penalty:params.freqPenalty,presence_penalty:params.presPenalty}),
signal:Chat.abortCtrl.signal
}).then(function(resp){
if(!resp.ok)throw new Error('HTTP '+resp.status);
var reader=resp.body.getReader(),decoder=new TextDecoder(),buffer='';
function read(){return reader.read().then(function(result){
if(result.done){Chat.onStreamDone(fullText,cfg);return;}
buffer+=decoder.decode(result.value,{stream:true});var lines=buffer.split('\n');buffer=lines.pop()||'';
for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(!line||!line.startsWith('data:'))continue;var data=line.slice(5).trim();
if(data==='[DONE]'||data===''){Chat.onStreamDone(fullText,cfg);return;}
try{var json=JSON.parse(data);var delta=json.choices&&json.choices[0]&&json.choices[0].delta;if(delta&&delta.content){fullText+=delta.content;Chat._streamPartial=fullText;if(!Chat._backgroundMode)Chat.updateStreamBubble(fullText);}}catch(e){}}
return read();});}
return read();
}).catch(function(err){
Chat.isStreaming=false;
if(!Chat._backgroundMode){Chat.updateSendBtn();Chat.updateTyping(false);}
if(err.name==='AbortError')return;
if(fullText){
  Chat.messages.push({role:'assistant',content:fullText,ts:Date.now()});Chat.saveMsgs();
  if(Chat._backgroundMode){Chat.setUnread(Chat.charId,Chat.getUnread(Chat.charId)+1);}
  else{Chat.renderMessages();}
} else {
  if(!Chat._backgroundMode){Chat.messages.push({role:'system',content:'连接中断',ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();}
}
Chat._backgroundMode=false;
// 检查发送队列
if(Chat._sendQueue.length){setTimeout(function(){Chat._flushQueue();},500);}
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
  // TTS
  if(cfg&&(cfg.minimax||cfg.fallbackTTS)){
    var plainText=text.replace(/\[sticker:[^\]]*\]/g,'').replace(/\|\|\|/g,' ').trim();
    if(plainText)speakTTS(plainText,cfg);
  }
  // 后台模式：增加未读
  if(Chat._backgroundMode){
    Chat.setUnread(Chat.charId,Chat.getUnread(Chat.charId)+1);
    Chat._backgroundMode=false;
    // 检查发送队列
    if(Chat._sendQueue.length)setTimeout(function(){Chat._flushQueue();},500);
    return;
  }
}
Chat._backgroundMode=false;
Chat.updateSendBtn();Chat.updateTyping(false);
Chat.renderMessages();
// 检查发送队列
if(Chat._sendQueue.length)setTimeout(function(){Chat._flushQueue();},500);
},

stopStream:function(){
if(Chat.abortCtrl){Chat.abortCtrl.abort();Chat.abortCtrl=null;}
var partial=Chat._streamPartial||'';
Chat.isStreaming=false;Chat.updateSendBtn();Chat.updateTyping(false);
if(partial){Chat.messages.push({role:'assistant',content:partial,ts:Date.now()});Chat.saveMsgs();}
Chat.renderMessages();
},

updateSendBtn:function(){
if(App.chatUI)App.chatUI.updateSendBtn();
},

updateTyping:function(show){
if(App.chatUI)App.chatUI.updateTyping(show);
},

showMenu:function(){if(App.chatUI)App.chatUI.showMenu();},
dismissMenu:function(){if(Chat._menuEl){Chat._menuEl.remove();Chat._menuEl=null;}},

// === 长按菜单 ===
showCtxMenu:function(msgEl,x,y){
if(App.chatUI)App.chatUI.showCtxMenu(msgEl,x,y);
},
dismissCtx:function(){if(Chat._ctxMenu){Chat._ctxMenu.remove();Chat._ctxMenu=null;}},

// === 消息操作 ===
deleteMsg:function(idx){Chat.messages.splice(idx,1);Chat.saveMsgs();Chat.renderMessages();},

deleteFromHere:function(idx){
if(!confirm('删除此条及之后所有消息？'))return;
Chat.messages.splice(idx);Chat.saveMsgs();Chat.renderMessages();
App.showToast('已删除');
},

editMsg:function(idx){if(App.chatUI)App.chatUI.showEditDialog(idx);},

resendMsg:function(idx){
var msg=Chat.messages[idx];if(!msg)return;
var content=msg.content;
Chat.messages.splice(idx);
Chat.messages.push({role:'user',content:content,ts:Date.now()});
Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();
},

regenerate:function(idx){
Chat.messages.splice(idx);
Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();
},

copyMsg:function(idx){
var msg=Chat.messages[idx];if(!msg)return;
App.copyText(msg.content).then(function(){App.showToast('已复制');}).catch(function(){App.showToast('复制失败');});
},

speakMsg:function(idx){
var msg=Chat.messages[idx];if(!msg)return;
if(Chat._currentTTS){Chat._currentTTS.stop();Chat._currentTTS=null;App.showToast('已停止');return;}
var plainText=msg.content.replace(/\[sticker:[^\]]*\]/g,'').replace(/\|\|\|/g,' ').trim();
if(!plainText){App.showToast('无可播放内容');return;}
var cfg2=getCfg(Chat.charId);
App.showToast('播放中…');
Chat._currentTTS=speakTTS(plainText,cfg2,function(){Chat._currentTTS=null;App.showToast('播放完毕');});
},

// === 主动消息 ===
startProactive:function(){
Chat.stopProactive();
var cfg=getCfg(Chat.charId);
if(!cfg||!cfg.proactive)return;
var minMs=(cfg.proMinInterval||15)*60*1000;
var maxMs=(cfg.proMaxInterval||120)*60*1000;
function schedule(){
var delay=minMs+Math.random()*(maxMs-minMs);
Chat._proTimer=setTimeout(function(){
  if(!Chat.charId||Chat.isStreaming){schedule();return;}
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
apiMsgs.push({role:'system',content:'现在请你主动给用户发一条消息。保持自然简短。不要重复之前说过的话。'});

var url=api.url.replace(/\/+$/,'')+'/chat/completions';
Chat.isStreaming=true;
if(!Chat._backgroundMode){Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(true);}
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
try{var json=JSON.parse(data);var delta=json.choices&&json.choices[0]&&json.choices[0].delta;if(delta&&delta.content){fullText+=delta.content;if(!Chat._backgroundMode)Chat.updateStreamBubble(fullText);}}catch(e){}}
return read();});}
return read();
}).catch(function(){Chat.isStreaming=false;if(!Chat._backgroundMode){Chat.updateSendBtn();Chat.updateTyping(false);}});
},

// === 弹窗 ===
showSceneDialog:function(){if(App.chatUI)App.chatUI.showSceneDialog();},
showBgMenu:function(){if(App.chatUI)App.chatUI.showBgMenu();},
setChatBg:function(src){try{App.LS.set('chatBg_'+Chat.charId,src);}catch(e){App.showToast('图片太大，请用URL');return;}var bg=App.$('#ctBg');if(bg)bg.style.backgroundImage='url('+src+')';var nb=App.$('#ctNoBg');if(nb)nb.classList.add('has-bg');App.showToast('背景已设置');},

init:function(){App.chat=Chat;}
};

// 暴露工具函数给 chat-ui.js 使用
Chat._utils={getCfg:getCfg,getApi:getApi,fmtTime:fmtTime,SPLIT:SPLIT,generateSticker:generateSticker,compressImage:compressImage,MAX_BG_SIZE:MAX_BG_SIZE,BG_QUALITY:BG_QUALITY};

App.register('chat',Chat);
})();
