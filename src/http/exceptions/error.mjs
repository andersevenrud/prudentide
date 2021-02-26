/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

export default class HttpError extends Error {
  constructor ({
    message,
    status,
    detail
  }) {
    super(message)

    this.status = status
    this.statusMessage = message
    this.detail = detail || null
  }

  get response () {
    return {
      code: this.status,
      message: this.statusMessage,
      detail: this.detail
    }
  }
}
