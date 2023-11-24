const mongoose = require("mongoose");
const UserSubscription = require("../models/user_subscription.model");
const UserCredit = require('../models/user_credit.model');
const Package = require("../models/package.model");
const PackageType = require("../models/package_type.model");
const path = require("path");
const fs = require("fs");
const { generateInvoicePdf } = require('../utils/pdf-generator');
const moment = require('moment-timezone');
const nodemailer = require("nodemailer");

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
            
            if(packageName == "PAY AS YOU GO"){
                let packageAmount = packageData?.payAsYou_detail?.amount;
                let gstAmount = packageAmount * (18/100);
                req.body.total_amount = (packageAmount * req.body.quantity + gstAmount).toFixed(2) ;

            }else if(packageName == "BUSINESS"){
                let packageAmount = packageData?.business_detail?.amount;
                let gstAmount = packageAmount * (18/100);
                req.body.total_amount = (packageAmount + gstAmount).toFixed(2) ;
               
            }else if(packageName == "SCALE"){
                if(packageData?.scale_detail[0].type == "monthly"){
                    let packageAmount = packageData?.scale_detail[0]?.amount;
                    let gstAmount = packageAmount * (18/100);
                    req.body.total_amount = (packageAmount + gstAmount).toFixed(2) ;
                }else if(packageData?.scale_detail[1]?.type == "quaterly"){
                    let packageAmount = packageData?.scale_detail[1]?.amount;
                    let gstAmount = packageAmount * (18/100);
                    req.body.total_amount = (packageAmount + gstAmount).toFixed(2) ;
                }
            }

             const subscription_data = new UserSubscription(req.body)
             const result = await subscription_data.save();

             //console.log({result});

             let subscriptionData = await UserSubscription.findOne({_id:result?._id}).populate([
                 {
                     path:"package",
                     select:"",
                     populate:{
                        path:"package_type",
                        select:"name"
                     }
                 },
                 {
                    path:"employer",
                    select:""
                }
             ]);

               //console.log({subscriptionData})


             let employerData;
             let packageDet;
             let purchaseData;
             if(packageName == "PAY AS YOU GO"){
                employerData = subscriptionData?.employer;
                packageDet = subscriptionData?.package;
                purchaseData = (subscriptionData?.package?.payAsYou_detail?.job_credit) * (subscriptionData?.quantity);
                console.log({purchaseData})
             }else if(packageName == "BUSINESS"){
                employerData = subscriptionData?.employer;
                packageDet = subscriptionData?.package;
                purchaseData = subscriptionData?.package?.business_detail?.job_credit

             }else if(packageName == "SCALE"){
                if(packageData?.scale_detail[0].type == "monthly"){
                    employerData = subscriptionData?.employer;
                    packageDet = subscriptionData?.package;
                    purchaseData = subscriptionData?.package?.scale_detail[0]?.job_credit
                    
                }else if(packageData?.scale_detail[1]?.type == "quaterly"){
                    employerData = subscriptionData?.employer;
                    packageDet = subscriptionData?.package;
                    purchaseData = subscriptionData?.package?.scale_detail[1]?.job_credit
                   
                }

             };

             const creditUser = await UserCredit.findOne({employer:employerData});
             console.log({creditUser});
             let creditData
             if(creditUser){
                creditData = await UserCredit.findOneAndUpdate({employer:employerData},{'$inc':{'purchased_count':purchaseData}},{new:true})
             }else{
                 const creditAmt = new UserCredit({employer:employerData,package:packageData,purchased_count:purchaseData});
                creditAdd = await creditAmt.save();
            }



           //  console.log({subscriptionData})

             let empEmail = subscriptionData?.employer?.email;

             let empPhoneNo = subscriptionData?.employer?.mobile;


             let packageList = await Package.findOne({_id:subscriptionData?.package});

             let packageTypeData = await PackageType.findOne({_id:subscriptionData?.package?.package_type});

             let packaeName = packageTypeData?.name

            // console.log({packaeName});
            
             let amount;
             if(packaeName == "PAY AS YOU GO"){
                amount = (packageList?.payAsYou_detail?.amount) * subscriptionData?.quantity
             }else if(packaeName == "BUSINESS"){
                amount = (packageList?.business_detail?.amount)
             }else if(packaeName == "SCALE"){
                amount = (packageList?.scale_detail?.amount)
             }
            // console.log({amount})



            const invoiceNo =  "INV" + Math.floor(Math.random() * 90000) + 10000;
            const subDate = moment(subscriptionData?.createdAt).format("DD/MM/YYYY");
            const totalAmount = subscriptionData?.total_amount;
           // console.log({totalAmount})
            

            const fileName = Date.now()+ '.pdf'
            const filePath = path.join(__dirname, `../uploads/invoices/${fileName}`);

           // console.log({filePath});
        
            const invoiceDetails = { invoiceNo, subDate, packaeName, totalAmount, amount, empEmail, empPhoneNo};
            generateInvoicePdf(invoiceDetails, filePath);

            var transport = nodemailer.createTransport({
                host: "hire2inspire.com",
                port: 465,
                auth: {
                  user: "info@hire2inspire.com",
                  pass: "h2I@2023"
                }
              });

            var mailOptions = {
                from: 'info@hire2inspire.com',
                to: empEmail,
                subject: `Package purchase successfully`,
                html: `
                <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Purchase of "Pay As You Go" Package</title>
                </head>
                    <body>
                        <p><strong>Subject:</strong> Purchase of "Pay As You Go" Package for Hiri2Inspire - INR 499</p>

                        <p>Dear [Purchasing Team's Name],</p>

                        <p>I hope this message finds you well. I am writing on behalf of Hiri2Inspire to request the purchase of the "Pay As You Go" package, priced at INR 499. We believe that this package will greatly benefit our organization and help us achieve our goals more efficiently.</p>

                        <p>The "Pay As You Go" package offers several key advantages for our team, including:</p>

                        <ol>
                            <li><strong>Cost-Effective:</strong> With this package, we only pay for the services we use, which aligns well with our budgetary considerations.</li>
                            <li><strong>Flexibility:</strong> It provides us with the flexibility to scale our usage up or down based on our evolving needs, ensuring that we always have access to the resources required for our projects.</li>
                            <li><strong>Easy Management:</strong> The package comes with a user-friendly management interface that will allow us to monitor our usage, track expenses, and make adjustments as needed.</li>
                            <li><strong>Support:</strong> We also appreciate the support and assistance that comes with this package, ensuring that we have access to help whenever necessary.</li>
                        </ol>

                        <p>We have thoroughly reviewed the package details and believe that it is the ideal solution for our organization's current requirements. To proceed with the purchase, we kindly request that you initiate the process as soon as possible.</p>

                        <p>Please let us know if there are any specific procedures or paperwork that we need to complete on our end to facilitate this purchase. If you require any additional information or have any questions, please feel free to reach out to us at [Your Contact Information].</p>

                        <p>We are excited about the possibilities that the "Pay As You Go" package offers, and we look forward to working with your team to finalize this purchase.</p>

                        <p>Thank you for your prompt attention to this matter.</p>

                        <p>Warm regards,</p>

                        <p>[Your Name]<br>
                        [Your Title]<br>
                        Hiri2Inspire<br>
                        [Your Contact Information]</p>
                    </body>
                `,
                attachments: [
                    { 
                        filename: fileName,
                        content: fs.createReadStream(filePath)
                    }
                ]
            };
              
            transport.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });
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