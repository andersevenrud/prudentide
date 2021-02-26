module.exports.seed = async (knex) => {
  await knex('group').insert([
    {
      name: 'group1'
    },
    {
      name: 'group2'
    }
  ])

  await knex('userDevice').insert([
    {
      userId: 1,
      deviceToken: 'device1'
    },
    {
      userId: 2,
      deviceToken: 'jest2device'
    },
    {
      userId: 3,
      deviceToken: 'jest3device'
    }
  ])

  await knex('userGroup').insert([
    {
      userId: 1,
      groupId: 1
    },
    {
      userId: 2,
      groupId: 1
    },
    {
      userId: 2,
      groupId: 2
    },
    {
      userId: 3,
      groupId: 2
    }
  ])

  await knex('project').insert([
    {
      name: 'project1',
      body: 'body here',
      userId: 1
    }
  ])

  await knex('projectGroup').insert([
    {
      projectId: 1,
      groupId: 1
    },
    {
      projectId: 1,
      groupId: 2
    }
  ])
}
