(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var FIELDS_SHORT = [
    { key: 'realName', en: 'NAME', cn: '姓名' },
    { key: 'nickname', en: 'NICKNAME', cn: '昵称' },
    { key: 'gender', en: 'GENDER', cn: '性别' },
    { key: 'identity', en: 'IDENTITY', cn: '身份' }
  ];

  var FIELDS_LONG = [
    { key: 'appearance', en: 'APPEARANCE', cn: '外貌' },
    { key: 'personality', en: 'PERSONALITY', cn: '性格' },
    { key: 'speakStyle', en: 'SPEAKING STYLE', cn: '说话风格' },
    { key: 'bio', en: 'ABOUT', cn: '简介' }
  ];

  var Social = {
    currentTab: 'chat',
    panelEl: null,
    userData: null,
    sealed: false,

    load: function() {
      Social.userData = App.LS.get('userData') || null;
      Social.sealed = !!(Social.userData && Social.userData._sealed);
    },
    save: function() { App.LS.set('userData', Social.userData); },

    getActiveUser: function() { return Social.userData; },

    open: function() {
      Social.load();
      var panel = App.$('#socialPanel');
      if (!panel) return;
      Social.panelEl = panel;
      Social.currentTab = 'chat';
      Social.render();
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    close: function() {
      var panel = App.$('#socialPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    render: function() {
      var panel = Social.panelEl;
      if (!panel) return;
      var isFS = App.LS.get('socFullScreen') || false;
      var wrapClass = isFS ? 'soc-fullscreen' : '';

      panel.innerHTML =
        '<div class="' + wrapClass + '" id="socWrap"><div class="soc-phone"><div class="soc-inner">' +
          '<div class="soc-header">' +
            '<button class="soc-header-btn" id="socBackBtn" type="button">' +
              '<svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>' +
            '</button>' +
            '<div style="flex:1;"></div>' +
            '<button class="soc-me-mode-btn" id="socModeToggle" type="button" style="display:none;">' +
              '<span class="soc-me-mode-val">' + (isFS ? '全屏' : '手机') + '</span>' +
              '<span class="soc-me-mode-switch">切换</span>' +
            '</button>' +
            '<div style="flex:1;"></div>' +
            '<div style="position:relative;">' +
              '<button class="soc-header-btn" id="socAddBtn" type="button">' +
                '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '</button>' +
              '<div class="soc-add-menu" id="socAddMenu">' +
                '<div class="soc-add-menu-item" data-action="addFriend"><span>加好友</span></div>' +
                '<div class="soc-add-menu-item" data-action="changeTheme"><span>更换主题</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="soc-search"><div class="soc-search-bar">' +
            '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>' +
            '<span>搜索</span>' +
          '</div></div>' +
          '<div class="soc-body" id="socBody"></div>' +
          '<div class="soc-tabbar">' +
            '<div class="soc-tab' + (Social.currentTab === 'chat' ? ' active' : '') + '" data-tab="chat">' +
              '<svg viewBox="0 0 64 64"><path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="23" y1="28" x2="41" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="34" x2="35" y2="34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
              '<span>聊天</span>' +
            '</div>' +
            '<div class="soc-tab' + (Social.currentTab === 'char' ? ' active' : '') + '" data-tab="char">' +
              '<svg viewBox="0 0 64 64"><path d="M4 34H14L18 26L23 42L28 20L33 38L37 30H44" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M52 28C52 25 50 23 48 23C46 23 44.5 25 44.5 25C44.5 25 43 23 41 23C39 23 37 25 37 28C37 32 44.5 37 44.5 37C44.5 37 52 32 52 28Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="44" y1="34" x2="60" y2="34" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
              '<span>通讯录</span>' +
            '</div>' +
            '<div class="soc-tab' + (Social.currentTab === 'moments' ? ' active' : '') + '" data-tab="moments">' +
              '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(120 32 32)"/></svg>' +
              '<span>朋友圈</span>' +
            '</div>' +
            '<div class="soc-tab' + (Social.currentTab === 'me' ? ' active' : '') + '" data-tab="me">' +
              '<svg viewBox="0 0 64 64"><defs><pattern id="mmg-hatch-tab" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" stroke-width="2.2"/></pattern></defs><circle cx="32" cy="33" r="21" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="url(#mmg-hatch-tab)" stroke="currentColor" stroke-width="1.6"/></svg>' +
              '<span>我的</span>' +
            '</div>' +
          '</div>' +
        '</div></div></div>';

      Social.renderTab();
      Social.bindEvents();
    },

    renderTab: function() {
      var body = App.$('#socBody');
      if (!body) return;
      var search = Social.panelEl.querySelector('.soc-search');
      var modeBtn = Social.panelEl.querySelector('#socModeToggle');

      if (Social.currentTab === 'me') {
        if (search) search.style.display = 'none';
        if (modeBtn) modeBtn.style.display = '';
      } else {
        if (search) search.style.display = '';
        if (modeBtn) modeBtn.style.display = 'none';
      }

      if (Social.currentTab === 'chat') Social.renderChatTab(body);
      else if (Social.currentTab === 'char') Social.renderCharTab(body);
      else if (Social.currentTab === 'moments') body.innerHTML = '<div class="soc-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><div class="soc-empty-text">朋友圈功能开发中</div></div>';
      else if (Social.currentTab === 'me') Social.renderMeTab(body);
    },

    renderChatTab: function(body) {
      var chars = App.character ? App.character.list : [];
      if (!chars.length) {
        body.innerHTML = '<div class="soc-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="soc-empty-text">暂无聊天<br>请先在「角色」中添加角色</div></div>';
        return;
      }
      body.innerHTML = chars.map(function(c) {
        var avatarHtml = c.avatar
          ? '<img src="' + App.esc(c.avatar) + '" alt="">'
          : '<div class="soc-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="soc-chat-item" data-char-id="' + c.id + '">' +
          '<div class="soc-avatar">' + avatarHtml + '</div>' +
          '<div class="soc-chat-content">' +
            '<div class="soc-chat-top"><span class="soc-chat-name">' + App.esc(c.name || '未命名') + '</span></div>' +
            '<div class="soc-chat-msg">点击开始聊天</div>' +
          '</div>' +
        '</div>';
      }).join('');

      body.querySelectorAll('.soc-chat-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var id = item.dataset.charId;
          if (id && App.chat) {
            Social.close();
            setTimeout(function() { App.chat.startChat(id); }, 380);
          }
        });
      });
    },

    renderCharTab: function(body) {
      var chars = App.character ? App.character.list : [];
      if (!chars.length) {
        body.innerHTML = '<div class="soc-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="soc-empty-text">暂无角色<br>请在底部栏「角色」中添加</div></div>';
        return;
      }
      body.innerHTML = chars.map(function(c) {
        var avatarHtml = c.avatar
          ? '<img src="' + App.esc(c.avatar) + '" alt="">'
          : '<div class="soc-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        return '<div class="soc-chat-item" data-char-id="' + c.id + '">' +
          '<div class="soc-avatar">' + avatarHtml + '</div>' +
          '<div class="soc-chat-content">' +
            '<div class="soc-chat-top"><span class="soc-chat-name">' + App.esc(c.name || '未命名') + '</span></div>' +
            '<div class="soc-chat-msg">' + App.esc((c.profile || '').split('\n')[0].slice(0, 30) || '暂无简介') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    renderMeTab: function(body) {
      var user = Social.userData;
      var name = user ? (user.nickname || user.realName || '未命名') : '未创建用户';

      var avatarHtml = user && user.avatar
        ? '<div class="soc-avatar-placeholder" style="width:80px;height:80px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);overflow:hidden;"><img src="' + App.esc(user.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;border:none;outline:none;"></div>'
        : '<div class="soc-avatar-placeholder" style="width:80px;height:80px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);"><svg viewBox="0 0 24 24" style="width:30px;height:30px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

      body.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;padding:30px 20px 16px;gap:12px;">' +
          '<div id="socMeAvatar" style="cursor:pointer;-webkit-tap-highlight-color:transparent;">' + avatarHtml + '</div>' +
          '<div style="font-size:17px;font-weight:600;color:#2e4258;">' + App.esc(name) + '</div>' +
          (user && user.sign ? '<div style="font-size:12px;color:#a8c0d8;">' + App.esc(user.sign) + '</div>' : '') +
        '</div>' +
        '<div>' +
          '<div class="soc-me-link" id="socOpenProfile">' +
            '<span class="soc-me-link-text">user资料</span>' +
            '<span class="soc-me-link-arrow">›</span>' +
          '</div>' +
        '</div>';

      body.querySelector('#socMeAvatar').addEventListener('click', function() {
        Social.uploadAvatar(this);
      });

            body.querySelector('#socOpenProfile').addEventListener('click', function() {
        Social.openGate();
      });
    },

    uploadAvatar: function(box) {
      var input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      document.body.appendChild(input);
      input.onchange = function(e) {
        var file = e.target.files[0];
        document.body.removeChild(input);
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var src = ev.target.result;
          if (App.cropImage) {
            App.cropImage(src, function(cropped) {
              if (!Social.userData) Social.userData = {};
              Social.userData.avatar = cropped;
              Social.save();
              Social.renderTab();
            });
          } else {
            if (!Social.userData) Social.userData = {};
            Social.userData.avatar = src;
            Social.save();
            Social.renderTab();
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },

    openGate: function() {
      var old = App.$('#userGatePage');
      if (old) old.remove();

      var page = document.createElement('div');
      page.id = 'userGatePage';
      page.className = 'up-gate';

      page.innerHTML =
        '<button class="up-gate-back" id="upGateBack" type="button"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg><span>返回</span></button>' +

        '<div class="up-gate-top" id="upGateTop">' +
          '<div class="up-gate-top-bg"></div>' +
          '<div class="up-ring up-ring-1"></div>' +
          '<div class="up-ring up-ring-2"></div>' +
          '<div class="up-ring up-ring-3"></div>' +
          '<div class="up-dot up-dot-1"></div>' +
          '<div class="up-dot up-dot-2"></div>' +
          '<div class="up-dot up-dot-3"></div>' +
          '<div class="up-dot up-dot-4"></div>' +
          '<div class="up-line up-line-1"></div>' +
          '<div class="up-line up-line-2"></div>' +
          '<div class="up-gate-text">' +
            '<div class="up-gate-en">FREE EDITING</div>' +
            '<div class="up-gate-title">自由编辑</div>' +
            '<div class="up-gate-desc">打开档案卡 · 自由填写每一项设定</div>' +
            '<div class="up-gate-arrow"><div class="up-gate-arrow-line"></div><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>' +
          '</div>' +
        '</div>' +

        '<div class="up-gate-divider"></div>' +

        '<div class="up-gate-bot" id="upGateBot">' +
          '<div class="up-gate-bot-bg"></div>' +
          '<div class="up-grid"></div>' +
          '<div class="up-pulse up-pulse-1"></div>' +
          '<div class="up-pulse up-pulse-2"></div>' +
          '<div class="up-cross up-cross-1"><div class="up-cross-h"></div><div class="up-cross-v"></div></div>' +
          '<div class="up-cross up-cross-2"><div class="up-cross-h"></div><div class="up-cross-v"></div></div>' +
          '<div class="up-gate-text">' +
            '<div class="up-gate-en">STEP BY STEP</div>' +
            '<div class="up-gate-title">一键生成</div>' +
            '<div class="up-gate-desc">逐步引导 · 轻松完成角色人设构建</div>' +
            '<div class="up-gate-arrow"><div class="up-gate-arrow-line"></div><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(page);

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.classList.add('show');
      }); });

      page.querySelector('#upGateBack').addEventListener('click', function() {
        Social.closeGate();
      });

      page.querySelector('#upGateTop').addEventListener('click', function() {
        Social.closeGate();
        setTimeout(function() { Social.openProfile(); }, 380);
      });

      page.querySelector('#upGateBot').addEventListener('click', function() {
        Social.closeGate();
        App.showToast('一键生成 · 开发中');
      });
    },

    closeGate: function() {
      var page = App.$('#userGatePage');
      if (!page) return;
      page.classList.remove('show');
      setTimeout(function() { if (page.parentNode) page.remove(); }, 350);
    },

    openProfile: function() {
      var old = App.$('#userProfilePage');
      if (old) old.remove();

      Social.load();
      var user = Social.userData || {};
      Social.sealed = !!(user._sealed);

      var today = new Date();
      var dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');

      var shortHtml = FIELDS_SHORT.map(function(f) {
        var val = user[f.key] || '';
        if (Social.sealed) {
          return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div></div><div class="up-field-line"><div class="up-text">' + App.esc(val || '—') + '</div></div></div>';
        }
        return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div></div><div class="up-field-line"><input type="text" data-key="' + f.key + '" placeholder="' + f.cn + '..." value="' + App.esc(val) + '"></div></div>';
      }).join('');

      var longHtml = FIELDS_LONG.map(function(f) {
        var val = user[f.key] || '';
        if (Social.sealed) {
          return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div></div><div class="up-field-box"><div class="up-text">' + App.esc(val || '—') + '</div></div></div>';
        }
        return '<div class="up-field"><div class="up-field-label"><div class="up-field-dot"></div><div class="up-field-key">' + f.en + '</div></div><div class="up-field-box"><textarea data-key="' + f.key + '" placeholder="' + f.cn + '...">' + App.esc(val) + '</textarea></div></div>';
      }).join('');

      var page = document.createElement('div');
      page.id = 'userProfilePage';
      page.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10003;background:#fff;display:flex;flex-direction:column;transition:transform 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.3s;transform:translateX(100%);opacity:0;';

      page.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:56px 16px 12px;flex-shrink:0;background:#fff;">' +
          '<div id="upBackBtn" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;">' +
            '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:#999;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>' +
            '<span style="font-size:12px;color:#999;">返回</span>' +
          '</div>' +
          '<div style="font-size:10px;color:#ccc;letter-spacing:3px;">PROFILE</div>' +
          '<div id="upRebuild" style="font-size:10px;color:#c9706b;letter-spacing:1.5px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;' + (Social.sealed ? '' : 'visibility:hidden;') + '">重建</div>' +
        '</div>' +

        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 40px;">' +
          '<div class="up-card" id="upCard">' +

            '<div class="up-seal' + (Social.sealed ? ' show' : '') + '" id="upSeal">' +
              '<div class="up-seal-outer"><div class="up-seal-dashes"></div>' +
                '<div class="up-seal-inner">' +
                  '<div class="up-seal-top">PERSONAL FILE</div>' +
                  '<div class="up-seal-main">封存</div>' +
                  '<div class="up-seal-line"></div>' +
                  '<div class="up-seal-stars"><span class="up-seal-star">★</span><span class="up-seal-label">SEALED</span><span class="up-seal-star">★</span></div>' +
                  '<div class="up-seal-date">' + dateStr + '</div>' +
                '</div>' +
              '</div>' +
              '<div class="up-seal-noise"></div>' +
            '</div>' +

            '<div class="up-bar-top"></div>' +
            '<div class="up-card-head"><div class="up-card-head-sub">PERSONAL FILE</div><div class="up-card-head-title">个 人 档 案</div></div>' +

            shortHtml +

            '<div class="up-divider"><div class="up-divider-line"></div><div class="up-divider-text">DETAIL</div><div class="up-divider-line"></div></div>' +

            longHtml +

            '<div class="up-card-foot">CLASSIFIED</div>' +
            '<div class="up-bar-bot"></div>' +

            '<div class="up-quill" id="upQuill" style="' + (Social.sealed ? 'display:none;' : '') + '"><img src="https://iili.io/BgIZWvI.md.png" draggable="false"></div>' +

          '</div>' +
        '</div>';

      document.body.appendChild(page);

      requestAnimationFrame(function() { requestAnimationFrame(function() {
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
      }); });

      page.querySelector('#upBackBtn').addEventListener('click', function() {
        Social.closeProfile();
      });

      page.querySelector('#upRebuild').addEventListener('click', function() {
        if (!confirm('确定要重建资料吗？将解除封存。')) return;
        if (Social.userData) Social.userData._sealed = false;
        Social.save();
        Social.sealed = false;
        Social.closeProfile();
        setTimeout(function() { Social.openProfile(); }, 380);
        App.showToast('已解除封存');
      });

      var quill = page.querySelector('#upQuill');
      if (quill) {
        quill.addEventListener('click', function() {
          Social.saveProfile();
        });
      }
    },

    closeProfile: function() {
      var page = App.$('#userProfilePage');
      if (!page) return;
      page.style.transform = 'translateX(100%)';
      page.style.opacity = '0';
      setTimeout(function() { if (page.parentNode) page.remove(); }, 350);
    },

    saveProfile: function() {
      var card = App.$('#upCard');
      if (!card) return;

      if (!Social.userData) Social.userData = {};

      card.querySelectorAll('input[data-key]').forEach(function(el) {
        Social.userData[el.dataset.key] = el.value.trim();
      });
      card.querySelectorAll('textarea[data-key]').forEach(function(el) {
        Social.userData[el.dataset.key] = el.value.trim();
      });

      Social.userData._sealed = true;
      Social.save();
      Social.sealed = true;

      // 显示印章动画
      var seal = App.$('#upSeal');
      if (seal) {
        requestAnimationFrame(function() { seal.classList.add('show'); });
      }

      // 隐藏羽毛笔
      var quill = App.$('#upQuill');
      if (quill) quill.style.display = 'none';

      // 显示重建按钮
      var rebuild = App.$('#upRebuild');
      if (rebuild) rebuild.style.visibility = '';

      // 输入框变文字
      var card2 = App.$('#upCard');
      card2.querySelectorAll('input[data-key]').forEach(function(el) {
        var div = document.createElement('div');
        div.className = 'up-text';
        div.textContent = el.value.trim() || '—';
        el.parentNode.replaceChild(div, el);
      });
      card2.querySelectorAll('textarea[data-key]').forEach(function(el) {
        var div = document.createElement('div');
        div.className = 'up-text';
        div.textContent = el.value.trim() || '—';
        div.style.whiteSpace = 'pre-wrap';
        el.parentNode.replaceChild(div, el);
      });

      App.showToast('档案已封存');
    },

    bindEvents: function() {
      App.safeOn('#socBackBtn', 'click', function() { Social.close(); });

      App.safeOn('#socModeToggle', 'click', function() {
        var current = App.LS.get('socFullScreen') || false;
        var next = !current;
        App.LS.set('socFullScreen', next);
        var wrap = App.$('#socWrap');
        if (wrap) {
          if (next) wrap.classList.add('soc-fullscreen');
          else wrap.classList.remove('soc-fullscreen');
        }
        var valEl = Social.panelEl.querySelector('.soc-me-mode-val');
        if (valEl) valEl.textContent = next ? '全屏' : '手机';
      });

      App.safeOn('#socAddBtn', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#socAddMenu');
        if (menu) menu.classList.toggle('show');
      });

      if (Social.panelEl) {
        Social.panelEl.querySelectorAll('.soc-add-menu-item').forEach(function(item) {
          item.addEventListener('click', function(e) {
            e.stopPropagation();
            var menu = App.$('#socAddMenu');
            if (menu) menu.classList.remove('show');
            if (item.dataset.action === 'addFriend') {
              App.showToast('加好友 · 开发中');
            } else if (item.dataset.action === 'changeTheme') {
              Social.close();
              setTimeout(function() { App.openPanel('themePanel'); }, 380);
            }
          });
        });

        Social.panelEl.addEventListener('click', function() {
          var menu = App.$('#socAddMenu');
          if (menu) menu.classList.remove('show');
        });

        Social.panelEl.querySelectorAll('.soc-tab').forEach(function(tab) {
          tab.addEventListener('click', function() {
            Social.currentTab = tab.dataset.tab;
            Social.panelEl.querySelectorAll('.soc-tab').forEach(function(t) {
              t.classList.toggle('active', t.dataset.tab === Social.currentTab);
            });
            Social.renderTab();
          });
        });
      }
    },

    init: function() {
      Social.load();
      if (!App.$('#socialPanel')) {
        var panel = document.createElement('div');
        panel.id = 'socialPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }
      App.user = Social;
      App.safeOn('#dockMine', 'click', function() { Social.open(); });
    }
  };

  App.register('user', Social);
})();