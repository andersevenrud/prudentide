/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

const schema = {
  type: 'object',
  properties: {
    action: {
      type: 'string'
    },
    attributes: {
      type: 'object'
    },
    scheduledAt: {
      type: 'string'
    }
  },
  allOf: [
    {
      if: {
        properties: {
          action: {
            const: 'assign'
          }
        }
      },
      then: {
        properties: {
          attributes: {
            required: ['to'],
            type: 'object',
            properties: {
              to: {
                type: 'integer'
              }
            }
          }
        }
      }
    },
    {
      if: {
        properties: {
          action: {
            const: 'close'
          }
        }
      },
      then: {
        properties: {
          attributes: {
            type: 'object',
            nullable: true
          }
        }
      }
    },
    {
      if: {
        properties: {
          action: {
            const: 'remind'
          }
        }
      },
      then: {
        properties: {
          attributes: {
            required: ['remind'],
            type: 'object',
            properties: {
              remind: {
                type: 'string',
                enum: [
                  'creator',
                  'assignees',
                  'watchers',
                  'everybody'
                ]
              }
            }
          }
        }
      }
    }
  ]
}

export default schema
