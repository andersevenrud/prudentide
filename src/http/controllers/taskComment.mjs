/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { knex } from '../../services/database.mjs'
import { invalidateTags } from '../../providers/cache.mjs'
import { addToTaskQueue } from '../../providers/queue.mjs'
import { queryUpdateProjectLastActive } from '../../database/repositories/project.mjs'
import {
  checkResourceOwnership
} from '../utils/express.mjs'
import {
  HttpForbiddenError
} from '../exceptions/index.mjs'
import {
  queryUpdateTaskLastActive,
  queryTaskWithProjects
} from '../../database/repositories/task.mjs'
import {
  queryAddTaskWatcher
} from '../../database/repositories/taskWatch.mjs'
import {
  queryCreateTaskComment,
  queryUpdateTaskComment,
  queryTaskComments
} from '../../database/repositories/taskComment.mjs'

export const createTaskComment = async (req) => {
  const task = await queryTaskWithProjects(req.params.task)

  const taskComment = await knex.transaction(async (trx) => {
    const taskComment = await queryCreateTaskComment(
      task.id,
      req.profile.id,
      req.body
    ).transacting(trx)

    await queryUpdateTaskLastActive(task.id)
      .transacting(trx)

    await Promise.all(task.projects.map((p) => {
      return queryUpdateProjectLastActive(p.id)
        .transacting(trx)
    }))

    await queryAddTaskWatcher(task.id, req.profile, trx)

    return taskComment
  })

  addToTaskQueue({
    id: task.id,
    userId: req.profile.id,
    action: 'comment',
    payload: {
      commentId: taskComment.id
    }
  })

  return taskComment
}

const updateTaskCommentWith = async (req, data) => {
  const { comment } = req.bindings
  if (!checkResourceOwnership(req, comment.userId)) {
    throw new HttpForbiddenError()
  }

  await invalidateTags(`comment:${comment.id}`)

  return queryUpdateTaskComment(comment.id, data)
}

export const updateTaskComment = req =>
  updateTaskCommentWith(req, req.body)

export const listTaskComments = req =>
  queryTaskComments(req.bindings.task.id)

const stick = sticky => async (req, res) => {
  await updateTaskCommentWith(req, { sticky })
  return () => res.status(204).end()
}

export const stickTaskComment = stick(true)

export const unStickTaskComment = stick(false)
