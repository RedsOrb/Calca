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
let currentCategory = 'length';
let currentFromUnit = 'km';
let currentToUnit = 'm';

const conversionData = {
    length: {
        units: {
            'km': { name: 'Kilometer (KM)', factor: 1000 },
            'm': { name: 'Meter (M)', factor: 1 },
            'dm': { name: 'Decimeter (DM)', factor: 0.1 },
            'cm': { name: 'Centimeter (CM)', factor: 0.01 },
            'mm': { name: 'Millimeter (MM)', factor: 0.001 },
            'microm': { name: 'Micrometer (μm)', factor: 1e-6 },
            'nm': { name: 'Nanometer (nm)', factor: 1e-9 },
            'mile': { name: 'Mile (mi)', factor: 1609.34 },
            'yard': { name: 'Yard (yd)', factor: 0.9144 },
            'foot': { name: 'Foot (ft)', factor: 0.3048 },
            'inch': { name: 'Inch (in)', factor: 0.0254 }
        },
        defaultFrom: 'km',
        defaultTo: 'm'
    },
    data: {
        units: {
            'TB': { name: 'Terabyte (TB)', factor: 1e12 },
            'TiB': { name: 'Tebibyte (TiB)', factor: Math.pow(1024, 4) },
            'GB': { name: 'Gigabyte (GB)', factor: 1e9 },
            'GiB': { name: 'Gibibyte (GiB)', factor: Math.pow(1024, 3) },
            'MB': { name: 'Megabyte (MB)', factor: 1e6 },
            'MiB': { name: 'Mebibyte (MiB)', factor: Math.pow(1024, 2) },
            'KB': { name: 'Kilobyte (KB)', factor: 1e3 },
            'KiB': { name: 'Kibibyte (KiB)', factor: 1024 },
            'B': { name: 'Byte (B)', factor: 1 }
        },
        defaultFrom: 'GB',
        defaultTo: 'MB'
    },
    weight: {
        units: {
            'kg': { name: 'Kilogram (kg)', factor: 1 },
            'g': { name: 'Gram (g)', factor: 0.001 },
            'mg': { name: 'Milligram (mg)', factor: 1e-6 },
            'mcg': { name: 'Microgram (μg)', factor: 1e-9 },
            'lb': { name: 'Pound (lb)', factor: 0.453592 },
            'oz': { name: 'Ounce (oz)', factor: 0.0283495 }
        },
        defaultFrom: 'kg',
        defaultTo: 'g'
    },
    time: {
        units: {
            'yr': { name: 'Year (yr)', factor: 31536000 },
            'week': { name: 'Week (wk)', factor: 604800 },
            'day': { name: 'Day (d)', factor: 86400 },
            'hr': { name: 'Hour (h)', factor: 3600 },
            'min': { name: 'Minute (min)', factor: 60 },
            'sec': { name: 'Second (s)', factor: 1 },
            'ms': { name: 'Millisecond (ms)', factor: 0.001 }
        },
        defaultFrom: 'hr',
        defaultTo: 'min'
    },
    speed: {
        units: {
            'mach': { name: 'Mach (Ma)', factor: 340.3 },
            'kn': { name: 'Knot (kn)', factor: 0.514444 },
            'mph': { name: 'Mile/h (mph)', factor: 0.44704 },
            'kmh': { name: 'km/h', factor: 0.277778 },
            'ms': { name: 'm/s', factor: 1 }
        },
        defaultFrom: 'kmh',
        defaultTo: 'ms'
    }
};

function switchCategory(category) {
    currentCategory = category;

    // Update active state of category buttons
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.dataset.cat === category) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Reset units to defaults for this category
    const catData = conversionData[category];
    currentFromUnit = catData.defaultFrom;
    currentToUnit = catData.defaultTo;

    // Repopulate dropdown options
    populateDropdowns();

    // Update trigger text
    document.getElementById('selected-from').innerText = catData.units[currentFromUnit].name;
    document.getElementById('selected-to').innerText = catData.units[currentToUnit].name;

    doConvert();
}

function populateDropdowns() {
    const fromOptions = document.getElementById('options-from');
    const toOptions = document.getElementById('options-to');
    const units = conversionData[currentCategory].units;

    fromOptions.innerHTML = '';
    toOptions.innerHTML = '';

    for (const [key, unit] of Object.entries(units)) {
        const fromOpt = document.createElement('div');
        fromOpt.className = 'option' + (key === currentFromUnit ? ' active' : '');
        fromOpt.innerText = unit.name;
        fromOpt.onclick = () => selectUnit('from', key, unit.name);
        fromOptions.appendChild(fromOpt);

        const toOpt = document.createElement('div');
        toOpt.className = 'option' + (key === currentToUnit ? ' active' : '');
        toOpt.innerText = unit.name;
        toOpt.onclick = () => selectUnit('to', key, unit.name);
        toOptions.appendChild(toOpt);
    }
}

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
    const tempUnit = currentFromUnit;
    const tempText = document.getElementById('selected-from').innerText;

    selectUnit('from', currentToUnit, document.getElementById('selected-to').innerText);
    selectUnit('to', tempUnit, tempText);
}

function doConvert() {
    const inputVal = parseFloat(document.getElementById('convert-input').value);
    const resultBox = document.getElementById('convert-result');

    if (isNaN(inputVal)) {
        resultBox.innerText = '0';
        return;
    }

    const units = conversionData[currentCategory].units;
    const factorFrom = units[currentFromUnit].factor;
    const factorTo = units[currentToUnit].factor;

    // Value in Base Unit
    const valueInBase = inputVal * factorFrom;

    // Result in Target Unit
    const finalValue = valueInBase / factorTo;

    // Handle precision
    if (finalValue === 0) {
        resultBox.innerText = '0';
    } else if (Math.abs(finalValue) < 0.000001 || Math.abs(finalValue) > 1e12) {
        resultBox.innerText = finalValue.toExponential(4);
    } else {
        resultBox.innerText = Math.round(finalValue * 1000000) / 1000000;
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
    }
});

// Initial Call
document.addEventListener('DOMContentLoaded', () => {
    switchCategory('length');
});
