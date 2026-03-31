(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var WorldBook = {

    entries: [],

    empty: function() {
      return {
        id: '',
        type: 'global',
        name: '',
        keywords: '',
        content: '',
        enabled: true,
        order: 0
      };
    },

    save: function() {
      App.LS.set('worldBookEntries', WorldBook.entries);
    },

    load: function() {
      WorldBook.entries = App.LS.get('worldBookEntries') || [];
    },

    add: function(data) {
      data.id = 'wb-' + Date.now();
      WorldBook.entries.push(data);
      WorldBook.save();
      return data;
    },

    update: function(id, data) {
      for (var i = 0; i < WorldBook.entries.length; i++) {
        if (WorldBook.entries[i].id === id) {
          data.id = id;
          WorldBook.entries[i] = data;
          break;
        }
      }
      WorldBook.save();
    },

    remove: function(id) {
      WorldBook.entries = WorldBook.entries.filter(function(e) { return e.id !== id; });
      WorldBook.save();
    },

    getById: function(id) {
      for (var i = 0; i < WorldBook.entries.length; i++) {
        if (WorldBook.entries[i].id === id) return WorldBook.entries[i];
      }
      return null;
    },

    toggleEnabled: function(id) {
      var entry = WorldBook.getById(id);
      if (entry) {
        entry.enabled = !entry.enabled;
        WorldBook.save();
      }
      return entry;
    },

    getGlobalEntries: function() {
      return WorldBook.entries.filter(function(e) {
        return e.type === 'global' && e.enabled;
      });
    },

    getMatchedEntries: function(text) {
      if (!text) return [];
      var matched = [];
      WorldBook.entries.forEach(function(e) {
        if (e.type !== 'keyword' || !e.enabled || !e.keywords) return;
        var keys = e.keywords.split(',').map(function(k) { return k.trim().toLowerCase(); });
        var lowerText = text.toLowerCase();
        for (var i = 0; i < keys.length; i++) {
          if (keys[i] && lowerText.indexOf(keys[i]) !== -1) {
            matched.push(e);
            break;
          }
        }
      });
      return matched;
    },

    buildWorldText: function(conversationText) {
      var parts = [];
      var globals = WorldBook.getGlobalEntries();
      globals.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
      globals.forEach(function(e) {
        if (e.content) parts.push(e.content);
      });

      var keywords = WorldBook.getMatchedEntries(conversationText || '');
      keywords.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
      keywords.forEach(function(e) {
        if (e.content) parts.push(e.content);
      });

      return parts.join('\n\n');
    },

    // ========= 面板 =========

    openPanel: function() {
      WorldBook.renderListView();
      var panel = App.$('#worldBookPanel');
      if (!panel) return;
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    closePanel: function() {
      var panel = App.$('#worldBookPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderListView: function() {
      var panel = App.$('#worldBookPanel');
      if (!panel) return;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closeWorldBookPanel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>世界书</h2>' +
          '<button class="fullpage-action-btn" id="addWorldBookBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="wb-tabs">' +
          '<button class="wb-tab active" data-filter="all" type="button">全部</button>' +
          '<button class="wb-tab" data-filter="global" type="button">全局</button>' +
          '<button class="wb-tab" data-filter="keyword" type="button">关键词</button>' +
        '</div>' +
        '<div class="fullpage-body" id="worldBookListBody"></div>';

      App.safeOn('#closeWorldBookPanel', 'click', function() { WorldBook.closePanel(); });
      App.safeOn('#addWorldBookBtn', 'click', function() { WorldBook.renderEditView(null); });

      panel.querySelectorAll('.wb-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          panel.querySelectorAll('.wb-tab').forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          WorldBook.renderCards(tab.dataset.filter);
        });
      });

      WorldBook.renderCards('all');
    },

    renderCards: function(filter) {
      var body = App.$('#worldBookListBody');
      if (!body) return;

      var list = WorldBook.entries;
      if (filter === 'global') {
        list = list.filter(function(e) { return e.type === 'global'; });
      } else if (filter === 'keyword') {
        list = list.filter(function(e) { return e.type === 'keyword'; });
      }

      if (!list.length) {
        var hint = filter === 'global' ? '还没有全局条目' :
                   filter === 'keyword' ? '还没有关键词条目' : '还没有世界书条目';
        body.innerHTML = '<div class="empty-hint">' + hint + '，点击右上角 + 创建</div>';
        return;
      }

      body.innerHTML = list.map(function(e) {
        var typeLabel = e.type === 'global' ? '全局' : '关键词';
        var typeClass = e.type === 'global' ? 'wb-type-global' : 'wb-type-keyword';
        return '<div class="wb-card' + (e.enabled ? '' : ' wb-disabled') + '" data-id="' + e.id + '">' +
          '<div class="wb-card-top">' +
            '<div class="wb-card-left">' +
              '<span class="wb-type-badge ' + typeClass + '">' + typeLabel + '</span>' +
              '<span class="wb-card-name">' + App.esc(e.name || '未命名') + '</span>' +
            '</div>' +
            '<div class="wb-card-right">' +
              '<button class="wb-toggle-btn' + (e.enabled ? ' active' : '') + '" data-id="' + e.id + '" data-role="toggle" type="button">' +
                '<span class="wb-toggle-dot"></span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          (e.type === 'keyword' && e.keywords ?
            '<div class="wb-card-keywords">' + App.esc(e.keywords) + '</div>' : '') +
          '<div class="wb-card-preview">' + App.esc((e.content || '').slice(0, 80)) + '</div>' +
          '<div class="wb-card-actions">' +
            '<button class="wb-edit-btn" data-id="' + e.id + '" type="button">编辑</button>' +
            '<button class="wb-del-btn" data-id="' + e.id + '" type="button">删除</button>' +
            '<span class="wb-order-label">优先级: ' + (e.order || 0) + '</span>' +
          '</div>' +
        '</div>';
      }).join('');

      // 开关
      body.querySelectorAll('[data-role="toggle"]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var entry = WorldBook.toggleEnabled(btn.dataset.id);
          if (!entry) return;
          btn.classList.toggle('active', entry.enabled);
          btn.closest('.wb-card').classList.toggle('wb-disabled', !entry.enabled);
        });
      });

      // 编辑
      body.querySelectorAll('.wb-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          WorldBook.renderEditView(btn.dataset.id);
        });
      });

      // 删除
      body.querySelectorAll('.wb-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除？')) return;
          WorldBook.remove(btn.dataset.id);
          var activeTab = App.$('.wb-tab.active');
          WorldBook.renderCards(activeTab ? activeTab.dataset.filter : 'all');
          App.showToast('已删除');
        });
      });
    },

    renderEditView: function(id) {
      var panel = App.$('#worldBookPanel');
      if (!panel) return;

      var e = id ? (WorldBook.getById(id) || WorldBook.empty()) : WorldBook.empty();
      var isNew = !id;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToWbList">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '新建条目' : '编辑条目') + '</h2>' +
          '<button class="fullpage-action-btn" id="saveWbBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +

          '<div class="form-group">' +
            '<label>类型</label>' +
            '<div class="wb-type-switch">' +
              '<button class="wb-type-opt' + (e.type === 'global' ? ' active' : '') + '" data-val="global" type="button">全局</button>' +
              '<button class="wb-type-opt' + (e.type === 'keyword' ? ' active' : '') + '" data-val="keyword" type="button">关键词</button>' +
            '</div>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>名称</label>' +
            '<input type="text" id="wbName" value="' + App.esc(e.name || '') + '" placeholder="条目名称">' +
          '</div>' +

          '<div class="form-group" id="wbKeywordsGroup"' + (e.type === 'global' ? ' style="display:none"' : '') + '>' +
            '<label>关键词（逗号分隔）</label>' +
            '<input type="text" id="wbKeywords" value="' + App.esc(e.keywords || '') + '" placeholder="关键词1, 关键词2, ...">' +
          '</div>' +

          '<div class="form-group">' +
            '<label>内容</label>' +
            '<div class="textarea-expand-row">' +
              '<textarea id="wbContent" class="form-textarea" placeholder="世界书内容..." rows="8">' + App.esc(e.content || '') + '</textarea>' +
              '<button class="field-expand-btn" id="wbContentExpand" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>优先级（数字越小越靠前）</label>' +
            '<input type="number" id="wbOrder" value="' + (e.order || 0) + '" placeholder="0">' +
          '</div>' +

          '<div class="form-group">' +
            '<label>启用</label>' +
            '<button class="wb-toggle-btn' + (e.enabled ? ' active' : '') + '" id="wbEnabledToggle" type="button">' +
              '<span class="wb-toggle-dot"></span>' +
            '</button>' +
          '</div>' +

        '</div>';

      // 类型切换
      var currentType = e.type || 'global';
      panel.querySelectorAll('.wb-type-opt').forEach(function(btn) {
        btn.addEventListener('click', function() {
          panel.querySelectorAll('.wb-type-opt').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          currentType = btn.dataset.val;
          var kg = App.$('#wbKeywordsGroup');
          if (kg) kg.style.display = currentType === 'keyword' ? '' : 'none';
        });
      });

      // 启用切换
      var enabled = e.enabled !== false;
      App.safeOn('#wbEnabledToggle', 'click', function() {
        enabled = !enabled;
        this.classList.toggle('active', enabled);
      });

      // 放大编辑
      App.safeOn('#wbContentExpand', 'click', function() {
        var ta = App.$('#wbContent');
        var val = ta ? ta.value : '';
        WorldBook.openExpandEditor('内容', '世界书内容...', val, function(newVal) {
          if (ta) ta.value = newVal;
        });
      });

      // 返回
      App.safeOn('#backToWbList', 'click', function() {
        WorldBook.renderListView();
      });

      // 保存
      App.safeOn('#saveWbBtn', 'click', function() {
        var data = {
          type: currentType,
          name: (App.$('#wbName') ? App.$('#wbName').value.trim() : ''),
          keywords: (App.$('#wbKeywords') ? App.$('#wbKeywords').value.trim() : ''),
          content: (App.$('#wbContent') ? App.$('#wbContent').value.trim() : ''),
          order: parseInt(App.$('#wbOrder') ? App.$('#wbOrder').value : '0', 10) || 0,
          enabled: enabled
        };

        if (!data.name) {
          App.showToast('请填写条目名称');
          return;
        }

        if (currentType === 'keyword' && !data.keywords) {
          App.showToast('请填写关键词');
          return;
        }

        if (!data.content) {
          App.showToast('请填写内容');
          return;
        }

        if (isNew) {
          WorldBook.add(data);
          App.showToast('条目已创建');
        } else {
          WorldBook.update(id, data);
          App.showToast('条目已保存');
        }

        WorldBook.renderListView();
      });
    },

    openExpandEditor: function(label, placeholder, currentVal, onSave) {
      var existing = App.$('#expandEditor');
      if (existing) existing.remove();

      var editor = document.createElement('div');
      editor.id = 'expandEditor';
      editor.className = 'expand-editor';
      editor.innerHTML =
        '<div class="expand-editor-header">' +
          '<div class="fullpage-back" id="expandEditorBack">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + label + '</h2>' +
          '<button class="fullpage-action-btn" id="expandEditorSave" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="expand-editor-body">' +
          '<textarea id="expandEditorTextarea" class="expand-editor-textarea" placeholder="' + placeholder + '">' + App.esc(currentVal || '') + '</textarea>' +
        '</div>';

      document.body.appendChild(editor);
      requestAnimationFrame(function() {
        editor.classList.add('show');
        var ta = App.$('#expandEditorTextarea');
        if (ta) ta.focus();
      });

      App.safeOn('#expandEditorBack', 'click', function() {
        WorldBook.closeExpandEditor();
      });

      App.safeOn('#expandEditorSave', 'click', function() {
        var ta = App.$('#expandEditorTextarea');
        var val = ta ? ta.value : '';
        if (onSave) onSave(val);
        WorldBook.closeExpandEditor();
        App.showToast(label + ' 已更新');
      });
    },

    closeExpandEditor: function() {
      var editor = App.$('#expandEditor');
      if (!editor) return;
      editor.classList.remove('show');
      setTimeout(function() {
        if (editor.parentNode) editor.parentNode.removeChild(editor);
      }, 350);
    },

    bindEvents: function() {
      App.safeOn('#openWorldBookBtn', 'click', function() {
        WorldBook.openPanel();
      });
    },

    init: function() {
      WorldBook.load();
      if (!App.$('#worldBookPanel')) {
        var panel = document.createElement('div');
        panel.id = 'worldBookPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }
      App.worldbook = WorldBook;
      WorldBook.bindEvents();
    }
  };

  App.register('worldbook', WorldBook);
})();
