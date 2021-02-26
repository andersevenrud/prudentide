/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import objectionSoftDelete from 'objection-js-soft-delete'
import { knex } from '../services/database.mjs'

// NOTE: This is because of interop with jest+babel and node+esm
//       mostly because the library does not ship as a module
const softDeletionWrapper = objectionSoftDelete.default || objectionSoftDelete

export const timestamp = (now = new Date()) => now
  .toISOString()
  .slice(0, 19)
  .replace('T', ' ')

export const timestampToISO = (timestamp) => {
  /* istanbul ignore next */
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }

  return timestamp
    ? timestamp.replace(' ', 'T') + '.000Z'
    : timestamp
}

export const convertTimestamps = (row) => {
  const entries = Object
    .entries(row)
    .filter(([k]) => k !== 'deletedAt')
    .map(([k, v]) => [
      k,
      k.substr(-2) === 'At' ? timestampToISO(v) : v
    ])

  return Object.fromEntries(entries)
}

export const convertToDateTimes = (row, keys) => {
  const newTimes = Object.fromEntries(
    keys.map(k => [
      k,
      row[k] ? timestamp(new Date(row[k])) : row[k]
    ])
  )

  return {
    ...row,
    ...newTimes
  }
}

export const usingFilters = filtersFns => (builder, filters) => Object
  .entries(filters)
  .filter(([k]) => !!filtersFns[k])
  .reduce((acc, [name, value]) => {
    return filtersFns[name](acc)(value)
  }, builder)

export const softDelete = softDeletionWrapper({
  columnName: 'deletedAt',
  deletedValue: knex.fn.now(),
  notDeletedValue: null
})
