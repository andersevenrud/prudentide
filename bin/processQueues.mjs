/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import main from '../src/bootstrap.mjs'

main(
  async ({ winston }) => winston.info('Running!'),
  async () => {},
  { process: true }
)
