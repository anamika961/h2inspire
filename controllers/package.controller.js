const mongoose = require("mongoose");
const Package = require("../models/package.model");

module.exports = {
    list: async (req, res, next) => {
        try {
            const package_data = await Package.find({}).populate([
                {
                    path:"package_type",
                    select:""
                }
            ]);
    ;
    
            return res.status(200).send({
                error: false,
                message: "List of all packages",
                data: package_data
            })
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            const package_data = new Package(req.body)
            const result = await package_data.save();

            console.log("result",req.body)

            return res.status(200).send({
                error: false,
                message: "package create successfully",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    update: async (req, res, next) => {
        try {
            const result = await Package.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "Package not updated" })

            return res.status(200).send({
                error: false,
                message: "Package data Updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    detail: async (req, res, next) => {
        try {
            const result = await Package.findOne({_id: req.params.id}).populate([
                {
                    path:"package_type",
                    select:""
                }
            ]);
    
            return res.status(200).send({
                error: false,
                message: "Detail of package",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },
}