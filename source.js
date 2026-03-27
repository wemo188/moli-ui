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
    aiDraft: {},
    sourcePreviewCache: {
      active: false,
      originalMain: '',
      originalDraftStyle: ''
    },

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

    createEmptyDraft: function() {
      return {
        html: '',
        css: '',
        coreJs: '',
        themeJs: '',
        fontJs: '',
        apiJs: '',
        sourceJs: '',
        bgJs: '',
        chatJs: '',
        hasHtml: false,
        hasCss: false,
        hasCoreJs: false,
        hasThemeJs: false,
        hasFontJs: false,
        hasApiJs: false,
        hasSourceJs: false,
        hasBgJs: false,
        hasChatJs: false
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

    updateSourceRepoFile: function(storageKey, content) {
      var repo = Source.getSourceRepo();
      var file = FILES.find(function(f) { return f.storageKey === storageKey; });
      if (!file) return;

      repo[storageKey] = content;
      var ta = App.$(file.textarea);
      if (ta) ta.value = content;
      Source.setSourceRepo(repo);
    },

    getDraftFlagName: function(storageKey) {
      var map = {
        html: 'hasHtml',
        css: 'hasCss',
        coreJs: 'hasCoreJs',
        themeJs: 'hasThemeJs',
        fontJs: 'hasFontJs',
        apiJs: 'hasApiJs',
        sourceJs: 'hasSourceJs',
        bgJs: 'hasBgJs',
        chatJs: 'hasChatJs'
      };
      return map[storageKey];
    },

    updateDraftStatus: function() {
      var names = [];

      FILES.forEach(function(file) {
        var flag = Source.getDraftFlagName(file.storageKey);
        if (Source.aiDraft[flag]) names.push(file.label);
      });

      var status = App.$('#sourceAiDraftStatus');
      if (status) {
        status.textContent = names.length ? ('草稿: ' + names.join(' / ')) : '暂无草稿';
      }
    },

    saveDraft: function() {
      App.LS.set('aiDraft', Source.aiDraft);
      Source.updateDraftStatus();
    },

    clearDraft: function() {
      Source.aiDraft = Source.createEmptyDraft();
      Source.saveDraft();
    },

    applyReplyToDraft: function(reply) {
      var accepted = false;

      FILES.forEach(function(file) {
        var reg = new RegExp('```' + file.block + '\\n?([\\s\\S]*?)```', 'g');
        var unauthorizedReg = new RegExp('```' + file.block + '\\n?[\\s\\S]*?```', 'g');
        var match;
        var flag = Source.getDraftFlagName(file.storageKey);

        if (Source.sendFiles[file.storageKey]) {
          while ((match = reg.exec(reply)) !== null) {
            Source.aiDraft[file.storageKey] = match[1].trim();
            Source.aiDraft[flag] = true;
            accepted = true;
          }
        } else if (unauthorizedReg.test(reply)) {
          App.showToast('已拦截未授权的 ' + file.label + ' 改写');
        }
      });

      if (accepted) {
        Source.saveDraft();
        App.showToast('AI 草稿已生成');
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
        cleaned = cleaned.replace(reg, '[AI 提交了 ' + file.label + ' 草稿]');
      });

      if (cleaned.length > 1200) {
        cleaned = cleaned.slice(0, 1200) + '\n\n[回复过长，已折叠显示]';
      }
      return cleaned;
    },

    extractBodyInner: function(html) {
      var bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) return bodyMatch[1];
      return html;
    },

    ensureDraftStyleEl: function() {
      var el = document.getElementById('draft-preview-style');
      if (!el) {
        el = document.createElement('style');
        el.id = 'draft-preview-style';
        document.head.appendChild(el);
      }
      return el;
    },

    previewDraft: function() {
      var hasAnyDraft = false;
      FILES.forEach(function(file) {
        var flag = Source.getDraftFlagName(file.storageKey);
        if (Source.aiDraft[flag]) hasAnyDraft = true;
      });

      if (!hasAnyDraft) {
        App.showToast('暂无可预览的草稿');
        return;
      }

      if (!Source.sourcePreviewCache.active) {
        Source.sourcePreviewCache.originalMain = App.$('#mainContent') ? App.$('#mainContent').innerHTML : '';
        var existingDraftStyle = document.getElementById('draft-preview-style');
        Source.sourcePreviewCache.originalDraftStyle = existingDraftStyle ? existingDraftStyle.textContent : '';
        Source.sourcePreviewCache.active = true;
      }

      if (Source.aiDraft.hasHtml && App.$('#mainContent')) {
        App.$('#mainContent').innerHTML = Source.extractBodyInner(Source.aiDraft.html);
      }

      if (Source.aiDraft.hasCss) {
        var styleEl = Source.ensureDraftStyleEl();
        styleEl.textContent = Source.aiDraft.css;
      }

      if (
        Source.aiDraft.hasCoreJs ||
        Source.aiDraft.hasThemeJs ||
        Source.aiDraft.hasFontJs ||
        Source.aiDraft.hasApiJs ||
        Source.aiDraft.hasSourceJs ||
        Source.aiDraft.hasBgJs ||
        Source.aiDraft.hasChatJs
      ) {
        App.showToast('JS 草稿暂不自动预览，HTML/CSS 已预览');
      } else {
        App.showToast('已预览草稿效果');
      }
    },

    discardDraftPreview: function() {
      if (!Source.sourcePreviewCache.active) return;

      if (App.$('#mainContent')) {
        App.$('#mainContent').innerHTML = Source.sourcePreviewCache.originalMain || '';
      }

      var styleEl = document.getElementById('draft-preview-style');
      if (styleEl) {
        styleEl.textContent = Source.sourcePreviewCache.originalDraftStyle || '';
      }

      Source.sourcePreviewCache.active = false;
    },

    saveDraftToSource: function() {
      var hasAnyDraft = false;

      FILES.forEach(function(file) {
        var flag = Source.getDraftFlagName(file.storageKey);
        if (Source.aiDraft[flag]) {
          hasAnyDraft = true;
          Source.updateSourceRepoFile(file.storageKey, Source.aiDraft[file.storageKey]);
        }
      });

      if (!hasAnyDraft) {
        App.showToast('暂无可保存的草稿');
        return;
      }

      Source.clearDraft();
      App.showToast('已保存 AI 修改');
    },

    discardDraftAll: function() {
      Source.discardDraftPreview();
      Source.clearDraft();
      App.showToast('已丢弃 AI 修改');
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

      App.safeOn('#previewAiDraftBtn', 'click', function() {
        Source.previewDraft();
      });

      App.safeOn('#saveAiDraftBtn', 'click', function() {
        Source.saveDraftToSource();
      });

      App.safeOn('#discardAiDraftBtn', 'click', function() {
        Source.discardDraftAll();
      });
    },

    normalizeOldDraft: function(draft) {
      var base = Source.createEmptyDraft();
      draft = draft || {};

      Object.keys(base).forEach(function(k) {
        if (typeof draft[k] !== 'undefined') base[k] = draft[k];
      });

      return base;
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
      var oldDraft = App.LS.get('aiDraft') || {};
      var oldRepo = App.LS.get('sourceRepo') || {};

      Source.sendFiles = Source.normalizeOldSendFiles(oldSendFiles);
      Source.aiDraft = Source.normalizeOldDraft(oldDraft);

      var normalizedRepo = Source.normalizeOldRepo(oldRepo);
      Source.setSourceRepo(normalizedRepo);

      App.LS.set('sendFiles', Source.sendFiles);
      App.LS.set('aiDraft', Source.aiDraft);

      App.source = Source;
      Source.restoreSourceRepo();
      Source.updateDraftStatus();
      Source.bindEvents();
    }
  };

  App.register('source', Source);
})();
