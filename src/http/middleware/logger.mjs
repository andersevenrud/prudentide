/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import winston from '../../services/logger.mjs'

export const useLogger = (req, res, next) => {
  const log = () => winston.debug(
    `${req.connection.remoteAddress} - ${req.method} ${req.url} - ${res.statusCode}`
  )

  res.on('finish', log)

  next()
}
