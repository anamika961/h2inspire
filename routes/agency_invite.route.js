const express = require('express')
const AgencyInviteController = require('../controllers/agency_invite.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const AgencyInviteRouter = express.Router()

AgencyInviteRouter.get('/all-list', verifyAccessToken, AgencyInviteController.allList)

AgencyInviteRouter.post('/send-invitation', verifyAccessToken, AgencyInviteController.sendInvitation)

module.exports = AgencyInviteRouter