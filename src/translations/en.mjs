/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

export default {
  notifications: {
    assignedTask: {
      title: '[{projectName} - {taskName}] Assigned task',
      message: 'You have been assigned a task'
    },

    taskComment: {
      title: '[{projectName} - {taskName}] {userName} commented'
    },

    taskCompleted: {
      title: '[{projectName} - {taskName}] Completed task',
      message: '{userName} marked task as closed'
    },

    createTask: {
      title: '[{projectName} - {taskName}] Task created',
      message: '{userName} created a new task'
    },

    remindTask: {
      title: '[{projectName} - {taskName}] Task reminder',
      message: 'This is a task reminder'
    }
  }
}
