/**
 * Admin Dashboard JavaScript
 * Handles all admin panel functionality
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Setup navigation
    setupNavigation();
    
    // Load initial data
    loadUsers();
    loadArchive();
    loadProjects();
    loadActivityLogs();
    loadPasswordResets();
    loadDatabaseStats();
    
    // Setup event listeners
    setupEventListeners();
    // Initialize dark mode toggle (if present)
    setupDarkMode();
}

// Navigation
function setupNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.content-section');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Event Listeners
function setupEventListeners() {
    // User search
    document.getElementById('userSearch')?.addEventListener('input', filterUsers);
    document.getElementById('roleFilter')?.addEventListener('change', filterUsers);
    document.getElementById('statusFilter')?.addEventListener('change', filterUsers);
    
    // Activity search
    document.getElementById('activitySearch')?.addEventListener('input', filterActivity);
    document.getElementById('actionFilter')?.addEventListener('change', filterActivity);
    
    // Password reset search
    document.getElementById('resetSearch')?.addEventListener('input', filterPasswordResets);
    document.getElementById('resetStatusFilter')?.addEventListener('change', filterPasswordResets);
    // Archive search
    document.getElementById('archiveSearch')?.addEventListener('input', filterArchive);
}

// Dark mode toggle setup — safe no-op if toggle element is missing
function setupDarkMode() {
    try {
        const toggle = document.getElementById('darkModeToggle') || document.querySelector('.dark-mode-toggle');
        const darkClass = 'dark-mode';

        // Apply saved preference
        const saved = localStorage.getItem('darkMode');
        if (saved === 'enabled') document.body.classList.add(darkClass);

        if (!toggle) return; // nothing to wire up

        // Initialize toggle aria state
        toggle.setAttribute('aria-pressed', document.body.classList.contains(darkClass));

        toggle.addEventListener('click', () => {
            const enabled = document.body.classList.toggle(darkClass);
            localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
            toggle.setAttribute('aria-pressed', enabled);
        });
    } catch (err) {
        console.warn('setupDarkMode error', err);
    }
}



// Load Users
async function loadUsers() {
    try {
        const response = await fetch('../settings/admin_api.php?action=users');
        const data = await response.json();
        
        if (data.success) {
            window.allUsers = data.users; // Store for filtering
            displayUsers(data.users);
            // Update header count
            const hdr = document.querySelector('#users .section-header h1');
            if (hdr) hdr.textContent = `User Management (${(data.users || []).length})`;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        document.querySelector('#usersTable tbody').innerHTML = 
            '<tr><td colspan="8" class="loading">Error loading users</td></tr>';
    }
}

// Display Users
function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');

    // Respect an explicit status filter if set; otherwise show only active users
    const statusFilterEl = document.getElementById('statusFilter');
    const statusFilterVal = statusFilterEl ? statusFilterEl.value : '';

    let visibleUsers = users;
    if (!statusFilterVal) {
        visibleUsers = users.filter(u => u.status === 'active');
    } else {
        visibleUsers = users.filter(u => u.status === statusFilterVal);
    }

    if (!visibleUsers || visibleUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No users found</td></tr>';
        const hdr = document.querySelector('#users .section-header h1');
        if (hdr) hdr.textContent = `User Management (0)`;
        return;
    }

    tbody.innerHTML = visibleUsers.map(user => {
        const isAdmin = (user.role === 'admin');
        const actionHtml = isAdmin ? '-' : `
                <button class="btn-primary btn-sm" onclick="editUser(${user.id})">Edit</button>
                <button class="btn-danger btn-sm" title="Archive user" aria-label="Archive user" onclick="deleteUser(${user.id}, '${escapeHtml(user.email)}')">Archive</button>
            `;

        return `
        <tr>
            <td>${user.id}</td>
            <td>${escapeHtml(user.full_name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.role)}</td>
            <td>${escapeHtml(user.department || '-')}</td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td>${actionHtml}</td>
        </tr>
        `;
    }).join('');
    // Update header count to reflect displayed rows
    const hdr = document.querySelector('#users .section-header h1');
    if (hdr) hdr.textContent = `User Management (${visibleUsers.length})`;
}

// Filter Users
function filterUsers() {
    if (!window.allUsers) return;
    
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = window.allUsers.filter(user => {
        const matchSearch = !searchTerm || 
            user.full_name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        const matchRole = !roleFilter || user.role === roleFilter;
        const matchStatus = !statusFilter || user.status === statusFilter;
        
        return matchSearch && matchRole && matchStatus;
    });
    
    displayUsers(filtered);
}

// Load Projects
async function loadProjects() {
    try {
        const response = await fetch('../settings/admin_api.php?action=projects');
        const data = await response.json();
        
        if (data.success) {
            displayProjects(data.projects);
            // Update header count
            const hdr = document.querySelector('#projects .section-header h1');
            if (hdr) hdr.textContent = `Project Management (${(data.projects || []).length})`;
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Display Projects
function displayProjects(projects) {
    const tbody = document.querySelector('#projectsTable tbody');
    
    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No projects found</td></tr>';
        const hdr = document.querySelector('#projects .section-header h1');
        if (hdr) hdr.textContent = `Project Management (0)`;
        return;
    }
    
    tbody.innerHTML = projects.map(project => `
        <tr>
            <td>${project.id}</td>
            <td>${escapeHtml(project.name)}</td>
            <td><span class="status-badge status-${project.status}">${project.status}</span></td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                ${project.progress}%
            </td>
            <td>${formatDate(project.start_date)}</td>
            <td>${formatDate(project.end_date)}</td>
            <td>${escapeHtml(project.created_by_name || 'N/A')}</td>
            <td>
                <button class="btn-primary btn-sm" onclick="viewProject(${JSON.stringify(project.id)})">View</button>
                <button class="btn-danger btn-sm" onclick="deleteProject(${JSON.stringify(project.id)}, ${JSON.stringify(escapeHtml(project.name))})">Delete</button>
            </td>
        </tr>
    `).join('');
    // Update header count to reflect displayed rows
    const hdr = document.querySelector('#projects .section-header h1');
    if (hdr) hdr.textContent = `Project Management (${projects.length})`;
}

// Load Activity Logs
async function loadActivityLogs() {
    try {
        const response = await fetch('../settings/admin_api.php?action=activity');
        const data = await response.json();
        
        if (data.success) {
            window.allActivity = data.activity;
            displayActivity(data.activity);
            // Update header count
            const hdr = document.querySelector('#activity .section-header h1');
            if (hdr) hdr.textContent = `Activity Logs (${(data.activity || []).length})`;
        }
    } catch (error) {
        console.error('Error loading activity logs:', error);
    }
}

// Display Activity
function displayActivity(activities) {
    const tbody = document.querySelector('#activityTable tbody');
    
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No activity logs found</td></tr>';
        const hdr = document.querySelector('#activity .section-header h1');
        if (hdr) hdr.textContent = `Activity Logs (0)`;
        return;
    }
    
    tbody.innerHTML = activities.map(activity => `
        <tr>
            <td>${activity.id}</td>
            <td>${escapeHtml(activity.user_name || 'System')}</td>
            <td>${escapeHtml(activity.action)}</td>
            <td>${escapeHtml(activity.entity_type || '-')}</td>
            <td>${escapeHtml(activity.description)}</td>
            <td>${formatDate(activity.created_at)}</td>
        </tr>
    `).join('');
    // Update header count to reflect displayed rows (after filtering)
    const hdr = document.querySelector('#activity .section-header h1');
    if (hdr) hdr.textContent = `Activity Logs (${activities.length})`;
}

// Filter Activity
function filterActivity() {
    if (!window.allActivity) return;
    
    const searchTerm = document.getElementById('activitySearch').value.toLowerCase();
    const actionFilter = document.getElementById('actionFilter').value;
    
    const filtered = window.allActivity.filter(activity => {
        const matchSearch = !searchTerm || 
            (activity.description && activity.description.toLowerCase().includes(searchTerm)) ||
            (activity.user_name && activity.user_name.toLowerCase().includes(searchTerm));
        const matchAction = !actionFilter || activity.action === actionFilter;
        
        return matchSearch && matchAction;
    });
    
    displayActivity(filtered);
}

// Load Database Stats
async function loadDatabaseStats() {
    try {
        const response = await fetch('../settings/admin_api.php?action=database');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalTables').textContent = data.stats.total_tables;
            document.getElementById('totalRecords').textContent = data.stats.total_records;
        }
    } catch (error) {
        console.error('Error loading database stats:', error);
    }
}

// Archive functions
let allArchived = [];

async function loadArchive() {
    try {
        const response = await fetch('../settings/admin_api.php?action=archive');
        const data = await response.json();

        if (data.success) {
            allArchived = data.archived || [];
            displayArchive(allArchived);
            const hdr = document.querySelector('#archive .section-header h1');
            if (hdr) hdr.textContent = `Archived Accounts (${(allArchived || []).length})`;
        }
    } catch (error) {
        console.error('Error loading archive:', error);
        document.querySelector('#archiveTable tbody').innerHTML =
            '<tr><td colspan="8" class="loading">Error loading archived accounts</td></tr>';
    }
}

function displayArchive(items) {
    const tbody = document.querySelector('#archiveTable tbody');

    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No archived accounts found</td></tr>';
        const hdr = document.querySelector('#archive .section-header h1');
        if (hdr) hdr.textContent = `Archived Accounts (0)`;
        return;
    }

    tbody.innerHTML = items.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${escapeHtml(u.full_name)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${escapeHtml(u.role)}</td>
            <td>${escapeHtml(u.department || '-')}</td>
            <td><span class="status-badge status-${u.status}">${u.status}</span></td>
            <td>${formatDate(u.created_at)}</td>
            <td>${formatDate(u.updated_at)}</td>
        </tr>
    `).join('');

    const hdr = document.querySelector('#archive .section-header h1');
    if (hdr) hdr.textContent = `Archived Accounts (${items.length})`;
}

function filterArchive() {
    if (!window.allArchived) return;
    const searchTerm = document.getElementById('archiveSearch').value.toLowerCase();
    const filtered = window.allArchived.filter(u => {
        return !searchTerm || (u.full_name && u.full_name.toLowerCase().includes(searchTerm)) || (u.email && u.email.toLowerCase().includes(searchTerm));
    });
    displayArchive(filtered);
}

function refreshArchive() {
    const btn = document.querySelector('#archive .section-header .btn-primary');
    const originalText = btn ? btn.innerHTML : null;
    if (btn) { btn.disabled = true; btn.innerHTML = 'Refreshing...'; }
    showLoading();
    loadArchive().finally(() => {
        hideLoading();
        if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
    });
}

// Action Functions
function editUser(userId) {
    // Show user details modal (fetch from admin API)
    (async function(){
        try {
            const resp = await fetch(`../settings/admin_api.php?action=get_user_by_id&id=${userId}`);
            const data = await resp.json();
            if (!data.success) { if (typeof Toast !== 'undefined') Toast.error(data.message||'User not found'); else alert('User not found'); return; }
            const u = data.user;
            const existing = document.getElementById('editUserModal'); if (existing) existing.remove();
            const modal = document.createElement('div'); modal.id='editUserModal';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;';
            modal.innerHTML = `
                <div style="background:#fff;border-radius:12px;padding:20px;max-width:520px;width:92%;box-shadow:0 8px 32px rgba(0,0,0,.25);">
                    <h3 style="margin-top:0">Edit User</h3>
                    <form id="editUserForm">
                        <input type="hidden" id="editUserId" name="id" value="${u.id}" />
                        <input type="hidden" id="editUserRole" name="role" value="${escapeHtml(u.role||'user')}" />
                        <div style="margin-bottom:12px"><label>Username</label><input id="editUserUsername" name="username" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;" value="${escapeHtml(u.username||'')}"></div>
                        <div style="margin-bottom:12px">
                            <label>Role</label>
                            <div id="roleButtonGroup" style="display:flex;gap:8px;margin-top:4px;">
                                <button type="button" class="role-btn" data-role="staff" style="padding:8px 18px;border-radius:8px;border:2px solid #800000;cursor:pointer;font-weight:600;transition:all .2s;${u.role==='staff'?'background:#800000;color:#fff;':'background:#fff;color:#800000;'}">Staff</button>
                                <button type="button" class="role-btn" data-role="intern" style="padding:8px 18px;border-radius:8px;border:2px solid #800000;cursor:pointer;font-weight:600;transition:all .2s;${u.role==='intern'?'background:#800000;color:#fff;':'background:#fff;color:#800000;'}">Intern</button>
                            </div>
                        </div>
                        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
                            <button type="button" id="cancelEditUser" style="padding:8px 14px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;">Cancel</button>
                            <button type="submit" id="saveEditUser" style="padding:8px 14px;border-radius:8px;border:none;background:#800000;color:#fff;">Save</button>
                        </div>
                    </form>
                </div>`;
            document.body.appendChild(modal);

            // Role button toggle logic
            document.querySelectorAll('#roleButtonGroup .role-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('#roleButtonGroup .role-btn').forEach(b => {
                        b.style.background = '#fff'; b.style.color = '#800000';
                    });
                    this.style.background = '#800000'; this.style.color = '#fff';
                    document.getElementById('editUserRole').value = this.dataset.role;
                });
            });

            document.getElementById('cancelEditUser').onclick = () => modal.remove();
            modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

            // handle submit
            document.getElementById('editUserForm').addEventListener('submit', async function(e){
                e.preventDefault();
                const form = e.target;
                const formData = new FormData(form);
                try {
                    const resp2 = await fetch('../settings/admin_api.php?action=update_user', { method: 'POST', body: formData });
                    const data2 = await resp2.json();
                    if (data2.success) {
                        if (typeof Toast !== 'undefined') Toast.success(data2.message||'Username updated');
                        modal.remove();
                        loadUsers();
                    } else {
                        if (typeof Toast !== 'undefined') Toast.error(data2.message||'Failed to update');
                        else alert(data2.message||'Failed to update');
                    }
                } catch (err) {
                    console.error('update user err', err);
                    if (typeof Toast !== 'undefined') Toast.error('Network error');
                    else alert('Network error');
                }
            });
        } catch (err) { console.error('view user err', err); alert('Error loading user'); }
    })();
}

function deleteUser(userId, email) {
    // Show inline confirmation modal instead of browser confirm()
    const existing = document.getElementById('deleteUserModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'deleteUserModal';
    modal.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;
        align-items:center;justify-content:center;z-index:9999;
    `;
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:32px 28px;max-width:420px;
                    width:90%;box-shadow:0 8px 32px rgba(0,0,0,.25);text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
            <h3 style="margin:0 0 8px;color:#1e293b;font-size:18px;">Deactivate User</h3>
            <p style="color:#64748b;margin:0 0 24px;font-size:14px;">
                Are you sure you want to deactivate<br>
                <strong>${escapeHtml(email)}</strong>?<br>
                <span style="color:#f59e0b;font-size:12px;">The account will be set to inactive.</span>
            </p>
            <div style="display:flex;gap:12px;justify-content:center;">
                <button id="cancelDeleteBtn"
                    style="padding:10px 24px;border-radius:8px;border:1px solid #e2e8f0;
                           background:#f8fafc;color:#374151;cursor:pointer;font-size:14px;">
                    Cancel
                </button>
                <button id="confirmDeleteBtn"
                    style="padding:10px 24px;border-radius:8px;border:none;
                           background:#f59e0b;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">
                    Yes, Deactivate
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelDeleteBtn').onclick = () => modal.remove();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    document.getElementById('confirmDeleteBtn').onclick = async () => {
        modal.remove();
        try {
            const formData = new FormData();
            formData.append('id', userId);

            const response = await fetch('../settings/admin_api.php?action=delete_user', {
                method: 'POST',
                body: formData
            });

            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch {
                console.error('Non-JSON response from delete_user:', text);
                if (typeof Toast !== 'undefined') Toast.error('Server error — see console');
                else alert('Server error. See console.');
                return;
            }

            if (data.success) {
                if (typeof Toast !== 'undefined') Toast.success(data.message || 'User deleted successfully');
                else alert(data.message || 'User deleted');
                loadUsers();
            } else {
                if (typeof Toast !== 'undefined') Toast.error(data.message || 'Failed to delete user');
                else alert('Error: ' + (data.message || 'Failed to delete user'));
            }
        } catch (err) {
            console.error('Delete user error:', err);
            if (typeof Toast !== 'undefined') Toast.error('An error occurred while deleting the user');
            else alert('An error occurred. See console.');
        }
    };
}

function viewProject(projectId) {
    (async function(){
        try {
            const resp = await fetch(`../settings/admin_api.php?action=get_project_by_id&id=${projectId}`);
            const data = await resp.json();
            if (!data.success) { alert('Error: ' + (data.message||'Project not found')); return; }
            const p = data.project;
            const existing = document.getElementById('viewProjectModal'); if (existing) existing.remove();
            const modal = document.createElement('div'); modal.id='viewProjectModal';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;';
            modal.innerHTML = `
                <div style="background:#fff;border-radius:12px;padding:24px;max-width:720px;width:94%;box-shadow:0 8px 32px rgba(0,0,0,.25);">
                    <h3 style="margin-top:0">Project Details</h3>
                    <div style="margin-bottom:8px"><strong>Name:</strong> ${escapeHtml(p.name||'-')}</div>
                    <div style="margin-bottom:8px"><strong>Status:</strong> ${escapeHtml(p.status||'-')}</div>
                    <div style="margin-bottom:8px"><strong>Progress:</strong> ${escapeHtml(p.progress||0)}%</div>
                    <div style="margin-bottom:8px"><strong>Start:</strong> ${formatDate(p.start_date)}</div>
                    <div style="margin-bottom:8px"><strong>End:</strong> ${formatDate(p.end_date)}</div>
                    <div style="margin-bottom:8px"><strong>Created By:</strong> ${escapeHtml(p.created_by_name||'N/A')}</div>
                    <div style="margin-top:12px">${escapeHtml(p.description||'')}</div>
                    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px">
                        <button id="closeViewProject" style="padding:8px 14px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;">Close</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            document.getElementById('closeViewProject').onclick = () => modal.remove();
            modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        } catch (err) { console.error('view project err', err); alert('Error loading project'); }
    })();
}

function deleteProject(projectId, name) {
    // Inline confirmation modal
    const existing = document.getElementById('deleteProjectModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'deleteProjectModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:28px;max-width:480px;width:92%;box-shadow:0 8px 32px rgba(0,0,0,.25);text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">\u{1F5D1}\uFE0F</div>
            <h3 style="margin:0 0 8px;color:#1e293b;font-size:18px;">Delete Project</h3>
            <p style="color:#64748b;margin:0 0 20px;font-size:14px;">Are you sure you want to delete<br><strong>${escapeHtml(name)}</strong>?<br><span style="color:#800000;font-size:12px;">This action is permanent and cannot be undone.</span></p>
            <div style="display:flex;gap:12px;justify-content:center;">
                <button id="cancelDeleteProjectBtn" style="padding:10px 24px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#374151;cursor:pointer;font-size:14px;">Cancel</button>
                <button id="confirmDeleteProjectBtn" style="padding:10px 24px;border-radius:8px;border:none;background:#800000;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">Yes, Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelDeleteProjectBtn').onclick = () => modal.remove();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    document.getElementById('confirmDeleteProjectBtn').onclick = async () => {
        modal.remove();
        try {
            const formData = new FormData();
            formData.append('id', projectId);
            const resp = await fetch('../settings/admin_api.php?action=delete_project', { method: 'POST', body: formData });
            const text = await resp.text();
            let data;
            try { data = JSON.parse(text); } catch (parseErr) {
                console.error('Non-JSON response from delete_project:', text);
                if (typeof Toast !== 'undefined') Toast.error('Server error \u2014 see console');
                else alert('Server error. See console.');
                return;
            }
            if (data.success) {
                if (typeof Toast !== 'undefined') Toast.success(data.message || 'Project deleted successfully');
                loadProjects();
            } else {
                if (typeof Toast !== 'undefined') Toast.error(data.message || 'Failed to delete project');
                else alert('Error: ' + (data.message || 'Failed to delete project'));
            }
        } catch (err) {
            console.error('delete project err', err);
            if (typeof Toast !== 'undefined') Toast.error('Error deleting project');
            else alert('Error deleting project');
        }
    };
}

function openEditProjectModal(projectId) {
    (async function(){
        try {
            const resp = await fetch(`../settings/admin_api.php?action=get_project_by_id&id=${projectId}`);
            const data = await resp.json();
            if (!data.success) { if (typeof Toast !== 'undefined') Toast.error(data.message||'Project not found'); else alert('Project not found'); return; }
            const p = data.project;

            const existing = document.getElementById('editProjectModal'); if (existing) existing.remove();
            const modal = document.createElement('div'); modal.id='editProjectModal';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;';
            modal.innerHTML = `
                <div style="background:#fff;border-radius:12px;padding:20px;max-width:720px;width:96%;box-shadow:0 8px 32px rgba(0,0,0,.25);">
                    <h3 style="margin-top:0">Edit Project</h3>
                    <form id="editProjectForm">
                        <input type="hidden" id="editProjectId" name="id" value="${p.id}" />
                        <div style="margin-bottom:8px"><label>Name</label><input id="editProjectName" name="name" style="width:100%" value="${escapeHtml(p.name||'')}"></div>
                        <div style="margin-bottom:8px"><label>Description</label><textarea id="editProjectDescription" name="description" style="width:100%">${escapeHtml(p.description||'')}</textarea></div>
                        <div style="display:flex;gap:8px;margin-bottom:8px;">
                            <div style="flex:1"><label>Status</label><input id="editProjectStatus" name="status" style="width:100%" value="${escapeHtml(p.status||'')}"></div>
                            <div style="flex:1"><label>Progress</label><input id="editProjectProgress" name="progress" type="number" min="0" max="100" style="width:100%" value="${escapeHtml(p.progress||0)}"></div>
                        </div>
                        <div style="display:flex;gap:8px;margin-bottom:8px;">
                            <div style="flex:1"><label>Start</label><input id="editProjectStart" name="start_date" type="date" style="width:100%" value="${p.start_date ? p.start_date.split(' ')[0] : ''}"></div>
                            <div style="flex:1"><label>End</label><input id="editProjectEnd" name="end_date" type="date" style="width:100%" value="${p.end_date ? p.end_date.split(' ')[0] : ''}"></div>
                        </div>
                        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
                            <button type="button" id="cancelEditProject" style="padding:8px 14px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;">Cancel</button>
                            <button type="submit" id="saveEditProject" style="padding:8px 14px;border-radius:8px;border:none;background:#10b981;color:#fff;">Save</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('cancelEditProject').onclick = () => modal.remove();
            modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

            document.getElementById('editProjectForm').addEventListener('submit', async function(e){
                e.preventDefault();
                const form = e.target;
                const formData = new FormData(form);
                try {
                    const resp2 = await fetch('../settings/admin_api.php?action=update_project', { method: 'POST', body: formData });
                    const data2 = await resp2.json();
                    if (data2.success) {
                        if (typeof Toast !== 'undefined') Toast.success(data2.message||'Project updated');
                        modal.remove();
                        loadProjects();
                    } else {
                        if (typeof Toast !== 'undefined') Toast.error(data2.message||'Failed to update');
                        else alert(data2.message||'Failed to update');
                    }
                } catch (err) {
                    console.error('update project err', err);
                    if (typeof Toast !== 'undefined') Toast.error('Network error');
                    else alert('Network error');
                }
            });

        } catch (err) { console.error('edit project err', err); if (typeof Toast !== 'undefined') Toast.error('Error loading project'); else alert('Error loading project'); }
    })();
}

// Loading overlay helpers
function showLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.add('active');
}
function hideLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.remove('active');
}

// Refresh Functions
function refreshUsers() {
    const btn = document.querySelector('#users .section-header .btn-primary');
    const originalText = btn ? btn.innerHTML : null;
    if (btn) { btn.disabled = true; btn.innerHTML = 'Refreshing...'; }
    showLoading();
    loadUsers().finally(() => {
        hideLoading();
        if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
    });
}

function refreshProjects() {
    const btn = document.querySelector('#projects .section-header .btn-primary');
    const originalText = btn ? btn.innerHTML : null;
    if (btn) { btn.disabled = true; btn.innerHTML = 'Refreshing...'; }
    showLoading();
    loadProjects().finally(() => {
        hideLoading();
        if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
    });
}

function refreshLogs() {
    const btn = document.querySelector('#activity .section-header .btn-primary');
    const originalText = btn ? btn.innerHTML : null;
    if (btn) { btn.disabled = true; btn.innerHTML = 'Refreshing...'; }
    showLoading();
    loadActivityLogs().finally(() => {
        hideLoading();
        if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
    });
}

function refreshPasswordResets() {
    const btn = document.querySelector('#password-resets .section-header .btn-primary');
    const originalText = btn ? btn.innerHTML : null;
    if (btn) { btn.disabled = true; btn.innerHTML = 'Refreshing...'; }
    showLoading();
    loadPasswordResets().finally(() => {
        hideLoading();
        if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
    });
}

// Load Password Reset Requests
let allPasswordResets = [];

async function loadPasswordResets() {
    try {
        const response = await fetch('../settings/admin_api.php?action=password_resets');
        const data = await response.json();
        
        if (data.success) {
            allPasswordResets = data.resets;
            displayPasswordResets(allPasswordResets);
            // Update header count
            const hdr = document.querySelector('#password-resets .section-header h1');
            if (hdr) hdr.textContent = `Password Reset Requests (${(data.resets || []).length})`;
        }
    } catch (error) {
        console.error('Error loading password resets:', error);
        document.querySelector('#resetRequestsTable tbody').innerHTML = 
            '<tr><td colspan="9" class="loading">Error loading password reset requests</td></tr>';
    }
}

// Display Password Resets
function displayPasswordResets(resets) {
    const tbody = document.querySelector('#resetRequestsTable tbody');
    
    if (!resets || resets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No password reset requests found</td></tr>';
        const hdr = document.querySelector('#password-resets .section-header h1');
        if (hdr) hdr.textContent = `Password Reset Requests (0)`;
        return;
    }
    
    tbody.innerHTML = resets.map(reset => {
        const statusClass = reset.status === 'approved' ? 'completed' : 
                           reset.status === 'rejected' ? 'inactive' : 
                           reset.status === 'expired' ? 'inactive' : 'active';
        
        let actionButtons = '-';
        if (reset.approval_status === 'pending' && reset.status === 'pending') {
            actionButtons = `
                <button class="btn-success" onclick="approvePasswordReset(${reset.id})" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">Approve</button>
                <button class="btn-danger" onclick="rejectPasswordReset(${reset.id})" style="padding: 5px 10px; font-size: 12px;">Reject</button>
            `;
        }
        
        return `
            <tr>
                <td>${escapeHtml(reset.id)}</td>
                <td>${escapeHtml(reset.email)}</td>
                <td>${escapeHtml(reset.full_name || '-')}</td>
                <td><code style="font-size: 11px;">${escapeHtml(reset.token.substring(0, 20))}...</code></td>
                <td><span class="status-badge ${statusClass}">${escapeHtml(reset.status)}</span></td>
                <td>${formatDate(reset.created_at)}</td>
                <td>${formatDate(reset.expires_at)}</td>
                <td>${reset.used_at ? formatDate(reset.used_at) : '-'}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join('');
    // Update header count to reflect displayed rows
    const hdr = document.querySelector('#password-resets .section-header h1');
    if (hdr) hdr.textContent = `Password Reset Requests (${resets.length})`;
}

// Filter Password Resets
function filterPasswordResets() {
    const searchTerm = document.getElementById('resetSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('resetStatusFilter')?.value || '';
    
    const filtered = allPasswordResets.filter(reset => {
        const matchesSearch = reset.email.toLowerCase().includes(searchTerm) ||
                            (reset.full_name && reset.full_name.toLowerCase().includes(searchTerm));
        const matchesStatus = !statusFilter || reset.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayPasswordResets(filtered);
}

// Approve Password Reset
async function approvePasswordReset(id) {
    if (!confirm('Are you sure you want to approve this password reset request? The user\'s password will be changed immediately.')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('id', id);
        
        const response = await fetch('../settings/admin_api.php?action=approve_reset', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Password reset approved successfully!');
            loadPasswordResets(); // Reload the data
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error approving password reset:', error);
        alert('An error occurred while approving the request.');
    }
}

// Reject Password Reset
async function rejectPasswordReset(id) {
    if (!confirm('Are you sure you want to reject this password reset request?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('id', id);
        
        const response = await fetch('../settings/admin_api.php?action=reject_reset', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Password reset rejected.');
            loadPasswordResets(); // Reload the data
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error rejecting password reset:', error);
        alert('An error occurred while rejecting the request.');
    }
}

// Delete Reset Token (deprecated - kept for compatibility)
async function deleteResetToken(id) {
    // Redirect to reject function
    rejectPasswordReset(id);
}

// Utility Functions
function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}
