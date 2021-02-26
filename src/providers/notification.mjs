/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { sortedUniq, uniqBy } from '../utils/primitives.mjs'
import { sendPushNotification } from '../services/firebase.mjs'
import { sendMail } from '../services/nodemailer.mjs'
import { sendSMS } from '../services/twilio.mjs'
import { createI18n } from './template.mjs'
import * as emails from '../templates/email/index.mjs'
import * as pushes from '../templates/push/index.mjs'
import * as smses from '../templates/sms/index.mjs'
import winston from '../services/logger.mjs'
import config from '../config.mjs'

const notifyConditions = {
  push: user => user.devices.length > 0,
  email: () => true,
  sms: user => !!user.mobile
}

const filteringConditions = {
  push: user => sortedUniq(user.devices.map(d => d.deviceToken)).join(','),
  email: user => user.email,
  sms: user => user.mobile
}

const createPushNotification = async (template, data, i18n) => ({
  message: {
    notification: await pushes[template](data)(i18n),
    data: {
      userId: data.user.id
    }
  },
  tokens: data.user.devices.map(
    ({ deviceToken }) => deviceToken
  )
})

const createEmail = async (template, data, i18n) => ({
  to: data.user.email,
  ...await emails[template](data)(i18n)
})

const createSMS = async (template, data, i18n) => ({
  to: data.user.mobile,
  message: smses[template](data)(i18n)
})

// Filters out any notifications going out to duplicate email/mobile/etc
// NOTE: Push notification filtering is not correct because there can be
//        multiple user profiles with *some* of the same device token(s).
//        So in some cases duplicates will go out. Applications that use
//        this feature should skip these by comparing the userId against
//        the logged in one.
export const filterNotifyRecipients = notifications => uniqBy(notifications, (n) => {
  return [n.type, filteringConditions[n.type](n.data.user)].join()
})

export const notifyTypesFromTask = (task, user, template, payload = {}) => task
  .notify
  .filter(type => config.app.features.notifications[type])
  .filter(type => notifyConditions[type](user))
  .map(type => ({ template, type, data: { task, user, ...payload } }))

export const notify = async ({
  template,
  type,
  data
}) => {
  const i18n = createI18n({
    locale: data.user.locale
  })

  switch (type) {
    case 'push': {
      const { tokens, message } = await createPushNotification(template, data, i18n)
      return sendPushNotification(tokens, message)
    }

    case 'email': {
      const mail = await createEmail(template, data, i18n)
      return sendMail(mail)
    }

    case 'sms': {
      const { to, message } = await createSMS(template, data, i18n)
      return sendSMS(to, message)
    }

    /* istanbul ignore next */
    default:
      winston.log({
        level: 'alert',
        message: `Invalid notification type: ${type}`
      })
  }
}
