const express = require('express')
const AdminAuthController = require('../controllers/admin_auth.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const AdminAuthRouter = express.Router()

AdminAuthRouter.post('/register', AdminAuthController.register)

AdminAuthRouter.post('/login', AdminAuthController.login)

AdminAuthRouter.get('/detail', verifyAccessToken, AdminAuthController.adminDetail)

AdminAuthRouter.post('/forget-password', AdminAuthController.forgetPassword)

AdminAuthRouter.post('/verify-otp', AdminAuthController.verifyOtp)

AdminAuthRouter.patch('/reset-password', AdminAuthController.resetPassword)

AdminAuthRouter.patch('/change-password/:adminId', verifyAccessToken, AdminAuthController.changePassword)

AdminAuthRouter.patch('/job-approval/:jobId', verifyAccessToken, AdminAuthController.jobApproval)

AdminAuthRouter.patch('/agency-approval/:jobId', verifyAccessToken, AdminAuthController.agnecyApproval)

AdminAuthRouter.patch("/payment-status",verifyAccessToken, AdminAuthController.paymentStatusUpdate);

AdminAuthRouter.patch("/agency-payment-status",verifyAccessToken, AdminAuthController.paymentAgencyStatusUpdate);

AdminAuthRouter.post('/refresh-token', AdminAuthController.refreshToken);

AdminAuthRouter.delete('/logout', AdminAuthController.logout);

AdminAuthRouter.patch('/update/:adminId', AdminAuthController.adminUpdate);

AdminAuthRouter.get('/dashboard',verifyAccessToken, AdminAuthController.dashboard)

module.exports = AdminAuthRouter