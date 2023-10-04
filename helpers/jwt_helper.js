const JWT = require('jsonwebtoken')
const createError = require('http-errors')

module.exports = {
  signAccessToken: (userId, dataModel) => {
    return new Promise((resolve, reject) => {
      const payload = {model: dataModel}
      const secret = process.env.ACCESS_TOKEN_SECRET
      const options = {
        expiresIn: '1hr',
        audience: userId,
      }
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message)
          reject(createError.InternalServerError())
          return
        }
        resolve(token)
      })
    })
  },

  verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized())
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
        return next(createError.Unauthorized(message))
      }
      req.payload = payload
      next()
    })
  },

  signRefreshToken: (userId, dataModel) => {
    return new Promise((resolve, reject) => {
      const payload = {model: dataModel}
      const secret = process.env.REFRESH_TOKEN_SECRET
      const options = {
        expiresIn: '1y',
        audience: userId,
      }
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message)
          // reject(err)
          reject(createError.InternalServerError())
        }
        resolve(token)

      })
    })
  },
  
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject(createError.Unauthorized())
          const userId = payload.aud
          const dataModel = payload.model

          if (refreshToken) return resolve(userId, dataModel)
          reject(createError.Unauthorized())
        }
      )
    })
  },

  getUserViaToken: (accessToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        (err, payload) => {
          // if (err) return reject(createError.Unauthorized())
          const userId = payload?.aud
          const dataModel = payload?.model

          if (accessToken) return resolve({userId, dataModel})
          reject(createError[401]("User unauthorized."))
        }
      )
    })
  },

}
