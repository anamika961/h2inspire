const express = require('express');
const router = express.Router();

const AdminAuthRouter = require('./admin_auth.route');
const notificationRouter = require('./notification.route');
const EmployerRouter = require('./employer.route');
const AgencyRouter = require('./agency.route');
const RecruiterRouter = require('./recruiter.route');
const AgencyInviteRouter = require('./agency_invite.route');
const JobPostingRouter = require('./job_posting.route');
const CandidateRouter = require('./candidate.route');
const fileUploadRouter = require('./file_upload.route');
const IndustryRouter = require('./industry.route');
const RoleRouter = require('./role.route');
const CreditRouter = require('./credit.route');
const TestimonialRouter = require('./testimonial.route');


router.use("/admin", AdminAuthRouter);
router.use("/notification", notificationRouter);
router.use("/employer", EmployerRouter);
router.use("/agency", AgencyRouter);
router.use("/recruiter", RecruiterRouter);
router.use("/agency-invite", AgencyInviteRouter);
router.use("/job-posting", JobPostingRouter);
router.use("/candidate", CandidateRouter);
router.use("/file", fileUploadRouter);
router.use("/industry", IndustryRouter);
router.use("/role", RoleRouter);
router.use("/credit", CreditRouter);
router.use("/testimonial", TestimonialRouter);


module.exports = router;