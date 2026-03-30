(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var FILES = [
    {
      key: 'html',
      label: 'index.html',
      storageKey: 'html',
      textarea: '#sourceHtml',
      sendCheckbox: '#sendHtmlToAI',
      copyBtn: '#copySourceHtml',
      saveBtn: '#saveSourceHtml',
      clearBtn: '#clearSourceHtml',
      block: 'source-html'
    },
    {
      key: 'css',
      label: 'style.css',
      storageKey: 'css',
      textarea: '#sourceCss',
      sendCheckbox: '#sendCssToAI',
      copyBtn: '#copySourceCss',
      saveBtn: '#saveSourceCss',
      clearBtn: '#clearSourceCss',
      block: 'source-css'
    },
    {
      key: 'coreJs',
      label: 'script.js',
      storageKey: 'coreJs',
      textarea: '#sourceCoreJs',
      sendCheckbox: '#sendCoreJsToAI',
      copyBtn: '#copySourceCoreJs',
      saveBtn: '#saveSourceCoreJs',
      clearBtn: '#clearSourceCoreJs',
      block: 'source-script-js'
    },
    {
      key: 'themeJs',
      label: 'theme.js',
      storageKey: 'themeJs',
      textarea: '#sourceThemeJs',
      sendCheckbox: '#sendThemeJsToAI',
      copyBtn: '#copySourceThemeJs',
      saveBtn: '#saveSourceThemeJs',
      clearBtn: '#clearSourceThemeJs',
      block: 'source-theme-js'
    },
    {
      key: 'fontJs',
      label: 'font.js',
      storageKey: 'fontJs',
      textarea: '#sourceFontJs',
      sendCheckbox: '#sendFontJsToAI',
      copyBtn: '#copySourceFontJs',
      saveBtn: '#saveSourceFontJs',
      clearBtn: '#clearSourceFontJs',
      block: 'source-font-js'
    },
    {
      key: 'apiJs',
      label: 'api.js',
      storageKey: 'apiJs',
      textarea: '#sourceApiJs',
      sendCheckbox: '#sendApiJsToAI',
      copyBtn: '#copySourceApiJs',
      saveBtn: '#saveSourceApiJs',
      clearBtn: '#clearSourceApiJs',
      block: 'source-api-js'
    },
    {
      key: 'sourceJs',
      label: 'source.js',
      storageKey: 'sourceJs',
      textarea: '#sourceSourceJs',
      sendCheckbox: '#sendSourceJsToAI',
      copyBtn: '#copySourceSourceJs',
      saveBtn: '#saveSourceSourceJs',
      clearBtn: '#clearSourceSourceJs',
      block: 'source-source-js'
    },
    {
      key: 'bgJs',
      label: 'bg.js',
      storageKey: 'bgJs',
      textarea: '#sourceBgJs',
      sendCheckbox: '#sendBgJsToAI',
      copyBtn: '#copySourceBgJs',
      saveBtn: '#saveSourceBgJs',
      clearBtn: '#clearSourceBgJs',
      block: 'source-bg-js'
    },
    {
      key: 'chatJs',
      label: 'chat.js',
      storageKey: 'chatJs',
      textarea: '#sourceChatJs',
      sendCheckbox: '#sendChatJsToAI',
      copyBtn: '#copySourceChatJs',
      saveBtn: '#saveSourceChatJs',
      clearBtn: '#clearSourceChatJs',
      block: 'source-chat-js'
    }
  ];

  var Source = {
    sendFiles: {},

    createEmptyRepo: function() {
      return {
        html: '',
        css: '',
        coreJs: '',
        themeJs: '',
        fontJs: '',
        apiJs: '',
        sourceJs: '',
        bgJs: '',
        chatJs: ''
      };
    },

    getSourceRepo: function() {
      var repo = App.LS.get('sourceRepo') || {};
      var base = Source.createEmptyRepo();
      Object.keys(base).forEach(function(k) {
        if (typeof repo[k] === 'string') base[k] = repo[k];
      });
      return base;
    },

    setSourceRepo: function(repo) {
      var base = Source.createEmptyRepo();
      Object.keys(base).forEach(function(k) {
        base[k] = repo[k] || '';
      });
      App.LS.set('sourceRepo', base);
    },

    restoreSourceRepo: function() {
      var repo = Source.getSourceRepo();

      FILES.forEach(function(file) {
        var ta = App.$(file.textarea);
        var cb = App.$(file.sendCheckbox);
        if (ta) ta.value = repo[file.storageKey] || '';
        if (cb) cb.checked = !!Source.sendFiles[file.storageKey];
      });
    },

    saveSendFiles: function() {
      var map = {};
      FILES.forEach(function(file) {
        var cb = App.$(file.sendCheckbox);
        map[file.storageKey] = !!(cb && cb.checked);
      });
      Source.sendFiles = map;
      App.LS.set('sendFiles', map);
    },

    saveSourceField: function(storageKey) {
      var repo = Source.getSourceRepo();
      var file = FILES.find(function(f) { return f.storageKey === storageKey; });
      if (!file) return;

      var ta = App.$(file.textarea);
      repo[storageKey] = ta ? ta.value : '';
      Source.setSourceRepo(repo);
      App.showToast(file.label + ' 已保存');
    },

    clearSourceField: function(storageKey) {
      var repo = Source.getSourceRepo();
      var file = FILES.find(function(f) { return f.storageKey === storageKey; });
      if (!file) return;

      repo[storageKey] = '';
      var ta = App.$(file.textarea);
      if (ta) ta.value = '';

      Source.setSourceRepo(repo);
      App.showToast(file.label + ' 已清空');
    },

    copySourceField: function(storageKey) {
      var file = FILES.find(function(f) { return f.storageKey === storageKey; });
      if (!file) return;

      var ta = App.$(file.textarea);
      var text = ta ? ta.value : '';

      App.copyText(text || '').then(function() {
        App.showToast(file.label + ' 已复制');
      }).catch(function() {
        App.showToast('复制失败');
      });
    },

    // ========= 即时生效：核心方法 =========

    extractBodyInner: function(html) {
      var bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) return bodyMatch[1];
      return html;
    },

    ensureLiveStyleEl: function() {
      var el = document.getElementById('ai-live-style');
      if (!el) {
        el = document.createElement('style');
        el.id = 'ai-live-style';
        document.head.appendChild(el);
      }
      return el;
    },

    applyHtmlLive: function(htmlCode) {
      var main = App.$('#mainContent');
      if (!main) return;
      main.innerHTML = Source.extractBodyInner(htmlCode);
    },

    applyCssLive: function(cssCode) {
      var styleEl = Source.ensureLiveStyleEl();
      styleEl.textContent = cssCode;
    },

    applyJsLive: function(jsCode) {
      try {
        var script = document.createElement('script');
        script.textContent = jsCode;
        document.body.appendChild(script);
      } catch (e) {
        App.showToast('JS 执行出错: ' + e.message);
      }
    },

    applyCodeLive: function(storageKey, code) {
      if (storageKey === 'html') {
        Source.applyHtmlLive(code);
      } else if (storageKey === 'css') {
        Source.applyCssLive(code);
      } else {
        // 所有 JS 文件都直接执行
        Source.applyJsLive(code);
      }
    },

    // ========= AI 返回处理：直接替换 + 即时生效 =========

    applyReplyToLive: function(reply) {
      var applied = [];

      FILES.forEach(function(file) {
        var reg = new RegExp('```' + file.block + '\\n?([\\s\\S]*?)```', 'g');
        var unauthorizedReg = new RegExp('```' + file.block + '\\n?[\\s\\S]*?```', 'g');
        var match;

        if (Source.sendFiles[file.storageKey]) {
          while ((match = reg.exec(reply)) !== null) {
            var code = match[1].trim();

            // 1. 替换源码仓文本框
            var ta = App.$(file.textarea);
            if (ta) ta.value = code;

            // 2. 即时在页面上生效
            Source.applyCodeLive(file.storageKey, code);

            applied.push(file.label);
          }
        } else if (unauthorizedReg.test(reply)) {
          App.showToast('已拦截未授权的 ' + file.label + ' 改写');
        }
      });

      if (applied.length) {
        App.showToast('已即时应用: ' + applied.join(', ') + '  (不满意请刷新页面)');
      }
    },

    // ========= 一键保存：把当前文本框内容写入 localStorage =========

    saveAllToStorage: function() {
      var repo = Source.createEmptyRepo();
      var saved = [];

      FILES.forEach(function(file) {
        var ta = App.$(file.textarea);
        if (ta && ta.value.trim()) {
          repo[file.storageKey] = ta.value;
          saved.push(file.label);
        }
      });

      Source.setSourceRepo(repo);

      if (saved.length) {
        App.showToast('已保存: ' + saved.join(', '));
      } else {
        App.showToast('源码仓为空，无需保存');
      }
    },

    buildSelectedSourcePrompt: function() {
      var repo = Source.getSourceRepo();
      var parts = [];
      var allowed = [];
      var formats = [];

      FILES.forEach(function(file) {
        if (Source.sendFiles[file.storageKey] && repo[file.storageKey]) {
          parts.push('[' + file.label + ']\n' + repo[file.storageKey]);
          allowed.push(file.label);
          formats.push('```' + file.block + '\n完整 ' + file.label + '\n```');
        }
      });

      if (!parts.length) return '';

      return '\n\n=== 以下是允许修改的源码文件 ===\n' +
        parts.join('\n\n') +
        '\n\n你只能修改这些被发送的文件：' + allowed.join(', ') + '。\n' +
        '没有被发送的文件，你绝对不能返回对应的 source 代码块。\n' +
        '请严格使用与文件一一对应的代码块名称返回完整文件内容。\n' +
        '允许的返回格式如下：\n' +
        formats.join('\n');
    },

    cleanReplyForDisplay: function(reply) {
      var cleaned = reply;

      FILES.forEach(function(file) {
        var reg = new RegExp('```' + file.block + '\\n?[\\s\\S]*?```', 'g');
        cleaned = cleaned.replace(reg, '[AI 已修改 ' + file.label + ']');
      });

      if (cleaned.length > 1200) {
        cleaned = cleaned.slice(0, 1200) + '\n\n[回复过长，已折叠显示]';
      }
      return cleaned;
    },

    bindFileEvents: function(file) {
      App.safeOn(file.sendCheckbox, 'change', function() {
        Source.saveSendFiles();
        App.showToast(this.checked ? ('已勾选 ' + file.label) : ('已取消 ' + file.label));
      });

      App.safeOn(file.copyBtn, 'click', function() {
        Source.copySourceField(file.storageKey);
      });

      App.safeOn(file.saveBtn, 'click', function() {
        Source.saveSourceField(file.storageKey);
      });

      App.safeOn(file.clearBtn, 'click', function() {
        Source.clearSourceField(file.storageKey);
      });
    },

    bindEvents: function() {
      FILES.forEach(function(file) {
        Source.bindFileEvents(file);
      });

      // 一键保存：把文本框内容持久化到 localStorage
      App.safeOn('#saveAiDraftBtn', 'click', function() {
        Source.saveAllToStorage();
      });

      // 丢弃修改：直接刷新页面，从 localStorage 恢复
      App.safeOn('#discardAiDraftBtn', 'click', function() {
        if (confirm('确定要丢弃修改吗？页面将刷新并恢复到上次保存的版本。')) {
          location.reload();
        }
      });

      // 预览按钮也改为提示
      App.safeOn('#previewAiDraftBtn', 'click', function() {
        App.showToast('AI 修改已自动即时生效，不满意请刷新页面');
      });
    },

    normalizeOldSendFiles: function(data) {
      var base = Source.createEmptyRepo();
      var result = {};
      Object.keys(base).forEach(function(k) {
        result[k] = false;
      });

      data = data || {};

      if (typeof data.html === 'boolean') result.html = data.html;
      if (typeof data.css === 'boolean') result.css = data.css;
      if (typeof data.js === 'boolean') result.coreJs = data.js;

      if (typeof data.coreJs === 'boolean') result.coreJs = data.coreJs;
      if (typeof data.themeJs === 'boolean') result.themeJs = data.themeJs;
      if (typeof data.fontJs === 'boolean') result.fontJs = data.fontJs;
      if (typeof data.apiJs === 'boolean') result.apiJs = data.apiJs;
      if (typeof data.sourceJs === 'boolean') result.sourceJs = data.sourceJs;
      if (typeof data.bgJs === 'boolean') result.bgJs = data.bgJs;
      if (typeof data.chatJs === 'boolean') result.chatJs = data.chatJs;

      return result;
    },

    normalizeOldRepo: function(repo) {
      var base = Source.createEmptyRepo();
      repo = repo || {};

      if (typeof repo.html === 'string') base.html = repo.html;
      if (typeof repo.css === 'string') base.css = repo.css;
      if (typeof repo.js === 'string') base.coreJs = repo.js;

      if (typeof repo.coreJs === 'string') base.coreJs = repo.coreJs;
      if (typeof repo.themeJs === 'string') base.themeJs = repo.themeJs;
      if (typeof repo.fontJs === 'string') base.fontJs = repo.fontJs;
      if (typeof repo.apiJs === 'string') base.apiJs = repo.apiJs;
      if (typeof repo.sourceJs === 'string') base.sourceJs = repo.sourceJs;
      if (typeof repo.bgJs === 'string') base.bgJs = repo.bgJs;
      if (typeof repo.chatJs === 'string') base.chatJs = repo.chatJs;

      return base;
    },

    init: function() {
      var oldSendFiles = App.LS.get('sendFiles') || {};
      var oldRepo = App.LS.get('sourceRepo') || {};

      Source.sendFiles = Source.normalizeOldSendFiles(oldSendFiles);

      var normalizedRepo = Source.normalizeOldRepo(oldRepo);
      Source.setSourceRepo(normalizedRepo);

      App.LS.set('sendFiles', Source.sendFiles);

      // 清除旧的草稿数据
      App.LS.remove('aiDraft');

      App.source = Source;
      Source.restoreSourceRepo();
      Source.bindEvents();
    }
  };

  App.register('source', Source);
})();
