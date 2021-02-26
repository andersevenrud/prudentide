/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { timestamp, convertTimestamps } from '../utils.mjs'

export default class TaskComment extends Model {
  static get tableName () {
    return 'taskComment'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'taskId',
        'userId',
        'body'
      ],
      properties: {
        taskId: {
          type: 'integer'
        },
        userId: {
          type: 'integer'
        },
        body: {
          type: 'string'
        },
        sticky: {
          type: 'boolean'
        }
      }
    }
  }

  static createRelationMappings ({
    Task,
    User
  }) {
    TaskComment.relationMappings = {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'taskComment.taskId',
          to: 'task.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'taskComment.userId',
          to: 'user.id'
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
