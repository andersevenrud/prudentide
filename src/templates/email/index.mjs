/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import path from 'path'
import { readFilesAsEntries } from '../../utils/fs.mjs'
import { renderTemplate } from '../../providers/template.mjs'
import config from '../../config.mjs'

const templates = readFilesAsEntries('*.html', path.resolve(config.root, 'src', 'templates', 'email'))

const buildEmail = (templateName, fn) => args => async (i18n) => {
  const subject = i18n.global.t(`notifications.${templateName}.title`, fn(args))
  const html = await renderTemplate({
    subject,
    ...args
  }, templates[templateName], templates.base, i18n)

  return { subject, html }
}

export const assignedTask = buildEmail('assignedTask', ({ task }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  taskName: task.name
}))

export const taskComment = buildEmail('taskComment', ({ task, comment }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  userName: comment.user.name,
  taskName: task.name
}))

export const taskCompleted = buildEmail('taskCompleted', ({ task, performingUser }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  userName: performingUser.name,
  taskName: task.name
}))

export const createTask = buildEmail('createTask', ({ task }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  userName: task.user.name,
  taskName: task.name
}))

export const remindTask = buildEmail('remindTask', ({ task }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  taskName: task.name
}))
