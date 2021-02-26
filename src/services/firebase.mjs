/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import admin from 'firebase-admin'
import config from '../config.mjs'

export const firebase = admin
  .initializeApp(config.firebase.connection)

export const sendPushNotification = (tokens, payload) => firebase
  .messaging()
  .sendToDevice(tokens, payload)
