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

const settingsBtn = document.getElementById("settingsBtn");
const settingsDropdown = document.getElementById("settingsDropdown");
const openTrashBtn = document.getElementById("openTrashBtn");
const trashModal = document.getElementById("trashModal");
const closeTrashModalBtn = document.getElementById("closeTrashModalBtn");
const modalSearchInput = document.getElementById("modalSearchInput");
const modalList = document.getElementById("modalList");

const tabExpense = document.getElementById("tabExpense");
const tabIncome = document.getElementById("tabIncome");

// Edit Modal Elements
const editModal = document.getElementById("editModal");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const editText = document.getElementById("editText");
const editAmount = document.getElementById("editAmount");
const editDate = document.getElementById("editDate");
const editTabExpense = document.getElementById("editTabExpense");
const editTabIncome = document.getElementById("editTabIncome");
const saveEditBtn = document.getElementById("save-edit-btn");


// Main Show All Elements
const showAllContainer = document.getElementById("showAllContainer");
const showAllBtn = document.getElementById("showAllBtn");


const username = localStorage.getItem("user");
if (!username) {
  window.location.href = "login.html";
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  localStorage.removeItem("lastActivity");
  window.location.href = "index.html";
});

let transactions = [];
let deletedTransactions = [];
let activeTransactionType = 'expense'; // default tab
let searchQuery = '';
let modalSearchQuery = '';
let filterType = 'all'; // 'all', 'income', 'expense'

// Edit and filter states
let editingTransactionId = null;
let editTransactionType = 'expense';
let selectedDateFilter = 'all';
let selectedSortFilter = 'dateDesc';


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

// Date format helper: converts YYYY-MM-DD to DD-MM-YYYY
function formatDateDisplay(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
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
        <span class="transaction-desc">${transaction.text || (transaction.amount >= 0 ? "Income" : "Expense")}</span>
        <span class="transaction-date">${formatDateDisplay(transaction.date)}</span>
      </div>
    </div>
    <div class="transaction-item-right">
      <span class="transaction-amount">${symbol}₹${displayAmount}</span>
      <button class="edit-action-btn" onclick="openEditModal(${transaction.id})" title="Edit">
        <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
      </button>
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
        <span class="transaction-desc">${transaction.text || (transaction.amount >= 0 ? "Income" : "Expense")}</span>
        <span class="transaction-date">${formatDateDisplay(transaction.date)}</span>
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
  
  // Apply search query, status filter, and date filter to active transactions
  const filtered = transactions.filter(t => {
    const textToSearch = t.text || (t.amount >= 0 ? "Income" : "Expense");
    const matchesSearch = textToSearch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'income' && t.amount >= 0) ||
      (filterType === 'expense' && t.amount < 0);
      
    // Filter by Date Range
    let matchesDate = true;
    if (selectedDateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const compareDate = new Date(t.date);
      compareDate.setHours(0, 0, 0, 0);
      
      if (selectedDateFilter === 'today') {
        matchesDate = compareDate.getTime() === today.getTime();
      } else if (selectedDateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = compareDate.getTime() === yesterday.getTime();
      } else if (selectedDateFilter === 'last7') {
        const past7 = new Date(today);
        past7.setDate(past7.getDate() - 7);
        matchesDate = compareDate >= past7;
      } else if (selectedDateFilter === 'last30') {
        const past30 = new Date(today);
        past30.setDate(past30.getDate() - 30);
        matchesDate = compareDate >= past30;
      } else if (selectedDateFilter === 'thisMonth') {
        matchesDate = compareDate.getFullYear() === today.getFullYear() && 
                      compareDate.getMonth() === today.getMonth();
      } else if (selectedDateFilter === 'custom') {
        if (startDateInput && startDateInput.value) {
          const startDate = new Date(startDateInput.value);
          startDate.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && (compareDate >= startDate);
        }
        if (endDateInput && endDateInput.value) {
          const endDate = new Date(endDateInput.value);
          endDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && (compareDate <= endDate);
        }
      }
    }
    return matchesSearch && matchesFilter && matchesDate;
  });

  // Apply sorting
  filtered.sort((a, b) => {
    if (selectedSortFilter === 'dateDesc') {
      return new Date(b.date) - new Date(a.date) || b.id - a.id;
    } else if (selectedSortFilter === 'dateAsc') {
      return new Date(a.date) - new Date(b.date) || a.id - b.id;
    } else if (selectedSortFilter === 'amountDesc') {
      return b.amount - a.amount;
    } else if (selectedSortFilter === 'amountAsc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i data-lucide="info"></i>
        <span>No transactions found</span>
      </div>
    `;
    if (showAllContainer) showAllContainer.style.display = "none";
  } else {
    const mainItems = filtered.slice(0, 3);
    mainItems.forEach(addTransactionDOM);
    
    if (showAllContainer) {
      if (filtered.length > 3) {
        showAllContainer.style.display = "block";
      } else {
        showAllContainer.style.display = "none";
      }
    }
  }
  
  if (window.lucide) {
    lucide.createIcons();
  }
  
  updateValues();
}

// Update the deleted list in modal
function updateModalUI() {
  modalList.innerHTML = "";
  
  // Apply search query to deleted transactions
  const filtered = deletedTransactions.filter(t => {
    const textToSearch = t.text || (t.amount >= 0 ? "Income" : "Expense");
    return textToSearch.toLowerCase().includes(modalSearchQuery.toLowerCase());
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

  if (isNaN(amountValue) || amountValue <= 0) {
    showToast("Please enter a valid positive amount.", "error");
    return;
  }

  // Adjust amount sign based on selected tab (Income vs Expense)
  const finalAmount = activeTransactionType === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue);

  const localDate = new Date();
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const localDateStr = `${year}-${month}-${day}`;

  const transaction = {
    text: textValue,
    amount: finalAmount,
    date: localDateStr,
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

// Edit Modal tab switchers
if (editTabExpense && editTabIncome) {
  editTabExpense.addEventListener("click", () => {
    editTabExpense.classList.add("active");
    editTabIncome.classList.remove("active");
    editTransactionType = "expense";
  });
  editTabIncome.addEventListener("click", () => {
    editTabIncome.classList.add("active");
    editTabExpense.classList.remove("active");
    editTransactionType = "income";
  });
}

// Function to pre-fill and open Edit Modal
function openEditModal(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return;

  editingTransactionId = id;
  editText.value = transaction.text || '';
  editAmount.value = Math.abs(transaction.amount);
  editDate.value = transaction.date;

  editTransactionType = transaction.amount >= 0 ? "income" : "expense";
  if (editTransactionType === "income") {
    editTabIncome.classList.add("active");
    editTabExpense.classList.remove("active");
  } else {
    editTabExpense.classList.add("active");
    editTabIncome.classList.remove("active");
  }

  editModal.classList.add("show");

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Save Edit Transaction button click
if (saveEditBtn) {
  saveEditBtn.addEventListener("click", () => {
    const textValue = editText.value.trim();
    const amountValue = parseFloat(editAmount.value);
    const dateValue = editDate.value;

    if (isNaN(amountValue) || amountValue <= 0) {
      showToast("Please enter a valid positive amount.", "error");
      return;
    }
    if (!dateValue) {
      showToast("Please enter a valid date.", "error");
      return;
    }

    const finalAmount = editTransactionType === "expense" ? -Math.abs(amountValue) : Math.abs(amountValue);

    const updatedTransaction = {
      text: textValue,
      amount: finalAmount,
      date: dateValue,
    };

    fetch(`http://localhost:8080/ExpTrack/transactions/${username}/${editingTransactionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTransaction),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update transaction failed");
        return res.json();
      })
      .then((data) => {
        const index = transactions.findIndex((t) => t.id === editingTransactionId);
        if (index !== -1) {
          transactions[index] = data;
        }
        updateUI();
        editModal.classList.remove("show");
        showToast("Transaction updated successfully!", "success");
      })
      .catch((err) => {
        console.error("Update failed", err);
        showToast("Failed to update transaction.", "error");
      });
  });
}

// Expose openEditModal globally
window.openEditModal = openEditModal;

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

  // Show All Transactions Button click
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      const container = document.querySelector(".container");
      if (container) {
        container.style.transition = "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
        container.style.opacity = "0";
        container.style.transform = "translateY(-12px)";
      }
      setTimeout(() => {
        window.location.href = "history.html";
      }, 230);
    });
  }

  // Edit Modal Event Listeners
  if (closeEditModalBtn && editModal) {
    closeEditModalBtn.addEventListener("click", () => {
      editModal.classList.remove("show");
    });

    window.addEventListener("click", (e) => {
      if (e.target === editModal) {
        editModal.classList.remove("show");
      }
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

window.fetchActiveTransactions = fetchActiveTransactions;
init();
