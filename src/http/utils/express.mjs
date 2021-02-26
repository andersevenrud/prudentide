/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

export const useResponseWrapper = (method, status) => (req, res, next) =>
  Promise.resolve(method(req, res, next))
    .then((body) => {
      if (typeof body === 'function') {
        body()
      } else {
        res.status(status)

        if (status === 204 || body === undefined) {
          res.end()
        } else {
          if (req.method === 'GET' && body.updatedAt) {
            const date = new Date(body.updatedAt)
            res.set('last-modified', date.toUTCString())
          }
          res.json(body)
        }
      }
    })
    .catch(err => next(err))

export const checkResourceConflict = (req) => {
  const header = req.get('x-reference-timestamp')
  if (header) {
    const now = new Date()
    const target = new Date(header)
    return target > now
  }

  return false
}

export const checkResourceOwnership = (req, userId) => {
  const isAdmin = req.profile.roles.includes('admin')
  return isAdmin || userId === req.profile.id
}
