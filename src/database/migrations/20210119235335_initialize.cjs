module.exports = {
  async up (knex) {
    await knex.schema.createTable('group', (table) => {
      table.increments('id').primary()
      table.integer('parentId').unsigned().references('group.id')
      table.string('name')
      table.text('body').nullable()
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
    })

    await knex.schema.createTable('user', (table) => {
      table.increments('id').primary()
      table.string('name')
      table.string('username')
      table.string('email')
      table.string('mobile').nullable()
      table.string('locale').defaultTo('en')
      table.string('sub')
      table.string('avatar').nullable()
      table.json('roles')
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
      table.timestamp('deletedAt').nullable()
      table.timestamp('deactivatedAt').nullable()
      table.unique(['username'])
      table.unique(['email', 'sub'])
    })

    await knex.schema.createTable('userDevice', (table) => {
      table.increments('id').primary()
      table.integer('userId').unsigned().references('user.id')
      table.string('deviceToken', 512)
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
      table.unique(['userId', 'deviceToken'])
    })

    await knex.schema.createTable('project', (table) => {
      table.increments('id').primary()
      table.integer('userId').unsigned().references('user.id')
      table.string('name')
      table.text('body').nullable()
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
      table.timestamp('deletedAt').nullable()
      table.timestamp('lastActiveAt').defaultTo(knex.fn.now())
      table.timestamp('archivedAt').nullable()
    })

    await knex.schema.createTable('projectLabel', (table) => {
      table.increments('id').primary()
      table.integer('projectId').unsigned().references('project.id')
      table.integer('priority').unsigned().nullable()
      table.string('name')
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
    })

    await knex.schema.createTable('webhook', (table) => {
      table.increments('id').primary()
      table.integer('projectId').unsigned().references('project.id')
      table.string('method').nullable()
      table.string('url')
      table.string('token')
      table.json('headers').nullable()
      table.json('events')
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
      table.timestamp('lastSignaledAt').nullable()
    })

    await knex.schema.createTable('task', (table) => {
      table.increments('id').primary()
      table.integer('userId').unsigned().references('user.id')
      table.string('name')
      table.text('body').nullable()
      table.json('data')
      table.json('attributes')
      table.json('notify')
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
      table.timestamp('deletedAt').nullable()
      table.timestamp('lastActiveAt').defaultTo(knex.fn.now())
      table.timestamp('closedAt').nullable()
      table.timestamp('expiresAt').nullable()
    })

    await knex.schema.createTable('taskProject', (table) => {
      table.integer('taskId').unsigned().references('task.id')
      table.integer('projectId').unsigned().references('project.id')
      table.unique(['projectId', 'taskId'])
    })

    await knex.schema.createTable('taskComment', (table) => {
      table.increments('id').primary()
      table.integer('taskId').unsigned().references('task.id')
      table.integer('userId').unsigned().references('user.id')
      table.text('body')
      table.boolean('sticky').defaultTo(false)
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
    })

    await knex.schema.createTable('taskAttachment', (table) => {
      table.increments('id').primary()
      table.integer('taskId').unsigned().references('task.id')
      table.integer('userId').unsigned().references('user.id')
      table.text('filename')
      table.text('hash')
      table.timestamp('createdAt').defaultTo(knex.fn.now())
    })

    await knex.schema.createTable('taskWatcher', (table) => {
      table.integer('taskId').unsigned().references('task.id')
      table.integer('userId').unsigned().references('user.id')
      table.unique(['userId', 'taskId'])
    })

    await knex.schema.createTable('taskAssignee', (table) => {
      table.integer('taskId').unsigned().references('task.id')
      table.integer('userId').unsigned().references('user.id')
      table.unique(['userId', 'taskId'])
    })

    await knex.schema.createTable('taskProjectLabel', (table) => {
      table.integer('taskId').unsigned().references('task.id')
      table.integer('projectLabelId').unsigned().references('projectLabel.id').onDelete('CASCADE')
      table.unique(['taskId', 'projectLabelId'])
    })

    await knex.schema.createTable('userGroup', (table) => {
      table.integer('userId').unsigned().references('user.id')
      table.integer('groupId').unsigned().references('group.id').onDelete('CASCADE')
      table.string('permission').defaultTo('default')
      table.unique(['userId', 'groupId'])
    })

    await knex.schema.createTable('projectGroup', (table) => {
      table.integer('projectId').unsigned().references('project.id')
      table.integer('groupId').unsigned().references('group.id').onDelete('CASCADE')
      table.unique(['projectId', 'groupId'])
    })

    await knex.schema.createTable('projectMilestone', (table) => {
      table.increments('id').primary()
      table.integer('projectId').unsigned().references('project.id')
      table.string('name')
      table.text('body').nullable()
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('updatedAt').defaultTo(knex.fn.now())
      table.timestamp('closedAt').nullable()
    })

    await knex.schema.createTable('taskProjectMilestone', (table) => {
      table.integer('taskId').unsigned().references('task.id')
      table.integer('projectMilestoneId').unsigned().references('projectMilestone.id').onDelete('CASCADE')
      table.unique(['taskId', 'projectMilestoneId'])
    })

    await knex.schema.createTable('taskAction', (table) => {
      table.increments('id').primary()
      table.integer('taskId').unsigned().references('task.id')
      table.integer('userId').unsigned().references('user.id')
      table.string('action')
      table.json('attributes').nullable()
      table.timestamp('createdAt').defaultTo(knex.fn.now())
      table.timestamp('scheduledAt')
      table.timestamp('processedAt').nullable()
    })
  },

  async down (knex) {
    await knex.schema.dropTable('userDevice')
    await knex.schema.dropTable('userGroup')
    await knex.schema.dropTable('projectGroup')
    await knex.schema.dropTable('taskWatcher')
    await knex.schema.dropTable('taskComment')
    await knex.schema.dropTable('taskAttachment')
    await knex.schema.dropTable('taskAction')
    await knex.schema.dropTable('task')
    await knex.schema.dropTable('taskProjectLabel')
    await knex.schema.dropTable('taskProjectMilestone')
    await knex.schema.dropTable('taskProject')
    await knex.schema.dropTable('projectMilestone')
    await knex.schema.dropTable('webhook')
    await knex.schema.dropTable('project')
    await knex.schema.dropTable('user')
  }
}
