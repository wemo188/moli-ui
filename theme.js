
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var FROST = {
    name: '霜蓝',
    desc: '清透冰蓝 · 默认主题',
    colors: {
      bg: '#f4f7fb',
      card: '#ffffff',
      accent: '#cadff2',
      accentDeep: '#88abda',
      text: '#2e4258',
      border: '#cadff2'
    }
  };

  var Theme = {
    builtIn: [FROST],
    customThemes: [],
    currentName: '',

    load: function() {
      Theme.customThemes = App.LS.get('customThemes') || [];
      Theme.currentName = App.LS.get('currentTheme') || FROST.name;
    },

    save: function() {
      App.LS.set('customThemes', Theme.customThemes);
      App.LS.set('currentTheme', Theme.currentName);
    },

    apply: function(colors) {
      var r = document.documentElement.style;
      r.setProperty('--bg-primary', colors.bg);
      r.setProperty('--bg-secondary', colors.card);
      r.setProperty('--bg-card', colors.card);
      r.setProperty('--accent', colors.accent);
      r.setProperty('--accent-deep', colors.accentDeep);
      r.setProperty('--text-primary', colors.text);
      r.setProperty('--text-secondary', Theme.mix(colors.text, colors.bg, 0.6));
      r.setProperty('--text-muted', Theme.mix(colors.text, colors.bg, 0.35));
      r.setProperty('--border', Theme.hexToRgba(colors.border, 0.55));
      r.setProperty('--border-light', Theme.hexToRgba(colors.border, 0.25));
      r.setProperty('--shadow', Theme.hexToRgba(colors.text, 0.06));
    },

    applyByName: function(name) {
      var theme = Theme.findTheme(name);
      if (!theme) theme = FROST;
      Theme.currentName = theme.name;
      Theme.apply(theme.colors);
      Theme.save();
    },

    findTheme: function(name) {
      var i;
      for (i = 0; i < Theme.builtIn.length; i++) {
        if (Theme.builtIn[i].name === name) return Theme.builtIn[i];
      }
      for (i = 0; i < Theme.customThemes.length; i++) {
        if (Theme.customThemes[i].name === name) return Theme.customThemes[i];
      }
      return null;
    },

    hexToRgba: function(hex, alpha) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      var r = parseInt(hex.substr(0, 2), 16);
      var g = parseInt(hex.substr(2, 2), 16);
      var b = parseInt(hex.substr(4, 2), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    },

    mix: function(c1, c2, weight) {
      c1 = c1.replace('#', '');
      c2 = c2.replace('#', '');
      if (c1.length === 3) c1 = c1[0] + c1[0] + c1[1] + c1[1] + c1[2] + c1[2];
      if (c2.length === 3) c2 = c2[0] + c2[0] + c2[1] + c2[1] + c2[2] + c2[2];
      var r = Math.round(parseInt(c1.substr(0, 2), 16) * weight + parseInt(c2.substr(0, 2), 16) * (1 - weight));
      var g = Math.round(parseInt(c1.substr(2, 2), 16) * weight + parseInt(c2.substr(2, 2), 16) * (1 - weight));
      var b = Math.round(parseInt(c1.substr(4, 2), 16) * weight + parseInt(c2.substr(4, 2), 16) * (1 - weight));
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    renderPanel: function() {
      var list = App.$('#themeList');
      var customList = App.$('#customThemeList');
      if (!list || !customList) return;

      list.innerHTML = Theme.builtIn.map(function(t) {
        var c = t.colors;
        var isActive = Theme.currentName === t.name;
        return '<div class="theme-card' + (isActive ? ' active' : '') + '" data-name="' + App.esc(t.name) + '">' +
          '<div class="theme-card-colors">' +
            '<div class="theme-color-dot" style="background:' + c.bg + '"></div>' +
            '<div class="theme-color-dot" style="background:' + c.card + '"></div>' +
            '<div class="theme-color-dot" style="background:' + c.accent + '"></div>' +
            '<div class="theme-color-dot" style="background:' + c.accentDeep + '"></div>' +
            '<div class="theme-color-dot" style="background:' + c.text + '"></div>' +
            '<div class="theme-color-dot" style="background:' + c.border + '"></div>' +
          '</div>' +
          '<div class="theme-card-name">' + App.esc(t.name) + '</div>' +
          '<div class="theme-card-desc">' + App.esc(t.desc) + '</div>' +
        '</div>';
      }).join('');

      if (!Theme.customThemes.length) {
        customList.innerHTML = '';
      } else {
        customList.innerHTML = Theme.customThemes.map(function(t) {
          var c = t.colors;
          var isActive = Theme.currentName === t.name;
          return '<div class="theme-card' + (isActive ? ' active' : '') + '" data-name="' + App.esc(t.name) + '">' +
            '<div class="theme-card-colors">' +
              '<div class="theme-color-dot" style="background:' + c.bg + '"></div>' +
              '<div class="theme-color-dot" style="background:' + c.card + '"></div>' +
              '<div class="theme-color-dot" style="background:' + c.accent + '"></div>' +
              '<div class="theme-color-dot" style="background:' + c.accentDeep + '"></div>' +
              '<div class="theme-color-dot" style="background:' + c.text + '"></div>' +
              '<div class="theme-color-dot" style="background:' + c.border + '"></div>' +
            '</div>' +
            '<div class="theme-card-name">' + App.esc(t.name) + '</div>' +
            '<div class="theme-card-desc">' + App.esc(t.desc || '自定义主题') + '</div>' +
            '<button class="theme-card-del" data-del="' + App.esc(t.name) + '" type="button">×</button>' +
          '</div>';
        }).join('');
      }

      Theme.syncPickers();
      Theme.bindPanelEvents();
    },

    syncPickers: function() {
      var current = Theme.findTheme(Theme.currentName);
      if (!current) current = FROST;
      var c = current.colors;
      if (App.$('#colorBg')) App.$('#colorBg').value = c.bg;
      if (App.$('#colorCard')) App.$('#colorCard').value = c.card;
      if (App.$('#colorAccent')) App.$('#colorAccent').value = c.accent;
      if (App.$('#colorAccentDeep')) App.$('#colorAccentDeep').value = c.accentDeep;
      if (App.$('#colorText')) App.$('#colorText').value = c.text;
      if (App.$('#colorBorder')) App.$('#colorBorder').value = c.border;
    },

    getPickerColors: function() {
      return {
        bg: (App.$('#colorBg') || {}).value || FROST.colors.bg,
        card: (App.$('#colorCard') || {}).value || FROST.colors.card,
        accent: (App.$('#colorAccent') || {}).value || FROST.colors.accent,
        accentDeep: (App.$('#colorAccentDeep') || {}).value || FROST.colors.accentDeep,
        text: (App.$('#colorText') || {}).value || FROST.colors.text,
        border: (App.$('#colorBorder') || {}).value || FROST.colors.border
      };
    },

    bindPanelEvents: function() {
      App.$$('#themeList .theme-card, #customThemeList .theme-card').forEach(function(card) {
        card.addEventListener('click', function(e) {
          if (e.target.closest('.theme-card-del')) return;
          var name = card.dataset.name;
          Theme.applyByName(name);
          Theme.renderPanel();
          App.showToast('已切换: ' + name);
        });
      });

      App.$$('#customThemeList .theme-card-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var name = btn.dataset.del;
          Theme.customThemes = Theme.customThemes.filter(function(t) { return t.name !== name; });
          if (Theme.currentName === name) {
            Theme.applyByName(FROST.name);
          }
          Theme.save();
          Theme.renderPanel();
          App.showToast('已删除: ' + name);
        });
      });
    },

    bindGlobalEvents: function() {
      App.safeOn('#applyCustomColors', 'click', function() {
        var colors = Theme.getPickerColors();
        Theme.apply(colors);
        App.showToast('颜色已预览');
      });

      App.safeOn('#saveCustomTheme', 'click', function() {
        var nameInput = App.$('#customThemeName');
        var name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
          App.showToast('请输入主题名称');
          return;
        }

        for (var i = 0; i < Theme.builtIn.length; i++) {
          if (Theme.builtIn[i].name === name) {
            App.showToast('不能使用内置主题名称');
            return;
          }
        }

        var colors = Theme.getPickerColors();
        var existing = -1;
        for (var j = 0; j < Theme.customThemes.length; j++) {
          if (Theme.customThemes[j].name === name) { existing = j; break; }
        }

        var themeObj = { name: name, desc: '自定义主题', colors: colors };
        if (existing >= 0) {
          Theme.customThemes[existing] = themeObj;
        } else {
          Theme.customThemes.push(themeObj);
        }

        Theme.currentName = name;
        Theme.apply(colors);
        Theme.save();
        Theme.renderPanel();
        if (nameInput) nameInput.value = '';
        App.showToast('主题已保存: ' + name);
      });

      App.safeOn('#resetTheme', 'click', function() {
        Theme.applyByName(FROST.name);
        Theme.renderPanel();
        App.showToast('已恢复默认主题');
      });

      ['colorBg', 'colorCard', 'colorAccent', 'colorAccentDeep', 'colorText', 'colorBorder'].forEach(function(id) {
        App.safeOn('#' + id, 'input', function() {
          Theme.apply(Theme.getPickerColors());
        });
      });
    },

    init: function() {
      Theme.load();
      Theme.applyByName(Theme.currentName);
      Theme.bindGlobalEvents();

      var observer = new MutationObserver(function() {
        var panel = App.$('#themePanel');
        if (panel && panel.classList.contains('show') && !panel.dataset.rendered) {
          panel.dataset.rendered = '1';
          Theme.renderPanel();
        }
        if (panel && panel.classList.contains('hidden')) {
          panel.dataset.rendered = '';
        }
      });
      observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

      App.theme = Theme;
    }
  };

  App.register('theme', Theme);
})();
