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
    if (!modal || !btn) return;

    const closeBtn = modal.querySelector(`.${closeBtnClass}`);
    const cancelBtn = modal.querySelector(`.${cancelBtnClass}`);
    const form = document.getElementById(formId);

    // Open modal
    btn.addEventListener('click', () => {
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

async function submitForm(formData, endpoint, submitBtn, successMessage, closeModal, formEl = null) {
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
            setTimeout(() => location.reload(), 500);
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
                form
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
// LOAD REAL-TIME STATISTICS FROM DATABASE
// ============================================

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
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Keep showing loading text if error occurs
    }
}

// Load statistics when page loads
document.addEventListener('DOMContentLoaded', loadDashboardStats);

// Refresh stats every 30 seconds
setInterval(loadDashboardStats, 30000);
