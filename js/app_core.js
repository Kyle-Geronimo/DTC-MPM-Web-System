/**
 * App Core JavaScript
 * Toast notifications, real-time polling, notification center, session checks, export helpers.
 */

// Initialize current user ID
window.currentUserId = null;
window.currentUser = null;

// Theme helper: apply theme across the whole app and persist
window.setTheme = function(theme){
    try{
        if (!theme || theme === 'auto') {
            document.documentElement.setAttribute('data-theme','auto');
            document.body.classList.remove('dark');
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.body.classList.add('dark');
        } else if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme','dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.setAttribute('data-theme','light');
            document.body.classList.remove('dark');
        }
        // persist
        try{
            const saved = JSON.parse(localStorage.getItem('userSettings')||'{}');
            saved.theme = theme;
            localStorage.setItem('userSettings', JSON.stringify(saved));
        }catch(e){}
        console.log('setTheme:', theme, 'darkClass=', document.body.classList.contains('dark'));
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
        if (theme) { window.setTheme(theme); /* update active class */ document.querySelectorAll('.theme-btn').forEach(b=>b.classList.remove('active')); el.classList.add('active'); }
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
                username: data.username,
                full_name: data.full_name,
                email: data.email,
                role: data.role,
                phone: data.phone,
                bio: data.bio
            };
            
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
            const colors = {
                success: 'background:#ecfdf5;border-left:4px solid #10b981;color:#065f46;',
                error:   'background:#fef2f2;border-left:4px solid #ef4444;color:#991b1b;',
                warning: 'background:#fffbeb;border-left:4px solid #f59e0b;color:#92400e;',
                info:    'background:#fff5f5;border-left:4px solid #ef4444;color:#7f1d1d;'
            };

            toast.style.cssText = `${colors[type] || colors.info}padding:14px 18px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:10px;animation:toastSlideIn 0.3s ease;font-size:14px;min-width:280px;`;
            toast.innerHTML = `<span style="font-size:18px;">${icons[type] || icons.info}</span><span style="flex:1;">${message}</span><button style="background:none;border:none;cursor:pointer;font-size:18px;opacity:0.5;padding:0 0 0 8px;" onclick="this.parentElement.remove()">&times;</button>`;

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
        info(msg, dur)    { this.show(msg, 'info', dur); }
    };

    // Add toast animations once
    (function addToastStyles() {
        if (document.getElementById('__toast_styles')) return;
        const style = document.createElement('style');
        style.id = '__toast_styles';
        style.textContent = `
            @keyframes toastSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes toastSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
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

    init() {
        this.createUI();
        this.bindEvents();
        // Listen for realtime updates
        RealtimePoller.on('notifications', (data) => this.updateFromPoll(data));
    },

    createUI() {
        // Check for an existing bell from the HTML template
        const existingBell = document.getElementById('notificationBell');
        if (existingBell) {
            this.bellEl = existingBell;
            this.badgeEl = document.getElementById('notifBadge');
            this.panelEl = document.getElementById('notifPanel');
            return;
        }

        // Fallback: create bell dynamically if not in HTML
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;

        const bellWrapper = document.createElement('div');
        bellWrapper.id = 'notification-bell';
        bellWrapper.style.cssText = 'position:relative;cursor:pointer;margin-right:16px;font-size:22px;';
        bellWrapper.innerHTML = `
            <span title="Notifications">🔔</span>
            <span id="notif-badge" style="display:none;position:absolute;top:-6px;right:-8px;background:#ef4444;color:white;font-size:10px;font-weight:700;border-radius:50%;min-width:18px;height:18px;line-height:18px;text-align:center;padding:0 4px;">0</span>
        `;
        // Insert before user-profile
        const userProfile = headerRight.querySelector('.user-profile');
        if (userProfile) {
            headerRight.insertBefore(bellWrapper, userProfile);
        } else {
            headerRight.appendChild(bellWrapper);
        }
        this.bellEl = bellWrapper;
        this.badgeEl = document.getElementById('notif-badge');

        // Notification dropdown panel
        const panel = document.createElement('div');
        panel.id = 'notification-panel';
        panel.style.cssText = 'display:none;position:absolute;top:40px;right:0;width:360px;max-height:480px;background:white;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.2);z-index:99999;overflow:hidden;';
        panel.innerHTML = `
            <div style="padding:14px 16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;font-size:16px;color:#1f2937;">Notifications</h3>
                <button id="mark-all-read-btn" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;font-weight:600;">Mark all read</button>
            </div>
            <div id="notif-list" style="overflow-y:auto;max-height:380px;"></div>
            <div style="padding:10px;text-align:center;border-top:1px solid #e5e7eb;">
                <small style="color:#6b7280;">Showing latest notifications</small>
            </div>
        `;
        bellWrapper.appendChild(panel);
        this.panelEl = panel;
    },

    bindEvents() {
        if (!this.bellEl) return;

        this.bellEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panelEl.contains(e.target)) {
                this.close();
            }
        });

        const markAllBtn = document.getElementById('mark-all-read-btn') || document.getElementById('markAllRead');
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
        this.panelEl.style.display = 'block';
        this.panelEl.classList.add('show');
        this.isOpen = true;
        this.loadNotifications();
    },

    close() {
        if (!this.panelEl) return;
        this.panelEl.style.display = 'none';
        this.panelEl.classList.remove('show');
        this.isOpen = false;
    },

    updateFromPoll(data) {
        if (!data) return;
        // Show badge
        this.updateBadge(data.unread_count || 0);

        // If panel is open, render list
        if (this.isOpen && data.items) {
            this.renderList(data.items);
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
        // Support both HTML template (notifBadge) and dynamic (notif-badge) IDs
        const badge = this.badgeEl || document.getElementById('notifBadge') || document.getElementById('notif-badge');
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
            list.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#9ca3af;"><div style="font-size:32px;margin-bottom:8px;">🔔</div>No notifications yet</div>';
            return;
        }

        const typeIcons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', task: '📋', project: '📁' };

        list.innerHTML = items.map(n => {
            const icon = typeIcons[n.type] || '📌';
            const unreadDot = n.is_read == 0 ? '<span style="width:8px;height:8px;background:#ef4444;border-radius:50%;display:inline-block;margin-left:auto;flex-shrink:0;"></span>' : '';
            const bg = n.is_read == 0 ? '#f0f7ff' : 'white';
            return `
                <div class="notif-item" data-id="${n.id}" style="padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;gap:10px;align-items:flex-start;background:${bg};cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='${bg}'">
                    <span style="font-size:18px;flex-shrink:0;margin-top:2px;">${icon}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;font-size:13px;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(n.title)}</div>
                        <div style="font-size:12px;color:#6b7280;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.escapeHtml(n.message || '')}</div>
                        <div style="font-size:11px;color:#9ca3af;margin-top:4px;">${n.time_ago || ''}</div>
                    </div>
                    ${unreadDot}
                </div>
            `;
        }).join('');

        // Bind click handlers to mark as read
        list.querySelectorAll('.notif-item').forEach(item => {
            item.addEventListener('click', () => this.markRead(item.dataset.id));
        });
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
            <button class="export-btn export-pdf" onclick="ExportHelper.download('${type}','pdf')" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#ef4444;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;transition:background 0.2s;"
                onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
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
    // Initialize session timeout handler
    SessionManager.init();

    // Initialize notification center
    NotificationCenter.init();

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
                this.dot.style.background = '#ef4444';
                this.text.textContent = 'Critical';
                this.text.style.color = '#b91c1c';
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
