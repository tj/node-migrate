'use strict'

/*!
 * migrate
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var MigrationSet = require('./lib/set')
var FileStore = require('./lib/file-store')
var path = require('path')
var fs = require('fs')

/**
 * Expose the migrate function.
 */

exports = module.exports = migrate

function migrate (title, up, down) {
  // migration
  if (typeof title === 'string' && up && down) {
    migrate.set.addMigration(title, up, down)
  // specify migration file
  } else if (typeof title === 'string') {
    migrate.set = exports.load(title)
  // no migration path
  } else if (!migrate.set) {
    throw new Error('must invoke migrate(path) before running migrations')
  // run migrations
  } else {
    return migrate.set
  }
}

exports.load = function (stateFile, migrationsDirectory) {
  var store
  if (typeof stateFile === 'string') {
    store = new FileStore(stateFile)
  } else {
    store = stateFile
  }

  var set = new MigrationSet(store)
  var dir = path.resolve(migrationsDirectory)

  fs.readdirSync(dir).filter(function (file) {
    return file.match(/^\d+.*\.js$/)
  }).sort().forEach(function (file) {
    var mod = require(path.join(dir, file))
    set.addMigration(file, mod.up, mod.down)
  })

  return set
}
