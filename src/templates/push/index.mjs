/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

const buildPushNotification = (templateName, fn) => args => i18n => {
  const { title, body } = fn(args)
  return {
    body,
    title: i18n.global.t(`notifications.${templateName}.title`, title)
  }
}

export const assignedTask = buildPushNotification('assignedTask', ({ task }) => ({
  body: task.body,
  title: {
    projectName: task.projects.map(p => p.name).join('/'),
    taskName: task.name
  }
}))

export const taskComment = buildPushNotification('taskComment', ({ task, comment }) => ({
  body: comment.body,
  title: {
    projectName: task.projects.map(p => p.name).join('/'),
    userName: comment.user.name,
    taskName: task.name
  }
}))

export const taskCompleted = buildPushNotification('taskCompleted', ({ task, performingUser }) => ({
  body: task.body,
  title: {
    projectName: task.projects.map(p => p.name).join('/'),
    userName: performingUser.name,
    taskName: task.name
  }
}))

export const createTask = buildPushNotification('createTask', ({ task }) => ({
  body: task.body,
  title: {
    projectName: task.projects.map(p => p.name).join('/'),
    userName: task.user.name,
    taskName: task.name
  }
}))

export const remindTask = buildPushNotification('remindTask', ({ task }) => ({
  body: task.body,
  title: {
    projectName: task.projects.map(p => p.name).join('/'),
    taskName: task.name
  }
}))
