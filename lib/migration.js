
/*!
 * migrate - Migration
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Expose `Migration`.
 */

module.exports = Migration;

var isGeneratorFn = require('is-generator').fn;

var co;
try {
  co = require('co');
} catch (err) {
  // ignore
}

function Migration(title, up, down) {
  this.title = title;
  this.up = migrationFunction(up);
  this.down = migrationFunction(down);
}

function migrationFunction(originalFn) {
  var fn = originalFn;

  if (isGeneratorFn(originalFn)) {
    if (!co) {
      throw new Error("Generator migrations can only be used if the 'co' library is included. " +
        "Run 'npm install --save co' to use generator migrations.");
    }

    fn = function (next) {
      return co(originalFn).then(next.bind(null, null), next);
    };
  }

  return fn;
}
