
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

var DEFAULT_VARS = {
  '--bg-primary': '#f0f6fb',
  '--bg-card': '#ffffff',
  '--accent': '#adcdea',
  '--text-primary': '#1a1a1a',
  '--text-muted': '#999999',
  '--border': '#1a1a1a',
  '--shadow': 'rgba(0, 0, 0, 0.06)'
};

  var Theme = {
    applyVars: function(vars) {
      if (!vars) return;
      Object.keys(vars).forEach(function(k) {
        document.documentElement.style.setProperty(k, vars[k]);
      });
    },

    init: function() {
      var saved = App.LS.get('themeVars');
      Theme.applyVars(saved || DEFAULT_VARS);
    }
  };

  App.theme = Theme;
  App.register('theme', Theme);
})();
