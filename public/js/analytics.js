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