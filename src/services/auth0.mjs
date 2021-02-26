/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import config from '../config.mjs'

export const checkJwt = jwt({
  audience: config.auth0.audience,
  issuer: config.auth0.domain.replace(/\/?$/, '/'),
  algorithms: config.auth0.algorithms,
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${config.auth0.domain}/.well-known/jwks.json`
  })
})
