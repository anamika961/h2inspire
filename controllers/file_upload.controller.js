const mongoose = require("mongoose");
const path = require('path')
var admin = require("firebase-admin");
var serviceAccount = require("../hire2inspire-firebase-adminsdk.json");
const express = require('express')
const app = express()
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.BUCKET_URL
}, "default");
app.locals.bucket = admin.storage().bucket()

const csv = require('csv-parser');
const fs = require('fs');
const Candidate = require("../models/candidate.model");
const AgencyJobModel = require("../models/agency_job.model");
const Agency = require("../models/agency.model");
const { getUserViaToken } = require("../helpers/jwt_helper");
const Recruiter = require("../models/recruiter.model");
const CandidateJobModel = require('../models/candidate_job.model');

module.exports = {
    /**
     * Basic file upload
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    upload: async (req, res, next) => {
        try {
            const fileName = `HIRE2INSPIRE_${Date.now()}_${req.file.originalname}`;
            const fileData = await app.locals.bucket.file(fileName).createWriteStream().end(req.file.buffer);
            
            fileurl = `https://firebasestorage.googleapis.com/v0/b/hire2inspire-62f96.appspot.com/o/${fileName}?alt=media`;
            
            res.status(200).send({
                error: false,
                // data: {file: req.file, fileData, fileName, fileurl}
                data: {fileName, fileurl}
            });
        } catch (error) {
            next(error)
        }
    },

    /**
     * This method is used import CSV file to database
     */
    // saveCsvToDB: async(req, res, next) => {
    //     try {
    //         let token = req.headers["authorization"]?.split(" ")[1];
    //         let { userId, dataModel } = await getUserViaToken(token);
    //         const checkAgency = await Agency.findOne({ _id: userId });
    //         const checkRecruiter = await Recruiter.findOne({ _id: userId });
    //         if (
    //             (!checkAgency || !checkRecruiter) &&
    //             !["agency", "recruiters"].includes(dataModel)
    //         ) return res.status(401).send({ error: true, message: "User unauthorized." })

    //         const results = [];
    //         if(!req?.file || req.file?.mimetype != 'text/csv') return res.status(400).send({error: true, message: "Only CSV file is allowed to upload."})

    //         const fileName = `HIRE2INSPIRE_${Date.now()}_${req.file.originalname}`
    //         fs.writeFile(fileName, Buffer.from(req.file.buffer, req.file.encoding).toString(), (err) => {
    //             if(err) return res.status(400).send({error: true, 'message': String(err)});
    //         });

    //         const agencyJobDetail = await AgencyJobModel.findOne({_id: req.body.agency_job})

    //         fs.createReadStream(fileName, 'utf8')
    //         .pipe(csv({}))
    //         .on('data',(data) => results.push(data))
    //         .on('end', async() => {
    //             let resp;
    //             if (req.params.csvType == 'bulk-candidate') {
    //               //  console.log("ajob", req.body.agency_job)
    //                 results.map((e)=>{
    //                     e.agency_job = req.body.agency_job;
    //                 })
                    
    //                 // results.map(e => {
    //                 //     // e.agency_job = req.body.agency_job;
    //                 //     // e.agency = agencyJobDetail?.agency || undefined;
    //                 //     // e.job = agencyJobDetail?.job || undefined;
    //                 //     // e.recruiter = checkRecruiter?._id || undefined;

    //                 //     // e.must_have_qualification_q_a = [];
    //                 //     // e.must_have_qualification_questions = e.must_have_qualification_questions.split("|").map(e1 => e1.trim())
    //                 //     // e.must_have_qualification_answers = e.must_have_qualification_answers.split("|").map(e => e.trim())
    //                 //     // e.must_have_qualification_questions.forEach((ele, index) => {
    //                 //     //     e.must_have_qualification_q_a.push({
    //                 //     //         question: ele,
    //                 //     //         answer: e.must_have_qualification_answers[index]
    //                 //     //     })
    //                 //     // })
    //                 //     // e.must_have_qualification_answers = undefined
    //                 //     // e.must_have_qualification_questions = undefined

    //                 //     return e;
    //                 // })
                    
    //                 // removing temporary CSV file
    //                 fs.unlink(fileName, (err) => {
    //                     if (err) {
    //                         console.error(err)
    //                         next(err)
    //                     }
    //                 })
                   

    //                 // const checkdata = await Candidate.findOne({
    //                 //     $and: [
    //                 //         { agency_job: req.body.agency_job },
    //                 //         { 
    //                 //             email: {
    //                 //                 $in: emails
    //                 //             }
    //                 //         },
    //                 //         {
    //                 //             phone: {
    //                 //                 $in: phones
    //                 //             }
    //                 //         },
    //                 //     ]
    //                 // })
    //                // console.log({results})
                   
    //                let candidateExist ;
    //                let candidateExist1;

    //                 for(let i = 0 ; i<results.length ; i++){
    //                     // console.log(results[i]?.email)
    //                     candidateExist = await Candidate.findOne({$and:[{email:results[i]?.email},{agency_job:req.body.agency_job}]});
    //                     candidateExist1 = await Candidate.findOne({$and:[{phone:results[i]?.phone},{agency_job:req.body.agency_job}]});
    //                 }

    //                // console.log(candidateExist,"res")
    //                 // console.log(candidateExist?.agency_job)
    //                 // console.log(req.body.agency_job)

                
    //                 // const candidateExist = await Candidate.findOne({email:e.email});
    //                 // console.log(candidateExist)
    //                 // // const candidateExist1 = await Candidate.findOne({phone:req.body.phone});
    //                 // // console.log(candidateExist)

    //                 if(candidateExist){
    //                     console.log('in..')
    //                     return res.status(400).send({ error: true, message: `Candidate data already exist with this email ${candidateExist?.email}` })
    //                 }
    //                 else if(candidateExist1){
    //                     return res.status(400).send({ error: true, message: `Candidate data already exist with this phone no ${candidateExist1?.phone}` })
    //                 }
    //                 // if(checkdata) return res.status(400).send({error: true, message: `Candidate already exist`})

    //                 // Candidate log CSV Uppload 
    //                 resp = await Candidate.insertMany(results);
    //                 const candidateIds = resp.map( e => e._id );

    //                 console.log("resp",resp)

    //                 for(let i in resp){
    //                     req.body.emp_job = resp[i]?.job?._id;
    //                     req.body.agency_id = resp[i]?.agency?._id;
    //                     req.body.candidate = resp[i]?._id;
    //                     console.log("resp",resp[i]?.agency?._id)
    //                 };

    //                 conadidateJobData = await CandidateJobModel.insertMany(req.body);

    //                 console.log({conadidateJobData})

    //                 const agencyJobUpdate = await AgencyJobModel.findOneAndUpdate({_id: req.body.agency_job}, {$push: {candidates: candidateIds}}, {new: true})
    //                 // console.log("agencyJobUpdate >>> ", agencyJobUpdate);

    //             } else {
    //                 return res.status(400).send({
    //                     error: true, 
    //                     message: `${req.params.csvType} type not valid one. Use (bulk-candidate / single-candidate)`
    //                 })
    //             }

    //             return res.status(201).send({
    //                 error: false, 
    //                 message: `${req.params.csvType} Data stored`, 
    //                 data: results
    //             })
    //         })
    //     } catch (error) {
    //         // throw error
    //         res.status(200).send({
    //             error: true,
    //             message: String(error)
    //         });
    //     }
    // },


    saveCsvToDB: async(req, res, next) => {
        try {
            let token = req.headers["authorization"]?.split(" ")[1];
            let { userId, dataModel } = await getUserViaToken(token);
            const checkAgency = await Agency.findOne({ _id: userId });
            const checkRecruiter = await Recruiter.findOne({ _id: userId });
            if (
                (!checkAgency || !checkRecruiter) &&
                !["agency", "recruiters"].includes(dataModel)
            ) return res.status(401).send({ error: true, message: "User unauthorized." })

            const results = [];
            if(!req?.file || req.file?.mimetype != 'text/csv') return res.status(400).send({error: true, message: "Only CSV file is allowed to upload."})

            const fileName = `HIRE2INSPIRE_${Date.now()}_${req.file.originalname}`
            fs.writeFile(fileName, Buffer.from(req.file.buffer, req.file.encoding).toString(), (err) => {
                if(err) return res.status(400).send({error: true, 'message': String(err)});
            });

            const agencyJobDetail = await AgencyJobModel.findOne({_id: req.body.agency_job})

            fs.createReadStream(fileName, 'utf8')
            .pipe(csv({}))
            .on('data',(data) => results.push(data))
            .on('end', async() => {
                let resp;
                if (req.params.csvType == 'bulk-candidate') {
                   console.log("ajob", req.body.agency_job)
                    results.map((e)=>{
                        e.agency_job = req.body.agency_job;
                        e.job = req.body.job;
                        e.agency = req.body.agency;
                    });

                    console.log({results})
                    
                    
                    // removing temporary CSV file
                    fs.unlink(fileName, (err) => {
                        if (err) {
                            console.error(err)
                            next(err)
                        }
                    })
                   
                   
                   let candidateExist ;
                   let candidateExist1;

                    for(let i = 0 ; i<results.length ; i++){
                        candidateExist = await Candidate.findOne({$and:[{email:results[i]?.email},{agency_job:req.body.agency_job}]});
                        candidateExist1 = await Candidate.findOne({$and:[{phone:results[i]?.phone},{agency_job:req.body.agency_job}]});
                    }


                    if(candidateExist){
                        console.log('in..')
                        return res.status(400).send({ error: true, message: `Candidate data already exist with this email ${candidateExist?.email}` })
                    }
                    else if(candidateExist1){
                        return res.status(400).send({ error: true, message: `Candidate data already exist with this phone no ${candidateExist1?.phone}` })
                    }
                   

                    // Candidate log CSV Uppload 
                    resp = await Candidate.insertMany(results);
                    const candidateIds = resp.map( e => e._id );

                   // console.log("candidateIds",candidateIds)

                    for(let i in resp){
                        req.body.emp_job = resp[i]?.job?._id;
                        req.body.agency_id = resp[i]?.agency?._id;
                        req.body.candidate = resp[i]?._id;
                       // console.log("resp",resp[i]?.agency?._id);

                        const candidateJobData = new CandidateJobModel(req.body);
                        const condidateJobdatalist = await candidateJobData.save();
                    };


                    const agencyJobUpdate = await AgencyJobModel.findOneAndUpdate({_id: req.body.agency_job}, {$push: {candidates: candidateIds}}, {new: true})

                } else {
                    return res.status(400).send({
                        error: true, 
                        message: `${req.params.csvType} type not valid one. Use (bulk-candidate / single-candidate)`
                    })
                }

                return res.status(201).send({
                    error: false, 
                    message: `${req.params.csvType} Data stored`, 
                    data: results
                })
            })
        } catch (error) {
            // throw error
            res.status(200).send({
                error: true,
                message: String(error)
            });
        }
    }
}