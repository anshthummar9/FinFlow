<%@ page contentType="text/html;charset=UTF-8" %>
<% request.setAttribute("pageId", "budgets"); %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Budgets — FinFlow</title>
  <meta name="description" content="FinFlow Budgets — set monthly category limits and track your spending.">
  <link rel="stylesheet" href="/css/finflow.css">
</head>
<body>
<div class="app-layout">
  <%@ include file="includes/nav.jsp" %>

  <main class="main-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Budgets</h1>
        <p class="page-subtitle">Set monthly limits per category and track vs actuals</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <select class="form-select" id="monthSelect" style="width:130px;">
          <option value="1">January</option><option value="2">February</option>
          <option value="3">March</option><option value="4">April</option>
          <option value="5">May</option><option value="6">June</option>
          <option value="7">July</option><option value="8">August</option>
          <option value="9">September</option><option value="10">October</option>
          <option value="11">November</option><option value="12">December</option>
        </select>
        <select class="form-select" id="yearSelect" style="width:100px;"></select>
        <button class="btn btn-primary" id="addBudgetBtn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Budget
        </button>
      </div>
    </div>

    <div class="page-body">
      <div class="grid-auto" id="budgetGrid">
        <div class="empty-state" style="grid-column:1/-1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <h3>Loading budgets…</h3>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- Add Budget Modal -->
<div class="modal-overlay" id="addBudgetModal">
  <div class="modal-box">
    <div class="modal-header">
      <h2 class="modal-title">Set Budget</h2>
      <button class="modal-close" id="closeAddBudgetModal">&times;</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px;">
      <div class="form-group">
        <label class="form-label" for="budgetCategorySelect">Category</label>
        <select class="form-select" id="budgetCategorySelect"></select>
      </div>
      <div class="form-group">
        <label class="form-label" for="budgetAmountInput">Monthly Limit (₹)</label>
        <input class="form-input" type="number" id="budgetAmountInput" placeholder="e.g. 5000" min="1" step="1">
      </div>
      <button class="btn btn-primary" id="saveBudgetBtn" style="justify-content:center;">Save Budget</button>
    </div>
  </div>
</div>

<div class="toast-container" id="toastContainer"></div>

<script src="/js/session.js"></script>
<script src="/js/budgets.js"></script>
</body>
</html>
