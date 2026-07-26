<%@ page contentType="text/html;charset=UTF-8" %>
<% request.setAttribute("pageId", "records"); %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Records — FinFlow</title>
  <meta name="description" content="FinFlow Records — browse, filter, and search all your transactions.">
  <link rel="stylesheet" href="/css/finflow.css">
  <style>
    .stats-bar {
      display: flex; flex-wrap: wrap; gap: 20px; align-items: center;
      padding: 12px 20px;
      background: var(--bg-glass);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      margin-bottom: 16px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .filter-row {
      display: grid;
      grid-template-columns: 1fr auto auto auto auto auto;
      gap: 10px;
      align-items: end;
      margin-bottom: 16px;
    }
    @media (max-width: 900px) { .filter-row { grid-template-columns: 1fr 1fr; } }
    .table-wrap { overflow-x: auto; }
  </style>
</head>
<body>
<div class="app-layout">
  <%@ include file="includes/nav.jsp" %>

  <main class="main-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Records</h1>
        <p class="page-subtitle">All your transactions in one place</p>
      </div>
    </div>

    <div class="page-body">
      <!-- Stats Bar -->
      <div class="stats-bar" id="statsBar">Loading…</div>

      <!-- Filter Row -->
      <div class="filter-row">
        <div class="search-input-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="form-input filter-control" type="text" id="searchInput" placeholder="Search transactions…">
        </div>
        <select class="form-select filter-control" id="filterType" style="width:130px;">
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select class="form-select filter-control" id="filterCategory" style="width:160px;"></select>
        <select class="form-select filter-control" id="filterAccount" style="width:150px;"></select>
        <select class="form-select filter-control" id="filterDate" style="width:140px;">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="last7">Last 7 Days</option>
          <option value="last30">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
        </select>
        <div style="display:flex;gap:8px;">
          <select class="form-select" id="filterSort" style="width:150px;">
            <option value="dateDesc">Newest First</option>
            <option value="dateAsc">Oldest First</option>
            <option value="amountDesc">Highest Amount</option>
            <option value="amountAsc">Lowest Amount</option>
          </select>
          <button class="btn btn-ghost btn-icon" id="resetFilters" title="Reset filters" style="flex-shrink:0;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.02"/></svg>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="recordsTbody"></tbody>
          </table>
        </div>
        <div class="pagination" id="pagination"></div>
      </div>
    </div>
  </main>
</div>

<!-- Edit Transaction Modal -->
<div class="modal-overlay" id="recEditModal">
  <div class="modal-box" style="max-width:500px;">
    <div class="modal-header">
      <h2 class="modal-title">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;display:inline;vertical-align:middle;margin-right:6px;color:var(--primary-light);"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Transaction
      </h2>
      <button class="modal-close" id="recEditClose">&times;</button>
    </div>

    <!-- Type tabs -->
    <div class="type-tabs" style="margin-bottom:20px;">
      <button class="type-tab active" data-type="expense">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
        Expense
      </button>
      <button class="type-tab" data-type="income">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
        Income
      </button>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="form-group">
        <label class="form-label" for="recEditDesc">Description</label>
        <input class="form-input" type="text" id="recEditDesc" placeholder="e.g. Grocery, Salary…">
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group">
          <label class="form-label" for="recEditAmount">Amount (₹)</label>
          <input class="form-input" type="number" id="recEditAmount" placeholder="0.00" min="0.01" step="0.01">
        </div>
        <div class="form-group">
          <label class="form-label" for="recEditDate">Date</label>
          <input class="form-input" type="date" id="recEditDate">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group">
          <label class="form-label" for="recEditCategory">Category</label>
          <select class="form-select" id="recEditCategory"></select>
        </div>
        <div class="form-group">
          <label class="form-label" for="recEditAccount">Account</label>
          <select class="form-select" id="recEditAccount"></select>
        </div>
      </div>

      <button class="btn btn-primary" id="recEditSave" style="justify-content:center;margin-top:4px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Save Changes
      </button>
    </div>
  </div>
</div>

<div class="toast-container" id="toastContainer"></div>

<script src="/js/session.js"></script>
<script src="/js/records.js"></script>
</body>
</html>
