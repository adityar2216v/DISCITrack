// Global variables
let isTracking = false;
let effectiveTime = 0;
let distractedTime = 0;
let recoveryTime = 0;
let lastHeadPosition = null;
let model = null;
let isDistracted = false;
let distractionStartTime = null;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let reminders = {
    hydration: 1800000, // 30 minutes
    rest: 3600000, // 1 hour
    snacks: 7200000 // 2 hours
};

// Reset all timers
function resetTimers() {
    effectiveTime = 0;
    distractedTime = 0;
    recoveryTime = 0;
    isDistracted = false;
    distractionStartTime = null;
    lastHeadPosition = null;
    updateTimers();
}

// Initialize face detection model
async function initializeModel() {
    try {
        if (typeof blazeface === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        }
        model = await blazeface.load();
        console.log('Face detection model loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading face detection model:', error);
        return false;
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
        await new Promise(resolve => video.onloadedmetadata = () => resolve());
        await video.play();
        return true;
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Failed to access camera. Please ensure camera permissions are granted.');
        return false;
    }
}



// Session time tracking
let sessionStartTime = null;
let sessionInterval = null;
let isPaused = false;
let pausedTime = 0;

function updateSessionTime() {
    if (!sessionStartTime) return;
    
    const now = new Date();
    let diff;
    
    if (isPaused) {
        diff = pausedTime / 1000;
    } else {
        diff = (now - sessionStartTime - pausedTime) / 1000;
    }
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = Math.floor(diff % 60);
    
    // Update digital display with smooth transitions
    const timeDisplay = document.getElementById('sessionTime');
    if (timeDisplay) {
        timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timeDisplay.classList.add('time-update');
        setTimeout(() => timeDisplay.classList.remove('time-update'), 300);
    }
}

// Reset session time
function resetSession() {
    sessionStartTime = null;
    isPaused = false;
    pausedTime = 0;
    
    if (sessionInterval) {
        clearInterval(sessionInterval);
        sessionInterval = null;
    }
    
    // Reset digital display
    const timeDisplay = document.getElementById('sessionTime');
    if (timeDisplay) {
        timeDisplay.textContent = '00:00:00';
    }
}

function formatTime(seconds, includeMilliseconds = false) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const ms = Math.floor((seconds % 1) * 1000);
    const timeStr = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return includeMilliseconds ? `${timeStr}.${String(ms).padStart(3, '0')}` : timeStr;
}

// Head tracking

function updateTimers() {
    // Update time displays
    document.getElementById('effectiveTime').textContent = formatTime(Math.floor(effectiveTime));
    document.getElementById('distractedTime').textContent = formatTime(Math.floor(distractedTime));
    document.getElementById('recoveryTime').textContent = formatTime(Math.floor(recoveryTime));

    // Calculate and update statistics
    const totalTime = effectiveTime + distractedTime;
    if (totalTime > 0) {
        // Update focus rate
        const focusRate = Math.round((effectiveTime / totalTime) * 100);
        document.getElementById('focusRate').textContent = `${focusRate}%`;

        // Update total study time in hours
        const totalHours = Math.round((totalTime / 3600) * 10) / 10;
        document.getElementById('totalStudyTime').textContent = `${totalHours} Hours`;

        // Calculate productivity score (0-100)
        const productivityScore = Math.round(
            (focusRate * 0.6) + // Weight focus rate at 60%
            ((1 - (recoveryTime / totalTime)) * 40) // Weight recovery efficiency at 40%
        );
        document.getElementById('productivityScore').textContent = productivityScore;

        // Calculate recovery rate
        const recoveryRate = Math.round((recoveryTime / distractedTime) * 100) || 0;
        document.getElementById('recoveryRate').textContent = `${recoveryRate}%`;
    }
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
                
                const now = new Date().getTime();
                if (movement > 50) {
                    distractedTime++;
                    if (!isDistracted) {
                        isDistracted = true;
                        distractionStartTime = now;
                    }
                } else {
                    effectiveTime++;
                    if (isDistracted) {
                        isDistracted = false;
                        if (distractionStartTime) {
                            recoveryTime += Math.floor((now - distractionStartTime) / 1000);
                            distractionStartTime = null;
                        }
                    }
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

// Event Listeners for tracking controls
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startTracking');
    const pauseButton = document.getElementById('pauseTracking');
    const resetButton = document.getElementById('resetTracking');

    startButton.addEventListener('click', async function() {
        if (!isTracking) {
            if (!model) {
                const modelLoaded = await initializeModel();
                if (!modelLoaded) {
                    alert('Failed to load face detection model. Please try again.');
                    return;
                }
            }
            const cameraReady = await setupCamera();
            if (!cameraReady) return;
            
            isTracking = true;
            sessionStartTime = new Date();
            sessionInterval = setInterval(updateSessionTime, 1000);
            detectHead();
            this.textContent = 'Stop Tracking';
            pauseButton.disabled = false;
        } else {
            isTracking = false;
            resetSession();
            this.textContent = 'Start Tracking';
            pauseButton.disabled = true;
            pauseButton.textContent = 'Pause';
        }
    });

    pauseButton.addEventListener('click', function() {
        if (isTracking) {
            isTracking = false;
            this.textContent = 'Resume';
        } else {
            isTracking = true;
            detectHead();
            this.textContent = 'Pause';
        }
    });

    resetButton.addEventListener('click', function() {
        isTracking = false;
        resetTimers();
        resetSession();
        startButton.textContent = 'Start Tracking';
        pauseButton.textContent = 'Pause';
        pauseButton.disabled = true;
    });
});

// Scheduler functionality
function openSchedulerModal() {
    document.getElementById('schedulerModal').style.display = 'block';
    renderTasks();
}

function closeSchedulerModal() {
    document.getElementById('schedulerModal').style.display = 'none';
}

function showAddTaskForm() {
    const taskList = document.getElementById('taskList');
    const formHtml = `
        <div class="task-item" id="addTaskForm">
            <div class="task-details">
                <input type="text" id="taskTitle" placeholder="Task title" class="mb-2 p-2 w-full">
                <input type="datetime-local" id="taskTime" class="mb-2 p-2 w-full">
            </div>
            <div class="task-actions">
                <button class="task-btn edit" onclick="saveTask()">Save</button>
                <button class="task-btn delete" onclick="cancelAddTask()">Cancel</button>
            </div>
        </div>
    `;
    taskList.insertAdjacentHTML('afterbegin', formHtml);
}

function cancelAddTask() {
    document.getElementById('addTaskForm').remove();
}

function saveTask() {
    const title = document.getElementById('taskTitle').value;
    const time = document.getElementById('taskTime').value;
    
    if (!title || !time) {
        alert('Please fill in all fields');
        return;
    }
    
    const task = {
        id: Date.now(),
        title,
        time,
        completed: false
    };
    
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    cancelAddTask();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const taskElement = document.getElementById(`task-${taskId}`);
    
    const formHtml = `
        <div class="task-details">
            <input type="text" id="editTitle-${taskId}" value="${task.title}" class="mb-2 p-2 w-full">
            <input type="datetime-local" id="editTime-${taskId}" value="${task.time}" class="mb-2 p-2 w-full">
        </div>
        <div class="task-actions">
            <button class="task-btn edit" onclick="saveEditTask(${taskId})">Save</button>
            <button class="task-btn delete" onclick="renderTasks()">Cancel</button>
        </div>
    `;
    
    taskElement.innerHTML = formHtml;
}

function saveEditTask(taskId) {
    const title = document.getElementById(`editTitle-${taskId}`).value;
    const time = document.getElementById(`editTime-${taskId}`).value;
    
    if (!title || !time) {
        alert('Please fill in all fields');
        return;
    }
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    tasks[taskIndex] = { ...tasks[taskIndex], title, time };
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = tasks
        .sort((a, b) => new Date(a.time) - new Date(b.time))
        .map(task => `
            <div class="task-item" id="task-${task.id}">
                <div class="task-details">
                    <div class="task-title">${task.title}</div>
                    <div class="task-time">${new Date(task.time).toLocaleString()}</div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit" onclick="editTask(${task.id})">Edit</button>
                    <button class="task-btn delete" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `)
        .join('');
}

// Event listeners
// Scheduler button event listener
document.getElementById('schedulerBtn').addEventListener('click', () => {
    openSchedulerModal();
});

// Update the start tracking event listener
document.getElementById('startTracking').addEventListener('click', async () => {
    const startButton = document.getElementById('startTracking');
    const video = document.getElementById('video');
    const videoContainer = document.querySelector('.video-container');
    
    if (!isTracking) {
        // Start tracking
        if (!model) await initializeModel();
        await setupCamera();
        isTracking = true;
        sessionStartTime = new Date();
        sessionInterval = setInterval(updateSessionTime, 1000);
        detectHead();
        
        // Update button
        startButton.textContent = 'Stop Tracking';
        startButton.classList.add('active');
        
        // Add wave effect
        videoContainer.style.animation = 'focusWave 2s ease-out';
        setTimeout(() => {
            videoContainer.style.animation = '';
        }, 2000);
    } else {
        // Stop tracking
        isTracking = false;
        
        // Clear intervals and reset timers
        clearInterval(sessionInterval);
        sessionInterval = null;
        
        // Reset tracking variables
        lastHeadPosition = null;
        isDistracted = false;
        distractionStartTime = null;
        
        // Stop camera stream
        if (video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
        }
        
        // Clear canvas
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Record study session if there was effective time
        if (effectiveTime > 0) {
            updateTimers();
        }
        
        // Update button
        startButton.textContent = 'Start Tracking';
        startButton.classList.remove('active');
    }
});

document.getElementById('pauseTracking').addEventListener('click', () => {
    const pauseButton = document.getElementById('pauseTracking');
    if (!isPaused) {
        isPaused = true;
        isTracking = false;
        clearInterval(sessionInterval);
        pauseButton.textContent = 'Resume';
        // Store the accumulated time when pausing
        pausedTime = new Date() - sessionStartTime - pausedTime;
    } else {
        isPaused = false;
        isTracking = true;
        // Keep the original session start time
        sessionInterval = setInterval(updateSessionTime, 1000);
        detectHead();
        pauseButton.textContent = 'Pause';
    }
});

// Reset all tracking data and timers
function resetTrackingData() {
    // Reset tracking flags
    isTracking = false;
    isDistracted = false;

    // Reset all time counters
    effectiveTime = 0;
    distractedTime = 0;
    recoveryTime = 0;

    // Reset tracking variables
    distractionStartTime = null;
    sessionStartTime = null;
    lastHeadPosition = null;

    // Clear any running intervals
    clearInterval(sessionInterval);
    sessionInterval = null;

    // Reset UI displays
    document.getElementById('sessionTime').textContent = '00:00:00';
    document.getElementById('startTracking').textContent = 'Start Tracking';
    document.getElementById('startTracking').classList.remove('active');
    
    // Update all timer displays
    updateTimers();

    // Reset statistics
    document.getElementById('totalStudyTime').textContent = '0 Hours';
    document.getElementById('focusRate').textContent = '0%';
    document.getElementById('productivityScore').textContent = '0';
    document.getElementById('recoveryRate').textContent = '0%';
}

// Add reset event listener
document.getElementById('resetTracking').addEventListener('click', resetTrackingData);

// Theme toggling
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeButton = document.getElementById('themeToggle');
    const themeDropdown = document.createElement('div');
    themeDropdown.className = 'theme-dropdown hidden absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-[100]';
    themeDropdown.style.backgroundColor = 'var(--calendar-bg)';
    themeDropdown.style.color = 'var(--text-color)';
    themeDropdown.innerHTML = `
        <button class="theme-option w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors rounded-t-lg" data-theme="light">
            <span class="mr-2">☀️</span>Light Mode
        </button>
        <button class="theme-option w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors rounded-b-lg" data-theme="gradient-dark">
            <span class="mr-2">🌈</span>Dark Purple Gradient
        </button>
    `;
    
    themeButton.parentNode.appendChild(themeDropdown);
    
    // Set initial theme
    setTheme(savedTheme);
    
    // Theme button click handler
    themeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('hidden');
    });
    
    // Theme option click handlers
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            setTheme(theme);
            themeDropdown.classList.add('hidden');
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        themeDropdown.classList.add('hidden');
    });
}

function setTheme(theme) {
    document.body.classList.remove('dark-mode', 'gradient-dark-mode');
    const themeButton = document.getElementById('themeToggle');
    
    switch(theme) {
        case 'dark':
            document.body.classList.add('dark-mode');
            themeButton.innerHTML = '<span class="mr-2">🌙</span>Theme';
            break;
        case 'gradient-dark':
            document.body.classList.add('dark-mode', 'gradient-dark-mode');
            themeButton.innerHTML = '<span class="mr-2">🌈</span>Theme';
            break;
        default: // light
            themeButton.innerHTML = '<span class="mr-2">☀️</span>Theme';
            break;
    }
    
    localStorage.setItem('theme', theme);
}




// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize theme
        initializeTheme();
        
        // Initialize face detection
        await initializeModel();
        
        // Setup initial UI state
        const pauseButton = document.getElementById('pauseTracking');
        if (pauseButton) {
            pauseButton.disabled = true;
        }
        
        // Create particles
        if (typeof createParticles === 'function') {
            createParticles();
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
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

// Enhanced Calculator Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Calculator Modal Functionality
    const calculatorToggle = document.getElementById('calculatorToggle');
    const calculatorModal = document.getElementById('calculatorModal');
    const closeCalculator = document.querySelector('.close-calculator');
    const calculatorDisplay = document.getElementById('calculatorDisplay');
    const calculatorButtons = document.querySelectorAll('.calculator-btn');
    const calculatorReset = document.getElementById('calculatorReset');
    
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let resetScreen = false;
    
    // Append number to display
    function appendNumber(number) {
        if (currentInput === '0' || resetScreen) {
            currentInput = number;
            resetScreen = false;
        } else {
            currentInput += number;
        }
    }
    
    // Set operation
    function setOperation(operator) {
        if (operation !== null) calculate();
        previousInput = currentInput;
        operation = operator;
        resetScreen = true;
    }
    
    // Perform calculation
    function calculate() {
        let result;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        try {
            switch (operation) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    result = prev / current;
                    break;
                default:
                    return;
            }
            
            currentInput = result.toString();
            operation = null;
            previousInput = '';
            
            // Add calculation animation
            calculatorModal.classList.add('calculation-animation');
            setTimeout(() => {
                calculatorModal.classList.remove('calculation-animation');
            }, 300);
            
        } catch (error) {
            currentInput = 'Error';
            setTimeout(resetCalculator, 1000);
        }
    }

    // Update calculator display
    function updateDisplay() {
        calculatorDisplay.value = currentInput;
    }

    // Reset calculator
    function resetCalculator() {
        currentInput = '0';
        previousInput = '';
        operation = null;
        updateDisplay();
        calculatorModal.classList.add('reset-animation');
        setTimeout(() => {
            calculatorModal.classList.remove('reset-animation');
        }, 300);
    }

    // Handle button clicks
    calculatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;
            
            if (value === '=') {
                calculate();
            } else if (value === 'C') {
                resetCalculator();
            } else if (['+', '-', '*', '/'].includes(value)) {
                setOperation(value);
            } else {
                appendNumber(value);
            }
            
            updateDisplay();
        });
    });

    calculatorToggle.addEventListener('click', () => {
        calculatorModal.classList.add('active');
        resetCalculator();
    });

    closeCalculator.addEventListener('click', () => {
        calculatorModal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === calculatorModal) {
            calculatorModal.classList.remove('active');
        }
    });
    
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



// Add this function to create particles
function createParticles() {
    const container = document.createElement('div');
    container.className = 'focus-particles';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
    }
}
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.setProperty('--duration', `${3 + Math.random() * 7}s`);
        container.appendChild(particle);
    }


// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});

// Add focus wave effect when starting tracking
document.documentElement.requestFullscreen();
document.getElementById('startTracking').addEventListener('click', () => {
    const video = document.querySelector('.video-container');
    video.style.animation = 'focusWave 2s ease-out';
    setTimeout(() => {
        video.style.animation = '';
    }, 2000);
});

// ChatGPT button position handling
const chatGPTButton = document.querySelector('.chatgpt-btn');

function updateChatGPTButtonPosition() {
    // Remove all ChatGPT button positioning code
}

updateChatGPTButtonPosition();
window.addEventListener('scroll', updateChatGPTButtonPosition);
window.addEventListener('resize', updateChatGPTButtonPosition);

window.addEventListener('blur', () => {
    if (isTracking) {
        showWarning();
        handleDistraction();
    }
});
