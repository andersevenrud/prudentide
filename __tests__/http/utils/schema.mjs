/* eslint-env jest */

import { convertData } from '../../../src/http/utils/schema.mjs'

describe('http/utils/schema', () => {
  describe('convertData', () => {
    test('should convert data', () => {
      const values = convertData({
        number: 123,
        string: 'abc'
      }, {
        properties: {
          number: {
            type: 'integer'
          },
          string: {
            type: 'string'
          }
        }
      })
      expect(values).toMatchObject({
        number: 123,
        string: 'abc'
      })
    })
  })
})
