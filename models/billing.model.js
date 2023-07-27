const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const billingSchema = mongoose.Schema({
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
        type: Date
    },
    gst_no:{
        type:String
    },
    email:{
        type:String
    },
    invoice:{
        type:Array
    }
    

}, {timestamps: true});



module.exports = mongoose.model("billings", billingSchema);