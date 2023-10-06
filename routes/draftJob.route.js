const express = require('express')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const DraftJobController = require('../controllers/draft_job.controller')
const DraftJobRouter = express.Router()

DraftJobRouter.post('/add',verifyAccessToken, DraftJobController.create)

DraftJobRouter.get('/all-list', DraftJobController.alllist)


module.exports = DraftJobRouter