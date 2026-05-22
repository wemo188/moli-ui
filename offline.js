
(function(){
'use strict';
var App=window.App;if(!App)return;

var MAX_CONTEXT=40;

function pad2(n){return n<10?'0'+n:''+n;}

function getUserName(){
  if(App.user){var u=App.user.getActiveUser();if(u)return u.nickname||u.realName||'你';}
  return '你';
}

function getApi(charId){
  if(App.charMgr){
    var cfg=App.charMgr.getCharConfig(charId);
    if(cfg&&cfg.apiMode==='individual'&&cfg.apiSelect){
      var list=App.LS.get('apiConfigs')||[];
      for(var i=0;i<list.length;i++){if(list[i].name===cfg.apiSelect)return list[i];}
    }
  }
  return App.api?App.api.getActiveConfig():null;
}

function getParams(charId){
  if(App.charMgr){
    var cfg=App.charMgr.getCharConfig(charId);
    if(cfg&&cfg.apiMode==='individual')return{temperature:cfg.temperature,freqPenalty:cfg.freqPenalty,presPenalty:cfg.presPenalty};
  }
  return App.api?App.api.getParams():{temperature:0.8,freqPenalty:0.3,presPenalty:0.3};
}

function getSettings(charId){return App.LS.get('olAp_'+charId)||{};}

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

function buildCharInfo(c){
  if(!c)return '';var ci='';
  if(c.name)ci+='姓名：'+c.name+'\n';
  if(c.gender)ci+='性别：'+c.gender+'\n';
  if(c.age)ci+='年龄：'+c.age+'\n';
  var un=getUserName();
  if(c.relation)ci+='与'+un+'的关系：'+c.relation+'\n';
  if(c.callName)ci+='对'+un+'的称呼：'+c.callName+'\n';
  if(c.profile)ci+='\n'+c.profile+'\n';
  return ci;
}

function buildUserInfo(u){
  if(!u)return '';var ui='';
  if(u.realName||u.nickname)ui+='名字：'+(u.nickname||u.realName)+'\n';
  if(u.gender)ui+='性别：'+u.gender+'\n';
  if(u.age)ui+='年龄：'+u.age+'\n';
  if(u.bio)ui+='简介：'+u.bio+'\n';
  return ui;
}

function buildTimeInfo(charId){
  var now=new Date();var hour=now.getHours();
  var period='';
  if(hour<5)period='凌晨';else if(hour<8)period='清晨';else if(hour<11)period='上午';
  else if(hour<13)period='中午';else if(hour<17)period='下午';else if(hour<19)period='傍晚';
  else if(hour<23)period='晚上';else period='深夜';
  var info='当前时间：'+now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日 '+['周日','周一','周二','周三','周四','周五','周六'][now.getDay()]+' '+pad2(now.getHours())+':'+pad2(now.getMinutes())+' ('+period+')';

  if(App.calendar){
    var ws=App.calendar.getWeatherSummary();
    if(ws){var userCity=App.calendar.getLocationForAI();info+='\n'+(userCity?'用户所在地（'+userCity+'）':'')+ws;}
    var ss=App.calendar.getScheduleSummary();if(ss)info+='\n'+ss;
  }

  if(App.charMgr){
    var ccfg=App.charMgr.getCharConfig(charId);
    if(ccfg&&ccfg.timeWeather){
      var charDisplay=ccfg.charCity||ccfg.charRealCity||'';
      if(charDisplay)info+='\n角色所在城市：'+charDisplay;
    }
  }

  return info;
}

function getQuotePair(style){
  if(style==='straight')return['"','"'];
  if(style==='corner')return['「','」'];
  return['\u201C','\u201D'];
}

function getPovText(pov,callName,qp){
  if(pov==='first')return '用第一人称（我）描写用户'+qp[0]+callName+qp[1]+'的视角。用户自己的行动、感受、内心都从"我"的角度叙述。';
  if(pov==='third')return '用第三人称描写，称呼用户为'+qp[0]+callName+qp[1]+'。';
  return '用第二人称（你）指代用户'+qp[0]+callName+qp[1]+'。';
}

function buildFormatRules(charData,settings){
  var charName=charData?charData.name:'角色';
  var userName=getUserName();
  var callName=(charData&&charData.callName)?charData.callName:userName;
  var pov=settings.povUser||settings.pov||'second';
  var qp=getQuotePair(settings.quoteStyle);
  var wc=settings.wordCount||0;
  var povText=getPovText(pov,callName,qp);

  var sceneHint=App.LS.get('olScene_'+(charData?charData.id:''));
  var baseIdentity='你是'+qp[0]+charName+qp[1]+'，正在进行一场角色扮演叙事。';
  if(sceneHint){
    baseIdentity+='当前的场景和背景由「场景/时间线」描述，请严格遵循该设定进行互动。';
  } else {
    baseIdentity+='场景和背景由对话上下文自然发展。';
  }

  var wcRule='';
  if(wc>0){
    var min=Math.round(wc*0.85);var max=Math.round(wc*1.15);
    wcRule='\n\n【字数要求 - 绝对遵守】\n'+
      '你的每次回复必须控制在 '+min+' 到 '+max+' 字之间。\n'+
      '少于 '+Math.round(wc*0.7)+' 字是严重错误。超过 '+Math.round(wc*1.3)+' 字也是严重错误。\n'+
      '如果用户明确指定了其他字数，以用户指定的为准。';
  }

  return baseIdentity+'\n\n'+
    '【长文叙事规则】\n'+
    '1. 使用小说叙事风格。包含对话、动作描写、心理描写、环境描写、感官细节。\n'+
    '2. '+povText+'\n'+
    '3. 角色说话时使用 '+qp[0]+qp[1]+' 包裹对话内容。绝对不要使用英文引号""，必须使用中文 '+qp[0]+qp[1]+'。\n'+
    '4. 叙事文字不需要任何特殊标记，直接描写即可。\n'+
    '5. 叙事节奏自然流畅，有张有弛。情节推进适度，不要仓促也不要拖沓。\n'+
    '6. 每次回复是完整的一段叙事，直接输出，不要分条。\n'+
    '7. 描写要有画面感和沉浸感。善用五感细节（视觉、听觉、触觉、嗅觉、味觉）。\n'+
    '8. 对话和叙事自然交织，不要变成纯对话。\n\n'+
    '【绝对禁止】\n'+
    '1. 不要替用户角色说话、行动或做任何决定。不要写用户的对话和动作。\n'+
    '2. 不要在回复末尾用问题引导用户做选择（如"你要怎么做？""你选择A还是B？"）。\n'+
    '3. 不要写旁白式的总结性语句（如"这一刻，两人之间的关系发生了微妙的变化"）。\n'+
    '4. 不要使用网文模板、八股叙事、油腻煽情。\n'+
    '5. 不要重复之前已经描写过的内容。\n'+
    '6. 不要使用英文引号 ""，必须使用 '+qp[0]+qp[1]+'。\n\n'+
    '【思维链行为与语言严格约束】\n'+
    '1. 你的所有内部思考（thinking/reasoning）必须使用中文！绝对不允许使用英文。\n'+
    '2. 严禁在思考过程中复述、背诵本提示词规则、场景设定或前情提要！不要做无效重复！\n'+
    '3. 你的思考内容只允许围绕三个点展开：分析当前局势、揣摩角色此时真实的心理活动、规划下一步动作和要说的话。\n'+
    '4. 思考完毕后立刻开始直接进行符合设定的正文叙事！'+
    wcRule;
}

function collectWorldBookEntries(charId,chatHistory){
  var result={before:[],after:[],depth:[]};
  if(!App.worldbook)return result;
  var entries=App.worldbook.getEntriesForChar(charId);
  if(!entries||!entries.length)return result;
  var historyText='';
  if(chatHistory&&chatHistory.length)historyText=chatHistory.map(function(m){return m.content||'';}).join(' ').toLowerCase();
  entries.forEach(function(e){
    if(e.enabled===false)return;
    var shouldInclude=false;
    if(e.always)shouldInclude=true;
    else if(e.useKeyword&&e.keyword){
      var kws=e.keyword.split(/[,，]/).map(function(k){return k.trim().toLowerCase();}).filter(Boolean);
      for(var i=0;i<kws.length;i++){if(historyText.indexOf(kws[i])>=0){shouldInclude=true;break;}}
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

function buildApiMessages(charData,userData,chatHistory,settings){
  var preset=getActivePreset();
  var order=preset&&preset.order?preset.order:null;
  var presetItems=preset&&preset.items?preset.items:[];
  var sysToggles=(App.preset&&App.preset.config&&App.preset.config.sysToggles)?App.preset.config.sysToggles:{};
  var charId=charData?charData.id:null;

  var sceneText=App.LS.get('olScene_'+charId)||'';
  var wbEntries=collectWorldBookEntries(charId,chatHistory);
  var memoryText=App.memory?App.memory.buildMemoryText(charId):'';

  var slotContent={
    sys_wb_before:wbEntries.before.length?wbEntries.before.join('\n'):'',
    sys_char_profile:buildCharInfo(charData),
    sys_wb_after:wbEntries.after.length?wbEntries.after.join('\n'):'',
    sys_user_info:buildUserInfo(userData),
    sys_examples:charData&&charData.dialogExamples?charData.dialogExamples:'',
    sys_scene:sceneText,
    sys_memory:memoryText,
    sys_post:charData&&charData.postInstruction?charData.postInstruction:''
  };

  if(!order||!order.length){
    order=[];
    if(presetItems.length){presetItems.forEach(function(it,i){if(it.mode!=='depth')order.push({type:'user',idx:i});});}
    var DEFAULT_IDS=['sys_wb_before','sys_char_profile','sys_wb_after','sys_user_info','sys_examples','sys_scene','sys_memory','sys_history','sys_post'];
    DEFAULT_IDS.forEach(function(id){order.push({type:'sys',id:id});});
    if(presetItems.length){presetItems.forEach(function(it,i){if(it.mode==='depth'){
      var hI=-1;for(var j=0;j<order.length;j++){if(order[j].type==='sys'&&order[j].id==='sys_history'){hI=j;break;}}
      if(hI>=0)order.splice(hI+1,0,{type:'user',idx:i});else order.push({type:'user',idx:i});
    }});}
  }

  var beforeHistory=[];
  var afterHistory=[];
  var depthInjects=[];
  var hitHistory=false;

  beforeHistory.push(buildFormatRules(charData,settings));

  var charCfg=App.charMgr?App.charMgr.getCharConfig(charId):null;
  var twEnabled=charCfg?charCfg.timeWeather:true;
  if(twEnabled){
    var timeInfo=buildTimeInfo(charId);
    if(timeInfo)beforeHistory.push('【当前时间】\n'+timeInfo);
  }

  order.forEach(function(o){
    if(o.type==='sys'){
      if(o.id==='sys_history'){hitHistory=true;return;}
      if(sysToggles[o.id]===false)return;
      var content=slotContent[o.id];if(!content)return;
      var label='';
      if(o.id==='sys_wb_before')label='【世界书】\n';
      else if(o.id==='sys_char_profile')label='【角色设定】\n';
      else if(o.id==='sys_wb_after')label='【世界书】\n';
      else if(o.id==='sys_user_info')label='【聊天对象信息】\n';
      else if(o.id==='sys_examples')label='【示例对话参考】\n';
      else if(o.id==='sys_scene')label='【当前场景/时间线】\n';
      else if(o.id==='sys_memory')label='【总结记忆】\n';
      else if(o.id==='sys_post')label='【后置指令 - 每轮必须遵守】\n';
      if(hitHistory)afterHistory.push(label+content);
      else beforeHistory.push(label+content);
    } else if(o.type==='user'){
      var it=presetItems[o.idx];
      if(!it||it.enabled===false||it.active===false)return;
      if(it.mode==='depth'){depthInjects.push({content:it.content,depth:it.depth||2,name:it.name||''});}
      else{
        var text=(it.name?'【'+it.name+'】\n':'')+it.content;
        if(hitHistory)afterHistory.push(text);
        else beforeHistory.push(text);
      }
    }
  });

  wbEntries.depth.forEach(function(d){depthInjects.push({content:d.content,depth:d.depth,name:''});});

  var apiMsgs=[];
  var sysText=beforeHistory.filter(Boolean).join('\n\n');
  if(sysText)apiMsgs.push({role:'system',content:sysText});

  var ctx=chatHistory.slice(-MAX_CONTEXT);
  var historyMsgs=[];
  ctx.forEach(function(m){
    if(m.role==='user'||m.role==='assistant')historyMsgs.push({role:m.role,content:m.content});
  });

  if(depthInjects.length&&historyMsgs.length){
    depthInjects.sort(function(a,b){return b.depth-a.depth;});
    depthInjects.forEach(function(d){
      var insertPos=Math.max(0,historyMsgs.length-d.depth);
      historyMsgs.splice(insertPos,0,{role:'system',content:(d.name?'【'+d.name+'】\n':'')+d.content});
    });
  }

  historyMsgs.forEach(function(m){apiMsgs.push(m);});

  var postText=afterHistory.filter(Boolean).join('\n\n');
  if(postText)apiMsgs.push({role:'system',content:postText});

  if(!App._promptLogs)App._promptLogs=[];
  var logEntry={ts:Date.now(),charName:(charData&&charData.name)||'未知',isProactive:false,msgCount:apiMsgs.length,
    tokenEstimate:Math.round(apiMsgs.reduce(function(s,m){return s+(m.content||'').length;},0)/2),
    messages:apiMsgs.map(function(m,i){return{idx:i,role:m.role,length:m.content.length,preview:(m.content||'').replace(/\n/g,' ').slice(0,200),full:m.content};})
  };
  App._promptLogs.unshift(logEntry);
  if(App._promptLogs.length>20)App._promptLogs=App._promptLogs.slice(0,20);

  return apiMsgs;
}

var Offline={
  charId:null,charData:null,messages:[],isStreaming:false,abortCtrl:null,
  _ctxMenu:null,_plusOpen:false,_backgroundMode:false,_streamPartial:'',
  _thinkText:'',_typewriterTimer:null,_regenIdx:null,

  loadMsgs:function(){Offline.messages=App.LS.get('olMsgs_'+Offline.charId)||[];},
  saveMsgs:function(){
    try{App.LS.set('olMsgs_'+Offline.charId,Offline.messages);}
    catch(e){
      if(Offline.messages.length>20){
        Offline.messages=Offline.messages.slice(-20);
        try{App.LS.set('olMsgs_'+Offline.charId,Offline.messages);}
        catch(e2){App.showToast('存储空间不足');}
      }
    }
  },

  openFor:function(charId){
    if(!App.character)return;
    var c=App.character.getById(charId);
    if(!c){App.showToast('角色不存在');return;}
    Offline.charId=charId;Offline.charData=c;Offline.loadMsgs();
    Offline._backgroundMode=false;Offline._plusOpen=false;

    var panel=App.$('#offlinePanel');
    if(panel)panel.remove();

    panel=document.createElement('div');
    panel.id='offlinePanel';
    panel.className='ol-panel';
    document.body.appendChild(panel);

    if(App.offlineUI)App.offlineUI.render(panel,c);
    if(App.offlineUI)App.offlineUI.renderMessages();
    if(App.offlineUI)App.offlineUI.bindEvents();

    requestAnimationFrame(function(){requestAnimationFrame(function(){
      panel.classList.add('show');
    });});
  },

  close:function(){
    Offline.dismissCtx();
    var panel=App.$('#offlinePanel');
    if(!panel)return;
    panel.classList.remove('show');
    setTimeout(function(){if(panel.parentNode)panel.remove();},350);
  },

  sendUser:function(){
    var input=App.$('#olInput');if(!input)return;
    var text=input.value.trim();if(!text)return;
    input.value='';input.style.height='34px';
    var pp=App.$('#olPlusPanel');if(pp){pp.classList.remove('show');Offline._plusOpen=false;}
    Offline.messages.push({role:'user',content:text,ts:Date.now()});
    Offline.saveMsgs();
    if(App.offlineUI)App.offlineUI.renderMessages();
    Offline.requestAI();
  },

  requestAI:function(){
    var api=getApi(Offline.charId);
    if(!api){App.showToast('请先配置 API');return;}
    if(Offline.isStreaming)return;

    var user=App.user?App.user.getActiveUser():null;
    var settings=getSettings(Offline.charId);
    var apiMsgs=buildApiMessages(Offline.charData,user,Offline.messages,settings);
    var streamOn=(settings.streamOn!==false);

    Offline.isStreaming=true;Offline._streamPartial='';Offline._thinkText='';Offline._netDone=false;
    if(App.offlineUI){
      App.offlineUI.renderMessages();
      App.offlineUI.updateAiBtn();
      App.offlineUI.updateTyping(true);
    }

    var url=api.url.replace(/\/+$/,'')+'/chat/completions';
    Offline.abortCtrl=new AbortController();
    var params=getParams(Offline.charId);
    var fullText='';

    fetch(url,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.key},
      body:JSON.stringify({
        model:api.model,messages:apiMsgs,stream:streamOn,
        temperature:params.temperature,
        frequency_penalty:params.freqPenalty,
        presence_penalty:params.presPenalty
      }),
      signal:Offline.abortCtrl.signal
    }).then(function(resp){
      if(!resp.ok)throw new Error('HTTP '+resp.status+' '+resp.statusText);

      if(!streamOn){
        return resp.json().then(function(json){
          var text='';
          if(json.choices&&json.choices[0]&&json.choices[0].message){
            var msg=json.choices[0].message;
            if(typeof msg.content==='string'){
              text=msg.content;
            } else if(Array.isArray(msg.content)){
              msg.content.forEach(function(block){
                if(block.type==='thinking'||block.type==='thought'){
                  Offline._thinkText=(Offline._thinkText||'')+block.thinking||block.thought||block.text||'';
                } else if(block.type==='text'){
                  text+=block.text||'';
                }
              });
            }
          }
          Offline._netDone=true;
          onStreamDone(text.trim());
        });
      }

      var reader=resp.body.getReader(),decoder=new TextDecoder(),buffer='';

      function read(){
        return reader.read().then(function(result){
          if(result.done){ Offline._netDone=true; onStreamDone(fullText); return; }
          buffer+=decoder.decode(result.value,{stream:true});
          var lines=buffer.split('\n');buffer=lines.pop()||'';
          for(var i=0;i<lines.length;i++){
            var line=lines[i].trim();
            if(!line||!line.startsWith('data:'))continue;
            var data=line.slice(5).trim();
            if(data===''){ Offline._netDone=true; onStreamDone(fullText); return; }
            if(!data)continue;
            try{
              var json=JSON.parse(data);
              var delta=null;
              if(json.choices&&json.choices[0]){ delta=json.choices[0].delta||null; }
              if(!delta&&json.type&&(json.type.indexOf('delta')>=0||json.type.indexOf('block')>=0)){ delta=json.delta||json; }

              if(delta){
                var thinkChunk=delta.reasoning_content||delta.reasoning||delta.thought||delta.thinking||delta.reasoning_text||delta.think||'';
                if(!thinkChunk&&delta.type==='thinking_delta'&&delta.thinking){ thinkChunk=delta.thinking; }
                if(!thinkChunk&&delta.type==='thinking'&&delta.text){ thinkChunk=delta.text; }
                if(!thinkChunk&&delta.type==='content_block_delta'&&delta.delta){
                  if(delta.delta.type==='thinking_delta'){ thinkChunk=delta.delta.thinking||''; }
                }

                if(thinkChunk){ Offline._thinkText=(Offline._thinkText||'')+thinkChunk; }

                var textChunk='';
                if(typeof delta.content==='string'){ textChunk=delta.content; } 
                else if(delta.type==='text_delta'&&delta.text){ textChunk=delta.text; } 
                else if(delta.delta&&delta.delta.type==='text_delta'){ textChunk=delta.delta.text||''; }

                if(textChunk){ fullText+=textChunk; }
                Offline._streamPartial=(Offline._thinkText?'<think>'+Offline._thinkText+'</think>':'')+fullText;
              }
            }catch(e){}
          }
          return read();
        });
      }
      return read();
    }).catch(function(err){
      Offline.isStreaming=false;
      if(Offline._regenIdx!==null && Offline._regenIdx!==undefined) Offline._regenIdx=null;
      if(Offline._typewriterTimer){clearTimeout(Offline._typewriterTimer);Offline._typewriterTimer=null;}
      if(App.offlineUI){App.offlineUI.updateAiBtn();App.offlineUI.updateTyping(false);}
      if(err.name==='AbortError'){Offline._backgroundMode=false;return;}
      var errMsg=err.message||String(err); var cnMsg=translateError(errMsg); console.error('[线下] '+cnMsg);
      if(fullText){ finishText(fullText); } else {
        if(App.offlineUI) App.offlineUI.renderMessages();
        var container=App.$('#olMsgs');
        if(container){
          var errDiv=document.createElement('div');
          errDiv.style.cssText='font-size:12px;color:#c9706b;background:rgba(201,112,107,.08);border:1.5px solid rgba(201,112,107,.25);border-radius:10px;padding:12px 14px;margin:10px 20px 20px;word-break:break-all;white-space:pre-wrap;text-align:center;font-weight:700;box-shadow:0 4px 12px rgba(201,112,107,0.1);';
          errDiv.textContent=cnMsg+'\n\n[底层报错]: '+errMsg; container.appendChild(errDiv);
          if(App.offlineUI)App.offlineUI.scrollBottom(true);
        }
      }
      Offline._backgroundMode=false;
    });

    /* ★ 彻头彻尾重新打造防跑位·坚若磐石流水系统：全在内部完工绝不外抛改变系统形态！！ */
    var _twPos=0;
    Offline._typewriterTimer=null;
    Offline._finalTextToSave='';

    function typewriterTick(){
      var currentFull=(Offline._thinkText?'<think>'+Offline._thinkText+'</think>':'')+fullText;
      
      /* 被中途喊卡时的终止！*/
      if(!Offline.isStreaming){ Offline._typewriterTimer=null; return; }
      
      var bubble=App.$('#olStreamBubble');
      if(!bubble){ Offline._typewriterTimer=setTimeout(typewriterTick,50); return; }
      
      var remaining=currentFull.length-_twPos;

      /* ★神之落款时刻：字全部跑光、网也切断了？我们终于在这个没有网络残响的安静密闭小黑屋里关掉系统换上正常外壳！！！不再早泄飞移定位点！！！*/
      if(remaining<=0 && Offline._netDone){
         Offline.isStreaming = false;
         Offline._typewriterTimer=null;
         if(App.offlineUI){App.offlineUI.updateAiBtn();App.offlineUI.updateTyping(false);}
         finishText(Offline._finalTextToSave || currentFull);
         return;
      }
      if(remaining<=0){ Offline._typewriterTimer=setTimeout(typewriterTick,30); return; }

      /* 只步长强控 */
      var step = 1;
      if(remaining > 150) step = 3; else if(remaining > 60) step = 2;
      /* 网在龟速且还剩2个字没吐干净的时候：直接含在嘴里不要出！保留等待渲染权避免瞬间卡停的露馅儿*/
      if(!Offline._netDone && remaining <= 2) step = 0; 
      
      _twPos+=step;
      if(_twPos>currentFull.length) _twPos=currentFull.length;

      var visibleText=currentFull.slice(0,_twPos);
      var parsed=App.offlineUI?App.offlineUI.parseThinking(visibleText):{think:'',main:visibleText};
      var mainHtml=App.offlineUI?App.offlineUI.formatProse(parsed.main,Offline.charId,false):App.esc(parsed.main);
      
      if(parsed.think){
        var fmtThink = App.offlineUI ? App.offlineUI.formatThinkText(App.esc(parsed.think)) : App.esc(parsed.think).replace(/\n/g,'<br>');
        var thinkHtml='<details class="ol-think-stream" open><summary style="font-size:12px;color:#7ea3c9;font-weight:700;cursor:pointer;margin-bottom:4px;">💭 思考中...</summary><div style="font-size:13px;color:#888;line-height:1.7;word-break:break-word;">'+fmtThink+'</div></details>';
        bubble.innerHTML=thinkHtml+mainHtml;
      } else {
        bubble.innerHTML=mainHtml;
      }

      var tkSpan = App.$('#olStreamTkSpan');
      if(tkSpan) tkSpan.textContent = Math.round(visibleText.length / 2) + ' tk';
      if(App.offlineUI && step > 0) App.offlineUI.scrollBottom();
      
      var delay = 35;
      if(remaining > 80) delay = 12; else if(remaining > 30) delay = 25; else if(remaining > 10) delay = 45; else if(remaining > 4) delay = 80; else delay = 150;

      Offline._typewriterTimer=setTimeout(typewriterTick, delay);
    }

    if(streamOn){
      Offline._typewriterTimer=setTimeout(typewriterTick,100);
    }

    /* 这个外置宣告如今被贬入冷宫成为简单的封口存放架，不再准它拥有更改外貌UI惹乱定位的控制权限。 */
    function onStreamDone(text){
      text=text.trim();
      if(Offline._thinkText){ text='<think>'+Offline._thinkText+'</think>'+text; }
      Offline._thinkText='';
      Offline._finalTextToSave = text;
      
      /* 无流式时无脑直走 */
      if(!streamOn) {
         Offline.isStreaming=false;Offline.abortCtrl=null;
         if(App.offlineUI){App.offlineUI.updateAiBtn();App.offlineUI.updateTyping(false);}
         if(!text){if(App.offlineUI)App.offlineUI.renderMessages();return;}
         finishText(text);
      }
    }

    function finishText(text){
      var now=Date.now();
      if(Offline._regenIdx!==null&&Offline._regenIdx!==undefined){
        var targetIdx=Offline._regenIdx;
        var target=Offline.messages[targetIdx];
        Offline._regenIdx=null;
        if(target){
          if(!target.swipes)target.swipes=[target.content];
          if(!target.children)target.children=[];
          target.swipes.push(text);
          target.content=text;
          target.swipeIdx=target.swipes.length-1;
          target.ts=now;
          target.children[target.swipeIdx]=[];
          Offline.messages.splice(targetIdx+1);
        }
      } else {
        Offline.messages.push({role:'assistant',content:text,ts:now});
      }
      Offline.saveMsgs();
      if(App.offlineUI)App.offlineUI.renderMessages();
    }
  },

  /* 当你看不惯强行终止时，这段保证它也牢牢坐在它本该霸住的分支格子里！！ */
  stopStream:function(){
    if(Offline.abortCtrl){Offline.abortCtrl.abort();Offline.abortCtrl=null;}
    if(Offline._typewriterTimer){clearTimeout(Offline._typewriterTimer);Offline._typewriterTimer=null;}
    var partial=Offline._streamPartial||'';
    
    Offline.isStreaming=false;
    if(App.offlineUI){App.offlineUI.updateAiBtn();App.offlineUI.updateTyping(false);}
    
    if(partial){
      if(Offline._thinkText){
        partial='<think>'+Offline._thinkText+'</think>'+partial.replace(/<think>[\s\S]*?<\/think>/gi,'');
      }
      var now=Date.now();
      
      if(Offline._regenIdx!==null&&Offline._regenIdx!==undefined){
        var targetIdx=Offline._regenIdx;
        var target=Offline.messages[targetIdx];
        Offline._regenIdx=null;
        if(target){
          if(!target.swipes)target.swipes=[target.content];
          if(!target.children)target.children=[];
          target.swipes.push(partial);
          target.content=partial;
          target.swipeIdx=target.swipes.length-1;
          target.ts=now;
          target.children[target.swipeIdx]=[];
          Offline.messages.splice(targetIdx+1);
        }
      } else {
        Offline.messages.push({role:'assistant',content:partial,ts:now});
      }
      Offline.saveMsgs();
    }
    Offline._thinkText='';
    if(App.offlineUI)App.offlineUI.renderMessages();
  },

  dismissCtx:function(){
    if(Offline._ctxMenu){Offline._ctxMenu.remove();Offline._ctxMenu=null;}
  },

  init:function(){
    App.offline=Offline;

    App.safeOn('#dockCheck','click',function(){
      var chars=App.character?App.character.list:[];
      if(!chars||!chars.length){App.showToast('请先添加角色');return;}
      if(chars.length===1){Offline.openFor(chars[0].id);return;}

      var picker=document.createElement('div');
      picker.style.cssText='position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';
      var listHtml=chars.map(function(c){
        var av=c.avatar
          ?'<img src="'+App.escAttr(c.avatar)+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">'
          :'<div style="width:36px;height:36px;border-radius:50%;background:rgba(126,163,201,.15);"></div>';
        return '<div data-cid="'+c.id+'" style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.04);">'+av+'<span style="font-size:14px;font-weight:600;color:#2e4258;">'+App.esc(c.name||'?')+'</span></div>';
      }).join('');

      picker.innerHTML=
        '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:16px;padding:16px 0;width:280px;max-height:70vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);">'+
          '<div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;padding:0 16px 12px;border-bottom:1px solid rgba(0,0,0,.04);">选择角色</div>'+
          listHtml+
          '<div style="text-align:center;padding:12px;"><button type="button" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:inherit;" id="olPickCancel">取消</button></div>'+
        '</div>';

      document.body.appendChild(picker);
      picker.addEventListener('click',function(e){if(e.target===picker)picker.remove();});
      picker.querySelector('#olPickCancel').addEventListener('click',function(){picker.remove();});
      picker.querySelectorAll('[data-cid]').forEach(function(el){
        el.addEventListener('click',function(){
          picker.remove();
          Offline.openFor(el.dataset.cid);
        });
      });
    });
  }
};

App.register('offline',Offline);
})();
