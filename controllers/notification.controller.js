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
            if(req.body.notificationId !== '') {
                console.log('hello');
                const result = await Notification.updateOne({ _id: req.body.notificationId }, {seen: req.body.status});
            } else {
                const result = await Notification.updateMany({ user: req.body.userId }, {seen: req.body.status});
            }
            message = {
                error: false,
                message: "All notification status updated",
            };
            res.status(200).send(message);
        } catch (error) {
            next(error)
        }
    },

    clearNotification: async (req, res, next) => {
        try {
            if(req.body.notificationId !== '') {
                console.log('hello');
                const result = await Notification.updateOne({ _id: req.body.notificationId }, {cleared: req.body.cleared});
            } else {
                const result = await Notification.updateMany({ user: req.body.userId }, {cleared: req.body.cleared});
            }
            message = {
                error: false,
                message: "Notification cleared"
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