/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { HttpBadRequestError } from '../exceptions/index.mjs'
import { knex } from '../../services/database.mjs'
import { addToTaskQueue } from '../../providers/queue.mjs'
import { invalidateTags } from '../../providers/cache.mjs'
import {
  queryUpdateProjectLastActive,
  queryProjectsByIds
} from '../../database/repositories/project.mjs'
import {
  queryLabelsByIds
} from '../../database/repositories/projectLabel.mjs'
import {
  queryMilestonesByIds
} from '../../database/repositories/projectMilestone.mjs'
import {
  queryCreateTask,
  queryUpdateTask,
  queryAssignedTasks,
  queryProjectTasks,
  queryTaskView
} from '../../database/repositories/task.mjs'
import {
  queryUsersByIds
} from '../../database/repositories/user.mjs'

export const getTask = req =>
  queryTaskView(req.params.task)

export const listMyTasks = req =>
  queryAssignedTasks(req.profile.id)

export const listProjectTasks = req =>
  queryProjectTasks(req.params.project, req.query)

const relationLookups = {
  projects: queryProjectsByIds,
  labels: queryLabelsByIds,
  milestones: queryMilestonesByIds,
  assignees: queryUsersByIds
}

// TODO: Check project permission
const createGraphBody = async (req, trx, defaults = {}) => {
  const relations = ['projects', 'labels', 'milestones', 'assignees']
    .filter(name => !!req.body[name])

  const mapped = Object.fromEntries(relations
    .map(name => [
      name,
      req.body[name].map(id => ({ id }))
    ]))

  await Promise.all(relations.map(async (name) => {
    const ids = req.body[name]
    const available = await relationLookups[name](ids)
      .transacting(trx)

    if (available.length !== mapped[name].length) {
      throw new HttpBadRequestError(`INVALID_${name.toUpperCase()}`)
    }
  }))

  return {
    ...req.body,
    ...mapped,
    ...defaults
  }
}

export const createTask = async (req) => {
  const task = await knex.transaction(async (trx) => {
    const body = await createGraphBody(req, trx, {
      userId: req.profile.id,
      watchers: [
        {
          id: req.profile.id
        }
      ]
    })

    const task = await queryCreateTask(body)
      .transacting(trx)

    await Promise.all(body.projects.map(p =>
      queryUpdateProjectLastActive(p.id)
        .transacting(trx)))

    return queryTaskView(task.id)
      .transacting(trx)
  })

  await invalidateTags(...task.projects.map(p => `project:${p.id}`))

  addToTaskQueue({
    id: task.id,
    userId: req.profile.id,
    action: 'open'
  })

  return task
}

export const updateTask = async (req) => {
  const task = await knex.transaction(async (trx) => {
    const body = await createGraphBody(req, trx)

    const task = await queryUpdateTask(req.params.task, body)
      .transacting(trx)

    return queryTaskView(task.id)
      .transacting(trx)
  })

  await invalidateTags(`task:${task.id}`)
  await invalidateTags(...task.projects.map(p => `project:${p.id}`))

  addToTaskQueue({
    id: task.id,
    userId: req.profile.id,
    action: 'update'
  })

  return task
}

const closeOrOpenTask = close => async (req, res) => {
  const action = close ? 'close' : 'open'
  const closedAt = close ? knex.fn.now() : null

  const proceed = close
    ? req.bindings.task.closedAt === null
    : req.bindings.task.closedAt !== null

  /* istanbul ignore else */
  if (proceed) {
    await queryUpdateTask(req.params.task, { closedAt })
    await invalidateTags(`task:${req.bindings.task.id}`)

    addToTaskQueue({
      id: req.bindings.task.id,
      userId: req.profile.id,
      action
    })
  }

  return () => res.status(204).end()
}

export const closeTask = closeOrOpenTask(true)

export const openTask = closeOrOpenTask(false)
