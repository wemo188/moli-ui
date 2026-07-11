
(function(){
'use strict';
var App = window.App; if(!App) return;

var BACK_BUTTON_SVG = '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3.5" fill="none"/><path d="M36 20L24 32L36 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

var DEFAULT_SVGS = {
  iconUser: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="hm1"><rect width="64" height="64" fill="white"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="black"/></mask><circle cx="32" cy="32" r="22" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#hm1)"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" stroke="#9ca3b0" stroke-width="1.8" fill="none"/></svg>',
  iconChar: '<svg viewBox="-4 -4 72 72" fill="none" width="56" height="56"><mask id="archMask"><rect x="-4" y="-4" width="72" height="72" fill="white"/><path d="M21 18L23 23L28 23.5L24 27L25 32L21 29L17 32L18 27L14 23.5L19 23Z" fill="black"/><line x1="34" y1="20" x2="50" y2="20" stroke="black" stroke-width="1.8" stroke-linecap="round"/><line x1="34" y1="28" x2="46" y2="28" stroke="black" stroke-width="1.6" stroke-linecap="round"/><line x1="34" y1="36" x2="48" y2="36" stroke="black" stroke-width="1.6" stroke-linecap="round"/><line x1="14" y1="44" x2="50" y2="44" stroke="black" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="3 2"/></mask><rect x="8" y="10" width="46" height="44" rx="4" stroke="#9ca3b0" stroke-width="2" fill="#9ca3b0" mask="url(#archMask)"/></svg>',
  iconTheme: '<svg viewBox="-4 -4 72 72" fill="none" width="56" height="56"><mask id="pm1"><rect x="-4" y="-4" width="72" height="72" fill="white"/><circle cx="20" cy="26" r="4.5" fill="black"/><circle cx="32" cy="18" r="4.5" fill="black"/><circle cx="44" cy="26" r="4.5" fill="black"/><circle cx="22" cy="38" r="4.5" fill="black"/></mask><path d="M32 8C18.7 8 8 18.7 8 32C8 45.3 18.7 56 32 56C34.2 56 36 54.2 36 52C36 51 35.6 50.1 35 49.4C34.4 48.7 34 47.8 34 46.8C34 44.6 35.8 42.8 38 42.8H42C50.3 42.8 57 36.1 57 27.8C57 16.9 45.7 8 32 8Z" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#pm1)"/><circle cx="20" cy="26" r="4.5" stroke="#9ca3b0" stroke-width="1.8" fill="none"/><circle cx="32" cy="18" r="4.5" stroke="#9ca3b0" stroke-width="1.8" fill="none"/><circle cx="44" cy="26" r="4.5" stroke="#9ca3b0" stroke-width="1.8" fill="none"/><circle cx="22" cy="38" r="4.5" stroke="#9ca3b0" stroke-width="1.8" fill="none"/></svg>',
  iconSettings: '<svg viewBox="8 8 48 48" fill="none" width="56" height="56"><mask id="gm1"><rect x="8" y="8" width="48" height="48" fill="white"/><circle cx="32" cy="32" r="7" fill="black"/></mask><path d="M30 14.5H34L35 19C36.5 19.4 37.9 20 39.2 20.8L43 18L46 21L43.2 24.7C44 26 44.6 27.4 45 28.9L49.5 30V34L45 35.1C44.6 36.6 44 38 43.2 39.3L46 43L43 46L39.2 43.2C37.9 44 36.5 44.6 35 45L34 49.5H30L29 45C27.5 44.6 26.1 44 24.8 43.2L21 46L18 43L20.8 39.3C20 38 19.4 36.6 19 35.1L14.5 34V30L19 28.9C19.4 27.4 20 26 20.8 24.7L18 21L21 18L24.8 20.8C26.1 20 27.5 19.4 29 19L30 14.5Z" stroke="#9ca3b0" stroke-width="2.2" stroke-linejoin="round" fill="#9ca3b0" mask="url(#gm1)"/><circle cx="32" cy="32" r="7" stroke="#9ca3b0" stroke-width="1.8" fill="none"/></svg>',
  iconPuzzle: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="pzM1"><rect width="64" height="64" fill="white"/></mask><rect x="12" y="12" width="18" height="18" rx="3" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#pzM1)"/><rect x="34" y="12" width="18" height="18" rx="3" stroke="#9ca3b0" stroke-width="2.2" fill="none"/><rect x="12" y="34" width="18" height="18" rx="3" stroke="#9ca3b0" stroke-width="2.2" fill="none"/><rect x="34" y="34" width="18" height="18" rx="3" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#pzM1)"/></svg>',
  iconTetris: '<svg viewBox="0 0 64 64" fill="none" width="56" height="56"><mask id="tm1"><rect width="64" height="64" fill="white"/></mask><rect x="14" y="32" width="10" height="10" rx="2" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#tm1)"/><rect x="26" y="32" width="10" height="10" rx="2" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#tm1)"/><rect x="38" y="32" width="10" height="10" rx="2" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#tm1)"/><rect x="26" y="20" width="10" height="10" rx="2" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#tm1)"/></svg>',
  dockChat: '<svg viewBox="0 0 64 64" fill="none" width="40" height="40"><mask id="cm1"><rect width="64" height="64" fill="white"/><line x1="23" y1="27.5" x2="41" y2="27.5" stroke="black" stroke-width="4" stroke-linecap="round"/><line x1="23" y1="34.5" x2="35" y2="34.5" stroke="black" stroke-width="4" stroke-linecap="round"/></mask><path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#cm1)"/></svg>',
  dockStory: '<svg viewBox="0 0 64 64" fill="none" width="32" height="32"><mask id="sm1"><rect width="64" height="64" fill="white"/><path d="M33 20L40 29L33 38L26 29Z" fill="black"/><circle cx="33" cy="29" r="3" fill="black"/></mask><rect x="14" y="6" width="38" height="46" rx="4" fill="#9ca3b0" mask="url(#sm1)"/><line x1="10" y1="10" x2="10" y2="48" stroke="#9ca3b0" stroke-width="2.2" stroke-linecap="round"/><line x1="10" y1="10" x2="14" y2="10" stroke="#9ca3b0" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="48" x2="14" y2="48" stroke="#9ca3b0" stroke-width="2" stroke-linecap="round"/><path d="M33 20L40 29L33 38L26 29Z" stroke="#9ca3b0" stroke-width="1.6" stroke-linejoin="round" fill="none"/><circle cx="33" cy="29" r="3" stroke="#9ca3b0" stroke-width="1.4" fill="none"/><path d="M10 52H52" stroke="#aaa" stroke-width="1.4" stroke-linecap="round"/><path d="M10 55H52" stroke="#bbb" stroke-width="1.2" stroke-linecap="round"/><path d="M10 58H52" stroke="#ccc" stroke-width="1" stroke-linecap="round"/></svg>',
  dockCheckin: '<svg viewBox="0 0 64 64" fill="none" width="38" height="38"><mask id="ck1"><rect width="64" height="64" fill="white"/><rect x="21" y="18" width="22" height="28" rx="1.5" fill="black"/><circle cx="32" cy="50" r="2.5" fill="black"/></mask><rect x="18" y="10" width="28" height="44" rx="4" fill="#9ca3b0" mask="url(#ck1)"/><line x1="28" y1="13" x2="36" y2="13" stroke="#9ca3b0" stroke-width="1.6" stroke-linecap="round"/><rect x="21" y="18" width="22" height="28" rx="1.5" fill="none" stroke="#9ca3b0" stroke-width="1.4"/><circle cx="32" cy="50" r="2.5" stroke="#9ca3b0" stroke-width="1.5" fill="none"/><line x1="24" y1="23" x2="40" y2="23" stroke="#9ca3b0" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="28" x2="35" y2="28" stroke="#9ca3b0" stroke-width="1.2" stroke-linecap="round"/><line x1="24" y1="33" x2="39" y2="33" stroke="#9ca3b0" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="38" x2="33" y2="38" stroke="#9ca3b0" stroke-width="1.2" stroke-linecap="round"/></svg>',
  dockForum: '<svg viewBox="0 0 64 64" fill="none" width="40" height="40"><mask id="em1"><rect width="64" height="64" fill="white"/><ellipse cx="32" cy="32" rx="7" ry="18" stroke="black" stroke-width="1.4" fill="none"/><path d="M14 26H50" stroke="black" stroke-width="1.2"/><path d="M16 38H48" stroke="black" stroke-width="1.2"/></mask><circle cx="32" cy="32" r="18" stroke="#9ca3b0" stroke-width="2.2" fill="#9ca3b0" mask="url(#em1)"/><ellipse cx="32" cy="32" rx="28" ry="10" stroke="#9ca3b0" stroke-width="1.8" fill="none" transform="rotate(-20 32 32)"/><circle cx="52" cy="20" r="3" fill="#9ca3b0" stroke="#9ca3b0" stroke-width="1.4"/></svg>'
};

var ICON_MAP = [
  { id: 'customIcon_user', label: 'User', containerId: 'iconUserImg', parentId: 'iconUser' },
  { id: 'customIcon_char', label: 'Char', containerId: 'iconCharImg', parentId: 'iconChar' },
  { id: 'customIcon_theme', label: '美化工坊', containerId: 'iconThemeImg', parentId: 'iconTheme' },
  { id: 'customIcon_settings', label: '设置', containerId: 'iconSettingsImg', parentId: 'iconSettings' },
  { id: 'customIcon_puzzle', label: '拼图', containerId: 'iconPuzzleImg', parentId: 'iconPuzzle' },
  { id: 'customIcon_tetris', label: '方块', containerId: 'iconTetrisImg', parentId: 'iconTetris' },
  { id: 'customIcon_dockChat', label: '聊天', containerId: null, parentId: 'dockChat', selector: '#dockChat .mk-card' },
  { id: 'customIcon_dockStory', label: '剧情', containerId: null, parentId: 'dockStory', selector: '#dockStory .mk-card' },
  { id: 'customIcon_dockCheckin', label: '查岗', containerId: null, parentId: 'dockCheckin', selector: '#dockCheckin .mk-card' },
  { id: 'customIcon_dockForum', label: '论坛', containerId: null, parentId: 'dockForum', selector: '#dockForum .mk-card' }
];

var DEF_ICON_CFG = { borderW: 1, shadow: 0, borderColor: '#d1d5db', shadowColor: '#ffffff', iconColor: '#9ca3b0', iconBg: 'rgba(255,255,255,0.2)', blur: 8, opacity: 0.2, radius: 15, iconSize: 70, labelSize: 13 };

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
    Bg.applyTopIconStyle(iconConfig);
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
        '<span class="bf-nav-title">美化工坊</span>' +
        '<div class="bf-nav-right"></div>' +
      '</div>' +
      '<div class="bf-list">' +
        '<div class="bf-list-item" data-action="theme">' +
          '<svg class="bf-list-icon" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' +
          '<div class="bf-list-info"><span class="bf-list-name">主题应用</span><span class="bf-list-sub">清灰 · 玉蓝 · 欢粉 · 夜色</span></div>' +
          '<svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>' +
        '<div class="bf-list-item" data-action="bgicon">' +
          '<svg class="bf-list-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
          '<div class="bf-list-info"><span class="bf-list-name">背景图标</span><span class="bf-list-sub">背景图片与图标组件</span></div>' +
          '<svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>' +
        '<div class="bf-list-item" data-action="font">' +
          '<svg class="bf-list-icon" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>' +
          '<div class="bf-list-info"><span class="bf-list-name">字体选择</span><span class="bf-list-sub">同时使用中英双种字体搭配</span></div>' +
          '<svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>' +
        '<div class="bf-list-item" data-action="ballstyle">' +
          '<svg class="bf-list-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>' +
          '<div class="bf-list-info"><span class="bf-list-name">悬浮样式</span><span class="bf-list-sub">更换小助手的形象</span></div>' +
          '<svg class="bf-list-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>' +
        '</div>' +
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
        else if(action === 'ballstyle') { Bg.openBallStyleFull(); }
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
            '<div class="bf-color-item"><div class="bf-color-dot" id="bfIconColorDot"></div><span class="bf-color-dot-label">图案</span></div>' +
            '<div class="bf-color-item"><div class="bf-color-dot" id="bfIconBgDot"></div><span class="bf-color-dot-label">背景</span></div>' +
            '<div class="bf-color-item"><div class="bf-color-dot" id="bfColorDot"></div><span class="bf-color-dot-label">边框</span></div>' +
            '<button class="bf-reset-btn" id="bfResetColor" type="button">恢复默认</button>' +
          '</div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">毛玻璃</span><input type="range" id="bfIconBlur" min="0" max="30" step="1" value="' + iconConfig.blur + '"><span class="bf-ctrl-val" id="bfIconBlurVal">' + iconConfig.blur + 'px</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">透明度</span><input type="range" id="bfIconOpacity" min="0" max="1" step="0.05" value="' + iconConfig.opacity + '"><span class="bf-ctrl-val" id="bfIconOpacityVal">' + Math.round(iconConfig.opacity * 100) + '%</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">边框</span><input type="range" id="bfIconBorder" min="0" max="6" step="0.5" value="' + iconConfig.borderW + '"><span class="bf-ctrl-val" id="bfIconBorderVal">' + iconConfig.borderW + 'px</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">阴影</span><input type="range" id="bfIconShadow" min="0" max="16" step="1" value="' + iconConfig.shadow + '"><span class="bf-ctrl-val" id="bfIconShadowVal">' + iconConfig.shadow + 'px</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">圆角</span><input type="range" id="bfIconRadius" min="0" max="50" step="1" value="' + iconConfig.radius + '"><span class="bf-ctrl-val" id="bfIconRadiusVal">' + iconConfig.radius + 'px</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">图标大小</span><input type="range" id="bfIconSize" min="50" max="90" step="1" value="' + (iconConfig.iconSize||73) + '"><span class="bf-ctrl-val" id="bfIconSizeVal">' + (iconConfig.iconSize||73) + 'px</span></div>' +
          '<div class="bf-ctrl-row"><span class="bf-ctrl-label">标签字号</span><input type="range" id="bfLabelSize" min="8" max="20" step="1" value="' + (iconConfig.labelSize||13) + '"><span class="bf-ctrl-val" id="bfLabelSizeVal">' + (iconConfig.labelSize||13) + 'px</span></div>' +
          '<div class="bf-divider"></div>' +
          '<div class="bf-section-header"><span class="bf-section-title">替换图标</span><button class="bf-reset-btn" id="bfResetIcons" type="button">全部恢复</button></div>' +
          '<div class="bf-icon-grid" id="bfIconGrid"></div>' +
          '<div class="bf-divider"></div>' +
          '<div class="bf-section-title">布局管理</div>' +
          '<div class="bf-btn-row">' +
            '<button class="bf-btn" id="bfResetLayoutBtn" type="button">恢复布局</button>' +
            '<button class="bf-btn active" id="bfSnapshotBtn" type="button">排版存档</button>' +
          '</div>' +
          '<div class="bf-bottom-spacer"></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(panel);
    requestAnimationFrame(function() { panel.classList.add('show'); });
    App.bindSwipeBack(panel, function() { panel.remove(); });

    panel.querySelector('#bfIconColorDot').style.background = iconConfig.iconColor;
    panel.querySelector('#bfIconBgDot').style.background = iconConfig.iconBg;
    panel.querySelector('#bfColorDot').style.background = iconConfig.borderColor;

    function renderIconPreview() {
      var prev = panel.querySelector('#bfIconPreview');
      if(!prev) return;
      var bd = tempBg[currentPreviewPage];
      if(!bd || !bd.src) bd = tempBg[0];
      var previewLabels = { iconUser: 'User', iconChar: 'Char', iconTheme: '美化', iconSettings: '设置' };
      var html = '<div class="bf-icon-preview-wrap">' +
        '<div class="bf-icon-preview-bg" id="bfIconPreviewBg"></div>' +
        '<div class="bf-icon-preview-row">';
      ['iconUser','iconChar','iconTheme','iconSettings'].forEach(function(pid) {
        html += '<div class="bf-icon-preview-unit"><div class="bf-icon-preview-item">' + (DEFAULT_SVGS[pid] || '') + '</div><div class="bf-icon-preview-label">' + previewLabels[pid] + '</div></div>';
      });
      html += '</div></div>';
      prev.innerHTML = html;
      var bgEl = panel.querySelector('#bfIconPreviewBg');
      if(bgEl && bd && bd.src) {
        bgEl.style.backgroundImage = 'url(' + bd.src + ')';
        bgEl.style.filter = 'blur(' + (bd.blur||0) + 'px) brightness(' + (100-(bd.dark||0)) + '%)';
      }
    }

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
          clone.style.cssText = 'width:100vw;height:100vh;position:absolute;top:0;left:0;';
          frame.appendChild(clone);
        }
        var fixedEls = ['#dockBar', '.screen-indicators'];
        fixedEls.forEach(function(sel) {
          var src = document.querySelector(sel);
          if(src) {
            var fc = src.cloneNode(true);
            var rect = src.getBoundingClientRect();
            fc.style.cssText = 'position:absolute;z-index:100;left:'+rect.left+'px;top:'+rect.top+'px;width:'+rect.width+'px;bottom:auto;right:auto;transform:none;';
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
      renderIconPreview();
    }
    setTimeout(renderPreview, 100);
    renderIconPreview();

    function switchPreview(idx) {
      currentPreviewPage = idx;
      var slider = panel.querySelector('#bfPreviewSlider');
      if(slider) slider.style.transform = 'translateX(' + (-idx * 50) + '%)';
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
    var psx = 0, currentX = 0, isDragging = false;
    var slider = panel.querySelector('#bfPreviewSlider');

    previewArea.addEventListener('touchstart', function(e) {
      psx = e.touches[0].clientX;
      isDragging = true;
      slider.style.transition = 'none';
    }, {passive:true});

    previewArea.addEventListener('touchmove', function(e) {
      if(!isDragging) return;
      e.preventDefault();
      currentX = e.touches[0].clientX;
      var dx = currentX - psx;
      var percent = (-currentPreviewPage * 50) + (dx / previewArea.offsetWidth * 50);
      percent = Math.min(0, Math.max(-50, percent));
      slider.style.transform = 'translateX(' + percent + '%)';
    }, {passive:false});

    previewArea.addEventListener('touchend', function(e) {
      isDragging = false;
      slider.style.transition = '';
      var dx = e.changedTouches[0].clientX - psx;
      var threshold = 30;
      if(Math.abs(dx) > threshold && ((dx < 0 && currentPreviewPage < 1) || (dx > 0 && currentPreviewPage > 0))) {
        switchPreview(dx < 0 ? 1 : 0);
      } else {
        slider.style.transform = 'translateX(' + (-currentPreviewPage * 50) + '%)';
      }
    }, {passive:true});

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
      try {
        App.LS.set(key, bd);
        Bg.applyBg(bd, currentPreviewPage);
        // ★ 第一页更新时，如果第二页没有单独背景，跟着第一页
        if(currentPreviewPage === 0) {
          var page1Data = App.LS.get('bgData_1') || {};
          if(!page1Data.src) {
            Bg.applyBg(bd, 1);
          }
        }
        App.showToast('第' + (currentPreviewPage+1) + '页背景已应用');
      }
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

    var sliderIds = ['bfIconBlur','bfIconOpacity','bfIconBorder','bfIconShadow','bfIconRadius','bfIconSize','bfLabelSize'];
    var sliderKeys = ['blur','opacity','borderW','shadow','radius','iconSize','labelSize'];
    var sliderValIds = ['bfIconBlurVal','bfIconOpacityVal','bfIconBorderVal','bfIconShadowVal','bfIconRadiusVal','bfIconSizeVal','bfLabelSizeVal'];
    var sliderUnits = ['px','%','px','px','px','px','px'];

    sliderIds.forEach(function(sid, i) {
      panel.querySelector('#'+sid).addEventListener('input', function() {
        var v = parseFloat(this.value);
        iconConfig[sliderKeys[i]] = v;
        var display = sid === 'bfIconOpacity' ? Math.round(v * 100) : v;
        panel.querySelector('#'+sliderValIds[i]).textContent = display + sliderUnits[i];
        App.LS.set('topIconConfig', iconConfig);
        Bg.applyTopIconStyle(iconConfig);
        if(sid === 'bfLabelSize') renderIconPreview();
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
      panel.querySelector('#bfIconSize').value = DEF_ICON_CFG.iconSize;
      panel.querySelector('#bfLabelSize').value = DEF_ICON_CFG.labelSize;
      panel.querySelector('#bfIconBorderVal').textContent = DEF_ICON_CFG.borderW + 'px';
      panel.querySelector('#bfIconShadowVal').textContent = DEF_ICON_CFG.shadow + 'px';
      panel.querySelector('#bfIconRadiusVal').textContent = DEF_ICON_CFG.radius + 'px';
      panel.querySelector('#bfIconBlurVal').textContent = DEF_ICON_CFG.blur + 'px';
      panel.querySelector('#bfIconOpacityVal').textContent = Math.round(DEF_ICON_CFG.opacity * 100) + '%';
      panel.querySelector('#bfIconSizeVal').textContent = DEF_ICON_CFG.iconSize + 'px';
      panel.querySelector('#bfLabelSizeVal').textContent = DEF_ICON_CFG.labelSize + 'px';
      var dynStyle = document.getElementById('topIconDynamicStyle');
      if(dynStyle) dynStyle.remove();
      App.LS.remove('topIconConfig');
      renderIconPreview();
      App.showToast('已恢复默认');
    });

    panel.querySelector('#bfResetIcons').addEventListener('click', function() {
      ICON_MAP.forEach(function(ic) { App.LS.remove(ic.id); });
      Bg.renderAllIcons();
      Bg.renderIconGridInPanel(panel);
      renderIconPreview();
      App.showToast('图标已全部恢复');
    });

    Bg.renderIconGridInPanel(panel);

    panel.querySelector('#bfResetLayoutBtn').addEventListener('click', function() {
      if(App.workshop && App.workshop.resetAllLayout) App.workshop.resetAllLayout();
    });
    panel.querySelector('#bfSnapshotBtn').addEventListener('click', function() {
      Bg.openSnapshot();
    });

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
    menu.innerHTML = '<div class="bf-modal-box">' +
      '<button class="bf-modal-btn bf-modal-btn-primary" data-act="upload" type="button">上传新图片</button>' +
      '<button class="bf-modal-btn bf-modal-btn-secondary" data-act="reset" type="button">恢复默认</button>' +
      '<button class="bf-modal-btn bf-modal-btn-cancel" data-act="cancel" type="button">取消</button>' +
    '</div>';
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

  openBallStyleFull: function() {
    var old = document.getElementById('bfBallStylePanel');
    if(old) old.remove();

    var config = App.ballConfig || {};
    var savedUrls = App.LS.get('ballUrlList') || [];

    function getCurrentPreviewSrc() {
      if(config.mode === 'ball') return config.customImg || config.ballImg || '';
      if(config.mode === 'url') return config.urlSrc || '';
      return App.mascot ? App.mascot.sprites.idle : '';
    }

    var panel = document.createElement('div');
    panel.id = 'bfBallStylePanel';
    panel.className = 'bf-sub-panel';

    function buildUrlListHtml() {
      if(!savedUrls.length) return '<div style="font-size:12px;color:#bbb;text-align:center;padding:12px 0;">还没有保存的URL</div>';
      return savedUrls.map(function(url, i) {
        var isActive = config.urlSrc === url;
        return '<div class="bf-url-item' + (isActive ? ' bf-url-active' : '') + '" data-idx="' + i + '">' +
          '<div class="bf-url-text">' + App.esc(url) + '</div>' +
          '<button class="bf-url-del" data-idx="' + i + '" type="button">✕</button>' +
        '</div>';
      }).join('');
    }

    panel.innerHTML =
      '<div class="bf-nav">' +
        '<button class="bf-back" id="bfBallBack" type="button">' + BACK_BUTTON_SVG + '</button>' +
        '<span class="bf-nav-title">悬浮样式</span>' +
        '<div class="bf-nav-right"></div>' +
      '</div>' +
      '<div class="bf-scroll-body">' +
        '<div style="padding:30px 20px 10px;display:flex;flex-direction:column;align-items:center;">' +
          '<div id="bfBallPreviewWrap" style="width:80px;height:80px;border-radius:50%;overflow:hidden;background:#f5f5f5;box-shadow:0 4px 16px rgba(0,0,0,0.1);margin-bottom:20px;">' +
            '<img id="bfBallPreview" src="' + App.escAttr(getCurrentPreviewSrc()) + '" style="width:100%;height:100%;object-fit:cover;">' +
          '</div>' +
        '</div>' +
        '<div class="bf-controls">' +
          '<div class="bf-section-title">模式选择</div>' +
          '<div style="display:flex;gap:8px;margin-bottom:20px;">' +
            '<button type="button" class="bf-btn bf-ball-mode-btn' + (config.mode === 'mascot' ? ' active' : '') + '" data-mode="mascot" style="flex:1;' + (config.mode === 'mascot' ? 'background:#1a1a1a;color:#fff;' : '') + '">小助手</button>' +
            '<button type="button" class="bf-btn bf-ball-mode-btn' + (config.mode === 'ball' ? ' active' : '') + '" data-mode="ball" style="flex:1;' + (config.mode === 'ball' ? 'background:#1a1a1a;color:#fff;' : '') + '">悬浮球</button>' +
            '<button type="button" class="bf-btn bf-ball-mode-btn' + (config.mode === 'url' ? ' active' : '') + '" data-mode="url" style="flex:1;' + (config.mode === 'url' ? 'background:#1a1a1a;color:#fff;' : '') + '">URL</button>' +
          '</div>' +
          '<div id="bfBallUploadGroup" style="' + (config.mode === 'ball' ? '' : 'display:none;') + '">' +
            '<div class="bf-section-title">上传照片</div>' +
            '<div class="bf-upload-area" id="bfBallUploadArea">从相册选择</div>' +
            '<input type="file" id="bfBallFileInput" accept="image/*" hidden>' +
            '<div id="bfBallUploadStatus" style="font-size:11px;color:#999;text-align:center;margin-top:4px;">' +
              (config.customImg ? '已上传图片' : '还没有上传照片') +
            '</div>' +
          '</div>' +
          '<div id="bfBallUrlGroup" style="' + (config.mode === 'url' ? '' : 'display:none;') + '">' +
            '<div class="bf-section-title">添加图片URL</div>' +
            '<div style="display:flex;gap:8px;margin-bottom:10px;">' +
              '<input type="text" id="bfBallImgUrl" placeholder="粘贴图片URL..." value="" style="flex:1;min-width:0;padding:12px 14px;border:1.5px solid #ddd;border-radius:10px;font-size:13px;color:#333;background:#fafafa;outline:none;box-sizing:border-box;font-family:inherit;">' +
              '<button type="button" id="bfBallAddUrl" style="padding:12px 16px;background:#1a1a1a;color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0;">添加</button>' +
            '</div>' +
            '<div class="bf-section-header">' +
              '<span class="bf-section-title" style="margin-bottom:0;">已保存</span>' +
              '<span style="font-size:11px;color:#999;" id="bfBallUrlCount">' + savedUrls.length + ' 个</span>' +
            '</div>' +
            '<div id="bfBallUrlList">' + buildUrlListHtml() + '</div>' +
          '</div>' +
          '<div class="bf-divider"></div>' +
          '<div class="bf-btn-row">' +
            '<button class="bf-btn active" id="bfBallSave" type="button">保存</button>' +
          '</div>' +
          '<div style="text-align:center;margin-top:6px;">' +
            '<button type="button" id="bfBallReset" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:inherit;">恢复默认</button>' +
          '</div>' +
          '<div class="bf-bottom-spacer"></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(panel);
    requestAnimationFrame(function() { panel.classList.add('show'); });
    App.bindSwipeBack(panel, function() { panel.remove(); });

    var currentMode = config.mode || 'mascot';

    function refreshUrlList() {
      var listEl = panel.querySelector('#bfBallUrlList');
      var countEl = panel.querySelector('#bfBallUrlCount');
      if(listEl) listEl.innerHTML = buildUrlListHtml();
      if(countEl) countEl.textContent = savedUrls.length + ' 个';
      bindUrlEvents();
    }

    function bindUrlEvents() {
      panel.querySelectorAll('.bf-url-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          if(e.target.closest('.bf-url-del')) return;
          var idx = parseInt(item.dataset.idx);
          var url = savedUrls[idx];
          if(url) {
            panel.querySelector('#bfBallPreview').src = url;
            config.urlSrc = url;
            panel.querySelectorAll('.bf-url-item').forEach(function(it) { it.classList.remove('bf-url-active'); });
            item.classList.add('bf-url-active');
          }
        });
      });
      panel.querySelectorAll('.bf-url-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(btn.dataset.idx);
          savedUrls.splice(idx, 1);
          App.LS.set('ballUrlList', savedUrls);
          refreshUrlList();
        });
      });
    }
    bindUrlEvents();

    panel.querySelector('#bfBallBack').addEventListener('click', function() {
      panel.classList.remove('show'); panel.classList.add('hidden');
      setTimeout(function() { panel.remove(); }, 350);
    });

    panel.querySelectorAll('.bf-ball-mode-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        panel.querySelectorAll('.bf-ball-mode-btn').forEach(function(b) {
          b.style.background = ''; b.style.color = ''; b.classList.remove('active');
        });
        btn.style.background = '#1a1a1a'; btn.style.color = '#fff'; btn.classList.add('active');
        currentMode = btn.dataset.mode;
        var uploadGroup = panel.querySelector('#bfBallUploadGroup');
        var urlGroup = panel.querySelector('#bfBallUrlGroup');
        uploadGroup.style.display = 'none';
        urlGroup.style.display = 'none';
        if(currentMode === 'ball') {
          uploadGroup.style.display = '';
          panel.querySelector('#bfBallPreview').src = config.customImg || config.ballImg || '';
        } else if(currentMode === 'url') {
          urlGroup.style.display = '';
          panel.querySelector('#bfBallPreview').src = config.urlSrc || '';
        } else {
          panel.querySelector('#bfBallPreview').src = App.mascot ? App.mascot.sprites.idle : '';
        }
      });
    });

    panel.querySelector('#bfBallAddUrl').addEventListener('click', function() {
      var url = panel.querySelector('#bfBallImgUrl').value.trim();
      if(!url) { App.showToast('请输入图片URL'); return; }
      if(savedUrls.indexOf(url) !== -1) { App.showToast('已存在'); return; }
      savedUrls.push(url);
      App.LS.set('ballUrlList', savedUrls);
      config.urlSrc = url;
      panel.querySelector('#bfBallPreview').src = url;
      panel.querySelector('#bfBallImgUrl').value = '';
      refreshUrlList();
      App.showToast('已添加');
    });

    panel.querySelector('#bfBallImgUrl').addEventListener('input', function() {
      var v = this.value.trim();
      if(v) panel.querySelector('#bfBallPreview').src = v;
    });

    panel.querySelector('#bfBallUploadArea').addEventListener('click', function() {
      panel.querySelector('#bfBallFileInput').click();
    });

    panel.querySelector('#bfBallFileInput').addEventListener('change', function(e) {
      var file = e.target.files[0]; if(!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
          var canvas = document.createElement('canvas');
          var max = 200;
          var w = img.width, h = img.height;
          if(w > h) { if(w > max) { h = h * max / w; w = max; } }
          else { if(h > max) { w = w * max / h; h = max; } }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          var compressed = canvas.toDataURL('image/png', 0.9);
          config.customImg = compressed;
          panel.querySelector('#bfBallPreview').src = compressed;
          panel.querySelector('#bfBallUploadStatus').textContent = '已上传图片';
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    panel.querySelector('#bfBallSave').addEventListener('click', function() {
      App.ballConfig.mode = currentMode;
      if(currentMode === 'ball') {
        App.ballConfig.customImg = config.customImg || '';
      } else if(currentMode === 'url') {
        App.ballConfig.urlSrc = config.urlSrc || '';
      }
      App.saveBallConfig();
      App.applyBallMode();
      var labels = { mascot: '小助手模式', ball: '悬浮球模式', url: 'URL模式' };
      App.showToast('已保存 · ' + (labels[currentMode] || ''));
    });

    panel.querySelector('#bfBallReset').addEventListener('click', function() {
      var BALL_DEFAULTS = { mode: 'mascot', ballImg: 'https://iili.io/Bbt1vK7.md.png', customImg: '', urlSrc: '', scale: 1 };
      App.ballConfig = JSON.parse(JSON.stringify(BALL_DEFAULTS));
      App.saveBallConfig();
      App.applyBallMode();
      savedUrls = [];
      App.LS.set('ballUrlList', savedUrls);
      config.customImg = '';
      config.urlSrc = '';
      panel.querySelector('#bfBallPreview').src = App.mascot ? App.mascot.sprites.idle : '';
      panel.querySelectorAll('.bf-ball-mode-btn').forEach(function(b) {
        b.style.background = ''; b.style.color = ''; b.classList.remove('active');
      });
      var mascotBtn = panel.querySelector('.bf-ball-mode-btn[data-mode="mascot"]');
      if(mascotBtn) { mascotBtn.style.background = '#1a1a1a'; mascotBtn.style.color = '#fff'; mascotBtn.classList.add('active'); }
      panel.querySelector('#bfBallUploadGroup').style.display = 'none';
      panel.querySelector('#bfBallUrlGroup').style.display = 'none';
      panel.querySelector('#bfBallUploadStatus').textContent = '还没有上传照片';
      refreshUrlList();
      currentMode = 'mascot';
      App.showToast('已恢复默认');
    });
  },

  openSnapshot: function() {
    var old = document.getElementById('bfSnapshotPanel');
    if(old) { old.remove(); return; }

    var LAYOUT_KEYS = [
      'profileCards', 'cardDragOffsets', 'searchBoxData',
      'searchText_left', 'searchText_right', 'searchText_left_manual', 'searchText_right_manual',
      'avatar_search1', 'avatar_search2',
      'edenCard', 'bgData', 'topIconConfig',
      'customIcon_cg', 'customIcon_lt',
      'customIcon_dockMine', 'customIcon_dockLong', 'customIcon_dockShort', 'customIcon_dockCheck',
      'dockConfig', 'ballConfig', 'floatingBallPos', 'wtCardPos', 'wtCardConfig',
      'fontConfig', 'fontCustomList'
    ];
    var MAX_SLOTS = 10;

    function getSnapshots() { return App.LS.get('layoutSnapshots') || []; }
    function saveSnapshots(list) { App.LS.set('layoutSnapshots', list); }

    function captureNow() {
      var data = {};
      LAYOUT_KEYS.forEach(function(k) {
        var v = App.LS.get(k);
        if(v !== null && v !== undefined) data[k] = v;
      });
      return data;
    }

    function restoreSnapshot(snap) {
      LAYOUT_KEYS.forEach(function(k) { App.LS.remove(k); });
      Object.keys(snap.data).forEach(function(k) { App.LS.set(k, snap.data[k]); });
      App.showToast('已恢复，即将刷新');
      setTimeout(function() { location.reload(); }, 800);
    }

    function fmtTime(ts) {
      var d = new Date(ts);
      return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    var panel = document.createElement('div');
    panel.id = 'bfSnapshotPanel';
    panel.className = 'snap-panel';

    function renderPanel() {
      var snaps = getSnapshots();
      var listHtml = '';
      if(!snaps.length) {
        listHtml = '<div class="snap-empty">还没有存档<br>点击上方按钮保存当前排版</div>';
      } else {
        listHtml = snaps.map(function(s, i) {
          return '<div class="snap-card">' +
            '<div class="snap-card-header">' +
              '<div>' +
                '<div class="snap-card-name" data-idx="' + i + '" title="点击重命名">' + App.esc(s.name) + '</div>' +
                '<div class="snap-card-time">' + fmtTime(s.ts) + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="snap-card-btns">' +
              '<button class="snap-card-btn restore" data-idx="' + i + '" type="button">恢复</button>' +
              '<button class="snap-card-btn export" data-idx="' + i + '" type="button">导出</button>' +
              '<button class="snap-card-btn delete" data-idx="' + i + '" type="button">删除</button>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      panel.innerHTML =
        '<div class="snap-header">' +
          '<button class="bf-back" id="snapBack" type="button">' + BACK_BUTTON_SVG + '</button>' +
          '<span class="bf-nav-title">排版存档</span>' +
          '<div class="bf-nav-right"></div>' +
        '</div>' +
        '<div class="snap-toolbar">' +
          '<button class="snap-toolbar-btn primary" id="snapSaveBtn" type="button">保存当前排版</button>' +
          '<button class="snap-toolbar-btn secondary" id="snapImportBtn" type="button">导入</button>' +
          '<input type="file" id="snapImportFile" accept=".json" hidden>' +
        '</div>' +
        '<div class="snap-hint">最多保存 ' + MAX_SLOTS + ' 个存档。包含卡片、背景、图标、字体、位置等全部排版数据。</div>' +
        '<div class="snap-list" id="snapList">' + listHtml + '</div>';

      panel.querySelector('#snapBack').addEventListener('click', function() {
        panel.classList.remove('show'); panel.classList.add('hidden');
        setTimeout(function() { panel.remove(); }, 350);
      });

      panel.querySelector('#snapSaveBtn').addEventListener('click', function() {
        var snaps = getSnapshots();
        if(snaps.length >= MAX_SLOTS) {
          if(!confirm('已达到 ' + MAX_SLOTS + ' 个存档上限，将覆盖最早的存档。继续？')) return;
          snaps.shift();
        }
        var name = prompt('给这个存档起个名字：', '存档 ' + (snaps.length + 1));
        if(name === null) return;
        name = name.trim() || ('存档 ' + new Date().toLocaleDateString());
        var snap = { name: name, ts: Date.now(), data: captureNow() };
        snaps.push(snap);
        saveSnapshots(snaps);
        renderPanel();
        App.showToast('已保存');
      });

      panel.querySelector('#snapImportBtn').addEventListener('click', function() {
        panel.querySelector('#snapImportFile').click();
      });

      panel.querySelector('#snapImportFile').addEventListener('change', function(e) {
        var file = e.target.files[0]; if(!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          try {
            var snap = JSON.parse(ev.target.result);
            if(!snap.data || !snap.name) throw new Error();
            var snaps = getSnapshots();
            if(snaps.length >= MAX_SLOTS) snaps.shift();
            snap.ts = Date.now();
            snaps.push(snap);
            saveSnapshots(snaps);
            renderPanel();
            App.showToast('已导入：' + snap.name);
          } catch(err) { App.showToast('文件格式错误'); }
        };
        reader.readAsText(file);
      });

      panel.querySelectorAll('.snap-card-btn.restore').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(btn.dataset.idx);
          var snaps = getSnapshots();
          if(!snaps[idx]) return;
          if(!confirm('恢复此存档将覆盖当前排版，确定？')) return;
          restoreSnapshot(snaps[idx]);
        });
      });

      panel.querySelectorAll('.snap-card-btn.export').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(btn.dataset.idx);
          var snaps = getSnapshots();
          if(!snaps[idx]) return;
          var blob = new Blob([JSON.stringify(snaps[idx], null, 2)], { type: 'application/json' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'layout-' + snaps[idx].name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') + '.json';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          URL.revokeObjectURL(url);
          App.showToast('已导出');
        });
      });

      panel.querySelectorAll('.snap-card-btn.delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(btn.dataset.idx);
          if(!confirm('确定删除这个存档？')) return;
          var snaps = getSnapshots();
          snaps.splice(idx, 1);
          saveSnapshots(snaps);
          renderPanel();
          App.showToast('已删除');
        });
      });

      panel.querySelectorAll('.snap-card-name').forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(el.dataset.idx);
          var snaps = getSnapshots();
          if(!snaps[idx]) return;
          var newName = prompt('修改存档名字：', snaps[idx].name);
          if(newName === null) return;
          newName = newName.trim();
          if(!newName) return;
          snaps[idx].name = newName;
          saveSnapshots(snaps);
          renderPanel();
          App.showToast('已重命名');
        });
      });
    }

    document.body.appendChild(panel);
    requestAnimationFrame(function() { panel.classList.add('show'); });
    App.bindSwipeBack(panel, function() {
      panel.classList.remove('show'); panel.classList.add('hidden');
      setTimeout(function() { panel.remove(); }, 350);
    });
    renderPanel();
  },

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
    var DELAY = 250;
    var SNAP = 12;
    var ALL_ICONS = ['iconUser','iconChar','iconTheme','iconSettings'];

    ALL_ICONS.forEach(function(id) {
      var el = document.getElementById(id); if(!el || el._bgDragBound) return;
      el._bgDragBound = true;
      var startX, startY, origX, origY, longPressed = false, timer, moved = false;

      el.addEventListener('touchstart', function(e) {
        var t = e.touches[0]; startX = t.clientX; startY = t.clientY; longPressed = false; moved = false;
        timer = setTimeout(function() {
          longPressed = true;
          var off = Bg._getIconOffset(id); origX = off.x; origY = off.y;
          
          el.classList.add('is-grabbed');
          el.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
          // 🌟 核心：注入变量 --t
          var tf = 'translate('+origX+'px,'+origY+'px) scale(1.1)';
          el.style.setProperty('--t', tf);
          el.style.transform = tf;
          
          el.style.zIndex = '999';
          if(navigator.vibrate) navigator.vibrate(15);
        }, DELAY);
      }, {passive:true});

      el.addEventListener('touchmove', function(e) {
        var t = e.touches[0];
        if(timer && !longPressed) {
          if(Math.abs(t.clientX-startX)>8||Math.abs(t.clientY-startY)>8){clearTimeout(timer);timer=null;}
          return;
        }
        if(!longPressed) return;
        moved = true; e.preventDefault(); e.stopPropagation();
        var nx = origX + (t.clientX - startX);
        var ny = origY + (t.clientY - startY);
        ALL_ICONS.forEach(function(otherId) {
          if(otherId === id) return;
          var otherOff = Bg._getIconOffset(otherId);
          if(Math.abs(ny - otherOff.y) < SNAP) ny = otherOff.y;
          if(Math.abs(nx - otherOff.x) < SNAP) nx = otherOff.x;
        });
        
        el.style.transition = 'none';
        // 🌟 核心：注入变量 --t
        var tf = 'translate('+nx+'px,'+ny+'px) scale(1.1)';
        el.style.setProperty('--t', tf);
        el.style.transform = tf;
      }, {passive:false});

      el.addEventListener('touchend', function(e) {
        clearTimeout(timer); timer=null;
        
        el.classList.remove('is-grabbed'); 
        
        if(longPressed) {
          if(moved) { Bg._saveIconOffset(id, el); e.stopPropagation(); }
          
          el.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
          var curOff = Bg._getIconOffset(id);
          // 🌟 核心：注入变量 --t
          var tf = 'translate('+curOff.x+'px,'+curOff.y+'px) scale(1)';
          el.style.setProperty('--t', tf);
          el.style.transform = tf;
          
          setTimeout(function(){ 
            el.style.transition=''; 
            el.style.zIndex=''; 
          }, 350);
        } else {
          el.style.transition=''; 
          el.style.zIndex='';
        }
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
      var off = offsets[id]; 
      if(off) {
        // 🌟 注入 --t 变量，防止下次摇晃时闪现
        var tf = 'translate('+off.x+'px,'+off.y+'px)';
        el.style.setProperty('--t', tf);
        el.style.transform = tf;
      }
    });
  },

  applyBg: function(data, pageIdx) {
    var id = pageIdx === 1 ? 'bgLayer1' : 'bgLayer';
    var layer = document.getElementById(id); if(!layer) return;
    if(data && data.src) {
      layer.style.backgroundImage = 'url(' + data.src + ')';
      layer.style.filter = 'blur(' + (data.blur||0) + 'px) brightness(' + (100-(data.dark||0)) + '%)';
    } else if(pageIdx === 1) {
      var page0 = App.LS.get('bgData') || {};
      if(page0.src) {
        layer.style.backgroundImage = 'url(' + page0.src + ')';
        layer.style.filter = 'blur(' + (page0.blur||0) + 'px) brightness(' + (100-(page0.dark||0)) + '%)';
      } else {
        layer.style.backgroundImage = '';
        layer.style.filter = '';
      }
    } else {
      layer.style.backgroundImage = '';
      layer.style.filter = '';
      var page1Data = App.LS.get('bgData_1') || {};
      if(!page1Data.src) {
        var layer1 = document.getElementById('bgLayer1');
        if(layer1) {
          layer1.style.backgroundImage = '';
          layer1.style.filter = '';
        }
      }
    }
  },

  applyTopIconStyle: function(cfg) {
    var styleId = 'topIconDynamicStyle';
    var styleEl = document.getElementById(styleId);
    if(!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    var radius = cfg.radius;
    var blur = cfg.blur;
    var opacity = cfg.opacity;
    var iconBg = cfg.iconBg;
    var iconColor = cfg.iconColor;
    var iconSize = cfg.iconSize;

    var bgWithOpacity = iconBg;
    if(iconBg.indexOf('gradient') >= 0) {
      bgWithOpacity = 'transparent';
    } else {
      var r=255, g=255, b=255, a=1;
      var m = iconBg.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
      if(m) { r=parseInt(m[1]); g=parseInt(m[2]); b=parseInt(m[3]); a=m[4]!=null?parseFloat(m[4]):1; }
      else { var hex=iconBg.replace('#',''); if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; if(hex.length>=6){r=parseInt(hex.substr(0,2),16);g=parseInt(hex.substr(2,2),16);b=parseInt(hex.substr(4,2),16);} a=1; }
      bgWithOpacity = 'rgba('+r+','+g+','+b+','+(a*opacity).toFixed(3)+')';
    }

    var sel1 = '.app-icon-glass';
    var sel2 = '.bf-icon-preview-item';
    var sel3 = '.mk-card';

        var containerCSS =
      sel1+','+sel2+' {' +
        'border: '+cfg.borderW+'px solid '+(cfg.borderColor||'#d1d5db')+' !important;' +
        'box-shadow: '+cfg.shadow+'px '+cfg.shadow+'px 0 '+(cfg.shadowColor||'#ffffff')+' !important;' +
        'border-radius: '+radius+'px !important;' +
        'background: '+bgWithOpacity+' !important;' +
        'backdrop-filter: blur('+blur+'px) !important;' +
        '-webkit-backdrop-filter: blur('+blur+'px) !important;' +
        'width: '+iconSize+'px !important;' +
        'height: '+iconSize+'px !important;' +
      '}' +
      sel3+' {' +
        'border: '+cfg.borderW+'px solid '+(cfg.borderColor||'#d1d5db')+' !important;' +
        'box-shadow: '+cfg.shadow+'px '+cfg.shadow+'px 0 '+(cfg.shadowColor||'#ffffff')+' !important;' +
        'border-radius: '+radius+'px !important;' +
        'background: '+bgWithOpacity+' !important;' +
        'backdrop-filter: blur('+blur+'px) !important;' +
        '-webkit-backdrop-filter: blur('+blur+'px) !important;' +
      '}';

    var gradBgCSS = '';
    if(iconBg.indexOf('gradient') >= 0) {
            gradBgCSS =
        sel1+'::before,'+sel2+'::before,'+sel3+'::before {' +
          'content: "";position: absolute;inset: -1px;' +
          'background: '+iconBg+';border-radius: inherit;' +
          'opacity: '+opacity+';pointer-events: none;z-index: 0;' +
        '}' +
        sel1+' svg,'+sel2+' svg,'+sel3+' svg { position: relative; z-index: 1; }';
    }

    var iconColorCSS = '';
    if(iconColor.indexOf('gradient') === -1) {
            var c1 = sel1+' svg > ';
      var c2 = sel2+' svg > ';
      var c3 = sel3+' svg > ';
      iconColorCSS =
        c1+'path,'+c1+'circle,'+c1+'rect,'+c1+'line,'+c1+'ellipse,' +
        c2+'path,'+c2+'circle,'+c2+'rect,'+c2+'line,'+c2+'ellipse,' +
        c3+'path,'+c3+'circle,'+c3+'rect,'+c3+'line,'+c3+'ellipse {' +
          'stroke: '+iconColor+' !important;' +
        '}' +
        c1+'[mask],'+c2+'[mask],'+c3+'[mask] { fill: '+iconColor+' !important; }' +
        c1+'path:not([mask]),'+c2+'path:not([mask]),'+c3+'path:not([mask]) { fill: none !important; }';
    }

            var maskCSS =
      sel1+' svg mask > rect:first-child,' +
      sel2+' svg mask > rect:first-child,' +
      sel3+' svg mask > rect:first-child { fill: white !important; stroke: none !important; }' +
      sel1+' svg mask > path,' +
      sel2+' svg mask > path,' +
      sel3+' svg mask > path { fill: black !important; stroke: black !important; }' +
      sel1+' svg mask > ellipse,' +
      sel2+' svg mask > ellipse,' +
      sel3+' svg mask > ellipse { stroke: black !important; }' +
      sel1+' svg mask > circle,' +
      sel2+' svg mask > circle,' +
      sel3+' svg mask > circle { fill: black !important; stroke: black !important; }';

        var labelCSS = '.app-icon-label, .bf-icon-preview-label { font-size: ' + (cfg.labelSize || 13) + 'px !important; }';

    var contentCSS = sel1+' svg,'+sel2+' svg,'+sel3+' svg { opacity: 1 !important; }' +
      sel1+' img,'+sel2+' img,'+sel3+' img { opacity: 1 !important; position: relative; z-index: 1; }';

    styleEl.innerHTML = containerCSS + gradBgCSS + iconColorCSS + maskCSS + labelCSS + contentCSS;
  }
};

App.register('bg', Bg);
})();
