'use strict'

const path = require('path')
const migrate = require('../../')

async function run () {
  const options = {
    stateStore: path.join(__dirname, '.migrate'),
    migrationsDirectory: path.join(__dirname, 'migrations')
  }

  const set = await migrate.load(options)

  set.on('save', function () {
    console.log()
  })

  set.on('migration', function (migration, direction) {
    console.log(direction, migration.title)
  })

  await set.up()
}

run()
  .then(() => console.log('success!'))
  .catch((err) => console.error('Got an error during migration.. :(', err))
