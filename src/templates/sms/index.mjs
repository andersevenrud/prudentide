/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

const buildSMS = (templateName, fn) => args => i18n =>
  i18n.global.t(
    `notifications.${templateName}.title`,
    fn(args)
  )

export const assignedTask = buildSMS('assignedTask', ({ task }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  taskName: task.name
}))

export const taskComment = buildSMS('taskComment', ({ task, comment }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  userName: comment.user.name,
  taskName: task.name
}))

export const taskCompleted = buildSMS('taskCompleted', ({ task, performingUser }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  userName: performingUser.name,
  taskName: task.name
}))

export const createTask = buildSMS('createTask', ({ task }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  userName: task.user.name,
  taskName: task.name
}))

export const remindTask = buildSMS('remindTask', ({ task }) => ({
  projectName: task.projects.map(p => p.name).join('/'),
  taskName: task.name
}))
