const express = require('express')
const RecruiterController = require('../controllers/recruiter.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const RecruiterRouter = express.Router()

RecruiterRouter.get('/list-by-agency', verifyAccessToken, RecruiterController.list)

RecruiterRouter.get('/list-by-employer', verifyAccessToken, RecruiterController.empReqlist)

RecruiterRouter.post('/add-by-employer', verifyAccessToken, RecruiterController.addByEmp)

RecruiterRouter.post('/login', RecruiterController.login)

RecruiterRouter.post('/add-by-agency', verifyAccessToken, RecruiterController.addByAgency)

RecruiterRouter.get('/detail/:id', verifyAccessToken, RecruiterController.detail)

RecruiterRouter.patch('/status-update/:id', verifyAccessToken, RecruiterController.statusUpdate)

RecruiterRouter.post('/forget-password', RecruiterController.forgetPassword)

RecruiterRouter.post('/verify-otp', RecruiterController.verifyOtp)

RecruiterRouter.patch('/reset-password', RecruiterController.resetPassword)

RecruiterRouter.patch('/change-password', verifyAccessToken, RecruiterController.changePassword)

RecruiterRouter.patch('/status-update-by-emp/:id', verifyAccessToken, RecruiterController.statusEmpUpdate)

module.exports = RecruiterRouter