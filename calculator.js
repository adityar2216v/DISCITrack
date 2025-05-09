class Calculator {
  constructor() {
    this.display = document.createElement('div');
    this.display.className = 'calculator-display';
    
    this.buttonsContainer = document.createElement('div');
    this.buttonsContainer.className = 'calculator-buttons';
    
    this.createModalStructure();
    this.setupEventListeners();
    this.reset();
  }

  createModalStructure() {
    this.modal = document.createElement('div');
    this.modal.className = 'calculator-modal';
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    this.modal.appendChild(this.display);
    this.modal.appendChild(this.buttonsContainer);
    
    document.body.appendChild(this.modal);
    document.body.appendChild(overlay);
  }

  setupEventListeners() {
    const buttons = [
      '7', '8', '9', '/',
      '4', '5', '6', '*',
      '1', '2', '3', '-',
      '0', '.', '=', '+',
      'Clear'
    ];

    buttons.forEach(value => {
      const button = document.createElement('button');
      button.className = `calc-btn ${['/', '*', '-', '+'].includes(value) ? 'operator' : ''} ${value === '=' ? 'equals' : ''}`;
      button.textContent = value;
      button.addEventListener('click', () => this.handleInput(value));
      this.buttonsContainer.appendChild(button);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9' || ['+', '-', '*', '/', '.', 'Enter', 'Escape'].includes(e.key)) {
        const keyMap = {'Enter': '=', 'Escape': 'Clear'};
        this.handleInput(keyMap[e.key] || e.key);
      }
    });
  }

  handleInput(value) {
    if (value === 'Clear') {
      this.reset();
      return;
    }

    if (value === '=') {
      this.calculate();
      return;
    }

    // Prevent multiple operators in a row
    if (['+', '-', '*', '/'].includes(value)) {
      const lastChar = this.currentInput.slice(-1);
      if (['+', '-', '*', '/'].includes(lastChar)) {
        this.currentInput = this.currentInput.slice(0, -1) + value;
        this.updateDisplay();
        return;
      }
    }

    // Prevent multiple decimal points in a number
    if (value === '.') {
      const parts = this.currentInput.split(/[-+*/]/);
      const lastNumber = parts[parts.length - 1];
      if (lastNumber.includes('.')) return;
    }

    this.currentInput = this.currentInput.toString() + value;
    this.updateDisplay();
  }

  calculate() {
    try {
      // Sanitize input and use Function instead of eval for better security
      const sanitizedInput = this.currentInput.replace(/[^0-9+\-*/.]/g, '');
      if (!sanitizedInput) return;
      
      const result = new Function('return ' + sanitizedInput)();
      
      if (!isFinite(result)) {
        this.currentInput = 'Error';
      } else {
        // Format the result to avoid long decimal numbers
        this.currentInput = parseFloat(result.toFixed(8)).toString();
      }
    } catch {
      this.currentInput = 'Error';
    }
    this.updateDisplay();
  }

  reset() {
    this.currentInput = '';
    this.updateDisplay();
  }

  updateDisplay() {
    this.display.textContent = this.currentInput || '0';
  }
}

// Initialize calculator when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});

// Add calculator button to floating controls
const calcButton = document.createElement('button');
calcButton.className = 'floating-btn';
calcButton.innerHTML = '🖩';
calcButton.addEventListener('click', () => {
  document.querySelector('.calculator-modal').classList.toggle('active');
  document.querySelector('.modal-overlay').classList.toggle('active');
});

document.querySelector('.floating-buttons').appendChild(calcButton);