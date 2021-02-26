/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { timestamp, convertTimestamps } from '../utils.mjs'

export default class ProjectLabel extends Model {
  static get tableName () {
    return 'projectLabel'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'name'
      ],
      properties: {
        projectId: {
          type: 'integer'
        },
        name: {
          type: 'string'
        },
        priority: {
          type: 'integer'
        }
      }
    }
  }

  static createRelationMappings ({
    Project,
    Task
  }) {
    ProjectLabel.relationMappings = {
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'projectLabel.projectId',
          to: 'project.id'
        }
      },
      tasks: {
        relation: Model.ManyToManyRelation,
        modelClass: Task,
        join: {
          from: 'projectLabel.id',
          to: 'task.id',
          through: {
            from: 'taskProjectLabel.projectLabelId',
            to: 'taskProjectLabel.taskId'
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
