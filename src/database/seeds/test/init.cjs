module.exports.seed = knex => knex('user')
  .truncate()
  .insert([
    {
      sub: 'jest',
      name: 'jest',
      username: 'jest',
      email: 'jest@localhost',
      mobile: '+001234567890',
      roles: [
        'read:project',
        'create:project',
        'update:project',
        'read:task',
        'create:task',
        'update:task',
        'task:comment',
        'create:webhook',
        'update:webhook',
        'read:group',
        'create:group',
        'update:group'
      ]
    },
    {
      sub: 'jest2',
      name: 'jest2',
      username: 'jest2',
      email: 'jest2@localhost',
      mobile: '+001234567890',
      roles: [
        'read:project',
        'create:project',
        'update:project',
        'read:task',
        'create:task',
        'update:task',
        'task:comment',
        'create:webhook',
        // 'update:webhook',
        'read:group',
        'create:group',
        'update:group'
      ]
    },
    {
      sub: 'jestadmin',
      name: 'jestadmin',
      username: 'jestadmin',
      email: 'jestadmin@localhost',
      mobile: '+001234567890',
      roles: [
        'admin'
      ]
    }
  ])
