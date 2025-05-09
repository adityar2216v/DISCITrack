// Window focus detection
let isWindowFocused = true;
let lastBlurTime = null;
let warningCount = 0;
let isFullscreen = false;

// Request notification permission
if ('Notification' in window) {
    Notification.requestPermission();
}

// Function to show notification
function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Study Focus Alert', {
            body: message,
            icon: '/logo.jpg'
        });
    }
}

// Prevent keyboard shortcuts for tab switching and handle fullscreen
document.addEventListener('keydown', (e) => {
    if (isTracking) {
        // Prevent all keyboard shortcuts that could disrupt focus
        if (
            (e.altKey && e.key === 'Tab') || // Alt+Tab
            (e.metaKey && e.key === 'Tab') || // Cmd+Tab
            (e.ctrlKey && e.key === 'Tab') || // Ctrl+Tab
            (e.altKey && e.key === 't') || // Alt+T
            (e.ctrlKey && e.key === 't') || // Ctrl+T (new tab)
            (e.ctrlKey && e.key === 'w') || // Ctrl+W (close tab)
            (e.ctrlKey && e.key === 'n') || // Ctrl+N (new window)
            (e.altKey && e.key === 'F4') || // Alt+F4
            (e.key === 'F11') || // F11 (fullscreen)
            (e.key === 'Escape') || // Escape (exit fullscreen)
            (e.altKey && (e.key === 'Left' || e.key === 'Right')) || // Alt+Left/Right (browser navigation)
            (e.metaKey && e.key >= '1' && e.key <= '9') || // Cmd+1-9 (tab switching)
            (e.ctrlKey && e.key >= '1' && e.key <= '9') // Ctrl+1-9 (tab switching)
        ) {
            e.preventDefault();
            showNotification('Keyboard shortcuts are disabled during study session');
            showWarning();
        }
    }
});

// Handle fullscreen change
function handleFullscreenChange() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement && 
        isTracking) {
        enterFullscreen();
        showNotification('Fullscreen mode is required during study session');
    }
}

// Start tracking with fullscreen
function startTracking() {
    isTracking = true;
    enterFullscreen();
}

// Stop tracking and exit fullscreen
function stopTracking() {
    isTracking = false;
    exitFullscreen();
}

// Function to enter fullscreen mode
function enterFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
    isFullscreen = true;
}

// Function to exit fullscreen mode
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    isFullscreen = false;
}

// Event listeners for window/tab focus
document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('blur', handleWindowBlur);
window.addEventListener('focus', handleWindowFocus);
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

// Warning modal elements
const warningModal = document.createElement('div');
warningModal.className = 'warning-modal';
warningModal.innerHTML = `
    <div class="warning-content">
        <h3>⚠️ Stay Focused!</h3>
        <p>Switching tabs or windows during study sessions will be counted as distraction time.</p>
        <button id="returnFocus" class="return-btn">Return to Study</button>
    </div>
`;
document.body.appendChild(warningModal);

// Handle visibility change (tab switching)
function handleVisibilityChange() {
    if (document.hidden && isTracking) {
        warningCount++;
        showWarning();
        handleDistraction();
        showNotification(`Focus Lost! (${warningCount} times)`);        
        // Trigger vibration if supported
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    } else {
        hideWarning();
        handleFocusReturn();
    }
}

// Handle window blur (window switching)
function handleWindowBlur() {
    if (isTracking) {
        isWindowFocused = false;
        lastBlurTime = new Date();
        showWarning();
        handleDistraction();
    }
}

// Handle window focus return
function handleWindowFocus() {
    if (isTracking && !isWindowFocused) {
        isWindowFocused = true;
        hideWarning();
        handleFocusReturn();
    }
}

// Show warning modal
function showWarning() {
    warningModal.style.display = 'flex';
    warningModal.classList.add('animate__animated', 'animate__fadeIn');
}

// Hide warning modal
function hideWarning() {
    warningModal.classList.remove('animate__fadeIn');
    warningModal.classList.add('animate__fadeOut');
    setTimeout(() => {
        warningModal.style.display = 'none';
        warningModal.classList.remove('animate__fadeOut');
    }, 500);
}

// Handle distraction period
function handleDistraction() {
    if (!isDistracted) {
        isDistracted = true;
        distractionStartTime = new Date();
    }
}

// Handle focus return
function handleFocusReturn() {
    if (isDistracted && lastBlurTime) {
        const distractionDuration = Math.floor((new Date() - lastBlurTime) / 1000);
        distractedTime += distractionDuration;
        recoveryTime += Math.floor((new Date() - distractionStartTime) / 1000);
        
        isDistracted = false;
        distractionStartTime = null;
        lastBlurTime = null;
        
        updateTimers();
    }
}

// Event listener for return button
document.getElementById('returnFocus').addEventListener('click', () => {
    hideWarning();
});