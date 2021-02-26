/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import events from 'events'
import waitOn from 'wait-on'
import winston from './services/logger.mjs'
import { gracefulShutdown } from './utils/process.mjs'
import { connectMQ, disconnectMQ } from './services/mq.mjs'
import { connectDatabase, disconnectDatabase } from './services/database.mjs'
import { createQueues, processQueues } from './providers/queue.mjs'
import { disconnectTransport } from './services/nodemailer.mjs'
import config from './config.mjs'

events.defaultMaxListeners = 20

/**
 * Shared main point for app and bin scripts
 */
const main = async (start, stop, { process }) => {
  gracefulShutdown(async () => {
    winston.info('Shutting down...')
    await disconnectMQ()
    await disconnectTransport()
    await disconnectDatabase()
    await stop()
  })

  try {
    winston.info('Waiting for services to come online...')
    await waitOn({
      resources: [
        `tcp:${config.database.connection.host}:${config.database.connection.port}`,
        `tcp:${config.mq.connection.host}:${config.mq.connection.port}`
      ]
    })

    winston.info('Connecting to database...')
    await connectDatabase()

    winston.info('Connecting to MQ...')
    await connectMQ(process)

    winston.info('Setting up MQ queues...')
    await createQueues('')

    if (process) {
      winston.info('Starting MQ processing...')
      await processQueues()
    }

    winston.info('Starting up...')
    await start({
      winston
    })
  } catch (e) {
    winston.error(`Failed to boot: ${e.stack}`)
    process.exit(1)
  }
}

export default main
