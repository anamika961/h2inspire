const createError = require('http-errors')
const Employer = require('../models/employer.model')
const { employerLoginSchema, employerRegistrationAuthSchema, employerChangePasswordSchema } = require('../validators/validation_schema')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getUserViaToken,
} = require('../helpers/jwt_helper')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const Admin = require('../models/admin.model')
const UserCredit = require('../models/user_credit.model')
const Billing = require('../models/billing.model')
const Transaction = require('../models/transaction.model')
const AgencyTransaction = require('../models/agency_transaction.model')
const UserSubscription = require("../models/user_subscription.model");
const JobPosting = require("../models/job_posting.model");
//const UserCredit = require("../models/user_credit.model");
const HiringDetail = require('../models/hiringDetails.model');
const nodemailer = require("nodemailer");
const Token = require("../models/token.model");
var transport = nodemailer.createTransport({
  host: "hire2inspire.com",
  port: 465,
  auth: {
    user: "info@hire2inspire.com",
    pass: "h2I@2023"
  }
});

module.exports = {
  list: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAdmin = await Admin.findOne({_id: userId})
      if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "User unauthorized." })
      const employerData = await Employer.find({isDeleted: false}).sort({_id: -1})
      res.status(200).send({
        error: false,
        message: 'Employer list',
        data: employerData
      })
    } catch (error) {
      next(error)
    }
  },

  alllist: async (req, res, next) => {
    try {
      const employerData = await Employer.find({}).sort({_id: -1})
      res.status(200).send({
        error: false,
        message: 'Employer list',
        data: employerData
      })
    } catch (error) {
      next(error)
    }
  },

  detail: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAdmin = await Admin.findOne({_id: userId})
      if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "User unauthorized." })
      const employerData = await Employer.findOne({_id: req.params.id})
     // const billingData = await Billing.findOne({employer:req.params.id})

     const employerSubscriptionData = await UserSubscription.findOne({employer: req.params.id}).populate([
      {
          path:"employer",
          select:""
      },
      {
          path:"package",
          select:""
      }
  ]);
      res.status(200).send({
        error: false,
        message: 'Employer detail',
        data: employerData,
        employerSubscriptionData
       // billingData
      })
    } catch (error) {
      next(error)
    }
  },

  register: async (req, res, next) => {
    try {
      // const { email, password } = req.body
      // if (!email || !password) throw createError.BadRequest()
      const result = await employerRegistrationAuthSchema.validateAsync(req.body);

      console.log({result})

      const doesExist = await Employer.findOne({ email: result.email })
      if (doesExist)
        throw createError.Conflict(`${result.email} is already been registered`)

      const EmployerData = new Employer(result)
      const savedEmployer = await EmployerData.save()

      const empFname = savedEmployer?.fname;
      const empLname = savedEmployer?.lname;
      const empEmail = savedEmployer?.email;

      console.log({empEmail});
    
      const accessToken = await signAccessToken(savedEmployer.id, "employers")
      const refreshToken = await signRefreshToken(savedEmployer.id, "employers")

      const UserCreditData = await UserCredit.findOneAndUpdate({employer: savedEmployer._id}, {$inc: {free_count: 1}}, {upsert: true, new: true}).select("free_count purchased_count free_used_count purchased_used_count");


     
      const TokenData = new Token({user_id:savedEmployer?._id,user_type:"employers",token:crypto.randomBytes(32).toString("hex")});

      const tokenResult = await TokenData.save();


      const user_id = savedEmployer?._id;
      const token_id = tokenResult?.token;

      //console.log("tokenResult",tokenResult);
      var mailOptions = {
        from: 'info@hire2inspire.com',
        to: empEmail,
        subject: `Employer registered successfully`,
        html:`
        <head>
            <title>Welcome to Hire2Inspire</title>
        </head>
    <body>
        <p>Dear ${empFname} ${empLname},</p>
        <p>Thank you for choosing Hire2Inspire - the platform that connects talented job seekers with employers like you!</p>
        <p>If you have any questions or need assistance, feel free to contact our support team at [Support Email Address].</p>
        <p>We look forward to helping you find the perfect candidates for your job openings!</p>
        <p>Thank you and best regards,</p>
        <p> Hire2Inspire </p>
    </body>
`
}; 

      transport.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      const transactionData = new Transaction({employer:savedEmployer.id});
      const tranResult = await transactionData.save();

      var mailOptions = {
        from: 'info@hire2inspire.com',
        to: empEmail,
        subject: `Employer Email Verify`,
        html:`
        <head>
            <title>Welcome to Hire2Inspire</title>
        </head>
    <body>
        <p>Dear ${empFname} ${empLname},</p>
        <p>Thank you for signing up with Hire2Inspire. To complete the registration process and ensure the security of your account, we need to verify your email address.</p>
  
        <p>Please click on the following link to verify your email:</p>
        <a href="https://hire2inspire.com/verify/${user_id}/${token_id}">Click Here to Verify Email</a>

        <p>If the link above does not work, copy and paste the following URL into your browser's address bar:</p>
        <p>Note: This verification link is valid for the next 24 hours. After this period, you will need to request a new verification email.</p>

        <p>If you did not sign up for an account with Hire2Inspire, please ignore this email.</p>

        <p>Thank you for choosing Hire2Inspire. If you have any questions or need further assistance,
        <p>Thank you and best regards,</p>
        <p> Hire2Inspire </p>
    </body>
`
}; 

      transport.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });


      res.status(201).send({
        error: false,
        message: 'Employer created',
        data: {
          accessToken, 
          refreshToken
        },
        user: savedEmployer,
        credit: UserCreditData
      })
    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await employerLoginSchema.validateAsync(req.body)
      const employerData = await Employer.findOne({ email: result.email })
      if (!employerData) throw createError.NotFound('Employer not registered');

      if(employerData?.verified == false) throw createError.NotFound('Your Email is not yet verified');

      const isMatch = await employerData.isValidPassword(result.password)
      if (!isMatch)
        throw createError.BadRequest('Password not valid')

      const accessToken = await signAccessToken(employerData.id, "employers")
      const refreshToken = await signRefreshToken(employerData.id, "employers")

      employerData.password = undefined;
      employerData.confirm_password = undefined;
      employerData.otp = undefined;

      const UserCreditData = await UserCredit.findOne({employer: employerData._id}).select("free_count purchased_count free_used_count purchased_used_count")

      res.status(200).send({
        error: false,
        message: 'Employer logged in',
        data: {
          accessToken, 
          refreshToken
        },
        user: employerData,
        credit: UserCreditData
      })
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest('Invalid Email/Password'))
      next(error)
    }
  },

  profileDetail: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkEmployer = await Employer.findOne({_id: userId})
      if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not found." })

      const billingData = await Billing.find({employer:userId}).sort({_id:-1});

      const transactionData = await Transaction.findOne({employer:userId}).populate([
        {
          path:"passbook_amt.candidate",
          select:"fname lname agency",
          populate:{
            path:"agency",
            select:" "
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
              select:"job_name job_id"
            }
          }
        }
      ]);

      const employerSubscriptionData = await UserSubscription.find({employer: userId}).populate([
        {
            path:"employer",
            select:""
        },
        {
            path:"package",
            select:"",
            populate:{
              path:"package_type",
              select:"name"
            }
        }
    ]).sort({_id:-1});

    console.log("employerSubscriptionData",employerSubscriptionData);

    const employerCreditData = await UserCredit.findOne({employer: userId}).populate([
      {
          path:"employer",
          select:""
      },
      {
          path:"package",
          select:"",
          populate:{
            path:"package_type",
            select:"name"
          }
      }
  ]);


      res.status(200).send({
        error: false,
        message: 'Employer data',
        data: checkEmployer,
        billingData,
        transactionData,
        employerSubscriptionData,
        employerCreditData
      })
    } catch (error) {
      next(error)
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkEmployer = await Employer.findOne({_id: userId})
      if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not found." })

      const result = await Employer.findOneAndUpdate({
        _id: userId
      }, req.body, { new: true });
      message = {
        error: false,
        message: "Employer profile updated",
        data: result
      }
      return res.status(200).send(message);

    } catch (error) {
      next(error)
    }
  },

  changePassword: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      
      const checkEmployer = await Employer.findOne({_id: userId})
      // return res.status(200).send({userId, dataModel, checkEmployer})
      if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not authorized." })

      const result = await employerChangePasswordSchema.validateAsync(req.body)

      
      if (req.body.old_password && req.body.new_password) {
        if (req.body.old_password === req.body.new_password) {
            message = {
                error: true,
                message: "Old and new password can not be same"
            }
            return res.status(200).send(message);
        }
        
        passwordCheck = await bcrypt.compare(req.body.old_password, checkEmployer.password);
        if (passwordCheck) {
          const result = await Employer.findOneAndUpdate({
            _id: userId
          }, {
            password: req.body.new_password
          }, {new: true});
          message = {
            error: false,
            message: "Employer password changed!"
          }
        } else {
          message = {
            error: true,
            message: "Old password is not correct!"
          }
        }
        
      } else {
        message = {
          error: true,
          message: "Old password, new password are required!"
        }
      }
      return res.status(200).send(message);
    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  },

  forgetPassword: async (req, res, next) => {
    try {
      if(!req.body.email) return res.status(400).send({error: true, message: "Email required"});

      const EmployerData = await Employer.findOneAndUpdate({ email: req.body.email }, {otp: 1234});
      if(!EmployerData) return res.status(404).send({error: true, message: 'Employer not found'});

      return res.status(200).send({error: false, message: 'Otp sent successfully'});
    
    } catch (error) {
      next(error)
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      if(!req.body.email && !req.body.otp) return res.status(400).send({error: true, message: "Email and OTP required"});

      const EmployerData = await Employer.findOne({
        $and: [
          { email: req.body.email },
          { otp: req.body.otp }
        ]
      });
      if(!EmployerData) return res.status(404).send({error: true, message: 'Employer not found / OTP not correct'});

      return res.status(200).send({error: false, message: 'Otp verfied successfully'});
    
    } catch (error) {
      next(error)
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      if (req.body.new_password && req.body.confirm_password) {
        if (req.body.new_password !== req.body.confirm_password) {
            message = {
              error: true,
              message: "new and confirm password are not equal"
            }
            return res.status(400).send(message);
        }
        const EmployerData = await Employer.findOne({
          email: req.body.email
        });
       
        if (EmployerData === null) {
          message = {
            error: true,
            message: "Employer not found!"
          }
          return res.status(404).send(message);

        } else {
          const isMatch = await bcrypt.compare(req.body.new_password, EmployerData.password)
          // return res.send("isMatch")
          if (isMatch)
            throw createError[400]('You can not use your old password as new.')

          const result = await Employer.findOneAndUpdate({
            email: req.body.email
          }, {
            password: req.body.new_password
          });

          console.log("result",result);
          
          message = {
            error: false,
            message: "Employer password reset successfully!"
          }
          return res.status(200).send(message);
        }
    } else {
      message = {
        error: true,
        message: "new password, confirm password are required!"
      }
      return res.status(404).send(message);
    }
    
    } catch (error) {
      next(error)
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) throw createError.BadRequest()
      const userId = await verifyRefreshToken(refreshToken)

      const accessToken = await signAccessToken(userId, "employers")
      const refToken = await signRefreshToken(userId, "employers")
      res.send({ accessToken: accessToken, refreshToken: refToken })
    } catch (error) {
      next(error)
    }
  },
//////////////////////// billing //////////////////////
  billingAdd: async (req, res, next) => {
    try {
        const billingData = new Billing(req.body);
        result = await billingData.save();

        let billinglist = await Billing.findOne({_id:result?._id}).populate([
            {
              path:"hire_id",
              select:"",
              populate:{
                path:"candidate",
                select:"fname lname email agency",
                populate:{
                  path:"agency",
                  select:""
                }
              }
            }
        ]);

        console.log("billinglist",billinglist);


        let billingId = billinglist?._id
        let amount = (billinglist?.hire_id?.comp_offered) * (8.83/100);
        let agency_amount = (billinglist?.hire_id?.comp_offered) * (8.33/100);
        let h2i_amount = (billinglist?.hire_id?.comp_offered) * (0.5/100);
        let designation = billinglist?.hire_id?.desg_offered;
        let candidateData = billinglist?.hire_id?.candidate?._id;
        let tranId = Math.floor(Math.random() * 90000) + 10000;

        const generateNextInvoice = (prevInv,type) => {
    
          if(prevInv == undefined){
            console.log('here')
            return `H2I/${type}/23-24-01`
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
              return `H2I/${type}/${currentYear}-${currentYearNext}-${newNumberPart}`
            }
            
          }
      }
      

     let transactionlist = await Transaction.findOne({});
    
     let PrevInvoiceId  = transactionlist?.passbook_amt[transactionlist?.passbook_amt?.length -1]?.invoice_No
      console.log("transactionlist",transactionlist?.passbook_amt[transactionlist?.passbook_amt?.length -1]?.invoice_No);
      
      //let data2  = generateNextInvoice();
      let gstAmount;
      let cgstAmount;
      let sgstAmount;
      if(billinglist?.supply_code != "29"){
        gstAmount = (amount * (18/100));
        const transactionData = await Transaction.findOneAndUpdate(
          { employer: result?.employer },
          {
            '$inc': { 'total_amount': amount },
            '$push': {
              passbook_amt: {
                amount: amount + gstAmount ,
                "split_amount.agency_amount": agency_amount,
                "split_amount.h2i_amount":h2i_amount,
                type: "payble",
                billing_id: billingId,
                candidate: candidateData,
                desg: designation,
                transaction_id: tranId,
                invoice_file:"",
                invoice_No:generateNextInvoice(PrevInvoiceId,"EM"),
                gst_in:"09ABCCS9765L1ZH",
                hsn_code:"SAC 9983",
                gst_type:"IGST",
                igst:"18%",
                gst_cal_amount: gstAmount,
              },
            },
          },
          { new: true }
        );
      }else if(billinglist?.supply_code == "29"){
        cgstAmount = (amount * (9/100));
        sgstAmount = (amount * (9/100));
        const transactionData = await Transaction.findOneAndUpdate(
          { employer: result?.employer },
          {
            '$inc': { 'total_amount': amount },
            '$push': {
              passbook_amt: {
                amount: amount + cgstAmount + sgstAmount,
                "split_amount.agency_amount": agency_amount,
                "split_amount.h2i_amount":h2i_amount,
                type: "payble",
                billing_id: billingId,
                candidate: candidateData,
                desg: designation,
                transaction_id: tranId,
                invoice_file:"",
                invoice_No:generateNextInvoice(PrevInvoiceId,"EM"),
                gst_in:"09ABCCS9765L1ZH",
                hsn_code:"SAC 9983",
                gst_type:"CGST/SGST",
                cgst:"9%",
                sgst:"9%",
                cgst_cal_amount: cgstAmount,
                sgst_cal_amount: sgstAmount,
              },
            },
          },
          { new: true }
        );
      }
        
        
       //console.log("transactionData>>>",transactionData)

       let agencyId = billinglist?.hire_id?.candidate?.agency?._id;

       //console.log("agencyId",agencyId)
      
       let amountData = (billinglist?.hire_id?.comp_offered) * (8.33/100);
        let agency_amountData = (billinglist?.hire_id?.comp_offered) * (7.83/100);
        let h2i_amountData = (billinglist?.hire_id?.comp_offered) * (0.5/100);


        let gstAmountData;
        let cgstAmountData;
        let sgstAmountData;

        if(billinglist?.supply_code != "29"){
          gstAmountData = (agency_amountData * (18/100));
          const agencyTransactionData = await AgencyTransaction.findOneAndUpdate(
            { agency: agencyId },
            {
              '$inc': { 'total_amount': amountData },
              '$push': {
                passbook_amt: {
                  amount: amountData,
                  "split_amount.agency_amount": agency_amountData + gstAmountData,  // amount get agencys
                  "split_amount.h2i_amount":h2i_amountData,
                  type: "payble",
                  billing_id: billingId,
                  candidate: candidateData,
                  desg: designation,
                  transaction_id: tranId,
                  invoice_file:"",
                  invoice_No:generateNextInvoice(PrevInvoiceId,"AG"),
                  employer:result?.employer,
                  gst_in:"09ABCCS9765L1ZH",
                  hsn_code:"SAC 9983",
                  gst_type:"IGST",
                  igst:"18%",
                  gst_cal_amount: gstAmountData,
                },
              },
            },
            { new: true }
          );    
        }else if(billinglist?.supply_code == "29"){
          cgstAmountData = (agency_amountData * (9/100));
          sgstAmountData = (agency_amountData * (9/100));
          const agencyTransactionData = await AgencyTransaction.findOneAndUpdate(
            { agency: agencyId },
            {
              '$inc': { 'total_amount': amountData },
              '$push': {
                passbook_amt: {
                  amount: amountData,
                  "split_amount.agency_amount": agency_amountData + cgstAmountData + sgstAmountData,
                  "split_amount.h2i_amount":h2i_amountData,
                  type: "payble",
                  billing_id: billingId,
                  candidate: candidateData,
                  desg: designation,
                  transaction_id: tranId,
                  invoice_file:"",
                  invoice_No:generateNextInvoice(PrevInvoiceId,"AG"),
                  employer:result?.employer,
                  gst_in:"09ABCCS9765L1ZH",
                  hsn_code:"SAC 9983",
                  gst_type:"CGST/SGST",
                  cgst:"9%",
                  sgst:"9%",
                  cgst_cal_amount: cgstAmountData,
                  sgst_cal_amount:  sgstAmountData,
                },
              },
            },
            { new: true }
          );
    
        }
   

      message = {
        error: false,
        message: "Billing data added",
        data: result
      }
      return res.status(200).send(message);

    } catch (error) {
      next(error)
    }
  },


  dashboard: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkEmployer = await Employer.findOne({_id: userId})
      if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not found." })

      const empJobs = await JobPosting.find({employer: userId}).sort({_id: -1});

      let jobIds = empJobs.map(e => e._id.toString());
      
      let hiringData = await HiringDetail.find({job: {$in: jobIds}});


      return res.status(200).send({
        error: false,
        message: "Employer dashboard data.",
        data: empJobs,
        counts: {
          activeJobs: empJobs.filter(e => e.status == "1").length,
          closedJobs: empJobs.filter(e => e.status == "2").length,
          draftJobs:  empJobs.filter(e => e.status == "3").length,
          //offerJobs:  empJobs.filter(e => e.offer_count >= 0).length,
          offerJobs: hiringData.length
        }
      })
    } catch (error) {
      next(error)
    }
  },


  verifyEmail: async (req, res, next) => {
    try {
      const result = await Employer.findOneAndUpdate({
        _id: req.params.userId
      }, {verified:req.body.verified}, { new: true });
      message = {
        error: false,
        message: "Email verified",
        data: result
      }
      return res.status(200).send(message);

    } catch (error) {
      next(error)
    }
  },




  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) throw createError.BadRequest()
      const userId = await verifyRefreshToken(refreshToken)
      res.sendStatus(204)

    } catch (error) {
      next(error)
    }
  },
}
