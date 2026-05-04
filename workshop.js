
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var PG0_W = 280, PG1_W = 280;

  function tkBlack(action, cn, en) {
    return '<div class="bm-tk" data-action="' + action + '"><div class="bm-tk-body"><div class="bm-tk-inner"></div><span class="bm-tk-spade">♠</span><div class="bm-tk-text">' + cn + '</div><div class="bm-tk-line"></div><div class="bm-tk-sub">' + en + '</div></div></div>';
  }

  function tkWhite(action, cn, en) {
    return '<div class="bm-wk" data-action="' + action + '"><div class="bm-wk-body"><div class="bm-wk-inner"></div><span class="bm-wk-spade">♠</span><div class="bm-wk-text">' + cn + '</div><div class="bm-wk-line"></div><div class="bm-wk-sub">' + en + '</div></div></div>';
  }

  var Workshop = {
    menuEl: null,
    sliderEl: null,
    currentPage: 0,
    isOpen: false,
    pages: [],
    _touch: null,

    getPageWidth: function(idx) { return idx === 0 ? PG0_W : PG1_W; },

    getPageOffset: function(idx) {
      var o = 0;
      for (var i = 0; i < idx; i++) o += Workshop.getPageWidth(i);
      return o;
    },

    createMenu: function() {
      if (Workshop.menuEl) return;

      var menu = document.createElement('div');
      menu.id = 'ballCardMenu';
      menu.className = 'ball-card-menu';

      menu.innerHTML =
        '<div class="ball-card-slider" id="ballCardSlider">' +

          '<div class="ball-card-page" data-page="0" style="width:' + PG0_W + 'px">' +
            '<div class="bm-card">' +
              '<div class="bm-title">悬浮助手</div>' +
              '<div class="bm-grid">' +
                tkBlack('api', 'API', 'config') +
                tkBlack('workshop', '工坊', 'studio') +
                tkBlack('character', '角色', 'role') +
                tkBlack('preset', '预设', 'preset') +
                tkBlack('worldbook', '世界书', 'lore') +
                tkBlack('memory', '记忆', 'memory') +
                tkBlack('data', '数据', 'data') +
                tkBlack('console', '控制台', 'console') +
                tkBlack('promptlog', '日志', 'prompt') +
              '</div>' +
              '<div class="bm-bottom-line"></div>' +
            '</div>' +
          '</div>' +

          '<div class="ball-card-page" data-page="1" style="width:' + PG1_W + 'px">' +
            '<div class="bm-card">' +
              '<div class="bm-title">美化工坊</div>' +
              '<div class="bm-grid">' +
                tkWhite('theme', '主题', 'theme') +
                tkWhite('font', '字体', 'font') +
                tkWhite('bg', '背景', 'image') +
                tkWhite('ballset', '悬浮球', 'float') +
                tkWhite('resetLayout', '恢复', 'reset') +
              '</div>' +
              '<div class="bm-bottom-line"></div>' +
            '</div>' +
          '</div>' +

        '</div>';

      document.body.appendChild(menu);
      Workshop.menuEl = menu;
      Workshop.sliderEl = menu.querySelector('#ballCardSlider');
      Workshop.pages = menu.querySelectorAll('.ball-card-page');

      Workshop.bindMenuEvents();
      Workshop.bindSwipe();
    },

    bindMenuEvents: function() {
      var menu = Workshop.menuEl;

      menu.querySelectorAll('.bm-tk').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;
          if (action === 'workshop') { Workshop.goToPage(1); return; }
          if (action === 'api') { Workshop.close(); setTimeout(function() { if (App.api) App.api.open(); }, 220); return; }
          if (action === 'character') { Workshop.close(); setTimeout(function() { if (App.charMgr) App.charMgr.open(); }, 220); return; }
          if (action === 'preset') { Workshop.close(); setTimeout(function() { if (App.preset) App.preset.open(); }, 220); return; }
          if (action === 'worldbook') { Workshop.close(); setTimeout(function() { if (App.worldbook) App.worldbook.open(); }, 220); return; }
          if (action === 'memory') { App.showToast('记忆功能开发中'); return; }
          if (action === 'data') { Workshop.close(); setTimeout(function() { Workshop.openDataPage(); }, 220); return; }
          if (action === 'console') { Workshop.close(); setTimeout(function() { Workshop.openConsole(); }, 220); return; }
          if (action === 'promptlog') { Workshop.close(); setTimeout(function() { Workshop.openPromptLog(); }, 220); return; }
        });
      });

      menu.querySelectorAll('.bm-wk').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;
          if (action === 'ballset') { Workshop.close(); setTimeout(function() { App.openBallSettings(); }, 220); return; }
          if (action === 'resetLayout') { Workshop.close(); setTimeout(function() { Workshop.resetAllLayout(); }, 220); return; }
          var panelMap = { theme: 'themePanel', font: 'fontPanel', bg: 'bgPanel' };
          if (panelMap[action]) { Workshop.close(); setTimeout(function() { App.openPanel(panelMap[action]); }, 220); }
        });
      });
    },

    openPromptLog: function() {
      var old = App.$('#wsPromptLog');
      if (old) { old.remove(); return; }

      var logs = App._promptLogs || [];

      var panel = document.createElement('div');
      panel.id = 'wsPromptLog';
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:200000;background:#fff;display:flex;flex-direction:column;';

      function renderList() {
        logs = App._promptLogs || [];
        var listHtml = '';
        if (!logs.length) {
          listHtml = '<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无日志<br>发一条消息后这里会显示 Prompt 结构</div>';
        } else {
          listHtml = logs.map(function(log, i) {
            var d = new Date(log.ts);
            var timeStr = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
            var typeTag = log.isProactive ? '<span style="background:rgba(201,112,107,.15);color:#c9706b;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;">主动</span>' : '<span style="background:rgba(126,163,201,.15);color:#7a9ab8;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;">回复</span>';
            return '<div class="pl-card" data-log-idx="' + i + '" style="margin:8px 16px;padding:14px;background:rgba(126,163,201,.04);border:1px solid rgba(126,163,201,.15);border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                  '<span style="font-size:13px;font-weight:700;color:#2e4258;">' + App.esc(log.charName) + '</span>' +
                  typeTag +
                '</div>' +
                '<span style="font-size:11px;color:#aaa;">' + timeStr + '</span>' +
              '</div>' +
              '<div style="display:flex;gap:12px;font-size:11px;color:#8aa0b8;">' +
                '<span>' + log.msgCount + ' 条消息</span>' +
                '<span>~' + log.tokenEstimate + ' tokens</span>' +
              '</div>' +
            '</div>';
          }).join('');
        }

        panel.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;border-bottom:1px solid #eee;flex-shrink:0;">' +
            '<button id="plBack" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
            '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">Prompt 日志</span>' +
            '<button id="plClear" type="button" style="background:none;border:none;color:#c9706b;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;padding:4px 8px;">清空</button>' +
          '</div>' +
          '<div style="padding:8px 16px;font-size:11px;color:#8aa0b8;line-height:1.5;border-bottom:1px solid #eee;flex-shrink:0;">每次发消息时自动记录发送给 AI 的完整 Prompt 结构（最多保留 20 条）。点击查看详情。</div>' +
          '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;" id="plList">' + listHtml + '</div>';

        panel.querySelector('#plBack').addEventListener('click', function() { panel.remove(); });
        panel.querySelector('#plClear').addEventListener('click', function() {
          App._promptLogs = [];
          renderList();
          App.showToast('已清空');
        });

        panel.querySelectorAll('.pl-card').forEach(function(card) {
          card.addEventListener('click', function() {
            var idx = parseInt(card.dataset.logIdx);
            var log = logs[idx];
            if (log) Workshop.openPromptDetail(log);
          });
        });
      }

      document.body.appendChild(panel);
      renderList();
    },

    openPromptDetail: function(log) {
      var old = App.$('#wsPromptDetail');
      if (old) old.remove();

      var panel = document.createElement('div');
      panel.id = 'wsPromptDetail';
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:200001;background:#fff;display:flex;flex-direction:column;';

      var roleColors = { system: '#e67e22', user: '#3498db', assistant: '#2ecc71' };
      var roleLabels = { system: 'SYSTEM', user: 'USER', assistant: 'ASSISTANT' };

      var msgsHtml = log.messages.map(function(m) {
        var color = roleColors[m.role] || '#999';
        var label = roleLabels[m.role] || m.role;
        return '<div style="margin:8px 0;border:1px solid rgba(0,0,0,.06);border-radius:10px;overflow:hidden;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(0,0,0,.02);border-bottom:1px solid rgba(0,0,0,.04);">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<span style="background:' + color + ';color:#fff;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;">' + label + '</span>' +
              '<span style="font-size:10px;color:#999;">#' + m.idx + '</span>' +
            '</div>' +
            '<span style="font-size:10px;color:#aaa;">' + m.length + ' 字</span>' +
          '</div>' +
          '<div class="pl-msg-content" style="padding:10px 12px;font-size:12px;color:#333;line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:120px;overflow:hidden;cursor:pointer;position:relative;" data-expanded="false">' +
            App.esc(m.full) +
            '<div class="pl-fade" style="position:absolute;bottom:0;left:0;right:0;height:40px;background:linear-gradient(transparent,#fff);pointer-events:none;"></div>' +
          '</div>' +
        '</div>';
      }).join('');

      var d = new Date(log.ts);
      var timeStr = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');

      panel.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;border-bottom:1px solid #eee;flex-shrink:0;">' +
          '<button id="pdBack" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">Prompt 详情</span>' +
          '<button id="pdCopy" type="button" style="background:none;border:none;color:#7a9ab8;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;padding:4px 8px;">复制全部</button>' +
        '</div>' +
        '<div style="padding:10px 16px;display:flex;gap:16px;font-size:11px;color:#8aa0b8;border-bottom:1px solid #eee;flex-shrink:0;">' +
          '<span>' + App.esc(log.charName) + '</span>' +
          '<span>' + timeStr + '</span>' +
          '<span>' + log.msgCount + ' 条</span>' +
          '<span>~' + log.tokenEstimate + ' tokens</span>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 16px 20px;">' + msgsHtml + '</div>';

      document.body.appendChild(panel);

      panel.querySelector('#pdBack').addEventListener('click', function() { panel.remove(); });

      panel.querySelector('#pdCopy').addEventListener('click', function() {
        var fullText = log.messages.map(function(m) {
          return '=== [' + m.role.toUpperCase() + '] ===\n' + m.full;
        }).join('\n\n');
        App.copyText(fullText).then(function() { App.showToast('已复制全部 Prompt'); }).catch(function() { App.showToast('复制失败'); });
      });

      panel.querySelectorAll('.pl-msg-content').forEach(function(el) {
        el.addEventListener('click', function() {
          var expanded = el.dataset.expanded === 'true';
          if (expanded) {
            el.style.maxHeight = '120px';
            el.dataset.expanded = 'false';
            var fade = el.querySelector('.pl-fade');
            if (fade) fade.style.display = '';
          } else {
            el.style.maxHeight = 'none';
            el.dataset.expanded = 'true';
            var fade2 = el.querySelector('.pl-fade');
            if (fade2) fade2.style.display = 'none';
          }
        });
      });
    },

    openDataPage: function() {
      var old = App.$('#wsDataPage');
      if (old) { old.remove(); return; }

      var panel = document.createElement('div');
      panel.id = 'wsDataPage';
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:200000;background:#fff;display:flex;flex-direction:column;';

      panel.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;border-bottom:1px solid #eee;flex-shrink:0;">' +
          '<button id="wsDataBack" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">数据管理</span>' +
          '<div style="width:36px;"></div>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;">' +
          '<div style="margin-bottom:20px;">' +
            '<div style="font-size:12px;font-weight:700;color:#7a9ab8;letter-spacing:1px;margin-bottom:10px;">导入 / 导出</div>' +
            '<div style="display:flex;gap:10px;">' +
              '<button id="wsExportBtn" type="button" style="flex:1;padding:14px;background:#1a1a1a;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">导出数据</button>' +
              '<button id="wsImportBtn" type="button" style="flex:1;padding:14px;background:#fff;color:#2e4258;border:1.5px solid rgba(126,163,201,.3);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">导入数据</button>' +
            '</div>' +
            '<input type="file" id="wsImportFile" accept=".json" hidden>' +
            '<div style="font-size:11px;color:#a8c0d8;margin-top:8px;line-height:1.5;">导出会生成一个 JSON 文件，包含所有设置和数据。导入会覆盖当前所有数据。</div>' +
          '</div>' +
          '<div style="margin-bottom:20px;">' +
            '<div style="font-size:12px;font-weight:700;color:#7a9ab8;letter-spacing:1px;margin-bottom:10px;">存储空间</div>' +
            '<button id="wsOpenStorage" type="button" style="width:100%;padding:14px;background:rgba(126,163,201,.06);color:#2e4258;border:1.5px solid rgba(126,163,201,.2);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:space-between;">' +
              '<span>查看存储详情</span>' +
              '<span style="font-size:12px;color:#8aa0b8;" id="wsStorageSize">计算中...</span>' +
            '</button>' +
          '</div>' +
          '<div style="margin-bottom:20px;">' +
            '<div style="font-size:12px;font-weight:700;color:#c9706b;letter-spacing:1px;margin-bottom:10px;">危险操作</div>' +
            '<button id="wsResetAll" type="button" style="width:100%;padding:14px;background:rgba(201,112,107,.06);color:#c9706b;border:1.5px solid rgba(201,112,107,.2);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">重置所有数据</button>' +
            '<div style="font-size:11px;color:#c9a0a0;margin-top:6px;line-height:1.5;">⚠️ 此操作不可恢复，将清除所有设置、角色、聊天记录等全部数据。</div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(panel);

      var sizeEl = panel.querySelector('#wsStorageSize');
      if (App.LS && App.LS.getTotalSize) {
        var total = App.LS.getTotalSize();
        sizeEl.textContent = total > 1024 ? (total / 1024).toFixed(1) + ' MB' : total + ' KB';
      }

      panel.querySelector('#wsDataBack').addEventListener('click', function() { panel.remove(); });
      panel.querySelector('#wsExportBtn').addEventListener('click', function() { Workshop.exportData(); });
      panel.querySelector('#wsImportBtn').addEventListener('click', function() { panel.querySelector('#wsImportFile').click(); });

      panel.querySelector('#wsImportFile').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        if (!confirm('导入将覆盖当前所有数据，确定继续？')) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          try {
            var data = JSON.parse(ev.target.result);
            Object.keys(data).forEach(function(key) { App.LS.set(key, data[key]); });
            App.showToast('导入成功，即将刷新');
            setTimeout(function() { location.reload(); }, 1000);
          } catch(err) { App.showToast('导入失败：文件格式错误'); }
        };
        reader.readAsText(file);
      });

      panel.querySelector('#wsOpenStorage').addEventListener('click', function() { Workshop.openStorage(); });

      panel.querySelector('#wsResetAll').addEventListener('click', function() {
        if (!confirm('确定要重置所有数据吗？此操作不可恢复。')) return;
        if (!confirm('再次确认：真的要清除所有数据吗？')) return;
        localStorage.clear();
        sessionStorage.clear();
        try { indexedDB.deleteDatabase('AppStorage'); } catch(e) {}
        App.showToast('已重置，即将刷新');
        setTimeout(function() { location.reload(); }, 1000);
      });
    },

    exportData: function() {
      var data = {};
      var keys = Object.keys(App.LS._cache || {});
      keys.forEach(function(key) { data[key] = App.LS.get(key); });
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'mono-space-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      App.showToast('数据已导出');
    },

    resetAllLayout: function() {
      App.LS.remove('wtCardPos');
      if (App.calendar) { App.calendar._dragOffsetX = 0; App.calendar._dragOffsetY = 0; }
      var wtCard = App.$('#wtCard');
      if (wtCard) wtCard.style.transform = '';
      if (App.modules.cards) App.modules.cards.resetAllPositions();
      var edenData = App.LS.get('edenCard');
      if (edenData) { edenData.posX = 0; edenData.posY = 0; App.LS.set('edenCard', edenData); }
      var edenCard = App.$('#edenCard');
      if (edenCard) edenCard.style.transform = '';
      App.showToast('布局已恢复');
    },

    openStorage: function() {
      var old = App.$('#wsStorage');
      if (old) { old.remove(); return; }

      var labelMap = {
        'userList': '用户档案', 'characterList': '角色列表', 'bgData': '主页背景图',
        'profileCards': '卡片组件', 'cmGlobal': '角色管理-全局设置', 'cmChars': '角色管理-个别设置',
        'activeApi': '当前API', 'apiConfigs': 'API配置列表', 'apiParams': 'API参数',
        'calCity': '天气城市', 'calWeather': '天气数据', 'calSchedules': '日程数据',
        'wtCardConfig': '时间栏调色', 'wtCardPos': '时间栏位置', 'floatingBallPos': '悬浮球位置',
        'ballConfig': '悬浮球设置', 'charCardMode': '角色卡片模式', 'activeUserId': '当前用户',
        'wxAliases': '微信备注名', 'wxPins': '微信置顶', 'wxFullScreen': '微信全屏模式',
        'chatFavorites': '聊天收藏', 'cpPresets': '调色板预设', 'worldbookEntries': '世界书',
        'worldbooks': '世界书列表', 'presetList': '预设列表', 'presetConfig': '预设配置'
      };

      function getLabel(key) {
        if (labelMap[key]) return labelMap[key];
        if (key.startsWith('chatBg_')) return '聊天背景图';
        if (key.startsWith('chatMsgs_')) return '聊天记录';
        if (key.startsWith('chatTint_')) return '晕染设置';
        if (key.startsWith('chatScene_')) return '聊天场景';
        if (key.startsWith('chatPalette_')) return '聊天调色板';
        if (key.startsWith('chatAvShape_')) return '头像形状';
        if (key.startsWith('chatAvHide_')) return '头像隐藏';
        if (key.startsWith('chatUnread_')) return '未读消息';
        if (key.startsWith('stickerCache_')) return '表情包缓存';
        if (key.startsWith('iconImg_')) return '自定义图标';
        if (key.startsWith('font_')) return '自定义字体';
        if (key.startsWith('edenCard')) return 'Eden卡片';
        if (key.startsWith('searchText_')) return '对话框文字';
        if (key.startsWith('avatar_search')) return '对话框头像';
        if (key.startsWith('cardDragOffsets')) return '卡片拖拽位置';
        return '其他';
      }

      var cacheKeys = Object.keys(App.LS._cache || {});
      var items = [];
      cacheKeys.forEach(function(key) {
        var size = App.LS.getSize(key);
        items.push({ key: key, size: size, label: getLabel(key) });
      });
      items.sort(function(a, b) { return b.size - a.size; });

      var total = App.LS.getTotalSize();
      var totalStr = total > 1024 ? (total / 1024).toFixed(1) + ' MB' : total + ' KB';

      var panel = document.createElement('div');
      panel.id = 'wsStorage';
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:200001;background:#fff;display:flex;flex-direction:column;';

      var listHtml = items.map(function(it) {
        var sizeStr = it.size > 1024 ? (it.size / 1024).toFixed(1) + ' MB' : it.size + ' KB';
        var isLarge = it.size > 100;
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 18px;border-bottom:1px solid rgba(0,0,0,.03);font-size:12px;">' +
          '<div style="flex:1;min-width:0;margin-right:10px;">' +
            '<div style="color:#333;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + App.esc(it.label) + '</div>' +
            '<div style="color:#bbb;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;">' + App.esc(it.key) + '</div>' +
          '</div>' +
          '<span style="color:' + (isLarge ? '#c9706b' : '#999') + ';flex-shrink:0;font-weight:' + (isLarge ? '700' : '400') + ';">' + sizeStr + '</span>' +
        '</div>';
      }).join('');

      panel.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;border-bottom:1px solid #eee;flex-shrink:0;">' +
          '<button id="wsStorageBack" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">存储空间</span>' +
          '<span style="font-size:12px;color:#8aa0b8;font-weight:600;">' + totalStr + '</span>' +
        '</div>' +
        '<div style="padding:12px 18px;font-size:11px;color:#8aa0b8;line-height:1.5;border-bottom:1px solid #eee;flex-shrink:0;">所有数据的删除请在对应功能中操作</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;">' + listHtml + '</div>';

      document.body.appendChild(panel);
      panel.querySelector('#wsStorageBack').addEventListener('click', function() { panel.remove(); });
    },

    /* ★ 重写：控制台支持拖拽 + 展开/收起 */
    openConsole: function() {
      var old = App.$('#wsConsole');
      if (old) { old.remove(); return; }

      var panel = document.createElement('div');
      panel.id = 'wsConsole';
      panel.style.cssText = 'position:fixed;bottom:80px;left:10px;right:10px;max-height:50vh;z-index:200000;background:rgba(0,0,0,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:monospace;';

      var isExpanded = false;

      panel.innerHTML =
        '<div id="wsConsoleHeader" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.1);flex-shrink:0;cursor:grab;-webkit-tap-highlight-color:transparent;">' +
          '<span style="color:#7a9ab8;font-size:12px;font-weight:700;letter-spacing:1px;">CONSOLE</span>' +
          '<div style="display:flex;gap:8px;">' +
            '<button id="wsExpandLog" type="button" style="background:rgba(255,255,255,.1);border:none;color:#999;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:inherit;">展开</button>' +
            '<button id="wsClearLog" type="button" style="background:rgba(255,255,255,.1);border:none;color:#999;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:inherit;">清空</button>' +
            '<button id="wsCloseConsole" type="button" style="background:rgba(255,255,255,.1);border:none;color:#999;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:inherit;">关闭</button>' +
          '</div>' +
        '</div>' +
        '<div id="wsLogArea" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 14px;max-height:40vh;"></div>' +
        '<div style="display:flex;border-top:1px solid rgba(255,255,255,.1);flex-shrink:0;">' +
          '<input id="wsExecInput" type="text" placeholder="输入JS执行..." style="flex:1;background:transparent;border:none;color:#fff;font-size:12px;padding:10px 14px;outline:none;font-family:monospace;">' +
          '<button id="wsExecBtn" type="button" style="background:#7a9ab8;border:none;color:#fff;font-size:11px;padding:8px 14px;cursor:pointer;font-family:inherit;font-weight:700;">执行</button>' +
        '</div>';
      document.body.appendChild(panel);

      var logArea = panel.querySelector('#wsLogArea');
      var header = panel.querySelector('#wsConsoleHeader');

      /* ★ 拖拽 */
      var _drag = { active: false, sx: 0, sy: 0, ox: 0, oy: 0, moved: false };

      header.addEventListener('touchstart', function(e) {
        if (e.target.closest('button')) return;
        var t = e.touches[0];
        var rect = panel.getBoundingClientRect();
        /* 固定宽高，脱离 right/bottom 定位 */
        panel.style.width = rect.width + 'px';
        panel.style.left = rect.left + 'px';
        panel.style.top = rect.top + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
        _drag = { active: true, sx: t.clientX, sy: t.clientY, ox: rect.left, oy: rect.top, moved: false };
        header.style.cursor = 'grabbing';
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        if (!_drag.active) return;
        e.preventDefault();
        var t = e.touches[0];
        var dx = t.clientX - _drag.sx;
        var dy = t.clientY - _drag.sy;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) _drag.moved = true;
        panel.style.left = (_drag.ox + dx) + 'px';
        panel.style.top = (_drag.oy + dy) + 'px';
      }, { passive: false });

      document.addEventListener('touchend', function() {
        if (_drag.active) {
          _drag.active = false;
          header.style.cursor = 'grab';
        }
      });

      /* ★ 展开/收起 */
panel.querySelector('#wsExpandLog').addEventListener('click', function() {
  isExpanded = !isExpanded;
  var execInput = panel.querySelector('#wsExecInput');
  if (isExpanded) {
    var rect = panel.getBoundingClientRect();
    panel.style.left = rect.left + 'px';
    panel.style.top = '10vh';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.width = rect.width + 'px';
    panel.style.maxHeight = '80vh';
    panel.style.height = '80vh';
    logArea.style.maxHeight = 'none';
    logArea.style.flex = '1';
    execInput.style.fontSize = '14px';
    execInput.style.padding = '14px 16px';
    this.textContent = '收起';
  } else {
    panel.style.maxHeight = '50vh';
    panel.style.height = '';
    logArea.style.maxHeight = '40vh';
    logArea.style.flex = '';
    execInput.style.fontSize = '12px';
    execInput.style.padding = '10px 14px';
    this.textContent = '展开';
  }
  logArea.scrollTop = logArea.scrollHeight;
});

      function addLog(text, color) {
        var div = document.createElement('div');
        div.style.cssText = 'font-size:11px;color:' + (color || '#ccc') + ';padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);word-break:break-all;white-space:pre-wrap;line-height:1.4;';
        div.textContent = text;
        logArea.appendChild(div);
        logArea.scrollTop = logArea.scrollHeight;
      }

      var origLog = console.log;
      var origWarn = console.warn;
      var origError = console.error;

      console.log = function() {
        origLog.apply(console, arguments);
        addLog('[LOG] ' + Array.from(arguments).map(function(a) {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch(e) { return String(a); }
        }).join(' '), '#ccc');
      };

      console.warn = function() {
        origWarn.apply(console, arguments);
        addLog('[WARN] ' + Array.from(arguments).map(function(a) {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch(e) { return String(a); }
        }).join(' '), '#f0c040');
      };

      console.error = function() {
        origError.apply(console, arguments);
        addLog('[ERROR] ' + Array.from(arguments).map(function(a) {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch(e) { return String(a); }
        }).join(' '), '#e85d5d');
      };

      var errHandler = function(e) {
        addLog('[ERROR] ' + (e.message || e.reason || e) + (e.filename ? ' (' + e.filename + ':' + e.lineno + ')' : ''), '#e85d5d');
      };
      window.addEventListener('error', errHandler);

      var rejectHandler = function(e) {
        addLog('[REJECT] ' + (e.reason || e), '#e85d5d');
      };
      window.addEventListener('unhandledrejection', rejectHandler);

      function execCmd() {
        var input = panel.querySelector('#wsExecInput');
        var cmd = input.value.trim();
        if (!cmd) return;
        addLog('> ' + cmd, '#7a9ab8');
        input.value = '';
        try {
          var result = eval(cmd);
          if (result !== undefined) {
            addLog(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result), '#8fc98f');
          }
        } catch (e) {
          addLog('[ERROR] ' + e.message, '#e85d5d');
        }
      }

      panel.querySelector('#wsExecBtn').addEventListener('click', execCmd);
      panel.querySelector('#wsExecInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); execCmd(); }
      });

      panel.querySelector('#wsClearLog').addEventListener('click', function() { logArea.innerHTML = ''; });

      panel.querySelector('#wsCloseConsole').addEventListener('click', function() {
        console.log = origLog;
        console.warn = origWarn;
        console.error = origError;
        window.removeEventListener('error', errHandler);
        window.removeEventListener('unhandledrejection', rejectHandler);
        panel.remove();
      });

      addLog('控制台已打开', '#7a9ab8');
      addLog('拖拽标题栏可移动位置', '#666');
      addLog('点击「展开」可放大到屏幕一半', '#666');
    },

    bindSwipe: function() {
      var menu = Workshop.menuEl;
      var slider = Workshop.sliderEl;

      menu.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        if (e.target.closest('input')) return;
        var t = e.touches[0];
        var rect = menu.getBoundingClientRect();
        Workshop._touch = {
          active: true, mode: '',
          sx: t.clientX, sy: t.clientY,
          ox: rect.left, oy: rect.top,
          baseSlider: -Workshop.getPageOffset(Workshop.currentPage)
        };
        slider.style.transition = 'none';
      }, { passive: false });

      menu.addEventListener('touchmove', function(e) {
        if (!Workshop._touch || !Workshop._touch.active) return;
        e.stopPropagation();
        var t = e.touches[0];
        var dx = t.clientX - Workshop._touch.sx;
        var dy = t.clientY - Workshop._touch.sy;
        var adx = Math.abs(dx), ady = Math.abs(dy);

        if (!Workshop._touch.mode) {
          if (adx < 8 && ady < 8) return;
          if (adx > ady && Workshop.currentPage > 0 && dx > 0) Workshop._touch.mode = 'swipe';
          else Workshop._touch.mode = 'drag';
        }

        e.preventDefault();
        if (Workshop._touch.mode === 'drag') {
          menu.style.left = (Workshop._touch.ox + dx) + 'px';
          menu.style.top = (Workshop._touch.oy + dy) + 'px';
          menu.style.right = 'auto';
        } else if (Workshop._touch.mode === 'swipe') {
          var nextX = Workshop._touch.baseSlider + dx;
          if (nextX > 0) nextX *= 0.25;
          slider.style.transform = 'translateX(' + nextX + 'px)';
        }
      }, { passive: false });

      menu.addEventListener('touchend', function() {
        if (!Workshop._touch || !Workshop._touch.active) return;
        Workshop._touch.active = false;
        slider.style.transition = '';
        if (Workshop._touch.mode === 'swipe') {
          var el = slider.style.transform.match(/translateX\((.+?)px\)/);
          var currentX = el ? parseFloat(el[1]) : Workshop._touch.baseSlider;
          var delta = currentX - Workshop._touch.baseSlider;
          var pw = Workshop.getPageWidth(Workshop.currentPage);
          if (delta > pw * 0.25 && Workshop.currentPage > 0) Workshop.goToPage(Workshop.currentPage - 1);
          else Workshop.goToPage(Workshop.currentPage);
        }
        Workshop._touch.mode = '';
      }, { passive: true });
    },

    goToPage: function(idx) {
      Workshop.currentPage = idx;
      var w = Workshop.getPageWidth(idx);
      Workshop.menuEl.style.width = w + 'px';
      Workshop.sliderEl.style.transform = 'translateX(' + (-Workshop.getPageOffset(idx)) + 'px)';
    },

    positionMenu: function() {
      var ball = App.state.ball;
      if (!ball) return;
      var rect = ball.getBoundingClientRect();
      var menu = Workshop.menuEl;
      var menuW = menu.offsetWidth || PG0_W;
      var menuH = menu.offsetHeight || 380;
      var ballCX = rect.left + rect.width / 2;
      var overlap = rect.width * 0.3;

      if (ballCX > window.innerWidth / 2) {
        menu.style.left = (rect.left - menuW + overlap) + 'px';
        menu.style.right = 'auto';
      } else {
        menu.style.left = (rect.right - overlap) + 'px';
        menu.style.right = 'auto';
      }

      var ballCY = rect.top + rect.height / 2;
      var top = ballCY - menuH / 2;
      if (top + menuH > window.innerHeight - 10) top = window.innerHeight - menuH - 10;
      if (top < 10) top = 10;
      menu.style.top = top + 'px';
    },

    open: function() {
      Workshop.createMenu();
      Workshop.isOpen = true;
      Workshop.currentPage = 0;
      Workshop.menuEl.style.width = PG0_W + 'px';
      Workshop.sliderEl.style.transition = 'none';
      Workshop.sliderEl.style.transform = 'translateX(0)';
      setTimeout(function() { Workshop.sliderEl.style.transition = ''; }, 50);
      Workshop.positionMenu();
      Workshop.menuEl.classList.add('show');
    },

    close: function() {
      if (!Workshop.isOpen) return;
      Workshop.isOpen = false;
      if (Workshop.menuEl) Workshop.menuEl.classList.remove('show');
    },

    toggle: function() {
      if (Workshop.isOpen) Workshop.close();
      else Workshop.open();
    },

    init: function() {
      document.addEventListener('click', function(e) {
        if (!Workshop.isOpen) return;
        if (Workshop.menuEl && Workshop.menuEl.contains(e.target)) return;
        var ball = App.state.ball;
        if (ball && (e.target === ball || ball.contains(e.target))) return;
        Workshop.close();
      });
    }
  };

  App.workshop = Workshop;
  App.register('workshop', Workshop);
})();
