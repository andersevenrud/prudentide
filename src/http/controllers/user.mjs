/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import { HttpBadRequestError } from '../exceptions/index.mjs'
import { saveUpload, readUpload } from '../../providers/storage.mjs'
import {
  queryUpdateUser,
  queryMyUser,
  queryViewUser
} from '../../database/repositories/user.mjs'

export const viewProfile = req =>
  queryMyUser(req.profile.id)

export const updateUserProfile = req => queryUpdateUser(
  req.profile.id,
  req.body
)

export const getUserAvatar = async (req, res, next) => {
  const { user } = req.bindings
  if (!user.avatar) {
    next(new HttpBadRequestError('AVATAR_NOT_FOUND'))
    return
  }

  const { stream } = await readUpload(
    'avatars',
    user.id,
    user.avatar,
    user.avatar
  )

  res.set('content-type', 'image/png')
  stream.pipe(res)
}

export const updateUserAvatar = async (req, res) => {
  const { hash } = await saveUpload(
    'avatars',
    req.profile.id,
    req.files.avatar
  )

  await queryUpdateUser(req.profile.id, {
    avatar: hash
  })

  return () => res.status(204).end()
}

export const getUserProfile = req =>
  queryViewUser(req.params.user)
