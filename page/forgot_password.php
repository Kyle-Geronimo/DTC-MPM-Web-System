<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password - Project Dashboard System</title>
    <link rel="stylesheet" href="../css/forgot_password.css?v=2.0">
</head>
<body>
    <div class="forgot-container">
        <div class="forgot-card">
            <div class="forgot-header">
                <div class="logo">📊</div>
                <h1>Reset Password</h1>
                <p>Enter your email and new password to request a reset</p>
            </div>

            <form class="forgot-form">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="your@email.com" required>
                </div>

                <div class="form-group">
                    <label for="new_password">New Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="new_password" name="new_password" placeholder="Enter new password" required>
                        <span class="toggle-password" onclick="togglePassword('new_password')">👁️</span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirm_password">Confirm Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="confirm_password" name="confirm_password" placeholder="Confirm new password" required>
                        <span class="toggle-password" onclick="togglePassword('confirm_password')">👁️</span>
                    </div>
                </div>

                <p class="info-text">
                    Enter your new password and submit your reset request. 
                    An admin will review and process your request.
                </p>

                <button type="submit" class="btn-reset">Send Password Reset Request</button>
            </form>

            <div class="forgot-footer">
                <p>Remember your password? <a href="login.php">Sign in</a></p>
                <p>Need to create an account? <a href="register.php">Register here</a></p>
            </div>
        </div>

        <div class="forgot-side">
            <div class="side-content">
                <h2>Trouble Signing In?</h2>
                <p>Don't worry! Password recovery is quick and easy.</p>
                <ul class="steps-list">
                    <li>
                        <span class="step-number">1</span>
                        <span>Enter your email address</span>
                    </li>
                    <li>
                        <span class="step-number">2</span>
                        <span>Enter your new password</span>
                    </li>
                    <li>
                        <span class="step-number">3</span>
                        <span>Submit password reset request</span>
                    </li>
                    <li>
                        <span class="step-number">4</span>
                        <span>Admin will approve your request</span>
                    </li>
                </ul>
                <div class="side-footer">
                    <a href="../index.html" class="back-link">← Back to Home</a>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Toggle password visibility
        function togglePassword(fieldId) {
            const field = document.getElementById(fieldId);
            const type = field.type === 'password' ? 'text' : 'password';
            field.type = type;
        }

        // Handle forgot password form submission
        document.querySelector('.forgot-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            const submitBtn = document.querySelector('.btn-reset');
            
            // Validate passwords match
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Validate password length
            if (newPassword.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            try {
                const formData = new FormData();
                formData.append('email', email);
                formData.append('new_password', newPassword);
                
                const response = await fetch('../settings/forgot_password_handler.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(data.message);
                    
                    // Show debug info in development
                    if (data.debug_info) {
                        console.log('Development Info:', data.debug_info);
                        alert('Development Mode: ' + data.debug_info);
                    }
                    
                    // Clear form
                    document.getElementById('email').value = '';
                    document.getElementById('new_password').value = '';
                    document.getElementById('confirm_password').value = '';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Password Reset Request';
                } else {
                    alert('Error: ' + data.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Password Reset Request';
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
                console.error('Forgot password error:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Password Reset Request';
            }
        });
    </script>
</body>
</html>
