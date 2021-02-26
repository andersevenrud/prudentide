/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import path from 'path'
import fs from 'fs-extra'
import config from '../config.mjs'

const createPath = (folder, resource, filename) => {
  const basePath = path.resolve(config.storage.root, folder, String(resource))
  return path.resolve(basePath, filename)
}

export const saveFile = async (folder, resource, hash, file) => {
  const destination = createPath(folder, resource, hash)
  await fs.ensureDir(path.dirname(destination))
  return fs.writeFile(destination, file)
}

export const saveUpload = async (folder, resource, attachment) => {
  const destination = createPath(folder, resource, attachment.md5)

  /* istanbul ignore else */
  if (!await fs.pathExists(destination)) {
    await fs.ensureDir(path.dirname(destination))
    await attachment.mv(destination)
  }

  return {
    filename: attachment.name,
    hash: attachment.md5
  }
}

export const readUpload = async (folder, resource, filename, hash) => {
  const source = createPath(folder, resource, hash)
  const stream = fs.createReadStream(source)

  return { stream, filename }
}

export const removeUpload = async (folder, resource, hash) => {
  const source = createPath(folder, resource, hash)

  /* istanbul ignore else */
  if (!await fs.pathExists(source)) {
    return true
  }

  return fs.unlink(source)
}
