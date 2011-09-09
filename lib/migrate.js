
/*!
 * migrate
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Migration = require('./migration')
  , Set = require('./set');

/**
 * Expose the migrate function.
 */

exports = module.exports = migrate;

/**
 * Library version.
 */

exports.version = '0.0.2';

function migrate(title, up, down) {
  // migration
  if ('string' == typeof title && up && down) {
    migrate.set.migrations.push(new Migration(title, up, down));
  // specify migration file
  } else if ('string' == typeof title) {
    migrate.set = new Set(title);
  // no migration path
  } else if (!migrate.set) {
    throw new Error('must invoke migrate(path) before running migrations');
  // run migrations
  } else {
    return migrate.set;
  }
}