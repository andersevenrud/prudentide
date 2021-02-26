module.exports.seed = async (knex) => {
  await knex('project')
    .truncate()
    .insert([
      {
        userId: 1,
        name: 'project1'
      },
      {
        userId: 1,
        name: 'project2'
      }
    ])

  await knex('task')
    .truncate()
    .insert([
      {
        userId: 1,
        name: 'task1',
        closedAt: knex.fn.now()
      },
      {
        userId: 1,
        name: 'task2',
        closedAt: knex.fn.now()
      }
    ])

  await knex('taskProject')
    .truncate()
    .insert([
      {
        taskId: 1,
        projectId: 1
      },
      {
        taskId: 2,
        projectId: 2
      }
    ])

  await knex('taskAssignee')
    .truncate()
    .insert([
      {
        userId: 1,
        taskId: 1
      },
      {
        userId: 1,
        taskId: 2
      }
    ])
}
