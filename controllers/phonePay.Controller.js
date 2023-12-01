const crypto =  require('crypto');
const axios = require('axios');
//const {salt_key, merchant_id} = require('./secret');
const Transaction = require("../models/transaction.model");

let page = '';

const newPayment = async (req, res) => {
    try {
        const {merchantTransactionId,name,amount,merchantUserId,mobileNumber,pagetype} = req.body;
        page = pagetype;
        const data = {
            merchantId: 'PGTESTPAYUAT',
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.merchantUserId,
            name: req.body.name,
            amount: req.body.amount * 100,
            callbackUrl: `https://h2inspire.onrender.com/api/phone-pay/status`,
            redirectUrl: `https://h2inspire.onrender.com/api/phone-pay/status`,
            redirectMode: 'POST',
            mobileNumber: req.body.mobileNumber,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const key = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        axios.request(options).then(function (response) {
            // console.log(response.data.data.instrumentResponse.redirectInfo.url)
            return res.send(response.data.data.instrumentResponse.redirectInfo.url)
        })
        .catch(function (error) {
            console.error(error);
        });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        })
    }
}

const checkStatus = async(req, res) => {
    console.log("hdkjhdejh");
    const merchantTransactionId = res.req.body.transactionId;
    const merchantId = res.req.body.merchantId;

    console.log(res.req.body,"result");
    const key = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const options = {
    method: 'GET',
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': `${merchantId}`
    }
    };

    // CHECK PAYMENT STATUS
    axios
    .request(options)
    .then(async (response) => {
        console.log(response.data, "datatesting 2", page)
        if (page != 'transaction') {
            if (response.data.success === true) {
                const url = "http://localhost:5173/showPrice/success"
                return res.redirect(url)
            } else {
                const url = "http://localhost:5173/showPrice/failed"
                return res.redirect(url)
            }
        } else {
            if (response.data.success === true) {
                const url = "http://localhost:5173/employer/transactionamount/success"
                return res.redirect(url)
            } else {
                const url = "http://localhost:5173/employer/transactionamount/failed"
                return res.redirect(url)
            }
        }

    })
    .catch((error) => {
        console.error(error?.data, "err")
        if (page != 'transaction') {
            const url = "http://localhost:5173/showPrice/failed"
            return res.redirect(url)
        } else {
            const url = "http://localhost:5173/employer/transactionamount/failed"
            return res.redirect(url)
        }
    }
    )
};

const paymentVerify = async(req,res) =>{
    try {
        let transactionId = req.query.transactionId;
        //let type = req.body.type
         
         let emp_id = req.body.emp_id;

         const getEmpData  = await Transaction.find({employer:emp_id});
         function addPaymentRes(transactions, targetTransactionId, invoiceValue) {
            
            for (let i = 0; i < transactions.length; i++) {
              if (transactions[i].transaction_id == targetTransactionId) {
                  
                transactions[i]["type"] = invoiceValue;
                
              }
            }
           return transactions;
           
          }
         
          const updatedData = addPaymentRes(getEmpData[0].passbook_amt, transactionId
          , "paid");
        //   console.log(req.body,"msg")
         //  console.log(updatedData);

           const result = await Transaction.findOneAndUpdate({employer: emp_id},{passbook_amt:updatedData}, {new: true});

           return res.status(200).send({
            error: false,
            message: "payment verified",
            data: result
        })

    } catch (error) {
        next(error);
    }
}




module.exports = {
    newPayment,
   checkStatus,
   paymentVerify
}