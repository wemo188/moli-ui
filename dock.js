(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Dock = {
    init: function() {
      App.safeOn('#dockMine', 'click', function() {
        if (App.user && App.user.open) {
          App.user.open();
        } else {
          App.showToast('用户模块加载中...');
        }
      });

      App.safeOn('#dockLong', 'click', function() {
        if (App.character && App.character.open) {
          App.character.open();
        } else {
          App.showToast('角色模块加载中...');
        }
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