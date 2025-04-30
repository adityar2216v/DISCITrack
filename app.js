// Global variables
let isTracking = false;
let effectiveTime = 0;
let distractedTime = 0;
let recoveryTime = 0;
let lastHeadPosition = null;
let model = null;
let reminders = {
    hydration: 1800000, // 30 minutes
    rest: 3600000, // 1 hour
    snacks: 7200000 // 2 hours
};

// Initialize face detection model
async function initializeModel() {
    try {
        model = await blazeface.load();
        console.log('Face detection model loaded successfully');
    } catch (error) {
        console.error('Error loading face detection model:', error);
    }
}

// Camera setup
async function setupCamera() {
    const video = document.getElementById('video');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: 640,
                height: 480,
                facingMode: 'user'
            }
        });
        video.srcObject = stream;
        return new Promise(resolve => video.onloadedmetadata = () => resolve());
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}

// Clock functions
function updateClock() {
    const now = new Date();
    document.getElementById('hours').textContent = String(now.getHours()).padStart(2, '0');
    document.getElementById('minutes').textContent = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('seconds').textContent = String(now.getSeconds()).padStart(2, '0');
    
    // Update the navigation clock as well
    document.getElementById('digitalClock').textContent = 
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

// Session time tracking
let sessionStartTime = null;
let sessionInterval = null;

function updateSessionTime() {
    if (!sessionStartTime) return;
    
    const now = new Date();
    const diff = Math.floor((now - sessionStartTime) / 1000);
    document.getElementById('sessionTime').textContent = formatTime(diff);
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Head tracking

function updateTimers() {
    document.getElementById('effectiveTime').textContent = formatTime(effectiveTime);
    document.getElementById('distractedTime').textContent = formatTime(distractedTime);
    document.getElementById('recoveryTime').textContent = formatTime(recoveryTime);
}

// Update the detectHead function to properly track time
async function detectHead() {
    if (!isTracking) return;
    
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    try {
        const predictions = await model.estimateFaces(video, false);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (predictions.length > 0) {
            const currentPosition = predictions[0].topLeft;
            if (lastHeadPosition) {
                const movement = Math.abs(currentPosition[0] - lastHeadPosition[0]) +
                               Math.abs(currentPosition[1] - lastHeadPosition[1]);
                
                if (movement > 50) {
                    distractedTime++;
                    recoveryTime++;
                } else {
                    effectiveTime++;
                }
                updateTimers(); // Update timer displays after time changes
            }
            lastHeadPosition = currentPosition;
            
            const size = [predictions[0].bottomRight[0] - predictions[0].topLeft[0],
                         predictions[0].bottomRight[1] - predictions[0].topLeft[1]];
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(currentPosition[0], currentPosition[1], size[0], size[1]);
        }
        
        requestAnimationFrame(detectHead);
    } catch (error) {
        console.error('Error during face detection:', error);
    }
}

// Event listeners
document.getElementById('startTracking').addEventListener('click', async () => {
    if (!model) await initializeModel();
    await setupCamera();
    isTracking = true;
    sessionStartTime = new Date();
    sessionInterval = setInterval(updateSessionTime, 1000);
    detectHead();
});

document.getElementById('pauseTracking').addEventListener('click', () => {
    isTracking = false;
    clearInterval(sessionInterval);
});

// Update the reset function
document.getElementById('resetTracking').addEventListener('click', () => {
    isTracking = false;
    effectiveTime = 0;
    distractedTime = 0;
    recoveryTime = 0;
    sessionStartTime = null;
    clearInterval(sessionInterval);
    document.getElementById('sessionTime').textContent = '00:00:00';
    updateTimers(); // Update timer displays after reset
    lastHeadPosition = null; // Reset head position tracking
});

document.getElementById('resetTracking').addEventListener('click', () => {
    isTracking = false;
    effectiveTime = 0;
    distractedTime = 0;
    recoveryTime = 0;
    sessionStartTime = null;
    clearInterval(sessionInterval);
    document.getElementById('sessionTime').textContent = '00:00:00';
    updateTimers();
    updateStatistics();
});

// Theme toggling
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const button = document.getElementById('themeToggle');
    button.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Start clock updates
    updateClock();
    setInterval(updateClock, 1000);
    
    // Initialize face detection
    initializeModel();
    
    // Create particles
    createParticles();
});



// Add smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
// Add this to the existing app.js file
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    function setActiveLink() {
        const hash = window.location.hash || '#home';
        navLinks.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('hashchange', setActiveLink);
    setActiveLink(); // Set initial active state
});

// Initialize charts
let timeDistributionChart;

function initializeCharts() {
    // Time Distribution Pie Chart
    const timeCtx = document.getElementById('timeDistributionChart').getContext('2d');
    timeDistributionChart = new Chart(timeCtx, {
        type: 'pie',
        data: {
            labels: ['Effective Time', 'Distracted Time', 'Recovery Time'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#4CAF50',
                    '#F44336',
                    '#FFC107'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    displayColors: true
                }
            }
        }
    });
}

// Update charts with real-time data
function updateCharts() {
    if (!timeDistributionChart) return;

    // Update pie chart
    timeDistributionChart.data.datasets[0].data = [
        effectiveTime,
        distractedTime,
        recoveryTime
    ];
    timeDistributionChart.update();

    // Calculate focus percentage
    const totalTime = effectiveTime + distractedTime + recoveryTime;
    const focusPercentage = totalTime > 0 ? Math.round((effectiveTime / totalTime) * 100) : 0;

    // Update summary stats
    document.getElementById('focusScore').textContent = `${focusPercentage}%`;
    document.getElementById('totalTime').textContent = formatTime(totalTime);
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', initializeCharts);

// Update charts every 5 seconds when tracking is active
setInterval(() => {
    if (isTracking) {
        updateCharts();
    }
}, 5000);

// Add this function to create particles
function createParticles() {
    const container = document.createElement('div');
    container.className = 'focus-particles';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.setProperty('--duration', `${3 + Math.random() * 7}s`);
        container.appendChild(particle);
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});

// Add focus wave effect when starting tracking
document.getElementById('startTracking').addEventListener('click', () => {
    const video = document.querySelector('.video-container');
    video.style.animation = 'focusWave 2s ease-out';
    setTimeout(() => {
        video.style.animation = '';
    }, 2000);
});
