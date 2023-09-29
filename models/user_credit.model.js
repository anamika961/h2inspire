const mongoose = require("mongoose");

const UserCreditSchema = mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employers"
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "packages",
       // required: true
    },
    // free_count: {
    //     type: Number,
    //     default: 0,
    //     required: true
    // },
    purchased_count: {
        type: Number,
        default: 0,
        required: true
    },
    // free_used_count: {
    //     type: Number,
    //     default: 0
    // },
    // purchased_used_count: {
    //     type: Number,
    //     default: 0
    // }
}, {timestamps: true});

module.exports = mongoose.model("user_credits", UserCreditSchema);

