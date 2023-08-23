require('dotenv').config()
const Notification = require('../models/notification.model');
const CronJob = require('cron').CronJob;
const fetch = require('node-fetch')
const FormData = require('form-data');

const { google } = require('googleapis');
const FROM_EMAIL = process.env.FROM_EMAIL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN;
const nodemailer = require('nodemailer');

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


// module.exports = {
//     sendNotification: async (req, res, next) => {
//         try {
//             const user = req.userId
//             const title = req.title
//             const description = req.desc
//             const notificationData = new Notification({user, title, description})
//             const result = await notificationData.save();
//             return result;
//         } catch (error) {
//             next(error)
//         }
//     },

//     // sendMail: async (req, res, next) => {
//     //     try {
//     //         if (req.email && req.subject && req.text && req.html) {
//     //             const accessToken = await oAuth2Client.getAccessToken();
        
//     //             const transport = nodemailer.createTransport({
//     //                 service: 'gmail',
//     //                 auth: {
//     //                     type: 'OAuth2',
//     //                     user: FROM_EMAIL,
//     //                     clientId: CLIENT_ID,
//     //                     clientSecret: CLEINT_SECRET,
//     //                     refreshToken: REFRESH_TOKEN,
//     //                     accessToken: accessToken,
//     //                 },
//     //             });
            
//     //             const mailOptions = {
//     //                 from: FROM_EMAIL,
//     //                 to: req.email,
//     //                 subject: req.subject,
//     //                 text: req.text,
//     //                 html: req.html
//     //             };
            
//     //             const result = await transport.sendMail(mailOptions);
//     //             return result; 
//     //         }
//     //         return null;
//     //     } catch (error) {
//     //         // console.log(error)
//     //     }
//     // },

//     // sendWhatsappNotification: async(req, res, next) => {
//     //     try {
//     //         console.log('here 1',req);
//     //         var bodyFormData = new FormData();
//     //         bodyFormData.append("from", process.env.KALEYRA_WHATSAPP_FROM);
//     //         bodyFormData.append("to", `91${req.to}`);
//     //         bodyFormData.append("type", "template");
//     //         bodyFormData.append("channel", "whatsapp");
//     //         bodyFormData.append("template_name", req.template);
//     //         bodyFormData.append("params", req.params);
//     //         bodyFormData.append("lang_code", "en");

//     //         const response = await fetch(process.env.KALEYRA_URL, {
//     //             method: 'POST',
//     //             body: bodyFormData,
//     //             headers: {
//     //                 'api-key': process.env.KALEYRA_API_KEY,
//     //             }
//     //         });
//     //         const data = await response.json();
//     //         console.log(data);
//     //         return data;
//     //     } catch (error) {
//     //         console.log(error)
//     //     }
//     // },

//     // sendSms: async (req, res, next) => {
//     //     try {
//     //         console.log(req);
//     //         const body = { 
//     //             to: `+91${req.mobile}`,
//     //             type: 'OTP',
//     //             sender: 'Wvouch',
//     //             body: `Dear Customer, please enter OTP ${req.otp} to login to your Wevouch account & start managing your warranties effectively.`,
//     //             template_id: '1707162848701603303' 
//     //         }
//     //         const response = await fetch(process.env.KALEYRA_URL, {
//     //             method: 'POST',
//     //             body: JSON.stringify(body),
//     //             headers: {
//     //                 'Content-Type': 'application/json',
//     //                 'api-key': process.env.KALEYRA_API_KEY
//     //             }
//     //         });
//     //         const data = await response.json();
//     //         // console.log(data);
//     //     } catch (error) {
//     //         // console.log(error)
//     //     }
//     // }
// }

const sendNotification = async (req, res) => {
    const user = req.user
    const title = req.title
    const description = req.description
    const notificationData = new Notification({user, title, description})
    const result = await notificationData.save();
    return result;
}

module.exports = sendNotification