
var db = require('../db');

exports.up = function* () {
  yield new Promise(function (resolve, reject) {
    setTimeout(function () {
      db.tesla.push('3000-energies');
      resolve();
    }, 10);
  });
};

exports.down = function* (next) {
  yield new Promise(function (resolve, reject) {
    setTimeout(function () {
      db.tesla.pop();
      resolve();
    }, 10);
  })
};
