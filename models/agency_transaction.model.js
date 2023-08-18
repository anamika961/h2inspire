const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const agencyTransactionSchema = mongoose.Schema({
    // billing_id:{
    //     type:ObjectId,
    //     ref: 'billings',
    // },
    // hiring_id:{
    //     type:ObjectId,
    //     ref: 'hiringDetails',
    // },
    // candidate:{
    //     type:ObjectId,
    //     ref: 'candidates',
    // },
    // desg:{
    //     type:String
    // },
    // agency:{
    //     type:ObjectId,
    //     ref: 'agencies',
    // },

    agency:{
        type:ObjectId,
        ref: 'agencies',
    },
    passbook_amt:[{
        transaction_id:{
            type:String
        },
        amount:{
            type:Number
        },
        type:{
            type:String,
            enum:{
                values:["payble","paid"],
                message:'please select between -credit/debit'
            }
        },
        candidate:{
            type:ObjectId,
            ref: 'candidates',
        },
        desg:{
            type:String
        },
        employer:{
            type:ObjectId,
            ref: 'employers',
        },
        invoice_file:{
            type:String
        },
        billing_id:{
            type:ObjectId,
            ref: 'billings',
        },
        invoice_No:{
            type:String
        },
   }],
    total_amount:{
        type:Number
    },

}, {timestamps: true});



module.exports = mongoose.model("agencytransactions", agencyTransactionSchema);