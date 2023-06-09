const express = require('express')
const RoleController = require('../controllers/role.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const RoleRouter = express.Router()

RoleRouter.post('/add', verifyAccessToken, RoleController.create)

RoleRouter.get('/list', RoleController.list)

RoleRouter.get('/all-list', RoleController.allList)

RoleRouter.patch('/update/:id', verifyAccessToken, RoleController.update)

module.exports = RoleRouter