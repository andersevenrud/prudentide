/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { timestamp, convertTimestamps, softDelete } from '../utils.mjs'

export default class Project extends softDelete(Model) {
  static get tableName () {
    return 'project'
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
        lastActiveAt: {
          type: 'string',
          format: 'date-time'
        },
        archivedAt: {
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
    Webhook,
    Group,
    User,
    ProjectLabel,
    ProjectMilestone
  }) {
    Project.relationMappings = {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'project.userId',
          to: 'user.id'
        }
      },
      labels: {
        relation: Model.HasManyRelation,
        modelClass: ProjectLabel,
        join: {
          from: 'project.id',
          to: 'projectLabel.projectId'
        }
      },
      tasks: {
        filter: f => f.whereNotDeleted(),
        relation: Model.ManyToManyRelation,
        modelClass: Task,
        join: {
          from: 'project.id',
          to: 'task.id',
          through: {
            from: 'taskProject.projectId',
            to: 'taskProject.taskId'
          }
        }
      },
      webhooks: {
        relation: Model.HasManyRelation,
        modelClass: Webhook,
        join: {
          from: 'project.id',
          to: 'webhook.projectId'
        }
      },
      groups: {
        relation: Model.ManyToManyRelation,
        modelClass: Group,
        join: {
          from: 'project.id',
          to: 'group.id',
          through: {
            from: 'projectGroup.projectId',
            to: 'projectGroup.groupId'
          }
        }
      },
      milestones: {
        relation: Model.HasManyRelation,
        modelClass: ProjectMilestone,
        join: {
          from: 'project.id',
          to: 'projectMilestone.projectId'
        }
      }
    }
  }

  $beforeInsert () {
    this.lastActiveAt = timestamp()
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
}
