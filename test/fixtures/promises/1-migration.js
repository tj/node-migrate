
var db = require('../db');

exports.upAsync = function () {
  return new Promise(function (resolve, reject) {
    db.tesla.push('1-energy');
    resolve();
  });
};

exports.downAsync = function () {
  return new Promise(function (resolve, reject) {
    db.tesla.pop();
    resolve();
  });
};
