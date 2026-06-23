let transactions = [];
const username = localStorage.getItem("user");
if (!username) {
  window.location.href = "login.html";
}

// Variables for Filter State
let modalHistSearchQuery = '';
let modalHistTypeFilter = 'all';
let modalHistDateFilter = 'all';
let modalHistSortFilter = 'dateDesc';
let modalHistChartObj = null;
let modalHistTrendChartObj = null;

// Edit Modal variables
let editingTransactionId = null;
let editTransactionType = 'expense';

// Toast Notification
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = document.createElement("i");
  icon.setAttribute("data-lucide", type === "success" ? "check-circle" : "alert-circle");
  toast.appendChild(icon);
  
  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);
  
  container.appendChild(toast);
  
  if (window.lucide) {
    lucide.createIcons();
  }
  
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Date formatter
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

// Fetch all active transactions
function fetchActiveTransactions() {
  fetch(`http://localhost:8080/ExpTrack/transactions/${username}`)
    .then((res) => {
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    })
    .then((data) => {
      transactions = data;
      updateModalHistUI();
    })
    .catch((err) => {
      console.error("Fetch failed", err);
      showToast("Could not load transaction history.", "error");
    });
}

// Delete transaction
function removeTransaction(id) {
  fetch(`http://localhost:8080/ExpTrack/transactions/${username}/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Delete failed");
      transactions = transactions.filter((t) => t.id !== id);
      updateModalHistUI();
      showToast("Transaction moved to Trash.", "success");
      
      // Notify parent dashboard to update in real-time
      if (window.opener && typeof window.opener.fetchActiveTransactions === 'function') {
        window.opener.fetchActiveTransactions();
      }
    })
    .catch((err) => {
      console.error("Delete failed", err);
      showToast("Could not delete transaction.", "error");
    });
}

// Update UI List and charts
function updateModalHistUI() {
  const modalHistList = document.getElementById("modalHistList");
  const modalTransactionCount = document.getElementById("modalTransactionCount");
  if (!modalHistList) return;
  
  modalHistList.innerHTML = "";

  // Apply filters
  const filtered = transactions.filter(t => {
    const textToSearch = t.text || (t.amount >= 0 ? "Income" : "Expense");
    const matchesSearch = textToSearch.toLowerCase().includes(modalHistSearchQuery.toLowerCase());
    const matchesType = 
      modalHistTypeFilter === 'all' ||
      (modalHistTypeFilter === 'income' && t.amount >= 0) ||
      (modalHistTypeFilter === 'expense' && t.amount < 0);
      
    let matchesDate = true;
    if (modalHistDateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const compareDate = new Date(t.date);
      compareDate.setHours(0, 0, 0, 0);
      
      if (modalHistDateFilter === 'today') {
        matchesDate = compareDate.getTime() === today.getTime();
      } else if (modalHistDateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = compareDate.getTime() === yesterday.getTime();
      } else if (modalHistDateFilter === 'last7') {
        const past7 = new Date(today);
        past7.setDate(past7.getDate() - 7);
        matchesDate = compareDate >= past7;
      } else if (modalHistDateFilter === 'last30') {
        const past30 = new Date(today);
        past30.setDate(past30.getDate() - 30);
        matchesDate = compareDate >= past30;
      } else if (modalHistDateFilter === 'thisMonth') {
        matchesDate = compareDate.getFullYear() === today.getFullYear() && 
                      compareDate.getMonth() === today.getMonth();
      } else if (modalHistDateFilter === 'custom') {
        const startInput = document.getElementById("modalHistStartDateInput");
        const endInput = document.getElementById("modalHistEndDateInput");
        if (startInput && startInput.value) {
          const startDate = new Date(startInput.value);
          startDate.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && (compareDate >= startDate);
        }
        if (endInput && endInput.value) {
          const endDate = new Date(endInput.value);
          endDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && (compareDate <= endDate);
        }
      }
    }
    return matchesSearch && matchesType && matchesDate;
  });

  // Sort transactions
  filtered.sort((a, b) => {
    if (modalHistSortFilter === 'dateDesc') {
      return new Date(b.date) - new Date(a.date) || b.id - a.id;
    } else if (modalHistSortFilter === 'dateAsc') {
      return new Date(a.date) - new Date(b.date) || a.id - b.id;
    } else if (modalHistSortFilter === 'amountDesc') {
      return b.amount - a.amount;
    } else if (modalHistSortFilter === 'amountAsc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Render modal list
  if (filtered.length === 0) {
    modalHistList.innerHTML = `
      <div class="empty-state">
        <i data-lucide="info"></i>
        <span>No transactions found</span>
      </div>
    `;
  } else {
    filtered.forEach(t => {
      const div = document.createElement("div");
      const isIncome = t.amount >= 0;
      div.className = `transaction-item ${isIncome ? "income" : "expense"}`;
      const iconName = isIncome ? "arrow-up-right" : "arrow-down-left";
      const symbol = isIncome ? "+" : "-";
      const displayAmount = Math.abs(t.amount).toFixed(2);
      div.innerHTML = `
        <div class="transaction-item-left">
          <div class="transaction-type-icon">
            <i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>
          </div>
          <div class="transaction-details">
            <span class="transaction-desc">${t.text || (t.amount >= 0 ? "Income" : "Expense")}</span>
            <span class="transaction-date">${formatDateDisplay(t.date)}</span>
          </div>
        </div>
        <div class="transaction-item-right">
          <span class="transaction-amount">${symbol}₹${displayAmount}</span>
          <button class="edit-action-btn" onclick="openEditModal(${t.id})" title="Edit">
            <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
          </button>
          <button class="delete-action-btn" onclick="removeTransaction(${t.id})" title="Delete">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      `;
      modalHistList.appendChild(div);
    });
  }
  
  if (window.lucide) {
    lucide.createIcons();
  }

  // Update count
  if (modalTransactionCount) {
    modalTransactionCount.textContent = `${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`;
  }

  // Calculate Metrics
  let totalIncome = 0;
  let totalExpense = 0;
  
  filtered.forEach(t => {
    if (t.amount >= 0) {
      totalIncome += t.amount;
    } else {
      totalExpense += Math.abs(t.amount);
    }
  });

  // Update Modal Chart
  updateModalChart(totalIncome, totalExpense);
  // Update Trend Chart
  updateTrendChart(filtered);
}

// Chart.js doughnut update
function updateModalChart(totalIncome, totalExpense) {
  const chartCanvas = document.getElementById("modalHistChart");
  if (!chartCanvas) return;
  
  const ctx = chartCanvas.getContext("2d");
  const hasData = totalIncome > 0 || totalExpense > 0;
  
  const data = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: hasData ? [totalIncome, totalExpense] : [1, 1],
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
  
  if (modalHistChartObj) {
    modalHistChartObj.data = data;
    modalHistChartObj.options.plugins.tooltip.enabled = hasData;
    modalHistChartObj.update();
  } else {
    modalHistChartObj = new Chart(ctx, {
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

// Chart.js line chart update
function updateTrendChart(filteredTransactions) {
  const chartCanvas = document.getElementById("modalHistTrendChart");
  if (!chartCanvas) return;
  
  const ctx = chartCanvas.getContext("2d");
  
  const dateMap = {};
  filteredTransactions.forEach(t => {
    const dStr = t.date;
    if (!dateMap[dStr]) {
      dateMap[dStr] = { income: 0, expense: 0 };
    }
    if (t.amount >= 0) {
      dateMap[dStr].income += t.amount;
    } else {
      dateMap[dStr].expense += Math.abs(t.amount);
    }
  });
  
  const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
  const labels = sortedDates.map(d => formatDateDisplay(d));
  const incomeData = sortedDates.map(d => dateMap[d].income);
  const expenseData = sortedDates.map(d => dateMap[d].expense);
  
  const data = {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: 'Income',
        data: labels.length > 0 ? incomeData : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3
      },
      {
        label: 'Expenses',
        data: labels.length > 0 ? expenseData : [0],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3
      }
    ]
  };
  
  if (modalHistTrendChartObj) {
    modalHistTrendChartObj.data = data;
    modalHistTrendChartObj.update();
  } else {
    modalHistTrendChartObj = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.03)'
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Plus Jakarta Sans',
                size: 9
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.03)'
            },
            ticks: {
              color: '#64748b',
              font: {
                family: 'Plus Jakarta Sans',
                size: 9
              },
              callback: function(value) {
                return '₹' + value;
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: {
                family: 'Plus Jakarta Sans',
                size: 10
              }
            }
          }
        }
      }
    });
  }
}

// Edit features inside history window
function openEditModal(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return;

  editingTransactionId = id;
  
  const editText = document.getElementById("editText");
  const editAmount = document.getElementById("editAmount");
  const editDate = document.getElementById("editDate");
  const editTabExpense = document.getElementById("editTabExpense");
  const editTabIncome = document.getElementById("editTabIncome");
  const editModal = document.getElementById("editModal");
  
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

// Init execution
function init() {
  const closeEditModalBtn = document.getElementById("closeEditModalBtn");
  const editModal = document.getElementById("editModal");
  const saveEditBtn = document.getElementById("save-edit-btn");
  const editTabExpense = document.getElementById("editTabExpense");
  const editTabIncome = document.getElementById("editTabIncome");
  
  const modalHistSearchInput = document.getElementById("modalHistSearchInput");
  const modalHistFilterDropdownBtn = document.getElementById("modalHistFilterDropdownBtn");
  const modalHistFilterDropdown = document.getElementById("modalHistFilterDropdown");
  const modalHistDateFilterSelect = document.getElementById("modalHistDateFilterSelect");
  const modalHistCustomDateContainer = document.getElementById("modalHistCustomDateContainer");
  const modalHistApplyFiltersBtn = document.getElementById("modalHistApplyFiltersBtn");
  const modalHistResetFiltersBtn = document.getElementById("modalHistResetFiltersBtn");
  
  // Close Edit Modal
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

  // Edit Tab Toggles
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

  // Save changes
  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", () => {
      const textValue = document.getElementById("editText").value.trim();
      const amountValue = parseFloat(document.getElementById("editAmount").value);
      const dateValue = document.getElementById("editDate").value;

      if (isNaN(amountValue) || amountValue <= 0) {
        showToast("Please enter a valid positive amount.", "error");
        return;
      }
      if (!dateValue) {
        showToast("Please enter a valid date.", "error");
        return;
      }

      const finalAmount = editTransactionType === "income" ? Math.abs(amountValue) : -Math.abs(amountValue);

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
          updateModalHistUI();
          editModal.classList.remove("show");
          showToast("Transaction updated successfully!", "success");
          
          // Notify parent dashboard to update in real-time
          if (window.opener && typeof window.opener.fetchActiveTransactions === 'function') {
            window.opener.fetchActiveTransactions();
          }
        })
        .catch((err) => {
          console.error("Update failed", err);
          showToast("Failed to update transaction.", "error");
        });
    });
  }

  // Filter Listeners
  if (modalHistFilterDropdownBtn && modalHistFilterDropdown) {
    modalHistFilterDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isShown = modalHistFilterDropdown.style.display === 'block';
      modalHistFilterDropdown.style.display = isShown ? 'none' : 'block';
    });
    document.addEventListener("click", () => {
      modalHistFilterDropdown.style.display = 'none';
    });
    modalHistFilterDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  if (modalHistDateFilterSelect && modalHistCustomDateContainer) {
    modalHistDateFilterSelect.addEventListener("change", () => {
      if (modalHistDateFilterSelect.value === 'custom') {
        modalHistCustomDateContainer.style.display = 'grid';
      } else {
        modalHistCustomDateContainer.style.display = 'none';
        document.getElementById("modalHistStartDateInput").value = '';
        document.getElementById("modalHistEndDateInput").value = '';
      }
    });
  }

  if (modalHistApplyFiltersBtn) {
    modalHistApplyFiltersBtn.addEventListener("click", () => {
      modalHistTypeFilter = document.getElementById("modalHistTypeFilterSelect").value;
      modalHistDateFilter = modalHistDateFilterSelect.value;
      modalHistSortFilter = document.getElementById("modalHistSortFilterSelect").value;
      updateModalHistUI();
      modalHistFilterDropdown.style.display = 'none';
    });
  }

  if (modalHistResetFiltersBtn) {
    modalHistResetFiltersBtn.addEventListener("click", () => {
      document.getElementById("modalHistTypeFilterSelect").value = 'all';
      modalHistDateFilterSelect.value = 'all';
      document.getElementById("modalHistSortFilterSelect").value = 'dateDesc';
      document.getElementById("modalHistStartDateInput").value = '';
      document.getElementById("modalHistEndDateInput").value = '';
      modalHistCustomDateContainer.style.display = 'none';
      
      modalHistTypeFilter = 'all';
      modalHistDateFilter = 'all';
      modalHistSortFilter = 'dateDesc';
      
      updateModalHistUI();
      modalHistFilterDropdown.style.display = 'none';
    });
  }

  if (modalHistSearchInput) {
    modalHistSearchInput.addEventListener("input", (e) => {
      modalHistSearchQuery = e.target.value;
      updateModalHistUI();
    });
  }

  const closeBtn = document.getElementById("closeBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const container = document.querySelector(".container");
      if (container) {
        container.style.transition = "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
        container.style.opacity = "0";
        container.style.transform = "translateY(-12px)";
      }
      setTimeout(() => {
        window.location.href = "expense_tracker.html";
      }, 230);
    });
  }

  if (window.lucide) {
    lucide.createIcons();
  }
  
  fetchActiveTransactions();
}

window.openEditModal = openEditModal;
window.removeTransaction = removeTransaction;

init();
