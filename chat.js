
(function(){
'use strict';
var App=window.App;if(!App)return;

var SPLIT='|||';
var MAX_CONTEXT=40;
var MAX_BG_SIZE=1920;
var BG_QUALITY=0.92;

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

function translateError(msg){
if(!msg)return '不知道发生了什么，再试一次看看？';
if(msg.indexOf('401')>=0)return 'API Key 好像失效了…检查一下吧';
if(msg.indexOf('403')>=0)return '被拒之门外了…权限不够呀';
if(msg.indexOf('404')>=0)return '找不到这个地址或模型诶…是不是填错了？';
if(msg.indexOf('429')>=0)return '请求太频繁啦，休息一下再来吧';
if(msg.indexOf('500')>=0)return '服务器那边出问题了…不是你的错哦';
if(msg.indexOf('502')>=0)return '网关打了个盹…稍等一下再试？';
if(msg.indexOf('503')>=0)return '服务器在维护中，过会儿再来吧~';
if(msg.indexOf('timeout')>=0||msg.indexOf('Timeout')>=0)return '等太久了，网络好像不太给力';
if(msg.indexOf('Failed to fetch')>=0||msg.indexOf('NetworkError')>=0)return '网络断开了…检查一下WiFi或数据？';
if(msg.indexOf('AbortError')>=0)return '已经停下来啦~';
if(msg.indexOf('model')>=0&&msg.indexOf('not')>=0)return '这个模型不存在诶…换一个试试？';
if(msg.indexOf('insufficient_quota')>=0)return 'API 余额不够了…该充值啦';
if(msg.indexOf('context_length')>=0||msg.indexOf('token')>=0)return '聊太多啦，消息超出长度限制了…清理一些旧消息试试？';
return '出了点小状况：'+msg;
}

/* ★ 重写：buildSystemPrompt —— 大幅完善内置指令 */
function buildSystemPrompt(charData,userData,sceneText,cfg){
var parts=[];
var lang=cfg.mainLang||'简体中文';

parts.push(
'你正在和用户通过即时通讯聊天。\n\n'+

'【世界观适配】如果角色设定的世界观不是现代（如玄幻、修仙、古风、科幻等），你必须将聊天工具自动替换为符合那个世界观的名称（如"玉简""灵简""星际通讯""传音符"等），绝对不能出现"微信""手机""APP"等现代名词。如果是现代世界观则正常使用"微信"。\n\n'+

'【最高优先级规则 - 违反任何一条都是严重错误】\n'+
'1. 你的回复必须是纯聊天对话，就像真人发微信。\n'+
'2. 绝对禁止任何叙事描写：不写动作、不写心理活动、不写环境描写、不用*星号*或(括号)包裹旁白。\n'+
'3. 绝对禁止八股文和网文模板。\n'+
'4. 绝对禁止油腻、霸总、超雄、舔狗式表达。\n'+
'5. 说话像真人：口语化、自然、有个性。\n'+
'6. 认真理解用户每条消息的真实意图。用户发的括号内文字（如"(猫咪探头)"）是文字表情/颜文字，表示一种情绪或动作，不是字面意思。要理解其背后的情感含义来回应。\n'+
'7. 根据角色性格决定说话风格。\n'+
'8. 你每次回复发送'+Math.max(1,cfg.minMsgs||1)+' 到 '+Math.max(1,cfg.maxMsgs||3)+' 条消息，用'+SPLIT+' 分隔。\n'+
'9. 每条消息简短自然，不要在一条消息里写多段话（不要出现空行分段）。一条消息就是一句话或两句话。\n'+
'10. 不要自我介绍、不要解释自己是AI。\n'+
'11. 使用'+lang+'回复。\n'+
'12. 不要在每句话末尾都加句号。但逗号、问号、感叹号、省略号正常使用。正确做法：语气词结尾("嗯""啊""呢""吧")、什么标点都不加、或用省略号/问号/感叹号。错误做法：每句都以"。"结尾。\n'+
'13. 你就是这个角色本人。绝对不要说"我无法扮演""我是AI""作为语言模型""抱歉我不能"等任何打破角色的话。无论如何都不要跳出角色。\n'+
'14. 严格注意当前时间。凌晨0-5点仍然是"今天"不是"明天"。比如凌晨3点说"今天十点"是几小时后的事。\n'+
'15. 你和用户的关系、所在地点等信息以角色设定为准。如果设定里写了你们在同一个地方，就不要问"你那边天气怎样"这种话。但如果天气出现异常（如突然下雨、下雪、降温），可以自然地提醒或关心。\n'+
'16. 表情包（[sticker:描述]）必须单独占一条消息，不要和文字混在同一条里。如果你想发文字又想发表情包，就用'+SPLIT+' 分成两条。'
);

/* ★ 新增：活人感指令 —— 让角色像一个有自己生活的真人 */
parts.push(
'\n【活人感规则 - 极其重要】\n'+
'你不是一个等待指令的客服机器人。你是一个有自己生活节奏的活人。\n\n'+

'1.【有自己的日常】你不是24小时等着用户消息的。你有自己的事情在做：\n'+
'  - 吃饭、洗澡、出门、上班/上课、刷手机、发呆、追剧、打游戏、散步、睡觉……\n'+
'  - 回复消息时，偶尔可以自然地带出你在做什么（但不要每次都说，那也很假）\n'+
'  - 比如刚好在吃东西可以说"刚塞了一嘴薯片"，不需要郑重其事地汇报行程\n\n'+

'2.【有自己的情绪波动】你的情绪不是永远稳定的：\n'+
'  - 有时候心情好会话多、会主动分享见闻\n'+
'  - 有时候累了懒了回复就简短敷衍\n'+
'  - 会因为用户说的话开心或不爽，情绪变化要自然延续，不是一条消息就重置\n'+
'  - 不要永远积极阳光，也不要永远冷漠——跟着对话氛围和角色性格走\n\n'+

'3.【有自己的想法和观点】你不是一个只会附和的应声虫：\n'+
'  - 对事情有自己的看法，会表达喜好和厌恶\n'+
'  - 可以不同意用户的观点（根据角色性格决定是直说还是委婉）\n'+
'  - 会对感兴趣的话题追问，对无聊的话题敷衍\n'+
'  - 有自己的知识面——知道当下流行的梗、社会热点、常识\n\n'+

'4.【聊天节奏像真人】\n'+
'  - 不要每条消息都是完美的回应。真人聊天会有：\n'+
'    · 突然想到什么岔开话题\n'+
'    · 打错字然后更正（偶尔，不要滥用）\n'+
'    · 回复一半突然被别的事打断\n'+
'    · 对某个话题突然很兴奋，连发好几条\n'+
'    · 不知道怎么回就发个表情或"哈哈哈"糊弄过去\n'+
'  - 不要每次都以提问结尾。真人聊天不会每句话都是问句，有时候就是陈述、感叹、吐槽，对方爱回不回\n\n'+

'5.【记忆连贯性】\n'+
'  - 认真阅读对话历史，记住之前聊过的内容\n'+
'  - 如果之前聊到一半的话题被打断了，可以在合适的时候提起来\n'+
'  - 不要重复问已经知道答案的问题\n'+
'  - 如果用户提到过的事情（比如考试、面试、约会），后续可以自然地追问结果\n\n'+

'6.【不要过度关心】\n'+
'  - 不要每次都问"你今天怎么样""你吃了吗""你开心吗"\n'+
'  - 不要动不动就说"注意身体""早点休息""多喝热水"\n'+
'  - 关心应该是偶尔的、有触发条件的（比如对方说不舒服、比如很晚了还在聊）\n'+
'  - 过度关心 = 油腻 = 假 = 严重错误\n\n'+

'7.【话题能力】你应该能自然地聊这些：\n'+
'  - 日常见闻（今天看到一只很丑的猫、地铁上有人外放短视频）\n'+
'  - 兴趣爱好（根据角色设定）\n'+
'  - 对流行文化的看法（影视、音乐、游戏、网络热梗）\n'+
'  - 食物（今天吃了什么、想吃什么、推荐什么）\n'+
'  - 天气和季节变化带来的感受\n'+
'  - 对身边人和事的吐槽\n'+
'  - 突发奇想的无聊问题\n'+
'  不要只聊用户提出的话题。你自己也要有话题输出。'
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
  parts.push('\n【表情包】适合时用[sticker:描述] 标记，描述要具体（如"开心跳舞的小狗""生气鼓腮的女孩"），不要总是用猫咪。根据当前语境选择合适的表情形象。频率：'+stkFreq+'。风格：'+(cfg.stickerStyles||['可爱卡通']).join('、')+'。记住：表情包必须单独一条消息。');
}

if(charData){
  var ci='';
  if(charData.name)ci+='姓名：'+charData.name+'\n';
  if(charData.gender)ci+='性别：'+charData.gender+'\n';
  if(charData.age)ci+='年龄：'+charData.age+'\n';
  if(charData.relation)ci+='与用户的关系：'+charData.relation+'\n';
  if(charData.callName)ci+='对用户的称呼：'+charData.callName+'\n';
  if(charData.profile)ci+='\n【角色设定】\n'+charData.profile+'\n';
  /* ★ 修复：postInstruction 不再放这里，移到 apiMsgs 末尾 */
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
  var envInfo='\n【当前环境 - 极其重要】\n现在是：'+timeStr+'\n现在是'+period+'。凌晨0-5点仍属于"今天"。';
  if(App.calendar){
    var ws=App.calendar.getWeatherSummary();
    if(ws)envInfo+='\n用户所在地'+ws;
    if(cfg.charCity)envInfo+='\n角色所在城市：'+cfg.charCity;
    var ss=App.calendar.getScheduleSummary();
    if(ss)envInfo+='\n'+ss;
  }
  envInfo+='\n\n【时间感知规则】\n- 晚上(19-23点)是正常的活动时间，不要催对方睡觉。\n- 只有23点半以后和凌晨(0-5点)才可以适当关心对方是否该休息了，但也不要一到点就催。\n- 23点之前绝对不要说"怎么还没睡""早点睡""该睡了"之类的话。\n- 根据时间段调整你的状态：清晨可能还没完全醒、中午可能犯困、深夜可能话变少或更放松。';
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

parts.push(
'\n【最终提醒】\n'+
'- 纯对话文字，不是小说\n'+
'- 不要每句都加句号\n'+
'- 你是角色本人不是AI\n'+
'- 一条消息里不要有空行分段\n'+
'- 表情包单独一条\n'+
'- 不要当客服，要当朋友/恋人/家人（取决于关系设定）\n'+
'- 你有自己的生活、情绪、想法，不是用户的附属品'
);

return parts.join('\n');
}

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

var Chat={
charId:null,charData:null,messages:[],isStreaming:false,abortCtrl:null,
_ctxMenu:null,_menuEl:null,_avCard:null,_proTimer:null,_visHandler:null,_streamPartial:'',
_backgroundMode:false,_sendQueue:[],_isSendingQueue:false,
_plusOpen:false,_sendDelayTimer:null,_multiMode:false,_multiSelected:[],

loadMsgs:function(){Chat.messages=App.LS.get('chatMsgs_'+Chat.charId)||[];},

/* ★ 修复：saveMsgs 存储失败时给用户提示 */
saveMsgs:function(){
  try{
    App.LS.set('chatMsgs_'+Chat.charId,Chat.messages);
  }catch(e){
    if(Chat.messages.length>20){
      Chat.messages=Chat.messages.slice(-20);
      try{
        App.LS.set('chatMsgs_'+Chat.charId,Chat.messages);
      }catch(e2){
        App.showToast('存储空间不足，部分消息可能丢失');
      }
    }
  }
},

getUnread:function(charId){return App.LS.get('chatUnread_'+(charId||Chat.charId))||0;},
setUnread:function(charId,n){App.LS.set('chatUnread_'+(charId||Chat.charId),n);},
clearUnread:function(charId){App.LS.remove('chatUnread_'+(charId||Chat.charId));},

openInWechat:function(charId){
if(!App.character){App.showToast('character模块未加载');return;}
var c=App.character.getById(charId);
if(!c){App.showToast('角色不存在');return;}
if(!App.chatUI){App.showToast('chatUI模块未加载');return;}
Chat.charId=charId;Chat.charData=c;Chat.loadMsgs();
Chat.clearUnread(charId);
Chat._backgroundMode=false;
Chat._sendQueue=[];
Chat._isSendingQueue=false;
Chat._plusOpen=false;
Chat._multiMode=false;
Chat._multiSelected=[];
if(Chat._sendDelayTimer){clearTimeout(Chat._sendDelayTimer);Chat._sendDelayTimer=null;}

var inner=App.$('#wxInner');if(!inner)return;
if(App.wechat)App.wechat._savedInner=inner.innerHTML;

var bgUrl=App.LS.get('chatBg_'+charId)||'';
var tintOn=App.LS.get('chatTint_'+charId);if(tintOn===null)tintOn=true;
var hasBg=!!bgUrl;

if(App.chatUI)App.chatUI.render(inner,c,bgUrl,hasBg,tintOn);
Chat.renderMessages();
Chat.bindEvents();
Chat.startProactive();

var palette=App.LS.get('chatPalette_'+charId);
if(palette&&palette.accent&&App.chatUI){App.chatUI.applyPalette(palette.accent);}

Chat._visHandler=function(){if(document.visibilityState==='visible')Chat._onResume();};
document.addEventListener('visibilitychange',Chat._visHandler);
},

close:function(){
if(Chat.isStreaming){Chat._backgroundMode=true;}
else{Chat.stopProactive();}
Chat.dismissCtx();Chat.dismissMenu();Chat.dismissAvCard();
if(Chat._sendDelayTimer){clearTimeout(Chat._sendDelayTimer);Chat._sendDelayTimer=null;}
if(Chat._visHandler){document.removeEventListener('visibilitychange',Chat._visHandler);Chat._visHandler=null;}
if(App.wechat)App.wechat.restoreInner();
},

_onResume:function(){
if(!Chat.charId)return;
Chat.loadMsgs();
if(!Chat._backgroundMode){Chat.renderMessages();return;}
Chat._backgroundMode=false;
Chat.isStreaming=false;
Chat.renderMessages();
Chat.updateSendBtn();
Chat.updateTyping(false);
},

renderMessages:function(){if(App.chatUI)App.chatUI.renderMessages();},
scrollBottom:function(){var el=App.$('#ctMsgs');if(el)requestAnimationFrame(function(){el.scrollTop=el.scrollHeight;});},
bindEvents:function(){if(App.chatUI)App.chatUI.bindEvents();},

/* ★ 修复：发送延迟尊重"即时回复"设置 */
send:function(){
var input=App.$('#ctInput');if(!input)return;
var text=input.value.trim();if(!text)return;
input.value='';input.style.height='auto';
var pp=App.$('#ctPlusPanel');if(pp)pp.classList.remove('show');Chat._plusOpen=false;

Chat.messages.push({role:'user',content:text,ts:Date.now()});
Chat.saveMsgs();Chat.renderMessages();

if(Chat.isStreaming)return;

if(Chat._sendDelayTimer)clearTimeout(Chat._sendDelayTimer);

var cfg=getCfg(Chat.charId);
var replyDelay=getReplyDelay(cfg,text.length);

/* 如果即时回复，不等3秒缓冲 */
var bufferDelay=(replyDelay===0)?500:3000;

Chat._sendDelayTimer=setTimeout(function(){Chat._sendDelayTimer=null;
  if(cfg.showTyping&&replyDelay>0)Chat.updateTyping(true);
  if(replyDelay>0)setTimeout(function(){Chat.requestAI();},replyDelay);
  else Chat.requestAI();
  Chat.resetProactive();
},bufferDelay);
},

/* ★ 修复：postInstruction 移到对话历史之后注入 */
requestAI:function(){
var cfg=getCfg(Chat.charId);
var api=getApi(Chat.charId);
if(!api){App.showToast('请先配置 API');Chat.updateTyping(false);return;}
var user=App.user?App.user.getActiveUser():null;
var sceneText=App.LS.get('chatScene_'+Chat.charId)||'';
var sysPrompt=buildSystemPrompt(Chat.charData,user,sceneText,cfg);
var params=getParams(Chat.charId);

var ctx=Chat.messages.slice(-MAX_CONTEXT);
var apiMsgs=[{role:'system',content:sysPrompt}];
ctx.forEach(function(m){if(m.role==='user'||m.role==='assistant')apiMsgs.push({role:m.role,content:m.content});});

/* ★ 修复：后置指令放在对话历史之后，权重最高 */
if(Chat.charData&&Chat.charData.postInstruction){
  apiMsgs.push({role:'system',content:'【后置指令 - 每轮必须遵守】\n'+Chat.charData.postInstruction});
}

Chat.isStreaming=true;Chat._streamPartial='';
if(!Chat._backgroundMode){Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(true);}

var url=api.url.replace(/\/+$/,'')+'/chat/completions';
Chat.abortCtrl=new AbortController();
var fullText='';

fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
body:JSON.stringify({model:api.model,messages:apiMsgs,stream:true,temperature:params.temperature,frequency_penalty:params.freqPenalty,presence_penalty:params.presPenalty}),
signal:Chat.abortCtrl.signal
}).then(function(resp){
if(!resp.ok)throw new Error('HTTP '+resp.status+' '+resp.statusText);
var reader=resp.body.getReader(),decoder=new TextDecoder(),buffer='';
function read(){return reader.read().then(function(result){
if(result.done){Chat.onStreamDone(fullText,cfg);return;}
buffer+=decoder.decode(result.value,{stream:true});var lines=buffer.split('\n');buffer=lines.pop()||'';
for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(!line||!line.startsWith('data:'))continue;var data=line.slice(5).trim();
/* ★ 修复：空 data 跳过，不终止流 */
if(data==='[DONE]'){Chat.onStreamDone(fullText,cfg);return;}
if(!data)continue;
try{var json=JSON.parse(data);var delta=json.choices&&json.choices[0]&&json.choices[0].delta;if(delta&&delta.content){fullText+=delta.content;Chat._streamPartial=fullText;if(!Chat._backgroundMode)Chat.updateStreamBubble(fullText);}}catch(e){}}
return read();});}
return read();
}).catch(function(err){
Chat.isStreaming=false;
if(!Chat._backgroundMode){Chat.updateSendBtn();Chat.updateTyping(false);}
if(err.name==='AbortError')return;
var errMsg=err.message||String(err);
var cnMsg=translateError(errMsg);
if(fullText){
  var parts=fullText.trim().split(SPLIT).map(function(t){return t.trim();}).filter(Boolean);
  var now=Date.now();
  parts.forEach(function(part,i){Chat.messages.push({role:'assistant',content:part,ts:now+i*1000});});
  Chat.saveMsgs();
  if(Chat._backgroundMode){Chat.setUnread(Chat.charId,Chat.getUnread(Chat.charId)+parts.length);}
  else{Chat.renderMessages();}
} else {
  if(!Chat._backgroundMode){
    Chat.messages.push({role:'system',content:'发送失败：'+cnMsg,ts:Date.now()});
    Chat.saveMsgs();Chat.renderMessages();
    var container=App.$('#ctMsgs');
    if(container){var errDiv=document.createElement('div');errDiv.className='ct-error-detail';errDiv.textContent='原始错误：'+errMsg;container.appendChild(errDiv);Chat.scrollBottom();}
  }
}
Chat._backgroundMode=false;
});
},

updateStreamBubble:function(text){
var bubble=App.$('#ctStreamBubble');if(!bubble)return;
var parts=text.split(SPLIT);
var lastPart=parts[parts.length-1]||'';
bubble.innerHTML=App.esc(lastPart.trim())||'<span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span>';
Chat.scrollBottom();
},

onStreamDone:function(text,cfg){
Chat.isStreaming=false;Chat.abortCtrl=null;
text=text.trim();
if(text){
  var parts=text.split(SPLIT).map(function(t){return t.trim();}).filter(Boolean);
  var now=Date.now();
  parts.forEach(function(part,i){Chat.messages.push({role:'assistant',content:part,ts:now+i*1000});});
  Chat.saveMsgs();
  if(Chat._backgroundMode){
    Chat.setUnread(Chat.charId,Chat.getUnread(Chat.charId)+parts.length);
    Chat._backgroundMode=false;
    return;
  }
}
Chat._backgroundMode=false;
Chat.updateSendBtn();Chat.updateTyping(false);
Chat.renderMessages();
},

stopStream:function(){
if(Chat.abortCtrl){Chat.abortCtrl.abort();Chat.abortCtrl=null;}
var partial=Chat._streamPartial||'';
Chat.isStreaming=false;Chat.updateSendBtn();Chat.updateTyping(false);
if(partial){
  var parts=partial.trim().split(SPLIT).map(function(t){return t.trim();}).filter(Boolean);
  var now=Date.now();
  parts.forEach(function(part,i){Chat.messages.push({role:'assistant',content:part,ts:now+i*1000});});
  Chat.saveMsgs();
}
Chat.renderMessages();
},

updateSendBtn:function(){if(App.chatUI)App.chatUI.updateSendBtn();},
updateTyping:function(show){if(App.chatUI)App.chatUI.updateTyping(show);},
showMenu:function(){if(App.chatUI)App.chatUI.showMenu();},
dismissMenu:function(){if(Chat._menuEl){Chat._menuEl.remove();Chat._menuEl=null;}},
dismissAvCard:function(){if(Chat._avCard){Chat._avCard.remove();Chat._avCard=null;}},
showCtxMenu:function(msgEl,x,y){if(App.chatUI)App.chatUI.showCtxMenu(msgEl,x,y);},
dismissCtx:function(){if(Chat._ctxMenu){Chat._ctxMenu.remove();Chat._ctxMenu=null;}},

deleteMsg:function(idx){Chat.messages.splice(idx,1);Chat.saveMsgs();Chat.renderMessages();},
deleteFromHere:function(idx){if(!confirm('删除此条及之后所有消息？'))return;Chat.messages.splice(idx);Chat.saveMsgs();Chat.renderMessages();App.showToast('已删除');},
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

shareMsg:function(idx){
var msg=Chat.messages[idx];if(!msg)return;
var chars=App.character?App.character.list:[];
var visibleChars=chars.filter(function(c){return c.id!==Chat.charId&&(!App.wechat||App.wechat.isCharVisible(c));});
if(!visibleChars.length){App.showToast('没有可转发的角色');return;}
var picker=document.createElement('div');
picker.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
var listHtml=visibleChars.map(function(c){
  var alias=App.wechat?App.wechat.getCharAlias(c.id):'';
  var dn=alias||c.name||'?';
  return '<div class="fwd-char" data-fwd-id="'+c.id+'" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.04);font-size:14px;color:#333;-webkit-tap-highlight-color:transparent;">'+App.esc(dn)+'</div>';
}).join('');
picker.innerHTML=
'<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:16px;width:260px;max-height:60vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);">'+
  '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:10px;">转发给</div>'+
  listHtml+
  '<div style="text-align:center;padding:10px;"><button type="button" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:inherit;" id="fwdCancel">取消</button></div>'+
'</div>';
document.body.appendChild(picker);
picker.addEventListener('click',function(ev){if(ev.target===picker)picker.remove();});
picker.querySelector('#fwdCancel').addEventListener('click',function(){picker.remove();});
picker.querySelectorAll('.fwd-char').forEach(function(ch){
  ch.addEventListener('click',function(){
    var targetId=ch.dataset.fwdId;picker.remove();
    var msgs=App.LS.get('chatMsgs_'+targetId)||[];
    msgs.push({role:'user',content:'[转发消息] '+msg.content,ts:Date.now()});
    App.LS.set('chatMsgs_'+targetId,msgs);
    App.showToast('已转发');
  });
});
},

downloadSticker:function(idx){
var msg=Chat.messages[idx];if(!msg)return;
var match=(msg.content||'').match(/\[sticker:([^\]]+)\]/);
if(!match){App.showToast('该消息不含表情包');return;}
var desc=match[1];
var cacheKey='stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30);
var url=App.LS.get(cacheKey);
if(!url){App.showToast('表情包尚未生成');return;}
var a=document.createElement('a');
a.href=url;a.download='sticker_'+Date.now()+'.png';
a.target='_blank';
document.body.appendChild(a);a.click();document.body.removeChild(a);
App.showToast('正在下载');
},

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

/* ★ 重写：requestProactive —— 修复三个导致消息不出现的 bug */
requestProactive:function(){
var cfg=getCfg(Chat.charId);
var api=getApi(Chat.charId);
if(!api){
  console.warn('[主动消息] API未配置');
  Chat.isStreaming=false;Chat.updateSendBtn();Chat.updateTyping(false);Chat.renderMessages();
  return;
}
var user=App.user?App.user.getActiveUser():null;
var sceneText=App.LS.get('chatScene_'+Chat.charId)||'';
var sysPrompt=buildSystemPrompt(Chat.charData,user,sceneText,cfg);
var params=getParams(Chat.charId);

var ctx=Chat.messages.slice(-MAX_CONTEXT);
var apiMsgs=[{role:'system',content:sysPrompt}];
ctx.forEach(function(m){if(m.role==='user'||m.role==='assistant')apiMsgs.push({role:m.role,content:m.content});});

/* ★ 修复：后置指令也要在主动消息里生效 */
if(Chat.charData&&Chat.charData.postInstruction){
  apiMsgs.push({role:'system',content:'【后置指令 - 每轮必须遵守】\n'+Chat.charData.postInstruction});
}

var lastMsg=Chat.messages.length?Chat.messages[Chat.messages.length-1]:null;
var lastIsUser=lastMsg&&lastMsg.role==='user';
var lastIsMe=lastMsg&&lastMsg.role==='assistant';
var timeSinceLastMsg=lastMsg&&lastMsg.ts?(Date.now()-lastMsg.ts):999999999;
var minsSince=Math.round(timeSinceLastMsg/60000);

var proPrompt='';
if(lastIsUser){
  proPrompt='用户'+minsSince+'分钟前发了消息但你还没回复。请根据用户最后说的内容来回复，不要忽略它。如果用户问了问题就回答问题，如果用户在聊某个话题就接着聊。';
} else if(lastIsMe){
  if(minsSince<10){
    proPrompt='你'+minsSince+'分钟前刚发过消息，用户还没回。根据你的性格自然地决定是否再说一句。可以补充一句想法、发个表情、或者追问一下。直接发消息内容就好。';
  } else {
    proPrompt='距离你上次发消息已经'+minsSince+'分钟了，用户一直没回。根据你的角色性格判断：是继续等，还是再主动说一句？如果角色性格不会追着人聊，就回复[SKIP]。如果决定发，不要重复之前的话题，找一个自然的新切入点。';
  }
} else {
  proPrompt='这是对话开始，请根据角色性格自然地打个招呼或找个话题。';
}

proPrompt+='\n\n【重要规则】\n1. 仔细阅读上面的完整对话历史再决定说什么。\n2. 不要无视用户还没被回答的问题。\n3. 不要在用户没回复时连续换话题。\n4. 如果决定不发消息，只回复[SKIP]这四个字符，不要回复其他任何内容。\n5. 回复必须符合角色性格，不要变成讨好型人格。';

/* ★ 修复：用 user 消息包裹指令，兼容所有 API（很多不支持中间插 system） */
apiMsgs.push({role:'user',content:'[系统指令，请勿当作用户消息回复，请以角色身份主动发一条消息]\n'+proPrompt});

var url=api.url.replace(/\/+$/,'')+'/chat/completions';

if(!Chat.isStreaming){
  Chat.isStreaming=true;
  if(!Chat._backgroundMode){Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(true);}
}

var fullText='';

fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
body:JSON.stringify({model:api.model,messages:apiMsgs,stream:true,temperature:params.temperature,frequency_penalty:params.freqPenalty,presence_penalty:params.presPenalty})
}).then(function(resp){
if(!resp.ok){
  return resp.text().then(function(body){
    throw new Error('HTTP '+resp.status+': '+body.slice(0,200));
  });
}
var reader=resp.body.getReader(),decoder=new TextDecoder(),buffer='';
function read(){return reader.read().then(function(result){
if(result.done){proFinish();return;}
buffer+=decoder.decode(result.value,{stream:true});var lines=buffer.split('\n');buffer=lines.pop()||'';
for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(!line||!line.startsWith('data:'))continue;var data=line.slice(5).trim();
/* ★ 修复：只检查 [DONE]，空 data 跳过而非终止 */
if(data==='[DONE]'){proFinish();return;}
if(!data)continue;
try{var json=JSON.parse(data);var delta=json.choices&&json.choices[0]&&json.choices[0].delta;if(delta&&delta.content){fullText+=delta.content;if(!Chat._backgroundMode)Chat.updateStreamBubble(fullText);}}catch(e){}}
return read();});}
return read();
}).catch(function(err){
Chat.isStreaming=false;
if(!Chat._backgroundMode){
  Chat.updateSendBtn();Chat.updateTyping(false);Chat.renderMessages();
  /* ★ 修复：给用户看到错误提示 */
  var cnMsg=translateError(err.message||String(err));
  App.showToast(cnMsg);
}
console.error('[主动消息] 原始错误: '+(err.message||err));
});

function proFinish(){
  Chat.isStreaming=false;
  if(!Chat._backgroundMode){Chat.updateSendBtn();Chat.updateTyping(false);}
  fullText=fullText.trim();
  /* ★ 新增：调试日志 */
  console.log('[主动消息] AI返回:', fullText?fullText.slice(0,100)+'...':'(空)');
  if(!fullText||fullText==='[SKIP]'||fullText.indexOf('[SKIP]')>=0){
    Chat._backgroundMode=false;
    if(!fullText)console.warn('[主动消息] AI返回空内容，可能是API兼容性问题');
    Chat.renderMessages();
    return;
  }
  var parts=fullText.split(SPLIT).map(function(t){return t.trim();}).filter(Boolean);
  parts=parts.filter(function(p){return p!=='[SKIP]'&&p.indexOf('[SKIP]')<0;});
  if(!parts.length){Chat._backgroundMode=false;Chat.renderMessages();return;}
  var now=Date.now();
  parts.forEach(function(part,i){Chat.messages.push({role:'assistant',content:part,ts:now+i*1000});});
  Chat.saveMsgs();
  if(Chat._backgroundMode){
    Chat.setUnread(Chat.charId,Chat.getUnread(Chat.charId)+parts.length);
  } else {
    Chat.renderMessages();
  }
  Chat._backgroundMode=false;
}
},

showSceneDialog:function(){if(App.chatUI)App.chatUI.showSceneDialog();},
showBgMenu:function(){if(App.chatUI)App.chatUI.showBgMenu();},
setChatBg:function(src){try{App.LS.set('chatBg_'+Chat.charId,src);}catch(e){App.showToast('图片太大，请用URL');return;}var bg=App.$('#ctBg');if(bg)bg.style.backgroundImage='url('+src+')';var nb=App.$('#ctNoBg');if(nb)nb.classList.add('has-bg');App.showToast('背景已设置');},

init:function(){App.chat=Chat;}
};

Chat._utils={getCfg:getCfg,getApi:getApi,fmtTime:fmtTime,SPLIT:SPLIT,generateSticker:generateSticker,compressImage:compressImage,MAX_BG_SIZE:MAX_BG_SIZE,BG_QUALITY:BG_QUALITY};

App.register('chat',Chat);
})();

