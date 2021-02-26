/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { ProjectMilestone } from '../models/index.mjs'

export const queryCreateMilestone = (projectId, values) => ProjectMilestone
  .query()
  .insertAndFetch({
    ...values,
    projectId
  })

export const queryUpdateMilestone = (id, values) => ProjectMilestone
  .query()
  .patchAndFetchById(id, values)

export const queryDeleteMilestone = id => ProjectMilestone
  .query()
  .delete()
  .where('id', id)

export const queryMilestonesByIds = ids => ProjectMilestone
  .query()
  .whereIn('id', ids)

export const queryMilestones = projectId => ProjectMilestone
  .query()
  .where('projectId', projectId)

export const queryMilestone = id => ProjectMilestone
  .query()
  .findById(id)

export const queryViewMilestone = id => ProjectMilestone
  .query()
  .findById(id)
  .withGraphFetched('project')
