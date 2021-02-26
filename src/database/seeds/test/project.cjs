module.exports.seed = async (knex) => {
  await knex('group')
    .truncate()
    .insert([
      {
        name: 'group1'
      },
      {
        name: 'group2'
      }
    ])

  await knex('userGroup')
    .truncate()
    .insert([
      {
        userId: 2,
        groupId: 1
      }
    ])
}
