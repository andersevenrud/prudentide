/* eslint-env jest */

import * as utils from '../../src/utils/primitives.mjs'

describe('utils/primitives', () => {
  describe('sortedUniq', () => {
    test('should be unique and sorted', () => {
      expect(utils.sortedUniq([9, 8, 7, 6, 5, 5, 5, 4, 3, 3, 3, 2, 1]))
        .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('uniqBy', () => {
    test('should be unique', () => {
      const input = [
        {
          name: 'jest',
          role: 'foo'
        },
        {
          name: 'jest2',
          role: 'foo'
        }
      ]

      expect(utils.uniqBy(input, 'name')).toMatchObject([
        {
          name: 'jest'
        },
        {
          name: 'jest2'
        }
      ])

      expect(utils.uniqBy(input, o => o.name)).toMatchObject([
        {
          name: 'jest'
        },
        {
          name: 'jest2'
        }
      ])

      expect(utils.uniqBy(input, o => o.role)).toMatchObject([
        {
          role: 'foo'
        }
      ])
    })
    test('should catch null-ish values', () => {
      expect(utils.uniqBy([
        {
          name: 'jest'
        },
        null,
        undefined
      ], 'name')).toMatchObject([
        {
          name: 'jest'
        },
        null,
        undefined
      ])
    })
  })

  describe('isTrue', () => {
    test('should be true', () => {
      expect(utils.isTrue(1)).toBe(true)
      expect(utils.isTrue(true)).toBe(true)
      expect(utils.isTrue('YES')).toBe(true)
    })

    test('should be false', () => {
      expect(utils.isTrue(0)).toBe(false)
      expect(utils.isTrue(false)).toBe(false)
      expect(utils.isTrue('NO')).toBe(false)
    })
  })

  describe('variableOrDefault', () => {
    test('should be default value', () => {
      expect(utils.variableOrDefault(undefined, 'default value')).toBe('default value')
    })
    test('should be parsed value', () => {
      expect(utils.variableOrDefault('parsed value', undefined, v => v)).toBe('parsed value')
    })
  })

  describe('variableAsFloat', () => {
    test('should be default value', () => {
      expect(utils.variableAsFloat(undefined, 1.1)).toBe(1.1)
    })
    test('should be parsed value', () => {
      expect(utils.variableAsFloat('1.1')).toBe(1.1)
    })
  })

  describe('variableAsInteger', () => {
    test('should be default value', () => {
      expect(utils.variableAsInteger(undefined, 666)).toBe(666)
    })
    test('should be parsed value', () => {
      expect(utils.variableAsInteger('123')).toBe(123)
    })
  })

  describe('variableAsString', () => {
    test('should be default value', () => {
      expect(utils.variableAsString(undefined, 'foo')).toBe('foo')
    })
    test('should be parsed value', () => {
      expect(utils.variableAsString(123)).toBe('123')
    })
  })

  describe('variableAsBoolean', () => {
    test('should be default value', () => {
      expect(utils.variableAsBoolean(undefined, true)).toBe(true)
    })
    test('should be parsed value', () => {
      expect(utils.variableAsBoolean('1')).toBe(true)
    })
  })
})
