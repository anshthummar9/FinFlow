/* dashboard.js */
let transactions = [];
let activeTab = 'expense';

document.addEventListener('DOMContentLoaded', () => {
  initForm();
  loadDashboard();
});

// ─── Load all data and render ─────────────────────────────────────────────────
function loadDashboard() {
  fetch(`${BASE_URL}/ExpTrack/transactions/${username}`)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => { transactions = data; renderDashboard(); })
    .catch(() => showToast('Could not load transactions', 'error'));
}

// ─── Render KPI cards + recent list ──────────────────────────────────────────
function renderDashboard() {
  const income  = transactions.filter(t => Number(t.amount) >= 0).reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const bal     = income - expense;

  setText('balanceVal', `₹${bal.toFixed(2)}`);
  setText('incomeVal',  `₹${income.toFixed(2)}`);
  setText('expenseVal', `₹${expense.toFixed(2)}`);

  const list = document.getElementById('recentList');
  if (!list) return;
  list.innerHTML = '';

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date) || (b.id || 0) - (a.id || 0))
    .slice(0, 5);

  if (recent.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1"/></svg>
        <h3>No transactions yet</h3>
        <p>Add your first transaction using the form above</p>
      </div>`;
    return;
  }

  recent.forEach(t => {
    const isIncome = Number(t.amount) >= 0;
    const catIcon  = getCatIcon(t.category, isIncome);
    const accIcon  = getAccIcon(t.account);
    const row      = document.createElement('div');
    row.className  = 'recent-row';
    row.innerHTML  = `
      <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
        <div class="recent-icon ${isIncome ? 'income' : 'expense'}">${catIcon || (isIncome ? '📈' : '📉')}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${t.text || (isIncome ? 'Income' : 'Expense')}
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
            ${formatDate(t.date)}${t.category ? ` · ${catIcon} ${t.category}` : ''}${t.account ? ` · ${accIcon} ${t.account}` : ''}
          </div>
        </div>
      </div>
      <span style="font-size:15px;font-weight:700;${isIncome ? 'color:var(--income-color)' : 'color:var(--expense-color)'};">
        ${isIncome ? '+' : '-'}₹${Math.abs(Number(t.amount)).toFixed(2)}
      </span>`;
    list.appendChild(row);
  });
}

// ─── Form setup ───────────────────────────────────────────────────────────────
function initForm() {
  // Type tab switching
  document.querySelectorAll('.type-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.type;
      populateCategorySelect(document.getElementById('catSelect'), activeTab);
    });
  });

  // Populate selects on load
  populateCategorySelect(document.getElementById('catSelect'), 'expense');
  populateAccountSelect(document.getElementById('accSelect'));

  // Add button
  const addBtn = document.getElementById('addBtn');
  addBtn?.addEventListener('click', addTransaction);

  // Allow Enter key from amount field
  document.getElementById('amtInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTransaction();
  });
}

function addTransaction() {
  const desc   = document.getElementById('descInput').value.trim();
  const amount = parseFloat(document.getElementById('amtInput').value);
  const cat    = document.getElementById('catSelect').value;
  const acc    = document.getElementById('accSelect').value;

  if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }

  const finalAmt = activeTab === 'expense' ? -Math.abs(amount) : Math.abs(amount);

  // Disable button during request
  const addBtn = document.getElementById('addBtn');
  if (addBtn) { addBtn.disabled = true; addBtn.style.opacity = '0.6'; }

  fetch(`${BASE_URL}/ExpTrack/transactions/${username}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ text: desc, amount: finalAmt, date: todayStr(), category: cat, account: acc }),
  })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(() => {
      // Re-fetch from server to guarantee fresh data
      return fetch(`${BASE_URL}/ExpTrack/transactions/${username}`)
        .then(r => r.json())
        .then(data => { transactions = data; });
    })
    .then(() => {
      renderDashboard();
      document.getElementById('descInput').value  = '';
      document.getElementById('amtInput').value   = '';
      document.getElementById('catSelect').value  = '';
      document.getElementById('accSelect').value  = '';
      showToast('Transaction added!', 'success');
    })
    .catch(() => showToast('Failed to add transaction', 'error'))
    .finally(() => {
      if (addBtn) { addBtn.disabled = false; addBtn.style.opacity = ''; }
    });
}

// ─── Populate helpers ─────────────────────────────────────────────────────────
function populateCategorySelect(sel, type) {
  if (!sel) return;
  const cats = type === 'income' ? getIncomeCats() : getExpenseCats();
  sel.innerHTML = '<option value="">Category…</option>';
  cats.forEach(c => sel.appendChild(new Option(`${c.icon} ${c.value}`, c.value)));
}

function populateAccountSelect(sel) {
  if (!sel) return;
  sel.innerHTML = '<option value="">Account…</option>';
  getAccounts().forEach(a => sel.appendChild(new Option(`${a.icon} ${a.value}`, a.value)));
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
