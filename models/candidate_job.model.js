const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const CandidateJobSchema = mongoose.Schema({
    emp_job :{
        type: ObjectId,
        ref: 'job_postings'
    },
    candidate : {
            type: ObjectId,
            ref: 'candidates'
    },
    request:{
        type: String,
        enum: {
            values: [0,1,2],
            message: "only 0:(pending)/1:(accepted)/2:(rejected) allowed.",
            default: 0
        },
    }
    

}, {timestamps: true});



module.exports = mongoose.model("candidatejobs", CandidateJobSchema);
