const express = require("express");
const NotificationController = require("../controllers/notification.controller");
const notificationRouter = express.Router();
const { verifyAccessToken } = require("../helpers/jwt_helper");


notificationRouter.post("/add", );

notificationRouter.get("/get-by-user/:id", verifyAccessToken, NotificationController.listByUser);

notificationRouter.get("/get-by-user-last-10/:id", verifyAccessToken, NotificationController.listByUserLast10);

notificationRouter.post("/notification-status-change", verifyAccessToken, NotificationController.statusChange);

notificationRouter.post("/notification-clear", verifyAccessToken, NotificationController.clearNotification);

//notificationRouter.get("/list-by-agency/:id", NotificationController.listByAgency);


module.exports = notificationRouter;