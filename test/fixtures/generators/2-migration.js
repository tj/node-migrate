
var db = require('../db');

exports.up = function* (next) {
  db.tesla.push('2-energies');

  yield next;
};

exports.down = function* (next) {
  db.tesla.pop();

  yield next;
};
