'use strict'

const path = require('path')
const fs = require('fs').promises
const url = require('node:url')
const Migration = require('./migration')

module.exports = loadMigrationsIntoSet

function loadMigrationsIntoSet (options, fn) {
  // Process options, set and store are required, rest optional
  const opts = options || {}
  if (!opts.set || !opts.store) {
    throw new TypeError((opts.set ? 'store' : 'set') + ' is required for loading migrations')
  }
  const set = opts.set
  const store = opts.store
  const ignoreMissing = !!opts.ignoreMissing
  const migrationsDirectory = path.resolve(opts.migrationsDirectory || 'migrations')
  const filterFn = opts.filterFunction || (() => true)
  const sortFn = opts.sortFunction || function (m1, m2) {
    return m1.title > m2.title ? 1 : (m1.title < m2.title ? -1 : 0)
  }

  // Load from migrations store first up
  store.load(async function (err, state) {
    if (err) return fn(err)

    try {
      // Set last run date on the set
      set.lastRun = state.lastRun || null

      // Read migrations directory
      let files = await fs.readdir(migrationsDirectory)

      // Filter out non-matching files
      files = files.filter(filterFn)

      // Create migrations, keep a lookup map for the next step
      const migMap = {}
      const promises = files.map(async function (file) {
        // Try to load the migrations file
        const filepath = path.join(migrationsDirectory, file)
        let mod
        try {
          mod = require(filepath)
        } catch (e) {
          if (e.code === 'ERR_REQUIRE_ESM') {
            mod = await import(url.pathToFileURL(filepath))
          } else {
            return fn(e)
          }
        }

        const migration = new Migration(file, mod.up, mod.down, mod.description)
        migMap[file] = migration
        return migration
      })
      let migrations = await Promise.all(promises)

      // Fill in timestamp from state, or error if missing
      state.migrations && state.migrations.forEach(function (m) {
        if (m.timestamp !== null && !migMap[m.title]) {
          return ignoreMissing ? null : fn(new Error('Missing migration file: ' + m.title))
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

      // Successfully loaded
      fn()
    } catch (e) {
      fn(e)
    }
  })
}
