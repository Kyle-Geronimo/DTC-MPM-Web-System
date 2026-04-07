// Settings page behaviour
// Provide a safe Toast fallback so missing Toast implementation doesn't break the page
if (typeof Toast === 'undefined') {
    window.Toast = {
        success: (msg)=>console.log('TOAST SUCCESS:', msg),
        error: (msg)=>console.error('TOAST ERROR:', msg),
        info: (msg)=>console.info('TOAST INFO:', msg),
        warning: (msg)=>console.warn('TOAST WARN:', msg)
    };
}
document.addEventListener('DOMContentLoaded', () => {
    initSettings();
});

async function initSettings() {
    // Account form
    const accountForm = document.querySelector('#account .settings-form');
    if (accountForm) accountForm.addEventListener('submit', handleSaveAccount);

    // Password change
    const securityForm = document.querySelector('#security .settings-form');
    if (securityForm) securityForm.addEventListener('submit', handleChangePassword);

    // Notification toggles
    document.querySelectorAll('#notification .toggle').forEach(cb => cb.addEventListener('change', saveSettingsToLocal));

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', e => {
        document.querySelectorAll('.theme-btn').forEach(b=>b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const theme = e.currentTarget.textContent.trim().toLowerCase();
        applyTheme(theme);
        saveSettingsToLocal();
    }));

    // API keys
    // Ensure API keys UI exists, then render keys
    ensureApiKeysUi();
    renderApiKeys();
    document.querySelectorAll('.btn-connect').forEach(b=>{
        // repurpose 'Connect' buttons in integration list to reveal API key UI if needed
        b.addEventListener('click', (e)=>{ e.currentTarget.classList.toggle('connected'); });
    });

    // Wire API key generate/revoke delegation done above

    // Load server or local settings
    await loadSettings();
    // Setup left menu navigation
    setupSettingsNavigation();
}

function setupSettingsNavigation(){
    const links = document.querySelectorAll('.settings-menu a');
    const sections = document.querySelectorAll('.settings-section');
    if (!links.length || !sections.length) return;
    links.forEach(link=>{
        link.addEventListener('click', (e)=>{
            e.preventDefault();
            links.forEach(l=>l.classList.remove('active'));
            link.classList.add('active');
            const target = link.getAttribute('href').replace('#','');
            sections.forEach(s=>{ s.style.display = (s.id===target) ? 'block' : 'none'; });
        });
    });
    const active = document.querySelector('.settings-menu a.active') || links[0];
    if (active) active.click();
}

async function loadSettings(){
    // Try to load user profile from backend
    try{
        const resp = await fetch('../settings/get_user.php');
        if (resp.ok){
            const data = await resp.json();
            populateAccountFromServer(data);
        }
    }catch(e){ /* ignore and fall back to local */ }

    // Apply saved preferences from localStorage
    const saved = JSON.parse(localStorage.getItem('userSettings')||'{}');
    // notifications
    if (saved.notifications){
        const toggles = document.querySelectorAll('#notification .toggle');
        toggles.forEach((cb, idx)=>{ cb.checked = saved.notifications[idx]===undefined?cb.checked:!!saved.notifications[idx]; });
    }

    // theme
    if (saved.theme) applyTheme(saved.theme);
    // reflect active theme button in UI
    if (saved.theme) {
        const t = saved.theme.toLowerCase();
        document.querySelectorAll('.theme-btn').forEach(b=>{
            if (b.textContent.trim().toLowerCase() === t) b.classList.add('active');
            else b.classList.remove('active');
        });
    }


}

function populateAccountFromServer(data){
    if (!data) return;
    const user = data.user || data;
    if (!user) return;
    const acct = document.querySelector('#account');
    if (!acct) return;
    const inputs = acct.querySelectorAll('input, textarea');
    inputs.forEach(i=>{
        if (i.type==='email' && user.email) i.value = user.email;
        if (i.type==='text' && user.full_name) i.value = user.full_name;
        if (i.tagName.toLowerCase()==='textarea' && user.bio) i.value = user.bio;
        if (i.type==='tel' && user.phone) i.value = user.phone;
    });
}

async function handleSaveAccount(e){
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {};
    for (let [k,v] of fd.entries()) payload[k]=v;

    // Try to POST to backend endpoint if available
    try{
        const resp = await fetch('../settings/update_user.php', { method: 'POST', body: fd });
        if (resp.ok){
            const r = await resp.json().catch(()=>({success:false}));
            if (r && r.success){ alert('✅ Settings saved'); return; }
        }
    }catch(err){ }

    // Fallback: save to localStorage
    const saved = JSON.parse(localStorage.getItem('userSettings')||'{}');
    saved.account = payload;
    localStorage.setItem('userSettings', JSON.stringify(saved));
    alert('✅ Settings saved locally (no server endpoint found)');
}

async function handleChangePassword(e){
    e.preventDefault();
    const form = e.currentTarget;
    const current = form.querySelector('input[placeholder="Enter current password"]').value;
    const next = form.querySelector('input[placeholder="Enter new password"]').value;
    const confirm = form.querySelector('input[placeholder="Confirm new password"]').value;

    if (!next || next.length < 8){ alert('Password must be at least 8 characters'); return; }
    if (next !== confirm){ alert('New password and confirm do not match'); return; }

    // POST to backend if endpoint exists
    const fd = new FormData(); fd.append('current_password', current); fd.append('new_password', next);
    try{
        const resp = await fetch('../settings/change_password.php', { method: 'POST', body: fd });
        if (resp.ok){ const r = await resp.json().catch(()=>({success:false})); if (r.success){ alert('✅ Password updated'); form.reset(); return; } else { alert('❌ ' + (r.message||'Failed to change password')); return; } }
    }catch(err){}

    // If no backend, just show message (cannot verify current password client-side)
    alert('Password change request saved locally (no server endpoint). You will need backend to actually change password.');
    form.reset();
}

function saveSettingsToLocal(){
    const saved = JSON.parse(localStorage.getItem('userSettings')||'{}');
    // notifications
    const toggles = Array.from(document.querySelectorAll('#notification .toggle')).map(cb=>cb.checked);
    saved.notifications = toggles;
    // theme
    const activeTheme = document.querySelector('.theme-btn.active');
    if (activeTheme) saved.theme = activeTheme.textContent.trim().toLowerCase();
    localStorage.setItem('userSettings', JSON.stringify(saved));
}

function applyTheme(theme){
    // theme: light, dark, auto
    // Keep data-theme for compatibility, but also toggle body.dark which our CSS uses
    if (!theme || theme === 'auto') {
        document.documentElement.setAttribute('data-theme','auto');
        document.body.classList.remove('dark');
        // If user prefers dark in OS, enable body.dark and listen for changes
        if (window.matchMedia) {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            if (mq.matches) document.body.classList.add('dark');
            // remove previous listener if present
            try{ if (window._settingsThemeMediaListener) mq.removeEventListener('change', window._settingsThemeMediaListener); }catch(e){}
            window._settingsThemeMediaListener = (ev) => {
                if (ev.matches) document.body.classList.add('dark'); else document.body.classList.remove('dark');
            };
            try{ mq.addEventListener('change', window._settingsThemeMediaListener); }catch(e){ try{ mq.addListener(window._settingsThemeMediaListener); }catch(e){} }
        }
    } else if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme','dark');
        document.body.classList.add('dark');
    } else {
        document.documentElement.setAttribute('data-theme','light');
        document.body.classList.remove('dark');
    }
    // debug log
    try{ console.log('applyTheme ->', theme, 'body.classList.contains("dark")=', document.body.classList.contains('dark')); }catch(e){}
}

// API Keys management (localStorage-backed)
function ensureApiKeysUi(){
    const integration = document.querySelector('#integration');
    if (!integration) return;
    if (integration.querySelector('#apiKeysContainer')) return;
    const container = document.createElement('div'); container.id='apiKeysContainer';
    container.style.marginTop = '18px';
    container.innerHTML = `
        <h3>API Keys</h3>
        <p>Generate and manage API keys for integrations.</p>
        <div id="apiKeysList" style="margin-bottom:12px;"></div>
        <div style="display:flex;gap:8px;align-items:center;">
            <button id="generateApiKey" class="btn-primary">Generate API Key</button>
            <button id="revokeAllApiKeys" class="btn-danger">Revoke All</button>
        </div>
    `;
    integration.appendChild(container);
    document.getElementById('generateApiKey').addEventListener('click', generateApiKey);
    document.getElementById('revokeAllApiKeys').addEventListener('click', ()=>{ if(confirm('Revoke all API keys?')){ localStorage.removeItem('apiKeys'); renderApiKeys(); }});
}

function renderApiKeys(){
    const listEl = document.getElementById('apiKeysList');
    if (!listEl) return;
    const keys = JSON.parse(localStorage.getItem('apiKeys')||'[]');
    if (!keys.length){ listEl.innerHTML = '<div class="muted">No API keys</div>'; return; }
    listEl.innerHTML = keys.map(k=>{
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border:1px solid #eee;border-radius:8px;margin-bottom:8px;">
            <div style="word-break:break-all;max-width:70%;">${escapeHtml(k.key)}</div>
            <div style="display:flex;gap:8px;align-items:center"><small style="color:#666">${k.created}</small><button data-id="${k.id}" class="btn-danger btn-sm revoke-key">Revoke</button></div>
        </div>`;
    }).join('');

    listEl.querySelectorAll('.revoke-key').forEach(b=>b.addEventListener('click', (e)=>{
        const id = e.currentTarget.getAttribute('data-id');
        const keys = JSON.parse(localStorage.getItem('apiKeys')||'[]');
        const filtered = keys.filter(k=>k.id !== id);
        localStorage.setItem('apiKeys', JSON.stringify(filtered));
        renderApiKeys();
    }));
}

function generateApiKey(){
    // generate random 40-char key
    const key = generateRandomKey(40);
    const keys = JSON.parse(localStorage.getItem('apiKeys')||'[]');
    const entry = { id: String(Date.now()) + Math.random().toString(36).slice(2,6), key: key, created: new Date().toLocaleString() };
    keys.unshift(entry);
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    renderApiKeys();
    // show one-time disclosure
    alert('New API key created — copy it now. It will not be shown again.\n\n' + key);
}

function generateRandomKey(len){
    // use crypto if available
    try{
        const arr = new Uint8Array(len);
        crypto.getRandomValues(arr);
        return Array.from(arr).map(x=>x.toString(36).padStart(2,'0')).join('').slice(0,len).toUpperCase();
    }catch(e){
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let s=''; for(let i=0;i<len;i++) s+=chars[Math.floor(Math.random()*chars.length)]; return s;
    }
}

function escapeHtml(text){ if (!text) return ''; return String(text).replace(/[&<>'\"]/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[ch])); }
/**
 * Settings Page JavaScript
 * Handles all settings page functionality including:
 * - Account settings form
 * - Notification preferences
 * - Security settings
 * - System settings
 * - Theme switching
 * - Integration management
 */

(function() {
    'use strict';

    // Load user data when page loads
    function loadUserData() {
        fetch('../settings/get_user.php')
            .then(response => response.json())
            .then(data => {
                if (data && data.success !== false) {
                    // Populate account form
                    const emailInput = document.querySelector('#account input[type="email"]');
                    const nameInput = document.querySelector('#account input[placeholder*="name"]');
                    const phoneInput = document.querySelector('#account input[type="tel"]');
                    const bioInput = document.querySelector('#account textarea');

                    if (emailInput && data.email) emailInput.value = data.email;
                    if (nameInput && data.full_name) nameInput.value = data.full_name;
                    if (phoneInput && data.phone) phoneInput.value = data.phone || '';
                    if (bioInput && data.bio) bioInput.value = data.bio || '';
                }
            })
            .catch(err => {
                console.error('Error loading user data:', err);
                Toast.error('Failed to load user data');
            });
    }

    // Account Settings Form Handler
    function initAccountSettings() {
        const accountForm = document.querySelector('#account .settings-form');
        if (!accountForm) return;

        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(accountForm);
            const fullName = accountForm.querySelector('input[placeholder*="name"]').value;
            const phone = accountForm.querySelector('input[type="tel"]').value;
            const bio = accountForm.querySelector('textarea').value;

            // Validate
            if (!fullName) {
                Toast.warning('Name is required');
                return;
            }

            // Send to backend (email is NOT included - email should never be editable from frontend)
            fetch('../settings/update_account.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    full_name: fullName,
                    phone: phone,
                    bio: bio
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Toast.success('Account settings saved successfully!');
                    // Update user name in header
                    const userName = document.getElementById('userName');
                    const dropUserName = document.getElementById('dropUserName');
                    const userAvatar = document.getElementById('userAvatar');
                    if (userName) userName.textContent = fullName;
                    if (dropUserName) dropUserName.textContent = fullName;
                    if (userAvatar) userAvatar.textContent = fullName.charAt(0).toUpperCase();
                } else {
                    Toast.error(data.message || 'Failed to save settings');
                }
            })
            .catch(err => {
                console.error('Error saving account settings:', err);
                Toast.error('Failed to save account settings');
            });
        });
    }

    // Notification Preferences Handler
    function initNotificationSettings() {
        const notificationToggles = document.querySelectorAll('#notification .toggle');
        
        notificationToggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const title = this.closest('.option-group').querySelector('.option-title').textContent;
                const enabled = this.checked;

                // Save preference
                fetch('../settings/update_notifications.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        preference: title,
                        enabled: enabled
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Toast.success(`${title} ${enabled ? 'enabled' : 'disabled'}`);
                    } else {
                        Toast.error('Failed to save preference');
                        this.checked = !enabled; // Revert
                    }
                })
                .catch(err => {
                    console.error('Error saving notification preference:', err);
                    Toast.error('Failed to save preference');
                    this.checked = !enabled; // Revert
                });
            });
        });
    }

    // Security Settings Handler
    function initSecuritySettings() {
        const securityForm = document.querySelector('#security .settings-form');
        if (!securityForm) return;

        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const currentPassword = securityForm.querySelector('input[placeholder*="current"]').value;
            const newPassword = securityForm.querySelector('input[placeholder*="new password"]').value;
            const confirmPassword = securityForm.querySelector('input[placeholder*="Confirm"]').value;

            // Validate
            if (!currentPassword || !newPassword || !confirmPassword) {
                Toast.warning('All password fields are required');
                return;
            }

            if (newPassword.length < 6) {
                Toast.warning('Password must be at least 6 characters');
                return;
            }

            if (newPassword !== confirmPassword) {
                Toast.error('New passwords do not match');
                return;
            }

            // Send to backend
            fetch('../settings/update_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Toast.success('Password updated successfully!');
                    securityForm.reset();
                } else {
                    Toast.error(data.message || 'Failed to update password');
                }
            })
            .catch(err => {
                console.error('Error updating password:', err);
                Toast.error('Failed to update password');
            });
        });

        // 2FA Enable button
        const enable2FABtn = document.querySelector('#security .btn-secondary');
        if (enable2FABtn) {
            enable2FABtn.addEventListener('click', function() {
                Toast.info('Two-factor authentication coming soon!');
            });
        }
    }

    // System Settings Handler
    function initSystemSettings() {
        // Maintenance mode toggle
        const maintenanceToggle = document.querySelector('#system .toggle');
        if (maintenanceToggle) {
            maintenanceToggle.addEventListener('change', function() {
                const enabled = this.checked;
                
                fetch('../settings/update_system.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        setting: 'maintenance_mode',
                        value: enabled
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
                    } else {
                        Toast.error('Failed to update system setting');
                        this.checked = !enabled;
                    }
                })
                .catch(err => {
                    console.error('Error updating system setting:', err);
                    Toast.error('Failed to update system setting');
                    this.checked = !enabled;
                });
            });
        }


    }

    // Integration Settings Handler
    function initIntegrationSettings() {
        const connectButtons = document.querySelectorAll('#integration .btn-connect');
        
        connectButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const integrationName = this.closest('.integration-item').querySelector('h3').textContent;
                const isConnected = this.classList.contains('connected');

                if (isConnected) {
                    // Disconnect
                    if (confirm(`Disconnect from ${integrationName}?`)) {
                        this.classList.remove('connected');
                        this.textContent = 'Connect';
                        Toast.success(`Disconnected from ${integrationName}`);
                    }
                } else {
                    // Connect
                    Toast.info(`Connecting to ${integrationName}...`);
                    setTimeout(() => {
                        this.classList.add('connected');
                        this.textContent = 'Connected';
                        Toast.success(`Successfully connected to ${integrationName}!`);
                    }, 1500);
                }
            });
        });
    }

    // Appearance Settings Handler
    function initAppearanceSettings() {
        // Theme switcher
        const themeButtons = document.querySelectorAll('#appearance .theme-btn');
        
        themeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active from all
                themeButtons.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                this.classList.add('active');
                
                const theme = this.textContent.toLowerCase();
                Toast.success(`Theme changed to ${theme}`);
                
                // Save preference
                fetch('../settings/update_system.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        setting: 'theme',
                        value: theme
                    })
                })
                .then(response => response.json())
                .catch(err => console.error('Error saving theme:', err));
            });
        });

        // Compact view toggle
        const compactToggle = document.querySelector('#appearance .toggle');
        if (compactToggle) {
            compactToggle.addEventListener('change', function() {
                const enabled = this.checked;
                Toast.success(`Compact view ${enabled ? 'enabled' : 'disabled'}`);
                
                fetch('../settings/update_system.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        setting: 'compact_view',
                        value: enabled
                    })
                })
                .then(response => response.json())
                .catch(err => console.error('Error saving compact view:', err));
            });
        }
    }

    // Sidebar navigation
    function initSidebarNavigation() {
        const navLinks = document.querySelectorAll('.settings-nav a');
        const sections = document.querySelectorAll('.settings-section');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active to clicked link
                this.classList.add('active');

                // Get target section
                const targetId = this.getAttribute('href').substring(1);
                
                // Hide all sections
                sections.forEach(s => s.style.display = 'none');
                
                // Show target section
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
            });
        });

        // Show first section by default
        if (sections.length > 0) {
            sections.forEach(s => s.style.display = 'none');
            sections[0].style.display = 'block';
        }
    }

    // Initialize all settings functionality
    function init() {
        console.log('Settings page initialized');
        
        loadUserData();
        initSidebarNavigation();
        initAccountSettings();
        initNotificationSettings();
        initSecuritySettings();
        initSystemSettings();
        initIntegrationSettings();
        initAppearanceSettings();

        Toast.info('Settings page loaded');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
