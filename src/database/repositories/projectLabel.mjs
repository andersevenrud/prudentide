/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { ProjectLabel } from '../models/index.mjs'

export const queryCreateLabel = (projectId, values) => ProjectLabel
  .query()
  .insertAndFetch({
    ...values,
    projectId
  })

export const queryUpdateLabel = (id, values) => ProjectLabel
  .query()
  .patchAndFetchById(id, values)

export const queryDeleteLabel = id => ProjectLabel
  .query()
  .delete()
  .where('id', id)

export const queryLabelsByIds = ids => ProjectLabel
  .query()
  .whereIn('id', ids)

export const queryLabels = projectId => ProjectLabel
  .query()
  .where('projectId', projectId)

export const queryLabel = id => ProjectLabel
  .query()
  .findById(id)
