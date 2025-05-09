// Calculator State
let currentExpression = '0';
let lastResult = null;

// DOM Elements
const calculatorBtn = document.getElementById('calculatorBtn');
const chatGptBtn = document.getElementById('chatGptBtn');
const calculatorModal = document.getElementById('calculatorModal');
const calculatorOverlay = document.getElementById('calculatorOverlay');
const display = document.getElementById('display');

// Calculator Functions
function appendNumber(number) {
    if (currentExpression === '0' && number !== '.') {
        currentExpression = number;
    } else {
        currentExpression += number;
    }
    updateDisplay();
}

function addOperator(operator) {
    currentExpression += operator;
    updateDisplay();
}

function clearDisplay() {
    currentExpression = '0';
    updateDisplay();
}

function calculate() {
    try {
        // Safely evaluate the expression
        lastResult = Function('return ' + currentExpression)();
        currentExpression = String(lastResult);
        updateDisplay();
    } catch (error) {
        currentExpression = 'Error';
        updateDisplay();
        setTimeout(clearDisplay, 1500);
    }
}

function updateDisplay() {
    display.textContent = currentExpression;
}

// Modal Controls
function toggleCalculator() {
    calculatorModal.classList.toggle('active');
    calculatorOverlay.classList.toggle('active');
    if (calculatorModal.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeCalculator() {
    calculatorModal.classList.remove('active');
    calculatorOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Add event listener for calculator close button
document.getElementById('closeCalculator').addEventListener('click', closeCalculator);
calculatorOverlay.addEventListener('click', closeCalculator);

// Scheduler State
let scheduledTasks = JSON.parse(localStorage.getItem('scheduledTasks') || '[]');

// Scheduler DOM Elements
const schedulerBtn = document.getElementById('schedulerBtn');
const schedulerModal = document.getElementById('schedulerModal');
const schedulerOverlay = document.getElementById('schedulerOverlay');
const timeGrid = document.querySelector('.time-grid');
const taskInput = document.getElementById('taskInput');
const taskTime = document.getElementById('taskTime');

// Scheduler Functions
function toggleScheduler() {
    schedulerModal.classList.toggle('active');
    schedulerOverlay.classList.toggle('active');
    document.body.style.overflow = schedulerModal.classList.contains('active') ? 'hidden' : '';
}

function closeScheduler() {
    schedulerModal.classList.remove('active');
    schedulerOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Update keyboard handler
document.addEventListener('keydown', (e) => {
    const calculatorActive = calculatorModal.classList.contains('active');
    const schedulerActive = schedulerModal.classList.contains('active');
    
    if (schedulerActive) {
        if (e.key === 'Escape') closeScheduler();
    } else if (calculatorActive) {
        // Existing calculator key handling
    }
});

// Add task deletion support
timeGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-task')) {
        const taskElement = e.target.closest('.time-block');
        const taskId = parseInt(taskElement.dataset.id);
        scheduledTasks = scheduledTasks.filter(task => task.id !== taskId);
        taskElement.remove();
        saveSchedule();
    }
});

// Update task creation with IDs
function createTimeBlock(task, time, id) {
    const block = document.createElement('div');
    block.className = 'time-block';
    block.draggable = true;
    block.dataset.id = id;
    block.innerHTML = `
        <span>${time}</span>
        <div>${task}</div>
        <button class="delete-task">×</button>
    `;
    return block;
}

function saveSchedule() {
    localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks));
}

// Event Listeners
schedulerBtn.addEventListener('click', toggleScheduler);
document.getElementById('addTask').addEventListener('click', () => {
    if (taskInput.value && taskTime.value) {
        const newTask = {
            id: Date.now(),
            text: taskInput.value,
            time: taskTime.value
        };
        scheduledTasks.push(newTask);
        timeGrid.appendChild(createTimeBlock(newTask.text, newTask.time));
        taskInput.value = '';
        saveSchedule();
    }
});

// Drag & Drop Implementation
timeGrid.addEventListener('dragstart', (e) => {
    e.target.classList.add('dragging');
});

timeGrid.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(timeGrid, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement) {
        timeGrid.insertBefore(draggable, afterElement);
    } else {
        timeGrid.appendChild(draggable);
    }
});

function getDragAfterElement(container, y) {
    return Array.from(container.querySelectorAll('.time-block:not(.dragging)'))
        .reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height/2;
            return offset < 0 && offset > closest.offset 
                ? { offset: offset, element: child } 
                : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Update dragend handler
timeGrid.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
    scheduledTasks = Array.from(timeGrid.children).map(child => ({
        id: parseInt(child.dataset.id),
        text: child.querySelector('div').textContent,
        time: child.querySelector('span').textContent
    }));
    saveSchedule();
});

// Update task initialization
scheduledTasks.forEach(task => {
    timeGrid.appendChild(createTimeBlock(task.text, task.time, task.id));
});

// Update addTask handler
timeGrid.appendChild(createTimeBlock(newTask.text, newTask.time, newTask.id));
taskInput.value = '';
saveSchedule();

// ChatGPT Integration
chatGptBtn.addEventListener('click', () => {
    window.open('https://chat.openai.com', '_blank');
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if (!calculatorModal.classList.contains('active')) return;

    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        appendNumber(e.key);
    } else if (['+', '-', '*', '/', '(', ')'].includes(e.key)) {
        addOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
    } else if (e.key === 'Escape') {
        toggleCalculator();
    } else if (e.key === 'Backspace') {
        currentExpression = currentExpression.slice(0, -1) || '0';
        updateDisplay();
    }
});