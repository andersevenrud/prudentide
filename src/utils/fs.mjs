/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import fs from 'fs'
import path from 'path'
import glob from 'glob'

export const readFilesAsEntries = (pattern, cwd) => {
  const filenames = glob.sync(pattern, { cwd })

  return Object.fromEntries(filenames.map(filename => {
    const contents = fs.readFileSync(
      path.resolve(cwd, filename),
      'utf8'
    )

    return [filename.replace(/\.\w+/, ''), contents]
  }))
}
