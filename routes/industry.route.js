const express = require('express')
const IndustryController = require('../controllers/induustry.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const IndustryRouter = express.Router()

IndustryRouter.post('/add', verifyAccessToken, IndustryController.create)

IndustryRouter.get('/list', IndustryController.list)

IndustryRouter.get('/all-list', IndustryController.allList)

IndustryRouter.patch('/update/:id', verifyAccessToken, IndustryController.update)

module.exports = IndustryRouter