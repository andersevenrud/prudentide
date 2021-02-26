/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import superagent from 'superagent'
import config from '../config.mjs'

const mapHeaders = headers => Object.fromEntries(
  headers.map(str => str.split(': '))
)

export const filterWebhooksByEvent = (webhooks, event, payload) => webhooks
  .filter(webhook => webhook.events.includes(event))
  .map(webhook => ({
    id: webhook.id,
    payload: { event, ...payload }
  }))

export const postWebhookSignal = ({
  method,
  headers,
  url,
  token
}, body) => superagent(method || 'post', url)
  .set(config.webhooks.tokenHeaderName, token)
  .set('Accept', 'application/json')
  .set(mapHeaders(headers || []))
  .send(body)
