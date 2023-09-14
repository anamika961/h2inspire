require("dotenv").config();
const Razorpay = require("razorpay");
const Transaction = require("../models/transaction.model");
const axios = require('axios');
const crypto = require("crypto");


//const RazorpayRouter = express.Router();

// const razorpayKeyId = 'rzp_test_EPG86gnU8XaZU4';
// const razorpayKeySecret = 's4C9EprcRpvMe36mpFIV0bmG';

module.exports = {
    paymentOrder: (req,res) =>{
       
            let instance = new Razorpay({ key_id: 'rzp_test_A5J0IpRjznLJud', key_secret: 'lgxCslklCA4LRtdTkvv7rfcj' })
            console.log(req.body.amount);
            var options = {
              amount: req.body.amount * 100,  // amount in the smallest currency unit
              //amount: req.query.amount * 100,
              currency: "INR",
            };
            instance.orders.create(options, function(err, order) {
                if(err){
                    return res.send({ code : 500 , message:"server error" , data: err})
                }
                return res.send({ code : 200 , message:"order created", data:order});
                
            });
},

    paymentVerify: async(req,res) =>{
      let body  = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

      console.log(body,"data")

      let exptecedSign = crypto.createHmac('sha256',"s4C9EprcRpvMe36mpFIV0bmG")
      .update(body.toString())
      .digest('hex')

      let response  = {"signatureIsValid" : "false"}

     //  if(exptecedSign === req.body.razorpay_signature){
         response  = ({ code : 200 , message : 'Sign Valid' })
         
         let transactionId = req.query.transactionId;
         let type = req.body.type
         
         let emp_id = req.body.emp_id;

         // console.log(invoice_file,"msg")
        
         const getEmpData  = await Transaction.find({employer:emp_id})



         function addPaymentRes(transactions, targetTransactionId, invoiceValue) {
            
             for (let i = 0; i < transactions.length; i++) {
               if (transactions[i].transaction_id == targetTransactionId) {
                   
                 transactions[i]["type"] = invoiceValue;
                 
               }
             }
            return transactions;
            
         //    console.log(transactions,'transactions')
           }
          
           const updatedData = addPaymentRes(getEmpData[0].passbook_amt, transactionId
           , "paid");
         //   console.log(req.body,"msg")
            console.log(updatedData);

            const result = await Transaction.findOneAndUpdate({employer: emp_id},{passbook_amt:updatedData}, {new: true});

      //}
      //else{
        // response  = ({ code : 500 , message : 'Sign is not  Valid' })
     // }

      res.send(response)

},
fetchPayment: async(req,res,next) =>{     
 try{
   let paymentId = req.query.paymentId;
    const options = {
    method: 'POST',
    url: 'https://api.razorpay.com/v1/payments/${paymentId}',
    headers: {
      'key_id': "rzp_test_A5J0IpRjznLJud",
      'key-secret': "lgxCslklCA4LRtdTkvv7rfcj",
      'content-type': 'application/json'
    },
    
  };

  let resp = await axios.request(options);

  // console.log("resp>>>",resp)

  return res.status(200).send({
    error: false,
    message: "payment status update.",
    data: resp
  });
 }catch (error) {
      next(error)
    }
},



paymenSubscriptiontVerify: async(req,res) =>{
  let body  = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id + "|" + req.body.emp_id;

  console.log(body,"data")

  let exptecedSign = crypto.createHmac('sha256',"s4C9EprcRpvMe36mpFIV0bmG")
  .update(body.toString())
  .digest('hex')

  let response  = {"signatureIsValid" : "false"}

 //  if(exptecedSign === req.body.razorpay_signature){
     response  = ({ code : 200 , message : 'Sign Valid' })
     
    //  let transactionId = req.query.transactionId;
    //  let type = req.body.type
     
    //  let emp_id = req.body.emp_id;

    //  // console.log(invoice_file,"msg")
    
    //  const getEmpData  = await Transaction.find({employer:emp_id})



    //  function addPaymentRes(transactions, targetTransactionId, invoiceValue) {
        
    //      for (let i = 0; i < transactions.length; i++) {
    //        if (transactions[i].transaction_id == targetTransactionId) {
               
    //          transactions[i]["type"] = invoiceValue;
             
    //        }
    //      }
    //     return transactions;
        
    //  //    console.log(transactions,'transactions')
    //    }
      
    //    const updatedData = addPaymentRes(getEmpData[0].passbook_amt, transactionId
    //    , "paid");
    //  //   console.log(req.body,"msg")
    //     console.log(updatedData);

    //     const result = await Transaction.findOneAndUpdate({employer: emp_id},{passbook_amt:updatedData}, {new: true});

  //}
  //else{
    // response  = ({ code : 500 , message : 'Sign is not  Valid' })
 // }

  res.send(response)

},
}
