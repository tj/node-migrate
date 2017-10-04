'use strict'

const path = require('path')
const migrate = require('../../index')
const StateStore = require('./state-store')

async function run () {
  const store = new StateStore(path.join(__dirname, 'state-db.json'))

  const options = {
    stateStore: store,
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
