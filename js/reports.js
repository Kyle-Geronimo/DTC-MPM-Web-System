// Reports page functionality: Export visible reports (CSV) and Refresh (reload page)

document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportReportsBtn');
    const refreshBtn = document.getElementById('refreshReportsBtn');

    if (exportBtn) exportBtn.addEventListener('click', exportReports);

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
