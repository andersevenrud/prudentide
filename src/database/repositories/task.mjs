/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { knex } from '../../services/database.mjs'
import { Task } from '../models/index.mjs'
import { usingFilters } from '../utils.mjs'

const filter = usingFilters({
  users: b => v => b.whereIn('task.userId', v),
  assignedUsers: b => v => b.joinRelated('assignees').whereIn('assignees.id', v),
  milestones: b => v => b.joinRelated('milestones').whereIn('milestones.id', v),
  labels: b => v => b.joinRelated('labels').whereIn('labels.id', v),
  status: b => v => {
    if (v === 'closed') {
      return b.whereNotNull('closedAt')
    } else if (v === 'open') {
      return b.whereNull('closedAt')
    }

    return b
  }
})

export const queryTask = id => Task
  .query()
  .whereNotDeleted()
  .findById(id)

export const queryTaskWithProjects = id => Task
  .query()
  .whereNotDeleted()
  .withGraphFetched('projects')
  .findById(id)

export const queryTaskView = id => queryTask(id)
  .withGraphFetched('projects')
  .withGraphFetched('assignees')
  .withGraphFetched('labels')
  .withGraphFetched('milestones')
  .withGraphFetched('user')
  .modifyGraph('user', (builder) => {
    builder.select('id', 'username', 'name', 'email')
  })

export const queryTaskQueue = id => queryTask(id)
  .whereNotDeleted()
  .withGraphFetched('projects.[groups, webhooks]')
  .withGraphFetched('watchers.devices')
  .withGraphFetched('assignees.devices')
  .withGraphFetched('user')

export const queryAssignedTasks = userId => Task
  .query()
  .whereNotDeleted()
  .joinRelated('assignees')
  .whereIn('assignees.id', [userId])

export const queryProjectTasks = (projectId, filters) => {
  const builder = Task
    .query()
    .whereNotDeleted()
    .joinRelated('projects')
    .where('projects.id', '=', projectId)

  return filter(builder, filters)
}

export const queryCreateTask = (values) => Task
  .query()
  .insertGraph(values, { relate: true, unrelate: false })

export const queryUpdateTask = (id, values) => Task
  .query()
  .upsertGraph({
    id,
    ...values
  }, { relate: true, unrelate: true })

export const queryUpdateTaskLastActive = id => Task
  .query()
  .whereNotDeleted()
  .patchAndFetchById(id, {
    lastActiveAt: knex.fn.now()
  })

export const querySearchTasks = (query, page, limit) => Task
  .query()
  .whereNotDeleted()
  .where('name', 'LIKE', `%${query}%`)
  .withGraphFetched('projects')
  .withGraphFetched('user')
  .modifyGraph('projects', (builder) => {
    builder.whereNull('archivedAt')
  })
  .modifyGraph('user', (builder) => {
    builder.select('id', 'username', 'name', 'email')
  })
  .page(page, limit)

export const queryTaskProjectGroups = id => Task
  .query()
  .whereNotDeleted()
  .findById(id)
  .select(id)
  .withGraphFetched('projects.groups')
  .modifyGraph('projects', (builder) => {
    builder.select('id')
  })
  .modifyGraph('projects.groups', (builder) => {
    builder.select('id')
  })
