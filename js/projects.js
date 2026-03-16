/**
 * Projects Page JavaScript
 * Loads and displays projects from database
 */

// Load projects when page loads
document.addEventListener('DOMContentLoaded', loadProjects);

async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    try {
        const response = await fetch('../settings/get_projects.php');
        const result = await response.json();
        
        if (result.success && result.projects && result.projects.length > 0) {
            projectsGrid.innerHTML = ''; // Clear loading message
            
            result.projects.forEach(project => {
                const projectCard = createProjectCard(project);
                projectsGrid.appendChild(projectCard);
            });
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
            <span class="team-badge">${teamBadge}</span>
            <span class="date">Due: ${project.end_date}</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${project.progress}%"></div>
        </div>
        <div class="project-footer">
            <span class="progress-text">${project.progress}% Complete</span>
            <div class="project-actions">
                <button class="btn-icon" onclick="editProject('${project.id}', '${escapeHtml(project.name)}')" title="Edit">✏️</button>
                <button class="btn-icon" onclick="viewProject('${project.id}', '${escapeHtml(project.name)}')" title="View">👁️</button>
                <button class="btn-icon" onclick="deleteProject('${project.id}')" title="Delete">🗑️</button>
            </div>
        </div>
    `;
    
    return card;
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
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function editProject(id, name) {
    // Open edit modal and populate fields
    const editModal = document.getElementById('editProjectModal');
    const form = document.getElementById('editProjectForm');
    if (!editModal || !form) {
        alert('Edit modal not found');
        return;
    }

    // reset form
    form.reset();
    document.getElementById('editProjectId').value = '';

    // Show modal
    editModal.style.display = 'block';

    // Fetch project details (reuse get_project.php)
    let url = '../settings/get_project.php';
    if (id && id !== 'null') url += '?id=' + encodeURIComponent(id);
    else if (name) url += '?name=' + encodeURIComponent(name);
    else {
        alert('No project identifier available');
        return;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.success) throw new Error(data.message || 'Failed to load project');
            const p = data.project;
            document.getElementById('editProjectId').value = p.id || '';
            document.getElementById('editProjectName').value = p.name || '';
            document.getElementById('editProjectDescription').value = p.description || '';
            // attempt to convert readable date to yyyy-mm-dd if possible
            function toISO(d) {
                if (!d) return '';
                const dt = new Date(d);
                if (isNaN(dt)) return '';
                return dt.toISOString().split('T')[0];
            }
            document.getElementById('editProjectStartDate').value = toISO(p.start_date);
            document.getElementById('editProjectEndDate').value = toISO(p.end_date);
            document.getElementById('editProjectStatus').value = p.status || 'active';
            document.getElementById('editProjectProgress').value = p.progress || 0;
            document.getElementById('editProjectBudget').value = p.budget || '';
            document.getElementById('editProjectSpent').value = p.spent || '';
        })
        .catch(err => {
            console.error('Error loading project for edit:', err);
            alert('Failed to load project for editing');
            editModal.style.display = 'none';
        });
}

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
            const p = data.project;
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

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        // Call delete API
        deleteProjectFromDatabase(id);
    }
}

async function deleteProjectFromDatabase(projectId) {
    try {
        const formData = new FormData();
        formData.append('project_id', projectId);
        
        const response = await fetch('../settings/delete_project.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Project deleted successfully!');
            // Reload projects to reflect the change
            loadProjects();
        } else {
            alert('❌ Error: ' + (result.message || 'Failed to delete project'));
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('❌ An error occurred while deleting the project');
    }
}

// Search filter
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterProjects(searchTerm);
    });
}

function filterProjects(searchTerm) {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const projectName = card.querySelector('h3').textContent.toLowerCase();
        const projectDesc = card.querySelector('.project-desc').textContent.toLowerCase();
        
        if (projectName.includes(searchTerm) || projectDesc.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Status filter
const statusFilter = document.querySelectorAll('.filter-select')[0];
if (statusFilter) {
    statusFilter.addEventListener('change', () => {
        loadProjects(); // Reload projects (could be enhanced with client-side filtering)
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
            
            const response = await fetch('../settings/create_project.php', {
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

// Edit modal close handlers and submit
const editModal = document.getElementById('editProjectModal');
const editCloseBtns = document.querySelectorAll('.edit-close');
if (editCloseBtns && editModal) {
    editCloseBtns.forEach(b => b.addEventListener('click', () => {
        editModal.style.display = 'none';
        const ef = document.getElementById('editProjectForm');
        if (ef) ef.reset();
    }));
}

window.addEventListener('click', (e) => {
    if (editModal && e.target === editModal) {
        editModal.style.display = 'none';
        const ef = document.getElementById('editProjectForm');
        if (ef) ef.reset();
    }
});

const editForm = document.getElementById('editProjectForm');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = editForm.querySelector('button[type="submit"]');
        const orig = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            const fd = new FormData(editForm);
            const resp = await fetch('../settings/update_project.php', {
                method: 'POST',
                body: fd
            });
            const data = await resp.json();
            if (data.success) {
                alert('✅ Project updated successfully!');
                editModal.style.display = 'none';
                editForm.reset();
                loadProjects();
            } else {
                alert('❌ Error: ' + (data.message || 'Failed to update project'));
            }
        } catch (err) {
            console.error('Error updating project:', err);
            alert('❌ An error occurred while updating the project');
        } finally {
            submitBtn.textContent = orig;
            submitBtn.disabled = false;
        }
    });
}
