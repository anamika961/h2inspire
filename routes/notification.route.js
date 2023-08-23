const express = require("express");
const NotificationController = require("../controllers/notification.controller");
const notificationRouter = express.Router();
const { verifyAccessToken } = require("../helpers/jwt_helper");


notificationRouter.post("/add", );

notificationRouter.get("/get-by-user/:id", NotificationController.listByUser);

notificationRouter.get("/get-by-user-last-10/:id", verifyAccessToken, NotificationController.listByUserLast10);

notificationRouter.get("/notification-status-change/:id", NotificationController.statusChange);

notificationRouter.get("/notification-clear/:id",  NotificationController.clearNotification);

//notificationRouter.get("/list-by-agency/:id", NotificationController.listByAgency);


module.exports = notificationRouter;