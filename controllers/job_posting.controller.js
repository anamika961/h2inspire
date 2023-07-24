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
            const job_posting_data = await JobPosting.findOne({_id: req.params.id}).populate([
                {
                    path: "employer",
                    select: "fname lname email employer_image"
                }
            ]).sort({_id: -1})
    
            return res.status(200).send({
                error: false,
                message: "Job posting detail",
                data: job_posting_data
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

            const CandidateJobData = await CandidateJobModel.find( {emp_job: {$in: jobIds}})

        

            return res.status(200).send({
                error: false,
                message: "Job posting list",
                data: job_postings,
                CandidateJobData
            })
        } catch (error) {
            next(error);
        }
    },

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
    
            if (result) {
                let userCreditData2;
                if (userCreditData.length && req.body.status == 1) {
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

    detailJobPosting: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
            const checkAgency = await Agency.findOne({_id: userId})
            const checkRecruiter = await RecruiterModel.findOne({_id: userId})
            const checkAdmin = await Admin.findOne({_id: userId})

            if((!checkEmployer || !checkAgency || !checkRecruiter || !checkAdmin) && !["employers", "agency", "recruiters", "admins"].includes(dataModel)) return res.status(400).send({ error: true, message: "User not authorized." })

            const jobPostingData = await JobPosting.findOne({_id: req.params.id}).populate([
                {
                    path: "employer",
                    select: "fname lname email employer_image"
                }
            ]);
    
            if (jobPostingData) {
                return res.status(200).send({
                    error: false,
                    message: "Job detail found!",
                    data: jobPostingData
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

    // Assign recruiter to a job
    assignRecruiter: async (req, res, next) => {
        try {
            // Assign
        } catch (error) {
            next(error)
        }
    }
}