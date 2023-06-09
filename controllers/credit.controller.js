const createError = require('http-errors')
const Employer = require('../models/employer.model')
const Admin = require('../models/admin.model')
const Credit = require('../models/credits.model')
const UserCredit = require('../models/user_credit.model')
const TransactionLog = require('../models/transaction_log.model')
const {
  getUserViaToken,
} = require('../helpers/jwt_helper')

module.exports = {
  add: async (req, res, next) => {
    try {
        let token = req.headers['authorization']?.split(" ")[1];
        let {userId, dataModel} = await getUserViaToken(token)
        const checkAdmin = await Admin.findOne({_id: userId})
        if(!checkAdmin && dataModel != "admins") return res.status(401).send({ error: true, message: "User unauthorized." })
        const CreditData = await Credit.findOneAndUpdate({_id: req.params.id},req.body, {new: true, upsert: true})
        // const CreditData = new Credit(req.body); 
        // const result = CreditData.save();

        res.status(200).send({
            error: false,
            message: 'Credit data found',
            data: CreditData
        })
    } catch (error) {
        next(error)
    }
  },

  list: async (req, res, next) => {
    try {
        let token = req.headers['authorization']?.split(" ")[1];
        let {userId, dataModel} = await getUserViaToken(token)
        const checkEmployer = await Employer.findOne({_id: userId})
        const checkAdmin = await Admin.findOne({_id: userId})
        if (
            (!checkEmployer || !checkAdmin) &&
            !["employers", "admins"].includes(dataModel)
        ) return res.status(401).send({ error: true, message: "User unauthorized." })
        const CreditData = await Credit.find()

        res.status(200).send({
            error: false,
            message: 'Credit list',
            data: CreditData
        })
    } catch (error) {
        next(error)
    }
  },
  
  detail: async (req, res, next) => {
    try {
        let token = req.headers['authorization']?.split(" ")[1];
        let {userId, dataModel} = await getUserViaToken(token)
        const checkEmployer = await Employer.findOne({_id: userId})
        const checkAdmin = await Admin.findOne({_id: userId})
        if (
            (!checkEmployer || !checkAdmin) &&
            !["employers", "admins"].includes(dataModel)
        ) return res.status(401).send({ error: true, message: "User unauthorized." })
        const CreditData = await Credit.findOne({_id: req.params.id})

        res.status(200).send({
            error: false,
            message: 'Credit detail',
            data: CreditData
        })
    } catch (error) {
        next(error)
    }
  },

  purchase: async (req, res, next) => {
    try {
        let token = req.headers['authorization']?.split(" ")[1];
        let {userId, dataModel} = await getUserViaToken(token)
        const checkEmployer = await Employer.findOne({_id: userId})
        if (
            (!checkEmployer) &&
            !["employers"].includes(dataModel)
        ) return res.status(401).send({ error: true, message: "User unauthorized." })
        const CreditData = await Credit.findOne({_id: req.params.id})
        if(!CreditData) return res.status(400).send({ error: true, message: "Credit details not fund." })
        if((Number(req.body.amount).toFixed(2)) < Number((CreditData.amount*req.body.credit_count).toFixed(2))) return res.status(400).send({ error: true, message: "Purchase amount is not as much as required to purchase credits." })
        
        const UserCreditData = await UserCredit.findOneAndUpdate({employer: userId}, {$inc: {purchased_count: req.body.credit_count}}, {upsert: true, new: true})
        await TransactionLog.insertMany([
            {
                employer: userId,
                amount: req.body.amount,
                description: `Prchased ${req.body.credit_count} credits.`
            }
        ])

        if (UserCreditData) {
            return res.status(200).send({
                error: false,
                message: "Credit purchase successful",
                data: UserCreditData
            })
        }
        return res.status(400).send({
            error: true,
            message: "Something went wrong."
        })

    } catch (error) {
        next(error)
    }
  }
}