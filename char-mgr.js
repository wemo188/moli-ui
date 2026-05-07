
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

    load: function() {
      CharMgr.charConfigs = App.LS.get('cmChars') || {};
    },
    save: function() { App.LS.set('cmChars', CharMgr.charConfigs); },

    getCharConfig: function(charId) {
      return CharMgr.charConfigs[charId] || JSON.parse(JSON.stringify(DEFAULTS));
    },

    open: function(charId) {
      CharMgr.load();
      CharMgr.editingCharId = charId || null;
      CharMgr.tempAvatar = '';

      var existing = null;
      if (charId && App.character) existing = App.character.getById(charId);

      var old = App.$('#charMgrPage');
      if (old) old.remove();

      var page = document.createElement('div');
      page.id = 'charMgrPage';
      page.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10001;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      document.body.appendChild(page);
      CharMgr._pageEl = page;

      CharMgr.render(page, existing);

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
      }); });

      App.bindSwipeBack(page, function() { CharMgr.close(); });
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

      var av = e.avatar ? '<img src="' + App.escAttr(e.avatar) + '">' : '<span class="cc-avatar-empty">PHOTO</span>';
      if (e.avatar) CharMgr.tempAvatar = e.avatar;

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
        apiOptionsHtml += '<option value="' + App.escAttr(a.name) + '"' + sel + '>' + App.esc(a.name) + '</option>';
      });

      page.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<button class="cc-top-btn" id="cmBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">' + (isNew ? '添加角色' : '编辑角色') + '</span>' +
          '<div style="width:36px;"></div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 40px;">' +

          // ========== 基础信息 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title">基础信息</div></div><div class="cm-section-body">' +
            '<div style="display:flex;align-items:flex-end;gap:16px;margin-bottom:14px;">' +
              '<div class="cc-avatar-box" id="cmAvatarBox">' + av + '</div>' +
              '<div style="flex:1;"><div class="cm-field"><div class="cm-field-label">角色名</div><input type="text" class="cm-field-input" id="cmNameInput" placeholder="输入角色名..." value="' + v('name') + '"></div></div>' +
            '</div>' +
            '<div class="cm-field-grid">' +
              '<div class="cm-field"><div class="cm-field-label">性别</div><input type="text" class="cm-field-input" data-key="gender" value="' + v('gender') + '"></div>' +
              '<div class="cm-field"><div class="cm-field-label">年龄</div><input type="text" class="cm-field-input" data-key="age" value="' + v('age') + '"></div>' +
              '<div class="cm-field"><div class="cm-field-label">生日</div><input type="text" class="cm-field-input" data-key="birthday" value="' + v('birthday') + '"></div>' +
              '<div class="cm-field"><div class="cm-field-label">对你的称呼</div><input type="text" class="cm-field-input" data-key="callName" value="' + v('callName') + '"></div>' +
            '</div>' +
            '<div class="cm-field" style="margin-top:8px"><div class="cm-field-label">与你的关系</div><input type="text" class="cm-field-input" data-key="relation" value="' + v('relation') + '"></div>' +
            '<div class="cm-sep" style="margin:14px 0 10px;"></div>' +
            '<div class="cm-field-grid">' +
              '<div class="cm-field"><div class="cm-field-label">手机号</div><input type="text" class="cm-field-input" data-key="charPhone" placeholder="留空随机" value="' + v('charPhone') + '"></div>' +
              '<div class="cm-field"><div class="cm-field-label">微信号</div><input type="text" class="cm-field-input" data-key="charWechat" placeholder="留空随机" value="' + v('charWechat') + '"></div>' +
            '</div>' +
            '<div class="cm-sep" style="margin:14px 0 10px;"></div>' +
            '<div class="cm-field-label" style="margin-bottom:6px">微信通讯录</div>' +
            '<div class="cm-radio-row">' +
              '<div class="cm-radio-item"><input type="radio" name="cmContact" id="cmC1" value="direct"' + rc('direct') + '><label class="cm-radio-label" for="cmC1">直接添加</label></div>' +
              '<div class="cm-radio-item"><input type="radio" name="cmContact" id="cmC2" value="wait"' + rc('wait') + '><label class="cm-radio-label" for="cmC2">等待来加</label></div>' +
              '<div class="cm-radio-item"><input type="radio" name="cmContact" id="cmC3" value="manual"' + rc('manual') + '><label class="cm-radio-label" for="cmC3">主动添加</label></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 角色档案 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-blue">角色档案</div></div><div class="cm-section-body">' +
            '<div class="cm-ta-wrap"><button class="cm-expand-btn" data-field="profile" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea class="cm-textarea" id="cmProfile" placeholder="角色性格、背景、习惯...">' + v('profile') + '</textarea></div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 示例对话 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title">示例对话</div></div><div class="cm-section-body">' +
            '<div class="cm-ta-wrap cm-ta-dialogue"><button class="cm-expand-btn" data-field="dialogExamples" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea class="cm-textarea" id="cmDialog" placeholder="示例对话...">' + v('dialogExamples') + '</textarea></div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 后置指令 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-blue">后置指令</div></div><div class="cm-section-body">' +
            '<div class="cm-ta-wrap"><button class="cm-expand-btn" data-field="postInstruction" type="button"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button><textarea class="cm-textarea" id="cmPost" placeholder="每轮必须遵守的指令...">' + v('postInstruction') + '</textarea></div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 语言与语音 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-green">语言与语音</div></div><div class="cm-section-body">' +
            '<div class="cm-field" style="margin-bottom:12px"><div class="cm-field-label">主要语言</div><select class="cm-select" id="cmMainLang"><option' + sv('mainLang','简体中文') + '>简体中文</option><option' + sv('mainLang','繁體中文') + '>繁體中文</option><option' + sv('mainLang','English') + '>English</option><option' + sv('mainLang','日本語') + '>日本語</option><option' + sv('mainLang','한국어') + '>한국어</option></select></div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-sw-row"><div class="cm-sw-left"><span class="cm-sw-name">双语模式</span><span class="cm-sw-desc">每条消息附带翻译</span></div><label class="cm-sw"><input type="checkbox" id="cmBiToggle"' + ck('bilingual') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.bilingual ? ' cm-open' : '') + '" id="cmBiSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">翻译为</div><select class="cm-select" id="cmBiLang"><option' + sv('biLang','English') + '>English</option><option' + sv('biLang','日本語') + '>日本語</option><option' + sv('biLang','한국어') + '>한국어</option></select></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field-label" style="margin-bottom:4px">显示方式</div><div class="cm-radio-row"><div class="cm-radio-item"><input type="radio" name="cmBiStyle" id="cmBiA" value="bracket"' + (cfg.biStyle==='bracket'?' checked':'') + '><label class="cm-radio-label" for="cmBiA">括号附注</label></div><div class="cm-radio-item"><input type="radio" name="cmBiStyle" id="cmBiB" value="newline"' + (cfg.biStyle==='newline'?' checked':'') + '><label class="cm-radio-label" for="cmBiB">另起一行</label></div></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">MiniMax 语音</span><span class="cm-sw-desc">使用 MiniMax TTS</span></div><label class="cm-sw"><input type="checkbox" id="cmMmToggle"' + ck('minimax') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.minimax ? ' cm-open' : '') + '" id="cmMmSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">Voice ID</div><input type="text" class="cm-field-input" id="cmMmVoice" placeholder="MiniMax Voice ID..." value="' + App.escAttr(cfg.mmVoiceId||'') + '"></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">API Key <span class="cm-opt">(留空用全局)</span></div><input type="text" class="cm-field-input" id="cmMmKey" value="' + App.escAttr(cfg.mmApiKey||'') + '"></div></div>' +
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
              '<div id="cmActiveCustom" style="display:flex;align-items:center;gap:6px;margin-top:6px;' + (isAllDay?'display:none;':'') + '"><input type="time" class="cm-field-input" id="cmProStart" value="' + App.escAttr(cfg.proActiveStart) + '" style="width:100px;text-align:center;"><span style="font-size:11px;color:#999;">至</span><input type="time" class="cm-field-input" id="cmProEnd" value="' + App.escAttr(cfg.proActiveEnd) + '" style="width:100px;text-align:center;"></div>' +
              '<div class="cm-sub-label" style="margin-top:10px">积极程度</div>' +
              '<div class="cm-radio-row" style="margin-top:4px"><div class="cm-radio-item"><input type="radio" name="cmProMode" id="cmPmA" value="manual"' + (proManual?' checked':'') + '><label class="cm-radio-label" for="cmPmA">手动设定</label></div><div class="cm-radio-item"><input type="radio" name="cmProMode" id="cmPmB" value="auto"' + (!proManual?' checked':'') + '><label class="cm-radio-label" for="cmPmB">角色性格决定</label></div></div>' +
              '<div id="cmProManual" style="margin-top:8px;' + (proManual?'':'display:none;') + '"><div class="cm-range-wrap"><span class="cm-range-hint">佛系</span><input type="range" class="cm-range" id="cmProLevel" min="1" max="5" step="1" value="' + cfg.proLevel + '"><span class="cm-range-val" id="cmProLevelVal">' + PRO_LEVEL_NAMES[cfg.proLevel-1] + '</span><span class="cm-range-hint">粘人</span></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-sub-label" style="margin-bottom:6px">每次回复条数</div>' +
            '<div style="display:flex;gap:14px">' +
              '<div class="cm-field" style="flex:1"><div class="cm-field-label">最少</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><input type="number" class="cm-field-input" id="cmMinMsgs" value="' + cfg.minMsgs + '" min="1" max="10" style="width:60px;text-align:center;"><span style="font-size:10px;color:#888">条</span></div></div>' +
              '<div class="cm-field" style="flex:1"><div class="cm-field-label">最多</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><input type="number" class="cm-field-input" id="cmMaxMsgs" value="' + cfg.maxMsgs + '" min="1" max="10" style="width:60px;text-align:center;"><span style="font-size:10px;color:#888">条</span></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-field" style="margin-bottom:6px"><div class="cm-field-label">回复速度</div><select class="cm-select" id="cmReplySpeed"><option' + sv('replySpeed','即时回复') + '>即时回复</option><option' + sv('replySpeed','快速（1-3秒）') + '>快速（1-3秒）</option><option' + sv('replySpeed','正常（3-8秒）') + '>正常（3-8秒）</option><option' + sv('replySpeed','慢速（5-15秒）') + '>慢速（5-15秒）</option><option' + sv('replySpeed','真实模拟（按字数）') + '>真实模拟（按字数）</option></select></div>' +
            '<div class="cm-field"><div class="cm-field-label">「对方正在输入」</div><select class="cm-select" id="cmShowTyping"><option' + (cfg.showTyping?' selected':'') + '>显示</option><option' + (!cfg.showTyping?' selected':'') + '>不显示</option></select></div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 社交功能 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-purple">社交功能</div></div><div class="cm-section-body">' +
            '<div class="cm-sub-label" style="margin-bottom:8px">允许的消息类型</div>' +
            '<div class="cm-tag-row" id="cmMsgTypes">' + msgTagsHtml + '</div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-sw-row"><div class="cm-sw-left"><span class="cm-sw-name">表情包生成</span><span class="cm-sw-desc">AI 生成自定义表情包</span></div><label class="cm-sw"><input type="checkbox" id="cmStkToggle"' + ck('stickerGen') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.stickerGen ? ' cm-open' : '') + '" id="cmStkSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">风格</div><div class="cm-tag-row" id="cmStkStyles">' + stkStylesHtml + '</div></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-sub-label">发送频率</div><div class="cm-range-wrap"><span class="cm-range-hint">少</span><input type="range" class="cm-range" id="cmStkFreq" min="1" max="5" step="1" value="' + cfg.stickerFreq + '"><span class="cm-range-val" id="cmStkFreqVal">' + STK_FREQ_NAMES[cfg.stickerFreq-1] + '</span><span class="cm-range-hint">多</span></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">朋友圈</span><span class="cm-sw-desc">角色自动发朋友圈</span></div><label class="cm-sw"><input type="checkbox" id="cmMomToggle"' + ck('moments') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.moments ? ' cm-open' : '') + '" id="cmMomSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">每日最多</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><input type="number" class="cm-field-input" id="cmMomMax" value="' + cfg.momentsMax + '" min="0" max="10" style="width:60px;text-align:center;"><span style="font-size:10px;color:#888">条/天</span></div></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">内容类型</div><div class="cm-tag-row" style="margin-top:4px" id="cmMomTypes">' + momTypesHtml + '</div></div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 情境感知 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-red">情境感知</div></div><div class="cm-section-body">' +
            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">时间 & 天气感知</span></div><label class="cm-sw"><input type="checkbox" id="cmTwToggle"' + ck('timeWeather') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.timeWeather ? ' cm-open' : '') + '" id="cmTwSub">' +
              '<div class="cm-field"><div class="cm-field-label">角色真实城市</div><input type="text" class="cm-field-input" id="cmCharRealCity" placeholder="如：Tokyo、Seoul..." value="' + App.escAttr(cfg.charRealCity||'') + '"></div>' +
              '<div class="cm-field" style="margin-top:8px"><div class="cm-field-label">角色虚拟城市</div><input type="text" class="cm-field-input" id="cmCharCity" placeholder="留空则用真实城市名..." value="' + App.escAttr(cfg.charCity||'') + '"></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 高级设定 ==========
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title">高级设定</div><div class="cm-section-badge">ADVANCED</div></div><div class="cm-section-body">' +
            '<div class="cm-field" style="margin-bottom:8px"><div class="cm-field-label">图片 API 地址</div><input type="text" class="cm-field-input" id="cmImgApiUrl" placeholder="https://api.openai.com/v1" value="' + App.escAttr(cfg.imgApiUrl||'') + '"></div>' +
            '<div class="cm-field" style="margin-bottom:8px"><div class="cm-field-label">图片 API Key</div><input type="text" class="cm-field-input" id="cmImgApiKey" placeholder="留空用全局" value="' + App.escAttr(cfg.imgApiKey||'') + '"></div>' +
            '<div class="cm-field" style="margin-bottom:8px"><div class="cm-field-label">图片模型</div><input type="text" class="cm-field-input" id="cmImgModel" value="' + App.escAttr(cfg.imgModel||'gpt-image-1') + '"></div>' +
            '<div class="cm-sep"></div>' +
            '<div class="cm-field" style="margin-bottom:6px"><div class="cm-field-label">API 配置</div><select class="cm-select" id="cmApiMode"><option value="global"' + (cfg.apiMode==='global'?' selected':'') + '>使用全局 API</option><option value="individual"' + (isIndividual?' selected':'') + '>单独配置</option></select></div>' +
            '<div id="cmAdvancedSub" style="' + (isIndividual ? '' : 'display:none;') + '">' +
              '<div class="cm-field" style="margin-bottom:10px"><div class="cm-field-label">选择 API</div><select class="cm-select" id="cmApiSelect">' + apiOptionsHtml + '</select></div>' +
              '<div class="cm-sep"></div>' +
              '<div class="cm-param"><div class="cm-param-title">Temperature</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">精确</span><input type="range" class="cm-range" id="cmTemp" min="0" max="2" step="0.05" value="' + cfg.temperature + '"><span class="cm-range-val" id="cmTempVal">' + cfg.temperature + '</span><span class="cm-range-hint">创意</span></div></div></div>' +
              '<div class="cm-param"><div class="cm-param-title">Freq Penalty</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">重复</span><input type="range" class="cm-range" id="cmFreq" min="0" max="2" step="0.1" value="' + cfg.freqPenalty + '"><span class="cm-range-val" id="cmFreqVal">' + cfg.freqPenalty + '</span><span class="cm-range-hint">避免</span></div></div></div>' +
              '<div class="cm-param"><div class="cm-param-title">Pres Penalty</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">保守</span><input type="range" class="cm-range" id="cmPres" min="0" max="2" step="0.1" value="' + cfg.presPenalty + '"><span class="cm-range-val" id="cmPresVal">' + cfg.presPenalty + '</span><span class="cm-range-hint">创新</span></div></div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          // ========== 保存 ==========
          '<div class="cm-save-row">' +
            '<button class="cm-save-btn" id="cmSaveBtn" type="button">保 存</button>' +
          '</div>' +

        '</div>';

      CharMgr.bindEvents(page);
    },

    bindEvents: function(page) {
      page.querySelector('#cmBackBtn').addEventListener('click', function() { CharMgr.close(); });

      // 头像
      page.querySelector('#cmAvatarBox').addEventListener('click', function() {
        CharMgr._showAvatarMenu(this);
      });

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

      // 活跃时段
      page.querySelectorAll('input[name="cmActiveMode"]').forEach(function(r) {
        r.addEventListener('change', function() {
          var c = page.querySelector('#cmActiveCustom');
          if (c) c.style.display = this.value === 'allday' ? 'none' : 'flex';
        });
      });

      // 积极程度
      page.querySelectorAll('input[name="cmProMode"]').forEach(function(r) {
        r.addEventListener('change', function() {
          var m = page.querySelector('#cmProManual');
          if (m) m.style.display = this.value === 'manual' ? '' : 'none';
        });
      });

      // API模式
      var apiModeEl = page.querySelector('#cmApiMode');
      var advSub = page.querySelector('#cmAdvancedSub');
      if (apiModeEl && advSub) {
        apiModeEl.addEventListener('change', function() {
          advSub.style.display = this.value === 'individual' ? '' : 'none';
        });
      }

      // Range绑定
      function bindRange(iid, vid, fmt) {
        var i = page.querySelector('#' + iid);
        var v = page.querySelector('#' + vid);
        if (i && v) i.addEventListener('input', function() { v.textContent = fmt(this.value); });
      }
      bindRange('cmMmSpeed', 'cmMmSpeedVal', function(v) { return v + 'x'; });
      bindRange('cmMmPitch', 'cmMmPitchVal', function(v) { return (v > 0 ? '+' : '') + v; });
      bindRange('cmProLevel', 'cmProLevelVal', function(v) { return PRO_LEVEL_NAMES[v - 1]; });
      bindRange('cmStkFreq', 'cmStkFreqVal', function(v) { return STK_FREQ_NAMES[v - 1]; });
      bindRange('cmTemp', 'cmTempVal', function(v) { return v; });
      bindRange('cmFreq', 'cmFreqVal', function(v) { return v; });
      bindRange('cmPres', 'cmPresVal', function(v) { return v; });

      // 展开按钮
      page.querySelectorAll('.cm-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var f = btn.dataset.field;
          var map = { profile: '#cmProfile', dialogExamples: '#cmDialog', postInstruction: '#cmPost' };
          var ta = page.querySelector(map[f]);
          if (ta) CharMgr.openExpand(ta);
        });
      });

      // 保存
      page.querySelector('#cmSaveBtn').addEventListener('click', function() { CharMgr.doSave(page); });
    },

    doSave: function(page) {
      var name = (page.querySelector('#cmNameInput') || {}).value || '';
      name = name.trim();
      if (!name) { App.showToast('请输入角色名'); return; }
      if (!App.character) return;

      // 收集基础字段
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

      // 收集设置
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
        momentsTypes: momTypes, momentsImg: 'AI 生成',
        timeWeather: gc('cmTwToggle'), charCity: gv('cmCharCity'), charRealCity: gv('cmCharRealCity'),
        imgApiUrl: gv('cmImgApiUrl'), imgApiKey: gv('cmImgApiKey'), imgModel: gv('cmImgModel') || 'gpt-image-1',
        apiMode: gv('cmApiMode') || 'global', apiSelect: gv('cmApiSelect') || '',
        temperature: parseFloat(gv('cmTemp') || 0.8), freqPenalty: parseFloat(gv('cmFreq') || 0.3),
        presPenalty: parseFloat(gv('cmPres') || 0.3)
      };

      // 保存角色数据
      if (CharMgr.editingCharId) {
        var ex = App.character.getById(CharMgr.editingCharId);
        if (ex) {
          Object.keys(charObj).forEach(function(k) {
            if (k === 'avatar') { if (charObj.avatar) ex.avatar = charObj.avatar; }
            else ex[k] = charObj[k];
          });
          App.character.save();
        }
      } else {
        charObj.id = 'char-' + Date.now();
        charObj.cover = '';
        charObj.worldbookMounted = false;
        charObj.modeColors = [{}, {}, {}];
        App.character.list.push(charObj);
        App.character.save();
        CharMgr.editingCharId = charObj.id;
      }

      // 保存设置数据
      CharMgr.charConfigs[CharMgr.editingCharId] = cfgObj;
      CharMgr.save();

      CharMgr.close();
      if (App.character) App.character.renderList();
      App.showToast(charObj.id ? '角色已更新' : '角色已创建');
    },

    _showAvatarMenu: function(box) {
      var old = App.$('#avatarSourceMenu');
      if (old) old.remove();
      var menu = document.createElement('div');
      menu.id = 'avatarSourceMenu';
      menu.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);';
      menu.innerHTML =
        '<div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;box-shadow:0 8px 30px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:10px;">' +
          '<div style="font-size:13px;font-weight:700;color:#333;text-align:center;margin-bottom:4px;">选择头像来源</div>' +
          '<button id="avFromAlbum" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">从相册选择</button>' +
          '<button id="avFromUrl" type="button" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:inherit;">输入图片URL</button>' +
          '<button id="avFromDel" type="button" style="padding:12px;border:1.5px solid #eee;border-radius:10px;background:#fafafa;font-size:12px;font-weight:500;color:#bbb;cursor:pointer;font-family:inherit;">删除头像</button>' +
          '<button id="avFromCancel" type="button" style="padding:10px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button>' +
        '</div>';
      document.body.appendChild(menu);
      menu.addEventListener('click', function(e) { if (e.target === menu) menu.remove(); });
      menu.querySelector('#avFromCancel').addEventListener('click', function() { menu.remove(); });
      menu.querySelector('#avFromDel').addEventListener('click', function() { menu.remove(); CharMgr.tempAvatar = ''; box.innerHTML = '<span class="cc-avatar-empty">PHOTO</span>'; });
      menu.querySelector('#avFromAlbum').addEventListener('click', function() {
        menu.remove();
        var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; document.body.appendChild(input);
        input.onchange = function(ev) {
          var file = ev.target.files[0]; document.body.removeChild(input); if (!file) return;
          var reader = new FileReader();
          reader.onload = function(r) {
            if (App.cropImage) { App.cropImage(r.target.result, function(c) { CharMgr.tempAvatar = c; box.innerHTML = '<img src="' + c + '">'; }); }
            else { CharMgr.tempAvatar = r.target.result; box.innerHTML = '<img src="' + r.target.result + '">'; }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      });
      menu.querySelector('#avFromUrl').addEventListener('click', function() {
        menu.remove();
        var url = prompt('输入头像URL：');
        if (!url) return;
        CharMgr.tempAvatar = url.trim();
        box.innerHTML = '<img src="' + App.escAttr(url.trim()) + '">';
      });
    },

    openExpand: function(textarea) {
      if (CharMgr._expandEl) CharMgr._expandEl.remove();
      var ed = document.createElement('div'); CharMgr._expandEl = ed;
      ed.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10003;background:#fff;display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.32,.72,0,1),opacity .3s;transform:translateY(100%);opacity:0;';
      ed.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;">' +
          '<button class="cc-top-btn" id="cmExpBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;">编辑内容</span>' +
          '<button id="cmExpDone" type="button" style="background:none;border:none;color:#7a9ab8;font-size:13px;font-weight:600;cursor:pointer;padding:4px 10px;font-family:inherit;">完成</button>' +
        '</div>' +
        '<div style="flex:1;padding:12px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;">' +
          '<textarea id="cmExpTA" style="width:100%;min-height:calc(100vh - 120px);border:1.5px solid rgba(126,163,201,.25);border-radius:12px;padding:14px 16px;font-size:13px;color:#2e4258;outline:none;font-family:inherit;background:rgba(126,163,201,.04);resize:none;line-height:1.7;box-sizing:border-box;">' + App.esc(textarea.value) + '</textarea>' +
        '</div>';
      document.body.appendChild(ed);
      requestAnimationFrame(function() { requestAnimationFrame(function() { ed.style.transform = 'translateY(0)'; ed.style.opacity = '1'; }); });
      var ta = ed.querySelector('#cmExpTA'); if (ta) ta.focus();
      function done() { textarea.value = ed.querySelector('#cmExpTA').value; ed.style.transform = 'translateY(100%)'; ed.style.opacity = '0'; setTimeout(function() { if (ed.parentNode) ed.remove(); CharMgr._expandEl = null; }, 350); }
      ed.querySelector('#cmExpBack').addEventListener('click', done);
      ed.querySelector('#cmExpDone').addEventListener('click', done);
    },

    // 兼容旧的调用方式
    hasCustom: function(charId) { return !!CharMgr.charConfigs[charId]; },
    getCharConfig: function(charId) {
      if (CharMgr.charConfigs && CharMgr.charConfigs[charId]) return CharMgr.charConfigs[charId];
      return JSON.parse(JSON.stringify(DEFAULTS));
    },

    // 给 chat.js 用的全局配置兼容
    get globalConfig() { return JSON.parse(JSON.stringify(DEFAULTS)); },

    init: function() {
      CharMgr.load();
      App.charMgr = CharMgr;
    }
  };

  App.register('charMgr', CharMgr);
})();