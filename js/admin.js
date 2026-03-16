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
    loadOverviewData();
    loadUsers();
    loadProjects();
    loadActivityLogs();
    loadPasswordResets();
    loadDatabaseStats();
    
    // Setup event listeners
    setupEventListeners();
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
}

// Load Overview Data
async function loadOverviewData() {
    try {
        const response = await fetch('../settings/admin_api.php?action=overview');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalUsers').textContent = data.stats.total_users;
            document.getElementById('totalProjects').textContent = data.stats.total_projects;
            document.getElementById('totalTasks').textContent = data.stats.total_tasks;
            document.getElementById('activeUsers').textContent = data.stats.active_users;
            
            // Load recent activity for overview
            displayRecentActivity(data.recent_activity || []);
        }
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

// Display Recent Activity
function displayRecentActivity(activities) {
    const container = document.getElementById('recentActivity');
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="loading">No recent activity</p>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <strong>${escapeHtml(activity.user_name || 'System')}</strong>
            ${escapeHtml(activity.description)}
            <small>${formatDate(activity.created_at)}</small>
        </div>
    `).join('');
}

// Load Users
async function loadUsers() {
    try {
        const response = await fetch('../settings/admin_api.php?action=users');
        const data = await response.json();
        
        if (data.success) {
            window.allUsers = data.users; // Store for filtering
            displayUsers(data.users);
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
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${escapeHtml(user.full_name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.role)}</td>
            <td>${escapeHtml(user.department || '-')}</td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn-primary btn-sm" onclick="editUser(${user.id})">Edit</button>
                <button class="btn-danger btn-sm" onclick="deleteUser(${user.id}, '${escapeHtml(user.email)}')">Delete</button>
            </td>
        </tr>
    `).join('');
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
                <button class="btn-primary btn-sm" onclick="viewProject(${project.id})">View</button>
                <button class="btn-danger btn-sm" onclick="deleteProject(${project.id}, '${escapeHtml(project.name)}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Load Activity Logs
async function loadActivityLogs() {
    try {
        const response = await fetch('../settings/admin_api.php?action=activity');
        const data = await response.json();
        
        if (data.success) {
            window.allActivity = data.activity;
            displayActivity(data.activity);
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

// Action Functions
function editUser(userId) {
    alert(`Edit user functionality - User ID: ${userId}\nComing soon!`);
}

function deleteUser(userId, email) {
    if (confirm(`Are you sure you want to delete user: ${email}?`)) {
        alert('Delete user functionality coming soon!');
        // TODO: Implement delete user API call
    }
}

function viewProject(projectId) {
    alert(`View project functionality - Project ID: ${projectId}\nComing soon!`);
}

function deleteProject(projectId, name) {
    if (confirm(`Are you sure you want to delete project: ${name}?`)) {
        alert('Delete project functionality coming soon!');
        // TODO: Implement delete project API call
    }
}

// Refresh Functions
function refreshUsers() {
    loadUsers();
}

function refreshProjects() {
    loadProjects();
}

function refreshLogs() {
    loadActivityLogs();
}

function refreshPasswordResets() {
    loadPasswordResets();
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
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}
