/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { convertTimestamps, convertToDateTimes } from '../utils.mjs'

export default class TaskAction extends Model {
  static get tableName () {
    return 'taskAction'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'taskId',
        'userId',
        'action',
        'scheduledAt'
      ],
      properties: {
        taskId: {
          type: 'integer'
        },
        userId: {
          type: 'integer'
        },
        action: {
          type: 'string',
          enum: [
            'assign',
            'close',
            'remind'
          ]
        },
        attributes: {
          oneOf: [
            {
              type: 'object'
            },
            { type: 'null' }
          ]
        },
        scheduledAt: {
          oneOf: [
            {
              type: 'string',
              format: 'date-time'
            },
            { type: 'null' }
          ]
        },
        processedAt: {
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

  static createRelationMappings ({
    Task,
    User
  }) {
    TaskAction.relationMappings = {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'taskAction.taskId',
          to: 'task.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'taskAction.userId',
          to: 'user.id'
        }
      }
    }
  }

  $parseDatabaseJson (json) {
    return convertTimestamps(
      super.$parseDatabaseJson(json)
    )
  }

  $formatDatabaseJson (json) {
    return convertToDateTimes(
      super.$formatDatabaseJson(json),
      ['scheduledAt']
    )
  }
}
