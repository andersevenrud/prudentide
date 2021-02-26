/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import HttpError from './error.mjs'

export default class HttpForbiddenError extends HttpError {
  constructor (detail) {
    super({
      status: 403,
      message: 'Forbidden',
      detail
    })
  }
}
