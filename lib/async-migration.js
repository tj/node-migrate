
/*!
 * migrate - AsyncMigration
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Expose `AsyncMigration`.
 */

module.exports = AsyncMigration;

function AsyncMigration(title, upAsync, downAsync) {
  this.title = title;
  this.up = wrapPromiseMigrationFunction(upAsync);
  this.down = wrapPromiseMigrationFunction(downAsync);
}

function wrapPromiseMigrationFunction(originalFn) {
  return function (next) {
    Promise.resolve(originalFn()).then(function () {
      setImmediate(next, null);
    }, function (err) {
      setImmediate(next, err);
    });
  };
}
