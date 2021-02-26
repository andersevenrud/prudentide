/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { timestamp, convertTimestamps } from '../utils.mjs'

export default class ProjectMilestone extends Model {
  static get tableName () {
    return 'projectMilestone'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'projectId',
        'name'
      ],
      properties: {
        projectId: {
          type: 'integer'
        },
        name: {
          type: 'string'
        },
        body: {
          type: ['string', 'null']
        },
        closedAt: {
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
    Project
  }) {
    ProjectMilestone.relationMappings = {
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'projectMilestone.projectId',
          to: 'project.id'
        }
      },
      tasks: {
        relation: Model.ManyToManyRelation,
        modelClass: Task,
        join: {
          from: 'projectMilestone.id',
          to: 'task.id',
          through: {
            from: 'taskProjectMilestone.projectMilestoneId',
            to: 'taskProjectMilestone.taskId'
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
