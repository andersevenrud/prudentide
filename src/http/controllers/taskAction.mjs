/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { invalidateTags } from '../../providers/cache.mjs'
import { HttpValidationError } from '../exceptions/index.mjs'
import { validate } from '../utils/ajv.mjs'
import {
  queryCreateAction,
  queryUpdateAction,
  queryDeleteAction,
  queryActions
} from '../../database/repositories/taskAction.mjs'
import schema from '../schemas/taskAction.mjs'

const validateSchema = (values, action) => {
  const { valid, errors } = validate(
    {
      additionalProperties: false,
      ...schema
    },
    {
      action: action.action,
      attributes: action.attributes,
      scheduledAt: action.scheduledAt,
      ...values
    },
    'taskAction'
  )

  if (!valid) {
    throw new HttpValidationError(errors)
  }
}

export const createAction = req => {
  validateSchema(req.body, {})

  return queryCreateAction(
    req.params.task,
    req.profile.id,
    req.body
  )
}

export const updateAction = async (req) => {
  validateSchema(req.body, req.bindings.action)

  const action = await queryUpdateAction(req.params.action, req.body)

  await invalidateTags(`action:${action.id}`)

  return action
}

export const deleteAction = req =>
  queryDeleteAction(req.params.action)

export const listActions = req => queryActions(req.params.task)
