// Import your database model at the top of your file
// const User = require('./models/User'); 

app.get('/admin/analytics', async (req, res) => {
    try {
        // 1. Fetch real counts from MongoDB
        const totalUsersCount = await User.countDocuments();
        const activeUsersCount = await User.countDocuments({ status: 'active' }); 
        
        // Find users created in the last 24 hours
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newUsersCount = await User.countDocuments({ createdAt: { $gte: yesterday } });

        // 2. Package the stats for the EJS template
        const dashboardStats = {
            totalUsers: totalUsersCount,
            totalTrend: 12, // You can write separate logic to calculate these percentages later
            activeUsers: activeUsersCount,
            activeTrend: 5,
            newUsers: newUsersCount,
            newTrend: -2 // A negative number will dynamically turn the arrow red pointing down
        };

        // 3. Prepare data for your Chart.js graph
        // In a full app, you would use MongoDB aggregation to get this arrays
        const graphData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [12, 19, 3, 5, 2, 3, 7] 
        };

        // 4. Send everything to the analytics.ejs file
        res.render('analytics', { 
            currentUser: { firstName: 'Admin', lastName: 'User' }, // Replace with req.user if using auth
            stats: dashboardStats,
            chartData: graphData
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).send("Error loading analytics data from the database.");
    }
});
document.addEventListener("DOMContentLoaded", function () {
    // 1. Calculate and animate bottom distribution data progress lengths
    const stats = window.initialStats || { totalUsers: 0, totalStudents: 0, totalInstructors: 0 };
    
    if (stats.totalUsers > 0) {
        const studentPercentage = Math.round((stats.totalStudents / stats.totalUsers) * 100);
        const instructorPercentage = Math.round((stats.totalInstructors / stats.totalUsers) * 100);

        document.getElementById('studentPercent').textContent = `${studentPercentage}%`;
        document.getElementById('studentBar').style.width = `${studentPercentage}%`;

        document.getElementById('instructorPercent').textContent = `${instructorPercentage}%`;
        document.getElementById('instructorBar').style.width = `${instructorPercentage}%`;
    }

    // 2. Handle dynamic presentation processing loop for activity stream boxes
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
                        <div class="activity-text">${item.text}</div>
                    </div>
                    <div class="activity-time">${item.time}</div>
                </div>
            `).join('');
        }
    }

    // 3. Initialize Line Growth Graphs Configuration Canvas Context
    const canvasElement = document.getElementById('growthChart');
    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    const graphMeta = window.chartData || { labels: [], data: [] };

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: graphMeta.labels,
            datasets: [{
                label: 'Registered Growth',
                data: graphMeta.data,
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
});