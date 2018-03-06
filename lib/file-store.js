'use strict'

var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))

module.exports = FileStore

function FileStore (path) {
  this.path = path
}

/**
 * Save the migration data.
 *
 * @api public
 */

FileStore.prototype.save = async function (set) {
  await fs.writeFileAsync(this.path, JSON.stringify({
    lastRun: set.lastRun,
    migrations: set.migrations
  }, null, '  '))
}

/**
 * Load the migration data
 *
 * @return {Promise<Type>}
 * @api public
 */

FileStore.prototype.load = async function () {
  let json
  try {
    json = await fs.readFileAsync(this.path, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
  if (!json || json === '') {
    return {}
  }
  let store = JSON.parse(json)

  // Check if old format and convert if needed
  if (!store.hasOwnProperty('lastRun') && store.hasOwnProperty('pos')) {
    if (store.pos === 0) {
      store.lastRun = null
    } else {
      if (store.pos > store.migrations.length) {
        throw new Error('Store file contains invalid pos property')
      }
      store.lastRun = store.migrations[store.pos - 1].title
    }

    // In-place mutate the migrations in the array
    store.migrations.forEach(function (migration, index) {
      if (index < store.pos) {
        migration.timestamp = Date.now()
      }
    })
  }

  // Check if does not have required properties
  if (!store.hasOwnProperty('lastRun') || !store.hasOwnProperty('migrations')) {
    throw new Error('Invalid store file')
  }
  return store
}
