const createError = require('http-errors')
const CandidateModel = require('../models/candidate.model');
const AgencyJobModel = require('../models/agency_job.model');
const CandidateJobModel = require('../models/candidate_job.model');
const Recruiter = require('../models/recruiter.model');
const { getUserViaToken } = require('../helpers/jwt_helper');
const Agency = require('../models/agency.model');
const JobPosting = require("../models/job_posting.model");
const ObjectId = require('mongoose').Types.ObjectId;
var admin = require("firebase-admin");
var serviceAccount = require("../hire2inspire-firebase-adminsdk.json");
const express = require('express')
const app = express();
const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
    host: "hire2inspire.com",
    port: 465,
    auth: {
      user: "info@hire2inspire.com",
      pass: "h2I@2023"
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

            // Checking the candidate exist or not
            // const candidateExist = await CandidateModel.findOne({email:req.body.email});
            // const candidateExist1 = await CandidateModel.findOne({phone:req.body.phone})

            let candidateExist = await CandidateModel.findOne({$and:[{email:req.body.email},{agency_job:req.body.agency_job}]});
            let candidateExist1 = await CandidateModel.findOne({$and:[{phone:req.body.phone},{agency_job:req.body.agency_job}]});

            console.log("candidate>>>>>",candidateExist)
            console.log("candidate.id",candidateExist?.agency_job)
            console.log('patrams',req.body.agency_job);
            console.log('candidateExist1',candidateExist1);
            console.log("body",req.body);

            if(candidateExist?.agency_job == req.body.agency_job){
                console.log('in..')
                return res.status(400).send({ error: true, message: `Candidate data already exist with this email ${candidateExist?.email}` })
            }
            else if(candidateExist1?.agency_job == req.body.agency_job){
                return res.status(400).send({ error: true, message: `Candidate data already exist with this phone no ${candidateExist1?.phone}` })
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

            let jobRole = candidatejobdata?.emp_job?.job_name;

            let jobId = candidatejobdata?.emp_job;

            let candidateId = candidatejobdata?.candidate;

             console.log("candidateEmail>>>>",candidateEmail)

            var mailOptions = {
                from: 'info@hire2inspire.com',
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

                <p>Find the link 
                <a href="https://hire2inspire.com/candidate/apply-job/${candidateId}" target="blank">Find your job</a>
              </p>

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

            const empJobExist = await JobPosting.findOne({_id: req.body.job})
            
            // if corresponding agency job not exist
            if(!agencyJobExist) return res.status(400).send({ error: true, message: "Candidate submission failed" })

            if(!empJobExist) return res.status(400).send({ error: true, message: "Candidate submission failed" })

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
                });

                const candidateExist1 = await CandidateModel.findOne({
                    $and: [
                        { job: empJobExist?._id},
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

                if(candidateExist1) return res.status(400).send({ error: true, message: `Candidate data already exist with this email ${candidateExist?.email}` })


                candidates[index].agency = agencyJobExist.agency
                candidates[index].recruiter = checkRecruiter?._id
               // candidates[index].job = agencyJobExist.job
                candidates[index].job = empJobExist?._id
                candidateData.push(candidates[index])

            
                
            }

            // console.log("candidates >>>>>>>>>>>>", candidateData);
            const candidateDataResult = await CandidateModel.insertMany(candidateData);
            const candidatejobData = await CandidateJobModel.insertMany(candidateData);

            console.log({candidatejobData});

            submitted_candidates_id = candidateDataResult.map(e => e._id) 
            const agencyJobUpdate = await AgencyJobModel.findOneAndUpdate({_id: agencyJobExist._id}, {$push: {candidates: submitted_candidates_id}}, {new: true})
            // console.log("agencyJobUpdate >>>>>>>>>>>> ", agencyJobUpdate);
              console.log({candidateDataResult});

            if (candidateDataResult.length) {
                return res.status(201).send({
                    error: false,
                    message: "Candidate data submitted",
                    data: candidateDataResult
                })
            }else if(candidatejobData.length){
                return res.status(201).send({
                    error: false,
                    message: "Candidate data submitted",
                    data: candidatejobData
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
            const candidateJobData = await CandidateJobModel.findOneAndUpdate({candidate: req.params.candidateId}, {request: req.body.request}, {new: true});

            console.log({candidateJobData})

            const candidateData = await CandidateModel.findOneAndUpdate({_id: req.params.candidateId}, {status: candidateJobData?.request}, {new: true})

            console.log("candidateJobData",candidateJobData?.request)

            if(candidateJobData?.request == "1"){
                const jobData = await JobPosting.findOneAndUpdate({_id:candidateJobData?.emp_job},{ '$inc': { 'reviewing_count': 1 }, },{new:true});
            }
            else if(candidateJobData?.request == "2"){
                const jobData = await JobPosting.findOneAndUpdate({_id:candidateJobData?.emp_job},{ '$inc': { 'interviewin_count': 1 }, },{new:true});
            }
            else if(candidateJobData?.request == "3"){
                const jobData = await JobPosting.findOneAndUpdate({_id:candidateJobData?.emp_job},{ '$inc': { 'offer_count': 1 }, },{new:true});
            }

            if(!candidateJobData) return res.status(400).send({error: true, message: "Candidate status is not updated"})

            return res.status(200).send({error: false, message: "Candidate status updated"})

        } catch (error) {
            next(error)
        }
    },

    update: async (req, res, next) => {
        try {
            const result = await CandidateModel.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "Candidate not updated" })

            return res.status(200).send({
                error: false,
                message: "Candidate Updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },


    candidateJobUpdate: async (req, res, next) => {
        try {
            const candidateJobData = await CandidateJobModel.findOneAndUpdate({candidate: req.params.candidateId},req.body,{new: true}).populate([
                {
                    path:"emp_job",
                    select:""
                },
                {
                    path:"agency_id",
                    select:""
                },
                {
                    path:"candidate",
                    select:""
                },
            ]);

            if(candidateJobData?.final_submit == true){
                const candidateDataUpdate = await CandidateModel.findOneAndUpdate({_id:req.params.candidateId},{final_submit:true},{new:true})
            }

            if(candidateJobData?.screening_q_a.length != null){
                const candidateUpdate = await CandidateModel.findOneAndUpdate({_id:req.params.candidateId},{"$push":{screening_q_a:candidateJobData?.screening_q_a}},{new:true})
            }

            if(!candidateJobData) return res.status(400).send({error: true, message: "Candidate status is not updated"})

            return res.status(200).send({error: false, message: "Candidate status updated"})

        } catch (error) {
            next(error)
        }
    },

    candidateJobDetail: async(req,res,next) => {
        try{
            const result = await CandidateJobModel.findOne({candidate: req.params.candidateId}).populate([
                {
                    path:"emp_job",
                    select:""
                },
                {
                    path:"agency_id",
                    select:""
                },
                {
                    path:"candidate",
                    select:""
                },

            ]);
    
            return res.status(200).send({
                error: false,
                message: "Detail of candidate job",
                data: result
            })

        }catch(error){
            next(error)
        }
    },

    // BulkCandidate: async (req, res, next) => {
    //     try {
    //         let token = req.headers["authorization"]?.split(" ")[1];
    //         let { userId, dataModel } = await getUserViaToken(token);
    //         const checkAgency = await Agency.findOne({ _id: userId });
    //         const checkRecruiter = await Recruiter.findOne({ _id: userId });
    //         if (
    //             (!checkAgency || !checkRecruiter) &&
    //             !["agency", "recruiters"].includes(dataModel)
    //         ) return res.status(401).send({ error: true, message: "User unauthorized." })

            
    //         if (candidateDataResult.length) {
    //             return res.status(201).send({
    //                 error: false,
    //                 message: "Candidate data submitted",
    //                 data: candidateDataResult
    //             })
    //         }
    //         return res.status(400).send({
    //             error: true,
    //             message: "Candidate submission failed"
    //         })
    //     } catch (error) {
    //         next(error)
    //     }
    // },

    

}