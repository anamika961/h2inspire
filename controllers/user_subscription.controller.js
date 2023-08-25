const mongoose = require("mongoose");
const UserSubscription = require("../models/user_subscription.model");

module.exports = {
    listbyId: async (req, res, next) => {
        try {
            const subscription_data = await UserSubscription.find({employer: req.params.id}).populate([
                {
                    path:"employer",
                    select:""
                },
                {
                    path:"package",
                    select:""
                }
            ]);
    
            return res.status(200).send({
                error: false,
                message: "List of all user subscription",
                data: subscription_data
            })
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            const subscription_data = new UserSubscription(req.body)
            const result = await subscription_data.save();

           // console.log("result",req.body)

            return res.status(200).send({
                error: false,
                message: "User subscribed successfully",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    update: async (req, res, next) => {
        try {
            const result = await UserSubscription.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "User subscription not updated" })

            return res.status(200).send({
                error: false,
                message: "User subscription updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    statusupdate: async (req, res, next) => {
        try {
            const result = await UserSubscription.findOneAndUpdate({_id: req.params.id}, {status:req.body.status}, {new: true});
    
            if(!result) return res.status(200).send({ error: false, message: "User subscription status not updated" })

            return res.status(200).send({
                error: false,
                message: "User subscription status updated",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },

    detail: async (req, res, next) => {
        try {
            const result = await UserSubscription.findOne({_id: req.params.id});
    
            return res.status(200).send({
                error: false,
                message: "Detail of User Subscription",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },
}