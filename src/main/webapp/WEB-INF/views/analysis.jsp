<%@ page contentType="text/html;charset=UTF-8" %>
<% request.setAttribute("pageId", "analysis"); %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analysis — FinFlow</title>
  <meta name="description" content="FinFlow Analysis — visualize your spending trends, category breakdown, and monthly comparison.">
  <link rel="stylesheet" href="/css/finflow.css">
  <style>
    .stat-chip {
      display: flex; flex-direction: column; gap: 4px;
      padding: 14px 18px;
      background: var(--bg-glass);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }
    .stat-chip-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
    .stat-chip-value { font-size: 18px; font-weight: 700; }
  </style>
</head>
<body>
<div class="app-layout">
  <%@ include file="includes/nav.jsp" %>

  <main class="main-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Analysis</h1>
        <p class="page-subtitle">Understand your financial patterns</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <label class="form-label" style="margin:0;white-space:nowrap;">Period:</label>
        <select class="form-select" id="periodSelect" style="width:150px;">
          <option value="7">Last 7 Days</option>
          <option value="30" selected>Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">This Year</option>
        </select>
      </div>
    </div>

    <div class="page-body">
      <!-- Summary Stats -->
      <div class="grid-4" style="margin-bottom:24px;">
        <div class="stat-chip">
          <span class="stat-chip-label">Total Income</span>
          <span class="stat-chip-value" id="statIncome" style="color:var(--income-color);">—</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip-label">Total Expense</span>
          <span class="stat-chip-value" id="statExpense" style="color:var(--expense-color);">—</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip-label">Net Savings</span>
          <span class="stat-chip-value" id="statSavings" style="color:var(--primary-light);">—</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip-label">Avg Daily Spend</span>
          <span class="stat-chip-value" id="statAvgDay" style="color:var(--warning-color);">—</span>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:24px;">
        <div class="stat-chip">
          <span class="stat-chip-label">Top Spend Category</span>
          <span class="stat-chip-value" id="statTopCat" style="font-size:16px;">—</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip-label">Biggest Expense</span>
          <span class="stat-chip-value" id="statBiggest" style="color:var(--expense-color);">—</span>
        </div>
      </div>

      <!-- Charts Row 1: Overview + Trend -->
      <div class="grid-2" style="margin-bottom:24px;">
        <div class="card">
          <div class="card-header"><span class="card-title">Income vs Expense</span></div>
          <div class="chart-container"><canvas id="overviewChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Daily Trend</span></div>
          <div class="chart-container"><canvas id="trendChart"></canvas></div>
        </div>
      </div>

      <!-- Charts Row 2: Category + Monthly -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><span class="card-title">Category Breakdown (Expense)</span></div>
          <div class="chart-container chart-container-lg"><canvas id="catChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Monthly Comparison (6 months)</span></div>
          <div class="chart-container chart-container-lg"><canvas id="monthlyChart"></canvas></div>
        </div>
      </div>
    </div>
  </main>
</div>

<div class="toast-container" id="toastContainer"></div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="/js/session.js"></script>
<script src="/js/analysis.js"></script>
</body>
</html>
