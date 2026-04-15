<?php
/**
 * Registration Page
 * If user is already logged in, redirect to dashboard
 */
session_start();

// Check if user is already logged in
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: front_panel.html');
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
                <a href="../index.html" class="back-btn" title="Back to Home">← Back</a>
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

    <script src="../js/register.js"></script>
</body>
</html>
