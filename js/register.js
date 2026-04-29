document.addEventListener('DOMContentLoaded', () => {
    // Password toggle functionality
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            if (!passwordInput) return;

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.textContent = '🌫️';
                this.title = 'Hide password';
            } else {
                passwordInput.type = 'password';
                this.textContent = '👁️';
                this.title = 'Show password';
            }
        });
    });

    const form = document.querySelector('.register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstname = (document.getElementById('firstname') || {}).value || '';
        const lastname = (document.getElementById('lastname') || {}).value || '';
        const email = (document.getElementById('email') || {}).value || '';
        const password = (document.getElementById('password') || {}).value || '';
        const confirmPassword = (document.getElementById('confirm-password') || {}).value || '';
        const company = (document.getElementById('company') || {}).value || '';
        const termsEl = document.querySelector('input[name="terms"]');
        const terms = !!termsEl && termsEl.checked;
        const submitBtn = document.querySelector('.btn-register');

        if (!terms) {
            alert('You must agree to the Terms & Conditions');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';
        }

        try {
            const formData = new FormData();
            formData.append('firstname', firstname);
            formData.append('lastname', lastname);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('confirm_password', confirmPassword);
            formData.append('company', company);

            const response = await fetch('../settings/register_handler.php', {
                method: 'POST',
                body: formData
            });

            // Tolerant parsing: handle non-JSON server responses (HTML error pages, warnings)
            const contentType = (response.headers.get('content-type') || '').toLowerCase();
            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON response from register_handler.php:', text);
                alert('Registration failed: Server returned an unexpected response. Check the browser console for details.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Account';
                }
                return;
            }

            if (data && data.success) {
                alert('Success! ' + (data.message || 'Account created'));
                window.location.href = data.redirect || 'login.php';
            } else {
                let errorMsg = 'Error: ' + (data && data.message ? data.message : 'Registration failed');
                if (data && data.error_details) {
                    errorMsg += '\n\nDetails: ' + data.error_details;
                    console.error('Backend error:', data.error_details);
                }
                alert(errorMsg);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Account';
                }
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
            console.error('Registration error:', error);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        }
    });
});
