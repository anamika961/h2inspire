const {newPayment, checkStatus} = require('../controllers/phonePay.Controller');
const express = require('express');
const PhonePayrouter = express();

PhonePayrouter.post('/payment', newPayment);
PhonePayrouter.post('/status', checkStatus);


module.exports = PhonePayrouter;