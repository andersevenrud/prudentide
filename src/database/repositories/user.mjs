/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { knex } from '../../services/database.mjs'
import { User } from '../models/index.mjs'

export const queryUser = id => User
  .query()
  .findById(id)

export const queryUserFromIssuer = sub => User
  .query()
  .where('sub', sub)
  .whereNull('deactivatedAt')
  .withGraphFetched('groups')
  .first()

export const queryMyUser = id => User
  .query()
  .findById(id)
  .withGraphFetched('devices')
  .withGraphFetched('groups')

export const queryUpdateUser = (id, values) => User
  .query()
  .patchAndFetchById(id, values)

export const queryActivateUser = id => User
  .query()
  .patchAndFetchById(id, {
    deactivatedAt: null
  })

export const queryDeactivateUser = id => User
  .query()
  .patchAndFetchById(id, {
    deactivatedAt: knex.fn.now()
  })

export const queryCreateUser = user => User
  .query()
  .insertAndFetch(user)

export const queryViewUser = id => User
  .query()
  .findById(id)
  .select('id', 'username', 'name', 'email')

export const queryUsersByIds = ids => User
  .query()
  .whereIn('id', ids)
