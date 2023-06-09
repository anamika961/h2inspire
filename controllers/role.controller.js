const mongoose = require("mongoose");
const { getUserViaToken } = require("../helpers/jwt_helper");
const Admin = require("../models/admin.model");
const Role = require("../models/roles.model");

module.exports = {
    list: async (req, res, next) => {
        try {
            const industry_data = await Role.find({status: true})
    
            return res.status(200).send({
                error: false,
                message: "Role active listing",
                data: industry_data
            })
        } catch (error) {
            next(error);
        }
    },

    allList: async (req, res, next) => {
        try {
            const Role_data = await Role.find({})
    
            return res.status(200).send({
                error: false,
                message: "Role listing",
                data: Role_data
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

            const Role_data = new Role(req.body)
            const result = await Role_data.save();
    
            return res.status(200).send({
                error: false,
                message: "Role created",
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

            const result = await Role.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "Role not updated" })

            return res.status(200).send({
                error: false,
                message: "Role updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },
}