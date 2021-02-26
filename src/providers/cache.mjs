/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import tagCache from 'redis-tag-cache'
import config from '../config.mjs'

// NOTE: This is because of interop with jest+babel and node+esm
//       mostly because the library does not ship as a module
const TagCache = tagCache.default || tagCache

let cache

/* istanbul ignore next */
if (config.cache.enabled) {
  cache = new TagCache({
    defaultTimeout: 5,
    redis: {
      keyPrefix: 'prudentide-tag-cache',
      host: config.cache.connection.host,
      port: config.cache.connection.port
    }
  })
}

/* istanbul ignore next */
const wrapFunction = async (name, tags, cb, options) => {
  if (!config.cache.enabled) {
    return cb()
  }

  let current = await cache.get(name)
  if (current === null || current === undefined) {
    current = await cb()

    await cache.set(name, current, tags, {
      timeout: options.ttl
    })
  }

  return current
}

export const mapCached = (fns, options) => fns
  .map(arg => (...args) => {
    const prefix = options.prefix || 'global'
    const [fn, argtags] = arg instanceof Array ? arg : [arg, []]
    const tags = argtags.map((t, i) => `${t}:${args[i]}`)
    const name = `${prefix}:${fn.name}(${args.join(':')})`
    const cb = () => fn(...args)
    return wrapFunction(name, tags, cb, options)
  })

/* istanbul ignore next */
export const invalidateTags = async (...tags) => config.cache.enabled
  ? cache.invalidate(...tags)
  : null
