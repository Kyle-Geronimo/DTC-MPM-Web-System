/**
 * App Core JavaScript
 * Toast notifications, real-time polling, notification center, session checks, export helpers.
 */

// Initialize current user ID
window.currentUserId = null;
window.currentUser = null;

function detachThemeMediaListener() {
    if (!window._appThemeMediaQuery || !window._appThemeMediaListener) return;

    try {
        window._appThemeMediaQuery.removeEventListener('change', window._appThemeMediaListener);
    } catch (error) {
        try {
            window._appThemeMediaQuery.removeListener(window._appThemeMediaListener);
        } catch (legacyError) {
            // No-op for older browser implementations.
        }
    }

    window._appThemeMediaQuery = null;
    window._appThemeMediaListener = null;
}

window.syncThemeButtons = function(theme) {
    const activeTheme = (theme || 'auto').toLowerCase();

    document.querySelectorAll('.theme-btn').forEach((button) => {
        const buttonTheme = (button.getAttribute('data-theme') || button.textContent || '').trim().toLowerCase();
        const isActive = buttonTheme === activeTheme;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
};

// Theme helper: apply theme across the whole app and persist
window.setTheme = function(theme){
    try{
        const nextTheme = (theme || 'auto').toLowerCase();
        detachThemeMediaListener();

        if (nextTheme === 'auto') {
            document.documentElement.setAttribute('data-theme','auto');
            const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

            if (mediaQuery) {
                document.body.classList.toggle('dark', mediaQuery.matches);
                window._appThemeMediaQuery = mediaQuery;
                window._appThemeMediaListener = (event) => {
                    document.body.classList.toggle('dark', event.matches);
                };

                try {
                    mediaQuery.addEventListener('change', window._appThemeMediaListener);
                } catch (error) {
                    try {
                        mediaQuery.addListener(window._appThemeMediaListener);
                    } catch (legacyError) {
                        // No-op for older browser implementations.
                    }
                }
            } else {
                document.body.classList.remove('dark');
            }
        } else if (nextTheme === 'dark') {
            document.documentElement.setAttribute('data-theme','dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.setAttribute('data-theme','light');
            document.body.classList.remove('dark');
        }
        // persist
        try{
            const saved = JSON.parse(localStorage.getItem('userSettings')||'{}');
            saved.theme = nextTheme;
            localStorage.setItem('userSettings', JSON.stringify(saved));
        }catch(e){}

        window.syncThemeButtons(nextTheme);
        console.log('setTheme:', nextTheme, 'darkClass=', document.body.classList.contains('dark'));
    }catch(e){console.error('setTheme error', e);}
};
// alias for compatibility with settings.js
window.applyTheme = window.setTheme;

// Listen for clicks on theme buttons globally (fallback if page JS didn't wire them)
document.addEventListener('click', function(e){
    try{
        const el = e.target.closest && e.target.closest('.theme-btn');
        if (!el) return;
        // determine theme from data-theme attribute or button text
        const theme = el.getAttribute('data-theme') || (el.textContent||'').trim().toLowerCase();
        if (theme) { window.setTheme(theme); }
    }catch(err){/* no-op */}
}, false);

// Fetch current user info
async function initializeCurrentUser() {
    try {
        const response = await fetch('../settings/get_user.php');
        const data = await response.json();
        
        if (data.success) {
            // Try to get user ID from session
            const sessionResponse = await fetch('../settings/session_check.php').catch(e => null);
            
            window.currentUser = {
                id: data.id,
                username: data.username,
                full_name: data.full_name,
                email: data.email,
                role: data.role,
                phone: data.phone,
                bio: data.bio
            };
            window.currentUserId = data.id;
            
            // Get user ID by checking the page - it's typically set by session_check.php
            // For now, we'll use a placeholder that the chat system can handle
            // The actual user ID will be used by the backend which has session access
        }
    } catch (error) {
        // Silently fail - user is likely not logged in
    }
}

// Initialize user info when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCurrentUser);
} else {
    initializeCurrentUser();
}

function initializeUnifiedSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const navMenu = sidebar.querySelector('.nav-menu');
    if (!navMenu) return;

    const currentFile = (window.location.pathname.split('/').pop() || '').toLowerCase();
    const activeKeyMap = {
        'front_panel.html': 'front-panel',
        'dashboard.html': 'front-panel',
        'projects.html': 'projects',
        'tasks.html': 'tasks',
        'team.html': 'team',
        'reports.html': 'reports',
        'admin.html': 'admin'
    };
    const activeKey = activeKeyMap[currentFile] || '';
    const basePath = '/ProjectDashboard/page';
    const items = [
        { key: 'front-panel', label: 'Front Panel', href: `${basePath}/front_panel.html` },
        { key: 'projects', label: 'Projects', href: `${basePath}/projects.html` },
        { key: 'tasks', label: 'Tasks', href: `${basePath}/tasks.html` },
        { key: 'team', label: 'Team', href: `${basePath}/team.html` },
        { key: 'reports', label: 'Reports', href: `${basePath}/reports.html` }
    ];

    navMenu.innerHTML = items.map((item) => {
        const activeAttr = item.key === activeKey ? ' class="active"' : '';
        return `<li><a href="${item.href}"${activeAttr}>${item.label}</a></li>`;
    }).join('') + `
        <li id="adminNavLink"${activeKey === 'admin' ? '' : ' style="display:none"'}>
            <a href="${basePath}/admin.html"${activeKey === 'admin' ? ' class="active"' : ''}>Admin</a>
        </li>
    `;
}

// Apply saved theme on load so dark mode is global
try{
    const saved = JSON.parse(localStorage.getItem('userSettings')||'{}');
    if (saved && saved.theme) {
        // apply after short delay to ensure DOM exists
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => { window.setTheme(saved.theme); });
        } else { window.setTheme(saved.theme); }
    }
}catch(e){}

// ============================================
// TOAST NOTIFICATION SYSTEM (guarded)
// ============================================

if (typeof window.Toast === 'undefined') {
    window.Toast = {
        container: null,

        init() {
            if (this.container) return;
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:100000;display:flex;flex-direction:column;gap:10px;max-width:400px;';
            document.body.appendChild(this.container);
        },

        show(message, type = 'info', duration = 4000) {
            this.init();
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;

            const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

            // Build HTML without inline styles - CSS will handle all styling
            toast.innerHTML = `
                <span style="font-size:18px;flex-shrink:0;">${icons[type] || icons.info}</span>
                <span style="flex:1;">${this.escapeHtml(message)}</span>
                <button style="background:none;border:none;cursor:pointer;font-size:18px;opacity:0.5;padding:0 0 0 8px;transition:opacity 0.2s;" onclick="this.parentElement.remove()">&times;</button>
            `;
            toast.style.cssText = 'padding:14px 18px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:10px;animation:toastSlideIn 0.3s ease;font-size:14px;min-width:280px;border-left:4px solid;';

            this.container.appendChild(toast);

            if (duration > 0) {
                setTimeout(() => {
                    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
                    setTimeout(() => toast.remove(), 300);
                }, duration);
            }
        },

        success(msg, dur) { this.show(msg, 'success', dur); },
        error(msg, dur)   { this.show(msg, 'error', dur); },
        warning(msg, dur) { this.show(msg, 'warning', dur); },
        info(msg, dur)    { this.show(msg, 'info', dur); },

        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };

    // Add toast animations and base styles once
    (function addToastStyles() {
        if (document.getElementById('__toast_styles')) return;
        const style = document.createElement('style');
        style.id = '__toast_styles';
        style.textContent = `
            @keyframes toastSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes toastSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }

            /* Light mode toast styles */
            .toast {
                border-left-width: 4px !important;
                border-left-style: solid !important;
            }

            .toast.toast-success {
                background: #ecfdf5;
                border-left-color: #10b981;
                color: #065f46;
            }

            .toast.toast-error {
                background: #fef2f2;
                border-left-color: #800000;
                color: #500000;
            }

            .toast.toast-warning {
                background: #fffbeb;
                border-left-color: #f59e0b;
                color: #92400e;
            }

            .toast.toast-info {
                background: #E0CCCC;
                border-left-color: #800000;
                color: #400000;
            }

            .toast button:hover {
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    })();
}

// Ensure local reference without redeclaring
var Toast = window.Toast;
window.toastr = window.toastr || { success: (m) => Toast.success(m), error: (m) => Toast.error(m), warning: (m) => Toast.warning(m), info: (m) => Toast.info(m) };



// ============================================
// SESSION TIMEOUT HANDLER
// ============================================

const SessionManager = {
    warningShown: false,
    timeoutMinutes: 30,
    checkInterval: null,

    init() {
        this.resetTimer();
        // Listen for user activity
        ['click', 'keypress', 'mousemove', 'scroll'].forEach(evt => {
            document.addEventListener(evt, () => this.resetTimer(), { passive: true });
        });
        // Check session every 60 seconds
        this.checkInterval = setInterval(() => this.checkSession(), 60000);
    },

    resetTimer() {
        this.lastActivity = Date.now();
        this.warningShown = false;
    },

    checkSession() {
        const idleMin = (Date.now() - this.lastActivity) / 60000;
        // Show warning 5 minutes before timeout
        if (idleMin >= this.timeoutMinutes - 5 && !this.warningShown) {
            this.warningShown = true;
            Toast.warning('Your session will expire soon due to inactivity. Move your mouse to stay logged in.', 8000);
        }
        // If idle beyond timeout, redirect
        if (idleMin >= this.timeoutMinutes) {
            clearInterval(this.checkInterval);
            window.location.href = '../page/login.php?timeout=1';
        }
    }
};

// ============================================
// REAL-TIME POLLING ENGINE
// ============================================

const RealtimePoller = {
    interval: null,
    pollRate: 1000, // 1 second (near real-time)
    lastTimestamp: null,
    callbacks: {},

    init(pollRate) {
        if (pollRate) this.pollRate = pollRate;
        this.poll(); // Initial fetch
        this.interval = setInterval(() => this.poll(), this.pollRate);
    },

    on(event, callback) {
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(callback);
    },

    emit(event, data) {
        (this.callbacks[event] || []).forEach(cb => cb(data));
    },

    async poll() {
        try {
            const url = '../settings/realtime_updates.php?section=all' +
                (this.lastTimestamp ? '&since=' + encodeURIComponent(this.lastTimestamp) : '');

            const response = await fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            if (!response.ok) throw new Error('Network error');

            const result = await response.json();

            if (result.session_expired) {
                Toast.error('Session expired. Redirecting to login...');
                setTimeout(() => { window.location.href = '../page/login.php?timeout=1'; }, 2000);
                clearInterval(this.interval);
                return;
            }

            if (result.success && result.data) {
                this.lastTimestamp = result.timestamp;
                this.emit('update', result.data);

                if (result.data.stats) this.emit('stats', result.data.stats);
                if (result.data.projects) this.emit('projects', result.data.projects);
                if (result.data.recent_tasks) this.emit('tasks', result.data.recent_tasks);
                if (result.data.activity) this.emit('activity', result.data.activity);
                if (result.data.notifications) this.emit('notifications', result.data.notifications);
            }
        } catch (err) {
            // Silently fail — will retry on next poll
            console.warn('Polling error:', err.message);
        }
    },

    stop() {
        clearInterval(this.interval);
    }
};

// ============================================
// NOTIFICATION CENTER UI
// ============================================

const NotificationCenter = {
    bellEl: null,
    panelEl: null,
    badgeEl: null,
    isOpen: false,
    _lastNotifId: null,
    _lastRenderedItems: null,
    _audio: null,
    _refreshTimestampsInterval: null,

    init() {
        this.createUI();
        this.bindEvents();
        // Listen for realtime updates
        RealtimePoller.on('notifications', (data) => this.updateFromPoll(data));
        // Refresh timestamps every 30 seconds to keep them accurate without re-rendering
        this._refreshTimestampsInterval = setInterval(() => {
            if (this.isOpen && this._lastRenderedItems) {
                this.updateTimestamps(this._lastRenderedItems);
            }
        }, 30000);
    },

    createUI() {
        // Check for an existing bell from the HTML template
        const existingBell = document.getElementById('notificationBell');
        if (existingBell) {
            this.bellEl = existingBell;
            this.badgeEl = document.getElementById('notifBadge');
            this.panelEl = document.getElementById('notifPanel');
            this.ensureStyles();
            return;
        }

        // Fallback: create bell dynamically if not in HTML
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;

        const bellWrapper = document.createElement('div');
        bellWrapper.id = 'notification-bell';
        bellWrapper.className = 'notification-bell-wrapper';
        bellWrapper.innerHTML = `
            <span class="notification-bell-icon" title="Notifications">🔔</span>
            <span class="notification-badge" style="display:none;">0</span>
        `;
        
        // Insert before user-profile
        const userProfile = headerRight.querySelector('.user-profile');
        if (userProfile) {
            headerRight.insertBefore(bellWrapper, userProfile);
        } else {
            headerRight.appendChild(bellWrapper);
        }
        this.bellEl = bellWrapper;
        this.badgeEl = bellWrapper.querySelector('.notification-badge');

        // Notification dropdown panel
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.id = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-panel-header">
                <h3 class="notification-panel-title">Notifications</h3>
                <button class="notification-mark-all-btn" id="mark-all-read-btn">Mark all read</button>
            </div>
            <div class="notification-list" id="notif-list"></div>
            <div class="notification-panel-footer">
                <small>Showing latest notifications</small>
            </div>
        `;
        bellWrapper.appendChild(panel);
        this.panelEl = panel;
        
        this.ensureStyles();
    },

    ensureStyles() {
        if (document.getElementById('__notif_styles')) return;
        const style = document.createElement('style');
        style.id = '__notif_styles';
        style.textContent = `
            /* Notification Bell */
            .notification-bell-wrapper {
                position: relative;
                cursor: pointer;
                margin-right: 16px;
                font-size: 22px;
                display: inline-flex;
                align-items: center;
            }

            .notification-bell-icon {
                transition: transform 0.2s ease;
            }

            .notification-bell-wrapper:hover .notification-bell-icon {
                transform: scale(1.1);
            }

            .notification-badge {
                position: absolute;
                top: -6px;
                right: -8px;
                background: #800000;
                color: white;
                font-size: 10px;
                font-weight: 700;
                border-radius: 50%;
                min-width: 18px;
                height: 18px;
                line-height: 18px;
                text-align: center;
                padding: 0 4px;
                animation: badge-pulse 0.5s ease;
            }

            @keyframes badge-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            /* Notification Panel */
            .notification-panel {
                display: none;
                position: absolute;
                top: 40px;
                right: 0;
                width: 360px;
                max-height: 480px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
                z-index: 99999;
                overflow: hidden;
                animation: notif-panel-in 0.2s ease;
            }

            @keyframes notif-panel-in {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .notification-panel.show {
                display: flex;
                flex-direction: column;
            }

            /* Panel Header */
            .notification-panel-header {
                padding: 14px 16px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
                background: white;
            }

            .notification-panel-title {
                margin: 0;
                font-size: 16px;
                color: #1f2937;
                font-weight: 600;
            }

            .notification-mark-all-btn {
                background: none;
                border: none;
                color: #800000;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                padding: 0;
                transition: color 0.2s ease;
            }

            .notification-mark-all-btn:hover {
                color: #700000;
            }

            /* Notification List */
            .notification-list {
                flex: 1;
                overflow-y: auto;
                padding: 0;
            }

            /* Notification Item */
            .notif-item {
                padding: 12px 16px;
                border-bottom: 1px solid #f3f4f6;
                display: flex;
                gap: 10px;
                align-items: flex-start;
                background: white;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }

            .notif-item:hover {
                background-color: #f9fafb;
            }

            .notif-item.notif-unread {
                background-color: #f0f7ff;
            }

            .notif-item.notif-unread:hover {
                background-color: #e0f2fe;
            }

            .notif-icon {
                font-size: 18px;
                flex-shrink: 0;
                margin-top: 2px;
            }

            .notif-content {
                flex: 1;
                min-width: 0;
            }

            .notif-title {
                font-weight: 600;
                font-size: 13px;
                color: #1f2937;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .notif-message {
                font-size: 12px;
                color: #6b7280;
                margin-top: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .notif-time {
                font-size: 11px;
                color: #9ca3af;
                margin-top: 4px;
            }

            .notif-unread-dot {
                width: 8px;
                height: 8px;
                background: #800000;
                border-radius: 50%;
                display: inline-block;
                margin-left: auto;
                flex-shrink: 0;
                margin-top: 4px;
                animation: dot-pulse 1.5s ease infinite;
            }

            @keyframes dot-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            /* Empty State */
            .notif-empty-state {
                padding: 40px 20px;
                text-align: center;
                color: #9ca3af;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 150px;
            }

            .notif-empty-icon {
                font-size: 32px;
                margin-bottom: 8px;
            }

            .notif-empty-text {
                font-size: 13px;
                color: #9ca3af;
            }

            /* Panel Footer */
            .notification-panel-footer {
                padding: 10px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
                background: white;
                flex-shrink: 0;
            }

            .notification-panel-footer small {
                color: #6b7280;
                font-size: 11px;
            }

            /* Dark Mode Support */
            body.dark .notification-panel {
                background: #0b1220;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
            }

            body.dark .notification-panel-header,
            body.dark .notification-panel-footer {
                background: #0b1220;
                border-bottom-color: #15202b;
                border-top-color: #15202b;
            }

            body.dark .notification-panel-title {
                color: #e6eef8;
            }

            body.dark .notif-item {
                background: #0b1220;
                border-bottom-color: #15202b;
            }

            body.dark .notif-item:hover {
                background-color: #1a2332;
            }

            body.dark .notif-item.notif-unread {
                background-color: #1a2a42;
            }

            body.dark .notif-item.notif-unread:hover {
                background-color: #1e3350;
            }

            body.dark .notif-title {
                color: #e6eef8;
            }

            body.dark .notif-message,
            body.dark .notif-time {
                color: #9fb3c9;
            }

            body.dark .notif-empty-text {
                color: #9fb3c9;
            }

            body.dark .notification-panel-footer small {
                color: #9fb3c9;
            }

            /* Scrollbar */
            .notification-list::-webkit-scrollbar {
                width: 6px;
            }

            .notification-list::-webkit-scrollbar-track {
                background: transparent;
            }

            .notification-list::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 3px;
            }

            .notification-list::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
            }

            body.dark .notification-list::-webkit-scrollbar-thumb {
                background: #4b5563;
            }

            body.dark .notification-list::-webkit-scrollbar-thumb:hover {
                background: #6b7280;
            }
        `;
        document.head.appendChild(style);
    },

    bindEvents() {
        if (!this.bellEl) return;

        // Bell click to toggle panel
        this.bellEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && this.panelEl && !this.panelEl.contains(e.target) && !this.bellEl.contains(e.target)) {
                this.close();
            }
        });

        // Mark all read button
        const markAllBtn = this.panelEl?.querySelector('#mark-all-read-btn') || 
                          this.panelEl?.querySelector('.notification-mark-all-btn') ||
                          document.getElementById('markAllRead');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.markAllRead();
            });
        }
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    open() {
        if (!this.panelEl) return;
        this.panelEl.classList.add('show');
        this.isOpen = true;
        this.loadNotifications();
    },

    close() {
        if (!this.panelEl) return;
        this.panelEl.classList.remove('show');
        this.isOpen = false;
        // Clear cached items so fresh timestamps load on next open
        this._lastRenderedItems = null;
    },

    updateFromPoll(data) {
        if (!data) return;
        // Show badge
        this.updateBadge(data.unread_count || 0);

        // If panel is open, compare core notification data (excluding time_ago)
        if (this.isOpen && data.items) {
            // Compare by stripping out time_ago which changes constantly
            const coreData = data.items.map(n => ({ id: n.id, title: n.title, message: n.message, type: n.type, is_read: n.is_read, created_at: n.created_at }));
            const lastCoreData = this._lastRenderedItems?.map(n => ({ id: n.id, title: n.title, message: n.message, type: n.type, is_read: n.is_read, created_at: n.created_at }));
            
            if (!lastCoreData || JSON.stringify(coreData) !== JSON.stringify(lastCoreData)) {
                this.renderList(data.items);
                this._lastRenderedItems = JSON.parse(JSON.stringify(data.items));
            } else {
                // Core data hasn't changed, just update timestamps
                this.updateTimestamps(data.items);
            }
        }

        // Detect new notifications and show a toast for them
        try {
            if (data.items && data.items.length > 0) {
                const newest = data.items[0];
                if (!this._lastNotifId) {
                    // first time seeing notifications, record id but don't toast
                    this._lastNotifId = newest.id;
                } else if (newest.id != this._lastNotifId) {
                    // find all new items up to the last seen id
                    const newItems = [];
                    for (const it of data.items) {
                        if (it.id == this._lastNotifId) break;
                        newItems.push(it);
                    }
                    // update last seen id
                    this._lastNotifId = newest.id;

                    // show toast(s)
                    newItems.reverse().forEach(it => {
                        const text = (it.title ? it.title : '') + (it.message ? ' — ' + it.message : '');
                        Toast.info(text, 6000);
                    });

                    // play a subtle ping if available
                    try {
                        // Try to play bundled audio file first
                        if (!this._audio) {
                            this._audio = new Audio('../assets/sounds/notify.mp3');
                        }
                        this._audio.play().catch(() => {
                            // fallback to WebAudio beep
                            try { playBeep(); } catch (e2) { /* ignore */ }
                        });
                    } catch (e) {
                        try { playBeep(); } catch (e2) { /* ignore */ }
                    }
                }
            }
        } catch (e) {
            console.warn('Notification toast error', e);
        }
    },

    updateBadge(count) {
        // Support both HTML template (notifBadge) and dynamic (notif-badge/notification-badge) IDs/classes
        let badge = this.badgeEl || 
                    document.getElementById('notifBadge') || 
                    document.getElementById('notif-badge') ||
                    document.querySelector('.notification-badge');
        
        if (!badge) return;
        
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    },

    async loadNotifications() {
        try {
            const response = await fetch('../settings/get_notifications.php');
            const result = await response.json();
            if (result.success) {
                this.updateBadge(result.unread_count);
                this.renderList(result.notifications);
            }
        } catch (err) {
            console.warn('Failed to load notifications:', err);
        }
    },

    renderList(items) {
        const list = document.getElementById('notif-list') || document.getElementById('notifList');
        if (!list) return;

        if (!items || items.length === 0) {
            list.innerHTML = `
                <div class="notif-empty-state">
                    <div class="notif-empty-icon">🔔</div>
                    <div class="notif-empty-text">No notifications yet</div>
                </div>
            `;
            return;
        }

        const typeIcons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', task: '📋', project: '📁' };

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        items.forEach(n => {
            const icon = typeIcons[n.type] || '📌';
            const isUnread = n.is_read == 0;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = `notif-item ${isUnread ? 'notif-unread' : ''}`;
            itemDiv.dataset.id = n.id;
            itemDiv.dataset.createdAt = n.created_at || n.timestamp || '';
            
            itemDiv.innerHTML = `
                <span class="notif-icon">${icon}</span>
                <div class="notif-content">
                    <div class="notif-title">${this.escapeHtml(n.title)}</div>
                    ${n.message ? `<div class="notif-message">${this.escapeHtml(n.message)}</div>` : ''}
                    <div class="notif-time" data-time="${n.created_at || n.timestamp || ''}">${this.formatTimeAgo(n.created_at || n.timestamp || '')}</div>
                </div>
                ${isUnread ? '<span class="notif-unread-dot"></span>' : ''}
            `;
            
            fragment.appendChild(itemDiv);
        });

        list.innerHTML = '';
        list.appendChild(fragment);

        // Attach event listeners to all items using event delegation
        list.addEventListener('click', (e) => {
            const item = e.target.closest('.notif-item');
            if (item) {
                this.markRead(item.dataset.id);
            }
        });
    },

    updateTimestamps(items) {
        const list = document.getElementById('notif-list') || document.getElementById('notifList');
        if (!list) return;

        // Update only the time elements without re-rendering
        items.forEach(n => {
            const item = list.querySelector(`[data-id="${n.id}"]`);
            if (item) {
                const timeEl = item.querySelector('.notif-time');
                if (timeEl) {
                    const newTime = this.formatTimeAgo(n.created_at || n.timestamp || '');
                    if (timeEl.textContent !== newTime) {
                        timeEl.textContent = newTime;
                    }
                }
            }
        });
    },

    formatTimeAgo(timestamp) {
        if (!timestamp) return '';
        
        try {
            const now = new Date();
            const notifTime = new Date(timestamp);
            const diffMs = now - notifTime;
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHour = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHour / 24);

            if (diffSec < 60) return 'Just now';
            if (diffMin < 60) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
            if (diffHour < 24) return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
            if (diffDay < 7) return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
            if (diffDay < 30) return Math.floor(diffDay / 7) === 1 ? '1 week ago' : `${Math.floor(diffDay / 7)} weeks ago`;
            
            return Math.floor(diffDay / 30) === 1 ? '1 month ago' : `${Math.floor(diffDay / 30)} months ago`;
        } catch (err) {
            return '';
        }
    },

    async markRead(id) {
        try {
            const fd = new FormData();
            fd.append('id', id);
            await fetch('../settings/mark_notification_read.php', { method: 'POST', body: fd });
            this.loadNotifications();
        } catch (err) { /* ignore */ }
    },

    async markAllRead() {
        try {
            const fd = new FormData();
            fd.append('all', '1');
            await fetch('../settings/mark_notification_read.php', { method: 'POST', body: fd });
            this.updateBadge(0);
            this.loadNotifications();
            Toast.success('All notifications marked as read');
        } catch (err) { /* ignore */ }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// EXPORT HELPERS
// ============================================

const ExportHelper = {
    download(type, format = 'csv') {
        const url = `../settings/export_handler.php?type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}`;
        if (format === 'pdf') {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
        Toast.info(`Exporting ${type} as ${format.toUpperCase()}...`);
    },

    /**
     * Add export buttons to a container
     * @param {string} containerId - ID of container to add buttons to
     * @param {string} type - Export type (projects, tasks, team, activity, audit)
     */
    addButtons(containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;gap:8px;margin:10px 0;';
        wrapper.innerHTML = `
            <button class="export-btn export-csv" onclick="ExportHelper.download('${type}','csv')" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#10b981;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;transition:background 0.2s;"
                onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                📊 Export CSV
            </button>
            <button class="export-btn export-pdf" onclick="ExportHelper.download('${type}','pdf')" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#800000;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;transition:background 0.2s;"
                onmouseover="this.style.background='#700000'" onmouseout="this.style.background='#800000'">
                📄 Export PDF
            </button>
        `;
        container.appendChild(wrapper);
    }
};

window.ExportHelper = ExportHelper;

// ============================================
// ENHANCED FORM SUBMISSION (with error handling)
// ============================================

/**
 * Enhanced fetch wrapper with standardized error handling
 */
async function apiFetch(url, options = {}) {
    const defaults = {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    };
    const config = { ...defaults, ...options };
    if (config.headers && options.headers) {
        config.headers = { ...defaults.headers, ...options.headers };
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            if (response.status === 401) {
                Toast.error('Session expired. Redirecting to login...');
                setTimeout(() => { window.location.href = '../page/login.php?timeout=1'; }, 2000);
                return null;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 200));
            throw new Error('Server returned an unexpected response. Please try again.');
        }

        const data = await response.json();

        if (data.session_expired) {
            Toast.error('Session expired. Redirecting to login...');
            setTimeout(() => { window.location.href = '../page/login.php?timeout=1'; }, 2000);
            return null;
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        Toast.error(error.message || 'An unexpected error occurred.');
        return null;
    }
}

window.apiFetch = apiFetch;

// ============================================
// INITIALIZE ON DOM READY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeUnifiedSidebar();

    // Initialize session timeout handler
    SessionManager.init();

    // Initialize notification center
    NotificationCenter.init();

    // Theme controls moved to System Settings page

    // Initialize status indicators (live system status)
    try { StatusIndicators.init(); } catch (e) { console.warn('StatusIndicators init failed', e); }

    // Initialize charts (dynamic charts/graphs)
    try { ChartManager.init(); } catch (e) { console.warn('ChartManager init failed', e); }

    // Initialize quick stat container
    try { QuickStats.init(); } catch (e) { console.warn('QuickStats init failed', e); }

    // Initialize real-time polling (15 second intervals)
    // Initialize poller with a faster rate for near-real-time notifications
    RealtimePoller.init(1000);

    // ---- Admin sidebar visibility: show "Admin" link only for admin role ----
    fetch('../settings/get_user.php')
        .then(r => r.json())
        .then(d => {
            if (d && d.role === 'admin') {
                const adminLink = document.getElementById('adminNavLink');
                if (adminLink) adminLink.style.display = '';
            }
        })
        .catch(() => {});

    // Show login timeout message if redirected
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('timeout') === '1') {
        Toast.warning('You were logged out due to inactivity.');
    }

    // Update dashboard stats from polling
    RealtimePoller.on('stats', (stats) => {
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('activeProjectsCount', stats.active_projects || 0);
        setEl('projectsThisWeek', `+${stats.projects_this_week || 0} this week`);
        setEl('completedTasksCount', stats.completed_tasks || 0);
        setEl('tasksToday', `+${stats.tasks_today || 0} today`);
        setEl('teamMembersCount', stats.team_members || 0);
        setEl('openIssuesCount', stats.open_issues || 0);
        setEl('criticalIssues', `${stats.critical_issues || 0} critical`);
    });

    // Let status indicators listen for stats updates as well
    RealtimePoller.on('stats', (stats) => { try { StatusIndicators.updateFromStats(stats); } catch (e) {} });
    // Let charts listen for stats updates as well
    RealtimePoller.on('stats', (stats) => { try { ChartManager.onStats(stats); } catch (e) {} });
    // Update quick stats
    RealtimePoller.on('stats', (stats) => { try { QuickStats.update(stats); } catch (e) {} });

    // Update project progress from polling
    RealtimePoller.on('projects', (projects) => {
        const container = document.getElementById('projectProgressBars');
        if (!container || !projects || projects.length === 0) return;
        container.innerHTML = '';
        projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'progress-item';
            item.innerHTML = `
                <label>${project.name}</label>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <span>${project.progress}%</span>
            `;
            container.appendChild(item);
        });
    });

// ============================================
// SYSTEM STATUS INDICATORS
// ============================================

const StatusIndicators = {
    containerId: 'systemStatus',

    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) return;
        this.createUI();
    },

    createUI() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div id="statusBadge" style="display:inline-flex;align-items:center;gap:8px;">
                <span id="statusDot" style="width:10px;height:10px;border-radius:50%;display:inline-block;background:#10b981"></span>
                <span id="statusText" style="font-size:13px;color:#374151;">Healthy</span>
            </div>
        `;
        this.dot = document.getElementById('statusDot');
        this.text = document.getElementById('statusText');
    },

    updateFromStats(stats) {
        if (!stats) return;
        // Compute health: critical > 0 -> critical, open_issues high -> warning, otherwise healthy
        const critical = parseInt(stats.critical_issues || 0, 10);
        const open = parseInt(stats.open_issues || 0, 10);
        const pending = parseInt(stats.pending_tasks || 0, 10);

        let state = 'healthy';
        if (critical > 0) state = 'critical';
        else if (open > 10 || pending > 50) state = 'warning';

        this.applyState(state);
    },

    applyState(state) {
        if (!this.dot || !this.text) return;
        switch (state) {
            case 'critical':
                this.dot.style.background = '#800000';
                this.text.textContent = 'Critical';
                this.text.style.color = '#660000';
                this.container.title = 'Critical issues detected — investigate immediately';
                break;
            case 'warning':
                this.dot.style.background = '#f59e0b';
                this.text.textContent = 'Warning';
                this.text.style.color = '#92400e';
                this.container.title = 'Some issues need attention';
                break;
            default:
                this.dot.style.background = '#10b981';
                this.text.textContent = 'Healthy';
                this.text.style.color = '#065f46';
                this.container.title = 'System operating normally';
        }
    }
};

// ============================================
// CHARTS / GRAPHS (dynamic, live-updating)
// Uses Chart.js when available. Charts update on `RealtimePoller` stats events.
// ============================================

const ChartManager = {
    maxPoints: 20,
    charts: {},

    init() {
        if (typeof Chart === 'undefined') return;

        // Projects line chart (dashboard)
        const projCanvas = document.getElementById('projectsLineChart');
        if (projCanvas) {
            this.charts.projects = new Chart(projCanvas.getContext('2d'), {
                type: 'line',
                data: { labels: [], datasets: [{ label: 'Active Projects', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', tension: 0.3, fill: true }] },
                options: { responsive: true, maintainAspectRatio: false, scales: { x: { display: true }, y: { beginAtZero: true } }, plugins: { legend: { display: true } } }
            });
        }

        // Response times chart (monitoring) - using completed_tasks as a proxy if real response time metric unavailable
        const respCanvas = document.getElementById('responseTimesChart');
        if (respCanvas) {
            this.charts.response = new Chart(respCanvas.getContext('2d'), {
                type: 'line',
                data: { labels: [], datasets: [{ label: 'Completed Tasks (proxy)', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)', tension: 0.25, fill: true }] },
                options: { responsive: true, maintainAspectRatio: false, scales: { x: { display: true }, y: { beginAtZero: true } }, plugins: { legend: { display: true } } }
            });
        }
    },

    shiftIfNeeded(chart) {
        if (!chart) return;
        const ds = chart.data.datasets[0];
        if (ds.data.length > this.maxPoints) {
            ds.data.shift();
            chart.data.labels.shift();
        }
    },

    addPoint(key, value) {
        const chart = this.charts[key];
        if (!chart) return;
        const label = new Date().toLocaleTimeString();
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(typeof value === 'number' ? value : 0);
        this.shiftIfNeeded(chart);
        chart.update('none');
    },

    onStats(stats) {
        if (!stats) return;
        try {
            if (typeof stats.active_projects !== 'undefined') {
                this.addPoint('projects', parseInt(stats.active_projects || 0, 10));
            }
            if (typeof stats.completed_tasks !== 'undefined') {
                this.addPoint('response', parseInt(stats.completed_tasks || 0, 10));
            }
        } catch (e) { /* ignore */ }
    }
};

// ============================================
// QUICK STATS CONTAINER
// Small header-level stat counts for quick glance
// ============================================

const QuickStats = {
    ids: {
        active: 'q_activeProjects',
        pending: 'q_pendingTasks',
        completed: 'q_completedTasks',
        team: 'q_teamMembers'
    },

    init() {
        this.container = document.getElementById('quickStats');
        if (!this.container) return;
        // ensure defaults visible
        this.update({ active_projects: '…', pending_tasks: '…', completed_tasks: '…', team_members: '…' });
    },

    update(stats) {
        if (!stats) return;
        this.set(this.ids.active, stats.active_projects || 0);
        this.set(this.ids.pending, stats.pending_tasks || 0);
        this.set(this.ids.completed, stats.completed_tasks || 0);
        this.set(this.ids.team, stats.team_members || 0);
    },

    set(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = typeof value === 'number' ? value : value;
    }
};

    // Update recent activity from polling
    RealtimePoller.on('activity', (activities) => {
        const activityList = document.querySelector('.activity-list');
        if (!activityList || !activities || activities.length === 0) return;
        activityList.innerHTML = activities.map(a => `
            <div class="activity-item">
                <span class="activity-time">${a.time_ago || ''}</span>
                <span class="activity-text">${a.user_name ? a.user_name + ' ' : ''}${a.description || a.action || ''}</span>
            </div>
        `).join('');
    });

});

// Simple beep using WebAudio for notification fallback
function playBeep(duration = 150, frequency = 880, volume = 0.05) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = frequency;
        g.gain.value = volume;
        o.connect(g);
        g.connect(ctx.destination);
        o.start(0);
        setTimeout(() => { o.stop(); ctx.close(); }, duration);
    } catch (e) { /* ignore audio errors */ }
}

// Global handler for unhandled promise rejections to aid debugging and prevent noisy console errors
window.addEventListener('unhandledrejection', function(event) {
    try {
        console.warn('Unhandled promise rejection:', event.reason);
        if (typeof Toast !== 'undefined') Toast.error('An unexpected error occurred (see console).');
    } catch (err) {
        console.error('Error in unhandledrejection handler', err);
    }
});
