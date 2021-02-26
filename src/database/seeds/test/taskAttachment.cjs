module.exports.seed = async (knex) => {
  await knex('project')
    .truncate()
    .insert([
      {
        userId: 1,
        name: 'attachment project'
      }
    ])

  await knex('task')
    .truncate()
    .insert([
      {
        userId: 1,
        name: 'attachment task'
      }
    ])

  await knex('taskProject')
    .truncate()
    .insert([
      {
        taskId: 1,
        projectId: 1
      }
    ])
}
