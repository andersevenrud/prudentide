/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import {
  HttpBadRequestError
} from '../exceptions/index.mjs'
import { invalidateTags } from '../../providers/cache.mjs'
import {
  queryGroup,
  queryListGroups,
  queryCreateGroup,
  queryUpdateGroup,
  queryViewGroup
} from '../../database/repositories/group.mjs'

export const listGroups = req => queryListGroups(req.query.parentId)

const createGroupBody = async (req) => {
  const body = { ...req.body }

  /* istanbul ignore else */
  if (req.body.parentId) {
    const parentGroup = await queryGroup(req.body.parentId)
    if (!parentGroup || parentGroup.parentId) {
      throw new HttpBadRequestError()
    }

    body.parentId = parentGroup.id
  }

  return body
}

export const createGroup = async (req) => {
  const body = await createGroupBody(req)
  return queryCreateGroup(body)
}

export const updateGroup = async (req) => {
  const body = await createGroupBody(req)
  const group = queryUpdateGroup(req.params.group, body)
  await invalidateTags(`group:${group.id}`)
  return group
}

export const viewGroup = req =>
  queryViewGroup(req.params.group, req.body)
