const createError = require("http-errors");
const Agency = require("../models/agency.model");
const {
  agencyLoginSchema,
  agencyRegistrationAuthSchema,
  agencyChangePasswordSchema,
} = require("../validators/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getUserViaToken,
} = require("../helpers/jwt_helper");
const bcrypt = require("bcrypt");
const AgencyInviteModel = require("../models/agency_invite.model");
const { v4: uuidv4 } = require("uuid");
const Employer = require("../models/employer.model");
const nodemailer = require("nodemailer");
var transport = nodemailer.createTransport({
  host: "hire2inspire.com",
  port: 465,
  auth: {
    user: "info@hire2inspire.com",
    pass: "h2I@2023"
  }
});


module.exports = {
  allList: async (req, res, next) => {
    try {
        let token = req.headers['authorization']?.split(" ")[1];
        let {userId, dataModel} = await getUserViaToken(token)
        const checkEmployer = await Employer.findOne({_id: userId})
        if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not found." })

        const agencyInvites = await AgencyInviteModel.find({invited_by: userId, invited_by_ref: dataModel})
            .sort("-_id");
        return res.status(200).send({
            error: false,
            message: "All invitations",
            data: agencyInvites,
        });
    } catch (error) {
        next(error);
    }
  },

    sendInvitation: async (req, res, next) => {
    try {
        let token = req.headers['authorization']?.split(" ")[1];
        let {userId, dataModel} = await getUserViaToken(token)
        const checkEmployer = await Employer.findOne({_id: userId})
        if(!checkEmployer && dataModel != "employers") return res.status(400).send({ error: true, message: "Employer not found." })

        const emails = req.body.email;

        const data = [];

        for (let index = 0; index < emails.length; index++) {
            const checkInvitation = await AgencyInviteModel.findOne({$and:[{invited_by: userId, invited_by_ref: dataModel, email: emails[index]}]});
            if(checkInvitation) return res.status(200).send({ error: true, message: `${emails[index]} is already invited`});
            console.log("checkInvitation",checkInvitation)
            data.push({
                email: emails[index],
                invited_by: userId,
                invited_by_ref: dataModel,
                token: uuidv4(),
            })
        }
        const agencyInvite = await AgencyInviteModel.insertMany(data);
        const allInvitations = await AgencyInviteModel.find({invited_by: userId, invited_by_ref: dataModel}).sort({_id: -1});

        var mailOptions = {
          from: 'info@hire2inspire.com',
          subject: `Agency Invited successfully`,
          html:`
          <head>
              <title>Welcome to Hire2Inspire</title>
          </head>
      <body>
      <p>Dear Agency,</p>

      <p>
          I hope this message finds you well. We're thrilled to extend a warm and exclusive invitation to your esteemed agency
          to become a part of the Hire2inspire platform - a dynamic community dedicated to connecting exceptional agencies with
          clients seeking top-notch services.
      </p>
  
      <p>
          At Hire2inspire, we believe in the power of collaboration and innovation, and we see your agency as a perfect fit for
          our community. We are impressed by your talents and capabilities, and we are confident that your involvement will
          greatly enrich our platform.
      </p>
  
      <p>
          To start this exciting journey, all you need to do is click the link below to create your agency's profile on our
          platform. The onboarding process is designed to be straightforward, and our support team is available to assist you at
          every step.
      </p>
      <p>Find the link 
      <a href="https://hire2inspire-dev.netlify.app/agency/login" target="blank">Registration Link</a>
    </p>
          <p>Thank you and best regards,</p>
          <p> Hire2Inspire </p>
      </body>
  `
  }; 

//  console.log("data",data)
  
  data.forEach((recipient) => {
    mailOptions.to = recipient?.email;

  //  console.log("to",mailOptions.to )
  
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`Error sending email to ${recipient}: ${error}`);
      } else {
        console.log(`Email sent to ${recipient?.email}: ${info.response}`);
      }
    });
  });
        


        return res.status(200).send({
            error: false,
            message: "Invitation sent successfully",
            invitation_links: agencyInvite.map(e => {
                return {[e.email]: `${req.body.callback}?token=${e.token}`}
            }),
            allInvitations: allInvitations
        });
    } catch (error) {
        next(error);
    }
  },
};
