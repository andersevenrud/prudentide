/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { HttpForbiddenError, HttpAuthorizationError } from '../exceptions/index.mjs'
import { checkJwt } from '../../services/auth0.mjs'
import { queryUserFromIssuer } from '../../database/repositories/user.mjs'
import { mapCached } from '../../providers/cache.mjs'

const [
  queryUserFromIssuerCached
] = mapCached([
  queryUserFromIssuer
], { ttl: 5 })

export const withToken = checkJwt

export const withUserProfile = async (req, res, next) => {
  try {
    const user = await queryUserFromIssuerCached(req.user.sub)
    if (!user) {
      throw new HttpAuthorizationError()
    }

    req.profile = user

    next()
  } catch (err) {
    next(err)
  }
}

export const withRoles = (roles, all = false) => (req, res, next) => {
  const userRoles = req.profile.roles
  const fn = all ? 'every' : 'some'
  const granted = userRoles.includes('admin')
    ? true
    : roles[fn](n => userRoles.includes(n))

  if (!granted) {
    next(new HttpForbiddenError('MISSING_ROLE'))
    return
  }

  next()
}
