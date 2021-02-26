module.exports.seed = async (knex) => {
  await knex('project')
    .truncate()
    .insert([
      {
        name: 'project1',
        body: 'body here',
        userId: 1
      }
    ])

  await knex('task')
    .truncate()
    .insert([
      {
        name: 'task1',
        userId: 1
      }
    ])

  await knex('taskProject')
    .truncate()
    .insert([
      {
        taskid: 1,
        projectId: 1
      }
    ])
}
