/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import main from '../src/bootstrap.mjs'
import app from '../src/http/app.mjs'
import config from '../src/config.mjs'

main(
  async ({ winston }) => {
    winston.info('Starting HTTP server...')
    const { app: { listen: { port } } } = config
    await app.listen(port, () => winston.info(`Listening on ${port}!`))
  },
  async () => {},
  { process: config.mq.foreground }
)
