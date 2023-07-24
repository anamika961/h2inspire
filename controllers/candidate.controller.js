const createError = require('http-errors')
const CandidateModel = require('../models/candidate.model');
const AgencyJobModel = require('../models/agency_job.model');
const CandidateJobModel = require('../models/candidate_job.model');
const Recruiter = require('../models/recruiter.model');
const { getUserViaToken } = require('../helpers/jwt_helper');
const Agency = require('../models/agency.model');
const ObjectId = require('mongoose').Types.ObjectId;
var admin = require("firebase-admin");
var serviceAccount = require("../hire2inspire-firebase-adminsdk.json");
const express = require('express')
const app = express()
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.BUCKET_URL
});
app.locals.bucket = admin.storage().bucket()

module.exports = {
    /**
     * This method is to submit candidate 
     */
    submitCandidate: async (req, res, next) => {
        try {
            let token = req.headers["authorization"]?.split(" ")[1];
            let { userId, dataModel } = await getUserViaToken(token);
            const checkAgency = await Agency.findOne({ _id: userId });
            const checkRecruiter = await Recruiter.findOne({ _id: userId });
            if (
                (!checkAgency || !checkRecruiter) &&
                !["agency", "recruiters"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." })
            
            // Checking the corresponding agency job exist or not
            const agencyJobExist = await AgencyJobModel.findOne({_id: req.body.agency_job})
            
            // if corresponding agency job not exist
            if(!agencyJobExist) return res.status(400).send({ error: true, message: "AGgency job does not exist" });

            // const emailData = req.body.email;
            // console.log("email>>>",emailData);
            // const phoneData = req.body.phone
            // console.log("phone>>>",phoneData)
            // Checking the candidate exist or not
            const candidateExist = await CandidateModel.findOne({
                $or:[{email:req.body.email},{phone:req.body.phone}]
            })

            console.log("candidate>>>>>",candidateExist)
            
            // if candidate exist
            if(candidateExist) return res.status(400).send({ error: true, message: `Candidate data already exist with this email ${candidateExist?.email}` })

            // if corresponding agency job exist and candidate not exist
            // Submit candidate here
            req.body.agency = agencyJobExist.agency
            req.body.recruiter = checkRecruiter?._id || undefined
            req.body.job = agencyJobExist.job

            // console.log("1", req.body);
            const candidateData = new CandidateModel(req.body)
            // console.log("2", candidateData);

            const candidateDataResult = await candidateData.save()
            
            const agencyJobUpdate = await AgencyJobModel.findOneAndUpdate({_id: agencyJobExist._id}, {$push: {candidates: candidateDataResult._id}}, {new: true})

            req.body.emp_job = candidateDataResult?.candidate_job;
            console.log("emp_job>>>>", req.body.emp_job)
            req.body.candidate = candidateDataResult?._id;

            const candidateJobData = new CandidateJobModel(req.body)

            const candidateJob = await candidateJobData.save()


            // console.log("3", agencyJobUpdate);

            if (candidateDataResult) {
                return res.status(201).send({
                    error: false,
                    message: "Candidate submitted",
                    data: candidateDataResult,
                    candidateJob
                })
            }
            return res.status(400).send({
                error: true,
                message: "Candidate submission failed"
            })
        } catch (error) {
            next(error)
        }
    },

    /**
     * This method is to submit bulk candidate 
     */
    submitBulkCandidate: async (req, res, next) => {
        try {
            let token = req.headers["authorization"]?.split(" ")[1];
            let { userId, dataModel } = await getUserViaToken(token);
            const checkAgency = await Agency.findOne({ _id: userId });
            const checkRecruiter = await Recruiter.findOne({ _id: userId });
            if (
                (!checkAgency || !checkRecruiter) &&
                !["agency", "recruiters"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." })

            // Checking the corresponding agency job exist or not
            const agencyJobExist = await AgencyJobModel.findOne({_id: req.body.agency_job})
            
            // if corresponding agency job not exist
            if(!agencyJobExist) return res.status(400).send({ error: true, message: "Candidate submission failed" })

            // if corresponding agency job exist
            // Submit candidate here
            const candidates = req.body.candidates
            let candidateData = []

            for (let index = 0; index < candidates.length; index++) {
                // console.log("agencyJobExist >>>>>>>>>>>>>>>>>>> ", agencyJobExist);
                // console.log("candidates[index].email >>>>>>>>>>>>>>>>>>>>>>>>>>>> ", candidates[index].email)
                // Checking the candidate exist or not
                // const candidateExist = await CandidateModel.findOne({$and: [{email: candidates[index].email}]})
                const candidateExist = await CandidateModel.findOne({
                    $and: [
                        { job: agencyJobExist.job },
                        {
                            $or: [
                                {email: candidates[index].email},
                                {phone: candidates[index].phone}
                            ]
                        }
                    ]
                })
                // console.log("candidateExist >>>>>>>>>>>>>>>>>>> ", candidateExist);
                // if candidate exist
                if(candidateExist) return res.status(400).send({ error: true, message: `Candidate data already exist with this email ${candidateExist?.email}` })

                candidates[index].agency = agencyJobExist.agency
                candidates[index].recruiter = checkRecruiter?._id
                candidates[index].job = agencyJobExist.job
                candidateData.push(candidates[index])
            }

            // console.log("candidates >>>>>>>>>>>>", candidateData);
            const candidateDataResult = await CandidateModel.insertMany(candidateData)

            submitted_candidates_id = candidateDataResult.map(e => e._id) 
            const agencyJobUpdate = await AgencyJobModel.findOneAndUpdate({_id: agencyJobExist._id}, {$push: {candidates: submitted_candidates_id}}, {new: true})
            // console.log("agencyJobUpdate >>>>>>>>>>>> ", agencyJobUpdate);

            if (candidateDataResult.length) {
                return res.status(201).send({
                    error: false,
                    message: "Candidate data submitted",
                    data: candidateDataResult
                })
            }
            return res.status(400).send({
                error: true,
                message: "Candidate submission failed"
            })
        } catch (error) {
            next(error)
        }
    },

    /**
     * This method is used to update candidate status
     */
    statusUpdate: async (req, res, next) => {
        try {
            // Status update
            const candidateData = await CandidateModel.findOneAndUpdate({_id: req.params.candidateId}, {status: req.body.status}, {new: true})

            if(!candidateData) return res.status(400).send({error: true, message: "Candidate status is not updated"})

            return res.status(200).send({error: false, message: "Candidate status updated"})

        } catch (error) {
            next(error)
        }
    },

    /**
     * This method is used to upload candidate CV
     */
    resumeUpload: async (req, res, next) => {
        try {
            let token = req.headers["authorization"]?.split(" ")[1];
            let { userId, dataModel } = await getUserViaToken(token);
            const checkAgency = await Agency.findOne({ _id: userId });
            const checkRecruiter = await Recruiter.findOne({ _id: userId });
            if (
                (!checkAgency || !checkRecruiter) &&
                !["agency", "recruiters"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." })

            if(req.file.mimetype != 'application/pdf') return res.status(400).send({error: true, message: "Only pdf file is allowed."})

            const fileName = `HIRE2INSPIRE_${Date.now()}_${req.file.originalname}`;
            const fileData = await app.locals.bucket.file(fileName).createWriteStream().end(req.file.buffer);
            
            fileurl = `https://firebasestorage.googleapis.com/v0/b/hire2inspire-62f96.appspot.com/o/${fileName}?alt=media`;

            // Status update
            const candidateData = await CandidateModel.findOneAndUpdate({_id: req.params.candidateId}, {resume: fileurl}, {new: true})

            if(!candidateData) return res.status(400).send({error: true, message: "Candidate resume not uploaded."})

            return res.status(200).send({error: false, message: "Candidate resume uploaded", data: candidateData})

        } catch (error) {
            next(error)
        }
    },

    /**
     * This method is to find all candidates
     */
    allCandidateWithFilter: async (req, res, next) => {
        try {
            // All candidate data
            let matchTry = {};
            matchTry['$and'] = []
            var queriesArray = Object.entries(req.query)
            queriesArray.forEach(x => {
                if(x[1] != '') {
                    if(ObjectId.isValid(x[1])) {
                        var z = { [x[0]]: { $eq: ObjectId(x[1]) } }
                    } else {
                        var z = { [x[0]]: { $regex:x[1], $options: 'i' } }
                    }
                    matchTry.$and.push(z)
                }
            })

            const candidates = await CandidateModel
                .find(matchTry)
                .sort({_id: -1})

            return res.status(200).send({error: false, message: "Candidate list",data: candidates})

        } catch (error) {
            next(error)
        }
    },

    /**
     * This method is used to fetch candidate details
     */
    details: async (req, res, next) => {
        try {
            const candidateDetail = await CandidateModel
                .findOne({_id: req.params.id})
                .populate([
                    {
                        path: "job"
                    },
                    {
                        path: "agency"
                    },
                    {
                        path: "recruiter"
                    }
                ])
            if (!candidateDetail) return res.status(400).send({error: true, message: "Candidate not found"})
            return res.status(200).send({error: false, message: "Candidate data found", data: candidateDetail})
        } catch (error) {
            next(error)
        }
    }
}