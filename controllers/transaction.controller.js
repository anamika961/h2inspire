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

    update: async (req, res, next) => {
        try {
            let transactionId = req.query.transactionId;
            let invoice_file = req.body.invoice_file
            
            let emp_id = req.params.id;

            console.log(invoice_file,"msg")
           
            const getEmpData  = await Transaction.find({employer:req.params.id})



            function addInvoiceKey(transactions, targetTransactionId, invoiceValue) {
               
                for (let i = 0; i < transactions.length; i++) {
                  if (transactions[i].transaction_id == targetTransactionId) {
                      
                    transactions[i]["invoice_file"] = invoiceValue;
                    
                  }
                }
               return transactions;
               
            //    console.log(transactions,'transactions')
              }
             
              const updatedData = addInvoiceKey(getEmpData[0].passbook_amt, transactionId
              , invoice_file);
            //   console.log(req.body,"msg")
               console.log(updatedData);

               const result = await Transaction.findOneAndUpdate({employer: req.params.id},{passbook_amt:updatedData}, {new: true});

               console.log("result>>>>",result)
            
            return res.status(200).send({
                error: false,
                message: "Invoice uploaded",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },
       

}