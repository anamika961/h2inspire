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
                    
                    results.map(e => {
                        e.agency_job = req.body.agency_job;
                        e.agency = agencyJobDetail?.agency || undefined;
                        e.job = agencyJobDetail?.job || undefined;
                        e.recruiter = checkRecruiter?._id || undefined;

                        e.must_have_qualification_q_a = [];
                        e.must_have_qualification_questions = e.must_have_qualification_questions.split("|").map(e1 => e1.trim())
                        e.must_have_qualification_answers = e.must_have_qualification_answers.split("|").map(e => e.trim())
                        e.must_have_qualification_questions.forEach((ele, index) => {
                            e.must_have_qualification_q_a.push({
                                question: ele,
                                answer: e.must_have_qualification_answers[index]
                            })
                        })
                        e.must_have_qualification_answers = undefined
                        e.must_have_qualification_questions = undefined

                        return e
                    })
                    
                    // removing temporary CSV file
                    fs.unlink(fileName, (err) => {
                        if (err) {
                            console.error(err)
                            next(err)
                        }
                    })
                    const emails = results.map(e => e.email)
                    const phones = results.map(e => e.phone)

                    const checkdata = await Candidate.findOne({
                        $and: [
                            { agency_job: req.body.agency_job },
                            { 
                                email: {
                                    $in: emails
                                }
                            },
                            {
                                phone: {
                                    $in: phones
                                }
                            },
                        ]
                    })
                    if(checkdata) return res.status(400).send({error: true, message: `Candidate already exist`})

                    // Candidate log CSV Uppload 
                    resp = await Candidate.insertMany(results);
                    const candidateIds = resp.map( e => e._id )
                    const agencyJobUpdate = await AgencyJobModel.findOneAndUpdate({_id: req.body.agency_job}, {$push: {candidates: candidateIds}}, {new: true})
                    // console.log("agencyJobUpdate >>> ", agencyJobUpdate);

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