// ─── STATE ───────────────────────────────────────────────────────
let salary = 0;
let expenses = [];
let chartInstance = null;

// ─── DOM ELEMENTS ────────────────────────────────────────────────
const salaryInput     = document.getElementById('salary-input');
const salaryError     = document.getElementById('salary-error');
const expenseNameInput   = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseError    = document.getElementById('expense-error');

const displaySalary   = document.getElementById('display-salary');
const displayExpenses = document.getElementById('display-expenses');
const displayBalance  = document.getElementById('display-balance');
const salarySub       = document.getElementById('salary-sub');
const expensesSub     = document.getElementById('expenses-sub');
const balanceSub      = document.getElementById('balance-sub');
const budgetAlert     = document.getElementById('budget-alert');
const expenseList     = document.getElementById('expense-list');
const expenseCount    = document.getElementById('expense-count');
const pieCanvas       = document.getElementById('pie-chart');
const chartEmpty      = document.getElementById('chart-empty');

// ─── LOCALSTORAGE ────────────────────────────────────────────────
function saveData() {
  localStorage.setItem('cashflow_salary',   JSON.stringify(salary));
  localStorage.setItem('cashflow_expenses', JSON.stringify(expenses));
}

function loadData() {
  const s = localStorage.getItem('cashflow_salary');
  const e = localStorage.getItem('cashflow_expenses');
  if (s) salary   = JSON.parse(s);
  if (e) expenses = JSON.parse(e);
  render();
}

// ─── SALARY ──────────────────────────────────────────────────────
function setSalary() {
  const val = Number(salaryInput.value);

  // Validation
  if (!val || val <= 0) {
    salaryError.style.display = 'block';
    return;
  }

  salaryError.style.display = 'none';
  salary = val;
  saveData();
  render();
  salaryInput.value = '';
}

// ─── ADD EXPENSE ─────────────────────────────────────────────────
function addExpense() {
  const name   = expenseNameInput.value.trim();
  const amount = Number(expenseAmountInput.value);

  // Validation
  if (!name || !amount || amount <= 0) {
    expenseError.style.display = 'block';
    return;
  }

  expenseError.style.display = 'none';

  // Add to array
  expenses.push({
    id: Date.now(),
    name: name,
    amount: amount
  });

  saveData();
  render();

  // Clear inputs
  expenseNameInput.value   = '';
  expenseAmountInput.value = '';
}

// ─── DELETE EXPENSE ───────────────────────────────────────────────
function deleteExpense(id) {
  expenses = expenses.filter(function(e) {
    return e.id !== id;
  });
  saveData();
  render();
}

// ─── FORMAT CURRENCY ──────────────────────────────────────────────
function fmt(amount) {
  return '₹' + amount.toFixed(2);
}

// ─── ESCAPE HTML (prevent XSS) ────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── RENDER ──────────────────────────────────────────────────────
function render() {
  const totalExpenses = expenses.reduce(function(sum, e) {
    return sum + e.amount;
  }, 0);
  const balance = salary - totalExpenses;

  // Check if balance is below 10% of salary (budget alert)
  const isWarning = salary > 0 && balance < (salary * 0.1);

  // ── Update Salary stat
  displaySalary.textContent = salary > 0 ? fmt(salary) : '—';
  salarySub.textContent     = salary > 0 ? 'This month' : 'Not set yet';

  // ── Update Expenses stat
  displayExpenses.textContent = totalExpenses > 0 ? fmt(totalExpenses) : '—';
  expensesSub.textContent     = expenses.length + ' item' + (expenses.length !== 1 ? 's' : '');

  // ── Update Balance stat
  displayBalance.textContent = salary > 0 ? fmt(balance) : '—';
  displayBalance.className   = 'stat-value balance' + (isWarning ? ' warning' : '');
  balanceSub.textContent     = salary > 0
    ? (balance >= 0 ? 'Looking good!' : 'Overspent!')
    : 'Set your salary first';

  // ── Budget Alert
  if (isWarning) {
    budgetAlert.classList.add('show');
  } else {
    budgetAlert.classList.remove('show');
  }

  // ── Expense Count badge
  expenseCount.textContent = expenses.length + ' item' + (expenses.length !== 1 ? 's' : '');

  // ── Render Expense List
  if (expenses.length === 0) {
    expenseList.innerHTML =
      '<div class="list-empty">' +
        '<span class="list-empty-icon">📋</span>' +
        '<span>No expenses yet. Start adding!</span>' +
      '</div>';
  } else {
    expenseList.innerHTML = expenses.map(function(e) {
      return `
        <div class="expense-item" id="item-${e.id}">
          <div class="expense-item-left">
            <div class="expense-dot"></div>
            <span class="expense-name">${escapeHtml(e.name)}</span>
          </div>
          <div class="expense-item-right">
            <span class="expense-amount">${fmt(e.amount)}</span>
            <button class="delete-btn" data-id="${e.id}" title="Delete">🗑</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Render Chart
  renderChart(totalExpenses, balance);
}

// ─── CHART ───────────────────────────────────────────────────────
function renderChart(totalExpenses, balance) {
  // Hide chart if no expenses or salary not set
  if (expenses.length === 0 || salary === 0) {
    pieCanvas.style.display = 'none';
    chartEmpty.style.display = 'flex';
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  pieCanvas.style.display = 'block';
  chartEmpty.style.display = 'none';

  const remaining = Math.max(balance, 0);

  // If chart already exists, just update data
  if (chartInstance) {
    chartInstance.data.datasets[0].data = [totalExpenses, remaining];
    chartInstance.update();
    return;
  }

  // Create new chart
  chartInstance = new Chart(pieCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Expenses', 'Remaining'],
      datasets: [{
        data: [totalExpenses, remaining],
        backgroundColor: ['#f4c553', '#6fdc8c'],
        borderColor: '#161616',
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#f0ece3',
            font: { family: 'DM Mono', size: 11 },
            padding: 14,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return ' ' + ctx.label + ': ' + fmt(ctx.raw);
            }
          },
          bodyFont: { family: 'DM Mono', size: 12 },
          backgroundColor: '#1e1e1e',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }
      }
    }
  });
}

// ─── EVENT LISTENERS ─────────────────────────────────────────────
document.getElementById('set-salary-btn').addEventListener('click', setSalary);
document.getElementById('add-expense-btn').addEventListener('click', addExpense);

// Event delegation for delete buttons
expenseList.addEventListener('click', function(e) {
  if (e.target.classList.contains('delete-btn')) {
    const id = Number(e.target.dataset.id);
    deleteExpense(id);
  }
});

// Allow Enter key on inputs
salaryInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') setSalary();
});
expenseAmountInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addExpense();
});

// ─── INIT ─────────────────────────────────────────────────────────
loadData();