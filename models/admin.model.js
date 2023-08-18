const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const AdminSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
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
  password: {
    type: String,
    required: true,
    trim: true
  },
  address:{
    type:String
  },
  phone_no:{
    type:String
  },
  website:{
    type:String
  },
  company_name:{
    type:String
  },

  /**
   * 1: Super/Main admin
   * 2: Sub admin
   */
  type: {
    type: String,
    required: true,
    enum: [1, 2]
  },
  otp: {
    type: String,
    default: 1234,
    trim: true
  }
}, {timestamps: true})

AdminSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(this.password, salt)
      this.password = hashedPassword
    }
    next()
  } catch (error) {
    next(error)
  }
})

AdminSchema.pre('findOneAndUpdate', async function (next) {
  try {
    if (this._update.password) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(this._update.password, salt)
      this._update.password = hashedPassword
    }
    next()
  } catch (error) {
    next(error)
  }
})

AdminSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password)
  } catch (error) {
    throw error
  }
}

const Admin = mongoose.model('admins', AdminSchema)
module.exports = Admin
