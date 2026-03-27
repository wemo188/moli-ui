(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Source = {
    sendFiles: {
      html: false,
      css: false,
      js: false
    },

    aiDraft: {
      html: '',
      css: '',
      js: '',
      hasHtml: false,
      hasCss: false,
      hasJs: false
    },

    sourcePreviewCache: {
      active: false,
      originalMain: '',
      originalDraftStyle: ''
    },

    getSourceRepo: function() {
      return App.LS.get('sourceRepo') || {
        html: '',
        css: '',
        js: ''
      };
    },

    setSourceRepo: function(repo) {
      App.LS.set('sourceRepo', {
        html: repo.html || '',
        css: repo.css || '',
        js: repo.js || ''
      });
    },

    restoreSourceRepo: function() {
      var repo = Source.getSourceRepo();
      if (App.$('#sourceHtml')) App.$('#sourceHtml').value = repo.html || '';
      if (App.$('#sourceCss')) App.$('#sourceCss').value = repo.css || '';
      if (App.$('#sourceJs')) App.$('#sourceJs').value = repo.js || '';

      if (App.$('#sendHtmlToAI')) App.$('#sendHtmlToAI').checked = !!Source.sendFiles.html;
      if (App.$('#sendCssToAI')) App.$('#sendCssToAI').checked = !!Source.sendFiles.css;
      if (App.$('#sendJsToAI')) App.$('#sendJsToAI').checked = !!Source.sendFiles.js;
    },

    saveSendFiles: function() {
      Source.sendFiles = {
        html: App.$('#sendHtmlToAI') ? App.$('#sendHtmlToAI').checked : false,
        css: App.$('#sendCssToAI') ? App.$('#sendCssToAI').checked : false,
        js: App.$('#sendJsToAI') ? App.$('#sendJsToAI').checked : false
      };
      App.LS.set('sendFiles', Source.sendFiles);
    },

    saveSourceField: function(type) {
      var repo = Source.getSourceRepo();
      if (type === 'html' && App.$('#sourceHtml')) repo.html = App.$('#sourceHtml').value;
      if (type === 'css' && App.$('#sourceCss')) repo.css = App.$('#sourceCss').value;
      if (type === 'js' && App.$('#sourceJs')) repo.js = App.$('#sourceJs').value;
      Source.setSourceRepo(repo);
      App.showToast(type + ' 已保存');
    },

    clearSourceField: function(type) {
      var repo = Source.getSourceRepo();
      if (type === 'html') {
        repo.html = '';
        if (App.$('#sourceHtml')) App.$('#sourceHtml').value = '';
      }
      if (type === 'css') {
        repo.css = '';
        if (App.$('#sourceCss')) App.$('#sourceCss').value = '';
      }
      if (type === 'js') {
        repo.js = '';
        if (App.$('#sourceJs')) App.$('#sourceJs').value = '';
      }
      Source.setSourceRepo(repo);
      App.showToast(type + ' 已清空');
    },

    copySourceField: function(type) {
      var text = '';
      if (type === 'html' && App.$('#sourceHtml')) text = App.$('#sourceHtml').value;
      if (type === 'css' && App.$('#sourceCss')) text = App.$('#sourceCss').value;
      if (type === 'js' && App.$('#sourceJs')) text = App.$('#sourceJs').value;

      App.copyText(text || '').then(function() {
        App.showToast(type + ' 已复制');
      }).catch(function() {
        App.showToast('复制失败');
      });
    },

    updateSourceRepoFile: function(type, content) {
      var repo = Source.getSourceRepo();
      if (type === 'html') {
        repo.html = content;
        if (App.$('#sourceHtml')) App.$('#sourceHtml').value = content;
      }
      if (type === 'css') {
        repo.css = content;
        if (App.$('#sourceCss')) App.$('#sourceCss').value = content;
      }
      if (type === 'js') {
        repo.js = content;
        if (App.$('#sourceJs')) App.$('#sourceJs').value = content;
      }
      Source.setSourceRepo(repo);
    },

    updateDraftStatus: function() {
      var names = [];
      if (Source.aiDraft.hasHtml) names.push('html');
      if (Source.aiDraft.hasCss) names.push('css');
      if (Source.aiDraft.hasJs) names.push('js');
      if (App.$('#sourceAiDraftStatus')) {
        App.$('#sourceAiDraftStatus').textContent = names.length ? ('草稿: ' + names.join(' / ')) : '暂无草稿';
      }
    },

    saveDraft: function() {
      App.LS.set('aiDraft', Source.aiDraft);
      Source.updateDraftStatus();
    },

    clearDraft: function() {
      Source.aiDraft = {
        html: '',
        css: '',
        js: '',
        hasHtml: false,
        hasCss: false,
        hasJs: false
      };
      Source.saveDraft();
    },

    applyReplyToDraft: function(reply) {
      var match;
      var accepted = false;

      if (Source.sendFiles.html) {
        var htmlReg = /```source-html\n?([\s\S]*?)```/g;
        while ((match = htmlReg.exec(reply)) !== null) {
          Source.aiDraft.html = match[1].trim();
          Source.aiDraft.hasHtml = true;
          accepted = true;
        }
      } else if (/```source-html\n?[\s\S]*?```/g.test(reply)) {
        App.showToast('已拦截未授权的 index.html 改写');
      }

      if (Source.sendFiles.css) {
        var cssReg = /```source-css\n?([\s\S]*?)```/g;
        while ((match = cssReg.exec(reply)) !== null) {
          Source.aiDraft.css = match[1].trim();
          Source.aiDraft.hasCss = true;
          accepted = true;
        }
      } else if (/```source-css\n?[\s\S]*?```/g.test(reply)) {
        App.showToast('已拦截未授权的 style.css 改写');
      }

      if (Source.sendFiles.js) {
        var jsReg = /```source-js\n?([\s\S]*?)```/g;
        while ((match = jsReg.exec(reply)) !== null) {
          Source.aiDraft.js = match[1].trim();
          Source.aiDraft.hasJs = true;
          accepted = true;
        }
      } else if (/```source-js\n?[\s\S]*?```/g.test(reply)) {
        App.showToast('已拦截未授权的 script.js 改写');
      }

      if (accepted) {
        Source.saveDraft();
        App.showToast('AI 草稿已生成');
      }
    },

    buildSelectedSourcePrompt: function() {
      var repo = Source.getSourceRepo();
      var parts = [];
      var allowed = [];

      if (Source.sendFiles.html && repo.html) {
        parts.push('[index.html]\n' + repo.html);
        allowed.push('html');
      }
      if (Source.sendFiles.css && repo.css) {
        parts.push('[style.css]\n' + repo.css);
        allowed.push('css');
      }
      if (Source.sendFiles.js && repo.js) {
        parts.push('[script.js]\n' + repo.js);
        allowed.push('js');
      }

      if (!parts.length) return '';

      return '\n\n=== 以下是允许修改的源码文件 ===\n' +
        parts.join('\n\n') +
        '\n\n你只能修改这些被发送的文件：' + allowed.join(', ') + '。\n' +
        '没有被发送的文件，你绝对不能返回对应的 source 代码块。\n' +
        '如果用户只发送了 html 和 css，你绝对不能返回 source-js。\n' +
        '如果用户只发送了 js，你绝对不能返回 source-html 或 source-css。\n' +
        '请优先返回以下格式：\n' +
        (Source.sendFiles.html ? '```source-html\n完整 index.html\n```\n' : '') +
        (Source.sendFiles.css ? '```source-css\n完整 style.css\n```\n' : '') +
        (Source.sendFiles.js ? '```source-js\n完整 script.js\n```\n' : '');
    },

    cleanReplyForDisplay: function(reply) {
      var cleaned = reply
        .replace(/```source-html\n?[\s\S]*?```/g, '[AI 提交了 index.html 草稿]')
        .replace(/```source-css\n?[\s\S]*?```/g, '[AI 提交了 style.css 草稿]')
        .replace(/```source-js\n?[\s\S]*?```/g, '[AI 提交了 script.js 草稿]');

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
      if (!Source.aiDraft.hasHtml && !Source.aiDraft.hasCss && !Source.aiDraft.hasJs) {
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

      if (Source.aiDraft.hasJs) {
        App.showToast('JS 草稿暂不自动预览');
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
      if (!Source.aiDraft.hasHtml && !Source.aiDraft.hasCss && !Source.aiDraft.hasJs) {
        App.showToast('暂无可保存的草稿');
        return;
      }

      if (Source.aiDraft.hasHtml) Source.updateSourceRepoFile('html', Source.aiDraft.html);
      if (Source.aiDraft.hasCss) Source.updateSourceRepoFile('css', Source.aiDraft.css);
      if (Source.aiDraft.hasJs) Source.updateSourceRepoFile('js', Source.aiDraft.js);

      Source.clearDraft();
      App.showToast('已保存 AI 修改');
    },

    discardDraftAll: function() {
      Source.discardDraftPreview();
      Source.clearDraft();
      App.showToast('已丢弃 AI 修改');
    },

    bindEvents: function() {
      App.safeOn('#sendHtmlToAI', 'change', function() {
        Source.saveSendFiles();
        App.showToast(this.checked ? '已勾选 index.html' : '已取消 index.html');
      });

      App.safeOn('#sendCssToAI', 'change', function() {
        Source.saveSendFiles();
        App.showToast(this.checked ? '已勾选 style.css' : '已取消 style.css');
      });

      App.safeOn('#sendJsToAI', 'change', function() {
        Source.saveSendFiles();
        App.showToast(this.checked ? '已勾选 script.js' : '已取消 script.js');
      });

      App.safeOn('#copySourceHtml', 'click', function() { Source.copySourceField('html'); });
      App.safeOn('#saveSourceHtml', 'click', function() { Source.saveSourceField('html'); });
      App.safeOn('#clearSourceHtml', 'click', function() { Source.clearSourceField('html'); });

      App.safeOn('#copySourceCss', 'click', function() { Source.copySourceField('css'); });
      App.safeOn('#saveSourceCss', 'click', function() { Source.saveSourceField('css'); });
      App.safeOn('#clearSourceCss', 'click', function() { Source.clearSourceField('css'); });

      App.safeOn('#copySourceJs', 'click', function() { Source.copySourceField('js'); });
      App.safeOn('#saveSourceJs', 'click', function() { Source.saveSourceField('js'); });
      App.safeOn('#clearSourceJs', 'click', function() { Source.clearSourceField('js'); });

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

    init: function() {
      Source.sendFiles = App.LS.get('sendFiles') || {
        html: false,
        css: false,
        js: false
      };

      Source.aiDraft = App.LS.get('aiDraft') || {
        html: '',
        css: '',
        js: '',
        hasHtml: false,
        hasCss: false,
        hasJs: false
      };

      App.source = Source;
      Source.restoreSourceRepo();
      Source.updateDraftStatus();
      Source.bindEvents();
    }
  };

  App.register('source', Source);
})();
