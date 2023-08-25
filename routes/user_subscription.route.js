const express = require('express')
const UserSubscriptionController = require('../controllers/user_subscription.controller')
//const { verifyAccessToken } = require('../helpers/jwt_helper')
const UserSubscriptionRouter = express.Router()

UserSubscriptionRouter.post('/add', UserSubscriptionController.create)

UserSubscriptionRouter.get('/list-by-id/:id', UserSubscriptionController.listbyId)

UserSubscriptionRouter.get('/detail/:id', UserSubscriptionController.detail)

UserSubscriptionRouter.patch('/update/:id', UserSubscriptionController.update)

UserSubscriptionRouter.patch('/status-update/:id', UserSubscriptionController.statusupdate)

module.exports = UserSubscriptionRouter