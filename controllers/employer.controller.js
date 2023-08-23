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
const Admin = require('../models/admin.model')
const UserCredit = require('../models/user_credit.model')
const Billing = require('../models/billing.model')
const Transaction = require('../models/transaction.model')
const AgencyTransaction = require('../models/agency_transaction.model')

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

  detail: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAdmin = await Admin.findOne({_id: userId})
      if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "User unauthorized." })
      const employerData = await Employer.findOne({_id: req.params.id})
     // const billingData = await Billing.findOne({employer:req.params.id})
      res.status(200).send({
        error: false,
        message: 'Employer detail',
        data: employerData,
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
      const result = await employerRegistrationAuthSchema.validateAsync(req.body)

      const doesExist = await Employer.findOne({ email: result.email })
      if (doesExist)
        throw createError.Conflict(`${result.email} is already been registered`)

      const EmployerData = new Employer(result)
      const savedEmployer = await EmployerData.save()
      // console.log(savedEmployer.id);
      const accessToken = await signAccessToken(savedEmployer.id, "employers")
      const refreshToken = await signRefreshToken(savedEmployer.id, "employers")

      const UserCreditData = await UserCredit.findOneAndUpdate({employer: savedEmployer._id}, {$inc: {free_count: 1}}, {upsert: true, new: true}).select("free_count purchased_count free_used_count purchased_used_count")

      const transactionData = new Transaction({employer:savedEmployer.id});
      const tranResult = await transactionData.save();

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
      if (!employerData) throw createError.NotFound('Employer not registered')

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
            select:" "
          }
        }
      ])

      res.status(200).send({
        error: false,
        message: 'Employer data',
        data: checkEmployer,
        billingData,
        transactionData
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
        let amount = (billinglist?.hire_id?.comp_offered) * (2/100);
        let designation = billinglist?.hire_id?.desg_offered;
        let candidateData = billinglist?.hire_id?.candidate?._id;
        let tranId = Math.floor(Math.random() * 90000) + 10000;
        // let invNo = "INV/NO/" + Math.floor(1000 + Math.random() * 9000);

        const generateNextInvoice = (prevInv) => {
    
          if(prevInv == undefined){
            console.log('here')
            return "H2I/23-24-01"
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
              return `H2I/${currentYear}-${currentYearNext}-${newNumberPart}`
            }
            
          }
      }
      

     let transactionlist = await Transaction.findOne({});
    
     let PrevInvoiceId  = transactionlist?.passbook_amt[transactionlist?.passbook_amt?.length -1]?.invoice_No
      console.log("transactionlist",transactionlist?.passbook_amt[transactionlist?.passbook_amt?.length -1]?.invoice_No);
      
      //let data2  = generateNextInvoice();
        
        const transactionData = await Transaction.findOneAndUpdate(
          { employer: result?.employer },
          {
            '$inc': { 'total_amount': amount },
            '$push': {
              passbook_amt: {
                amount: amount,
                type: "payble",
                billing_id: billingId,
                candidate: candidateData,
                desg: designation,
                transaction_id: tranId,
                invoice_file:"",
                invoice_No:generateNextInvoice(PrevInvoiceId)
              },
            },
          },
          { new: true }
        );
        
       //console.log("transactionData>>>",transactionData)

       let agencyId = billinglist?.hire_id?.candidate?.agency?._id;

       //console.log("agencyId",agencyId)
      
       let amountData = (billinglist?.hire_id?.comp_offered) * (1/100);

       const agencyTransactionData = await AgencyTransaction.findOneAndUpdate(
        { agency: agencyId },
        {
          '$inc': { 'total_amount': amountData },
          '$push': {
            passbook_amt: {
              amount: amountData,
              type: "payble",
              billing_id: billingId,
              candidate: candidateData,
              desg: designation,
              transaction_id: tranId,
              invoice_file:"",
              invoice_No:generateNextInvoice(PrevInvoiceId),
              employer:result?.employer
            },
          },
        },
        { new: true }
      );

       // console.log("transactionData>>>",agencyTransactionData)

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
