require("dotenv").config();
const Razorpay = require("razorpay");
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
}
}