const express = require("express");
const RazorPayController = require("../controllers/razorpay.controller");
const RazorpayRouter = express.Router();

RazorpayRouter.post("/order", RazorPayController.paymentOrder);
RazorpayRouter.post("/verify", RazorPayController.paymentVerify);
RazorpayRouter.post("/fetch-payment", RazorPayController.fetchPayment);
RazorpayRouter.post("/verify-payment", RazorPayController.paymenSubscriptiontVerify);

module.exports = RazorpayRouter;

