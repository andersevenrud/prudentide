/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import Group from './group.mjs'
import Task from './task.mjs'
import Project from './project.mjs'
import ProjectLabel from './projectLabel.mjs'
import ProjectMilestone from './projectMilestone.mjs'
import User from './user.mjs'
import UserDevice from './userDevice.mjs'
import Webhook from './webhook.mjs'
import TaskComment from './taskComment.mjs'
import TaskAttachment from './taskAttachment.mjs'
import TaskAction from './taskAction.mjs'

const models = {
  Group,
  Task,
  Project,
  ProjectLabel,
  ProjectMilestone,
  User,
  UserDevice,
  Webhook,
  TaskComment,
  TaskAttachment,
  TaskAction
}

Object
  .values(models)
  .forEach(m => m.createRelationMappings(models))

export {
  Group,
  Task,
  Project,
  ProjectLabel,
  ProjectMilestone,
  User,
  UserDevice,
  Webhook,
  TaskComment,
  TaskAttachment,
  TaskAction
}
