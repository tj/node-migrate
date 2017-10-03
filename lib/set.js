'use strict'

/*!
 * migrate - Set
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const EventEmitter = require('events')
const inherits = require('inherits')
const Migration = require('./migration')
const migrate = require('./migrate')

/**
 * Expose `Set`.
 */

module.exports = MigrationSet

/**
 * Initialize a new migration `Set` with the given `path`
 * which is used to store data between migrations.
 *
 * @param {String} path
 * @api private
 */

function MigrationSet (store) {
  this.store = store
  this.migrations = []
  this.map = {}
  this.lastRun = null
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

inherits(MigrationSet, EventEmitter)

/**
 * Add a migration.
 *
 * @param {String} title
 * @param {Function} up
 * @param {Function} down
 * @api public
 */

MigrationSet.prototype.addMigration = function (title, up, down) {
  let migration
  if (!(title instanceof Migration)) {
    migration = new Migration(title, up, down)
  } else {
    migration = title
  }

  // Only add the migration once, but update
  if (this.map[migration.title]) {
    this.map[migration.title].up = migration.up
    this.map[migration.title].down = migration.down
    this.map[migration.title].description = migration.description
    return
  }

  this.migrations.push(migration)
  this.map[migration.title] = migration
}

/**
 * Save the migration data.
 *
 * @api public
 */

MigrationSet.prototype.save = function () {
  return this.store.save(this)
    .then(() => {
      this.emit('save')
    })
}

/**
 * Run down migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.down = function (migrationName) {
  return this.migrate('down', migrationName)
}

/**
 * Run up migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.up = function (migrationName) {
  return this.migrate('up', migrationName)
}

/**
 * Migrate in the given `direction`, calling `fn(err)`.
 *
 * @param {String} direction
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.migrate = function (direction, migrationName) {
  return migrate(this, direction, migrationName)
}
