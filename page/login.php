<?php
/**
 * Login Page
 * If user is already logged in, redirect to dashboard
 */
session_start();

// Check if user is already logged in
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: dashboard.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Project Dashboard System</title>
    <link rel="stylesheet" href="../css/login.css?v=2.0">
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="logo">📊</div>
                <h1>ProjectDashboard</h1>
                <p>Sign in to your account</p>
            </div>

            <form class="login-form">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="your@email.com" required>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" placeholder="••••••••" required>
                        <button type="button" class="toggle-password" data-target="password" title="Toggle password visibility">
                            👁️
                        </button>
                    </div>
                </div>

                <div class="form-options">
                    <label class="remember-me">
                        <input type="checkbox" name="remember">
                        <span>Remember me</span>
                    </label>
                    <a href="forgot_password.php" class="forgot-link">Forgot password?</a>
                </div>

                <button type="submit" class="btn-login">Sign In</button>
            </form>

            <div class="login-footer">
                <p>Don't have an account? <a href="register.php">Create one</a></p>
            </div>
        </div>

        <div class="login-side">
            <div class="side-content">
                <h2>Welcome Back!</h2>
                <p>Access your projects, monitor performance, and manage your team efficiently.</p>
                <div class="features-list">
                    <div class="feature">✓ Real-time monitoring</div>
                    <div class="feature">✓ Project management</div>
                    <div class="feature">✓ Team collaboration</div>
                    <div class="feature">✓ Advanced analytics</div>
                </div>
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
                    this.textContent = '🙈';
                    this.title = 'Hide password';
                } else {
                    passwordInput.type = 'password';
                    this.textContent = '👁️';
                    this.title = 'Show password';
                }
            });
        });

        // Handle login form submission
        document.querySelector('.login-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.querySelector('input[name="remember"]').checked;
            const submitBtn = document.querySelector('.btn-login');
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';
            
            try {
                const formData = new FormData();
                formData.append('email', email);
                formData.append('password', password);
                formData.append('remember', remember);
                
                const response = await fetch('../settings/authenticate.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Show success message
                    alert('Welcome back, ' + data.user.name + '!');
                    
                    // Redirect to dashboard
                    window.location.href = data.redirect;
                } else {
                    // Show error message
                    alert('Error: ' + data.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In';
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
                console.error('Login error:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        });
    </script>
</body>
</html>
