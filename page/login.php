<?php
/**
 * Login Page
 * If user is already logged in, redirect to dashboard
 */
session_start();

// Attempt auto-login via remember token when session not active
require_once(__DIR__ . '/../settings/config.php');
require_once(__DIR__ . '/../settings/db_connect.php');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    if (!empty($_COOKIE['remember_token'])) {
        try {
            $cookie = $_COOKIE['remember_token'];
            $tokenHash = hash('sha256', $cookie);

            $stmt = $conn->prepare("SELECT user_id FROM remember_tokens WHERE token_hash = ? AND expires_at > NOW() LIMIT 1");
            if ($stmt) {
                $stmt->bind_param('s', $tokenHash);
                $stmt->execute();
                $res = $stmt->get_result();
                if ($res && $res->num_rows > 0) {
                    $row = $res->fetch_assoc();
                    $userId = (int)$row['user_id'];

                    // Load user and restore session
                    $ustmt = $conn->prepare("SELECT id, username, email, full_name, role, status, department FROM users WHERE id = ? LIMIT 1");
                    if ($ustmt) {
                        $ustmt->bind_param('i', $userId);
                        $ustmt->execute();
                        $ures = $ustmt->get_result();
                        if ($ures && $ures->num_rows > 0) {
                            $user = $ures->fetch_assoc();
                            if ($user['status'] === 'active') {
                                session_regenerate_id(true);
                                $_SESSION['user_id'] = $user['id'];
                                $_SESSION['username'] = $user['username'];
                                $_SESSION['email'] = $user['email'];
                                $_SESSION['full_name'] = $user['full_name'];
                                $_SESSION['role'] = $user['role'];
                                $_SESSION['department'] = $user['department'];
                                $_SESSION['logged_in'] = true;
                                $_SESSION['login_time'] = time();
                                $_SESSION['last_activity'] = time();
                                $_SESSION['last_regen'] = time();
                                $_SESSION['fingerprint'] = md5(
                                    ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') .
                                    ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0')
                                );
                                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

                                // Rotate token: issue new cookie and update DB
                                $newToken = bin2hex(random_bytes(32));
                                $newHash = hash('sha256', $newToken);
                                $cookieExpires = time() + (86400 * 7);
                                $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
                                setcookie('remember_token', $newToken, [
                                    'expires' => $cookieExpires,
                                    'path' => '/',
                                    'httponly' => true,
                                    'samesite' => 'Lax',
                                    'secure' => $secure
                                ]);

                                $ip = $_SERVER['REMOTE_ADDR'] ?? '';
                                $ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : '';
                                $expiresAt = date('Y-m-d H:i:s', $cookieExpires);
                                $up = $conn->prepare("UPDATE remember_tokens SET token_hash = ?, expires_at = ?, last_used = NOW(), ip_address = ?, user_agent = ? WHERE token_hash = ?");
                                if ($up) {
                                    $up->bind_param('sssss', $newHash, $expiresAt, $ip, $ua, $tokenHash);
                                    $up->execute();
                                    $up->close();
                                }

                                // Redirect to dashboard
                                header('Location: front_panel.html');
                                exit;
                            }
                        }
                        $ustmt->close();
                    }
                }
                $stmt->close();
            }
        } catch (Exception $e) {
            // Proceed to login form on any error
        }
    }
}

// Check if user is already logged in (fallback)
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
    <title>Login - Project Dashboard System</title>
    <link rel="stylesheet" href="../css/login.css?v=2.0">
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <a href="../index.html" class="back-btn" title="Back to Home">← Back</a>
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
                    this.textContent = '🌫️';
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
