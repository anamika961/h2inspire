const express = require('express')
const GetInTouchController = require('../controllers/getInTouch.controller')
const GetInTouchRouter = express.Router()

GetInTouchRouter.post('/add', GetInTouchController.create)


module.exports = GetInTouchRouter