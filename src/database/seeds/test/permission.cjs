module.exports.seed = async (knex) => {
  await knex('group')
    .truncate()
    .insert([
      {
        name: 'Copyleft Solutions'
      },
      {
        name: 'Everybody'
      },
      {
        name: 'All sub group',
        parentId: 2
      }
    ])

  await knex('userGroup')
    .truncate()
    .insert([
      {
        userId: 2,
        groupId: 2,
        permission: 'reporter'
      },
      {
        userId: 1,
        groupId: 2
      }
    ])
}
