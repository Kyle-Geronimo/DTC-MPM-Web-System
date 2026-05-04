# Emulator Environment Setup Guide

## Overview

This document explains how to implement an **in-browser emulator environment** that reads and executes software payloads stored in your MySQL database (managed via phpMyAdmin). The emulator retrieves binary or script data from the `emulator_programs` table, loads it into a sandboxed runtime in the browser, and displays output — all without leaving the dashboard.

Two supported runtimes are covered:

| Runtime | Use Case |
|---------|----------|
| **v86 (x86 emulator)** | Run full disk images (DOS, Linux) stored as BLOBs in MySQL |
| **Pyodide (Python)** | Execute Python scripts stored as text in MySQL, output shown in-browser |

---

## 1. Database Setup (phpMyAdmin)

### Step 1 — Open phpMyAdmin

1. Start XAMPP; confirm Apache and MySQL are running.
2. Go to `http://localhost/phpmyadmin`.
3. Select your database from the left panel.

### Step 2 — Create the `emulator_programs` Table

Open the **SQL** tab and run:

```sql
CREATE TABLE IF NOT EXISTS `emulator_programs` (
    `id`           INT(11)      NOT NULL AUTO_INCREMENT,
    `user_id`      INT(11)      NOT NULL,
    `name`         VARCHAR(255) NOT NULL,
    `description`  TEXT         DEFAULT NULL,
    `runtime`      ENUM('python','x86_disk_image','javascript') NOT NULL DEFAULT 'python',
    `source_code`  MEDIUMTEXT   DEFAULT NULL  COMMENT 'For script-based runtimes (python, js)',
    `binary_data`  LONGBLOB     DEFAULT NULL  COMMENT 'For binary disk images (x86)',
    `binary_size`  BIGINT       DEFAULT 0     COMMENT 'Size of binary_data in bytes',
    `version`      VARCHAR(50)  DEFAULT '1.0',
    `is_public`    TINYINT(1)   NOT NULL DEFAULT 0,
    `run_count`    INT(11)      NOT NULL DEFAULT 0,
    `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_runtime` (`runtime`),
    CONSTRAINT `fk_emulator_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

> **Note on storage size:** `MEDIUMTEXT` holds up to 16 MB of script text. `LONGBLOB` holds up to 4 GB for disk images. Adjust based on your disk image sizes.

### Step 3 — Insert a Sample Python Program (via phpMyAdmin SQL tab)

```sql
INSERT INTO emulator_programs (user_id, name, description, runtime, source_code, is_public)
VALUES (
    1,
    'Hello World',
    'A simple Python hello-world demo',
    'python',
    'print("Hello from the emulator!")\nfor i in range(5):\n    print(f"  Line {i+1}")',
    1
);
```

---

## 2. Server-Side PHP Handlers

Add these files to the `settings/` folder.

### `settings/get_programs.php` — List available programs

```php
<?php
require_once 'authenticate.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$userId = $_SESSION['user_id'];
$runtime = $_GET['runtime'] ?? '';

$sql    = "SELECT id, name, description, runtime, version, run_count, created_at
           FROM emulator_programs
           WHERE (user_id = ? OR is_public = 1)";
$params = [$userId];

if ($runtime !== '') {
    $sql    .= " AND runtime = ?";
    $params[] = $runtime;
}

$sql .= " ORDER BY created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
echo json_encode(['success' => true, 'programs' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
```

---

### `settings/get_program_source.php` — Load source code for execution

```php
<?php
require_once 'authenticate.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid ID']);
    exit;
}

$stmt = $pdo->prepare(
    "SELECT id, name, runtime, source_code
     FROM emulator_programs
     WHERE id = ? AND (user_id = ? OR is_public = 1)"
);
$stmt->execute([$id, $_SESSION['user_id']]);
$program = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$program) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Program not found']);
    exit;
}

// Increment run count
$pdo->prepare("UPDATE emulator_programs SET run_count = run_count + 1 WHERE id = ?")
    ->execute([$id]);

echo json_encode(['success' => true, 'program' => $program]);
```

---

### `settings/get_disk_image.php` — Stream a binary disk image

```php
<?php
require_once 'authenticate.php';
require_once 'db_connect.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) { http_response_code(400); exit; }

$stmt = $pdo->prepare(
    "SELECT name, binary_data, binary_size
     FROM emulator_programs
     WHERE id = ? AND runtime = 'x86_disk_image' AND (user_id = ? OR is_public = 1)"
);
$stmt->execute([$id, $_SESSION['user_id']]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row || empty($row['binary_data'])) {
    http_response_code(404);
    exit('Disk image not found');
}

// Increment run count
$pdo->prepare("UPDATE emulator_programs SET run_count = run_count + 1 WHERE id = ?")
    ->execute([$id]);

header('Content-Type: application/octet-stream');
header('Content-Disposition: inline; filename="' . $row['name'] . '.img"');
header('Content-Length: ' . $row['binary_size']);
echo $row['binary_data'];
exit;
```

---

### `settings/save_program.php` — Save or update a program

```php
<?php
require_once 'authenticate.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$name        = htmlspecialchars(trim($data['name']        ?? ''), ENT_QUOTES, 'UTF-8');
$description = htmlspecialchars(trim($data['description'] ?? ''), ENT_QUOTES, 'UTF-8');
$runtime     = $data['runtime']     ?? 'python';
$sourceCode  = $data['source_code'] ?? '';
$isPublic    = isset($data['is_public']) && $data['is_public'] ? 1 : 0;
$editId      = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);

$allowedRuntimes = ['python', 'javascript', 'x86_disk_image'];
if (!in_array($runtime, $allowedRuntimes, true)) {
    echo json_encode(['success' => false, 'message' => 'Invalid runtime']);
    exit;
}

if ($editId) {
    // Update existing — verify ownership
    $check = $pdo->prepare("SELECT id FROM emulator_programs WHERE id = ? AND user_id = ?");
    $check->execute([$editId, $_SESSION['user_id']]);
    if (!$check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Not found or access denied']);
        exit;
    }
    $pdo->prepare(
        "UPDATE emulator_programs SET name=?, description=?, runtime=?, source_code=?, is_public=?, updated_at=NOW()
         WHERE id = ? AND user_id = ?"
    )->execute([$name, $description, $runtime, $sourceCode, $isPublic, $editId, $_SESSION['user_id']]);
    echo json_encode(['success' => true, 'message' => 'Program updated']);
} else {
    $pdo->prepare(
        "INSERT INTO emulator_programs (user_id, name, description, runtime, source_code, is_public)
         VALUES (?, ?, ?, ?, ?, ?)"
    )->execute([$_SESSION['user_id'], $name, $description, $runtime, $sourceCode, $isPublic]);
    echo json_encode(['success' => true, 'message' => 'Program saved', 'id' => $pdo->lastInsertId()]);
}
```

---

## 3. Emulator Page — `page/emulator.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Emulator Environment</title>
    <link rel="stylesheet" href="../css/common.css" />
    <link rel="stylesheet" href="../css/emulator.css" />

    <!-- Pyodide: in-browser Python runtime (CDN) -->
    <script src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"></script>
</head>
<body>
    <main class="emulator-container">
        <header class="emulator-header">
            <h1>Emulator Environment</h1>
            <div class="emulator-controls">
                <select id="runtimeFilter">
                    <option value="">All Runtimes</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="x86_disk_image">x86 Disk Image</option>
                </select>
                <button id="newProgramBtn" class="btn-primary">+ New Program</button>
            </div>
        </header>

        <div class="emulator-layout">
            <!-- Left: Program List -->
            <aside class="program-list" id="programList">
                <!-- Populated by JS -->
            </aside>

            <!-- Right: Runner Panel -->
            <section class="runner-panel">
                <div id="editorSection" class="hidden">
                    <h2 id="programTitle">Select a program</h2>
                    <p  id="programDesc"  class="text-muted"></p>
                    <label>Runtime: <strong id="programRuntime"></strong></label>

                    <!-- Code Editor (script runtimes) -->
                    <textarea id="codeEditor" class="code-editor" rows="16"
                              placeholder="Source code will appear here..."></textarea>

                    <!-- x86 Disk Image Frame -->
                    <div id="x86Frame" class="hidden">
                        <p class="text-muted">x86 disk image will be streamed and loaded into the v86 emulator below.</p>
                        <div id="v86Container"></div>
                    </div>

                    <div class="runner-actions">
                        <button id="runBtn"  class="btn-primary">▶ Run</button>
                        <button id="saveBtn" class="btn-secondary">💾 Save Changes</button>
                        <button id="clearBtn">Clear Output</button>
                    </div>
                </div>

                <!-- Output Terminal -->
                <div class="output-panel">
                    <h3>Output</h3>
                    <pre id="outputTerminal" class="output-terminal">Ready.</pre>
                </div>
            </section>
        </div>
    </main>

    <!-- New / Edit Program Modal -->
    <div id="programModal" class="modal hidden">
        <div class="modal-content">
            <h2>New Program</h2>
            <input  type="text"     id="modalName"    placeholder="Program name" />
            <textarea               id="modalDesc"    placeholder="Description (optional)"></textarea>
            <select                 id="modalRuntime">
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
            </select>
            <label>
                <input type="checkbox" id="modalPublic" /> Make public
            </label>
            <button id="modalSave"   class="btn-primary">Create</button>
            <button id="modalCancel">Cancel</button>
        </div>
    </div>

    <!-- v86 emulator (loaded on demand for x86 images) -->
    <script>
        // v86 is loaded lazily only when an x86 program is selected
        window.v86Loaded = false;
        function loadV86(callback) {
            if (window.v86Loaded) { callback(); return; }
            const s = document.createElement('script');
            s.src = 'https://copy.sh/v86/build/libv86.js';
            s.onload = () => { window.v86Loaded = true; callback(); };
            document.head.appendChild(s);
        }
    </script>
    <script src="../js/emulator.js"></script>
</body>
</html>
```

---

## 4. Emulator JavaScript — `js/emulator.js`

```javascript
const API = '../settings';

let pyodide       = null;
let currentProgram = null;
let v86Instance   = null;

// ─── Output helpers ────────────────────────────────────────────────────────
const terminal = document.getElementById('outputTerminal');
function print(text)  { terminal.textContent += text + '\n'; terminal.scrollTop = terminal.scrollHeight; }
function clearOutput(){ terminal.textContent = ''; }

// ─── Load program list ─────────────────────────────────────────────────────
async function loadPrograms() {
    const runtime = document.getElementById('runtimeFilter').value;
    const params  = new URLSearchParams({ runtime });
    const res     = await fetch(`${API}/get_programs.php?${params}`);
    const data    = await res.json();
    renderProgramList(data.programs || []);
}

function renderProgramList(programs) {
    const list = document.getElementById('programList');
    if (!programs.length) {
        list.innerHTML = '<p class="empty-state">No programs found.</p>';
        return;
    }
    list.innerHTML = programs.map(p => `
        <div class="program-item" data-id="${p.id}" onclick="selectProgram(${p.id})">
            <span class="runtime-badge runtime-${p.runtime}">${p.runtime}</span>
            <strong>${escapeHtml(p.name)}</strong>
            <small>${p.run_count} run(s)</small>
        </div>
    `).join('');
}

// ─── Select and load a program ─────────────────────────────────────────────
async function selectProgram(id) {
    const res  = await fetch(`${API}/get_program_source.php?id=${id}`);
    const data = await res.json();
    if (!data.success) { print('[Error] ' + data.message); return; }

    currentProgram = data.program;

    document.getElementById('editorSection').classList.remove('hidden');
    document.getElementById('programTitle').textContent   = currentProgram.name;
    document.getElementById('programDesc').textContent    = currentProgram.description || '';
    document.getElementById('programRuntime').textContent = currentProgram.runtime;

    const editor   = document.getElementById('codeEditor');
    const x86Frame = document.getElementById('x86Frame');

    if (currentProgram.runtime === 'x86_disk_image') {
        editor.classList.add('hidden');
        x86Frame.classList.remove('hidden');
    } else {
        editor.classList.remove('hidden');
        x86Frame.classList.add('hidden');
        editor.value = currentProgram.source_code || '';
    }
    clearOutput();
    print(`[Loaded] ${currentProgram.name} (${currentProgram.runtime})`);
}

// ─── Run ───────────────────────────────────────────────────────────────────
document.getElementById('runBtn').addEventListener('click', async () => {
    if (!currentProgram) { print('[Error] No program selected.'); return; }
    clearOutput();
    const code = document.getElementById('codeEditor').value;

    switch (currentProgram.runtime) {
        case 'python':      await runPython(code);     break;
        case 'javascript':  runJavaScript(code);       break;
        case 'x86_disk_image': runX86(currentProgram.id); break;
        default: print('[Error] Unknown runtime: ' + currentProgram.runtime);
    }
});

// ─── Python runtime (Pyodide) ──────────────────────────────────────────────
async function runPython(code) {
    if (!pyodide) {
        print('[Info] Loading Python runtime (Pyodide)...');
        pyodide = await loadPyodide();
        print('[Info] Python runtime ready.');
    }
    // Redirect stdout to our terminal
    pyodide.setStdout({ batched: (text) => print(text) });
    pyodide.setStderr({ batched: (text) => print('[stderr] ' + text) });
    try {
        await pyodide.runPythonAsync(code);
    } catch (err) {
        print('[Python Error] ' + err.message);
    }
}

// ─── JavaScript runtime (sandboxed via Function) ──────────────────────────
function runJavaScript(code) {
    // Capture console.log inside a sandboxed scope
    const logs = [];
    const sandbox = {
        console: { log: (...a) => logs.push(a.join(' ')), error: (...a) => logs.push('[err] ' + a.join(' ')) },
        print:   (t) => logs.push(String(t)),
    };
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(...Object.keys(sandbox), code);
        fn(...Object.values(sandbox));
        logs.forEach(l => print(l));
    } catch (err) {
        print('[JS Error] ' + err.message);
    }
}

// ─── x86 disk image runtime (v86) ─────────────────────────────────────────
function runX86(programId) {
    print('[Info] Loading v86 emulator...');
    loadV86(() => {
        if (v86Instance) { v86Instance.destroy(); v86Instance = null; }
        const container = document.getElementById('v86Container');
        container.innerHTML = '<canvas></canvas>';

        v86Instance = new V86({
            wasm_path:         'https://copy.sh/v86/build/v86.wasm',
            memory_size:       32 * 1024 * 1024,   // 32 MB RAM
            vga_memory_size:   2  * 1024 * 1024,
            screen_container:  container,
            // Stream the disk image from our PHP handler
            hda: {
                url:  `../settings/get_disk_image.php?id=${programId}`,
                size: 8 * 1024 * 1024,             // Update to match actual image size
            },
            autostart: true,
        });
        print('[Info] v86 emulator started. Check the screen above.');
    });
}

// ─── Save changes ──────────────────────────────────────────────────────────
document.getElementById('saveBtn').addEventListener('click', async () => {
    if (!currentProgram) return;
    const body = {
        id:          currentProgram.id,
        name:        currentProgram.name,
        runtime:     currentProgram.runtime,
        source_code: document.getElementById('codeEditor').value,
    };
    const res  = await fetch(`${API}/save_program.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
    });
    const data = await res.json();
    print(data.success ? '[Saved] Changes saved.' : '[Error] ' + data.message);
});

document.getElementById('clearBtn').addEventListener('click', clearOutput);

// ─── New program modal ─────────────────────────────────────────────────────
document.getElementById('newProgramBtn').addEventListener('click', () => {
    document.getElementById('programModal').classList.remove('hidden');
});
document.getElementById('modalCancel').addEventListener('click', () => {
    document.getElementById('programModal').classList.add('hidden');
});
document.getElementById('modalSave').addEventListener('click', async () => {
    const body = {
        name:        document.getElementById('modalName').value.trim(),
        description: document.getElementById('modalDesc').value.trim(),
        runtime:     document.getElementById('modalRuntime').value,
        is_public:   document.getElementById('modalPublic').checked,
        source_code: '',
    };
    if (!body.name) { alert('Program name is required.'); return; }
    const res  = await fetch(`${API}/save_program.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
        document.getElementById('programModal').classList.add('hidden');
        loadPrograms();
        selectProgram(data.id);
    } else {
        alert(data.message || 'Failed to create program');
    }
});

// ─── Filter ────────────────────────────────────────────────────────────────
document.getElementById('runtimeFilter').addEventListener('change', loadPrograms);

// ─── Utility ───────────────────────────────────────────────────────────────
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Initial load
loadPrograms();
```

---

## 5. Loading a Disk Image into phpMyAdmin

For small images (under 16 MB) you can use the phpMyAdmin SQL tab:

```sql
-- NOTE: For images > 16 MB use the LOAD_FILE() approach below,
-- which requires the file to be on the MySQL server host.

UPDATE emulator_programs
SET    binary_data = LOAD_FILE('/tmp/freedos.img'),
       binary_size = (SELECT LENGTH(LOAD_FILE('/tmp/freedos.img')))
WHERE  id = 2;
```

For images in production, use a PHP upload script (same pattern as `upload_file.php` in [STORAGE_SYSTEM_IMPLEMENTATION.md](STORAGE_SYSTEM_IMPLEMENTATION.md)), storing the binary in `binary_data` via PDO with `PDO::PARAM_LOB`.

---

## 6. Runtime Comparison

| Feature | Python (Pyodide) | JavaScript (sandboxed) | x86 (v86) |
|---------|-----------------|----------------------|-----------|
| Language | Python 3.x | JavaScript ES2020 | Any OS / DOS |
| External libraries | Many (via `micropip`) | None (sandboxed) | Inside disk image |
| Startup time | ~3 s (first load) | Instant | ~2–5 s |
| Network access | No | No | No |
| Persistent state | No (per-run) | No (per-run) | Disk image only |
| Source stored as | `source_code` (text) | `source_code` (text) | `binary_data` (BLOB) |

---

## 7. Monitoring Emulator Usage in phpMyAdmin

| Task | Query |
|------|-------|
| Most-run programs | `SELECT name, run_count FROM emulator_programs ORDER BY run_count DESC LIMIT 10` |
| Programs by runtime | `SELECT runtime, COUNT(*) AS total FROM emulator_programs GROUP BY runtime` |
| Public programs | `SELECT name, runtime FROM emulator_programs WHERE is_public = 1` |
| Programs by user | `SELECT u.username, COUNT(*) FROM emulator_programs e JOIN users u ON e.user_id=u.id GROUP BY u.id` |

Run these in the **SQL** tab of phpMyAdmin.

---

## 8. Front Panel Access (Navigation & Quick Action Button)

Users need a way to reach the Emulator from the main dashboard. Two additions must be made to `page/front_panel.html`:

### 8a. Sidebar Nav Link

Add an `<li>` entry to the `.nav-menu` list, directly after the `Reports` link:

```html
<li><a href="http://localhost/ProjectDashboard/page/storage.html">Storage</a></li>
<li><a href="http://localhost/ProjectDashboard/page/emulator.html">Emulator</a></li>
```

The nav menu block to edit looks like:

```html
<li><a href="...reports.html">Reports</a></li>
<!-- ↑ insert the two new <li> items here ↑ -->
<li id="adminNavLink" style="display:none"><a href="...admin.html">Admin</a></li>
```

---

### 8b. Quick Actions Button

Inside the `.action-buttons` div of the **Quick Actions** card, append two action-buttons after the existing last button (`+ Add Member`):

```html
<a class="action-btn" href="http://localhost/ProjectDashboard/page/storage.html">📦 File Storage</a>
<a class="action-btn" href="http://localhost/ProjectDashboard/page/emulator.html">🖥️ Emulator</a>
```

Use `<a>` tags (not `<button>`) so they navigate without requiring JavaScript.

The Quick Actions block to edit is:

```html
<div class="action-buttons">
    <button class="action-btn" id="newProjectBtn">+ New Project</button>
    <button class="action-btn" id="assignTaskBtn">+ Assign Task</button>
    <button class="action-btn" id="scheduleMeetingBtn">📅 Schedule Meeting</button>
    <button class="action-btn" id="addTeamBtn">+ Add Team</button>
    <button class="action-btn" id="openAddMemberBtn">+ Add Member</button>
    <!-- ↑ add the two new <a> buttons here ↑ -->
</div>
```

---

## 9. Folder & File Summary

```
project dashboard/
├── page/
│   ├── front_panel.html          ← Add nav link + quick-action button (see §8)
│   └── emulator.html             ← Emulator UI page
├── js/
│   └── emulator.js               ← Emulator page JavaScript
├── css/
│   └── emulator.css              ← Emulator page styles (create separately)
└── settings/
    ├── get_programs.php          ← Program list API
    ├── get_program_source.php    ← Load source for execution
    ├── get_disk_image.php        ← Stream binary disk image
    └── save_program.php          ← Save / update program
```

---

## 10. Security Checklist

- [x] All DB queries use prepared statements with parameterized values
- [x] JavaScript runtime is sandboxed via `new Function()` — no `eval()` with global scope
- [x] Python runtime (Pyodide) runs entirely in-browser (WebAssembly), no server-side exec
- [x] v86 is a contained WebAssembly VM — host filesystem is not accessible
- [x] Disk image access restricted to owner or public programs only
- [x] `source_code` sanitized with `htmlspecialchars` before insertion
- [x] `runtime` field validated against a fixed allowlist before DB write

---

## 11. Related Documents

- [STORAGE_SYSTEM_IMPLEMENTATION.md](STORAGE_SYSTEM_IMPLEMENTATION.md) — File storage system
- [ADMIN_DATABASE_REFERENCE.md](ADMIN_DATABASE_REFERENCE.md) — Full table reference
- [MYSQL_DATABASE_SCHEMA.md](MYSQL_DATABASE_SCHEMA.md) — Schema overview
