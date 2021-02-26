/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { TaskAction } from '../models/index.mjs'

export const queryCreateAction = (taskId, userId, values) => TaskAction
  .query()
  .insertAndFetch({
    ...values,
    taskId,
    userId
  })

export const queryUpdateAction = (id, values) => TaskAction
  .query()
  .patchAndFetchById(id, values)

export const queryDeleteAction = id => TaskAction
  .query()
  .delete()
  .where('id', id)

export const queryActions = taskId => TaskAction
  .query()
  .where('taskId', taskId)

export const queryAction = id => TaskAction
  .query()
  .findById(id)

export const queryLapsedActions = () => TaskAction
  .query()
  .where('scheduledAt', '<=', new Date())
  .whereNull('processedAt')
  .withGraphFetched('task.projects')
  .withGraphFetched('task.assignees.devices')
  .withGraphFetched('task.watchers.devices')
  .withGraphFetched('user.devices')
