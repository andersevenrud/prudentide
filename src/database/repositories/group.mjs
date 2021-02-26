/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Group } from '../models/index.mjs'

export const queryGroup = id => Group
  .query()
  .findById(id)

export const queryListGroups = parentId => Group
  .query()
  .where('parentId', parentId || null)

export const queryCreateGroup = group => Group
  .query()
  .insertAndFetch(group)

export const queryUpdateGroup = (id, group) => Group
  .query()
  .patchAndFetchById(id, group)

export const queryGroupsByIds = ids => Group
  .query()
  .whereIn('id', ids)

export const queryViewGroup = id => Group
  .query()
  .findById(id)
  .withGraphFetched('parent')

export const queryGroupUsersDeep = ids => Group
  .relatedQuery('users')
  .withGraphFetched('devices')
  .for(ids)
