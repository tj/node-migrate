
var db = require('../db');

exports.up = function* () {
  db.tesla.push('1-energy');
};

exports.down = function* () {
  db.tesla.pop();
};
