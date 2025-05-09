// Initialize charts when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    updateMetrics();
});

// Initialize all charts
function initializeCharts() {
    initializeDailyProgressChart();
    initializeFocusDistributionChart();
    initializeWeeklyTrendsChart();
}

// Daily Progress Chart
function initializeDailyProgressChart() {
    const ctx = document.getElementById('dailyProgressChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
            datasets: [{
                label: 'Focus Level',
                data: [85, 90, 75, 80, 95, 88, 92, 87, 91],
                borderColor: '#4A90E2',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(74, 144, 226, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Focus Distribution Chart
function initializeFocusDistributionChart() {
    const ctx = document.getElementById('focusDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Focused', 'Distracted', 'Recovery'],
            datasets: [{
                data: [75, 15, 10],
                backgroundColor: [
                    '#4CAF50',
                    '#FF5252',
                    '#FFC107'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Weekly Trends Chart
function initializeWeeklyTrendsChart() {
    const ctx = document.getElementById('weeklyTrendsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Study Hours',
                data: [6, 5.5, 7, 4.5, 6.5, 5, 4],
                backgroundColor: '#4A90E2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 8,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                }
            }
        }
    });
}

// Update performance metrics
function updateMetrics() {
    // These would typically be calculated based on actual study data
    document.getElementById('focusScore').textContent = '95%';
    document.getElementById('dailyGoal').textContent = '4/6 hrs';
    document.getElementById('currentStreak').textContent = '5 days';
    document.getElementById('productivityScore').textContent = 'High';
}

// Function to update charts with new data
function updateCharts(newData) {
    // This function would be called when new study data is available
    // It would update all charts with the latest data
    // Implementation would depend on how the data is structured
}