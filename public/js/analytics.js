// analytics.js
let growthChart;

async function loadChartData(period) {
    try {
        const res = await fetch(`/admin/analytics/growth?period=${period}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { labels, data } = await res.json();

        if (growthChart) {
            growthChart.data.labels = labels;
            growthChart.data.datasets[0].data = data;
            growthChart.update();
        } else {
            createChart(labels, data);
        }
    } catch (err) {
        console.error('Chart load error:', err);
        const canvas = document.getElementById('growthChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#888';
            ctx.font = '14px Sora, sans-serif';
            ctx.fillText('Failed to load chart data.', 20, 50);
        }
    }
}

function createChart(labels, data) {
    const ctx = document.getElementById('growthChart').getContext('2d');
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'New Users',
                data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.08)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#888' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888' }
                }
            }
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

document.addEventListener('DOMContentLoaded', function () {

    // Distribution bars
    const stats = window.initialStats || {};
    if (stats.totalUsers > 0) {
        const sPct = Math.round((stats.totalStudents / stats.totalUsers) * 100);
        const iPct = Math.round((stats.totalInstructors / stats.totalUsers) * 100);
        document.getElementById('studentPercent').textContent = `${sPct}%`;
        document.getElementById('studentBar').style.width = `${sPct}%`;
        document.getElementById('instructorPercent').textContent = `${iPct}%`;
        document.getElementById('instructorBar').style.width = `${iPct}%`;
    }

    // Recent activities
    const activityContainer = document.getElementById('activityList');
    const logs = window.recentActivities || [];
    if (activityContainer) {
        if (logs.length === 0) {
            activityContainer.innerHTML = '<div class="loading">No recent activity recorded.</div>';
        } else {
            activityContainer.innerHTML = logs.map(item => `
                <div class="activity-item">
                    <div class="activity-info">
                        <div class="activity-icon" style="background:${item.type === 'student' ? 'rgba(34,197,94,0.1)' : 'rgba(168,85,247,0.1)'}; color:${item.type === 'student' ? '#22c55e' : '#a855f7'};">
                            <i class="fas ${item.type === 'student' ? 'fa-graduation-cap' : 'fa-chalkboard-user'}"></i>
                        </div>
                        <div class="activity-text">${escapeHtml(item.text)}</div>
                    </div>
                    <div class="activity-time">${escapeHtml(item.time)}</div>
                </div>
            `).join('');
        }
    }

    // Initialize Chart using preloaded database variables
    if (window.chartData && window.chartData.labels && window.chartData.labels.length > 0) {
        createChart(window.chartData.labels, window.chartData.data);
    } else {
        loadChartData(7);
    }

    // Chart toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadChartData(btn.dataset.period);
        });
    });

});