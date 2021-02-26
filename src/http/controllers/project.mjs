/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { knex } from '../../services/database.mjs'
import { invalidateTags } from '../../providers/cache.mjs'
import {
  queryGroupsByIds
} from '../../database/repositories/group.mjs'
import {
  queryProjectView,
  queryCreateProject,
  queryUpdateProject,
  queryAllProjects,
  queryArchiveProject,
  queryProjectGroups
} from '../../database/repositories/project.mjs'
import config from '../../config.mjs'

export const getProject = req =>
  queryProjectView(req.params.project)

export const listProjects = req =>
  queryAllProjects(req.query)

const syncProjectGroups = async (req, trx, update) => {
  const groups = req.body.groups

  // This routine ensures that the user does not add/remove
  // any groups that they don't have access to
  if (groups instanceof Array) {
    const userGroupPermissions = Object.fromEntries(
      req.profile.groups.map(g => [
        g.id,
        g.permission
      ])
    )

    const isAdmin = req.profile.roles.includes('admin')
    const available = await queryGroupsByIds(groups)
      .transacting(trx)

    let usable = isAdmin
      ? available
      : available.filter(g => userGroupPermissions[g.id] !== undefined)

    if (update && !isAdmin) {
      const project = await queryProjectGroups(req.params.project)
        .transacting(trx)

      const forceGroupIds = project.groups
        .filter(g => usable.find(u => u.id === g.id))
        .filter(g => userGroupPermissions[g.id] !== 'admin')
        .filter(g => !usable.find(u => u.id !== g.id))

      usable = [...usable, ...forceGroupIds]
    }

    /* istanbul ignore else */
    if (usable.length > 0) {
      return usable.map(({ id }) => ({ id }))
    }
  }

  return undefined
}

const createGraphBody = async (req, trx, defaults, update) => {
  const groups = await syncProjectGroups(req, trx, update)

  return {
    ...req.body,
    ...defaults,
    groups
  }
}

export const createProject = async (req) => {
  return knex.transaction(async (trx) => {
    const body = await createGraphBody(req, trx, {
      userId: req.profile.id,
      labels: config.app.labels.defaults
    })

    const project = await queryCreateProject(body)
      .transacting(trx)

    return queryProjectView(project.id)
      .transacting(trx)
  })
}

export const updateProject = async (req) => {
  const project = knex.transaction(async (trx) => {
    const body = await createGraphBody(req, trx, {}, true)

    const project = await queryUpdateProject(req.params.project, body)
      .transacting(trx)

    return queryProjectView(project.id)
      .transacting(trx)
  })

  await invalidateTags(`project:${project.id}`)

  return project
}

const archiveProjectAction = archive => async (req, res) => {
  await queryArchiveProject(req.params.project, archive)
  return () => res.status(204).end()
}

export const archiveProject = archiveProjectAction(true)

export const unArchiveProject = archiveProjectAction(false)
