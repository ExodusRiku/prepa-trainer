// Clavier virtuel de symboles: insertion au curseur dans un <input>
const PAGES = {
  '123': [
    ['7', '8', '9', '÷', '(', ')'],
    ['4', '5', '6', '×', '^', '√'],
    ['1', '2', '3', '−', 'π', 'e'],
    ['0', ',', '±', '+', '/', '⌫'],
  ],
  'fx': [
    ['×10^', '10^', '²', '³', '⁻¹', '∞'],
    ['ln(', 'exp(', 'sin(', 'cos(', 'tan(', ';'],
    ['√(', 'arctan(', '!', '%', '°', 'abs('],
    ['(', ')', '^(', '-', '/', '⌫'],
  ],
};

export function buildKeypad(container, input) {
  let page = '123';
  const render = () => {
    container.innerHTML = '';
    const tabs = document.createElement('div'); tabs.className = 'kp-tabs';
    Object.keys(PAGES).forEach((p) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = p === '123' ? '123' : 'f(x) ∞'; b.className = p === page ? 'on' : '';
      b.onclick = () => { page = p; render(); }; tabs.appendChild(b);
    });
    const clr = document.createElement('button'); clr.type = 'button'; clr.textContent = 'Effacer'; clr.onclick = () => { input.value = ''; input.focus(); }; tabs.appendChild(clr);
    container.appendChild(tabs);
    PAGES[page].forEach((row) => {
      const d = document.createElement('div'); d.className = 'kp-row';
      row.forEach((k) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = k;
        b.onmousedown = (e) => e.preventDefault(); // garde le focus
        b.onclick = () => insert(k);
        d.appendChild(b);
      });
      container.appendChild(d);
    });
  };
  function insert(k) {
    const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
    if (k === '⌫') {
      if (s !== e) input.setRangeText('', s, e, 'end');
      else if (s > 0) input.setRangeText('', s - 1, s, 'end');
      return;
    }
    if (k === '±') {
      input.value = input.value.startsWith('−') || input.value.startsWith('-') ? input.value.slice(1) : '−' + input.value;
      return;
    }
    input.setRangeText(k, s, e, 'end');
  }
  render();
}
