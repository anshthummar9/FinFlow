/* budgets.js */
let budgets = [];
let txns    = [];
let currentMonth = new Date().getMonth() + 1;
let currentYear  = new Date().getFullYear();

// Edit state
let _editBudget = null; // { id, category, amount }

document.addEventListener('DOMContentLoaded', () => {
  const monthSel = document.getElementById('monthSelect');
  const yearSel  = document.getElementById('yearSelect');

  // Populate year select (current year ± 2)
  if (yearSel) {
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
      const o = new Option(y, y);
      if (y === currentYear) o.selected = true;
      yearSel.appendChild(o);
    }
  }

  if (monthSel) {
    monthSel.value = currentMonth;
    monthSel.addEventListener('change', () => { currentMonth = +monthSel.value; loadData(); });
  }
  if (yearSel) yearSel.addEventListener('change', () => { currentYear = +yearSel.value; loadData(); });

  loadData();
  _bindAddModal();
  _createEditModal();
});

// ─── Data load ────────────────────────────────────────────────────────────────
function loadData() {
  Promise.all([
    fetch(`${BASE_URL}/ExpTrack/budgets/${username}/${currentMonth}/${currentYear}`).then(r => r.json()),
    fetch(`${BASE_URL}/ExpTrack/transactions/${username}`).then(r => r.json()),
  ])
    .then(([b, t]) => { budgets = b; txns = t; render(); })
    .catch(() => showToast('Could not load budgets', 'error'));
}

// ─── Render cards ─────────────────────────────────────────────────────────────
function render() {
  const container = document.getElementById('budgetGrid');
  if (!container) return;
  container.innerHTML = '';

  if (budgets.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;opacity:.4;"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        <h3>No budgets set</h3>
        <p>Click "Add Budget" to set a monthly limit for a category</p>
      </div>`;
    return;
  }

  // Calculate actual spending per category for this month/year
  const spentMap = {};
  txns.filter(t => {
    const d = new Date(t.date);
    return Number(t.amount) < 0 && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  }).forEach(t => {
    spentMap[t.category] = (spentMap[t.category] || 0) + Math.abs(Number(t.amount));
  });

  budgets.forEach(b => {
    const spent     = spentMap[b.category] || 0;
    const pct       = Math.min(100, (spent / b.amount) * 100);
    const fillClass = pct >= 100 ? 'danger' : pct >= 70 ? 'warning' : 'safe';
    const icon      = getCatIcon(b.category, false);
    const remaining = Math.max(0, b.amount - spent);

    const card = document.createElement('div');
    card.className = 'card budget-card';
    card.innerHTML = `
      <div class="budget-card-header">
        <div class="budget-category">
          <span>${icon}</span>
          <span>${b.category}</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <button class="manage-item-edit" style="width:30px;height:30px;" onclick="editBudget(${b.id})" title="Edit limit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="manage-item-del" style="width:30px;height:30px;" onclick="deleteBudget(${b.id})" title="Delete budget">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
      <div class="budget-amounts">
        <span style="color:${fillClass==='danger'?'var(--expense-color)':fillClass==='warning'?'var(--warning-color)':'var(--income-color)'}">
          ₹${spent.toFixed(2)} spent
        </span>
        <span>₹${b.amount.toFixed(2)} limit</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${fillClass}" style="width:${pct}%"></div>
      </div>
      <div style="margin-top:8px;font-size:12px;color:var(--text-muted);">
        ${pct >= 100
          ? `<span style="color:var(--expense-color);font-weight:600;">⚠️ Over budget by ₹${(spent - b.amount).toFixed(2)}</span>`
          : `₹${remaining.toFixed(2)} remaining · ${pct.toFixed(0)}% used`}
      </div>`;
    container.appendChild(card);
  });
}

// ─── Add modal ────────────────────────────────────────────────────────────────
function _bindAddModal() {
  document.getElementById('addBudgetBtn')?.addEventListener('click', () => {
    _populateCategorySelect();
    document.getElementById('addBudgetModal').classList.add('show');
  });
  document.getElementById('closeAddBudgetModal')?.addEventListener('click', () =>
    document.getElementById('addBudgetModal').classList.remove('show'));
  document.getElementById('addBudgetModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
  });
  document.getElementById('saveBudgetBtn')?.addEventListener('click', _saveBudget);
  document.getElementById('budgetAmountInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') _saveBudget();
  });
}

function _populateCategorySelect() {
  const sel = document.getElementById('budgetCategorySelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select category…</option>';
  getExpenseCats().forEach(c => sel.appendChild(new Option(`${c.icon} ${c.value}`, c.value)));
}

function _saveBudget() {
  const cat = document.getElementById('budgetCategorySelect')?.value;
  const amt = parseFloat(document.getElementById('budgetAmountInput')?.value);
  if (!cat) { showToast('Select a category', 'error'); return; }
  if (isNaN(amt) || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }

  fetch(`${BASE_URL}/ExpTrack/budgets/${username}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ category: cat, amount: amt, month: currentMonth, year: currentYear }),
  })
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(() => {
      document.getElementById('addBudgetModal').classList.remove('show');
      document.getElementById('budgetCategorySelect').value = '';
      document.getElementById('budgetAmountInput').value    = '';
      loadData();
      showToast('Budget saved!', 'success');
    })
    .catch(() => showToast('Failed to save budget', 'error'));
}

// ─── Edit modal ───────────────────────────────────────────────────────────────
function editBudget(id) {
  const b = budgets.find(b => b.id === id);
  if (!b) return;
  _editBudget = b;
  const icon = getCatIcon(b.category, false);
  document.getElementById('_budgetEditCatLabel').textContent = `${icon} ${b.category}`;
  document.getElementById('_budgetEditAmount').value = b.amount;
  document.getElementById('_budgetEditModal').classList.add('show');
  document.getElementById('_budgetEditAmount').focus();
  document.getElementById('_budgetEditAmount').select();
}
window.editBudget = editBudget;

function _createEditModal() {
  if (document.getElementById('_budgetEditModal')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = '_budgetEditModal';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:380px;">
      <div class="modal-header">
        <h2 class="modal-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;color:var(--primary-light);"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit Budget
        </h2>
        <button class="modal-close" id="_budgetEditClose">&times;</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px;">
        <div class="form-group">
          <label class="form-label">Category</label>
          <div id="_budgetEditCatLabel" style="
            padding:10px 14px;
            background:var(--bg-glass);
            border:1px solid var(--border-color);
            border-radius:var(--radius-sm);
            font-size:14px;
            font-weight:600;
            color:var(--text-primary);
          "></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="_budgetEditAmount">New Monthly Limit (₹)</label>
          <input class="form-input" type="number" id="_budgetEditAmount" min="1" step="1" placeholder="e.g. 5000">
        </div>
        <button class="btn btn-primary" id="_budgetEditSave" style="justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Update Limit
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const close = () => modal.classList.remove('show');
  document.getElementById('_budgetEditClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('_budgetEditAmount').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('_budgetEditSave').click();
    if (e.key === 'Escape') close();
  });

  document.getElementById('_budgetEditSave').addEventListener('click', () => {
    if (!_editBudget) return;
    const newAmt = parseFloat(document.getElementById('_budgetEditAmount').value);
    if (isNaN(newAmt) || newAmt <= 0) { showToast('Enter a valid amount', 'error'); return; }

    // Upsert — same category/month/year, new amount updates existing record
    fetch(`${BASE_URL}/ExpTrack/budgets/${username}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        category: _editBudget.category,
        amount:   newAmt,
        month:    currentMonth,
        year:     currentYear,
      }),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => {
        close();
        _editBudget = null;
        loadData();
        showToast('Budget limit updated!', 'success');
      })
      .catch(() => showToast('Failed to update budget', 'error'));
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────
function deleteBudget(id) {
  const b = budgets.find(b => b.id === id);
  if (!confirm(`Delete budget for "${b?.category || 'this category'}"?`)) return;
  fetch(`${BASE_URL}/ExpTrack/budgets/${username}/${id}`, { method: 'DELETE' })
    .then(() => { loadData(); showToast('Budget deleted', 'success'); })
    .catch(() => showToast('Failed to delete budget', 'error'));
}
window.deleteBudget = deleteBudget;
