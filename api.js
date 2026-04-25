(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var PARAM_DEFAULTS = { temperature: 0.8, freqPenalty: 0.3, presPenalty: 0.3 };

  var Api = {
    apiConfigs: [],
    activeApi: null,
    floatEl: null,
    currentTab: 'config',
    _editingIdx: -1,
    _drag: { active: false, sx: 0, sy: 0, ox: 0, oy: 0 },
    _closeListener: null,

    load: function() {
      Api.apiConfigs = App.LS.get('apiConfigs') || [];
      Api.activeApi = App.LS.get('activeApi') || null;
    },
    save: function() { App.LS.set('apiConfigs', Api.apiConfigs); },
    saveActive: function() { if (Api.activeApi) App.LS.set('activeApi', Api.activeApi); else App.LS.remove('activeApi'); },
    getParams: function() { return App.LS.get('apiParams') || JSON.parse(JSON.stringify(PARAM_DEFAULTS)); },

    open: function() {
      if (Api.floatEl) { Api.close(); return; }
      Api.load();
      Api.currentTab = 'config';
      Api._editingIdx = -1;

      var el = document.createElement('div');
      el.id = 'apiFloat';
      el.className = 'api-float';
      Api.floatEl = el;
      document.body.appendChild(el);

      Api.renderFloat();

      var cx = window.innerWidth / 2 - 150;
      var cy = window.innerHeight / 2 - 200;
      if (cx < 8) cx = 8;
      if (cy < 60) cy = 60;
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';

      requestAnimationFrame(function() { el.classList.add('open'); });

      Api._closeListener = function(e) {
        if (!Api.floatEl) return;
        if (Api.floatEl.contains(e.target)) return;
        var ball = App.state.ball;
        if (ball && (e.target === ball || ball.contains(e.target))) return;
        Api.close();
      };
      setTimeout(function() {
        document.addEventListener('click', Api._closeListener);
        document.addEventListener('touchend', Api._closeListener);
      }, 100);
    },

    close: function() {
      if (Api._closeListener) {
        document.removeEventListener('click', Api._closeListener);
        document.removeEventListener('touchend', Api._closeListener);
        Api._closeListener = null;
      }
      if (!Api.floatEl) return;
      Api.floatEl.classList.remove('open');
      setTimeout(function() { if (Api.floatEl && Api.floatEl.parentNode) Api.floatEl.remove(); Api.floatEl = null; }, 200);
    },

    tkBtn: function(id, label, light) {
      var cls = light ? 'api-fl-tk api-fl-tk-light' : 'api-fl-tk';
      return '<div class="' + cls + '" id="' + id + '"><div class="api-fl-tk-body"><div class="api-fl-tk-inner"></div><div class="api-fl-tk-text">' + label + '</div></div></div>';
    },

    renderFloat: function() {
      var el = Api.floatEl;
      if (!el) return;
      var params = Api.getParams();

      var tabsHtml = '<div class="api-fl-tabs">' +
        '<div class="api-fl-tab' + (Api.currentTab === 'config' ? ' active' : '') + '" data-tab="config">配置</div>' +
        '<div class="api-fl-tab' + (Api.currentTab === 'params' ? ' active' : '') + '" data-tab="params">参数</div>' +
        '<div class="api-fl-tab' + (Api.currentTab === 'saved' ? ' active' : '') + '" data-tab="saved">已存</div>' +
      '</div>';

      var bodyHtml = '';
      var bottomHtml = '';

      if (Api.currentTab === 'config') {
        var editCfg = Api._editingIdx >= 0 ? Api.apiConfigs[Api._editingIdx] : null;
        bodyHtml =
          '<div class="api-fl-field"><div class="api-fl-label">配置名称</div><input type="text" class="api-fl-input" id="apiName" placeholder="例如：OpenAI 中转" value="' + App.esc(editCfg ? editCfg.name : '') + '"></div>' +
          '<div class="api-fl-field"><div class="api-fl-label">API 地址</div><input type="text" class="api-fl-input" id="apiUrl" placeholder="https://example.com/v1" value="' + App.esc(editCfg ? editCfg.url : '') + '"></div>' +
          '<div class="api-fl-field"><div class="api-fl-label">API KEY</div><div class="api-fl-row"><input type="password" class="api-fl-input" id="apiKey" placeholder="sk-..." value="' + App.esc(editCfg ? editCfg.key : '') + '"><button class="api-fl-icon-btn" id="apiToggleKey" type="button"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div>' +
          '<div class="api-fl-field"><div class="api-fl-label">模型</div><div class="api-fl-row"><input type="text" class="api-fl-input" id="apiModel" placeholder="gpt-4o" value="' + App.esc(editCfg ? editCfg.model : '') + '"><button class="api-fl-icon-btn" id="apiFetchModels" type="button"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/></svg></button></div><div class="api-fl-model-list" id="apiModelList"></div></div>';
        bottomHtml = '<div class="api-fl-bottom">' + Api.tkBtn('apiSaveBtn', '保存', false) + Api.tkBtn('apiCloseBtn', '退出', true) + '</div>';

      } else if (Api.currentTab === 'params') {
        bodyHtml =
          '<div class="api-fl-param"><div class="api-fl-param-title">Temperature</div><div class="api-fl-param-desc">贴合人设 ↔ 有创意</div><div class="api-fl-param-slider"><div class="api-fl-range-wrap"><span class="api-fl-range-hint">精确</span><input type="range" class="api-fl-range" id="apiTemp" min="0" max="2" step="0.05" value="' + params.temperature + '"><span class="api-fl-range-val" id="apiTempVal">' + params.temperature + '</span><span class="api-fl-range-hint">创意</span></div></div></div>' +
          '<div class="api-fl-param"><div class="api-fl-param-title">Freq Penalty</div><div class="api-fl-param-desc">避免重复词汇</div><div class="api-fl-param-slider"><div class="api-fl-range-wrap"><span class="api-fl-range-hint">重复</span><input type="range" class="api-fl-range" id="apiFreq" min="0" max="2" step="0.1" value="' + params.freqPenalty + '"><span class="api-fl-range-val" id="apiFreqVal">' + params.freqPenalty + '</span><span class="api-fl-range-hint">避免</span></div></div></div>' +
          '<div class="api-fl-param"><div class="api-fl-param-title">Pres Penalty</div><div class="api-fl-param-desc">鼓励新词汇</div><div class="api-fl-param-slider"><div class="api-fl-range-wrap"><span class="api-fl-range-hint">保守</span><input type="range" class="api-fl-range" id="apiPres" min="0" max="2" step="0.1" value="' + params.presPenalty + '"><span class="api-fl-range-val" id="apiPresVal">' + params.presPenalty + '</span><span class="api-fl-range-hint">创新</span></div></div></div>';
        bottomHtml = '<div class="api-fl-bottom">' + Api.tkBtn('apiSaveParamsBtn', '保存', false) + Api.tkBtn('apiCloseBtn2', '退出', true) + '</div>';

      } else if (Api.currentTab === 'saved') {
        bodyHtml = Api.buildSavedHtml();
        bottomHtml = '<div class="api-fl-bottom">' + Api.tkBtn('apiCloseBtn3', '退出', true) + '</div>';
      }

      el.innerHTML = '<div class="api-float-title">API 配置</div>' + tabsHtml + '<div class="api-fl-scroll">' + bodyHtml + '</div>' + bottomHtml;
      Api.bindEvents();

      // 编辑模式自动获取模型
      if (Api.currentTab === 'config' && Api._editingIdx >= 0) {
        var cfg = Api.apiConfigs[Api._editingIdx];
        if (cfg && cfg.url && cfg.key) {
          setTimeout(function() { Api.fetchModels(cfg.model); }, 300);
        }
      }
    },

    buildSavedHtml: function() {
      if (!Api.apiConfigs.length) return '<div class="api-fl-saved-empty">暂无配置</div>';
      return Api.apiConfigs.map(function(cfg, i) {
        var isActive = Api.activeApi && Api.activeApi.name === cfg.name;
        return '<div class="api-fl-saved-item">' +
          '<div class="api-fl-saved-info">' +
            '<div class="api-fl-saved-name">' + App.esc(cfg.name) + (isActive ? '<span class="api-fl-tag">[当前]</span>' : '') + '</div>' +
            '<div class="api-fl-saved-url">' + App.esc((cfg.model || '') + ' · ' + (cfg.url || '').replace(/^https?:\/\//, '').split('/')[0]) + '</div>' +
          '</div>' +
          '<div class="api-fl-saved-acts">' +
            '<button class="api-fl-act api-fl-act-use" data-idx="' + i + '" type="button"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></button>' +
            '<button class="api-fl-act api-fl-act-edit" data-idx="' + i + '" type="button"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></button>' +
            '<button class="api-fl-act api-fl-act-del" data-idx="' + i + '" type="button"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    bindEvents: function() {
      var el = Api.floatEl;
      if (!el) return;

      var _startedOnInput = false;

      el.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        if (e.target.closest('input') || e.target.closest('select') || e.target.closest('button') || e.target.closest('.api-fl-tk') || e.target.closest('.api-fl-tab') || e.target.closest('.api-fl-model-item') || e.target.closest('.api-fl-act') || e.target.closest('.api-fl-range')) {
          _startedOnInput = true;
          return;
        }
        _startedOnInput = false;
        var t = e.touches[0];
        var rect = el.getBoundingClientRect();
        Api._drag = { active: true, sx: t.clientX, sy: t.clientY, ox: rect.left, oy: rect.top };
      }, { passive: false });

      el.addEventListener('touchmove', function(e) {
        e.stopPropagation();
        if (!Api._drag.active || _startedOnInput) return;
        e.preventDefault();
        var t = e.touches[0];
        el.style.left = (Api._drag.ox + t.clientX - Api._drag.sx) + 'px';
        el.style.top = (Api._drag.oy + t.clientY - Api._drag.sy) + 'px';
      }, { passive: false });

      el.addEventListener('touchend', function() { Api._drag.active = false; _startedOnInput = false; });
      el.addEventListener('click', function(e) { e.stopPropagation(); });

      // Tab
      el.querySelectorAll('.api-fl-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          Api._editingIdx = -1;
          Api.currentTab = tab.dataset.tab;
          Api.renderFloat();
        });
      });

      // 退出
      ['apiCloseBtn', 'apiCloseBtn2', 'apiCloseBtn3'].forEach(function(id) {
        var btn = el.querySelector('#' + id);
        if (btn) btn.addEventListener('click', function(e) { e.stopPropagation(); Api.close(); });
      });

      if (Api.currentTab === 'config') {
        el.querySelector('#apiToggleKey').addEventListener('click', function(e) {
          e.stopPropagation();
          var inp = el.querySelector('#apiKey');
          if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
        });

        el.querySelector('#apiFetchModels').addEventListener('click', function(e) {
          e.stopPropagation();
          Api.fetchModels();
        });

        el.querySelector('#apiSaveBtn').addEventListener('click', function(e) {
          e.stopPropagation();
          var name = (el.querySelector('#apiName') || {}).value || '';
          var url = (el.querySelector('#apiUrl') || {}).value || '';
          var key = (el.querySelector('#apiKey') || {}).value || '';
          var model = (el.querySelector('#apiModel') || {}).value || '';
          name = name.trim(); url = url.trim(); key = key.trim(); model = model.trim();
          if (!name || !url || !key || !model) { App.showToast('请填写所有字段'); return; }
          var config = { name: name, url: url, key: key, model: model };

          if (Api._editingIdx >= 0) {
            Api.apiConfigs[Api._editingIdx] = config;
            if (Api.activeApi && Api.activeApi.name === config.name) { Api.activeApi = config; Api.saveActive(); }
          } else {
            var existing = -1;
            for (var i = 0; i < Api.apiConfigs.length; i++) {
              if (Api.apiConfigs[i].name === config.name) { existing = i; break; }
            }
            if (existing >= 0) Api.apiConfigs[existing] = config;
            else Api.apiConfigs.push(config);
          }

          if (!Api.activeApi) { Api.activeApi = config; Api.saveActive(); }
          Api.save();
          Api._editingIdx = -1;
          App.showToast('已保存');
        });

      } else if (Api.currentTab === 'params') {
        function bindRange(inputId, valId) {
          var input = el.querySelector('#' + inputId);
          var val = el.querySelector('#' + valId);
          if (input && val) input.addEventListener('input', function() { val.textContent = this.value; });
        }
        bindRange('apiTemp', 'apiTempVal');
        bindRange('apiFreq', 'apiFreqVal');
        bindRange('apiPres', 'apiPresVal');

        el.querySelector('#apiSaveParamsBtn').addEventListener('click', function(e) {
          e.stopPropagation();
          App.LS.set('apiParams', {
            temperature: parseFloat((el.querySelector('#apiTemp') || {}).value || 0.8),
            freqPenalty: parseFloat((el.querySelector('#apiFreq') || {}).value || 0.3),
            presPenalty: parseFloat((el.querySelector('#apiPres') || {}).value || 0.3)
          });
          App.showToast('参数已保存');
        });

      } else if (Api.currentTab === 'saved') {
        el.querySelectorAll('.api-fl-act-use').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var cfg = Api.apiConfigs[parseInt(btn.dataset.idx)];
            if (!cfg) return;
            Api.activeApi = cfg; Api.saveActive();
            Api.renderFloat();
            App.showToast('已切换: ' + cfg.name);
          });
        });

        el.querySelectorAll('.api-fl-act-edit').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            Api._editingIdx = parseInt(btn.dataset.idx);
            Api.currentTab = 'config';
            Api.renderFloat();
          });
        });

        el.querySelectorAll('.api-fl-act-del').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var idx = parseInt(btn.dataset.idx);
            var removed = Api.apiConfigs.splice(idx, 1)[0];
            if (Api.activeApi && removed && Api.activeApi.name === removed.name) { Api.activeApi = null; Api.saveActive(); }
            Api.save();
            Api.renderFloat();
            App.showToast('已删除');
          });
        });
      }
    },

    fetchModels: async function(selectModel) {
      var el = Api.floatEl;
      if (!el) return;
      var url = (el.querySelector('#apiUrl') || {}).value || '';
      var key = (el.querySelector('#apiKey') || {}).value || '';
      url = url.trim(); key = key.trim();
      if (!url || !key) { App.showToast('请先填写地址和Key'); return; }
      App.showToast('获取中...');
      try {
        var response = await fetch(url.replace(/\/+$/, '') + '/models', { headers: { 'Authorization': 'Bearer ' + key } });
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
        var list = el.querySelector('#apiModelList');
        if (!list) return;
        list.innerHTML = models.map(function(m) {
          var selected = (selectModel && m === selectModel) ? ' style="background:#f0f5ff;font-weight:700;"' : '';
          return '<div class="api-fl-model-item"' + selected + '>' + App.esc(m) + '</div>';
        }).join('');
        list.classList.add('show');
        list.querySelectorAll('.api-fl-model-item').forEach(function(item) {
          item.addEventListener('click', function() {
            var inp = el.querySelector('#apiModel');
            if (inp) inp.value = item.textContent;
            list.classList.remove('show');
          });
        });
        App.showToast(models.length + ' 个模型');
      } catch (err) { App.showToast('失败: ' + err.message); }
    },

    getActiveConfig: function() {
      if (!Api.activeApi) Api.load();
      return Api.activeApi;
    },

    init: function() {
      Api.load();
      App.api = Api;
    }
  };

  App.register('api', Api);
})();