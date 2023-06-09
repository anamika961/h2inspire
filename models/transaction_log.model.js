const mongoose = require("mongoose");

const TransactionLogSchema = mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employers"
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    }
}, {timestamps: true});

module.exports = mongoose.model("transaction_logs", TransactionLogSchema);