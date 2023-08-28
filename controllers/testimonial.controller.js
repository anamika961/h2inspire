const mongoose = require("mongoose");
const Testimonial = require("../models/testimonial.model");

module.exports = {
    list: async (req, res, next) => {
        try {
            const testimonial_data = await Testimonial.find({});
    
            return res.status(200).send({
                error: false,
                message: "Testimonial data",
                data: testimonial_data
            })
        } catch (error) {
            next(error);
        }
    },

    // allList: async (req, res, next) => {
    //     try {
    //         const industry_data = await Industry.find({})
    
    //         return res.status(200).send({
    //             error: false,
    //             message: "Industry listing",
    //             data: industry_data
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    create: async (req, res, next) => {
        try {
            // let token = req.headers['authorization']?.split(" ")[1];
            // let {userId, dataModel} = await getUserViaToken(token)
            // const checkAdmin = await Admin.findOne({_id: userId})
            // if(!checkAdmin && dataModel != "admins") return res.status(400).send({ error: true, message: "User not authorized." })

            const testimonial_data = new Testimonial(req.body)
            const result = await testimonial_data.save();

            console.log("result...",result);
    
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
            const result = await Testimonial.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "Testimonial not updated" })

            return res.status(200).send({
                error: false,
                message: "Testimonial Updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },
}

