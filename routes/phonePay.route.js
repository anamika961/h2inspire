const {newPayment, checkStatus, paymentVerify} = require('../controllers/phonePay.Controller');
const express = require('express');
const PhonePayrouter = express();

PhonePayrouter.post('/payment', newPayment);
PhonePayrouter.post('/status', checkStatus);
PhonePayrouter.post('/payment-verify', paymentVerify);


module.exports = PhonePayrouter;
