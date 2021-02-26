/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { UserDevice } from '../models/index.mjs'

export const queryAddDevice = (userId, deviceToken) => UserDevice
  .query()
  .insertAndFetch({
    userId,
    deviceToken
  })

export const queryDeleteDevice = (userId, id) => UserDevice
  .query()
  .delete()
  .where({
    id,
    userId
  })
