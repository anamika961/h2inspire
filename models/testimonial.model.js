const mongoose = require("mongoose");

const TestimonialSchema = mongoose.Schema({
    name:{
        type: String
    },
    cmp_name: {
        type: String
    },
    content: {
        type: String
    },
    designation: {
        type: String
    },
    review: {
        type: String
    }
}, {timestamps: true});

module.exports = mongoose.model("testimonials", TestimonialSchema);