const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users'
    },
    title: {
        type: String,
       // required: true
    },
    description: {
        type: String,
       // required: true
    },
    agency:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'agencies'
    },
    seen:{
        type: Boolean,
        default: false
    },
    cleared: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});



module.exports = mongoose.model("notifications", NotificationSchema);
