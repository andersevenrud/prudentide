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

  await knex('projectMilestone')
    .truncate()
    .insert([
      {
        projectId: 1,
        name: 'm1'
      },
      {
        projectId: 1,
        name: 'm2'
      },
      {
        projectId: 1,
        name: 'm3'
      }
    ])
}
