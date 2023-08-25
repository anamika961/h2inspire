const mongoose = require("mongoose");

const PackageSchema = mongoose.Schema({
   title:{
       type:String
   },
   desc:{
       type:String
   },
   amount:{
       type:Number
   },
   package_type:{
      type:String
   },
   note:{
       type:String
   },
   job_credit:{
    type:String
   },
   job_active:{
    type:String
   },
   job_credit_validity:{
    type:String
   }
}, {timestamps: true});

module.exports = mongoose.model("packages", PackageSchema);