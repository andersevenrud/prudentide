/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { queryActivateUser } from '../database/repositories/user.mjs'

export default async ({
  logger,
  args: { id }
}) => {
  const user = await queryActivateUser(id)
  logger.info(`Re-activated user: ${user.id}`)
  return user
}
