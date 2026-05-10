
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  /*
   * 记忆系统
   * 
   * 每个角色有一个记忆仓库，存储结构：
   * {
   *   id: 'mem_1234567890',
   *   content: '她怕打雷，暴风雨的夜晚会缩在被子里发抖',
   *   tags: ['性格', '恐惧'],
   *   source: 'wechat',        // 来源：wechat / offline / manual
   *   importance: 'high',      // high / medium / low
   *   autoSend: true,          // 是否默认发送
   *   createdAt: 1234567890,
   *   updatedAt: 1234567890
   * }
   */

  var TAG_PRESETS = [
    '性格', '喜好', '厌恶', '习惯', '经历',
    '关系', '秘密', '外貌', '情感', '日常',
    '重要事件', '承诺', '其他'
  ];

  var IMPORTANCE_NAMES = { high: '重要', medium: '一般', low: '琐碎' };
  var IMPORTANCE_COLORS = { high: '#c9706b', medium: '#e8a87c', low: '#bbb' };
  var SOURCE_NAMES = { wechat: '微信', offline: '线下', manual: '手动', auto: 'AI总结' };

  var Memory = {

    /* ==================== 数据操作 ==================== */

    getAll: function(charId) {
      return App.LS.get('memories_' + charId) || [];
    },

    save: function(charId, list) {
      App.LS.set('memories_' + charId, list);
    },

    add: function(charId, entry) {
      var list = Memory.getAll(charId);
      entry.id = entry.id || ('mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4));
      entry.createdAt = entry.createdAt || Date.now();
      entry.updatedAt = Date.now();
      if (entry.autoSend === undefined) entry.autoSend = true;
      list.unshift(entry);
      Memory.save(charId, list);
      return entry;
    },

    update: function(charId, memId, updates) {
      var list = Memory.getAll(charId);
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === memId) {
          Object.keys(updates).forEach(function(k) { list[i][k] = updates[k]; });
          list[i].updatedAt = Date.now();
          break;
        }
      }
      Memory.save(charId, list);
    },

    remove: function(charId, memId) {
      var list = Memory.getAll(charId);
      list = list.filter(function(m) { return m.id !== memId; });
      Memory.save(charId, list);
    },

    getById: function(charId, memId) {
      var list = Memory.getAll(charId);
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === memId) return list[i];
      }
      return null;
    },

    /* 获取所有标记为"自动发送"的记忆 */
    getAutoSend: function(charId) {
      return Memory.getAll(charId).filter(function(m) { return m.autoSend === true; });
    },

    /* 根据用户手动勾选获取 */
    getSelected: function(charId, selectedIds) {
      var list = Memory.getAll(charId);
      return list.filter(function(m) { return selectedIds.indexOf(m.id) >= 0; });
    },

    /* ★ 核心：构建发送给 AI 的记忆文本 */
    buildMemoryText: function(charId, mode) {
      var sendConfig = App.LS.get('memorySendConfig_' + charId) || { mode: 'auto' };
      /*
       * sendConfig.mode:
       *   'auto'   → 发送所有 autoSend=true 的记忆
       *   'manual'  → 发送用户手动勾选的记忆（selectedIds）
       *   'all'    → 发送全部
       *   'none'   → 不发送任何记忆
       */

      var memories = [];

      if (sendConfig.mode === 'none') return '';
      if (sendConfig.mode === 'all') memories = Memory.getAll(charId);
      else if (sendConfig.mode === 'manual') memories = Memory.getSelected(charId, sendConfig.selectedIds || []);
      else memories = Memory.getAutoSend(charId); // auto

      if (!memories.length) return '';

      /* 按重要度排序：high > medium > low */
      var order = { high: 0, medium: 1, low: 2 };
      memories.sort(function(a, b) {
        return (order[a.importance] || 2) - (order[b.importance] || 2);
      });

      var lines = memories.map(function(m) {
        var prefix = m.importance === 'high' ? '【重要】' : '';
        var tagStr = (m.tags && m.tags.length) ? '[' + m.tags.join('/') + '] ' : '';
        return prefix + tagStr + m.content;
      });

      return lines.join('\n');
    },

    /* ==================== AI 自动总结 ==================== */

    /*
     * 从最近的 N 条聊天中提取关键记忆
     * 调用时机：
     *   1. 用户手动点击"总结记忆"按钮
     *   2. 每累积 30 条新消息自动触发一次
     */
    autoSummarize: function(charId, chatMessages, callback) {
      var api = null;
      if (App.chat && App.chat._utils) {
        api = App.chat._utils.getApi(charId);
      } else if (App.api) {
        api = App.api.getActiveConfig();
      }
      if (!api) {
        if (callback) callback('请先配置 API');
        return;
      }

      var charData = App.character ? App.character.getById(charId) : null;
      var charName = charData ? charData.name : '角色';
      var userName = '用户';
      if (App.user) {
        var u = App.user.getActiveUser();
        if (u) userName = u.nickname || u.realName || '用户';
      }

      /* 取最近 40 条消息 */
      var recent = chatMessages.slice(-40);
      var chatText = recent.map(function(m) {
        var who = m.role === 'user' ? userName : charName;
        return who + '：' + (m.content || '').slice(0, 200);
      }).join('\n');

      /* 获取已有记忆，避免重复 */
      var existing = Memory.getAll(charId);
      var existingText = existing.map(function(m) { return m.content; }).join('\n');

      var prompt =
        '你是一个记忆提取助手。请从以下聊天记录中提取值得长期记忆的关键信息。\n\n' +
        '【聊天记录】\n' + chatText + '\n\n' +
        (existingText ? '【已有记忆（不要重复）】\n' + existingText + '\n\n' : '') +
        '【要求】\n' +
        '1. 提取关于双方的重要信息：性格特点、喜好厌恶、重要经历、关系变化、承诺约定等\n' +
        '2. 每条记忆精简为一句话（15-40字）\n' +
        '3. 不要提取无意义的日常闲聊（如"你好""哈哈""好的"）\n' +
        '4. 不要重复已有记忆中的内容\n' +
        '5. 如果没有值得记忆的新内容，返回空\n\n' +
        '【输出格式】每条记忆一行，格式：\n' +
        '重要度|标签|内容\n' +
        '重要度：high/medium/low\n' +
        '标签：从以下选择一个：' + TAG_PRESETS.join('、') + '\n\n' +
        '示例：\n' +
        'high|恐惧|她非常怕打雷，暴风雨时会缩在被子里发抖\n' +
        'medium|喜好|他最喜欢吃草莓蛋糕，尤其是奶油很多的那种\n' +
        'low|日常|她最近在准备期末考试，压力很大\n\n' +
        '如果没有新的值得记忆的内容，只输出：[无新记忆]';

      var url = api.url.replace(/\/+$/, '') + '/chat/completions';
      var params = App.api ? App.api.getParams() : { temperature: 0.3 };

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api.key },
        body: JSON.stringify({
          model: api.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000
        })
      }).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function(data) {
        var content = '';
        try { content = data.choices[0].message.content || ''; } catch (e) {}
        content = content.trim();

        if (!content || content.indexOf('[无新记忆]') >= 0) {
          if (callback) callback(null, 0);
          return;
        }

        var lines = content.split('\n').filter(function(l) { return l.trim(); });
        var added = 0;

        lines.forEach(function(line) {
          line = line.trim();
          if (!line || line.indexOf('[') === 0) return;

          var parts = line.split('|');
          if (parts.length < 3) return;

          var importance = parts[0].trim().toLowerCase();
          if (['high', 'medium', 'low'].indexOf(importance) < 0) importance = 'medium';

          var tag = parts[1].trim();
          var memContent = parts.slice(2).join('|').trim();
          if (!memContent) return;

          /* 去重检查 */
          var isDuplicate = false;
          existing.forEach(function(ex) {
            if (ex.content === memContent) isDuplicate = true;
            /* 相似度简单检查 */
            if (ex.content.length > 10 && memContent.length > 10) {
              var overlap = 0;
              for (var i = 0; i < Math.min(ex.content.length, memContent.length); i++) {
                if (ex.content[i] === memContent[i]) overlap++;
              }
              if (overlap / Math.max(ex.content.length, memContent.length) > 0.7) isDuplicate = true;
            }
          });

          if (isDuplicate) return;

          Memory.add(charId, {
            content: memContent,
            tags: [tag],
            source: 'auto',
            importance: importance,
            autoSend: importance === 'high'  /* 只有重要记忆默认自动发送 */
          });
          added++;
        });

        /* 刷新 existing 列表 */
        existing = Memory.getAll(charId);

        if (callback) callback(null, added);
      }).catch(function(err) {
        if (callback) callback(err.message || '总结失败');
      });
    },

    /* ==================== UI ==================== */

    open: function(charId) {
      if (!charId) return;
      Memory._charId = charId;

      var old = document.querySelector('#memoryPage');
      if (old) old.remove();

      var page = document.createElement('div');
      page.id = 'memoryPage';
      page.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10002;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';
      document.body.appendChild(page);
      Memory._pageEl = page;

      Memory.renderList(page, charId);

      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          page.style.transform = 'translateX(0)';
          page.style.opacity = '1';
        });
      });

      App.bindSwipeBack(page, function() { Memory.closePage(); });
    },

    closePage: function() {
      var p = Memory._pageEl;
      if (!p) return;
      p.style.transform = 'translateX(100%)';
      p.style.opacity = '0';
      setTimeout(function() { if (p.parentNode) p.remove(); Memory._pageEl = null; }, 350);
    },

    renderList: function(page, charId) {
      var list = Memory.getAll(charId);
      var sendConfig = App.LS.get('memorySendConfig_' + charId) || { mode: 'auto' };
      var charData = App.character ? App.character.getById(charId) : null;
      var charName = charData ? charData.name : '角色';

      var totalCount = list.length;
      var autoCount = list.filter(function(m) { return m.autoSend; }).length;
      var highCount = list.filter(function(m) { return m.importance === 'high'; }).length;

      /* 按标签分组 */
      var grouped = {};
      list.forEach(function(m) {
        var tag = (m.tags && m.tags[0]) || '其他';
        if (!grouped[tag]) grouped[tag] = [];
        grouped[tag].push(m);
      });

      var groupHtml = '';
      Object.keys(grouped).forEach(function(tag) {
        var items = grouped[tag];
        groupHtml += '<div class="mem-group">' +
          '<div class="mem-group-title">' + App.esc(tag) +
          '<span class="mem-group-count">' + items.length + '</span></div>';

        items.forEach(function(m) {
          var impColor = IMPORTANCE_COLORS[m.importance] || '#bbb';
          var srcName = SOURCE_NAMES[m.source] || '';
          var isAutoSend = m.autoSend === true;

          groupHtml += '<div class="mem-item" data-mid="' + m.id + '">' +
            '<div class="mem-item-dot" style="background:' + impColor + ';"></div>' +
            '<div class="mem-item-body">' +
              '<div class="mem-item-content">' + App.esc(m.content) + '</div>' +
              '<div class="mem-item-meta">' +
                '<span class="mem-meta-imp" style="color:' + impColor + ';">' + (IMPORTANCE_NAMES[m.importance] || '') + '</span>' +
                (srcName ? '<span class="mem-meta-src">' + srcName + '</span>' : '') +
              '</div>' +
            '</div>' +
            '<div class="mem-item-actions">' +
              '<div class="mem-auto-toggle ' + (isAutoSend ? 'on' : '') + '" data-mid="' + m.id + '" title="' + (isAutoSend ? '自动发送中' : '不自动发送') + '">' +
                '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
              '</div>' +
            '</div>' +
          '</div>';
        });

        groupHtml += '</div>';
      });

      if (!list.length) {
        groupHtml = '<div style="padding:60px 20px;text-align:center;color:#bbb;font-size:13px;">暂无记忆<br>点击右上角手动添加，或使用「AI 总结」自动提取</div>';
      }

      page.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<button id="memBackBtn" type="button" style="background:none;border:none;cursor:pointer;padding:4px;-webkit-tap-highlight-color:transparent;">' +
            '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#999;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</button>' +
          '<div style="font-size:15px;font-weight:700;color:#2e4258;letter-spacing:1px;">' + App.esc(charName) + ' 的记忆</div>' +
          '<button id="memAddBtn" type="button" style="background:none;border:none;font-size:22px;color:#7a9ab8;cursor:pointer;padding:4px 8px;font-weight:300;-webkit-tap-highlight-color:transparent;">+</button>' +
        '</div>' +

        /* 统计栏 */
        '<div style="display:flex;gap:8px;padding:0 16px 12px;">' +
          '<div class="mem-stat-chip">共 ' + totalCount + ' 条</div>' +
          '<div class="mem-stat-chip" style="color:#c9706b;border-color:rgba(201,112,107,.3);">重要 ' + highCount + '</div>' +
          '<div class="mem-stat-chip" style="color:#7a9ab8;border-color:rgba(126,163,201,.4);">自动发送 ' + autoCount + '</div>' +
        '</div>' +

        /* 发送设置 */
        '<div style="padding:0 16px 8px;">' +
          '<div class="mem-send-config">' +
            '<span style="font-size:11px;font-weight:700;color:#999;">发送模式</span>' +
            '<select id="memSendMode" style="padding:4px 8px;border:1px solid #ddd;border-radius:6px;font-size:11px;color:#333;outline:none;font-family:inherit;background:#fff;">' +
              '<option value="auto"' + (sendConfig.mode === 'auto' ? ' selected' : '') + '>自动（仅标记的）</option>' +
              '<option value="all"' + (sendConfig.mode === 'all' ? ' selected' : '') + '>全部发送</option>' +
              '<option value="none"' + (sendConfig.mode === 'none' ? ' selected' : '') + '>不发送</option>' +
            '</select>' +
          '</div>' +
        '</div>' +

        /* 操作栏 */
        '<div style="display:flex;gap:8px;padding:0 16px 12px;">' +
          '<button id="memSummarizeBtn" type="button" class="mem-action-btn">AI 总结</button>' +
          '<button id="memExportBtn" type="button" class="mem-action-btn" style="background:rgba(126,163,201,.08);color:#7a9ab8;border-color:rgba(126,163,201,.3);">导出</button>' +
          '<button id="memImportBtn" type="button" class="mem-action-btn" style="background:rgba(126,163,201,.08);color:#7a9ab8;border-color:rgba(126,163,201,.3);">导入</button>' +
        '</div>' +

        /* 记忆列表 */
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 40px;">' +
          groupHtml +
        '</div>';

      /* 绑定事件 */
      page.querySelector('#memBackBtn').addEventListener('click', function() { Memory.closePage(); });
      page.querySelector('#memAddBtn').addEventListener('click', function() { Memory.showEditDialog(charId, null); });

      page.querySelector('#memSendMode').addEventListener('change', function() {
        var cfg = App.LS.get('memorySendConfig_' + charId) || {};
        cfg.mode = this.value;
        App.LS.set('memorySendConfig_' + charId, cfg);
        App.showToast('已切换：' + { auto: '自动发送标记的', all: '全部发送', none: '不发送' }[cfg.mode]);
      });

      /* AI 总结 */
      page.querySelector('#memSummarizeBtn').addEventListener('click', function() {
        var msgs = App.LS.get('chatMsgs_' + charId) || [];
        var offlineMsgs = App.LS.get('chatMsgs_offline_' + charId) || [];
        var allMsgs = msgs.concat(offlineMsgs);
        allMsgs.sort(function(a, b) { return (a.ts || 0) - (b.ts || 0); });

        if (allMsgs.length < 5) {
          App.showToast('聊天记录太少，至少需要 5 条');
          return;
        }

        App.showToast('正在分析聊天记录...');
        Memory.autoSummarize(charId, allMsgs, function(err, count) {
          if (err) { App.showToast(typeof err === 'string' ? err : '总结失败'); return; }
          if (count === 0) { App.showToast('没有发现新的值得记忆的内容'); return; }
          App.showToast('已提取 ' + count + ' 条新记忆');
          Memory.renderList(page, charId);
        });
      });

      /* 导出 */
      page.querySelector('#memExportBtn').addEventListener('click', function() {
        var data = Memory.getAll(charId);
        if (!data.length) { App.showToast('暂无记忆可导出'); return; }
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'memory_' + charName + '_' + Date.now() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        App.showToast('已导出');
      });

      /* 导入 */
      page.querySelector('#memImportBtn').addEventListener('click', function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        document.body.appendChild(input);
        input.onchange = function(e) {
          var file = e.target.files[0];
          document.body.removeChild(input);
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(ev) {
            try {
              var data = JSON.parse(ev.target.result);
              if (!Array.isArray(data)) throw new Error('格式错误');
              var count = 0;
              data.forEach(function(m) {
                if (m.content) { Memory.add(charId, m); count++; }
              });
              App.showToast('已导入 ' + count + ' 条记忆');
              Memory.renderList(page, charId);
            } catch (err) {
              App.showToast('导入失败：' + err.message);
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });

      /* 自动发送开关 */
      page.querySelectorAll('.mem-auto-toggle').forEach(function(toggle) {
        toggle.addEventListener('click', function(e) {
          e.stopPropagation();
          var mid = toggle.dataset.mid;
          var m = Memory.getById(charId, mid);
          if (!m) return;
          Memory.update(charId, mid, { autoSend: !m.autoSend });
          toggle.classList.toggle('on');
          toggle.title = toggle.classList.contains('on') ? '自动发送中' : '不自动发送';
        });
      });

      /* 点击记忆条目 → 编辑 */
      page.querySelectorAll('.mem-item').forEach(function(item) {
        item.addEventListener('click', function() {
          Memory.showEditDialog(charId, item.dataset.mid);
        });
      });
    },

    /* 编辑/新增记忆弹窗 */
    showEditDialog: function(charId, memId) {
      var isEdit = !!memId;
      var m = isEdit ? Memory.getById(charId, memId) : { content: '', tags: [], importance: 'medium', source: 'manual', autoSend: true };
      if (!m) return;

      var old = document.querySelector('#memEditOverlay');
      if (old) old.remove();

      var overlay = document.createElement('div');
      overlay.id = 'memEditOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:20px;';

      var tagsHtml = TAG_PRESETS.map(function(t) {
        var sel = (m.tags && m.tags.indexOf(t) >= 0) ? ' mem-tag-sel' : '';
        return '<div class="mem-tag-chip' + sel + '" data-tag="' + t + '">' + App.esc(t) + '</div>';
      }).join('');

      overlay.innerHTML =
        '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:16px;padding:20px;width:100%;max-width:340px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);">' +
          '<div style="font-size:14px;font-weight:700;color:#2e4258;margin-bottom:14px;">' + (isEdit ? '编辑记忆' : '添加记忆') + '</div>' +

          '<div style="margin-bottom:12px;">' +
            '<div style="font-size:11px;font-weight:600;color:#999;margin-bottom:4px;">内容</div>' +
            '<textarea id="memEditContent" style="width:100%;min-height:80px;border:1.5px solid #ddd;border-radius:10px;padding:10px;font-size:13px;color:#333;outline:none;font-family:inherit;resize:vertical;box-sizing:border-box;" placeholder="记忆内容...">' + App.esc(m.content || '') + '</textarea>' +
          '</div>' +

          '<div style="margin-bottom:12px;">' +
            '<div style="font-size:11px;font-weight:600;color:#999;margin-bottom:6px;">标签</div>' +
            '<div id="memEditTags" style="display:flex;flex-wrap:wrap;gap:6px;">' + tagsHtml + '</div>' +
          '</div>' +

          '<div style="margin-bottom:12px;">' +
            '<div style="font-size:11px;font-weight:600;color:#999;margin-bottom:4px;">重要度</div>' +
            '<div style="display:flex;gap:6px;">' +
              '<button class="mem-imp-btn' + (m.importance === 'high' ? ' active' : '') + '" data-imp="high" type="button" style="border-color:' + IMPORTANCE_COLORS.high + ';">重要</button>' +
              '<button class="mem-imp-btn' + (m.importance === 'medium' ? ' active' : '') + '" data-imp="medium" type="button" style="border-color:' + IMPORTANCE_COLORS.medium + ';">一般</button>' +
              '<button class="mem-imp-btn' + (m.importance === 'low' ? ' active' : '') + '" data-imp="low" type="button" style="border-color:' + IMPORTANCE_COLORS.low + ';">琐碎</button>' +
            '</div>' +
          '</div>' +

          '<div style="margin-bottom:16px;">' +
            '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">' +
              '<input type="checkbox" id="memEditAutoSend"' + (m.autoSend ? ' checked' : '') + ' style="width:16px;height:16px;">' +
              '<span style="font-size:12px;color:#555;">自动发送给 AI</span>' +
            '</label>' +
          '</div>' +

          '<div style="display:flex;gap:8px;">' +
            '<button id="memEditSave" type="button" style="flex:1;padding:11px;border:none;border-radius:10px;background:#1a1a1a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">保存</button>' +
            (isEdit ? '<button id="memEditDel" type="button" style="padding:11px 16px;border:1.5px solid rgba(201,112,107,.3);border-radius:10px;background:rgba(201,112,107,.05);color:#c9706b;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">删除</button>' : '') +
            '<button id="memEditCancel" type="button" style="padding:11px 16px;border:1.5px solid #ddd;border-radius:10px;background:#fff;color:#666;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">取消</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector('#memEditCancel').addEventListener('click', function() { overlay.remove(); });

      /* 标签选择 */
      var selectedTags = m.tags ? m.tags.slice() : [];
      overlay.querySelectorAll('.mem-tag-chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
          var tag = chip.dataset.tag;
          var idx = selectedTags.indexOf(tag);
          if (idx >= 0) { selectedTags.splice(idx, 1); chip.classList.remove('mem-tag-sel'); }
          else { selectedTags.push(tag); chip.classList.add('mem-tag-sel'); }
        });
      });

      /* 重要度选择 */
      var selectedImp = m.importance || 'medium';
      overlay.querySelectorAll('.mem-imp-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          overlay.querySelectorAll('.mem-imp-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          selectedImp = btn.dataset.imp;
        });
      });

      /* 保存 */
      overlay.querySelector('#memEditSave').addEventListener('click', function() {
        var content = overlay.querySelector('#memEditContent').value.trim();
        if (!content) { App.showToast('请输入记忆内容'); return; }
        var autoSend = overlay.querySelector('#memEditAutoSend').checked;

        if (isEdit) {
          Memory.update(charId, memId, {
            content: content,
            tags: selectedTags,
            importance: selectedImp,
            autoSend: autoSend
          });
        } else {
          Memory.add(charId, {
            content: content,
            tags: selectedTags,
            importance: selectedImp,
            source: 'manual',
            autoSend: autoSend
          });
        }

        overlay.remove();
        if (Memory._pageEl) Memory.renderList(Memory._pageEl, charId);
        App.showToast(isEdit ? '已更新' : '已添加');
      });

      /* 删除 */
      if (isEdit) {
        overlay.querySelector('#memEditDel').addEventListener('click', function() {
          if (!confirm('确定删除这条记忆？')) return;
          Memory.remove(charId, memId);
          overlay.remove();
          if (Memory._pageEl) Memory.renderList(Memory._pageEl, charId);
          App.showToast('已删除');
        });
      }
    },

    init: function() {
      App.memory = Memory;
    }
  };

  App.register('memory', Memory);
})();
