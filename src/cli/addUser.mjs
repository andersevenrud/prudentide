/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import * as jdenticon from 'jdenticon'
import { saveFile } from '../providers/storage.mjs'
import { queryMyUser, queryCreateUser } from '../database/repositories/user.mjs'
import { querySyncUserGroups } from '../database/repositories/userGroup.mjs'

/* istanbul ignore next */
// NOTE: This is because of interop with jest+babel and node+esm
//       mostly because the library does not ship as a module
const jdenticonFixed = jdenticon.default || jdenticon

export default async ({
  logger,
  args,
  options: {
    roles,
    groups,
    permission,
    ...options
  }
}) => {
  const avatar = Date.now().toString()
  const png = jdenticonFixed.toPng(args.username, 200)
  const expandedRoles = typeof roles === 'string' ? roles.split(',') : []

  const user = await queryCreateUser({
    ...args,
    ...options,
    roles: expandedRoles
  })

  logger.info(`Inserted user '${user.email}': ${user.id}`)

  if (typeof groups === 'string') {
    const list = groups.split(',').map(id => ({ id, permission }))
    await querySyncUserGroups(user.id, list)
    logger.info(`Updated user '${user.email}' groups: ${groups}`)
  }

  await saveFile('avatars', user.id, avatar, png)

  return queryMyUser(user.id)
}
