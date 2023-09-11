const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const PackageSchema = mongoose.Schema({
   package_type:{
        type:ObjectId,
        ref: 'packageTypes',
   },
   desc:{
       type:String
   },
   note:{
       type:String
   },
   payAsYou_detail:{
       amount:{
            type:Number
       },
       type:{
           type:String
       },
    //    quantity:{
    //         type:Number
    //    },
       job_credit:{
           type:Number
       },
       job_activity:{
           type:String
       },
       job_credit_validity:{
        type:String
    },
   },
   business_detail:{
    amount:{
         type:Number
    },
    type:{
        type:String
    },
    job_credit:{
        type:Number
    },
    job_activity:{
        type:String
    },
    job_credit_validity:{
     type:String
    },
    },
    scale_detail:[
        {
            amount:{
                type:Number
           },
           type:{
               type:String
           },
           job_credit:{
               type:Number
           },
           job_activity:{
               type:String
           },
           job_credit_validity:{
            type:String
           },
        }
    ]
}, {timestamps: true});

module.exports = mongoose.model("packages", PackageSchema);