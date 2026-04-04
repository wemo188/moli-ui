(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var WB = {
    POSITIONS: [
      { value: 'before-char', label: '角色定义前' },
      { value: 'after-char', label: '角色定义后' },
      { value: 'before-example', label: '对话示例前' },
      { value: 'after-example', label: '对话示例后' },
      { value: 'depth', label: '精确深度' }
    ],

    list: [],

    load: function() {
      WB.list = App.LS.get('worldbook') || [];
    },
    save: function() {
      App.LS.set('worldbook', WB.list);
    },
    getById: function(id) {
      for (var i = 0; i < WB.list.length; i++) {
        if (WB.list[i].id === id) return WB.list[i];
      }
      return null;
    },
    empty: function() {
      return {
        id: 'wb-' + Date.now(),
        name: '',
        content: '',
        permanent: false,
        useKeyword: false,
        keywords: '',
        position: 'before-char',
        depth: 0,
        enabled: true
      };
    },
    remove: function(id) {
      WB.list = WB.list.filter(function(e) { return e.id !== id; });
      WB.save();
    },

    openPanel: function() {
      var panel = App.$('#worldbookPanel');
      if (!panel) return;
      WB.renderList();
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    closePanel: function() {
      var panel = App.$('#worldbookPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderList: function() {
      var panel = App.$('#worldbookPanel');
      if (!panel) return;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closeWBPanel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>世界书</h2>' +
          '<button class="fullpage-action-btn" id="addWBBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body sortable-list" id="wbListBody"></div>';

      App.safeOn('#closeWBPanel', 'click', function() { WB.closePanel(); });
      App.safeOn('#addWBBtn', 'click', function() { WB.renderEditView(null); });

      WB.renderCards();
    },

    renderCards: function() {
      var body = App.$('#wbListBody');
      if (!body) return;

      if (!WB.list.length) {
        body.innerHTML = '<div class="empty-hint">还没有条目，点击右上角 + 创建</div>';
        return;
      }

      body.innerHTML = WB.list.map(function(e, idx) {
        var tags = [];
        if (e.permanent) tags.push('<span class="wb-tag wb-tag-perm">常驻</span>');
        if (e.useKeyword) tags.push('<span class="wb-tag wb-tag-kw">关键词</span>');
        var posLabel = '';
        for (var i = 0; i < WB.POSITIONS.length; i++) {
          if (WB.POSITIONS[i].value === e.position) { posLabel = WB.POSITIONS[i].label; break; }
        }
        if (e.position === 'depth') posLabel += ' ' + (e.depth || 0);

        return '<div class="sortable-card' + (!e.enabled ? ' wb-disabled' : '') + '" data-id="' + e.id + '" data-idx="' + idx + '">' +
          '<div class="sortable-drag-handle">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/></svg>' +
          '</div>' +
          '<div class="sortable-card-body">' +
            '<div class="sortable-card-top">' +
              '<div class="sortable-card-left">' +
                '<div class="sortable-card-name">' + App.esc(e.name || '未命名') + '</div>' +
                '<div class="sortable-card-tags">' + tags.join('') + '</div>' +
              '</div>' +
              '<span class="sortable-card-pos">' + posLabel + '</span>' +
            '</div>' +
            (e.useKeyword && e.keywords
              ? '<div class="sortable-card-keywords">' + App.esc(e.keywords) + '</div>'
              : '') +
            '<div class="sortable-card-desc">' + App.esc((e.content || '').slice(0, 60)) + '</div>' +
          '</div>' +
          '<div class="sortable-card-actions">' +
            '<div class="toggle-sm' + (e.enabled ? ' on' : '') + '" data-id="' + e.id + '" data-role="toggle"></div>' +
            '<button class="sortable-edit-btn" data-id="' + e.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
            '</button>' +
            '<button class="sortable-del-btn" data-id="' + e.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('[data-role="toggle"]').forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.stopPropagation();
          var entry = WB.getById(el.dataset.id);
          if (!entry) return;
          entry.enabled = !entry.enabled;
          WB.save();
          WB.renderCards();
        });
      });

      body.querySelectorAll('.sortable-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          WB.renderEditView(btn.dataset.id);
        });
      });

      body.querySelectorAll('.sortable-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除？')) return;
          WB.remove(btn.dataset.id);
          WB.renderCards();
          App.showToast('已删除');
        });
      });

      WB.initSortable(body, WB.list, function() { WB.save(); WB.renderCards(); });
    },

    renderEditView: function(id) {
      var panel = App.$('#worldbookPanel');
      if (!panel) return;

      var isNew = !id;
      var e = isNew ? WB.empty() : WB.getById(id);
      if (!e) return;

      var posOptions = WB.POSITIONS.map(function(p) {
        return '<option value="' + p.value + '"' + (e.position === p.value ? ' selected' : '') + '>' + p.label + '</option>';
      }).join('');

      var isDepth = e.position === 'depth';

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToWBList">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '新建条目' : '编辑条目') + '</h2>' +
          '<button class="fullpage-action-btn" id="saveWBBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +
          '<div class="form-group">' +
            '<label>名称</label>' +
            '<input type="text" id="wbName" value="' + App.esc(e.name || '') + '" placeholder="条目名称">' +
          '</div>' +

          '<div class="field-card">' +
            '<div class="field-card-top">' +
              '<div class="field-card-label">内容</div>' +
            '</div>' +
            '<div class="field-card-body">' +
              '<textarea class="field-card-textarea" id="wbContent" rows="6" placeholder="条目内容...">' + App.esc(e.content || '') + '</textarea>' +
              '<button class="field-expand-btn" id="wbExpandBtn" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
                '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div class="wb-toggle-row">' +
            '<div class="wb-toggle-item">' +
              '<span>常驻</span>' +
              '<div class="toggle-switch' + (e.permanent ? ' on' : '') + '" id="wbPermanentToggle"></div>' +
            '</div>' +
            '<div class="wb-toggle-item">' +
              '<span>关键词</span>' +
              '<div class="toggle-switch' + (e.useKeyword ? ' on' : '') + '" id="wbKeywordToggle"></div>' +
            '</div>' +
          '</div>' +

          '<div class="form-group' + (e.useKeyword ? '' : ' field-hidden') + '" id="wbKeywordsGroup">' +
            '<label>关键词（逗号分隔）</label>' +
            '<input type="text" id="wbKeywords" value="' + App.esc(e.keywords || '') + '" placeholder="关键词1, 关键词2...">' +
          '</div>' +

          '<div class="form-group">' +
            '<label>排列位置</label>' +
            '<select class="form-select" id="wbPosition">' + posOptions + '</select>' +
          '</div>' +

          '<div class="form-group' + (isDepth ? '' : ' field-hidden') + '" id="wbDepthGroup">' +
            '<label>深度值（0 = 最底部）</label>' +
            '<input type="number" id="wbDepth" value="' + (e.depth || 0) + '" min="0" max="100">' +
          '</div>' +

        '</div>';

      App.safeOn('#backToWBList', 'click', function() { WB.renderList(); });

      App.safeOn('#wbExpandBtn', 'click', function() {
        var textarea = App.$('#wbContent');
        if (!textarea) return;
        WB.openExpandEditor('内容', textarea);
      });

      var permState = e.permanent;
      App.safeOn('#wbPermanentToggle', 'click', function() {
        permState = !permState;
        App.$('#wbPermanentToggle').classList.toggle('on', permState);
      });

      var kwState = e.useKeyword;
      App.safeOn('#wbKeywordToggle', 'click', function() {
        kwState = !kwState;
        App.$('#wbKeywordToggle').classList.toggle('on', kwState);
        var group = App.$('#wbKeywordsGroup');
        if (kwState) {
          group.classList.remove('field-hidden');
        } else {
          group.classList.add('field-hidden');
        }
      });

      App.safeOn('#wbPosition', 'change', function() {
        var val = App.$('#wbPosition').value;
        var group = App.$('#wbDepthGroup');
        if (val === 'depth') {
          group.classList.remove('field-hidden');
        } else {
          group.classList.add('field-hidden');
        }
      });

      App.safeOn('#saveWBBtn', 'click', function() {
        var name = App.$('#wbName').value.trim();
        if (!name) {
          App.showToast('请输入名称');
          return;
        }

        e.name = name;
        e.content = App.$('#wbContent').value;
        e.permanent = permState;
        e.useKeyword = kwState;
        e.keywords = App.$('#wbKeywords') ? App.$('#wbKeywords').value.trim() : '';
        e.position = App.$('#wbPosition').value;
        e.depth = e.position === 'depth' ? (parseInt(App.$('#wbDepth') ? App.$('#wbDepth').value : '0', 10) || 0) : 0;

        if (isNew) {
          e.enabled = true;
          WB.list.push(e);
        }
        WB.save();
        WB.renderList();
        App.showToast(isNew ? '条目已创建' : '已保存');
      });
    },

    openExpandEditor: function(title, sourceTextarea) {
      var existing = App.$('#expandEditor');
      if (existing) existing.remove();

      var editor = document.createElement('div');
      editor.id = 'expandEditor';
      editor.className = 'expand-editor';
      editor.innerHTML =
        '<div class="expand-editor-header">' +
          '<div class="fullpage-back" id="expandEditorBack">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + App.esc(title) + '</h2>' +
          '<button class="fullpage-action-btn" id="expandEditorDone" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="expand-editor-body">' +
          '<textarea class="expand-editor-textarea" id="expandTextarea">' + App.esc(sourceTextarea.value) + '</textarea>' +
        '</div>';

      document.body.appendChild(editor);
      setTimeout(function() { editor.classList.add('show'); }, 20);

      function closeEditor() {
        sourceTextarea.value = App.$('#expandTextarea').value;
        editor.classList.remove('show');
        setTimeout(function() { editor.remove(); }, 300);
      }

      App.safeOn('#expandEditorBack', 'click', closeEditor);
      App.safeOn('#expandEditorDone', 'click', closeEditor);
    },

    initSortable: function(container, list, onDone) {
      var dragEl = null;
      var dragIdx = -1;
      var placeholder = null;
      var offsetY = 0;

      container.querySelectorAll('.sortable-drag-handle').forEach(function(handle) {
        handle.addEventListener('touchstart', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var card = handle.closest('.sortable-card');
          if (!card) return;

          dragEl = card;
          dragIdx = parseInt(card.dataset.idx, 10);

          var rect = card.getBoundingClientRect();
          var t = e.touches[0];
          offsetY = t.clientY - rect.top;

          placeholder = document.createElement('div');
          placeholder.className = 'sortable-placeholder';
          placeholder.style.height = rect.height + 'px';
          card.parentNode.insertBefore(placeholder, card);

          card.classList.add('sortable-dragging');
          card.style.position = 'fixed';
          card.style.left = rect.left + 'px';
          card.style.top = (t.clientY - offsetY) + 'px';
          card.style.width = rect.width + 'px';
          card.style.zIndex = '99999';

                    document.addEventListener('touchmove', onMove, { passive: false });
          document.addEventListener('touchend', onEnd);
        }, { passive: false });
      });

      function onMove(e) {
        if (!dragEl) return;
        e.preventDefault();
        var t = e.touches[0];
        dragEl.style.top = (t.clientY - offsetY) + 'px';

        var siblings = Array.from(container.querySelectorAll('.sortable-card:not(.sortable-dragging)'));
        var inserted = false;
        for (var i = 0; i < siblings.length; i++) {
          var rect = siblings[i].getBoundingClientRect();
          var mid = rect.top + rect.height / 2;
          if (t.clientY < mid) {
            container.insertBefore(placeholder, siblings[i]);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          container.appendChild(placeholder);
        }
      }

      function onEnd() {
        if (!dragEl) return;
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);

        var allItems = Array.from(container.querySelectorAll('.sortable-card:not(.sortable-dragging), .sortable-placeholder'));
        var newIdx = 0;
        for (var i = 0; i < allItems.length; i++) {
          if (allItems[i] === placeholder) { newIdx = i; break; }
        }

        if (placeholder && placeholder.parentNode) {
          placeholder.parentNode.replaceChild(dragEl, placeholder);
        }

        dragEl.classList.remove('sortable-dragging');
        dragEl.style.position = '';
        dragEl.style.left = '';
        dragEl.style.top = '';
        dragEl.style.width = '';
        dragEl.style.zIndex = '';

        if (dragIdx !== newIdx && dragIdx >= 0 && newIdx >= 0) {
          var item = list.splice(dragIdx, 1)[0];
          list.splice(newIdx, 0, item);
          onDone();
        }

        dragEl = null;
        placeholder = null;
        dragIdx = -1;
      }
    },

    init: function() {
      WB.load();
      App.worldbook = WB;

      if (!App.$('#worldbookPanel')) {
        var panel = document.createElement('div');
        panel.id = 'worldbookPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }

      App.safeOn('#openWorldBookBtn', 'click', function() {
        WB.openPanel();
      });
    }
  };

  App.register('worldbook', WB);
})();
