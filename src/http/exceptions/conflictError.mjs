/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import HttpError from './error.mjs'

export default class HttpConflictError extends HttpError {
  constructor (detail) {
    super({
      status: 409,
      message: 'Conflict',
      detail
    })
  }
}
