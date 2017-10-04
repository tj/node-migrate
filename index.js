'use strict'

/*!
 * migrate
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

const MigrationSet = require('./lib/set')
const FileStore = require('./lib/file-store')
const loadMigrationsIntoSet = require('./lib/load-migrations')

module.exports = {
  MigrationSet,
  load
}

async function load (options) {
  const opts = options || {}

  // Create default store
  const store = (typeof opts.stateStore === 'string') ? new FileStore(opts.stateStore) : opts.stateStore

  // Create migration set
  const set = new MigrationSet(store)

  return loadMigrationsIntoSet({
    set: set,
    store: store,
    migrationsDirectory: opts.migrationsDirectory,
    filterFunction: opts.filterFunction,
    sortFunction: opts.sortFunction
  })
}
