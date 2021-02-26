/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { invalidateTags } from '../../providers/cache.mjs'
import {
  queryCreateMilestone,
  queryUpdateMilestone,
  queryDeleteMilestone,
  queryMilestones,
  queryViewMilestone
} from '../../database/repositories/projectMilestone.mjs'

export const createMilestone = req => queryCreateMilestone(req.params.project, req.body)

export const updateMilestone = async (req) => {
  const milestone = await queryUpdateMilestone(req.params.milestone, req.body)

  await invalidateTags(`milestone:${milestone.id}`)

  return milestone
}

export const deleteMilestone = req =>
  queryDeleteMilestone(req.params.milestone)

export const listMilestones = req => queryMilestones(req.params.project)

export const getMilestone = req => queryViewMilestone(req.params.milestone)
