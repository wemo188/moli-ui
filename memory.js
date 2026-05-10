
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var TAG_PRESETS = [
    '性格', '喜好', '厌恶', '习惯', '经历',
    '关系', '秘密', '外貌', '情感', '日常',
    '重要事件', '承诺', '其他'
  ];

  var IMPORTANCE_NAMES = { high: '重要', medium: '一般', low: '琐碎' };
  var IMPORTANCE_COLORS = { high: '#c9706b', medium: '#e8a87c', low: '#bbb' };
  var SOURCE_NAMES = { wechat: '微信', offline: '线下', manual: '手动', auto: 'AI总结' };

  var Memory = {

    _charId: null,
    _pageEl: null,

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

    getAutoSend: function(charId) {
      return Memory.getAll(charId).filter(function(m) { return m.autoSend === true; });
    },

    /* ★ 核心：构建发送给 AI 的记忆文本（chat.js 调用这个） */
    buildMemoryText: function(charId) {
      if (!charId) return '';
      var sendConfig = App.LS.get('memorySendConfig_' + charId) || { mode: 'auto' };
      var memories = [];

      if (sendConfig.mode === 'none') return '';
      if (sendConfig.mode === 'all') memories = Memory.getAll(charId);
      else memories = Memory.getAutoSend(charId);

      if (!memories.length) return '';

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

    autoSummarize: function(charId, chatMessages, callback) {
      var api = App.api ? App.api.getActiveConfig() : null;
      if (!api) { if (callback) callback('请先配置 API'); return; }

      var charData = App.character ? App.character.getById(charId) : null;
      var charName = charData ? charData.name : '角色';
      var userName = '用户';
      if (App.user) { var u = App.user.getActiveUser(); if (u) userName = u.nickname || u.realName || '用户'; }

      var recent = chatMessages.slice(-40);
      var chatText = recent.map(function(m) {
        var who = m.role === 'user' ? userName : charName;
        return who + '：' + (m.content || '').slice(0, 200);
      }).join('\n');

      var existing = Memory.getAll(charId);
      var existingText = existing.map(function(m) { return m.content; }).join('\n');

      var prompt =
        '你是一个记忆提取助手。从以下聊天记录中提取值得长期记忆的关键信息。\n\n' +
        '【聊天记录】\n' + chatText + '\n\n' +
        (existingText ? '【已有记忆（不要重复）】\n' + existingText + '\n\n' : '') +
        '【要求】\n' +
        '1. 提取关于双方的重要信息：性格特点、喜好厌恶、重要经历、关系变化、承诺约定等\n' +
        '2. 每条记忆精简为一句话（15-40字）\n' +
        '3. 不要提取无意义的日常闲聊\n' +
        '4. 不要重复已有记忆\n' +
        '5. 如果没有值得记忆的新内容，返回 [无新记忆]\n\n' +
        '【输出格式】每条一行：\n' +
        '重要度|标签|内容\n' +
        '重要度：high/medium/low\n' +
        '标签：' + TAG_PRESETS.join('、') + '\n\n' +
        '示例：\nhigh|恐惧|她非常怕打雷，暴风雨时会缩在被子里发抖\nmedium|喜好|他最喜欢草莓蛋糕';

      var url = api.url.replace(/\/+$/, '') + '/chat/completions';

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api.key },
        body: JSON.stringify({ model: api.model, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 1000 })
      }).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function(data) {
        var content = '';
        try { content = data.choices[0].message.content || ''; } catch (e) {}
        content = content.trim();

        if (!content || content.indexOf('[无新记忆]') >= 0) { if (callback) callback(null, 0); return; }

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

          var isDuplicate = false;
          existing.forEach(function(ex) {
            if (ex.content === memContent) isDuplicate = true;
          });
          if (isDuplicate) return;

          Memory.add(charId, {
            content: memContent,
            tags: [tag],
            source: 'auto',
            importance: importance,
            autoSend: importance === 'high'
          });
          added++;
        });

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
      page.className = 'fullpage-panel hidden';
      document.body.appendChild(page);
      Memory._pageEl = page;

      Memory.renderList(page, charId);

      page.classList.remove('hidden');
      requestAnimationFrame(function() { page.classList.add('show'); });
      App.bindSwipeBack(page, function() { Memory.closePage(); });
    },

    closePage: function() {
      var p = Memory._pageEl;
      if (!p) return;
      p.classList.remove('show');
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
          '<div class="mem-group-title">' + App.esc(tag) + '<span class="mem-group-count">' + items.length + '</span></div>';

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
              '<div class="mem-auto-toggle ' + (isAutoSend ? 'on' : '') + '" data-mid="' + m.id + '">' +
                '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
              '</div>' +
            '</div>' +
          '</div>';
        });

        groupHtml += '</div>';
      });

      if (!list.length) {
        groupHtml = '<div class="empty-hint">暂无记忆<br>点击右上角手动添加，或使用「AI 总结」自动提取</div>';
      }

      page.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;">' +
          '<button class="pc-close-btn" id="memBackBtn" type="button" style="position:static;"><svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#999;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<div style="font-size:15px;font-weight:700;color:#2e4258;letter-spacing:1px;">' + App.esc(charName) + ' 的记忆</div>' +
          '<button class="pc-close-btn" id="memAddBtn" type="button" style="position:static;font-size:20px;">+</button>' +
        '</div>' +

        '<div style="display:flex;gap:8px;padding:0 16px 12px;">' +
          '<div class="mem-stat-chip">共 ' + totalCount + ' 条</div>' +
          '<div class="mem-stat-chip" style="color:#c9706b;border-color:rgba(201,112,107,.3);">重要 ' + highCount + '</div>' +
          '<div class="mem-stat-chip" style="color:#7a9ab8;border-color:rgba(126,163,201,.4);">自动发送 ' + autoCount + '</div>' +
        '</div>' +

        '<div style="padding:0 16px 8px;">' +
          '<div class="mem-send-config">' +
            '<span class="pc-label" style="margin:0;">发送模式</span>' +
            '<select class="pc-input" id="memSendMode" style="width:auto;padding:5px 10px;">' +
              '<option value="auto"' + (sendConfig.mode === 'auto' ? ' selected' : '') + '>自动（仅标记的）</option>' +
              '<option value="all"' + (sendConfig.mode === 'all' ? ' selected' : '') + '>全部发送</option>' +
              '<option value="none"' + (sendConfig.mode === 'none' ? ' selected' : '') + '>不发送</option>' +
            '</select>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:8px;padding:0 16px 12px;">' +
          '<button class="pc-btn pc-btn-save" id="memSummarizeBtn" type="button" style="flex:1;padding:10px;font-size:12px;">AI 总结</button>' +
          '<button class="pc-btn pc-btn-cancel" id="memExportBtn" type="button" style="flex:0;padding:10px 14px;font-size:12px;">导出</button>' +
          '<button class="pc-btn pc-btn-cancel" id="memImportBtn" type="button" style="flex:0;padding:10px 14px;font-size:12px;">导入</button>' +
          '<input type="file" id="memImportFile" accept=".json" hidden>' +
        '</div>' +

        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 40px;">' + groupHtml + '</div>';

      /* 绑定事件 */
      page.querySelector('#memBackBtn').addEventListener('click', function() { Memory.closePage(); });
      page.querySelector('#memAddBtn').addEventListener('click', function() { Memory.showEditDialog(charId, null); });

      page.querySelector('#memSendMode').addEventListener('change', function() {
        var cfg = App.LS.get('memorySendConfig_' + charId) || {};
        cfg.mode = this.value;
        App.LS.set('memorySendConfig_' + charId, cfg);
        App.showToast('已切换');
      });

      page.querySelector('#memSummarizeBtn').addEventListener('click', function() {
        var msgs = App.LS.get('chatMsgs_' + charId) || [];
        if (msgs.length < 5) { App.showToast('聊天记录太少，至少需要5条'); return; }
        App.showToast('正在分析...');
        Memory.autoSummarize(charId, msgs, function(err, count) {
          if (err) { App.showToast(typeof err === 'string' ? err : '总结失败'); return; }
          if (count === 0) { App.showToast('没有发现新内容'); return; }
          App.showToast('已提取 ' + count + ' 条新记忆');
          Memory.renderList(page, charId);
        });
      });

      page.querySelector('#memExportBtn').addEventListener('click', function() {
        var data = Memory.getAll(charId);
        if (!data.length) { App.showToast('暂无记忆'); return; }
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = 'memory_' + charName + '.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        App.showToast('已导出');
      });

      page.querySelector('#memImportBtn').addEventListener('click', function() { page.querySelector('#memImportFile').click(); });
      page.querySelector('#memImportFile').addEventListener('change', function(e) {
        var file = e.target.files[0]; if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          try {
            var data = JSON.parse(ev.target.result);
            if (!Array.isArray(data)) throw new Error('格式错误');
            var count = 0;
            data.forEach(function(m) { if (m.content) { Memory.add(charId, m); count++; } });
            App.showToast('已导入 ' + count + ' 条');
            Memory.renderList(page, charId);
          } catch (err) { App.showToast('导入失败'); }
        };
        reader.readAsText(file);
      });

      page.querySelectorAll('.mem-auto-toggle').forEach(function(toggle) {
        toggle.addEventListener('click', function(e) {
          e.stopPropagation();
          var mid = toggle.dataset.mid;
          var m = Memory.getById(charId, mid);
          if (!m) return;
          Memory.update(charId, mid, { autoSend: !m.autoSend });
          toggle.classList.toggle('on');
        });
      });

      page.querySelectorAll('.mem-item').forEach(function(item) {
        item.addEventListener('click', function() {
          Memory.showEditDialog(charId, item.dataset.mid);
        });
      });
    },

    /* ★ 编辑弹窗 - 使用 panels.css 的 .pc-edit-overlay + .pc-edit-panel */
    showEditDialog: function(charId, memId) {
      var isEdit = !!memId;
      var m = isEdit ? Memory.getById(charId, memId) : { content: '', tags: [], importance: 'medium', source: 'manual', autoSend: true };
      if (!m) return;

      var old = document.querySelector('#memEditOverlay');
      if (old) old.remove();

      var overlay = document.createElement('div');
      overlay.id = 'memEditOverlay';
      overlay.className = 'pc-edit-overlay';
      overlay.style.zIndex = '100020';

      var tagsHtml = TAG_PRESETS.map(function(t) {
        var sel = (m.tags && m.tags.indexOf(t) >= 0) ? ' mem-tag-sel' : '';
        return '<div class="mem-tag-chip' + sel + '" data-tag="' + t + '">' + App.esc(t) + '</div>';
      }).join('');

      var impBtns = ['high', 'medium', 'low'].map(function(imp) {
        var active = m.importance === imp ? ' active' : '';
        return '<button class="mem-imp-btn' + active + '" data-imp="' + imp + '" type="button">' + IMPORTANCE_NAMES[imp] + '</button>';
      }).join('');

      overlay.innerHTML =
        '<div class="pc-edit-panel" style="width:320px;max-height:80vh;overflow-y:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">' +
          '<div class="pc-header">' + (isEdit ? '编辑记忆' : '添加记忆') + '<div class="pc-close-btn" id="memEditClose">×</div></div>' +
          '<div class="pc-body">' +
            '<div class="pc-group">' +
              '<label class="pc-label">内容</label>' +
              '<textarea class="pc-input" id="memEditContent" style="min-height:70px;resize:vertical;" placeholder="记忆内容...">' + App.esc(m.content || '') + '</textarea>' +
            '</div>' +
            '<div class="pc-group">' +
              '<label class="pc-label">标签</label>' +
              '<div style="display:flex;flex-wrap:wrap;gap:5px;" id="memEditTags">' + tagsHtml + '</div>' +
            '</div>' +
            '<div class="pc-group">' +
              '<label class="pc-label">重要度</label>' +
              '<div style="display:flex;gap:6px;">' + impBtns + '</div>' +
            '</div>' +
            '<div class="pc-group">' +
              '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">' +
                '<input type="checkbox" id="memEditAutoSend"' + (m.autoSend ? ' checked' : '') + ' style="width:15px;height:15px;">' +
                '<span class="pc-label" style="margin:0;">自动发送给 AI</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
          '<div class="pc-footer">' +
            '<button class="pc-btn pc-btn-save" id="memEditSave" type="button">保存</button>' +
            (isEdit ? '<button class="pc-btn pc-btn-cancel" id="memEditDel" type="button" style="color:#c9706b;">删除</button>' : '') +
            '<button class="pc-btn pc-btn-cancel" id="memEditCancel" type="button">取消</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector('#memEditClose').addEventListener('click', function() { overlay.remove(); });
      overlay.querySelector('#memEditCancel').addEventListener('click', function() { overlay.remove(); });

      var selectedTags = m.tags ? m.tags.slice() : [];
      overlay.querySelectorAll('.mem-tag-chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
          var tag = chip.dataset.tag;
          var idx = selectedTags.indexOf(tag);
          if (idx >= 0) { selectedTags.splice(idx, 1); chip.classList.remove('mem-tag-sel'); }
          else { selectedTags.push(tag); chip.classList.add('mem-tag-sel'); }
        });
      });

      var selectedImp = m.importance || 'medium';
      overlay.querySelectorAll('.mem-imp-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          overlay.querySelectorAll('.mem-imp-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          selectedImp = btn.dataset.imp;
        });
      });

      overlay.querySelector('#memEditSave').addEventListener('click', function() {
        var content = overlay.querySelector('#memEditContent').value.trim();
        if (!content) { App.showToast('请输入内容'); return; }
        var autoSend = overlay.querySelector('#memEditAutoSend').checked;

        if (isEdit) {
          Memory.update(charId, memId, { content: content, tags: selectedTags, importance: selectedImp, autoSend: autoSend });
        } else {
          Memory.add(charId, { content: content, tags: selectedTags, importance: selectedImp, source: 'manual', autoSend: autoSend });
        }

        overlay.remove();
        if (Memory._pageEl) Memory.renderList(Memory._pageEl, charId);
        App.showToast(isEdit ? '已更新' : '已添加');
      });

      if (isEdit) {
        overlay.querySelector('#memEditDel').addEventListener('click', function() {
          if (!confirm('确定删除？')) return;
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
