module.exports.seed = async (knex) => {
  await knex('project')
    .truncate()
    .insert([
      {
        userId: 1,
        name: 'action project'
      }
    ])

  await knex('task')
    .truncate()
    .insert([
      {
        userId: 1,
        name: 'action task',
        notify: JSON.stringify(['sms', 'email', 'push'])
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
