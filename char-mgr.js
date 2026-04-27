
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var DEFAULTS = {
    mainLang: '简体中文',
    bilingual: false,
    biLang: 'English',
    biStyle: 'bracket',
    minimax: false,
    mmVoiceId: '',
    mmApiKey: '',
    mmSpeed: 1,
    mmPitch: 0,
    fallbackTTS: false,
    fallbackEngine: '系统 Web Speech',
    fallbackVoice: 'zh-CN-YunxiNeural (男)',
    proactive: true,
    proMinInterval: 15,
    proMaxInterval: 120,
    proActiveStart: '08:00',
    proActiveEnd: '23:30',
    proMode: 'manual',
    proLevel: 3,
    replySpeed: '正常（3-8秒）',
    showTyping: true,
    minMsgs: 1,
    maxMsgs: 3,
    msgTypes: ['文字','表情','图片','语音','语音通话','视频通话','红包','转账','位置','音乐'],
    stickerGen: false,
    stickerStyles: ['可爱卡通'],
    stickerFreq: 2,
    moments: false,
    momentsMax: 2,
    momentsTypes: ['纯文字','图文'],
    momentsImg: 'AI 生成',
    timeWeather: true,
    charCity: '',
    imgApiUrl: '',
    imgApiKey: '',
    imgModel: 'dall-e-3',
    apiMode: 'global',
    apiSelect: '',
    temperature: 0.8,
    freqPenalty: 0.3,
    presPenalty: 0.3
  };

  var MSG_TYPES = ['文字','表情','图片','语音','语音通话','视频通话','红包','转账','位置','音乐'];
  var STK_STYLES = ['可爱卡通','写实','像素风','手绘','表情包梗图'];
  var PRO_LEVEL_NAMES = ['佛系','偶尔','适中','频繁','粘人'];
  var STK_FREQ_NAMES = ['极少','偶尔','适中','经常','频繁'];

  var CharMgr = {
    globalConfig: {},
    charConfigs: {},
    selectedCharId: null,

    load: function() {
      CharMgr.globalConfig = App.LS.get('cmGlobal') || JSON.parse(JSON.stringify(DEFAULTS));
      CharMgr.charConfigs = App.LS.get('cmChars') || {};
    },

    save: function() {
      try {
        localStorage.setItem('cmGlobal', JSON.stringify(CharMgr.globalConfig));
        localStorage.setItem('cmChars', JSON.stringify(CharMgr.charConfigs));
        return true;
      } catch (e) {
        App.showToast('存储空间不足');
        return false;
      }
    },

    getCharConfig: function(charId) {
      if (CharMgr.charConfigs[charId]) return CharMgr.charConfigs[charId];
      return CharMgr.globalConfig;
    },

    hasCustom: function(charId) {
      return !!CharMgr.charConfigs[charId];
    },

    resetChar: function(charId) {
      delete CharMgr.charConfigs[charId];
      CharMgr.save();
    },

    isConfigDifferent: function(a, b) {
      var keys = Object.keys(DEFAULTS);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var va = JSON.stringify(a[k]);
        var vb = JSON.stringify(b[k]);
        if (va !== vb) return true;
      }
      return false;
    },

    open: function() {
      CharMgr.load();
      CharMgr.selectedCharId = null;

      var page = document.createElement('div');
      page.id = 'charMgrPage';
      page.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100020;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      document.body.appendChild(page);

      CharMgr.render(page);

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
      }); });
    },

    close: function() {
      var page = App.$('#charMgrPage');
      if (!page) return;
      page.style.transform = 'translateX(100%)';
      page.style.opacity = '0';
      setTimeout(function() { if (page.parentNode) page.remove(); }, 350);
    },

    render: function(page) {
      var chars = App.character ? App.character.list : [];
      var isGlobal = !CharMgr.selectedCharId;
      var cfg;

      if (isGlobal) {
        cfg = CharMgr.globalConfig;
      } else {
        cfg = CharMgr.hasCustom(CharMgr.selectedCharId)
          ? CharMgr.charConfigs[CharMgr.selectedCharId]
          : JSON.parse(JSON.stringify(CharMgr.globalConfig));
      }

      // 分类角色
      var globalChars = [];
      var customChars = [];
      chars.forEach(function(c) {
        if (CharMgr.hasCustom(c.id)) customChars.push(c);
        else globalChars.push(c);
      });

      // 全局行
      var globalRowHtml = '<div class="cm-char-slot" data-id="__global__">' +
        '<div class="cm-char-avatar cm-char-all-circle' + (isGlobal ? ' cm-active' : '') + '"><span class="cm-char-all">ALL</span></div>' +
        '<div class="cm-char-name' + (isGlobal ? ' cm-active' : '') + '">全局</div></div>';

      globalChars.forEach(function(c) {
        var isActive = CharMgr.selectedCharId === c.id;
        var avatarHtml = c.avatar ? '<img src="' + App.escAttr(c.avatar) + '">' : '';
        globalRowHtml += '<div class="cm-char-slot" data-id="' + c.id + '">' +
          '<div class="cm-char-avatar' + (isActive ? ' cm-active' : '') + '">' + avatarHtml + '</div>' +
          '<div class="cm-char-name' + (isActive ? ' cm-active' : '') + '">' + App.esc(c.name || '?') + '</div></div>';
      });

      // 个别微调行
      var customRowHtml = '';
      customChars.forEach(function(c) {
        var isActive = CharMgr.selectedCharId === c.id;
        var avatarHtml = c.avatar ? '<img src="' + App.escAttr(c.avatar) + '">' : '';
        customRowHtml += '<div class="cm-char-slot" data-id="' + c.id + '" style="position:relative;">' +
          '<div class="cm-char-avatar' + (isActive ? ' cm-active' : '') + '">' + avatarHtml + '</div>' +
          '<div class="cm-char-name' + (isActive ? ' cm-active' : '') + '">' + App.esc(c.name || '?') + '</div>' +
          '<div class="cm-char-restore" data-restore-id="' + c.id + '" style="position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:rgba(201,112,107,.85);display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 3v6h6"/></svg></div>' +
        '</div>';
      });

      var ck = function(key) { return cfg[key] ? ' checked' : ''; };
      var sv = function(key, val) { return cfg[key] === val ? ' selected' : ''; };
      var proManual = cfg.proMode !== 'auto';
      var isAllDay = cfg.proActiveStart === '00:00' && cfg.proActiveEnd === '23:59';

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

      var isIndividual = cfg.apiMode === 'individual';

      var editingLabel = isGlobal
        ? '全局设置（通用模板）'
        : '编辑：' + App.esc((App.character ? App.character.getById(CharMgr.selectedCharId) : null || {}).name || '?');

      page.innerHTML =
        // 顶部固定区域
        '<div style="flex-shrink:0;background:#fff;z-index:10;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;border-bottom:1px solid #eee;">' +
            '<button id="cmBackBtn" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
            '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">角色管理</span>' +
            '<div style="width:36px;"></div>' +
          '</div>' +

          // 角色行：全局
          '<div style="padding:12px 16px 4px;">' +
            '<div style="font-size:11px;font-weight:700;color:#8aa0b8;letter-spacing:1px;margin-bottom:6px;">全局（通用模板）</div>' +
            '<div class="cm-char-row" id="cmGlobalRow" style="padding:0;margin:0;">' + globalRowHtml + '</div>' +
          '</div>' +

          // 角色行：个别微调
          '<div style="padding:4px 16px 8px;border-bottom:1px solid #eee;min-height:28px;">' +
            '<div style="font-size:11px;font-weight:700;color:#c9706b;letter-spacing:1px;margin-bottom:6px;">个别微调</div>' +
            '<div class="cm-char-row" id="cmCustomRow" style="padding:0;margin:0;">' +
              (customRowHtml || '<span style="font-size:11px;color:#ccc;">暂无</span>') +
            '</div>' +
          '</div>' +

          // 当前编辑标签
          '<div style="padding:8px 16px;background:rgba(126,163,201,.06);text-align:center;">' +
            '<span style="font-size:12px;font-weight:700;color:#5a7a9a;letter-spacing:.5px;">' + editingLabel + '</span>' +
          '</div>' +
        '</div>' +

        // 可滚动内容区
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;" id="cmScrollArea">' +

          '<!-- CARD 1 · 语言与语音 -->' +
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-green">语言与语音</div></div><div class="cm-section-body">' +
            '<div class="cm-field" style="margin-bottom:12px"><div class="cm-field-label">主要语言</div><select class="cm-select" id="cmMainLang"><option' + sv('mainLang','简体中文') + '>简体中文</option><option' + sv('mainLang','繁體中文') + '>繁體中文</option><option' + sv('mainLang','粤语') + '>粤语</option><option' + sv('mainLang','English') + '>English</option><option' + sv('mainLang','日本語') + '>日本語</option><option' + sv('mainLang','한국어') + '>한국어</option></select></div>' +
            '<div class="cm-sep"></div>' +

            '<div class="cm-sw-row"><div class="cm-sw-left"><span class="cm-sw-name">双语模式</span><span class="cm-sw-desc">每条消息附带翻译</span></div><label class="cm-sw"><input type="checkbox" id="cmBiToggle"' + ck('bilingual') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.bilingual ? ' cm-open' : '') + '" id="cmBiSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">翻译为</div><select class="cm-select" id="cmBiLang"><option' + sv('biLang','English') + '>English</option><option' + sv('biLang','日本語') + '>日本語</option><option' + sv('biLang','한국어') + '>한국어</option><option' + sv('biLang','繁體中文') + '>繁體中文</option><option' + sv('biLang','粤语') + '>粤语</option></select></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field-label" style="margin-bottom:4px">显示方式</div><div class="cm-radio-row"><div class="cm-radio-item"><input type="radio" name="cmBiStyle" id="cmBiA" value="bracket"' + (cfg.biStyle==='bracket'?' checked':'') + '><label class="cm-radio-label" for="cmBiA">括号附注</label></div><div class="cm-radio-item"><input type="radio" name="cmBiStyle" id="cmBiB" value="newline"' + (cfg.biStyle==='newline'?' checked':'') + '><label class="cm-radio-label" for="cmBiB">另起一行</label></div></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +

            '<div class="cm-sw-row"><div class="cm-sw-left"><span class="cm-sw-name">MiniMax 语音</span><span class="cm-sw-desc">使用 MiniMax TTS 生成角色语音</span></div><label class="cm-sw"><input type="checkbox" id="cmMmToggle"' + ck('minimax') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.minimax ? ' cm-open' : '') + '" id="cmMmSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">Voice ID</div><input type="text" class="cm-field-input" id="cmMmVoice" placeholder="粘贴 MiniMax Voice ID..." value="' + App.escAttr(cfg.mmVoiceId||'') + '"></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">API Key <span class="cm-opt">(留空用全局)</span></div><input type="text" class="cm-field-input" id="cmMmKey" placeholder="留空则使用全局 API Key" value="' + App.escAttr(cfg.mmApiKey||'') + '"></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-sub-label">语速</div><div class="cm-range-wrap"><span class="cm-range-hint">慢</span><input type="range" class="cm-range" id="cmMmSpeed" min="0.5" max="2" step="0.1" value="' + cfg.mmSpeed + '"><span class="cm-range-val" id="cmMmSpeedVal">' + cfg.mmSpeed + 'x</span><span class="cm-range-hint">快</span></div></div>' +
              '<div class="cm-sub-row" style="margin-top:6px"><div class="cm-sub-label">音调</div><div class="cm-range-wrap"><span class="cm-range-hint">低</span><input type="range" class="cm-range" id="cmMmPitch" min="-12" max="12" step="1" value="' + cfg.mmPitch + '"><span class="cm-range-val" id="cmMmPitchVal">' + (cfg.mmPitch>0?'+':'') + cfg.mmPitch + '</span><span class="cm-range-hint">高</span></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +

            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">备用 TTS 引擎</span><span class="cm-sw-desc">MiniMax 不可用时的替代方案</span></div><label class="cm-sw"><input type="checkbox" id="cmFallToggle"' + ck('fallbackTTS') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.fallbackTTS ? ' cm-open' : '') + '" id="cmFallSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">TTS 引擎</div><select class="cm-select" id="cmFallEngine"><option' + sv('fallbackEngine','系统 Web Speech') + '>系统 Web Speech</option><option' + sv('fallbackEngine','OpenAI TTS') + '>OpenAI TTS</option></select></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">音色</div><select class="cm-select" id="cmFallVoice"><option' + sv('fallbackVoice','zh-CN-XiaoxiaoNeural (女)') + '>zh-CN-XiaoxiaoNeural (女)</option><option' + sv('fallbackVoice','zh-CN-YunxiNeural (男)') + '>zh-CN-YunxiNeural (男)</option><option' + sv('fallbackVoice','zh-CN-XiaoyiNeural (女)') + '>zh-CN-XiaoyiNeural (女)</option><option' + sv('fallbackVoice','zh-CN-YunjianNeural (男)') + '>zh-CN-YunjianNeural (男)</option></select></div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          '<!-- CARD 2 · 消息行为 -->' +
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

          '<!-- CARD 3 · 社交功能 -->' +
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

            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">朋友圈生成</span><span class="cm-sw-desc">角色自动发朋友圈动态</span></div><label class="cm-sw"><input type="checkbox" id="cmMomToggle"' + ck('moments') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.moments ? ' cm-open' : '') + '" id="cmMomSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">每日最多发布</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><input type="number" class="cm-field-input" id="cmMomMax" value="' + cfg.momentsMax + '" min="0" max="10" style="width:60px;text-align:center;"><span style="font-size:10px;color:#888">条/天</span></div></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">内容类型</div><div class="cm-tag-row" style="margin-top:4px" id="cmMomTypes">' + momTypesHtml + '</div></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">配图生成</div><select class="cm-select" id="cmMomImg"><option' + sv('momentsImg','AI 生成') + '>AI 生成</option><option' + sv('momentsImg','使用预设图库') + '>使用预设图库</option></select></div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          '<!-- CARD 4 · 情境感知 -->' +
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title cm-red">情境感知</div></div><div class="cm-section-body">' +
            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">时间 & 天气感知</span><span class="cm-sw-desc">角色知道当前时间和天气</span></div><label class="cm-sw"><input type="checkbox" id="cmTwToggle"' + ck('timeWeather') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.timeWeather ? ' cm-open' : '') + '" id="cmTwSub">' +
              '<div class="cm-field"><div class="cm-field-label">角色所在城市</div><input type="text" class="cm-field-input" id="cmCharCity" placeholder="如：东京、首尔..." value="' + App.escAttr(cfg.charCity||'') + '"></div>' +
              '<div class="cm-tip" style="margin-top:10px;margin-bottom:0"><div class="cm-tip-icon">i</div><div class="cm-tip-text">设置不同城市后，角色会感知两地时差和天气差异。</div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          '<!-- CARD 5 · 高级设定 -->' +
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title">高级设定</div><div class="cm-section-badge">ADVANCED</div></div><div class="cm-section-body">' +
            '<div class="cm-field" style="margin-bottom:6px"><div class="cm-field-label">图片生成 API <span class="cm-opt">(表情包/图片消息)</span></div></div>' +
            '<div class="cm-field" style="margin-bottom:8px"><div class="cm-field-label">API 地址</div><input type="text" class="cm-field-input" id="cmImgApiUrl" placeholder="https://api.openai.com/v1" value="' + App.escAttr(cfg.imgApiUrl||'') + '"></div>' +
            '<div class="cm-field" style="margin-bottom:8px"><div class="cm-field-label">API Key <span class="cm-opt">(留空用全局)</span></div><input type="text" class="cm-field-input" id="cmImgApiKey" placeholder="留空则使用全局 API Key" value="' + App.escAttr(cfg.imgApiKey||'') + '"></div>' +
'<div class="cm-field" style="margin-bottom:8px"><div class="cm-field-label">模型</div><div style="display:flex;gap:6px;"><input type="text" class="cm-field-input" id="cmImgModel" placeholder="gpt-image-1" value="' + App.escAttr(cfg.imgModel||'gpt-image-1') + '" style="flex:1;"><button type="button" id="cmImgFetchModels" class="cm-field-input" style="width:40px;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#888;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg></button></div><div class="cm-img-model-list" id="cmImgModelList" style="display:none;margin-top:4px;max-height:200px;overflow-y:auto;border:1.5px solid #ddd;border-radius:8px;background:#fff;"></div></div>' +
            '<div class="cm-tip"><div class="cm-tip-icon">i</div><div class="cm-tip-text">用于生成表情包和图片消息。仅支持 OpenAI 图片接口。留空则表情包以文字标记显示。</div></div>' +

            '<div class="cm-sep"></div>' +

            '<div class="cm-field" style="margin-bottom:6px"><div class="cm-field-label">API 配置</div><select class="cm-select" id="cmApiMode"><option value="global"' + (cfg.apiMode==='global'?' selected':'') + '>使用全局 API</option><option value="individual"' + (cfg.apiMode==='individual'?' selected':'') + '>为该角色单独配置</option></select></div>' +
            '<div class="cm-tip"><div class="cm-tip-icon">!</div><div class="cm-tip-text">若为每个角色单独匹配 API，在进行群聊时将会同时消耗多个 API 额度。</div></div>' +

            '<div id="cmAdvancedSub" style="' + (isIndividual ? '' : 'display:none;') + '">' +
              '<div class="cm-field" style="margin-bottom:10px"><div class="cm-field-label">选择已保存的 API</div><select class="cm-select" id="cmApiSelect">' + apiOptionsHtml + '</select></div>' +
              '<div class="cm-sep"></div>' +
              '<div class="cm-param"><div class="cm-param-title">Temperature</div><div class="cm-param-desc">贴合人设 ↔ 有创意</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">精确</span><input type="range" class="cm-range" id="cmTemp" min="0" max="2" step="0.05" value="' + cfg.temperature + '"><span class="cm-range-val" id="cmTempVal">' + cfg.temperature + '</span><span class="cm-range-hint">创意</span></div></div></div>' +
              '<div class="cm-param"><div class="cm-param-title">Frequency Penalty</div><div class="cm-param-desc">避免重复词汇</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">重复</span><input type="range" class="cm-range" id="cmFreq" min="0" max="2" step="0.1" value="' + cfg.freqPenalty + '"><span class="cm-range-val" id="cmFreqVal">' + cfg.freqPenalty + '</span><span class="cm-range-hint">避免</span></div></div></div>' +
              '<div class="cm-param"><div class="cm-param-title">Presence Penalty</div><div class="cm-param-desc">鼓励新词汇</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">保守</span><input type="range" class="cm-range" id="cmPres" min="0" max="2" step="0.1" value="' + cfg.presPenalty + '"><span class="cm-range-val" id="cmPresVal">' + cfg.presPenalty + '</span><span class="cm-range-hint">创新</span></div></div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          '<div class="cm-save-row"><button class="cm-save-btn" id="cmSaveBtn" type="button">保 存 设 置</button></div>' +

        '</div>';

      CharMgr.bindEvents(page);
    },

    collectConfig: function(page) {
      var msgTypes = [];
      page.querySelectorAll('#cmMsgTypes input:checked').forEach(function(cb) { msgTypes.push(cb.dataset.type); });
      var momTypes = [];
      page.querySelectorAll('#cmMomTypes input:checked').forEach(function(cb) { momTypes.push(cb.dataset.mtype); });
      var stkStyles = [];
      page.querySelectorAll('#cmStkStyles input:checked').forEach(function(cb) { stkStyles.push(cb.dataset.sty); });
      var biStyleEl = page.querySelector('input[name="cmBiStyle"]:checked');
      var proModeEl = page.querySelector('input[name="cmProMode"]:checked');
      var isAllDay = page.querySelector('#cmAmAll') && page.querySelector('#cmAmAll').checked;

      var gv = function(id) { var e = page.querySelector('#' + id); return e ? e.value : ''; };
      var gc = function(id) { var e = page.querySelector('#' + id); return e ? e.checked : false; };

      return {
        mainLang: gv('cmMainLang') || '简体中文',
        bilingual: gc('cmBiToggle'),
        biLang: gv('cmBiLang') || 'English',
        biStyle: biStyleEl ? biStyleEl.value : 'bracket',
        minimax: gc('cmMmToggle'),
        mmVoiceId: gv('cmMmVoice'),
        mmApiKey: gv('cmMmKey'),
        mmSpeed: parseFloat(gv('cmMmSpeed') || 1),
        mmPitch: parseInt(gv('cmMmPitch') || 0),
        fallbackTTS: gc('cmFallToggle'),
        fallbackEngine: gv('cmFallEngine') || '系统 Web Speech',
        fallbackVoice: gv('cmFallVoice') || '',
        proactive: gc('cmProToggle'),
        proMinInterval: parseInt(gv('cmProMin') || 15),
        proMaxInterval: parseInt(gv('cmProMax') || 120),
        proActiveStart: isAllDay ? '00:00' : (gv('cmProStart') || '08:00'),
        proActiveEnd: isAllDay ? '23:59' : (gv('cmProEnd') || '23:30'),
        proMode: proModeEl ? proModeEl.value : 'manual',
        proLevel: parseInt(gv('cmProLevel') || 3),
        replySpeed: gv('cmReplySpeed') || '正常（3-8秒）',
        showTyping: gv('cmShowTyping') === '显示',
        minMsgs: parseInt(gv('cmMinMsgs') || 1),
        maxMsgs: parseInt(gv('cmMaxMsgs') || 3),
        msgTypes: msgTypes,
        stickerGen: gc('cmStkToggle'),
        stickerStyles: stkStyles.length ? stkStyles : ['可爱卡通'],
        stickerFreq: parseInt(gv('cmStkFreq') || 2),
        moments: gc('cmMomToggle'),
        momentsMax: parseInt(gv('cmMomMax') || 2),
        momentsTypes: momTypes,
        momentsImg: gv('cmMomImg') || 'AI 生成',
        timeWeather: gc('cmTwToggle'),
        charCity: gv('cmCharCity'),
        imgApiUrl: gv('cmImgApiUrl'),
        imgApiKey: gv('cmImgApiKey'),
        imgModel: gv('cmImgModel') || 'dall-e-3',
        apiMode: gv('cmApiMode') || 'global',
        apiSelect: gv('cmApiSelect') || '',
        temperature: parseFloat(gv('cmTemp') || 0.8),
        freqPenalty: parseFloat(gv('cmFreq') || 0.3),
        presPenalty: parseFloat(gv('cmPres') || 0.3)
      };
    },

    bindEvents: function(page) {
      page.querySelector('#cmBackBtn').addEventListener('click', function() { CharMgr.close(); });

      // 角色头像点击
      page.querySelectorAll('.cm-char-slot').forEach(function(slot) {
        slot.addEventListener('click', function(e) {
          if (e.target.closest('.cm-char-restore')) return;
          var id = slot.dataset.id;
          if (id === '__global__') { CharMgr.selectedCharId = null; }
          else { CharMgr.selectedCharId = id; }
          CharMgr.render(page);
          var scroll = page.querySelector('#cmScrollArea');
          if (scroll) scroll.scrollTop = 0;
        });
      });

      // 恢复按钮
      page.querySelectorAll('.cm-char-restore').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = btn.dataset.restoreId;
          if (!id) return;
          if (!confirm('将该角色设置恢复为全局模板？')) return;
          CharMgr.resetChar(id);
          if (CharMgr.selectedCharId === id) CharMgr.selectedCharId = null;
          CharMgr.render(page);
          App.showToast('已恢复为全局模板');
        });
      });

      function bindToggle(tid, sid) {
        var t = page.querySelector('#' + tid);
        var s = page.querySelector('#' + sid);
        if (t && s) t.addEventListener('change', function() { s.classList.toggle('cm-open', this.checked); });
      }
      bindToggle('cmBiToggle', 'cmBiSub');
      bindToggle('cmMmToggle', 'cmMmSub');
      bindToggle('cmFallToggle', 'cmFallSub');
      bindToggle('cmProToggle', 'cmProSub');
      bindToggle('cmTwToggle', 'cmTwSub');
      bindToggle('cmStkToggle', 'cmStkSub');
      bindToggle('cmMomToggle', 'cmMomSub');

      page.querySelectorAll('input[name="cmActiveMode"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
          var custom = page.querySelector('#cmActiveCustom');
          if (this.value === 'allday') { if (custom) custom.style.display = 'none'; }
          else { if (custom) custom.style.display = 'flex'; }
        });
      });

      page.querySelectorAll('input[name="cmProMode"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
          var m = page.querySelector('#cmProManual');
          var a = page.querySelector('#cmProAuto');
          if (this.value === 'manual') { if (m) m.style.display = ''; if (a) a.style.display = 'none'; }
          else { if (m) m.style.display = 'none'; if (a) a.style.display = ''; }
        });
      });

      var apiModeEl = page.querySelector('#cmApiMode');
      var advSub = page.querySelector('#cmAdvancedSub');
      if (apiModeEl && advSub) {
        apiModeEl.addEventListener('change', function() {
          advSub.style.display = this.value === 'individual' ? '' : 'none';
        });
      }

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

      // 图片模型获取（复用API获取模型的逻辑）
      var imgFetchBtn = page.querySelector('#cmImgFetchModels');
      if (imgFetchBtn) {
        imgFetchBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          var url = (page.querySelector('#cmImgApiUrl') || {}).value || '';
          var key = (page.querySelector('#cmImgApiKey') || {}).value || '';
          if (!url) {
            var gApi = App.api ? App.api.getActiveConfig() : null;
            if (gApi) { url = gApi.url; if (!key) key = gApi.key; }
          }
          if (!key) {
            var gApi2 = App.api ? App.api.getActiveConfig() : null;
            if (gApi2) key = gApi2.key;
          }
          if (!url || !key) { App.showToast('请先填写图片API地址和Key，或配置全局API'); return; }
          App.showToast('获取模型列表...');
          fetch(url.replace(/\/+$/, '') + '/models', {
            headers: { 'Authorization': 'Bearer ' + key }
          }).then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
          }).then(function(data) {
            var raw = data.data || data;
            var models = [];
            if (Array.isArray(raw)) {
              for (var i = 0; i < raw.length; i++) {
                var id = raw[i].id || raw[i].name || raw[i];
                if (id) models.push(id);
              }
            }
            if (!models.length) { App.showToast('未找到模型'); return; }
            var list = page.querySelector('#cmImgModelList');
            if (!list) return;
            var currentVal = (page.querySelector('#cmImgModel') || {}).value || '';
            var searchHtml = '<input type="text" id="cmImgModelSearch" placeholder="搜索模型..." style="width:calc(100% - 16px);margin:6px 8px;padding:6px 10px;border:1px solid #eee;border-radius:6px;font-size:12px;outline:none;font-family:inherit;color:#333;box-sizing:border-box;">';
            var itemsHtml = models.map(function(m) {
              var sel = m === currentVal ? 'background:rgba(126,163,201,.12);font-weight:700;' : '';
              return '<div class="cm-img-model-item" data-model="' + App.escAttr(m) + '" style="padding:9px 14px;font-size:12px;color:#333;cursor:pointer;border-bottom:1px solid #f5f5f5;' + sel + '-webkit-tap-highlight-color:transparent;">' + App.esc(m) + '</div>';
            }).join('');
            list.innerHTML = searchHtml + '<div id="cmImgModelResults">' + itemsHtml + '</div>';
            list.style.display = 'block';

            function bindClicks() {
              list.querySelectorAll('.cm-img-model-item').forEach(function(item) {
                item.addEventListener('click', function() {
                  var inp = page.querySelector('#cmImgModel');
                  if (inp) inp.value = item.dataset.model;
                  list.style.display = 'none';
                });
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
                  results.innerHTML = filtered.map(function(m) {
                    var sel = m === currentVal ? 'background:rgba(126,163,201,.12);font-weight:700;' : '';
                    return '<div class="cm-img-model-item" data-model="' + App.escAttr(m) + '" style="padding:9px 14px;font-size:12px;color:#333;cursor:pointer;border-bottom:1px solid #f5f5f5;' + sel + '-webkit-tap-highlight-color:transparent;">' + App.esc(m) + '</div>';
                  }).join('');
                  bindClicks();
                }
              });
              searchInput.addEventListener('click', function(e) { e.stopPropagation(); });
            }

            App.showToast(models.length + ' 个模型');
          }).catch(function(err) {
            App.showToast('获取失败: ' + err.message);
          });
        });
      }

      page.querySelector('#cmSaveBtn').addEventListener('click', function() {
        var data = CharMgr.collectConfig(page);

        if (!CharMgr.selectedCharId) {
          // 全局保存
          CharMgr.globalConfig = data;
        } else {
          // 角色保存：对比全局模板
          if (CharMgr.isConfigDifferent(data, CharMgr.globalConfig)) {
            CharMgr.charConfigs[CharMgr.selectedCharId] = data;
          } else {
            // 没有差异，删除个别配置
            delete CharMgr.charConfigs[CharMgr.selectedCharId];
          }
        }

        if (CharMgr.save()) {
          CharMgr.render(page);
          App.showToast('✓ 设置已保存');
        }
      });
    },

    init: function() {
      CharMgr.load();
      App.charMgr = CharMgr;
    }
  };

  App.register('charMgr', CharMgr);
})();
