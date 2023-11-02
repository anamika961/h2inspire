const mongoose = require("mongoose");
const Transaction = require("../models/transaction.model");
const AgencyTransaction = require('../models/agency_transaction.model');
const Agency = require('../models/agency.model');
const { getUserViaToken, verifyAccessToken } = require("../helpers/jwt_helper");

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
                        select:"name corporate_email gst",
                    }
                },
                {
                    path:"passbook_amt.billing_id",
                    select:" ",
                    populate:{
                      path:"hire_id",
                      select:" "
                    }
                  }
            ]);


            const agency_transaction_data = await AgencyTransaction.find({}).populate([
                {
                    path:"agency",
                    select:"name"
                },
                {
                    path:"passbook_amt.candidate",
                    select:"fname lname",
                    populate:{
                        path:"agency",
                        select:"name corporate_email gst agency_account_info",
                        populate:{
                            path:"AgencyUserAccountInfo",
                            select:"first_name last_name personal_phone agency_location"
                        }
                    }
                },
                {
                    path:"passbook_amt.billing_id",
                    select:" ",
                    populate:{
                      path:"hire_id",
                      select:" "
                    }
                  },
                  {
                    path:"passbook_amt.employer",
                    select:"fname lname email mobile",
                  }
            ]);


            return res.status(200).send({
                error: false,
                message: "Transaction list",
                data: transaction_data,
                agency_transaction_data
                
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

    // list: async (req, res, next) => {
    //     try {
    //         const transaction_data = await Transaction.aggregate([
    //             { $sort: { _id: -1 } },])
    //         // ]).populate([
    //         //     {
    //         //         path:"employer",
    //         //         select:"fname lname"
    //         //     },
    //         //     {
    //         //         path:"passbook_amt.candidate",
    //         //         select:"fname lname agency",
    //         //         populate:{
    //         //             path:"agency",
    //         //             select:"name corporate_email",
    //         //         }
    //         //     },
    //         //     {
    //         //         path:"passbook_amt.billing_id",
    //         //         select:" ",
    //         //         populate:{
    //         //           path:"hire_id",
    //         //           select:" "
    //         //         }
    //         //       }
    //         // ]);

    //        // console.log("sorted data",transaction_data)


    //         const agency_transaction_data = await AgencyTransaction.find({}).populate([
    //             {
    //                 path:"agency",
    //                 select:"name"
    //             },
    //             {
    //                 path:"passbook_amt.candidate",
    //                 select:"fname lname",
    //                 populate:{
    //                     path:"agency",
    //                     select:"name corporate_email agency_account_info",
    //                     populate:{
    //                         path:"AgencyUserAccountInfo",
    //                         select:"first_name last_name personal_phone agency_location"
    //                     }
    //                 }
    //             },
    //             {
    //                 path:"passbook_amt.billing_id",
    //                 select:" ",
    //                 populate:{
    //                   path:"hire_id",
    //                   select:" "
    //                 }
    //               }
    //         ]);


    //         return res.status(200).send({
    //             error: false,
    //             message: "Transaction list",
    //             data: transaction_data,
    //             agency_transaction_data
                
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // },


    agencylist: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkAgency = await Agency.findOne({_id: userId})
            if(!checkAgency && dataModel != "admins") return res.status(401).send({ error: true, message: "User unauthorized." })
            const agency_transaction_data = await AgencyTransaction.findOne({agency:userId}).populate([
                {
                    path:"agency",
                    select:"name"
                },
                {
                    path:"passbook_amt.candidate",
                    select:"fname lname",
                    populate:{
                        path:"agency",
                        select:"name corporate_email gst agency_account_info",
                        populate:{
                            path:"AgencyUserAccountInfo",
                            select:"first_name last_name personal_phone agency_location"
                        }
                    }
                },
                {
                    path:"passbook_amt.billing_id",
                    select:" ",
                    populate:{
                      path:"hire_id",
                      select:" ",
                      populate:{
                          path:"job",
                          select:"job_id job_name"
                      }
                    }
                  },
                  {
                    path:"passbook_amt.employer",
                    select:"fname lname email mobile",
                  }
            ]);

           // console.log({agency_transaction_data})


            return res.status(200).send({
                error: false,
                message: "Transaction list",
                data:  agency_transaction_data
                
            })
        } catch (error) {
            next(error);
        }
    }, 
       

}