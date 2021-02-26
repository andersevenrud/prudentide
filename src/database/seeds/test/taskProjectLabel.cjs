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

  await knex('projectLabel')
    .truncate()
    .insert([
      {
        projectId: 1,
        name: 'bug'
      },
      {
        projectId: 1,
        name: 'question'
      },
      {
        projectId: 1,
        name: 'documentation'
      }
    ])
}
