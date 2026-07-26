<%@ page contentType="text/html;charset=UTF-8" %>
<% request.setAttribute("pageId", "accounts"); %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accounts — FinFlow</title>
  <meta name="description" content="FinFlow Accounts — see balances per account and manage your payment methods.">
  <link rel="stylesheet" href="/css/finflow.css">
</head>
<body>
<div class="app-layout">
  <%@ include file="includes/nav.jsp" %>

  <main class="main-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Accounts</h1>
        <p class="page-subtitle">Balance summary by payment method — click a card to view transactions</p>
      </div>
      <button class="btn btn-primary" id="addAccountBtn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Account
      </button>
    </div>

    <div class="page-body">
      <!-- Account Cards -->
      <div class="grid-auto" id="accountsGrid" style="margin-bottom:28px;">
        <div class="empty-state" style="grid-column:1/-1;"><h3>Loading…</h3></div>
      </div>

      <!-- Filtered Transaction Table (shown when account selected) -->
      <div id="accountTxnSection" style="display:none;">
        <div class="card">
          <div class="card-header">
            <span class="card-title" id="accountTxnTitle">Account Transactions</span>
          </div>
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th><th>Description</th><th>Category</th><th>Amount</th>
                </tr>
              </thead>
              <tbody id="accountTxnBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- Add Account Modal -->
<div class="modal-overlay" id="addAccountModal">
  <div class="modal-box" style="max-width:380px;">
    <div class="modal-header">
      <h2 class="modal-title">Add Account</h2>
      <button class="modal-close" id="closeAddAccountModal">&times;</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px;">
      <div class="form-group">
        <label class="form-label">Emoji</label>
        <input class="form-input emoji-input" type="text" id="accEmojiInput" placeholder="💳" maxlength="2">
      </div>
      <div class="form-group">
        <label class="form-label" for="accNameInput">Account Name</label>
        <input class="form-input" type="text" id="accNameInput" placeholder="e.g. HDFC Savings">
      </div>
      <button class="btn btn-primary" id="saveAccountBtn" style="justify-content:center;">Add Account</button>
    </div>
  </div>
</div>

<div class="toast-container" id="toastContainer"></div>

<script src="/js/session.js"></script>
<script src="/js/accounts.js"></script>
</body>
</html>
