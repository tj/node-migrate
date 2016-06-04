
var db = require('../db');

exports.upAsync = function (next) {
  db.tesla.push('3000-energies');

  return Promise.resolve();
};

exports.downAsync = function () {
  db.tesla.pop();

  return Promise.resolve();
};
