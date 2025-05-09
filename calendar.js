document.addEventListener('DOMContentLoaded', () => {
    const calendarBtn = document.getElementById('calendarBtn');
    let currentDate = new Date();
    let selectedDate = new Date();
    
    function updateDate() {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        calendarBtn.setAttribute('data-date', formattedDate);
        calendarBtn.classList.add('date-visible');
    }
    
    // Create calendar modal
    const calendarModal = document.createElement('div');
    calendarModal.className = 'calendar-modal';
    document.body.appendChild(calendarModal);

    const calendarOverlay = document.createElement('div');
    calendarOverlay.className = 'calendar-modal-overlay';
    document.body.appendChild(calendarOverlay);

    function generateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];

        calendarModal.innerHTML = `
            <div class="calendar-header">
                <button class="calendar-nav prev">❮</button>
                <h2>${monthNames[month]} ${year}</h2>
                <button class="calendar-nav next">❯</button>
            </div>
            <div class="calendar-grid">
                <div class="weekday">Sun</div>
                <div class="weekday">Mon</div>
                <div class="weekday">Tue</div>
                <div class="weekday">Wed</div>
                <div class="weekday">Thu</div>
                <div class="weekday">Fri</div>
                <div class="weekday">Sat</div>
                ${Array(firstDay).fill('<div class="day empty"></div>').join('')}
                ${Array(daysInMonth).fill(0).map((_, i) => {
                    const day = i + 1;
                    const isToday = new Date(year, month, day).toDateString() === new Date().toDateString();
                    const isSelected = new Date(year, month, day).toDateString() === selectedDate.toDateString();
                    return `<div class="day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}">${day}</div>`;
                }).join('')}
            </div>
        `;

        // Add event listeners to navigation buttons
        calendarModal.querySelector('.prev').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar();
        });

        calendarModal.querySelector('.next').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar();
        });

        // Add event listeners to days
        calendarModal.querySelectorAll('.day:not(.empty)').forEach(day => {
            day.addEventListener('click', () => {
                selectedDate = new Date(year, month, parseInt(day.textContent));
                updateDate();
                hideCalendar();
            });
        });
    }

    function showCalendar() {
        generateCalendar();
        calendarModal.classList.add('active');
        calendarOverlay.classList.add('active');
    }

    function hideCalendar() {
        calendarModal.classList.remove('active');
        calendarOverlay.classList.remove('active');
    }

    // Update date immediately and then every minute
    updateDate();
    setInterval(updateDate, 60000);
    
    // Add click handlers
    calendarBtn.addEventListener('click', () => {
        calendarBtn.classList.remove('animate__fadeIn');
        calendarBtn.classList.add('animate__animated', 'animate__rubberBand');
        showCalendar();
        
        // Remove animation classes after animation ends
        calendarBtn.addEventListener('animationend', () => {
            calendarBtn.classList.remove('animate__animated', 'animate__rubberBand');
            calendarBtn.classList.add('animate__fadeIn');
        }, { once: true });
    });

    calendarOverlay.addEventListener('click', hideCalendar);
});