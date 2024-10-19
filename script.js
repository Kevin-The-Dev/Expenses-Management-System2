document.addEventListener('DOMContentLoaded', () => {
    // Select elements
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('authForm');
    const toggleAuth = document.getElementById('toggle-auth');
    const authTitle = document.getElementById('auth-title');
    const authSubmit = document.getElementById('auth-submit');
    const expenseForm = document.getElementById('expenseForm');
    const expensesList = document.getElementById('expenses');
    const expensePieChart = document.getElementById('expensePieChart').getContext('2d');
    const categoryForm = document.getElementById('categoryForm');
    const categoryList = document.getElementById('categoryList');
    const budgetForm = document.getElementById('budgetForm');
    const budgetList = document.getElementById('budgetList');
    const recurringForm = document.getElementById('recurringForm');
    const recurringList = document.getElementById('recurringList');
    const reportForm = document.getElementById('reportForm');
    const reportList = document.getElementById('reportList');

    // Initialize data
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let categories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Travel'];
    let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let recurringExpenses = JSON.parse(localStorage.getItem('recurringExpenses')) || [];
    let expenseData = {};

    // Check if user is logged in
    if (!isLoggedIn) {
        authModal.style.display = 'flex';
    }

    // Sign-up and login form submission
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (authSubmit.textContent === 'Login') {
            loginUser(username, password);
        } else {
            signUpUser(username, password);
        }
    });

    // Toggle between login and sign-up forms
    toggleAuth.addEventListener('click', () => {
        if (authSubmit.textContent === 'Login') {
            authTitle.textContent = 'Sign Up';
            authSubmit.textContent = 'Sign Up';
            toggleAuth.innerHTML = 'Already have an account? <a href="#">Login</a>';
        } else {
            authTitle.textContent = 'Login';
            authSubmit.textContent = 'Login';
            toggleAuth.innerHTML = 'Don\'t have an account? <a href="#">Sign Up</a>';
        }
    });

    // Sign up function
    function signUpUser(username, password) {
        if (users.some(user => user.username === username)) {
            alert('Username already exists!');
            return;
        }

        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Account created successfully!');
        toggleToLogin();
    }

    // Login function
    function loginUser(username, password) {
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            localStorage.setItem('isLoggedIn', 'true');
            authModal.style.display = 'none';
            alert(`Welcome, ${username}!`);
        } else {
            alert('Invalid username or password!');
        }
    }

    // Toggle to login view after sign-up
    function toggleToLogin() {
        authTitle.textContent = 'Login';
        authSubmit.textContent = 'Login';
        toggleAuth.innerHTML = 'Don\'t have an account? <a href="#">Sign Up</a>';
    }

    // Update localStorage with current data
    function updateLocalStorage() {
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('budgets', JSON.stringify(budgets));
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('recurringExpenses', JSON.stringify(recurringExpenses));
    }

    // Render categories and budget lists
    function renderCategories() {
        document.getElementById('category').innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
        document.getElementById('budgetCategory').innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
        categoryList.innerHTML = categories.map(c => `<li>${c} <button onclick="deleteCategory('${c}')">Delete</button></li>`).join('');
    }

    // Delete category
    function deleteCategory(category) {
        categories = categories.filter(c => c !== category);
        renderCategories();
        updateLocalStorage();
    }

    // Add new category
    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCategory = document.getElementById('newCategory').value;
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            renderCategories();
            updateLocalStorage();
            categoryForm.reset();
        }
    });

    // Add or update budget for category
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('budgetCategory').value;
        const budgetAmount = parseFloat(document.getElementById('budgetAmount').value);
        if (category && budgetAmount > 0) {
            budgets[category] = budgetAmount;
            renderBudgets();
            updateLocalStorage();
        }
    });

    // Render budget list
    function renderBudgets() {
        budgetList.innerHTML = Object.keys(budgets).map(c => `<li>${c}: Rs.${budgets[c].toFixed(2)}</li>`).join('');
    }

    // Add expense
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;
        const category = document.getElementById('category').value;

        if (description && amount > 0 && date) {
            const expense = { description, amount, date, category };
            expenses.push(expense);
            addExpenseToList(expense);
            updatePieChart(category, amount);
            expenseForm.reset();
            updateLocalStorage();
        }
    });

    // Add expense to list
    function addExpenseToList(expense) {
        const li = document.createElement('li');
        li.textContent = `${expense.description} - Rs.${expense.amount.toFixed(2)} (${expense.date}) [${expense.category}]`;
        expensesList.appendChild(li);
    }

    // Update pie chart for expenses
    function updatePieChart(category, amount) {
        if (!expenseData[category]) {
            expenseData[category] = 0;
        }
        expenseData[category] += amount;

        pieChart.data.labels = Object.keys(expenseData);
        pieChart.data.datasets[0].data = Object.values(expenseData);
        pieChart.update();

        // Show budget alert if exceeded
        if (budgets[category] && expenseData[category] > budgets[category]) {
            alert(`Warning: You have exceeded your budget for ${category}`);
        }
    }

    // Initialize pie chart
    const pieChart = new Chart(expensePieChart, {
        type: 'pie',
        data: {
            labels: Object.keys(expenseData),
            datasets: [{
                data: Object.values(expenseData),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
            }]
        },
        options: {
            responsive: true,
        }
    });

    // Add recurring expense
    recurringForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('recurringDescription').value;
        const amount = parseFloat(document.getElementById('recurringAmount').value);
        const startDate = document.getElementById('recurringStartDate').value;
        const frequency = document.getElementById('recurringFrequency').value;
        const duration = parseInt(document.getElementById('recurringDuration').value);

        const recurringExpense = { description, amount, startDate, frequency, duration };
        recurringExpenses.push(recurringExpense);
        addRecurringToList(recurringExpense);
        recurringForm.reset();
        updateLocalStorage();
    });

    // Add recurring expense to list
    function addRecurringToList(expense) {
        const li = document.createElement('li');
        li.textContent = `${expense.description} - Rs.${expense.amount.toFixed(2)} (Start: ${expense.startDate}, Frequency: ${expense.frequency}, Duration: ${expense.duration} days)`;
        recurringList.appendChild(li);
    }

    // Render recurring expenses on page load
    recurringExpenses.forEach(addRecurringToList);

    // Automatically add recurring expenses
    setInterval(() => {
        const today = new Date().toISOString().slice(0, 10);
        recurringExpenses.forEach(exp => {
            if (shouldAddRecurring(exp, today)) {
                addExpenseToList({ description: exp.description, amount: exp.amount, date: today, category: 'Recurring' });
            }
        });
    }, 24 * 60 * 60 * 1000); // Check daily

    // Check if a recurring expense should be added
    function shouldAddRecurring(exp, today) {
        const startDate = new Date(exp.startDate);
        const currentDate = new Date(today);
        const diffInDays = (currentDate - startDate) / (1000 * 3600 * 24);
        
        if (exp.frequency === 'daily' && diffInDays % 1 === 0 && diffInDays < exp.duration) return true;
        if (exp.frequency === 'weekly' && diffInDays % 7 === 0 && diffInDays < exp.duration) return true;
        if (exp.frequency === 'monthly' && diffInDays % 30 === 0 && diffInDays < exp.duration) return true;
        
        return false;
    }

    // Generate expense report
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });

        generateReport(filteredExpenses);
    });

    // Display generated report
    function generateReport(filteredExpenses) {
        reportList.innerHTML = '';
        filteredExpenses.forEach(exp => {
            const li = document.createElement('li');
            li.textContent = `${exp.description} - Rs.${exp.amount.toFixed(2)} (${exp.date}) [${exp.category}]`;
            reportList.appendChild(li);
        });
    }

    // Export expenses to CSV
    document.getElementById('exportCSV').addEventListener('click', () => {
        const csvData = ["Description,Amount,Date,Category"];
        expenses.forEach(exp => {
            csvData.push(`${exp.description},${exp.amount},${exp.date},${exp.category}`);
        });
        downloadCSV(csvData.join("\n"), 'expenses.csv');
    });

    // Download CSV function
    function downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Import expenses from CSV
    document.getElementById('importCSV').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csv = e.target.result;
                const rows = csv.split("\n").slice(1); // Skip header row
                rows.forEach(row => {
                    const [description, amount, date, category] = row.split(',');
                    const expense = { description, amount: parseFloat(amount), date, category };
                    expenses.push(expense);
                    addExpenseToList(expense);
                });
                localStorage.setItem('expenses', JSON.stringify(expenses));
            };
            reader.readAsText(file);
        }
    });

    // Initial rendering of expenses, categories, and budgets
    expenses.forEach(addExpenseToList);
    renderCategories();
    renderBudgets();
});
