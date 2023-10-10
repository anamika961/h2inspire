const express = require('express')
const CreditNoteController = require('../controllers/creditnote.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const CreditNoteRouter = express.Router()

CreditNoteRouter.post('/add', CreditNoteController.create);
CreditNoteRouter.get('/list',verifyAccessToken, CreditNoteController.list)
CreditNoteRouter.get('/agency-list',verifyAccessToken, CreditNoteController.agencylist)

module.exports = CreditNoteRouter