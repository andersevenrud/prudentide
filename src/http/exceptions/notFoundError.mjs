/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import HttpError from './error.mjs'

export default class HttpNotFoundError extends HttpError {
  constructor (detail) {
    super({
      status: 404,
      message: 'Not found',
      detail
    })
  }
}
