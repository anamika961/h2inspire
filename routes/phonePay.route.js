const {newPayment, checkStatus} = require('../controllers/phonePay.Controller');
const express = require('express');
const PhonePayrouter = express();

PhonePayrouter.post('/payment', newPayment);
// router.post('/status/:txnId', checkStatus);

module.exports = PhonePayrouter;