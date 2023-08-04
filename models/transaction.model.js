const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const transactionSchema = mongoose.Schema({
    billing_id:{
        type:ObjectId,
        ref: 'billings',
    },
    // hiring_id:{
    //     type:ObjectId,
    //     ref: 'hiringDetails',
    // },
    employer:{
        type:ObjectId,
        ref: 'employers',
    },
    candidate:{
        type:ObjectId,
        ref: 'candidates',
    },
    desg:{
        type:String
    },
    agency:{
        type:ObjectId,
        ref: 'agencies',
    },
    passbook_amt:[{
        amount:{
            type:Number
        },
        type:{
            type:String,
            enum:{
                values:["payble","paid"],
                message:'please select between -credit/debit'
            }
        }
   }],
    total_amount:{
        type:Number
    }
}, {timestamps: true});



module.exports = mongoose.model("transactions", transactionSchema);