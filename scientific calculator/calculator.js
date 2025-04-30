let currentExpression = '';
let history = [];

function appendNumber(number) {
    currentExpression += number;
    updateDisplay();
}

function appendOperator(operator) {
    currentExpression += operator;
    updateDisplay();
}

function calculate(operation) {
    const value = parseFloat(currentExpression);
    if (isNaN(value)) return;

    switch(operation) {
        case 'sin':
            currentExpression = Math.sin(value * Math.PI / 180).toString();
            break;
        case 'cos':
            currentExpression = Math.cos(value * Math.PI / 180).toString();
            break;
        case 'tan':
            currentExpression = Math.tan(value * Math.PI / 180).toString();
            break;
        case 'sqrt':
            currentExpression = Math.sqrt(value).toString();
            break;
    }
    updateDisplay();
}

function calculateResult() {
    try {
        const result = eval(currentExpression);
        const calculation = `${currentExpression} = ${result}`;
        history.unshift(calculation);
        currentExpression = result.toString();
        updateDisplay();
        updateHistory();
    } catch (error) {
        currentExpression = 'Error';
        updateDisplay();
    }
}

function clearDisplay() {
    currentExpression = '';
    updateDisplay();
}

function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('display').value = currentExpression;
}

function updateHistory() {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '';
    
    history.forEach(calculation => {
        const historyItem = document.createElement('div');
        historyItem.className = 'p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100';
        historyItem.textContent = calculation;
        historyItem.onclick = () => {
            currentExpression = calculation.split('=')[1].trim();
            updateDisplay();
        };
        historyDiv.appendChild(historyItem);
    });
}

// Initialize display
updateDisplay();