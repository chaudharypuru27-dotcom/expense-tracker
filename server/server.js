require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// FRONTEND FILES
// ===============================

app.use(express.static(path.join(__dirname, "..")));


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully ✅");
    })
    .catch((error) => {
        console.log("MongoDB connection failed ❌");
        console.log(error);
    });


// ===============================
// TRANSACTION SCHEMA
// ===============================

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


// ===============================
// TRANSACTION MODEL
// ===============================

const Transaction = mongoose.model(
    "Transaction",
    transactionSchema
);


// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "..", "index.html")
    );

});
app.get("/index.html", (req, res) => {

    res.sendFile(
        path.join(__dirname, "..", "index.html")
    );

});


// ===============================
// GET TRANSACTIONS
// ===============================

app.get("/api/transactions", async (req, res) => {

    try {

        const transactions = await Transaction.find()
            .sort({ date: -1 });

        res.json(transactions);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not fetch transactions"
        });

    }

});


// ===============================
// ADD TRANSACTION
// ===============================

app.post("/api/transactions", async (req, res) => {

    try {

        const {
            title,
            amount,
            date,
            type,
            category
        } = req.body;


        if (
            !title ||
            !amount ||
            !date ||
            !type ||
            !category
        ) {

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


        const savedTransaction =
            await transaction.save();


        res.status(201).json(savedTransaction);


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not add transaction"
        });

    }

});


// ===============================
// UPDATE TRANSACTION
// ===============================

app.put("/api/transactions/:id", async (req, res) => {

    try {

        const {
            title,
            amount,
            type,
            category
        } = req.body;


        const updatedTransaction =
            await Transaction.findByIdAndUpdate(

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


// ===============================
// DELETE TRANSACTION
// ===============================

app.delete("/api/transactions/:id", async (req, res) => {

    try {

        const deletedTransaction =
            await Transaction.findByIdAndDelete(
                req.params.id
            );


        if (!deletedTransaction) {

            return res.status(404).json({
                message: "Transaction not found"
            });

        }


        res.json({
            message: "Transaction deleted successfully"
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not delete transaction"
        });

    }

});


// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});