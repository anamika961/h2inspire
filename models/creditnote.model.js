const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const CreditNoteSchema = mongoose.Schema({
    billingId:{
        type:ObjectId,
        ref: 'billings',
    },
    // hiringId:{
    //     type:ObjectId,
    //     ref: 'hiringDetails',
    // },
    backOut_date:{
        type:Date
    },
    amount:{
        type:Number
    }  

}, {timestamps: true});



module.exports = mongoose.model("creditnotes", CreditNoteSchema);