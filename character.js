(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var FIELDS = [
    { key: 'basicInfo', label: '基础信息', placeholder: '姓名、年龄、身份、职业等基本设定...' },
    { key: 'appearance', label: '外貌气质', placeholder: '外貌、体型、气质描述...' },
    { key: 'backstory', label: '背景故事', placeholder: '角色的背景故事...' },
    { key: 'speechStyle', label: '说话方式', placeholder: '语气、习惯用语、说话风格...' },
    { key: 'behaviorRules', label: '行为准则', placeholder: '角色遵循的行为规则...' },
    { key: 'personalityTraits', label: '性格特点', placeholder: '性格描述...' },
    { key: 'coreSupplement', label: '核心补充', placeholder: '其他核心设定补充...' },
    { key: 'callUser', label: '对 user 的称呼', placeholder: '角色如何称呼 user...' },
    { key: 'relationshipToUser', label: '对 user 的态度', placeholder: '角色对用户的态度、关系...' },
    { key: 'relationshipChange', label: '对 user 的变化', placeholder: '随着互动深入，态度如何变化...' },
    { key: 'sexualExperience', label: '性经验', placeholder: '相关设定描述...' },
    { key: 'forbiddenBehaviors', label: '禁止', placeholder: '绝对不允许出现的行为...' },
    { key: 'dialogExamples', label: '对话示例', placeholder: 'user: ...\nchar: ...' },
    { key: 'opening', label: '开场白', placeholder: '角色在对话开始时说的第一句话...' },
    { key: 'postInstruction', label: '后置指令', placeholder: '每次回复末尾附加的指令...' }
  ];

  var Character = {

    list: [],
    editingAvatar: null,

    empty: function() {
      var obj = { id: '', avatar: '', avatarShape: 'circle' };
      FIELDS.forEach(function(f) { obj[f.key] = ''; });
      return obj;
    },

    save: function() {
      App.LS.set('characterList', Character.list);
    },

    load: function() {
      Character.list = App.LS.get('characterList') || [];
    },

    add: function(data) {
      data.id = 'char-' + Date.now();
      Character.list.push(data);
      Character.save();
      return data;
    },

    update: function(id, data) {
      for (var i = 0; i < Character.list.length; i++) {
        if (Character.list[i].id === id) {
          data.id = id;
          Character.list[i] = data;
          break;
        }
      }
      Character.save();
    },

    remove: function(id) {
      Character.list = Character.list.filter(function(c) { return c.id !== id; });
      Character.save();
    },

    getById: function(id) {
      for (var i = 0; i < Character.list.length; i++) {
        if (Character.list[i].id === id) return Character.list[i];
      }
      return null;
    },

    getShapeClass: function(shape) {
      if (shape === 'square') return 'shape-square';
      if (shape === 'rounded') return 'shape-rounded';
      return 'shape-circle';
    },

    getNextShape: function(shape) {
      if (shape === 'circle') return 'square';
      if (shape === 'square') return 'rounded';
      return 'circle';
    },

    openPanel: function() {
      Character.renderListView();
      var panel = App.$('#characterPanel');
      if (!panel) return;
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    closePanel: function() {
      var panel = App.$('#characterPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    renderListView: function() {
      var panel = App.$('#characterPanel');
      if (!panel) return;

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="closeCharacterPanel">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>角色</h2>' +
          '<button class="fullpage-action-btn" id="addCharacterBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body" id="characterListBody"></div>';

      App.safeOn('#closeCharacterPanel', 'click', function() { Character.closePanel(); });
      App.safeOn('#addCharacterBtn', 'click', function() { Character.renderEditView(null); });
      Character.renderCards();
    },

    renderCards: function() {
      var body = App.$('#characterListBody');
      if (!body) return;

      if (!Character.list.length) {
        body.innerHTML = '<div class="empty-hint">还没有角色，点击右上角 + 创建</div>';
        return;
      }

      body.innerHTML = Character.list.map(function(c) {
        var shapeClass = Character.getShapeClass(c.avatarShape);
        var name = c.basicInfo ? c.basicInfo.split('\n')[0].slice(0, 20) : '未命名';
        return '<div class="char-card" data-id="' + c.id + '">' +
          '<div class="char-card-avatar ' + shapeClass + '" data-id="' + c.id + '" data-role="shapeToggle">' +
            (c.avatar
              ? '<img src="' + c.avatar + '" alt="">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>') +
          '</div>' +
          '<div class="char-card-info">' +
            '<div class="char-card-name">' + App.esc(name) + '</div>' +
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

      // 点击头像切换形状
      body.querySelectorAll('[data-role="shapeToggle"]').forEach(function(avatarEl) {
        avatarEl.addEventListener('click', function(e) {
          e.stopPropagation();
          var id = avatarEl.dataset.id;
          var c = Character.getById(id);
          if (!c) return;
          c.avatarShape = Character.getNextShape(c.avatarShape || 'circle');
          Character.save();
          avatarEl.classList.remove('shape-circle', 'shape-square', 'shape-rounded');
          avatarEl.classList.add(Character.getShapeClass(c.avatarShape));
          App.showToast(c.avatarShape === 'circle' ? '圆形' : c.avatarShape === 'square' ? '方形' : '圆角方形');
        });
      });

      body.querySelectorAll('.char-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          Character.renderEditView(btn.dataset.id);
        });
      });

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

      var c = id ? (Character.getById(id) || Character.empty()) : Character.empty();
      var isNew = !id;
      Character.editingAvatar = c.avatar || '';

      var fieldsHtml = FIELDS.map(function(f) {
        return '<div class="field-card">' +
          '<div class="field-card-header">' +
            '<span class="field-card-label">' + f.label + '</span>' +
            '<button class="field-expand-btn" data-field="' + f.key + '" type="button">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
            '</button>' +
          '</div>' +
          '<textarea id="charField_' + f.key + '" class="field-card-textarea" placeholder="' + f.placeholder + '" rows="3">' + App.esc(c[f.key] || '') + '</textarea>' +
        '</div>';
      }).join('');

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToCharList">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '新建角色' : '编辑角色') + '</h2>' +
          '<button class="fullpage-action-btn" id="saveCharacterBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +
          '<div class="char-avatar-section">' +
            '<div class="char-avatar-upload" id="charAvatarUpload">' +
              (c.avatar
                ? '<img src="' + c.avatar + '" id="charAvatarPreview" alt="">'
                : '<div class="char-avatar-placeholder" id="charAvatarPreview">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' +
                    '<span>上传头像</span>' +
                  '</div>') +
              '<input type="file" id="charAvatarInput" accept="image/*" hidden>' +
            '</div>' +
          '</div>' +
          fieldsHtml +
        '</div>';

      App.safeOn('#charAvatarUpload', 'click', function() {
        App.$('#charAvatarInput').click();
      });

      App.safeOn('#charAvatarInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          Character.editingAvatar = ev.target.result;
          var preview = App.$('#charAvatarPreview');
          if (preview) {
            if (preview.tagName === 'IMG') {
              preview.src = Character.editingAvatar;
            } else {
              var img = document.createElement('img');
              img.src = Character.editingAvatar;
              img.id = 'charAvatarPreview';
              preview.parentNode.replaceChild(img, preview);
            }
          }
        };
        reader.readAsDataURL(file);
      });

      panel.querySelectorAll('.field-expand-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var fieldKey = btn.dataset.field;
          var field = FIELDS.find(function(f) { return f.key === fieldKey; });
          if (!field) return;
          var ta = App.$('#charField_' + fieldKey);
          var currentVal = ta ? ta.value : '';
          Character.openExpandEditor(field, currentVal, function(newVal) {
            if (ta) ta.value = newVal;
          });
        });
      });

      App.safeOn('#backToCharList', 'click', function() {
        Character.renderListView();
      });

      App.safeOn('#saveCharacterBtn', 'click', function() {
        var data = {
          avatar: Character.editingAvatar || '',
          avatarShape: c.avatarShape || 'circle'
        };

        FIELDS.forEach(function(f) {
          var ta = App.$('#charField_' + f.key);
          data[f.key] = ta ? ta.value.trim() : '';
        });

        if (!data.basicInfo) {
          App.showToast('请填写基础信息');
          return;
        }

        if (isNew) {
          Character.add(data);
          App.showToast('角色已创建');
        } else {
          Character.update(id, data);
          App.showToast('角色已保存');
        }

        Character.renderListView();
      });
    },

    openExpandEditor: function(field, currentVal, onSave) {
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
          '<h2>' + field.label + '</h2>' +
          '<button class="fullpage-action-btn" id="expandEditorSave" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="expand-editor-body">' +
          '<textarea id="expandEditorTextarea" class="expand-editor-textarea" placeholder="' + field.placeholder + '">' + App.esc(currentVal || '') + '</textarea>' +
        '</div>';

      document.body.appendChild(editor);

      requestAnimationFrame(function() {
        editor.classList.add('show');
        var ta = App.$('#expandEditorTextarea');
        if (ta) ta.focus();
      });

      App.safeOn('#expandEditorBack', 'click', function() {
        Character.closeExpandEditor();
      });

      App.safeOn('#expandEditorSave', 'click', function() {
        var ta = App.$('#expandEditorTextarea');
        var val = ta ? ta.value : '';
        if (onSave) onSave(val);
        Character.closeExpandEditor();
        App.showToast(field.label + ' 已更新');
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
      App.safeOn('#openCharacterBtn', 'click', function() {
        Character.openPanel();
      });
    },

    init: function() {
      Character.load();
      if (!App.$('#characterPanel')) {
        var panel = document.createElement('div');
        panel.id = 'characterPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }
      App.character = Character;
      Character.bindEvents();
    }
  };

  App.register('character', Character);
})();
