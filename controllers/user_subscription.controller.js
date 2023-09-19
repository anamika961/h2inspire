const mongoose = require("mongoose");
const UserSubscription = require("../models/user_subscription.model");
const Package = require("../models/package.model");
const PackageType = require("../models/package_type.model");
const path = require("path");
const fs = require("fs");
const { generateInvoicePdf } = require('../utils/pdf-generator');

module.exports = {
    listbyId: async (req, res, next) => {
        try {
            const subscription_data = await UserSubscription.find({employer: req.params.id}).populate([
                {
                    path:"employer",
                    select:""
                },
                {
                    path:"package",
                    select:""
                }
            ]);
    
            return res.status(200).send({
                error: false,
                message: "List of all user subscription",
                data: subscription_data
            })
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            let packageId = req.body.package;
            // console.log({packageId})
            let packageData = await Package.findOne({_id:packageId});
            let packageTypeId = packageData?.package_type;

            let packageNameData = await PackageType.findOne({_id:packageTypeId});
            let packageName = packageNameData?.name
            console.log({packageName});
            // let subscription_data;
            // let result
            if(packageName == "PAY AS YOU GO"){
                let packageAmount = packageData?.payAsYou_detail?.amount;
                let gstAmount = packageAmount * (18/100);
                req.body.total_amount = (packageAmount * req.body.quantity + gstAmount).toFixed(2) ;

                // console.log({packageAmount});
                // console.log({total_amount})
                // subscription_data = new UserSubscription(req.body)
                // result = await subscription_data.save();

            }else if(packageName == "BUSINESS"){
                let packageAmount = packageData?.business_detail?.amount;
                let gstAmount = packageAmount * (18/100);
                req.body.total_amount = (packageAmount + gstAmount).toFixed(2) ;
                // subscription_data = new UserSubscription(req.body)
                // result = await subscription_data.save();
            }else if(packageName == "SCALE"){
                // let packageType
                if(packageData?.scale_detail[0].type == "monthly"){
                    let packageAmount = packageData?.scale_detail[0]?.amount;
                    let gstAmount = packageAmount * (18/100);
                    req.body.total_amount = (packageAmount + gstAmount).toFixed(2) ;
                    // subscription_data = new UserSubscription(req.body)
                    // result = await subscription_data.save();
                }else if(packageData?.scale_detail[1]?.type == "quaterly"){
                    let packageAmount = packageData?.scale_detail[1]?.amount;
                    let gstAmount = packageAmount * (18/100);
                    req.body.total_amount = (packageAmount + gstAmount).toFixed(2) ;
                    // subscription_data = new UserSubscription(req.body)
                    // result = await subscription_data.save();
                }
            }

             const subscription_data = new UserSubscription(req.body)
             const result = await subscription_data.save();

             const fileName = Date.now()+ '.pdf'
          //  const filePath = path.join(__dirname, `../../uploads/invoices/${fileName}`);
            const filePath = path.join(__dirname, `../uploads/invoices/${fileName}`);
        
            // orderPrice = Number(orderPrice).toFixed(2)
            const invoiceDetails = { amount:"20" };
            generateInvoicePdf(invoiceDetails, filePath);
            return res.status(200).send({
                error: false,
                message: "User subscribed successfully",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    update: async (req, res, next) => {
        try {
            const result = await UserSubscription.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "User subscription not updated" })

            return res.status(200).send({
                error: false,
                message: "User subscription updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    statusupdate: async (req, res, next) => {
        try {
            const result = await UserSubscription.findOneAndUpdate({_id: req.params.id}, {status:req.body.status}, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "User subscription status not updated" })

            return res.status(200).send({
                error: false,
                message: "User subscription status updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    detail: async (req, res, next) => {
        try {
            const result = await UserSubscription.findOne({_id: req.params.id});
    
            return res.status(200).send({
                error: false,
                message: "Detail of User Subscription",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },
}