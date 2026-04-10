(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  // ============================
  //  IndexedDB 字体存储
  // ============================
  var FontDB = {
    dbName: 'EdenFontDB',
    storeName: 'fonts',
    db: null,

    init: function() {
      return new Promise(function(resolve, reject) {
        var request = indexedDB.open(FontDB.dbName, 1);
        request.onerror = function() { reject(request.error); };
        request.onsuccess = function() { FontDB.db = request.result; resolve(); };
        request.onupgradeneeded = function(e) {
          var db = e.target.result;
          if (!db.objectStoreNames.contains(FontDB.storeName)) {
            db.createObjectStore(FontDB.storeName, { keyPath: 'name' });
          }
        };
      });
    },

    saveFont: function(name, dataUrl) {
      return new Promise(function(resolve, reject) {
        if (!FontDB.db) { reject('DB not ready'); return; }
        var tx = FontDB.db.transaction([FontDB.storeName], 'readwrite');
        var store = tx.objectStore(FontDB.storeName);
        var request = store.put({ name: name, dataUrl: dataUrl, time: Date.now() });
        request.onsuccess = function() { resolve(); };
        request.onerror = function() { reject(request.error); };
      });
    },

    getFont: function(name) {
      return new Promise(function(resolve, reject) {
        if (!FontDB.db) { reject('DB not ready'); return; }
        var tx = FontDB.db.transaction([FontDB.storeName], 'readonly');
        var store = tx.objectStore(FontDB.storeName);
        var request = store.get(name);
        request.onsuccess = function() { resolve(request.result); };
        request.onerror = function() { reject(request.error); };
      });
    },

    deleteFont: function(name) {
      return new Promise(function(resolve, reject) {
        if (!FontDB.db) { reject('DB not ready'); return; }
        var tx = FontDB.db.transaction([FontDB.storeName], 'readwrite');
        var store = tx.objectStore(FontDB.storeName);
        var request = store.delete(name);
        request.onsuccess = function() { resolve(); };
        request.onerror = function() { reject(request.error); };
      });
    }
  };

  // ============================
  //  文字卡片 + 相识天数对话框
  // ============================
  var Eden = {
    data: {},
    dragStartX: 0,
    dragStartY: 0,
    originalLeft: 0,
    originalTop: 0,
    isDragging: false,
    dragTimer: null,

    DEFAULTS: {
      text: '你是我的伊甸塔',
      fontSize: 28,
      rotate: 0,
      spacing: 2,
      fontColor: '#1a1a1a',
      fontName: '',
      fontUrl: '',
      posX: 0,
      posY: 0
    },

    load: function() {
      var saved = App.LS.get('edenCard');
      var d = Eden.DEFAULTS;
      if (saved) {
        Eden.data.text = saved.text != null ? saved.text : d.text;
        Eden.data.fontSize = saved.fontSize != null ? saved.fontSize : d.fontSize;
        Eden.data.rotate = saved.rotate != null ? saved.rotate : d.rotate;
        Eden.data.spacing = saved.spacing != null ? saved.spacing : d.spacing;
        Eden.data.fontColor = saved.fontColor || d.fontColor;
        Eden.data.fontName = saved.fontName || '';
        Eden.data.fontUrl = saved.fontUrl || '';
        Eden.data.posX = saved.posX != null ? saved.posX : d.posX;
        Eden.data.posY = saved.posY != null ? saved.posY : d.posY;
      } else {
        Eden.data = JSON.parse(JSON.stringify(d));
      }
    },

    save: function() {
      App.LS.set('edenCard', Eden.data);
    },

    // 从 IndexedDB 加载字体
    loadFontFromDB: function(fontName) {
      var self = this;
      if (!fontName) return Promise.resolve(false);
      return FontDB.getFont(fontName).then(function(result) {
        if (result && result.dataUrl) {
          return self.loadFontFromUrl(result.dataUrl, fontName);
        }
        return false;
      }).catch(function() { return false; });
    },

    // 从 URL 加载字体
    loadFontFromUrl: function(url, customName) {
      var fontName = customName || 'EdenCustom_' + Date.now();
      var font = new FontFace(fontName, 'url(' + url + ')');
      return font.load().then(function(loaded) {
        document.fonts.add(loaded);
        var textEl = App.$('#edenText');
        if (textEl) textEl.style.fontFamily = "'" + fontName + "', cursive";
        return true;
      }).catch(function() {
        return false;
      });
    },

    // 上传并保存字体到 IndexedDB
    uploadAndSaveFont: function(file) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          var dataUrl = ev.target.result;
          var fontName = 'EdenFont_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9]/g, '_');
          
          FontDB.saveFont(fontName, dataUrl).then(function() {
            self.loadFontFromUrl(dataUrl, fontName).then(function() {
              self.data.fontName = fontName;
              self.data.fontUrl = '';
              self.save();
              resolve(fontName);
            }).catch(reject);
          }).catch(reject);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    // 获取或创建相识日期
    getMeetDate: function() {
      var meetDate = localStorage.getItem('meetDate');
      if (!meetDate) {
        meetDate = Date.now();
        localStorage.setItem('meetDate', meetDate);
      }
      return parseInt(meetDate);
    },

    // 计算天数
    getDaysCount: function() {
      var meetDate = Eden.getMeetDate();
      var today = Date.now();
      var days = Math.floor((today - meetDate) / (1000 * 60 * 60 * 24));
      return days;
    },

    // 更新天数显示
    updateDaysDisplay: function() {
      var daysText = document.getElementById('daysText');
      if (daysText) {
        var days = Eden.getDaysCount();
        daysText.value = days + '天';
        // 触发生成dom
        var evt = new Event('input', { bubbles: true });
        daysText.dispatchEvent(evt);
      }
    },

    // 重置相识日期
    resetMeetDate: function() {
      if (confirm('重置相识日期？')) {
        localStorage.setItem('meetDate', Date.now());
        Eden.updateDaysDisplay();
        App.showToast('已重置');
      }
    },

    // 加载头像
    loadAvatars: function() {
      var savedAvatarLeft = localStorage.getItem('pixelAvatarLeft');
      if (savedAvatarLeft) {
        var avatarImgLeft = document.getElementById('avatarImgLeft');
        var avatarPlaceholderLeft = document.getElementById('avatarPlaceholderLeft');
        if (avatarImgLeft) {
          avatarImgLeft.src = savedAvatarLeft;
          avatarImgLeft.style.display = 'block';
          if (avatarPlaceholderLeft) avatarPlaceholderLeft.style.display = 'none';
        }
      }
      
      var savedAvatarRight = localStorage.getItem('pixelAvatarRight');
      if (savedAvatarRight) {
        var avatarImgRight = document.getElementById('avatarImgRight');
        var avatarPlaceholderRight = document.getElementById('avatarPlaceholderRight');
        if (avatarImgRight) {
          avatarImgRight.src = savedAvatarRight;
          avatarImgRight.style.display = 'block';
          if (avatarPlaceholderRight) avatarPlaceholderRight.style.display = 'none';
        }
      }
    },

    // 绑定头像上传
    bindAvatarUpload: function() {
      // 左边头像上传
      var avatarBoxLeft = document.getElementById('avatarBoxLeft');
      var avatarUploadLeft = document.getElementById('avatarUploadLeft');
      if (avatarBoxLeft && avatarUploadLeft) {
        avatarBoxLeft.addEventListener('click', function(e) {
          e.stopPropagation();
          avatarUploadLeft.click();
        });
        avatarUploadLeft.addEventListener('change', function(e) {
          var file = e.target.files[0];
          if (file && file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function(ev) {
              var imgUrl = ev.target.result;
              var avatarImgLeft = document.getElementById('avatarImgLeft');
              var avatarPlaceholderLeft = document.getElementById('avatarPlaceholderLeft');
              if (avatarImgLeft) {
                avatarImgLeft.src = imgUrl;
                avatarImgLeft.style.display = 'block';
                if (avatarPlaceholderLeft) avatarPlaceholderLeft.style.display = 'none';
                localStorage.setItem('pixelAvatarLeft', imgUrl);
                App.showToast('头像已保存');
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
      
      // 右边头像上传
      var avatarBoxRight = document.getElementById('avatarBoxRight');
      var avatarUploadRight = document.getElementById('avatarUploadRight');
      if (avatarBoxRight && avatarUploadRight) {
        avatarBoxRight.addEventListener('click', function(e) {
          e.stopPropagation();
          avatarUploadRight.click();
        });
        avatarUploadRight.addEventListener('change', function(e) {
          var file = e.target.files[0];
          if (file && file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function(ev) {
              var imgUrl = ev.target.result;
              var avatarImgRight = document.getElementById('avatarImgRight');
              var avatarPlaceholderRight = document.getElementById('avatarPlaceholderRight');
              if (avatarImgRight) {
                avatarImgRight.src = imgUrl;
                avatarImgRight.style.display = 'block';
                if (avatarPlaceholderRight) avatarPlaceholderRight.style.display = 'none';
                localStorage.setItem('pixelAvatarRight', imgUrl);
                App.showToast('头像已保存');
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
    },

    // 绑定可编辑文字保存
    bindEditableText: function() {
      var meetText = document.getElementById('meetText');
      var daysText = document.getElementById('daysText');

      function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }

      if (meetText) {
        meetText.addEventListener('input', function() {
          autoResize(this);
          localStorage.setItem('meetText', this.value);
        });
        autoResize(meetText);
        var savedMeet = localStorage.getItem('meetText');
        if (savedMeet) meetText.value = savedMeet;
      }

      if (daysText) {
        daysText.addEventListener('input', function() {
          autoResize(this);
          localStorage.setItem('daysText', this.value);
        });
        autoResize(daysText);
        var savedDays = localStorage.getItem('daysText');
        if (savedDays) daysText.value = savedDays;
      }
    },

    // 长按拖拽功能
    bindDrag: function() {
      var card = App.$('#edenCard');
      if (!card) return;
      
      var startX, startY, startPosX, startPosY, longPressed = false, timer, moved = false;
      
      card.addEventListener('touchstart', function(e) {
        if (e.target.closest('.eden-ctrl-wrap')) return;
        var touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        longPressed = false;
        moved = false;
        var transform = card.style.transform;
        var match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        startPosX = match ? parseFloat(match[1]) : (Eden.data.posX || 0);
        startPosY = match ? parseFloat(match[2]) : (Eden.data.posY || 0);
        timer = setTimeout(function() {
          longPressed = true;
          card.classList.add('dragging');
          if (navigator.vibrate) navigator.vibrate(15);
        }, 500);
      }, { passive: true });
      
      card.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        if (timer && !longPressed) {
          if (Math.abs(touch.clientX - startX) > 8 || Math.abs(touch.clientY - startY) > 8) {
            clearTimeout(timer);
            timer = null;
          }
          return;
        }
        if (!longPressed) return;
        e.preventDefault();
        moved = true;
        var dx = touch.clientX - startX;
        var dy = touch.clientY - startY;
        var newX = startPosX + dx;
        var newY = startPosY + dy;
        card.style.transform = 'translate(' + newX + 'px, ' + newY + 'px)';
        Eden.data.posX = newX;
        Eden.data.posY = newY;
      }, { passive: false });
      
      card.addEventListener('touchend', function(e) {
        clearTimeout(timer);
        timer = null;
        card.classList.remove('dragging');
        if (longPressed && moved) {
          Eden.save();
          e.stopPropagation();
        }
        longPressed = false;
        moved = false;
      });
    },

    openEdit: function() {
      var old = App.$('#edenCtrlWrap');
      if (old) { old.remove(); return; }

      var d = Eden.data;
      var wrap = document.createElement('div');
      wrap.id = 'edenCtrlWrap';
      wrap.className = 'eden-ctrl-wrap';
      wrap.innerHTML =
        '<div class="eden-ctrl-panel">' +
          '<div class="eden-ctrl-title">文字卡片</div>' +
          '<div class="eden-ctrl-section">内容</div>' +
          '<div class="eden-ctrl-row">' +
            '<label>字体</label>' +
            '<input type="text" id="edenFontUrl" placeholder="字体URL" value="' + App.esc(d.fontUrl || '') + '">' +
            '<label class="eden-font-upload-btn" for="edenFontFile">' +
              '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            '</label>' +
            '<input type="file" id="edenFontFile" accept=".ttf,.otf,.woff,.woff2" hidden>' +
          '</div>' +
          '<div class="eden-ctrl-row">' +
            '<label>文字</label>' +
            '<input type="text" id="edenTextInput" value="' + App.esc(d.text || '') + '">' +
          '</div>' +
          '<div class="eden-ctrl-divider"></div>' +
          '<div class="eden-ctrl-section">样式</div>' +
          '<div class="eden-ctrl-row">' +
            '<label>字号</label>' +
            '<input type="range" id="edenSize" min="14" max="60" value="' + (d.fontSize || 28) + '">' +
            '<span class="eden-ctrl-val" id="edenSizeVal">' + (d.fontSize || 28) + 'px</span>' +
          '</div>' +
          '<div class="eden-ctrl-row">' +
            '<label>倾斜</label>' +
            '<input type="range" id="edenRotate" min="-20" max="20" value="' + (d.rotate || 0) + '">' +
            '<span class="eden-ctrl-val" id="edenRotateVal">' + (d.rotate || 0) + '°</span>' +
          '</div>' +
          '<div class="eden-ctrl-row">' +
            '<label>间距</label>' +
            '<input type="range" id="edenSpacing" min="0" max="20" value="' + (d.spacing || 2) + '">' +
            '<span class="eden-ctrl-val" id="edenSpacingVal">' + (d.spacing || 2) + 'px</span>' +
          '</div>' +
          '<div class="eden-ctrl-row">' +
            '<label>字色</label>' +
            '<input type="color" id="edenColor" value="' + (d.fontColor || '#1a1a1a') + '">' +
          '</div>' +
          '<div class="eden-ctrl-btns">' +
            '<button class="eden-ctrl-save" id="edenSave" type="button">保存</button>' +
            '<button class="eden-ctrl-reset" id="edenReset" type="button">重置</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(wrap);
      wrap.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: false });
      wrap.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: false });

      var self = this;
      // 上传字体到 IndexedDB
      App.$('#edenFontFile').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        App.showToast('上传中...');
        Eden.uploadAndSaveFont(file).then(function(fontName) {
          App.$('#edenFontUrl').value = '(已保存) ' + file.name;
          App.showToast('字体已保存，刷新不会丢失');
        }).catch(function() {
          App.showToast('上传失败');
        });
      });

      function getCfg() {
        return {
          text: App.$('#edenTextInput').value,
          fontSize: parseInt(App.$('#edenSize').value),
          rotate: parseInt(App.$('#edenRotate').value),
          spacing: parseInt(App.$('#edenSpacing').value),
          fontColor: App.$('#edenColor').value,
          fontUrl: App.$('#edenFontUrl').value.trim()
        };
      }

      function updateLabels() {
        App.$('#edenSizeVal').textContent = App.$('#edenSize').value + 'px';
        App.$('#edenRotateVal').textContent = App.$('#edenRotate').value + '°';
        App.$('#edenSpacingVal').textContent = App.$('#edenSpacing').value + 'px';
      }

      function preview() {
        updateLabels();
        var cfg = getCfg();
        var el = App.$('#edenText');
        if (!el) return;
        el.textContent = cfg.text || '';
        el.style.fontSize = cfg.fontSize + 'px';
        el.style.transform = 'rotate(' + cfg.rotate + 'deg)';
        el.style.letterSpacing = cfg.spacing + 'px';
        el.style.color = cfg.fontColor;
      }

      ['edenSize', 'edenRotate', 'edenSpacing', 'edenColor', 'edenTextInput'].forEach(function(id) {
        var el = App.$('#' + id);
        if (el) el.addEventListener('input', preview);
      });

      App.$('#edenFontUrl').addEventListener('change', function() {
        var url = this.value.trim();
        if (url && !url.startsWith('(已保存)')) {
          Eden.loadFontFromUrl(url);
        }
      });

      App.$('#edenSave').addEventListener('click', function() {
        var cfg = getCfg();
        if (cfg.fontUrl && !cfg.fontUrl.startsWith('(已保存)')) {
          Eden.data.fontName = '';
          Eden.data.fontUrl = cfg.fontUrl;
        }
        Eden.data.text = cfg.text;
        Eden.data.fontSize = cfg.fontSize;
        Eden.data.rotate = cfg.rotate;
        Eden.data.spacing = cfg.spacing;
        Eden.data.fontColor = cfg.fontColor;
        Eden.save();
        Eden.apply();
        wrap.remove();
        App.showToast('已保存');
      });

      App.$('#edenReset').addEventListener('click', function() {
        Eden.data = JSON.parse(JSON.stringify(Eden.DEFAULTS));
        Eden.save();
        Eden.apply();
        wrap.remove();
        App.showToast('已重置');
      });

      setTimeout(function() {
        function dismiss(e) {
          if (wrap.contains(e.target)) return;
          var edenCard = App.$('#edenCard');
          if (edenCard && edenCard.contains(e.target)) return;
          wrap.remove();
          document.removeEventListener('touchstart', dismiss, true);
          document.removeEventListener('click', dismiss);
        }
        document.addEventListener('touchstart', dismiss, true);
        document.addEventListener('click', dismiss);
      }, 100);
    },

    apply: function() {
      var el = App.$('#edenText');
      if (!el) return;
      var d = Eden.data;
      el.textContent = d.text || '';
      el.style.fontSize = (d.fontSize || 28) + 'px';
      el.style.transform = 'rotate(' + (d.rotate || 0) + 'deg)';
      el.style.letterSpacing = (d.spacing || 0) + 'px';
      el.style.color = d.fontColor || '#1a1a1a';
      
      var card = App.$('#edenCard');
      if (card && (d.posX || d.posY)) {
        card.style.transform = 'translate(' + d.posX + 'px, ' + d.posY + 'px)';
      }
      
      // 加载保存的字体
      if (d.fontName) {
        Eden.loadFontFromDB(d.fontName);
      } else if (d.fontUrl) {
        Eden.loadFontFromUrl(d.fontUrl);
      }
    },

    init: function() {
      var self = this;
      // 先初始化 IndexedDB
      FontDB.init().then(function() {
        self.load();
        self.apply();
        self.bindDrag();
        self.updateDaysDisplay();
        self.loadAvatars();
        self.bindAvatarUpload();
        self.bindEditableText();
        
        var el = App.$('#edenCard');
        if (el) {
          el.addEventListener('click', function(e) {
            if (self.isDragging) return;
            e.stopPropagation();
            self.openEdit();
          });
        }
      }).catch(function() {
        // IndexedDB 不可用，降级处理
        self.load();
        self.apply();
        self.bindDrag();
        self.updateDaysDisplay();
        self.loadAvatars();
        self.bindAvatarUpload();
        self.bindEditableText();
        
        var el = App.$('#edenCard');
        if (el) {
          el.addEventListener('click', function(e) {
            if (self.isDragging) return;
            e.stopPropagation();
            self.openEdit();
          });
        }
      });
    }
  };

  App.register('eden', Eden);
})();