/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import * as Vue from 'vue'
import * as VueI18n from 'vue-i18n'
import { renderToString } from '@vue/server-renderer'
import mjml from 'mjml'
import messages from '../translations/index.mjs'
import config from '../config.mjs'

export const createI18n = (options = {}) => VueI18n.createI18n({
  locale: config.app.defaultLocale,
  fallbackLocale: config.app.defaultLocale,
  messages,
  ...options
})

export const renderTemplate = async (data, template, baseTemplate, i18n) => {
  if (typeof template !== 'string') {
    throw new TypeError('Expected to render a [template] string')
  }

  if (typeof baseTemplate !== 'string') {
    throw new TypeError('Expected to render a [baseTemplate] string')
  }

  const app = Vue.createSSRApp({
    data: () => ({
      ...data,
      app: {
        name: config.app.name
      }
    }),

    // FIXME: In vue 2 server renderer one could have a base template
    template: baseTemplate.replace('<!--vue-ssr-outlet-->', template)
  })

  app.config.isCustomElement = tag => String(tag).match(/(mjml)|(mj)/)
  app.use(i18n)

  const html = await renderToString(app)
  const clean = html.replace(' data-server-rendered="true"', '')
  const mjmlRenderer = mjml(clean)

  if (mjmlRenderer.errors.length > 0) {
    const error = mjmlRenderer.errors
      .map(err => err.formattedMessage)
      .join(', ')

    throw new Error(`MJML Errors: ${error}`)
  }

  return mjmlRenderer.html
}
