
var db = require('../db');

exports.up = function (next) {
  db.pets.push({ name: 'jane' });
  next();
};

exports.down = function (next) {
  db.pets.pop();
  next();
};
