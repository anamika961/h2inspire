const express = require('express')
const TransactionController = require('../controllers/transaction.controller')
const TransactionRouter = express.Router()

TransactionRouter.get('/list', TransactionController.list);


module.exports = TransactionRouter