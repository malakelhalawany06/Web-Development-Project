// Mock Data for the chart
const chartData = {
    daily: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [12, 19, 15, 25, 22, 30, 28]
    },
    weekly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [150, 230, 180, 320]
    }
};

let userGrowthChart;

// Function to initialize the chart
function initChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    // Global defaults for dark theme
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Sora, sans-serif';

    userGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.daily.labels,
            datasets: [{
                label: 'New Users',
                data: chartData.daily.data,
                borderColor: '#3b82f6', // Blue line
                backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue fill under line
                borderWidth: 3,
                pointBackgroundColor: '#161b22',
                pointBorderColor: '#3b82f6',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
                tension: 0.4 // Gives the line a smooth curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hides the top legend label
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#2a313e', // Dark grid lines
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false // Hide vertical grid lines
                    }
                }
            }
        }
    });
}

// Function to update chart when buttons are clicked
function updateChart(timeframe) {
    // 1. Update the chart data
    userGrowthChart.data.labels = chartData[timeframe].labels;
    userGrowthChart.data.datasets[0].data = chartData[timeframe].data;
    userGrowthChart.update();

    // 2. Update the button styles (make the clicked one 'active')
    const buttons = document.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Find the button that was clicked and add 'active' class
    event.target.classList.add('active');
}

// Run the chart init function when the page loads
document.addEventListener('DOMContentLoaded', initChart);