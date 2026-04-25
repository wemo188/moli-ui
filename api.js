(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var PARAM_DEFAULTS = { temperature: 0.8, freqPenalty: 0.3, presPenalty: 0.3 };

  var Api = {
    apiConfigs: [],
    activeApi: null,
    pageEl: null,

    load: function() {
      Api.apiConfigs = App.LS.get('apiConfigs') || [];
      Api.activeApi = App.LS.get('activeApi') || null;
    },

    save: function() {
      App.LS.set('apiConfigs', Api.apiConfigs);
    },

    saveActive: function() {
      if (Api.activeApi) App.LS.set('activeApi', Api.activeApi);
      else App.LS.remove('activeApi');
    },

    saveParams: function() {
      var params = Api.getParams();
      App.LS.set('apiParams', params);
    },

    getParams: function() {
      return App.LS.get('apiParams') || JSON.parse(JSON.stringify(PARAM_DEFAULTS));
    },

    open: function() {
      Api.load();
      var old = App.$('#apiPage');
      if (old) old.remove();

      var page = document.createElement('div');
      page.id = 'apiPage';
      page.className = 'api-page';
      Api.pageEl = page;

      Api.renderPage();
      document.body.appendChild(page);

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.classList.add('show');
      }); });
    },

    close: function() {
      var page = Api.pageEl || App.$('#apiPage');
      if (!page) return;
      page.classList.remove('show');
      setTimeout(function() { if (page.parentNode) page.remove(); Api.pageEl = null; }, 350);
    },

    renderPage: function() {
      var page = Api.pageEl;
      if (!page) return;

      var params = Api.getParams();
      var savedHtml = Api.buildSavedList();

      var innerFrame = '<div class="api-card-inner-frame"><div class="api-card-inner-border"><div class="api-card-inner-fill"></div></div></div>';

      page.innerHTML =
        '<div class="api-header">' +
          '<button class="api-header-btn" id="apiBackBtn" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
          '<span class="api-header-title">API 配置</span>' +
          '<div style="width:36px;"></div>' +
        '</div>' +

        '<div class="api-scroll">' +

          '<div class="api-card"><div class="api-card-body">' + innerFrame +
            '<div class="api-card-ctrl">' +
              '<div class="api-section-title"><span>连 接 配 置</span></div>' +
              '<div class="api-field"><div class="api-field-label">配置名称</div><input type="text" class="api-field-input" id="apiName" placeholder="例如：OpenAI 中转"></div>' +
              '<div class="api-field"><div class="api-field-label">API 地址</div><input type="text" class="api-field-input" id="apiUrl" placeholder="https://example.com/v1"></div>' +
              '<div class="api-field"><div class="api-field-label">API KEY</div><div class="api-field-row"><input type="password" class="api-field-input" id="apiKey" placeholder="sk-..."><button class="api-icon-btn" id="apiToggleKey" type="button"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div>' +
              '<div class="api-field"><div class="api-field-label">模型</div><div class="api-field-row"><input type="text" class="api-field-input" id="apiModel" placeholder="gpt-4o / claude-sonnet-4-20250514"><button class="api-icon-btn" id="apiFetchModels" type="button"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg></button></div><div class="api-model-list" id="apiModelList"></div></div>' +
              '<div class="api-tk-btn" id="apiSaveBtn"><div class="api-tk-btn-body"><div class="api-tk-btn-inner"></div><div class="api-tk-btn-text">保 存 配 置</div></div></div>' +
            '</div>' +
          '</div></div>' +

          '<div class="api-card"><div class="api-card-body">' + innerFrame +
            '<div class="api-card-ctrl">' +
              '<div class="api-section-title"><span>模 型 参 数</span></div>' +
              '<div class="api-param"><div class="api-param-title">Temperature</div><div class="api-param-desc">角色温度，决定回复更加贴合人设还是更加有创意</div><div class="api-param-slider"><div class="api-range-wrap"><span class="api-range-hint">精确</span><input type="range" class="api-range" id="apiTemp" min="0" max="2" step="0.05" value="' + params.temperature + '"><span class="api-range-val" id="apiTempVal">' + params.temperature + '</span><span class="api-range-hint">创意</span></div></div></div>' +
              '<div class="api-param"><div class="api-param-title">Frequency Penalty</div><div class="api-param-desc">频率惩罚，数值越高越避免重复使用相同的词汇和表达</div><div class="api-param-slider"><div class="api-range-wrap"><span class="api-range-hint">允许重复</span><input type="range" class="api-range" id="apiFreq" min="0" max="2" step="0.1" value="' + params.freqPenalty + '"><span class="api-range-val" id="apiFreqVal">' + params.freqPenalty + '</span><span class="api-range-hint">避免重复</span></div></div></div>' +
              '<div class="api-param"><div class="api-param-title">Presence Penalty</div><div class="api-param-desc">存在惩罚，数值越高越鼓励使用新词汇，让表达更加丰富多样</div><div class="api-param-slider"><div class="api-range-wrap"><span class="api-range-hint">保守</span><input type="range" class="api-range" id="apiPres" min="0" max="2" step="0.1" value="' + params.presPenalty + '"><span class="api-range-val" id="apiPresVal">' + params.presPenalty + '</span><span class="api-range-hint">创新</span></div></div></div>' +
              '<div class="api-tk-btn" id="apiSaveParamsBtn"><div class="api-tk-btn-body"><div class="api-tk-btn-inner"></div><div class="api-tk-btn-text">保 存 参 数</div></div></div>' +
            '</div>' +
          '</div></div>' +

          '<div class="api-card"><div class="api-card-body">' + innerFrame +
            '<div class="api-card-ctrl">' +
              '<div class="api-section-title"><span>已 保 存</span></div>' +
              '<div id="apiSavedList">' + savedHtml + '</div>' +
            '</div>' +
          '</div></div>' +

        '</div>';

      Api.bindEvents();
    },

    buildSavedList: function() {
      if (!Api.apiConfigs.length) {
        return '<div class="api-saved-empty">暂无保存的配置</div>';
      }
      return Api.apiConfigs.map(function(cfg, i) {
        var isActive = Api.activeApi && Api.activeApi.name === cfg.name && Api.activeApi.url === cfg.url && Api.activeApi.model === cfg.model;
        return '<div class="api-saved-item">' +
          '<div class="api-saved-info">' +
            '<div class="api-saved-name">' + App.esc(cfg.name) + (isActive ? '<span class="api-active-tag">[当前使用]</span>' : '') + '</div>' +
            '<div class="api-saved-url">' + App.esc(cfg.url) + ' · ' + App.esc(cfg.model) + '</div>' +
          '</div>' +
          '<div class="api-saved-actions">' +
            '<button class="api-act-btn api-act-use" data-idx="' + i + '" type="button" title="使用"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></button>' +
            '<button class="api-act-btn api-act-edit" data-idx="' + i + '" type="button" title="编辑"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></button>' +
            '<button class="api-act-btn api-act-del" data-idx="' + i + '" type="button" title="删除"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    refreshSavedList: function() {
      var list = Api.pageEl ? Api.pageEl.querySelector('#apiSavedList') : null;
      if (!list) return;
      list.innerHTML = Api.buildSavedList();
      Api.bindSavedEvents();
    },

    bindEvents: function() {
      var page = Api.pageEl;
      if (!page) return;

      page.querySelector('#apiBackBtn').addEventListener('click', function() { Api.close(); });

      page.querySelector('#apiToggleKey').addEventListener('click', function(e) {
        e.stopPropagation();
        var inp = page.querySelector('#apiKey');
        if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
      });

      page.querySelector('#apiFetchModels').addEventListener('click', function(e) {
        e.stopPropagation();
        Api.fetchModels();
      });

      page.querySelector('#apiSaveBtn').addEventListener('click', function() {
        var name = (page.querySelector('#apiName') || {}).value || '';
        var url = (page.querySelector('#apiUrl') || {}).value || '';
        var key = (page.querySelector('#apiKey') || {}).value || '';
        var model = (page.querySelector('#apiModel') || {}).value || '';
        name = name.trim(); url = url.trim(); key = key.trim(); model = model.trim();

        if (!name || !url || !key || !model) { App.showToast('请填写所有字段'); return; }

        var config = { name: name, url: url, key: key, model: model };
        var existing = -1;
        for (var i = 0; i < Api.apiConfigs.length; i++) {
          if (Api.apiConfigs[i].name === config.name) { existing = i; break; }
        }
        if (existing >= 0) Api.apiConfigs[existing] = config;
        else Api.apiConfigs.push(config);

        Api.save();
        Api.refreshSavedList();
        App.showToast('配置已保存');
      });

      // 参数滑块
      function bindRange(inputId, valId) {
        var input = page.querySelector('#' + inputId);
        var val = page.querySelector('#' + valId);
        if (input && val) {
          input.addEventListener('input', function() { val.textContent = this.value; });
        }
      }
      bindRange('apiTemp', 'apiTempVal');
      bindRange('apiFreq', 'apiFreqVal');
      bindRange('apiPres', 'apiPresVal');

      page.querySelector('#apiSaveParamsBtn').addEventListener('click', function() {
        var params = {
          temperature: parseFloat((page.querySelector('#apiTemp') || {}).value || 0.8),
          freqPenalty: parseFloat((page.querySelector('#apiFreq') || {}).value || 0.3),
          presPenalty: parseFloat((page.querySelector('#apiPres') || {}).value || 0.3)
        };
        App.LS.set('apiParams', params);
        App.showToast('参数已保存');
      });

      Api.bindSavedEvents();
    },

    bindSavedEvents: function() {
      var page = Api.pageEl;
      if (!page) return;

      page.querySelectorAll('.api-act-use').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(btn.dataset.idx);
          var cfg = Api.apiConfigs[idx];
          if (!cfg) return;
          Api.activeApi = cfg;
          Api.saveActive();
          Api.refreshSavedList();
          App.showToast('已切换至: ' + cfg.name);
        });
      });

      page.querySelectorAll('.api-act-edit').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(btn.dataset.idx);
          var cfg = Api.apiConfigs[idx];
          if (!cfg) return;
          var n = page.querySelector('#apiName');
          var u = page.querySelector('#apiUrl');
          var k = page.querySelector('#apiKey');
          var m = page.querySelector('#apiModel');
          if (n) n.value = cfg.name || '';
          if (u) u.value = cfg.url || '';
          if (k) k.value = cfg.key || '';
          if (m) m.value = cfg.model || '';
          page.querySelector('.api-scroll').scrollTo({ top: 0, behavior: 'smooth' });
          App.showToast('已载入配置');
        });
      });

      page.querySelectorAll('.api-act-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(btn.dataset.idx);
          var removed = Api.apiConfigs.splice(idx, 1)[0];
          if (Api.activeApi && removed && Api.activeApi.name === removed.name && Api.activeApi.url === removed.url) {
            Api.activeApi = null;
            Api.saveActive();
          }
          Api.save();
          Api.refreshSavedList();
          App.showToast('已删除');
        });
      });
    },

    fetchModels: async function() {
      var page = Api.pageEl;
      if (!page) return;
      var url = (page.querySelector('#apiUrl') || {}).value || '';
      var key = (page.querySelector('#apiKey') || {}).value || '';
      url = url.trim(); key = key.trim();

      if (!url || !key) { App.showToast('请先填写 API 地址和 Key'); return; }

      App.showToast('获取模型列表...');

      try {
        var response = await fetch(url.replace(/\/+$/, '') + '/models', {
          headers: { 'Authorization': 'Bearer ' + key }
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        var data = await response.json();
        var raw = data.data || data;
        var models = [];

        if (Array.isArray(raw)) {
          for (var i = 0; i < raw.length; i++) {
            var id = raw[i].id || raw[i].name || raw[i];
            if (id) models.push(id);
          }
        }

        if (!models.length) { App.showToast('未找到模型'); return; }

        var list = page.querySelector('#apiModelList');
        if (!list) return;
        list.innerHTML = models.map(function(m) {
          return '<div class="api-model-item">' + App.esc(m) + '</div>';
        }).join('');
        list.classList.add('show');

        list.querySelectorAll('.api-model-item').forEach(function(item) {
          item.addEventListener('click', function() {
            var modelInput = page.querySelector('#apiModel');
            if (modelInput) modelInput.value = item.textContent;
            list.classList.remove('show');
            App.showToast('已选择: ' + item.textContent);
          });
        });

        App.showToast('已获取 ' + models.length + ' 个模型');
      } catch (err) {
        App.showToast('获取失败: ' + err.message);
      }
    },

    init: function() {
      Api.load();
      App.api = Api;
    }
  };

  App.register('api', Api);
})();