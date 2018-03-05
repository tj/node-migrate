'use strict'

var Promise = require('bluebird')
var path = require('path')
var fs = Promise.promisifyAll(require('fs'))
var Migration = require('./migration')
module.exports = loadMigrationsIntoSet

async function loadMigrationsIntoSet (options) {
  // Process options, set and store are required, rest optional
  var opts = options || {}
  if (!opts.set || !opts.store) {
    throw new TypeError((opts.set ? 'store' : 'set') + ' is required for loading migrations')
  }
  var set = opts.set
  var store = opts.store
  var migrationsDirectory = path.resolve(opts.migrationsDirectory || 'migrations')
  var filterFn = opts.filterFunction || (() => true)
  var sortFn = opts.sortFunction || function (m1, m2) {
    return m1.title > m2.title ? 1 : (m1.title < m2.title ? -1 : 0)
  }

  // Load from migrations store first up
  let state = await store.load()
  // Set last run date on the set
  set.lastRun = state.lastRun || null

  // Read migrations directory
  let files = await fs.readdirAsync(migrationsDirectory)

  // Filter out non-matching files
  files = files.filter(filterFn)
  // Create migrations, keep a lookup map for the next step
  var migMap = {}
  var migrations = files.map(function (file) {
    // Try to load the migrations file
    var mod
    mod = require(path.join(migrationsDirectory, file))

    var migration = new Migration(file, mod.up, mod.down, mod.description)
    migMap[file] = migration
    return migration
  })
  // Fill in timestamp from state, or error if missing
  state.migrations && state.migrations.forEach(function (m) {
    if (m.timestamp !== null && !migMap[m.title]) {
      // @TODO is this the best way to handle this?
      throw new Error(`Missing migration file: ${m.title}`)
    } else if (!migMap[m.title]) {
      // Migration existed in state file, but was not run and not loadable
      return
    }
    migMap[m.title].timestamp = m.timestamp
  })
  // Sort the migrations by their title
  migrations = migrations.sort(sortFn)

  // Add the migrations to the set
  migrations.forEach(set.addMigration.bind(set))
}
