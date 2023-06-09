const mongoose = require("mongoose");

const RoleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

module.exports = mongoose.model("roles", RoleSchema);