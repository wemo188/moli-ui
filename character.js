(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Character = {

    list: [],

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
        relationshipToUser: '',
        forbiddenBehaviors: '',
        dialogExamples: '',
        opening: '',
        narrativePerson: '第二人称',
        postInstruction: '',
        callUser: '',
        avatar: ''
      };
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
      Character.list = Character.list.filter(function(c) {
        return c.id !== id;
      });
      Character.save();
    },

    getById: function(id) {
      for (var i = 0; i < Character.list.length; i++) {
        if (Character.list[i].id === id) return Character.list[i];
      }
      return null;
    },

    // ========= 面板渲染 =========

    openPanel: function() {
      Character.renderListView();
      var panel = App.$('#characterPanel');
      if (!panel) return;
      panel.classList.remove('hidden');
      requestAnimationFrame(function() {
        panel.classList.add('show');
      });
    },

    closePanel: function() {
      var panel = App.$('#characterPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() {
        panel.classList.add('hidden');
      }, 350);
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
        '<div class="fullpage-body" id="characterListBody">' +
        '</div>';

      App.safeOn('#closeCharacterPanel', 'click', function() {
        Character.closePanel();
      });

      App.safeOn('#addCharacterBtn', 'click', function() {
        Character.renderEditView(null);
      });

      Character.renderCharacterCards();
    },

    renderCharacterCards: function() {
      var body = App.$('#characterListBody');
      if (!body) return;

      if (!Character.list.length) {
        body.innerHTML =
          '<div class="empty-hint">还没有角色，点击右上角 + 创建</div>';
        return;
      }

      body.innerHTML = Character.list.map(function(c) {
        return '<div class="char-card" data-id="' + c.id + '">' +
          '<div class="char-card-avatar">' +
            (c.avatar
              ? '<img src="' + c.avatar + '" alt="avatar">'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>') +
          '</div>' +
          '<div class="char-card-info">' +
            '<div class="char-card-name">' + App.esc(c.name || '未命名') + '</div>' +
            '<div class="char-card-desc">' + App.esc(c.identity || '') + '</div>' +
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

    renderEditView: function(id) {
      var panel = App.$('#characterPanel');
      if (!panel) return;

      var c = id ? (Character.getById(id) || Character.empty()) : Character.empty();
      var isNew = !id;

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

          // 头像
          '<div class="char-avatar-upload" id="charAvatarUpload">' +
            (c.avatar
              ? '<img src="' + c.avatar + '" id="charAvatarPreview" alt="avatar">'
              : '<div class="char-avatar-placeholder" id="charAvatarPreview">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' +
                  '<span>上传头像</span>' +
                '</div>') +
            '<input type="file" id="charAvatarInput" accept="image/*" hidden>' +
          '</div>' +

          // 基础信息
          Character.fieldGroup('姓名', 'charName', c.name, '角色姓名') +
          Character.fieldGroup('年龄', 'charAge', c.age, '角色年龄') +
          Character.fieldGroup('身份', 'charIdentity', c.identity, '角色的身份/职业') +
          Character.fieldGroup('外貌', 'charAppearance', c.appearance, '外貌描述', true) +

          '<div class="form-section-title">背景故事</div>' +
          Character.textareaGroup('charBackstory', c.backstory, '角色的背景故事...') +

          '<div class="form-section-title">核心性格</div>' +
          Character.textareaGroup('charPersonality', c.personalityTraits, '性格特点...') +

          '<div class="form-section-title">说话方式</div>' +
          Character.textareaGroup('charSpeechStyle', c.speechStyle, '说话风格、语气、习惯用语...') +

          '<div class="form-section-title">行为规则</div>' +
          Character.textareaGroup('charBehaviorRules', c.behaviorRules, '角色的行为准则...') +

          '<div class="form-section-title">对 user 的态度</div>' +
          Character.textareaGroup('charRelationship', c.relationshipToUser, '角色对用户的态度、关系...') +

          '<div class="form-section-title">对 user 的称呼</div>' +
          Character.fieldGroup('', 'charCallUser', c.callUser, '角色如何称呼 user') +

          '<div class="form-section-title">禁止行为</div>' +
          Character.textareaGroup('charForbidden', c.forbiddenBehaviors, '绝对不允许出现的行为...') +

          '<div class="form-section-title">对话示例</div>' +
          Character.textareaGroup('charDialogExamples', c.dialogExamples, 'user: ...\nchar: ...') +

          '<div class="form-section-title">开场白</div>' +
          Character.textareaGroup('charOpening', c.opening, '角色在对话开始时说的第一句话...') +

          '<div class="form-section-title">行文人称</div>' +
          '<div class="form-group">' +
            '<select id="charNarrativePerson" class="form-select">' +
              '<option value="第一人称"' + (c.narrativePerson === '第一人称' ? ' selected' : '') + '>第一人称（我）</option>' +
              '<option value="第二人称"' + (c.narrativePerson === '第二人称' ? ' selected' : '') + '>第二人称（你）</option>' +
              '<option value="第三人称"' + (c.narrativePerson === '第三人称' ? ' selected' : '') + '>第三人称（他/她）</option>' +
            '</select>' +
          '</div>' +

          '<div class="form-section-title">后置指令</div>' +
          Character.textareaGroup('charPostInstruction', c.postInstruction, '每次回复末尾附加的指令...') +

        '</div>';

      // 头像上传
      App.safeOn('#charAvatarUpload', 'click', function() {
        App.$('#charAvatarInput').click();
      });

      App.safeOn('#charAvatarInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          c.avatar = ev.target.result;
          var preview = App.$('#charAvatarPreview');
          if (preview) {
            var img = document.createElement('img');
            img.src = c.avatar;
            img.id = 'charAvatarPreview';
            preview.parentNode.replaceChild(img, preview);
          }
        };
        reader.readAsDataURL(file);
      });

      // 返回列表
      App.safeOn('#backToCharList', 'click', function() {
        Character.renderListView();
      });

      // 保存
      App.safeOn('#saveCharacterBtn', 'click', function() {
        var data = {
          avatar: c.avatar || '',
          name: App.$('#charName') ? App.$('#charName').value.trim() : '',
          age: App.$('#charAge') ? App.$('#charAge').value.trim() : '',
          identity: App.$('#charIdentity') ? App.$('#charIdentity').value.trim() : '',
          appearance: App.$('#charAppearance') ? App.$('#charAppearance').value.trim() : '',
          backstory: App.$('#charBackstory') ? App.$('#charBackstory').value.trim() : '',
          personalityTraits: App.$('#charPersonality') ? App.$('#charPersonality').value.trim() : '',
          speechStyle: App.$('#charSpeechStyle') ? App.$('#charSpeechStyle').value.trim() : '',
          behaviorRules: App.$('#charBehaviorRules') ? App.$('#charBehaviorRules').value.trim() : '',
          relationshipToUser: App.$('#charRelationship') ? App.$('#charRelationship').value.trim() : '',
          callUser: App.$('#charCallUser') ? App.$('#charCallUser').value.trim() : '',
          forbiddenBehaviors: App.$('#charForbidden') ? App.$('#charForbidden').value.trim() : '',
          dialogExamples: App.$('#charDialogExamples') ? App.$('#charDialogExamples').value.trim() : '',
          opening: App.$('#charOpening') ? App.$('#charOpening').value.trim() : '',
          narrativePerson: App.$('#charNarrativePerson') ? App.$('#charNarrativePerson').value : '第二人称',
          postInstruction: App.$('#charPostInstruction') ? App.$('#charPostInstruction').value.trim() : ''
        };

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

    fieldGroup: function(label, id, value, placeholder, isTextarea) {
      if (isTextarea) {
        return '<div class="form-group">' +
          (label ? '<label>' + label + '</label>' : '') +
          '<textarea id="' + id + '" class="form-textarea-sm" placeholder="' + placeholder + '" rows="2">' + App.esc(value || '') + '</textarea>' +
        '</div>';
      }
      return '<div class="form-group">' +
        (label ? '<label>' + label + '</label>' : '') +
        '<input type="text" id="' + id + '" value="' + App.esc(value || '') + '" placeholder="' + placeholder + '">' +
      '</div>';
    },

    textareaGroup: function(id, value, placeholder) {
      return '<div class="form-group">' +
        '<textarea id="' + id + '" class="form-textarea" placeholder="' + placeholder + '" rows="4">' + App.esc(value || '') + '</textarea>' +
      '</div>';
    },

    bindEvents: function() {
      // 第二页角色图标点击
      App.safeOn('#openCharacterBtn', 'click', function(e) {
        // 长按换图标，短按进入面板
        Character.openPanel();
      });

      // 长按图标换照片
      var pressTimer = null;
      var iconEl = App.$('#openCharacterBtn');
      if (iconEl) {
        iconEl.addEventListener('touchstart', function() {
          pressTimer = setTimeout(function() {
            App.$('#characterIconInput').click();
          }, 600);
        }, { passive: true });

        iconEl.addEventListener('touchend', function() {
          clearTimeout(pressTimer);
        }, { passive: true });
      }

      App.safeOn('#characterIconInput', 'change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var imgEl = App.$('#characterIconImg');
          if (!imgEl) return;
          imgEl.innerHTML = '<img src="' + ev.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:18px;">';
          App.LS.set('characterIconImg', ev.target.result);
        };
        reader.readAsDataURL(file);
      });
    },

    init: function() {
      Character.load();

      // 恢复图标图片
      var savedIcon = App.LS.get('characterIconImg');
      if (savedIcon) {
        var imgEl = App.$('#characterIconImg');
        if (imgEl) {
          imgEl.innerHTML = '<img src="' + savedIcon + '" style="width:100%;height:100%;object-fit:cover;border-radius:18px;">';
        }
      }

      // 创建全屏面板容器
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
