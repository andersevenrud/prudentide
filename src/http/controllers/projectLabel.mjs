/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { invalidateTags } from '../../providers/cache.mjs'
import {
  queryCreateLabel,
  queryUpdateLabel,
  queryDeleteLabel,
  queryLabels
} from '../../database/repositories/projectLabel.mjs'

export const createLabel = req => queryCreateLabel(req.params.project, req.body)

export const updateLabel = async (req) => {
  const label = await queryUpdateLabel(req.params.label, req.body)

  await invalidateTags(`label:${label.id}`)

  return label
}

export const deleteLabel = req =>
  queryDeleteLabel(req.params.label)

export const listLabels = req => queryLabels(req.params.project)
