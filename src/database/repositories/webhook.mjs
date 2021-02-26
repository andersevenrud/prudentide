/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Webhook } from '../models/index.mjs'
import { knex } from '../../services/database.mjs'

export const queryWebhook = id => Webhook
  .query()
  .findById(id)

export const queryCreateWebhook = values => Webhook
  .query()
  .insertAndFetch(values)

export const queryUpdateWebhook = (id, values) => Webhook
  .query()
  .patchAndFetchById(id, values)

export const queryUpdateWebhookTimestamp = id => Webhook
  .query()
  .patchAndFetchById(id, {
    lastSignaledAt: knex.fn.now()
  })

export const queryDeleteWebhook = id => Webhook
  .query()
  .where('id', id)
  .delete()

export const queryListWebhooks = projectId => Webhook
  .query()
  .where('projectId', projectId)
