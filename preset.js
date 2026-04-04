(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Preset = {
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
        temperature: 0.85,
        maxTokens: 2048,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        enabled: false
      };
    },
    remove: function(id) {
      Preset.list = Preset.list.filter(function(p) { return p.id !== id; });
      Preset.save();
    },
    getActive: function() {
      for (var i = 0; i < Preset.list.length; i++) {
        if (Preset.list[i].enabled) return Preset.list[i];
      }
      return null;
    },
    setActive: function(id) {
      Preset.list.forEach(function(p) { p.enabled = (p.id === id); });
      Preset.save();
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
        '<div class="fullpage-body" id="presetListBody"></div>';

      App.safeOn('#closePresetPanel', 'click', function() { Preset.closePanel(); });
      App.safeOn('#addPresetBtn', 'click', function() { Preset.renderEditView(null); });

      var body = App.$('#presetListBody');

      if (!Preset.list.length) {
        body.innerHTML = '<div class="empty-hint">还没有预设，点击右上角 + 创建</div>';
        return;
      }

      body.innerHTML = Preset.list.map(function(p) {
        return '<div class="char-card' + (p.enabled ? ' user-active' : '') + '" data-id="' + p.id + '">' +
          '<div class="char-card-info" style="flex:1">' +
            '<div class="char-card-name">' + App.esc(p.name || '未命名') + '</div>' +
            '<div class="char-card-desc">' +
              'T:' + p.temperature + ' / MaxTk:' + p.maxTokens + ' / TopP:' + p.topP +
            '</div>' +
            '<div class="char-card-desc" style="margin-top:2px;color:var(--text-muted)">' +
              App.esc((p.systemPrompt || '').slice(0, 40)) +
            '</div>' +
          '</div>' +
          '<div class="char-card-actions">' +
            '<button class="user-active-btn' + (p.enabled ? ' active' : '') + '" data-id="' + p.id + '" type="button">' +
              (p.enabled ? '已启用' : '启用') +
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

      body.querySelectorAll('.user-active-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          Preset.setActive(btn.dataset.id);
          Preset.renderList();
          App.showToast('已启用');
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
          Preset.renderList();
          App.showToast('已删除');
        });
      });
    },

    renderEditView: function(id) {
      var panel = App.$('#presetPanel');
      if (!panel) return;

      var isNew = !id;
      var p = isNew ? Preset.empty() : Preset.getById(id);
      if (!p) return;

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
              '<textarea class="field-card-textarea" id="presetSystemPrompt" rows="8" placeholder="自定义系统指令，会覆盖默认的角色扮演指令...">' + App.esc(p.systemPrompt || '') + '</textarea>' +
              '<button class="field-expand-btn" id="presetExpandBtn" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
                '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div class="preset-param-group">' +
            '<div class="preset-param">' +
              '<div class="preset-param-header">' +
                '<label>Temperature</label>' +
                '<span class="preset-param-value" id="tempVal">' + p.temperature + '</span>' +
              '</div>' +
              '<input type="range" id="presetTemp" min="0" max="2" step="0.05" value="' + p.temperature + '">' +
              '<div class="preset-param-range"><span>0</span><span>2</span></div>' +
            '</div>' +

            '<div class="preset-param">' +
              '<div class="preset-param-header">' +
                '<label>Max Tokens</label>' +
                '<span class="preset-param-value" id="maxTkVal">' + p.maxTokens + '</span>' +
              '</div>' +
              '<input type="range" id="presetMaxTokens" min="256" max="8192" step="256" value="' + p.maxTokens + '">' +
              '<div class="preset-param-range"><span>256</span><span>8192</span></div>' +
            '</div>' +

            '<div class="preset-param">' +
              '<div class="preset-param-header">' +
                '<label>Top P</label>' +
                '<span class="preset-param-value" id="topPVal">' + p.topP + '</span>' +
              '</div>' +
              '<input type="range" id="presetTopP" min="0" max="1" step="0.05" value="' + p.topP + '">' +
              '<div class="preset-param-range"><span>0</span><span>1</span></div>' +
            '</div>' +

            '<div class="preset-param">' +
              '<div class="preset-param-header">' +
                '<label>Frequency Penalty</label>' +
                '<span class="preset-param-value" id="freqVal">' + p.frequencyPenalty + '</span>' +
              '</div>' +
              '<input type="range" id="presetFreq" min="0" max="2" step="0.05" value="' + p.frequencyPenalty + '">' +
              '<div class="preset-param-range"><span>0</span><span>2</span></div>' +
            '</div>' +

            '<div class="preset-param">' +
              '<div class="preset-param-header">' +
                '<label>Presence Penalty</label>' +
                '<span class="preset-param-value" id="presVal">' + p.presencePenalty + '</span>' +
              '</div>' +
              '<input type="range" id="presetPres" min="0" max="2" step="0.05" value="' + p.presencePenalty + '">' +
              '<div class="preset-param-range"><span>0</span><span>2</span></div>' +
            '</div>' +
          '</div>' +

        '</div>';

      // 滑块实时更新数值
      App.safeOn('#presetTemp', 'input', function() {
        App.$('#tempVal').textContent = App.$('#presetTemp').value;
      });
      App.safeOn('#presetMaxTokens', 'input', function() {
        App.$('#maxTkVal').textContent = App.$('#presetMaxTokens').value;
      });
      App.safeOn('#presetTopP', 'input', function() {
        App.$('#topPVal').textContent = App.$('#presetTopP').value;
      });
      App.safeOn('#presetFreq', 'input', function() {
        App.$('#freqVal').textContent = App.$('#presetFreq').value;
      });
      App.safeOn('#presetPres', 'input', function() {
        App.$('#presVal').textContent = App.$('#presetPres').value;
      });

      // 展开编辑器
      App.safeOn('#presetExpandBtn', 'click', function() {
        var textarea = App.$('#presetSystemPrompt');
        if (!textarea) return;
        Preset.openExpandEditor('系统指令', textarea);
      });

      // 返回
      App.safeOn('#backToPresetList', 'click', function() { Preset.renderList(); });

      // 保存
      App.safeOn('#savePresetBtn', 'click', function() {
        var name = App.$('#presetName').value.trim();
        if (!name) {
          App.showToast('请输入预设名称');
          return;
        }

        p.name = name;
        p.systemPrompt = App.$('#presetSystemPrompt').value;
        p.temperature = parseFloat(App.$('#presetTemp').value);
        p.maxTokens = parseInt(App.$('#presetMaxTokens').value, 10);
        p.topP = parseFloat(App.$('#presetTopP').value);
        p.frequencyPenalty = parseFloat(App.$('#presetFreq').value);
        p.presencePenalty = parseFloat(App.$('#presetPres').value);

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
