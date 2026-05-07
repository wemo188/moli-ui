
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
      var av = e.avatar ? '<img src="'+App.escAttr(e.avatar)+'">' : '<span class="cc-avatar-empty">PHOTO</span>';
      var cv = e.contactMode || 'direct';
      var v = function(k){ return App.esc(e[k]||''); };
      var rc = function(val){ return cv===val?' checked':''; };

      // 获取角色管理配置
      var cfg = {};
      if (App.charMgr) {
        if (charId && App.charMgr.charConfigs && App.charMgr.charConfigs[charId]) {
          cfg = App.charMgr.charConfigs[charId];
        } else if (App.charMgr.globalConfig) {
          cfg = JSON.parse(JSON.stringify(App.charMgr.globalConfig));
        }
      }
      if (!cfg.mainLang) cfg.mainLang = '简体中文';
      if (!cfg.msgTypes) cfg.msgTypes = ['文字'];
      var ck = function(key) { return cfg[key] ? ' checked' : ''; };
      var sv = function(key, val) { return cfg[key] === val ? ' selected' : ''; };

      var PRO_LEVEL_NAMES = ['佛系','偶尔','适中','频繁','粘人'];
      var MSG_TYPES = ['文字','表情','图片','语音','语音通话','视频通话','红包','转账','位置','音乐'];
      var proManual = cfg.proMode !== 'auto';
      var isAllDay = cfg.proActiveStart === '00:00' && cfg.proActiveEnd === '23:59';

      var msgTagsHtml = MSG_TYPES.map(function(t, i) {
        var checked = (cfg.msgTypes && cfg.msgTypes.indexOf(t) >= 0) ? ' checked' : '';
        return '<div class="cm-tag"><input type="checkbox" id="ccMt' + i + '" data-type="' + t + '"' + checked + '><label class="cm-tag-label" for="ccMt' + i + '">' + t + '</label></div>';
      }).join('');

      createPanel.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">'+
          '<button class="cc-top-btn" id="ccBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">'+(existing?'编辑角色':'添加角色')+'</span>'+
          '<div style="width:36px;"></div>'+
        '</div>'+
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 40px;">'+
          '<div class="comic-card">'+
            '<div class="top-bar"></div>'+

            /* ★ 顶部区域：三个框连接为一体，整体调矮 */
            '<div class="cc-header" style="padding:12px 16px 10px;">'+
              '<div class="cc-avatar-box" id="ccAvatarBox" style="width:56px;height:56px;">'+av+'</div>'+
              '<div class="cc-name-area" style="flex:1;"><input type="text" class="cc-name-input" id="ccNameInput" placeholder="角色名..." value="'+v('name')+'" style="font-size:15px;padding:6px 10px;"></div>'+
            '</div>'+

            /* ★ 连接线 + 基础信息区（三个框一体化设计） */
            '<div style="border:1.5px solid #ddd;border-radius:12px;margin:0 12px 12px;overflow:hidden;">'+

              /* 第一块：基础信息 */
              '<div style="padding:12px 14px;border-bottom:1px solid #eee;">'+
                '<div style="font-size:11px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:8px;">基础信息</div>'+
                '<div class="cc-field-grid">'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">性别</div></div><input type="text" class="cc-field-input" data-key="gender" value="'+v('gender')+'"></div>'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">年龄</div></div><input type="text" class="cc-field-input" data-key="age" value="'+v('age')+'"></div>'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">生日</div></div><input type="text" class="cc-field-input" data-key="birthday" value="'+v('birthday')+'"></div>'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">称呼</div></div><input type="text" class="cc-field-input" data-key="callName" value="'+v('callName')+'"></div>'+
                '</div>'+
                '<div class="cc-field" style="margin-top:6px"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">关系</div></div><input type="text" class="cc-field-input" data-key="relation" value="'+v('relation')+'"></div>'+
              '</div>'+

              /* 第二块：社交账号 */
              '<div style="padding:12px 14px;border-bottom:1px solid #eee;">'+
                '<div style="font-size:11px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:8px;">社交账号</div>'+
                '<div class="cc-field-grid">'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">手机号</div></div><input type="text" class="cc-field-input" data-key="charPhone" placeholder="留空随机" value="'+v('charPhone')+'"></div>'+
                  '<div class="cc-field"><div class="cc-field-label"><div class="cc-field-dot"></div><div class="cc-field-key">微信号</div></div><input type="text" class="cc-field-input" data-key="charWechat" placeholder="留空随机" value="'+v('charWechat')+'"></div>'+
                '</div>'+
              '</div>'+

              /* 第三块：通讯录 */
              '<div style="padding:12px 14px;">'+
                '<div style="font-size:11px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:8px;">通讯录</div>'+
                '<div class="cc-radio-row">'+
                  '<div class="cc-radio-item"><input type="radio" name="ccContact" id="ccC1" value="direct"'+rc('direct')+'><label class="cc-radio-label" for="ccC1">直接添加</label></div>'+
                  '<div class="cc-radio-item"><input type="radio" name="ccContact" id="ccC2" value="wait"'+rc('wait')+'><label class="cc-radio-label" for="ccC2">等待对方来加</label></div>'+
                  '<div class="cc-radio-item"><input type="radio" name="ccContact" id="ccC3" value="manual"'+rc('manual')+'><label class="cc-radio-label" for="ccC3">你主动添加</label></div>'+
                '</div>'+
              '</div>'+

            '</div>'+

            /* 角色档案 */
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title blue">角色档案</div></div><div class="cc-section-body"><div class="cc-content-area"><button class="cc-expand-btn" data-field="profile" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccProfile" placeholder="">'+v('profile')+'</textarea></div></div></div>'+

            /* ★ 示例对话：黑色主题 */
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title" style="color:#1a1a1a;">示例对话</div></div><div class="cc-section-body"><div class="cc-dialogue-area" style="border-color:#1a1a1a;"><button class="cc-expand-btn" data-field="dialogExamples" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccDialog" style="border-left:3px solid #1a1a1a;">'+v('dialogExamples')+'</textarea></div></div></div>'+

            /* ★ 后置指令：蓝色主题 */
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title blue">后置指令</div></div><div class="cc-section-body"><div class="cc-content-area" style="border-color:#88abda;"><button class="cc-expand-btn" data-field="postInstruction" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea id="ccPost" style="border-left:3px solid #88abda;">'+v('postInstruction')+'</textarea></div></div></div>'+

            /* ★ 角色管理设置（从 char-mgr 移入） */
            '<div class="cc-section"><div class="cc-section-head"><div class="cc-section-title" style="color:#6bab8e;">行为设置</div></div><div class="cc-section-body" style="padding:0 16px 16px;">'+

              /* 语言 */
              '<div style="margin-bottom:12px;">'+
                '<div style="font-size:11px;font-weight:700;color:#888;margin-bottom:6px;">主要语言</div>'+
                '<select class="cc-field-input" id="ccMainLang" style="width:100%;padding:8px 10px;"><option'+sv('mainLang','简体中文')+'>简体中文</option><option'+sv('mainLang','繁體中文')+'>繁體中文</option><option'+sv('mainLang','English')+'>English</option><option'+sv('mainLang','日本語')+'>日本語</option><option'+sv('mainLang','한국어')+'>한국어</option></select>'+
              '</div>'+

              /* MiniMax 语音 */
              '<div style="margin-bottom:12px;padding:10px;border:1px solid #eee;border-radius:10px;">'+
                '<div style="display:flex;justify-content:space-between;align-items:center;">'+
                  '<div><div style="font-size:12px;font-weight:600;color:#333;">MiniMax 语音</div><div style="font-size:10px;color:#999;">使用 MiniMax TTS 生成角色语音</div></div>'+
                  '<label style="position:relative;width:40px;height:22px;"><input type="checkbox" id="ccMmToggle"'+ck('minimax')+' style="opacity:0;width:0;height:0;"><div style="position:absolute;inset:0;border-radius:11px;background:'+(cfg.minimax?'#7a9ab8':'#ddd')+';transition:all .2s;cursor:pointer;"></div></label>'+
                '</div>'+
                '<div id="ccMmSub" style="margin-top:8px;'+(cfg.minimax?'':'display:none;')+'">'+
                  '<input type="text" class="cc-field-input" id="ccMmVoice" placeholder="Voice ID" value="'+App.escAttr(cfg.mmVoiceId||'')+'" style="margin-bottom:6px;">'+
                  '<input type="text" class="cc-field-input" id="ccMmKey" placeholder="API Key（留空用全局）" value="'+App.escAttr(cfg.mmApiKey||'')+'">'+
                '</div>'+
              '</div>'+

              /* 主动消息 */
              '<div style="margin-bottom:12px;padding:10px;border:1px solid #eee;border-radius:10px;">'+
                '<div style="display:flex;justify-content:space-between;align-items:center;">'+
                  '<div><div style="font-size:12px;font-weight:600;color:#333;">主动发消息</div><div style="font-size:10px;color:#999;">角色不定时主动联系你</div></div>'+
                  '<label style="position:relative;width:40px;height:22px;"><input type="checkbox" id="ccProToggle"'+ck('proactive')+' style="opacity:0;width:0;height:0;"><div style="position:absolute;inset:0;border-radius:11px;background:'+(cfg.proactive?'#7a9ab8':'#ddd')+';transition:all .2s;cursor:pointer;"></div></label>'+
                '</div>'+
                '<div id="ccProSub" style="margin-top:8px;'+(cfg.proactive?'':'display:none;')+'">'+
                  '<div style="display:flex;gap:8px;margin-bottom:8px;">'+
                    '<div style="flex:1;"><div style="font-size:10px;color:#888;margin-bottom:4px;">最短间隔(分)</div><input type="number" class="cc-field-input" id="ccProMin" value="'+(cfg.proMinInterval||15)+'" min="1" max="480" style="text-align:center;"></div>'+
                    '<div style="flex:1;"><div style="font-size:10px;color:#888;margin-bottom:4px;">最长间隔(分)</div><input type="number" class="cc-field-input" id="ccProMax" value="'+(cfg.proMaxInterval||120)+'" min="1" max="480" style="text-align:center;"></div>'+
                  '</div>'+
                  '<div style="font-size:10px;color:#888;margin-bottom:4px;">积极程度</div>'+
                  '<div style="display:flex;align-items:center;gap:6px;"><span style="font-size:10px;color:#aaa;">佛系</span><input type="range" id="ccProLevel" min="1" max="5" step="1" value="'+(cfg.proLevel||3)+'" style="flex:1;"><span style="font-size:10px;color:#aaa;">粘人</span><span id="ccProLevelVal" style="font-size:11px;font-weight:600;color:#7a9ab8;width:30px;text-align:right;">'+PRO_LEVEL_NAMES[(cfg.proLevel||3)-1]+'</span></div>'+
                '</div>'+
              '</div>'+

              /* 回复条数 */
              '<div style="margin-bottom:12px;">'+
                '<div style="font-size:11px;font-weight:700;color:#888;margin-bottom:6px;">每次回复条数</div>'+
                '<div style="display:flex;gap:8px;">'+
                  '<div style="flex:1;"><div style="font-size:10px;color:#888;margin-bottom:4px;">最少</div><input type="number" class="cc-field-input" id="ccMinMsgs" value="'+(cfg.minMsgs||1)+'" min="1" max="10" style="text-align:center;"></div>'+
                  '<div style="flex:1;"><div style="font-size:10px;color:#888;margin-bottom:4px;">最多</div><input type="number" class="cc-field-input" id="ccMaxMsgs" value="'+(cfg.maxMsgs||3)+'" min="1" max="10" style="text-align:center;"></div>'+
                '</div>'+
              '</div>'+

              /* 消息类型 */
              '<div style="margin-bottom:12px;">'+
                '<div style="font-size:11px;font-weight:700;color:#888;margin-bottom:6px;">允许的消息类型</div>'+
                '<div class="cm-tag-row" id="ccMsgTypes" style="display:flex;flex-wrap:wrap;gap:6px;">'+msgTagsHtml+'</div>'+
              '</div>'+

              /* 回复速度 */
              '<div style="margin-bottom:12px;">'+
                '<div style="font-size:11px;font-weight:700;color:#888;margin-bottom:6px;">回复速度</div>'+
                '<select class="cc-field-input" id="ccReplySpeed" style="width:100%;padding:8px 10px;"><option'+sv('replySpeed','即时回复')+'>即时回复</option><option'+sv('replySpeed','快速（1-3秒）')+'>快速（1-3秒）</option><option'+sv('replySpeed','正常（3-8秒）')+'>正常（3-8秒）</option><option'+sv('replySpeed','慢速（5-15秒）')+'>慢速（5-15秒）</option><option'+sv('replySpeed','真实模拟（按字数）')+'>真实模拟（按字数）</option></select>'+
              '</div>'+

            '</div></div>'+

            '<div class="cc-bottom-deco"></div>'+
          '</div>'+
          '<div class="cc-save-area"><button class="cc-save-btn" id="ccSaveBtn" type="button">保 存</button><button class="cc-cancel-btn" id="ccCancelBtn" type="button">取 消</button></div>'+
        '</div>';

      if (e.avatar) CharEdit.tempAvatar = e.avatar;

      requestAnimationFrame(function(){requestAnimationFrame(function(){
        createPanel.style.transform='translateX(0)';createPanel.style.opacity='1';
      });});

      // ★ 滑动返回
      App.bindSwipeBack(createPanel, function() { CharEdit.close(); });

      // 头像点击
      createPanel.querySelector('#ccAvatarBox').addEventListener('click', function(){
        CharEdit._showAvatarSourceMenu(this);
      });

      createPanel.querySelector('#ccBackBtn').addEventListener('click',function(){CharEdit.close();});
      createPanel.querySelector('#ccCancelBtn').addEventListener('click',function(){CharEdit.close();});
      createPanel.querySelector('#ccSaveBtn').addEventListener('click',function(){CharEdit.save();});

      // 展开按钮
      createPanel.querySelectorAll('.cc-expand-btn').forEach(function(btn){
        btn.addEventListener('click',function(ev){
          ev.stopPropagation();
          var f=btn.dataset.field;
          var map={profile:'#ccProfile',dialogExamples:'#ccDialog',postInstruction:'#ccPost'};
          var ta=App.$(map[f]);if(!ta)return;
          var names={profile:'角色档案',dialogExamples:'示例对话',postInstruction:'后置指令'};
          CharEdit.openExpand(names[f],ta,f==='dialogExamples');
        });
      });

      // ★ 行为设置的开关绑定
      var mmToggle = createPanel.querySelector('#ccMmToggle');
      var mmSub = createPanel.querySelector('#ccMmSub');
      if (mmToggle && mmSub) {
        mmToggle.addEventListener('change', function() {
          mmSub.style.display = this.checked ? '' : 'none';
          this.parentElement.querySelector('div').style.background = this.checked ? '#7a9ab8' : '#ddd';
        });
      }

      var proToggle = createPanel.querySelector('#ccProToggle');
      var proSub = createPanel.querySelector('#ccProSub');
      if (proToggle && proSub) {
        proToggle.addEventListener('change', function() {
          proSub.style.display = this.checked ? '' : 'none';
          this.parentElement.querySelector('div').style.background = this.checked ? '#7a9ab8' : '#ddd';
        });
      }

      var proLevel = createPanel.querySelector('#ccProLevel');
      var proLevelVal = createPanel.querySelector('#ccProLevelVal');
      if (proLevel && proLevelVal) {
        proLevel.addEventListener('input', function() {
          proLevelVal.textContent = PRO_LEVEL_NAMES[parseInt(this.value) - 1];
        });
      }
    },

    _showAvatarSourceMenu: function(box) {
      var old = App.$('#avatarSourceMenu');
      if (old) old.remove();

      var menu = document.createElement('div');
      menu.id = 'avatarSourceMenu';
      menu.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
      menu.innerHTML =
        '<div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:10px;">'+
          '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:4px;">选择头像来源</div>'+
          '<button id="avFromAlbum" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择</button>'+
          '<button id="avFromUrl" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button>'+
          '<button id="avFromDel" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:12px;font-weight:500;color:#bbb;cursor:pointer;font-family:inherit;">删除头像</button>'+
          '<button id="avFromCancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>'+
        '</div>';
      document.body.appendChild(menu);

      menu.addEventListener('click', function(e) { if (e.target === menu) menu.remove(); });
      menu.querySelector('#avFromCancel').addEventListener('click', function() { menu.remove(); });
      menu.querySelector('#avFromDel').addEventListener('click', function() {
        menu.remove();
        CharEdit.tempAvatar = '';
        box.innerHTML = '<span class="cc-avatar-empty">PHOTO</span>';
      });
      menu.querySelector('#avFromAlbum').addEventListener('click', function() {
        menu.remove();
        var input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        document.body.appendChild(input);
        input.onchange = function(ev) {
          var file = ev.target.files[0];
          document.body.removeChild(input);
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(r) {
            if (App.cropImage) {
              App.cropImage(r.target.result, function(c) {
                CharEdit.tempAvatar = c;
                box.innerHTML = '<img src="' + c + '">';
              });
            } else {
              CharEdit.tempAvatar = r.target.result;
              box.innerHTML = '<img src="' + r.target.result + '">';
            }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      });
      menu.querySelector('#avFromUrl').addEventListener('click', function() {
        menu.remove();
        var url = prompt('输入头像URL：');
        if (!url) return;
        CharEdit.tempAvatar = url;
        box.innerHTML = '<img src="' + App.escAttr(url) + '">';
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
        greeting:'', // ★ 开场白已删除，保持为空
        gender:d.gender||'',age:d.age||'',birthday:d.birthday||'',
        callName:d.callName||'',relation:d.relation||'',
        charPhone:d.charPhone,charWechat:d.charWechat,
        contactMode:cr?cr.value:'direct'
      };

      // ★ 收集行为设置并保存到角色管理
      var PRO_LEVEL_NAMES = ['佛系','偶尔','适中','频繁','粘人'];
      var msgTypes = [];
      panel.querySelectorAll('#ccMsgTypes input:checked').forEach(function(cb) { msgTypes.push(cb.dataset.type); });

      var behaviorCfg = {
        mainLang: (panel.querySelector('#ccMainLang') || {}).value || '简体中文',
        minimax: panel.querySelector('#ccMmToggle') ? panel.querySelector('#ccMmToggle').checked : false,
        mmVoiceId: (panel.querySelector('#ccMmVoice') || {}).value || '',
        mmApiKey: (panel.querySelector('#ccMmKey') || {}).value || '',
        proactive: panel.querySelector('#ccProToggle') ? panel.querySelector('#ccProToggle').checked : false,
        proMinInterval: parseInt((panel.querySelector('#ccProMin') || {}).value || 15),
        proMaxInterval: parseInt((panel.querySelector('#ccProMax') || {}).value || 120),
        proLevel: parseInt((panel.querySelector('#ccProLevel') || {}).value || 3),
        proMode: 'manual',
        minMsgs: parseInt((panel.querySelector('#ccMinMsgs') || {}).value || 1),
        maxMsgs: parseInt((panel.querySelector('#ccMaxMsgs') || {}).value || 3),
        msgTypes: msgTypes.length ? msgTypes : ['文字'],
        replySpeed: (panel.querySelector('#ccReplySpeed') || {}).value || '正常（3-8秒）',
        showTyping: true,
        fallbackTTS: false // ★ 备用TTS已删除
      };

      if(CharEdit.editingCharId){
        var ex=App.character.getById(CharEdit.editingCharId);
        if(ex){
          Object.keys(obj).forEach(function(k){ex[k]=obj[k];});
          if(!obj.avatar && ex.avatar) { /* 保留原头像 */ }
          else { ex.avatar = obj.avatar; }
          App.character.save();

          // 保存行为设置
          if (App.charMgr) {
            App.charMgr.charConfigs[CharEdit.editingCharId] = behaviorCfg;
            App.charMgr.save();
          }

          CharEdit.close();App.character.renderList();
          App.showToast('角色已更新');return;
        }
      }

      obj.id='char-'+Date.now();
      obj.cover='';obj.cardDark='#111111';obj.cardAccent='#88abda';
      obj.cardBg='#ffffff';obj.cardLine=3;obj.cardColor='#88abda';
      obj.worldbookMounted=false;obj.modeColors=[{},{},{}];
      App.character.list.push(obj);
      App.character.save();

      // 保存行为设置
      if (App.charMgr) {
        App.charMgr.charConfigs[obj.id] = behaviorCfg;
        App.charMgr.save();
      }

      CharEdit.close();App.character.renderList();
      App.showToast('角色已创建');
    },

    openExpand:function(title,textarea,isDialogue){
      var old=App.$('#ccExpandEditor');if(old)old.remove();
      var editor=document.createElement('div');
      editor.id='ccExpandEditor';
      editor.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10002;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateY(100%);opacity:0;overflow:hidden;';

      var accentColor = isDialogue ? '#1a1a1a' : '#88abda';

      editor.innerHTML=
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">'+
          '<button class="cc-expand-top-btn" id="ccExpandBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>'+
          '<div style="font-size:14px;font-weight:700;color:'+accentColor+';letter-spacing:1px;">'+App.esc(title)+'</div>'+
          '<button class="cc-expand-top-btn" id="ccExpandDone" type="button"><svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>'+
        '</div>'+
        '<div style="flex:1;padding:0 16px 40px;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;">'+
          '<textarea id="ccExpandTA" style="width:100%;min-height:calc(100vh - 140px);border:2px solid '+accentColor+';border-radius:12px;padding:14px;font-size:14px;color:#333;outline:none;font-family:inherit;line-height:1.7;box-sizing:border-box;resize:none;" placeholder="'+App.esc(textarea.placeholder||'')+'">'+App.esc(textarea.value)+'</textarea>'+
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
