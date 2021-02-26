/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { queryMyUser } from '../database/repositories/user.mjs'
import { querySyncUserGroups } from '../database/repositories/userGroup.mjs'

export default async ({
  logger,
  args: {
    id
  },
  options: {
    groups,
    add
  }
}) => {
  const user = await queryMyUser(id)
  const initial = add ? user.groups.map(g => g.id) : []
  const list = [
    ...initial,
    ...groups.split(',')
  ].map(id => ({ id }))

  await querySyncUserGroups(user.id, list)

  logger.info(`Updated user '${user.email}' with groups: ${groups}`)

  return queryMyUser(id)
}
