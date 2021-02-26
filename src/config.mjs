/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import fs from 'fs-extra'
import path from 'path'
import dotenv from 'dotenv'
import admin from 'firebase-admin'
import { fileURLToPath } from 'url'
import {
  variableAsFloat,
  variableAsInteger,
  variableAsString,
  variableAsBoolean
} from './utils/primitives.mjs'

dotenv.config()

const dirname = path.dirname(fileURLToPath(import.meta.url))
const env = process.env.NODE_ENV || 'development'
const testing = env === 'test'
const production = env === 'production'
const development = env === 'development'
const root = path.dirname(dirname)
const schema = fs.readJSONSync(path.resolve(root, 'src/openapi.json'))
const port = variableAsInteger(process.env.APP_PORT, 8080)
const baseUri = variableAsString(process.env.APP_BASE_URI, `http://localhost:${port}`)
const cacheEnabled = testing ? false : variableAsBoolean(process.env.CACHE_ENABLED, production)
const consoleLogLevels = {
  test: ' alert',
  production: 'info',
  development: 'debug'
}

const databases = {
  production: {
    client: variableAsString(process.env.DB_CLIENT, 'mysql'),
    connection: {
      host: variableAsString(process.env.DB_HOST, 'db'),
      user: variableAsString(process.env.DB_USERNAME, 'prudentide'),
      password: variableAsString(process.env.DB_PASSWORD, 'prudentide'),
      database: variableAsString(process.env.DB_NAME, 'prudentide'),
      port: variableAsString(process.env.DB_PORT, 3306)
    }
  },
  test: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: ':memory:'
    },
    seeds: {
      directory: path.resolve(root, 'src/database/seeds/test'),
      extension: 'cjs',
      loadExtensions: [
        '.cjs'
      ]
    }
  }
}

export default {
  root,
  env,
  testing,
  production,
  development,
  baseUri,
  openapi: {
    schema,
    swagger: variableAsBoolean(process.env.SWAGGER_ENABLE, development),
    options: {
      swaggerOptions: {
        oauth2RedirectUrl: `${baseUri}/swagger/oauth2-redirect.html`,
        oauth: {
          clientId: process.env.AUTH0_CLIENT_ID
        }
      }
    }
  },
  database: {
    ...(databases[env] || databases.production),
    migrations: {
      directory: path.resolve(root, 'src/database/migrations'),
      extension: 'cjs',
      loadExtensions: [
        '.cjs'
      ]
    }
  },
  app: {
    name: variableAsString(process.env.APP_NAME, 'Prudentide'),
    defaultLocale: variableAsString(process.env.APP_LOCALE, 'en'),
    listen: {
      port
    },
    uploads: {
      limits: {
        fileSize: variableAsInteger(process.env.UPLOAD_SIZE_LIMIT, 50 * 1024 * 1024)
      }
    },
    features: {
      notifications: {
        sms: variableAsBoolean(process.env.FEATURE_NOTIFICATIONS_SMS, true),
        email: variableAsBoolean(process.env.FEATURE_NOTIFICATIONS_EMAIL, true),
        push: variableAsBoolean(process.env.FEATURE_NOTIFICATIONS_PUSH, true)
      }
    },
    pagination: {
      limit: variableAsInteger(process.env.PAGINATION_DEFAULT_SIZE, 100)
    },
    labels: {
      defaults: [
        {
          name: 'bug'
        },
        {
          name: 'documentation'
        },
        {
          name: 'duplicate'
        },
        {
          name: 'enhancement'
        },
        {
          name: 'help wanted'
        },
        {
          name: 'invalid'
        },
        {
          name: 'question'
        },
        {
          name: 'wontfix'
        }
      ]
    }
  },
  firebase: {
    connection: {
      credential: variableAsString(process.env.FIREBASE_CREDENTIAL, admin.credential.applicationDefault()),
      databaseUrl: variableAsString(process.env.FIREBASE_DATABASE_URL, 'https://<DATABASE_NAME>.firebaseio.com')
    }
  },
  mq: {
    foreground: variableAsBoolean(process.env.MQ_FOREGROUND, false),
    connection: {
      host: variableAsString(process.env.MQ_HOST, 'mq'),
      port: 6379 // process.env.MQ_PORT Gitlab CI f-s this up ?!
    },
    queues: {
      tasks: {
      },
      notifications: {
        attempts: 3,
        backoff: testing ? 1 : 5000
      },
      webhooks: {
        attempts: 3,
        backoff: testing ? 1 : 5000
      },
      action: {

      }
    },
    cron: {
      taskAction: {
        repeat: testing
          ? { every: 1 }
          : { cron: '* * * * *' }
      }
    }
  },
  winston: {
    consoleLevel: variableAsString(process.env.WINSTON_CONSOLE_LOGLEVEL, consoleLogLevels[env]),
    level: variableAsString(process.env.WINSTON_LOGLEVEL, production ? 'info' : 'debug'),
    service: variableAsString(process.env.WINSTON_SERVICE, 'winston'),
    logDir: process.env.WINSTON_LOGDIR
      ? path.resolve(process.env.WINSTON_LOGDIR)
      : path.resolve(root, 'logs')
  },
  sentry: {
    connection: {
      dsn: testing ? undefined : variableAsString(process.env.SENTRY_DSN, ''),
      tracesSampleRate: testing ? 0 : variableAsFloat(process.env.SENTRY_TRACE_SAMPLE_RATE, 0.5)
    },
    tracing: {
      tracing: variableAsBoolean(process.env.SENTRY_TRACE, production)
    }
  },
  auth0: {
    domain: variableAsString(process.env.AUTH0_DOMAIN, baseUri),
    audience: variableAsString(process.env.AUTH0_AUDIENCE, 'https://api.prudentide.local'),
    algorithms: [
      variableAsString(process.env.AUTH0_ALGORITHM, 'RS256')
    ]
  },
  nodemailer: {
    connection: {
      host: variableAsString(process.env.NODEMAILER_HOST, 'mailhog'),
      port: variableAsInteger(process.env.NODEMAILER_PORT, 1025)
    },
    defaults: {
      from: variableAsString(process.env.MAIL_FROM, 'prudentide@localhost')
    }
  },
  storage: {
    root: path.resolve(root, 'storage')
  },
  webhooks: {
    tokenHeaderName: variableAsString(process.env.WEBHOOKS_TOKEN_HEADER_NAME, 'X-Prudentide-Token')
  },
  cache: {
    enabled: cacheEnabled,
    store: variableAsString(process.env.CACHE_STORE, cacheEnabled ? 'redis' : 'none'),
    connection: {
      host: variableAsString(process.env.CACHE_HOST, 'cache'),
      port: 6379
    }
  }
}
