(function() {
  const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
  const CHECK_INTERVAL_MS = 5000;    // Check every 5 seconds
  const THROTTLE_MS = 5000;          // Throttle localStorage updates to once every 5 seconds

  let lastActivityUpdate = 0;

  // Update the last activity timestamp in localStorage
  function updateActivity() {
    const now = Date.now();
    // Only write to localStorage if at least THROTTLE_MS has passed since the last write
    if (now - lastActivityUpdate > THROTTLE_MS) {
      localStorage.setItem('lastActivity', now.toString());
      lastActivityUpdate = now;
    }
  }

  // Check if session has timed out
  function checkSession() {
    const user = localStorage.getItem('user');
    // If not logged in, we don't check for timeouts
    if (!user) {
      return;
    }

    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > TIMEOUT_MS) {
        logoutDueToTimeout();
      }
    } else {
      // If user is logged in but no lastActivity exists, initialize it now
      localStorage.setItem('lastActivity', Date.now().toString());
    }
  }

  // Perform logout and redirect to login page with timeout flag
  function logoutDueToTimeout() {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    
    // Clear and redirect
    window.location.href = 'login.html?timeout=true';
  }

  // Setup user event listeners for activity tracking
  const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'click', 'touchstart'];
  activityEvents.forEach(eventName => {
    window.addEventListener(eventName, updateActivity, { passive: true });
  });

  // Initialize activity on script load if user is logged in
  if (localStorage.getItem('user')) {
    updateActivity();
  }

  // Check periodically
  setInterval(checkSession, CHECK_INTERVAL_MS);

  // Sync logout / timeout across multiple browser tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'user' && !event.newValue) {
      // If 'user' was removed from another tab, redirect this tab as well
      window.location.href = 'login.html';
    }
  });
})();
