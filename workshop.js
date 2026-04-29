
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
              '<div class="bm-title"> 悬浮助手 </div>' +
              '<div class="bm-grid">' +
                tkBlack('api', 'API', 'config') +
                tkBlack('workshop', '工坊', 'studio') +
                tkBlack('ballset', '悬浮球', 'float') +
                tkBlack('character', '角色', 'role') +
                tkBlack('memory', '记忆', 'memory') +
                tkBlack('resetLayout', '恢复', 'reset') +
                tkBlack('exportData', '导出', 'export') +
                tkBlack('storage', '存储', 'storage') +
                tkBlack('console', '控制台', 'console') +
              '</div>' +
              '<div class="bm-bottom-line"></div>' +
            '</div>' +
          '</div>' +

          '<div class="ball-card-page" data-page="1" style="width:' + PG1_W + 'px">' +
            '<div class="bm-card">' +
              '<div class="bm-title"> 美化工坊 </div>' +
              '<div class="bm-grid">' +
                tkWhite('theme', '主题', 'theme') +
                tkWhite('font', '字体', 'font') +
                tkWhite('bg', '背景', 'image') +
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
          if (action === 'ballset') { Workshop.close(); setTimeout(function() { App.openBallSettings(); }, 220); return; }
          if (action === 'character') { Workshop.close(); setTimeout(function() { if (App.charMgr) App.charMgr.open(); }, 220); return; }
          if (action === 'memory') { App.showToast('记忆功能开发中'); return; }
          if (action === 'resetLayout') { Workshop.close(); setTimeout(function() { Workshop.resetAllLayout(); }, 220); return; }
          if (action === 'exportData') { Workshop.exportData(); return; }
          if (action === 'storage') { Workshop.close(); setTimeout(function() { Workshop.openStorage(); }, 220); return; }
          if (action === 'console') { Workshop.close(); setTimeout(function() { Workshop.openConsole(); }, 220); return; }
        });
      });

      menu.querySelectorAll('.bm-wk').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = item.dataset.action;
          var panelMap = { theme: 'themePanel', font: 'fontPanel', bg: 'bgPanel' };
          if (panelMap[action]) { Workshop.close(); setTimeout(function() { App.openPanel(panelMap[action]); }, 220); }
        });
      });
    },

    exportData: function() {
      var data = {};
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
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
        'userList': '用户档案（含头像）',
        'characterList': '角色列表（含头像封面）',
        'bgData': '主页背景图',
        'profileCards': '卡片组件数据',
        'cmGlobal': '角色管理-全局设置',
        'cmChars': '角色管理-个别设置',
        'activeApi': '当前API配置',
        'apiConfigs': 'API配置列表',
        'apiParams': 'API参数',
        'calCity': '天气城市',
        'calWeather': '天气数据',
        'calSchedules': '日程数据',
        'wtCardConfig': '时间栏调色',
        'wtCardPos': '时间栏位置',
        'floatingBallPos': '悬浮球位置',
        'ballConfig': '悬浮球设置',
        'charCardMode': '角色卡片模式',
        'activeUserId': '当前用户',
        'wxAliases': '微信备注名',
        'wxPins': '微信置顶',
        'wxFullScreen': '微信全屏模式',
        'chatFavorites': '聊天收藏',
        'cpPresets': '调色板预设',
        'worldbookEntries': '世界书',
        'presetList': '预设列表',
        '_v': '版本号缓存'
      };

      function getLabel(key) {
        if (labelMap[key]) return labelMap[key];
        if (key.startsWith('chatBg_')) return '聊天背景图';
        if (key.startsWith('chatMsgs_')) return '聊天记录';
        if (key.startsWith('chatTint_')) return '聊天晕染设置';
        if (key.startsWith('chatScene_')) return '聊天场景';
        if (key.startsWith('chatPalette_')) return '聊天调色板';
        if (key.startsWith('chatAvShape_')) return '聊天头像形状';
        if (key.startsWith('chatAvHide_')) return '聊天头像隐藏';
        if (key.startsWith('chatUnread_')) return '未读消息数';
        if (key.startsWith('stickerCache_')) return '表情包缓存';
        if (key.startsWith('iconImg_')) return '自定义图标';
        if (key.startsWith('font_')) return '自定义字体';
        if (key.startsWith('edenCard')) return 'Eden卡片';
        return '其他数据';
      }

      var items = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var val = localStorage.getItem(key);
        var size = Math.round((key.length + (val ? val.length : 0)) * 2/ 1024);
        items.push({ key: key, size: size, label: getLabel(key) });
      }
      items.sort(function(a, b) { return b.size - a.size; });

      var total = 0;
      items.forEach(function(it) { total += it.size; });
      var totalStr = total > 1024 ? (total / 1024).toFixed(1) + ' MB' : total + ' KB';

      var panel = document.createElement('div');
      panel.id = 'wsStorage';
      panel.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:200000;background:#fff;display:flex;flex-direction:column;';

      var listHtml = items.map(function(it) {
        var sizeStr = it.size > 1024 ? (it.size / 1024).toFixed(1) + ' MB' : it.size + ' KB';
        var isLarge = it.size > 50;
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 18px;border-bottom:1px solid rgba(0,0,0,.03);font-size:12px;">' +
          '<div style="flex:1;min-width:0;margin-right:10px;">' +'<div style="color:#333;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + App.esc(it.label) + '</div>' +
            '<div style="color:#bbb;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;">' + App.esc(it.key) + '</div>' +
          '</div>' +
          '<span style="color:' + (isLarge ? '#c9706b' : '#999') + ';flex-shrink:0;font-weight:' + (isLarge ? '700' : '400') + ';">' + sizeStr + '</span>' +
          (isLarge ? '<button data-delkey="' + App.escAttr(it.key) + '" type="button" style="margin-left:8px;background:rgba(201,112,107,.1);border:1px solid rgba(201,112,107,.3);border-radius:6px;color:#c9706b;font-size:11px;padding:3px 8px;cursor:pointer;font-family:inherit;flex-shrink:0;">清除</button>' : '') +'</div>';
      }).join('');

      panel.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;border-bottom:1px solid #eee;flex-shrink:0;">' +
          '<button id="wsStorageBack" type="button" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#7a9ab8;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span style="font-size:16px;font-weight:700;color:#2e4258;letter-spacing:1px;">存储空间</span>' +
          '<span style="font-size:12px;color:' + (total > 4096 ? '#c9706b' : '#8aa0b8') + ';font-weight:600;">' + totalStr + '</span>' +
        '</div>' +
        '<div style="padding:8px 18px;display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0;border-bottom:1px solid #eee;">' +
          '<button id="wsClearAllBg" type="button" style="padding:6px 12px;background:rgba(201,112,107,.06);border:1px solid rgba(201,112,107,.2);border-radius:8px;color:#c9706b;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;">清除所有聊天背景图</button>' +
          '<button id="wsClearAllSticker" type="button" style="padding:6px 12px;background:rgba(201,112,107,.06);border:1px solid rgba(201,112,107,.2);border-radius:8px;color:#c9706b;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;">清除所有表情包缓存</button>' +
          '<button id="wsClearMainBg" type="button" style="padding:6px 12px;background:rgba(201,112,107,.06);border:1px solid rgba(201,112,107,.2);border-radius:8px;color:#c9706b;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;">清除主页背景图</button>' +
          '<button id="wsClearAvatars" type="button" style="padding:6px 12px;background:rgba(201,112,107,.06);border:1px solid rgba(201,112,107,.2);border-radius:8px;color:#c9706b;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;">清除所有内嵌头像</button>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;">' + listHtml + '</div>';

      document.body.appendChild(panel);

      panel.querySelector('#wsStorageBack').addEventListener('click', function() { panel.remove(); });

      panel.querySelector('#wsClearAllBg').addEventListener('click', function() {
        if (!confirm('清除所有聊天背景图？')) return;
        var keys = [];
        for (var j = 0; j < localStorage.length; j++) {
          var k = localStorage.key(j);
          if (k.startsWith('chatBg_')) keys.push(k);
        }
        keys.forEach(function(k) { localStorage.removeItem(k); });
        panel.remove(); Workshop.openStorage();
        App.showToast('已清除 ' + keys.length + ' 张聊天背景图');
      });

      panel.querySelector('#wsClearAllSticker').addEventListener('click', function() {
        if (!confirm('清除所有表情包缓存？')) return;
        var keys = [];
        for (var j = 0; j < localStorage.length; j++) {
          var k = localStorage.key(j);
          if (k.startsWith('stickerCache_')) keys.push(k);
        }
        keys.forEach(function(k) { localStorage.removeItem(k); });
        panel.remove(); Workshop.openStorage();
        App.showToast('已清除 ' + keys.length + ' 个表情包缓存');
      });

      panel.querySelector('#wsClearMainBg').addEventListener('click', function() {
        if (!confirm('清除主页背景图？页面会恢复默认背景')) return;
        localStorage.removeItem('bgData');
        var bgLayer = App.$('#bgLayer');
        if (bgLayer) { bgLayer.style.backgroundImage = ''; bgLayer.className = 'bg-layer'; }
        panel.remove(); Workshop.openStorage();
        App.showToast('主页背景图已清除');
      });

      panel.querySelector('#wsClearAvatars').addEventListener('click', function() {
        if (!confirm('清除所有用户和角色里内嵌的base64头像？\n清除后需要用URL重新设置头像')) return;
        // 清除用户头像
        var users = App.LS.get('userList') || [];
        users.forEach(function(u) {
          if (u.avatar && u.avatar.startsWith('data:')) u.avatar = '';if (u.cardBg && u.cardBg.startsWith('data:')) u.cardBg = '';
        });
        App.LS.set('userList', users);
        // 清除角色头像和封面
        var chars = App.LS.get('characterList') || [];
        chars.forEach(function(c) {
          if (c.avatar && c.avatar.startsWith('data:')) c.avatar = '';
          if (c.cover && c.cover.startsWith('data:')) c.cover = '';
        });
        App.LS.set('characterList', chars);
        // 清除独立头像缓存
        var keys = [];
        for (var j = 0; j < localStorage.length; j++) {
          var k = localStorage.key(j);
          if (k.startsWith('avatar_') || k.startsWith('iconImg_')) keys.push(k);
        }
        keys.forEach(function(k) { localStorage.removeItem(k); });
        panel.remove(); Workshop.openStorage();
        App.showToast('已清除所有内嵌头像，请用URL重新设置');
      });

      panel.querySelectorAll('[data-delkey]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var key = btn.dataset.delkey;
          var label = getLabel(key);
          if (!confirm('清除「' + label + '」？\n(' + key + ')')) return;
          localStorage.removeItem(key);
          panel.remove(); Workshop.openStorage();
          App.showToast('已清除');
        });
      });
    },

    openConsole: function() {
      var old = App.$('#wsConsole');
      if (old) { old.remove(); return; }

      var panel = document.createElement('div');
      panel.id = 'wsConsole';
      panel.style.cssText = 'position:fixed;bottom:80px;left:10px;right:10px;max-height:50vh;z-index:200000;background:rgba(0,0,0,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:monospace;';
      panel.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.1);flex-shrink:0;">' +
          '<span style="color:#7a9ab8;font-size:12px;font-weight:700;letter-spacing:1px;">CONSOLE</span>' +
          '<div style="display:flex;gap:8px;">' +
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
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
          catch(e) { return String(a); }
        }).join(' '), '#ccc');
      };

      console.warn = function() {
        origWarn.apply(console, arguments);
        addLog('[WARN] ' + Array.from(arguments).map(function(a) {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
          catch(e) { return String(a); }
        }).join(' '), '#f0c040');
      };

      console.error = function() {
        origError.apply(console, arguments);
        addLog('[ERROR] ' + Array.from(arguments).map(function(a) {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
          catch(e) { return String(a); }
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
      addLog('所有 console.log/warn/error 会显示在这里', '#666');
      addLog('可以输入JS表达式执行', '#666');
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
