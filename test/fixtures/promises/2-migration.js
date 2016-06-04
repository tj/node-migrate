
var db = require('../db');

exports.upAsync = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, 10);
  }).then(function () {
    db.tesla.push('2-energies');
  });
};

exports.downAsync = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, 10);
  }).then(function () {
    db.tesla.pop();
  });
};
