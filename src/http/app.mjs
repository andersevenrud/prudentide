/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import express from 'express'
import router from './routes.mjs'
import { useNotFound, useErrorCatcher } from './middleware/error.mjs'
import { useLogger } from './middleware/logger.mjs'
import config from '../config.mjs'

const swaggerRouter = express.Router()
const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(useLogger)

/* istanbul ignore next */
if (config.openapi.swagger) {
  import('swagger-ui-express')
    .then((swaggerUi) => {
      swaggerRouter.use('/swagger', swaggerUi.serve, swaggerUi.setup(
        config.openapi.schema,
        config.openapi.options
      ))

      swaggerRouter.use('/swagger.json', (req, res) => res.json(config.openapi))
    })
}

app.use(swaggerRouter)
app.use(router)
app.use(useNotFound)
app.use(useErrorCatcher)

export default app
