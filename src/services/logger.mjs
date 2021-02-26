/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import path from 'path'
import winston from 'winston'
import SentryTransport from 'winston-sentry-log'
import config from '../config.mjs'

const transports = []

const customFormat = ({
  level,
  message,
  timestamp
}) => `${timestamp} [${level}] ${message}`

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.splat(),
  winston.format.simple(),
  winston.format.printf(customFormat)
)

/* istanbul ignore else */
if (!config.production) {
  transports.push(new winston.transports.Console({
    level: config.winston.consoleLevel
  }))
}

/* istanbul ignore next */
if (!config.testing) {
  transports.push(new winston.transports.File({
    level: config.winston.level,
    filename: path.resolve(
      config.winston.logDir,
      `${config.winston.service}.log`
    )
  }))

  transports.push(new SentryTransport({
    level: 'alert',
    config: {
      ...config.sentry.connection
    }
  }))
}

export default winston.createLogger({
  level: config.winston.logger,
  levels: {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7
  },
  format,
  transports
})
