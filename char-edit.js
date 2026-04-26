
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var CharEdit = {
    editingCharId: null,
    tempAvatar: '',

    open: function(charId, modeIdx) {
      CharEdit.editingCharId = charId || null;
      CharEdit.tempAvatar = '';
      var existing = null;
      if (charId && App.character) existing = App.character.getById(charId);

      var old = App.$('#charCreatePanel');
      if (old) old.remove();

      var mode = (typeof modeIdx === 'number') ? modeIdx : (App.character ? App.character.currentMode : 0);
      var editModeClass = '';
      if (mode === 1) editModeClass = ' cc-edit-frost';
      else if (mode === 2) editModeClass = ' cc-edit-mono';

      var createPanel = document.createElement('div');
      createPanel.id = 'charCreatePanel';
      createPanel.className = 'cc-edit-page' + editModeClass;
      createPanel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10001;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      document.body.appendChild(createPanel);

      var e = existing || {};
      var av = e.avatar ? '<img src="'+App.esc(e.avatar)+'">' : '<span class="cc-avatar-empty">PHOTO</span>';
      var cv = e.contactMode || 'direct';
      var v = function(k){ return App.esc(e[k]||''); };
      var rc = function(val){ return cv===val?' checked':''; };

      createPanel.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">'+
          '<button class="cc-top-btn" id="ccBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">'+(existing?'编辑角色':'添加角色')+'</span>'+
          '<div style="width:36px;"></div>'+
        '</div>'+
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 40px;">'+
          '<div class="comic-card">'+
            '<div class="top-bar"></div>'+

            '<div class="cc-header">'+
              '<div class="cc-avatar-box" id="ccAvatarBox">'+av+'</div>'+
              '<div class="cc-name-area"><div class="cc-name-label">CHARACTER NAME</div><input type="text" class="cc-name-input" id="ccNameInput" placeholder="输入角色名..." value="'+v('name')+'"><div class="cc-name-sub"></div></div>'+
            '</div>'+

            '<div class="cc-section">'+
              '<div class="cc-section-head"><div class="cc-section-title">基础信息</div></div>'+
              '<div class="cc-section-body" style="padding:0 20px 16px;">'+
                '<div class="cc-field-grid">'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">性别 GENDER</div></div><input type="text" class="cc-field-input" data-key="gender" value="'+v('gender')+'"></div>'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">年龄 AGE</div></div><input type="text" class="cc-field-input" data-key="age" value="'+v('age')+'"></div>'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">生日 BIRTHDAY</div></div><input type="text" class="cc-field-input" data-key="birthday" value="'+v('birthday')+'"></div>'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">对你的称呼 CALL</div></div><input type="text" class="cc-field-input" data-key="callName" value="'+v('callName')+'"></div>'+
                '</div>'+
                '<div class="cc-field" style="margin-top:8px"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">与你的关系 RELATION</div></div><input type="text" class="cc-field-input" data-key="relation" value="'+v('relation')+'"></div>'+

                '<div class="cc-divider"><div class="cc-divider-line"></div><div class="cc-divider-text">社交账号</div><div class="cc-divider-line"></div></div>'+

                '<div class="cc-field-grid">'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">手机号 PHONE</div></div><input type="text" class="cc-field-input" data-key="charPhone" placeholder="留空随机生成" value="'+v('charPhone')+'"></div>'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">微信号 WECHAT</div></div><input type="text" class="cc-field-input" data-key="charWechat" placeholder="留空随机生成" value="'+v('charWechat')+'"></div>'+
                '</div>'+

                '<div class="cc-divider"><div class="cc-divider-line"></div><div class="cc-divider-text">通讯录</div><div class="cc-divider-line"></div></div>'+

                '<div class="cc-field-label" style="margin-bottom:6px"><div class="cc-field-dot"></div><div class="cc-field-key">微信通讯录 CONTACT</div></div>'+
                '<div class="cc-radio-row">'+
                  '<div class="cc-radio-item"><input type="radio" name="ccContact" id="ccC1" value="direct"'+rc('direct')+'><label class="cc-radio-label" for="ccC1">直接添加</label></div>'+
                  '<div class="cc-radio-item"><input type="radio" name="ccContact" id="ccC2" value="wait"'+rc('wait')+'><label class="cc-radio-label" for="ccC2">等待对方来加</label></div>'+
                  '<div class="cc-radio-item"><input type="radio" name="ccContact" id="ccC3" value="manual"'+rc('manual')+'><label class="cc-radio-label" for="ccC3">由你主动添加角色</label></div>'+
                '</div>'+
                '<div class="cc-tip"><div class="cc-tip-icon">!</div><div class="cc-tip-text">「直接添加」会立即出现在微信通讯录和聊天列表中；「等待对方来加」则由角色在合适的时机主动发起好友请求；「由你主动添加角色」需要你在微信中手动搜索添加。</div></div>'+
              '</div>'+
            '</div>'+

            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title blue">角色档案</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="profile" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccProfile" placeholder="">'+v('profile')+'</textarea></div></div></div>'+

'<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title">开场白</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="greeting" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccGreeting">'+v('greeting')+'</textarea></div></div></div>'+

            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title blue">示例对话</div></div><div class="cc-section-body"><div class="cc-dialogue-area"><button class="cc-expand-btn" data-field="dialogExamples" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccDialog">'+v('dialogExamples')+'</textarea></div></div></div>'+

            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title">后置指令</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="postInstruction" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccPost">'+v('postInstruction')+'</textarea></div></div></div>'+

            '<div class="cc-bottom-deco"></div>'+
          '</div>'+
          '<div class="cc-save-area"><button class="cc-save-btn" id="ccSaveBtn" type="button">保 存</button><button class="cc-cancel-btn" id="ccCancelBtn" type="button">取 消</button></div>'+
        '</div>';

      if (e.avatar) CharEdit.tempAvatar = e.avatar;
      if (existing) {
        createPanel.style.setProperty('--edit-dark', e.cardDark||'#111111');
        createPanel.style.setProperty('--edit-accent', e.cardAccent||'#88abda');
        createPanel.style.setProperty('--edit-light', e.cardLight||'#ffffff');
      }

      requestAnimationFrame(function(){requestAnimationFrame(function(){
        createPanel.style.transform='translateX(0)';createPanel.style.opacity='1';
      });});

      createPanel.querySelector('#ccAvatarBox').addEventListener('click',function(){
        var box=this;
        var input=document.createElement('input');input.type='file';input.accept='image/*';
        document.body.appendChild(input);
        input.onchange=function(ev){
          var file=ev.target.files[0];document.body.removeChild(input);if(!file)return;
          var reader=new FileReader();
          reader.onload=function(r){
            if(App.cropImage)App.cropImage(r.target.result,function(c){CharEdit.tempAvatar=c;box.innerHTML='<img src="'+c+'">';});
            else{CharEdit.tempAvatar=r.target.result;box.innerHTML='<img src="'+r.target.result+'">';}
          };reader.readAsDataURL(file);
        };input.click();
      });

      createPanel.querySelector('#ccBackBtn').addEventListener('click',function(){CharEdit.close();});
      createPanel.querySelector('#ccCancelBtn').addEventListener('click',function(){CharEdit.close();});
      createPanel.querySelector('#ccSaveBtn').addEventListener('click',function(){CharEdit.save();});

      createPanel.querySelectorAll('.cc-expand-btn').forEach(function(btn){
        btn.addEventListener('click',function(ev){
          ev.stopPropagation();
          var f=btn.dataset.field;
          var map={profile:'#ccProfile',dialogExamples:'#ccDialog',postInstruction:'#ccPost',greeting:'#ccGreeting'};
          var ta=App.$(map[f]);if(!ta)return;
          var names={profile:'角色档案',dialogExamples:'示例对话',postInstruction:'后置指令',greeting:'开场白'};
          CharEdit.openExpand(names[f],ta,f==='dialogExamples');
        });
      });
    },

    close:function(){
      var p=App.$('#charCreatePanel');if(!p)return;
      p.style.transform='translateX(100%)';p.style.opacity='0';
      setTimeout(function(){if(p.parentNode)p.remove();},350);
    },

    save:function(){
      var panel=App.$('#charCreatePanel');if(!panel)return;
      var name=(App.$('#ccNameInput')||{}).value||'';name=name.trim();
      if(!name){App.showToast('请输入角色名');return;}
      if(!App.character)return;

      var d={};
      panel.querySelectorAll('.cc-field-input[data-key]').forEach(function(el){d[el.dataset.key]=(el.value||'').trim();});
      var cr=panel.querySelector('input[name="ccContact"]:checked');

      if(!d.charPhone)d.charPhone='1'+Math.floor(100000000+Math.random()*900000000);
      if(!d.charWechat)d.charWechat='wxid_'+Math.random().toString(36).substr(2,10);

      var obj={
        name:name,
        avatar:CharEdit.tempAvatar,
        profile:(App.$('#ccProfile')||{}).value||'',
        dialogExamples:(App.$('#ccDialog')||{}).value||'',
        postInstruction:(App.$('#ccPost')||{}).value||'',
        greeting:(App.$('#ccGreeting')||{}).value||'',
        gender:d.gender||'',age:d.age||'',birthday:d.birthday||'',
        callName:d.callName||'',relation:d.relation||'',
        charPhone:d.charPhone,charWechat:d.charWechat,
        contactMode:cr?cr.value:'direct'
      };

      if(CharEdit.editingCharId){
        var ex=App.character.getById(CharEdit.editingCharId);
        if(ex){
          Object.keys(obj).forEach(function(k){ex[k]=obj[k];});
          if(!obj.avatar)ex.avatar=ex.avatar;else ex.avatar=obj.avatar;
          App.character.save();CharEdit.close();App.character.renderList();
          App.showToast('角色已更新');return;
        }
      }

      obj.id='char-'+Date.now();
      obj.cover='';obj.cardDark='#111111';obj.cardAccent='#88abda';
      obj.cardBg='#ffffff';obj.cardLine=3;obj.cardColor='#88abda';
      obj.worldbookMounted=false;obj.modeColors=[{},{},{}];
      App.character.list.push(obj);
      App.character.save();CharEdit.close();App.character.renderList();
      App.showToast('角色已创建');
    },

    openExpand:function(title,textarea,isDialogue){
      var old=App.$('#ccExpandEditor');if(old)old.remove();
      var editor=document.createElement('div');
      editor.id='ccExpandEditor';
      editor.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10002;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateY(100%);opacity:0;overflow:hidden;';
      editor.innerHTML=
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">'+
          '<button class="cc-expand-top-btn" id="ccExpandBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
          '<div class="cc-expand-title-tag'+(isDialogue?' blue':'')+'">'+App.esc(title)+'</div>'+
          '<button class="cc-expand-top-btn" id="ccExpandDone" type="button"><svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>'+
        '</div>'+
        '<div style="flex:1;padding:0 16px 40px;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;">'+
          '<div style="background:#fff;border:3.5px solid #111;box-shadow:6px 6px 0 #111;position:relative;overflow:hidden;">'+
            '<div style="background:#111;height:4px;width:100%;"></div>'+
            '<div style="position:absolute;top:4px;right:0;width:40px;height:40px;background:repeating-linear-gradient(-45deg,transparent,transparent 3px,#88abda 3px,#88abda 5px);opacity:.35;pointer-events:none;"></div>'+
            '<div style="min-height:calc(100vh - 220px);border:1.5px dashed #c8d4e2;margin:14px;background:repeating-linear-gradient(0deg,transparent,transparent 22px,#eef2f7 22px,#eef2f7 23px);position:relative;">'+
              (isDialogue?'<div style="position:absolute;top:8px;left:6px;font-size:22px;font-weight:900;color:#88abda;line-height:1;pointer-events:none;z-index:1;">「</div><div style="position:absolute;bottom:4px;right:10px;font-size:22px;font-weight:900;color:#88abda;line-height:1;pointer-events:none;z-index:1;">」</div>':'')+
              '<textarea id="ccExpandTA" style="width:100%;min-height:calc(100vh - 250px);border:none;background:transparent;padding:12px '+(isDialogue?'14px 12px 26px':'14px')+';font-size:14px;color:#333;outline:none;resize:vertical;font-family:inherit;line-height:22px;box-sizing:border-box;" placeholder="'+App.esc(textarea.placeholder||'')+'">'+App.esc(textarea.value)+'</textarea>'+
            '</div>'+
            '<div style="height:8px;background:linear-gradient(90deg,#111 30%,#88abda 30%,#88abda 65%,#111 65%);"></div>'+
          '</div>'+
        '</div>';
      document.body.appendChild(editor);
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        editor.style.transform='translateY(0)';editor.style.opacity='1';
      });});
      var ta=App.$('#ccExpandTA');if(ta)ta.focus();
      function done(){textarea.value=App.$('#ccExpandTA').value;editor.style.transform='translateY(100%)';editor.style.opacity='0';setTimeout(function(){if(editor.parentNode)editor.remove();},350);}
      App.$('#ccExpandBack').addEventListener('click',done);
      App.$('#ccExpandDone').addEventListener('click',done);
    },

    init:function(){App.charEdit=CharEdit;}
  };

  App.register('charEdit',CharEdit);
})();
