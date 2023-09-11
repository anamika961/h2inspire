const mongoose = require("mongoose");
const { getUserViaToken } = require("../helpers/jwt_helper");
const Admin = require("../models/admin.model");
const PackageType = require("../models/package_type.model");

module.exports = {
    list: async (req, res, next) => {
        try {
            const PackageType_data = await PackageType.find({})
    
            return res.status(200).send({
                error: false,
                message: "Package type listing",
                data: PackageType_data
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

            const PackageType_data = new PackageType(req.body)
            const result = await PackageType_data.save();
    
            return res.status(200).send({
                error: false,
                message: "Package Type",
                data: result
            })
        } catch (error) {
            next(error)
        }s
    },

    update: async (req, res, next) => {
        try {
            let token = req.headers['authorization']?.split(" ")[1];
            let {userId, dataModel} = await getUserViaToken(token)
            const checkAdmin = await Admin.findOne({_id: userId})
            if(!checkAdmin && dataModel != "admins") return res.status(400).send({ error: true, message: "User not authorized." })

            const result = await package-type.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "Package Type not updated" })

            return res.status(200).send({
                error: false,
                message: "Package Type updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },
}