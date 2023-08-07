const mongoose = require("mongoose");
const Transaction = require("../models/transaction.model");

module.exports = {
    list: async (req, res, next) => {
        try {
            const transaction_data = await Transaction.find({}).populate([
                {
                    path:"employer",
                    select:"fname lname"
                },
                {
                    path:"passbook_amt.candidate",
                    select:"fname lname agency",
                    populate:{
                        path:"agency",
                        select:"first_name last_name"
                    }
                }
            ]);
    
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