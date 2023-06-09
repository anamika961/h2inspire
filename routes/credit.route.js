const express = require('express')
const CreditController = require('../controllers/credit.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const CreditRouter = express.Router()

CreditRouter.get('/list', verifyAccessToken, CreditController.list)

CreditRouter.get('/detail/:id', verifyAccessToken, CreditController.detail)

CreditRouter.post('/manage/:id', verifyAccessToken, CreditController.add)

/**
 * This route is used to purchase credits (For employers only)
 */
CreditRouter.post('/purchase/:id', verifyAccessToken, CreditController.purchase)

module.exports = CreditRouter