const mongoose = require("mongoose");

const getInTouchSchema = mongoose.Schema({
    name: {
        type:String
    },
    emailId: {
        type: String
    },
    subject:{
        type:String
    },
    query:{
        type:String
    }
}, {timestamps: true});

module.exports = mongoose.model("getInTouch", getInTouchSchema);