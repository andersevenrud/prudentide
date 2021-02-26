/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { HttpNotFoundError, HttpConflictError, HttpAuthorizationError } from '../exceptions/index.mjs'
import { checkResourceConflict } from '../utils/express.mjs'
import { mapCached, invalidateTags } from '../../providers/cache.mjs'
import { queryLabel } from '../../database/repositories/projectLabel.mjs'
import { queryMilestone } from '../../database/repositories/projectMilestone.mjs'
import { queryUser } from '../../database/repositories/user.mjs'
import { queryTaskAttachment } from '../../database/repositories/taskAttachment.mjs'
import { queryTaskComment } from '../../database/repositories/taskComment.mjs'
import { queryAction } from '../../database/repositories/taskAction.mjs'
import { queryWebhook } from '../../database/repositories/webhook.mjs'
import { queryGroup } from '../../database/repositories/group.mjs'
import {
  queryTask,
  queryTaskProjectGroups
} from '../../database/repositories/task.mjs'
import {
  queryProject,
  queryProjectGroups
} from '../../database/repositories/project.mjs'

const [
  queryProjectCached,
  queryLabelCached,
  queryMilestoneCached,
  queryTaskCached,
  queryUserCached,
  queryTaskAttachmentCached,
  queryTaskCommentCached,
  queryActionCached,
  queryWebhookCached,
  queryGroupCached
] = mapCached([
  [queryProject, ['project']],
  [queryLabel, ['label']],
  [queryMilestone, ['milestone']],
  [queryTask, ['task']],
  [queryUser, ['user']],
  [queryTaskAttachment, ['taskAttachment']],
  [queryTaskComment, ['taskComment']],
  [queryAction, ['taskAction']],
  [queryWebhook, ['webhook']],
  [queryGroup, ['group']]
], {
  ttl: 30,
  prefix: 'bindings'
})

const [
  queryProjectGroupsCached,
  queryTaskProjectGroupsCached
] = mapCached([
  queryProjectGroups,
  queryTaskProjectGroups
], { ttl: 5 })

const gate = (req, groupIds) => {
  const isAdmin = req.profile.roles.includes('admin')
  const userGroupIds = req.profile.groups.map(g => g.id)
  const matches = (isAdmin || groupIds.length === 0)
    ? true
    : groupIds.some(id => userGroupIds.includes(id))

  return matches
}

const bindings = {
  group: req => queryGroupCached(req.params.group),
  user: req => queryUserCached(req.params.user),
  attachment: req => queryTaskAttachmentCached(req.params.attachment),
  comment: req => queryTaskCommentCached(req.params.comment),
  webhook: req => queryWebhookCached(req.params.webhook),
  label: req => queryLabelCached(req.params.label),
  milestone: req => queryMilestoneCached(req.params.milestone),
  action: req => queryActionCached(req.params.action),

  task: async (req) => {
    const task = await queryTaskProjectGroupsCached(req.params.task)
    if (!task) {
      throw new HttpNotFoundError('INVALID_TASK')
    } else if (!gate(req, task.projects.flatMap(p => p.groups.map(g => g.id)))) {
      throw new HttpAuthorizationError()
    }

    return queryTaskCached(req.params.task)
  },

  project: async (req) => {
    const project = await queryProjectGroupsCached(req.params.project)
    if (!project) {
      throw new HttpNotFoundError('INVALID_PROJECT')
    } else if (!gate(req, project.groups.map(g => g.id))) {
      throw new HttpAuthorizationError()
    }

    return queryProjectCached(req.params.project)
  }
}

const bindParams = (keys, req, checkParam) =>
  keys.map(k => bindings[k](req)
    .then(async (result) => {
      if (!result) {
        throw new HttpNotFoundError(`${k.toUpperCase()}_NOT_FOUND`)
      } else if (['PUT', 'PATCH'].includes(req.method) && checkParam === k) {
        if (checkResourceConflict(req, result.updatedAt)) {
          throw new HttpConflictError('TIME_CONFLICT')
        }
      }

      return [k, result]
    }))

const findLastParam = (path) => {
  const found = path.match(/:([^/]+)/g)
  return found ? found.map(n => n.substr(1)).pop() : null
}

export const withBindings = (path) => async (req, res, next) => {
  try {
    const keys = Object
      .keys(req.params)
      .filter(k => !!bindings[k])

    const isPatch = ['PUT', 'PATCH'].includes(req.method)
    const lastParam = findLastParam(path)
    if (isPatch && lastParam) {
      await invalidateTags(`${lastParam}:${req.params[lastParam]}`)
    }

    const promises = bindParams(keys, req, lastParam)

    // FIXME: Should this be sequential ?
    const resolved = await Promise.all(promises)
    const bound = Object.fromEntries(resolved)

    req.bindings = bound

    next()
  } catch (e) {
    next(e)
  }
}
