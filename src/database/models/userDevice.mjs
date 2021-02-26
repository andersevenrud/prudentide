/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import { convertTimestamps } from '../utils.mjs'

export default class UserDevice extends Model {
  static get tableName () {
    return 'userDevice'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'userId',
        'deviceToken'
      ],
      properties: {
        userId: {
          type: 'integer'
        },
        deviceToken: {
          type: 'string'
        }
      }
    }
  }

  static createRelationMappings ({
    User
  }) {
    UserDevice.relationMappings = {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'userDevice.id',
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
}
