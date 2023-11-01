const mongoose = require("mongoose");
const GetInTouch = require("../models/getInTouch.model");
const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
    host: "mail.demo91.co.in",
    port: 465,
    auth: {
      user: "developer@demo91.co.in",
      pass: "Developer@2023"
    }
  });

module.exports = {
    create: async (req, res, next) => {
        try {
            const getIntouchData = new GetInTouch(req.body)
            const result = await getIntouchData.save();


            let getData = await GetInTouch.findOne({_id:result?._id});


            let getName = getData?.name;
            let getEmail = getData?.emailId;
            let getSubject = getData?.subject;
            let getQuery = getData?.query


            var mailOptions = {
                from: getEmail,
                to: 'developer@demo91.co.in',
                subject: `${getSubject}`,
                html:`
            <body>
                <p>Dear Hire2Inspire,</p>
                <p>${getQuery}</p>
                <p>Thank you and best regards,</p>
                <p> ${getName} </p>
            </body>
        `
 };   
            transport.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });


            return res.status(200).send({
                error: false,
                message: "submit get in Touch",
                data: result
            })
        } catch (error) {
            next(error)
        }
    },
}
