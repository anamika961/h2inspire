const express = require('express')
const TransactionController = require('../controllers/transaction.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const TransactionRouter = express.Router()

TransactionRouter.get('/list', TransactionController.list);
TransactionRouter.patch('/update/:id', TransactionController.update);
TransactionRouter.get('/agency-list',verifyAccessToken, TransactionController.agencylist);


module.exports = TransactionRouter