
(function(){
'use strict';
var App = window.App; if(!App) return;

var BACK_BUTTON_SVG = '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3.5" fill="none"/><path d="M36 20L24 32L36 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

var DEFAULT_SVGS = {
  iconUser: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="hm1"><rect width="64" height="64" fill="white"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="black"/></mask><circle cx="32" cy="32" r="22" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#hm1)"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" stroke="#999" stroke-width="1.8" fill="none"/></svg>',
  iconChar: '<svg viewBox="-4 -4 72 72" fill="none" width="56" height="56"><mask id="archMask"><rect x="-4" y="-4" width="72" height="72" fill="white"/><path d="M21 18L23 23L28 23.5L24 27L25 32L21 29L17 32L18 27L14 23.5L19 23Z" fill="black"/><line x1="34" y1="20" x2="50" y2="20" stroke="black" stroke-width="1.8" stroke-linecap="round"/><line x1="34" y1="28" x2="46" y2="28" stroke="black" stroke-width="1.6" stroke-linecap="round"/><line x1="34" y1="36" x2="48" y2="36" stroke="black" stroke-width="1.6" stroke-linecap="round"/><line x1="14" y1="44" x2="50" y2="44" stroke="black" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="3 2"/></mask><rect x="8" y="10" width="46" height="44" rx="4" stroke="#999" stroke-width="2" fill="#999" mask="url(#archMask)"/></svg>',
  iconTheme: '<svg viewBox="-4 -4 72 72" fill="none" width="56" height="56"><mask id="pm1"><rect x="-4" y="-4" width="72" height="72" fill="white"/><circle cx="20" cy="26" r="4.5" fill="black"/><circle cx="32" cy="18" r="4.5" fill="black"/><circle cx="44" cy="26" r="4.5" fill="black"/><circle cx="22" cy="38" r="4.5" fill="black"/></mask><path d="M32 8C18.7 8 8 18.7 8 32C8 45.3 18.7 56 32 56C34.2 56 36 54.2 36 52C36 51 35.6 50.1 35 49.4C34.4 48.7 34 47.8 34 46.8C34 44.6 35.8 42.8 38 42.8H42C50.3 42.8 57 36.1 57 27.8C57 16.9 45.7 8 32 8Z" stroke="#999" stroke-width="2.2" fill="#999" mask="url(#pm1)"/><circle cx="20" cy="26" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/><circle cx="32" cy="18" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/><circle cx="44" cy="26" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/><circle cx="22" cy="38" r="4.5" stroke="#999" stroke-width="1.8" fill="none"/></svg>',
  iconSettings: '<svg viewBox="8 8 48 48" fill="none" width="56" height="56"><mask id="gm1"><rect x="8" y="8" width="48" height="48" fill="white"/><circle cx="32" cy="32" r="7" fill="black"/></mask><path d="M30 14.5H34L35 19C36.5 19.4 37.9 20 39.2 20.8L43 18L46 21L43.2 24.7C44 26 44.6 27.4 45 28.9L49.5 30V34L45 35.1C44.6 36.6 44 38 43.2 39.3L46 43L43 46L39.2 43.2C37.9 44 36.5 44.6 35 45L34 49.5H30L29 45C27.5 44.6 26.1 44 24.8 43.2L21 46L18 43L20.8 39.3C20 38 19.4 36.6 19 35.1L14.5 34V30L19 28.9C19.4 27.4 20 26 20.8 24.7L18 21L21 18L24.8 20.8C26.1 20 27.5 19.4 29 19L30 14.5Z" stroke="#999" stroke-width="2.2" stroke-linejoin="round" fill="#999" mask="url(#gm1)"/><circle cx="32" cy="32" r="7" stroke="#999" stroke-width="1.8" fill="none"/></svg>',
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

var DEF_ICON_CFG = { borderW: 0.5, shadow: 0, borderColor: '#ffffff', shadowColor: '#ffffff', iconColor: '#9ca3b0', iconBg: 'rgba(255,255,255,0.2)', blur: 8, opacity: 0.2, radius: 15, iconSize: 78 };

var Bg = {
  _panelEl: null,

  init: function() {
    if(!document.getElementById('bgInlineStyle')) {
      var bgStyle = document.createElement('style');
      bgStyle.id = 'bgInlineStyle';
      bgStyle.textContent = '#bgLayer,#bgLayer1{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;}';
      document.head.appendChild(bgStyle);
    }
    Bg.renderAllIcons();
    var bgData = App.LS.get('bgData') || {};
    Bg.applyBg(bgData, 0);
    var bgData1 = App.LS.get('bgData_1') || {};
    Bg.applyBg(bgData1, 1);
    var iconConfig = App.LS.get('topIconConfig') || JSON.parse(JSON.stringify(DEF_ICON_CFG));
    Object.keys(DEF_ICON_CFG).forEach(function(k){ if(iconConfig[k]==null) iconConfig[k]=DEF_ICON_CFG[k]; });
    if(App.LS.get('topIconConfig')) Bg.applyTopIconStyle(iconConfig);
    App.safeOn('#iconTheme', 'click', function() { Bg.openMain(); });
    App.bg = Bg;
  },

  openMain: function() {
    var old = document.getElementById('beautifyPanel');
    if(old) { old.classList.remove('hidden'); old.classList.add('show'); return; }
    var panel = document.createElement('div');
    panel.id = 'beautifyPanel';
    panel.className = 'beautify-panel';
    panel.innerHTML =
      '<div class="bf-nav">' +
        '<button class="bf-back" id="bfMainBack" type="button">' + BACK_BUTTON_SVG + '</button>' +
        '<span class="bf-nav-title">美化</span>' +
        '<div class="bf-nav-right"></div>' +
      '</div>' +
      '<div class="bf-list">' +
               '<div class="bf-list-item" data-action="theme"><svg class="bf-list-icon" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg><span class="bf-list-name">主题应用</span><svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></div>' +
        '<div class="bf-list-item" data-action="bgicon"><svg class="bf-list-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span class="bf-list-name">背景图标</span><svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></div>' +
        '<div class="bf-list-item" data-action="font"><svg class="bf-list-icon" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg><span class="bf-list-name">字体选择</span><svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></div>' +
        '<div class="bf-list-item" data-action="component"><svg class="bf-list-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg><span class="bf-list-name">组件定义</span><svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></div>' +
        '<div class="bf-list-item" data-action="ballstyle"><svg class="bf-list-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg><span class="bf-list-name">悬浮样式</span><svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></div>' +
       '<div class="bf-list-item" data-action="snapshot"><svg class="bf-list-icon" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg><span class="bf-list-name">排版存档</span><svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></div>' +
      '</div>';
    document.body.appendChild(panel);
    Bg._panelEl = panel;
    requestAnimationFrame(function() { panel.classList.add('show'); });
    App.bindSwipeBack(panel, function() { panel.classList.remove('show'); panel.classList.add('hidden'); setTimeout(function(){ panel.remove(); }, 350); });
    panel.querySelector('#bfMainBack').addEventListener('click', function() {
      panel.classList.remove('show'); panel.classList.add('hidden');
      setTimeout(function(){ panel.remove(); }, 350);
    });
    panel.querySelectorAll('.bf-list-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var action = item.dataset.action;
        if(action === 'theme') { App.showToast('主题功能开发中'); }
        else if(action === 'bgicon') { Bg.openBgIcon(); }
        else if(action === 'font') { Bg.openFontFull(); }
        else if(action === 'component') { Bg.openComponent(); }
        else if(action === 'ballstyle') { Bg.openBallStyle(); }
        else if(action === 'snapshot') { Bg.openSnapshot(); }
      });
    });
  },

  openBgIcon: function() {
    var old = document.getElementById('bfBgIconPanel');
    if(old) old.remove();
    var bgData0 = App.LS.get('bgData') || {};
    var bgData1 = App.LS.get('bgData_1') || {};
    var iconConfig = App.LS.get('topIconConfig') || JSON.parse(JSON.stringify(DEF_ICON_CFG));
    Object.keys(DEF_ICON_CFG).forEach(function(k){ if(iconConfig[k]==null) iconConfig[k]=DEF_ICON_CFG[k]; });
    var currentPreviewPage = 0;
    var tempBg = [JSON.parse(JSON.stringify(bgData0)), JSON.parse(JSON.stringify(bgData1))];
    var panel = document.createElement('div');
    panel.id = 'bfBgIconPanel';
    panel.className = 'bf-sub-panel';
    panel.innerHTML =
      '<div class="bf-nav">' +
        '<button class="bf-back" id="bfBgBack" type="button">' + BACK_BUTTON_SVG + '</button>' +
        '<span class="bf-nav-title">背景图标</span>' +
        '<div class="bf-nav-right"></div>' +
      '</div>' +
      '<div class="bf-scroll-body">' +
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
            '<button class="bf-btn active" id="bfBgApply" type="button">应用背景</button>' +
            '<button class="bf-btn" id="bfBgRemove" type="button">移除背景</button>' +
          '</div>' +
          '<div class="bf-divider"></div>' +
          '<div class="bf-section-title">图标样式</div>' +
          '<div class="bf-icon-preview" id="bfIconPreview"></div>' +
                    '<div class="bf-color-row">' +
            '<div class="bf-color-item"><div class="bf-color-dot" id="bfIconColorDot" style="background:' + iconConfig.iconColor + ';"></div><span class="bf-color-dot-label">图案</span></div>' +
            '<div class="bf-color-item"><div class="bf-color-dot" id="bfIconBgDot" style="background:' + iconConfig.iconBg + ';"></div><span class="bf-color-dot-label">背景</span></div>' +
            '<div class="bf-color-item"><div class="bf-color-dot" id="bfColorDot" style="background:' + iconConfig.borderColor + ';"></div><span class="bf-color-dot-label">边框</span></div>' +
            '<button class="bf-reset-btn" id="bfResetColor" type="button">恢复默认</button>' +
          '</div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">毛玻璃</span><input type="range" id="bfIconBlur" min="0" max="30" step="1" value="' + iconConfig.blur + '"><span class="bf-ctrl-val" id="bfIconBlurVal">' + iconConfig.blur + 'px</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">透明度</span><input type="range" id="bfIconOpacity" min="0" max="1" step="0.05" value="' + iconConfig.opacity + '"><span class="bf-ctrl-val" id="bfIconOpacityVal">' + Math.round(iconConfig.opacity * 100) + '%</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">边框</span><input type="range" id="bfIconBorder" min="0" max="6" step="0.5" value="' + iconConfig.borderW + '"><span class="bf-ctrl-val" id="bfIconBorderVal">' + iconConfig.borderW + 'px</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">阴影</span><input type="range" id="bfIconShadow" min="0" max="16" step="1" value="' + iconConfig.shadow + '"><span class="bf-ctrl-val" id="bfIconShadowVal">' + iconConfig.shadow + 'px</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">圆角</span><input type="range" id="bfIconRadius" min="0" max="50" step="1" value="' + iconConfig.radius + '"><span class="bf-ctrl-val" id="bfIconRadiusVal">' + iconConfig.radius + 'px</span></div>' +
                    '<div class="bf-ctrl-row"><span class="bf-ctrl-label">图标大小</span><input type="range" id="bfIconSize" min="50" max="120" step="1" value="' + (iconConfig.iconSize||80) + '"><span class="bf-ctrl-val" id="bfIconSizeVal">' + (iconConfig.iconSize||80) + 'px</span></div>' +
          '<div class="bf-divider"></div>' +
                   '<div class="bf-section-header"><span class="bf-section-title">替换图标</span><button class="bf-reset-btn" id="bfResetIcons" type="button">全部恢复</button></div>' +
          '<div class="bf-icon-grid" id="bfIconGrid"></div>' +
                    '<div class="bf-bottom-spacer"></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(panel);
    requestAnimationFrame(function() { panel.classList.add('show'); });
    App.bindSwipeBack(panel, function() { panel.remove(); });

    // === renderPreview ===
    function renderPreview() {
      var area = panel.querySelector('#bfPreviewArea');
      var areaW = area.offsetWidth;
      var scale = areaW / window.innerWidth;
      var scaledHeight = window.innerHeight * scale;
      area.style.height = scaledHeight + 'px';
      [0, 1].forEach(function(idx) {
        var page = panel.querySelector('#bfPreviewPage' + idx);
        page.innerHTML = '';
        var frame = document.createElement('div');
        frame.className = 'bf-preview-frame';
        frame.style.transform = 'scale(' + scale + ')';
        frame.style.width = window.innerWidth + 'px';
        frame.style.height = window.innerHeight + 'px';
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
        var fixedEls = ['#dockBar', '.screen-indicators'];
        fixedEls.forEach(function(sel) {
          var src = document.querySelector(sel);
          if(src) {
            var fc = src.cloneNode(true);
            fc.style.position = 'absolute';
            fc.style.zIndex = '100';
            var rect = src.getBoundingClientRect();
            fc.style.left = rect.left + 'px';
            fc.style.top = rect.top + 'px';
            fc.style.width = rect.width + 'px';
            fc.style.bottom = 'auto';
            fc.style.right = 'auto';
            fc.style.transform = 'none';
            frame.appendChild(fc);
          }
        });
        var bd = tempBg[idx];
        if(!bd || !bd.src) { if(idx === 1) bd = tempBg[0]; }
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

    // === Icon preview ===
                function renderIconPreview() {
      var prev = panel.querySelector('#bfIconPreview');
      if(!prev) return;
      var bd = tempBg[currentPreviewPage];
      if(!bd || !bd.src) bd = tempBg[0];
      var html = '<div class="bf-icon-preview-wrap">' +
        '<div class="bf-icon-preview-bg" id="bfIconPreviewBg"></div>' +
        '<div class="bf-icon-preview-row">';
      ['iconUser','iconChar','iconTheme','iconSettings'].forEach(function(pid) {
        html += '<div class="bf-icon-preview-item">' + (DEFAULT_SVGS[pid] || '') + '</div>';
      });
      html += '</div></div>';
      prev.innerHTML = html;
      // 背景只需要动态设置图片和滤镜
      var bgEl = panel.querySelector('#bfIconPreviewBg');
      if(bgEl && bd && bd.src) {
        bgEl.style.backgroundImage = 'url(' + bd.src + ')';
        bgEl.style.filter = 'blur(' + (bd.blur||0) + 'px) brightness(' + (100-(bd.dark||0)) + '%)';
      }
    }
    renderIconPreview();

    // === Preview page switch ===
    function switchPreview(idx) {
      currentPreviewPage = idx;
      panel.querySelector('#bfPreviewSlider').style.transform = 'translateX(' + (-idx * 50) + '%)';
      panel.querySelectorAll('.bf-preview-dot').forEach(function(d) {
        d.classList.toggle('active', parseInt(d.dataset.p) === idx);
      });
      var bd = tempBg[idx] || {};
      panel.querySelector('#bfBlur').value = bd.blur || 0;
      panel.querySelector('#bfDark').value = bd.dark || 0;
      panel.querySelector('#bfBlurVal').textContent = (bd.blur || 0) + 'px';
      panel.querySelector('#bfDarkVal').textContent = (bd.dark || 0) + '%';
    }
    panel.querySelectorAll('.bf-preview-dot').forEach(function(dot) {
      dot.addEventListener('click', function() { switchPreview(parseInt(dot.dataset.p)); });
    });
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

    // === Background upload/apply/remove ===
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
    panel.querySelector('#bfBgApply').addEventListener('click', function() {
      var bd = tempBg[currentPreviewPage];
      if(!bd || !bd.src) { App.showToast('请先上传图片'); return; }
      var key = currentPreviewPage === 0 ? 'bgData' : 'bgData_1';
      try { App.LS.set(key, bd); Bg.applyBg(bd, currentPreviewPage); App.showToast('第' + (currentPreviewPage+1) + '页背景已应用'); }
      catch(e) { App.showToast('图片太大，请压缩后重试'); }
    });
    panel.querySelector('#bfBgRemove').addEventListener('click', function() {
      var key = currentPreviewPage === 0 ? 'bgData' : 'bgData_1';
      App.LS.remove(key);
      tempBg[currentPreviewPage] = {};
      Bg.applyBg(null, currentPreviewPage);
      panel.querySelector('#bfBlur').value = 0;
      panel.querySelector('#bfDark').value = 0;
      panel.querySelector('#bfBlurVal').textContent = '0px';
      panel.querySelector('#bfDarkVal').textContent = '0%';
      if(currentPreviewPage === 1 && tempBg[0].src) { tempBg[1] = JSON.parse(JSON.stringify(tempBg[0])); }
      renderPreview();
      App.showToast('背景已移除');
    });

    // === Icon style controls ===
    panel.querySelector('#bfIconColorDot').addEventListener('click', function(e) {
      e.stopPropagation(); if(!App.openColorPicker) return;
      App.openColorPicker(iconConfig.iconColor, function(hex) {
        iconConfig.iconColor = hex; panel.querySelector('#bfIconColorDot').style.background = hex;
        App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig); renderIconPreview();
      }, function(hex) {
        iconConfig.iconColor = hex; panel.querySelector('#bfIconColorDot').style.background = hex;
        Bg.applyTopIconStyle(iconConfig); renderIconPreview();
      });
    });
    panel.querySelector('#bfIconBgDot').addEventListener('click', function(e) {
      e.stopPropagation(); if(!App.openColorPicker) return;
      App.openColorPicker(iconConfig.iconBg, function(hex) {
        iconConfig.iconBg = hex; panel.querySelector('#bfIconBgDot').style.background = hex;
        App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig); renderIconPreview();
      }, function(hex) {
        iconConfig.iconBg = hex; panel.querySelector('#bfIconBgDot').style.background = hex;
        Bg.applyTopIconStyle(iconConfig); renderIconPreview();
      });
    });
    panel.querySelector('#bfIconBlur').addEventListener('input', function() {
      iconConfig.blur = parseInt(this.value);
      panel.querySelector('#bfIconBlurVal').textContent = iconConfig.blur + 'px';
      App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
    });
    panel.querySelector('#bfIconOpacity').addEventListener('input', function() {
      iconConfig.opacity = parseFloat(this.value);
      panel.querySelector('#bfIconOpacityVal').textContent = Math.round(iconConfig.opacity * 100) + '%';
      App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
    });
    panel.querySelector('#bfIconBorder').addEventListener('input', function() {
      iconConfig.borderW = parseFloat(this.value);
      panel.querySelector('#bfIconBorderVal').textContent = iconConfig.borderW + 'px';
      App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
    });
    panel.querySelector('#bfIconShadow').addEventListener('input', function() {
      iconConfig.shadow = parseInt(this.value);
      panel.querySelector('#bfIconShadowVal').textContent = iconConfig.shadow + 'px';
      App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
    });
    panel.querySelector('#bfIconRadius').addEventListener('input', function() {
      iconConfig.radius = parseInt(this.value);
      panel.querySelector('#bfIconRadiusVal').textContent = iconConfig.radius + 'px';
      App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
    });
        panel.querySelector('#bfIconSize').addEventListener('input', function() {
      iconConfig.iconSize = parseInt(this.value);
      panel.querySelector('#bfIconSizeVal').textContent = iconConfig.iconSize + 'px';
      App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig);
    });
    panel.querySelector('#bfColorDot').addEventListener('click', function(e) {
      e.stopPropagation(); if(!App.openColorPicker) return;
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
      iconConfig = JSON.parse(JSON.stringify(DEF_ICON_CFG));
      panel.querySelector('#bfColorDot').style.background = DEF_ICON_CFG.borderColor;
      panel.querySelector('#bfIconColorDot').style.background = DEF_ICON_CFG.iconColor;
      panel.querySelector('#bfIconBgDot').style.background = DEF_ICON_CFG.iconBg;
      panel.querySelector('#bfIconBorder').value = DEF_ICON_CFG.borderW;
      panel.querySelector('#bfIconShadow').value = DEF_ICON_CFG.shadow;
      panel.querySelector('#bfIconRadius').value = DEF_ICON_CFG.radius;
      panel.querySelector('#bfIconBlur').value = DEF_ICON_CFG.blur;
      panel.querySelector('#bfIconOpacity').value = DEF_ICON_CFG.opacity;
      panel.querySelector('#bfIconBorderVal').textContent = DEF_ICON_CFG.borderW + 'px';
      panel.querySelector('#bfIconShadowVal').textContent = DEF_ICON_CFG.shadow + 'px';
      panel.querySelector('#bfIconRadiusVal').textContent = DEF_ICON_CFG.radius + 'px';
      panel.querySelector('#bfIconBlurVal').textContent = DEF_ICON_CFG.blur + 'px';
      panel.querySelector('#bfIconOpacityVal').textContent = '100%';
            panel.querySelector('#bfIconSize').value = DEF_ICON_CFG.iconSize;
      panel.querySelector('#bfIconSizeVal').textContent = DEF_ICON_CFG.iconSize + 'px';
      App.LS.set('topIconConfig', iconConfig); Bg.applyTopIconStyle(iconConfig); renderIconPreview();
      App.showToast('已恢复默认');
    });

    // === Reset all icons ===
    panel.querySelector('#bfResetIcons').addEventListener('click', function() {
      ICON_MAP.forEach(function(ic) { App.LS.remove(ic.id); });
      Bg.renderAllIcons();
      Bg.renderIconGridInPanel(panel);
      renderIconPreview();
      App.showToast('图标已全部恢复');
    });

    Bg.renderIconGridInPanel(panel);

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
      var thumbHtml = customSrc ? '<img src="' + App.escAttr(customSrc) + '">' : (DEFAULT_SVGS[ic.parentId] || '');
      return '<div class="bf-icon-item" data-icon-id="' + ic.id + '" data-parent-id="' + ic.parentId + '"><div class="bf-icon-thumb">' + thumbHtml + '</div><div class="bf-icon-label">' + ic.label + '</div></div>';
    }).join('');
    grid.querySelectorAll('.bf-icon-item').forEach(function(item) {
      item.addEventListener('click', function() { Bg.showIconMenu(item.dataset.iconId, item.dataset.parentId, item, panel); });
    });
  },

  showIconMenu: function(iconId, parentId, itemEl, panel) {
    var menu = document.createElement('div');
    menu.className = 'bf-modal-overlay';
    menu.innerHTML = '<div class="bf-modal-box"><button class="bf-modal-btn" data-act="upload" type="button">上传新图片</button><button class="bf-modal-btn bf-modal-btn-danger" data-act="reset" type="button">恢复默认</button><button class="bf-modal-btn bf-modal-btn-cancel" data-act="cancel" type="button">取消</button></div>';
    document.body.appendChild(menu);
    menu.addEventListener('click', function(e) { if(e.target === menu) menu.remove(); });
    menu.querySelectorAll('button').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation(); var act = btn.dataset.act; menu.remove();
        if(act === 'cancel') return;
        if(act === 'reset') { App.LS.remove(iconId); Bg.renderAllIcons(); var thumb = itemEl.querySelector('.bf-icon-thumb'); if(thumb) thumb.innerHTML = DEFAULT_SVGS[parentId] || ''; App.showToast('已恢复'); return; }
        if(act === 'upload') {
          var ipt = document.createElement('input'); ipt.type='file'; ipt.accept='image/*';
          ipt.onchange = function(ev) {
            var f = ev.target.files[0]; if(!f) return;
            var rd = new FileReader();
            rd.onload = function(r) {
              var process = function(c) { App.LS.set(iconId, c); Bg.renderAllIcons(); var thumb = itemEl.querySelector('.bf-icon-thumb'); if(thumb) thumb.innerHTML = '<img src="' + c + '">'; App.showToast('图标已更换'); };
              if(App.cropImage) App.cropImage(r.target.result, process); else process(r.target.result);
            };
            rd.readAsDataURL(f);
          };
          ipt.click();
        }
      });
    });
  },

  openFontFull: function() { if(App.font) App.font.open(); },

  openComponent: function() {
  var old = document.getElementById('bfComponentPanel'); 
  if(old) old.remove();
  
  var panel = document.createElement('div');
  panel.id = 'bfComponentPanel'; 
  panel.className = 'bf-component-panel';
  
  // 正确的 HTML：只有恢复布局按钮，不要复制 openMain 的列表
  panel.innerHTML =
    '<div class="beautify-container">' +
      '<div class="bf-nav">' +
        '<button class="bf-back" id="bfCompBack" type="button">' + BACK_BUTTON_SVG + '</button>' +
        '<span class="bf-nav-title">组件定义</span>' +
        '<div class="bf-nav-right"></div>' +
      '</div>' +
      '<div class="bf-comp-body">' +
        '<button class="bf-comp-reset-btn" id="bfResetLayout" type="button">恢复布局</button>' +
        '<div class="bf-comp-hint">将所有组件位置恢复到默认状态</div>' +
      '</div>' +
    '</div>';
  
  document.body.appendChild(panel);
  requestAnimationFrame(function() { panel.classList.add('show'); });
  App.bindSwipeBack(panel, function() { panel.remove(); });
  
  // 注意：这里查找的是 bfCompBack，与上面的 id 匹配
  panel.querySelector('#bfCompBack').addEventListener('click', function() { 
    panel.classList.remove('show'); 
    panel.classList.add('hidden'); 
    setTimeout(function() { panel.remove(); }, 350); 
  });
  
  panel.querySelector('#bfResetLayout').addEventListener('click', function() {
    App.LS.remove('wtCardPos'); 
    App.LS.remove('appIconOffsets'); 
    App.LS.remove('calTimeOffset');
    var calRow = App.$('#calTimeRow'); 
    if(calRow) calRow.style.transform = '';
    document.querySelectorAll('#iconUser,#iconChar,#iconTheme,#iconSettings').forEach(function(el){ 
      el.style.transform = ''; 
    });
    if(App.modules.cards) App.modules.cards.resetAllPositions();
    var edenData = App.LS.get('edenCard'); 
    if(edenData) { 
      edenData.posX = 0; 
      edenData.posY = 0; 
      App.LS.set('edenCard', edenData); 
    }
    var edenCard = App.$('#edenCard'); 
    if(edenCard) edenCard.style.transform = '';
    App.showToast('布局已恢复');
  });
},

  openBallStyle: function() { if(App.openBallSettings) App.openBallSettings(); },
  openSnapshot: function() { if(App.workshop && App.workshop.openSnapshot) App.workshop.openSnapshot(); },

  renderAllIcons: function() {
    ICON_MAP.forEach(function(ic) {
      var customSrc = App.LS.get(ic.id);
      if(ic.containerId) {
        var container = document.getElementById(ic.containerId); if(!container) return;
        var parent = document.getElementById(ic.parentId);
        if(parent) parent.className = 'app-icon-item';
        container.className = 'app-icon-glass';
        var label = document.getElementById(ic.containerId.replace('Img','Label'));
        if(label) label.className = 'app-icon-label';
        if(customSrc) { container.innerHTML = '<img class="app-icon-custom-img" src="' + App.escAttr(customSrc) + '">'; }
        else { container.innerHTML = DEFAULT_SVGS[ic.parentId] || ''; }
      } else if(ic.selector) {
        var el = document.querySelector(ic.selector); if(!el) return;
        if(customSrc) { el.innerHTML = '<img class="app-dock-custom-img" src="' + App.escAttr(customSrc) + '">'; }
        else { el.innerHTML = DEFAULT_SVGS[ic.parentId] || ''; }
      }
    });
    Bg.restoreIconPositions();
    Bg.bindIconDrag();
  },

  bindIconDrag: function() {
    var DELAY = 500;
    ['iconUser','iconChar','iconTheme','iconSettings'].forEach(function(id) {
      var el = document.getElementById(id); if(!el || el._bgDragBound) return;
      el._bgDragBound = true;
      var startX, startY, origX, origY, longPressed = false, timer, moved = false;
      el.addEventListener('touchstart', function(e) {
        var t = e.touches[0]; startX = t.clientX; startY = t.clientY; longPressed = false; moved = false;
        timer = setTimeout(function() { longPressed = true; var off = Bg._getIconOffset(id); origX = off.x; origY = off.y; el.style.transition = 'none'; el.style.zIndex = '999'; if(navigator.vibrate) navigator.vibrate(15); }, DELAY);
      }, {passive:true});
      el.addEventListener('touchmove', function(e) {
        var t = e.touches[0];
        if(timer && !longPressed) { if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;} return; }
        if(!longPressed) return; moved=true; e.preventDefault(); e.stopPropagation();
        el.style.transform = 'translate('+(origX+(t.clientX-startX))+'px,'+(origY+(t.clientY-startY))+'px)';
      }, {passive:false});
      el.addEventListener('touchend', function(e) {
        clearTimeout(timer); timer=null; el.style.transition=''; el.style.zIndex='';
        if(longPressed && moved) { Bg._saveIconOffset(id, el); e.stopPropagation(); }
        longPressed=false; moved=false;
      });
    });
  },

  _getIconOffset: function(id) { var offsets = App.LS.get('appIconOffsets') || {}; return offsets[id] || {x:0, y:0}; },
  _saveIconOffset: function(id, el) {
    var offsets = App.LS.get('appIconOffsets') || {};
    var match = el.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
    if(match) { offsets[id] = {x:parseFloat(match[1]), y:parseFloat(match[2])}; App.LS.set('appIconOffsets', offsets); }
  },
  restoreIconPositions: function() {
    var offsets = App.LS.get('appIconOffsets') || {};
    ['iconUser','iconChar','iconTheme','iconSettings'].forEach(function(id) {
      var el = document.getElementById(id); if(!el) return;
      var off = offsets[id]; if(off) el.style.transform = 'translate('+off.x+'px,'+off.y+'px)';
    });
  },

  applyBg: function(data, pageIdx) {
    var id = pageIdx === 1 ? 'bgLayer1' : 'bgLayer';
    var layer = document.getElementById(id); if(!layer) return;
    if(data && data.src) {
      layer.style.backgroundImage = 'url(' + data.src + ')';
      layer.style.filter = 'blur(' + (data.blur||0) + 'px) brightness(' + (100-(data.dark||0)) + '%)';
    } else {
      if(pageIdx === 1) {
        var page0 = App.LS.get('bgData') || {};
        if(page0.src) { layer.style.backgroundImage = 'url(' + page0.src + ')'; layer.style.filter = 'blur(' + (page0.blur||0) + 'px) brightness(' + (100-(page0.dark||0)) + '%)'; }
        else { layer.style.backgroundImage = ''; layer.style.filter = ''; }
      } else {
        layer.style.backgroundImage = ''; layer.style.filter = '';
        var page1Data = App.LS.get('bgData_1') || {};
        if(!page1Data.src) { Bg.applyBg(null, 1); }
      }
    }
  },

      applyTopIconStyle: function(cfg) {
    var styleId = 'topIconDynamicStyle';
    var styleEl = document.getElementById(styleId);
    if(!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
    var radius = cfg.radius != null ? cfg.radius : 15;
    var blur = cfg.blur != null ? cfg.blur : 12;
    var opacity = cfg.opacity != null ? cfg.opacity : 1;
    var iconBg = cfg.iconBg || 'rgba(255,255,255,0.25)';
    var iconColor = cfg.iconColor || '#999999';
    var iconSize = cfg.iconSize != null ? cfg.iconSize : 42;

    // 背景色处理：渐变走 opacity 属性，纯色走 rgba alpha
    var bgWithOpacity = iconBg;
    var useOpacityProp = false;
        if(iconBg.indexOf('gradient') >= 0) {
      bgWithOpacity = 'transparent';
      useOpacityProp = false;
    } else {
      var r=255, g=255, b=255, a=1;
      var m = iconBg.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
      if(m) { r=parseInt(m[1]); g=parseInt(m[2]); b=parseInt(m[3]); a=m[4]!=null?parseFloat(m[4]):1; }
      else { var hex=iconBg.replace('#',''); if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; if(hex.length>=6){r=parseInt(hex.substr(0,2),16);g=parseInt(hex.substr(2,2),16);b=parseInt(hex.substr(4,2),16);} a=1; }
      bgWithOpacity = 'rgba('+r+','+g+','+b+','+(a*opacity).toFixed(3)+')';
    }

    // 容器样式
    var containerCSS =
      '#appIconsRow > div > div:first-child, .bf-icon-preview-item {' +
        'border: '+cfg.borderW+'px solid '+(cfg.borderColor||'#ffffff')+' !important;' +
        'box-shadow: '+cfg.shadow+'px '+cfg.shadow+'px 0 '+(cfg.shadowColor||'#ffffff')+' !important;' +
        'border-radius: '+radius+'px !important;' +
        'background: '+bgWithOpacity+' !important;' +
        'backdrop-filter: blur('+blur+'px) !important;' +
        '-webkit-backdrop-filter: blur('+blur+'px) !important;' +
        (useOpacityProp ? 'opacity: '+opacity+' !important;' : '') +
      '}';

    // 渐变背景层（用 ::before，这样透明度只影响背景不影响图案）
    var gradBgCSS = '';
    if(iconBg.indexOf('gradient') >= 0) {
      var sel1 = '#appIconsRow > div > div:first-child';
      var sel2 = '.bf-icon-preview-item';
      gradBgCSS =
        sel1+','+sel2+' { position: relative; }' +
                sel1+'::before,'+sel2+'::before {' +
          'content: "";' +
          'position: absolute;' +
          'inset: -1px;' +
          'background: '+iconBg+';' +
          'border-radius: inherit;' +
          'opacity: '+opacity+';' +
          'pointer-events: none;' +
          'z-index: 0;' +
        '}' +
        sel1+' svg,'+sel2+' svg { position: relative; z-index: 1; }';
    }
    
                // 图标容器尺寸 + SVG 自适应
    var svgCSS =
      '#appIconsRow > div > div:first-child {' +
        'width: '+iconSize+'px !important; height: '+iconSize+'px !important;' +
      '}' +
      '#appIconsRow > div > div:first-child svg,' +
      '.bf-icon-preview-item svg {' +
        'width: 55% !important; height: 55% !important;' +
      '}' +
      '.bf-icon-preview-item {' +
        'width: '+iconSize+'px !important; height: '+iconSize+'px !important;' +
      '}';

           // 图标颜色（渐变不支持 stroke，跳过）
    var iconColorCSS = '';
    if(iconColor.indexOf('gradient') === -1) {
      var s1 = '#appIconsRow > div > div:first-child svg > ';
      var s2 = '.bf-icon-preview-item svg > ';
      iconColorCSS =
        s1+'path,'+s1+'circle,'+s1+'rect,'+s1+'line,'+s1+'ellipse,' +
        s2+'path,'+s2+'circle,'+s2+'rect,'+s2+'line,'+s2+'ellipse {' +
          'stroke: '+iconColor+' !important;' +
        '}' +
        s1+'[mask],'+s2+'[mask] { fill: '+iconColor+' !important; }' +
        s1+'path:not([mask]),'+s2+'path:not([mask]) { fill: none !important; }';
    }

    // mask 保护
    var maskCSS =
      '#appIconsRow > div > div:first-child svg mask > rect:first-child,' +
      '.bf-icon-preview-item svg mask > rect:first-child { fill: white !important; stroke: none !important; }' +
      '#appIconsRow > div > div:first-child svg mask > *:not(rect:first-child),' +
      '.bf-icon-preview-item svg mask > *:not(rect:first-child) { fill: black !important; stroke: black !important; }';

        styleEl.innerHTML = containerCSS + gradBgCSS + svgCSS + iconColorCSS + maskCSS;
  }
};

App.register('bg', Bg);
})();

