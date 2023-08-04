// const mongoose = require("mongoose");
// const Transaction = require("../models/transaction.model");

// module.exports = {
//     // list: async (req, res, next) => {
//     //     try {
//     //         const testimonial_data = await Testimonial.find({});
    
//     //         return res.status(200).send({
//     //             error: false,
//     //             message: "Testimonial data",
//     //             data: testimonial_data
//     //         })
//     //     } catch (error) {
//     //         next(error);
//     //     }
//     // },


//     create: async (req, res, next) => {
//         try {
//             const transaction_data = new Testimonial(req.body)
//             const result = await testimonial_data.save();

//             console.log("result...",result);
    
//             return res.status(200).send({
//                 error: false,
//                 message: "Industry updated",
//                 data: result
//             })
//         } catch (error) {
//             next(error)
//         }
//     },

// }