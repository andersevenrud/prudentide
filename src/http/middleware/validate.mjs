/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { HttpValidationError } from '../exceptions/index.mjs'
import { convertData, mapFiles } from '../utils/schema.mjs'
import { validate } from '../utils/ajv.mjs'

export const withValidation = key => schema => (req, res, next) => {
  const cacheKey = `${req.method}:${key}:${req.route.path}`
  const body = req[key]
  const coerce = key === 'params' || key === 'query'
  const data = coerce ? convertData({ ...body }, schema) : body
  const checkValues = key === 'files' ? mapFiles(body) : data

  const { valid, errors } = validate({
    additionalProperties: false,
    ...schema
  }, checkValues, cacheKey)

  if (valid) {
    req[key] = data

    next()
  } else {
    next(new HttpValidationError(errors))
  }
}

export const withBodyValidation = withValidation('body')

export const withQueryValidation = withValidation('query')

export const withParamsValidation = withValidation('params')

export const withFilesValidation = withValidation('files')
