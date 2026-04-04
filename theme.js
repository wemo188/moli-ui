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
        id: 'frost-gray',
        name: '灰白磨砂',
        desc: '柔和磨砂质感',
        vars: {
          '--bg-primary': '#f2f2f7',
          '--bg-secondary': '#e5e5ea',
          '--bg-card': '#ffffff',
          '--accent': '#636366',
          '--accent-deep': '#48484a',
          '--text-primary': '#1c1c1e',
          '--text-secondary': '#3a3a3c',
          '--text-muted': '#aeaeb2',
          '--border': 'rgba(60, 60, 67, 0.29)',
          '--border-light': 'rgba(60, 60, 67, 0.08)',
          '--shadow': 'rgba(0, 0, 0, 0.04)'
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
          '--text-secondary': '#555555',
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

      // 如果之前选的是被删掉的主题，回退到蓝白
      if (!Theme.findThemeById(Theme.currentThemeId)) {
        Theme.currentThemeId = 'blue-white';
        App.LS.set('currentThemeId', 'blue-white');
      }

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
