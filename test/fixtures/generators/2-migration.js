
var db = require('../db');

exports.up = function* () {
  yield function (callback) {
    setTimeout(function () {
      db.tesla.push('2-energies');
      callback();
    }, 10);
  };
};

exports.down = function* () {
  yield function (callback) {
    setTimeout(function () {
      db.tesla.pop();
      callback();
    }, 10);
  };
};
