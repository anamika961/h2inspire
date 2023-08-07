const mongoose = require("mongoose");
const Transaction = require("../models/transaction.model");

module.exports = {
    list: async (req, res, next) => {
        try {
            const transaction_data = await Transaction.find({});
    
            return res.status(200).send({
                error: false,
                message: "Transaction list",
                data: transaction_data
            })
        } catch (error) {
            next(error);
        }
    },

}