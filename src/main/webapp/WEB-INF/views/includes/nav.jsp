<%-- includes/nav.jsp — Shared sidebar navigation --%>
<%@ page contentType="text/html;charset=UTF-8" %>

<%-- pageId is set by each parent JSP: dashboard, records, analysis, budgets, accounts, categories --%>
<%
  String pageId = (String) request.getAttribute("pageId");
  if (pageId == null) pageId = "";
%>

<aside class="sidebar">
  <div class="sidebar-logo">
    <div class="sidebar-logo-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           style="width:20px;height:20px;color:#fff;">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    </div>
    <span class="sidebar-logo-text">FinFlow</span>
  </div>

  <nav class="sidebar-nav">
    <span class="nav-section-label">Main</span>

    <a href="/dashboard" class="nav-item <%= "dashboard".equals(pageId) ? "active" : "" %>">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      Dashboard
    </a>

    <a href="/records" class="nav-item <%= "records".equals(pageId) ? "active" : "" %>">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      Records
    </a>

    <a href="/analysis" class="nav-item <%= "analysis".equals(pageId) ? "active" : "" %>">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      Analysis
    </a>

    <span class="nav-section-label">Manage</span>

    <a href="/budgets" class="nav-item <%= "budgets".equals(pageId) ? "active" : "" %>">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      Budgets
    </a>

    <a href="/accounts" class="nav-item <%= "accounts".equals(pageId) ? "active" : "" %>">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
      Accounts
    </a>

    <a href="/categories" class="nav-item <%= "categories".equals(pageId) ? "active" : "" %>">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
      Categories
    </a>
  </nav>

  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="user-avatar" id="sidebarAvatar">U</div>
      <span class="user-name" id="sidebarUsername">User</span>
    </div>
    <button class="logout-btn" id="logoutBtn">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Logout
    </button>
  </div>
</aside>
