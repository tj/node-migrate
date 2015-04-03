
var db = require('../db');

exports.up = function (next) {
  db.pets.push({ name: 'tobi' });
  db.pets.push({ name: 'loki' });
  next();
};

exports.down = function (next) {
  db.pets.pop();
  db.pets.pop();
  next();
};
