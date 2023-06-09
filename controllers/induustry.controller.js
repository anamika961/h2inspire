const mongoose = require("mongoose");
const { getUserViaToken } = require("../helpers/jwt_helper");
const Admin = require("../models/admin.model");
const Industry = require("../models/industries.model");

module.exports = {
    list: async (req, res, next) => {
        try {
            const industry_data = await Industry.find({status: true})
    
            return res.status(200).send({
                error: false,
                message: "Industry active listing",
                data: industry_data
            })
        } catch (error) {
            next(error);
        }
    },

    allList: async (req, res, next) => {
        try {
            const industry_data = await Industry.find({})
    
            return res.status(200).send({
                error: false,
                message: "Industry listing",
                data: industry_data
            })
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkAdmin = await Admin.findOne({_id: userId})
            if(!checkAdmin && dataModel != "admins") return res.status(400).send({ error: true, message: "User not authorized." })

            const industry_data = new Industry(req.body)
            const result = await industry_data.save();
    
            return res.status(200).send({
                error: false,
                message: "Industry updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    update: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkAdmin = await Admin.findOne({_id: userId})
            if(!checkAdmin && dataModel != "admins") return res.status(400).send({ error: true, message: "User not authorized." })

            const result = await Industry.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "Industry not updated" })

            return res.status(200).send({
                error: false,
                message: "Industry created",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },
}