<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team - Monitoring & Project Management System</title>
    <link rel="stylesheet" href="../css/team.css">
    <style>
        #toast-container{position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px}
        .toast{padding:12px 20px;border-radius:8px;color:#fff;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,.15);display:flex;align-items:center;gap:10px;min-width:280px;max-width:420px;animation:slideIn .3s ease;cursor:pointer;transition:opacity .3s}
        .toast.removing{animation:slideOut .3s ease forwards}
        .toast-success{background:#10b981}.toast-error{background:#ef4444}.toast-warning{background:#f59e0b}.toast-info{background:#3b82f6}
        @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}
        .notification-bell{position:relative;cursor:pointer;font-size:20px;margin-right:15px}
        .notification-badge{position:absolute;top:-6px;right:-8px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;display:flex;align-items:center;justify-content:center;display:none}
        .notification-panel{position:absolute;top:40px;right:0;width:340px;max-height:400px;background:#fff;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.15);z-index:9999;display:none;overflow:hidden}
        .notification-panel.show{display:block}
        .notification-panel-header{padding:12px 16px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;font-weight:600}
        .notification-panel-header a{font-size:12px;color:#3b82f6;text-decoration:none}
        .notification-list{max-height:340px;overflow-y:auto}
        .notification-item{padding:12px 16px;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background .2s}
        .notification-item:hover{background:#f9fafb}
        .notification-item.unread{background:#eff6ff;border-left:3px solid #3b82f6}
        .notification-item .notif-msg{font-size:13px;color:#374151}
        .notification-item .notif-time{font-size:11px;color:#9ca3af;margin-top:4px}
        .notification-empty{padding:30px;text-align:center;color:#9ca3af;font-size:14px}
        /* ===== User Dropdown ===== */
        #userMenuWrapper{position:relative;display:inline-block}
        .user-menu-btn{display:inline-flex;align-items:center;gap:8px;background:#f0f4ff;border:1.5px solid #c7d2fe;border-radius:8px;padding:7px 13px 7px 9px;cursor:pointer;font-size:14px;font-weight:500;color:#374151}
        .user-menu-btn:hover{background:#e0e7ff;border-color:#818cf8}
        .user-menu-btn .caret{font-size:10px;color:#6366f1}
        .user-dropdown{display:none;position:absolute;right:0;top:calc(100% + 6px);min-width:190px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.15);z-index:99999;overflow:hidden}
        .user-dropdown.open{display:block}
        .user-dropdown-info{padding:12px 16px 10px;border-bottom:1px solid #f3f4f6}
        .user-dropdown-info b{display:block;font-size:14px;color:#111827}
        .user-dropdown-info small{font-size:12px;color:#9ca3af}
        .dropdown-link{display:flex;align-items:center;gap:10px;padding:11px 16px;color:#374151;text-decoration:none;font-size:14px;transition:background .15s}
        .dropdown-link:hover{background:#f3f4f6}
        .dropdown-link.logout-link{color:#ef4444;border-top:1px solid #f3f4f6}
        .dropdown-link.logout-link:hover{background:#fff5f5}
    </style>
    <script src="../js/app_core.js" defer></script>
    <script src="../js/team.js" defer></script>
</head>
<body>
    <div class="container">
        <!-- Sidebar Navigation -->
        <nav class="sidebar">
            <div class="logo">
                <h2>📊 DashBoard</h2>
            </div>
            <ul class="nav-menu">
                <li><a href="http://localhost/ProjectDashboard/page/dashboard.html">Dashboard</a></li>
                <li><a href="http://localhost/ProjectDashboard/page/projects.html">Projects</a></li>
                <li><a href="http://localhost/ProjectDashboard/page/monitoring.html">Monitoring</a></li>
                <li><a href="http://localhost/ProjectDashboard/page/tasks.html">Tasks</a></li>
                <li><a href="http://localhost/ProjectDashboard/page/team.php" class="active">Team</a></li>
                <li><a href="http://localhost/ProjectDashboard/page/reports.html">Reports</a></li>
                <li id="adminNavLink" style="display:none"><a href="http://localhost/ProjectDashboard/page/admin.html">Admin</a></li>
                <!-- Settings and Logout moved to user dropdown -->
            </ul>
        </nav>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
            <header class="header">
                <div class="header-left">
                    <h1>Team Members</h1>
                </div>
                <div class="header-right">
                    <div class="notification-bell" id="notificationBell">
                        🔔
                        <span class="notification-badge" id="notifBadge">0</span>
                        <div class="notification-panel" id="notifPanel">
                            <div class="notification-panel-header">
                                <span>Notifications</span>
                                <a href="#" id="markAllRead">Mark all read</a>
                            </div>
                            <div class="notification-list" id="notifList">
                                <div class="notification-empty">No notifications</div>
                            </div>
                        </div>
                    </div>
                    <div id="userMenuWrapper">
                        <button class="user-menu-btn" id="userMenuBtn">
                            <div class="avatar" id="userAvatar">A</div>
                            <span id="userName">Admin User</span>
                            <span class="caret">&#9660;</span>
                        </button>
                        <div class="user-dropdown" id="userDropdown">
                            <div class="user-dropdown-info">
                                <b id="dropUserName">Admin User</b>
                                <small>Administrator</small>
                            </div>
                            <a href="/ProjectDashboard/page/settings.html" class="dropdown-link">&#9881;&#65039; Settings</a>
                            <a href="/ProjectDashboard/settings/logout.php" class="dropdown-link logout-link">&#128682; Log Out</a>
                        </div>
                    </div>
                </div>
            </header>

            <div class="action-bar">
                <button class="btn-primary" id="openAddMember">+ Add Member</button>
            </div>

            <!-- Team Stats -->
            <section class="stats-section">
                <div class="stat-box">
                    <h3>25</h3>
                    <p>Total Members</p>
                </div>
                <div class="stat-box">
                    <h3>18</h3>
                    <p>Active Today</p>
                </div>
                <div class="stat-box">
                    <h3>7</h3>
                    <p>Teams</p>
                </div>
                <div class="stat-box">
                    <h3>3</h3>
                    <p>On Leave</p>
                </div>
            </section>

            <!-- Team Members Grid (populated dynamically by team.js) -->
            <section class="team-grid">
                <p>Loading teams...</p>
            </section>
        </main>
    </div>

    <!-- Add Member Modal -->
    <div id="addMemberModal" class="modal" style="display:none;">
        <div class="modal-content">
            <div class="modal-header">
                <h2>👥 Add Team Member</h2>
                <span class="close-add-member">&times;</span>
            </div>
            <form id="addMemberForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName">First Name</label>
                        <input type="text" id="firstName" name="firstname" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Last Name</label>
                        <input type="text" id="lastName" name="lastname" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="memberRole">Role</label>
                        <input type="text" id="memberRole" name="role" placeholder="Developer, QA, Manager">
                    </div>
                    <div class="form-group">
                        <label for="memberTeam">Team</label>
                        <select id="memberTeam" name="team_id">
                            <option value="">Unassigned</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelAddMember">Cancel</button>
                    <button type="submit" class="btn-primary" id="submitAddMember">Add Member</button>
                </div>
            </form>
        </div>
    </div>

    <script>
    fetch('../settings/get_user.php').then(r=>r.json()).then(d=>{
        if(d&&d.full_name){const n=d.full_name;const a=document.getElementById('userAvatar');const s=document.getElementById('userName');const dd=document.getElementById('dropUserName');if(a)a.textContent=n.charAt(0).toUpperCase();if(s)s.textContent=n;if(dd)dd.textContent=n;}
    }).catch(()=>{});
    </script>
    <script>
    (function(){
        var btn=document.getElementById('userMenuBtn');
        var menu=document.getElementById('userDropdown');
        if(!btn||!menu)return;
        btn.addEventListener('click',function(e){e.stopPropagation();menu.classList.toggle('open');});
        document.addEventListener('click',function(e){if(!menu.contains(e.target)&&!btn.contains(e.target)){menu.classList.remove('open');}});
        document.addEventListener('keydown',function(e){if(e.key==='Escape')menu.classList.remove('open');});
    })();
    </script>
</body>
</html>
