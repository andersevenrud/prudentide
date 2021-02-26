/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { knex } from '../../services/database.mjs'
import { checkResourceOwnership } from '../utils/express.mjs'
import { HttpForbiddenError } from '../exceptions/index.mjs'
import { saveUpload, readUpload, removeUpload } from '../../providers/storage.mjs'
import { queryUpdateProjectLastActive } from '../../database/repositories/project.mjs'
import {
  queryUpdateTaskLastActive,
  queryTaskWithProjects
} from '../../database/repositories/task.mjs'
import {
  queryCreateTaskAttachment,
  queryDeleteTaskAttachment,
  queryListTaskAttachments
} from '../../database/repositories/taskAttachment.mjs'

export const createAttachment = async (req) => {
  const task = await queryTaskWithProjects(req.params.task)
  const { filename, hash } = await saveUpload(
    'tasks',
    task.id,
    req.files.attachment
  )

  return knex.transaction(async (trx) => {
    const attachment = await queryCreateTaskAttachment({
      taskId: task.id,
      userId: req.profile.id,
      filename,
      hash
    }).transacting(trx)

    await queryUpdateTaskLastActive(task.id)
      .transacting(trx)

    await Promise.all(task.projects.map((p) => {
      return queryUpdateProjectLastActive(p.id)
        .transacting(trx)
    }))

    return attachment
  })
}

export const fetchAttachment = async (req, res, next) => {
  const attachment = req.bindings.attachment

  const { stream, filename } = await readUpload(
    'tasks',
    attachment.taskId,
    attachment.filename,
    attachment.hash
  )

  if (req.query.download) {
    res.attachment(filename)
    stream.pipe(res)
  } else {
    res.send(stream)
  }
}

export const deleteAttachment = async (req) => {
  const attachment = req.bindings.attachment
  if (!checkResourceOwnership(req, attachment.userId)) {
    throw new HttpForbiddenError()
  }

  await removeUpload(
    'tasks',
    attachment.taskId,
    attachment.hash
  )

  await queryDeleteTaskAttachment(attachment.id)
}

export const listAttachments = (req) =>
  queryListTaskAttachments(req.params.task)
