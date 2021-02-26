/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import caporal from '@caporal/core'
import { connectDatabase, disconnectDatabase } from '../src/services/database.mjs'
import onAddUser from '../src/cli/addUser.mjs'
import onDeactivateUser from '../src/cli/deactivateUser.mjs'
import onActivateUser from '../src/cli/activateUser.mjs'
import onAssignUserGroups from '../src/cli/assignUserGroups.mjs'
import onCreateGroup from '../src/cli/createGroup.mjs'
import onListGroups from '../src/cli/listGroups.mjs'

const { program } = caporal

const withServices = cb => async (...args) => {
  await connectDatabase(false)

  try {
    /* eslint-disable node/no-callback-literal */
    await cb(...args)
  } finally {
    await disconnectDatabase()
  }
}

program
  .name('Prudentite commandline utilities')

  .command('add-user', 'Adds a new user')
  .argument('<username>', 'Username')
  .argument('<email>', 'User email address')
  .argument('<sub>', 'Token sub')
  .option('--name <name>', 'User full name', { required: true })
  .option('--roles <comma-separated-roles>', { required: true })
  .option('--groups <comma-separated-ids>')
  .option('--locale <locale>')
  .action(withServices(onAddUser))

  .command('deactivate-user', 'Deactivates a user')
  .argument('<id>', 'User id')
  .action(withServices(onDeactivateUser))

  .command('activate-user', '(Re-)activates a user')
  .argument('<id>', 'User id')
  .action(withServices(onActivateUser))

  .command('assign-user-groups', 'Assigns groups to a user')
  .argument('<id>', 'User id')
  .option('--groups <comma-separated-ids>', { required: true })
  .option('--permission <permission>', 'Group permission (admin/null)')
  .option('--add', 'Add instead of replacing')
  .action(withServices(onAssignUserGroups))

  .command('create-group', 'Creates a new group')
  .argument('<name>', 'Group name')
  .action(withServices(onCreateGroup))

  .command('list-groups', 'Lists all groups')
  .action(withServices(onListGroups))

program.run()
