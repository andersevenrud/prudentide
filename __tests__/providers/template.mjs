/* eslint-env jest */

import { createI18n, renderTemplate } from '../../src/providers/template.mjs'

const baseTemplate = `<mjml>
  <mj-body>
    <!--vue-ssr-outlet-->
  </mj-body>
</mjml>`

describe('providers/template', () => {
  const i18n = createI18n()

  test('should render template', async () => {
    const result = await renderTemplate({}, '<mj-section />', baseTemplate, i18n)
    expect(typeof result === 'string').toBe(true)
  })

  test('should catch template errors', async () => {
    await expect(renderTemplate({}, '<div />', baseTemplate, i18n))
      .rejects
      .toThrow('MJML Errors')
  })

  test('should catch template exception', async () => {
    await expect(renderTemplate({}, null, null, i18n))
      .rejects
      .toThrow('Expected to render a [template] string')
  })

  test('should catch baseTemplate exception', async () => {
    await expect(renderTemplate({}, '', null, i18n))
      .rejects
      .toThrow('Expected to render a [baseTemplate] string')
  })
})
