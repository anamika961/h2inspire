const express = require('express')
const JobPostingController = require('../controllers/job_posting.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const JobPostingRouter = express.Router()

JobPostingRouter.post('/add', verifyAccessToken, JobPostingController.addJobPosting)

JobPostingRouter.get('/list-by-employer', JobPostingController.listByEmployer)

JobPostingRouter.get('/all-list', JobPostingController.allList)

JobPostingRouter.get('/agency-job-list', verifyAccessToken, JobPostingController.agencyJobList)

// JobPostingRouter.get('/agency-job-detail/:id', verifyAccessToken, JobPostingController.agencyJobDetail)

JobPostingRouter.get('/detail/:id', verifyAccessToken, JobPostingController.detailJobPosting)

JobPostingRouter.patch('/update/:id', verifyAccessToken, JobPostingController.updateJobPosting)

JobPostingRouter.post('/invite-agency', verifyAccessToken, JobPostingController.inviteAgency)

JobPostingRouter.post('/invite-agencies', verifyAccessToken, JobPostingController.inviteAgencies)

JobPostingRouter.post('/agency-self-job-assign-declne', verifyAccessToken, JobPostingController.agencySelfJobAssignDecline)

module.exports = JobPostingRouter