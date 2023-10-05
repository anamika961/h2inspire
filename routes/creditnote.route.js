const express = require('express')
const CreditNoteController = require('../controllers/creditnote.controller')
const CreditNoteRouter = express.Router()

CreditNoteRouter.post('/add', CreditNoteController.create);
CreditNoteRouter.get('/list', CreditNoteController.list)

module.exports = CreditNoteRouter