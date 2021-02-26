/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { HttpBadRequestError } from '../exceptions/index.mjs'
import {
  queryAddDevice,
  queryDeleteDevice
} from '../../database/repositories/userDevice.mjs'

export const registerDevice = req =>
  queryAddDevice(req.profile.id, req.body.deviceToken)

export const unregisterDevice = async (req) => {
  const result = await queryDeleteDevice(req.profile.id, req.params.device)
  if (!result) {
    throw new HttpBadRequestError('INVALID_DEVICE')
  }
}
