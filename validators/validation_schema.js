const Joi = require('joi')

/**
 * Admin auth schema
 */
const adminLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).trim().required(),
})

const adminRegistartionSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .regex(RegExp(/(?=.*)(?=.*[!@#$%+_^&*(){}])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/))
    .trim()
    .required()
    .messages({
      "string.base": `Password should be a type of string`,
      "string.empty": `Password must contain value`,
      "string.pattern.base": `Password must contains 8 characters with 1 lowercase, 1 uppercase, 1 digit, 1 special character`,
      "any.required": `Password is a required field`
    }),
  confirm_password: Joi.string().min(6).trim().required(),
  type: Joi.string()
    .valid(1, 2)
    .required()
})

/**
 * Employer validation schema
 */
const employerRegistrationAuthSchema = Joi.object({
  mobile: Joi.string(),
  //   .regex(RegExp(/[0-9]{10}/))
  //   .trim()
  //   .required()
  //   .messages({
  //     "string.base": `mobile should be a type of string`,
  //     "string.empty": `mobile must contain value`,
  //     "string.pattern.base": `mobile must be 10 digit number`,
  //     "any.required": `mobile is a required field`
  //   }),
  email: Joi.string().email().trim().required(),
  fname: Joi.string().trim(),
  type: Joi.string().trim(),
  lname: Joi.string().trim(),
  linkedin_url: Joi.string().trim(),
  company_website_url: Joi.string().trim(),
  comp_name: Joi.string().trim(),
  password: Joi.string()
    .regex(RegExp(/(?=.*)(?=.*[!@#$%+_^&*(){}])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/))
    .trim()
    .required()
    .messages({
      "string.base": `Password should be a type of string`,
      "string.empty": `Password must contain value`,
      "string.pattern.base": `Password must contains 8 characters with 1 lowercase, 1 uppercase, 1 digit, 1 special character`,
      "any.required": `Password is a required field`
    }),
  confirm_password: Joi.string().min(6).trim().required(),
  employer_image: Joi.string().allow('')
})

const employerLoginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).trim().required()
})

const employerChangePasswordSchema = Joi.object({
  old_password: Joi.string()
    .regex(RegExp(/(?=.*)(?=.*[!@#$%+_^&*(){}])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/))
    .trim()
    .required()
    .messages({
      "string.base": `Old Password should be a type of string`,
      "string.empty": `Old Password must contain value`,
      "string.pattern.base": `Old Password must contains 8 characters with 1 lowercase, 1 uppercase, 1 digit, 1 special character`,
      "any.required": `Old Password is a required field`
    }),
  new_password: Joi.string()
    .regex(RegExp(/(?=.*)(?=.*[!@#$%+_^&*(){}])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/))
    .trim()
    .required()
    .messages({
      "string.base": `New Password should be a type of string`,
      "string.empty": `New Password must contain value`,
      "string.pattern.base": `New Password must contains 8 characters with 1 lowercase, 1 uppercase, 1 digit, 1 special character`,
      "any.required": `New Password is a required field`
    })
})

/**
 * Agency validation schema
 */
const agencyRegistrationAuthSchema = Joi.object({
  corporate_email: Joi.string().email().trim().required(),
  name: Joi.string().trim().required(),
  agency_estd_year: Joi.string().trim().required(),
  type: Joi.string().trim(),
  password: Joi.string()
    .regex(RegExp(/(?=.*)(?=.*[!@#$%+_^&*(){}])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/))
    .trim()
    .required()
    .messages({
      "string.base": `Password should be a type of string`,
      "string.empty": `Password must contain value`,
      "string.pattern.base": `Password must contains 8 characters with 1 lowercase, 1 uppercase, 1 digit, 1 special character`,
      "any.required": `Password is a required field`
    }),
  confirm_password: Joi.string().min(6).trim().required()
})

const agencyLoginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).trim().required()
})

const agencyChangePasswordSchema = Joi.object({
  old_password: Joi.string()
    .regex(RegExp(/(?=.*)(?=.*[!@#$%+_^&*(){}])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/))
    .trim()
    .required()
    .messages({
      "string.base": `Old Password should be a type of string`,
      "string.empty": `Old Password must contain value`,
      "string.pattern.base": `Old Password must contains 8 characters with 1 lowercase, 1 uppercase, 1 digit, 1 special character`,
      "any.required": `Old Password is a required field`
    }),
  new_password: Joi.string()
    .regex(RegExp(/(?=.*)(?=.*[!@#$%+_^&*(){}])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/))
    .trim()
    .required()
    .messages({
      "string.base": `New Password should be a type of string`,
      "string.empty": `New Password must contain value`,
      "string.pattern.base": `New Password must contains 8 characters with 1 lowercase, 1 uppercase, 1 digit, 1 special character`,
      "any.required": `New Password is a required field`
    })
})

const recruiterLoginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).trim().required()
})

const recruiterChangePasswordSchema = Joi.object({
  old_password: Joi.string()
    .regex(RegExp(/(?=.*)(?=.*[!@#$%+_^&*(){}])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/))
    .trim()
    .required()
    .messages({
      "string.base": `Old Password should be a type of string`,
      "string.empty": `Old Password must contain value`,
      "string.pattern.base": `Old Password must contains 8 characters with 1 lowercase, 1 uppercase, 1 digit, 1 special character`,
      "any.required": `Old Password is a required field`
    }),
  new_password: Joi.string()
    .regex(RegExp(/(?=.*)(?=.*[!@#$%+_^&*(){}])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/))
    .trim()
    .required()
    .messages({
      "string.base": `New Password should be a type of string`,
      "string.empty": `New Password must contain value`,
      "string.pattern.base": `New Password must contains 8 characters with 1 lowercase, 1 uppercase, 1 digit, 1 special character`,
      "any.required": `New Password is a required field`
    })
})

module.exports = {
  adminLoginSchema,
  adminRegistartionSchema,
  employerRegistrationAuthSchema,
  employerLoginSchema,
  employerChangePasswordSchema,
  agencyRegistrationAuthSchema,
  agencyLoginSchema,
  agencyChangePasswordSchema,
  recruiterLoginSchema,
  recruiterChangePasswordSchema
}
