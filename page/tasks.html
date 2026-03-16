<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tasks - Monitoring & Project Management System</title>
    <link rel="stylesheet" href="../css/tasks.css">
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
                <li><a href="http://localhost/ProjectDashboard/page/tasks.html" class="active">Tasks</a></li>
                <li><a href="http://localhost/ProjectDashboard/page/team.html">Team</a></li>
                <li><a href="http://localhost/ProjectDashboard/page/reports.html">Reports</a></li>
                <li><a href="http://localhost/ProjectDashboard/page/admin.html">Admin</a></li>
                <li><a href="http://localhost/ProjectDashboard/page/settings.html">Settings</a></li>
                <li><a href="http://localhost/ProjectDashboard/settings/logout.php" style="color: #ff6b6b;">Logout</a></li>
            </ul>
        </nav>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
            <header class="header">
                <div class="header-left">
                    <h1>Tasks</h1>
                </div>
                <div class="header-right">
                    <div class="user-profile">
                        <div class="avatar" id="userAvatar">A</div>
                        <span id="userName">Admin User</span>
                    </div>
                </div>
            </header>

            <div class="action-bar">
                <button class="btn-primary" id="assignTaskBtn">+ New Task</button>
            </div>

            <!-- Task Filters -->
            <section class="task-filters">
                <input type="text" placeholder="Search tasks..." class="search-input">
                <select class="filter-select">
                    <option value="">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select class="filter-select">
                    <option value="">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </section>

            <!-- Task List (loaded from DB) -->
            <section class="tasks-section" id="tasksList">
                <p>Loading tasks...</p>
            </section>
        </main>
    </div>

    <!-- Assign Task Modal (reused from dashboard) -->
    <div id="assignTaskModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>✅ Assign New Task</h2>
                <span class="close-task">&times;</span>
            </div>
            <form id="assignTaskForm">
                <input type="hidden" name="task_id" id="taskId" value="">
                <div class="form-group">
                    <label for="taskTitle">Task Title *</label>
                    <input type="text" id="taskTitle" name="title" required placeholder="Enter task title">
                </div>
                
                <div class="form-group">
                    <label for="taskDescription">Description</label>
                    <textarea id="taskDescription" name="description" rows="3" placeholder="Task description"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="taskPriority">Priority *</label>
                        <select id="taskPriority" name="priority" required>
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="taskStatus">Status</label>
                        <select id="taskStatus" name="status">
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="taskDueDate">Due date *</label>
                        <input type="date" id="taskDueDate" name="due_date" required>
                    </div>
                    <div class="form-group">
                        <label for="taskEstimatedHours">Estimated Hours</label>
                        <input type="number" id="taskEstimatedHours" name="estimated_hours" min="0" step="0.5" placeholder="0">
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn-secondary cancel-task">Cancel</button>
                    <button type="submit" class="btn-primary" id="submitTaskBtn">Assign Task</button>
                </div>
            </form>
        </div>
    </div>

    <script src="../js/dashboard.js"></script>
    <script>
        let tasksCache = [];
        // Load tasks from API and render them
        async function loadTasks() {
            const container = document.getElementById('tasksList');
            container.innerHTML = '<p>Loading tasks...</p>';
            try {
                const res = await fetch('../settings/get_tasks.php');
                const data = await res.json();
                if (!data.success) {
                    container.innerHTML = '<p>Error loading tasks</p>';
                    console.error(data);
                    return;
                }

                const tasks = data.tasks || [];
                tasksCache = tasks; // cache for edit actions
                if (tasks.length === 0) {
                    container.innerHTML = '<p>No tasks found.</p>';
                    return;
                }

                container.innerHTML = '';
                tasks.forEach(t => {
                    const card = document.createElement('div');
                    card.className = 'task-card' + (t.status === 'completed' ? ' completed' : '');
                    const due = t.due_date ? (isNaN(t.due_date) ? t.due_date : new date(t.due_date * 1000).toLocaleDateString()) : '';
                    card.innerHTML = `
                        <div class="task-header">
                            <input type="checkbox" class="task-check" ${t.status==='completed'?'checked':''}>
                            <h3>${escapeHtml(t.title)}</h3>
                            <span class="priority-badge ${escapeHtml(t.priority)}">${escapeHtml(capitalize(t.priority||''))}</span>
                        </div>
                        <p class="task-desc">${escapeHtml(t.description||'')}</p>
                        <div class="task-info">
                            <span class="assigned-to">Assigned: ${escapeHtml(t.assigned_name||'Unassigned')}</span>
                            <span class="due-date">${due ? 'Due: ' + due : ''}</span>
                        </div>
                        <div class="task-footer">
                            <div class="task-actions">
                                <button class="btn-action edit" data-id="${escapeHtml(t.id)}">Edit</button>
                                <button class="btn-action delete" data-id="${escapeHtml(t.id)}">Delete</button>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                });

                // attach action handlers
                document.querySelectorAll('.btn-action.edit').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = btn.dataset.id;
                        openEditTask(id);
                    });
                });

                document.querySelectorAll('.btn-action.delete').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = btn.dataset.id;
                        if (!confirm('Delete this task?')) return;
                        try {
                            const fd = new formdata();
                            fd.append('task_id', id);
                            const res = await fetch('../settings/delete_task.php', { method: 'POST', body: fd });
                            const result = await res.json();
                            console.log('Delete response', result);
                            if (result.success) {
                                alert('Task deleted');
                                loadTasks();
                            } else {
                                alert('Delete failed: ' + (result.message || 'Unknown'));
                                console.error('Delete failed details', result);
                            }
                        } catch (err) {
                            console.error('Delete error', err);
                            alert('Delete failed');
                        }
                    });
                });
            } catch (err) {
                container.innerHTML = '<p>Error loading tasks</p>';
                console.error(err);
            }
        }

        function openEditTask(id) {
            const task = tasksCache.find(t => t.id === id);
            if (!task) {
                alert('Task not found');
                return;
            }
            // populate form
            document.getElementById('taskId').value = task.id || '';
            document.getElementById('taskTitle').value = task.title || '';
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority || 'medium';
            document.getElementById('taskStatus').value = task.status || 'pending';
            if (task.due_date) {
                const d = isNaN(task.due_date) ? new date(task.due_date) : new date(task.due_date*1000);
                document.getElementById('taskDueDate').value = d.toISOString().split('T')[0];
            }
            document.getElementById('taskEstimatedHours').value = task.estimated_hours || '';
            // open modal
            const modal = document.getElementById('assignTaskModal');
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function escapeHtml(str){
            if (!str) return '';
            return String(str).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m];});
        }

        function capitalize(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : ''; }

        // Reload tasks after a task is assigned (dashboard.js triggers a reload by default)
        document.addEventListener('DOMContentLoaded', () => {
            loadTasks();
        });
    </script>
</body>
</html>
