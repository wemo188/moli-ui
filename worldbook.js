(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var WB = {
    list: [],

    POSITIONS: [
      { value: 'before-char', label: '角色定义前' },
      { value: 'after-char', label: '角色定义后' },
      { value: 'before-example', label: '对话示例前' },
      { value: 'after-example', label: '对话示例后' },
      { value: 'depth', label: '精确深度' }
    ],

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
        '<div class="fullpage-body" id="wbListBody"></div>';

      App.safeOn('#closeWBPanel', 'click', function() { WB.closePanel(); });
      App.safeOn('#addWBBtn', 'click', function() { WB.renderEditView(null); });

      var body = App.$('#wbListBody');
      if (!WB.list.length) {
        body.innerHTML = '<div class="empty-hint">还没有条目，点击右上角 + 创建</div>';
        return;
      }

      body.innerHTML = WB.list.map(function(e) {
        var tags = [];
        if (e.permanent) tags.push('<span class="wb-tag wb-tag-perm">常驻</span>');
        if (e.useKeyword) tags.push('<span class="wb-tag wb-tag-kw">关键词</span>');
        var posLabel = '';
        for (var i = 0; i < WB.POSITIONS.length; i++) {
          if (WB.POSITIONS[i].value === e.position) { posLabel = WB.POSITIONS[i].label; break; }
        }
        if (e.position === 'depth') posLabel += ' ' + (e.depth || 0);

        return '<div class="wb-card' + (!e.enabled ? ' wb-disabled' : '') + '" data-id="' + e.id + '">' +
          '<div class="wb-card-top">' +
            '<div class="wb-card-left">' +
              '<div class="wb-card-name">' + App.esc(e.name || '未命名') + '</div>' +
              '<div class="wb-card-tags">' + tags.join('') + '</div>' +
            '</div>' +
            '<div class="wb-card-right">' +
              '<span class="wb-card-pos">' + posLabel + '</span>' +
              '<button class="wb-toggle" data-id="' + e.id + '" type="button">' +
                '<div class="toggle-switch' + (e.enabled ? ' on' : '') + '"></div>' +
              '</button>' +
            '</div>' +
          '</div>' +
          (e.useKeyword && e.keywords
            ? '<div class="wb-card-keywords">' + App.esc(e.keywords) + '</div>'
            : '') +
          '<div class="wb-card-preview">' + App.esc((e.content || '').slice(0, 80)) + '</div>' +
          '<div class="wb-card-actions">' +
            '<button class="wb-edit-btn" data-id="' + e.id + '" type="button">编辑</button>' +
            '<button class="wb-del-btn" data-id="' + e.id + '" type="button">删除</button>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.wb-toggle').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var entry = WB.getById(btn.dataset.id);
          if (!entry) return;
          entry.enabled = !entry.enabled;
          WB.save();
          WB.renderList();
        });
      });

      body.querySelectorAll('.wb-edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          WB.renderEditView(btn.dataset.id);
        });
      });

      body.querySelectorAll('.wb-del-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          if (!confirm('确定删除？')) return;
          WB.remove(btn.dataset.id);
          WB.renderList();
          App.showToast('已删除');
        });
      });
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

          '<div class="form-group">' +
            '<label>内容</label>' +
            '<textarea class="form-textarea" id="wbContent" rows="6" placeholder="条目内容...">' + App.esc(e.content || '') + '</textarea>' +
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

          '<div class="form-group' + (e.useKeyword ? '' : ' hidden') + '" id="wbKeywordsGroup">' +
            '<label>关键词（逗号分隔）</label>' +
            '<input type="text" id="wbKeywords" value="' + App.esc(e.keywords || '') + '" placeholder="关键词1, 关键词2...">' +
          '</div>' +

          '<div class="form-group">' +
            '<label>注入位置</label>' +
            '<select class="form-select" id="wbPosition">' + posOptions + '</select>' +
          '</div>' +

          '<div class="form-group' + (e.position === 'depth' ? '' : ' hidden') + '" id="wbDepthGroup">' +
            '<label>深度值（0 = 最底部）</label>' +
            '<input type="number" id="wbDepth" value="' + (e.depth || 0) + '" min="0" max="100">' +
          '</div>' +

        '</div>';

      // 返回
      App.safeOn('#backToWBList', 'click', function() { WB.renderList(); });

      // 常驻开关
      var permState = e.permanent;
      App.safeOn('#wbPermanentToggle', 'click', function() {
        permState = !permState;
        App.$('#wbPermanentToggle').classList.toggle('on', permState);
      });

      // 关键词开关
      var kwState = e.useKeyword;
      App.safeOn('#wbKeywordToggle', 'click', function() {
        kwState = !kwState;
        App.$('#wbKeywordToggle').classList.toggle('on', kwState);
        App.$('#wbKeywordsGroup').classList.toggle('hidden', !kwState);
      });

      // 注入位置切换
      App.safeOn('#wbPosition', 'change', function() {
        var val = App.$('#wbPosition').value;
        App.$('#wbDepthGroup').classList.toggle('hidden', val !== 'depth');
      });

      // 保存
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
        e.depth = parseInt(App.$('#wbDepth') ? App.$('#wbDepth').value : '0', 10) || 0;

        if (isNew) {
          e.enabled = true;
          WB.list.push(e);
        }
        WB.save();
        WB.renderList();
        App.showToast(isNew ? '条目已创建' : '已保存');
      });
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
