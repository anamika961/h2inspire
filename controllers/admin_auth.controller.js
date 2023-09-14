const createError = require('http-errors')
const Admin = require('../models/admin.model')
const { adminLoginSchema, adminRegistartionSchema } = require('../validators/validation_schema')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getUserViaToken,
} = require('../helpers/jwt_helper')
const bcrypt = require('bcrypt')

const JobPosting = require("../models/job_posting.model");
const Employer = require("../models/employer.model");
const AgencyJobModel = require("../models/agency_job.model");
const RecruiterModel = require("../models/recruiter.model");
const Agency = require("../models/agency.model");
const Transaction = require("../models/transaction.model");
const AgencyTransaction = require('../models/agency_transaction.model');
const HiringDetail = require('../models/hiringDetails.model');

module.exports = {
  register: async (req, res, next) => {
    try {
      // const { email, password } = req.body
      if (req.body.password !== req.body.confirm_password) throw createError.BadRequest("Password confirmation does not match")
      const result = await adminRegistartionSchema.validateAsync(req.body)

      const doesExist = await Admin.findOne({ email: result.email })
      if (doesExist)
        throw createError.Conflict(`${result.email} is already been registered`)

      const admin = new Admin(result)
      const savedAdmin = await admin.save()
      // console.log(savedAdmin.id);
      const accessToken = await signAccessToken(savedAdmin.id, "admins")
      const refreshToken = await signRefreshToken(savedAdmin.id, "admins")

      res.status(201).send({
        error: false,
        message: 'Admin created',
        data: {
          accessToken, 
          refreshToken
        }
      })
    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await adminLoginSchema.validateAsync(req.body)
      const admin = await Admin.findOne({ email: result.email })
      if (!admin) throw createError.NotFound('Admin not registered')

      const isMatch = await admin.isValidPassword(result.password)
      if (!isMatch)
        throw createError.BadRequest('Password not valid')

      const accessToken = await signAccessToken(admin.id, "admins")
      const refreshToken = await signRefreshToken(admin.id, "admins")

      res.status(201).send({
        error: false,
        message: 'Admin logged in',
        data: {
          accessToken, 
          refreshToken
        },
        user: admin 
      })
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest('Invalid Email/Password'))
      next(error)
    }
  },

  changePassword: async (req, res, next) => {
    try {
      if (req.body.old_password && req.body.new_password) {
        if (req.body.old_password === req.body.new_password) {
            message = {
                error: true,
                message: "Old and new password can not be same"
            }
            return res.status(200).send(message);
        }
        const adminData = await Admin.findOne({
            _id: req.params.adminId
        });
        if (adminData === null) {
            message = {
                error: true,
                message: "Admin not found!"
            }
        } else {
            passwordCheck = await bcrypt.compare(req.body.old_password, adminData.password);
            if (passwordCheck) {
                const result = await Admin.findOneAndUpdate({
                  _id: req.params.adminId
                }, {
                  password: req.body.new_password
                }, {new: true});
                message = {
                    error: false,
                    message: "Admin password changed!"
                }
            } else {
                message = {
                  error: true,
                  message: "Old password is not correct!"
                }
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
      next(error)
    }
  },

  forgetPassword: async (req, res, next) => {
    try {
      if(!req.body.email) return res.status(400).send({error: true, message: "Email required"});

      const AdminData = await Admin.findOneAndUpdate({ email: req.body.email }, {otp: 1234});
      if(!AdminData) return res.status(404).send({error: true, message: 'Admin not found'});

      return res.status(200).send({error: false, message: 'Otp sent successfully'});
    
    } catch (error) {
      next(error)
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      if(!req.body.email && !req.body.otp) return res.status(400).send({error: true, message: "Email and OTP required"});

      const AdminData = await Admin.findOne({
        $and: [
          { email: req.body.email },
          { otp: req.body.otp }
        ]
      });
      if(!AdminData) return res.status(404).send({error: true, message: 'Admin not found'});

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
        const AdminData = await Admin.findOne({
            email: req.body.email
        });
       
        if (AdminData === null) {
            message = {
              error: true,
              message: "Admin not found!"
            }
          return res.status(404).send(message);

        } else {
          const result = await Admin.findOneAndUpdate({
            email: req.body.email
          }, {
            password: req.body.new_password
          });

          console.log("result",result);
          
          message = {
            error: false,
            message: "Admin password reset successfully!"
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

  jobApproval: async(req,res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAdmin = await Admin.findOne({_id: userId})
      if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "Admin not authorized." })

      const jobPostingData = await JobPosting.findOneAndUpdate({_id: req.params.jobId}, {is_approved: req.body.is_approved})
      if(jobPostingData) {
        return res.status(200).send({
          error: false,
          message: "Admin approval for job updated."
        });
      }
      return res.status(400).send({
        error: false,
        message: "Job approval failed."
      });
    } catch (error) {
      next(error)  
    }
  },

  agnecyApproval: async(req,res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAdmin = await Admin.findOne({_id: userId})
      if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "Admin not authorized." })

      const agencyData = await Agency.findOneAndUpdate({_id: req.params.jobId}, {is_approved: req.body.is_approved})
      if(agencyData) {
        return res.status(200).send({
          error: false,
          message: "Admin approval for agency updated."
        });
      }
      return res.status(400).send({
        error: false,
        message: "Agency approval failed."
      });
    } catch (error) {
      next(error)  
    }
  },

  adminDetail: async(req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAdmin = await Admin.findOne({_id: userId}).select("-password -otp")
      if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "Admin not authorized." })

      return res.status(200).send({
        error: false,
        message: "Admin detail found.",
        data: checkAdmin
      });
    } catch (error) {
      next(error)
    }
  },

  adminUpdate: async (req, res, next) => {
    try {
        const result = await Admin.findOneAndUpdate({_id: req.params.adminId}, req.body, {new: true});

        if(!result) return res.status(200).send({ error: false, message: "Admin not updated" })

        return res.status(200).send({
            error: false,
            message: "Admin Updated",
            data: result
        })
    } catch (error) {
        next(error)
    }
},


  paymentStatusUpdate: async(req,res,next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAdmin = await Admin.findOne({_id: userId}).select("-password -otp")
      if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "Admin not authorized." })

      let transactionId = req.body.transactionId;
         let type = req.body.type
         
         let emp_id = req.body.emp_id;

         // console.log(invoice_file,"msg")
        
         const getEmpData  = await Transaction.find({employer:emp_id})


         function addPaymentRes(transactions, targetTransactionId, invoiceValue) {
            
             for (let i = 0; i < transactions.length; i++) {
               if (transactions[i].transaction_id == targetTransactionId) {
                   
                 transactions[i]["type"] = invoiceValue;
                 
               }
             }
            return transactions;
            
         //    console.log(transactions,'transactions')
           }
          
           const updatedData = addPaymentRes(getEmpData[0].passbook_amt, transactionId
           , "paid");
         //   console.log(req.body,"msg")
            console.log(updatedData);

            const result = await Transaction.findOneAndUpdate({employer: emp_id},{passbook_amt:updatedData,description:req.body.description}, {new: true});

      return res.status(200).send({
        error: false,
        message: "payment status update.",
        data: result
      });
    } catch (error) {
      next(error)
    }
  },


  paymentAgencyStatusUpdate: async(req,res,next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAdmin = await Admin.findOne({_id: userId}).select("-password -otp")
      if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "Admin not authorized." })

      let transactionId = req.body.transactionId;
         let type = req.body.type
         
         let agencyId = req.body.agencyId;

         // console.log(invoice_file,"msg")
        
         const getEmpData  = await AgencyTransaction.find({agency:agencyId})


         function addPaymentRes(transactions, targetTransactionId, invoiceValue) {
            
             for (let i = 0; i < transactions.length; i++) {
               if (transactions[i].transaction_id == targetTransactionId) {
                   
                 transactions[i]["type"] = invoiceValue;
                 
               }
             }
            return transactions;
            
         //    console.log(transactions,'transactions')
           }
          
           const updatedData = addPaymentRes(getEmpData[0].passbook_amt, transactionId
           , "paid");
         //   console.log(req.body,"msg")
            console.log(updatedData);

            const result = await AgencyTransaction.findOneAndUpdate({agency:agencyId},{passbook_amt:updatedData,description:req.body.description}, {new: true});

      return res.status(200).send({
        error: false,
        message: "payment status update.",
        data: result
      });
    } catch (error) {
      next(error)
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) throw createError.BadRequest()
      const userId = await verifyRefreshToken(refreshToken)

      const accessToken = await signAccessToken(userId, "admins")
      const refToken = await signRefreshToken(userId, "admins")
      res.send({ accessToken: accessToken, refreshToken: refToken })
    } catch (error) {
      next(error)
    }
  },

  dashboard: async (req,res,next) =>{
    try{
      const hiringData = await HiringDetail.find({});

      let totalHireAmount = 0;
      hiringData.forEach((element,index)=>{
        totalHireAmount += element?.comp_offered
      });

      let totalHired = hiringData.length;

      const transactionData = await Transaction.find({});

        let totalSpend = 0;
        for(let i = 0 ; i<transactionData?.length ; i++){
          if(transactionData[i]?.total_amount !== undefined){
            totalSpend = totalSpend + transactionData[i]?.total_amount;
          }
        }

      let totalgiveto = 0;
      const agencyTransactionData = await AgencyTransaction.find({});
      for(let i = 0 ; i<agencyTransactionData?.length ; i++){
        if(agencyTransactionData[i]?.total_amount !== undefined){
          totalgiveto = totalgiveto + agencyTransactionData[i]?.total_amount;
        }
      };

      let totalSaving = totalSpend - totalgiveto;

      return res.status(200).send({
        error: false,
        message: "Admin dashboard data.",
        data:{
          totalHired: totalHired,
          averageSalary: (totalHireAmount/totalHired).toFixed(2) ,
          averagePlacementFee: 0.5,
          totalSpend:totalSpend,
          totalSaving:totalSaving

        }
      })
    }catch(error){
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
