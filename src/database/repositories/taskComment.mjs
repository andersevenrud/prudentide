/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { TaskComment } from '../models/index.mjs'

export const queryTaskComment = id => TaskComment
  .query()
  .findById(id)

export const queryTaskCommentQueue = id => queryTaskComment(id)
  .withGraphFetched('user')
  .modifyGraph('user', (builder) => {
    builder.select('id', 'username', 'name', 'email')
  })

export const queryCreateTaskComment = (taskId, userId, data) => TaskComment
  .query()
  .insertAndFetch({
    ...data,
    taskId,
    userId
  })

export const queryUpdateTaskComment = (id, data) => TaskComment
  .query()
  .patchAndFetchById(id, data)

export const queryTaskComments = taskId => TaskComment
  .query()
  .where('taskId', taskId)
  .withGraphFetched('user')
  .modifyGraph('user', (builder) => {
    builder.select('id', 'username', 'name', 'email')
  })
