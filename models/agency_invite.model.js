const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const AgencyInviteSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    validate(value) {
      const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z-.]+$/g
      if(!pattern.test(value)) {
        throw new Error("Wrong email format.")
      }
    },
  },
  invited_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "invited_by_ref",
    required: true
  },
  invited_by_ref: {
    type: String,
    enum: {
        values: ["agencies", "employers"]
    },
    required: true
  },
  status: {
    type: String,
    enum: {
        values: [0, 1, 2],
        message: "only (0:invited)/(1:accepted)/(2:declined)"
    },
    default: 0
  },
  accepted_on: {
    type: Date
  },
  token: {
    type: String
  }
}, {timestamps: true})

const AgencyInvite = mongoose.model('agency_invites', AgencyInviteSchema)
module.exports = AgencyInvite
