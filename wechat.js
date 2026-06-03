
(function(){
'use strict';
var App = window.App;
if (!App) return;

var STAR_SVG = '<svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>';

var WeChat = {
  panelEl: null,
  currentTab: 'chats',
  currentPage: 'chats',
  _savedInner: '',
  _searchVisible: false,

  load: function() {
    WeChat.charAliases = App.LS.get('wxCharAliases') || {};
    WeChat.charVisible = App.LS.get('wxCharVisible') || {};
  },
  save: function() {
    App.LS.set('wxCharAliases', WeChat.charAliases);
    App.LS.set('wxCharVisible', WeChat.charVisible);
  },

  getCharAlias: function(cid) { return (WeChat.charAliases || {})[cid] || ''; },
  setCharAlias: function(cid, alias) {
    if (!WeChat.charAliases) WeChat.charAliases = {};
    WeChat.charAliases[cid] = alias;
    WeChat.save();
  },
  isCharVisible: function(cid) {
    if (!WeChat.charVisible) return true;
    if (WeChat.charVisible[cid] === undefined) return true;
    return WeChat.charVisible[cid];
  },

  open: function() {
    WeChat.load();
    WeChat.currentPage = 'chats';
    WeChat.currentTab = 'chats';

    var old = App.$('#wxPanel');
    if (old) old.remove();

    var panel = document.createElement('div');
    panel.id = 'wxPanel';
    panel.className = 'wx-panel';
    document.body.appendChild(panel);
    WeChat.panelEl = panel;

    WeChat._buildDOM(panel);
    WeChat._bindEvents(panel);
    WeChat.renderPage();

    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      panel.classList.add('wx-visible');
    }); });

    App.bindSwipeBack(panel, function(){ WeChat.close(); });
  },

  close: function() {
    var p = WeChat.panelEl;
    if (!p) return;
    p.classList.remove('wx-visible');
    setTimeout(function(){ if (p.parentNode) p.remove(); WeChat.panelEl = null; }, 350);
  },

  /* ===== DOM 结构 ===== */
  _buildDOM: function(panel) {
    panel.innerHTML =
      // 顶部
      '<div class="c6-header">' +
        '<div class="c6-header-btn" id="wxBack"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></div>' +
        '<div class="c6-header-title" id="wxTitle">Chat</div>' +
        '<div class="c6-header-btn" id="wxAdd"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>' +
      '</div>' +

      // 主体
      '<div class="c6-main">' +
        // Tab栏
        '<div class="c6-tab-wrap" id="wxTabWrap">' +
          '<div class="c6-tab-inner">' +
            '<div class="c6-tab-deco"><div class="c6-star-main">' + STAR_SVG + '</div><div class="c6-star-sm c6-star-s1">' + STAR_SVG + '</div></div>' +
            '<div class="c6-tabs" id="wxTabs">' +
              '<div class="c6-tab c6-active" data-tab="chats">chats</div>' +
              '<div class="c6-tab" data-tab="groups">groups</div>' +
            '</div>' +
            '<div class="c6-tab-icons">' +
              '<div class="c6-tab-icon" id="wxNotify"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>' +
              '<div class="c6-tab-icon" id="wxSearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        // 搜索栏（默认隐藏）
        '<div class="c6-search-wrap" id="wxSearchWrap" style="display:none;">' +
          '<div class="c6-search-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>' +
          '<input type="text" class="c6-search-input" id="wxSearchInput" placeholder="搜索">' +
        '</div>' +
        // 内容
        '<div class="c6-body" id="wxBody"></div>' +
      '</div>' +

      // 底部导航
      '<div class="c6-footer">' +
        '<div class="c6-footer-item c6-f-active" data-page="chats">' +
          '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.65 1.48 4.96 3.76 6.37-.24 1.25-.8 2.84-.8 2.84a1 1 0 0 0 1.25 1.05s2.5-.66 4.18-1.54C10.9 19.64 11.45 19.67 12 19.67c5.52 0 10-3.92 10-8.92S17.52 2 12 2z"/></svg></div>' +
          '<div class="c6-footer-label">Chats</div>' +
        '</div>' +
        '<div class="c6-footer-item" data-page="contacts">' +
          '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>' +
          '<div class="c6-footer-label">Contacts</div>' +
        '</div>' +
        '<div class="c6-footer-item" data-page="discover">' +
          '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg></div>' +
          '<div class="c6-footer-label">Discover</div>' +
        '</div>' +
        '<div class="c6-footer-item" data-page="me">' +
          '<div class="c6-footer-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></div>' +
          '<div class="c6-footer-label">Me</div>' +
        '</div>' +
      '</div>';
  },

  /* ===== 事件绑定 ===== */
  _bindEvents: function(panel) {
    // 返回
    panel.querySelector('#wxBack').addEventListener('click', function(){ WeChat.close(); });

    // Tab切换
    panel.querySelectorAll('#wxTabs .c6-tab').forEach(function(tab){
      tab.addEventListener('click', function(){
        WeChat.currentTab = tab.dataset.tab;
        panel.querySelectorAll('#wxTabs .c6-tab').forEach(function(t){ t.classList.remove('c6-active'); });
        tab.classList.add('c6-active');
        if (WeChat.currentPage === 'chats') WeChat.renderPage();
      });
    });

    // 搜索
    panel.querySelector('#wxSearch').addEventListener('click', function(){
      WeChat._searchVisible = !WeChat._searchVisible;
      var sw = panel.querySelector('#wxSearchWrap');
      if (sw) {
        sw.style.display = WeChat._searchVisible ? '' : 'none';
        if (WeChat._searchVisible) sw.querySelector('input').focus();
      }
    });

    var searchInput = panel.querySelector('#wxSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function(){
        WeChat.renderPage();
      });
    }

    // 底部导航
    panel.querySelectorAll('.c6-footer-item').forEach(function(item){
      item.addEventListener('click', function(){
        var page = item.dataset.page;
        WeChat.currentPage = page;
        panel.querySelectorAll('.c6-footer-item').forEach(function(i){ i.classList.remove('c6-f-active'); });
        item.classList.add('c6-f-active');

        // 切页面时更新标题和Tab显隐
        var title = panel.querySelector('#wxTitle');
        var tabWrap = panel.querySelector('#wxTabWrap');
        if (page === 'chats') {
          title.textContent = 'Chat';
          tabWrap.style.display = '';
        } else if (page === 'contacts') {
          title.textContent = 'Contacts';
          tabWrap.style.display = 'none';
        } else if (page === 'discover') {
          title.textContent = 'Discover';
          tabWrap.style.display = 'none';
        } else if (page === 'me') {
          title.textContent = 'Me';
          tabWrap.style.display = 'none';
        }

        WeChat.renderPage();
      });
    });
  },

  /* ===== 渲染当前页面 ===== */
  renderPage: function() {
    var body = WeChat.panelEl ? WeChat.panelEl.querySelector('#wxBody') : null;
    if (!body) return;

    var page = WeChat.currentPage;
    if (page === 'chats') WeChat._renderChats(body);
    else if (page === 'contacts') WeChat._renderContacts(body);
    else if (page === 'discover') WeChat._renderDiscover(body);
    else if (page === 'me') WeChat._renderMe(body);
  },

  renderTab: function() { WeChat.renderPage(); },

  /* ===== 聊天列表 ===== */
  _renderChats: function(body) {
    if (!App.character) { body.innerHTML = '<div class="c6-empty">角色模块未加载</div>'; return; }
    App.character.load();

    var chars = App.character.list || [];
    var visible = chars.filter(function(c){ return WeChat.isCharVisible(c.id); });

    // 搜索过滤
    var sw = WeChat.panelEl ? WeChat.panelEl.querySelector('#wxSearchInput') : null;
    var kw = sw ? sw.value.trim().toLowerCase() : '';
    if (kw) {
      visible = visible.filter(function(c){
        var dn = (WeChat.getCharAlias(c.id) || c.name || '').toLowerCase();
        return dn.indexOf(kw) >= 0;
      });
    }

    // 按最后消息时间排序
    visible.sort(function(a, b){
      var msgsA = App.LS.get('chatMsgs_' + a.id) || [];
      var msgsB = App.LS.get('chatMsgs_' + b.id) || [];
      var tsA = msgsA.length ? msgsA[msgsA.length - 1].ts : 0;
      var tsB = msgsB.length ? msgsB[msgsB.length - 1].ts : 0;
      return tsB - tsA;
    });

    if (!visible.length) {
      body.innerHTML = '<div class="c6-empty">' + (kw ? '没有找到相关聊天' : '暂无聊天') + '</div>';
      return;
    }

    var html = visible.map(function(c){
      var alias = WeChat.getCharAlias(c.id) || c.name || '未命名';
      var msgs = App.LS.get('chatMsgs_' + c.id) || [];
      var last = msgs.length ? msgs[msgs.length - 1] : null;
      var preview = last ? (last.content || '').replace(/\n/g, ' ').slice(0, 40) : '暂无消息';
      // 清理sticker标记
      preview = preview.replace(/\[sticker:[^\]]+\]/g, '[表情包]');
      var timeStr = last ? WeChat._fmtTime(last.ts) : '';
      var unread = App.LS.get('chatUnread_' + c.id) || 0;

      var avatarHtml = c.avatar
        ? '<img src="' + App.escAttr(c.avatar) + '" onerror="this.parentElement.innerHTML=\'👤\'">'
        : '👤';

      var badgeHtml = unread > 0
        ? '<div class="c6-chat-badge">' + (unread > 99 ? '99+' : unread) + '</div>'
        : '';

      return '<div class="c6-chat-item" data-char-id="' + c.id + '">' +
        '<div class="c6-chat-avatar">' + avatarHtml + '</div>' +
        '<div class="c6-chat-info">' +
          '<div class="c6-chat-name">' + App.esc(alias) + '</div>' +
          '<div class="c6-chat-msg">' + App.esc(preview) + '</div>' +
        '</div>' +
        '<div class="c6-chat-meta">' +
          '<div class="c6-chat-time">' + timeStr + '</div>' +
          badgeHtml +
        '</div>' +
      '</div>';
    }).join('');

    body.innerHTML = html;

    // 绑定点击
    body.querySelectorAll('.c6-chat-item').forEach(function(item){
      item.addEventListener('click', function(){
        var cid = item.dataset.charId;
        if (cid) WeChat.openChat(cid);
      });
    });
  },

  /* ===== 通讯录 ===== */
  _renderContacts: function(body) {
    if (!App.character) { body.innerHTML = '<div class="c6-empty">角色模块未加载</div>'; return; }
    App.character.load();
    var chars = App.character.list || [];

    if (!chars.length) {
      body.innerHTML = '<div class="c6-empty">暂无联系人</div>';
      return;
    }

    var html = chars.map(function(c){
      var alias = WeChat.getCharAlias(c.id) || c.name || '未命名';
      var avatarHtml = c.avatar
        ? '<img src="' + App.escAttr(c.avatar) + '" onerror="this.parentElement.innerHTML=\'👤\'">'
        : '👤';

      return '<div class="c6-contact-item" data-char-id="' + c.id + '">' +
        '<div class="c6-contact-avatar">' + avatarHtml + '</div>' +
        '<div class="c6-contact-name">' + App.esc(alias) + '</div>' +
        '<div class="c6-contact-relation">' + App.esc(c.relation || '') + '</div>' +
      '</div>';
    }).join('');

    body.innerHTML = html;

    body.querySelectorAll('.c6-contact-item').forEach(function(item){
      item.addEventListener('click', function(){
        var cid = item.dataset.charId;
        if (cid) WeChat.openChat(cid);
      });
    });
  },

  /* ===== 发现 ===== */
  _renderDiscover: function(body) {
    var items = [
      { name: '朋友圈', icon: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="rgba(0,0,0,0.5)"/></svg>' },
      { name: '扫一扫', icon: '<svg viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M8 12h8" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="2" stroke-linecap="round"/></svg>' },
      { name: '小程序', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="2"/><path d="M8 12a4 4 0 0 1 8 0" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="2" stroke-linecap="round"/></svg>' }
    ];

    var html = items.map(function(it){
      return '<div class="c6-discover-item">' +
        '<div class="c6-discover-icon">' + it.icon + '</div>' +
        '<div class="c6-discover-name">' + App.esc(it.name) + '</div>' +
        '<div class="c6-discover-arrow">›</div>' +
      '</div>';
    }).join('');

    body.innerHTML = html;
  },

  /* ===== 我的 ===== */
  _renderMe: function(body) {
    var user = App.user ? App.user.getActiveUser() : null;

    if (!user) {
      body.innerHTML = '<div class="c6-empty">请先创建用户档案</div>';
      return;
    }

    var avatarHtml = user.avatar
      ? '<img src="' + App.escAttr(user.avatar) + '">'
      : '👤';

    body.innerHTML =
      '<div class="c6-me-card">' +
        '<div class="c6-me-avatar">' + avatarHtml + '</div>' +
        '<div class="c6-me-info">' +
          '<div class="c6-me-name">' + App.esc(user.nickname || user.realName || '用户') + '</div>' +
          '<div class="c6-me-id">微信号: ' + App.esc(user.wechatId || '—') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="c6-me-list">' +
        '<div class="c6-me-row"><span class="c6-me-row-label">手机号</span><span class="c6-me-row-val">' + App.esc(user.phone || '—') + '</span></div>' +
        '<div class="c6-me-row"><span class="c6-me-row-label">性别</span><span class="c6-me-row-val">' + App.esc(user.gender || '—') + '</span></div>' +
        '<div class="c6-me-row"><span class="c6-me-row-label">生日</span><span class="c6-me-row-val">' + App.esc(user.birthday || '—') + '</span></div>' +
        (user.bio ? '<div class="c6-me-row"><span class="c6-me-row-label">签名</span><span class="c6-me-row-val">' + App.esc(user.bio) + '</span></div>' : '') +
      '</div>';
  },

  /* ===== 打开聊天 ===== */
  openChat: function(charId) {
    if (!App.character) return;
    var c = App.character.getById(charId);
    if (!c) { App.showToast('角色不存在'); return; }

    // 清除未读
    App.LS.remove('chatUnread_' + charId);

    // 调用chatUI打开聊天内页
    if (App.chatUI) {
      App.chatUI.open(charId, c);
    } else if (App.chat) {
      App.chat.openInWechat(charId);
    }
  },

  /* ===== 恢复内容（兼容旧chat.js） ===== */
  restoreInner: function() {
    // 新版不需要这个，但保留接口兼容
    WeChat.renderPage();
  },

  /* ===== 工具方法 ===== */
  _fmtTime: function(ts) {
    if (!ts) return '';
    var now = new Date();
    var d = new Date(ts);
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var diff = today.getTime() - msgDay.getTime();

    if (diff === 0) {
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    } else if (diff <= 86400000) {
      return '昨天';
    } else if (diff <= 6 * 86400000) {
      return ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
    } else if (d.getFullYear() === now.getFullYear()) {
      return (d.getMonth() + 1) + '/' + d.getDate();
    }
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  },

  init: function() {
    WeChat.load();
    App.wechat = WeChat;
    App.safeOn('#dockChat', 'click', function(){ WeChat.open(); });
  }
};

App.register('wechat', WeChat);
})();
