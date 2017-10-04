'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const Migration = require('./migration')

const pReaddir = util.promisify(fs.readdir)

module.exports = loadMigrationsIntoSet

async function loadMigrationsIntoSet (options) {
  // Process options, set and store are required, rest optional
  const opts = options || {}
  if (!opts.set || !opts.store) {
    throw new TypeError((opts.set ? 'store' : 'set') + ' is required for loading migrations')
  }
  const set = opts.set
  const store = opts.store
  const migrationsDirectory = path.resolve(opts.migrationsDirectory || 'migrations')
  const filterFn = opts.filterFunction || (() => true)
  const sortFn = opts.sortFunction || function (m1, m2) {
    return m1.title > m2.title ? 1 : (m1.title < m2.title ? -1 : 0)
  }

  // Load from migrations store first up
  const state = await store.load()

  // Set last run date on the set
  set.lastRun = state.lastRun || null

  // Read migrations directory
  let files
  try {
    files = await pReaddir(migrationsDirectory)
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Migration directory "${migrationsDirectory}"" not found. Try creating it manually or by running 'migrate init' first.`)
    }

    throw error
  }

  // Filter out non-matching files
  files = files.filter(filterFn)
  // Create migrations, keep a lookup map for the next step
  const migMap = {}
  let migrations = files.map(function (file, index) {
    // Try to load the migrations file
    let filePath = path.join(migrationsDirectory, file)
    let mod = require(filePath)
    const migration = new Migration(file, mod.up, mod.down, mod.description)
    migMap[file] = migration
    return migration
  })

  // Fill in timestamp from state, or error if missing
  state.migrations && state.migrations.forEach(function (m) {
    if (!migMap[m.title]) {
      // @TODO is this the best way to handle this?
      throw new Error('Missing migration file: ' + m.title)
    }

    migMap[m.title].timestamp = m.timestamp
  })

  // Sort the migrations by their title
  migrations = migrations.sort(sortFn)

  // Add the migrations to the set
  migrations.forEach(set.addMigration.bind(set))

  // Successfully loaded
  return set
}
