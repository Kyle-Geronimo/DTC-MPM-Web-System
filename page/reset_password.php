<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Project Dashboard System</title>
    <link rel="stylesheet" href="../css/forgot_password.css">
</head>
<body>
    <div class="forgot-container">
        <div class="forgot-card">
            <div class="forgot-header">
                <div class="logo">📊</div>
                <h1>Create New Password</h1>
                <p>Enter your new password below</p>
            </div>

            <form class="reset-form" id="resetPasswordForm">
                <input type="hidden" id="token" name="token">
                
                <div class="form-group">
                    <label for="password">New Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" placeholder="••••••••" required>
                        <button type="button" class="toggle-password" data-target="password" title="Toggle password visibility">
                            👁️
                        </button>
                    </div>
                    <small class="hint">Password must be at least 8 characters long</small>
                </div>

                <div class="form-group">
                    <label for="confirm_password">Confirm New Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="confirm_password" name="confirm_password" placeholder="••••••••" required>
                        <button type="button" class="toggle-password" data-target="confirm_password" title="Toggle password visibility">
                            👁️
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-reset">Reset Password</button>
            </form>

            <div class="forgot-footer">
                <p>Remember your password? <a href="login.php">Sign in</a></p>
            </div>
        </div>

        <div class="forgot-side">
            <div class="side-content">
                <h2>Create a Strong Password</h2>
                <p>Make sure your password is secure:</p>
                <ul class="steps-list">
                    <li>
                        <span class="step-number">✓</span>
                        <span>At least 8 characters long</span>
                    </li>
                    <li>
                        <span class="step-number">✓</span>
                        <span>Mix of uppercase and lowercase</span>
                    </li>
                    <li>
                        <span class="step-number">✓</span>
                        <span>Include numbers</span>
                    </li>
                    <li>
                        <span class="step-number">✓</span>
                        <span>Add special characters</span>
                    </li>
                </ul>
                <div class="side-footer">
                    <a href="../index.html" class="back-link">← Back to Home</a>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Password toggle functionality
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                
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

        // Get token from URL
        const urlParams = new(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            alert('Invalid or missing reset token. Please request a new password reset link.');
            window.location.href = 'forgot_password.php';
        } else {
            document.getElementById('token').value = token;
        }

        // Handle form submission
        document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            const submitBtn = document.querySelector('.btn-reset');
            
            // Client-side validation
            if (password.length < 8) {
                alert('Password must be at least 8 characters long');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetting Password...';
            
            try {
                const formData = new formdata();
                formData.append('token', token);
                formData.append('password', password);
                formData.append('confirm_password', confirmPassword);
                
                const response = await fetch('../settings/reset_password_handler.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Success! ' + data.message);
                    window.location.href = 'login.php';
                } else {
                    alert('Error: ' + data.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Reset Password';
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
                console.error('Reset error:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reset Password';
            }
        });
    </script>
</body>
</html>
