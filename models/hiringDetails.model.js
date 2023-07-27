const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const HiringDetailSchema = mongoose.Schema({
    job:{
        type:ObjectId,
        ref: 'job_postings',

    },
    desg_offered :{
        type:String
    },
    comp_offered : {
        type: String
    },
    date_of_joining:{
        type: Date
    },
    work_location:{
        type:String
    },
    comp_name:{
        type:String
    },
    candidate:[
        {
            type:ObjectId,
            ref: 'candidates',
    
        }
    ]
    

}, {timestamps: true});



module.exports = mongoose.model("hiringDetails", HiringDetailSchema);