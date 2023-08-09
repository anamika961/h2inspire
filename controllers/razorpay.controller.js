require("dotenv").config();
const Razorpay = require("razorpay");

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
              currency: "INR",
            };
            instance.orders.create(options, function(err, order) {
                if(err){
                    return res.send({ code : 500 , message:"server error" , data: err.toString()})
                }
                return res.send({ code : 200 , message:"order created", data:order});
                
            });
},

    paymentVerify: (req,res) =>{
         let body  = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

         console.log(body,"data")

         let exptecedSign = crypto.createHmac('sha256',"s4C9EprcRpvMe36mpFIV0bmG")
         .update(body.toString())
         .digest('hex')

         let response  = {"signatureIsValid" : "false"}

         if(exptecedSign === req.body.razorpay_signature){
            response  = ({ code : 200 , message : 'Sign Valid' })
         }else{
            response  = ({ code : 500 , message : 'Sign is not  Valid' })
         }

         res.send(response)



}

}