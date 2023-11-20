const express = require('express')
const AgencyController = require('../controllers/agency.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const AgencyRouter = express.Router()

AgencyRouter.get('/all-list', verifyAccessToken, AgencyController.allList)

AgencyRouter.get('/list', AgencyController.list)

AgencyRouter.get('/all-detail/:id', verifyAccessToken, AgencyController.allDetail)

AgencyRouter.post('/register', AgencyController.register)

AgencyRouter.patch('/update/:id', AgencyController.updateAccountInfo)

AgencyRouter.get('/detail', verifyAccessToken, AgencyController.detail)

AgencyRouter.get('/dashboard', verifyAccessToken, AgencyController.dashboard)

AgencyRouter.get('/jobs-by-status', verifyAccessToken, AgencyController.jobsByStatus)

AgencyRouter.patch('/update-job-status/:agencyJobId', verifyAccessToken, AgencyController.updateJobStatus)

AgencyRouter.post('/login', AgencyController.login)

AgencyRouter.post('/forget-password', AgencyController.forgetPassword)

AgencyRouter.post('/verify-otp', AgencyController.verifyOtp)

AgencyRouter.patch('/reset-password', AgencyController.resetPassword)

AgencyRouter.patch('/change-password', verifyAccessToken, AgencyController.changePassword)

AgencyRouter.post('/refresh-token', AgencyController.refreshToken)

AgencyRouter.patch('/update-status/:id', AgencyController.updateWelcomeStatus)

AgencyRouter.patch('/verify-email/:userId', AgencyController.verifyEmail)

AgencyRouter.delete('/logout', AgencyController.logout)

module.exports = AgencyRouter