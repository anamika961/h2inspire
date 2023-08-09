const express = require("express");
const RazorPayController = require("../controllers/razorpay.controller");
const RazorpayRouter = express.Router();

RazorpayRouter.post("/order", RazorPayController.paymentOrder);
// RazorpayRouter.post("/verify", RazorPayController.paymentVerify);

module.exports = RazorpayRouter;

