const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
const AgencyJobSchema = mongoose.Schema({
    job: {
        type: ObjectId, 
        ref: 'job_postings',
        required: true
    },
    agency: {
        type: ObjectId, 
        ref: 'agencies',
        required: true
    },
    recruiter: {
        type: ObjectId,
        ref: 'recruiters'
    },
    invitation_date: {
        type: Date
    },
    status: {
        type: String,
        enum: {
            values: [0,1,2,3],
            message: "only 0:(yet to accept)/1:(work-on)/2:(declined)/3:(archived) allowed."
        },
        default: 0,
        required: true
    },
    accepted_on: {
        type: Date
    },
    candidates: [
        {
            type: ObjectId,
            ref: 'candidates'
        }
    ],
    is_decline:{
        type:Boolean,
        default:false
    }
}, {timestamps: true});



module.exports = mongoose.model("agency_jobs", AgencyJobSchema);
