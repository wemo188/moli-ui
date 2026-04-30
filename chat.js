
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

/* ★ 收集世界书条目（按位置分类） */
function collectWorldBookEntries(charId,chatHistory){
var result={before:[],after:[],depth:[]};
if(!App.worldbook)return result;
var entries=App.worldbook.getEntriesForChar(charId);
if(!entries||!entries.length)return result;

var historyText='';
if(chatHistory&&chatHistory.length){
  historyText=chatHistory.map(function(m){return m.content||'';}).join(' ').toLowerCase();
}

entries.forEach(function(e){
  if(e.enabled===false)return;
  var shouldInclude=false;
  if(e.always)shouldInclude=true;
  else if(e.useKeyword&&e.keyword){
    var keywords=e.keyword.split(/[,，]/).map(function(k){return k.trim().toLowerCase();}).filter(Boolean);
    for(var i=0;i<keywords.length;i++){
      if(historyText.indexOf(keywords[i])>=0){shouldInclude=true;break;}
    }
  } else {
    shouldInclude=true;
  }
  if(!shouldInclude)return;
  var pos=e.position||'before';
  if(pos==='depth')result.depth.push({content:e.content,depth:e.depth||4});
  else if(pos==='after')result.after.push(e.content);
  else result.before.push(e.content);
});
return result;
}

/* ★ 获取当前启用的预设的 order 和 items */
function getActivePreset(){
if(!App.preset)return null;
var list=App.LS.get('presetList')||[];
for(var i=0;i<list.length;i++){
  if(list[i].enabled===true)return list[i];
}
return null;
}

/* ★ 内置格式规则（用户不需要看到，纯格式层面） */
function buildFormatRules(cfg){
var lang=cfg.mainLang||'简体中文';
return '你正在和用户通过即时通讯聊天。\n\n'+
'【世界观适配】如果角色设定的世界观不是现代（如玄幻、修仙、古风、科幻等），将聊天工具替换为符合世界观的名称，不出现"微信""手机""APP"等现代名词。\n\n'+
'【格式规则】\n'+
'1. 纯聊天对话，禁止叙事描写、*星号旁白*、(括号动作)。\n'+
'2. 使用'+lang+'回复。\n'+
'3. 【消息条数 - 必须严格遵守】每次回复必须发送 '+Math.max(1,cfg.minMsgs||1)+' 到 '+Math.max(1,cfg.maxMsgs||3)+' 条消息，用 '+SPLIT+' 分隔。最少 '+Math.max(1,cfg.minMsgs||1)+' 条，严禁少于此数量。每条是独立的一句或两句话。\n'+
'4. 每条消息简短自然，不要空行分段。\n'+
'5. 表情包（[sticker:描述]）必须单独一条消息，不要和文字混在同一条。\n'+
'6. 你就是角色本人，绝对不要说"我是AI""作为语言模型"等打破角色的话。\n'+
'7. 用户发的括号内文字（如"(猫咪探头)"）是颜文字/文字表情，理解其情感含义来回应。\n'+
'8. 不要在每句话末尾都加句号。语气词结尾、省略号、问号、感叹号、或什么都不加。\n'+
'9. 再次强调：回复必须包含至少 '+Math.max(1,cfg.minMsgs||1)+' 条消息，用 '+SPLIT+' 分隔。';
}

/* ★ 构建角色信息文本 */
function buildCharInfo(charData){
if(!charData)return '';
var ci='';
if(charData.name)ci+='姓名：'+charData.name+'\n';
if(charData.gender)ci+='性别：'+charData.gender+'\n';
if(charData.age)ci+='年龄：'+charData.age+'\n';
if(charData.relation)ci+='与用户的关系：'+charData.relation+'\n';
if(charData.callName)ci+='对用户的称呼：'+charData.callName+'\n';
if(charData.profile)ci+='\n'+charData.profile+'\n';
return ci;
}

/* ★ 构建用户信息文本 */
function buildUserInfo(userData){
if(!userData)return '';
var ui='';
if(userData.realName||userData.nickname)ui+='用户名字：'+(userData.nickname||userData.realName)+'\n';
if(userData.gender)ui+='用户性别：'+userData.gender+'\n';
if(userData.age)ui+='用户年龄：'+userData.age+'\n';
if(userData.bio)ui+='用户简介：'+userData.bio+'\n';
return ui;
}

/* ★ 构建时间天气文本 */
function buildTimeWeather(cfg){
if(!cfg.timeWeather)return '';
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
var info='现在是：'+timeStr;
if(App.calendar){
  var ws=App.calendar.getWeatherSummary();
  if(ws)info+='\n用户所在地'+ws;
  if(cfg.charCity)info+='\n角色所在城市：'+cfg.charCity;
  var ss=App.calendar.getScheduleSummary();
  if(ss)info+='\n'+ss;
}
return info;
}

/* ★ 构建双语和表情包指令 */
function buildMediaRules(cfg){
var parts=[];
if(cfg.bilingual){
  var biLang=cfg.biLang||'English';
  var biStyle=cfg.biStyle||'bracket';
  if(biStyle==='bracket')parts.push('【双语模式】每条消息后用括号附上'+biLang+'翻译。');
  else parts.push('【双语模式】每条消息后换行写'+biLang+'翻译。');
}
var allowedTypes=cfg.msgTypes||['文字'];
if(allowedTypes.indexOf('表情')>=0)parts.push('可以适当使用emoji表情。');
if(cfg.stickerGen&&allowedTypes.indexOf('图片')>=0){
  var stkFreq=['极少','偶尔','适中','经常','频繁'][Math.min((cfg.stickerFreq||2)-1,4)];
  parts.push('【表情包】适合时用[sticker:描述] 标记，描述要具体，频率：'+stkFreq+'。风格：'+(cfg.stickerStyles||['可爱卡通']).join('、')+'。表情包必须单独一条消息。');
}
if(cfg.proMode==='manual'){
  var levels=['非常被动','偶尔主动','适中','比较主动','非常粘人'];
  parts.push('【主动联系积极程度】'+levels[Math.min((cfg.proLevel||3)-1,4)]);
}
return parts.join('\n');
}

/* ★ 核心：按预设 order 构建 apiMsgs */
function buildApiMessages(charData,userData,cfg,chatHistory,isProactive,proPrompt){
var preset=getActivePreset();
var order=preset&&preset.order?preset.order:null;
var presetItems=preset&&preset.items?preset.items:[];
var sysToggles=(App.preset&&App.preset.config&&App.preset.config.sysToggles)?App.preset.config.sysToggles:{};

var sceneText=App.LS.get('chatScene_'+(charData?charData.id:''))||'';
var wbEntries=collectWorldBookEntries(charData?charData.id:null,chatHistory);

/* 构建各个槽位的内容 */
var slotContent={
  sys_wb_before: wbEntries.before.length?wbEntries.before.join('\n'):'',
  sys_char_profile: buildCharInfo(charData),
  sys_wb_after: wbEntries.after.length?wbEntries.after.join('\n'):'',
  sys_user_info: buildUserInfo(userData),
  sys_scene: sceneText,
  sys_examples: charData&&charData.dialogExamples?charData.dialogExamples:'',
  sys_memory: '', /* 预留：总结记忆 */
  sys_post: charData&&charData.postInstruction?charData.postInstruction:''
};

/* 如果没有预设或没有 order，用默认顺序 */
if(!order||!order.length){
  order=[
    {type:'sys',id:'sys_wb_before'},
    {type:'sys',id:'sys_char_profile'},
    {type:'sys',id:'sys_wb_after'},
    {type:'sys',id:'sys_user_info'},
    {type:'sys',id:'sys_scene'},
    {type:'sys',id:'sys_examples'},
    {type:'sys',id:'sys_memory'},
    {type:'sys',id:'sys_history'},
    {type:'sys',id:'sys_post'}
  ];
  /* 把预设 items 加到 char_profile 后面 */
  if(presetItems.length){
    var insertIdx=2;
    presetItems.forEach(function(it,i){
      if(it.enabled!==false&&it.active!==false&&it.mode!=='depth'){
        order.splice(insertIdx,0,{type:'user',idx:i});
        insertIdx++;
      }
    });
  }
}

/* 遍历 order，分成 history 前、history 后、深度注入三组 */
var beforeHistory=[];
var afterHistory=[];
var depthInjects=[];
var hitHistory=false;

/* 先加格式规则（永远在最前面） */
beforeHistory.push(buildFormatRules(cfg));

/* 加媒体规则 */
var mediaRules=buildMediaRules(cfg);
if(mediaRules)beforeHistory.push(mediaRules);

/* 加时间天气（属于内置，不在 order 里） */
var twText=buildTimeWeather(cfg);
if(twText)beforeHistory.push('【当前时间】\n'+twText);

order.forEach(function(o){
  if(o.type==='sys'){
    if(o.id==='sys_history'){hitHistory=true;return;}
    /* 检查开关 */
    if(sysToggles[o.id]===false)return;
    var content=slotContent[o.id];
    if(!content)return;
    /* 加标题 */
    var label='';
    if(o.id==='sys_wb_before')label='【世界书】\n';
    else if(o.id==='sys_char_profile')label='【角色设定】\n';
    else if(o.id==='sys_wb_after')label='【世界书】\n';
    else if(o.id==='sys_user_info')label='【用户信息】\n';
    else if(o.id==='sys_scene')label='【当前场景/时间线】\n';
    else if(o.id==='sys_examples')label='【示例对话参考】\n';
    else if(o.id==='sys_memory')label='【总结记忆】\n';
    else if(o.id==='sys_post')label='【后置指令 - 每轮必须遵守】\n';

    if(hitHistory)afterHistory.push(label+content);
    else beforeHistory.push(label+content);

  } else if(o.type==='user'){
    var it=presetItems[o.idx];
    if(!it||it.enabled===false||it.active===false)return;
    if(it.mode==='depth'){
      depthInjects.push({content:it.content,depth:it.depth||2,name:it.name||''});
    } else {
      var text=(it.name?'【'+it.name+'】\n':'')+it.content;
      if(hitHistory)afterHistory.push(text);
      else beforeHistory.push(text);
    }
  }
});

/* 世界书的深度注入条目也加进来 */
wbEntries.depth.forEach(function(d){
  depthInjects.push({content:d.content,depth:d.depth,name:''});
});

/* 组装 apiMsgs */
var apiMsgs=[];

/* 1. history 前的内容合成一条 system message */
var sysText=beforeHistory.filter(Boolean).join('\n\n');
if(sysText)apiMsgs.push({role:'system',content:sysText});

/* 2. 对话历史 */
var ctx=chatHistory.slice(-MAX_CONTEXT);
var historyMsgs=[];
ctx.forEach(function(m){
  if(m.role==='user'||m.role==='assistant')historyMsgs.push({role:m.role,content:m.content});
});

/* 3. 把深度注入插入对话历史中 */
if(depthInjects.length&&historyMsgs.length){
  depthInjects.sort(function(a,b){return b.depth-a.depth;});
  depthInjects.forEach(function(d){
    var insertPos=Math.max(0,historyMsgs.length-d.depth);
    historyMsgs.splice(insertPos,0,{role:'system',content:(d.name?'【'+d.name+'】\n':'')+d.content});
  });
}

historyMsgs.forEach(function(m){apiMsgs.push(m);});

/* 4. history 后的内容（后置指令等）合成一条 system message */
var postText=afterHistory.filter(Boolean).join('\n\n');
if(postText)apiMsgs.push({role:'system',content:postText});

/* 5. 主动消息的指令 */
if(isProactive&&proPrompt){
  apiMsgs.push({role:'user',content:'[系统指令，请勿当作用户消息回复，请以角色身份主动发一条消息]\n'+proPrompt});
}

return apiMsgs;
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
saveMsgs:function(){
  try{App.LS.set('chatMsgs_'+Chat.charId,Chat.messages);}
  catch(e){
    if(Chat.messages.length>20){
      Chat.messages=Chat.messages.slice(-20);
      try{App.LS.set('chatMsgs_'+Chat.charId,Chat.messages);}
      catch(e2){App.showToast('存储空间不足，部分消息可能丢失');}
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
Chat._sendQueue=[];Chat._isSendingQueue=false;
Chat._plusOpen=false;Chat._multiMode=false;Chat._multiSelected=[];
if(Chat._sendDelayTimer){clearTimeout(Chat._sendDelayTimer);Chat._sendDelayTimer=null;}
var inner=App.$('#wxInner');if(!inner)return;
if(App.wechat)App.wechat._savedInner=inner.innerHTML;
var bgUrl=App.LS.get('chatBg_'+charId)||'';
var tintOn=App.LS.get('chatTint_'+charId);if(tintOn===null)tintOn=true;
var hasBg=!!bgUrl;
if(App.chatUI)App.chatUI.render(inner,c,bgUrl,hasBg,tintOn);
Chat.renderMessages();Chat.bindEvents();Chat.startProactive();
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
Chat._backgroundMode=false;Chat.isStreaming=false;
Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(false);
},

renderMessages:function(){if(App.chatUI)App.chatUI.renderMessages();},
scrollBottom:function(){var el=App.$('#ctMsgs');if(el)requestAnimationFrame(function(){el.scrollTop=el.scrollHeight;});},
bindEvents:function(){if(App.chatUI)App.chatUI.bindEvents();},

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
var bufferDelay=(replyDelay===0)?500:3000;
Chat._sendDelayTimer=setTimeout(function(){Chat._sendDelayTimer=null;
  if(cfg.showTyping&&replyDelay>0)Chat.updateTyping(true);
  if(replyDelay>0)setTimeout(function(){Chat.requestAI();},replyDelay);
  else Chat.requestAI();Chat.resetProactive();
},bufferDelay);
},

/* ★ 重写：使用 buildApiMessages */
requestAI:function(){
var cfg=getCfg(Chat.charId);
var api=getApi(Chat.charId);
if(!api){App.showToast('请先配置 API');Chat.updateTyping(false);return;}
var user=App.user?App.user.getActiveUser():null;

var apiMsgs=buildApiMessages(Chat.charData,user,cfg,Chat.messages,false,null);

Chat.isStreaming=true;Chat._streamPartial='';
if(!Chat._backgroundMode){Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(true);}

var url=api.url.replace(/\/+$/,'')+'/chat/completions';
Chat.abortCtrl=new AbortController();
var params=getParams(Chat.charId);
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
  if(Chat._backgroundMode){Chat.setUnread(Chat.charId,Chat.getUnread(Chat.charId)+parts.length);Chat._backgroundMode=false;return;}
}
Chat._backgroundMode=false;Chat.updateSendBtn();Chat.updateTyping(false);Chat.renderMessages();
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
resendMsg:function(idx){var msg=Chat.messages[idx];if(!msg)return;var content=msg.content;Chat.messages.splice(idx);Chat.messages.push({role:'user',content:content,ts:Date.now()});Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();},
regenerate:function(idx){Chat.messages.splice(idx);Chat.saveMsgs();Chat.renderMessages();Chat.requestAI();},
copyMsg:function(idx){var msg=Chat.messages[idx];if(!msg)return;App.copyText(msg.content).then(function(){App.showToast('已复制');}).catch(function(){App.showToast('复制失败');});},

shareMsg:function(idx){
var msg=Chat.messages[idx];if(!msg)return;
var chars=App.character?App.character.list:[];
var visibleChars=chars.filter(function(c){return c.id!==Chat.charId&&(!App.wechat||App.wechat.isCharVisible(c));});
if(!visibleChars.length){App.showToast('没有可转发的角色');return;}
var picker=document.createElement('div');
picker.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
var listHtml=visibleChars.map(function(c){var alias=App.wechat?App.wechat.getCharAlias(c.id):'';var dn=alias||c.name||'?';return '<div class="fwd-char" data-fwd-id="'+c.id+'" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.04);font-size:14px;color:#333;-webkit-tap-highlight-color:transparent;">'+App.esc(dn)+'</div>';}).join('');
picker.innerHTML='<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:16px;width:260px;max-height:60vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);"><div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:10px;">转发给</div>'+listHtml+'<div style="text-align:center;padding:10px;"><button type="button" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:inherit;" id="fwdCancel">取消</button></div></div>';
document.body.appendChild(picker);
picker.addEventListener('click',function(ev){if(ev.target===picker)picker.remove();});
picker.querySelector('#fwdCancel').addEventListener('click',function(){picker.remove();});
picker.querySelectorAll('.fwd-char').forEach(function(ch){ch.addEventListener('click',function(){var targetId=ch.dataset.fwdId;picker.remove();var msgs=App.LS.get('chatMsgs_'+targetId)||[];msgs.push({role:'user',content:'[转发消息] '+msg.content,ts:Date.now()});App.LS.set('chatMsgs_'+targetId,msgs);App.showToast('已转发');});});
},

downloadSticker:function(idx){
var msg=Chat.messages[idx];if(!msg)return;
var match=(msg.content||'').match(/\[sticker:([^\]]+)\]/);
if(!match){App.showToast('该消息不含表情包');return;}
var desc=match[1];var cacheKey='stickerCache_'+desc.replace(/\s+/g,'_').slice(0,30);var url=App.LS.get(cacheKey);
if(!url){App.showToast('表情包尚未生成');return;}
var a=document.createElement('a');a.href=url;a.download='sticker_'+Date.now()+'.png';a.target='_blank';document.body.appendChild(a);a.click();document.body.removeChild(a);App.showToast('正在下载');
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

/* ★ 重写：使用 buildApiMessages */
requestProactive:function(){
var cfg=getCfg(Chat.charId);
var api=getApi(Chat.charId);
if(!api){Chat.isStreaming=false;Chat.updateSendBtn();Chat.updateTyping(false);Chat.renderMessages();return;}
var user=App.user?App.user.getActiveUser():null;

var lastMsg=Chat.messages.length?Chat.messages[Chat.messages.length-1]:null;
var lastIsUser=lastMsg&&lastMsg.role==='user';
var lastIsMe=lastMsg&&lastMsg.role==='assistant';
var timeSinceLastMsg=lastMsg&&lastMsg.ts?(Date.now()-lastMsg.ts):999999999;
var minsSince=Math.round(timeSinceLastMsg/60000);

var proPrompt='';
if(lastIsUser){
  proPrompt='用户'+minsSince+'分钟前发了消息，你还没回复。你必须回复。请根据用户最后说的内容来回复。直接发消息，不允许回复[SKIP]。';
} else if(lastIsMe){
  if(minsSince<10){
    proPrompt='你'+minsSince+'分钟前刚发过消息，用户还没回。自然地补一句就好。不允许回复[SKIP]。';
  } else if(minsSince<30){
    proPrompt='距离你上次发消息已经'+minsSince+'分钟了，用户没回。追问对方在干嘛、分享你在做的事、或换个话题。不允许回复[SKIP]。';
  } else {
    proPrompt='已经过了'+minsSince+'分钟了，用户一直没回。自然地再说一句。如果角色性格确实非常高冷且绝不会主动找人，才可以回复[SKIP]。';
  }
} else {
  proPrompt='这是对话开始。你必须主动打招呼或找话题开聊。不允许回复[SKIP]。';
}
proPrompt+='\n\n【规则】\n1. 仔细阅读对话历史。\n2. 不要无视未被回答的问题。\n3. 不要发"在吗""你好"这种废话，要有实际内容。\n4. 绝大多数情况必须发消息。[SKIP]只在极端情况下使用。';

var apiMsgs=buildApiMessages(Chat.charData,user,cfg,Chat.messages,true,proPrompt);

var url=api.url.replace(/\/+$/,'')+'/chat/completions';
var params=getParams(Chat.charId);

if(!Chat.isStreaming){
  Chat.isStreaming=true;
  if(!Chat._backgroundMode){Chat.renderMessages();Chat.updateSendBtn();Chat.updateTyping(true);}
}
var fullText='';

fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
body:JSON.stringify({model:api.model,messages:apiMsgs,stream:true,temperature:params.temperature,frequency_penalty:params.freqPenalty,presence_penalty:params.presPenalty})
}).then(function(resp){
if(!resp.ok){return resp.text().then(function(body){throw new Error('HTTP '+resp.status+': '+body.slice(0,200));});}
var reader=resp.body.getReader(),decoder=new TextDecoder(),buffer='';
function read(){return reader.read().then(function(result){
if(result.done){proFinish();return;}
buffer+=decoder.decode(result.value,{stream:true});var lines=buffer.split('\n');buffer=lines.pop()||'';
for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(!line||!line.startsWith('data:'))continue;var data=line.slice(5).trim();
if(data==='[DONE]'){proFinish();return;}
if(!data)continue;
try{var json=JSON.parse(data);var delta=json.choices&&json.choices[0]&&json.choices[0].delta;if(delta&&delta.content){fullText+=delta.content;if(!Chat._backgroundMode)Chat.updateStreamBubble(fullText);}}catch(e){}}
return read();});}
return read();
}).catch(function(err){
Chat.isStreaming=false;
if(!Chat._backgroundMode){Chat.updateSendBtn();Chat.updateTyping(false);Chat.renderMessages();var cnMsg=translateError(err.message||String(err));App.showToast(cnMsg);}
console.error('[主动消息] '+(err.message||err));
});

function proFinish(){
  Chat.isStreaming=false;
  if(!Chat._backgroundMode){Chat.updateSendBtn();Chat.updateTyping(false);}
  fullText=fullText.trim();
  console.log('[主动消息] AI返回:',fullText?fullText.slice(0,100):'(空)');
  if(!fullText||fullText==='[SKIP]'||fullText.indexOf('[SKIP]')>=0){
    Chat._backgroundMode=false;Chat.renderMessages();return;
  }
  var parts=fullText.split(SPLIT).map(function(t){return t.trim();}).filter(Boolean);
  parts=parts.filter(function(p){return p!=='[SKIP]'&&p.indexOf('[SKIP]')<0;});
  if(!parts.length){Chat._backgroundMode=false;Chat.renderMessages();return;}
  var now=Date.now();
  parts.forEach(function(part,i){Chat.messages.push({role:'assistant',content:part,ts:now+i*1000});});
  Chat.saveMsgs();
  if(Chat._backgroundMode){Chat.setUnread(Chat.charId,Chat.getUnread(Chat.charId)+parts.length);}
  else{Chat.renderMessages();}
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
