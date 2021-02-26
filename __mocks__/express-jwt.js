class UnauthorizedError extends Error {
  constructor () {
    super('This is a mock error')

    this.status = 401
    this.inner = {
      message: 'This is a mock error'
    }
  }
}

module.exports = () => (req, res, next) => {
  req.user = {
    sub: req.query.__sub || 'jest'
  }

  next()
}

module.exports.UnauthorizedError = UnauthorizedError
