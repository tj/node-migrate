
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

exports.version = '0.1.3';

function migrate(options, up, down) {
  // migration
  if ('string' == typeof options && up && down) {
    migrate.set.migrations.push(new Migration(options, up, down));
  // specify migration file
  } else if ('string' == typeof options) {
    migrate.set = new Set({path:options});
  // custom migration source
  } else if ('object' == typeof options) {
    migrate.set = new Set({
      save: options.save,
      load: options.load
    });
  // no migration path
  } else if (!migrate.set) {
    throw new Error('must invoke migrate(path) before running migrations');
  // run migrations
  } else {
    return migrate.set;
  }
}
