/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { knex } from '../../services/database.mjs'
import { checkMQconnection } from '../../services/mq.mjs'

export const healthCheck = async (req, res) => {
  res.header('cache-control', 'no-cache')

  try {
    await knex.raw('SELECT 1+1 as result')
    await checkMQconnection()

    res.status(200).end()
  } catch (_) {
    /* istanbul ignore next */
    res.status(500).end()
  }
}
