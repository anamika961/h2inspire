const express = require('express')
const TestimonialController = require('../controllers/testimonial.controller')
const TestimonialRouter = express.Router()

TestimonialRouter.post('/add', TestimonialController.create)

TestimonialRouter.get('/list', TestimonialController.list)

// IndustryRouter.get('/all-list', IndustryController.allList)

TestimonialRouter.patch('/update/:id', TestimonialController.update)

module.exports = TestimonialRouter