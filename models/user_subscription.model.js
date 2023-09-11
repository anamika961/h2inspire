const mongoose = require("mongoose");

const UserSubscriptionSchema = mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employers",
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "packages",
        required: true
    },
    quantity:{
        type:Number
    },
    total_amount:{
        type:Number
    },
    status:{
        type:Boolean,
        default:false
    }
}, {timestamps: true});

module.exports = mongoose.model("user_subscription", UserSubscriptionSchema);