'use strict'

const fs = require('fs')
const util = require('util')

const pWriteFile = util.promisify(fs.writeFile)
const pReadFile = util.promisify(fs.readFile)

module.exports = FileStore

function FileStore (path) {
  this.path = path
}

/**
 * Save the migration data.
 *
 * @api public
 */

FileStore.prototype.save = function (set) {
  let state = {
    lastRun: set.lastRun,
    migrations: set.migrations
  }

  return pWriteFile(this.path, JSON.stringify(state, null, '  '))
}

/**
 * Load the migration data and call `fn(err, obj)`.
 *
 * @param {Function} fn
 * @return {Type}
 * @api public
 */

FileStore.prototype.load = function () {
  return pReadFile(this.path, 'utf8')
    .then((json) => JSON.parse(json))
    .catch((err) => {
      if (err && err.code === 'ENOENT') {
        return {}
      }

      return Promise.reject(err)
    })
}
