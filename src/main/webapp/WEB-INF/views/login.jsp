<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — FinFlow</title>
  <link rel="stylesheet" href="/css/finflow.css">
</head>
<body>
<div class="auth-page">
  <div class="auth-box">
    <div class="auth-logo">
      <div class="auth-logo-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="2" style="width:22px;height:22px;">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      </div>
      <span class="auth-logo-text">FinFlow</span>
    </div>

    <h1 class="auth-title">Welcome back</h1>
    <p class="auth-subtitle">Sign in to your account to continue</p>

    <div class="auth-error" id="loginError"></div>

    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="form-group">
        <label class="form-label" for="loginUsername">Username</label>
        <input class="form-input" type="text" id="loginUsername" placeholder="Enter your username" autocomplete="username">
      </div>
      <div class="form-group">
        <label class="form-label" for="loginPassword">Password</label>
        <input class="form-input" type="password" id="loginPassword" placeholder="Enter your password" autocomplete="current-password">
      </div>
      <button class="btn btn-primary w-full" id="loginBtn" style="justify-content:center;margin-top:4px;">
        Sign In
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>

    <div class="auth-footer">
      Don't have an account? <a class="auth-link" href="/register">Create one</a>
    </div>
  </div>
</div>

<div class="toast-container" id="toastContainer"></div>

<script src="/js/session.js"></script>
<script>
  // Override auth guard — login page should be accessible without session
  const _username = localStorage.getItem('user');
  if (_username) window.location.href = '/dashboard';

  // If already logged in, skip to dashboard
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('loginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

  function login() {
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value.trim();
    const errEl = document.getElementById('loginError');
    if (!u || !p) { errEl.textContent = 'Please fill in all fields.'; errEl.classList.add('show'); return; }

    fetch('http://localhost:8080/ExpTrack/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p }),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        localStorage.setItem('user', data.username || u);
        window.location.href = '/dashboard';
      })
      .catch(() => {
        errEl.textContent = 'Invalid username or password.';
        errEl.classList.add('show');
      });
  }
</script>
</body>
</html>
