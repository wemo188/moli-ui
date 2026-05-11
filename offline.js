(function(){
'use strict';
var App=window.App;if(!App)return;

var SPLIT='|||';
var MAX_CONTEXT=40;

function fmtTime(ts){var d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function pad2(n){return n<10?'0'+n:''+n;}

function getCfg(charId){
  if(App.charMgr&&App.charMgr.charConfigs&&App.charMgr.charConfigs[charId])return App.charMgr.charConfigs[charId];
  if(App.charMgr&&App.charMgr.globalConfig)return App.charMgr.globalConfig;
  return {mainLang:'简体中文',bilingual:false,biLang:'English',biStyle:'bracket',showTyping:true,minMsgs:1,maxMsgs:3,timeWeather:true,charCity:'',charRealCity:'',apiMode:'global',apiSelect:'',temperature:0.8,freqPenalty:0.3,presPenalty:0.3};
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

function getUserName(){
  if(App.user){var u=App.user.getActiveUser();if(u)return u.nickname||u.realName||'对方';}
  return '对方';
}

function collectWorldBookEntries(charId,chatHistory){
  var result={before:[],after:[],depth:[]};
  if(!App.worldbook)return result;
  var entries=App.worldbook.getEntriesForChar(charId);
  if(!entries||!entries.length)return result;
  var historyText='';
  if(chatHistory&&chatHistory.length){historyText=chatHistory.map(function(m){return m.content||'';}).join(' ').toLowerCase();}
  entries.forEach(function(e){
    if(e.enabled===false)return;
    var shouldInclude=false;
    if(e.always)shouldInclude=true;
    else if(e.useKeyword&&e.keyword){
      var keywords=e.keyword.split(/[,，]/).map(function(k){return k.trim().toLowerCase();}).filter(Boolean);
      for(var i=0;i<keywords.length;i++){if(historyText.indexOf(keywords[i])>=0){shouldInclude=true;break;}}
    } else shouldInclude=true;
    if(!shouldInclude)return;
    var pos=e.position||'before';
    if(pos==='depth')result.depth.push({content:e.content,depth:e.depth||4});
    else if(pos==='after')result.after.push(e.content);
    else result.before.push(e.content);
  });
  return result;
}

function getActivePreset(){
  if(!App.preset)return null;
  var list=App.LS.get('presetList')||[];
  for(var i=0;i<list.length;i++){if(list[i].enabled===true)return list[i];}
  return null;
}

function buildCharInfo(charData){
  if(!charData)return '';
  var ci='';
  if(charData.name)ci+='姓名：'+charData.name+'\n';
  if(charData.gender)ci+='性别：'+charData.gender+'\n';
  if(charData.age)ci+='年龄：'+charData.age+'\n';
  var userName=getUserName();
  if(charData.relation)ci+='与'+userName+'的关系：'+charData.relation+'\n';
  if(charData.callName)ci+='对'+userName+'的称呼：'+charData.callName+'\n';
  if(charData.profile)ci+='\n'+charData.profile+'\n';
  return ci;
}

function buildUserInfo(userData){
  if(!userData)return '';
  var ui='';
  if(userData.realName||userData.nickname)ui+='名字：'+(userData.nickname||userData.realName)+'\n';
  if(userData.gender)ui+='性别：'+userData.gender+'\n';
  if(userData.age)ui+='年龄：'+userData.age+'\n';
  if(userData.bio)ui+='简介：'+userData.bio+'\n';
  return ui;
}

function buildTimeWeather(cfg){
  if(!cfg.timeWeather)return '';
  var now=new Date();
  var hour=now.getHours();
  var period='';
  if(hour<5)period='凌晨';else if(hour<8)period='清晨';else if(hour<11)period='上午';else if(hour<13)period='中午';else if(hour<17)period='下午';else if(hour<19)period='傍晚';else if(hour<23)period='晚上';else period='深夜';
  var timeStr=now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日 '+['周日','周一','周二','周三','周四','周五','周六'][now.getDay()]+' '+pad2(now.getHours())+':'+pad2(now.getMinutes())+' ('+period+')';
  return '现在是：'+timeStr;
}

/* ★ 短言模式的格式规则 */
function buildShortRules(cfg,charData){
  var lang=cfg.mainLang||'简体中文';
  var charName=charData&&charData.name?charData.name:'角色';
  var userName=getUserName();
  var callName=charData&&charData.callName?charData.callName:userName;
  var minM=Math.max(1,cfg.minMsgs||1);
  var maxM=Math.max(1,cfg.maxMsgs||3);

  return '你叫「'+charName+'」，正在和「'+callName+'」面对面互动。这是线下场景，不是聊天软件。\n\n'+
    '【格式规则 - 短言模式】\n'+
    '1. 用（）包裹动作和神态描写。例如：（她歪了歪头）怎么了？\n'+
    '2. 不用（）包裹的部分就是角色说的话。\n'+
    '3. 每条消息不超过3-4行，保持简短。\n'+
    '4. 每次回复发送 '+minM+' 到 '+maxM+' 条，用 '+SPLIT+' 分隔。\n'+
    '5. 使用'+lang+'。\n'+
    '6. 不要使用星号*描写动作，统一用（）。\n'+
    '7. 不要加角色名前缀。\n'+
    '8. 禁止说教、禁止鸡汤、禁止客服式回复。\n\n'+
    '示例（2条消息）：\n'+
    '（懒洋洋地靠在沙发上，连头都不抬）嗯…干嘛'+SPLIT+'（伸了个懒腰）今天不想动';
}

/* ★ 长文模式的格式规则 */
function buildLongRules(cfg,charData,wordCount){
  var lang=cfg.mainLang||'简体中文';
  var charName=charData&&charData.name?charData.name:'角色';
  var userName=getUserName();
  var callName=charData&&charData.callName?charData.callName:userName;
  var wc=wordCount||400;

  return '你叫「'+charName+'」，正在和「'+callName+'」面对面互动。这是线下场景，不是聊天软件。\n\n'+
    '【格式规则 - 长文叙事模式】\n'+
    '1. 以第三人称小说风格描写。\n'+
    '2. 用「」包裹角色说的话。\n'+
    '3. 可以描写动作、表情、心理活动、环境氛围、感官细节。\n'+
    '4. 描写要细腻生动，有画面感。\n'+
    '5. 字数要求：'+wc+'字左右（允许±20%浮动）。这是铁律，绝对严格遵守，不得偷懒缩减。\n'+
    '6. 使用'+lang+'。\n'+
    '7. 直接输出叙事内容，不要分条，不要用 '+SPLIT+'。\n'+
    '8. 不要加任何标记、注释、解释。只输出纯叙事文本。\n'+
    '9. 禁止说教、禁止鸡汤、禁止客服式回复。\n'+
    (wc>=2000?'10. 字数较多时合理分段，保持阅读节奏。每段之间空一行。\n':'')+
    (wc>=5000?'11. 这是超长文要求（'+wc+'字），请充分展开细节描写，不要急于推进剧情。场景、心理、对话、动作都要详细铺开。\n':'');
}

/* 构建 API 消息 */
function buildApiMessages(charData,userData,cfg,chatHistory,mode,wordCount,isProactive,proPrompt){
  var preset=getActivePreset();
  var presetItems=preset&&preset.items?preset.items:[];
  var sysToggles=(App.preset&&App.preset.config&&App.preset.config.sysToggles)?App.preset.config.sysToggles:{};

  var sceneText=App.LS.get('offlineScene_'+(charData?charData.id:''))||'';
  var wbEntries=collectWorldBookEntries(charData?charData.id:null,chatHistory);
  var memoryText=App.memory?App.memory.buildMemoryText(charData?charData.id:null):'';

  var beforeHistory=[];

  /* 格式规则 */
  if(mode==='long'){
    beforeHistory.push(buildLongRules(cfg,charData,wordCount));
  } else {
    beforeHistory.push(buildShortRules(cfg,charData));
  }

  /* 世界书（前置） */
  if(wbEntries.before.length&&sysToggles.sys_wb_before!==false)beforeHistory.push('【世界书】\n'+wbEntries.before.join('\n'));

  /* 角色信息 */
  if(sysToggles.sys_char_profile!==false){var ci=buildCharInfo(charData);if(ci)beforeHistory.push('【角色设定】\n'+ci);}

  /* 世界书（后置） */
  if(wbEntries.after.length&&sysToggles.sys_wb_after!==false)beforeHistory.push('【世界书】\n'+wbEntries.after.join('\n'));

  /* 用户信息 */
  if(sysToggles.sys_user_info!==false){var ui=buildUserInfo(userData);if(ui)beforeHistory.push('【互动对象信息】\n'+ui);}

  /* 场景 */
  if(sceneText&&sysToggles.sys_scene!==false)beforeHistory.push('【当前场景/时间线】\n'+sceneText);

  /* 示例对话 */
  if(charData&&charData.dialogExamples&&sysToggles.sys_examples!==false)beforeHistory.push('【示例对话参考】\n'+charData.dialogExamples);

  /* 记忆 */
  if(memoryText&&sysToggles.sys_memory!==false)beforeHistory.push('【总结记忆】\n'+memoryText);

  /* 时间天气 */
  var twText=buildTimeWeather(cfg);
  if(twText)beforeHistory.push('【当前时间】\n'+twText);

  /* 预设卡片（非 depth） */
  presetItems.forEach(function(it){
    if(!it||it.enabled===false||it.active===false)return;
    if(it.mode==='depth')return;
    beforeHistory.push((it.name?'【'+it.name+'】\n':'')+it.content);
  });

  /* 后置指令 */
  if(charData&&charData.postInstruction&&sysToggles.sys_post!==false)beforeHistory.push('【后置指令】\n'+charData.postInstruction);

  /* 组装 */
  var apiMsgs=[];
  var sysText=beforeHistory.filter(Boolean).join('\n\n');
  if(sysText)apiMsgs.push({role:'system',content:sysText});

  /* 聊天历史 */
  var ctx=chatHistory.slice(-MAX_CONTEXT);
  var historyMsgs=[];
  ctx.forEach(function(m){if(m.role==='user'||m.role==='assistant')historyMsgs.push({role:m.role,content:m.content});});

  /* depth 注入 */
  var depthInjects=[];
  presetItems.forEach(function(it){
    if(!it||it.enabled===false||it.active===false||it.mode!=='depth')return;
    depthInjects.push({content:it.content,depth:it.depth||2,name:it.name||''});
  });
  wbEntries.depth.forEach(function(d){depthInjects.push({content:d.content,depth:d.depth,name:''});});

  if(depthInjects.length&&historyMsgs.length){
    depthInjects.sort(function(a,b){return b.depth-a.depth;});
    depthInjects.forEach(function(d){
      var insertPos=Math.max(0,historyMsgs.length-d.depth);
      historyMsgs.splice(insertPos,0,{role:'system',content:(d.name?'【'+d.name+'】\n':'')+d.content});
    });
  }

  historyMsgs.forEach(function(m){apiMsgs.push(m);});

  /* 后置强调 */
  var postText='';
  if(mode==='long'){
    postText='【再次强调】字数要求 '+wordCount+' 字左右。直接输出叙事内容，不要分条。';
  } else {
    var minM=Math.max(1,cfg.minMsgs||1);
    var maxM=Math.max(1,cfg.maxMsgs||3);
    postText='【再次强调】回复 '+minM+' 到 '+maxM+' 条消息，用 '+SPLIT+' 分隔。每条不超过3-4行。';
  }
  apiMsgs.push({role:'system',content:postText});

  if(isProactive&&proPrompt){
    apiMsgs.push({role:'user',content:'[系统指令] '+proPrompt});
  }

  return apiMsgs;
}

function smartSplitMessages(text){
  text=(text||'').trim();
  if(!text)return [];
  if(text.indexOf(SPLIT)>=0){return text.split(SPLIT).map(function(t){return t.trim();}).filter(Boolean);}
  if(/\n\s*\n/.test(text)){return text.split(/\n\s*\n/).map(function(t){return t.trim();}).filter(Boolean);}
  var lines=text.split('\n').map(function(t){return t.trim();}).filter(Boolean);
  if(lines.length>=2)return lines;
  return [text];
}

function translateError(msg){
  if(!msg)return '未知错误';
  if(msg.indexOf('401')>=0)return 'API Key 失效了';
  if(msg.indexOf('429')>=0)return '请求太频繁';
  if(msg.indexOf('Failed to fetch')>=0)return '网络连接失败';
  return msg;
}

var Offline={
  charId:null,charData:null,messages:[],isStreaming:false,abortCtrl:null,
  _ctxMenu:null,_menuEl:null,_avCard:null,_streamPartial:'',
  mode:'short', /* 'short' | 'long' */
  wordCount:400,

  loadMsgs:function(){Offline.messages=App.LS.get('offlineMsgs_'+Offline.charId)||[];},
  saveMsgs:function(){
    try{App.LS.set('offlineMsgs_'+Offline.charId,Offline.messages);}
    catch(e){if(Offline.messages.length>20){Offline.messages=Offline.messages.slice(-20);try{App.LS.set('offlineMsgs_'+Offline.charId,Offline.messages);}catch(e2){}}}
  },

  getMode:function(){return App.LS.get('offlineMode_'+Offline.charId)||'short';},
  setMode:function(m){App.LS.set('offlineMode_'+Offline.charId,m);Offline.mode=m;},
  getWordCount:function(){return App.LS.get('offlineWC_'+Offline.charId)||400;},
setWordCount:function(n){App.LS.set('offlineWC_'+Offline.charId,n);Offline.wordCount=n;},

pick: function() {
  if (!App.character || !App.character.list || !App.character.list.length) {
    App.showToast('请先添加角色');
    return;
  }
  if (App.character.list.length === 1) {
    Offline.open(App.character.list[0].id);
    return;
  }

  var old = document.querySelector('#offlineCharPicker');
  if (old) old.remove();

  var picker = document.createElement('div');
  picker.id = 'offlineCharPicker';
  picker.style.cssText = 'position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';

  var listHtml = App.character.list.map(function(c) {
    var av = c.avatar
      ? '<img src="' + App.escAttr(c.avatar) + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">'
      : '<div style="width:36px;height:36px;border-radius:50%;background:rgba(126,163,201,.15);display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#adcdea;stroke-width:1.8;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
    return '<div data-cid="' + c.id + '" style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.04);-webkit-tap-highlight-color:transparent;">' +
      av +
      '<span style="font-size:14px;font-weight:600;color:#2e4258;">' + App.esc(c.name || '未命名') + '</span>' +
    '</div>';
  }).join('');

  picker.innerHTML =
    '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:16px 0;width:280px;max-height:60vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);">' +
      '<div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;padding:0 16px 12px;border-bottom:1px solid rgba(0,0,0,.04);">选择角色</div>' +
      listHtml +
      '<div style="text-align:center;padding:12px;">' +
        '<button type="button" id="olPickCancel" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:inherit;">取消</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(picker);

  picker.addEventListener('click', function(e) { if (e.target === picker) picker.remove(); });
  picker.querySelector('#olPickCancel').addEventListener('click', function() { picker.remove(); });
  picker.querySelectorAll('[data-cid]').forEach(function(el) {
    el.addEventListener('click', function() {
      picker.remove();
      Offline.open(el.dataset.cid);
    });
  });
},

  open:function(charId){
  if(!App.character){App.showToast('character模块未加载');return;}
  var c=App.character.getById(charId);if(!c){App.showToast('角色不存在');return;}
  if(!App.offlineUI){App.showToast('offlineUI模块未加载');return;}
  Offline.charId=charId;Offline.charData=c;Offline.loadMsgs();
  Offline.mode=Offline.getMode();Offline.wordCount=Offline.getWordCount();

  var old=App.$('#offlinePanel');if(old)old.remove();
  var panel=document.createElement('div');
  panel.id='offlinePanel';
  document.body.appendChild(panel);

  App.offlineUI.render(panel,c);
  Offline.renderMessages();
  App.offlineUI.bindEvents(panel);

  requestAnimationFrame(function(){requestAnimationFrame(function(){
    panel.style.transform='translateX(0)';
    panel.style.opacity='1';
  });});

  App.bindSwipeBack(panel,function(){Offline.close();});
},

close:function(){
  if(Offline.isStreaming&&Offline.abortCtrl){Offline.abortCtrl.abort();Offline.abortCtrl=null;Offline.isStreaming=false;}
  Offline.dismissCtx();Offline.dismissMenu();Offline.dismissAvCard();
  var panel=App.$('#offlinePanel');if(!panel)return;
  panel.style.transform='translateX(100%)';
  panel.style.opacity='0';
  setTimeout(function(){if(panel.parentNode)panel.remove();},350);
},

  renderMessages:function(){if(App.offlineUI)App.offlineUI.renderMessages();},
  scrollBottom:function(){var el=App.$('#olMsgs');if(el)requestAnimationFrame(function(){el.scrollTop=el.scrollHeight;});},

  send:function(){
    var input=App.$('#olInput');if(!input)return;
    var text=input.value.trim();if(!text)return;
    input.value='';input.style.height='auto';
    Offline.messages.push({role:'user',content:text,ts:Date.now()});
    Offline.saveMsgs();Offline.renderMessages();
    if(Offline.isStreaming)return;
    var cfg=getCfg(Offline.charId);
    if(cfg.showTyping)Offline.updateTyping(true);
    setTimeout(function(){Offline.requestAI();},1500);
  },

  requestAI:function(){
    var cfg=getCfg(Offline.charId);
    var api=getApi(Offline.charId);
    if(!api){App.showToast('请先配置 API');Offline.updateTyping(false);return;}
    var user=App.user?App.user.getActiveUser():null;
    var apiMsgs=buildApiMessages(Offline.charData,user,cfg,Offline.messages,Offline.mode,Offline.wordCount,false,null);

    Offline.isStreaming=true;Offline._streamPartial='';
    Offline.renderMessages();Offline.updateSendBtn();Offline.updateTyping(true);

    var url=api.url.replace(/\/+$/,'')+'/chat/completions';
    Offline.abortCtrl=new AbortController();
    var params=getParams(Offline.charId);
    var fullText='';

    fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
    body:JSON.stringify({model:api.model,messages:apiMsgs,stream:true,temperature:params.temperature,frequency_penalty:params.freqPenalty,presence_penalty:params.presPenalty}),
    signal:Offline.abortCtrl.signal
    }).then(function(resp){
      if(!resp.ok)throw new Error('HTTP '+resp.status);
      var reader=resp.body.getReader(),decoder=new TextDecoder(),buffer='';
      function read(){return reader.read().then(function(result){
        if(result.done){Offline.onStreamDone(fullText);return;}
        buffer+=decoder.decode(result.value,{stream:true});var lines=buffer.split('\n');buffer=lines.pop()||'';
        for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(!line||!line.startsWith('data:'))continue;var data=line.slice(5).trim();
          if(data==='[DONE]'){Offline.onStreamDone(fullText);return;}if(!data)continue;
          try{var json=JSON.parse(data);var delta=json.choices&&json.choices[0]&&json.choices[0].delta;if(delta&&delta.content){fullText+=delta.content;Offline._streamPartial=fullText;Offline.updateStreamBubble(fullText);}}catch(e){}}
        return read();});}
      return read();
    }).catch(function(err){
      Offline.isStreaming=false;Offline.updateSendBtn();Offline.updateTyping(false);
      if(err.name==='AbortError')return;
      App.showToast(translateError(err.message));
      if(fullText){
        if(Offline.mode==='long'){Offline.messages.push({role:'assistant',content:fullText.trim(),ts:Date.now()});}
        else{var parts=smartSplitMessages(fullText);var now=Date.now();parts.forEach(function(p,i){Offline.messages.push({role:'assistant',content:p,ts:now+i*1000});});}
        Offline.saveMsgs();Offline.renderMessages();
      }
    });
  },

  updateStreamBubble:function(text){
    var bubble=App.$('#olStreamBubble');if(!bubble)return;
    if(Offline.mode==='long'){
      bubble.innerHTML=App.esc(text.trim()).replace(/\n/g,'<br>');
    } else {
      var parts=text.split(SPLIT);var last=parts[parts.length-1]||'';
      bubble.innerHTML=App.esc(last.trim())||'<span class="ct-typing-dot"></span><span class="ct-typing-dot"></span><span class="ct-typing-dot"></span>';
    }
    Offline.scrollBottom();
  },

  onStreamDone:function(text){
    Offline.isStreaming=false;Offline.abortCtrl=null;text=text.trim();
    if(text){
      if(Offline.mode==='long'){
        Offline.messages.push({role:'assistant',content:text,ts:Date.now()});
      } else {
        var parts=smartSplitMessages(text);var now=Date.now();
        parts.forEach(function(p,i){Offline.messages.push({role:'assistant',content:p,ts:now+i*1000});});
      }
      Offline.saveMsgs();
    }
    Offline.updateSendBtn();Offline.updateTyping(false);Offline.renderMessages();
  },

  stopStream:function(){
    if(Offline.abortCtrl){Offline.abortCtrl.abort();Offline.abortCtrl=null;}
    var partial=Offline._streamPartial||'';
    Offline.isStreaming=false;Offline.updateSendBtn();Offline.updateTyping(false);
    if(partial){
      if(Offline.mode==='long'){Offline.messages.push({role:'assistant',content:partial.trim(),ts:Date.now()});}
      else{var parts=smartSplitMessages(partial);var now=Date.now();parts.forEach(function(p,i){Offline.messages.push({role:'assistant',content:p,ts:now+i*1000});});}
      Offline.saveMsgs();
    }
    Offline.renderMessages();
  },

  requestProactive:function(){
    var cfg=getCfg(Offline.charId);var api=getApi(Offline.charId);
    if(!api){App.showToast('请先配置 API');return;}
    var user=App.user?App.user.getActiveUser():null;
    var userName=getUserName();
    var proPrompt='请以角色身份主动说点什么或做点什么，推动当前场景发展。直接输出，不要解释。';
    var apiMsgs=buildApiMessages(Offline.charData,user,cfg,Offline.messages,Offline.mode,Offline.wordCount,true,proPrompt);

    Offline.isStreaming=true;Offline._streamPartial='';
    Offline.renderMessages();Offline.updateSendBtn();Offline.updateTyping(true);

    var url=api.url.replace(/\/+$/,'')+'/chat/completions';
    Offline.abortCtrl=new AbortController();
    var params=getParams(Offline.charId);
    var fullText='';

    fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
    body:JSON.stringify({model:api.model,messages:apiMsgs,stream:true,temperature:params.temperature,frequency_penalty:params.freqPenalty,presence_penalty:params.presPenalty}),
    signal:Offline.abortCtrl.signal
    }).then(function(resp){
      if(!resp.ok)throw new Error('HTTP '+resp.status);
      var reader=resp.body.getReader(),decoder=new TextDecoder(),buffer='';
      function read(){return reader.read().then(function(result){
        if(result.done){Offline.onStreamDone(fullText);return;}
        buffer+=decoder.decode(result.value,{stream:true});var lines=buffer.split('\n');buffer=lines.pop()||'';
        for(var i=0;i<lines.length;i++){var line=lines[i].trim();if(!line||!line.startsWith('data:'))continue;var data=line.slice(5).trim();
          if(data==='[DONE]'){Offline.onStreamDone(fullText);return;}if(!data)continue;
          try{var json=JSON.parse(data);var delta=json.choices&&json.choices[0]&&json.choices[0].delta;if(delta&&delta.content){fullText+=delta.content;Offline._streamPartial=fullText;Offline.updateStreamBubble(fullText);}}catch(e){}}
        return read();});}
      return read();
    }).catch(function(err){
      Offline.isStreaming=false;Offline.updateSendBtn();Offline.updateTyping(false);
      if(err.name==='AbortError')return;
      App.showToast(translateError(err.message));
    });
  },

  updateSendBtn:function(){if(App.offlineUI)App.offlineUI.updateSendBtn();},
  updateTyping:function(show){if(App.offlineUI)App.offlineUI.updateTyping(show);},
  dismissCtx:function(){if(Offline._ctxMenu){Offline._ctxMenu.remove();Offline._ctxMenu=null;}},
  dismissMenu:function(){if(Offline._menuEl){Offline._menuEl.remove();Offline._menuEl=null;}},
  dismissAvCard:function(){if(Offline._avCard){Offline._avCard.remove();Offline._avCard=null;}},
  deleteMsg:function(idx){Offline.messages.splice(idx,1);Offline.saveMsgs();Offline.renderMessages();},
  deleteFromHere:function(idx){if(!confirm('删除此条及之后所有消息？'))return;Offline.messages.splice(idx);Offline.saveMsgs();Offline.renderMessages();},
  editMsg:function(idx){if(App.offlineUI)App.offlineUI.showEditDialog(idx);},
  regenerate:function(idx){Offline.messages.splice(idx);Offline.saveMsgs();Offline.renderMessages();Offline.requestAI();},
  copyMsg:function(idx){var msg=Offline.messages[idx];if(!msg)return;App.copyText(msg.content).then(function(){App.showToast('已复制');}).catch(function(){App.showToast('复制失败');});},

  showSceneDialog:function(){if(App.offlineUI)App.offlineUI.showSceneDialog();},
  showBgMenu:function(){if(App.offlineUI)App.offlineUI.showBgMenu();},
  setChatBg:function(src){try{App.LS.set('offlineBg_'+Offline.charId,src);}catch(e){App.showToast('图片太大');return;}var bg=App.$('#olBg');if(bg)bg.style.backgroundImage='url('+src+')';var nb=App.$('#olNoBg');if(nb)nb.classList.add('has-bg');App.showToast('背景已设置');},

  init:function(){App.offline=Offline;}
};

App.offline = Offline;
App.register('offline', Offline);
})();

