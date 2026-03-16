<?php
/**
 * Registration Page
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
    <title>Register - Project Dashboard System</title>
    <link rel="stylesheet" href="../css/register.css?v=3.0">
</head>
<body>
    <div class="register-container">
        <div class="register-side">
            <div class="side-content">
                <h2>Join Us Today!</h2>
                <p>Create your account and start managing projects efficiently.</p>
                <div class="benefits-list">
                    <div class="benefit">✓ Free to use</div>
                    <div class="benefit">✓ Easy to set up</div>
                    <div class="benefit">✓ Full features included</div>
                    <div class="benefit">✓ 24/7 Support</div>
                </div>
                <div class="side-footer">
                    <a href="../index.html" class="back-link">← Back to Home</a>
                </div>
            </div>
        </div>

        <div class="register-card">
            <div class="register-header">
                <div class="logo">📊</div>
                <h1>Create Account</h1>
                <p>Sign up to get started</p>
            </div>

            <form class="register-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstname">First Name</label>
                        <input type="text" id="firstname" name="firstname" placeholder="John" required>
                    </div>
                    <div class="form-group">
                        <label for="lastname">Last Name</label>
                        <input type="text" id="lastname" name="lastname" placeholder="Doe" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="your@email.com" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="password-wrapper">
                            <input type="password" id="password" name="password" placeholder="••••••••" required>
                            <button type="button" class="toggle-password" data-target="password" title="Toggle password visibility">
                                👁️
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirm Password</label>
                        <div class="password-wrapper">
                            <input type="password" id="confirm-password" name="confirm_password" placeholder="••••••••" required>
                            <button type="button" class="toggle-password" data-target="confirm-password" title="Toggle password visibility">
                                👁️
                            </button>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="company">Company</label>
                    <input type="text" id="company" name="company" placeholder="Your Company Name">
                </div>

                <div class="form-options">
                    <label class="terms-agree">
                        <input type="checkbox" name="terms" required>
                        <span>I agree to the <a href="#">Terms & Conditions</a></span>
                    </label>
                </div>

                <button type="submit" class="btn-register">Create Account</button>
            </form>

            <div class="register-footer">
                <p>Already have an account? <a href="login.php">Sign in</a></p>
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

        // Handle registration form submission
        document.querySelector('.register-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const firstname = document.getElementById('firstname').value;
            const lastname = document.getElementById('lastname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const company = document.getElementById('company').value;
            const terms = document.querySelector('input[name="terms"]').checked;
            const submitBtn = document.querySelector('.btn-register');
            
            // Client-side validation
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
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';
            
            try {
                const formData = new formdata();
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
                
                const data = await response.json();
                
                if (data.success) {
                    // Show success message
                    alert('Success! ' + data.message);
                    
                    // Redirect to login page
                    window.location.href = data.redirect;
                } else {
                    // Show error message with details if available
                    let errorMsg = 'Error: ' + data.message;
                    if (data.error_details) {
                        errorMsg += '\n\nDetails: ' + data.error_details;
                        console.error('Backend error:', data.error_details);
                    }
                    alert(errorMsg);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Account';
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
                console.error('Registration error:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    </script>
</body>
</html>
