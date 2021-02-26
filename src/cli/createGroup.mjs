/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { queryCreateGroup } from '../database/repositories/group.mjs'

export default async ({
  logger,
  args: {
    name
  }
}) => {
  const group = await queryCreateGroup({ name })
  logger.info(`Created group: ${group.id}`)
  return group
}
