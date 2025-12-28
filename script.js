// Theme Switching Logic
function setTheme(theme) {
    if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// Tab Switching Logic
function switchTab(view) {
    const calcTab = document.getElementById('tab-calculator');
    const convTab = document.getElementById('tab-converter');
    const calcView = document.getElementById('view-calculator');
    const convView = document.getElementById('view-converter');
    const indicator = document.querySelector('.tab-indicator');

    if (view === 'calculator') {
        calcTab.classList.add('active');
        convTab.classList.remove('active');
        calcView.classList.add('active');
        convView.classList.remove('active');
        indicator.style.transform = 'translateX(0)';
    } else {
        convTab.classList.add('active');
        calcTab.classList.remove('active');
        convView.classList.add('active');
        calcView.classList.remove('active');
        indicator.style.transform = 'translateX(calc(100% + 4px))';
    }
}

// Calculator Logic
let currentExpression = '';
let lastResult = null;

function updateDisplay() {
    const resultDisplay = document.getElementById('calc-result');
    const historyDisplay = document.getElementById('calc-history');

    // Convert * to × and / to ÷ for display
    let displayExp = currentExpression
        .replace(/\*/g, ' × ')
        .replace(/\//g, ' ÷ ')
        .replace(/\*\*2/g, '²')
        .replace(/Math\.sqrt\(/g, '√(');

    resultDisplay.innerText = currentExpression === '' ? '0' : displayExp;
    historyDisplay.innerText = lastResult !== null ? lastResult : '';
}

function appendNumber(num) {
    if (lastResult !== null && currentExpression === '') {
        lastResult = null;
    }
    currentExpression += num;
    updateDisplay();
}

function appendOperator(op) {
    if (currentExpression === '' && op !== 'Math.sqrt(') return;

    // Prevent multiple operators in a row (except for sqrt)
    const lastChar = currentExpression.slice(-1);
    const operators = ['+', '-', '*', '/', '.'];

    if (operators.includes(lastChar) && operators.includes(op)) {
        currentExpression = currentExpression.slice(0, -1) + op;
    } else {
        currentExpression += op;
    }
    updateDisplay();
}

function clearCalc() {
    currentExpression = '';
    lastResult = null;
    updateDisplay();
}

function deleteLast() {
    if (currentExpression.endsWith('Math.sqrt(')) {
        currentExpression = currentExpression.slice(0, -10);
    } else if (currentExpression.endsWith('**2')) {
        currentExpression = currentExpression.slice(0, -3);
    } else {
        currentExpression = currentExpression.slice(0, -1);
    }
    updateDisplay();
}

function calculate() {
    try {
        if (currentExpression === '') return;

        // Count parentheses for sqrt
        let openParen = (currentExpression.match(/\(/g) || []).length;
        let closeParen = (currentExpression.match(/\)/g) || []).length;
        while (openParen > closeParen) {
            currentExpression += ')';
            closeParen++;
        }

        // Evaluate safely
        let result = eval(currentExpression);

        // Handle floating point precision
        result = Math.round(result * 1000000) / 1000000;

        lastResult = currentExpression.replace(/\*/g, '×').replace(/\//g, '÷').replace(/\*\*2/g, '²').replace(/Math\.sqrt\(/g, '√(') + ' =';
        currentExpression = result.toString();
        updateDisplay();
    } catch (error) {
        document.getElementById('calc-result').innerText = 'Error';
        setTimeout(() => updateDisplay(), 1000);
    }
}

// Converter Logic
let currentFromUnit = 'km';
let currentToUnit = 'm';

function toggleDropdown(type) {
    const dropdown = document.getElementById(`dropdown-${type}`);
    const isOpen = dropdown.classList.contains('open');

    // Close all first
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));

    if (!isOpen) {
        dropdown.classList.add('open');
    }
}

function selectUnit(type, value, text) {
    if (type === 'from') {
        currentFromUnit = value;
        document.getElementById('selected-from').innerText = text;
    } else {
        currentToUnit = value;
        document.getElementById('selected-to').innerText = text;
    }

    // Update active state in UI
    const options = document.querySelectorAll(`#options-${type} .option`);
    options.forEach(opt => {
        if (opt.innerText === text) opt.classList.add('active');
        else opt.classList.remove('active');
    });

    document.getElementById(`dropdown-${type}`).classList.remove('open');
    doConvert();
}

function swapUnits() {
    const fromVal = currentFromUnit;
    const fromText = document.getElementById('selected-from').innerText;
    const toVal = currentToUnit;
    const toText = document.getElementById('selected-to').innerText;

    selectUnit('from', toVal, toText);
    selectUnit('to', fromVal, fromText);
}

function doConvert() {
    const inputVal = parseFloat(document.getElementById('convert-input').value);
    const resultBox = document.getElementById('convert-result');

    if (isNaN(inputVal)) {
        resultBox.innerText = '0';
        return;
    }

    // Conversion factors to Meters (Base)
    const factorToM = {
        'km': 1000,
        'm': 1,
        'cm': 0.01,
        'mm': 0.001
    };

    // Value in Meters
    const valueInMeters = inputVal * factorToM[currentFromUnit];

    // Result in Target Unit
    const finalValue = valueInMeters / factorToM[currentToUnit];

    // Handle precision
    resultBox.innerText = Math.round(finalValue * 1000000) / 1000000;
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
    }
});

// Initial Call
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active states
    selectUnit('from', 'km', 'Kilometer (KM)');
    selectUnit('to', 'm', 'Meter (M)');
});
