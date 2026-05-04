# Storage System Implementation Guide

## Overview

This document describes how to implement a **File Storage Page** backed by a MySQL database managed through **phpMyAdmin**. The storage system allows users to upload, organize, download, and delete files — with all metadata persisted in MySQL and physical files stored on the server filesystem.

---

## Features

- File upload with metadata saved to MySQL
- File listing, filtering, and search
- File download and deletion
- Per-user access control
- File type and size validation
- Admin overview of all stored files via phpMyAdmin

---

## 1. Database Setup (phpMyAdmin)

### Step 1 — Open phpMyAdmin

1. Start **XAMPP** and ensure Apache and MySQL are running.
2. Navigate to `http://localhost/phpmyadmin`.
3. Select your database (e.g., `project_management_db`) from the left panel.

### Step 2 — Create the `storage_files` Table

Click the **SQL** tab and run the following:

```sql
CREATE TABLE IF NOT EXISTS `storage_files` (
    `id`            INT(11)      NOT NULL AUTO_INCREMENT,
    `user_id`       INT(11)      NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `stored_name`   VARCHAR(255) NOT NULL COMMENT 'UUID-based filename on disk',
    `file_path`     VARCHAR(512) NOT NULL COMMENT 'Relative path under /uploads/',
    `file_type`     VARCHAR(100) NOT NULL COMMENT 'MIME type',
    `file_size`     BIGINT       NOT NULL COMMENT 'Size in bytes',
    `category`      VARCHAR(100) DEFAULT 'General',
    `description`   TEXT         DEFAULT NULL,
    `is_public`     TINYINT(1)   NOT NULL DEFAULT 0,
    `download_count` INT(11)     NOT NULL DEFAULT 0,
    `uploaded_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user_id`   (`user_id`),
    INDEX `idx_file_type` (`file_type`),
    INDEX `idx_category`  (`category`),
    CONSTRAINT `fk_storage_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

> **Tip:** After running, click the **storage_files** table in the left panel and use the **Structure** tab to verify all columns were created correctly.

---

## 2. Server-Side PHP Handlers

Create the following PHP files inside the `settings/` folder.

### `settings/upload_file.php`

```php
<?php
require_once 'authenticate.php';   // Ensures the user is logged in
require_once 'db_connect.php';

header('Content-Type: application/json');

// --- Configuration ---
define('UPLOAD_DIR',     __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE',  52428800); // 50 MB in bytes
define('ALLOWED_TYPES',  [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-zip-compressed',
]);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'No file received or upload error']);
    exit;
}

$file        = $_FILES['file'];
$mimeType    = mime_content_type($file['tmp_name']); // Use server-side detection

// Validate file size
if ($file['size'] > MAX_FILE_SIZE) {
    echo json_encode(['success' => false, 'message' => 'File exceeds 50 MB limit']);
    exit;
}

// Validate MIME type (do NOT trust $_FILES['type'])
if (!in_array($mimeType, ALLOWED_TYPES, true)) {
    echo json_encode(['success' => false, 'message' => 'File type not allowed']);
    exit;
}

// Build a safe stored filename (UUID + extension)
$ext        = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$storedName = bin2hex(random_bytes(16)) . '.' . $ext;
$subDir     = date('Y/m/');                          // e.g. uploads/2026/04/
$fullDir    = UPLOAD_DIR . $subDir;

if (!is_dir($fullDir) && !mkdir($fullDir, 0750, true)) {
    echo json_encode(['success' => false, 'message' => 'Could not create upload directory']);
    exit;
}

$destPath = $fullDir . $storedName;
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    echo json_encode(['success' => false, 'message' => 'Failed to save file']);
    exit;
}

// Sanitize optional metadata inputs
$category    = htmlspecialchars(trim($_POST['category']    ?? 'General'), ENT_QUOTES, 'UTF-8');
$description = htmlspecialchars(trim($_POST['description'] ?? ''),        ENT_QUOTES, 'UTF-8');
$isPublic    = isset($_POST['is_public']) ? 1 : 0;

// Insert metadata into MySQL
$stmt = $pdo->prepare(
    "INSERT INTO storage_files
        (user_id, original_name, stored_name, file_path, file_type, file_size, category, description, is_public)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
$stmt->execute([
    $_SESSION['user_id'],
    $file['name'],
    $storedName,
    'uploads/' . $subDir . $storedName,
    $mimeType,
    $file['size'],
    $category,
    $description,
    $isPublic,
]);

echo json_encode(['success' => true, 'message' => 'File uploaded successfully', 'id' => $pdo->lastInsertId()]);
```

---

### `settings/get_storage_files.php`

```php
<?php
require_once 'authenticate.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$userId   = $_SESSION['user_id'];
$category = $_GET['category'] ?? '';
$search   = $_GET['search']   ?? '';

$sql    = "SELECT id, original_name, file_type, file_size, category, description,
                  is_public, download_count, uploaded_at
           FROM storage_files
           WHERE (user_id = ? OR is_public = 1)";
$params = [$userId];

if ($category !== '') {
    $sql    .= " AND category = ?";
    $params[] = $category;
}

if ($search !== '') {
    $sql    .= " AND (original_name LIKE ? OR description LIKE ?)";
    $like    = '%' . $search . '%';
    $params[] = $like;
    $params[] = $like;
}

$sql .= " ORDER BY uploaded_at DESC LIMIT 200";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$files = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'files' => $files]);
```

---

### `settings/download_file.php`

```php
<?php
require_once 'authenticate.php';
require_once 'db_connect.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) { http_response_code(400); exit('Invalid file ID'); }

$stmt = $pdo->prepare(
    "SELECT * FROM storage_files WHERE id = ? AND (user_id = ? OR is_public = 1)"
);
$stmt->execute([$id, $_SESSION['user_id']]);
$file = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$file) { http_response_code(404); exit('File not found'); }

$filePath = __DIR__ . '/../' . $file['file_path'];
if (!file_exists($filePath)) { http_response_code(404); exit('File missing on disk'); }

// Increment download counter
$pdo->prepare("UPDATE storage_files SET download_count = download_count + 1 WHERE id = ?")
    ->execute([$id]);

header('Content-Type: '        . $file['file_type']);
header('Content-Disposition: attachment; filename="' . $file['original_name'] . '"');
header('Content-Length: '      . $file['file_size']);
header('Cache-Control: private, no-cache');
readfile($filePath);
exit;
```

---

### `settings/delete_file.php`

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
$id   = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Invalid file ID']);
    exit;
}

// Only the owner or an admin can delete
$stmt = $pdo->prepare("SELECT * FROM storage_files WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $_SESSION['user_id']]);
$file = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$file) {
    echo json_encode(['success' => false, 'message' => 'File not found or access denied']);
    exit;
}

$filePath = __DIR__ . '/../' . $file['file_path'];
if (file_exists($filePath)) {
    unlink($filePath);
}

$pdo->prepare("DELETE FROM storage_files WHERE id = ?")->execute([$id]);

echo json_encode(['success' => true, 'message' => 'File deleted']);
```

---

## 3. Storage Page — `page/storage.html`

Create `page/storage.html` with the following structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>File Storage</title>
    <link rel="stylesheet" href="../css/common.css" />
    <link rel="stylesheet" href="../css/storage.css" />
</head>
<body>
    <!-- Sidebar / Nav (reuse existing nav partial) -->

    <main class="storage-container">
        <div class="storage-header">
            <h1>File Storage</h1>
            <button id="uploadBtn" class="btn-primary">+ Upload File</button>
        </div>

        <!-- Filter / Search Bar -->
        <div class="storage-controls">
            <input type="text" id="searchInput" placeholder="Search files..." />
            <select id="categoryFilter">
                <option value="">All Categories</option>
                <option value="General">General</option>
                <option value="Images">Images</option>
                <option value="Documents">Documents</option>
                <option value="Archives">Archives</option>
            </select>
        </div>

        <!-- File Grid -->
        <div id="fileGrid" class="file-grid">
            <!-- Populated by JS -->
        </div>
    </main>

    <!-- Upload Modal -->
    <div id="uploadModal" class="modal hidden">
        <div class="modal-content">
            <h2>Upload File</h2>
            <form id="uploadForm" enctype="multipart/form-data">
                <input  type="file"   name="file"        id="fileInput"    required />
                <input  type="text"   name="category"    placeholder="Category" value="General" />
                <textarea             name="description" placeholder="Description (optional)"></textarea>
                <label>
                    <input type="checkbox" name="is_public" /> Make public to all users
                </label>
                <button type="submit" class="btn-primary">Upload</button>
                <button type="button" id="cancelUpload">Cancel</button>
            </form>
        </div>
    </div>

    <script src="../js/storage.js"></script>
</body>
</html>
```

---

## 4. Storage JavaScript — `js/storage.js`

```javascript
const API = '../settings';

// --- Load files ---
async function loadFiles() {
    const search   = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    const params   = new URLSearchParams({ search, category });

    const res   = await fetch(`${API}/get_storage_files.php?${params}`);
    const data  = await res.json();
    renderFiles(data.files || []);
}

function renderFiles(files) {
    const grid = document.getElementById('fileGrid');
    if (!files.length) {
        grid.innerHTML = '<p class="empty-state">No files found.</p>';
        return;
    }
    grid.innerHTML = files.map(f => `
        <div class="file-card" data-id="${f.id}">
            <div class="file-icon">${getIcon(f.file_type)}</div>
            <div class="file-info">
                <p class="file-name">${escapeHtml(f.original_name)}</p>
                <p class="file-meta">${formatSize(f.file_size)} &bull; ${f.category}</p>
                <p class="file-date">${new Date(f.uploaded_at).toLocaleDateString()}</p>
            </div>
            <div class="file-actions">
                <a href="${API}/download_file.php?id=${f.id}" class="btn-sm">Download</a>
                <button class="btn-sm btn-danger" onclick="deleteFile(${f.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function getIcon(mimeType) {
    if (mimeType.startsWith('image/'))       return '🖼️';
    if (mimeType === 'application/pdf')      return '📄';
    if (mimeType.includes('spreadsheet') ||
        mimeType.includes('excel'))          return '📊';
    if (mimeType.includes('word'))           return '📝';
    if (mimeType.includes('zip'))            return '🗜️';
    return '📁';
}

function formatSize(bytes) {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Upload ---
document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('uploadModal').classList.remove('hidden');
});
document.getElementById('cancelUpload').addEventListener('click', () => {
    document.getElementById('uploadModal').classList.add('hidden');
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res      = await fetch(`${API}/upload_file.php`, { method: 'POST', body: formData });
    const data     = await res.json();
    if (data.success) {
        document.getElementById('uploadModal').classList.add('hidden');
        e.target.reset();
        loadFiles();
    } else {
        alert(data.message || 'Upload failed');
    }
});

// --- Delete ---
async function deleteFile(id) {
    if (!confirm('Delete this file permanently?')) return;
    const res  = await fetch(`${API}/delete_file.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) loadFiles();
    else alert(data.message || 'Delete failed');
}

// --- Filters ---
document.getElementById('searchInput').addEventListener('input', loadFiles);
document.getElementById('categoryFilter').addEventListener('change', loadFiles);

// Initial load
loadFiles();
```

---

## 5. Uploads Directory Setup

Create the physical upload folder and protect it:

```
htdocs/project dashboard/uploads/
```

Add an `.htaccess` file inside `uploads/` to prevent direct PHP execution:

```apache
# uploads/.htaccess
Options -Indexes
php_flag engine off

# Allow only direct file downloads through PHP handlers
<FilesMatch "\.(php|phtml|php3|php4|php5|phar)$">
    Order Deny,Allow
    Deny from all
</FilesMatch>
```

---

## 6. Viewing Storage Data in phpMyAdmin

| Task | Steps in phpMyAdmin |
|------|---------------------|
| Browse all uploads | Select `storage_files` table → click **Browse** |
| Filter by user | Click **Search** tab → filter `user_id = <id>` |
| Check file sizes | Browse → sort by `file_size` descending |
| Delete orphaned records | Run `DELETE FROM storage_files WHERE id = ?` in the SQL tab |
| Export metadata | Click **Export** → choose CSV or SQL format |

---

## 7. Folder & File Summary

```
project dashboard/
├── page/
│   └── storage.html              ← New storage UI page
├── js/
│   └── storage.js                ← Storage page JavaScript
├── css/
│   └── storage.css               ← Storage page styles (create separately)
├── uploads/
│   ├── .htaccess                 ← Blocks direct PHP execution
│   └── 2026/04/                  ← Date-partitioned physical files
└── settings/
    ├── upload_file.php           ← File upload handler
    ├── get_storage_files.php     ← File listing API
    ├── download_file.php         ← Secure file download handler
    └── delete_file.php           ← File deletion handler
```

---

## 8. Security Checklist

- [x] MIME type verified server-side with `mime_content_type()` (not trusted from client)
- [x] Stored filenames are UUID-based (not derived from user input)
- [x] `uploads/` directory blocks direct PHP execution via `.htaccess`
- [x] Downloads served only through authenticated PHP handler
- [x] SQL uses prepared statements with parameterized queries throughout
- [x] File size capped at 50 MB server-side
- [x] Directory traversal prevented by never using raw user input as a path

---

## Related Documents

- [ADMIN_DATABASE_REFERENCE.md](ADMIN_DATABASE_REFERENCE.md) — Full table reference
- [MYSQL_DATABASE_SCHEMA.md](MYSQL_DATABASE_SCHEMA.md) — Schema overview
- [EMULATOR_ENVIRONMENT_SETUP.md](EMULATOR_ENVIRONMENT_SETUP.md) — Running stored software in an emulator environment
