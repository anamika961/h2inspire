const mongoose = require("mongoose");

const PackageTypeSchema = mongoose.Schema({
    name:{
        type:String
    },
    package_type:{
        type:String
    }
}, {timestamps: true});

module.exports = mongoose.model("packageTypes", PackageTypeSchema);