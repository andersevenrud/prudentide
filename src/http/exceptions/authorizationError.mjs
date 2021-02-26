/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import HttpError from './error.mjs'

export default class HttpAuthorizationError extends HttpError {
  constructor (detail) {
    super({
      status: 401,
      message: 'Unauthorized',
      detail
    })
  }
}
