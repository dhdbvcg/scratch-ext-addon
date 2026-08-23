export default {
    id: 'realtime-collab',
    name: '实时协作',
    description: '多人实时协作编辑扩展制作器。支持创建/加入房间、在线用户列表、聊天、Blockly 工作区实时同步、房间隐私设置。基于 WebRTC（PeerJS）点对点连接，数据不经过中心服务器。',
    category: '协作',
    css: `
:global(.rtc-panel) {
  position: fixed;
  top: 60px;
  right: 20px;
  width: 420px;
  height: 560px;
  max-height: calc(100vh - 80px);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
  min-width: 300px;
  min-height: 360px;
}
:global(.rtc-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8eaed;
  border-radius: 10px 10px 0 0;
  user-select: none;
  flex-shrink: 0;
  cursor: default;
}
:global(.rtc-header-title) {
  font-size: 14px;
  font-weight: 600;
  color: #202124;
}
:global(.rtc-header-btns) {
  display: flex;
  gap: 4px;
}
:global(.rtc-header-btn) {
  width: 26px; height: 26px;
  border: none; border-radius: 6px;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #5f6368;
  transition: background .1s;
}
:global(.rtc-header-btn:hover) { background: #e8eaed; }
:global(.rtc-body) { padding: 12px 16px; overflow-y: auto; flex: 1; }

/* 自由拉伸手柄（8 方向） */
:global(.rtc-resize-layer) {
  position: fixed;
  pointer-events: none;
  z-index: 99998;
}
:global(.rtc-resize-handle) {
  position: absolute;
  pointer-events: auto;
  z-index: 99999;
}
:global(.rtc-resize-handle:hover) { background: rgba(26,115,232,.25); }
:global(.rtc-rz-n)  { top: -4px; left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
:global(.rtc-rz-s)  { bottom: -4px; left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
:global(.rtc-rz-e)  { right: -4px; top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
:global(.rtc-rz-w)  { left: -4px; top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
:global(.rtc-rz-ne) { top: -4px; right: -4px; width: 14px; height: 14px; cursor: nesw-resize; }
:global(.rtc-rz-nw) { top: -4px; left: -4px; width: 14px; height: 14px; cursor: nwse-resize; }
:global(.rtc-rz-se) { bottom: -4px; right: -4px; width: 14px; height: 14px; cursor: nwse-resize; }
:global(.rtc-rz-sw) { bottom: -4px; left: -4px; width: 14px; height: 14px; cursor: nesw-resize; }

/* 远程光标 */
:global(.rtc-cursor-layer) {
  position: fixed;
  top: 0; left: 0;
  pointer-events: none;
  z-index: 99997;
  overflow: hidden;
}
:global(.rtc-remote-cursor) {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left .15s, top .15s;
  pointer-events: none;
}
:global(.rtc-remote-cursor-pointer) {
  width: 16px; height: 16px;
  border-left: 3px solid #ff7043;
  border-top: 3px solid #ff7043;
  transform: rotate(-45deg);
  margin-top: -2px;
}
:global(.rtc-remote-cursor-name) {
  font-size: 11px; padding: 1px 6px; border-radius: 4px;
  background: #ff7043; color: #fff; white-space: nowrap;
  margin-top: 2px; font-weight: 500;
}
:global(.rtc-alpha-banner) {
  background: #fef7e0;
  border: 1px solid #fdd663;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #b06000;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.45;
}
:global(.rtc-alpha-banner svg) { flex-shrink: 0; margin-top: 1px; }
:global(.rtc-section-title) {
  display: flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 600; color: #202124;
  margin: 18px 0 12px;
}
:global(.rtc-section-title svg) { flex-shrink: 0; }
:global(.rtc-settings-badge) { margin-left: auto; }
:global(.rtc-settings-badge button) {
  width: 30px; height: 30px;
  border: none; border-radius: 6px;
  background: transparent;
  cursor: pointer; color: #5f6368;
  font-size: 16px; display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
:global(.rtc-settings-badge button:hover) { background: #f1f3f4; }

/* 用户名行 */
:global(.rtc-username-row) {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 4px; font-size: 13px; color: #5f6368;
}
:global(.rtc-username-row svg) { flex-shrink: 0; }
:global(.rtc-username-edit) {
  border: none; background: transparent;
  color: #1a73e8; cursor: pointer;
  font-size: 13px; padding: 2px 4px; border-radius: 4px;
}
:global(.rtc-username-edit:hover) { background: #e8f0fe; }

/* 表单 */
:global(.rtc-field-label) { font-size: 13px; font-weight: 600; color: #202124; margin: 14px 0 6px; }
:global(.rtc-input) {
  width: 100%; box-sizing: border-box;
  padding: 10px 14px; border: 1px solid #dadce0;
  border-radius: 8px; font-size: 14px; outline: none;
  transition: border-color .2s, box-shadow .2s;
  font-family: inherit;
}
:global(.rtc-input:focus) { border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26,115,232,.12); }
:global(.rtc-input::placeholder) { color: #9aa0a6; }

/* 按钮 */
:global(.rtc-btn) {
  width: 100%; padding: 11px; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: opacity .15s, transform .1s; margin-top: 8px;
  font-family: inherit;
}
:global(.rtc-btn:hover) { opacity: .9; }
:global(.rtc-btn:active) { transform: scale(.98); }
:global(.rtc-btn-primary) { background: #4db6ac; color: #fff; }
:global(.rtc-btn-danger) { background: #ff7043; color: #fff; }
:global(.rtc-btn-outline) { background: transparent; border: 1px solid #dadce0; color: #1a73e8; }
:global(.rtc-btn-outline:hover) { background: #f1f3f4; }

/* 警告提示 */
:global(.rtc-hint) {
  background: #f8f9fa; border: 1px solid #e8eaed;
  border-radius: 8px; padding: 8px 12px; margin-top: 8px;
  font-size: 12px; color: #5f6368; line-height: 1.45;
  display: flex; align-items: flex-start; gap: 6px;
}
:global(.rtc-hint svg) { flex-shrink: 0; margin-top: 1px; color: #f4b400; }

/* 分隔线 */
:global(.rtc-divider) { border: none; border-top: 1px solid #e8eaed; margin: 18px 0; }

/* 已连接状态 */
:global(.rtc-room-name) { font-size: 15px; font-weight: 600; color: #202124; }
:global(.rtc-status) {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #1e8e3e; margin-top: 4px;
}
:global(.rtc-status-dot) {
  width: 8px; height: 8px; border-radius: 50%;
  background: #34a853; flex-shrink: 0;
}

/* 用户列表 */
:global(.rtc-users-title) { font-size: 13px; font-weight: 600; color: #202124; margin: 14px 0 8px; }
:global(.rtc-user-item) {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 8px;
  margin-bottom: 6px; font-size: 14px; color: #202124;
}
:global(.rtc-user-item.host) { background: #e8f0fe; }
:global(.rtc-user-item.self) { background: #e6f4ea; }
:global(.rtc-user-item.host.self) { background: #fce8e6; }
:global(.rtc-user-icon) { flex-shrink: 0; font-size: 18px; }
:global(.rtc-user-name) { font-weight: 500; flex: 1; }
:global(.rtc-badges) { display: flex; gap: 4px; flex-shrink: 0; }
:global(.rtc-badge) {
  padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500;
}
:global(.rtc-badge-host) { background: #c5cae9; color: #1a237e; }
:global(.rtc-badge-you) { background: #b2dfdb; color: #004d40; }

/* 聊天区域 */
:global(.rtc-chat-title) { font-size: 13px; font-weight: 600; color: #202124; margin: 14px 0 8px; }
:global(.rtc-chat-box) {
  background: #f8f9fa; border: 1px solid #e8eaed; border-radius: 8px;
  padding: 10px; min-height: 80px; max-height: 160px; overflow-y: auto;
  font-size: 13px; line-height: 1.6; margin-bottom: 8px;
}
:global(.rtc-chat-msg) { margin-bottom: 4px; word-break: break-word; }
:global(.rtc-chat-msg-name) { font-weight: 600; color: #1a73e8; }
:global(.rtc-chat-input-wrap) { display: flex; gap: 6px; }
:global(.rtc-chat-input) {
  flex: 1; padding: 8px 12px; border: 1px solid #dadce0;
  border-radius: 8px; font-size: 13px; outline: none; font-family: inherit;
}
:global(.rtc-chat-input:focus) { border-color: #1a73e8; }

/* 隐私设置 */
:global(.rtc-privacy-title) { font-size: 13px; font-weight: 600; color: #202124; margin: 14px 0 8px; }
:global(.rtc-privacy-option) {
  border: 1px solid #dadce0; border-radius: 8px; padding: 12px 14px;
  margin-bottom: 8px; cursor: pointer; transition: background .15s, border-color .15s;
}
:global(.rtc-privacy-option:hover) { background: #f8f9fa; }
:global(.rtc-privacy-option.active) { background: #e0f2f1; border-color: #4db6ac; }
:global(.rtc-privacy-opt-name) { font-size: 14px; font-weight: 500; color: #202124; }
:global(.rtc-privacy-opt-desc) { font-size: 12px; color: #5f6368; margin-top: 2px; }

/* 触发按钮（在 ExtensionBuilder 工具栏） */
:global(.rtc-trigger-btn) {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border: 1px solid #dadce0; border-radius: 8px;
  background: #fff; cursor: pointer; font-size: 13px; color: #202124;
  font-family: inherit; transition: background .15s, box-shadow .15s;
}
:global(.rtc-trigger-btn:hover) { background: #f8f9fa; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
`,
    setup: async function (ctx) {
        const { document, window, createElement, addToolbarButton, mountPanel, effect } = ctx;

        // ─── 配置 ───
        const PEERJS_SERVER = 'peerjs.com'; // 或 '0.peerjs.com'
        const PEERJS_PORT = 443;
        const PEERJS_PATH = '/';
        const STORAGE_PREFIX = 'rtc_collab_';

        // ─── 状态 ───
        // 优先使用 ExtensionBuilder 登录系统的用户名
        let username = '';
        try {
            const sessionRaw = localStorage.getItem('extbuilder_session') || sessionStorage.getItem('extbuilder_session');
            if (sessionRaw) {
                const s = JSON.parse(sessionRaw);
                if (s && s.username) username = s.username;
            }
        } catch(e) {}
        // 回退：localStorage 旧值或随机生成
        if (!username) {
            username = localStorage.getItem(STORAGE_PREFIX + 'username') || '';
        }
        if (!username) {
            username = 'player' + Math.floor(Math.random() * 9000 + 1000);
        }
        localStorage.setItem(STORAGE_PREFIX + 'username', username);
        let peer = null;
        let connections = {};       // peerId -> { conn, metadata }
        let isHost = false;
        let roomId = '';
        let privacy = 'public';     // 'public' | 'private'
        let myPeerId = '';
        let chatMessages = [];
        let pendingXml = null;      // 收到但暂缓应用的 XML（避免循环广播）
        let suppressBroadcast = false;

        // ─── DOM 构建 ───
        const panel = createElement('div', { className: 'rtc-panel' });

        // 最大化状态
        let isMaximized = false;
        let savedBounds = null;

        // 拖拽功能
        let dragState = null;
        function startDrag(e) {
            if (isMaximized) return;
            if (e.target.closest('.rtc-header-btn')) return;
            const rect = panel.getBoundingClientRect();
            dragState = {
                startX: e.clientX,
                startY: e.clientY,
                origLeft: rect.left,
                origTop: rect.top,
                origW: rect.width,
                origH: rect.height
            };
            e.preventDefault();
        }
        function onDrag(e) {
            if (!dragState) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            let newLeft = dragState.origLeft + dx;
            let newTop = dragState.origTop + dy;
            // 边界约束
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - 60));
            newLeft = Math.max(-dragState.origW + 80, Math.min(newLeft, window.innerWidth - 80));
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
            panel.style.right = 'auto';
            panel.style.transform = 'none';
            syncResizeLayer();
        }
        function endDrag() { dragState = null; }

        // 自由拉伸功能（8 方向）
        let resizeState = null;
        const RESIZE_DIRS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
        const resizeLayer = createElement('div', { className: 'rtc-resize-layer' });
        RESIZE_DIRS.forEach(dir => {
            const h = createElement('div', { className: 'rtc-resize-handle rtc-rz-' + dir });
            h.dataset.dir = dir;
            h.addEventListener('mousedown', (e) => startResize(e, dir));
            resizeLayer.appendChild(h);
        });
        document.body.appendChild(resizeLayer);

        function syncResizeLayer() {
            if (panel.style.display === 'none' || isMaximized) { resizeLayer.style.display = 'none'; return; }
            resizeLayer.style.display = '';
            const r = panel.getBoundingClientRect();
            resizeLayer.style.left = r.left + 'px';
            resizeLayer.style.top = r.top + 'px';
            resizeLayer.style.width = r.width + 'px';
            resizeLayer.style.height = r.height + 'px';
        }

        function startResize(e, dir) {
            if (isMaximized) return;
            e.preventDefault();
            e.stopPropagation();
            const r = panel.getBoundingClientRect();
            resizeState = {
                dir,
                startX: e.clientX,
                startY: e.clientY,
                origLeft: r.left,
                origTop: r.top,
                origW: r.width,
                origH: r.height
            };
        }

        function onResize(e) {
            if (!resizeState) return;
            const d = resizeState;
            const dx = e.clientX - d.startX;
            const dy = e.clientY - d.startY;
            let newLeft = d.origLeft;
            let newTop = d.origTop;
            let newW = d.origW;
            let newH = d.origH;
            const minW = 300, minH = 360;
            if (d.dir.indexOf('e') !== -1) newW = Math.max(minW, d.origW + dx);
            if (d.dir.indexOf('s') !== -1) newH = Math.max(minH, d.origH + dy);
            if (d.dir.indexOf('w') !== -1) {
                newW = Math.max(minW, d.origW - dx);
                newLeft = d.origLeft + (d.origW - newW);
            }
            if (d.dir.indexOf('n') !== -1) {
                newH = Math.max(minH, d.origH - dy);
                newTop = d.origTop + (d.origH - newH);
            }
            // 边界约束
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 40));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - 40));
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
            panel.style.right = 'auto';
            panel.style.width = newW + 'px';
            panel.style.height = newH + 'px';
            panel.style.transform = 'none';
            syncResizeLayer();
        }

        function endResize() { resizeState = null; }

        function toggleMaximize() {
            if (!isMaximized) {
                // 保存当前位置尺寸
                const rect = panel.getBoundingClientRect();
                savedBounds = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
                // 最大化：撑满屏幕（留边距）
                panel.style.top = '8px';
                panel.style.left = '8px';
                panel.style.right = '8px';
                panel.style.width = '';
                panel.style.height = 'calc(100vh - 16px)';
                panel.style.transform = 'none';
                isMaximized = true;
            } else {
                // 还原
                if (savedBounds) {
                    panel.style.top = savedBounds.top + 'px';
                    panel.style.left = savedBounds.left + 'px';
                    panel.style.right = 'auto';
                    panel.style.width = savedBounds.width + 'px';
                    panel.style.height = savedBounds.height + 'px';
                    panel.style.transform = 'none';
                }
                isMaximized = false;
            }
            render();
            syncResizeLayer();
        }

        function render() {
            panel.innerHTML = '';

            // Header（可拖拽）
            const header = createElement('div', { className: 'rtc-header' });
            header.innerHTML = '<span class="rtc-header-title">实时协作</span>' +
                '<div class="rtc-header-btns">' +
                '<button class="rtc-header-btn" title="最小化">−</button>' +
                '<button class="rtc-header-btn" title="' + (isMaximized ? '还原' : '最大化') + '">' + (isMaximized ? '❐' : '□') + '</button>' +
                '<button class="rtc-header-btn" title="关闭">×</button></div>';
            panel.appendChild(header);

            // 拖拽事件
            header.addEventListener('mousedown', startDrag);
            header.querySelector('[title="最小化"]').onclick = () => { panel.style.display = 'none'; };
            header.querySelector('[title="' + (isMaximized ? '还原' : '最大化') + '"]').onclick = toggleMaximize;
            header.querySelector('[title="关闭"]').onclick = closePanel;

            const body = createElement('div', { className: 'rtc-body' });
            panel.appendChild(body);

            // Alpha 警告
            body.innerHTML += '<div class="rtc-alpha-banner">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                '<span><strong>Alpha</strong> 警告：此功能处于早期开发阶段。你的项目可能会损坏或出错。使用风险自负。</span></div>';

            if (!peer || !roomId) {
                renderLanding(body);
            } else {
                renderConnected(body);
            }
        }

        function renderLanding(body) {
            // 标题栏
            const secTitle = createElement('div', { className: 'rtc-section-title' });
            secTitle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>实时协作' +
                '<span class="rtc-settings-badge"><button title="设置">⚙</button></span>';
            body.appendChild(secTitle);

            // 用户名
            const unameRow = createElement('div', { className: 'rtc-username-row' });
            unameRow.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '<span>你的用户名是: <strong>' + escapeHtml(username) + '</strong></span>' +
                '<button class="rtc-username-edit">✎</button>';
            body.appendChild(unameRow);
            unameRow.querySelector('.rtc-username-edit').onclick = () => {
                const newName = prompt('输入用户名:', username);
                if (newName && newName.trim()) {
                    username = newName.trim().slice(0, 20);
                    localStorage.setItem(STORAGE_PREFIX + 'username', username);
                    render();
                    broadcastUserInfo();
                }
            };

            // 加入房间
            body.appendChild(createElement('div', { className: 'rtc-field-label', textContent: '加入现有房间' }));
            const joinInput = createElement('input', { className: 'rtc-input', placeholder: '输入房间ID...' });
            body.appendChild(joinInput);
            const joinBtn = createElement('button', { className: 'rtc-btn rtc-btn-primary', textContent: '加入房间' });
            body.appendChild(joinBtn);
            const joinHint = createElement('div', { className: 'rtc-hint' });
            joinHint.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                '<span>房主可以看到您的 IP 地址，其他成员不能。</span>';
            body.appendChild(joinHint);

            joinBtn.onclick = () => {
                const id = joinInput.value.trim();
                if (!id) return alert('请输入房间ID');
                joinRoom(id);
            };
            joinInput.onkeydown = (e) => { if (e.key === 'Enter') joinBtn.click(); };

            // 分隔线
            body.appendChild(createElement('hr', { className: 'rtc-divider' }));

            // 创建新房间
            body.appendChild(createElement('div', { className: 'rtc-field-label', textContent: '创建新房间' }));
            body.appendChild(createElement('div', { style: 'font-size:13px;color:#5f6368;margin-bottom:8px;', textContent: '生成新的房间ID以开始与他人协作。分享房间URL邀请他人。' }));
            const createBtn = createElement('button', { className: 'rtc-btn rtc-btn-outline', textContent: '创建新房间' });
            body.appendChild(createBtn);
            const createHint = createElement('div', { className: 'rtc-hint' });
            createHint.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                '<span>加入的人可以看到您的 IP 地址，您也可以看到他们的。</span>';
            body.appendChild(createHint);

            createBtn.onclick = () => createRoom();
        }

        function renderConnected(body) {
            // 房间信息
            const roomInfo = createElement('div', { className: 'rtc-section-title' });
            roomInfo.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
                '<span class="rtc-room-name">房间:' + escapeHtml(roomId) + '</span>';
            body.appendChild(roomInfo);

            // 连接状态
            const status = createElement('div', { className: 'rtc-status' });
            status.innerHTML = '<span class="rtc-status-dot"></span><span>已连接 · ' + (Object.keys(connections).length + 1) + ' 位用户在线</span>';
            body.appendChild(status);

            // 已连接用户
            body.appendChild(createElement('div', { className: 'rtc-users-title', textContent: '已连接用户' }));

            const usersList = createElement('div');
            // 自己
            usersList.appendChild(renderUserItem(username, true, true));
            // 其他用户
            Object.values(connections).forEach(c => {
                if (c.metadata && c.metadata.username) {
                    usersList.appendChild(renderUserItem(c.metadata.username, c.metadata.isHost || false, false));
                }
            });
            body.appendChild(usersList);

            // 聊天
            body.appendChild(createElement('hr', { className: 'rtc-divider' }));
            body.appendChild(createElement('div', { className: 'rtc-chat-title', textContent: '按 / 进行聊天' }));

            const chatBox = createElement('div', { className: 'rtc-chat-box' });
            chatMessages.forEach(m => {
                const msgEl = createElement('div', { className: 'rtc-chat-msg' });
                msgEl.innerHTML = '<span class="rtc-chat-msg-name">' + escapeHtml(m.name) + '</span>: ' + escapeHtml(m.text);
                chatBox.appendChild(msgEl);
            });
            body.appendChild(chatBox);
            // 自动滚动到底部
            chatBox.scrollTop = chatBox.scrollHeight;

            const chatWrap = createElement('div', { className: 'rtc-chat-input-wrap' });
            const chatInput = createElement('input', { className: 'rtc-chat-input', placeholder: '输入消息… (按 Enter 发送)' });
            const chatSendBtn = createElement('button', { className: 'rtc-btn rtc-btn-primary', textContent: '发送', style: 'width:auto;padding:8px 16px;margin-top:0;' });
            chatWrap.appendChild(chatInput);
            chatWrap.appendChild(chatSendBtn);
            body.appendChild(chatWrap);

            const doSend = () => {
                const text = chatInput.value.trim();
                if (!text) return;
                addChatMessage(username, text);
                broadcast({ type: 'chat', name: username, text: text });
                chatInput.value = '';
            };
            chatSendBtn.onclick = doSend;
            chatInput.onkeydown = (e) => { if (e.key === 'Enter') doSend(); };

            // 房主：隐私设置
            if (isHost) {
                body.appendChild(createElement('hr', { className: 'rtc-divider' }));
                body.appendChild(createElement('div', { className: 'rtc-privacy-title', textContent: '房间隐私设置' }));

                const pubOpt = createElement('div', { className: 'rtc-privacy-option' + (privacy === 'public' ? ' active' : '') });
                pubOpt.innerHTML = '<div class="rtc-privacy-opt-name">公开房间</div><div class="rtc-privacy-opt-desc">任何人都可以加入此房间，无需批准</div>';
                pubOpt.onclick = () => { privacy = 'public'; broadcast({ type: 'privacy', value: 'public' }); render(); };
                body.appendChild(pubOpt);

                const privOpt = createElement('div', { className: 'rtc-privacy-option' + (privacy === 'private' ? ' active' : '') });
                privOpt.innerHTML = '<div class="rtc-privacy-opt-name">私人房间</div><div class="rtc-privacy-opt-desc">用户必须请求批准才能加入此房间</div>';
                privOpt.onclick = () => { privacy = 'private'; broadcast({ type: 'privacy', value: 'private' }); render(); };
                body.appendChild(privOpt);
            }

            // 底部按钮
            body.appendChild(createElement('hr', { className: 'rtc-divider' }));
            const copyBtn = createElement('button', { className: 'rtc-btn rtc-btn-primary', textContent: '📋 复制房间URL以分享' });
            copyBtn.onclick = () => {
                const url = location.origin + location.pathname + '#rtc=' + roomId;
                navigator.clipboard.writeText(url).then(() => {
                    copyBtn.textContent = '✓ 已复制';
                    setTimeout(() => { copyBtn.textContent = '📋 复制房间URL以分享'; }, 2000);
                }).catch(() => {
                    prompt('复制此链接分享给协作者:', url);
                });
            };
            body.appendChild(copyBtn);

            const leaveBtn = createElement('button', { className: 'rtc-btn rtc-btn-danger', textContent: '离开房间' });
            leaveBtn.onclick = leaveRoom;
            body.appendChild(leaveBtn);
        }

        function renderUserItem(name, isHostFlag, isYou) {
            const item = createElement('div', { className: 'rtc-user-item' + (isHostFlag ? ' host' : '') + (isYou ? ' self' : '') });
            let icon = '👤';
            if (isHostFlag) icon = '👑';
            item.innerHTML = '<span class="rtc-user-icon">' + icon + '</span>' +
                '<span class="rtc-user-name">' + escapeHtml(name) + '</span>' +
                '<span class="rtc-badges">' +
                (isHostFlag ? '<span class="rtc-badge rtc-badge-host">房主</span>' : '') +
                (isYou ? '<span class="rtc-badge rtc-badge-you">你</span>' : '') +
                '</span>';
            return item;
        }

        // ─── PeerJS / WebRTC 核心 ───

        async function initPeer() {
            if (peer) return peer;
            try {
                // 动态加载 PeerJS（CDN）
                if (typeof window.Peer === 'undefined') {
                    await loadScript('https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js');
                }
                peer = new window.Peer({
                    debug: 0,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' }
                        ]
                    }
                });
                peer.on('open', (id) => {
                    myPeerId = id;
                    console.log('[RTC] Peer ID:', id);
                });
                peer.on('connection', (conn) => {
                    handleConnection(conn);
                });
                peer.on('error', (err) => {
                    console.error('[RTC] Peer error:', err.type, err);
                    if (err.type === 'peer-unavailable') {
                        alert('无法找到该房间。房间可能已关闭或 ID 错误。');
                    } else if (err.type === 'server-error') {
                        alert('信令服务器连接失败，请检查网络后重试。');
                    }
                });
                peer.on('disconnected', () => {
                    console.warn('[RTC] Peer disconnected from signaling server');
                });
                return peer;
            } catch (e) {
                console.error('[RTC] Failed to init PeerJS:', e);
                alert('无法加载实时协作库（PeerJS），请检查网络连接。');
                return null;
            }
        }

        function loadScript(src) {
            return new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        async function createRoom() {
            const p = await initPeer();
            if (!p) return;
            await new Promise((resolve) => { p.open ? resolve() : p.on('open', resolve); });

            // 用 peerId 后缀生成短房间ID
            roomId = generateRoomId();
            isHost = true;
            privacy = 'public';
            chatMessages = [];

            // 把当前工作区 XML 记录为初始状态
            try { pendingXml = getWorkspaceXml(); } catch(e) {}

            startCursorMonitor();
            render();
            console.log('[RTC] Room created:', roomId);
            alert('房间已创建！房间ID: ' + roomId + '\n请通过「复制房间URL」分享给他人。');
        }

        async function joinRoom(id) {
            const p = await initPeer();
            if (!p) return;
            await new Promise((resolve) => { p.open ? resolve() : p.on('open', resolve); });

            roomId = id;
            isHost = false;
            chatMessages = [];

            // 连接房主（房主的 peerId 约定为房间ID）
            const conn = p.connect(id, { reliable: true });
            handleConnection(conn);

            startCursorMonitor();
            render();
        }

        function handleConnection(conn) {
            conn.on('open', () => {
                console.log('[RTC] Connected to:', conn.peer);
                connections[conn.peer] = { conn, metadata: {} };

                // 发送自己的用户信息
                conn.send(JSON.stringify({
                    type: 'user-info',
                    username: username,
                    isHost: isHost
                }));

                // 如果我是房主，把当前工作区XML发给新成员
                if (isHost) {
                    try {
                        const xml = getWorkspaceXml();
                        conn.send(JSON.stringify({ type: 'workspace-xml', xml: xml, from: myPeerId }));
                    } catch(e) {}
                }

                // 请求房主发最新XML（非房主）
                if (!isHost) {
                    conn.send(JSON.stringify({ type: 'request-xml' }));
                }

                render();
            });

            conn.on('data', (data) => {
                try {
                    const msg = typeof data === 'string' ? JSON.parse(data) : data;
                    handleMessage(msg, conn.peer);
                } catch(e) {
                    console.warn('[RTC] Invalid message:', e);
                }
            });

            conn.on('close', () => {
                console.log('[RTC] Connection closed:', conn.peer);
                removeRemoteCursor(conn.peer);
                delete connections[conn.peer];
                render();
            });

            conn.on('error', (err) => {
                console.error('[RTC] Connection error:', err);
            });
        }

        function handleMessage(msg, fromPeerId) {
            switch (msg.type) {
                case 'user-info':
                    if (connections[fromPeerId]) {
                        connections[fromPeerId].metadata = msg;
                    }
                    render();
                    break;

                case 'chat':
                    addChatMessage(msg.name || '未知', msg.text || '');
                    render();
                    break;

                case 'workspace-xml':
                    if (msg.from !== myPeerId) {
                        suppressBroadcast = true;
                        try { setWorkspaceXml(msg.xml); } catch(e) {}
                        setTimeout(() => { suppressBroadcast = false; }, 500);
                    }
                    break;

                case 'request-xml':
                    if (isHost) {
                        try {
                            const xml = getWorkspaceXml();
                            const targetConn = connections[fromPeerId];
                            if (targetConn && targetConn.conn) {
                                targetConn.conn.send(JSON.stringify({ type: 'workspace-xml', xml: xml, from: myPeerId }));
                            }
                        } catch(e) {}
                    }
                    break;

                case 'privacy':
                    privacy = msg.value || 'public';
                    render();
                    break;

                case 'cursor':
                    if (msg.x != null && msg.y != null) {
                        const senderName = (connections[fromPeerId] && connections[fromPeerId].metadata && connections[fromPeerId].metadata.username) || '?';
                        updateRemoteCursor(fromPeerId, senderName, msg.x, msg.y);
                    }
                    break; // 不触发 render（光标更新太频繁）

                default:
                    break;
            }
        }

        function broadcast(msgObj) {
            const data = JSON.stringify(msgObj);
            Object.values(connections).forEach(c => {
                try { c.conn.send(data); } catch(e) {}
            });
        }

        function broadcastUserInfo() {
            broadcast({ type: 'user-info', username: username, isHost: isHost });
        }

        // ─── Blockly 工作区同步 ───
        let workspaceChangeListener = null;

        function startWorkspaceSync() {
            try {
                const ws = ctx.getWorkspace ? ctx.getWorkspace() : null;
                if (!ws) return;

                workspaceChangeListener = function(event) {
                    if (suppressBroadcast) return;
                    // 防抖：不要每个事件都广播，用 requestAnimationFrame 合并
                    if (workspaceChangeListener._raf) return;
                    workspaceChangeListener._raf = requestAnimationFrame(() => {
                        workspaceChangeListener._raf = null;
                        try {
                            const xml = getWorkspaceXml();
                            broadcast({ type: 'workspace-xml', xml: xml, from: myPeerId });
                        } catch(e) {}
                    });
                };
                ws.addChangeListener(workspaceChangeListener);
            } catch(e) {
                console.warn('[RTC] Cannot attach workspace listener:', e);
            }
        }

        function stopWorkspaceSync() {
            try {
                const ws = ctx.getWorkspace ? ctx.getWorkspace() : null;
                if (ws && workspaceChangeListener) {
                    ws.removeChangeListener(workspaceChangeListener);
                    workspaceChangeListener = null;
                }
            } catch(e) {}
        }

        function getWorkspaceXml() {
            const ws = ctx.getWorkspace ? ctx.getWorkspace() : null;
            if (!ws) throw new Error('No workspace');
            return ctx.Blockly.Xml.workspaceToDom(ws);
        }

        function setWorkspaceXml(xmlDom) {
            const ws = ctx.getWorkspace ? ctx.getWorkspace() : null;
            if (!ws) return;
            ws.clear();
            ctx.Blockly.Xml.domToWorkspace(xmlDom, ws);
        }

        // ─── 聊天 ───
        function addChatMessage(name, text) {
            chatMessages.push({ name, text, time: Date.now() });
            if (chatMessages.length > 200) chatMessages.shift(); // 限制历史
        }

        // ─── 远程光标 ───
        const cursorLayer = createElement('div', { className: 'rtc-cursor-layer' });
        const remoteCursors = {}; // { peerId: { el, name, x, y } }
        let lastCursorBroadcast = 0;
        document.body.appendChild(cursorLayer);

        function broadcastCursor(x, y) {
            const now = Date.now();
            if (now - lastCursorBroadcast < 50) return; // 节流 20fps
            lastCursorBroadcast = now;
            broadcast({ type: 'cursor', x: Math.round(x), y: Math.round(y) });
        }

        function updateRemoteCursor(peerId, name, x, y) {
            let rc = remoteCursors[peerId];
            if (!rc) {
                rc = {};
                rc.el = createElement('div', { className: 'rtc-remote-cursor' });
                rc.el.innerHTML = '<div class="rtc-remote-cursor-pointer"></div>' +
                    '<div class="rtc-remote-cursor-name">' + escapeHtml(name || '?') + '</div>';
                cursorLayer.appendChild(rc.el);
                remoteCursors[peerId] = rc;
            }
            rc.el.style.left = x + 'px';
            rc.el.style.top = y + 'px';
            rc.name = name;
            if (name) {
                const nameEl = rc.el.querySelector('.rtc-remote-cursor-name');
                if (nameEl) nameEl.textContent = name;
            }
        }

        function removeRemoteCursor(peerId) {
            const rc = remoteCursors[peerId];
            if (rc && rc.el && rc.el.parentNode) rc.el.parentNode.removeChild(rc.el);
            delete remoteCursors[peerId];
        }

        function clearAllRemoteCursors() {
            Object.keys(remoteCursors).forEach(removeRemoteCursor);
        }

        // 监听鼠标移动广播光标位置
        let cursorMonitorActive = false;
        function startCursorMonitor() {
            if (cursorMonitorActive) return;
            cursorMonitorActive = true;
            document.addEventListener('mousemove', onCursorMove);
        }
        function stopCursorMonitor() {
            cursorMonitorActive = false;
            document.removeEventListener('mousemove', onCursorMove);
        }
        function onCursorMove(e) {
            if (!roomId || !peer) return;
            broadcastCursor(e.clientX, e.clientY);
        }

        // ─── 工具函数 ───
        function generateRoomId() {
            const adjectives = ['快乐','聪明','勇敢','冷静','活泼','明亮','神秘','温暖','酷炫','闪电'];
            const nouns = ['熊猫','老虎','凤凰','麒麟','龙','鹰','鲸鱼','狮子','星空','海洋'];
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            const num = Math.floor(Math.random() * 900) + 100;
            return adj + noun + num;
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function closePanel() {
            leaveRoom();
            panel.style.display = 'none';
        }

        function leaveRoom() {
            stopWorkspaceSync();
            stopCursorMonitor();
            clearAllRemoteCursors();
            Object.values(connections).forEach(c => {
                try { c.conn.close(); } catch(e) {}
            });
            connections = {};
            if (peer) {
                try { peer.destroy(); } catch(e) {}
            }
            peer = null;
            isHost = false;
            roomId = '';
            chatMessages = [];
            render();
        }

        // ─── URL 深链接支持 ───
        function checkUrlForRoom() {
            const hash = location.hash;
            const m = hash.match(/#rtc=([^&]+)/);
            if (m && m[1]) {
                const rid = decodeURIComponent(m[1]);
                // 延迟一点等面板初始化
                setTimeout(() => {
                    if (!peer && !roomId) {
                        panel.style.display = '';
                        joinRoom(rid);
                    }
                }, 500);
            }
        }

        // ─── 初始化 UI ───
        render();

        // 挂载面板到 DOM（初始隐藏）
        panel.style.display = 'none';
        document.body.appendChild(panel);

        // 全局拖拽 / 拉伸事件
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('mouseup', endResize);
        window.addEventListener('resize', syncResizeLayer);

        // 添加工具栏触发按钮
        const triggerBtn = addToolbarButton('🤝 实时协作', () => {
            panel.style.display = panel.style.display === 'none' ? '' : 'none';
            render();
            syncResizeLayer();
        });

        // 检查 URL 是否带房间ID
        checkUrlForRoom();

        // 当进入房间后启动工作区同步
        const originalRender = render;
        render = function() {
            originalRender();
            if (peer && roomId) {
                startWorkspaceSync();
            } else {
                stopWorkspaceSync();
            }
        };

        // 清理函数
        return function cleanup() {
            leaveRoom();
            stopCursorMonitor();
            clearAllRemoteCursors();
            if (cursorLayer && cursorLayer.parentNode) cursorLayer.parentNode.removeChild(cursorLayer);
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mousemove', onResize);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('mouseup', endResize);
            window.removeEventListener('resize', syncResizeLayer);
            if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
            if (resizeLayer && resizeLayer.parentNode) resizeLayer.parentNode.removeChild(resizeLayer);
            if (triggerBtn && triggerBtn.parentNode) triggerBtn.parentNode.removeChild(triggerBtn);
        };
    }
};
