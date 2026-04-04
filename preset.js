(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Preset = {
    POSITIONS: [
      { value: 'before-char', label: '角色定义前' },
      { value: 'after-char', label: '角色定义后' },
      { value: 'before-example', label: '对话示例前' },
      { value: 'after-example', label: '对话示例后' },
      { value: 'depth', label: '精确深度' }
    ],

    list: [],

    load: function() {
      Preset.list = App.LS.get('presets') || [];
    },
    save: function() {
      App.LS.set('presets', Preset.list);
    },
    getById: function(id) {
      for (var i = 0; i < Preset.list.length; i++) {
        if (Preset.list[i].id === id) return Preset.list[i];
      }
      return null;
    },
    empty: function() {
      return {
        id: 'preset-' + Date.now(),
        name: '',
        systemPrompt: '',
        position: 'before-char',
        depth: 0,
        enabled: false
      };
    },
    remove: function(id) {
      Preset.list = Preset.list.filter(function(p) { return p.id !== id; });
      Preset.save();
    },
    getActive: function() {
      return Preset.list.filter(function(p) { return p.enabled; });
    },

    openPanel: function() {
      var panel = App.$('#presetPanel');
      if (!panel) return;
      Preset.renderList();
      panel.classList.remove('hidden');
      setTimeout(function() { panel.classList.add('show'); }, 20);
    },

    closePanel: function() {
      var panel = App.$('#presetPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderList: function() {
      var panel = App.$('#presetPanel');
      if (!panel) return;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closePresetPanel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>预设</h2>' +
          '<button class="fullpage-action-btn" id="addPresetBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body sortable-list" id="presetListBody"></div>';

      App.safeOn('#closePresetPanel', 'click', function() { Preset.closePanel(); });
      App.safeOn('#addPresetBtn', 'click', function() { Preset.renderEditView(null); });

      Preset.renderCards();
    },

    renderCards: function() {
      var body = App.$('#presetListBody');
      if (!body) return;

      if (!Preset.list.length) {
        body.innerHTML = '<div class="empty-hint">还没有预设，点击右上角 + 创建</div>';
        return;
      }

      body.innerHTML = Preset.list.map(function(p, idx) {
        var posLabel = '';
        for (var i = 0; i < Preset.POSITIONS.length; i++) {
          if (Preset.POSITIONS[i].value === p.position) { posLabel = Preset.POSITIONS[i].label; break; }
        }
        if (p.position === 'depth') posLabel += ' ' + (p.depth || 0);

        return '<div class="sortable-card" data-id="' + p.id + '" data-idx="' + idx + '">' +
          '<div class="sortable-drag-handle">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/></svg>' +
          '</div>' +
          '<div class="sortable-card-body">' +
            '<div class="sortable-card-top">' +
              '<div class="sortable-card-name">' + App.esc(p.name || '未命名') + '</div>' +
              '<span class="sortable-card-pos">' + posLabel + '</span>' +
            '</div>' +
            '<div class="sortable-card-desc">' + App.esc((p.systemPrompt || '').slice(0, 50)) + '</div>' +
          '</div>' +
          '<div class="sortable-card-actions">' +
            '<button class="wb-toggle" data-id="' + p.id + '" type="button">' +
              '<div class="toggle-switch' + (p.enabled ? ' on' : '') + '"></div>' +
            '</button>' +
            '<button class="char-edit-btn" data-id="' + p.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
            '</button>' +
            '<button class="char-del-btn" data-id="' + p.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.wb-toggle').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var entry = Preset.getById(btn.dataset.id);
          if (!entry) return;
          entry.enabled = !entry.enabled;
          Preset.save();
          Preset.renderCards();
        });
      });

      body.querySelectorAll('.char-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          Preset.renderEditView(btn.dataset.id);
        });
      });

      body.querySelectorAll('.char-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除？')) return;
          Preset.remove(btn.dataset.id);
          Preset.renderCards();
          App.showToast('已删除');
        });
      });

      Preset.initSortable(body, Preset.list, function() { Preset.save(); Preset.renderCards(); });
    },

    renderEditView: function(id) {
      var panel = App.$('#presetPanel');
      if (!panel) return;

      var isNew = !id;
      var p = isNew ? Preset.empty() : Preset.getById(id);
      if (!p) return;

      var posOptions = Preset.POSITIONS.map(function(pos) {
        return '<option value="' + pos.value + '"' + (p.position === pos.value ? ' selected' : '') + '>' + pos.label + '</option>';
      }).join('');

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToPresetList">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '新建预设' : '编辑预设') + '</h2>' +
          '<button class="fullpage-action-btn" id="savePresetBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +

          '<div class="form-group">' +
            '<label>预设名称</label>' +
            '<input type="text" id="presetName" value="' + App.esc(p.name || '') + '" placeholder="例如：创意写作、严谨对话...">' +
          '</div>' +

          '<div class="field-card">' +
            '<div class="field-card-top">' +
              '<div class="field-card-label">系统指令</div>' +
            '</div>' +
            '<div class="field-card-body">' +
              '<textarea class="field-card-textarea" id="presetSystemPrompt" rows="10" placeholder="自定义系统指令...">' + App.esc(p.systemPrompt || '') + '</textarea>' +
              '<button class="field-expand-btn" id="presetExpandBtn" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
                '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div class="form-group">' +
            '<label>排列位置</label>' +
            '<select class="form-select" id="presetPosition">' + posOptions + '</select>' +
          '</div>' +

          '<div class="form-group' + (p.position === 'depth' ? '' : ' hidden') + '" id="presetDepthGroup">' +
            '<label>深度值（0 = 最底部）</label>' +
            '<input type="number" id="presetDepth" value="' + (p.depth || 0) + '" min="0" max="100">' +
          '</div>' +

        '</div>';

      App.safeOn('#presetPosition', 'change', function() {
        var val = App.$('#presetPosition').value;
        App.$('#presetDepthGroup').classList.toggle('hidden', val !== 'depth');
      });

      App.safeOn('#presetExpandBtn', 'click', function() {
        var textarea = App.$('#presetSystemPrompt');
        if (!textarea) return;
        Preset.openExpandEditor('系统指令', textarea);
      });

      App.safeOn('#backToPresetList', 'click', function() { Preset.renderList(); });

      App.safeOn('#savePresetBtn', 'click', function() {
        var name = App.$('#presetName').value.trim();
        if (!name) {
          App.showToast('请输入预设名称');
          return;
        }

        p.name = name;
        p.systemPrompt = App.$('#presetSystemPrompt').value;
        p.position = App.$('#presetPosition').value;
        p.depth = parseInt(App.$('#presetDepth') ? App.$('#presetDepth').value : '0', 10) || 0;

        if (isNew) Preset.list.push(p);
        Preset.save();
        Preset.renderList();
        App.showToast(isNew ? '预设已创建' : '已保存');
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
      var startY = 0;
      var offsetY = 0;
      var cards = [];

      container.querySelectorAll('.sortable-drag-handle').forEach(function(handle) {
        handle.addEventListener('touchstart', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var card = handle.closest('.sortable-card');
          if (!card) return;

          dragEl = card;
          dragIdx = parseInt(card.dataset.idx, 10);
          cards = Array.from(container.querySelectorAll('.sortable-card'));

          var rect = card.getBoundingClientRect();
          var t = e.touches[0];
          startY = t.clientY;
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

        var allCards = Array.from(container.querySelectorAll('.sortable-card:not(.sortable-dragging), .sortable-placeholder'));
        var newIdx = 0;
        for (var i = 0; i < allCards.length; i++) {
          if (allCards[i] === placeholder) { newIdx = i; break; }
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
      Preset.load();
      if (!App.$('#presetPanel')) {
        var panel = document.createElement('div');
        panel.id = 'presetPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }
      App.preset = Preset;
      App.safeOn('#openPresetBtn', 'click', function() {
        Preset.openPanel();
      });
    }
  };

  App.register('preset', Preset);
})();
