const createError = require("http-errors");
const Agency = require("../models/agency.model");
const Employer = require("../models/employer.model");
const {
  recruiterLoginSchema,
  recruiterChangePasswordSchema,
} = require("../validators/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getUserViaToken,
} = require("../helpers/jwt_helper");
const bcrypt = require("bcrypt");
const RecruiterModel = require("../models/recruiter.model");
const { v4: uuidv4 } = require("uuid");

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
  login: async (req, res, next) => {
    try {
      const result = await recruiterLoginSchema.validateAsync(req.body);
      let recruiterData = await RecruiterModel.findOne({
        email: result.email,
        status: true,
      });
      if (!recruiterData)
        throw createError.NotFound("recruiter not registered");

      const isMatch = await recruiterData.isValidPassword(result.password);
      if (!isMatch) throw createError.BadRequest("Password not valid");

      const accessToken = await signAccessToken(recruiterData.id, "recruiters");
      const refreshToken = await signRefreshToken(
        recruiterData.id,
        "recruiters"
      );

      recruiterData.password = undefined;
      recruiterData.confirm_password = undefined;
      recruiterData.otp = undefined;

      if (recruiterData.invitation_status == 0) {
        recruiterData = await RecruiterModel.findOneAndUpdate(
          { email: result.email },
          { invitation_status: 1, accepted_on: Date.now() },
          { new: true }
        );
      }

      return res.status(200).send({
        error: false,
        message: "Recruiter logged in",
        data: {
          accessToken,
          refreshToken,
        },
        user: recruiterData,
      });
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Invalid Email/Password"));
      next(error);
    }
  },

  addByAgency: async (req, res, next) => {
    try {
      let token = req.headers["authorization"]?.split(" ")[1];
      let { userId, dataModel } = await getUserViaToken(token);
      console.log("{ userId, dataModel } >>> ", { userId, dataModel });
      const checkAgency = await Agency.findOne({ _id: userId });
      if (!checkAgency && dataModel != "agency")
        return res
          .status(401)
          .send({ error: true, message: "User unauthorize." });

      const emails = req.body.email;

      const data = [];

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("secret", salt);

      for (let index = 0; index < emails.length; index++) {
        const checkInvitation = await RecruiterModel.findOne({
          agency: userId,
          email: emails[index],
        });
        if (checkInvitation)
          return res
            .status(200)
            .send({
              error: true,
              message: `${emails[index]} is already invited as a recruiter`,
            });
        data.push({
          email: emails[index],
          password: hashedPassword,
          agency: userId,
          token: uuidv4(),
        });
      }

      const recruiterInvite = await RecruiterModel.insertMany(data);
      const invitedRecruiters = await RecruiterModel.find({
        agency: userId,
      }).select("-otp -password").sort({_id: -1});

      var mailOptions = {
        from: 'info@hire2inspire.com',
        subject: `Recruiter Invitation`,
        html:`
        <head>
            <title>Welcome to Hire2Inspire</title>
        </head>
    <body>
    <p>Dear Recruiter,</p>

    <p>
        I hope this message finds you well. We're thrilled to extend a warm and exclusive invitation to your esteemed recruiter
        to become a part of the Hire2inspire platform - a dynamic community dedicated to connecting exceptional agencies with
        clients seeking top-notch services.
    </p>

    <p>
        At Hire2inspire, we believe in the power of collaboration and innovation, and we see your recruiter as a perfect fit for
        our community. We are impressed by your talents and capabilities, and we are confident that your involvement will
        greatly enrich our platform.
    </p>

    <p>
        To start this exciting journey, all you need to do is click the link below to create your recruiter's profile on our
        platform. The onboarding process is designed to be straightforward, and our support team is available to assist you at
        every step.
    </p>
    <p>Find the link 
    <a href="https://hire2inspire-dev.netlify.app/recruiter/login" target="blank">Registration Link</a>
  </p>
  <p>
   password: secret
</p>
        <p>Thank you and best regards,</p>
        <p> Hire2Inspire </p>
    </body>
`
}; 


data.forEach((recipient) => {
  mailOptions.to = recipient?.email;

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
        invitation_links: recruiterInvite.map((e) => {
          return { [e.email]: `${req.body.callback}?token=${e.token}` };
        }),
        invitedRecruiters: invitedRecruiters
      });
    } catch (error) {
      next(error);
    }
  },

  detail: async (req, res, next) => {
    try {
      let token = req.headers["authorization"]?.split(" ")[1];
      let { userId, dataModel } = await getUserViaToken(token);
      const checkAgency = await Agency.findOne({ _id: userId });
      const checkRecruiter = await RecruiterModel.findOne({ _id: userId });
      if (
        (!checkAgency || !checkRecruiter) &&
        !["agency", "recruiters"].includes(dataModel)
      )
        return res
          .status(401)
          .send({ error: true, message: "User Unauthorized" });

      const recruiterData = await RecruiterModel.findOne({
        _id: req.params.id,
      }).select("-password -otp");

      return res.status(200).send({
        error: false,
        message: "Recruiter detail found",
        data: recruiterData,
      });
    } catch (error) {
      next(error);
    }
  },

  statusUpdate: async (req, res, next) => {
    try {
      let token = req.headers["authorization"]?.split(" ")[1];
      let { userId, dataModel } = await getUserViaToken(token);
      const checkAgency = await Agency.findOne({ _id: userId });
      if (!checkAgency && !["agency"].includes(dataModel))
        return res
          .status(400)
          .send({ error: true, message: "User Unauthorized" });

      const recruiterData = await RecruiterModel.findOneAndUpdate(
        { _id: req.params.id },
        { status: req.body.status },
        { new: true }
      );

      if (recruiterData) {
        return res.status(200).send({
          error: false,
          message: "Recruiter status updated.",
        });
      } else {
        return res.status(400).send({
          error: true,
          message: "Recruiter status not updated.",
        });
      }
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      let token = req.headers["authorization"]?.split(" ")[1];
      let { userId, dataModel } = await getUserViaToken(token);
      const checkAgency = await Agency.findOne({ _id: userId });
      if (!checkAgency && !["agency"].includes(dataModel))
        return res
          .status(400)
          .send({ error: true, message: "User Unauthorized" });

      const recruiterData = await RecruiterModel.find({agency:userId}).select(
        "-password -otp"
      );

      return res.status(200).send({
        error: false,
        message: "Recruiter list found",
        data: recruiterData,
      });
    } catch (error) {
      next(error);
    }
  },
//////////////////////// list of recruiter by emp /////////////////////////
  empReqlist: async (req, res, next) => {
    try {
      let token = req.headers["authorization"]?.split(" ")[1];
      let { userId, dataModel } = await getUserViaToken(token);
      const checkemp = await Employer.findOne({ _id: userId });
      if (!checkemp && !["employer"].includes(dataModel))
        return res
          .status(400)
          .send({ error: true, message: "User Unauthorized" });

      const recruiterData = await RecruiterModel.find({employer:userId})

      return res.status(200).send({
        error: false,
        message: "Recruiter list found",
        data: recruiterData,
      });
    } catch (error) {
      next(error);
    }
  },

  //////////////////////// list of recruiter by emp /////////////////////////

  addByEmp: async (req, res, next) => {
    try {
      let token = req.headers["authorization"]?.split(" ")[1];
      let { userId, dataModel } = await getUserViaToken(token);
      console.log("{ userId, dataModel } >>> ", { userId, dataModel });
      const checkEmp = await Employer.findOne({ _id: userId });
      if (!checkEmp && dataModel != "employer")
        return res
          .status(401)
          .send({ error: true, message: "User unauthorize." });

      const emails = req.body.email;

      const data = [];

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("secret", salt);

      for (let index = 0; index < emails.length; index++) {
        const checkInvitation = await RecruiterModel.findOne({$and:[
          {employer:userId},
          {email: emails[index]}
        ]});
        console.log({checkInvitation})
        if (checkInvitation)
          return res
            .status(200)
            .send({
              error: true,
              message: `${emails[index]} already invited as a recruiter`,
            });
        data.push({
          email: emails[index],
          password: hashedPassword,
          employer: userId,
          token: uuidv4(),
        });
      }

      const recruiterInvite = await RecruiterModel.insertMany(data);
      const invitedRecruiters = await RecruiterModel.find({
        employer:userId,
      }).select("-otp -password").sort({_id: -1});

      console.log({recruiterInvite});
      console.log({invitedRecruiters});

      var mailOptions = {
        from: 'info@hire2inspire.com',
        subject: `Recruiter Invitation`,
        html:`
        <head>
            <title>Welcome to Hire2Inspire</title>
        </head>
    <body>
    <p>Dear Recruiter,</p>

    <p>
        I hope this message finds you well. We're thrilled to extend a warm and exclusive invitation to your esteemed recruiter
        to become a part of the Hire2inspire platform - a dynamic community dedicated to connecting exceptional agencies with
        clients seeking top-notch services.
    </p>

    <p>
        At Hire2inspire, we believe in the power of collaboration and innovation, and we see your recruiter as a perfect fit for
        our community. We are impressed by your talents and capabilities, and we are confident that your involvement will
        greatly enrich our platform.
    </p>

    <p>
        To start this exciting journey, all you need to do is click the link below to create your recruiter's profile on our
        platform. The onboarding process is designed to be straightforward, and our support team is available to assist you at
        every step.
    </p>
    <a href="https://hire2inspire-dev.netlify.app/recruiter/login" target="blank">Registration Link</a>
  </p>
  <p>
   password: secret
</p>
        <p>Thank you and best regards,</p>
        <p> Hire2Inspire </p>
    </body>
`
}; 


data.forEach((recipient) => {
  mailOptions.to = recipient?.email;

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
        invitation_links: recruiterInvite.map((e) => {
          return { [e.email]: `${req.body.callback}?token=${e.token}` };
        }),
        invitedRecruiters: invitedRecruiters
      });
    } catch (error) {
      next(error);
    }
  },

/////////////////////////// status update by emp ///////////////////

  statusEmpUpdate: async (req, res, next) => {
    try {
      let token = req.headers["authorization"]?.split(" ")[1];
      let { userId, dataModel } = await getUserViaToken(token);
      const checkEmp = await Employer.findOne({ _id: userId });
      if (!checkEmp && !["employer"].includes(dataModel))
        return res
          .status(400)
          .send({ error: true, message: "User Unauthorized" });

      const recruiterData = await RecruiterModel.findOneAndUpdate(
        { _id: req.params.id },
        { status: req.body.status },
        { new: true }
      );

      if (recruiterData) {
        return res.status(200).send({
          error: false,
          message: "Recruiter status updated.",
        });
      } else {
        return res.status(400).send({
          error: true,
          message: "Recruiter status not updated.",
        });
      }
    } catch (error) {
      next(error);
    }
  },


  changePassword: async (req, res, next) => {
    try {
      let token = req.headers['authorization']?.split(" ")[1];
      let {userId, dataModel} = await getUserViaToken(token)
      
      const checkRecruiter = await RecruiterModel.findOne({_id: userId})
      // return res.status(200).send({userId, dataModel, checkRecruiter})
      if(!checkRecruiter && dataModel != "recruiters") return res.status(400).send({ error: true, message: "Recruiter not authorized." })

      if (req.body.old_password && req.body.new_password) {
        if (req.body.old_password === req.body.new_password) {
          message = {
            error: true,
            message: "Old and new password can not be same"
          }
          return res.status(200).send(message);
        }
        
        passwordCheck = await bcrypt.compare(req.body.old_password, checkRecruiter.password);
        if (passwordCheck) {
          const result = await RecruiterModel.findOneAndUpdate({
            _id: userId
          }, {
            password: req.body.new_password
          }, {new: true});
          message = {
            error: false,
            message: "Recruiter password changed!"
          }
        } else {
          message = {
            error: true,
            message: "Old password is not correct!"
          }
        }
      } else {
        message = {
          error: true,
          message: "Old password, new password are required!"
        }
      }
      return res.status(200).send(message);
    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  },

  forgetPassword: async (req, res, next) => {
    try {
      if(!req.body.email) return res.status(400).send({error: true, message: "Email required"});

      const RecruiterData = await RecruiterModel.findOneAndUpdate({ email: req.body.email }, {otp: 1234});
      if(!RecruiterData) return res.status(404).send({error: true, message: 'Recruiter not found'});

      return res.status(200).send({error: false, message: 'Otp sent successfully'});
    
    } catch (error) {
      next(error)
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      if(!req.body.email && !req.body.otp) return res.status(400).send({error: true, message: "Email and OTP required"});

      const RecruiterData = await RecruiterModel.findOne({
        $and: [
          { email: req.body.email },
          { otp: req.body.otp }
        ]
      });
      if(!RecruiterData) return res.status(404).send({error: true, message: 'Recruiter not found / OTP not correct'});

      return res.status(200).send({error: false, message: 'OTP verfied successfully'});
    
    } catch (error) {
      next(error)
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      if (req.body.new_password && req.body.confirm_password) {
        if (req.body.new_password !== req.body.confirm_password) {
            message = {
              error: true,
              message: "new and confirm password are not equal"
            }
            return res.status(400).send(message);
        }
        const RecruiterData = await RecruiterModel.findOne({
          email: req.body.email
        });
       
        if (RecruiterData === null) {
          message = {
            error: true,
            message: "Recruiter not found!"
          }
          return res.status(404).send(message);

        } else {
          const isMatch = await bcrypt.compare(req.body.new_password, RecruiterData.password)
          // return res.send("isMatch")
          if (isMatch)
            throw createError[400]('You can not use your old password as new.')

          const result = await RecruiterModel.findOneAndUpdate({
            email: req.body.email
          }, {
            password: req.body.new_password
          });

          console.log("result",result);
          
          message = {
            error: false,
            message: "Recruiter password reset successfully!"
          }
          return res.status(200).send(message);
        }
      } else {
        message = {
          error: true,
          message: "new password, confirm password are required!"
        }
        return res.status(404).send(message);
      }
    
    } catch (error) {
      next(error)
    }
  },
};
