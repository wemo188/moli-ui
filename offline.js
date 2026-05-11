(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var SPLIT = '|||';

  var DEFAULT_CONFIG = {
    mode: 'dialogue',       // 'dialogue' 对话体 | 'narrative' 叙事体
    wordCount: 800,          // 叙事体目标字数
    narrativeMin: 300,
    narrativeMax: 3000
  };

  /* 对话体格式规则 */
  function buildDialogueRules(charData, userName, callName, cfg) {
    return '你正在与「' + callName + '」进行面对面的实时互动。这是线下见面场景。\n\n' +
      '【角色】你是「' + (charData.name || '角色') + '」。\n\n' +
      '【格式规则 - 对话体】\n' +
      '1. 每条消息是角色说的一句话或一个动作。\n' +
      '2. 说的话直接写，不加引号。\n' +
      '3. 动作、表情、心理用圆括号包裹：（轻轻歪了歪头）\n' +
      '4. 一条消息可以混合文字和动作：（抬眸看你）怎么了？\n' +
      '5. 多条消息用 ' + SPLIT + ' 分隔。\n' +
      '6. 每次回复 1-4 条消息。\n' +
      '7. 保持口语化、自然，像面对面说话。\n' +
      '8. 可以描写细微的肢体语言和微表情。\n\n' +
      '【示例】\n' +
      '（懒洋洋地靠在沙发上，眼皮都没抬）' + SPLIT + '嗯？你说' + SPLIT + '（听完后突然坐直了，眼睛亮了一下）真的吗';
  }

  /* 叙事体格式规则 */
  function buildNarrativeRules(charData, userName, callName, cfg) {
    var wordCount = cfg.wordCount || 800;
    return '你正在与「' + callName + '」进行面对面的互动。你需要以第三人称小说视角来描写这个场景。\n\n' +
      '【角色】你扮演的是「' + (charData.name || '角色') + '」，但叙述视角是第三人称。\n\n' +
      '【格式规则 - 叙事体】\n' +
      '1. 使用第三人称小说叙事。\n' +
      '2. 「' + callName + '」用"你"来指代（第二人称）。\n' +
      '3. 「' + (charData.name || '角色') + '」用名字或"他/她"指代。\n' +
      '4. 对话用「」包裹。\n' +
      '5. 需要描写：对话、动作、神态、心理活动、环境氛围、感官细节。\n' +
      '6. 目标字数：约 ' + wordCount + ' 字。这是硬性要求，不要明显少于这个字数。\n' +
      '7. 直接输出叙事内容，整段输出，不要用 ' + SPLIT + ' 分隔。\n' +
      '8. 不要输出 OOC 说明，不要在开头写场景标题。\n' +
      '9. 节奏张弛有度，细腻处慢写，平淡处快写。\n' +
      '10. 结尾留有余地，方便用户接续。\n\n' +
      '【风格参考】\n' +
      '成熟网文/轻小说的细腻笔触，注重画面感和情绪渲染。\n' +
      '避免过度华丽的辞藻堆砌，用精准的细节代替空洞的形容词。';
  }

  var Offline = {
    charId: null,
    charData: null,
    messages: [],
    isStreaming: false,
    abortCtrl: null,
    _pageEl: null,
    _streamPartial: '',
    _config: null,

    getConfig: function(charId) {
      var saved = App.LS.get('offlineConfig_' + charId);
      return saved || JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    },

    saveConfig: function(charId, cfg) {
      App.LS.set('offlineConfig_' + charId, cfg);
    },

    getStorageKey: function(charId) {
      return 'chatMsgs_offline_' + charId;
    },

    loadMsgs: function() {
      Offline.messages = App.LS.get(Offline.getStorageKey(Offline.charId)) || [];
    },

    saveMsgs: function() {
      try {
        App.LS.set(Offline.getStorageKey(Offline.charId), Offline.messages);
      } catch (e) {
        if (Offline.messages.length > 20) {
          Offline.messages = Offline.messages.slice(-20);
          try { App.LS.set(Offline.getStorageKey(Offline.charId), Offline.messages); } catch (e2) {}
        }
      }
    },

    /* 打开线下页面 */
    open: function(charId) {
      if (!charId) return;
      if (!App.character) return;
      var c = App.character.getById(charId);
      if (!c) { App.showToast('角色不存在'); return; }

      Offline.charId = charId;
      Offline.charData = c;
      Offline._config = Offline.getConfig(charId);
      Offline.loadMsgs();

      var old = document.querySelector('#offlinePage');
      if (old) old.remove();

      var page = document.createElement('div');
      page.id = 'offlinePage';
      page.className = 'fullpage-panel hidden';
      document.body.appendChild(page);
      Offline._pageEl = page;

      Offline.renderPage();

      page.classList.remove('hidden');
      requestAnimationFrame(function() { page.classList.add('show'); });
      App.bindSwipeBack(page, function() { Offline.close(); });
    },

    close: function() {
      if (Offline.isStreaming && Offline.abortCtrl) {
        Offline.abortCtrl.abort();
        Offline.abortCtrl = null;
        Offline.isStreaming = false;
      }
      var p = Offline._pageEl;
      if (!p) return;
      p.classList.remove('show');
      setTimeout(function() { if (p.parentNode) p.remove(); Offline._pageEl = null; }, 350);
    },

    renderPage: function() {
      var page = Offline._pageEl;
      if (!page) return;
      var c = Offline.charData;
      var cfg = Offline._config;

      var modeLabel = cfg.mode === 'narrative' ? '叙事体' : '对话体';
      var avatarHtml = c.avatar
        ? '<img src="' + App.escAttr(c.avatar) + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">'
        : '';

      page.innerHTML =
        '<div class="ofl-header">' +
          '<button class="ofl-back" id="oflBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<div class="ofl-header-center">' +
            avatarHtml +
            '<div class="ofl-header-info">' +
              '<div class="ofl-header-name">' + App.esc(c.name || '未命名') + '</div>' +
              '<div class="ofl-header-mode" id="oflModeBtn">' + modeLabel + ' ▾</div>' +
            '</div>' +
          '</div>' +
          '<button class="ofl-menu-btn" id="oflMenuBtn" type="button"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></button>' +
        '</div>' +

        '<div class="ofl-body" id="oflBody"></div>' +

        (cfg.mode === 'narrative'
          ? '<div class="ofl-word-bar" id="oflWordBar">' +
              '<span class="ofl-word-label">字数</span>' +
              '<input type="range" class="ofl-word-slider" id="oflWordSlider" min="' + cfg.narrativeMin + '" max="' + cfg.narrativeMax + '" step="100" value="' + cfg.wordCount + '">' +
              '<span class="ofl-word-val" id="oflWordVal">' + cfg.wordCount + '</span>' +
            '</div>'
          : '') +

        '<div class="ofl-input-bar">' +
          '<div class="ofl-input-wrap">' +
            '<textarea class="ofl-input" id="oflInput" placeholder="描述你的动作或对话..." rows="1"></textarea>' +
          '</div>' +
          '<button class="ofl-send-btn" id="oflSendBtn" type="button">' +
            (Offline.isStreaming
              ? '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>'
              : '<svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>') +
          '</button>' +
        '</div>';

      Offline.renderMessages();
      Offline.bindEvents();
    },

    renderMessages: function() {
      var body = Offline._pageEl ? Offline._pageEl.querySelector('#oflBody') : null;
      if (!body) return;
      var cfg = Offline._config;

      if (!Offline.messages.length) {
        body.innerHTML = '<div class="ofl-empty">开始你们的故事</div>';
        if (Offline.isStreaming) {
          body.innerHTML += '<div class="ofl-msg ofl-msg-ai"><div class="ofl-bubble ofl-bubble-ai" id="oflStreamBubble"><span class="ofl-typing-dot"></span><span class="ofl-typing-dot"></span><span class="ofl-typing-dot"></span></div></div>';
        }
        Offline.scrollBottom();
        return;
      }

      var html = '';

      Offline.messages.forEach(function(m, idx) {
        if (m.role === 'user') {
          html += '<div class="ofl-msg ofl-msg-user" data-idx="' + idx + '">' +
            '<div class="ofl-bubble ofl-bubble-user">' + Offline.formatContent(m.content, 'user') + '</div>' +
          '</div>';
        } else {
          if (cfg.mode === 'narrative') {
            html += '<div class="ofl-msg ofl-msg-narrative" data-idx="' + idx + '">' +
              '<div class="ofl-narrative-block">' + Offline.formatNarrative(m.content) + '</div>' +
            '</div>';
          } else {
            html += '<div class="ofl-msg ofl-msg-ai" data-idx="' + idx + '">' +
              '<div class="ofl-bubble ofl-bubble-ai">' + Offline.formatContent(m.content, 'ai') + '</div>' +
            '</div>';
          }
        }
      });

      if (Offline.isStreaming) {
        if (cfg.mode === 'narrative') {
          html += '<div class="ofl-msg ofl-msg-narrative"><div class="ofl-narrative-block" id="oflStreamBubble"><span class="ofl-typing-dot"></span><span class="ofl-typing-dot"></span><span class="ofl-typing-dot"></span></div></div>';
        } else {
          html += '<div class="ofl-msg ofl-msg-ai"><div class="ofl-bubble ofl-bubble-ai" id="oflStreamBubble"><span class="ofl-typing-dot"></span><span class="ofl-typing-dot"></span><span class="ofl-typing-dot"></span></div></div>';
        }
      }

      body.innerHTML = html;
      Offline.scrollBottom();
      Offline.bindMsgEvents();
    },

    formatContent: function(text, who) {
      text = App.esc(text || '');
      /* 括号内容高亮为动作 */
      text = text.replace(/[（(]([^）)]+)[）)]/g, '<span class="ofl-action">（$1）</span>');
      text = text.replace(/\n/g, '<br>');
      return text;
    },

    formatNarrative: function(text) {
      text = App.esc(text || '');
      /* 「对话」高亮 */
      text = text.replace(/「([^」]+)」/g, '<span class="ofl-dialogue">「$1」</span>');
      /* 段落 */
      text = text.replace(/\n\s*\n/g, '</p><p>');
      text = text.replace(/\n/g, '<br>');
      return '<p>' + text + '</p>';
    },

    scrollBottom: function() {
      var body = Offline._pageEl ? Offline._pageEl.querySelector('#oflBody') : null;
      if (body) requestAnimationFrame(function() { body.scrollTop = body.scrollHeight; });
    },

    bindEvents: function() {
      var page = Offline._pageEl;
      if (!page) return;

      page.querySelector('#oflBack').addEventListener('click', function() { Offline.close(); });

      page.querySelector('#oflModeBtn').addEventListener('click', function() { Offline.showModePicker(); });
      page.querySelector('#oflMenuBtn').addEventListener('click', function() { Offline.showMenu(); });

      /* 字数滑块 */
      var slider = page.querySelector('#oflWordSlider');
      var valEl = page.querySelector('#oflWordVal');
      if (slider && valEl) {
        slider.addEventListener('input', function() {
          var v = parseInt(this.value);
          valEl.textContent = v;
          Offline._config.wordCount = v;
          Offline.saveConfig(Offline.charId, Offline._config);
        });
      }

      /* 发送 */
      var sendBtn = page.querySelector('#oflSendBtn');
      var input = page.querySelector('#oflInput');

      sendBtn.addEventListener('click', function() {
        if (Offline.isStreaming) { Offline.stopStream(); return; }
        var text = input.value.trim();
        if (!text) return;
        input.value = '';
        input.style.height = 'auto';

        Offline.messages.push({ role: 'user', content: text, ts: Date.now() });
        Offline.saveMsgs();
        Offline.renderMessages();
        Offline.requestAI();
      });

      /* 自动高度 */
      input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });

      /* Enter 发送 */
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendBtn.click();
        }
      });
    },

    bindMsgEvents: function() {
      var page = Offline._pageEl;
      if (!page) return;

      page.querySelectorAll('.ofl-msg').forEach(function(el) {
        var timer = null, pressed = false;
        el.addEventListener('touchstart', function(e) {
          pressed = false;
          timer = setTimeout(function() {
            pressed = true;
            var idx = parseInt(el.dataset.idx);
            if (!isNaN(idx)) Offline.showMsgMenu(idx, e.touches[0].clientX, e.touches[0].clientY);
          }, 500);
        }, { passive: true });
        el.addEventListener('touchmove', function() { clearTimeout(timer); }, { passive: true });
        el.addEventListener('touchend', function(e) {
          clearTimeout(timer);
          if (pressed) e.preventDefault();
        }, { passive: false });
      });
    },

    showModePicker: function() {
      var old = document.querySelector('#oflModePicker');
      if (old) { old.remove(); return; }

      var picker = document.createElement('div');
      picker.id = 'oflModePicker';
      picker.className = 'pc-edit-overlay';
      picker.style.zIndex = '100020';

      var cfg = Offline._config;

      picker.innerHTML =
        '<div class="pc-edit-panel" style="width:280px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">' +
          '<div class="pc-header">线下模式<div class="pc-close-btn" id="oflModeClose">×</div></div>' +
          '<div class="pc-body">' +
            '<div class="ofl-mode-card' + (cfg.mode === 'dialogue' ? ' active' : '') + '" data-mode="dialogue">' +
              '<div class="ofl-mode-title">💬 对话体</div>' +
              '<div class="ofl-mode-desc">多条短消息，括号包裹动作描写。像面对面聊天，但比微信更有画面感。</div>' +
            '</div>' +
            '<div class="ofl-mode-card' + (cfg.mode === 'narrative' ? ' active' : '') + '" data-mode="narrative">' +
              '<div class="ofl-mode-title">📖 叙事体</div>' +
              '<div class="ofl-mode-desc">第三人称长文小说，自定义字数。细腻描写动作、神态、心理、环境。</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(picker);
      picker.addEventListener('click', function(e) { if (e.target === picker) picker.remove(); });
      picker.querySelector('#oflModeClose').addEventListener('click', function() { picker.remove(); });

      picker.querySelectorAll('.ofl-mode-card').forEach(function(card) {
        card.addEventListener('click', function() {
          var mode = card.dataset.mode;
          Offline._config.mode = mode;
          Offline.saveConfig(Offline.charId, Offline._config);
          picker.remove();
          Offline.renderPage();
          App.showToast(mode === 'narrative' ? '已切换叙事体' : '已切换对话体');
        });
      });
    },

    showMenu: function() {
      var old = document.querySelector('#oflMenuOverlay');
      if (old) { old.remove(); return; }

      var overlay = document.createElement('div');
      overlay.id = 'oflMenuOverlay';
      overlay.className = 'pc-edit-overlay';
      overlay.style.zIndex = '100020';

      overlay.innerHTML =
        '<div class="pc-edit-panel" style="width:240px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">' +
          '<div class="pc-header">菜单<div class="pc-close-btn" id="oflMenuClose">×</div></div>' +
          '<div class="pc-body" style="gap:6px;">' +
            '<button class="pc-btn pc-btn-save" id="oflMenuScene" type="button" style="padding:11px;">设置场景</button>' +
            '<button class="pc-btn pc-btn-save" id="oflMenuMemory" type="button" style="padding:11px;">记忆管理</button>' +
            '<button class="pc-btn pc-btn-cancel" id="oflMenuClear" type="button" style="padding:11px;color:#c9706b;">清空对话</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector('#oflMenuClose').addEventListener('click', function() { overlay.remove(); });

      overlay.querySelector('#oflMenuScene').addEventListener('click', function() {
        overlay.remove();
        Offline.showSceneDialog();
      });

      overlay.querySelector('#oflMenuMemory').addEventListener('click', function() {
        overlay.remove();
        if (App.memory) App.memory.open(Offline.charId);
      });

      overlay.querySelector('#oflMenuClear').addEventListener('click', function() {
        if (!confirm('确定清空所有线下对话？')) return;
        Offline.messages = [];
        Offline.saveMsgs();
        overlay.remove();
        Offline.renderMessages();
        App.showToast('已清空');
      });
    },

    showSceneDialog: function() {
      var old = document.querySelector('#oflSceneOverlay');
      if (old) old.remove();

      var sceneKey = 'offlineScene_' + Offline.charId;
      var currentScene = App.LS.get(sceneKey) || '';

      var overlay = document.createElement('div');
      overlay.id = 'oflSceneOverlay';
      overlay.className = 'pc-edit-overlay';
      overlay.style.zIndex = '100020';

      overlay.innerHTML =
        '<div class="pc-edit-panel" style="width:300px;max-height:400px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">' +
          '<div class="pc-header">场景设定<div class="pc-close-btn" id="oflSceneClose">×</div></div>' +
          '<div class="pc-body">' +
            '<div class="pc-group">' +
              '<label class="pc-label">当前场景 / 背景描述</label>' +
              '<textarea class="pc-input" id="oflSceneTA" style="min-height:100px;resize:vertical;" placeholder="描述当前的时间、地点、氛围...">' + App.esc(currentScene) + '</textarea>' +
            '</div>' +
          '</div>' +
          '<div class="pc-footer">' +
            '<button class="pc-btn pc-btn-save" id="oflSceneSave" type="button">保存</button>' +
            '<button class="pc-btn pc-btn-cancel" id="oflSceneCancel" type="button">取消</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector('#oflSceneClose').addEventListener('click', function() { overlay.remove(); });
      overlay.querySelector('#oflSceneCancel').addEventListener('click', function() { overlay.remove(); });
      overlay.querySelector('#oflSceneSave').addEventListener('click', function() {
        var text = overlay.querySelector('#oflSceneTA').value.trim();
        if (text) App.LS.set(sceneKey, text);
        else App.LS.remove(sceneKey);
        overlay.remove();
        App.showToast('场景已保存');
      });
    },

    showMsgMenu: function(idx, x, y) {
      var old = document.querySelector('#oflMsgMenu');
      if (old) old.remove();

      var m = Offline.messages[idx];
      if (!m) return;

      var menu = document.createElement('div');
      menu.id = 'oflMsgMenu';
      menu.className = 'ofl-ctx-menu';
      menu.style.left = Math.min(x, window.innerWidth - 150) + 'px';
      menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';

      var items = '<div class="ofl-ctx-item" data-act="copy">复制</div>';
      if (m.role === 'user') {
        items += '<div class="ofl-ctx-item" data-act="edit">编辑</div>';
        items += '<div class="ofl-ctx-item" data-act="resend">重发</div>';
      } else {
        items += '<div class="ofl-ctx-item" data-act="regen">重新生成</div>';
      }
      items += '<div class="ofl-ctx-item" data-act="delete">删除</div>';
      items += '<div class="ofl-ctx-item danger" data-act="deleteAfter">删除此条及之后</div>';
      menu.innerHTML = items;

      document.body.appendChild(menu);

      menu.querySelectorAll('.ofl-ctx-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var act = item.dataset.act;
          menu.remove();

          if (act === 'copy') {
            App.copyText(m.content).then(function() { App.showToast('已复制'); });
          }
          if (act === 'delete') {
            Offline.messages.splice(idx, 1);
            Offline.saveMsgs();
            Offline.renderMessages();
          }
          if (act === 'deleteAfter') {
            if (!confirm('删除此条及之后所有消息？')) return;
            Offline.messages.splice(idx);
            Offline.saveMsgs();
            Offline.renderMessages();
          }
          if (act === 'edit') {
            var newText = prompt('编辑消息：', m.content);
            if (newText === null) return;
            Offline.messages[idx].content = newText.trim();
            Offline.saveMsgs();
            Offline.renderMessages();
          }
          if (act === 'resend') {
            var content = m.content;
            Offline.messages.splice(idx);
            Offline.messages.push({ role: 'user', content: content, ts: Date.now() });
            Offline.saveMsgs();
            Offline.renderMessages();
            Offline.requestAI();
          }
          if (act === 'regen') {
            Offline.messages.splice(idx);
            Offline.saveMsgs();
            Offline.renderMessages();
            Offline.requestAI();
          }
        });
      });

      function dismiss(ev) {
        if (menu.parentNode && !menu.contains(ev.target)) {
          menu.remove();
          document.removeEventListener('touchstart', dismiss);
          document.removeEventListener('click', dismiss);
        }
      }
      setTimeout(function() {
        document.addEventListener('touchstart', dismiss, { passive: true });
        document.addEventListener('click', dismiss);
      }, 100);
    },

    /* ==================== AI 请求 ==================== */

    requestAI: function() {
      var cfg = Offline._config;
      var charId = Offline.charId;
      var charData = Offline.charData;

      /* 获取 API（复用 chat 的逻辑） */
      var api = null;
      if (App.chat && App.chat._utils) {
        var getCfg = App.chat._utils.getCfg;
        var charCfg = getCfg(charId);
        if (charCfg.apiMode === 'individual' && charCfg.apiSelect) {
          var list = App.LS.get('apiConfigs') || [];
          for (var i = 0; i < list.length; i++) { if (list[i].name === charCfg.apiSelect) { api = list[i]; break; } }
        }
      }
      if (!api) api = App.api ? App.api.getActiveConfig() : null;
      if (!api) { App.showToast('请先配置 API'); return; }

      var user = App.user ? App.user.getActiveUser() : null;
      var userName = (user && (user.nickname || user.realName)) || '对方';
      var callName = charData.callName || userName;

      /* 构建消息 */
      var apiMsgs = [];

      /* 系统消息 */
      var sysParts = [];

      /* 格式规则 */
      if (cfg.mode === 'narrative') {
        sysParts.push(buildNarrativeRules(charData, userName, callName, cfg));
      } else {
        sysParts.push(buildDialogueRules(charData, userName, callName, cfg));
      }

      /* 角色信息 */
      if (charData.profile) sysParts.push('【角色设定】\n' + charData.profile);

      /* 用户信息 */
      if (user) {
        var ui = '';
        if (user.realName || user.nickname) ui += '名字：' + (user.nickname || user.realName) + '\n';
        if (user.gender) ui += '性别：' + user.gender + '\n';
        if (user.bio) ui += '简介：' + user.bio + '\n';
        if (ui) sysParts.push('【对方信息】\n' + ui);
      }

      /* 记忆 */
      if (App.memory) {
        var memText = App.memory.buildMemoryText(charId);
        if (memText) sysParts.push('【记忆】\n' + memText);
      }

      /* 场景 */
      var scene = App.LS.get('offlineScene_' + charId) || '';
      if (scene) sysParts.push('【当前场景】\n' + scene);

      /* 世界书 */
      if (App.worldbook) {
        var wb = App.worldbook.getEntriesForChar(charId);
        if (wb && wb.length) {
          var wbText = [];
          wb.forEach(function(e) {
            if (e.enabled !== false && e.content) wbText.push(e.content);
          });
          if (wbText.length) sysParts.push('【世界书】\n' + wbText.join('\n'));
        }
      }

      /* 后置指令 */
      if (charData.postInstruction) sysParts.push('【后置指令】\n' + charData.postInstruction);

      /* 预设 */
      var preset = null;
      if (App.preset) {
        var presetList = App.LS.get('presetList') || [];
        for (var j = 0; j < presetList.length; j++) {
          if (presetList[j].enabled === true) { preset = presetList[j]; break; }
        }
      }
      if (preset && preset.items) {
        preset.items.forEach(function(it) {
          if (it.enabled === false || it.active === false) return;
          if (it.content) sysParts.push('【' + (it.name || '指令') + '】\n' + it.content);
        });
      }

      apiMsgs.push({ role: 'system', content: sysParts.join('\n\n') });

      /* 历史消息 */
      var ctx = Offline.messages.slice(-30);
      ctx.forEach(function(m) {
        if (m.role === 'user' || m.role === 'assistant') {
          apiMsgs.push({ role: m.role, content: m.content });
        }
      });

      /* 参数 */
      var params = App.api ? App.api.getParams() : { temperature: 0.8, freqPenalty: 0.3, presPenalty: 0.3 };

      /* 请求 */
      Offline.isStreaming = true;
      Offline._streamPartial = '';
      Offline.renderMessages();
      Offline.updateSendBtn();

      var url = api.url.replace(/\/+$/, '') + '/chat/completions';
      Offline.abortCtrl = new AbortController();
      var fullText = '';

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api.key },
        body: JSON.stringify({
          model: api.model, messages: apiMsgs, stream: true,
          temperature: params.temperature,
          frequency_penalty: params.freqPenalty,
          presence_penalty: params.presPenalty
        }),
        signal: Offline.abortCtrl.signal
      }).then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        var reader = resp.body.getReader(), decoder = new TextDecoder(), buffer = '';

        function read() {
          return reader.read().then(function(result) {
            if (result.done) { Offline.onDone(fullText); return; }
            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split('\n'); buffer = lines.pop() || '';

            for (var i = 0; i < lines.length; i++) {
              var line = lines[i].trim();
              if (!line || !line.startsWith('data:')) continue;
              var data = line.slice(5).trim();
              if (data === '[DONE]') { Offline.onDone(fullText); return; }
              if (!data) continue;
              try {
                var json = JSON.parse(data);
                var delta = json.choices && json.choices[0] && json.choices[0].delta;
                if (delta && delta.content) {
                  fullText += delta.content;
                  Offline._streamPartial = fullText;
                  Offline.updateStreamBubble(fullText);
                }
              } catch (e) {}
            }
            return read();
          });
        }
        return read();
      }).catch(function(err) {
        Offline.isStreaming = false;
        Offline.updateSendBtn();
        if (err.name === 'AbortError') return;
        App.showToast(err.message || '请求失败');
        if (fullText) Offline.onDone(fullText);
      });
    },

    updateStreamBubble: function(text) {
      var bubble = Offline._pageEl ? Offline._pageEl.querySelector('#oflStreamBubble') : null;
      if (!bubble) return;
      var cfg = Offline._config;

      if (cfg.mode === 'narrative') {
        bubble.innerHTML = Offline.formatNarrative(text);
      } else {
        var parts = text.split(SPLIT);
        var lastPart = parts[parts.length - 1] || '';
        bubble.innerHTML = Offline.formatContent(lastPart.trim(), 'ai') ||
          '<span class="ofl-typing-dot"></span><span class="ofl-typing-dot"></span><span class="ofl-typing-dot"></span>';
      }
      Offline.scrollBottom();
    },

    onDone: function(text) {
      Offline.isStreaming = false;
      Offline.abortCtrl = null;
      text = (text || '').trim();
      if (!text) { Offline.renderMessages(); Offline.updateSendBtn(); return; }

      var cfg = Offline._config;
      var now = Date.now();

      if (cfg.mode === 'narrative') {
        /* 叙事体：整段存一条 */
        Offline.messages.push({ role: 'assistant', content: text, ts: now });
      } else {
        /* 对话体：按 ||| 拆分 */
        var parts = text.split(SPLIT).map(function(t) { return t.trim(); }).filter(Boolean);
        if (!parts.length) parts = [text];
        parts.forEach(function(part, i) {
          Offline.messages.push({ role: 'assistant', content: part, ts: now + i * 1000 });
        });
      }

      Offline.saveMsgs();
      Offline.renderMessages();
      Offline.updateSendBtn();
    },

    stopStream: function() {
      if (Offline.abortCtrl) { Offline.abortCtrl.abort(); Offline.abortCtrl = null; }
      var partial = Offline._streamPartial || '';
      Offline.isStreaming = false;
      if (partial) Offline.onDone(partial);
      else { Offline.renderMessages(); Offline.updateSendBtn(); }
    },

    updateSendBtn: function() {
      var btn = Offline._pageEl ? Offline._pageEl.querySelector('#oflSendBtn') : null;
      if (!btn) return;
      if (Offline.isStreaming) {
        btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
        btn.classList.add('streaming');
      } else {
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>';
        btn.classList.remove('streaming');
      }
    },

    /* ==================== 角色选择入口 ==================== */

    openCharPicker: function() {
      var chars = App.character ? App.character.list : [];
      if (!chars || !chars.length) { App.showToast('请先添加角色'); return; }

      var old = document.querySelector('#oflCharPicker');
      if (old) old.remove();

      var picker = document.createElement('div');
      picker.id = 'oflCharPicker';
      picker.style.cssText = 'position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);';

      var listHtml = chars.map(function(c) {
        var avHtml = c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">'
          : '<div style="width:36px;height:36px;border-radius:50%;background:rgba(126,163,201,.15);display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#adcdea;stroke-width:1.8;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        var offlineMsgs = App.LS.get('chatMsgs_offline_' + c.id) || [];
        var countStr = offlineMsgs.length ? offlineMsgs.length + ' 条记录' : '暂无记录';
        return '<div class="ofl-pick-char" data-cid="' + c.id + '" style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.04);-webkit-tap-highlight-color:transparent;">' +
          avHtml +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:14px;font-weight:600;color:#2e4258;">' + App.esc(c.name || '未命名') + '</div>' +
            '<div style="font-size:11px;color:#8aa0b8;margin-top:2px;">' + countStr + '</div>' +
          '</div>' +
          '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:#ccc;stroke-width:2;flex-shrink:0;"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>';
      }).join('');

      picker.innerHTML =
        '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:16px;padding:16px 0;width:280px;max-height:70vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);">' +
          '<div style="font-size:14px;font-weight:700;color:#2e4258;text-align:center;padding:0 16px 12px;border-bottom:1px solid rgba(0,0,0,.04);">线下 · 选择角色</div>' +
          listHtml +
          '<div style="text-align:center;padding:12px;">' +
            '<button type="button" id="oflPickCancel" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:inherit;">取消</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(picker);
      picker.addEventListener('click', function(e) { if (e.target === picker) picker.remove(); });
      picker.querySelector('#oflPickCancel').addEventListener('click', function() { picker.remove(); });

      picker.querySelectorAll('.ofl-pick-char').forEach(function(el) {
        el.addEventListener('click', function() {
          picker.remove();
          Offline.open(el.dataset.cid);
        });
      });
    },

    init: function() {
      App.offline = Offline;

      /* 绑定底部栏 */
      App.safeOn('#dockCheck', 'click', function() { Offline.openCharPicker(); });
    }
  };

  App.register('offline', Offline);
})();
