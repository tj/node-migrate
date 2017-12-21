'use strict'

var fs = require('fs')

module.exports = FileStore

function FileStore (path) {
  this.path = path
}

/**
 * Save the migration data.
 *
 * @api public
 */

FileStore.prototype.save = function (set, fn) {
  fs.writeFile(this.path, JSON.stringify({
    lastRun: set.lastRun,
    migrations: set.migrations
  }, null, '  '), fn)
}

/**
 * Load the migration data and call `fn(err, obj)`.
 *
 * @param {Function} fn
 * @return {Type}
 * @api public
 */

FileStore.prototype.load = function (fn) {
  fs.readFile(this.path, 'utf8', function (err, json) {
    if (err && err.code !== 'ENOENT') return fn(err)
    if (!json || json === '') {
      return fn(null, {})
    }

    let store
    try {
      store = JSON.parse(json)
    } catch (err) {
      return fn(err)
    }

    // Check if old format and convert if needed
    if (!store.hasOwnProperty('lastRun') && store.hasOwnProperty('pos')) {
      if (store.pos === 0) {
        store.lastRun = null
      } else {
        if (store.pos > store.migrations.length) {
          return fn(new Error('Store file contains invalid pos property'))
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
      return fn(new Error('Invalid store file'))
    }

    return fn(null, store)
  })
}
