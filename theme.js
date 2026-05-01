(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  /* ★ 只要改这里的颜色，全站立刻生效，绝对不理会任何缓存 */
  var DEFAULT_VARS = {
    '--bg-primary': '#ffffff',      /* 网页背景底色（你刚才说要的白色） */
    '--bg-card': '#ffffff',         /* 卡片和弹窗底色 */
    '--accent': '#adcdea',          /* 强调色（蓝色） */
    '--text-primary': '#1a1a1a',    /* 主要文字颜色 */
    '--text-muted': '#999999',      /* 提示文字颜色 */
    '--border': '#1a1a1a',          /* 边框颜色 */
    '--shadow': 'rgba(0, 0, 0, 0.06)' /* 阴影颜色 */
  };

  var Theme = {
    applyVars: function(vars) {
      if (!vars) return;
      Object.keys(vars).forEach(function(k) {
        document.documentElement.style.setProperty(k, vars[k]);
      });
    },

    init: function() {
      // 没有任何 App.LS.get，没有任何废话，直接注入 DEFAULT_VARS！
      Theme.applyVars(DEFAULT_VARS);
    }
  };

  App.theme = Theme;
  App.register('theme', Theme);
})();