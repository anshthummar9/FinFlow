/* accounts.js — all accounts editable & deletable */
let allTxns = [];
let selectedAccount = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  _bindAccountManage();
  _createAccEditModal();
});

function fetchData() {
  fetch(`${BASE_URL}/ExpTrack/transactions/${username}`)
    .then(r => r.json())
    .then(data => { allTxns = data; renderAccounts(); })
    .catch(() => showToast('Could not load accounts', 'error'));
}

// ─── Account cards ────────────────────────────────────────────────────────────
function renderAccounts() {
  const grid = document.getElementById('accountsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const accounts = getAccounts();

  const balMap = {};
  accounts.forEach(a => { balMap[a.value] = 0; });
  allTxns.forEach(t => { if (t.account && balMap.hasOwnProperty(t.account)) balMap[t.account] += t.amount; });

  if (accounts.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>No accounts yet</h3><p>Add an account using the button above</p></div>';
    renderAccountTxns();
    return;
  }

  accounts.forEach((a, idx) => {
    const bal  = balMap[a.value] || 0;
    const card = document.createElement('div');
    card.className = `card account-stat-card${selectedAccount === a.value ? ' selected' : ''}`;
    card.dataset.account = a.value;

    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
        <div class="account-icon">${a.icon}</div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="manage-item-edit" style="width:30px;height:30px;" onclick="editAccount(${idx},event)" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="manage-item-del" style="width:30px;height:30px;" onclick="deleteAccount(${idx},event)" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
      <div>
        <div class="account-name">${a.icon} ${a.value}</div>
        <div class="account-type">${allTxns.filter(t => t.account === a.value).length} transactions</div>
      </div>
      <div class="account-balance ${bal >= 0 ? 'positive' : 'negative'}">${bal >= 0 ? '+' : ''}₹${Math.abs(bal).toFixed(2)}</div>`;

    // Click on card body → select (not on buttons)
    card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      selectedAccount = selectedAccount === a.value ? null : a.value;
      renderAccounts();
      renderAccountTxns();
    });
    grid.appendChild(card);
  });

  renderAccountTxns();
}

// ─── Account transaction list ─────────────────────────────────────────────────
function renderAccountTxns() {
  const section = document.getElementById('accountTxnSection');
  const tbody   = document.getElementById('accountTxnBody');
  const title   = document.getElementById('accountTxnTitle');
  if (!section || !tbody) return;

  if (!selectedAccount) { section.style.display = 'none'; return; }
  section.style.display = 'block';

  const acc = getAccounts().find(a => a.value === selectedAccount);
  if (title) title.textContent = `${acc?.icon || ''} ${selectedAccount} — Transactions`;

  const txns = allTxns.filter(t => t.account === selectedAccount)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = '';
  if (txns.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">No transactions for this account</td></tr>';
    return;
  }
  txns.forEach(t => {
    const isIncome = t.amount >= 0;
    const catIcon  = getCatIcon(t.category, isIncome);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-muted);font-size:12px;">${formatDate(t.date)}</td>
      <td style="font-size:14px;font-weight:500;">${t.text || (isIncome ? 'Income' : 'Expense')}</td>
      <td>${t.category ? `<span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">${catIcon} ${t.category}</span>` : '—'}</td>
      <td class="amount-cell ${isIncome ? 'positive' : 'negative'}">${isIncome ? '+' : '-'}₹${Math.abs(t.amount).toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });
}

// ─── Add account ──────────────────────────────────────────────────────────────
function _bindAccountManage() {
  document.getElementById('addAccountBtn')?.addEventListener('click', () => {
    document.getElementById('addAccountModal').classList.add('show');
  });
  document.getElementById('closeAddAccountModal')?.addEventListener('click', () => {
    document.getElementById('addAccountModal').classList.remove('show');
  });
  document.getElementById('addAccountModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
  });
  document.getElementById('saveAccountBtn')?.addEventListener('click', _saveNewAccount);
  document.getElementById('accNameInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') _saveNewAccount();
  });
}

function _saveNewAccount() {
  const emoji = document.getElementById('accEmojiInput')?.value.trim() || '💳';
  const name  = document.getElementById('accNameInput')?.value.trim();
  if (!name) { showToast('Enter an account name', 'error'); return; }
  const accs = getAccounts();
  if (accs.some(a => a.value.toLowerCase() === name.toLowerCase())) {
    showToast('Account already exists', 'error'); return;
  }
  accs.push({ value: name, icon: emoji });
  saveAccounts(accs);
  document.getElementById('accEmojiInput').value = '';
  document.getElementById('accNameInput').value  = '';
  document.getElementById('addAccountModal').classList.remove('show');
  renderAccounts();
  showToast(`Account "${name}" added!`, 'success');
}

// ─── Delete account ───────────────────────────────────────────────────────────
function deleteAccount(idx, event) {
  event.stopPropagation();
  const accs = getAccounts();
  const acc  = accs[idx];
  if (!confirm(`Delete account "${acc.value}"?\nThis won't delete existing transactions linked to it.`)) return;
  accs.splice(idx, 1);
  saveAccounts(accs);
  if (selectedAccount === acc.value) selectedAccount = null;
  renderAccounts();
  showToast(`Account "${acc.value}" deleted`, 'success');
}
window.deleteAccount = deleteAccount;

// ─── Edit account ─────────────────────────────────────────────────────────────
function editAccount(idx, event) {
  event.stopPropagation();
  const acc = getAccounts()[idx];
  const modal = document.getElementById('_accEditModal');
  modal.dataset.idx = idx;
  document.getElementById('_accEditEmoji').value = acc.icon;
  document.getElementById('_accEditName').value  = acc.value;
  document.getElementById('_accEditName').focus();
  modal.classList.add('show');
}
window.editAccount = editAccount;

function _createAccEditModal() {
  if (document.getElementById('_accEditModal')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = '_accEditModal';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:380px;">
      <div class="modal-header">
        <h2 class="modal-title">Edit Account</h2>
        <button class="modal-close" id="_accEditClose">&times;</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;gap:10px;align-items:flex-end;">
          <div class="form-group" style="flex-shrink:0;">
            <label class="form-label">Emoji</label>
            <input class="form-input emoji-input" type="text" id="_accEditEmoji" maxlength="2" style="width:56px;text-align:center;font-size:18px;">
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label" for="_accEditName">Name</label>
            <input class="form-input" type="text" id="_accEditName" placeholder="Account name…">
          </div>
        </div>
        <button class="btn btn-primary" id="_accEditSave" style="justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Changes
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const close = () => modal.classList.remove('show');
  document.getElementById('_accEditClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('_accEditName').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('_accEditSave').click();
    if (e.key === 'Escape') close();
  });

  document.getElementById('_accEditSave').addEventListener('click', () => {
    const idx   = parseInt(modal.dataset.idx);
    const emoji = document.getElementById('_accEditEmoji').value.trim() || '💳';
    const name  = document.getElementById('_accEditName').value.trim();
    if (!name) { showToast('Enter an account name', 'error'); return; }

    const accs = getAccounts();
    if (accs.some((a, i) => i !== idx && a.value.toLowerCase() === name.toLowerCase())) {
      showToast('An account with that name already exists', 'error'); return;
    }
    const oldName = accs[idx].value;
    accs[idx] = { value: name, icon: emoji };
    saveAccounts(accs);
    if (selectedAccount === oldName) selectedAccount = name;
    close();
    renderAccounts();
    showToast(`"${oldName}" updated to "${name}"`, 'success');
  });
}
