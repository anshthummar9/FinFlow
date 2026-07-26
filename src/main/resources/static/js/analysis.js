/* analysis.js — Charts via Chart.js */
let txns = [];

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } } },
};

document.addEventListener('DOMContentLoaded', () => {
  fetch(`${BASE_URL}/ExpTrack/transactions/${username}`)
    .then(r => r.json())
    .then(data => { txns = data; renderAll(); })
    .catch(() => showToast('Could not load data', 'error'));

  document.getElementById('periodSelect')?.addEventListener('change', renderAll);
});

function renderAll() {
  const period = document.getElementById('periodSelect')?.value || '30';
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - parseInt(period));
  const recent = txns.filter(t => new Date(t.date) >= cutoff);

  renderOverviewChart(recent);
  renderTrendChart(recent);
  renderCategoryChart(recent);
  renderMonthlyChart();
  renderSummaryStats(recent);
}

// 1) Overview doughnut
let overviewChart;
function renderOverviewChart(data) {
  const income  = data.filter(t => t.amount >= 0).reduce((s,t) => s+t.amount, 0);
  const expense = data.filter(t => t.amount < 0).reduce((s,t) => s+Math.abs(t.amount), 0);
  const ctx = document.getElementById('overviewChart')?.getContext('2d');
  if (!ctx) return;
  const hasData = income > 0 || expense > 0;
  const cfg = {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: hasData ? [income, expense] : [1, 1],
        backgroundColor: hasData ? ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)'],
        borderColor: hasData ? ['#10b981', '#ef4444'] : ['transparent', 'transparent'],
        borderWidth: 2, hoverOffset: 6,
      }]
    },
    options: {
      ...CHART_DEFAULTS, cutout: '70%',
      plugins: { ...CHART_DEFAULTS.plugins, tooltip: { callbacks: { label: c => ` ₹${c.raw.toFixed(2)}` } } },
    }
  };
  if (overviewChart) { overviewChart.destroy(); }
  overviewChart = new Chart(ctx, cfg);
}

// 2) Daily trend line
let trendChart;
function renderTrendChart(data) {
  const dateMap = {};
  data.forEach(t => {
    if (!dateMap[t.date]) dateMap[t.date] = { income: 0, expense: 0 };
    t.amount >= 0 ? dateMap[t.date].income += t.amount : dateMap[t.date].expense += Math.abs(t.amount);
  });
  const dates = Object.keys(dateMap).sort();
  const ctx = document.getElementById('trendChart')?.getContext('2d');
  if (!ctx) return;
  const cfg = {
    type: 'line',
    data: {
      labels: dates.map(d => formatDate(d)),
      datasets: [
        { label: 'Income',  data: dates.map(d => dateMap[d].income),  borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)', fill: true, tension: 0.35, borderWidth: 2, pointRadius: 3 },
        { label: 'Expense', data: dates.map(d => dateMap[d].expense), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)',  fill: true, tension: 0.35, borderWidth: 2, pointRadius: 3 },
      ]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', maxTicksLimit: 10, font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', callback: v => '₹'+v, font: { size: 10 } } },
      }
    }
  };
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, cfg);
}

// 3) Category breakdown horizontal bar
let catChart;
function renderCategoryChart(data) {
  const expenses = data.filter(t => t.amount < 0);
  const catMap = {};
  expenses.forEach(t => { if (!t.category) return; catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount); });
  const sorted = Object.entries(catMap).sort((a,b) => b[1]-a[1]).slice(0,8);
  const ctx = document.getElementById('catChart')?.getContext('2d');
  if (!ctx) return;
  const cfg = {
    type: 'bar',
    data: {
      labels: sorted.map(([c]) => { const icon = getCatIcon(c, false); return `${icon} ${c}`; }),
      datasets: [{ label: 'Spent', data: sorted.map(([,v]) => v), backgroundColor: 'rgba(99,102,241,0.6)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 6 }]
    },
    options: {
      ...CHART_DEFAULTS, indexAxis: 'y',
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', callback: v => '₹'+v, font: { size: 10 } } },
        y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }
      },
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } }
    }
  };
  if (catChart) catChart.destroy();
  catChart = new Chart(ctx, cfg);
}

// 4) Monthly comparison grouped bar (last 6 months)
let monthlyChart;
function renderMonthlyChart() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) });
  }
  const incomeData  = months.map(m => txns.filter(t => { const d = new Date(t.date); return d.getFullYear()===m.year && d.getMonth()+1===m.month && t.amount>=0; }).reduce((s,t) => s+t.amount, 0));
  const expenseData = months.map(m => txns.filter(t => { const d = new Date(t.date); return d.getFullYear()===m.year && d.getMonth()+1===m.month && t.amount<0;  }).reduce((s,t) => s+Math.abs(t.amount), 0));
  const ctx = document.getElementById('monthlyChart')?.getContext('2d');
  if (!ctx) return;
  const cfg = {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        { label: 'Income',  data: incomeData,  backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 5 },
        { label: 'Expense', data: expenseData, backgroundColor: 'rgba(239,68,68,0.7)',  borderRadius: 5 },
      ]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', callback: v => '₹'+v, font: { size: 10 } } },
      }
    }
  };
  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(ctx, cfg);
}

// Summary stats
function renderSummaryStats(data) {
  const income  = data.filter(t => t.amount >= 0).reduce((s,t) => s+t.amount, 0);
  const expense = data.filter(t => t.amount < 0).reduce((s,t) => s+Math.abs(t.amount), 0);
  const days = data.length > 0 ? Math.max(1, Math.ceil((new Date(data[data.length-1]?.date) - new Date(data[0]?.date)) / 86400000) + 1) : 1;

  const catMap = {};
  data.filter(t => t.amount < 0 && t.category).forEach(t => { catMap[t.category] = (catMap[t.category]||0)+Math.abs(t.amount); });
  const topCat = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];

  const biggestTxn = data.filter(t=>t.amount<0).sort((a,b)=>a.amount-b.amount)[0];

  const el = id => document.getElementById(id);
  if (el('statIncome'))  el('statIncome').textContent  = `₹${income.toFixed(2)}`;
  if (el('statExpense')) el('statExpense').textContent = `₹${expense.toFixed(2)}`;
  if (el('statSavings')) el('statSavings').textContent = `₹${(income-expense).toFixed(2)}`;
  if (el('statAvgDay'))  el('statAvgDay').textContent  = `₹${(expense/days).toFixed(2)}/day`;
  if (el('statTopCat'))  el('statTopCat').textContent  = topCat ? `${getCatIcon(topCat[0],false)} ${topCat[0]}` : '—';
  if (el('statBiggest')) el('statBiggest').textContent = biggestTxn ? `₹${Math.abs(biggestTxn.amount).toFixed(2)}` : '—';
}
