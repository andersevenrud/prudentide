/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { User } from '../models/index.mjs'

export const querySyncUserGroups = (id, groups) => User
  .query()
  .upsertGraph({
    id,
    groups
  }, { relate: true, unrelate: true })
