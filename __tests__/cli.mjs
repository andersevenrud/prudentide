/* eslint-env jest */

import { connectDatabase, disconnectDatabase, knex } from '../src/services/database.mjs'
import activateUser from '../src/cli/activateUser.mjs'
import deactivateUser from '../src/cli/deactivateUser.mjs'
import addUser from '../src/cli/addUser.mjs'
import assignUserGroups from '../src/cli/assignUserGroups.mjs'
import createGroup from '../src/cli/createGroup.mjs'
import listGroups from '../src/cli/listGroups.mjs'

const logger = {
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn()
}

const execCommand = (fn, options = {}) => fn({
  logger,
  ...options
})

describe('CLI', () => {
  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('createGroup', () => {
    test('should add groups', async () => {
      await execCommand(createGroup, { args: { name: 'group1' } })
      await execCommand(createGroup, { args: { name: 'group2' } })
      await execCommand(createGroup, { args: { name: 'group3' } })
      await execCommand(createGroup, { args: { name: 'group4' } })
    })
  })

  describe('listGroups', () => {
    test('should list groups', async () => {
      const list = await execCommand(listGroups)
      expect(list).toMatchObject([
        { name: 'group1' },
        { name: 'group2' },
        { name: 'group3' },
        { name: 'group4' }
      ])
    })
  })

  describe('addUser', () => {
    test('should add user', async () => {
      const user = await execCommand(addUser, {
        args: {
          email: 'cli@localhost',
          username: 'cli',
          name: 'CLI'
        },
        options: {
          sub: 'sub',
          roles: 'admin'
        }
      })

      expect(user).toMatchObject({
        id: 1,
        email: 'cli@localhost',
        username: 'cli',
        name: 'CLI',
        sub: 'sub',
        locale: 'en'
      })
    })

    test('should add user with groups', async () => {
      const user = await execCommand(addUser, {
        args: {
          email: 'cli2@localhost',
          username: 'cli2',
          name: 'CLI'
        },
        options: {
          sub: 'sub2',
          groups: '1,2,3'
        }
      })

      expect(user).toMatchObject({
        id: 2,
        groups: [
          {
            id: 1,
            permission: 'default'
          },
          {
            id: 2,
            permission: 'default'
          },
          {
            id: 3,
            permission: 'default'
          }
        ]
      })
    })

    test('should add user with groups and permissions', async () => {
      const user = await execCommand(addUser, {
        args: {
          email: 'cli3@localhost',
          username: 'cli3',
          name: 'CLI'
        },
        options: {
          sub: 'sub3',
          groups: '1,2,3',
          permission: 'admin'
        }
      })

      expect(user).toMatchObject({
        id: 3,
        groups: [
          {
            id: 1,
            permission: 'admin'
          },
          {
            id: 2,
            permission: 'admin'
          },
          {
            id: 3,
            permission: 'admin'
          }
        ]
      })
    })
  })

  describe('deactivateUser', () => {
    test('should deactivate user', async () => {
      const user = await execCommand(deactivateUser, {
        args: {
          id: 1
        }
      })

      expect(user.deactivatedAt === null).toBe(false)
    })
  })

  describe('activateUser', () => {
    test('should (re)activate user', async () => {
      const user = await execCommand(activateUser, {
        args: {
          id: 1
        }
      })

      expect(user.deactivatedAt === null).toBe(true)
    })
  })

  describe('assignUserGroups', () => {
    test('should set groups', async () => {
      const user = await execCommand(assignUserGroups, {
        args: {
          id: 1
        },
        options: {
          add: false,
          groups: '2,3,4'
        }
      })

      expect(user.groups.map(g => g.id).sort()).toEqual([2, 3, 4])
    })

    test('should add groups', async () => {
      const user = await execCommand(assignUserGroups, {
        args: {
          id: 1
        },
        options: {
          add: true,
          groups: '1'
        }
      })

      expect(user.groups.map(g => g.id).sort()).toEqual([1, 2, 3, 4])
    })
  })
})
