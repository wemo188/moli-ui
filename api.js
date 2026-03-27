(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Api = {
    apiConfigs: [],
    activeApi: null,
    eventsBound: false,
    testingConnection: false,
    fetchingModels: false,

    updateAiStatus: function() {
      var status = App.$('#aiStatus');
      if (!status) return;

      if (Api.activeApi) {
        status.innerHTML =
          '<div class="status-dot online"></div>' +
          '<span>已连接: ' + App.esc(Api.activeApi.name) + ' (' + App.esc(Api.activeApi.model) + ')</span>';
      } else {
        status.innerHTML =
          '<div class="status-dot offline"></div>' +
          '<span>未连接</span>';
      }
    },

    renderSavedApis: function() {
      var container = App.$('#savedApis');
      if (!container) return;

      if (Api.apiConfigs.length === 0) {
        container.innerHTML = '<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:16px;">暂无保存的配置</p>';
        return;
      }

      container.innerHTML = Api.apiConfigs.map(function(cfg, i) {
        var isActive =
          Api.activeApi &&
          Api.activeApi.name === cfg.name &&
          Api.activeApi.url === cfg.url &&
          Api.activeApi.model === cfg.model;

        return '<div class="saved-item">' +
          '<div class="saved-item-info">' +
            '<div class="saved-item-name">' +
              App.esc(cfg.name) +
              (isActive ? ' <span style="font-size:11px;color:var(--accent-deep);">[当前使用]</span>' : '') +
            '</div>' +
            '<div class="saved-item-url">' + App.esc(cfg.url) + ' · ' + App.esc(cfg.model) + '</div>' +
          '</div>' +
          '<div class="saved-item-actions">' +
            '<button class="use-btn" onclick="window._useApi(' + i + ')" type="button" title="使用">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<polyline points="20 6 9 17 4 12"/>' +
              '</svg>' +
            '</button>' +
            '<button class="edit-btn" onclick="window._editApi(' + i + ')" type="button" title="编辑">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M12 20h9"/>' +
                '<path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>' +
              '</svg>' +
            '</button>' +
            '<button class="del-btn" onclick="window._delApi(' + i + ')" type="button" title="删除">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M3 6h18"/>' +
                '<path d="M8 6V4h8v2"/>' +
                '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>' +
              '</svg>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    setBtnLoading: function(selector, loadingText, busy) {
      var btn = App.$(selector);
      if (!btn) return;

      if (!btn.dataset.originText) {
        btn.dataset.originText = btn.textContent;
      }

      btn.disabled = !!busy;
      btn.style.opacity = busy ? '0.65' : '';
      btn.style.pointerEvents = busy ? 'none' : '';

      if (busy) {
        btn.textContent = loadingText;
      } else {
        btn.textContent = btn.dataset.originText || btn.textContent;
      }
    },

    bindEvents: function() {
      if (Api.eventsBound) return;
      Api.eventsBound = true;

      window._useApi = function(i) {
        var cfg = Api.apiConfigs[i];
        if (!cfg) {
          App.showToast('配置不存在');
          return;
        }

        Api.activeApi = cfg;
        App.LS.set('activeApi', Api.activeApi);
        Api.renderSavedApis();
        Api.updateAiStatus();
        App.showToast('已切换至: ' + cfg.name, 2200);
      };

      window._editApi = function(i) {
        var cfg = Api.apiConfigs[i];
        if (!cfg) return;

        if (App.$('#apiName')) App.$('#apiName').value = cfg.name || '';
        if (App.$('#apiUrl')) App.$('#apiUrl').value = cfg.url || '';
        if (App.$('#apiKey')) App.$('#apiKey').value = cfg.key || '';
        if (App.$('#apiModel')) App.$('#apiModel').value = cfg.model || '';

        App.openPanel('apiPanel');
        App.showToast('已载入配置', 1800);
      };

      window._delApi = function(i) {
        var removed = Api.apiConfigs.splice(i, 1)[0];
        App.LS.set('apiConfigs', Api.apiConfigs);

        if (
          Api.activeApi &&
          removed &&
          Api.activeApi.name === removed.name &&
          Api.activeApi.url === removed.url &&
          Api.activeApi.model === removed.model
        ) {
          Api.activeApi = null;
          App.LS.remove('activeApi');
        }

        Api.renderSavedApis();
        Api.updateAiStatus();
        App.showToast('已删除配置', 1800);
      };

      App.safeOn('#saveApiBtn', 'click', function() {
        var name = App.$('#apiName') ? App.$('#apiName').value.trim() : '';
        var url = App.$('#apiUrl') ? App.$('#apiUrl').value.trim() : '';
        var key = App.$('#apiKey') ? App.$('#apiKey').value.trim() : '';
        var model = App.$('#apiModel') ? App.$('#apiModel').value.trim() : '';

        if (!name || !url || !key || !model) {
          App.showToast('请填写所有字段', 2200);
          return;
        }

        var config = { name: name, url: url, key: key, model: model };
        var existing = -1;

        for (var i = 0; i < Api.apiConfigs.length; i++) {
          if (Api.apiConfigs[i].name === config.name) {
            existing = i;
            break;
          }
        }

        if (existing >= 0) Api.apiConfigs[existing] = config;
        else Api.apiConfigs.push(config);

        App.LS.set('apiConfigs', Api.apiConfigs);
        Api.renderSavedApis();
        App.showToast('配置已保存', 2000);
      });

      App.safeOn('#toggleKeyVisible', 'click', function() {
        var inp = App.$('#apiKey');
        if (!inp) return;
        inp.type = inp.type === 'password' ? 'text' : 'password';
      });

      App.safeOn('#fetchModelsBtn', 'click', async function() {
        if (Api.fetchingModels) {
          App.showToast('正在获取模型，请稍候...');
          return;
        }

        var url = App.$('#apiUrl') ? App.$('#apiUrl').value.trim() : '';
        var key = App.$('#apiKey') ? App.$('#apiKey').value.trim() : '';

        if (!url || !key) {
          App.showToast('请先填写 API 地址和 Key', 2200);
          return;
        }

        Api.fetchingModels = true;
        Api.setBtnLoading('#fetchModelsBtn', '获取中', true);
        App.showToast('正在获取模型列表...', 1800);

        try {
          var response = await fetch(url.replace(/\/+$/, '') + '/models', {
            headers: {
              'Authorization': 'Bearer ' + key
            }
          });

          if (!response.ok) {
            throw new Error('HTTP ' + response.status);
          }

          var data = await response.json();
          var raw = data.data || data;
          var models = [];

          if (Array.isArray(raw)) {
            for (var i = 0; i < raw.length; i++) {
              var id = raw[i].id || raw[i].name || raw[i];
              if (id) models.push(id);
            }
          }

          if (!models.length) {
            App.showToast('未找到模型', 2200);
            return;
          }

          var list = App.$('#modelList');
          if (!list) return;

          list.innerHTML = models.map(function(m) {
            return '<div class="model-item">' + App.esc(m) + '</div>';
          }).join('');

          list.classList.remove('hidden');

          list.querySelectorAll('.model-item').forEach(function(item) {
            item.addEventListener('click', function() {
              if (App.$('#apiModel')) App.$('#apiModel').value = item.textContent;
              list.classList.add('hidden');
              App.showToast('已选择模型: ' + item.textContent, 1800);
            });
          });

          App.showToast('已获取 ' + models.length + ' 个模型', 2200);
        } catch (err) {
          App.showToast('获取模型失败: ' + err.message, 2600);
        } finally {
          Api.fetchingModels = false;
          Api.setBtnLoading('#fetchModelsBtn', '获取中', false);
        }
      });

      App.safeOn('#testApiBtn', 'click', async function() {
        if (Api.testingConnection) {
          App.showToast('正在测试连接，请稍候...');
          return;
        }

        var url = App.$('#apiUrl') ? App.$('#apiUrl').value.trim() : '';
        var key = App.$('#apiKey') ? App.$('#apiKey').value.trim() : '';
        var model = App.$('#apiModel') ? App.$('#apiModel').value.trim() : '';

        if (!url || !key || !model) {
          App.showToast('请填写完整信息', 2200);
          return;
        }

        Api.testingConnection = true;
        Api.setBtnLoading('#testApiBtn', '测试中', true);
        App.showToast('正在测试连接...', 1800);

        try {
          var response = await fetch(url.replace(/\/+$/, '') + '/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + key
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'user', content: 'Hi' }
              ]
            })
          });

          var data = await response.json().catch(function() { return {}; });

          if (!response.ok) {
            var msg =
              (data && data.error && data.error.message) ||
              (data && data.message) ||
              ('HTTP ' + response.status);
            throw new Error(msg);
          }

          App.showToast('连接成功', 2400);
        } catch (err) {
          App.showToast('连接失败: ' + err.message, 3200);
        } finally {
          Api.testingConnection = false;
          Api.setBtnLoading('#testApiBtn', '测试中', false);
        }
      });
    },

    init: function() {
      Api.apiConfigs = App.LS.get('apiConfigs') || [];
      Api.activeApi = App.LS.get('activeApi') || null;

      App.api = Api;
      Api.renderSavedApis();
      Api.updateAiStatus();
      Api.bindEvents();
    }
  };

  App.register('api', Api);
})();