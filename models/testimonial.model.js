const mongoose = require("mongoose");

const TestimonialSchema = mongoose.Schema({
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