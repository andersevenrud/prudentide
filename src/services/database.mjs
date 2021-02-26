/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { Model } from 'objection'
import Knex from 'knex'
import winston from './logger.mjs'
import config from '../config.mjs'

export const knex = Knex({
  ...config.database
})

knex.on('query', data => winston.debug(data.sql))

Model.knex(knex)

export const connectDatabase = async () => {
  // This is the only way to throw an exception early
  // if there's no connection.
  await knex.raw('SELECT 1+1 as result')
}

export const disconnectDatabase = async () => knex.destroy()
