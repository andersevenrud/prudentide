# Configuration

This is a list of all environmental variables you can use in `.env`.

Please note that these have default values. See `src/config.js`
for more information.

See `docker.md` for more variables.

## App

* `APP_NAME` - Application name (default: `Prudentide`)
* `APP_PORT` - Express application port (default: `8080`)
* `APP_LOCALE` - Default/fallback locale (default: `en`)
* `APP_BASE_URI` - Base URI used in refered links (default: auto)
* `PAGINATION_DEFAULT_SIZE` - Default pagination size (default: `100`)
* `SWAGGER_ENABLE` - Enable swagger UI (default: auto)

## Feature flags

* `FEATURE_NOTIFICATIONS_SMS` - SMS feature flag (default: `true`)
* `FEATURE_NOTIFICATIONS_EMAIL` - Email feature flag (default: `true`)
* `FEATURE_NOTIFICATIONS_PUSH` - Push notification feature flag (default: `true`)

## HTTP

* `UPLOAD_SIZE_LIMIT` - Upload size limit in kilobytes (default: `52428800`)

## Notifications

* `MAIL_FROM` - Default from email address (default: `prudentide@localhost`)

## Webhooks

* `WEBHOOKS_TOKEN_HEADER_NAME` - Webhook token header name (default: `X-Prudentide-Token`)

## Database

* `DB_CLIENT` - Database client type (default: `mysql`)
* `DB_HOST` - Database hostname (default: `prudentide`)
* `DB_USERNAME` - Database username (default: `prudentide`)
* `DB_PASSWORD` - Database password (default: `prudentide`)
* `DB_NAME` - Database name (default: `prudentide`)
* `DB_PORT` - Database port (default: `3306`)

## MQ

* `MQ_FOREGROUND` - Run queue in api process (default: `false`)
* `MQ_HOST` - Redis hostname (default: `mq`)
* `MQ_PORT` - Redis port (default: `6379`)

## Cache

* `CACHE_ENABLED` - Enable cache (default: auto)
* `CACHE_HOST` - Redis hostname (default: `cache`)
* `CACHE_PORT` - Redis port (default: `6379`)

## Winston

* `WINSTON_CONSOLE_LOGLEVEL` - Default console log level (default: auto)
* `WINSTON_LOGLEVEL` - Default log level (default: auto)
* `WINSTON_SERVICE` - Logging service (default: auto) **Don't touch this**
* `WINSTON_LOGDIR` - Logging directory (default: `logs`)

## Auth0

* `AUTH0_DOMAIN` - Auth0 domain (default: none)
* `AUTH0_AUDIENCE` - Auth0 API audience name (default: `https://api.prudentide.local`)
* `AUTH0_ALGORITHM` - Auth0 algorithm (default: `RS256`)

## Firebase

* `FIREBASE_CREDENTIAL` - Firebase credential (key) **Use evn variable in docker**
* `FIREBASE_DATABASE_URL` - Firebase database URL (default: none)

## NodeMailer

* `NODEMAILER_HOST` - SMTP hostname (default: `mailhog`)
* `NODEMAILER_PORT` - SMTP port (default: `1025`)

## Sentry

* `SENTRY_DSN` - Sentry DSN (default: none)
* `SENTRY_TRACE` - Sentry DSN tracing enabled (default: auto)
* `SENTRY_TRACE_SAMPLE_RATE` - Performance tracing sample rate (default: `0.5`)
