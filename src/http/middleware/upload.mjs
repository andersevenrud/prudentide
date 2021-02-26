/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import fileUpload from 'express-fileupload'
import config from '../../config.mjs'

export const withFileUpload = () => fileUpload({
  ...config.app.uploads,
  abortOnLimit: true
})
