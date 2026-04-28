
(function() {
  'use strict';
  var App = window.App;
  if (!App) return;

  var Wechat = {
    currentTab: 'chat',
    panelEl: null,
    _savedInner: '',
    _swipeState: {},

    open: function() {
      var panel = App.$('#wechatPanel');
      if (!panel) return;
      Wechat.panelEl = panel;
      Wechat.currentTab = 'chat';
      Wechat.render();
      panel.classList.remove('hidden');
      requestAnimationFrame(function() { panel.classList.add('show'); });
    },

    close: function() {
      var panel = App.$('#wechatPanel');
      if (!panel) return;
      panel.classList.remove('show');
      setTimeout(function() { panel.classList.add('hidden'); }, 350);
    },

    isCharVisible: function(c) {
      if (!c.contactMode || c.contactMode === 'direct') return true;
      if (c.contactAccepted === true) return true;
      return false;
    },

    render: function() {
      var panel = Wechat.panelEl;
      if (!panel) return;
      var isFS = App.LS.get('wxFullScreen') || false;
      var wrapClass = isFS ? 'wx-fullscreen' : '';

      panel.innerHTML =
        '<div class="' + wrapClass + '" id="wxWrap"><div class="wx-phone"><div class="wx-inner" id="wxInner">' +
          '<div class="wx-header">' +
            '<button class="wx-header-btn" id="wxBackBtn" type="button">' +
              '<svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>' +
            '</button>' +
            '<div style="flex:1;"></div>' +
            '<div style="position:relative;">' +
              '<button class="wx-header-btn" id="wxAddBtn" type="button">' +
                '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '</button>' +
              '<div class="wx-add-menu" id="wxAddMenu">' +
                '<div class="wx-add-menu-item" data-action="addFriend"><span>加好友</span></div>' +
                '<div class="wx-add-menu-item" data-action="changeTheme"><span>更换主题</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="wx-search"><div class="wx-search-bar">' +
            '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>' +
            '<span>搜索</span>' +
          '</div></div>' +
          '<div class="wx-body" id="wxBody"></div>' +
          '<div class="wx-tabbar">' +
            '<div class="wx-tab' + (Wechat.currentTab === 'chat' ? ' active' : '') + '" data-tab="chat">' +
              '<svg viewBox="0 0 64 64" style="width:32px;height:32px;"><path d="M32 15C21.5 15 13 22 13 31C13 36 16 40.5 20.6 43.2L18.5 50L26 46.4C27.9 46.9 29.9 47 32 47C42.5 47 51 40 51 31C51 22 42.5 15 32 15Z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="23" y1="28" x2="41" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="34" x2="35" y2="34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
              '<span>聊天</span>' +
            '</div>' +
            '<div class="wx-tab' + (Wechat.currentTab === 'char' ? ' active' : '') + '" data-tab="char">' +
              '<svg viewBox="0 0 64 64" style="width:32px;height:32px;"><path d="M4 34H14L18 26L23 42L28 20L33 38L37 30H44" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M52 28C52 25 50 23 48 23C46 23 44.5 25 44.5 25C44.5 25 43 23 41 23C39 23 37 25 37 28C37 32 44.5 37 44.5 37C44.5 37 52 32 52 28Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="44" y1="34" x2="60" y2="34" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
              '<span>通讯录</span>' +
            '</div>' +
            '<div class="wx-tab' + (Wechat.currentTab === 'moments' ? ' active' : '') + '" data-tab="moments">' +
              '<svg viewBox="0 0 64 64" style="width:32px;height:32px;"><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="18" ry="8" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(120 32 32)"/></svg>' +
              '<span>朋友圈</span>' +
            '</div>' +
            '<div class="wx-tab' + (Wechat.currentTab === 'me' ? ' active' : '') + '" data-tab="me">' +
              '<svg viewBox="0 0 64 64" style="width:32px;height:32px;"><defs><pattern id="wx-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" stroke-width="2.2"/></pattern></defs><circle cx="32" cy="33" r="21" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M32 44L22.4 34.8C19.6 32 19.6 27.6 22.4 24.8C25 22.2 29.2 22.2 31.2 25.2L32 26.4L32.8 25.2C34.8 22.2 39 22.2 41.6 24.8C44.4 27.6 44.4 32 41.6 34.8L32 44Z" fill="url(#wx-hatch)" stroke="currentColor" stroke-width="1.6"/></svg>' +
              '<span>我的</span>' +
            '</div>' +
          '</div>' +
        '</div></div></div>';

      Wechat.renderTab();
      Wechat.bindEvents();
    },

    renderTab: function() {
      var body = App.$('#wxBody');
      if (!body) return;
      var search = Wechat.panelEl ? Wechat.panelEl.querySelector('.wx-search') : null;

      if (Wechat.currentTab === 'me') {
        if (search) search.style.display = 'none';
      } else {
        if (search) search.style.display = '';
      }

      if (Wechat.currentTab === 'chat') Wechat.renderChatTab(body);
      else if (Wechat.currentTab === 'char') Wechat.renderCharTab(body);
      else if (Wechat.currentTab === 'moments') body.innerHTML = '<div class="wx-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><div class="wx-empty-text">朋友圈功能开发中</div></div>';
      else if (Wechat.currentTab === 'me') Wechat.renderMeTab(body);
    },

    renderChatTab: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });

      if (!visibleChars.length) {
        body.innerHTML = '<div class="wx-empty"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div class="wx-empty-text">暂无聊天<br>请先在「角色」中添加角色</div></div>';
        return;
      }

      // ★19 排序：置顶在前
      var pinned = App.chat ? App.chat.getPinned() : {};
      var sorted = visibleChars.slice().sort(function(a, b) {
        var ap = pinned[a.id] ? 1 : 0;
        var bp = pinned[b.id] ? 1 : 0;
        if (ap !== bp) return bp - ap;
        // 按最后消息时间排序
        var aMsgs = App.LS.get('chatMsgs_' + a.id);
        var bMsgs = App.LS.get('chatMsgs_' + b.id);
        var aTs = aMsgs && aMsgs.length ? (aMsgs[aMsgs.length - 1].ts || 0) : 0;
        var bTs = bMsgs && bMsgs.length ? (bMsgs[bMsgs.length - 1].ts || 0) : 0;
        return bTs - aTs;
      });

      body.innerHTML = sorted.map(function(c) {
        var isPinned = !!(pinned[c.id]);
        var rename = App.chat ? App.chat.getRename(c.id) : '';
        var displayName = rename || c.name || '未命名';
        var avatarHtml = c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '" alt="">'
          : '<div class="wx-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        var lastMsg = '';
        var lastTime = '';
        var msgs = App.LS.get('chatMsgs_' + c.id);
        if (msgs && msgs.length) {
          var last = msgs[msgs.length - 1];
          var rawMsg = (last.content || '').replace(/\[sticker:[^\]]+\]/g, '[表情]').split('|||')[0].slice(0, 25);
          lastMsg = rawMsg;
          if (last.ts) {
            var d = new Date(last.ts);
            var now = new Date();
            if (d.toDateString() === now.toDateString()) {
              lastTime = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
            } else {
              lastTime = (d.getMonth() + 1) + '/' + d.getDate();
            }
          }
        }
        var unread = App.chat ? App.chat.getUnread(c.id) : 0;
        var badgeHtml = unread > 0 ? '<div class="ct-unread-badge">' + (unread > 99 ? '99+' : unread) + '</div>' : '';
        var pinnedClass = isPinned ? ' pinned' : '';
        var renamedClass = rename ? ' wx-renamed' : '';

        return '<div class="wx-chat-item' + pinnedClass + renamedClass + '" data-char-id="' + c.id + '" style="position:relative;overflow:hidden;">' +
          '<div class="wx-chat-item-inner">' +
            '<div class="wx-avatar" style="position:relative;">' + avatarHtml + badgeHtml + '</div>' +
            '<div class="wx-chat-content">' +
              '<div class="wx-chat-top"><span class="wx-chat-name">' + App.esc(displayName) + '</span><span class="wx-chat-time">' + lastTime + '</span></div>' +
              '<div class="wx-chat-msg">' + App.esc(lastMsg || '点击开始聊天') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="wx-swipe-actions">' +
            '<button class="wx-swipe-btn pin" data-swipe-id="' + c.id + '">' + (isPinned ? '取消置顶' : '置顶') + '</button>' +
            '<button class="wx-swipe-btn rename" data-swipe-id="' + c.id + '">备注</button>' +
          '</div>' +
        '</div>';
      }).join('');

      // ★19 滑动操作
      body.querySelectorAll('.wx-chat-item').forEach(function(item) {
        var inner = item.querySelector('.wx-chat-item-inner');
        var actions = item.querySelector('.wx-swipe-actions');
        if (!inner || !actions) return;
        var sw = { active: false, sx: 0, moved: false, open: false };

        inner.addEventListener('touchstart', function(e) {
          var t = e.touches[0];
          sw = { active: true, sx: t.clientX, sy: t.clientY, moved: false, open: false, locked: false, isH: false };
          inner.style.transition = 'none';
        }, { passive: true });

        inner.addEventListener('touchmove', function(e) {
          if (!sw.active) return;
          var t = e.touches[0];
          var dx = t.clientX - sw.sx;
          var dy = Math.abs(t.clientY - sw.sy);
          if (!sw.locked) {
            if (Math.abs(dx) > 10 || dy > 10) {
              sw.locked = true;
              sw.isH = Math.abs(dx) > dy;
            }
            return;
          }
          if (!sw.isH) return;
          e.preventDefault();
          sw.moved = true;
          var maxSlide = -130;
          var x = Math.max(maxSlide, Math.min(0, dx));
          inner.style.transform = 'translateX(' + x + 'px)';
        }, { passive: false });

        inner.addEventListener('touchend', function() {
          if (!sw.active) return;
          sw.active = false;
          inner.style.transition = 'transform .25s ease';
          if (sw.moved) {
            var rect = inner.getBoundingClientRect();
            var parent = item.getBoundingClientRect();
            var offset = rect.left - parent.left;
            if (offset < -50) {
              inner.style.transform = 'translateX(-130px)';
              sw.open = true;
            } else {
              inner.style.transform = '';
              sw.open = false;
            }
          }
        }, { passive: true });

        // 点击聊天
        inner.addEventListener('click', function() {
          if (sw.moved) return;
          var id = item.dataset.charId;
          if (id && App.chat) App.chat.openInWechat(id);
        });

        // 置顶
        item.querySelector('.wx-swipe-btn.pin').addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.dataset.swipeId;
          if (!App.chat) return;
          var isPinned = App.chat.isPinned(id);
          App.chat.setPinned(id, !isPinned);
          inner.style.transform = '';
          Wechat.renderChatTab(body);
          App.showToast(isPinned ? '已取消置顶' : '已置顶');
        });

        // 备注
        item.querySelector('.wx-swipe-btn.rename').addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.dataset.swipeId;
          inner.style.transform = '';
          var current = App.chat ? App.chat.getRename(id) : '';
          var c = App.character ? App.character.getById(id) : null;
          var name = prompt('输入备注名（留空恢复原名）', current || (c ? c.name : ''));
          if (name === null) return;
          if (App.chat) App.chat.setRename(id, name.trim());
          Wechat.renderChatTab(body);
          App.showToast(name.trim() ? '已备注' : '已恢复原名');
        });
      });
    },

    // ★18 通讯录只显示名字
    renderCharTab: function(body) {
      var chars = App.character ? App.character.list : [];
      var visibleChars = chars.filter(function(c) { return Wechat.isCharVisible(c); });

      if (!visibleChars.length) {
        body.innerHTML = '<div class="wx-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><div class="wx-empty-text">暂无角色</div></div>';
        return;
      }

      body.innerHTML = visibleChars.map(function(c) {
        var avatarHtml = c.avatar
          ? '<img src="' + App.escAttr(c.avatar) + '" alt="">'
          : '<div class="wx-avatar-placeholder"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>';
        var rename = App.chat ? App.chat.getRename(c.id) : '';
        var displayName = rename || c.name || '未命名';
        return '<div class="wx-chat-item" data-char-id="' + c.id + '">' +
          '<div class="wx-avatar">' + avatarHtml + '</div>' +
          '<div class="wx-chat-content">' +
            '<div class="wx-chat-top"><span class="wx-chat-name">' + App.esc(displayName) + '</span></div>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    renderMeTab: function(body) {
      var user = App.user ? App.user.getActiveUser() : null;
      var name = user ? (user.nickname || user.realName || '未命名') : '未创建用户';
      var avatarHtml = user && user.avatar
        ? '<div style="width:80px;height:80px;border-radius:50%;overflow:hidden;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);"><img src="' + App.escAttr(user.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;"></div>'
        : '<div style="width:80px;height:80px;border-radius:50%;background:rgba(202,223,242,.15);border:2px solid rgba(192,206,220,.7);outline:2px solid rgba(255,255,255,1);display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" style="width:30px;height:30px;stroke:#a8c0d8;fill:none;stroke-width:1.5;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';

      body.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;padding:30px 20px 16px;gap:12px;">' +
          avatarHtml +
          '<div style="font-size:17px;font-weight:600;color:#2e4258;">' + App.esc(name) + '</div>' +
        '</div>' +
        '<div>' +
          // ★9 收藏带删除和转发
          '<div class="wx-me-link" id="wxMeFavs">' +
            '<span class="wx-me-link-text">收藏</span>' +
            '<span class="wx-me-link-arrow">›</span>' +
          '</div>' +
        '</div>';

      body.querySelector('#wxMeFavs').addEventListener('click', function() {
        Wechat.renderFavsPage(body);
      });
    },

    // ★9 收藏页面
    renderFavsPage: function(body) {
      var favs = App.LS.get('chatFavorites') || [];
      if (!favs.length) {
        body.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:13px;">暂无收藏</div>' +
          '<div style="padding:10px 20px;"><button id="wxFavsBack" type="button" style="padding:10px;background:none;border:1px solid #ddd;border-radius:8px;font-size:12px;color:#666;cursor:pointer;font-family:inherit;width:100%;">返回</button></div>';
        body.querySelector('#wxFavsBack').addEventListener('click', function() { Wechat.renderMeTab(body); });
        return;
      }

      var html = '<div style="padding:12px 16px;font-size:14px;font-weight:700;color:#2e4258;">收藏列表</div>';
      html += favs.map(function(f, i) {
        var time = f.savedAt ? new Date(f.savedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        return '<div style="padding:12px 16px;border-bottom:1px solid rgba(0,0,0,.04);position:relative;">' +
          '<div style="font-size:11px;color:#999;margin-bottom:4px;">' + App.esc(f.charName || '') + ' · ' + time + '</div>' +
          '<div style="font-size:13px;color:#333;line-height:1.5;padding-right:60px;">' + App.esc((f.content || '').slice(0, 200)) + '</div>' +
          '<div style="position:absolute;top:12px;right:12px;display:flex;gap:6px;">' +
            '<button class="fav-fwd" data-idx="' + i + '" type="button" style="padding:4px 8px;border:1px solid #ddd;border-radius:6px;background:#fff;font-size:10px;color:#7a9ab8;cursor:pointer;font-family:inherit;">转发</button>' +
            '<button class="fav-del" data-idx="' + i + '" type="button" style="padding:4px 8px;border:1px solid #ddd;border-radius:6px;background:#fff;font-size:10px;color:#c9706b;cursor:pointer;font-family:inherit;">删除</button>' +
          '</div>' +
        '</div>';
      }).join('');

      html += '<div style="padding:10px 16px;"><button id="wxFavsBack" type="button" style="padding:10px;background:none;border:1px solid #ddd;border-radius:8px;font-size:12px;color:#666;cursor:pointer;font-family:inherit;width:100%;">返回</button></div>';

      body.innerHTML = html;

      body.querySelector('#wxFavsBack').addEventListener('click', function() { Wechat.renderMeTab(body); });

      body.querySelectorAll('.fav-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(btn.dataset.idx);
          favs.splice(idx, 1);
          App.LS.set('chatFavorites', favs);
          Wechat.renderFavsPage(body);
          App.showToast('已删除');
        });
      });

      body.querySelectorAll('.fav-fwd').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var idx = parseInt(btn.dataset.idx);
          var fav = favs[idx];
          if (!fav) return;

          // 选择转发目标
          var chars = App.character ? App.character.list : [];
          var visible = chars.filter(function(c) { return Wechat.isCharVisible(c); });
          if (!visible.length) { App.showToast('暂无可转发的角色'); return; }

          var overlay = document.createElement('div');
          overlay.style.cssText = 'position:fixed;inset:0;z-index:100020;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;';
          overlay.innerHTML =
            '<div style="background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:14px;padding:20px;width:260px;max-height:60vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);">' +
              '<div style="font-size:14px;font-weight:700;color:#333;text-align:center;margin-bottom:12px;">转发给</div>' +
              visible.map(function(c) {
                var rename = App.chat ? App.chat.getRename(c.id) : '';
                var dn = rename || c.name || '?';
                return '<div class="fav-fwd-target" data-id="' + c.id + '" style="padding:12px;border-bottom:1px solid #f0f0f0;cursor:pointer;font-size:13px;color:#333;-webkit-tap-highlight-color:transparent;">' + App.esc(dn) + '</div>';
              }).join('') +
              '<div style="text-align:center;margin-top:10px;"><button id="fwdCancel" type="button" style="padding:8px 20px;border:none;background:none;font-size:12px;color:#999;cursor:pointer;font-family:inherit;">取消</button></div>' +
            '</div>';
          document.body.appendChild(overlay);
          overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
          overlay.querySelector('#fwdCancel').addEventListener('click', function() { overlay.remove(); });

          overlay.querySelectorAll('.fav-fwd-target').forEach(function(t) {
            t.addEventListener('click', function() {
              var targetId = t.dataset.id;
              overlay.remove();
              // 写入目标聊天记录
              var targetMsgs = App.LS.get('chatMsgs_' + targetId) || [];
              targetMsgs.push({ role: 'user', content: '[转发] ' + fav.content, ts: Date.now() });
              App.LS.set('chatMsgs_' + targetId, targetMsgs);
              App.showToast('已转发');
            });
          });
        });
      });
    },

    bindEvents: function() {
      App.safeOn('#wxBackBtn', 'click', function() { Wechat.close(); });

      App.safeOn('#wxAddBtn', 'click', function(e) {
        e.stopPropagation();
        var menu = App.$('#wxAddMenu');
        if (menu) menu.classList.toggle('show');
      });

      if (Wechat.panelEl) {
        Wechat.panelEl.querySelectorAll('.wx-add-menu-item').forEach(function(item) {
          item.addEventListener('click', function(e) {
            e.stopPropagation();
            var menu = App.$('#wxAddMenu');
            if (menu) menu.classList.remove('show');
            if (item.dataset.action === 'addFriend') {
              App.showToast('加好友 · 开发中');
            } else if (item.dataset.action === 'changeTheme') {
              Wechat.close();
              setTimeout(function() { App.openPanel('themePanel'); }, 380);
            }
          });
        });

        Wechat.panelEl.addEventListener('click', function() {
          var menu = App.$('#wxAddMenu');
          if (menu) menu.classList.remove('show');
        });

        Wechat.panelEl.querySelectorAll('.wx-tab').forEach(function(tab) {
          tab.addEventListener('click', function() {
            Wechat.currentTab = tab.dataset.tab;
            Wechat.panelEl.querySelectorAll('.wx-tab').forEach(function(t) {
              t.classList.toggle('active', t.dataset.tab === Wechat.currentTab);
            });
            Wechat.renderTab();
          });
        });
      }
    },

    restoreInner: function() {
      var inner = App.$('#wxInner');
      if (!inner || !Wechat._savedInner) return;
      inner.innerHTML = Wechat._savedInner;
      Wechat._savedInner = '';
      Wechat.renderTab();
      Wechat.bindEvents();
    },

    init: function() {
      if (!App.$('#wechatPanel')) {
        var panel = document.createElement('div');
        panel.id = 'wechatPanel';
        panel.className = 'fullpage-panel hidden';
        document.body.appendChild(panel);
      }
      App.wechat = Wechat;
    }
  };

  App.register('wechat', Wechat);
})();
