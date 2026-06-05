// analytics.js
let growthChart;

async function loadChartData(period) {
  try {
    const res = await fetch(`/api/admin/analytics/growth?period=${period}`);
    const { labels, data } = await res.json();
    
    if (growthChart) {
      growthChart.data.labels = labels;
      growthChart.data.datasets[0].data = data;
      growthChart.update();
    } else {
      const ctx = document.getElementById('growthChart').getContext('2d');
      growthChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Registered Growth',
            data: data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.02)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#3b82f6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888888' } },
            x: { grid: { display: false }, ticks: { color: '#888888' } }
          }
        }
      });
    }
  } catch (err) {
    console.error('Chart load error:', err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Distribution bars
  const stats = window.initialStats || { totalUsers: 0, totalStudents: 0, totalInstructors: 0 };
  if (stats.totalUsers > 0) {
    const studentPercentage = Math.round((stats.totalStudents / stats.totalUsers) * 100);
    const instructorPercentage = Math.round((stats.totalInstructors / stats.totalUsers) * 100);
    document.getElementById('studentPercent').textContent = `${studentPercentage}%`;
    document.getElementById('studentBar').style.width = `${studentPercentage}%`;
    document.getElementById('instructorPercent').textContent = `${instructorPercentage}%`;
    document.getElementById('instructorBar').style.width = `${instructorPercentage}%`;
  }

  // Recent activities
  const activityContainer = document.getElementById('activityList');
  const logs = window.recentActivities || [];
  if (activityContainer) {
    if (logs.length === 0) {
      activityContainer.innerHTML = '<div class="loading">No recent actions recorded.</div>';
    } else {
      activityContainer.innerHTML = logs.map(item => `
        <div class="activity-item">
          <div class="activity-info">
            <div class="activity-icon" style="background: ${item.type === 'student' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(168, 85, 247, 0.1)'}; color: ${item.type === 'student' ? '#22c55e' : '#a855f7'};">
              <i class="fas ${item.type === 'student' ? 'fa-graduation-cap' : 'fa-chalkboard-user'}"></i>
            </div>
            <div class="activity-text">${escapeHtml(item.text)}</div>
          </div>
          <div class="activity-time">${escapeHtml(item.time)}</div>
        </div>
      `).join('');
    }
  }

  // Chart toggle
  loadChartData(7);
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadChartData(btn.dataset.period);
    });
  });
});

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}