
/*!
 * migrate - Migration
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Expose `Migration`.
 */

module.exports = Migration;

function Migration(title, up, down) {
  this.title = title;
  this.up = up;
  this.down = down;
}

Migration.prototype.run = function (operation, callback) {
  this.operation = operation;
  this.timestamp = new Date();
  return this[operation](callback);
};