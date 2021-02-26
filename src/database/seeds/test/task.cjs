module.exports.seed = async (knex) => {
  await knex('project')
    .truncate()
    .insert([
      {
        name: 'project1',
        body: 'body here',
        userId: 1
      },
      {
        name: 'project2',
        body: 'body here',
        userId: 1
      }
    ])

  await knex('projectLabel')
    .truncate()
    .insert([
      {
        projectId: 1,
        name: 'label1'
      },
      {
        projectId: 1,
        name: 'label2'
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
