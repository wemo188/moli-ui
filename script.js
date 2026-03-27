(function() {
  'use strict';

  var App = window.App = window.App || {};

  App.$ = function(s) { return document.querySelector(s); };
  App.$$ = function(s) { return document.querySelectorAll(s); };

  App.LS = {
    get: function(k) {
      try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; }
    },
    set: function(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
    },
    remove: function(k) {
      localStorage.removeItem(k);
    }
  };

  App.showToast = function(msg, duration) {
    duration = duration || 2000;
    var t = App.$('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    requestAnimationFrame(function() { t.classList.add('show'); });
    clearTimeout(t._timer);
    t._timer = setTimeout(function() {
      t.classList.remove('show');
      setTimeout(function() { t.classList.add('hidden'); }, 300);
    }, duration);
  };

  App.esc = function(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  };

  App.safeOn = function(selector, event, fn) {
    var el = typeof selector === 'string' ? App.$(selector) : selector;
    if (el) el.addEventListener(event, fn);
  };

  App.copyText = function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };

  App.state = {
    ball: null,
    ballMenuEl: null,
    overlay: null,
    chatMessages: null,
    chatInput: null,
    currentPanelEl: null,
    menuOpen: false,
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    lastToggleTime: 0,
    currentAbortController: null
  };

  App.modules = App.modules || {};

  App.register = function(name, mod) {
    App.modules[name] = mod;
  };

  App.getBallRect = function() {
    return App.state.ball.getBoundingClientRect();
  };

  App.positionMenu = function() {
    var rect = App.getBallRect();
    var menu = App.state.ballMenuEl;
    menu.style.bottom = (window.innerHeight - rect.top + 8) + 'px';

    if (rect.left + rect.width / 2 < window.innerWidth / 2) {
      menu.style.left = rect.left + 'px';
      menu.style.right = 'auto';
    } else {
      menu.style.right = (window.innerWidth - rect.right) + 'px';
      menu.style.left = 'auto';
    }
  };

  App.openMenu = function() {
    App.state.menuOpen = true;
    App.state.ball.classList.add('active');
    App.positionMenu();
    App.state.ballMenuEl.classList.remove('hidden');
    requestAnimationFrame(function() {
      App.state.ballMenuEl.classList.add('show');
    });
  };

  App.closeMenu = function() {
    if (!App.state.menuOpen) return;
    App.state.menuOpen = false;
    App.state.ball.classList.remove('active');
    App.state.ballMenuEl.classList.remove('show');
    setTimeout(function() {
      App.state.ballMenuEl.classList.add('hidden');
    }, 250);
  };

  App.toggleMenu = function() {
    var now = Date.now();
    if (now - App.state.lastToggleTime < 250) return;
    App.state.lastToggleTime = now;
    if (App.state.menuOpen) App.closeMenu();
    else App.openMenu();
  };

  App.openPanel = function(id) {
    App.closeMenu();

    if (App.state.currentPanelEl && App.state.currentPanelEl.id !== id) {
      App.state.currentPanelEl.classList.remove('show');
      App.state.currentPanelEl.classList.add('hidden');
    }

    App.state.currentPanelEl = App.$('#' + id);
    if (!App.state.currentPanelEl) return;

    App.state.overlay.classList.remove('hidden');
    App.state.currentPanelEl.classList.remove('hidden');

    requestAnimationFrame(function() {
      App.state.overlay.classList.add('show');
      App.state.currentPanelEl.classList.add('show');
    });
  };

  App.closePanel = function() {
    if (!App.state.currentPanelEl) return;
    App.state.overlay.classList.remove('show');
    App.state.currentPanelEl.classList.remove('show');

    var p = App.state.currentPanelEl;
    setTimeout(function() {
      App.state.overlay.classList.add('hidden');
      p.classList.add('hidden');
    }, 350);

    App.state.currentPanelEl = null;
  };

  App.initFloatingBall = function() {
    var ball = App.state.ball;
    if (!ball) return;

    ball.addEventListener('touchstart', function(e) {
      var t = e.touches[0];
      var rect = App.getBallRect();
      App.state.startX = t.clientX;
      App.state.startY = t.clientY;
      App.state.origX = rect.left;
      App.state.origY = rect.top;
      App.state.isDragging = true;
      App.state.hasMoved = false;
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (!App.state.isDragging) return;
      var t = e.touches[0];
      var dx = t.clientX - App.state.startX;
      var dy = t.clientY - App.state.startY;

      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) App.state.hasMoved = true;
      if (!App.state.hasMoved) return;

      var nx = Math.max(0, Math.min(window.innerWidth - 52, App.state.origX + dx));
      var ny = Math.max(0, Math.min(window.innerHeight - 52, App.state.origY + dy));

      ball.style.left = nx + 'px';
      ball.style.top = ny + 'px';
      ball.style.right = 'auto';
      ball.style.bottom = 'auto';
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      if (!App.state.isDragging) return;
      if (!App.state.hasMoved) {
        e.preventDefault();
        App.toggleMenu();
      } else {
        var rect = App.getBallRect();
        App.LS.set('floatingBallPos', {
          left: rect.left,
          top: rect.top
        });
      }
      App.state.isDragging = false;
      App.state.hasMoved = false;
    }, { passive: false });

    ball.addEventListener('click', function(e) {
      e.preventDefault();
      if ('ontouchstart' in window) return;
      App.toggleMenu();
    });

    App.$$('.ball-menu-item').forEach(function(item) {
      item.addEventListener('click', function() {
        App.openPanel(item.dataset.panel);
      });
    });

    App.$$('.panel-close').forEach(function(btn) {
      btn.addEventListener('click', function() {
        App.closePanel();
      });
    });

    App.state.overlay.addEventListener('click', function() {
      App.closePanel();
    });

    var savedBallPos = App.LS.get('floatingBallPos');
    if (savedBallPos) {
      ball.style.left = savedBallPos.left + 'px';
      ball.style.top = savedBallPos.top + 'px';
      ball.style.right = 'auto';
      ball.style.bottom = 'auto';
    }
  };

  App.runInits = function() {
    Object.keys(App.modules).forEach(function(name) {
      var mod = App.modules[name];
      if (mod && typeof mod.init === 'function') {
        mod.init();
      }
    });
  };

  App.init = function() {
    App.state.ball = App.$('#floatingBall');
    App.state.ballMenuEl = App.$('#ballMenu');
    App.state.overlay = App.$('#overlay');
    App.state.chatMessages = App.$('#chatMessages');
    App.state.chatInput = App.$('#chatInput');

    if (!App.state.ball || !App.state.ballMenuEl || !App.state.overlay) {
      alert('页面缺少核心元素：floatingBall / ballMenu / overlay');
      return;
    }

    App.initFloatingBall();
    App.runInits();
  };

  setTimeout(function() {
    App.init();
  }, 80);
})();
