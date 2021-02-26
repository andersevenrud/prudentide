/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import winston from '../services/logger.mjs'
import { invalidateTags } from './cache.mjs'
import { queryUser } from '../database/repositories/user.mjs'
import { queryTaskQueue, queryUpdateTask } from '../database/repositories/task.mjs'
import { queryTaskCommentQueue } from '../database/repositories/taskComment.mjs'
import { queryGroupUsersDeep } from '../database/repositories/group.mjs'
import { queryWebhook, queryUpdateWebhookTimestamp } from '../database/repositories/webhook.mjs'
import { queryLapsedActions, queryUpdateAction } from '../database/repositories/taskAction.mjs'
import { createQueue, noopQueue } from '../services/mq.mjs'
import { knex } from '../services/database.mjs'
import { filterWebhooksByEvent, postWebhookSignal } from './webhook.mjs'
import { notify, notifyTypesFromTask, filterNotifyRecipients } from './notification.mjs'
import config from '../config.mjs'

const queues = {
  task: noopQueue,
  notification: noopQueue,
  webhook: noopQueue,
  action: noopQueue
}

/* istanbul ignore next */
const events = {
  active: name => job =>
    winston.debug(`Queue '${name}' activated: ${job.name}`),

  failed: name => (job, err) =>
    winston.log({
      level: 'alert',
      message: `Queue '${name}' failure [${job.id}:${job.name}]: ${err.stack}`
    }),

  error: name => err =>
    winston.log({
      level: 'emerg',
      message: `Queue '${name}' error: ${err.stack || err}`
    })
}

export const addToTaskQueue = (...args) => queues.task.add(...args)
export const addToNotificationQueue = (...args) => queues.notification.add(...args)
export const addToWebhookQueue = (...args) => queues.webhook.add(...args)

const queueWebhook = (task, event, append = {}) => {
  const webhooks = task.projects.map(p => p.webhooks).flat()
  const hooks = filterWebhooksByEvent(webhooks, event, {
    task,
    ...append
  })

  addToWebhookQueue(...hooks)
}

const queueNotifications = (task, userId, users, template, append) => {
  const notifications = users
    .filter(user => user.id !== userId)
    .flatMap(user => notifyTypesFromTask(task, user, template, append))

  addToNotificationQueue(...filterNotifyRecipients(notifications))
}

const queueWatchers = (task, userId, template, append) =>
  queueNotifications(task, userId, task.watchers, template, append)

const queueMembers = async (task, userId, template, append) => {
  const groupIds = task.projects.flatMap(p => p.groups).map(g => g.id)
  const users = await queryGroupUsersDeep(groupIds)

  queueNotifications(task, userId, users, template, append)
}

const processTaskQueue = async ({ data: { id, userId, action, payload } }) => {
  const task = await queryTaskQueue(id)

  /* istanbul ignore next */
  if (!task) {
    throw new Error(`Cannot processTaskQueue. Task ${id} does not exist`)
  }

  const assignees = task.assignees.filter(a => a.id !== userId)

  switch (action) {
    case 'open':
      queueMembers(task, userId, 'createTask', {})
      queueWebhook(task, 'task.open')

    // eslint-disable no-fallthrough
    case 'update':

      /* istanbul ignore else */
      if (assignees.length > 0) {
        addToNotificationQueue(
          ...assignees.flatMap(a => notifyTypesFromTask(task, a, 'assignedTask'))
        )
      }

      queueWebhook(task, `task:${action}`)
      break

    case 'close': {
      /* istanbul ignore else */
      const performingUser = await queryUser(userId)
      queueWatchers(task, userId, 'taskCompleted', { performingUser })
      queueWebhook(task, 'task.close')
      break
    }

    case 'comment': {
      const comment = await queryTaskCommentQueue(payload.commentId)

      queueWatchers(task, userId, 'taskComment', { comment })
      queueWebhook(task, 'task:comment', { comment })
      break
    }
  }
}

const processNotificationQueue = async ({ data }) =>
  notify(data)

const processWebhookSignalQueue = async ({ data: { id, payload } }) => {
  const webhook = await queryWebhook(id)

  /* istanbul ignore else */
  if (webhook) {
    await postWebhookSignal(webhook, payload)
    await queryUpdateWebhookTimestamp(webhook.id)
  }
}

const processDelayedActions = async ({ data: { type } }) => {
  const processTask = async (action, trx) => {
    switch (action.action) {
      case 'assign': {
        await queryUpdateTask(action.taskId, {
          assignees: [
            {
              id: action.attributes.to
            }
          ]
        }).transacting(trx)

        addToTaskQueue({
          id: action.taskId,
          userId: undefined,
          action: 'update'
        })
        break
      }

      case 'close': {
        /* istanbul ignore else */
        if (!action.closedAt) {
          await queryUpdateTask(action.taskId, {
            closedAt: knex.fn.now()
          }).transacting(trx)

          addToTaskQueue({
            id: action.taskId,
            userId: action.userId,
            action: 'close'
          })
        }
        break
      }

      case 'remind': {
        const remind = action.attributes.remind
        const users = []
        if (remind === 'creator' || remind === 'everybody') {
          users.push(action.user)
        }

        if (remind === 'assignees' || remind === 'everybody') {
          users.push(action.task.assignees)
        }

        if (remind === 'watchers' || remind === 'everybody') {
          users.push(action.task.watchers)
        }

        const list = users.flat(1)
        /* istanbul ignore else */
        if (list.length > 0) {
          queueNotifications(action.task, undefined, list, 'remindTask', {})
        }
        break
      }
    }
  }

  switch (type) {
    case 'taskAction': {
      const tasks = await queryLapsedActions()

      await knex.transaction(trx => Promise.all(
        tasks.map(t => processTask(t, trx))
      ))

      await knex.transaction(trx => Promise.all(
        tasks.map(t => queryUpdateAction(t.id, {
          processedAt: knex.fn.now()
        }).transacting(trx))
      ))

      const taskIds = tasks.map(t => `task:${t.taskId}`)
      const actionIds = tasks.map(t => `taskAction:${t.id}`)
      await invalidateTags(...taskIds, ...actionIds)
    }
  }
}

export const createQueues = (suffix) => {
  const task = queues.task = createQueue('tasks' + suffix)
  const notification = queues.notification = createQueue('notifications' + suffix)
  const webhook = queues.webhook = createQueue('webhooks' + suffix)
  const action = queues.action = createQueue('actions' + suffix)

  return { task, notification, webhook, action }
}

export const processQueues = async () => {
  queues.task.attach(processTaskQueue, events)
  queues.notification.attach(processNotificationQueue, events)
  queues.webhook.attach(processWebhookSignalQueue, events)
  queues.action.attach(processDelayedActions, events)

  Object
    .entries(config.mq.cron)
    .forEach(([type, options]) => {
      queues.action.instance.add({
        type
      }, options)
    })
}
