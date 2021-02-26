/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import Redis from 'ioredis'
import Queue from 'bull'
import config from '../config.mjs'

let publisher, subscriber
const connections = []
const clients = []

const createConnection = () => {
  const { host, port } = config.mq.connection
  const redisUrl = `redis://${host}:${port}`
  const client = new Redis(redisUrl)
  connections.push(client)
  return client
}

const createClient = (type) => {
  /* istanbul ignore next */
  if (!config.testing) {
    switch (type) {
      case 'client':
        return publisher

      case 'subscriber':
        return subscriber
    }
  }

  return createConnection()
}

export const connectMQ = async (process) => {
  publisher = createConnection()

  if (process) {
    subscriber = createConnection()
  }
}

export const disconnectMQ = async () => {
  await Promise.all(clients.map(c => c.close()))
  connections.forEach(c => c.disconnect())
}

export const createQueue = (name) => {
  const queue = `${name}__${config.env}`
  const options = {
    ...config.mq.queues[name],
    stackTraceLimit: 10
  }

  const instance = new Queue(queue, {
    createClient
  })

  const add = (...messages) => Promise
    .all(messages.map(
      data => instance.add(data, options)
    ))

  const attach = (process, events) => {
    Object
      .entries(events)
      .forEach(([ev, fn]) => instance.on(ev, fn(name)))

    return instance.process(process)
  }

  clients.push(instance)

  return { add, attach, instance }
}

export const clearQueues = () => clients.forEach(
  instance => instance.empty()
)

export const checkMQconnection = () => publisher.ping()

/* istanbul ignore next */
export const noopQueue = {
  add: async () => {},
  attach: async () => {}
}
