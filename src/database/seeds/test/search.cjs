module.exports.seed = async (knex) => {
  await knex('project')
    .truncate()
    .insert([
      {
        userId: 1,
        name: 'project1 foo'
      },
      {
        userId: 1,
        name: 'project2 foo'
      },
      {
        userId: 1,
        name: 'project3 foo',
        archivedAt: knex.fn.now()
      }
    ])

  await knex('task')
    .truncate()
    .insert([
      {
        name: 'task1 foo',
        userId: 1
      },
      {
        name: 'task2 foo',
        userId: 1
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
}
