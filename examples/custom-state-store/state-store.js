'use strict'

const flat = require('node-flat-db')
const storage = require('node-flat-db/file-async')

module.exports = StateStore

function StateStore (path) {
  this.db = flat(path || 'stateStore.json', { storage })
}

/**
 * Save the migration data.
 *
 * @api public
 */

StateStore.prototype.save = async function (set) {
  let state = {
    lastRun: set.lastRun,
    migrations: set.migrations
  }

  let collection = this.db('state')
  await collection.pop()
  await collection.push(state)
}

/**
 * Load the migration data and return state`.
 * @return Promise
 * @api public
 */

StateStore.prototype.load = async function () {
  let collection = this.db('state')

  let doc = await collection.head()

  if (!doc) {
    doc = {}
  }

  return doc
}
