/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { timestamp, convertTimestamps } from '../utils.mjs'

export default class Group extends Model {
  static get tableName () {
    return 'group'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'name'
      ],
      properties: {
        parentId: {
          type: 'integer'
        },
        name: {
          type: 'string'
        },
        body: {
          type: ['string', 'null']
        }
      }
    }
  }

  /* istanbul ignore next */
  static createRelationMappings ({
    User,
    Project
  }) {
    Group.relationMappings = {
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'group.parentId',
          to: 'group.id'
        }
      },
      projects: {
        filter: f => f.whereNotDeleted(),
        relation: Model.ManyToManyRelation,
        modelClass: Project,
        join: {
          from: 'group.id',
          to: 'project.id',
          through: {
            from: 'projectGroup.groupId',
            to: 'projectGroup.projectId'
          }
        }
      },
      users: {
        filter: f => f.whereNotDeleted(),
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'group.id',
          to: 'user.id',
          through: {
            from: 'userGroup.groupId',
            to: 'userGroup.userId'
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
