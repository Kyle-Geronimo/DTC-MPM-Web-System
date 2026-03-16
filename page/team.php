<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team - Monitoring & Project Management System</title>
    <link rel="stylesheet" href="../css/team.css">
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
                <li><a href="http://localhost/ProjectDashboard/page/reports.html">Reports</a></li>                <li><a href="http://localhost/ProjectDashboard/page/admin.html">Admin</a></li>                <li><a href="http://localhost/ProjectDashboard/page/settings.html">Settings</a></li>
                <li><a href="http://localhost/ProjectDashboard/settings/logout.php" style="color: #ff6b6b;">Logout</a></li>
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
                    <div class="user-profile">
                        <div class="avatar" id="userAvatar">A</div>
                        <span id="userName">Admin User</span>
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
        if(d&&d.full_name){const n=d.full_name;const a=document.getElementById('userAvatar');const s=document.getElementById('userName');if(a)a.textContent=n.charAt(0).toUpperCase();if(s)s.textContent=n;}
    }).catch(()=>{});
    </script>
</body>
</html>
