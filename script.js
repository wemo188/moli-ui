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
    currentPanelEl: null,
    menuOpen: false,
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    lastToggleTime: 0
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
    if (!id) return;
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
      var nx = Math.max(0, Math.min(window.innerWidth - 200, App.state.origX + dx));
      var ny = Math.max(0, Math.min(window.innerHeight - 200, App.state.origY + dy));
      ball.style.left = nx + 'px';
      ball.style.top = ny + 'px';
      ball.style.right = 'auto';
      ball.style.bottom = 'auto';
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      if (!App.state.isDragging) return;
      if (!App.state.hasMoved) {
        e.preventDefault();
        if (App.mascot && typeof App.mascot.onTap === 'function') {
          App.mascot.onTap();
        }
        App.toggleMenu();
      } else {
        var rect = App.getBallRect();
        App.LS.set('floatingBallPos', { left: rect.left, top: rect.top });
      }
      App.state.isDragging = false;
      App.state.hasMoved = false;
    }, { passive: false });

    ball.addEventListener('click', function(e) {
      e.preventDefault();
      if (App.mascot && typeof App.mascot.onTap === 'function') {
        App.mascot.onTap();
      }
      if ('ontouchstart' in window) return;
      App.toggleMenu();
    });

    App.$$('.ball-menu-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var panelId = item.dataset.panel;
        if (panelId) {
          App.openPanel(panelId);
        }
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

    App.safeOn('#clearAllBtn', 'click', function() {
      if (!confirm('确定要重置所有设置吗？')) return;
      localStorage.clear();
      location.reload();
    });

    var savedBallPos = App.LS.get('floatingBallPos');
    if (savedBallPos) {
      ball.style.left = savedBallPos.left + 'px';
      ball.style.top = savedBallPos.top + 'px';
      ball.style.right = 'auto';
      ball.style.bottom = 'auto';
    }

    // ========= 小公仔动画 =========
    App.mascot = {
      img: App.$('#mascotImg'),
      sprites: {
        idle:     'https://iili.io/qZ5NWvf.png',
        blink:    'https://iili.io/qZDVJbs.md.png',
        wave:     'https://iili.io/qZDtY6x.md.png',
        tiltA:    'https://iili.io/qZbJDCP.md.png',
        tiltB:    'https://iili.io/qZbBqba.md.png',
        surprise: 'https://iili.io/qZbIihX.md.png',
        happy:    'https://iili.io/qZb5EJf.md.png'
      },
      currentState: 'idle',
      animLock: false,
      blinkTimer: null,
      idleTimer: null,

      preload: function() {
        var self = this;
        Object.keys(self.sprites).forEach(function(key) {
          var img = new Image();
          img.src = self.sprites[key];
        });
      },
      setSprite: function(key) {
        if (!this.img || !this.sprites[key]) return;
        this.img.src = this.sprites[key];
        this.currentState = key;
      },
      clearAnimClass: function() {
        if (!this.img) return;
        this.img.classList.remove('breathing', 'waving', 'tilting', 'surprised', 'happy');
      },
      goIdle: function() {
        this.setSprite('idle');
        this.clearAnimClass();
        this.img.classList.add('breathing');
        this.animLock = false;
      },
      doBlink: function() {
        var self = this;
        if (self.animLock) return;
        self.setSprite('blink');
        setTimeout(function() {
          if (self.currentState === 'blink') self.setSprite('idle');
        }, 180);
      },
      doAction: function(action) {
        var self = this;
        if (self.animLock) return;
        self.animLock = true;
        self.clearAnimClass();
        switch (action) {
          case 'wave':
            self.setSprite('wave');
            self.img.classList.add('waving');
            setTimeout(function() { self.goIdle(); }, 1200);
            break;
          case 'tilt':
            self.setSprite(Math.random() > 0.5 ? 'tiltA' : 'tiltB');
            self.img.classList.add('tilting');
            setTimeout(function() { self.goIdle(); }, 1600);
            break;
          case 'surprise':
            self.setSprite('surprise');
            self.img.classList.add('surprised');
            setTimeout(function() { self.goIdle(); }, 1200);
            break;
          case 'happy':
            self.setSprite('happy');
            self.img.classList.add('happy');
            setTimeout(function() { self.goIdle(); }, 1400);
            break;
          default:
            self.goIdle();
        }
      },
      startBlinkLoop: function() {
        var self = this;
        function go() {
          self.blinkTimer = setTimeout(function() {
            if (!self.animLock) self.doBlink();
            go();
          }, 2500 + Math.random() * 4000);
        }
        go();
      },
      startIdleActions: function() {
        var self = this;
        var acts = ['wave', 'tilt', 'surprise', 'happy'];
        function go() {
          self.idleTimer = setTimeout(function() {
            if (!self.animLock) {
              self.doAction(acts[Math.floor(Math.random() * acts.length)]);
            }
            go();
          }, 8000 + Math.random() * 15000);
        }
        go();
      },
      onTap: function() {
        var acts = ['wave', 'happy', 'surprise', 'tilt'];
        this.doAction(acts[Math.floor(Math.random() * acts.length)]);
      },
      init: function() {
        if (!this.img) return;
        this.preload();
        this.goIdle();
        this.startBlinkLoop();
        this.startIdleActions();
      }
    };

    App.mascot.init();
    setTimeout(function() {
      if (App.mascot) App.mascot.doAction('wave');
    }, 1000);
  };

  App.runInits = function() {
    Object.keys(App.modules).forEach(function(name) {
      var mod = App.modules[name];
      if (mod && typeof mod.init === 'function') {
        try { mod.init(); } catch (e) {
          console.warn('模块 ' + name + ' 初始化失败:', e);
        }
      }
    });
  };

  App.initMainPages = function() {
    var slider = App.$('#pageSlider');
    var dots = App.$$('.screen-dot');
    var floatingBall = App.$('#floatingBall');

    if (!slider) return;

    var currentPage = 0;
    var totalPages = 2;
    var startX = 0;
    var startY = 0;
    var currentX = 0;
    var baseX = 0;
    var dragging = false;
    var directionLocked = false;
    var isHorizontal = false;
    var pageWidth = window.innerWidth;

    function setBallVisibility() {
      if (!floatingBall) return;
      if (currentPage === 0) {
        floatingBall.classList.remove('page-hidden');
      } else {
        floatingBall.classList.add('page-hidden');
      }
    }

    function updateDots() {
      dots.forEach(function(dot, idx) {
        dot.classList.toggle('active', idx === currentPage);
      });
    }

    function snapToPage(animate) {
      pageWidth = window.innerWidth;
      var targetX = -currentPage * pageWidth;
      if (animate) {
        slider.style.transition = 'transform 0.42s cubic-bezier(0.22, 0.8, 0.2, 1)';
      } else {
        slider.style.transition = 'none';
      }
      slider.style.transform = 'translate3d(' + targetX + 'px,0,0)';
      updateDots();
      setBallVisibility();
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var idx = parseInt(dot.dataset.screen, 10) || 0;
        currentPage = Math.max(0, Math.min(totalPages - 1, idx));
        snapToPage(true);
      });
    });

    slider.addEventListener('touchstart', function(e) {
      if (!e.touches || !e.touches.length) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = startX;
      pageWidth = window.innerWidth;
      baseX = -currentPage * pageWidth;
      dragging = true;
      directionLocked = false;
      isHorizontal = false;
      slider.style.transition = 'none';
    }, { passive: true });

    slider.addEventListener('touchmove', function(e) {
      if (!dragging || !e.touches || !e.touches.length) return;
      currentX = e.touches[0].clientX;
      var currentY = e.touches[0].clientY;
      var dx = Math.abs(currentX - startX);
      var dy = Math.abs(currentY - startY);
      if (!directionLocked && (dx > 8 || dy > 8)) {
        directionLocked = true;
        isHorizontal = dx > dy;
      }
      if (!directionLocked || !isHorizontal) return;
      e.preventDefault();
      var deltaX = currentX - startX;
      var nextX = baseX + deltaX;
      var maxLeft = -(totalPages - 1) * pageWidth;
      if (nextX > 0) nextX = nextX * 0.28;
      if (nextX < maxLeft) nextX = maxLeft + (nextX - maxLeft) * 0.28;
      slider.style.transform = 'translate3d(' + nextX + 'px,0,0)';
    }, { passive: false });

    slider.addEventListener('touchend', function() {
      if (!dragging) return;
      dragging = false;
      if (!isHorizontal) return;
      var deltaX = currentX - startX;
      var threshold = pageWidth * 0.16;
      if (Math.abs(deltaX) > threshold) {
        if (deltaX < 0 && currentPage < totalPages - 1) currentPage += 1;
        else if (deltaX > 0 && currentPage > 0) currentPage -= 1;
      }
      snapToPage(true);
    }, { passive: true });

    window.addEventListener('resize', function() {
    
          // ========= 全屏面板手动划屏返回 =========
    (function() {
      var startX = 0;
      var startY = 0;
      var dragging = false;

      document.addEventListener('touchstart', function(e) {
        var panel = App.$('.fullpage-panel.show');
        if (!panel) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        dragging = true;
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        if (!dragging) return;
        var panel = App.$('.fullpage-panel.show');
        if (!panel) return;

        var currentX = e.touches[0].clientX;
        var currentY = e.touches[0].clientY;
        var dx = currentX - startX;
        var dy = currentY - startY;

        if (Math.abs(dx) > Math.abs(dy) && dx > 30) {
          e.preventDefault();
          var progress = Math.min(dx / window.innerWidth, 1);
          panel.style.transform = 'translateX(' + (progress * 100) + '%)';
          panel.style.opacity = 1 - progress * 0.3;
        }
      }, { passive: false });

      document.addEventListener('touchend', function(e) {
        if (!dragging) return;
        dragging = false;

        var panel = App.$('.fullpage-panel.show');
        if (!panel) return;

        var currentX = e.changedTouches[0].clientX;
        var dx = currentX - startX;

        if (dx > window.innerWidth * 0.2) {
          App.closePanel();
        } else {
          panel.style.transform = 'translateX(0)';
          panel.style.opacity = '1';
        }
      }, { passive: true });
    })();

      snapToPage(false);
    });

    // ========= 图标长按换图 =========
    (function() {
      var grid = App.$('#appGrid');
      if (!grid) return;

      function restoreIconImages() {
        grid.querySelectorAll('.app-icon').forEach(function(icon) {
          var key = icon.dataset.icon;
          if (!key) return;
          var saved = App.LS.get('iconImg_' + key);
          if (saved) {
            var imgEl = icon.querySelector('.app-icon-img');
            if (imgEl) imgEl.innerHTML = '<img src="' + saved + '">';
          }
        });
      }

      function showLongPressMenu(icon, x, y) {
        var old = App.$('#iconLongPressMenu');
        if (old) old.remove();

        var menu = document.createElement('div');
        menu.id = 'iconLongPressMenu';
        menu.className = 'icon-longpress-menu';
        menu.innerHTML =
          '<div class="icon-longpress-menu-item" id="iconMenuChangeImg">更换图标图片</div>' +
          '<div class="icon-longpress-menu-item" id="iconMenuResetImg">恢复默认图标</div>';
        menu.style.left = Math.min(x, window.innerWidth - 160) + 'px';
        menu.style.top = Math.min(y, window.innerHeight - 100) + 'px';
        document.body.appendChild(menu);

        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.hidden = true;
        document.body.appendChild(fileInput);

        App.safeOn('#iconMenuChangeImg', 'click', function() {
          fileInput.click();
          menu.remove();
        });

        fileInput.addEventListener('change', function(e) {
          var file = e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(ev) {
            var imgEl = icon.querySelector('.app-icon-img');
            if (imgEl) imgEl.innerHTML = '<img src="' + ev.target.result + '">';
            App.LS.set('iconImg_' + icon.dataset.icon, ev.target.result);
          };
          reader.readAsDataURL(file);
          fileInput.remove();
        });

        App.safeOn('#iconMenuResetImg', 'click', function() {
          App.LS.remove('iconImg_' + icon.dataset.icon);
          menu.remove();
          location.reload();
        });

        setTimeout(function() {
          function dismiss(e) {
            if (menu.parentNode && !menu.contains(e.target)) {
              menu.remove();
              document.removeEventListener('touchstart', dismiss);
              document.removeEventListener('click', dismiss);
            }
          }
          document.addEventListener('touchstart', dismiss, { passive: true });
          document.addEventListener('click', dismiss);
        }, 100);
      }

      grid.querySelectorAll('.app-icon').forEach(function(icon) {
        var timer = null;
        var pressed = false;
        var moved = false;

        icon.addEventListener('touchstart', function(e) {
          moved = false;
          pressed = false;
          var touch = e.touches[0];
          timer = setTimeout(function() {
            pressed = true;
            showLongPressMenu(icon, touch.clientX, touch.clientY);
          }, 600);
        }, { passive: true });

        icon.addEventListener('touchmove', function() {
          moved = true;
          clearTimeout(timer);
        }, { passive: true });

        icon.addEventListener('touchend', function(e) {
          clearTimeout(timer);
          if (pressed) {
            e.preventDefault();
            pressed = false;
          }
        }, { passive: false });
      });

      restoreIconImages();
    })();

    snapToPage(false);
  };

  App.init = function() {
    App.state.ball = App.$('#floatingBall');
    App.state.ballMenuEl = App.$('#ballMenu');
    App.state.overlay = App.$('#overlay');

    if (!App.state.ball || !App.state.ballMenuEl || !App.state.overlay) {
      console.warn('页面缺少核心元素');
      return;
    }

    App.initFloatingBall();
    App.runInits();
    App.initMainPages();
  };

  window.addEventListener('load', function() {
    App.init();
  });
})();
