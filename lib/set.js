'use strict'

/*!
 * migrate - Set
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events')
var Migration = require('./migration')
var migrate = require('./migrate')
var inherits = require('inherits')

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
  this.pos = 0
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
  this.migrations.push(new Migration(title, up, down))
}

/**
 * Save the migration data.
 *
 * @api public
 */

MigrationSet.prototype.save = function (fn) {
  this.store.save(this, (err) => {
    if (err) return fn(err)
    this.emit('save')
    fn(null)
  })
}

/**
 * Load the migration data and call `fn(err, obj)`.
 *
 * @param {Function} fn
 * @return {Type}
 * @api public
 */

MigrationSet.prototype.load = function (fn) {
  this.emit('load')
  this.store.load(fn)
}

/**
 * Run down migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.down = function (migrationName, fn) {
  this.migrate('down', migrationName, fn)
}

/**
 * Run up migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.up = function (migrationName, fn) {
  this.migrate('up', migrationName, fn)
}

/**
 * Migrate in the given `direction`, calling `fn(err)`.
 *
 * @param {String} direction
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.migrate = function (direction, migrationName, fn) {
  if (typeof migrationName === 'function') {
    fn = migrationName
    migrationName = null
  }
  this.load((err, obj) => {
    if (err) {
      if (err.code !== 'ENOENT') return fn(err)
    } else {
      this.pos = obj.pos
    }
    migrate(this, direction, migrationName, fn)
  })
}
