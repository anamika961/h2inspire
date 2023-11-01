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
const TransactionRouter = require('./transaction.route');
const RazorpayRouter = require('./razorpay.route');
const PackageRouter = require('./package.route');
const UserSubscriptionRouter = require('./user_subscription.route');
const PackageTypeRouter = require('./package_type.route');
const CreditNoteRouter = require('./creditnote.route');
const DraftJobRouter = require('./draftJob.route');
const GetInTouchRouter = require('./getInTouch.route');



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
router.use("/transaction", TransactionRouter);
router.use("/razorpay", RazorpayRouter);
router.use("/package", PackageRouter);
router.use("/user-subscription", UserSubscriptionRouter);
router.use("/package-type", PackageTypeRouter);
router.use("/credit-note", CreditNoteRouter);
router.use("/draft-job", DraftJobRouter);
router.use("/get-in-touch", GetInTouchRouter);


module.exports = router;