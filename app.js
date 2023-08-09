const express = require('express')
var cors = require('cors')
var fs = require('fs')
var morgan = require('morgan')
var path = require('path')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const { verifyAccessToken } = require('./helpers/jwt_helper')
const router = require('./routes/index.route')
const moment = require('moment-timezone')

const app = express()

app.use(cors())

app.use(express.static('logs'))
app.use(express.static('uploads'))

/**
 * create a write stream (in append mode)
 * setup the logger
 */
const originalSend = app.response.send

app.response.send = function sendOverWrite(body) {
  originalSend.call(this, body)
  this.__custombody__ = body
}
morgan.token('res-body', (_req, res) =>
  JSON.stringify(res.__custombody__),
)
morgan.token('body', req => {
  return JSON.stringify(req.body)
})

const currDate = moment().format("MMM-Do-YY");

/**
 * Customize log path
 */
if (process.env.NODE_ENV == 'dev') {
  const accessLogPath = (process.env.NODE_ENV == 'dev') ? `logs/dev/${currDate}-access.log` : `logs/production/${currDate}-access.log`;
  const errorLogPath = (process.env.NODE_ENV == 'dev') ? `logs/dev/${currDate}-error.log` : `logs/production/${currDate}-error.log`;
  
  // success logger
  app.use(morgan('[:date[web]] - :remote-addr - :remote-user ":method :url HTTP/:http-version" code - :status :res[content-length] ":referrer" ":user-agent" request :body response :res-body', {
    skip: function (req, res) { return res.statusCode >= 400 },
    stream: fs.createWriteStream(path.join(__dirname, accessLogPath), { flags: 'a' })
  }))
  
  // error logger
  app.use(morgan('[:date[web]] - :remote-addr - :remote-user ":method :url HTTP/:http-version" code - :status :res[content-length] ":referrer" ":user-agent" request :body response :res-body', {
    skip: function (req, res) { return res.statusCode < 400 },
    stream: fs.createWriteStream(path.join(__dirname, errorLogPath), { flags: 'a' })
  }))
}


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.json({ extended: false }));

/*** swagger start here ***/
// const swaggerUi = require('swagger-ui-express');
// const YAML = require('yamljs');
// const swaggerDocument = YAML.load('./swagger.yaml');
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
/*** swagger end here ***/



/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Base Api URL
 *     summary: Retrieve a list of JSONPlaceholder users.
 *     description: Retrieve a list of users from JSONPlaceholder. Can be used to populate a list of fake users when prototyping or testing an API.
 *     responses:
 *       200:
 *         description: A list of users.
 */
app.get('/', async (req, res, next) => {
  res.send('Welcome to hire2inspire API v1.')
})

/**
 * Base route always /api
 */
app.use('/api', router)

/**
 * Unavailable route handling
 */
app.use(async (req, res, next) => {
  next(createError.NotFound())
})

/**
 * handling all error repsonses
 */
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: true,
    status: err.status || 500,
    message: err.message
  })
})

const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})