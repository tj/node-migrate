
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
 * Initialize a new migration `Set` with the given `store`
 * which is used to store data between migrations.
 *
 * @param {String} store
 * @api private
 */

function Set(store) {
  this.migrations = [];
  this.store = store;
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

Set.prototype.save = function(migration, fn){
  var self = this;

  this.store.save(migration, function (err) {
    if (err) return fn(err);

    self.emit('save');
    fn(null);
  });
};

/**
 * Load all the migration data and call `fn(err, obj)`.
 *
 * @param {Function} fn
 * @return {Type}
 * @api public
 */

Set.prototype.load = function(fn) {
  this.emit('load');
  var self = this;
  this.store.load(function(err, allExecutedMigrations) {
    self.allExecutedMigrations = allExecutedMigrations;
    fn(err, allExecutedMigrations, function(doneCallback) {
      if (self.store.unlock)
        self.store.unlock(doneCallback);
      else
        doneCallback()
    });
  });
}

/**
 * Load the net migration state data and call `fn(err, obj)`.
 * Net migration data means all the 'ups' minus the 'downs'
 *
 * @param {Function} fn
 * @return {Type}
 * @api public
 */
Set.prototype.loadNet = function (fn) {
  var self = this;
  this.load(function(err, res, done) {
    if (err)
      return fn(err, res, done);

    var netMigrationsObj = self.allExecutedMigrations.reduce(
      function (obj, m) {
        if (obj[m.title] && m.operation == 'down') {
          delete obj[m.title];
        } else {
          obj[m.title] = true;
        }
        return obj;
      },
      {}
    );
    self.appliedMigrationTitles = Object.keys(netMigrationsObj).sort();
    fn(null, self.appliedMigrationTitles, done)
  })
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
  this.loadNet(function(err, migrations, done){
    if (err) {
      if ('ENOENT' != err.code) return fn(err);
    }
    self._migrate(direction, migrationName, function(err, res) {
      done(function () {
        fn(err, res);
      });
    });
  });
};

/**
 * Perform migration.
 *
 * @api private
 */

Set.prototype._migrate = function(direction, migrationName, fn){
  var self = this
    , newMigrations;

  //Consider using lodash for get*Migrations Function - much cleaner
  function getUpMigrations(appliedTitles, allMigrations) {
    if (!appliedTitles)
      return allMigrations.slice(0); //clone

    return allMigrations.filter(function (m) {
      return appliedTitles.indexOf(m.title) === -1;
    }); // filter out applied migrations
  }

  function getDownMigrations(appliedTitles, allMigrations) {
    if (!allMigrations || !appliedTitles)
      return [];

    var migrationTitles = allMigrations.map(function (m) {
      return m.title
    });

    return appliedTitles.reverse().reduce(function (buff, title) {
        var i = migrationTitles.indexOf(title);
        if (i >= 0)
          buff.push(allMigrations[i]);
        return buff;
      },
      []); // Select applied migrations, use reduce in case the files have been deleted
  }

  function takeUntil(arr, val, prop) {
    var buff = [];
    for(var i = 0, found = false; i<arr.length && !found; i++) {
      buff.push(arr[i]);
      found = (prop && arr[i][prop] === val) || arr[i] === val;
    }
    return buff;
  }

  function next(migration) {
    if (!migration) return fn(null);

    self.emit('migration', migration, direction);
    migration.run(direction, function(err){
      if (err) return fn(err);

      self.save(migration, function (err) {
        if (err) return fn(err);

        next(newMigrations.shift())
      });
    });
  }

  switch (direction) {
    case 'up':
      newMigrations = getUpMigrations(self.appliedMigrationTitles, self.migrations);
      break;
    case 'down':
      newMigrations = getDownMigrations(self.appliedMigrationTitles, self.migrations);
      break;
  }
  self.emit('newMigrations', newMigrations)
  console.log('running ' + newMigrations.map(function(m) {return m.title;}).join(',') + ': ' + direction);

  if (migrationName) {
    var k = takeUntil(newMigrations, migrationName, 'title');
    if (k.length === newMigrations.length)
      return fn(new Error("Could not find migrationName " + migrationName));
    newMigrations = k;
  }

  next(newMigrations.shift());
};
