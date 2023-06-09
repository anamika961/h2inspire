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
            const checkInvitation = await AgencyInviteModel.findOne({invited_by: userId, invited_by_ref: dataModel, email: emails[index]});
            if(checkInvitation) return res.status(200).send({ error: true, message: `${emails[index]} already invited`});
            data.push({
                email: emails[index],
                invited_by: userId,
                invited_by_ref: dataModel,
                token: uuidv4(),
            })
        }
        const agencyInvite = await AgencyInviteModel.insertMany(data);
        const allInvitations = await AgencyInviteModel.find({invited_by: userId, invited_by_ref: dataModel}).sort({_id: -1});
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
