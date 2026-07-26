<%@ page contentType="text/html;charset=UTF-8" %>
<% request.setAttribute("pageId", "dashboard"); %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard — FinFlow</title>
  <meta name="description" content="FinFlow Dashboard — manage your income and expenses at a glance.">
  <link rel="stylesheet" href="/css/finflow.css">
  <style>
    .add-form-card { display: grid; grid-template-columns: 1fr 130px 160px 160px; gap: 10px; align-items: end; }
    @media (max-width: 900px) { .add-form-card { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .add-form-card { grid-template-columns: 1fr; } }
    .recent-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0; border-bottom: 1px solid var(--border-color);
    }
    .recent-row:last-child { border-bottom: none; }
    .recent-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
      flex-shrink: 0;
    }
    .recent-icon.income  { background: var(--income-bg); }
    .recent-icon.expense { background: var(--expense-bg); }
  </style>
</head>
<body>
<div class="app-layout">
  <%@ include file="includes/nav.jsp" %>

  <main class="main-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, <span id="sidebarUsername2"></span> 👋</p>
      </div>
    </div>

    <div class="page-body">
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="card kpi-card balance">
          <div class="kpi-label">Total Balance</div>
          <div class="kpi-value" id="balanceVal">₹0.00</div>
        </div>
        <div class="card kpi-card income-card">
          <div class="kpi-label">Total Income</div>
          <div class="kpi-value" id="incomeVal">₹0.00</div>
        </div>
        <div class="card kpi-card expense-card">
          <div class="kpi-label">Total Expenses</div>
          <div class="kpi-value" id="expenseVal">₹0.00</div>
        </div>
      </div>

      <!-- Add Transaction -->
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header">
          <span class="card-title">Add Transaction</span>
          <div class="type-tabs" style="width:auto;">
            <button class="type-tab active" data-type="expense">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              Expense
            </button>
            <button class="type-tab" data-type="income">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              Income
            </button>
          </div>
        </div>
        <div class="add-form-card">
          <div class="form-group">
            <label class="form-label" for="descInput">Description</label>
            <input class="form-input" type="text" id="descInput" placeholder="e.g. Dinner, Salary…">
          </div>
          <div class="form-group">
            <label class="form-label" for="amtInput">Amount (₹)</label>
            <input class="form-input" type="number" id="amtInput" placeholder="0.00" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label" for="catSelect">Category</label>
            <select class="form-select" id="catSelect"></select>
          </div>
          <div class="form-group">
            <label class="form-label" for="accSelect">Account</label>
            <select class="form-select" id="accSelect"></select>
          </div>
        </div>
        <button class="btn btn-primary" id="addBtn" style="margin-top:14px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Transaction
        </button>
      </div>

      <!-- Recent Transactions -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent Transactions</span>
          <a href="/records" class="btn btn-ghost btn-sm">View All →</a>
        </div>
        <div id="recentList"></div>
      </div>
    </div>
  </main>
</div>

<div class="toast-container" id="toastContainer"></div>

<script src="/js/session.js"></script>
<script>
  // Mirror username in subtitle
  document.addEventListener('DOMContentLoaded', () => {
    const el2 = document.getElementById('sidebarUsername2');
    if (el2 && username) el2.textContent = username;
  });
</script>
<script src="/js/dashboard.js"></script>
</body>
</html>
