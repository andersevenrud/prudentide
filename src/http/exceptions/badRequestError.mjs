/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import HttpError from './error.mjs'

export default class HttpBadRequestError extends HttpError {
  constructor (detail) {
    super({
      status: 400,
      message: 'Bad request',
      detail
    })
  }
}
