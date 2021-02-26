/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import {
  queryAddTaskWatcher,
  queryRemoveTaskWatcher,
  queryListTaskWatchers
} from '../../database/repositories/taskWatch.mjs'

const taskWatch = fn => async (req, res) => {
  await fn(req.params.task, req.profile)
  return () => res.status(204).end()
}

export const watchTask = taskWatch(queryAddTaskWatcher)

export const unwatchTask = taskWatch(queryRemoveTaskWatcher)

export const listWatchers = req =>
  queryListTaskWatchers(req.params.task)
