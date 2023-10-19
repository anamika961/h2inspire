const mongoose = require("mongoose");
const CreditNote = require("../models/creditnote.model");
const { getUserViaToken, verifyAccessToken } = require("../helpers/jwt_helper");
const Employer = require('../models/employer.model')
const Agency = require('../models/agency.model')
const Billing = require('../models/billing.model')
const Transaction = require("../models/transaction.model");

module.exports = { 
    create: async (req, res, next) => {
        try {
            const billingId = req.body.billingId;
            const billingData = await Billing.findOne({_id:billingId}).populate([
                {
                    path:"hire_id",
                    select:"",
                    populate:{
                        path:"candidate",
                        select:"",
                        populate:{
                            path:"agency",
                            select:""
                        }
                    },
                }
            ]);

            console.log("billingData",billingData)
            const generateNextInvoice = (prevInv) => {
    
                if(prevInv == undefined){
                  console.log('here')
                  return `H2I/CN/23-24-01`
                }else{
                  const [, yearPart, numberPart] = prevInv.match(/(\d{2}-\d{2})-(\d{2})/);
                  let newNumberPart = (parseInt(numberPart, 10) + 1).toString().padStart(2, '0')
                  const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
                  let currentYear = new Date().getFullYear() % 100;
                  let currentYearNext  = currentYear+1;
                  if(currentMonth > 3 && currentYear != 23){
                    if(currentYear != yearPart.split('-')[0]){
                      return `H2I/${currentYear}-${currentYearNext}-01`  
                    }else{
                      return `H2I/${currentYear}-${currentYearNext}-${(parseInt(numberPart, 10) + 1).toString().padStart(2, '0')}`  
                    }
                    
                  }
                  
                  else{
                    return `H2I/CN/${currentYear}-${currentYearNext}-${newNumberPart}`
                  }
                  
                }
            }

            let creditNotelist = await CreditNote.find({});

            let prevInv  = (creditNotelist?.length-1)?.credit_inv_no;
            
      
            req.body.credit_inv_no = generateNextInvoice(prevInv);
            req.body.employer = billingData?.employer;
            req.body.agency = billingData?.hire_id?.candidate?.agency?._id;
            const billingamount =(billingData?.hire_id?.comp_offered);
            let amountData = billingamount * (8.83/100);
            let gstAmount;
            let cgstAmount;
            let sgstAmount;
            if(billingData?.supply_code == "29"){
                gstAmount = (amountData * (18/100));
                req.body.amount = (amountData + gstAmount)
            }else{
                cgstAmount = (amountData * (9/100));
                sgstAmount = (amountData * (9/100));
                req.body.amount = (amountData + cgstAmount + sgstAmount)
            }
            const creditNoteData = new CreditNote(req.body)
            const result = await creditNoteData.save();
           console.log({CreditNote});

        let transactionId = result?.transactionId;
         
         let empId = result?.employer;

        
         const getEmpData  = await Transaction.find({employer:empId})


         function addPaymentRes(transactions, targetTransactionId, status) {
            
             for (let i = 0; i < transactions.length; i++) {
               if (transactions[i].transaction_id == targetTransactionId) {
                   
                 transactions[i]["creditnote_status"] = status;
                 
               }
             }
            return transactions;
            
           }
          
           const updatedData = addPaymentRes(getEmpData[0].passbook_amt, transactionId
           , "true");

          
           const transactionData = await Transaction.findOneAndUpdate({employer:empId},{passbook_amt:updatedData}, {new: true});
    
            return res.status(200).send({
                error: false,
                message: "credit note generated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    list: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
            if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not found." })
            const creditNoteList = await CreditNote.find({employer:userId}).populate([
                {
                    path:"billingId",
                    select:"",
                    populate:{
                        path:"hire_id",
                        select:"",
                        populate:{
                            path:"candidate",
                            select:"",
                            populate:{
                                path:"agency",
                                select:""
                            }
                        },
                    },
                   
                }
            ]);
    
            return res.status(200).send({
                error: false,
                message: "Testimonial data",
                data: creditNoteList
            })
        } catch (error) {
            next(error);
        }
    },

    agencylist: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkAgency = await Agency.findOne({_id: userId})
            if(!checkAgency && dataModel != "employers") return res.status(400).send({ error: true, message: "Agency not found." })
            const creditNoteList = await CreditNote.find({agency:userId}).populate([
                {
                    path:"billingId",
                    select:"",
                    populate:{
                        path:"hire_id",
                        select:"",
                        populate:{
                            path:"candidate",
                            select:"",
                            populate:{
                                path:"agency",
                                select:""
                            }
                        },
                    },
                   
                }
            ]);
    
            return res.status(200).send({
                error: false,
                message: "Testimonial data",
                data: creditNoteList
            })
        } catch (error) {
            next(error);
        }
    },

}