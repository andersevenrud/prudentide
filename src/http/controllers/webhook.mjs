/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { invalidateTags } from '../../providers/cache.mjs'
import {
  queryCreateWebhook,
  queryUpdateWebhook,
  queryDeleteWebhook,
  queryListWebhooks
} from '../../database/repositories/webhook.mjs'

export const createWebhook = async (req) => {
  const webhook = await queryCreateWebhook({
    ...req.body,
    projectId: req.params.project
  })

  return webhook
}

export const deleteWebhook = async (req, res) => {
  await queryDeleteWebhook(req.params.webhook)
  return () => res.status(204).end()
}

export const updateWebhook = async (req) => {
  const webhook = await queryUpdateWebhook(req.params.webhook, req.body)
  await invalidateTags(`webhook:${webhook.id}`)
  return webhook
}

export const listWebhooks = req =>
  queryListWebhooks(req.params.project)
