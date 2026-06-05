(function(){
'use strict';
var App = window.App; if(!App) return;

var DEFAULT_SVGS = {
  iconUser: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="hm1"><rect width="64" height="64" fill="white"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="black"/></mask><circle cx="32" cy="32" r="22" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#hm1)"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" stroke="#999" stroke-width="1.8" fill="none"/></svg>',
  iconChar: '<svg viewBox="0 0 64 64" fill="none" width="52" height="52"><rect x="8" y="10" width="46" height="44" rx="4" stroke="#999" stroke-width="2" fill="none"/><path d="M21 18L23 23L28 23.5L24 27L25 32L21 29L17 32L18 27L14 23.5L19 23Z" stroke="#999" stroke-width="1.6" stroke-linejoin="round" fill="#999"/><line x1="34" y1="20" x2="50" y2="20" stroke="#999" stroke-width="1.8" stroke-linecap="round"/><line x1="34" y1="28" x2="46" y2="28" stroke="#999" stroke-width="1.6" stroke-linecap="round"/><line x1="34" y1="36" x2="48" y2="36" stroke="#999" stroke-width="1.6" stroke-linecap="round"/><line x1="14" y1="44" x2="50" y2="44" stroke="#999" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="3 2"/></svg>',
  iconTheme: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="pm1"><rect width="64" height="64" fill="white"/><circle cx="20" cy="26" r="4.5" fill="black"/><circle cx="32" cy="18" r="4.5" fill="black"/><circle cx="44" cy="26" r="4.5" fill="black"/><circle cx="22" cy="38" r="4.5" fill="black"/></mask><path d="M32 8C18.7 8 8 18.7 8 32C8 45.3 18.7 56 32 56C34.2 56 36 54.2 36 52C36 51 35.6 50.1 35 49.4C34.4 48.7 34 47.8 34 46.8C34 44.6 35.8 42.8 38 42.8H42C50.3 42.8 57 36.1 57 27.8C57 16.9 45.7 8 32 8Z" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#pm1)"/><circle cx="20" cy="26" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/><circle cx="32" cy="18" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/><circle cx="44" cy="26" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/><circle cx="22" cy="38" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/></svg>',
  iconSettings: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="gm1"><rect width="64" height="64" fill="white"/><circle cx="32" cy="26.5" r="7" fill="black"/></mask><path d="M30 8H34L35 13C36.5 13.4 37.9 14 39.2 14.8L43.5 12L46.5 15L44.2 19.2C45 20.5 45.6 21.9 46 23.4L51 24.5V28.5L46 29.6C45.6 31.1 45 32.5 44.2 33.8L46.5 38L43.5 41L39.2 38.2C37.9 39 36.5 39.6 35 40L34 45H30L29 40C27.5 39.6 26.1 39 24.8 38.2L20.5 41L17.5 38L19.8 33.8C19 32.5 18.4 31.1 18 29.6L13 28.5V24.5L18 23.4C18.4 21.9 19 20.5 19.8 19.2L17.5 15L20.5 12L24.8 14.8C26.1 14 27.5 13.4 29 13L30 8Z" stroke="#999" stroke-width="2" stroke-linejoin="round" fill="#999" mask="url(#gm1)"/><circle cx="32" cy="26.5" r="7" stroke="#999" stroke-width="1.8" fill="none"/></svg>',
  dockChat: '<svg viewBox="0 0 64 64" fill="none" width="34" height="34"><mask id="cm1"><rect width="64" height="64" fill="white"/><line x1="23" y1="27.5" x2="41" y2="27.5" stroke="black" stroke-width="4" stroke-linecap="round"/><line x1="23" y1="34.5" x2="35" y2="34.5" stroke="black" stroke-width="4" stroke-linecap="round"/></mask><path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#cm1)"/></svg>',
  dockStory: '<svg viewBox="0 0 64 64" fill="none" width="32" height="32"><mask id="sm1"><rect width="64" height="64" fill="white"/><path d="M33 20L40 29L33 38L26 29Z" fill="black"/><circle cx="33" cy="29" r="3" fill="black"/></mask><rect x="14" y="6" width="38" height="46" rx="4" fill="#999" mask="url(#sm1)"/><line x1="10" y1="10" x2="10" y2="48" stroke="#999" stroke-width="2.2" stroke-linecap="round"/><line x1="10" y1="10" x2="14" y2="10" stroke="#999" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="48" x2="14" y2="48" stroke="#999" stroke-width="2" stroke-linecap="round"/><path d="M33 20L40 29L33 38L26 29Z" stroke="#999" stroke-width="1.6" stroke-linejoin="round" fill="none"/><circle cx="33" cy="29" r="3" stroke="#999" stroke-width="1.4" fill="none"/><path d="M10 52H52" stroke="#aaa" stroke-width="1.4" stroke-linecap="round"/><path d="M10 55H52" stroke="#bbb" stroke-width="1.2" stroke-linecap="round"/><path d="M10 58H52" stroke="#ccc" stroke-width="1" stroke-linecap="round"/></svg>',
  dockCheckin: '<svg viewBox="0 0 64 64" fill="none" width="32" height="32"><mask id="ck1"><rect width="64" height="64" fill="white"/><rect x="21" y="18" width="22" height="28" rx="1.5" fill="black"/><circle cx="32" cy="50" r="2.5" fill="black"/></mask><rect x="18" y="10" width="28" height="44" rx="4" fill="#999" mask="url(#ck1)"/><line x1="28" y1="13" x2="36" y2="13" stroke="#999" stroke-width="1.6" stroke-linecap="round"/><rect x="21" y="18" width="22" height="28" rx="1.5" fill="none" stroke="#999" stroke-width="1.4"/><circle cx="32" cy="50" r="2.5" stroke="#999" stroke-width="1.5" fill="none"/><line x1="24" y1="23" x2="40" y2="23" stroke="#999" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="28" x2="35" y2="28" stroke="#999" stroke-width="1.2" stroke-linecap="round"/><line x1="24" y1="33" x2="39" y2="33" stroke="#999" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="38" x2="33" y2="38" stroke="#999" stroke-width="1.2" stroke-linecap="round"/></svg>',
  dockForum: '<svg viewBox="0 0 64 64" fill="none" width="34" height="34"><mask id="em1"><rect width="64" height="64" fill="white"/><ellipse cx="32" cy="32" rx="7" ry="18" stroke="black" stroke-width="1.4" fill="none"/><path d="M14 26H50" stroke="black" stroke-width="1.2"/><path d="M16 38H48" stroke="black" stroke-width="1.2"/></mask><circle cx="32" cy="32" r="18" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#em1)"/><ellipse cx="32" cy="32" rx="28" ry="10" stroke="#999" stroke-width="1.8" fill="none" transform="rotate(-20 32 32)"/><circle cx="52" cy="20" r="3" fill="#999" stroke="#999" stroke-width="1.4"/></svg>'
};

var ICON_MAP = [
  { id: 'customIcon_user', label: 'User', containerId: 'iconUserImg', parentId: 'iconUser' },
  { id: 'customIcon_char', label: 'Char', containerId: 'iconCharImg', parentId: 'iconChar' },
  { id: 'customIcon_theme', label: '美化', containerId: 'iconThemeImg', parentId: 'iconTheme' },
  { id: 'customIcon_settings', label: '设置', containerId: 'iconSettingsImg', parentId: 'iconSettings' },
  { id: 'customIcon_dockChat', label: '聊天', containerId: null, parentId: 'dockChat', selector: '#dockChat .mk-card' },
  { id: 'customIcon_dockStory', label: '剧情', containerId: null, parentId: 'dockStory', selector: '#dockStory .mk-card' },
  { id: 'customIcon_dockCheckin', label: '查岗', containerId: null, parentId: 'dockCheckin', selector: '#dockCheckin .mk-card' },
  { id: 'customIcon_dockForum', label: '论坛', containerId: null, parentId: 'dockForum', selector: '#dockForum .mk-card' }
];

var Bg = {
  _panelEl: null,

  init: function() {
    if(!document.getElementById('bgInlineStyle')) {
      var bgStyle = document.createElement('style');
      bgStyle.id = 'bgInlineStyle';
      bgStyle.textContent = '#bgLayer{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;}';
      document.head.appendChild(bgStyle);
    }

    Bg.renderAllIcons();

    var bgData = App.LS.get('bgData') || {};
    Bg.applyBg(bgData, 0);
    var bgData1 = App.LS.get('bgData_1') || {};
    Bg.applyBg(bgData1, 1);

    var iconConfig = App.LS.get('topIconConfig') || { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
    if(!iconConfig.borderColor) iconConfig.borderColor = '#dcebff';
    if(!iconConfig.shadowColor) iconConfig.shadowColor = '#dcebff';
    if(App.LS.get('topIconConfig')) Bg.applyTopIconStyle(iconConfig);

    App.safeOn('#iconTheme', 'click', function() { Bg.openMain(); });
    App.bg = Bg;
  },

  /* ====== 主面板：美化中心 ====== */
  openMain: function() {
    var old = document.getElementById('beautifyPanel');
    if(old) { old.classList.add('show'); return; }

    var panel = document.createElement('div');
    panel.id = 'beautifyPanel';
    panel.className = 'beautify-panel';

    panel.innerHTML =
      '<div class="bf-nav">' +
        '<button class="bf-back" id="bfMainBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
        '<span class="bf-nav-title">美化</span>' +
        '<div class="bf-nav-right"></div>' +
      '</div>' +
      '<div class="bf-grid">' +
        '<div class="bf-grid-item" data-action="theme"><div class="bf-grid-icon"></div><div class="bf-grid-label">主题应用</div></div>' +
        '<div class="bf-grid-item" data-action="bgicon"><div class="bf-grid-icon"></div><div class="bf-grid-label">背景图标</div></div>' +
        '<div class="bf-grid-item" data-action="font"><div class="bf-grid-icon"></div><div class="bf-grid-label">字体选择</div></div>' +
        '<div class="bf-grid-item" data-action="component"><div class="bf-grid-icon"></div><div class="bf-grid-label">组件定义</div></div>' +
        '<div class="bf-grid-item" data-action="ballstyle"><div class="bf-grid-icon"></div><div class="bf-grid-label">悬浮样式</div></div>' +
        '<div class="bf-grid-item" data-action="snapshot"><div class="bf-grid-icon"></div><div class="bf-grid-label">排版存档</div></div>' +
      '</div>';

    document.body.appendChild(panel);
    Bg._panelEl = panel;

    requestAnimationFrame(function() { panel.classList.add('show'); });

    App.bindSwipeBack(panel, function() { panel.classList.remove('show'); panel.classList.add('hidden'); });

    panel.querySelector('#bfMainBack').addEventListener('click', function() {
      panel.classList.remove('show'); panel.classList.add('hidden');
    });

    panel.querySelectorAll('.bf-grid-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var action = item.dataset.action;
        if(action === 'theme') { /* 先空着 */ App.showToast('主题功能开发中'); }
        else if(action === 'bgicon') { Bg.openBgIcon(); }
        else if(action === 'font') { Bg.openFontFull(); }
        else if(action === 'component') { Bg.openComponent(); }
        else if(action === 'ballstyle') { Bg.openBallStyle(); }
        else if(action === 'snapshot') { Bg.openSnapshot(); }
      });
    });
  },

  /* ====== 背景图标 ====== */
  openBgIcon: function() {
    var old = document.getElementById('bfBgIconPanel');
    if(old) old.remove();

    var bgData0 = App.LS.get('bgData') || {};
    var bgData1 = App.LS.get('bgData_1') || {};
    var iconConfig = App.LS.get('topIconConfig') || { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
    if(!iconConfig.borderColor) iconConfig.borderColor = '#dcebff';
    if(!iconConfig.shadowColor) iconConfig.shadowColor = '#dcebff';

    var currentPreviewPage = 0;
    var tempBg = [JSON.parse(JSON.stringify(bgData0)), JSON.parse(JSON.stringify(bgData1))];

    var panel = document.createElement('div');
    panel.id = 'bfBgIconPanel';
    panel.className = 'bf-sub-panel';

    panel.innerHTML =
      '<div class="bf-nav">' +
        '<button class="bf-back" id="bfBgBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
        '<span class="bf-nav-title">背景图标</span>' +
        '<div class="bf-nav-right"></div>' +
      '</div>' +
      '<div class="bf-preview-area" id="bfPreviewArea">' +
        '<div class="bf-preview-slider" id="bfPreviewSlider">' +
          '<div class="bf-preview-page" id="bfPreviewPage0"></div>' +
          '<div class="bf-preview-page" id="bfPreviewPage1"></div>' +
        '</div>' +
      '</div>' +
      '<div class="bf-preview-dots">' +
        '<button class="bf-preview-dot active" data-p="0" type="button"></button>' +
        '<button class="bf-preview-dot" data-p="1" type="button"></button>' +
      '</div>' +
      '<div class="bf-controls" id="bfBgControls">' +
        '<div class="bf-upload-area" id="bfBgUpload">上传背景图</div>' +
        '<input type="file" id="bfBgFile" accept="image/*" hidden>' +
        '<div class="bf-ctrl-row"><span class="bf-ctrl-label">虚化</span><input type="range" id="bfBlur" min="0" max="30" value="0"><span class="bf-ctrl-val" id="bfBlurVal">0px</span></div>' +
        '<div class="bf-ctrl-row"><span class="bf-ctrl-label">变暗</span><input type="range" id="bfDark" min="0" max="80" value="0"><span class="bf-ctrl-val" id="bfDarkVal">0%</span></div>' +
        '<div class="bf-btn-row">' +
          '<button class="bf-btn" id="bfBgApply" type="button">应用背景</button>' +
          '<button class="bf-btn" id="bfBgRemove" type="button">移除背景</button>' +
        '</div>' +
        '<div class="bf-divider"></div>' +
        '<div style="font-size:11px;font-weight:700;color:#333;margin-bottom:10px;">图标边框样式</div>' +
        '<div class="bf-ctrl-row"><span class="bf-ctrl-label">边框</span><input type="range" id="bfIconBorder" min="0" max="6" step="0.5" value="' + iconConfig.borderW + '"><span class="bf-ctrl-val" id="bfIconBorderVal">' + iconConfig.borderW + 'px</span></div>' +
        '<div class="bf-ctrl-row"><span class="bf-ctrl-label">阴影</span><input type="range" id="bfIconShadow" min="0" max="16" step="1" value="' + iconConfig.shadow + '"><span class="bf-ctrl-val" id="bfIconShadowVal">' + iconConfig.shadow + 'px</span></div>' +
        '<div class="bf-color-row"><span class="bf-ctrl-label">颜色</span><div class="bf-color-dot" id="bfColorDot" style="background:' + iconConfig.borderColor + ';"></div><button class="bf-reset-btn" id="bfResetColor" type="button">恢复默认</button></div>' +
        '<div class="bf-divider"></div>' +
        '<div style="font-size:11px;font-weight:700;color:#333;margin-bottom:10px;">替换图标</div>' +
        '<div class="bf-icon-grid" id="bfIconGrid"></div>' +
      '</div>';

    document.body.appendChild(panel);
    requestAnimationFrame(function() { panel.classList.add('show'); });
    App.bindSwipeBack(panel, function() { panel.remove(); });

    // 渲染预览
    function renderPreview() {
      var area = panel.querySelector('#bfPreviewArea');
      var areaW = area.offsetWidth;
      var areaH = area.offsetHeight;
      var scaleX = areaW / window.innerWidth;
      var scaleY = areaH / window.innerHeight;
      var scale = Math.min(scaleX, scaleY);

      [0, 1].forEach(function(idx) {
        var page = panel.querySelector('#bfPreviewPage' + idx);
        page.innerHTML = '';
        var frame = document.createElement('div');
        frame.className = 'bf-preview-frame';
        frame.style.transform = 'scale(' + scale + ')';
        frame.style.width = window.innerWidth + 'px';
        frame.style.height = window.innerHeight + 'px';

        // Clone the page content
        var srcPage = document.querySelector('.screen-page-' + (idx + 1));
        if(srcPage) {
          var clone = srcPage.cloneNode(true);
          clone.style.width = '100vw';
          clone.style.height = '100vh';
          clone.style.position = 'absolute';
          clone.style.top = '0';
          clone.style.left = '0';
          frame.appendChild(clone);
        }

        // Apply bg
        var bd = tempBg[idx];
        if(bd && bd.src) {
                  var bgDiv = document.createElement('div');
        bgDiv.className = 'bf-preview-bg';
        bgDiv.style.backgroundImage = 'url(' + bd.src + ')';
        bgDiv.style.filter = 'blur(' + (bd.blur||0) + 'px) brightness(' + (100-(bd.dark||0)) + '%)';
        frame.insertBefore(bgDiv, frame.firstChild);
        }

        page.appendChild(frame);
      });
    }

    setTimeout(renderPreview, 100);

    // Preview page switch
    function switchPreview(idx) {
      currentPreviewPage = idx;
      panel.querySelector('#bfPreviewSlider').style.transform = 'translateX(' + (-idx * 50) + '%)';
      panel.querySelectorAll('.bf-preview-dot').forEach(function(d) {
        d.classList.toggle('active', parseInt(d.dataset.p) === idx);
      });
      // Update sliders
      var bd = tempBg[idx] || {};
      panel.querySelector('#bfBlur').value = bd.blur || 0;
      panel.querySelector('#bfDark').value = bd.dark || 0;
      panel.querySelector('#bfBlurVal').textContent = (bd.blur || 0) + 'px';
      panel.querySelector('#bfDarkVal').textContent = (bd.dark || 0) + '%';
    }

    panel.querySelectorAll('.bf-preview-dot').forEach(function(dot) {
      dot.addEventListener('click', function() { switchPreview(parseInt(dot.dataset.p)); });
    });

    // Swipe on preview area
    var previewArea = panel.querySelector('#bfPreviewArea');
    var psx = 0;
    previewArea.addEventListener('touchstart', function(e) { psx = e.touches[0].clientX; }, {passive:true});
    previewArea.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - psx;
      if(Math.abs(dx) > 40) {
        if(dx < 0 && currentPreviewPage < 1) switchPreview(1);
        else if(dx > 0 && currentPreviewPage > 0) switchPreview(0);
      }
    }, {passive:true});

    // Upload
    panel.querySelector('#bfBgUpload').addEventListener('click', function() { panel.querySelector('#bfBgFile').click(); });
    panel.querySelector('#bfBgFile').addEventListener('change', function(e) {
      var f = e.target.files[0]; if(!f) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var process = function(src) {
          tempBg[currentPreviewPage].src = src;
          tempBg[currentPreviewPage].blur = parseInt(panel.querySelector('#bfBlur').value);
          tempBg[currentPreviewPage].dark = parseInt(panel.querySelector('#bfDark').value);
          renderPreview();
          App.showToast('预览中，点"应用背景"保存');
        };
        if(App.cropImage) App.cropImage(ev.target.result, process);
        else process(ev.target.result);
      };
      reader.readAsDataURL(f);
      e.target.value = '';
    });

    // Sliders
    panel.querySelector('#bfBlur').addEventListener('input', function() {
      var v = parseInt(this.value);
      panel.querySelector('#bfBlurVal').textContent = v + 'px';
      tempBg[currentPreviewPage].blur = v;
      renderPreview();
    });
    panel.querySelector('#bfDark').addEventListener('input', function() {
      var v = parseInt(this.value);
      panel.querySelector('#bfDarkVal').textContent = v + '%';
      tempBg[currentPreviewPage].dark = v;
      renderPreview();
    });

    // Apply/Remove
    panel.querySelector('#bfBgApply').addEventListener('click', function() {
      var bd = tempBg[currentPreviewPage];
      if(!bd || !bd.src) { App.showToast('请先上传图片'); return; }
      var key = currentPreviewPage === 0 ? 'bgData' : 'bgData_1';
      try {
        App.LS.set(key, bd);
        Bg.applyBg(bd, currentPreviewPage);
        App.showToast('第' + (currentPreviewPage+1) + '页背景已应用');
      } catch(e) { App.showToast('图片太大，请压缩后重试'); }
    });

    panel.querySelector('#bfBgRemove').addEventListener('click', function() {
      var key = currentPreviewPage === 0 ? 'bgData' : 'bgData_1';
      App.LS.remove(key);
      tempBg[currentPreviewPage] = {};
      Bg.applyBg({}, currentPreviewPage);
      panel.querySelector('#bfBlur').value = 0;
      panel.querySelector('#bfDark').value = 0;
      panel.querySelector('#bfBlurVal').textContent = '0px';
      panel.querySelector('#bfDarkVal').textContent = '0%';
      renderPreview();
      App.showToast('背景已移除');
    });

    // Icon border
    panel.querySelector('#bfIconBorder').addEventListener('input', function() {
      iconConfig.borderW = parseFloat(this.value);
      panel.querySelector('#bfIconBorderVal').textContent = iconConfig.borderW + 'px';
      App.LS.set('topIconConfig', iconConfig);
      Bg.applyTopIconStyle(iconConfig);
    });
    panel.querySelector('#bfIconShadow').addEventListener('input', function() {
      iconConfig.shadow = parseInt(this.value);
      panel.querySelector('#bfIconShadowVal').textContent = iconConfig.shadow + 'px';
      App.LS.set('topIconConfig', iconConfig);
      Bg.applyTopIconStyle(iconConfig);
    });
    panel.querySelector('#bfColorDot').addEventListener('click', function(e) {
      e.stopPropagation();
      if(!App.openColorPicker) return;
      App.openColorPicker(iconConfig.borderColor, function(hex) {
        iconConfig.borderColor = hex; iconConfig.shadowColor = hex;
        panel.querySelector('#bfColorDot').style.background = hex;
        App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
      }, function(hex) {
        iconConfig.borderColor = hex; iconConfig.shadowColor = hex;
        panel.querySelector('#bfColorDot').style.background = hex;
        Bg.applyTopIconStyle(iconConfig);
      });
    });
    panel.querySelector('#bfResetColor').addEventListener('click', function() {
      iconConfig = { borderW: 1, shadow: 0, borderColor: '#dcebff', shadowColor: '#dcebff' };
      panel.querySelector('#bfColorDot').style.background = '#dcebff';
      panel.querySelector('#bfIconBorder').value = 1;
      panel.querySelector('#bfIconShadow').value = 0;
      panel.querySelector('#bfIconBorderVal').textContent = '1px';
      panel.querySelector('#bfIconShadowVal').textContent = '0px';
      App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
      App.showToast('已恢复默认');
    });

    // Icon grid
    Bg.renderIconGridInPanel(panel);

    // Back
    panel.querySelector('#bfBgBack').addEventListener('click', function() {
      panel.classList.remove('show'); panel.classList.add('hidden');
      setTimeout(function() { panel.remove(); }, 350);
    });

    switchPreview(0);
  },

  renderIconGridInPanel: function(panel) {
    var grid = panel.querySelector('#bfIconGrid'); if(!grid) return;
    grid.innerHTML = ICON_MAP.map(function(ic) {
      var customSrc = App.LS.get(ic.id);
      var thumbHtml = customSrc
        ? '<img src="' + App.escAttr(customSrc) + '">'
        : (DEFAULT_SVGS[ic.parentId] || '');
      return '<div class="bf-icon-item" data-icon-id="' + ic.id + '" data-parent-id="' + ic.parentId + '">' +
        '<div class="bf-icon-thumb">' + thumbHtml + '</div>' +
        '<div class="bf-icon-label">' + ic.label + '</div>' +
      '</div>';
    }).join('');

    grid.querySelectorAll('.bf-icon-item').forEach(function(item) {
      item.addEventListener('click', function() {
        Bg.showIconMenu(item.dataset.iconId, item.dataset.parentId, item, panel);
      });
    });
  },

    showIconMenu: function(iconId, parentId, itemEl, panel) {
    var menu = document.createElement('div');
    menu.className = 'bf-modal-overlay';
    menu.innerHTML =
      '<div class="bf-modal-box">' +
        '<button class="bf-modal-btn" data-act="upload" type="button">上传新图片</button>' +
        '<button class="bf-modal-btn bf-modal-btn-danger" data-act="reset" type="button">恢复默认</button>' +
        '<button class="bf-modal-btn bf-modal-btn-cancel" data-act="cancel" type="button">取消</button>' +
      '</div>';
    document.body.appendChild(menu);
    menu.addEventListener('click', function(e) { if(e.target === menu) menu.remove(); });
    menu.querySelectorAll('button').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation(); var act = btn.dataset.act; menu.remove();
        if(act === 'cancel') return;
        if(act === 'reset') {
          App.LS.remove(iconId); Bg.renderAllIcons();
          var thumb = itemEl.querySelector('.bf-icon-thumb');
          if(thumb) thumb.innerHTML = DEFAULT_SVGS[parentId] || '';
          App.showToast('已恢复');
          return;
        }
        if(act === 'upload') {
          var ipt = document.createElement('input'); ipt.type='file'; ipt.accept='image/*';
          ipt.onchange = function(ev) {
            var f = ev.target.files[0]; if(!f) return;
            var rd = new FileReader();
            rd.onload = function(r) {
              var process = function(c) {
                App.LS.set(iconId, c); Bg.renderAllIcons();
                var thumb = itemEl.querySelector('.bf-icon-thumb');
                if(thumb) thumb.innerHTML = '<img src="' + c + '">';
                App.showToast('图标已更换');
              };
              if(App.cropImage) App.cropImage(r.target.result, process); else process(r.target.result);
            };
            rd.readAsDataURL(f);
          };
          ipt.click();
        }
      });
    });
  },

  /* ====== 字体全屏 ====== */
  openFontFull: function() {
    if(App.font) App.font.open();
  },

  /* ====== 组件定义 ====== */
    openComponent: function() {
    var old = document.getElementById('bfComponentPanel');
    if(old) old.remove();

    var panel = document.createElement('div');
    panel.id = 'bfComponentPanel';
    panel.className = 'bf-component-panel';

    panel.innerHTML =
      '<div class="bf-nav">' +
        '<button class="bf-back" id="bfCompBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>' +
        '<span class="bf-nav-title">组件定义</span>' +
        '<div class="bf-nav-right"></div>' +
      '</div>' +
      '<div class="bf-comp-body">' +
        '<button class="bf-comp-reset-btn" id="bfResetLayout" type="button">恢复布局</button>' +
        '<div class="bf-comp-hint">将所有组件位置恢复到默认状态</div>' +
      '</div>';
      
    document.body.appendChild(panel);
    requestAnimationFrame(function() { panel.classList.add('show'); });
    App.bindSwipeBack(panel, function() { panel.remove(); });

    panel.querySelector('#bfCompBack').addEventListener('click', function() {
      panel.classList.remove('show'); panel.classList.add('hidden');
      setTimeout(function() { panel.remove(); }, 350);
    });

    panel.querySelector('#bfResetLayout').addEventListener('click', function() {
      App.LS.remove('wtCardPos');
      App.LS.remove('appIconOffsets');
      App.LS.remove('calTimeOffset');
      var calRow = App.$('#calTimeRow');
      if(calRow) calRow.style.transform = '';
      document.querySelectorAll('#iconUser,#iconChar,#iconTheme,#iconSettings').forEach(function(el){ el.style.transform = ''; });
      if(App.modules.cards) App.modules.cards.resetAllPositions();
      var edenData = App.LS.get('edenCard');
      if(edenData) { edenData.posX = 0; edenData.posY = 0; App.LS.set('edenCard', edenData); }
      var edenCard = App.$('#edenCard');
      if(edenCard) edenCard.style.transform = '';
      App.showToast('布局已恢复');
    });
  },

  /* ====== 悬浮样式 ====== */
  openBallStyle: function() {
    if(App.openBallSettings) App.openBallSettings();
  },

  /* ====== 排版存档 ====== */
  openSnapshot: function() {
    if(App.workshop && App.workshop.openSnapshot) App.workshop.openSnapshot();
  },

  /* ====== 渲染图标 ====== */
    renderAllIcons: function() {
    ICON_MAP.forEach(function(ic) {
      var customSrc = App.LS.get(ic.id);
      if(ic.containerId) {
        var container = document.getElementById(ic.containerId);
        if(!container) return;
        var parent = document.getElementById(ic.parentId);
        if(parent) parent.className = 'app-icon-item';
        container.className = 'app-icon-glass';
        var label = document.getElementById(ic.containerId.replace('Img','Label'));
        if(label) label.className = 'app-icon-label';
        if(customSrc) {
          container.innerHTML = '<img class="app-icon-custom-img" src="' + App.escAttr(customSrc) + '">';
        } else {
          container.innerHTML = DEFAULT_SVGS[ic.parentId] || '';
        }
      } else if(ic.selector) {
        var el = document.querySelector(ic.selector);
        if(!el) return;
        if(customSrc) {
          el.innerHTML = '<img class="app-dock-custom-img" src="' + App.escAttr(customSrc) + '">';
        } else {
          el.innerHTML = DEFAULT_SVGS[ic.parentId] || '';
        }
      }
    });

    Bg.restoreIconPositions();
    Bg.bindIconDrag();
  },

  bindIconDrag: function() {
    var DELAY = 500;
    var ids = ['iconUser', 'iconChar', 'iconTheme', 'iconSettings'];
    ids.forEach(function(id) {
      var el = document.getElementById(id);
      if(!el || el._bgDragBound) return;
      el._bgDragBound = true;
      var startX, startY, origX, origY, longPressed = false, timer, moved = false;
      el.addEventListener('touchstart', function(e) {
        var t = e.touches[0]; startX = t.clientX; startY = t.clientY; longPressed = false; moved = false;
        timer = setTimeout(function() {
          longPressed = true;
          var off = Bg._getIconOffset(id); origX = off.x; origY = off.y;
          el.style.transition = 'none'; el.style.zIndex = '999';
          if(navigator.vibrate) navigator.vibrate(15);
        }, DELAY);
      }, {passive:true});
      el.addEventListener('touchmove', function(e) {
        var t = e.touches[0];
        if(timer && !longPressed) { if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;} return; }
        if(!longPressed) return; moved=true; e.preventDefault(); e.stopPropagation();
        var nx = origX+(t.clientX-startX); var ny = origY+(t.clientY-startY);
        el.style.transform = 'translate('+nx+'px,'+ny+'px)';
      }, {passive:false});
      el.addEventListener('touchend', function(e) {
        clearTimeout(timer); timer=null; el.style.transition=''; el.style.zIndex='';
        if(longPressed && moved) { Bg._saveIconOffset(id, el); e.stopPropagation(); }
        longPressed=false; moved=false;
      });
    });
  },

  _getIconOffset: function(id) {
    var offsets = App.LS.get('appIconOffsets') || {};
    return offsets[id] || {x:0, y:0};
  },

  _saveIconOffset: function(id, el) {
    var offsets = App.LS.get('appIconOffsets') || {};
    var match = el.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
    if(match) {
      offsets[id] = {x:parseFloat(match[1]), y:parseFloat(match[2])};
      App.LS.set('appIconOffsets', offsets);
    }
  },

  restoreIconPositions: function() {
    var offsets = App.LS.get('appIconOffsets') || {};
    ['iconUser','iconChar','iconTheme','iconSettings'].forEach(function(id) {
      var el = document.getElementById(id); if(!el) return;
      var off = offsets[id];
      if(off) el.style.transform = 'translate('+off.x+'px,'+off.y+'px)';
    });
  },

  /* ====== 背景应用 ====== */
  applyBg: function(data, pageIdx) {
    if(pageIdx === 1) {
      // 第二页背景存在 bgData_1，但实际渲染需要页面切换时处理
      // 这里先存 CSS 变量或预存数据
      App.LS._bgPage1 = data;
      return;
    }
    var layer = App.$('#bgLayer'); if(!layer) return;
    if(data && data.src) {
      layer.style.backgroundImage = 'url(' + data.src + ')';
      layer.style.filter = 'blur(' + (data.blur||0) + 'px) brightness(' + (100-(data.dark||0)) + '%)';
    } else {
      layer.style.backgroundImage = '';
      layer.style.filter = '';
    }
  },

  applyTopIconStyle: function(cfg) {
    var styleId = 'topIconDynamicStyle';
    var styleEl = document.getElementById(styleId);
    if(!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
    styleEl.innerHTML = '#appIconsRow > div > div:first-child { border: ' + cfg.borderW + 'px solid ' + (cfg.borderColor||'#dcebff') + ' !important; box-shadow: ' + cfg.shadow + 'px ' + cfg.shadow + 'px 0 ' + (cfg.shadowColor||'#dcebff') + ' !important; border-radius: 15px !important; }';
  }
};

App.register('bg', Bg);
})();