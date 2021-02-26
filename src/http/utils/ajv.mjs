/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import Ajv from 'ajv'

// NOTE: This is because of interop with jest+babel and node+esm
//       mostly because the library does not ship as a module
const AjvClass = Ajv.default || Ajv

export const ajv = new AjvClass({
  allErrors: true
})

// In the HTTP request body a "binary" is an object
// so we can naively validate this because the actual
// check is the validation middleware
ajv.addFormat('binary', {
  validate: () => true,
  type: 'string'
})

ajv.addFormat(
  'date-time',
  /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i
)

const caches = {}

const validatorFromCache = (schema, cacheKey) => {
  if (!caches[cacheKey]) {
    caches[cacheKey] = ajv.compile(schema)
  }
  return caches[cacheKey]
}

export const validate = (schema, data, cacheKey) => {
  const validator = validatorFromCache(schema, cacheKey)
  const valid = validator(data)

  return {
    valid,
    errors: validator.errors
  }
}
