(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Dock = {
    init: function() {
      App.safeOn('#dockLong', 'click', function() {
        if (App.character && App.character.open) {
          App.character.open();
        }
      });

            App.safeOn('#dockShort', 'click', function() {
        if (App.wechat && App.wechat.open) {
          App.wechat.open();
        }
      });

      App.safeOn('#dockCheck', 'click', function() {
        App.showToast('查岗 - 开发中');
      });
    }
  };

  App.register('dock', Dock);
})();