/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */
import { createRouter } from './openapi.mjs'
import { withRoles } from './middleware/auth.mjs'
import * as healthController from './controllers/health.mjs'
import * as projectController from './controllers/project.mjs'
import * as projectLabelController from './controllers/projectLabel.mjs'
import * as projectMilestoneController from './controllers/projectMilestone.mjs'
import * as webhookController from './controllers/webhook.mjs'
import * as taskController from './controllers/task.mjs'
import * as userController from './controllers/user.mjs'
import * as userDeviceController from './controllers/userDevice.mjs'
import * as taskCommentController from './controllers/taskComment.mjs'
import * as taskAttachmentController from './controllers/taskAttachment.mjs'
import * as taskWatchController from './controllers/taskWatch.mjs'
import * as taskActionController from './controllers/taskAction.mjs'
import * as searchController from './controllers/search.mjs'
import * as groupController from './controllers/group.mjs'
import config from '../config.mjs'

const router = createRouter({
  schema: config.openapi.schema
})

router.get(
  '/v1/health',
  healthController.healthCheck
)

router.get(
  '/v1/me/task',
  taskController.listMyTasks
)

router.delete(
  '/v1/me/device/:device',
  userDeviceController.unregisterDevice
)

router.post(
  '/v1/me/device',
  userDeviceController.registerDevice
)

router.get(
  '/v1/me/profile',
  userController.viewProfile
)

router.put(
  '/v1/me/profile',
  userController.updateUserProfile
)

router.put(
  '/v1/me/avatar',
  userController.updateUserAvatar
)

router.get(
  '/v1/group',
  withRoles(['read:group']),
  groupController.listGroups
)

router.get(
  '/v1/group/:group',
  withRoles(['read:group']),
  groupController.viewGroup
)

router.put(
  '/v1/group/:group',
  withRoles(['update:group']),
  groupController.updateGroup
)

router.post(
  '/v1/group',
  withRoles(['create:group']),
  groupController.createGroup
)

router.get(
  '/v1/user/:user/avatar',
  userController.getUserAvatar
)

router.get(
  '/v1/project',
  withRoles(['read:project']),
  projectController.listProjects
)

router.get(
  '/v1/user/:user',
  userController.getUserProfile
)

router.post(
  '/v1/project',
  withRoles(['create:project']),
  projectController.createProject
)

router.post(
  '/v1/project/:project/archive',
  withRoles(['update:project']),
  projectController.archiveProject
)

router.delete(
  '/v1/project/:project/archive',
  withRoles(['update:project']),
  projectController.unArchiveProject
)

router.get(
  '/v1/project/:project',
  withRoles(['read:project']),
  projectController.getProject
)

router.put(
  '/v1/project/:project',
  withRoles(['update:project']),
  projectController.updateProject
)

router.get(
  '/v1/project/:project/webhook',
  withRoles(['read:project']),
  webhookController.listWebhooks
)

router.post(
  '/v1/project/:project/webhook',
  withRoles(['create:webhook']),
  webhookController.createWebhook
)

router.put(
  '/v1/project/:project/webhook/:webhook',
  withRoles(['update:webhook']),
  webhookController.updateWebhook
)

router.delete(
  '/v1/project/:project/webhook/:webhook',
  withRoles(['update:webhook']),
  webhookController.deleteWebhook
)

router.get(
  '/v1/project/:project/label',
  withRoles(['read:project']),
  projectLabelController.listLabels
)

router.post(
  '/v1/project/:project/label',
  withRoles(['update:project']),
  projectLabelController.createLabel
)

router.put(
  '/v1/project/:project/label/:label',
  withRoles(['update:project']),
  projectLabelController.updateLabel
)

router.delete(
  '/v1/project/:project/label/:label',
  withRoles(['update:project']),
  projectLabelController.deleteLabel
)

router.get(
  '/v1/project/:project/milestone',
  withRoles(['read:project']),
  projectMilestoneController.listMilestones
)

router.post(
  '/v1/project/:project/milestone',
  withRoles(['update:project']),
  projectMilestoneController.createMilestone
)

router.get(
  '/v1/project/:project/milestone/:milestone',
  withRoles(['update:project']),
  projectMilestoneController.getMilestone
)

router.put(
  '/v1/project/:project/milestone/:milestone',
  withRoles(['update:project']),
  projectMilestoneController.updateMilestone
)

router.delete(
  '/v1/project/:project/milestone/:milestone',
  withRoles(['update:project']),
  projectMilestoneController.deleteMilestone
)

router.get(
  '/v1/project/:project/task',
  withRoles(['read:task']),
  taskController.listProjectTasks
)

router.post(
  '/v1/task',
  withRoles(['create:task']),
  taskController.createTask
)

router.post(
  '/v1/task/:task/close',
  withRoles(['update:task']),
  taskController.closeTask
)

router.post(
  '/v1/task/:task/open',
  withRoles(['update:task']),
  taskController.openTask
)

router.get(
  '/v1/task/:task/attachment',
  withRoles(['read:task']),
  taskAttachmentController.listAttachments
)

router.post(
  '/v1/task/:task/attachment',
  withRoles(['update:task']),
  taskAttachmentController.createAttachment
)

router.get(
  '/v1/task/:task/attachment/:attachment',
  withRoles(['read:task']),
  taskAttachmentController.fetchAttachment
)

router.delete(
  '/v1/task/:task/attachment/:attachment',
  withRoles(['update:task']),
  taskAttachmentController.deleteAttachment
)

router.get(
  '/v1/task/:task/action',
  withRoles(['read:task']),
  taskActionController.listActions
)

router.post(
  '/v1/task/:task/action',
  withRoles(['create:task']),
  taskActionController.createAction
)

router.delete(
  '/v1/task/:task/action/:action',
  withRoles(['update:task']),
  taskActionController.deleteAction
)

router.put(
  '/v1/task/:task/action/:action',
  withRoles(['update:task']),
  taskActionController.updateAction
)

router.get(
  '/v1/task/:task/watch',
  withRoles(['read:task']),
  taskWatchController.listWatchers
)

router.post(
  '/v1/task/:task/watch',
  withRoles(['read:task']),
  taskWatchController.watchTask
)

router.delete(
  '/v1/task/:task/watch',
  withRoles(['read:task']),
  taskWatchController.unwatchTask
)

router.get(
  '/v1/task/:task/comment',
  withRoles(['read:task']),
  taskCommentController.listTaskComments
)

router.post(
  '/v1/task/:task/comment',
  withRoles(['task:comment']),
  taskCommentController.createTaskComment
)

router.post(
  '/v1/task/:task/comment/:comment/stick',
  withRoles(['task:comment']),
  taskCommentController.stickTaskComment
)

router.delete(
  '/v1/task/:task/comment/:comment/stick',
  withRoles(['task:comment']),
  taskCommentController.unStickTaskComment
)

router.put(
  '/v1/task/:task/comment/:comment',
  withRoles(['task:comment']),
  taskCommentController.updateTaskComment
)

router.put(
  '/v1/task/:task',
  withRoles(['update:task']),
  taskController.updateTask
)

router.get(
  '/v1/task/:task',
  withRoles(['read:task']),
  taskController.getTask
)

router.get(
  '/v1/search',
  withRoles(['read:task', 'read:project'], true),
  searchController.searchAll
)

export default router
