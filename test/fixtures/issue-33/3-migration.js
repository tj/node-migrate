
var db = require('../db');

exports.up = function (next) {
  db.issue33.push('3-up');
  next();
};

exports.down = function (next) {
  db.issue33.push('3-down');
  next();
};
