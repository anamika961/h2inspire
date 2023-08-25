const express = require('express')
const PackageController = require('../controllers/package.controller')
//const { verifyAccessToken } = require('../helpers/jwt_helper')
const PackageRouter = express.Router()

PackageRouter.post('/add', PackageController.create)

PackageRouter.get('/list', PackageController.list)

PackageRouter.get('/detail/:id', PackageController.detail)

PackageRouter.patch('/update/:id', PackageController.update)

module.exports = PackageRouter