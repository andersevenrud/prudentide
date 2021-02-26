/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { queryListGroups } from '../database/repositories/group.mjs'

export default async ({
  logger
}) => {
  const groups = await queryListGroups()

  groups.forEach(
    group => logger.info(`${group.id} - ${group.name}`)
  )

  return groups
}
