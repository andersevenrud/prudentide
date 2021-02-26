/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

// Lodash equivalent
export const sortedUniq = arr => [...new Set(arr)].sort()

// Lodash equivalent
export const uniqBy = (arr, predicate) => {
  const cb = typeof predicate === 'function'
    ? predicate
    : o => o[predicate]

  const result = arr.reduce((map, item) => {
    const key = (item === null || item === undefined)
      ? item
      : cb(item)

    if (!map.has(key)) {
      map.set(key, item)
    }

    return map
  }, new Map())

  return [...result.values()]
}

export const isTrue = value => [1, '1', true, 'true', 'on', 'yes'].includes(
  String(value).toLowerCase()
)

export const variableOrDefault = (variable, defaultValue, parser) => variable === undefined
  ? defaultValue
  : parser(variable)

export const variableAsFloat = (variable, defaultValue) =>
  variableOrDefault(variable, defaultValue, v => parseFloat(v))

export const variableAsInteger = (variable, defaultValue) =>
  variableOrDefault(variable, defaultValue, v => parseInt(v, 10))

export const variableAsString = (variable, defaultValue) =>
  variableOrDefault(variable, defaultValue, v => String(v))

export const variableAsBoolean = (variable, defaultValue) =>
  variableOrDefault(variable, defaultValue, isTrue)
