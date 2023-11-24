const mongoose = require("mongoose");
const { getUserViaToken, verifyAccessToken } = require("../helpers/jwt_helper");
const JobPosting = require("../models/job_posting.model");
const Employer = require("../models/employer.model");
const AgencyJobModel = require("../models/agency_job.model");
const RecruiterModel = require("../models/recruiter.model");
const Agency = require("../models/agency.model");
const Admin = require("../models/admin.model");
const UserCredit = require('../models/user_credit.model');
const Candidate = require("../models/candidate.model");
const CandidateJobModel = require('../models/candidate_job.model');
const HiringDetail = require('../models/hiringDetails.model');
// const Transaction = require('../models/transaction.model')
const sendNotification = require('../helpers/send_notification');
const nodemailer = require("nodemailer");
const UserSubscription = require("../models/user_subscription.model");
const DraftJob = require("../models/draft_job.model");

var transport = nodemailer.createTransport({
    host: "hire2inspire.com",
    port: 465,
    auth: {
      user: "info@hire2inspire.com",
      pass: "h2I@2023"
    }
  });


module.exports = {
    allList: async (req, res, next) => {
        try {
            const job_postings = await JobPosting.find({}).populate([
                {
                    path: "employer",
                    select: "fname lname email employer_image"
                }
            ]).sort({_id: -1})
    
            return res.status(200).send({
                error: false,
                message: "Job posting list",
                data: job_postings
            })
        } catch (error) {
            next(error);
        }
    },

    agencyJobList: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkAgency = await Agency.findOne({_id: userId})
            if(!checkAgency && dataModel != "agency") return res.status(401).send({ error: true, message: "User unauthorized." })

            let agencyJobs = await AgencyJobModel.find({agency: userId})
            let agencyJobsJobIds = agencyJobs.map(e => {
                return e.job
            })
            const job_postings = await JobPosting.find({_id: {$nin: agencyJobsJobIds}}).populate([
                {
                    path: "employer",
                    select: "fname lname email employer_image"
                }
            ]).sort({_id: -1})
    
            return res.status(200).send({
                error: false,
                message: "Job posting list",
                data: job_postings
            })
        } catch (error) {
            next(error);
        }
    },

    // agencyJobDetail: async (req, res, next) => {
    //     try {
    //         let token = req.headers['authorization']?.split(" ")[1];
    //         let {userId, dataModel} = await getUserViaToken(token)
    //         const checkAgency = await Agency.findOne({_id: userId})
    //         if(!checkAgency && dataModel != "agency") return res.status(401).send({ error: true, message: "User unauthorized." })

    //         let agencyJobs = await AgencyJobModel.find({agency: userId})
    //         let agencyJobsJobIds = agencyJobs.map(e => {
    //             return e.job
    //         })

    //         console.log("agencyJobs....",agencyJobs);
    //         const job_postings = await JobPosting.findOne({_id: {$nin: agencyJobsJobIds}}).populate([
    //             {
    //                 path: "employer",
    //                 select: "fname lname email employer_image"
    //             }
    //         ]).sort({_id: -1})
    
    //         return res.status(200).send({
    //             error: false,
    //             message: "Agency job detail list",
    //             data: job_postings
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // },


    detail: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})

            if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not authorized." })

            const job_posting_data = await JobPosting.findOne({_id: req.params.id}).populate([
                {
                    path: "employer",
                    select: "fname lname email employer_image"
                }
            ]);

            const hiringDetail = await HiringDetail.find({job:req.params.id}).populate([
                // {
                //     path: "job",
                //     select: "job_name"
                // },
                {
                    path: "candidate",
                    select: " ",
                    populate:{
                        path:"agency",
                        select:"name corporate_email"
                    }
                }
            ]).select("candidate");
    
            return res.status(200).send({
                error: false,
                message: "Job posting detail",
                data: job_posting_data,
                hiringDetail
            })
        } catch (error) {
            next(error);
        }
    },

    listByEmployer: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
            
            if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not found." })

            const job_postings = await JobPosting.find({employer: userId}).populate([
                {
                    path: "employer",
                    select: "fname lname email employer_image"
                }
            ]).sort({_id: -1});

            let jobIds = job_postings.map(e => e._id.toString());

            console.log({jobIds});

            const CandidateJobData = await CandidateJobModel.find( {emp_job: {$in: jobIds}}).populate([
                {
                    path:"candidate",
                    select:" "
                },
                {
                    path:"agency_id",
                    select:" "
                }
            ]);

            console.log({CandidateJobData})

        
            // const CandidateData = await Candidate.find( {job: {$in: jobIds}}).populate([
            //     {
            //         path:"candidate",
            //         select:" "
            //     },
            //     {
            //         path:"agency_id",
            //         select:" "
            //     },
            //     {
            //         path:"job",
            //         select:" "
            //     }
            // ]);

            //  console.log({CandidateData})

    
            return res.status(200).send({
                error: false,
                message: "Job posting list",
                data: job_postings,
               CandidateJobData
             //  CandidateData
            })
        } catch (error) {
            next(error);
        }
    },

    // addJobPosting: async (req, res, next) => {
    //     try {
    //         let token = req.headers['authorization']?.split(" ")[1];
    //         let {userId, dataModel} = await getUserViaToken(token)
    //         const checkEmployer = await Employer.findOne({_id: userId})
    //         const checkAdmin = await Admin.findOne({_id: userId})
    //         if (
    //             (!checkEmployer || !checkAdmin) &&
    //             !["employers", "admins"].includes(dataModel)
    //         ) return res.status(401).send({ error: true, message: "User unauthorized." })

    //         req.body.employer = checkEmployer ? userId : req.body.employer

    //         if(checkEmployer && req.body.status == 1) {
    //             var userCreditData = await UserCredit.aggregate([
    //                 {
    //                     $match: {employer: mongoose.Types.ObjectId(userId)}
    //                 },
    //                 {
    //                     $project: {
    //                         "employer": "$employer",
    //                         "free_count":{ $ifNull: [ "$free_count", 0 ] },
    //                         "free_used_count":{ $ifNull: [ "$free_used_count", 0 ] },
    //                         "purchased_count":{ $ifNull: [ "$purchased_count", 0 ] },
    //                         "purchased_used_count":{ $ifNull: [ "$purchased_used_count", 0 ] },
    //                         "remainingFreeCount": { $ifNull: [{ $subtract: ["$free_count", "$free_used_count"] }, { $ifNull: [ "$free_count", 0 ] }] },
    //                         "remainingPurchasedCount": { $ifNull: [{ $subtract: ["$purchased_count", "$purchased_used_count"] }, { $ifNull: [ "$purchased_count", 0 ] }] }
    //                     }
    //                 }
    //             ])
                
    //             if(userCreditData.length <= 0 || (userCreditData[0].remainingFreeCount <= 0 && userCreditData[0].remainingPurchasedCount <= 0)) {
    //                 return res.status(400).send({ error: true, message: "You do not have enough credits." })
    //             }

    //         }
            
    //         // Compensation checking
    //         if(Number(req.body.max_compensation) <= Number(req.body.min_compensation)) return res.status(400).send({ error: true, message: "Max compensation should be greater than min compensation." })

    //         // compensation type checking
    //         switch (req.body.compensation_type) {
    //             case "lpa":
    //                 if(Number(req.body.min_compensation) < 1 || Number(req.body.min_compensation) > 98) return res.status(400).send({ error: true, message: "Min compensation should be between 1-98 lpa." })
    //                 if(Number(req.body.max_compensation) < 2 || Number(req.body.max_compensation) > 99) return res.status(400).send({ error: true, message: "Max compensation should be between 2-99 lpa." })
    //                 break;
                
    //             case "inr":
    //                 if(req.body.min_compensation.length < 4 || req.body.min_compensation.length > 7 || req.body.min_compensation.length < 4 || req.body.min_compensation.length > 7) return res.status(400).send({ error: true, message: "Min and Max compensation should be between 1000 - 9999999 INR." })
    //                 break;
            
    //             default:
    //                 break;
    //         }

    //         const jobPosted = await JobPosting.findOne({employer: userId});

    //         var today = new Date();
    //         req.body.expired_on = new Date(new Date().setDate(today.getDate() + (JobPosting ? 30 : 15)));

    //         const jobPostingData = new JobPosting(req.body);
    //         const result = await jobPostingData.save();

    //         console.log("result>>>>",result)
    
    //         if (result) {
    //             let userCreditData2;
    //             if (userCreditData?.length && req.body.status == 1) {
    //                 if(userCreditData[0].remainingFreeCount > 0) {
    //                     userCreditData2 = await UserCredit.findOneAndUpdate({employer: userId}, {$inc: {free_used_count: 1}}, {new: true})
    //                 }
    //                 if(userCreditData[0].remainingPurchasedCount > 0 && userCreditData[0].remainingFreeCount <= 0) {
    //                     userCreditData2 = await UserCredit.findOneAndUpdate({employer: userId}, {$inc: {purchased_used_count: 1}}, {new: true})
    //                 }
                    
    //             }
    //             return res.status(201).send({
    //                 error: false,
    //                 message: "Job posted successfully.",
    //                 data: result,
    //                 credit: userCreditData2
    //             })
    //         }
    //         return res.status(400).send({
    //             error: true,
    //             message: "Job not posted."
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // },


    addJobPosting: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
            const checkAdmin = await Admin.findOne({_id: userId})
            if (
                (!checkEmployer || !checkAdmin) &&
                !["employers", "admins"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." })

            req.body.employer = checkEmployer ? userId : req.body.employer;

           // req.body.job_id = Math.random().toString(36).substr(2, 10);

           function generateIncrementalJobId(prejob) {

            if(prejob == undefined){
                console.log('here1')
                const now = new Date();
                const year = now.getFullYear().toString();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const day = now.getDate().toString().padStart(2, '0');
                return `H2I${day}${month}${year}01`                    //H2IDDMMYYYY01
            }else{
                let currentNumeric = JobList?.job_id;
                let cn = [...currentNumeric];
                let currentNumericPart = cn[cn?.length-2] + cn[cn?.length-1]
                console.log('here2');
                console.log('currentNumericPart',currentNumericPart);
                const now = new Date();
                const year = now.getFullYear().toString();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const day = now.getDate().toString().padStart(2, '0');
            
                // Extract the numeric part (01) and increment it
                // let currentNumericPart = "01";
                currentNumericPart = (parseInt(currentNumericPart, 10) + 1).toString().padStart(2, '0');
            
                // Create the job ID
                const jobId = `H2I${day}${month}${year}${currentNumericPart}`;
            
                return jobId;
            }
            
          };

          let JobList  = await JobPosting.findOne({employer:req.body.employer}).sort({_id:-1});
          console.log({JobList});
          let preJobId = JobList?.job_id;

          console.log({preJobId});

            req.body.job_id = generateIncrementalJobId(preJobId);

            console.log("job_id",req.body.job_id )
            
            let userCreditData = await UserCredit.findOne({employer:userId});
            // console.log({userCreditData})
            // console.log(userCreditData?.purchased_count)
            if(userCreditData?.purchased_count <= 0) {
                return res.status(400).send({ error: true, message: "You do not have enough credits." })
            }
            
            // Compensation checking
            if(Number(req.body.max_compensation) <= Number(req.body.min_compensation)) return res.status(400).send({ error: true, message: "Max compensation should be greater than min compensation." })

            // compensation type checking
            switch (req.body.compensation_type) {
                case "lpa":
                    if(Number(req.body.min_compensation) < 1 || Number(req.body.min_compensation) > 98) return res.status(400).send({ error: true, message: "Min compensation should be between 1-98 lpa." })
                    if(Number(req.body.max_compensation) < 2 || Number(req.body.max_compensation) > 99) return res.status(400).send({ error: true, message: "Max compensation should be between 2-99 lpa." })
                    break;
                
                case "inr":
                    if(req.body.min_compensation.length < 4 || req.body.min_compensation.length > 7 || req.body.min_compensation.length < 4 || req.body.min_compensation.length > 7) return res.status(400).send({ error: true, message: "Min and Max compensation should be between 1000 - 9999999 INR." })
                    break;
            
                default:
                    break;
            }

            const jobPosted = await JobPosting.findOne({employer: userId}).populate([
                {
                    path:"employer",
                    select:"fname lname"
                }
            ]);

            let empFname = jobPosted?.employer?.fname;
            let empLname = jobPosted?.employer?.lname;

            var today = new Date();
            req.body.expired_on = new Date(new Date().setDate(today.getDate() + (JobPosting ? 30 : 15)));

            const jobPostingData = new JobPosting(req.body);
            const result = await jobPostingData.save();


            const AdminData = await Admin.findOne({});

            let adminMail = AdminData?.email;
            let adminName = AdminData?.name
           
            var mailOptions = {
                from: 'info@hire2inspire.com',
                to: adminMail,
                subject: `Hired candidate!`,
                html:`
                <head>
                    <title>Notification: Request for Job Approval</title>
            </head>
            <body>
            <p>
              Dear ${adminName},
            </p>
            <p>
              I hope this message finds you well. I am writing to request your kind attention to the job posting submitted by a employer on our platform. We believe that this job opportunity aligns perfectly with our community's needs, and we kindly request your approval to make it visible to our job seekers.
            </p>
            <p>
              Please let us know if you have any questions or need additional details. We look forward to your positive response.
            </p>
            <p>Find the link 
                <a href="https://hire2inspire-dev.netlify.app/admin/login" target="blank">LogIn</a>
              </p>
            <p>Warm regards,</p>
            <p>${empFname} ${empLname} </p>
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


            if (result) {
                let userCreditData2;
                userCreditData2 = await UserCredit.findOneAndUpdate({employer:userId},{'$inc': { 'purchased_count': -1}},{new:true});

               // console.log({userCreditData2})
                return res.status(201).send({
                    error: false,
                    message: "Job posted successfully.",
                    data: result,
                    credit: userCreditData2
                })
            }
            return res.status(400).send({
                error: true,
                message: "Job not posted."
            })
        } catch (error) {
            next(error);
        }
    },

    detailJobPosting: async (req, res, next) => {
        try {
            // let token = req.headers['authorization']?.split(" ")[1];
            // let {userId, dataModel} = await getUserViaToken(token)
            // const checkEmployer = await Employer.findOne({_id: userId})
            // const checkAgency = await Agency.findOne({_id: userId})
            // const checkRecruiter = await RecruiterModel.findOne({_id: userId})
            // const checkAdmin = await Admin.findOne({_id: userId})

            // if((!checkEmployer || !checkAgency || !checkRecruiter || !checkAdmin) && !["employers", "agency", "recruiters", "admins"].includes(dataModel)) return res.status(400).send({ error: true, message: "User not authorized." })

            const jobPostingData = await JobPosting.findOne({_id: req.params.id}).populate([
                {
                    path: "employer",
                    select: "fname lname email employer_image"
                }
            ]);

            const hiringDetail = await HiringDetail.find({job:req.params.id}).populate([
                {
                    path: "job",
                    select: "job_name"
                },
                {
                    path: "candidate",
                    select: " "
                }
            ]);
    
            if (jobPostingData) {
                return res.status(200).send({
                    error: false,
                    message: "Job detail found!",
                    data: jobPostingData,
                    hiringDetail
                })
            }
            return res.status(400).send({
                error: true,
                message: "Job not found."
            })
        } catch (error) {
            next(error);
        }
    },

    updateJobPosting: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
            const checkAdmin = await Admin.findOne({_id: userId})
            if (
                (!checkEmployer || !checkAdmin) &&
                !["employers", "admins"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." })
            const existingJobPostingData = await JobPosting.findOne({_id: req.params.id});

            if(checkEmployer && req.body.status == 1 && existingJobPostingData.status != 1) {
                var userCreditData = await UserCredit.aggregate([
                    {
                        $match: {employer: mongoose.Types.ObjectId(userId)}
                    },
                    {
                        $project: {
                            "employer": "$employer",
                            "free_count":{ $ifNull: [ "$free_count", 0 ] },
                            "free_used_count":{ $ifNull: [ "$free_used_count", 0 ] },
                            "purchased_count":{ $ifNull: [ "$purchased_count", 0 ] },
                            "purchased_used_count":{ $ifNull: [ "$purchased_used_count", 0 ] },
                            "remainingFreeCount": { $ifNull: [{ $subtract: ["$free_count", "$free_used_count"] }, { $ifNull: [ "$free_count", 0 ] }] },
                            "remainingPurchasedCount": { $ifNull: [{ $subtract: ["$purchased_count", "$purchased_used_count"] }, { $ifNull: [ "$purchased_count", 0 ] }] }
                        }
                    }
                ])
                
                if(userCreditData.length <= 0 || (userCreditData[0].remainingFreeCount <= 0 && userCreditData[0].remainingPurchasedCount <= 0)) {
                    return res.status(400).send({ error: true, message: "You do not have enough credits." })
                }

            }

            // Compensation checking
            if(Number(req.body.max_compensation) <= Number(req.body.min_compensation)) return res.status(400).send({ error: true, message: "Max compensation should be greater than min compensation." })

            // compensation type checking
            switch (req.body.compensation_type) {
                case "lpa":
                    if(Number(req.body.min_compensation) < 1 || Number(req.body.min_compensation) > 98) return res.status(400).send({ error: true, message: "Min compensation should be between 1-98 lpa." })
                    if(Number(req.body.max_compensation) < 2 || Number(req.body.max_compensation) > 99) return res.status(400).send({ error: true, message: "Max compensation should be between 2-99 lpa." })

                    break;
                
                case "inr":
                    if(req.body.min_compensation.length < 4 || req.body.min_compensation.length > 7 || req.body.min_compensation.length < 4 || req.body.min_compensation.length > 7) return res.status(400).send({ error: true, message: "Min and Max compensation should be between 1000 - 9999999 INR." })

                    break;
            
                default:
                    break;
            }

            const jobPostingData = await JobPosting.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    
            if (jobPostingData) {
                let userCreditData2;
                // console.log("data>>>>>",typeof(existingJobPostingData.status))
                if (userCreditData?.length && req.body.status == 1 && existingJobPostingData.status != 1) {
                    if(userCreditData[0].remainingFreeCount > 0) {
                        userCreditData2 = await UserCredit.findOneAndUpdate({employer: userId}, {$inc: {free_used_count: 1}}, {new: true})
                    }
                    if(userCreditData[0].remainingPurchasedCount > 0 && userCreditData[0].remainingFreeCount <= 0) {
                        userCreditData2 = await UserCredit.findOneAndUpdate({employer: userId}, {$inc: {purchased_used_count: 1}}, {new: true})
                    }
                    
                }
                return res.status(200).send({
                    error: false,
                    message: "Job updated successfully.",
                    data: jobPostingData,
                    credit: userCreditData2
                })
            }
            return res.status(400).send({
                error: true,
                message: "Job not updated."
            })
        } catch (error) {
            next(error);
        }
    },

    // invite agencies here (Single invitation)
    inviteAgency: async (req, res, next) => {
        try {  
            // Find recruiter available or not
            const recruiterData = await RecruiterModel.find({agency: req.body.agencyId, status: true})
            if (recruiterData) {
                req.body.recruiter = recruiterData[0]._id;
            }
            req.body.invitation_date = Date.now()

            // Allocate job to a agency here
            const agencyAllocation = await AgencyJobModel.findOneAndUpdate({job: req.body.jobId, agency: req.body.agencyId}, req.body, {upsert: true, new: true})

            if(agencyAllocation) {
                return res.status(201).send({
                    error: false,
                    message: "Agency invited",
                    data: agencyAllocation
                })
            }
            return res.status(400).send({
                error: true,
                message: "Agency invitation failed"
            })

        } catch (error) {
            next(error)
        }
    },

    // Bulk invite agencies here (Bulk invitation)
    inviteAgencies: async (req, res, next) => {
        try {
            let agencies = [];
            agencies = req.body.agencyIds
            let customAgencyJobData = [];
            for(let i = 0; i < agencies.length; i++) {
                // Agency invited or not checking
                const checkInvitationExistence = await AgencyJobModel.findOne({agency: agencies[i], job: req.body.jobId}).populate([
                    {
                        path: "agency",
                        select: "name"
                    }
                ])
                
                // If agency already invited
                if(checkInvitationExistence) return res.status(400).send({error: true, message: `${checkInvitationExistence?.agency?.name} already invited for this job.`})
                
                // If agency not invited
                // Find recruiter available or not
                const recruiterData = await RecruiterModel.find({agency: agencies[i], status: true})
                customAgencyJobData.push({
                    job: req.body.jobId,
                    agency: agencies[i],
                    recruiter: recruiterData.length ? recruiterData[0]._id : undefined,
                    invitation_date: Date.now()
                }) 
            }

            // Allocate job to a agency here
            const agencyAllocationData = await AgencyJobModel.insertMany(customAgencyJobData)
            
            if(agencyAllocationData) {
                return res.status(201).send({
                    error: false,
                    message: "Agencies invited",
                    data: agencyAllocationData
                })
            }
            return res.status(400).send({
                error: true,
                message: "Agency invitation failed"
            })

        } catch (error) {
            next(error)
        }
    },

    // Agency self job assign / decline
    agencySelfJobAssignDecline: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkAgency = await Agency.findOne({_id: userId})
            if(!checkAgency && dataModel != "agency") return res.status(400).send({ error: true, message: "Agency not found." })

            let customAgencyJobData = [];
            // Agency invited or not checking
            const checkInvitationExistence = await AgencyJobModel.findOne({agency: userId, job: req.body.jobId, status: req.body.status}).populate([
                {
                    path: "agency",
                    select: "name"
                }
            ])
            
            // If agency already invited
            if(checkInvitationExistence) return res.status(400).send({error: true, message: `${checkInvitationExistence?.agency?.name} already assigned for this job.`})
            
            // If agency not invited
            // Find recruiter available or not
            const recruiterData = await RecruiterModel.find({agency: userId, status: true})
            customAgencyJobData.push({
                job: req.body.jobId,
                agency: userId,
                recruiter: recruiterData.length ? recruiterData[0]._id : undefined,
                invitation_date: Date.now()
            }) 

            // Allocate job to a agency here
            const agencyJobData = await AgencyJobModel.findOneAndUpdate({agency: userId, job: req.body.jobId}, {status: req.body.status}, {upsert: true, new: true})

            let agencyJobs = await AgencyJobModel.find({agency: userId})
            let agencyJobsJobIds = agencyJobs.map(e => {
                return e.job
            })
            const job_postings = await JobPosting.find({_id: {$nin: agencyJobsJobIds}}).populate([
                {
                    path: "employer",
                    select: "fname lname email employer_image"
                }
            ]).sort({_id: -1})
    
            
            if(agencyJobData) {
                return res.status(201).send({
                    error: false,
                    message: `Success`,
                    data: agencyJobData,
                    jobs: job_postings
                })
            }
            return res.status(400).send({
                error: true,
                message: "Agency job assign/decline failed"
            })

        } catch (error) {
            next(error)
        }
    },

    // add hiring details
    hiringDetail: async (req, res, next) => {
        try {
            const hiringDetailsData = new HiringDetail(req.body)
            const result = await hiringDetailsData.save();

            hiringList = await HiringDetail.findOne({_id:result?._id}).populate([
                {
                    path:"job",
                    select:"job_name"
                },
                {
                    path:"candidate",
                    select:"fname lname"
                }
            ]);

            let candidateFname = hiringList?.candidate?.fname;
            let candidateLname = hiringList?.candidate?.lname;
            let jobRole = hiringList?.job?.job_name;
            let compName = hiringList?.comp_name;


          //  console.log("id>>>",result?.offerd_detail[0]?.candidate);

            const candidateData = await Candidate.findOneAndUpdate({_id:result?.candidate},{is_hired:true},{new:true}).populate([
                {
                    path:"agency",
                    select:"first_name last_name"
                }
            ]);

            const jobData = await JobPosting.findOneAndUpdate({_id:result?.job},{ '$inc': { 'no_of_opening': -1 }, },{new:true});

            if(jobData?.no_of_opening == 0){
                const jobUpdate = await JobPosting.findOneAndUpdate({_id:result?.job},{status:"4"},{new:true});
            };

            if(hiringList){
                const jobData = await JobPosting.findOneAndUpdate({_id:result?.job},{ '$inc': { 'hired_count': 1 }, },{new:true});
            };
            

            let agencyId = candidateData?.agency?._id;
            //console.log("agency>>>>",agency)

            const agengydata = await Agency.findOne({_id:agencyId});
            //console.log("agengydata>>>>",agengydata)

            let agencyMail = agengydata?.corporate_email;
           // console.log("agencyMail>>>>",agencyMail)

            let agencyName = agengydata?.name;

            console.log("agencyName>>>>",agencyName)
            


            var mailOptions = {
                from: 'info@hire2inspire.com',
                to: agencyMail,
                subject: `Hired candidate!`,
                html:`
                <head>
                    <title>Notification: Candidate Hired - Backend Development Position</title>
            </head>
            <body>
                <p>Dear ${agencyName},</p>
                <p>I hope this email finds you well. We are writing to formally notify you that the candidate you submitted for the Backend Development position has been successfully hired for the role.</p>
                <p>After a thorough evaluation of the candidate's qualifications, skills, and experience, we are pleased to inform you that they have met our requirements and are an excellent fit for our team. We were particularly impressed with their expertise in [mention specific skills or technologies], which we believe will greatly contribute to our projects and initiatives.</p>
                <p>We appreciate the effort you put into identifying and presenting this candidate to us. Your support throughout the recruitment process has been instrumental in helping us find the right candidate for our team.</p>
                <p>At this point, we kindly request your assistance in initiating the necessary steps to finalize the onboarding process for the candidate. This includes coordinating any remaining paperwork, sharing important company information, and facilitating a smooth transition into their new role.</p>
                <p>Once again, we extend our gratitude for your collaboration and for connecting us with such a promising candidate. We look forward to future opportunities to work together.</p>
                <p>If you have any further questions or require additional information, please feel free to reach out to us. We value our partnership and appreciate your prompt attention to this matter.</p>
                <p>Thank you and best regards,</p>
                <p> Hire2Inspire </p>
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

            let sendNotificationData = await sendNotification({
                user: agencyId,
                title: "Candidate Hired",
                description: `${candidateFname} ${candidateLname} got a job offer from ${compName} as ${jobRole}`
            });

            console.log("sendNotificationData",sendNotificationData)
    


            return res.status(200).send({
                error: false,
                message: "Hiring Detail",
                data: result,
                candidateData
            })
        } catch (error) {
            next(error)
        }
    },

    updateStatus: async(req, res, next) => {
        try{
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
            const checkAdmin = await Admin.findOne({_id: userId})
            if (
                (!checkEmployer || !checkAdmin) &&
                !["employers", "admins"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." });

            const jobData = await JobPosting.findOneAndUpdate({_id:req.params.id},req.body,{new:true});

            if(jobData) {
                return res.status(201).send({
                    error: false,
                    message: "Hired status update",
                    data: jobData
                })
            }
            return res.status(400).send({
                error: true,
                message: "Hired status failed"
            })

        }catch(error){
            next(error)
        }
    },


    deleteStatus: async(req, res, next) => {
        try{
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
            const checkAdmin = await Admin.findOne({_id: userId})
            if (
                (!checkEmployer || !checkAdmin) &&
                !["employers", "admins"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." });

            const jobData = await JobPosting.findOneAndUpdate({_id:req.params.id},{is_deleted:true},{new:true});

            if(jobData) {
                return res.status(201).send({
                    error: false,
                    message: "Hired status update",
                    data: jobData
                })
            }
            return res.status(400).send({
                error: true,
                message: "Hired status failed"
            })

        }catch(error){
            next(error)
        }
    },



    agencyList: async(req, res, next) =>{
        try{
            let agencyJobData = await AgencyJobModel.find({job:req.params.id});
            let agencyIds = agencyJobData.map(e => e.agency.toString());

          //  console.log("agencyIds",agencyIds)

            let agencyList = await Agency.find({_id: {$in: agencyIds}});

            return res.status(200).send({
                error: false,
                message: "Agency list",
                data: agencyList
            })
        }catch(error){
            next(error)
        }
    },


    // Assign recruiter to a job
    assignRecruiter: async (req, res, next) => {
        try {
            // Assign
        } catch (error) {
            next(error)
        }
    },

    addJobPostingData: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
            const checkAdmin = await Admin.findOne({_id: userId})
            if (
                (!checkEmployer || !checkAdmin) &&
                !["employers", "admins"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." })

            req.body.employer = checkEmployer ? userId : req.body.employer

            if(checkEmployer && req.body.status == 1) {
                var userCreditData = await UserCredit.aggregate([
                    {
                        $match: {employer: mongoose.Types.ObjectId(userId)}
                    },
                    {
                        $project: {
                            "employer": "$employer",
                            "free_count":{ $ifNull: [ "$free_count", 0 ] },
                            "free_used_count":{ $ifNull: [ "$free_used_count", 0 ] },
                            "purchased_count":{ $ifNull: [ "$purchased_count", 0 ] },
                            "purchased_used_count":{ $ifNull: [ "$purchased_used_count", 0 ] },
                            "remainingFreeCount": { $ifNull: [{ $subtract: ["$free_count", "$free_used_count"] }, { $ifNull: [ "$free_count", 0 ] }] },
                            "remainingPurchasedCount": { $ifNull: [{ $subtract: ["$purchased_count", "$purchased_used_count"] }, { $ifNull: [ "$purchased_count", 0 ] }] }
                        }
                    }
                ])
                
                if(userCreditData.length <= 0 || (userCreditData[0].remainingFreeCount <= 0 && userCreditData[0].remainingPurchasedCount <= 0)) {
                    return res.status(400).send({ error: true, message: "You do not have enough credits." })
                }

            }
            
            // Compensation checking
            if(Number(req.body.max_compensation) <= Number(req.body.min_compensation)) return res.status(400).send({ error: true, message: "Max compensation should be greater than min compensation." })

            // compensation type checking
            switch (req.body.compensation_type) {
                case "lpa":
                    if(Number(req.body.min_compensation) < 1 || Number(req.body.min_compensation) > 98) return res.status(400).send({ error: true, message: "Min compensation should be between 1-98 lpa." })
                    if(Number(req.body.max_compensation) < 2 || Number(req.body.max_compensation) > 99) return res.status(400).send({ error: true, message: "Max compensation should be between 2-99 lpa." })
                    break;
                
                case "inr":
                    if(req.body.min_compensation.length < 4 || req.body.min_compensation.length > 7 || req.body.min_compensation.length < 4 || req.body.min_compensation.length > 7) return res.status(400).send({ error: true, message: "Min and Max compensation should be between 1000 - 9999999 INR." })
                    break;
            
                default:
                    break;
            }

            const jobPosted = await JobPosting.findOne({employer: userId});

            var today = new Date();
            req.body.expired_on = new Date(new Date().setDate(today.getDate() + (JobPosting ? 30 : 15)));

            const jobPostingData = new JobPosting(req.body);
            const result = await jobPostingData.save();

            console.log("result>>>>",result)
    
            if (result) {
                let userCreditData2;
                if (userCreditData?.length && req.body.status == 1) {
                    if(userCreditData[0].remainingFreeCount > 0) {
                        userCreditData2 = await UserCredit.findOneAndUpdate({employer: userId}, {$inc: {free_used_count: 1}}, {new: true})
                    }
                    if(userCreditData[0].remainingPurchasedCount > 0 && userCreditData[0].remainingFreeCount <= 0) {
                        userCreditData2 = await UserCredit.findOneAndUpdate({employer: userId}, {$inc: {purchased_used_count: 1}}, {new: true})
                    }
                    
                }
                return res.status(201).send({
                    error: false,
                    message: "Job posted successfully.",
                    data: result,
                    credit: userCreditData2
                })
            }
            return res.status(400).send({
                error: true,
                message: "Job not posted."
            })
        } catch (error) {
            next(error);
        }
    },

    

    // Agency job update
    agencyJobUpdate: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkAgency = await Agency.findOne({_id: userId})
            if(!checkAgency && dataModel != "agency") return res.status(400).send({ error: true, message: "Agency not found." })

            const jobUpdata = await JobPosting.findOneAndUpdate({_id:req.params.job},{is_decline:req.body.is_decline},{new:true});

            console.log("jobUpdata",jobUpdata)

            
            if(jobUpdata) {
                return res.status(201).send({
                    error: false,
                    message: `Success`,
                    data: jobUpdata
                })
            }
            return res.status(400).send({
                error: true,
                message: "Agency job assign/decline failed"
            })

        } catch (error) {
            next(error)
        }
    },

}