(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Character = {

    list: [],
    avatarShape: 'rounded',

    empty: function() {
      return {
        id: '',
        name: '',
        age: '',
        identity: '',
        appearance: '',
        backstory: '',
        personalityTraits: '',
        speechStyle: '',
        behaviorRules: '',
        coreExtra: '',
        callUser: '',
        relationshipToUser: '',
        relationshipChange: '',
        sexualExperience: '',
        forbiddenBehaviors: '',
        narrativePerson: '第二人称',
        dialogExamples: '',
        opening: '',
        postInstruction: '',
        avatar: ''
      };
    },

    save: function() {
      App.LS.set('characterList', Character.list);
    },

    load: function() {
      Character.list = App.LS.get('characterList') || [];
      Character.avatarShape = App.LS.get('characterAvatarShape') || 'rounded';
    },

    saveShape: function(shape) {
      Character.avatarShape = shape;
      App.LS.set('characterAvatarShape', shape);
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

    getShapeClass: function() {
      switch (Character.avatarShape) {
        case 'circle': return 'avatar-circle';
        case 'square': return 'avatar-square';
        default: return 'avatar-rounded';
      }
    },

    // ========= 全屏编辑器 =========
    openFieldEditor: function(title, currentValue, onSave) {
      var editor = App.$('#fieldEditorPanel');
      if (!editor) {
        editor = document.createElement('div');
        editor.id = 'fieldEditorPanel';
        editor.className = 'fullpage-panel hidden';
        document.body.appendChild(editor);
      }

      editor.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="fieldEditorBack">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + App.esc(title) + '</h2>' +
          '<button class="fullpage-action-btn" id="fieldEditorSave" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body field-editor-body">' +
          '<textarea id="fieldEditorTextarea" class="field-editor-textarea" placeholder="输入内容...">' + App.esc(currentValue || '') + '</textarea>' +
        '</div>';

      editor.classList.remove('hidden');
      requestAnimationFrame(function() {
        editor.classList.add('show');
        var ta = App.$('#fieldEditorTextarea');
        if (ta) ta.focus();
      });

      App.safeOn('#fieldEditorBack', 'click', function() {
        editor.classList.remove('show');
        setTimeout(function() { editor.classList.add('hidden'); }, 350);
      });

      App.safeOn('#fieldEditorSave', 'click', function() {
        var val = App.$('#fieldEditorTextarea').value;
        if (onSave) onSave(val);
        editor.classList.remove('show');
        setTimeout(function() { editor.classList.add('hidden'); }, 350);
        App.showToast('已保存');
      });
    },

    // ========= 面板 =========
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

      var shapeClass = Character.getShapeClass();

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
        '<div class="fullpage-body" id="characterListBody">' +
        '</div>' +
        '<div class="shape-selector">' +
          '<span class="shape-label">头像框：</span>' +
          '<button class="shape-btn' + (Character.avatarShape === 'circle' ? ' active' : '') + '" data-shape="circle" type="button">圆形</button>' +
          '<button class="shape-btn' + (Character.avatarShape === 'rounded' ? ' active' : '') + '" data-shape="rounded" type="button">圆角</button>' +
          '<button class="shape-btn' + (Character.avatarShape === 'square' ? ' active' : '') + '" data-shape="square" type="button">方形</button>' +
        '</div>';

      App.safeOn('#closeCharacterPanel', 'click', function() { Character.closePanel(); });
      App.safeOn('#addCharacterBtn', 'click', function() { Character.renderEditView(null); });

      panel.querySelectorAll('.shape-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          Character.saveShape(btn.dataset.shape);
          Character.renderListView();
          App.showToast('头像框已切换');
        });
      });

      Character.renderCharacterCards();
    },

    renderCharacterCards: function() {
      var body = App.$('#characterListBody');
      if (!body) return;

      if (!Character.list.length) {
        body.innerHTML = '<div class="empty-hint">还没有角色，点击右上角 + 创建</div>';
        return;
      }

      var shapeClass = Character.getShapeClass();

      body.innerHTML = Character.list.map(function(c) {
        return '<div class="char-card" data-id="' + c.id + '">' +
          '<div class="char-card-avatar ' + shapeClass + '">' +
            (c.avatar
              ? '<img src="' + c.avatar + '" alt="avatar">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>') +
          '</div>' +
          '<div class="char-card-info">' +
            '<div class="char-card-name">' + App.esc(c.name || '未命名') + '</div>' +
            '<div class="char-card-desc">' + App.esc(c.identity || '') + (c.age ? ' · ' + App.esc(c.age) : '') + '</div>' +
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

      body.querySelectorAll('.char-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          Character.renderEditView(btn.dataset.id);
        });
      });

      body.querySelectorAll('.char-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (!confirm('确定删除这个角色？')) return;
          Character.remove(btn.dataset.id);
          Character.renderCharacterCards();
          App.showToast('已删除');
        });
      });
    },

    // ========= 编辑字段配置 =========
    FIELDS: [
      { section: '外貌气质', key: 'appearance', placeholder: '外貌、气质、着装...' },
      { section: '背景故事', key: 'backstory', placeholder: '角色的背景故事...' },
      { section: '说话方式', key: 'speechStyle', placeholder: '说话风格、语气、习惯用语...' },
      { section: '行为准则', key: 'behaviorRules', placeholder: '行为准则和习惯...' },
      { section: '性格特点', key: 'personalityTraits', placeholder: '性格特征...' },
      { section: '核心补充', key: 'coreExtra', placeholder: '其他补充信息...' },
      { section: '对 user 的称呼', key: 'callUser', placeholder: '角色如何称呼 user' },
      { section: '对 user 的态度', key: 'relationshipToUser', placeholder: '角色对用户的态度...' },
      { section: '对 user 的变化', key: 'relationshipChange', placeholder: '随剧情推进的关系变化...' },
      { section: '性经验', key: 'sexualExperience', placeholder: '相关描述...' },
      { section: '禁止行为', key: 'forbiddenBehaviors', placeholder: '绝对不允许出现的行为...' },
      { section: '对话示例', key: 'dialogExamples', placeholder: 'user: ...\nchar: ...' },
      { section: '开场白', key: 'opening', placeholder: '角色第一句话...' },
      { section: '后置指令', key: 'postInstruction', placeholder: '每次回复末尾附加的指令...' }
    ],

    renderEditView: function(id) {
      var panel = App.$('#characterPanel');
      if (!panel) return;

      var c = id ? (Character.getById(id) || Character.empty()) : Character.empty();
      var isNew = !id;
      var editData = JSON.parse(JSON.stringify(c));

      var fieldsHtml = '';

      // 基础信息
      fieldsHtml +=
        '<div class="edit-section">' +
          '<div class="edit-section-title">基础信息</div>' +
          '<div class="edit-section-body">' +
            '<div class="form-group"><label>姓名</label><input type="text" id="charName" value="' + App.esc(c.name || '') + '" placeholder="角色姓名"></div>' +
            '<div class="form-group"><label>年龄</label><input type="text" id="charAge" value="' + App.esc(c.age || '') + '" placeholder="角色年龄"></div>' +
            '<div class="form-group"><label>身份</label><input type="text" id="charIdentity" value="' + App.esc(c.identity || '') + '" placeholder="身份/职业"></div>' +
          '</div>' +
        '</div>';

      // 行文人称
      fieldsHtml +=
        '<div class="edit-section">' +
          '<div class="edit-section-title">行文人称</div>' +
          '<div class="edit-section-body">' +
            '<select id="charNarrativePerson" class="form-select">' +
              '<option value="第一人称"' + (c.narrativePerson === '第一人称' ? ' selected' : '') + '>第一人称（我）</option>' +
              '<option value="第二人称"' + (c.narrativePerson === '第二人称' ? ' selected' : '') + '>第二人称（你）</option>' +
              '<option value="第三人称"' + (c.narrativePerson === '第三人称' ? ' selected' : '') + '>第三人称（他/她）</option>' +
            '</select>' +
          '</div>' +
        '</div>';

      // 可展开字段
      Character.FIELDS.forEach(function(f) {
        var val = c[f.key] || '';
        var preview = val.length > 40 ? val.slice(0, 40) + '...' : val;
        fieldsHtml +=
          '<div class="edit-section">' +
            '<div class="edit-section-header" data-field="' + f.key + '">' +
              '<div class="edit-section-title">' + f.section + '</div>' +
              '<div class="edit-section-expand">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
              '</div>' +
            '</div>' +
            '<div class="edit-section-body">' +
              '<textarea class="form-textarea edit-field-ta" data-key="' + f.key + '" placeholder="' + f.placeholder + '" rows="3">' + App.esc(val) + '</textarea>' +
            '</div>' +
          '</div>';
      });

      panel.innerHTML =
        '<div class="fullpage-header">' +
          '<div class="fullpage-back" id="backToCharList">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
          '</div>' +
          '<h2>' + (isNew ? '新建角色' : '编辑角色') + '</h2>' +
          '<button class="fullpage-action-btn" id="saveCharacterBtn" type="button">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fullpage-body">' +

          // 大头像
          '<div class="char-banner-upload" id="charBannerUpload">' +
            (c.avatar
              ? '<img src="' + c.avatar + '" id="charBannerPreview" alt="avatar">'
              : '<div class="char-banner-placeholder" id="charBannerPreview">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
                  '<span>上传角色图片</span>' +
                '</div>') +
            '<input type="file" id="charBannerInput" accept="image/*" hidden>' +
          '</div>' +

          fieldsHtml +

        '</div>';

      // 头像上传
      App.safeOn('#charBannerUpload', 'click', function() {
        App.$('#charBannerInput').click();
      });

      App.safeOn('#charBannerInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          editData.avatar = ev.target.result;
          var preview = App.$('#charBannerPreview');
          if (preview) {
            var img = document.createElement('img');
            img.src = editData.avatar;
            img.id = 'charBannerPreview';
            img.alt = 'avatar';
            preview.parentNode.replaceChild(img, preview);
          }
        };
        reader.readAsDataURL(file);
      });

      // 展开编辑按钮
      panel.querySelectorAll('.edit-section-expand').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var header = btn.closest('.edit-section-header');
          if (!header) return;
          var fieldKey = header.dataset.field;
          var fieldConfig = Character.FIELDS.find(function(f) { return f.key === fieldKey; });
          if (!fieldConfig) return;

          var ta = panel.querySelector('.edit-field-ta[data-key="' + fieldKey + '"]');
          var currentVal = ta ? ta.value : '';

          Character.openFieldEditor(fieldConfig.section, currentVal, function(newVal) {
            if (ta) ta.value = newVal;
          });
        });
      });

      // 返回
      App.safeOn('#backToCharList', 'click', function() {
        Character.renderListView();
      });

      // 保存
      App.safeOn('#saveCharacterBtn', 'click', function() {
        var data = {
          avatar: editData.avatar || c.avatar || '',
          name: App.$('#charName') ? App.$('#charName').value.trim() : '',
          age: App.$('#charAge') ? App.$('#charAge').value.trim() : '',
          identity: App.$('#charIdentity') ? App.$('#charIdentity').value.trim() : '',
          narrativePerson: App.$('#charNarrativePerson') ? App.$('#charNarrativePerson').value : '第二人称'
        };

        Character.FIELDS.forEach(function(f) {
          var ta = panel.querySelector('.edit-field-ta[data-key="' + f.key + '"]');
          data[f.key] = ta ? ta.value.trim() : '';
        });

        if (!data.name) {
          App.showToast('请填写角色姓名');
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

    bindEvents: function() {
      App.safeOn('#openCharacterBtn', 'click', function() {
        Character.openPanel();
      });

      // 长按换图标
      var pressTimer = null;
      var iconEl = App.$('#openCharacterBtn');
      if (iconEl) {
        iconEl.addEventListener('touchstart', function() {
          pressTimer = setTimeout(function() {
            App.$('#characterIconInput').click();
          }, 600);
        }, { passive: true });
        iconEl.addEventListener('touchend', function() { clearTimeout(pressTimer); }, { passive: true });
        iconEl.addEventListener('touchmove', function() { clearTimeout(pressTimer); }, { passive: true });
      }

      App.safeOn('#characterIconInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var imgEl = App.$('#characterIconImg');
          if (!imgEl) return;
          imgEl.innerHTML = '<img src="' + ev.target.result + '">';
          App.LS.set('characterIconImg', ev.target.result);
        };
        reader.readAsDataURL(file);
      });
    },

    init: function() {
      Character.load();

      var savedIcon = App.LS.get('characterIconImg');
      if (savedIcon) {
        var imgEl = App.$('#characterIconImg');
        if (imgEl) imgEl.innerHTML = '<img src="' + savedIcon + '">';
      }

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
