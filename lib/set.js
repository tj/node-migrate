
/*!
 * migrate - Set
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , Migration = require('./migration')
  , fs = require('fs');

/**
 * Expose `Set`.
 */

module.exports = Set;

/**
 * Initialize a new migration `Set` with the given `path`
 * which is used to store data between migrations.
 *
 * @param {String} path
 * @api private
 */

function Set(path) {
  this.migrations = [];
  this.path = path;
  this.pos = 0;
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Set.prototype.__proto__ = EventEmitter.prototype;

/**
 * Add a migration.
 *
 * @param {String} title
 * @param {Function} up
 * @param {Function} down
 * @api public
 */

Set.prototype.addMigration = function(title, up, down){
  this.migrations.push(new Migration(title, up, down));
};

/**
 * Save the migration data.
 *
 * @api public
 */

Set.prototype.save = function(fn){
  var self = this
    , json = JSON.stringify(this);
  fs.writeFile(this.path, json, function(err){
    if (err) return fn(err);

    self.emit('save');
    fn(null);
  });
};

/**
 * Load the migration data and call `fn(err, obj)`.
 *
 * @param {Function} fn
 * @return {Type}
 * @api public
 */

Set.prototype.load = function(fn){
  this.emit('load');
  fs.readFile(this.path, 'utf8', function(err, json){
    if (err) return fn(err);
    try {
      fn(null, JSON.parse(json));
    } catch (err) {
      fn(err);
    }
  });
};

/**
 * Run down migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

Set.prototype.down = function(migrationName, fn){
  this.migrate('down', migrationName, fn);
};

/**
 * Run up migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

Set.prototype.up = function(migrationName, fn){
  this.migrate('up', migrationName, fn);
};

/**
 * Migrate in the given `direction`, calling `fn(err)`.
 *
 * @param {String} direction
 * @param {Function} fn
 * @api public
 */

Set.prototype.migrate = function(direction, migrationName, fn){
  if (typeof migrationName === 'function') {
    fn = migrationName;
    migrationName = null;
  }
  var self = this;
  this.load(function(err, obj){
    if (err) {
      if ('ENOENT' != err.code) return fn(err);
    } else {
      self.pos = obj.pos;
    }
    self._migrate(direction, migrationName, fn);
  });
};

/**
 * Get index of given migration in list of migrations
 *
 * @api private
 */

 function positionOfMigration(migrations, filename) {
   for(var i=0; i < migrations.length; ++i) {
     if (migrations[i].title == filename) return i;
   }
   return -1;
 }

/**
 * Perform migration.
 *
 * @api private
 */

Set.prototype._migrate = function(direction, migrationName, fn){
  var self = this
    , migrations
    , migrationPos;

  if (!migrationName) {
    migrationPos = direction == 'up' ? this.migrations.length : 0;
  } else if ((migrationPos = positionOfMigration(this.migrations, migrationName)) == -1) {
    return fn(new Error("Could not find migration: " + migrationName));
  }

  switch (direction) {
    case 'up':
      migrations = this.migrations.slice(this.pos, migrationPos+1);
      break;
    case 'down':
      migrations = this.migrations.slice(migrationPos, this.pos).reverse();
      break;
  }

  function next(migration) {
    if (!migration) return fn(null);

    self.emit('migration', migration, direction);
    migration[direction](function(err){
      if (err) return fn(err);

      self.pos += (direction === 'up' ? 1 : -1);
      self.save(function (err) {
        if (err) return fn(err);

        next(migrations.shift())
      });
    });
  }

  next(migrations.shift());
};
