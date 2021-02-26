/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import nodemailer from 'nodemailer'
import config from '../config.mjs'

export const transporter = nodemailer.createTransport({
  ...config.nodemailer.connection
})

export const disconnectTransport = async () => transporter.close()

export const sendMail = options => transporter.sendMail({
  ...options,
  ...config.nodemailer.defaults
})
