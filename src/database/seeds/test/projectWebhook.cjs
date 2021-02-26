module.exports.seed = async (knex) => {
  await knex('project')
    .truncate()
    .insert([
      {
        userId: 1,
        name: 'webhook project'
      }
    ])
}
