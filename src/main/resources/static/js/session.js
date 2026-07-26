/* session.js — shared auth guard + unified storage + utilities */

const BASE_URL = 'http://localhost:8080';

// ─── Storage Keys (unified — no separate "custom" list) ────────────────────────
const LS_EXPENSE_CATS = 'finflow_expense_cats';
const LS_INCOME_CATS  = 'finflow_income_cats';
const LS_ACCOUNTS     = 'finflow_accounts';

// ─── Built-in defaults (seed only on first load) ──────────────────────────────
const DEFAULT_EXPENSE_CATS = [
  { value: 'Food & Drinks', icon: '🍔' }, { value: 'Transport', icon: '🚗' },
  { value: 'Shopping', icon: '🛍️' },     { value: 'Bills & Utilities', icon: '💡' },
  { value: 'Health', icon: '🏥' },        { value: 'Entertainment', icon: '🎬' },
  { value: 'Education', icon: '📚' },     { value: 'Travel', icon: '✈️' },
  { value: 'Rent', icon: '🏠' },          { value: 'Other', icon: '🔖' },
];

const DEFAULT_INCOME_CATS = [
  { value: 'Salary', icon: '💼' },    { value: 'Freelance', icon: '💻' },
  { value: 'Business', icon: '🏢' },  { value: 'Investment', icon: '📈' },
  { value: 'Gift', icon: '🎁' },      { value: 'Refund', icon: '↩️' },
  { value: 'Other', icon: '🔖' },
];

const DEFAULT_ACCOUNTS = [
  { value: 'Cash', icon: '💵' },        { value: 'Bank Account', icon: '🏦' },
  { value: 'Credit Card', icon: '💳' }, { value: 'UPI', icon: '📲' },
  { value: 'Savings', icon: '🏛️' },    { value: 'Other', icon: '🔖' },
];

// ─── Safe parse helper ────────────────────────────────────────────────────────
function _safeJson(str, fallback) {
  try { const v = JSON.parse(str); return Array.isArray(v) ? v : fallback; }
  catch { return fallback; }
}

// ─── Initialize & migrate from old separate-key scheme ────────────────────────
(function initStorage() {
  if (!localStorage.getItem(LS_EXPENSE_CATS)) {
    const old = _safeJson(localStorage.getItem('finflow_custom_expense_cats'), []);
    localStorage.setItem(LS_EXPENSE_CATS, JSON.stringify([...DEFAULT_EXPENSE_CATS, ...old]));
  }
  if (!localStorage.getItem(LS_INCOME_CATS)) {
    const old = _safeJson(localStorage.getItem('finflow_custom_income_cats'), []);
    localStorage.setItem(LS_INCOME_CATS, JSON.stringify([...DEFAULT_INCOME_CATS, ...old]));
  }
  if (!localStorage.getItem(LS_ACCOUNTS)) {
    const old = _safeJson(localStorage.getItem('finflow_custom_accounts'), []);
    localStorage.setItem(LS_ACCOUNTS, JSON.stringify([...DEFAULT_ACCOUNTS, ...old]));
  }
  // Clean up legacy keys
  localStorage.removeItem('finflow_custom_expense_cats');
  localStorage.removeItem('finflow_custom_income_cats');
  localStorage.removeItem('finflow_custom_accounts');
})();

// ─── Getters / Setters ────────────────────────────────────────────────────────
function getExpenseCats() { return _safeJson(localStorage.getItem(LS_EXPENSE_CATS), [...DEFAULT_EXPENSE_CATS]); }
function getIncomeCats()  { return _safeJson(localStorage.getItem(LS_INCOME_CATS),  [...DEFAULT_INCOME_CATS]);  }
function getAccounts()    { return _safeJson(localStorage.getItem(LS_ACCOUNTS),     [...DEFAULT_ACCOUNTS]);     }

function saveExpenseCats(list) { localStorage.setItem(LS_EXPENSE_CATS, JSON.stringify(list)); }
function saveIncomeCats(list)  { localStorage.setItem(LS_INCOME_CATS,  JSON.stringify(list)); }
function saveAccounts(list)    { localStorage.setItem(LS_ACCOUNTS,     JSON.stringify(list)); }

// Icon lookup helpers
function getCatIcon(category, isIncome) {
  const list = isIncome ? getIncomeCats() : getExpenseCats();
  return (list.find(c => c.value === category) || { icon: '🔖' }).icon;
}
function getAccIcon(account) {
  return (getAccounts().find(a => a.value === account) || { icon: '💳' }).icon;
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────
const username = localStorage.getItem('user');
if (!username && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
  window.location.href = '/login';
}

// ─── Sidebar & Logout ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const nameEl   = document.getElementById('sidebarUsername');
  const avatarEl = document.getElementById('sidebarAvatar');
  if (nameEl   && username) nameEl.textContent   = username;
  if (avatarEl && username) avatarEl.textContent = username.charAt(0).toUpperCase();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!confirm('Are you sure you want to logout?')) return;
      localStorage.removeItem('user');
      window.location.href = '/login';
    });
  }
});

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = {
    success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    error:   '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1"/>',
  };
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[type] || icons.info}</svg>
    <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 4500);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
