const mongoose = require("mongoose");
const Notification = require("../models/notification.model");

module.exports = {
    listByUser: async (req, res, next) => {
        try {
            const notifications = await Notification.find({
                $and: [
                    { cleared: false },
                    { user: req.params.id }
                ]
            }).sort({_id: -1})
    
            return res.status(200).send({
                error: false,
                message: "Notification list",
                data: notifications
            })
        } catch (error) {
            next(error);
        }
    },

    listByUserLast10: async (req, res, next) => {
        try {
            const notifications = await Notification.find({
                $and: [
                    { cleared: false },
                    { user: req.params.id }
                ]
            }).sort({_id: -1}).limit(10);
    
            return res.status(200).send({
                error: false,
                message: "Notification list",
                data: notifications
            })
        } catch (error) {
            next(error);
        }
    },

    statusChange: async (req, res, next) => {
        try {
            let notificationData = await Notification.findOneAndUpdate({_id:req.params.id},{seen:true},{new:true})
            message = {
                error: false,
                message: "All notification status updated",
                data:notificationData
            };
            res.status(200).send(message);
        } catch (error) {
            next(error)
        }
    },

    clearNotification: async (req, res, next) => {
        try {
            let notificationData = await Notification.findOneAndUpdate({_id:req.params.id},{cleared:true},{new:true})
            message = {
                error: false,
                message: "Notification cleared",
                data:notificationData
            };
            res.status(200).send(message);
        } catch (error) {
            next(error)
        }
    },

    listByAgency: async (req, res, next) => {
        try {
            const notifications = await Notification.find({
                $and: [
                    { cleared: false },
                    { agency: req.params.id }
                ]
            }).sort({_id: -1})
    
            return res.status(200).send({
                error: false,
                message: "Notification list",
                data: notifications
            })
        } catch (error) {
            next(error);
        }
    },
}

