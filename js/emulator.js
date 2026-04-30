'use strict';

const EMU_API   = '../settings';
const V86_CDN   = 'https://cdn.jsdelivr.net/gh/copy/v86@latest/build/libv86.js';
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';

// ── State ─────────────────────────────────────────────────────────────────
let currentProgram  = null;
let pyodide         = null;
let v86Instance     = null;
let pyodideLoading  = false;
let v86Loading      = false;
// When running a storage file directly (not saved to emulator_programs),
// this holds the storage file id used for binary (x86) streaming.
let storageFileId   = null;

// ── DOM refs ──────────────────────────────────────────────────────────────
const programList      = document.getElementById('programList');
const programSearch    = document.getElementById('programSearch');
const runtimeFilter    = document.getElementById('runtimeFilter');
const newProgramBtn    = document.getElementById('newProgramBtn');
const newProgramModal  = document.getElementById('newProgramModal');
const closeNewProgram  = document.getElementById('closeNewProgram');
const cancelNewProgram = document.getElementById('cancelNewProgram');
const newProgramForm   = document.getElementById('newProgramForm');

const runnerPlaceholder = document.getElementById('runnerPlaceholder');
const scriptRunner      = document.getElementById('scriptRunner');
const x86Runner         = document.getElementById('x86Runner');
const runnerTitle       = document.getElementById('runnerTitle');
const runnerRuntimeBadge= document.getElementById('runnerRuntimeBadge');
const codeEditor        = document.getElementById('codeEditor');
const outputTerminal    = document.getElementById('outputTerminal');
const runBtn            = document.getElementById('runBtn');
const saveBtn           = document.getElementById('saveBtn');
const clearOutputBtn    = document.getElementById('clearOutputBtn');
const x86RunnerTitle    = document.getElementById('x86RunnerTitle');
const bootBtn           = document.getElementById('bootBtn');
const resetBtn          = document.getElementById('resetBtn');
const v86Container      = document.getElementById('v86Container');
const importStorageBtn  = document.getElementById('importStorageBtn');
const importStorageModal= document.getElementById('importStorageModal');
const closeImportStorage= document.getElementById('closeImportStorage');
const cancelImportStorage=document.getElementById('cancelImportStorage');
const importFileList    = document.getElementById('importFileList');

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

// ── Output helpers ────────────────────────────────────────────────────────
function appendOutput(text, cls = '') {
    // Remove placeholder hint
    const hint = outputTerminal.querySelector('.terminal-hint');
    if (hint) hint.remove();
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text;
    outputTerminal.appendChild(span);
    outputTerminal.scrollTop = outputTerminal.scrollHeight;
}

function clearOutput() {
    outputTerminal.innerHTML = '<span class="terminal-hint">Output will appear here…</span>';
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

// ── Runtime badge helper ──────────────────────────────────────────────────
function runtimeLabel(runtime) {
    return { python: 'Python', javascript: 'JavaScript', x86_disk_image: 'x86 Disk Image' }[runtime] || runtime;
}

// ── Load programs ─────────────────────────────────────────────────────────
async function loadPrograms() {
    programList.innerHTML = '<li class="loading-message">Loading…</li>';
    const params = new URLSearchParams({
        search:  programSearch.value.trim(),
        runtime: runtimeFilter.value,
    });
    try {
        const res  = await fetch(`${EMU_API}/get_programs.php?${params}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Load failed');
        renderPrograms(data.programs || []);
    } catch (err) {
        programList.innerHTML = `<li class="empty-state">⚠️ ${escapeHtml(err.message)}</li>`;
    }
}

function renderPrograms(programs) {
    if (!programs.length) {
        programList.innerHTML = '<li class="empty-state">No programs found.</li>';
        return;
    }
    programList.innerHTML = programs.map(p => `
        <li class="program-item ${currentProgram && currentProgram.id === p.id ? 'active' : ''}"
            data-id="${p.id}" data-runtime="${p.runtime}" tabindex="0">
            <span class="program-item__name">${escapeHtml(p.name)}</span>
            <span class="runtime-badge runtime-badge--${p.runtime}">${runtimeLabel(p.runtime)}</span>
        </li>
    `).join('');

    programList.querySelectorAll('.program-item').forEach(li => {
        li.addEventListener('click', () => selectProgram(parseInt(li.dataset.id, 10)));
        li.addEventListener('keypress', e => { if (e.key === 'Enter') selectProgram(parseInt(li.dataset.id, 10)); });
    });
}

// ── Select & load program ─────────────────────────────────────────────────
async function selectProgram(id) {
    try {
        // x86 disk images don't have text source
        const res  = await fetch(`${EMU_API}/get_program_source.php?id=${id}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Could not load program.');
        currentProgram = data;
        showScriptRunner(data);
    } catch (err) {
        // Might be x86 — try to show x86 runner by fetching metadata from program list
        const li = programList.querySelector(`[data-id="${id}"]`);
        if (li && li.dataset.runtime === 'x86_disk_image') {
            currentProgram = { id, name: li.querySelector('.program-item__name').textContent, runtime: 'x86_disk_image' };
            showX86Runner(currentProgram);
        } else {
            showToast(err.message, 'error');
        }
    }

    // Highlight active item
    programList.querySelectorAll('.program-item').forEach(li => {
        li.classList.toggle('active', parseInt(li.dataset.id, 10) === id);
    });
}

function showScriptRunner(prog) {
    runnerPlaceholder.style.display = 'none';
    x86Runner.style.display         = 'none';
    scriptRunner.style.display      = 'flex';

    runnerTitle.textContent = prog.name;
    runnerRuntimeBadge.textContent  = runtimeLabel(prog.runtime);
    runnerRuntimeBadge.className    = `runtime-badge runtime-badge--${prog.runtime}`;
    codeEditor.value = prog.source_code || '';
    clearOutput();
}

function showX86Runner(prog) {
    runnerPlaceholder.style.display = 'none';
    scriptRunner.style.display      = 'none';
    x86Runner.style.display         = 'flex';
    x86RunnerTitle.textContent = prog.name;
    v86Container.innerHTML = '';
    if (v86Instance) { try { v86Instance.stop(); } catch(_){} v86Instance = null; }
}

// ── Run x86 from storage file (streams via run_storage_file.php) ──────────
async function runX86FromStorage(fileId) {
    if (v86Loading) return;
    if (!window.V86) {
        v86Loading = true;
        bootBtn.disabled = true;
        bootBtn.textContent = '⏳ Loading emulator…';
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src     = V86_CDN;
            script.onload  = () => { v86Loading = false; resolve(); };
            script.onerror = () => { v86Loading = false; reject(new Error('Failed to load v86.')); };
            document.head.appendChild(script);
        }).catch(err => { showToast(err.message, 'error'); bootBtn.disabled = false; bootBtn.textContent = '⚡ Boot'; return; });
        bootBtn.disabled = false;
        bootBtn.textContent = '⚡ Boot';
    }
    if (!window.V86) { showToast('v86 emulator could not be loaded.', 'error'); return; }
    v86Container.innerHTML = '';
    if (v86Instance) { try { v86Instance.stop(); } catch(_){} }
    const screenContainer = document.createElement('div');
    screenContainer.style.cssText = 'width:100%;height:100%;';
    v86Container.appendChild(screenContainer);
    try {
        v86Instance = new window.V86({
            screen_container: screenContainer,
            bios:    { url: 'https://cdn.jsdelivr.net/gh/copy/v86@latest/bios/seabios.bin' },
            vga_bios:{ url: 'https://cdn.jsdelivr.net/gh/copy/v86@latest/bios/vgabios.bin' },
            hda:     { url: `${EMU_API}/run_storage_file.php?id=${fileId}&mode=binary`, async: true, size: 33554432 },
            memory_size:      32 * 1024 * 1024,
            vga_memory_size:   2 * 1024 * 1024,
            autostart: true,
        });
    } catch (err) {
        showToast('Could not start emulator: ' + err.message, 'error');
    }
}

// ── Run Python ────────────────────────────────────────────────────────────
async function loadPyodide() {
    if (pyodide) return pyodide;
    if (pyodideLoading) { showToast('Pyodide is still loading…', 'info'); return null; }
    pyodideLoading = true;
    appendOutput('⏳ Loading Pyodide runtime (first run may take a moment)…\n');

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src   = PYODIDE_CDN;
        script.onload = async () => {
            try {
                // window.loadPyodide is provided by pyodide.js
                pyodide = await window.loadPyodide({
                    stdout: text => appendOutput(text + '\n'),
                    stderr: text => appendOutput(text + '\n', 'terminal-err'),
                });
                appendOutput('✅ Python runtime ready.\n');
                pyodideLoading = false;
                resolve(pyodide);
            } catch (e) {
                pyodideLoading = false;
                reject(e);
            }
        };
        script.onerror = () => { pyodideLoading = false; reject(new Error('Failed to load Pyodide.')); };
        document.head.appendChild(script);
    });
}

async function runPython(code) {
    try {
        const py = await loadPyodide();
        if (!py) return;
        await py.runPythonAsync(code);
    } catch (err) {
        appendOutput('PythonError: ' + err.message + '\n', 'terminal-err');
    }
}

// ── Run JavaScript ────────────────────────────────────────────────────────
function runJavaScript(code) {
    // Sandboxed console capture
    const logs = [];
    const sandbox = {
        console: {
            log:   (...args) => { const s = args.map(String).join(' '); logs.push(s); appendOutput(s + '\n'); },
            error: (...args) => { const s = args.map(String).join(' '); appendOutput(s + '\n', 'terminal-err'); },
            warn:  (...args) => { appendOutput(args.map(String).join(' ') + '\n', 'terminal-warn'); },
        },
        Math, JSON, Date, parseInt, parseFloat, isNaN, isFinite,
        Array, Object, String, Number, Boolean, RegExp, Map, Set,
        setTimeout: () => { appendOutput('[setTimeout not available in sandbox]\n', 'terminal-warn'); },
        setInterval: () => { appendOutput('[setInterval not available in sandbox]\n', 'terminal-warn'); },
    };
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(...Object.keys(sandbox), '"use strict";\n' + code);
        fn(...Object.values(sandbox));
    } catch (err) {
        appendOutput('Error: ' + err.message + '\n', 'terminal-err');
    }
}

// ── Run x86 ───────────────────────────────────────────────────────────────
async function runX86(programId) {
    if (v86Loading) return;

    // Lazy-load v86 library
    if (!window.V86) {
        v86Loading = true;
        bootBtn.disabled = true;
        bootBtn.textContent = '⏳ Loading emulator…';
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src   = V86_CDN;
            script.onload  = () => { v86Loading = false; resolve(); };
            script.onerror = () => { v86Loading = false; reject(new Error('Failed to load v86.')); };
            document.head.appendChild(script);
        }).catch(err => {
            showToast(err.message, 'error');
            bootBtn.disabled = false;
            bootBtn.textContent = '⚡ Boot';
            return;
        });
        bootBtn.disabled = false;
        bootBtn.textContent = '⚡ Boot';
    }

    if (!window.V86) { showToast('v86 emulator could not be loaded.', 'error'); return; }

    v86Container.innerHTML = '';
    if (v86Instance) { try { v86Instance.stop(); } catch(_){} }

    const screenContainer = document.createElement('div');
    screenContainer.style.cssText = 'width:100%;height:100%;';
    v86Container.appendChild(screenContainer);

    try {
        v86Instance = new window.V86({
            screen_container: screenContainer,
            bios:             { url: 'https://cdn.jsdelivr.net/gh/copy/v86@latest/bios/seabios.bin' },
            vga_bios:         { url: 'https://cdn.jsdelivr.net/gh/copy/v86@latest/bios/vgabios.bin' },
            hda:              { url: `${EMU_API}/get_disk_image.php?id=${programId}`, async: true, size: 33554432 },
            memory_size:       32 * 1024 * 1024,
            vga_memory_size:    2 * 1024 * 1024,
            autostart: true,
        });
    } catch (err) {
        showToast('Could not start emulator: ' + err.message, 'error');
    }
}

// ── Toolbar actions ───────────────────────────────────────────────────────
runBtn.addEventListener('click', () => {
    if (!currentProgram) return;
    const code = codeEditor.value;
    clearOutput();
    if (currentProgram.runtime === 'python') runPython(code);
    else if (currentProgram.runtime === 'javascript') runJavaScript(code);
});

saveBtn.addEventListener('click', async () => {
    if (!currentProgram) return;
    saveBtn.disabled = true;
    try {
        const res  = await fetch(`${EMU_API}/save_program.php`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                id:          currentProgram.id,
                name:        currentProgram.name,
                description: currentProgram.description || '',
                runtime:     currentProgram.runtime,
                source_code: codeEditor.value,
                is_public:   currentProgram.is_public || false,
            }),
        });
        const data = await res.json();
    if (data.success) { showToast('Program saved.', 'success'); currentProgram.source_code = codeEditor.value; currentProgram.source = 'db'; }
        else showToast(data.message || 'Save failed.', 'error');
    } catch (_) {
        showToast('Save request failed.', 'error');
    } finally {
        saveBtn.disabled = false;
    }
});

clearOutputBtn.addEventListener('click', clearOutput);

bootBtn.addEventListener('click', () => {
    if (!currentProgram) return;
    if (storageFileId) runX86FromStorage(storageFileId);
    else runX86(currentProgram.id);
});

resetBtn.addEventListener('click', () => {
    if (!currentProgram) return;
    if (v86Instance) { try { v86Instance.stop(); } catch(_){} v86Instance = null; }
    v86Container.innerHTML = '';
    showToast('Emulator reset. Press Boot to start again.', 'info');
});

// ── Import from Storage modal ─────────────────────────────────────────────
function openImportStorage() {
    importStorageModal.style.display = 'flex';
    loadImportableFiles();
}
function closeImportStorageModal() { importStorageModal.style.display = 'none'; }

importStorageBtn.addEventListener('click', openImportStorage);
closeImportStorage.addEventListener('click', closeImportStorageModal);
cancelImportStorage.addEventListener('click', closeImportStorageModal);
importStorageModal.addEventListener('click', e => { if (e.target === importStorageModal) closeImportStorageModal(); });

async function loadImportableFiles() {
    importFileList.innerHTML = '<div class="loading-message">Loading storage files…</div>';
    const RUNNABLE_EXTS = ['py', 'js', 'img', 'iso', 'bin'];
    try {
        const res  = await fetch(`${EMU_API}/get_storage_files.php`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const files = (data.files || []).filter(f => {
            const ext = (f.original_name || '').split('.').pop().toLowerCase();
            return RUNNABLE_EXTS.includes(ext);
        });
        if (!files.length) {
            importFileList.innerHTML = '<div class="empty-state">📦 No runnable files in storage.<br><small>Upload a .py, .js, .img, .iso, or .bin file first.</small></div>';
            return;
        }
        importFileList.innerHTML = files.map(f => {
            const ext    = (f.original_name || '').split('.').pop().toLowerCase();
            const rtMap  = { py: 'python', js: 'javascript', img: 'x86_disk_image', iso: 'x86_disk_image', bin: 'x86_disk_image' };
            const runtime = rtMap[ext] || 'unknown';
            return `<div class="import-file-item" data-id="${f.id}" data-name="${escapeHtml(f.original_name)}" data-runtime="${runtime}" tabindex="0">
                <span class="import-file-item__name">${escapeHtml(f.original_name)}</span>
                <span class="runtime-badge runtime-badge--${runtime}">${runtimeLabel(runtime)}</span>
            </div>`;
        }).join('');
        importFileList.querySelectorAll('.import-file-item').forEach(el => {
            el.addEventListener('click', () => importStorageFile(
                parseInt(el.dataset.id, 10), el.dataset.name, el.dataset.runtime
            ));
            el.addEventListener('keypress', e => {
                if (e.key === 'Enter') importStorageFile(parseInt(el.dataset.id, 10), el.dataset.name, el.dataset.runtime);
            });
        });
    } catch (err) {
        importFileList.innerHTML = `<div class="empty-state">⚠️ ${escapeHtml(err.message)}</div>`;
    }
}

async function importStorageFile(fileId, fileName, runtime) {
    closeImportStorageModal();

    if (runtime === 'x86_disk_image') {
        // Stream directly — no need to read text content
        storageFileId  = fileId;
        currentProgram = { id: null, name: fileName, runtime: 'x86_disk_image', source: 'storage' };
        showX86Runner(currentProgram);
        showToast('Disk image loaded. Press Boot to start.', 'success');
        return;
    }

    // Fetch text content for script runtimes
    try {
        const res  = await fetch(`${EMU_API}/run_storage_file.php?id=${fileId}&mode=content`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        storageFileId  = null;
        currentProgram = { id: null, name: data.name, runtime: data.runtime, source_code: data.content, source: 'storage', storageId: fileId };
        showScriptRunner(currentProgram);
        showToast('File loaded from Storage. Edit and run, or save as a new program.', 'success');
    } catch (err) {
        showToast('Could not load file: ' + err.message, 'error');
    }
}

// ── New program modal ─────────────────────────────────────────────────────
function openNewProgram() { newProgramForm.reset(); newProgramModal.style.display = 'flex'; }
function closeNewProgramModal() { newProgramModal.style.display = 'none'; }

newProgramBtn.addEventListener('click', openNewProgram);
closeNewProgram.addEventListener('click', closeNewProgramModal);
cancelNewProgram.addEventListener('click', closeNewProgramModal);
newProgramModal.addEventListener('click', e => { if (e.target === newProgramModal) closeNewProgramModal(); });

newProgramForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = newProgramForm.querySelector('[type=submit]');
    btn.disabled = true;

    const data = {
        name:        document.getElementById('newProgName').value.trim(),
        description: document.getElementById('newProgDesc').value.trim(),
        runtime:     document.getElementById('newProgRuntime').value,
        source_code: '',
        is_public:   document.getElementById('newProgPublic').checked,
    };

    if (!data.name) { showToast('Name is required.', 'error'); btn.disabled = false; return; }

    try {
        const res  = await fetch(`${EMU_API}/save_program.php`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(data),
        });
        const resp = await res.json();
        if (resp.success) {
            showToast('Program created.', 'success');
            closeNewProgramModal();
            await loadPrograms();
            selectProgram(resp.id);
        } else {
            showToast(resp.message || 'Create failed.', 'error');
        }
    } catch (_) {
        showToast('Request failed.', 'error');
    } finally {
        btn.disabled = false;
    }
});

// ── Filters ───────────────────────────────────────────────────────────────
let searchTimeout;
programSearch.addEventListener('input', () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(loadPrograms, 350); });
runtimeFilter.addEventListener('change', loadPrograms);

// ── User menu toggle ──────────────────────────────────────────────────────
const userMenuBtn  = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', e => { e.stopPropagation(); userDropdown.classList.toggle('open'); });
    document.addEventListener('click', () => userDropdown.classList.remove('open'));
}

// ── Handle ?storage_id= URL param (deep link from Storage page) ──────────
(async function checkStorageParam() {
    const sid = new URLSearchParams(location.search).get('storage_id');
    if (!sid) return;
    const fileId = parseInt(sid, 10);
    if (!fileId) return;

    // Determine runtime without fetching content yet
    // We need the filename — fetch file list briefly
    try {
        const res  = await fetch(`${EMU_API}/get_storage_files.php?search=`);
        const data = await res.json();
        const file = (data.files || []).find(f => f.id === fileId);
        if (!file) { showToast('Linked storage file not found.', 'error'); return; }
        const ext = (file.original_name || '').split('.').pop().toLowerCase();
        const rtMap  = { py: 'python', js: 'javascript', img: 'x86_disk_image', iso: 'x86_disk_image', bin: 'x86_disk_image' };
        const runtime = rtMap[ext];
        if (!runtime) { showToast('This file type cannot be run in the emulator.', 'error'); return; }
        await importStorageFile(fileId, file.original_name, runtime);
    } catch (_) {
        showToast('Could not load the linked storage file.', 'error');
    }
})();

// ── Init ──────────────────────────────────────────────────────────────────
loadPrograms();
