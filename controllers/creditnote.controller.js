const mongoose = require("mongoose");
const CreditNote = require("../models/creditnote.model");
//const HiringDetails = require("../models/hiringDetails.model");
const Billing = require('../models/billing.model')

module.exports = { 
    create: async (req, res, next) => {
        try {
            const billingId = req.body.billingId;
            const billingData = await Billing.findOne({_id:billingId}).populate([
                {
                    path:"hire_id",
                    select:""
                }
            ]);
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
           console.log({CreditNote})
    
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
            const creditNoteList = await CreditNote.find({}).populate([
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