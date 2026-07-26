/* records.js — Full transaction history with filtering, sorting, pagination + edit */
let allTransactions = [];
let filtered = [];
const PAGE_SIZE = 25;
let currentPage = 1;

let filters = { search: '', type: 'all', category: 'all', account: 'all', dateRange: 'all', sort: 'dateDesc' };

// Edit state
let _editId   = null;
let _editType = 'expense';

document.addEventListener('DOMContentLoaded', () => {
  buildFilterSelects();
  fetchTransactions();
  bindEvents();
  _bindEditModal();
});

function fetchTransactions() {
  fetch(`${BASE_URL}/ExpTrack/transactions/${username}`)
    .then(r => r.json())
    .then(data => { allTransactions = data; applyFilters(); })
    .catch(() => showToast('Could not load records', 'error'));
}

// ─── Filter selects ───────────────────────────────────────────────────────────
function buildFilterSelects() {
  const catSel = document.getElementById('filterCategory');
  if (catSel) {
    catSel.innerHTML = '<option value="all">All Categories</option>';
    const expG = document.createElement('optgroup'); expG.label = '— Expense —';
    getExpenseCats().forEach(c => { expG.appendChild(new Option(`${c.icon} ${c.value}`, c.value)); });
    const incG = document.createElement('optgroup'); incG.label = '— Income —';
    getIncomeCats().forEach(c => { incG.appendChild(new Option(`${c.icon} ${c.value}`, c.value)); });
    catSel.append(expG, incG);
  }
  const accSel = document.getElementById('filterAccount');
  if (accSel) {
    accSel.innerHTML = '<option value="all">All Accounts</option>';
    getAccounts().forEach(a => { accSel.appendChild(new Option(`${a.icon} ${a.value}`, a.value)); });
  }
}

// ─── Event bindings ───────────────────────────────────────────────────────────
function bindEvents() {
  document.getElementById('searchInput')?.addEventListener('input', e => { filters.search = e.target.value; currentPage = 1; applyFilters(); });
  document.getElementById('filterType')?.addEventListener('change', e => { filters.type = e.target.value; currentPage = 1; applyFilters(); });
  document.getElementById('filterCategory')?.addEventListener('change', e => { filters.category = e.target.value; currentPage = 1; applyFilters(); });
  document.getElementById('filterAccount')?.addEventListener('change', e => { filters.account = e.target.value; currentPage = 1; applyFilters(); });
  document.getElementById('filterDate')?.addEventListener('change', e => { filters.dateRange = e.target.value; currentPage = 1; applyFilters(); });
  document.getElementById('filterSort')?.addEventListener('change', e => { filters.sort = e.target.value; applyFilters(); });
  document.getElementById('resetFilters')?.addEventListener('click', () => {
    filters = { search: '', type: 'all', category: 'all', account: 'all', dateRange: 'all', sort: 'dateDesc' };
    document.querySelectorAll('.filter-control').forEach(el => { el.value = el.tagName === 'SELECT' ? 'all' : ''; });
    document.getElementById('filterSort').value = 'dateDesc';
    currentPage = 1; applyFilters();
  });
}

// ─── Filter & sort ────────────────────────────────────────────────────────────
function applyFilters() {
  const today = new Date(); today.setHours(0,0,0,0);

  filtered = allTransactions.filter(t => {
    const label = t.text || (t.amount >= 0 ? 'Income' : 'Expense');
    if (filters.search && !label.toLowerCase().includes(filters.search.toLowerCase()) &&
        !(t.category || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.type === 'income'  && t.amount < 0)  return false;
    if (filters.type === 'expense' && t.amount >= 0) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.account  !== 'all' && t.account  !== filters.account)  return false;
    if (filters.dateRange !== 'all') {
      const d = new Date(t.date); d.setHours(0,0,0,0);
      if (filters.dateRange === 'today'     && d.getTime() !== today.getTime()) return false;
      if (filters.dateRange === 'last7')    { const p = new Date(today); p.setDate(p.getDate()-7);  if (d < p) return false; }
      if (filters.dateRange === 'last30')   { const p = new Date(today); p.setDate(p.getDate()-30); if (d < p) return false; }
      if (filters.dateRange === 'thisMonth' && (d.getMonth()!==today.getMonth()||d.getFullYear()!==today.getFullYear())) return false;
    }
    return true;
  });

  filtered.sort((a,b) => {
    if (filters.sort === 'dateDesc')   return new Date(b.date)-new Date(a.date)||b.id-a.id;
    if (filters.sort === 'dateAsc')    return new Date(a.date)-new Date(b.date)||a.id-b.id;
    if (filters.sort === 'amountDesc') return Math.abs(b.amount)-Math.abs(a.amount);
    if (filters.sort === 'amountAsc')  return Math.abs(a.amount)-Math.abs(b.amount);
    return 0;
  });

  renderTable();
  renderPagination();
  updateStats();
}

// ─── Table render ─────────────────────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('recordsTbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;opacity:.4"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
      <h3>No records found</h3><p>Try adjusting your filters</p></div></td></tr>`;
    return;
  }

  page.forEach(t => {
    const isIncome = t.amount >= 0;
    const catIcon  = getCatIcon(t.category, isIncome);
    const accIcon  = getAccIcon(t.account);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-muted);font-size:12px;white-space:nowrap;">${formatDate(t.date)}</td>
      <td><div style="font-size:14px;font-weight:500;">${t.text || (isIncome ? 'Income' : 'Expense')}</div></td>
      <td>${t.category ? `<span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">${catIcon} ${t.category}</span>` : '<span class="text-muted text-sm">—</span>'}</td>
      <td>${t.account  ? `<span class="badge badge-account">${accIcon} ${t.account}</span>` : '<span class="text-muted text-sm">—</span>'}</td>
      <td class="amount-cell ${isIncome ? 'positive' : 'negative'}" style="white-space:nowrap;">${isIncome ? '+' : '-'}₹${Math.abs(t.amount).toFixed(2)}</td>
      <td><span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">${isIncome ? '↑ Income' : '↓ Expense'}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn" onclick="openEditModal(${t.id})" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn delete" onclick="deleteRecord(${t.id})" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function renderPagination() {
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pag = document.getElementById('pagination');
  if (!pag) return;
  pag.innerHTML = '';
  if (totalPages <= 1) return;

  const info = document.createElement('span');
  info.className = 'page-info';
  info.textContent = `${filtered.length} records`;
  pag.appendChild(info);

  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
      if (i === 3 || i === totalPages - 2) { const d = document.createElement('span'); d.className='page-info'; d.textContent='…'; pag.appendChild(d); }
      continue;
    }
    const btn = document.createElement('button');
    btn.className = `page-btn${i === currentPage ? ' active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => { currentPage = i; renderTable(); renderPagination(); });
    pag.appendChild(btn);
  }
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function updateStats() {
  const income  = filtered.filter(t => t.amount >= 0).reduce((s,t) => s+t.amount, 0);
  const expense = filtered.filter(t => t.amount < 0).reduce((s,t) => s+Math.abs(t.amount), 0);
  const el = document.getElementById('statsBar');
  if (el) {
    el.innerHTML = `
      <span>📊 <b>${filtered.length}</b> records</span>
      <span>🟢 Income: <b style="color:var(--income-color)">₹${income.toFixed(2)}</b></span>
      <span>🔴 Expense: <b style="color:var(--expense-color)">₹${expense.toFixed(2)}</b></span>
      <span>⚖️ Net: <b style="color:${income-expense>=0?'var(--income-color)':'var(--expense-color)'}">₹${(income-expense).toFixed(2)}</b></span>`;
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
function deleteRecord(id) {
  if (!confirm('Move this transaction to trash?')) return;
  fetch(`${BASE_URL}/ExpTrack/transactions/${username}/${id}`, { method: 'DELETE' })
    .then(() => { allTransactions = allTransactions.filter(t => t.id !== id); applyFilters(); showToast('Moved to trash', 'success'); })
    .catch(() => showToast('Delete failed', 'error'));
}
window.deleteRecord = deleteRecord;

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function openEditModal(id) {
  const t = allTransactions.find(t => t.id === id);
  if (!t) return;
  _editId   = id;
  _editType = t.amount >= 0 ? 'income' : 'expense';

  // Set type tabs
  document.querySelectorAll('#recEditModal .type-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.type === _editType);
  });

  // Populate selects
  _populateEditCategorySelect(_editType, t.category || '');
  _populateEditAccountSelect(t.account || '');

  // Fill fields
  document.getElementById('recEditDesc').value   = t.text || '';
  document.getElementById('recEditAmount').value  = Math.abs(t.amount);
  document.getElementById('recEditDate').value    = t.date;

  document.getElementById('recEditModal').classList.add('show');
  document.getElementById('recEditDesc').focus();
}
window.openEditModal = openEditModal;

function _populateEditCategorySelect(type, selectedVal) {
  const sel = document.getElementById('recEditCategory');
  if (!sel) return;
  sel.innerHTML = '<option value="">Category…</option>';
  const cats = type === 'income' ? getIncomeCats() : getExpenseCats();
  cats.forEach(c => {
    const o = new Option(`${c.icon} ${c.value}`, c.value);
    if (c.value === selectedVal) o.selected = true;
    sel.appendChild(o);
  });
}

function _populateEditAccountSelect(selectedVal) {
  const sel = document.getElementById('recEditAccount');
  if (!sel) return;
  sel.innerHTML = '<option value="">Account…</option>';
  getAccounts().forEach(a => {
    const o = new Option(`${a.icon} ${a.value}`, a.value);
    if (a.value === selectedVal) o.selected = true;
    sel.appendChild(o);
  });
}

function _bindEditModal() {
  const modal = document.getElementById('recEditModal');
  if (!modal) return;

  document.getElementById('recEditClose')?.addEventListener('click', () => modal.classList.remove('show'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });

  // Type tab switching inside edit modal
  modal.querySelectorAll('.type-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _editType = btn.dataset.type;
      _populateEditCategorySelect(_editType, '');
    });
  });

  // Save
  document.getElementById('recEditSave')?.addEventListener('click', () => {
    const desc   = document.getElementById('recEditDesc').value.trim();
    const amount = parseFloat(document.getElementById('recEditAmount').value);
    const date   = document.getElementById('recEditDate').value;
    const cat    = document.getElementById('recEditCategory').value;
    const acc    = document.getElementById('recEditAccount').value;

    if (isNaN(amount) || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (!date) { showToast('Enter a date', 'error'); return; }

    const finalAmt = _editType === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    fetch(`${BASE_URL}/ExpTrack/transactions/${username}/${_editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: desc, amount: finalAmt, date, category: cat, account: acc }),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(updated => {
        const idx = allTransactions.findIndex(t => t.id === _editId);
        if (idx !== -1) allTransactions[idx] = updated;
        modal.classList.remove('show');
        applyFilters();
        showToast('Transaction updated!', 'success');
      })
      .catch(() => showToast('Failed to update transaction', 'error'));
  });
}
