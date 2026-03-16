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
    const closeBtn = modal.querySelector(`.${closeBtnClass}`);
    const cancelBtn = modal.querySelector(`.${cancelBtnClass}`);
    const form = document.getElementById(formId);
    
    // Open modal
    btn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    // Close modal function
    const closeModalFunc = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        form.reset();
    };
    
    // Close events
    closeBtn.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);
    
    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitHandler(form, closeModalFunc);
    });
}

async function submitForm(formData, endpoint, submitBtn, successMessage, closeModal) {
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
            alert(`✅ ${successMessage}`);
            closeModal();
            setTimeout(() => location.reload(), 500);
        } else {
            alert('❌ Error: ' + (data.message || 'Unknown error'));
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
            closeModal
        );
    }
);

// Set minimum dates on load
const today = new Date().toISOString().split('T')[0];
document.getElementById('projectStartDate').min = today;
document.getElementById('projectEndDate').min = today;

// Auto-update end date
document.getElementById('projectStartDate').addEventListener('change', function() {
    const startDate = new Date(this.value);
    const endDateInput = document.getElementById('projectEndDate');
    endDateInput.min = this.value;
    
    if (endDateInput.value && new Date(endDateInput.value) < startDate) {
        const suggestedEndDate = new Date(startDate);
        suggestedEndDate.setDate(suggestedEndDate.getDate() + 30);
        endDateInput.value = suggestedEndDate.toISOString().split('T')[0];
    }
});

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
        
        await submitForm(
            formData,
            '../settings/assign_task.php',
            submitBtn,
            'Task assigned successfully!',
            closeModal
        );
    }
);

// Set minimum date for task
document.getElementById('taskDueDate').min = today;

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
            closeModal
        );
    }
);

// Set minimum date for meeting
document.getElementById('meetingDate').min = today;

// ============================================
// ADD TEAM MEMBER MODAL
// ============================================

setupModal(
    'addTeamMemberModal',
    'addTeamMemberBtn',
    'close-member',
    'cancel-member',
    'addTeamMemberForm',
    async (form, closeModal) => {
        const formData = new FormData(form);
        const submitBtn = document.getElementById('submitTeamBtn');
        
        await submitForm(
            formData,
            '../settings/add_team.php',
            submitBtn,
            'Team added successfully!',
            closeModal
        );
    }
);
