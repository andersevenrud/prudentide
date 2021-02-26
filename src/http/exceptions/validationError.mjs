/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import HttpError from './error.mjs'

export default class HttpValidationError extends HttpError {
  constructor (data) {
    super({
      status: 422,
      message: 'Unprocessable Entity'
    })

    this.data = data
  }

  get response () {
    return {
      code: this.status,
      message: this.statusMessage,
      detail: null,
      validation: this.data
    }
  }
}
