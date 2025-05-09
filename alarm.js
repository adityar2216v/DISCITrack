document.addEventListener('DOMContentLoaded', () => {
    const alarmToggle = document.getElementById('alarmToggle');
    const alarmModal = document.querySelector('.alarm-modal');
    const alarmOverlay = document.querySelector('.alarm-modal-overlay');
    const alarmForm = document.getElementById('alarmForm');
    const cancelAlarm = document.getElementById('cancelAlarm');
    let activeAlarm = null;
    let alarmTimeout = null;

    // Show modal
    alarmToggle.addEventListener('click', () => {
        alarmModal.classList.add('active');
        alarmOverlay.classList.add('active');
    });

    // Hide modal
    function hideModal() {
        alarmModal.classList.remove('active');
        alarmOverlay.classList.remove('active');
        alarmForm.reset();
    }

    cancelAlarm.addEventListener('click', hideModal);
    alarmOverlay.addEventListener('click', hideModal);

    // Handle alarm form submission
    alarmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const timeInput = document.getElementById('alarmTime').value;
        const message = document.getElementById('alarmMessage').value;
        
        // Clear any existing alarm
        if (alarmTimeout) {
            clearTimeout(alarmTimeout);
        }

        // Set new alarm
        const [hours, minutes] = timeInput.split(':');
        const alarmTime = new Date();
        alarmTime.setHours(parseInt(hours));
        alarmTime.setMinutes(parseInt(minutes));
        alarmTime.setSeconds(0);

        // If the time has already passed today, set it for tomorrow
        if (alarmTime < new Date()) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }

        const timeUntilAlarm = alarmTime - new Date();

        activeAlarm = {
            time: alarmTime,
            message: message || 'Time to study!'
        };

        // Set the alarm
        alarmTimeout = setTimeout(() => {
            triggerAlarm(activeAlarm.message);
        }, timeUntilAlarm);

        // Show confirmation
        const formattedTime = alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        alert(`Alarm set for ${formattedTime}`);
        hideModal();
    });

    function triggerAlarm(message) {
        // Create and show notification
        if (Notification.permission === 'granted') {
            new Notification('Study Time!', {
                body: message,
                icon: 'logo.jpg'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Study Time!', {
                        body: message,
                        icon: 'logo.jpg'
                    });
                }
            });
        }

        // Play alarm sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play();

        // Reset alarm
        activeAlarm = null;
        alarmTimeout = null;
    }

    // Request notification permission on page load
    if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
});