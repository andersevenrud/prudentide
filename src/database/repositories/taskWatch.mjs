/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Task } from '../models/index.mjs'

export const queryAddTaskWatcher = async (id, watcher, trx) => {
  // FIXME: Find a way to ignore the constraint error instead
  const found = await Task
    .relatedQuery('watchers', trx)
    .for(id)
    .where('id', watcher.id)
    .first()

  if (found) {
    return found
  }

  return Task
    .relatedQuery('watchers', trx)
    .for(id)
    .relate(watcher)
}

export const queryRemoveTaskWatcher = (id, watcher) => Task
  .relatedQuery('watchers')
  .for(id)
  .unrelate()
  .where('id', watcher.id)

export const queryListTaskWatchers = taskId => Task
  .relatedQuery('watchers')
  .for(taskId)
  .select('id', 'username', 'name', 'email')
