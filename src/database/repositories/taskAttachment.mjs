/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { TaskAttachment } from '../models/index.mjs'

export const queryTaskAttachment = id => TaskAttachment
  .query()
  .findById(id)

export const queryCreateTaskAttachment = values => TaskAttachment
  .query()
  .insertAndFetch(values)

export const queryDeleteTaskAttachment = id => TaskAttachment
  .query()
  .delete()
  .where('id', id)

export const queryListTaskAttachments = taskId => TaskAttachment
  .query()
  .where('taskId', taskId)
