(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Dock = {
    init: function() {
      // dockMine 由 user.js (Social) 绑定
      App.safeOn('#dockLong', 'click', function() {
        App.showToast('长剧情 · 开发中');
      });

      App.safeOn('#dockShort', 'click', function() {
        App.showToast('短对话 · 开发中');
      });

      App.safeOn('#dockCheck', 'click', function() {
        App.showToast('角色 · 开发中');
      });
    }
  };

  App.register('dock', Dock);
})();