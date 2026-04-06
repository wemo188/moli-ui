(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Dock = {

    init: function() {
      App.safeOn('#dockMine', 'click', function() {
        App.showToast('我的 - 开发中');
      });

      App.safeOn('#dockLong', 'click', function() {
        App.showToast('长剧情 - 开发中');
      });

      App.safeOn('#dockShort', 'click', function() {
        App.showToast('短对话 - 开发中');
      });

      App.safeOn('#dockCheck', 'click', function() {
        App.showToast('查岗 - 开发中');
      });
    }
  };

  App.register('dock', Dock);
})();
