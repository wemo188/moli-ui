(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var DRAG_DELAY = 500;

  var BUILTIN_FONTS = [
    { name: '跟随全局', family: '', scale: 1 },
    { name: '系统默认', family: '-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif', scale: 1 },
    { name: '霞鹜文楷', family: '"LXGW WenKai",cursive', scale: 1 },
    { name: '思源宋体', family: '"Noto Serif SC",serif', scale: 1 },
    { name: '思源黑体', family: '"Noto Sans SC",sans-serif', scale: 1 },
    { name: '站酷小薇', family: '"ZCOOL XiaoWei",serif', scale: 1 },
    { name: '马善政楷', family: '"Ma Shan Zheng",cursive', scale: 1 }
  ];

  var Eden = {
    data: {},

    DEFAULTS: {
      text: '文字填写区域，可以多行',
      fontSize: 38,
      rotate: 0,
      spacing: 2,
      fontColor: '#1a1a1a',
      fontName: '',
      fontFamily: '',
      posX: 0,
      posY: 0
    },

    load: function() {
      var saved = App.LS.get('edenCard');
      var d = Eden.DEFAULTS;
      Eden.data = saved ? {
        text: saved.text != null ? saved.text : d.text,
        fontSize: saved.fontSize != null ? saved.fontSize : d.fontSize,
        rotate: saved.rotate != null ? saved.rotate : d.rotate,
        spacing: saved.spacing != null ? saved.spacing : d.spacing,
        fontColor: saved.fontColor || d.fontColor,
        fontName: saved.fontName || '',
        fontFamily: saved.fontFamily || '',
        posX: saved.posX != null ? saved.posX : d.posX,
        posY: saved.posY != null ? saved.posY : d.posY
      } : JSON.parse(JSON.stringify(d));
    },

    save: function() { App.LS.set('edenCard', Eden.data); },

    getAvailableFonts: function() {
      var custom = App.LS.get('fontCustomList') || [];
      return BUILTIN_FONTS.concat(custom.map(function(f) {
        return { name: f.name, family: f.family, scale: f.scale || 1, fileName: f.fileName };
      }));
    },

    /* ★ 获取选中字体的 scale */
    getSelectedScale: function() {
      var name = Eden.data.fontName;
      if (!name) return 1;
      var fonts = Eden.getAvailableFonts();
      for (var i = 0; i < fonts.length; i++) {
        if (fonts[i].name === name) return fonts[i].scale || 1;
      }
      return 1;
    },

    apply: function() {
      var el = App.$('#edenText');
      if (!el) return;
      var d = Eden.data;
      var scale = Eden.getSelectedScale();
      var actualSize = Math.round((d.fontSize || 28) * scale);

      el.textContent = d.text || '';
      el.style.fontSize = actualSize + 'px';
      el.style.transform = 'rotate(' + (d.rotate || 0) + 'deg)';
      el.style.letterSpacing = (d.spacing || 0) + 'px';
      el.style.color = d.fontColor || '#1a1a1a';
      el.style.fontFamily = d.fontFamily || '';
      el.style.whiteSpace = 'pre-wrap';
      el.style.wordBreak = 'break-word';

      var card = App.$('#edenCard');
      if (card && (d.posX || d.posY)) {
        card.style.transform = 'translate(' + d.posX + 'px, ' + d.posY + 'px)';
      }
    },

    bindDrag: function() {
      var card = App.$('#edenCard');
      if (!card) return;
      var startX, startY, startPosX, startPosY, longPressed = false, timer, moved = false;

        card.addEventListener('touchstart', function(e) {
        if (e.target.closest('#edenEditOverlay')) return;
        var textEl = card.querySelector('#edenText');
        if (!textEl || !textEl.textContent.trim()) return;
        if (e.target !== textEl) return;
        var touch = e.touches[0];
        var hit = false;
        var textNode = textEl.firstChild;
        if (textNode && textNode.nodeType === 3) {
          var r = document.createRange();
          var len = textNode.textContent.length;
          for (var i = 0; i < len; i++) {
            r.setStart(textNode, i);
            r.setEnd(textNode, Math.min(i + 1, len));
            var rects = r.getClientRects();
            for (var j = 0; j < rects.length; j++) {
              var rc = rects[j];
              if (touch.clientX >= rc.left && touch.clientX <= rc.right && touch.clientY >= rc.top && touch.clientY <= rc.bottom) {
                hit = true; break;
              }
            }
            if (hit) break;
          }
        }
        if (!hit) return;
        startX = touch.clientX; startY = touch.clientY;
        longPressed = false; moved = false;
        var match = (card.style.transform || '').match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        startPosX = match ? parseFloat(match[1]) : (Eden.data.posX || 0);
        startPosY = match ? parseFloat(match[2]) : (Eden.data.posY || 0);
        timer = setTimeout(function() {
          longPressed = true;
          card.classList.add('dragging');
          if (navigator.vibrate) navigator.vibrate(15);
        }, DRAG_DELAY);
      }, { passive: true });

      card.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        if (timer && !longPressed) {
          if (Math.abs(touch.clientX - startX) > 8 || Math.abs(touch.clientY - startY) > 8) { clearTimeout(timer); timer = null; }
          return;
        }
        if (!longPressed) return;
        e.preventDefault(); moved = true;
        Eden.data.posX = startPosX + touch.clientX - startX;
        Eden.data.posY = startPosY + touch.clientY - startY;
        card.style.transform = 'translate(' + Eden.data.posX + 'px, ' + Eden.data.posY + 'px)';
      }, { passive: false });

      card.addEventListener('touchend', function(e) {
        clearTimeout(timer); timer = null;
        card.classList.remove('dragging');
        if (longPressed && moved) { Eden.save(); e.stopPropagation(); }
        longPressed = false; moved = false;
      });
    },

    openEdit: function() {
      var old = App.$('#edenEditOverlay');
      if (old) { old.remove(); return; }

      var saved = App.LS.get('edenCard');
      if (saved) {
        Object.keys(Eden.DEFAULTS).forEach(function(k) {
          Eden.data[k] = saved[k] != null ? saved[k] : Eden.DEFAULTS[k];
        });
      }

      var d = Eden.data;
      var fonts = Eden.getAvailableFonts();
      var currentFontColor = d.fontColor || '#1a1a1a';

      var fontOptionsHtml = fonts.map(function(f) {
        var sel = '';
        if (d.fontName && d.fontName === f.name) sel = ' selected';
        else if (!d.fontName && f.name === '跟随全局') sel = ' selected';
        var label = f.fileName ? f.fileName : f.name;
        return '<option value="' + App.escAttr(f.name) + '" data-family="' + App.escAttr(f.family) + '"' + sel + '>' + App.esc(label) + '</option>';
      }).join('');

      var overlay = document.createElement('div');
      overlay.id = 'edenEditOverlay';
      overlay.className = 'pc-edit-overlay';

      var panel = document.createElement('div');
      panel.className = 'pc-edit-panel';

      panel.innerHTML =
        '<div class="pc-header">文字卡片<div class="pc-close-btn" id="edenCloseBtn">×</div></div>' +
        '<div class="pc-body" style="gap:8px;">' +
          '<div class="pc-group"><span class="pc-label">文字内容</span>' +
            '<textarea id="edenTextInput" rows="4" style="width:100%;padding:7px 10px;font-size:12px;color:#000;background:rgba(255,255,255,0.5);border:1px solid rgba(0,0,0,0.15);border-radius:8px;outline:none;font-family:inherit;resize:vertical;box-sizing:border-box;">' + App.esc(d.text || '') + '</textarea>' +
          '</div>' +
          '<div class="pc-group"><span class="pc-label">字体</span>' +
            '<select id="edenFontSelect" style="width:100%;padding:7px 10px;font-size:12px;color:#000;background:rgba(255,255,255,0.5);border:1px solid rgba(0,0,0,0.15);border-radius:8px;outline:none;font-family:inherit;-webkit-appearance:none;appearance:none;cursor:pointer;">' +
              fontOptionsHtml +
            '</select>' +
          '</div>' +
          '<div class="pc-group"><span class="pc-label">字号</span>' +
            '<div class="pc-slider-row"><input type="range" class="pc-slider" id="edenSize" min="14" max="60" value="' + (d.fontSize || 28) + '"><span class="pc-slider-val" id="edenSizeVal">' + (d.fontSize || 28) + 'px</span></div>' +
          '</div>' +
          '<div class="pc-group"><span class="pc-label">倾斜</span>' +
            '<div class="pc-slider-row"><input type="range" class="pc-slider" id="edenRotate" min="-20" max="20" value="' + (d.rotate || 0) + '"><span class="pc-slider-val" id="edenRotateVal">' + (d.rotate || 0) + '°</span></div>' +
          '</div>' +
          '<div class="pc-group"><span class="pc-label">间距</span>' +
            '<div class="pc-slider-row"><input type="range" class="pc-slider" id="edenSpacing" min="0" max="20" value="' + (d.spacing || 2) + '"><span class="pc-slider-val" id="edenSpacingVal">' + (d.spacing || 2) + 'px</span></div>' +
          '</div>' +
          '<div class="pc-group"><span class="pc-label">字色</span>' +
            '<div class="pc-dot" id="edenColorDot" style="background:' + currentFontColor + ';width:28px;height:28px;border-radius:8px;"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pc-footer">' +
          '<button class="pc-btn pc-btn-save" id="edenSave" type="button">保 存</button>' +
          '<button class="pc-btn pc-btn-cancel" id="edenReset" type="button">重 置</button>' +
        '</div>';

      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      var edenCard = App.$('#edenCard');
      if (edenCard) {
        var rect = edenCard.getBoundingClientRect();
        var left = rect.left + rect.width / 2 - 140;
        if (left < 8) left = 8;
        if (left + 280 > window.innerWidth - 8) left = window.innerWidth - 288;
        var top = rect.bottom + 8;
        if (top + 400 > window.innerHeight - 10) top = Math.max(10, rect.top - 410);
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
      }

      if (App.modules.cards && App.modules.cards._bindPanelDrag) {
        App.modules.cards._bindPanelDrag(panel);
      }

      /* ★ 获取选中字体的 scale */
      function getSelectScale() {
        var selName = panel.querySelector('#edenFontSelect').value;
        for (var i = 0; i < fonts.length; i++) {
          if (fonts[i].name === selName) return fonts[i].scale || 1;
        }
        return 1;
      }

      function preview() {
        panel.querySelector('#edenSizeVal').textContent = panel.querySelector('#edenSize').value + 'px';
        panel.querySelector('#edenRotateVal').textContent = panel.querySelector('#edenRotate').value + '°';
        panel.querySelector('#edenSpacingVal').textContent = panel.querySelector('#edenSpacing').value + 'px';
        var el = App.$('#edenText');
        if (!el) return;

        var selOpt = panel.querySelector('#edenFontSelect');
        var selIdx = selOpt.selectedIndex;
        var family = selOpt.options[selIdx] ? selOpt.options[selIdx].dataset.family : '';
        var scale = getSelectScale();
        var baseSize = parseInt(panel.querySelector('#edenSize').value) || 28;

        el.textContent = panel.querySelector('#edenTextInput').value || '';
        el.style.fontSize = Math.round(baseSize * scale) + 'px';
        el.style.transform = 'rotate(' + panel.querySelector('#edenRotate').value + 'deg)';
        el.style.letterSpacing = panel.querySelector('#edenSpacing').value + 'px';
        el.style.color = currentFontColor;
        el.style.fontFamily = family || '';
        el.style.whiteSpace = 'pre-wrap';
        el.style.wordBreak = 'break-word';
      }

      ['edenSize', 'edenRotate', 'edenSpacing', 'edenTextInput'].forEach(function(id) {
        var el = panel.querySelector('#' + id);
        if (el) el.addEventListener('input', preview);
      });
      panel.querySelector('#edenFontSelect').addEventListener('change', preview);

      panel.querySelector('#edenColorDot').addEventListener('click', function(e) {
        e.stopPropagation();
        if (!App.openColorPicker) return;
        App.openColorPicker(currentFontColor, function(hex) {
          currentFontColor = hex;
          panel.querySelector('#edenColorDot').style.background = hex;
          preview();
        }, function(hex) {
          currentFontColor = hex;
          panel.querySelector('#edenColorDot').style.background = hex;
          preview();
        }, 'eden_fontColor');
      });

      panel.querySelector('#edenSave').addEventListener('click', function(e) {
        e.stopPropagation();
        var selOpt = panel.querySelector('#edenFontSelect');
        var selIdx = selOpt.selectedIndex;
        Eden.data.fontName = selOpt.value;
        Eden.data.fontFamily = selOpt.options[selIdx] ? selOpt.options[selIdx].dataset.family : '';
        Eden.data.text = panel.querySelector('#edenTextInput').value;
        Eden.data.fontSize = parseInt(panel.querySelector('#edenSize').value);
        Eden.data.rotate = parseInt(panel.querySelector('#edenRotate').value);
        Eden.data.spacing = parseInt(panel.querySelector('#edenSpacing').value);
        Eden.data.fontColor = currentFontColor;
        Eden.save(); Eden.apply();
        overlay.remove();
        App.showToast('已保存');
      });

      panel.querySelector('#edenReset').addEventListener('click', function(e) {
        e.stopPropagation();
        Eden.data = JSON.parse(JSON.stringify(Eden.DEFAULTS));
        Eden.save(); Eden.apply();
        overlay.remove();
        App.showToast('已重置');
      });

      panel.querySelector('#edenCloseBtn').addEventListener('click', function(e) {
        e.stopPropagation(); overlay.remove();
      });
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
      });
    },

    init: function() {
      Eden.load(); Eden.apply(); Eden.bindDrag();
      var el = App.$('#edenCard');
if (el) {
  var _tapCount = 0, _tapTimer = null;
  el.addEventListener('click', function(e) {
    e.stopPropagation();
    _tapCount++;
    if (_tapCount === 1) {
      _tapTimer = setTimeout(function() { _tapCount = 0; }, 350);
    } else if (_tapCount >= 2) {
      clearTimeout(_tapTimer);
      _tapCount = 0;
      Eden.openEdit();
    }
  });
  }
 }
};

  App.register('eden', Eden);
})();