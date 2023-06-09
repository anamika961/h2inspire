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
