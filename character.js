(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Character = {
    FIELDS: [
      { key: 'basicInfo', label: '基本信息', placeholder: '名字、身份、背景...' },
      { key: 'personality', label: '性格', placeholder: '性格特征...' },
      { key: 'appearance', label: '外貌', placeholder: '外貌描述...' },
      { key: 'openings', label: '开场白（每行一个）', placeholder: '开场白1\n开场白2\n开场白3...' },
      { key: 'scenario', label: '场景', placeholder: '当前场景...' },
      { key: 'dialogExamples', label: '对话示例', placeholder: '<START>\n{{user}}: 你好\n{{char}}: ...' },
      { key: 'postInstruction', label: '后置指令', placeholder: '在对话末尾追加的指令...' }
    ],

    list: [],

    load: function() {
      Character.list = App.LS.get('characters') || [];
    },
    save: function() {
      App.LS.set('characters', Character.list);
    },
    getById: function(id) {
      for (var i = 0; i < Character.list.length; i++) {
        if (Character.list[i].id === id) return Character.list[i];
      }
      return null;
    },
    empty: function() {
      return {
        id: 'char-' + Date.now(),
        avatar: '',
        avatarShape: 'circle',
        basicInfo: '',
        personality: '',
        appearance: '',
        openings: '',
        scenario: '',
        dialogExamples: '',
        postInstruction: ''
      };
    },
    remove: function(id) {
      Character.list = Character.list.filter(function(c) { return c.id !== id; });
      Character.save();
    },
    getShapeClass: function(s) {
      if (s === 'square') return 'shape-square';
      if (s === 'rounded') return 'shape-rounded';
      return 'shape-circle';
    },
    getNextShape: function(s) {
      if (s === 'circle') return 'square';
      if (s === 'square') return 'rounded';
      return 'circle';
    },

    openPanel: function() {
      var panel = App.$('#characterPanel');
      if (!panel) return;
      Character.renderCards();
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    closePanel: function() {
      var panel = App.$('#characterPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderCards: function() {
      var panel = App.$('#characterPanel');
      if (!panel) return;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closeCharPanel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>角色</h2>' +
          '<button class="fullpage-action-btn" id="addCharBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body" id="charListBody"></div>';

      App.safeOn('#closeCharPanel', 'click', function() { Character.closePanel(); });
      App.safeOn('#addCharBtn', 'click', function() { Character.renderEditView(null); });

      var body = App.$('#charListBody');

      if (!Character.list.length) {
        body.innerHTML = '<div class="empty-hint">还没有角色，点击右上角 + 创建</div>';
        return;
      }

      body.innerHTML = Character.list.map(function(c) {
        var shapeClass = Character.getShapeClass(c.avatarShape);
        var name = (c.basicInfo || '').split('\n')[0].slice(0, 20) || '未命名';
        return '<div class="char-card" data-id="' + c.id + '">' +
          '<div class="char-card-avatar ' + shapeClass + '" data-id="' + c.id + '" data-role="shapeToggle">' +
            (c.avatar
              ? '<img src="' + c.avatar + '" alt="">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>') +
          '</div>' +
          '<div class="char-card-info">' +
            '<div class="char-card-name">' + App.esc(name) + '</div>' +
            '<div class="char-card-desc">' + App.esc((c.personality || '').slice(0, 30)) + '</div>' +
          '</div>' +
          '<div class="char-card-actions">' +
            '<button class="char-edit-btn" data-id="' + c.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
            '</button>' +
            '<button class="char-del-btn" data-id="' + c.id + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');

      // 点击卡片空白处 → 进入聊天
      body.querySelectorAll('.char-card').forEach(function(card) {
        card.addEventListener('click', function(e) {
          if (e.target.closest('.char-edit-btn') || e.target.closest('.char-del-btn') || e.target.closest('[data-role="shapeToggle"]')) return;
          var charId = card.dataset.id;
          if (App.chat && App.chat.startChat) {
            App.chat.startChat(charId);
          }
        });
      });

      // 头像形状切换
      body.querySelectorAll('[data-role="shapeToggle"]').forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.stopPropagation();
          var c = Character.getById(el.dataset.id);
          if (!c) return;
          c.avatarShape = Character.getNextShape(c.avatarShape || 'circle');
          Character.save();
          el.classList.remove('shape-circle', 'shape-square', 'shape-rounded');
          el.classList.add(Character.getShapeClass(c.avatarShape));
        });
      });

      // 编辑
      body.querySelectorAll('.char-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          Character.renderEditView(btn.dataset.id);
        });
      });

      // 删除
      body.querySelectorAll('.char-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除？')) return;
          Character.remove(btn.dataset.id);
          Character.renderCards();
          App.showToast('已删除');
        });
      });
    },

    renderEditView: function(id) {
      var panel = App.$('#characterPanel');
      if (!panel) return;

      var isNew = !id;
      var c = isNew ? Character.empty() : Character.getById(id);
      if (!c) return;

      var fieldsHtml = Character.FIELDS.map(function(f) {
        return '<div class="field-card">' +
          '<div class="field-card-header">' +
            '<span class="field-card-label">' + f.label + '</span>' +
            '<button class="field-expand-btn" data-field="' + f.key + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
            '</button>' +
          '</div>' +
          '<textarea class="field-card-textarea" id="field_' + f.key + '" placeholder="' + f.placeholder + '" rows="3">' + App.esc(c[f.key] || '') + '</textarea>' +
        '</div>';
      }).join('');

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToCharList">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '新建角色' : '编辑角色') + '</h2>' +
          '<button class="fullpage-action-btn" id="saveCharBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +
          '<div class="avatar-row">' +
            '<div class="avatar-upload-area" id="charAvatarUpload">' +
              (c.avatar
                ? '<img src="' + c.avatar + '" alt="">'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>上传头像</span>') +
            '</div>' +
            '<div class="avatar-row-info">点击上传头像<br>点击列表中的头像可切换形状</div>' +
          '</div>' +
          fieldsHtml +
        '</div>';

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.hidden = true;
      panel.appendChild(fileInput);

      App.safeOn('#charAvatarUpload', 'click', function() { fileInput.click(); });

      fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          c.avatar = ev.target.result;
          App.$('#charAvatarUpload').innerHTML = '<img src="' + ev.target.result + '" alt="">';
        };
        reader.readAsDataURL(file);
      });

      App.safeOn('#backToCharList', 'click', function() { Character.renderCards(); });

      App.safeOn('#saveCharBtn', 'click', function() {
        Character.FIELDS.forEach(function(f) {
          var el = App.$('#field_' + f.key);
          if (el) c[f.key] = el.value;
        });

        if (isNew) {
          Character.list.push(c);
        }
        Character.save();
        Character.renderCards();
        App.showToast(isNew ? '角色已创建' : '已保存');
      });

      // 放大编辑
      panel.querySelectorAll('.field-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var key = btn.dataset.field;
          var textarea = App.$('#field_' + key);
          if (!textarea) return;
          var field = null;
          for (var i = 0; i < Character.FIELDS.length; i++) {
            if (Character.FIELDS[i].key === key) { field = Character.FIELDS[i]; break; }
          }
          Character.openExpandEditor(field ? field.label : key, textarea);
        });
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
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + App.esc(title) + '</h2>' +
          '<button class="fullpage-action-btn" id="expandEditorDone" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="expand-editor-body">' +
          '<textarea class="expand-editor-textarea" id="expandTextarea">' + App.esc(sourceTextarea.value) + '</textarea>' +
        '</div>';

      document.body.appendChild(editor);
      requestAnimationFrame(function() { editor.classList.add('show'); });

      function closeEditor() {
        sourceTextarea.value = App.$('#expandTextarea').value;
        editor.classList.remove('show');
        setTimeout(function() { editor.remove(); }, 350);
      }

      App.safeOn('#expandEditorBack', 'click', closeEditor);
      App.safeOn('#expandEditorDone', 'click', closeEditor);
    },

    init: function() {
      Character.load();
      App.character = Character;

      if (!App.$('#characterPanel')) {
        var panel = document.createElement('div');
        panel.id = 'characterPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }

      App.safeOn('#openCharacterBtn', 'click', function() {
        Character.openPanel();
      });
    }
  };

  App.register('character', Character);
})();
