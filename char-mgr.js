
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
    fallbackEngine: 'Edge TTS',
    fallbackVoice: 'zh-CN-XiaoxiaoNeural (女)',
    proactive: true,
    proMinInterval: 15,
    proMaxInterval: 120,
    proActiveStart: '08:00',
    proActiveEnd: '23:30',
    proMode: 'manual',
    proLevel: 3,
    replySpeed: '正常（3-8秒）',
    showTyping: true,
    msgTypes: ['文字','表情','图片','语音','语音通话','视频通话','红包','转账','位置','音乐'],
    stickerGen: false,
    stickerEngine: 'DALL·E 3',
    stickerStyle: '可爱卡通',
    stickerFreq: 2,
    moments: false,
    momentsMax: 2,
    momentsTypes: ['纯文字','图文'],
    momentsImg: 'AI 生成',
    timeWeather: true,
    charCity: '',
    userCity: '',
    apiMode: 'global',
    apiSelect: '',
    temperature: 0.8,
    freqPenalty: 0.3,
    presPenalty: 0.3
  };

  var MSG_TYPES = ['文字','表情','图片','语音','语音通话','视频通话','红包','转账','位置','音乐'];
  var PRO_LEVEL_NAMES = ['佛系','偶尔','适中','频繁','粘人'];
  var STK_FREQ_NAMES = ['极少','偶尔','适中','经常','频繁'];

  var CharMgr = {
    globalConfig: {},
    charConfigs: {},
    currentTab: 'global',
    selectedCharId: null,

    load: function() {
      CharMgr.globalConfig = App.LS.get('cmGlobal') || JSON.parse(JSON.stringify(DEFAULTS));
      CharMgr.charConfigs = App.LS.get('cmChars') || {};
    },

    save: function() {
      try {
        localStorage.setItem('cmGlobal', JSON.stringify(CharMgr.globalConfig));
        localStorage.setItem('cmChars', JSON.stringify(CharMgr.charConfigs));
      } catch (e) {
        App.showToast('存储失败');
      }
    },

    getCharConfig: function(charId) {
      if (!CharMgr.charConfigs[charId]) {
        CharMgr.charConfigs[charId] = JSON.parse(JSON.stringify(CharMgr.globalConfig));
      }
      return CharMgr.charConfigs[charId];
    },

    open: function() {
      CharMgr.load();
      CharMgr.currentTab = 'global';
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
      var cfg;
      if (CharMgr.currentTab === 'global') {
        cfg = CharMgr.globalConfig;
      } else {
        if (CharMgr.selectedCharId) cfg = CharMgr.getCharConfig(CharMgr.selectedCharId);
        else cfg = CharMgr.globalConfig;
      }

      var charRowHtml = '<div class="cm-char-slot" data-id="__global__">' +
        '<div class="cm-char-avatar cm-char-all-circle' + (CharMgr.currentTab === 'global' ? ' cm-active' : '') + '"><span class="cm-char-all">ALL</span></div>' +
        '<div class="cm-char-name' + (CharMgr.currentTab === 'global' ? ' cm-active' : '') + '">全局</div></div>';

      chars.forEach(function(c) {
        var isActive = CharMgr.currentTab === 'individual' && CharMgr.selectedCharId === c.id;
        var avatarHtml = c.avatar ? '<img src="' + App.esc(c.avatar) + '">' : '';
        charRowHtml += '<div class="cm-char-slot" data-id="' + c.id + '">' +
          '<div class="cm-char-avatar' + (isActive ? ' cm-active' : '') + '">' + avatarHtml + '</div>' +
          '<div class="cm-char-name' + (isActive ? ' cm-active' : '') + '">' + App.esc(c.name || '?') + '</div></div>';
      });

      var ck = function(key) { return cfg[key] ? ' checked' : ''; };
      var sv = function(key, val) { return cfg[key] === val ? ' selected' : ''; };
      var proManual = cfg.proMode !== 'auto';

      var msgTagsHtml = MSG_TYPES.map(function(t, i) {
        var checked = (cfg.msgTypes && cfg.msgTypes.indexOf(t) >= 0) ? ' checked' : '';
        return '<div class="cm-tag"><input type="checkbox" id="cmMt' + i + '" data-type="' + t + '"' + checked + '><label class="cm-tag-label" for="cmMt' + i + '">' + t + '</label></div>';
      }).join('');

      var momTypesHtml = ['纯文字','图文','转发'].map(function(t, i) {
        var checked = (cfg.momentsTypes && cfg.momentsTypes.indexOf(t) >= 0) ? ' checked' : '';
        return '<div class="cm-tag"><input type="checkbox" id="cmMom' + i + '" data-mtype="' + t + '"' + checked + '><label class="cm-tag-label" for="cmMom' + i + '">' + t + '</label></div>';
      }).join('');

      var apiList = App.LS.get('apiConfigs') || [];
      var apiOptionsHtml = '<option value="">使用全局 API</option>';
      apiList.forEach(function(a) {
        var sel = cfg.apiSelect === a.name ? ' selected' : '';
        apiOptionsHtml += '<option value="' + App.esc(a.name) + '"' + sel + '>' + App.esc(a.name) + ' (' + App.esc(a.model || '') + ')</option>';
      });

      var isIndividual = cfg.apiMode === 'individual';

      page.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;border-bottom:1px solid #eee;">' +
          '<button id="cmBackBtn" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">角色管理</span>' +
          '<div style="width:36px;"></div>' +
        '</div>' +

        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;">' +

          '<div class="cm-char-row">' + charRowHtml + '</div>' +

          '<div class="cm-tab-bar">' +
            '<div class="cm-tab-item' + (CharMgr.currentTab === 'global' ? ' cm-active' : '') + '" data-tab="global">全局设置</div>' +
            '<div class="cm-tab-item' + (CharMgr.currentTab === 'individual' ? ' cm-active' : '') + '" data-tab="individual">个别设置</div>' +
          '</div>' +

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
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">Voice ID</div><input type="text" class="cm-field-input" id="cmMmVoice" placeholder="粘贴 MiniMax Voice ID..." value="' + App.esc(cfg.mmVoiceId||'') + '"></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">API Key <span class="cm-opt">(留空用全局)</span></div><input type="text" class="cm-field-input" id="cmMmKey" placeholder="留空则使用全局 API Key" value="' + App.esc(cfg.mmApiKey||'') + '"></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-sub-label">语速</div><div class="cm-range-wrap"><span class="cm-range-hint">慢</span><input type="range" class="cm-range" id="cmMmSpeed" min="0.5" max="2" step="0.1" value="' + cfg.mmSpeed + '"><span class="cm-range-val" id="cmMmSpeedVal">' + cfg.mmSpeed + 'x</span><span class="cm-range-hint">快</span></div></div>' +
              '<div class="cm-sub-row" style="margin-top:6px"><div class="cm-sub-label">音调</div><div class="cm-range-wrap"><span class="cm-range-hint">低</span><input type="range" class="cm-range" id="cmMmPitch" min="-12" max="12" step="1" value="' + cfg.mmPitch + '"><span class="cm-range-val" id="cmMmPitchVal">' + (cfg.mmPitch>0?'+':'') + cfg.mmPitch + '</span><span class="cm-range-hint">高</span></div></div>' +
            '</div>' +
            '<div class="cm-sep"></div>' +

            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">备用 TTS 引擎</span><span class="cm-sw-desc">MiniMax 不可用时的替代方案</span></div><label class="cm-sw"><input type="checkbox" id="cmFallToggle"' + ck('fallbackTTS') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.fallbackTTS ? ' cm-open' : '') + '" id="cmFallSub">' +
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">TTS 引擎</div><select class="cm-select" id="cmFallEngine"><option>Edge TTS</option><option>系统 Web Speech</option><option>OpenAI TTS</option></select></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">音色</div><select class="cm-select" id="cmFallVoice"><option>zh-CN-XiaoxiaoNeural (女)</option><option>zh-CN-YunxiNeural (男)</option><option>zh-CN-XiaoyiNeural (女)</option><option>zh-CN-YunjianNeural (男)</option></select></div></div>' +
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
              '<div style="display:flex;align-items:center;gap:6px;margin-top:2px">' +
                '<input type="time" class="cm-field-input" id="cmProStart" value="' + App.esc(cfg.proActiveStart) + '" style="width:100px;text-align:center;">' +
                '<span style="font-size:11px;color:#999;font-weight:600;">至</span>' +
                '<input type="time" class="cm-field-input" id="cmProEnd" value="' + App.esc(cfg.proActiveEnd) + '" style="width:100px;text-align:center;">' +
              '</div>' +

              '<div class="cm-sub-label" style="margin-top:10px">消息积极程度</div>' +
              '<div class="cm-radio-row" style="margin-top:4px"><div class="cm-radio-item"><input type="radio" name="cmProMode" id="cmPmA" value="manual"' + (proManual?' checked':'') + '><label class="cm-radio-label" for="cmPmA">手动设定</label></div><div class="cm-radio-item"><input type="radio" name="cmProMode" id="cmPmB" value="auto"' + (!proManual?' checked':'') + '><label class="cm-radio-label" for="cmPmB">角色性格决定</label></div></div>' +
              '<div id="cmProManual" style="margin-top:8px;' + (proManual?'':'display:none;') + '"><div class="cm-range-wrap"><span class="cm-range-hint">佛系</span><input type="range" class="cm-range" id="cmProLevel" min="1" max="5" step="1" value="' + cfg.proLevel + '"><span class="cm-range-val" id="cmProLevelVal">' + PRO_LEVEL_NAMES[cfg.proLevel-1] + '</span><span class="cm-range-hint">粘人</span></div></div>' +
              '<div id="cmProAuto" style="margin-top:8px;' + (!proManual?'':'display:none;') + '"><div class="cm-tip" style="margin:0"><div class="cm-tip-icon">i</div><div class="cm-tip-text">由角色的性格设定自动决定消息频率和主动程度，无需手动调节。</div></div></div>' +
            '</div>' +
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
              '<div class="cm-sub-row"><div class="cm-field"><div class="cm-field-label">生成引擎</div><select class="cm-select" id="cmStkEngine"><option' + sv('stickerEngine','DALL·E 3') + '>DALL·E 3</option><option' + sv('stickerEngine','Stable Diffusion') + '>Stable Diffusion</option><option' + sv('stickerEngine','MidJourney API') + '>MidJourney API</option></select></div></div>' +
              '<div class="cm-sub-row" style="margin-top:8px"><div class="cm-field"><div class="cm-field-label">风格</div><select class="cm-select" id="cmStkStyle"><option>可爱卡通</option><option>写实</option><option>像素风</option><option>手绘</option><option>表情包梗图</option></select></div></div>' +
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
            '<div class="cm-sw-row" style="border-bottom:none"><div class="cm-sw-left"><span class="cm-sw-name">时间 & 天气感知</span><span class="cm-sw-desc">角色知道当前时间和天气并自然融入对话</span></div><label class="cm-sw"><input type="checkbox" id="cmTwToggle"' + ck('timeWeather') + '><div class="cm-sw-track"></div></label></div>' +
            '<div class="cm-sub' + (cfg.timeWeather ? ' cm-open' : '') + '" id="cmTwSub">' +
              '<div class="cm-field-grid" style="gap:10px 14px"><div class="cm-field"><div class="cm-field-label">角色所在城市</div><input type="text" class="cm-field-input" id="cmCharCity" placeholder="如：东京、首尔..." value="' + App.esc(cfg.charCity||'') + '"></div><div class="cm-field"><div class="cm-field-label">你所在的城市</div><input type="text" class="cm-field-input" id="cmUserCity" placeholder="如：深圳、上海..." value="' + App.esc(cfg.userCity||'') + '"></div></div>' +
              '<div class="cm-tip" style="margin-top:10px;margin-bottom:0"><div class="cm-tip-icon">i</div><div class="cm-tip-text">设置不同城市后，角色会感知两地时差和天气差异。</div></div>' +
            '</div>' +
          '</div></div><div class="cm-comic-bar-bot"></div></div>' +

          '<!-- CARD 5 · 高级设定 -->' +
          '<div class="cm-comic"><div class="cm-comic-bar"></div><div class="cm-section"><div class="cm-section-head"><div class="cm-section-title">高级设定</div><div class="cm-section-badge">ADVANCED</div></div><div class="cm-section-body">' +
            '<div class="cm-field" style="margin-bottom:6px"><div class="cm-field-label">API 配置</div><select class="cm-select" id="cmApiMode"><option value="global"' + (cfg.apiMode==='global'?' selected':'') + '>使用全局 API</option><option value="individual"' + (cfg.apiMode==='individual'?' selected':'') + '>为每个角色单独配置</option></select></div>' +
            '<div class="cm-tip"><div class="cm-tip-icon">!</div><div class="cm-tip-text">若为每个角色单独匹配 API，在进行群聊时将会同时消耗多个 API 额度，请谨慎使用。</div></div>' +

            '<div id="cmAdvancedSub" style="' + (isIndividual ? '' : 'display:none;') + '">' +
              '<div class="cm-field" style="margin-bottom:10px"><div class="cm-field-label">选择已保存的 API</div><select class="cm-select" id="cmApiSelect">' + apiOptionsHtml + '</select></div>' +
              '<div class="cm-sep"></div>' +
              '<div class="cm-param"><div class="cm-param-title">Temperature</div><div class="cm-param-desc">角色温度，决定回复更加贴合人设还是更加有创意</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">精确</span><input type="range" class="cm-range" id="cmTemp" min="0" max="2" step="0.05" value="' + cfg.temperature + '"><span class="cm-range-val" id="cmTempVal">' + cfg.temperature + '</span><span class="cm-range-hint">创意</span></div></div></div>' +
              '<div class="cm-param"><div class="cm-param-title">Frequency Penalty</div><div class="cm-param-desc">频率惩罚，数值越高越避免重复使用相同的词汇和表达</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">允许重复</span><input type="range" class="cm-range" id="cmFreq" min="0" max="2" step="0.1" value="' + cfg.freqPenalty + '"><span class="cm-range-val" id="cmFreqVal">' + cfg.freqPenalty + '</span><span class="cm-range-hint">避免重复</span></div></div></div>' +
              '<div class="cm-param"><div class="cm-param-title">Presence Penalty</div><div class="cm-param-desc">存在惩罚，数值越高越鼓励使用新词汇，让表达更加丰富多样</div><div class="cm-param-slider"><div class="cm-range-wrap"><span class="cm-range-hint">保守</span><input type="range" class="cm-range" id="cmPres" min="0" max="2" step="0.1" value="' + cfg.presPenalty + '"><span class="cm-range-val" id="cmPresVal">' + cfg.presPenalty + '</span><span class="cm-range-hint">创新</span></div></div></div>' +
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
      var biStyleEl = page.querySelector('input[name="cmBiStyle"]:checked');
      var proModeEl = page.querySelector('input[name="cmProMode"]:checked');

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
        fallbackEngine: gv('cmFallEngine') || 'Edge TTS',
        fallbackVoice: gv('cmFallVoice') || '',
        proactive: gc('cmProToggle'),
        proMinInterval: parseInt(gv('cmProMin') || 15),
        proMaxInterval: parseInt(gv('cmProMax') || 120),
        proActiveStart: gv('cmProStart') || '08:00',
        proActiveEnd: gv('cmProEnd') || '23:30',
        proMode: proModeEl ? proModeEl.value : 'manual',
        proLevel: parseInt(gv('cmProLevel') || 3),
        replySpeed: gv('cmReplySpeed') || '正常（3-8秒）',
        showTyping: gv('cmShowTyping') === '显示',
        msgTypes: msgTypes,
        stickerGen: gc('cmStkToggle'),
        stickerEngine: gv('cmStkEngine') || 'DALL·E 3',
        stickerStyle: gv('cmStkStyle') || '可爱卡通',
        stickerFreq: parseInt(gv('cmStkFreq') || 2),
        moments: gc('cmMomToggle'),
        momentsMax: parseInt(gv('cmMomMax') || 2),
        momentsTypes: momTypes,
        momentsImg: gv('cmMomImg') || 'AI 生成',
        timeWeather: gc('cmTwToggle'),
        charCity: gv('cmCharCity'),
        userCity: gv('cmUserCity'),
        apiMode: gv('cmApiMode') || 'global',
        apiSelect: gv('cmApiSelect') || '',
        temperature: parseFloat(gv('cmTemp') || 0.8),
        freqPenalty: parseFloat(gv('cmFreq') || 0.3),
        presPenalty: parseFloat(gv('cmPres') || 0.3)
      };
    },

    bindEvents: function(page) {
      page.querySelector('#cmBackBtn').addEventListener('click', function() { CharMgr.close(); });

      page.querySelectorAll('.cm-char-slot').forEach(function(slot) {
        slot.addEventListener('click', function() {
          var id = slot.dataset.id;
          if (id === '__global__') { CharMgr.currentTab = 'global'; CharMgr.selectedCharId = null; }
          else { CharMgr.currentTab = 'individual'; CharMgr.selectedCharId = id; }
          CharMgr.render(page);
        });
      });

      page.querySelectorAll('.cm-tab-item').forEach(function(tab) {
        tab.addEventListener('click', function() {
          if (tab.dataset.tab === 'global') { CharMgr.currentTab = 'global'; CharMgr.selectedCharId = null; }
          else {
            CharMgr.currentTab = 'individual';
            var chars = App.character ? App.character.list : [];
            if (!CharMgr.selectedCharId && chars.length) CharMgr.selectedCharId = chars[0].id;
            if (!CharMgr.selectedCharId) { App.showToast('请先创建角色'); return; }
          }
          CharMgr.render(page);
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

      page.querySelectorAll('input[name="cmProMode"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
          var m = page.querySelector('#cmProManual');
          var a = page.querySelector('#cmProAuto');
          if (this.value === 'manual') { if (m) m.style.display = ''; if (a) a.style.display = 'none'; }
          else { if (m) m.style.display = 'none'; if (a) a.style.display = ''; }
        });
      });

      // API 模式切换
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

      // 保存
      page.querySelector('#cmSaveBtn').addEventListener('click', function() {
        var data = CharMgr.collectConfig(page);
        if (CharMgr.currentTab === 'global') {
          CharMgr.globalConfig = data;
        } else if (CharMgr.selectedCharId) {
          CharMgr.charConfigs[CharMgr.selectedCharId] = data;
        }
        CharMgr.save();
        App.showToast('设置已保存');
      });
    },

    init: function() {
      CharMgr.load();
      App.charMgr = CharMgr;
    }
  };

  App.register('charMgr', CharMgr);
})();
