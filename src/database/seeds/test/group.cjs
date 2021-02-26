module.exports.seed = async (knex) => {
  await knex('userGroup')
    .truncate()
    .insert([
      {
        userId: 2,
        groupId: 2
      }
    ])
}
