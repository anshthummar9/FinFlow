/* categories.js — all categories editable & deletable */
let allTxns = [];
let catViewType = 'expense';

document.addEventListener('DOMContentLoaded', () => {
  fetch(`${BASE_URL}/ExpTrack/transactions/${username}`)
    .then(r => r.json())
    .then(data => { allTxns = data; renderAll(); })
    .catch(() => showToast('Could not load data', 'error'));

  document.querySelectorAll('.type-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      catViewType = btn.dataset.type;
      renderAll();
    });
  });

  document.getElementById('addCatBtn')?.addEventListener('click', addCategory);
  document.getElementById('catNameInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addCategory();
  });

  _createCatEditModal();
});

function renderAll() {
  renderCategoryStats();
  renderManageList();
}

// ─── Stats grid ───────────────────────────────────────────────────────────────
function renderCategoryStats() {
  const grid = document.getElementById('catGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const isIncome = catViewType === 'income';
  const cats = isIncome ? getIncomeCats() : getExpenseCats();

  const amtMap = {}, cntMap = {};
  allTxns.filter(t => isIncome ? t.amount >= 0 : t.amount < 0).forEach(t => {
    const c = t.category || 'Uncategorized';
    amtMap[c] = (amtMap[c] || 0) + Math.abs(t.amount);
    cntMap[c] = (cntMap[c] || 0) + 1;
  });

  const maxAmt = Math.max(...Object.values(amtMap), 1);
  const rows = cats.map(c => ({ ...c, amt: amtMap[c.value] || 0, cnt: cntMap[c.value] || 0 }))
    .sort((a, b) => b.amt - a.amt);

  if (rows.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>No categories yet</h3><p>Add one below</p></div>';
    return;
  }

  rows.forEach(c => {
    const pct = (c.amt / maxAmt) * 100;
    const card = document.createElement('div');
    card.className = 'card cat-stat-card';
    card.innerHTML = `
      <div class="cat-stat-emoji">${c.icon}</div>
      <div class="cat-stat-info">
        <div class="cat-stat-name">${c.value}</div>
        <div class="cat-stat-count">${c.cnt} transaction${c.cnt !== 1 ? 's' : ''}</div>
        <div class="progress-bar-wrap" style="margin-top:6px;">
          <div class="progress-bar-fill ${isIncome ? 'safe' : 'danger'}" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="cat-stat-amount" style="color:${isIncome ? 'var(--income-color)' : 'var(--expense-color)'};">
        ${c.amt > 0 ? (isIncome ? '+' : '-') + '₹' + c.amt.toFixed(2) : '₹0'}
      </div>`;
    grid.appendChild(card);
  });
}

// ─── Manage list ──────────────────────────────────────────────────────────────
function renderManageList() {
  const list = document.getElementById('manageList');
  if (!list) return;
  list.innerHTML = '';

  const isIncome = catViewType === 'income';
  const cats = isIncome ? getIncomeCats() : getExpenseCats();

  if (cats.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:12px 0;">No categories. Add one below.</div>';
    return;
  }

  cats.forEach((c, idx) => {
    const item = document.createElement('div');
    item.className = 'manage-item';
    item.innerHTML = `
      <span class="manage-item-emoji">${c.icon}</span>
      <span class="manage-item-name">${c.value}</span>
      <div style="display:flex;gap:4px;flex-shrink:0;margin-left:auto;">
        <button class="manage-item-edit" onclick="editCategory(${idx})" title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="manage-item-del" onclick="deleteCategory(${idx})" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>`;
    list.appendChild(item);
  });
}

// ─── Add ──────────────────────────────────────────────────────────────────────
function addCategory() {
  const emoji = document.getElementById('catEmojiInput')?.value.trim() || '🔖';
  const name  = document.getElementById('catNameInput')?.value.trim();
  if (!name) { showToast('Enter a category name', 'error'); return; }

  const isIncome = catViewType === 'income';
  const cats = isIncome ? getIncomeCats() : getExpenseCats();
  if (cats.some(c => c.value.toLowerCase() === name.toLowerCase())) {
    showToast('Category already exists', 'error'); return;
  }
  cats.push({ value: name, icon: emoji });
  isIncome ? saveIncomeCats(cats) : saveExpenseCats(cats);
  document.getElementById('catEmojiInput').value = '';
  document.getElementById('catNameInput').value  = '';
  renderAll();
  showToast(`Category "${name}" added!`, 'success');
}

// ─── Delete ───────────────────────────────────────────────────────────────────
function deleteCategory(idx) {
  const isIncome = catViewType === 'income';
  const cats = isIncome ? getIncomeCats() : getExpenseCats();
  const cat = cats[idx];
  if (!confirm(`Delete category "${cat.value}"?\nThis won't delete existing transactions using it.`)) return;
  cats.splice(idx, 1);
  isIncome ? saveIncomeCats(cats) : saveExpenseCats(cats);
  renderAll();
  showToast(`Category "${cat.value}" deleted`, 'success');
}
window.deleteCategory = deleteCategory;

// ─── Edit ─────────────────────────────────────────────────────────────────────
function editCategory(idx) {
  const isIncome = catViewType === 'income';
  const cats = isIncome ? getIncomeCats() : getExpenseCats();
  const cat = cats[idx];
  const modal = document.getElementById('_catEditModal');
  modal.dataset.idx = idx;
  document.getElementById('_catEditEmoji').value = cat.icon;
  document.getElementById('_catEditName').value  = cat.value;
  document.getElementById('_catEditName').focus();
  modal.classList.add('show');
}
window.editCategory = editCategory;

function _createCatEditModal() {
  if (document.getElementById('_catEditModal')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = '_catEditModal';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:380px;">
      <div class="modal-header">
        <h2 class="modal-title">Edit Category</h2>
        <button class="modal-close" id="_catEditClose">&times;</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;gap:10px;align-items:flex-end;">
          <div class="form-group" style="flex-shrink:0;">
            <label class="form-label">Emoji</label>
            <input class="form-input emoji-input" type="text" id="_catEditEmoji" maxlength="2" style="width:56px;text-align:center;font-size:18px;">
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label" for="_catEditName">Name</label>
            <input class="form-input" type="text" id="_catEditName" placeholder="Category name…">
          </div>
        </div>
        <button class="btn btn-primary" id="_catEditSave" style="justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Changes
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const close = () => modal.classList.remove('show');
  document.getElementById('_catEditClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('_catEditName').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('_catEditSave').click();
    if (e.key === 'Escape') close();
  });

  document.getElementById('_catEditSave').addEventListener('click', () => {
    const idx   = parseInt(modal.dataset.idx);
    const emoji = document.getElementById('_catEditEmoji').value.trim() || '🔖';
    const name  = document.getElementById('_catEditName').value.trim();
    if (!name) { showToast('Enter a category name', 'error'); return; }

    const isIncome = catViewType === 'income';
    const cats = isIncome ? getIncomeCats() : getExpenseCats();

    // Check duplicate (allow same name at same index = no change)
    if (cats.some((c, i) => i !== idx && c.value.toLowerCase() === name.toLowerCase())) {
      showToast('A category with that name already exists', 'error'); return;
    }
    const oldName = cats[idx].value;
    cats[idx] = { value: name, icon: emoji };
    isIncome ? saveIncomeCats(cats) : saveExpenseCats(cats);
    close();
    renderAll();
    showToast(`"${oldName}" updated to "${name}"`, 'success');
  });
}
