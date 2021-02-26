/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

const shutdown = (fn, onerror) => signal => async () => {
  try {
    await fn(signal)
  } catch (e) {
    onerror(e)
  } finally {
    process.exit(128 + signal)
  }
}

export const gracefulShutdown = (callback, onerror = () => {}) => {
  const shutter = shutdown(callback, onerror)
  const catcher = (e) => {
    onerror(e)
    process.exit(1)
  }

  process.on('SIGHUP', shutter(1))
  process.on('SIGINT', shutter(2))
  process.on('SIGTERM', shutter(15))

  return catcher
}
