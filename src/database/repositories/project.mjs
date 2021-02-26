/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { knex } from '../../services/database.mjs'
import { Project } from '../models/index.mjs'
import { usingFilters } from '../utils.mjs'

const filter = usingFilters({
  users: b => v => b.whereIn('userId', v),
  groups: b => v => b.joinRelated('groups').whereIn('groups.id', v)
})

export const queryProject = id => Project
  .query()
  .whereNotDeleted()
  .findById(id)

export const queryProjectView = id => queryProject(id)
  .withGraphFetched('groups')

export const queryAllProjects = async (filters) => {
  const builder = Project
    .query()
    .whereNotDeleted()
    .whereNull('archivedAt')
    .groupBy('project.id')

  return filter(builder, filters)
}

export const queryCreateProject = values => Project
  .query()
  .insertGraph(values, { relate: true })

export const queryUpdateProject = (id, values) => Project
  .query()
  .upsertGraph({
    id,
    ...values
  }, { relate: true, unrelate: true })

export const queryUpdateProjectLastActive = id => Project
  .query()
  .whereNotDeleted()
  .patchAndFetchById(id, {
    lastActiveAt: knex.fn.now()
  })

export const querySearchProjects = (query, page, limit) => Project
  .query()
  .whereNotDeleted()
  .where('name', 'LIKE', `%${query}%`)
  .whereNull('archivedAt')
  .withGraphFetched('user')
  .modifyGraph('user', (builder) => {
    builder.select('id', 'username', 'name', 'email')
  })
  .page(page, limit)

export const queryProjectGroups = id => Project
  .query()
  .whereNotDeleted()
  .findById(id)
  .select('id')
  .withGraphFetched('groups')
  .modifyGraph('groups', (builder) => {
    builder.select('id')
  })

export const queryArchiveProject = (id, archive) => Project
  .query()
  .whereNotDeleted()
  .patchAndFetchById(id, {
    archivedAt: archive ? knex.fn.now() : null
  })

export const queryProjectsByIds = ids => Project
  .query()
  .whereIn('id', ids)
