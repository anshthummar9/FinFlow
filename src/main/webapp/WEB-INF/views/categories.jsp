<%@ page contentType="text/html;charset=UTF-8" %>
<% request.setAttribute("pageId", "categories"); %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Categories — FinFlow</title>
  <meta name="description" content="FinFlow Categories — view spending per category and manage custom categories.">
  <link rel="stylesheet" href="/css/finflow.css">
</head>
<body>
<div class="app-layout">
  <%@ include file="includes/nav.jsp" %>

  <main class="main-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Categories</h1>
        <p class="page-subtitle">Total spending / earnings per category</p>
      </div>
      <!-- Type Tabs -->
      <div class="type-tabs">
        <button class="type-tab active" data-type="expense">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          Expense
        </button>
        <button class="type-tab" data-type="income">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          Income
        </button>
      </div>
    </div>

    <div class="page-body">
      <!-- Category Stats Grid -->
      <div class="grid-auto" id="catGrid" style="margin-bottom:28px;"></div>

      <!-- Manage Section -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Manage Categories</span>
        </div>
        <div class="manage-list" id="manageList"></div>
        <div class="add-form">
          <input class="form-input emoji-input" type="text" id="catEmojiInput" placeholder="🔖" maxlength="2">
          <input class="form-input" type="text" id="catNameInput" placeholder="New category name…" style="flex:1;">
          <button class="btn btn-primary" id="addCatBtn">+ Add</button>
        </div>
      </div>
    </div>
  </main>
</div>

<div class="toast-container" id="toastContainer"></div>

<script src="/js/session.js"></script>
<script src="/js/categories.js"></script>
</body>
</html>
