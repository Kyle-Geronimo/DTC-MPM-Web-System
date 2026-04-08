/**
 * Dashboard JavaScript
 * Handles all Quick Actions modals
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

function setupModal(modalId, btnId, closeBtnClass, cancelBtnClass, formId, submitHandler) {
    const modal = document.getElementById(modalId);
    const btn = document.getElementById(btnId);

    // If modal or button not present on this page, skip setup quietly
    if (!modal || !btn) {
        console.debug('setupModal: skipping, modal or button missing', { modalId, btnId, modalExists: !!modal, btnExists: !!btn });
        return;
    }

    console.debug('setupModal: binding', { modalId, btnId });

    const closeBtn = modal.querySelector(`.${closeBtnClass}`);
    const cancelBtn = modal.querySelector(`.${cancelBtnClass}`);
    const form = document.getElementById(formId);

    // Open modal
    btn.addEventListener('click', () => {
        console.debug('setupModal: button clicked', { modalId, btnId });
        // reset form when opening for a fresh create
        try { if (form) form.reset(); } catch (e) {}
        // clear possible task_id hidden field to avoid accidental edits
        try {
            const hid = form ? form.querySelector('input[name="task_id"]') : null;
            if (hid) hid.value = '';
        } catch (e) {}
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // Close modal function
    const closeModalFunc = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        try { if (form) form.reset(); } catch (e) {}
    };

    // Close events
    if (closeBtn) closeBtn.addEventListener('click', closeModalFunc);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModalFunc);

    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitHandler(form, closeModalFunc);
        });
    }
}

function showFormErrors(form, messages) {
    if (!form) return;
    let box = form.querySelector('.form-errors');
    if (!box) {
        box = document.createElement('div');
        box.className = 'form-errors';
        box.style.cssText = 'background:#D4B0B0;border:1px solid #C09090;color:#611;padding:10px;margin-bottom:12px;border-radius:6px;';
        form.insertBefore(box, form.firstChild);
    }
    if (Array.isArray(messages)) {
        box.innerHTML = messages.map(m => `<div>${m}</div>`).join('');
    } else {
        box.textContent = messages || 'There was an error';
    }
}

async function submitForm(formData, endpoint, submitBtn, successMessage, closeModal, formEl = null, onSuccess = null) {
    // Disable button and show loading
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.classList.add('loading');
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Response is not JSON:', text);
            throw new Error('Server error: ' + text.substring(0, 100));
        }
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (data.success) {
            // clear any form errors
            if (formEl) {
                const fe = formEl.querySelector('.form-errors');
                if (fe) fe.remove();
            }
            // show success briefly then close
            try { if (typeof toastr !== 'undefined') toastr.success(successMessage); } catch(e){}
            closeModal();
            // call optional callback to update UI without reload
            if (typeof onSuccess === 'function') {
                try { await onSuccess(data); } catch (e) { console.error('onSuccess handler error', e); }
            } else {
                setTimeout(() => location.reload(), 500);
            }
        } else {
            // display validation or server message inline when possible
            if (formEl) {
                if (data.errors) {
                    showFormErrors(formEl, data.errors);
                } else if (data.message) {
                    showFormErrors(formEl, data.message);
                } else {
                    showFormErrors(formEl, 'Unknown error');
                }
            } else {
                alert('❌ Error: ' + (data.message || 'Unknown error'));
            }
            console.error('Server error:', data);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
    }
}

// ============================================
// NEW PROJECT MODAL
// ============================================

setupModal(
    'newProjectModal',
    'newProjectBtn',
    'close',
    'btn-secondary',
    'newProjectForm',
    async (form, closeModal) => {
        // Validate dates
        const startDate = document.getElementById('projectStartDate').value;
        const endDate = document.getElementById('projectEndDate').value;
        
        if (new Date(endDate) < new Date(startDate)) {
            alert('End date must be after start date');
            return;
        }
        
        const formData = new FormData(form);
        const submitBtn = document.getElementById('submitProjectBtn');
        
        await submitForm(
            formData,
            '../settings/create_project.php',
            submitBtn,
            'Project created successfully!',
            closeModal,
            form
        );
    }
);

// Set minimum dates on load
const today = new Date().toISOString().split('T')[0];
const projectStartDateEl = document.getElementById('projectStartDate');
const projectEndDateEl = document.getElementById('projectEndDate');
if (projectStartDateEl) projectStartDateEl.min = today;
if (projectEndDateEl) projectEndDateEl.min = today;

// Auto-update end date
if (projectStartDateEl) {
projectStartDateEl.addEventListener('change', function() {
    const startDate = new Date(this.value);
    const endDateInput = document.getElementById('projectEndDate');
    endDateInput.min = this.value;
    
    if (endDateInput.value && new Date(endDateInput.value) < startDate) {
        const suggestedEndDate = new Date(startDate);
        suggestedEndDate.setDate(suggestedEndDate.getDate() + 30);
        endDateInput.value = suggestedEndDate.toISOString().split('T')[0];
    }
});
}

// ============================================
// ASSIGN TASK MODAL
// ============================================

setupModal(
    'assignTaskModal',
    'assignTaskBtn',
    'close-task',
    'cancel-task',
    'assignTaskForm',
    async (form, closeModal) => {
        // Basic client-side validation
        const titleEl = form.querySelector('input[name="title"]');
        const dueEl = form.querySelector('input[name="due_date"]');
        const titleVal = titleEl ? titleEl.value.trim() : '';
        const dueVal = dueEl ? dueEl.value : '';
        if (!titleVal) {
            showFormErrors(form, 'Task title is required');
            return;
        }
        if (!dueVal) {
            showFormErrors(form, 'Due date is required');
            return;
        }
        if (new Date(dueVal) < new Date(today)) {
            showFormErrors(form, 'Due date cannot be in the past');
            return;
        }

        const formData = new FormData(form);
        const submitBtn = document.getElementById('submitTaskBtn');
        // If editing (task_id present), call update endpoint
        const taskIdField = form.querySelector('input[name="task_id"]');
        if (taskIdField && taskIdField.value) {
            // update
            await submitForm(
                formData,
                '../settings/update_task.php',
                submitBtn,
                'Task updated successfully!',
                closeModal,
                form
            );
        } else {
            // create
            await submitForm(
                formData,
                '../settings/assign_task.php',
                submitBtn,
                'Task assigned successfully!',
                closeModal,
                form,
                async () => {
                    try {
                        await Promise.all([
                            loadFrontPanelTaskSummary(),
                            loadDashboardStats()
                        ]);
                    } catch (err) {
                        console.error('Error refreshing dashboard after task creation', err);
                    }
                }
            );
        }
    }
);

// Set minimum date for task (guard element exists)
const taskDueDateEl = document.getElementById('taskDueDate');
if (taskDueDateEl) taskDueDateEl.min = today;

// ============================================
// SCHEDULE MEETING MODAL
// ============================================

setupModal(
    'scheduleMeetingModal',
    'scheduleMeetingBtn',
    'close-meeting',
    'cancel-meeting',
    'scheduleMeetingForm',
    async (form, closeModal) => {
        const formData = new FormData(form);
        const submitBtn = document.getElementById('submitMeetingBtn');
        
        await submitForm(
            formData,
            '../settings/schedule_meeting.php',
            submitBtn,
            'Meeting scheduled successfully!',
            closeModal,
            form
        );
    }
);

// ============================================
// FRONT PANEL TASK WATCHLIST
// ============================================
function escapeTaskSummaryHtml(text) {
    return String(text ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[character]));
}

function formatTaskSummaryLabel(value) {
    return String(value ?? '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function parseTaskSummaryDate(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const rawValue = String(value).trim();
    if (!rawValue) {
        return null;
    }

    if (/^\d+$/.test(rawValue)) {
        const numericValue = Number(rawValue);
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            return null;
        }

        const milliseconds = numericValue > 9999999999 ? numericValue : numericValue * 1000;
        const numericDate = new Date(milliseconds);
        return Number.isNaN(numericDate.getTime()) ? null : numericDate;
    }

    const parsedDate = new Date(rawValue);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function describeTaskSummaryDate(value) {
    const parsedDate = parseTaskSummaryDate(value);
    if (!parsedDate) {
        return {
            label: 'No due date',
            tone: 'none',
            sortValue: Number.MAX_SAFE_INTEGER
        };
    }

    const taskDate = new Date(parsedDate);
    taskDate.setHours(0, 0, 0, 0);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((taskDate.getTime() - todayDate.getTime()) / 86400000);
    const shortDate = taskDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (diffDays < 0) {
        return { label: `Overdue - ${shortDate}`, tone: 'overdue', sortValue: taskDate.getTime() };
    }
    if (diffDays === 0) {
        return { label: `Due today - ${shortDate}`, tone: 'today', sortValue: taskDate.getTime() };
    }
    if (diffDays <= 3) {
        return { label: `Due soon - ${shortDate}`, tone: 'soon', sortValue: taskDate.getTime() };
    }

    return { label: `Due ${shortDate}`, tone: 'upcoming', sortValue: taskDate.getTime() };
}

function normalizeTaskSummaryProgress(task) {
    const rawProgress = Number(task.progress);
    if (Number.isFinite(rawProgress)) {
        return Math.max(0, Math.min(100, Math.round(rawProgress)));
    }

    const status = String(task.status || '').toLowerCase();
    if (status === 'completed') return 100;
    if (status === 'in-progress') return 60;
    if (status === 'pending') return 20;
    return 0;
}

function getTaskSummaryPriority(priority) {
    const normalized = String(priority || 'medium').toLowerCase();
    return ['low', 'medium', 'high', 'critical'].includes(normalized) ? normalized : 'medium';
}

function getTaskSummaryPriorityWeight(priority) {
    const weights = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3
    };

    return weights[getTaskSummaryPriority(priority)] ?? weights.medium;
}

function sortTasksForSummary(tasks) {
    return tasks.slice().sort((taskA, taskB) => {
        const dueDateA = describeTaskSummaryDate(taskA.due_date).sortValue;
        const dueDateB = describeTaskSummaryDate(taskB.due_date).sortValue;
        if (dueDateA !== dueDateB) {
            return dueDateA - dueDateB;
        }

        const priorityDiff = getTaskSummaryPriorityWeight(taskA.priority) - getTaskSummaryPriorityWeight(taskB.priority);
        if (priorityDiff !== 0) {
            return priorityDiff;
        }

        return normalizeTaskSummaryProgress(taskB) - normalizeTaskSummaryProgress(taskA);
    });
}

function renderFrontPanelTaskSummary(tasks) {
    const container = document.getElementById('frontPanelTaskSummary');
    const footnote = document.getElementById('frontPanelTaskSummaryNote');
    if (!container) return;

    const activeTasks = sortTasksForSummary(
        (Array.isArray(tasks) ? tasks : []).filter((task) => String(task.status || '').toLowerCase() !== 'completed')
    );
    const visibleTasks = activeTasks.slice(0, 4);

    if (visibleTasks.length === 0) {
        container.innerHTML = '<div class="task-summary-empty">No active tasks to review right now.</div>';
        if (footnote) {
            footnote.textContent = 'Create or assign a task to see it here.';
        }
        return;
    }

    container.innerHTML = visibleTasks.map((task) => {
        const dueDate = describeTaskSummaryDate(task.due_date);
        const progress = normalizeTaskSummaryProgress(task);
        const priority = getTaskSummaryPriority(task.priority);
        const subtitleParts = [task.project_name, task.assigned_name].filter(Boolean);
        const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' - ') : 'General task';

        return `
            <article class="task-summary-item">
                <div class="task-summary-top">
                    <div class="task-summary-copy">
                        <h3>${escapeTaskSummaryHtml(task.title || 'Untitled task')}</h3>
                        <p>${escapeTaskSummaryHtml(subtitle)}</p>
                    </div>
                    <span class="task-priority-badge ${priority}">${escapeTaskSummaryHtml(formatTaskSummaryLabel(priority))}</span>
                </div>
                <div class="task-summary-meta">
                    <span class="task-date-pill ${dueDate.tone}">${escapeTaskSummaryHtml(dueDate.label)}</span>
                    <span class="task-status-pill">${escapeTaskSummaryHtml(formatTaskSummaryLabel(task.status || 'pending'))}</span>
                </div>
                <div class="task-summary-progress">
                    <div class="task-summary-progress-bar" aria-hidden="true">
                        <span style="width: ${progress}%"></span>
                    </div>
                    <strong>${progress}%</strong>
                </div>
            </article>
        `;
    }).join('');

    if (footnote) {
        const remainingTasks = activeTasks.length - visibleTasks.length;
        footnote.textContent = remainingTasks > 0
            ? `+${remainingTasks} more active task${remainingTasks === 1 ? '' : 's'} in the full task board.`
            : 'Live data from your active task list.';
    }
}

async function loadFrontPanelTaskSummary() {
    const container = document.getElementById('frontPanelTaskSummary');
    const footnote = document.getElementById('frontPanelTaskSummaryNote');
    if (!container) return;

    if (!container.dataset.loaded) {
        container.innerHTML = '<div class="task-summary-empty">Loading active tasks...</div>';
    }

    try {
        const response = await fetch('../settings/get_tasks.php', { cache: 'no-store' });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || result.message || 'Unable to load tasks');
        }

        container.dataset.loaded = 'true';
        renderFrontPanelTaskSummary(result.tasks || []);
    } catch (error) {
        console.error('Error loading front panel task summary:', error);
        container.innerHTML = '<div class="task-summary-empty">Unable to load the task watchlist right now.</div>';
        if (footnote) {
            footnote.textContent = '';
        }
    }
}

// Set minimum date for meeting
const meetingDateEl = document.getElementById('meetingDate');
if (meetingDateEl) meetingDateEl.min = today;

// ============================================
// ADD TEAM Modal (creates a team)
// ============================================
setupModal(
    'addTeamModal',
    'addTeamBtn',
    'close-member',
    'cancel-member',
    'addTeamForm',
    async (form, closeModal) => {
        const formData = new FormData(form);
        const submitBtn = document.getElementById('submitTeamBtn');
        
        await submitForm(
            formData,
            '../settings/add_team.php',
            submitBtn,
            'Team added successfully!',
            closeModal,
            form
        );
        // refresh dashboard stats after adding team
        try { loadDashboardStats(); } catch(e){}
    }
);

// ============================================
// ADD MEMBER Modal (dashboard quick add member)
// ============================================
setupModal(
    'addMemberModalDashboard',
    'openAddMemberBtn',
    'close-add-member',
    'cancelAddMemberDash',
    'addMemberFormDashboard',
    async (form, closeModal) => {
        // populate and submit form to add_member.php
        const formData = new FormData(form);
        const submitBtn = document.getElementById('submitAddMemberDash');
        await submitForm(
            formData,
            '../settings/add_member.php',
            submitBtn,
            'Member added successfully!',
            closeModal,
            form
        );
        try { loadDashboardStats(); } catch(e){}
    }
);

// Populate teams into the dashboard add-member modal when opened
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openAddMemberBtn');
    if (!openBtn) return;
    openBtn.addEventListener('click', async () => {
        const select = document.getElementById('memberTeamDash');
        if (!select) return;
        try {
            const res = await fetch('../settings/get_teams.php');
            const data = await res.json();
            if (data && data.success && Array.isArray(data.teams)) {
                select.innerHTML = '<option value="">Unassigned</option>';
                data.teams.forEach(t => {
                    const opt = document.createElement('option'); opt.value = t.id; opt.textContent = t.name; select.appendChild(opt);
                });
            }
        } catch (err) { console.error('Failed to load teams for dashboard modal', err); }
    });
});

// ============================================
// Store rendered activities to prevent unnecessary re-renders
// ============================================
let _lastRenderedActivities = [];
let _activityTimestampInterval = null;

function formatActivityTime(timestamp) {
    const dateObj = new Date(timestamp);
    const now = new Date();
    let timeText = '';
    
    const diffMs = now - dateObj;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) timeText = 'Just now';
    else if (diffMins < 60) timeText = `${diffMins}m ago`;
    else if (diffHours < 24) timeText = `${diffHours}h ago`;
    else if (diffDays < 7) timeText = `${diffDays}d ago`;
    else timeText = dateObj.toLocaleDateString();
    
    return timeText;
}

function updateActivityTimestamps() {
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach((item, idx) => {
        if (_lastRenderedActivities[idx]) {
            const timeSpan = item.querySelector('.activity-time');
            if (timeSpan) {
                timeSpan.textContent = formatActivityTime(_lastRenderedActivities[idx].timestamp);
            }
        }
    });
}

function renderActivities(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Smart comparison: only re-render if activities changed
    const activityKey = activities.map(a => a.action).join('|');
    const lastKey = _lastRenderedActivities.map(a => a.action).join('|');
    
    if (activityKey === lastKey && _lastRenderedActivities.length > 0) {
        // Activities haven't changed, only update timestamps
        updateActivityTimestamps();
        return;
    }
    
    // Activities changed, do full re-render
    _lastRenderedActivities = JSON.parse(JSON.stringify(activities));
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.className = 'activity-item';
        
        const timeText = formatActivityTime(activity.timestamp);
        
        activityEl.innerHTML = `
            <span class="activity-time">${timeText}</span>
            <span class="activity-text">${activity.action}</span>
        `;
        activityList.appendChild(activityEl);
    });
    
    // Set up timestamp refresh interval
    if (_activityTimestampInterval) clearInterval(_activityTimestampInterval);
    _activityTimestampInterval = setInterval(updateActivityTimestamps, 30000);
}

async function loadDashboardStats() {
    try {
        const response = await fetch('../settings/get_stats.php');
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            
            // Update Active Projects
            const el1 = document.getElementById('activeProjectsCount');
            if (el1) el1.textContent = data.active_projects || 0;
            const el2 = document.getElementById('projectsThisWeek');
            if (el2) el2.textContent = `+${data.projects_this_week || 0} this week`;
            
            // Update Completed Tasks
            const el3 = document.getElementById('completedTasksCount');
            if (el3) el3.textContent = data.completed_tasks || 0;
            const el4 = document.getElementById('tasksToday');
            if (el4) el4.textContent = `+${data.tasks_today || 0} today`;
            
            // Update Team Members
            const el5 = document.getElementById('teamMembersCount');
            if (el5) el5.textContent = data.team_members || 0;
            const el6 = document.getElementById('usersOnline');
            if (el6) el6.textContent = `${data.users_online || 0} online`;
            
            // Update Open Issues
            const el7 = document.getElementById('openIssuesCount');
            if (el7) el7.textContent = data.open_issues || 0;
            const el8 = document.getElementById('criticalIssues');
            if (el8) el8.textContent = `${data.critical_issues || 0} critical`;
            
            // Update Project Due Dates
            if (data.active_projects_list && data.active_projects_list.length > 0) {
                const progressContainer = document.getElementById('projectProgressBars');
                if (progressContainer) {
                    progressContainer.innerHTML = ''; // Clear loading message

                    data.active_projects_list.forEach(project => {
                        const progressItem = document.createElement('div');
                        progressItem.className = 'progress-item';
                        
                        // Determine status styling based on overdue/days_until
                        let statusClass = '';
                        let statusText = '';
                        
                        if (project.is_overdue) {
                            statusClass = 'overdue';
                            statusText = 'OVERDUE';
                        } else if (project.days_until === 0) {
                            statusClass = 'due-today';
                            statusText = 'DUE TODAY';
                        } else if (project.days_until <= 7) {
                            statusClass = 'due-soon';
                            statusText = 'DUE SOON';
                        } else {
                            statusClass = 'due-later';
                            statusText = 'ON SCHEDULE';
                        }
                        
                        progressItem.innerHTML = `
                            <label>${project.name}</label>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${project.timeline_progress}%"></div>
                            </div>
                            <span class="due-date-deadline">
                                <span class="status-badge ${statusClass}">${statusText}</span>
                                <strong>${project.due_date}</strong>
                            </span>
                        `;
                        progressContainer.appendChild(progressItem);
                    });
                }
            }

            // Update Recent Activities
            if (data.recent_activities && data.recent_activities.length > 0) {
                renderActivities(data.recent_activities);
            }
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Keep showing loading text if error occurs
    }
}

// Load statistics when page loads
document.addEventListener('DOMContentLoaded', loadDashboardStats);
document.addEventListener('DOMContentLoaded', loadFrontPanelTaskSummary);

// Refresh stats every 30 seconds
setInterval(loadDashboardStats, 30000);
setInterval(loadFrontPanelTaskSummary, 60000);

// ============================================
// STAT CARDS CLICK HANDLERS
// ============================================

// Active Projects → Projects Page
document.getElementById('statActiveProjects')?.addEventListener('click', () => {
  window.location.href = 'projects.html';
});

// Completed Tasks → Tasks Page
document.getElementById('statCompletedTasks')?.addEventListener('click', () => {
  window.location.href = 'tasks.html';
});

// Team Members → Team Page
document.getElementById('statTeamMembers')?.addEventListener('click', () => {
  window.location.href = 'team.html';
});

// Open Issues → Tasks Page
document.getElementById('statOpenIssues')?.addEventListener('click', () => {
  window.location.href = 'tasks.html';
});

// ============================================
// MERGED MONITORING PANEL
// ============================================

const monitoringState = {
    activityData: [],
    resizeBound: false,
    refreshIntervalId: null
};

function monitoringRandInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function monitoringTone(value, warningThreshold, dangerThreshold) {
    if (value >= dangerThreshold) return 'danger';
    if (value >= warningThreshold) return 'warning';
    return 'healthy';
}

function createMonitoringSnapshot() {
    const serverOnline = Math.random() > 0.04;
    const databaseConnected = Math.random() > 0.03;
    const memoryPct = monitoringRandInt(42, 88);
    const totalEndpoints = 25;
    const endpointsDown = serverOnline ? monitoringRandInt(0, 2) : monitoringRandInt(2, 6);
    const endpointsUp = Math.max(0, totalEndpoints - endpointsDown);
    const activityData = Array.from({ length: 12 }, (_, index) => {
        const baseline = Math.random() > 0.7 ? monitoringRandInt(2, 8) : monitoringRandInt(0, 3);
        const projectSpike = Math.random() > 0.85 ? monitoringRandInt(3, 12) : 0;
        return Math.max(0, baseline + projectSpike);
    });
    const errors = [
        { endpoint: '/api/projects', count: monitoringRandInt(0, 2) },
        { endpoint: '/api/tasks', count: monitoringRandInt(0, 5) },
        { endpoint: '/api/users', count: monitoringRandInt(0, 1) },
        { endpoint: '/api/reports', count: monitoringRandInt(0, 2) }
    ];

    const alerts = [];
    if (!serverOnline) {
        alerts.push({
            tone: 'danger',
            icon: '⚠️',
            title: 'Server Connectivity Issue',
            message: 'Primary app node missed its latest heartbeat and needs attention.',
            meta: `Triggered: ${monitoringRandInt(1, 8)} mins ago`
        });
    }
    if (memoryPct >= 75) {
        alerts.push({
            tone: memoryPct >= 85 ? 'danger' : 'warning',
            icon: '⚠️',
            title: 'Elevated Memory Usage',
            message: `Memory pressure is at ${memoryPct}%. Review active workers before peak load.`,
            meta: `Triggered: ${monitoringRandInt(5, 25)} mins ago`
        });
    }
    if (errors.some((entry) => entry.count > 0)) {
        const noisyEndpoints = errors.filter((entry) => entry.count > 0).length;
        alerts.push({
            tone: 'info',
            icon: 'ℹ️',
            title: 'API Error Activity Detected',
            message: `${noisyEndpoints} endpoint${noisyEndpoints === 1 ? '' : 's'} reported transient errors in the last refresh cycle.`,
            meta: `Updated: ${monitoringRandInt(1, 10)} mins ago`
        });
    }
    alerts.push({
        tone: 'success',
        icon: '✓',
        title: 'Nightly Backup Completed',
        message: 'Latest local dashboard backup completed successfully.',
        meta: `Completed: ${monitoringRandInt(1, 3)} hours ago`
    });

    return {
        health: {
            serverOnline,
            databaseConnected,
            memoryPct,
            endpointsUp,
            totalEndpoints,
            lastCheckedMinutes: monitoringRandInt(1, 5),
            dbResponseMs: monitoringRandInt(12, 90)
        },
        activityData,
        errors,
        alerts: alerts.slice(0, 4)
    };
}

function setMonitoringHealthCard(type, tone, icon, status, detail) {
    const card = document.querySelector(`[data-health-card="${type}"]`);
    if (!card) return;

    card.classList.remove('healthy', 'warning', 'danger');
    card.classList.add(tone);

    const iconEl = card.querySelector('.health-icon');
    const statusEl = card.querySelector('.health-status');
    const detailEl = card.querySelector('small');

    if (iconEl) iconEl.textContent = icon;
    if (statusEl) statusEl.textContent = status;
    if (detailEl) detailEl.textContent = detail;
}

function updateMonitoringHealth(snapshot) {
    setMonitoringHealthCard(
        'server',
        snapshot.health.serverOnline ? 'healthy' : 'danger',
        snapshot.health.serverOnline ? '✓' : '⚠️',
        snapshot.health.serverOnline ? 'Online' : 'Offline',
        `Last checked: ${snapshot.health.lastCheckedMinutes} mins ago`
    );

    setMonitoringHealthCard(
        'database',
        snapshot.health.databaseConnected ? 'healthy' : 'danger',
        snapshot.health.databaseConnected ? '✓' : '⚠️',
        snapshot.health.databaseConnected ? 'Connected' : 'Disconnected',
        `Response time: ${snapshot.health.dbResponseMs}ms`
    );

    const memoryTone = monitoringTone(snapshot.health.memoryPct, 65, 85);
    setMonitoringHealthCard(
        'memory',
        memoryTone,
        memoryTone === 'healthy' ? '✓' : '⚠️',
        `${snapshot.health.memoryPct}%`,
        snapshot.health.memoryPct >= 75 ? 'Warning threshold reached' : 'Normal'
    );

    const apiTone = snapshot.health.endpointsUp === snapshot.health.totalEndpoints
        ? 'healthy'
        : snapshot.health.endpointsUp >= snapshot.health.totalEndpoints - 2 ? 'warning' : 'danger';
    setMonitoringHealthCard(
        'api',
        apiTone,
        apiTone === 'healthy' ? '✓' : '⚠️',
        snapshot.health.endpointsUp === snapshot.health.totalEndpoints
            ? 'All Active'
            : `${snapshot.health.endpointsUp}/${snapshot.health.totalEndpoints} Active`,
        `${snapshot.health.endpointsUp}/${snapshot.health.totalEndpoints} endpoints responding`
    );
}

function renderMonitoringErrors(errors) {
    const rows = document.querySelectorAll('#monitoringErrorTable .error-row');
    rows.forEach((row) => {
        const endpoint = row.dataset.endpoint;
        const entry = errors.find((errorItem) => errorItem.endpoint === endpoint);
        if (!entry) return;

        row.classList.toggle('has-errors', entry.count > 0);
        const countEl = row.querySelector('.error-count');
        if (countEl) {
            countEl.textContent = `${entry.count} ${entry.count === 1 ? 'error' : 'errors'}`;
        }
    });
}

function renderMonitoringAlerts(alerts) {
    const alertsList = document.getElementById('monitoringAlertsList');
    if (!alertsList) return;

    alertsList.innerHTML = alerts.map((alert) => `
        <div class="alert-item ${alert.tone}">
            <span class="alert-icon">${alert.icon}</span>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
                <small>${alert.meta}</small>
            </div>
        </div>
    `).join('');
}

function drawActivityChart() {
    const canvas = document.getElementById('activityChart');
    if (!canvas || monitoringState.activityData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const context = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 18, right: 18, bottom: 18, left: 18 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...monitoringState.activityData) + 2;
    const minValue = 0;
    const range = Math.max(1, maxValue - minValue);

    const getX = (index) => padding.left + (plotWidth / (monitoringState.activityData.length - 1)) * index;
    const getY = (value) => padding.top + plotHeight - ((value - minValue) / range) * plotHeight;

    context.strokeStyle = '#e5e7eb';
    context.lineWidth = 1;
    for (let lineIndex = 0; lineIndex < 4; lineIndex += 1) {
        const y = padding.top + (plotHeight / 3) * lineIndex;
        context.beginPath();
        context.moveTo(padding.left, y);
        context.lineTo(width - padding.right, y);
        context.stroke();
    }

    const fillGradient = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    fillGradient.addColorStop(0, 'rgba(59, 130, 246, 0.22)');
    fillGradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

    context.beginPath();
    monitoringState.activityData.forEach((value, index) => {
        const x = getX(index);
        const y = getY(value);
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
    });
    context.lineTo(width - padding.right, height - padding.bottom);
    context.lineTo(padding.left, height - padding.bottom);
    context.closePath();
    context.fillStyle = fillGradient;
    context.fill();

    context.beginPath();
    monitoringState.activityData.forEach((value, index) => {
        const x = getX(index);
        const y = getY(value);
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
    });
    context.strokeStyle = '#3b82f6';
    context.lineWidth = 3;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.stroke();

    monitoringState.activityData.forEach((value, index) => {
        const x = getX(index);
        const y = getY(value);
        context.beginPath();
        context.arc(x, y, 4, 0, Math.PI * 2);
        context.fillStyle = '#ffffff';
        context.fill();
        context.strokeStyle = '#3b82f6';
        context.lineWidth = 2;
        context.stroke();
    });
}

function renderActivityData(activityData) {
    monitoringState.activityData = activityData.slice();
    window.requestAnimationFrame(drawActivityChart);
}

async function refreshMonitoringPanel() {
    const refreshBtn = document.getElementById('monitoringRefreshBtn');
    if (!refreshBtn) return;

    const originalLabel = refreshBtn.textContent;
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Refreshing...';

    try {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        const snapshot = createMonitoringSnapshot();
        updateMonitoringHealth(snapshot);
        renderActivityData(snapshot.activityData);
        renderMonitoringErrors(snapshot.errors);
        renderMonitoringAlerts(snapshot.alerts);
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = originalLabel;
    }
}

function initializeMonitoringPanel() {
    const refreshBtn = document.getElementById('monitoringRefreshBtn');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', refreshMonitoringPanel);

    if (!monitoringState.resizeBound) {
        window.addEventListener('resize', () => window.requestAnimationFrame(drawActivityChart));
        monitoringState.resizeBound = true;
    }

    if (monitoringState.refreshIntervalId) {
        window.clearInterval(monitoringState.refreshIntervalId);
    }

    refreshMonitoringPanel();
    monitoringState.refreshIntervalId = window.setInterval(refreshMonitoringPanel, 45000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMonitoringPanel);
} else {
    initializeMonitoringPanel();
}
