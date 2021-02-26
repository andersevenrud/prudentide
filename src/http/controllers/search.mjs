/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { querySearchTasks } from '../../database/repositories/task.mjs'
import { querySearchProjects } from '../../database/repositories/project.mjs'
import { mapCached } from '../../providers/cache.mjs'
import config from '../../config.mjs'

const [
  querySearchTasksCached,
  querySearchProjectsCached
] = mapCached([
  querySearchTasks,
  querySearchProjects
], { ttl: 5 })

export const searchAll = async (req) => {
  const page = req.query.page || 0
  const limit = req.query.limit || config.app.pagination.limit

  const promises = [
    querySearchTasksCached(req.query.query, page, limit)
      .then(results => ['tasks', results]),

    querySearchProjectsCached(req.query.query, page, limit)
      .then(results => ['projects', results])
  ]

  const results = await Promise.all(promises)
  const { tasks, projects } = Object.fromEntries(results)

  return {
    totalTasks: tasks.total,
    totalProjects: projects.total,
    tasks: tasks.results,
    projects: projects.results
  }
}
