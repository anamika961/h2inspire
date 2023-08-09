const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const paymentSchema = mongoose.Schema({
    // employer:{
    //     type:ObjectId,
    //     ref: 'employers',
    // },
    // amount:{
    //     type:Number
    // },
    // currency:{
    //     type:String
    // },
    // receipt:{
    //     type:String
    // },
    // orderId:{
    //     type:String
    // }

    orderCreationId:{
        type:String
    },
    razorpayPaymentId:{
        type:String
    },
    razorpayOrderId:{
        type:String
    },
    razorpaySignature:{
        type:String
    }
    
}, {timestamps: true});



module.exports = mongoose.model("payments", paymentSchema);