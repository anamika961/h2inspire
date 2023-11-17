const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const EmployerSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    // unique: true,
    trim: true,
    validate(value) {
      const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z-.]+$/g
      if(!pattern.test(value)) {
        throw new Error("Wrong email format.")
      }
    },
    default: undefined
  },
  mobile: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid mobile number!`
    },
  },
  fname: {
    type: String,
    required: false,
    trim: true
  },
  lname: {
    type: String,
    required: false,
    trim: true
  },
  comp_name:{
    type:String
  },
  linkedin_url: {
    type: String,
    trim: true
  },
  company_website_url: {
    type: String,
    trim: true
  },
  employer_image: {
    type: String,
    required: false,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  confirm_password: {
    type: String,
    trim: true
  },
  otp: {
    type: Number
  },
  status: {
    type: Boolean,
    required: true,
    default: false
  },
  /**
   * 1: Super/Main Employer
   * 2: Sub Employer
   */
  type: {
    type: String,
    required: true,
    enum: [1, 2]
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {timestamps: true})

EmployerSchema.pre('save', async function (next) {
    try {
      if (this.isNew) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        this.confirm_password = undefined;
      }
      next()
    } catch (error) {
      next(error)
    }
})
  
EmployerSchema.pre('findOneAndUpdate', async function (next) {
    try {
      if (this._update.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this._update.password, salt);
        this._update.password = hashedPassword;
        this._update.confirm_password = undefined;
      }
      next()
    } catch (error) {
      next(error)
    }
})

// EmployerSchema.method.is

EmployerSchema.methods.testFunc = async(callback) =>
  console.log('in test')

EmployerSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password)
  } catch (error) {
    throw error
  }
}

const Employer = mongoose.model('employers', EmployerSchema)
module.exports = Employer


