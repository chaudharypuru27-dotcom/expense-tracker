const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/expenseTracker")
    .then(() => {
        console.log("MongoDB connected successfully ✅");
    })
    .catch((error) => {
        console.log("MongoDB connection failed ❌");
        console.log(error);
    });


// Transaction Schema
const transactionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },
    date: {
    type: Date,
    required: true
},

    type: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    }
});


// Transaction Model
const Transaction = mongoose.model(
    "Transaction",
    transactionSchema
);


// Test Route
app.get("/", (req, res) => {
    res.send("Expense Tracker Backend is Running 🚀");
});


// Get Transactions
app.get("/api/transactions", async (req, res) => {

    try {

        const transactions = await Transaction.find();

        res.json(transactions);

    } catch (error) {

        res.status(500).json({
            message: "Could not fetch transactions"
        });

    }

});


// Add Transaction
app.post("/api/transactions", async (req, res) => {

    try {

        const { title, amount, date, type, category } = req.body;

        if (!title || !amount || !date || !type || !category) {

            return res.status(400).json({
                message: "Please fill all fields"
            });

        }
        const transaction = new Transaction({
    title,
    amount: Number(amount),
    date,
    type,
    category
});

        const savedTransaction = await transaction.save();

        res.status(201).json(savedTransaction);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not add transaction"
        });

    }

});

// Update Transaction
app.put("/api/transactions/:id", async (req, res) => {

    try {

        const { title, amount, type, category } = req.body;

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            {
                title,
                amount: Number(amount),
                type,
                category
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTransaction) {

            return res.status(404).json({
                message: "Transaction not found"
            });

        }

        res.json(updatedTransaction);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not update transaction"
        });

    }

});
// Delete Transaction
app.delete("/api/transactions/:id", async (req, res) => {

    try {

        await Transaction.findByIdAndDelete(req.params.id);

        res.json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Could not delete transaction"
        });

    }

});


// Start Server
const PORT = 5000;

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});