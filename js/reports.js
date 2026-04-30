// Reports page functionality: Export visible reports (CSV) and Refresh (reload page)

document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportReportsBtn');
    const refreshBtn = document.getElementById('refreshReportsBtn');
    const generateBtn = document.getElementById('generateReportsBtn');

    if (exportBtn) exportBtn.addEventListener('click', exportReports);
    if (generateBtn) generateBtn.addEventListener('click', openGenerateModal);

    if (refreshBtn) refreshBtn.addEventListener('click', () => {
        try {
            refreshBtn.disabled = true;
            const prev = refreshBtn.textContent;
            refreshBtn.textContent = 'Refreshing...';
            // Simple refresh: reload the page to re-query any data
            window.location.reload();
            // fallback to restore text (page will reload normally)
            refreshBtn.textContent = prev;
        } catch (err) {
            console.error('Refresh failed', err);
            alert('Failed to refresh reports');
        } finally {
            try { refreshBtn.disabled = false; } catch {};
        }
    });
});

// Real-time polling for saved reports: fetch recent saved reports and insert new ones
(function setupReportsPolling(){
    try {
        const seen = new Set();
        // Seed seen set from current DOM cards (if any)
        document.querySelectorAll('.report-card').forEach(c=>{ const id = c.getAttribute('data-report-id'); if(id) seen.add(id); });

        async function poll() {
            try {
                const res = await fetch('../settings/realtime_updates.php?section=reports', { credentials: 'same-origin' });
                if (!res.ok) return;
                const data = await res.json();
                if (!data || !data.data) return;
                const reports = data.data;
                // reports come newest-first; insert oldest-first to maintain order
                reports.slice().reverse().forEach(r => {
                    if (!r || !r.id) return;
                    if (seen.has(String(r.id))) return;
                    seen.add(String(r.id));
                    insertSavedReport(r);
                });
            } catch (e) { console.error('Reports polling error', e); }
        }

        // initial poll after load
        setTimeout(poll, 1000);
        // poll every 10 seconds
        setInterval(poll, 10000);
    } catch (e) { console.error('setupReportsPolling error', e); }
})();

function insertSavedReport(r) {
    try {
        const container = document.querySelector('.reports-section');
        if (!container) return;
        const content = r.content_parsed || (r.content ? JSON.parse(r.content) : {});
        const title = r.title || 'Saved Report';
        const generatedText = r.created_at || new Date().toLocaleString();
        const desc = (content.description) ? content.description : '';
        const metricsObj = content.metrics || content.metrics_json || {};

        const metricsHtml = Object.keys(metricsObj || {}).map(k => `
            <div class="metric">
                <span class="metric-label">${escapeHtml(k)}</span>
                <span class="metric-value">${escapeHtml(String(metricsObj[k]))}</span>
            </div>
        `).join('');

        const card = document.createElement('div');
        card.className = 'report-card';
        card.setAttribute('data-report-id', String(r.id));
        card.innerHTML = `
            <div class="report-header">
                <h3>${escapeHtml(title)}</h3>
                <span class="report-date">Generated: ${escapeHtml(generatedText)}</span>
            </div>
            <div class="report-content">
                <p class="report-description">${escapeHtml(desc)}</p>
                <div class="report-metrics">
                    ${metricsHtml}
                </div>
                <button class="btn-view">View Full Report →</button>
            </div>
        `;
        container.insertBefore(card, container.firstChild);
        const viewBtn = card.querySelector('.btn-view');
        if (viewBtn) viewBtn.addEventListener('click', () => openReportModal(card));
    } catch (e) { console.error('insertSavedReport error', e); }
}

function exportReports() {
    try {
        const cards = Array.from(document.querySelectorAll('.report-card'));
        if (cards.length === 0) {
            alert('No reports available to export');
            return;
        }

        const headers = ['title','generated','description','metrics_json'];
        const rows = [headers.join(',')];

        cards.forEach(card => {
            // skip hidden cards if any
            if (card.style.display === 'none') return;

            const title = (card.querySelector('.report-header h3') || {textContent:''}).textContent.trim();
            const generated = (card.querySelector('.report-header .report-date') || {textContent:''}).textContent.replace(/^Generated:\s*/i,'').trim();
            const desc = (card.querySelector('.report-description') || {textContent:''}).textContent.trim();

            const metrics = {};
            const metricNodes = Array.from(card.querySelectorAll('.report-metrics .metric'));
            metricNodes.forEach(m => {
                const label = (m.querySelector('.metric-label') || {textContent:''}).textContent.trim();
                const value = (m.querySelector('.metric-value') || {textContent:''}).textContent.trim();
                if (label) metrics[label] = value;
            });

            const metricsJson = JSON.stringify(metrics).replace(/"/g,'""');

            const vals = [title, generated, desc, '"' + metricsJson + '"'].map(v => '"' + String(v).replace(/"/g,'""') + '"');
            rows.push(vals.join(','));
        });

        const csv = rows.join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reports-export-' + new Date().toISOString().slice(0,10) + '.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Export reports failed', err);
        alert('Export failed. See console for details.');
    }
}

function openGenerateModal() {
    const overlay = document.createElement('div');
    overlay.className = 'reports-modal-overlay';

    const inner = document.createElement('div');
    inner.className = 'reports-modal';
    inner.setAttribute('role', 'dialog');
    inner.setAttribute('aria-modal', 'true');
    inner.setAttribute('aria-label', 'Generate Report');

    inner.innerHTML = `
        <div class="modal-header">
            <h3>Generate Custom Report</h3>
            <button class="close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-row">
                <label>Report Type</label>
                <select id="genReportType">
                    <option value="projects">Projects</option>
                    <option value="tasks">Tasks</option>
                    <option value="team">Team</option>
                    <option value="activity">Activity</option>
                    <option value="audit">Audit</option>
                </select>
            </div>
            <div class="form-row">
                <label>From</label>
                <input type="date" id="genFromDate">
            </div>
            <div class="form-row">
                <label>To</label>
                <input type="date" id="genToDate">
            </div>
            <div id="taskFilterSection" style="display:none;">
                <div class="form-row">
                    <label>Status</label>
                    <select id="genFilterStatus">
                        <option value="">Any</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
                <div class="form-row">
                    <label>Priority</label>
                    <select id="genFilterPriority">
                        <option value="">Any</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div class="form-row">
                    <label>Assignee</label>
                    <select id="genFilterAssignee">
                        <option value="">Any</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <label>Notes (optional)</label>
                <input type="text" id="genNotes" placeholder="Short description">
            </div>
            <div style="margin-top:12px;text-align:right;">
                <button id="genCancel" class="btn-secondary">Cancel</button>
                <button id="genSubmit" class="btn-primary">Generate</button>
            </div>
        </div>
    `;

    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    const closeBtn = inner.querySelector('.close-btn');
    const cancelBtn = document.getElementById('genCancel');
    const submitBtn = document.getElementById('genSubmit');

    function close() { overlay.remove(); }

    closeBtn && closeBtn.addEventListener('click', close);
    cancelBtn && cancelBtn.addEventListener('click', close);

    // show task-specific filters when Tasks type selected
    const typeSel = document.getElementById('genReportType');
    const taskSection = document.getElementById('taskFilterSection');
    const assigneeSel = document.getElementById('genFilterAssignee');

    async function populateAssignees() {
        try {
            const res = await fetch('../settings/get_all_users.php', { credentials: 'same-origin' });
            if (!res.ok) return;
            const data = await res.json();
            if (!data || !Array.isArray(data.users)) return;
            assigneeSel.innerHTML = '<option value="">Any</option>' + data.users.map(u => `<option value="${u.id}">${escapeHtml(u.full_name || u.username)}</option>`).join('');
        } catch (e) { console.error('populateAssignees error', e); }
    }

    typeSel && typeSel.addEventListener('change', (e) => {
        if (e.target.value === 'tasks') {
            taskSection.style.display = 'block';
            populateAssignees();
        } else {
            taskSection.style.display = 'none';
        }
    });

    // initialize visibility based on default selection
    if (typeSel && typeSel.value === 'tasks') { taskSection.style.display = 'block'; populateAssignees(); }

    submitBtn && submitBtn.addEventListener('click', async () => {
        submitBtn.disabled = true;
        const type = document.getElementById('genReportType').value;
        const from = document.getElementById('genFromDate').value || '';
        const to = document.getElementById('genToDate').value || '';
        const notes = document.getElementById('genNotes').value || '';

        try {
            const fd = new FormData();
            fd.append('type', type);
            fd.append('from', from);
            fd.append('to', to);
            fd.append('notes', notes);
            // task filters
            const status = document.getElementById('genFilterStatus') ? document.getElementById('genFilterStatus').value : '';
            const priority = document.getElementById('genFilterPriority') ? document.getElementById('genFilterPriority').value : '';
            const assignee = document.getElementById('genFilterAssignee') ? document.getElementById('genFilterAssignee').value : '';
            if (status) fd.append('status', status);
            if (priority) fd.append('priority', priority);
            if (assignee) fd.append('assignee', assignee);

            const res = await fetch('../settings/generate_report.php', { method: 'POST', body: fd, credentials: 'same-origin' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Failed to generate report');

            // insert report card into DOM
            insertGeneratedReport(data.report);
            close();
            Toast && Toast.success ? Toast.success('Report generated') : alert('Report generated');
        } catch (err) {
            console.error('Generate report error', err);
            alert(err.message || 'Failed to generate report');
        } finally {
            submitBtn.disabled = false;
        }
    });
}

function insertGeneratedReport(report) {
    try {
        const container = document.querySelector('.reports-section');
        if (!container) return;

        const card = document.createElement('div');
        card.className = 'report-card';
        const generatedText = report.generated || new Date().toLocaleString();
        const desc = report.description || '';

        const metricsHtml = Object.keys(report.metrics || {}).map(k => `
            <div class="metric">
                <span class="metric-label">${escapeHtml(k)}</span>
                <span class="metric-value">${escapeHtml(String(report.metrics[k]))}</span>
            </div>
        `).join('');

        card.innerHTML = `
            <div class="report-header">
                <h3>${escapeHtml(report.title || 'Custom Report')}</h3>
                <span class="report-date">Generated: ${escapeHtml(generatedText)}</span>
            </div>
            <div class="report-content">
                <p class="report-description">${escapeHtml(desc)}</p>
                <div class="report-metrics">
                    ${metricsHtml}
                </div>
                <button class="btn-view">View Full Report →</button>
            </div>
        `;

        // prepend so newest is first
        container.insertBefore(card, container.firstChild);

        // attach view handler
        const viewBtn = card.querySelector('.btn-view');
        if (viewBtn) viewBtn.addEventListener('click', () => openReportModal(card));
    } catch (e) { console.error('insertGeneratedReport error', e); }
}

// Attach handlers for "View Full Report" buttons and provide a lightweight modal
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.report-card');
            if (!card) return;
            openReportModal(card);
        });
    });
});

function escapeHtml(text) {
    if (text === undefined || text === null) return '';
    return String(text).replace(/[&<>"']/g, function (m) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m];
    });
}

function openReportModal(card) {
    const title = (card.querySelector('.report-header h3') || {textContent: ''}).textContent.trim();
    const generated = (card.querySelector('.report-header .report-date') || {textContent: ''}).textContent.replace(/^Generated:\s*/i, '').trim();
    const desc = (card.querySelector('.report-description') || {textContent: ''}).textContent.trim();

    const metrics = Array.from(card.querySelectorAll('.report-metrics .metric')).map(m => ({
        label: (m.querySelector('.metric-label') || {textContent: ''}).textContent.trim(),
        value: (m.querySelector('.metric-value') || {textContent: ''}).textContent.trim()
    }));

    const overlay = document.createElement('div');
    overlay.className = 'reports-modal-overlay';

    const inner = document.createElement('div');
    inner.className = 'reports-modal';
    inner.setAttribute('role', 'dialog');
    inner.setAttribute('aria-modal', 'true');
    inner.setAttribute('aria-label', title || 'Report Details');

    inner.innerHTML = `
        <div class="modal-header">
            <h3>${escapeHtml(title)}</h3>
            <button class="close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="report-meta"><strong>Generated:</strong> ${escapeHtml(generated)}</div>
            <p class="report-description">${escapeHtml(desc)}</p>
            <div class="modal-metrics">
                ${metrics.map(m => `<div class="modal-metric"><div class="metric-label">${escapeHtml(m.label)}</div><div class="metric-value">${escapeHtml(m.value)}</div></div>`).join('')}
            </div>
        </div>
    `;

    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    // focus management
    const closeBtn = inner.querySelector('.close-btn');
    if (closeBtn) closeBtn.focus();

    function close() {
        overlay.remove();
    }

    closeBtn && closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });
    document.addEventListener('keydown', function escHandler(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } });
}
