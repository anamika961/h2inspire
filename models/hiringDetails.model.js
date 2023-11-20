const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const HiringDetailSchema = mongoose.Schema({
    employer: {
        type: ObjectId,
        ref: 'employers',
    },
    job:{
        type:ObjectId,
        ref: 'job_postings',
    },
    candidate:{
        type:ObjectId,
        ref: 'candidates',
    },
    desg_offered :{
        type:String
    },
    comp_offered : {
        type: Number
    },
    date_of_joining:{
        type: Date
    },
    work_location:{
        type:String
    },
    comp_name:{
        type:String
    }
    

}, {timestamps: true});



module.exports = mongoose.model("hiringDetails", HiringDetailSchema);