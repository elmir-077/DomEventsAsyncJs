// script.js — DOM event + async examples
const exprEl = document.getElementById('expression');
const displayEl = document.getElementById('display');
const keys = document.querySelector('.keys');

let expression = ''; // saxladığımız ifadə

// Helper funksiyalar
const isOperator = ch => ['+','-','*','/'].includes(ch);

// Update ekran
function updateExpr() {
  exprEl.textContent = expression || '0';
}
function updateDisplay(value) {
  displayEl.textContent = String(value);
}

// Append number
function appendNumber(num) {
  // prevent leading zeros nonsense
  if (expression === '0') expression = num;
  else expression += num;
  updateExpr();
}

// Append operator (tək operator ard-arda olmaz — əvəz et)
function appendOperator(op) {
  if (!expression && op !== '-') return; // boşsa yalnız "-" icazə ver (unary minus)
  const last = expression.slice(-1);
  if (isOperator(last)) {
    // əvəz et
    expression = expression.slice(0,-1) + op;
  } else {
    expression += op;
  }
  updateExpr();
}

// Decimal — hər cari ədəddə yalnız bir nöqtə
function appendDecimal() {
  // son tokeni tap
  const tokens = expression.split(/[\+\-\*\/\(\)]/);
  const last = tokens[tokens.length - 1];
  if (!last.includes('.')) {
    if (last === '') expression += '0.';
    else expression += '.';
    updateExpr();
  }
}

// Paren
function appendParen(p) {
  expression += p;
  updateExpr();
}

// Delete last char (C)
function deleteLast() {
  expression = expression.slice(0,-1);
  updateExpr();
}

// AC
function clearAll() {
  expression = '';
  updateExpr();
  updateDisplay('0');
}

// Percent: son ədədi nisbətə çevir (50 -> (50/100))
function applyPercent() {
  // last number
  const m = expression.match(/(\d+(\.\d+)?)$/);
  if (m) {
    const num = m[1];
    expression = expression.slice(0, m.index) + `(${num}/100)`;
    updateExpr();
  }
}

// async qiymətləndirmə (setTimeout simulyasiya + təhlükəsiz yoxlama)
function computeAsync(expr) {
  return new Promise(resolve => {
    // qısa gecikmə — vizual async göstərmək üçün
    setTimeout(() => {
      try {
        // sanitize: icazə verilən simvollar
        if (!/^[0-9+\-*/().\s%]+$/.test(expr)) throw new Error('Invalid characters');
        // replace any trailing percent like 50% -> (50/100)
        const transformed = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
        // qiymətləndir
        const result = Function('"use strict"; return (' + transformed + ')')();
        if (!isFinite(result)) resolve('Error');
        else {
          // təmizlə (onluq uzunluğunu məhdudlaşdır)
          const rounded = (Math.round((result + Number.EPSILON) * 1e10) / 1e10);
          resolve(rounded);
        }
      } catch (e) {
        resolve('Error');
      }
    }, 300); // 300ms gecikmə
  });
}

// Equals düyməsi
async function doEquals() {
  if (!expression) return;
  updateDisplay('...'); // göstərici
  const res = await computeAsync(expression);
  updateDisplay(res);
  if (res !== 'Error') expression = String(res);
  else expression = '';
  updateExpr();
}

// Event delegation for buttons
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

// Keyboard support
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
  else if (['+','-','*','/'].includes(e.key)) appendOperator(e.key);
  else if (e.key === 'Enter') { e.preventDefault(); doEquals(); }
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === '.') appendDecimal();
  else if (e.key === '%') applyPercent();
});

// Async fetch nümunəsi: themes.json çək, uğurlu olarsa theme tətbiq et
async function loadTheme() {
  try {
    const res = await fetch('themes.json');
    if (!res.ok) throw new Error('no themes');
    const obj = await res.json();
    // default mövzunu tətbiq et
    const theme = obj.default || Object.values(obj)[0];
    for (const k in theme) {
      document.documentElement.style.setProperty(k, theme[k]);
    }
  } catch (err) {
    // fetch uğursuz olsa, fallback ilə davam et (normal işləyəcək)
    // console.log('theme load fail', err);
  }
}

// səhifə yüklənəndə
window.addEventListener('load', () => {
  updateExpr();
  updateDisplay('0');
  loadTheme(); // async çağırış nümunəsi
});
