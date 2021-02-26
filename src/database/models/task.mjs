/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import {
  timestamp,
  convertTimestamps,
  convertToDateTimes,
  softDelete
} from '../utils.mjs'

export default class Task extends softDelete(Model) {
  static get tableName () {
    return 'task'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'name',
        'userId'
      ],
      properties: {
        userId: {
          type: 'integer'
        },
        name: {
          type: 'string'
        },
        body: {
          type: ['string', 'null']
        },
        data: {
          type: 'object',
          default: {}
        },
        attributes: {
          type: 'object',
          default: {}
        },
        notify: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'email',
              'push',
              'sms'
            ]
          },
          default: [
            'email',
            'push'
          ]
        },
        lastActiveAt: {
          type: 'string',
          format: 'date-time'
        },
        closedAt: {
          oneOf: [
            {
              type: 'string',
              format: 'date-time'
            },
            { type: 'null' }
          ]
        },
        expiresAt: {
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
    Project,
    ProjectLabel,
    ProjectMilestone,
    User,
    TaskComment,
    TaskAttachment,
    TaskAction
  }) {
    Task.relationMappings = {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'task.userId',
          to: 'user.id'
        }
      },
      projects: {
        relation: Model.ManyToManyRelation,
        modelClass: Project,
        join: {
          from: 'task.id',
          to: 'project.id',
          through: {
            from: 'taskProject.taskId',
            to: 'taskProject.projectId'
          }
        }
      },
      assignees: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'task.id',
          to: 'user.id',
          through: {
            from: 'taskAssignee.taskId',
            to: 'taskAssignee.userId'
          }
        }
      },
      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: ProjectLabel,
        join: {
          from: 'task.id',
          to: 'projectLabel.id',
          through: {
            from: 'taskProjectLabel.taskId',
            to: 'taskProjectLabel.projectLabelId'
          }
        }
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: TaskComment,
        join: {
          from: 'task.id',
          to: 'taskComment.taskId'
        }
      },
      attachments: {
        relation: Model.HasManyRelation,
        modelClass: TaskAttachment,
        join: {
          from: 'task.id',
          to: 'taskAttachment.taskId'
        }
      },
      watchers: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'task.id',
          to: 'user.id',
          through: {
            from: 'taskWatcher.taskId',
            to: 'taskWatcher.userId'
          }
        }
      },
      milestones: {
        relation: Model.ManyToManyRelation,
        modelClass: ProjectMilestone,
        join: {
          from: 'task.id',
          to: 'projectMilestone.id',
          through: {
            from: 'taskProjectMilestone.taskId',
            to: 'taskProjectMilestone.projectMilestoneId'
          }
        }
      },
      actions: {
        relation: Model.HasManyRelation,
        modelClass: TaskAction,
        join: {
          from: 'task.id',
          to: 'taskAction.taskId'
        }
      }
    }
  }

  $beforeUpdate () {
    this.updatedAt = timestamp()
    this.lastActiveAt = timestamp()
  }

  $parseDatabaseJson (json) {
    return convertTimestamps(
      super.$parseDatabaseJson(json)
    )
  }

  $formatDatabaseJson (json) {
    return convertToDateTimes(
      super.$formatDatabaseJson(json),
      ['expiresAt', 'closedAt']
    )
  }

  static relatedQuery (tableName, trx) {
    return trx
      ? super.relatedQuery(tableName, trx)
      : super.relatedQuery(tableName)
  }
}
