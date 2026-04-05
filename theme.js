(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var Theme = {
    PRESET_THEMES: [
      {
        id: 'blue-white',
        name: '蓝白',
        desc: '清爽蓝白',
        vars: {
          '--bg-primary': '#f0f6fb',
          '--bg-secondary': '#ffffff',
          '--bg-card': '#ffffff',
          '--accent': '#adcdea',
          '--accent-deep': '#8ab8de',
          '--text-primary': '#1a1a1a',
          '--text-secondary': '#555555',
          '--text-muted': '#999999',
          '--border': '#1a1a1a',
          '--border-light': 'rgba(173, 205, 234, 0.3)',
          '--shadow': 'rgba(0, 0, 0, 0.06)'
        }
      },
      {
        id: 'dark',
        name: '暗夜',
        desc: '深色护眼',
        vars: {
          '--bg-primary': '#0f1114',
          '--bg-secondary': '#1a1d22',
          '--bg-card': '#22262d',
          '--accent': '#5b9bd5',
          '--accent-deep': '#3a7cc2',
          '--text-primary': '#e0e4ea',
          '--text-secondary': '#8e95a3',
          '--text-muted': '#555d6b',
          '--border': '#2e333b',
          '--border-light': 'rgba(91,155,213,0.15)',
          '--shadow': 'rgba(0,0,0,0.3)'
        }
      },
      {
        id: 'sakura',
        name: '樱花',
        desc: '柔和粉白',
        vars: {
          '--bg-primary': '#fdf2f4',
          '--bg-secondary': '#ffffff',
          '--bg-card': '#ffffff',
          '--accent': '#e8a0b4',
          '--accent-deep': '#d4819a',
          '--text-primary': '#2d1f24',
          '--text-secondary': '#7a5a63',
          '--text-muted': '#b09098',
          '--border': '#2d1f24',
          '--border-light': 'rgba(232,160,180,0.3)',
          '--shadow': 'rgba(232,160,180,0.12)'
        }
      },
      {
        id: 'midnight',
        name: '午夜蓝',
        desc: '深蓝沉稳',
        vars: {
          '--bg-primary': '#0c1525',
          '--bg-secondary': '#111d32',
          '--bg-card': '#172740',
          '--accent': '#adcdea',
          '--accent-deep': '#8ab8de',
          '--text-primary': '#dbe8ff',
          '--text-secondary': '#7a9ab5',
          '--text-muted': '#4a6680',
          '--border': '#223550',
          '--border-light': 'rgba(173,205,234,0.15)',
          '--shadow': 'rgba(0,0,0,0.3)'
        }
      },
      {
        id: 'mono-blueblack',
        name: '机能蓝黑',
        desc: '蓝主黑边',
        vars: {
          '--bg-primary': '#252629',
          '--bg-secondary': '#2c3138',
          '--bg-card': 'rgba(87, 101, 138, 0.18)',
          '--accent': '#57658a',
          '--accent-deep': '#6f7da5',
          '--text-primary': '#edf3ff',
          '--text-secondary': '#aab6d1',
          '--text-muted': '#7d8aaa',
          '--border': '#111111',
          '--border-light': 'rgba(87,101,138,0.28)',
          '--shadow': 'rgba(0,0,0,0.35)'
        }
      }
    ],

    customThemes: [],
    currentThemeId: 'blue-white',

    applyThemeVars: function(vars) {
      if (!vars) return;
      Object.keys(vars).forEach(function(k) {
        document.documentElement.style.setProperty(k, vars[k]);
      });
    },

    findThemeById: function(id) {
      for (var i = 0; i < Theme.PRESET_THEMES.length; i++) {
        if (Theme.PRESET_THEMES[i].id === id) return Theme.PRESET_THEMES[i];
      }
      for (var j = 0; j < Theme.customThemes.length; j++) {
        if (Theme.customThemes[j].id === id) return Theme.customThemes[j];
      }
      return null;
    },

    updateColorInputs: function(vars) {
      var map = {
        colorBg: '--bg-primary',
        colorCard: '--bg-card',
        colorAccent: '--accent',
        colorAccentDeep: '--accent-deep',
        colorText: '--text-primary',
        colorBorder: '--border'
      };
      Object.keys(map).forEach(function(id) {
        var el = App.$('#' + id);
        var val = vars[map[id]];
        if (el && val && val.indexOf('#') === 0) el.value = val;
      });
    },

    selectTheme: function(id) {
      var theme = Theme.findThemeById(id);
      if (!theme) return;
      Theme.currentThemeId = id;
      App.LS.set('currentThemeId', id);
      Theme.applyThemeVars(theme.vars);
      App.LS.set('themeVars', theme.vars);
      Theme.updateColorInputs(theme.vars);
      Theme.renderThemeList();
      App.showToast('已切换: ' + theme.name);
    },

    renderThemeList: function() {
      var c = App.$('#themeList');
      if (!c) return;

      c.innerHTML = Theme.PRESET_THEMES.map(function(t) {
        var dots = '';
        var colors = [t.vars['--bg-primary'], t.vars['--accent'], t.vars['--text-primary'], t.vars['--border']];
        for (var i = 0; i < colors.length; i++) {
          dots += '<div class="theme-color-dot" style="background:' + colors[i] + '"></div>';
        }
        return '<div class="theme-card' + (Theme.currentThemeId === t.id ? ' active' : '') + '" data-theme="' + t.id + '">' +
          '<div class="theme-card-colors">' + dots + '</div>' +
          '<div class="theme-card-name">' + App.esc(t.name) + '</div>' +
          '<div class="theme-card-desc">' + App.esc(t.desc) + '</div>' +
        '</div>';
      }).join('');

      c.querySelectorAll('.theme-card').forEach(function(card) {
        card.addEventListener('click', function() {
          Theme.selectTheme(card.dataset.theme);
        });
      });

      Theme.renderCustomThemeList();
    },

    renderCustomThemeList: function() {
      var c = App.$('#customThemeList');
      if (!c) return;

      if (!Theme.customThemes.length) {
        c.innerHTML = '<p style="font-size:12px;color:var(--text-muted);padding:8px 0;">暂无自定义主题</p>';
        return;
      }

      c.innerHTML = Theme.customThemes.map(function(t, idx) {
        var dots = '';
        var colors = [t.vars['--bg-primary'], t.vars['--accent'], t.vars['--text-primary'], t.vars['--border']];
        for (var i = 0; i < colors.length; i++) {
          dots += '<div class="theme-color-dot" style="background:' + colors[i] + '"></div>';
        }
        return '<div class="theme-card' + (Theme.currentThemeId === t.id ? ' active' : '') + '" data-theme="' + t.id + '">' +
          '<button class="theme-card-del" onclick="event.stopPropagation();window._delTheme(' + idx + ')" type="button">x</button>' +
          '<div class="theme-card-colors">' + dots + '</div>' +
          '<div class="theme-card-name">' + App.esc(t.name) + '</div>' +
          '<div class="theme-card-desc">' + App.esc(t.desc || '自定义') + '</div>' +
        '</div>';
      }).join('');

      c.querySelectorAll('.theme-card').forEach(function(card) {
        card.addEventListener('click', function() {
          Theme.selectTheme(card.dataset.theme);
        });
      });
    },

    bindEvents: function() {
      window._delTheme = function(idx) {
        var removed = Theme.customThemes.splice(idx, 1)[0];
        App.LS.set('customThemes', Theme.customThemes);
        if (removed && Theme.currentThemeId === removed.id) Theme.selectTheme('blue-white');
        Theme.renderThemeList();
        App.showToast('已删除: ' + (removed ? removed.name : '主题'));
      };

      App.safeOn('#applyCustomColors', 'click', function() {
        var vars = {
          '--bg-primary': App.$('#colorBg').value,
          '--bg-secondary': App.$('#colorCard').value,
          '--bg-card': App.$('#colorCard').value,
          '--accent': App.$('#colorAccent').value,
          '--accent-deep': App.$('#colorAccentDeep').value,
          '--text-primary': App.$('#colorText').value,
          '--border': App.$('#colorBorder').value
        };
        Theme.applyThemeVars(vars);
        App.LS.set('themeVars', vars);
        Theme.currentThemeId = 'custom-temp';
        App.LS.set('currentThemeId', 'custom-temp');
        Theme.renderThemeList();
        App.showToast('配色已应用');
      });

      App.safeOn('#saveCustomTheme', 'click', function() {
        var name = App.$('#customThemeName') ? App.$('#customThemeName').value.trim() : '';
        if (!name) {
          App.showToast('请输入主题名称');
          return;
        }

        var vars = {
          '--bg-primary': App.$('#colorBg').value,
          '--bg-secondary': App.$('#colorCard').value,
          '--bg-card': App.$('#colorCard').value,
          '--accent': App.$('#colorAccent').value,
          '--accent-deep': App.$('#colorAccentDeep').value,
          '--text-primary': App.$('#colorText').value,
          '--text-secondary': App.$('#colorText').value === '#1a1a1a' ? '#555555' : '#8e95a3',
          '--text-muted': '#999999',
          '--border': App.$('#colorBorder').value,
          '--border-light': 'rgba(173, 205, 234, 0.3)',
          '--shadow': 'rgba(0, 0, 0, 0.06)'
        };

        var id = 'custom-' + Date.now();
        Theme.customThemes.push({
          id: id,
          name: name,
          desc: '自定义',
          vars: vars
        });

        App.LS.set('customThemes', Theme.customThemes);
        Theme.currentThemeId = id;
        App.LS.set('currentThemeId', id);
        App.LS.set('themeVars', vars);
        Theme.applyThemeVars(vars);
        if (App.$('#customThemeName')) App.$('#customThemeName').value = '';
        Theme.renderThemeList();
        App.showToast('主题已保存');
      });

      App.safeOn('#resetTheme', 'click', function() {
        Theme.selectTheme('blue-white');
        App.showToast('已恢复默认主题');
      });
    },

    init: function() {
      Theme.customThemes = App.LS.get('customThemes') || [];
      Theme.currentThemeId = App.LS.get('currentThemeId') || 'blue-white';

      Theme.renderThemeList();
      var savedThemeVars = App.LS.get('themeVars');
      if (savedThemeVars) {
        Theme.applyThemeVars(savedThemeVars);
        Theme.updateColorInputs(savedThemeVars);
      } else {
        Theme.selectTheme(Theme.currentThemeId);
      }

      Theme.bindEvents();
    }
  };

  App.register('theme', Theme);
})();