const express = require('express')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const DraftJobController = require('../controllers/draft_job.controller')
const DraftJobRouter = express.Router()

DraftJobRouter.post('/add',verifyAccessToken, DraftJobController.create)

DraftJobRouter.get('/all-list',verifyAccessToken, DraftJobController.alllist)

DraftJobRouter.get('/detail/:id', DraftJobController.detailJob)

DraftJobRouter.patch('/update/:id', DraftJobController.update)

DraftJobRouter.delete('/delete/:id', DraftJobController.delete)


module.exports = DraftJobRouter

