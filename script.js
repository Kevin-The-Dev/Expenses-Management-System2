document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expenseForm');
    const expensesList = document.getElementById('expenses');
    const expensePieChart = document.getElementById('expensePieChart').getContext('2d');
    let expenseData = {};

    const pieChart = new Chart(expensePieChart, {
        type: 'pie',
        data: {
            labels: Object.keys(expenseData),
            datasets: [{
                data: Object.values(expenseData),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const label = tooltipItem.label || '';
                            const value = tooltipItem.raw || 0;
                            return `${label}: Rs.${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });

    expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;
        const category = document.getElementById('category').value;

        if (description && amount && date) {
            const expense = {
                description,
                amount,
                date,
                category
            };
            addExpenseToList(expense);
            updatePieChart(category, amount);
            expenseForm.reset();
        }
    });

    function addExpenseToList(expense) {
        const li = document.createElement('li');
        li.textContent = `${expense.description} - Rs.${expense.amount.toFixed(2)} (${expense.date}) [${expense.category}]`;
        expensesList.appendChild(li);
    }

    function updatePieChart(category, amount) {
        if (!expenseData[category]) {
            expenseData[category] = 0;
        }
        expenseData[category] += amount;
        
        pieChart.data.labels = Object.keys(expenseData);
        pieChart.data.datasets[0].data = Object.values(expenseData);
        pieChart.update();
    }
});
