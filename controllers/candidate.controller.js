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
const app = express();
const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
    host: "mail.demo91.co.in",
    port: 465,
    auth: {
      user: "developer@demo91.co.in",
      pass: "Developer@2023"
    }
  });

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
            const agencyJobExist = await AgencyJobModel.findOne({_id: req.body.agency_job});

            console.log("agencyJobExist",agencyJobExist)
            
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
            console.log("candidate.id",candidateExist?.agency_job)
            console.log('patrams',req.body.agency_job)

            if(candidateExist?.agency_job == req.body.agency_job){
                console.log('in..')
                return res.status(400).send({ error: true, message: `Candidate data already exist with this email ${candidateExist?.email}` })
            }
                
            
            // if candidate exist
            

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

            req.body.emp_job = candidateDataResult?.job;
            req.body.agency_id = candidateDataResult?.agency;
            // console.log("emp_job>>>>", req.body.emp_job);
            // console.log("id>>>>", req.body.agency_id)
            req.body.candidate = candidateDataResult?._id;

            const candidateJobData = new CandidateJobModel(req.body)

            const candidateJob = await candidateJobData.save();

            const candidatejobdata = await CandidateJobModel.findOne({_id:candidateJob?._id}).populate([
                {
                    path:"emp_job",
                    select:"job_name"
                }
            ])

            const candidatelist = await CandidateModel.findOne({_id:candidateDataResult?._id});
            //console.log("agengydata>>>>",agengydata)

            let candidateEmail = candidatelist?.email;
            let candidatefName = candidatelist?.fname;
            let candidatelName = candidatelist?.lname;

            let jobRole = candidatejobdata?.emp_job?.job_name

             console.log("candidateEmail>>>>",candidateEmail)

            var mailOptions = {
                from: 'developer@demo91.co.in',
                to: candidateEmail,
                subject: `Subject: Confirmation of CV Submission for ${jobRole} - Next Steps`,
                html:`
                <head>
                    <title>Notification: Candidate Hired - Backend Development Position</title>
            </head>
            <body>
                <p>Dear ${candidatefName} ${candidatelName} ,</p>
                <p>I hope this email finds you well. I am writing to confirm that we have received your application for the ${jobRole} at [Company Name]. We appreciate your interest in joining our team and taking the time to submit your CV. Your application is currently being reviewed by our recruitment team.</p>

                <p>As we move forward in the selection process, we would like to gather some additional information from you. Please take a moment to answer the following screening questions. Your responses will help us better understand your qualifications and suitability for the role. Once we review your answers, we will determine the next steps in the process.</p>

                <p><strong>Screening Questions:</strong></p>
                <ol>
                    <li>Can you provide a brief overview of your relevant experience in [specific skill or qualification] and how it aligns with the requirements of the ${jobRole}?</li>
                    <li>What motivated you to apply for this particular position at [Company Name]?</li>
                    <li>Could you share a challenging project you've worked on in the past and how you successfully overcame obstacles to achieve the desired outcome?</li>
                    <li>The ${jobRole} often requires effective collaboration with cross-functional teams. Can you give an example of a situation where you had to work closely with individuals from different departments to achieve a common goal?</li>
                    <li>In ${jobRole}, strong [specific skill] is essential. Please describe how you have demonstrated proficiency in this skill throughout your career.</li>
                </ol>

                <p>Please respond to these questions by [deadline for response]. You can either reply directly to this email or send your answers as a separate document. If you have any questions or need further clarification, please don't hesitate to reach out.</p>

                <p>We understand the value of your time and effort, and we are excited about the possibility of you joining our team. We will carefully review your responses and notify you regarding the next steps in the selection process.</p>

                <p>Thank you again for considering [Company Name] as your potential employer. We look forward to learning more about you through your responses to the screening questions.</p>

                <p>Best regards,</p>
                <p>Hire2Inspire</p>
            </body>
        `
 };   
            transport.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });


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
    },

    requestUpdate: async (req, res, next) => {
        try {
            // Status update
            const candidateJobData = await CandidateJobModel.findOneAndUpdate({_id: req.params.candidateId}, {request: req.body.request}, {new: true})

            if(!candidateJobData) return res.status(400).send({error: true, message: "Candidate status is not updated"})

            return res.status(200).send({error: false, message: "Candidate status updated"})

        } catch (error) {
            next(error)
        }
    }
}