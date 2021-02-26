/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { UnauthorizedError } from 'express-jwt'
import { HttpError, HttpNotFoundError } from '../exceptions/index.mjs'
import logger from '../../services/logger.mjs'
import config from '../../config.mjs'

export const useNotFound = (req, res, next) => {
  next(new HttpNotFoundError())
}

export const useErrorCatcher = (err, req, res, next) => {
  /* istanbul ignore next */
  const stack = config.production ? undefined : err.stack

  const response = {
    code: 500,
    message: 'Internal server error',
    detail: null,
    stack
  }

  /* istanbul ignore else */
  if (err instanceof HttpError) {
    Object.assign(response, err.response)
  } else if (err instanceof UnauthorizedError) {
    Object.assign(response, {
      code: err.status,
      message: err.inner.message
    })
  } else {
    logger.log({
      level: 'alert',
      message: err.stack
    })
  }

  res
    .status(response.code)
    .json(response)
}
