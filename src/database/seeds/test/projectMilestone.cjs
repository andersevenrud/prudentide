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
}
