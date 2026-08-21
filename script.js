const expenseForm = document.getElementById("expenseForm");
const transactionList = document.getElementById("transactionList");

const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const balanceDisplay = document.getElementById("balance");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");

const API_URL = "http://localhost:5000/api/transactions";

let allTransactions = [];


// ======================================
// LOAD TRANSACTIONS
// ======================================

async function loadTransactions() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not fetch transactions");
        }

        allTransactions = await response.json();

        applyFilters();

    } catch (error) {

        console.error(error);

        transactionList.innerHTML = `
            <p class="empty">
                Backend server is not connected.
            </p>
        `;
    }
}


// ======================================
// ADD TRANSACTION
// ======================================

expenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value;
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;

     if (!title || !amount || !date || !type || !category) {

        alert("Please fill all fields.");

        return;
    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
    title,
    amount,
    date,
    type,
    category
})

        });

        if (!response.ok) {
            throw new Error("Could not add transaction");
        }

        expenseForm.reset();

        await loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Could not add transaction.");

    }

});


// ======================================
// DISPLAY TRANSACTIONS
// ======================================

function displayTransactions(transactions) {

    transactionList.innerHTML = "";

    if (transactions.length === 0) {

        transactionList.innerHTML = `
            <p class="empty">
                No transactions found.
            </p>
        `;

        updateSummary(transactions);
        updateExpenseChart(allTransactions);

        return;
    }


    transactions.forEach(function (transaction) {

        const transactionDiv = document.createElement("div");

        transactionDiv.classList.add("transaction-item");

        transactionDiv.innerHTML = `

            <div>

                <h3>${transaction.title}</h3>

                <p>${transaction.category}</p>

                <p>${transaction.date ? new Date(transaction.date).toLocaleDateString("en-IN") : "No date"}</p>

            </div>

            <div>

                <strong class="${transaction.type}">

                    ${transaction.type === "income" ? "+" : "-"}₹${transaction.amount}

                </strong>


                <div class="transaction-actions">

                    <button
                        class="edit-btn"
                        onclick="editTransaction('${transaction._id}')">

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteTransaction('${transaction._id}')">

                        Delete

                    </button>

                </div>

            </div>

        `;

        transactionList.appendChild(transactionDiv);

    });


    updateSummary(transactions);

}


// ======================================
// EDIT TRANSACTION
// ======================================

async function editTransaction(id) {

    const title = prompt("Enter new title:");

    if (title === null || title.trim() === "") {
        return;
    }


    const amount = prompt("Enter new amount:");

    if (amount === null || Number(amount) <= 0) {
        return;
    }


    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
    title,
    amount,
    date,
    type,
    category
})

        });


        if (!response.ok) {
            throw new Error("Could not update transaction");
        }


        await loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Could not edit transaction.");

    }

}


// ======================================
// DELETE TRANSACTION
// ======================================

async function deleteTransaction(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "DELETE"

        });


        if (!response.ok) {
            throw new Error("Could not delete transaction");
        }


        await loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Could not delete transaction.");

    }

}


// ======================================
// SEARCH + CATEGORY FILTER
// ======================================

function applyFilters() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedCategory =
        filterCategory.value;


    const filteredTransactions =
        allTransactions.filter(function (transaction) {

            const matchesSearch =
                transaction.title
                    .toLowerCase()
                    .includes(searchText);


            const matchesCategory =
                selectedCategory === "all" ||
                transaction.category === selectedCategory;


            return matchesSearch && matchesCategory;

        });


    displayTransactions(filteredTransactions);

}


// Search listener
searchInput.addEventListener("input", applyFilters);


// Category listener
filterCategory.addEventListener("change", applyFilters);


// ======================================
// SUMMARY
// ======================================

function updateSummary(transactions) {

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {

            totalIncome += Number(transaction.amount);

        }


        if (transaction.type === "expense") {

            totalExpense += Number(transaction.amount);

        }

    });


    const balance =
        totalIncome - totalExpense;


    incomeDisplay.textContent =
        `₹${totalIncome}`;


    expenseDisplay.textContent =
        `₹${totalExpense}`;


    balanceDisplay.textContent =
        `₹${balance}`;

}


// ======================================
// START
// ======================================

loadTransactions();
// ======================================
// EXPENSE CHART
// ======================================

let expenseChart;

function updateExpenseChart(transactions) {

    const categoryTotals = {};

    transactions.forEach(function (transaction) {

        if (transaction.type === "expense") {

            const category = transaction.category;

            categoryTotals[category] =
                (categoryTotals[category] || 0) +
                Number(transaction.amount);
        }
    });


    const categories = Object.keys(categoryTotals);

    const amounts = Object.values(categoryTotals);


    const canvas = document.getElementById("expenseChart");

    if (!canvas) return;


    if (expenseChart) {
        expenseChart.destroy();
    }


    expenseChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: categories,

            datasets: [{
                label: "Expenses",
                data: amounts
            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: "bottom"
                }

            }

        }

    });

}