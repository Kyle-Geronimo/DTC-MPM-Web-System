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

// Add Member functionality
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
    const messageButtons = document.querySelectorAll('.member-actions .btn-small:first-child');
    
    messageButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const memberCard = this.closest('.team-member');
            const memberName = memberCard.querySelector('h3').textContent;
            
            // Start loading state
            LoadingState.start(this, 'Sending...');
            
            try {
                // Simulate API call (replace with actual messaging API)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Show success
                LoadingState.success(this, 'Sent!');
                
                console.log(`Message sent to ${memberName}`);
                
                // Here you would typically:
                // 1. Open a message modal
                // 2. Load conversation history
                // 3. Enable sending messages
                
            } catch (error) {
                // Show error
                LoadingState.error(this, 'Error');
                console.error('Error sending message:', error);
            }
        });
    });
}

// Profile functionality
function handleProfileButtons() {
    const profileButtons = document.querySelectorAll('.member-actions .btn-small:last-child');
    
    profileButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const memberCard = this.closest('.team-member');
            const memberName = memberCard.querySelector('h3').textContent;
            
            // Start loading state
            LoadingState.start(this, 'Loading...');
            
            try {
                // Simulate API call (replace with actual profile API)
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Show success
                LoadingState.success(this, 'Loaded!');
                
                console.log(`Opening profile for ${memberName}`);
                
                // Here you would typically:
                // 1. Open a profile modal
                // 2. Load user details
                // 3. Display profile information
                
            } catch (error) {
                // Show error
                LoadingState.error(this, 'Error');
                console.error('Error loading profile:', error);
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
    handleAddMember();
    handleMessageButtons();
    handleProfileButtons();
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
                el.className = 'team-member';
                el.innerHTML = `
                    <div class="member-avatar">👥</div>
                    <h3>${escapeHtml(team.name)}</h3>
                    <p class="member-role">${escapeHtml(team.description || '')}</p>
                    <p class="member-dept">${escapeHtml(team.name)}</p>
                    <div class="member-status online">Online</div>
                    <div class="member-actions">
                        <button class="btn-small">Message</button>
                        <button class="btn-small">Profile</button>
                    </div>
                `;
                grid.appendChild(el);
            } catch (innerErr) {
                console.error('Error rendering team item', team, innerErr);
            }
        });

        // Re-bind message/profile handlers to new elements
        handleMessageButtons();
        handleProfileButtons();
    } catch (err) {
        grid.innerHTML = '<p>Error loading teams</p>';
        console.error(err);
    }
}

// Export for use in other scripts if needed
window.TeamPage = {
    LoadingState,
    disableAllButtons,
    enableAllButtons
};
