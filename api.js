(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Api = {
    apiConfigs: [],
    activeApi: null,

    updateAiStatus: function() {
      var status = App.$('#aiStatus');
      if (!status) return;

      if (Api.activeApi) {
        status.innerHTML = '<div class="status-dot online"></div><span>已连接: ' + App.esc(Api.activeApi.name) + ' (' + App.esc(Api.activeApi.model) + ')</span>';
      } else {
        status.innerHTML = '<div class="status-dot offline"></div><span>未连接</span>';
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
        return '<div class="saved-item">' +
          '<div class="saved-item-info">' +
            '<div class="saved-item-name">' + App.esc(cfg.name) + '</div>' +
            '<div class="saved-item-url">' + App.esc(cfg.url) + ' · ' + App.esc(cfg.model) + '</div>' +
          '</div>' +
          '<div class="saved-item-actions">' +
            '<button class="use-btn" onclick="window._useApi(' + i + ')" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></button>' +
            '<button class="edit-btn" onclick="window._editApi(' + i + ')" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></button>' +
            '<button class="del-btn" onclick="window._delApi(' + i + ')" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    bindEvents: function() {
      window._useApi = function(i) {
        Api.activeApi = Api.apiConfigs[i];
        App.LS.set('activeApi', Api.activeApi);
        Api.renderSavedApis();
        Api.updateAiStatus();
        App.showToast('已切换至: ' + Api.activeApi.name);
      };

      window._editApi = function(i) {
        var cfg = Api.apiConfigs[i];
        if (!cfg) return;
        if (App.$('#apiName')) App.$('#apiName').value = cfg.name || '';
        if (App.$('#apiUrl')) App.$('#apiUrl').value = cfg.url || '';
        if (App.$('#apiKey')) App.$('#apiKey').value = cfg.key || '';
        if (App.$('#apiModel')) App.$('#apiModel').value = cfg.model || '';
        App.openPanel('apiPanel');
        App.showToast('已载入配置');
      };

      window._delApi = function(i) {
        var removed = Api.apiConfigs.splice(i, 1)[0];
        App.LS.set('apiConfigs', Api.apiConfigs);
        if (Api.activeApi && removed && Api.activeApi.name === removed.name) {
          Api.activeApi = null;
          App.LS.remove('activeApi');
        }
        Api.renderSavedApis();
        Api.updateAiStatus();
        App.showToast('已删除');
      };

      App.safeOn('#saveApiBtn', 'click', function() {
        var name = App.$('#apiName') ? App.$('#apiName').value.trim() : '';
        var url = App.$('#apiUrl') ? App.$('#apiUrl').value.trim() : '';
        var key = App.$('#apiKey') ? App.$('#apiKey').value.trim() : '';
        var model = App.$('#apiModel') ? App.$('#apiModel').value.trim() : '';

        if (!name || !url || !key || !model) {
          App.showToast('请填写所有字段');
          return;
        }

        var config = { name: name, url: url, key: key, model: model };
        var existing = -1;
        for (var i = 0; i < Api.apiConfigs.length; i++) {
          if (Api.apiConfigs[i].name === name) {
            existing = i;
            break;
          }
        }

        if (existing >= 0) Api.apiConfigs[existing] = config;
        else Api.apiConfigs.push(config);

        App.LS.set('apiConfigs', Api.apiConfigs);
        Api.renderSavedApis();
        App.showToast('配置已保存');
      });

      App.safeOn('#toggleKeyVisible', 'click', function() {
        var inp = App.$('#apiKey');
        if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
      });

      App.safeOn('#fetchModelsBtn', 'click', function() {
        var url = App.$('#apiUrl') ? App.$('#apiUrl').value.trim() : '';
        var key = App.$('#apiKey') ? App.$('#apiKey').value.trim() : '';
        if (!url || !key) {
          App.showToast('请先填写 API 地址和 Key');
          return;
        }

        App.showToast('正在获取模型列表...');
        fetch(url.replace(/\/+$/, '') + '/models', {
          headers: { 'Authorization': 'Bearer ' + key }
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var raw = data.data || data;
          var models = [];
          if (Array.isArray(raw)) {
            for (var i = 0; i < raw.length; i++) {
              var id = raw[i].id || raw[i].name || raw[i];
              if (id) models.push(id);
            }
          }

          if (!models.length) {
            App.showToast('未找到模型');
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
            });
          });
        })
        .catch(function(err) {
          App.showToast('获取失败: ' + err.message);
        });
      });

      App.safeOn('#testApiBtn', 'click', function() {
        var url = App.$('#apiUrl') ? App.$('#apiUrl').value.trim() : '';
        var key = App.$('#apiKey') ? App.$('#apiKey').value.trim() : '';
        var model = App.$('#apiModel') ? App.$('#apiModel').value.trim() : '';

        if (!url || !key || !model) {
          App.showToast('请填写完整信息');
          return;
        }

        App.showToast('正在测试连接...');
        fetch(url.replace(/\/+$/, '') + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        })
        .then(function(r) {
          if (r.ok) App.showToast('连接成功');
          else App.showToast('连接失败: ' + r.status);
        })
        .catch(function(err) {
          App.showToast('连接失败: ' + err.message);
        });
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
