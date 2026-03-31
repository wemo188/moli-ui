/* =========================
   聊天头部
========================= */
.chat-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 54px 12px 12px;
  background: linear-gradient(180deg, var(--bg-secondary) 80%, transparent);
  position: relative;
  z-index: 10;
}

.chat-header h2 {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.chat-icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(173, 205, 234, 0.15);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  cursor: pointer;
  color: var(--accent-deep);
  flex-shrink: 0;
  transition: all 0.15s;
}

.chat-icon-btn:active {
  background: var(--accent);
  color: #fff;
  transform: scale(0.9);
}

.chat-icon-btn svg { width: 17px; height: 17px; }

/* =========================
   聊天主体
========================= */
.chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: var(--bg-primary);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 14px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-msg {
  display: flex;
  animation: chatSlideIn 0.35s cubic-bezier(0.22, 0.8, 0.2, 1);
}

@keyframes chatSlideIn {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.chat-msg-user { justify-content: flex-end; }
.chat-msg-char { justify-content: flex-start; }

.chat-msg-content {
  max-width: 78%;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.chat-msg-user .chat-msg-content {
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
  color: #fff;
  border-radius: 16px 4px 16px 16px;
  box-shadow: 0 2px 8px rgba(138, 184, 222, 0.3);
}

.chat-msg-char .chat-msg-content {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  border-radius: 4px 16px 16px 16px;
  box-shadow: 0 1px 4px var(--shadow);
}

/* =========================
   输入区
========================= */
.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px calc(10px + var(--safe-bottom));
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
}

.chat-action-btn {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(173, 205, 234, 0.12);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  cursor: pointer;
  color: var(--accent-deep);
  transition: all 0.15s;
}

.chat-action-btn:active {
  background: var(--accent);
  color: #fff;
  transform: scale(0.9);
}

.chat-action-btn svg { width: 18px; height: 18px; }

.chat-textarea {
  flex: 1;
  min-height: 34px;
  max-height: 100px;
  padding: 7px 14px;
  background: var(--bg-primary);
  border: 1.5px solid var(--border-light);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.chat-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(173, 205, 234, 0.2);
}

.chat-textarea::placeholder { color: var(--text-muted); }

.chat-send-btn {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(138, 184, 222, 0.35);
}

.chat-send-btn:active {
  transform: scale(0.88);
  box-shadow: 0 1px 4px rgba(138, 184, 222, 0.3);
}

.chat-send-btn svg { width: 16px; height: 16px; }

/* =========================
   侧边栏通用
========================= */
.chat-sidebar {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.chat-sidebar-left {
  left: 0;
  width: 220px;
  border-right: 1px solid var(--border-light);
  transform: translateX(0);
}

.chat-sidebar-left.hidden { transform: translateX(-100%); }

.chat-sidebar-right {
  right: 0;
  width: 160px;
  border-left: 1px solid var(--border-light);
  transform: translateX(0);
}

.chat-sidebar-right.hidden { transform: translateX(100%); }

.chat-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.chat-sidebar-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.chat-sidebar-add-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(138, 184, 222, 0.3);
  transition: transform 0.15s;
}

.chat-sidebar-add-btn:active { transform: scale(0.88); }
.chat-sidebar-add-btn svg { width: 14px; height: 14px; }

/* =========================
   右侧栏 - 用户区
========================= */
.chat-right-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 10px 12px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.chat-right-user:active {
  background: rgba(173, 205, 234, 0.12);
}

.chat-right-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 6px;
  box-shadow: 0 2px 8px rgba(138, 184, 222, 0.25);
}

.chat-right-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-right-avatar svg {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
}

.chat-right-username {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* =========================
   右侧栏 - 菜单列表
========================= */
.chat-right-list {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.chat-right-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-primary);
  position: relative;
}

.chat-right-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 14px;
  right: 14px;
  height: 1px;
  background: var(--border-light);
}

.chat-right-item:last-child::after { display: none; }

.chat-right-item:active {
  background: rgba(173, 205, 234, 0.15);
}

.chat-right-item svg {
  width: 18px;
  height: 18px;
  color: var(--accent-deep);
  flex-shrink: 0;
}

.chat-right-item span {
  font-size: 12px;
  font-weight: 500;
}

/* =========================
   对话列表
========================= */
.conv-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s;
  position: relative;
}

.conv-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 14px;
  right: 14px;
  height: 1px;
  background: var(--border-light);
}

.conv-item:last-child::after { display: none; }
.conv-item:active { background: var(--bg-primary); }

.conv-item.active {
  background: rgba(173, 205, 234, 0.12);
  border-left-color: var(--accent);
}

.conv-item-title {
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 6px;
}

.conv-del-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 16px;
  flex-shrink: 0;
  border-radius: 4px;
  transition: all 0.15s;
}

.conv-del-btn:active {
  color: #c44;
  background: rgba(220, 70, 70, 0.1);
}

/* =========================
   聊天遮罩
========================= */
.chat-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 150;
  transition: opacity 0.3s;
}

.chat-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}

/* =========================
   用户切换弹窗
========================= */
.chat-user-switcher {
  position: absolute;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: switcherFadeIn 0.2s ease;
}

@keyframes switcherFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.chat-user-switcher-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.chat-user-switcher-body {
  position: relative;
  width: 240px;
  max-height: 360px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  animation: switcherPopIn 0.3s cubic-bezier(0.22, 0.8, 0.2, 1);
}

@keyframes switcherPopIn {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.chat-user-switcher-title {
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
  text-align: center;
}

.chat-user-switcher-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.chat-user-switcher-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: var(--border-light);
}

.chat-user-switcher-item:last-child::after { display: none; }
.chat-user-switcher-item:active { background: var(--bg-primary); }

.chat-user-switcher-item.active {
  background: rgba(173, 205, 234, 0.15);
}

.chat-user-switcher-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--accent);
}

.chat-user-switcher-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 1.5px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.chat-user-switcher-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-user-switcher-avatar svg {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
}

.chat-user-switcher-item span {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

/* =========================
   角色/用户选择
========================= */
.user-select-list,
.char-select-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-select-card,
.char-select-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--bg-card);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px var(--shadow);
}

.user-select-card:active,
.char-select-card:active {
  transform: scale(0.97);
  background: var(--accent);
  border-color: var(--accent);
}

.user-select-card:active *,
.char-select-card:active * { color: #fff; }

.user-select-avatar,
.char-select-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 1.5px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.user-select-avatar img,
.char-select-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-select-avatar svg,
.char-select-avatar svg {
  width: 22px;
  height: 22px;
  color: var(--text-muted);
}

.user-select-info,
.char-select-info { flex: 1; min-width: 0; }

.user-select-name,
.char-select-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.user-select-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}
