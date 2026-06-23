const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const logoutBtn = document.getElementById("logoutBtn");
const addTransaction = document.getElementById("add-transaction");
const userNameSpan = document.getElementById("userName");

const searchInput = document.getElementById("searchInput");
const filterAll = document.getElementById("filterAll");
const filterIncome = document.getElementById("filterIncome");
const filterExpense = document.getElementById("filterExpense");

const settingsBtn = document.getElementById("settingsBtn");
const settingsDropdown = document.getElementById("settingsDropdown");
const openTrashBtn = document.getElementById("openTrashBtn");
const trashModal = document.getElementById("trashModal");
const closeTrashModalBtn = document.getElementById("closeTrashModalBtn");
const modalSearchInput = document.getElementById("modalSearchInput");
const modalList = document.getElementById("modalList");

const tabExpense = document.getElementById("tabExpense");
const tabIncome = document.getElementById("tabIncome");

const username = localStorage.getItem("user");
if (!username) {
  window.location.href = "login.html";
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

let transactions = [];
let deletedTransactions = [];
let activeTransactionType = 'expense'; // default tab
let searchQuery = '';
let modalSearchQuery = '';
let filterType = 'all'; // 'all', 'income', 'expense'
let analyticsChart = null;

// Tab switcher event listeners
if (tabExpense && tabIncome) {
  tabExpense.addEventListener("click", () => {
    tabExpense.classList.add("active");
    tabIncome.classList.remove("active");
    activeTransactionType = "expense";
  });
  tabIncome.addEventListener("click", () => {
    tabIncome.classList.add("active");
    tabExpense.classList.remove("active");
    activeTransactionType = "income";
  });
}

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-message">${message}</div>
  `;
  container.appendChild(toast);
  
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Slide out and remove
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4700);
}

// Update balance, income and expense text values
function updateValues() {
  const amounts = transactions.map((t) => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0);
  const incomeTotal = amounts
    .filter((a) => a > 0)
    .reduce((acc, item) => acc + item, 0);
  const expenseTotal = amounts
    .filter((a) => a < 0)
    .reduce((acc, item) => acc + item, 0) * -1;

  // Format currency with Rupee symbol
  balance.textContent = total < 0 
    ? `-₹${Math.abs(total).toFixed(2)}` 
    : `₹${total.toFixed(2)}`;
  income.textContent = `₹${incomeTotal.toFixed(2)}`;
  expense.textContent = `₹${expenseTotal.toFixed(2)}`;
}

// Chart.js dynamic update
function updateChart() {
  const amounts = transactions.map((t) => t.amount);
  const totalIncome = amounts.filter((a) => a > 0).reduce((acc, item) => acc + item, 0);
  const totalExpense = Math.abs(amounts.filter((a) => a < 0).reduce((acc, item) => acc + item, 0));
  
  const chartCanvas = document.getElementById("analyticsChart");
  if (!chartCanvas) return;
  
  const ctx = chartCanvas.getContext("2d");
  const hasData = totalIncome > 0 || totalExpense > 0;
  
  const data = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: hasData ? [totalIncome, totalExpense] : [1, 1], // equal split placeholder when empty
      backgroundColor: hasData 
        ? ['rgba(16, 185, 129, 0.85)', 'rgba(239, 68, 68, 0.85)'] 
        : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)'],
      borderColor: hasData
        ? ['#10b981', '#ef4444']
        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)'],
      borderWidth: 1.5,
      hoverOffset: 4
    }]
  };
  
  if (analyticsChart) {
    analyticsChart.data = data;
    analyticsChart.options.plugins.tooltip.enabled = hasData;
    analyticsChart.update();
  } else {
    analyticsChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: {
                family: 'Plus Jakarta Sans',
                size: 11
              },
              padding: 15
            }
          },
          tooltip: {
            enabled: hasData,
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ₹${context.raw.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  }
}

// Generate transaction item element
function addTransactionDOM(transaction) {
  const div = document.createElement("div");
  const isIncome = transaction.amount >= 0;
  div.className = `transaction-item ${isIncome ? "income" : "expense"}`;
  
  const iconName = isIncome ? "arrow-up-right" : "arrow-down-left";
  const symbol = isIncome ? "+" : "-";
  const displayAmount = Math.abs(transaction.amount).toFixed(2);
  
  div.innerHTML = `
    <div class="transaction-item-left">
      <div class="transaction-type-icon">
        <i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>
      </div>
      <div class="transaction-details">
        <span class="transaction-desc">${transaction.text}</span>
        <span class="transaction-date">${transaction.date}</span>
      </div>
    </div>
    <div class="transaction-item-right">
      <span class="transaction-amount">${symbol}₹${displayAmount}</span>
      <button class="delete-action-btn" onclick="removeTransaction(${transaction.id})" title="Delete">
        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
      </button>
    </div>
  `;
  list.appendChild(div);
}

// Generate deleted transaction item element in modal
function addDeletedTransactionDOM(transaction) {
  const div = document.createElement("div");
  const isIncome = transaction.amount >= 0;
  div.className = `transaction-item ${isIncome ? "income" : "expense"} deleted-item`;
  
  const iconName = isIncome ? "arrow-up-right" : "arrow-down-left";
  const symbol = isIncome ? "+" : "-";
  const displayAmount = Math.abs(transaction.amount).toFixed(2);
  
  div.innerHTML = `
    <div class="transaction-item-left">
      <div class="transaction-type-icon">
        <i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>
      </div>
      <div class="transaction-details">
        <span class="transaction-desc">${transaction.text}</span>
        <span class="transaction-date">${transaction.date}</span>
      </div>
    </div>
    <div class="transaction-item-right">
      <span class="transaction-amount">${symbol}₹${displayAmount}</span>
      <div class="trash-actions">
        <button class="restore-action-btn" onclick="restoreTransaction(${transaction.id})" title="Restore">
          <i data-lucide="rotate-ccw" style="width: 16px; height: 16px;"></i>
        </button>
        <button class="delete-action-btn" onclick="permanentlyDeleteTransaction(${transaction.id})" title="Delete Permanently">
          <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    </div>
  `;
  modalList.appendChild(div);
}

// Delete transaction (soft delete)
function removeTransaction(id) {
  fetch(`http://localhost:8080/ExpTrack/transactions/${username}/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Delete failed");
      transactions = transactions.filter((t) => t.id !== id);
      updateUI();
      showToast("Transaction moved to Trash.", "success");
    })
    .catch((err) => {
      console.error("Delete failed", err);
      showToast("Could not delete transaction.", "error");
    });
}

// Restore transaction
function restoreTransaction(id) {
  fetch(`http://localhost:8080/ExpTrack/transactions/${username}/${id}/restore`, {
    method: "PUT",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Restore failed");
      deletedTransactions = deletedTransactions.filter((t) => t.id !== id);
      updateModalUI();
      fetchActiveTransactions().then(() => {
        showToast("Transaction restored.", "success");
      });
    })
    .catch((err) => {
      console.error("Restore failed", err);
      showToast("Could not restore transaction.", "error");
    });
}

// Permanently delete transaction
function permanentlyDeleteTransaction(id) {
  if (!confirm("Are you sure you want to permanently delete this transaction? This action cannot be undone.")) {
    return;
  }
  
  fetch(`http://localhost:8080/ExpTrack/transactions/${username}/${id}/permanent`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Permanent delete failed");
      deletedTransactions = deletedTransactions.filter((t) => t.id !== id);
      updateModalUI();
      showToast("Transaction permanently deleted.", "success");
    })
    .catch((err) => {
      console.error("Permanent delete failed", err);
      showToast("Could not permanently delete transaction.", "error");
    });
}

// Expose functions globally for onclick handlers
window.removeTransaction = removeTransaction;
window.restoreTransaction = restoreTransaction;
window.permanentlyDeleteTransaction = permanentlyDeleteTransaction;

// Update the list and values
function updateUI() {
  list.innerHTML = "";
  
  // Apply search query and status filter to active transactions
  const filtered = transactions.filter(t => {
    const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'income' && t.amount >= 0) ||
      (filterType === 'expense' && t.amount < 0);
    return matchesSearch && matchesFilter;
  });

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i data-lucide="info"></i>
        <span>No transactions found</span>
      </div>
    `;
  } else {
    filtered.forEach(addTransactionDOM);
  }
  
  if (window.lucide) {
    lucide.createIcons();
  }
  
  updateValues();
  updateChart();
}

// Update the deleted list in modal
function updateModalUI() {
  modalList.innerHTML = "";
  
  // Apply search query to deleted transactions
  const filtered = deletedTransactions.filter(t => {
    return t.text.toLowerCase().includes(modalSearchQuery.toLowerCase());
  });

  if (filtered.length === 0) {
    modalList.innerHTML = `
      <div class="empty-state">
        <i data-lucide="trash-2"></i>
        <span>No deleted transactions found</span>
      </div>
    `;
  } else {
    filtered.forEach(addDeletedTransactionDOM);
  }
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Add transaction form submit
addTransaction.addEventListener("click", () => {
  const textValue = text.value.trim();
  const amountValue = parseFloat(amount.value);

  if (!textValue || isNaN(amountValue) || amountValue <= 0) {
    showToast("Please enter a valid description and a positive amount.", "error");
    return;
  }

  // Adjust amount sign based on selected tab (Income vs Expense)
  const finalAmount = activeTransactionType === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue);

  const transaction = {
    text: textValue,
    amount: finalAmount,
    date: new Date().toISOString().split("T")[0],
  };

  fetch(`http://localhost:8080/ExpTrack/transactions/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Add transaction request failed");
      return res.json();
    })
    .then((data) => {
      transactions.push(data);
      updateUI();
      text.value = "";
      amount.value = "";
      showToast("Transaction added successfully!", "success");
    })
    .catch((err) => {
      console.error("Add failed", err);
      showToast("Failed to add transaction.", "error");
    });
});

// Search and filter input event handlers
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    updateUI();
  });
}

function setFilter(type, activeBtn) {
  filterType = type;
  [filterAll, filterIncome, filterExpense].forEach(btn => {
    if (btn) btn.classList.remove("active");
  });
  if (activeBtn) activeBtn.classList.add("active");
  updateUI();
}

if (filterAll) filterAll.addEventListener("click", () => setFilter('all', filterAll));
if (filterIncome) filterIncome.addEventListener("click", () => setFilter('income', filterIncome));
if (filterExpense) filterExpense.addEventListener("click", () => setFilter('expense', filterExpense));

function fetchActiveTransactions() {
  return fetch(`http://localhost:8080/ExpTrack/transactions/${username}`)
    .then((res) => {
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    })
    .then((data) => {
      transactions = data;
      updateUI();
    })
    .catch((err) => {
      console.error("Fetch failed", err);
      showToast("Could not load transaction history.", "error");
      updateUI();
    });
}

function fetchDeletedTransactions() {
  return fetch(`http://localhost:8080/ExpTrack/transactions/${username}/deleted`)
    .then((res) => {
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    })
    .then((data) => {
      deletedTransactions = data;
      updateModalUI();
    })
    .catch((err) => {
      console.error("Fetch failed", err);
      showToast("Could not load deleted transactions.", "error");
      updateModalUI();
    });
}

// Fetch and load initial data
function init() {
  if (userNameSpan && username) {
    userNameSpan.textContent = username;
  }
  
  // Settings Dropdown Event Listeners
  if (settingsBtn && settingsDropdown) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsDropdown.classList.toggle("show");
    });
    
    document.addEventListener("click", () => {
      settingsDropdown.classList.remove("show");
    });
  }

  // Modal Event Listeners
  if (openTrashBtn && trashModal && closeTrashModalBtn) {
    openTrashBtn.addEventListener("click", () => {
      trashModal.classList.add("show");
      settingsDropdown.classList.remove("show");
      fetchDeletedTransactions();
    });
    
    closeTrashModalBtn.addEventListener("click", () => {
      trashModal.classList.remove("show");
    });
    
    window.addEventListener("click", (e) => {
      if (e.target === trashModal) {
        trashModal.classList.remove("show");
      }
    });
  }

  // Modal Search
  if (modalSearchInput) {
    modalSearchInput.addEventListener("input", (e) => {
      modalSearchQuery = e.target.value;
      updateModalUI();
    });
  }
  
  if (window.lucide) {
    lucide.createIcons();
  }
  
  fetchActiveTransactions();
}

init();
