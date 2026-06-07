'use strict';

const STORAGE_API = '../settings';

// ── State ─────────────────────────────────────────────────────────────────
let pendingDeleteId   = null;
let currentFolderId   = null;  // null = root view (shows folders + root files)
let currentFolderName = '';
let allFolders        = [];

// ── DOM refs ──────────────────────────────────────────────────────────────
const fileGrid           = document.getElementById('fileGrid');
const searchInput        = document.getElementById('storageSearch');
const categoryFilter     = document.getElementById('categoryFilter');
const uploadBtn          = document.getElementById('uploadBtn');
const newFolderBtn       = document.getElementById('newFolderBtn');
const uploadModal        = document.getElementById('uploadModal');
const closeUploadModal   = document.getElementById('closeUploadModal');
const cancelUploadBtn    = document.getElementById('cancelUploadBtn');
const uploadForm         = document.getElementById('uploadForm');
const chooseFilesBtn     = document.getElementById('chooseFilesBtn');
const chooseFolderBtn    = document.getElementById('chooseFolderBtn');
const fileInputFiles     = document.getElementById('fileInputFiles');
const fileInputFolder    = document.getElementById('fileInputFolder');
const selectedFilesInfo  = document.getElementById('selectedFilesInfo');
const uploadProgressWrap = document.getElementById('uploadProgressWrap');
const uploadProgressBar  = document.getElementById('uploadProgressBar');
const uploadProgressText = document.getElementById('uploadProgressText');
const deleteModal        = document.getElementById('deleteModal');
const deleteFileName     = document.getElementById('deleteFileName');
const confirmDeleteBtn   = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn    = document.getElementById('cancelDeleteBtn');
const newFolderModal     = document.getElementById('newFolderModal');
const newFolderForm      = document.getElementById('newFolderForm');
const closeNewFolderModal= document.getElementById('closeNewFolderModal');
const cancelNewFolderBtn = document.getElementById('cancelNewFolderBtn');
const folderBreadcrumb   = document.getElementById('folderBreadcrumb');
const breadcrumbRoot     = document.getElementById('breadcrumbRoot');
const breadcrumbCurrent  = document.getElementById('breadcrumbCurrent');
const uploadFolderSelect = document.getElementById('uploadFolder');

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = message;
    container.appendChild(t);
    setTimeout(() => { t.classList.add('removing'); setTimeout(() => t.remove(), 300); }, 3500);
}

// ── Helpers ───────────────────────────────────────────────────────────────
function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

function formatSize(bytes) {
    bytes = parseInt(bytes, 10) || 0;
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
}

function formatDate(str) {
    if (!str) return '';
    return new Date(str).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function fileIcon(mimeType) {
    if (!mimeType) return '📁';
    if (mimeType.startsWith('image/'))                                   return '🖼️';
    if (mimeType === 'application/pdf')                                  return '📄';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('word'))                                       return '📝';
    if (mimeType.includes('zip'))                                        return '🗜️';
    if (mimeType.startsWith('text/'))                                    return '📃';
    return '📁';
}

/**
 * Returns the emulator runtime key for a filename, or null if not runnable.
 * .py → python | .js → javascript | .img/.iso/.bin → x86_disk_image
 */
function runnableRuntime(filename) {
    const ext = (filename || '').split('.').pop().toLowerCase();
    if (ext === 'py')                            return 'python';
    if (ext === 'js')                            return 'javascript';
    if (['img', 'iso', 'bin'].includes(ext))     return 'x86_disk_image';
    return null;
}

// ── Load & render ─────────────────────────────────────────────────────────
async function loadFolders() {
    try {
        const res  = await fetch(`${STORAGE_API}/get_folders.php`);
        const data = await res.json();
        allFolders = data.folders || [];
        populateFolderDropdown();
    } catch (_) {
        allFolders = [];
    }
}

function populateFolderDropdown() {
    if (!uploadFolderSelect) return;
    // keep the first "No folder" option, replace the rest
    uploadFolderSelect.innerHTML = '<option value="">— No folder (root) —</option>';
    allFolders.forEach(f => {
        const opt = document.createElement('option');
        opt.value       = f.id;
        opt.textContent = f.name;
        uploadFolderSelect.appendChild(opt);
    });
    // pre-select current folder when inside one
    if (currentFolderId) uploadFolderSelect.value = currentFolderId;
}

async function loadFiles() {
    fileGrid.innerHTML = '<div class="loading-message">Loading…</div>';
    const params = new URLSearchParams({ search: searchInput.value.trim(), category: categoryFilter.value });
    if (currentFolderId !== null) {
        params.set('folder_id', currentFolderId);
    } else {
        // root view: request only files with no folder
        params.set('folder_id', 'root');
    }

    try {
        const [filesRes, foldersRes] = await Promise.all([
            fetch(`${STORAGE_API}/get_storage_files.php?${params}`),
            currentFolderId === null ? fetch(`${STORAGE_API}/get_folders.php`) : Promise.resolve(null),
        ]);
        const filesData   = await filesRes.json();
        if (!filesData.success) throw new Error(filesData.message || 'Load failed');

        if (foldersRes) {
            const fd = await foldersRes.json();
            allFolders = fd.folders || [];
            populateFolderDropdown();
        }

        const files   = filesData.files   || [];
        const folders = currentFolderId === null ? allFolders : [];
        render(folders, files);
        updateStats(files);
    } catch (err) {
        fileGrid.innerHTML = `<div class="empty-state">⚠️ Could not load: ${escapeHtml(err.message)}</div>`;
    }
}

function updateStats(files) {
    document.getElementById('statTotalFiles').textContent  = files.length;
    document.getElementById('statTotalSize').textContent   = formatSize(files.reduce((a, f) => a + (parseInt(f.file_size, 10) || 0), 0));
    document.getElementById('statPublicFiles').textContent = files.filter(f => f.is_public).length;
    document.getElementById('statDownloads').textContent   = files.reduce((a, f) => a + (parseInt(f.download_count, 10) || 0), 0);
}

function render(folders, files) {
    if (!folders.length && !files.length) {
        fileGrid.innerHTML = '<div class="empty-state">📭 ' + (currentFolderId ? 'This folder is empty.' : 'No files yet. Upload one to get started!') + '</div>';
        return;
    }

    const folderCards = folders.map(f => `
        <div class="folder-card" data-folder-id="${f.id}">
            <div class="folder-card__icon">📁</div>
            <div class="folder-card__info">
                <p class="folder-card__name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</p>
                <p class="folder-card__meta">${f.file_count} file${f.file_count !== 1 ? 's' : ''}${f.is_public ? ' &bull; <span class="file-badge file-badge--public">Public</span>' : ''}</p>
                ${f.description ? `<p class="folder-card__desc">${escapeHtml(f.description)}</p>` : ''}
            </div>
            <div class="folder-card__actions">
                <button class="btn-sm btn-danger" data-delete-folder-id="${f.id}" data-delete-folder-name="${escapeHtml(f.name)}" title="Delete folder">🗑</button>
            </div>
        </div>
    `).join('');

    const fileCards = files.map(f => `
        <div class="file-card" data-id="${f.id}">
            <div class="file-card__icon">${fileIcon(f.file_type)}</div>
            <div class="file-card__info">
                <p class="file-card__name" title="${escapeHtml(f.original_name)}">${escapeHtml(f.original_name)}</p>
                <p class="file-card__meta">
                    <span class="file-badge">${escapeHtml(f.category || 'General')}</span>
                    <span>${formatSize(f.file_size)}</span>
                    ${f.is_public ? '<span class="file-badge file-badge--public">Public</span>' : ''}
                </p>
                <p class="file-card__date">${formatDate(f.uploaded_at)} &bull; ${f.download_count} download${f.download_count !== 1 ? 's' : ''}</p>
                ${f.description ? `<p class="file-card__desc">${escapeHtml(f.description)}</p>` : ''}
            </div>
            <div class="file-card__actions">
                ${runnableRuntime(f.original_name) ? `<a class="btn-sm btn-run" href="../page/emulator.html?storage_id=${f.id}" title="Run in Emulator">▶ Run</a>` : ''}
                <button class="btn-sm btn-view" data-view-id="${f.id}" data-view-name="${escapeHtml(f.original_name)}" data-view-mime="${escapeHtml(f.file_type)}">👁 View</button>
                <a class="btn-sm btn-primary" href="${STORAGE_API}/download_file.php?id=${f.id}" download>⬇ Download</a>
                <button class="btn-sm btn-danger" data-delete-id="${f.id}" data-delete-name="${escapeHtml(f.original_name)}">🗑 Delete</button>
            </div>
        </div>
    `).join('');

    fileGrid.innerHTML = folderCards + fileCards;

    // folder open
    fileGrid.querySelectorAll('[data-folder-id]').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('button')) return; // don't open on delete click
            openFolder(parseInt(card.dataset.folderId, 10), card.querySelector('.folder-card__name').textContent);
        });
    });
    // folder delete
    fileGrid.querySelectorAll('[data-delete-folder-id]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            openDeleteFolderModal(parseInt(btn.dataset.deleteFolderId, 10), btn.dataset.deleteFolderName);
        });
    });
    // file delete
    fileGrid.querySelectorAll('[data-delete-id]').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.deleteId, 10), btn.dataset.deleteName));
    });
    // file view
    fileGrid.querySelectorAll('[data-view-id]').forEach(btn => {
        btn.addEventListener('click', () => openPreview(parseInt(btn.dataset.viewId, 10), btn.dataset.viewName, btn.dataset.viewMime));
    });
}

function openFolder(id, name) {
    currentFolderId   = id;
    currentFolderName = name;
    breadcrumbCurrent.textContent = name;
    folderBreadcrumb.style.display = 'flex';
    loadFiles();
}

breadcrumbRoot.addEventListener('click', () => {
    currentFolderId   = null;
    currentFolderName = '';
    folderBreadcrumb.style.display = 'none';
    loadFiles();
});

// ── Folder delete ─────────────────────────────────────────────────────────
let pendingDeleteFolderId = null;

function openDeleteFolderModal(id, name) {
    pendingDeleteFolderId = id;
    // reuse delete modal with different text
    deleteFileName.textContent = name + ' (folder)';
    deleteModal.querySelector('p').textContent =
        `Delete folder "${name}"? Files inside will be moved back to root. This cannot be undone.`;
    deleteModal._mode = 'folder';
    deleteModal.style.display = 'flex';
}

function openDeleteModal(id, name) {
    pendingDeleteId = id;
    deleteFileName.textContent = name;
    deleteModal.querySelector('p').textContent =
        `Are you sure you want to permanently delete this file? This cannot be undone.`;
    deleteModal._mode = 'file';
    deleteModal.style.display = 'flex';
}

// ── New Folder ────────────────────────────────────────────────────────────
newFolderBtn.addEventListener('click', () => {
    newFolderForm.reset();
    newFolderModal.style.display = 'flex';
});
function closeNewFolder() { newFolderModal.style.display = 'none'; }
closeNewFolderModal.addEventListener('click', closeNewFolder);
cancelNewFolderBtn.addEventListener('click', closeNewFolder);
newFolderModal.addEventListener('click', e => { if (e.target === newFolderModal) closeNewFolder(); });

newFolderForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name        = document.getElementById('folderName').value.trim();
    const description = document.getElementById('folderDescription').value.trim();
    const isPublic    = document.getElementById('folderPublic').checked;
    if (!name) { showToast('Folder name is required.', 'error'); return; }

    const submitBtn = newFolderForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
        const res  = await fetch(`${STORAGE_API}/create_folder.php`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, is_public: isPublic }),
        });
        const data = await res.json();
        if (data.success) {
            showToast('Folder created.', 'success');
            closeNewFolder();
            loadFiles();
        } else {
            showToast(data.message || 'Failed to create folder.', 'error');
        }
    } catch (_) {
        showToast('Request failed.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

// ── Preview ───────────────────────────────────────────────────────────────
const previewModal       = document.getElementById('previewModal');
const previewTitle       = document.getElementById('previewTitle');
const previewBody        = document.getElementById('previewBody');
const previewDownloadBtn = document.getElementById('previewDownloadBtn');
const closePreviewModal  = document.getElementById('closePreviewModal');
const cancelPreviewBtn   = document.getElementById('cancelPreviewBtn');

function isViewableText(mime) {
    if (!mime) return false;
    return mime.startsWith('text/') ||
        ['application/json', 'application/javascript',
         'application/xml', 'application/x-python-code'].includes(mime);
}

function isImage(mime) { return mime && mime.startsWith('image/'); }
function isPdf(mime)   { return mime === 'application/pdf'; }

async function openPreview(id, name, mime) {
    previewTitle.textContent = '📄 ' + name;
    previewBody.innerHTML    = '<div class="preview-loading">Loading…</div>';
    previewDownloadBtn.href  = `${STORAGE_API}/download_file.php?id=${id}`;
    previewDownloadBtn.setAttribute('download', name);
    previewModal.style.display = 'flex';

    const url = `${STORAGE_API}/download_file.php?id=${id}&inline=1`;

    try {
        if (isImage(mime)) {
            previewBody.innerHTML = `<div class="preview-image-wrap"><img src="${url}" alt="${escapeHtml(name)}" class="preview-image"></div>`;
        } else if (isPdf(mime)) {
            previewBody.innerHTML = `<iframe src="${url}" class="preview-iframe" title="${escapeHtml(name)}"></iframe>`;
        } else if (isViewableText(mime)) {
            const res  = await fetch(url);
            const text = await res.text();
            const lang = mimeToLang(mime, name);
            previewBody.innerHTML = `<pre class="preview-code preview-code--${lang}"><code>${escapeHtml(text)}</code></pre>`;
        } else {
            previewBody.innerHTML = `
                <div class="preview-unsupported">
                    <span style="font-size:48px;">📁</span>
                    <p>Preview not available for <strong>${escapeHtml(mime || 'this file type')}</strong>.</p>
                    <p>Use the Download button to open it.</p>
                </div>`;
        }
    } catch (err) {
        previewBody.innerHTML = `<div class="preview-unsupported">⚠️ Failed to load preview: ${escapeHtml(err.message)}</div>`;
    }
}

function mimeToLang(mime, name) {
    if (!mime) return 'text';
    if (mime.includes('json'))       return 'json';
    if (mime.includes('javascript')) return 'js';
    if (mime.includes('python') || (name || '').endsWith('.py')) return 'python';
    if (mime.includes('html'))       return 'html';
    if (mime.includes('css'))        return 'css';
    if (mime.includes('xml'))        return 'xml';
    return 'text';
}

function closePreview() { previewModal.style.display = 'none'; previewBody.innerHTML = ''; }
closePreviewModal.addEventListener('click', closePreview);
cancelPreviewBtn.addEventListener('click', closePreview);
previewModal.addEventListener('click', e => { if (e.target === previewModal) closePreview(); });

// ── Upload ────────────────────────────────────────────────────────────────
uploadBtn.addEventListener('click', async () => {
    uploadForm.reset();
    uploadProgressWrap.style.display = 'none';
    // refresh folder list so the dropdown is up-to-date
    try { await loadFolders(); } catch (_) { /* ignore */ }
    // pre-select current folder (if inside one)
    if (uploadFolderSelect) {
        // prefer currentFolderId, else select user's personal folder (if any), else keep placeholder
        if (currentFolderId) {
            uploadFolderSelect.value = currentFolderId;
        } else {
            // find a folder owned by user (get_folders returns user-owned first)
            const opts = Array.from(uploadFolderSelect.options).filter(o => o.value);
            // try to find an option with "My Files" or "My" in name, otherwise pick first option
            const myOpt = opts.find(o => /my files|my folder|personal/i.test(o.text));
            if (myOpt) uploadFolderSelect.value = myOpt.value;
            else if (opts.length) uploadFolderSelect.value = opts[0].value;
            else uploadFolderSelect.value = '';
        }
    }
    // clear selected files info
    if (selectedFilesInfo) selectedFilesInfo.textContent = 'No files selected';
    if (fileInputFiles) fileInputFiles.value = null;
    if (fileInputFolder) fileInputFolder.value = null;
    uploadModal.style.display = 'flex';
});

// File chooser buttons
if (chooseFilesBtn && fileInputFiles) {
    chooseFilesBtn.addEventListener('click', () => fileInputFiles.click());
    fileInputFiles.addEventListener('change', () => updateSelectedInfo());
}
if (chooseFolderBtn && fileInputFolder) {
    chooseFolderBtn.addEventListener('click', () => fileInputFolder.click());
    fileInputFolder.addEventListener('change', () => updateSelectedInfo());
}

function updateSelectedInfo() {
    const a = fileInputFiles ? Array.from(fileInputFiles.files || []) : [];
    const b = fileInputFolder ? Array.from(fileInputFolder.files || []) : [];
    const all = a.concat(b);
    if (!selectedFilesInfo) return;
    if (!all.length) {
        selectedFilesInfo.textContent = 'No files selected';
        return;
    }
    const names = all.slice(0, 5).map(f => f.name.replace(/^.*[\\/]/, ''));
    selectedFilesInfo.textContent = `${all.length} file${all.length !== 1 ? 's' : ''} selected — ${names.join(', ')}${all.length > 5 ? ', …' : ''}`;
}

function closeUpload() { uploadModal.style.display = 'none'; }
closeUploadModal.addEventListener('click', closeUpload);
cancelUploadBtn.addEventListener('click', closeUpload);
uploadModal.addEventListener('click', e => { if (e.target === uploadModal) closeUpload(); });

uploadForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
        // gather files from any file inputs inside the form (robust if elements are missing)
        const fileInputs = Array.from(uploadForm.querySelectorAll('input[type="file"]'));
        let files = [];
        fileInputs.forEach(fi => { files = files.concat(Array.from(fi.files || [])); });
        if (!files.length) {
            showToast('Please choose a file or folder.', 'error');
            return;
        }

    // Prepare metadata fields that apply to all files
    const category    = uploadForm.querySelector('#fileCategory').value;
    let folder_id     = (uploadForm.querySelector('#uploadFolder') && uploadForm.querySelector('#uploadFolder').value) || '';
    // If user uploaded a folder (webkitRelativePath present) and didn't pick a destination,
    // auto-create a storage folder with the folder's top-level name and use it.
    if (!folder_id) {
        const folderFiles = Array.from(files).filter(f => (f.webkitRelativePath || '').includes('/'));
        if (folderFiles.length) {
            // derive folder name from first file's top-level directory
            const rel = folderFiles[0].webkitRelativePath || folderFiles[0].name;
            const top = rel.split('/')[0] || rel;
            try {
                const res = await fetch(`${STORAGE_API}/create_folder.php`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: top, description: '', is_public: false }),
                });
                const data = await res.json();
                if (data && data.success && data.id) {
                    folder_id = String(data.id);
                    // update select UI if present
                    if (uploadFolderSelect) {
                        // add option for the new folder and select it
                        const opt = document.createElement('option');
                        opt.value = folder_id; opt.textContent = top + ' (uploaded)';
                        uploadFolderSelect.appendChild(opt);
                        uploadFolderSelect.value = folder_id;
                    }
                    showToast('Created folder "' + top + '" for uploaded directory.', 'success');
                } else {
                    showToast('Failed to create folder for upload: ' + (data.message || 'unknown'), 'error');
                }
            } catch (err) {
                console.error('Failed to create folder for upload', err);
                showToast('Failed to create folder for upload (see console).', 'error');
            }
        }
    }
    const description = uploadForm.querySelector('#fileDescription').value || '';
    const is_public   = uploadForm.querySelector('#filePublic').checked ? 1 : 0;

    // total bytes for progress
    const totalBytes = Array.from(files).reduce((s, f) => s + (f.size || 0), 0);
    let uploadedBytes = 0;

    uploadProgressWrap.style.display = 'flex';
    uploadProgressBar.style.width    = '0%';
    uploadProgressText.textContent   = '0%';
    document.getElementById('submitUpload').disabled = true;

    // upload files sequentially to reuse existing single-file endpoint
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            await new Promise((resolve, reject) => {
                const fd = new FormData();
                fd.append('file', file);
                fd.append('category', category);
                if (folder_id !== '') fd.append('folder_id', folder_id);
                fd.append('description', description);
                if (is_public) fd.append('is_public', '1');

                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${STORAGE_API}/upload_file.php`);

                xhr.upload.addEventListener('progress', ev => {
                    if (ev.lengthComputable) {
                        const pct = Math.round(((uploadedBytes + ev.loaded) / totalBytes) * 100);
                        uploadProgressBar.style.width  = pct + '%';
                        uploadProgressText.textContent = pct + '%';
                    }
                });

                xhr.addEventListener('load', () => {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        if (data.success) {
                            uploadedBytes += file.size;
                            resolve(data);
                        } else {
                            reject(new Error(data.message || 'Upload failed'));
                        }
                    } catch (err) { reject(err); }
                });

                xhr.addEventListener('error', () => reject(new Error('Network error')));
                // Debug: log what's being sent
                console.log('Uploading file to server', { name: file.name, size: file.size, folder_id: folder_id });
                xhr.send(fd);
            });
        } catch (err) {
            showToast(`Failed to upload ${file.name}: ${err.message}`, 'error');
            document.getElementById('submitUpload').disabled = false;
            uploadProgressWrap.style.display = 'none';
            return;
        }
    }

    document.getElementById('submitUpload').disabled = false;
    uploadProgressBar.style.width  = '100%';
    uploadProgressText.textContent = '100%';
    showToast('All files uploaded successfully.', 'success');
    closeUpload();
    loadFiles();
    } catch (err) {
        console.error('Upload handler error', err);
        showToast('An unexpected error occurred (see console).', 'error');
        document.getElementById('submitUpload').disabled = false;
        uploadProgressWrap.style.display = 'none';
    }
});

// ── Delete ────────────────────────────────────────────────────────────────
function closeDeleteModal() {
    pendingDeleteId       = null;
    pendingDeleteFolderId = null;
    deleteModal._mode     = 'file';
    deleteModal.style.display = 'none';
}

cancelDeleteBtn.addEventListener('click', closeDeleteModal);
deleteModal.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });

confirmDeleteBtn.addEventListener('click', async () => {
    confirmDeleteBtn.disabled = true;
    try {
        if (deleteModal._mode === 'folder' && pendingDeleteFolderId) {
            const res  = await fetch(`${STORAGE_API}/delete_folder.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pendingDeleteFolderId }),
            });
            const data = await res.json();
            if (data.success) { showToast('Folder deleted.', 'success'); closeDeleteModal(); loadFiles(); }
            else showToast(data.message || 'Delete failed.', 'error');
        } else if (pendingDeleteId) {
            const res  = await fetch(`${STORAGE_API}/delete_file.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pendingDeleteId }),
            });
            const data = await res.json();
            if (data.success) { showToast('File deleted.', 'success'); closeDeleteModal(); loadFiles(); }
            else showToast(data.message || 'Delete failed.', 'error');
        }
    } catch (_) {
        showToast('Delete request failed.', 'error');
    } finally {
        confirmDeleteBtn.disabled = false;
    }
});

// ── Filters ───────────────────────────────────────────────────────────────
let searchTimeout;
searchInput.addEventListener('input', () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(loadFiles, 350); });
categoryFilter.addEventListener('change', loadFiles);

// ── User menu toggle ──────────────────────────────────────────────────────
const userMenuBtn      = document.getElementById('userMenuBtn');
const userDropdown     = document.getElementById('userDropdown');
if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', e => { e.stopPropagation(); userDropdown.classList.toggle('open'); });
    document.addEventListener('click', () => userDropdown.classList.remove('open'));
}

// ── Init ──────────────────────────────────────────────────────────────────
loadFiles();
