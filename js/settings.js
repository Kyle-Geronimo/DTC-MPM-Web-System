/**
 * Settings Page JavaScript
 * Handles all settings page functionality including:
 * - Account settings form
 * - Notification preferences
 * - Security settings
 * - System settings
 * - Theme switching
 * - Integration management
 */

(function() {
    'use strict';

    // Load user data when page loads
    function loadUserData() {
        fetch('../settings/get_user.php')
            .then(response => response.json())
            .then(data => {
                if (data && data.success !== false) {
                    // Populate account form
                    const emailInput = document.querySelector('#account input[type="email"]');
                    const nameInput = document.querySelector('#account input[placeholder*="name"]');
                    const phoneInput = document.querySelector('#account input[type="tel"]');
                    const bioInput = document.querySelector('#account textarea');

                    if (emailInput && data.email) emailInput.value = data.email;
                    if (nameInput && data.full_name) nameInput.value = data.full_name;
                    if (phoneInput && data.phone) phoneInput.value = data.phone || '';
                    if (bioInput && data.bio) bioInput.value = data.bio || '';
                }
            })
            .catch(err => {
                console.error('Error loading user data:', err);
                Toast.error('Failed to load user data');
            });
    }

    // Account Settings Form Handler
    function initAccountSettings() {
        const accountForm = document.querySelector('#account .settings-form');
        if (!accountForm) return;

        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(accountForm);
            const email = accountForm.querySelector('input[type="email"]').value;
            const fullName = accountForm.querySelector('input[placeholder*="name"]').value;
            const phone = accountForm.querySelector('input[type="tel"]').value;
            const bio = accountForm.querySelector('textarea').value;

            // Validate
            if (!email || !fullName) {
                Toast.warning('Email and name are required');
                return;
            }

            // Send to backend
            fetch('../settings/update_account.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    full_name: fullName,
                    phone: phone,
                    bio: bio
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Toast.success('Account settings saved successfully!');
                    // Update user name in header
                    const userName = document.getElementById('userName');
                    const dropUserName = document.getElementById('dropUserName');
                    const userAvatar = document.getElementById('userAvatar');
                    if (userName) userName.textContent = fullName;
                    if (dropUserName) dropUserName.textContent = fullName;
                    if (userAvatar) userAvatar.textContent = fullName.charAt(0).toUpperCase();
                } else {
                    Toast.error(data.message || 'Failed to save settings');
                }
            })
            .catch(err => {
                console.error('Error saving account settings:', err);
                Toast.error('Failed to save account settings');
            });
        });
    }

    // Notification Preferences Handler
    function initNotificationSettings() {
        const notificationToggles = document.querySelectorAll('#notifications .toggle');
        
        notificationToggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const title = this.closest('.option-group').querySelector('.option-title').textContent;
                const enabled = this.checked;

                // Save preference
                fetch('../settings/update_notifications.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        preference: title,
                        enabled: enabled
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Toast.success(`${title} ${enabled ? 'enabled' : 'disabled'}`);
                    } else {
                        Toast.error('Failed to save preference');
                        this.checked = !enabled; // Revert
                    }
                })
                .catch(err => {
                    console.error('Error saving notification preference:', err);
                    Toast.error('Failed to save preference');
                    this.checked = !enabled; // Revert
                });
            });
        });
    }

    // Security Settings Handler
    function initSecuritySettings() {
        const securityForm = document.querySelector('#security .settings-form');
        if (!securityForm) return;

        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const currentPassword = securityForm.querySelector('input[placeholder*="current"]').value;
            const newPassword = securityForm.querySelector('input[placeholder*="new password"]').value;
            const confirmPassword = securityForm.querySelector('input[placeholder*="Confirm"]').value;

            // Validate
            if (!currentPassword || !newPassword || !confirmPassword) {
                Toast.warning('All password fields are required');
                return;
            }

            if (newPassword.length < 6) {
                Toast.warning('Password must be at least 6 characters');
                return;
            }

            if (newPassword !== confirmPassword) {
                Toast.error('New passwords do not match');
                return;
            }

            // Send to backend
            fetch('../settings/update_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Toast.success('Password updated successfully!');
                    securityForm.reset();
                } else {
                    Toast.error(data.message || 'Failed to update password');
                }
            })
            .catch(err => {
                console.error('Error updating password:', err);
                Toast.error('Failed to update password');
            });
        });

        // 2FA Enable button
        const enable2FABtn = document.querySelector('#security .btn-secondary');
        if (enable2FABtn) {
            enable2FABtn.addEventListener('click', function() {
                Toast.info('Two-factor authentication coming soon!');
            });
        }
    }

    // System Settings Handler
    function initSystemSettings() {
        // Maintenance mode toggle
        const maintenanceToggle = document.querySelector('#system .toggle');
        if (maintenanceToggle) {
            maintenanceToggle.addEventListener('change', function() {
                const enabled = this.checked;
                
                fetch('../settings/update_system.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        setting: 'maintenance_mode',
                        value: enabled
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
                    } else {
                        Toast.error('Failed to update system setting');
                        this.checked = !enabled;
                    }
                })
                .catch(err => {
                    console.error('Error updating system setting:', err);
                    Toast.error('Failed to update system setting');
                    this.checked = !enabled;
                });
            });
        }

        // Language selector
        const languageSelect = document.querySelectorAll('#system .form-select')[0];
        if (languageSelect) {
            languageSelect.addEventListener('change', function() {
                const language = this.value;
                
                fetch('../settings/update_system.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        setting: 'language',
                        value: language
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Toast.success('Language updated');
                    } else {
                        Toast.error('Failed to update language');
                    }
                })
                .catch(err => {
                    console.error('Error updating language:', err);
                    Toast.error('Failed to update language');
                });
            });
        }

        // Timezone selector
        const timezoneSelect = document.querySelectorAll('#system .form-select')[1];
        if (timezoneSelect) {
            timezoneSelect.addEventListener('change', function() {
                const timezone = this.value;
                
                fetch('../settings/update_system.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        setting: 'timezone',
                        value: timezone
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Toast.success('Timezone updated');
                    } else {
                        Toast.error('Failed to update timezone');
                    }
                })
                .catch(err => {
                    console.error('Error updating timezone:', err);
                    Toast.error('Failed to update timezone');
                });
            });
        }
    }

    // Integration Settings Handler
    function initIntegrationSettings() {
        const connectButtons = document.querySelectorAll('#integration .btn-connect');
        
        connectButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const integrationName = this.closest('.integration-item').querySelector('h3').textContent;
                const isConnected = this.classList.contains('connected');

                if (isConnected) {
                    // Disconnect
                    if (confirm(`Disconnect from ${integrationName}?`)) {
                        this.classList.remove('connected');
                        this.textContent = 'Connect';
                        Toast.success(`Disconnected from ${integrationName}`);
                    }
                } else {
                    // Connect
                    Toast.info(`Connecting to ${integrationName}...`);
                    setTimeout(() => {
                        this.classList.add('connected');
                        this.textContent = 'Connected';
                        Toast.success(`Successfully connected to ${integrationName}!`);
                    }, 1500);
                }
            });
        });
    }

    // Appearance Settings Handler
    function initAppearanceSettings() {
        // Theme switcher
        const themeButtons = document.querySelectorAll('#appearance .theme-btn');
        
        themeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active from all
                themeButtons.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                this.classList.add('active');
                
                const theme = this.textContent.toLowerCase();
                Toast.success(`Theme changed to ${theme}`);
                
                // Save preference
                fetch('../settings/update_system.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        setting: 'theme',
                        value: theme
                    })
                })
                .then(response => response.json())
                .catch(err => console.error('Error saving theme:', err));
            });
        });

        // Compact view toggle
        const compactToggle = document.querySelector('#appearance .toggle');
        if (compactToggle) {
            compactToggle.addEventListener('change', function() {
                const enabled = this.checked;
                Toast.success(`Compact view ${enabled ? 'enabled' : 'disabled'}`);
                
                fetch('../settings/update_system.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        setting: 'compact_view',
                        value: enabled
                    })
                })
                .then(response => response.json())
                .catch(err => console.error('Error saving compact view:', err));
            });
        }
    }

    // Sidebar navigation
    function initSidebarNavigation() {
        const navLinks = document.querySelectorAll('.settings-nav a');
        const sections = document.querySelectorAll('.settings-section');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active to clicked link
                this.classList.add('active');

                // Get target section
                const targetId = this.getAttribute('href').substring(1);
                
                // Hide all sections
                sections.forEach(s => s.style.display = 'none');
                
                // Show target section
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
            });
        });

        // Show first section by default
        if (sections.length > 0) {
            sections.forEach(s => s.style.display = 'none');
            sections[0].style.display = 'block';
        }
    }

    // Initialize all settings functionality
    function init() {
        console.log('Settings page initialized');
        
        loadUserData();
        initSidebarNavigation();
        initAccountSettings();
        initNotificationSettings();
        initSecuritySettings();
        initSystemSettings();
        initIntegrationSettings();
        initAppearanceSettings();

        Toast.info('Settings page loaded');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
