const createError = require('http-errors')
const Agency = require('../models/agency.model')
const { agencyLoginSchema, agencyRegistrationAuthSchema, agencyChangePasswordSchema } = require('../validators/validation_schema')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getUserViaToken,
} = require('../helpers/jwt_helper')
const bcrypt = require('bcrypt')
const AgencyJobModel = require('../models/agency_job.model')
const Recruiter = require('../models/recruiter.model')
const Admin = require('../models/admin.model')
const AgencyTransaction = require('../models/agency_transaction.model')

module.exports = {
  allList: async (req, res, next) => {
    try {
      const agencies = await Agency.find({}).select(["-password", "-otp"]).sort("-_id")
      return res.status(200).send({
        error: false,
        message: "All agencies",
        data: agencies
      })
    } catch (error) {
      next(error)
    }
  },

  list: async (req, res, next) => {
    try {
      const agencies = await Agency.find({}).select(["-password", "-otp"]).sort("-_id")
      return res.status(200).send({
        error: false,
        message: "All agencies",
        data: agencies
      })
    } catch (error) {
      next(error)
    }
  },

  allDetail: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAdmin = await Admin.findOne({_id: userId})
      if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "User unauthorized." })
      const agencyData = await Agency.findOne({_id: req.params.id})
      res.status(200).send({
        error: false,
        message: 'Agency detail',
        data: agencyData
      })
    } catch (error) {
      next(error)
    }
  },

  register: async (req, res, next) => {
    try {
      // const { email, password } = req.body
      // if (!email || !password) throw createError.BadRequest()
      const result = await agencyRegistrationAuthSchema.validateAsync(req.body)

      const doesExist = await Agency.findOne({ corporate_email: result.email })
      if (doesExist)
        throw createError.Conflict(`${result.email} is already been registered`)

      const AgencyData = new Agency(result)
      const savedAgency = await AgencyData.save()
      // console.log(savedAgency.id);
      const accessToken = await signAccessToken(savedAgency.id, "agency")
      const refreshToken = await signRefreshToken(savedAgency.id, "agency");

      const transactionData = new AgencyTransaction({agency:savedAgency.id});
      const tranResult = await transactionData.save();

      res.status(201).send({
        error: false,
        message: 'Agency created',
        data: {
          accessToken, 
          refreshToken
        },
        user: savedAgency
      })
    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  },

  detail: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAgency = await Agency.findOne({_id: userId})
      if(!checkAgency && dataModel != "agency") return res.status(401).send({ error: true, message: "Agency not found." })

      return res.status(200).send({
        error: false,
        message: "Agency detail found",
        data: checkAgency
      })
    } catch (error) {
      next(error)
    }
  },

  dashboard: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAgency = await Agency.findOne({_id: userId})
      if(!checkAgency && dataModel != "agency") return res.status(401).send({ error: true, message: "Agency not found." })

      const agencyJobs = await AgencyJobModel.find({agency: userId}).populate([{path: "job"}]).sort({_id: -1});

      return res.status(200).send({
        error: false,
        message: "Agency dashboard data.",
        data: agencyJobs,
        counts: {
          pendingJobs: agencyJobs.filter(e => e.status == "0").length,
          workingJobs: agencyJobs.filter(e => e.status == "1").length,
          declinedJobs: agencyJobs.filter(e => e.status == "2").length,
          teamMembers: 0
        }
      })
    } catch (error) {
      next(error)
    }
  },

  jobsByStatus: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAgency = await Agency.findOne({_id: userId})
      const checkRecruiter = await Recruiter.findOne({_id: userId})
      console.log({userId, dataModel, checkAgency, checkRecruiter});
      if (
        (!checkAgency || !checkRecruiter) &&
        !["agency", "recruiters"].includes(dataModel)
      ) return res.status(401).send({ error: true, message: "User unauthorized." })

      let findFilter;
      switch (dataModel) {
        case "recruiters":
          findFilter =  {agency: checkRecruiter?.agency, status: req.query.status}
          break;
        case "agency":
          findFilter =  {agency: userId, status: req.query.status}
          break;
        default:
          break;
      }
      
      const agencyJobs = await AgencyJobModel.find(findFilter).populate([{path: "job"}, {path: "candidates"}]).sort({_id: -1});

      return res.status(200).send({
        error: false,
        message: "Agency jobs list.",
        data: agencyJobs
      })
    } catch (error) {
      next(error)
    }
  },

  updateJobStatus: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      const checkAgency = await Agency.findOne({_id: userId})
      if(!checkAgency && dataModel != "agency") return res.status(401).send({ error: true, message: "Agency not found." })

      const accepted_on = req.body.status == "1" ? new Date() : undefined;

      const agencyJobs = await AgencyJobModel.findOneAndUpdate({_id: req.params.agencyJobId}, {status: req.body.status, accepted_on }, {new: true}).populate([{path: "job"}]).sort({_id: -1});

      return res.status(200).send({
        error: false,
        message: "Agency job status update.",
        data: agencyJobs
      })
    } catch (error) {
      next(error)
    }
  },

  updateAccountInfo: async (req, res, next) => {
    try {
      const updatedData = await Agency.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}).select("-otp -password")
      if(updatedData) {
        return res.status(200).send({
          error: false,
          message: "Agency data updated",
          data: updatedData
        })
      }
      return res.status(400).send({error: true, message: "Agency not updated"})
    } catch (error) {
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await agencyLoginSchema.validateAsync(req.body)
      const AgencyData = await Agency.findOne({ corporate_email: result.email })
      if (!AgencyData) throw createError.NotFound('Agency not registered')

      const isMatch = await AgencyData.isValidPassword(result.password)
      if (!isMatch)
        throw createError.BadRequest('Password not valid')

      const accessToken = await signAccessToken(AgencyData.id, "agency")
      const refreshToken = await signRefreshToken(AgencyData.id, "agency")

      AgencyData.password = undefined;
      AgencyData.otp = undefined;

      res.status(200).send({
        error: false,
        message: 'Agency logged in',
        data: {
          accessToken, 
          refreshToken
        },
        user: AgencyData
      })
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest('Invalid Email/Password'))
      next(error)
    }
  },

  changePassword: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      
      const checkAgency = await Agency.findOne({_id: userId})
      // return res.status(200).send({userId, dataModel, checkAgency})
      if(!checkAgency && dataModel != "agency") return res.status(401).send({ error: true, message: "Agency not authorized." })

      const result = await agencyChangePasswordSchema.validateAsync(req.body)

      if (req.body.old_password && req.body.new_password) {
        if (req.body.old_password === req.body.new_password) {
          message = {
            error: true,
            message: "Old and new password can not be same"
          }
          return res.status(200).send(message);
        }
        
        passwordCheck = await bcrypt.compare(req.body.old_password, checkAgency.password);
        if (passwordCheck) {
            const result = await Agency.findOneAndUpdate({
              _id: userId
            }, {
              password: req.body.new_password
            }, {new: true});
            message = {
                error: false,
                message: "Agency password changed!"
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

      const AgencyData = await Agency.findOneAndUpdate({ corporate_email: req.body.email }, {otp: 1234});
      if(!AgencyData) return res.status(404).send({error: true, message: 'Agency not found'});

      return res.status(200).send({error: false, message: 'Otp sent successfully'});
    
    } catch (error) {
      next(error)
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      if(!req.body.email && !req.body.otp) return res.status(400).send({error: true, message: "Email and OTP required"});

      const AgencyData = await Agency.findOne({
        $and: [
          { corporate_email: req.body.email },
          { otp: req.body.otp }
        ]
      });
      if(!AgencyData) return res.status(404).send({error: true, message: 'Agency not found / OTP not correct'});

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
        const AgencyData = await Agency.findOne({
          corporate_email: req.body.email
        });
       
        if (AgencyData === null) {
          message = {
            error: true,
            message: "Agency not found!"
          }
          return res.status(404).send(message);

        } else {
          const isMatch = await bcrypt.compare(req.body.new_password, AgencyData.password)
          // return res.send("isMatch")
          if (isMatch)
            throw createError[400]('You can not use your old password as new.')

          const result = await Agency.findOneAndUpdate({
            corporate_email: req.body.email
          }, {
            password: req.body.new_password
          });

          console.log("result",result);
          
          message = {
            error: false,
            message: "Agency password reset successfully!"
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

      const accessToken = await signAccessToken(userId, "agency")
      const refToken = await signRefreshToken(userId, "agency")
      res.send({ accessToken: accessToken, refreshToken: refToken })
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
