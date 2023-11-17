const mongoose = require("mongoose");

const TokenSchema = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:"user_type"
    },
    user_type:{
        type:String,
        enum:{
            values:["agencies","employers"]
        }
   },
   token:{
        type:String,
        required:true
   },
//    status: {
//         type: Boolean,
//         default: true
//     }
}, {timestamps: true});

module.exports = mongoose.model("tokens", TokenSchema);