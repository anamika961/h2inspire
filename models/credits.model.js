const mongoose = require("mongoose");

const CreditSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    job_post_count: {
        type: Number,
        required: true
    },
}, {timestamps: true});

module.exports = mongoose.model("credits", CreditSchema);