
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var MSG_TYPES = ['文字','表情','图片','语音','语音通话','视频通话','红包','转账','位置','音乐'];
  var STK_STYLES = ['可爱卡通','写实','像素风','手绘','表情包梗图'];
  var PRO_LEVEL_NAMES = ['佛系','偶尔','适中','频繁','粘人'];
  var STK_FREQ_NAMES = ['极少','偶尔','适中','经常','频繁'];

  var DEFAULTS = {
    mainLang: '简体中文', bilingual: false, biLang: 'English', biStyle: 'bracket',
    minimax: false, mmVoiceId: '', mmApiKey: '', mmSpeed: 1, mmPitch: 0,
    proactive: true, proMinInterval: 15, proMaxInterval: 120,
    proActiveStart: '08:00', proActiveEnd: '23:30', proMode: 'manual', proLevel: 3,
    replySpeed: '正常（3-8秒）', showTyping: true, minMsgs: 1, maxMsgs: 3,
    msgTypes: ['文字','表情','图片','语音','语音通话','视频通话','红包','转账','位置','音乐'],
    stickerGen: false, stickerStyles: ['可爱卡通'], stickerFreq: 2,
    moments: false, momentsMax: 2, momentsTypes: ['纯文字','图文'], momentsImg: 'AI 生成',
    timeWeather: true, charCity: '', charRealCity: '',
    imgApiUrl: '', imgApiKey: '', imgModel: 'gpt-image-1',
    apiMode: 'global', apiSelect: '', temperature: 0.8, freqPenalty: 0.3, presPenalty: 0.3
  };

  var CharMgr = {
    _pageEl: null,
    _expandEl: null,
    editingCharId: null,
    tempAvatar: '',
    charConfigs: {},

    load: function() { CharMgr.charConfigs = App.LS.get('cmChars') || {}; },
    save: function() { App.LS.set('cmChars', CharMgr.charConfigs); },

    getCharConfig: function(charId) {
      if (CharMgr.charConfigs && CharMgr.charConfigs[charId]) return CharMgr.charConfigs[charId];
      return JSON.parse(JSON.stringify(DEFAULTS));
    },
    hasCustom: function(charId) { return !!CharMgr.charConfigs[charId]; },
    get globalConfig() { return JSON.parse(JSON.stringify(DEFAULTS)); },

    open: function(charId) {
  if (App.character) App.character.load();
  CharMgr.load();
  CharMgr.editingCharId = charId || null;
  CharMgr.tempAvatar = '';

  var existing = null;
  if (charId && App.character) existing = App.character.getById(charId);
  if (existing) CharMgr.tempAvatar = existing.avatar || '';
  
      var old = App.$('#charMgrPage');
      if (old) old.remove();

      var page = document.createElement('div');
      page.id = 'charMgrPage';
      page.className = 'cm-main-panel'; // 🌟 换成干净的类名
      document.body.appendChild(page);
      CharMgr._pageEl = page;

      CharMgr.render(page, existing);

        requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
      }); });

            // 🌟 滑动返回时，执行静默保存
      App.bindSwipeBack(page, function() { CharMgr.doSave(page, true); });
    },

    close: function() {
      var p = CharMgr._pageEl;
      if (!p) return;
      p.style.transform = 'translateX(100%)';
      p.style.opacity = '0';
      setTimeout(function() { if (p.parentNode) p.remove(); CharMgr._pageEl = null; }, 350);
    },

    render: function(page, existing) {
      var e = existing || {};
      var isNew = !CharMgr.editingCharId;
      var cfg = isNew ? JSON.parse(JSON.stringify(DEFAULTS)) : CharMgr.getCharConfig(CharMgr.editingCharId);

      var v = function(k) { return App.esc(e[k] || ''); };
      var cv = e.contactMode || 'direct';
      var rc = function(val) { return cv === val ? ' checked' : ''; };
      var ck = function(key) { return cfg[key] ? ' checked' : ''; };
      var sv = function(key, val) { return cfg[key] === val ? ' selected' : ''; };

      CharMgr.tempAvatar = e.avatar || '';
var av = CharMgr.tempAvatar ? '<img src="' + App.escAttr(CharMgr.tempAvatar) + '">' : '<span class="cc-avatar-empty">PHOTO</span>';

      var proManual = cfg.proMode !== 'auto';
      var isAllDay = cfg.proActiveStart === '00:00' && cfg.proActiveEnd === '23:59';
      var isIndividual = cfg.apiMode === 'individual';

      var msgTagsHtml = MSG_TYPES.map(function(t, i) {
        var checked = (cfg.msgTypes && cfg.msgTypes.indexOf(t) >= 0) ? ' checked' : '';
        return '<div class="cm-tag"><input type="checkbox" id="cmMt' + i + '" data-type="' + t + '"' + checked + '><label class="cm-tag-label" for="cmMt' + i + '">' + t + '</label></div>';
      }).join('');

      var stkStylesHtml = STK_STYLES.map(function(s, i) {
        var checked = (cfg.stickerStyles && cfg.stickerStyles.indexOf(s) >= 0) ? ' checked' : '';
        return '<div class="cm-tag"><input type="checkbox" id="cmSs' + i + '" data-sty="' + s + '"' + checked + '><label class="cm-tag-label" for="cmSs' + i + '">' + s + '</label></div>';
      }).join('');

      var momTypesHtml = ['纯文字','图文','转发'].map(function(t, i) {
        var checked = (cfg.momentsTypes && cfg.momentsTypes.indexOf(t) >= 0) ? ' checked' : '';
        return '<div class="cm-tag"><input type="checkbox" id="cmMom' + i + '" data-mtype="' + t + '"' + checked + '><label class="cm-tag-label" for="cmMom' + i + '">' + t + '</label></div>';
      }).join('');

      var apiList = App.LS.get('apiConfigs') || [];
      var apiOptionsHtml = '<option value="">使用全局 API</option>';
      apiList.forEach(function(a) {
        var sel = cfg.apiSelect === a.name ? ' selected' : '';
        apiOptionsHtml += '<option value="' + App.escAttr(a.name) + '"' + sel + '>' + App.esc(a.name) + ' (' + App.esc(a.model || '') + ')</option>';
      });

      page.innerHTML =
               '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
                '<button class="cc-top-btn" id="cmBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">' + (isNew ? '添加角色' : '编辑角色') + '</span>' +
          '<div style="width:36px;"></div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 40px;">' +

          // ========== 基础信息 ==========
'<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-body" style="padding-top:16px;">' +
  '<div style="display:flex;align-items:flex-end;gap:16px;margin-bottom:14px;">' +
    '<div class="cc-avatar-box" id="cmAvatarBox">' + av + '</div>' +
    '<div style="flex:1;">' +
      '<div class="cm-field"><div class="cm-field-label">角色名</div><input type="text" class="cm-field-input" id="cmNameInput" placeholder="输入角色名..." value="' + v('name') + '"></div>' +
    '</div>' +
  '</div>' +
  '<div class="cm-field-grid">' +
    '<div class="cm-field"><div class="cm-field-label">性别 GENDER</div><input type="text" class="cm-field-input" data-key="gender" value="' + v('gender') + '"></div>' +
    '<div class="cm-field"><div class="cm-field-label">年龄 AGE</div><input type="text" class="cm-field-input" data-key="age" value="' + v('age') + '"></div>' +
    '<div class="cm-field"><div class="cm-field-label">生日 BIRTHDAY</div><input type="text" class="cm-field-input" data-key="birthday" value="' + v('birthday') + '"></div>' +
    '<div class="cm-field"><div class="cm-field-label">对你的称呼 CALL</div><input type="text" class="cm-field-input" data-key="callName" value="' + v('callName') + '"></div>' +
  '</div>' +
  '<div class="cm-field" style="margin-top:8px"><div class="cm-field-label">与你的关系 RELATION</div><input type="text" class="cm-field-input" data-key="relation" value="' + v('relation') + '"></div>' +
  '<div class="cm-sep" style="margin:14px 0 10px;"></div>' +
  '<div class="cm-field-grid">' +
    '<div class="cm-field"><div class="cm-field-label">手机号 PHONE</div><input type="text" class="cm-field-input" data-key="charPhone" placeholder="留空随机生成" value="' + v('charPhone') + '"></div>' +
    '<div class="cm-field"><div class="cm-field-label">微信号 WECHAT</div><input type="text" class="cm-field-input" data-key="charWechat" placeholder="留空随机生成" value="' + v('charWechat') + '"></div>' +
  '</div>' +
  '<div class="cm-sep" style="margin:14px 0 10px;"></div>' +
  '<div class="cm-field-label" style="margin-bottom:6px">微信通讯录 CONTACT</div>' +
  '<div class="cm-radio-row">' +
    '<div class="cm-radio-item"><input type="radio" name="cmContact" id="cmC1" value="direct"' + rc('direct') + '><label class="cm-radio-label" for="cmC1">直接添加</label></div>' +
    '<div class="cm-radio-item"><input type="radio" name="cmContact" id="cmC2" value="wait"' + rc('wait') + '><label class="cm-radio-label" for="cmC2">等待对方来加</label></div>' +
    '<div class="cm-radio-item"><input type="radio" name="cmContact" id="cmC3" value="manual"' + rc('manual') + '><label class="cm-radio-label" for="cmC3">由你主动添加</label></div>' +
  '</div>' +
  '<div class="cm-tip"><div class="cm-tip-icon">!</div><div class="cm-tip-text">「直接添加」会立即出现在微信通讯录和聊天列表中；「等待对方来加」则由角色在合适的时机主动发起好友请求；「由你主动添加角色」需要你在微信中手动搜索添加。</div></div>' +
'</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 角色档案 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-blue">角色档案</div></div><div class="cm-section-body">' +
            '<div class="cm-ta-wrap"><button class="cm-expand-btn" data-field="profile" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea class="cm-textarea" id="cmProfile" placeholder="角色性格、背景、习惯...">' + v('profile') + '</textarea></div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 示例对话（黑色标题） ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title">示例对话</div></div><div class="cm-section-body">' +
            '<div class="cm-ta-wrap cm-ta-dialogue"><button class="cm-expand-btn" data-field="dialogExamples" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea class="cm-textarea" id="cmDialog" placeholder="示例对话...">' + v('dialogExamples') + '</textarea></div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 后置指令（蓝色标题） ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-blue">后置指令</div></div><div class="cm-section-body">' +
            '<div class="cm-ta-wrap"><button class="cm-expand-btn" data-field="postInstruction" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea class="cm-textarea" id="cmPost" placeholder="每轮必须遵守的指令...">' + v('postInstruction') + '</textarea></div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 语言与语音（删掉了备用TTS） ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-green">语言与语音</div></div><div class="cm-section-body">' +
            '<div class="cm-field" style="margin-bottom:12px"><div class="cm-field-label">主要语言</div><select class="cm-select" id="cmMainLang"><option' + sv('mainLang','简体中文') + '>简体中文</option><option' + sv('mainLang','繁體中文') + '>繁體中文</option><option' + sv('mainLang','粤语') + '>粤语</option><option' + sv('mainLang','English') + '>English</option><option' + sv('mainLang','日本語') + '>日本語</option><option' + sv('mainLang','한국어') + '>한국어</option></select></div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-sw-row"><div class="cm-sw-left"><span class="cm-sw-name">双语模式</span><span class="cm-sw-desc">每条消息附带翻译</span></div><label class="cm-sw"><input type="checkbox" id="cmBiToggle"' + ck('bilingual') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.bilingual ? ' cm-open' : '') + '" id="cmBiSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">翻译为</div><select class="cm-select" id="cmBiLang"><option' + sv('biLang','English') + '>English</option><option' + sv('biLang','日本語') + '>日本語</option><option' + sv('biLang','한국어') + '>한국어</option><option' + sv('biLang','繁體中文') + '>繁體中文</option><option' + sv('biLang','粤语') + '>粤语</option></select></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field-label" style="margin-bottom:4px">显示方式</div><div class="cm-radio-row"><div class="cm-radio-item"><input type="radio" name="cmBiStyle" id="cmBiA" value="bracket"' + (cfg.biStyle==='bracket'?' checked':'') + '><label class="cm-radio-label" for="cmBiA">括号附注</label></div><div class="cm-radio-item"><input type="radio" name="cmBiStyle" id="cmBiB" value="newline"' + (cfg.biStyle==='newline'?' checked':'') + '><label class="cm-radio-label" for="cmBiB">另起一行</label></div></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">MiniMax 语音</span><span class="cm-sw-desc">使用 MiniMax TTS 生成角色语音</span></div><label class="cm-sw"><input type="checkbox" id="cmMmToggle"' + ck('minimax') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.minimax ? ' cm-open' : '') + '" id="cmMmSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">Voice ID</div><input type="text" class="cm-field-input" id="cmMmVoice" placeholder="粘贴 MiniMax Voice ID..." value="' + App.escAttr(cfg.mmVoiceId||'') + '"></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">API Key</div><input type="text" class="cm-field-input" id="cmMmKey" value="' + App.escAttr(cfg.mmApiKey||'') + '"></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-sub-label">语速</div><div class="cm-range-wrap"><span class="cm-range-hint">慢</span><input type="range" class="cm-range" id="cmMmSpeed" min="0.5" max="2" step="0.1" value="' + cfg.mmSpeed + '"><span class="cm-range-val" id="cmMmSpeedVal">' + cfg.mmSpeed + 'x</span><span class="cm-range-hint">快</span></div></div>' +
              '<div class="cm-sub-row" style="margin-top:6px"><div class="cm-sub-label">音调</div><div class="cm-range-wrap"><span class="cm-range-hint">低</span><input type="range" class="cm-range" id="cmMmPitch" min="-12" max="12" step="1" value="' + cfg.mmPitch + '"><span class="cm-range-val" id="cmMmPitchVal">' + (cfg.mmPitch>0?'+':'') + cfg.mmPitch + '</span><span class="cm-range-hint">高</span></div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +
          
          // ========== 消息行为 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-blue">消息行为</div></div><div class="cm-section-body">' +
            '<div class="cm-sw-row"><div class="cm-sw-left"><span class="cm-sw-name">主动发消息</span><span class="cm-sw-desc">角色会不定时主动联系你</span></div><label class="cm-sw"><input type="checkbox" id="cmProToggle"' + ck('proactive') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.proactive ? ' cm-open' : '') + '" id="cmProSub">' +
              '<div class="cm-sub-label">消息频率</div>' +
              '<div style="display:flex;gap:14px">' +
                '<div class="cm-field" style="flex:1"><div class="cm-field-label">最短间隔</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><input type="number" class="cm-field-input" id="cmProMin" value="' + cfg.proMinInterval + '" min="1" max="480" style="width:60px;text-align:center;"><span style="font-size:10px;color:#888">分钟</span></div></div>' +
                '<div class="cm-field" style="flex:1"><div class="cm-field-label">最长间隔</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><input type="number" class="cm-field-input" id="cmProMax" value="' + cfg.proMaxInterval + '" min="1" max="480" style="width:60px;text-align:center;"><span style="font-size:10px;color:#888">分钟</span></div></div>' +
              '</div>' +
              '<div class="cm-sub-label" style="margin-top:10px">活跃时段</div>' +
              '<div class="cm-radio-row" style="margin-top:4px"><div class="cm-radio-item"><input type="radio" name="cmActiveMode" id="cmAmAll" value="allday"' + (isAllDay?' checked':'') + '><label class="cm-radio-label" for="cmAmAll">全天</label></div><div class="cm-radio-item"><input type="radio" name="cmActiveMode" id="cmAmCustom" value="custom"' + (!isAllDay?' checked':'') + '><label class="cm-radio-label" for="cmAmCustom">自定义</label></div></div>' +
              '<div id="cmActiveCustom" style="display:flex;align-items:center;gap:6px;margin-top:6px;' + (isAllDay?'display:none;':'') + '">' +
                '<input type="time" class="cm-field-input" id="cmProStart" value="' + App.escAttr(cfg.proActiveStart) + '" style="width:100px;text-align:center;">' +
                '<span style="font-size:11px;color:#999;font-weight:600;">至</span>' +
                '<input type="time" class="cm-field-input" id="cmProEnd" value="' + App.escAttr(cfg.proActiveEnd) + '" style="width:100px;text-align:center;">' +
              '</div>' +
              '<div class="cm-sub-label" style="margin-top:10px">消息积极程度</div>' +
              '<div class="cm-radio-row" style="margin-top:4px"><div class="cm-radio-item"><input type="radio" name="cmProMode" id="cmPmA" value="manual"' + (proManual?' checked':'') + '><label class="cm-radio-label" for="cmPmA">手动设定</label></div><div class="cm-radio-item"><input type="radio" name="cmProMode" id="cmPmB" value="auto"' + (!proManual?' checked':'') + '><label class="cm-radio-label" for="cmPmB">角色性格决定</label></div></div>' +
              '<div id="cmProManual" style="margin-top:8px;' + (proManual?'':'display:none;') + '"><div class="cm-range-wrap"><span class="cm-range-hint">佛系</span><input type="range" class="cm-range" id="cmProLevel" min="1" max="5" step="1" value="' + cfg.proLevel + '"><span class="cm-range-val" id="cmProLevelVal">' + PRO_LEVEL_NAMES[cfg.proLevel-1] + '</span><span class="cm-range-hint">粘人</span></div></div>' +
              '<div id="cmProAuto" style="margin-top:8px;' + (!proManual?'':'display:none;') + '"><div class="cm-tip" style="margin:0"><div class="cm-tip-icon">i</div><div class="cm-tip-text">由角色的性格设定自动决定消息频率和主动程度，无需手动调节。</div></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-sub-label" style="margin-bottom:6px">每次回复消息条数</div>' +
            '<div style="display:flex;gap:14px">' +
              '<div class="cm-field" style="flex:1"><div class="cm-field-label">最少</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><input type="number" class="cm-field-input" id="cmMinMsgs" value="' + cfg.minMsgs + '" min="1" max="10" style="width:60px;text-align:center;"><span style="font-size:10px;color:#888">条</span></div></div>' +
              '<div class="cm-field" style="flex:1"><div class="cm-field-label">最多</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><input type="number" class="cm-field-input" id="cmMaxMsgs" value="' + cfg.maxMsgs + '" min="1" max="10" style="width:60px;text-align:center;"><span style="font-size:10px;color:#888">条</span></div></div>' +
            '</div>' +
            '<div class="cm-tip"><div class="cm-tip-icon">i</div><div class="cm-tip-text">角色每次回复会随机发送该范围内的消息条数，模拟真实聊天节奏。</div></div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-field" style="margin-bottom:6px"><div class="cm-field-label">回复速度</div><select class="cm-select" id="cmReplySpeed"><option' + sv('replySpeed','即时回复') + '>即时回复</option><option' + sv('replySpeed','快速（1-3秒）') + '>快速（1-3秒）</option><option' + sv('replySpeed','正常（3-8秒）') + '>正常（3-8秒）</option><option' + sv('replySpeed','慢速（5-15秒）') + '>慢速（5-15秒）</option><option' + sv('replySpeed','真实模拟（按字数）') + '>真实模拟（按字数）</option></select></div>' +
            '<div class="cm-field"><div class="cm-field-label">「对方正在输入」</div><select class="cm-select" id="cmShowTyping"><option' + (cfg.showTyping?' selected':'') + '>显示</option><option' + (!cfg.showTyping?' selected':'') + '>不显示</option></select></div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

                    // ========== 社交功能 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-purple">社交功能</div></div><div class="cm-section-body">' +
            '<div class="cm-sub-label" style="margin-bottom:8px">允许的消息类型</div>' +
            '<div class="cm-tag-row" id="cmMsgTypes">' + msgTagsHtml + '</div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-sw-row"><div class="cm-sw-left"><span class="cm-sw-name">表情包生成</span><span class="cm-sw-desc">AI 生成自定义表情包图片</span></div><label class="cm-sw"><input type="checkbox" id="cmStkToggle"' + ck('stickerGen') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.stickerGen ? ' cm-open' : '') + '" id="cmStkSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">风格（可多选）</div><div class="cm-tag-row" id="cmStkStyles">' + stkStylesHtml + '</div></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-sub-label">发送频率</div><div class="cm-range-wrap"><span class="cm-range-hint">少</span><input type="range" class="cm-range" id="cmStkFreq" min="1" max="5" step="1" value="' + cfg.stickerFreq + '"><span class="cm-range-val" id="cmStkFreqVal">' + STK_FREQ_NAMES[cfg.stickerFreq-1] + '</span><span class="cm-range-hint">多</span></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +
            
            // 🌟 哥哥把你要求挪动的代码完美嵌进来了！
            '<div class="cm-field" style="margin-bottom:6px"><div class="cm-field-label">图片生成 API <span class="cm-opt">(表情包/图片消息)</span></div></div>' +
            '<div class="cm-field" style="margin-bottom:8px"><div class="cm-field-label">API 地址</div><input type="text" class="cm-field-input" id="cmImgApiUrl" placeholder="https://api.openai.com/v1" value="' + App.escAttr(cfg.imgApiUrl||'') + '"></div>' +
            '<div class="cm-field" style="margin-bottom:8px"><div class="cm-field-label">API Key</div><input type="text" class="cm-field-input" id="cmImgApiKey" value="' + App.escAttr(cfg.imgApiKey||'') + '"></div>' +
            '<div class="cm-field"><div class="cm-field-label">模型</div><div class="cm-model-row"><input type="text" class="cm-field-input cm-model-input" id="cmImgModel" placeholder="gpt-image-1" value="' + App.escAttr(cfg.imgModel||'gpt-image-1') + '"><button type="button" id="cmImgFetchModels" class="cm-model-btn"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg></button></div><div class="cm-img-model-list" id="cmImgModelList"></div></div>' +
           '<div class="cm-tip" style="margin-bottom:12px;"><div class="cm-tip-icon">!</div><div class="cm-tip-text">表情包生成需要支持图片生成的模型（如 gpt-image-1、dall-e-3 等）。普通文字模型无法生成图片。留空则表情包以文字标记显示。</div></div>' +
            '<div class="cm-sep"></div>' +

            // 这里继续接上朋友圈
            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">朋友圈生成</span><span class="cm-sw-desc">角色自动发朋友圈动态</span></div><label class="cm-sw"><input type="checkbox" id="cmMomToggle"' + ck('moments') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.moments ? ' cm-open' : '') + '" id="cmMomSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">每日最多发布</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><input type="number" class="cm-field-input" id="cmMomMax" value="' + cfg.momentsMax + '" min="0" max="10" style="width:60px;text-align:center;"><span style="font-size:10px;color:#888">条/天</span></div></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">内容类型</div><div class="cm-tag-row" style="margin-top:4px" id="cmMomTypes">' + momTypesHtml + '</div></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">配图生成</div><select class="cm-select" id="cmMomImg"><option' + sv('momentsImg','AI 生成') + '>AI 生成</option><option' + sv('momentsImg','使用预设图库') + '>使用预设图库</option></select></div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 情境感知 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-red">情境感知</div></div><div class="cm-section-body">' +
            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">时间 & 天气感知</span><span class="cm-sw-desc">角色知道当前时间和天气</span></div><label class="cm-sw"><input type="checkbox" id="cmTwToggle"' + ck('timeWeather') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.timeWeather ? ' cm-open' : '') + '" id="cmTwSub">' +
              '<div class="cm-field"><div class="cm-field-label">角色真实城市（获取天气数据）</div><input type="text" class="cm-field-input" id="cmCharRealCity" placeholder="如：Tokyo、Seoul..." value="' + App.escAttr(cfg.charRealCity||'') + '"></div>' +
              '<div class="cm-field" style="margin-top:8px"><div class="cm-field-label">角色虚拟城市（发给AI的地名）</div><input type="text" class="cm-field-input" id="cmCharCity" placeholder="留空则用真实城市名..." value="' + App.escAttr(cfg.charCity||'') + '"></div>' +
              '<div class="cm-tip" style="margin-top:10px;margin-bottom:0"><div class="cm-tip-icon">i</div><div class="cm-tip-text">真实城市用于获取实际天气数据。虚拟城市是AI看到的地名（如"长安""霍格沃茨"）。留空虚拟城市则直接用真实城市名。</div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 高级设定 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title">高级设定</div><div class="cm-section-badge">ADVANCED</div></div><div class="cm-section-body">' +
            '<div class="cm-field" style="margin-bottom:6px"><div class="cm-field-label">API 配置</div><select class="cm-select" id="cmApiMode"><option value="global"' + (cfg.apiMode==='global'?' selected':'') + '>使用全局 API</option><option value="individual"' + (isIndividual?' selected':'') + '>为该角色单独配置</option></select></div>' +
            '<div class="cm-tip"><div class="cm-tip-icon">!</div><div class="cm-tip-text">若为每个角色单独匹配 API，在进行群聊时将会同时消耗多个 API 额度。</div></div>' +
            '<div id="cmAdvancedSub" style="' + (isIndividual ? '' : 'display:none;') + '">' +
              '<div class="cm-field" style="margin-bottom:10px"><div class="cm-field-label">选择已保存的 API</div><select class="cm-select" id="cmApiSelect">' + apiOptionsHtml + '</select></div>' +
              '<div class="cm-sep"></div>' +
              '<div class="cm-param"><div class="cm-param-title">Temperature</div><div class="cm-param-desc">贴合人设 ↔ 有创意</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">精确</span><input type="range" class="cm-range" id="cmTemp" min="0" max="2" step="0.05" value="' + cfg.temperature + '"><span class="cm-range-val" id="cmTempVal">' + cfg.temperature + '</span><span class="cm-range-hint">创意</span></div></div></div>' +
              '<div class="cm-param"><div class="cm-param-title">Frequency Penalty</div><div class="cm-param-desc">避免重复词汇</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">重复</span><input type="range" class="cm-range" id="cmFreq" min="0" max="2" step="0.1" value="' + cfg.freqPenalty + '"><span class="cm-range-val" id="cmFreqVal">' + cfg.freqPenalty + '</span><span class="cm-range-hint">避免</span></div></div></div>' +
              '<div class="cm-param"><div class="cm-param-title">Presence Penalty</div><div class="cm-param-desc">鼓励新词汇</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">保守</span><input type="range" class="cm-range" id="cmPres" min="0" max="2" step="0.1" value="' + cfg.presPenalty + '"><span class="cm-range-val" id="cmPresVal">' + cfg.presPenalty + '</span><span class="cm-range-hint">创新</span></div></div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 保存 ==========
          '<div class="cm-save-row"><button class="cm-save-btn" id="cmSaveBtn" type="button">保 存</button></div>' +

        '</div>';

      CharMgr.bindEvents(page);
    },

    bindEvents: function(page) {
      // 🌟 点击左上角返回时，执行静默保存
      page.querySelector('#cmBackBtn').addEventListener('click', function() { CharMgr.doSave(page, true); });

      // 头像
      page.querySelector('#cmAvatarBox').addEventListener('click', function() { CharMgr._showAvatarMenu(this); });

      // 开关联动
      function bindToggle(tid, sid) {
        var t = page.querySelector('#' + tid);
        var s = page.querySelector('#' + sid);
        if (t && s) t.addEventListener('change', function() { s.classList.toggle('cm-open', this.checked); });
      }
      bindToggle('cmBiToggle', 'cmBiSub');
      bindToggle('cmMmToggle', 'cmMmSub');
      bindToggle('cmProToggle', 'cmProSub');
      bindToggle('cmTwToggle', 'cmTwSub');
      bindToggle('cmStkToggle', 'cmStkSub');
      bindToggle('cmMomToggle', 'cmMomSub');

      page.querySelectorAll('input[name="cmActiveMode"]').forEach(function(r) {
        r.addEventListener('change', function() { var c = page.querySelector('#cmActiveCustom'); if (c) c.style.display = this.value === 'allday' ? 'none' : 'flex'; });
      });

      page.querySelectorAll('input[name="cmProMode"]').forEach(function(r) {
        r.addEventListener('change', function() {
          var m = page.querySelector('#cmProManual'); var a = page.querySelector('#cmProAuto');
          if (this.value === 'manual') { if (m) m.style.display = ''; if (a) a.style.display = 'none'; }
          else { if (m) m.style.display = 'none'; if (a) a.style.display = ''; }
        });
      });

      var apiModeEl = page.querySelector('#cmApiMode');
      var advSub = page.querySelector('#cmAdvancedSub');
      if (apiModeEl && advSub) { apiModeEl.addEventListener('change', function() { advSub.style.display = this.value === 'individual' ? '' : 'none'; }); }

      function bindRange(iid, vid, fmt) {
        var i = page.querySelector('#' + iid); var v = page.querySelector('#' + vid);
        if (i && v) i.addEventListener('input', function() { v.textContent = fmt(this.value); });
      }
      bindRange('cmMmSpeed', 'cmMmSpeedVal', function(v) { return v + 'x'; });
      bindRange('cmMmPitch', 'cmMmPitchVal', function(v) { return (v > 0 ? '+' : '') + v; });
      bindRange('cmProLevel', 'cmProLevelVal', function(v) { return PRO_LEVEL_NAMES[v - 1]; });
      bindRange('cmStkFreq', 'cmStkFreqVal', function(v) { return STK_FREQ_NAMES[v - 1]; });
      bindRange('cmTemp', 'cmTempVal', function(v) { return v; });
      bindRange('cmFreq', 'cmFreqVal', function(v) { return v; });
      bindRange('cmPres', 'cmPresVal', function(v) { return v; });

      // 图片模型获取
      var imgFetchBtn = page.querySelector('#cmImgFetchModels');
      if (imgFetchBtn) {
        imgFetchBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          var url = (page.querySelector('#cmImgApiUrl') || {}).value || '';
          var key = (page.querySelector('#cmImgApiKey') || {}).value || '';
          if (!url) { var gApi = App.api ? App.api.getActiveConfig() : null; if (gApi) { url = gApi.url; if (!key) key = gApi.key; } }
          if (!key) { var gApi2 = App.api ? App.api.getActiveConfig() : null; if (gApi2) key = gApi2.key; }
          if (!url || !key) { App.showToast('请先填写图片API地址和Key，或配置全局API'); return; }
          App.showToast('获取模型列表...');
          fetch(url.replace(/\/+$/, '') + '/models', { headers: { 'Authorization': 'Bearer ' + key } })
            .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(function(data) {
              var raw = data.data || data; var models = [];
              if (Array.isArray(raw)) { for (var i = 0; i < raw.length; i++) { var id = raw[i].id || raw[i].name || raw[i]; if (id) models.push(id); } }
              if (!models.length) { App.showToast('未找到模型'); return; }
              var list = page.querySelector('#cmImgModelList'); if (!list) return;
              var currentVal = (page.querySelector('#cmImgModel') || {}).value || '';
              var searchHtml = '<input type="text" id="cmImgModelSearch" class="cm-model-search" placeholder="搜索模型...">';
              var itemsHtml = models.map(function(m) {
                var selClass = m === currentVal ? ' is-active' : '';
                return '<div class="cm-img-model-item' + selClass + '" data-model="' + App.escAttr(m) + '">' + App.esc(m) + '</div>';
              }).join('');
              list.innerHTML = searchHtml + '<div id="cmImgModelResults">' + itemsHtml + '</div>';
              list.style.display = 'block';
              function bindClicks() {
                list.querySelectorAll('.cm-img-model-item').forEach(function(item) {
                  item.addEventListener('click', function() { var inp = page.querySelector('#cmImgModel'); if (inp) inp.value = item.dataset.model; list.style.display = 'none'; });
                });
              }
              bindClicks();
              var searchInput = list.querySelector('#cmImgModelSearch');
                            if (searchInput) {
                searchInput.addEventListener('input', function() {
                  var kw = this.value.trim().toLowerCase();
                  var filtered = kw ? models.filter(function(m) { return m.toLowerCase().indexOf(kw) >= 0; }) : models;
                  var results = list.querySelector('#cmImgModelResults');
                  if (results) { 
                    // 🌟 这里就是哥哥刚才没说清楚的地方，换成纯净的类名
                    results.innerHTML = filtered.map(function(m) { 
                      var selClass = m === currentVal ? ' is-active' : ''; 
                      return '<div class="cm-img-model-item' + selClass + '" data-model="' + App.escAttr(m) + '">' + App.esc(m) + '</div>'; 
                    }).join(''); 
                    bindClicks(); 
                  }
                });
                searchInput.addEventListener('click', function(e) { e.stopPropagation(); });
              }
              App.showToast(models.length + ' 个模型');
            }).catch(function(err) { App.showToast('获取失败: ' + err.message); });
        });
      }

      // 展开按钮
      page.querySelectorAll('.cm-expand-btn').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var f = btn.dataset.field;
    var map = { profile: '#cmProfile', dialogExamples: '#cmDialog', postInstruction: '#cmPost' };
    var names = { profile: '角色档案', dialogExamples: '示例对话', postInstruction: '后置指令' };
    var ta = page.querySelector(map[f]);
    if (ta) CharMgr.openExpand(ta, f === 'dialogExamples');
  });
});

      // 🌟 点击空白处，自动收起模型列表
      page.addEventListener('click', function(e) {
        var list = page.querySelector('#cmImgModelList');
        var btn = page.querySelector('#cmImgFetchModels');
        if (list && list.style.display === 'block') {
          if (!list.contains(e.target) && (!btn || !btn.contains(e.target))) {
            list.style.display = 'none';
          }
        }
      });

      // 保存
      page.querySelector('#cmSaveBtn').addEventListener('click', function() { CharMgr.doSave(page); });
    },

        doSave: function(page, isSilent) {
      var name = (page.querySelector('#cmNameInput') || {}).value || '';
      name = name.trim();
      
      // 🌟 如果退出时名字是空的，自动给个名字，防止无法退出
      if (!name) name = '未命名'; 
      if (!App.character) return;

      var d = {};
      page.querySelectorAll('.cm-field-input[data-key]').forEach(function(el) { d[el.dataset.key] = (el.value || '').trim(); });
      var cr = page.querySelector('input[name="cmContact"]:checked');

      if (!d.charPhone) d.charPhone = '1' + Math.floor(100000000 + Math.random() * 900000000);
      if (!d.charWechat) d.charWechat = 'wxid_' + Math.random().toString(36).substr(2, 10);

      var charObj = {
        name: name, avatar: CharMgr.tempAvatar,
        profile: (page.querySelector('#cmProfile') || {}).value || '',
        dialogExamples: (page.querySelector('#cmDialog') || {}).value || '',
        postInstruction: (page.querySelector('#cmPost') || {}).value || '',
        greeting: '',
        gender: d.gender || '', age: d.age || '', birthday: d.birthday || '',
        callName: d.callName || '', relation: d.relation || '',
        charPhone: d.charPhone, charWechat: d.charWechat,
        contactMode: cr ? cr.value : 'direct'
      };

      var gv = function(id) { var e = page.querySelector('#' + id); return e ? e.value : ''; };
      var gc = function(id) { var e = page.querySelector('#' + id); return e ? e.checked : false; };
      var biStyleEl = page.querySelector('input[name="cmBiStyle"]:checked');
      var proModeEl = page.querySelector('input[name="cmProMode"]:checked');
      var isAllDay = page.querySelector('#cmAmAll') && page.querySelector('#cmAmAll').checked;

      var msgTypes = []; page.querySelectorAll('#cmMsgTypes input:checked').forEach(function(cb) { msgTypes.push(cb.dataset.type); });
      var momTypes = []; page.querySelectorAll('#cmMomTypes input:checked').forEach(function(cb) { momTypes.push(cb.dataset.mtype); });
      var stkStyles = []; page.querySelectorAll('#cmStkStyles input:checked').forEach(function(cb) { stkStyles.push(cb.dataset.sty); });

      var cfgObj = {
        mainLang: gv('cmMainLang') || '简体中文',
        bilingual: gc('cmBiToggle'), biLang: gv('cmBiLang') || 'English',
        biStyle: biStyleEl ? biStyleEl.value : 'bracket',
        minimax: gc('cmMmToggle'), mmVoiceId: gv('cmMmVoice'), mmApiKey: gv('cmMmKey'),
        mmSpeed: parseFloat(gv('cmMmSpeed') || 1), mmPitch: parseInt(gv('cmMmPitch') || 0),
        proactive: gc('cmProToggle'),
        proMinInterval: parseInt(gv('cmProMin') || 15), proMaxInterval: parseInt(gv('cmProMax') || 120),
        proActiveStart: isAllDay ? '00:00' : (gv('cmProStart') || '08:00'),
        proActiveEnd: isAllDay ? '23:59' : (gv('cmProEnd') || '23:30'),
        proMode: proModeEl ? proModeEl.value : 'manual', proLevel: parseInt(gv('cmProLevel') || 3),
        replySpeed: gv('cmReplySpeed') || '正常（3-8秒）', showTyping: gv('cmShowTyping') === '显示',
        minMsgs: parseInt(gv('cmMinMsgs') || 1), maxMsgs: parseInt(gv('cmMaxMsgs') || 3),
        msgTypes: msgTypes, stickerGen: gc('cmStkToggle'),
        stickerStyles: stkStyles.length ? stkStyles : ['可爱卡通'], stickerFreq: parseInt(gv('cmStkFreq') || 2),
        moments: gc('cmMomToggle'), momentsMax: parseInt(gv('cmMomMax') || 2),
        momentsTypes: momTypes, momentsImg: gv('cmMomImg') || 'AI 生成',
        timeWeather: gc('cmTwToggle'), charCity: gv('cmCharCity'), charRealCity: gv('cmCharRealCity'),
        imgApiUrl: gv('cmImgApiUrl'), imgApiKey: gv('cmImgApiKey'), imgModel: gv('cmImgModel') || 'gpt-image-1',
        apiMode: gv('cmApiMode') || 'global', apiSelect: gv('cmApiSelect') || '',
        temperature: parseFloat(gv('cmTemp') || 0.8), freqPenalty: parseFloat(gv('cmFreq') || 0.3),
        presPenalty: parseFloat(gv('cmPres') || 0.3)
      };

      if (CharMgr.editingCharId) {
        var ex = App.character.getById(CharMgr.editingCharId);
        if (ex) {
          Object.keys(charObj).forEach(function(k) {
            if (k === 'avatar') { 
              ex.avatar = charObj.avatar;
              ex.cover = charObj.avatar; 
            } else ex[k] = charObj[k];
          });
          App.character.save();
        }
      } else {
        charObj.id = 'char-' + Date.now();
        charObj.cover = charObj.avatar; 
        charObj.worldbookMounted = false;
        charObj.modeColors = [{}, {}, {}];
        App.character.list.push(charObj);
        App.character.save();
        CharMgr.editingCharId = charObj.id;
      }

      CharMgr.charConfigs[CharMgr.editingCharId] = cfgObj;
      CharMgr.save();

      CharMgr.close();
      if (App.character) App.character.renderList();
      
      if (!isSilent) {
        App.showToast('角色已保存');
      }
    },

      _showAvatarMenu: function(box) {
      App.showImagePicker({
        title: '设置角色头像',
        deleteText: '删除头像',
        callback: function(src) {
          CharMgr.tempAvatar = src;
          box.innerHTML = src ? '<img src="' + App.escAttr(src) + '">' : '<span class="cc-avatar-empty">PHOTO</span>';
          App.showToast(src ? '头像已设置' : '头像已删除');
        }
      });
    },
    
    openExpand: function(textarea, isDialogue) {
      if (CharMgr._expandEl) CharMgr._expandEl.remove();
      var ed = document.createElement('div'); 
      CharMgr._expandEl = ed;
      
      // 🌟 只留一个干净的类名，样式全交出去
      ed.className = 'cc-expand-panel';
      
      ed.innerHTML =
        '<div class="cc-expand-header">' +
          /* 🌟 换回了你想要的带尾巴的箭头 */
          '<button class="cc-top-btn" id="cmExpBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<div class="cc-expand-title-tag' + (isDialogue ? '' : ' blue') + '">' + (isDialogue ? '示例对话' : '编辑内容') + '</div>' +
          '<button class="cc-top-btn" id="cmExpDone" type="button"><svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>' +
        '</div>' +
        '<div class="cc-expand-body">' +
          '<div class="cc-expand-comic-box">' +
            '<div class="cc-expand-comic-top"></div>' +
            '<div class="cc-expand-comic-corner"></div>' +
            '<div class="cc-expand-comic-inner">' +
              (isDialogue ? '<div class="cc-expand-quote-left">「</div><div class="cc-expand-quote-right">」</div>' : '') +
              '<textarea id="cmExpTA" class="cc-expand-textarea ' + (isDialogue ? 'is-dialogue-ta' : '') + '" placeholder="">' + App.esc(textarea.value) + '</textarea>' +
            '</div>' +
            '<div class="cc-expand-comic-bot"></div>' +
          '</div>' +
        '</div>';
      
      document.body.appendChild(ed);

      // 🌟 动画升起 (Slide Up)
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        ed.classList.add('cc-expand-panel-in');
      }); });

      var ta = ed.querySelector('#cmExpTA'); 
      if (ta) ta.focus();
      
      var initialValue = textarea.value; 

      // 强制关闭 (分点击下降和滑动消失)
      function forceClose(isSwipe) {
        if (isSwipe) {
          if (ed.parentNode) ed.remove(); CharMgr._expandEl = null;
        } else {
          ed.classList.remove('cc-expand-panel-in');
          ed.classList.add('cc-expand-panel-out-down'); // 🌟 点击时，向下降落
          setTimeout(function() { if (ed.parentNode) ed.remove(); CharMgr._expandEl = null; }, 350);
        }
      }

            function saveAndClose(isSwipe) {
        textarea.value = ed.querySelector('#cmExpTA').value;
        forceClose(isSwipe);
      }

      // 🌟 无论是点击返回、完成，还是滑动返回，全部一键保存！
      ed.querySelector('#cmExpBack').addEventListener('click', function() { saveAndClose(false); });
      ed.querySelector('#cmExpDone').addEventListener('click', function() { saveAndClose(false); });
      App.bindSwipeBack(ed, function() { saveAndClose(true); });
    }, // openExpand 结束

    init: function() {
      CharMgr.load();
      App.charMgr = CharMgr;
    }
  };

  App.register('charMgr', CharMgr);
})();
