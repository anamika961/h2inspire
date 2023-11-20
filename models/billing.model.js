const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const billingSchema = mongoose.Schema({
    hire_id:{
        type:ObjectId,
        ref: 'hiringDetails',
    },
    employer:{
        type:ObjectId,
        ref: 'employers',
    },
    name:{
        type:String
    },
    address: {
        type: String
    },
    ph_no:{
        type: Number
    },
    gst_no:{
        type:String
    },
    email:{
        type:String
    },
    invoice:{
        type:Array
    },
    supply_code:{
        type:String
    },
    // status:{
    //     type:Boolean,
    //     default:true
    // }
    

}, {timestamps: true});



module.exports = mongoose.model("billings", billingSchema);