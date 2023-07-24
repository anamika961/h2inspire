const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const CandidateJobSchema = mongoose.Schema({
    emp_job :{
        type: ObjectId,
        ref: 'job_postings'
    },
    candidate :[
        {
            type: ObjectId,
            ref: 'candidates'
        }
    ]

}, {timestamps: true});



module.exports = mongoose.model("candidatejobs", CandidateJobSchema);
