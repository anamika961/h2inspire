const express = require('express');
const { verifyAccessToken } = require('../helpers/jwt_helper')
const PackageTypeController = require('../controllers/package_type.controller')
const PackageTypeRouter = express.Router()

PackageTypeRouter.post('/add',verifyAccessToken, PackageTypeController.create)

PackageTypeRouter.get('/list', PackageTypeController.list)

// IndustryRouter.get('/all-list', IndustryController.allList)

PackageTypeRouter.patch('/update/:id', PackageTypeController.update)

module.exports = PackageTypeRouter