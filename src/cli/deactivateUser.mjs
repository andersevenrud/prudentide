/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { queryDeactivateUser } from '../database/repositories/user.mjs'

export default async ({
  logger,
  args: { id }
}) => {
  const user = await queryDeactivateUser(id)
  logger.info(`Deactivated user: ${user.id}`)
  return user
}
