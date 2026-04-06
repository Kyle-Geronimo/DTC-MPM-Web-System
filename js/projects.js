/**
 * Projects Page JavaScript
 * Loads and displays projects from database
 */

// Load projects when page loads
document.addEventListener('DOMContentLoaded', loadProjects);

// In-memory store + filter state
let allProjects = [];
let currentStatusFilter = '';
let currentSearchTerm = '';
let lastViewedProject = null;

async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    try {
        const response = await fetch('../settings/get_projects.php');
        const result = await response.json();
        
        if (result.success && result.projects && result.projects.length > 0) {
            // store and render with client-side filters
            allProjects = result.projects;
            renderProjects(allProjects);
        } else {
            projectsGrid.innerHTML = '<div class="no-projects">No projects found. Create your first project!</div>';
        }
    } catch (error) {
        /**
         * Projects Page JavaScript
         * Loads and displays projects from database
         */
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = '<div class="error-message">Failed to load projects. Please refresh the page.</div>';
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Determine status class
    const statusClass = project.status.toLowerCase().replace(' ', '-');
    
    // Format status text
    const statusText = project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ');
    
    // Determine team badge (could be enhanced with real team data)
    const teamBadge = getTeamBadge(project.name);
    
    card.innerHTML = `
        <div class="project-header">
            <h3>${escapeHtml(project.name)}</h3>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <p class="project-desc">${escapeHtml(project.description || 'No description provided')}</p>
        <div class="project-meta">
            <span class="date">Due: ${project.end_date}</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${project.progress}%"></div>
        </div>
        <div class="project-footer">
            <span class="progress-text">${project.progress}% Complete</span>
                <div class="project-actions">
                <button class="btn-icon" onclick="viewProject('${project.id}', '${escapeHtml(project.name)}')" title="View">👁️</button>
                <button class="btn-icon" onclick="editProject('${project.id}')" title="Edit">✏️</button>
                <button class="btn-icon" onclick="deleteProject('${project.id}')" title="Delete">🗑️</button>
            </div>
        </div>
    `;
    
    return card;
}

// Edit project from the card (opens the New Project modal prefilled)
async function editProject(id) {
    try {
        console.log('editProject called with id:', id);
        // try to find project in in-memory store for fallback
        const cached = allProjects.find(p => String(p.id) === String(id));

        // fetch project details by id
        const res = await fetch('../settings/get_project.php?id=' + encodeURIComponent(id));
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch (e) { console.error('Non-JSON response from get_project:', text); alert('Server error fetching project'); return; }

        if (!data.success) {
            console.warn('get_project by id failed:', data.message);
            // fallback: try fetching by name if we have it cached
            if (cached && cached.name) {
                console.log('Attempting fallback fetch by name:', cached.name);
                const res2 = await fetch('../settings/get_project.php?name=' + encodeURIComponent(cached.name));
                const data2 = await res2.json();
                if (!data2.success) {
                    alert(data2.message || 'Failed to load project for editing');
                    return;
                }
                data = data2;
            } else {
                alert(data.message || 'Failed to load project for editing');
                return;
            }
        }

        const p = data.project || {};
        const normalizedId = p.id || p.project_id || p.projectId || p.ID || p.projectID || '';
        p.id = normalizedId;
        lastViewedProject = p;

        // Prefill new project form
        const projectIdInput = document.getElementById('projectId');
        document.getElementById('projectName').value = p.name || '';
        document.getElementById('projectDescription').value = p.description || '';
        document.getElementById('projectStartDate').value = p.start_date || '';
        document.getElementById('projectEndDate').value = p.end_date || '';
        document.getElementById('projectStatus').value = (p.status || 'active');
        document.getElementById('projectProgress').value = p.progress || 0;
        if (projectIdInput) projectIdInput.value = normalizedId;

        // show edit modal and ensure view modal is hidden
        const viewModalEl = document.getElementById('viewProjectModal');
        if (viewModalEl) viewModalEl.style.display = 'none';
        const modal = document.getElementById('newProjectModal');
        if (modal) modal.style.display = 'block';
    } catch (err) {
        console.error('Error loading project for edit:', err);
        alert('Error loading project for edit');
    }
}

function getTeamBadge(projectName) {
    // Simple logic to determine team based on project name
    const name = projectName.toLowerCase();
    
    if (name.includes('mobile') || name.includes('app') || name.includes('ios') || name.includes('android')) {
        return 'Mobile';
    } else if (name.includes('api') || name.includes('backend') || name.includes('database') || name.includes('migration')) {
        return 'Backend';
    } else if (name.includes('website') || name.includes('ui') || name.includes('ux') || name.includes('frontend')) {
        return 'Frontend';
    } else if (name.includes('security') || name.includes('audit')) {
        return 'Security';
    } else if (name.includes('test') || name.includes('qa')) {
        return 'QA Team';
    }
    
    return 'General';
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}

// editProject removed — edit action not available in Projects UI per request

function viewProject(id, name) {
    // Open view modal and fetch project details
    const viewModal = document.getElementById('viewProjectModal');
    if (!viewModal) {
        alert('View modal not found');
        return;
    }

    // show loading state
    document.getElementById('viewProjectName').textContent = 'Loading...';
    document.getElementById('viewProjectDescription').textContent = '';
    document.getElementById('viewStartDate').textContent = '-';
    document.getElementById('viewEndDate').textContent = '-';
    document.getElementById('viewProgress').textContent = '0%';
    document.getElementById('viewBudget').textContent = '-';
    document.getElementById('viewSpent').textContent = '-';

            viewModal.style.display = 'block';
            // When opened via the Projects page card 'View' button, remove the Edit button(s)
            const modalEditBtns = viewModal.querySelectorAll('.edit-project-btn');
            if (modalEditBtns && modalEditBtns.length) {
                modalEditBtns.forEach(b => b.remove());
            }

    // fetch project details (by id preferred, otherwise by name)
    let url = '../settings/get_project.php';
    if (id && id !== 'null') {
        url += '?id=' + encodeURIComponent(id);
    } else if (name) {
        url += '?name=' + encodeURIComponent(name);
    } else {
        document.getElementById('viewProjectName').textContent = 'Project id not available';
        return;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.success) throw new Error(data.message || 'Failed to load project');
                const p = data.project || {};
                // Normalize ID keys so edit flow always has an `id` property
                const normalizedId = p.id || p.project_id || p.projectId || p.ID || p.projectID || '';
                p.id = normalizedId;
                lastViewedProject = p;
            document.getElementById('viewProjectName').textContent = p.name || '-';
            document.getElementById('viewProjectDescription').textContent = p.description || 'No description provided';
            document.getElementById('viewStartDate').textContent = p.start_date || '-';
            document.getElementById('viewEndDate').textContent = p.end_date || '-';
            document.getElementById('viewProgress').textContent = (p.progress !== undefined ? p.progress + '%' : '0%');
            document.getElementById('viewBudget').textContent = p.budget || '-';
            document.getElementById('viewSpent').textContent = p.spent || '-';

            // status badge
            const statusEl = document.getElementById('viewProjectStatus');
            statusEl.textContent = p.status ? (p.status.charAt(0).toUpperCase() + p.status.slice(1)) : '';
            statusEl.className = 'status-badge ' + (p.status ? p.status.toLowerCase().replace(' ', '-') : '');
        })
        .catch(err => {
            console.error('Error fetching project:', err);
            document.getElementById('viewProjectName').textContent = 'Error loading project';
            document.getElementById('viewProjectDescription').textContent = '';
        });
}

// Open edit form prefilled from lastViewedProject
const editBtn = document.querySelector('.edit-project-btn');
if (editBtn) {
    editBtn.addEventListener('click', () => {
        if (!lastViewedProject) return alert('Project data not loaded yet');

        // Prefill new project form
        const modal = document.getElementById('newProjectModal');
        const projectIdInput = document.getElementById('projectId');
        document.getElementById('projectName').value = lastViewedProject.name || '';
        document.getElementById('projectDescription').value = lastViewedProject.description || '';
        document.getElementById('projectStartDate').value = lastViewedProject.start_date || '';
        document.getElementById('projectEndDate').value = lastViewedProject.end_date || '';
        document.getElementById('projectStatus').value = (lastViewedProject.status || 'active');
        document.getElementById('projectProgress').value = lastViewedProject.progress || 0;
        // Support multiple possible id keys when prefilling
        const resolvedId = lastViewedProject.id || lastViewedProject.project_id || lastViewedProject.projectId || lastViewedProject.ID || lastViewedProject.projectID || '';
        if (projectIdInput) projectIdInput.value = resolvedId;

        // show edit modal and hide view modal
        const viewModalEl = document.getElementById('viewProjectModal');
        if (viewModalEl) viewModalEl.style.display = 'none';
        if (modal) modal.style.display = 'block';
    });
}

function deleteProject(id) {
    // Inline confirmation modal for project deletion on public Projects page
    const existing = document.getElementById('deleteProjectModal'); if (existing) existing.remove();
    const modal = document.createElement('div'); modal.id = 'deleteProjectModal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;`;
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:28px;max-width:480px;width:92%;box-shadow:0 8px 32px rgba(0,0,0,.25);text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🗑️</div>
            <h3 style="margin:0 0 8px;color:#1e293b;font-size:18px;">Delete Project</h3>
            <p style="color:#64748b;margin:0 0 20px;font-size:14px;">Are you sure you want to delete this project? This will mark the project as deleted.</p>
            <div style="display:flex;gap:12px;justify-content:center;">
                <button id="cancelDeleteProjectBtn" style="padding:10px 24px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#374151;cursor:pointer;font-size:14px;">Cancel</button>
                <button id="confirmDeleteProjectBtn" style="padding:10px 24px;border-radius:8px;border:none;background:#ef4444;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">Yes, Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelDeleteProjectBtn').onclick = () => modal.remove();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    document.getElementById('confirmDeleteProjectBtn').onclick = async () => {
        modal.remove();
        await deleteProjectFromDatabase(id);
    };
}

async function deleteProjectFromDatabase(projectId) {
    try {
        const formData = new FormData();
        formData.append('project_id', projectId);
        
        const response = await fetch('../settings/delete_project.php', {
            method: 'POST',
            body: formData
        });
        const text = await response.text();
        let result;
        try { result = JSON.parse(text); } catch {
            console.error('Non-JSON response from delete_project.php:', text);
            alert('❌ Server error. See console.');
            return;
        }

        if (result.success) {
            if (typeof Toast !== 'undefined') Toast.success(result.message || 'Project deleted successfully!');
            else alert('✅ Project deleted successfully!');
            loadProjects();
        } else {
            if (typeof Toast !== 'undefined') Toast.error(result.message || 'Failed to delete project');
            else alert('❌ Error: ' + (result.message || 'Failed to delete project'));
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        if (typeof Toast !== 'undefined') Toast.error('An error occurred while deleting the project');
        else alert('❌ An error occurred while deleting the project');
    }
}

// Render projects applying current filters
function renderProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = '';

    const filtered = projects.filter(p => {
        if (currentStatusFilter) {
            const status = (p.status || '').toLowerCase();
            if (status !== currentStatusFilter) return false;
        }

        if (currentSearchTerm) {
            const name = (p.name || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            if (!name.includes(currentSearchTerm) && !desc.includes(currentSearchTerm)) return false;
        }

        return true;
    });

    if (filtered.length === 0) {
        projectsGrid.innerHTML = '<div class="no-projects">No projects match your filters.</div>';
        return;
    }

    filtered.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
}

// Search filter
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = (e.target.value || '').trim().toLowerCase();
        renderProjects(allProjects);
    });
}

// Status filter
const statusFilter = document.querySelectorAll('.filter-select')[0];
if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
        currentStatusFilter = e.target.value ? e.target.value.toLowerCase() : '';
        renderProjects(allProjects);
    });
}

// ===== NEW PROJECT MODAL FUNCTIONALITY =====

// Get modal elements
const newProjectBtn = document.querySelector('.btn-primary');
const modal = document.getElementById('newProjectModal');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.querySelector('.cancel-btn');
const projectForm = document.getElementById('newProjectForm');

// Open modal when "+ New Project" button is clicked
if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        // Set default start date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('projectStartDate').value = today;
    });
}

// Close modal when X is clicked
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        projectForm.reset();
    });
}

// Close modal when Cancel is clicked
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        projectForm.reset();
    });
}

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        projectForm.reset();
    }
});

// Handle form submission
if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = projectForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating...';
        submitBtn.disabled = true;
        
        try {
                const formData = new FormData(projectForm);
                const projectIdVal = formData.get('project_id');
                const submitUrl = projectIdVal ? '../settings/update_project.php' : '../settings/create_project.php';
                // If editing, ensure the API receives `id` field (update_project.php expects `id`)
                if (projectIdVal) {
                    formData.set('id', projectIdVal);
                }

                const response = await fetch(submitUrl, {
                    method: 'POST',
                    body: formData
                });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Project created successfully!');
                modal.style.display = 'none';
                projectForm.reset();
                // Reload projects to show the new one
                loadProjects();
            } else {
                alert('❌ Error: ' + (result.message || 'Failed to create project'));
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('❌ An error occurred while creating the project');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// View modal close handlers
const viewModal = document.getElementById('viewProjectModal');
const viewCloseBtns = document.querySelectorAll('.view-close');
if (viewCloseBtns && viewModal) {
    viewCloseBtns.forEach(b => b.addEventListener('click', () => {
        viewModal.style.display = 'none';
    }));
}

window.addEventListener('click', (e) => {
    if (viewModal && e.target === viewModal) {
        viewModal.style.display = 'none';
    }
});

// Edit modal handlers removed — edit UI disabled
