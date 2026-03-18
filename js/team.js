/**
 * Team Page JavaScript
 * Handles team member management and loading states
 */

// Loading state utility functions
const LoadingState = {
    /**
     * Set button to loading state
     * @param {HTMLButtonElement} button - The button element
     * @param {string} loadingText - Text to display while loading (default: "Loading...")
     */
    start: function(button, loadingText = 'Loading...') {
        if (!button) return;
        
        // Store original text
        button.dataset.originalText = button.textContent;
        
        // Disable button and show loading state
        button.disabled = true;
        button.classList.add('loading');
        button.textContent = loadingText;
    },
    
    /**
     * Reset button from loading state
     * @param {HTMLButtonElement} button - The button element
     */
    end: function(button) {
        if (!button) return;
        
        // Restore original text
        const originalText = button.dataset.originalText || button.textContent;
        button.textContent = originalText;
        
        // Re-enable button and remove loading state
        button.disabled = false;
        button.classList.remove('loading');
        
        // Clean up data attribute
        delete button.dataset.originalText;
    },
    
    /**
     * Set button to error state temporarily
     * @param {HTMLButtonElement} button - The button element
     * @param {string} errorText - Error message to display
     * @param {number} duration - How long to show error (ms)
     */
    error: function(button, errorText = 'Error!', duration = 2000) {
        if (!button) return;
        
        const originalText = button.dataset.originalText || button.textContent;
        button.textContent = errorText;
        button.classList.add('error');
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('error');
            button.disabled = false;
            delete button.dataset.originalText;
        }, duration);
    },
    
    /**
     * Set button to success state temporarily
     * @param {HTMLButtonElement} button - The button element
     * @param {string} successText - Success message to display
     * @param {number} duration - How long to show success (ms)
     */
    success: function(button, successText = 'Success!', duration = 2000) {
        if (!button) return;
        
        const originalText = button.dataset.originalText || button.textContent;
        button.textContent = successText;
        button.classList.add('success');
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('success');
            button.disabled = false;
            delete button.dataset.originalText;
        }, duration);
    }
};

// Add utility functions
// Ensure escapeHtml is globally available for templates
// Define a global escapeHtml function (ensure both global identifier and window property)
function escapeHtml(str){
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
try { window.escapeHtml = window.escapeHtml || escapeHtml; } catch(e) {}

// Create Team functionality
function handleCreateTeam() {
    const openBtn = document.getElementById('openCreateTeam');
    const modal = document.getElementById('createTeamModal');
    const closeBtn = modal ? modal.querySelector('.close-create-team') : null;
    const cancelBtn = document.getElementById('cancelCreateTeam');
    const form = document.getElementById('createTeamForm');
    const teamLeadSelect = document.getElementById('teamLead');
    const membersList = document.getElementById('membersList');

    if (!openBtn || !modal || !form) return;

    // Close modal function
    const closeModal = () => { 
        modal.classList.remove('show'); 
        form.reset();
        // Reset edit mode
        form.removeAttribute('data-edit-mode');
        form.removeAttribute('data-team-id');
        // Reset modal header to default
        const modalHeader = modal.querySelector('.modal-header h2');
        modalHeader.textContent = '👥 Create New Team';
        // Reset submit button text
        document.getElementById('submitCreateTeam').textContent = 'Create Team';
    };

    // Open modal and load users
    openBtn.addEventListener('click', async () => {
        modal.classList.add('show');
        await loadUsersForTeam(teamLeadSelect, membersList);
    });

    // Close button listeners
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }

    // Close modal when clicking outside of modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitCreateTeam');
        
        // Check if in edit mode
        const isEditMode = form.getAttribute('data-edit-mode') === 'true';
        const teamId = form.getAttribute('data-team-id');
        
        // Update button text based on mode
        const originalText = submitBtn.textContent;
        LoadingState.start(submitBtn, isEditMode ? 'Updating...' : 'Creating...');
        
        try {
            // Get selected members
            const selectedMembers = Array.from(document.querySelectorAll('.member-checkbox:checked'))
                .map(checkbox => checkbox.value);
            
            const fd = new FormData(form);
            fd.append('members', JSON.stringify(selectedMembers));
            
            // Add team ID if in edit mode
            if (isEditMode) {
                fd.append('id', teamId);
            }
            
            // Choose the appropriate endpoint based on mode
            const endpoint = isEditMode ? '../settings/update_team.php' : '../settings/add_team.php';
            
            const res = await fetch(endpoint, {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            
            if (data && data.success) {
                LoadingState.success(submitBtn, isEditMode ? 'Updated!' : 'Created!');
                // Reset form state
                form.removeAttribute('data-edit-mode');
                form.removeAttribute('data-team-id');
                // Change button text back to Create
                submitBtn.textContent = 'Create Team';
                // Refresh teams UI and close modal
                await loadTeams();
                setTimeout(closeModal, 400);
            } else {
                LoadingState.error(submitBtn, data.message || 'Failed');
                console.error('Team operation error:', data);
            }
        } catch (err) {
            LoadingState.error(submitBtn, 'Error');
            console.error('Error submitting form:', err);
        }
    });
}

// Load users for team lead dropdown and member selection
async function loadUsersForTeam(teamLeadSelect, membersList) {
    try {
        // Fetch all active users
        const usersRes = await fetch('../settings/get_all_users.php');
        const usersData = await usersRes.json();
        
        if (!usersData || !usersData.success) {
            console.error('Failed to load users');
            membersList.innerHTML = '<p>Failed to load members</p>';
            return;
        }

        const users = Array.isArray(usersData.users) ? usersData.users : [];
        
        // Populate team lead dropdown (single select)
        teamLeadSelect.innerHTML = '<option value="">Select a team lead...</option>';
        users.forEach(user => {
            const opt = document.createElement('option');
            opt.value = user.id;
            opt.textContent = user.full_name || user.username || 'Unknown';
            teamLeadSelect.appendChild(opt);
        });

        // Populate members list with checkboxes
        if (users.length === 0) {
            membersList.innerHTML = '<p>No members available</p>';
            return;
        }

        membersList.innerHTML = '';
        users.forEach(user => {
            const label = document.createElement('label');
            label.className = 'member-checkbox-label';
            label.innerHTML = `
                <input type="checkbox" class="member-checkbox" value="${user.id}" name="members_${user.id}">
                <span class="checkbox-box"></span>
                <span class="member-name">${escapeHtml(user.full_name || user.username || 'Unknown')}</span>
            `;
            membersList.appendChild(label);
        });

    } catch (err) {
        console.error('Error loading users:', err);
        membersList.innerHTML = '<p>Error loading members</p>';
        teamLeadSelect.innerHTML = '<option value="">Error loading users</option>';
    }
}
try { window.escapeHtml = window.escapeHtml || escapeHtml; } catch(e) {}

function handleAddMember() {
    const openBtn = document.getElementById('openAddMember');
    const modal = document.getElementById('addMemberModal');
    const closeBtn = modal ? modal.querySelector('.close-add-member') : null;
    const cancelBtn = document.getElementById('cancelAddMember');
    const form = document.getElementById('addMemberForm');
    const teamSelect = document.getElementById('memberTeam');

    if (!openBtn || !modal || !form) return;

    // Open modal and populate teams
    openBtn.addEventListener('click', async () => {
        modal.style.display = 'block';
        // populate teams
        try {
            const res = await fetch('../settings/get_teams.php');
            const data = await res.json();
            if (data && data.success && Array.isArray(data.teams)) {
                // clear existing options except the first
                teamSelect.innerHTML = '<option value="">Unassigned</option>';
                data.teams.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t.id;
                    opt.textContent = t.name;
                    teamSelect.appendChild(opt);
                });
            }
        } catch (err) {
            console.error('Failed to load teams for select', err);
        }
    });

    const closeModal = () => { modal.style.display = 'none'; form.reset(); };
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitAddMember');
        LoadingState.start(submitBtn, 'Adding...');
        try {
            const fd = new FormData(form);
            const res = await fetch('../settings/add_member.php', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            if (data && data.success) {
                LoadingState.success(submitBtn, 'Added!');
                // refresh teams/members UI
                await loadTeams();
                setTimeout(closeModal, 400);
            } else {
                LoadingState.error(submitBtn, data.message || 'Failed');
                console.error('Add member error:', data);
            }
        } catch (err) {
            LoadingState.error(submitBtn, 'Error');
            console.error('Error submitting add member:', err);
        }
    });
}

// Message functionality
function handleMessageButtons() {
    const messageButtons = document.querySelectorAll('.btn-messages');
    
    messageButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const teamCard = this.closest('.teams');
            const teamName = teamCard.querySelector('h3').textContent;
            
            // Start loading state
            LoadingState.start(this, 'Opening...');
            
            try {
                // Simulate API call (replace with actual messaging API)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Show success
                LoadingState.success(this, 'Opened!');
                
                console.log(`Opening messages for team: ${teamName}`);
                
                // Here you would typically:
                // 1. Open a messages modal
                // 2. Load conversation history
                // 3. Enable sending messages to the team
                
            } catch (error) {
                // Show error
                LoadingState.error(this, 'Error');
                console.error('Error opening messages:', error);
            }
        });
    });
}

// Members functionality
function handleMemberButtons() {
    const memberButtons = document.querySelectorAll('.btn-members');
    
    memberButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const teamCard = this.closest('.teams');
            const teamName = teamCard.querySelector('h3').textContent;
            const teamId = teamCard.getAttribute('data-team-id');
            
            // Get or create members modal
            let modal = document.getElementById('membersModal');
            if (!modal) {
                // Create modal if it doesn't exist
                modal = document.createElement('div');
                modal.id = 'membersModal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>👥 Team Members</h2>
                            <span class="close-members-modal">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div id="membersList" class="members-list-display">
                                <p>Loading members...</p>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Add close functionality
                modal.querySelector('.close-members-modal').addEventListener('click', (e) => {
                    e.stopPropagation();
                    modal.classList.remove('show');
                });
                
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('show');
                    }
                });
            }
            
            // Start loading state
            LoadingState.start(this, 'Loading...');
            
            try {
                // Fetch team members
                const response = await fetch('../settings/get_team_members_by_id.php?team_id=' + encodeURIComponent(teamId));
                const data = await response.json();
                
                if (data.success) {
                    const membersList = modal.querySelector('#membersList');
                    const members = data.members || [];
                    
                    if (members.length === 0) {
                        membersList.innerHTML = '<p>No members in this team yet.</p>';
                    } else {
                        membersList.innerHTML = '';
                        members.forEach(member => {
                            const memberEl = document.createElement('div');
                            memberEl.className = 'member-item';
                            memberEl.innerHTML = `
                                <div class="member-info">
                                    <h4>${escapeHtml(member.full_name)}</h4>
                                    <p class="member-username">@${escapeHtml(member.username)}</p>
                                    <p class="member-email">${escapeHtml(member.email)}</p>
                                    <p class="member-role"><strong>Role:</strong> ${escapeHtml(member.role || 'N/A')}</p>
                                    <p class="member-joined"><strong>Joined:</strong> ${escapeHtml(member.joined_at.split(' ')[0])}</p>
                                </div>
                            `;
                            membersList.appendChild(memberEl);
                        });
                    }
                    
                    // Update modal title
                    modal.querySelector('.modal-header h2').textContent = `👥 ${escapeHtml(teamName)} Members`;
                    
                    // Show the modal
                    modal.classList.add('show');
                    
                    // Show success
                    LoadingState.success(this, 'Loaded!');
                } else {
                    LoadingState.error(this, 'Error');
                    console.error('Error loading members:', data.error);
                }
                
            } catch (error) {
                // Show error
                LoadingState.error(this, 'Error');
                console.error('Error loading team members:', error);
            }
        });
    });
}

// Edit team functionality
function handleEditButtons() {
    const editButtons = document.querySelectorAll('.btn-icon.edit');
    
    editButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const teamCard = this.closest('.teams');
            const teamId = teamCard.getAttribute('data-team-id');
            const teamName = teamCard.querySelector('h3').textContent;
            const teamPurpose = teamCard.querySelector('.team-purpose').textContent;
            const teamLeadElement = teamCard.querySelector('.team-lead');
            const teamLeadText = teamLeadElement ? teamLeadElement.textContent : '';
            
            // Get the modal elements
            const modal = document.getElementById('createTeamModal');
            const form = document.getElementById('createTeamForm');
            const teamNameInput = document.getElementById('teamName');
            const teamPurposeInput = document.getElementById('teamPurpose');
            const teamLeadSelect = document.getElementById('teamLead');
            
            if (!modal || !form) {
                console.error('Modal elements not found');
                return;
            }
            
            // Start loading state
            LoadingState.start(this, 'Opening...');
            
            try {
                // Load users for the dropdowns
                await loadUsersForTeam(teamLeadSelect, document.getElementById('membersList'));
                
                // Set form title to indicate edit mode
                const modalHeader = modal.querySelector('.modal-header h2');
                modalHeader.textContent = '✏️ Edit Team';
                
                // Pre-fill the form with team data
                teamNameInput.value = teamName;
                teamPurposeInput.value = teamPurpose;
                
                // Store the team ID in the form for later use
                form.setAttribute('data-team-id', teamId);
                form.setAttribute('data-edit-mode', 'true');
                
                // Parse team lead from text (format: "Lead: Name")
                const leadMatch = teamLeadText.match(/Lead:\s*(.+)/);
                if (leadMatch) {
                    const leadName = leadMatch[1].trim();
                    if (leadName !== 'Unassigned') {
                        // Find and select the matching option
                        for (let i = 0; i < teamLeadSelect.options.length; i++) {
                            if (teamLeadSelect.options[i].textContent === leadName) {
                                teamLeadSelect.value = teamLeadSelect.options[i].value;
                                break;
                            }
                        }
                    }
                }
                
                // Show the modal
                modal.classList.add('show');
                
                // Show success
                LoadingState.success(this, 'Ready!');
                
            } catch (error) {
                // Show error
                LoadingState.error(this, 'Error');
                console.error('Error opening edit form:', error);
            }
        });
    });
}

// Delete team functionality
function handleDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.btn-icon.delete');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const teamCard = this.closest('.teams');
            const teamName = teamCard.querySelector('h3').textContent;
            const teamId = teamCard.getAttribute('data-team-id');
            
            // Confirm deletion
            if (!confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`)) {
                return;
            }
            
            // Start loading state
            LoadingState.start(this, 'Deleting...');
            
            try {
                // Send delete request to backend
                const response = await fetch('../settings/delete_team.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'id=' + encodeURIComponent(teamId)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Show success
                    LoadingState.success(this, 'Deleted!');
                    
                    console.log(`Team deleted: ${teamName} (ID: ${teamId})`);
                    
                    // Remove card from DOM with animation
                    teamCard.style.opacity = '0';
                    teamCard.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        teamCard.remove();
                        
                        // Check if there are any teams left
                        const grid = document.querySelector('.team-grid');
                        if (grid.children.length === 0) {
                            grid.innerHTML = '<p>No teams found.</p>';
                        }
                    }, 300);
                } else {
                    LoadingState.error(this, 'Error');
                    console.error('Error deleting team:', data.error);
                }
                
            } catch (error) {
                // Show error
                LoadingState.error(this, 'Error');
                console.error('Error deleting team:', error);
            }
        });
    });
}

// Example: Disable all buttons during a batch operation
function disableAllButtons() {
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(btn => btn.disabled = true);
}

function enableAllButtons() {
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(btn => btn.disabled = false);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Team page loaded');
    
    // Load teams from server and initialize handlers
    loadTeams();
    // Initialize create team modal handler
    handleCreateTeam();
    // Load statistics
    loadTeamStats();
});

// Fetch and render teams from the backend
async function loadTeams() {
    const grid = document.querySelector('.team-grid');
    if (!grid) return;
    grid.innerHTML = '<p>Loading teams...</p>';
    try {
        const res = await fetch('../settings/get_teams.php');
        const data = await res.json();
        // Some environments may return teams even if success is not true (legacy). Prefer teams array if present.
        if ((!data || !data.teams) && !data.success) {
            grid.innerHTML = '<p>Failed to load teams</p>';
            console.error('No teams array in response', data);
            return;
        }

        const teams = Array.isArray(data.teams) ? data.teams : [];
        if (teams.length === 0) {
            grid.innerHTML = '<p>No teams found.</p>';
            return;
        }

        grid.innerHTML = '';
        teams.forEach(team => {
            try {
                const el = document.createElement('div');
                el.className = 'teams';
                el.setAttribute('data-team-id', team.id);
                
                // Display team lead name or "Unassigned"
                const teamLeadDisplay = team.team_lead_name || 'Unassigned';
                
                el.innerHTML = `
                    <div class="team-info">
                        <h3>${escapeHtml(team.name)}</h3>
                        <p class="team-purpose">${escapeHtml(team.description || '')}</p>
                        <p class="team-lead"><span class="team-lead-label">Lead:</span> ${escapeHtml(teamLeadDisplay)}</p>
                    </div>
                    <div class="team-actions">
                        <button class="btn-small btn-messages">Messages</button>
                        <button class="btn-small btn-members">Members</button>
                        <button class="btn-icon edit" title="Edit Team">✎</button>
                        <button class="btn-icon delete" title="Delete Team">🗑</button>
                    </div>
                `;
                grid.appendChild(el);
            } catch (innerErr) {
                console.error('Error rendering team item', team, innerErr);
            }
        });

        // Re-bind button handlers to new elements
        handleMessageButtons();
        handleMemberButtons();
        handleEditButtons();
        handleDeleteButtons();
    } catch (err) {
        grid.innerHTML = '<p>Error loading teams</p>';
        console.error(err);
    }
}

// Load and display team statistics
async function loadTeamStats() {
    try {
        const res = await fetch('../settings/get_team_stats.php');
        const data = await res.json();
        
        if (data && data.success) {
            // Update stat boxes with actual data
            const totalMembersEl = document.getElementById('totalMembersCount');
            const activeTodayEl = document.getElementById('activeTodayCount');
            const totalTeamsEl = document.getElementById('totalTeamsCount');
            const onLeaveEl = document.getElementById('onLeaveCount');
            
            if (totalMembersEl) totalMembersEl.textContent = data.total_members || 0;
            if (activeTodayEl) activeTodayEl.textContent = data.active_today || 0;
            if (totalTeamsEl) totalTeamsEl.textContent = data.total_teams || 0;
            if (onLeaveEl) onLeaveEl.textContent = data.on_leave || 0;
        } else {
            console.error('Failed to load statistics:', data);
        }
    } catch (err) {
        console.error('Error loading team statistics:', err);
    }
}

// Export for use in other scripts if needed
window.TeamPage = {
    LoadingState,
    disableAllButtons,
    enableAllButtons
};
