const exprEl = document.getElementById('expression');
const displayEl = document.getElementById('display');
const keys = document.querySelector('.keys');

let expression = ''; 


const isOperator = ch => ['+','-','*','/'].includes(ch);


function updateExpr() {
  exprEl.textContent = expression || '0';
}
function updateDisplay(value) {
  displayEl.textContent = String(value);
}


function appendNumber(num) {
  
  if (expression === '0') expression = num;
  else expression += num;
  updateExpr();
}


function appendOperator(op) {
  if (!expression && op !== '-') return; 
  const last = expression.slice(-1);
  if (isOperator(last)) {
   
    expression = expression.slice(0,-1) + op;
  } else {
    expression += op;
  }
  updateExpr();
}


function appendDecimal() {

  const tokens = expression.split(/[\+\-\*\/\(\)]/);
  const last = tokens[tokens.length - 1];
  if (!last.includes('.')) {
    if (last === '') expression += '0.';
    else expression += '.';
    updateExpr();
  }
}


function appendParen(p) {
  expression += p;
  updateExpr();
}


function deleteLast() {
  expression = expression.slice(0,-1);
  updateExpr();
}


function clearAll() {
  expression = '';
  updateExpr();
  updateDisplay('0');
}


function applyPercent() {

  const m = expression.match(/(\d+(\.\d+)?)$/);
  if (m) {
    const num = m[1];
    expression = expression.slice(0, m.index) + `(${num}/100)`;
    updateExpr();
  }
}


function computeAsync(expr) {
  return new Promise(resolve => {

    setTimeout(() => {
      try {
      
        if (!/^[0-9+\-*/().\s%]+$/.test(expr)) throw new Error('Invalid characters');
      
        const transformed = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
   
        const result = Function('"use strict"; return (' + transformed + ')')();
        if (!isFinite(result)) resolve('Error');
        else {
        
          const rounded = (Math.round((result + Number.EPSILON) * 1e10) / 1e10);
          resolve(rounded);
        }
      } catch (e) {
        resolve('Error');
      }
    }, 300);
  });
}


async function doEquals() {
  if (!expression) return;
  updateDisplay('...'); 
  const res = await computeAsync(expression);
  updateDisplay(res);
  if (res !== 'Error') expression = String(res);
  else expression = '';
  updateExpr();
}


keys.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'number') appendNumber(btn.dataset.value);
  else if (action === 'operator') appendOperator(btn.dataset.value);
  else if (action === 'decimal') appendDecimal();
  else if (action === 'ac') clearAll();
  else if (action === 'del') deleteLast();
  else if (action === 'percent') applyPercent();
  else if (action === 'equals') doEquals();
  else if (action === 'paren') appendParen(btn.dataset.value);
});


window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
  else if (['+','-','*','/'].includes(e.key)) appendOperator(e.key);
  else if (e.key === 'Enter') { e.preventDefault(); doEquals(); }
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === '.') appendDecimal();
  else if (e.key === '%') applyPercent();
});


async function loadTheme() {
  try {
    const res = await fetch('themes.json');
    if (!res.ok) throw new Error('no themes');
    const obj = await res.json();
   
    const theme = obj.default || Object.values(obj)[0];
    for (const k in theme) {
      document.documentElement.style.setProperty(k, theme[k]);
    }
  } catch (err) {
  
  }
}


window.addEventListener('load', () => {
  updateExpr();
  updateDisplay('0');
  loadTheme(); 
});
