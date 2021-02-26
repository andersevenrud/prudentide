/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { convertTimestamps } from '../utils.mjs'

export default class TaskAttachment extends Model {
  static get tableName () {
    return 'taskAttachment'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'taskId',
        'userId',
        'filename',
        'hash'
      ],
      properties: {
        taskId: {
          type: 'integer'
        },
        userId: {
          type: 'integer'
        },
        filename: {
          type: 'string'
        },
        hash: {
          type: 'string'
        }
      }
    }
  }

  static createRelationMappings ({
    Task,
    User
  }) {
    TaskAttachment.relationMappings = {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'taskAttachments.taskId',
          to: 'tasks.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'taskAttachments.userId',
          to: 'users.id'
        }
      }
    }
  }

  $parseDatabaseJson (json) {
    return convertTimestamps(
      super.$parseDatabaseJson(json)
    )
  }
}
