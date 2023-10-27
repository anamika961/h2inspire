const express = require('express')
const candidateController = require('../controllers/candidate.controller')
const CandidateController = require('../controllers/candidate.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const CandidateRouter = express.Router()
const multer  = require('multer');

const acceptedFileTypes = [
    // 'image/png',
    // 'image/jpeg',
    // 'image/jpg',
    'application/pdf',
    // 'text/csv',
    // 'application/msword',
    // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const upload = multer({ 
    // dest: 'uploads/',
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (!acceptedFileTypes.includes(file.mimetype)) {
          return cb(new Error('Only pdf format allowed!'))
        }
        cb(null, true)
    }
})
/**
 * This method is used to fetch candidate list with data filter
 */
CandidateRouter.get('/list', verifyAccessToken, candidateController.allCandidateWithFilter)

CandidateRouter.post('/submit', verifyAccessToken, CandidateController.submitCandidate)

CandidateRouter.post('/bulk-submit', verifyAccessToken, CandidateController.submitBulkCandidate)

//CandidateRouter.post('/bulk', verifyAccessToken, CandidateController.BulkCandidate)

CandidateRouter.patch('/status/:candidateId', verifyAccessToken, CandidateController.statusUpdate)

CandidateRouter.patch('/resume-upload/:candidateId', upload.single('resume'), verifyAccessToken, CandidateController.resumeUpload)

CandidateRouter.get('/detail/:id', verifyAccessToken, CandidateController.details)

CandidateRouter.patch('/request/:candidateId', CandidateController.requestUpdate)

CandidateRouter.patch('/apply-job/:candidateId', CandidateController.candidateJobUpdate)

CandidateRouter.get('/detail-job/:candidateId', CandidateController.candidateJobDetail)

CandidateRouter.patch('/update/:id', CandidateController.update)

module.exports = CandidateRouter