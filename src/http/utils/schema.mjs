/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

const coercers = {
  integer: v => parseInt(v, 10),
  array: (v, t) => v
    .split(',')
    .map(s => s.trim())
    .map(s => t === 'integer' ? parseInt(s, 10) : s)
}

export const filterFromParameters = (schema, type) => (method, path) => {
  const parameters = schema.paths[path][method].parameters || []

  return parameters
    .filter(param => param.in === type)
    .reduce((carry, param) => {
      if (param.required) {
        carry.required.push(param.name)
      }

      carry.properties[param.name] = param.schema

      return carry
    }, {
      type: 'object',
      required: [],
      properties: {}
    })
}

const combineAllOfRecursive = (allOf, baseEntry) => allOf
  .reduce((carry, item) => {
    const { required, properties, ...rest } = item

    if (required) {
      carry.required = [...carry.required, ...required]
    }

    if (properties) {
      carry.properties = { ...carry.properties, ...properties }
    }

    /* istanbul ignore next */
    if (rest.allOf) {
      return combineAllOfRecursive(rest.allOf, carry)
    }

    return carry
  }, baseEntry)

export const convertRequestBodyContent = (schema, type) => (method, path) => {
  const s = schema.paths[path][method]?.requestBody?.content[type]?.schema
  if (s && s.allOf) {
    const { allOf, ...rest } = s
    return combineAllOfRecursive(allOf, {
      type: 'object',
      required: [],
      properties: {},
      ...rest
    })
  }

  return s
}

export const convertData = (data, schema) => {
  const entries = Object.entries(data)
  const newEntries = entries
    .filter(([k]) => k.substr(0, 1) !== '_') // FIXME: This should probably be moved
    .map(([k, v]) => {
      const p = schema.properties[k]

      /* istanbul ignore else */
      if (p) {
        const fn = coercers[p.format] || coercers[p.type]
        const newValue = fn ? fn(v, p.items?.type) : v

        return [k, newValue]
      } else {
        return [k, v]
      }
    })

  return Object.fromEntries(newEntries)
}

export const mapFiles = body => Object
  .fromEntries(Object
    .entries(body || {})
    .map(([k, v]) => [k, v.name]))
