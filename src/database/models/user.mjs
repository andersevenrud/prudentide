/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { timestamp, convertTimestamps, softDelete } from '../utils.mjs'
import config from '../../config.mjs'

export default class User extends softDelete(Model) {
  static get tableName () {
    return 'user'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'name',
        'username',
        'email',
        'sub'
      ],
      properties: {
        name: {
          type: 'string'
        },
        username: {
          type: 'string'
        },
        email: {
          type: 'string',
          format: 'email'
        },
        mobile: {
          type: ['string', 'null']
        },
        locale: {
          type: 'string',
          default: config.app.defaultLocale
        },
        sub: {
          type: 'string'
        },
        roles: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'admin',
              'read:project',
              'create:project',
              'update:project',
              'read:task',
              'create:task',
              'update:task',
              'task:comment',
              'create:webhook',
              'update:webhook'
            ]
          }
        },
        deactivatedAt: {
          oneOf: [
            {
              type: 'string',
              format: 'date-time'
            },
            { type: 'null' }
          ]
        }
      }
    }
  }

  /* istanbul ignore next */
  static createRelationMappings ({
    Task,
    UserDevice,
    Group
  }) {
    User.relationMappings = {
      tasks: {
        filter: f => f.whereNotDeleted(),
        relation: Model.HasManyRelation,
        modelClass: Task,
        join: {
          from: 'user.id',
          to: 'task.userId'
        }
      },
      devices: {
        relation: Model.HasManyRelation,
        modelClass: UserDevice,
        join: {
          from: 'user.id',
          to: 'userDevice.userId'
        }
      },
      groups: {
        relation: Model.ManyToManyRelation,
        modelClass: Group,
        join: {
          from: 'user.id',
          to: 'group.id',
          through: {
            from: 'userGroup.userId',
            to: 'userGroup.groupId',
            extra: ['permission']
          }
        }
      }
    }
  }

  $beforeUpdate () {
    this.updatedAt = timestamp()
  }

  $parseDatabaseJson (json) {
    return convertTimestamps(
      super.$parseDatabaseJson(json)
    )
  }
}
