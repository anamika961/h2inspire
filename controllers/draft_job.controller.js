const mongoose = require("mongoose");
const { getUserViaToken, verifyAccessToken } = require("../helpers/jwt_helper");
const Employer = require("../models/employer.model");
const DraftJob = require("../models/draft_job.model");

module.exports = {
    alllist: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
            if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not found." })

            const job_data = await DraftJob.find({employer:userId}).sort({_id:-1});
    
            return res.status(200).send({
                error: false,
                message: "Draft job list",
                data: job_data
            })
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkEmployer = await Employer.findOne({_id: userId})
           // const checkAdmin = await Admin.findOne({_id: userId})
            if (
                (!checkEmployer) &&
                !["employers"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." })

            req.body.employer = checkEmployer ? userId : req.body.employer

            const job_data = new DraftJob(req.body)
            const result = await job_data.save();

            console.log("result...",result);
    
            return res.status(200).send({
                error: false,
                message: "job saved as draft",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    detailJob: async (req, res, next) => {
        try {
            const job_data = await DraftJob.findOne({_id:req.params.id});
    
            return res.status(200).send({
                error: false,
                message: "Draft job detail",
                data: job_data
            })
        } catch (error) {
            next(error);
        }
    },
    


update: async (req, res, next) => {
    try {
        const job_data = await DraftJob.findOneAndUpdate({_id:req.params.id},req.body,{new:true});

        if(!job_data) return res.status(200).send({ error: false, message: "Draft job not updated" })

        return res.status(200).send({
            error: false,
            message: "Draft job update",
            data: job_data
        })
    } catch (error) {
        next(error);
    }
},

delete: async (req, res, next) => {
    try {
        const draftJobData = await DraftJob.deleteOne({_id:req.params.id});

        if(draftJobData.deletedCount == 1){
            message = {
				error: false,
				message: "Draft job deleted successfully!",
			};
			res.status(200).send(message);
        }else{
            message = {
				error: true,
				message: "Operation failed!",
			};
			res.status(200).send(message);
        }

        // return res.status(200).send({
        //     error: false,
        //     message: "Draft job update",
        //     data: job_data
        // })
    } catch (error) {
        next(error);
    }
},



}

