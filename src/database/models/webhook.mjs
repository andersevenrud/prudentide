/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { timestamp, convertTimestamps } from '../utils.mjs'

export default class Webhook extends Model {
  static get tableName () {
    return 'webhook'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'projectId',
        'url',
        'token'
      ],
      properties: {
        projectId: {
          type: 'integer'
        },
        method: {
          oneOf: [
            {
              type: 'string',
              enum: [
                'post',
                'put',
                'get'
              ]
            },
            { type: 'null' }
          ]
        },
        url: {
          type: 'string',
          pattern: '^https?:'
        },
        token: {
          type: 'string'
        },
        headers: {
          oneOf: [
            {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            {
              type: 'null'
            }
          ]
        },
        events: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'task:open',
              'task:close',
              'task:update',
              'task:comment'
            ]
          },
          default: [
            'task:close'
          ]
        }
      }
    }
  }

  static createRelationMappings ({
    Project
  }) {
    Webhook.relationMappings = {
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'webhook.projectId',
          to: 'project.id'
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
